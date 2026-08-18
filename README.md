# Tackle Montana

Static site for Tackle Montana, a Montana Institute of Sport program bringing free, rugby-based tackle technique sessions to Montana football programs.

## Structure

- `index.html`, `mission.html`, `about.html`, `partners.html` — marketing pages
- `pricing.html` (Budget), `schedule.html` (Proposed Schedule) — the funding-proposal
  pages for athletic directors and MHSA officials. They share a navy/gold "ledger"
  treatment that lives in `styles.css` under **PROPOSAL PAGES**; only their own
  tables and banners stay in a per-page `<style>` block.
- `styles.css` — design tokens, layout, and every shared component
- `script.js` — nav toggle, scroll reveal, stat counters, carousel, FAQ accordion,
  scroll-triggered video
- `assets/` — images and video
- `favicon.png` — tab icon, also used as the Apple touch icon

### The `js` class

Each page sets `document.documentElement.classList.add('js')` in `<head>`, and every
CSS rule that *hides* something before JS reveals it (`[data-reveal]`, `.r-item`,
the collapsed `.faq-body`) is scoped to `.js`. If `script.js` fails to load or
throws, nothing is hidden and the page still reads as plain content. Keep new
hide-then-reveal rules scoped the same way.

## Assets

Photos and logos are real (Gallatin Raptors and Billings Central training sessions,
Coach Jed Holloway, and the Tackle Montana / partner school marks).

- `logo_badge_sm.png` — site logomark as used in the nav and footer (176px).
  `logo_badge.png` is the 2884px original, kept as the source for re-exports but
  **not referenced by any page** — it is 5 MB and was previously being downloaded
  on every page load to render at 44px.
- `og_cover.jpg` — 1200px social-share image referenced by the `og:image` tags
- `coach_gallatin.jpg`, `coach_bozeman.jpg` — field training photos
- `jed_holloway.jpg` — coach portrait (About page)
- `team_practice.jpg`, `tackle_wrap_demo.jpg`, `team_huddle_bc.jpg` — mission page carousel
- `field_action.jpg`, `coaching_huddle_poster.jpg`, `tackle_drills_poster.jpg` — home page video posters
- `field_video.mp4`, `coaching_huddle.mp4`, `tackle_drills.mp4` — home page clips
- `logo_raptors.png`, `logo_bison.png`, `logo_hawk.png`, `logo_belgrade.png`,
  `logo_billings_central.png` — partner school logos

To swap in a new photo, replace the file **with the same filename** at roughly the
same aspect ratio. If the pixel dimensions change, update the `width`/`height`
attributes on that `<img>` — they are there to reserve space and stop the page
from jumping as images load.

Currently unreferenced and safe to delete if they aren't coming back:
`stadium_testimonial.jpg`, `team_huddle.jpg`, `technique_demo.jpg`,
`technique_video.mp4`, `technique_video_poster.jpg` (~2.8 MB total).

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's Settings → Pages, set the source to the `main` branch, root folder.
3. The site publishes at the domain in `CNAME` (`www.tacklemontana.org`).

When adding a page, also add it to `sitemap.xml`, to the footer nav on every page,
and give it a `canonical` + `og:` block matching the others.
