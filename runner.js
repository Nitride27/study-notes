// Runs user code against tests inside Web Workers (Blob URLs so it works from file://).
// Both workers return {compileError} or {results:[{out (JSON string) | error, log}]}; comparison happens in app.js.

function jsWorkerMain() {
  function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; }
  const toList = a => { const d = new ListNode(); let c = d; for (const v of a) { c.next = new ListNode(v); c = c.next; } return d.next; };
  // 'cycle' arg = [values, pos]: tail links back to node at pos (-1 = no cycle)
  const toCycle = ([a, pos]) => { const nodes = a.map(v => new ListNode(v)); nodes.forEach((n, i) => { n.next = nodes[i + 1] || (pos >= 0 ? nodes[pos] : null); }); return nodes[0] || null; };
  const conv = { list: toList, cycle: toCycle };
  const fromList = n => { const r = []; while (n) { r.push(n.val); n = n.next; if (r.length > 10000) throw new Error('Cycle in returned list'); } return r; };
  const show = x => typeof x === 'string' ? x : JSON.stringify(x);
  onmessage = e => {
    const { code, fn, tests, io = {} } = e.data;
    let logs = [];
    const fakeConsole = { log: (...a) => logs.push(a.map(show).join(' ')) };
    fakeConsole.error = fakeConsole.warn = fakeConsole.info = fakeConsole.log;
    let f;
    try {
      f = new Function('console', 'ListNode', code + `\n;return typeof ${fn} === "function" ? ${fn} : undefined;`)(fakeConsole, ListNode);
    } catch (err) { postMessage({ compileError: String(err) }); return; }
    if (!f) { postMessage({ compileError: `Function ${fn} not found. Keep the given function name.` }); return; }
    const results = tests.map(([args]) => {
      logs = [];
      try {
        const a = structuredClone(args).map((x, i) => io.args && conv[io.args[i]] ? conv[io.args[i]](x) : x);
        let r = f(...a);
        if (io.ret === 'list') r = fromList(r);
        return { out: JSON.stringify(r === undefined ? null : r), log: logs.join('\n') };
      } catch (err) { return { error: String(err), log: logs.join('\n') }; }
    });
    postMessage({ results });
  };
}

const PY_HARNESS = `
import json, sys, io, traceback
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
def _to_list(a):
    d = c = ListNode()
    for v in a:
        c.next = ListNode(v)
        c = c.next
    return d.next
def _to_cycle(spec):
    a, pos = spec
    nodes = [ListNode(v) for v in a]
    for i, n in enumerate(nodes):
        n.next = nodes[i + 1] if i + 1 < len(nodes) else (nodes[pos] if pos >= 0 else None)
    return nodes[0] if nodes else None
_CONV = {'list': _to_list, 'cycle': _to_cycle}
def _from_list(n):
    r = []
    while n:
        r.append(n.val)
        n = n.next
        if len(r) > 10000:
            raise Exception('Cycle in returned list')
    return r
def _run():
    ns = {'ListNode': ListNode, '__name__': '__user__'}
    try:
        exec("from typing import *\\nimport collections, heapq, math, bisect\\nfrom collections import *", ns)
        exec(USER_CODE, ns)
    except Exception:
        return {'compileError': traceback.format_exc(limit=0)}
    f = ns.get(FN)
    if not callable(f):
        return {'compileError': 'Function ' + FN + ' not found. Keep the given function name.'}
    io_ = json.loads(IO_JSON)
    kinds = io_.get('args') or []
    res = []
    for args, _exp in json.loads(TESTS_JSON):
        buf = io.StringIO()
        old = sys.stdout
        sys.stdout = buf
        try:
            a = [_CONV[kinds[i]](x) if i < len(kinds) and kinds[i] in _CONV else x for i, x in enumerate(args)]
            r = f(*a)
            if io_.get('ret') == 'list':
                r = _from_list(r)
            res.append({'out': json.dumps(r), 'log': buf.getvalue()})
        except Exception as ex:
            res.append({'error': type(ex).__name__ + ': ' + str(ex), 'log': buf.getvalue()})
        finally:
            sys.stdout = old
    return {'results': res}
json.dumps(_run())
`;

