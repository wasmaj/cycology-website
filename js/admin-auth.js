/* =========================================================
   Cycology — admin-auth.js
   Shared by every admin screen. Provides window.CycologyAdmin:

     guard()      → resolves with the signed-in user, or sends the
                    browser to the login page and never resolves
     api(method, url, body) → fetch wrapper that throws on error
                    and bounces to the login page on a 401
     shell(active) → renders the admin nav bar + sign-out button
     logout()

   Auth is a normal PHP session cookie set by api/auth.php, so
   there is no token to paste or store in the browser.
   ========================================================= */

(function () {
  'use strict';

  const ROOT  = location.pathname.includes('/pages/') ? '../' : '';
  const LOGIN = ROOT + 'pages/admin-login.html';

  let user = null;

  async function api(method, url, body) {
    const opts = { method, credentials: 'same-origin', headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(ROOT + url, opts);
    let data;
    try { data = await res.json(); } catch (_) { data = { error: 'Unexpected response from the server' }; }

    if (res.status === 401 && !/admin-login/.test(location.pathname)) {
      location.replace(LOGIN + '?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
      await new Promise(() => {});           // stop the caller dead while we navigate
    }
    if (!res.ok) {
      const err = new Error(data.error || ('Request failed (' + res.status + ')'));
      err.status = res.status;
      err.fields = data.fields || null;
      throw err;
    }
    return data;
  }

  /** Resolve with the signed-in user, or redirect to the login page. */
  async function guard() {
    let data;
    try {
      data = await api('GET', 'api/auth.php?action=me');
    } catch (err) {
      // The database or tables aren't ready — say so rather than loop.
      document.body.innerHTML =
        '<div style="max-width:640px;margin:15vh auto;padding:0 1.25rem;font-family:system-ui,sans-serif">' +
        '<h1 style="font-size:1.5rem">Admin unavailable</h1><p>' + String(err.message) +
        '</p><p><a href="' + ROOT + 'index.html">← Back to the site</a></p></div>';
      await new Promise(() => {});
    }
    if (!data.user) {
      location.replace(LOGIN + (data.needs_setup ? '?setup=1' : '?next=' +
        encodeURIComponent(location.pathname.split('/').pop() + location.search)));
      await new Promise(() => {});
    }
    user = data.user;
    return user;
  }

  async function logout() {
    try { await api('POST', 'api/auth.php', { action: 'logout' }); } catch (_) {}
    location.replace(LOGIN);
  }

  /** Nav bar shared by the admin screens. `active` = 'home'|'posts'|'forms'. */
  function shell(active) {
    const host = document.getElementById('admin-shell');
    if (!host) return;
    const link = (key, href, label) =>
      `<a class="admin-nav-link${active === key ? ' is-active' : ''}" href="${href}">${label}</a>`;

    host.innerHTML = `
      <div class="admin-bar">
        <div class="container admin-bar-inner">
          <nav class="admin-nav" aria-label="Admin sections">
            ${link('home',  'admin.html',              'Dashboard')}
            ${link('posts', 'admin-publications.html', 'Blog posts')}
            ${link('forms', 'admin-submissions.html',  'Form submissions')}
          </nav>
          <div class="admin-bar-user">
            <span>Signed in as <strong>${(user && (user.name || user.username)) || ''}</strong></span>
            <button type="button" class="btn btn-dark btn-sm" id="admin-signout">Sign out</button>
          </div>
        </div>
      </div>`;
    document.getElementById('admin-signout').addEventListener('click', logout);
  }

  window.CycologyAdmin = { api, guard, logout, shell, ROOT, get user() { return user; } };
})();
