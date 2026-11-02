// Revision portal content: pattern groups (in revision order), sub-clusters of similar problems,
// the bridge from each group to the next, per-problem connections, and tips for unseen questions.
window.REV_GROUPS = [
{
  id: 'hashmap', title: 'Hashing: maps, sets & counting',
  concept: 'Trade memory for speed: a set/map answers "have I seen X?" or "how many X?" in O(1), turning a nested O(n²) search into a single O(n) pass.',
  spot: 'pair / complement, duplicates, frequency, anagram, group by, "seen before", first unique',
  clusters: [
    { title: 'Seen-before / complement lookup', ids: ['two-sum', 'contains-duplicate', 'remove-duplicates'], note: 'One pass. Before inserting x, ask the set/map about x (or target − x).' },
    { title: 'Counting (frequency map)', ids: ['valid-anagram', 'first-unique-char', 'majority-element', 'top-k-frequent'], note: 'Pass 1 builds counts, pass 2 decides. The 26-letter array is O(1) space.' },
    { title: 'Canonical key → bucket', ids: ['group-anagrams'], note: 'Things that are "the same" map to one key: a sorted string or a count tuple.' },
    { title: 'Set membership to skip work', ids: ['longest-consecutive'], note: 'Only start counting from elements that begin a run (x − 1 not in the set).' }
  ],
  bridge: 'Two Sum looks up target − x. Subarray Sum = K applies the same lookup to running totals (prefix − k), which leads straight into prefix sums.'
},
{
  id: 'prefixsum', title: 'Prefix sums',
  concept: 'Precompute running totals (or products) so that any range answer is a subtraction: sum(i..j) = pre[j+1] − pre[i].',
  spot: 'subarray sum, range query, "everything except i", negatives in the array',
  clusters: [
    { title: 'Running totals from the left (and right)', ids: ['product-except-self', 'subarray-sum-k'], note: 'Left pass × right pass, or a prefix value plus a hashmap of earlier prefixes.' }
  ],
  bridge: 'Prefix sums handle contiguous ranges with negatives. With non-negative values the range can simply grow and shrink, which brings in pointers.'
},
{
  id: 'twopointers', title: 'Two pointers',
  concept: 'Two indices replace a nested loop. Opposite ends converge on sorted or symmetric data. Same-direction read/write pointers filter in place.',
  spot: 'sorted array, palindrome, pair/triplet sum, in place, O(1) space, "move all X to the end"',
  clusters: [
    { title: 'Opposite ends, converge inward', ids: ['valid-palindrome', 'valid-palindrome-ii', 'two-sum-sorted', 'three-sum', 'container-water', 'trapping-rain'], note: 'Each step discards one side for good. Ask: "which pointer can never be part of a better answer?"' },
    { title: 'Same direction: reader + writer (in place)', ids: ['move-zeroes', 'sort-colors', 'rotate-array'], note: 'The fast pointer reads, the slow pointer marks where the next kept item goes. Rotation = three reversals.' }
  ],
  bridge: 'If both pointers move in the same direction and you care about everything between them, that is a sliding window.'
},
{
  id: 'slidingwindow', title: 'Sliding window',
  concept: 'Keep a contiguous window [l, r]. Expand r every step, and shrink l while the window breaks the rule (longest) or while it still satisfies it (shortest). Each index enters and leaves once, so O(n).',
  spot: 'longest / shortest substring or subarray, "at most k", "contains all of", fixed length k',
  clusters: [
    { title: 'Degenerate window: best so far', ids: ['best-time-stock'], note: 'Keep the min price on the left. The window is "everything before today".' },
    { title: 'Variable window: LONGEST valid', ids: ['longest-substring', 'char-replacement'], note: 'Shrink while INVALID, then record r − l + 1.' },
    { title: 'Variable window: SHORTEST valid', ids: ['min-subarray-len', 'min-window'], note: 'Shrink while VALID, recording inside the loop.' },
    { title: 'Fixed-size window', ids: ['find-anagrams'], note: 'Add s[r], remove s[r − k], compare counts.' }
  ],
  bridge: 'A window remembers a range. When you need the most recent unresolved item instead (last open bracket, last colder day), use a stack.'
},
{
  id: 'stack', title: 'Stack & monotonic stack',
  concept: 'LIFO: the most recent unresolved thing is on top. A monotonic stack keeps indices in sorted order, so each element is pushed and popped once and "next greater/smaller" costs O(n).',
  spot: 'brackets / nesting, decode, evaluate expression, next greater/smaller, collisions, undo, "min so far" in O(1)',
  clusters: [
    { title: 'Matching & nesting', ids: ['valid-parentheses', 'decode-string', 'score-parentheses', 'eval-rpn'], note: 'Open = push context. Close = pop and combine into the parent.' },
    { title: 'Monotonic stack (next greater / smaller)', ids: ['daily-temperatures', 'largest-rectangle'], note: 'while stack and current beats top: pop and resolve the popped index.' },
    { title: 'New item cancels recent items', ids: ['asteroid-collision'], note: 'The same while-pop loop, with a collision rule.' },
    { title: 'Augmented stack', ids: ['min-stack'], note: 'Store extra info (the running min) next to each element.' }
  ],
  bridge: 'Stacks and linked lists both come down to pointer bookkeeping. Linked lists also bring back two pointers (fast/slow).'
},
{
  id: 'linkedlist', title: 'Linked lists',
  concept: 'No random access, so everything is pointer surgery. Save next before rewiring. A dummy head removes the special cases at the head. Fast/slow pointers find the middle, cycles, and the k-th node from the end.',
  spot: 'reverse, merge, nth from end, middle, cycle, palindrome list, digits stored in nodes',
  clusters: [
    { title: 'Rewire & build (dummy head)', ids: ['reverse-list', 'merge-two-lists', 'add-two-numbers'], note: 'prev/curr/next for reversing, dummy + tail for building.' },
    { title: 'Fast & slow pointers', ids: ['middle-node', 'linked-list-cycle', 'remove-nth', 'palindrome-list'], note: 'Speed 1 vs 2 finds the middle or a cycle. A fixed gap of n finds the n-th from the end.' }
  ],
  bridge: 'Pointers that throw away half the search space every step: binary search.'
},
{
  id: 'binarysearch', title: 'Binary search (incl. on the answer)',
  concept: 'If a yes/no test is monotonic (false…false true…true), you can find the boundary in O(log n). That works on an array, and also on the range of possible answers.',
  spot: 'sorted / rotated array, O(log n) required, "minimum X such that…", "maximum capacity/speed"',
  clusters: [
    { title: 'Search in an array', ids: ['binary-search', 'search-rotated'], note: 'lo <= hi, mid ± 1. In a rotated array, one half is always sorted: check whether the target is in it.' },
    { title: 'Binary search on the answer', ids: ['koko-bananas'], note: 'lo = smallest possible, hi = largest possible, feasible(mid) decides the direction.' }
  ],
  bridge: 'Binary search needs order. Sorting first is the other big "make it ordered, then sweep" move, used for intervals and greedy.'
},
{
  id: 'intervals', title: 'Sorting, intervals & greedy',
  concept: 'Sort to bring related items next to each other, then sweep once. Greedy: make the locally best choice, and be able to argue why it never hurts.',
  spot: 'intervals, overlapping, meetings, merge ranges, "minimum time/steps" with a simple rule',
  clusters: [
    { title: 'Sort + sweep', ids: ['merge-intervals'], note: 'Sort by start. Overlap if start ≤ last end, then extend the end with max.' },
    { title: 'Greedy with a formula', ids: ['fill-cups'], note: 'Always serve the two biggest. Answer = max(biggest, ceil(total / 2)).' }
  ],
  bridge: 'Many string problems are the same scans (runs, sweeps, lookups) on characters.'
},
{
  id: 'strings', title: 'String manipulation',
  concept: 'Scan with an index, group runs, look one ahead, and build output with a list + join (strings are immutable). Know split/join/strip/zip by heart.',
  spot: 'parse, compress, reverse words, prefix, roman numerals, replace at indices, palindromic substring',
  clusters: [
    { title: 'Expand around center', ids: ['longest-palindrome'], note: '2n − 1 centers (odd and even), expand while the ends match.' },
    { title: 'Scan & build', ids: ['reverse-words', 'longest-common-prefix', 'string-compression', 'find-replace-string'], note: 'Inner while loop for runs. Never edit in place while reading positions from the original.' },
    { title: 'Lookup tables', ids: ['roman-to-int', 'int-to-roman'], note: 'Put the special cases (IV, IX…) in the table, or look one character ahead.' }
  ],
  bridge: 'A 2D string is a grid. Matrix problems are index arithmetic on rows and columns.'
},
{
  id: 'matrix', title: 'Matrix traversal',
  concept: 'Simulate with boundaries (top, bottom, left, right) or break the operation into simple transforms (transpose, reflect).',
  spot: 'spiral, rotate 90°, set zeroes, diagonal, layer by layer',
  clusters: [
    { title: 'Boundaries & transforms', ids: ['spiral-matrix', 'rotate-image'], note: 'Shrink the boundaries after each side. Rotate = transpose + reverse each row.' }
  ],
  bridge: 'Grids also hide overlapping subproblems (DP) and connectivity (graphs). Next is DP, which is "recursion + memory".'
},
{
  id: 'dp', title: 'Dynamic programming basics',
  concept: 'Define dp[i] in words, write it from smaller states (the recurrence), set the base cases, and pick the iteration order. If dp[i] only needs the last 1–2 states, keep just those variables.',
  spot: 'count the ways, min/max cost, "can you reach/form", choices with constraints, overlapping recursion',
  clusters: [
    { title: 'Fibonacci-like: last 1–2 states', ids: ['climbing-stairs', 'house-robber', 'max-subarray'], note: 'dp[i] = f(dp[i−1], dp[i−2]). O(1) space with two variables.' },
    { title: 'Reach a target with reusable pieces', ids: ['coin-change', 'word-break'], note: 'dp[total] = best over each piece p of dp[total − p].' },
    { title: 'Look back over every j < i', ids: ['lis'], note: 'dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i].' }
  ],
  bridge: 'When the state is a cell or a configuration and you need reachability or the fewest steps, that is a graph search.'
},
{
  id: 'graph', title: 'Grids & graphs: BFS / DFS',
  concept: 'Nodes + edges (grid cells, puzzle states). DFS/flood fill counts connected components. BFS level by level gives the fewest steps. Always mark nodes visited.',
  spot: 'islands, regions, connected, shortest steps, spreading over time, puzzle states',
  clusters: [
    { title: 'Flood fill / components (DFS)', ids: ['num-islands'], note: 'Loop over cells. On unvisited land, count += 1 and sink the whole island.' },
    { title: 'BFS by layers', ids: ['rotting-oranges', 'water-jug'], note: 'Multi-source queue, one layer = one minute. States + moves = graph.' }
  ],
  bridge: 'DFS that undoes its choice to explore every option is backtracking.'
},
{
  id: 'backtracking', title: 'Recursion & backtracking',
  concept: 'Choose → explore → un-choose. Generates all subsets/combinations/permutations. Use a start index to avoid duplicate combinations, and copy the path when saving it.',
  spot: '"all possible", generate, combinations, permutations, n ≤ 20',
  clusters: [
    { title: 'Choose / explore / un-choose', ids: ['subsets', 'combination-sum'], note: 'Combination Sum recurses with i (reuse allowed), Subsets with i + 1.' }
  ],
  bridge: 'Last group: the complexity reasoning that ties all of this together.'
},
{
  id: 'complexity', title: 'Complexity & math shortcuts',
  concept: 'Before you code, say the target complexity. Look for a one-pass scan or an arithmetic shortcut that removes the loop or the sort entirely.',
  spot: '"without sorting", "in one pass", calendar/number puzzles, "explain the complexity"',
  clusters: [
    { title: 'One pass instead of sorting / math instead of simulating', ids: ['min-max-two', 'frequent-days'], note: 'Track the top 2 by shifting values down. 365 = 52·7 + 1.' }
  ],
  bridge: ''
}
];

