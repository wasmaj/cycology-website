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
│   ├── admin-login.html    ← Admin sign-in
│   ├── admin.html          ← Admin dashboard
│   └── waiver-form.html
├── /css/
│   └── styles.css          ← All styling (single file)
├── /js/
│   └── main.js             ← Nav, carousel, FAQ, forms, gallery loader
├── /images/                ← All photos — see "Managing Images" section below
│   ├── README.md
│   ├── /slide/             ← 5 photos for homepage hero slider
│   │   ├── slide-1.jpg
│   │   ├── slide-2.jpg
│   │   ├── slide-3.jpg
│   │   ├── slide-4.jpg
│   │   └── slide-5.jpg
│   └── /gallery/           ← One folder per event album
│       ├── /cycolobration-2025/
│       ├── /amazon-ride-2023/
│       └── /independence-day-ride/
├── /assets/                ← Logo files + favicons (see assets/README.md)
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
| Site logo (header / footer / favicon) | `assets/` — see `assets/README.md` |
| Homepage hero, sections, CTA | `index.html` |
| About text, mission, vision | `pages/about-us.html` |
| CSR partners and timeline | `pages/csr.html` |
| Board / executive cards | `pages/board-of-trustees.html`, `pages/club-executives.html` |
| Ride schedule, hand signals | `pages/organizing-rides.html` |
| Safety rules and gear list | `pages/safety.html` |
| Code of Conduct | `pages/code-of-conduct.html` |
| FAQ Q&A items | `pages/faq.html` |
| Blog post cards | Database — manage in the admin dashboard (see §4) |
| Gallery photos | `pages/gallery.html` (swap `<img src="…">` to your file in `/images/`) |
| Video thumbnails (or embed YouTube) | `pages/videos.html` |
| Contact form / waiver / sign-in / enquiry | The matching `.html` file in `/pages/` |
| Where the contact & membership forms send email | `api/forms.php` → the `to` value (see §6) |

### Managing images (no-code workflow)

The image system is designed so you almost never need to touch HTML when
swapping photos around.

#### Hero slider (homepage)
Five files live in `/images/slide/`:

```
/images/slide/slide-1.jpg
/images/slide/slide-2.jpg
/images/slide/slide-3.jpg
/images/slide/slide-4.jpg
/images/slide/slide-5.jpg
```

To change a hero photo, **just overwrite the file with the same name**.
Refresh the homepage and you'll see your new photo.

- Recommended size: 2000 × 1200 px or larger, landscape
- Compress under ~250 KB for fast loading
- To change the slide count or its caption text (eyebrow, title, buttons),
  edit the `.hero-slide` blocks in `index.html`.

#### Gallery (events page)
The gallery works like an album index: `/pages/gallery.html` shows a grid of
album cards (cover photo + title + photo count); clicking a card opens
`/pages/album.html?album=<slug>`, which shows that album's photos in a grid
with a click-to-zoom lightbox.

Each event has its own folder under `/images/gallery/`, e.g.:

```
/images/gallery/cycolobration-2025/
/images/gallery/cycology-amazon-crit-2025/
/images/gallery/amazon-ride-2023/
```

The album list lives in **`js/gallery.js`** (the `ALBUMS` array). This keeps
the gallery 100% static — it needs no PHP and no `fetch()`, so it renders the
same whether you open the files directly from disk, host them statically, or
deploy to a PHP host.

- Supported formats: any web image (`.jpg .jpeg .png .webp .gif`).
- Photos display in the order listed in `photos`. For numbered files there's
  a `seq(n)` helper that expands to `photo-001.jpg … photo-0NN.jpg`.

#### Adding / editing an album
1. Create a folder under `/images/gallery/` using a URL-safe slug
   (lowercase letters, digits and dashes only — e.g. `new-year-ride-2026`).
