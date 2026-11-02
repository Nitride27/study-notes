// Phase 0: Think in Python. Syntax is shown here because you can't invent syntax. Logic is never shown for the problems.

unit({ id: 'rough-routine', phase: 0, title: 'The rough routine', mins: 8, read: [
`<p class="lede">If you can solve a problem in your head but freeze at the keyboard, your logic is usually fine. The trouble is that "the idea" and "the code" are two separate jobs, and you're trying to do both at once.</p>
<p>Here you do them one at a time, on every problem, from the first one to the last.</p>`,
fig(D.flow({
  a: [10, 30, 150, 70, 'Work one example\nby hand', 'y'], b: [195, 30, 150, 70, 'Notice what\nyou just did'], c: [380, 30, 150, 70, 'Write the steps\nin plain words'], d: [565, 30, 145, 70, 'Translate\nline by line', 'b']
}, [['a', 'b'], ['b', 'c'], ['c', 'd']]) + D.t(365, 140, 'no Python until the last box', { a: 'middle', cls: 'r', size: 19 }), 160, 'Every problem here runs in this order. The Code tab stays shut until the first three are on paper.'),
`<h2>Why the example comes first</h2>
<p>Take "find the biggest number in a list". Before you touch code, look at <code>4 9 2</code> and find the biggest. You do it instantly, but you did do <i>something</i>. Slow yourself down and catch it:</p>`,
steps([
  { n: 'I look at the first number. It is the biggest I have seen so far, because it is the only one I have seen.', d: D.cells([4, 9, 2], { x: 200, y: 40, hl: { 0: 'y' }, ptr: { 'looking': 0 } }) + D.t(400, 60, 'biggest so far: 4', { cls: 'r', size: 19 }) },
  { n: 'Next one. Is it bigger than what I am holding? Yes, so I swap what I am holding.', d: D.cells([4, 9, 2], { x: 200, y: 40, hl: { 1: 'y' }, ptr: { 'looking': 1 } }) + D.t(400, 60, 'biggest so far: 9', { cls: 'r', size: 19 }) },
  { n: 'Next one. Bigger than what I am holding? No, so I keep holding it.', d: D.cells([4, 9, 2], { x: 200, y: 40, hl: { 2: 'y' }, ptr: { 'looking': 2 } }) + D.t(400, 60, 'biggest so far: 9', { cls: 'r', size: 19 }) },
  { n: 'Out of numbers. What I am holding is the answer. Those four sentences are the algorithm, and you already knew them.', d: D.cells([4, 9, 2], { x: 200, y: 40 }) + D.t(400, 60, 'answer: 9', { cls: 'g', size: 22 }) }
], 150),
`<h2>Thought to code</h2>
<p>Almost every sentence you write in your steps maps to a small piece of Python. This table is the bridge you've been missing. Come back to it whenever you're stuck on translating.</p>
<table>
<tr><th>When you think...</th><th>You write...</th></tr>
<tr><td>"remember this"</td><td><code>best = nums[0]</code></td></tr>
<tr><td>"go through each one"</td><td><code>for x in nums:</code></td></tr>
<tr><td>"I need the position as well"</td><td><code>for i, x in enumerate(nums):</code></td></tr>
<tr><td>"if this is true, do that"</td><td><code>if x &gt; best:</code></td></tr>
<tr><td>"replace what I remember"</td><td><code>best = x</code></td></tr>
<tr><td>"keep a running total / count"</td><td><code>total += x</code></td></tr>
<tr><td>"collect the ones I want"</td><td><code>out = []</code> then <code>out.append(x)</code></td></tr>
<tr><td>"have I seen this before?"</td><td><code>if x in seen:</code> with <code>seen = set()</code></td></tr>
<tr><td>"how many of each?"</td><td><code>counts[x] = counts.get(x, 0) + 1</code></td></tr>
<tr><td>"keep going until..."</td><td><code>while not done:</code></td></tr>
<tr><td>"stop, I've got the answer"</td><td><code>return x</code></td></tr>
<tr><td>"skip this one"</td><td><code>continue</code></td></tr>
</table>`,
`<h2>How the portal uses this</h2>
<ul>
<li><b>The sketch pad and your steps come first.</b> Draw boxes and arrows, or scribble. Nobody grades it.</li>
<li><b>Paste my steps as comments</b> puts your own sentences in the editor. Then you write the code under each one. That is the translation, and it is the skill you're here to build.</li>
<li><b>Tests show only the first failure.</b> Use it as a clue, then trace by hand to see why.</li>
<li><b>Nudges are questions, and they cost XP.</b> Being stuck for ten minutes is the workout, so don't cut it short too quickly.</li>
<li><b>Solved problems come back later</b> from a blank page. If you can write it again weeks later, you really have it.</li>
</ul>`,
think('Why does the portal make you write your own steps instead of showing you a template?', 'A template trains you to recognise a solution. Interviews and real work need you to produce one. Your own clumsy sentences are worth more than someone else\'s clean code, because the thinking is what you are practising.')
], core: [
{ id: 'biggest', title: 'Find the biggest', diff: 'Easy', time: 5,
  desc: `<p>Do the routine on the one you just read. Return the largest number in a non-empty list, <b>without</b> using <code>max</code>.</p>`,
  ex: [['[4, 9, 2]', '9'], ['[-3, -1, -7]', '-1']], start: 'def biggest(nums):\n    ',
  nudge: ['What should you be holding before you have looked at anything?'],
  sol: `def biggest(nums):\n    best = nums[0]\n    for x in nums:\n        if x > best:\n            best = x\n    return best`, big: 'O(n) time, O(1) space', idea: 'Hold the best so far, and compare everything else against it.',
  tests: [['biggest([4, 9, 2])', '9'], ['biggest([-3, -1, -7])', '-1'], ['biggest([5])', '5'], ['biggest([1, 2, 3, 4])', '4'], ['biggest([4, 3, 2, 1])', '4']] },
{ id: 'count-evens', title: 'Count the evens', diff: 'Easy', time: 5,
  desc: `<p>Return how many numbers in the list are even. An even number leaves remainder 0 when divided by 2 (<code>n % 2</code>).</p>`,
  ex: [['[1, 2, 4, 7]', '2'], ['[]', '0']], start: 'def count_evens(nums):\n    ',
  nudge: ['When you count on your fingers, how many fingers are up before you start?'],
  sol: `def count_evens(nums):\n    count = 0\n    for x in nums:\n        if x % 2 == 0:\n            count += 1\n    return count`, big: 'O(n) time, O(1) space', idea: 'A counter starts at zero and grows when a condition holds.',
  tests: [['count_evens([1, 2, 4, 7])', '2'], ['count_evens([])', '0'], ['count_evens([1, 3])', '0'], ['count_evens([0, -2])', '2']] }
], boss:
{ id: 'second-biggest', title: 'The runner-up', diff: 'Easy', time: 10,
  desc: `<p>Return the <b>second largest distinct</b> value in the list. If there isn't one, return <code>None</code>. Don't sort.</p>`,
  ex: [['[4, 9, 2]', '4'], ['[5, 5, 5]', 'None'], ['[9, 9, 4]', '4']], start: 'def runner_up(nums):\n    ',
  nudge: [],
  sol: `def runner_up(nums):\n    best = second = None\n    for x in nums:\n        if best is None or x > best:\n            best, second = x, best\n        elif x != best and (second is None or x > second):\n            second = x\n    return second`, big: 'O(n) time, O(1) space', idea: 'Two held values. When a new best arrives, the old best drops down to second.',
  tests: [['runner_up([4, 9, 2])', '4'], ['runner_up([5, 5, 5])', 'None'], ['runner_up([9, 9, 4])', '4'], ['runner_up([1])', 'None'], ['runner_up([1, 2])', '1'], ['runner_up([2, 1])', '1'], ['runner_up([-5, -2, -9])', '-5'], ['runner_up([3, 7, 7, 5])', '5']] }
});

