/* =========================================================
   Cycology — admin-publications.js
   Drives pages/admin-publications.html: a table of every row in
   the `publications` database table with create / edit / delete,
   talking to /api/publications.php.

   Access is a signed-in admin session (pages/admin-login.html);
   admin-auth.js redirects here to the login page when the session
   has expired. The server re-checks on every request.
   ========================================================= */

(function () {
  'use strict';

  const A        = window.CycologyAdmin;
  const ROOT     = A.ROOT;
  const ENDPOINT = 'api/publications.php';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- DOM ----
  const panelMsg     = $('#panel-msg');
  const tbody        = $('#pub-table tbody');
  const countEl      = $('#pub-count');
  const editor       = $('#editor');
  const editorForm   = $('#editor-form');
  const editorTitle  = $('#editor-title');
  const editorMsg    = $('#editor-msg');
  const btnSave      = $('#btn-save');

  let rows = [];

  // Thin wrapper over the shared helper so the calls below stay short.
  const api = (method, query, body) => A.api(method, ENDPOINT + (query || ''), body);

  function note(el, text, isError) {
    el.textContent = text || '';
    el.classList.toggle('admin-error', !!isError);
  }

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
    refreshPreview();
    note(uploadMsg, '');
    if (typeof editor.showModal === 'function') editor.showModal();
    else editor.setAttribute('open', '');
    $('#f-title').focus();
  }
  function closeEditor() {
    if (typeof editor.close === 'function') editor.close();
    else editor.removeAttribute('open');
  }

  // ---- Cover image: preview / upload / clear ----
  const coverInput   = $('#f-cover');
  const uploadInput  = $('#f-upload');
  const uploadMsg    = $('#upload-msg');
  const previewImg   = $('#cover-preview-img');
  const previewEmpty = $('#cover-preview-empty');

  function coverSrc(path) {
    if (!path) return '';
    return /^(https?:)?\/\//.test(path) ? path : ROOT + path.replace(/^\/+/, '');
  }
  function refreshPreview() {
    const path = coverInput.value.trim();
    previewImg.hidden   = !path;
    previewEmpty.hidden = !!path;
    previewImg.src      = path ? coverSrc(path) : '';
  }
  coverInput.addEventListener('input', refreshPreview);
  previewImg.addEventListener('error', () => { previewImg.hidden = true; previewEmpty.hidden = false; previewEmpty.textContent = 'Image not found at that path'; });
  previewImg.addEventListener('load',  () => { previewEmpty.textContent = 'No image'; });

  $('#btn-cover-clear').addEventListener('click', () => { coverInput.value = ''; refreshPreview(); note(uploadMsg, ''); });

  uploadInput.addEventListener('change', async () => {
    const file = uploadInput.files && uploadInput.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fd.append('name', $('#f-slug').value.trim() || $('#f-title').value.trim() || 'cover');
    note(uploadMsg, 'Uploading ' + file.name + '…');
    btnSave.disabled = true;
    try {
      const res  = await fetch(ROOT + 'api/upload.php', { method: 'POST', credentials: 'same-origin', body: fd });
      const data = await res.json().catch(() => ({ error: 'Server returned an invalid response' }));
      if (!res.ok) throw new Error(data.error || ('Upload failed (' + res.status + ')'));
      coverInput.value = data.path;
      refreshPreview();
      note(uploadMsg, 'Uploaded — click Save to keep it.');
    } catch (err) {
      note(uploadMsg, err.message, true);
    } finally {
      btnSave.disabled = false;
      uploadInput.value = '';
    }
  });

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

  // ---- Boot ----
  (async () => {
    await A.guard();          // redirects to the login page when signed out
    A.shell('posts');
    load();
  })();
})();
