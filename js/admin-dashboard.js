/* =========================================================
   Cycology — admin-dashboard.js
   The admin home screen: headline numbers, quick actions,
   recent activity, and a change-password form. Reads
   /api/dashboard.php; the session guard lives in admin-auth.js.
   ========================================================= */

(function () {
  'use strict';

  const A = window.CycologyAdmin;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function note(el, msg, isError) {
    el.textContent = msg || '';
    el.classList.toggle('admin-error', !!isError);
  }
  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(String(s).replace(' ', 'T'));
    return isNaN(d) ? s : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function greet() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }

  function statCard(value, label, href, tone) {
    return `<a class="stat-card${tone ? ' is-' + tone : ''}" href="${href}">
              <span class="stat-value">${esc(value)}</span>
              <span class="stat-label">${esc(label)}</span>
            </a>`;
  }

  function render(d) {
    // ---- anything not set up yet ----
    $('#setup-warnings').innerHTML = (d.setup || []).map((s) =>
      `<p class="admin-callout"><strong>${esc(s.what)}</strong> isn’t set up yet —
       run <code>${esc(s.sql)}</code> in phpMyAdmin to enable it.</p>`).join('');

    // ---- headline numbers ----
    const cards = [];
    if (d.submissions) {
      cards.push(statCard(d.submissions.total, 'Submissions in total', 'admin-submissions.html'));
      cards.push(statCard(d.submissions.this_week, 'In the last 7 days', 'admin-submissions.html'));
      (d.submissions.forms || []).forEach((f) =>
        cards.push(statCard(f.total, f.title, 'admin-submissions.html?form=' + encodeURIComponent(f.key))));
      if (d.submissions.not_emailed > 0) {
        cards.push(statCard(d.submissions.not_emailed, 'Saved but NOT emailed', 'admin-submissions.html', 'warn'));
      }
    }
    if (d.publications) {
      cards.push(statCard(d.publications.published, 'Published posts', 'admin-publications.html'));
      if (d.publications.draft > 0) cards.push(statCard(d.publications.draft, 'Drafts', 'admin-publications.html'));
    }
    $('#stats').innerHTML = cards.join('');

    // ---- recent submissions ----
    const subs = (d.submissions && d.submissions.recent) || [];
    $('#recent-submissions').innerHTML = subs.length
      ? subs.map((r) => `
          <a class="dash-item" href="admin-submissions.html">
            <span class="dash-item-main">
              <strong>${esc(r.name || r.email || 'Anonymous')}</strong>
              <span>${esc(r.form === 'membership' ? 'Membership application' : 'Contact message')}</span>
            </span>
            <span class="dash-item-date">${esc(fmtDate(r.created_at))}</span>
          </a>`).join('')
      : '<p class="gallery-empty">Nothing yet.</p>';

    // ---- recent posts ----
    const posts = (d.publications && d.publications.recent) || [];
    $('#recent-posts').innerHTML = posts.length
      ? posts.map((p) => `
          <a class="dash-item" href="admin-publications.html">
            <span class="dash-item-main">
              <strong>${esc(p.title)}</strong>
              <span class="admin-status is-${esc(p.status)}">${esc(p.status)}</span>
            </span>
            <span class="dash-item-date">${esc(fmtDate(p.published_at))}</span>
          </a>`).join('')
      : '<p class="gallery-empty">No posts yet — write your first one.</p>';
  }

  // ---- change password ----
  $('#password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#p-btn');
    btn.disabled = true; btn.textContent = 'Saving…';
    note($('#p-msg'), '');
    try {
      await A.api('POST', 'api/auth.php', {
        action: 'password',
        current: $('#p-current').value,
        password: $('#p-new').value
      });
      $('#password-form').reset();
      note($('#p-msg'), 'Password changed.');
    } catch (err) {
      note($('#p-msg'), err.fields ? Object.values(err.fields).join(' · ') : err.message, true);
    } finally {
      btn.disabled = false; btn.textContent = 'Change password';
    }
  });

  // ---- boot ----
  (async () => {
    const user = await A.guard();
    A.shell('home');
    $('#greeting').textContent = greet() + (user.name ? ', ' + user.name.split(' ')[0] : '');
    try {
      render(await A.api('GET', 'api/dashboard.php'));
      note($('#dash-msg'), '');
    } catch (err) {
      note($('#dash-msg'), err.message, true);
    }
  })();
})();