unit({ id: 'names', phase: 0, title: 'Names and values', mins: 7, read: [
`<p class="lede">A variable isn't a box that holds a value. It is a <b>name tag tied to a value</b>. Getting that picture right now saves you from a whole family of bugs later.</p>`,
steps([
  { n: '<code>a = [1, 2]</code>: Python makes a list, then ties the tag <code>a</code> to it.', d: D.flow({ a: [40, 40, 60, 40, 'a'], l: [240, 30, 150, 60, '[1, 2]', 'y'] }, [['a', 'l']]) },
  { n: '<code>b = a</code>: this does <b>not</b> copy anything. It ties a second tag to the same list.', d: D.flow({ a: [40, 20, 60, 40, 'a'], b: [40, 90, 60, 40, 'b', 'b'], l: [240, 45, 150, 60, '[1, 2]', 'y'] }, [['a', 'l'], ['b', 'l']]) },
  { n: '<code>b.append(3)</code>: there is one list, so <code>a</code> sees the change as well. This surprises everyone once.', d: D.flow({ a: [40, 20, 60, 40, 'a'], b: [40, 90, 60, 40, 'b', 'b'], l: [240, 45, 150, 60, '[1, 2, 3]', 'r'] }, [['a', 'l'], ['b', 'l']]) },
  { n: '<code>b = [9]</code>: this makes a new list and moves the tag. <code>a</code> is untouched. Assignment moves tags. It never changes the old value.', d: D.flow({ a: [40, 20, 60, 40, 'a'], b: [40, 90, 60, 40, 'b', 'b'], l: [240, 10, 150, 50, '[1, 2, 3]', 'y'], m: [240, 90, 150, 50, '[9]', 'b'] }, [['a', 'l'], ['b', 'm']]) }
], 150),
`<h2>Things that can change, and things that can't</h2>
<table><tr><th>Can change in place</th><th>Can't change</th></tr>
<tr><td><code>list</code>, <code>dict</code>, <code>set</code></td><td><code>int</code>, <code>float</code>, <code>str</code>, <code>tuple</code>, <code>bool</code>, <code>None</code></td></tr></table>
<p><code>s = s + "x"</code> doesn't change the string. It builds a new one and moves the tag. Lists have methods that change them. Strings only have methods that give you back a new string.</p>
<h2>Swapping and the walk-through</h2>
<p>To follow code, keep a little table of names and current values, and update it line by line. It is the most useful debugging skill you'll ever have.</p>`,
tryit(`x = 5
y = x
y = y + 1
print(x, y)   # predict this before you run it

a = [1, 2]
b = a
b.append(3)
print(a)      # and this`),
think('After <code>a = [1, 2]</code> and <code>b = a[:]</code>, does <code>b.append(3)</code> change <code>a</code>?', 'No. <code>a[:]</code> builds a new list with the same contents, so <code>b</code> is tied to a separate list.')
], core: [
{ id: 'swap-ends', title: 'Swap the ends', diff: 'Easy', time: 5,
  desc: `<p>Change the list <b>in place</b> so its first and last items swap places. Return nothing. A list with fewer than 2 items stays as it is.</p>`,
  ex: [['a = [1, 2, 3]; swap_ends(a)', 'a is now [3, 2, 1]']], start: 'def swap_ends(a):\n    ',
  nudge: ['If you put one value into a position, what happens to the value that was already there?'],
  sol: `def swap_ends(a):\n    if len(a) >= 2:\n        a[0], a[-1] = a[-1], a[0]`, big: 'O(1)', idea: 'Python can assign several tags in one go, so a swap needs no temporary name.',
  tests: [['a', '[3, 2, 1]', 'a = [1, 2, 3]\nswap_ends(a)'], ['a', '[]', 'a = []\nswap_ends(a)'], ['a', '[7]', 'a = [7]\nswap_ends(a)'], ['a', '[2, 1]', 'a = [1, 2]\nswap_ends(a)']] },
{ id: 'safe-copy', title: "Don't touch my list", diff: 'Easy', time: 6,
  desc: `<p>Return a <b>new</b> list containing the items of <code>a</code> followed by <code>item</code>. The caller's list must not change.</p>`,
  ex: [['a = [1, 2]; b = with_item(a, 3)', 'b is [1, 2, 3], a is still [1, 2]']], start: 'def with_item(a, item):\n    ',
  nudge: ['How many lists exist after your function runs? How many did the caller start with?'],
  sol: `def with_item(a, item):\n    return a + [item]`, big: 'O(n)', idea: 'Know whether you are building a new thing or changing the one you were given.',
  tests: [['with_item([1, 2], 3)', '[1, 2, 3]'], ['a', '[1, 2]', 'a = [1, 2]\nb = with_item(a, 3)'], ['with_item([], 1)', '[1]']] }
], boss:
{ id: 'rotate-three', title: 'Three-way shuffle', diff: 'Easy', time: 7,
  desc: `<p>Given three values, return them as a list moved one step to the left: <code>a</code> takes <code>b</code>'s value, <code>b</code> takes <code>c</code>'s, <code>c</code> takes <code>a</code>'s old value. Do it by reassigning the names <code>a</code>, <code>b</code> and <code>c</code>, then return <code>[a, b, c]</code>.</p>`,
  ex: [['1, 2, 3', '[2, 3, 1]']], start: 'def shuffle(a, b, c):\n    ', nudge: [],
  sol: `def shuffle(a, b, c):\n    a, b, c = b, c, a\n    return [a, b, c]`, big: 'O(1)', idea: 'The right side is worked out completely before any tag moves.',
  tests: [['shuffle(1, 2, 3)', '[2, 3, 1]'], ['shuffle("x", "y", "z")', '["y", "z", "x"]'], ['shuffle(0, 0, 1)', '[0, 1, 0]']] }
});

unit({ id: 'decisions', phase: 0, title: 'Decisions', mins: 7, read: [
`<p class="lede">Every <code>if</code> is a fork in the road. Bugs in branches usually come from one of two things: <b>the order you ask the questions in</b>, or a road you forgot to draw.</p>`,
fig(D.flow({
  q1: [260, 8, 200, 46, 'divisible by 15?'], a1: [540, 8, 150, 46, 'say both'], q2: [260, 88, 200, 46, 'divisible by 3?'], a2: [540, 88, 150, 46, 'say one'], e: [260, 168, 200, 46, 'otherwise', 'y']
}, [['q1', 'a1', 'yes'], ['q1', 'q2', 'no'], ['q2', 'a2', 'yes'], ['q2', 'e', 'no']]), 224, 'Draw the fork before you code it. The most specific question goes first. Ask the general one first and the specific one can never happen.'),
`<h2>The pieces</h2>`,
`<pre><code>if age < 13:
    kind = "child"
elif age < 20:        # only asked if the first one was False
    kind = "teen"
else:
    kind = "adult"

ok = 0 <= x < 10       # Python lets you chain comparisons
if name and age > 0:   # empty string, 0, [] and None all count as False
    ...</code></pre>`,
`<p><code>and</code> stops at the first False, and <code>or</code> stops at the first True. So <code>if nums and nums[0] > 0</code> is safe, because the right side never runs on an empty list.</p>
<h2>Boundaries are where the bugs live</h2>
<p>When you write <code>x &lt; 10</code>, test 9, 10 and 11 in your head. Is it <code>&lt;</code> or <code>&lt;=</code>? The problem statement decides, so read it again. Don't guess.</p>`,
think('Can you write <code>if x > 5: return True else: return False</code> more simply?', '<code>return x > 5</code>. The comparison already is a True or False value.')
], core: [
{ id: 'fizzbuzz-one', title: 'FizzBuzz, one number', diff: 'Easy', time: 5,
  desc: `<p>Return <code>"FizzBuzz"</code> if <code>n</code> is divisible by both 3 and 5, <code>"Fizz"</code> if by 3 only, <code>"Buzz"</code> if by 5 only. Otherwise return <code>n</code> as a string.</p>`,
  ex: [['15', '"FizzBuzz"'], ['9', '"Fizz"'], ['7', '"7"']], start: 'def fizzbuzz(n):\n    ',
  nudge: ['Check each of your branches against 15. Which one catches it first?'],
  sol: `def fizzbuzz(n):\n    if n % 15 == 0:\n        return "FizzBuzz"\n    if n % 3 == 0:\n        return "Fizz"\n    if n % 5 == 0:\n        return "Buzz"\n    return str(n)`, big: 'O(1)', idea: 'Ask the most specific question first.',
  tests: [['fizzbuzz(15)', '"FizzBuzz"'], ['fizzbuzz(9)', '"Fizz"'], ['fizzbuzz(10)', '"Buzz"'], ['fizzbuzz(7)', '"7"'], ['fizzbuzz(30)', '"FizzBuzz"']] },
{ id: 'leap-year', title: 'Leap year', diff: 'Easy', time: 7,
  desc: `<p>A year is a leap year if it's divisible by 4, <b>except</b> years divisible by 100, <b>unless</b> they are also divisible by 400. Return True or False.</p>`,
  ex: [['2024', 'True'], ['1900', 'False'], ['2000', 'True'], ['2023', 'False']], start: 'def is_leap(y):\n    ',
  nudge: ['Draw the fork. Which of the three rules is the most specific?'],
  sol: `def is_leap(y):\n    if y % 400 == 0:\n        return True\n    if y % 100 == 0:\n        return False\n    return y % 4 == 0`, big: 'O(1)', idea: 'Rules with exceptions become a sequence of questions, most specific first.',
  tests: [['is_leap(2024)', 'True'], ['is_leap(1900)', 'False'], ['is_leap(2000)', 'True'], ['is_leap(2023)', 'False'], ['is_leap(2100)', 'False']] }
], boss:
{ id: 'triangle-kind', title: 'What kind of triangle', diff: 'Easy', time: 10,
  desc: `<p>Given three side lengths, return <code>"invalid"</code> if they can't form a triangle (any side ≤ 0, or any two sides sum to no more than the third). Otherwise return <code>"equilateral"</code>, <code>"isosceles"</code> or <code>"scalene"</code>.</p>`,
  ex: [['3, 3, 3', '"equilateral"'], ['3, 3, 5', '"isosceles"'], ['1, 2, 3', '"invalid"', '1 + 2 is not more than 3']], start: 'def triangle(a, b, c):\n    ', nudge: [],
  sol: `def triangle(a, b, c):\n    x, y, z = sorted([a, b, c])\n    if x <= 0 or x + y <= z:\n        return "invalid"\n    if x == z:\n        return "equilateral"\n    if x == y or y == z:\n        return "isosceles"\n    return "scalene"`, big: 'O(1)', idea: 'Sorting first means there is only one case to check instead of three.',
  tests: [['triangle(3, 3, 3)', '"equilateral"'], ['triangle(3, 3, 5)', '"isosceles"'], ['triangle(1, 2, 3)', '"invalid"'], ['triangle(3, 4, 5)', '"scalene"'], ['triangle(0, 1, 1)', '"invalid"'], ['triangle(5, 3, 3)', '"isosceles"'], ['triangle(3, 5, 3)', '"isosceles"'], ['triangle(1, 1, 3)', '"invalid"'], ['triangle(-1, 2, 2)', '"invalid"']] }
});

