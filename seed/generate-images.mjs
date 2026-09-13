// Generates the local placeholder set:
//   public/seed/<id>-<width>.jpg   for each srcset width ≤ 3200
//   seed/images.json               { id: { width, height, lqip } }
// Usage: node seed/generate-images.mjs [--if-missing]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { PLACEHOLDERS, master } from './placeholders.mjs';

const WIDTHS = [640, 960, 1280, 1600, 2000, 2600, 3200];
const OUT = 'public/seed';
const META = 'seed/images.json';

if (process.argv.includes('--if-missing') && existsSync(META) && existsSync(`${OUT}/p12-640.jpg`)) {
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

const meta = {};
for (const id of Object.keys(PLACEHOLDERS)) {
  const { w, h, p3 } = PLACEHOLDERS[id];
  const full = await master(id).grayscale().png().toBuffer(); // the demo is black and white
  const cap = Math.min(w, 3200);
  const widths = WIDTHS.filter((x) => x < cap).concat([cap]);
  for (const width of widths) {
    let pipe = sharp(full).resize({ width, withoutEnlargement: true });
    if (p3) pipe = pipe.withIccProfile('p3');
    await pipe.jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(`${OUT}/${id}-${width}.jpg`);
  }
  const lqip = await sharp(full).resize({ width: 20 }).jpeg({ quality: 40 }).toBuffer();
  meta[id] = { width: w, height: h, lqip: `data:image/jpeg;base64,${lqip.toString('base64')}` };
  process.stdout.write(`${id} `);
}
writeFileSync(META, JSON.stringify(meta, null, 2));
console.log(`\nwrote ${META} and ${OUT}/`);
