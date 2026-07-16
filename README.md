# Tackle Montana

Static site for Tackle Montana, a Montana Institute of Sport program bringing free, rugby-based tackle technique sessions to Montana football programs.

## Structure

- `index.html`, `mission.html`, `about.html`, `partners.html` — pages
- `styles.css` — design system and layout
- `script.js` — nav toggle, scroll reveal, stat counters, testimonial/team carousel
- `assets/` — images

## Placeholder images

Every file in `assets/` is currently a generated placeholder (labeled "Photo Needed" / "Replace assets/...") standing in for real photography and logos:

- `logo_badge.png` — main site logomark
- `hero_badge_field.jpg`, `stadium_testimonial.jpg` — full-bleed backgrounds
- `coach_gallatin.jpg`, `coach_bozeman.jpg`, `jed_holloway.jpg`, `team_practice.jpg` — content photos
- `logo_raptors.png`, `logo_bison.png`, `logo_hawk.png` — partner school logos

To swap in real assets, replace each file **with the same filename** at roughly the same aspect ratio (noted in the placeholder image itself), and no HTML/CSS changes are needed.

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's Settings → Pages, set the source to the `main` branch, root folder.
3. The site will publish at `https://<username>.github.io/<repo-name>/`.
