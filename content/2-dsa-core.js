// Phase 1: Core patterns. Lessons teach the general shape with pictures. No code templates: writing the code is your job.

unit({ id: 'big-o', phase: 1, title: 'How work grows', mins: 10, read: [
`<p class="lede">Forget formulas for a moment. Ask one question: <b>if the input gets 10 times bigger, how much more work is there?</b> That answer is what Big-O describes.</p>`,
fig(D.plot({ x: 60, y: 14, w: 400, h: 200, xr: [0, 10], yr: [0, 30], xlab: 'input size', ylab: 'work',
  curve: Array.from({ length: 41 }, (_, i) => [i / 4, i / 4]) }) +
  `<path class="sk r" d="M${Array.from({ length: 23 }, (_, i) => { const x = i / 4; return `${60 + x * 40} ${214 - Math.min(30, x * x) / 30 * 200}`; }).join(' L')}"/>` +
  `<path class="sk g" d="M${Array.from({ length: 41 }, (_, i) => { const x = i / 4; return `${60 + x * 40} ${214 - Math.log2(1 + x) * 2 / 30 * 200}`; }).join(' L')}"/>` +
  D.t(275, 28, 'O(n²): nested loops', { cls: 'r' }) + D.t(475, 145, 'O(n): one loop', { cls: 'b' }) + D.t(475, 192, 'O(log n): halving', { cls: 'g' }), 250),
`<table><tr><th>Name</th><th>10× the input means</th><th>Where you see it</th></tr>
<tr><td>O(1)</td><td>same work</td><td>dict lookup, <code>a[i]</code>, <code>a.append</code></td></tr>
<tr><td>O(log n)</td><td>a few more steps</td><td>cutting the search in half each step</td></tr>
<tr><td>O(n)</td><td>10× the work</td><td>one pass over the data</td></tr>
<tr><td>O(n log n)</td><td>a bit over 10×</td><td>sorting</td></tr>
<tr><td>O(n²)</td><td>100× the work</td><td>every pair</td></tr>
<tr><td>O(2ⁿ)</td><td>impossibly more</td><td>every subset</td></tr></table>
<h2>Reading it from code</h2><p>Loops one after another <b>add</b>. Loops inside each other <b>multiply</b>. Drop constants, because 3n and n grow the same way. And watch for hidden loops: <code>x in a_list</code>, <code>a.insert(0, x)</code>, <code>a.pop(0)</code>, slicing and <code>sorted</code> all cost more than they look.</p>
<h2>Working backwards from the limits</h2><p>A computer does roughly 10⁸ simple steps per second, and Python is slower than that. So the input size tells you what kind of answer is expected before you start thinking.</p>
<table><tr><th>n up to</th><th>You can afford</th></tr><tr><td>20</td><td>O(2ⁿ): try everything</td></tr><tr><td>1,000</td><td>O(n²)</td></tr><tr><td>100,000</td><td>O(n log n) or O(n)</td></tr><tr><td>10⁹</td><td>O(log n), or a formula</td></tr></table>
<h2>Memory counts too</h2><p>Most speed-ups in this phase spend memory to save time. A set of n items costs O(n) space, which is usually a good deal.</p>`,
think('<code>for x in a: if x in b: ...</code> where both are lists of length n. What is the cost? What about if <code>b</code> is made a set first?', 'O(n²) with a list, because <code>in</code> is a hidden loop. O(n) with a set, once you have spent O(n) on building it.')
], core: [
{ id: 'cost-duplicates', title: 'Too slow on purpose', diff: 'Easy', time: 8,
  desc: `<p>The starter works but takes about n² steps, so it runs out of time on large inputs. Find the hidden loop and make it fast. Return True if any value appears more than once.</p>`,
  ex: [['[1, 2, 1]', 'True'], ['[1, 2, 3]', 'False']],
  start: `def has_dupe(a):\n    seen = []\n    for x in a:\n        if x in seen:\n            return True\n        seen.append(x)\n    return False\n`,
  nudge: ['Which line looks like one step but is actually a loop?'],
  sol: `def has_dupe(a):\n    seen = set()\n    for x in a:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False`, big: 'O(n) time, O(n) space', idea: 'Same logic with a better container. Know what your operations cost.',
  tests: [['has_dupe([1, 2, 1])', 'True'], ['has_dupe([1, 2, 3])', 'False'], ['has_dupe([])', 'False'], ['has_dupe(list(range(300000)))', 'False'], ['has_dupe(list(range(300000)) + [5])', 'True']] },
'min-max-two'
], extra: ['frequent-days'], boss:
{ id: 'cost-front', title: 'The slow queue', diff: 'Easy', time: 10,
  desc: `<p><code>drain(n)</code> fills a queue with 0 to n-1, then takes items off the front one at a time and returns their sum. The starter uses <code>list.pop(0)</code> and is too slow at n = 300,000. Keep the first-in, first-out behaviour but make it fast.</p>`,
  ex: [['4', '6']],
  start: `def drain(n):\n    q = list(range(n))\n    total = 0\n    while q:\n        total += q.pop(0)\n    return total\n`, nudge: [],
  sol: `from collections import deque\n\ndef drain(n):\n    q = deque(range(n))\n    total = 0\n    while q:\n        total += q.popleft()\n    return total`, big: 'O(n)', idea: 'pop(0) moves everything. A deque removes from either end in O(1).',
  tests: [['drain(4)', '6'], ['drain(0)', '0'], ['drain(1)', '0'], ['drain(800000)', '319999600000']] }
});

