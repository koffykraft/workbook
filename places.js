// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// One list of places (farms and their blocks) for every module, read from the app's own records.
// APP.places says which record types are farms and blocks and which field links a block to its
// farm, so the same modules work in the coffee app (estate, plot, estateId), Koko and RABR.
/* global APP, ORIGIN */
const KKPLACES = (() => {
  const M = APP.places || { farm: 'farm', block: 'block', parent: 'farmId' };
  const ha = r => {
    const a = num(r.area);
    if (a == null) return null;
    return (r.areaUnit || 'acre') === 'ha' ? a : a * 0.404686;
  };
  const pt = r => (num(r.lat) != null && num(r.lng) != null ? { lat: +r.lat, lng: +r.lng } : null);
  // [{id, kind:'farm'|'block', name, label, farmId, lat, lng, ha, radius}]
  async function list() {
    let D;
    try {
      D = await ORIGIN.allTypes([M.farm, M.block]);
    } catch (e) {
      return [];
    }
    const farms = D[M.farm] || [],
      blocks = D[M.block] || [];
    const out = [];
    for (const f of farms.sort((a, b) => String(a.name).localeCompare(String(b.name)))) {
      const kids = blocks.filter(b => b[M.parent] === f.id);
      // a farm without its own GPS point takes the first block that has one
      const p = pt(f) || kids.map(pt).find(Boolean) || null;
      out.push({
        id: f.id,
        kind: 'farm',
        name: f.name || W('farm'),
        label: f.name || W('farm'),
        farmId: f.id,
        ...(p || {}),
        ha: ha(f),
        radius: num(f.radius) || 300,
      });
      for (const b of kids.sort((a, b) => String(a.name).localeCompare(String(b.name)))) {
        const bp = pt(b) || p;
        out.push({
          id: b.id,
          kind: 'block',
          name: [b.block, b.name].filter(Boolean).join(' ') || W('block'),
          label: (f.name || W('farm')) + ' › ' + ([b.block, b.name].filter(Boolean).join(' ') || W('block')),
          farmId: f.id,
          ...(bp || {}),
          ha: ha(b),
          radius: num(b.radius) || num(f.radius) || 300,
        });
      }
    }
    // blocks whose farm is missing still count
    for (const b of blocks.filter(b => !farms.some(f => f.id === b[M.parent])))
      out.push({
        id: b.id,
        kind: 'block',
        name: b.name || W('block'),
        label: b.name || W('block'),
        farmId: '',
        ...(pt(b) || {}),
        ha: ha(b),
        radius: num(b.radius) || 300,
      });
    return out;
  }
  // <option> list for a <select>; blank first entry unless required
  function options(places, sel, blank = true) {
    return (
      (blank ? '<option value="">' + esc('All ' + W('farms').toLowerCase()) + '</option>' : '') +
      places
        .map(
          p =>
            '<option value="' +
            esc(p.id) +
            '"' +
            (p.id === sel ? ' selected' : '') +
            '>' +
            (p.kind === 'block' ? '  ' : '') +
            esc(p.label) +
            '</option>'
        )
        .join('')
    );
  }
  return { list, options };
})();