unit({ id: 'loops', phase: 0, title: 'Loops and running state', mins: 9, read: [
`<p class="lede">Nearly every loop is the same shape: <b>set up some state, update it for each item, then use it at the end.</b> The real question for any loop is "what do I need to remember between one step and the next?"</p>`,
steps((() => {
  const code = ['total = 0', 'for x in [3, 1, 4]:', '    total += x', 'print(total)'], f = [];
  const fr = (on, vars, n) => f.push({ n, d: D.code(code, { on }) + D.vars(vars, { x: 390, y: 50, w: 70 }) });
  fr(0, { total: 0, x: '-' }, 'Set up the state. Nothing has been read yet, so the total is 0.');
  let t = 0;
  for (const x of [3, 1, 4]) { fr(1, { total: t, x }, `The loop ties the name <code>x</code> to the next item: ${x}.`); t += x; fr(2, { total: t, x }, `Update the state. The total now covers everything read so far.`); }
  fr(3, { total: t, x: 4 }, 'Out of items, so the loop ends. Use the state.');
  return f;
})(), 130),
`<p>Keep that side table of names and values whenever you read a loop. Do it on the pad for every bug you hit, because it finds nearly all of them.</p>
<h2>Three loops you'll use all the time</h2>`,
`<pre><code>for x in items:              # I want the items
for i in range(len(items)):  # I need positions (to look at items[i+1], say)
for i, x in enumerate(items):  # I want both

while lo < hi:               # I don't know how many steps; I know when to stop</code></pre>`,
`<p><code>range(a, b)</code> includes <code>a</code> and stops <b>before</b> <code>b</code>. That's why <code>range(len(items))</code> gives exactly the valid positions.</p>
<h2>What to remember</h2>
<table><tr><th>You want</th><th>Remember</th></tr>
<tr><td>A total</td><td>sum so far</td></tr><tr><td>The best one</td><td>best so far</td></tr>
<tr><td>Whether any item qualifies</td><td>a found flag, or just <code>return True</code> early</td></tr>
<tr><td>Whether all items qualify</td><td><code>return False</code> at the first failure</td></tr>
<tr><td>Consecutive runs</td><td>the current run length, and the previous item</td></tr></table>`,
think('A loop looks for "all items positive". Where does <code>return True</code> go: inside the loop or after it?', 'After it. You can only say "all" once you have looked at everything. Inside the loop you can only say "not all", at the first failure.')
], core: [
{ id: 'sum-digits', title: 'Sum of digits', diff: 'Easy', time: 7,
  desc: `<p>Return the sum of the decimal digits of a non-negative integer. Do it with arithmetic, not by converting to a string. <code>n % 10</code> is the last digit, and <code>n // 10</code> drops it.</p>`,
  ex: [['1234', '10'], ['0', '0']], start: 'def digit_sum(n):\n    ',
  nudge: ['You don\'t know how many digits there are. Which kind of loop fits?', 'When is there nothing left of n?'],
  sol: `def digit_sum(n):\n    total = 0\n    while n > 0:\n        total += n % 10\n        n //= 10\n    return total`, big: 'O(number of digits)', idea: 'A while loop that shrinks its input until nothing is left.',
  tests: [['digit_sum(1234)', '10'], ['digit_sum(0)', '0'], ['digit_sum(9)', '9'], ['digit_sum(1000)', '1'], ['digit_sum(99999)', '45']] },
{ id: 'all-positive', title: 'All positive', diff: 'Easy', time: 4,
  desc: `<p>Return True if every number in the list is greater than 0. An empty list counts as True.</p>`,
  ex: [['[1, 2]', 'True'], ['[1, -2, 3]', 'False']], start: 'def all_positive(nums):\n    ',
  nudge: ['At what moment can you be sure of the answer in each direction?'],
  sol: `def all_positive(nums):\n    for x in nums:\n        if x <= 0:\n            return False\n    return True`, big: 'O(n)', idea: 'Leave as soon as you know. "All" is only proven at the end.',
  tests: [['all_positive([1, 2])', 'True'], ['all_positive([1, -2, 3])', 'False'], ['all_positive([])', 'True'], ['all_positive([0])', 'False'], ['all_positive([5, 6, -1])', 'False']] },
{ id: 'longest-run', title: 'Longest run', diff: 'Easy', time: 10,
  desc: `<p>Return the length of the longest stretch of equal neighbouring values in a list.</p>`,
  ex: [['[1, 1, 2, 2, 2, 1]', '3'], ['[]', '0']], start: 'def longest_run(a):\n    ',
  nudge: ['What two facts do you need to carry from one step to the next?', 'Does your code count a run that reaches the very end of the list?'],
  sol: `def longest_run(a):\n    best = run = 0\n    prev = None\n    for x in a:\n        run = run + 1 if x == prev else 1\n        prev = x\n        best = max(best, run)\n    return best`, big: 'O(n) time, O(1) space', idea: 'Keep the current run and the best run separately. Update the best every step so the final run is counted.',
  tests: [['longest_run([1, 1, 2, 2, 2, 1])', '3'], ['longest_run([])', '0'], ['longest_run([5])', '1'], ['longest_run([1, 2, 3])', '1'], ['longest_run([1, 2, 2, 2])', '3'], ['longest_run([7, 7, 7])', '3']] }
], extra: [
{ id: 'collatz', title: 'Collatz steps', diff: 'Easy', time: 6,
  desc: `<p>Start at <code>n</code>. If it's even, halve it. If it's odd, make it <code>3n + 1</code>. Return how many steps it takes to reach 1.</p>`,
  ex: [['6', '8'], ['1', '0']], start: 'def collatz(n):\n    ', nudge: ['Do you know the number of steps before you start?'],
  sol: `def collatz(n):\n    steps = 0\n    while n != 1:\n        n = n // 2 if n % 2 == 0 else 3 * n + 1\n        steps += 1\n    return steps`, big: 'Unknown in general', idea: 'Use while when you know the stopping condition but not the count.',
  tests: [['collatz(6)', '8'], ['collatz(1)', '0'], ['collatz(27)', '111'], ['collatz(2)', '1']] }
], boss:
{ id: 'max-gap', title: 'Stock profit warm-up', diff: 'Easy', time: 12,
  desc: `<p>Return the largest value of <code>a[j] - a[i]</code> where <code>j &gt; i</code>. If the list has fewer than 2 items, return 0. If every option loses, return the least negative one.</p>`,
  ex: [['[3, 1, 4, 8]', '7', '8 - 1'], ['[9, 5, 2]', '-3', '2 - 5']], start: 'def max_gap(a):\n    ', nudge: [],
  sol: `def max_gap(a):\n    if len(a) < 2:\n        return 0\n    low, best = a[0], a[1] - a[0]\n    for x in a[1:]:\n        best = max(best, x - low)\n        low = min(low, x)\n    return best`, big: 'O(n) time, O(1) space', idea: 'For each position, the only thing you need from the past is its smallest value.',
  tests: [['max_gap([3, 1, 4, 8])', '7'], ['max_gap([9, 5, 2])', '-3'], ['max_gap([1])', '0'], ['max_gap([])', '0'], ['max_gap([1, 2])', '1'], ['max_gap([5, 5])', '0'], ['max_gap([7, 1, 5, 3, 6, 4])', '5'], ['max_gap([9, 7, 4, 3])', '-1']] }
});

