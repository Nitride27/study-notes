// Plain-language concept + step-by-step algorithm for every problem (matches the reference solutions).
// id -> { idea: why it works, steps: [what to do, in order] }
window.REV_ALGO = {
// ---------- HASHING ----------
'two-sum': {
  idea: 'For every number x, the partner you need is exactly target − x. Instead of searching the whole array for it each time (slow), remember every number you have already passed in a dictionary, so checking takes one step.',
  steps: [
    'Make an empty dictionary <b>seen</b> that maps a number to its index.',
    'Walk through the array. For each number x at index i, work out <b>need = target − x</b>.',
    'If <b>need</b> is already in seen, you found the pair: return <code>[seen[need], i]</code>.',
    'Otherwise store x: <code>seen[x] = i</code>, and move on.',
    'Check BEFORE storing, so a number can never pair with itself.'
  ]
},
'contains-duplicate': {
  idea: 'A set remembers what you have already seen. The moment a number is already in the set, it is a duplicate.',
  steps: [
    'Make an empty set <b>seen</b>.',
    'For each number x: if x is in seen, return <b>True</b>.',
    'Otherwise add x to seen.',
    'If the loop finishes, there were no duplicates: return <b>False</b>.'
  ]
},
'remove-duplicates': {
  idea: 'Keep a set of values already added. The set answers "seen it?" in one step, and a separate output list keeps the original order.',
  steps: [
    'Make an empty set <b>seen</b> and an empty list <b>out</b>.',
    'For each x in the list: if x is NOT in seen, add it to seen and append it to out.',
    'If it is already in seen, skip it (it is a later duplicate).',
    'Return out. (Sorted + in place version: use a write pointer like Move Zeroes.)'
  ]
},
'valid-anagram': {
  idea: 'Two words are anagrams when every letter appears the same number of times in both. So count letters: +1 for each letter of s, −1 for each letter of t. If everything ends at 0, the counts matched.',
  steps: [
    'If the lengths differ, return <b>False</b> immediately.',
    'Make a dictionary <b>count</b>.',
    'Walk both strings together: for letter a from s do <code>count[a] += 1</code>, for letter b from t do <code>count[b] -= 1</code>.',
    'At the end, return True only if every value in count is 0.'
  ]
},
'first-unique-char': {
  idea: 'You cannot know a letter is unique until you have seen the whole string. So do two passes: first count every letter, then find the first one whose count is 1.',
  steps: [
    'Pass 1: count how many times each character appears.',
    'Pass 2: walk the string again from the left.',
    'The first index whose character has count 1 is the answer.',
    'If none has count 1, return −1.'
  ]
},
'majority-element': {
  idea: 'The majority element appears more than half the time, so it "outvotes" everything else. Boyer-Moore voting: keep a candidate and a counter. Matching numbers add a vote, other numbers remove one. When the counter hits 0, pick a new candidate. The true majority always survives. (The simple version is a count dictionary.)',
  steps: [
    'Start with <b>candidate = None</b>, <b>count = 0</b>.',
    'For each x: if count is 0, set candidate = x.',
    'If x equals the candidate, count += 1. Otherwise count −= 1.',
    'After the loop, the candidate is the majority element.',
    'Easy alternative: count everything in a dictionary and return the key with count > n/2.'
  ]
},
'top-k-frequent': {
  idea: 'First count how often each number appears. A count can never be bigger than n, so instead of sorting, drop each number into a "bucket" numbered by its count. Then read the buckets from the highest count down.',
  steps: [
    'Count each number with a dictionary.',
    'Make n + 1 empty lists (buckets). Bucket c holds the numbers that appear exactly c times.',
    'Put every number into the bucket for its count.',
    'Go from the biggest bucket down to 1, collecting numbers.',
    'Stop as soon as you have k numbers. (Simpler O(n log n): sort by count, take the first k.)'
  ]
},
'group-anagrams': {
  idea: 'All anagrams look the same once their letters are sorted ("eat", "tea", "ate" → "aet"). Use that sorted word as a dictionary key, and every word with the same key goes into the same group.',
  steps: [
    'Make a dictionary <b>groups</b>: key → list of words.',
    'For each word, build its key = the word with its letters sorted.',
    'Append the word to <code>groups[key]</code> (create the list if it does not exist yet).',
    'Return all the lists in the dictionary.'
  ]
},
'longest-consecutive': {
  idea: 'Put every number in a set so you can check "is x + 1 here?" in one step. Only start counting from a number that BEGINS a run (x − 1 is not in the set). That way each run is counted once, so the whole thing is O(n).',
  steps: [
    'Put all numbers into a set <b>s</b>.',
    'For each x in s: if <b>x − 1</b> is in s, skip it (x is not the start of a run).',
    'Otherwise x starts a run: count up while x + 1, x + 2, … are in s.',
    'Keep the longest run length seen and return it.'
  ]
},
// ---------- PREFIX SUMS ----------
'product-except-self': {
  idea: 'The answer at i is (product of everything to the LEFT of i) × (product of everything to the RIGHT of i). Collect the left products in one pass and multiply in the right products in a second pass going backwards. No division needed.',
  steps: [
    'Make <b>answer</b> = list of 1s.',
    'Left pass: keep <b>left = 1</b>. For i from start to end: <code>answer[i] = left</code>, then <code>left *= nums[i]</code>.',
    'Right pass: keep <b>right = 1</b>. For i from end to start: <code>answer[i] *= right</code>, then <code>right *= nums[i]</code>.',
    'Return answer. Each slot now has left product × right product.'
  ]
},
'subarray-sum-k': {
  idea: 'The running total (prefix sum) up to here is cur. A subarray ending here sums to k exactly when an earlier running total was cur − k. So keep a dictionary that counts how many times each running total has appeared. It is Two Sum on running totals.',
  steps: [
    'Make <b>seen = {0: 1}</b>. The empty prefix has sum 0, which counts subarrays that start at index 0.',
    'Keep <b>cur = 0</b> (running sum) and <b>count = 0</b>.',
    'For each x: add it to cur.',
    'Add <code>seen[cur − k]</code> (0 if missing) to count. Each of those earlier prefixes starts a subarray summing to k.',
    'Then record the current total: <code>seen[cur] += 1</code>.',
    'Return count. A sliding window fails here because of negative numbers.'
  ]
},
// ---------- TWO POINTERS ----------
'valid-palindrome': {
  idea: 'A palindrome reads the same from both ends. Put one pointer at the start and one at the end, skip anything that is not a letter or digit, and compare the characters ignoring case.',
  steps: [
    'Set <b>l = 0</b>, <b>r = last index</b>.',
    'While l < r: if s[l] is not alphanumeric, move l right. If s[r] is not alphanumeric, move r left.',
    'Otherwise compare lowercase s[l] and s[r]. If they differ, return False.',
    'If they match, move both pointers inward.',
    'If the pointers meet, return True.'
  ]
},
'valid-palindrome-ii': {
  idea: 'Check from both ends like a normal palindrome. At the FIRST mismatch you are allowed one deletion, so try both options: skip the left character or skip the right one. If either remaining middle part is a palindrome, the answer is yes.',
  steps: [
    'Write a helper <b>is_pal(i, j)</b> that checks whether s[i..j] is a palindrome with two pointers.',
    'Walk l from the start and r from the end while the characters match.',
    'At the first mismatch, return <code>is_pal(l + 1, r) or is_pal(l, r − 1)</code>.',
    'If you never hit a mismatch, return True.'
  ]
},
'two-sum-sorted': {
  idea: 'The array is sorted. Start with the smallest + largest. If the sum is too small, the only way to grow it is to move the left pointer right. If it is too big, move the right pointer left. Each step rules out one number for good.',
  steps: [
    'Set <b>l = 0</b>, <b>r = last index</b>.',
    'While l < r: compute total = numbers[l] + numbers[r].',
    'If total == target, return <code>[l + 1, r + 1]</code> (this problem uses 1-based indices).',
    'If total < target, do l += 1. If total > target, do r −= 1.'
  ]
},
'three-sum': {
  idea: 'Sort the array. Fix one number a, and you need two more numbers that sum to −a. That is exactly Two Sum II on the rest of the sorted array. To avoid duplicate triplets, skip a number that equals the one before it.',
  steps: [
    'Sort nums.',
    'For each index i: if nums[i] equals nums[i − 1], skip it (same triplets again).',
    'Set l = i + 1, r = last index. While l < r, compute s = nums[i] + nums[l] + nums[r].',
    's < 0: move l right. s > 0: move r left.',
    's == 0: save the triplet, move both pointers inward, and keep moving l while it equals the previous value (skip duplicates).',
    'Return all saved triplets. O(n²).'
  ]
},
'container-water': {
  idea: 'Water held = shorter wall × distance. Start with the widest container (both ends). Moving the TALLER wall inward can never help, because width shrinks and the height is still capped by the shorter wall. So always move the shorter wall.',
  steps: [
    'l = 0, r = last index, best = 0.',
    'While l < r: area = min(height[l], height[r]) × (r − l). Update best.',
    'If height[l] < height[r], do l += 1. Otherwise r −= 1.',
    'Return best.'
  ]
},
'trapping-rain': {
  idea: 'Water above a bar = min(tallest bar on its left, tallest on its right) − its own height. With two pointers, keep the max seen from each side. Whichever side has the smaller max is the limit for its bar, so you can settle that bar right away.',
  steps: [
    'l = 0, r = last index, left_max = right_max = water = 0.',
    'While l < r: update left_max with height[l] and right_max with height[r].',
    'If left_max < right_max: the left bar is limited by left_max, so add <code>left_max − height[l]</code> and move l right.',
    'Else: add <code>right_max − height[r]</code> and move r left.',
    'Return water. (Easier to explain: build prefix-max and suffix-max arrays, then sum min(...) − height.)'
  ]
},
'move-zeroes': {
  idea: 'Use a "write" pointer w that marks where the next non-zero number should go. Read through the array. Every time you find a non-zero number, swap it into position w and move w forward. The zeros end up pushed to the back.',
  steps: [
    'Set <b>w = 0</b>.',
    'For each index i: if nums[i] is not 0, swap nums[w] and nums[i], then w += 1.',
    'When the loop ends, everything before w is non-zero (in original order) and the rest is zeros.'
  ]
},
'sort-colors': {
  idea: 'Dutch national flag: split the array into 4 zones: 0s | 1s | unknown | 2s. Look at the first unknown item. A 0 gets swapped to the front zone, a 1 just stays, and a 2 gets swapped to the back zone. One pass, no counting.',
  steps: [
    'lo = 0 (end of the 0s), mid = 0 (current item), hi = last index (start of the 2s).',
    'While mid <= hi:',
    'If nums[mid] == 0: swap with nums[lo], then lo += 1, mid += 1.',
    'If nums[mid] == 1: mid += 1.',
    'If nums[mid] == 2: swap with nums[hi], then hi −= 1. Do NOT move mid, because the item swapped in has not been checked yet.'
  ]
},
'rotate-array': {
  idea: 'Rotating right by k = moving the last k items to the front. Trick: reverse the whole array, then reverse the first k items, then reverse the rest. Each part ends up in the right order and position.',
  steps: [
    'First do <b>k = k % n</b>, because rotating n times changes nothing.',
    'Reverse the whole array.',
    'Reverse the first k elements.',
    'Reverse the remaining n − k elements.',
    'Example [1,2,3,4,5], k=2 → [5,4,3,2,1] → [4,5,3,2,1] → [4,5,1,2,3].'
  ]
},
// ---------- SLIDING WINDOW ----------
'best-time-stock': {
  idea: 'You must buy before you sell. Walk through the days, keeping the cheapest price so far. Each day, ask: "if I sell today, what profit do I get?" Keep the best answer.',
  steps: [
    'lowest = infinity, best = 0.',
    'For each price p: lowest = min(lowest, p).',
    'best = max(best, p − lowest).',
    'Return best (0 if prices only go down).'
  ]
},
'longest-substring': {
  idea: 'Keep a window [left..right] with no repeated characters. Grow it to the right one step at a time. If the new character already appears inside the window, jump left to just past its last position. Remember the last index of each character.',
  steps: [
    'last = {} (char → last index), left = 0, best = 0.',
    'For each right, ch: if ch is in last AND last[ch] >= left, set left = last[ch] + 1.',
    'Update last[ch] = right.',
    'best = max(best, right − left + 1).',
    'Return best. Never move left backwards (that is why the check is last[ch] >= left).'
  ]
},
'char-replacement': {
  idea: 'A window can be made all one letter if (window size − count of its most common letter) ≤ k, because that many letters need replacing. Grow the window. While it breaks that rule, shrink it from the left. Record the biggest valid window.',
  steps: [
    'count = {}, left = 0, max_freq = 0, best = 0.',
    'For each right: add s[right] to count, max_freq = max(max_freq, count[s[right]]).',
    'While (right − left + 1) − max_freq > k: decrease count[s[left]], left += 1.',
    'best = max(best, right − left + 1).',
    'Return best.'
  ]
},
'min-subarray-len': {
  idea: 'All numbers are positive, so adding grows the sum and removing shrinks it. Grow the window to the right. As soon as the sum reaches the target, record the length and shrink from the left to see if a shorter window still works.',
  steps: [
    'left = 0, total = 0, best = infinity.',
    'For each right: total += nums[right].',
    'While total >= target: best = min(best, right − left + 1), total −= nums[left], left += 1.',
    'Return 0 if best is still infinity, else best.'
  ]
},
'min-window': {
  idea: 'Count what t needs. Expand right until the window contains everything (missing == 0). Then shrink from the left as much as possible while it still contains everything, recording the smallest window each time.',
  steps: [
    'need = letter counts of t. missing = len(t).',
    'For each right, ch: if need[ch] > 0, missing −= 1 (a useful letter). Then need[ch] −= 1.',
    'While missing == 0 (window is valid): record the window if it is the smallest so far.',
    'Then remove s[left]: need[s[left]] += 1. If that makes it > 0, a required letter is now missing, so missing += 1. Then left += 1.',
    'Return the smallest recorded window, or "" if there was none.'
  ]
},
'find-anagrams': {
  idea: 'An anagram of p is any window of length len(p) with the same letter counts. Slide a fixed-size window: add the new letter on the right, remove the one that falls off the left, and compare the two count arrays.',
  steps: [
    'Make need = 26-count array of p, win = 26-count array (empty).',
    'For each i: add s[i] to win.',
    'If i >= m (len of p), remove s[i − m] from win so the size stays m.',
    'If win == need, record the start index i − m + 1.',
    'In JS, compare arrays element by element (=== compares references).'
  ]
},
// ---------- STACK ----------
'valid-parentheses': {
  idea: 'The most recently opened bracket must be closed first. That is last-in-first-out, so use a stack. Push opening brackets. On a closing bracket, the top of the stack must be its matching opener.',
  steps: [
    'Map each closer to its opener: <code>{")":"(", "]":"[", "}":"{"}</code>.',
    'For each char: if it is an opener, push it.',
    'If it is a closer: if the stack is empty or the popped top is not its opener, return False.',
    'At the end, return True only if the stack is empty (nothing left unclosed).'
  ]
},
'decode-string': {
  idea: 'Brackets nest, so use a stack to save "what I had built before this bracket + how many times to repeat". On "[" save the current state and start fresh. On "]" pop the saved state and attach the repeated inner string.',
  steps: [
    'cur = "" (string being built), k = 0 (number being read), stack = [].',
    'Digit: k = k × 10 + digit (numbers can have several digits).',
    '"[": push (cur, k), then reset cur = "", k = 0.',
    '"]": pop (prev, n), set cur = prev + cur × n.',
    'Letter: cur += letter.',
    'Return cur.'
  ]
},
'score-parentheses': {
  idea: 'Each open bracket starts a new level with score 0. When a level closes: if it was empty "()" it is worth 1, otherwise it doubles what was inside. That value is then added to the parent level.',
  steps: [
    'stack = [0] (the score of the outermost level).',
    '"(": push 0 (start a new level).',
    '")": v = pop(). Add <code>max(2 × v, 1)</code> to the new top. Empty means 1, otherwise it doubles.',
    'Return stack[0].'
  ]
},
'eval-rpn': {
  idea: 'In postfix (RPN) the operator comes after its two numbers. Push numbers on a stack. When you see an operator, pop two numbers, apply it, and push the result back.',
  steps: [
    'For each token: if it is a number, push int(token).',
    'If it is an operator: b = pop(), a = pop() (order matters: a is first).',
    'Push a op b. For division, truncate toward zero: <code>int(a / b)</code> in Python, <code>Math.trunc(a / b)</code> in JS.',
    'Return the last value on the stack.'
  ]
},
'daily-temperatures': {
  idea: 'Keep a stack of days still waiting for a warmer day (their temperatures go down from bottom to top). When today is warmer than the day on top, that day\'s wait is over. Pop it and record today − that day. Each day is pushed and popped once.',
  steps: [
    'answer = all 0s, stack = [] (indices).',
    'For each day i with temp t: while the stack is not empty and temp[stack top] < t:',
    '    j = pop(), answer[j] = i − j.',
    'Push i.',
    'Days left on the stack never got warmer, so their answer stays 0.'
  ]
},
'largest-rectangle': {
  idea: 'For each bar, the biggest rectangle using its height stretches until a shorter bar on each side. Keep a stack of increasing heights. When a shorter bar arrives, the bars it pops know their right edge (now) and their left edge (the new stack top).',
  steps: [
    'Add a 0 to the end of heights (a sentinel that flushes the stack at the end).',
    'For each i, h: while the stack top\'s height > h:',
    '    height = heights[pop()]. width = i if the stack is empty, else i − stack top − 1.',
    '    best = max(best, height × width).',
    'Push i. Return best.'
  ]
},
'asteroid-collision': {
  idea: 'Only a left-moving asteroid (negative) can hit right-moving ones (positive) that came before it. The stack holds survivors. A new negative asteroid keeps smashing the positive one on top until it dies, they both explode, or nothing is left to hit.',
  steps: [
    'stack = []. For each asteroid a: alive = True.',
    'While alive and a < 0 and the stack top > 0:',
    '    top smaller than |a| → pop it, keep going.',
    '    top equal to |a| → pop it, a dies too (alive = False).',
    '    top bigger → a dies (alive = False).',
    'If still alive, push a. Return the stack.'
  ]
},
'min-stack': {
  idea: 'Store each value TOGETHER with the minimum at that moment: (value, min so far). The top always knows the current min. When you pop, the older pair underneath still has the correct older min.',
  steps: [
    'push(x): new_min = x if the stack is empty, else min(x, top.min). Push (x, new_min).',
    'pop(): remove the top pair.',
    'top(): return top.value.',
    'getMin(): return top.min. Every operation is O(1).'
  ]
},
// ---------- LINKED LISTS ----------
'reverse-list': {
  idea: 'Walk through the list and flip each arrow to point backwards. Before you flip curr.next, save it, otherwise you lose the rest of the list.',
  steps: [
    'prev = None, curr = head.',
    'While curr: save nxt = curr.next.',
    'Flip: curr.next = prev.',
    'Move forward: prev = curr, curr = nxt.',
    'Return prev (the old tail, now the head).'
  ]
},
'merge-two-lists': {
  idea: 'Like merging two sorted piles of cards: always take the smaller front card. A dummy starting node means you never need a special case for the first node.',
  steps: [
    'dummy = tail = new node.',
    'While both lists have nodes: attach the smaller one to tail.next and advance that list.',
    'Move tail forward.',
    'Attach whatever is left: <code>tail.next = list1 or list2</code>.',
    'Return dummy.next.'
  ]
},
'add-two-numbers': {
  idea: 'The digits are stored backwards (ones first), which is exactly how you add by hand: add digit + digit + carry, write down % 10, and carry // 10 to the next position.',
  steps: [
    'dummy = tail = new node, carry = 0.',
    'While l1 or l2 or carry is left: total = carry + (l1 value if any) + (l2 value if any). Advance whichever lists you used.',
    'carry = total // 10. Append a node with total % 10.',
    'Return dummy.next. The "or carry" in the loop handles a final extra digit (e.g. 5 + 5 = 10).'
  ]
},
'middle-node': {
  idea: 'Send two runners: slow moves 1 step, fast moves 2. When fast reaches the end, slow has covered half the distance, so it is at the middle.',
  steps: [
    'slow = fast = head.',
    'While fast and fast.next: slow = slow.next, fast = fast.next.next.',
    'Return slow (for even length this is the second middle).'
  ]
},
'linked-list-cycle': {
  idea: 'Tortoise and hare: if there is a loop, the fast runner (2 steps) laps the slow one (1 step) and they meet. If there is no loop, fast just falls off the end.',
  steps: [
    'slow = fast = head.',
    'While fast and fast.next: slow moves 1, fast moves 2.',
    'If slow is fast (the same node), return True.',
    'If the loop ends, return False. O(1) memory (a set of visited nodes also works, but uses O(n)).'
  ]
},
'remove-nth': {
  idea: 'Put fast n + 1 steps ahead of slow, then move both together. When fast falls off the end, slow is right BEFORE the node to delete. A dummy node in front handles deleting the head.',
  steps: [
    'dummy → head. slow = fast = dummy.',
    'Move fast forward n + 1 times.',
    'Move both until fast is None.',
    'Skip the target: slow.next = slow.next.next.',
    'Return dummy.next.'
  ]
},
'palindrome-list': {
  idea: 'You cannot walk a singly linked list backwards, so make it possible: find the middle (slow/fast), reverse the second half, then compare the first half with the reversed second half node by node.',
  steps: [
    'Find the middle with slow/fast pointers.',
    'Reverse the list starting from slow (the Reverse Linked List steps). prev is the new head of the second half.',
    'Walk left = head and right = prev together. If any values differ, return False.',
    'Stop when right runs out. Return True.'
  ]
},
// ---------- BINARY SEARCH ----------
'binary-search': {
  idea: 'The array is sorted, so checking the middle tells you which half the target must be in. Throw the other half away. The search space halves every step, so it is O(log n).',
  steps: [
    'lo = 0, hi = last index.',
    'While lo <= hi: mid = (lo + hi) // 2.',
    'nums[mid] == target → return mid.',
    'nums[mid] < target → lo = mid + 1. Else hi = mid − 1.',
    'Return −1 if the loop ends.'
  ]
},
'search-rotated': {
  idea: 'After a rotation, at least ONE half around mid is still normally sorted. Find which half it is, check whether the target lies within that half\'s range, and go there. Otherwise go to the other half.',
  steps: [
    'Normal binary search loop: lo <= hi, mid, return mid if found.',
    'If nums[lo] <= nums[mid], the LEFT half is sorted: if nums[lo] <= target < nums[mid], go left (hi = mid − 1), else go right.',
    'Otherwise the RIGHT half is sorted: if nums[mid] < target <= nums[hi], go right (lo = mid + 1), else go left.',
    'Return −1 if not found.'
  ]
},
'koko-bananas': {
  idea: 'If Koko can finish at speed k, any faster speed also works. That yes/no pattern (no, no, …, yes, yes) means you can binary search the SPEED instead of an array, to find the smallest speed that works.',
  steps: [
    'hours(k) = sum of ceil(pile / k) over all piles, using <code>(p + k − 1) // k</code>.',
    'lo = 1, hi = max(piles).',
    'While lo < hi: mid = (lo + hi) // 2.',
    'If hours(mid) <= h, mid works, so try slower: hi = mid. Else lo = mid + 1.',
    'Return lo.'
  ]
},
// ---------- SORTING / GREEDY ----------
'merge-intervals': {
  idea: 'Sort by start time. Then any overlapping intervals sit next to each other. Walk through them: if the next one starts before the current block ends, extend the block. Otherwise start a new block.',
  steps: [
    'Sort intervals by start.',
    'merged = [].',
    'For each [s, e]: if merged is not empty and s <= merged[-1].end, set merged[-1].end = max(merged[-1].end, e).',
    'Otherwise append [s, e] as a new block.',
    'Return merged.'
  ]
},
'fill-cups': {
  idea: 'Each second you can fill two different types. To finish fastest, always fill the two types with the MOST cups left, so you never get stuck with only one type remaining. Shortcut: answer = max(biggest pile, ceil(total / 2)).',
  steps: [
    'Repeat: sort the three amounts biggest first.',
    'If the biggest is 0, you are done: return seconds.',
    'Fill one of the biggest, and one of the second biggest if it is > 0.',
    'seconds += 1.',
    'O(1) formula: <code>max(max(a), (sum(a) + 1) // 2)</code>.'
  ]
},
// ---------- STRINGS ----------
'longest-palindrome': {
  idea: 'Every palindrome mirrors around a center. A center is either one character (odd length "aba") or a gap between two characters (even length "abba"). From each center, expand outward while both sides match.',
  steps: [
    'expand(l, r): while l and r are in bounds and s[l] == s[r], move l left and r right. Return s[l + 1 : r].',
    'For each i, try expand(i, i) (odd) and expand(i, i + 1) (even).',
    'Keep the longest result.',
    'O(n²) time, O(1) extra space.'
  ]
},
'reverse-words': {
  idea: 'Split the string into words (split() with no argument also drops extra spaces), reverse the list of words, and join them with single spaces.',
  steps: [
    'words = s.split() (Python) / s.trim().split(/\\s+/) (JS).',
    'Reverse the list.',
    'Return " ".join(words).'
  ]
},
'longest-common-prefix': {
  idea: 'Compare the strings column by column, using the first word as a guide. At position i, every word must have the same character. The first time one does not (or a word is too short), the prefix ends there.',
  steps: [
    'first = strs[0].',
    'For each position i and character ch in first:',
    '    for every other word w: if i >= len(w) or w[i] != ch, return first[:i].',
    'If you finish, the whole first word is the prefix.'
  ]
},
'string-compression': {
  idea: 'Find each run of the same character: from i, move j forward while it is the same character. The run length is j − i. Write the character, plus the number if the run is longer than 1, then jump i to j.',
  steps: [
    'res = [], i = 0.',
    'While i < len(s): j = i. While j < len(s) and s[j] == s[i], j += 1.',
    'Append s[i]. If j − i > 1, append str(j − i).',
    'Set i = j.',
    'Return "".join(res). Build a list and join it, rather than using += in a loop.'
  ]
},
'find-replace-string': {
  idea: 'All replacements refer to positions in the ORIGINAL string, so do not edit as you go (positions would shift). First note which indices really match their source. Then build a new string left to right: at a matching index write the target and jump over the source, otherwise copy one character.',
  steps: [
    'match = {}. For each k: if s starts with sources[k] at indices[k], set match[indices[k]] = k.',
    'out = [], i = 0.',
    'While i < len(s): if i is in match, append targets[k] and do i += len(sources[k]).',
    'Else append s[i] and do i += 1.',
    'Return "".join(out).'
  ]
},
'roman-to-int': {
  idea: 'Normally you add each symbol\'s value. The only exception: if a smaller symbol comes right before a bigger one (IV, IX, XC…), it is subtracted. So look one character ahead.',
  steps: [
    'Map I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
    'For each i: if the next symbol exists and is bigger than this one, total −= value.',
    'Otherwise total += value.',
    'Return total. "MCMXCIV" → 1000 − 100 + 1000 − 10 + 100 − 1 + 5 = 1994.'
  ]
},
'int-to-roman': {
  idea: 'Greedy, like giving change: always use the biggest symbol that fits. Add the 6 special pairs (CM, CD, XC, XL, IX, IV) to the table, and a plain loop then handles every case.',
  steps: [
    'Table from biggest to smallest: 1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC, 50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I.',
    'For each (value, symbol): while num >= value, append the symbol and subtract the value.',
    'Return the joined string.'
  ]
},
// ---------- MATRIX ----------
'spiral-matrix': {
  idea: 'Peel the matrix like an onion. Keep 4 walls (top, bottom, left, right). Go right along the top row, down the right column, left along the bottom row, and up the left column. After each side, move that wall inward.',
  steps: [
    'top = 0, bottom = rows − 1, left = 0, right = cols − 1.',
    'While top <= bottom and left <= right:',
    '    read the top row left→right, then top += 1.',
    '    read the right column top→bottom, then right −= 1.',
    '    if top <= bottom: read the bottom row right→left, then bottom −= 1.',
    '    if left <= right: read the left column bottom→top, then left += 1.',
    'The two "if" checks stop a single leftover row or column from being read twice.'
  ]
},
'rotate-image': {
  idea: 'A 90° clockwise turn = transpose (flip over the main diagonal, so rows become columns) + reverse each row. Both steps work in place.',
  steps: [
    'Transpose: for r in range(n), for c in range(r + 1, n), swap m[r][c] and m[c][r].',
    'Reverse every row.',
    'Done. (Counter-clockwise: transpose, then reverse each column.)'
  ]
},
// ---------- DP ----------
'climbing-stairs': {
  idea: 'To reach step n, your last move was either 1 step (from n − 1) or 2 steps (from n − 2). So ways(n) = ways(n − 1) + ways(n − 2), which is Fibonacci. You only need the last two values.',
  steps: [
    'a = 1 (ways to reach step 0), b = 1 (ways to reach step 1).',
    'Repeat n − 1 times: a, b = b, a + b.',
    'Return b.'
  ]
},
'house-robber': {
  idea: 'At each house you choose: SKIP it (keep the best so far) or ROB it (its money + the best from two houses back). Take the larger. You only need the last two best values.',
  steps: [
    'prev2 = 0 (best up to two houses back), prev1 = 0 (best up to the previous house).',
    'For each house x: new = max(prev1, prev2 + x).',
    'Shift: prev2 = prev1, prev1 = new.',
    'Return prev1.'
  ]
},
'max-subarray': {
  idea: 'Kadane: for each element, the best subarray ENDING here either extends the previous one or starts fresh at this element (if the previous sum would only drag it down). Track the best of those over the whole array.',
  steps: [
    'cur = best = nums[0].',
    'For each next x: cur = max(x, cur + x) (start fresh or extend).',
    'best = max(best, cur).',
    'Return best. This works even when all numbers are negative.'
  ]
},
'coin-change': {
  idea: 'dp[a] = fewest coins to make amount a. To make a, the last coin was some c, so dp[a] = dp[a − c] + 1, and you pick the best over all coins. Build up from 0. Greedy (biggest coin first) can fail, e.g. coins [1, 3, 4] and amount 6.',
  steps: [
    'dp = [0, ∞, ∞, …] up to amount (0 coins make amount 0).',
    'For a from 1 to amount: for each coin c <= a: dp[a] = min(dp[a], dp[a − c] + 1).',
    'Return −1 if dp[amount] is still ∞, else dp[amount].'
  ]
},
'word-break': {
  idea: 'dp[i] = "can the first i characters be split into dictionary words?" That is true if some earlier split point j is true AND the piece s[j:i] is a word.',
  steps: [
    'words = set(wordDict). dp = [False] × (n + 1), dp[0] = True (the empty prefix).',
    'For i from 1 to n: for j from 0 to i − 1:',
    '    if dp[j] and s[j:i] is in words, set dp[i] = True and break.',
    'Return dp[n].'
  ]
},
'lis': {
  idea: 'dp[i] = length of the longest increasing subsequence that ENDS at index i. Look back at every earlier j with a smaller value: you can extend that subsequence by one. The answer is the largest dp value.',
  steps: [
    'dp = [1] × n (each element alone is length 1).',
    'For each i: for each j < i: if nums[j] < nums[i], dp[i] = max(dp[i], dp[j] + 1).',
    'Return max(dp). O(n²). An O(n log n) version uses binary search on "tails".'
  ]
},
// ---------- GRAPHS ----------
'num-islands': {
  idea: 'Scan every cell. When you hit land ("1") that you have not visited, you found a new island: count it, then "sink" the whole island with DFS (turn its connected land to "0") so you never count it again.',
  steps: [
    'sink(r, c): if out of bounds or not "1", return. Set it to "0". Call sink on all 4 neighbours.',
    'For every cell: if it is "1", count += 1 and sink(r, c).',
    'Return count.'
  ]
},
'rotting-oranges': {
  idea: 'All rotten oranges spread at the same time, so start a BFS from ALL of them at once (multi-source). Each BFS layer is one minute. At the end, if any fresh orange is left, it was unreachable.',
  steps: [
    'Put every rotten orange in a queue. Count the fresh ones.',
    'minutes = 0. While the queue is not empty and fresh > 0:',
    '    process exactly len(queue) items (one layer). For each fresh neighbour: make it rotten, fresh −= 1, add it to the queue.',
    '    minutes += 1.',
    'Return minutes if fresh == 0, else −1.'
  ]
},
'water-jug': {
  idea: 'Think of the TOTAL water as the state. Each move changes the total by +x, −x, +y or −y, and it must stay between 0 and x + y. BFS from 0 over these states and see if you reach the target. Math shortcut: possible iff target <= x + y and target % gcd(x, y) == 0.',
  steps: [
    'If target > x + y, return False.',
    'BFS: queue = [0], seen = {0}.',
    'Pop cur. If cur == target, return True.',
    'For d in (x, −x, y, −y): nxt = cur + d. If 0 <= nxt <= x + y and it is unseen, add it.',
    'Return False if the queue empties.'
  ]
},
// ---------- BACKTRACKING ----------
'subsets': {
  idea: 'For each element you make a yes/no choice: include it or not. Recursion walks every combination of choices, and each complete path is one subset. Add, explore, then remove (undo) before trying the other choice.',
  steps: [
    'res = [], path = [].',
    'bt(i): if i == len(nums), save a COPY of path (path[:]) and return.',
    'Choose: path.append(nums[i]), bt(i + 1), then undo: path.pop().',
    'Skip: bt(i + 1).',
    'Call bt(0). There are 2ⁿ subsets.'
  ]
},
'combination-sum': {
  idea: 'Build combinations by trying candidates in order. Because you may reuse a number, recurse with the SAME index i. Because you never go back to earlier indices, you never produce the same combination in a different order.',
  steps: [
    'bt(start, remaining): if remaining == 0, save a copy of path. If remaining < 0, return.',
    'For i from start to the end: path.append(c[i]), bt(i, remaining − c[i]), path.pop().',
    'Call bt(0, target).',
    'Using bt(i + 1, …) instead would mean each number is used at most once.'
  ]
},
// ---------- COMPLEXITY / MATH ----------
'min-max-two': {
  idea: 'One pass, without sorting: keep the two smallest (s1 <= s2) and the two largest (l1 >= l2). When a new best arrives, the old best slides down to second place.',
  steps: [
    's1 = s2 = +∞, l1 = l2 = −∞.',
    'For each x: if x < s1, then s2 = s1, s1 = x. Elif x < s2, then s2 = x.',
    'If x > l1, then l2 = l1, l1 = x. Elif x > l2, then l2 = x.',
    'Return [s1, s2, l2, l1]. O(n) time vs O(n log n) for sorting.'
  ]
},
'frequent-days': {
  idea: '365 = 52 weeks + 1 day, so every weekday appears 52 times, plus the weekday of Jan 1 gets one extra. In a leap year (366 days) Jan 1 AND the next weekday both get an extra.',
  steps: [
    'w = weekday of Jan 1 (Monday = 0).',
    'Leap year: divisible by 4 and not by 100, or divisible by 400.',
    'days = [w, (w + 1) % 7] if leap else [w].',
    'Return their names sorted Monday first. In JS, use Date.UTC + getUTCDay so the time zone cannot shift the day.'
  ]
}
};
