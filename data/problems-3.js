window.PROBLEMS = window.PROBLEMS || [];
PROBLEMS.push(
// ===================== MATRIX =====================
{
  id:'spiral-matrix', title:'Spiral Matrix', diff:'Medium', pattern:'matrix', time:22,
  desc:`<p>Return all elements of an <code>m × n</code> matrix in spiral order (clockwise, starting top-left).</p>`,
  examples:[{in:'matrix = [[1,2,3],[4,5,6],[7,8,9]]', out:'[1,2,3,6,9,8,7,4,5]'}],
  constraints:['1 ≤ m, n ≤ 10'],
  fn:{py:'spiral_order', js:'spiralOrder'}, params:['matrix'],
  logic:[
    {q:'Keep 4 boundaries: top, bottom, left, right. After walking the top row left→right…', opts:['top += 1','left += 1','bottom −= 1'], a:0, why:'That row is consumed, so shrink the boundary.'},
    {q:'Order of the four walks each lap?', opts:['top row →, right col ↓, bottom row ←, left col ↑','top, bottom, left, right'], a:0, why:'Clockwise.'},
    {q:'Why re-check top <= bottom before walking the bottom row (and left <= right before the left column)?', opts:['For non-square matrices (single remaining row/col) to avoid double counting','Not needed'], a:0, why:'Example: [[1,2,3]]. Without the check, you would walk the same row back.'}
  ],
  hints:['Four boundaries that shrink inward.','Walk top row, right column, bottom row (reverse), left column (reverse).','Guard the last two walks with boundary checks.'],
  sol:{
py:`def spiral_order(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        ⟦top += 1⟧
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        ⟦right -= 1⟧
        if ⟦top <= bottom⟧:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if ⟦left <= right⟧:
            for r in range(bottom, top - 1, -1):
                res.append(⟦matrix[r][left]⟧)
            left += 1
    return res`,
js:`function spiralOrder(matrix) {
  const res = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) res.push(matrix[top][c]);
    ⟦top++⟧;
    for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);
    ⟦right--⟧;
    if (⟦top <= bottom⟧) {
      for (let c = right; c >= left; c--) res.push(matrix[bottom][c]);
      bottom--;
    }
    if (⟦left <= right⟧) {
      for (let r = bottom; r >= top; r--) res.push(⟦matrix[r][left]⟧);
      left++;
    }
  }
  return res;
}`},
  complexity:'O(m·n) time, O(1) extra',
  takeaway:'Boundary-shrinking simulation; guard against single row/column leftovers.',
  tests:[[[[[1,2,3],[4,5,6],[7,8,9]]],[1,2,3,6,9,8,7,4,5]],[[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]],[1,2,3,4,8,12,11,10,9,5,6,7]],[[[[1,2,3]]],[1,2,3]],[[[[1],[2],[3]]],[1,2,3]],[[[[7]]],[7]]]
},
{
  id:'rotate-image', title:'Rotate Image', diff:'Medium', pattern:'matrix', time:18,
  desc:`<p>Rotate an <code>n × n</code> matrix 90° clockwise <b>in place</b>, then return it (returning is just for testing).</p>`,
  examples:[{in:'matrix = [[1,2,3],[4,5,6],[7,8,9]]', out:'[[7,4,1],[8,5,2],[9,6,3]]'}],
  constraints:['1 ≤ n ≤ 20'],
  fn:{py:'rotate', js:'rotate'}, params:['matrix'],
  logic:[
    {q:'Where does element (r, c) go after a clockwise rotation?', opts:['(c, n−1−r)','(n−1−c, r)','(c, r)'], a:0, why:'Row 0 becomes the last column.'},
    {q:'In-place trick: rotate = ?', opts:['transpose, then reverse each row','reverse each row, then sort','transpose twice'], a:0, why:'Transpose (r,c)→(c,r), then the row reverse (c,r)→(c,n−1−r). ✓'},
    {q:'When transposing in place, loop c from…', opts:['0','r + 1 (upper triangle only)'], a:1, why:'Looping the full matrix swaps every pair twice, which undoes the transpose.'}
  ],
  hints:['Two simple operations combine into a rotation.','Transpose: swap m[r][c] with m[c][r] for c > r.','Reverse every row.'],
  sol:{
py:`def rotate(matrix):
    n = len(matrix)
    for r in range(n):
        for c in range(⟦r + 1⟧, n):
            matrix[r][c], matrix[c][r] = ⟦matrix[c][r], matrix[r][c]⟧
    for row in matrix:
        ⟦row.reverse()⟧
    return matrix`,
js:`function rotate(matrix) {
  const n = matrix.length;
  for (let r = 0; r < n; r++)
    for (let c = ⟦r + 1⟧; c < n; c++)
      [matrix[r][c], matrix[c][r]] = ⟦[matrix[c][r], matrix[r][c]]⟧;
  for (const row of matrix) ⟦row.reverse()⟧;
  return matrix;
}`},
  complexity:'O(n²) time, O(1) space',
  takeaway:'Geometric transforms decompose: rotate = transpose + reflect.',
  tests:[[[[[1,2,3],[4,5,6],[7,8,9]]],[[7,4,1],[8,5,2],[9,6,3]]],[[[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]],[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]],[[[[1]]],[[1]]],[[[[1,2],[3,4]]],[[3,1],[4,2]]]]
},
// ===================== DP =====================
{
  id:'climbing-stairs', title:'Climbing Stairs', diff:'Easy', pattern:'dp', time:10,
  desc:`<p>You climb a staircase of <code>n</code> steps, taking 1 or 2 steps at a time. In how many distinct ways can you reach the top?</p>`,
  examples:[{in:'n = 2', out:'2'},{in:'n = 3', out:'3', why:'1+1+1, 1+2, 2+1'}],
  constraints:['1 ≤ n ≤ 45'],
  fn:{py:'climb_stairs', js:'climbStairs'}, params:['n'],
  logic:[
    {q:'To stand on step n, your LAST move came from…', opts:['step n−1 or step n−2','step 0','step n−3'], a:0, why:'So ways(n) = ways(n−1) + ways(n−2).'},
    {q:'Plain recursion without memo for n=45 is…', opts:['fast','exponential, far too slow'], a:1, why:'It recomputes the same values. Store them (DP) or keep 2 variables.'},
    {q:'Base cases?', opts:['ways(1)=1, ways(2)=2','ways(0)=0, ways(1)=0'], a:0, why:'Or ways(0)=1, ways(1)=1.'}
  ],
  hints:['Think about the final step.','It is Fibonacci.','Keep two variables and roll forward.'],
  sol:{
py:`def climb_stairs(n):
    a, b = 1, 1        # ways(0), ways(1)
    for _ in range(⟦n - 1⟧):
        a, b = ⟦b, a + b⟧
    return ⟦b⟧`,
js:`function climbStairs(n) {
  let a = 1, b = 1;  // ways(0), ways(1)
  for (let i = 0; i < ⟦n - 1⟧; i++) [a, b] = ⟦[b, a + b]⟧;
  return ⟦b⟧;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Count ways = sum over the possible last moves.',
  tests:[[[1],1],[[2],2],[[3],3],[[5],8],[[10],89],[[45],1836311903]]
},
{
  id:'max-subarray', title:'Maximum Subarray (Kadane)', diff:'Medium', pattern:'dp', time:15,
  desc:`<p>Find the contiguous subarray (at least one element) with the largest sum and return the sum.</p>`,
  examples:[{in:'nums = [-2,1,-3,4,-1,2,1,-5,4]', out:'6', why:'[4,-1,2,1]'},{in:'nums = [-3,-1,-2]', out:'-1'}],
  constraints:['1 ≤ n ≤ 10⁵'],
  fn:{py:'max_sub_array', js:'maxSubArray'}, params:['nums'],
  logic:[
    {q:'Let cur = best sum of a subarray ENDING at i. Options at i?', opts:['extend: cur + nums[i], or start fresh: nums[i]','always extend','always restart'], a:0, why:'cur = max(nums[i], cur + nums[i]). A negative running sum is dead weight.'},
    {q:'Initialise best with…', opts:['0','nums[0] (or −infinity)'], a:1, why:'If every number is negative, 0 would be wrong. The answer must contain at least one element.'}
  ],
  hints:['Track the best sum ending at the current index.','Drop the past when it is negative.','Track the global best separately.'],
  sol:{
py:`def max_sub_array(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = ⟦max(x, cur + x)⟧
        best = ⟦max(best, cur)⟧
    return best`,
js:`function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = ⟦Math.max(nums[i], cur + nums[i])⟧;
    best = ⟦Math.max(best, cur)⟧;
  }
  return best;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'DP state "best ending here" + global max.',
  tests:[[[[-2,1,-3,4,-1,2,1,-5,4]],6],[[[1]],1],[[[5,4,-1,7,8]],23],[[[-3,-1,-2]],-1],[[[-2,-1]],-1],[[[2,-1,2,-1,2]],4]]
},
{
  id:'house-robber', title:'House Robber', diff:'Medium', pattern:'dp', time:15,
  desc:`<p><code>nums[i]</code> is the money in house i. You cannot rob two <b>adjacent</b> houses. Return the maximum you can rob.</p>`,
  examples:[{in:'nums = [1,2,3,1]', out:'4', why:'1 + 3'},{in:'nums = [2,7,9,3,1]', out:'12', why:'2 + 9 + 1'}],
  constraints:['1 ≤ n ≤ 100'],
  fn:{py:'rob', js:'rob'}, params:['nums'],
  logic:[
    {q:'dp[i] = max money from houses 0..i. At house i you either…', opts:['rob it: nums[i] + dp[i−2], or skip it: dp[i−1]','always rob','rob it: nums[i] + dp[i−1]'], a:0, why:'Robbing i forbids i−1.'},
    {q:'Greedy "take every other house" works?', opts:['Yes','No: [2,1,1,2] → best is 4 (houses 0 and 3)'], a:1, why:'This counterexample shows why DP is needed.'}
  ],
  hints:['Decide per house: rob or skip.','dp[i] = max(dp[i−1], dp[i−2] + nums[i]).','Only the last two values matter.'],
  sol:{
py:`def rob(nums):
    prev2, prev1 = 0, 0
    for x in nums:
        prev2, prev1 = ⟦prev1, max(prev1, prev2 + x)⟧
    return ⟦prev1⟧`,
js:`function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) [prev2, prev1] = ⟦[prev1, Math.max(prev1, prev2 + x)]⟧;
  return ⟦prev1⟧;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'"Pick items, no two adjacent" → take/skip DP.',
  tests:[[[[1,2,3,1]],4],[[[2,7,9,3,1]],12],[[[2,1,1,2]],4],[[[5]],5],[[[1,3]],3],[[[6,3,10,8,2,10,3,5,10,5,3]],39]]
},
{
  id:'coin-change', title:'Coin Change', diff:'Medium', pattern:'dp', time:22,
  desc:`<p>Given coin denominations <code>coins</code> (unlimited supply) and an <code>amount</code>, return the fewest coins needed to make the amount, or -1 if impossible.</p>`,
  examples:[{in:'coins = [1,2,5], amount = 11', out:'3', why:'5+5+1'},{in:'coins = [2], amount = 3', out:'-1'}],
  constraints:['1 ≤ coins.length ≤ 12','0 ≤ amount ≤ 10⁴'],
  fn:{py:'coin_change', js:'coinChange'}, params:['coins','amount'],
  logic:[
    {q:'Greedy (always take the biggest coin) for coins [1,3,4], amount 6?', opts:['4+1+1 = 3 coins (optimal)','Fails: 3+3 = 2 coins is better'], a:1, why:'Greedy fails for arbitrary coins, so we need DP.'},
    {q:'dp[a] = fewest coins for amount a. Transition?', opts:['dp[a] = min over coins c ≤ a of dp[a − c] + 1','dp[a] = dp[a−1] + 1','dp[a] = a // max(coins)'], a:0, why:'Try each coin as the last one used.'},
    {q:'Initial values?', opts:['dp[0] = 0, others = infinity','all 0','dp[0] = 1'], a:0, why:'Infinity means "unreachable". If dp[amount] is still infinity at the end, return −1.'}
  ],
  hints:['Build answers for every amount from 0 up to amount.','For each amount, try every coin as the last one.','Use infinity for impossible amounts.'],
  sol:{
py:`def coin_change(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if ⟦c <= a⟧:
                dp[a] = ⟦min(dp[a], dp[a - c] + 1)⟧
    return ⟦-1 if dp[amount] == INF else dp[amount]¦dp[amount] if dp[amount] != INF else -1⟧`,
js:`function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = ⟦0⟧;
  for (let a = 1; a <= amount; a++)
    for (const c of coins)
      if (⟦c <= a⟧) dp[a] = ⟦Math.min(dp[a], dp[a - c] + 1)⟧;
  return ⟦dp[amount] === Infinity ? -1 : dp[amount]⟧;
}`},
  complexity:'O(amount × coins) time, O(amount) space',
  takeaway:'Min-cost to reach a total with reusable items → 1D DP over the total.',
  tests:[[[[1,2,5],11],3],[[[2],3],-1],[[[1],0],0],[[[1,3,4],6],2],[[[186,419,83,408],6249],20],[[[2,5,10,1],27],4]]
},
{
  id:'lis', title:'Longest Increasing Subsequence', diff:'Medium', pattern:'dp', time:25,
  desc:`<p>Return the length of the longest <b>strictly increasing subsequence</b> (not necessarily contiguous).</p>`,
  examples:[{in:'nums = [10,9,2,5,3,7,101,18]', out:'4', why:'[2,3,7,101]'},{in:'nums = [7,7,7,7]', out:'1'}],
  constraints:['1 ≤ n ≤ 2500'],
  fn:{py:'length_of_lis', js:'lengthOfLIS'}, params:['nums'],
  logic:[
    {q:'dp[i] = length of LIS ENDING at index i. Transition?', opts:['dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i]','dp[i] = dp[i−1] + 1'], a:0, why:'Extend the best earlier sequence that ends with a smaller value.'},
    {q:'Answer?', opts:['dp[n−1]','max(dp)'], a:1, why:'The LIS can end anywhere.'},
    {q:'Complexity of this DP, and is it OK for n=2500?', opts:['O(n²) ≈ 6·10⁶, fine','O(2ⁿ), too slow'], a:0, why:'An O(n log n) version exists (patience sorting with binary search). Know it exists for follow-ups.'}
  ],
  hints:['Every element alone is an increasing subsequence of length 1.','For each i, look back at all j < i with a smaller value.','Return the max of dp.'],
  sol:{
py:`def length_of_lis(nums):
    n = len(nums)
    dp = [1] * n
    for i in range(n):
        for j in range(⟦i⟧):
            if ⟦nums[j] < nums[i]⟧:
                dp[i] = ⟦max(dp[i], dp[j] + 1)⟧
    return ⟦max(dp)⟧`,
js:`function lengthOfLIS(nums) {
  const n = nums.length, dp = new Array(n).fill(1);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < ⟦i⟧; j++)
      if (⟦nums[j] < nums[i]⟧) dp[i] = ⟦Math.max(dp[i], dp[j] + 1)⟧;
  return ⟦Math.max(...dp)⟧;
}`},
  complexity:'O(n²) time, O(n) space',
  takeaway:'Subsequence DP: "best ending at i" looking back over all j < i.',
  tests:[[[[10,9,2,5,3,7,101,18]],4],[[[0,1,0,3,2,3]],4],[[[7,7,7,7]],1],[[[5]],1],[[[1,2,3,4,5]],5],[[[5,4,3,2,1]],1]]
},
{
  id:'word-break', title:'Word Break', diff:'Medium', pattern:'dp', time:25,
  desc:`<p>Return <code>true</code> if <code>s</code> can be segmented into a sequence of one or more words from <code>wordDict</code> (words may be reused).</p>`,
  examples:[{in:'s = "leetcode", wordDict = ["leet","code"]', out:'true'},{in:'s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', out:'false'}],
  constraints:['1 ≤ len(s) ≤ 300','≤ 1000 words, each ≤ 20 chars'],
  fn:{py:'word_break', js:'wordBreak'}, params:['s','wordDict'],
  logic:[
    {q:'dp[i] = can the PREFIX s[0:i] be segmented? dp[0] = ?', opts:['True (empty prefix)','False'], a:0, why:'This is the base case that lets the first word match.'},
    {q:'dp[i] is True if there exists j < i with…', opts:['dp[j] True AND s[j:i] in the dictionary','s[j:i] in the dictionary only'], a:0, why:'The prefix up to j is segmentable and the last piece is a word.'},
    {q:'Why convert wordDict to a set?', opts:['O(1) lookup instead of O(words)','Remove duplicates only'], a:0, why:'Lookups happen n² times.'}
  ],
  hints:['Boolean dp over prefix lengths.','dp[i] = any(dp[j] and s[j:i] in words).','Return dp[len(s)].'],
  sol:{
py:`def word_break(s, wordDict):
    words = set(wordDict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = ⟦True⟧
    for i in range(1, n + 1):
        for j in range(i):
            if ⟦dp[j] and s[j:i] in words⟧:
                dp[i] = True
                break
    return ⟦dp[n]⟧`,
js:`function wordBreak(s, wordDict) {
  const words = new Set(wordDict), n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = ⟦true⟧;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (⟦dp[j] && words.has(s.slice(j, i))⟧) { dp[i] = true; break; }
    }
  }
  return ⟦dp[n]⟧;
}`},
  complexity:'O(n² · L) time (slicing), O(n) space',
  takeaway:'String segmentation → boolean DP over prefixes.',
  tests:[[["leetcode",["leet","code"]],true],[["applepenapple",["apple","pen"]],true],[["catsandog",["cats","dog","sand","and","cat"]],false],[["a",["b"]],false],[["aaaaaaa",["aaa","aaaa"]],true],[["cars",["car","ca","rs"]],true]]
},
// ===================== GRAPH =====================
{
  id:'num-islands', title:'Number of Islands', diff:'Medium', pattern:'graph', time:20,
  desc:`<p>Given a grid of <code>"1"</code> (land) and <code>"0"</code> (water), count the islands. An island is land connected horizontally or vertically.</p>`,
  examples:[{in:'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', out:'2'}],
  constraints:['1 ≤ m, n ≤ 300'],
  fn:{py:'num_islands', js:'numIslands'}, params:['grid'],
  logic:[
    {q:'Scan every cell. When we find unvisited land…', opts:['count += 1 and flood-fill (DFS/BFS) the whole island to mark it visited','count += 1 only','check its 4 neighbours only'], a:0, why:'The flood fill guarantees each island is counted once.'},
    {q:'Simplest way to mark visited?', opts:['Overwrite the cell with "0"','A separate visited matrix','Both work'], a:2, why:'Overwriting is O(1) extra space but mutates the input. Mention that trade-off to the interviewer.'},
    {q:'Total complexity?', opts:['O(m·n)','O((m·n)²)'], a:0, why:'Each cell is visited a constant number of times.'}
  ],
  hints:['Loop over all cells.','On "1": count it, then sink the whole island.','DFS to 4 neighbours, stopping at bounds and water.'],
  sol:{
py:`def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or ⟦grid[r][c] != '1'⟧:
            return
        grid[r][c] = ⟦'0'⟧
        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); ⟦sink(r, c - 1)⟧
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                ⟦count += 1⟧
                sink(r, c)
    return count`,
js:`function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || ⟦grid[r][c] !== '1'⟧) return;
    grid[r][c] = ⟦'0'⟧;
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); ⟦sink(r, c - 1)⟧;
  };
  let count = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === '1') { ⟦count++⟧; sink(r, c); }
  return count;
}`},
  complexity:'O(m·n) time, O(m·n) recursion worst case',
  takeaway:'Count connected components = loop + flood fill.',
  tests:[[[[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]],1],[[[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]],3],[[[["0"]]],0],[[[["1","0","1"],["0","1","0"],["1","0","1"]]],5]]
},
{
  id:'rotting-oranges', title:'Rotting Oranges', diff:'Medium', pattern:'graph', time:25,
  desc:`<p>Grid cells: 0 empty, 1 fresh orange, 2 rotten. Every minute, fresh oranges adjacent (4-dir) to a rotten one become rotten. Return the minutes until no fresh orange remains, or -1 if that is impossible.</p>`,
  examples:[{in:'grid = [[2,1,1],[1,1,0],[0,1,1]]', out:'4'},{in:'grid = [[2,1,1],[0,1,1],[1,0,1]]', out:'-1'}],
  constraints:['1 ≤ m, n ≤ 10'],
  fn:{py:'oranges_rotting', js:'orangesRotting'}, params:['grid'],
  logic:[
    {q:'Rot spreads one layer per minute from ALL rotten oranges at once. Which algorithm?', opts:['Multi-source BFS (start queue with all rotten)','DFS from one orange','Sorting'], a:0, why:'BFS layers are exactly the minutes.'},
    {q:'How do we detect −1?', opts:['Count fresh oranges up front; if any remain after BFS → −1','If the queue is empty'], a:0, why:'An isolated fresh orange never rots.'},
    {q:'Grid with no fresh oranges at all →', opts:['0','−1'], a:0, why:'This edge case is commonly missed.'}
  ],
  hints:['Queue all rotten cells; count the fresh ones.','Process the BFS level by level; each level is 1 minute.','Rot neighbours, decrement fresh; at the end return minutes if fresh == 0, else −1.'],
  sol:{
py:`from collections import deque
def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q and ⟦fresh > 0⟧:
        for _ in range(⟦len(q)⟧):           # one BFS layer = one minute
            r, c = q.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and ⟦grid[nr][nc] == 1⟧:
                    grid[nr][nc] = 2
                    fresh -= 1
                    ⟦q.append((nr, nc))⟧
        minutes += 1
    return ⟦minutes if fresh == 0 else -1⟧`,
js:`function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let q = [], fresh = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) q.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  let minutes = 0;
  while (q.length && ⟦fresh > 0⟧) {
    const next = [];                      // next BFS layer
    for (const [r, c] of q) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && ⟦grid[nr][nc] === 1⟧) {
          grid[nr][nc] = 2;
          fresh--;
          ⟦next.push([nr, nc])⟧;
        }
      }
    }
    q = next;
    minutes++;
  }
  return ⟦fresh === 0 ? minutes : -1⟧;
}`},
  complexity:'O(m·n) time and space',
  takeaway:'Simultaneous spreading / min steps → multi-source BFS by layers.',
  tests:[[[[[2,1,1],[1,1,0],[0,1,1]]],4],[[[[2,1,1],[0,1,1],[1,0,1]]],-1],[[[[0,2]]],0],[[[[0]]],0],[[[[1]]],-1],[[[[2,1,1],[1,1,1],[0,1,2]]],2]]
},
// ===================== BACKTRACKING =====================
{
  id:'subsets', title:'Subsets', diff:'Medium', pattern:'backtracking', time:18,
  desc:`<p>Given an array of <b>unique</b> integers, return all possible subsets (the power set), in any order.</p>`,
  examples:[{in:'nums = [1,2,3]', out:'[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]'}],
  constraints:['1 ≤ n ≤ 10'],
  fn:{py:'subsets', js:'subsets'}, params:['nums'], compare:'sorted',
  logic:[
    {q:'For each element there are exactly 2 choices. Total subsets?', opts:['2ⁿ','n²','n!'], a:0, why:'n ≤ 10 gives 1024 subsets. Small inputs are a hint for backtracking.'},
    {q:'At the leaf of recursion (i == n) we must append…', opts:['path','a COPY of path'], a:1, why:'path keeps changing. Without a copy, all entries end up as the same list.'},
    {q:'Iterative alternative?', opts:['Start with [[]]; for each x, add x to a copy of every existing subset','Impossible'], a:0, why:'This is also O(n·2ⁿ) and is a neat one-pass trick.'}
  ],
  hints:['Recursive function bt(i).','Include nums[i] → recurse → remove it → recurse without it.','Base case: append a copy of the path.'],
  sol:{
py:`def subsets(nums):
    res, path = [], []
    def bt(i):
        if i == len(nums):
            res.append(⟦path[:]¦list(path)¦path.copy()⟧)
            return
        path.append(nums[i])
        ⟦bt(i + 1)⟧
        ⟦path.pop()⟧
        bt(i + 1)
    bt(0)
    return res`,
js:`function subsets(nums) {
  const res = [], path = [];
  function bt(i) {
    if (i === nums.length) { res.push(⟦[...path]¦path.slice()⟧); return; }
    path.push(nums[i]);
    ⟦bt(i + 1)⟧;
    ⟦path.pop()⟧;
    bt(i + 1);
  }
  bt(0);
  return res;
}`},
  complexity:'O(n · 2ⁿ) time and output',
  takeaway:'Choose → explore → un-choose. Copy the path when saving it.',
  tests:[[[[1,2,3]],[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]],[[[0]],[[],[0]]],[[[5,9]],[[],[5],[9],[5,9]]]]
},
{
  id:'combination-sum', title:'Combination Sum', diff:'Medium', pattern:'backtracking', time:25,
  desc:`<p>Given distinct positive <code>candidates</code> and a <code>target</code>, return all unique combinations summing to target. A number may be used unlimited times. Combinations are unique as multisets ([2,2,3] and [2,3,2] are the same).</p>`,
  examples:[{in:'candidates = [2,3,6,7], target = 7', out:'[[2,2,3],[7]]'},{in:'candidates = [2,3,5], target = 8', out:'[[2,2,2,2],[2,3,3],[3,5]]'}],
  constraints:['1 ≤ candidates.length ≤ 30','1 ≤ target ≤ 40'],
  fn:{py:'combination_sum', js:'combinationSum'}, params:['candidates','target'], compare:'sorted',
  logic:[
    {q:'How do we avoid producing both [2,3,2] and [2,2,3]?', opts:['Only pick candidates at index ≥ the last picked index (non-decreasing order)','Sort results and dedupe at the end'], a:0, why:'Passing a start index prevents permutations of the same multiset.'},
    {q:'Since reuse is allowed, after picking candidates[i] we recurse with start = ?', opts:['i','i + 1'], a:0, why:'Use i (we can pick it again). Combination Sum II (no reuse) would use i + 1.'},
    {q:'When to stop a branch early?', opts:['remaining < 0','never'], a:0, why:'Pruning. All numbers are positive, so overshooting can never come back.'}
  ],
  hints:['bt(start, remaining).','remaining == 0 → save a copy; remaining < 0 → return.','Loop i from start: choose candidates[i], bt(i, remaining − c), un-choose.'],
  sol:{
py:`def combination_sum(candidates, target):
    res, path = [], []
    def bt(start, remaining):
        if remaining == 0:
            res.append(path[:])
            return
        if ⟦remaining < 0⟧:
            return
        for i in range(⟦start⟧, len(candidates)):
            path.append(candidates[i])
            bt(⟦i⟧, remaining - candidates[i])
            ⟦path.pop()⟧
    bt(0, target)
    return res`,
js:`function combinationSum(candidates, target) {
  const res = [], path = [];
  function bt(start, remaining) {
    if (remaining === 0) { res.push([...path]); return; }
    if (⟦remaining < 0⟧) return;
    for (let i = ⟦start⟧; i < candidates.length; i++) {
      path.push(candidates[i]);
      bt(⟦i⟧, remaining - candidates[i]);
      ⟦path.pop()⟧;
    }
  }
  bt(0, target);
  return res;
}`},
  complexity:'Exponential (bounded by target/min(c) depth), fine for target ≤ 40',
  takeaway:'Combinations without duplicates → recurse with a start index.',
  tests:[[[[2,3,6,7],7],[[2,2,3],[7]]],[[[2,3,5],8],[[2,2,2,2],[2,3,3],[3,5]]],[[[2],1],[]],[[[1],2],[[1,1]]],[[[7,3,2],18],[[2,2,2,2,2,2,2,2,2],[2,2,2,2,2,2,3,3],[2,2,2,2,3,7],[2,2,2,3,3,3,3],[2,2,7,7],[2,3,3,3,7],[3,3,3,3,3,3]]]]
}
);
