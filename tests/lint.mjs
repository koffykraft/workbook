// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Code checks with ESLint: names used but never defined, unreachable code, duplicate keys and
// other mistakes that only show up when someone taps the wrong button. Each page is checked
// with exactly the globals its own <script src> files provide, so a page that forgets to load
// a helper file fails here instead of on a phone.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const RULES = {
  'no-undef': 'error', 'no-dupe-keys': 'error', 'no-dupe-args': 'error', 'no-unreachable': 'error',
  'no-const-assign': 'error', 'no-func-assign': 'error', 'no-self-assign': 'error', 'use-isnan': 'error',
  'valid-typeof': 'error', 'no-unsafe-negation': 'error', 'no-dupe-else-if': 'error', 'no-duplicate-case': 'error',
  'no-unsafe-finally': 'error', 'no-compare-neg-zero': 'error', 'no-debugger': 'error',
  'getter-return': 'error', 'no-dupe-class-members': 'error', 'no-empty-character-class': 'error', 'no-invalid-regexp': 'error',
  'no-obj-calls': 'error', 'no-sparse-arrays': 'error', 'no-unexpected-multiline': 'error', 'no-redeclare': ['error', { builtinGlobals: false }],
};
const SKIP = /^(index_previous)/;
const NOLINT = new Set(['qrcode.js']); // third-party, unchanged
const MODULES = { has: f => /^(worker|schema|kk-modules)\.js$|-api\.js$/.test(f) };

// Names a classic script makes global: top-level declarations and window.X assignments.
function provides(src) {
  const out = new Set(); let m;
  const top = /(?:^|;)\s*(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/gm;
  while ((m = top.exec(src))) out.add(m[1]);
  const multi = /^(?:const|let|var)\s+([^=;]+?)\s*=/gm; // const a=1,b=2 on one line
  while ((m = multi.exec(src))) for (const part of src.slice(m.index).split('\n')[0].split(/[;]/)[0].matchAll(/(?:^|,)\s*(?:const|let|var)?\s*([A-Za-z_$][\w$]*)\s*=/g)) out.add(part[1]);
  const win = /(?:window|globalThis|G|self)\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
  while ((m = win.exec(src))) out.add(m[1]);
  return out;
}

export async function run(root, t) {
  let ESLint, globals;
  try { ({ Linter: ESLint } = await import(path.join(root, 'node_modules/eslint/lib/api.js'))); globals = (await import(path.join(root, 'node_modules/globals/index.js'))).default }
  catch (e) { t.skip('code checks', 'ESLint is not installed (npm i)'); return }
  const linter = new ESLint({ configType: 'flat' });
  const files = fs.readdirSync(root).filter(f => !SKIP.test(f));
  const jsFiles = [...files.filter(f => f.endsWith('.js')), ...fs.readdirSync(path.join(root, 'lang')).map(f => 'lang/' + f)];
  const prov = {}; for (const f of jsFiles) prov[f] = provides(fs.readFileSync(path.join(root, f), 'utf8'));
  const base = { ...globals.browser, ...globals.es2021 };
  const lint = (code, name, extra, module) => linter.verify(code, [{
    files: ['**/*'],
    languageOptions: { ecmaVersion: 2022, sourceType: module ? 'module' : 'script', globals: { ...base, ...(module ? globals.serviceworker : {}), ...extra } },
    rules: RULES,
  }], name).filter(x => x.severity === 2);
  const report = (name, msgs) => t.check(`${name} passes code checks`, () => { if (msgs.length) throw new Error(msgs.slice(0, 4).map(x => `line ${x.line}: ${x.message}`).join('; ') + (msgs.length > 4 ? ` (+${msgs.length - 4} more)` : '')) });

  for (const f of jsFiles.filter(f => !NOLINT.has(f))) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    const own = Object.fromEntries(Object.entries(prov).filter(([g]) => g !== f).flatMap(([, s]) => [...s]).filter(n => !prov[f].has(n)).map(n => [n, 'readonly']));
    // a shared file may use names other files provide; a page check below catches a missing include
    report(f, lint(src, f, f === 'sw.js' ? globals.serviceworker : own, MODULES.has(f)));
  }
  for (const f of files.filter(f => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, f), 'utf8');
    const srcs = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(m => m[1].replace(/^\.\//, '').split('?')[0]).filter(s => !/^https?:/.test(s));
    const extra = {}; for (const s of srcs) for (const n of prov[s] || []) extra[n] = 'writable';
    const cdn = [...html.matchAll(/<script[^>]*\bsrc="(https?:[^"]+)"/g)].map(m => m[1]);
    if (cdn.some(u => /leaflet/.test(u))) extra.L = 'readonly';
    if (cdn.some(u => /tesseract/.test(u))) extra.Tesseract = 'readonly';
    if (cdn.some(u => /chart/i.test(u))) extra.Chart = 'readonly';
    extra.TextDetector = 'readonly'; // experimental browser API, always feature-tested before use
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/type="(?:application\/(?:ld\+)?json|text\/template)"/.test(m[1]));
    // all inline scripts of a page share one scope; keep line numbers close by joining with newlines
    const code = inline.map(m => m[2]).join('\n;\n');
    if (code.trim()) report(f, lint(code, f + '.js', extra, false));
    // buttons and links that call a page function by name, in the markup or in markup built by scripts
    const known = new Set([...Object.keys(extra), ...provides(code), ...Object.keys(base)]);
    const calls = [...new Set([...html.matchAll(/\bon(?:click|change|input|submit|keydown|keyup|blur|focus|load)=\\?["']\s*(?:return\s+)?(?:await\s+)?([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]))]
      .filter(n => !['if', 'event', 'this', 'try', 'void'].includes(n));
    t.check(`${f} buttons call functions that exist`, () => { const miss = calls.filter(n => !known.has(n)); if (miss.length) throw new Error('missing: ' + miss.join(', ')) });
  }
  // code stays formatted (node scripts/format.mjs fixes it)
  t.check('code is formatted', () => { const r = spawnSync(process.execPath, [path.join(root, 'scripts/format.mjs'), '--check'], { encoding: 'utf8' }); if (r.status) throw new Error((r.stdout || r.stderr).trim() + ': run node scripts/format.mjs') });
}
