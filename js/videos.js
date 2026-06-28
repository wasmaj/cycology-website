/* =========================================================
   Cycology — videos.js
   Populates pages/videos.html from the club's YouTube playlist:
   https://www.youtube.com/playlist?list=PLzhU3D81Vqn5aiBIDDB121c6B41iHSMFC

   Each card shows the YouTube thumbnail; clicking it swaps in the
   embedded player (the iframe only loads on click, so the page stays
   fast and works even when opened directly from disk / file://).

   Videos are listed newest → oldest. TO ADD/REORDER: edit the VIDEOS
   array below (keep it newest first). `id` is the YouTube video id.
   ========================================================= */

(function () {
  'use strict';

  // Newest → oldest (by YouTube publish date).
  const VIDEOS = [
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

  function thumb(id) {
    return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  }

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
      const openIt = () => openModal(parseInt(frame.dataset.index, 10));
      frame.addEventListener('click', openIt);
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIt(); }
      });
    });
  }

  // ---- Expanded modal player ----
  let modal = null;
  let idx = 0;

  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video player');
    modal.innerHTML =
      '<button class="video-modal-close" type="button" aria-label="Close player">&times;</button>' +
      '<button class="lightbox-nav video-modal-prev" type="button" aria-label="Previous video">&lsaquo;</button>' +
      '<div class="video-modal-stage">' +
        '<div class="video-modal-frame"></div>' +
        '<p class="video-modal-title"></p>' +
      '</div>' +
      '<button class="lightbox-nav video-modal-next" type="button" aria-label="Next video">&rsaquo;</button>';
    document.body.appendChild(modal);

    modal.querySelector('.video-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.video-modal-prev').addEventListener('click', (e) => { e.stopPropagation(); showVideo(idx - 1); });
    modal.querySelector('.video-modal-next').addEventListener('click', (e) => { e.stopPropagation(); showVideo(idx + 1); });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', onKey);
  }

  function showVideo(n) {
    const v = VIDEOS[(n + VIDEOS.length) % VIDEOS.length];
    idx = (n + VIDEOS.length) % VIDEOS.length;
    modal.querySelector('.video-modal-frame').innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(v.id) +
      '?autoplay=1&rel=0" title="' + esc(v.title) + '" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen></iframe>';
    modal.querySelector('.video-modal-title').textContent = v.title;
  }

  function openModal(n) {
    if (!modal) buildModal();
    showVideo(n);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    // Clearing the iframe stops playback (and the audio).
    modal.querySelector('.video-modal-frame').innerHTML = '';
    document.body.style.overflow = '';
  }

  function onKey(e) {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') showVideo(idx - 1);
    else if (e.key === 'ArrowRight') showVideo(idx + 1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('[data-video-grid]');
    if (container) render(container);
  });
})();
