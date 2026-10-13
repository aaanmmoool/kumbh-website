# Tirtha — Kumbh cottage booking website

A self-contained, prerendered React site for booking cottages at the Kumbh Mela. Visitors choose a
city and a check-in date in the hero, see the cottages listed for that city, read how booking works,
and send a booking request. **Tirtha** is a placeholder brand name; every product-specific line is
marked `PLACEHOLDER` so it can be replaced when the real details exist.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # typecheck → client build → SSR build → prerender into dist/
npm run preview        # serve dist/ at http://localhost:4173
```

Requires Node 20.19+ (built and tested on Node 22).

## Replacing the placeholder content

| What | Where |
| --- | --- |
| **Cottages** (cards, city filter and the booking form's cottage list) | `src/content/cottages.ts` — add or edit entries |
| Cities you can search | `src/content/site.ts` → `places` |
| Product name, Devanagari name, tagline, contact email, social links | `src/content/site.ts` → `brand` |
| All page copy (hero, sections, FAQ, form text) | `src/content/site.ts` |
| Page title / description / Open Graph text | `index.html` |
| Logo mark | `src/components/art/Logo.tsx`, `public/favicon.svg` |
| Social preview image | run `npm run build && npm run og-image` after changing the hero |
| Apple touch icon, paper-grain texture | run `npm run assets` after changing `public/favicon.svg` |

The six cottages in `src/content/cottages.ts` are **sample listings** (the page says so above the
cards). Replace them with the real cottages, and add prices or amenities only once they are confirmed.
Lines marked `PLACEHOLDER` describe the product (positioning, the confirmation step, booking FAQ answers). Everything else — the legend, the four cities and rivers, the day on the
ghat — is cultural content about the Kumbh Mela. No testimonials, statistics, prices, logos or
features have been invented; add them only when they are real.

## Photos

Real Kumbh photographs come from Wikimedia Commons under licences that allow commercial use with
credit (CC BY 2.0/3.0 and CC BY-SA 4.0). The list lives in `src/content/photos.json`. To add or swap a
photo, add its Commons file name there and run:

```bash
npm run photos   # downloads, checks the licence, writes AVIF + WebP at 480–2400px and blurred placeholders
```

Author, licence and source for every photo are recorded in `src/content/photo-data.json` and shown
under **Photo credits** in the footer, as the licences require. Photos are used in the "Things to see"
section, the Journey arches and the full-width band behind the value statement.

## Booking flow

1. **Hero search** (`HeroSearch.tsx`): place + check-in date, both required, no past dates. The
   city picker (`ui/CityPicker.tsx`, also used in the booking form) shows each city over a photo of
   its river; the photo for each city is set by `photo` in `places` (`src/content/site.ts`).
2. **Listing** (`Cottages.tsx`): filtered by the search; the city chips and date can be changed in
   place. The search is kept in the URL (`?place=haridwar&checkin=2027-01-14`) so results can be shared.
3. **How it works** (`HowItWorks.tsx`): the four booking steps.
4. **Booking request** (`Book.tsx`): pre-filled with the city, date and any cottage chosen from a card.

## Booking request form

The form posts JSON `{ type: "booking-request", name, email, phone, place, checkIn, guests, cottage }`
to `VITE_FORM_ENDPOINT`.

```bash
cp .env.example .env
# VITE_FORM_ENDPOINT=https://your-api.example.com/enquiries
# VITE_SITE_URL=https://your-domain.example      (enables canonical + og:image tags)
```

Any endpoint that accepts JSON and returns a 2xx works (your own API, Formspree, Getform…).
**Until an endpoint is set, the form does not pretend to succeed** — it validates input and then
tells the visitor that requests are not connected yet. In development a dashed note above the form
says the same thing. Loading, validation, success, error, timeout and rate-limit states are all
implemented in `src/lib/booking.ts` and `src/components/sections/Book.tsx`.

## Design system

"A day on the ghat": the page moves from night, through first light and sandstone noon, back to a
lamp-lit night.

- **Colour** (`src/styles/index.css`, `@theme`): night `#0d1331`, indigo `#222a5c`, ivory `#f3ecdf`,
  sandstone `#e5d5b7`, saffron `#d68b38`, antique gold `#b8954f`, river teal `#2c6b70`, ink `#23201c`.
- **Type**: Eczar (display serif, designed for both Devanagari and Latin) with Mukta (sans, also
  Devanagari + Latin). Both are self-hosted through Fontsource; only the subsets a page uses load.
- **Illustration**: flat fills with gold hairlines. Every scene is generated from shared path
  builders in `src/components/art/shapes.ts` (shikhara temples, chhatris, havelis, ghat steps,
  petals), so the style stays consistent. Illustrations sit in a jharokha-arch frame (`.arch-mask`),
  which also works for real photography later.
