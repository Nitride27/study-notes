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
// The memory system: old topics must keep coming back while new ones are being learned.
load(path.join(here, 'memory.js'));
vm.runInContext(`(() => {
  const ok = (c, m) => { if (!c) throw new Error('memory: ' + m); };
  const units = [{ id: 'arr', track: 'DSA', core: ['two-sum', 'sort'], extra: [] }, { id: 'api', track: 'Backend', core: ['router'], extra: [] }];
  const trackFor = u => u.track, today = '2026-06-30';
  const solvedOn = (d, box, due) => ({ solved: d, last: d, box, due });
  const S = { lessons: { arr: '2026-03-01', api: '2026-06-29' }, recall: {}, p: { 'two-sum': solvedOn('2026-06-10', 3, '2026-08-09'), sort: solvedOn('2026-06-20', 3, '2026-08-19'), router: solvedOn('2026-06-29', 0, '2026-07-02') } };
  const items = reviewItems(S, units, trackFor, today);
  ok(items.find(i => i.key === 'p:router').r > 0.9, 'a fresh problem should be near full recall');
  ok(!items.find(i => i.key === 'p:two-sum').isDue, 'fixture: DSA is not due');
  const r = pickReviews(items, today, 2);
  ok(r.keys.includes('p:two-sum'), 'a neglected topic comes back even with nothing due: ' + r.keys);
  ok(r.keys.includes('r:arr'), 'an overdue concept comes back: ' + r.keys);
  const crowd = { lessons: {}, recall: {}, p: {} }, many = { id: 'big', track: 'Backend', core: [], extra: [] };
  for (let i = 0; i < 20; i++) { many.core.push('b' + i); crowd.p['b' + i] = solvedOn('2026-06-20', 0, '2026-06-23'); }
  crowd.p.x = solvedOn('2026-06-25', 0, '2026-06-28');
  const mix = pickReviews(reviewItems(crowd, [many, { id: 'd', track: 'DSA', core: ['x'], extra: [] }], trackFor, today), today, 2);
  ok(mix.keys.includes('p:x'), 'a backlog in one topic must not crowd out another: ' + mix.keys);
  ok(mix.behind && mix.backlog === 21, 'a big backlog pauses new concepts');
  ok(nextBox({ rematching: true, box: 1, due: today, nudges: 0 }, today) === 2, 'a due, unaided rematch moves up');
  ok(nextBox({ rematching: true, box: 1, due: '2026-07-20', nudges: 0 }, today) === 1, 'early practice must not skip ahead');
  ok(nextBox({ rematching: true, box: 1, due: today, nudges: 1 }, today) === 1, 'a rematch with nudges does not move up');
  ok(nextBox({ rematching: true, retry: true, box: 2, due: today }, today) === 0, 'a given-up problem starts over');
  ok(gradeConcept({ box: 2, due: today }, 0, today).box === 0 && gradeConcept({ box: 2, due: today }, 2, today).box === 3, 'concept grades move the gap');
  ok(Math.abs(recallChance(7, 7) - 0.9) < 1e-9, 'the curve is 90% at the gap');
  ok(freshness([]) === '' && freshness([0.95]) === 'fresh' && freshness([0.85]) === 'fading' && freshness([0.4]) === 'rusty', 'freshness bands');
})()`, ctx);
console.log('memory checks: OK');
const lessons = ctx.UNITS.filter(u => !u.project).length, projects = ctx.UNITS.filter(u => u.project).length;
console.log(`${ctx.UNITS.length} units (${lessons} concepts, ${projects} projects), ${seenP.size} problems, ${count} checked, ${runs} test runs: ${fails ? fails + ' FAILURES' : 'all OK'}`);
process.exit(fails ? 1 : 0);
