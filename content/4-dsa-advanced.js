// Phase 3: Hard algorithms.

const G1 = { A: [80, 40], B: [220, 40], C: [80, 150], D: [220, 150], E: [360, 95], F: [500, 95] };
const G1E = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['E', 'F']];
unit({ id: 'graphs', phase: 3, title: 'Graphs: BFS and DFS', mins: 12, read: [
`<p class="lede">A graph is just <b>things and connections</b>: cities and roads, people and friendships, tasks and dependencies, cells in a grid. Once you can see the graph in a problem, you already know two ways to explore it.</p>`,
`<h2>Breadth first: ripples in a pond</h2>`,
steps((() => {
  const f = [], fr = (hl, q, n) => f.push({ n, d: D.graph(G1, G1E, { hl }) + D.t(40, 205, 'queue: ' + q, { mono: 1 }) });
  fr({ A: 'y' }, 'A', 'Start at A. It\'s distance 0.');
  fr({ A: 'g', B: 'y', C: 'y' }, 'B C', 'Everything one step away goes in the queue, and is marked as seen right away.');
  fr({ A: 'g', B: 'g', C: 'g', D: 'y' }, 'D', 'Then everything two steps away. D is reached from both sides, but it\'s already marked, so it\'s only queued once.');
  fr({ A: 'g', B: 'g', C: 'g', D: 'g', E: 'y' }, 'E', 'Three steps.');
  fr({ A: 'g', B: 'g', C: 'g', D: 'g', E: 'g', F: 'y' }, 'F', 'Four steps. BFS reaches every node by a shortest path, counted in hops.');
  return f;
})(), 220),
`<h2>Depth first: walk a maze with one hand on the wall</h2><p>Go as far as you can. Hit a dead end, go back to the last choice you didn't try. A stack holds your trail, or the call stack does if you use recursion. It's the natural choice for "can I reach it?", "how many separate pieces?" and "is there a cycle?".</p>
<h2>Which, when?</h2>
<table><tr><th>You want</th><th>Use</th></tr><tr><td>Fewest steps, nearest thing, layers</td><td>BFS</td></tr><tr><td>Reachable, connected pieces, exploring everything</td><td>Either. DFS is usually shorter.</td></tr><tr><td>Fewest steps from several starting points</td><td>BFS with all of them in the queue at the start</td></tr></table>
<h2>The two things everyone forgets</h2><p><b>Seen:</b> graphs have loops. Without a record of what you've visited, you'll go round forever.</p><p><b>When to mark:</b> mark a node when you put it in the queue, not when you take it out. Otherwise it can be queued many times.</p>
<h2>Seeing the hidden graph</h2>`,
fig(D.grid([[1, 1, 0], [0, 1, 0], [1, 0, 1]], { x: 30, y: 16, s: 48, hl: { '0,0': 'y', '0,1': 'y', '1,1': 'y', '2,0': 'b', '2,2': 'g' } }) + D.t(220, 60, 'Each land cell is a node.', {}) + D.t(220, 90, 'Touching cells are connected.', {}) + D.t(220, 130, 'Three separate pieces of land here.', { cls: 'r' }), 180, 'States can be nodes too. In a puzzle, each arrangement is a node and each move is an edge. Then "fewest moves" is BFS.'),
think('How would you store a graph given a list of edge pairs?', 'A dict from node to a list of neighbours, called an adjacency list. <code>g = defaultdict(list)</code>, then add both directions for each edge if the graph is two-way.')
], core: ['num-islands', {
  id: 'graph-valid-path', title: 'Is there a path?', diff: 'Easy', time: 10,
  desc: `<p>Nodes are numbered 0 to n-1. Edges are two-way pairs. Return True if you can get from <code>a</code> to <code>b</code>. Tests include 200,000 nodes in one long chain, so a deeply recursive answer will crash.</p>`, ex: [['3, [[0, 1], [1, 2]], 0, 2', 'True'], ['3, [[0, 1]], 0, 2', 'False']], start: 'def has_path(n, edges, a, b):\n    ',
  nudge: ['How will you find a node\'s neighbours quickly?', 'What stops you going round a loop forever?'],
  sol: `from collections import defaultdict\n\ndef has_path(n, edges, a, b):\n    g = defaultdict(list)\n    for x, y in edges:\n        g[x].append(y)\n        g[y].append(x)\n    seen = {a}\n    stack = [a]\n    while stack:\n        v = stack.pop()\n        if v == b:\n            return True\n        for w in g[v]:\n            if w not in seen:\n                seen.add(w)\n                stack.append(w)\n    return False`, big: 'O(V + E)', idea: 'Build the adjacency list, explore, and remember what you\'ve seen.',
  tests: [['has_path(3, [[0, 1], [1, 2]], 0, 2)', 'True'], ['has_path(3, [[0, 1]], 0, 2)', 'False'], ['has_path(1, [], 0, 0)', 'True'], ['has_path(4, [[0, 1], [1, 0], [2, 3]], 0, 3)', 'False'], ['has_path(200000, [[i, i + 1] for i in range(199999)], 0, 199999)', 'True']] },
'rotting-oranges'
], extra: ['water-jug', {
  id: 'graph-maze', title: 'Shortest way out', diff: 'Medium', time: 14,
  desc: `<p>A grid of <code>"."</code> open and <code>"#"</code> wall. Moving up, down, left or right, return the fewest steps from top-left to bottom-right, or -1 if you can't get there.</p>`, ex: [['["..", ".."]', '2'], ['[".#", "#."]', '-1']], start: 'def shortest(grid):\n    ',
  nudge: ['What are the nodes, and what are the edges?', 'What does each round of BFS mean in steps?'],
  sol: `from collections import deque\n\ndef shortest(grid):\n    R, C = len(grid), len(grid[0])\n    if grid[0][0] == "#" or grid[R - 1][C - 1] == "#":\n        return -1\n    q = deque([(0, 0, 0)])\n    seen = {(0, 0)}\n    while q:\n        r, c, d = q.popleft()\n        if (r, c) == (R - 1, C - 1):\n            return d\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            n = (r + dr, c + dc)\n            if 0 <= n[0] < R and 0 <= n[1] < C and grid[n[0]][n[1]] == "." and n not in seen:\n                seen.add(n)\n                q.append((n[0], n[1], d + 1))\n    return -1`, big: 'O(rows × cols)', idea: 'Fewest steps on an unweighted graph means BFS.',
  tests: [['shortest(["..", ".."])', '2'], ['shortest([".#", "#."])', '-1'], ['shortest(["."])', '0'], ['shortest(["#"])', '-1'], ['shortest(["..#", "#..", "#.."])', '4'], ['shortest(["...", "##.", "...", ".##", "..."])', '10']] }
], boss:
{ id: 'graph-word-ladder', title: 'Word ladder', diff: 'Hard', time: 25,
  desc: `<p>Change <code>start</code> into <code>end</code> one letter at a time, where each step must be a word in <code>words</code>. Return the number of words in the shortest chain including start and end, or 0 if impossible. <code>start</code> need not be in the list. <code>end</code> must be.</p>`, ex: [['"hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]', '5', 'hit, hot, dot, dog, cog']], start: 'def ladder(start, end, words):\n    ', nudge: [],
  sol: `from collections import deque\n\ndef ladder(start, end, words):\n    left = set(words)\n    if end not in left:\n        return 0\n    q = deque([(start, 1)])\n    while q:\n        w, d = q.popleft()\n        if w == end:\n            return d\n        for i in range(len(w)):\n            for c in "abcdefghijklmnopqrstuvwxyz":\n                n = w[:i] + c + w[i + 1:]\n                if n in left:\n                    left.remove(n)\n                    q.append((n, d + 1))\n    return 0`, big: 'O(words × length × 26)', idea: 'Words are nodes, and one-letter changes are edges. Nobody gives you the graph: you have to see it.',
  tests: [['ladder("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])', '5'], ['ladder("hit", "cog", ["hot", "dot", "dog", "lot", "log"])', '0'], ['ladder("a", "c", ["a", "b", "c"])', '2'], ['ladder("hot", "dog", ["hot", "dog"])', '0'], ['ladder("aa", "bb", ["ab", "bb"])', '3']] }
});