2. Drop your photos into it.
3. Open `js/gallery.js` and add an entry to the `ALBUMS` array (newest first):
   ```js
   { slug: 'new-year-ride-2026', title: 'New Year Ride 2026',
     photos: ['photo-001.jpg', 'photo-002.jpg', /* … */] }
   // or, for sequential names: photos: seq(40)
   ```
   The first photo becomes the cover unless you add a `cover:` field. That's
   the only edit needed — the card and album page are generated automatically.

> Note: `gallery.php` and the per-folder `manifest.json` files are remnants of
> an earlier auto-scanning approach and are no longer used by the gallery.

#### Adding a new page
1. Copy an existing file in `/pages/` (e.g. `about-us.html`) and rename it.
2. Update the `<title>`, `<meta description>`, breadcrumbs and main content.
3. Add a link to it inside `js/main.js` → `HEADER_HTML` (and/or `FOOTER_HTML`) so it appears in navigation.

---

## 4. The admin dashboard

Everything the club manages day to day lives behind one sign-in at
**`/pages/admin-login.html`**:

| Screen | What it does |
|---|---|
| `admin.html` | Dashboard — headline numbers, recent activity, quick actions, change password |
| `admin-publications.html` | Write, edit, publish and delete blog posts |
| `admin-submissions.html` | Read contact / membership submissions, download CSV or Excel |

### One-time setup

1. **Create the database** (cPanel → MySQL® Databases) and add a user to it
   with All Privileges.
2. **Run the SQL files** in phpMyAdmin → your database → **SQL** tab:
   `sql/admin-users.sql`, `sql/publications.sql`, `sql/form-submissions.sql`.
3. **Copy** `api/config.example.php` → `api/config.php` and fill in the
   database details. Set `admin_token` to a long random string
   (`php -r "echo bin2hex(random_bytes(24));"`) — you use it once, in the
   next step. `config.php` is git-ignored; upload it to the host by hand.
4. **Open `/pages/admin-login.html`.** Because no account exists yet, it
   offers to create the first one: paste the `admin_token` (this proves you
   own the server), pick a username and a password of 10+ characters.

From then on you just sign in with that username and password. Change the
password any time from the bottom of the dashboard.

### How the sign-in works

- A normal PHP session cookie, marked `HttpOnly` and `SameSite=Strict`
  (and `Secure` over HTTPS), so it can't be read by JavaScript or sent from
  another site.
- Passwords are stored as bcrypt hashes, never in plain text.
- Ten failed attempts from one IP address locks sign-in for 15 minutes.
- Visiting any admin page while signed out bounces you to the login screen
  and returns you to the page you wanted once you're in.

> **Forgotten password?** There's no email reset. Delete the row from the
> `admin_users` table in phpMyAdmin — the login screen then offers the
> first-run setup again, and you rebuild the account with the `admin_token`.

> The `admin_token` still works on its own as an `X-Admin-Token` header for
> scripts and `curl`. Treat it like a master key: keep it long and private.

---

## 5. Publications (blog posts) in a database

Blog posts can be stored in a MySQL table and managed from the browser
instead of hand-editing `pages/blog.html`. Three pieces make this work:

| File | Purpose |
|---|---|
| `sql/publications.sql` | Creates the `publications` table (+ optional seed rows) |
| `api/publications.php` | JSON CRUD endpoint — create / read / update / delete rows |
| `pages/admin-publications.html` + `js/admin-publications.js` | Admin screen: table of posts with New / Edit / Publish / Delete (see §4) |
| `js/blog.js` | Loads the public blog page from the table (published posts, newest first) |
| `pages/article.html` + `js/article.js` | Full-article page — `article.html?slug=<slug>` — linked from every blog card |
| `api/upload.php` | Image upload (admin only) → saves to `images/publications/` |

### One-time setup (cPanel)

Covered by the dashboard setup in §4 — run `sql/publications.sql` along with
the other SQL files, then sign in and open **Blog posts**.

### API reference

