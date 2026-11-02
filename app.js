// Cracked: hash-routed vanilla JS. Progress lives in localStorage, sketches in IndexedDB (they would overflow localStorage).
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const app = $('#app');
const KEY = 'cracked-v1';
const blank = { xp: 0, days: {}, lessons: {}, teach: {}, p: {}, projects: {}, unlocked: {}, pace: 'steady' };
const S = (() => {
  const raw = localStorage.getItem(KEY);
  try { return Object.assign({}, blank, JSON.parse(raw || '{}')); }
  catch { localStorage.setItem(KEY + '-corrupt-' + Date.now(), raw); return { ...blank }; } // keep the bad copy; never overwrite it
})();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch { toast('Browser storage is full. Export a backup from Settings.'); }
}
const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return day(d); };
const dayLog = () => (S.days[day()] = S.days[day()] || { xp: 0, read: 0, solved: 0, bonus: 0, done: [] });

// ---------- content index ----------
const BANK = Object.fromEntries((window.PROBLEMS || []).map(p => [p.id, p]));
const stripBlanks = c => c.replace(/⟦([^⟧]*)⟧/g, (_, a) => a.split('¦')[0]);
function fromBank(p) {
  const list = p.io && (p.io.ret === 'list' || (p.io.args || []).some(k => k === 'list' || k === 'cycle'));
  return {
    id: p.id, title: p.title, diff: p.diff, time: p.time, desc: p.desc, constraints: p.constraints,
    ex: (p.examples || []).map(e => [e.in, e.out, e.why]),
    start: `${list ? '# ListNode(val=0, next=None) is predefined: node.val, node.next\n' : ''}def ${p.fn.py}(${p.params.join(', ')}):\n    `,
    nudge: p.hints, sol: stripBlanks(p.sol.py), big: p.complexity, idea: p.takeaway,
    tests: p.tests.map(([a, e]) => ({ a, e, fn: p.fn.py, io: p.io || {}, cmp: p.compare, label: p.params.map((n, i) => `${n} = ${JSON.stringify(a[i])}`).join(', ') }))
  };
}
const P = {}, PU = {};
for (const u of UNITS) {
  u.core = u.core || []; u.extra = u.extra || [];
  const norm = x => {
    const p = typeof x === 'string' ? fromBank(BANK[x]) : { ...x, tests: x.tests.map(([c, w, s]) => ({ c, w, s, label: c })) };
    P[p.id] = p; PU[p.id] = u; return p.id;
  };
  u.core = u.core.map(norm); u.extra = u.extra.map(norm);
  if (u.boss) { u.boss = norm(u.boss); P[u.boss].boss = true; }
}
const U = Object.fromEntries(UNITS.map(u => [u.id, u]));
const ps = id => (S.p[id] = S.p[id] || { stage: 'rough', example: '', algo: '', code: '', secs: 0, nudges: 0, fails: 0 });
const solved = id => !!(S.p[id] && S.p[id].solved);
const required = u => [...u.core, ...(u.boss ? [u.boss] : [])];
const cleared = u => u.project
  ? u.project.check.every((_, i) => (S.projects[u.id] || {})[i])
  : !!S.lessons[u.id] && required(u).every(solved);
const isOpen = u => { const i = UNITS.indexOf(u); return i === 0 || !!S.unlocked[u.id] || cleared(UNITS[i - 1]) || cleared(u) || !!S.lessons[u.id]; };
const current = () => UNITS.find(u => !cleared(u));
const SHEETS = () => UNITS.reduce((n, u) => n + (u.project ? 1 : 1 + required(u).length), 0);
const sheetsDone = () => UNITS.reduce((n, u) => n + (u.project ? (cleared(u) ? 1 : 0) : (S.lessons[u.id] ? 1 : 0) + required(u).filter(solved).length), 0);

// ---------- rewards ----------
const RANKS = [[0, 'Blank page'], [150, 'Tracer'], [500, 'Translator'], [1200, 'Pattern spotter'], [2500, 'Problem solver'], [4500, 'Tree climber'], [7000, 'Graph walker'], [10000, 'DP survivor'], [14000, 'API builder'], [19000, 'Backend engineer'], [25000, 'Model maker'], [32000, 'Cracked']];
const rank = (xp = S.xp) => [...RANKS].reverse().find(([n]) => xp >= n)[1];
function nextRank() { const r = RANKS.find(([n]) => S.xp < n); return r ? `${r[0] - S.xp} XP to ${r[1]}` : 'Top of the pad'; }
function streak() {
  let n = 0, d = new Date();
  if (!(S.days[day(d)] && S.days[day(d)].xp)) d.setDate(d.getDate() - 1); // today not started yet doesn't break it
  while (S.days[day(d)] && S.days[day(d)].xp) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function gain(xp, doneKey) {
  const before = rank(), log = dayLog();
  S.xp += xp; log.xp += xp;
  if (doneKey && !log.done.includes(doneKey)) log.done.push(doneKey);
  save(); head();
  if (rank() !== before) { toast(`New rank: ${rank()}`); stamp(rank()); }
}
function stamp(text) {
  const el = $('#stamp');
  el.innerHTML = `<span>${esc(text)}</span>`; el.classList.add('on');
  setTimeout(() => el.classList.remove('on'), 1400);
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3600);
}
const GAP = [3, 7, 21, 60, 180]; // days until the next rematch, per successful round
const BASE = { Easy: 30, Medium: 60, Hard: 100 };

