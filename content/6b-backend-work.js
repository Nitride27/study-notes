// What backend work needs beyond the earlier units: APIs other people depend on, schemas that evolve, security, and async.
(() => {
const p = (id, title, diff, time, desc, start, nudge, sol, big, idea, tests, ex) => ({ id, title, diff, time, desc: `<p>${desc}</p>`, start, nudge, sol, big, idea, tests, ex: ex || [] });
const SQL = 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("PRAGMA foreign_keys = ON")\n';

unit({ id: 'api-design', phase: 5, title: 'APIs people can rely on', mins: 8, read: [
`<p class="lede">Once someone depends on your API, you can't freely change it. <b>A good API is predictable, hard to misuse, and can grow without breaking its users.</b></p>
<h2>Predictable errors</h2><p>Use one error shape everywhere, with a stable code that programs can check and a message that people can read:</p><pre><code>{"error": {"code": "email_taken", "message": "That email is already in use."}}</code></pre>
<h2>Limit, filter, sort</h2><p><code>GET /orders?status=open&amp;sort=-created&amp;limit=50</code>. Whitelist the fields you allow: a client shouldn't be able to sort by any column, or ask for a million rows. Always have a default limit and a maximum.</p>
<h2>Changing without breaking</h2><table><tr><th>Usually safe</th><th>Breaks people</th></tr><tr><td>Adding an optional field or endpoint</td><td>Removing or renaming a field</td></tr><tr><td>Accepting more input than before</td><td>Changing a type, or what a field means</td></tr><tr><td></td><td>Adding a new required input</td></tr></table>
<p>For breaking changes, publish a new version, such as <code>/v2/</code>, and keep the old one running while people move.</p>
<h2>Two people editing at once</h2>`,
steps([
  { n: 'Ana and Bo both load the same document, at version 3.', d: D.flow({ a: [40, 20, 110, 50, 'Ana'], s: [290, 20, 140, 50, 'doc, version 3', 'y'], b: [570, 20, 110, 50, 'Bo'] }, [['s', 'a', 'read'], ['s', 'b', 'read']]) },
  { n: 'Ana saves. She says "If-Match: 3", the version is still 3, so it works. It becomes version 4.', d: D.flow({ a: [40, 20, 110, 50, 'Ana', 'g'], s: [290, 20, 140, 50, 'doc, version 4', 'g'], b: [570, 20, 110, 50, 'Bo'] }, [['a', 's', 'If-Match: 3']]) },
  { n: 'Bo saves, also saying "If-Match: 3". It no longer matches, so he gets 412 instead of silently wiping out Ana\'s work.', d: D.flow({ a: [40, 20, 110, 50, 'Ana'], s: [290, 20, 140, 50, 'doc, version 4'], b: [570, 20, 110, 50, 'Bo', 'r'] }, [['b', 's', 'If-Match: 3']]) + D.t(490, 90, '412 Precondition Failed', { a: 'middle', cls: 'r' }) }
], 110),
`<h2>Webhooks: when your server gets called</h2><p>Payment providers and others send your server events over HTTP. Anyone on the internet could send you the same thing, so providers sign each one with a shared secret. Check the signature, and reject old timestamps so that a captured request can't be replayed. Webhooks can also arrive twice, so handling them must be idempotent.</p>`,
think('Your API returns a list as a bare JSON array. You later need to add a total count. What\'s the problem, and what should you have done?', 'There\'s nowhere to put it without breaking every client. Returning an object, <code>{"items": [...]}</code>, leaves room to grow from the start.')
], core: [
p('list-params', 'Clean the query', 'Medium', 15, '<code>list_params(query, filterable, sortable)</code>. <code>query</code> is a dict of strings. Return a dict with <code>filters</code> (the keys in <code>filterable</code>), <code>sort</code> (a <code>(field, "asc" or "desc")</code> tuple, or <code>None</code>, where <code>"-x"</code> means x descending) and <code>limit</code> (default 20, and values above 100 are capped to 100). Raise <code>ValueError</code> for a key that isn\'t filterable, a field that isn\'t sortable, or a limit that isn\'t a positive whole number. <code>sort</code> and <code>limit</code> themselves are always allowed as keys.', 'def list_params(query, filterable, sortable):\n    ',
  ['Handle sort and limit separately, then what remains?', 'What does int() do with "abc"? Which limit values does it let through that you still have to reject?'],
  R`def list_params(query, filterable, sortable):
    out = {"filters": {}, "sort": None, "limit": 20}
    for k, v in query.items():
        if k == "limit":
            n = int(v)
            if n < 1:
                raise ValueError("limit must be positive")
            out["limit"] = min(n, 100)
        elif k == "sort":
            field, way = (v[1:], "desc") if v.startswith("-") else (v, "asc")
            if field not in sortable:
                raise ValueError("cannot sort by " + field)
            out["sort"] = (field, way)
        elif k in filterable:
            out["filters"][k] = v
        else:
            raise ValueError("unknown filter " + k)
    return out`, 'O(params)', 'Whitelist what comes in. Never pass a client\'s field names straight to your database.',
  [['list_params({}, [], [])', '{"filters": {}, "sort": None, "limit": 20}'], ['list_params({"status": "open", "sort": "-created", "limit": "50"}, ["status"], ["created"])', '{"filters": {"status": "open"}, "sort": ("created", "desc"), "limit": 50}'], ['list_params({"limit": "5000"}, [], [])["limit"]', '100'], ['list_params({"sort": "name"}, [], ["name"])["sort"]', '("name", "asc")'], ['_bad({"x": "1"})', 'True', 'def _bad(q):\n    try:\n        list_params(q, ["a"], ["b"])\n    except ValueError:\n        return True\n    return False'], ['_bad({"sort": "password"})', 'True', 'def _bad(q):\n    try:\n        list_params(q, ["a"], ["b"])\n    except ValueError:\n        return True\n    return False'], ['_bad({"limit": "0"})', 'True', 'def _bad(q):\n    try:\n        list_params(q, ["a"], ["b"])\n    except ValueError:\n        return True\n    return False'], ['_bad({"limit": "x"})', 'True', 'def _bad(q):\n    try:\n        list_params(q, ["a"], ["b"])\n    except ValueError:\n        return True\n    return False']], [['{"sort": "-created", "limit": "50"}, [], ["created"]', '{"filters": {}, "sort": ("created", "desc"), "limit": 50}']]),
p('if-match', 'Don\'t overwrite their work', 'Medium', 12, '<code>update(store, key, data, if_match)</code>. <code>store</code> maps key to <code>{"version": n, "data": ...}</code>. Return a status code: 404 if the key is missing, 428 if <code>if_match</code> is <code>None</code>, 412 if it doesn\'t equal the current version, otherwise save the new data, add 1 to the version, and return 200. Failed updates must change nothing.', 'def update(store, key, data, if_match):\n    ',
  ['Write the failures first. What order should they go in?'],
  R`def update(store, key, data, if_match):
    item = store.get(key)
    if item is None:
        return 404
    if if_match is None:
        return 428
    if if_match != item["version"]:
        return 412
    item["data"] = data
    item["version"] += 1
    return 200`, 'O(1)', 'Optimistic concurrency: no locks, just "only if nothing changed since I looked".',
  [['(update(s, "a", 2, 1), s["a"])', '(200, {"version": 2, "data": 2})', 's = {"a": {"version": 1, "data": 1}}'], ['(update(s, "a", 2, 9), s["a"]["data"])', '(412, 1)', 's = {"a": {"version": 1, "data": 1}}'], ['update({}, "a", 2, 1)', '404'], ['(update(s, "a", 2, None), s["a"]["data"])', '(428, 1)', 's = {"a": {"version": 1, "data": 1}}']], [['{"a": {"version": 1, "data": 1}}, "a", 2, 1', '200']])
], boss:
p('webhook-verify', 'Trust this webhook?', 'Medium', 18, '<code>verify(secret, body, timestamp, signature, now, tolerance=300)</code>. <code>secret</code> and <code>body</code> are bytes. The expected signature is the HMAC-SHA256 hex digest of <code>timestamp</code> as text, then a <code>.</code>, then the body. Return <code>True</code> only if the signature matches and the timestamp is within <code>tolerance</code> seconds of <code>now</code>, in either direction. Compare signatures with a method that takes the same time whether or not they match.', 'import hashlib, hmac\n\ndef verify(secret, body, timestamp, signature, now, tolerance=300):\n    ', [],
  R`import hashlib, hmac

def verify(secret, body, timestamp, signature, now, tolerance=300):
    if abs(now - timestamp) > tolerance:
        return False
    want = hmac.new(secret, str(timestamp).encode() + b"." + body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(want, signature)`, 'O(body)', 'Signing the timestamp stops replays. A plain == can leak how many characters matched.',
  [['verify(b"k", b"hi", 1000, _sig(b"k", b"hi", 1000), 1010)', 'True', 'import hashlib, hmac\ndef _sig(k, b, t):\n    return hmac.new(k, str(t).encode() + b"." + b, hashlib.sha256).hexdigest()'], ['verify(b"k", b"tampered", 1000, _sig(b"k", b"hi", 1000), 1010)', 'False', 'import hashlib, hmac\ndef _sig(k, b, t):\n    return hmac.new(k, str(t).encode() + b"." + b, hashlib.sha256).hexdigest()'], ['verify(b"other", b"hi", 1000, _sig(b"k", b"hi", 1000), 1010)', 'False', 'import hashlib, hmac\ndef _sig(k, b, t):\n    return hmac.new(k, str(t).encode() + b"." + b, hashlib.sha256).hexdigest()'], ['verify(b"k", b"hi", 1000, _sig(b"k", b"hi", 1000), 2000)', 'False', 'import hashlib, hmac\ndef _sig(k, b, t):\n    return hmac.new(k, str(t).encode() + b"." + b, hashlib.sha256).hexdigest()'], ['verify(b"k", b"hi", 2000, _sig(b"k", b"hi", 2000), 1000)', 'False', 'import hashlib, hmac\ndef _sig(k, b, t):\n    return hmac.new(k, str(t).encode() + b"." + b, hashlib.sha256).hexdigest()'], ['verify(b"k", b"hi", 1000, _sig(b"k", b"hi", 1000), 1300)', 'True', 'import hashlib, hmac\ndef _sig(k, b, t):\n    return hmac.new(k, str(t).encode() + b"." + b, hashlib.sha256).hexdigest()']], [['a body, its signature, and a recent timestamp', 'True']])
});

unit({ id: 'schema-design', phase: 5, title: 'Schemas that last', mins: 8, read: [
`<p class="lede">Code can be rewritten in a week. Data lives for years. <b>A good schema makes wrong data impossible to store,</b> and a good migration changes it while the app keeps running.</p>
<h2>Each fact in one place</h2>`,
fig(D.grid([['order', 'who', 'city'], ['1', 'sam', 'Ilam'], ['2', 'sam', 'Ilam'], ['3', 'ana', 'Dang']], { x: 20, y: 20, s: 58 }) + D.t(20, 12, 'sam moves: fix every row', { cls: 'r', size: 14 }) + D.arrow(210, 90, 290, 90) + D.grid([['id', 'name', 'city'], ['1', 'sam', 'Ilam'], ['2', 'ana', 'Dang']], { x: 310, y: 20, s: 58 }) + D.grid([['order', 'cust'], ['1', '1'], ['2', '1'], ['3', '2']], { x: 530, y: 20, s: 58 }) + D.t(310, 12, 'one place to change', { cls: 'g', size: 14 }), 260),
`<p>This is <b>normalization</b>. Copy data on purpose only when reads are measurably too slow, and know that you're now responsible for keeping the copies in step.</p>
<h2>Let the database say no</h2><table><tr><th>Constraint</th><th>What it stops</th></tr><tr><td><code>NOT NULL</code></td><td>Missing values</td></tr><tr><td><code>UNIQUE</code></td><td>Duplicates, even with two requests racing</td></tr><tr><td><code>FOREIGN KEY</code></td><td>Orders pointing to customers who don't exist</td></tr><tr><td><code>CHECK</code></td><td>Negative prices, invalid statuses</td></tr></table>
<p>App checks give nice messages. Constraints give guarantees. You want both.</p>
<h2>Which index?</h2><p>A composite index on <code>(user_id, created_at)</code> works like a phone book sorted by surname, then first name. It helps "this user's orders by date", but not "all orders by date". Put what you filter by exactly first. Every index also slows writes, so add them for real queries.</p>
<h2>Changing a live database: expand, then contract</h2>`,
steps([
  { n: 'Expand: add the new column. Old code ignores it, so nothing breaks.', d: D.flow({ a: [20, 30, 150, 54, 'name', 'y'], b: [190, 30, 150, 54, 'full_name (new)', 'g'] }) },
  { n: 'Deploy code that writes to both, and copy over the old rows in small batches.', d: D.flow({ a: [20, 30, 150, 54, 'name', 'y'], b: [190, 30, 150, 54, 'full_name', 'g'] }, [['a', 'b', 'copy']]) },
  { n: 'Deploy code that reads only the new column.', d: D.flow({ a: [20, 30, 150, 54, 'name (unused)'], b: [190, 30, 150, 54, 'full_name', 'g'] }) },
  { n: 'Contract: only when nothing uses it, drop the old column. Each step could be rolled back on its own, right up until this one.', d: D.flow({ b: [190, 30, 150, 54, 'full_name', 'g'] }) }
], 110),
`<p>Why so careful? During a deploy, old and new code run <b>at the same time</b>. And a big table can be locked for a long time by a careless schema change.</p>`,
think('Why keep money as whole cents in an integer, rather than as a float?', '0.1 + 0.2 isn\'t exactly 0.3 in floating point, and those tiny errors add up on real money. Use integer cents, or a DECIMAL type.')
], core: [
p('shop-schema', 'Make bad data impossible', 'Medium', 18, '<code>create_schema(db)</code> creates two tables in a SQLite database. <code>users(id INTEGER PRIMARY KEY, email)</code>, where email is required and unique. <code>orders(id INTEGER PRIMARY KEY, user_id, cents)</code>, where user_id is required and must reference a user, and cents is required and must be at least 0. Deleting a user deletes their orders. Foreign keys are already switched on.', 'import sqlite3\n\ndef create_schema(db):\n    ',
  ['Which constraint keyword goes with each rule in the description?', 'What do you add to a foreign key so that deleting a user takes their orders too?'],
  R`import sqlite3

def create_schema(db):
    db.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE)")
    db.execute("""CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cents INTEGER NOT NULL CHECK (cents >= 0))""")`, 'O(1)', 'Every rule the database enforces is a bug you can\'t ship.',
  [['_bad("INSERT INTO users(email) VALUES (\'a\')")', 'True', SQL + 'create_schema(db)\ndb.execute("INSERT INTO users(email) VALUES (\'a\')")\ndef _bad(q):\n    try:\n        db.execute(q)\n    except sqlite3.IntegrityError:\n        return True\n    return False'], ['_bad("INSERT INTO users(email) VALUES (NULL)")', 'True', SQL + 'create_schema(db)\ndef _bad(q):\n    try:\n        db.execute(q)\n    except sqlite3.IntegrityError:\n        return True\n    return False'], ['_bad("INSERT INTO orders(user_id, cents) VALUES (99, 1)")', 'True', SQL + 'create_schema(db)\ndef _bad(q):\n    try:\n        db.execute(q)\n    except sqlite3.IntegrityError:\n        return True\n    return False'], ['_bad("INSERT INTO orders(user_id, cents) VALUES (1, -1)")', 'True', SQL + 'create_schema(db)\ndb.execute("INSERT INTO users(email) VALUES (\'a\')")\ndef _bad(q):\n    try:\n        db.execute(q)\n    except sqlite3.IntegrityError:\n        return True\n    return False'], ['db.execute("SELECT count(*) FROM orders").fetchone()[0]', '0', SQL + 'create_schema(db)\ndb.execute("INSERT INTO users(email) VALUES (\'a\')")\ndb.execute("INSERT INTO orders(user_id, cents) VALUES (1, 5)")\ndb.execute("DELETE FROM users")'], ['db.execute("SELECT cents FROM orders").fetchone()[0]', '0', SQL + 'create_schema(db)\ndb.execute("INSERT INTO users(email) VALUES (\'a\')")\ndb.execute("INSERT INTO orders(user_id, cents) VALUES (1, 0)")']]),
p('backfill', 'Split the column', 'Medium', 15, 'Table <code>people(id, name)</code> holds full names, such as "Sam Rai". <code>expand(db)</code> adds columns <code>first</code> and <code>last</code>, and fills them, splitting at the first space. A name with no space gets an empty <code>last</code>. Running it a second time must do no harm. Keep <code>name</code>, since old code still reads it.', 'def expand(db):\n    ',
  ['What goes wrong the second time, if you just run ALTER TABLE?', 'How can you ask SQLite which columns a table has? Look up PRAGMA table_info.'],
  R`def expand(db):
    cols = [row[1] for row in db.execute("PRAGMA table_info(people)")]
    if "first" not in cols:
        db.execute("ALTER TABLE people ADD COLUMN first TEXT")
        db.execute("ALTER TABLE people ADD COLUMN last TEXT")
    for pid, name in db.execute("SELECT id, name FROM people WHERE first IS NULL").fetchall():
        a, _, b = name.partition(" ")
        db.execute("UPDATE people SET first = ?, last = ? WHERE id = ?", (a, b, pid))
    db.commit()`, 'O(rows)', 'Migrations should be safe to run twice: they fail halfway in real life, and get run again.',
  [['db.execute("SELECT first, last, name FROM people ORDER BY id").fetchall()', '[("Sam", "Rai", "Sam Rai"), ("Ana", "", "Ana"), ("Bo", "Lee Kim", "Bo Lee Kim")]', 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT)")\ndb.executemany("INSERT INTO people(name) VALUES (?)", [("Sam Rai",), ("Ana",), ("Bo Lee Kim",)])\nexpand(db)'], ['db.execute("SELECT first FROM people").fetchall()', '[("Sam",)]', 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT)")\ndb.execute("INSERT INTO people(name) VALUES (\'Sam Rai\')")\nexpand(db)\nexpand(db)'], ['db.execute("SELECT first FROM people WHERE id = 2").fetchone()', '("New",)', 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT)")\ndb.execute("INSERT INTO people(name) VALUES (\'Sam Rai\')")\nexpand(db)\ndb.execute("INSERT INTO people(name) VALUES (\'New Row\')")\nexpand(db)']], [['"Sam Rai"', 'first "Sam", last "Rai"']])
], boss:
p('migrator', 'A migration runner', 'Hard', 24, '<code>migrate(db, migrations)</code>: <code>migrations</code> is a list of <code>(number, [sql, ...])</code>, possibly out of order. Run each one not yet applied, lowest number first, recording it in a table <code>schema_migrations(number)</code> that you create if needed. Each migration runs in its own transaction: if a statement fails, that migration leaves no trace and the error goes out, while earlier migrations stay applied. Return the list of numbers applied by this call. Start a transaction with <code>db.execute("BEGIN")</code>.', 'def migrate(db, migrations):\n    ', [],
  R`def migrate(db, migrations):
    db.execute("CREATE TABLE IF NOT EXISTS schema_migrations (number INTEGER PRIMARY KEY)")
    db.commit()
    done = {row[0] for row in db.execute("SELECT number FROM schema_migrations")}
    applied = []
    for number, statements in sorted(migrations):
        if number in done:
            continue
        db.execute("BEGIN")
        try:
            for sql in statements:
                db.execute(sql)
            db.execute("INSERT INTO schema_migrations VALUES (?)", (number,))
            db.commit()
        except Exception:
            db.rollback()
            raise
        applied.append(number)
    return applied`, 'O(migrations)', 'The record of what ran has to be in the same transaction as the change itself.',
  [['migrate(db, [(2, ["CREATE TABLE b (x)"]), (1, ["CREATE TABLE a (x)"])])', '[1, 2]', 'import sqlite3\ndb = sqlite3.connect(":memory:")'], ['(migrate(db, m), migrate(db, m))', '([1], [])', 'import sqlite3\ndb = sqlite3.connect(":memory:")\nm = [(1, ["CREATE TABLE a (x)"])]'], ['_state()', '([1], ["a", "schema_migrations"], True)', 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndef _state():\n    hit = False\n    try:\n        migrate(db, [(1, ["CREATE TABLE a (x)"]), (2, ["CREATE TABLE b (x)", "NOT VALID SQL"])])\n    except sqlite3.Error:\n        hit = True\n    done = [r[0] for r in db.execute("SELECT number FROM schema_migrations")]\n    names = sorted(r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type = \'table\'"))\n    return done, names, hit'], ['migrate(db, [(1, ["CREATE TABLE a (x)"]), (2, ["CREATE TABLE b (x)"])])', '[2]', 'import sqlite3\ndb = sqlite3.connect(":memory:")\nmigrate(db, [(1, ["CREATE TABLE a (x)"])])']], [['[(2, [...]), (1, [...])]', '[1, 2]']])
});

unit({ id: 'web-security', phase: 5, title: 'How apps get hacked', mins: 9, read: [
`<p class="lede">Nearly every web attack has the same root: <b>your code treated someone's data as if it were instructions,</b> or trusted something it hadn't checked. You've already met SQL injection. Here are its cousins.</p>
<table><tr><th>Attack</th><th>What happens</th><th>The fix</th></tr>
<tr><td><b>SQL injection</b></td><td>Input becomes part of a query</td><td>Parameters, always</td></tr>
<tr><td><b>XSS</b></td><td>A comment containing <code>&lt;script&gt;</code> runs in other users' browsers</td><td>Escape on output. Frameworks do this if you don't turn it off</td></tr>
<tr><td><b>CSRF</b></td><td>Another site makes the browser send a request, with your cookies attached</td><td><code>SameSite</code> cookies, CSRF tokens</td></tr>
<tr><td><b>Broken access control</b></td><td><code>GET /invoices/7</code>, when 7 belongs to someone else</td><td>Check ownership on every request</td></tr>
<tr><td><b>Path traversal</b></td><td><code>?file=../../etc/passwd</code></td><td>Resolve the path, then check it's still inside your folder</td></tr>
<tr><td><b>SSRF</b></td><td>"Fetch this URL for me" gets aimed at your internal network</td><td>Block private addresses after resolving the name</td></tr>
<tr><td><b>Open redirect</b></td><td><code>?next=https://evil.com</code> uses your good name for phishing</td><td>Allow only your own paths and hosts</td></tr>
<tr><td><b>Leaked secrets</b></td><td>An API key committed to GitHub</td><td>Environment variables. If leaked, rotate it</td></tr></table>`,
steps([
  { n: 'XSS: an attacker saves a comment with a script inside.', d: D.flow({ a: [20, 30, 130, 54, 'attacker', 'r'], s: [290, 30, 150, 54, 'your database'] }, [['a', 's', 'comment']]) + D.t(165, 110, '<script>steal()</script>', { mono: 1, cls: 'r' }) },
  { n: 'Your page shows comments. If it pastes that text straight into the HTML, the browser runs it, with the victim\'s login.', d: D.flow({ s: [290, 30, 150, 54, 'your database'], v: [570, 30, 130, 54, 'victim', 'r'] }, [['s', 'v', 'page']]) + D.t(540, 110, 'the script runs here', { a: 'middle', cls: 'r' }) },
  { n: 'Escaped, the browser shows those characters as plain text. Same data, no longer instructions.', d: D.t(60, 50, '&lt;script&gt;steal()&lt;/script&gt;', { mono: 1, cls: 'g' }) + D.t(60, 90, 'shows as harmless text', { cls: 'g' }) }
], 130),
`<h2>Rules that prevent most of it</h2><ul><li>Decide what's allowed, and reject everything else. Lists of bad things are always incomplete.</li><li>Check on the server. Anything in the browser can be changed by the user.</li><li>Give each part only the access it needs.</li><li>Use well-known libraries for crypto and auth. Keep dependencies updated.</li></ul><p>The <b>OWASP Top 10</b> is the standard list to read next.</p>`,
think('Hiding the delete button for non-admins is your only protection. What can an attacker do?', 'Send the delete request directly with curl. The UI is only a convenience. The permission check must be on the server.')
], core: [
p('escape-html', 'Make it harmless', 'Easy', 8, '<code>escape_html(text)</code> replaces <code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>"</code> and <code>\'</code> with <code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;gt;</code>, <code>&amp;quot;</code> and <code>&amp;#x27;</code>. Don\'t use the <code>html</code> module.', 'def escape_html(text):\n    ',
  ['Does the order of the replacements matter? Try "<" and see what happens to the & it produces.'],
  R`def escape_html(text):
    for a, b in (("&", "&amp;"), ("<", "&lt;"), (">", "&gt;"), ('"', "&quot;"), ("'", "&#x27;")):
        text = text.replace(a, b)
    return text`, 'O(n)', 'The & must go first, or you\'ll escape your own escapes.',
  [['escape_html("<script>")', '"&lt;script&gt;"'], ['escape_html("a & b")', '"a &amp; b"'], ['escape_html("&lt;")', '"&amp;lt;"'], ['escape_html("say \\"hi\\" it\'s")', '"say &quot;hi&quot; it&#x27;s"'], ['escape_html("")', '""']], [['"<script>"', '"&lt;script&gt;"']]),
p('safe-path', 'Stay in the folder', 'Medium', 14, '<code>safe_path(base, user_path)</code> joins a user-supplied path to a base folder, and returns the clean full path, or <code>None</code> if it would escape the base. Use forward slashes. Use <code>posixpath</code>. Watch out for <code>..</code>, for absolute paths, and for a sibling folder like <code>/srv/files2</code>.', 'import posixpath\n\ndef safe_path(base, user_path):\n    ',
  ['What does posixpath.normpath do to "a/../../b"?', 'Why is checking startswith(base) alone not enough? Think about /srv/files2.'],
  R`import posixpath

def safe_path(base, user_path):
    full = posixpath.normpath(posixpath.join(base, user_path))
    if full == base or full.startswith(base + "/"):
        return full
    return None`, 'O(n)', 'Resolve first, check second. Checking the raw string for ".." misses tricks.',
  [['safe_path("/srv/files", "a/b.txt")', '"/srv/files/a/b.txt"'], ['safe_path("/srv/files", "../../etc/passwd")', 'None'], ['safe_path("/srv/files", "/etc/passwd")', 'None'], ['safe_path("/srv/files", "../files2/x")', 'None'], ['safe_path("/srv/files", "a/../b")', '"/srv/files/b"'], ['safe_path("/srv/files", "a/../../files/ok")', '"/srv/files/ok"']], [['"/srv/files", "../../etc/passwd"', 'None']])
], boss:
p('ssrf-guard', 'Don\'t fetch that', 'Hard', 22, '<code>ssrf_safe(url, resolve)</code> decides if your server may fetch a URL. <code>resolve(host)</code> returns a list of IP strings, possibly empty. Allow only <code>http</code> and <code>https</code> URLs with a host, where every address the host resolves to is public: at least one, and all of them <code>is_global</code> according to Python\'s <code>ipaddress</code> module. A host that is itself an IP address still goes through <code>resolve</code>. Use <code>urllib.parse.urlsplit</code>.', 'import ipaddress\nfrom urllib.parse import urlsplit\n\ndef ssrf_safe(url, resolve):\n    ', [],
  R`import ipaddress
from urllib.parse import urlsplit

def ssrf_safe(url, resolve):
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        return False
    ips = resolve(parts.hostname)
    return bool(ips) and all(ipaddress.ip_address(ip).is_global for ip in ips)`, 'O(addresses)', 'Check what a name resolves to, not how it looks. Harmless names can point inside your network, and one private address is enough.',
  [['ssrf_safe("https://shop.com/a", lambda h: ["93.184.216.34"])', 'True'], ['ssrf_safe("http://localhost/", lambda h: ["127.0.0.1"])', 'False'], ['ssrf_safe("http://meta/", lambda h: ["169.254.169.254"])', 'False'], ['ssrf_safe("http://inner/", lambda h: ["10.0.0.5"])', 'False'], ['ssrf_safe("ftp://shop.com/", lambda h: ["93.184.216.34"])', 'False'], ['ssrf_safe("file:///etc/passwd", lambda h: [])', 'False'], ['ssrf_safe("http://mixed/", lambda h: ["8.8.8.8", "192.168.1.1"])', 'False'], ['ssrf_safe("http://gone/", lambda h: [])', 'False'], ['ssrf_safe("https:///nohost", lambda h: ["8.8.8.8"])', 'False']], [['"http://localhost/", resolving to 127.0.0.1', 'False']])
});

unit({ id: 'async-loop', phase: 5, title: 'Async: one thread, many waits', mins: 8, read: [
`<p class="lede">A web server mostly waits, on databases and other services. Instead of one thread per request, <b>one thread can juggle thousands of requests,</b> as long as each one politely steps aside while it waits. That's <code>async</code>.</p>`,
steps([
  { n: 'Blocking: each wait holds everything up. Three 1-second calls take 3 seconds.', d: D.line(40, 40, 240, 40, 'thick r') + D.line(240, 70, 440, 70, 'thick b') + D.line(440, 100, 640, 100, 'thick g') + D.t(650, 106, '3 s', { cls: 'r' }) + D.t(40, 28, 'call A', { size: 14 }) + D.t(240, 58, 'call B', { size: 14 }) + D.t(440, 88, 'call C', { size: 14 }) },
  { n: 'Async: start one, step aside, start the next. They all wait at the same time, so it takes about 1 second.', d: D.line(40, 40, 240, 40, 'thick r') + D.line(44, 70, 244, 70, 'thick b') + D.line(48, 100, 248, 100, 'thick g') + D.t(260, 76, '1 s', { cls: 'g' }) + D.t(40, 28, 'call A', { size: 14 }) + D.t(44, 58, 'call B', { size: 14 }) + D.t(48, 88, 'call C', { size: 14 }) }
], 120),
`<h2>How it works</h2><p>Remember generators pausing at <code>yield</code>? An async function pauses at <code>await</code> the same way. An <b>event loop</b> keeps a list of paused tasks, wakes whichever is ready, and runs it until its next pause. In this unit you'll build one, since it's less code than you'd expect.</p>
<pre><code>async def fetch_all():
    a, b = await asyncio.gather(get_user(), get_orders())   # both at once</code></pre>
<h2>The trap</h2><p>Only one thing runs at a time. If a task does heavy maths, or calls something blocking like <code>time.sleep</code> or a normal database driver, <b>every request on the loop freezes.</b> Use async libraries, and push heavy work to another thread or process.</p>
<table><tr><th>Your work is</th><th>Use</th></tr><tr><td>Lots of waiting on the network</td><td>async, or threads</td></tr><tr><td>Heavy computing</td><td>Processes, or a background worker</td></tr><tr><td>Simple, low traffic</td><td>Normal code. Don't add async for its own sake</td></tr></table>
<p>Also limit how many things you start at once. Firing off 10,000 calls together can knock over whatever you're calling.</p>`,
think('Your async API is fast until one endpoint runs a 3-second calculation. Then all endpoints stall during it. Why, and what do you change?', 'One thread is doing the calculation and never reaches an await, so the loop can\'t run anything else. Move that work to a worker process or a background job.')
], core: [
p('mini-loop', 'Take turns at yield', 'Medium', 15, '<code>run_all(tasks)</code>: <code>tasks</code> is a list of <code>(name, generator)</code>. Run the first until it yields or finishes, then the next, and so on in turn. A finished task leaves the rotation. Return the names in the order they finished. A finished generator raises <code>StopIteration</code> from <code>next</code>.', 'def run_all(tasks):\n    ',
  ['You need something to hold whoever\'s turn is next. You\'ve used it in round-robin.', 'How do you notice that a task has finished?'],
  R`def run_all(tasks):
    q = deque(tasks)
    done = []
    while q:
        name, gen = q.popleft()
        try:
            next(gen)
            q.append((name, gen))
        except StopIteration:
            done.append(name)
    return done`, 'O(total yields)', 'That\'s an event loop at heart: a queue, and tasks that give way.',
  [['run_all([("a", _g(2)), ("b", _g(0)), ("c", _g(1))])', '["b", "c", "a"]', 'def _g(n):\n    for _ in range(n):\n        yield'], ['run_all([])', '[]'], ['log', '["a0", "b0", "a1", "b1"]', 'log = []\ndef _t(n):\n    for i in range(2):\n        log.append(n + str(i))\n        yield\nrun_all([("a", _t("a")), ("b", _t("b"))])']], [['tasks that yield 2, 0 and 1 times', '["b", "c", "a"]']]),
p('limited-calls', 'At most k at once', 'Medium', 16, '<code>total_time(durations, k)</code>: run calls with the given durations, in order, with at most k running at a time. Each starts as soon as a slot is free. Return when the last one finishes. This is what a semaphore does.', 'def total_time(durations, k):\n    ',
  ['When a slot is needed, which running call matters?', 'What structure always gives you the soonest finish time?'],
  R`def total_time(durations, k):
    running, end = [], 0
    for d in durations:
        start = heapq.heappop(running) if len(running) == k else 0
        finish = start + d
        heapq.heappush(running, finish)
        end = max(end, finish)
    return end`, 'O(n log k)', 'Simulate time by jumping between events, using a heap of finish times.',
  [['total_time([1, 1, 1], 3)', '1'], ['total_time([1, 1, 1], 1)', '3'], ['total_time([3, 1, 1, 1], 2)', '3'], ['total_time([], 2)', '0'], ['total_time([5, 2, 2, 2], 2)', '6']], [['[3, 1, 1, 1], 2', '3']])
], boss:
p('sleep-loop', 'An event loop with sleep', 'Hard', 26, '<code>simulate(tasks)</code>: <code>tasks</code> is a list of <code>(name, generator)</code>, and each generator yields a number of seconds to sleep. Time is simulated, starting at 0, so no real waiting. Start all tasks at time 0, in the given order. Whenever a task sleeps, wake it at the right time. Tasks waking at the same moment run in the order they went to sleep. Return a list of <code>(name, finish_time)</code>, in finishing order.', 'def simulate(tasks):\n    ', [],
  R`def simulate(tasks):
    h, order = [], 0
    for name, gen in tasks:
        h.append((0, order, name, gen))
        order += 1
    heapq.heapify(h)
    done = []
    while h:
        t, _, name, gen = heapq.heappop(h)
        try:
            wait = next(gen)
            heapq.heappush(h, (t + wait, order, name, gen))
            order += 1
        except StopIteration:
            done.append((name, t))
    return done`, 'O(events log tasks)', 'A heap keyed on wake time, with a counter to break ties. asyncio is this plus real network events.',
  [['simulate([("a", _s(2)), ("b", _s(1))])', '[("b", 1), ("a", 2)]', 'def _s(*waits):\n    for w in waits:\n        yield w'], ['simulate([("a", _s(1, 1)), ("b", _s(3))])', '[("a", 2), ("b", 3)]', 'def _s(*waits):\n    for w in waits:\n        yield w'], ['simulate([])', '[]'], ['simulate([("a", _s()), ("b", _s())])', '[("a", 0), ("b", 0)]', 'def _s(*waits):\n    for w in waits:\n        yield w'], ['simulate([("a", _s(1)), ("b", _s(1))])', '[("a", 1), ("b", 1)]', 'def _s(*waits):\n    for w in waits:\n        yield w'], ['simulate([("t" + str(i), _s(1, 1)) for i in range(2000)])[-1]', '("t1999", 2)', 'def _s(*waits):\n    for w in waits:\n        yield w']], [['a sleeps 2, b sleeps 1', '[("b", 1), ("a", 2)]']])
});

// System design pulls everything together, so it stays last in this phase.
UNITS.push(...UNITS.splice(UNITS.findIndex(u => u.id === 'system-design'), 1));
})();
