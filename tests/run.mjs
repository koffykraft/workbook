// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Runs every check. Usage: node tests/run.mjs [static|api|pages ...]
// Exit code 1 if anything fails, so scripts/deploy.sh stops before a broken deploy.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.removeAllListeners('warning');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const want = process.argv.slice(2);
const suites = ['static', 'api', 'pages'].filter(s => !want.length || want.includes(s));
let pass = 0, fail = 0, skipped = 0; const fails = [];
const t = {
  check(name, fn) { try { fn(); pass++ } catch (e) { fail++; fails.push(name + ': ' + e.message) } },
  async acheck(name, fn) { try { await fn(); pass++ } catch (e) { fail++; fails.push(name + ': ' + String(e.message).split('\n')[0]) } },
  skip(name, why) { skipped++; console.log('  skipped: ' + name + ' (' + why + ')') },
};
const t0 = Date.now();
for (const s of suites) {
  const before = pass + fail;
  process.stdout.write(s.padEnd(7) + ' ');
  try { await (await import('./' + s + '.mjs')).run(root, t) } catch (e) { fail++; fails.push(s + ' suite crashed: ' + e.message) }
  console.log((pass + fail - before) + ' checks');
}
console.log(`\n${pass} passed, ${fail} failed${skipped ? ', ' + skipped + ' skipped' : ''} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (fails.length) { console.log('\nFailed:'); fails.forEach(f => console.log('  - ' + f)) }
process.exit(fail ? 1 : 0);