// ---------- sketch storage ----------
const store = (() => {
  let db;
  const open = () => db || (db = new Promise((res, rej) => {
    const r = indexedDB.open('cracked', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, f) => {
    const d = await open();
    return new Promise((res, rej) => { const q = f(d.transaction('kv', mode).objectStore('kv')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  };
  return {
    get: k => tx('readonly', o => o.get(k)), set: (k, v) => tx('readwrite', o => o.put(v, k)), del: k => tx('readwrite', o => o.delete(k)),
    all: async () => { const keys = await tx('readonly', o => o.getAllKeys()), vals = await tx('readonly', o => o.getAll()); return Object.fromEntries(keys.map((k, i) => [k, vals[i]])); }
  };
})();

// ---------- sketch pad ----------
const W = 1000, H = 600, INK = { g: '#262B26', r: '#BF2E1B', b: '#1B4A9E' };
function paint(ctx, strokes, scale) {
  ctx.save(); ctx.scale(scale, scale); ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = 2.4;
  for (const s of strokes) {
    ctx.strokeStyle = ctx.fillStyle = INK[s.c] || INK.g;
    if (s.t === 'p') { ctx.beginPath(); s.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    if (s.t === 'b') ctx.strokeRect(s.x, s.y, s.w, s.h);
    if (s.t === 'a') {
      const a = Math.atan2(s.y2 - s.y, s.x2 - s.x);
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x2, s.y2);
      ctx.lineTo(s.x2 - 13 * Math.cos(a - .45), s.y2 - 13 * Math.sin(a - .45)); ctx.moveTo(s.x2, s.y2); ctx.lineTo(s.x2 - 13 * Math.cos(a + .45), s.y2 - 13 * Math.sin(a + .45)); ctx.stroke();
    }
    if (s.t === 'x') { ctx.font = '24px "Patrick Hand", "Architects Daughter", cursive'; ctx.fillText(s.s, s.x, s.y); }
    if (s.t === 'c') {
      ctx.font = '20px "DM Mono", monospace'; ctx.textAlign = 'center';
      s.v.forEach((v, i) => { ctx.strokeRect(s.x + i * 52, s.y, 52, 48); ctx.fillText(v, s.x + i * 52 + 26, s.y + 31); });
      ctx.textAlign = 'start';
    }
  }
  ctx.restore();
}
function near(s, x, y) {
  const inBox = (a, b, c, d) => x >= Math.min(a, c) - 10 && x <= Math.max(a, c) + 10 && y >= Math.min(b, d) - 10 && y <= Math.max(b, d) + 10;
  if (s.t === 'p') return s.pts.some(([a, b]) => Math.hypot(a - x, b - y) < 14);
  if (s.t === 'b') return inBox(s.x, s.y, s.x + s.w, s.y + s.h);
  if (s.t === 'a') return inBox(s.x, s.y, s.x2, s.y2);
  if (s.t === 'x') return inBox(s.x, s.y - 24, s.x + s.s.length * 13, s.y + 4);
  if (s.t === 'c') return inBox(s.x, s.y, s.x + s.v.length * 52, s.y + 48);
}
function fit(canvas) {
  const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth || 600;
  canvas.width = w * dpr; canvas.height = w * dpr * H / W;
  return canvas.width / W;
}
function mountPad(host, key) {
  host.innerHTML = `<div class="padbox">
    <div class="tools" role="toolbar" aria-label="Sketch tools">
      ${[['p', 'Pencil'], ['b', 'Box'], ['a', 'Arrow'], ['x', 'Text'], ['c', 'Cells'], ['e', 'Eraser']].map(([k, n]) => `<button data-tool="${k}" aria-pressed="${k === 'p'}">${n}</button>`).join('')}
      <input type="text" id="padText" placeholder="text or: 2 7 11 15" aria-label="Words for the Text tool, or space-separated values for the Cells tool">
      ${[['g', 'Graphite'], ['r', 'Red'], ['b', 'Blue']].map(([k, n]) => `<button class="swatch" data-ink="${k}" style="background:${INK[k]}" aria-pressed="${k === 'g'}" aria-label="${n} pencil"></button>`).join('')}
      <button data-do="undo">Undo</button><button data-do="clear">Clear</button>
    </div>
    <canvas class="pad" role="img" aria-label="Your rough sketch. Draw here with mouse, pen or finger."></canvas></div>`;
  const cv = $('canvas', host), ctx = cv.getContext('2d');
  let strokes = [], tool = 'p', ink = 'g', live = null, scale = fit(cv), timer;
  const draw = () => { ctx.clearRect(0, 0, cv.width, cv.height); paint(ctx, live ? [...strokes, live] : strokes, scale); };
  const persist = () => { clearTimeout(timer); timer = setTimeout(() => store.set(key, strokes).catch(() => toast('Your sketch could not be saved in this browser.')), 300); };
  store.get(key).then(v => { if (v) { strokes = v; draw(); } }).catch(() => {});
  const at = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * W), Math.round((e.clientY - r.top) / r.height * H)]; };
  cv.onpointerdown = e => {
    cv.setPointerCapture(e.pointerId);
    const [x, y] = at(e), words = $('#padText', host).value.trim();
    if (tool === 'p') live = { t: 'p', c: ink, pts: [[x, y]] };
    if (tool === 'b') live = { t: 'b', c: ink, x, y, w: 0, h: 0 };
    if (tool === 'a') live = { t: 'a', c: ink, x, y, x2: x, y2: y };
    if (tool === 'e') { strokes = strokes.filter(s => !near(s, x, y)); live = { t: 'e' }; draw(); }
    if (tool === 'x' || tool === 'c') {
      if (!words) { $('#padText', host).focus(); return toast(tool === 'x' ? 'Type the words first, then click the pad.' : 'Type values like 2 7 11 15, then click the pad.'); }
      strokes.push(tool === 'x' ? { t: 'x', c: ink, x, y, s: words } : { t: 'c', c: ink, x, y, v: words.split(/\s+/) });
      draw(); persist();
    }
  };
  cv.onpointermove = e => {
    if (!live) return;
    const [x, y] = at(e);
    if (live.t === 'p') live.pts.push([x, y]);
    if (live.t === 'b') { live.w = x - live.x; live.h = y - live.y; }
    if (live.t === 'a') { live.x2 = x; live.y2 = y; }
    if (live.t === 'e') strokes = strokes.filter(s => !near(s, x, y));
    draw();
  };
  cv.onpointerup = cv.onpointercancel = () => {
    if (!live) return;
    if (live.t !== 'e') strokes.push(live);
    live = null; draw(); persist();
  };
  host.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tool) { tool = b.dataset.tool; $$('[data-tool]', host).forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.dataset.ink) { ink = b.dataset.ink; $$('[data-ink]', host).forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.dataset.do === 'undo') { strokes.pop(); draw(); persist(); }
    if (b.dataset.do === 'clear' && strokes.length && confirm('Clear this sketch?')) { strokes = []; draw(); persist(); }
  };
  new ResizeObserver(() => { scale = fit(cv); draw(); }).observe(cv);
}

// ---------- editor ----------
function editor(ta, onRun) {
  if (!window.CodeMirror) return { getValue: () => ta.value, setValue: v => { ta.value = v; } };
  const cm = CodeMirror.fromTextArea(ta, {
    mode: 'python', theme: 'pad', lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, matchBrackets: true,
    autoCloseBrackets: true, styleActiveLine: true, viewportMargin: Infinity,
    extraKeys: { Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    '), 'Shift-Tab': 'indentLess', 'Ctrl-Enter': () => onRun(), 'Cmd-Enter': () => onRun(), Esc: c => c.getInputField().blur() }
  });
  return cm;
}
function colour(root) {
  if (!window.CodeMirror || !CodeMirror.runMode) return;
  $$('pre code:not([data-hl])', root).forEach(el => { el.dataset.hl = 1; CodeMirror.runMode(el.textContent, 'python', el); el.parentElement.classList.add('cm-s-pad'); });
}

// ---------- lesson blocks ----------
function blocks(list) {
  return list.map((b, i) => {
    if (typeof b === 'string') return b;
    if (b.fig !== undefined) return `<figure class="vis" style="margin:16px 0"><svg viewBox="0 0 720 ${b.h}" role="img" aria-label="${esc(b.cap || 'Diagram')}">${b.fig}</svg>${b.cap ? `<figcaption class="cap">${b.cap}</figcaption>` : ''}</figure>`;
    if (b.steps) {
      return `<div class="vis" data-steps="${i}"><svg viewBox="0 0 720 ${b.h}" role="img" aria-label="Step-by-step diagram; the note below describes each step"></svg><div class="note" aria-live="polite"></div>
        <div class="ctrl"><button class="btn" data-step="-1">Back</button><button class="btn go" data-step="1">Next step</button><button class="btn quiet" data-step="0">Restart</button><span class="count"></span></div></div>`;
    }
    if (b.think) return `<details class="think"><summary>${b.think}</summary><div>${b.ans}</div></details>`;
    if (b.run !== undefined) return `<div class="tryit" data-run="${i}"><textarea>${esc(b.run)}</textarea><div class="row" style="margin-top:6px"><button class="btn" data-tryrun>Run this</button><span class="small mute" data-status></span></div><div class="log" hidden></div></div>`;
    return '';
  }).join('');
}
function wireBlocks(root, list) {
  $$('[data-steps]', root).forEach(el => {
    const b = list[+el.dataset.steps], max = b.steps.length - 1;
    let i = 0;
    const show = () => {
      $('svg', el).innerHTML = b.steps[i].d; $('.note', el).innerHTML = b.steps[i].n;
      $('.count', el).textContent = `Step ${i + 1} of ${max + 1}`;
      $('[data-step="-1"]', el).disabled = i === 0; $('[data-step="1"]', el).disabled = i === max;
    };
    el.addEventListener('click', e => { const s = e.target.closest('[data-step]'); if (!s) return; i = +s.dataset.step === 0 ? 0 : Math.max(0, Math.min(max, i + +s.dataset.step)); show(); });
    show();
  });
  $$('[data-run]', root).forEach(el => {
    const cm = editor($('textarea', el), () => go());
    const go = async () => {
      const out = $('.log', el), st = $('[data-status]', el);
      const r = await Engine.run(cm.getValue(), [], m => { st.textContent = m; });
      st.textContent = ''; out.hidden = false;
      out.textContent = (r.stdout || '') + (r.compileError ? (r.stdout ? '\n' : '') + r.compileError : '') || '(nothing printed)';
    };
    $('[data-tryrun]', el).onclick = go;
  });
  colour(root);
}

// ---------- header ----------
function head() {
  const u = current(), dt = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  $('#padHead').innerHTML = `<a class="brand" href="#/">cracked</a>
    <div class="fields">
      <div class="field"><span class="k">Subject</span><span class="v">${esc(u ? u.title : 'All sheets done')}</span></div>
      <div class="field"><span class="k">Date</span><span class="v">${dt}</span></div>
      <div class="field"><span class="k">Sheet</span><span class="v">${sheetsDone()} of ${SHEETS()}</span></div>
      <div class="field"><span class="k">Streak</span><span class="v">${streak()} day${streak() === 1 ? '' : 's'}</span></div>
      <div class="field" title="${esc(nextRank())}"><span class="k">Rank · ${S.xp} XP</span><span class="v">${esc(rank())}</span></div>
    </div>
    <nav class="pad-nav" aria-label="Main">
      <a href="#/">Today</a><a href="#/path">Path</a><a href="#/rough">Rough</a><a href="#/gauntlet">Gauntlet</a><a href="#/notebook">Notebook</a><a href="#/settings">Settings</a>
    </nav>`;
}

// ---------- today ----------
const PACE = { slow: { read: 1, solve: 2, label: 'Slow: 1 concept, 2 problems a day' }, steady: { read: 1, solve: 3, label: 'Steady: 1 concept, 3 problems a day' }, sprint: { read: 2, solve: 6, label: 'Sprint: 2 concepts, 6 problems a day' } };
const due = () => Object.keys(S.p).filter(id => P[id] && S.p[id].due && S.p[id].due <= day() && (S.p[id].solved || S.p[id].retry)).sort((a, b) => S.p[a].due < S.p[b].due ? -1 : 1);
function gauntletPick() {
  const log = dayLog();
  if (log.g && P[log.g]) return log.g;
  const pool = UNITS.filter(u => !u.project && S.lessons[u.id] && u.phase >= 1).flatMap(u => [...u.extra, ...u.core]);
  if (pool.length < 5) return null;
  const fresh = pool.filter(id => !solved(id));
  const from = fresh.length ? fresh : pool;
  log.g = from[Math.floor(Math.random() * from.length)]; save();
  return log.g;
}
function plan() {
  const log = dayLog(), pace = PACE[S.pace] || PACE.steady, items = [];
  due().slice(0, 2).forEach(id => items.push({ kind: 'Rematch', what: P[id].title, href: `#/p/${id}`, key: 'p:' + id, rematch: id }));
  let reads = log.read, slots = pace.solve + log.bonus - log.solved;
  for (const u of UNITS) {
    if (cleared(u)) continue;
    if (u.project) { if (slots > 0) items.push({ kind: 'Project', what: u.title, href: `#/unit/${u.id}`, key: 'u:' + u.id }); break; }
    if (!S.lessons[u.id]) {
      if (reads >= pace.read) break;
      items.push({ kind: 'Read', what: u.title, href: `#/read/${u.id}`, key: 'l:' + u.id });
      reads++;
    }
    const open = required(u).filter(id => !solved(id) && !S.p[id]?.retry); // a given-up problem waits for its rematch date
    open.slice(0, Math.max(0, slots)).forEach(id => items.push({ kind: P[id].boss ? 'Boss' : 'Solve', what: P[id].title, href: `#/p/${id}`, key: 'p:' + id }));
    if (open.length || required(u).some(id => !solved(id))) break;
  }
  return items;
}
function viewHome() {
  const log = dayLog(), items = plan();
  const doneList = log.done.filter(k => !items.some(i => i.key === k)).map(k => {
    const [t, id] = [k.slice(0, 1), k.slice(2)];
    return t === 'p' && P[id] ? [P[id].boss ? 'Boss' : 'Solve', P[id].title] : t === 'l' && U[id] ? ['Read', U[id].title] : t === 'u' && U[id] ? ['Project', U[id].title] : null;
  }).filter(Boolean);
  const finished = !items.length && !!doneList.length;
  const g = gauntletPick();
  app.innerHTML = `<div class="home">
    <section class="today">
      <h1>Today's sheet</h1>
      <p class="mute">${finished ? 'Done for today. Sleep is when this sticks.' : items.length ? 'Work top to bottom. Read before you solve.' : 'Nothing is planned yet.'}</p>
      <ul class="todo">
        ${doneList.map(([k, w]) => `<li class="done"><a href="#/notebook"><span class="kind">${k}</span><span class="what">${esc(w)}</span></a></li>`).join('')}
        ${items.map(i => `<li><a href="${i.href}"${i.rematch ? ` data-rematch="${i.rematch}"` : ''}><span class="kind">${i.kind}</span><span class="what">${esc(i.what)}</span></a></li>`).join('')}
      </ul>
      <div class="row">
        ${items.length ? `<a class="btn go" href="${items[0].href}"${items[0].rematch ? ` data-rematch="${items[0].rematch}"` : ''}>Start: ${esc(items[0].what)}</a>` : `<button class="btn" id="oneMore">Add one more problem</button>`}
        ${g ? `<a class="btn" href="#/gauntlet">Gauntlet</a>` : ''}
      </div>
      <h3>Last 12 weeks</h3>
      <div class="heat" aria-label="Days you worked in the last 12 weeks">${Array.from({ length: 84 }, (_, i) => { const k = addDays(i - 83), xp = (S.days[k] || {}).xp || 0; return `<i class="${xp >= 150 ? 'l3' : xp >= 60 ? 'l2' : xp ? 'l1' : ''}" title="${k}: ${xp} XP"></i>`; }).join('')}</div>
    </section>
    <section><div class="curve-wrap">${curveSVG()}</div><p class="small mute">Each dot is one concept. <a href="#/path">See every unit</a>.</p></section>
  </div>`;
  const more = $('#oneMore');
  if (more) more.onclick = () => { dayLog().bonus++; save(); viewHome(); };
}
function curveSVG() {
  const W2 = 760, H2 = 400, n = UNITS.length, x0 = 50, y0 = 350;
  const pt = i => { const f = i / Math.max(1, n - 1); return [x0 + f * (W2 - x0 - 26), y0 - Math.pow(f, 1.25) * (y0 - 30) - Math.sin(f * 21) * 7]; };
  const pts = UNITS.map((_, i) => pt(i));
  const cur = current();
  const dividers = PHASES.map(ph => {
    const i = UNITS.findIndex(u => u.phase === ph.id); if (i < 0) return '';
    const X = pts[i][0] - 4;
    const low = pts[i][1] > (y0 + 30) / 2; // the curve is low here, so the label goes up top
    return D.line(X, y0 + 6, X, 20, 'dim-line') + `<text class="tx soft" font-size="13" text-anchor="${low ? 'end' : 'start'}" transform="translate(${X + 13} ${low ? 36 : y0 + 2}) rotate(-90)">${esc(ph.title)}</text>`;
  }).join('');
  return `<svg class="curve" viewBox="0 0 ${W2} ${H2}" role="img" aria-label="Your progress plotted as a rising curve; each dot links to a unit">
    ${D.arrow(x0 - 14, y0 + 8, W2 - 6, y0 + 8)}${D.arrow(x0 - 14, y0 + 8, x0 - 14, 12)}
    ${D.t(x0 - 8, 20, 'how cracked you are', { cls: 'soft', size: 15 })}${D.t(W2 - 10, y0 + 30, 'sheets filled', { a: 'end', cls: 'soft', size: 15 })}
    <g opacity=".35">${dividers}</g>
    <path class="plotted" pathLength="1" d="M${pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L')}"/>
    ${UNITS.map((u, i) => {
      const [x, y] = pts[i], st = cleared(u) ? 'cleared' : isOpen(u) ? 'open' : 'locked';
      return `<a href="#/unit/${u.id}" aria-label="${esc(u.title)}, ${st}"><title>${esc(u.title)}</title><circle class="nd ${st}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>${u === cur ? `<circle class="here" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"/>` : ''}</a>`;
    }).join('')}
    ${cur ? (() => { const [x, y] = pts[UNITS.indexOf(cur)];
      // The area up and left of a rising curve is empty. Too near the axis for that, so point at it from above.
      return x > 165 ? D.t(x - 16, y - 14, 'you are here', { a: 'end', cls: 'r', size: 17 })
        : D.t(x + 8, y - 66, 'you are here', { cls: 'r', size: 17 }) + D.arrow(x + 22, y - 58, x + 4, y - 16, 'r'); })() : ''}
  </svg>`;
}
function viewPath() {
  const cur = current();
  app.innerHTML = `<h1>The whole road</h1><p class="mute">Units open in order. Already know something? Open any unit and choose to start there.</p>
    ${PHASES.map(ph => {
      const us = UNITS.filter(u => u.phase === ph.id), done = us.filter(cleared).length;
      return `<details class="phase" ${us.includes(cur) || !cur ? 'open' : ''}><summary><span><b>${esc(ph.title)}</b> <span class="mute small">${esc(ph.blurb)}</span></span><span class="tag">${done} of ${us.length}</span></summary>
        <div class="units">${us.map(u => `<a href="#/unit/${u.id}" class="${cleared(u) ? 'cleared' : isOpen(u) ? '' : 'locked'}"><span>${esc(u.title)}</span><span class="small mute">${cleared(u) ? 'done' : u === cur ? 'now' : isOpen(u) ? 'open' : ''}</span></a>`).join('')}</div></details>`;
    }).join('')}`;
}

// ---------- unit ----------
function viewUnit(id) {
  const u = U[id]; if (!u) return viewPath();
  if (u.project) return viewProject(u);
  const open = isOpen(u), read = !!S.lessons[u.id];
  const row = pid => {
    const p = P[pid], s = S.p[pid] || {};
    const tags = `<span class="row"><span class="tag ${p.diff}">${p.diff}</span>${p.boss ? '<span class="tag boss">Boss</span>' : ''}${s.solved ? '<span class="tag">solved</span>' : ''}</span>`;
    return read ? `<li><a href="#/p/${pid}"><span>${esc(p.title)}</span>${tags}</a></li>` : `<li><span class="lockd"><span>${esc(p.title)}</span>${tags}</span></li>`;
  };
  app.innerHTML = `<div class="read"><a class="small" href="#/path">All units</a>
    <h1>${esc(u.title)}</h1><p class="mute">${esc(PHASES[u.phase].title)}</p>
    ${!open ? `<p>This opens after <a href="#/unit/${UNITS[UNITS.indexOf(u) - 1].id}">${esc(UNITS[UNITS.indexOf(u) - 1].title)}</a>.</p><button class="btn" id="unlock">Start here anyway</button>` :
      `<a class="btn ${read ? '' : 'go'}" href="#/read/${u.id}">${read ? 'Read the concept again' : 'Read the concept first'} (${u.mins} min)</a>`}
    <h2>Problems</h2>${read ? '' : '<p class="mute small">These open once you have read the concept.</p>'}
    <ul class="plist">${[...u.core, ...(u.boss ? [u.boss] : [])].map(row).join('')}</ul>
    ${u.extra.length ? `<h3>Extra rounds</h3><p class="mute small">Optional, and they count toward XP and the Gauntlet.</p><ul class="plist">${u.extra.map(row).join('')}</ul>` : ''}</div>`;
  const b = $('#unlock');
  if (b) b.onclick = () => { S.unlocked[u.id] = true; save(); route(); };
}
function viewProject(u) {
  const done = S.projects[u.id] = S.projects[u.id] || {};
  app.innerHTML = `<div class="read"><a class="small" href="#/path">All units</a><h1>${esc(u.title)}</h1><p class="mute">${esc(PHASES[u.phase].title)} · on your own machine, about ${esc(u.project.time)}</p>
    ${!isOpen(u) ? `<p>This opens after <a href="#/unit/${UNITS[UNITS.indexOf(u) - 1].id}">${esc(UNITS[UNITS.indexOf(u) - 1].title)}</a>.</p><button class="btn" id="unlock">Start here anyway</button>` : ''}
    <div>${blocks(u.read || [])}</div>
    <h2>The job</h2>${u.project.brief}
    <h2>It counts as done when</h2>
    ${u.project.check.map((c, i) => `<label class="check"><input type="checkbox" data-i="${i}" ${done[i] ? 'checked' : ''}><span>${c}</span></label>`).join('')}
    <div class="teach"><label for="pnote"><h3 style="margin-top:.5em">What broke, and what you learned</h3></label><textarea id="pnote" class="plain" rows="4">${esc(S.teach['project:' + u.id] || '')}</textarea></div></div>`;
  wireBlocks(app, u.read || []);
  const b = $('#unlock');
  if (b) b.onclick = () => { S.unlocked[u.id] = true; save(); route(); };
  $('#pnote').oninput = e => { S.teach['project:' + u.id] = e.target.value; save(); };
  $$('[data-i]', app).forEach(c => c.onchange = () => {
    const was = cleared(u);
    done[c.dataset.i] = c.checked; save();
    if (!was && cleared(u)) { gain(400, 'u:' + u.id); stamp('SHIPPED'); toast('+400 XP'); }
    head();
  });
}

// ---------- reading ----------
function viewRead(id) {
  const u = U[id]; if (!u) return viewPath();
  app.innerHTML = `<article class="read"><a class="small" href="#/unit/${id}">${esc(u.title)}</a>
    <h1>${esc(u.title)}</h1>
    <div>${blocks(u.read)}</div>
    <section class="teach"><h2>Now say it back</h2>
      <p>Close your eyes for a moment. Then explain the idea in your own words, as if to a friend. Nobody grades this. Writing it is how you find out what you did not understand.</p>
      <label class="small mute" for="teach">Your explanation (it goes in your notebook)</label>
      <textarea id="teach" class="plain" rows="5">${esc(S.teach[id] || '')}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn go" id="doneRead">${S.lessons[id] ? 'Save' : 'Mark as read'}</button><span class="small mute" id="teachMsg"></span></div>
    </section></article>`;
  wireBlocks(app, u.read);
  $('#teach').oninput = e => { S.teach[id] = e.target.value; save(); };
  $('#doneRead').onclick = () => {
    if (($('#teach').value || '').trim().length < 20) { $('#teachMsg').textContent = 'Write at least a sentence first.'; return $('#teach').focus(); }
    if (!S.lessons[id]) { S.lessons[id] = day(); dayLog().read++; gain(20, 'l:' + id); toast('+20 XP'); }
    save(); location.hash = `#/unit/${id}`;
  };
}