unit({ id: 'functions', phase: 0, title: 'Functions', mins: 7, read: [
`<p class="lede">A function is a named machine: values go in, one value comes out. Breaking a problem into small machines is how you make big problems stop being big.</p>`,
fig(D.flow({ i: [30, 40, 130, 60, 'arguments'], m: [260, 20, 200, 100, 'def area(w, h):\n    return w * h', 'y'], o: [560, 40, 130, 60, 'return value'] }, [['i', 'm'], ['m', 'o']]) + D.t(360, 150, 'print shows you something. Only return hands a value back.', { a: 'middle', cls: 'r', size: 18 }), 165),
`<h2>Each call gets its own desk</h2><p>Names inside a function exist only during that call. That's why two functions can both use a name like <code>i</code> without interfering.</p>`,
steps([
  { n: 'Your code calls <code>double(21)</code>. Python sets up a new desk with <code>n</code> tied to 21.', d: D.stack(['main'], { x: 60, y: 130, w: 160 }) + D.t(300, 70, 'x = double(21)', { mono: 1 }) },
  { n: 'The function runs on its own desk. It can\'t see the names on the desk below.', d: D.stack(['main', 'double: n = 21'], { x: 60, y: 130, w: 160 }) + D.t(300, 70, 'return n * 2', { mono: 1 }) },
  { n: 'Return hands 42 back. The desk is thrown away, including <code>n</code>.', d: D.stack(['main'], { x: 60, y: 130, w: 160 }) + D.t(300, 70, 'x = 42', { mono: 1 }) }
], 170),
`<h2>Good habits</h2><ul>
<li>A function should do one job you can say in one sentence, without using "and".</li>
<li>Return the result. Printing inside helpers makes them useless to other code.</li>
<li>A function with no <code>return</code> gives back <code>None</code>. If you see <code>None</code> where you expected a value, look for this first.</li>
<li><b>Never</b> use a mutable default: <code>def f(x, items=[])</code> shares one list across every call. Use <code>items=None</code> instead.</li>
</ul>`,
tryit(`def add_item(x, items=[]):
    items.append(x)
    return items

print(add_item(1))
print(add_item(2))   # what happened? Why?`),
think('In your steps you wrote "check whether the number is prime" in the middle of a bigger plan. What should that sentence become in code?', 'Its own function, <code>is_prime(n)</code>. Then the big plan reads like your plain-English steps. If a step feels too big to translate, make it a function and write that function next.')
], core: [
{ id: 'is-prime', title: 'Is it prime?', diff: 'Easy', time: 8,
  desc: `<p>Return True if <code>n</code> is prime (greater than 1 and divisible only by 1 and itself). It must be quick for large <code>n</code>, around 10<sup>12</sup>.</p>`,
  ex: [['7', 'True'], ['1', 'False'], ['9', 'False']], start: 'def is_prime(n):\n    ',
  nudge: ['If n = a × b, can both a and b be larger than the square root of n?'],
  sol: `def is_prime(n):\n    if n < 2:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True`, big: 'O(√n)', idea: 'Factors come in pairs, so one of each pair is at or below the square root.',
  tests: [['is_prime(7)', 'True'], ['is_prime(1)', 'False'], ['is_prime(9)', 'False'], ['is_prime(2)', 'True'], ['is_prime(0)', 'False'], ['is_prime(1000003)', 'True'], ['is_prime(999966000289)', 'False']] },
{ id: 'count-primes-under', title: 'Reuse your machine', diff: 'Easy', time: 6,
  desc: `<p>Write <code>primes_upto(n)</code>, returning a list of all primes from 2 up to and including <code>n</code>. Write a helper function, and call it from the main one.</p>`,
  ex: [['10', '[2, 3, 5, 7]'], ['1', '[]']], start: 'def primes_upto(n):\n    ',
  nudge: ['Which sentence in your steps is big enough to be its own function?'],
  sol: `def is_prime(n):\n    if n < 2:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True\n\ndef primes_upto(n):\n    return [x for x in range(2, n + 1) if is_prime(x)]`, big: 'O(n√n)', idea: 'Name the hard step, write it once, and call it.',
  tests: [['primes_upto(10)', '[2, 3, 5, 7]'], ['primes_upto(1)', '[]'], ['primes_upto(2)', '[2]'], ['len(primes_upto(1000))', '168']] }
], boss:
{ id: 'clean-defaults', title: 'Tag collector', diff: 'Easy', time: 8,
  desc: `<p>Write <code>collect(tag, bag=None)</code>. It adds <code>tag</code> to <code>bag</code> and returns it. With no bag given, it starts a <b>fresh</b> empty list each call.</p>`,
  ex: [['collect("a"); collect("b")', 'second call returns ["b"], not ["a", "b"]'], ['b = []; collect("x", b)', 'b is ["x"]']], start: 'def collect(tag, bag=None):\n    ', nudge: [],
  sol: `def collect(tag, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(tag)\n    return bag`, big: 'O(1)', idea: 'Defaults are made once, when the function is defined. Use None as "not given".',
  tests: [['collect("a")', '["a"]'], ['collect("b")', '["b"]', 'collect("a")'], ['b', '["x"]', 'b = []\ncollect("x", b)'], ['b', '["x", "y"]', 'b = ["x"]\ncollect("y", b)'], ['collect("z", e) is e', 'True', 'e = []']] }
});