unit({ id: 'hashing', phase: 1, title: 'Hashing: remember what you saw', mins: 9, read: [
`<p class="lede">Many slow solutions search for something over and over. The big idea: <b>as you walk past each item, write it down somewhere you can check instantly.</b> Then the past becomes a single lookup.</p>`,
steps([
  { n: 'Slow way: for each item, look back at everything before it. Most of those comparisons were already done on earlier steps.', d: D.cells(['a', 'c', 'b', 'd', 'c'], { x: 60, y: 40, hl: { 4: 'y', 0: 'r', 1: 'r', 2: 'r', 3: 'r' }, ptr: { 'now': 4 } }) + D.t(360, 66, 'looking back: n² in total', { cls: 'r' }) },
  { n: 'Fast way: keep a notepad. At each item, ask the notepad, then add to it.', d: D.cells(['a', 'c', 'b', 'd', 'c'], { x: 60, y: 40, hl: { 0: 'y' }, ptr: { 'now': 0 } }) + D.flow({ s: [360, 40, 300, 46, 'notepad: { a }', 'g'] }) },
  { n: 'Each step asks one question with one look, and adds one note.', d: D.cells(['a', 'c', 'b', 'd', 'c'], { x: 60, y: 40, hl: { 2: 'y' }, ptr: { 'now': 2 } }) + D.flow({ s: [360, 40, 300, 46, 'notepad: { a, c, b }', 'g'] }) },
  { n: 'The notepad answers immediately. One pass, n steps, and you only paid some memory.', d: D.cells(['a', 'c', 'b', 'd', 'c'], { x: 60, y: 40, hl: { 4: 'g' }, ptr: { 'now': 4 } }) + D.flow({ s: [360, 40, 300, 46, 'notepad: { a, c, b, d }  c is here!', 'g'] }) }
], 130),
`<h2>Three things a notepad can hold</h2>
<table><tr><th>Notepad</th><th>The question it answers</th></tr>
<tr><td>Set of items</td><td>Have I seen this?</td></tr>
<tr><td>Item to count</td><td>How many of these so far?</td></tr>
<tr><td>Item to position</td><td>Where did I see this?</td></tr>
<tr><td>Signature to group</td><td>What else looks like this?</td></tr></table>
<h2>The trick: turn the question around</h2><p>Don't ask "which earlier item works with this one?" as a search. Ask "<b>what exact value would I need?</b>" Once you can name it, you can look it up.</p>
<h2>Signatures</h2><p>If several items count as "the same" under some rule, invent a key that comes out identical for all of them. Then the dictionary does the grouping for you.</p>`,
think('You want to know whether two things are "equal under some rule". What would you look for in a key?', 'A value that comes out the same for all items that count as equal, and different otherwise. Finding that key often is the whole problem.')
], core: ['two-sum', 'valid-anagram', 'group-anagrams'], extra: ['majority-element', 'top-k-frequent'], boss: 'longest-consecutive' });

