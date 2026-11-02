window.PROBLEMS = window.PROBLEMS || [];
PROBLEMS.push(
// ===================== STACK =====================
{
  id:'valid-parentheses', title:'Valid Parentheses', diff:'Easy', pattern:'stack', time:10,
  desc:`<p>Given a string of <code>()[]{}</code>, return <code>true</code> if every opening bracket is closed by the same type in the correct order.</p>`,
  examples:[{in:'s = "()[]{}"', out:'true'},{in:'s = "(]"', out:'false'},{in:'s = "([)]"', out:'false'}],
  constraints:['1 ≤ len ≤ 10⁴'],
  fn:{py:'is_valid', js:'isValid'}, params:['s'],
  logic:[
    {q:'When we see a closing bracket, which opening bracket must it match?', opts:['The first one in the string','The most recent unmatched opening bracket','Any of the same type'], a:1, why:'"Most recent" means LIFO, so use a stack.'},
    {q:'Which inputs must return false? (pick the most complete)', opts:['Closing bracket with empty stack','Leftover openings at the end','Both'], a:2, why:'"]" alone (empty stack) and "((" (leftovers) are both invalid.'}
  ],
  hints:['Push opening brackets.','On a closing bracket, the top of the stack must be its partner.','At the end the stack must be empty.'],
  sol:{
py:`def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if ⟦not stack⟧ or ⟦stack.pop()⟧ != pairs[ch]:
                return False
        else:
            ⟦stack.append(ch)⟧
    return ⟦not stack¦len(stack) == 0⟧`,
js:`function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (⟦stack.length === 0⟧ || ⟦stack.pop()⟧ !== pairs[ch]) return false;
    } else ⟦stack.push(ch)⟧;
  }
  return ⟦stack.length === 0⟧;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Nested matching → stack.',
  tests:[[["()"],true],[["()[]{}"],true],[["(]"],false],[["([)]"],false],[["{[]}"],true],[["]"],false],[["(("],false]]
},
{
  id:'daily-temperatures', title:'Daily Temperatures', diff:'Medium', pattern:'stack', time:20,
  desc:`<p>Given <code>temperatures</code>, return <code>answer</code> where <code>answer[i]</code> is the number of days you must wait after day i for a warmer temperature, or 0 if none.</p>`,
  examples:[{in:'temperatures = [73,74,75,71,69,72,76,73]', out:'[1,1,4,2,1,1,0,0]'}],
  constraints:['1 ≤ n ≤ 10⁵'],
  fn:{py:'daily_temperatures', js:'dailyTemperatures'}, params:['temperatures'],
  logic:[
    {q:'This is "next greater element" in disguise. Brute force cost?', opts:['O(n)','O(n²)'], a:1, why:'Scanning right for every i is too slow for 10⁵.'},
    {q:'Keep a stack of indices still WAITING for a warmer day. Its temperatures are…', opts:['increasing from bottom to top','decreasing (non-increasing) from bottom to top'], a:1, why:'If a warmer day arrived, it would already have popped the colder ones.'},
    {q:'At day i, while temp[i] > temp[stack top]:', opts:['answer[top] = i − top; pop','push i','answer[i] = top'], a:0, why:'Day i is the first warmer day for that index. Then push i.'}
  ],
  hints:['Days that have not found a warmer day yet wait on a stack.','A new day "resolves" every colder waiting day on top.','Store indices so you can compute the distance.'],
  sol:{
py:`def daily_temperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []  # indices, temps decreasing
    for i, t in enumerate(temperatures):
        while stack and ⟦temperatures[stack[-1]] < t⟧:
            j = ⟦stack.pop()⟧
            answer[j] = ⟦i - j⟧
        ⟦stack.append(i)⟧
    return answer`,
js:`function dailyTemperatures(temperatures) {
  const answer = new Array(temperatures.length).fill(0);
  const stack = []; // indices, temps decreasing
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && ⟦temperatures[stack[stack.length - 1]] < temperatures[i]⟧) {
      const j = ⟦stack.pop()⟧;
      answer[j] = ⟦i - j⟧;
    }
    ⟦stack.push(i)⟧;
  }
  return answer;
}`},
  complexity:'O(n) time (each index pushed/popped once), O(n) space',
  takeaway:'"Next greater/smaller" → monotonic stack of indices.',
  tests:[[[[73,74,75,71,69,72,76,73]],[1,1,4,2,1,1,0,0]],[[[30,40,50,60]],[1,1,1,0]],[[[30,60,90]],[1,1,0]],[[[90,80,70]],[0,0,0]],[[[50]],[0]],[[[55,38,53,81,61,93,97,32,43,78]],[3,1,1,2,1,1,0,1,1,0]]]
},
{
  id:'eval-rpn', title:'Evaluate Reverse Polish Notation', diff:'Medium', pattern:'stack', time:15,
  desc:`<p>Evaluate an arithmetic expression in Reverse Polish Notation given as an array of tokens (<code>+ - * /</code> and integers). Division <b>truncates toward zero</b>.</p>`,
  examples:[{in:'tokens = ["2","1","+","3","*"]', out:'9', why:'(2+1)*3'},{in:'tokens = ["4","13","5","/","+"]', out:'6'}],
  constraints:['valid expression','1 ≤ n ≤ 10⁴'],
  fn:{py:'eval_rpn', js:'evalRPN'}, params:['tokens'],
  logic:[
    {q:'On an operator, which operands do we use?', opts:['The two most recent numbers (stack pops)','The first two numbers'], a:0, why:'Use a stack.'},
    {q:'Order matters for − and /. If we pop b then a, the result is…', opts:['a op b','b op a'], a:0, why:'The first pop is the RIGHT operand.'},
    {q:'Python: -7 // 2 = -4, but we need truncation toward zero (-3). Use…', opts:['int(a / b)','a // b','round(a / b)'], a:0, why:'int() truncates toward zero. In JS use Math.trunc(a / b).'}
  ],
  hints:['Numbers go on a stack.','Operator: pop b, pop a, push a op b.','Careful with division truncation.'],
  sol:{
py:`def eval_rpn(tokens):
    stack = []
    for tok in tokens:
        if tok in '+-*/' and len(tok) == 1:
            b = ⟦stack.pop()⟧
            a = stack.pop()
            if tok == '+': stack.append(a + b)
            elif tok == '-': stack.append(⟦a - b⟧)
            elif tok == '*': stack.append(a * b)
            else: stack.append(⟦int(a / b)⟧)
        else:
            stack.append(⟦int(tok)⟧)
    return stack[-1]`,
js:`function evalRPN(tokens) {
  const stack = [];
  for (const tok of tokens) {
    if (['+', '-', '*', '/'].includes(tok)) {
      const b = ⟦stack.pop()⟧, a = stack.pop();
      if (tok === '+') stack.push(a + b);
      else if (tok === '-') stack.push(⟦a - b⟧);
      else if (tok === '*') stack.push(a * b);
      else stack.push(⟦Math.trunc(a / b)⟧);
    } else stack.push(⟦Number(tok)¦parseInt(tok)¦+tok⟧);
  }
  return stack[stack.length - 1];
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Postfix evaluation = operand stack. Watch operand order and division semantics per language.',
  tests:[[[["2","1","+","3","*"]],9],[[["4","13","5","/","+"]],6],[[["10","6","9","3","+","-11","*","/","*","17","+","5","+"]],22],[[["3","-4","/"]],0],[[["42"]],42],[[["7","2","-"]],5]]
},
{
  id:'decode-string', title:'Decode String', diff:'Medium', pattern:'stack', time:25,
  desc:`<p>Decode strings of the form <code>k[encoded]</code>, meaning <code>encoded</code> repeated k times. Brackets can be nested.</p>`,
  examples:[{in:'s = "3[a]2[bc]"', out:'"aaabcbc"'},{in:'s = "3[a2[c]]"', out:'"accaccacc"'},{in:'s = "2[abc]3[cd]ef"', out:'"abcabccdcdcdef"'}],
  constraints:['1 ≤ len ≤ 30','k can have multiple digits'],
  fn:{py:'decode_string', js:'decodeString'}, params:['s'],
  logic:[
    {q:'Nested brackets: when we hit "[", what must we remember before starting the inner part?', opts:['the string built so far AND the repeat count','nothing','only the count'], a:0, why:'Push (current_string, k) and start fresh inside.'},
    {q:'On "]":', opts:['current = prev_string + current * k (popped from stack)','current = current * 2','ignore'], a:0, why:'Finish the inner part and attach it to what came before.'},
    {q:'Digits: "12[a]". How do we build k?', opts:['k = k*10 + digit','k = digit','k += digit'], a:0, why:'Multi-digit numbers are a common edge case.'}
  ],
  hints:['Track cur (string being built) and k (number being read).','On "[": push (cur, k), reset both.','On "]": pop (prev, n), cur = prev + cur*n.'],
  sol:{
py:`def decode_string(s):
    stack = []
    cur, k = '', 0
    for ch in s:
        if ch.isdigit():
            k = ⟦k * 10 + int(ch)⟧
        elif ch == '[':
            ⟦stack.append((cur, k))⟧
            cur, k = '', 0
        elif ch == ']':
            prev, n = stack.pop()
            cur = ⟦prev + cur * n⟧
        else:
            cur += ch
    return cur`,
js:`function decodeString(s) {
  const stack = [];
  let cur = '', k = 0;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') k = ⟦k * 10 + Number(ch)¦k * 10 + +ch¦k * 10 + parseInt(ch)⟧;
    else if (ch === '[') { ⟦stack.push([cur, k])⟧; cur = ''; k = 0; }
    else if (ch === ']') {
      const [prev, n] = stack.pop();
      cur = ⟦prev + cur.repeat(n)⟧;
    } else cur += ch;
  }
  return cur;
}`},
  complexity:'O(output length) time and space',
  takeaway:'Nesting → push the outer context onto a stack, then pop and combine when the inner part closes.',
  tests:[[["3[a]2[bc]"],"aaabcbc"],[["3[a2[c]]"],"accaccacc"],[["2[abc]3[cd]ef"],"abcabccdcdcdef"],[["abc"],"abc"],[["10[a]"],"aaaaaaaaaa"],[["2[b3[a]]"],"baaabaaa"]]
},
{
  id:'largest-rectangle', title:'Largest Rectangle in Histogram', diff:'Hard', pattern:'stack', time:35,
  desc:`<p>Given bar heights (width 1 each), return the area of the largest rectangle in the histogram.</p>`,
  examples:[{in:'heights = [2,1,5,6,2,3]', out:'10', why:'bars 5,6 → 5×2'},{in:'heights = [2,4]', out:'4'}],
  constraints:['1 ≤ n ≤ 10⁵'],
  fn:{py:'largest_rectangle_area', js:'largestRectangleArea'}, params:['heights'],
  logic:[
    {q:'If bar i is the SHORTEST bar of a rectangle, how wide can that rectangle be?', opts:['From the first shorter bar on its left to the first shorter bar on its right (exclusive)','Whole array','Just 1'], a:0, why:'So we need the previous smaller and next smaller elements, which a monotonic stack gives us.'},
    {q:'Keep a stack of indices with INCREASING heights. When heights[i] < heights[top], we pop top. For the popped bar…', opts:['right boundary = i, left boundary = new stack top','right = top','unknown'], a:0, why:'i is the next smaller bar. The element below it in the stack is the previous smaller. width = i − stack[-1] − 1, or i if the stack is empty.'},
    {q:'How do we flush the bars remaining at the end?', opts:['Append a sentinel height 0','Ignore them','Sort'], a:0, why:'A 0 at the end pops everything.'}
  ],
  hints:['Each bar as "the shortest" of its best rectangle.','Increasing stack of indices; pop when the current bar is shorter.','Width = i − (index below popped) − 1. Add a 0 sentinel at the end.'],
  sol:{
py:`def largest_rectangle_area(heights):
    heights = heights + [0]          # sentinel
    stack = []                       # increasing heights (indices)
    best = 0
    for i, h in enumerate(heights):
        while stack and ⟦heights[stack[-1]] > h⟧:
            height = heights[⟦stack.pop()⟧]
            width = i if not stack else ⟦i - stack[-1] - 1⟧
            best = max(best, ⟦height * width⟧)
        stack.append(i)
    return best`,
js:`function largestRectangleArea(heights) {
  const hs = [...heights, 0];        // sentinel
  const stack = [];                  // increasing heights (indices)
  let best = 0;
  for (let i = 0; i < hs.length; i++) {
    while (stack.length && ⟦hs[stack[stack.length - 1]] > hs[i]⟧) {
      const height = hs[⟦stack.pop()⟧];
      const width = stack.length === 0 ? i : ⟦i - stack[stack.length - 1] - 1⟧;
      best = Math.max(best, ⟦height * width⟧);
    }
    stack.push(i);
  }
  return best;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'"Max area/width where X is the minimum" → previous/next smaller via monotonic stack.',
  tests:[[[[2,1,5,6,2,3]],10],[[[2,4]],4],[[[1]],1],[[[2,2,2,2]],8],[[[6,2,5,4,5,1,6]],12],[[[5,4,3,2,1]],9]]
},
// ===================== LINKED LIST =====================
{
  id:'reverse-list', title:'Reverse Linked List', diff:'Easy', pattern:'linkedlist', time:10,
  desc:`<p>Given the <code>head</code> of a singly linked list, reverse it and return the new head. (Tests show lists as arrays.)</p>`,
  examples:[{in:'head = [1,2,3,4,5]', out:'[5,4,3,2,1]'},{in:'head = []', out:'[]'}],
  constraints:['0 ≤ n ≤ 5000'],
  fn:{py:'reverse_list', js:'reverseList'}, params:['head'], io:{args:['list'], ret:'list'},
  logic:[
    {q:'When we flip curr.next to point backward, what would we lose without saving it first?', opts:['The rest of the list','The head','Nothing'], a:0, why:'Save nxt = curr.next first.'},
    {q:'Order of the 4 steps?', opts:['save next → flip → move prev → move curr','flip → save → move curr → move prev'], a:0, why:'nxt = curr.next; curr.next = prev; prev = curr; curr = nxt.'},
    {q:'What do we return at the end?', opts:['curr (which is None)','prev','head'], a:1, why:'When curr falls off the end, prev is the old tail, which is the new head.'}
  ],
  hints:['Three variables: prev, curr, nxt.','Flip one arrow per step.','Return prev.'],
  sol:{
py:`def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = ⟦curr.next⟧
        curr.next = ⟦prev⟧
        prev = ⟦curr⟧
        curr = ⟦nxt⟧
    return ⟦prev⟧`,
js:`function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const nxt = ⟦curr.next⟧;
    curr.next = ⟦prev⟧;
    prev = ⟦curr⟧;
    curr = ⟦nxt⟧;
  }
  return ⟦prev⟧;
}`},
  complexity:'O(n) time, O(1) space',
  takeaway:'Pointer surgery: save next, then rewire.',
  tests:[[[[1,2,3,4,5]],[5,4,3,2,1]],[[[1,2]],[2,1]],[[[]],[]],[[[7]],[7]]]
},
{
  id:'merge-two-lists', title:'Merge Two Sorted Lists', diff:'Easy', pattern:'linkedlist', time:12,
  desc:`<p>Merge two sorted linked lists into one sorted list by splicing nodes together. Return its head.</p>`,
  examples:[{in:'list1 = [1,2,4], list2 = [1,3,4]', out:'[1,1,2,3,4,4]'}],
  constraints:['0 ≤ n ≤ 50'],
  fn:{py:'merge_two_lists', js:'mergeTwoLists'}, params:['list1','list2'], io:{args:['list','list'], ret:'list'},
  logic:[
    {q:'Why use a dummy head node?', opts:['So we never special-case "is the result empty?" when attaching the first node','It is faster','Required by Python'], a:0, why:'Return dummy.next at the end.'},
    {q:'When one list runs out…', opts:['attach the rest of the other list directly','copy node by node','stop'], a:0, why:'It is already sorted, so one pointer assignment does it.'}
  ],
  hints:['dummy = tail = new node.','Attach the smaller head to tail.next and advance.','Attach whatever list remains.'],
  sol:{
py:`def merge_two_lists(list1, list2):
    dummy = tail = ListNode()
    while list1 and list2:
        if ⟦list1.val <= list2.val⟧:
            tail.next = list1
            list1 = ⟦list1.next⟧
        else:
            tail.next = list2
            list2 = list2.next
        tail = ⟦tail.next⟧
    tail.next = ⟦list1 or list2¦list1 if list1 else list2⟧
    return ⟦dummy.next⟧`,
js:`function mergeTwoLists(list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (⟦list1.val <= list2.val⟧) { tail.next = list1; list1 = ⟦list1.next⟧; }
    else { tail.next = list2; list2 = list2.next; }
    tail = ⟦tail.next⟧;
  }
  tail.next = ⟦list1 || list2¦list1 ? list1 : list2¦list1 ?? list2⟧;
  return ⟦dummy.next⟧;
}`},
  complexity:'O(n + m) time, O(1) space',
  takeaway:'Dummy head + tail pointer for building lists.',
  tests:[[[[1,2,4],[1,3,4]],[1,1,2,3,4,4]],[[[],[]],[]],[[[],[0]],[0]],[[[5],[1,2,3]],[1,2,3,5]],[[[1,3,5,7],[2,4]],[1,2,3,4,5,7]]]
},
{
  id:'remove-nth', title:'Remove Nth Node From End of List', diff:'Medium', pattern:'linkedlist', time:15,
  desc:`<p>Remove the <code>n</code>-th node from the end of the list and return its head. Try to do it in one pass.</p>`,
  examples:[{in:'head = [1,2,3,4,5], n = 2', out:'[1,2,3,5]'},{in:'head = [1], n = 1', out:'[]'}],
  constraints:['1 ≤ n ≤ size ≤ 30'],
  fn:{py:'remove_nth_from_end', js:'removeNthFromEnd'}, params:['head','n'], io:{args:['list',null], ret:'list'},
  logic:[
    {q:'To delete a node we need a pointer to…', opts:['the node itself','the node BEFORE it','the tail'], a:1, why:'We set prev.next = prev.next.next.'},
    {q:'One pass: move fast n+1 steps ahead of slow (both start at dummy). Then move both until fast is None. Slow is…', opts:['right before the node to delete','the node to delete','the head'], a:0, why:'The gap is n+1, so slow stops one before the target.'},
    {q:'Why does the dummy matter here?', opts:['If we remove the head itself (n = size), slow must stand before it','Style only'], a:0, why:'Without a dummy, the head-removal case needs special code.'}
  ],
  hints:['Dummy node before head.','Advance fast n+1 times.','Move both until fast is null, then skip slow.next.'],
  sol:{
py:`def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(⟦n + 1⟧):
        fast = fast.next
    while ⟦fast⟧:
        slow, fast = slow.next, fast.next
    slow.next = ⟦slow.next.next⟧
    return dummy.next`,
js:`function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let slow = dummy, fast = dummy;
  for (let i = 0; i < ⟦n + 1⟧; i++) fast = fast.next;
  while (⟦fast⟧) { slow = slow.next; fast = fast.next; }
  slow.next = ⟦slow.next.next⟧;
  return dummy.next;
}`},
  complexity:'O(L) time, O(1) space',
  takeaway:'Fixed-gap two pointers find "k-th from end" in one pass.',
  tests:[[[[1,2,3,4,5],2],[1,2,3,5]],[[[1],1],[]],[[[1,2],1],[1]],[[[1,2],2],[2]],[[[1,2,3],3],[2,3]]]
},
{
  id:'add-two-numbers', title:'Add Two Numbers', diff:'Medium', pattern:'linkedlist', time:20,
  desc:`<p>Two non-negative integers are stored as linked lists with digits in <b>reverse order</b> (ones digit first). Return their sum as a linked list in the same format.</p>`,
  examples:[{in:'l1 = [2,4,3], l2 = [5,6,4]', out:'[7,0,8]', why:'342 + 465 = 807'},{in:'l1 = [9,9,9,9], l2 = [9,9]', out:'[8,9,0,0,1]'}],
  constraints:['1 ≤ length ≤ 100','no leading zeros'],
  fn:{py:'add_two_numbers', js:'addTwoNumbers'}, params:['l1','l2'], io:{args:['list','list'], ret:'list'},
  logic:[
    {q:'Can we convert to integers, add, and convert back?', opts:['Risky: 100 digits overflow in JS/Java/C. Simulate grade-school addition instead','Always fine'], a:0, why:'Python can handle big ints, but the interviewer wants the digit-by-digit approach.'},
    {q:'At each step digit = (a + b + carry) % 10 and carry = ?', opts:['(a + b + carry) // 10','1','a // 10'], a:0, why:'Standard carry.'},
    {q:'Loop condition?', opts:['while l1 and l2','while l1 or l2 or carry'], a:1, why:'The lists can differ in length, and a final carry adds a new digit (999 + 1).'}
  ],
  hints:['Digits are already ones-first, so add left to right.','Track carry.','Continue while either list remains OR carry is non-zero.'],
  sol:{
py:`def add_two_numbers(l1, l2):
    dummy = tail = ListNode()
    carry = 0
    while ⟦l1 or l2 or carry⟧:
        total = carry
        if l1:
            total += l1.val
            l1 = l1.next
        if l2:
            total += l2.val
            l2 = l2.next
        carry = ⟦total // 10⟧
        tail.next = ListNode(⟦total % 10⟧)
        tail = tail.next
    return dummy.next`,
js:`function addTwoNumbers(l1, l2) {
  const dummy = new ListNode();
  let tail = dummy, carry = 0;
  while (⟦l1 || l2 || carry⟧) {
    let total = carry;
    if (l1) { total += l1.val; l1 = l1.next; }
    if (l2) { total += l2.val; l2 = l2.next; }
    carry = ⟦Math.floor(total / 10)¦Math.trunc(total / 10)¦(total / 10) | 0⟧;
    tail.next = new ListNode(⟦total % 10⟧);
    tail = tail.next;
  }
  return dummy.next;
}`},
  complexity:'O(max(n, m)) time, O(max(n, m)) output',
  takeaway:'Simulate arithmetic digit by digit with a carry, and loop while anything remains.',
  tests:[[[[2,4,3],[5,6,4]],[7,0,8]],[[[0],[0]],[0]],[[[9,9,9,9,9,9,9],[9,9,9,9]],[8,9,9,9,0,0,0,1]],[[[5],[5]],[0,1]],[[[1,8],[0]],[1,8]]]
},
// ===================== BINARY SEARCH =====================
{
  id:'binary-search', title:'Binary Search', diff:'Easy', pattern:'binarysearch', time:8,
  desc:`<p>Given a sorted array of distinct integers <code>nums</code> and a <code>target</code>, return its index or <code>-1</code>. O(log n).</p>`,
  examples:[{in:'nums = [-1,0,3,5,9,12], target = 9', out:'4'},{in:'nums = [-1,0,3,5,9,12], target = 2', out:'-1'}],
  constraints:['1 ≤ n ≤ 10⁴'],
  fn:{py:'search', js:'search'}, params:['nums','target'],
  logic:[
    {q:'With lo=0, hi=n−1 (inclusive), the loop condition is…', opts:['lo < hi','lo <= hi'], a:1, why:'With an inclusive range, lo == hi is still one element left to check.'},
    {q:'nums[mid] < target →', opts:['lo = mid','lo = mid + 1','hi = mid − 1'], a:1, why:'mid is not the answer, so exclude it, or the loop may never end.'}
  ],
  hints:['lo, hi = 0, n−1','mid = (lo + hi) // 2','Move lo or hi past mid.'],
  sol:{
py:`def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while ⟦lo <= hi⟧:
        mid = ⟦(lo + hi) // 2⟧
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = ⟦mid + 1⟧
        else:
            hi = ⟦mid - 1⟧
    return -1`,
js:`function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (⟦lo <= hi⟧) {
    const mid = ⟦Math.floor((lo + hi) / 2)¦(lo + hi) >> 1⟧;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = ⟦mid + 1⟧;
    else hi = ⟦mid - 1⟧;
  }
  return -1;
}`},
  complexity:'O(log n) time, O(1) space',
  takeaway:'Inclusive bounds + lo <= hi + mid ± 1.',
  tests:[[[[-1,0,3,5,9,12],9],4],[[[-1,0,3,5,9,12],2],-1],[[[5],5],0],[[[5],-5],-1],[[[1,3,5,7,9,11],1],0],[[[1,3,5,7,9,11],11],5]]
},
{
  id:'search-rotated', title:'Search in Rotated Sorted Array', diff:'Medium', pattern:'binarysearch', time:25,
  desc:`<p>A sorted array of distinct integers was rotated at an unknown pivot (e.g. <code>[0,1,2,4,5,6,7]</code> → <code>[4,5,6,7,0,1,2]</code>). Return the index of <code>target</code> or -1, in O(log n).</p>`,
  examples:[{in:'nums = [4,5,6,7,0,1,2], target = 0', out:'4'},{in:'nums = [4,5,6,7,0,1,2], target = 3', out:'-1'}],
  constraints:['1 ≤ n ≤ 5000','distinct values'],
  fn:{py:'search_rotated', js:'searchRotated'}, params:['nums','target'],
  logic:[
    {q:'At any mid, what is ALWAYS true?', opts:['At least one half (left..mid or mid..right) is properly sorted','Both halves are sorted','Neither'], a:0, why:'The rotation point falls in at most one half.'},
    {q:'How do we know the left half is sorted?', opts:['nums[lo] <= nums[mid]','nums[mid] <= nums[hi]','nums[lo] < target'], a:0, why:'If the left end is ≤ mid, there is no break in between.'},
    {q:'Left half sorted and nums[lo] <= target < nums[mid] →', opts:['hi = mid − 1','lo = mid + 1'], a:0, why:'The target is inside the sorted range, so go left. Otherwise go right. Mirror this when the right half is sorted.'}
  ],
  hints:['Normal binary search skeleton.','Decide which half is sorted using nums[lo] <= nums[mid].','Check whether the target lies within that sorted half\'s range.'],
  sol:{
py:`def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if ⟦nums[lo] <= nums[mid]⟧:                 # left half sorted
            if ⟦nums[lo] <= target < nums[mid]⟧:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                     # right half sorted
            if ⟦nums[mid] < target <= nums[hi]⟧:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