```
GET    /api/publications.php              list published posts (newest first)
GET    /api/publications.php?all=1        list incl. drafts            [admin]
GET    /api/publications.php?id=7         one post by id
GET    /api/publications.php?slug=my-post one post by slug
POST   /api/publications.php              create  { "title": "…", … } [admin]
PUT    /api/publications.php?id=7         update  (any subset of fields) [admin]
DELETE /api/publications.php?id=7         delete                       [admin]
```

Fields: `title` (required), `slug` (auto-generated from the title if blank),
`excerpt`, `body`, `cover_image` (path relative to site root),
`author`, `status` (`draft` | `published`), `published_at` (`YYYY-MM-DD`).

### Writing an article

In the admin screen, **Body** is plain text: leave a blank line between
paragraphs, single line breaks are kept, and any `https://…` URL becomes a
link. HTML is shown literally, not rendered. The **Excerpt** appears on the
blog card and as the bold lead line on the article page.

### Changing a post's picture

Open the post → **Upload image** (JPG/PNG/WebP/GIF, max 5 MB). The file is
saved to `images/publications/` with a generated name and the path is filled
in for you — click **Save** to keep it. You can also type the path of any
existing image on the site (e.g. `images/gallery/amazon-ride-2023/photo-010.jpg`)
or **Remove** to clear it. Make sure `images/publications/` is writable
(permission `755`) on the host.

Admin routes accept either a dashboard session (§4) or an
`X-Admin-Token: <token>` header for scripts. If the host strips
custom headers, send `?token=<token>` instead; if it blocks PUT/DELETE, POST
with `"_method": "PUT"` (or `"DELETE"`) in the JSON body.

`pages/blog.html` has no hard-coded posts — `js/blog.js` fetches the published
rows and builds the cards. Until the database is set up the page shows an
"Articles couldn't be loaded" notice.

---

## 6. Forms

### Contact and Membership — these send real email

| Form | Page | Goes to |
|---|---|---|
| Contact | `pages/contact-us.html` | **info@cycology.com.ng** |
| Membership application | `pages/enquiry-form.html` | **membership@cycology.com.ng** |

Both post to `api/send-form.php`, which **emails the submission AND saves it
to the database**, then you review and download everything at
`pages/admin-submissions.html`.

| File | Purpose |
|---|---|
| `api/forms.php` | The form definitions — recipients, required fields, field labels |
| `api/send-form.php` | Emails the submission and stores it |
| `sql/form-submissions.sql` | Creates the `form_submissions` table |
| `api/submissions.php` | Admin API: list, filter, view, delete, CSV/Excel export |
| `pages/admin-submissions.html` + `js/admin-submissions.js` | The admin screen |

Email uses PHP's `mail()` — standard on cPanel/InMotion, so there is nothing
to install and no third-party service to pay for.

**How it works:** the page only sends a form key (`contact` or `membership`).
The endpoint looks that key up in its own `$FORMS` table to decide the
recipient, so the addresses never appear in the page source and the script
can't be used to email anyone else.

**To change a recipient address**, edit the `to` value in the `$FORMS` array
at the top of `api/send-form.php`.

The club receives a plain-text email with every field labelled, and
**Reply-To is set to the sender**, so hitting Reply in your mail client
answers the person directly.

### Reviewing and downloading submissions

