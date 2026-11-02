// The whole road. A unit = one concept to read first, then problems. Content files call unit(...).
// A problem is either a bank id (string, from ../data/problems-*.js) or an object:
// { id, title, diff, time, desc, ex:[[in, out, why?]], start, nudge:[questions], sol, big, idea, tests:[[call, want, setup?]] }
// A project unit has `project: {brief, build:[...], check:[...]}` instead of problems: built on your own machine.
window.PHASES = [
  { id: 0, title: 'Think in Python', blurb: 'Turn plain thoughts into working Python.' },
  { id: 1, title: 'Core patterns', blurb: 'The handful of ideas behind most array and string problems.' },
  { id: 2, title: 'Data structures', blurb: 'Stacks, lists, trees and heaps: choosing the right shape for the data.' },
  { id: 3, title: 'Hard algorithms', blurb: 'Graphs, backtracking, greedy and dynamic programming.' },
  { id: 4, title: 'CRUD apps', blurb: 'Records, SQL and HTTP: a working API, from the ground up.' },
  { id: 5, title: 'Backends', blurb: 'Auth, transactions, caching, queues and failure.' },
  { id: 6, title: 'Machine learning', blurb: 'Build the models from scratch so nothing is magic.' },
  { id: 7, title: 'Ship real things', blurb: 'Projects on your own machine, with real tools.' }
];
window.UNITS = [];
const unit = u => { UNITS.push(u); };
const R = String.raw;
