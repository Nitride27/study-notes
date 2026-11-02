// Phase 7: real projects on your own machine. The browser can't teach deploying, Postgres or Docker.
// Each one lists what "done" means. You judge it honestly: there is no autograder for shipping.

unit({ id: 'tools', phase: 7, title: 'Set up your workshop', project: { time: 'one evening',
  brief: `<p>Set up what you'll use for all the projects that follow. Don't aim for perfection: get a loop that works.</p>
  <ul><li>Install Python, an editor, and git. Make a GitHub account if you don't have one.</li><li>Learn the four git moves you'll actually use daily: <code>add</code>, <code>commit</code>, <code>push</code>, and working on a branch. Look up the commands yourself.</li><li>Make a virtual environment, and learn why it exists: write down what would go wrong without one.</li><li>Install <code>pytest</code>, and write 3 tests for a function of your own.</li></ul>`,
  check: ['A public repository exists, with at least 3 commits you wrote yourself', 'A project runs inside a virtual environment, with a <code>requirements.txt</code>', '<code>pytest</code> runs and passes, and you\'ve watched a test fail on purpose', 'You merged a branch into main at least once, including fixing a conflict you caused'] } });

unit({ id: 'project-cli', phase: 7, title: 'Project: Expense tracker CLI', project: { time: 'a weekend',
  brief: `<p>A command-line tool to track spending. No web yet. It's about structure, files and testing.</p>
  <ul><li><code>add 450 food "lunch"</code>, <code>list --month 2026-11</code>, <code>summary</code>, <code>delete 3</code>.</li><li>Data persists in SQLite.</li><li>Sketch the data and the commands on paper <b>before</b> writing any code, and put that photo in the repo.</li></ul>
  <p>Look up <code>argparse</code> yourself. Reading documentation is a skill you practise here.</p>`,
  check: ['All four commands work, and data survives restarting', 'Bad input, like a negative amount or a bad date, gives a clear message, not a stack trace', 'At least 10 passing tests, including failure cases', 'A README tells a stranger how to install and run it. Ask one to try it.'] } });

unit({ id: 'project-api', phase: 7, title: 'Project: A real REST API', project: { time: 'one to two weeks',
  brief: `<p>Rebuild the API you made in CRUD apps, for real, with a real framework and a real database.</p>
  <ul><li>FastAPI (or Flask) with Postgres. Notes or bookmarks are good subjects: pick something you'd use.</li><li>User sign-up and login, where users can only see their own records.</li><li>Cursor pagination, validation, and proper status codes.</li><li>Database migrations, using a tool like Alembic.</li></ul>
  <p>You've built each of these by hand already. Notice how much of the framework now makes sense to you.</p>`,
  check: ['It\'s deployed at a public URL (Render, Fly.io or a similar service) and you\'ve called it from your phone', 'One user provably can\'t read another\'s records. You wrote a test for exactly this.', 'Passwords use bcrypt or argon2, and no secrets are in the repo', 'An automated test run happens on each push, using GitHub Actions', 'You looked at the slowest query with <code>EXPLAIN</code> and added an index'] } });

unit({ id: 'project-scale', phase: 7, title: 'Project: Make it survive', project: { time: 'two weeks',
  brief: `<p>A URL shortener, or extend your API. This time the goal is to <b>make it fail, then make it stop failing.</b></p>
  <ul><li>Run with Docker Compose: app, Postgres and Redis.</li><li>Add caching, and rate limiting.</li><li>Add a background worker for something slow, like click analytics, with retries and a dead-letter list.</li><li>Load-test it with a tool like <code>k6</code> or <code>locust</code>.</li></ul>`,
  check: ['<code>docker compose up</code> starts everything from a clean machine', 'You\'ve got a before-and-after load test with p50 and p99 numbers, showing what the cache did', 'You killed the worker in the middle of a job, and no job was lost', 'You killed the database mid-load, and the app gave clean errors, then recovered by itself', 'Logs are structured, and carry a request id you can follow through a whole request'] } });

unit({ id: 'project-ml', phase: 7, title: 'Project: Ship a model', project: { time: 'two weeks',
  brief: `<p>Train a model on data you actually care about, and put it behind your API.</p>
  <ul><li>Find a real dataset, like Kaggle, or something you collected yourself. Real data is messy, and dealing with that is the lesson.</li><li>Start with the simplest baseline you can: predict the average, or the most common class.</li><li>Then scikit-learn, comparing at least two models using cross-validation.</li><li>Then learn PyTorch by rebuilding your XOR network in it, and notice how little code it takes.</li><li>Serve the best model with an endpoint, with input validation.</li></ul>`,
  check: ['A written comparison shows how your model does against a dumb baseline', 'You can explain a real mistake it makes, by looking at specific wrong predictions', 'No leakage: all preprocessing was fit on the training data only', 'A <code>POST /predict</code> endpoint is live, and rejects bad input with a 4xx'] } });

unit({ id: 'project-rag', phase: 7, title: 'Project: Search your own notes', project: { time: 'one to two weeks',
  brief: `<p>Build a question-answering tool over your own documents, like your notes from this portal.</p>
  <ul><li>Split documents into chunks, embed them, and store the vectors (start with a numpy array. Move to pgvector later if you need to).</li><li>Answer questions by retrieving the closest chunks and passing them to a language model API.</li><li>Build a small set of 20 questions with known good answers, so you can measure if a change actually helps.</li></ul>
  <p>Export this portal's notebook from Settings, and you've already got a data source.</p>`,
  check: ['It answers questions about your own documents, and cites which chunk each answer came from', 'It says "I don\'t know" when the answer isn\'t in your documents', 'You have an evaluation set, with a score, and you changed one thing and measured the effect', 'You can explain what happens at each step, without the words "magic" or "somehow"'] } });

unit({ id: 'project-capstone', phase: 7, title: 'Capstone: Something people use', project: { time: 'as long as it takes',
  brief: `<p>All of it, together. Build something that solves a real problem for real people, even if it's only ten of them. Your family's business, your college club, a tool your friends keep complaining they don't have.</p>
  <p>Real users find every problem you didn't think of. Dealing with them is what turns you from someone who can code into a software engineer. Nothing on this road teaches that except doing it.</p>`,
  check: ['At least 5 people who aren\'t you have used it', 'You fixed a bug that a real user reported', 'It has backups, and you actually tested restoring one', 'You wrote up the design decisions, including one you got wrong, and what you would do differently'] } });
