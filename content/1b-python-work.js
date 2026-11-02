// The Python that interviews and real codebases assume: the standard toolbox, errors, generators, decorators and tests.
(() => {
const p = (id, title, diff, time, desc, start, nudge, sol, big, idea, tests, ex) => ({ id, title, diff, time, desc: `<p>${desc}</p>`, start, nudge, sol, big, idea, tests, ex: ex || [] });

unit({ id: 'py-toolkit', phase: 0, title: "Python's toolbox", mins: 8, read: [
`<p class="lede">You could write everything with loops and lists. But Python ships with tools for the jobs you'll do constantly, and <b>knowing they exist is half of writing fast code</b>, in interviews and at work.</p>
<h2>A list built in one line</h2><pre><code>[x * x for x in nums if x > 0]      # a list
{w: len(w) for w in words}          # a dict
{w[0] for w in words}               # a set</code></pre>
<p>Read it as a sentence: "x times x, for each x, when x is positive." Use it when it stays readable. If it needs a second line of thought, write the loop.</p>
<h2>Which tool for which thought</h2><table>
<tr><th>When you think</th><th>Reach for</th></tr>
<tr><td>"Count how many of each"</td><td><code>Counter(items)</code>, then <code>.most_common(k)</code></td></tr>
<tr><td>"Group these under a key"</td><td><code>defaultdict(list)</code></td></tr>
<tr><td>"Add and remove at both ends"</td><td><code>deque</code>: a list's <code>pop(0)</code> is slow</td></tr>
<tr><td>"Always give me the smallest"</td><td><code>heapq</code></td></tr>
<tr><td>"Where would this go in a sorted list?"</td><td><code>bisect</code></td></tr>
<tr><td>"Sort by something else"</td><td><code>sorted(rows, key=lambda r: (-r.score, r.name))</code></td></tr>
<tr><td>"I need the position as well"</td><td><code>enumerate(items)</code></td></tr>
<tr><td>"Walk two lists together"</td><td><code>zip(a, b)</code></td></tr>
<tr><td>"Is any, or all, of these true?"</td><td><code>any(...)</code>, <code>all(...)</code></td></tr>
<tr><td>"Don't compute this twice"</td><td><code>@lru_cache</code>, from <code>functools</code></td></tr></table>
<h2>Sorting by several things</h2><p>A key can be a tuple, and tuples compare left to right. That turns "highest score first, then by name" into one line. Try it:</p>`,
tryit('rows = [("sam", 90), ("ana", 95), ("bob", 90)]\nprint(sorted(rows, key=lambda r: (-r[1], r[0])))'),
think('You need the 3 biggest of a million numbers. Sorting works. What could be cheaper, and which tool does it?', 'A heap of size 3 costs O(n log 3), which is close to O(n). <code>heapq.nlargest(3, nums)</code> does exactly this.')
], core: [
p('invert-dict', 'Who has what', 'Easy', 8, 'Given a dict of person to colour, return a dict of colour to a list of people, keeping the order they appear in.', 'def invert(d):\n    ',
  ['What should happen the first time you see a colour? Is there a tool that handles that for you?'],
  R`def invert(d):
    out = defaultdict(list)
    for k, v in d.items():
        out[v].append(k)
    return dict(out)`, 'O(n)', 'defaultdict removes the "is it there yet?" check.',
  [['invert({"a": "red", "b": "blue", "c": "red"})', '{"red": ["a", "c"], "blue": ["b"]}'], ['invert({})', '{}'], ['invert({"x": 1})', '{1: ["x"]}']], [['{"a": "red", "c": "red"}', '{"red": ["a", "c"]}']]),
p('top-k-words', 'Top words', 'Medium', 12, 'Return the k most frequent words in a list, most frequent first, with ties in alphabetical order.', 'def top_words(words, k):\n    ',
  ['Count first. Then what should the sort key be?', 'How do you ask for "biggest count first" and "smallest word first" in one key?'],
  R`def top_words(words, k):
    c = Counter(words)
    return sorted(c, key=lambda w: (-c[w], w))[:k]`, 'O(n log n)', 'Count, then sort with a tuple key. A minus sign flips one part.',
  [['top_words(["b", "a", "b", "c", "a"], 2)', '["a", "b"]'], ['top_words(["x"], 5)', '["x"]'], ['top_words([], 1)', '[]'], ['top_words(["c", "b", "a"], 3)', '["a", "b", "c"]']], [['["b", "a", "b", "c", "a"], 2', '["a", "b"]']])
], boss:
p('team-leaders', 'Team leaders', 'Medium', 14, 'Each row is <code>(team, player, score)</code>, and a player may have several rows. A player\'s total is the sum of their rows. Return a dict of each team to its player with the highest total, with ties going to the alphabetically first name.', 'def leaders(rows):\n    ', [],
  R`def leaders(rows):
    totals = defaultdict(lambda: defaultdict(int))
    for team, player, score in rows:
        totals[team][player] += score
    return {t: min(ps, key=lambda p: (-ps[p], p)) for t, ps in totals.items()}`, 'O(n)', 'Group first, summarise second. min with a tuple key finds the winner without sorting.',
  [['leaders([("a", "x", 1), ("a", "y", 2), ("a", "x", 2)])', '{"a": "x"}'], ['leaders([])', '{}'], ['leaders([("a", "z", 5), ("a", "b", 5), ("c", "q", 0)])', '{"a": "b", "c": "q"}'], ['leaders([("a", "x", -1), ("a", "y", -2)])', '{"a": "x"}']], [['[("a", "x", 1), ("a", "y", 2), ("a", "x", 2)]', '{"a": "x"}']])
});

unit({ id: 'errors', phase: 0, title: 'Errors on purpose', mins: 7, read: [
`<p class="lede">Errors aren't failure. They're how one part of a program tells another, "I can't do what you asked." <b>Good code fails loudly, early and clearly,</b> and cleans up after itself.</p>`,
steps([
  { n: 'A function hits a problem it can\'t fix, so it raises an error. Normal flow stops at once.', d: D.flow({ a: [40, 30, 150, 50, 'read_config()'], b: [270, 30, 150, 50, 'parse_port()', 'r'] }, [['a', 'b', 'calls']]) + D.t(345, 110, 'raise ValueError', { a: 'middle', cls: 'r' }) },
  { n: 'The error travels back up through the callers, skipping everything, until something catches it.', d: D.flow({ a: [40, 30, 150, 50, 'read_config()', 'y'], b: [270, 30, 150, 50, 'parse_port()'] }, [['b', 'a', 'error']]) + D.t(115, 110, 'except ValueError', { a: 'middle', cls: 'g' }) },
  { n: 'Only catch what you know how to handle. Nobody catches it? The program stops and prints the path it took, which is what you learned to read in Debugging.', d: D.t(60, 50, 'Too broad: except Exception hides your own bugs.', { cls: 'r' }) + D.t(60, 90, 'Better: except ValueError, and say what to do next.', { cls: 'g' }) }
], 130),
`<h2>The parts</h2><pre><code>try:
    value = risky()
except ValueError as e:      # only what you can handle
    print("bad input:", e)
else:
    print("ran only if nothing failed")
finally:
    print("runs no matter what")</code></pre>
<h2>Raising your own</h2><p>When input is wrong, stop right there and say why: <code>raise ValueError("port must be 1 to 65535")</code>. This beats returning <code>None</code> or <code>-1</code>, which the caller can forget to check.</p>
<h2>Clean up with <code>with</code></h2><p><code>with open(path) as f:</code> closes the file even if an error happens inside. Any object can do this: <code>__enter__</code> runs at the start and <code>__exit__</code> runs at the end, and <code>__exit__</code> is told if an error happened. Database transactions and locks use the same idea.</p>`,
think('Your code catches every exception, logs nothing and carries on. What will debugging be like in production?', 'Awful. The program keeps running with wrong data, and the place you notice is far from the cause. Swallowed errors are among the most expensive bugs there are.')
], core: [
p('parse-port', 'Check a port', 'Easy', 10, '<code>parse_port(text)</code> returns the port as an int. Raise <code>ValueError</code> if it isn\'t a whole number from 1 to 65535. Spaces around it are fine.', 'def parse_port(text):\n    ',
  ['What does int() do on "abc"? Do you need to do anything about that?', 'Don\'t forget that int("80.5") and int("70000") behave differently.'],
  R`def parse_port(text):
    port = int(text.strip())
    if not 1 <= port <= 65535:
        raise ValueError("port must be 1 to 65535")
    return port`, 'O(1)', 'Let int() raise for you, and check the rule it can\'t know about.',
  [['parse_port("80")', '80'], ['parse_port(" 8080 ")', '8080'], ['_raises(parse_port, "0")', 'True', 'def _raises(f, a):\n    try:\n        f(a)\n    except ValueError:\n        return True\n    return False'], ['_raises(parse_port, "abc")', 'True', 'def _raises(f, a):\n    try:\n        f(a)\n    except ValueError:\n        return True\n    return False'], ['_raises(parse_port, "70000")', 'True', 'def _raises(f, a):\n    try:\n        f(a)\n    except ValueError:\n        return True\n    return False']], [['"80"', '80']]),
p('load-rows', 'Keep going, keep track', 'Medium', 14, 'Each line is <code>name,age</code>. Return <code>(good, errors)</code>. <code>good</code> is a list of <code>(name, age_int)</code>. <code>errors</code> lists the 1-based line numbers that had the wrong number of fields or a non-numeric age.', 'def load_rows(lines):\n    ',
  ['Which errors can happen, and exactly where should the try block start and end?', 'What does unpacking raise when a line has too few or too many fields?'],
  R`def load_rows(lines):
    good, errors = [], []
    for i, line in enumerate(lines, 1):
        try:
            name, age = line.split(",")
            good.append((name, int(age)))
        except ValueError:
            errors.append(i)
    return good, errors`, 'O(n)', 'One bad row shouldn\'t lose the whole file, and it shouldn\'t vanish silently either.',
  [['load_rows(["sam,20", "bad", "ana,x", "bob,30"])', '([("sam", 20), ("bob", 30)], [2, 3])'], ['load_rows([])', '([], [])'], ['load_rows(["a,1,2"])', '([], [1])']], [['["sam,20", "bad"]', '([("sam", 20)], [2])']])
], boss:
p('tx-context', 'Commit or roll back', 'Medium', 16, 'Write a class <code>Transaction(db)</code> for use in a <code>with</code> block. <code>db</code> has <code>commit()</code> and <code>rollback()</code>. Leaving the block normally commits. Leaving because of an error rolls back, and the error must keep travelling. <code>__enter__</code> returns the db.', 'class Transaction:\n    def __init__(self, db):\n        self.db = db\n', [],
  R`class Transaction:
    def __init__(self, db):
        self.db = db

    def __enter__(self):
        return self.db

    def __exit__(self, kind, value, tb):
        if kind is None:
            self.db.commit()
        else:
            self.db.rollback()
        return False`, 'O(1)', '__exit__ is told about the error. Returning False lets it keep travelling.',
  [['d.log', '["commit"]', 'class D:\n    def __init__(self):\n        self.log = []\n    def commit(self):\n        self.log.append("commit")\n    def rollback(self):\n        self.log.append("rollback")\nd = D()\nwith Transaction(d) as x:\n    pass'],
   ['(d.log, hit)', '(["rollback"], True)', 'class D:\n    def __init__(self):\n        self.log = []\n    def commit(self):\n        self.log.append("commit")\n    def rollback(self):\n        self.log.append("rollback")\nd = D()\nhit = False\ntry:\n    with Transaction(d):\n        raise KeyError("x")\nexcept KeyError:\n    hit = True'],
   ['x is d', 'True', 'class D:\n    def commit(self):\n        pass\n    def rollback(self):\n        pass\nd = D()\nwith Transaction(d) as x:\n    pass']], [['with Transaction(db): ...', 'commits']])
});

unit({ id: 'generators', phase: 0, title: 'Generators', mins: 7, read: [
`<p class="lede">A function with <code>yield</code> doesn't run all at once. It hands out one value, <b>pauses with everything intact,</b> and carries on when asked for the next. So you can work with more data than fits in memory, or even with endless data.</p>`,
steps([
  { n: 'A list makes everything first. A million items means a million items in memory right now.', d: D.cells([1, 2, 3, 4, 5, 6, 7, 8], { x: 40, y: 40, hl: { 0: 'y', 1: 'y', 2: 'y', 3: 'y', 4: 'y', 5: 'y', 6: 'y', 7: 'y' }, label: 'made up front' }) },
  { n: 'A generator makes one, then waits. Memory stays tiny, however long it runs.', d: D.cells([1, '', '', '', '', '', '', ''], { x: 40, y: 40, hl: { 0: 'g' }, ptr: { 'next()': 0 }, label: 'made on request' }) },
  { n: 'Ask again and it wakes up exactly where it paused, with its local variables still there.', d: D.cells(['', 2, '', '', '', '', '', ''], { x: 40, y: 40, hl: { 1: 'g' }, ptr: { 'next()': 1 }, label: 'made on request' }) }
], 140),
`<h2>See it pause</h2>`,
tryit('def countdown(n):\n    while n > 0:\n        print("about to give", n)\n        yield n\n        n -= 1\n\ngen = countdown(3)\nprint("nothing has run yet")\nprint(next(gen))\nprint(next(gen))'),
`<h2>Why it matters at work</h2><ul><li><b>Huge files:</b> <code>for line in open(path)</code> reads one line at a time. You've been using a generator already.</li><li><b>Pipelines:</b> read, filter and transform, each step pulling from the last.</li><li><b>Streaming responses:</b> send results as they're ready.</li><li><b>Async code:</b> it's built on this same power to pause, as you'll see in the backend units.</li></ul>
<p>A <code>for</code> loop calls <code>next</code> for you and stops when the generator ends. Round brackets give a one-line version: <code>sum(x * x for x in nums)</code> never builds a list.</p>`,
think('You want the first line in a 50 GB log file containing "ERROR". What would a list do, and what would a generator do?', 'A list reads all 50 GB first and probably crashes. A generator stops as soon as it finds a match, however early that is.')
], core: [
p('squares-gen', 'Endless squares', 'Easy', 8, 'Write a generator <code>squares()</code> that yields 1, 4, 9, 16 and so on, forever.', 'def squares():\n    ',
  ['What state does it need to keep between values?'],
  R`def squares():
    n = 1
    while True:
        yield n * n
        n += 1`, 'O(1) memory', 'An infinite loop is fine when it pauses at each step.',
  [['next(squares())', '1'], ['[next(g) for _ in range(4)]', '[1, 4, 9, 16]', 'g = squares()'], ['[next(g) for _ in range(1000)][-1]', '1000000', 'g = squares()']]),
p('chunks', 'In batches', 'Medium', 14, '<code>chunks(items, n)</code> is a generator yielding lists of up to n items at a time from any iterable, including one that never ends. The last batch can be smaller, and no empty batch is produced.', 'def chunks(items, n):\n    ',
  ['Can you use len() or slicing if the input never ends?', 'When should a batch be handed out? What is left at the very end?'],
  R`def chunks(items, n):
    batch = []
    for x in items:
        batch.append(x)
        if len(batch) == n:
            yield batch
            batch = []
    if batch:
        yield batch`, 'O(n) memory per batch', 'You can only count on a loop: an iterable may have no length and no end.',
  [['list(chunks([1, 2, 3, 4, 5], 2))', '[[1, 2], [3, 4], [5]]'], ['list(chunks([], 3))', '[]'], ['next(chunks(itertools.count(), 3))', '[0, 1, 2]', 'import itertools'], ['list(chunks(range(4), 2))', '[[0, 1], [2, 3]]']], [['[1, 2, 3, 4, 5], 2', '[[1, 2], [3, 4], [5]]']])
], boss:
p('lazy-merge', 'Merge without reading it all', 'Hard', 22, '<code>merge_sorted(*streams)</code> takes any number of sorted iterables and yields all their values in sorted order. It must be lazy: streams may be endless, and it may read only one value at a time from each. Don\'t use <code>heapq.merge</code>.', 'def merge_sorted(*streams):\n    ', [],
  R`def merge_sorted(*streams):
    its = [iter(s) for s in streams]
    h = []
    for i, it in enumerate(its):
        for v in it:
            h.append((v, i))
            break
    heapq.heapify(h)
    while h:
        v, i = heapq.heappop(h)
        yield v
        for nxt in its[i]:
            heapq.heappush(h, (nxt, i))
            break`, 'O(log k) per value', 'A heap holds one value per stream. The stream index breaks ties.',
  [['list(merge_sorted([1, 4], [2, 3]))', '[1, 2, 3, 4]'], ['list(merge_sorted())', '[]'], ['list(merge_sorted([], [1]))', '[1]'], ['list(itertools.islice(merge_sorted(itertools.count(0, 2), itertools.count(1, 2)), 5))', '[0, 1, 2, 3, 4]', 'import itertools'], ['list(merge_sorted([1, 1], [1]))', '[1, 1, 1]']], [['[1, 4], [2, 3]', '[1, 2, 3, 4]']])
});

unit({ id: 'decorators', phase: 0, title: 'Functions as things', mins: 8, read: [
`<p class="lede">In Python a function is a value, just like a number. You can pass it around, return it, and wrap it in another function. <b>Every web framework you'll ever use is built on this.</b></p>`,
steps([
  { n: 'A function can make and return a new function. The inner one keeps access to variables from where it was made. That memory is called a closure.', d: D.flow({ a: [40, 30, 190, 60, 'make_adder(5)'], b: [330, 30, 200, 60, 'add(x)\nremembers n = 5', 'g'] }, [['a', 'b', 'returns']]) },
  { n: 'A decorator is a function that takes a function, and returns a wrapped version.', d: D.flow({ a: [40, 30, 150, 60, 'slow_fn'], b: [270, 30, 150, 60, 'timed(...)', 'y'], c: [500, 30, 170, 60, 'wrapper\ntimes, then calls', 'g'] }, [['a', 'b'], ['b', 'c']]) },
  { n: 'The @ line is only shorthand. Writing @timed above a function means: fn = timed(fn).', d: D.t(60, 50, '@timed', { mono: 1, cls: 'r' }) + D.t(60, 74, 'def fn(): ...', { mono: 1 }) + D.t(300, 62, 'is the same as', { cls: 'soft' }) + D.t(450, 62, 'fn = timed(fn)', { mono: 1, cls: 'r' }) }
], 120),
`<h2>Try one</h2>`,
tryit('def shout(fn):\n    def wrapper(*args, **kwargs):\n        return fn(*args, **kwargs).upper()\n    return wrapper\n\n@shout\ndef hello(name):\n    return "hi " + name\n\nprint(hello("sam"))'),
`<p><code>*args, **kwargs</code> means "whatever arguments I get, pass them along". That lets a wrapper fit any function.</p>
<h2>Where you'll see them</h2><p><code>@app.get("/users")</code> registers a route, <code>@login_required</code> checks access, <code>@lru_cache</code> remembers answers, and <code>@pytest.fixture</code> sets up tests. None of them are magic: each one takes a function and returns one.</p>
<p>Use <code>functools.wraps(fn)</code> on your wrapper, so the wrapped function keeps its name and docs.</p>`,
think('A decorator that takes settings, like @retry(times=3), has one more layer than one without. Why?', '<code>retry(times=3)</code> runs first and must return the actual decorator, which then receives the function. That makes three levels: settings, function, call.')
], core: [
p('make-counter', 'A counter that remembers', 'Easy', 8, '<code>make_counter()</code> returns a function. Each call to it returns 1, then 2, then 3. Two counters must not share a count.', 'def make_counter():\n    ',
  ['Where can the count live so that it survives between calls?', 'Assigning to an outer variable needs one extra keyword. Which one?'],
  R`def make_counter():
    n = 0
    def count():
        nonlocal n
        n += 1
        return n
    return count`, 'O(1)', 'A closure is a small private memory attached to a function.',
  [['(a(), a(), a())', '(1, 2, 3)', 'a = make_counter()'], ['(a(), a(), b())', '(1, 2, 1)', 'a = make_counter()\nb = make_counter()']]),
p('memoize', 'Never compute it twice', 'Medium', 14, 'Write a decorator <code>memoize</code>, for functions with hashable positional arguments. Once called with some arguments, later calls return the saved answer without running the function again. Don\'t use <code>functools</code>.', 'def memoize(fn):\n    ',
  ['What should the saved answers be keyed by? What does *args look like inside?'],
  R`def memoize(fn):
    saved = {}
    def wrapper(*args):
        if args not in saved:
            saved[args] = fn(*args)
        return saved[args]
    return wrapper`, 'O(1) per repeat call', '*args arrives as a tuple, and tuples are hashable: a ready-made key.',
  [['(f(2), f(2), f(3), len(calls))', '(4, 4, 6, 2)', 'calls = []\n@memoize\ndef f(x):\n    calls.append(x)\n    return x * 2'], ['fib(200)', '280571172992510140037611932413038677189525', '@memoize\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)'], ['(g(None), g(None), n[0])', '(None, None, 1)', 'n = [0]\n@memoize\ndef g(x):\n    n[0] += 1\n    return x']])
], boss:
p('retry-deco', 'Try again', 'Medium', 18, 'Write <code>retry(times, on=Exception)</code>, a decorator with settings. It calls the function up to <code>times</code> attempts in all, retrying only when it raises <code>on</code> or a subclass. Any other error goes straight out. If all attempts fail, the last error goes out. Keep the wrapped function\'s <code>__name__</code>.', 'import functools\n\ndef retry(times, on=Exception):\n    ', [],
  R`import functools

def retry(times, on=Exception):
    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for i in range(times):
                try:
                    return fn(*args, **kwargs)
                except on:
                    if i == times - 1:
                        raise
        return wrapper
    return deco`, 'O(times)', 'Three layers: settings, function, call. "except on" works with a variable holding an exception class.',
  [['(f(), n[0])', '("ok", 3)', 'n = [0]\n@retry(3)\ndef f():\n    n[0] += 1\n    if n[0] < 3:\n        raise ValueError("no")\n    return "ok"'],
   ['(hit, n[0])', '(True, 2)', 'n = [0]\n@retry(2)\ndef f():\n    n[0] += 1\n    raise ValueError("no")\nhit = False\ntry:\n    f()\nexcept ValueError:\n    hit = True'],
   ['(hit, n[0])', '(True, 1)', 'n = [0]\n@retry(5, on=KeyError)\ndef f():\n    n[0] += 1\n    raise ValueError("no")\nhit = False\ntry:\n    f()\nexcept ValueError:\n    hit = True'],
   ['f.__name__', '"f"', '@retry(2)\ndef f():\n    return 1'], ['f(2, b=3)', '5', '@retry(2)\ndef f(a, b):\n    return a + b']], [['@retry(3)', 'up to 3 attempts']])
});

const catcher = name => `def good(*a):\n    pass\ndef _caught(impl):\n    try:\n        ${name}(impl)\n    except AssertionError:\n        return True\n    return False\n`;
unit({ id: 'testing', phase: 0, title: 'Test your own code', mins: 8, read: [
`<p class="lede">A test is a small program that checks another program. It's how you change code next month without fear, and <b>the fastest way to find out what you meant.</b> In this unit, you write tests that catch bugs.</p>`,
steps([
  { n: 'Every test has three parts. Set up, do the thing, check the result.', d: D.flow({ a: [20, 30, 200, 60, 'Arrange\nsome input', 'b'], b: [260, 30, 200, 60, 'Act\ncall the function', 'y'], c: [500, 30, 200, 60, 'Assert\nwas it right?', 'g'] }, [['a', 'b'], ['b', 'c']]) },
  { n: 'A good test is one that fails when the code is wrong. Tests that can\'t fail prove nothing. That\'s why you should watch each test fail once.', d: D.t(40, 50, 'assert median([1, 2, 3]) == 2', { mono: 1, cls: 'g' }) + D.t(40, 90, 'assert median([1, 2, 3]) is not None', { mono: 1, cls: 'r' }) + D.t(440, 90, 'almost anything passes this', { cls: 'r' }) }
], 120),
`<h2>What to test</h2><p>Bugs live at the edges, so go looking there:</p><table><tr><th>Think about</th><th>For example</th></tr><tr><td>Nothing</td><td>Empty list, empty string, <code>None</code>, zero</td></tr><tr><td>One</td><td>A single item</td></tr><tr><td>The boundary</td><td>Exactly at the limit, just above, just below</td></tr><tr><td>The ugly</td><td>Duplicates, negatives, already sorted, very large</td></tr><tr><td>Failure</td><td>Does it raise the right error on bad input?</td></tr></table>
<h2>Make time, randomness and networks replaceable</h2><p>A function that reads the real clock is hard to test. Pass the clock in, and a test can use a fake one. That's why the backend problems in this portal take a <code>now</code> value. The same goes for the network and the database: pass them in and fake them in tests.</p>
<h2>On a bug, write the test first</h2><p>Found a bug? Write a test that fails because of it, then fix the code. The bug can never quietly come back. In real projects you'll use <code>pytest</code>, which you'll set up in Ship real things.</p>`,
think('Your tests all pass, and 100% of your lines ran during them. Does that prove the code is correct?', 'No. Running a line isn\'t the same as checking its result, and tests can only cover the cases you thought of. They raise your confidence; they don\'t prove anything. This is why edge cases matter so much.')
], core: [
p('test-leap', 'Catch the leap year bugs', 'Easy', 12, 'Write <code>test_leap(f)</code>. It receives some implementation <code>f(year)</code> of "is this a leap year?" and must use <code>assert</code> to check it. A year is a leap year if divisible by 4, except for centuries, which must be divisible by 400. A correct <code>f</code> must pass, and buggy ones must fail an assert.', 'def test_leap(f):\n    ',
  ['What are the four kinds of year in the rule? Pick one of each.'],
  R`def test_leap(f):
    assert f(2024) is True
    assert f(2023) is False
    assert f(1900) is False
    assert f(2000) is True`, 'O(1)', 'One test per branch of the rule, including the exceptions to the exception.',
  [['_caught(lambda y: y % 4 == 0 and (y % 100 != 0 or y % 400 == 0))', 'False', catcher('test_leap')], ['_caught(lambda y: y % 4 == 0)', 'True', catcher('test_leap')], ['_caught(lambda y: y % 4 == 0 and y % 100 != 0)', 'True', catcher('test_leap')], ['_caught(lambda y: True)', 'True', catcher('test_leap')], ['_caught(lambda y: False)', 'True', catcher('test_leap')]])
], boss:
p('test-sort', 'Catch the sneaky sorts', 'Medium', 18, 'Write <code>test_sort(f)</code>, which checks some implementation <code>f(nums)</code> that should return a new sorted list without changing its input. It must pass a correct version, and fail versions that lose duplicates, break on an empty list, sort backwards, mishandle negatives, or change the input.', 'def test_sort(f):\n    ', [],
  R`def test_sort(f):
    assert f([]) == []
    assert f([1]) == [1]
    assert f([3, 1, 2]) == [1, 2, 3]
    assert f([2, 1, 2]) == [1, 2, 2]
    assert f([-1, -5, 3]) == [-5, -1, 3]
    original = [3, 1, 2]
    f(original)
    assert original == [3, 1, 2]`, 'O(1)', 'Each kind of bug needs an input that could reveal it. Write the bug down first, then the input.',
  [['_caught(lambda a: sorted(a))', 'False', catcher('test_sort')], ['_caught(lambda a: sorted(set(a)))', 'True', catcher('test_sort')], ['_caught(lambda a: sorted(a, reverse=True))', 'True', catcher('test_sort')], ['_caught(lambda a: sorted(a, key=abs))', 'True', catcher('test_sort')], ['_caught(lambda a: a.sort() or a)', 'True', catcher('test_sort')], ['_caught(lambda a: sorted(a) if a else None)', 'True', catcher('test_sort')]])
});
})();
