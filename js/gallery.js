/* =========================================================
   Cycology — gallery.js
   Album-index gallery, modelled on cycology.com.ng/gallery/.

   - gallery.html  → renders a grid of album cards
                     (cover photo + title + photo count).
   - album.html?album=<slug> → renders that album's photos
                     in a grid with a click-to-zoom lightbox.

   This file is intentionally fetch-free, so the gallery works
   when opened directly from disk (file://), on any static host,
   and on a PHP host alike.

   TO ADD AN ALBUM:
     1. Drop the photos into images/gallery/<slug>/
     2. Add an entry to the ALBUMS array below (newest first).
   TO ADD/REMOVE PHOTOS: update that album's `photos` list.
   ========================================================= */

(function () {
  'use strict';

  const inPagesDir = location.pathname.includes('/pages/');
  const ROOT = inPagesDir ? '../' : '';
  const GALLERY = ROOT + 'images/gallery/';

  // Helper: build a "photo-001.jpg … photo-0NN.jpg" sequence.
  function seq(n) {
    const out = [];
    for (let i = 1; i <= n; i++) out.push('photo-' + String(i).padStart(3, '0') + '.jpg');
    return out;
  }

  // ---- Albums (newest first) ----
  const ALBUMS = [
    {
      slug: 'breakfast-with-gov-sanwo-olu',
      title: 'Breakfast with Gov. Sanwo-Olu',
      // Drop photos into images/gallery/breakfast-with-gov-sanwo-olu/ then list
      // them here (e.g. photos: seq(24) or ['photo-001.jpg', ...]).
      photos: []
    },
    {
      slug: 'cycolobration-2025',
      title: 'Cycolobration 2025',
      photos: [
        'DSC00930.jpg', 'DSC00943.jpg', 'DSC01291.jpg', 'DSC01308.jpg',
        'DSC01419.jpg', 'DSC01556.jpg', 'photo-001.jpg', 'photo-002.jpg'
      ]
    },
    {
      slug: 'world-bicycle-day-2025',
      title: 'World Bicycle Day 2025',
      // Drop photos into images/gallery/world-bicycle-day-2025/ then list them
      // here (e.g. photos: seq(24) or ['photo-001.jpg', ...]).
      photos: []
    },
    {
      slug: 'cycology-amazon-crit-2025',
      title: 'Cycology Amazon Crit 2025',
      photos: seq(48)
    },
    {
      slug: 'cycolobration-2024',
      title: 'Cycolobration 2024',
      photos: [
        '3A8A8051.jpg', '3A8A8092.jpg', '3A8A8129.jpg', '3A8A8135.jpg', '3A8A8149.jpg',
        '3A8A8158.jpg', '3A8A8163.jpg', '3A8A8174.jpg', '3A8A8180.jpg', '3A8A8187.jpg',
        '3A8A8195.jpg', '3A8A8218.jpg', '3A8A8220.jpg', '3A8A8226.jpg', '3A8A8227.jpg',
        '3A8A8228.jpg', '3A8A8233.jpg', '3A8A8236.jpg', '3A8A8240.jpg', '3A8A8261.jpg',
        '3A8A8268.jpg', '3A8A8272.jpg', '3A8A8273.jpg', '3A8A8274.jpg', '3A8A8275.jpg',
        '3A8A8276.jpg', '3A8A8277.jpg', '3A8A8279.jpg', '3A8A8282.jpg', '3A8A8283.jpg',
        '3A8A8284.jpg', '3A8A8285.jpg', '3A8A8286.jpg', '3A8A8290.jpg', '3A8A8292.jpg',
        '3A8A8293.jpg', '3A8A8303.jpg'
      ]
    },
    {
      slug: 'amazon-ride-2023',
      title: 'Cycology Amazon Ride 2023',
      photos: seq(26)
    }
  ];

  ALBUMS.forEach((a) => { a.cover = a.cover || a.photos[0]; });

  const bySlug = (slug) => ALBUMS.find((a) => a.slug === slug);
  const imgPath = (album, file) =>
    GALLERY + album.slug + '/' + encodeURIComponent(file).replace(/%2F/g, '/');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- Album index (gallery.html) ----
  function renderIndex(container) {
    if (!ALBUMS.length) {
      container.innerHTML = '<p class="gallery-empty">No albums yet.</p>';
      return;
    }
    container.innerHTML = ALBUMS.map((a) => {
      const count = a.photos.length;
      const media = a.cover
        ? `<img src="${imgPath(a, a.cover)}" alt="${esc(a.title)} cover photo" loading="lazy" />`
        : '';
      const meta = count ? `${count} Photo${count === 1 ? '' : 's'}` : 'Photos coming soon';
      return `
        <a class="card album-card" href="album.html?album=${encodeURIComponent(a.slug)}">
          <div class="card-media">${media}</div>
          <div class="card-body">
            <h3>${esc(a.title)}</h3>
            <span class="card-meta">${meta}</span>
          </div>
        </a>`;
    }).join('');
  }

  // ---- Album view (album.html?album=slug) ----
  function renderAlbum(container) {
    const slug = new URLSearchParams(location.search).get('album');
    const album = bySlug(slug);
    const titleEl = document.querySelector('[data-album-title]');
    const crumbEl = document.querySelector('[data-album-crumb]');

    if (!album) {
      if (titleEl) titleEl.textContent = 'Album not found';
      container.innerHTML =
        '<p class="gallery-empty"><strong>Sorry, that album doesn’t exist.</strong><br/>' +
        '<a href="gallery.html">← Back to the gallery</a></p>';
      return;
    }

    document.title = album.title + ' — Cycology Cycling Club';
    if (titleEl) titleEl.textContent = album.title;
    if (crumbEl) crumbEl.textContent = album.title;

    if (!album.photos.length) {
      container.innerHTML =
        '<p class="gallery-empty"><strong>Photos coming soon.</strong><br/>' +
        'Check back shortly for pictures from ' + esc(album.title) +
        '. <a href="gallery.html">Back to the gallery</a></p>';
      return;
    }

    container.innerHTML = album.photos.map((file, i) => `
      <figure class="gallery-item" data-index="${i}" tabindex="0" role="button"
              aria-label="View photo ${i + 1} of ${album.photos.length}">
        <img src="${imgPath(album, file)}" alt="${esc(album.title)} — photo ${i + 1}"
             loading="lazy" decoding="async" />
      </figure>`).join('');

    bindLightbox(container, album);
  }

  // ---- Lightbox ----
  function bindLightbox(container, album) {
    let overlay = null;
    let idx = 0;

    function build() {
      overlay = document.createElement('div');
      overlay.className = 'lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close">&times;</button>' +
        '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous photo">&lsaquo;</button>' +
        '<img class="lightbox-img" alt="" />' +
        '<button class="lightbox-nav lightbox-next" type="button" aria-label="Next photo">&rsaquo;</button>' +
        '<div class="lightbox-counter" aria-hidden="true"></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('.lightbox-close').addEventListener('click', close);
      overlay.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
      overlay.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', onKey);
    }

    function show(n) {
      idx = (n + album.photos.length) % album.photos.length;
      const img = overlay.querySelector('.lightbox-img');
      img.src = imgPath(album, album.photos[idx]);
      img.alt = album.title + ' — photo ' + (idx + 1);
      overlay.querySelector('.lightbox-counter').textContent = (idx + 1) + ' / ' + album.photos.length;
    }

    function open(n) {
      if (!overlay) build();
      show(n);
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      if (overlay) overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function onKey(e) {
      if (!overlay || !overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    }

    container.querySelectorAll('.gallery-item').forEach((item) => {
      const openHere = () => open(parseInt(item.dataset.index, 10));
      item.addEventListener('click', openHere);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHere(); }
      });
    });
  }

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', () => {
    const index = document.querySelector('[data-album-index]');
    const view = document.querySelector('[data-album-view]');
    if (index) renderIndex(index);
    if (view) renderAlbum(view);
  });
})();