unit({ id: 'prefix', phase: 1, title: 'Prefix sums', mins: 8, read: [
`<p class="lede">Imagine a car's odometer. You don't add up every trip to find how far you drove this week. You subtract last week's reading from today's. <b>Running totals turn any range into one subtraction.</b></p>`,
steps([
  { n: 'Here is a row of daily distances. How far from day 2 to day 4? You could add them up each time.', d: D.cells([3, 1, 4, 1, 5, 9], { x: 120, y: 30, idx: true, hl: { 2: 'y', 3: 'y', 4: 'y' } }) },
  { n: 'Instead, build the running total, starting from 0. Each box holds "the sum of everything before this position".', d: D.cells([3, 1, 4, 1, 5, 9], { x: 120, y: 30, idx: true }) + D.cells([0, 3, 4, 8, 9, 14, 23], { x: 96, y: 110, hl: {} , label: '' }) + D.t(20, 138, 'totals', { cls: 'soft' }) },
  { n: 'A range sum is now two looks and a subtraction: 14 − 4 = 10. It\'s the same for any range, however long.', d: D.cells([3, 1, 4, 1, 5, 9], { x: 120, y: 30, idx: true, hl: { 2: 'y', 3: 'y', 4: 'y' } }) + D.cells([0, 3, 4, 8, 9, 14, 23], { x: 96, y: 110, hl: { 2: 'b', 5: 'b' } }) + D.t(20, 138, 'totals', { cls: 'soft' }) + D.t(460, 195, '14 − 4 = 10', { cls: 'r', size: 22 }) }
], 210),
`<h2>Combining with hashing</h2><p>Here's a question with more power: "does some stretch ending here sum to k?" Look at the odometer picture. A stretch ending now with sum k means an earlier reading of exactly <code>now − k</code>. That's a value you can name, so you know what to do with it.</p>
<h2>It isn't only sums</h2><p>The pattern works for anything you can "undo", like XOR or counts. Sometimes you scan from both sides: everything left of here, and everything right of here. Then you combine them. Picture two sweeps of the row, one each way.</p>`,
fig(D.cells([2, 3, 4, 5], { x: 240, y: 50, hl: { 2: 'y' } }) + D.arrow(236, 30, 340, 30, 'b') + D.t(240, 22, 'left sweep', { cls: 'b' }) + D.arrow(434, 112, 386, 112, 'r') + D.t(392, 132, 'right sweep', { cls: 'r' }), 145, 'For each position you can know "everything before" and "everything after" in O(1) if you prepared them in two passes.'),
think('Why start the running total with an extra 0 at the front?', 'So a range starting at the very first item still has a reading to subtract. Without it, you need a special case for every range that begins at position 0.')
], core: [
{ id: 'range-sum', title: 'Fast range sums', diff: 'Easy', time: 8,
  desc: `<p>Write class <code>Ranges</code>. <code>Ranges(nums)</code> takes a list. <code>total(l, r)</code> returns the sum of positions <code>l</code> to <code>r</code> inclusive. Each <code>total</code> call must not loop over the range: tests make 200,000 calls on a list of 100,000.</p>`,
  ex: [['Ranges([3, 1, 4]).total(1, 2)', '5']], start: 'class Ranges:\n    ',
  nudge: ['What could you prepare once, up front, so every question is quick?'],
  sol: `class Ranges:\n    def __init__(self, nums):\n        self.p = [0]\n        for x in nums:\n            self.p.append(self.p[-1] + x)\n\n    def total(self, l, r):\n        return self.p[r + 1] - self.p[l]`, big: 'O(n) to prepare, O(1) per query', idea: 'Do the work once, up front. Each query is one subtraction.',
  tests: [['Ranges([3, 1, 4]).total(1, 2)', '5'], ['Ranges([3, 1, 4]).total(0, 0)', '3'], ['Ranges([3, 1, 4]).total(0, 2)', '8'], ['all(R.total(0, 99999) == 100000 for _ in range(200000))', 'True', 'R = Ranges([1] * 100000)']] },
'product-except-self'
], boss: 'subarray-sum-k' });

