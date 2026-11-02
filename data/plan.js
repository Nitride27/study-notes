// Weekend plan. `problems` = core; `extra` = optional if ahead of schedule (most-reported topics). Exam: Mon 2 Nov 2026, 07:30 NPT.
// Highlighted problems. A source string = candidates named this exact problem (★ Reported, shown as the tooltip);
// 'pick' = classic problem for a topic Leapfrog candidates reported.
window.LF_HOT = Object.assign(
  Object.fromEntries(['two-sum-sorted', 'contains-duplicate', 'top-k-frequent', 'subarray-sum-k', 'product-except-self',
    'three-sum', 'container-water', 'move-zeroes', 'rotate-array', 'longest-substring', 'best-time-stock', 'min-subarray-len',
    'reverse-words', 'string-compression', 'merge-intervals', 'max-subarray', 'min-stack', 'valid-palindrome-ii',
    'daily-temperatures', 'eval-rpn', 'reverse-list', 'merge-two-lists', 'linked-list-cycle', 'remove-nth', 'middle-node'].map(id => [id, 'pick'])),
  {
    'two-sum': 'Glassdoor 2025 (SSE): "two sum of leetcode and follow up questions"',
    'find-replace-string': 'Glassdoor 2024 (internship): "Find and replace a string. Similar to leetcode problem."',
    'valid-parentheses': 'r/technepal 2024 (SE fellowship exam): balanced parentheses, reported by two candidates',
    'longest-common-prefix': 'r/technepal 2024 (SE fellowship exam): "balanced paranthesis and longest common prefix"',
    'roman-to-int': 'r/technepal 2024 (SE fellowship exam): "Conversion from roman number to integer"',
    'int-to-roman': 'r/technepal 2024 (SE fellowship exam): "integer to roman" given to another candidate',
    'valid-anagram': 'r/technepal 2024 (SE fellowship exam): anagram check, asked of two candidates',
    'group-anagrams': 'r/technepal 2024 (SE fellowship exam): anagram check over a list of words, solved with a dictionary',
    'score-parentheses': 'r/technepal 2024 (SE fellowship exam): "() returns 1, (()) returns 2…"',
    'valid-palindrome': 'r/technepal Jul 2026 (associate exam): "a slightly different style of palindrome question"',
    'min-max-two': 'r/technepal Jul 2026: "find two smallest and two largest numbers in an array" is always asked; Apr 2026: second largest + its complexity; Oct 2026 (associate): "How would you find second greatest no in a list"',
    'remove-duplicates': 'r/technepal 2025 (associate interview): "remove duplicates from list" (explain the approach)',
    'frequent-days': 'Glassdoor 2020 (intern coding test): most frequent day(s) of the week in a year',
    'fill-cups': 'Reported in Leapfrog rounds (earlier research)',
    'water-jug': 'Reported in Leapfrog rounds (earlier research)'
  });
window.EXAM_AT ='2026-11-02T07:30:00+05:45';
window.PLAN = [
  { day: 'Saturday · 31 Oct', date: '2026-10-31', blocks: [
    { t: '12:15–13:00', title: 'Warm-up: exam strategy + Big-O', lessons: ['strategy', 'complexity'], mcq: ['complexity'] },
    { t: '13:00–15:30', title: 'Hashing & prefix sums', lessons: ['hashmap', 'prefixsum'], problems: ['two-sum', 'valid-anagram', 'group-anagrams', 'top-k-frequent', 'longest-consecutive', 'product-except-self', 'subarray-sum-k'], extra: ['contains-duplicate', 'first-unique-char', 'majority-element'] },
    { t: '15:45–18:00', title: 'Two pointers & sliding window', lessons: ['twopointers', 'slidingwindow'], problems: ['valid-palindrome', 'best-time-stock', 'three-sum', 'container-water', 'longest-substring', 'char-replacement'], extra: ['move-zeroes', 'sort-colors', 'rotate-array', 'min-subarray-len', 'find-anagrams'] },
    { t: '18:15–20:30', title: 'Stacks & linked lists (reported in Leapfrog rounds)', lessons: ['stack', 'linkedlist'], problems: ['valid-parentheses', 'reverse-list', 'merge-two-lists', 'daily-temperatures', 'eval-rpn', 'decode-string', 'remove-nth', 'add-two-numbers'], extra: ['linked-list-cycle', 'middle-node', 'palindrome-list', 'asteroid-collision'] },
    { t: '21:00–22:00', title: 'Strings & intervals', lessons: ['strings', 'intervals'], problems: ['longest-common-prefix', 'reverse-words', 'longest-palindrome', 'merge-intervals'], extra: ['string-compression'] },
    { t: '22:00–23:00', title: 'MCQ sprint: OOP, design patterns, networking, DSA', mcq: ['oop', 'design', 'network', 'dsa'] },
    { t: '23:00–24:00', title: 'Mock exam #1 (60 min, real format)', mock: true }
  ]},
  { day: 'Sunday · 1 Nov', date: '2026-11-01', blocks: [
    { t: '08:00–08:30', title: 'Redo your revisit list from Saturday (write from scratch)', revisit: true },
    { t: '08:30–10:30', title: 'Binary search & matrix', lessons: ['binarysearch', 'matrix'], problems: ['binary-search', 'search-rotated', 'koko-bananas', 'spiral-matrix', 'rotate-image'] },
    { t: '10:45–13:30', title: 'Dynamic programming', lessons: ['dp'], problems: ['climbing-stairs', 'max-subarray', 'house-robber', 'coin-change', 'lis', 'word-break'] },
    { t: '14:30–16:15', title: 'Graphs (BFS/DFS) & backtracking', lessons: ['graph', 'backtracking'], problems: ['num-islands', 'rotting-oranges', 'subsets', 'combination-sum'] },
    { t: '16:30–18:00', title: 'Reported Leapfrog problems, then hard set if time', problems: ['min-max-two', 'find-replace-string', 'score-parentheses', 'remove-duplicates', 'frequent-days', 'two-sum-sorted', 'roman-to-int', 'int-to-roman', 'fill-cups', 'water-jug'], extra: ['valid-palindrome-ii', 'min-stack', 'trapping-rain', 'min-window', 'largest-rectangle'] },
    { t: '18:00–19:00', title: 'MCQ sprint: DB/SQL, JS/web, OS, output prediction, ML/data', mcq: ['db', 'web', 'os', 'output', 'se', 'ml'] },
    { t: '20:00–21:00', title: 'Mock exam #2 (60 min)', mock: true },
    { t: '21:00–22:00', title: 'Revisit list + Syntax sheet. Install/test your IDE offline, charge laptop, sleep by 22:30', revisit: true }
  ]},
  { day: 'Monday · 2 Nov (exam)', date: '2026-11-02', blocks: [
    { t: '05:30–06:15', title: 'Light review only: Syntax sheet + "takeaway" lines. No new problems.', link: '#/syntax' },
    { t: '07:15', title: 'Be at Leapfrog Technology, Dillibazar. Laptop + charger. Breathe: restate → constraints → brute force → pattern → code → dry-run.' }
  ]}
];
