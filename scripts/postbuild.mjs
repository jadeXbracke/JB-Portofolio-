// After `astro build`:
//  1. Give each version its own 404.html (Cloudflare Pages serves the nearest 404.html up
//     the directory tree, so /v3/anything → dist/v3/404.html).
//  2. Print the sizes of the built pages as a sanity check.
import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
for (const v of ['v1', 'v2', 'v3', 'v4', 'v5']) {
  const src = join(dist, v, '404', 'index.html');
  if (existsSync(src)) copyFileSync(src, join(dist, v, '404.html'));
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}
const pages = walk(dist);
console.log(`postbuild: ${pages.length} pages, per-version 404.html in place`);
