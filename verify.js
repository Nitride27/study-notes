// Self-check. Every reference solution must pass every test through the real harness, and every starter must fail,
// which proves the tests can catch a wrong answer. Also checks ids, links and that lesson drawings render.
// Usage: node verify.js [unit-id]    Set GRIND_PY to a Python that has numpy if `python` doesn't.
const fs = require('fs'), vm = require('vm'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const here = __dirname, PY = process.env.GRIND_PY || 'python', only = process.argv[2];
const ctx = { console, structuredClone }; ctx.window = ctx; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
for (const f of ['problems-1', 'problems-2', 'problems-3', 'problems-4']) load(path.join(here, 'data', f + '.js'));
load(path.join(here, 'viz.js')); load(path.join(here, 'content', 'path.js'));
const html = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
for (const m of html.matchAll(/src="(content\/(?!path)[^"]+)"/g)) load(path.join(here, m[1]));
load(path.join(here, 'engine.js'));
const HARNESS = vm.runInContext('PY_HARNESS', ctx).replace(/json\.dumps\(_main\(USER_CODE, json\.loads\(TESTS_JSON\)\)\)\s*$/, 'print(json.dumps(_main(USER_CODE, json.loads(TESTS_JSON))))');
const tmp = path.join(os.tmpdir(), `grind_verify_${process.pid}.py`);
const BANK = Object.fromEntries(ctx.PROBLEMS.map(p => [p.id, p]));

let fails = 0, runs = 0, count = 0;
const bad = m => { fails++; console.log('FAIL ' + m); };
function run(code, tests) {
  fs.writeFileSync(tmp, `import json\nUSER_CODE = json.loads(${JSON.stringify(JSON.stringify(code))})\nTESTS_JSON = ${JSON.stringify(JSON.stringify(tests))}\n${HARNESS}`);
  const r = spawnSync(PY, ['-I', tmp], { encoding: 'utf8', timeout: 30000, maxBuffer: 1 << 26 });
  if (r.error) return { compileError: 'timeout or spawn error: ' + r.error.message };
  try { return JSON.parse(r.stdout.trim().split('\n').pop()); } catch { return { compileError: 'harness crashed: ' + r.stderr.slice(-400) }; }
}
function norm(x) {
  if (typeof x !== 'string') return { ...x, tests: x.tests.map(([c, w, s]) => ({ c, w, s, label: c })) };
  const p = BANK[x]; if (!p) throw new Error('unknown bank problem ' + x);
  return { id: p.id, title: p.title, start: `def ${p.fn.py}(${p.params.join(', ')}):\n    pass\n`, sol: p.sol.py.replace(/⟦([^⟧]*)⟧/g, (_, a) => a.split('¦')[0]), tests: p.tests.map(([a, e]) => ({ a, e, fn: p.fn.py, io: p.io || {}, cmp: p.compare })) };
}
const scan = (s, where) => { if (/undefined|NaN/.test(s)) bad(`${where}: drawing contains undefined or NaN`); };
function renderCheck(u) {
  for (const b of u.read || []) {
    if (b.fig !== undefined) scan(b.fig, u.id);
    if (b.steps) b.steps.forEach((f, i) => { scan(f.d, `${u.id} step ${i}`); if (!f.n) bad(`${u.id} step ${i}: no note`); });
  }
}
const seenP = new Set(), seenU = new Set(), usedBank = new Set();
for (const u of ctx.UNITS) {
  if (seenU.has(u.id)) bad('duplicate unit ' + u.id); seenU.add(u.id);
  if (!ctx.PHASES.find(p => p.id === u.phase)) bad('bad phase on ' + u.id);
  renderCheck(u);
  if (u.project) { if (!u.project.check?.length || !u.project.brief || !u.project.time) bad('incomplete project ' + u.id); continue; }
  if (!u.read?.length || !u.mins) bad('no reading on ' + u.id);
  if (!u.boss) bad('no boss on ' + u.id);
  for (const raw of [...(u.core || []), ...(u.extra || []), ...(u.boss ? [u.boss] : [])]) {
    if (typeof raw === 'string') usedBank.add(raw);
    const p = norm(raw);
    if (seenP.has(p.id)) bad('duplicate problem ' + p.id); seenP.add(p.id);
    if (typeof raw !== 'string') for (const k of ['title', 'diff', 'time', 'desc', 'start', 'sol', 'big', 'idea', 'tests']) if (!raw[k]) bad(`${p.id}: missing ${k}`);
    if (typeof raw !== 'string' && raw !== u.boss && !(raw.nudge || []).length) bad(`${p.id}: no nudges`);
    if (only && u.id !== only) continue;
    count++;
    const t0 = Date.now();
    const r = run(p.sol, p.tests);
    if (Date.now() - t0 > 3000) console.log(`slow: ${p.id} took ${Date.now() - t0} ms natively; the browser's Python is slower and stops at 20 s`);
    if (r.compileError) bad(`${p.id}: reference crashed: ${r.compileError}`);
    else r.results.forEach((x, i) => { runs++; if (!x.ok) bad(`${p.id} test ${i} (${p.tests[i].label || ''}): ${x.err || `got ${x.got}, want ${x.want}`}`); });
    const st = run(p.start.trimEnd().endsWith(':') ? p.start + '\n    pass\n' : p.start, p.tests);
    if (!st.compileError && st.results.every(x => x.ok)) bad(`${p.id}: the starter passes every test, so the tests prove nothing`);
    if (typeof raw !== 'string' && st.compileError && !/^class /m.test(p.start) && !/timeout/.test(st.compileError)) bad(`${p.id}: starter has a problem: ${st.compileError}`);
  }
}
for (const id of Object.keys(BANK)) if (!usedBank.has(id)) console.log('note: bank problem not on the path: ' + id);
fs.rmSync(tmp, { force: true });
const lessons = ctx.UNITS.filter(u => !u.project).length, projects = ctx.UNITS.filter(u => u.project).length;
console.log(`${ctx.UNITS.length} units (${lessons} concepts, ${projects} projects), ${seenP.size} problems, ${count} checked, ${runs} test runs: ${fails ? fails + ' FAILURES' : 'all OK'}`);
process.exit(fails ? 1 : 0);
