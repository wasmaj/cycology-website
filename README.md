# Cycology Cycling Club — Website

A modern, responsive static rebuild of [cycology.com.ng](https://cycology.com.ng).
Built with semantic HTML5, vanilla CSS (custom, no framework) and vanilla JavaScript.
No build step, no Node.js — just upload the folder to any shared host and you're done.

---

## 1. Folder Structure

```
/Cycology-website
├── index.html              ← Home page
├── gallery.php             ← Tiny PHP scanner that powers the auto gallery
├── /pages/                 ← All internal pages
│   ├── about-us.html
│   ├── csr.html
│   ├── board-of-trustees.html
│   ├── club-executives.html
│   ├── sponsors.html
│   ├── gallery.html
│   ├── videos.html
│   ├── organizing-rides.html
│   ├── safety.html
│   ├── code-of-conduct.html
│   ├── share-the-road.html
│   ├── faq.html
│   ├── shop.html
│   ├── blog.html
│   ├── contact-us.html
│   ├── enquiry-form.html   ← Become a Member
│   ├── sign-in.html
│   └── waiver-form.html
├── /css/
│   └── styles.css          ← All styling (single file)
├── /js/
│   └── main.js             ← Nav, carousel, FAQ, forms, gallery loader
├── /images/                ← All photos — see "Managing Images" section below
│   ├── README.md
│   ├── /hero/              ← 3 photos for homepage hero slider
│   │   ├── slide-1.jpg
│   │   ├── slide-2.jpg
│   │   └── slide-3.jpg
│   └── /gallery/           ← One folder per event album
│       ├── /cycolobration-2025/
│       ├── /amazon-ride-2023/
│       └── /independence-day-ride/
├── /assets/                ← For favicons, fonts, logos
└── README.md               ← This file
```

---

## 2. Deploying to InMotion / cPanel Shared Hosting

1. **Log in to cPanel** at your InMotion control panel URL (usually `https://yourdomain.com:2083` or `https://yourdomain.com/cpanel`).
2. Open **File Manager**.
3. Navigate to `public_html/` (this is the document root your domain serves).
4. *(Optional, recommended)* if you have an existing site, back it up first: select all files → **Compress** → **.zip** → download.
5. **Delete the default `index.html`** that InMotion ships with (only if there's no other site there).
6. Back on your computer, **zip the entire `Cycology-website` folder contents** (NOT the folder itself — just everything inside it: `index.html`, `/pages/`, `/css/`, `/js/`, `/images/`, `/assets/`).
7. In cPanel File Manager, click **Upload** → drop the zip in → wait for it to finish.
8. Back in File Manager, right-click the zip → **Extract** → into `public_html/`.
9. Delete the zip when extraction is complete.
10. Visit your domain in a browser. You should see the new home page.

### Alternative: FTP upload (FileZilla, Cyberduck)

1. Get your FTP credentials from cPanel → **FTP Accounts**.
2. Connect via your FTP client.
3. Drag the contents of `Cycology-website` into `/public_html/`.
4. Done.

---

## 3. Where to Edit Content

The site is intentionally simple — every page is a single `.html` file you can edit in any code editor (VS Code, Notepad++, even Notepad).

### Brand system

The site implements the official **Cycology Corporate Identity Guidelines
v2 (August 2018)**:

- **5-colour palette**: yellow `#FFD744`, cyan `#46BFE0`, orange `#F39200`,
  pink `#D60B52`, black `#1D1D1B`. Defined as CSS variables at the top of
  `styles.css` (`--brand-yellow`, `--brand-cyan`, `--brand-orange`,
  `--brand-pink`, `--brand-black`).
- **Web typeface**: Open Sans (Light 300, Regular 400, Semibold 600,
  Bold 700, Extra Bold 800) — the brand's specified web font.
- The five colours are distributed meaningfully — feature-card icons,
  value pills and placeholder card medias rotate through the palette so
  a grid of repeated elements automatically picks up brand diversity
  without manual styling.
- A four-colour stripe (yellow / cyan / orange / pink) frames every page
  along the bottom edge of the page-header and the top edge of the footer.

| You want to change… | Open this file |
|---|---|
| The top navigation menu | `js/main.js` → `HEADER_HTML` constant |
| The footer (links, social, copyright) | `js/main.js` → `FOOTER_HTML` constant |
| Brand colours, fonts, spacing | `css/styles.css` → `:root { … }` at the top |
| Homepage hero, sections, CTA | `index.html` |
| About text, mission, vision | `pages/about-us.html` |
| CSR partners and timeline | `pages/csr.html` |
| Board / executive cards | `pages/board-of-trustees.html`, `pages/club-executives.html` |
| Ride schedule, hand signals | `pages/organizing-rides.html` |
| Safety rules and gear list | `pages/safety.html` |
| Code of Conduct | `pages/code-of-conduct.html` |
| FAQ Q&A items | `pages/faq.html` |
| Blog post cards | `pages/blog.html` |
| Gallery photos | `pages/gallery.html` (swap `<img src="…">` to your file in `/images/`) |
| Video thumbnails (or embed YouTube) | `pages/videos.html` |
| Contact form / waiver / sign-in / enquiry | The matching `.html` file in `/pages/` |

### Managing images (no-code workflow)

The image system is designed so you almost never need to touch HTML when
swapping photos around.

#### Hero slider (homepage)
Three files live in `/images/hero/`:

```
/images/hero/slide-1.jpg
/images/hero/slide-2.jpg
/images/hero/slide-3.jpg
```

To change a hero photo, **just overwrite the file with the same name**.
Refresh the homepage and you'll see your new photo.

- Recommended size: 2000 × 1200 px or larger, landscape
- Compress under ~250 KB for fast loading
- If a file is missing, the hero falls back to a stock cycling photo so
  nothing ever looks broken while you're working.

#### Gallery (events page) — fully automatic
Each event has its own folder under `/images/gallery/`:

```
/images/gallery/cycolobration-2025/
/images/gallery/amazon-ride-2023/
/images/gallery/independence-day-ride/
```

**Drop any image files into a folder and they appear on the gallery page
automatically.** No HTML editing needed.

- Supported formats: `.jpg .jpeg .png .webp .gif .avif`
- Sort order is alphabetical, so use names like `photo-001.jpg`,
  `photo-002.jpg`… to control the order if it matters.
- Hidden files (anything starting with `.`) are ignored — safe for the
  `.DS_Store` and `Thumbs.db` cruft macOS and Windows leave behind.

#### Adding a brand-new event album
1. Create a folder under `/images/gallery/` using a URL-safe slug
   (lowercase letters, digits and dashes only — e.g. `new-year-ride-2026`).
2. Drop your photos into it.
3. Open `/pages/gallery.html` and copy an existing `<section>` block.
   Change the heading text and the `data-gallery-event="…"` value to
   match your new folder slug. That's the only HTML edit ever needed.

#### How it works under the hood
`gallery.php` at the site root is a tiny PHP file (one HTTP endpoint) that
scans a whitelisted event folder and returns the list of image filenames.
The JavaScript on the gallery page fetches that list and builds the grid.

If PHP isn't available (e.g. you're previewing locally by double-clicking
the HTML file, or you move the site to a static-only host), the loader
falls back to looking for `manifest.json` in each event folder — just a
simple JSON array of filenames.

#### Adding a new page
1. Copy an existing file in `/pages/` (e.g. `about-us.html`) and rename it.
2. Update the `<title>`, `<meta description>`, breadcrumbs and main content.
3. Add a link to it inside `js/main.js` → `HEADER_HTML` (and/or `FOOTER_HTML`) so it appears in navigation.

---

## 4. Making the Forms Actually Work

All forms on the site (Contact, Enquiry, Waiver, Sign In, Newsletter) are
client-side UI only — they show a "thanks" message but **do not send anything**.
Easiest options to make them functional on shared hosting:

| Option | What it does | Cost |
|---|---|---|
| **[Formspree](https://formspree.io)** | Just change `data-fake-submit` → `action="https://formspree.io/f/yourID"`. Emails you submissions. | Free tier (50/mo) |
| **[Getform](https://www.getform.io)** | Same idea, slightly more generous. | Free tier |
| **cPanel `FormMail.cgi`** | Built into most cPanel hosts. `action="/cgi-sys/FormMail.cgi"` plus a `recipient` hidden field. | Free with hosting |
| **PHP handler** | Write a small `contact.php` with `mail()` and POST to it. | Free with hosting |

For the **Sign In** flow, a static site can't authenticate users on its own.
The simplest paths are Firebase Auth (free), Auth0, or moving the member area
to a WordPress install on the same domain at `/members/`.

---

## 5. SEO Suggestions (Already Done + Future)

**Already in place:**
- Unique `<title>` and `<meta description>` per page
- Open Graph tags on the homepage
- JSON-LD `SportsClub` schema on homepage
- JSON-LD `FAQPage` schema on FAQ
- Semantic HTML5 (`<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>`)
- ARIA labels, skip-to-content link, `:focus-visible` styles
- Breadcrumb navigation on every inner page
- Mobile-first responsive layout
- Lazy-loaded images
- Preconnect hints for Google Fonts

**Recommended next steps:**
1. **Add a `sitemap.xml`** at the root listing every page and submit to Google Search Console.
2. **Add a `robots.txt`** referencing your sitemap.
3. **Compress images** — use WebP via [Squoosh](https://squoosh.app) and aim for <150 KB per photo.
4. **Add real Open Graph images** sized 1200×630 to `/images/og/` and update each page's `<meta property="og:image">`.
5. **Replace the SVG-data-URI favicon** in each file with a proper `/assets/favicon.ico` plus `apple-touch-icon.png`.
6. **Set up Google Analytics 4 or Plausible** by adding their script to `js/main.js` or before `</body>` in each page.
7. **Verify your domain in Google Search Console** and submit the sitemap.
8. **Add internal links** between related blog posts and pages to improve crawl depth.

---

## 6. Accessibility Notes

- All interactive elements are keyboard-navigable.
- Focus rings use the amber accent colour for high visibility.
- Forms use proper `<label for>` associations.
- Images have descriptive `alt` text (placeholder images use `aria-hidden` or generic alt).
- `prefers-reduced-motion` disables animations for users who request it.
- Skip-to-content link sits above the header for screen-reader users.

---

## 7. Browser Support

Tested in modern Chrome, Edge, Firefox and Safari. Falls back gracefully in older browsers (the carousel and reveal animations degrade to plain static content; nothing is unreadable).

---

## 8. Suggested UX Improvements (Optional)

Things the original site could benefit from that are easy to add later:

- **A Strava embed** on the homepage showing live recent rides.
- **A “Ride Pace Selector”** quiz on the FAQ page that recommends a group based on the user's average speed.
- **WhatsApp click-to-join** button for the community chat in the footer.
- **Member directory** (behind login) for networking within the club.
- **An interactive map** of the Saturday route, embeddable from Strava or RideWithGPS.
- **A “Coffee Ride” calendar** so prospective members can self-book a try-out ride.

---

## 9. Credits

- **Fonts:** Bebas Neue + Inter via Google Fonts.
- **Photography placeholders:** Unsplash (free for commercial use, no attribution required, but please swap with the club's own photos before launch).
- **All copy:** sourced from cycology.com.ng — the club's own words.

---

If you need to tweak anything, every file is plain text. No build step, no
dependencies, no surprises.
