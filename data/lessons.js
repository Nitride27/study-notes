// Pattern lessons. body = array of HTML strings or {py, js} code blocks (escaped + shown per selected language).
window.LESSONS = [
{
  id: 'strategy', title: 'Exam game plan (read first)', mins: 10,
  body: [
`<p>Format from your invite: <b>60 minutes</b>, <b>3 MCQs + 2 coding problems</b>, any of Python/JS/Java/C/C++, on <b>your own laptop</b>. Recent candidates reported one easy + one medium problem on arrays, strings, hashmaps, two pointers, stacks and linked lists, with emphasis on time complexity. MCQs touched design patterns, networking, OOP and DSA basics.</p>
<h3>Time split</h3>
<ul>
<li><b>0–5 min:</b> answer the 3 MCQs. Don't spend more than about 90s on any one. Flag it, move on, come back.</li>
<li><b>5–8 min:</b> read <i>both</i> problems. Start with the one you can see the solution to.</li>
<li><b>~20 min</b> for the easier problem, <b>~30 min</b> for the harder one, <b>last 5 min</b> to re-check edge cases.</li>
</ul>
<h3>The 6-step loop for every problem</h3>
<ol>
<li><b>Restate</b> input → output in one sentence. Write 1 tiny example by hand.</li>
<li><b>Read the constraints and pick a target complexity</b> (see the Complexity lesson). n ≤ 10⁵ means you need O(n) or O(n log n).</li>
<li><b>Brute force first, in your head.</b> What is it and what does it cost? Which part is the repeated work?</li>
<li><b>Name the pattern.</b> "Need to find a pair/complement" → hashmap. "Sorted / both ends" → two pointers. "Contiguous subarray/substring" → sliding window or prefix sum. "Matching / nearest greater" → stack.</li>
<li><b>Code it cleanly.</b> Good names, no clever one-liners.</li>
<li><b>Dry-run</b> your example plus the edge cases: empty, single element, all same, negatives, duplicates.</li>
</ol>
<div class="callout"><b>If stuck at 15 min:</b> write the brute force and make it correct. A working O(n²) solution usually scores more than a broken O(n) one. Then optimise if time is left.</div>
<h3>Laptop checklist (do Sunday night)</h3>
<ul>
<li>Python/Node installed and working <b>offline</b>; VS Code opens instantly; no updates pending.</li>
<li>Charger, full battery, power-saving off, notifications off.</li>
<li>Know how to read input if they ask for stdin: <code>input()</code> / <code>sys.stdin</code> in Python, <code>require('fs').readFileSync(0,'utf8')</code> in Node.</li>
</ul>`,
{ py:
`# If the problem gives stdin input instead of a function signature:
import sys
data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1+n]))
print(solve(nums))`,
  js:
`// If the problem gives stdin input instead of a function signature (Node):
const data = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);
const n = data[0];
const nums = data.slice(1, 1 + n);
console.log(solve(nums));` }
  ],
  checks: [
    { q: 'You are 15 minutes into problem 2 with no optimal idea. Best move?', opts: ['Keep thinking until you find the optimal approach', 'Write a correct brute force now, then optimise if time remains', 'Skip it and re-check MCQs', 'Start coding something and debug later'], a: 1, why: 'A correct brute force usually passes several test cases. Partial credit beats an unfinished optimal attempt.' }
  ]
},
{
  id: 'complexity', title: 'Big-O & reading constraints', mins: 15,
  body: [
`<p>Interviewers at Leapfrog reportedly <b>ask about time complexity</b>. You should be able to state it for any code you write, and work backwards from constraints to the complexity you need.</p>
<h3>Constraint → target complexity (≈10⁸ simple ops/sec)</h3>
<table>
<tr><th>n up to</th><th>Target</th><th>Typical technique</th></tr>
<tr><td>10–20</td><td>O(2ⁿ), O(n!)</td><td>backtracking, all subsets</td></tr>
<tr><td>~500</td><td>O(n³)</td><td>triple loop DP</td></tr>
<tr><td>~5,000</td><td>O(n²)</td><td>double loop, 2D DP</td></tr>
<tr><td>10⁵ – 10⁶</td><td>O(n log n) or O(n)</td><td>sorting, hashmap, two pointers, sliding window, heap</td></tr>
<tr><td>10⁹+</td><td>O(log n) or O(1)</td><td>binary search, math</td></tr>
</table>
<h3>Costs you must know</h3>
<ul>
<li>Hashmap/set insert, lookup, delete: <b>O(1)</b> average. Python <code>x in list</code> is <b>O(n)</b>, but <code>x in set</code> is O(1).</li>
<li>Sorting: <b>O(n log n)</b>. Binary search: <b>O(log n)</b>.</li>
<li>Python <code>list.pop(0)</code> / JS <code>arr.shift()</code> are <b>O(n)</b>. Use <code>collections.deque</code>, or an index pointer in JS.</li>
<li>String concatenation in a loop can be O(n²). Build a list and <code>"".join()</code> / <code>arr.join('')</code>.</li>
<li>Slicing <code>s[a:b]</code> / <code>arr.slice()</code> copies: O(k).</li>
<li>Recursion depth uses O(depth) stack space.</li>
</ul>
<h3>Space complexity</h3>
<p>Count the extra memory you allocate, not the input. A hashmap of n items is O(n). A few variables is O(1).</p>`,
{ py:
`# O(n^2): for each i, scan all j
for i in range(n):
    for j in range(i + 1, n):
        ...
# O(n log n): sort, then one pass
nums.sort()
for x in nums: ...
# O(log n): halve the range each step
while lo <= hi:
    mid = (lo + hi) // 2`,
  js:
`// O(n^2): for each i, scan all j
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++) { /* ... */ }
// O(n log n): sort (numbers need a comparator!), then one pass
nums.sort((a, b) => a - b);
// O(log n): halve the range each step
while (lo <= hi) { const mid = (lo + hi) >> 1; }` }
  ],
  checks: [
    { q: 'n ≤ 2·10⁵. Which complexity is acceptable?', opts: ['O(n²)', 'O(n log n)', 'O(2ⁿ)', 'O(n³)'], a: 1, why: '(2·10⁵)² = 4·10¹⁰ operations is far too slow. n log n ≈ 3.5·10⁶ is fine.' },
    { q: 'What is the time complexity of this?\nfor i in range(n):\n    if nums[i] in seen_list: ...\n    seen_list.append(nums[i])', opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'], a: 2, why: '`in` on a list is a linear scan, and it runs inside a loop of n, so O(n²). Use a set to make it O(n).' },
    { q: 'JS: [10, 9, 1].sort() returns?', opts: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', 'Error'], a: 1, why: 'Without a comparator, JS sorts as strings: "1" < "10" < "9". Always write .sort((a,b)=>a-b) for numbers.' }
  ]
},
{
  id: 'hashmap', title: 'Hashing: maps, sets & counting', mins: 15,
  body: [
`<p><b>Idea:</b> trade memory for time. Store what you've seen so "have I seen X?" or "how many X?" costs O(1) instead of a scan.</p>
<h3>Recognise it when…</h3>
<ul><li>You need a <b>pair/complement</b> (a + b = target)</li><li>You need <b>counts/frequencies</b> (anagrams, duplicates, top-k)</li><li>You need to <b>group</b> things by a key (sorted string, signature)</li><li>A brute force has an inner loop that only <i>searches</i> for something</li></ul>
<h3>Templates</h3>`,
{ py:
`# 1) Seen-before / complement
seen = {}                      # value -> index
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i

# 2) Counting
from collections import Counter, defaultdict
cnt = Counter(s)               # {'a': 2, 'b': 1}
cnt = {}
for ch in s:
    cnt[ch] = cnt.get(ch, 0) + 1

# 3) Grouping
groups = defaultdict(list)
for w in words:
    groups[''.join(sorted(w))].append(w)
return list(groups.values())`,
  js:
`// 1) Seen-before / complement
const seen = new Map();          // value -> index
for (let i = 0; i < nums.length; i++) {
  if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
  seen.set(nums[i], i);
}

// 2) Counting
const cnt = new Map();
for (const ch of s) cnt.set(ch, (cnt.get(ch) || 0) + 1);

// 3) Grouping
const groups = new Map();
for (const w of words) {
  const key = [...w].sort().join('');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(w);
}
return [...groups.values()];` },
`<div class="callout"><b>Pitfalls:</b> in JS, use <code>Map</code> rather than plain objects for numeric keys (object keys become strings). Check <code>map.has()</code>, not <code>if (map.get(x))</code>, because index 0 is falsy. In Python, a list can't be a dict key, so use a <code>tuple</code>.</div>`
  ],
  checks: [
    { q: 'In Two Sum, why do we check the complement BEFORE inserting the current number?', opts: ['It is faster', 'So an element is not paired with itself (e.g. target 6, x = 3)', 'Maps cannot hold duplicates', 'No reason, either order works'], a: 1, why: 'If you insert first, x = 3 with target 6 would find itself. Checking first guarantees the pair uses two different indices.' },
    { q: 'Best key to group anagrams ["eat","tea","tan"]?', opts: ['len(word)', 'sorted letters of the word', 'first letter', 'sum of char codes'], a: 1, why: 'All anagrams share the same sorted letters ("aet"). Length and char-sum can collide for non-anagrams, e.g. "ad" and "bc" have equal sums.' }
  ]
},
{
  id: 'twopointers', title: 'Two pointers', mins: 15,
  body: [
`<p><b>Idea:</b> two indices move through the array based on a rule, so you never revisit pairs. That turns O(n²) into O(n).</p>
<h3>Recognise it when…</h3>
<ul><li>Array is <b>sorted</b> (or you can sort it) and you look for pairs/triplets with a sum</li><li>Palindromes, reversing, comparing from <b>both ends</b></li><li>In-place rewriting: remove duplicates, move zeros (slow/fast pointers)</li></ul>
<h3>Templates</h3>`,
{ py:
`# Opposite ends (sorted array, pair sum)
l, r = 0, len(nums) - 1
while l < r:
    s = nums[l] + nums[r]
    if s == target: return [l, r]
    elif s < target: l += 1     # need bigger -> move left up
    else: r -= 1                # need smaller -> move right down

# Slow/fast (in-place compaction): keep non-zeros
w = 0
for x in nums:
    if x != 0:
        nums[w] = x
        w += 1`,
  js:
`// Opposite ends (sorted array, pair sum)
let l = 0, r = nums.length - 1;
while (l < r) {
  const s = nums[l] + nums[r];
  if (s === target) return [l, r];
  else if (s < target) l++;     // need bigger
  else r--;                     // need smaller
}

// Slow/fast (in-place compaction): keep non-zeros
let w = 0;
for (const x of nums) if (x !== 0) nums[w++] = x;` },
`<div class="callout"><b>Why it's correct (exam favourite):</b> when the sum is too small, nums[l] paired with <i>any</i> remaining right element is too small too, because nums[r] is the largest left. So discarding l is safe. That argument is the whole proof.</div>
<p><b>3Sum trick:</b> sort, fix i, run two-pointer on the rest. Skip duplicates with <code>if i &gt; 0 and nums[i] == nums[i-1]: continue</code>.</p>`
  ],
  checks: [
    { q: 'Sorted nums, l and r at ends, nums[l]+nums[r] > target. Move?', opts: ['l += 1', 'r -= 1', 'both', 'restart'], a: 1, why: 'Sum too big, so we need a smaller value. Only moving r left can decrease the sum.' }
  ]
},
{
  id: 'slidingwindow', title: 'Sliding window', mins: 15,
  body: [
`<p><b>Idea:</b> keep a window [left, right] over a <b>contiguous</b> subarray/substring. Expand right every step. Shrink left while the window is invalid. Each index enters and leaves once, so O(n).</p>
<h3>Recognise it when…</h3>
<ul><li>"longest / shortest / count of <b>substring / subarray</b> such that…"</li><li>Condition is monotonic: making the window bigger only makes it "more invalid" (no negatives in sums, distinct chars, at most k changes)</li></ul>
<h3>Template (variable window)</h3>`,
{ py:
`def longest_valid(s):
    window = {}              # state of current window
    left = best = 0
    for right, ch in enumerate(s):
        window[ch] = window.get(ch, 0) + 1          # 1) add right
        while window[ch] > 1:                        # 2) shrink while invalid
            window[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)          # 3) record answer
    return best`,
  js:
`function longestValid(s) {
  const window = new Map();          // state of current window
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    window.set(ch, (window.get(ch) || 0) + 1);       // 1) add right
    while (window.get(ch) > 1) {                     // 2) shrink while invalid
      window.set(s[left], window.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);         // 3) record answer
  }
  return best;
}` },
`<div class="callout"><b>Longest</b> → record after shrinking (window is valid). <b>Shortest</b> → record <i>inside</i> the shrink loop while it's still valid. If the array has negatives, sliding window breaks; use prefix sums + hashmap instead.</div>`
  ],
  checks: [
    { q: 'Subarray sum equals k, with NEGATIVE numbers allowed. Sliding window works?', opts: ['Yes', 'No: adding elements can decrease the sum, so shrink/expand decisions are not monotonic'], a: 1, why: 'Sliding window needs monotonicity. With negatives, use prefix sum + hashmap (count of prefix - k).' }
  ]
},
{
  id: 'stack', title: 'Stack & monotonic stack', mins: 15,
  body: [
`<p><b>Idea:</b> last-in-first-out. Perfect for <b>matching</b> (brackets, tags), <b>undo/nesting</b> (decode strings, paths) and <b>"next greater/smaller element"</b> via a monotonic stack.</p>
<h3>Templates</h3>`,
{ py:
`# Matching brackets
pairs = {')': '(', ']': '[', '}': '{'}
stack = []
for ch in s:
    if ch in pairs:
        if not stack or stack.pop() != pairs[ch]:
            return False
    else:
        stack.append(ch)
return not stack

# Monotonic decreasing stack: next greater element (store indices)
res = [-1] * n
stack = []
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] < x:
        res[stack.pop()] = x       # x is the next greater for that index
    stack.append(i)`,
  js:
`// Matching brackets
const pairs = { ')': '(', ']': '[', '}': '{' };
const stack = [];
for (const ch of s) {
  if (ch in pairs) {
    if (stack.length === 0 || stack.pop() !== pairs[ch]) return false;
  } else stack.push(ch);
}
return stack.length === 0;

// Monotonic decreasing stack: next greater element (store indices)
const res = new Array(n).fill(-1), st = [];
for (let i = 0; i < n; i++) {
  while (st.length && nums[st[st.length - 1]] < nums[i]) res[st.pop()] = nums[i];
  st.push(i);
}` },
`<div class="callout">Each index is pushed once and popped once, so a monotonic stack is <b>O(n)</b> even with the inner while loop. Expect to be asked this.</div>`
  ],
  checks: [
    { q: 'Monotonic stack has a while loop inside a for loop. Complexity?', opts: ['O(n²)', 'O(n)', 'O(n log n)'], a: 1, why: 'Amortised: every element is pushed once and popped at most once, so 2n operations in total.' }
  ]
},
{
  id: 'linkedlist', title: 'Linked lists', mins: 15,
  body: [
`<p>Reported in Leapfrog associate rounds. You must be able to manipulate <code>.next</code> pointers without losing nodes.</p>
<h3>Three tools</h3>
<ul><li><b>Dummy head</b>: avoids special-casing the first node (merge, remove)</li><li><b>Slow/fast pointers</b>: middle, cycle detection, nth from end</li><li><b>Reverse in place</b>: prev / curr / next dance</li></ul>`,
{ py:
`class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

# Reverse
prev, curr = None, head
while curr:
    nxt = curr.next     # 1. save
    curr.next = prev    # 2. flip
    prev = curr         # 3. advance prev
    curr = nxt          # 4. advance curr
return prev

# Middle (slow ends at middle)
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next

# Dummy head
dummy = tail = ListNode()
# ... tail.next = node; tail = tail.next
return dummy.next`,
  js:
`function ListNode(val, next) { this.val = val ?? 0; this.next = next ?? null; }

// Reverse
let prev = null, curr = head;
while (curr) {
  const nxt = curr.next;  // 1. save
  curr.next = prev;       // 2. flip
  prev = curr;            // 3. advance prev
  curr = nxt;             // 4. advance curr
}
return prev;

// Middle
let slow = head, fast = head;
while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }

// Dummy head
const dummy = new ListNode(); let tail = dummy;
// ... tail.next = node; tail = tail.next;
return dummy.next;` },
`<div class="callout">In this portal, linked-list tests are written as arrays like <code>[1,2,3]</code>, but your function receives a real <code>ListNode</code> head and must return a head node.</div>`
  ],
  checks: [
    { q: 'Remove the n-th node from the end in ONE pass. Trick?', opts: ['Count length first', 'Move fast pointer n steps ahead, then move both until fast reaches the end', 'Reverse the list', 'Use a stack'], a: 1, why: 'The gap of n between fast and slow means slow stops right before the target when fast hits the end. Use a dummy head for the case where the head itself is removed.' }
  ]
},
{
  id: 'binarysearch', title: 'Binary search (incl. on the answer)', mins: 15,
  body: [
`<p><b>Idea:</b> if a yes/no condition is <b>monotonic</b> over a range (false…false true…true), you can find the boundary in O(log n). The range doesn't have to be an array. It can be the <i>answer space</i> (speed, capacity, days).</p>`,
{ py:
`# Find first index where cond(i) is True (lo..hi inclusive)
def first_true(lo, hi, cond):
    while lo < hi:
        mid = (lo + hi) // 2
        if cond(mid):
            hi = mid          # mid could be the answer
        else:
            lo = mid + 1      # answer is to the right
    return lo

# Classic search
lo, hi = 0, len(nums) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if nums[mid] == target: return mid
    if nums[mid] < target: lo = mid + 1
    else: hi = mid - 1
return -1`,
  js:
`// Find first index where cond(i) is true (lo..hi inclusive)
function firstTrue(lo, hi, cond) {
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (cond(mid)) hi = mid;      // mid could be the answer
    else lo = mid + 1;            // answer is to the right
  }
  return lo;
}

// Classic search
let lo = 0, hi = nums.length - 1;
while (lo <= hi) {
  const mid = (lo + hi) >> 1;
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
}
return -1;` },
`<div class="callout"><b>Off-by-one rules:</b> with <code>lo &lt; hi</code> and <code>hi = mid</code>, always use <code>lo = mid + 1</code> or you can loop forever. Ask yourself: "Can mid itself be the answer?"</div>`
  ],
  checks: [
    { q: 'Koko: min eating speed to finish piles in h hours. What do we binary search over?', opts: ['Indices of piles', 'Speed from 1 to max(piles)', 'Hours', 'Sorted piles'], a: 1, why: 'If speed k works, any faster speed works too (monotonic). So search for the smallest k in [1, max(piles)].' }
  ]
},
{
  id: 'prefixsum', title: 'Prefix sums', mins: 10,
  body: [
`<p><b>Idea:</b> <code>pre[i]</code> = sum of the first i elements. Then any subarray sum <code>sum(l..r) = pre[r+1] - pre[l]</code> is O(1). Combined with a hashmap it counts subarrays with sum k in O(n), even with negatives.</p>`,
{ py:
`# Count subarrays with sum == k
count, cur = 0, 0
seen = {0: 1}               # empty prefix
for x in nums:
    cur += x
    count += seen.get(cur - k, 0)   # earlier prefix p with cur - p == k
    seen[cur] = seen.get(cur, 0) + 1
return count`,
  js:
`// Count subarrays with sum === k
let count = 0, cur = 0;
const seen = new Map([[0, 1]]);   // empty prefix
for (const x of nums) {
  cur += x;
  count += seen.get(cur - k) || 0;
  seen.set(cur, (seen.get(cur) || 0) + 1);
}
return count;` },
`<div class="callout">Why <code>{0: 1}</code>? It covers subarrays that start at index 0 (the whole prefix equals k).</div>`
  ],
  checks: [
    { q: 'Product of array except self without division: what do you combine?', opts: ['Prefix sums', 'Prefix products from the left × suffix products from the right', 'Sorting', 'A stack'], a: 1, why: 'answer[i] = (product of everything left of i) × (product of everything right of i). Two passes, O(n).' }
  ]
},
{
  id: 'intervals', title: 'Sorting, intervals & greedy', mins: 10,
  body: [
`<p>Many "medium" problems become easy <b>after sorting</b>. For intervals: sort by start, then sweep and merge when <code>start ≤ last_end</code>.</p>`,
{ py:
`intervals.sort(key=lambda x: x[0])
merged = []
for s, e in intervals:
    if merged and s <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], e)
    else:
        merged.append([s, e])
# Custom sort: by length desc, then alphabetically
words.sort(key=lambda w: (-len(w), w))`,
  js:
`intervals.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const [s, e] of intervals) {
  if (merged.length && s <= merged[merged.length - 1][1])
    merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
  else merged.push([s, e]);
}
// Custom sort: by length desc, then alphabetically
words.sort((a, b) => b.length - a.length || a.localeCompare(b));` }
  ],
  checks: [
    { q: 'Merging [1,4] and [4,5]: should they merge?', opts: ['Yes → [1,5]', 'No'], a: 0, why: 'They touch at 4. Most problems (LeetCode 56) treat touching as overlapping, so use <=. Read the statement to be sure.' }
  ]
},
{
  id: 'strings', title: 'String manipulation', mins: 10,
  body: [
`<p>Reported directly by candidates ("array and string manipulation"). Know the syntax cold: char codes, reversing, splitting, building strings efficiently, checking alphanumerics.</p>`,
{ py:
`s[::-1]                     # reverse
s.split()                   # split on whitespace
' '.join(words)             # join
ch.isalnum(), ch.isdigit(), ch.isalpha(), ch.lower()
ord('a'), chr(97)           # 97, 'a'
idx = ord(ch) - ord('a')    # 0..25 bucket
parts = []                  # build string in O(n)
parts.append(x); ''.join(parts)
# expand around center (palindromes)
def expand(l, r):
    while l >= 0 and r < len(s) and s[l] == s[r]:
        l -= 1; r += 1
    return s[l+1:r]`,
  js:
`[...s].reverse().join('')          // reverse
s.trim().split(/\\s+/)             // split on whitespace
words.join(' ')
/[a-z0-9]/i.test(ch)               // alnum check
ch.toLowerCase()
s.charCodeAt(i), String.fromCharCode(97)
const idx = s.charCodeAt(i) - 97;  // 0..25 bucket
const parts = []; parts.push(x); parts.join('');
// expand around center
function expand(l, r) {
  while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
  return s.slice(l + 1, r);
}` }
  ],
  checks: [
    { q: 'Python strings are immutable. s[0] = "x" does what?', opts: ['Changes first char', 'TypeError', 'Creates new string silently'], a: 1, why: "TypeError: 'str' object does not support item assignment. Convert to list(s), modify, then ''.join()." }
  ]
},
{
  id: 'matrix', title: 'Matrix traversal', mins: 10,
  body: [
`<p>2D grids show up as spiral/rotate/search problems. Know how to create a grid correctly and walk 4 directions.</p>`,
{ py:
`rows, cols = len(grid), len(grid[0])
grid2 = [[0] * cols for _ in range(rows)]   # NOT [[0]*cols]*rows (shared rows!)
DIRS = [(1,0), (-1,0), (0,1), (0,-1)]
for dr, dc in DIRS:
    nr, nc = r + dr, c + dc
    if 0 <= nr < rows and 0 <= nc < cols:
        ...
# transpose then reverse rows = rotate 90° clockwise
m = [list(row) for row in zip(*m)]
for row in m: row.reverse()`,
  js:
`const rows = grid.length, cols = grid[0].length;
const grid2 = Array.from({ length: rows }, () => new Array(cols).fill(0)); // NOT fill([])
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
for (const [dr, dc] of DIRS) {
  const nr = r + dr, nc = c + dc;
  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) { /* ... */ }
}` }
  ],
  checks: [
    { q: 'Python: g = [[0]*3]*3; g[0][0] = 1; g is?', opts: ['[[1,0,0],[0,0,0],[0,0,0]]', '[[1,0,0],[1,0,0],[1,0,0]]', 'Error'], a: 1, why: 'All three rows are the SAME list object. Use a comprehension: [[0]*3 for _ in range(3)].' }
  ]
},
{
  id: 'dp', title: 'Dynamic programming basics', mins: 20,
  body: [
`<p><b>Idea:</b> the answer for size n is built from answers to smaller sizes, and those smaller answers repeat. Store them.</p>
<h3>The 4 questions</h3>
<ol><li><b>State:</b> what does <code>dp[i]</code> mean, in words? ("max money robbing houses 0..i")</li><li><b>Transition:</b> how does dp[i] use earlier states? (rob i → nums[i] + dp[i-2]; skip i → dp[i-1])</li><li><b>Base cases:</b> dp[0], dp[1]</li><li><b>Answer:</b> dp[n-1]? max(dp)?</li></ol>`,
{ py:
`# Bottom-up 1D (house robber)
prev2, prev1 = 0, 0
for x in nums:
    prev2, prev1 = prev1, max(prev1, prev2 + x)
return prev1

# Unbounded "min items" (coin change)
dp = [0] + [float('inf')] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
return dp[amount] if dp[amount] != float('inf') else -1

# Top-down with memo
from functools import lru_cache
@lru_cache(None)
def f(i): ...`,
  js:
`// Bottom-up 1D (house robber)
let prev2 = 0, prev1 = 0;
for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
return prev1;

// Unbounded "min items" (coin change)
const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;
for (let a = 1; a <= amount; a++)
  for (const c of coins)
    if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
return dp[amount] === Infinity ? -1 : dp[amount];

// Top-down with memo
const memo = new Map();
function f(i) { if (memo.has(i)) return memo.get(i); /* ... */ }` }
  ],
  checks: [
    { q: 'Climbing stairs (1 or 2 steps). dp[i] = ?', opts: ['dp[i-1] * 2', 'dp[i-1] + dp[i-2]', 'i * (i-1) / 2', 'dp[i-2] + 1'], a: 1, why: 'Your last move was a 1-step (from i-1) or a 2-step (from i-2). The ways add up. It is Fibonacci.' }
  ]
},
{
  id: 'graph', title: 'Grids & graphs: BFS / DFS', mins: 15,
  body: [
`<p>"Number of islands", "rotting oranges", "shortest path in grid". Treat each cell as a node with 4 neighbours. <b>DFS</b> for flood fill / counting components; <b>BFS</b> for the <b>shortest path</b> in unweighted graphs.</p>`,
{ py:
`from collections import deque
def bfs(grid, sr, sc):
    rows, cols = len(grid), len(grid[0])
    q = deque([(sr, sc, 0)])
    seen = {(sr, sc)}
    while q:
        r, c, d = q.popleft()
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and grid[nr][nc] != '#':
                seen.add((nr, nc))          # mark when ENQUEUING
                q.append((nr, nc, d + 1))

def dfs(r, c):                       # flood fill
    if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
        return
    grid[r][c] = '0'                 # mark visited
    dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)`,
  js:
`function bfs(grid, sr, sc) {
  const rows = grid.length, cols = grid[0].length;
  const q = [[sr, sc, 0]]; let head = 0;          // index pointer instead of shift()
  const seen = new Set([sr + ',' + sc]);
  while (head < q.length) {
    const [r, c, d] = q[head++];
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc, key = nr + ',' + nc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen.has(key) && grid[nr][nc] !== '#') {
        seen.add(key); q.push([nr, nc, d + 1]);
      }
    }
  }
}
function dfs(r, c) {                       // flood fill
  if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
  grid[r][c] = '0';
  dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);
}` }
  ],
  checks: [
    { q: 'Shortest number of steps in an unweighted grid: BFS or DFS?', opts: ['DFS', 'BFS'], a: 1, why: 'BFS explores in layers of distance, so the first time it reaches a cell is via a shortest path.' }
  ]
},
{
  id: 'backtracking', title: 'Recursion & backtracking', mins: 15,
  body: [
`<p><b>Idea:</b> build candidates step by step. Choose → recurse → <b>un-choose</b>. Use it for all subsets, permutations and combinations when n is small (≤ 15–20).</p>`,
{ py:
`def subsets(nums):
    res, path = [], []
    def bt(i):
        if i == len(nums):
            res.append(path[:])     # COPY the path!
            return
        path.append(nums[i])        # choose
        bt(i + 1)
        path.pop()                  # un-choose
        bt(i + 1)                   # skip
    bt(0)
    return res`,
  js:
`function subsets(nums) {
  const res = [], path = [];
  function bt(i) {
    if (i === nums.length) { res.push([...path]); return; }  // COPY the path!
    path.push(nums[i]);   // choose
    bt(i + 1);
    path.pop();           // un-choose
    bt(i + 1);            // skip
  }
  bt(0);
  return res;
}` },
`<div class="callout">Most common bug: <code>res.append(path)</code> without copying. Every entry then points to the same (finally empty) list.</div>`
  ],
  checks: [
    { q: 'How many subsets does a set of n elements have?', opts: ['n²', 'n!', '2ⁿ', 'n·2'], a: 2, why: 'Each element is either in or out: 2 choices, n times.' }
  ]
}
];
