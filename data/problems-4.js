// Extra practice: the topics Leapfrog candidates reported most (arrays, strings, hashmap, two pointers, stack, linked list).
window.PROBLEMS = window.PROBLEMS || [];
PROBLEMS.push(
{
  id:'contains-duplicate', title:'Contains Duplicate', diff:'Easy', pattern:'hashmap', time:6,
  desc:`<p>Return <code>true</code> if any value appears at least twice in <code>nums</code>, else <code>false</code>.</p>`,
  examples:[{in:'nums = [1,2,3,1]', out:'true'},{in:'nums = [1,2,3,4]', out:'false'}],
  constraints:['1 ≤ n ≤ 10⁵'],
  fn:{py:'contains_duplicate', js:'containsDuplicate'}, params:['nums'],
  logic:[
    {q:'Three options. Which is O(n) time?', opts:['Double loop comparing pairs','Sort, then compare neighbours','Insert into a set, stop when a value is already there'], a:2, why:'The double loop is O(n²) and sorting is O(n log n). The set approach is O(n) time but uses O(n) space. Mention that trade-off.'},
    {q:'One-liner version in Python?', opts:['len(set(nums)) != len(nums)','set(nums) == nums','nums.count() > 1'], a:0, why:'Duplicates collapse in a set. JS equivalent: new Set(nums).size !== nums.length.'}
  ],
  hints:['What structure remembers what you have seen?','Add each number to a set.','If it is already in the set, return true.'],
  sol:{
py:`def contains_duplicate(nums):
    seen = ⟦set()⟧
    for x in nums:
        if ⟦x in seen⟧:
            return True
        ⟦seen.add(x)⟧
    return False`,
js:`function containsDuplicate(nums) {
  const seen = ⟦new Set()⟧;
  for (const x of nums) {
    if (⟦seen.has(x)⟧) return true;
    ⟦seen.add(x)⟧;
  }
  return false;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'"Seen before?" → set.',
  tests:[[[[1,2,3,1]],true],[[[1,2,3,4]],false],[[[1,1,1,3,3,4,3,2,4,2]],true],[[[7]],false],[[[-1,0,-1]],true]]
},
{
  id:'first-unique-char', title:'First Unique Character in a String', diff:'Easy', pattern:'hashmap', time:8,
  desc:`<p>Return the index of the first character in <code>s</code> that appears exactly once, or <code>-1</code> if none.</p>`,
  examples:[{in:'s = "leetcode"', out:'0'},{in:'s = "loveleetcode"', out:'2'},{in:'s = "aabb"', out:'-1'}],
  constraints:['1 ≤ len ≤ 10⁵','lowercase letters'],
  fn:{py:'first_uniq_char', js:'firstUniqChar'}, params:['s'],
  logic:[
    {q:'Can one left-to-right pass know whether s[i] repeats LATER?', opts:['Yes','No: we need the full counts first, so do two passes'], a:1, why:'Pass 1 counts. Pass 2 finds the first index whose count is 1.'},
    {q:'Complexity of two passes?', opts:['O(n)','O(n²)'], a:0, why:'2n is still O(n). Calling s.count(ch) inside the loop would be O(n²).'}
  ],
  hints:['Count every character first.','Walk again in order.','Return the first index whose count is 1.'],
  sol:{
py:`def first_uniq_char(s):
    count = {}
    for ch in s:
        count[ch] = ⟦count.get(ch, 0) + 1⟧
    for i, ch in enumerate(s):
        if ⟦count[ch] == 1⟧:
            return ⟦i⟧
    return -1`,
js:`function firstUniqChar(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, ⟦(count.get(ch) || 0) + 1⟧);
  for (let i = 0; i < s.length; i++) {
    if (⟦count.get(s[i]) === 1⟧) return ⟦i⟧;
  }
  return -1;
}`},
  complexity:'O(n) time, O(1) space (26 letters)',
  takeaway:'When the answer depends on the whole string, count first, then decide in a second pass.',
  tests:[[["leetcode"],0],[["loveleetcode"],2],[["aabb"],-1],[["z"],0],[["dddccdbba"],8]]
},
{
  id:'roman-to-int', title:'Roman to Integer', diff:'Easy', pattern:'strings', time:10,
  desc:`<p>Convert a Roman numeral to an integer. I=1, V=5, X=10, L=50, C=100, D=500, M=1000. When a smaller symbol comes <b>before</b> a larger one it is subtracted (IV = 4, IX = 9, XL = 40, CM = 900).</p>`,
  examples:[{in:'s = "LVIII"', out:'58'},{in:'s = "MCMXCIV"', out:'1994', why:'M + CM + XC + IV'}],
  constraints:['1 ≤ len ≤ 15','valid numeral in [1, 3999]'],
  fn:{py:'roman_to_int', js:'romanToInt'}, params:['s'],
  logic:[
    {q:'When is a symbol subtracted?', opts:['When the NEXT symbol is larger','When it is I','When it is the first symbol'], a:0, why:'In IV, I < V so subtract 1. In VI, V > I so add.'},
    {q:'So per index: if value(s[i]) < value(s[i+1]), then…', opts:['total −= value(s[i])','total += value(s[i+1]) − value(s[i]) and skip'], a:0, why:'Both work. Subtracting the current symbol and moving on is the simplest.'}
  ],
  hints:['Map each symbol to its value.','Compare each symbol with the next one.','Smaller before larger → subtract, otherwise add.'],
  sol:{
py:`def roman_to_int(s):
    val = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    for i, ch in enumerate(s):
        if i + 1 < len(s) and ⟦val[ch] < val[s[i + 1]]⟧:
            total ⟦-= val[ch]⟧
        else:
            total ⟦+= val[ch]⟧
    return total`,
js:`function romanToInt(s) {
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    if (i + 1 < s.length && ⟦val[s[i]] < val[s[i + 1]]⟧) total ⟦-= val[s[i]]⟧;
    else total ⟦+= val[s[i]]⟧;
  }
  return total;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Look one character ahead to decide how to treat the current one.',
  tests:[[["III"],3],[["LVIII"],58],[["MCMXCIV"],1994],[["IV"],4],[["IX"],9],[["MMXXVI"],2026]]
},
{
  id:'move-zeroes', title:'Move Zeroes', diff:'Easy', pattern:'twopointers', time:10,
  desc:`<p>Move all <code>0</code>s to the end of <code>nums</code> <b>in place</b>, keeping the relative order of the non-zero elements. Return <code>nums</code> (for testing).</p>`,
  examples:[{in:'nums = [0,1,0,3,12]', out:'[1,3,12,0,0]'}],
  constraints:['1 ≤ n ≤ 10⁴'],
  fn:{py:'move_zeroes', js:'moveZeroes'}, params:['nums'],
  logic:[
    {q:'Pointer w = "next slot for a non-zero". When nums[i] != 0…', opts:['swap nums[w] and nums[i], then w += 1','nums[i] = 0','w = i'], a:0, why:'Non-zeros pack to the front in their original order, and zeros get swapped backwards.'},
    {q:'Why does the order of non-zeros stay the same?', opts:['We place them in the order we meet them','Luck'], a:0, why:'i scans left to right, so they are written left to right. This is the slow/fast pointer pattern.'}
  ],
  hints:['Two pointers: a reader i and a writer w.','Each non-zero goes to position w.','Swap so the zeros end up behind.'],
  sol:{
py:`def move_zeroes(nums):
    w = 0
    for i in range(len(nums)):
        if ⟦nums[i] != 0⟧:
            nums[w], nums[i] = ⟦nums[i], nums[w]⟧
            ⟦w += 1⟧
    return nums`,
js:`function moveZeroes(nums) {
  let w = 0;
  for (let i = 0; i < nums.length; i++) {
    if (⟦nums[i] !== 0⟧) {
      [nums[w], nums[i]] = ⟦[nums[i], nums[w]]⟧;
      ⟦w++⟧;
    }
  }
  return nums;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'In-place filtering → slow writer pointer + fast reader pointer.',
  tests:[[[[0,1,0,3,12]],[1,3,12,0,0]],[[[0]],[0]],[[[1,2]],[1,2]],[[[0,0,1]],[1,0,0]],[[[4,0,5,0,0,6]],[4,5,6,0,0,0]]]
},
{
  id:'majority-element', title:'Majority Element', diff:'Easy', pattern:'hashmap', time:10,
  desc:`<p>Return the element that appears more than ⌊n/2⌋ times. It always exists. Follow-up: O(1) extra space.</p>`,
  examples:[{in:'nums = [3,2,3]', out:'3'},{in:'nums = [2,2,1,1,1,2,2]', out:'2'}],
  constraints:['1 ≤ n ≤ 5·10⁴'],
  fn:{py:'majority_element', js:'majorityElement'}, params:['nums'],
  logic:[
    {q:'Easy O(n) approach?', opts:['Count with a hashmap, return the one with count > n/2','Return nums[0]'], a:0, why:'That is O(n) space. Sorting and returning nums[n//2] also works in O(n log n).'},
    {q:'Boyer-Moore voting (O(1) space): keep candidate + count. Same value → count+1, different → count−1. When count hits 0…', opts:['pick the current element as the new candidate','stop'], a:0, why:'The majority outnumbers all others combined, so it survives the cancellations.'}
  ],
  hints:['Think of it as the majority "cancelling out" with the others.','Keep candidate and count.','count == 0 → candidate = x; then count += 1 if x == candidate else −1.'],
  sol:{
py:`def majority_element(nums):
    candidate, count = None, 0
    for x in nums:
        if ⟦count == 0⟧:
            candidate = ⟦x⟧
        count += ⟦1 if x == candidate else -1⟧
    return candidate`,
js:`function majorityElement(nums) {
  let candidate = null, count = 0;
  for (const x of nums) {
    if (⟦count === 0⟧) candidate = ⟦x⟧;
    count += ⟦x === candidate ? 1 : -1⟧;
  }
  return candidate;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Know the hashmap answer, and mention Boyer-Moore as the O(1)-space upgrade.',
  tests:[[[[3,2,3]],3],[[[2,2,1,1,1,2,2]],2],[[[1]],1],[[[6,5,5]],5],[[[-1,-1,2]],-1]]
},
{
  id:'sort-colors', title:'Sort Colors (Dutch flag)', diff:'Medium', pattern:'twopointers', time:18,
  desc:`<p><code>nums</code> holds only 0s, 1s and 2s. Sort it <b>in place in one pass</b> without a library sort. Return <code>nums</code>.</p>`,
  examples:[{in:'nums = [2,0,2,1,1,0]', out:'[0,0,1,1,2,2]'}],
  constraints:['1 ≤ n ≤ 300'],
  fn:{py:'sort_colors', js:'sortColors'}, params:['nums'],
  logic:[
    {q:'Three pointers lo, mid, hi. Invariant: [0..lo) are 0s, [lo..mid) are 1s, (hi..end] are 2s. If nums[mid] == 0…', opts:['swap(lo, mid); lo++; mid++','swap(mid, hi); hi−−','mid++'], a:0, why:'The 0 joins the 0-zone. The value swapped in from lo is a 1 (already checked), so mid can advance.'},
    {q:'If nums[mid] == 2…', opts:['swap(mid, hi); hi−− (do NOT move mid)','swap(mid, hi); mid++'], a:0, why:'The value that arrived from hi is unchecked, so look at it again.'},
    {q:'Loop condition?', opts:['mid < hi','mid <= hi'], a:1, why:'The element at hi is still unclassified until mid passes it.'}
  ],
  hints:['Counting 0s/1s/2s then overwriting works, but takes two passes.','One pass: three pointers lo, mid, hi.','0 → swap with lo; 1 → skip; 2 → swap with hi (and recheck).'],
  sol:{
py:`def sort_colors(nums):
    lo, mid, hi = 0, 0, len(nums) - 1
    while ⟦mid <= hi⟧:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1
            ⟦mid += 1⟧
        elif nums[mid] == 1:
            ⟦mid += 1⟧
        else:
            nums[mid], nums[hi] = ⟦nums[hi], nums[mid]⟧
            ⟦hi -= 1⟧
    return nums`,
js:`function sortColors(nums) {
  let lo = 0, mid = 0, hi = nums.length - 1;
  while (⟦mid <= hi⟧) {
    if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; lo++; ⟦mid++⟧; }
    else if (nums[mid] === 1) ⟦mid++⟧;
    else { [nums[mid], nums[hi]] = ⟦[nums[hi], nums[mid]]⟧; ⟦hi--⟧; }
  }
  return nums;
}`},
  complexity:'O(n) time, O(1) space, one pass',
  takeaway:'Partition into 3 zones with 3 pointers; re-examine anything swapped in from the unknown zone.',
  tests:[[[[2,0,2,1,1,0]],[0,0,1,1,2,2]],[[[2,0,1]],[0,1,2]],[[[0]],[0]],[[[1,1]],[1,1]],[[[2,2,0,0]],[0,0,2,2]],[[[1,2,0,2,1,0,0]],[0,0,0,1,1,2,2]]]
},
{
  id:'rotate-array', title:'Rotate Array', diff:'Medium', pattern:'twopointers', time:15,
  desc:`<p>Rotate <code>nums</code> to the right by <code>k</code> steps, in place with O(1) extra space. Return <code>nums</code>.</p>`,
  examples:[{in:'nums = [1,2,3,4,5,6,7], k = 3', out:'[5,6,7,1,2,3,4]'}],
  constraints:['1 ≤ n ≤ 10⁵','0 ≤ k ≤ 10⁵'],
  fn:{py:'rotate_array', js:'rotateArray'}, params:['nums','k'],
  logic:[
    {q:'k can exceed n. First step?', opts:['k %= n','k = n − k','ignore it'], a:0, why:'Rotating n times is a no-op, so k = 10 with n = 7 is the same as 3.'},
    {q:'Reversal trick for right rotation by k:', opts:['reverse all, then reverse the first k, then reverse the rest','reverse the first k, then the rest','sort'], a:0, why:'[1..7] → [7,6,5,4,3,2,1] → [5,6,7 | 4,3,2,1] → [5,6,7,1,2,3,4]. ✓'}
  ],
  hints:['Normalise k.','Write a helper reverse(l, r) with two pointers.','Reverse whole, first k, remaining.'],
  sol:{
py:`def rotate_array(nums, k):
    n = len(nums)
    k ⟦%= n⟧
    def rev(l, r):
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l, r = ⟦l + 1, r - 1⟧
    rev(0, n - 1)
    rev(0, ⟦k - 1⟧)
    rev(⟦k⟧, n - 1)
    return nums`,
js:`function rotateArray(nums, k) {
  const n = nums.length;
  k ⟦%= n⟧;
  const rev = (l, r) => {
    while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; ⟦l++; r--;¦l++;r--;¦l++, r--;⟧ }
  };
  rev(0, n - 1);
  rev(0, ⟦k - 1⟧);
  rev(⟦k⟧, n - 1);
  return nums;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Rotation = three reversals. Always reduce k modulo n.',
  tests:[[[[1,2,3,4,5,6,7],3],[5,6,7,1,2,3,4]],[[[-1,-100,3,99],2],[3,99,-1,-100]],[[[1,2],3],[2,1]],[[[1],0],[1]],[[[1,2,3],0],[1,2,3]]]
},
{
  id:'min-subarray-len', title:'Minimum Size Subarray Sum', diff:'Medium', pattern:'slidingwindow', time:18,
  desc:`<p>Given <b>positive</b> integers <code>nums</code> and a <code>target</code>, return the minimal length of a contiguous subarray whose sum is ≥ target, or 0 if there is none.</p>`,
  examples:[{in:'target = 7, nums = [2,3,1,2,4,3]', out:'2', why:'[4,3]'},{in:'target = 11, nums = [1,1,1,1,1,1,1,1]', out:'0'}],
  constraints:['1 ≤ n ≤ 10⁵','nums[i] ≥ 1'],
  fn:{py:'min_sub_array_len', js:'minSubArrayLen'}, params:['target','nums'],
  logic:[
    {q:'Why does a sliding window work here (unlike "Subarray Sum Equals K")?', opts:['All numbers are positive, so growing the window always increases the sum','It never works'], a:0, why:'Monotonic: expanding raises the sum and shrinking lowers it.'},
    {q:'This asks for the SHORTEST valid window. Record the answer…', opts:['inside the while-valid shrink loop','after the loop'], a:0, why:'Shrink while sum ≥ target, recording the length each time.'}
  ],
  hints:['Expand right, adding to the sum.','While sum ≥ target: record the length, subtract nums[left], left++.','Return 0 if never recorded.'],
  sol:{
py:`def min_sub_array_len(target, nums):
    left = total = 0
    best = float('inf')
    for right, x in enumerate(nums):
        total += x
        while ⟦total >= target⟧:
            best = ⟦min(best, right - left + 1)⟧
            total -= ⟦nums[left]⟧
            left += 1
    return ⟦0 if best == float('inf') else best⟧`,
js:`function minSubArrayLen(target, nums) {
  let left = 0, total = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (⟦total >= target⟧) {
      best = ⟦Math.min(best, right - left + 1)⟧;
      total -= ⟦nums[left]⟧;
      left++;
    }
  }
  return ⟦best === Infinity ? 0 : best⟧;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Shortest window → record inside the shrink loop.',
  tests:[[[7,[2,3,1,2,4,3]],2],[[4,[1,4,4]],1],[[11,[1,1,1,1,1,1,1,1]],0],[[15,[1,2,3,4,5]],5],[[6,[10,2,3]],1]]
},
{
  id:'find-anagrams', title:'Find All Anagrams in a String', diff:'Medium', pattern:'slidingwindow', time:22,
  desc:`<p>Return all start indices of substrings of <code>s</code> that are anagrams of <code>p</code>, in increasing order.</p>`,
  examples:[{in:'s = "cbaebabacd", p = "abc"', out:'[0,6]'},{in:'s = "abab", p = "ab"', out:'[0,1,2]'}],
  constraints:['1 ≤ |s|, |p| ≤ 3·10⁴','lowercase letters'],
  fn:{py:'find_anagrams', js:'findAnagrams'}, params:['s','p'],
  logic:[
    {q:'Every candidate substring has length |p|. Window type?', opts:['Fixed-size window','Variable window'], a:0, why:'Add the new right char and remove the char that falls out on the left.'},
    {q:'Window is an anagram of p iff…', opts:['its 26 letter counts equal p\'s counts','same first letter','same sum'], a:0, why:'Comparing two arrays of 26 is O(26), which is constant.'},
    {q:'At index i (0-based) with window length m = |p|, which char leaves?', opts:['s[i − m]','s[i − m + 1]','s[0]'], a:0, why:'When i ≥ m, the window is [i−m+1 .. i], so s[i−m] just dropped out.'}
  ],
  hints:['Count p into need[26].','Slide over s maintaining win[26] for the last |p| chars.','Whenever win == need, record start i − m + 1.'],
  sol:{
py:`def find_anagrams(s, p):
    m = len(p)
    need, win = [0] * 26, [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    res = []
    for i, ch in enumerate(s):
        win[ord(ch) - 97] += 1
        if i >= m:
            win[⟦ord(s[i - m]) - 97⟧] -= 1
        if ⟦win == need⟧:
            res.append(⟦i - m + 1⟧)
    return res`,
js:`function findAnagrams(s, p) {
  const m = p.length, need = new Array(26).fill(0), win = new Array(26).fill(0);
  for (const ch of p) need[ch.charCodeAt(0) - 97]++;
  const res = [];
  for (let i = 0; i < s.length; i++) {
    win[s.charCodeAt(i) - 97]++;
    if (i >= m) win[⟦s.charCodeAt(i - m) - 97⟧]--;
    if (⟦win.every((v, j) => v === need[j])¦win.join() === need.join()¦win.join(',') === need.join(',')⟧) res.push(⟦i - m + 1⟧);
  }
  return res;
}`},
  complexity:'O(26·n) = O(n) time, O(1) space',
  takeaway:'Fixed window + count array comparison. In JS, arrays need element-wise comparison (=== compares references).',
  tests:[[["cbaebabacd","abc"],[0,6]],[["abab","ab"],[0,1,2]],[["a","ab"],[]],[["aaaa","aa"],[0,1,2]],[["baa","aa"],[1]]]
},
{
  id:'asteroid-collision', title:'Asteroid Collision', diff:'Medium', pattern:'stack', time:22,
  desc:`<p>Each asteroid moves right (positive) or left (negative) with size |value|. When a right-mover meets a left-mover, the smaller one explodes. Equal sizes both explode. Asteroids moving the same way never meet. Return the final state.</p>`,
  examples:[{in:'asteroids = [5,10,-5]', out:'[5,10]'},{in:'asteroids = [8,-8]', out:'[]'},{in:'asteroids = [10,2,-5]', out:'[10]'}],
  constraints:['2 ≤ n ≤ 10⁴','no zeros'],
  fn:{py:'asteroid_collision', js:'asteroidCollision'}, params:['asteroids'],
  logic:[
    {q:'A collision happens only when…', opts:['stack top > 0 and the new asteroid < 0','any signs differ','new > 0 and top < 0'], a:0, why:'[-2, 1]: the first moves left and the second moves right, so they move apart and never collide.'},
    {q:'The new asteroid a < 0 meets top > 0. If top < |a|…', opts:['pop top and keep checking (a may destroy more)','push a','both explode'], a:0, why:'A big left-mover can destroy several right-movers, so use a while loop.'},
    {q:'When should a be pushed?', opts:['Only if it survived all collisions','Always'], a:0, why:'Use an "alive" flag.'}
  ],
  hints:['The stack holds the surviving asteroids so far.','Collide while top > 0 > a.','Compare sizes: pop / both die / a dies.'],
  sol:{
py:`def asteroid_collision(asteroids):
    stack = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and ⟦stack[-1] > 0⟧:
            if stack[-1] < -a:
                ⟦stack.pop()⟧
            elif ⟦stack[-1] == -a⟧:
                stack.pop()
                alive = False
            else:
                ⟦alive = False⟧
        if alive:
            ⟦stack.append(a)⟧
    return stack`,
js:`function asteroidCollision(asteroids) {
  const stack = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && stack.length && ⟦stack[stack.length - 1] > 0⟧) {
      const top = stack[stack.length - 1];
      if (top < -a) ⟦stack.pop()⟧;
      else if (⟦top === -a⟧) { stack.pop(); alive = false; }
      else ⟦alive = false⟧;
    }
    if (alive) ⟦stack.push(a)⟧;
  }
  return stack;
}`},
  complexity:'O(n) time (each asteroid pushed/popped once), O(n) space',
  takeaway:'Simulations where a new item "cancels" recent items → stack with a while loop.',
  tests:[[[[5,10,-5]],[5,10]],[[[8,-8]],[]],[[[10,2,-5]],[10]],[[[-2,-1,1,2]],[-2,-1,1,2]],[[[1,-2,-2,-2]],[-2,-2,-2]],[[[-2,2,-1,-2]],[-2]]]
},
{
  id:'linked-list-cycle', title:'Linked List Cycle', diff:'Easy', pattern:'linkedlist', time:10,
  desc:`<p>Return <code>true</code> if the linked list has a cycle. Do it with O(1) memory. (Tests are written as <code>[values, pos]</code>, where the tail links back to index <code>pos</code>, and -1 means no cycle. Your function just receives <code>head</code>.)</p>`,
  examples:[{in:'head = [3,2,0,-4], pos = 1', out:'true'},{in:'head = [1], pos = -1', out:'false'}],
  constraints:['0 ≤ n ≤ 10⁴'],
  fn:{py:'has_cycle', js:'hasCycle'}, params:['head'], io:{args:['cycle']},
  logic:[
    {q:'Simple approach with O(n) memory?', opts:['Store visited nodes in a set; seeing one again → cycle','Count to 10⁴'], a:0, why:'This is correct. Then the interviewer asks for O(1) memory.'},
    {q:'Floyd: slow moves 1, fast moves 2. With a cycle…', opts:['fast eventually laps slow and they meet','fast reaches None'], a:0, why:'Inside the cycle the gap shrinks by 1 each step, so they must meet.'},
    {q:'Loop guard?', opts:['while fast and fast.next','while slow'], a:0, why:'fast.next.next would crash if fast.next is None.'}
  ],
  hints:['Two runners at different speeds.','slow = slow.next; fast = fast.next.next.','If they are ever the same node → true. If fast hits the end → false.'],
  sol:{
py:`def has_cycle(head):
    slow = fast = head
    while ⟦fast and fast.next⟧:
        slow = ⟦slow.next⟧
        fast = ⟦fast.next.next⟧
        if ⟦slow is fast¦slow == fast⟧:
            return True
    return False`,
js:`function hasCycle(head) {
  let slow = head, fast = head;
  while (⟦fast && fast.next⟧) {
    slow = ⟦slow.next⟧;
    fast = ⟦fast.next.next⟧;
    if (⟦slow === fast⟧) return true;
  }
  return false;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Floyd\'s tortoise and hare: cycle detection without extra memory.',
  tests:[[[[[3,2,0,-4],1]],true],[[[[1,2],0]],true],[[[[1],-1]],false],[[[[],-1]],false],[[[[1,2,3,4,5],-1]],false],[[[[1],0]],true]]
},
{
  id:'middle-node', title:'Middle of the Linked List', diff:'Easy', pattern:'linkedlist', time:8,
  desc:`<p>Return the middle node of the list. If there are two middle nodes, return the <b>second</b> one. (The result is shown as the list from that node onward.)</p>`,
  examples:[{in:'head = [1,2,3,4,5]', out:'[3,4,5]'},{in:'head = [1,2,3,4,5,6]', out:'[4,5,6]'}],
  constraints:['1 ≤ n ≤ 100'],
  fn:{py:'middle_node', js:'middleNode'}, params:['head'], io:{args:['list'], ret:'list'},
  logic:[
    {q:'When fast (2 steps) reaches the end, slow (1 step) is at…', opts:['the middle','the end','a quarter'], a:0, why:'It has travelled half the distance.'},
    {q:'With guard "while fast and fast.next", for even length slow ends on…', opts:['the second middle','the first middle'], a:0, why:'That matches this problem. "while fast.next and fast.next.next" would give the first middle, which is what you need when splitting a list in half.'}
  ],
  hints:['slow and fast both start at head.','Advance slow by 1, fast by 2.','Return slow.'],
  sol:{
py:`def middle_node(head):
    slow = fast = head
    while ⟦fast and fast.next⟧:
        slow, fast = ⟦slow.next, fast.next.next⟧
    return ⟦slow⟧`,
js:`function middleNode(head) {
  let slow = head, fast = head;
  while (⟦fast && fast.next⟧) { slow = ⟦slow.next⟧; fast = ⟦fast.next.next⟧; }
  return ⟦slow⟧;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Middle of a list in one pass → slow/fast pointers.',
  tests:[[[[1,2,3,4,5]],[3,4,5]],[[[1,2,3,4,5,6]],[4,5,6]],[[[1]],[1]],[[[1,2]],[2]]]
},
{
  id:'palindrome-list', title:'Palindrome Linked List', diff:'Easy', pattern:'linkedlist', time:18,
  desc:`<p>Return <code>true</code> if the linked list reads the same forwards and backwards. Follow-up: O(n) time and <b>O(1)</b> space.</p>`,
  examples:[{in:'head = [1,2,2,1]', out:'true'},{in:'head = [1,2]', out:'false'}],
  constraints:['0 ≤ n ≤ 10⁵'],
  fn:{py:'is_palindrome_list', js:'isPalindromeList'}, params:['head'], io:{args:['list']},
  logic:[
    {q:'Easiest correct approach?', opts:['Copy values into an array, then two-pointer check: O(n) space','Impossible without recursion'], a:0, why:'Give this first in an interview, then upgrade it.'},
    {q:'O(1) space plan?', opts:['Find the middle (slow/fast), reverse the second half, compare the two halves','Sort the list'], a:0, why:'This combines two linked-list tools you already know: middle and reverse.'},
    {q:'For odd length [1,2,3,2,1], the reversed second half starts at 3. Does the comparison still work?', opts:['Yes: compare while the right pointer is not None; the middle compares with itself','No'], a:0, why:'The first half still links to 3, so both sides reach 3 and it matches itself.'}
  ],
  hints:['Find the middle with slow/fast.','Reverse from slow to the end (prev/curr/nxt).','Walk from head and from the reversed head, comparing values.'],
  sol:{
py:`def is_palindrome_list(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev = None                      # reverse second half
    while slow:
        nxt = slow.next
        slow.next = ⟦prev⟧
        prev = ⟦slow⟧
        slow = ⟦nxt⟧
    left, right = head, ⟦prev⟧
    while right:
        if ⟦left.val != right.val⟧:
            return False
        left, right = left.next, right.next
    return True`,
js:`function isPalindromeList(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  let prev = null;                   // reverse second half
  while (slow) {
    const nxt = slow.next;
    slow.next = ⟦prev⟧;
    prev = ⟦slow⟧;
    slow = ⟦nxt⟧;
  }
  let left = head, right = ⟦prev⟧;
  while (right) {
    if (⟦left.val !== right.val⟧) return false;
    left = left.next; right = right.next;
  }
  return true;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Hard-looking list problems are often "middle + reverse + compare" combined.',
  tests:[[[[1,2,2,1]],true],[[[1,2]],false],[[[1]],true],[[[1,2,3,2,1]],true],[[[1,2,3,1]],false],[[[]],true]]
},
{
  id:'string-compression', title:'String Compression (run-length)', diff:'Medium', pattern:'strings', time:15,
  desc:`<p>Compress <code>s</code> by replacing each run of a repeated character with the character followed by the run length. Runs of length 1 get no number. Example: <code>"aabcccccaaa"</code> → <code>"a2bc5a3"</code>.</p>`,
  examples:[{in:'s = "aabcccccaaa"', out:'"a2bc5a3"'},{in:'s = "abbbbbbbbbbbb"', out:'"ab12"'}],
  constraints:['0 ≤ len ≤ 2000'],
  fn:{py:'compress_string', js:'compressString'}, params:['s'],
  logic:[
    {q:'How do you find the end of the run starting at i?', opts:['Move j forward while s[j] == s[i]','Use split()'], a:0, why:'The run length is j − i. Then continue from i = j.'},
    {q:'Run of length 12. What do we append?', opts:['the char then "12"','the char then "1","2" separately as numbers'], a:0, why:'str(12) = "12". Multi-digit counts are the classic edge case.'},
    {q:'Why build a list and join instead of result += ...?', opts:['String += in a loop can be O(n²)','Style only'], a:0, why:'Strings are immutable, so each += may copy. Use a list and join once.'}
  ],
  hints:['Outer pointer i at the start of each run.','Inner pointer j finds where the run ends.','Append char, and the count if > 1.'],
  sol:{
py:`def compress_string(s):
    res = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and ⟦s[j] == s[i]⟧:
            j += 1
        res.append(s[i])
        if ⟦j - i > 1⟧:
            res.append(⟦str(j - i)⟧)
        i = ⟦j⟧
    return ''.join(res)`,
js:`function compressString(s) {
  const res = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && ⟦s[j] === s[i]⟧) j++;
    res.push(s[i]);
    if (⟦j - i > 1⟧) res.push(⟦String(j - i)¦(j - i).toString()¦'' + (j - i)⟧);
    i = ⟦j⟧;
  }
  return res.join('');
}`},
  complexity:'O(n) time, O(n) output',
  takeaway:'Group consecutive runs with an inner while loop. Build strings with a list and join.',
  tests:[[["aabcccccaaa"],"a2bc5a3"],[["a"],"a"],[["abbbbbbbbbbbb"],"ab12"],[[""],""],[["aaa"],"a3"],[["abc"],"abc"]]
},
{
  id:'int-to-roman', title:'Integer to Roman', diff:'Medium', pattern:'strings', time:15,
  desc:`<p>Convert an integer <code>num</code> to a Roman numeral. I=1, V=5, X=10, L=50, C=100, D=500, M=1000, plus the six subtractive forms IV=4, IX=9, XL=40, XC=90, CD=400, CM=900. (Reported in Leapfrog rounds, together with Roman to Integer.)</p>`,
  examples:[{in:'num = 58', out:'"LVIII"', why:'L + V + III'},{in:'num = 1994', out:'"MCMXCIV"', why:'M + CM + XC + IV'}],
  constraints:['1 ≤ num ≤ 3999'],
  fn:{py:'int_to_roman', js:'intToRoman'}, params:['num'],
  logic:[
    {q:'How do you handle 4, 9, 40, 900…?', opts:['Put them in the value table next to the normal symbols, so they are just more symbols','Special-case each digit with if/else','Build the string and fix it afterwards'], a:0, why:'With 13 (value, symbol) pairs sorted large→small, no special cases are needed.'},
    {q:'Greedy step: for each (value, symbol) from largest to smallest…', opts:['while num >= value: append symbol, num -= value','if num == value: append symbol','append symbol once, then move on'], a:0, why:'Take the biggest symbol that fits, as many times as it fits, then move to the next one.'}
  ],
  hints:['List the 13 values from 1000 down to 1, including 900, 400, 90, 40, 9, 4.','Take the biggest value that still fits.','Repeat until num is 0.'],
  sol:{
py:`def int_to_roman(num):
    pairs = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
             (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
    out = []
    for value, sym in pairs:
        while ⟦num >= value⟧:
            out.append(sym)
            num ⟦-= value⟧
    return ''.join(out)`,
js:`function intToRoman(num) {
  const pairs = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
                 [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [value, sym] of pairs) {
    while (⟦num >= value⟧) {
      out += sym;
      num ⟦-= value⟧;
    }
  }
  return out;
}`},
  complexity:'O(1): the output is at most 15 characters',
  takeaway:'Put the awkward cases (IV, IX, …) into the lookup table, then a plain greedy loop works.',
  tests:[[[3],"III"],[[4],"IV"],[[9],"IX"],[[58],"LVIII"],[[1994],"MCMXCIV"],[[3749],"MMMDCCXLIX"],[[3999],"MMMCMXCIX"]]
},
{
  id:'fill-cups', title:'Minimum Amount of Time to Fill Cups', diff:'Easy', pattern:'strategy', time:15,
  desc:`<p>A water dispenser fills cold, warm and hot water. Every second you can fill either <b>2 cups of different types</b> or <b>1 cup</b> of any type. <code>amount[i]</code> is how many cups of type i you need. Return the minimum number of seconds to fill all cups. (Reported in Leapfrog rounds.)</p>`,
  examples:[{in:'amount = [1,4,2]', out:'4', why:'Pair the biggest pile with another every second: (0,1) (1,2) (1,2) (1)'},{in:'amount = [5,0,0]', out:'5', why:'Only one type, so one cup per second'}],
  constraints:['amount.length == 3','0 ≤ amount[i] ≤ 100'],
  fn:{py:'fill_cups', js:'fillCups'}, params:['amount'],
  logic:[
    {q:'Each second, which two types should you fill?', opts:['The two with the most cups left','The two with the fewest left','Any two'], a:0, why:'Pairing from the biggest piles stops one type from being left over alone at the end.'},
    {q:'Shortcut: the answer is always…', opts:['max(largest pile, ceil(total / 2))','total / 3','largest pile'], a:0, why:'You fill at most 2 per second (so at least total/2 seconds), and the largest type needs one second per cup. Greedy always reaches the larger of the two.'}
  ],
  hints:['Sort descending each second.','Take one from the largest, and one from the second largest if it is > 0.','Or skip the simulation: max(max(amount), (sum + 1) // 2).'],
  sol:{
py:`def fill_cups(amount):
    a = list(amount)
    seconds = 0
    while True:
        a.sort(reverse=True)
        if ⟦a[0] == 0⟧:
            return seconds
        a[0] -= 1
        if ⟦a[1] > 0⟧:
            a[1] -= 1
        seconds += 1`,
js:`function fillCups(amount) {
  const a = [...amount];
  let seconds = 0;
  while (true) {
    a.sort((x, y) => y - x);
    if (⟦a[0] === 0⟧) return seconds;
    a[0]--;
    if (⟦a[1] > 0⟧) a[1]--;
    seconds++;
  }
}`},
  complexity:'O(total) for the simulation, or O(1) with the formula',
  takeaway:'Greedy: always pair the two biggest piles. Answer = max(biggest pile, ceil(total / 2)).',
  tests:[[[[1,4,2]],4],[[[5,4,4]],7],[[[5,0,0]],5],[[[0,0,0]],0],[[[3,3,3]],5],[[[100,1,1]],100],[[[0,2,2]],2]]
},
{
  id:'water-jug', title:'Water and Jug Problem', diff:'Medium', pattern:'graph', time:20,
  desc:`<p>You have two jugs holding <code>x</code> and <code>y</code> litres and unlimited water. You can fill a jug completely, empty a jug, or pour one jug into the other until one is empty or the other is full. Return <code>true</code> if you can end up with exactly <code>target</code> litres in total across the two jugs. (Reported in Leapfrog rounds.)</p>`,
  examples:[{in:'x = 3, y = 5, target = 4', out:'true', why:'Fill 5, pour into 3 (leaves 2), empty 3, pour the 2 in, fill 5, top up the 3, leaving 4'},{in:'x = 2, y = 6, target = 5', out:'false', why:'Every amount you can make is even'}],
  constraints:['1 ≤ x, y, target ≤ 1000'],
  fn:{py:'can_measure_water', js:'canMeasureWater'}, params:['x','y','target'],
  logic:[
    {q:'Model it as a graph. A simple choice of state is…', opts:['The total water in both jugs (0 … x+y)','Only the water in jug x','The number of moves'], a:0, why:'Every useful operation changes the total by +x, −x, +y or −y, so you can BFS over totals.'},
    {q:'BFS from 0: next states are cur ± x and cur ± y, kept only if…', opts:['0 ≤ next ≤ x + y and not seen','next > 0','next ≤ target'], a:0, why:'The total can never be negative or exceed both jugs full. "seen" stops infinite loops.'}
  ],
  hints:['If target > x + y, it is impossible.','BFS over the total amount, starting at 0.','Math shortcut: possible iff target ≤ x + y and target % gcd(x, y) == 0.'],
  sol:{
py:`from collections import deque

def can_measure_water(x, y, target):
    if target > x + y:
        return False
    seen = {0}
    q = deque([0])
    while q:
        cur = q.popleft()
        if cur == target:
            return True
        for d in (x, -x, y, -y):
            nxt = cur + d
            if ⟦0 <= nxt <= x + y⟧ and nxt not in seen:
                seen.add(nxt)
                q.append(nxt)
    return False`,
js:`function canMeasureWater(x, y, target) {
  if (target > x + y) return false;
  const seen = new Set([0]);
  const q = [0];
  while (q.length) {
    const cur = q.shift();
    if (cur === target) return true;
    for (const d of [x, -x, y, -y]) {
      const nxt = cur + d;
      if (⟦nxt >= 0 && nxt <= x + y⟧ && !seen.has(nxt)) {
        seen.add(nxt);
        q.push(nxt);
      }
    }
  }
  return false;
}`},
  complexity:'O(x + y) time and space with BFS, or O(log min(x, y)) with gcd',
  takeaway:'Turn a puzzle into a graph: states + moves, then BFS. The math answer is target ≤ x+y and target % gcd(x, y) == 0.',
  tests:[[[3,5,4],true],[[2,6,5],false],[[1,2,3],true],[[1,1,12],false],[[6,9,3],true],[[4,6,7],false],[[34,5,6],true]]
},
// ===================== FROM THE LATEST LEAPFROG RESEARCH =====================
{
  id:'find-replace-string', title:'Find And Replace in String', diff:'Medium', pattern:'strings', time:20,
  desc:`<p>You get a string <code>s</code> and three equal-length arrays <code>indices</code>, <code>sources</code>, <code>targets</code>. For each k: if <code>sources[k]</code> occurs in the <b>original</b> <code>s</code> starting exactly at <code>indices[k]</code>, replace it with <code>targets[k]</code>; otherwise do nothing. All replacements happen at the same time and never overlap. Return the result. (A Glassdoor reviewer reported a "find and replace a string" question similar to this LeetCode problem.)</p>`,
  examples:[{in:'s = "abcd", indices = [0,2], sources = ["a","cd"], targets = ["eee","ffff"]', out:'"eeebffff"', why:'"a" matches at 0 and "cd" matches at 2'},{in:'s = "abcd", indices = [0,2], sources = ["ab","ec"], targets = ["eee","ffff"]', out:'"eeecd"', why:'"ec" does not match at 2, so that part stays'}],
  constraints:['1 ≤ s.length ≤ 1000','indices are distinct and may be UNSORTED','replacements never overlap'],
  fn:{py:'find_replace_string', js:'findReplaceString'}, params:['s','indices','sources','targets'],
  logic:[
    {q:'Why is replacing one at a time on s (s = s.replace(...)) wrong?', opts:['Each replacement changes the length, so the later indices point to the wrong place','replace() is too slow','Strings are immutable so it errors'], a:0, why:'The indices refer to the ORIGINAL string. After one replacement everything to its right shifts.'},
    {q:'How do you check that sources[k] matches at indices[k]?', opts:['s.startswith(src, i) / s.startsWith(src, i)','src in s','s.index(src) == i'], a:0, why:'"src in s" finds it anywhere, and index() only finds the FIRST occurrence. You need a match at exactly position i.'},
    {q:'The indices may be unsorted. Simplest fix?', opts:['Store valid matches in a map: index → k, then walk s left to right','Sort the strings alphabetically','Process them in the given order'], a:0, why:'Walking s once with a lookup map handles any order: at position i, either emit a target and jump ahead, or copy s[i].'},
    {q:'At position i with a valid match k, what do you do?', opts:['Append targets[k], then i += len(sources[k])','Append targets[k], then i += 1','Append s[i], then i += len(targets[k])'], a:0, why:'Skip over the source text you replaced. Otherwise you would copy part of it too.'}
  ],
  hints:['Indices refer to the original string, so never modify s as you go.','First build match = {indices[k]: k} only for the ones where s starts with sources[k] at that index.','Walk i from 0: if i is in match, append the target and jump past the source; else append s[i] and step by 1.'],
  sol:{
py:`def find_replace_string(s, indices, sources, targets):
    match = {}  # index -> k, only for the ones that really match
    for k, i in enumerate(indices):
        if ⟦s.startswith(sources[k], i)⟧:
            match[i] = k
    out = []
    i = 0
    while i < len(s):
        if ⟦i in match⟧:
            k = match[i]
            out.append(⟦targets[k]⟧)
            i += ⟦len(sources[k])⟧
        else:
            out.append(s[i])
            i += 1
    return ''.join(out)`,
js:`function findReplaceString(s, indices, sources, targets) {
  const match = new Map(); // index -> k, only for the ones that really match
  indices.forEach((i, k) => {
    if (⟦s.startsWith(sources[k], i)⟧) match.set(i, k);
  });
  const out = [];
  let i = 0;
  while (i < s.length) {
    if (⟦match.has(i)⟧) {
      const k = match.get(i);
      out.push(⟦targets[k]⟧);
      i += ⟦sources[k].length⟧;
    } else {
      out.push(s[i]);
      i++;
    }
  }
  return out.join('');
}`},
  complexity:'O(n + total length of sources) time, O(n) for the output',
  takeaway:'When edits refer to positions in the original string, never edit in place. Record what to do at each index, then build a new string in one left-to-right pass.',
  tests:[[["abcd",[0,2],["a","cd"],["eee","ffff"]],"eeebffff"],[["abcd",[0,2],["ab","ec"],["eee","ffff"]],"eeecd"],[["vmokgggqzp",[3,5,1],["kg","ggq","mo"],["s","so","bfr"]],"vbfrssozp"],[["abc",[1],["x"],["y"]],"abc"],[["abc",[0],["abc"],[""]],""],[["aaa",[0,2],["a","a"],["bb","cc"]],"bbacc"]]
},
{
  id:'two-sum-sorted', title:'Two Sum II (sorted input)', diff:'Medium', pattern:'twopointers', time:12,
  desc:`<p><code>numbers</code> is sorted in non-decreasing order. Return the <b>1-indexed</b> positions <code>[i, j]</code> (i &lt; j) of the two numbers that add up to <code>target</code>. Exactly one solution exists. Use <b>O(1) extra space</b>. (This is the usual follow-up to Two Sum, which a Glassdoor reviewer said was asked together with follow-up questions.)</p>`,
  examples:[{in:'numbers = [2,7,11,15], target = 9', out:'[1,2]', why:'2 + 7 = 9, and positions are 1-indexed'},{in:'numbers = [2,3,4], target = 6', out:'[1,3]'}],
  constraints:['2 ≤ n ≤ 3·10⁴','sorted ascending','O(1) extra space'],
  fn:{py:'two_sum_sorted', js:'twoSumSorted'}, params:['numbers','target'],
  logic:[
    {q:'The hashmap Two Sum uses O(n) space. What does sorting let you do instead?', opts:['Two pointers from both ends, using O(1) space','Binary search for every element in O(n²)','Nothing: you still need a hashmap'], a:0, why:'With sorted data, you know which way to move to make the sum bigger or smaller.'},
    {q:'sum = numbers[l] + numbers[r] is TOO SMALL. Move…', opts:['l right (l += 1)','r left (r -= 1)','both'], a:0, why:'Only moving l right can increase the sum, because the array is sorted.'},
    {q:'Why can we safely discard numbers[l] when the sum is too small?', opts:['Even paired with the LARGEST remaining value it is too small, so it pairs with nothing','Because it is a duplicate','Because l < r'], a:0, why:'numbers[r] is the biggest candidate left. If that pair is still too small, numbers[l] is useless.'}
  ],
  hints:['l = 0, r = n − 1.','Compare the sum with the target: too small → l++, too big → r−−.','Return [l + 1, r + 1], since the answer is 1-indexed.'],
  sol:{
py:`def two_sum_sorted(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        total = numbers[l] + numbers[r]
        if total == target:
            return [⟦l + 1⟧, ⟦r + 1⟧]
        if ⟦total < target⟧:
            l += 1
        else:
            ⟦r -= 1⟧
    return []`,
js:`function twoSumSorted(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const total = numbers[l] + numbers[r];
    if (total === target) return [⟦l + 1⟧, ⟦r + 1⟧];
    if (⟦total < target⟧) l++;
    else ⟦r--¦r -= 1⟧;
  }
  return [];
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Two Sum follow-ups: unsorted → hashmap; sorted → two pointers in O(1) space; all pairs or triples → sort, then 3Sum-style two pointers.',
  tests:[[[[2,7,11,15],9],[1,2]],[[[2,3,4],6],[1,3]],[[[-1,0],-1],[1,2]],[[[1,2,3,4,4,9,56,90],8],[4,5]],[[[5,25,75],100],[2,3]],[[[0,0,3,4],0],[1,2]]]
},
{
  id:'min-stack', title:'Min Stack', diff:'Medium', pattern:'stack', time:15,
  desc:`<p>Design a stack that supports <code>push(x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code>, <b>all in O(1)</b>. You receive a list of operations <code>ops</code> and their arguments <code>vals</code> (this is LeetCode's input format). Return a list with one entry per operation: <code>None</code>/<code>null</code> for push and pop, and the value for top and getMin. pop, top and getMin are only called on a non-empty stack.</p>`,
  examples:[{in:'ops = ["push","push","push","getMin","pop","top","getMin"], vals = [[-2],[0],[-3],[],[],[],[]]', out:'[null,null,null,-3,null,0,-2]', why:'After popping −3, the minimum goes back to −2'}],
  constraints:['up to 3·10⁴ operations','every operation must be O(1)'],
  fn:{py:'min_stack', js:'minStack'}, params:['ops','vals'],
  logic:[
    {q:'Keeping one "current min" variable breaks when…', opts:['You pop the minimum: what was the min before it?','You push a bigger value','The stack is empty'], a:0, why:'After popping the minimum you would need to rescan the whole stack, which is O(n).'},
    {q:'Fix: alongside every value, store…', opts:['The minimum of the stack up to and including that value','The index of the value','The maximum'], a:0, why:'Push (x, min(x, previous min)). Then the top pair always knows the current minimum, even after pops.'},
    {q:'push(x) on a non-empty stack stores which min?', opts:['min(x, stack[-1].min)','x','stack[0].min'], a:0, why:'The new minimum is the smaller of x and the minimum just below it.'}
  ],
  hints:['Each stack entry is a pair: (value, min so far).','push: the new min is x if the stack is empty, else min(x, top.min).','top → the top pair’s value; getMin → the top pair’s min; pop → just pop the pair.'],
  sol:{
py:`def min_stack(ops, vals):
    st = []  # pairs (value, min so far)
    out = []
    for op, args in zip(ops, vals):
        if op == 'push':
            x = args[0]
            cur_min = x if not st else ⟦min(x, st[-1][1])⟧
            st.append(⟦(x, cur_min)⟧)
            out.append(None)
        elif op == 'pop':
            st.pop()
            out.append(None)
        elif op == 'top':
            out.append(⟦st[-1][0]⟧)
        else:  # getMin
            out.append(⟦st[-1][1]⟧)
    return out`,
js:`function minStack(ops, vals) {
  const st = []; // pairs [value, min so far]
  const out = [];
  ops.forEach((op, i) => {
    if (op === 'push') {
      const x = vals[i][0];
      const curMin = st.length === 0 ? x : ⟦Math.min(x, st[st.length - 1][1])⟧;
      st.push(⟦[x, curMin]⟧);
      out.push(null);
    } else if (op === 'pop') {
      st.pop();
      out.push(null);
    } else if (op === 'top') {
      out.push(⟦st[st.length - 1][0]⟧);
    } else { // getMin
      out.push(⟦st[st.length - 1][1]⟧);
    }
  });
  return out;
}`},
  complexity:'O(1) per operation, O(n) space',
  takeaway:'To answer "min/max so far" in O(1) on a stack, store the running min next to every element. Popping then restores the old min automatically.',
  tests:[[[["push","push","push","getMin","pop","top","getMin"],[[-2],[0],[-3],[],[],[],[]]],[null,null,null,-3,null,0,-2]],[[["push","push","getMin","push","getMin","pop","getMin","top"],[[2],[2],[],[1],[],[],[],[]]],[null,null,2,null,1,null,2,2]],[[["push","getMin","top"],[[5],[],[]]],[null,5,5]],[[["push","push","pop","getMin"],[[1],[0],[],[]]],[null,null,null,1]]]
},
// ===================== REPORTED ON r/technepal + GLASSDOOR (Chrome research, 1 Nov 2026) =====================
{
  id:'min-max-two', title:'Two Smallest and Two Largest in an Array', diff:'Easy', pattern:'complexity', time:12,
  desc:`<p>Given an array <code>nums</code> (length ≥ 2), return <code>[smallest, second smallest, second largest, largest]</code> in <b>one pass</b>, without sorting. Duplicates count as separate elements, so the answer equals <code>[sorted[0], sorted[1], sorted[n-2], sorted[n-1]]</code>. (A 2026 r/technepal comment says Leapfrog "always asks" the two smallest and two largest; another candidate was asked for the second largest and its time complexity.)</p>`,
  examples:[{in:'nums = [3,1,4,1,5,9,2,6]', out:'[1,1,6,9]', why:'The two 1s are both counted'},{in:'nums = [5,2]', out:'[2,5,2,5]'}],
  constraints:['2 ≤ n ≤ 10⁵','no sorting: O(n) time, O(1) space'],
  fn:{py:'min_max_two', js:'minMaxTwo'}, params:['nums'],
  logic:[
    {q:'Sorting and reading the ends works. Why might the interviewer reject it?', opts:['It is O(n log n), and a single pass is O(n)','It gives wrong answers','It uses recursion'], a:0, why:'They specifically ask about time complexity. One pass with four variables is O(n) time and O(1) space.'},
    {q:'You track largest l1 and second largest l2. A new x > l1 arrives. Update?', opts:['l2 = l1, then l1 = x','l1 = x only','l2 = x'], a:0, why:'The old largest becomes the second largest. Forgetting to shift it down is the classic bug.'},
    {q:'x is not bigger than l1 but is bigger than l2. Update?', opts:['l2 = x','l1 = x','nothing'], a:0, why:'x slots in between, so it replaces only the second largest.'},
    {q:'Follow-up: "second largest DISTINCT value" for [5,5,3]. What changes?', opts:['Skip x when x == l1, so the answer is 3, not 5','Nothing','Sort first'], a:0, why:'Use elif x < l1 and x > l2 (strict), and start l2 at −∞. If l2 is still −∞ at the end, no such value exists.'}
  ],
  hints:['Start the smallest pair at +∞ and the largest pair at −∞.','For each x: if x < s1, shift s1 into s2 and set s1 = x; elif x < s2, set s2 = x.','Mirror that for the largest pair.'],
  sol:{
py:`def min_max_two(nums):
    s1 = s2 = float('inf')    # s1 <= s2
    l1 = l2 = float('-inf')   # l1 >= l2
    for x in nums:
        if x < s1:
            s1, s2 = ⟦x, s1⟧
        elif ⟦x < s2⟧:
            s2 = x
        if x > l1:
            l1, l2 = ⟦x, l1⟧
        elif ⟦x > l2⟧:
            l2 = x
    return [s1, s2, l2, l1]`,
js:`function minMaxTwo(nums) {
  let s1 = Infinity, s2 = Infinity;     // s1 <= s2
  let l1 = -Infinity, l2 = -Infinity;   // l1 >= l2
  for (const x of nums) {
    if (x < s1) { s2 = ⟦s1⟧; s1 = x; }
    else if (⟦x < s2⟧) s2 = x;
    if (x > l1) { l2 = ⟦l1⟧; l1 = x; }
    else if (⟦x > l2⟧) l2 = x;
  }
  return [s1, s2, l2, l1];
}`},
  complexity:'O(n) time, O(1) space (sorting would be O(n log n))',
  takeaway:'Top-2 / bottom-2 in one pass: when a new best arrives, shift the old best down. Say the complexity out loud and mention the "distinct" follow-up.',
  tests:[[[[3,1,4,1,5,9,2,6]],[1,1,6,9]],[[[5,2]],[2,5,2,5]],[[[7,7,7]],[7,7,7,7]],[[[-1,-5,10,3]],[-5,-1,3,10]],[[[1,2,3,4,5]],[1,2,4,5]],[[[10,9,8]],[8,9,9,10]]]
},
{
  id:'remove-duplicates', title:'Remove Duplicates from a List (keep order)', diff:'Easy', pattern:'hashmap', time:8,
  desc:`<p>Return a new list with duplicates removed, keeping the <b>first</b> occurrence of each value in its original order. (Asked in a 2025 Leapfrog associate interview, where the candidate had to explain the approach out loud.)</p>`,
  examples:[{in:'nums = [3,1,3,2,1]', out:'[3,1,2]'},{in:'nums = [5,5,5]', out:'[5]'}],
  constraints:['0 ≤ n ≤ 10⁵'],
  fn:{py:'remove_duplicates', js:'removeDuplicates'}, params:['nums'],
  logic:[
    {q:'"for x in nums: if x not in out: out.append(x)". Complexity?', opts:['O(n²): "in" on a list scans it','O(n)','O(n log n)'], a:0, why:'A membership check on a list is linear, so the whole thing is quadratic.'},
    {q:'What makes the membership check O(1)?', opts:['A set of the values seen so far','Sorting first','A second list'], a:0, why:'A set lookup is O(1) on average, so one pass costs O(n).'},
    {q:'Why not just return list(set(nums))?', opts:['A set does not keep the original order','It is O(n²)','It errors on ints'], a:0, why:'Set order is arbitrary. (In Python, list(dict.fromkeys(nums)) is a one-liner that keeps order.)'}
  ],
  hints:['Keep a set called seen and a list called out.','Append x only if it is not in seen, then add it to seen.','Follow-up: if the input is SORTED and must be changed in place, use two pointers (LeetCode 26).'],
  sol:{
py:`def remove_duplicates(nums):
    seen = set()
    out = []
    for x in nums:
        if ⟦x not in seen⟧:
            ⟦seen.add(x)⟧
            out.append(x)
    return out`,
js:`function removeDuplicates(nums) {
  const seen = new Set();
  const out = [];
  for (const x of nums) {
    if (⟦!seen.has(x)⟧) {
      ⟦seen.add(x)⟧;
      out.push(x);
    }
  }
  return out;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Dedupe keeping order = a "seen" set plus an output list. Sorted and in place = two pointers (a write index). Mention both in the interview.',
  tests:[[[[1,2,2,3,1]],[1,2,3]],[[[]],[]],[[[5,5,5]],[5]],[[[3,1,3,2,1]],[3,1,2]],[[["a","b","a"]],["a","b"]],[[[0,-1,0,-1,2]],[0,-1,2]]]
},
{
  id:'score-parentheses', title:'Score of Parentheses', diff:'Medium', pattern:'stack', time:15,
  desc:`<p>A balanced string of parentheses is scored like this: <code>"()"</code> = 1; <code>AB</code> = A + B (side by side, the scores add); <code>(A)</code> = 2 × A (wrapping doubles it). Return the score of <code>s</code>. (A 2024 Leapfrog candidate got this: "() returns 1, (()) returns 2…", alongside a balanced-parentheses question.)</p>`,
  examples:[{in:'s = "(())"', out:'2', why:'"()" = 1, wrapped once → 2'},{in:'s = "()()"', out:'2', why:'1 + 1'},{in:'s = "(()(()))"', out:'6', why:'2 × (1 + 2)'}],
  constraints:['2 ≤ s.length ≤ 50','s is balanced'],
  fn:{py:'score_of_parentheses', js:'scoreOfParentheses'}, params:['s'],
  logic:[
    {q:'Nesting means "finish the inside before the outside". Which structure?', opts:['A stack of running scores, one per open level','A queue','A hashmap'], a:0, why:'Each "(" opens a new level. Each ")" closes the innermost one and hands its score up to the parent.'},
    {q:'On "(" push 0. On ")" pop v. What gets added to the new top?', opts:['max(2 * v, 1)','v + 1','2 * v'], a:0, why:'If v == 0 the pair was "()" and is worth 1. Otherwise it wrapped something, so it doubles: 2v.'},
    {q:'What should the stack start with so the top level has somewhere to add?', opts:['[0]','[]','[1]'], a:0, why:'stack[0] collects the total of the outermost groups. Return it at the end.'}
  ],
  hints:['stack = [0].','"(" → push 0.','")" → v = pop(); stack[-1] += max(2*v, 1). Return stack[0].'],
  sol:{
py:`def score_of_parentheses(s):
    stack = [0]
    for ch in s:
        if ch == '(':
            stack.append(⟦0⟧)
        else:
            v = stack.pop()
            stack[-1] += ⟦max(2 * v, 1)⟧
    return ⟦stack[0]¦stack[-1]⟧`,
js:`function scoreOfParentheses(s) {
  const stack = [0];
  for (const ch of s) {
    if (ch === '(') stack.push(⟦0⟧);
    else {
      const v = stack.pop();
      stack[stack.length - 1] += ⟦Math.max(2 * v, 1)⟧;
    }
  }
  return ⟦stack[0]⟧;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Nested structure → a stack where each level keeps its running result, and closing a level folds that result into its parent.',
  tests:[[["()"],1],[["(())"],2],[["()()"],2],[["(()(()))"],6],[["((()))"],4],[["(()())"],4]]
},
{
  id:'valid-palindrome-ii', title:'Valid Palindrome II (delete at most one)', diff:'Easy', pattern:'twopointers', time:12,
  desc:`<p>Return <code>true</code> if <code>s</code> can become a palindrome by deleting <b>at most one</b> character. (A July 2026 Leapfrog associate candidate said the question was "a slightly different style of palindrome". This is the most common palindrome variant.)</p>`,
  examples:[{in:'s = "abca"', out:'true', why:'Delete "c" (or "b")'},{in:'s = "abc"', out:'false'}],
  constraints:['1 ≤ s.length ≤ 10⁵','lowercase letters'],
  fn:{py:'valid_palindrome_ii', js:'validPalindromeII'}, params:['s'],
  logic:[
    {q:'Brute force: try deleting each character and check. Complexity?', opts:['O(n²)','O(n)','O(n log n)'], a:0, why:'n deletions × an O(n) check each. Too slow for n = 10⁵.'},
    {q:'Two pointers from both ends. When s[l] != s[r], what are the only two options?', opts:['Skip s[l] (check l+1..r) or skip s[r] (check l..r−1)','Give up','Skip both'], a:0, why:'The mismatch must be fixed by deleting one of these two characters. Everything outside them already matched.'},
    {q:'After skipping one character, how do you check the rest?', opts:['A plain palindrome check on that range, with no more deletions allowed','Recurse, allowing another deletion','Sort it'], a:0, why:'Only one deletion is allowed, so the remaining range must already be a palindrome.'}
  ],
  hints:['Write a helper is_pal(i, j) that checks s[i..j].','Move l and r inward while s[l] == s[r].','On the first mismatch, return is_pal(l+1, r) or is_pal(l, r−1).'],
  sol:{
py:`def valid_palindrome_ii(s):
    def is_pal(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return ⟦is_pal(l + 1, r) or is_pal(l, r - 1)⟧
        l += 1
        r -= 1
    return True`,
js:`function validPalindromeII(s) {
  const isPal = (i, j) => {
    while (i < j) {
      if (s[i] !== s[j]) return false;
      i++; j--;
    }
    return true;
  };
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return ⟦isPal(l + 1, r) || isPal(l, r - 1)⟧;
    l++; r--;
  }
  return true;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Palindrome variants are almost always two pointers. On a mismatch, branch once into the two possible deletions.',
  tests:[[["aba"],true],[["abca"],true],[["abc"],false],[["deeee"],true],[["eccer"],true],[["abcda"],false],[["ab"],true],[["cbbcc"],true]]
},
{
  id:'frequent-days', title:'Most Frequent Days of the Week', diff:'Easy', pattern:'complexity', time:15,
  desc:`<p>Given a <code>year</code>, return the most frequent day(s) of the week in that year, as a list sorted in week order with <b>Monday first</b> (for example <code>["Monday","Sunday"]</code>). (This exact question was in a 2020 Leapfrog intern coding test on Glassdoor: "What is your favourite day of the week? Check if it's the most frequent day of the week in the year.")</p>`,
  examples:[{in:'year = 2001', out:'["Monday"]', why:'2001 starts on a Monday and is not a leap year'},{in:'year = 1984', out:'["Monday","Sunday"]', why:'Leap year starting on Sunday, so Sunday and Monday each occur 53 times'}],
  constraints:['1583 ≤ year ≤ 4000 (Gregorian calendar)'],
  fn:{py:'most_frequent_days', js:'mostFrequentDays'}, params:['year'],
  logic:[
    {q:'365 = 52 × 7 + 1. What does that tell you?', opts:['Every weekday appears 52 times, and ONE weekday gets a 53rd','Every weekday appears equally','Nothing useful'], a:0, why:'So you never need to loop over 365 days. Only the leftover day(s) matter.'},
    {q:'Which weekday gets the extra day in a normal year?', opts:['The weekday of 1 January','The weekday of 31 December plus one','Always Monday'], a:0, why:'The 365th day falls on the same weekday as day 1 (364 is a multiple of 7).'},
    {q:'In a leap year (366 days)?', opts:['The weekdays of 1 January and 2 January','Only 1 January','Only 29 February'], a:0, why:'366 = 52 × 7 + 2, so the first two weekdays each get 53.'},
    {q:'Jan 1 is a Sunday in a leap year. Output order?', opts:['["Monday","Sunday"]','["Sunday","Monday"]'], a:0, why:'The output must follow week order starting on Monday, so sort by weekday index (Monday = 0).'}
  ],
  hints:['Find the weekday of 1 January (Python: date(year,1,1).weekday(), Monday = 0).','Leap year: (y % 4 == 0 and y % 100 != 0) or y % 400 == 0.','Take [w] or [w, (w+1) % 7], sort by index, and map to names.'],
  sol:{
py:`from datetime import date

def most_frequent_days(year):
    names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    w = ⟦date(year, 1, 1).weekday()⟧          # Monday = 0
    leap = ⟦(year % 4 == 0 and year % 100 != 0) or year % 400 == 0⟧
    days = [w, (w + 1) % 7] if leap else [w]
    return [names[d] for d in ⟦sorted(days)⟧]`,
js:`function mostFrequentDays(year) {
  const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const w = ⟦(new Date(Date.UTC(year, 0, 1)).getUTCDay() + 6) % 7⟧; // Monday = 0
  const leap = ⟦(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0⟧;
  const days = leap ? [w, (w + 1) % 7] : [w];
  return ⟦days.sort((a, b) => a - b)⟧.map(d => names[d]);
}`},
  complexity:'O(1): no loop over the days',
  takeaway:'Before you simulate, look for the arithmetic: 365 = 52·7 + 1 means only the leftover day(s) matter. In JS, use Date.UTC with getUTCDay so the time zone cannot shift the day.',
  tests:[[[2001],["Monday"]],[[2020],["Wednesday","Thursday"]],[[1984],["Monday","Sunday"]],[[2427],["Friday"]],[[1770],["Monday"]],[[1785],["Saturday"]],[[2000],["Saturday","Sunday"]],[[2023],["Sunday"]],[[2024],["Monday","Tuesday"]]]
}
);