unit({ id: 'lists-strings', phase: 0, title: 'Lists and strings', mins: 10, read: [
`<p class="lede">A list is a row of numbered boxes. Once you can see the row, most list problems are just "which boxes do I look at, and in what order?"</p>`,
fig(D.cells(['p', 'y', 't', 'h', 'o', 'n'], { x: 180, y: 42, idx: true, hl: { 1: 'y', 2: 'y', 3: 'y' } }) + D.t(350, 120, 's[1:4] means from box 1 up to, but not including, box 4', { a: 'middle', cls: 'r', size: 18 }) + [-6, -5, -4, -3, -2, -1].map((v, i) => D.t(204 + i * 48, 104, v, { a: 'middle', cls: 'soft mono', size: 12 })).join(''), 135, 'Positions run from 0 at the left. Negative positions count back from the right.'),
`<h2>What things cost</h2><p>This matters from day one. You don't need the theory yet. Just the picture:</p>`,
steps([
  { n: '<code>a.append(x)</code>: put it in the next free box at the end. Nothing else moves. Fast.', d: D.cells([1, 2, 3, ''], { x: 40, y: 40, hl: { 3: 'g' } }) + D.t(300, 66, 'nothing moves', { cls: 'g', size: 19 }) },
  { n: '<code>a.insert(0, x)</code> or <code>a.pop(0)</code>: every other item has to shuffle along by one. A million items means a million moves.', d: D.cells([1, 2, 3, ''], { x: 40, y: 40, hl: { 0: 'r', 1: 'r', 2: 'r' } }) + [0, 1, 2].map(i => D.arrow(64 + i * 48, 28, 104 + i * 48, 28, 'r')).join('') + D.t(300, 66, 'everything moves', { cls: 'r', size: 19 }) },
  { n: '<code>x in a</code>: may check every box. It looks like one small word, but it is a whole loop.', d: D.cells([1, 2, 3, 4], { x: 40, y: 40, hl: { 0: 'y', 1: 'y', 2: 'y', 3: 'y' } }) + D.t(300, 66, 'a hidden loop', { cls: 'r', size: 19 }) }
], 120),
`<h2>The tools</h2>`,
`<pre><code>a[0], a[-1], a[1:3], a[::-1]          # read, slice, reversed copy
a.append(x), a.pop(), a.sort()         # change it
sorted(a), len(a), sum(a), min(a)      # new value, a unchanged
[x * 2 for x in a if x > 0]            # build a list from a list

s.split(), " ".join(words), s.strip()  # strings: always a new string back
s.lower(), s.isdigit(), s.startswith("a")
ord("a"), chr(97)                      # letter to number and back</code></pre>`,
`<p>Strings can't be changed in place. Adding to a string in a loop rebuilds it every time, so collect pieces in a list and <code>"".join()</code> them at the end.</p>
<h2>Two positions at once</h2><p>Many problems look at a pair of boxes, like neighbours <code>a[i]</code> and <code>a[i + 1]</code>. Then the loop must stop one box early so that <code>i + 1</code> stays valid. Draw the last step on the pad and you'll see the limit.</p>`,
think('You loop with <code>for i in range(len(a)):</code> and read <code>a[i + 1]</code>. What goes wrong, and on which step?', 'On the last step <code>i + 1</code> equals <code>len(a)</code>, which is past the end, so you get an IndexError. Use <code>range(len(a) - 1)</code>.')
], core: [
{ id: 'reverse-manual', title: 'Reverse it yourself', diff: 'Easy', time: 7,
  desc: `<p>Reverse a list <b>in place</b> without <code>reverse()</code>, slicing or a second list.</p>`,
  ex: [['a = [1, 2, 3]', 'a is now [3, 2, 1]']], start: 'def reverse_in_place(a):\n    ',
  nudge: ['Draw the row. Which two boxes must swap first? Which two swap next?', 'When have you done enough swaps?'],
  sol: `def reverse_in_place(a):\n    i, j = 0, len(a) - 1\n    while i < j:\n        a[i], a[j] = a[j], a[i]\n        i += 1\n        j -= 1`, big: 'O(n) time, O(1) space', idea: 'Two positions moving toward each other.',
  tests: [['a', '[3, 2, 1]', 'a = [1, 2, 3]\nreverse_in_place(a)'], ['a', '[4, 3, 2, 1]', 'a = [1, 2, 3, 4]\nreverse_in_place(a)'], ['a', '[]', 'a = []\nreverse_in_place(a)'], ['a', '[1]', 'a = [1]\nreverse_in_place(a)']] },
{ id: 'is-sorted', title: 'Already sorted?', diff: 'Easy', time: 5,
  desc: `<p>Return True if the list never goes down from one item to the next.</p>`,
  ex: [['[1, 2, 2, 5]', 'True'], ['[1, 3, 2]', 'False']], start: 'def is_sorted(a):\n    ',
  nudge: ['What is the smallest piece of evidence that it is not sorted?'],
  sol: `def is_sorted(a):\n    for i in range(len(a) - 1):\n        if a[i] > a[i + 1]:\n            return False\n    return True`, big: 'O(n)', idea: 'Compare neighbours, and stop one box early.',
  tests: [['is_sorted([1, 2, 2, 5])', 'True'], ['is_sorted([1, 3, 2])', 'False'], ['is_sorted([])', 'True'], ['is_sorted([1])', 'True'], ['is_sorted([2, 1])', 'False']] },
{ id: 'caesar', title: 'Secret shift', diff: 'Easy', time: 10,
  desc: `<p>Shift each lowercase letter forward by <code>k</code> places, wrapping from z back to a. Leave everything else as it is. <code>k</code> may be larger than 26.</p>`,
  ex: [['"abz", 1', '"bca"'], ['"hi there!", 2', '"jk vjgtg!"']], start: 'def shift(s, k):\n    ',
  nudge: ['Turn a letter into its position 0 to 25. What arithmetic wraps a number around a range?'],
  sol: `def shift(s, k):\n    out = []\n    for c in s:\n        if "a" <= c <= "z":\n            out.append(chr((ord(c) - ord("a") + k) % 26 + ord("a")))\n        else:\n            out.append(c)\n    return "".join(out)`, big: 'O(n)', idea: '% wraps a number into a range. Collect pieces and join at the end.',
  tests: [['shift("abz", 1)', '"bca"'], ['shift("hi there!", 2)', '"jk vjgtg!"'], ['shift("abc", 26)', '"abc"'], ['shift("", 3)', '""'], ['shift("a", 53)', '"b"'], ['shift("A1", 5)', '"A1"']] }
], extra: ['longest-common-prefix', 'reverse-words', 'roman-to-int', 'int-to-roman', 'find-replace-string'], boss:
{ id: 'rle', title: 'Squash the runs', diff: 'Easy', time: 12,
  desc: `<p>Run-length encode: turn each run of equal characters into the character followed by its count.</p>`,
  ex: [['"aaabcc"', '"a3b1c2"'], ['""', '""']], start: 'def squash(s):\n    ', nudge: [],
  sol: `def squash(s):\n    out = []\n    i = 0\n    while i < len(s):\n        j = i\n        while j < len(s) and s[j] == s[i]:\n            j += 1\n        out.append(s[i] + str(j - i))\n        i = j\n    return "".join(out)`, big: 'O(n)', idea: 'A run is a stretch from i to j. Jump i straight to j when it ends.',
  tests: [['squash("aaabcc")', '"a3b1c2"'], ['squash("")', '""'], ['squash("a")', '"a1"'], ['squash("abc")', '"a1b1c1"'], ['squash("zzzzzzzzzzzz")', '"z12"']] }
});