- **Signature 3D**: a porcelain-and-gold lotus holding a kumbh, with a drop of amrit and two orbits
  (`src/components/three/LotusScene.tsx`, React Three Fiber).
- **Backdrops**: `backdrops` in `src/content/site.ts` chooses between the illustrated night river
  behind the hero with the aarti photo behind the value statement (`'original'`, the live site), or
  the two swapped (`'swapped'`, previewed on the `backdrop-swap` branch).

## How the 3D is loaded

1. The hand-drawn SVG twin of the lotus (`LotusEmblem.tsx`) is part of the prerendered HTML, so the
   hero is complete on first paint, without JavaScript and without WebGL.
2. After the page is idle, the WebGL scene loads **only** on screens ≥ 768px, with a hardware GPU
   (`failIfMajorPerformanceCaveat`, software renderers refused), no Save-Data, and ≥ 4 GB device memory.
3. It cross-fades in over the SVG, pauses whenever the hero is off screen, and hands back to the SVG
   if the context is lost or the device cannot hold ~24 fps.
4. With `prefers-reduced-motion`, it renders a single still frame.

Query flags for testing: `?no3d` forces the SVG; `?force3d` skips the GPU checks.

## Structure

```
src/
  content/site.ts          all copy (edit here)
  components/
    art/                   SVG illustration system (logo, hero scene, lotus, stage art, sky clock, day scene)
    three/LotusScene.tsx   lazy-loaded WebGL centrepiece
    sections/              Hero (+ HeroSearch), Cottages, HowItWorks, Promise, Journey, Legend, DayOnTheGhat, Questions, Book
    layout/                Header (with mobile menu), Footer
    ui/                    Button, Reveal / MaskedHeading, Photo, CityPicker, ErrorBoundary
  content/cottages.ts      the cottage listing (edit here)
  lib/                     booking search + request validation and submission, capability checks, seeded random
  hooks/useBooking.tsx     shared search state between hero, listing and form
  hooks/                   media query, header scroll state, focus trap
  entry-server.tsx         used by scripts/prerender.mjs
scripts/
  prerender.mjs            renders the app to static HTML, inlines CSS, preloads fonts
  generate-assets.mjs      grain texture (AVIF/WebP) + touch icon
  og-image.mjs             social preview from the real hero
  lighthouse.mjs           Lighthouse mobile + desktop against the production build
tests/
  unit/                    Vitest — dates, search and booking validation, submission states
  e2e/                     Playwright — layout at 11 widths, search → listing → booking flow, menu, tabs, FAQ, no-JS, reduced motion
```

## Tests and audits

```bash
npm run typecheck
npm test                       # unit tests
npm run build && npm run test:e2e   # end-to-end, uses the Chrome installed on the machine
npm run build && npm run lighthouse # writes reports/lighthouse-{mobile,desktop}.html
```

Playwright runs against system Chrome (`channel: 'chrome'`), so no browser download is needed. To use
Playwright's bundled Chromium instead, run `npx playwright install chromium` and set `PW_CHANNEL=chromium`.

## Accessibility and motion

- Semantic landmarks, a skip link, visible focus rings, ARIA tabs (Journey), a radio group (time of
  day), an accordion (Questions) and a focus-trapped mobile menu; all are keyboard operable.
- Touch targets are at least 44px on phones (checked by the e2e suite).
- Motion follows `prefers-reduced-motion` everywhere (CSS keyframes and Motion's `reducedMotion="user"`).
- Without JavaScript the prerendered page is fully readable (`<noscript>` style removes reveal offsets).

## Deploying

### Hosted preview (claude.ai Artifact)

`npm run build:artifact` builds with relative paths and packages `dist-artifact/` for hosting as a
claude.ai Artifact (fonts and textures inlined, scripts alongside). The Artifact host blocks requests
to other sites, so booking requests cannot be delivered from that preview even with an endpoint set;
use your own hosting for real bookings.

### Vercel (live site)

The site is deployed on Vercel as the project `kumbh-website`: **https://kumbh-website-pearl.vercel.app**.
`vercel.json` sets the build (`npm run build` → `dist/`) and long cache headers for assets and photos.

```bash
npx vercel deploy --prod --build-env VITE_SITE_URL=https://kumbh-website-pearl.vercel.app
```

Add `VITE_FORM_ENDPOINT` in the Vercel project's environment variables to receive booking requests.

### Your own hosting

`dist/` is a static site — deploy it to any static host (Netlify, Vercel, Cloudflare Pages, Render
static sites, S3 + CloudFront…). Set `VITE_FORM_ENDPOINT` and `VITE_SITE_URL` in the host's build
environment. Serve with gzip or brotli compression.
