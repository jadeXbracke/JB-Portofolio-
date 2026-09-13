import type { PortableBlock } from './types';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Minimal Portable Text → HTML: paragraphs, em/strong, links. Enough for an intro and an about. */
export function toHtml(blocks: PortableBlock[] | undefined): string {
  if (!blocks?.length) return '';
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => {
      const defs = new Map((b.markDefs ?? []).map((d) => [d._key, d]));
      const inner = b.children
        .map((c) => {
          let t = esc(c.text ?? '');
          for (const m of c.marks ?? []) {
            if (m === 'em') t = `<em>${t}</em>`;
            else if (m === 'strong') t = `<strong>${t}</strong>`;
            else {
              const d = defs.get(m);
              if (d?._type === 'link' && d.href) t = `<a href="${esc(d.href)}">${t}</a>`;
            }
          }
          return t;
        })
        .join('');
      const tag = b.style === 'h2' ? 'h2' : b.style === 'h3' ? 'h3' : 'p';
      return `<${tag}>${inner}</${tag}>`;
    })
    .join('\n');
}

export function toText(blocks: PortableBlock[] | undefined): string {
  if (!blocks?.length) return '';
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) => b.children.map((c) => c.text ?? '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** First n words, no trailing punctuation fuss. */
export function words(text: string, n: number): string {
  const w = text.split(/\s+/).filter(Boolean);
  return w.length <= n ? text : w.slice(0, n).join(' ').replace(/[,;:]$/, '') + '.';
}
