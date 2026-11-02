// What to bring back, and when, so old topics survive while you learn new ones. Pure functions: verify.js tests them.
// Three research-backed habits drive this: spacing (come back after a gap), retrieval (from a blank page, never rereading)
// and interleaving (mix topics). The recall estimate uses the FSRS-5 forgetting curve; with this fixed schedule it's a rough guide.
const GAP = [3, 7, 21, 60, 180]; // days until the next round, per successful round
const NEGLECT = 7; // a topic you have learned never goes this many days without practice
const gapOf = box => GAP[Math.min(box || 0, GAP.length - 1)];
const isoDays = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const addIso = (d, n) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);
const recallChance = (t, gap) => Math.pow(1 + 19 / 81 * Math.max(0, t) / gap, -0.5); // 90% when t reaches the gap

// A lesson read before recall tracking existed still counts, dated from the day it was read.
const conceptState = (S, id) => (S.recall || {})[id] || (S.lessons[id] ? { box: 1, last: S.lessons[id], due: addIso(S.lessons[id], GAP[1]) } : null);

// Everything you could be asked to remember. Units must hold plain problem ids in core, boss and extra.
function reviewItems(S, units, trackOf, today) {
  const out = [];
  for (const u of units) {
    if (u.project) continue;
    const add = (key, st, retry) => {
      const gap = gapOf(st.box), last = st.last || addIso(st.due, -gap), t = isoDays(last, today);
      out.push({ key, unit: u.id, track: trackOf(u), due: st.due, last, r: retry ? 0.4 : recallChance(t, gap), late: t / gap, isDue: st.due <= today });
    };
    const c = conceptState(S, u.id);
    if (c) add('r:' + u.id, c);
    for (const id of [...u.core, ...(u.boss ? [u.boss] : []), ...u.extra]) {
      const s = S.p[id];
      if (s && s.due && (s.solved || s.retry)) add('p:' + id, s, !!s.retry);
    }
  }
  return out;
}

// Each track's most recent practice, oldest track first.
function trackAges(items) {
  const last = {};
  for (const i of items) if (!last[i.track] || i.last > last[i.track]) last[i.track] = i.last;
  return Object.entries(last).sort((a, b) => a[1] < b[1] ? -1 : 1);
}

// keep: problems a day. Neglected topics go first, even when nothing in them is due. The rest rotate by topic,
// so a big backlog in one can't crowd out another. Falling far behind pauses new concepts until it's under the limit.
function pickReviews(items, today, keep) {
  const probs = items.filter(i => i.key[0] === 'p'), backlog = probs.filter(i => i.isDue).length;
  const limit = keep * 5, behind = backlog > limit, room = keep + (behind ? 2 : 0), picked = [];
  const take = i => { if (i && !picked.includes(i) && picked.length < room) picked.push(i); };
  for (const [track, last] of trackAges(items)) {
    if (isoDays(last, today) >= NEGLECT) take(probs.filter(i => i.track === track).sort((a, b) => a.r - b.r)[0]);
  }
  const byLate = (a, b) => b.late - a.late, queues = {};
  for (const i of probs.filter(i => i.isDue).sort(byLate)) (queues[i.track] = queues[i.track] || []).push(i);
  const tracks = Object.keys(queues);
  for (let round = 0; picked.length < room && tracks.some(t => queues[t][round]); round++) tracks.forEach(t => take(queues[t][round]));
  const concepts = items.filter(i => i.key[0] === 'r' && i.isDue).sort(byLate);
  const seen = new Set(picked.map(i => i.track));
  const recall = concepts.filter(i => !seen.has(i.track)).concat(concepts).filter((i, n, a) => a.indexOf(i) === n).slice(0, keep >= 3 ? 2 : 1);
  return { keys: [...picked, ...recall].map(i => i.key), behind, backlog, limit };
}

// A round only counts if it was due and done unaided. Early practice or nudges keep you on the same gap.
function nextBox(s, today) {
  if (!s.rematching || s.retry) return 0;
  return s.due <= today && !s.nudges ? (s.box || 0) + 1 : (s.box || 0);
}
// grade: 0 forgot, 1 shaky, 2 solid.
function gradeConcept(st, grade, today) {
  const box = grade === 0 ? 0 : grade === 2 && st.due <= today ? st.box + 1 : st.box;
  return { box, last: today, due: addIso(today, gapOf(box)) };
}
function freshness(values) {
  if (!values.length) return '';
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return mean >= 0.9 ? 'fresh' : mean >= 0.8 ? 'fading' : 'rusty';
}
