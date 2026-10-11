// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Formats the code so it can be read and reviewed: every .js file, and the <script> and <style>
// blocks inside each page. Page markup and text are left exactly as written, so nothing a user
// sees changes. Usage: node scripts/format.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prettier = await import(path.join(root, 'node_modules/prettier/index.mjs'));
const OPTS = { printWidth: 110, singleQuote: true, arrowParens: 'avoid', trailingComma: 'es5', endOfLine: 'lf' };
const SKIP = /^(index_previous|qrcode\.js)/; // old backups and unchanged third-party code
const check = process.argv.includes('--check');
let changed = 0;

async function fmt(code, parser) { return (await prettier.format(code, { ...OPTS, parser })).replace(/\n+$/, '') }

const files = [...fs.readdirSync(root), ...fs.readdirSync(path.join(root, 'lang')).map(f => 'lang/' + f)]
  .filter(f => /\.(js|html)$/.test(f) && !SKIP.test(f));
for (const f of files) {
  const p = path.join(root, f), src = fs.readFileSync(p, 'utf8');
  let out;
  if (f.endsWith('.js')) out = (await fmt(src, 'babel')) + '\n';
  else {
    out = src;
    const blocks = [...src.matchAll(/(<script(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)|(<style[^>]*>)([\s\S]*?)(<\/style>)/g)];
    for (const m of blocks.reverse()) {
      const isScript = !!m[1], body = isScript ? m[2] : m[5];
      if (!body.trim() || (isScript && /type="(?:application\/(?:ld\+)?json)"/.test(m[1]))) continue;
      const pretty = await fmt(body, isScript ? 'babel' : 'css');
      const rep = (isScript ? m[1] : m[4]) + '\n' + pretty + '\n' + (isScript ? m[3] : m[6]);
      out = out.slice(0, m.index) + rep + out.slice(m.index + m[0].length);
    }
  }
  if (out !== src) { changed++; if (!check) fs.writeFileSync(p, out) }
}
console.log((check ? 'would change ' : 'formatted ') + changed + ' of ' + files.length + ' files');
if (check && changed) process.exit(1);
