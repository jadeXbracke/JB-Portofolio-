// Generates the local seed image set from two sources:
//   1. seed/placeholders.mjs   — 12 synthetic tonal placeholders (rendered, greyscaled)
//   2. seed/real-photos/*.jpg  — real photographs committed as-is (colour preserved)
// Output, for every id from either source:
//   public/seed/<id>-<width>.jpg   for each srcset width <= 3200 (capped at the source)
//   seed/images.json               { id: { width, height, lqip } }
// Usage: node seed/generate-images.mjs [--if-missing]
//
// Real photos are a stopgap for previewing actual images before a Sanity project exists
// (see README "Before a Sanity project exists"). Drop a JPEG into seed/real-photos/ named
// <id>.jpg and reference "<id>" from seed/content.json exactly like the pNN placeholders;
// this script picks it up automatically. Keep real-photos sources at the same 4800px
// long-edge / quality 90 preset documented in the README so the repo doesn't carry
// full-resolution originals for what is only a local preview.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';
import { PLACEHOLDERS, master } from './placeholders.mjs';

const WIDTHS = [640, 960, 1280, 1600, 2000, 2600, 3200];
const OUT = 'public/seed';
const META = 'seed/images.json';
const REAL_DIR = 'seed/real-photos';

const realFiles = existsSync(REAL_DIR)
  ? readdirSync(REAL_DIR)
      .filter((f) => /\.(jpe?g|png)$/i.test(f))
      .map((f) => ({ id: basename(f, extname(f)), path: join(REAL_DIR, f) }))
  : [];

function allPresent() {
  if (!existsSync(META)) return false;
  const ids = [...Object.keys(PLACEHOLDERS), ...realFiles.map((f) => f.id)];
  return ids.every((id) => existsSync(`${OUT}/${id}-640.jpg`));
}
if (process.argv.includes('--if-missing') && allPresent()) {
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

async function writeSet(id, full, { width, height, p3 = false }) {
  const cap = Math.min(width, 3200);
  const widths = WIDTHS.filter((x) => x < cap).concat([cap]);
  for (const w of widths) {
    let pipe = sharp(full).resize({ width: w, withoutEnlargement: true });
    if (p3) pipe = pipe.withIccProfile('p3');
    await pipe.jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(`${OUT}/${id}-${w}.jpg`);
  }
  const lqip = await sharp(full).resize({ width: 20 }).jpeg({ quality: 40 }).toBuffer();
  return { width, height, lqip: `data:image/jpeg;base64,${lqip.toString('base64')}` };
}

const meta = {};

for (const id of Object.keys(PLACEHOLDERS)) {
  const { w, h, p3 } = PLACEHOLDERS[id];
  const full = await master(id).grayscale().png().toBuffer(); // the demo is black and white
  meta[id] = await writeSet(id, full, { width: w, height: h, p3 });
  process.stdout.write(`${id} `);
}

for (const { id, path } of realFiles) {
  const rotated = await sharp(path).rotate().toBuffer(); // bake in EXIF orientation, keep colour
  const { width, height } = await sharp(rotated).metadata();
  meta[id] = await writeSet(id, rotated, { width, height });
  process.stdout.write(`${id} `);
}

writeFileSync(META, JSON.stringify(meta, null, 2));
console.log(`\nwrote ${META} and ${OUT}/ (${Object.keys(PLACEHOLDERS).length} placeholders, ${realFiles.length} real photos)`);
