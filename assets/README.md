# Brand Assets

```
/assets/
├── logo.svg          ← Full lock-up (bike + wordmark, dark text)
├── logo-light.svg    ← Full lock-up (bike + wordmark, white text)
└── logo-mark.svg     ← Bike icon only (no wordmark)
```

## When to use each

| File | Use case |
|---|---|
| `logo.svg` | Default — on light backgrounds (header on white, body content, business documents) |
| `logo-light.svg` | On dark surfaces (footer, dark hero, social cards) |
| `logo-mark.svg` | Tight horizontal space (mobile header beside the wordmark text), favicons, app icons, social avatars |

## Replacing the logo with the official vector

If you have the official Cycology logo SVG from your designer:

1. Save the dark-text version as `logo.svg` (overwriting this file).
2. Save the white-text version as `logo-light.svg`.
3. Save a wordmark-free version as `logo-mark.svg`.

Sizing across the site updates automatically — every reference uses
`height` with `width: auto`, so the new logo's aspect ratio just works.

## Brand colours (for reference)

| Colour | Hex | Pantone | Use |
|---|---|---|---|
| Yellow | `#FFD744` | 114 C | Right wheel ring, wordmark accent |
| Cyan | `#46BFE0` | 305 C | Frame triangle |
| Orange | `#F39200` | 1375 C | Top accent |
| Pink | `#D60B52` | 1935 | Left wheel ring, hub |
| Black | `#1D1D1B` | Pantone Black C | Wordmark on light backgrounds |

These tokens are defined as CSS variables in `/css/styles.css` (the
`--brand-*` set at the top of `:root`).
