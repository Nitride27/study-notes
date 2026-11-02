// Self-check: runs every reference solution (JS + Python) through the real harness against its tests.
// Usage: node verify.js
const fs = require('fs'), vm = require('vm'), path = require('path'), { execFileSync } = require('child_process');
const ctx = { window: {}, console, structuredClone };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['data/plan.js', 'data/lessons.js', 'data/mcqs.js', 'data/problems-1.js', 'data/problems-2.js', 'data/problems-3.js', 'data/problems-4.js', 'runner.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, { filename: f });

const strip = code => code.replace(/⟦([^⟧]*)⟧/g, (_, a) => a.split('¦')[0]);
let fails = 0, checks = 0;
const report = (p, lang, msg) => { fails++; console.log(`FAIL ${p.id} [${lang}] ${msg}`); };

// JS: run the worker body in-process
let lastMsg;
vm.runInContext('postMessage = m => { __out(m) }', Object.assign(ctx, { __out: m => { lastMsg = m; } }));
vm.runInContext('(' + ctx.jsWorkerMain.toString() + ')()', ctx);

const ids = new Set();
for (const p of ctx.PROBLEMS) {
  if (ids.has(p.id)) report(p, '-', 'duplicate id');
  ids.add(p.id);
  for (const k of ['title', 'diff', 'pattern', 'time', 'desc', 'fn', 'logic', 'hints', 'sol', 'tests'])
    if (!p[k]) report(p, '-', 'missing ' + k);
  if (!ctx.LESSONS.find(l => l.id === p.pattern)) report(p, '-', 'unknown pattern ' + p.pattern);
  p.logic.forEach((l, i) => { if (!(l.a >= 0 && l.a < l.opts.length)) report(p, '-', 'bad logic answer ' + i); });

  ctx.onmessage({ data: { code: strip(p.sol.js), fn: p.fn.js, tests: p.tests, io: p.io } });
  if (lastMsg.compileError) report(p, 'js', lastMsg.compileError);
  else lastMsg.results.forEach((r, i) => { checks++; if (r.error || !ctx.checkResult(r.out, p.tests[i][1], p.compare)) report(p, 'js', `test ${i}: got ${r.error || r.out}, want ${JSON.stringify(p.tests[i][1])}`); });

  const harness = vm.runInContext("PY_HARNESS", ctx).replace(/json\.dumps\(_run\(\)\)\s*$/, 'print(json.dumps(_run()))');
  const pre = `import json\nUSER_CODE = json.loads(${JSON.stringify(JSON.stringify(strip(p.sol.py)))})\nFN = ${JSON.stringify(p.fn.py)}\nTESTS_JSON = ${JSON.stringify(JSON.stringify(p.tests))}\nIO_JSON = ${JSON.stringify(JSON.stringify(p.io || {}))}\n`;
  const tmp = path.join(require('os').tmpdir(), 'lfprep_verify.py');
  fs.writeFileSync(tmp, pre + harness);
  const res = JSON.parse(execFileSync('python', ['-I', tmp], { encoding: 'utf8' }));
  if (res.compileError) report(p, 'py', res.compileError);
  else res.results.forEach((r, i) => { checks++; if (r.error || !ctx.checkResult(r.out, p.tests[i][1], p.compare)) report(p, 'py', `test ${i}: got ${r.error || r.out}, want ${JSON.stringify(p.tests[i][1])}`); });
}
for (const d of ctx.PLAN) for (const b of d.blocks) { for (const id of [...(b.problems || []), ...(b.extra || [])]) if (!ctx.PROBLEMS.find(p => p.id === id)) { fails++; console.log('FAIL plan problem ' + id); } for (const id of b.lessons || []) if (!ctx.LESSONS.find(l => l.id === id)) { fails++; console.log('FAIL plan lesson ' + id); } for (const c of b.mcq || []) if (!ctx.MCQ_CATS[c]) { fails++; console.log('FAIL plan mcq ' + c); } }
const planned = new Set(ctx.PLAN.flatMap(d => d.blocks.flatMap(b => [...(b.problems || []), ...(b.extra || [])]))); for (const p of ctx.PROBLEMS) if (!planned.has(p.id)) console.log('note: not in plan ' + p.id);
for (const q of ctx.MCQS) if (!(q.a >= 0 && q.a < q.opts.length) || !ctx.MCQ_CATS[q.cat]) { fails++; console.log('FAIL mcq ' + q.id); }
for (const l of ctx.LESSONS) for (const c of l.checks || []) if (!(c.a >= 0 && c.a < c.opts.length)) { fails++; console.log('FAIL lesson check ' + l.id); }
console.log(`${ctx.PROBLEMS.length} problems, ${checks} test runs, ${ctx.MCQS.length} MCQs, ${ctx.LESSONS.length} lessons → ${fails ? fails + ' FAILURES' : 'all OK'}`);
process.exit(fails ? 1 : 0);