unit({ id: 'topo-unionfind', phase: 3, title: 'Order and groups', mins: 11, read: [
`<p class="lede">Two tools for special graphs. <b>Topological sort</b> answers "what order should things happen in?" <b>Union-find</b> answers "are these two connected?" while connections keep arriving.</p>`,
`<h2>Getting dressed: topological sort</h2>`,
steps((() => {
  const N = { socks: [90, 40, 'sox'], shoes: [270, 40, 'shoe'], pants: [90, 130, 'pant'], belt: [270, 130, 'belt'] };
  const E = [['socks', 'shoes'], ['pants', 'shoes'], ['pants', 'belt']];
  const fr = (hl, out, n) => ({ n, d: D.graph(N, E, { dir: true, hl, r: 24 }) + D.t(400, 70, 'done: ' + out, {}) });
  return [
    fr({ socks: 'y', pants: 'y' }, '(none)', 'Count arrows coming in. Anything with zero is ready to go. That is sox and pants.'),
    fr({ socks: 'g', pants: 'y' }, 'sox', 'Do sox. Its arrow to shoe disappears, so shoe\'s count goes down by one.'),
    fr({ socks: 'g', pants: 'g', belt: 'y', shoes: 'y' }, 'sox, pant', 'Do pants. Now belt and shoe each have zero arrows in, so they\'re ready.'),
    fr({ socks: 'g', pants: 'g', belt: 'g', shoes: 'g' }, 'sox, pant, shoe, belt', 'Everything is done. If you ever run out of ready items with things still left, there is a cycle, and no order exists.')
  ];
})(), 180),
`<h2>Union-find: who's in my group?</h2>`,
steps([
  { n: 'Everyone starts as their own leader.', d: D.graph({ a: [60, 60], b: [170, 60], c: [280, 60], d: [390, 60] }, []) },
  { n: 'Join a and b: b now points at a. To find someone\'s group, follow the pointers up to the leader.', d: D.graph({ a: [60, 60], b: [170, 60], c: [280, 60], d: [390, 60] }, [['b', 'a']], { dir: true, hl: { a: 'y' } }) },
  { n: 'Join c and d, then b and d. Joining two groups means pointing one leader at the other.', d: D.graph({ a: [60, 60], b: [170, 60], c: [280, 60], d: [390, 60] }, [['b', 'a'], ['d', 'c'], ['c', 'a']], { dir: true, hl: { a: 'y' } }) },
  { n: 'Path compression: when you walk up to find the leader, re-point everyone you passed straight at it. The next walk is one step. It\'s very close to O(1).', d: D.graph({ a: [60, 60], b: [170, 60], c: [280, 60], d: [390, 60] }, [['b', 'a'], ['d', 'a'], ['c', 'a']], { dir: true, hl: { a: 'y' } }) }
], 110),
`<h2>Which tool?</h2><p>Connections arrive one at a time, and you need to answer as they arrive? Union-find. A fixed graph where you need distances? BFS. If two nodes are already in the same group and a new edge joins them, that edge forms a cycle. That fact solves a whole class of problems.</p>`,
think('Tasks and dependencies: what does a cycle mean for you, in plain words?', 'Task A waits for B, and B waits for A. Nothing can ever start. Topological sort detects it because the count of finished items falls short of the total.')
], core: [
{ id: 'course-order', title: 'Course order', diff: 'Medium', time: 16,
  desc: `<p>Courses are 0 to n-1. Each pair <code>[a, b]</code> means b has to be done before a. Return True if all courses can be finished.</p>`, ex: [['2, [[1, 0]]', 'True'], ['2, [[1, 0], [0, 1]]', 'False']], start: 'def can_finish(n, prereqs):\n    ',
  nudge: ['What is ready to do right now, before anything else?', 'What changes for the others when a course is finished?'],
  sol: `from collections import deque\n\ndef can_finish(n, prereqs):\n    g = [[] for _ in range(n)]\n    need = [0] * n\n    for a, b in prereqs:\n        g[b].append(a)\n        need[a] += 1\n    q = deque(i for i in range(n) if need[i] == 0)\n    done = 0\n    while q:\n        v = q.popleft()\n        done += 1\n        for w in g[v]:\n            need[w] -= 1\n            if need[w] == 0:\n                q.append(w)\n    return done == n`, big: 'O(V + E)', idea: 'Do what is ready, and release what was waiting. Finishing short means there is a cycle.',
  tests: [['can_finish(2, [[1, 0]])', 'True'], ['can_finish(2, [[1, 0], [0, 1]])', 'False'], ['can_finish(1, [])', 'True'], ['can_finish(4, [[1, 0], [2, 1], [3, 2], [1, 3]])', 'False'], ['can_finish(3, [[2, 0], [2, 1]])', 'True'], ['can_finish(1, [[0, 0]])', 'False']] },
{ id: 'connected-count', title: 'Friend groups', diff: 'Medium', time: 14,
  desc: `<p><code>n</code> people, and a list of friendship pairs. Return how many separate groups there are. Write a union-find rather than a graph walk. Tests use 200,000 people in one long chain.</p>`, ex: [['5, [[0, 1], [1, 2], [3, 4]]', '2']], start: 'def groups(n, pairs):\n    ',
  nudge: ['When a join actually merges two different groups, what happens to the count?', 'A long chain makes walking up slow. What could you change on the way up?'],
  sol: `def groups(n, pairs):\n    parent = list(range(n))\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n    count = n\n    for a, b in pairs:\n        ra, rb = find(a), find(b)\n        if ra != rb:\n            parent[ra] = rb\n            count -= 1\n    return count`, big: 'Very nearly O(n + m)', idea: 'Each real merge removes exactly one group.',
  tests: [['groups(5, [[0, 1], [1, 2], [3, 4]])', '2'], ['groups(3, [])', '3'], ['groups(2, [[0, 1], [1, 0]])', '1'], ['groups(1, [])', '1'], ['groups(200000, [[i, i + 1] for i in range(199999)])', '1']] }
], boss:
{ id: 'redundant-edge', title: 'The extra wire', diff: 'Medium', time: 18,
  desc: `<p>A network started as a tree, and one extra wire was added. Wires are given in order as pairs, with nodes numbered from 1. Return the wire which, if removed, leaves a tree. If there are several, return the last one in the input.</p>`, ex: [['[[1, 2], [1, 3], [2, 3]]', '[2, 3]']], start: 'def extra_wire(edges):\n    ', nudge: [],
  sol: `def extra_wire(edges):\n    parent = list(range(len(edges) + 1))\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n    for a, b in edges:\n        ra, rb = find(a), find(b)\n        if ra == rb:\n            return [a, b]\n        parent[ra] = rb`, big: 'Very nearly O(n)', idea: 'A wire joining two nodes already in the same group is the cycle-maker.',
  tests: [['extra_wire([[1, 2], [1, 3], [2, 3]])', '[2, 3]'], ['extra_wire([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]])', '[1, 4]'], ['extra_wire([[1, 2], [2, 3], [1, 3]])', '[1, 3]']] }
});

