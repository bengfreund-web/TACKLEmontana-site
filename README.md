# Tackle Montana

Static site for Tackle Montana, a Montana Institute of Sport program bringing free, rugby-based tackle technique sessions to Montana football programs.

## Structure

- `index.html`, `mission.html`, `about.html`, `partners.html` — pages
- `styles.css` — design system and layout
- `script.js` — nav toggle, scroll reveal, stat counters, testimonial/team carousel
- `assets/` — images

## Assets

All files in `assets/` are real photos and logos (Gallatin Raptors training sessions, Coach Jed Holloway, and the Tackle Montana / Raptors / Bison / Hawks marks):

- `logo_badge.png` — main site logomark
- `stadium_testimonial.jpg` — testimonial section background
- `coach_gallatin.jpg`, `coach_bozeman.jpg`, `team_huddle.jpg` — field training photos
- `jed_holloway.jpg` — coach portrait
- `team_practice.jpg`, `technique_demo.jpg` — mission page carousel
- `field_action.jpg` — partners page photo
- `logo_raptors.png`, `logo_bison.png`, `logo_hawk.png` — partner school logos

To swap in a new photo, replace the file **with the same filename** at roughly the same aspect ratio, and no HTML/CSS changes are needed.

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's Settings → Pages, set the source to the `main` branch, root folder.
3. The site will publish at `https://<username>.github.io/<repo-name>/`.