Sign in at `/pages/admin-login.html`, then open **Form submissions** from
the admin bar (or the dashboard's quick actions).

- Filter by form with the tabs, search by name / email / phone / message
  content, or narrow to a date range.
- **View** shows every field of one submission, with a *Reply by email*
  button.
- **Download CSV** opens straight in Excel, Numbers or Google Sheets (it is
  written with a UTF-8 marker so accented names come through correctly).
- **Download Excel** produces a real `.xlsx` with a frozen, bold header row.
- Both downloads respect whatever filters are active, so you can export just
  membership applications, or just last month's.
- The **Emailed** column flags anything saved but not emailed — a quick way
  to spot a mail outage.

**One-time setup:** run `sql/form-submissions.sql` in phpMyAdmin (see §4) so
the table exists. Until then the forms still email normally; they just aren't
stored — and the dashboard tells you which SQL file is still missing.

### If mail doesn't arrive

1. Check the spam folder first — this is the usual answer.
2. Make sure `info@` and `membership@` exist in **cPanel → Email Accounts**
   (or are forwarders pointing somewhere real).
3. The `From` address must be on your own domain. It defaults to
   `no-reply@cycology.com.ng`; override it with `mail_from` in
   `api/config.php` if you use a different domain.
4. To see exactly what's being generated, set `mail_log` in `api/config.php`
   to a file path — messages get written there instead of sent. Remember to
   comment it out afterwards.
5. For high-volume or high-deliverability needs, point the host at an SMTP
   relay (cPanel → Email Deliverability, or a service like SendGrid).

Mail and storage are independent: a submission is saved even when the email
fails, and emailed even when the database is down. The visitor only sees an
error if both fail — so nothing is silently lost.

### Spam protection

Both forms carry a hidden "website" field that people never see and bots
fill in. When it arrives filled, the submission is silently discarded — the
bot gets a success response so it doesn't retry another way. Add
`class="hp-field"` markup (copy it from either form) to any new form you
build.

### Still client-side only

**Waiver** and **Sign In** still just show a "thanks" message — they keep the
`data-fake-submit` attribute. To make the Waiver email the club too, give its
`<form>` a `data-mail-form="waiver"` attribute and add a matching `waiver`
entry to `$FORMS` in `api/send-form.php`.

For the **Sign In** flow, a static site can't authenticate users on its own.
The simplest paths are Firebase Auth (free), Auth0, or moving the member area
to a WordPress install on the same domain at `/members/`.

---

## 7. SEO Suggestions (Already Done + Future)

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
- Real favicon + `apple-touch-icon` from the official logo

**Recommended next steps:**
1. **Add a `sitemap.xml`** at the root listing every page and submit to Google Search Console.
2. **Add a `robots.txt`** referencing your sitemap.
3. **Compress images** — use WebP via [Squoosh](https://squoosh.app) and aim for <150 KB per photo.
4. **Add real Open Graph images** sized 1200×630 to `/images/og/` and update each page's `<meta property="og:image">`.
5. **Set up Google Analytics 4 or Plausible** by adding their script to `js/main.js` or before `</body>` in each page.
6. **Verify your domain in Google Search Console** and submit the sitemap.
7. **Add internal links** between related blog posts and pages to improve crawl depth.

---

## 8. Accessibility Notes

- All interactive elements are keyboard-navigable.
- Focus rings use the amber accent colour for high visibility.
- Forms use proper `<label for>` associations.
- Images have descriptive `alt` text (placeholder images use `aria-hidden` or generic alt).
- `prefers-reduced-motion` disables animations for users who request it.
- Skip-to-content link sits above the header for screen-reader users.

---

## 9. Browser Support

Tested in modern Chrome, Edge, Firefox and Safari. Falls back gracefully in older browsers (the carousel and reveal animations degrade to plain static content; nothing is unreadable).

---

## 10. Suggested UX Improvements (Optional)

Things the original site could benefit from that are easy to add later:

- **A Strava embed** on the homepage showing live recent rides.
- **A “Ride Pace Selector”** quiz on the FAQ page that recommends a group based on the user's average speed.
- **WhatsApp click-to-join** button for the community chat in the footer.
- **Member directory** (behind login) for networking within the club.
- **An interactive map** of the Saturday route, embeddable from Strava or RideWithGPS.
- **A “Coffee Ride” calendar** so prospective members can self-book a try-out ride.

---

## 11. Credits

- **Fonts:** Bebas Neue + Inter via Google Fonts.
- **Photography placeholders:** Unsplash (free for commercial use, no attribution required, but please swap with the club's own photos before launch).
- **All copy:** sourced from cycology.com.ng — the club's own words.

---

If you need to tweak anything, every file is plain text. No build step, no
dependencies, no surprises.
