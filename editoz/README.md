# Built for Editoz — pitch page

A one-page pitch styled as an edit timeline. It's plain static HTML/CSS/JS with no build step, served by GitHub Pages as part of the portfolio:

**https://hirund.github.io/Portfolio/editoz/**

GSAP, ScrollTrigger and Lenis are local files in `js/vendor/`, so nothing needs installing. The page is `noindex` and isn't linked from the portfolio home page, so only people you send the link to will see it.

## Editing content

**Everything lives in [`js/content.js`](js/content.js)**: names, copy, links, stats, timezones, toggles and the accent colour.

`index.html` is pre-rendered from it, so after editing content run (Node 18+, no installs):

```bash
node editoz/tools/build.mjs   # rewrites editoz/index.html
node editoz/tools/og.mjs      # only if the recipient/title changed: rewrites og.png (needs Chrome)
```

Then commit and push. Don't hand-edit `index.html`, because the next build overwrites it. Layout and behaviour live in `css/styles.css` and `js/*.js`, and changes there need no build step.

Still to fill in. A `null` value shows on the page as a highlighted **[X]**:

| Field | What |
|---|---|
| `capacity.hoursPerWeek` | Dedicated hours per week |
| `capacity.firstDraftDays` | Days to first draft |
| `sender.booking` | Optional booking link (button hidden while empty) |
| `sample.url` / `sample.shot` | Optional spec founder site. The sample clip is hidden until a URL is set |
| `partTime.overnight.workWindow` / `dayJobUntil` | Your real evening hours (default 19:00–23:00 SL) |

Other switches:
- `site.accent`: `#FF3D2E` "record red" (current) or `#2EE6F0` "timeline cyan".
- `analytics.enabled` + `goatcounterCode`: optional privacy-friendly view counter. Off by default.

### Pitching another agency
Copy the whole `editoz/` folder to a new name (e.g. `agencyname/`), then:
1. Change `recipient`, `stats` and `site.url` in its `js/content.js`.
2. Run that folder's `tools/build.mjs` and `tools/og.mjs`.
3. Push.

Paths are relative, so the folder works under any name.

## Assets

All in `assets/`. A missing asset shows a "MEDIA OFFLINE" slate with the expected filename.

| Folder | Format | Used for |
|---|---|---|
| `video/` | `name.mp4` (H.264) **and** `name.webm`, under 8s, muted, ~640px | Loops; lazy-loaded, played only when on screen |
| `posters/` | `name.webp` | Video posters and stills |
| `shots/` | `name-desktop.webp` (960w) + `name-mobile.webp` (540w), full-page | Web build mockups and the preview dialog |
| `img/` | `hirun-480.webp`, `hirun-800.webp` | Portrait |

To add the hero reel, set `hero.reel.src: 'goya-reel-01'` and add `video/goya-reel-01.mp4`, `.webm` and `posters/goya-reel-01.webp`. The Edit card works the same way (`layers.items[2].video.src`).

Encoding a loop with ffmpeg:
```bash
ffmpeg -i in.mov -t 7 -an -vf "scale=540:-2,fps=25" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4
ffmpeg -i in.mov -t 7 -an -vf "scale=540:-2,fps=25" -c:v libvpx-vp9 -crf 38 -b:v 0 out.webm
ffmpeg -ss 1 -i out.mp4 -frames:v 1 poster.png && cwebp -q 70 poster.png -o poster.webp
```

## Testing locally

ES modules don't run from `file://`, so serve the folder above `Portfolio`:

```bash
cd ~/Desktop/Gig && python3 -m http.server 8000
# open http://localhost:8000/Portfolio/editoz/
```

After pushing, check the link preview by pasting the URL into the LinkedIn Post Inspector, or by sending it to yourself on WhatsApp.

## Files

- `js/render.js`: HTML templates (used only by `tools/build.mjs`).
- `js/main.js`: Lenis, in-page jumps, the hero scroll motion and wiring.
- `js/scrubber.js`: the fixed timeline (fill, timecode, clip markers, END OF CUT).
- `js/gap.js`: the CLIP 01 sequence, one GSAP timeline scrubbed over a sticky stage.
- `js/overnight.js`: the clocks and dual-timezone track, using real timezones so daylight saving is handled.
- `js/ui.js`: reveal-on-enter, lazy video and the screenshot preview dialog.

**Reduced motion:** Lenis and scroll scrubbing are off, the CLIP 01 sequence becomes three static key frames, videos show their posters, and the clocks jump to their final state.