// ---------- solve ----------
function startRematch(id) {
  const s = ps(id);
  if (s.rematching) return; // already under way: re-entering must not wipe the work
  s.prev = { algo: s.algo, code: s.code }; s.algo = ''; s.example = ''; s.code = ''; s.stage = 'rough'; s.nudges = 0; s.fails = 0; s.rematching = true; s.bigGuess = ''; s.mine = ''; s.secs = 0; s.gaveUp = false; s.passed = false; s.revealed = false;
  save(); store.del('sk:' + id).catch(() => {});
}
document.addEventListener('click', e => { const a = e.target.closest('[data-rematch]'); if (a) startRematch(a.dataset.rematch); });

function statementHTML(p, opts = {}) {
  return `<h2 style="margin-top:.3em">${esc(p.title)}</h2>
    <div class="row small"><span class="tag ${p.diff}">${p.diff}</span>${p.boss ? '<span class="tag boss">Boss</span>' : ''}<span class="mute">aim for ${p.time} min</span></div>
    ${p.desc}
    ${(p.ex || []).map(([i, o, w]) => `<div class="ex"><b>in</b> ${esc(i)}<br><b>out</b> ${esc(o)}${w ? `<br><span class="mute">${esc(w)}</span>` : ''}</div>`).join('')}
    ${p.constraints && p.constraints.length ? `<p class="small mute">${p.constraints.map(esc).join(' · ')}</p>` : ''}`;
}
function viewSolve(id, mode) {
  const p = P[id]; if (!p) return viewPath();
  timers.forEach(clearInterval); timers = []; // stage changes re-render without going through the router
  const u = PU[id], s = ps(id), gauntlet = mode === 'gauntlet';
  if (s.gaveUp && !s.passed && s.due <= day()) startRematch(id); // the comeback date has arrived
  if (!S.lessons[u.id] && !gauntlet) return (location.hash = `#/read/${u.id}`);
  const canCode = () => s.example.trim().length >= 3 && s.algo.trim().length >= 30;
  const tabs = [['rough', 'Rough'], ['code', 'Code'], ['debrief', 'Debrief']];
  const crumb = gauntlet ? 'Gauntlet: no topic given. Work out what kind of problem this is.' : `<a href="#/unit/${u.id}">${esc(u.title)}</a>`;
  app.innerHTML = `<div class="small mute">${crumb}${s.rematching ? ' · Rematch: from a blank page' : ''}</div>
    <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-tab="${k}" aria-selected="${s.stage === k}" ${k === 'code' && !canCode() ? 'disabled' : ''} ${k === 'debrief' && !s.passed && !s.gaveUp ? 'disabled' : ''}>${n}</button>`).join('')}</div>
    <div id="stage"></div>`;
  const setStage = k => { s.stage = k; save(); viewSolve(id, mode); };
  $$('[data-tab]', app).forEach(b => b.onclick = () => setStage(b.dataset.tab));
  const box = $('#stage');
  every(1000, () => { if (!document.hidden && s.stage !== 'debrief' && !s.passed) { s.secs++; if (s.secs % 15 === 0) save(); } });

  if (s.stage === 'rough') {
    box.innerHTML = `<div class="solve rough"><div class="statement">${statementHTML(p)}</div><div>
      <div id="padHost"></div>
      <h3>1. Work one example by hand</h3>
      <textarea id="ex" rows="2" placeholder="Your own input, and the answer you worked out">${esc(s.example)}</textarea>
      <h3>2. Write the steps, no Python</h3>
      <p class="small mute">How did you get that answer? Write what you did, step by step, so a friend could follow it.</p>
      <textarea id="algo" class="plain" rows="6">${esc(s.algo)}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn go" id="toCode">Turn it into code</button><span class="small mute" id="gate"></span></div>
    </div></div>`;
    mountPad($('#padHost'), 'sk:' + id);
    const refresh = () => {
      s.example = $('#ex').value; s.algo = $('#algo').value; save();
      const c = canCode();
      $('#toCode').disabled = !c; $('[data-tab=code]', app).disabled = !c;
      $('#gate').textContent = c ? '' : !s.example.trim() ? 'Work an example first.' : 'Write your steps first, a couple of lines at least.';
    };
    $('#ex').oninput = $('#algo').oninput = refresh; refresh();
    $('#toCode').onclick = () => setStage('code');
    colour(box);
  }

  if (s.stage === 'code') {
    if (!canCode()) return setStage('rough');
    Engine.warm();
    const noHelp = p.boss || gauntlet;
    box.innerHTML = `<div class="solve"><div class="statement">
        ${statementHTML(p)}
        <h3>Your steps</h3><textarea id="algo2" class="plain" rows="5" style="width:100%">${esc(s.algo)}</textarea>
        <details style="margin-top:6px"><summary class="small">Your sketch</summary><canvas class="thumb" id="thumb"></canvas></details>
        <div id="nudges">${(p.nudge || []).slice(0, s.nudges).map(n => `<div class="nudge">${n}</div>`).join('')}</div>
      </div><div>
        <textarea id="code">${esc(s.code || p.start)}</textarea>
        <div class="row" style="margin-top:8px">
          <button class="btn go" id="run">Run tests</button><span class="small mute">Ctrl + Enter</span>
          <button class="btn" id="comments" title="Your own steps, pasted in as comments to code against">Paste my steps as comments</button>
          <span style="flex:1"></span>
          ${noHelp ? '' : '<button class="btn quiet" id="nudgeBtn"></button>'}
          <button class="btn quiet" id="giveUp">Give up</button>
        </div>
        <div class="results" id="results" aria-live="polite"></div>
      </div></div>`;
    $('details', box).addEventListener('toggle', () => store.get('sk:' + id).then(v => { const c = $('#thumb'); if (c && v) paint(c.getContext('2d'), v, fit(c)); }).catch(() => {}));
    colour(box);
    $('#algo2').oninput = e => { s.algo = e.target.value; save(); };
    const runIt = async () => {
      s.code = cm.getValue(); save();
      const out = $('#results'), btn = $('#run');
      btn.disabled = true; out.innerHTML = '<p class="mute small">Starting.</p>';
      const r = await Engine.run(s.code, p.tests, m => { out.innerHTML = `<p class="mute small">${esc(m)}</p>`; });
      btn.disabled = false;
      if (location.hash.split('/')[2] !== id) return;
      showResult(p, s, r, out, mode, setStage);
      updateNudge();
    };
    const cm = editor($('#code'), runIt);
    cm.on && cm.on('change', () => { s.code = cm.getValue(); save(); });
    $('#run').onclick = runIt;
    $('#comments').onclick = () => {
      const lines = s.algo.trim().split('\n').filter(l => l.trim()).map(l => '    # ' + l.trim());
      const v = cm.getValue(), at = v.search(/^(def |class ).*$/m);
      if (at < 0) return cm.setValue(lines.join('\n') + '\n' + v);
      const eol = v.indexOf('\n', at);
      cm.setValue(eol < 0 ? v + '\n' + lines.join('\n') + '\n    ' : v.slice(0, eol + 1) + lines.join('\n') + '\n' + v.slice(eol + 1));
      cm.focus();
    };
    // Nudges cost XP and open only after a real attempt: time spent or a failed run.
    const nudgeReady = () => s.fails >= 2 || s.secs >= (s.nudges + 1) * Math.max(120, p.time * 20);
    const updateNudge = () => {
      const b = $('#nudgeBtn'); if (!b) return;
      const left = (p.nudge || []).length - s.nudges;
      b.hidden = left <= 0;
      b.disabled = !nudgeReady();
      b.textContent = nudgeReady() ? `Ask for a nudge (${left} left, costs XP)` : 'Nudge opens after more effort';
    };
    updateNudge(); every(5000, updateNudge);
    if ($('#nudgeBtn')) $('#nudgeBtn').onclick = () => { s.nudges++; save(); $('#nudges').insertAdjacentHTML('beforeend', `<div class="nudge">${p.nudge[s.nudges - 1]}</div>`); updateNudge(); };
    $('#giveUp').onclick = () => {
      if (!confirm('See the reference solution? No XP now, and this problem comes back in 2 days.')) return;
      s.gaveUp = true; s.passed = false; s.rematching = false; s.due = addDays(2); s.box = 0; s.retry = true; save(); setStage('debrief');
    };
  }

  if (s.stage === 'debrief') {
    box.innerHTML = `<div class="deb read">
      ${s.gaveUp && !s.passed ? `<p><b class="bad">Not this time.</b> This problem comes back on ${s.due}. Read the reference, close it, and then write it again yourself.</p>` : `<p><b class="ok">All tests pass.</b> ${s.nudges ? `You used ${s.nudges} nudge${s.nudges > 1 ? 's' : ''}.` : 'No nudges.'} Time on it: ${Math.floor(s.secs / 60)} min.${s.due ? ` Rematch on ${s.due}.` : ''}</p>`}
      <h3>Before you see the reference</h3>
      <label class="small mute" for="big">Time and space cost of your solution, as you see it</label><br>
      <input type="text" id="big" style="width:100%" value="${esc(s.bigGuess || '')}">
      <p style="margin-bottom:2px"><label class="small mute" for="mine">The general idea you used, in one line. This goes in your notebook.</label></p>
      <textarea id="mine" class="plain" rows="2">${esc(s.mine || '')}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn go" id="reveal" ${s.revealed ? 'hidden' : ''}>Compare with the reference</button></div>
      <div id="ref" ${s.revealed ? '' : 'hidden'}>
        <h3>Reference</h3><pre><code>${esc(p.sol)}</code></pre>
        ${p.big ? `<p><b>Cost:</b> ${esc(p.big)}</p>` : ''}${p.idea ? `<p><b>The idea:</b> ${esc(p.idea)}</p>` : ''}
        ${s.prev && s.prev.code ? `<details><summary class="small">Your code last round</summary><pre><code>${esc(s.prev.code)}</code></pre></details>` : ''}
        <p class="small mute">Yours doesn't have to match. If it's cleaner, keep yours.</p>
        <div class="row">${next(id, gauntlet)}<button class="btn quiet" id="again">Solve it again from blank</button></div>
      </div></div>`;
    $('#big').oninput = e => { s.bigGuess = e.target.value; save(); };
    $('#mine').oninput = e => { s.mine = e.target.value; save(); };
    $('#reveal').onclick = () => { s.revealed = true; save(); viewSolve(id, mode); };
    if ($('#again')) $('#again').onclick = () => { s.rematching = false; startRematch(id); viewSolve(id, mode); };
    colour(box);
  }
}
function next(id, gauntlet) {
  if (gauntlet) return '<a class="btn go" href="#/">Back to today</a>';
  const u = PU[id], open = required(u).find(x => !solved(x));
  return open ? `<a class="btn go" href="#/p/${open}">Next: ${esc(P[open].title)}</a><a class="btn" href="#/">Back to today</a>` : `<a class="btn go" href="#/">Back to today</a>`;
}
function showResult(p, s, r, out, mode, setStage) {
  const log = r.stdout ? `<div class="small mute" style="margin-top:8px">What you printed</div><div class="log">${esc(r.stdout)}</div>` : '';
  if (r.compileError) { s.fails++; save(); out.innerHTML = `<div class="fail"><b>Your code stopped before the tests could run.</b>\n${esc(r.compileError)}</div>${log}`; return; }
  const results = r.results, passed = results.filter(x => x.ok).length, first = results.findIndex(x => !x.ok);
  if (first >= 0) {
    s.fails++; save();
    const f = results[first], t = p.tests[first];
    // Only the first failure is shown: it is a clue to think about, not a list of cases to patch one by one.
    out.innerHTML = `<div class="fail"><b>${passed} of ${results.length} tests pass.</b> First failure:\n${esc(t.label)}\n${f.err ? esc(f.err) : `want ${esc(f.want)}\n got ${esc(f.got)}`}</div>${f.log ? `<div class="log">${esc(f.log)}</div>` : ''}${log}`;
    return;
  }
  out.innerHTML = `<div class="passall"><b class="ok">${results.length} of ${results.length} tests pass.</b></div>${log}`;
  win(p, s, mode);
  setTimeout(() => setStage('debrief'), 1300);
}
function win(p, s, mode) {
  const firstTime = !s.solved;
  const gauntlet = mode === 'gauntlet';
  let xp = BASE[p.diff] || 40;
  if (p.boss || gauntlet) xp *= 2;
  xp = Math.round(xp * Math.max(0.4, 1 - s.nudges * 0.2));
  if (!firstTime) xp = Math.round(xp / 2);
  if (s.retry) xp = Math.round(xp / 2);
  const round = (s.rematching ? (s.box || 0) + 1 : 0);
  s.box = round; s.due = addDays(GAP[Math.min(round, GAP.length - 1)]);
  if (firstTime) { s.solved = day(); dayLog().solved++; }
  s.passed = true; s.rematching = false; s.retry = false; s.gaveUp = false; s.revealed = false;
  gain(xp, 'p:' + p.id);
  toast(`+${xp} XP`);
  const u = PU[p.id];
  stamp(p.boss ? 'CRACKED' : gauntlet ? 'SURVIVED' : 'PASSED');
  if (cleared(u)) toast(`Unit done: ${u.title}`);
}

// ---------- gauntlet ----------
function viewGauntlet() {
  const id = gauntletPick();
  if (!id) { app.innerHTML = `<div class="read"><h1>Gauntlet</h1><p>The Gauntlet gives you one problem with no topic label, no nudges and double XP. Real problems don't announce their pattern, so this is where you learn to spot it.</p><p>It opens after you've read your first core-patterns concept.</p><a class="btn go" href="#/">Back to today</a></div>`; return; }
  const p = P[id];
  app.innerHTML = `<div class="read"><h1>Gauntlet</h1><p>One problem. No topic label, no nudges, double XP. Spot the pattern yourself.</p>
    <div class="row"><a class="btn go" id="enter" href="#/p/${id}/gauntlet">Enter (aim for ${p.time} min)</a><button class="btn" id="reroll">Draw another</button></div>
    ${solved(id) ? '<p class="small mute">You have solved this one before, so it starts from a blank page.</p>' : ''}</div>`;
  $('#enter').onclick = () => { if (solved(id)) startRematch(id); };
  $('#reroll').onclick = () => { dayLog().g = null; save(); viewGauntlet(); };
}

// ---------- free rough ----------
function viewRough() {
  S.scratch = S.scratch || '# Try anything. print() shows up below.\n';
  app.innerHTML = `<h1>Rough</h1><p class="mute">A blank pad and a Python prompt, for ideas that aren't tied to a problem yet.</p>
    <div class="solve"><div id="padHost"></div><div><textarea id="code">${esc(S.scratch)}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn go" id="run">Run</button><span class="small mute">Ctrl + Enter. numpy and sqlite3 load when you import them.</span></div>
      <div class="results" id="results" aria-live="polite"></div></div></div>`;
  mountPad($('#padHost'), 'sk:scratch');
  const go = async () => {
    const out = $('#results');
    const r = await Engine.run(cm.getValue(), [], m => { out.innerHTML = `<p class="mute small">${esc(m)}</p>`; });
    out.innerHTML = `<div class="log">${esc((r.stdout || '') + (r.compileError ? '\n' + r.compileError : '')) || '(nothing printed)'}</div>`;
  };
  const cm = editor($('#code'), go);
  cm.on && cm.on('change', () => { S.scratch = cm.getValue(); save(); });
  $('#run').onclick = go;
}

// ---------- notebook ----------
function viewNotebook() {
  const entries = [
    ...UNITS.filter(u => S.teach[u.id]).map(u => ({ t: u.title, k: 'Concept, in your words', b: S.teach[u.id], href: `#/read/${u.id}` })),
    ...UNITS.filter(u => S.teach['project:' + u.id]).map(u => ({ t: u.title, k: 'Project notes', b: S.teach['project:' + u.id], href: `#/unit/${u.id}` })),
    ...Object.keys(S.p).filter(id => P[id] && (S.p[id].mine || S.p[id].algo)).map(id => ({ t: P[id].title, k: 'Your idea and steps', b: [S.p[id].mine, S.p[id].algo].filter(Boolean).join('\n\n'), href: `#/p/${id}` }))
  ];
  app.innerHTML = `<div class="read"><h1>Notebook</h1><p class="mute">Everything you've written in your own words. This is your real study guide.</p>
    <input type="search" id="q" placeholder="Search your notes" aria-label="Search your notes" style="width:100%">
    <div id="notes"></div></div>`;
  const show = q => {
    const hit = entries.filter(e => !q || (e.t + ' ' + e.b).toLowerCase().includes(q));
    $('#notes').innerHTML = hit.length ? hit.map(e => `<div class="note-item"><a href="${e.href}"><b>${esc(e.t)}</b></a> <span class="small mute">${e.k}</span><div class="plain">${esc(e.b)}</div></div>`).join('') : `<p class="mute">${entries.length ? 'No notes match that search.' : 'Nothing yet. Read your first concept and say it back.'}</p>`;
  };
  $('#q').oninput = e => show(e.target.value.toLowerCase().trim()); show('');
}

