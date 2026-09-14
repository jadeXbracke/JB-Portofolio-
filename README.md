# Jade Bracke — portfolio

One photography site, black on white. This README is written for
Jade first (sections 1–6) and for whoever maintains the code second (sections 7–12).

The site: **Astro 5** (static HTML), **Sanity** (the content editor, at `/studio`),
**Cloudflare Pages** (hosting). No analytics. Nothing runs on a server after deploy.

---

## 1. The site

One site, black type on a white ground, no grey. The home page is every image in every
series as a grid; a picture opens full screen when tapped. The bar at the top has the image count and the
Index on the left, your name in the middle and About on the right. About opens over the
blurred grid with your statement, contact details, the list of series, selected
exhibitions and clients. Each series has its own page with its title in tall thin
capitals, a short intro and the series' pictures.

Routes: `/` (archive), `/work` (all projects, filtered), `/work/<series>`, `/about`,
`/contact`, `/studio` (the editor).

---

## 2. Editing the site from your phone

### Logging in
1. Go to `https://jadebracke.com/studio` (or `/studio` on the preview address).
2. Tap **Log in** and use the Google or GitHub account that was invited to the Sanity
   project. If you are not invited yet, the developer adds you in Sanity Manage →
   Members. You need the **Editor** role.
3. You land on **Content**. There are three things in the sidebar: **Series**, **Homepage**,
   **Site settings**. That is the whole editor.

The Studio address uses a `#`, like `/studio/#/structure/series` — that is normal.

### Adding a series (phone flow)
1. **Series → +** (top right).
2. **Title.** Tap **Generate** next to *Web address* — it makes the address from the title.
3. **Year**, **Location**, **Client** (optional), **Discipline** (pick one).
4. **Intro** — one short paragraph, about 400 characters. Plain and specific.
5. **Cover** — tap the field, **Upload** from your camera roll, then **Alt text** (a
   sentence saying what is in the picture; required). Set the **hotspot** by tapping
   the crop icon on the image: drag the circle to the part that must stay visible when
   a layout fills a space with the picture.
6. **Pictures** — **+ Add item**, upload, alt text, choose a **Display width**:
   - *Full* bleeds edge to edge.
   - *Wide* is the default, generous with a margin.
   - *Half* is half the page.
   - *Column* is a single reading column, for portraits and details.
   - Tick **Pair with next picture** to put two side by side.
7. **Featured** on, if it may appear on the homepage.
8. **Publish** (bottom right). The site rebuilds in about a minute.

Alt text is required. The Studio will not publish a picture without it — that is on
purpose. Write what is in the picture, not what it means: "A dark room with one lit
doorway", not "Stillness".

### Reordering
- **Pictures inside a series:** press and hold the handle (⋮⋮) at the left of a picture,
  then drag it up or down. On a phone, hold for a moment before dragging.
- **Series order (the order on Work pages):** **Series** in the sidebar is a drag list —
  hold the handle and drag. It saves immediately.
- **Homepage selection:** **Homepage → Selected work** — the same drag.

Known limitation: on a 390px-wide phone the drag handle is small and a long list needs
scrolling while dragging. If a drag will not "take", turn the phone sideways, or use the
item's **⋯** menu → *Move up / Move down* where it is offered. This was checked in the
Studio's own layout but could not be tested against a live dataset from the build
environment, so if it misbehaves on your phone, tell the developer which step.

### Featuring work on the homepage
**Homepage → Hero.** Choose *A series* (its cover and title lead the site) or *One
picture*. Then **Selected work**: the list that home pages show, in this order. Publish.

### About text, portrait, contact details
**Site settings.** Name, tagline (one line, max 90 characters), About text, portrait,
email, phone, Instagram handle (no @), where you are based, CV entries, client list,
availability note, and the default search description. Everything on the site
reads from here — the email address is never typed anywhere else.

### Unpublishing and deleting
Open the series → **⋯** next to Publish → **Unpublish** (keeps the draft) or **Delete**.
The page disappears on the next rebuild, and old links to it show the 404 page.

---

## 3. Exporting from Lightroom (do this once as a preset)

The site delivers whatever you upload at maximum quality. Upload the same file you would
send to print, not a web export.

Lightroom → Export → save as preset **"Web master (Sanity)"**:

