// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Answer feedback by email from the admin list: a Reply button under any feedback that left an
// email address. The server sends it from the app's address and keeps a note that it was answered.
(function () {
  const esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  window.kkReplyHtml = f => {
    if (!f || !f.id || !/^\S+@\S+\.\S+$/.test(String(f.contact || '').trim())) return '';
    return (
      '<div class="kk-reply" data-fb="' +
      esc(f.id) +
      '" style="margin-top:6px">' +
      (f.replied_at
        ? '<span style="font-size:12px;color:#3f6b4a">Replied ' +
          esc(String(f.replied_at).slice(0, 10)) +
          '</span> '
        : '') +
      '<button type="button" class="btn small" data-open-reply>' +
      (f.replied_at ? 'Reply again' : 'Reply by email') +
      '</button></div>'
    );
  };
  document.addEventListener('click', async e => {
    const open = e.target.closest('[data-open-reply]');
    if (open) {
      const box = open.closest('.kk-reply');
      if (box.querySelector('textarea')) return;
      box.insertAdjacentHTML(
        'beforeend',
        '<textarea style="width:100%;margin-top:6px;min-height:90px" placeholder="Your reply. Their message is quoted below it in the email."></textarea><div style="margin-top:6px"><button type="button" class="btn small app" data-send-reply>Send</button></div>'
      );
      box.querySelector('textarea').focus();
      return;
    }
    const send = e.target.closest('[data-send-reply]');
    if (!send) return;
    const box = send.closest('.kk-reply');
    const text = box.querySelector('textarea').value.trim();
    if (!text) return;
    send.disabled = true;
    send.textContent = 'Sending…';
    try {
      const tok = typeof SYNC !== 'undefined' ? SYNC.getToken() : '';
      const r = await fetch('/api/feedback/reply', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok },
        body: JSON.stringify({ id: box.dataset.fb, text }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'failed');
      box.innerHTML = '<span style="font-size:12px;color:#3f6b4a">Reply sent.</span>';
    } catch (err) {
      send.disabled = false;
      send.textContent = 'Send';
      alert('Could not send: ' + err.message);
    }
  });
})();
