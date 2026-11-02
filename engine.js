// Runs Python in a Pyodide Web Worker (Blob URL so it works from file://). The harness is shared with verify.js.
// A test is either {c, w, s}: Python expressions (call, want) plus optional setup statements,
// or a bank problem's {a, e, fn, io, cmp}: JSON args and expected value.
const PY_HARNESS = String.raw`
import json, sys, io, traceback, math

class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def nodes(a):
    d = c = ListNode()
    for v in a:
        c.next = ListNode(v)
        c = c.next
    return d.next

def node_list(n):
    r = []
    while n:
        r.append(n.val)
        n = n.next
        if len(r) > 10000:
            raise Exception('Cycle in returned list')
    return r

def cycle(a, pos):
    ns = [ListNode(v) for v in a]
    for i, n in enumerate(ns):
        n.next = ns[i + 1] if i + 1 < len(ns) else (ns[pos] if pos >= 0 else None)
    return ns[0] if ns else None

def tree(a):
    if not a or a[0] is None:
        return None
    root = TreeNode(a[0])
    q, i = [root], 1
    while q and i < len(a):
        n = q.pop(0)
        if i < len(a) and a[i] is not None:
            n.left = TreeNode(a[i])
            q.append(n.left)
        i += 1
        if i < len(a) and a[i] is not None:
            n.right = TreeNode(a[i])
            q.append(n.right)
        i += 1
    return root

def tree_list(root):
    out, q = [], [root]
    while q:
        n = q.pop(0)
        if n is None:
            out.append(None)
        else:
            out.append(n.val)
            q += [n.left, n.right]
    while out and out[-1] is None:
        out.pop()
    return out

def _plain(x):
    if hasattr(x, 'tolist'):
        x = x.tolist()
    if isinstance(x, (list, tuple)):
        return [_plain(v) for v in x]
    if isinstance(x, dict):
        return {k: _plain(v) for k, v in x.items()}
    return x

def _close(a, b, t):
    a, b = _plain(a), _plain(b)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_close(x, y, t) for x, y in zip(a, b))
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) <= t
    return a == b

class approx:
    def __init__(self, v, tol=1e-3):
        self.v, self.tol = v, tol
    def __repr__(self):
        return 'about ' + repr(self.v)
    def __eq__(self, o):
        return _close(o, self.v, self.tol)

def _deep_sort(v):
    if not isinstance(v, list):
        return v
    return sorted((_deep_sort(x) for x in v), key=lambda x: json.dumps(x, default=str))

def _show(x):
    r = repr(x)
    return r if len(r) < 400 else r[:400] + ' ...'

def _err(e):
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == '<your code>']
    where = 'line %d in %s: ' % (frames[-1].lineno, frames[-1].name) if frames else ''
    if isinstance(e, SyntaxError) and e.filename == '<your code>':
        where = 'line %s: ' % e.lineno
    return where + type(e).__name__ + ': ' + str(e)

_CONV = {'list': nodes, 'cycle': lambda s: cycle(s[0], s[1])}

def _fresh():
    ns = {'ListNode': ListNode, 'TreeNode': TreeNode, 'nodes': nodes, 'node_list': node_list, 'cycle': cycle,
          'tree': tree, 'tree_list': tree_list, 'approx': approx, '__name__': '__user__'}
    exec('from typing import *\nimport collections, heapq, math, bisect\nfrom collections import *', ns)
    return ns

def _one(compiled, t):
    buf, old = io.StringIO(), sys.stdout
    sys.stdout = buf
    try:
        ns = _fresh()
        exec(compiled, ns)
        if 'a' in t:
            kinds = t.get('io', {}).get('args') or []
            a = [_CONV[kinds[i]](x) if i < len(kinds) and kinds[i] in _CONV else x for i, x in enumerate(t['a'])]
            f = ns.get(t['fn'])
            if not callable(f):
                raise NameError('function ' + t['fn'] + ' not found. Keep the given function name.')
            got = f(*a)
            if t.get('io', {}).get('ret') == 'list':
                got = node_list(got)
            got = _plain(got)
            want = t['e']
            options = want['anyOf'] if isinstance(want, dict) and 'anyOf' in want else [want]
            norm = _deep_sort if t.get('cmp') == 'sorted' else (lambda v: v)
            ok = any(norm(got) == norm(w) for w in options)
            shown = ' or '.join(_show(w) for w in options)
        else:
            if t.get('s'):
                exec(t['s'], ns)
            got = eval(t['c'], ns)
            want = eval(t['w'], ns)
            ok = (want == got) if isinstance(want, approx) else _plain(got) == _plain(want)
            shown = _show(want)
        return {'ok': bool(ok), 'got': _show(got), 'want': shown, 'log': buf.getvalue()[:2000]}
    except BaseException as e:
        return {'ok': False, 'err': _err(e), 'log': buf.getvalue()[:2000]}
    finally:
        sys.stdout = old

def _main(code, tests):
    try:
        compiled = compile(code, '<your code>', 'exec')
    except SyntaxError as e:
        return {'compileError': _err(e)}
    buf, old = io.StringIO(), sys.stdout
    sys.stdout = buf
    top_err = None
    try:
        exec(compiled, _fresh())
    except BaseException as e:
        top_err = _err(e)
    finally:
        sys.stdout = old
    out = {'stdout': buf.getvalue()[:8000]}
    if top_err:
        out['compileError'] = top_err
        return out
    out['results'] = [_one(compiled, t) for t in tests]
    return out

json.dumps(_main(USER_CODE, json.loads(TESTS_JSON)))
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
    const { code, tests, harness } = e.data;
    try {
      // Pulls numpy / sqlite3 on demand, whether the import is in the learner's code or a test's setup.
      await py.loadPackagesFromImports(code + '\n' + tests.map(t => t.s || '').join('\n'));
      postMessage({ started: true }); // the time limit covers the code, not the package download
      py.globals.set('USER_CODE', code);
      py.globals.set('TESTS_JSON', JSON.stringify(tests));
      postMessage(JSON.parse(py.runPython(harness)));
    } catch (err) { postMessage({ compileError: String(err) }); }
  };
}

const Engine = (() => {
  const LIMIT = 20000;
  let worker = null, ready = null;
  function boot() {
    worker = new Worker(URL.createObjectURL(new Blob([`(${pyWorkerMain.toString()})()`], { type: 'text/javascript' })));
    ready = new Promise((res, rej) => {
      worker.onmessage = e => e.data.ready ? res() : e.data.loadError && rej(new Error('Python could not load: ' + e.data.loadError));
      worker.onerror = () => rej(new Error('Python could not load. The first run needs internet.'));
    });
  }
  async function run(code, tests = [], onStatus = () => {}) {
    if (!worker) boot();
    onStatus('Loading Python. The first run takes about 10 seconds.');
    try { await ready; } catch (err) { worker.terminate(); worker = null; return { compileError: err.message }; }
    onStatus('Running.');
    return new Promise(resolve => {
      let t;
      const startClock = () => { t = setTimeout(() => {
        worker.terminate(); worker = null; // a stuck loop cannot be interrupted, so reload the runtime next run
        resolve({ compileError: `Stopped after ${LIMIT / 1000} seconds. Look for a loop that never ends, or work that grows too fast.` });
      }, LIMIT); };
      worker.onmessage = e => {
        if (e.data.ready) return;
        if (e.data.started) return startClock();
        clearTimeout(t); resolve(e.data);
      };
      worker.onerror = e => { clearTimeout(t); resolve({ compileError: e.message }); };
      worker.postMessage({ code, tests, harness: PY_HARNESS });
    });
  }
  return { run, warm: () => { if (!worker) boot(); } };
})();
