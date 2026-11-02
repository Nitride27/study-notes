// Leapfrog prep portal: hash-routed vanilla JS, progress in localStorage.
const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const app = $('#app');
const KEY = 'lfprep-v1';
const S = Object.assign({ lang: 'py', p: {}, mcq: {}, lessons: {}, mocks: [], mock: null }, JSON.parse(localStorage.getItem(KEY) || '{}'));
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const P = Object.fromEntries(PROBLEMS.map(p => [p.id, p]));
const L = Object.fromEntries(LESSONS.map(l => [l.id, l]));
const LANG_NAME = { py: 'Python', js: 'JavaScript' };
const ps = id => (S.p[id] = S.p[id] || { stage: 0, logic: {}, blanks: {}, code: {}, secs: 0, hintsEarly: 0 });
const lfRep = id => LF_HOT[id] && LF_HOT[id] !== 'pick'; // value is the source quote
const lfTag = id => lfRep(id) ? ` <span class="pill lf-rep" title="${esc(LF_HOT[id])}">★ Reported</span>` : LF_HOT[id] ? ' <span class="pill lf-pick" title="Classic problem for a topic Leapfrog candidates reported">Leapfrog pick</span>' : '';
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

let timers = [];
const every = (ms, f) => timers.push(setInterval(f, ms));
const handlers = {}; // data-act -> fn(el, event)
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && handlers[el.dataset.act]) handlers[el.dataset.act](el, e);
});

$('#lang').value = S.lang;
$('#lang').onchange = e => { S.lang = e.target.value; save(); route(); };

// ---------- shared widgets ----------
function mcqHTML(key, q, chosen) {
  const answered = chosen !== undefined && chosen !== null;
  return `<div class="q" id="q-${key}">
    <div style="white-space:pre-wrap"><b>${esc(q.q)}</b></div>
    ${q.code ? `<pre><code data-lang="${guessLang(q.code)}">${esc(q.code)}</code></pre>` : ''}
    ${q.opts.map((o, i) => `<button class="opt ${answered ? (i === q.a ? 'right' : i === chosen ? 'wrong' : '') : ''}" ${answered ? 'disabled' : ''} data-act="mcq" data-key="${key}" data-i="${i}">${String.fromCharCode(65 + i)}. ${esc(o)}</button>`).join('')}
    ${answered ? `<div class="why">${chosen === q.a ? '<b class="ok">Correct.</b> ' : '<b class="bad">Not quite.</b> '}${esc(q.why)}</div>` : ''}
  </div>`;
}
const mcqAnswer = {}; // key -> fn(i)
handlers.mcq = el => mcqAnswer[el.dataset.key] && mcqAnswer[el.dataset.key](+el.dataset.i);

function codeEditor(ta, lang, onRun) {
  if (window.CodeMirror) {
    const n = lang === 'py' ? 4 : 2;
    const cm = CodeMirror.fromTextArea(ta, {
      mode: lang === 'py' ? 'python' : 'javascript', theme: 'lf', lineNumbers: true, indentUnit: n, tabSize: n,
      indentWithTabs: false, matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true, viewportMargin: Infinity,
      extraKeys: {
        Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection(' '.repeat(n)),
        'Shift-Tab': 'indentLess', 'Ctrl-Enter': () => onRun(), 'Cmd-Enter': () => onRun()
      }
    });
    cm.on('change', () => { cm.save(); ta.dispatchEvent(new Event('input')); }); // keep textarea as the source of truth
    ta.cm = cm;
    return;
  }
  const unit = lang === 'py' ? '    ' : '  ';
  ta.addEventListener('keydown', e => {
    const { selectionStart: s, selectionEnd: en, value: v } = ta;
    if (e.key === 'Tab') {
      e.preventDefault();
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      if (e.shiftKey) {
        if (v.startsWith(unit, lineStart)) { ta.setRangeText('', lineStart, lineStart + unit.length, 'end'); }
      } else ta.setRangeText(unit, s, en, 'end');
    } else if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      const line = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
      let indent = line.match(/^\s*/)[0];
      if (/[:{[(]\s*$/.test(line)) indent += unit;
      ta.setRangeText('\n' + indent, s, en, 'end');
    } else if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); onRun(); return; }
    else return;
    ta.dispatchEvent(new Event('input'));
  });
}

// Colour every <pre><code data-lang> added to the page (lessons, solutions, syntax sheet).
function guessLang(code) { return /console\.log|const |let |=>|function /.test(code) ? 'js' : /print\(|def |import |\bin range/.test(code) ? 'py' : ''; }
function highlight(root) {
  if (!window.CodeMirror || !CodeMirror.runMode) return;
  root.querySelectorAll('pre code[data-lang]:not([data-hl])').forEach(el => {
    el.dataset.hl = 1;
    if (!el.dataset.lang) return;
    CodeMirror.runMode(el.textContent, el.dataset.lang === 'py' ? 'python' : 'javascript', el);
    el.parentElement.classList.add('cm-s-lf');
  });
}
let hlQueued = false;
new MutationObserver(() => { if (!hlQueued) { hlQueued = true; requestAnimationFrame(() => { hlQueued = false; highlight(app); }); } }).observe(app, { childList: true, subtree: true });

// ---------- toasts ----------
function toast(msg, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind; t.innerHTML = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('out'), 3200);
  setTimeout(() => t.remove(), 3700);
}

function starter(p, lang) {
  const isList = p.io && (p.io.ret === 'list' || (p.io.args || []).some(k => k === 'list' || k === 'cycle'));
  if (lang === 'py') return `${isList ? '# ListNode(val=0, next=None) is predefined: node.val, node.next\n' : ''}def ${p.fn.py}(${p.params.join(', ')}):\n    `;
  return `${isList ? '// ListNode(val, next) is predefined: new ListNode(1), node.val, node.next\n' : ''}function ${p.fn.js}(${p.params.join(', ')}) {\n  \n}\n`;
}

function argsLabel(p, args) { return p.params.map((n, i) => `${n} = ${JSON.stringify(args[i])}`).join(', '); }

function resultsHTML(p, tests, r) {
  if (r.compileError) return `<div class="t fail"><b class="bad">Error</b>\n<pre>${esc(r.compileError)}</pre></div>`;
  const pass = r.results.filter((x, i) => !x.error && checkResult(x.out, tests[i][1], p.compare)).length;
  return `<div class="spread"><b class="${pass === tests.length ? 'ok' : 'bad'}">${pass} / ${tests.length} tests passed</b></div>` +
    r.results.map((x, i) => {
      const ok = !x.error && checkResult(x.out, tests[i][1], p.compare);
      const exp = tests[i][1] && tests[i][1].anyOf ? tests[i][1].anyOf.map(a => JSON.stringify(a)).join(' or ') : JSON.stringify(tests[i][1]);
      return `<div class="t ${ok ? 'pass' : 'fail'}">${ok ? '✅' : '❌'} ${esc(argsLabel(p, tests[i][0]))}
        ${ok ? '' : `<div>expected: ${esc(exp)}</div><div>got: <span class="bad">${esc(x.error || x.out)}</span></div>`}
        ${x.log ? `<div class="log">stdout: ${esc(x.log)}</div>` : ''}</div>`;
    }).join('');
}