unit({ id: 'dicts-sets', phase: 0, title: 'Dictionaries and sets', mins: 8, read: [
`<p class="lede">A list asks "what's in box 3?" A dictionary asks "what's filed under <i>apple</i>?" It goes straight to the answer without searching.</p>`,
steps([
  { n: 'A list search has to look through boxes one by one until it finds a match.', d: D.cells(['fig', 'kiwi', 'apple', 'plum'], { x: 40, y: 50, w: 70, hl: { 0: 'r', 1: 'r', 2: 'g' } }) + D.t(40, 125, 'three looks to find apple. With a million items, a million looks.', { cls: 'r', size: 18 }) },
  { n: 'A dictionary runs the key through a hash function, which gives a drawer number directly. One look, however many items you have.', d: D.flow({ k: [30, 40, 100, 44, '"apple"', 'y'], h: [200, 30, 110, 64, 'hash\nfunction'], d: [400, 40, 280, 44, 'drawer 7 holds: 3 boxes', 'g'] }, [['k', 'h'], ['h', 'd']]) + D.t(40, 130, 'One look. This single fact speeds up a huge number of programs.', { cls: 'g', size: 18 }) }
], 150),
`<h2>Which one, when?</h2>
<table><tr><th>You need</th><th>Use</th></tr>
<tr><td>Order, positions</td><td><code>list</code></td></tr>
<tr><td>"Have I seen this?"</td><td><code>set</code></td></tr>
<tr><td>"What goes with this?"</td><td><code>dict</code></td></tr>
<tr><td>"How many of each?"</td><td><code>dict</code> or <code>Counter</code></td></tr>
<tr><td>"Which items go together?"</td><td><code>dict</code> of lists</td></tr></table>`,
`<pre><code>ages = {"sam": 21}
ages["ira"] = 30               # add or replace
ages.get("nobody", 0)          # a default instead of a KeyError
for name, age in ages.items(): ...

seen = set()
seen.add(5)
5 in seen                      # one look, however large the set is

from collections import Counter, defaultdict
Counter("hello")               # {'l': 2, 'h': 1, 'e': 1, 'o': 1}
groups = defaultdict(list)     # a missing key starts as []
groups["a"].append(1)</code></pre>`,
`<p>Keys must be things that can't change: strings, numbers, tuples. A list can't be a key, but its tuple can.</p>`,
think('You check <code>if x in my_list</code> inside a loop over a million items. What is the cost, and what is the one-line fix?', 'Each check may scan the whole list, so that is up to a trillion looks. Build <code>seen = set(my_list)</code> first, and each check becomes a single look.')
], core: [
{ id: 'word-count', title: 'Word count', diff: 'Easy', time: 6,
  desc: `<p>Return a dict of word to how many times it appears. Words are separated by spaces, and case doesn't matter. Write the counting yourself, without <code>Counter</code>.</p>`,
  ex: [['"the cat The"', '{"the": 2, "cat": 1}']], start: 'def word_count(text):\n    ',
  nudge: ['What should happen the first time you meet a word? How is the second time different?'],
  sol: `def word_count(text):\n    counts = {}\n    for w in text.lower().split():\n        counts[w] = counts.get(w, 0) + 1\n    return counts`, big: 'O(n)', idea: 'The counting pattern: get with a default, add one, store.',
  tests: [['word_count("the cat The")', '{"the": 2, "cat": 1}'], ['word_count("")', '{}'], ['word_count("a a a")', '{"a": 3}'], ['word_count("  spaced   out  ")', '{"spaced": 1, "out": 1}']] },
{ id: 'group-by-length', title: 'Group by length', diff: 'Easy', time: 6,
  desc: `<p>Return a dict mapping each word length to the list of words of that length, in their original order.</p>`,
  ex: [['["hi", "yo", "cat"]', '{2: ["hi", "yo"], 3: ["cat"]}']], start: 'def by_length(words):\n    ',
  nudge: ['The dictionary maps a key to a list. What must exist before you can append?'],
  sol: `def by_length(words):\n    groups = {}\n    for w in words:\n        groups.setdefault(len(w), []).append(w)\n    return groups`, big: 'O(n)', idea: 'Grouping is counting, but you keep the items.',
  tests: [['by_length(["hi", "yo", "cat"])', '{2: ["hi", "yo"], 3: ["cat"]}'], ['by_length([])', '{}'], ['by_length(["a"])', '{1: ["a"]}']] },
{ id: 'common-items', title: 'In both lists', diff: 'Easy', time: 5,
  desc: `<p>Return a sorted list of the distinct values that appear in both lists. Must be fast on lists of a million items.</p>`,
  ex: [['[1, 2, 2, 3], [2, 3, 4]', '[2, 3]']], start: 'def common(a, b):\n    ',
  nudge: ['Which structure answers "is it in there?" with one look?'],
  sol: `def common(a, b):\n    return sorted(set(a) & set(b))`, big: 'O(n log n) to sort the answer', idea: 'Sets have intersection built in.',
  tests: [['common([1, 2, 2, 3], [2, 3, 4])', '[2, 3]'], ['common([], [1])', '[]'], ['common([1], [2])', '[]'], ['len(common(list(range(200000)), list(range(100000, 300000))))', '100000']] }
], extra: ['contains-duplicate', 'first-unique-char', 'remove-duplicates'], boss:
{ id: 'most-common-word', title: 'Banned words', diff: 'Easy', time: 12,
  desc: `<p>Return the most frequent word in <code>text</code> that isn't in <code>banned</code>. Ignore case and strip the punctuation <code>, . ! ?</code>. On a tie, return the word that appears first in the text.</p>`,
  ex: [['"Bob hit a ball, the hit BALL flew far.", ["hit"]', '"ball"']], start: 'def top_word(text, banned):\n    ', nudge: [],
  sol: `def top_word(text, banned):\n    ban = set(banned)\n    counts = {}\n    for raw in text.lower().split():\n        w = raw.strip(",.!?")\n        if w and w not in ban:\n            counts[w] = counts.get(w, 0) + 1\n    best = None\n    for w, c in counts.items():\n        if best is None or c > counts[best]:\n            best = w\n    return best`, big: 'O(n)', idea: 'Clean, count, then scan. A dict keeps insertion order, so the first word wins a tie.',
  tests: [['top_word("Bob hit a ball, the hit BALL flew far.", ["hit"])', '"ball"'], ['top_word("a b", [])', '"a"'], ['top_word("b a a b", [])', '"b"'], ['top_word("go! go? stop.", ["stop"])', '"go"'], ['top_word("x", ["x"])', 'None']] }
});

unit({ id: 'nested', phase: 0, title: 'Nested loops and grids', mins: 7, read: [
`<p class="lede">A loop inside a loop is a clock: the minute hand goes all the way round for each tick of the hour hand. It's how you look at <b>every pair</b> or <b>every cell</b>.</p>`,
steps([0, 1, 2, 3, 4].map(k => {
  const [r, c] = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1]][k];
  return { n: `<code>r = ${r}</code>, <code>c = ${c}</code>. ${k === 3 ? 'The inner loop finished, so the outer loop ticks and the inner one starts over.' : 'The inner loop moves along the row.'}`, d: D.grid([[1, 2, 3], [4, 5, 6]], { x: 60, y: 30, s: 50, hl: { [`${r},${c}`]: 'y' } }) + D.t(280, 60, `grid[${r}][${c}]`, { mono: 1 }) + D.t(280, 95, 'for r in range(rows):', { mono: 1 }) + D.t(280, 120, '    for c in range(cols):', { mono: 1 }) };
}), 150),
`<h2>A grid is a list of lists</h2>`,
`<pre><code>grid = [[1, 2, 3],
        [4, 5, 6]]
rows, cols = len(grid), len(grid[0])
grid[1][2]                                  # row 1, column 2, which is 6

blank = [[0] * cols for _ in range(rows)]   # right
bad = [[0] * cols] * rows                   # wrong: every row is the SAME list</code></pre>`,
`<h2>Neighbours</h2><p>Keep the four directions as data. It saves four copies of an <code>if</code>.</p>`,
`<pre><code>for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
    nr, nc = r + dr, c + dc
    if 0 <= nr < rows and 0 <= nc < cols:
        ...</code></pre>`,
`<h2>Every pair, once</h2><p>Starting the inner loop at <code>i + 1</code> means you look at each pair once and never pair an item with itself. On the pad, draw the triangle of pairs you are actually visiting.</p>`,
fig(D.grid([['', '✓', '✓', '✓'], ['', '', '✓', '✓'], ['', '', '', '✓'], ['', '', '', '']], { x: 220, y: 8, s: 38 }) + D.t(400, 60, 'i across the rows', { cls: 'soft' }) + D.t(400, 90, 'j starts after i', { cls: 'soft' }) + D.t(400, 120, 'n items make about n²/2 pairs', { cls: 'r' }), 170),
think('If 1,000 items take a nested loop about 500,000 steps, about how many steps for 10,000 items?', 'About 50 million. Ten times the data, a hundred times the work. Hold on to that feeling, because the next phase is about avoiding it.')
], core: [
{ id: 'transpose', title: 'Flip the grid', diff: 'Easy', time: 8,
  desc: `<p>Return the transpose of a rectangular grid: rows become columns. The grid may not be square.</p>`,
  ex: [['[[1, 2, 3], [4, 5, 6]]', '[[1, 4], [2, 5], [3, 6]]']], start: 'def transpose(grid):\n    ',
  nudge: ['Where does the item at row r, column c end up? What shape is the result?'],
  sol: `def transpose(grid):\n    return [[row[c] for row in grid] for c in range(len(grid[0]))]`, big: 'O(rows × cols)', idea: 'Work out where one cell goes. Then every cell goes the same way.',
  tests: [['transpose([[1, 2, 3], [4, 5, 6]])', '[[1, 4], [2, 5], [3, 6]]'], ['transpose([[1]])', '[[1]]'], ['transpose([[1], [2]])', '[[1, 2]]']] },
{ id: 'count-pairs', title: 'Pairs that sum', diff: 'Easy', time: 7,
  desc: `<p>Count how many pairs of positions <code>i &lt; j</code> have <code>a[i] + a[j] == t</code>. A nested loop is fine here.</p>`,
  ex: [['[1, 2, 3, 4], 5', '2', '1+4 and 2+3'], ['[1, 1, 1], 2', '3']], start: 'def count_pairs(a, t):\n    ',
  nudge: ['Where should the inner loop start so a pair is never counted twice?'],
  sol: `def count_pairs(a, t):\n    n = 0\n    for i in range(len(a)):\n        for j in range(i + 1, len(a)):\n            if a[i] + a[j] == t:\n                n += 1\n    return n`, big: 'O(n²)', idea: 'Inner loop starts after i: each pair exactly once.',
  tests: [['count_pairs([1, 2, 3, 4], 5)', '2'], ['count_pairs([1, 1, 1], 2)', '3'], ['count_pairs([], 1)', '0'], ['count_pairs([5], 10)', '0']] }
], extra: ['spiral-matrix', 'rotate-image'], boss:
{ id: 'life-neighbours', title: 'Game of Life, one step', diff: 'Medium', time: 18,
  desc: `<p>Return the next state of a grid of 0s (dead) and 1s (alive). Each cell counts its 8 neighbours. A live cell survives with 2 or 3 live neighbours. A dead cell comes alive with exactly 3. Everything else ends up dead. Cells off the edge count as dead. Don't change the input grid.</p>`,
  ex: [['[[0,1,0],[0,1,0],[0,1,0]]', '[[0,0,0],[1,1,1],[0,0,0]]']], start: 'def life(grid):\n    ', nudge: [],
  sol: `def life(grid):\n    rows, cols = len(grid), len(grid[0])\n    out = [[0] * cols for _ in range(rows)]\n    for r in range(rows):\n        for c in range(cols):\n            n = 0\n            for dr in (-1, 0, 1):\n                for dc in (-1, 0, 1):\n                    if (dr or dc) and 0 <= r + dr < rows and 0 <= c + dc < cols:\n                        n += grid[r + dr][c + dc]\n            out[r][c] = 1 if n == 3 or (n == 2 and grid[r][c]) else 0\n    return out`, big: 'O(rows × cols)', idea: 'Write to a new grid so that updates don\'t affect the counts of cells you haven\'t reached yet.',
  tests: [['life([[0,1,0],[0,1,0],[0,1,0]])', '[[0,0,0],[1,1,1],[0,0,0]]'], ['life([[1,1],[1,1]])', '[[1,1],[1,1]]'], ['life([[1]])', '[[0]]'], ['life([[1,1,0],[1,0,0],[0,0,0]])', '[[1,1,0],[1,1,0],[0,0,0]]'], ['g', '[[0,1,0],[0,1,0],[0,1,0]]', 'g = [[0,1,0],[0,1,0],[0,1,0]]\nlife(g)']] }
});