unit({ id: 'shortest-paths', phase: 3, title: 'Weighted shortest paths', mins: 8, read: [
`<p class="lede">BFS counts hops. But what if roads have different lengths? Now the path with fewer hops might be slower. <b>Dijkstra's idea: always settle the closest unsettled place next.</b></p>`,
steps((() => {
  const N = { S: [60, 100], A: [220, 40], B: [220, 160], T: [400, 100] }, E = [['S', 'A', 1], ['S', 'B', 4], ['A', 'B', 2], ['A', 'T', 6], ['B', 'T', 3]];
  const fr = (hl, dist, n) => ({ n, d: D.graph(N, E, { hl }) + D.t(480, 70, 'best known:', { cls: 'soft' }) + Object.entries(dist).map(([k, v], i) => D.t(480, 96 + i * 22, `${k}: ${v}`, { mono: 1 })).join('') });
  return [
    fr({ S: 'y' }, { S: 0, A: '∞', B: '∞', T: '∞' }, 'Only the start is known, at distance 0.'),
    fr({ S: 'g', A: 'y' }, { S: 0, A: 1, B: 4, T: '∞' }, 'From S: A is 1, B is 4. A is the closest unsettled. Nothing could beat 1 by going around, because all roads are non-negative. So A is settled.'),
    fr({ S: 'g', A: 'g', B: 'y' }, { S: 0, A: 1, B: 3, T: 7 }, 'From A: B improves to 1 + 2 = 3. T gets 7. Now B is closest.'),
    fr({ S: 'g', A: 'g', B: 'g', T: 'y' }, { S: 0, A: 1, B: 3, T: 6 }, 'From B: T improves to 3 + 3 = 6. Then T is settled at 6. A three-hop path won over a two-hop one.')
  ];
})(), 200),
`<h2>Which tool pulls out the closest?</h2><p>You need "the smallest known distance" over and over. You've already met that structure. Stale entries may remain in it when you find a better route. Just skip them if they're worse than what you already know.</p>
<h2>Limits</h2><p><b>No negative roads.</b> The whole argument relies on "going further can't get cheaper." With negative edges, you need Bellman-Ford: repeat "try to improve across every edge", V − 1 times.</p>`,
think('All roads have length 1. What happens to Dijkstra?', 'It becomes BFS, with an extra log factor for the heap. If every weight is the same, use plain BFS.')
], core: [
{ id: 'network-delay', title: 'Network delay', diff: 'Medium', time: 18,
  desc: `<p>Nodes 1 to n. <code>times</code> holds one-way edges <code>[from, to, cost]</code>. A signal starts at <code>k</code>. Return the time for all nodes to receive it, or -1 if some never will.</p>`, ex: [['[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2', '2']], start: 'def delay(times, n, k):\n    ',
  nudge: ['What should you pull out next at each step?', 'You may pop a node twice. What should the second pop do?'],
  sol: `import heapq\n\ndef delay(times, n, k):\n    g = {}\n    for a, b, c in times:\n        g.setdefault(a, []).append((b, c))\n    h = [(0, k)]\n    best = {}\n    while h:\n        d, v = heapq.heappop(h)\n        if v in best:\n            continue\n        best[v] = d\n        for w, c in g.get(v, []):\n            if w not in best:\n                heapq.heappush(h, (d + c, w))\n    return max(best.values()) if len(best) == n else -1`, big: 'O(E log V)', idea: 'A heap gives the closest unsettled node. Skip anything already settled.',
  tests: [['delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2)', '2'], ['delay([[1, 2, 1]], 2, 2)', '-1'], ['delay([], 1, 1)', '0'], ['delay([[1, 2, 5], [1, 3, 1], [3, 2, 1]], 3, 1)', '2'], ['delay([[1, 2, 1], [2, 1, 1]], 2, 1)', '1']] }
], boss:
{ id: 'cheapest-stops', title: 'Cheap flight, few stops', diff: 'Hard', time: 25,
  desc: `<p>Flights <code>[from, to, price]</code>. Return the cheapest price from <code>a</code> to <code>b</code> with <b>at most k stops</b> (so up to k + 1 flights), or -1.</p>`, ex: [['3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1', '200'], ['3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 0', '500']], start: 'def cheapest(n, flights, a, b, k):\n    ', nudge: [],
  sol: `def cheapest(n, flights, a, b, k):\n    INF = float("inf")\n    best = [INF] * n\n    best[a] = 0\n    for _ in range(k + 1):\n        nxt = best[:]\n        for u, v, p in flights:\n            if best[u] + p < nxt[v]:\n                nxt[v] = best[u] + p\n        best = nxt\n    return best[b] if best[b] < INF else -1`, big: 'O(k × flights)', idea: 'Round i finds the best with up to i flights. Using last round\'s copy stops one round from chaining extra flights.',
  tests: [['cheapest(3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1)', '200'], ['cheapest(3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 0)', '500'], ['cheapest(2, [], 0, 1, 3)', '-1'], ['cheapest(4, [[0,1,1],[1,2,1],[2,3,1],[0,3,10]], 0, 3, 1)', '10'], ['cheapest(1, [], 0, 0, 0)', '0'], ['cheapest(4, [[0,1,1],[1,2,1],[2,3,1],[0,3,10]], 0, 3, 2)', '3']] }
});