| Setting | Value |
| --- | --- |
| Image format | JPEG |
| Quality | 90 |
| Color space | **Display P3** |
| Image sizing | Resize to fit: Long edge, **4800** pixels, don't enlarge |
| Resolution | 240 ppi (irrelevant for screen; leave it) |
| Output sharpening | Sharpen for **Screen**, amount **Standard** |
| Metadata | **Copyright & Contact Info Only** |
| Remove location info | **On** (no GPS) |
| Watermark | Off |

Why P3: your X-T5 files and a P3 monitor hold more colour than sRGB. The file keeps its
embedded profile through Sanity, and browsers colour-manage it, so a deep red stays the
same red on a P3 phone and does not oversaturate on an sRGB screen. Section 8 has the
test. Do not export as sRGB "to be safe" — it throws colour away.

The file stays untouched on Sanity's CDN as the master. The site never uploads
anything larger than 3200px wide to a visitor, and never crops except where you set the
hotspot.

---

## 4. Changing the look without a developer

There is one token file, `src/styles/tokens.css`. Every colour, typeface, size and
spacing the site uses is a named value in that file. Components never contain raw values.

- **Colours:** the site is black on white by design (`--ground`, `--ink`). There is no
  grey and no accent colour to change.
- **Typeface:** the whole site uses one family, Jost (`--font` in the token file), at
  three weights: hairline titles, light text, regular small capitals. The comment at the top names the paid upgrade path (PP Editorial New, Söhne, GT
  Alpina, ABC Marfa). Put the licensed `.woff2` files in `public/fonts/` and add matching
  `@font-face` rules to `src/styles/fonts.css`; nothing else changes.
- **Type scale:** `--ratio` (1.25 or 1.333) and `--step-0` (the body size). Every other
  size follows.
- **Spacing:** the `--space-*` and `--gutter` values.

Change, save, and the site rebuilds on the next push (section 9).

---

## 5. What breaks the site, and what does not

Does not break anything:
- Uploading huge files (they are stored as-is and resized on delivery).
- Publishing a series without an intro, location or client.
- Reordering, unpublishing, deleting, renaming a series (its address changes; old links
  go to the 404 page).
- Leaving Selected work empty (the site falls back to featured series, then to all).
- Typos in the About text. Republish.

Breaks a page, and how you will know:
- **Publishing a picture without alt text** — the Studio refuses to publish. Add the text.
- **Two series with the same web address** — the Studio warns on *Generate*. Change one.
- **Deleting the Site settings or Homepage document** — the sidebar items are protected
  against this, but if it happens, the site falls back to the seed values (the wrong
  email address). Recreate the document.
- **A rebuild that fails** shows the last good site, never a broken one. The developer
  sees the failure in Cloudflare Pages → Deployments.

---

## 6. Asking Claude Code for changes

The repository is set up for Claude Code. Three prompts that work as written:

1. *"On the home grid, group the images by series with the series title as a small
   line above each group. Keep the justified rows and CLS at 0; run `npm run build` and
   `npm run screenshots`."*
2. *"In the viewer, add a small 'Open series' link under the caption and let the arrow
   keys wrap around at the ends. Keep the viewer black and the type sizes from tokens."*
3. *"Add a Dutch locale: field-level `en`/`nl` for tagline, about, intro, captions and
   alt, a language switch in the bar, `/nl/...` routes and `hreflang` tags.
   Follow the approach in README section 11 and do not change document ids or slugs."*

Always ask it to run `npm run build` and `npm run check` before it pushes.

---

## 7. Running it locally (developer)

```bash
npm install
cp .env.example .env         # add PUBLIC_SANITY_PROJECT_ID (leave empty to use seed content)
npm run fonts                # fetches Boska/Zodiak/Switzer/General Sans/Erode + Jost, subsets, writes fonts.css
npm run dev                  # http://localhost:4321  (Studio at /studio)
npm run build && npm run preview
```

Scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `preview` | Astro. |
| `npm run check` | `astro check` (TypeScript across `.astro` files). |
| `npm run fonts` | Fetches and subsets the web fonts (needs `pyftsubset` for subsetting; optional). |
| `npm run seed:images` | Regenerates the 12 placeholder images into `public/seed/` (runs automatically before `build` and `dev` if missing). |
| `npm run seed:upload` | Uploads the seed content + placeholders to your Sanity dataset (needs `SANITY_WRITE_TOKEN`). |
| `npm run screenshots [--full]` | Playwright screenshots at 1440 and 390 into `qa/screens/`. |
| `npm run lighthouse [path]` | Lighthouse on the 20-image series page, JSON into `qa/lighthouse/`. |

