/**
 * Image delivery. Sanity CDN in production; generated placeholders locally.
 *
 * - auto=format (AVIF/WebP negotiated), fit=max (never upscaled, never cropped beyond the
 *   CMS crop), quality 82 in grids / 90 for heroes and single images.
 * - srcset widths 640 … 3200 and nothing larger; the markup never exposes an unbounded
 *   width parameter.
 * - Colour: the master is a Display P3 JPEG with its ICC profile embedded (see README,
 *   export preset). The Sanity pipeline keeps the embedded profile in JPEG/WebP output, so
 *   browsers colour-manage P3 → the display's gamut instead of clipping. AVIF output is
 *   tagged via its colour-primaries box. Nothing in the markup can "tag" colour; it is a
 *   property of the file, which is why the export preset matters.
 */
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Photo } from './types';

export const SRCSET_WIDTHS = [640, 960, 1280, 1600, 2000, 2600, 3200] as const;
export const MAX_WIDTH = 3200;
export const QUALITY = { grid: 82, single: 90 } as const;

const projectId = (import.meta.env.PUBLIC_SANITY_PROJECT_ID as string) || 'placeholder';
const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
const builder = createImageUrlBuilder({ projectId, dataset });

/** The candidate widths for a photo: the standard set, capped at the master and 3200. */
export function widthsFor(photo: Photo): number[] {
  const cap = Math.min(photo.width, MAX_WIDTH);
  const ws = SRCSET_WIDTHS.filter((w) => w < cap) as number[];
  ws.push(cap);
  return ws;
}

export function imageUrl(photo: Photo, width: number, quality: number): string {
  const w = Math.min(width, MAX_WIDTH);
  if (photo.src.kind === 'local') return `/seed/${photo.src.id}-${w}.jpg`;
  return builder.image(photo.src.ref).width(w).fit('max').auto('format').quality(quality).url();
}

export function srcSet(photo: Photo, quality: number): string {
  return widthsFor(photo)
    .map((w) => `${imageUrl(photo, w, quality)} ${w}w`)
    .join(', ');
}

/** A sensible default src (the browser uses srcset; this is for old clients and tooling). */
export function fallbackSrc(photo: Photo, quality: number): string {
  const ws = widthsFor(photo);
  const mid = ws[Math.min(ws.length - 1, 2)];
  return imageUrl(photo, mid, quality);
}

export interface PreloadAttrs {
  href: string;
  imagesrcset: string;
  imagesizes: string;
}

/** For the first image on a page: <link rel="preload" as="image" …>. */
export function preloadAttrs(photo: Photo, sizes: string, quality: number = QUALITY.single): PreloadAttrs {
  return { href: fallbackSrc(photo, quality), imagesrcset: srcSet(photo, quality), imagesizes: sizes };
}

/** 1200×630 Open Graph image cropped by the hotspot on the Sanity CDN. */
export function ogImageUrl(photo: Photo | undefined): string | undefined {
  if (!photo) return undefined;
  if (photo.src.kind === 'local') return `/seed/${photo.src.id}-1280.jpg`;
  return builder.image(photo.src.ref).width(1200).height(630).fit('crop').auto('format').quality(85).url();
}

/** A width-bounded absolute URL for JSON-LD ImageObject.contentUrl. */
export function ldImageUrl(photo: Photo): string {
  return imageUrl(photo, 1600, QUALITY.single);
}

/** CSS object-position from the CMS hotspot, for the few fill placements. */
export function objectPosition(photo: Photo): string {
  return `${Math.round(photo.focal.x * 100)}% ${Math.round(photo.focal.y * 100)}%`;
}

/**
 * `sizes` for a placement whose height is fixed (e.g. "60vh tall, at most 92vw wide"):
 * the rendered width depends on the photo's own ratio, so it is computed per photo.
 */
export function heightSizes(photo: Photo, vh: number, maxVw = 92): string {
  return `min(${maxVw}vw, calc(${vh}vh * ${(photo.width / photo.height).toFixed(3)}))`;
}
