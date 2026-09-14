# Design notes — Jade Bracke, five portfolio versions

Written before any code. Section 1 of the brief is treated as law; this document is the
plan, the self-review against that law, and the record of what was changed after the review.

## 0. The one sentence

The site's job is to make three photographs look expensive in ten seconds and to make the
email address impossible to miss. Everything below serves that sentence; anything that
does not is removed.

## 1. Shared decisions (all five versions)

### Data and image pipeline
- One Sanity dataset, one content model (`series`, `siteSettings`, `homepage`, the `image`
  object). All five versions read the same documents; nothing is version-specific in the CMS
  except `homepage.heroMode`, which only chooses between "hero is a series" and "hero is one
  image".
- One image component (`Pic.astro`) does the whole delivery pipeline: `@sanity/image-url`
  with `auto=format`, `fit=max`, quality 82 in grids and 90 for heroes and single images;
  srcset widths 640/960/1280/1600/2000/2600/3200 and nothing above 3200; explicit
  `width`/`height` from `metadata.dimensions` (post-crop); `aspect-ratio` reserved on the
  wrapper so CLS is 0 before the image element exists; LQIP from `metadata.lqip` as the
  wrapper background, the real image fading in over it with one opacity transition;
  first image on a page gets `fetchpriority="high"`, `loading="eager"` and a `<link
  rel="preload" imagesrcset>` in the head; everything else lazy.
- The layout never crops. When a version needs a fill (v3's colour panel, v4's frames),
  `object-fit: cover` is positioned by the Sanity hotspot the photographer set. The
  photographer chose that crop, not the CSS.
- `sizes` is written per placement. A grid cell says it is a grid cell.
- Local fallback: when no Sanity project is configured the site reads `seed/content.json`
  and 12 generated, neutral placeholder images, so every version renders in a fresh clone.
  Placeholders are tonal fields and simple geometry — not stock photographs, no people.

### Type
- Fontshare + Google Fonts only, self-hosted, subset to Latin, `font-display: swap`,
  variable where the foundry ships one. A single fetch script produces `/public/fonts` and
  the `@font-face` file. Every family has a metric-sensible system fallback so swap is not
  a jump into Times.
- Two families per version maximum; no pairing repeated:
  v1 Boska + Switzer · v2 Jost 200 alone · v3 Zodiak + General Sans ·
  v4 Jost 300 + Switzer · v5 Switzer + Erode.
- Display caps live at tracking 0.24–0.42em, weight 200–300. Body 16–18px, measure under
  70ch, line-height 1.55–1.7. Modular scale as named custom properties (`--step--2` …
  `--step-8`) computed from one `--ratio`. No inline magic numbers in components.
- Tracked caps are headlines. They are never used as an eyebrow above a section that already
  explains itself. Where a section needs a label the label is body size and sentence case.
- Each token file names its paid upgrade path (PP Editorial New, Söhne, GT Alpina,
  ABC Marfa) in a comment, and the swap is one custom property.

### Copy
- No "capturing moments", "through my lens", "let's create something beautiful together".
- Plain, specific, active: "Portraits, still life, interiors. Amsterdam." The tagline
  and about text come from the CMS; the seed copy sets the register.
- Link text is a verb or a noun. No arrow glyph appended. No middle-dot meta strings —
  meta is set as separate elements with space, or as a real list.

### Colour
- Each version has exactly one accent decision, and three of the five decide "none".
- No tinted near-blacks pretending to be black; ink values are the ones in the brief.
- Forbidden and checked: cream #F4F1EA + terracotta; acid green on near-black; SaaS card
  kit (bordered rounded cards with icons); gradients and shadows as decoration.

### Motion
- `prefers-reduced-motion: reduce` disables every transition and animation in every
  version via one rule in the shared base layer, and each version's scripts check the
  same media query before orchestrating anything.
- No scroll-triggered reveal animations anywhere. If it looks like a "fade-up on scroll"
  template, it is wrong.

### Accessibility floor
- Skip link, visible focus (a 2px ink outline, offset, never removed), logical DOM order
  matching visual order, `lang="en"`, alt required at the schema level so it cannot be
  published empty, buttons for actions and links for navigation, `aria-expanded` on
  disclosure controls, keyboard equivalents for every hover behaviour.

### SEO
- Canonical, per-page title/description, Open Graph with a per-series 1200×630 image
  made by the Sanity CDN from the cover hotspot, JSON-LD Person / CreativeWork /
  ImageObject, sitemap, robots, one 404 per version.

## 2. The five versions

