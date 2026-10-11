// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Small helpers every page uses. One copy here, loaded before each page's own script, so a
// fix (escaping, rounding) reaches every page at once.

// Escape text before putting it into HTML or an attribute. Always use this for anything a
// person typed or that came from the network.
const esc = s =>
  String(s ?? '').replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
// A number from a field or record, or null when it is empty or not a number.
const num = v => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
// Round to one or two decimals.
const r1 = v => Math.round(v * 10) / 10;
const r2 = v => Math.round(v * 100) / 100;
