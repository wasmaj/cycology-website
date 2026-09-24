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

  // ---------- Social channels ----------
  // The club's official profiles, in one place — used by the footer below.
  // Tracking parameters from the shared links (stkn / mibextid / _t / si)
  // are deliberately stripped: they identify whoever copied the link and
  // aren't needed to reach the profile.
  const SOCIALS = [
    { name: 'Instagram', url: 'https://www.instagram.com/cycologycc',
      path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z' },
    { name: 'Facebook', url: 'https://www.facebook.com/share/1EY35fKS3s/',
      path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@cycology.cycling',
      path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
    { name: 'YouTube', url: 'https://www.youtube.com/@cycologycc',
      path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/cycologycc/',
      path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
  ];

  const socialLinks = () => SOCIALS.map((s) => `
            <a href="${s.url}" target="_blank" rel="noopener" aria-label="Cycology on ${s.name}" title="${s.name}">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${s.path}"/></svg>
            </a>`).join('');

  // ---------- Shared header markup ----------
  const HEADER_HTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" role="banner">
    <div class="container nav-wrap">
      <a class="brand" href="${ROOT}index.html" aria-label="Cycology home">
        <img class="brand-mark-img" src="${ROOT}assets/logo-mark.png" alt="" aria-hidden="true" width="108" height="51" />
        <span class="brand-text">CYCOLOGY</span>
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
          <a class="brand brand--footer" href="${ROOT}index.html" aria-label="Cycology home">
            <img class="brand-logo-footer" src="${ROOT}assets/cycology-logo.png" alt="Cycology" width="109" height="72" />
          </a>
          <p>A not-for-profit cycling club established in 2011. Our vision is to create a global platform for promoting cycling as a tool for a healthy lifestyle and social development.</p>
          <div class="social-row" aria-label="Social media">${socialLinks()}
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
        if (window.matchMedia('(max-width: 1100px)').matches) {
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

  // ---------- Forms ----------
  function bindForms() {
    // Forms that email the club. data-mail-form names which one it is
    // ("contact" or "membership"); api/send-form.php maps that to the
    // recipient address — the address is never exposed in the page.
    $$('form[data-mail-form]').forEach((form) => {
      const note = form.querySelector('.form-note');
      const btn  = form.querySelector('button[type="submit"]');
      const say  = (msg, isError) => {
        if (!note) return;
        note.textContent = msg;
        note.style.color = isError ? 'var(--brand-pink)' : 'var(--color-muted)';
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // The forms carry `novalidate` so the browser doesn't block us;
        // run its checks ourselves and show the native messages.
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const payload = { form: form.dataset.mailForm };
        new FormData(form).forEach((v, k) => { payload[k] = v; });

        const label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        say('');

        try {
          const res  = await fetch(ROOT + 'api/send-form.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json().catch(() => ({ error: 'Unexpected response from the server' }));
          if (!res.ok) throw new Error(data.fields ? Object.values(data.fields).join(' · ') : (data.error || 'Something went wrong'));

          form.reset();
          if (btn) btn.textContent = 'Sent ✓';
          say('Thanks — your message is on its way. We’ll be in touch shortly.');
        } catch (err) {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          say(err.message, true);
        }
      });
    });

    // Forms with no backend yet (sign-in, waiver) — acknowledge only.
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