// ---------- views ----------
function viewPlan() {
  const exam = new Date(EXAM_AT);
  const solved = PROBLEMS.filter(p => S.p[p.id] && S.p[p.id].solved).length;
  const read = LESSONS.filter(l => S.lessons[l.id]).length;
  const mcqRight = MCQS.filter(q => S.mcq[q.id] === true).length;
  const next = planOrder().find(id => !(S.p[id] && S.p[id].solved));
  const revisit = revisitList();
  const nowInfo = planNow();
  const blockHTML = b => {
    const items = [];
    (b.lessons || []).forEach(id => items.push(`<a href="#/learn/${id}">${S.lessons[id] ? '✓ ' : '📘 '}${esc(L[id].title)}</a>`));
    (b.problems || []).forEach(id => items.push(`<a href="#/p/${id}">${S.p[id] && S.p[id].solved ? '✓ ' : ''}${esc(P[id].title)} <span class="pill ${P[id].diff}">${P[id].diff[0]}</span>${lfTag(id)}</a>`));
    (b.mcq || []).forEach(c => items.push(`<a href="#/mcq/${c}">❓ ${esc(MCQ_CATS[c])}</a>`));
    if (b.mock) items.push(`<a href="#/mock">⏱ Start mock exam</a>`);
    if (b.revisit) items.push(`<span class="small mute">Revisit list (${revisit.length}) is shown in the panel above.</span>`);
    if (b.link) items.push(`<a href="${b.link}">Open</a>`);
    if (b.extra) items.push(`<div class="small" style="margin-top:4px"><span class="mute">Extra if ahead of schedule:</span> ${b.extra.map(id => `<a href="#/p/${id}">${S.p[id] && S.p[id].solved ? '✓ ' : ''}${esc(P[id].title)} <span class="pill ${P[id].diff}">${P[id].diff[0]}</span>${lfTag(id)}</a>`).join(' ')}</div>`);
    const total = (b.problems || []).length, done = (b.problems || []).filter(id => S.p[id] && S.p[id].solved).length;
    const cls = b === nowInfo.cur ? 'now' : (nowInfo.behind || []).includes(b) ? 'behind' : '';
    return `<div class="block ${cls}"><div class="t">${b.t}${cls === 'now' ? '<div class="nowtag">NOW</div>' : cls === 'behind' ? '<div class="behindtag">unfinished</div>' : ''}</div><div class="b"><div class="spread"><b>${esc(b.title)}</b>${total ? `<span class="small mute">${done}/${total}</span>` : ''}</div>
      <div class="links">${items.join(' ')}</div></div></div>`;
  };
  app.innerHTML = `
  <div class="hero">
    <div class="card">
      <div class="mute small">Leapfrog on-site coding exam · Mon 2 Nov, 7:30 AM · 3 MCQ + 2 problems · 60 min</div>
      <div class="countdown" id="cd"></div>
      <div class="row" style="margin-top:12px">
        ${next ? `<a class="btn primary" href="#/p/${next}">Next up: ${esc(P[next].title)} →</a>` : '<span class="ok">All plan problems solved 🎉</span>'}
        <a class="btn" href="#/mock">Mock exam</a>
        <a class="btn" href="#/learn/strategy">Exam game plan</a>
      </div>
    </div>
    <div class="card">
      <div class="spread"><span>Problems solved</span><b>${solved}/${PROBLEMS.length}</b></div><div class="bar"><i style="width:${solved / PROBLEMS.length * 100}%"></i></div>
      <div class="spread" style="margin-top:10px"><span>Lessons read</span><b>${read}/${LESSONS.length}</b></div><div class="bar"><i style="width:${read / LESSONS.length * 100}%"></i></div>
      <div class="spread" style="margin-top:10px"><span>MCQs correct</span><b>${mcqRight}/${MCQS.length}</b></div><div class="bar"><i style="width:${mcqRight / MCQS.length * 100}%"></i></div>
      <div class="small mute" style="margin-top:10px">Mocks taken: ${S.mocks.length}${S.mocks.length ? ` · last score ${S.mocks[S.mocks.length - 1].score}%` : ''}</div>
    </div>
  </div>
  ${nowCard(nowInfo)}
  ${revisit.length ? `<div class="card"><h3 style="margin-top:0">🔁 Revisit list: rewrite these from scratch</h3><div class="links">${revisit.map(id => `<a href="#/p/${id}" style="margin-right:12px">${esc(P[id].title)}</a>`).join('')}</div></div>` : ''}
  <div class="card small mute">How each problem works: <b>1 Think</b> (guided logic questions) → <b>2 Fill the gaps</b> (key lines, ${LANG_NAME[S.lang]} syntax) → <b>3 Write it</b> (whole solution from a blank editor, real tests) → <b>4 Review</b>. Hints unlock with time so you struggle a bit first, but not too long. Respect the time-box shown on each problem.</div>
  ${PLAN.map(d => `<div class="card plan-day"><h3>${esc(d.day)}</h3>${d.blocks.map(blockHTML).join('')}</div>`).join('')}
  <div class="card"><div class="spread"><div><b>Backup</b><div class="small mute">Progress lives in this browser only. Export it before switching browser or clearing data.</div></div>
    <div class="row"><button class="btn" data-act="exportProgress">⬇ Export progress</button><label class="btn">⬆ Import<input type="file" accept=".json" id="importFile" hidden></label><button class="btn ghost small" data-act="reset">Reset all</button></div></div></div>`;
  $('#importFile').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(txt => {
      const data = JSON.parse(txt);
      if (!data || typeof data.p !== 'object') throw new Error('not a progress file');
      if (!confirm('Replace current progress with this backup?')) return;
      localStorage.setItem(KEY, JSON.stringify(data)); location.reload();
    }).catch(err => toast('Import failed: ' + esc(err.message), 'bad'));
  };
  const cd = () => {
    const ms = exam - Date.now();
    if (ms <= 0) { $('#cd').textContent = 'Exam time. You got this.'; return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    $('#cd').textContent = `${d}d ${h}h ${m}m ${s}s to go`;
  };
  cd(); every(1000, cd);
}
handlers.exportProgress = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  a.download = `leapfrog-prep-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); URL.revokeObjectURL(a.href);
  toast('Progress exported', 'ok');
};
function nowCard(n) {
  const solvedOf = b => (b.problems || []).filter(id => S.p[id] && S.p[id].solved).length;
  const firstOpen = b => (b.problems || []).find(id => !(S.p[id] && S.p[id].solved));
  let body;
  if (n.before) body = `The plan starts <b>Saturday ${PLAN[0].blocks[0].t.split("–")[0]}</b>. Tonight: read the <a href="#/learn/strategy">Exam game plan</a> and get a good sleep.`;
  else if (!n.day) body = `Outside the planned days. Keep going with <b>Next up</b> or take a mock exam.`;
  else if (n.cur) {
    const open = firstOpen(n.cur), total = (n.cur.problems || []).length;
    body = `<b>${esc(n.cur.title)}</b>${total ? ` · ${solvedOf(n.cur)}/${total} done` : ''}${open ? ` · <a href="#/p/${open}">continue with ${esc(P[open].title)} →</a>` : n.cur.mock ? ' · <a href="#/mock">start the mock →</a>' : ''}`;
  } else if (n.next && n.next === n.day.blocks[0]) body = `Today starts at <b>${n.next.t.split('–')[0]}</b> with ${esc(n.next.title)}. Sleep first, because a rested brain codes faster.`;
  else body = n.next ? `Break time. Next block at <b>${n.next.t.split('–')[0]}</b>: ${esc(n.next.title)}` : `Done for today. Sleep well, because rest is part of the prep.`;
  const behind = (n.behind || []).length ? `<div class="small warn" style="margin-top:6px">⚠ ${n.behind.length} earlier block(s) unfinished. Don't chase all of them: finish the Easy/Medium core and move on with the schedule.</div>` : '';
  return `<div class="card nowcard"><div class="small mute">📍 Right now · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div style="margin-top:4px">${body}</div>${behind}</div>`;
}
handlers.reset = () => { if (confirm('Erase ALL progress, code and mock history?')) { localStorage.removeItem(KEY); location.reload(); } };

