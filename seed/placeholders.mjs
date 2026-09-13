// Twelve neutral placeholder "photographs": tonal fields and simple geometry, rendered from
// SVG at Lightroom-export scale (4800px long edge). No people, no stock. Deterministic.
//
// p05 is a deeply saturated red still-life field tagged Display P3 — the gamut test image.
import sharp from 'sharp';

const g = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;
const r = (id, stops, cx = 0.5, cy = 0.5, rad = 0.7) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rad}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</radialGradient>`;

const svg = (w, h, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

export const PLACEHOLDERS = {
  // horizon — sea and sky, pale
  p01: {
    w: 4800, h: 3200, p3: false,
    svg: () => svg(4800, 3200,
      g('sky', [[0, '#d9dbd9'], [1, '#b9bcba']]) + g('sea', [[0, '#a9adab'], [1, '#8f9391']]),
      `<rect width="4800" height="1860" fill="url(#sky)"/><rect y="1860" width="4800" height="1340" fill="url(#sea)"/><rect y="1852" width="4800" height="14" fill="#c9cbc9" opacity=".8"/>`),
  },
  // paper — warm off-white with a diagonal shadow
  p02: {
    w: 3840, h: 4800, p3: false,
    svg: () => svg(3840, 4800,
      g('pp', [[0, '#efece6'], [0.55, '#e6e2da'], [1, '#d6d1c7']], 0, 0, 1, 1),
      `<rect width="3840" height="4800" fill="url(#pp)"/><polygon points="0,0 2400,0 0,3100" fill="#f3f1ec" opacity=".55"/>`),
  },
  // charcoal field with a soft disc
  p03: {
    w: 3200, h: 4800, p3: false,
    svg: () => svg(3200, 4800,
      r('disc', [[0, '#8c8c8a'], [0.5, '#4a4a49'], [1, '#232322']], 0.5, 0.42, 0.6),
      `<rect width="3200" height="4800" fill="url(#disc)"/>`),
  },
  // stone — warm taupe gradient
  p04: {
    w: 4800, h: 3200, p3: false,
    svg: () => svg(4800, 3200,
      g('st', [[0, '#b8b0a4'], [1, '#7d766c']], 0, 0, 1, 1),
      `<rect width="4800" height="3200" fill="url(#st)"/><rect x="2900" y="0" width="1900" height="3200" fill="#8c8479" opacity=".35"/>`),
  },
  // red — the saturated still-life field (Display P3 tagged): a red ground with a table edge
  p05: {
    w: 3840, h: 4800, p3: true,
    svg: () => svg(3840, 4800,
      g('wall', [[0, '#7a0f1a'], [0.7, '#a3121f'], [1, '#b8151f']]) + g('table', [[0, '#c4262c'], [1, '#9b1420']]),
      `<rect width="3840" height="4800" fill="url(#wall)"/><rect y="3400" width="3840" height="1400" fill="url(#table)"/><rect y="3390" width="3840" height="20" fill="#5a0a10" opacity=".7"/>`),
  },
  // band — cool grey with a lit vertical band
  p06: {
    w: 3200, h: 4800, p3: false,
    svg: () => svg(3200, 4800,
      g('bg', [[0, '#9ea3a4'], [1, '#6f7475']]) + g('band', [[0, '#d5d8d8'], [0.5, '#c2c6c6'], [1, '#d5d8d8']], 0, 0, 1, 0),
      `<rect width="3200" height="4800" fill="url(#bg)"/><rect x="1150" width="700" height="4800" fill="url(#band)" opacity=".9"/>`),
  },
  // square — near-white with a soft grey rectangle
  p07: {
    w: 4800, h: 4800, p3: false,
    svg: () => svg(4800, 4800,
      g('sq', [[0, '#f4f4f2'], [1, '#e2e2df']]),
      `<rect width="4800" height="4800" fill="url(#sq)"/><rect x="1500" y="1900" width="2200" height="1500" fill="#bdbdb9"/><rect x="1500" y="3400" width="2200" height="260" fill="#a9a9a5" opacity=".5"/>`),
  },
  // dusk — blue-grey to sand
  p08: {
    w: 4800, h: 3000, p3: false,
    svg: () => svg(4800, 3000,
      g('dk', [[0, '#5f6a73'], [0.6, '#9a9a94'], [1, '#c9bfae']]),
      `<rect width="4800" height="3000" fill="url(#dk)"/>`),
  },
  // interior — near-black with a warm lit doorway
  p09: {
    w: 4800, h: 3200, p3: false,
    svg: () => svg(4800, 3200,
      g('door', [[0, '#c9a97a'], [1, '#8a6f45']]),
      `<rect width="4800" height="3200" fill="#0e0d0c"/><rect x="2750" y="500" width="900" height="2700" fill="url(#door)"/><rect x="2750" y="500" width="900" height="2700" fill="#000" opacity=".15"/>`),
  },
  // green-grey field with a vignette
  p10: {
    w: 4800, h: 3840, p3: false,
    svg: () => svg(4800, 3840,
      r('gg', [[0, '#c7cbc2'], [1, '#8f958a']], 0.5, 0.5, 0.8),
      `<rect width="4800" height="3840" fill="url(#gg)"/>`),
  },
  // ochre with one black line
  p11: {
    w: 3200, h: 4800, p3: false,
    svg: () => svg(3200, 4800,
      g('oc', [[0, '#c7a25a'], [1, '#8e6f37']]),
      `<rect width="3200" height="4800" fill="url(#oc)"/><rect y="1900" width="3200" height="28" fill="#141210"/>`),
  },
  // mid grey vignette
  p12: {
    w: 4800, h: 3200, p3: false,
    svg: () => svg(4800, 3200,
      r('mg', [[0, '#b6b6b4'], [1, '#6a6a68']], 0.5, 0.45, 0.85),
      `<rect width="4800" height="3200" fill="url(#mg)"/>`),
  },
};

/** Render a placeholder at full size (the "Lightroom export"). Returns a sharp pipeline. */
export function master(id) {
  const p = PLACEHOLDERS[id];
  const base = sharp(Buffer.from(p.svg()), { density: 72 });
  return p.p3 ? base.withIccProfile('p3') : base;
}