unit({ id: 'backtracking', phase: 3, title: 'Backtracking', mins: 9, read: [
`<p class="lede">Walking a maze with a ball of string. At each fork, try one way. Dead end? <b>Wind the string back to the fork, and try the next way.</b> It explores every option, but abandons bad ones early.</p>`,
fig(D.tree(['start', ['a', ['ab', ['abc'], null], ['ac']], ['b', ['bc']]], { x: 330, y: 22, spread: 170, dy: 50, hl: { abc: 'g', ac: 'g', bc: 'g' } }) + D.t(520, 60, 'each node: a partial choice', { cls: 'soft' }) + D.t(520, 90, 'going down: choose', { cls: 'b' }) + D.t(520, 120, 'coming back: undo', { cls: 'r' }), 200, 'Draw this tree first. Every backtracking problem is a tree of choices.'),
`<h2>The three questions</h2>
<ol><li><b>What's the choice</b> at this level? Include or skip this item? Which letter goes here?</li><li><b>When am I done</b>, and what do I record?</li><li><b>What's the pruning rule?</b> When can I already tell this branch can't work?</li></ol>`,
steps([
  { n: 'Choose: add it to the shared list, then go deeper.', d: D.t(40, 50, 'path = [a]', { mono: 1 }) + D.stack(['go(0)', 'go(1)'], { x: 400, y: 140, w: 120, h: 26 }) },
  { n: 'Going deeper: the path grows. Reach the end, and record it.', d: D.t(40, 50, 'path = [a, b]', { mono: 1 }) + D.t(40, 90, 'record a COPY', { cls: 'r' }) + D.stack(['go(0)', 'go(1)', 'go(2)'], { x: 400, y: 140, w: 120, h: 26 }) },
  { n: 'Undo as you come back, so the next branch starts clean. If you forget this, choices leak between branches. If you record the list without copying, every saved answer ends up being the same list.', d: D.t(40, 50, 'path = [a]', { mono: 1 }) + D.t(40, 90, 'pop b, try the next', { cls: 'b' }) + D.stack(['go(0)', 'go(1)'], { x: 400, y: 140, w: 120, h: 26 }) }
], 170),
`<h2>Pruning is everything</h2><p>Trying everything costs 2ⁿ or n!, so check the limits: this is for n up to about 20. A good pruning rule can turn "never finishes" into instant.</p>
<h2>Duplicates</h2><p>If the input has repeats, sorting first puts them side by side. Then the rule is: at a given level, don't start a branch with the same value twice.</p>`,
think('Generating all arrangements of n items: at each level, what is the choice, and how do you know which items are still free?', 'The choice is which item goes in this position. A used set, or swapping into place, tells you what is left.')
], core: ['subsets', {
  id: 'permutations', title: 'All orders', diff: 'Medium', time: 14,
  desc: `<p>Return all orderings of a list of distinct items, in any order. Don't use <code>itertools</code>.</p>`, ex: [['[1, 2]', '[[1, 2], [2, 1]]']], start: 'def perms(a):\n    ',
  nudge: ['Draw the tree for [1, 2, 3]. What is the choice at the top?', 'What must you do after coming back up from a choice?'],
  sol: `def perms(a):\n    out, path, used = [], [], set()\n    def go():\n        if len(path) == len(a):\n            out.append(path[:])\n            return\n        for x in a:\n            if x not in used:\n                used.add(x)\n                path.append(x)\n                go()\n                path.pop()\n                used.remove(x)\n    go()\n    return out`, big: 'O(n × n!)', idea: 'Choose, go deeper, undo. Record a copy.',
  tests: [['sorted(perms([1, 2]))', '[[1, 2], [2, 1]]'], ['perms([])', '[[]]'], ['perms([1])', '[[1]]'], ['len(perms([1, 2, 3, 4]))', '24'], ['len(set(map(tuple, perms([1, 2, 3]))))', '6']] },
'combination-sum'
], extra: [{
  id: 'word-search', title: 'Word in a grid', diff: 'Medium', time: 18,
  desc: `<p>Can <code>word</code> be traced in a letter grid through side-by-side neighbours, using each cell at most once in the path?</p>`, ex: [['["ABCE", "SFCS", "ADEE"], "ABCCED"', 'True'], ['["ABCE", "SFCS", "ADEE"], "ABCB"', 'False']], start: 'def has_word(grid, word):\n    ',
  nudge: ['How do you stop a path re-using a cell? And what must happen on the way back?'],
  sol: `def has_word(grid, word):\n    R, C = len(grid), len(grid[0])\n    used = set()\n    def go(r, c, i):\n        if i == len(word):\n            return True\n        if not (0 <= r < R and 0 <= c < C) or (r, c) in used or grid[r][c] != word[i]:\n            return False\n        used.add((r, c))\n        found = any(go(r + a, c + b, i + 1) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)))\n        used.remove((r, c))\n        return found\n    return any(go(r, c, 0) for r in range(R) for c in range(C))`, big: 'O(cells × 3^length)', idea: 'Mark on the way in, unmark on the way out.',
  tests: [['has_word(["ABCE", "SFCS", "ADEE"], "ABCCED")', 'True'], ['has_word(["ABCE", "SFCS", "ADEE"], "ABCB")', 'False'], ['has_word(["A"], "A")', 'True'], ['has_word(["AB"], "BA")', 'True'], ['has_word(["A"], "AA")', 'False']] }
], boss:
{ id: 'n-queens', title: 'N queens', diff: 'Hard', time: 25,
  desc: `<p>Return how many ways <code>n</code> queens can be placed on an n×n board so no two attack each other (same row, column or diagonal). n = 9 must finish quickly, so don't scan the board for each check.</p>`, ex: [['4', '2'], ['1', '1']], start: 'def queens(n):\n    ', nudge: [],
  sol: `def queens(n):\n    cols, d1, d2 = set(), set(), set()\n    def go(r):\n        if r == n:\n            return 1\n        total = 0\n        for c in range(n):\n            if c in cols or r + c in d1 or r - c in d2:\n                continue\n            cols.add(c); d1.add(r + c); d2.add(r - c)\n            total += go(r + 1)\n            cols.remove(c); d1.remove(r + c); d2.remove(r - c)\n        return total\n    return go(0)`, big: 'Far below n! thanks to pruning', idea: 'One queen per row. r + c and r − c name a diagonal, so checks are O(1).',
  tests: [['queens(4)', '2'], ['queens(1)', '1'], ['queens(2)', '0'], ['queens(6)', '4'], ['queens(8)', '92'], ['queens(9)', '352']] }
});

