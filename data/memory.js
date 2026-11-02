// Exam memory aids: a one-line hook per problem, one reusable skeleton per pattern group, and recall strategy.

// id -> one-line rhythm of the code: say it in your head, then write the code line by line.
window.REV_HOOK = {
  'two-sum': 'need = target − x → need in seen? return : store x',
  'contains-duplicate': 'in seen? True : add',
  'remove-duplicates': 'not seen → add to set + append to out',
  'valid-anagram': '+1 for s, −1 for t, all zero',
  'first-unique-char': 'count everything, then the first with count 1',
  'majority-element': 'count 0 → new candidate. Same → +1, different → −1',
  'top-k-frequent': 'count → buckets[count] → read from high to low',
  'group-anagrams': 'key = sorted(word) → groups[key].append(word)',
  'longest-consecutive': 'start only where x − 1 is missing, then count up',
  'product-except-self': 'left pass writes, right pass multiplies',
  'subarray-sum-k': 'seen = {0: 1}; cur += x; count += seen[cur − k]; seen[cur] += 1',
  'valid-palindrome': 'skip junk, compare lowercase, squeeze inward',
  'valid-palindrome-ii': 'first mismatch → skip left OR skip right',
  'two-sum-sorted': 'too small → l++, too big → r−−',
  'three-sum': 'sort, fix i, two pointers on the rest, skip duplicates',
  'container-water': 'area = min height × width; move the shorter side',
  'trapping-rain': 'the side with the smaller max settles its bar',
  'move-zeroes': 'non-zero → swap into w, w++',
  'sort-colors': '0: swap lo, both ++ · 1: mid++ · 2: swap hi, only hi−−',
  'rotate-array': 'k %= n; reverse all, reverse the first k, reverse the rest',
  'best-time-stock': 'lowest so far; best = price − lowest',
  'longest-substring': 'duplicate inside the window → left = last[ch] + 1',
  'char-replacement': 'window − max_freq > k → shrink',
  'min-subarray-len': 'add right; while sum ≥ target: record, drop left',
  'min-window': 'missing hits 0 → record, then shrink',
  'find-anagrams': 'add the right char, drop char i − m, compare counts',
  'valid-parentheses': 'open → push; close → must match pop; end empty',
  'decode-string': '[ → push (cur, k); ] → cur = prev + cur × n',
  'score-parentheses': '( → push 0; ) → top += max(2v, 1)',
  'eval-rpn': 'operator: b = pop, a = pop, push a op b',
  'daily-temperatures': 'warmer day pops the waiting days: ans[j] = i − j',
  'largest-rectangle': 'append 0; pop taller bars: h × (i − top − 1)',
  'asteroid-collision': 'a negative keeps smashing positive tops while it is alive',
  'min-stack': 'push (x, min(x, top.min))',
  'reverse-list': 'save next, flip, step prev and curr',
  'merge-two-lists': 'dummy; take the smaller; attach the leftover',
  'add-two-numbers': 'while l1 or l2 or carry: digit = sum % 10, carry = sum // 10',
  'middle-node': 'slow 1, fast 2 → slow is the middle',
  'linked-list-cycle': 'slow 1, fast 2 → they meet = cycle',
  'remove-nth': 'dummy; fast n + 1 ahead; slow.next = slow.next.next',
  'palindrome-list': 'middle → reverse the second half → compare',
  'binary-search': 'lo <= hi, mid, ±1',
  'search-rotated': 'which half is sorted? target inside it? go there',
  'koko-bananas': 'lo = 1, hi = max; works → hi = mid, else lo = mid + 1',
  'merge-intervals': 'sort by start; overlap → extend the end with max',
  'fill-cups': 'max(biggest, ceil(total / 2))',
  'longest-palindrome': 'two centers per i, expand while equal',
  'reverse-words': 'split, reverse, join',
  'longest-common-prefix': 'column by column, stop at the first mismatch',
  'string-compression': 'j runs while same; char + count if > 1',
  'find-replace-string': 'mark the matches first, then build left → right',
  'roman-to-int': 'smaller before bigger → subtract',
  'int-to-roman': '13-pair table, while num ≥ value',
  'spiral-matrix': '4 walls: right, down, (left), (up), shrink after each',
  'rotate-image': 'transpose + reverse each row',
  'climbing-stairs': 'a, b = b, a + b',
  'house-robber': 'max(skip, rob + two back)',
  'max-subarray': 'cur = max(x, cur + x); best = max(best, cur)',
  'coin-change': 'dp[a] = min(dp[a], dp[a − c] + 1)',
  'word-break': 'dp[i] = dp[j] and s[j:i] in words',
  'lis': 'dp[i] = max(dp[j] + 1) over smaller j',
  'num-islands': 'find a 1 → count++ → sink its neighbours',
  'rotting-oranges': 'queue all rotten; one layer = one minute',
  'water-jug': 'BFS on totals ±x ±y within 0..x + y',
  'subsets': 'add → recurse → pop → recurse',
  'combination-sum': 'for i from start: add, bt(i, rem − c), pop',
  'min-max-two': 'new best → the old best slides to second',
  'frequent-days': 'Jan 1 weekday (+ the next one if leap year)'
};