// ---------- settings ----------
function viewSettings() {
  app.innerHTML = `<div class="read"><h1>Settings</h1>
    <h2>Daily pace</h2><p class="mute">Today's sheet stops when this is done. You can always add one more.</p>
    ${Object.entries(PACE).map(([k, v]) => `<label class="check"><input type="radio" name="pace" value="${k}" ${S.pace === k ? 'checked' : ''}><span>${v.label}</span></label>`).join('')}
    <h2>Backup</h2><p class="mute">Your progress and sketches live only in this browser. Export before you clear browser data or change machine.</p>
    <div class="row"><button class="btn" id="exp">Export backup</button><label class="btn">Import backup<input type="file" id="imp" accept=".json" hidden></label><button class="btn quiet" id="wipe">Erase everything</button></div></div>`;
  $$('[name=pace]', app).forEach(r => r.onchange = () => { S.pace = r.value; save(); });
  $('#exp').onclick = async () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ progress: S, sketches: await store.all().catch(() => ({})) })], { type: 'application/json' }));
    a.download = `cracked-backup-${day()}.json`; a.click(); URL.revokeObjectURL(a.href); toast('Backup exported');
  };
  $('#imp').onchange = async e => {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      if (!data.progress || typeof data.progress.p !== 'object') throw new Error('That file is not a Cracked backup.');
      if (!confirm('Replace your current progress with this backup?')) return;
      for (const [k, v] of Object.entries(data.sketches || {})) await store.set(k, v);
      localStorage.setItem(KEY, JSON.stringify(data.progress)); location.reload();
    } catch (err) { toast('Import failed: ' + err.message); }
  };
  $('#wipe').onclick = () => { if (confirm('Erase all progress, code and notes? Sketches stay until you clear browser data.')) { localStorage.removeItem(KEY); location.hash = '#/'; location.reload(); } };
}

// ---------- router ----------
let timers = [];
const every = (ms, f) => timers.push(setInterval(f, ms));
function route() {
  timers.forEach(clearInterval); timers = [];
  const [, page, id, mode] = location.hash.split('/');
  if (!page) viewHome();
  else if (page === 'path') viewPath();
  else if (page === 'unit') viewUnit(id);
  else if (page === 'read') viewRead(id);
  else if (page === 'p') viewSolve(id, mode);
  else if (page === 'gauntlet') viewGauntlet();
  else if (page === 'rough') viewRough();
  else if (page === 'notebook') viewNotebook();
  else if (page === 'settings') viewSettings();
  else viewHome();
  head();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
