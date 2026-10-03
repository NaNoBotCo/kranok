/* app.js — every canvas on the page. Geometry lives in kranok.js (window.K). */
(function () {
  "use strict";
  var U = window.UI || {}, TAU = Math.PI * 2, DPR = Math.min(2, window.devicePixelRatio || 1);
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CARD = document.documentElement.classList.contains("card");
  var $ = function (id) { return document.getElementById(id); };
  var GOLD = K.GOLD, LAC = K.LACQUER;

  function fit(cv, h) {
    var w = cv.clientWidth || 600;
    if (typeof h === "function") h = h(w);
    cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); cv.style.height = h + "px";
    var c = cv.getContext("2d"); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { c: c, w: w, h: h };
  }
  function lacquer(c, w, h) {
    var g = c.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, "#22160f"); g.addColorStop(1, "#0d0807");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }
  function stemFill(c, pts, w0, w1, upto) {
    if (upto != null) pts = pts.slice(0, Math.max(2, Math.round(upto * (pts.length - 1)) + 1));
    if (pts.length < 2) return;
    var poly = K.ribbon(pts, function (u) { return w0 + (w1 - w0) * u; });
    K.path(c, poly, true); c.fillStyle = GOLD[1]; c.fill();
    c.strokeStyle = LAC; c.lineWidth = 1.4; c.lineJoin = "round"; c.stroke();
  }
  function knob(c, x, y, r) {
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = GOLD[0]; c.fill(); c.strokeStyle = LAC; c.lineWidth = 1.3; c.stroke();
    c.beginPath(); c.arc(x, y, r * 0.38, 0, TAU); c.fillStyle = LAC; c.fill();
  }
  function onVisible(el, fn) {
    if (!("IntersectionObserver" in window)) { fn(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting); }); }, { rootMargin: "120px" }).observe(el);
  }
  function loop(el, draw) {
    var on = false, raf = 0;
    function tick(t) { draw(t / 1000); if (on && !reduce) raf = requestAnimationFrame(tick); }
    onVisible(el, function (v) { on = v; cancelAnimationFrame(raf); if (v) raf = requestAnimationFrame(tick); });
    return function () { if (!on || reduce) draw(performance.now() / 1000); };
  }
  function slider(id, fn) { var e = $(id); if (e) e.addEventListener("input", fn); return e; }
  function fmt(n, d) { return Number(n).toLocaleString(U.lang === "th" ? "th-TH" : "en-US", { maximumFractionDigits: d == null ? 1 : d, minimumFractionDigits: d == null ? 0 : d }); }

  /* krachang: a row of upright leaves, each two mirrored flames meeting at a point */
  function krachangRow(c, x0, x1, y, size, up) {
    var n = Math.max(3, Math.round((x1 - x0) / (size * 0.62))), step = (x1 - x0) / n;
    var a = K.flame({ len: size, lean: 0.32, teeth: 2, depth: 0.5, turns: 1.1, width: 0.2, flick: 4 });
    var b = K.flame({ len: size, lean: 0.32, teeth: 2, depth: 0.5, turns: 1.1, width: 0.2, flick: 4, mirror: true });
    for (var i = 0; i < n; i++) {
      var x = x0 + step * (i + 0.5), r = up ? 0 : Math.PI;
      K.draw(c, b, { x: x - size * 0.13, y: y, rot: r, lineW: 1.2 });
      K.draw(c, a, { x: x + size * 0.13, y: y, rot: r, lineW: 1.2 });
    }
  }

  /* ---------- hero: a scroll grows across the lacquer; flames lean away from your pointer ---------- */
  (function hero() {
    var cv = $("scene"); if (!cv) return;
    var S, leaves, W, H, t0 = null, px = -9999, py = -9999, wind = 0, g;
    function build() {
      g = fit(cv, function () { return CARD ? 630 : Math.max(460, Math.min(innerHeight * 0.78, 720)); });
      W = g.w; H = g.h;
      var bandH = Math.min(H * 0.56, Math.max(W * 0.42, 250)), waves = Math.max(1.5, Math.round(W / 420 * 2) / 2);
      S = K.scroll({ w: W, h: bandH, waves: waves, amp: 0.5, turns: 1.35, size: 0.86, leaves: 6, leaf: 0.36, stem: Math.max(8, bandH * 0.035), from: 0.14, to: 0.76, tilt: 0.62 });
      S.y0 = H - bandH - Math.min(70, H * 0.1);
      leaves = S.leaves.map(function (l) {
        return { l: l, f: K.flame({ len: l.len, mirror: l.mirror, teeth: 2, width: 0.2, flick: 6 }), ph: Math.random() * TAU };
      });
    }
    build();
    addEventListener("resize", function () { var w = cv.clientWidth; if (Math.abs(w - W) > 30) { build(); kick(); } });
    cv.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; wind = 1; });
    cv.addEventListener("pointerleave", function () { px = py = -9999; });
    function draw(t) {
      if (t0 == null) t0 = t;
      var c = g.c, grow = CARD || reduce ? 1 : Math.min(1, (t - t0) / 5.5), y0 = S.y0;
      lacquer(c, W, H);
      krachangRow(c, 0, W, H - 4, Math.min(46, W / 16), true);
      c.save(); c.translate(0, y0);
      var lam = S.lam, x1 = grow * (W + lam * 0.5);
      S.stems.forEach(function (st) {
        if (st.order === 0) {
          var n = st.pts.length - 1, u = Math.min(1, (x1 + lam * 0.25) / (W + lam * 0.5));
          stemFill(c, st.pts, st.w, st.w, u);
        } else {
          var bx = st.pts[0].x, u2 = Math.max(0, Math.min(1, (x1 - bx) / (lam * 0.7)));
          if (u2 > 0) stemFill(c, st.pts, st.w, st.w * 0.38, u2);
        }
      });
      leaves.forEach(function (o) {
        var l = o.l, bx = S.stems[0].pts[0].x, st = null;
        var u2 = Math.max(0, Math.min(1, (x1 - (l.x - (l.x - bx) * 0)) / (lam * 0.7)));
        var k = Math.max(0, Math.min(1, (x1 - l.x) / (lam * 0.4)));
        if (k <= 0) return;
        var dx = l.x - px, dy = l.y + y0 - py, d2 = dx * dx + dy * dy;
        var push = px < -999 ? 0 : 0.7 * Math.exp(-d2 / (160 * 160)) * (dx > 0 ? 1 : -1);
        var sway = reduce || CARD ? 0 : 0.05 * Math.sin(t * 1.4 + o.ph);
        K.draw(c, o.f, { x: l.x, y: l.y, rot: l.ang + Math.PI / 2 + sway + push, scale: k, lineW: 1.3 });
      });
      S.eyes.forEach(function (e) {
        var k = Math.max(0, Math.min(1, (x1 - e.x) / (lam * 0.6)));
        if (k > 0.6) knob(c, e.x, e.y, Math.max(4, S.lam * 0.016));
      });
      c.restore();
    }
    var kick = loop(cv, draw);
    if (CARD || reduce) draw(0);
  })();

  /* ---------- the curl: logarithmic vs Archimedean spiral ---------- */
  (function curl() {
    var cv = $("curlcv"); if (!cv) return;
    var kind = "log", g;
    var bIn = $("cb"), tIn = $("ct");
    function draw() {
      g = fit(cv, function (w) { return Math.min(440, w * 0.9); });
      var c = g.c, w = g.w, h = g.h, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44;
      lacquer(c, w, h);
      var b = +bIn.value, turns = +tIn.value;
      // radial guides
      c.strokeStyle = "rgba(247,221,138,.13)"; c.lineWidth = 1;
      for (var i = 0; i < 12; i++) { var a = i * TAU / 12; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R * 1.05, cy + Math.sin(a) * R * 1.05); c.stroke(); }
      var pts = kind === "log" ? K.logSpiral(b, turns, R, 600) : K.archSpiral(turns, R, 600);
      pts = pts.map(function (p) { return { x: cx + p.x, y: cy + p.y }; });
      stemFill(c, pts, 1.5, Math.max(4, R * 0.05));
      // crossings on the ray to the right: the gaps between turns
      c.fillStyle = GOLD[0]; c.font = "600 13px system-ui,sans-serif";
      var rs = [];
      for (var k = 0; k <= Math.floor(turns); k++) {
        var r = kind === "log" ? R * Math.exp(-b * k * TAU) : R * (1 - k / turns);
        if (r < 2) break; rs.push(r);
        c.beginPath(); c.arc(cx + r, cy, 4, 0, TAU); c.fill();
      }
      for (var j = 1; j < rs.length; j++) {
        var lab = kind === "log" ? "×" + fmt(rs[j - 1] / rs[j], 2) : "+" + fmt((rs[j - 1] - rs[j]) / R * 100, 0) + "%";
        c.fillText(lab, cx + (rs[j] + rs[j - 1]) / 2 - 14, cy - 10 - j * 3);
      }
      // the constant angle (log only): tangent vs radius at a few points
      if (kind === "log") {
        var alpha = Math.atan(1 / b);
        c.strokeStyle = "rgba(120,200,255,.8)"; c.lineWidth = 1.4;
        [0.6, 1.6, 2.6].forEach(function (k2) {
          var th = -k2 * Math.PI, r = R * Math.exp(b * th);
          if (r < 10) return;
          var x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
          c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
          var ta = th + alpha;
          c.beginPath(); c.moveTo(x - Math.cos(ta) * 26, y - Math.sin(ta) * 26); c.lineTo(x + Math.cos(ta) * 26, y + Math.sin(ta) * 26); c.stroke();
          c.beginPath(); c.arc(x, y, 12, th + Math.PI, th + Math.PI + alpha, false); c.stroke();
        });
      }
      $("cr1").textContent = kind === "log" ? "×" + fmt(Math.exp(b * TAU), 2) : U.same_gap;
      $("cr2").textContent = kind === "log" ? fmt(Math.atan(1 / b) * 180 / Math.PI, 0) + "°" : U.changes;
    }
    document.querySelectorAll("[data-curl]").forEach(function (bt) {
      bt.addEventListener("click", function () {
        kind = bt.getAttribute("data-curl");
        document.querySelectorAll("[data-curl]").forEach(function (x) { x.setAttribute("aria-pressed", x === bt); });
        $("cbw").hidden = kind !== "log"; draw();
      });
    });
    slider("cb", draw); slider("ct", draw);
    addEventListener("resize", draw); draw();
  })();

  /* ---------- one flame from one graph: bending along the line ---------- */
  (function bend() {
    var cv = $("bendcv"); if (!cv) return;
    var ids = ["bturns", "bflick", "bteeth", "bdepth"], g;
    function opts() {
      return { turns: +$("bturns").value, flick: +$("bflick").value, teeth: +$("bteeth").value, depth: +$("bdepth").value };
    }
    function draw(t) {
      if (!g || cv.width !== Math.round(cv.clientWidth * DPR)) g = fit(cv, function (w) { return w < 560 ? w * 1.25 : Math.min(420, w * 0.5); });
      var c = g.c, w = g.w, h = g.h, o = opts();
      lacquer(c, w, h);
      var narrow = w < 560, gw = narrow ? w - 32 : w * 0.5 - 30, gh = narrow ? h * 0.36 : h - 60, gx = 22, gy = narrow ? 24 : 30;
      var f = K.flame({ len: narrow ? h * 0.48 : h * 0.78, turns: o.turns, flick: o.flick, teeth: o.teeth, depth: o.depth, lean: 0.15 });
      var oo = f.o, N = 200, ks = [], kmax = 0, kmin = 0;
      for (var i = 0; i <= N; i++) { var s = i / N, k = K.bend(s, oo); ks.push(k); }
      ks.forEach(function (k) { kmin = Math.min(kmin, k); });
      kmax = 16;
      var span = Math.max(1, kmax - Math.min(0, kmin));
      var y0 = gy + gh * (kmax / span);
      // axes
      c.strokeStyle = "rgba(247,221,138,.25)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(gx, y0); c.lineTo(gx + gw, y0); c.stroke();
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.stroke();
      c.fillStyle = "rgba(247,221,138,.7)"; c.font = "13px system-ui,sans-serif";
      c.fillText(U.b_axis_y, gx + 6, gy + 12);
      c.fillText(U.b_axis_x, gx + gw - c.measureText(U.b_axis_x).width, y0 + 16);
      c.fillText(U.b_eye, gx, gy + gh + 16); var tl = U.b_tip; c.fillText(tl, gx + gw - c.measureText(tl).width, gy + gh + 16);
      c.save(); c.beginPath(); c.rect(gx, gy - 4, gw + 4, gh + 8); c.clip();
      c.beginPath();
      ks.forEach(function (k, i) { var x = gx + i / N * gw, y = y0 - k / span * gh; if (i) c.lineTo(x, y); else c.moveTo(x, y); });
      c.strokeStyle = GOLD[0]; c.lineWidth = 2.2; c.stroke(); c.restore();
      // moving marker
      var u = reduce ? 0.6 : (t * 0.12) % 1, ku = ks[Math.round(u * N)];
      var mx = gx + u * gw, my = Math.max(gy, y0 - ku / span * gh);
      c.fillStyle = "#7cc8ff"; c.beginPath(); c.arc(mx, my, 5, 0, TAU); c.fill();
      // the flame
      var box = narrow ? [16, gy + gh + 30, w - 32, h - gh - gy - 46] : [w * 0.55, 20, w * 0.4, h - 40];
      var at = K.fitIn(f.outline, box[0], box[1], box[2], box[3]);
      K.draw(c, f, at);
      var sp = f.spine[Math.round(u * (f.spine.length - 1))];
      c.fillStyle = "#7cc8ff"; c.beginPath(); c.arc(at.x + sp.x * at.scale, at.y + sp.y * at.scale, 5, 0, TAU); c.fill();
    }
    var kick = loop(cv, draw);
    ids.forEach(function (id) { slider(id, function () { kick(); }); });
    addEventListener("resize", function () { g = null; kick(); });
  })();

  /* ---------- kranok within kranok ---------- */
  (function nest() {
    var cv = $("nestcv"); if (!cv) return;
    function draw() {
      var g = fit(cv, function (w) { return Math.min(520, w * 0.95); });
      var c = g.c, w = g.w, h = g.h, depth = +$("ndepth").value, r = +$("nratio").value;
      lacquer(c, w, h);
      var count = 0, area = 0, items = [];
      var proto = K.flame({ len: 1, teeth: 3, depth: 0.6, turns: 1.15 }), A1 = K.area(proto.outline);
      function grow(x, y, ang, len, d, mir) {
        var f = K.flame({ len: len, teeth: 3, depth: 0.6, mirror: mir, lean: 0 }), R = ang + Math.PI / 2;
        items.push({ f: f, x: x, y: y, rot: R, len: len });
        count++; area += A1 * len * len;
        if (d <= 0) return;
        var ca = Math.cos(R), sa = Math.sin(R);
        f.tips.forEach(function (tp) {
          grow(x + tp.x * ca - tp.y * sa, y + tp.x * sa + tp.y * ca, tp.ang + R - (mir ? -1 : 1) * 0.5, len * r, d - 1, mir);
        });
      }
      grow(0, 0, -Math.PI / 2, 100, depth, false);
      var all = [];
      items.forEach(function (it) {
        var ca = Math.cos(it.rot), sa = Math.sin(it.rot);
        for (var i = 0; i < it.f.outline.length; i += 6) { var p = it.f.outline[i]; all.push({ x: it.x + p.x * ca - p.y * sa, y: it.y + p.x * sa + p.y * ca }); }
      });
      var at = K.fitIn(all, 20, 20, w - 40, h - 40);
      items.forEach(function (it) {
        K.draw(c, it.f, { x: at.x + it.x * at.scale, y: at.y + it.y * at.scale, rot: it.rot, scale: at.scale, lineW: Math.max(0.6, Math.min(1.6, it.len * at.scale / 60)) });
      });
      var m = 3, q = m * r * r;
      $("ncount").textContent = fmt(count, 0);
      $("ngold").textContent = q < 1 ? "×" + fmt(1 / (1 - q), 2) : "∞";
    }
    slider("ndepth", draw); slider("nratio", draw); addEventListener("resize", draw);
    onVisible(cv, function (v) { if (v) draw(); });
  })();

  /* ---------- scroll stem ---------- */
  (function scroll() {
    var cv = $("scrollcv"); if (!cv) return;
    var g, S, LV, bones = false, t0 = null;
    function build() {
      g = fit(cv, function (w) { return Math.max(260, Math.min(380, w * 0.42)); });
      var waves = +$("swaves").value;
      S = K.scroll({ w: g.w, h: g.h * 0.92, waves: waves, amp: 0.5, turns: +$("sturns").value, size: 0.82, leaves: +$("sleaves").value, leaf: 0.3, stem: Math.max(6, g.h * 0.03), from: 0.14, to: 0.78, tilt: 0.62 });
      LV = S.leaves.map(function (l) { return K.flame({ len: l.len, mirror: l.mirror, teeth: 2, width: 0.2, flick: 6 }); });
    }
    function draw(t) {
      if (t0 == null) t0 = t;
      var c = g.c, w = g.w, h = g.h, grow = reduce ? 1 : Math.min(1, (t - t0) / 3.5), lam = S.lam, x1 = grow * (w + lam * 0.5);
      lacquer(c, w, h);
      c.save(); c.translate(0, h * 0.04);
      if (bones) {
        c.lineWidth = 2; c.strokeStyle = GOLD[0];
        S.stems.forEach(function (st) { K.path(c, st.pts, false); c.stroke(); });
        c.fillStyle = "#7cc8ff"; S.leaves.forEach(function (l) { c.beginPath(); c.arc(l.x, l.y, 3.5, 0, TAU); c.fill(); });
        S.eyes.forEach(function (e) { c.beginPath(); c.arc(e.x, e.y, 3.5, 0, TAU); c.fill(); });
      } else {
        S.stems.forEach(function (st) {
          if (st.order === 0) stemFill(c, st.pts, st.w, st.w, Math.min(1, (x1 + lam * 0.25) / (w + lam * 0.5)));
          else { var u2 = Math.max(0, Math.min(1, (x1 - st.pts[0].x) / (lam * 0.7))); if (u2 > 0) stemFill(c, st.pts, st.w, st.w * 0.38, u2); }
        });
        S.leaves.forEach(function (l, i) {
          var k = Math.max(0, Math.min(1, (x1 - l.x) / (lam * 0.4)));
          if (k > 0) K.draw(c, LV[i], { x: l.x, y: l.y, rot: l.ang + Math.PI / 2, scale: k, lineW: 1.2 });
        });
        S.eyes.forEach(function (e) { if (x1 - e.x > lam * 0.36) knob(c, e.x, e.y, Math.max(3.5, lam * 0.016)); });
      }
      c.restore();
    }
    var kick = loop(cv, draw);
    ["swaves", "sturns", "sleaves"].forEach(function (id) { slider(id, function () { build(); t0 = -99; kick(); }); });
    $("sgrow").addEventListener("click", function () { t0 = null; build(); kick(); });
    $("sbones").addEventListener("click", function () { bones = !bones; this.setAttribute("aria-pressed", bones); kick(); });
    addEventListener("resize", function () { build(); kick(); });
    build();
  })();

  /* ---------- seven ways to repeat along a band, and the rosette ---------- */
  (function border() {
    var cv = $("friezecv"); if (!cv) return;
    var kind = "p1";
    // which copies of the motif sit in half-cell j: [flip left-right, flip top-bottom]
    var OPS = {
      p1: function () { return [[0, 0]]; },
      p11g: function (j) { return [[0, j % 2]]; },
      p1m1: function (j) { return [[j % 2, 0]]; },
      p11m: function () { return [[0, 0], [0, 1]]; },
      p2: function (j) { return [[j % 2, j % 2]]; },
      p2mg: function (j) { var m = j % 4; return [[m % 2, m >> 1]]; },
      p2mm: function (j) { return [[j % 2, 0], [j % 2, 1]]; }
    };
    function draw() {
      var g = fit(cv, function (w) { return Math.max(170, Math.min(240, w * 0.26)); });
      var c = g.c, w = g.w, h = g.h, cy = h / 2, s = h * 0.5;
      lacquer(c, w, h);
      var motif = K.flame({ len: s, teeth: 3, depth: 0.6, lean: 0.42 });
      var cw = s * 0.62, n = Math.ceil(w / cw) + 2;
      c.strokeStyle = "rgba(247,221,138,.14)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, cy); c.lineTo(w, cy); c.stroke();
      for (var j = 0; j < n; j++) {
        var x = j * cw;
        OPS[kind](j).forEach(function (f) {
          c.save(); c.translate(x + cw / 2, cy); c.scale(f[0] ? -1 : 1, f[1] ? -1 : 1);
          K.draw(c, motif, { x: -cw * 0.3, y: -h * 0.03, lineW: 1.2 });
          c.restore();
        });
      }
      var d = U.frieze[kind];
      $("fname").textContent = d[0]; $("fdesc").textContent = d[1];
    }
    document.querySelectorAll("[data-f]").forEach(function (b) {
      b.addEventListener("click", function () {
        kind = b.getAttribute("data-f");
        document.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        draw();
      });
    });
    addEventListener("resize", draw); onVisible(cv, function (v) { if (v) draw(); });
  })();

  (function rosette() {
    var cv = $("rosecv"); if (!cv) return;
    var spin = 0, g;
    function draw(t) {
      if (!g || cv.width !== Math.round(cv.clientWidth * DPR)) g = fit(cv, function (w) { return Math.min(420, w * 0.9); });
      var c = g.c, w = g.w, h = g.h, n = +$("rn").value, mir = $("rm").getAttribute("aria-pressed") === "true";
      lacquer(c, w, h);
      var R = Math.min(w, h) * 0.46, cx = w / 2, cy = h / 2;
      var ln = mir ? 0.1 : 0.35;
      var f = K.flame({ len: R * 0.8, teeth: 3, depth: 0.6, lean: ln });
      var fm = K.flame({ len: R * 0.8, teeth: 3, depth: 0.6, lean: ln, mirror: true });
      var rot0 = reduce ? 0 : t * 0.08;
      for (var i = 0; i < n; i++) {
        var a = rot0 + i * TAU / n;
        var ox = cx + Math.cos(a) * R * 0.16, oy = cy + Math.sin(a) * R * 0.16;
        if (mir) {
          var da = Math.min(0.5, Math.PI / n * 0.42);
          K.draw(c, f, { x: cx + Math.cos(a - da) * R * 0.16, y: cy + Math.sin(a - da) * R * 0.16, rot: a + Math.PI / 2 - da, lineW: 1.2 });
          K.draw(c, fm, { x: cx + Math.cos(a + da) * R * 0.16, y: cy + Math.sin(a + da) * R * 0.16, rot: a + Math.PI / 2 + da, lineW: 1.2 });
        } else K.draw(c, f, { x: ox, y: oy, rot: a + Math.PI / 2, lineW: 1.2 });
      }
      knob(c, cx, cy, R * 0.15);
      $("rsym").textContent = (mir ? "D" : "C") + n + " · " + (mir ? 2 * n : n) + " " + U.r_moves;
    }
    var kick = loop(cv, draw);
    slider("rn", function () { kick(); });
    $("rm").addEventListener("click", function () { this.setAttribute("aria-pressed", this.getAttribute("aria-pressed") !== "true"); kick(); });
    addEventListener("resize", function () { g = null; kick(); });
  })();

  /* ---------- draw your own: your line becomes a stem; it ends in a curl and grows flames ---------- */
  (function own() {
    var cv = $("owncv"); if (!cv) return;
    var g, strokes = [], cur = null, born = [];
    function size() { g = fit(cv, function (w) { return Math.max(320, Math.min(520, w * 0.62)); }); }
    function chaikin(p, k) {
      for (var r = 0; r < k; r++) {
        var q = [p[0]];
        for (var i = 0; i < p.length - 1; i++) {
          var a = p[i], b = p[i + 1];
          q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 }, { x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
        }
        q.push(p[p.length - 1]); p = q;
      }
      return p;
    }
    function resample(p, d) {
      var out = [p[0]], acc = 0;
      for (var i = 1; i < p.length; i++) {
        var a = out[out.length - 1], b = p[i], l = Math.hypot(b.x - a.x, b.y - a.y);
        while (l >= d) { var t = d / l; a = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; out.push(a); l = Math.hypot(b.x - a.x, b.y - a.y); }
      }
      return out;
    }
    function make(raw) {
      var p = resample(chaikin(raw, 3), 3);
      if (p.length < 6) return null;
      var n = p.length, a = p[n - 4], b = p[n - 1], th = Math.atan2(b.y - a.y, b.x - a.x);
      // which way was the line already turning at its end?
      var a2 = p[Math.max(0, n - 20)], tha = Math.atan2(a.y - a2.y, a.x - a2.x), turn = Math.atan2(Math.sin(th - tha), Math.cos(th - tha));
      var sgn = turn >= 0 ? 1 : -1, Lc = Math.min(140, Math.max(50, n * 3 * 0.25)), e = Lc * 0.06, cc = 1.3 * TAU / Math.log((Lc + e) / e);
      var tail = K.walk(b.x, b.y, th, Lc, function (s) { return sgn * cc / (Lc - s + e); }, 90);
      var pts = p.concat(tail.slice(1)), leaves = [], step = 34, side = 1, len = 0;
      for (var i = 6; i < pts.length - 10; i++) {
        len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (len < step) continue; len = 0;
        var q0 = pts[i - 2], q1 = pts[i + 2], tang = Math.atan2(q1.y - q0.y, q1.x - q0.x), u = i / pts.length;
        var inCurl = i > p.length; if (inCurl) side = -sgn;
        var sz = 46 * (1 - u * 0.55);
        leaves.push({ x: pts[i].x, y: pts[i].y, ang: tang + side * (Math.PI / 2 - 0.7), f: K.flame({ len: sz, teeth: 2, width: 0.2, flick: 6, mirror: side > 0 }), u: u });
        if (!inCurl) side = -side;
      }
      return { pts: pts, leaves: leaves, end: pts[pts.length - 1], born: performance.now() / 1000 };
    }
    function paint(t) {
      var c = g.c, w = g.w, h = g.h;
      lacquer(c, w, h);
      if (!strokes.length && !cur) {
        c.fillStyle = "rgba(247,221,138,.55)"; c.font = "17px 'Noto Sans Thai',system-ui,sans-serif"; c.textAlign = "center";
        c.fillText(U.own_hint, w / 2, h / 2); c.textAlign = "start";
      }
      strokes.forEach(function (s) {
        var k = reduce ? 1 : Math.min(1, (t - s.born) / 1.6);
        stemFill(c, s.pts, 9, 3, k);
        s.leaves.forEach(function (l) { var kk = Math.max(0, Math.min(1, (k - l.u) * 4)); if (kk > 0) K.draw(c, l.f, { x: l.x, y: l.y, rot: l.ang + Math.PI / 2, scale: kk, lineW: 1.2 }); });
        if (k >= 1) knob(c, s.end.x, s.end.y, 5);
      });
      if (cur && cur.length > 1) { c.strokeStyle = GOLD[0]; c.lineWidth = 3; c.lineCap = "round"; K.path(c, cur, false); c.stroke(); }
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    cv.addEventListener("pointerdown", function (e) { cv.setPointerCapture(e.pointerId); cur = [pos(e)]; e.preventDefault(); });
    cv.addEventListener("pointermove", function (e) { if (!cur) return; var p = pos(e), l = cur[cur.length - 1]; if (Math.hypot(p.x - l.x, p.y - l.y) > 3) cur.push(p); });
    function end() { if (cur) { var s = make(cur); if (s) strokes.push(s); cur = null; } }
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    $("oclear").addEventListener("click", function () { strokes = []; });
    $("osave").addEventListener("click", function () {
      var a = document.createElement("a"); a.download = "kranok.png"; a.href = cv.toDataURL("image/png"); a.click();
    });
    $("oseed").addEventListener("click", function () {
      var w = g.w, h = g.h, raw = [];
      for (var i = 0; i <= 60; i++) { var u = i / 60; raw.push({ x: w * (0.08 + 0.6 * u), y: h * (0.75 - 0.35 * Math.sin(u * Math.PI * 1.2)) }); }
      var s = make(raw); if (s) strokes.push(s);
    });
    size(); addEventListener("resize", function () { size(); });
    var kick = loop(cv, paint);
  })();

  /* ---------- the three-flame kranok, step by step ---------- */
  (function three() {
    var cv = $("threecv"); if (!cv || !window.THREE_STEPS) return;
    window.THREE_STEPS(cv, { fit: fit, lacquer: lacquer, knob: knob, fmt: fmt });
  })();
})();