// group id -> the reusable code skeleton for that pattern. Memorise these, not 30 separate solutions.
window.REV_SKELETON = {
  hashmap: {
py: `seen = {}                 # or set() / count dict
for i, x in enumerate(nums):
    if WANT(x) in seen:       # lookup BEFORE insert
        return ...
    seen[x] = i               # remember x`,
js: `const seen = new Map();   // or new Set()
for (let i = 0; i < nums.length; i++) {
  const x = nums[i];
  if (seen.has(WANT(x))) return ...;  // lookup BEFORE insert
  seen.set(x, i);
}`},
  prefixsum: {
py: `seen = {0: 1}
cur = 0
for x in nums:
    cur += x
    ans += seen.get(cur - k, 0)
    seen[cur] = seen.get(cur, 0) + 1`,
js: `const seen = new Map([[0, 1]]);
let cur = 0;
for (const x of nums) {
  cur += x;
  ans += seen.get(cur - k) || 0;
  seen.set(cur, (seen.get(cur) || 0) + 1);
}`},
  twopointers: {
py: `l, r = 0, len(a) - 1
while l < r:
    if GOOD(a[l], a[r]):
        return ...
    elif TOO_SMALL:
        l += 1
    else:
        r -= 1`,
js: `let l = 0, r = a.length - 1;
while (l < r) {
  if (GOOD(a[l], a[r])) return ...;
  else if (TOO_SMALL) l++;
  else r--;
}`},
  slidingwindow: {
py: `left = 0
for right, x in enumerate(s):
    ADD(x)
    while BROKEN():            # longest: while invalid
        REMOVE(s[left])        # shortest: while valid (record inside)
        left += 1
    best = max(best, right - left + 1)`,
js: `let left = 0;
for (let right = 0; right < s.length; right++) {
  ADD(s[right]);
  while (BROKEN()) {          // shortest: while valid, record inside
    REMOVE(s[left]); left++;
  }
  best = Math.max(best, right - left + 1);
}`},
  stack: {
py: `stack = []
for i, x in enumerate(a):
    while stack and BEATS(x, a[stack[-1]]):
        j = stack.pop()
        RESOLVE(j, i)          # e.g. ans[j] = i - j
    stack.append(i)`,
js: `const stack = [];
for (let i = 0; i < a.length; i++) {
  while (stack.length && BEATS(a[i], a[stack.at(-1)])) {
    const j = stack.pop();
    RESOLVE(j, i);            // e.g. ans[j] = i - j
  }
  stack.push(i);
}`},
  linkedlist: {
py: `dummy = ListNode(0, head)
slow = fast = head
while fast and fast.next:      # middle / cycle
    slow, fast = slow.next, fast.next.next
prev, curr = None, head        # reverse
while curr:
    nxt = curr.next; curr.next = prev
    prev, curr = curr, nxt`,
js: `const dummy = new ListNode(0, head);
let slow = head, fast = head;
while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
let prev = null, curr = head;   // reverse
while (curr) {
  const nxt = curr.next; curr.next = prev;
  prev = curr; curr = nxt;
}`},
  binarysearch: {
py: `lo, hi = LOW, HIGH
while lo < hi:                 # "first value that works"
    mid = (lo + hi) // 2
    if WORKS(mid):
        hi = mid
    else:
        lo = mid + 1
return lo`,
js: `let lo = LOW, hi = HIGH;
while (lo < hi) {             // "first value that works"
  const mid = Math.floor((lo + hi) / 2);
  if (WORKS(mid)) hi = mid;
  else lo = mid + 1;
}
return lo;`},
  intervals: {
py: `items.sort(key=lambda x: x[0])
out = []
for s, e in items:
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)
    else:
        out.append([s, e])`,
js: `items.sort((a, b) => a[0] - b[0]);
const out = [];
for (const [s, e] of items) {
  if (out.length && s <= out.at(-1)[1]) out.at(-1)[1] = Math.max(out.at(-1)[1], e);
  else out.push([s, e]);
}`},
  strings: {
py: `out = []
i = 0
while i < len(s):
    j = i
    while j < len(s) and SAME(s[j], s[i]):
        j += 1
    out.append(PIECE(s[i:j]))
    i = j
return ''.join(out)`,
js: `const out = [];
let i = 0;
while (i < s.length) {
  let j = i;
  while (j < s.length && SAME(s[j], s[i])) j++;
  out.push(PIECE(s.slice(i, j)));
  i = j;
}
return out.join('');`},
  matrix: {
py: `R, C = len(g), len(g[0])
for r in range(R):
    for c in range(C):
        for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C:
                ...`,
js: `const R = g.length, C = g[0].length;
for (let r = 0; r < R; r++)
  for (let c = 0; c < C; c++)
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C) { /* ... */ }
    }`},
  dp: {
py: `dp = [BASE] * (n + 1)
dp[0] = START
for i in range(1, n + 1):
    for CHOICE in OPTIONS:      # last move / last coin / split point
        dp[i] = BEST(dp[i], dp[i - CHOICE] + COST)
return dp[n]`,
js: `const dp = new Array(n + 1).fill(BASE);
dp[0] = START;
for (let i = 1; i <= n; i++)
  for (const ch of OPTIONS)     // last move / last coin / split point
    dp[i] = BEST(dp[i], dp[i - ch] + COST);
return dp[n];`},
  graph: {
py: `from collections import deque
q = deque(STARTS); seen = set(STARTS); steps = 0
while q:
    for _ in range(len(q)):     # one layer
        node = q.popleft()
        for nxt in NEIGHBOURS(node):
            if nxt not in seen:
                seen.add(nxt); q.append(nxt)
    steps += 1`,
js: `let q = [...STARTS]; const seen = new Set(STARTS); let steps = 0;
while (q.length) {
  const next = [];              // one layer
  for (const node of q)
    for (const nxt of NEIGHBOURS(node))
      if (!seen.has(nxt)) { seen.add(nxt); next.push(nxt); }
  q = next; steps++;
}`},
  backtracking: {
py: `res, path = [], []
def bt(start, STATE):
    if DONE(STATE):
        res.append(path[:])     # COPY
        return
    for i in range(start, len(a)):
        path.append(a[i])
        bt(i + 1, NEW_STATE)    # i to allow reuse
        path.pop()
bt(0, INIT)`,
js: `const res = [], path = [];
function bt(start, state) {
  if (DONE(state)) { res.push([...path]); return; }  // COPY
  for (let i = start; i < a.length; i++) {
    path.push(a[i]);
    bt(i + 1, NEW_STATE);       // i to allow reuse
    path.pop();
  }
}
bt(0, INIT);`},
  complexity: {
py: `best1 = best2 = float('inf')
for x in nums:
    if x < best1:
        best1, best2 = x, best1   # old best slides down
    elif x < best2:
        best2 = x`,
js: `let best1 = Infinity, best2 = Infinity;
for (const x of nums) {
  if (x < best1) { best2 = best1; best1 = x; }  // old best slides down
  else if (x < best2) best2 = x;
}`}
};

