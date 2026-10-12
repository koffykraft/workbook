// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Plug-in modules from koffykraft/kk-templates (weather, field log, team, jobs). Reads kk-app.json
// and the copied *.module.json files and writes app.config.js (pages) and kk-modules.js (Worker).
// Usage: node scripts/kk-modules.mjs. To update a module, copy its files from kk-templates again.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const app = rd('kk-app.json');
const HEAD = '// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.\n// Generated from kk-app.json by scripts/kk-modules.mjs. Edit kk-app.json, not this file.\n';
const mods = app.modules.map(n => rd(n + '.module.json'));
const settings = {};
for (const m of mods) settings[m.name] = { ...(m.settings || {}), ...((app.settings || {})[m.name] || {}) };
const subnav = [...(app.subnav || [])];
const navOn = {};
for (const m of mods) {
  subnav.push([m.page, m.label]);
  navOn[m.page] = app.moduleParent;
}
const client = { ...app, subnav, navOn, settings, mods: mods.map(m => ({ name: m.name, page: m.page, label: m.label, blurb: m.blurb })), types: Object.values(app.places).slice(0, 2), db: '' };
fs.writeFileSync(path.join(root, 'app.config.js'), HEAD + 'const APP = ' + JSON.stringify(client, null, 1) + ';\n' + "if (typeof document !== 'undefined') {\n  document.documentElement.style.setProperty('--app', APP.color);\n  document.documentElement.style.setProperty('--bg', APP.bg);\n}\n");
fs.writeFileSync(path.join(root, 'kk-modules.js'), HEAD + mods.map(m => 'import * as ' + m.name + " from './" + m.name + "-api.js';").join('\n') + '\nexport const MODULE_SETTINGS = ' + JSON.stringify(settings, null, 1) + ';\nexport const MODULES = [' + mods.map(m => m.name).join(', ') + '];\n');
console.log('modules: ' + mods.map(m => m.name).join(', '));