unit({ id: 'greedy', phase: 3, title: 'Greedy', mins: 7, read: [
`<p class="lede">Greedy means making the choice that looks best right now, and never reconsidering. <b>It's the simplest kind of algorithm, and it's often wrong.</b> So the skill is working out when it can be trusted.</p>`,
steps([
  { n: 'Coins 1, 3, 4. Make 6. Greedy takes the biggest first: 4. Then 1, then 1. That is 3 coins.', d: D.cells([4, 1, 1], { x: 120, y: 40, hl: { 0: 'y' } }) + D.t(320, 66, '3 coins: looks fine', {}) },
  { n: 'But 3 + 3 is just 2 coins. Greedy took a bite that spoiled what came after. So here you need dynamic programming.', d: D.cells([3, 3], { x: 120, y: 40, hl: { 0: 'g', 1: 'g' } }) + D.t(320, 66, '2 coins: greedy was wrong', { cls: 'r' }) }
], 120),
`<h2>Where it does work: the exchange argument</h2><p>You trust a greedy rule by arguing like this: "Take any best solution. If it doesn't start with my choice, I can swap my choice in and it doesn't get worse." So some best solution starts with my choice.</p>`,
fig(D.line(40, 44, 360, 44) + [[40, 200, 'a'], [120, 150, 'b'], [230, 110, 'c'], [300, 60, 'd']].map(([s, w, n], i) => D.box(s, 60 + i * 28, w, 22, i === 1 || i === 3 ? 'g thick' : '') + D.t(s + 6, 76 + i * 28, n, { size: 14 })).join('') + D.t(420, 80, 'Fit the most meetings:', {}) + D.t(420, 106, 'always take the one that', {}) + D.t(420, 132, 'ENDS soonest. It leaves', {}) + D.t(420, 158, 'the most room for the rest.', { cls: 'g' }), 190),
`<h2>How to test your greedy idea</h2><ol><li>Write the rule in one sentence.</li><li><b>Try to break it</b> with small examples on the pad. Spend real effort on this.</li><li>Can't break it? Try the swap argument.</li><li>Still unsure? DP is the safe fallback, if the limits allow.</li></ol>
<p>Hints that it could be greedy: sorting seems natural, and you only need one quantity, like how far you can reach right now.</p>`,
think('"Fit the most meetings": why not "shortest meeting first"? Try to break it.', 'A short meeting that sits across the boundary of two others: [1,5], [4,6], [5,10]. Shortest first takes [4,6], and blocks both others. Ending soonest takes [1,5] and [5,10].')
], core: [
{ id: 'jump-game', title: 'Can you reach the end?', diff: 'Medium', time: 12,
  desc: `<p>Each number is the most you can jump forward from that position. Starting at position 0, can you reach the last position?</p>`, ex: [['[2, 3, 1, 1, 4]', 'True'], ['[3, 2, 1, 0, 4]', 'False']], start: 'def can_reach(a):\n    ',
  nudge: ['If you can reach position 5, can you reach 3? What single number summarises what you can reach?'],
  sol: `def can_reach(a):\n    far = 0\n    for i, x in enumerate(a):\n        if i > far:\n            return False\n        far = max(far, i + x)\n    return True`, big: 'O(n)', idea: 'You only need to carry how far you can currently get.',
  tests: [['can_reach([2, 3, 1, 1, 4])', 'True'], ['can_reach([3, 2, 1, 0, 4])', 'False'], ['can_reach([0])', 'True'], ['can_reach([0, 1])', 'False'], ['can_reach([1, 0, 1])', 'False'], ['can_reach([2, 0, 0])', 'True']] },
{ id: 'most-meetings', title: 'Most meetings', diff: 'Medium', time: 12,
  desc: `<p>Given meetings <code>[start, end]</code>, return the largest number you can attend without any overlap. One ending exactly when another starts is fine.</p>`, ex: [['[[1, 5], [4, 6], [5, 10]]', '2']], start: 'def most(meetings):\n    ',
  nudge: ['Which single meeting would you be happiest to commit to first?'],
  sol: `def most(meetings):\n    count, free = 0, float("-inf")\n    for s, e in sorted(meetings, key=lambda m: m[1]):\n        if s >= free:\n            count += 1\n            free = e\n    return count`, big: 'O(n log n)', idea: 'Whatever ends soonest leaves the most room.',
  tests: [['most([[1, 5], [4, 6], [5, 10]])', '2'], ['most([])', '0'], ['most([[1, 2], [1, 2]])', '1'], ['most([[1, 100], [2, 3], [3, 4]])', '2'], ['most([[0, 1], [1, 2], [2, 3]])', '3']] }
], extra: ['fill-cups'], boss:
{ id: 'gas-station', title: 'Gas around the circle', diff: 'Medium', time: 18,
  desc: `<p>Stations in a circle. <code>gas[i]</code> is fuel available at i, and <code>cost[i]</code> is the fuel to reach the next. Starting empty, return the station index from which you can complete a full lap, or -1. There's at most one answer. It must be O(n).</p>`, ex: [['[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]', '3']], start: 'def start_station(gas, cost):\n    ', nudge: [],
  sol: `def start_station(gas, cost):\n    if sum(gas) < sum(cost):\n        return -1\n    start = tank = 0\n    for i in range(len(gas)):\n        tank += gas[i] - cost[i]\n        if tank < 0:\n            start = i + 1\n            tank = 0\n    return start`, big: 'O(n)', idea: 'If you ran out at i, no station between your start and i can work either. Skip them all.',
  tests: [['start_station([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])', '3'], ['start_station([2, 3, 4], [3, 4, 3])', '-1'], ['start_station([5], [4])', '0'], ['start_station([1], [2])', '-1'], ['start_station([3, 1, 1], [1, 2, 2])', '0'], ['start_station([1] * 200000 + [200001], [2] * 200000 + [1])', '200000']] }
});

