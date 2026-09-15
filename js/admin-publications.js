/* =========================================================
   Cycology — admin-publications.js
   Drives pages/admin-publications.html: a table of every row in
   the `publications` database table with create / edit / delete,
   talking to /api/publications.php.

   The admin token is kept in sessionStorage so it survives a page
   refresh but is forgotten when the tab is closed. Nothing here is
   secret — the server enforces the token on every write.
   ========================================================= */

(function () {
  'use strict';

  const ROOT     = location.pathname.includes('/pages/') ? '../' : '';
  const ENDPOINT = ROOT + 'api/publications.php';
  const TOKEN_KEY = 'cycology.adminToken';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- DOM ----
  const authSection  = $('#auth-section');
  const panelSection = $('#panel-section');
  const tokenForm    = $('#token-form');
  const tokenInput   = $('#admin-token');
  const authMsg      = $('#auth-msg');
  const panelMsg     = $('#panel-msg');
  const tbody        = $('#pub-table tbody');
  const countEl      = $('#pub-count');
  const editor       = $('#editor');
  const editorForm   = $('#editor-form');
  const editorTitle  = $('#editor-title');
  const editorMsg    = $('#editor-msg');
  const btnSave      = $('#btn-save');

  let token = '';
  let rows  = [];

  // ---- API helper ----
  async function api(method, query, body) {
    const opts = { method, headers: { 'X-Admin-Token': token } };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res  = await fetch(ENDPOINT + (query || ''), opts);
    let data;
    try { data = await res.json(); } catch (_) { data = { error: 'Server returned an invalid response' }; }
    if (!res.ok) {
      const err = new Error(data.error || ('Request failed (' + res.status + ')'));
      err.status = res.status;
      err.fields = data.fields || null;
      throw err;
    }
    return data;
  }

  function note(el, text, isError) {
    el.textContent = text || '';
    el.classList.toggle('admin-error', !!isError);
  }

  // ---- Auth ----
  async function unlock(candidate) {
    token = candidate;
    note(authMsg, 'Checking…');
    try {
      // ?all=1 only returns drafts for a valid token; a bad token still
      // succeeds (public list), so probe with a write-only route instead.
      await api('PUT', '?id=0');           // → 400 "Missing id" when the token is valid, 401 when not
    } catch (err) {
      if (err.status === 401) {
        token = '';
        try { sessionStorage.removeItem(TOKEN_KEY); } catch (_) {}
        note(authMsg, 'That token was rejected. Check admin_token in api/config.php.', true);
        return false;
      }
      if (err.status !== 400) {            // DB / config problems surface here
        note(authMsg, err.message, true);
        return false;
      }
    }
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (_) {}
    note(authMsg, '');
    authSection.hidden  = true;
    panelSection.hidden = false;
    await load();
    return true;
  }

  function lock() {
    token = '';
    try { sessionStorage.removeItem(TOKEN_KEY); } catch (_) {}
    tokenInput.value = '';
    panelSection.hidden = true;
    authSection.hidden  = false;
    tokenInput.focus();
  }

  tokenForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = tokenInput.value.trim();
    if (t) unlock(t);
  });
  $('#btn-lock').addEventListener('click', lock);

  // ---- Table ----
  async function load() {
    note(panelMsg, 'Loading…');
    try {
      const data = await api('GET', '?all=1');
      rows = data.publications;
      render();
      note(panelMsg, '');
    } catch (err) {
      note(panelMsg, err.message, true);
    }
  }

  function render() {
    countEl.textContent = rows.length ? '(' + rows.length + ')' : '';
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No publications yet — click “New publication” to add one.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map((r) => `
      <tr data-id="${r.id}">
        <td class="admin-title">${esc(r.title)}</td>
        <td><code>${esc(r.slug)}</code></td>
        <td><span class="admin-status is-${esc(r.status)}">${esc(r.status)}</span></td>
        <td>${esc(r.published_at || '—')}</td>
        <td>${esc(r.author)}</td>
        <td class="admin-actions-col">
          <button type="button" class="btn btn-dark btn-sm" data-act="edit">Edit</button>
          <button type="button" class="btn btn-dark btn-sm" data-act="toggle">${r.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="delete">Delete</button>
        </td>
      </tr>`).join('');
  }

  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id  = parseInt(btn.closest('tr').dataset.id, 10);
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    if (btn.dataset.act === 'edit') {
      openEditor(await api('GET', '?id=' + id));   // full row, incl. body
    } else if (btn.dataset.act === 'toggle') {
      await run(() => api('PUT', '?id=' + id, { status: row.status === 'published' ? 'draft' : 'published' }),
                row.status === 'published' ? 'Moved to drafts.' : 'Published.');
    } else if (btn.dataset.act === 'delete') {
      if (!confirm('Delete “' + row.title + '”? This cannot be undone.')) return;
      await run(() => api('DELETE', '?id=' + id), 'Deleted.');
    }
  });

  /** Run a write, then refresh the table; show errors in the panel note. */
  async function run(fn, okMessage) {
    note(panelMsg, 'Saving…');
    try {
      await fn();
      await load();
      note(panelMsg, okMessage);
    } catch (err) {
      note(panelMsg, err.message, true);
    }
  }

  // ---- Editor dialog ----
  function openEditor(row) {
    editorForm.reset();
    note(editorMsg, '');
    editorTitle.textContent = row ? 'Edit publication' : 'New publication';
    if (row) {
      for (const el of editorForm.elements) {
        if (el.name && row[el.name] != null) el.value = row[el.name];
      }
    }
    if (typeof editor.showModal === 'function') editor.showModal();
    else editor.setAttribute('open', '');
    $('#f-title').focus();
  }
  function closeEditor() {
    if (typeof editor.close === 'function') editor.close();
    else editor.removeAttribute('open');
  }

  $('#btn-new').addEventListener('click', () => openEditor(null));
  $('#btn-cancel').addEventListener('click', closeEditor);

  editorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd   = new FormData(editorForm);
    const data = {};
    fd.forEach((v, k) => { data[k] = v; });
    const id = parseInt(data.id, 10);
    delete data.id;

    if (!data.title.trim()) { note(editorMsg, 'Title is required.', true); return; }

    btnSave.disabled = true;
    note(editorMsg, '');
    try {
      if (id) await api('PUT', '?id=' + id, data);
      else    await api('POST', '', data);
      closeEditor();
      await load();
      note(panelMsg, id ? 'Changes saved.' : 'Publication created.');
    } catch (err) {
      const detail = err.fields ? Object.values(err.fields).join(' · ') : '';
      note(editorMsg, detail || err.message, true);
    } finally {
      btnSave.disabled = false;
    }
  });

  // ---- Boot: reuse a token from this tab, if any ----
  let saved = '';
  try { saved = sessionStorage.getItem(TOKEN_KEY) || ''; } catch (_) {}
  if (saved) unlock(saved); else tokenInput.focus();
})();