### v1 — SPREAD
**Argument:** a portfolio is a magazine feature, and the photographer is the byline.
**Home:** a two-page spread. Right page: the hero series cover, full-bleed, filling the
right half edge to edge. Left page: an enormous thin Boska title in caps (the series
title, not the photographer's name — the work is the story), a 40-word standfirst in
Switzer, and the byline line "Photographed by Jade Bracke" set tiny. The standfirst is the
tagline plus the series intro, trimmed at 40 words by code so it stays a standfirst.
**Work index:** the contents page. A numbered running list, generous leading, cover as a
small thumbnail column at the right, page-number folio in the corner.
**Series:** a feature. Title spread first (title left, cover right), then images placed by
`displayWidth`: `full` bleeds both edges; `wide` bleeds one edge with an asymmetric inner
margin; `half` sits at 50% on alternating sides; `column` is a single reading column.
`pairWithNext` puts two on one line. Captions tiny and grey. Prev/next feature at the end,
with a folio.
**Palette:** paper #FBFBF9, ink #111111, cool grey #8A8D8C. No accent.
**Type:** Boska 200/300 display, Switzer body. Scale ratio 1.333.
**Motion:** View Transitions API page fades only. Nothing on scroll.
**Tell:** the huge title touching the page edge with the image on the other page.

### v2 — SPECTER
**Argument:** the photograph is an object on a table; the site is the table.
**Home:** bone field. Wordmark top centre, 12px Jost 200, tracking 0.42em. One image,
centred, sized to 60% of viewport height with its own aspect ratio. Beneath it, the
series title in tracked caps and the year. Every 8 seconds the image cross-fades to the
next selected series (paused for reduced motion, and there is an explicit "next" control).
**Navigation:** one word, "Menu", tracked, at top right. It expands into three words
stacked beneath it. That is the whole nav.
**Work index:** series names in tracked caps, stacked vertically in the centre of the
viewport. Behind the list, one full-viewport image at ~35% opacity; pointer hover or
keyboard focus cross-fades it to that series' cover. On touch the list is a list of links
with the first cover behind it.
**Series:** one image at a time, stacked vertically with a full viewport of bone between
them, each sized by `displayWidth` as a viewport-height fraction (full 82vh, wide 64vh,
half 48vh, column 36vh). Caption beneath, tiny, muted.
**Palette:** bone #F2EFE9, ink #1A1A18, muted #9C968B. No accent.
**Type:** Jost 200 only. Sizes and tracking are the only differentiation.
**Motion:** opacity only, 700ms, `cubic-bezier(.2, 0, .1, 1)`. Nothing translates.
**Tell:** the list of names with an image breathing behind them.

### v3 — SPLIT
**Argument:** colour work needs a white wall to hang on; give it exactly one.
**Layout:** a 40/60 hard split. Left panel white, sticky for the full viewport height,
carrying the wordmark in Zodiak caps and the page's type. Right panel: the photograph,
filling its 60% by hotspot. On hover/focus over the image side the split shifts to
30/70 over 600ms and back; on the work index the right side becomes a horizontal
filmstrip (`scroll-snap-type: x mandatory`), one cover per frame, while the left panel
stays still and shows the name and year of the frame in view.
**Mobile:** the split stacks. The type panel becomes a sticky header that compacts on
scroll (padding and type step down by class toggle, one transition).
**Series:** left panel holds title, year, location, client, intro. Right column stacks
the images by `displayWidth` on white with no gaps between `full` images.
**Palette:** white #FFFFFF, ink #0A0A0A; the image supplies all colour. Accent dark wine
#5B1220 only on the active nav item, focus ring and the current filmstrip counter.
**Type:** Zodiak display, General Sans body. Scale ratio 1.333.
**Motion:** the split ratio and the filmstrip scroll position. Nothing else.
**Tell:** white panel / saturated image, a hard line between them.

### v4 — CINEMA
**Argument:** the screening room. Sit in the dark, watch the frames, one per screen.
**Home:** first load runs one title sequence: the name in Jost 300 tracked caps resolves
from a wide letterspacing to its resting tracking while fading in, 1.6s, once per session.
Then the hero series' frames follow, scroll-snapped, each 100svh, edge to edge.
**Work index:** the programme. No images — a credits-style list on black, small, centred:
title, year, discipline, count. It is the only page in the five that shows no
photograph, and that is the point of a programme.
**Series:** each image a frame. `full` fills the frame by hotspot; `wide`/`half`/`column`
sit centred in the frame at 86/60/42vw on black. The series title sits very small in the
fixed bottom-left corner with a frame counter. Metadata (caption, alt, year, location)
appears only when the viewer presses the "i" control (or the `i` key) — a panel that
fades in and stays until dismissed.
**Palette:** #000000 true black (OLED), type #EDEDEB, blue-grey #6E7679 for metadata.
**Type:** Jost 300 display, Switzer body. Scale ratio 1.25.
**Motion:** scroll-snap and the one title sequence. Then nothing.
**Tell:** black frame, tiny corner title, nothing else.

### v5 — INDEX
**Argument:** a working archive is more convincing than a portfolio. Show everything.
**Home:** a contact-sheet grid of every image in every published series on one page.
Cells are uniform, the photograph sits in the cell at its own aspect ratio (contain, never
crop) with a hairline rule around each frame. A narrow metadata column at the left, set in
the system monospace stack, lists year, discipline and series as filter controls that
actually filter, with live counts. Click a frame and it opens in place: the cell spans the
full grid width, the `sizes` attribute is updated so the browser fetches the larger
candidate, and the frame's metadata line is printed beneath it. Click again to close.
**Work index:** a table. Title, year, discipline, location, frame count. Rows link.
**Series:** the same grid limited to one series, with captions shown under each frame.
**About:** the only long-form page in the five, set in Erode at 18px, with the CV and
client list as plain lists.
**Palette:** paper #F7F7F5, ink #141414, rule #D8D8D4. No accent.
**Type:** Switzer for interface, Erode for the About long-form. Monospace for the
metadata column only — justified in a code comment: the column is a dataset with aligned
numeric fields, and a monospace face is the honest way to typeset a dataset.
**Motion:** none beyond state changes (open/close, filter).
**Tell:** the sheet. Every image, one page, hairlines.

## 3. Self-review against section 1 — what read as "default" and what changed

I read the plan above as a stranger and marked what would appear in any portfolio I'd
produce on autopilot. Each mark was fixed before code.

1. **v1 home originally put the photographer's name as the enormous title.** Every
   portfolio does that. The reference spread's title is the feature, not the
   photographer. Changed: the title is the hero series' title; the name is the byline.
2. **v2 work index and v4 work index both hover-swapped a background image.** Two versions
   converging on the same trick. v4 arrived second, so v4 changed: its work index is a
   programme with no images at all.
3. **v3 series page was going to show images with generous gaps.** That is v2's rhythm.
   Changed: v3 `full` images stack with no gap, which reads as a printed sequence and
   is what a hard split promises.
4. **v5 originally had a hover zoom on the grid cells.** Motion for its own sake, and the
   brief says none beyond state changes. Removed.
5. **All five had an "eyebrow" label in tracked caps above the about text ("About").**
   Forbidden by the brief and pointless. Removed everywhere; the page title is the
   heading, and where a label is needed it is body-size sentence case.
6. **Nav in v1 and v3 were the same three-word top-right list.** v3 arrived second;
   its nav moved into the white panel as a vertical list in the panel's lower third,
   which the split layout makes natural and which v1's spread cannot do.
7. **Contact pages were about to be a form.** The brief says make the contact step
   obvious. A form adds a step. Every contact page is the email address set as the
   page's largest element, plus Instagram and phone as plain links. No form.
8. **Series metadata was about to be "2024 · Amsterdam · Portrait".** Middle dots are
   forbidden. Meta is a definition list (`<dl>`) styled as separate lines or spaced
   inline items.
9. **The default "fade up on scroll" reveal was in my hands for v1 and v3.** Section 1
   and the per-version motion rules forbid it. There is no scroll-triggered animation
   anywhere.
10. **Placeholder images were going to be tinted gradients that look like a design
    system demo.** Changed to tonal, photographic-feeling fields (a horizon, a soft
    circle, paper tones) and one deep-red saturated still-life field for the gamut test.

## 4. Assumptions carried into code
- Contact details and domain are as given in the brief and live only in `siteSettings`
  (with the seed as the fallback). No component hard-codes them.
- Fontshare files are fetched by `npm run fonts` on a machine with network access to
  api.fontshare.com; the build works without them (system fallbacks), and the token
  files do not change.
- Cloudflare Pages serves a subdirectory `404.html` for that subdirectory, which is how
  each version gets its own 404. A root 404 with a client-side redirect covers hosts
  that do not (Vercel).

## 5. After the screenshots — what the critique changed

Each version was built, screenshotted at 1440 and 390, and checked against sections 1
and 6 of the brief before the next one started. Changes made as a result:

- **v1:** the nav sat over the photograph; it now lives on the left page only, so the
  image is clean (the reference has nothing over the photo). The home title moved to the
  bottom of the page and the series opener's title to the top, so cover and feature read
  differently. Display size raised one step.
- **v2:** the paired frames stacked instead of sitting side by side; fixed. The slideshow
  container now sizes itself from the tallest slide so phones do not get a gap between
  image and title.
- **v3:** no visual change needed; the filmstrip and split-shift were verified by script.
- **v4:** the corner title selector collided with the frame titles and wiped the title
  sequence — fixed. Corner type and the metadata panel now use `mix-blend-mode:
  difference` so they stay legible over light frames without a shadow or a panel.
- **v5:** the pressed filter state used bold, which changed the monospace column width;
  it now underlines. On phones the filter groups fold behind one "Filters" button so the
  sheet starts near the top.
- **All:** the brief's grey/muted/blue-grey values fail AA contrast at small sizes. Each
  token file keeps the palette value for rules, large numerals and hover states and adds
  a derived `-text` tone (same hue, adjusted lightness) for small text. Lighthouse
  accessibility went from 95 to 100 on v1 and v2.
- **Fonts:** Fontshare is unreachable from the build environment, so the Fontshare faces
  are fetched by `npm run fonts` on the client's machine; fallbacks are declared in the
  tokens. The critique screenshots used stand-ins installed only in that environment.

## 6. Client decisions

- **The home title is the photographer's full name in every version** (client request,
  replacing the v1 "series as cover story" title and the v3 tagline headline). The hero
  series remains the picture and is named in the byline line beneath the title. Series
  pages keep their series titles: those are content.