unit({ id: 'dp-1d', phase: 3, title: 'Dynamic programming', mins: 13, read: [
`<p class="lede">DP has a scary name for a simple idea: <b>some problems can be built from answers to smaller versions of themselves, and those smaller answers repeat. So write them down.</b></p>`,
fig(D.tree(['f5', ['f4', ['f3', ['f2'], ['f1a']], ['f2b']], ['f3b', ['f2c'], ['f1b']]], { x: 200, y: 24, spread: 100, dy: 52, hl: { f3: 'r', f3b: 'r', f2: 'y', f2b: 'y', f2c: 'y' }, }) + D.flow({ t: [430, 40, 260, 110, 'The same answers keep\ngetting worked out.\nCompute each once:\nexponential becomes linear.', 'g'] }), 200),
`<h2>The recipe. Do this on the pad, in this order.</h2>
<ol><li><b>Write down what the state means, in one English sentence.</b> "<code>best[i]</code> is the most money I can have from the first i houses." This is the whole game. If this sentence is vague, nothing else will work.</li>
<li><b>Look at the last decision.</b> For the final item: what are all the possibilities?</li>
<li><b>Write how bigger answers come from smaller ones.</b> That's the recurrence.</li>
<li><b>Base cases:</b> what's the answer on nothing, or on one item?</li>
<li><b>What order?</b> Each answer needs to be ready before something depends on it.</li></ol>`,
steps((() => {
  const c = [3, 1, 4, 1, 5], best = [0, 3, 3, 7, 7, 12], f = [];
  c.forEach((v, i) => f.push({
    n: i === 0 ? 'Take a generic "pick numbers, never two neighbours" question. At each number the last decision is: take it, or skip it. With state "best using the first i numbers", take means this plus best[i−2], and skip means best[i−1].' : `Number ${v}: take it (${v} + ${best[Math.max(0, i - 1)]}) or skip it (${best[i]}). The best is ${best[i + 1]}. We only ever look back a little.`,
    d: D.cells(c, { x: 140, y: 16, hl: { [i]: 'y' } }) + D.cells(best.map((b, j) => j <= i + 1 ? b : ''), { x: 92, y: 90, hl: { [i + 1]: 'g' } }) + D.t(20, 118, 'best', { cls: 'soft' })
  }));
  return f;
})(), 150),
`<h2>Top-down or bottom-up</h2>
<table><tr><th>Top-down</th><th>Bottom-up</th></tr><tr><td>Recursion plus a memo. It's the natural way to write the idea, and it only solves what's needed.</td><td>A loop filling a table. No recursion limit, and it often lets you keep only the last few values.</td></tr></table>
<p>Start with whichever is easier to think about. In the recurrence above, you only need the last two values, so you can drop the table entirely.</p>
<h2>How to spot it</h2><p>The question says "how many ways", "the minimum", "the maximum", "is it possible". And choices made early affect what is possible later. You tried greedy and broke it.</p>`,
think('What if your state needs more to capture the situation, like "best so far, given that I am holding a stock"?', 'Then the state gets another part: two tables, or a pair of values, one for each situation. If a future decision depends on it, it needs to be in the state.')
], core: ['climbing-stairs', 'house-robber', 'coin-change'], extra: ['max-subarray', 'word-break'], boss: 'lis' });