unit({ id: 'two-pointers', phase: 1, title: 'Two pointers', mins: 8, read: [
`<p class="lede">Two fingers on a row of boxes, each moving in one direction only. Neither finger ever goes back, so the total movement is at most 2n. <b>That's why it's fast.</b></p>`,
steps([
  { n: 'Fingers at both ends of a <b>sorted</b> row. We want a pair with a particular total. Here that is 11.', d: D.cells([1, 3, 4, 6, 9, 12], { x: 180, y: 30, ptr: { L: 0, R: 5 } }) + D.t(40, 60, 'want 11', { cls: 'r' }) + D.t(500, 60, '1 + 12 = 13', {}) },
  { n: '13 is too big. Moving L up could only make it bigger, so R must come down. That single argument rules out <b>every</b> pair using 12. You just skipped a whole row of work.', d: D.cells([1, 3, 4, 6, 9, 12], { x: 180, y: 30, dim: [5], ptr: { L: 0, R: 4 } }) + D.t(40, 60, 'want 11', { cls: 'r' }) + D.t(500, 60, '1 + 9 = 10', {}) },
  { n: '10 is too small. Moving R down could only make it smaller, so L must go up. Every pair using 1 is ruled out.', d: D.cells([1, 3, 4, 6, 9, 12], { x: 180, y: 30, dim: [0, 5], ptr: { L: 1, R: 4 } }) + D.t(40, 60, 'want 11', { cls: 'r' }) + D.t(500, 60, '3 + 9 = 12', {}) },
  { n: 'Too big, so R comes down. Each step rules out a row or column of pairs, and we never look at them.', d: D.cells([1, 3, 4, 6, 9, 12], { x: 180, y: 30, dim: [0, 4, 5], ptr: { L: 1, R: 3 } }) + D.t(40, 60, 'want 11', { cls: 'r' }) + D.t(500, 60, '3 + 6 = 9', {}) },
  { n: 'Too small, so L goes up. 4 + 6 = 10, still too small. Then L meets R and we stop: no pair makes 11. Six items, a handful of moves, no nested loop.', d: D.cells([1, 3, 4, 6, 9, 12], { x: 180, y: 30, dim: [0, 1, 4, 5], ptr: { L: 2, R: 3 } }) + D.t(40, 60, 'want 11', { cls: 'r' }) + D.t(500, 60, '4 + 6 = 10', {}) }
], 130),
`<h2>Two shapes</h2>`,
fig(D.cells([1, 2, 3, 4, 5], { x: 40, y: 30, w: 44, ptr: { L: 0, R: 4 } }) + D.t(40, 22, 'toward each other', { cls: 'soft' }) + D.cells([1, 1, 2, 3, 3], { x: 400, y: 30, w: 44, ptr: { slow: 1, fast: 3 } }) + D.t(400, 22, 'same direction: slow marks the kept part', { cls: 'soft' }), 120),
`<h2>Why you must be able to justify each move</h2><p>The pattern isn't "move a pointer and hope". Every move needs a reason why the discarded options can't be the answer. If you can't say that sentence, the pointer move is probably wrong. Write the reason in your steps.</p>`,
think('Slow and fast both start at 0, moving the same way. What does the region before <code>slow</code> mean?', 'It is the finished part: items you have decided to keep. Fast scans for the next keeper. You rewrite in place without extra memory.')
], core: ['valid-palindrome', 'move-zeroes', 'two-sum-sorted', 'three-sum'], extra: ['valid-palindrome-ii', 'sort-colors', 'rotate-array', 'trapping-rain'], boss: 'container-water' });