`playwright` and `lighthouse` are not in `package.json` (they are large and only for QA):
`npm i -D playwright lighthouse chrome-launcher` when you need them, and set
`CHROME_PATH` for Lighthouse.

### Without a Sanity project
Leave `PUBLIC_SANITY_PROJECT_ID` empty and the site builds from `seed/content.json` plus
12 generated greyscale placeholder images — tonal fields and simple geometry, no people,
no stock. That is how the site renders in a fresh clone.

### With a Sanity project
1. Create a project at sanity.io/manage (free tier), dataset `production`.
2. Under API → CORS origins add `http://localhost:4321` and your production origin.
3. Set `PUBLIC_SANITY_PROJECT_ID` in `.env` and in Cloudflare Pages → Settings →
   Environment variables.
4. `SANITY_WRITE_TOKEN=... npm run seed:upload` once, to populate. Then delete or replace
   the seed documents in the Studio.

The Studio is embedded by `@sanity/astro` with hash routing so the whole site stays static
(no server adapter). Schemas live in `src/sanity/schemas/`.

---

## 8. Image pipeline (what the build promises)

Implemented in `src/lib/image.ts` and `src/components/Pic.astro`:

- Masters stay untouched on the Sanity CDN. Delivery via `@sanity/image-url` with
  `auto=format` (AVIF/WebP negotiated), `fit=max`, quality 82 in grids and 90 for hero and
  single images.
- srcset widths 640, 960, 1280, 1600, 2000, 2600, 3200; capped at 3200; `sizes` written
  per placement (never a blanket `100vw` unless the image truly is 100vw).
- Explicit `width`/`height` from `metadata.dimensions` (after the CMS crop), and a
  reserved `aspect-ratio` on the wrapper. CLS is 0 in Lighthouse on every page.
- Blur-up from `metadata.lqip` behind the image, one opacity fade on load, no shimmer.
- The first image on each page is `loading="eager"`, `fetchpriority="high"`, and
  preloaded with `imagesrcset`/`imagesizes`. Everything else is lazy.
- The grid never crops: each cell takes the picture's own ratio. The hotspot is used only
  for the 1200×630 sharing image.

