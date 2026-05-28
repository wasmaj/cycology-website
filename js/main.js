/* =========================================================
   Cycology — main.js
   Single source of truth for the header, footer, navigation,
   hero carousel, FAQ accordion, scroll reveal, and forms.
   Edit the HEADER and FOOTER constants below to change every
   page at once.
   ========================================================= */

(function () {
  'use strict';

  // ---------- helpers ----------
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Resolve the path prefix so /pages/* can link back to root assets
  const inPagesDir = location.pathname.includes('/pages/');
  const ROOT = inPagesDir ? '../' : '';

  // ---------- Shared header markup ----------
  const HEADER_HTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" role="banner">
    <div class="container nav-wrap">
      <a class="brand" href="${ROOT}index.html" aria-label="Cycology home">
        <span class="brand-mark" aria-hidden="true">C</span>
        <span>CYCOLOGY</span>
      </a>

      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">
        <span></span>
      </button>

      <nav aria-label="Primary">
        <ul id="primary-nav" class="nav-list">
          <li><a href="${ROOT}index.html">Home</a></li>
          <li class="has-sub">
            <a href="${ROOT}pages/about-us.html">About Us</a>
            <ul class="subnav">
              <li><a href="${ROOT}pages/about-us.html">About Us</a></li>
              <li><a href="${ROOT}pages/csr.html">CSR</a></li>
              <li><a href="${ROOT}pages/board-of-trustees.html">Board of Trustees</a></li>
              <li><a href="${ROOT}pages/club-executives.html">Club Executives</a></li>
              <li><a href="${ROOT}pages/sponsors.html">Sponsors / Partners</a></li>
            </ul>
          </li>
          <li class="has-sub">
            <a href="${ROOT}pages/gallery.html">Events</a>
            <ul class="subnav">
              <li><a href="${ROOT}pages/gallery.html">Gallery</a></li>
              <li><a href="${ROOT}pages/videos.html">Videos</a></li>
            </ul>
          </li>
          <li class="has-sub">
            <a href="${ROOT}pages/organizing-rides.html">How We Ride</a>
            <ul class="subnav">
              <li><a href="${ROOT}pages/organizing-rides.html">Organizing Rides</a></li>
              <li><a href="${ROOT}pages/safety.html">Safety</a></li>
              <li><a href="${ROOT}pages/code-of-conduct.html">Code of Conduct</a></li>
            </ul>
          </li>
          <li><a href="${ROOT}pages/share-the-road.html">Share the Road</a></li>
          <li><a href="${ROOT}pages/faq.html">FAQ</a></li>
          <li><a href="${ROOT}pages/shop.html">Shop</a></li>
          <li><a href="${ROOT}pages/blog.html">Blog</a></li>
          <li><a href="${ROOT}pages/contact-us.html">Contact</a></li>
          <li class="nav-cta"><a class="btn btn-primary" href="${ROOT}pages/enquiry-form.html">Become a Member</a></li>
        </ul>
      </nav>
    </div>
  </header>`;

  // ---------- Shared footer markup ----------
  const FOOTER_HTML = `
  <section class="newsletter" aria-label="Newsletter">
    <div class="container section">
      <div class="inner">
        <div>
          <h2>Join the ride. Stay in the loop.</h2>
          <p>Get ride updates, safety tips and event news from Cycology, straight to your inbox.</p>
        </div>
        <form onsubmit="event.preventDefault(); this.querySelector('button').textContent='Subscribed ✓';">
          <input type="email" required placeholder="your@email.com" aria-label="Email address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  </section>

  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand brand--footer" href="${ROOT}index.html">
            <span class="brand-mark" aria-hidden="true">C</span>
            <span>CYCOLOGY</span>
          </a>
          <p>A not-for-profit cycling club established in 2011. Our vision is to create a global platform for promoting cycling as a tool for a healthy lifestyle and social development.</p>
          <div class="social-row" aria-label="Social media">
            <a href="https://facebook.com/Cycologycyclingclub/" target="_blank" rel="noopener" aria-label="Facebook">f</a>
            <a href="https://instagram.com/cycologycc/" target="_blank" rel="noopener" aria-label="Instagram">IG</a>
            <a href="https://twitter.com/cycologycc" target="_blank" rel="noopener" aria-label="Twitter / X">X</a>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul class="footer-links">
            <li><a href="${ROOT}index.html">Home</a></li>
            <li><a href="${ROOT}pages/about-us.html">About Us</a></li>
            <li><a href="${ROOT}pages/blog.html">Blog</a></li>
            <li><a href="${ROOT}pages/gallery.html">Events</a></li>
            <li><a href="${ROOT}pages/shop.html">Shop</a></li>
          </ul>
        </div>
        <div>
          <h4>Ride With Us</h4>
          <ul class="footer-links">
            <li><a href="${ROOT}pages/organizing-rides.html">Organizing Rides</a></li>
            <li><a href="${ROOT}pages/safety.html">Safety</a></li>
            <li><a href="${ROOT}pages/code-of-conduct.html">Code of Conduct</a></li>
            <li><a href="${ROOT}pages/share-the-road.html">Share the Road</a></li>
            <li><a href="${ROOT}pages/faq.html">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4>Members</h4>
          <ul class="footer-links">
            <li><a href="${ROOT}pages/enquiry-form.html">Become a Member</a></li>
            <li><a href="${ROOT}pages/sign-in.html">Sign In</a></li>
            <li><a href="${ROOT}pages/waiver-form.html">Waiver Form</a></li>
            <li><a href="${ROOT}pages/contact-us.html">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year"></span> Cycology Cycling Club. All rights reserved.</span>
        <span>Lagos, Nigeria</span>
      </div>
    </div>
  </footer>`;

  // ---------- Inject header & footer ----------
  function mountChrome() {
    const headerSlot = $('#site-header');
    const footerSlot = $('#site-footer');
    if (headerSlot) headerSlot.innerHTML = HEADER_HTML;
    if (footerSlot) footerSlot.innerHTML = FOOTER_HTML;

    const yEl = $('#year');
    if (yEl) yEl.textContent = new Date().getFullYear();

    // Highlight current page in nav
    const here = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-list a').forEach((a) => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === here) {
        a.style.color = 'var(--color-primary)';
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // ---------- Mobile nav ----------
  function bindNav() {
    const toggle = $('.menu-toggle');
    const list   = $('#primary-nav');
    if (!toggle || !list) return;

    toggle.addEventListener('click', () => {
      const open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Submenu open on tap (mobile)
    $$('.nav-list .has-sub > a').forEach((a) => {
      a.addEventListener('click', (e) => {
        if (window.matchMedia('(max-width: 980px)').matches) {
          e.preventDefault();
          a.parentElement.classList.toggle('open');
        }
      });
    });
  }

  // ---------- Hero carousel ----------
  // Drives both the original .hero and the new editorial .hero--classic.
  // Auto-advance interval matches the CSS @keyframes heroFill duration.
  function bindHero() {
    const hero = $('.hero');
    if (!hero) return;

    const slides   = $$('.hero-slide', hero);
    const dotsWrap = $('.hero-dots', hero);
    const arrows   = $$('.hero-arrow', hero);
    const numCur   = $('.hero-num-current', hero);
    const numTot   = $('.hero-num-total', hero);
    const progress = $('.hero-progress', hero);

    if (slides.length < 2) return;

    const SLIDE_MS = 7000;        // keep in sync with @keyframes heroFill
    let idx = 0;
    let timer;

    // --- Pad helper for "01 / 02 / 03" ---
    const pad = (n) => String(n).padStart(2, '0');
    if (numTot) numTot.textContent = pad(slides.length);

    // --- Build accessible dot fallback ---
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) b.classList.add('is-active');
        b.addEventListener('click', () => go(i));
        dotsWrap.appendChild(b);
      });
    }

    // --- Wire prev/next arrows ---
    arrows.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir === 'prev' ? -1 : 1;
        go(idx + dir);
      });
    });

    // --- Restart the CSS progress-bar animation ---
    function restartProgress() {
      if (!progress) return;
      progress.classList.remove('is-running');
      // Force reflow so the animation actually restarts
      void progress.offsetWidth;
      progress.classList.add('is-running');
    }

    function render() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      if (dotsWrap) {
        $$('button', dotsWrap).forEach((b, i) =>
          b.classList.toggle('is-active', i === idx)
        );
      }
      if (numCur) numCur.textContent = pad(idx + 1);
      restartProgress();
    }

    function go(n) {
      idx = (n + slides.length) % slides.length;
      render();
      reset();
    }
    function next()  { go(idx + 1); }
    function reset() { clearInterval(timer); timer = setInterval(next, SLIDE_MS); }

    // --- Pause auto-play on hover/focus (UX courtesy) ---
    function pause()  { clearInterval(timer); if (progress) progress.classList.remove('is-running'); }
    function resume() { reset(); restartProgress(); }
    hero.addEventListener('mouseenter', pause);
    hero.addEventListener('mouseleave', resume);
    hero.addEventListener('focusin',  pause);
    hero.addEventListener('focusout', resume);

    // --- Keyboard navigation (← → on focused hero) ---
    hero.setAttribute('tabindex', '-1');
    hero.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });

    // --- Touch / swipe support ---
    let touchX = null;
    hero.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    render();
    reset();
  }

  // ---------- Scroll reveal ----------
  function bindReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  // ---------- Auto-loading gallery ----------
  // For each <div class="gallery-grid" data-gallery-event="slug">, fetch
  // /gallery.php?event=slug and render the images found in the folder.
  // If PHP isn't available (local preview, static-only host), falls back
  // to /images/gallery/<slug>/manifest.json — which may contain either
  // filenames (resolved against the folder) or absolute http(s) URLs.
  async function bindGallery() {
    const containers = $$('[data-gallery-event]');
    if (!containers.length) return;

    for (const container of containers) {
      const slug = container.dataset.galleryEvent;
      if (!slug) continue;

      let images = null;
      let basePath = `${ROOT}images/gallery/${slug}`;
      let phpSucceeded = false;

      // 1) Try the PHP scanner (deployed path).
      try {
        const res = await fetch(`${ROOT}gallery.php?event=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (res.ok) {
          // Detect "raw .php file returned" — happens when PHP isn't executing
          // (local preview, file:// protocol, static host). Content-Type will
          // not be application/json in that case.
          const ct = (res.headers.get('content-type') || '').toLowerCase();
          if (ct.includes('json')) {
            const data = await res.json();
            if (Array.isArray(data.images)) {
              images = data.images;
              basePath = `${ROOT}${data.path}`;
              phpSucceeded = true;
            }
          }
        }
      } catch (_) { /* PHP unreachable — fall through to manifest */ }

      // 2) Fallback: manifest.json inside the event folder.
      if (!phpSucceeded) {
        try {
          const res = await fetch(`${basePath}/manifest.json`, { cache: 'no-store' });
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) images = list;
          }
        } catch (_) { /* no manifest either — render empty state */ }
      }

      renderGallery(container, slug, basePath, images);
    }
  }

  function renderGallery(container, slug, basePath, images) {
    // Nothing returned at all (no PHP + no manifest)
    if (images === null) {
      container.innerHTML = `
        <p class="gallery-empty">
          <strong>No photos to show yet.</strong><br/>
          Drop image files into <code>/images/gallery/${slug}/</code> and they'll appear here automatically once the site is deployed.
          <br/><br/>
          <small>Previewing locally? Add a <code>manifest.json</code> in that folder listing filenames or image URLs — see <code>/images/README.md</code>.</small>
        </p>`;
      return;
    }

    // Successfully reached the source, but it's empty
    if (images.length === 0) {
      container.innerHTML = `
        <p class="gallery-empty">
          <strong>This album is empty.</strong><br/>
          Drop image files into <code>/images/gallery/${slug}/</code> and they'll appear here automatically.
        </p>`;
      return;
    }

    const prettyName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const html = images.map((entry, i) => {
      // Allow manifest entries to be either filenames OR absolute URLs.
      const isAbsoluteUrl = /^https?:\/\//i.test(entry);
      const src = isAbsoluteUrl
        ? entry
        : `${basePath}/${encodeURIComponent(entry).replace(/%2F/g, '/')}`;
      return `
        <figure class="gallery-item">
          <img src="${src}"
               alt="${prettyName} — photo ${i + 1}"
               loading="lazy" decoding="async" />
        </figure>`;
    }).join('');
    container.innerHTML = html;
  }

  // ---------- Contact form (client-side only) ----------
  function bindForms() {
    $$('form[data-fake-submit]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.textContent = 'Sent ✓'; btn.disabled = true; }
        const note = form.querySelector('.form-note');
        if (note) note.textContent = 'Thanks — your message has been queued. (Connect a backend or service like Formspree to deliver.)';
      });
    });
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    mountChrome();
    bindNav();
    bindHero();
    bindReveal();
    bindForms();
    bindGallery();
  });
})();
