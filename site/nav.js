/* Navbar: drifting liquid droplets + a hairline that appears once you scroll.
   Droplets thin out around the logo and the nav links so they never crowd the text. */

(function () {
  var header = document.querySelector('.site-header');
  var canvas = document.getElementById('nav-pixels');
  if (!header) return;

  /* --- hairline on scroll --- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- droplet field --- */
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COUNT = 18;
  var PAD = 14;    // how far the clear zone extends past each element
  var FADE = 46;   // distance over which a droplet fades back in

  var drops = [];
  var zones = [];
  var w = 0;
  var h = 0;
  var raf = null;

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = header.getBoundingClientRect();
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Rectangles the droplets should keep clear of, in canvas space.
  function measureZones() {
    var base = header.getBoundingClientRect();
    zones = [];
    header.querySelectorAll('.logo, .nav a, .nav button').forEach(function (el) {
      var r = el.getBoundingClientRect();
      zones.push({
        x1: r.left - base.left - PAD,
        y1: r.top - base.top - PAD,
        x2: r.right - base.left + PAD,
        y2: r.bottom - base.top + PAD
      });
    });
  }

  // 0 inside a zone, ramping to 1 once clear of it.
  function clearance(x, y) {
    var min = Infinity;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      var dx = Math.max(z.x1 - x, 0, x - z.x2);
      var dy = Math.max(z.y1 - y, 0, y - z.y2);
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < min) min = d;
    }
    if (min >= FADE) return 1;
    var t = min / FADE;
    return t * t * (3 - 2 * t); // smoothstep
  }

  function spawn(atLeft) {
    var x, y, tries = 0;
    do {
      x = atLeft ? -14 : Math.random() * w;
      y = 6 + Math.random() * (h - 12);
      tries++;
    } while (tries < 12 && clearance(x, y) < 0.55 && !atLeft);

    return {
      x: x,
      y: y,
      r: 3 + Math.random() * 5.5,
      squash: 0.72 + Math.random() * 0.3,     // slightly wider than tall, like a bead
      vx: 0.10 + Math.random() * 0.26,
      amp: 1.5 + Math.random() * 5,
      freq: 0.0005 + Math.random() * 0.0014,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.3 + Math.random() * 0.4
    };
  }

  function seed() {
    drops = [];
    for (var i = 0; i < COUNT; i++) drops.push(spawn(false));
  }

  function drawDrop(p, y, a) {
    var rx = p.r;
    var ry = p.r * p.squash;

    // Glossy body: light at the top-left, deeper green at the bottom.
    var g = ctx.createRadialGradient(
      p.x - rx * 0.35, y - ry * 0.45, rx * 0.1,
      p.x, y, rx * 1.05
    );
    g.addColorStop(0, 'rgba(150, 233, 190, ' + (a * 0.95) + ')');
    g.addColorStop(0.45, 'rgba(46, 194, 126, ' + (a * 0.85) + ')');
    g.addColorStop(1, 'rgba(14, 122, 69, ' + (a * 0.62) + ')');

    ctx.beginPath();
    ctx.ellipse(p.x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Specular highlight — what actually sells it as liquid.
    ctx.beginPath();
    ctx.ellipse(p.x - rx * 0.34, y - ry * 0.42, rx * 0.26, ry * 0.19, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, ' + (a * 0.75) + ')';
    ctx.fill();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < drops.length; i++) {
      var p = drops[i];
      var y = p.y + Math.sin(t * p.freq + p.phase) * p.amp;
      var a = p.alpha * clearance(p.x, y);
      if (a > 0.01) drawDrop(p, y, a);
    }
  }

  function step(t) {
    for (var i = 0; i < drops.length; i++) {
      var p = drops[i];
      p.x += p.vx;
      if (p.x > w + 16) drops[i] = spawn(true);
    }
    draw(t);
    raf = requestAnimationFrame(step);
  }

  function start() { if (raf === null && !reduced) raf = requestAnimationFrame(step); }
  function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

  function build() {
    size();
    measureZones();
    seed();
    draw(0);
  }

  build();
  start();

  // Fonts land after first paint and shift the nav, so re-measure the zones.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measureZones(); });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  // Don't burn frames on a tab nobody is looking at.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
})();