// id -> [[relatedId, 'how they connect'], ...]
window.REV_CONN = {
  'two-sum': [['two-sum-sorted', 'Same question on sorted input: two pointers, O(1) space'], ['subarray-sum-k', 'Same complement lookup, but on prefix sums (prefix − k)'], ['three-sum', 'Fix one number, then it is Two Sum on the rest']],
  'contains-duplicate': [['two-sum', 'Set of seen values vs map of seen value → index'], ['longest-substring', 'A window with no duplicates is the same set check, made incremental']],
  'remove-duplicates': [['contains-duplicate', 'Same seen-set, but you also keep the output order'], ['move-zeroes', 'Sorted + in place version = read/write pointers']],
  'valid-anagram': [['find-anagrams', 'Same count comparison inside a sliding window'], ['group-anagrams', 'Sorted letters become the grouping key']],
  'first-unique-char': [['valid-anagram', 'Same first counting pass'], ['majority-element', 'Count, then pick by a rule']],
  'majority-element': [['top-k-frequent', 'k = 1 version of "most frequent"'], ['first-unique-char', 'Count, then pick by a rule']],
  'top-k-frequent': [['majority-element', 'Count, then pick the largest'], ['group-anagrams', 'Map of key → list is the bucket idea again']],
  'group-anagrams': [['valid-anagram', 'Canonical form = sorted string'], ['top-k-frequent', 'Bucketing values by a key']],
  'longest-consecutive': [['contains-duplicate', 'Set membership in O(1)'], ['merge-intervals', 'The sort-first version is O(n log n). The set version is O(n)']],
  'product-except-self': [['trapping-rain', 'Same left pass + right pass shape (prefix max / suffix max)'], ['subarray-sum-k', 'Prefix accumulation, product instead of sum']],
  'subarray-sum-k': [['two-sum', 'Look up prefix − k, like target − x'], ['min-subarray-len', 'Without negatives a window works. With negatives you need prefix sums']],
  'valid-palindrome': [['valid-palindrome-ii', 'Same loop, plus one branch on mismatch'], ['longest-palindrome', 'Converge inward vs expand outward from a center'], ['palindrome-list', 'Same check on a list: middle + reverse']],
  'valid-palindrome-ii': [['valid-palindrome', 'Base pattern'], ['longest-palindrome', 'Another palindrome variant using a helper that checks a range']],
  'two-sum-sorted': [['two-sum', 'Unsorted version uses a hashmap'], ['three-sum', 'Becomes the inner loop of 3Sum']],
  'three-sum': [['two-sum-sorted', 'Inner loop is Two Sum II'], ['two-sum', 'k-Sum always reduces to 2-Sum']],
  'container-water': [['trapping-rain', 'Move the shorter side. The bottleneck decides'], ['largest-rectangle', 'Area = width × limiting height']],
  'trapping-rain': [['container-water', 'Two pointers moving the smaller side'], ['product-except-self', 'Prefix-max + suffix-max arrays version'], ['daily-temperatures', 'A monotonic stack solves it too']],
  'move-zeroes': [['remove-duplicates', 'Read/write pointer filtering'], ['sort-colors', 'Two zones → three zones']],
  'sort-colors': [['move-zeroes', 'The 2-zone partition this extends'], ['three-sum', 'Also sorts and splits values by pointers']],
  'rotate-array': [['reverse-words', 'Reverse everything, then reverse each part'], ['rotate-image', 'Rotation = composed simple transforms']],
  'best-time-stock': [['max-subarray', 'Kadane on the daily price differences gives the same answer'], ['min-stack', 'Running minimum']],
  'longest-substring': [['char-replacement', 'Same longest-window template, different validity rule'], ['contains-duplicate', 'The window rule is "no duplicates"']],
  'char-replacement': [['longest-substring', 'Same template'], ['majority-element', 'Valid when window − (count of most frequent char) ≤ k']],
  'min-subarray-len': [['min-window', 'Shortest window: record inside the shrink loop'], ['subarray-sum-k', 'Negatives break the window, so use prefix sums']],
  'min-window': [['min-subarray-len', 'Same shrink-while-valid'], ['find-anagrams', 'Same need-count bookkeeping']],
  'find-anagrams': [['valid-anagram', 'Count compare'], ['min-window', 'Window + counts of the target']],
  'valid-parentheses': [['score-parentheses', 'Same push/pop with a value per level'], ['asteroid-collision', 'Pop while the top cancels']],
  'decode-string': [['score-parentheses', 'Push the outer context, fold on close'], ['valid-parentheses', 'Nesting = stack']],
  'score-parentheses': [['decode-string', 'Same "save outer, combine on close"'], ['valid-parentheses', 'Base pattern']],
  'eval-rpn': [['decode-string', 'Pop operands, combine, push the result'], ['valid-parentheses', 'Stack evaluation']],
  'daily-temperatures': [['largest-rectangle', 'Next smaller instead of next greater, from both sides'], ['asteroid-collision', 'Same while-pop loop']],
  'largest-rectangle': [['daily-temperatures', 'Monotonic stack basics'], ['container-water', 'Width × limiting height']],
  'asteroid-collision': [['valid-parentheses', 'New item cancels the top'], ['daily-temperatures', 'while-pop loop']],
  'min-stack': [['min-max-two', 'Track running bests'], ['best-time-stock', 'Running minimum']],
  'reverse-list': [['palindrome-list', 'Reverse the second half'], ['rotate-array', 'Reversal as a building block']],
  'merge-two-lists': [['add-two-numbers', 'Dummy head + loop while either list remains'], ['merge-intervals', 'Merging sorted sequences']],
  'add-two-numbers': [['merge-two-lists', 'Same two-list walk with a dummy head'], ['reverse-list', 'If the digits are stored forward, reverse first']],
  'middle-node': [['linked-list-cycle', 'Same fast/slow loop'], ['palindrome-list', 'Step 1 of palindrome list']],
  'linked-list-cycle': [['middle-node', 'Fast/slow'], ['contains-duplicate', 'Set-of-seen-nodes alternative, O(n) space']],
  'remove-nth': [['middle-node', 'A fixed gap instead of different speeds'], ['merge-two-lists', 'Dummy head handles removing the head']],
  'palindrome-list': [['middle-node', 'Find the middle'], ['reverse-list', 'Reverse the second half'], ['valid-palindrome', 'Compare both halves']],
  'binary-search': [['search-rotated', 'Modified condition'], ['koko-bananas', 'Search the answer space instead of an array']],
  'search-rotated': [['binary-search', 'Base template, plus "which half is sorted?"'], ['koko-bananas', 'Also a modified test inside the same loop']],
  'koko-bananas': [['binary-search', 'Same loop, feasible(mid) as the test'], ['min-subarray-len', 'Both minimise something subject to a condition']],
  'merge-intervals': [['longest-consecutive', 'Finding runs of adjacent values'], ['merge-two-lists', 'Merging in sorted order']],
  'fill-cups': [['frequent-days', 'Math beats simulation'], ['water-jug', 'Formula vs search']],
  'longest-palindrome': [['valid-palindrome', 'Expand outward vs converge inward'], ['palindrome-list', 'Palindrome family']],
  'reverse-words': [['rotate-array', 'Reverse all, then reverse each word (in place version)'], ['string-compression', 'Build with a list + join']],
  'longest-common-prefix': [['reverse-words', 'Free points from string builtins (zip / startswith)'], ['string-compression', 'Scan and stop at the first change']],
  'string-compression': [['reverse-words', 'Build output with a list + join'], ['longest-consecutive', 'Counting runs']],
  'find-replace-string': [['string-compression', 'Build a new string in one pass'], ['merge-intervals', 'Process edits sorted by index']],
  'roman-to-int': [['int-to-roman', 'Reverse direction, same table'], ['eval-rpn', 'Token-by-token parsing']],
  'int-to-roman': [['roman-to-int', 'Same table'], ['coin-change', 'Greedy works for Roman values but not for arbitrary coins, which need DP']],
  'spiral-matrix': [['rotate-image', 'Layer-by-layer thinking'], ['num-islands', 'Grid indexing + bounds checks']],
  'rotate-image': [['spiral-matrix', 'Layers'], ['rotate-array', 'Rotation through composed transforms']],
  'climbing-stairs': [['house-robber', 'Same two-variable DP'], ['coin-change', 'Ways/min over the last move']],
  'house-robber': [['climbing-stairs', 'dp[i] from i−1 and i−2'], ['max-subarray', 'Take/skip at each step']],
  'max-subarray': [['best-time-stock', 'Same scan in disguise'], ['house-robber', '"Best ending here" DP']],
  'coin-change': [['climbing-stairs', 'Over the last coin instead of the last step'], ['word-break', 'Same reach-the-target DP'], ['combination-sum', 'List all combos → backtracking']],
  'word-break': [['coin-change', 'Pieces = dictionary words'], ['lis', 'Look back over j < i']],
  'lis': [['word-break', 'Look-back DP'], ['longest-consecutive', 'Do not confuse: consecutive VALUES vs increasing SUBSEQUENCE']],
  'num-islands': [['rotting-oranges', 'Same grid neighbours, BFS instead of DFS'], ['spiral-matrix', 'Bounds checks on a grid']],
  'rotting-oranges': [['num-islands', 'Grid graph'], ['water-jug', 'BFS on states']],
  'water-jug': [['rotting-oranges', 'BFS'], ['fill-cups', 'Spot the math shortcut']],
  'subsets': [['combination-sum', 'Same recursion with a start index'], ['house-robber', 'Take/skip choices, but all of them instead of the best']],
  'combination-sum': [['subsets', 'Template'], ['coin-change', 'Count/min version = DP']],
  'min-max-two': [['best-time-stock', 'One pass keeping the best so far'], ['top-k-frequent', 'k = 2 special case of top-k'], ['min-stack', 'Running min']],
  'frequent-days': [['fill-cups', 'Formula over simulation'], ['min-max-two', 'Complexity talk']]
};