unit({ id: 'dp-2d', phase: 3, title: 'DP on two dimensions', mins: 10, read: [
`<p class="lede">When the state needs two numbers, the table has two dimensions: two positions in two strings, or "first i items with capacity w". <b>You fill in a grid, and each cell only looks at its near neighbours.</b></p>`,
steps((() => {
  const a = 'ace', b = 'abcde';
  const T = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  const f = [], show = (n, r, c) => {
    const rows = [['', '', ...b]].concat(T.map((row, i) => [i ? a[i - 1] : '', ...row.map((v, j) => (i < r || (i === r && j <= c) || i === 0 || j === 0) ? v : '')]));
    const hl = { [`${r + 1},${c + 1}`]: 'y' };
    f.push({ n, d: D.grid(rows, { x: 150, y: 6, s: 34, hl }) });
  };
  show('Compare two strings: the longest sequence of letters they share, in order. Each cell is the answer using a prefix of each string. Row 0 and column 0 are the empty prefix, so all zeros.', 0, 0);
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    T[i][j] = a[i - 1] === b[j - 1] ? T[i - 1][j - 1] + 1 : Math.max(T[i - 1][j], T[i][j - 1]);
    if ((i === 1 && j === 1) || (i === 2 && j === 3) || (i === 3 && j === 5)) show(a[i - 1] === b[j - 1] ? `<code>${a[i - 1]}</code> matches, so take one more than the diagonal: both prefixes without this letter.` : `<code>${a[i - 1]}</code> and <code>${b[j - 1]}</code> differ, so one of them isn't used. Take the larger of the cell above and the cell to the left.`, i, j);
  }
  return f;
})(), 185),
`<h2>Reading a table</h2><p>On the pad, draw the arrows for one cell: which cells does it read from? That tells you the fill order. If each cell reads above and left, then a row-by-row loop works.</p>
<h2>Knapsack: the classic shape</h2><p>Items with a size and value, and a limited capacity. State: the best value from the first i items with capacity c. The last decision for item i is: take it, or don't. This take-or-skip pattern with a limit appears everywhere.</p>`,
fig(D.flow({ a: [20, 40, 170, 60, 'state: first i items,\ncapacity c'], b: [260, 8, 200, 54, 'skip: same capacity,\ni − 1 items', 'b'], c: [260, 78, 200, 54, 'take: capacity − size,\ni − 1 items, + value', 'g'], d: [540, 40, 150, 60, 'choose the\nbetter one', 'y'] }, [['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd']]), 145),
`<h2>Saving memory</h2><p>If a row only reads the previous row, you just need two rows, or one if you fill it carefully. Do that last, once the 2D version works.</p>`,
think('Filling one row for 0/1 knapsack, why might you have to go through capacities from high to low?', 'A cell reads a lower capacity from the previous row. Going high to low means you read values not yet overwritten, so each item is used at most once. Going low to high would use an item repeatedly.')
], core: [
{ id: 'unique-paths', title: 'Paths through a grid', diff: 'Medium', time: 10,
  desc: `<p>A robot starts in the top-left of a grid and moves only right or down. <code>"#"</code> cells are blocked. Return how many paths reach the bottom-right.</p>`, ex: [['["...", ".#.", "..."]', '2'], ['["#"]', '0']], start: 'def paths(grid):\n    ',
  nudge: ['Stand on one cell. How could you have arrived there?'],
  sol: `def paths(grid):\n    R, C = len(grid), len(grid[0])\n    w = [[0] * C for _ in range(R)]\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == "#":\n                continue\n            if r == 0 and c == 0:\n                w[r][c] = 1\n            else:\n                w[r][c] = (w[r - 1][c] if r else 0) + (w[r][c - 1] if c else 0)\n    return w[-1][-1]`, big: 'O(rows × cols)', idea: 'Ways to reach a cell = ways from above + ways from the left.',
  tests: [['paths(["...", ".#.", "..."])', '2'], ['paths(["#"])', '0'], ['paths(["."])', '1'], ['paths([".."])', '1'], ['paths([".#", "#."])', '0'], ['paths(["."*3]*3)', '6'], ['paths(["."*50]*12)', '342700125300']] },
{ id: 'lcs', title: 'Longest common subsequence', diff: 'Medium', time: 15,
  desc: `<p>Return the length of the longest sequence of characters found in both strings in the same order. They need not be next to each other.</p>`, ex: [['"abcde", "ace"', '3'], ['"abc", "xyz"', '0']], start: 'def lcs(a, b):\n    ',
  nudge: ['State in one sentence: what does cell (i, j) mean?', 'Compare the last letters of the two prefixes. What are the two cases?'],
  sol: `def lcs(a, b):\n    prev = [0] * (len(b) + 1)\n    for x in a:\n        cur = [0]\n        for j, y in enumerate(b):\n            cur.append(prev[j] + 1 if x == y else max(prev[j + 1], cur[j]))\n        prev = cur\n    return prev[-1]`, big: 'O(n × m)', idea: 'Match: diagonal plus one. No match: the better of dropping either letter.',
  tests: [['lcs("abcde", "ace")', '3'], ['lcs("abc", "xyz")', '0'], ['lcs("", "a")', '0'], ['lcs("aaa", "aa")', '2'], ['lcs("abcba", "bcab")', '3'], ['lcs("a" * 2000, "a" * 2000)', '2000']] },
{ id: 'knapsack', title: 'Knapsack', diff: 'Medium', time: 18,
  desc: `<p>Items have <code>sizes[i]</code> and <code>values[i]</code>. Each can be taken at most once. Return the greatest total value fitting in <code>cap</code>.</p>`, ex: [['[1, 3, 4], [15, 20, 30], 4', '35']], start: 'def knapsack(sizes, values, cap):\n    ',
  nudge: ['What two numbers describe the situation?', 'Write take-or-skip for the last item.'],
  sol: `def knapsack(sizes, values, cap):\n    best = [0] * (cap + 1)\n    for s, v in zip(sizes, values):\n        for c in range(cap, s - 1, -1):\n            best[c] = max(best[c], best[c - s] + v)\n    return best[cap]`, big: 'O(n × cap)', idea: 'Take or skip, for each item at each capacity. Going high to low uses each item once.',
  tests: [['knapsack([1, 3, 4], [15, 20, 30], 4)', '35'], ['knapsack([], [], 5)', '0'], ['knapsack([5], [10], 4)', '0'], ['knapsack([1, 1, 1], [1, 2, 3], 2)', '5'], ['knapsack([2, 3], [3, 4], 5)', '7'], ['knapsack([2], [10], 100)', '10']] }
], extra: [{
  id: 'longest-palin-subseq', title: 'Longest palindromic subsequence', diff: 'Medium', time: 18,
  desc: `<p>Return the length of the longest palindrome you can make by deleting letters from <code>s</code> without reordering. For example, "bbbab" has "bbbb".</p>`, ex: [['"bbbab"', '4'], ['"cbbd"', '2']], start: 'def lps(s):\n    ',
  nudge: ['Think about a stretch from i to j. What can the two end letters do?'],
  sol: `def lps(s):\n    n = len(s)\n    if n == 0:\n        return 0\n    d = [[0] * n for _ in range(n)]\n    for i in range(n - 1, -1, -1):\n        d[i][i] = 1\n        for j in range(i + 1, n):\n            d[i][j] = d[i + 1][j - 1] + 2 if s[i] == s[j] else max(d[i + 1][j], d[i][j - 1])\n    return d[0][n - 1]`, big: 'O(n²)', idea: 'State over a stretch i to j. Fill short stretches before long ones.',
  tests: [['lps("bbbab")', '4'], ['lps("cbbd")', '2'], ['lps("a")', '1'], ['lps("")', '0'], ['lps("abcba")', '5']] }, 'longest-palindrome'], boss:
{ id: 'edit-distance', title: 'Edit distance', diff: 'Hard', time: 25,
  desc: `<p>Return the fewest single-letter inserts, deletes or substitutions to turn <code>a</code> into <code>b</code>. Spell checkers and DNA comparison use this.</p>`, ex: [['"horse", "ros"', '3'], ['"", "abc"', '3']], start: 'def edit(a, b):\n    ', nudge: [],
  sol: `def edit(a, b):\n    prev = list(range(len(b) + 1))\n    for i, x in enumerate(a, 1):\n        cur = [i]\n        for j, y in enumerate(b, 1):\n            cur.append(prev[j - 1] if x == y else 1 + min(prev[j - 1], prev[j], cur[j - 1]))\n        prev = cur\n    return prev[-1]`, big: 'O(n × m)', idea: 'For the last letters: same, nothing to do. Otherwise, try all three edits.',
  tests: [['edit("horse", "ros")', '3'], ['edit("", "abc")', '3'], ['edit("abc", "")', '3'], ['edit("abc", "abc")', '0'], ['edit("intention", "execution")', '5'], ['edit("a", "b")', '1'], ['edit("kitten", "sitting")', '3']] }
});

