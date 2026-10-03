/* three.js — the three-figure kranok (กนกสามตัว) built step by step, after the teaching recipe:
   an upright 2:1 rectangle and its diagonal, the curl, the sheath, the tip, notches, inner lines and gold. */
window.THREE_STEPS = function (cv, H) {
  var U = window.UI, step = 5, playing = false, timer = 0, born = 0;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var N = U.steps.length, g, sets, at, frame;

  function build() {
    g = H.fit(cv, function (w) { return Math.min(560, Math.max(400, w * 1.1)); });
    sets = { plain: K.samTua({ len: 100, lean: 0.2, teeth: 0 }), notched: K.samTua({ len: 100, lean: 0.2, teeth: 3 }) };
    var all = [];
    sets.notched.forEach(function (p) {
      p.shape.outline.forEach(function (q) { all.push({ x: q.x + p.dx, y: q.y + p.dy }); });
      var B = p.shape.belly; if (B) { all.push({ x: B.x + p.dx - B.r, y: B.y + p.dy + B.r }); all.push({ x: B.x + p.dx + B.r, y: B.y + p.dy + B.r }); }
    });
    var b = K.bbox(all), fw = Math.max(b.x1 - b.x0, (b.y1 - b.y0) / 2) * 1.04;
    frame = { x0: b.x1 - fw, x1: b.x1 + fw * 0.02, y0: b.y0 - fw * 0.03, y1: b.y0 - fw * 0.03 + fw * 2 };
    var pad = 22, fh = frame.y1 - frame.y0, fwid = frame.x1 - frame.x0, sc = Math.min((g.w - pad * 2) / fwid, (g.h - pad * 2) / fh);
    at = { scale: sc, x: g.w / 2 - (frame.x0 + frame.x1) / 2 * sc, y: g.h / 2 - (frame.y0 + frame.y1) / 2 * sc };
  }
  function T(x, y) { return { x: at.x + x * at.scale, y: at.y + y * at.scale }; }

  function draw(t) {
    var c = g.c, w = g.w, h = g.h, k = reduce ? 1 : Math.min(1, (t - born) / 0.9);
    H.lacquer(c, w, h);
    var a = T(frame.x0, frame.y1), b = T(frame.x1, frame.y0);
    c.save(); c.strokeStyle = "rgba(124,200,255,.6)"; c.lineWidth = 1.2; c.setLineDash([5, 5]);
    c.strokeRect(a.x, b.y, b.x - a.x, a.y - b.y);
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(a.x + (b.x - a.x) * (step === 0 ? k : 1), a.y + (b.y - a.y) * (step === 0 ? k : 1)); c.stroke();
    c.setLineDash([]); c.restore();
    var set = step >= 4 ? sets.notched : sets.plain, gold = step >= 5;
    [2, 1, 0].forEach(function (i) {
      var need = i + 1;
      if (step < need) return;
      var p = set[i], grow = step === need ? k : 1;
      var st = { x: at.x + p.dx * at.scale, y: at.y + p.dy * at.scale, scale: at.scale, alpha: grow, vein: gold, lineW: 1.8 };
      if (!gold) { st.gold = ["#3a2a1c", "#3a2a1c", "#3a2a1c"]; st.grad = false; st.line = "#f2c75c"; }
      if (step === need) { st.line = "#7cc8ff"; st.lineW = 2.4; }
      K.draw(c, p.shape, st);
    });
    if (step >= 1 && step <= 4) {
      c.font = "600 15px 'Noto Sans Thai',system-ui,sans-serif"; c.textBaseline = "middle";
      U.part_names.forEach(function (name, i) {
        if (step < i + 1) return;
        var p = set[i], B = p.shape.belly, q = T(B.x + p.dx, B.y + p.dy);
        var tw = c.measureText(name).width, lx = i === 1 ? q.x - B.r * at.scale - tw - 18 : q.x + B.r * at.scale + 14;
        lx = Math.max(6, Math.min(w - tw - 6, lx));
        c.fillStyle = "rgba(18,12,10,.8)"; c.fillRect(lx - 5, q.y - 12, tw + 10, 24);
        c.fillStyle = "#f6ecd6"; c.fillText(name, lx, q.y);
      });
      c.textBaseline = "alphabetic";
    }
    $("steptext").textContent = (step + 1) + " · " + U.steps[step];
  }

  function go(n) {
    step = (n + N) % N; born = performance.now() / 1000;
    document.querySelectorAll("[data-step]").forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-step") === step); });
    if (reduce) draw(0);
  }
  function stop() { playing = false; clearInterval(timer); $("tplay").textContent = U.play; }
  document.querySelectorAll("[data-step]").forEach(function (b) { b.addEventListener("click", function () { stop(); go(+b.getAttribute("data-step")); }); });
  $("tplay").addEventListener("click", function () {
    if (playing) { stop(); return; }
    playing = true; $("tplay").textContent = U.pause; go(0);
    timer = setInterval(function () { if (step >= N - 1) stop(); else go(step + 1); }, 2600);
  });
  var on = false, raf = 0;
  function tick(t) { draw(t / 1000); if (on && !reduce) raf = requestAnimationFrame(tick); }
  new IntersectionObserver(function (es) { on = es[0].isIntersecting; cancelAnimationFrame(raf); if (on) raf = requestAnimationFrame(tick); }, { rootMargin: "120px" }).observe(cv);
  addEventListener("resize", function () { build(); if (reduce) draw(0); });
  build(); go(5);
};
