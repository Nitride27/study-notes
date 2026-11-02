// Pencil drawing kit for lesson visuals. Every helper returns an SVG string, so a step is just concatenated drawing calls.
// Wobble is seeded from the coordinates: the same shape stays put between steps instead of shivering.
const D = (() => {
  const rng = seed => { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  const shake = (r, a) => (r() - 0.5) * 2 * a;
  const n = v => Math.round(v * 10) / 10;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function line(x1, y1, x2, y2, cls = '') {
    const r = rng(Math.round(x1 * 7 + y1 * 13 + x2 * 17 + y2 * 19));
    const w = Math.min(1.8, Math.hypot(x2 - x1, y2 - y1) / 50);
    return `<path class="sk ${cls}" d="M${n(x1 + shake(r, w / 2))} ${n(y1 + shake(r, w / 2))} Q${n((x1 + x2) / 2 + shake(r, w))} ${n((y1 + y2) / 2 + shake(r, w))} ${n(x2 + shake(r, w / 2))} ${n(y2 + shake(r, w / 2))}"/>`;
  }
  function box(x, y, w, h, cls = '') {
    return line(x - 1, y, x + w + 1, y, cls) + line(x + w, y - 1, x + w, y + h + 1, cls) + line(x + w + 1, y + h, x - 1, y + h, cls) + line(x, y + h + 1, x, y - 1, cls);
  }
  const mark = (x, y, w, h, c = 'y') => `<rect class="mk mk-${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`;
  function t(x, y, s, o = {}) {
    return `<text x="${x}" y="${y}" class="tx ${o.cls || ''} ${o.mono ? 'mono' : ''}" text-anchor="${o.a || 'start'}"${o.size ? ` font-size="${o.size}"` : ''}>${esc(s)}</text>`;
  }
  function arrow(x1, y1, x2, y2, cls = '') {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
    return line(x1, y1, x2, y2, cls) + line(x2, y2, x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5), cls) + line(x2, y2, x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5), cls);
  }
  function circle(x, y, rad, cls = '') {
    const r = rng(Math.round(x * 3 + y * 5 + rad * 11));
    const pts = Array.from({ length: 9 }, (_, i) => { const a = i / 8 * Math.PI * 2; const R = rad + shake(r, 0.9); return `${n(x + R * Math.cos(a))} ${n(y + R * Math.sin(a))}`; });
    return `<path class="sk ${cls}" d="M${pts.join(' L')}" stroke-linejoin="round"/>`;
  }
  // hl: {index: 'y'|'r'|'b'|'g'}. ptr: {name: index} draws a labelled arrow under that cell.
  function cells(vals, { x = 20, y = 40, w = 48, h = 44, hl = {}, dim = [], idx = false, ptr = {}, label = '' } = {}) {
    let o = label ? t(x, y - (idx ? 22 : 8), label, { cls: 'soft' }) : '';
    vals.forEach((v, i) => {
      const X = x + i * w;
      if (hl[i]) o += mark(X + 2, y + 2, w - 4, h - 4, hl[i]);
      o += box(X, y, w, h) + t(X + w / 2, y + h / 2 + 6, v, { a: 'middle', mono: 1, cls: dim.includes(i) ? 'dim' : '' });
      if (idx) o += t(X + w / 2, y - 6, i, { a: 'middle', size: 12, cls: 'soft mono' });
    });
    const used = {};
    Object.entries(ptr).forEach(([name, i]) => {
      const lvl = used[i] = (used[i] || 0) + 1, X = x + i * w + w / 2, Y = y + h + 6;
      o += arrow(X, Y + 18 * lvl, X, Y, 'b') + t(X, Y + 18 * lvl + 15, name, { a: 'middle', cls: 'b' });
    });
    return o;
  }
  function vars(obj, { x = 20, y = 30, w = 60, gap = 40, hl = [] } = {}) {
    return Object.entries(obj).map(([k, v], i) => {
      const Y = y + i * gap;
      return (hl.includes(k) ? mark(x + 62, Y - 22, w * 1.6, 32) : '') + t(x + 52, Y, k, { a: 'end', mono: 1 }) + box(x + 62, Y - 22, w * 1.6, 32) + t(x + 62 + w * 0.8, Y, v, { a: 'middle', mono: 1 });
    }).join('');
  }
  // Grows upward from y (the floor). The last item is the top.
  function stack(items, { x = 40, y = 200, w = 90, h = 32, label = 'stack', hl = true } = {}) {
    let o = line(x - 6, y, x + w + 6, y) + line(x - 6, y, x - 6, y - h * 5) + line(x + w + 6, y, x + w + 6, y - h * 5) + t(x + w / 2, y + 20, label, { a: 'middle', cls: 'soft' });
    items.forEach((v, i) => {
      const Y = y - (i + 1) * h - 1;
      if (hl && i === items.length - 1) o += mark(x + 1, Y + 1, w - 2, h - 2);
      o += box(x, Y, w, h - 2) + t(x + w / 2, Y + h / 2 + 4, v, { a: 'middle', mono: 1 });
    });
    return o;
  }
  // nodes: {id: [x, y, label?]}. edges: [from, to, label?]. hl: {id: colour}. on: edge keys "a-b" drawn in blue. dir: arrows.
  function graph(nodes, edges, { hl = {}, on = [], dir = false, r = 20, cross = [] } = {}) {
    let o = '';
    edges.forEach(([a, b, w]) => {
      const [x1, y1] = nodes[a], [x2, y2] = nodes[b], ang = Math.atan2(y2 - y1, x2 - x1);
      const cls = on.includes(`${a}-${b}`) || on.includes(`${b}-${a}`) ? 'b thick' : cross.includes(`${a}-${b}`) ? 'r' : '';
      const sx = x1 + r * Math.cos(ang), sy = y1 + r * Math.sin(ang), ex = x2 - r * Math.cos(ang), ey = y2 - r * Math.sin(ang);
      o += dir ? arrow(sx, sy, ex, ey, cls) : line(sx, sy, ex, ey, cls);
      if (w !== undefined) o += t((x1 + x2) / 2 + 8, (y1 + y2) / 2 - 6, w, { cls: 'soft', size: 14 });
    });
    Object.entries(nodes).forEach(([id, [x, y, label]]) => {
      if (hl[id]) o += `<circle class="mk mk-${hl[id]}" cx="${x}" cy="${y}" r="${r - 1}"/>`;
      o += circle(x, y, r) + t(x, y + 5, label === undefined ? id : label, { a: 'middle', mono: 1 });
    });
    return o;
  }
  // Place a binary tree automatically from nested [value, left, right] arrays.
  function tree(root, { x = 360, y = 34, spread = 160, dy = 62, hl = {}, on = [] } = {}) {
    const nodes = {}, edges = [];
    (function walk(nd, X, Y, s) {
      if (!nd) return;
      const [v, l, r] = nd;
      nodes[v] = [X, Y];
      if (l) { edges.push([v, l[0]]); walk(l, X - s, Y + dy, s / 2); }
      if (r) { edges.push([v, r[0]]); walk(r, X + s, Y + dy, s / 2); }
    })(root, x, y, spread);
    return graph(nodes, edges, { hl, on });
  }
  function grid(rows, { x = 20, y = 20, s = 40, hl = {} } = {}) {
    let o = '';
    rows.forEach((row, r) => row.forEach((v, c) => {
      const X = x + c * s, Y = y + r * s;
      if (hl[`${r},${c}`]) o += mark(X + 2, Y + 2, s - 4, s - 4, hl[`${r},${c}`]);
      o += box(X, Y, s, s) + t(X + s / 2, Y + s / 2 + 5, v, { a: 'middle', mono: 1, size: 15 });
    }));
    return o;
  }
  // boxes: {id: [x, y, w, h, text, colour?]}. arrows: [from, to, label?, cls?]; connects the facing edges of the two boxes.
  function flow(boxes, arrows = []) {
    let o = '';
    Object.values(boxes).forEach(([x, y, w, h, text, c]) => {
      if (c) o += mark(x + 2, y + 2, w - 4, h - 4, c);
      o += box(x, y, w, h);
      const parts = String(text).split('\n');
      parts.forEach((p, i) => { o += t(x + w / 2, y + h / 2 + 5 + (i - (parts.length - 1) / 2) * 17, p, { a: 'middle' }); });
    });
    arrows.forEach(([a, b, label, cls]) => {
      const [x1, y1, w1, h1] = boxes[a], [x2, y2, w2, h2] = boxes[b];
      const horiz = x2 >= x1 + w1 || x1 >= x2 + w2;
      const P = horiz
        ? (x2 >= x1 + w1 ? [x1 + w1, y1 + h1 / 2, x2 - 3, y2 + h2 / 2] : [x1, y1 + h1 / 2, x2 + w2 + 3, y2 + h2 / 2])
        : (y2 >= y1 + h1 ? [x1 + w1 / 2, y1 + h1, x2 + w2 / 2, y2 - 3] : [x1 + w1 / 2, y1, x2 + w2 / 2, y2 + h2 + 3]);
      o += arrow(...P, cls || '');
      if (label) o += t((P[0] + P[2]) / 2, (P[1] + P[3]) / 2 - 7, label, { a: 'middle', cls: 'b', size: 14 });
    });
    return o;
  }
  // pts: [x, y, 'r'|'b'|''] in data units. line: [[x, y], ...] in data units.
  function plot({ x = 50, y = 15, w = 300, h = 190, xr = [0, 10], yr = [0, 10], pts = [], curve = [], xlab = '', ylab = '', lineCls = 'b' } = {}) {
    const X = v => x + (v - xr[0]) / (xr[1] - xr[0]) * w, Y = v => y + h - (v - yr[0]) / (yr[1] - yr[0]) * h;
    let o = arrow(x, y + h, x + w + 8, y + h) + arrow(x, y + h, x, y - 8);
    if (xlab) o += t(x + w / 2, y + h + 22, xlab, { a: 'middle', cls: 'soft' });
    if (ylab) o += t(x - 12, y + 4, ylab, { a: 'end', cls: 'soft' });
    if (curve.length) o += `<path class="sk ${lineCls}" d="M${curve.map(([a, b]) => `${n(X(a))} ${n(Y(b))}`).join(' L')}"/>`;
    pts.forEach(([a, b, c]) => { o += `<circle class="dot ${c || ''}" cx="${n(X(a))}" cy="${n(Y(b))}" r="5"/>`; });
    return o;
  }
  function bars(vals, { x = 30, y = 200, w = 40, unit = 16, hl = {}, labels = true } = {}) {
    let o = line(x - 6, y, x + vals.length * w + 6, y);
    vals.forEach((v, i) => {
      const X = x + i * w, H = v * unit;
      if (hl[i]) o += mark(X + 3, y - H, w - 6, H, hl[i]);
      o += box(X + 3, y - H, w - 6, H);
      if (labels) o += t(X + w / 2, y + 18, v, { a: 'middle', mono: 1, size: 14 });
    });
    return o;
  }
  // Code listing with one highlighted line, for side-by-side tracing.
  function code(lines, { x = 16, y = 28, gap = 24, on = -1 } = {}) {
    return lines.map((l, i) => (i === on ? mark(x - 8, y + i * gap - 17, 340, gap - 1) : '') + t(x, y + i * gap, l, { mono: 1, size: 15 })).join('');
  }
  return { line, box, mark, t, arrow, circle, cells, vars, stack, graph, tree, grid, flow, plot, bars, code };
})();

// Lesson block constructors, used by the content files.
const fig = (d, h = 200, cap = '') => ({ fig: d, h, cap });
const steps = (frames, h = 220) => ({ steps: frames, h });
const think = (q, a) => ({ think: q, ans: a });
const tryit = code => ({ run: code });
