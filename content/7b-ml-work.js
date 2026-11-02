// What ML work needs beyond the core models: features, regularization, boosting, probability, retrieval and production.
(() => {
const p = (id, title, diff, time, desc, start, nudge, sol, big, idea, tests, ex) => ({ id, title, diff, time, desc: `<p>${desc}</p>`, start, nudge, sol, big, idea, tests, ex: ex || [] });
const NP = 'import numpy as np';

unitAfter('overfitting', { id: 'features', phase: 6, title: 'Getting data ready', mins: 8, read: [
`<p class="lede">On real projects, most of the work is before the model. Models only eat numbers, in tidy tables with nothing missing. <b>Better features nearly always beat a fancier model.</b></p>
<h2>Three everyday jobs</h2><table><tr><th>Problem</th><th>Usual fix</th></tr><tr><td>Missing values</td><td>Fill with the median or the mean, and often add a "was missing" column, since missing can itself mean something</td></tr><tr><td>Categories like "red"</td><td>One-hot: one 0-or-1 column per category. Numbering them 1, 2, 3 would invent an order that isn't there</td></tr><tr><td>Very different scales</td><td>Standardize: subtract the mean and divide by the spread, so age and income can be compared</td></tr></table>`,
fig(D.grid([['city'], ['Ilam'], ['Dang'], ['Ilam']], { x: 60, y: 20, s: 50 }) + D.arrow(150, 120, 260, 120) + D.grid([['Ilam', 'Dang'], ['1', '0'], ['0', '1'], ['1', '0']], { x: 290, y: 20, s: 50 }) + D.t(420, 125, 'one column per category', { cls: 'g' }), 240),
`<h2>The mistake that fools everyone: leakage</h2>`,
steps([
  { n: 'Wrong: work out the mean using all your data, then split. Your test set has now influenced your training.', d: D.flow({ a: [40, 30, 170, 54, 'all the data', 'r'], b: [290, 30, 170, 54, 'compute the mean'], c: [530, 30, 150, 54, 'then split'] }, [['a', 'b'], ['b', 'c']]) },
  { n: 'Right: split first. Learn every number from the training part only, and apply those same numbers to everything else.', d: D.flow({ a: [40, 30, 170, 54, 'split first', 'g'], b: [290, 30, 170, 54, 'fit on train'], c: [530, 30, 150, 54, 'apply to test'] }, [['a', 'b'], ['b', 'c']]) }
], 110),
`<p>A <b>pipeline</b> packages these steps as <code>fit</code> on training data, and <code>transform</code> on anything. It also means production applies exactly what training did: a mismatch there is one of the most common ML bugs. Other leaks: a feature only known <i>after</i> the event you're predicting, or testing on the past when you should test on the future.</p>`,
think('Your model predicts hospital readmission with 99% accuracy. One feature is "discharge follow-up notes length". What should worry you?', 'That feature may only exist after the outcome is known, or be a stand-in for it. Results that look too good usually are: suspect leakage first.')
], core: [
p('one-hot', 'One-hot, safely', 'Medium', 14, '<code>one_hot(train, test)</code>: both are lists of strings. Learn the categories from <code>train</code> only, sorted alphabetically. Return <code>(train_matrix, test_matrix)</code> as numpy arrays of 0.0 and 1.0, with one column per category. A test value not seen in training becomes all zeros.', 'import numpy as np\n\ndef one_hot(train, test):\n    ',
  ['Where do the columns come from, and what must never influence them?'],
  R`import numpy as np

def one_hot(train, test):
    cats = sorted(set(train))
    index = {c: i for i, c in enumerate(cats)}
    def encode(values):
        m = np.zeros((len(values), len(cats)))
        for r, v in enumerate(values):
            if v in index:
                m[r, index[v]] = 1.0
        return m
    return encode(train), encode(test)`, 'O(rows)', 'Columns are decided by training data. New categories in production must not crash anything.',
  [['one_hot(["b", "a"], ["a"])[0]', 'approx([[0, 1], [1, 0]])', NP], ['one_hot(["b", "a"], ["a"])[1]', 'approx([[1, 0]])', NP], ['one_hot(["a"], ["zzz"])[1]', 'approx([[0]])', NP], ['one_hot(["a", "a", "b"], [])[1].shape', '(0, 2)', NP]], [['["b", "a"], ["a"]', '[[0, 1], [1, 0]] and [[1, 0]]']])
], boss:
p('pipeline', 'A leak-proof pipeline', 'Hard', 24, 'Class <code>Scaler</code>. <code>fit(X)</code> takes a 2D numpy array that may contain <code>np.nan</code>, and learns each column\'s mean and standard deviation, ignoring NaNs. It returns self. <code>transform(X)</code> fills NaNs with the learned mean, subtracts the mean, and divides by the standard deviation. A column with zero spread is divided by 1, not 0. <code>transform</code> must use only what <code>fit</code> learned, and must not change its input.', 'import numpy as np\n\nclass Scaler:\n    def fit(self, X):\n        pass\n\n    def transform(self, X):\n        pass\n', [],
  R`import numpy as np

class Scaler:
    def fit(self, X):
        self.mean = np.nanmean(X, axis=0)
        std = np.nanstd(X, axis=0)
        self.std = np.where(std == 0, 1.0, std)
        return self

    def transform(self, X):
        filled = np.where(np.isnan(X), self.mean, X)
        return (filled - self.mean) / self.std`, 'O(rows * columns)', 'fit learns, and transform only applies. Keeping those apart is what prevents leakage.',
  [['Scaler().fit(np.array([[1.0], [3.0]])).transform(np.array([[1.0], [3.0]]))', 'approx([[-1.0], [1.0]])', NP], ['Scaler().fit(np.array([[1.0], [3.0]])).transform(np.array([[np.nan]]))', 'approx([[0.0]])', NP], ['Scaler().fit(np.array([[1.0], [np.nan], [3.0]])).mean', 'approx([2.0])', NP], ['Scaler().fit(np.array([[5.0], [5.0]])).transform(np.array([[7.0]]))', 'approx([[2.0]])', NP], ['Scaler().fit(np.array([[0.0], [2.0]])).transform(np.array([[100.0]]))', 'approx([[99.0]])', NP], ['bool(np.isnan(x).any())', 'True', NP + '\nx = np.array([[np.nan]])\nScaler().fit(np.array([[1.0]])).transform(x)']], [['fit [[1], [3]], then transform [[1], [3]]', '[[-1], [1]]']])
});

unitAfter('features', { id: 'regularization', phase: 6, title: 'Keeping models simple', mins: 7, read: [
`<p class="lede">A model with too much freedom memorizes noise. <b>Regularization charges it for complexity,</b> so it only gets complicated when the data truly justifies it.</p>`,
fig(D.plot({ x: 40, y: 15, w: 280, h: 150, xr: [0, 10], yr: [0, 10], pts: [[1, 2], [2, 3.4], [3, 2.8], [4, 5], [5, 4.4], [6, 6.5], [7, 5.8], [8, 7.6], [9, 7.2]], curve: [[1, 2], [2, 3.4], [3, 2.8], [4, 5], [5, 4.4], [6, 6.5], [7, 5.8], [8, 7.6], [9, 7.2]], lineCls: 'r' }) + D.t(170, 200, 'huge weights: chases every point', { a: 'middle', cls: 'r' }) + D.plot({ x: 420, y: 15, w: 260, h: 150, xr: [0, 10], yr: [0, 10], pts: [[1, 2], [2, 3.4], [3, 2.8], [4, 5], [5, 4.4], [6, 6.5], [7, 5.8], [8, 7.6], [9, 7.2]], curve: [[1, 2.2], [9, 7.6]], lineCls: 'g' }) + D.t(550, 200, 'small weights: the real trend', { a: 'middle', cls: 'g' }), 215),
`<h2>Add a price to the loss</h2><table><tr><th>Name</th><th>Loss becomes</th><th>Effect</th></tr><tr><td>Ridge (L2)</td><td>error + &lambda; &times; sum of squared weights</td><td>Shrinks all weights</td></tr><tr><td>Lasso (L1)</td><td>error + &lambda; &times; sum of absolute weights</td><td>Pushes many to exactly 0, which picks features</td></tr></table>
<p>&lambda; (lambda) sets the price. Too low and it overfits, too high and it underfits. <b>You choose it with a validation set,</b> never with the test set: the test set is used once, at the very end.</p>
<p>Features need similar scales first, or the penalty treats them unfairly. Neural networks use the same idea, plus <b>dropout</b> (randomly switching off neurons) and <b>early stopping</b> (stopping when validation error starts to rise).</p>`,
think('Training error is low, and validation error is much higher. Should you raise or lower lambda? What about when both are high?', 'Low training with high validation means overfitting, so raise lambda. Both high means underfitting, so lower lambda or add better features.')
], core: [
p('ridge', 'Ridge regression', 'Medium', 14, '<code>ridge(X, y, lam)</code> returns weights w that solve <code>(X<sup>T</sup>X + lam &times; I) w = X<sup>T</sup>y</code>, with X a 2D numpy array. Use <code>np.linalg.solve</code>. There\'s no separate bias term in this problem.', 'import numpy as np\n\ndef ridge(X, y, lam):\n    ',
  ['What shape should the identity matrix have? Look at how many columns X has.'],
  R`import numpy as np

def ridge(X, y, lam):
    n = X.shape[1]
    return np.linalg.solve(X.T @ X + lam * np.eye(n), X.T @ y)`, 'O(n^3) in the number of features', 'Adding lam to the diagonal shrinks the weights, and makes the system always solvable.',
  [['ridge(np.array([[1.0], [2.0]]), np.array([2.0, 4.0]), 0.0)', 'approx([2.0])', NP], ['ridge(np.array([[1.0], [2.0]]), np.array([2.0, 4.0]), 5.0)', 'approx([1.0])', NP], ['abs(ridge(X, y, 100.0)).sum() < abs(ridge(X, y, 0.01)).sum()', 'True', NP + '\nX = np.array([[1.0, 2.0], [2.0, 1.0], [3.0, 5.0]])\ny = np.array([1.0, 2.0, 3.0])'], ['ridge(np.array([[1.0, 1.0], [1.0, 1.0]]), np.array([1.0, 1.0]), 1.0).shape', '(2,)', NP]], [['[[1], [2]], [2, 4], 0', '[2]']])
], boss:
p('pick-lambda', 'Pick it honestly', 'Medium', 15, '<code>pick_lambda(X_train, y_train, X_val, y_val, lams, fit)</code>: for each value in <code>lams</code>, call <code>fit(X_train, y_train, lam)</code> to get weights, and measure mean squared error on the validation set. Predictions are <code>X @ w</code>. Return the lam with the lowest validation error. Ties go to the larger lam, the simpler model.', 'import numpy as np\n\ndef pick_lambda(X_train, y_train, X_val, y_val, lams, fit):\n    ', [],
  R`import numpy as np

def pick_lambda(X_train, y_train, X_val, y_val, lams, fit):
    best, best_err = None, float("inf")
    for lam in sorted(lams, reverse=True):
        w = fit(X_train, y_train, lam)
        err = np.mean((X_val @ w - y_val) ** 2)
        if err < best_err:
            best, best_err = lam, err
    return best`, 'O(lams * fit)', 'Tuning uses validation data. Train on one set, choose on another, report on a third.',
  [['pick_lambda(X, y, X, y, [0.0, 100.0], _f)', '0.0', NP + '\nX = np.array([[1.0], [2.0]])\ny = np.array([2.0, 4.0])\ndef _f(a, b, lam):\n    return np.linalg.solve(a.T @ a + lam * np.eye(a.shape[1]), a.T @ b)'], ['pick_lambda(X, y, X, y * 0, [0.0, 1000000.0], _f)', '1000000.0', NP + '\nX = np.array([[1.0], [2.0]])\ny = np.array([2.0, 4.0])\ndef _f(a, b, lam):\n    return np.linalg.solve(a.T @ a + lam * np.eye(a.shape[1]), a.T @ b)'], ['pick_lambda(X, y, X, y, [1.0, 2.0], lambda a, b, lam: np.array([1.0]))', '2.0', NP + '\nX = np.array([[1.0]])\ny = np.array([1.0])']], [['small lam when validation data fits', '0.0']])
});

unitAfter('logistic', { id: 'bayes', phase: 6, title: 'Probability and Bayes', mins: 8, read: [
`<p class="lede">A test is 99% accurate, and you tested positive. Are you probably sick? Most people say yes, and they're often wrong. <b>How common something is matters as much as how good the test is.</b></p>`,
steps([
  { n: 'Picture 1000 people, where 1% have the disease. That\'s 10 sick, and 990 healthy.', d: D.flow({ a: [40, 30, 190, 60, '10 sick', 'r'], b: [290, 30, 380, 60, '990 healthy', 'g'] }) },
  { n: 'The test catches 99% of the sick, so about 10 test positive. It wrongly flags 1% of the healthy: another 10.', d: D.flow({ a: [40, 30, 190, 60, '10 test positive', 'r'], b: [290, 30, 380, 60, '10 test positive by mistake', 'y'] }) },
  { n: 'Out of 20 positives, only 10 are really sick. A "99% accurate" test gives you a 50% chance.', d: D.t(40, 60, '10 / (10 + 10) = 50%', { size: 28, cls: 'r' }) }
], 110),
`<h2>Bayes' rule</h2><p>This counting is all that Bayes' rule says. Start with a belief, and update it with evidence:</p><pre><code>P(sick | positive) = P(positive | sick) * P(sick) / P(positive)</code></pre>
<p><b>Where you'll use it:</b> fraud and rare-event alerts (lots of false alarms unless the rate is considered), A/B test results, and reading any model's precision.</p>
<h2>Naive Bayes: a classifier from counting</h2><p>To sort spam, count how often each word appears in spam and in normal mail. For a new email, multiply the word probabilities for each class, along with how common that class is, and take the larger. It's "naive" since it pretends words are independent, which is false, yet it works surprisingly well as a fast baseline.</p>
<ul><li><b>Add-one smoothing:</b> a word never seen in spam would make the whole product zero, so start every count at 1.</li><li><b>Add logs:</b> multiplying many tiny numbers underflows to 0, and adding logs doesn't.</li></ul>`,
think('Your fraud model has 95% precision on a balanced test set. Fraud is 0.1% of real traffic. Should you expect 95% in production?', 'No. Precision depends on how common the positive class is. With far fewer real frauds, the same false-positive rate produces far more false alarms for each true catch. Test at realistic rates.')
], core: [
p('posterior', 'Really sick?', 'Easy', 8, '<code>posterior(prior, tpr, fpr)</code> returns the chance of really having the condition after a positive test. <code>prior</code> is how common it is, <code>tpr</code> the chance of a positive if you have it, and <code>fpr</code> the chance of a positive if you don\'t.', 'def posterior(prior, tpr, fpr):\n    ',
  ['Imagine 1000 people. How many are true positives, and how many false positives?'],
  R`def posterior(prior, tpr, fpr):
    return prior * tpr / (prior * tpr + (1 - prior) * fpr)`, 'O(1)', 'True positives divided by all positives.',
  [['posterior(0.01, 0.99, 0.01)', 'approx(0.5)'], ['posterior(0.5, 0.9, 0.1)', 'approx(0.9)'], ['posterior(0.001, 0.99, 0.01)', 'approx(0.0902, 1e-3)'], ['posterior(0.2, 1.0, 0.0)', 'approx(1.0)']], [['0.01, 0.99, 0.01', '0.5']])
], boss:
p('naive-bayes', 'A spam filter', 'Hard', 25, 'Class <code>NaiveBayes</code>. <code>fit(docs, labels)</code> takes lists of word lists and their labels, and returns self. <code>predict(words)</code> returns the label with the highest score: log(share of training docs with that label) plus, for each word in the known vocabulary, log((count of the word in that label + 1) / (total words in that label + vocabulary size)). Words never seen in training are skipped. Ties go to the alphabetically first label.', 'import math\n\nclass NaiveBayes:\n    def fit(self, docs, labels):\n        pass\n\n    def predict(self, words):\n        pass\n', [],
  R`import math

class NaiveBayes:
    def fit(self, docs, labels):
        self.counts = {}
        self.totals = Counter()
        self.docs = Counter(labels)
        self.n = len(labels)
        self.vocab = set()
        for words, label in zip(docs, labels):
            c = self.counts.setdefault(label, Counter())
            c.update(words)
            self.totals[label] += len(words)
            self.vocab.update(words)
        return self

    def predict(self, words):
        def score(label):
            s = math.log(self.docs[label] / self.n)
            for w in words:
                if w in self.vocab:
                    s += math.log((self.counts[label][w] + 1) / (self.totals[label] + len(self.vocab)))
            return s
        return max(sorted(self.docs), key=score)`, 'O(words) per prediction', 'Counting plus logs plus smoothing: a real, fast baseline. Beat it before you reach for anything fancier.',
  [['m.predict(["win", "cash"])', '"spam"', 'm = NaiveBayes().fit([["win", "cash", "now"], ["cash", "prize"], ["meeting", "at", "noon"], ["lunch", "at", "noon"]], ["spam", "spam", "ham", "ham"])'], ['m.predict(["lunch", "meeting"])', '"ham"', 'm = NaiveBayes().fit([["win", "cash", "now"], ["cash", "prize"], ["meeting", "at", "noon"], ["lunch", "at", "noon"]], ["spam", "spam", "ham", "ham"])'], ['m.predict(["unknownword"])', '"b"', 'm = NaiveBayes().fit([["x"], ["y"], ["z"]], ["a", "b", "b"])'], ['m.predict([])', '"a"', 'm = NaiveBayes().fit([["x"], ["y"]], ["b", "a"])'], ['m.predict(["x"])', '"s"', 'm = NaiveBayes().fit([["x", "x"], ["y"]], ["s", "h"])']], [['fit on spam and ham, then ["win", "cash"]', '"spam"']])
});

unitAfter('trees-ensembles', { id: 'boosting', phase: 6, title: 'Forests and boosting', mins: 8, read: [
`<p class="lede">One decision tree overfits easily. Many trees together are among the best models for tables of data. <b>On spreadsheet-like data at work, try these before neural networks.</b></p>
<h2>Two ways to combine trees</h2>`,
fig(D.flow({ a: [30, 14, 120, 40, 'tree 1'], b: [30, 62, 120, 40, 'tree 2'], c: [30, 110, 120, 40, 'tree 3'], v: [230, 62, 110, 40, 'vote', 'g'] }, [['a', 'v'], ['b', 'v'], ['c', 'v']]) + D.t(185, 176, 'Forest: separate trees, then vote', { a: 'middle', cls: 'soft' }) + D.flow({ d: [400, 62, 80, 40, 'tree 1'], e: [510, 62, 80, 40, 'tree 2', 'y'], f: [620, 62, 80, 40, 'tree 3', 'y'] }, [['d', 'e'], ['e', 'f']]) + D.t(550, 176, 'Boosting: each fixes the last one\'s errors', { a: 'middle', cls: 'soft' }), 190),
`<table><tr><th></th><th>Random forest</th><th>Gradient boosting</th></tr><tr><td>Reduces</td><td>Overfitting, by averaging</td><td>Errors, step by step</td></tr><tr><td>Tuning</td><td>Works well as is</td><td>Needs care, but often wins</td></tr><tr><td>Tools</td><td><code>scikit-learn</code></td><td><code>XGBoost</code>, <code>LightGBM</code></td></tr></table>
<h2>How boosting learns</h2>`,
steps([
  { n: 'Start with a dumb guess: the average of all answers.', d: D.plot({ x: 60, y: 10, w: 300, h: 130, xr: [0, 10], yr: [0, 10], pts: [[1, 2], [3, 3], [5, 7], [7, 8], [9, 8]], curve: [[0, 5.6], [10, 5.6]], lineCls: 'b' }) + D.t(400, 70, 'guess = average', { cls: 'b' }) },
  { n: 'Work out the errors, also called residuals. A small tree learns to predict those errors, not the original answers.', d: D.plot({ x: 60, y: 10, w: 300, h: 130, xr: [0, 10], yr: [0, 10], pts: [[1, 2], [3, 3], [5, 7], [7, 8], [9, 8]], curve: [[0, 5.6], [10, 5.6]], lineCls: 'b' }) + D.t(400, 50, 'left side: too high', { cls: 'r' }) + D.t(400, 90, 'right side: too low', { cls: 'g' }) },
  { n: 'Add a fraction of that tree to your guess. Repeat many times, and it improves a little each time. The fraction is the learning rate.', d: D.plot({ x: 60, y: 10, w: 300, h: 130, xr: [0, 10], yr: [0, 10], pts: [[1, 2], [3, 3], [5, 7], [7, 8], [9, 8]], curve: [[0, 3.2], [4, 3.2], [4, 7.4], [10, 7.4]], lineCls: 'g' }) + D.t(400, 70, 'better after a step', { cls: 'g' }) }
], 165),
`<p>Too many rounds can overfit, so watch your validation error and stop when it rises.</p>`,
think('Why use a small learning rate and many rounds instead of big, confident steps?', 'Small steps stop any one tree from overreacting to noise. Each tree only nudges the answer, which generalizes better, at the price of more compute.')
], core: [
p('best-stump', 'The best single split', 'Medium', 18, '<code>best_stump(x, y)</code>: for 1D numpy arrays, find a threshold t. Points with <code>x &lt;= t</code> get the mean of their y values, and the others get the mean of theirs. Choose t from the values in x that leave both sides non-empty, minimizing total squared error, with ties going to the smallest t. Return <code>(t, left_mean, right_mean)</code>. If no split exists, return <code>(None, mean, mean)</code>.', 'import numpy as np\n\ndef best_stump(x, y):\n    ',
  ['Which thresholds are worth trying?', 'What must be true of a threshold so that neither side is empty?'],
  R`import numpy as np

def best_stump(x, y):
    best = (float("inf"), None, y.mean(), y.mean())
    for t in np.unique(x)[:-1]:
        left, right = y[x <= t], y[x > t]
        err = ((left - left.mean()) ** 2).sum() + ((right - right.mean()) ** 2).sum()
        if err < best[0] - 1e-12:
            best = (err, float(t), left.mean(), right.mean())
    return best[1:]`, 'O(n^2) as written; O(n log n) with sorting', 'A tree with one question: the building block of boosting.',
  [['best_stump(np.array([1.0, 2.0, 3.0, 4.0]), np.array([0.0, 0.0, 10.0, 10.0]))', '(2.0, 0.0, 10.0)', NP], ['best_stump(np.array([5.0, 5.0]), np.array([1.0, 3.0]))', '(None, 2.0, 2.0)', NP], ['best_stump(np.array([3.0, 1.0, 2.0]), np.array([9.0, 1.0, 1.0]))', '(2.0, 1.0, 9.0)', NP]], [['[1, 2, 3, 4], [0, 0, 10, 10]', '(2, 0, 10)']])
], boss:
p('gradient-boost', 'Gradient boosting', 'Hard', 28, 'Class <code>Boost(rounds, lr)</code> for 1D regression. <code>fit(x, y)</code> starts from the mean of y, then each round fits a stump to the current residuals and adds <code>lr</code> times its output to the predictions. It returns self. <code>predict(x)</code> returns the predictions for a numpy array. A helper <code>stump(x, r)</code> is provided: it returns <code>(t, left, right)</code>, with t possibly <code>None</code>. Stop early if t is <code>None</code>. Points with <code>x &lt;= t</code> get <code>left</code>.', 'import numpy as np\n\ndef stump(x, r):\n    best = (float("inf"), None, r.mean(), r.mean())\n    for t in np.unique(x)[:-1]:\n        a, b = r[x <= t], r[x > t]\n        e = ((a - a.mean()) ** 2).sum() + ((b - b.mean()) ** 2).sum()\n        if e < best[0]:\n            best = (e, float(t), a.mean(), b.mean())\n    return best[1:]\n\nclass Boost:\n    def __init__(self, rounds, lr):\n        pass\n\n    def fit(self, x, y):\n        pass\n\n    def predict(self, x):\n        pass\n', [],
  R`import numpy as np

def stump(x, r):
    best = (float("inf"), None, r.mean(), r.mean())
    for t in np.unique(x)[:-1]:
        a, b = r[x <= t], r[x > t]
        e = ((a - a.mean()) ** 2).sum() + ((b - b.mean()) ** 2).sum()
        if e < best[0]:
            best = (e, float(t), a.mean(), b.mean())
    return best[1:]

class Boost:
    def __init__(self, rounds, lr):
        self.rounds, self.lr = rounds, lr

    def fit(self, x, y):
        self.base = y.mean()
        self.parts = []
        pred = np.full(len(y), self.base)
        for _ in range(self.rounds):
            t, a, b = stump(x, y - pred)
            if t is None:
                break
            self.parts.append((t, a, b))
            pred = pred + self.lr * np.where(x <= t, a, b)
        return self

    def predict(self, x):
        pred = np.full(len(x), self.base)
        for t, a, b in self.parts:
            pred = pred + self.lr * np.where(x <= t, a, b)
        return pred`, 'O(rounds * stump cost)', 'Each round fits what\'s left over. That is the whole algorithm, and XGBoost is this with better trees.',
  [['Boost(0, 0.1).fit(x, y).predict(x)', 'approx([2.5, 2.5, 2.5, 2.5])', NP + '\nx = np.array([1.0, 2.0, 3.0, 4.0])\ny = np.array([1.0, 2.0, 3.0, 4.0])'], ['((Boost(50, 0.3).fit(x, y).predict(x) - y) ** 2).mean() < 0.05', 'True', NP + '\nx = np.array([1.0, 2.0, 3.0, 4.0])\ny = np.array([1.0, 2.0, 3.0, 4.0])'], ['_e(100) < _e(5) < _e(1)', 'True', NP + '\nx = np.arange(20.0)\ny = np.sin(x / 3)\ndef _e(n):\n    return ((Boost(n, 0.2).fit(x, y).predict(x) - y) ** 2).mean()'], ['Boost(5, 0.5).fit(x, y).predict(x)', 'approx([3.0, 3.0])', NP + '\nx = np.array([1.0, 1.0])\ny = np.array([2.0, 4.0])'], ['Boost(30, 0.5).fit(x, y).predict(np.array([0.0, 99.0]))', 'approx([0.0, 10.0], 0.01)', NP + '\nx = np.array([1.0, 2.0])\ny = np.array([0.0, 10.0])']], [['Boost(50, 0.3) on a straight line', 'small error']])
});

unit({ id: 'retrieval', phase: 6, title: 'Search and RAG', mins: 9, read: [
`<p class="lede">Most AI features at work follow one pattern: <b>find the right documents, and give them to a language model.</b> This is RAG, retrieval-augmented generation. The model gets the headlines, but <b>most of the failures happen in the retrieval.</b></p>`,
steps([
  { n: 'Before anything is asked, split your documents into chunks, and index them.', d: D.flow({ a: [20, 30, 130, 54, 'documents'], b: [190, 30, 130, 54, 'chunks', 'y'], c: [360, 30, 130, 54, 'index'] }, [['a', 'b'], ['b', 'c']]) },
  { n: 'A question comes in. Find the few best chunks, using keywords, embeddings, or both.', d: D.flow({ q: [20, 30, 130, 54, 'question', 'b'], c: [190, 30, 130, 54, 'index'], t: [360, 30, 130, 54, 'top chunks', 'g'] }, [['q', 'c'], ['c', 't']]) },
  { n: 'Send the question and those chunks to the model, telling it to answer only from them and to cite them.', d: D.flow({ t: [20, 30, 130, 54, 'top chunks', 'g'], m: [190, 30, 130, 54, 'model', 'y'], a: [360, 30, 170, 54, 'answer + sources'] }, [['t', 'm'], ['m', 'a']]) }
], 110),
`<h2>Chunking</h2><p>Too large and matches are vague, and you waste the model's attention. Too small and the meaning gets split apart. Overlap between chunks keeps sentences at the edges from being cut in half.</p>
<h2>Keywords and meaning</h2><table><tr><th></th><th>BM25 (keywords)</th><th>Embeddings (meaning)</th></tr><tr><td>Strong at</td><td>Exact terms, codes, names</td><td>Same idea in different words</td></tr><tr><td>Weak at</td><td>Synonyms</td><td>Exact IDs like <code>ERR-4021</code></td></tr></table>
<p><b>Hybrid search</b> runs both and merges the rankings. A simple method is <b>reciprocal rank fusion</b>: each list gives a document <code>1 / (60 + rank)</code>, and you add these up.</p>
<h2>Measure it, or you're guessing</h2><p>Build a small set of real questions with their right documents. <b>Recall@k</b> asks if the right document was in the top k. If retrieval fails, no model can save the answer, so test retrieval separately from generation.</p>
<p>Also remember: text inside retrieved documents can try to give the model instructions, which is called prompt injection. Treat it as data, and never let it trigger actions unchecked.</p>`,
think('Users complain about wrong answers. Where do you look first, and how do you tell which part failed?', 'Look at what was retrieved for those questions. If the right chunk wasn\'t there, it\'s a retrieval problem: chunking, search or metadata. If it was there and the answer is still wrong, then look at the prompt or the model.')
], core: [
p('chunk-text', 'Chunk with overlap', 'Easy', 10, '<code>chunk(words, size, overlap)</code> splits a list of words into lists of up to <code>size</code> words, each starting <code>size - overlap</code> words after the last. Stop once a chunk has reached the end. Empty input gives <code>[]</code>.', 'def chunk(words, size, overlap):\n    ',
  ['How far does each chunk\'s start move along?', 'What makes you stop, without leaving a tiny duplicate chunk at the end?'],
  R`def chunk(words, size, overlap):
    out, step = [], size - overlap
    for start in range(0, len(words), step):
        out.append(words[start:start + size])
        if start + size >= len(words):
            break
    return out`, 'O(n)', 'Overlap protects whatever falls on a boundary.',
  [['chunk(list("abcde"), 2, 0)', '[["a", "b"], ["c", "d"], ["e"]]'], ['chunk(list("abcde"), 3, 1)', '[["a", "b", "c"], ["c", "d", "e"]]'], ['chunk([], 3, 1)', '[]'], ['chunk(list("ab"), 5, 2)', '[["a", "b"]]'], ['chunk(list("abcd"), 2, 1)', '[["a", "b"], ["b", "c"], ["c", "d"]]']], [['"abcde", 3, 1', '[abc, cde]']]),
p('rrf', 'Merge two rankings', 'Medium', 12, '<code>fuse(rankings, k=60)</code>: <code>rankings</code> is a list of ranked lists of ids, best first. Each list gives an id a score of <code>1 / (k + rank)</code>, with rank starting at 1, and scores add up. Return all ids, highest score first, with ties in alphabetical order.', 'def fuse(rankings, k=60):\n    ',
  ['Why might this beat adding raw scores from the two systems? What\'s the data structure for adding up per id?'],
  R`def fuse(rankings, k=60):
    score = defaultdict(float)
    for ranking in rankings:
        for rank, doc in enumerate(ranking, 1):
            score[doc] += 1 / (k + rank)
    return sorted(score, key=lambda d: (-score[d], d))`, 'O(total items log items)', 'Merging by rank avoids comparing scores that were never on the same scale.',
  [['fuse([["a", "b"], ["b", "a"]])', '["a", "b"]'], ['fuse([["a", "b", "c"], ["b", "c", "a"]])', '["b", "a", "c"]'], ['fuse([])', '[]'], ['fuse([["x"], ["y"]])', '["x", "y"]'], ['fuse([["a", "b"], ["b"]], k=1)', '["b", "a"]']], [['[["a", "b", "c"], ["b", "c", "a"]]', '["b", "a", "c"]']])
], boss:
p('bm25', 'BM25 search', 'Hard', 26, 'Class <code>BM25(docs, k1=1.5, b=0.75)</code>, where docs is a list of word lists. <code>search(query, n)</code> returns the indexes of the top n docs with a score above 0, best first, with ties to the lower index. The score sums, for each query word q: <code>idf(q) * f * (k1 + 1) / (f + k1 * (1 - b + b * len(doc) / avg_len))</code>, where f is how often q appears in the doc, and <code>idf(q) = log(1 + (N - n_q + 0.5) / (n_q + 0.5))</code>, where N is the number of docs and n_q how many contain q.', 'import math\n\nclass BM25:\n    def __init__(self, docs, k1=1.5, b=0.75):\n        pass\n\n    def search(self, query, n):\n        pass\n', [],
  R`import math

class BM25:
    def __init__(self, docs, k1=1.5, b=0.75):
        self.k1, self.b = k1, b
        self.freqs = [Counter(d) for d in docs]
        self.lens = [len(d) for d in docs]
        self.N = len(docs)
        self.avg = sum(self.lens) / self.N if self.N else 0
        self.df = Counter(w for d in docs for w in set(d))

    def search(self, query, n):
        scores = []
        for i, f in enumerate(self.freqs):
            s = 0.0
            for q in query:
                if f[q]:
                    idf = math.log(1 + (self.N - self.df[q] + 0.5) / (self.df[q] + 0.5))
                    s += idf * f[q] * (self.k1 + 1) / (f[q] + self.k1 * (1 - self.b + self.b * self.lens[i] / self.avg))
            if s > 0:
                scores.append((-s, i))
        return [i for _, i in sorted(scores)[:n]]`, 'O(docs * query) as written; real engines use an inverted index', 'Rare words count more. Repeats help less and less. Long documents get marked down.',
  [['BM25(D).search(["cat"], 5)', '[0, 2]', 'D = [["cat", "sat"], ["dog", "ran"], ["cat", "cat", "ran", "far", "away", "now"]]'], ['BM25(D).search(["ran", "dog"], 1)', '[1]', 'D = [["cat", "sat"], ["dog", "ran"], ["cat", "cat", "ran", "far", "away", "now"]]'], ['BM25(D).search(["zebra"], 3)', '[]', 'D = [["cat", "sat"], ["dog", "ran"]]'], ['BM25([]).search(["a"], 3)', '[]'], ['BM25(D).search(["a"], 2)', '[0, 1]', 'D = [["a"], ["a"], ["a"]]'], ['BM25(D).search(["rare", "common"], 1)', '[1]', 'D = [["common", "x"], ["rare", "x"], ["common", "y"], ["common", "z"]]']], [['search(["cat"], 5)', 'matching doc indexes, best first']])
});

unit({ id: 'ml-production', phase: 6, title: 'Models in the real world', mins: 7, read: [
`<p class="lede">A model isn't finished when it's accurate. It's finished when it's useful, and stays useful. <b>The world changes while your model stays frozen.</b></p>
<h2>A checklist for any ML project</h2><ol><li><b>A baseline first.</b> Predict the average, or a simple rule. Many projects never beat it by enough to matter.</li><li><b>The business metric.</b> What does a false alarm cost, compared to a miss? This sets your threshold.</li><li><b>Split like reality.</b> If you predict the future, train on the past and test on later data.</li><li><b>Look at the errors.</b> Read real wrong predictions. You'll learn more from 50 of them than from any chart.</li></ol>
<h2>Picking a threshold</h2><p>A model gives scores, but a decision needs a cut-off. Choose it from costs, using validation data: "highest recall, while keeping precision at least 90%" is a typical requirement.</p>
<h2>Drift</h2>`,
fig(D.bars([1, 3, 6, 3, 1], { x: 60, y: 130, w: 44, unit: 16, hl: { 2: 'b' } }) + D.t(170, 178, 'data at training time', { a: 'middle', cls: 'b' }) + D.arrow(310, 80, 390, 80) + D.bars([1, 1, 2, 4, 6], { x: 430, y: 130, w: 44, unit: 16, hl: { 4: 'r' } }) + D.t(540, 178, 'data this month', { a: 'middle', cls: 'r' }), 190),
`<p>Inputs shift (a new user group, a changed form), and so does what they mean (fraudsters adapt). Accuracy falls quietly, and true answers often arrive weeks later. So monitor what you can see right now: <b>your input distributions and your prediction rates.</b></p>
<p>A common measure is the <b>Population Stability Index</b>. It compares the share of data in each bin then and now. As a rough guide, below 0.1 is stable, and above 0.25 is worth investigating.</p>
<h2>Versioning</h2><p>Know exactly which code, data and settings made each model, and be able to roll back. Roll out gradually, comparing against the old model before switching everyone over.</p>`,
think('Your model\'s accuracy looks fine on every chart, yet the business says it\'s getting worse. How could both be true?', 'The labels might be delayed, so your charts show old performance. Or the metric might not match what matters: overall accuracy can stay high while the rare important class gets far worse. Slice metrics by segment.')
], core: [
p('pick-threshold', 'Choose the cut-off', 'Medium', 15, '<code>best_threshold(y, scores, min_precision)</code>: try each distinct score as a threshold, predicting positive when <code>score &gt;= t</code>. Among those with precision of at least <code>min_precision</code>, return the one with the highest recall, with ties going to the highest threshold. Return <code>None</code> if none qualify.', 'def best_threshold(y, scores, min_precision):\n    ',
  ['For one threshold, how do you work out true positives and false positives?', 'How do you express "highest recall, then highest threshold" as a single comparison?'],
  R`def best_threshold(y, scores, min_precision):
    positives = sum(y)
    best = None
    for t in set(scores):
        tp = sum(1 for a, s in zip(y, scores) if s >= t and a == 1)
        pp = sum(1 for s in scores if s >= t)
        if pp and tp / pp >= min_precision:
            recall = tp / positives if positives else 0
            if best is None or (recall, t) > best:
                best = (recall, t)
    return best[1] if best else None`, 'O(n^2) as written; O(n log n) by sorting scores', 'A threshold is a business decision that\'s made with data, not a model property.',
  [['best_threshold([1, 1, 0, 0], [0.9, 0.8, 0.3, 0.1], 1.0)', '0.8'], ['best_threshold([1, 0, 1, 0], [0.9, 0.8, 0.7, 0.1], 0.6)', '0.7'], ['best_threshold([0, 0], [0.5, 0.4], 0.5)', 'None'], ['best_threshold([1, 0, 1], [0.9, 0.95, 0.2], 0.5)', '0.2'], ['best_threshold([1], [0.5], 1.0)', '0.5']], [['[1, 1, 0, 0], [0.9, 0.8, 0.3, 0.1], 1.0', '0.8']])
], boss:
p('psi-drift', 'Spot the drift', 'Medium', 18, '<code>psi(expected, actual, bins=10)</code>, on 1D numpy arrays. Build bin edges from the percentiles of <code>expected</code>: <code>np.percentile(expected, np.linspace(0, 100, bins + 1))</code>, with the first edge set to minus infinity and the last to plus infinity. Work out each array\'s share per bin using <code>np.histogram</code>, and replace any share below 0.0001 with 0.0001. Return the sum of <code>(a - e) * ln(a / e)</code> across bins, as a float.', 'import numpy as np\n\ndef psi(expected, actual, bins=10):\n    ', [],
  R`import numpy as np

def psi(expected, actual, bins=10):
    edges = np.percentile(expected, np.linspace(0, 100, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.maximum(e, 0.0001), np.maximum(a, 0.0001)
    return float(np.sum((a - e) * np.log(a / e)))`, 'O(n log n)', 'Compare the shape of today\'s data with the training data. You don\'t need labels for this, so it warns you early.',
  [['psi(x, x) < 1e-9', 'True', NP + '\nx = np.arange(1000.0)'], ['psi(x, x + 500) > 0.25', 'True', NP + '\nx = np.arange(1000.0)'], ['psi(x, x + 5) < 0.1', 'True', NP + '\nx = np.arange(1000.0)'], ['psi(x, x + 1e6) > 1', 'True', NP + '\nx = np.arange(1000.0)'], ['isinstance(psi(x, x), float)', 'True', NP + '\nx = np.arange(1000.0)']], [['the same data twice', 'about 0']])
});
})();