// core problems in schedule order, then the optional extras
const planOrder = () => [...PLAN.flatMap(d => d.blocks.flatMap(b => b.problems || [])), ...PLAN.flatMap(d => d.blocks.flatMap(b => b.extra || []))];

// Where should I be right now according to the plan?
function planNow() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const day = PLAN.find(d => d.date === today);
  if (!day) return { before: today < PLAN[0].date };
  const spans = day.blocks.map(b => { const [a, z] = b.t.split('–'); return { b, start: toMin(a), end: toMin(z || a) + (z ? 0 : 15) }; });
  const cur = spans.find(x => mins >= x.start && mins < x.end);
  const next = spans.find(x => x.start >= mins);
  const behind = spans.filter(x => x.end <= mins && (x.b.problems || []).some(id => !(S.p[id] && S.p[id].solved))).map(x => x.b);
  return { day, cur: cur && cur.b, next: next && next.b, behind };
}

function revisitList() {
  return PROBLEMS.filter(p => { const s = S.p[p.id]; return s && ((s.revealed && !s.solvedClean) || s.conf === 0); }).map(p => p.id);
}

function viewLearn() {
  app.innerHTML = `<h1>Learn the patterns</h1><p class="mute">Each lesson takes 10–20 min: when to use the pattern, a template in ${LANG_NAME[S.lang]}, pitfalls, and a quick check. Then go and solve the linked problems.</p>
  <div class="grid">${LESSONS.map(l => {
    const probs = PROBLEMS.filter(p => p.pattern === l.id);
    const done = probs.filter(p => S.p[p.id] && S.p[p.id].solved).length;
    return `<a class="card" href="#/learn/${l.id}" style="color:inherit;text-decoration:none">
      <div class="spread"><b>${S.lessons[l.id] ? '✓ ' : ''}${esc(l.title)}</b><span class="pill">${l.mins}m</span></div>
      ${probs.length ? `<div class="small mute" style="margin-top:6px">${done}/${probs.length} problems solved</div><div class="bar" style="margin-top:6px"><i style="width:${done / probs.length * 100}%"></i></div>` : ''}
    </a>`;
  }).join('')}</div>`;
}

function viewLesson(id) {
  const l = L[id];
  if (!l) return viewLearn();
  const probs = PROBLEMS.filter(p => p.pattern === id);
  const chosen = S.lessons['_c_' + id] || {};
  app.innerHTML = `<div class="lesson">
    <a href="#/learn" class="small">← all lessons</a>
    <h1>${esc(l.title)}</h1>
    <div class="card">${l.body.map(b => typeof b === 'string' ? b : `<pre><code data-lang="${S.lang}">${esc(b[S.lang])}</code></pre><div class="small mute">Showing ${LANG_NAME[S.lang]}. Switch language at the top right.</div>`).join('')}</div>
    ${l.checks && l.checks.length ? `<div class="card"><h3 style="margin-top:0">Quick check</h3>${l.checks.map((q, i) => mcqHTML(`l-${id}-${i}`, q, chosen[i])).join('')}</div>` : ''}
    ${probs.length ? `<div class="card"><h3 style="margin-top:0">Practice this pattern</h3>${problemTable(probs)}</div>` : ''}
    <button class="btn primary" data-act="lessonRead">${S.lessons[id] ? '✓ Read' : 'Mark as read'}</button>
  </div>`;
  (l.checks || []).forEach((q, i) => {
    mcqAnswer[`l-${id}-${i}`] = choice => {
      S.lessons['_c_' + id] = Object.assign(S.lessons['_c_' + id] || {}, { [i]: choice }); save();
      $(`#q-l-${id}-${i}`).outerHTML = mcqHTML(`l-${id}-${i}`, q, choice);
    };
  });
  handlers.lessonRead = () => { S.lessons[id] = true; save(); toast('📘 Lesson marked as read', 'ok'); route(); };
}

function problemTable(list) {
  return `<table><tr><th>Problem</th><th>Difficulty</th><th>Pattern</th><th>Time-box</th><th>Status</th></tr>${list.map(p => {
    const s = S.p[p.id];
    const status = !s ? '<span class="mute">not started</span>' : s.solved ? `<span class="ok">solved</span>${s.revealed && !s.solvedClean ? ' <span class="warn">(after peeking)</span>' : ''}` : `<span class="warn">in progress · ${fmt(s.secs)}</span>`;
    return `<tr class="click${lfRep(p.id) ? ' lf-row' : ''}" onclick="location.hash='#/p/${p.id}'"><td>${esc(p.title)}${lfTag(p.id)}</td><td><span class="pill ${p.diff}">${p.diff}</span></td><td class="small">${esc(L[p.pattern].title)}</td><td class="small">${p.time} min</td><td class="small">${status}</td></tr>`;
  }).join('')}</table>`;
}

function viewProblems() {
  const f = S.filter || 'All';
  const list = PROBLEMS.filter(p => f === 'All' || (f === 'Leapfrog' ? LF_HOT[p.id] : p.diff === f));
  app.innerHTML = `<div class="spread"><h1>Problems</h1><div class="row">${['All', 'Easy', 'Medium', 'Hard', 'Leapfrog'].map(d => `<button class="btn ${f === d ? 'primary' : ''}" data-act="filter" data-d="${d}">${d === 'Leapfrog' ? '★ Leapfrog only' : d}</button>`).join('')}</div></div>
  <p class="mute small">Grouped by pattern, in plan order. Leapfrog reportedly asks one easy and one medium problem, so make Easy/Medium automatic and treat Hard as a stretch. <span class="pill lf-rep">★ Reported</span> = candidates named this exact problem. <span class="pill lf-pick">Leapfrog pick</span> = classic problem for a reported topic (arrays, strings, hashmap, two pointers, stack, linked list).</p>
  ${LESSONS.filter(l => list.some(p => p.pattern === l.id)).map(l => `<div class="card"><h3 style="margin-top:0"><a href="#/learn/${l.id}">${esc(l.title)}</a></h3>${problemTable(list.filter(p => p.pattern === l.id))}</div>`).join('')}`;
  handlers.filter = el => { S.filter = el.dataset.d; save(); route(); };
}

