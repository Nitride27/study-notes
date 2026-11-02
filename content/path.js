// The whole road. A unit = one concept to read first, then problems. Content files call unit(...).
// A problem is either a bank id (string, from ../data/problems-*.js) or an object:
// { id, title, diff, time, desc, ex:[[in, out, why?]], start, nudge:[questions], sol, big, idea, tests:[[call, want, setup?]] }
// A project unit has `project: {brief, build:[...], check:[...]}` instead of problems: built on your own machine.
// Display order is this array's order. Ids stay stable, so they aren't positions. A track groups phases for the memory map.
window.PHASES = [
  { id: 0, track: 'Python', title: 'Think in Python', blurb: 'Turn plain thoughts into working Python, then write the Python real engineers write.' },
  { id: 1, track: 'DSA', title: 'Core patterns', blurb: 'The handful of ideas behind most array and string problems.' },
  { id: 2, track: 'DSA', title: 'Data structures', blurb: 'Stacks, lists, trees and heaps: choosing the right shape for the data.' },
  { id: 3, track: 'DSA', title: 'Hard algorithms', blurb: 'Graphs, backtracking, greedy, dynamic programming and string matching.' },
  { id: 4, track: 'Backend', title: 'CRUD apps', blurb: 'Records, SQL and HTTP: a working API, from the ground up.' },
  { id: 8, track: 'Computer basics', title: 'Computer basics', blurb: 'Just enough networking, operating systems and distributed systems to reason about real backends.' },
  { id: 5, track: 'Backend', title: 'Backends', blurb: 'Auth, security, transactions, caching, queues and failure.' },
  { id: 6, track: 'ML', title: 'Machine learning', blurb: 'Build the models from scratch so nothing is magic.' },
  { id: 7, title: 'Ship real things', blurb: 'Projects on your own machine, with real tools.' }
];
window.UNITS = [];
const unit = u => { UNITS.push(u); };
const R = String.raw;
// Extra problems for an existing unit, and a new unit placed right after an existing one.
const more = (id, ...ps) => { const u = UNITS.find(x => x.id === id); (u.extra = u.extra || []).push(...ps); };
const unitAfter = (id, u) => { UNITS.splice(UNITS.findIndex(x => x.id === id) + 1, 0, u); };
