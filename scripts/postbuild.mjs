// After `astro build`: count the built pages as a sanity check.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}
const pages = walk(dist);
console.log(`postbuild: ${pages.length} pages`);
