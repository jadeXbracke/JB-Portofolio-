/**
 * The one place the site reads content from.
 *
 * With PUBLIC_SANITY_PROJECT_ID set, everything comes from Sanity via GROQ.
 * Without it (a fresh clone, CI without secrets) everything comes from seed/content.json
 * and the generated placeholder images, so all five versions render.
 *
 * Both paths normalise into the same `SiteData` shape; nothing downstream knows which.
 */
import { readFileSync } from 'node:fs';
import { sanityClient } from 'sanity:client';
import type { Homepage, Photo, Series, SiteData, SiteSettings } from './types';

const PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined;
export const USING_SANITY = Boolean(PROJECT_ID && PROJECT_ID !== 'placeholder');

// ---------------------------------------------------------------- Sanity path

const PHOTO_PROJECTION = `{
  _key, alt, caption, displayWidth, pairWithNext, hotspot, crop,
  asset->{ _id, metadata { dimensions { width, height }, lqip } }
}`;

const SERIES_PROJECTION = `{
  _id, title, "slug": slug.current, year, location, client, discipline, intro,
  featured, orderRank, publishedAt,
  coverImage ${PHOTO_PROJECTION},
  images[] ${PHOTO_PROJECTION}
}`;

const QUERY = `{
  "settings": *[_type == "siteSettings"][0]{
    photographerName, tagline, aboutBody, email, phone, instagram, location,
    cvItems[]{ year, text }, clientList, availabilityNote,
    portrait ${PHOTO_PROJECTION},
    seoDefaults { title, description, ogImage ${PHOTO_PROJECTION} }
  },
  "homepage": *[_type == "homepage"][0]{
    heroMode,
    heroSeries-> ${SERIES_PROJECTION},
    heroImage ${PHOTO_PROJECTION},
    selectedWork[]-> ${SERIES_PROJECTION}
  },
  "series": *[_type == "series" && defined(slug.current) && defined(publishedAt)] | order(orderRank asc) ${SERIES_PROJECTION}
}`;

type RawPhoto = {
  _key?: string;
  alt?: string;
  caption?: string;
  displayWidth?: Photo['displayWidth'];
  pairWithNext?: boolean;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  asset?: { _id: string; metadata?: { dimensions?: { width: number; height: number }; lqip?: string } };
};

function fromSanityPhoto(p: RawPhoto | null | undefined, fallbackKey: string): Photo | undefined {
  if (!p?.asset?.metadata?.dimensions) return undefined;
  const d = p.asset.metadata.dimensions;
  const crop = p.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const cw = 1 - crop.left - crop.right;
  const ch = 1 - crop.top - crop.bottom;
  const hx = p.hotspot ? (p.hotspot.x - crop.left) / cw : 0.5;
  const hy = p.hotspot ? (p.hotspot.y - crop.top) / ch : 0.5;
  return {
    key: p._key ?? fallbackKey,
    alt: p.alt ?? '',
    caption: p.caption || undefined,
    displayWidth: p.displayWidth ?? 'wide',
    pairWithNext: Boolean(p.pairWithNext),
    width: Math.round(d.width * cw),
    height: Math.round(d.height * ch),
    lqip: p.asset.metadata.lqip ?? '',
    focal: { x: clamp01(hx), y: clamp01(hy) },
    src: {
      kind: 'sanity',
      ref: { _type: 'image', asset: { _ref: p.asset._id }, hotspot: p.hotspot, crop: p.crop },
    },
  };
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));
}

function fromSanitySeries(s: any): Series | undefined {
  if (!s?._id || !s.slug) return undefined;
  const cover = fromSanityPhoto(s.coverImage, `${s._id}-cover`);
  const images = (s.images ?? [])
    .map((p: RawPhoto, i: number) => fromSanityPhoto(p, `${s._id}-${i}`))
    .filter(Boolean) as Photo[];
  if (!cover && images.length === 0) return undefined;
  return {
    id: s._id,
    title: s.title,
    slug: s.slug,
    year: s.year,
    location: s.location || undefined,
    client: s.client || undefined,
    discipline: s.discipline,
    intro: s.intro ?? [],
    cover: cover ?? images[0],
    images,
    featured: Boolean(s.featured),
    orderRank: s.orderRank ?? '',
    publishedAt: s.publishedAt,
  };
}

async function loadFromSanity(): Promise<SiteData> {
  const raw = await sanityClient.fetch(QUERY);
  const series = (raw.series ?? []).map(fromSanitySeries).filter(Boolean) as Series[];
  const bySlug = new Map(series.map((s) => [s.slug, s]));
  const st = raw.settings ?? {};
  const settings: SiteSettings = {
    photographerName: st.photographerName ?? 'Jade Bracke',
    tagline: st.tagline ?? '',
    aboutBody: st.aboutBody ?? [],
    portrait: fromSanityPhoto(st.portrait, 'portrait'),
    email: st.email ?? '',
    phone: st.phone || undefined,
    instagram: st.instagram || undefined,
    location: st.location ?? 'Amsterdam',
    cvItems: st.cvItems ?? [],
    clientList: st.clientList ?? [],
    availabilityNote: st.availabilityNote || undefined,
    seoDefaults: {
      title: st.seoDefaults?.title ?? st.photographerName ?? 'Jade Bracke',
      description: st.seoDefaults?.description ?? st.tagline ?? '',
      ogImage: fromSanityPhoto(st.seoDefaults?.ogImage, 'og'),
    },
  };
  const hp = raw.homepage ?? {};
  const heroSeries = fromSanitySeries(hp.heroSeries);
  const homepage: Homepage = {
    heroMode: hp.heroMode === 'image' ? 'image' : 'series',
    heroSeries: heroSeries ? (bySlug.get(heroSeries.slug) ?? heroSeries) : undefined,
    heroImage: fromSanityPhoto(hp.heroImage, 'hero'),
    selectedWork: (hp.selectedWork ?? [])
      .map(fromSanitySeries)
      .filter(Boolean)
      .map((s: Series) => bySlug.get(s.slug) ?? s),
  };
  return finalise({ settings, homepage, series, source: 'sanity' });
}

