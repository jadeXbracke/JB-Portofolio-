// Lighthouse on the 20-image series page of each version, mobile emulation with simulated
// 4G (Lighthouse defaults). Serves dist/ itself.
//   node scripts/lighthouse.mjs [v1|...|all] [path]
// Needs `lighthouse` resolvable (npm i -D lighthouse) and CHROME_PATH pointing at a Chrome.
import { writeFileSync, mkdirSync } from 'node:fs';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { serve } from './serve.mjs';

const which = process.argv[2] ?? 'all';
const path = process.argv[3] ?? '/work/proof';
const versions = which === 'all' ? ['v1', 'v2', 'v3', 'v4', 'v5'] : [which];
const server = await serve('dist', 4394);
const chrome = await launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
mkdirSync('qa/lighthouse', { recursive: true });
const rows = [];
for (const v of versions) {
  const url = `http://localhost:4394/${v}${path}`;
  const r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const c = r.lhr.categories;
  const a = r.lhr.audits;
  const row = { v, perf: Math.round(c.performance.score * 100), a11y: Math.round(c.accessibility.score * 100), bp: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100), lcp: a['largest-contentful-paint'].displayValue, cls: a['cumulative-layout-shift'].displayValue, tbt: a['total-blocking-time'].displayValue };
  rows.push(row);
  writeFileSync(`qa/lighthouse/${v}.json`, r.report);
  console.log(JSON.stringify(row));
}
await chrome.kill();
server.close();
writeFileSync('qa/lighthouse/summary.json', JSON.stringify(rows, null, 2));
