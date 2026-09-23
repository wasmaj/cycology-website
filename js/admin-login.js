/* =========================================================
   Cycology — admin-login.js
   Sign-in screen. Shows the normal login, or the first-run
   "create the first admin" form when the database has no
   accounts yet. On success it forwards to ?next= (the page the
   admin was trying to reach) or the dashboard.
   ========================================================= */

(function () {
  'use strict';

  const A = window.CycologyAdmin;
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);

  function note(el, msg, isError) {
    el.textContent = msg || '';
    el.classList.toggle('admin-error', !!isError);
  }

  function go() {
    const next = params.get('next');
    // Only ever forward to a page in this folder — never an absolute URL.
    const safe = next && /^[a-z0-9-]+(\.html)?(\?[^#]*)?$/i.test(next) ? next : 'admin.html';
    location.replace(safe);
  }

  async function boot() {
    let data;
    try {
      data = await A.api('GET', 'api/auth.php?action=me');
    } catch (err) {
      note($('#login-msg'), err.message, true);
      return;
    }
    if (data.user) { go(); return; }              // already signed in

    if (data.needs_setup || params.get('setup')) {
      $('#login-view').hidden = true;
      $('#setup-view').hidden = false;
      $('#s-token').focus();
    }
  }

  // ---- sign in ----
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#login-btn');
    btn.disabled = true; btn.textContent = 'Signing in…';
    note($('#login-msg'), '');
    try {
      await A.api('POST', 'api/auth.php', {
        action: 'login',
        username: $('#username').value.trim(),
        password: $('#password').value
      });
      go();
    } catch (err) {
      note($('#login-msg'), err.message, true);
      btn.disabled = false; btn.textContent = 'Sign in';
      $('#password').value = '';
      $('#password').focus();
    }
  });

  // ---- first-run setup ----
  $('#setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#setup-btn');
    btn.disabled = true; btn.textContent = 'Creating…';
    note($('#setup-msg'), '');
    try {
      await A.api('POST', 'api/auth.php', {
        action: 'setup',
        token: $('#s-token').value,
        username: $('#s-username').value.trim(),
        name: $('#s-name').value.trim(),
        password: $('#s-password').value
      });
      go();
    } catch (err) {
      note($('#setup-msg'), err.fields ? Object.values(err.fields).join(' · ') : err.message, true);
      btn.disabled = false; btn.textContent = 'Create account & sign in';
    }
  });

  boot();
})();
