# GHOONT — the bottle that tells time

Landing page and video ads for GHOONT time-marked water bottles (Daily 1L, Garmi 2L, Roza Edition).

## What's here

| Path | What it is |
|---|---|
| `index.html` | The whole website in one file (GSAP, ScrollTrigger and Lenis are inlined). This is what Vercel serves. |
| `ads/*.mp4` | Video ads: main (9:16), Garmi (9:16), Roza (9:16), colours (4:5 feed). |
| `ads/source/` | The HTML/GSAP source the ads were rendered from. |
| `src/` | Editable source of the site (`index.src.html` + `motion.js`), combined by `build.py`. |

## Editing business details

Open `index.html`, search for `const CONFIG` and change the WhatsApp number, prices, colours or brand name. Commit and push: Vercel redeploys automatically.

## Deploy

Static site, no build step. Vercel serves `index.html` from the repo root.
