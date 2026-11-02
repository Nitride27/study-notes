// Phase 2: Data structures.

unit({ id: 'stacks', phase: 2, title: 'Stacks', mins: 8, read: [
`<p class="lede">A stack of plates: you add to the top and take from the top. Use it whenever <b>the most recent unfinished thing is the one you have to deal with next.</b></p>`,
steps((() => {
  const seq = [['(', ['(' ], 'An opener: something is now unfinished, so put it on the stack.'], ['[', ['(', '['], 'Another one, nested inside the first.'], [']', ['('], 'A closer. It has to match the most recent opener, which is the top of the stack. They match, so pop it.'], [')', [], 'Same again. Empty stack at the end means every opener was closed.']];
  return seq.map(([c, st, n], i) => ({ n, d: D.cells(['(', '[', ']', ')'], { x: 300, y: 40, hl: { [i]: 'y' }, ptr: { now: i } }) + D.stack(st, { x: 60, y: 150, h: 26 }) }));
})(), 190),
`<h2>Where the "most recent" shape appears</h2>
<ul><li>Nested things: brackets, tags, folders, function calls.</li><li>Undo: the last action comes back first.</li><li>Working something out by holding pending values.</li></ul>
<h2>The monotonic stack: a sharper tool</h2><p>Now a harder kind of question: for each item, <b>who's the next one taller than me?</b> Picture people in a line waiting to see over someone.</p>`,
steps((() => {
  const h = [3, 1, 2, 5, 4], f = [];
  const fr = (i, st, n) => f.push({ n, d: D.bars(h, { x: 260, y: 150, w: 44, unit: 22, hl: { [i]: 'y' } }) + D.stack(st, { x: 60, y: 150, h: 26 }) });
  fr(0, [3], 'Each item waits on the stack until someone taller shows up.');
  fr(1, [3, 1], 'A 1 is shorter than the top, so it can\'t answer anyone. It waits too. The stack stays in shrinking order.');
  fr(2, [3, 2], 'A 2 arrives, taller than the 1, so the 1 has its answer and leaves. Then the 2 waits.');
  fr(3, [5], 'A 5 is taller than everything waiting. All of them get their answer in one go, and the 5 waits.');
  fr(4, [5, 4], 'Each item goes on once and comes off once. Total work is O(n), even with a loop inside a loop.');
  return f;
})(), 190),
`<p>In Python, a list is a perfect stack: <code>a.append(x)</code>, <code>a.pop()</code>, <code>a[-1]</code>, all O(1).</p>`,
think('When you pop an item in that last picture, what do you learn, and what should the stack hold so you can use it?', 'You learn that the item just found its answer. If the question involves distance, you need the item\'s position, so stacks often hold positions rather than values.')
], core: ['valid-parentheses', 'min-stack', 'eval-rpn', 'daily-temperatures'], extra: ['decode-string', 'asteroid-collision', 'score-parentheses'], boss: 'largest-rectangle' });

unit({ id: 'queues', phase: 2, title: 'Queues and deques', mins: 6, read: [
`<p class="lede">A queue is a line at a shop: first in, first out. Use it when <b>the order things arrived in is the order they should be handled</b>. It's the backbone of breadth-first search and of every job system you'll build later.</p>`,
fig(D.cells(['a', 'b', 'c', 'd'], { x: 220, y: 40 }) + D.arrow(150, 62, 212, 62, 'r') + D.t(90, 66, 'leaves', { cls: 'r' }) + D.arrow(480, 62, 420, 62, 'b') + D.t(490, 66, 'joins', { cls: 'b' }), 115),
`<pre><code>from collections import deque
q = deque()
q.append(x)      # join at the back
q.popleft()      # leave from the front, O(1)
q.appendleft(x)  # a deque works at both ends
q.pop()</code></pre>`,
`<h2>The sliding maximum trick</h2><p>A deque can hold "people who might still matter." If someone newer is taller, then nobody shorter in front of them can ever be the maximum again, since the newer one is both taller and leaves later. Sweep them away.</p>`,
steps([
  { n: 'Window of width 3. Keep candidates in the deque, tallest at the front.', d: D.bars([1, 3, 2, 5, 1], { x: 60, y: 130, w: 44, unit: 20, hl: { 0: 'y', 1: 'y', 2: 'y' } }) + D.t(340, 60, 'candidates: 3, 2', {}) + D.t(340, 90, 'max: 3', { cls: 'g' }) },
  { n: 'A 5 arrives. It is taller and it will outlast them, so the 3 and 2 can never win again. They go.', d: D.bars([1, 3, 2, 5, 1], { x: 60, y: 130, w: 44, unit: 20, hl: { 1: 'y', 2: 'y', 3: 'y' } }) + D.t(340, 60, 'candidates: 5', {}) + D.t(340, 90, 'max: 5', { cls: 'g' }) },
  { n: 'The 1 might matter once the 5 has left, so it stays. Whoever is at the front has to be checked: have they left the window?', d: D.bars([1, 3, 2, 5, 1], { x: 60, y: 130, w: 44, unit: 20, hl: { 2: 'y', 3: 'y', 4: 'y' } }) + D.t(340, 60, 'candidates: 5, 1', {}) + D.t(340, 90, 'max: 5', { cls: 'g' }) }
], 160),
think('Why does the deque store positions rather than values?', 'To tell when the front has slid out of the window, you need to know where it was.')
], core: [
{ id: 'recent-calls', title: 'Recent calls', diff: 'Easy', time: 8,
  desc: `<p>Write class <code>Recent</code>. <code>ping(t)</code> records a call at time <code>t</code> (times always increase), and returns how many calls happened in the last 3000 time units, including <code>t</code>: the range <code>[t - 3000, t]</code>.</p>`,
  ex: [['ping(1), ping(100), ping(3001), ping(3002)', '1, 2, 3, 3']], start: 'class Recent:\n    ',
  nudge: ['Once a call is too old, can it ever matter again?'],
  sol: `from collections import deque\n\nclass Recent:\n    def __init__(self):\n        self.q = deque()\n\n    def ping(self, t):\n        self.q.append(t)\n        while self.q[0] < t - 3000:\n            self.q.popleft()\n        return len(self.q)`, big: 'O(1) on average per ping', idea: 'Old things leave from the front. They never come back.',
  tests: [['[r.ping(t) for t in [1, 100, 3001, 3002]]', '[1, 2, 3, 3]', 'r = Recent()'], ['[r.ping(t) for t in [1, 5000, 5001]]', '[1, 1, 2]', 'r = Recent()'], ['r.ping(1)', '1', 'r = Recent()'], ['sum(r.ping(t) for t in range(0, 300000, 1000))', '1194', 'r = Recent()']] },
{ id: 'hot-potato', title: 'Hot potato', diff: 'Easy', time: 8,
  desc: `<p><code>n</code> people numbered 1 to n sit in a circle. Counting starts at person 1. Every <code>k</code>th person is out, and counting continues with the next person. Return the last person left. Use a queue, not a formula.</p>`,
  ex: [['5, 2', '3', 'out: 2, 4, 1, 5'], ['1, 3', '1']], start: 'def last_one(n, k):\n    ',
  nudge: ['What does "not it yet, go to the back of the line" look like with a queue?'],
  sol: `from collections import deque\n\ndef last_one(n, k):\n    q = deque(range(1, n + 1))\n    while len(q) > 1:\n        q.rotate(-(k - 1))\n        q.popleft()\n    return q[0]`, big: 'O(n·k) or better', idea: 'A circle is a queue: people who survive go to the back.',
  tests: [['last_one(5, 2)', '3'], ['last_one(1, 3)', '1'], ['last_one(7, 3)', '4'], ['last_one(2, 1)', '2'], ['last_one(4, 1)', '4']] }
], boss:
{ id: 'sliding-max', title: 'Sliding window maximum', diff: 'Hard', time: 25,
  desc: `<p>For each window of width <code>k</code>, report the maximum. Must be O(n): the tests use 300,000 numbers with k = 100,000.</p>`,
  ex: [['[1, 3, -1, -3, 5, 3, 6, 7], 3', '[3, 3, 5, 5, 6, 7]']], start: 'def window_max(a, k):\n    ', nudge: [],
  sol: `from collections import deque\n\ndef window_max(a, k):\n    q = deque()\n    out = []\n    for i, x in enumerate(a):\n        while q and a[q[-1]] <= x:\n            q.pop()\n        q.append(i)\n        if q[0] <= i - k:\n            q.popleft()\n        if i >= k - 1:\n            out.append(a[q[0]])\n    return out`, big: 'O(n) time, O(k) space', idea: 'Keep only candidates who could still win. Each goes on and off once.',
  tests: [['window_max([1, 3, -1, -3, 5, 3, 6, 7], 3)', '[3, 3, 5, 5, 6, 7]'], ['window_max([1], 1)', '[1]'], ['window_max([4, 2], 2)', '[4]'], ['window_max([1, 2, 3], 1)', '[1, 2, 3]'], ['window_max([5, 4, 3, 2], 2)', '[5, 4, 3]'], ['window_max(list(range(300000)), 100000)[-1]', '299999'], ['window_max(list(range(300000, 0, -1)), 100000)[0]', '300000']] }
});