unit({ id: 'sliding-window', phase: 1, title: 'Sliding window', mins: 9, read: [
`<p class="lede">A caterpillar crawling along the row: its head stretches forward, its tail catches up. It's for questions about <b>contiguous stretches</b>, like the longest or shortest stretch with some property.</p>`,
steps([
  { n: 'Every stretch has a start and an end, so there are about n² of them. Rebuilding each one from scratch is what we want to avoid.', d: D.cells(['a', 'b', 'c', 'a', 'b', 'd'], { x: 150, y: 30 }) + D.t(150, 110, 'Want: the longest stretch with no repeated letter', { cls: 'r' }) },
  { n: 'Head moves right, one at a time. The window grows, and we update what we know about it with one small change.', d: D.cells(['a', 'b', 'c', 'a', 'b', 'd'], { x: 150, y: 30, hl: { 0: 'g', 1: 'g', 2: 'g' }, ptr: { tail: 0, head: 2 } }) + D.t(470, 60, 'holds: a b c', {}) },
  { n: 'Head takes in another <code>a</code>. The window is now broken, because it has two of them.', d: D.cells(['a', 'b', 'c', 'a', 'b', 'd'], { x: 150, y: 30, hl: { 0: 'r', 1: 'r', 2: 'r', 3: 'r' }, ptr: { tail: 0, head: 3 } }) + D.t(470, 60, 'two a! broken', { cls: 'r' }) },
  { n: 'Tail moves up until the window is valid again. Nothing inside needs to be recounted. We just take out what the tail left behind.', d: D.cells(['a', 'b', 'c', 'a', 'b', 'd'], { x: 150, y: 30, dim: [0], hl: { 1: 'g', 2: 'g', 3: 'g' }, ptr: { tail: 1, head: 3 } }) + D.t(470, 60, 'holds: b c a', {}) },
  { n: 'Head moved n times in total, and tail moved at most n times in total. So that is O(n), even though there is a loop inside a loop. Count total moves, not nesting.', d: D.cells(['a', 'b', 'c', 'a', 'b', 'd'], { x: 150, y: 30, dim: [0, 1, 2], hl: { 3: 'g', 4: 'g', 5: 'g' }, ptr: { tail: 3, head: 5 } }) + D.t(470, 60, 'n + n moves', { cls: 'g' }) }
], 130),
`<h2>Questions to ask yourself</h2><ol>
<li>What do I need to know about the window? A sum, a count, a dictionary of letters?</li>
<li>When the head adds an item, how does that knowledge change in one step?</li>
<li>When is the window broken, and what does the tail removing an item change?</li>
<li>When do I record the answer: while it's valid, or the moment it's broken?</li></ol>
<h2>When it won't work</h2><p>Shrinking must reliably help. With negative numbers, a longer window can have a smaller sum, so "too big, shrink" is no longer true. That's when you go back to prefix sums.</p>
<h2>Fixed width</h2><p>Sometimes the width is given. Then the window just slides, with one item in and one item out per step.</p>`,
think('You want the shortest stretch with sum at least S, all numbers positive. When do you record the answer: while growing, or while shrinking?', 'While shrinking. Each time it is still valid, it is the best so far for this head position, so record and shrink again.')
], core: ['best-time-stock', 'longest-substring', 'min-subarray-len'], extra: ['char-replacement', 'find-anagrams'], boss: 'min-window' });

