// The interview layer: patterns the path lacked, a pattern-spotting unit, and classic LeetCode problems as extra rounds.
// Statements are written in our own words. Titles are the names you'll see on LeetCode, so you can find more discussion there.
(() => {
const p = (id, title, diff, time, desc, start, nudge, sol, big, idea, tests, ex) => ({ id, title, diff, time, desc: `<p>${desc}</p>`, start, nudge, sol, big, idea, tests, ex: ex || [] });
const bar = (x, y, w, cls = '', label = '') => D.line(x, y, x + w, y, 'thick ' + cls) + (label ? D.t(x + w / 2, y - 6, label, { a: 'middle', size: 14, cls: 'soft' }) : '');

unitAfter('sorting', { id: 'intervals', phase: 1, title: 'Intervals', mins: 7, read: [
`<p class="lede">Meetings, bookings, time ranges: anything with a start and an end. Almost every interval problem becomes easy once they're <b>sorted</b>, because then you only ever compare a thing with its neighbour.</p>`,
steps([
  { n: 'Unsorted, you would have to compare every pair.', d: bar(320, 40, 200, '', 'C') + bar(60, 80, 120, '', 'A') + bar(420, 120, 120, '', 'D') + bar(140, 160, 120, '', 'B') },
  { n: 'Sorted by start, each one can only touch what came just before it.', d: bar(60, 40, 120, '', 'A') + bar(140, 80, 120, '', 'B') + bar(320, 120, 200, '', 'C') + bar(420, 160, 120, '', 'D') },
  { n: 'Two intervals overlap when the next one starts before the current one ends.', d: bar(60, 40, 120, 'b', 'A') + bar(140, 80, 120, 'b', 'B') + bar(320, 120, 200, '', 'C') + bar(420, 160, 120, '', 'D') + D.line(140, 25, 140, 95, 'r') + D.line(180, 25, 180, 95, 'r') + D.t(190, 56, 'overlap', { cls: 'r' }) }
], 190),
`<h2>Two questions to ask first</h2><p><b>Sort by start or by end?</b> Sort by start when you're combining or walking through in time order. Sort by end when you want to keep as many as possible: the one that finishes first leaves the most room for the rest.</p>
<p><b>How many are happening at once?</b> Picture a counter going up at every start and down at every end. This is called a sweep line, and it answers "how many at the same time" without comparing pairs.</p>`,
think('[1, 3] and [3, 5]: do they overlap? How would you find out, before you write a line of code?', 'It depends on the problem, so ask. For merging, LeetCode usually treats touching as overlapping. For meeting rooms, a meeting ending at 3 frees its room for one starting at 3. Clarifying this out loud is exactly what interviewers hope to see.')
], core: [
p('insert-interval', 'Insert Interval', 'Medium', 18, 'A list of non-overlapping intervals is sorted by start. Insert a new interval, merging where needed, and return the list. Touching intervals merge.', 'def insert(intervals, new):\n    ',
  ['Walk the list: which intervals end completely before the new one starts?', 'Which ones overlap it, and how does the new interval grow when you absorb one?'],
  R`def insert(intervals, new):
    out, i, n = [], 0, len(intervals)
    start, end = new
    while i < n and intervals[i][1] < start:
        out.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= end:
        start, end = min(start, intervals[i][0]), max(end, intervals[i][1]); i += 1
    out.append([start, end])
    return out + intervals[i:]`, 'O(n) time, O(n) space', 'Three zones: before, overlapping, after.',
  [['insert([[1, 3], [6, 9]], [2, 5])', '[[1, 5], [6, 9]]'], ['insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])', '[[1, 2], [3, 10], [12, 16]]'], ['insert([], [5, 7])', '[[5, 7]]'], ['insert([[1, 5]], [0, 0])', '[[0, 0], [1, 5]]'], ['insert([[1, 5]], [6, 8])', '[[1, 5], [6, 8]]'], ['insert([[1, 5]], [5, 6])', '[[1, 6]]']],
  [['[[1, 3], [6, 9]], [2, 5]', '[[1, 5], [6, 9]]']]),
p('non-overlap', 'Non-overlapping Intervals', 'Medium', 16, 'Return the fewest intervals to remove so that the rest don\'t overlap. Intervals that only touch, like [1, 2] and [2, 3], are fine.', 'def erase_overlaps(intervals):\n    ',
  ['Flip it: what is the most you could keep?', 'To keep the most, which interval should you always choose next: the earliest start, or the earliest end?'],
  R`def erase_overlaps(intervals):
    kept, end = 0, float("-inf")
    for a, b in sorted(intervals, key=lambda x: x[1]):
        if a >= end:
            kept += 1
            end = b
    return len(intervals) - kept`, 'O(n log n)', 'Keep whatever finishes first: it leaves the most room.',
  [['erase_overlaps([[1, 2], [2, 3], [3, 4], [1, 3]])', '1'], ['erase_overlaps([[1, 2], [1, 2], [1, 2]])', '2'], ['erase_overlaps([[1, 2], [2, 3]])', '0'], ['erase_overlaps([])', '0'], ['erase_overlaps([[1, 100], [2, 3], [4, 5], [6, 7]])', '1']])
], boss:
p('meeting-rooms', 'Meeting Rooms II', 'Medium', 18, 'Return the fewest rooms needed to hold all the meetings. A meeting ending at time 5 frees its room for one starting at 5.', 'def min_rooms(meetings):\n    ', [],
  R`def min_rooms(meetings):
    events = sorted([(a, 1) for a, b in meetings] + [(b, -1) for a, b in meetings], key=lambda e: (e[0], e[1]))
    best = now = 0
    for _, d in events:
        now += d
        best = max(best, now)
    return best`, 'O(n log n)', 'Sweep line: +1 at each start, -1 at each end, and the peak is the answer. Ends sort first at the same time.',
  [['min_rooms([[0, 30], [5, 10], [15, 20]])', '2'], ['min_rooms([[7, 10], [2, 4]])', '1'], ['min_rooms([])', '0'], ['min_rooms([[1, 5], [5, 10]])', '1'], ['min_rooms([[1, 4], [1, 4], [1, 4]])', '3'], ['min_rooms([[i, i + 1000] for i in range(50000)])', '1000']],
  [['[[0, 30], [5, 10], [15, 20]]', '2']])
});

unitAfter('shortest-paths', { id: 'mst', phase: 3, title: 'Connect everything cheaply', mins: 7, read: [
`<p class="lede">You need to connect every town, and each possible road has a price. Shortest paths ask "how do I get from here to there?" This asks a different question: <b>what is the cheapest set of edges that joins everything?</b> The answer is called a minimum spanning tree.</p>`,
steps([
  { n: 'All possible roads, with their prices.', d: D.graph({ A: [100, 50], B: [300, 40], C: [500, 60], D: [190, 170], E: [420, 170] }, [['A', 'B', 4], ['B', 'C', 8], ['A', 'D', 2], ['B', 'D', 5], ['B', 'E', 3], ['C', 'E', 1], ['D', 'E', 7]]) },
  { n: 'Take the cheapest edge anywhere. C to E costs 1.', d: D.graph({ A: [100, 50], B: [300, 40], C: [500, 60], D: [190, 170], E: [420, 170] }, [['A', 'B', 4], ['B', 'C', 8], ['A', 'D', 2], ['B', 'D', 5], ['B', 'E', 3], ['C', 'E', 1], ['D', 'E', 7]], { on: ['C-E'] }) },
  { n: 'Next cheapest: A-D, then B-E, then A-B. Each one joined two separate groups.', d: D.graph({ A: [100, 50], B: [300, 40], C: [500, 60], D: [190, 170], E: [420, 170] }, [['A', 'B', 4], ['B', 'C', 8], ['A', 'D', 2], ['B', 'D', 5], ['B', 'E', 3], ['C', 'E', 1], ['D', 'E', 7]], { on: ['C-E', 'A-D', 'B-E', 'A-B'] }) },
  { n: 'B-D costs 5, but B and D are already connected, so it would only make a loop. Skip it. Every town is joined, for a total of 10.', d: D.graph({ A: [100, 50], B: [300, 40], C: [500, 60], D: [190, 170], E: [420, 170] }, [['A', 'B', 4], ['B', 'C', 8], ['A', 'D', 2], ['B', 'D', 5], ['B', 'E', 3], ['C', 'E', 1], ['D', 'E', 7]], { on: ['C-E', 'A-D', 'B-E', 'A-B'], cross: ['B-D', 'B-C', 'D-E'] }) }
], 210),
`<h2>Two ways to grow it</h2><table><tr><th>Approach</th><th>The idea</th><th>What it needs</th></tr><tr><td>Kruskal</td><td>Cheapest edge overall, if it joins two separate groups</td><td>Sorted edges, and something that answers "same group?" You've built that already.</td></tr><tr><td>Prim</td><td>Grow one blob: always add the cheapest edge leaving it</td><td>A heap, much like Dijkstra. Suits graphs with a huge number of edges.</td></tr></table>`,
think('Why is taking the cheapest edge always safe, when greedy so often fails?', 'Split the towns into any two groups. Some edge must cross between them, and the cheapest crossing edge can always be part of the answer: swapping any other crossing edge for it never costs more.')
], core: [
p('mst-cost', 'Cheapest network', 'Medium', 18, '<code>n</code> towns are numbered from 0, and <code>edges</code> holds <code>(a, b, cost)</code>. Return the lowest total cost that connects them all, or -1 if that\'s impossible.', 'def mst_cost(n, edges):\n    ',
  ['Which edge would you consider first?', 'How do you know that an edge would only make a loop? You built a tool for this in Order and groups.'],
  R`def mst_cost(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total, joined = 0, 0
    for a, b, c in sorted(edges, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            total += c
            joined += 1
    return total if joined == n - 1 else -1`, 'O(E log E)', 'Sort the edges, and take each one that joins two different groups.',
  [['mst_cost(4, [(0, 1, 1), (1, 2, 2), (2, 3, 3), (0, 3, 10)])', '6'], ['mst_cost(3, [(0, 1, 5)])', '-1'], ['mst_cost(1, [])', '0'], ['mst_cost(5, [(0, 1, 4), (1, 2, 8), (0, 3, 2), (1, 3, 5), (1, 4, 3), (2, 4, 1), (3, 4, 7)])', '10'], ['mst_cost(2, [(0, 1, 9), (0, 1, 2)])', '2']],
  [['4, [(0, 1, 1), (1, 2, 2), (2, 3, 3), (0, 3, 10)]', '6']])
], boss:
p('min-cost-points', 'Min Cost to Connect All Points', 'Medium', 22, 'Points on a grid are given as <code>[x, y]</code>. Joining two points costs their Manhattan distance, <code>|x1 - x2| + |y1 - y2|</code>. Return the lowest cost to connect them all. There can be up to 1000 points.', 'def min_cost(points):\n    ', [],
  R`def min_cost(points):
    n = len(points)
    best = [float("inf")] * n
    used = [False] * n
    best[0] = 0
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not used[i]), key=lambda i: best[i])
        used[u] = True
        total += best[u]
        for v in range(n):
            if not used[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                if d < best[v]:
                    best[v] = d
    return total`, 'O(n^2) time, O(n) space', 'Every pair is an edge, so skip listing them: Prim with a plain array wins on a dense graph.',
  [['min_cost([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]])', '20'], ['min_cost([[3, 12], [-2, 5], [-4, 1]])', '18'], ['min_cost([[0, 0]])', '0'], ['min_cost([[0, 0], [1, 1], [1, 0], [-1, 1]])', '4'], ['min_cost([[i * 7 % 1000, i * 13 % 997] for i in range(1000)]) > 0', 'True']],
  [['[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]', '20']])
});

unitAfter('bits-math', { id: 'spotting', phase: 3, title: 'Spot the pattern', mins: 9, read: [
`<p class="lede">In an interview or an exam, nobody tells you which chapter a problem comes from. <b>Spotting the pattern is the actual skill.</b> The problem's wording and its limits nearly always give it away.</p>
<h2>What the question says, and what to reach for</h2><table>
<tr><th>You notice</th><th>Think</th></tr>
<tr><td>Sorted input, or "find a pair"</td><td>Two pointers, binary search</td></tr>
<tr><td>Longest or shortest contiguous stretch</td><td>Sliding window</td></tr>
<tr><td>Sum of a range, many times</td><td>Prefix sums</td></tr>
<tr><td>"Have I seen this?", counting, grouping</td><td>Hash map</td></tr>
<tr><td>"The smallest value that works", where bigger always works too</td><td>Binary search on the answer</td></tr>
<tr><td>Top k, or a running best</td><td>Heap</td></tr>
<tr><td>Matching pairs, next greater, undo</td><td>Stack</td></tr>
<tr><td>Fewest steps, unweighted</td><td>BFS</td></tr>
<tr><td>Connected groups, or a cycle</td><td>DFS, union-find</td></tr>
<tr><td>Do this before that</td><td>Topological sort</td></tr>
<tr><td>Fewest steps, with weights</td><td>Dijkstra</td></tr>
<tr><td>"All", "every", "generate"</td><td>Backtracking</td></tr>
<tr><td>"How many ways", "best", overlapping choices</td><td>Dynamic programming</td></tr>
<tr><td>Start and end times</td><td>Sort, then sweep</td></tr></table>
<h2>The limits tell you the speed you need</h2><p>A computer does very roughly 10<sup>8</sup> simple steps a second, so the input size tells you which approaches can work:</p>`,
fig(D.flow({ a: [10, 20, 130, 54, 'n up to 20\nO(2^n)', 'r'], b: [150, 20, 130, 54, 'n up to 500\nO(n^3)', 'y'], c: [290, 20, 130, 54, 'n up to 5000\nO(n^2)', 'y'], d: [430, 20, 130, 54, '10^6\nO(n log n)', 'g'], e: [570, 20, 130, 54, '10^9\nO(log n)', 'b'] })),
`<h2>The interview routine</h2><p>This is your rough routine, said out loud.</p><ol>
<li><b>Clarify.</b> Empty input? Duplicates? Negatives? How big? Ask before you think you know.</li>
<li><b>Work one example by hand,</b> and watch what your own brain does.</li>
<li><b>Say the slow answer first,</b> with its cost. A working slow idea is worth far more than silence.</li>
<li><b>Find the wasted work.</b> What are you computing twice? That usually points at the pattern.</li>
<li><b>Agree on the plan, then code.</b> Name things well and keep talking.</li>
<li><b>Test by tracing,</b> with your example and then an edge case, before they ask you to.</li>
<li><b>State the time and space cost,</b> unprompted.</li></ol>`,
think('"Given an array and a target, how many contiguous subarrays sum to it? Numbers can be negative." Which pattern, and what rules out the obvious one?', 'Contiguous suggests a sliding window, but negatives break it: growing the window might shrink the sum, so you can\'t tell which way to move. Use prefix sums with a hash map.')
], core: [
p('find-peak', 'Find Peak Element', 'Medium', 15, 'A peak is bigger than its neighbours, and past either end counts as lower. Neighbouring values are never equal. Return the index of any peak, in O(log n) time.', 'def find_peak(nums):\n    ',
  ['If the list isn\'t sorted, how could you throw half of it away?', 'Look at a middle value and the one to its right. If you\'re walking uphill, what must exist somewhere ahead?'],
  R`def find_peak(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`, 'O(log n)', 'Binary search needs a yes/no you can trust, not sorted data. Uphill always leads to a peak.',
  [['find_peak([1, 2, 3, 1])', '2'], ['find_peak([1, 2, 1, 3, 5, 6, 4]) in (1, 5)', 'True'], ['find_peak([7])', '0'], ['find_peak([2, 1])', '0'], ['find_peak([1, 2])', '1'], ['find_peak(list(range(2000000)))', '1999999']],
  [['[1, 2, 3, 1]', '2']]),
p('min-arrows', 'Minimum Number of Arrows to Burst Balloons', 'Medium', 15, 'Each balloon spans <code>[start, end]</code> along a line. An arrow fired at position x bursts every balloon with start &le; x &le; end. Return the fewest arrows that burst them all.', 'def min_arrows(points):\n    ',
  ['What kind of problem is this really, once you draw the balloons as bars?', 'For the balloon that ends first, where is the best place to shoot?'],
  R`def min_arrows(points):
    arrows, last = 0, float("-inf")
    for a, b in sorted(points, key=lambda x: x[1]):
        if a > last:
            arrows += 1
            last = b
    return arrows`, 'O(n log n)', 'Intervals again. Shoot as late as you can for the balloon that ends first.',
  [['min_arrows([[10, 16], [2, 8], [1, 6], [7, 12]])', '2'], ['min_arrows([[1, 2], [3, 4], [5, 6], [7, 8]])', '4'], ['min_arrows([[1, 2], [2, 3], [3, 4], [4, 5]])', '2'], ['min_arrows([])', '0'], ['min_arrows([[1, 9], [2, 3]])', '1']])
], boss:
p('longest-path-matrix', 'Longest Increasing Path in a Matrix', 'Hard', 28, 'Return the length of the longest path through a grid where every step moves up, down, left or right to a strictly larger number. The grid can be up to 200 by 200.', 'def longest_path(grid):\n    ', [],
  R`def longest_path(grid):
    if not grid or not grid[0]:
        return 0
    r, c = len(grid), len(grid[0])
    order = sorted(((grid[i][j], i, j) for i in range(r) for j in range(c)), reverse=True)
    best = [[1] * c for _ in range(r)]
    ans = 1
    for v, i, j in order:
        for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= a < r and 0 <= b < c and grid[a][b] > v:
                best[i][j] = max(best[i][j], best[a][b] + 1)
        ans = max(ans, best[i][j])
    return ans`, 'O(rc log rc) as written; O(rc) with DFS and memory', 'A grid, plus a question that repeats itself: graph search meets DP. Strictly increasing means no cycles, so answers can be remembered.',
  [['longest_path([[9, 9, 4], [6, 6, 8], [2, 1, 1]])', '4'], ['longest_path([[3, 4, 5], [3, 2, 6], [2, 2, 1]])', '4'], ['longest_path([[1]])', '1'], ['longest_path([])', '0'], ['longest_path([[7, 7], [7, 7]])', '1'], ['longest_path([[i * 200 + j for j in range(200)] for i in range(200)])', '399']],
  [['[[9, 9, 4], [6, 6, 8], [2, 1, 1]]', '4']])
});

// ---------- classic LeetCode problems, as extra rounds of the unit that teaches their pattern ----------
more('hashing',
p('valid-sudoku', 'Valid Sudoku', 'Medium', 15, 'Given a 9 by 9 board of strings, with <code>"."</code> for empty, return whether the filled cells break no rule: no digit repeats in a row, a column or a 3 by 3 box. It doesn\'t need to be solvable.', 'def valid_sudoku(board):\n    ',
  ['What three things does each digit belong to?', 'How can you turn "row, column and box" into keys for a single set? How do you work out which box a cell is in?'],
  R`def valid_sudoku(board):
    seen = set()
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            keys = [("r", r, v), ("c", c, v), ("b", r // 3, c // 3, v)]
            if any(k in seen for k in keys):
                return False
            seen.update(keys)
    return True`, 'O(1): the board is a fixed size', 'One set, with keys that say what each fact is about.',
  [['valid_sudoku([["."] * 9 for _ in range(9)])', 'True'], ['valid_sudoku(b)', 'False', 'b = [["."] * 9 for _ in range(9)]\nb[0][0] = "5"\nb[0][8] = "5"'], ['valid_sudoku(b)', 'False', 'b = [["."] * 9 for _ in range(9)]\nb[0][0] = "5"\nb[8][0] = "5"'], ['valid_sudoku(b)', 'False', 'b = [["."] * 9 for _ in range(9)]\nb[0][0] = "5"\nb[2][2] = "5"'], ['valid_sudoku(b)', 'True', 'b = [["."] * 9 for _ in range(9)]\nb[0][0] = "5"\nb[3][3] = "5"']]));
more('sliding-window',
p('permutation-in-string', 'Permutation in String', 'Medium', 15, 'Return whether <code>s2</code> contains some rearrangement of <code>s1</code> as one unbroken stretch. Both use lowercase letters.', 'def has_permutation(s1, s2):\n    ',
  ['How long must a matching stretch be?', 'As the window slides by one, what changes in its letter counts?'],
  R`def has_permutation(s1, s2):
    k = len(s1)
    if k > len(s2):
        return False
    need, have = [0] * 26, [0] * 26
    for ch in s1:
        need[ord(ch) - 97] += 1
    for i, ch in enumerate(s2):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(s2[i - k]) - 97] -= 1
        if have == need:
            return True
    return False`, 'O(n) time, O(1) space', 'A fixed-size window, comparing letter counts.',
  [['has_permutation("ab", "eidbaooo")', 'True'], ['has_permutation("ab", "eidboaoo")', 'False'], ['has_permutation("abc", "ab")', 'False'], ['has_permutation("a", "a")', 'True'], ['has_permutation("aab", "aba")', 'True'], ['has_permutation("abc", "x" * 200000 + "cab")', 'True']]));
more('sorting',
p('quick-sort', 'Quick sort', 'Medium', 18, 'Return a sorted copy of a list using quick sort: choose a pivot, split the rest into smaller and larger, and sort each side. It must not use <code>sorted</code> or <code>.sort</code>, and must cope with many duplicates and already-sorted input.', 'def quick_sort(nums):\n    ',
  ['What goes wrong when every value equals the pivot, if you only have "smaller" and "larger"?', 'What goes wrong on sorted input if the pivot is always the first element?'],
  R`import random

def quick_sort(nums):
    if len(nums) <= 1:
        return nums[:]
    pivot = random.choice(nums)
    return quick_sort([x for x in nums if x < pivot]) + [x for x in nums if x == pivot] + quick_sort([x for x in nums if x > pivot])`, 'O(n log n) on average, O(n^2) at worst', 'A pivot splits the work. A random pivot and a separate "equal" group avoid the bad cases.',
  [['quick_sort([3, 1, 2])', '[1, 2, 3]'], ['quick_sort([])', '[]'], ['quick_sort([5, 5, 5, 5])', '[5, 5, 5, 5]'], ['quick_sort(list(range(5000))) == list(range(5000))', 'True'], ['quick_sort([1] * 5000) == [1] * 5000', 'True'], ['quick_sort([3, -1, 2, -1])', '[-1, -1, 2, 3]']]));
more('binary-search',
p('search-matrix', 'Search a 2D Matrix', 'Medium', 12, 'Every row of the grid is sorted, and each row starts higher than the previous row ends. Return whether <code>target</code> is present, in O(log(rows &times; columns)) time.', 'def search_matrix(grid, target):\n    ',
  ['If you read the whole grid row by row, what does it look like?', 'How do you turn a single position number into a row and a column?'],
  R`def search_matrix(grid, target):
    if not grid or not grid[0]:
        return False
    r, c = len(grid), len(grid[0])
    lo, hi = 0, r * c - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = grid[mid // c][mid % c]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`, 'O(log(rc))', 'A sorted grid is a sorted list in disguise.',
  [['search_matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3)', 'True'], ['search_matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13)', 'False'], ['search_matrix([], 1)', 'False'], ['search_matrix([[1]], 1)', 'True'], ['search_matrix([[1], [3]], 3)', 'True'], ['search_matrix([[1, 3]], 0)', 'False']]),
p('find-min-rotated', 'Find Minimum in Rotated Sorted Array', 'Medium', 14, 'A sorted list of distinct numbers has been rotated, so <code>[1, 2, 3, 4]</code> might now be <code>[3, 4, 1, 2]</code>. Return the smallest in O(log n) time.', 'def find_min(nums):\n    ',
  ['Compare the middle with the right end. What does that tell you about where the drop is?'],
  R`def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`, 'O(log n)', 'Compare with the end: it tells you which side holds the drop.',
  [['find_min([3, 4, 5, 1, 2])', '1'], ['find_min([4, 5, 6, 7, 0, 1, 2])', '0'], ['find_min([11, 13, 15, 17])', '11'], ['find_min([1])', '1'], ['find_min([2, 1])', '1'], ['find_min(list(range(500000, 2000000)) + list(range(500000)))', '0']]),
p('median-two-sorted', 'Median of Two Sorted Arrays', 'Hard', 35, 'Return the median of two sorted lists together, in O(log(min(m, n))) time. An even total gives the average of the middle two.', 'def median(a, b):\n    ',
  ['Forget merging. If you cut both lists so the left parts hold half of everything, what makes the cut correct?', 'Binary search on where to cut the shorter list.'],
  R`def median(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        al = a[i - 1] if i else float("-inf")
        ar = a[i] if i < m else float("inf")
        bl = b[j - 1] if j else float("-inf")
        br = b[j] if j < n else float("inf")
        if al <= br and bl <= ar:
            if (m + n) % 2:
                return float(max(al, bl))
            return (max(al, bl) + min(ar, br)) / 2
        if al > br:
            hi = i - 1
        else:
            lo = i + 1`, 'O(log(min(m, n)))', 'Binary search on a cut, not on a value. A cut is right when everything on the left is at most everything on the right.',
  [['median([1, 3], [2])', '2.0'], ['median([1, 2], [3, 4])', '2.5'], ['median([], [1])', '1.0'], ['median([2], [])', '2.0'], ['median([1, 1], [1, 1])', '1.0'], ['median(list(range(0, 2000000, 2)), list(range(1, 2000000, 2)))', '999999.5']]));
more('stacks',
p('next-greater', 'Next Greater Element', 'Medium', 14, 'For each number, return the next number to its right that is bigger, or -1 if there isn\'t one. It must be O(n).', 'def next_greater(nums):\n    ',
  ['Which numbers are still waiting for their answer as you walk along?', 'What is true of the waiting numbers, in order? What happens when a big number arrives?'],
  R`def next_greater(nums):
    out = [-1] * len(nums)
    waiting = []
    for i, x in enumerate(nums):
        while waiting and nums[waiting[-1]] < x:
            out[waiting.pop()] = x
        waiting.append(i)
    return out`, 'O(n): each index is pushed and popped once', 'A monotonic stack holds whatever is still waiting for an answer.',
  [['next_greater([2, 1, 2, 4, 3])', '[4, 2, 4, -1, -1]'], ['next_greater([])', '[]'], ['next_greater([5, 4, 3])', '[-1, -1, -1]'], ['next_greater([1, 2, 3])', '[2, 3, -1]'], ['next_greater([2, 2])', '[-1, -1]'], ['next_greater(list(range(300000, 0, -1)))[0]', '-1']]),
p('car-fleet', 'Car Fleet', 'Medium', 18, 'Cars drive along a one-lane road to <code>target</code>, and can\'t overtake: a faster car catches up and they travel on together as one fleet, at the slower speed. Given each car\'s <code>position</code> and <code>speed</code>, return how many fleets arrive.', 'def car_fleet(target, position, speed):\n    ',
  ['Which car should you think about first, the nearest to the target or the farthest?', 'Work out how long each car would need if alone. When does a car join the fleet ahead?'],
  R`def car_fleet(target, position, speed):
    fleets, slowest = 0, 0
    for p, s in sorted(zip(position, speed), reverse=True):
        t = (target - p) / s
        if t > slowest:
            fleets += 1
            slowest = t
    return fleets`, 'O(n log n)', 'Sort by position, and compare arrival times instead of simulating the road.',
  [['car_fleet(12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3])', '3'], ['car_fleet(10, [3], [3])', '1'], ['car_fleet(100, [0, 2, 4], [4, 2, 1])', '1'], ['car_fleet(10, [], [])', '0'], ['car_fleet(10, [6, 8], [3, 2])', '2']]));
more('linked-lists',
p('reorder-list', 'Reorder List', 'Medium', 22, 'Rearrange a list in place from <code>1, 2, 3, 4, 5</code> into <code>1, 5, 2, 4, 3</code>: first, last, second, second last, and so on. Return nothing. Move the nodes, and don\'t copy values into a Python list.', '# ListNode(val=0, next=None) is predefined\ndef reorder(head):\n    ',
  ['This is three smaller problems you have already solved. What are they?', 'Find the middle, reverse the back half, then weave.'],
  R`def reorder(head):
    if not head or not head.next:
        return
    slow, fast = head, head
    while fast.next and fast.next.next:
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        second.next, prev, second = prev, second, second.next
    first, second = head, prev
    while second:
        first.next, first = second, first.next
        second.next, second = first, second.next`, 'O(n) time, O(1) space', 'Hard list problems are usually easy ones stacked up.',
  [['node_list(h)', '[1, 5, 2, 4, 3]', 'h = nodes([1, 2, 3, 4, 5])\nreorder(h)'], ['node_list(h)', '[1, 4, 2, 3]', 'h = nodes([1, 2, 3, 4])\nreorder(h)'], ['node_list(h)', '[1]', 'h = nodes([1])\nreorder(h)'], ['node_list(h)', '[1, 2]', 'h = nodes([1, 2])\nreorder(h)'], ['reorder(nodes([1, 2, 3]))', 'None']]),
p('intersection-lists', 'Intersection of Two Linked Lists', 'Easy', 14, 'Two lists may share their tail. Return the node where they first meet, or <code>None</code>. Compare the nodes themselves, not their values. Use O(1) extra space.', 'def intersection(a, b):\n    ',
  ['If the lists are different lengths, how could two pointers arrive at the meeting node together?', 'What if each pointer walked both lists, one after the other?'],
  R`def intersection(a, b):
    x, y = a, b
    while x is not y:
        x = x.next if x else b
        y = y.next if y else a
    return x`, 'O(m + n) time, O(1) space', 'Walking both lists makes the two distances equal.',
  [['intersection(a, b) is tail', 'True', 'tail = nodes([8, 4, 5])\na = ListNode(1, tail)\nb = ListNode(2, ListNode(3, ListNode(9, tail)))'], ['intersection(nodes([1, 2]), nodes([1, 2]))', 'None'], ['intersection(None, nodes([1]))', 'None'], ['intersection(a, a) is a', 'True', 'a = nodes([1, 2])']]));
more('trees',
p('balanced-tree', 'Balanced Binary Tree', 'Easy', 14, 'A tree is balanced when, at every node, the heights of the two sides differ by at most 1. Return whether it is. It must be O(n). <code>tree([...])</code> builds trees in the tests.', 'def balanced(root):\n    ',
  ['If you compute height from scratch at every node, how much work is that on a long chain?', 'Can one walk return the height and also signal "already broken"?'],
  R`def balanced(root):
    def h(n):
        if not n:
            return 0
        a, b = h(n.left), h(n.right)
        if a < 0 or b < 0 or abs(a - b) > 1:
            return -1
        return 1 + max(a, b)
    return h(root) >= 0`, 'O(n)', 'Return one value upward and use a special value to say "already failed".',
  [['balanced(tree([3, 9, 20, None, None, 15, 7]))', 'True'], ['balanced(tree([1, 2, 2, 3, 3, None, None, 4, 4]))', 'False'], ['balanced(None)', 'True'], ['balanced(tree([1, 2, None, 3]))', 'False']]),
p('right-side-view', 'Binary Tree Right Side View', 'Medium', 12, 'Standing to the right of a tree, list the value you\'d see on each level, top to bottom.', 'def right_view(root):\n    ',
  ['You have already walked a tree level by level. What do you want from each level?'],
  R`def right_view(root):
    out, level = [], [root] if root else []
    while level:
        out.append(level[-1].val)
        level = [c for n in level for c in (n.left, n.right) if c]
    return out`, 'O(n)', 'Level by level, keep the last one.',
  [['right_view(tree([1, 2, 3, None, 5, None, 4]))', '[1, 3, 4]'], ['right_view(tree([1, 2, 3, 4]))', '[1, 3, 4]'], ['right_view(None)', '[]'], ['right_view(tree([1, 2]))', '[1, 2]']]),
p('lca', 'Lowest Common Ancestor of a Binary Tree', 'Medium', 18, '<code>lca(root, p, q)</code> takes two values that both exist in a tree of unique values, and returns the value of the deepest node that has both beneath it, counting itself.', 'def lca(root, p, q):\n    ',
  ['What should each subtree report upward?', 'If the left side found something and the right side found something, what does that say about the current node?'],
  R`def lca(root, p, q):
    def go(n):
        if not n or n.val in (p, q):
            return n
        a, b = go(n.left), go(n.right)
        return n if a and b else a or b
    return go(root).val`, 'O(n)', 'Each subtree reports what it found, and the first node hearing from both sides is the answer.',
  [['lca(tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]), 5, 1)', '3'], ['lca(tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]), 5, 4)', '5'], ['lca(tree([1, 2]), 1, 2)', '1'], ['lca(tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]), 7, 4)', '2']]),
p('good-nodes', 'Count Good Nodes in Binary Tree', 'Medium', 12, 'A node is good if nothing on the path from the root down to it is bigger than it. Return how many good nodes there are.', 'def good_nodes(root):\n    ',
  ['What does each node need to be told by its parent?'],
  R`def good_nodes(root):
    def go(n, best):
        if not n:
            return 0
        return (n.val >= best) + go(n.left, max(best, n.val)) + go(n.right, max(best, n.val))
    return go(root, float("-inf"))`, 'O(n)', 'Pass what you know down, and pass the count back up.',
  [['good_nodes(tree([3, 1, 4, 3, None, 1, 5]))', '4'], ['good_nodes(tree([3, 3, None, 4, 2]))', '3'], ['good_nodes(tree([1]))', '1'], ['good_nodes(None)', '0']]),
p('build-tree', 'Construct Binary Tree from Preorder and Inorder', 'Medium', 25, 'Given the preorder and inorder walks of a tree with unique values, rebuild it and return the root. It has to handle 5,000 nodes on a long chain.', 'def build(preorder, inorder):\n    ',
  ['What does the first value of preorder tell you?', 'Finding that value in inorder tells you what about each side? How do you avoid searching for it each time?'],
  R`def build(preorder, inorder):
    where = {v: i for i, v in enumerate(inorder)}
    root = None
    stack = []
    for v in preorder:
        node = TreeNode(v)
        if not stack:
            root = node
        elif where[v] < where[stack[-1].val]:
            stack[-1].left = node
        else:
            last = None
            while stack and where[stack[-1].val] < where[v]:
                last = stack.pop()
            last.right = node
        stack.append(node)
    return root`, 'O(n)', 'Preorder names the root, and inorder splits left from right. A dict makes the split instant.',
  [['tree_list(build([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]))', '[3, 9, 20, None, None, 15, 7]'], ['tree_list(build([1], [1]))', '[1]'], ['build([], [])', 'None'], ['tree_list(build([1, 2, 3], [3, 2, 1]))', '[1, 2, None, 3]'], ['tree_list(build([1, 2, 3], [1, 2, 3]))', '[1, None, 2, None, 3]']]),
p('max-path-sum', 'Binary Tree Maximum Path Sum', 'Hard', 28, 'A path runs between any two nodes through parent-child links, and doesn\'t have to pass through the root. Values can be negative. Return the largest sum along any path. A path has at least one node.', 'def max_path(root):\n    ',
  ['At a single node, what can it hand up to its parent, and what could it use only for itself?', 'What should you do with a side whose best sum is negative?'],
  R`def max_path(root):
    best = float("-inf")
    def go(n):
        nonlocal best
        if not n:
            return 0
        a, b = max(0, go(n.left)), max(0, go(n.right))
        best = max(best, n.val + a + b)
        return n.val + max(a, b)
    go(root)
    return best`, 'O(n)', 'What you return upward differs from what you record: a path can only bend once.',
  [['max_path(tree([1, 2, 3]))', '6'], ['max_path(tree([-10, 9, 20, None, None, 15, 7]))', '42'], ['max_path(tree([-3]))', '-3'], ['max_path(tree([2, -1]))', '2'], ['max_path(tree([-2, -1]))', '-1']]),
p('serialize-tree', 'Serialize and Deserialize Binary Tree', 'Hard', 25, 'Write <code>serialize(root)</code>, returning a string, and <code>deserialize(text)</code>, rebuilding the same tree. Any format you like: only the round trip is tested.', 'def serialize(root):\n    pass\n\ndef deserialize(text):\n    pass\n',
  ['A preorder walk alone was ambiguous. What could you also write down to fix that?'],
  R`def serialize(root):
    out, stack = [], [root]
    while stack:
        n = stack.pop()
        if n is None:
            out.append("#")
        else:
            out.append(str(n.val))
            stack += [n.right, n.left]
    return ",".join(out)

def deserialize(text):
    parts = iter(text.split(","))
    first = next(parts)
    if first == "#":
        return None
    root = TreeNode(int(first))
    stack = [(root, 0)]
    while stack:
        node, side = stack.pop()
        v = next(parts)
        child = None if v == "#" else TreeNode(int(v))
        if side == 0:
            node.left = child
            stack.append((node, 1))
        else:
            node.right = child
        if child:
            stack.append((child, 0))
    return root`, 'O(n)', 'Writing down the empty spots makes one walk enough to rebuild the shape.',
  [['tree_list(deserialize(serialize(tree([1, 2, 3, None, None, 4, 5]))))', '[1, 2, 3, None, None, 4, 5]'], ['deserialize(serialize(None))', 'None'], ['tree_list(deserialize(serialize(tree([-1]))))', '[-1]'], ['tree_list(deserialize(serialize(tree([1, 2, None, 3]))))', '[1, 2, None, 3]'], ['isinstance(serialize(tree([1])), str)', 'True']]));
more('heaps',
p('last-stone', 'Last Stone Weight', 'Easy', 10, 'Repeatedly smash the two heaviest stones together. Equal stones both vanish; otherwise the difference remains as a new stone. Return what\'s left, or 0.', 'def last_stone(stones):\n    ',
  ['You keep needing the biggest. Python\'s heapq only gives the smallest, so how can you flip it?'],
  R`def last_stone(stones):
    h = [-s for s in stones]
    heapq.heapify(h)
    while len(h) > 1:
        a, b = -heapq.heappop(h), -heapq.heappop(h)
        if a != b:
            heapq.heappush(h, b - a)
    return -h[0] if h else 0`, 'O(n log n)', 'Negate values to make a max-heap from a min-heap.',
  [['last_stone([2, 7, 4, 1, 8, 1])', '1'], ['last_stone([1])', '1'], ['last_stone([])', '0'], ['last_stone([3, 3])', '0'], ['last_stone([10, 4])', '6']]),
p('task-scheduler', 'Task Scheduler', 'Medium', 20, 'Tasks are letters, and each takes one time slot. Two tasks with the same letter must have at least <code>n</code> slots between them, and you may leave slots idle. Return the fewest slots for all of them.', 'def least_time(tasks, n):\n    ',
  ['The most frequent task forces a structure. Draw it with n = 2 and A appearing three times.', 'What happens when there are more tasks than the frame has room for?'],
  R`def least_time(tasks, n):
    if not tasks:
        return 0
    counts = Counter(tasks).values()
    top = max(counts)
    ties = sum(1 for c in counts if c == top)
    return max(len(tasks), (top - 1) * (n + 1) + ties)`, 'O(n)', 'The busiest task builds the frame. Everything else fills its gaps.',
  [['least_time(list("AAABBB"), 2)', '8'], ['least_time(list("AAABBB"), 0)', '6'], ['least_time(list("AAAAAABCDEFG"), 2)', '16'], ['least_time([], 3)', '0'], ['least_time(list("ABCDE"), 4)', '5']]));
more('tries',
p('word-dictionary', 'Design Add and Search Words', 'Medium', 20, 'Build a class <code>WordDictionary</code> with <code>add(word)</code> and <code>search(word)</code>. In a search, a <code>.</code> matches any one letter.', 'class WordDictionary:\n    def __init__(self):\n        pass\n\n    def add(self, word):\n        pass\n\n    def search(self, word):\n        pass\n',
  ['With no dots, this is a plain trie walk. What must happen when you reach a dot?'],
  R`class WordDictionary:
    def __init__(self):
        self.root = {}

    def add(self, word):
        n = self.root
        for ch in word:
            n = n.setdefault(ch, {})
        n["$"] = True

    def search(self, word):
        def go(n, i):
            if i == len(word):
                return "$" in n
            if word[i] == ".":
                return any(go(c, i + 1) for k, c in n.items() if k != "$")
            return word[i] in n and go(n[word[i]], i + 1)
        return go(self.root, 0)`, 'O(length) to add; a search is worst with many dots', 'A trie walk that branches at each wildcard.',
  [['d.search("pad")', 'False', 'd = WordDictionary()\nfor w in ["bad", "dad", "mad"]:\n    d.add(w)'], ['d.search("bad")', 'True', 'd = WordDictionary()\nd.add("bad")'], ['d.search(".ad")', 'True', 'd = WordDictionary()\nd.add("bad")'], ['d.search("b..")', 'True', 'd = WordDictionary()\nd.add("bad")'], ['d.search("ba")', 'False', 'd = WordDictionary()\nd.add("bad")'], ['d.search("...d")', 'False', 'd = WordDictionary()\nd.add("bad")']]),
p('word-search-ii', 'Word Search II', 'Hard', 32, 'Return, as a sorted list, every word from <code>words</code> that can be traced through a grid of letters. Each step moves up, down, left or right, and a word can\'t reuse a cell.', 'def find_words(board, words):\n    ',
  ['Searching for each word separately repeats a lot of work. What structure lets you search for all of them together?', 'While walking, when can you stop early?'],
  R`def find_words(board, words):
    root = {}
    for w in words:
        n = root
        for ch in w:
            n = n.setdefault(ch, {})
        n["$"] = w
    found = set()
    r, c = len(board), len(board[0]) if board else 0
    def go(i, j, n):
        ch = board[i][j]
        if ch not in n:
            return
        nxt = n[ch]
        if "$" in nxt:
            found.add(nxt["$"])
        board[i][j] = "#"
        for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if 0 <= a < r and 0 <= b < c:
                go(a, b, nxt)
        board[i][j] = ch
    for i in range(r):
        for j in range(c):
            go(i, j, root)
    return sorted(found)`, 'Bounded by the trie, far below trying each word', 'Backtracking through a grid, with a trie to prune dead ends.',
  [['find_words([list("oaan"), list("etae"), list("ihkr"), list("iflv")], ["oath", "pea", "eat", "rain"])', '["eat", "oath"]'], ['find_words([list("ab"), list("cd")], ["abcb"])', '[]'], ['find_words([list("a")], ["a", "b"])', '["a"]'], ['find_words([list("ab")], ["ba", "ab", "aba"])', '["ab", "ba"]']]));
more('graphs',
p('max-island', 'Max Area of Island', 'Medium', 12, 'In a grid of 0s and 1s, an island is a group of 1s touching up, down, left or right. Return the area of the biggest one, or 0. A grid can be up to 300 by 300.', 'def max_area(grid):\n    ',
  ['How do you avoid counting a cell twice?', 'A very large island can blow Python\'s recursion limit. What could you use instead?'],
  R`def max_area(grid):
    seen, best = set(), 0
    for i, row in enumerate(grid):
        for j, v in enumerate(row):
            if v and (i, j) not in seen:
                seen.add((i, j))
                stack, area = [(i, j)], 0
                while stack:
                    x, y = stack.pop()
                    area += 1
                    for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= a < len(grid) and 0 <= b < len(row) and grid[a][b] and (a, b) not in seen:
                            seen.add((a, b))
                            stack.append((a, b))
                best = max(best, area)
    return best`, 'O(rc)', 'A grid is a graph. Use an explicit stack when it might be deep.',
  [['max_area([[0, 0, 1], [1, 1, 0], [1, 0, 0]])', '3'], ['max_area([[0, 0]])', '0'], ['max_area([])', '0'], ['max_area([[1] * 300 for _ in range(300)])', '90000']]),
p('bipartite', 'Is Graph Bipartite?', 'Medium', 15, '<code>graph[i]</code> lists the neighbours of node i. Return whether the nodes can be split into two groups so that every edge goes between the groups. The graph may be in several pieces.', 'def bipartite(graph):\n    ',
  ['Try colouring it: if a node is red, what must its neighbours be?', 'When is colouring impossible? And what about separate pieces?'],
  R`def bipartite(graph):
    colour = {}
    for s in range(len(graph)):
        if s in colour:
            continue
        colour[s] = 0
        stack = [s]
        while stack:
            u = stack.pop()
            for v in graph[u]:
                if v not in colour:
                    colour[v] = 1 - colour[u]
                    stack.append(v)
                elif colour[v] == colour[u]:
                    return False
    return True`, 'O(V + E)', 'Two-colouring: a conflict means an odd cycle.',
  [['bipartite([[1, 3], [0, 2], [1, 3], [0, 2]])', 'True'], ['bipartite([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]])', 'False'], ['bipartite([])', 'True'], ['bipartite([[], [2], [1]])', 'True'], ['bipartite([[], [2, 3], [1, 3], [1, 2]])', 'False']]),
p('pacific-atlantic', 'Pacific Atlantic Water Flow', 'Medium', 25, 'Rain flows from a cell to a neighbour of equal or lower height. The Pacific touches the top and left edges, and the Atlantic the bottom and right. Return, as a sorted list of <code>[row, col]</code>, the cells that can reach both.', 'def both_oceans(heights):\n    ',
  ['Checking from every cell is slow. Which direction could you search instead?', 'Start at the oceans and walk uphill. What do you do with the two results?'],
  R`def both_oceans(heights):
    if not heights or not heights[0]:
        return []
    r, c = len(heights), len(heights[0])
    def reach(starts):
        seen = set(starts)
        stack = list(starts)
        while stack:
            x, y = stack.pop()
            for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= a < r and 0 <= b < c and (a, b) not in seen and heights[a][b] >= heights[x][y]:
                    seen.add((a, b))
                    stack.append((a, b))
        return seen
    pac = reach([(0, j) for j in range(c)] + [(i, 0) for i in range(r)])
    atl = reach([(r - 1, j) for j in range(c)] + [(i, c - 1) for i in range(r)])
    return sorted([a, b] for a, b in pac & atl)`, 'O(rc)', 'When every start is expensive, search backward from the goal.',
  [['both_oceans([[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]])', '[[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]'], ['both_oceans([[1]])', '[[0, 0]]'], ['both_oceans([])', '[]'], ['both_oceans([[2, 1], [1, 2]])', '[[0, 0], [0, 1], [1, 0], [1, 1]]']]),
p('clone-graph', 'Clone Graph', 'Medium', 18, 'Each <code>Node</code> has <code>val</code> and a list <code>neighbors</code>. Return a deep copy of a connected graph, or <code>None</code> for <code>None</code>. No node in the copy may be shared with the original.', 'class Node:\n    def __init__(self, val, neighbors=None):\n        self.val = val\n        self.neighbors = neighbors or []\n\ndef clone(node):\n    pass\n',
  ['The graph has cycles. How do you stop going round forever?', 'What does a dict of old node to new node give you?'],
  R`class Node:
    def __init__(self, val, neighbors=None):
        self.val = val
        self.neighbors = neighbors or []

def clone(node):
    if not node:
        return None
    copies = {node: Node(node.val)}
    stack = [node]
    while stack:
        n = stack.pop()
        for m in n.neighbors:
            if m not in copies:
                copies[m] = Node(m.val)
                stack.append(m)
            copies[n].neighbors.append(copies[m])
    return copies[node]`, 'O(V + E)', 'Map each old node to its copy: that map is your "seen" set too.',
  [['clone(None)', 'None'], ['c.val, c is not a, [n.val for n in c.neighbors]', '(1, True, [2, 4])', 'a, b, d, e = Node(1), Node(2), Node(3), Node(4)\na.neighbors = [b, e]\nb.neighbors = [a, d]\nd.neighbors = [b, e]\ne.neighbors = [a, d]\nc = clone(a)'], ['c.neighbors[0].neighbors[0] is c', 'True', 'a, b = Node(1), Node(2)\na.neighbors = [b]\nb.neighbors = [a]\nc = clone(a)'], ['c.neighbors[0] is not b', 'True', 'a, b = Node(1), Node(2)\na.neighbors = [b]\nb.neighbors = [a]\nc = clone(a)']]));
more('topo-unionfind',
p('alien-order', 'Alien Dictionary', 'Hard', 30, '<code>words</code> are sorted by some unknown alphabet. Return one possible ordering of all the letters as a string, or <code>""</code> if the input contradicts itself. If a word comes before its own prefix, that\'s a contradiction too.', 'def alien_order(words):\n    ',
  ['What can you learn by comparing just two neighbouring words?', 'You now have "a comes before b" facts. Which unit is this really?'],
  R`def alien_order(words):
    after = {ch: set() for w in words for ch in w}
    need = {ch: 0 for ch in after}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in after[x]:
                    after[x].add(y)
                    need[y] += 1
                break
        else:
            if len(a) > len(b):
                return ""
    ready = [c for c in need if need[c] == 0]
    out = []
    while ready:
        c = ready.pop()
        out.append(c)
        for d in after[c]:
            need[d] -= 1
            if need[d] == 0:
                ready.append(d)
    return "".join(out) if len(out) == len(need) else ""`, 'O(total letters)', 'Only the first difference between neighbours teaches anything. Then it\'s a topological sort.',
  [['alien_order(["wrt", "wrf", "er", "ett", "rftt"])', '"wertf"'], ['alien_order(["z", "x"])', '"zx"'], ['alien_order(["z", "x", "z"])', '""'], ['alien_order(["abc", "ab"])', '""'], ['sorted(alien_order(["a", "a"]))', '["a"]']]));
more('shortest-paths',
p('swim-water', 'Swim in Rising Water', 'Hard', 25, 'In an n by n grid, each cell has a height. At time t the water is at level t, and you can swim between neighbours when both are at or below it. Return the earliest time you can get from the top-left to the bottom-right.', 'def swim(grid):\n    ',
  ['A path\'s cost isn\'t a sum here. What is it?', 'Dijkstra still works if you change one thing about how a path\'s cost is combined.'],
  R`def swim(grid):
    n = len(grid)
    h = [(grid[0][0], 0, 0)]
    seen = {(0, 0)}
    while h:
        t, x, y = heapq.heappop(h)
        if x == y == n - 1:
            return t
        for a, b in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= a < n and 0 <= b < n and (a, b) not in seen:
                seen.add((a, b))
                heapq.heappush(h, (max(t, grid[a][b]), a, b))`, 'O(n^2 log n)', 'Dijkstra works for any cost that never drops as a path grows, including "the worst step so far".',
  [['swim([[0, 2], [1, 3]])', '3'], ['swim([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]])', '16'], ['swim([[5]])', '5'], ['swim([[0, 9], [1, 2]])', '2']]));
more('backtracking',
p('letter-combos', 'Letter Combinations of a Phone Number', 'Medium', 12, 'Each digit 2 to 9 maps to letters as on a phone: 2 is abc, 3 is def, 4 ghi, 5 jkl, 6 mno, 7 pqrs, 8 tuv, 9 wxyz. Return a sorted list of all the strings a digit string could spell. Empty input gives an empty list.', 'def combos(digits):\n    ',
  ['Draw it as a tree. What is the choice at each level?'],
  R`def combos(digits):
    pad = dict(zip("23456789", "abc def ghi jkl mno pqrs tuv wxyz".split()))
    if not digits:
        return []
    out = []
    def go(i, cur):
        if i == len(digits):
            out.append(cur)
            return
        for ch in pad[digits[i]]:
            go(i + 1, cur + ch)
    go(0, "")
    return sorted(out)`, 'O(4^n)', 'One level per digit, one branch per letter.',
  [['combos("23")', '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]'], ['combos("")', '[]'], ['combos("7")', '["p", "q", "r", "s"]'], ['len(combos("79"))', '16']]),
p('generate-parens', 'Generate Parentheses', 'Medium', 15, 'Return a sorted list of all valid strings using <code>n</code> pairs of parentheses.', 'def gen_parens(n):\n    ',
  ['Build a string one character at a time. When can you add "("? When can you add ")"?'],
  R`def gen_parens(n):
    out = []
    def go(cur, o, c):
        if len(cur) == 2 * n:
            out.append(cur)
            return
        if o < n:
            go(cur + "(", o + 1, c)
        if c < o:
            go(cur + ")", o, c + 1)
    go("", 0, 0)
    return sorted(out)`, 'About O(4^n / sqrt(n))', 'Good backtracking never builds what can\'t be valid.',
  [['gen_parens(1)', '["()"]'], ['gen_parens(3)', '["((()))", "(()())", "(())()", "()(())", "()()()"]'], ['gen_parens(0)', '[""]'], ['len(gen_parens(8))', '1430']]),
p('subsets-ii', 'Subsets II', 'Medium', 18, 'The list may have duplicates. Return every distinct subset, each sorted, with the whole list of subsets sorted too.', 'def subsets_dup(nums):\n    ',
  ['If you sort first, where do the duplicates sit?', 'At one level of the tree, when would choosing the same value again lead to a repeat?'],
  R`def subsets_dup(nums):
    nums = sorted(nums)
    out = []
    def go(i, cur):
        out.append(cur[:])
        for j in range(i, len(nums)):
            if j > i and nums[j] == nums[j - 1]:
                continue
            cur.append(nums[j])
            go(j + 1, cur)
            cur.pop()
    go(0, [])
    return sorted(out)`, 'O(n 2^n)', 'Sort first, then skip a repeated value at the same level.',
  [['subsets_dup([1, 2, 2])', '[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]'], ['subsets_dup([0])', '[[], [0]]'], ['subsets_dup([])', '[[]]'], ['len(subsets_dup([1, 1, 1, 1]))', '5']]),
p('palindrome-partition', 'Palindrome Partitioning', 'Medium', 20, 'Cut a string so that every piece is a palindrome. Return a sorted list of all the ways, each as a list of pieces.', 'def partitions(s):\n    ',
  ['What is the choice at each step? Think about where the next cut goes.', 'When does a branch stop, and what counts as a finished answer?'],
  R`def partitions(s):
    out = []
    def go(i, cur):
        if i == len(s):
            out.append(cur[:])
            return
        for j in range(i + 1, len(s) + 1):
            part = s[i:j]
            if part == part[::-1]:
                cur.append(part)
                go(j, cur)
                cur.pop()
    go(0, [])
    return sorted(out)`, 'O(n 2^n)', 'Each branch chooses where the next cut goes.',
  [['partitions("aab")', '[["a", "a", "b"], ["aa", "b"]]'], ['partitions("a")', '[["a"]]'], ['partitions("")', '[[]]'], ['len(partitions("aaaa"))', '8']]));
more('greedy',
p('jump-game-ii', 'Jump Game II', 'Medium', 18, '<code>nums[i]</code> is the longest jump you can make from position i. Return the fewest jumps to reach the last position. It is always reachable. It must be O(n).', 'def min_jumps(nums):\n    ',
  ['Think of positions reachable with k jumps as a range. What is the range for k + 1?'],
  R`def min_jumps(nums):
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:
            jumps += 1
            end = far
    return jumps`, 'O(n)', 'It\'s BFS over ranges, with no queue needed.',
  [['min_jumps([2, 3, 1, 1, 4])', '2'], ['min_jumps([2, 3, 0, 1, 4])', '2'], ['min_jumps([0])', '0'], ['min_jumps([1, 1, 1])', '2'], ['min_jumps([1] * 500000)', '499999']]),
p('partition-labels', 'Partition Labels', 'Medium', 14, 'Cut a string into as many pieces as you can, so that each letter appears in only one piece. Return the piece lengths.', 'def partition(s):\n    ',
  ['Once a piece contains some letter, how far must it stretch at least?'],
  R`def partition(s):
    last = {c: i for i, c in enumerate(s)}
    out, start, end = [], 0, 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            out.append(i - start + 1)
            start = i + 1
    return out`, 'O(n)', 'Each letter you see can stretch the current piece. When you reach its end, cut.',
  [['partition("ababcbacadefegdehijhklij")', '[9, 7, 8]'], ['partition("eccbbbbdec")', '[10]'], ['partition("")', '[]'], ['partition("abc")', '[1, 1, 1]']]),
p('hand-straights', 'Hand of Straights', 'Medium', 15, 'Return whether a hand of cards can be split entirely into groups of <code>size</code> consecutive numbers.', 'def can_group(hand, size):\n    ',
  ['Which card has no choice about how it is used?'],
  R`def can_group(hand, size):
    if len(hand) % size:
        return False
    count = Counter(hand)
    for x in sorted(count):
        n = count[x]
        if n:
            for k in range(x, x + size):
                if count[k] < n:
                    return False
                count[k] -= n
    return True`, 'O(n log n)', 'The smallest card must start a group. Forced moves make greedy safe.',
  [['can_group([1, 2, 3, 6, 2, 3, 4, 7, 8], 3)', 'True'], ['can_group([1, 2, 3, 4, 5], 4)', 'False'], ['can_group([], 2)', 'True'], ['can_group([1, 1, 2, 2, 3, 3], 3)', 'True'], ['can_group([1, 2, 4], 3)', 'False']]));
more('dp-1d',
p('decode-ways', 'Decode Ways', 'Medium', 18, 'Digits decode to letters with 1 as A through 26 as Z. Return how many ways a digit string can be decoded. A zero can\'t begin a code, so <code>"06"</code> has no decoding.', 'def decode_ways(s):\n    ',
  ['How do the ways to decode up to position i depend on the earlier positions?', 'When can the last one digit stand alone? When can the last two?'],
  R`def decode_ways(s):
    if not s:
        return 0
    a, b = 1, 1
    for i in range(len(s)):
        c = b if s[i] != "0" else 0
        if i and 10 <= int(s[i - 1:i + 1]) <= 26:
            c += a
        a, b = b, c
    return b`, 'O(n) time, O(1) space', 'Stairs with rules: a step of one or two digits, if allowed.',
  [['decode_ways("12")', '2'], ['decode_ways("226")', '3'], ['decode_ways("06")', '0'], ['decode_ways("10")', '1'], ['decode_ways("100")', '0'], ['decode_ways("")', '0'], ['decode_ways("1" * 40)', '165580141']]),
p('rob-ii', 'House Robber II', 'Medium', 14, 'The houses stand in a circle, so the first and last are neighbours. You can\'t rob two neighbours. Return the most you can take.', 'def rob_circle(nums):\n    ',
  ['You solved the straight line. What are the two cases a circle splits into?'],
  R`def rob_circle(nums):
    if len(nums) == 1:
        return nums[0]
    def line(a):
        x = y = 0
        for v in a:
            x, y = y, max(y, x + v)
        return y
    return max(line(nums[1:]), line(nums[:-1]))`, 'O(n)', 'Break a circle by trying each way of cutting it.',
  [['rob_circle([2, 3, 2])', '3'], ['rob_circle([1, 2, 3, 1])', '4'], ['rob_circle([5])', '5'], ['rob_circle([])', '0'], ['rob_circle([1, 9])', '9']]),
p('max-product', 'Maximum Product Subarray', 'Medium', 18, 'Return the largest product of any unbroken stretch of a list of integers, which may include negatives and zeros. The list has at least one number.', 'def max_product(nums):\n    ',
  ['Why can a very negative product suddenly become the best one?', 'What two values should you track as you go?'],
  R`def max_product(nums):
    best = hi = lo = nums[0]
    for x in nums[1:]:
        hi, lo = max(x, hi * x, lo * x), min(x, hi * x, lo * x)
        best = max(best, hi)
    return best`, 'O(n)', 'A negative flips worst into best, so remember both.',
  [['max_product([2, 3, -2, 4])', '6'], ['max_product([-2, 0, -1])', '0'], ['max_product([-2, 3, -4])', '24'], ['max_product([-5])', '-5'], ['max_product([0, 2])', '2']]),
p('partition-equal', 'Partition Equal Subset Sum', 'Medium', 18, 'Return whether a list of positive integers can be split into two groups with equal sums.', 'def can_partition(nums):\n    ',
  ['What total must one group reach?', 'As you consider each number, which totals become possible?'],
  R`def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    can = 1
    for x in nums:
        can |= can << x
    return bool(can >> (total // 2) & 1)`, 'O(n * total)', 'Knapsack with yes/no answers. A set of reachable totals is enough.',
  [['can_partition([1, 5, 11, 5])', 'True'], ['can_partition([1, 2, 3, 5])', 'False'], ['can_partition([])', 'True'], ['can_partition([2])', 'False'], ['can_partition([100] * 200)', 'True']]),
p('count-palindromes', 'Palindromic Substrings', 'Medium', 15, 'Return how many stretches of a string are palindromes, counting each position separately.', 'def count_pals(s):\n    ',
  ['Instead of testing every substring, where could you start from and grow outward?', 'How many possible centres does a string of length n have?'],
  R`def count_pals(s):
    n, total = len(s), 0
    for c in range(2 * n - 1):
        a, b = c // 2, (c + 1) // 2
        while a >= 0 and b < n and s[a] == s[b]:
            total += 1
            a -= 1
            b += 1
    return total`, 'O(n^2) time, O(1) space', 'Grow outward from each centre, including the gaps between letters.',
  [['count_pals("abc")', '3'], ['count_pals("aaa")', '6'], ['count_pals("")', '0'], ['count_pals("abba")', '6'], ['count_pals("a" * 2000)', '2001000']]));
more('dp-2d',
p('coin-change-ii', 'Coin Change II', 'Medium', 18, 'Return how many different combinations of coins make up <code>amount</code>. Each coin type can be used as often as you like. Order doesn\'t matter, so 1+2 and 2+1 count once.', 'def coin_ways(amount, coins):\n    ',
  ['How do you stop 1+2 and 2+1 from counting twice?', 'Think about the loop order: coins on the outside, or amounts on the outside?'],
  R`def coin_ways(amount, coins):
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]`, 'O(amount * coins)', 'Loop over coins first: that counts combinations, not orderings.',
  [['coin_ways(5, [1, 2, 5])', '4'], ['coin_ways(3, [2])', '0'], ['coin_ways(0, [7])', '1'], ['coin_ways(10, [10])', '1'], ['coin_ways(500, [1, 2, 5, 10, 20, 50, 100, 200])', '6295434']]),
p('target-sum', 'Target Sum', 'Medium', 18, 'Put a + or a - in front of every number. Return how many ways the result can equal <code>target</code>.', 'def target_ways(nums, target):\n    ',
  ['Trying everything costs 2^n. How many different running totals can there really be?'],
  R`def target_ways(nums, target):
    ways = Counter({0: 1})
    for x in nums:
        nxt = Counter()
        for total, n in ways.items():
            nxt[total + x] += n
            nxt[total - x] += n
        ways = nxt
    return ways[target]`, 'O(n * total)', 'Exponential choices can collapse into few states. Count by state.',
  [['target_ways([1, 1, 1, 1, 1], 3)', '5'], ['target_ways([1], 1)', '1'], ['target_ways([1], 2)', '0'], ['target_ways([0, 0], 0)', '4'], ['target_ways([1] * 60, 0)', '118264581564861424']]),
p('interleaving', 'Interleaving String', 'Medium', 22, 'Return whether <code>c</code> can be made by weaving <code>a</code> and <code>b</code> together, keeping each one\'s letters in their own order.', 'def interleaves(a, b, c):\n    ',
  ['What describes your position while weaving? How many numbers do you need?', 'Is there a total length check you can do straight away?'],
  R`def interleaves(a, b, c):
    if len(a) + len(b) != len(c):
        return False
    dp = [False] * (len(b) + 1)
    for i in range(len(a) + 1):
        for j in range(len(b) + 1):
            if i == j == 0:
                dp[j] = True
            else:
                from_a = i > 0 and dp[j] and a[i - 1] == c[i + j - 1]
                from_b = j > 0 and dp[j - 1] and b[j - 1] == c[i + j - 1]
                dp[j] = from_a or from_b
    return dp[-1]`, 'O(mn) time, O(n) space', 'Position in a and position in b: two numbers, so a 2D table.',
  [['interleaves("aabcc", "dbbca", "aadbbcbcac")', 'True'], ['interleaves("aabcc", "dbbca", "aadbbbaccc")', 'False'], ['interleaves("", "", "")', 'True'], ['interleaves("a", "", "a")', 'True'], ['interleaves("a", "b", "ab")', 'True'], ['interleaves("a", "b", "aab")', 'False']]),
p('stock-cooldown', 'Best Time to Buy and Sell Stock with Cooldown', 'Medium', 22, 'Buy and sell as often as you like, holding at most one share. The day after a sale you can\'t buy. Return the best total profit.', 'def max_profit(prices):\n    ',
  ['At the end of any day, what situations could you be in?', 'Write how each situation can be reached from yesterday\'s.'],
  R`def max_profit(prices):
    hold, sold, rest = float("-inf"), 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`, 'O(n)', 'Name the states, then write the moves between them: a state machine is DP.',
  [['max_profit([1, 2, 3, 0, 2])', '3'], ['max_profit([1])', '0'], ['max_profit([])', '0'], ['max_profit([5, 4, 3])', '0'], ['max_profit([1, 2, 4])', '3']]),
p('regex-match', 'Regular Expression Matching', 'Hard', 32, 'Return whether a pattern matches a whole string. <code>.</code> matches any one character, and <code>x*</code> means zero or more of x. Don\'t use the <code>re</code> module.', 'def is_match(s, p):\n    ',
  ['What describes your position? When a star follows, what two choices do you have?', 'Remembering answers stops this exploding.'],
  R`def is_match(s, p):
    memo = {}
    def go(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        if j == len(p):
            ans = i == len(s)
        else:
            first = i < len(s) and p[j] in (s[i], ".")
            if j + 1 < len(p) and p[j + 1] == "*":
                ans = go(i, j + 2) or (first and go(i + 1, j))
            else:
                ans = first and go(i + 1, j + 1)
        memo[(i, j)] = ans
        return ans
    return go(0, 0)`, 'O(mn)', 'A star is a choice: skip it, or use it and stay. Remembering makes that polynomial.',
  [['is_match("aa", "a")', 'False'], ['is_match("aa", "a*")', 'True'], ['is_match("ab", ".*")', 'True'], ['is_match("aab", "c*a*b")', 'True'], ['is_match("", "a*b*")', 'True'], ['is_match("mississippi", "mis*is*p*.")', 'False'], ['is_match("a" * 25, "a*" * 12 + "b")', 'False']]));
more('bits-math',
p('missing-number', 'Missing Number', 'Easy', 8, 'A list holds distinct numbers from 0 to n, with one missing. Return it, using O(1) extra space.', 'def missing(nums):\n    ',
  ['What should the total be, if nothing were missing?'],
  R`def missing(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)`, 'O(n) time, O(1) space', 'Compare with what the total should be. XOR works too.',
  [['missing([3, 0, 1])', '2'], ['missing([0])', '1'], ['missing([1])', '0'], ['missing(list(range(100000)))', '100000']]),
p('counting-bits', 'Counting Bits', 'Easy', 10, 'Return a list of length n + 1, where entry i is how many 1 bits i has. Aim for O(n).', 'def count_bits(n):\n    ',
  ['Look at the binary of i and of i // 2. How do they relate?'],
  R`def count_bits(n):
    out = [0] * (n + 1)
    for i in range(1, n + 1):
        out[i] = out[i >> 1] + (i & 1)
    return out`, 'O(n)', 'Bits have DP too: a number is its half, plus its last bit.',
  [['count_bits(2)', '[0, 1, 1]'], ['count_bits(5)', '[0, 1, 1, 2, 1, 2]'], ['count_bits(0)', '[0]'], ['count_bits(1000000)[1000000]', '7']]),
p('sum-no-plus', 'Sum of Two Integers', 'Medium', 18, 'Add two integers, which may be negative, without <code>+</code> or <code>-</code>. Results fit in 32 bits. Python\'s integers never overflow, so you\'ll need to mimic 32 bits yourself.', 'def add(a, b):\n    ',
  ['Adding in binary by hand: what gives you the bits without carrying? What gives you the carries?', 'What bitwise mask limits a number to 32 bits? How do you turn the top bit back into a negative?'],
  R`def add(a, b):
    mask = 0xFFFFFFFF
    a, b = a & mask, b & mask
    while b:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask
    return a if a < 0x80000000 else ~(a ^ mask)`, 'O(1): at most 32 rounds', 'XOR adds without carrying; AND finds the carries. Repeat until no carries remain.',
  [['add(1, 2)', '3'], ['add(-1, 1)', '0'], ['add(-5, -7)', '-12'], ['add(0, 0)', '0'], ['add(2147483646, 1)', '2147483647']]),
p('sieve', 'Count primes', 'Medium', 14, 'Return how many primes are below <code>n</code>. It must cope with n of a million.', 'def count_primes(n):\n    ',
  ['Instead of testing each number, what if each prime crossed off its multiples?', 'Where can each prime start crossing off?'],
  R`def count_primes(n):
    if n < 3:
        return 0
    sieve = bytearray([1]) * n
    sieve[0] = sieve[1] = 0
    for i in range(2, int(n ** 0.5) + 1):
        if sieve[i]:
            sieve[i * i::i] = bytes(len(range(i * i, n, i)))
    return sum(sieve)`, 'O(n log log n)', 'Sieve of Eratosthenes: cross off multiples, starting from i squared.',
  [['count_primes(10)', '4'], ['count_primes(0)', '0'], ['count_primes(2)', '0'], ['count_primes(3)', '1'], ['count_primes(1000000)', '78498']]),
p('kmp-find', 'Find the Index of the First Occurrence', 'Hard', 30, 'Return the first index where <code>needle</code> appears in <code>hay</code>, or -1, in O(n + m) time, without <code>in</code>, <code>find</code> or <code>index</code>. An empty needle gives 0. Slow scanning will fail on the big test.', 'def find_first(hay, needle):\n    ',
  ['When a match fails partway, what do you already know about the text you just read?', 'For each position in the needle, work out the longest part that is both a start and an end of it. This is the KMP table.'],
  R`def find_first(hay, needle):
    if not needle:
        return 0
    fail = [0] * len(needle)
    k = 0
    for i in range(1, len(needle)):
        while k and needle[i] != needle[k]:
            k = fail[k - 1]
        if needle[i] == needle[k]:
            k += 1
        fail[i] = k
    k = 0
    for i, ch in enumerate(hay):
        while k and ch != needle[k]:
            k = fail[k - 1]
        if ch == needle[k]:
            k += 1
        if k == len(needle):
            return i - k + 1
    return -1`, 'O(n + m)', 'KMP: a mismatch never rereads the text, because the needle knows how far it can fall back.',
  [['find_first("sadbutsad", "sad")', '0'], ['find_first("leetcode", "leeto")', '-1'], ['find_first("abc", "")', '0'], ['find_first("", "a")', '-1'], ['find_first("aaaaab", "aab")', '3'], ['find_first("a" * 300000 + "b", "a" * 150000 + "b")', '150000']]));
})();