unit({ id: 'linked-lists', phase: 2, title: 'Linked lists', mins: 9, read: [
`<p class="lede">A treasure hunt. Each clue tells you only where the next clue is. There's no "go to clue 5": you follow the chain. <b>But adding a clue in the middle is just changing one note.</b></p>`,
fig(D.flow({ a: [30, 40, 90, 50, 'val 1'], b: [200, 40, 90, 50, 'val 2'], c: [370, 40, 90, 50, 'val 3'], n: [540, 40, 90, 50, 'None', 'r'] }, [['a', 'b', 'next'], ['b', 'c', 'next'], ['c', 'n', 'next']]) + D.t(30, 28, 'head', { cls: 'b' }), 110),
`<h2>Rewiring: the only hard part</h2><p>The danger: when you overwrite <code>node.next</code>, you lose the way to the rest of the chain. So before cutting a wire, hold on to what's on the other side. <b>Draw this on the pad every time.</b> Experts do too.</p>`,
steps([
  { n: 'To insert X after A, what comes first?', d: D.flow({ a: [40, 50, 80, 44, 'A'], b: [300, 50, 80, 44, 'B'], x: [170, 120, 80, 44, 'X', 'y'] }, [['a', 'b']]) },
  { n: 'First make X point at B. Nothing is lost yet.', d: D.flow({ a: [40, 50, 80, 44, 'A'], b: [300, 50, 80, 44, 'B'], x: [170, 120, 80, 44, 'X', 'y'] }, [['a', 'b'], ['x', 'b', '', 'b']]) },
  { n: 'Now A can safely point at X. Do those in the other order and B is gone.', d: D.flow({ a: [40, 50, 80, 44, 'A'], b: [300, 50, 80, 44, 'B'], x: [170, 120, 80, 44, 'X', 'y'] }, [['a', 'x', '', 'b'], ['x', 'b', '', 'b']]) }
], 180),
`<h2>Three tools</h2>
<table><tr><th>Tool</th><th>What it solves</th></tr>
<tr><td><b>Dummy head</b></td><td>A fake node before the first one. The first node stops being a special case.</td></tr>
<tr><td><b>Prev and current</b></td><td>Two fingers walking together, so you can rewire behind you.</td></tr>
<tr><td><b>Fast and slow</b></td><td>One goes twice as fast. When fast finishes, where is slow? On a circular track, do they meet?</td></tr></table>`,
fig(D.flow({ a: [30, 30, 60, 40, '1'], b: [130, 30, 60, 40, '2', 'y'], c: [230, 30, 60, 40, '3'], d: [330, 30, 60, 40, '4', 'b'], e: [430, 30, 60, 40, '5'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e']]) + D.t(160, 92, 'slow', { a: 'middle' }) + D.t(360, 92, 'fast', { a: 'middle', cls: 'b' }) + D.t(520, 56, 'twice the distance', { cls: 'soft' }), 105),
think('Reversing means every <code>next</code> points backward. As you stand on one node, how many names do you need to hold at once?', 'Three: the one behind (where to point), the current one, and the one ahead (saved before you cut the wire). Draw it, and the three lines write themselves.')
], core: ['reverse-list', 'merge-two-lists', 'middle-node', 'linked-list-cycle'], extra: ['palindrome-list', 'add-two-numbers'], boss: 'remove-nth' });

unit({ id: 'recursion', phase: 2, title: 'Recursion', mins: 11, read: [
`<p class="lede">You're in a line and want to know your position. You ask the person in front "what's your number?" They ask the person in front of them. The first person says "1", and the answer travels back, each person adding one.</p>
<p><b>That is recursion: solve a smaller copy, then do your bit.</b></p>`,
steps((() => {
  const f = [], fr = (st, n) => f.push({ n, d: D.stack(st, { x: 90, y: 170, w: 170, h: 30 }) + D.t(340, 80, 'Each call waits on the desk', { cls: 'soft' }) + D.t(340, 106, 'beneath it, until it hears back.', { cls: 'soft' }) });
  fr(['sum_to(3)'], 'sum_to(3) needs sum_to(2) before it can finish, so it waits.');
  fr(['sum_to(3)', 'sum_to(2)'], 'Another smaller copy, on a new desk.');
  fr(['sum_to(3)', 'sum_to(2)', 'sum_to(1)'], 'And another. They keep their own <code>n</code>.');
  fr(['sum_to(3)', 'sum_to(2)', 'sum_to(1)', 'sum_to(0)'], 'The base case: 0 needs no help, and returns 0. Without this, the stack grows until Python stops you.');
  fr(['sum_to(3)', 'sum_to(2)', 'sum_to(1) = 1'], 'Answers come back down: 1 + 0.');
  fr(['sum_to(3)', 'sum_to(2) = 3'], '2 + 1.');
  fr(['sum_to(3) = 6'], '3 + 3. Done.');
  return f;
})(), 200),
`<h2>Three questions, every time</h2><ol>
<li><b>What's the smallest input</b> I can answer without help? That's the base case.</li>
<li><b>If a friend solved a smaller version</b>, what could they hand me? That's the recursive call.</li>
<li><b>How do I turn their answer into mine?</b> That's your bit.</li></ol>
<p><b>Don't trace the whole thing in your head.</b> Beginners try to follow every level and get lost. Assume the smaller call returns the right answer, and only check your one step. This is the leap of faith, and it's how you think about trees later.</p>
<h2>The cost of branching</h2>`,
fig(D.tree(['f5', ['f4', ['f3', ['f2'], ['f1a', null, null]], ['f2b']], ['f3b', ['f2c'], ['f1b']]], { x: 360, y: 26, spread: 170, dy: 50, hl: { f3: 'r', f3b: 'r', f2: 'y', f2b: 'y', f2c: 'y' } }), 195, 'Calling yourself twice doubles the work at each level. Notice the same subproblems being repeated, in red and yellow.'),
`<p><b>Memoization</b> is the fix: write each answer down the first time, and look it up after that. This is the start of dynamic programming.</p>`,
`<pre><code>from functools import lru_cache
@lru_cache(maxsize=None)
def f(n): ...          # Python remembers every answer for you</code></pre>`,
think('What is Python\'s default recursion limit, and what does it mean for a list of a million items?', 'About 1000 levels, so a million-deep recursion crashes. Linear problems are usually better as loops. Recursion shines on things that branch, where depth stays small.')
], core: [
{ id: 'rec-power', title: 'Power by halving', diff: 'Easy', time: 10,
  desc: `<p>Compute <code>x ** n</code> for an integer n ≥ 0 using recursion, without <code>**</code> or <code>pow</code>. It must use O(log n) multiplications: tests use n = 200,000 with x = 1, and count the calls.</p>`,
  ex: [['2, 10', '1024'], ['5, 0', '1']], start: 'def power(x, n):\n    ',
  nudge: ['If you already knew x to the n/2, how would you get x to the n?', 'What changes when n is odd?'],
  sol: `def power(x, n):\n    if n == 0:\n        return 1\n    half = power(x, n // 2)\n    return half * half * (x if n % 2 else 1)`, big: 'O(log n)', idea: 'Halve the problem and call once. Calling twice would lose the benefit.',
  tests: [['power(2, 10)', '1024'], ['power(5, 0)', '1'], ['power(3, 1)', '3'], ['power(2, 61)', '2305843009213693952'], ['power(1, 200000)', '1'], ['power(3, 7)', '2187']] },
{ id: 'rec-flatten', title: 'Flatten', diff: 'Easy', time: 10,
  desc: `<p>Given a list that may contain lists, nested to any depth, return one flat list in the same order.</p>`,
  ex: [['[1, [2, [3, 4]], 5]', '[1, 2, 3, 4, 5]']], start: 'def flatten(a):\n    ',
  nudge: ['For one item, what are the two cases?', '<code>isinstance(x, list)</code> tells you which case you are in.'],
  sol: `def flatten(a):\n    out = []\n    for x in a:\n        if isinstance(x, list):\n            out += flatten(x)\n        else:\n            out.append(x)\n    return out`, big: 'O(total items)', idea: 'Data with a nested shape wants a recursive solution with the same shape.',
  tests: [['flatten([1, [2, [3, 4]], 5])', '[1, 2, 3, 4, 5]'], ['flatten([])', '[]'], ['flatten([[], [[]]])', '[]'], ['flatten([1, 2])', '[1, 2]'], ['flatten([[[[7]]]])', '[7]']] },
{ id: 'rec-memo', title: 'Stairs with memory', diff: 'Medium', time: 12,
  desc: `<p>You climb <code>n</code> stairs taking 1, 2 or 3 steps at a time. Return how many different ways there are. A plain recursive version is hopelessly slow for n = 500, so make it remember.</p>`,
  ex: [['3', '4', '1+1+1, 1+2, 2+1, 3'], ['0', '1']], start: 'def ways(n):\n    ',
  nudge: ['Your last move was 1, 2 or 3 steps. So how many ways reach step n?', 'What should you do the second time you are asked about the same n?'],
  sol: `def ways(n):\n    memo = {0: 1}\n    def go(k):\n        if k < 0:\n            return 0\n        if k not in memo:\n            memo[k] = go(k - 1) + go(k - 2) + go(k - 3)\n        return memo[k]\n    return go(n)`, big: 'O(n)', idea: 'Same subproblem, same answer. Write it down the first time.',
  tests: [['ways(3)', '4'], ['ways(0)', '1'], ['ways(1)', '1'], ['ways(4)', '7'], ['ways(500) % 1000000007', 'c % 1000000007', 'a, b, c = 1, 1, 2\nfor _ in range(3, 501):\n    a, b, c = b, c, a + b + c']] }
], extra: [
{ id: 'rec-hanoi', title: 'Tower of Hanoi', diff: 'Medium', time: 15,
  desc: `<p>Move <code>n</code> disks from peg <code>"A"</code> to peg <code>"C"</code> using peg <code>"B"</code>. One disk at a time, never a bigger one on a smaller one. Return the moves as a list of pairs like <code>("A", "C")</code>.</p>`,
  ex: [['2', '[("A","B"), ("A","C"), ("B","C")]']], start: 'def hanoi(n):\n    ',
  nudge: ['To move the biggest disk, where do all the others have to be?'],
  sol: `def hanoi(n, a="A", c="C", b="B"):\n    if n == 0:\n        return []\n    return hanoi(n - 1, a, b, c) + [(a, c)] + hanoi(n - 1, b, c, a)`, big: 'O(2ⁿ) moves', idea: 'Trust the recursion. Move n−1 out of the way, move the big one, move n−1 back on top.',
  tests: [['hanoi(2)', '[("A","B"), ("A","C"), ("B","C")]'], ['hanoi(0)', '[]'], ['len(hanoi(5))', '31'], ['hanoi(1)', '[("A","C")]'], ['hanoi(3)[3]', '("A","C")']] }
], boss:
{ id: 'rec-expression', title: 'Tiny calculator', diff: 'Hard', time: 25,
  desc: `<p>Evaluate a string with non-negative integers, <code>+ - * /</code> and parentheses, using normal precedence. Division is integer division that truncates toward zero. Spaces may appear. Don't use <code>eval</code>.</p>`,
  ex: [['"2 + 3 * 4"', '14'], ['"(2 + 3) * 4"', '20'], ['"7 - 10 / 3"', '4']], start: 'def calc(s):\n    ', nudge: [],
  sol: `def calc(s):\n    s = s.replace(" ", "")\n    i = 0\n\n    def expr():\n        nonlocal i\n        v = term()\n        while i < len(s) and s[i] in "+-":\n            op = s[i]\n            i += 1\n            v = v + term() if op == "+" else v - term()\n        return v\n\n    def term():\n        nonlocal i\n        v = factor()\n        while i < len(s) and s[i] in "*/":\n            op = s[i]\n            i += 1\n            r = factor()\n            v = v * r if op == "*" else int(v / r)\n        return v\n\n    def factor():\n        nonlocal i\n        if s[i] == "(":\n            i += 1\n            v = expr()\n            i += 1\n            return v\n        j = i\n        while j < len(s) and s[j].isdigit():\n            j += 1\n        v = int(s[i:j])\n        i = j\n        return v\n\n    return expr()`, big: 'O(n)', idea: 'Each level of precedence is one function. Parentheses restart from the top: that is recursion matching the grammar.',
  tests: [['calc("2 + 3 * 4")', '14'], ['calc("(2 + 3) * 4")', '20'], ['calc("7 - 10 / 3")', '4'], ['calc("8")', '8'], ['calc("((1))")', '1'], ['calc("2 * (3 + (4 - 1)) - 1")', '11'], ['calc("10 - 2 - 3")', '5'], ['calc("100 / 10 / 5")', '2'], ['calc("(1 - 8) / 2")', '-3']] }
});

const T1 = [8, [3, [1], [6]], [10, null, [14]]];
unit({ id: 'trees', phase: 2, title: 'Trees', mins: 11, read: [
`<p class="lede">A tree is a linked list where each node may have several next nodes. Here's the good news: <b>each child is itself a whole tree.</b> So recursion fits as if it were made for it.</p>`,
fig(D.tree(T1, { x: 350, y: 26, spread: 130, dy: 56 }) + D.t(400, 26, 'root', { cls: 'soft' }) + D.t(600, 150, 'leaf: no children', { cls: 'soft' }), 195),
`<h2>The one question to ask</h2><p>Stand on a node. Assume your left and right children have already given you their answers. What do you do with them?</p>`,
steps((() => {
  const f = [], pic = (hl, n, extra = '') => f.push({ n, d: D.tree(T1, { x: 300, y: 26, spread: 120, dy: 56, hl }) + extra });
  pic({ 1: 'y' }, 'Question: how tall is the tree? A leaf has no children, so both of its sides answer 0.', D.t(540, 60, '1 is a leaf: height 1', {}));
  pic({ 1: 'g', 6: 'g', 3: 'y' }, 'Node 3 hears 1 from each side. Its own answer is the larger plus one.', D.t(540, 60, '3: max(1, 1) + 1 = 2', {}));
  pic({ 3: 'g', 10: 'g', 8: 'y' }, 'At the root: left says 2, right says 2. The answer is 3. You only ever reasoned about one node.', D.t(540, 60, '8: max(2, 2) + 1 = 3', { cls: 'g' }));
  return f;
})(), 200),
`<h2>Walks</h2>`,
fig(D.flow({ a: [20, 15, 215, 66, 'Preorder: me, left, right\ncopying, printing structure'], b: [250, 15, 215, 66, 'Inorder: left, me, right\nsorted order in a BST', 'y'], c: [480, 15, 220, 66, 'Postorder: left, right, me\nI need my children\'s answers'] }) + D.flow({ d: [20, 100, 680, 50, 'Level by level: use a queue, not recursion. For anything about layers or nearest.', 'b'] }), 165),
`<h2>Passing information</h2>
<table><tr><th>Direction</th><th>How</th><th>Example question</th></tr>
<tr><td><b>Up</b>, from children</td><td>return values</td><td>How tall? How many?</td></tr>
<tr><td><b>Down</b>, from parents</td><td>extra parameters</td><td>How deep am I? What limits apply to me?</td></tr></table>
<p>Some problems want one thing returned but need to track something different. Use an outer variable for the best answer seen, and return what the parent needs.</p>
<p>The helper <code>TreeNode(val, left, right)</code> exists on every problem here. In tests, <code>tree([1, 2, None, 3])</code> builds a tree from a level-by-level list.</p>`,
think('At each node, the longest path through it uses the left height and the right height. But what do you return to your parent, and why not the same thing?', 'Return your height, because a path going up through you to your parent can only use one of your sides. Update a separate best with left + right.')
], core: [
{ id: 'tree-depth', title: 'How tall', diff: 'Easy', time: 6,
  desc: `<p>Return the number of levels in a binary tree. An empty tree has 0.</p>`, ex: [['tree([3, 9, 20, None, None, 15, 7])', '3']], start: 'def depth(root):\n    ',
  nudge: ['What would you want your two children to tell you?'],
  sol: `def depth(root):\n    if not root:\n        return 0\n    return 1 + max(depth(root.left), depth(root.right))`, big: 'O(n) time, O(height) space', idea: 'Assume the children answered. Combine.',
  tests: [['depth(tree([3, 9, 20, None, None, 15, 7]))', '3'], ['depth(None)', '0'], ['depth(tree([1]))', '1'], ['depth(tree([1, 2, None, 3]))', '3']] },
{ id: 'tree-invert', title: 'Mirror it', diff: 'Easy', time: 6,
  desc: `<p>Swap left and right at every node. Return the root.</p>`, ex: [['tree([4, 2, 7])', 'tree_list gives [4, 7, 2]']], start: 'def invert(root):\n    ',
  nudge: ['What is the entire job at one node?'],
  sol: `def invert(root):\n    if root:\n        root.left, root.right = invert(root.right), invert(root.left)\n    return root`, big: 'O(n)', idea: 'Do your bit at one node, and recursion does the rest.',
  tests: [['tree_list(invert(tree([4, 2, 7])))', '[4, 7, 2]'], ['invert(None)', 'None'], ['tree_list(invert(tree([1, 2, None, 3])))', '[1, None, 2, None, 3]'], ['tree_list(invert(tree([1])))', '[1]']] },
{ id: 'tree-same', title: 'Same tree?', diff: 'Easy', time: 6,
  desc: `<p>Return True if two trees have the same shape and values.</p>`, ex: [['tree([1, 2]), tree([1, 2])', 'True'], ['tree([1, 2]), tree([1, None, 2])', 'False']], start: 'def same(a, b):\n    ',
  nudge: ['List the cases: both empty? One empty? Neither empty?'],
  sol: `def same(a, b):\n    if not a or not b:\n        return a is b\n    return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)`, big: 'O(n)', idea: 'Handle the empty cases first, then recurse in parallel.',
  tests: [['same(tree([1, 2]), tree([1, 2]))', 'True'], ['same(tree([1, 2]), tree([1, None, 2]))', 'False'], ['same(None, None)', 'True'], ['same(tree([1]), None)', 'False'], ['same(tree([1]), tree([2]))', 'False']] },
{ id: 'tree-levels', title: 'Level by level', diff: 'Medium', time: 12,
  desc: `<p>Return the values grouped by level, top to bottom, left to right.</p>`, ex: [['tree([3, 9, 20, None, None, 15, 7])', '[[3], [9, 20], [15, 7]]']], start: 'def levels(root):\n    ',
  nudge: ['At the moment you start a level, how do you know how many nodes are in it?'],
  sol: `from collections import deque\n\ndef levels(root):\n    out = []\n    q = deque([root] if root else [])\n    while q:\n        row = []\n        for _ in range(len(q)):\n            n = q.popleft()\n            row.append(n.val)\n            if n.left:\n                q.append(n.left)\n            if n.right:\n                q.append(n.right)\n        out.append(row)\n    return out`, big: 'O(n)', idea: 'The queue\'s length at the start of a round is exactly one level.',
  tests: [['levels(tree([3, 9, 20, None, None, 15, 7]))', '[[3], [9, 20], [15, 7]]'], ['levels(None)', '[]'], ['levels(tree([1]))', '[[1]]'], ['levels(tree([1, 2, None, 3]))', '[[1], [2], [3]]']] }
], extra: [
{ id: 'tree-path-sum', title: 'Path to a sum', diff: 'Easy', time: 8,
  desc: `<p>Return True if some root-to-leaf path has values that add up to <code>t</code>.</p>`, ex: [['tree([5, 4, 8, 11]), 20', 'True', '5 + 4 + 11']], start: 'def has_path(root, t):\n    ',
  nudge: ['Which information travels down the tree, and how does it change at each step?'],
  sol: `def has_path(root, t):\n    if not root:\n        return False\n    if not root.left and not root.right:\n        return t == root.val\n    return has_path(root.left, t - root.val) or has_path(root.right, t - root.val)`, big: 'O(n)', idea: 'Pass the remaining amount down.',
  tests: [['has_path(tree([5, 4, 8, 11]), 20)', 'True'], ['has_path(None, 0)', 'False'], ['has_path(tree([1, 2]), 1)', 'False'], ['has_path(tree([1]), 1)', 'True'], ['has_path(tree([1, 2, 3]), 4)', 'True']] }
], boss:
{ id: 'tree-diameter', title: 'Widest path', diff: 'Medium', time: 18,
  desc: `<p>The diameter is the number of <b>edges</b> on the longest path between any two nodes. It may not pass through the root.</p>`,
  ex: [['tree([1, 2, 3, 4, 5])', '3', '4 to 2 to 1 to 3']], start: 'def diameter(root):\n    ', nudge: [],
  sol: `def diameter(root):\n    best = 0\n    def h(n):\n        nonlocal best\n        if not n:\n            return 0\n        l, r = h(n.left), h(n.right)\n        best = max(best, l + r)\n        return 1 + max(l, r)\n    h(root)\n    return best`, big: 'O(n)', idea: 'Return one thing to your parent (height), and record another on the side (best path).',
  tests: [['diameter(tree([1, 2, 3, 4, 5]))', '3'], ['diameter(None)', '0'], ['diameter(tree([1]))', '0'], ['diameter(tree([1, 2]))', '1'], ['diameter(tree([1, 2, None, 3, 4, 5, None, None, 6, 7, None, None, 8]))', '6']] }
});

unit({ id: 'bst', phase: 2, title: 'Binary search trees', mins: 7, read: [
`<p class="lede">A tree with one rule: <b>everything to the left is smaller, everything to the right is larger</b>, at every node. Now each step throws away a whole side. It's binary search, in the shape of a tree.</p>`,
steps([
  { n: 'Looking for 6. At 8: smaller, go left.', d: D.tree(T1, { x: 300, y: 26, spread: 120, dy: 56, hl: { 8: 'y' } }) },
  { n: 'At 3: larger, go right. Node 10 and everything under it was never visited.', d: D.tree(T1, { x: 300, y: 26, spread: 120, dy: 56, hl: { 8: 'g', 3: 'y' } }) },
  { n: 'Found it. If the tree is balanced, the steps are about log n.', d: D.tree(T1, { x: 300, y: 26, spread: 120, dy: 56, hl: { 8: 'g', 3: 'g', 6: 'y' } }) }
], 200),
`<h2>Things to notice</h2><ul>
<li>An inorder walk (left, me, right) visits values in <b>sorted order</b>. Remember that fact, because it solves a lot of problems.</li>
<li>The rule is about the <b>whole</b> side, not just the direct child. A node deep on the left must be smaller than every ancestor where you went left.</li>
<li>If you insert already sorted values, the tree becomes one long chain and everything is O(n). Real systems use self-balancing trees, and database indexes use a wide cousin called a B-tree.</li></ul>`,
fig(D.flow({ a: [40, 20, 280, 50, 'Balanced: about log n steps', 'g'], b: [400, 20, 280, 50, 'Chain: n steps, as bad as a list', 'r'] }), 90),
think('Checking only <code>left.val &lt; node.val &lt; right.val</code> at each node is not enough. Can you sketch a tree that passes that test but breaks the rule?', 'Root 5, right child 8, and 8\'s left child is 3. Each local check passes, but 3 is on the right of 5. The allowed range has to travel down from the ancestors.')
], core: [
{ id: 'bst-search', title: 'Find in a BST', diff: 'Easy', time: 5,
  desc: `<p>Return the node with value <code>v</code>, or None. Visit only the nodes you need.</p>`, ex: [['tree([4, 2, 7, 1, 3]), 2', 'the node with value 2']], start: 'def find_node(root, v):\n    ',
  nudge: ['At each node, how many directions could the answer be in?'],
  sol: `def find_node(root, v):\n    while root and root.val != v:\n        root = root.left if v < root.val else root.right\n    return root`, big: 'O(height)', idea: 'One comparison discards a whole side.',
  tests: [['find_node(tree([4, 2, 7, 1, 3]), 2).val', '2'], ['find_node(tree([4, 2, 7]), 5)', 'None'], ['find_node(None, 1)', 'None'], ['find_node(tree([4, 2, 7]), 7).val', '7']] },
{ id: 'bst-kth', title: 'Kth smallest', diff: 'Medium', time: 10,
  desc: `<p>Return the kth smallest value in a BST (k starts at 1).</p>`, ex: [['tree([3, 1, 4, None, 2]), 1', '1']], start: 'def kth(root, k):\n    ',
  nudge: ['Which walk visits a BST in sorted order?'],
  sol: `def kth(root, k):\n    stack = []\n    while True:\n        while root:\n            stack.append(root)\n            root = root.left\n        root = stack.pop()\n        k -= 1\n        if k == 0:\n            return root.val\n        root = root.right`, big: 'O(height + k)', idea: 'Inorder is sorted order. Stop as soon as you have enough.',
  tests: [['kth(tree([3, 1, 4, None, 2]), 1)', '1'], ['kth(tree([5, 3, 6, 2, 4, None, None, 1]), 3)', '3'], ['kth(tree([1]), 1)', '1'], ['kth(tree([3, 1, 4, None, 2]), 4)', '4']] }
], boss:
{ id: 'bst-valid', title: 'Is it really a BST?', diff: 'Medium', time: 14,
  desc: `<p>Return True if the tree follows the BST rule strictly: all left values less, all right values more, at every node.</p>`, ex: [['tree([2, 1, 3])', 'True'], ['tree([5, 1, 8, None, None, 3, 9])', 'False', '3 is right of 5']], start: 'def valid(root):\n    ', nudge: [],
  sol: `def valid(root, lo=None, hi=None):\n    if not root:\n        return True\n    if (lo is not None and root.val <= lo) or (hi is not None and root.val >= hi):\n        return False\n    return valid(root.left, lo, root.val) and valid(root.right, root.val, hi)`, big: 'O(n)', idea: 'Allowed range travels down the tree, narrowing as it goes.',
  tests: [['valid(tree([2, 1, 3]))', 'True'], ['valid(tree([5, 1, 8, None, None, 3, 9]))', 'False'], ['valid(None)', 'True'], ['valid(tree([1, 1]))', 'False'], ['valid(tree([2, 2, 3]))', 'False'], ['valid(tree([5, 3, 8, 1, 4, 6, 9]))', 'True'], ['valid(tree([0, None, -1]))', 'False']] }
});

unit({ id: 'heaps', phase: 2, title: 'Heaps', mins: 8, read: [
`<p class="lede">A heap is a to-do pile that always knows its most urgent item, and doesn't care about the order of the rest. That's why it's so cheap to keep up.</p>`,
fig(D.tree([1, [3, [7], [9]], [2, [8], [5]]], { x: 240, y: 26, spread: 110, dy: 58, hl: { 1: 'y' } }) + D.t(470, 50, 'One rule: every parent is', {}) + D.t(470, 74, 'smaller than its children.', {}) + D.t(470, 120, 'Smallest is always on top.', { cls: 'r' }) + D.t(470, 160, '7 and 2 are not compared.', { cls: 'soft' }), 195),
`<table><tr><th>Action</th><th>Cost</th><th>Picture</th></tr><tr><td>See the smallest</td><td>O(1)</td><td>It's at the top</td></tr><tr><td>Add an item</td><td>O(log n)</td><td>Goes at the bottom, bubbles up</td></tr><tr><td>Remove the smallest</td><td>O(log n)</td><td>Last item moves to the top, sinks down</td></tr></table>`,
`<pre><code>import heapq
h = []
heapq.heappush(h, 5)
heapq.heappop(h)            # smallest
h[0]                        # peek
heapq.heappush(h, (2, "b")) # tuples compare by their first part: priority, then item
heapq.heappush(h, -x)       # no max-heap in Python, so store negatives</code></pre>`,
`<h2>The "top k" trick</h2><p>To keep the <b>k largest</b> of a million numbers: keep a small heap of size k. New number bigger than the smallest of your k? Swap it in. You only ever spend log k per item. And the smallest of the k largest sits on top, ready to compare.</p>`,
fig(D.flow({ a: [20, 25, 150, 50, 'a stream of n'], b: [260, 12, 180, 76, 'min-heap\nkeeps the best k', 'y'], c: [530, 25, 170, 50, 'kicked out'] }, [['a', 'b'], ['b', 'c']]) + D.t(350, 112, 'O(n log k), and it never holds more than k items', { a: 'middle', cls: 'r' }), 125),
`<h2>Merging many sorted streams</h2><p>Put the front of each stream in a heap. Always take the smallest, and refill from that stream. Log files, database merges and search engines all do this.</p>`,
think('You want the k <b>largest</b>. Why a <b>min</b>-heap?', 'You need quick access to the weakest of the current top k, since that is the one a new number has to beat.')
], core: [
{ id: 'heap-kth', title: 'Kth largest in a stream', diff: 'Easy', time: 10,
  desc: `<p>Class <code>Kth(k, nums)</code>. <code>add(x)</code> adds a number and returns the current kth largest overall. There are always at least k numbers after any add.</p>`, ex: [['Kth(3, [4, 5, 8, 2]); add(3), add(5), add(10)', '4, 5, 5']], start: 'class Kth:\n    ',
  nudge: ['What do you need to keep? What do you never need again?'],
  sol: `import heapq\n\nclass Kth:\n    def __init__(self, k, nums):\n        self.k = k\n        self.h = []\n        for x in nums:\n            self.add(x)\n\n    def add(self, x):\n        heapq.heappush(self.h, x)\n        if len(self.h) > self.k:\n            heapq.heappop(self.h)\n        return self.h[0]`, big: 'O(log k) per add', idea: 'A small min-heap of the best k.',
  tests: [['[K.add(x) for x in [3, 5, 10]]', '[4, 5, 5]', 'K = Kth(3, [4, 5, 8, 2])'], ['K.add(1)', '1', 'K = Kth(1, [])'], ['K.add(2)', '1', 'K = Kth(2, [1])'], ['[K.add(i) for i in range(100000)][-1]', '99000', 'K = Kth(1000, [])']] },
{ id: 'heap-closest', title: 'Closest points', diff: 'Medium', time: 12,
  desc: `<p>Return the <code>k</code> points closest to the origin (0, 0), in order, nearest first. On a tie, smaller x comes first. Points are lists like <code>[1, 2]</code>.</p>`, ex: [['[[3, 3], [1, 1], [5, -1]], 2', '[[1, 1], [3, 3]]']], start: 'def closest(points, k):\n    ',
  nudge: ['What should you compare by? Do you need the actual square root?'],
  sol: `import heapq\n\ndef closest(points, k):\n    return heapq.nsmallest(k, points, key=lambda p: (p[0] * p[0] + p[1] * p[1], p[0]))`, big: 'O(n log k)', idea: 'Compare squared distances. Roots add nothing and lose precision.',
  tests: [['closest([[3, 3], [1, 1], [5, -1]], 2)', '[[1, 1], [3, 3]]'], ['closest([[1, 0]], 1)', '[[1, 0]]'], ['closest([[0, 1], [1, 0]], 1)', '[[0, 1]]'], ['closest([[2, 2], [-2, 2], [0, 0]], 3)', '[[0, 0], [-2, 2], [2, 2]]']] }
], extra: [{
  id: 'heap-merge', title: 'Merge k sorted lists', diff: 'Medium', time: 14,
  desc: `<p>Merge many sorted lists into one sorted list. With n items across k lists it should take O(n log k). Don't just concatenate and sort.</p>`, ex: [['[[1, 4], [2], [0, 9]]', '[0, 1, 2, 4, 9]']], start: 'def merge_k(lists):\n    ',
  nudge: ['At any moment, only one item from each list could be next. Which structure picks the smallest of k?'],
  sol: `import heapq\n\ndef merge_k(lists):\n    h = [(a[0], i, 0) for i, a in enumerate(lists) if a]\n    heapq.heapify(h)\n    out = []\n    while h:\n        v, i, j = heapq.heappop(h)\n        out.append(v)\n        if j + 1 < len(lists[i]):\n            heapq.heappush(h, (lists[i][j + 1], i, j + 1))\n    return out`, big: 'O(n log k)', idea: 'The heap holds one front from each list.',
  tests: [['merge_k([[1, 4], [2], [0, 9]])', '[0, 1, 2, 4, 9]'], ['merge_k([])', '[]'], ['merge_k([[], []])', '[]'], ['merge_k([[1, 1], [1]])', '[1, 1, 1]']] }
], boss:
{ id: 'heap-median', title: 'Running median', diff: 'Hard', time: 25,
  desc: `<p>Class <code>Median</code>: <code>add(x)</code> takes a number, <code>get()</code> returns the median so far (for an even count, the mean of the two middle values, as a float). Tests add 100,000 numbers, calling get after each.</p>`, ex: [['add(1), get(), add(3), get(), add(2), get()', '1.0, 2.0, 2.0']], start: 'class Median:\n    ', nudge: [],
  sol: `import heapq\n\nclass Median:\n    def __init__(self):\n        self.low = []   # max-heap, stored as negatives\n        self.high = []  # min-heap\n\n    def add(self, x):\n        heapq.heappush(self.low, -x)\n        heapq.heappush(self.high, -heapq.heappop(self.low))\n        if len(self.high) > len(self.low):\n            heapq.heappush(self.low, -heapq.heappop(self.high))\n\n    def get(self):\n        if len(self.low) > len(self.high):\n            return float(-self.low[0])\n        return (-self.low[0] + self.high[0]) / 2`, big: 'O(log n) add, O(1) get', idea: 'Two piles split at the middle: the top of each is all you need.',
  tests: [['[(m.add(x), m.get())[1] for x in [1, 3, 2]]', '[1.0, 2.0, 2.0]', 'm = Median()'], ['(m.add(5), m.get())[1]', '5.0', 'm = Median()'], ['[(m.add(x), m.get())[1] for x in [5, 5, 5, 5]]', '[5.0, 5.0, 5.0, 5.0]', 'm = Median()'], ['[(m.add(x), m.get())[1] for x in [-1, -2]]', '[-1.0, -1.5]', 'm = Median()'], ['[(m.add(i), m.get())[1] for i in range(100000)][-1]', '49999.5', 'm = Median()']] }
});

unit({ id: 'tries', phase: 2, title: 'Tries', mins: 6, read: [
`<p class="lede">A trie stores words letter by letter, so words with the same start share the same path. <b>It's why autocomplete can feel instant.</b> You spend memory, and the lookup depends on the word's length, not on how many words there are.</p>`,
fig(D.graph({ r: [320, 22, ''], c: [190, 84, 'c'], d: [450, 84, 'd'], a: [120, 146, 'a'], o: [260, 146, 'o'], g: [450, 146, 'o'], t: [60, 192, 't'], r2: [170, 192, 'r'], w: [260, 192, 'w'], g2: [450, 192, 'g'] }, [['r', 'c'], ['r', 'd'], ['c', 'a'], ['c', 'o'], ['d', 'g'], ['a', 't'], ['a', 'r2'], ['o', 'w'], ['g', 'g2']], { hl: { t: 'g', r2: 'g', w: 'g', g2: 'g' }, r: 18 }) + D.t(520, 60, 'cat, car, cow, dog', { cls: 'soft' }) + D.t(520, 90, 'green: a word ends here', { cls: 'g' }), 215),
`<h2>Sketch before you build</h2><p>Each node needs two things: where each letter goes next, and whether a word ends here. "car" being stored doesn't make "ca" a word, which is why the flag is needed.</p><p>In Python, nested dictionaries are enough. What does one node look like as a dictionary? What's the first thing you look up when you add "car"? Work out the code from the drawing.</p>
<h2>When to reach for one</h2><ul><li>Prefix questions: "any words starting with..."</li><li>Autocomplete and spell checking.</li><li>Walking a grid of letters while checking which paths are still alive. A trie cuts off dead ends immediately.</li></ul>`,
think('A set of words already gives you O(1) "is this exact word there?" What can a trie do that a set can\'t do cheaply?', 'Prefix questions. A set must check every word for "starts with ca", while a trie just walks c-a.')
], core: [
{ id: 'trie-basic', title: 'Build a trie', diff: 'Medium', time: 14,
  desc: `<p>Class <code>Trie</code>: <code>insert(word)</code>, <code>search(word)</code> (exact word stored?), <code>starts_with(prefix)</code> (any stored word begins with it?).</p>`, ex: [['insert("car"); search("ca"); starts_with("ca")', 'False, True']], start: 'class Trie:\n    ',
  nudge: ['What does a single node hold? Draw it first.', 'Both search and starts_with walk down. What differs at the end?'],
  sol: `class Trie:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n        n = self.root\n        for c in word:\n            n = n.setdefault(c, {})\n        n["$"] = True\n\n    def _walk(self, s):\n        n = self.root\n        for c in s:\n            if c not in n:\n                return None\n            n = n[c]\n        return n\n\n    def search(self, word):\n        n = self._walk(word)\n        return bool(n) and "$" in n\n\n    def starts_with(self, prefix):\n        return self._walk(prefix) is not None`, big: 'O(word length) per action', idea: 'A path of dictionaries, with a marker where words end.',
  tests: [['(t.search("ca"), t.starts_with("ca"), t.search("car"))', '(False, True, True)', 't = Trie()\nt.insert("car")'], ['t.search("a")', 'False', 't = Trie()'], ['t.starts_with("")', 'True', 't = Trie()\nt.insert("a")'], ['t.search("cat")', 'False', 't = Trie()\nt.insert("car")'], ['t.search("car") and t.search("card")', 'True', 't = Trie()\nt.insert("card")\nt.insert("car")'], ['t.search("cars")', 'False', 't = Trie()\nt.insert("car")']] }
], boss:
{ id: 'trie-autocomplete', title: 'Autocomplete', diff: 'Medium', time: 18,
  desc: `<p>Class <code>Auto(words)</code>. <code>suggest(prefix)</code> returns up to 3 stored words beginning with <code>prefix</code>, in alphabetical order, without looping over all the words on every call. Tests run 100,000 suggests on 100,000 words.</p>`, ex: [['Auto(["cat", "car", "cab", "cow", "dog"]).suggest("ca")', '["cab", "car", "cat"]']], start: 'class Auto:\n    ', nudge: [],
  sol: `class Auto:\n    def __init__(self, words):\n        self.root = {}\n        for w in sorted(set(words)):\n            n = self.root\n            for c in w:\n                n = n.setdefault(c, {"#": []})\n                if len(n["#"]) < 3:\n                    n["#"].append(w)\n\n    def suggest(self, prefix):\n        n = self.root\n        for c in prefix:\n            if c not in n:\n                return []\n            n = n[c]\n        return n.get("#", [])[:3]`, big: 'O(prefix length) per suggest', idea: 'Do the work up front: each node stores its top 3, added in sorted order.',
  tests: [['Auto(["cat", "car", "cab", "cow", "dog"]).suggest("ca")', '["cab", "car", "cat"]'], ['Auto(["a"]).suggest("b")', '[]'], ['Auto(["a", "a"]).suggest("a")', '["a"]'], ['Auto(["ab", "a"]).suggest("a")', '["a", "ab"]'], ['all(A.suggest("w1") == ["w1", "w10", "w100"] for _ in range(100000))', 'True', 'A = Auto(["w" + str(i) for i in range(100000)])']] }
});
