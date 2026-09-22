/* =========================================================
   Cycology — admin-submissions.js
   Drives pages/admin-submissions.html: browse, filter, read and
   delete form submissions, and download them as CSV or Excel.
   Talks to /api/submissions.php.

   Access is a signed-in admin session (pages/admin-login.html).
   Downloads go through fetch() rather than a plain link so they
   ride the same session cookie — no token ever appears in a URL
   or in the browser's history.
   ========================================================= */

(function () {
  'use strict';

  const A         = window.CycologyAdmin;
  const ROOT      = A.ROOT;
  const ENDPOINT  = 'api/submissions.php';
  const PAGE_SIZE = 50;

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const panelMsg     = $('#panel-msg');
  const tbody        = $('#sub-table tbody');
  const tabs         = $('#form-tabs');
  const detail       = $('#detail');

  let rows   = [];
  let forms  = {};
  let state  = { form: '', q: '', from: '', to: '', offset: 0, total: 0 };

  // ---- helpers ----
  function note(el, text, isError) {
    el.textContent = text || '';
    el.classList.toggle('admin-error', !!isError);
  }
  function query(extra) {
    const p = new URLSearchParams();
    if (state.form) p.set('form', state.form);
    if (state.q)    p.set('q', state.q);
    if (state.from) p.set('from', state.from);
    if (state.to)   p.set('to', state.to);
    Object.entries(extra || {}).forEach(([k, v]) => p.set(k, v));
    return p.toString() ? '?' + p.toString() : '';
  }
  const api = (method, qs) => A.api(method, ENDPOINT + (qs || ''));
  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s.replace(' ', 'T'));
    return isNaN(d) ? s : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ---- load + render ----
  async function load() {
    note(panelMsg, 'Loading…');
    try {
      const data = await api('GET', query({ limit: PAGE_SIZE, offset: state.offset }));
      rows        = data.submissions;
      forms       = data.forms || {};
      state.total = data.total;
      renderTabs();
      renderRows();
      renderPager();
      note(panelMsg, data.total === 0 ? 'Nothing here yet.' : '');
    } catch (err) {
      note(panelMsg, err.message, true);
    }
  }

  function renderTabs() {
    const all = Object.values(forms).reduce((n, f) => n + f.total, 0);
    const btn = (key, label, count) =>
      `<button type="button" class="admin-tab${state.form === key ? ' is-active' : ''}" data-form="${esc(key)}">
         ${esc(label)} <span class="admin-tab-count">${count}</span>
       </button>`;
    tabs.innerHTML = btn('', 'All', all) +
      Object.entries(forms).map(([k, f]) => btn(k, f.title, f.total)).join('');
  }

  function renderRows() {
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">No submissions match these filters.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr data-id="${r.id}">
        <td>${esc(fmtDate(r.created_at))}</td>
        <td>${esc(forms[r.form] ? forms[r.form].title : r.form)}</td>
        <td class="admin-title">${esc(r.name) || '—'}</td>
        <td>${r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : '—'}</td>
        <td>${esc(r.phone) || '—'}</td>
        <td>${Number(r.emailed) ? '<span class="admin-status is-published">sent</span>'
                                : '<span class="admin-status is-draft">not sent</span>'}</td>
        <td class="admin-actions-col">
          <button type="button" class="btn btn-dark btn-sm" data-act="view">View</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="delete">Delete</button>
        </td>
      </tr>`).join('');
  }

  function renderPager() {
    const pager = $('#pager');
    pager.hidden = state.total <= PAGE_SIZE;
    const first = state.total ? state.offset + 1 : 0;
    const last  = Math.min(state.offset + PAGE_SIZE, state.total);
    $('#pager-label').textContent = `${first}–${last} of ${state.total}`;
    $('#btn-prev').disabled = state.offset === 0;
    $('#btn-next').disabled = state.offset + PAGE_SIZE >= state.total;
  }

  // ---- interactions ----
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-form]');
    if (!b) return;
    state.form = b.dataset.form;
    state.offset = 0;
    load();
  });

  $('#btn-apply').addEventListener('click', () => {
    state.q = $('#f-q').value.trim();
    state.from = $('#f-from').value;
    state.to = $('#f-to').value;
    state.offset = 0;
    load();
  });
  $('#btn-clear').addEventListener('click', () => {
    $('#f-q').value = ''; $('#f-from').value = ''; $('#f-to').value = '';
    state.q = state.from = state.to = ''; state.offset = 0;
    load();
  });
  $('#f-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-apply').click(); });

  $('#btn-prev').addEventListener('click', () => { state.offset = Math.max(0, state.offset - PAGE_SIZE); load(); });
  $('#btn-next').addEventListener('click', () => { state.offset += PAGE_SIZE; load(); });

  tbody.addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const id = parseInt(b.closest('tr').dataset.id, 10);

    if (b.dataset.act === 'view') {
      try { openDetail(await api('GET', '?id=' + id)); }
      catch (err) { note(panelMsg, err.message, true); }
    } else {
      const row = rows.find((r) => r.id === id);
      if (!confirm('Delete this submission from ' + (row && row.name ? row.name : 'this person') + '? This cannot be undone.')) return;
      note(panelMsg, 'Deleting…');
      try { await api('DELETE', '?id=' + id); await load(); note(panelMsg, 'Deleted.'); }
      catch (err) { note(panelMsg, err.message, true); }
    }
  });

  // ---- detail dialog ----
  function openDetail(row) {
    $('#detail-title').textContent = row.name || 'Submission';
    $('#detail-meta').textContent =
      [forms[row.form] ? forms[row.form].title : row.form, fmtDate(row.created_at),
       Number(row.emailed) ? 'emailed' : 'NOT emailed'].join(' · ');
    $('#detail-body').innerHTML = (row.fields || [])
      .map((f) => `<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('');

    const reply = $('#detail-reply');
    if (row.email) {
      reply.hidden = false;
      reply.href = 'mailto:' + row.email + '?subject=' + encodeURIComponent('Re: your message to Cycology');
    } else {
      reply.hidden = true;
    }
    if (typeof detail.showModal === 'function') detail.showModal(); else detail.setAttribute('open', '');
  }
  $('#detail-close').addEventListener('click', () => {
    if (typeof detail.close === 'function') detail.close(); else detail.removeAttribute('open');
  });

  // ---- downloads ----
  async function download(type) {
    const btn = type === 'csv' ? $('#btn-csv') : $('#btn-xlsx');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Preparing…';
    note(panelMsg, '');
    try {
      const res = await fetch(ROOT + ENDPOINT + query({ export: type }), { credentials: 'same-origin' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || ('Download failed (' + res.status + ')'));
      }
      // Filename comes from the server's Content-Disposition.
      const cd = res.headers.get('Content-Disposition') || '';
      const m  = /filename="([^"]+)"/.exec(cd);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = m ? m[1] : 'cycology-submissions.' + type;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      note(panelMsg, 'Downloaded ' + a.download);
    } catch (err) {
      note(panelMsg, err.message, true);
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  }
  $('#btn-csv').addEventListener('click', () => download('csv'));
  $('#btn-xlsx').addEventListener('click', () => download('xlsx'));

  // ---- boot ----
  (async () => {
    await A.guard();          // redirects to the login page when signed out
    A.shell('forms');
    // Allow a deep link from the dashboard: admin-submissions.html?form=membership
    const preset = new URLSearchParams(location.search).get('form');
    if (preset) state.form = preset;
    load();
  })();
})();