unit({ id: 'objects', phase: 0, title: 'Objects', mins: 8, read: [
`<p class="lede">A class bundles some data with the actions allowed on it. You've used this already: a list holds items, and <code>.append</code> is one of its actions. Now you get to make your own.</p>`,
fig(D.flow({ c: [40, 30, 220, 100, 'class Account\nthe blueprint', 'y'], a: [420, 8, 260, 62, 'sam: balance = 50'], b: [420, 90, 260, 62, 'ira: balance = 900'] }, [['c', 'a', 'makes'], ['c', 'b', 'makes']]), 165, 'One blueprint, many objects. Each object keeps its own data.'),
`<pre><code>class Account:
    def __init__(self, owner):     # runs once, when the object is made
        self.owner = owner         # self is "this particular object"
        self.balance = 0

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount

sam = Account("sam")
sam.deposit(50)                    # Python passes sam in as self</code></pre>`,
`<h2>Why bother?</h2>
<p>Because the object can <b>protect its own rules</b>. If everyone goes through <code>deposit</code>, a negative deposit can never happen. Every backend you build later depends on this idea.</p>
<h2>Finding the classes in your rough work</h2>
<p>When you sketch a system, the <b>nouns</b> that hold state tend to become classes, and the <b>verbs</b> become methods. A parking lot, its spots and its cars: which of these change, and who is responsible for them?</p>
<h2>Errors are part of the design</h2>
<p>Use <code>raise ValueError("why")</code> when you're given something impossible. Returning a strange value like -1 means every caller has to remember to check it. An exception can't be silently ignored.</p>`,
think('Should <code>Account</code> let anyone set <code>sam.balance = -100</code> directly? What does Python do about it?', 'Python does not stop you. A leading underscore (<code>self._balance</code>) is the convention for "hands off, use the methods". Good design relies on the methods being the easy path.')
], core: [
{ id: 'counter-class', title: 'A tally counter', diff: 'Easy', time: 7,
  desc: `<p>Write class <code>Tally</code>: <code>click()</code> adds 1, <code>value()</code> returns the count, and <code>reset()</code> sets it to 0. Two tallies must not share a count.</p>`,
  ex: [['t = Tally(); t.click(); t.click(); t.value()', '2']], start: 'class Tally:\n    ',
  nudge: ['What does the object need to remember? Where does it get its starting value?'],
  sol: `class Tally:\n    def __init__(self):\n        self.n = 0\n\n    def click(self):\n        self.n += 1\n\n    def value(self):\n        return self.n\n\n    def reset(self):\n        self.n = 0`, big: 'O(1) each', idea: 'State goes in __init__, actions go in methods.',
  tests: [['t.value()', '2', 't = Tally()\nt.click()\nt.click()'], ['t.value()', '0', 't = Tally()\nt.click()\nt.reset()'], ['b.value()', '0', 'a = Tally()\nb = Tally()\na.click()'], ['Tally().value()', '0']] },
{ id: 'bank-account', title: 'A careful account', diff: 'Easy', time: 10,
  desc: `<p>Write <code>Account</code>: <code>deposit(x)</code> and <code>withdraw(x)</code> change <code>balance</code> (an attribute starting at 0). Raise <code>ValueError</code> for a non-positive amount or for a withdrawal larger than the balance. The balance must stay unchanged when an error is raised.</p>`,
  ex: [['a = Account(); a.deposit(50); a.withdraw(20); a.balance', '30']], start: 'class Account:\n    ',
  nudge: ['What must be true before you change anything? Check it first.'],
  sol: `class Account:\n    def __init__(self):\n        self.balance = 0\n\n    def deposit(self, x):\n        if x <= 0:\n            raise ValueError("amount must be positive")\n        self.balance += x\n\n    def withdraw(self, x):\n        if x <= 0 or x > self.balance:\n            raise ValueError("bad amount")\n        self.balance -= x`, big: 'O(1)', idea: 'Validate first, change state second. An object should never be left half-changed.',
  tests: [['a.balance', '30', 'a = Account()\na.deposit(50)\na.withdraw(20)'],
    ['raised', 'True', 'a = Account()\ntry:\n    a.withdraw(5)\n    raised = False\nexcept ValueError:\n    raised = True'],
    ['raised and a.balance == 10', 'True', 'a = Account()\na.deposit(10)\ntry:\n    a.withdraw(11)\n    raised = False\nexcept ValueError:\n    raised = True'],
    ['raised', 'True', 'a = Account()\ntry:\n    a.deposit(0)\n    raised = False\nexcept ValueError:\n    raised = True'],
    ['raised', 'True', 'a = Account()\na.deposit(5)\ntry:\n    a.withdraw(-1)\n    raised = False\nexcept ValueError:\n    raised = True']] }
], boss:
{ id: 'library', title: 'The little library', diff: 'Medium', time: 18,
  desc: `<p>Write <code>Library</code>:</p><ul><li><code>add(title)</code> adds one copy of a book.</li><li><code>borrow(title, who)</code> lends a copy. Raise <code>ValueError</code> if no copy is free, or if <code>who</code> already holds this title.</li><li><code>give_back(title, who)</code> returns it. Raise <code>ValueError</code> if <code>who</code> doesn't hold it.</li><li><code>available(title)</code> returns the free copies, 0 if unknown.</li><li><code>held_by(who)</code> returns a sorted list of the titles they hold.</li></ul>`,
  ex: [['l.add("A"); l.borrow("A", "sam"); l.available("A")', '0']], start: 'class Library:\n    ', nudge: [],
  sol: `class Library:\n    def __init__(self):\n        self.free = {}\n        self.loans = {}\n\n    def add(self, title):\n        self.free[title] = self.free.get(title, 0) + 1\n\n    def available(self, title):\n        return self.free.get(title, 0)\n\n    def held_by(self, who):\n        return sorted(self.loans.get(who, set()))\n\n    def borrow(self, title, who):\n        held = self.loans.setdefault(who, set())\n        if self.available(title) == 0 or title in held:\n            raise ValueError("cannot lend")\n        self.free[title] -= 1\n        held.add(title)\n\n    def give_back(self, title, who):\n        held = self.loans.get(who, set())\n        if title not in held:\n            raise ValueError("not held")\n        held.remove(title)\n        self.free[title] += 1`, big: 'O(1) per action, apart from sorting in held_by', idea: 'Choose what to store first. The methods then become a few lines each.',
  tests: [['l.available("A")', '0', 'l = Library()\nl.add("A")\nl.borrow("A", "sam")'], ['l.available("B")', '0', 'l = Library()'], ['l.held_by("sam")', '["A", "B"]', 'l = Library()\nl.add("B")\nl.add("A")\nl.borrow("B", "sam")\nl.borrow("A", "sam")'],
    ['ok', 'True', 'l = Library()\nl.add("A")\nl.add("A")\nl.borrow("A", "sam")\ntry:\n    l.borrow("A", "sam")\n    ok = False\nexcept ValueError:\n    ok = l.available("A") == 1'],
    ['ok', 'True', 'l = Library()\ntry:\n    l.borrow("Z", "sam")\n    ok = False\nexcept ValueError:\n    ok = True'],
    ['ok', 'True', 'l = Library()\nl.add("A")\ntry:\n    l.give_back("A", "sam")\n    ok = False\nexcept ValueError:\n    ok = l.available("A") == 1'],
    ['(l.available("A"), l.held_by("sam"))', '(1, [])', 'l = Library()\nl.add("A")\nl.borrow("A", "sam")\nl.give_back("A", "sam")'],
    ['l.held_by("nobody")', '[]', 'l = Library()']] }
});

