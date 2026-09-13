// Tiny static server for dist/ with Cloudflare-Pages-style 404 lookup (nearest 404.html
// up the tree). Used by the screenshot and Lighthouse scripts; not for production.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

export function serve(root = 'dist', port = 4321) {
  const server = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(root, p);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file) && existsSync(file + '.html')) file = file + '.html';
    let status = 200;
    if (!existsSync(file)) {
      status = 404;
      const parts = p.split('/').filter(Boolean);
      file = join(root, '404.html');
      for (let i = parts.length; i > 0; i--) {
        const cand = join(root, ...parts.slice(0, i), '404.html');
        if (existsSync(cand)) { file = cand; break; }
      }
    }
    if (!existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] && process.argv[1].endsWith('serve.mjs')) {
  const port = Number(process.env.PORT || 4321);
  await serve('dist', port);
  console.log(`serving dist/ on http://localhost:${port}`);
}