- **No location anywhere on the site** (client request). The `location` field stays in
  Site settings as optional structured data only; nothing renders it, and the seed carries
  no place names.
- **Display type is thin sans in every version** (client review against the references).
  The three references are all thin, wide-tracked sans capitals; the serif displays in v1
  (Boska) and v3 (Zodiak) read as a different world and were replaced: v1 Jost 200 with
  Switzer body, v3 Switzer 200 with General Sans body. v1's cover spread now mirrors the
  reference exactly: photograph on the left page, title at the top of the right page,
  standfirst tiny. v3's home panel carries the centred wordmark and nothing else.

## 7. Redirection — one site, black and white

After review the client sent the references again with one more (zanvargek.com) and a
clear brief: only black and white; the typography of the magazine spread; the aesthetic
and menu structure of zanvargek.com. That is one site, not five. The five versions were
removed (they remain in git history before this commit) and replaced by:

- **Ground:** true black. Type white; every grey is white at an opacity. No other colour.
- **Bar:** three positions, as in the reference. Left: the count ("49 images") and
  "Index"; centre: the name in small tracked capitals; right: "About", which becomes
  "Close" when the overlay is open.
- **Home:** every image in every series as a justified grid on black. Clicking a picture
  opens it full screen on black in a viewer with its caption and series; arrows and
  Escape work; the series name links to the series page.