unit({ id: 'bits-math', phase: 3, title: 'Bits and number tricks', mins: 7, read: [
`<p class="lede">Numbers are stored as rows of switches. Sometimes the neatest solution is flipping those switches directly.</p>`,
fig(D.cells([1, 0, 1, 1], { x: 40, y: 34 }) + D.t(280, 60, '= 8 + 2 + 1 = 11', { cls: 'r' }) + ['8', '4', '2', '1'].map((v, i) => D.t(64 + i * 48, 26, v, { a: 'middle', cls: 'soft' })).join(''), 95),
`<table><tr><th>Operator</th><th>Meaning</th><th>Use it for</th></tr>
<tr><td><code>a &amp; b</code></td><td>Both switches on</td><td>Testing or masking bits</td></tr>
<tr><td><code>a | b</code></td><td>Either on</td><td>Combining flags</td></tr>
<tr><td><code>a ^ b</code></td><td>Different</td><td>Flipping, finding the odd one out</td></tr>
<tr><td><code>a &lt;&lt; k</code></td><td>Shift left</td><td>Multiply by 2ᵏ, build a mask</td></tr>
<tr><td><code>a &gt;&gt; k</code></td><td>Shift right</td><td>Divide by 2ᵏ</td></tr></table>`,
`<h2>Three facts with surprising reach</h2><ul><li><b>XOR cancels:</b> <code>x ^ x = 0</code>, <code>x ^ 0 = x</code>, in any order.</li><li><b>A bit per item:</b> an n-bit integer can stand for any subset of n things, so <code>1 &lt;&lt; i</code> asks about item i.</li><li><b><code>n &amp; (n - 1)</code></b> turns off the lowest set bit. Work through an example on the pad to see why.</li></ul>
<h2>Modulo</h2><p>When answers get huge, problems ask for the result mod 10⁹ + 7. You can take mod after every step, since <code>(a + b) % m</code> and <code>(a × b) % m</code> work out the same whichever way you do it.</p>`,
fig(D.cells([1, 1, 0, 0], { x: 40, y: 12, h: 34 }) + D.t(250, 36, 'n = 12', { mono: 1 }) + D.cells([1, 0, 1, 1], { x: 40, y: 54, h: 34 }) + D.t(250, 78, 'n − 1 = 11', { mono: 1 }) + D.cells([1, 0, 0, 0], { x: 40, y: 96, h: 34, hl: { 1: 'g' } }) + D.t(250, 120, 'n & (n − 1) = 8', { mono: 1, cls: 'g' }), 140),
think('Every number appears twice, except one. How does XOR find it with no extra memory?', 'XOR everything. Pairs cancel to 0 regardless of order, and what remains is the single.')
], core: [
{ id: 'single-number', title: 'The odd one out', diff: 'Easy', time: 6,
  desc: `<p>Every value appears twice except one. Return that one, in O(n) time and O(1) extra memory.</p>`, ex: [['[4, 1, 2, 1, 2]', '4']], start: 'def single(a):\n    ',
  nudge: ['What operation cancels a value with itself?'],
  sol: `def single(a):\n    r = 0\n    for x in a:\n        r ^= x\n    return r`, big: 'O(n) time, O(1) space', idea: 'XOR cancels pairs.',
  tests: [['single([4, 1, 2, 1, 2])', '4'], ['single([1])', '1'], ['single([-3, 7, 7])', '-3'], ['single([0, 5, 5])', '0']] },
{ id: 'count-bits', title: 'Count the ones', diff: 'Easy', time: 7,
  desc: `<p>Return how many 1 bits a non-negative integer has, without strings or <code>bin</code>. The loop should only run once per 1 bit.</p>`, ex: [['11', '3'], ['0', '0']], start: 'def ones(n):\n    ',
  nudge: ['What does n & (n - 1) do? Try it on the pad with 12.'],
  sol: `def ones(n):\n    c = 0\n    while n:\n        n &= n - 1\n        c += 1\n    return c`, big: 'O(number of 1 bits)', idea: 'Each step switches off exactly one 1.',
  tests: [['ones(11)', '3'], ['ones(0)', '0'], ['ones(1)', '1'], ['ones(255)', '8'], ['ones(2**62)', '1']] }
], boss:
{ id: 'subset-masks', title: 'Best team under budget', diff: 'Medium', time: 16,
  desc: `<p>Choose any subset of up to 18 people. <code>costs[i]</code> and <code>skills[i]</code>. Return the most total skill with total cost at most <code>budget</code>. Loop through bitmasks, one integer per subset, rather than recursion.</p>`, ex: [['[2, 3, 4], [3, 4, 5], 5', '7']], start: 'def best_team(costs, skills, budget):\n    ', nudge: [],
  sol: `def best_team(costs, skills, budget):\n    n = len(costs)\n    best = 0\n    for m in range(1 << n):\n        c = s = 0\n        for i in range(n):\n            if m >> i & 1:\n                c += costs[i]\n                s += skills[i]\n        if c <= budget and s > best:\n            best = s\n    return best`, big: 'O(n × 2ⁿ)', idea: 'The integers 0 to 2ⁿ−1 list every subset.',
  tests: [['best_team([2, 3, 4], [3, 4, 5], 5)', '7'], ['best_team([], [], 5)', '0'], ['best_team([9], [9], 1)', '0'], ['best_team([1, 1], [1, 1], 2)', '2'], ['best_team([1] * 14, [2] * 14, 7)', '14']] }
});
