// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Static checks: every script parses, every page's inline scripts parse, the offline list
// only names files that exist, and every source file carries the licence notice.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

export async function run(root, t) {
  const files = fs.readdirSync(root);
  const skip = /^(index_previous|tagrobuild)/;
  const js = files.filter(f => f.endsWith('.js') && !skip.test(f));
  const html = files.filter(f => f.endsWith('.html') && !skip.test(f));

  for (const f of js) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    t.check(`${f} parses`, () => {
      // worker.js is an ES module; parse it as a script with its one export turned into a const
      try { new vm.Script(src.replace(/^export default/m, 'const __default=')) }
      catch (e) { throw new Error(e.message) }
    });
    t.check(`${f} has the licence notice`, () => { if (!src.slice(0, 400).includes('see NOTICE')) throw new Error('missing header') });
  }

  for (const f of html) {
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    t.check(`${f} inline scripts parse`, () => {
      const re = /<script(?![^>]*\bsrc=)(?![^>]*type="(?:application\/ld\+json|module)")[^>]*>([\s\S]*?)<\/script>/gi;
      let m, n = 0;
      while ((m = re.exec(src))) { n++; try { new vm.Script(m[1]) } catch (e) { throw new Error(`script ${n}: ${e.message}`) } }
    });
    t.check(`${f} has a language tag`, () => { if (!/<html[^>]*\blang=/i.test(src.slice(0, 800))) throw new Error('no lang on <html>') });
    t.check(`${f} has the licence notice`, () => { if (!src.slice(0, 400).includes('see NOTICE')) throw new Error('missing header') });
    t.check(`${f} local links point to real files`, () => {
      const bad = [...src.matchAll(/(?:href|src)="([a-z0-9][\w.-]*\.(?:html|js|css|png|svg|webmanifest))(?:[#?][^"]*)?"/gi)]
        .map(x => x[1]).filter(x => !fs.existsSync(path.join(root, x)));
      if (bad.length) throw new Error('missing: ' + [...new Set(bad)].join(', '));
    });
  }

  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  t.check('sw.js offline list names only real files', () => {
    const core = JSON.parse(sw.match(/const CORE=(\[[^\]]*\])/)[1].replace(/'/g, '"'));
    const bad = core.map(x => x.replace(/^\.\//, '')).filter(x => !fs.existsSync(path.join(root, x)));
    if (bad.length) throw new Error('missing: ' + bad.join(', '));
  });
  t.check('NOTICE and LICENSE present', () => {
    for (const f of ['NOTICE', 'LICENSE']) if (!fs.existsSync(path.join(root, f))) throw new Error(f + ' missing');
  });
}
