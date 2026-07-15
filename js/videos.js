/* =========================================================
   Cycology — videos.js
   Populates pages/videos.html from the club's YouTube playlist:
   https://www.youtube.com/playlist?list=PLzhU3D81Vqn5aiBIDDB121c6B41iHSMFC

   Clicking a thumbnail opens an EXPANDED in-page player (a modal overlay)
   and autoplays — the user watches without leaving the site. The overlay
   is styled inline (in JS), so it works even if css/styles.css is stale or
   cached, and even when the page is opened directly from disk (file://).
   NOTE: YouTube blocks embedded playback on file:// (Error 153) — it plays
   on http/https. A "Watch on YouTube" link is provided as a fallback.

   AUTO-SYNC: the grid is built from the LIVE playlist via
   /youtube-playlist.php — update the playlist on YouTube and the site
   follows, no code changes needed. The VIDEOS array below is only a
   fallback for when that endpoint can't be reached (file:// preview, no
   PHP, or YouTube unreachable), so it's worth keeping roughly current.
   Videos are shown newest -> oldest.
   ========================================================= */

(function () {
  'use strict';

  const ROOT = location.pathname.includes('/pages/') ? '../' : '';
  const ENDPOINT = ROOT + 'youtube-playlist.php';

  // Fallback list, used until/unless the live playlist loads (file://
  // preview, no PHP, or YouTube unreachable). Newest -> oldest.
  let VIDEOS = [
    { id: 'qkCXyireSpQ', title: 'Breakfast with Gov. Babajide Sanwo-Olu on Share the Road', date: 'Jul 2026' },
    { id: 'uIL3tXhVr34', title: 'Mabogs Crit — LTV Coverage',             date: 'Jul 2026' },
    { id: 'LPFBZSHsIRU', title: 'Cycology Road Sweepers 2026',            date: 'May 2026' },
    { id: '-kJcUxiI0x0', title: 'Cycology — Share the Road',              date: 'May 2026' },
    { id: '-5RpJT4ArbI', title: 'Amazon Ride 2025',                       date: 'May 2026' },
    { id: 'h76HgNp3RkY', title: 'HC Health Speech',                       date: 'Sep 2020' },
    { id: 'wiyzjW0wFCM', title: 'Zoom Webinar — Cycology',                date: 'Sep 2020' },
    { id: 'Zf2IOHtAo2c', title: 'Cycology',                               date: 'Sep 2020' },
    { id: 'jSFZJMoQirQ', title: 'Cycology Rebrand 2018',                  date: 'Sep 2018' },
    { id: 'ayJv28Sk9I8', title: 'Cycology Criterium 2016 — Eko Atlantic', date: 'Sep 2018' },
    { id: 'jxoYbO34-ZA', title: 'LCC 2017 — 1 Min Highlight',             date: 'Sep 2018' },
    { id: 'q9YWfiYtwCw', title: 'Lagos City Crit 2017',                   date: 'Sep 2018' },
    { id: 'iAZ4LCD3chs', title: 'Cycology Riding Club — Passion to Portfolio', date: 'Sep 2018' }
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const thumb = (id) => 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';

  // ---- Grid of thumbnail cards ----
  function render(container, limit) {
    if (!VIDEOS.length) {
      container.innerHTML = '<p class="gallery-empty">No videos yet.</p>';
      return;
    }
    // Featured grids show only the first `limit` (newest) videos. The slice
    // keeps indexes 0..limit-1, so data-index still maps into VIDEOS.
    const list = limit ? VIDEOS.slice(0, limit) : VIDEOS;
    container.innerHTML = list.map((v, i) => `
      <article class="video-card">
        <div class="frame" role="button" tabindex="0" data-index="${i}"
             aria-label="Play video: ${esc(v.title)}">
          <img src="${thumb(v.id)}" alt="${esc(v.title)}" loading="lazy" />
          <span class="play" aria-hidden="true">&#9654;</span>
        </div>
        <div class="info">
          <h3>${esc(v.title)}</h3>
          <span class="video-date">${esc(v.date)}</span>
        </div>
      </article>`).join('');

    container.querySelectorAll('.frame').forEach((frame) => {
      const open = () => openModal(parseInt(frame.dataset.index, 10));
      frame.addEventListener('click', open);
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }

  // ---- Expanded modal player (self-contained, inline-styled) ----
  let modal = null, frameEl = null, titleEl = null, linkEl = null;
  let idx = 0;

  function makeBtn(label, aria, extraCss) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', aria);
    b.innerHTML = label;
    b.style.cssText = 'position:absolute;border:0;color:#fff;cursor:pointer;line-height:1;z-index:1;' + extraCss;
    return b;
  }

  function buildModal() {
    modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video player');
    modal.style.cssText =
      'position:fixed;inset:0;z-index:2000;display:none;align-items:center;' +
      'justify-content:center;background:rgba(8,10,14,.94);padding:5vh 4vw;box-sizing:border-box;';

    const stage = document.createElement('div');
    stage.style.cssText = 'width:min(1100px,94vw);';

    frameEl = document.createElement('div');
    frameEl.style.cssText =
      'position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;' +
      'overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.55);';

    titleEl = document.createElement('p');
    titleEl.style.cssText = 'color:#fff;text-align:center;margin:1rem 0 .25rem;font-size:1.05rem;font-weight:600;';

    linkEl = document.createElement('a');
    linkEl.target = '_blank';
    linkEl.rel = 'noopener';
    linkEl.textContent = 'Trouble playing? Watch on YouTube ↗';
    linkEl.style.cssText = 'display:block;text-align:center;color:rgba(255,255,255,.78);font-size:.85rem;';

    stage.appendChild(frameEl);
    stage.appendChild(titleEl);
    stage.appendChild(linkEl);

    const closeBtn = makeBtn('&times;', 'Close player', 'top:.4rem;right:1.25rem;background:none;font-size:2.6rem;padding:.2rem .5rem;');
    const navCss = 'top:50%;transform:translateY(-50%);width:3rem;height:3rem;border-radius:50%;' +
      'background:rgba(255,255,255,.15);font-size:2.2rem;display:grid;place-items:center;';
    const prevBtn = makeBtn('&lsaquo;', 'Previous video', navCss + 'left:1rem;');
    const nextBtn = makeBtn('&rsaquo;', 'Next video', navCss + 'right:1rem;');

    modal.appendChild(closeBtn);
    modal.appendChild(prevBtn);
    modal.appendChild(stage);
    modal.appendChild(nextBtn);
    document.body.appendChild(modal);

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showVideo(idx - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showVideo(idx + 1); });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', onKey);
  }

  function showVideo(n) {
    idx = (n + VIDEOS.length) % VIDEOS.length;
    const v = VIDEOS[idx];
    frameEl.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(v.id) +
      '?autoplay=1&rel=0&playsinline=1" title="' + esc(v.title) + '" ' +
      'style="position:absolute;inset:0;width:100%;height:100%;border:0;" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen></iframe>';
    titleEl.textContent = v.title;
    linkEl.href = 'https://www.youtube.com/watch?v=' + v.id;
  }

  function openModal(n) {
    if (!modal) buildModal();
    showVideo(n);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    frameEl.innerHTML = ''; // stops playback / audio
    document.body.style.overflow = '';
  }

  function onKey(e) {
    if (!modal || modal.style.display === 'none') return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') showVideo(idx - 1);
    else if (e.key === 'ArrowRight') showVideo(idx + 1);
  }

  // ---- Live sync from the YouTube playlist ----
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  // Every video grid on the page (full page + any featured homepage grid).
  const TARGETS = [];
  function renderAll() { TARGETS.forEach((t) => render(t.el, t.limit)); }

  async function syncFromPlaylist() {
    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      if (!res.ok) return;

      // If PHP isn't executing, the raw .php source comes back — not JSON.
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!ct.includes('json')) return;

      const data = await res.json();
      if (!data || !Array.isArray(data.videos) || !data.videos.length) return;

      VIDEOS = data.videos.map((v) => ({
        id: v.id,
        title: v.title,
        date: fmtDate(v.published)
      }));
      renderAll(); // re-render every grid with the live playlist
    } catch (_) {
      /* offline / file:// / no PHP — keep the built-in list */
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const full = document.querySelector('[data-video-grid]');            // videos page
    const feat = document.querySelector('[data-video-featured]');        // homepage
    if (full) TARGETS.push({ el: full, limit: 0 });
    if (feat) TARGETS.push({ el: feat, limit: parseInt(feat.dataset.videoFeatured, 10) || 3 });
    if (!TARGETS.length) return;
    renderAll();          // instant paint from the built-in list
    syncFromPlaylist();   // then refresh from the live playlist
  });
})();
