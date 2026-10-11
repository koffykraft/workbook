// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Cloud status row and buttons for Origin and Cup records.
function kkSignedIn() { return typeof SYNC !== 'undefined' && SYNC.isAuthenticated(); }
function cloudRowHtml(rec) {
  const sec = PREFS.sectionOf(rec.type), name = sec === 'cup' ? 'Cup' : 'Origin';
  if (!kkSignedIn()) return '<span class="loc">On this phone</span><a class="cl-link" href="account.html">Sign in to save to cloud</a>';
  if (rec.cloud) return '<span class="loc in">In cloud</span><button type="button" class="btn small" data-cloud="off">Remove from cloud</button>';
  if (PREFS.get(sec) === 'off') return '<span class="loc">On this phone</span><a class="cl-link" href="account.html">Cloud sync is off for ' + name + '</a>';
  return '<span class="loc">On this phone</span><button type="button" class="btn small" data-cloud="on">Save to cloud</button>';
}
function bindCloudRow(rec, after) {
  const box = document.getElementById('cloudRow');
  if (!box) return;
  box.querySelectorAll('[data-cloud]').forEach(b => b.onclick = async () => {
    const on = b.dataset.cloud === 'on';
    if (!on && !confirm('Remove this from the cloud? It stays on this phone.')) return;
    b.disabled = true; b.textContent = on ? 'Saving…' : 'Removing…';
    try { await ORIGIN.setCloud(rec.id, on); rec.cloud = on; box.innerHTML = cloudRowHtml(rec); bindCloudRow(rec, after); if (after) after(); }
    catch (e) { b.disabled = false; b.textContent = on ? 'Save to cloud' : 'Remove from cloud'; alert((on ? 'Could not save to cloud: ' : 'Could not remove from cloud: ') + (e.message || e)); }
  });
}
// Tick box beside Save for records not yet in the cloud (only when the section is "selected").
function alsoCloudHtml(rec) {
  if (!kkSignedIn() || rec.cloud || PREFS.get(PREFS.sectionOf(rec.type)) !== 'selected') return '';
  return '<label class="cl-check"><input type="checkbox" id="alsoCloud"> Cloud</label>';
}
function locTag(rec) { return '<span class="tag loc' + (rec.cloud ? ' in' : '') + '">' + (rec.cloud ? 'In cloud' : 'This phone') + '</span>'; }
function cloudModeText(sec){if(!kkSignedIn())return 'Saved on this phone';return {off:'Cloud off, saved on this phone',selected:'Cloud: records you choose',all:'Cloud: everything'}[PREFS.get(sec)]}
