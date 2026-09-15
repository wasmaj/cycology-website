/* =========================================================
   Cycology — article.js
   Renders one publication on pages/article.html. The post is
   picked by the ?slug= query parameter and fetched from
   /api/publications.php?slug=<slug>.

   The `body` column is treated as PLAIN TEXT: blank lines become
   paragraphs, single line breaks stay as line breaks, and bare
   URLs become links. HTML in the body is shown literally (never
   executed), so nothing typed into the admin editor can inject
   scripts into the page.
   ========================================================= */

(function () {
  'use strict';

  const ROOT     = location.pathname.includes('/pages/') ? '../' : '';
  const ENDPOINT = ROOT + 'api/publications.php';

  const $ = (sel) => document.querySelector(sel);
  const titleEl = $('#article-title');
  const metaEl  = $('#article-meta');
  const crumbEl = $('#crumb-title');
  const bodyEl  = $('#article');
  if (!bodyEl) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function formatDate(ymd) {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-').map(Number);
    if (!y || !m || !d) return ymd;
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function coverSrc(path) {
    if (!path) return '';
    return /^(https?:)?\/\//.test(path) ? path : ROOT + path.replace(/^\/+/, '');
  }

  // Plain text → safe HTML paragraphs with clickable links.
  function textToHtml(text) {
    const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g,
      (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
    return String(text).replace(/\r\n?/g, '\n').trim()
      .split(/\n{2,}/)
      .map((para) => `<p>${linkify(para).replace(/\n/g, '<br />')}</p>`)
      .join('');
  }

  function showError(message) {
    titleEl.textContent = 'Article not found';
    crumbEl.textContent = 'Not found';
    metaEl.textContent  = '';
    bodyEl.innerHTML    = `<p class="gallery-empty">${esc(message)}</p>`;
  }

  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) { showError('No article was specified.'); return; }

  fetch(ENDPOINT + '?slug=' + encodeURIComponent(slug), { headers: { 'Accept': 'application/json' } })
    .then((res) => res.ok ? res.json() : Promise.reject(new Error(res.status === 404 ? 'notfound' : 'HTTP ' + res.status)))
    .then((p) => {
      document.title = p.title + ' — Cycology Cycling Club';
      titleEl.textContent = p.title;
      crumbEl.textContent = p.title;

      const meta = [formatDate(p.published_at), p.author].filter(Boolean);
      metaEl.textContent = meta.join(' · ');

      const cover = p.cover_image
        ? `<figure class="article-cover"><img src="${esc(coverSrc(p.cover_image))}" alt="" /></figure>`
        : '';
      const body = p.body && p.body.trim()
        ? textToHtml(p.body)
        : (p.excerpt ? `<p class="article-lead">${esc(p.excerpt)}</p>` : '<p class="gallery-empty">This article has no content yet.</p>');
      const lead = p.body && p.body.trim() && p.excerpt ? `<p class="article-lead">${esc(p.excerpt)}</p>` : '';

      bodyEl.innerHTML = cover + `<div class="article-body">${lead}${body}</div>`;
    })
    .catch((err) => {
      showError(err.message === 'notfound'
        ? 'We couldn’t find that article. It may have been removed or unpublished.'
        : 'The article couldn’t be loaded right now. Please try again later.');
    });
})();