// ---------- problem page ----------
const STAGES = ['1 · Think', '2 · Fill the gaps', '3 · Write it', '4 · Review'];
function viewProblem(id) {
  const p = P[id];
  if (!p) return viewProblems();
  const st = ps(id);
  const lang = S.lang;
  if (st.view === undefined) st.view = st.stage;
  const hintAt = [0.25, 0.5, 0.75].map(f => Math.round(p.time * 60 * f));

  app.innerHTML = `
  <div class="spread"><div><div class="row small">${prevNext(id)}</div><h1 style="margin-bottom:4px">${esc(p.title)}</h1>
    <span class="pill ${p.diff}">${p.diff}</span> <a class="pill" href="#/learn/${p.pattern}">${esc(L[p.pattern].title)}</a>${lfTag(id)} ${st.solved ? '<span class="pill Easy">solved ✓</span>' : ''}</div>
    <div class="card" style="min-width:300px;margin:0;padding:12px 16px"><div class="small mute">Time-box ${p.time} min</div><div class="timebox"><b id="clock">${fmt(st.secs)}</b><div class="bar" id="tbar"><i></i></div></div></div>
  </div>
  <div class="split" style="margin-top:14px">
    <div class="card sticky">
      ${p.desc}
      ${p.examples.map(e => `<div class="ex"><div><span class="mute">Input:</span> ${esc(e.in)}</div><div><span class="mute">Output:</span> ${esc(e.out)}</div>${e.why ? `<div class="mute">// ${esc(e.why)}</div>` : ''}</div>`).join('')}
      <div class="small mute"><b>Constraints:</b> ${p.constraints.map(esc).join(' · ')}</div>
      <h3>Hints</h3><div id="hints"></div>
    </div>
    <div>
      <div class="tabs">${STAGES.map((n, i) => `<div class="tab ${i === st.view ? 'on' : ''} ${i > st.stage ? 'locked' : ''} ${stageDone(i) ? 'done' : ''}" data-act="stage" data-i="${i}">${n}</div>`).join('')}</div>
      <div class="card" id="stage"></div>
    </div>
  </div>`;

  function stageDone(i) {
    return [p.logic.every((_, j) => st.logic[j] !== undefined), !!(st.blanks[lang] && st.blanks[lang].done), !!st.solved, st.conf !== undefined][i];
  }
  const hintsHTML = () => p.hints.map((h, i) => {
    const open = (st.hintsOpen || 0) > i;
    const unlocked = st.secs >= hintAt[i] || st.solved;
    if (open) return `<div class="hint"><b>Hint ${i + 1}:</b> ${esc(h)}</div>`;
    if (i > (st.hintsOpen || 0)) return '';
    return `<div class="hint locked">Hint ${i + 1} ${unlocked ? `<button class="btn" data-act="hint">Reveal</button>` : `unlocks at ${fmt(hintAt[i])}. Keep thinking. <button class="btn ghost small" data-act="hintEarly">I'm truly stuck</button>`}</div>`;
  }).join('');
  const renderHints = () => { $('#hints').innerHTML = hintsHTML(); };
  handlers.hint = () => { st.hintsOpen = (st.hintsOpen || 0) + 1; save(); renderHints(); };
  handlers.hintEarly = () => { if (confirm('Give it one more honest minute first? OK = reveal anyway.')) { st.hintsEarly++; handlers.hint(); } };
  renderHints();

  const paint = () => {
    $('#clock').textContent = fmt(st.secs);
    const frac = st.secs / (p.time * 60);
    $('#tbar').className = 'bar ' + (frac > 1 ? 'red' : frac > 0.75 ? 'amber' : '');
    $('#tbar i').style.width = Math.min(100, frac * 100) + '%';
  };
  const tick = () => {
    if (document.hidden) return;
    st.secs++;
    paint();
    if (hintAt.includes(st.secs)) renderHints();
    if (st.secs === p.time * 60 && st.stage < 3) { // time-box over: unlock review without disturbing the editor
      unlock(3);
      const t = document.querySelectorAll('.tab')[3]; t.classList.remove('locked');
      $('#clock').title = 'Time-box over. The Review tab is unlocked. Finish your attempt or study the solution.';
    }
    if (st.secs % 5 === 0) save();
  };
  paint();
  if (!st.solved) every(1000, tick);

  function unlock(n) { st.stage = Math.max(st.stage, n); save(); }
  stageKeys = e => { if (e.altKey && e.key >= '1' && e.key <= '4') { e.preventDefault(); handlers.stage({ dataset: { i: +e.key - 1 } }); } };
  handlers.stage = el => { const i = +el.dataset.i; if (i <= st.stage) { st.view = i; save(); route(); } };
  const go = i => { st.view = i; save(); route(); };

  function renderStage() {
    const box = $('#stage');
    if (st.view === 0) {
      const done = p.logic.every((_, i) => st.logic[i] !== undefined);
      const shown = p.logic.findIndex((_, i) => st.logic[i] === undefined);
      const upto = shown === -1 ? p.logic.length : shown + 1;
      box.innerHTML = `<h3 style="margin-top:0">Build the logic</h3><p class="small mute">Answer each step before the next one appears. Wrong answers are fine. Read the explanation, because that's where the learning happens.</p>
        ${p.logic.slice(0, upto).map((q, i) => mcqHTML(`lg-${id}-${i}`, q, st.logic[i])).join('')}
        ${done ? `<h3>Your plan in plain words</h3><textarea class="plain" id="plan" placeholder="e.g. Walk once; keep map of value→index; for each x check target−x ...">${esc(st.plan || '')}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn primary" data-act="toFill">Continue → fill the gaps</button></div>` :
        `<div class="row" style="margin-top:10px"><button class="btn ghost small" data-act="challenge">I already know this, skip to writing code (challenge mode)</button></div>`}`;
      p.logic.forEach((q, i) => { mcqAnswer[`lg-${id}-${i}`] = c => { st.logic[i] = c; save(); renderStage(); }; });
      const pl = $('#plan'); if (pl) pl.oninput = () => { st.plan = pl.value; save(); };
      handlers.toFill = () => { unlock(1); go(1); };
      handlers.challenge = () => { st.challenge = true; unlock(2); go(2); };
    } else if (st.view === 1) {
      const parts = p.sol[lang].split(/⟦([^⟧]*)⟧/);
      const fb = st.blanks[lang] = st.blanks[lang] || { vals: {}, state: {}, checks: 0 };
      let html = '', k = 0;
      parts.forEach((part, i) => {
        if (i % 2 === 0) { html += esc(part); return; }
        const ans = part.split('¦')[0];
        const s = fb.state[k];
        html += `<input data-k="${k}" class="${s === true ? 'right' : s === false ? 'wrong' : ''}" style="width:${Math.max(4, ans.length + 2)}ch" value="${esc(s === 'rev' ? ans : fb.vals[k] || '')}" ${s === true || s === 'rev' ? 'readonly' : ''} spellcheck="false" autocomplete="off">`;
        k++;
      });
      const total = k;
      const allDone = Object.values(fb.state).filter(v => v === true || v === 'rev').length === total;
      if (allDone && !fb.done) { fb.done = true; save(); }
      box.innerHTML = `<h3 style="margin-top:0">Fill the gaps (${LANG_NAME[lang]})</h3>
        <p class="small mute">Type the missing code. Spacing doesn't matter. Use your plan from step 1. Tab moves to the next blank, Enter checks.</p>
        <div class="fill">${html}</div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" data-act="checkFill">Check</button>
          ${fb.checks >= 2 && !allDone ? '<button class="btn" data-act="revealFill">Reveal the wrong ones</button>' : ''}
          ${allDone ? '<span class="ok">All gaps filled ✓</span><button class="btn primary" data-act="toWrite">Continue → write it from scratch</button>' : ''}
        </div>`;
      box.querySelectorAll('.fill input').forEach(inp => {
        inp.oninput = () => { fb.vals[inp.dataset.k] = inp.value; save(); };
        inp.onkeydown = e => { if (e.key === 'Enter') handlers.checkFill(); };
      });
      const norm = s => s.replace(/\s+/g, '').replace(/"/g, "'").replace(/;$/, '');
      const answers = parts.filter((_, i) => i % 2).map(a => a.split('¦'));
      handlers.checkFill = () => {
        answers.forEach((alts, i) => { if (fb.state[i] !== 'rev') fb.state[i] = alts.some(a => norm(a) === norm(fb.vals[i] || '')); });
        fb.checks++; save(); renderStage();
        const first = box.querySelector('.fill input.wrong'); if (first) first.focus();
      };
      handlers.revealFill = () => { answers.forEach((_, i) => { if (fb.state[i] !== true) fb.state[i] = 'rev'; }); fb.revealedCount = (fb.revealedCount || 0) + 1; save(); renderStage(); };
      handlers.toWrite = () => { unlock(2); go(2); };
    } else if (st.view === 2) {
      const code = st.code[lang] !== undefined ? st.code[lang] : starter(p, lang);
      box.innerHTML = `<div class="spread"><h3 style="margin:0">Write the whole solution (${LANG_NAME[lang]})</h3><span class="small mute"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> run · <kbd>Alt</kbd>+<kbd>1-4</kbd> stages · print()/console.log works</span></div>
        <p class="small mute">${st.challenge ? 'Challenge mode: solve it cold.' : 'Write it from memory without looking back. Rebuilding it yourself is what makes it stick for Monday.'} Say the complexity out loud before running.</p>
        <textarea class="code" id="ed" spellcheck="false">${esc(code)}</textarea>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" data-act="run">▶ Run tests</button>
          <button class="btn ghost" data-act="resetCode">Reset editor</button>
          ${st.stage < 3 && !st.solved ? `<button class="btn ghost" data-act="giveUp">Show solution (counts as peeking)</button>` : ''}
          <span id="status" class="small mute"></span>
        </div>
        <div class="row" style="margin-top:8px">
          <input type="text" id="custom" style="flex:1;font-family:var(--mono);font-size:13px" placeholder="Custom input as a JSON list of arguments, e.g. ${esc(JSON.stringify(p.tests[0][0]))}" spellcheck="false">
          <button class="btn" data-act="runCustom">Run custom input</button>
        </div>
        <div class="results" id="res"></div>`;
      const ed = $('#ed');
      ed.oninput = () => { st.code[lang] = ed.value; save(); };
      codeEditor(ed, lang, () => handlers.run());
      if (lang === 'py') Runner.warmPython();
      handlers.run = async () => {
        $('#status').textContent = 'Running…';
        const r = await Runner.run(lang, ed.value, p.fn[lang], p.tests, p.io, msg => { $('#status').textContent = msg; });
        $('#status').textContent = '';
        $('#res').innerHTML = resultsHTML(p, p.tests, r);
        st.runs = (st.runs || 0) + 1;
        const allPass = r.results && r.results.every((x, i) => !x.error && checkResult(x.out, p.tests[i][1], p.compare));
        if (allPass) {
          if ((!st.solved && !st.revealed) || st.redo) st.solvedClean = true; // a clean redo clears the revisit flag
          if (st.redo) { st.redo = false; if (st.conf === 0) delete st.conf; }
          if (!st.solved) toast(`🎉 <b>${esc(p.title)}</b> solved in ${fmt(st.secs)}${st.secs <= p.time * 60 ? ', within the time-box' : ''}`, 'ok');
          st.solved = true; unlock(3); updateHeader();
          const peek = box.querySelector('[data-act=giveUp]'); if (peek) peek.remove();
          $('#res').insertAdjacentHTML('afterbegin', `<div class="card" style="border-color:var(--green)"><b class="ok">Solved in ${fmt(st.secs)}.</b> State the time & space complexity to yourself, then <a href="javascript:void 0" data-act="toReview">open the review →</a></div>`);
        }
        save();
      };
      handlers.toReview = () => go(3);
      handlers.runCustom = async () => {
        let args;
        try { args = JSON.parse($('#custom').value); if (!Array.isArray(args) || args.length !== p.params.length) throw 0; }
        catch { $('#res').innerHTML = `<div class="t fail">Enter a JSON list with ${p.params.length} argument(s) in order: ${esc(p.params.join(', '))}. Example: ${esc(JSON.stringify(p.tests[0][0]))}</div>`; return; }
        $('#status').textContent = 'Running…';
        const r = await Runner.run(lang, ed.value, p.fn[lang], [[args, null]], p.io, msg => { $('#status').textContent = msg; });
        $('#status').textContent = '';
        const x = r.results && r.results[0];
        $('#res').innerHTML = r.compileError ? resultsHTML(p, [], r) : `<div class="t">${esc(argsLabel(p, args))}<div>output: <b>${esc(x.error || x.out)}</b></div>${x.log ? `<div class="log">stdout: ${esc(x.log)}</div>` : ''}</div>`;
      };
      handlers.resetCode = () => { if (confirm('Clear your code?')) { delete st.code[lang]; save(); renderStage(); } };
      handlers.giveUp = () => {
        if (!st.runs && !confirm("You haven't run any code yet. Try at least a brute force first? OK = show solution anyway.")) return;
        unlock(3); go(3);
      };
    } else {
      const clean = p.sol[lang].replace(/⟦([^⟧]*)⟧/g, (_, a) => a.split('¦')[0]);
      const other = lang === 'py' ? 'js' : 'py';
      if (!st.solved && !st.revealed) { st.revealed = true; save(); }
      if (st.redo) { st.redo = false; save(); } // looked at the solution mid-redo
      const cq = complexityQuiz(p);
      if (cq && st.cq === undefined) {
        box.innerHTML = `<h3 style="margin-top:0">Before the solution: complexity check</h3><p class="small mute">Leapfrog interviewers reportedly care about this. Answer for the optimal approach.</p>${mcqHTML('cq-' + id, cq, undefined)}`;
        mcqAnswer['cq-' + id] = c => { st.cq = c; save(); renderStage(); };
        return;
      }
      box.innerHTML = `<h3 style="margin-top:0">Review</h3>
        ${cq ? mcqHTML('cq-' + id, cq, st.cq) : ''}
        ${st.solved ? '' : '<div class="callout">You peeked, which is fine. Read the solution and the why, then go back to <b>Write it</b> and re-type it <b>from memory</b> until all tests pass. It goes on your revisit list.</div>'}
        <p><b>Complexity:</b> ${esc(p.complexity)}</p>
        <p><b>Takeaway:</b> ${esc(p.takeaway)}</p>
        <pre><code data-lang="${lang}">${esc(clean)}</code></pre>
        <details><summary class="small mute">Same solution in ${LANG_NAME[other]}</summary><pre><code data-lang="${other}">${esc(p.sol[other].replace(/⟦([^⟧]*)⟧/g, (_, a) => a.split('¦')[0]))}</code></pre></details>
        ${st.plan ? `<p class="small mute"><b>Your plan was:</b> ${esc(st.plan)}</p>` : ''}
        <h3>How confident are you to write this cold on Monday?</h3>
        <div class="row">${['😬 Need to redo', '🙂 Mostly', '💪 Nailed it'].map((t, i) => `<button class="btn ${st.conf === i ? 'primary' : ''}" data-act="conf" data-i="${i}">${t}</button>`).join('')}</div>
        <div class="row" style="margin-top:14px"><button class="btn" data-act="redo">↺ Redo from a blank editor</button>${nextLink(id)}</div>`;
      handlers.redo = () => { delete st.code[lang]; st.redo = true; save(); go(2); };
      handlers.conf = el => { st.conf = +el.dataset.i; save(); renderStage(); };
    }
  }
  renderStage();
}

function prevNext(id) {
  const order = planOrder(), i = order.indexOf(id);
  const prev = order[i - 1], next = order[i + 1];
  return `<a href="#/problems">← all problems</a>${prev ? `<span class="mute">·</span><a href="#/p/${prev}">‹ ${esc(P[prev].title)}</a>` : ''}${next ? `<span class="mute">·</span><a href="#/p/${next}">${esc(P[next].title)} ›</a>` : ''}`;
}
const BIG_O = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n · 2ⁿ)'];
function complexityQuiz(p) {
  const m = p.complexity.match(/O\((?:[^()]|\([^()]*\))*\)/);
  if (!m) return null;
  const hash = str => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const wrong = BIG_O.filter(o => o.replace(/\s/g, '') !== m[0].replace(/\s/g, '')).sort((a, b) => hash(p.id + a) - hash(p.id + b)).slice(0, 3);
  const opts = [m[0], ...wrong].sort((a, b) => hash(p.id + b) - hash(p.id + a));
  return { q: 'Time complexity of the optimal solution?', opts, a: opts.indexOf(m[0]), why: `${p.complexity}. ${p.takeaway}` };
}

function nextLink(id) {
  const order = planOrder();
  const nxt = order.slice(order.indexOf(id) + 1).find(x => !(S.p[x] && S.p[x].solved));
  return nxt ? `<a class="btn primary" href="#/p/${nxt}">Next: ${esc(P[nxt].title)} →</a>` : '<a class="btn" href="#/">Back to plan</a>';
}

// ---------- MCQ ----------
function viewMCQ(cat) {
  if (!cat) {
    app.innerHTML = `<h1>MCQ practice</h1><p class="mute">The exam has <b>3 MCQs</b>. Candidates reported design patterns, networking and basic DSA/complexity. Aim for under 90 seconds per question.</p>
    <div class="grid">
      <a class="card" href="#/mcq/all" style="color:inherit;text-decoration:none"><b>🎲 Mixed, all categories</b><div class="small mute">${MCQS.length} questions</div></a>
      <a class="card" href="#/mcq/missed" style="color:inherit;text-decoration:none"><b>🔁 Ones I got wrong</b><div class="small mute">${MCQS.filter(q => S.mcq[q.id] === false).length} questions</div></a>
      ${Object.entries(MCQ_CATS).map(([c, n]) => {
        const qs = MCQS.filter(q => q.cat === c), r = qs.filter(q => S.mcq[q.id] === true).length;
        return `<a class="card" href="#/mcq/${c}" style="color:inherit;text-decoration:none"><b>${esc(n)}</b><div class="small mute">${r}/${qs.length} correct</div><div class="bar" style="margin-top:6px"><i style="width:${r / qs.length * 100}%"></i></div></a>`;
      }).join('')}
    </div>`;
    return;
  }
  const pool = cat === 'all' ? MCQS : cat === 'missed' ? MCQS.filter(q => S.mcq[q.id] === false) : MCQS.filter(q => q.cat === cat);
  if (!pool.length) { app.innerHTML = `<a href="#/mcq">← back</a><p>Nothing here yet.</p>`; return; }
  // unanswered first, then wrong ones, then shuffled rest
  const order = [...pool].sort(() => Math.random() - 0.5).sort((a, b) => rank(a) - rank(b));
  function rank(q) { return S.mcq[q.id] === undefined ? 0 : S.mcq[q.id] === false ? 1 : 2; }
  let i = 0, right = 0, done = 0;
  const show = (chosen) => {
    const q = order[i];
    app.innerHTML = `<a href="#/mcq" class="small">← categories</a>
      <div class="spread"><h1>${esc(MCQ_CATS[cat] || (cat === 'all' ? 'Mixed' : 'Missed questions'))}</h1><span class="mute">${i + 1} / ${order.length} · session ${right}/${done}</span></div>
      <div class="card"><span class="pill">${esc(MCQ_CATS[q.cat])}</span>${mcqHTML('m', q, chosen)}
      ${chosen !== undefined ? `<div class="row" style="margin-top:10px">${i + 1 < order.length ? '<button class="btn primary" data-act="nextQ">Next →</button>' : `<b>Done: ${right}/${done} this session.</b> <a class="btn" href="#/mcq">Back</a>`}</div>` : ''}</div>`;
    mcqAnswer.m = c => { S.mcq[q.id] = c === q.a; done++; if (c === q.a) right++; save(); show(c); };
  };
  handlers.nextQ = () => { i++; show(); };
  show();
}

// ---------- Mock exam ----------
const MOCK_SECS = 60 * 60;
function pickMock(hard) {
  const shuffle = a => [...a].sort(() => Math.random() - 0.5);
  const unsolvedFirst = list => shuffle(list).sort((a, b) => (S.p[a.id] && S.p[a.id].solvedClean ? 1 : 0) - (S.p[b.id] && S.p[b.id].solvedClean ? 1 : 0));
  const used = new Set(S.mocks.flatMap(m => m.probs));
  const fresh = list => { const f = list.filter(p => !used.has(p.id)); return f.length ? f : list; };
  const p1 = unsolvedFirst(fresh(PROBLEMS.filter(p => p.diff === (hard ? 'Medium' : 'Easy'))))[0];
  const p2 = unsolvedFirst(fresh(PROBLEMS.filter(p => p.diff === (hard ? 'Hard' : 'Medium') && p.pattern !== p1.pattern)))[0];
  const cats = shuffle(['complexity', 'dsa', 'oop', 'design', 'network', 'db', 'web', 'output']).slice(0, 3);
  return { start: Date.now(), lang: S.lang, mcqs: cats.map(c => shuffle(MCQS.filter(q => q.cat === c))[0].id), probs: [p1.id, p2.id], ans: {}, code: {} };
}

function viewMock() {
  const m = S.mock;
  if (!m) {
    app.innerHTML = `<h1>Mock exam</h1>
    <div class="card"><p>Same format as Monday: <b>3 MCQs + 2 problems in 60 minutes</b>, no hints, no solutions. Problem 1 is easy and problem 2 is medium (the reported Leapfrog mix). Problems you haven't solved cleanly are preferred. While working, "Run samples" runs the first 2 tests only; your submission is graded on all tests, like hidden test cases.</p>
    <p class="small mute">Language: <b>${LANG_NAME[S.lang]}</b> (change at top right before starting). Put your phone away and do it in one sitting.</p>
    <div class="row"><button class="btn primary" data-act="startMock">Start 60-minute mock (Easy + Medium)</button>
    <button class="btn" data-act="startMock" data-hard="1">Hard mode (Medium + Hard)</button></div></div>
    ${S.mocks.length ? `<div class="card"><h3 style="margin-top:0">History</h3><table><tr><th>When</th><th>MCQ</th><th>Problem 1</th><th>Problem 2</th><th>Time</th><th>Score</th></tr>${S.mocks.map(r => `<tr><td class="small">${new Date(r.at).toLocaleString()}</td><td>${r.mcq}/3</td><td class="small"><a href="#/p/${r.probs[0]}">${esc(P[r.probs[0]].title)}</a> ${r.tests[0]}</td><td class="small"><a href="#/p/${r.probs[1]}">${esc(P[r.probs[1]].title)}</a> ${r.tests[1]}</td><td>${fmt(r.secs)}</td><td><b>${r.score}%</b></td></tr>`).join('')}</table></div>` : ''}`;
    handlers.startMock = el => { S.mock = pickMock(!!el.dataset.hard); save(); route(); };
    return;
  }
  const lang = m.lang;
  if (lang === 'py') Runner.warmPython();
  app.innerHTML = `
    <div class="mockbar spread"><span>Mock exam · ${LANG_NAME[lang]}</span><span class="mockclock" id="mclock"></span><button class="btn primary" data-act="submitMock">Submit</button></div>
    <div class="card"><h3 style="margin-top:0">Part A · MCQs</h3>${m.mcqs.map((qid, i) => {
      const q = MCQS.find(x => x.id === qid);
      return `<div class="q"><div style="white-space:pre-wrap"><b>${i + 1}. ${esc(q.q)}</b></div>${q.code ? `<pre><code>${esc(q.code)}</code></pre>` : ''}
        ${q.opts.map((o, j) => `<button class="opt" style="${m.ans[qid] === j ? 'border-color:var(--blue);background:#14263a' : ''}" data-act="mockAns" data-q="${qid}" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div>`;
    }).join('')}</div>
    ${m.probs.map((pid, n) => {
      const p = P[pid];
      return `<div class="card"><h3 style="margin-top:0">Part B · Problem ${n + 1}: ${esc(p.title)}</h3>${p.desc}
        ${p.examples.map(e => `<div class="ex"><div><span class="mute">Input:</span> ${esc(e.in)}</div><div><span class="mute">Output:</span> ${esc(e.out)}</div></div>`).join('')}
        <div class="small mute">Constraints: ${p.constraints.map(esc).join(' · ')}</div>
        <textarea class="code" id="med${n}" spellcheck="false" style="min-height:300px">${esc(m.code[pid] !== undefined ? m.code[pid] : starter(p, lang))}</textarea>
        <div class="row" style="margin-top:8px"><button class="btn" data-act="mockRun" data-n="${n}">▶ Run samples</button><span id="mst${n}" class="small mute"></span></div>
        <div class="results" id="mres${n}"></div></div>`;
    }).join('')}`;
  m.probs.forEach((pid, n) => {
    const ed = $('#med' + n);
    ed.oninput = () => { m.code[pid] = ed.value; save(); };
    codeEditor(ed, lang, () => handlers.mockRun({ dataset: { n } }));
  });
  handlers.mockAns = el => { m.ans[el.dataset.q] = +el.dataset.j; save(); el.parentElement.querySelectorAll('.opt').forEach((b, j) => { b.style.cssText = j === +el.dataset.j ? 'border-color:var(--blue);background:#14263a' : ''; }); };
  handlers.mockRun = async el => {
    const n = +el.dataset.n, p = P[m.probs[n]], tests = p.tests.slice(0, 2);
    $('#mst' + n).textContent = 'Running…';
    const r = await Runner.run(lang, $('#med' + n).value, p.fn[lang], tests, p.io, s => { $('#mst' + n).textContent = s; });
    $('#mst' + n).textContent = '';
    $('#mres' + n).innerHTML = resultsHTML(p, tests, r);
  };
  let submitting = false;
  handlers.submitMock = async (el, ev, auto) => {
    if (submitting || (!auto && !confirm('Submit the mock exam now?'))) return;
    submitting = true;
    app.innerHTML = '<div class="card">Grading on all test cases…</div>';
    const secs = Math.min(MOCK_SECS, Math.round((Date.now() - m.start) / 1000));
    const mcq = m.mcqs.filter(q => m.ans[q] === MCQS.find(x => x.id === q).a).length;
    const tests = [], fracs = [];
    for (const pid of m.probs) {
      const p = P[pid];
      const r = await Runner.run(lang, m.code[pid] || '', p.fn[lang], p.tests, p.io);
      const pass = r.results ? r.results.filter((x, i) => !x.error && checkResult(x.out, p.tests[i][1], p.compare)).length : 0;
      tests.push(`${pass}/${p.tests.length}`); fracs.push(pass / p.tests.length);
    }
    // weight: MCQs 10% each, problems 35% each
    const score = Math.round(mcq * 10 + fracs[0] * 35 + fracs[1] * 35);
    m.mcqs.forEach(q => { S.mcq[q] = m.ans[q] === MCQS.find(x => x.id === q).a; });
    S.mocks.push({ at: Date.now(), mcq, probs: m.probs, tests, secs, score, mcqIds: m.mcqs, ans: m.ans });
    S.mock = null; save(); updateHeader();
    toast(`⏱ Mock finished: <b>${score}%</b>`, score >= 50 ? 'ok' : 'bad');
    const res = S.mocks[S.mocks.length - 1];
    app.innerHTML = `<h1>Mock result: ${score}%</h1>
      <div class="card"><p>MCQ: <b>${mcq}/3</b> · Problem 1: <b>${tests[0]}</b> · Problem 2: <b>${tests[1]}</b> · Time used: <b>${fmt(secs)}</b></p>
      <p class="small mute">${score >= 80 ? 'Exam-ready on this set. Keep the rhythm.' : score >= 50 ? 'Close. Redo any problem below that is not 100% using the guided flow, then try another mock.' : 'No panic. Go through both problems with the guided flow (Think → Fill → Write), then retake a mock later.'}</p></div>
      <div class="card"><h3 style="margin-top:0">MCQ review</h3>${res.mcqIds.map(q => mcqHTML('r' + q, MCQS.find(x => x.id === q), res.ans[q] === undefined ? -1 : res.ans[q])).join('')}</div>
      <div class="row">${m.probs.map(pid => `<a class="btn" href="#/p/${pid}">Study ${esc(P[pid].title)}</a>`).join('')}<a class="btn primary" href="#/mock">Back to mocks</a></div>`;
  };
  const clock = () => {
    const left = MOCK_SECS - (Date.now() - m.start) / 1000;
    const c = $('#mclock'); if (!c) return;
    c.textContent = fmt(Math.max(0, left));
    c.style.color = left < 300 ? 'var(--red)' : left < 900 ? 'var(--amber)' : '';
    if (left <= 0) handlers.submitMock(null, null, true);
  };
  clock(); every(1000, clock);
}

// ---------- Syntax sheet ----------
const SYNTAX = [
  ['Hashmap', 'd = {}\nd[k] = d.get(k, 0) + 1\nif k in d: ...\nfor k, v in d.items(): ...\nfrom collections import Counter, defaultdict\nc = Counter(s); c.most_common(2)\ng = defaultdict(list)', 'const m = new Map();\nm.set(k, (m.get(k) || 0) + 1);\nif (m.has(k)) {}\nfor (const [k, v] of m) {}\n// sort entries by value desc\n[...m].sort((a, b) => b[1] - a[1]);'],
  ['Set', 's = set(); s.add(x); s.remove(x)\nx in s\na & b, a | b, a - b', 'const s = new Set(); s.add(x); s.delete(x);\ns.has(x); s.size\nnew Set(arr)  // dedupe'],
  ['Arrays', 'a = [0] * n\ngrid = [[0] * c for _ in range(r)]\na.append(x); a.pop(); a[-1]\na[i:j]; a[::-1]\nsum(a), max(a), min(a)\nfor i, x in enumerate(a): ...\nlist(zip(a, b))', 'const a = new Array(n).fill(0);\nconst g = Array.from({length: r}, () => new Array(c).fill(0));\na.push(x); a.pop(); a[a.length - 1]; a.at(-1)\na.slice(i, j); [...a].reverse()\nMath.max(...a)  // small arrays only\na.reduce((s, x) => s + x, 0)\na.forEach((x, i) => {})'],
  ['Sorting', 'a.sort()                      # in place\nb = sorted(a, reverse=True)\na.sort(key=lambda x: (x[1], -x[0]))', 'a.sort((x, y) => x - y);      // numbers!\na.sort((x, y) => y - x);      // desc\na.sort((p, q) => p[1] - q[1] || q[0] - p[0]);\nstrs.sort();  // strings ok w/o comparator'],
  ['Strings', "s.lower(), s.upper(), s.strip()\ns.split(), ' '.join(words)\ns.isalnum(), s.isdigit(), s.isalpha()\nord('a'), chr(97)\ns.find('x')  # -1 if missing\ns.count('a'); s.startswith('ab')\nf'{x} and {y:.2f}'", "s.toLowerCase(), s.toUpperCase(), s.trim()\ns.split(' '), words.join(' ')\n/[a-z0-9]/i.test(ch)\ns.charCodeAt(0), String.fromCharCode(97)\ns.indexOf('x')  // -1 if missing\ns.includes('ab'); s.startsWith('ab')\n`${x} and ${y.toFixed(2)}`; s.repeat(3)"],
  ['Stack / Queue', 'st = []; st.append(x); st.pop(); st[-1]\nfrom collections import deque\nq = deque(); q.append(x); q.popleft()', 'const st = []; st.push(x); st.pop(); st[st.length - 1]\n// queue: avoid shift() in hot loops\nconst q = [start]; let head = 0;\nwhile (head < q.length) { const cur = q[head++]; }'],
  ['Heap', 'import heapq\nh = []; heapq.heappush(h, x); heapq.heappop(h)\nh[0]  # min\nheapq.heappush(h, -x)  # max-heap trick\nheapq.nlargest(k, nums)', '// No built-in heap in JS.\n// For top-k on exam: sort (n log n) is usually acceptable.\nnums.sort((a, b) => b - a).slice(0, k);'],
  ['Integer math', '7 // 2 == 3; -7 // 2 == -4 (floor!)\nint(-7 / 2) == -3 (truncate)\n7 % 3; abs(x); pow(2, 10); 2 ** 10\nfloat(\'inf\'); math.isqrt(n)', 'Math.floor(7 / 2) // 3\nMath.trunc(-7 / 2) // -3\n7 % 3; Math.abs(x); 2 ** 10\nInfinity; Number.MAX_SAFE_INTEGER\nparseInt("42"), Number("42")'],
  ['Loops', 'for i in range(n): ...\nfor i in range(n - 1, -1, -1): ...\nwhile l < r: ...\nfor a, b in zip(x, y): ...', 'for (let i = 0; i < n; i++) {}\nfor (let i = n - 1; i >= 0; i--) {}\nfor (const x of arr) {}     // values\nfor (const k in obj) {}     // keys (objects only)'],
  ['Recursion / memo', 'from functools import lru_cache\n@lru_cache(maxsize=None)\ndef f(i): ...\nimport sys; sys.setrecursionlimit(10**6)', 'const memo = new Map();\nfunction f(i) {\n  if (memo.has(i)) return memo.get(i);\n  const r = /* ... */;\n  memo.set(i, r); return r;\n}'],
  ['Classes (OOP)', 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        raise NotImplementedError\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name}: woof"', 'class Animal {\n  #secret = 1;               // private field\n  constructor(name) { this.name = name; }\n  speak() { throw new Error("abstract"); }\n}\nclass Dog extends Animal {\n  speak() { return `${this.name}: woof`; }\n}'],
  ['Read stdin', 'import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nline = input().strip()', "const lines = require('fs').readFileSync(0, 'utf8').split('\\n');\nconst n = Number(lines[0]);\nconst nums = lines[1].split(' ').map(Number);"]
];
function viewSyntax() {
  app.innerHTML = `<h1>Syntax sheet: Python ⇄ JavaScript</h1><p class="mute">Exam-morning review. Losing time on syntax in a 60-minute exam is the worst way to lose marks.</p>
  <div class="card"><table><tr><th style="width:140px"></th><th>Python</th><th>JavaScript</th></tr>${SYNTAX.map(([t, py, js]) => `<tr><td><b>${t}</b></td><td><pre><code data-lang="py">${esc(py)}</code></pre></td><td><pre><code data-lang="js">${esc(js)}</code></pre></td></tr>`).join('')}</table></div>
  <div class="card"><h3 style="margin-top:0">Takeaways from problems you've solved</h3><ul>${PROBLEMS.filter(p => S.p[p.id] && S.p[p.id].solved).map(p => `<li><a href="#/p/${p.id}">${esc(p.title)}</a>: ${esc(p.takeaway)} <span class="mute small">(${esc(p.complexity)})</span></li>`).join('') || '<li class="mute">Solve some problems first.</li>'}</ul></div>`;
}

// ---------- command palette ----------
let stageKeys = null;
function paletteItems() {
  const items = [
    ...PROBLEMS.map(p => ({ label: p.title, sub: `${p.diff} · ${L[p.pattern].title}${S.p[p.id] && S.p[p.id].solved ? ' · ✓ solved' : ''}`, href: '#/p/' + p.id })),
    ...LESSONS.map(l => ({ label: l.title, sub: 'Lesson', href: '#/learn/' + l.id })),
    ...Object.entries(MCQ_CATS).map(([c, n]) => ({ label: 'MCQ: ' + n, sub: 'Practice', href: '#/mcq/' + c })),
    { label: 'Plan & countdown', sub: 'Page', href: '#/' }, { label: 'Mock exam', sub: 'Page', href: '#/mock' },
    { label: 'Syntax sheet', sub: 'Page', href: '#/syntax' }, { label: 'MCQs I got wrong', sub: 'Practice', href: '#/mcq/missed' }
  ];
  const next = planOrder().find(id => !(S.p[id] && S.p[id].solved));
  if (next) items.unshift({ label: 'Next up: ' + P[next].title, sub: 'Continue the plan', href: '#/p/' + next });
  return items;
}
function fuzzy(q, text) { // subsequence match; lower score = better
  q = q.toLowerCase(); text = text.toLowerCase();
  const direct = text.indexOf(q);
  if (direct >= 0) return direct;
  let i = 0, gaps = 0;
  for (const ch of text) { if (ch === q[i]) i++; else if (i) gaps++; if (i === q.length) return 100 + gaps; }
  return -1;
}
function openPalette() {
  if ($('.palette')) return;
  const all = paletteItems();
  const wrap = document.createElement('div');
  wrap.className = 'palette-bg';
  wrap.innerHTML = `<div class="palette" role="dialog" aria-label="Search"><input id="palQ" placeholder="Jump to a problem, lesson or page…" autocomplete="off" spellcheck="false"><div id="palList"></div><div class="small mute palfoot"><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</div></div>`;
  document.body.appendChild(wrap);
  let sel = 0, shown = [];
  const draw = () => {
    const q = $('#palQ').value.trim();
    shown = q ? all.map(x => ({ x, s: fuzzy(q, x.label + ' ' + x.sub) })).filter(r => r.s >= 0).sort((a, b) => a.s - b.s).map(r => r.x) : all;
    shown = shown.slice(0, 12); sel = Math.min(sel, Math.max(0, shown.length - 1));
    $('#palList').innerHTML = shown.map((x, i) => `<a class="palitem ${i === sel ? 'sel' : ''}" href="${x.href}"><span>${esc(x.label)}</span><span class="small mute">${esc(x.sub)}</span></a>`).join('') || '<div class="mute small" style="padding:10px">No matches</div>';
  };
  const close = () => wrap.remove();
  wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('.palitem')) close(); });
  $('#palQ').addEventListener('input', () => { sel = 0; draw(); });
  $('#palQ').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = (sel + 1) % shown.length; draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = (sel - 1 + shown.length) % shown.length; draw(); e.preventDefault(); }
    else if (e.key === 'Enter' && shown[sel]) { location.hash = shown[sel].href; close(); }
    else if (e.key === 'Escape') close();
  });
  draw(); $('#palQ').focus();
}
handlers.palette = openPalette;
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
  else if (stageKeys) stageKeys(e);
});

function updateHeader() {
  const solved = PROBLEMS.filter(p => S.p[p.id] && S.p[p.id].solved).length;
  $('#hdrProgress').innerHTML = `<span><b>${solved}</b>/${PROBLEMS.length} solved</span><div class="bar"><i style="width:${solved / PROBLEMS.length * 100}%"></i></div>`;
}

// ---------- router ----------
function route() {
  timers.forEach(clearInterval); timers = []; stageKeys = null;
  const pal = $('.palette-bg'); if (pal) pal.remove();
  updateHeader();
  for (const k in mcqAnswer) delete mcqAnswer[k];
  const [, a, b] = (location.hash || '#/').split('/');
  document.querySelectorAll('nav a').forEach(n => n.classList.toggle('on', n.getAttribute('href') === '#/' + (a === 'p' ? 'problems' : a || '')));
  if (S.mock && a !== 'mock') { location.hash = '#/mock'; return; } // stay in the exam
  if (a === 'learn') b ? viewLesson(b) : viewLearn();
  else if (a === 'problems') viewProblems();
  else if (a === 'p') viewProblem(b);
  else if (a === 'mcq') viewMCQ(b);
  else if (a === 'mock') viewMock();
  else if (a === 'syntax') viewSyntax();
  else viewPlan();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
