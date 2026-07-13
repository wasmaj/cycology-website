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

   Videos are listed newest -> oldest. TO ADD/REORDER: edit the VIDEOS
   array below (keep it newest first). `id` is the YouTube video id.
   ========================================================= */

(function () {
  'use strict';

  // Newest -> oldest (by YouTube publish date).
  const VIDEOS = [
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
  function render(container) {
    if (!VIDEOS.length) {
      container.innerHTML = '<p class="gallery-empty">No videos yet.</p>';
      return;
    }
    container.innerHTML = VIDEOS.map((v, i) => `
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

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('[data-video-grid]');
    if (container) render(container);
  });
})();
