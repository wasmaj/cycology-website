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
    container.innerHTML = VIDEOS.map((v) => `
      <article class="video-card">
        <div class="frame" role="button" tabindex="0" data-id="${esc(v.id)}"
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
      const playIt = () => play(frame);
      frame.addEventListener('click', playIt);
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playIt(); }
      });
    });
  }

  function play(frame) {
    const id = frame.dataset.id;
    if (!id || frame.querySelector('iframe')) return;
    const title = frame.getAttribute('aria-label') || '';
    frame.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0" title="' + esc(title) + '" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen></iframe>';
    frame.removeAttribute('role');
    frame.removeAttribute('tabindex');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('[data-video-grid]');
    if (container) render(container);
  });
})();
