// Basics only: enough networking, operating systems and distributed systems to reason about real backends.
// The browser's Python has no sockets or threads, so problems simulate the logic. The sockets project runs on your machine.
(() => {
const p = (id, title, diff, time, desc, start, nudge, sol, big, idea, tests, ex) => ({ id, title, diff, time, desc: `<p>${desc}</p>`, start, nudge, sol, big, idea, tests, ex: ex || [] });

unit({ id: 'net-packets', phase: 8, title: 'Packets and addresses', mins: 9, read: [
`<p class="lede">The internet doesn't send your message. It chops it into small <b>packets</b>, up to about 1500 bytes each, and passes every one from router to router. Each router only asks: "where should this go next?"</p>
<h2>Layers: envelopes inside envelopes</h2>`,
steps([
  { n: 'Your app has some data, say an HTTP request.', d: D.flow({ d: [290, 40, 170, 50, 'HTTP request', 'g'] }) },
  { n: 'TCP wraps it with ports, so it reaches the right program, and a sequence number, so it can be put back in order.', d: D.flow({ a: [160, 40, 120, 50, 'TCP: ports', 'b'], d: [290, 40, 170, 50, 'HTTP request', 'g'] }) },
  { n: 'IP wraps that with addresses, so it reaches the right machine. Routers read this part.', d: D.flow({ i: [30, 40, 120, 50, 'IP: addresses', 'y'], a: [160, 40, 120, 50, 'TCP: ports', 'b'], d: [290, 40, 170, 50, 'HTTP request', 'g'] }) },
  { n: 'Wi-Fi or Ethernet wraps that for the very next hop. This outer envelope is replaced at every router, but the IP addresses inside stay the same.', d: D.flow({ e: [30, 20, 560, 90, ''], l: [40, 50, 70, 30, 'Wi-Fi', 'r'], i: [120, 40, 120, 50, 'IP: addresses', 'y'], a: [250, 40, 120, 50, 'TCP: ports', 'b'], d: [380, 40, 170, 50, 'HTTP request', 'g'] }) }
], 130),
`<p>Each layer only reads its own envelope. That's why you could swap Wi-Fi for 5G and HTTP never notices.</p>
<table><tr><th>Layer</th><th>Job</th><th>Examples</th></tr><tr><td>Application</td><td>What the data means</td><td>HTTP, DNS, SMTP</td></tr><tr><td>Transport</td><td>Which program, and reliability</td><td>TCP, UDP</td></tr><tr><td>Internet</td><td>Which machine, across networks</td><td>IP</td></tr><tr><td>Link</td><td>The next hop only</td><td>Wi-Fi, Ethernet</td></tr></table>
<h2>An IP address is just a number</h2><p>IPv4 addresses are 32 bits, written as four bytes: <code>192.168.1.37</code>. A <b>subnet</b> like <code>192.168.1.0/24</code> means "the first 24 bits name the network, and the rest name a machine on it."</p>`,
fig(D.cells([192, 168, 1, 37], { x: 150, y: 40, w: 80, hl: { 0: 'b', 1: 'b', 2: 'b', 3: 'g' } }) + D.t(270, 26, 'network: first 24 bits', { a: 'middle', cls: 'b' }) + D.t(430, 26, 'host', { a: 'middle', cls: 'g' }), 100),
`<p>A router picks the <b>most specific</b> matching route, known as the longest prefix match. <code>0.0.0.0/0</code> matches everything, and it's the default route. Some addresses are private and never appear on the public internet: <code>10.x</code>, <code>172.16-31.x</code>, <code>192.168.x</code>. Your router shares one public address between them, using NAT. <code>127.0.0.1</code> is always your own machine. IPv6 uses 128 bits, because 32 ran out.</p>`,
think('Packets can arrive out of order, or not at all. Which layer deals with that, and what does it need to do so?', 'The transport layer, TCP. It numbers the bytes it sends, and the receiver acknowledges them, so anything missing can be sent again and everything can be put back in order.')
], core: [
p('reassemble', 'Put the packets back', 'Easy', 10, 'Packets arrive as <code>(seq, total, data)</code>, with seq from 0 to total - 1. They may be out of order, or duplicated. Return the whole message, or <code>None</code> if any part is missing. An empty list of packets gives <code>None</code>.', 'def reassemble(packets):\n    ',
  ['What structure handles duplicates and order for you?', 'How do you know that a part is missing?'],
  R`def reassemble(packets):
    if not packets:
        return None
    parts = {seq: data for seq, total, data in packets}
    total = packets[0][1]
    if len(parts) != total:
        return None
    return "".join(parts[i] for i in range(total))`, 'O(n)', 'Sequence numbers turn a messy arrival order into a dict lookup.',
  [['reassemble([(1, 3, "b"), (0, 3, "a"), (2, 3, "c")])', '"abc"'], ['reassemble([(0, 2, "a")])', 'None'], ['reassemble([])', 'None'], ['reassemble([(0, 2, "a"), (0, 2, "a"), (1, 2, "b")])', '"ab"']], [['[(1, 3, "b"), (0, 3, "a"), (2, 3, "c")]', '"abc"']]),
p('in-subnet', 'Is it on this network?', 'Medium', 15, '<code>in_subnet(ip, cidr)</code> returns whether an IPv4 address is inside a block like <code>"192.168.1.0/24"</code>. Don\'t use the <code>ipaddress</code> module. Do it with bits.', 'def in_subnet(ip, cidr):\n    ',
  ['How do four numbers become one 32-bit number?', 'How do you compare only the first n bits of two numbers?'],
  R`def in_subnet(ip, cidr):
    def num(s):
        n = 0
        for part in s.split("."):
            n = n * 256 + int(part)
        return n
    net, bits = cidr.split("/")
    shift = 32 - int(bits)
    return num(ip) >> shift == num(net) >> shift`, 'O(1)', 'Shift away the host bits, and compare what remains.',
  [['in_subnet("192.168.1.37", "192.168.1.0/24")', 'True'], ['in_subnet("192.168.2.1", "192.168.1.0/24")', 'False'], ['in_subnet("10.1.2.3", "10.0.0.0/8")', 'True'], ['in_subnet("8.8.8.8", "0.0.0.0/0")', 'True'], ['in_subnet("1.2.3.4", "1.2.3.4/32")', 'True'], ['in_subnet("172.17.0.1", "172.16.0.0/12")', 'True'], ['in_subnet("172.32.0.1", "172.16.0.0/12")', 'False']], [['"192.168.1.37", "192.168.1.0/24"', 'True']])
], boss:
p('longest-prefix', 'Be a router', 'Medium', 18, '<code>route(table, ip)</code>: <code>table</code> is a list of <code>(cidr, next_hop)</code>. Return the next hop of the matching route with the longest prefix, or <code>None</code> if none match.', 'def route(table, ip):\n    ', [],
  R`def route(table, ip):
    def num(s):
        n = 0
        for part in s.split("."):
            n = n * 256 + int(part)
        return n
    best, hop = -1, None
    for cidr, nxt in table:
        net, bits = cidr.split("/")
        bits = int(bits)
        if bits > best and num(ip) >> (32 - bits) == num(net) >> (32 - bits):
            best, hop = bits, nxt
    return hop`, 'O(routes); real routers use a trie', 'The most specific route wins, which is what makes a default route work.',
  [['route([("10.0.0.0/8", "a"), ("10.1.0.0/16", "b"), ("0.0.0.0/0", "c")], "10.1.2.3")', '"b"'], ['route([("10.0.0.0/8", "a"), ("10.1.0.0/16", "b"), ("0.0.0.0/0", "c")], "10.9.2.3")', '"a"'], ['route([("10.0.0.0/8", "a"), ("0.0.0.0/0", "c")], "8.8.8.8")', '"c"'], ['route([("10.0.0.0/8", "a")], "8.8.8.8")', 'None'], ['route([], "1.1.1.1")', 'None'], ['route([("0.0.0.0/0", "c"), ("10.0.0.0/8", "a")], "10.0.0.1")', '"a"']], [['[("10.0.0.0/8", "a"), ("10.1.0.0/16", "b")], "10.1.2.3"', '"b"']])
});

unit({ id: 'net-dns-tcp', phase: 8, title: 'DNS and TCP', mins: 9, read: [
`<p class="lede">Two systems run before your first byte of HTTP. <b>DNS</b> turns a name into an address, and <b>TCP</b> turns an unreliable network into a dependable stream.</p><h2>DNS: the internet's phone book</h2>`,
steps([
  { n: 'No single server knows every name. Your resolver starts by asking a root server about www.shop.com.', d: D.flow({ r: [20, 60, 120, 54, 'your resolver', 'y'], a: [240, 10, 130, 44, 'root'], b: [240, 70, 130, 44, '.com'], c: [240, 130, 130, 44, 'shop.com'] }, [['r', 'a', '1']]) },
  { n: 'The root says: I don\'t know, but ask the .com servers. They say: ask shop.com\'s servers.', d: D.flow({ r: [20, 60, 120, 54, 'your resolver', 'y'], a: [240, 10, 130, 44, 'root'], b: [240, 70, 130, 44, '.com', 'b'], c: [240, 130, 130, 44, 'shop.com'] }, [['r', 'b', '2']]) },
  { n: 'That one knows the answer: 93.184.216.34. It\'s saved until its TTL, the time-to-live, runs out. That\'s why DNS changes can take a while to spread.', d: D.flow({ r: [20, 60, 120, 54, 'your resolver', 'y'], a: [240, 10, 130, 44, 'root'], b: [240, 70, 130, 44, '.com'], c: [240, 130, 130, 44, 'shop.com', 'g'] }, [['r', 'c', '3']]) + D.t(400, 158, '93.184.216.34, TTL 300', { cls: 'g' }) }
], 190),
`<p>Common records: <b>A</b> (name to IPv4), <b>AAAA</b> (IPv6), <b>CNAME</b> (this name is an alias of that one), <b>MX</b> (mail), <b>TXT</b> (notes, often for proving you own a domain). Lower your TTL before moving a site.</p>
<h2>TCP and UDP</h2><table><tr><th></th><th>TCP</th><th>UDP</th></tr><tr><td>Setup</td><td>Handshake first</td><td>None: just send</td></tr><tr><td>Lost data</td><td>Sent again</td><td>Stays lost</td></tr><tr><td>Order</td><td>Guaranteed</td><td>No promise</td></tr><tr><td>Used for</td><td>Web, APIs, databases</td><td>DNS, games, calls, and QUIC beneath HTTP/3</td></tr></table>
<h2>The three-way handshake</h2>`,
steps([
  { n: 'Client: here\'s my starting number. This is the SYN.', d: D.line(120, 20, 120, 170) + D.line(560, 20, 560, 170) + D.t(120, 14, 'client', { a: 'middle' }) + D.t(560, 14, 'server', { a: 'middle' }) + D.arrow(120, 50, 560, 80, 'b') + D.t(340, 54, 'SYN seq=100', { a: 'middle', cls: 'b' }) },
  { n: 'Server: got it, I expect 101 next. Here\'s my number too. This is the SYN-ACK.', d: D.line(120, 20, 120, 170) + D.line(560, 20, 560, 170) + D.t(120, 14, 'client', { a: 'middle' }) + D.t(560, 14, 'server', { a: 'middle' }) + D.arrow(120, 50, 560, 80, 'b') + D.arrow(560, 90, 120, 120, 'g') + D.t(340, 96, 'SYN-ACK seq=900 ack=101', { a: 'middle', cls: 'g' }) },
  { n: 'Client: got it, I expect 901. Now data can flow. That\'s one full round trip before your first byte, which is why reusing connections saves real time.', d: D.line(120, 20, 120, 170) + D.line(560, 20, 560, 170) + D.t(120, 14, 'client', { a: 'middle' }) + D.t(560, 14, 'server', { a: 'middle' }) + D.arrow(120, 50, 560, 80, 'b') + D.arrow(560, 90, 120, 120, 'g') + D.arrow(120, 130, 560, 160, 'b') + D.t(340, 136, 'ACK ack=901', { a: 'middle', cls: 'b' }) }
], 180),
`<h2>How TCP stays reliable</h2><p>Every byte has a number. The receiver reports the next one it needs, which is called an <b>ACK</b>. No ACK before a timeout means send again. Early arrivals wait in a buffer until the gap fills. TCP also slows down when it detects loss, so networks don't collapse under traffic.</p>
<h2>Latency and bandwidth</h2><p><b>Latency</b> is how long one trip takes, and <b>bandwidth</b> is how much fits through per second. A faster connection can't beat the speed of light, so round trips dominate on small requests. A round trip from Nepal to the US takes around 250 ms or more, so five of them is over a second, whatever your bandwidth. This is why CDNs exist.</p>`,
think('A site moved servers an hour ago, and some users still reach the old one. What\'s happening, and what should have been done beforehand?', 'Those users have the old address cached until its TTL runs out. Lower the TTL a day or two before the move, and keep the old server running until the old TTL has safely passed.')
], core: [
p('follow-cname', 'Follow the aliases', 'Easy', 12, '<code>resolve(records, name)</code>: <code>records</code> maps a name to <code>("A", ip)</code> or <code>("CNAME", other_name)</code>. Follow aliases until you reach an address. Return <code>None</code> for an unknown name or a loop of aliases.', 'def resolve(records, name):\n    ',
  ['When should you stop following?', 'How do you notice that you\'ve been here before?'],
  R`def resolve(records, name):
    seen = set()
    while name in records and name not in seen:
        seen.add(name)
        kind, value = records[name]
        if kind == "A":
            return value
        name = value
    return None`, 'O(chain length)', 'Any chain of links can loop. Keep a seen set.',
  [['resolve({"a": ("A", "1.1.1.1")}, "a")', '"1.1.1.1"'], ['resolve({"w": ("CNAME", "a"), "a": ("A", "1.1.1.1")}, "w")', '"1.1.1.1"'], ['resolve({}, "x")', 'None'], ['resolve({"a": ("CNAME", "b"), "b": ("CNAME", "a")}, "a")', 'None'], ['resolve({"a": ("CNAME", "gone")}, "a")', 'None']], [['{"w": ("CNAME", "a"), "a": ("A", "1.1.1.1")}, "w"', '"1.1.1.1"']]),
p('tcp-receiver', 'In-order delivery', 'Medium', 16, 'Build a class <code>Receiver</code>, expecting packet numbers from 0. <code>receive(seq, data)</code> stores what arrived and returns the ACK: the next sequence number it still needs. <code>read()</code> returns all the data delivered in order so far, joined as one string, and clears it. Data with a gap before it waits until the gap fills. Duplicates are ignored.', 'class Receiver:\n    def __init__(self):\n        pass\n\n    def receive(self, seq, data):\n        pass\n\n    def read(self):\n        pass\n',
  ['What two places can data be in: ready to read, or waiting?', 'After storing a packet, how many waiting ones might now be ready?'],
  R`class Receiver:
    def __init__(self):
        self.next = 0
        self.waiting = {}
        self.ready = []

    def receive(self, seq, data):
        if seq >= self.next:
            self.waiting[seq] = data
        while self.next in self.waiting:
            self.ready.append(self.waiting.pop(self.next))
            self.next += 1
        return self.next

    def read(self):
        out = "".join(self.ready)
        self.ready = []
        return out`, 'O(1) per packet on average', 'A cumulative ACK says "everything below this has arrived".',
  [['[r.receive(0, "a"), r.receive(2, "c"), r.receive(1, "b")]', '[1, 1, 3]', 'r = Receiver()'], ['(r.receive(1, "b"), r.read())', '(0, "")', 'r = Receiver()'], ['r.read()', '"abc"', 'r = Receiver()\nfor s, d in [(2, "c"), (0, "a"), (1, "b")]:\n    r.receive(s, d)'], ['(r.receive(0, "z"), r.read())', '(1, "")', 'r = Receiver()\nr.receive(0, "a")\nr.read()'], ['(r.read(), r.read())', '("a", "")', 'r = Receiver()\nr.receive(0, "a")']], [['receive(0), receive(2), receive(1)', 'ACKs 1, 1, 3']])
], boss:
p('dns-cache', 'A caching resolver', 'Medium', 20, '<code>Resolver(upstream)</code>, where <code>upstream(name)</code> returns <code>(ip, ttl)</code>, or <code>(None, ttl)</code> for "no such name". <code>lookup(name, now)</code> returns the ip or <code>None</code>. It must not ask upstream while an answer is still valid: an answer stored at time t stays valid while now &lt; t + ttl. "No such name" answers are cached as well, or a typo could hammer the server.', 'class Resolver:\n    def __init__(self, upstream):\n        self.upstream = upstream\n\n    def lookup(self, name, now):\n        pass\n', [],
  R`class Resolver:
    def __init__(self, upstream):
        self.upstream = upstream
        self.cache = {}

    def lookup(self, name, now):
        hit = self.cache.get(name)
        if hit and now < hit[1]:
            return hit[0]
        ip, ttl = self.upstream(name)
        self.cache[name] = (ip, now + ttl)
        return ip`, 'O(1)', 'Store an expiry time, not a duration. Cache "nothing there" too.',
  [['(r.lookup("a", 0), r.lookup("a", 5), len(calls))', '("1.1.1.1", "1.1.1.1", 1)', 'calls = []\ndef up(n):\n    calls.append(n)\n    return ("1.1.1.1", 10)\nr = Resolver(up)'], ['(r.lookup("a", 0), r.lookup("a", 10), len(calls))', '("1.1.1.1", "1.1.1.1", 2)', 'calls = []\ndef up(n):\n    calls.append(n)\n    return ("1.1.1.1", 10)\nr = Resolver(up)'], ['(r.lookup("x", 0), r.lookup("x", 1), len(calls))', '(None, None, 1)', 'calls = []\ndef up(n):\n    calls.append(n)\n    return (None, 30)\nr = Resolver(up)'], ['(r.lookup("a", 0), r.lookup("b", 0), len(calls))', '("1.1.1.1", "1.1.1.1", 2)', 'calls = []\ndef up(n):\n    calls.append(n)\n    return ("1.1.1.1", 10)\nr = Resolver(up)']], [['lookup("a", 0), lookup("a", 5)', 'upstream is called once']])
});

unit({ id: 'net-web', phase: 8, title: 'Sockets, HTTPS and the whole trip', mins: 9, read: [
`<p class="lede">What actually happens when you open a website? You now know nearly every step. Here's the whole journey, and the two ideas left to learn: <b>sockets</b> and <b>TLS</b>.</p>`,
steps([
  { n: 'DNS: turn the name into an IP address, using caches where possible.', d: D.flow({ a: [10, 40, 100, 50, 'DNS', 'y'], b: [130, 40, 100, 50, 'TCP'], c: [250, 40, 100, 50, 'TLS'], d: [370, 40, 100, 50, 'HTTP'], e: [490, 40, 100, 50, 'Server'], f: [610, 40, 100, 50, 'Render'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']]) },
  { n: 'TCP: the handshake opens a connection, costing one round trip.', d: D.flow({ a: [10, 40, 100, 50, 'DNS'], b: [130, 40, 100, 50, 'TCP', 'y'], c: [250, 40, 100, 50, 'TLS'], d: [370, 40, 100, 50, 'HTTP'], e: [490, 40, 100, 50, 'Server'], f: [610, 40, 100, 50, 'Render'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']]) },
  { n: 'TLS: agree on keys and check the server is who it says. One more round trip.', d: D.flow({ a: [10, 40, 100, 50, 'DNS'], b: [130, 40, 100, 50, 'TCP'], c: [250, 40, 100, 50, 'TLS', 'y'], d: [370, 40, 100, 50, 'HTTP'], e: [490, 40, 100, 50, 'Server'], f: [610, 40, 100, 50, 'Render'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']]) },
  { n: 'HTTP: the request goes out, perhaps through a CDN or a load balancer, and on to your app and its database. The response comes back, and the browser asks for the images and scripts it needs, reusing the connection.', d: D.flow({ a: [10, 40, 100, 50, 'DNS'], b: [130, 40, 100, 50, 'TCP'], c: [250, 40, 100, 50, 'TLS'], d: [370, 40, 100, 50, 'HTTP', 'g'], e: [490, 40, 100, 50, 'Server', 'g'], f: [610, 40, 100, 50, 'Render', 'g'] }, [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f']]) }
], 110),
`<h2>Sockets: how programs reach the network</h2><p>A socket is what your program holds to send and receive, a bit like an open file. A server <code>bind</code>s to a port, <code>listen</code>s, then <code>accept</code>s each client. A client just <code>connect</code>s. Web frameworks do all this for you, and you'll write it yourself in the sockets project, since the browser's Python can't open sockets.</p>
<h2>The classic bug: TCP has no messages</h2><p>TCP is a <b>stream of bytes</b>. If you send "hello" then "world", the other side might receive "hel", then "loworld". Message boundaries don't exist unless you add them.</p>`,
fig(D.t(20, 30, 'you send:', { cls: 'soft' }) + D.cells(['hello', 'world'], { x: 110, y: 8, w: 90, h: 36 }) + D.t(20, 90, 'they read:', { cls: 'soft' }) + D.cells(['hel', 'lowor', 'ld'], { x: 110, y: 68, w: 90, h: 36, hl: { 0: 'y', 1: 'b', 2: 'r' } }) + D.t(400, 90, 'any split is possible', { cls: 'r' }), 120),
`<p>Protocols solve this in two ways: a <b>marker</b>, like a newline, or a <b>length</b> in front of the message. HTTP uses both: a blank line ends the headers, and <code>Content-Length</code> gives the body's size.</p>
<h2>TLS: what the S in HTTPS does</h2><p>It gives you three things: <b>privacy</b> (nobody on the path can read it), <b>integrity</b> (nobody can change it unnoticed) and <b>identity</b> (it really is that site).</p><ul>
<li><b>Keys:</b> both sides agree on a secret key over an open network, using maths where an eavesdropper sees everything and still can't work it out. Then fast symmetric encryption takes over.</li>
<li><b>Certificates:</b> the server shows a certificate naming its domain, signed by a certificate authority your device already trusts. Your device checks the signature, the dates and the name.</li>
<li><b>What it doesn't hide:</b> the IP address you connected to, usually the hostname, and how much data moved.</li></ul>
<h2>Names you'll keep hearing</h2><table><tr><td><b>Reverse proxy</b></td><td>Sits in front of your app. Handles TLS, routing and compression: nginx, for example.</td></tr><tr><td><b>Load balancer</b></td><td>Shares traffic between app copies, and skips unhealthy ones.</td></tr><tr><td><b>CDN</b></td><td>Copies of your content near users, because latency beats bandwidth.</td></tr><tr><td><b>WebSocket</b></td><td>An HTTP connection upgraded so both sides can send at any time.</td></tr><tr><td><b>HTTP/2 and 3</b></td><td>Many requests share one connection. HTTP/3 runs over UDP, using QUIC.</td></tr><tr><td><b>CORS</b></td><td>The browser asks your server if another site's page may read its response. It protects users, and doesn't protect your API from curl.</td></tr></table>`,
think('Your server calls recv() once and treats what it gets as a whole request. It works on your laptop every time. Why might it fail in production?', 'On your laptop, small messages tend to arrive all at once. Over real networks, large or slow requests arrive in pieces. Always keep reading until you have a complete message.')
], core: [
p('line-buffer', 'Whole lines only', 'Medium', 12, 'A class <code>LineBuffer</code> with <code>feed(chunk)</code>, which takes a string of any size and returns a list of the complete lines now available, without their <code>\\n</code>. An unfinished line is kept for later.', 'class LineBuffer:\n    def __init__(self):\n        pass\n\n    def feed(self, chunk):\n        pass\n',
  ['What should happen to whatever comes after the final newline?'],
  R`class LineBuffer:
    def __init__(self):
        self.rest = ""

    def feed(self, chunk):
        parts = (self.rest + chunk).split("\n")
        self.rest = parts.pop()
        return parts`, 'O(chunk size)', 'Keep the leftovers. A chunk boundary means nothing.',
  [['b.feed("hel")', '[]', 'b = LineBuffer()'], ['(b.feed("hel"), b.feed("lo\\nwor"), b.feed("ld\\n"))', '([], ["hello"], ["world"])', 'b = LineBuffer()'], ['b.feed("a\\nb\\n")', '["a", "b"]', 'b = LineBuffer()'], ['b.feed("\\n")', '[""]', 'b = LineBuffer()']], [['feed("hel"), feed("lo\\nwor")', '[], ["hello"]']]),
p('hostname-match', 'Whose certificate is this?', 'Medium', 12, '<code>matches(pattern, host)</code> says whether a certificate name covers a hostname, ignoring case. A pattern may start with <code>*.</code>, and the star stands for <b>exactly one</b> label: <code>*.shop.com</code> covers <code>a.shop.com</code> but not <code>shop.com</code> or <code>a.b.shop.com</code>.', 'def matches(pattern, host):\n    ',
  ['What separates labels? How many should each side have when there\'s a star?'],
  R`def matches(pattern, host):
    a, b = pattern.lower().split("."), host.lower().split(".")
    if len(a) != len(b):
        return False
    if a[0] == "*":
        return bool(b[0]) and a[1:] == b[1:]
    return a == b`, 'O(length)', 'Compare whole labels, never raw suffixes, or "evilshop.com" could pass as "shop.com".',
  [['matches("shop.com", "shop.com")', 'True'], ['matches("*.shop.com", "a.shop.com")', 'True'], ['matches("*.shop.com", "shop.com")', 'False'], ['matches("*.shop.com", "a.b.shop.com")', 'False'], ['matches("*.shop.com", "evilshop.com")', 'False'], ['matches("SHOP.com", "shop.COM")', 'True'], ['matches("*.shop.com", ".shop.com")', 'False']], [['"*.shop.com", "a.shop.com"', 'True']])
], boss:
p('framer', 'Messages over a stream', 'Hard', 22, 'Build a length-prefixed protocol over bytes. <code>frame(payload)</code> returns the payload with its length in front, as 4 big-endian bytes. Class <code>Deframer</code> has <code>feed(data)</code>, which takes bytes split in any way and returns a list of the complete payloads now available.', 'def frame(payload):\n    pass\n\nclass Deframer:\n    def __init__(self):\n        pass\n\n    def feed(self, data):\n        pass\n', [],
  R`def frame(payload):
    return len(payload).to_bytes(4, "big") + payload

class Deframer:
    def __init__(self):
        self.buf = b""

    def feed(self, data):
        self.buf += data
        out = []
        while len(self.buf) >= 4:
            n = int.from_bytes(self.buf[:4], "big")
            if len(self.buf) < 4 + n:
                break
            out.append(self.buf[4:4 + n])
            self.buf = self.buf[4 + n:]
        return out`, 'O(data)', 'Even the length prefix can arrive in pieces. Check before you read each part.',
  [['frame(b"hi")', 'b"\\x00\\x00\\x00\\x02hi"'], ['d.feed(frame(b"hi") + frame(b"yo"))', '[b"hi", b"yo"]', 'd = Deframer()'], ['[x for b in s for x in d.feed(bytes([b]))]', '[b"abc", b"", b"d"]', 'd = Deframer()\ns = frame(b"abc") + frame(b"") + frame(b"d")'], ['(d.feed(s[:3]), d.feed(s[3:5]), d.feed(s[5:]))', '([], [], [b"hi"])', 'd = Deframer()\ns = frame(b"hi")'], ['len(d.feed(frame(b"x" * 70000))[0])', '70000', 'd = Deframer()']], [['feed(frame(b"hi") + frame(b"yo"))', '[b"hi", b"yo"]']])
});

unit({ id: 'os-basics', phase: 8, title: 'Memory, processes and threads', mins: 8, read: [
`<p class="lede">Your code doesn't run alone. An operating system shares one machine between hundreds of programs, and the speed of your code often depends on <b>where its data sits.</b></p><h2>Memory is a ladder</h2>`,
fig(D.flow({ a: [30, 20, 150, 50, 'CPU cache\nabout 1 ns', 'g'], b: [200, 20, 150, 50, 'RAM\nabout 100 ns', 'y'], c: [370, 20, 150, 50, 'SSD\nabout 100,000 ns', 'b'], d: [540, 20, 160, 50, 'Network, far away\n100,000,000+ ns', 'r'] }, [['a', 'b'], ['b', 'c'], ['c', 'd']]), 90, 'Approximate. The gaps matter more than the exact numbers.'),
`<p>That's why caches exist at every level, why a database touching disk is slow, and why walking an array beats chasing pointers. <b>Locality:</b> nearby data tends to be loaded together, so it's cheap to use next.</p>
<h2>Stack and heap</h2><p>The <b>stack</b> holds each running function's local variables, and clears itself when the function returns. Too much recursion overflows it. The <b>heap</b> holds everything that outlives a call. In Python, nearly everything is on the heap, and is freed automatically when nothing refers to it any more.</p>
<h2>Processes and threads</h2><table><tr><th></th><th>Process</th><th>Thread</th></tr><tr><td>Memory</td><td>Its own, isolated</td><td>Shared with the other threads in its process</td></tr><tr><td>If it crashes</td><td>Others survive</td><td>Takes down its process</td></tr><tr><td>Cost to start</td><td>Heavier</td><td>Lighter</td></tr><tr><td>Danger</td><td>Sharing data is harder</td><td>Sharing is easy, and so are races</td></tr></table>
<p><b>The scheduler</b> gives each one a short turn on a CPU, called a time slice, and switches so quickly that everything seems to run at once. Each switch has a small cost.</p>
<p><b>Python's GIL:</b> in standard CPython builds, only one thread usually runs Python code at a time. Threads still help when waiting, on the network or disk. For heavy computing, use multiple processes.</p>`,
think('A web server spends most of its time waiting on a database. Threads or processes, and does the GIL matter here?', 'Threads, or async, work fine: while one waits, others run, and waiting doesn\'t need the GIL. The GIL mostly matters for CPU-heavy work, which is where you\'d reach for processes.')
], core: [
p('round-robin', 'Take turns', 'Medium', 15, 'Simulate a round-robin scheduler. <code>jobs</code> is a list of <code>(name, time_needed)</code>, all ready at time 0. Each job runs for up to <code>slice_</code> units in turn, and unfinished ones go to the back of the line. Return a dict of each name to the time it finishes.', 'def round_robin(jobs, slice_):\n    ',
  ['You already know a structure for "go to the back of the line".', 'What is the clock doing as each job runs?'],
  R`def round_robin(jobs, slice_):
    q = deque(jobs)
    now, done = 0, {}
    while q:
        name, left = q.popleft()
        run = min(left, slice_)
        now += run
        if left > run:
            q.append((name, left - run))
        else:
            done[name] = now
    return done`, 'O(total time / slice)', 'A queue plus a clock is enough to simulate many systems.',
  [['round_robin([("a", 3), ("b", 1)], 2)', '{"b": 3, "a": 4}'], ['round_robin([], 2)', '{}'], ['round_robin([("a", 2)], 5)', '{"a": 2}'], ['round_robin([("a", 4), ("b", 4)], 1)', '{"a": 7, "b": 8}']], [['[("a", 3), ("b", 1)], 2', '{"b": 3, "a": 4}']])
], boss:
p('page-faults', 'Which page to throw out?', 'Medium', 16, 'RAM holds <code>frames</code> pages. <code>faults(refs, frames)</code> walks through the page numbers in <code>refs</code>. A page not in RAM is a fault, and it\'s loaded, evicting the least recently used page if RAM is full. Return the number of faults.', 'def faults(refs, frames):\n    ', [],
  R`def faults(refs, frames):
    ram = OrderedDict()
    n = 0
    for page in refs:
        if page in ram:
            ram.move_to_end(page)
        else:
            n += 1
            if len(ram) == frames:
                ram.popitem(last=False)
            ram[page] = True
    return n`, 'O(n)', 'The same eviction idea as your LRU cache, one level lower. Caches repeat at every level of a machine.',
  [['faults([1, 2, 3, 1, 4], 3)', '4'], ['faults([1, 1, 1], 1)', '1'], ['faults([], 3)', '0'], ['faults([1, 2, 1, 2], 2)', '2'], ['faults([1, 2, 3, 1, 2, 3], 2)', '6'], ['faults(list(range(5)) * 2000, 5)', '5']], [['[1, 2, 3, 1, 4], 3', '4']])
});

unit({ id: 'races', phase: 8, title: 'Races and locks', mins: 8, read: [
`<p class="lede"><code>count += 1</code> looks like one step. It's actually three: read, add, write. If two threads do this together, updates can vanish. These bugs appear randomly and <b>can pass every test on your laptop.</b></p>`,
steps([
  { n: 'Count is 5. Thread A reads 5.', d: D.vars({ count: 5, 'A has': 5, 'B has': '-' }, { x: 60, y: 40, hl: ['A has'] }) },
  { n: 'Before A writes, B also reads 5.', d: D.vars({ count: 5, 'A has': 5, 'B has': 5 }, { x: 60, y: 40, hl: ['B has'] }) },
  { n: 'A writes 6.', d: D.vars({ count: 6, 'A has': 6, 'B has': 5 }, { x: 60, y: 40, hl: ['count'] }) },
  { n: 'B writes 6 as well. Two increments happened, and the count went up by one. An update has been lost.', d: D.vars({ count: 6, 'A has': 6, 'B has': 6 }, { x: 60, y: 40, hl: ['count'] }) + D.t(320, 60, 'should be 7', { cls: 'r', size: 20 }) }
], 140),
`<h2>Locks</h2><p>A lock makes a stretch of code one-at-a-time: <code>with lock: count += 1</code>. Keep locked sections short, because everyone else is waiting. Databases have the same problem, which you solved in Transactions.</p>
<h2>Deadlock</h2><p>A holds lock 1 and waits for lock 2. B holds lock 2 and waits for lock 1. Neither ever moves. It's a <b>cycle</b> in a graph of who waits for whom, and you already know how to find cycles. The usual cure is for everyone to take locks in the same order.</p>
<h2>Staying out of trouble</h2><ul><li>Don't share what you can avoid sharing.</li><li>Use a queue to pass work, rather than sharing variables.</li><li>Let the database's transactions and unique constraints do the hard part.</li></ul>`,
think('Two requests check "is the username free?" and both see yes, then both insert it. Will a lock in your Python code fix this, when you run 4 server processes?', 'No: a Python lock only works inside one process. Use a UNIQUE constraint in the database, the one place they all share, and handle the error when you lose the race.')
], core: [
p('all-outcomes', 'Every way it could go', 'Hard', 25, 'Thread A does <code>count += 1</code> a times, and thread B does it b times. Each increment is three steps: read, add, write. Return a sorted list of every possible final count over all ways of interleaving the steps, starting from 0. Values stay small: a + b is at most 6.', 'def outcomes(a, b):\n    ',
  ['You\'ve done "try every order" before. What are the choices at each moment?', 'What state describes the system? Treat read-add-write as two parts: read, and write back one more than you read.'],
  R`def outcomes(a, b):
    seen, results = set(), set()
    def go(count, ra, va, rb, vb):
        state = (count, ra, va, rb, vb)
        if state in seen:
            return
        seen.add(state)
        if ra == 0 and rb == 0 and va is None and vb is None:
            results.add(count)
        if va is not None:
            go(va + 1, ra, None, rb, vb)
        elif ra > 0:
            go(count, ra - 1, count, rb, vb)
        if vb is not None:
            go(vb + 1, ra, va, rb, None)
        elif rb > 0:
            go(count, ra, va, rb - 1, count)
    go(0, a, None, b, None)
    return sorted(results)`, 'Limited by the number of distinct states', 'Interleavings are backtracking. Racing code really can give results that seem impossible.',
  [['outcomes(1, 1)', '[1, 2]'], ['outcomes(2, 0)', '[2]'], ['outcomes(0, 0)', '[0]'], ['outcomes(2, 2)', '[2, 3, 4]'], ['outcomes(3, 3)', '[2, 3, 4, 5, 6]']], [['1, 1', '[1, 2]']])
], boss:
p('find-deadlock', 'Find the deadlock', 'Medium', 16, '<code>deadlocked(holds, waits)</code>: <code>holds</code> maps each lock to the thread holding it, and <code>waits</code> maps a thread to the lock it wants. Return a sorted list of the threads stuck in a cycle of waiting, or <code>[]</code>. A thread merely waiting behind a cycle isn\'t in it.', 'def deadlocked(holds, waits):\n    ', [],
  R`def deadlocked(holds, waits):
    next_of = {t: holds[l] for t, l in waits.items() if l in holds}
    stuck = set()
    for start in next_of:
        seen, t = set(), start
        while t in next_of and t not in seen:
            seen.add(t)
            t = next_of[t]
        if t == start:
            stuck.add(start)
    return sorted(stuck)`, 'O(threads^2) as written', 'Each thread waits on at most one other, so follow the arrows: you can only be in a cycle if you get back to where you began.',
  [['deadlocked({"L1": "A", "L2": "B"}, {"A": "L2", "B": "L1"})', '["A", "B"]'], ['deadlocked({"L1": "A"}, {"B": "L1"})', '[]'], ['deadlocked({}, {})', '[]'], ['deadlocked({"L1": "A", "L2": "B"}, {"A": "L2", "B": "L1", "C": "L1"})', '["A", "B"]'], ['deadlocked({"L1": "A"}, {"A": "L1"})', '["A"]'], ['deadlocked({"L1": "A"}, {"A": "L9"})', '[]']], [['{"L1": "A", "L2": "B"}, {"A": "L2", "B": "L1"}', '["A", "B"]']])
});

unit({ id: 'dist-basics', phase: 8, title: 'Many machines', mins: 9, read: [
`<p class="lede">As soon as your app has a server and a database, it's a distributed system. The hard part is <b>partial failure</b>: one piece is down, or slow, and <b>from the outside those two look the same.</b></p>
<h2>What people wrongly assume</h2><p>The network is reliable, latency is zero, and bandwidth is endless. All false. A timeout doesn't tell you whether your request failed: it may have succeeded, and only the reply got lost. That's why you built idempotent payments.</p>
<h2>Replication: copies of the data</h2>`,
steps([
  { n: 'One leader takes the writes. Followers copy from it and serve reads.', d: D.flow({ l: [60, 50, 120, 54, 'leader', 'y'], a: [320, 10, 120, 44, 'follower'], b: [320, 70, 120, 44, 'follower'], c: [320, 130, 120, 44, 'follower'] }, [['l', 'a', 'log'], ['l', 'b'], ['l', 'c']]) },
  { n: 'Copying takes time. Read from a follower just after writing, and your own change may be missing. This is replication lag. If a user must see their own write, read from the leader.', d: D.flow({ l: [60, 50, 120, 54, 'name = sam', 'g'], a: [320, 50, 140, 54, 'name = old', 'r'] }, [['l', 'a', 'still copying']]) + D.t(540, 82, 'reads the old value', { a: 'middle', cls: 'r' }) }
], 190),
`<h2>Quorums: how sure do you need to be?</h2><p>Keep N copies. Require W to confirm each write, and read from R. If <b>W + R &gt; N</b>, every read overlaps with the latest write in at least one copy, so a version number can find the newest.</p>`,
fig(D.cells(['v2', 'v2', 'v1'], { x: 150, y: 40, w: 70, hl: { 0: 'g', 1: 'g' }, label: 'N = 3, written to W = 2' }) + D.t(420, 50, 'read any R = 2:', { cls: 'soft' }) + D.t(420, 76, 'at least one has v2', { cls: 'g' }), 110),
`<h2>The trade-off you can't escape</h2><p>When the network splits, a system has to choose: refuse some requests to stay correct, or keep answering and risk stale data. A bank picks correctness, and a like counter picks staying up. This is what the CAP theorem is about.</p>
<h2>Clocks can't be trusted</h2><p>Machines' clocks drift, so "latest timestamp wins" can throw away the newer write. Systems instead count events: a <b>Lamport clock</b> is a counter that moves past any number it sees, giving an order consistent with cause and effect.</p>
<h2>Agreeing on a leader</h2><p>Systems like Raft have nodes vote, needing a <b>majority</b>. Two majorities always overlap, so two leaders can't win the same election. This is why clusters have an odd number of nodes: 3 survive 1 failure, and 5 survive 2. You won't build this at work, but you'll rely on it through tools like etcd.</p>`,
think('You run 4 nodes rather than 3. How many failures can you survive, and did that extra node help?', 'A majority of 4 is 3, so you survive only 1 failure, the same as with 3 nodes, and you\'ve added another machine that can break. That\'s why odd numbers are used.')
], core: [
p('quorum-read', 'Read the newest', 'Easy', 10, '<code>quorum_read(replies, r)</code>: <code>replies</code> is a list of <code>(version, value)</code> from the replicas that answered. If fewer than <code>r</code> replied, raise <code>TimeoutError</code>. Otherwise return the value with the highest version.', 'def quorum_read(replies, r):\n    ',
  ['What do you do when not enough answered? Is a partial answer safe?'],
  R`def quorum_read(replies, r):
    if len(replies) < r:
        raise TimeoutError("not enough replicas")
    return max(replies, key=lambda x: x[0])[1]`, 'O(replies)', 'Without enough answers, an error beats a possibly stale value.',
  [['quorum_read([(1, "a"), (2, "b")], 2)', '"b"'], ['quorum_read([(3, "x"), (1, "y"), (2, "z")], 2)', '"x"'], ['_t()', 'True', 'def _t():\n    try:\n        quorum_read([(1, "a")], 2)\n    except TimeoutError:\n        return True\n    return False']], [['[(1, "a"), (2, "b")], 2', '"b"']]),
p('lamport', 'A clock made of events', 'Medium', 12, 'A class <code>Lamport</code>, starting at 0. <code>tick()</code> records a local event: add 1 and return the time. <code>send()</code> works like tick, and its result goes in the message. <code>receive(t)</code> sets the clock to the bigger of its own time and t, adds 1, and returns it.', 'class Lamport:\n    def __init__(self):\n        pass\n\n    def tick(self):\n        pass\n\n    def send(self):\n        pass\n\n    def receive(self, t):\n        pass\n',
  ['Why must a receive jump past the time in the message?'],
  R`class Lamport:
    def __init__(self):
        self.t = 0

    def tick(self):
        self.t += 1
        return self.t

    def send(self):
        return self.tick()

    def receive(self, t):
        self.t = max(self.t, t) + 1
        return self.t`, 'O(1)', 'If A caused B, then A\'s number is smaller. That\'s all this promises.',
  [['(c.tick(), c.tick())', '(1, 2)', 'c = Lamport()'], ['c.receive(10)', '11', 'c = Lamport()'], ['(c.tick(), c.tick(), c.receive(1))', '(1, 2, 3)', 'c = Lamport()'], ['b.receive(a.send()) > a.t', 'True', 'a, b = Lamport(), Lamport()\na.tick()\na.tick()']], [['tick(), tick(), receive(10)', '1, 2, 11']])
], boss:
p('quorum-store', 'A tiny replicated store', 'Hard', 26, '<code>Store(n, w, r)</code> keeps n replicas, numbered from 0, each mapping keys to <code>(version, value)</code>. <code>down</code> is a set of replicas that are unreachable, which a test may change. <code>write(k, v)</code> uses a version 1 above the highest it can see for k on live replicas. It saves to every live replica, and raises <code>TimeoutError</code> and saves nothing if fewer than w are live. <code>read(k)</code> asks the first r live replicas, raising <code>TimeoutError</code> if fewer than r are live. It returns the newest value, or <code>None</code>, and repairs any stale replica it asked.', 'class Store:\n    def __init__(self, n, w, r):\n        self.down = set()\n\n    def write(self, k, v):\n        pass\n\n    def read(self, k):\n        pass\n', [],
  R`class Store:
    def __init__(self, n, w, r):
        self.reps = [{} for _ in range(n)]
        self.w, self.r = w, r
        self.down = set()

    def _live(self):
        return [i for i in range(len(self.reps)) if i not in self.down]

    def write(self, k, v):
        live = self._live()
        if len(live) < self.w:
            raise TimeoutError("not enough replicas")
        ver = max((self.reps[i].get(k, (0, None))[0] for i in live), default=0) + 1
        for i in live:
            self.reps[i][k] = (ver, v)

    def read(self, k):
        live = self._live()
        if len(live) < self.r:
            raise TimeoutError("not enough replicas")
        asked = live[:self.r]
        best = max((self.reps[i].get(k, (0, None)) for i in asked), key=lambda x: x[0])
        for i in asked:
            if best[0] and self.reps[i].get(k, (0, None))[0] < best[0]:
                self.reps[i][k] = best
        return best[1]`, 'O(n) per call', 'W + R > N means reads overlap writes. Read repair fixes stale copies as a side effect.',
  [['s.read("a")', '1', 's = Store(3, 2, 2)\ns.write("a", 1)'], ['s.read("nope")', 'None', 's = Store(3, 2, 2)'], ['s.read("a")', '2', 's = Store(3, 2, 2)\ns.write("a", 1)\ns.down = {2}\ns.write("a", 2)\ns.down = {0}'], ['s.reps[2]["a"][1]', '2', 's = Store(3, 2, 2)\ns.write("a", 1)\ns.down = {2}\ns.write("a", 2)\ns.down = {0}\ns.read("a")'], ['_t(lambda: s.write("a", 1))', 'True', 's = Store(3, 2, 2)\ns.down = {0, 1}\ndef _t(f):\n    try:\n        f()\n    except TimeoutError:\n        return True\n    return False'], ['_t(lambda: s.read("a"))', 'True', 's = Store(3, 2, 2)\ns.down = {0, 1}\ndef _t(f):\n    try:\n        f()\n    except TimeoutError:\n        return True\n    return False']], [['Store(3, 2, 2)', 'survives one replica being down']])
});
})();