unit({ id: 'sorting', phase: 1, title: 'Sorting and merging', mins: 10, read: [
`<p class="lede">You'll rarely write a sort at work, because <code>sorted()</code> is excellent. But the ideas inside sorting, especially <b>divide and conquer</b>, show up everywhere. And often the best first step on a hard problem is "what if this were sorted?"</p>`,
fig(D.cells([5, 2, 8, 1], { x: 250, y: 6, w: 50, h: 34 }) + D.cells([5, 2], { x: 120, y: 62, w: 50, h: 34 }) + D.cells([8, 1], { x: 400, y: 62, w: 50, h: 34 }) + D.line(290, 40, 170, 62) + D.line(390, 40, 425, 62) +
  D.cells([2, 5], { x: 120, y: 122, w: 50, h: 34, hl: { 0: 'g', 1: 'g' } }) + D.cells([1, 8], { x: 400, y: 122, w: 50, h: 34, hl: { 0: 'g', 1: 'g' } }) + D.cells([1, 2, 5, 8], { x: 250, y: 182, w: 50, h: 34, hl: { 0: 'y', 1: 'y', 2: 'y', 3: 'y' } }) + D.line(170, 156, 290, 182) + D.line(425, 156, 390, 182) + D.t(560, 28, 'split in half', { cls: 'soft' }) + D.t(560, 145, 'sort each half', { cls: 'soft' }) + D.t(560, 205, 'merge', { cls: 'r' }), 225, 'Merge sort: halve it about log n times. Each level does n work merging. That gives O(n log n).'),
`<h2>Merging: the part worth owning</h2>`,
steps([
  { n: 'Two sorted rows. The smallest item overall has to be at the front of one of them.', d: D.cells([2, 5, 9], { x: 80, y: 20, ptr: {}, hl: { 0: 'y' } }) + D.cells([1, 8], { x: 80, y: 80, hl: { 0: 'y' } }) + D.t(320, 50, 'output: (empty)', {}) },
  { n: 'Compare just the two fronts. Take the smaller, and move that row\'s front along.', d: D.cells([2, 5, 9], { x: 80, y: 20, hl: { 0: 'y' } }) + D.cells([1, 8], { x: 80, y: 80, dim: [0], hl: { 1: 'y' } }) + D.t(320, 50, 'output: 1', {}) },
  { n: 'Same again. Each comparison puts one item in its final place, so merging is linear.', d: D.cells([2, 5, 9], { x: 80, y: 20, dim: [0], hl: { 1: 'y' } }) + D.cells([1, 8], { x: 80, y: 80, dim: [0], hl: { 1: 'y' } }) + D.t(320, 50, 'output: 1 2', {}) },
  { n: 'When one row runs out, the rest of the other row is already in order. Forgetting this tail is the classic merge bug.', d: D.cells([2, 5, 9], { x: 80, y: 20, dim: [0, 1, 2] }) + D.cells([1, 8], { x: 80, y: 80, dim: [0], hl: { 1: 'y' } }) + D.t(320, 50, 'output: 1 2 5 8 9', { cls: 'g' }) }
], 150),
`<h2>Sorting as a tool</h2>`,
`<pre><code>sorted(words, key=len)                       # by length
sorted(people, key=lambda p: (-p.age, p.name))  # oldest first, then by name
a.sort()                                     # in place</code></pre>`,
`<p>Python's sort is <b>stable</b>: items that compare equal stay in their original order. It costs O(n log n), which is usually fine for 100,000 items.</p>
<h2>Partition</h2><p>Quick sort picks a pivot, and sweeps everything smaller to the left. After one sweep, the pivot is exactly where it belongs in the final order, without the two sides being sorted. Sometimes that's all you need.</p>`,
think('Why is sorting a useful first move for finding duplicates, overlaps or closest pairs?', 'Because it puts related items next to each other. A question about all pairs turns into a question about neighbours.')
], core: [
{ id: 'merge-sorted', title: 'Merge two rows', diff: 'Easy', time: 10,
  desc: `<p>Merge two sorted lists into one sorted list in O(n + m). Don't use <code>sort</code> or <code>sorted</code>.</p>`,
  ex: [['[1, 4], [2, 3, 9]', '[1, 2, 3, 4, 9]']], start: 'def merge(a, b):\n    ',
  nudge: ['How many positions do you need to keep track of?', 'What is left over when one list runs out?'],
  sol: `def merge(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i])\n            i += 1\n        else:\n            out.append(b[j])\n            j += 1\n    return out + a[i:] + b[j:]`, big: 'O(n + m)', idea: 'Compare the fronts. Take the smaller. Keep whatever is left at the end.',
  tests: [['merge([1, 4], [2, 3, 9])', '[1, 2, 3, 4, 9]'], ['merge([], [1])', '[1]'], ['merge([1], [])', '[1]'], ['merge([], [])', '[]'], ['merge([1, 1], [1])', '[1, 1, 1]'], ['merge([5, 6], [1, 2])', '[1, 2, 5, 6]']] },
{ id: 'merge-sort', title: 'Merge sort', diff: 'Medium', time: 15,
  desc: `<p>Sort a list using merge sort. Don't use <code>sort</code> or <code>sorted</code>. Return a new list. Tests include 200,000 items, so a nested-loop sort won't finish.</p>`,
  ex: [['[5, 2, 8, 1]', '[1, 2, 5, 8]']], start: 'def merge_sort(a):\n    ',
  nudge: ['What is the smallest list you can say is sorted without doing anything?', 'If some friend sorted each half for you, what would be left to do?'],
  sol: `def merge_sort(a):\n    if len(a) <= 1:\n        return a[:]\n    m = len(a) // 2\n    l, r = merge_sort(a[:m]), merge_sort(a[m:])\n    i = j = 0\n    out = []\n    while i < len(l) and j < len(r):\n        if l[i] <= r[j]:\n            out.append(l[i])\n            i += 1\n        else:\n            out.append(r[j])\n            j += 1\n    return out + l[i:] + r[j:]`, big: 'O(n log n) time, O(n) space', idea: 'Trust the recursion: assume the halves come back sorted.',
  tests: [['merge_sort([5, 2, 8, 1])', '[1, 2, 5, 8]'], ['merge_sort([])', '[]'], ['merge_sort([1])', '[1]'], ['merge_sort([2, 2, 1])', '[1, 2, 2]'], ['merge_sort(list(range(200000, 0, -1)))[:3]', '[1, 2, 3]']] }
], extra: ['merge-intervals', 'string-compression'], boss:
{ id: 'kth-largest', title: 'The kth largest', diff: 'Medium', time: 18,
  desc: `<p>Return the kth largest value (k = 1 is the largest). Don't sort the whole list. Partition the way quick sort does, so that you only keep working on the side that holds the answer. Tests use 300,000 items, some of them already sorted.</p>`,
  ex: [['[3, 2, 1, 5, 6, 4], 2', '5']], start: 'def kth_largest(a, k):\n    ', nudge: [],
  sol: `import random\n\ndef kth_largest(a, k):\n    while True:\n        p = random.choice(a)\n        big = [x for x in a if x > p]\n        same = sum(1 for x in a if x == p)\n        if k <= len(big):\n            a = big\n        elif k <= len(big) + same:\n            return p\n        else:\n            k -= len(big) + same\n            a = [x for x in a if x < p]`, big: 'O(n) on average', idea: 'Partition, then throw away the side that can\'t contain the answer. A random pivot avoids the worst case on sorted input.',
  tests: [['kth_largest([3, 2, 1, 5, 6, 4], 2)', '5'], ['kth_largest([1], 1)', '1'], ['kth_largest([2, 2, 2], 2)', '2'], ['kth_largest([7, 1, 5], 3)', '1'], ['kth_largest(list(range(300000)), 10)', '299990'], ['kth_largest([5] * 200000 + [9], 1)', '9']] }
});