// HTML strings (trusted, static).
window.REV_MEMORY = [
  '<b>Memorise ~14 skeletons, not 30 solutions.</b> Each group above has one under "🧩 Skeleton to memorise". In the exam: name the pattern → write the skeleton from memory → fill in the 1–2 lines specific to the problem.',
  '<b>Say the 🔑 hook in your head first</b> (e.g. "need, check, store"). The hook is the order of the lines, so the code follows from it.',
  '<b>Write the steps as comments first</b>, then turn each comment into code underneath. If you blank on syntax, the logic is already on the page and earns partial credit.',
  '<b>Rebuild from the "why", not from memory.</b> If you know WHY (e.g. "move the shorter wall because the taller one can never help"), you can re-derive the code even if you forget it.',
  '<b>Use the same variable names every time:</b> <code>seen</code>, <code>count</code>, <code>l/r</code>, <code>lo/hi/mid</code>, <code>left/right</code>, <code>stack</code>, <code>prev/curr/nxt</code>, <code>dummy/tail</code>, <code>dp</code>, <code>res/path</code>. Familiar names bring the rest of the code back.',
  '<b>Dry-run a tiny example by hand</b> (3–5 elements) after writing. Most bugs are off-by-one (<code>&lt;</code> vs <code>&lt;=</code>, <code>mid ± 1</code>, <code>range(n)</code> vs <code>range(n + 1)</code>), and a 30-second trace finds them.',
  '<b>Practise with active recall:</b> turn on 🙈 Recall mode, read only the title, say the idea + hook out loud, write the code on paper, then open the card and compare. Re-do the ones you missed the next day. Spaced repetition beats re-reading.',
  '<b>Blank in the exam?</b> Write the brute force (nested loops) correctly first, then find the repeated work and swap in the pattern. A correct slow answer still scores.'
];