function pyWorkerMain() {
  const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  let ready;
  try {
    importScripts(CDN + 'pyodide.js');
    // indexURL must be explicit: a Blob worker has no script URL to infer it from
    ready = loadPyodide({ indexURL: CDN }).then(py => { postMessage({ ready: true }); return py; });
  } catch (err) { ready = Promise.reject(err); }
  ready.catch(err => postMessage({ loadError: String(err) }));
  onmessage = async e => {
    const py = await ready;
    const { code, fn, tests, io, harness } = e.data;
    py.globals.set('USER_CODE', code);
    py.globals.set('FN', fn);
    py.globals.set('TESTS_JSON', JSON.stringify(tests));
    py.globals.set('IO_JSON', JSON.stringify(io || {}));
    try { postMessage(JSON.parse(py.runPython(harness))); }
    catch (err) { postMessage({ compileError: String(err) }); }
  };
}

// Compare a worker result (JSON string) with the expected value. mode 'sorted' ignores order at every level.
function deepSort(v) {
  if (!Array.isArray(v)) return v;
  return v.map(deepSort).sort((a, b) => { const x = JSON.stringify(a), y = JSON.stringify(b); return x < y ? -1 : x > y ? 1 : 0; });
}
function checkResult(outJson, expected, mode) {
  let out;
  try { out = JSON.parse(outJson); } catch { return false; }
  const norm = v => JSON.stringify(mode === 'sorted' ? deepSort(v) : v);
  const options = expected && expected.anyOf ? expected.anyOf : [expected];
  return options.some(e => norm(out) === norm(e));
}

const Runner = (() => {
  const blobUrl = f => URL.createObjectURL(new Blob([`(${f.toString()})()`], { type: 'text/javascript' }));
  let pyWorker = null, pyReady = null;

  function startPy() {
    pyWorker = new Worker(blobUrl(pyWorkerMain));
    pyReady = new Promise((res, rej) => {
      pyWorker.onmessage = e => e.data.ready ? res() : e.data.loadError && rej(new Error('Could not load Python (Pyodide): ' + e.data.loadError + '. Needs internet; or switch to JavaScript.'));
      pyWorker.onerror = () => rej(new Error('Could not load Python (Pyodide). You need internet the first time.'));
    });
  }

  function once(worker, msg, ms) {
    return new Promise(resolve => {
      const t = setTimeout(() => { worker.terminate(); resolve({ compileError: `Time limit exceeded (${ms / 1000}s). Infinite loop or too slow (check your complexity).`, killed: true }); }, ms);
      worker.onmessage = e => { if (e.data.ready) return; clearTimeout(t); resolve(e.data); };
      worker.onerror = e => { clearTimeout(t); resolve({ compileError: e.message }); };
      worker.postMessage(msg);
    });
  }

  async function run(lang, code, fn, tests, io, onStatus = () => {}) {
    if (lang === 'js') {
      const w = new Worker(blobUrl(jsWorkerMain));
      const r = await once(w, { code, fn, tests, io }, 4000);
      w.terminate();
      return r;
    }
    if (!pyWorker) startPy();
    onStatus('Loading Python runtime (first run takes ~5-10s)…');
    try { await pyReady; } catch (err) { pyWorker.terminate(); pyWorker = null; return { compileError: err.message }; }
    onStatus('Running…');
    const r = await once(pyWorker, { code, fn, tests, io, harness: PY_HARNESS }, 10000);
    if (r.killed) pyWorker = null; // reload runtime next time
    return r;
  }

  return { run, warmPython: () => { if (!pyWorker) startPy(); } };
})();
