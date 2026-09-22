# Brand Assets

The official Cycology logo is used across the site as PNG with a
transparent background.

```
/assets/
├── cycology-logo.png     ← Official full lock-up (bike + WHITE wordmark)
├── logo-mark.png         ← Official bike mark only (no wordmark)
├── favicon.png           ← 32×32 browser tab icon
├── apple-touch-icon.png  ← 180×180 iOS home-screen icon
├── logo.svg              ← Older hand-built vector (unused — see note below)
├── logo-light.svg        ← Older hand-built vector (unused)
└── logo-mark.svg         ← Older hand-built vector (unused)
/favicon.ico              ← At the site root, for older browsers
```

## Where each one is used

| File | Used by |
|---|---|
| `logo-mark.png` | Site header, beside the "CYCOLOGY" HTML wordmark (`js/main.js` → `HEADER_HTML`) |
| `cycology-logo.png` | Site footer, on the dark background (`js/main.js` → `FOOTER_HTML`) |
| `favicon.png` / `apple-touch-icon.png` | `<link rel="icon">` in every page |
| `favicon.ico` | Requested automatically by older browsers from the site root |

> **Note on the wordmark:** `cycology-logo.png` has a **white** wordmark, so
> it only works on dark backgrounds. On light backgrounds (the header) the
> site pairs `logo-mark.png` with the word "CYCOLOGY" set in HTML text, so it
> stays sharp and picks up the page's text colour.

> **The three `.svg` files** were hand-drawn approximations made before the
> official artwork was available. Nothing references them any more. They are
> kept only as a starting point if you ever want a true vector version — see
> below.

## Replacing the logo

Overwrite `cycology-logo.png` (full lock-up, white wordmark) and
`logo-mark.png` (mark only, transparent). Sizing is automatic — every
reference sets `height` with `width: auto`, so a new aspect ratio just works.
Update the `width`/`height` attributes in `js/main.js` to the new pixel
dimensions so the browser reserves the right space while loading.

To regenerate the icons after replacing the mark:

```bash
python -c "
from PIL import Image
m = Image.open('assets/logo-mark.png').convert('RGBA')
def fit(box, bg=None):
    c = Image.new('RGBA', (box, box), bg or (0,0,0,0))
    pad = round(box*0.08); inner = box - pad*2
    s = min(inner/m.width, inner/m.height)
    r = m.resize((round(m.width*s), round(m.height*s)), Image.LANCZOS)
    c.alpha_composite(r, ((box-r.width)//2, (box-r.height)//2)); return c
fit(32).save('assets/favicon.png')
fit(180, (255,255,255,255)).convert('RGB').save('assets/apple-touch-icon.png')
fit(64).save('favicon.ico', sizes=[(16,16),(32,32),(48,48)])
"
```

## If you get the official vector (SVG / AI / EPS)

The current PNG source is only 150 × 98 px, which is sharp at the sizes the
site uses but has no headroom for large print or hi-DPI billboards. If your
designer supplies the vector, save it as `cycology-logo.svg` and
`logo-mark.svg`, then swap the two `src` values in `js/main.js`.

## Brand colours (from the official artwork)

| Colour | Hex | Use in the mark |
|---|---|---|
| Yellow | `#FFD849` | Frame triangle, wheel ring segments |
| Pink | `#D91C5C` | Inner wheel rings, crank hub |
| Cyan | `#3BC2DF` | Handlebar, wheel ring segments |
| Orange | `#F39200` | Wheel ring segments |
| Black | `#1D1D1B` | Wordmark on light backgrounds |

The site's CSS variables (`--brand-*` in `/css/styles.css`) use the Corporate
Identity Guidelines values (`#FFD744`, `#D60B52`, `#46BFE0`), which differ by
a hair from the pixels sampled above. That's expected — the guideline values
stay authoritative for text and UI.