// Unseen-question toolkit, shown at the end.
window.REV_TIPS = {
  keywords: [
    ['"pair", "complement", "seen before", "duplicate"', 'Hashmap / set', 'two-sum'],
    ['"count", "frequency", "anagram", "most common"', 'Counter / 26-array', 'valid-anagram'],
    ['"sorted array", "pair sum", "palindrome", "in place"', 'Two pointers', 'two-sum-sorted'],
    ['"longest/shortest substring or subarray", "at most k", "window of size k"', 'Sliding window', 'longest-substring'],
    ['"subarray sum = k" with negatives, "range sum"', 'Prefix sum + hashmap', 'subarray-sum-k'],
    ['"brackets", "nested", "decode", "evaluate"', 'Stack', 'valid-parentheses'],
    ['"next greater/smaller", "days until", "span"', 'Monotonic stack', 'daily-temperatures'],
    ['"middle", "cycle", "k-th from end" (list)', 'Fast & slow pointers', 'middle-node'],
    ['"sorted / rotated", "O(log n)", "minimum X that works"', 'Binary search (on the answer)', 'koko-bananas'],
    ['"intervals", "overlap", "meetings"', 'Sort by start + sweep', 'merge-intervals'],
    ['"number of ways", "min cost", "can you form"', 'DP', 'coin-change'],
    ['"islands", "regions", "connected"', 'DFS flood fill', 'num-islands'],
    ['"minimum steps/time", "spreads"', 'BFS by layers', 'rotting-oranges'],
    ['"all combinations/subsets/permutations"', 'Backtracking', 'subsets'],
    ['"top k", "k-th largest"', 'Heap (heapq) or bucket sort', 'top-k-frequent']
  ],
  constraints: [
    ['n ≤ 20', 'O(2ⁿ) / O(n!)', 'backtracking, bitmask'],
    ['n ≤ 500', 'O(n³)', 'triple loop, interval DP'],
    ['n ≤ 10⁴', 'O(n²)', 'nested loops, look-back DP'],
    ['n ≤ 10⁵ – 10⁶', 'O(n) / O(n log n)', 'hashmap, two pointers, window, sort, heap'],
    ['n or value ≥ 10⁹', 'O(log n) / O(1)', 'binary search on the answer, math formula']
  ],
  variants: [
    ['Pairs with difference k', 'Two Sum with x + k / x − k lookups', 'two-sum'],
    ['Longest subarray with sum k (negatives allowed)', 'Prefix sum + map of FIRST index of each prefix', 'subarray-sum-k'],
    ['Longest substring with at most k distinct chars', 'Longest-window template, valid while len(counts) ≤ k', 'char-replacement'],
    ['Permutation in string / contains an anagram', 'Fixed window + counts, return true on the first match', 'find-anagrams'],
    ['Next smaller element / previous greater', 'Monotonic stack, flip the comparison or the direction', 'daily-temperatures'],
    ['Merge k sorted lists', 'Merge two lists + a heap of heads', 'merge-two-lists'],
    ['Start of the cycle in a list', 'Floyd: after meeting, reset one pointer to head, move both by 1', 'linked-list-cycle'],
    ['First bad version / sqrt(x) / ship packages in D days', 'Binary search on the answer', 'koko-bananas'],
    ['Insert interval / meeting rooms', 'Sort + sweep (rooms = count overlaps with a heap of end times)', 'merge-intervals'],
    ['House Robber on a circle', 'Run the linear DP twice: without the first, without the last', 'house-robber'],
    ['Minimum path sum / unique paths in a grid', '2D DP: dp[r][c] from the top and the left', 'climbing-stairs'],
    ['Number of provinces / friend circles', 'Islands on an adjacency matrix', 'num-islands'],
    ['Permutations', 'Subsets template + a used[] array instead of a start index', 'subsets'],
    ['Rotate a list by k / reverse in groups', 'Reversal + pointer surgery', 'reverse-list']
  ],
  stuck: [
    'Restate input → output in one line and work through a tiny example by hand. The steps you do by hand are the algorithm.',
    'Write the brute force first (out loud or on paper). Name its cost.',
    'Find the repeated work in the brute force: an inner search → hashmap. Re-summing a range → prefix sum / window. Re-scanning for the nearest bigger → monotonic stack. Same sub-call twice → DP memo.',
    'Ask "would sorting help?" Sorting costs O(n log n) and unlocks two pointers, binary search and sweeps.',
    'Ask "what do I need to remember from the left?" That one variable or structure is usually the whole trick (min so far, last seen index, counts).',
    'Map it to a problem you have solved (the variants table above). Most "new" questions are a known one with one rule changed.',
    'At 15 minutes with no idea: submit a correct brute force. A working O(n²) solution scores more than a broken O(n) one.'
  ],
  edges: ['empty input', 'single element', 'all equal', 'all negative / zeros', 'duplicates', 'already sorted / reverse sorted', 'k = 0, k > n (take k % n)', 'answer at index 0 or at the end', 'integer overflow / division sign (JS: Math.trunc)', 'head-node removal in lists (use a dummy)'],
  gotchas: {
    py: ['Copy the path when saving it in backtracking: res.append(path[:])', '// floors toward −∞: −7 // 2 == −4. Use int(a / b) to truncate', 'Never use a mutable default argument (def f(x=[]))', 'collections.Counter, defaultdict(list), heapq, deque are allowed and save time', 'Deep recursion (> ~1000): sys.setrecursionlimit or switch to iterative BFS/DFS', 'Build strings with a list + "".join(...), not += in a loop'],
    js: ['arr.sort() sorts as strings: use arr.sort((a, b) => a - b)', '[1,2] === [1,2] is false: compare element-wise or with join', 'Integer division: Math.trunc(a / b) (or Math.floor for non-negative values)', 'Use Map/Set rather than plain objects for counts with non-string keys', 'new Array(n).fill([]) shares ONE array: use Array.from({length: n}, () => [])', 'String chars: s[i], s.charCodeAt(i) - 97 for a 26-array index']
  }
};