js:`function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (⟦nums[lo] <= nums[mid]⟧) {                       // left half sorted
      if (⟦nums[lo] <= target && target < nums[mid]⟧) hi = mid - 1;
      else lo = mid + 1;
    } else {                                           // right half sorted
      if (⟦nums[mid] < target && target <= nums[hi]⟧) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`},
  complexity:'O(log n) time, O(1) space',
  takeaway:'Modified binary search: find which half is sorted, then decide using its range.',
  tests:[[[[4,5,6,7,0,1,2],0],4],[[[4,5,6,7,0,1,2],3],-1],[[[1],0],-1],[[[1],1],0],[[[3,1],1],1],[[[5,1,3],5],0],[[[6,7,1,2,3,4,5],7],1]]
},
{
  id:'koko-bananas', title:'Koko Eating Bananas', diff:'Medium', pattern:'binarysearch', time:20,
  desc:`<p>There are <code>piles[i]</code> bananas. Each hour Koko picks one pile and eats up to <code>k</code> bananas from it (if the pile has fewer, she finishes it and waits for the hour to end). Return the minimum integer <code>k</code> so she finishes within <code>h</code> hours.</p>`,
  examples:[{in:'piles = [3,6,7,11], h = 8', out:'4'},{in:'piles = [30,11,23,4,20], h = 5', out:'30'}],
  constraints:['n ≤ h ≤ 10⁹','piles[i] ≤ 10⁹'],
  fn:{py:'min_eating_speed', js:'minEatingSpeed'}, params:['piles','h'],
  logic:[
    {q:'Hours needed for one pile p at speed k?', opts:['p // k','ceil(p / k)','p * k'], a:1, why:'A partial hour still counts as a full hour. ceil(p/k) = (p + k − 1) // k.'},
    {q:'If speed k finishes in time, does speed k+1?', opts:['Yes (monotonic)','Not necessarily'], a:0, why:'Monotonic, so we can binary search on k.'},
    {q:'Search range for k?', opts:['1 .. max(piles)','0 .. h','1 .. sum(piles)'], a:0, why:'At max(piles) every pile takes 1 hour, and n ≤ h guarantees that works.'}
  ],
  hints:['Write can_finish(k).','Binary search the smallest k where can_finish is true.','lo=1, hi=max(piles); if ok: hi=mid else lo=mid+1.'],
  sol:{
py:`def min_eating_speed(piles, h):
    def hours(k):
        return sum(⟦(p + k - 1) // k⟧ for p in piles)
    lo, hi = 1, max(piles)
    while ⟦lo < hi⟧:
        mid = (lo + hi) // 2
        if ⟦hours(mid) <= h⟧:
            hi = ⟦mid⟧
        else:
            lo = ⟦mid + 1⟧
    return lo`,
js:`function minEatingSpeed(piles, h) {
  const hours = k => piles.reduce((s, p) => s + ⟦Math.ceil(p / k)⟧, 0);
  let lo = 1, hi = Math.max(...piles);
  while (⟦lo < hi⟧) {
    const mid = Math.floor((lo + hi) / 2);
    if (⟦hours(mid) <= h⟧) hi = ⟦mid⟧;
    else lo = ⟦mid + 1⟧;
  }
  return lo;
}`},
  complexity:'O(n log max(p)) time, O(1) space',
  takeaway:'"Minimum X such that it works" + monotonic → binary search on the answer.',
  tests:[[[[3,6,7,11],8],4],[[[30,11,23,4,20],5],30],[[[30,11,23,4,20],6],23],[[[1],1],1],[[[312884470],312884469],2],[[[5,5,5],15],1]]
},
// ===================== INTERVALS / STRINGS =====================
{
  id:'merge-intervals', title:'Merge Intervals', diff:'Medium', pattern:'intervals', time:18,
  desc:`<p>Given an array of <code>intervals[i] = [start, end]</code>, merge all overlapping intervals and return the result sorted by start.</p>`,
  examples:[{in:'intervals = [[1,3],[2,6],[8,10],[15,18]]', out:'[[1,6],[8,10],[15,18]]'},{in:'intervals = [[1,4],[4,5]]', out:'[[1,5]]'}],
  constraints:['1 ≤ n ≤ 10⁴'],
  fn:{py:'merge', js:'merge'}, params:['intervals'],
  logic:[
    {q:'First step?', opts:['Sort by start','Sort by end','Use a hashmap'], a:0, why:'After sorting, overlaps are adjacent.'},
    {q:'Current [s,e] overlaps the last merged [ls, le] iff…', opts:['s <= le','s < ls','e > le'], a:0, why:'It starts before (or exactly when) the last one ends.'},
    {q:'When merging, new end = ?', opts:['e','max(le, e)','le + e'], a:1, why:'[1,10] then [2,3]: the end stays 10.'}
  ],
  hints:['Sort by start.','Compare each interval with the last one in the result.','Extend with max(end) or append.'],
  sol:{
py:`def merge(intervals):
    intervals.sort(key=⟦lambda x: x[0]⟧)
    merged = []
    for s, e in intervals:
        if merged and ⟦s <= merged[-1][1]⟧:
            merged[-1][1] = ⟦max(merged[-1][1], e)⟧
        else:
            ⟦merged.append([s, e])⟧
    return merged`,
js:`function merge(intervals) {
  intervals.sort(⟦(a, b) => a[0] - b[0]⟧);
  const merged = [];
  for (const [s, e] of intervals) {
    const last = merged[merged.length - 1];
    if (last && ⟦s <= last[1]⟧) last[1] = ⟦Math.max(last[1], e)⟧;
    else ⟦merged.push([s, e])⟧;
  }
  return merged;
}`},
  complexity:'O(n log n) time, O(n) output',
  takeaway:'Intervals → sort by start, then a single sweep.',
  tests:[[[[[1,3],[2,6],[8,10],[15,18]]],[[1,6],[8,10],[15,18]]],[[[[1,4],[4,5]]],[[1,5]]],[[[[1,4],[0,4]]],[[0,4]]],[[[[1,10],[2,3],[4,5]]],[[1,10]]],[[[[5,6]]],[[5,6]]],[[[[2,3],[4,5],[6,7],[8,9],[1,10]]],[[1,10]]]]
},
{
  id:'longest-palindrome', title:'Longest Palindromic Substring', diff:'Medium', pattern:'strings', time:25,
  desc:`<p>Given a string <code>s</code>, return the longest substring that is a palindrome. If several have the max length, any of them is accepted.</p>`,
  examples:[{in:'s = "babad"', out:'"bab" (or "aba")'},{in:'s = "cbbd"', out:'"bb"'}],
  constraints:['1 ≤ len ≤ 1000'],
  fn:{py:'longest_palindrome', js:'longestPalindrome'}, params:['s'],
  logic:[
    {q:'Brute force: check all O(n²) substrings, each in O(n). Total?', opts:['O(n²)','O(n³)'], a:1, why:'10⁹ operations at n = 1000 is too slow.'},
    {q:'A palindrome mirrors around its center. How many possible centers are there?', opts:['n','2n − 1 (each char, and each gap between chars)','n²'], a:1, why:'Odd length centers on a char ("aba"). Even length centers on a gap ("abba").'},
    {q:'Expanding from each center costs O(n). Total?', opts:['O(n²) time, O(1) space','O(n log n)','O(n³)'], a:0, why:'This is good enough. Manacher\'s algorithm is O(n) but nobody expects it.'}
  ],
  hints:['Grow outwards from a middle point while the ends match.','Try both odd (i, i) and even (i, i+1) centers.','Keep the longest found.'],
  sol:{
py:`def longest_palindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and ⟦s[l] == s[r]⟧:
            l -= 1
            r += 1
        return ⟦s[l + 1:r]⟧
    best = ''
    for i in range(len(s)):
        for cand in (expand(i, i), ⟦expand(i, i + 1)⟧):
            if len(cand) > len(best):
                best = cand
    return best`,
js:`function longestPalindrome(s) {
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && ⟦s[l] === s[r]⟧) { l--; r++; }
    return ⟦s.slice(l + 1, r)¦s.substring(l + 1, r)⟧;
  };
  let best = '';
  for (let i = 0; i < s.length; i++) {
    for (const cand of [expand(i, i), ⟦expand(i, i + 1)⟧]) {
      if (cand.length > best.length) best = cand;
    }
  }
  return best;
}`},
  complexity:'O(n²) time, O(1) space',
  takeaway:'Palindromes → expand around 2n−1 centers.',
  tests:[[["babad"],{anyOf:["bab","aba"]}],[["cbbd"],"bb"],[["a"],"a"],[["ac"],{anyOf:["a","c"]}],[["forgeeksskeegfor"],"geeksskeeg"],[["aaaa"],"aaaa"]]
},
{
  id:'reverse-words', title:'Reverse Words in a String', diff:'Medium', pattern:'strings', time:12,
  desc:`<p>Reverse the order of words in <code>s</code>. Words are separated by one or more spaces. The result must have single spaces between words and no leading or trailing spaces.</p>`,
  examples:[{in:'s = "the sky is blue"', out:'"blue is sky the"'},{in:'s = "  hello world  "', out:'"world hello"'}],
  constraints:['1 ≤ len ≤ 10⁴','at least one word'],
  fn:{py:'reverse_words', js:'reverseWords'}, params:['s'],
  logic:[
    {q:'Python s.split() with NO argument…', opts:['splits on single spaces only, keeping empty strings','splits on any whitespace run and drops empty strings'], a:1, why:'s.split(" ") would produce empty strings for double spaces.'},
    {q:'JS equivalent?', opts:['s.split(" ")','s.trim().split(/\\s+/)'], a:1, why:'Trim first, then split on a whitespace regex.'},
    {q:'Interviewer follow-up: no split() allowed. Approach?', opts:['Two pointers scanning words from the end','Impossible'], a:0, why:'Walk i from the end, skip spaces, find the word start, and append. Know that this is possible.'}
  ],
  hints:['Split into words, ignoring extra spaces.','Reverse the list.','Join with a single space.'],
  sol:{
py:`def reverse_words(s):
    words = ⟦s.split()⟧
    return ⟦' '.join(reversed(words))¦' '.join(words[::-1])¦" ".join(reversed(words))¦" ".join(words[::-1])⟧`,
js:`function reverseWords(s) {
  const words = ⟦s.trim().split(/\\s+/)⟧;
  return ⟦words.reverse().join(' ')¦words.reverse().join(" ")⟧;
}`},
  complexity:'O(n) time, O(n) space',
  takeaway:'Know your language\'s split/join/trim behaviour exactly. It is free points.',
  tests:[[["the sky is blue"],"blue is sky the"],[["  hello world  "],"world hello"],[["a good   example"],"example good a"],[["single"],"single"]]
},
{
  id:'longest-common-prefix', title:'Longest Common Prefix', diff:'Easy', pattern:'strings', time:10,
  desc:`<p>Return the longest common prefix among an array of strings, or <code>""</code> if there is none.</p>`,
  examples:[{in:'strs = ["flower","flow","flight"]', out:'"fl"'},{in:'strs = ["dog","racecar","car"]', out:'""'}],
  constraints:['1 ≤ n ≤ 200'],
  fn:{py:'longest_common_prefix', js:'longestCommonPrefix'}, params:['strs'],
  logic:[
    {q:'Vertical scan: for each index i of the first word, check…', opts:['every other word has the same char at i (and is long enough)','only the last word'], a:0, why:'Stop at the first mismatch or the end of any word.'},
    {q:'Clever alternative: after sorting, you only need to compare…', opts:['the first and last strings','the middle two','all pairs'], a:0, why:'The lexicographically smallest and largest strings differ the most.'}
  ],
  hints:['Use the first string as reference.','Check index i across all strings.','Return the prefix up to the first mismatch.'],
  sol:{
py:`def longest_common_prefix(strs):
    first = strs[0]
    for i, ch in enumerate(first):
        for w in strs[1:]:
            if ⟦i >= len(w) or w[i] != ch⟧:
                return ⟦first[:i]⟧
    return first`,
js:`function longestCommonPrefix(strs) {
  const first = strs[0];
  for (let i = 0; i < first.length; i++) {
    for (const w of strs) {
      if (⟦i >= w.length || w[i] !== first[i]⟧) return ⟦first.slice(0, i)¦first.substring(0, i)⟧;
    }
  }
  return first;
}`},
  complexity:'O(total characters) time, O(1) space',
  takeaway:'Scan column by column and stop at the first mismatch.',
  tests:[[[["flower","flow","flight"]],"fl"],[[["dog","racecar","car"]],""],[[["a"]],"a"],[[["ab","a"]],"a"],[[["",""]],""],[[["interview","internet","interval"]],"inter"]]
}
);