unit({ id: 'debugging', phase: 0, title: 'Reading errors and debugging', mins: 7, read: [
`<p class="lede">Beginners read an error and feel accused. Experienced programmers read it as a free clue. The last line says <b>what</b> went wrong, and the line number says <b>where</b> it noticed.</p>`,
fig(D.flow({ a: [20, 20, 320, 40, 'File "x.py", line 3, in total'], b: [20, 70, 320, 40, 'return a + b'], c: [20, 120, 320, 40, "TypeError: int + str", 'r'] }, []) + D.t(370, 46, 'where it noticed', { cls: 'soft' }) + D.t(370, 96, 'the line that ran', { cls: 'soft' }) + D.t(370, 146, 'what went wrong: start reading here', { cls: 'r' }), 175),
`<h2>The usual suspects</h2>
<table><tr><th>Error</th><th>What it usually means</th></tr>
<tr><td><code>IndexError</code></td><td>You went past the end. Check your loop limits.</td></tr>
<tr><td><code>KeyError</code></td><td>Key not there. Use <code>.get</code>, or check first.</td></tr>
<tr><td><code>TypeError: 'NoneType'...</code></td><td>Something returned nothing. Look for a missing <code>return</code>.</td></tr>
<tr><td><code>IndentationError</code></td><td>Your spaces don't line up.</td></tr>
<tr><td><code>RecursionError</code></td><td>Your base case isn't being reached.</td></tr></table>
<h2>The method when there is no error, only a wrong answer</h2>`,
fig(D.flow({ a: [10, 30, 150, 60, 'Smallest input\nthat fails', 'y'], b: [195, 30, 150, 60, 'Predict each line\non paper'], c: [380, 30, 150, 60, 'Print the real\nvalues'], d: [565, 30, 145, 60, 'First place\nthey differ', 'r'] }, [['a', 'b'], ['b', 'c'], ['c', 'd']]), 110, 'The bug is at the first place that reality differs from your prediction. Changing code at random throws away that information.'),
`<p>Don't change anything until you can explain the failure. If your fix works and you don't know why, you haven't fixed it. You've just hidden it.</p>`,
think('Your function returns the right answer for every input except a list with one item. What should you do first?', 'Run exactly that input and trace it on paper. A loop that never runs or a limit that is off by one shows up immediately on small inputs. Small inputs are the most useful thing you have.')
], core: [
{ id: 'fix-average', title: 'Fix: average', diff: 'Easy', time: 6,
  desc: `<p>This function has <b>two</b> bugs. Don't rewrite it. Find out what's wrong and fix it. It should return the mean of the list, or 0 for an empty list.</p>`,
  ex: [['[2, 4]', '3.0'], ['[]', '0']],
  start: `def average(nums):\n    total = 0\n    for i in range(1, len(nums)):\n        total += nums[i]\n    return total / len(nums)\n`,
  nudge: ['Try the smallest inputs. What does [] do? What does [5] give, and what did you expect?'],
  sol: `def average(nums):\n    if not nums:\n        return 0\n    total = 0\n    for i in range(len(nums)):\n        total += nums[i]\n    return total / len(nums)`, big: 'O(n)', idea: 'Small inputs reveal limits that are off by one.',
  tests: [['average([2, 4])', '3.0'], ['average([])', '0'], ['average([5])', '5.0'], ['average([1, 2, 3])', '2.0']] },
{ id: 'fix-dedupe', title: 'Fix: the shrinking list', diff: 'Easy', time: 8,
  desc: `<p>This should remove all even numbers from a list and return it, but it sometimes leaves some behind. Work out exactly why on the pad, then fix it.</p>`,
  ex: [['[2, 4, 5]', '[5]']],
  start: `def drop_evens(nums):\n    for x in nums:\n        if x % 2 == 0:\n            nums.remove(x)\n    return nums\n`,
  nudge: ['Trace [2, 4, 5] on paper. After removing the 2, what is at position 0? Where does the loop look next?'],
  sol: `def drop_evens(nums):\n    return [x for x in nums if x % 2 != 0]`, big: 'O(n)', idea: 'Never remove items from a list while looping over it. Build a new one.',
  tests: [['drop_evens([2, 4, 5])', '[5]'], ['drop_evens([1, 3])', '[1, 3]'], ['drop_evens([2, 2, 2, 2])', '[]'], ['drop_evens([])', '[]'], ['drop_evens([1, 2, 4, 6, 7])', '[1, 7]']] }
], boss:
{ id: 'fix-binary', title: 'Fix: the search that hangs', diff: 'Medium', time: 12,
  desc: `<p>This finds <code>t</code> in a sorted list and returns its position, or -1. On some inputs it never finishes, and on others it gives the wrong answer. Trace it on small lists and fix it with the fewest changes you can.</p>`,
  ex: [['[1, 3, 5], 5', '2'], ['[1, 3, 5], 4', '-1']],
  start: `def find(a, t):\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] == t:\n            return mid\n        if a[mid] < t:\n            lo = mid\n        else:\n            hi = mid - 1\n    return -1\n`, nudge: [],
  sol: `def find(a, t):\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] == t:\n            return mid\n        if a[mid] < t:\n            lo = mid + 1\n        else:\n            hi = mid\n    return -1`, big: 'O(log n)', idea: 'Decide what your limits mean. Here hi is one past the end, so every update must keep that promise.',
  tests: [['find([1, 3, 5], 5)', '2'], ['find([1, 3, 5], 4)', '-1'], ['find([1, 3, 5], 1)', '0'], ['find([], 1)', '-1'], ['find([1], 1)', '0'], ['find([1, 2], 2)', '1'], ['find([1, 2, 3, 4], 1)', '0'], ['find([1, 2, 3, 4], 3)', '2'], ['find([2, 4], 3)', '-1'], ['find([1, 3], 5)', '-1']] }
});