- **About:** an overlay over the blurred, dimmed grid, exactly as the reference: the
  statement large and light in the middle column, Contact in the right column, then
  Series / Selected / Clients as small lists in columns. `/about` is the same content
  as a page for search engines and no-JS visitors.
- **Series pages:** the spread's typography — the title in tall, thin capitals (Jost
  200), a tiny standfirst, a small tracked byline ("2023, Documentary, Photographed by
  Jade Bracke") — above the series' own grid.
- **Type:** Jost 200/300 for display and the About statement, Switzer for everything
  else. Sizes are small on purpose; the pictures carry the page.
- **No location anywhere.** Placeholders are greyscale so the demo is black and white too.

## 8. White, not black

Client correction: white ground, black type, no grey. The ground token now points at
white, every grey (white at an opacity) is gone, hierarchy comes from size, weight and
tracking only, hover states are underlines, the open About link is struck through, and
the grid behind the About overlay ghosts toward white at 18% under the blur.

## 9. One typeface

Client: "the typeface like here", pointing at the three references. Their common thread
is a light geometric sans, thin and tracked (Futura's family). Jost is that family and is
the one real, self-hosted face, so it is now the only family on the site: hairline-to-
thin for titles, light for running text, regular for the small tracked capitals. Switzer
is gone.

## 10. Archive and Work

Client: the home page is the archive; Work is a separate page with all projects,
filtered. The bar's left side now reads Archive / Work (current one underlined) plus the
count. `/work` lists every project as its cover with title, year and discipline, under two
filter rows (discipline, year) that combine. Filtering is a state change; nothing animates.

## 11. Real photographs, before Sanity exists

Client uploaded two real photographs and asked to see them in the actual layout. Added a
`seed/real-photos/` source folder (committed, resized to the documented export preset —
4800px long edge, quality 90) that `seed/generate-images.mjs` now picks up automatically
alongside the twelve synthetic placeholders, generating the same srcset and LQIP for each.
Wired both into the "Sitters" series (its cover and first two images) so they appear in
the archive grid, the Work index, the project page and the full-screen viewer. This is a
stand-in for the real workflow: once a Sanity project exists, photographs are uploaded
through the Studio and `seed/real-photos/` stops being read for anything but local preview.
