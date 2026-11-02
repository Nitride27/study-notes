// Problem format:
// { id, title, diff, pattern, time (minutes time-box), desc (html), examples:[{in,out,why}], constraints:[],
//   fn:{py,js}, params:[], io?:{args:['list'|..], ret:'list'}, compare?:'exact'|'sorted',
//   logic:[{q, opts, a, why}]  -> Socratic steps that build the idea
//   hints:[3 strings], sol:{py, js}  -> ⟦answer⟧ marks a fill-in blank (¦ separates accepted alternatives)
//   complexity, takeaway, tests:[[args, expected]] }  expected may be {anyOf:[...]}
window.PROBLEMS = window.PROBLEMS || [];
PROBLEMS.push(
// ===================== HASHING =====================
{
  id:'two-sum', title:'Two Sum', diff:'Easy', pattern:'hashmap', time:12,
  desc:`<p>Given an array <code>nums</code> and an integer <code>target</code>, return the <b>indices</b> of the two numbers that add up to <code>target</code>. Exactly one solution exists. You may not use the same element twice. Return the smaller index first.</p>`,
  examples:[{in:'nums = [2,7,11,15], target = 9', out:'[0,1]', why:'2 + 7 = 9'},{in:'nums = [3,2,4], target = 6', out:'[1,2]'}],
  constraints:['2 ≤ n ≤ 10⁴','-10⁹ ≤ nums[i] ≤ 10⁹'],
  fn:{py:'two_sum', js:'twoSum'}, params:['nums','target'],
  logic:[
    {q:'Brute force: check every pair (i, j). Complexity?', opts:['O(n)','O(n log n)','O(n²)','O(2ⁿ)'], a:2, why:'n(n-1)/2 pairs. It works for n = 10⁴ (5·10⁷ ops), but we can do better.'},
    {q:'For each nums[i], the inner loop is really just SEARCHING for one specific value. Which value?', opts:['target + nums[i]','target - nums[i]','nums[i] * 2','max(nums)'], a:1, why:'We need x + y = target, so y = target − x. This is the "complement".'},
    {q:'Which structure answers "have I seen value v before, and at what index?" in O(1)?', opts:['Sorted list + binary search','Hashmap value → index','Stack','Queue'], a:1, why:'A dict/Map lookup is O(1) average. Sorting would lose the original indices.'},
    {q:'nums = [3,3], target = 6. At i=1 the map holds {3:0}. What happens?', opts:['Returns [0,1]','Returns [1,1]','Misses it'], a:0, why:'We look up 6−3 = 3, find index 0, and return [0,1]. Because we check BEFORE inserting, i=0 could never pair with itself.'}
  ],
  hints:['Walk once through the array. For each number, what other number would complete the pair?','Keep a hashmap of number → index for everything seen so far.','Check the map for target − x before you insert x.'],
  sol:{
py:`def two_sum(nums, target):
    seen = {}  # value -> index
    for i, x in enumerate(nums):
        need = ⟦target - x⟧
        if ⟦need in seen⟧:
            return [⟦seen[need]⟧, i]
        ⟦seen[x] = i⟧
    return []`,
js:`function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = ⟦target - nums[i]⟧;
    if (⟦seen.has(need)⟧) return [⟦seen.get(need)⟧, i];
    ⟦seen.set(nums[i], i)⟧;
  }
  return [];
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'"Find a pair with property P" → store what you have seen, and look up the complement.',
  tests:[[[[2,7,11,15],9],[0,1]],[[[3,2,4],6],[1,2]],[[[3,3],6],[0,1]],[[[-1,-2,-3,-4,-5],-8],[2,4]],[[[0,4,3,0],0],[0,3]],[[[1,5,9,13,2],15],[3,4]]]
},
{
  id:'valid-anagram', title:'Valid Anagram', diff:'Easy', pattern:'hashmap', time:10,
  desc:`<p>Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code> (same letters, same counts, any order).</p>`,
  examples:[{in:'s = "anagram", t = "nagaram"', out:'true'},{in:'s = "rat", t = "car"', out:'false'}],
  constraints:['1 ≤ len ≤ 5·10⁴','lowercase English letters'],
  fn:{py:'is_anagram', js:'isAnagram'}, params:['s','t'],
  logic:[
    {q:'Simplest correct approach?', opts:['Compare sorted(s) and sorted(t): O(n log n)','Compare the sums of char codes','Check that every char of s is in t'], a:0, why:'Sorting works. Char-code sums collide ("ad" vs "bc"), and the membership check ignores counts.'},
    {q:'To get O(n): count letters in s, then…', opts:['…decrement counts for t; all must end at 0','…count t separately and compare lengths only','…sort t'], a:0, why:'One counter, +1 for s and −1 for t. Any non-zero count means a mismatch.'},
    {q:'What quick check rejects many inputs immediately?', opts:['len(s) != len(t) → false','s[0] != t[0] → false','s == t → false'], a:0, why:'Different lengths can never be anagrams.'}
  ],
  hints:['Anagrams have identical letter counts.','Use a hashmap (or an array of 26) of counts.','Increment for s, decrement for t, then check all zeros.'],
  sol:{
py:`def is_anagram(s, t):
    if ⟦len(s) != len(t)⟧:
        return False
    count = {}
    for a, b in zip(s, t):
        count[a] = ⟦count.get(a, 0) + 1⟧
        count[b] = ⟦count.get(b, 0) - 1⟧
    return all(⟦v == 0⟧ for v in count.values())`,
js:`function isAnagram(s, t) {
  if (⟦s.length !== t.length⟧) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]⟦++⟧;
    count[⟦t.charCodeAt(i) - 97⟧]--;
  }
  return count.every(v => ⟦v === 0⟧);
}`},
  complexity:'O(n) time, O(1) space (26 letters)',
  takeaway:'Same multiset of characters → compare counts, not order.',
  tests:[[["anagram","nagaram"],true],[["rat","car"],false],[["a","ab"],false],[["aacc","ccac"],false],[["listen","silent"],true],[["x","x"],true]]
},
{
  id:'group-anagrams', title:'Group Anagrams', diff:'Medium', pattern:'hashmap', time:18,
  desc:`<p>Given an array of strings <code>strs</code>, group the anagrams together. Return the groups in any order (order inside a group doesn't matter either).</p>`,
  examples:[{in:'strs = ["eat","tea","tan","ate","nat","bat"]', out:'[["bat"],["nat","tan"],["ate","eat","tea"]]'}],
  constraints:['1 ≤ n ≤ 10⁴','0 ≤ strs[i].length ≤ 100'],
  fn:{py:'group_anagrams', js:'groupAnagrams'}, params:['strs'], compare:'sorted',
  logic:[
    {q:'Two words are in the same group iff…', opts:['same length','same sorted letters','same first letter'], a:1, why:'Sorted letters form a canonical "signature" of an anagram class.'},
    {q:'So we need to map signature → list of words. Data structure?', opts:['Hashmap key=signature, value=list','Set of signatures','2D array indexed by length'], a:0, why:'This is the grouping pattern: dict / defaultdict(list) / Map.'},
    {q:'Complexity with sorting each word (n words, max length k)?', opts:['O(n·k)','O(n·k log k)','O(n² k)'], a:1, why:'Sorting each word costs k log k. A 26-count tuple key gives O(n·k).'}
  ],
  hints:['What do all anagrams have in common if you rearrange their letters?','Use the sorted word as a dictionary key.','Append each word to groups[key], then return all values.'],
  sol:{
py:`def group_anagrams(strs):
    groups = {}
    for w in strs:
        key = ⟦''.join(sorted(w))⟧
        if key not in groups:
            groups[key] = ⟦[]⟧
        ⟦groups[key].append(w)⟧
    return list(⟦groups.values()⟧)`,
js:`function groupAnagrams(strs) {
  const groups = new Map();
  for (const w of strs) {
    const key = ⟦[...w].sort().join('')¦w.split('').sort().join('')⟧;
    if (!groups.has(key)) groups.set(key, ⟦[]⟧);
    ⟦groups.get(key).push(w)⟧;
  }
  return [...⟦groups.values()⟧];
}`},
  complexity:'O(n · k log k) time, O(n·k) space',
  takeaway:'Grouping = hashmap from a canonical key → list.',
  tests:[[[["eat","tea","tan","ate","nat","bat"]],[["bat"],["nat","tan"],["ate","eat","tea"]]],[[[""]],[[""]]],[[["a"]],[["a"]]],[[["abc","bca","cab","xyz","zyx","q"]],[["abc","bca","cab"],["xyz","zyx"],["q"]]]]
},
{
  id:'top-k-frequent', title:'Top K Frequent Elements', diff:'Medium', pattern:'hashmap', time:18,
  desc:`<p>Given an integer array <code>nums</code> and integer <code>k</code>, return the <code>k</code> most frequent elements (any order). The answer is guaranteed unique.</p>`,
  examples:[{in:'nums = [1,1,1,2,2,3], k = 2', out:'[1,2]'}],
  constraints:['1 ≤ n ≤ 10⁵','k is in [1, number of unique elements]'],
  fn:{py:'top_k_frequent', js:'topKFrequent'}, params:['nums','k'], compare:'sorted',
  logic:[
    {q:'First step for anything "frequency"?', opts:['Sort nums','Count with a hashmap','Use a stack'], a:1, why:'Counting is O(n).'},
    {q:'Then sort the unique (value, count) pairs by count descending and take k. Complexity?', opts:['O(n log n)','O(n²)','O(k)'], a:0, why:'This is acceptable for n = 10⁵. A heap gives O(n log k), and bucket sort gives O(n).'},
    {q:'Bucket sort idea: a count can be at most n. So create buckets[count] = list of values. Then…', opts:['iterate buckets from n down to 1, collecting until we have k','iterate from 1 up','binary search buckets'], a:0, why:'The highest counts come first, giving O(n) total. This is the "beyond medium" optimisation interviewers like.'}
  ],
  hints:['Count each value.','Sort values by their count (descending), or use buckets indexed by count.','Take the first k.'],
  sol:{
py:`def top_k_frequent(nums, k):
    count = {}
    for x in nums:
        count[x] = ⟦count.get(x, 0) + 1⟧
    buckets = [[] for _ in range(len(nums) + 1)]
    for val, c in count.items():
        ⟦buckets[c].append(val)⟧
    res = []
    for c in range(⟦len(buckets) - 1⟧, 0, -1):
        for val in buckets[c]:
            res.append(val)
            if ⟦len(res) == k⟧:
                return res
    return res`,
js:`function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, ⟦(count.get(x) || 0) + 1⟧);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [val, c] of count) ⟦buckets[c].push(val)⟧;
  const res = [];
  for (let c = ⟦buckets.length - 1⟧; c > 0; c--) {
    for (const val of buckets[c]) {
      res.push(val);
      if (⟦res.length === k⟧) return res;
    }
  }
  return res;
}`},
  complexity:'O(n) time with bucket sort (O(n log n) with plain sort), O(n) space',
  takeaway:'Counts are bounded by n, so you can bucket by count instead of sorting.',
  tests:[[[[1,1,1,2,2,3],2],[1,2]],[[[1],1],[1]],[[[4,4,4,5,5,6,6,6,6],1],[6]],[[[-1,-1,2,2,2,3],2],[2,-1]],[[[5,3,5,3,5,7],2],[5,3]]]
},
{
  id:'longest-consecutive', title:'Longest Consecutive Sequence', diff:'Medium', pattern:'hashmap', time:20,
  desc:`<p>Given an unsorted array <code>nums</code>, return the length of the longest run of consecutive integers (e.g. 1,2,3,4). It must run in <b>O(n)</b>.</p>`,
  examples:[{in:'nums = [100,4,200,1,3,2]', out:'4', why:'1,2,3,4'},{in:'nums = [0,3,7,2,5,8,4,6,0,1]', out:'9'}],
  constraints:['0 ≤ n ≤ 10⁵','duplicates possible'],
  fn:{py:'longest_consecutive', js:'longestConsecutive'}, params:['nums'],
  logic:[
    {q:'Sorting solves it in O(n log n). But O(n) is required. Which tool gives O(1) "does x+1 exist?"', opts:['Set','Stack','Heap'], a:0, why:'Put everything in a set.'},
    {q:'If we start counting from EVERY number, [1,2,3,4] would count 4+3+2+1 steps, which is O(n²). How do we avoid that?', opts:['Only start counting from x when x-1 is NOT in the set (x is a sequence start)','Remove numbers randomly','Sort first'], a:0, why:'Each sequence is walked exactly once, from its start, so the total is O(n).'},
    {q:'nums = [] → answer?', opts:['0','1','error'], a:0, why:'Always handle the empty input.'}
  ],
  hints:['Put all numbers in a set.','A number begins a sequence if number−1 is missing.','From each beginning, count upward while number+1 exists.'],
  sol:{
py:`def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if ⟦x - 1 not in s⟧:          # x starts a run
            length = 1
            while ⟦x + length in s⟧:
                length += 1
            best = ⟦max(best, length)⟧
    return best`,
js:`function longestConsecutive(nums) {
  const s = new Set(nums);
  let best = 0;
  for (const x of s) {
    if (⟦!s.has(x - 1)⟧) {            // x starts a run
      let length = 1;
      while (⟦s.has(x + length)⟧) length++;
      best = ⟦Math.max(best, length)⟧;
    }
  }
  return best;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Avoid repeated work by only starting from "beginnings". Each element is touched O(1) times.',
  tests:[[[[100,4,200,1,3,2]],4],[[[0,3,7,2,5,8,4,6,0,1]],9],[[[]],0],[[[1,2,0,1]],3],[[[9,1,-3,2,4,8,3,-1,6,-2,-4,7]],4],[[[5]],1]]
},
{
  id:'product-except-self', title:'Product of Array Except Self', diff:'Medium', pattern:'prefixsum', time:20,
  desc:`<p>Return an array <code>answer</code> where <code>answer[i]</code> is the product of all elements of <code>nums</code> except <code>nums[i]</code>. Do it in O(n) <b>without division</b>.</p>`,
  examples:[{in:'nums = [1,2,3,4]', out:'[24,12,8,6]'},{in:'nums = [-1,1,0,-3,3]', out:'[0,0,9,0,0]'}],
  constraints:['2 ≤ n ≤ 10⁵','products fit in 32-bit int'],
  fn:{py:'product_except_self', js:'productExceptSelf'}, params:['nums'],
  logic:[
    {q:'answer[i] = (product of everything LEFT of i) × (product of everything RIGHT of i). For [1,2,3,4], left products are?', opts:['[1,1,2,6]','[1,2,6,24]','[24,12,4,1]'], a:0, why:'Nothing is left of index 0, so its value is 1 (the empty product). Then 1, 1·2, 1·2·3.'},
    {q:'Right products for [1,2,3,4]?', opts:['[24,12,4,1]','[1,4,12,24]','[24,12,8,6]'], a:0, why:'Index 3 has nothing on its right, so 1. Then 4, 3·4, 2·3·4.'},
    {q:'To use O(1) extra space (besides the output), how?', opts:['Store left products in answer, then sweep from the right with a running variable','Use division','Use two extra arrays'], a:0, why:'Pass 1 fills answer with left products. Pass 2 multiplies in a running right product.'}
  ],
  hints:['Think "everything to my left" times "everything to my right".','First pass: answer[i] = product of nums[0..i-1].','Second pass from the right with a variable right = 1.'],
  sol:{
py:`def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    left = 1
    for i in range(n):
        answer[i] = ⟦left⟧
        left ⟦*= nums[i]⟧
    right = 1
    for i in range(⟦n - 1⟧, -1, -1):
        answer[i] ⟦*= right⟧
        right *= ⟦nums[i]⟧
    return answer`,
js:`function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = ⟦left⟧;
    left ⟦*= nums[i]⟧;
  }
  let right = 1;
  for (let i = ⟦n - 1⟧; i >= 0; i--) {
    answer[i] ⟦*= right⟧;
    right *= ⟦nums[i]⟧;
  }
  return answer;
}`},
  complexity:'O(n) time, O(1) extra space',
  takeaway:'"Everything except i" → combine a prefix pass and a suffix pass.',
  tests:[[[[1,2,3,4]],[24,12,8,6]],[[[-1,1,0,-3,3]],[0,0,9,0,0]],[[[2,3]],[3,2]],[[[0,0]],[0,0]],[[[5,1,1,2]],[2,10,10,5]]]
},
{
  id:'subarray-sum-k', title:'Subarray Sum Equals K', diff:'Medium', pattern:'prefixsum', time:22,
  desc:`<p>Given an integer array <code>nums</code> (may contain negatives) and an integer <code>k</code>, return the total number of <b>contiguous</b> subarrays whose sum equals <code>k</code>.</p>`,
  examples:[{in:'nums = [1,1,1], k = 2', out:'2'},{in:'nums = [1,2,3], k = 3', out:'2', why:'[1,2] and [3]'}],
  constraints:['1 ≤ n ≤ 2·10⁴','-1000 ≤ nums[i] ≤ 1000'],
  fn:{py:'subarray_sum', js:'subarraySum'}, params:['nums','k'],
  logic:[
    {q:'Can we use a sliding window here?', opts:['Yes','No: negatives break the monotonic expand/shrink rule'], a:1, why:'With negatives, shrinking can increase the sum, so the window logic fails.'},
    {q:'Let prefix P(j) = sum of nums[0..j]. Subarray (i+1..j) sums to k iff…', opts:['P(j) + P(i) = k','P(j) − P(i) = k','P(j) = k·P(i)'], a:1, why:'The sum of a range is the difference of two prefixes.'},
    {q:'So at each j we need: how many earlier prefixes equal P(j) − k? Store prefix counts in…', opts:['a hashmap prefix → count','a stack','a sorted list'], a:0, why:'Hashmap lookup is O(1), so the whole thing is O(n).'},
    {q:'Why initialise the map with {0: 1}?', opts:['To count subarrays starting at index 0','To avoid errors','No reason'], a:0, why:'If P(j) itself equals k, then P(j) − k = 0 must be found once (the empty prefix).'}
  ],
  hints:['Running sum + "what earlier running sum would make this work?"','You need earlier prefix = current − k.','Map from prefix sum → how many times it was seen, starting with {0:1}.'],
  sol:{
py:`def subarray_sum(nums, k):
    seen = ⟦{0: 1}⟧
    cur = count = 0
    for x in nums:
        cur += x
        count += ⟦seen.get(cur - k, 0)⟧
        seen[cur] = ⟦seen.get(cur, 0) + 1⟧
    return count`,
js:`function subarraySum(nums, k) {
  const seen = new Map(⟦[[0, 1]]⟧);
  let cur = 0, count = 0;
  for (const x of nums) {
    cur += x;
    count += ⟦seen.get(cur - k) || 0⟧;
    seen.set(cur, ⟦(seen.get(cur) || 0) + 1⟧);
  }
  return count;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Subarray sums with negatives → prefix sum + hashmap of counts.',
  tests:[[[[1,1,1],2],2],[[[1,2,3],3],2],[[[1,-1,0],0],3],[[[3,4,7,2,-3,1,4,2],7],4],[[[1],0],0],[[[-1,-1,1],0],1]]
},
// ===================== TWO POINTERS =====================
{
  id:'valid-palindrome', title:'Valid Palindrome', diff:'Easy', pattern:'twopointers', time:10,
  desc:`<p>A phrase is a palindrome if, after converting uppercase to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Return <code>true</code>/<code>false</code>.</p>`,
  examples:[{in:'s = "A man, a plan, a canal: Panama"', out:'true'},{in:'s = "race a car"', out:'false'}],
  constraints:['1 ≤ len ≤ 2·10⁵','printable ASCII'],
  fn:{py:'is_palindrome', js:'isPalindrome'}, params:['s'],
  logic:[
    {q:'Simple approach: clean the string, then compare with its reverse. Extra space?', opts:['O(1)','O(n)'], a:1, why:'It builds a new string. Fine in an exam, but two pointers give O(1).'},
    {q:'Two pointers l=0, r=end. When s[l] is not alphanumeric you should…', opts:['return false','skip it: l += 1','skip both'], a:1, why:'Ignore punctuation and spaces by moving past them.'},
    {q:'Compare characters how?', opts:['s[l] == s[r]','s[l].lower() == s[r].lower()'], a:1, why:'Case-insensitive.'}
  ],
  hints:['Pointers at both ends moving inward.','Skip characters that are not letters/digits.','Compare lowercase versions. Stop when l >= r.'],
  sol:{
py:`def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if not s[l].isalnum():
            ⟦l += 1⟧
        elif ⟦not s[r].isalnum()⟧:
            r -= 1
        elif ⟦s[l].lower() != s[r].lower()⟧:
            return False
        else:
            l, r = ⟦l + 1, r - 1⟧
    return True`,
js:`function isPalindrome(s) {
  const ok = c => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (!ok(s[l])) ⟦l++⟧;
    else if (⟦!ok(s[r])⟧) r--;
    else if (⟦s[l].toLowerCase() !== s[r].toLowerCase()⟧) return false;
    else { ⟦l++; r--;¦l++;r--;¦l++, r--;⟧ }
  }
  return true;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Compare from both ends; skip characters that do not count.',
  tests:[[["A man, a plan, a canal: Panama"],true],[["race a car"],false],[[" "],true],[["0P"],false],[["ab_a"],true],[["Was it a car or a cat I saw?"],true]]
},
{
  id:'three-sum', title:'3Sum', diff:'Medium', pattern:'twopointers', time:25,
  desc:`<p>Return all <b>unique</b> triplets <code>[a,b,c]</code> from <code>nums</code> with a + b + c = 0 (from different indices). No duplicate triplets. Any order.</p>`,
  examples:[{in:'nums = [-1,0,1,2,-1,-4]', out:'[[-1,-1,2],[-1,0,1]]'},{in:'nums = [0,0,0,0]', out:'[[0,0,0]]'}],
  constraints:['3 ≤ n ≤ 3000','-10⁵ ≤ nums[i] ≤ 10⁵'],
  fn:{py:'three_sum', js:'threeSum'}, params:['nums'], compare:'sorted',
  logic:[
    {q:'n ≤ 3000. Triple loop O(n³) = 2.7·10¹⁰. Target complexity?', opts:['O(n²)','O(n)','O(n log n)'], a:0, why:'n² = 9·10⁶ is fine.'},
    {q:'Fix the first number nums[i]. The remaining problem is…', opts:['Two Sum with target −nums[i] on the rest','Sorting','Binary search for 0'], a:0, why:'This reduces to Two Sum, which is O(n) per i.'},
    {q:'Why SORT first?', opts:['Enables two pointers AND makes skipping duplicates easy (equal values are adjacent)','Required by Python','To find max'], a:0, why:'Two benefits for O(n log n), which is dominated by the n² anyway.'},
    {q:'After finding a valid triplet at (i, l, r), what next?', opts:['break','l += 1; r -= 1, and skip over equal values of nums[l]','return'], a:1, why:'There may be more pairs for this i. Skip duplicates to avoid repeated triplets.'}
  ],
  hints:['Sort the array.','For each i (skipping duplicate values of nums[i]), run two pointers on i+1..end.','When a triplet is found, move both pointers and skip duplicates of nums[l].'],
  sol:{
py:`def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and ⟦nums[i] == nums[i - 1]⟧:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                ⟦l += 1⟧
            elif s > 0:
                ⟦r -= 1⟧
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and ⟦nums[l] == nums[l - 1]⟧:
                    l += 1
    return res`,
js:`function threeSum(nums) {
  nums.sort(⟦(a, b) => a - b⟧);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && ⟦nums[i] === nums[i - 1]⟧) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s < 0) ⟦l++⟧;
      else if (s > 0) ⟦r--⟧;
      else {
        res.push([nums[i], nums[l], nums[r]]);
        l++; r--;
        while (l < r && ⟦nums[l] === nums[l - 1]⟧) l++;
      }
    }
  }
  return res;
}`},
  complexity:'O(n²) time, O(1) extra (ignoring output/sort)',
  takeaway:'k-Sum → sort, fix one element, two-pointer the rest. Skip equal neighbours for uniqueness.',
  tests:[[[[-1,0,1,2,-1,-4]],[[-1,-1,2],[-1,0,1]]],[[[0,1,1]],[]],[[[0,0,0,0]],[[0,0,0]]],[[[-2,0,1,1,2]],[[-2,0,2],[-2,1,1]]],[[[3,-2,1,0]],[]],[[[-4,-1,-1,0,1,2]],[[-1,-1,2],[-1,0,1]]]]
},
{
  id:'container-water', title:'Container With Most Water', diff:'Medium', pattern:'twopointers', time:18,
  desc:`<p><code>height[i]</code> is a vertical line at x = i. Pick two lines that, together with the x-axis, hold the most water. Return that maximum area: <code>min(h[l], h[r]) × (r − l)</code>.</p>`,
  examples:[{in:'height = [1,8,6,2,5,4,8,3,7]', out:'49', why:'lines at 1 and 8: min(8,7)×7'}],
  constraints:['2 ≤ n ≤ 10⁵'],
  fn:{py:'max_area', js:'maxArea'}, params:['height'],
  logic:[
    {q:'Start with l=0, r=n−1 (maximum width). Which pointer should move?', opts:['The taller one','The shorter one','Both'], a:1, why:'The area is limited by the shorter line. Moving the taller one can only shrink the width without raising the min, so it can never help.'},
    {q:'Why is it safe to discard the shorter line forever?', opts:['Every other container using it has smaller width and height ≤ itself, so it can\'t beat the current one','Random luck'], a:0, why:'That is the greedy proof. This kind of argument gets asked in interviews.'}
  ],
  hints:['Start as wide as possible.','Compute the area, then move the pointer at the SHORTER line inward.','Track the max.'],
  sol:{
py:`def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        area = ⟦min(height[l], height[r]) * (r - l)⟧
        best = max(best, area)
        if ⟦height[l] < height[r]⟧:
            l += 1
        else:
            ⟦r -= 1⟧
    return best`,
js:`function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const area = ⟦Math.min(height[l], height[r]) * (r - l)⟧;
    best = Math.max(best, area);
    if (⟦height[l] < height[r]⟧) l++;
    else ⟦r--⟧;
  }
  return best;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Greedy two pointers: move the side that is the bottleneck.',
  tests:[[[[1,8,6,2,5,4,8,3,7]],49],[[[1,1]],1],[[[4,3,2,1,4]],16],[[[1,2,1]],2],[[[2,3,10,5,7,8,9]],36]]
},
{
  id:'trapping-rain', title:'Trapping Rain Water', diff:'Hard', pattern:'twopointers', time:30,
  desc:`<p>Given <code>n</code> non-negative integers representing an elevation map (bar width 1), compute how much water it can trap after raining.</p>`,
  examples:[{in:'height = [0,1,0,2,1,0,1,3,2,1,2,1]', out:'6'},{in:'height = [4,2,0,3,2,5]', out:'9'}],
  constraints:['1 ≤ n ≤ 2·10⁴'],
  fn:{py:'trap', js:'trap'}, params:['height'],
  logic:[
    {q:'Water above bar i = ?', opts:['max(left) − h[i]','min(max height to the left, max height to the right) − h[i] (if positive)','h[i] − min(neighbours)'], a:1, why:'Water rises to the lower of the two tallest walls around i.'},
    {q:'Precomputing leftMax[] and rightMax[] arrays gives?', opts:['O(n) time, O(n) space','O(n²)','O(log n)'], a:0, why:'This is a perfectly good exam answer. Two pointers can bring space down to O(1).'},
    {q:'Two pointers: if leftMax < rightMax, the water at l is determined by…', opts:['leftMax (the right side has something at least as tall)','rightMax','unknown'], a:0, why:'The bottleneck is leftMax, so process l and move it right. Otherwise process r symmetrically.'}
  ],
  hints:['For each bar: water = min(tallest left, tallest right) − height.','Easy version: build leftMax and rightMax arrays.','O(1) space: two pointers, always process the side with the smaller max.'],
  sol:{
py:`def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        left_max = max(left_max, height[l])
        right_max = max(right_max, height[r])
        if ⟦left_max < right_max⟧:
            water += ⟦left_max - height[l]⟧
            l += 1
        else:
            water += ⟦right_max - height[r]⟧
            ⟦r -= 1⟧
    return water`,
js:`function trap(height) {
  let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    leftMax = Math.max(leftMax, height[l]);
    rightMax = Math.max(rightMax, height[r]);
    if (⟦leftMax < rightMax⟧) {
      water += ⟦leftMax - height[l]⟧;
      l++;
    } else {
      water += ⟦rightMax - height[r]⟧;
      ⟦r--⟧;
    }
  }
  return water;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Per-index answer depends on max-left & max-right → prefix/suffix max, or two pointers on the smaller side.',
  tests:[[[[0,1,0,2,1,0,1,3,2,1,2,1]],6],[[[4,2,0,3,2,5]],9],[[[1]],0],[[[3,0,3]],3],[[[5,4,3,2,1]],0],[[[2,0,2,0,2]],4]]
},
// ===================== SLIDING WINDOW =====================
{
  id:'best-time-stock', title:'Best Time to Buy and Sell Stock', diff:'Easy', pattern:'slidingwindow', time:10,
  desc:`<p><code>prices[i]</code> is the price on day i. Choose one day to buy and a later day to sell. Return the maximum profit, or 0 if no profit is possible.</p>`,
  examples:[{in:'prices = [7,1,5,3,6,4]', out:'5', why:'buy 1, sell 6'},{in:'prices = [7,6,4,3,1]', out:'0'}],
  constraints:['1 ≤ n ≤ 10⁵'],
  fn:{py:'max_profit', js:'maxProfit'}, params:['prices'],
  logic:[
    {q:'If we sell on day i, the best buy day is…', opts:['the minimum price BEFORE day i','the maximum before i','day 0'], a:0, why:'So track the running minimum.'},
    {q:'One pass, tracking min_so_far and best. Complexity?', opts:['O(n), O(1)','O(n²)','O(n log n)'], a:0, why:'Each day costs constant work.'}
  ],
  hints:['For each day, ask: what if I sell today?','Keep the cheapest price seen so far.','best = max(best, price − cheapest).'],
  sol:{
py:`def max_profit(prices):
    lowest = ⟦float('inf')¦prices[0]⟧
    best = 0
    for p in prices:
        lowest = ⟦min(lowest, p)⟧
        best = ⟦max(best, p - lowest)⟧
    return best`,
js:`function maxProfit(prices) {
  let lowest = ⟦Infinity¦prices[0]⟧, best = 0;
  for (const p of prices) {
    lowest = ⟦Math.min(lowest, p)⟧;
    best = ⟦Math.max(best, p - lowest)⟧;
  }
  return best;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'"Best pair with i < j" → keep the best value seen so far on the left.',
  tests:[[[[7,1,5,3,6,4]],5],[[[7,6,4,3,1]],0],[[[1]],0],[[[2,4,1]],2],[[[3,2,6,5,0,3]],4]]
},
{
  id:'longest-substring', title:'Longest Substring Without Repeating Characters', diff:'Medium', pattern:'slidingwindow', time:20,
  desc:`<p>Given a string <code>s</code>, return the length of the longest substring with no repeating characters.</p>`,
  examples:[{in:'s = "abcabcbb"', out:'3', why:'"abc"'},{in:'s = "pwwkew"', out:'3', why:'"wke"'}],
  constraints:['0 ≤ len ≤ 5·10⁴'],
  fn:{py:'length_of_longest_substring', js:'lengthOfLongestSubstring'}, params:['s'],
  logic:[
    {q:'"Longest SUBSTRING such that…" suggests which pattern?', opts:['Sliding window','Binary search','DP on subsequences'], a:0, why:'The substring is contiguous and the condition (all distinct) is monotonic.'},
    {q:'Window [left..right] is valid if all chars are distinct. When adding s[right] creates a duplicate…', opts:['restart from right','move left forward until the duplicate is gone','return'], a:1, why:'Shrink from the left.'},
    {q:'Optimisation: store last index of each char. On duplicate at right, set left = ?', opts:['last[ch] + 1','max(left, last[ch] + 1)','last[ch]'], a:1, why:'max() is needed because last[ch] could be BEFORE the current window (e.g. "abba": at the last a, left is already past it).'}
  ],
  hints:['Expand a window to the right one char at a time.','Remember where each char was last seen.','If the char was seen inside the window, jump left past it. Track max length.'],
  sol:{
py:`def length_of_longest_substring(s):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and ⟦last[ch] >= left⟧:
            left = ⟦last[ch] + 1⟧
        ⟦last[ch] = right⟧
        best = max(best, ⟦right - left + 1⟧)
    return best`,
js:`function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && ⟦last.get(ch) >= left⟧) left = ⟦last.get(ch) + 1⟧;
    ⟦last.set(ch, right)⟧;
    best = Math.max(best, ⟦right - left + 1⟧);
  }
  return best;
}`},
  complexity:'O(n) time, O(min(n, alphabet)) space',
  takeaway:'Sliding window + last-seen map; never move left backwards.',
  tests:[[["abcabcbb"],3],[["bbbbb"],1],[["pwwkew"],3],[[""],0],[["abba"],2],[["dvdf"],3],[[" "],1]]
},
{
  id:'char-replacement', title:'Longest Repeating Character Replacement', diff:'Medium', pattern:'slidingwindow', time:25,
  desc:`<p>Given uppercase string <code>s</code> and integer <code>k</code>, you may change at most <code>k</code> characters to any other uppercase letter. Return the length of the longest substring containing a single repeated letter after the changes.</p>`,
  examples:[{in:'s = "ABAB", k = 2', out:'4'},{in:'s = "AABABBA", k = 1', out:'4', why:'"AABA" → "AAAA"'}],
  constraints:['1 ≤ n ≤ 10⁵'],
  fn:{py:'character_replacement', js:'characterReplacement'}, params:['s','k'],
  logic:[
    {q:'For a window, how many changes are needed to make it all one letter?', opts:['window length − count of the most frequent letter in it','k','number of distinct letters'], a:0, why:'Keep the majority letter and change everything else.'},
    {q:'Window is valid iff…', opts:['len − maxFreq ≤ k','len ≤ k','maxFreq ≥ k'], a:0, why:'Shrink from the left while this is false.'},
    {q:'Subtle trick: when shrinking, we do not need to decrease maxFreq. Why is that OK?', opts:['The answer only grows when a NEW higher maxFreq appears, so a stale (too high) maxFreq never produces a wrong bigger answer','It is a bug'], a:0, why:'This is an advanced point. Recomputing max over the 26 counts each step is also fine: O(26n).'}
  ],
  hints:['Sliding window with counts of each letter.','changes needed = window size − most common count.','While changes > k, move left and decrement its count.'],
  sol:{
py:`def character_replacement(s, k):
    count = {}
    left = max_freq = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        max_freq = ⟦max(max_freq, count[ch])⟧
        while ⟦(right - left + 1) - max_freq > k⟧:
            count[s[left]] -= 1
            ⟦left += 1⟧
        best = max(best, right - left + 1)
    return best`,
js:`function characterReplacement(s, k) {
  const count = new Map();
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    count.set(ch, (count.get(ch) || 0) + 1);
    maxFreq = ⟦Math.max(maxFreq, count.get(ch))⟧;
    while (⟦(right - left + 1) - maxFreq > k⟧) {
      count.set(s[left], count.get(s[left]) - 1);
      ⟦left++⟧;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`},
  complexity:'O(n) time, O(26) space',
  takeaway:'Express the window\'s validity as a formula of counts, then apply the standard shrink loop.',
  tests:[[["ABAB",2],4],[["AABABBA",1],4],[["A",0],1],[["AAAA",0],4],[["ABCDE",1],2],[["ABBB",2],4]]
},
{
  id:'min-window', title:'Minimum Window Substring', diff:'Hard', pattern:'slidingwindow', time:35,
  desc:`<p>Given strings <code>s</code> and <code>t</code>, return the <b>shortest</b> substring of <code>s</code> that contains every character of <code>t</code> (including duplicates). Return <code>""</code> if none exists. The answer is unique.</p>`,
  examples:[{in:'s = "ADOBECODEBANC", t = "ABC"', out:'"BANC"'},{in:'s = "a", t = "aa"', out:'""'}],
  constraints:['1 ≤ |s|, |t| ≤ 10⁵'],
  fn:{py:'min_window', js:'minWindow'}, params:['s','t'],
  logic:[
    {q:'"SHORTEST window satisfying a condition": when do we record the answer?', opts:['Inside the shrink loop, while the window is still valid','After the loop, like the "longest" template'], a:0, why:'For "shortest" we shrink WHILE valid and record before each shrink step.'},
    {q:'How to check "window covers t" in O(1) instead of comparing 2 maps?', opts:['Keep `missing` = number of chars of t still needed; decrement when a needed char enters','Compare maps each step'], a:0, why:'need[ch] > 0 before taking it means it was useful, so missing −= 1. The window is valid when missing == 0.'},
    {q:'When removing s[left] from the window: need[s[left]] += 1. If it becomes > 0…', opts:['missing += 1 (the window is no longer valid)','nothing'], a:0, why:'We just gave away a required char.'}
  ],
  hints:['need = Counter(t), missing = len(t).','Expand right: if need[ch] > 0 then missing −= 1; always need[ch] −= 1.','While missing == 0: record the window, then pop left (need[left] += 1; if > 0, missing += 1).'],
  sol:{
py:`def min_window(s, t):
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    missing = len(t)
    left = 0
    best = (0, float('inf'))       # (start, end) exclusive
    for right, ch in enumerate(s):
        if ⟦need.get(ch, 0) > 0⟧:
            missing -= 1
        need[ch] = need.get(ch, 0) - 1
        while ⟦missing == 0⟧:
            if right + 1 - left < best[1] - best[0]:
                best = ⟦(left, right + 1)⟧
            need[s[left]] += 1
            if ⟦need[s[left]] > 0⟧:
                missing += 1
            left += 1
    return "" if best[1] == float('inf') else ⟦s[best[0]:best[1]]⟧`,
js:`function minWindow(s, t) {
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  let missing = t.length, left = 0, bestL = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (⟦(need.get(ch) || 0) > 0⟧) missing--;
    need.set(ch, (need.get(ch) || 0) - 1);
    while (⟦missing === 0⟧) {
      if (right - left + 1 < bestLen) { bestL = left; bestLen = ⟦right - left + 1⟧; }
      need.set(s[left], need.get(s[left]) + 1);
      if (⟦need.get(s[left]) > 0⟧) missing++;
      left++;
    }
  }
  return bestLen === Infinity ? "" : ⟦s.slice(bestL, bestL + bestLen)¦s.substring(bestL, bestL + bestLen)⟧;
}`},
  complexity:'O(|s| + |t|) time, O(alphabet) space',
  takeaway:'"Shortest window" = expand until valid, then shrink while valid, recording each time.',
  tests:[[["ADOBECODEBANC","ABC"],"BANC"],[["a","a"],"a"],[["a","aa"],""],[["aaflslflsldkalskaaa","aaa"],"aaa"],[["ab","b"],"b"],[["cabwefgewcwaefgcf","cae"],"cwae"]]
}
);
