export type VersionId = 'v1' | 'v2' | 'v3' | 'v4' | 'v5';

export const VERSIONS: { id: VersionId; name: string; line: string }[] = [
  { id: 'v1', name: 'Spread', line: 'The magazine spread, taken literally. A cover story per series.' },
  { id: 'v2', name: 'Specter', line: 'Maximum restraint. One photograph on a bone field, a wordmark, a word.' },
  { id: 'v3', name: 'Split', line: 'Hard 40/60 split: white type panel against saturated full-bleed colour.' },
  { id: 'v4', name: 'Cinema', line: 'A screening room. Black, scroll-snapped, one frame per screen.' },
  { id: 'v5', name: 'Index', line: 'A working archive. Every image on one contact sheet, filtered by real metadata.' },
];

/** Route helper: href('v2', '/work/kamer') → '/v2/work/kamer' */
export const href = (v: VersionId, path = '') => `/${v}${path}`;

export const NAV = [
  { label: 'Work', path: '/work' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
] as const;

/** Is this nav item the current section? */
export const isCurrent = (pathname: string, v: VersionId, path: string) =>
  path === '' ? pathname.replace(/\/$/, '') === `/${v}` : pathname.startsWith(`/${v}${path}`);
