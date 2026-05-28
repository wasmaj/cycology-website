# Images — How to Replace and Add

```
/images/
├── hero/                              ← 3 photos for the homepage hero slider
│   ├── slide-1.jpg
│   ├── slide-2.jpg
│   └── slide-3.jpg
└── gallery/                           ← one folder per event
    ├── cycolobration-2025/            ← drop photos here
    ├── amazon-ride-2023/              ← drop photos here
    └── independence-day-ride/         ← drop photos here
```

## Hero Slider (Homepage)

To replace a hero photo: **just overwrite the file** `images/hero/slide-1.jpg`
(or `slide-2.jpg`, `slide-3.jpg`). The homepage picks them up automatically.

- **Recommended size:** 2000 × 1200 px (or larger), landscape orientation
- **Recommended format:** `.jpg` or `.webp`, compressed to under 250 KB
- **If the file is missing:** the hero falls back to a stock cycling photo so the
  site never breaks while you're swapping things out.

## Gallery (Events page)

Each subfolder under `/images/gallery/` is an **event album**. To update an
album, just drop new images into the matching folder — no HTML editing.

- Filenames sort naturally, so use `photo-001.jpg`, `photo-002.jpg`… if you
  want to control display order. Otherwise alphabetical order applies.
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`
- Hidden files (anything starting with `.`) are ignored — safe for macOS
  `.DS_Store` cruft.

### Adding a new event album

1. Create a new folder under `/images/gallery/` using a URL-safe slug:
   `lowercase-letters-and-dashes-only` (e.g. `new-year-ride-2026`).
2. Drop your photos into it.
3. Open `/pages/gallery.html` and copy any existing event block — change the
   `data-gallery-event="…"` attribute and the heading text to match your new
   folder name. That's the only HTML edit needed.

### Removing an event

Just delete the folder. The album disappears from the gallery page. (Don't
forget to also remove the matching block from `pages/gallery.html`.)

---

## How loading works (and `manifest.json`)

On deployed PHP hosting:
- `gallery.php` at the site root scans the event folder and returns whatever
  image files are in it. **You don't need to do anything else.**

On local preview or static-only hosting (where PHP doesn't run):
- The page falls back to a file called `manifest.json` inside the event
  folder. Each event folder ships with a sample one already in place — that's
  why galleries render correctly during local testing.

`manifest.json` is just a JSON array. Each entry can be either:

- **A filename** in the event folder, e.g. `"photo-001.jpg"` — resolved
  relative to the folder. Use this when you're hosting your own photos.
- **An absolute URL**, e.g. `"https://images.unsplash.com/photo-…"` — used
  as-is. Useful for placeholder photos during development.

Example:

```json
[
  "photo-001.jpg",
  "photo-002.jpg",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80"
]
```

**Once you deploy the site to PHP hosting and drop real files into a folder,
the PHP scanner takes over and the manifest is silently ignored.** You can
leave the manifest files in place forever; they only matter as a local
fallback.