**Colour management.** Nothing in HTML "tags" colour — it is a property of the file. The
export preset embeds the Display P3 profile; Sanity's image pipeline preserves the
embedded ICC profile in JPEG and WebP output and sets colour primaries in AVIF, so
browsers render P3 correctly on both P3 and sRGB displays. Test: open a series with a
deep-red still life (the seed's *Red* series is a P3-tagged saturated field) on a P3
screen (recent iPhone/Mac) and on an sRGB screen; the red should be the same red, not
blown out. If it oversaturates on sRGB, the file lost its profile — re-export with the
preset. This claim was checked against Sanity's documented behaviour, not against a live
dataset from the build environment (see Assumptions).

---

## 9. Deploying

### Cloudflare Pages (chosen)
1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → this repo.
2. Build command `npm run build`, output directory `dist`, Node version 20+ (set
   `NODE_VERSION=20` as an environment variable).
3. Environment variables: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SITE_URL`.
4. Custom domain: `jadebracke.com` (Cloudflare handles DNS and HTTPS).
5. **Rebuild on publish:** Pages → Settings → Builds → *Deploy hooks* → create one, copy
   the URL. Then Sanity Manage → API → Webhooks → Create: URL = the deploy hook, trigger
   on create/update/delete, dataset `production`, HTTP method POST. Publishing in the
   Studio now rebuilds the site in about a minute.

`public/_headers` sets immutable caching for fonts and hashed assets. `dist/404.html` is
the not-found page.

### Vercel (alternative)
Import the repo; framework preset Astro; same environment variables. Rebuild on publish:
Vercel → Settings → Git → Deploy Hooks, then the same Sanity webhook. The root `404.html` works the same way there.

### Analytics
None installed. If wanted later, Plausible or Umami are privacy-respecting and need one
`<script>` in `src/layouts/Base.astro`. Both are optional and off by default.

---

## 10. Quality floor, as measured

Measured with Lighthouse 12 (mobile emulation, simulated 4G), served from `dist/` (see `qa/lighthouse/` after
`npm run lighthouse`):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Series page, 20 images (`/work/proof`) | 100 | 100 | 100 | 100 | 1.7 s | 0 |
| Home, all 49 images (`/`) | 99 | 100 | 100 | 100 | 2.0 s | 0 |

Measured against generated placeholders on a local server. With real 4800px masters on
the Sanity CDN, LCP depends on the CDN's response time for the first AVIF; the preload
and `fetchpriority` are there for that case.

Also in place: visible focus rings everywhere, logical tab order, `prefers-reduced-motion` honoured (one rule in `base.css`), `lang="en"`, skip link, JSON-LD Person /
CreativeWork / ImageObject, per-series Open Graph image (1200×630 from the cover's
hotspot), `sitemap-index.xml`, `robots.txt`, canonical URLs, a 404 page.

Responsive range: laid out from 320px to 2560px; screenshots at 390 and 1440 are in
`qa/screens/` after `npm run screenshots`.

---

## 11. Adding a Dutch locale later (approach, not implemented)

The content model is ready for field-level localisation without a rewrite:

- Install `@sanity/document-internationalization` **or** (recommended, smaller)
  `sanity-plugin-internationalized-array`. Convert the human-language fields —
  `siteSettings.tagline`, `aboutBody`, `availabilityNote`, `seoDefaults.*`,
  `series.title`, `intro`, and `photo.alt` / `caption` — into `{ en, nl }` arrays. Slugs,
  ids, years, disciplines, image assets and ordering stay exactly as they are.
- In `src/lib/cms.ts`, the GROQ projection picks the locale (`coalesce(title[_key ==
  $lang][0].value, title[_key == "en"][0].value)`), so the site keeps reading the same
  `SiteData` shape.
- Routes: `src/pages/[lang]/...` (or `/nl/...`) with
  `lang` on `<html>`, `hreflang` alternates in `Seo.astro`, and a two-letter switch in each
  nav. `DISCIPLINE_LABEL` becomes a per-locale map.

Nothing about the schemas' structure or document ids changes; existing content migrates
with a one-off script that wraps each string as `[{ _key: 'en', value }]`.

---

## 12. Repository map

```
astro.config.mjs         site URL, Sanity integration (Studio at /studio), sitemap
sanity.config.ts         Studio config (structure, singletons)
src/sanity/schemas/      photo (image object), series, siteSettings, homepage
src/lib/cms.ts           the one data layer: Sanity → SiteData, or seed → SiteData
src/lib/image.ts         URL builder, srcset, preload, OG image, hotspot position
src/components/Pic.astro the image component
src/components/Seo.astro head metadata + JSON-LD
src/layouts/Base.astro   html shell (head, skip link, accessibility floor)
src/styles/base.css      reset, accessibility floor, image component, reduced motion
src/styles/fonts.css     generated @font-face rules (npm run fonts)
src/styles/tokens.css    tokens (colour, type, scale, spacing, motion)
src/styles/site.css      layout
src/site/                Shell, Bar, About, Grid, Viewer
src/pages/               index (all images), work/index, work/[slug], about, contact, 404
seed/                    content.json, placeholder generator, Sanity upload script
scripts/                 fetch-fonts, postbuild, serve, screenshots, lighthouse
DESIGN-NOTES.md          the design plan and the self-review against the brief
```

## Assumptions and open items

- Contact details (`hello@jadebracke.com`, `@jadebracke`, `jadebracke.com`) are seed
  values in `seed/content.json` and `astro.config.mjs` (`SITE_URL`); the live values come
  from Site settings in the Studio.
- The site's only typeface, Jost (Google Fonts), is fetched, subset and committed. The
  fetch script still knows the Fontshare families for the paid-upgrade path, but nothing
  on the site uses them. The review screenshots in this
  session used renamed Google stand-ins installed only in that environment.
- The Studio's drag-to-reorder at 390px was checked against Sanity's own layout, not a
  live dataset (no project credentials in the build environment). See section 2.
- The gamut test (section 8) needs a real saturated photograph; the demo placeholders are
  greyscale because the site is black and white.
- Colour management relies on Sanity preserving embedded ICC profiles, per their
  documentation; verify with the red still-life test in section 8 after the first real
  upload.
