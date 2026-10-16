// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Gives the offline copy (sw.js) a cache name made from the contents of every file the site serves, so
// each deploy that changes a file makes phones fetch the new build once, and no deploy is missed.
// Runs before every deploy (wrangler.jsonc "build").
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = path.join(root, 'sw.js');
let s = fs.readFileSync(f, 'utf8');
// every file the site serves from its top folder, so a change to any page is a new build
const files = fs
  .readdirSync(root)
  .filter(x => /\.(html|js|css|json|svg|png|webp|ico|txt)$/.test(x) && x !== 'sw.js')
  .sort();
const h = crypto.createHash('sha256');
h.update(s.replace(/const CACHE = '[^']*';/, ''));
for (const x of files) if (fs.existsSync(path.join(root, x))) h.update(x).update(fs.readFileSync(path.join(root, x)));
const m = s.match(/const CACHE = '([a-z-]+?)-[\w]+';/);
if (!m) throw new Error('sw.js: CACHE line not found');
const next = "const CACHE = '" + m[1] + '-' + h.digest('hex').slice(0, 10) + "';";
s = s.replace(/const CACHE = '[^']*';/, next);
fs.writeFileSync(f, s);
console.log('sw.js ' + next);
