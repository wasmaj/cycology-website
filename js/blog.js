/* =========================================================
   Cycology — blog.js
   Populates pages/blog.html from the `publications` database
   table via /api/publications.php (published rows only, newest
   first). Add / edit posts at pages/admin-publications.html —
   no HTML changes needed.

   Needs PHP + the database (see README §4). On a static preview
   (file://, no PHP) the grid shows a friendly notice instead.
   ========================================================= */

(function () {
  'use strict';

  const ROOT     = location.pathname.includes('/pages/') ? '../' : '';
  const ENDPOINT = ROOT + 'api/publications.php';

  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // "2020-11-22" → "November 22, 2020"
  function formatDate(ymd) {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return ymd;
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Cover paths are stored relative to the site root (images/…); prefix
  // ROOT so they resolve from /pages/. Absolute URLs pass through untouched.
  function coverSrc(path) {
    if (!path) return '';
    return /^(https?:)?\/\//.test(path) ? path : ROOT + path.replace(/^\/+/, '');
  }

  function card(p) {
    const href  = 'article.html?slug=' + encodeURIComponent(p.slug);
    const media = p.cover_image
      ? `<div class="card-media"><a href="${href}" tabindex="-1" aria-hidden="true"><img src="${esc(coverSrc(p.cover_image))}" alt="" loading="lazy" /></a></div>`
      : `<div class="card-media" aria-hidden="true"></div>`;
    return `
      <article class="card reveal is-visible">
        ${media}
        <div class="card-body">
          <span class="card-meta">${esc(formatDate(p.published_at))}</span>
          <h3><a class="card-title-link" href="${href}">${esc(p.title)}</a></h3>
          ${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}
          <a class="card-link" href="${href}">Read more →</a>
        </div>
      </article>`;
  }

  function notice(html, extraClass) {
    grid.innerHTML = `<p class="gallery-empty${extraClass ? ' ' + extraClass : ''}">${html}</p>`;
  }

  notice('Loading articles…', 'gallery-loading');

  fetch(ENDPOINT, { headers: { 'Accept': 'application/json' } })
    .then((res) => res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status)))
    .then((data) => {
      const posts = (data && data.publications) || [];
      if (!posts.length) {
        notice('No articles have been published yet. Check back soon.');
        return;
      }
      grid.innerHTML = posts.map(card).join('');
    })
    .catch(() => {
      notice('Articles couldn’t be loaded right now. Please try again later.');
    });
})();