// ----------------------------------------------------------------- Local path

type LocalImageMeta = Record<string, { width: number; height: number; lqip: string }>;

function fromLocalPhoto(p: any, meta: LocalImageMeta, key: string): Photo | undefined {
  const m = meta[p.image];
  if (!m) return undefined;
  return {
    key,
    alt: p.alt ?? '',
    caption: p.caption || undefined,
    displayWidth: p.displayWidth ?? 'wide',
    pairWithNext: Boolean(p.pairWithNext),
    width: m.width,
    height: m.height,
    lqip: m.lqip,
    focal: { x: p.focal?.[0] ?? 0.5, y: p.focal?.[1] ?? 0.5 },
    src: { kind: 'local', id: p.image },
  };
}

function loadFromSeed(): SiteData {
  const content = JSON.parse(readFileSync(new URL('../../seed/content.json', import.meta.url), 'utf8'));
  let meta: LocalImageMeta = {};
  try {
    meta = JSON.parse(readFileSync(new URL('../../seed/images.json', import.meta.url), 'utf8'));
  } catch {
    throw new Error('seed/images.json missing — run `npm run seed:images` (the build normally does this for you).');
  }
  const series: Series[] = content.series.map((s: any, i: number) => {
    const images = (s.images ?? [])
      .map((p: any, j: number) => fromLocalPhoto(p, meta, `${s.slug}-${j}`))
      .filter(Boolean) as Photo[];
    return {
      id: `series-${s.slug}`,
      title: s.title,
      slug: s.slug,
      year: s.year,
      location: s.location,
      client: s.client,
      discipline: s.discipline,
      intro: s.intro ?? [],
      cover: fromLocalPhoto(s.cover, meta, `${s.slug}-cover`) ?? images[0],
      images,
      featured: Boolean(s.featured),
      orderRank: String(i).padStart(3, '0'),
      publishedAt: s.publishedAt,
    };
  });
  const bySlug = new Map(series.map((s) => [s.slug, s]));
  const st = content.siteSettings;
  const settings: SiteSettings = {
    ...st,
    portrait: st.portrait ? fromLocalPhoto(st.portrait, meta, 'portrait') : undefined,
    seoDefaults: {
      ...st.seoDefaults,
      ogImage: st.seoDefaults?.ogImage ? fromLocalPhoto(st.seoDefaults.ogImage, meta, 'og') : undefined,
    },
  };
  const hp = content.homepage;
  const homepage: Homepage = {
    heroMode: hp.heroMode,
    heroSeries: bySlug.get(hp.heroSeries),
    heroImage: hp.heroImage ? fromLocalPhoto(hp.heroImage, meta, 'hero') : undefined,
    selectedWork: (hp.selectedWork ?? []).map((slug: string) => bySlug.get(slug)).filter(Boolean) as Series[],
  };
  return finalise({ settings, homepage, series, source: 'local' });
}

// -------------------------------------------------------------------- Shared

function finalise(data: SiteData): SiteData {
  const { homepage, series } = data;
  if (homepage.selectedWork.length === 0) homepage.selectedWork = series.filter((s) => s.featured).slice(0, 6);
  if (homepage.selectedWork.length === 0) homepage.selectedWork = series.slice(0, 6);
  if (!homepage.heroSeries) homepage.heroSeries = homepage.selectedWork[0] ?? series[0];
  if (homepage.heroMode === 'image' && !homepage.heroImage) homepage.heroMode = 'series';
  return data;
}

let cache: Promise<SiteData> | undefined;

/** Loaded once per build. */
export function getSite(): Promise<SiteData> {
  if (!cache) cache = USING_SANITY ? loadFromSanity() : Promise.resolve(loadFromSeed());
  return cache;
}

export async function getSeries(): Promise<Series[]> {
  return (await getSite()).series;
}

export async function getSeriesBySlug(slug: string): Promise<Series | undefined> {
  return (await getSeries()).find((s) => s.slug === slug);
}

/** The hero photograph for the homepage, whichever mode is chosen. */
export function heroPhoto(h: Homepage): Photo | undefined {
  return h.heroMode === 'image' ? h.heroImage : h.heroSeries?.cover;
}

/** Every image in every series, flattened, with its series attached (for v5's archive). */
export async function getArchive() {
  const series = await getSeries();
  return series.flatMap((s) => s.images.map((photo, index) => ({ photo, series: s, index })));
}

/** Previous and next series in the curated order. */
export function neighbours(all: Series[], current: Series) {
  const i = all.findIndex((s) => s.slug === current.slug);
  return {
    prev: i > 0 ? all[i - 1] : undefined,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : undefined,
    index: i,
  };
}
