// Screenshots every page at 1440 and 390 for design review.
//   node scripts/screenshots.mjs [--full]
// Needs `playwright` resolvable (npm i -D playwright, or NODE_PATH to a global install).
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const full = process.argv.includes('--full');
const versions = ['site'];
const pages = ['', '/work', '/work/noord', '/work/stil', '/about', '/contact', '/nope'];
const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

const server = await serve('dist', 4399);
const browser = await chromium.launch();
mkdirSync('qa/screens', { recursive: true });
for (const v of versions) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(`http://localhost:4399${p}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(900);
      const name = `qa/screens/${v}-${vp.name}${p.replace(/\//g, '_') || '_home'}.png`;
      await page.screenshot({ path: name, fullPage: full });
    }
    await ctx.close();
  }
  console.log('shot', v);
}
await browser.close();
server.close();
