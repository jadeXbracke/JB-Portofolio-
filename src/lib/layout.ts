import type { Photo } from './types';

export type Row = { kind: 'single'; photo: Photo } | { kind: 'pair'; photos: [Photo, Photo] };

/** Turns the ordered image list into rows, honouring `pairWithNext`. */
export function rows(images: Photo[]): Row[] {
  const out: Row[] = [];
  for (let i = 0; i < images.length; i++) {
    const p = images[i];
    const n = images[i + 1];
    if (p.pairWithNext && n) {
      out.push({ kind: 'pair', photos: [p, n] });
      i++;
    } else out.push({ kind: 'single', photo: p });
  }
  return out;
}
