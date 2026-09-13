// One-off: pushes seed/content.json and the 12 placeholder masters into a Sanity dataset so
// the Studio and site are populated before any real upload. Safe to re-run (createOrReplace).
//
//   PUBLIC_SANITY_PROJECT_ID=xxxx SANITY_WRITE_TOKEN=sk... npm run seed:upload
//
// Real content: delete these documents in the Studio (or leave them and unpublish).
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';
import { LexoRank } from 'lexorank';
import { PLACEHOLDERS, master } from './placeholders.mjs';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('Set PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN (see .env.example).');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2025-02-19', useCdn: false });
const content = JSON.parse(readFileSync(new URL('./content.json', import.meta.url), 'utf8'));

// 1. assets
const assetIds = {};
for (const id of Object.keys(PLACEHOLDERS)) {
  const buf = await master(id).jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
  const asset = await client.assets.upload('image', buf, { filename: `${id}.jpg`, contentType: 'image/jpeg' });
  assetIds[id] = asset._id;
  console.log('uploaded', id, asset._id);
}

const photo = (p, key) =>
  p && {
    _type: 'photo',
    _key: key,
    asset: { _type: 'reference', _ref: assetIds[p.image] },
    alt: p.alt,
    caption: p.caption,
    displayWidth: p.displayWidth,
    pairWithNext: Boolean(p.pairWithNext),
    hotspot: p.focal ? { _type: 'sanity.imageHotspot', x: p.focal[0], y: p.focal[1], width: 0.5, height: 0.5 } : undefined,
  };

// 2. series, in seed order
let rank = LexoRank.middle();
const tx = client.transaction();
for (const s of content.series) {
  rank = rank.genNext();
  tx.createOrReplace({
    _id: `series-${s.slug}`,
    _type: 'series',
    title: s.title,
    slug: { _type: 'slug', current: s.slug },
    year: s.year,
    location: s.location,
    client: s.client,
    discipline: s.discipline,
    intro: s.intro,
    featured: s.featured,
    publishedAt: s.publishedAt,
    orderRank: rank.toString(),
    coverImage: photo(s.cover, 'cover'),
    images: s.images.map((p, i) => photo(p, `img${i}`)),
  });
}
// 3. singletons
const st = content.siteSettings;
tx.createOrReplace({
  _id: 'siteSettings',
  _type: 'siteSettings',
  ...st,
  phone: st.phone || undefined,
  portrait: photo(st.portrait, 'portrait'),
  seoDefaults: { ...st.seoDefaults, ogImage: photo(st.seoDefaults.ogImage, 'og') },
});
const hp = content.homepage;
tx.createOrReplace({
  _id: 'homepage',
  _type: 'homepage',
  heroMode: hp.heroMode,
  heroSeries: hp.heroSeries ? { _type: 'reference', _ref: `series-${hp.heroSeries}` } : undefined,
  heroImage: hp.heroImage ? photo(hp.heroImage, 'hero') : undefined,
  selectedWork: hp.selectedWork.map((slug, i) => ({ _type: 'reference', _key: `sw${i}`, _ref: `series-${slug}` })),
});
await tx.commit();
console.log('seeded', content.series.length, 'series + siteSettings + homepage into', projectId, dataset);