unit({ id: 'binary-search', phase: 1, title: 'Binary search', mins: 9, read: [
`<p class="lede">Guess a number from 1 to 100. If you always guess the middle, then each answer throws away half of what's left. <b>Seven guesses at most. A billion takes thirty.</b></p>`,
steps([
  { n: 'Looking for 9. Check the middle. It is 6, which is too small. And everything to its left is smaller still.', d: D.cells([1, 3, 4, 6, 8, 9, 12], { x: 160, y: 30, hl: { 3: 'y' }, ptr: { lo: 0, mid: 3, hi: 6 } }) },
  { n: 'Half the row is gone in one question. Check the new middle: 9. Found it.', d: D.cells([1, 3, 4, 6, 8, 9, 12], { x: 160, y: 30, dim: [0, 1, 2, 3], hl: { 5: 'g' }, ptr: { lo: 4, mid: 5, hi: 6 } }) }
], 145),
`<h2>The real idea isn't about sorted lists</h2><p>You can binary search whenever the options split into a <b>"no, no, no, yes, yes, yes"</b> pattern. Then you just need to find where the answer changes.</p>`,
fig(D.cells(['no', 'no', 'no', 'no', 'yes', 'yes', 'yes'], { x: 150, y: 30, w: 58, hl: { 0: 'r', 1: 'r', 2: 'r', 3: 'r', 4: 'g', 5: 'g', 6: 'g' } }) + D.arrow(382, 110, 382, 80, 'r') + D.t(382, 130, 'the first yes: binary search finds this', { a: 'middle', cls: 'r' }), 145, '"Is speed s enough?" If a speed is enough, every faster speed is too. That is a yes-pattern, with no sorted list anywhere.'),
`<h2>Boundaries: decide what they mean, then stay honest</h2><p>Off-by-one errors happen when <code>lo</code> and <code>hi</code> mean different things in different lines. Choose first, then write one rule for what's true at every step:</p>
<ul><li>"<code>lo</code> and <code>hi</code> are both still possible answers." Stop when they meet.</li><li>What happens to <code>mid</code> after you've checked it? If it could still be the answer, keep it. If it can't, step past it.</li></ul>
<p>Test your loop by hand on a list of 1 and a list of 2. If it survives those, it's almost certainly right. Those are the sizes where infinite loops hide.</p>`,
think('You need the smallest capacity that lets you finish in time. What are the lowest and highest values that could be the answer?', 'Pick a low that is definitely too small or just barely possible, and a high that is definitely enough. The search needs that range, and finding it is part of thinking through the problem.')
], core: ['binary-search', {
  id: 'first-true', title: 'First bad version', diff: 'Easy', time: 8,
  desc: `<p>Versions <code>1..n</code>. At some version things broke, and every later version is broken as well. <code>is_bad(v)</code> tells you about one version. Return the first bad version, using as few calls as possible. If none are bad, return -1.</p>`,
  ex: [['n = 5, first bad is 4', '4']], start: 'def first_bad(n, is_bad):\n    ',
  nudge: ['After checking a bad version, could that same version still be the answer?'],
  sol: `def first_bad(n, is_bad):\n    lo, hi = 1, n + 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if is_bad(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo if lo <= n else -1`, big: 'O(log n)', idea: 'No, no, no, yes, yes: find the first yes.',
  tests: [['first_bad(5, lambda v: v >= 4)', '4'], ['first_bad(1, lambda v: True)', '1'], ['first_bad(5, lambda v: False)', '-1'], ['first_bad(5, lambda v: True)', '1'], ['first_bad(10**18, lambda v: v >= 123456789)', '123456789'], ['(first_bad(1000000, counted), len(calls) <= 25)', '(777, True)', 'calls = []\ndef counted(v):\n    calls.append(v)\n    return v >= 777']] }
], extra: ['search-rotated'], boss: 'koko-bananas' });
