/* kranok.js — a kranok flame from one equation: how fast the line bends at each point along it.
   K.flame(o) returns {spine, outline, vein}; K.draw(ctx, shape, style) paints it gold on lacquer. */
(function () {
  var TAU = Math.PI * 2;
  var K = {};

  // Bending along the line, s from 0 (the curl's eye) to 1 (the flame's tip).
  // Near the eye it bends like a logarithmic spiral (bending ~ 1/distance), then eases,
  // then bends back the other way for the flick at the tip.
  K.bend = function (s, o) {
    var e = o.eye, c = o.curlEnd;
    var curl = o.a / (s + e) * (s < c ? 1 : Math.exp(-(s - c) * (s - c) / 0.006));
    var body = o.body;
    var flick = -o.flick * Math.exp(-Math.pow((s - 0.86) / 0.09, 2));
    return curl + body + flick;
  };

  // curl turns -> a, so the curl winds o.turns times between the eye and curlEnd
  K.opts = function (p) {
    var o = {
      turns: 1.4, eye: 0.02, curlEnd: 0.24, body: 0.5, flick: 6, width: 0.4,
      teeth: 4, depth: 0.45, lean: 0.25, len: 100, mirror: false, sharp: 1.5, hook: 1.3, taper: 0.7, saiEnd: 0.8
    };
    for (var k in p) o[k] = p[k];
    o.a = (o.turns * TAU) / Math.log((o.curlEnd + o.eye) / o.eye);
    return o;
  };

  K.spine = function (o, n) {
    n = n || 260;
    var pts = [], th = 0, x = 0, y = 0, ds = 1 / n;
    for (var i = 0; i <= n; i++) {
      var s = i * ds;
      pts.push({ s: s, x: x, y: y, th: th });
      // midpoint step
      var km = K.bend(s + ds / 2, o);
      var thm = th + km * ds / 2;
      x += Math.cos(thm) * ds; y += Math.sin(thm) * ds;
      th += km * ds;
    }
    return pts;
  };

  function profile(s, o) {
    var c = o.curlEnd, rise = 0.07;
    if (s <= c) return 1;                                   // the curl is limited by its own turns, below
    var u = (s - c) / (1 - c);
    var bell = 1;
    return bell * Math.pow(Math.max(0, 1 - u), o.taper) ;
  }

  // place the raw curve: base (end of curl) at origin, tip straight up then leaned, length o.len.
  // The line itself is the front edge; the body hangs off its back, notched; inside the curl the
  // body grows only as wide as the gap to the next turn, so the head fills in gold and the spiral
  // shows as the black line between its turns.
  K.flame = function (p) {
    var o = K.opts(p), raw = K.spine(o, p.n);
    var ic = Math.round(o.curlEnd * (raw.length - 1));
    var b = raw[ic], t = raw[raw.length - 1];
    var dx = t.x - b.x, dy = t.y - b.y, d = Math.hypot(dx, dy);
    var rot = -Math.PI / 2 - Math.atan2(dy, dx) + o.lean;
    var sc = o.len / d, cr = Math.cos(rot), sr = Math.sin(rot), m = o.mirror ? -1 : 1;
    function tf(q) {
      var X = (q.x - b.x) * sc, Y = (q.y - b.y) * sc;
      return { x: m * (X * cr - Y * sr), y: X * sr + Y * cr };
    }
    var sp = raw.map(function (q) { var r = tf(q); r.s = q.s; return r; });
    var back = [], tips = [], lastF = 0, W = o.width * o.len / d * d;   // width in output units
    W = o.width * o.len;
    var bb = 1 / o.a, G = Math.exp(TAU / o.a), gapK = 0.8 * (G - 1) / (1 + bb * bb);
    function tipAt(i) {
      var q0 = back[back.length - 1], b0 = sp[i - 1], b1 = sp[Math.min(sp.length - 1, i + 1)];
      var a1 = Math.atan2(q0.y - b0.y, q0.x - b0.x), a2 = Math.atan2(b1.y - b0.y, b1.x - b0.x);
      var dd = Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
      tips.push({ x: q0.x, y: q0.y, ang: a1 + dd * 0.45, s: sp[i].s });
    }
    var c = o.curlEnd, t0 = c + 0.06, tEnd = 0.9, ws = [];
    for (var i = 0; i < sp.length; i++) {
      var a0 = sp[Math.max(0, i - 1)], a1 = sp[Math.min(sp.length - 1, i + 1)];
      var tx = a1.x - a0.x, ty = a1.y - a0.y, tl = Math.hypot(tx, ty) || 1;
      var nx = ty / tl, ny = -tx / tl;                     // the back: away from the curl's centre
      if (o.mirror) { nx = -nx; ny = -ny; }
      var s = sp[i].s, w = W * profile(s, o);
      if (s < c) w = Math.min(w, gapK * (s + o.eye) / o.a * o.len / d);   // no wider than the gap to the next turn
      else if (s < c + 0.12) {                                           // ease from the head into the body
        var wc = Math.min(W, gapK * (c + o.eye) / o.a * o.len / d), k = (s - c) / 0.12;
        k = k * k * (3 - 2 * k); w = wc + (w - wc) * k;
      }
      ws.push(w);
      var tooth = 0;
      if (o.teeth > 0 && s > t0 && s < tEnd) {
        var ph = (s - t0) / (tEnd - t0) * o.teeth, f = ph - Math.floor(ph);
        tooth = o.depth * w * Math.pow(f, o.sharp);
        if (f < lastF) tipAt(i);
        lastF = f;
      } else if (lastF > 0 && s >= tEnd) { tipAt(i); lastF = 0; }
      var ux = tx / tl, uy = ty / tl, fw = tooth * o.hook, ww = w * (1 - o.depth * 0.5) + tooth;
      back.push({ x: sp[i].x + nx * ww + ux * fw, y: sp[i].y + ny * ww + uy * fw, nx: nx, ny: ny });
    }
    var outline = sp.map(function (q) { return { x: q.x, y: q.y }; }).concat(back.slice().reverse());
    // the inner line (sai): a pointed leaf inside the body, round at the curl, closing near the tip
    var vein = [], vb = [], s0 = c - 0.04, se = o.saiEnd;
    for (var j = 0; j < sp.length; j++) {
      var q = sp[j];
      if (q.s < s0 || q.s > se) continue;
      var u = (q.s - s0) / (se - s0), h = 0.5 * Math.sin(Math.PI * Math.pow(u, 0.55)), mid = 0.42;
      var bk = back[j], wj = ws[j];
      vein.push({ x: q.x + bk.nx * wj * (mid - h * 0.5), y: q.y + bk.ny * wj * (mid - h * 0.5) });
      vb.push({ x: q.x + bk.nx * wj * (mid + h * 0.5), y: q.y + bk.ny * wj * (mid + h * 0.5) });
    }
    vein = vein.concat(vb.reverse());
    var tp = sp[sp.length - 1], tq = sp[sp.length - 4];
    return { spine: sp, outline: outline, vein: vein, o: o, tips: tips, tip: { x: tp.x, y: tp.y, ang: Math.atan2(tp.y - tq.y, tp.x - tq.x) } };
  };

  // three-flame kranok (กนกสามตัว): curl (ตัวเหงา), sheath (กาบ), flame (ยอด) from one foot
  K.samTua = function (p) {
    var L = p.len || 100, lean = p.lean == null ? 0.18 : p.lean, mir = !!p.mirror, m = mir ? -1 : 1;
    var base = { teeth: p.teeth == null ? 3 : p.teeth, depth: p.depth == null ? 0.55 : p.depth, flick: p.flick == null ? 7 : p.flick, mirror: mir, turns: p.turns || 1.15 };
    function f(q) { var r = {}; for (var k in base) r[k] = base[k]; for (var k2 in q) r[k2] = q[k2]; return r; }
    // stacked up the diagonal as in the teaching drawing: curl low and in front, sheath behind it, flame on top
    var parts = [
      { role: "ngao", shape: K.flame(f({ len: L * 0.42, lean: lean + 0.1, teeth: Math.max(0, base.teeth - 1) })), dx: L * 0.15 * m, dy: 0 },
      { role: "kab", shape: K.flame(f({ len: L * 0.56, lean: lean - 0.05, teeth: Math.max(0, base.teeth - 1) })), dx: -L * 0.08 * m, dy: -L * 0.12 },
      { role: "yod", shape: K.flame(f({ len: L * 0.8, lean: lean + 0.12, teeth: base.teeth + 1 })), dx: L * 0.06 * m, dy: -L * 0.37 }
    ];
    return parts;
  };

  K.bbox = function (pts) {
    var b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    pts.forEach(function (p) { b.x0 = Math.min(b.x0, p.x); b.y0 = Math.min(b.y0, p.y); b.x1 = Math.max(b.x1, p.x); b.y1 = Math.max(b.y1, p.y); });
    return b;
  };
  // where to put a shape (and how big) so its outline fills a box, centred
  K.fitIn = function (pts, x, y, w, h) {
    var b = K.bbox(pts), sc = Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0));
    return { x: x + w / 2 - (b.x0 + b.x1) / 2 * sc, y: y + h / 2 - (b.y0 + b.y1) / 2 * sc, scale: sc };
  };

  K.area = function (pts) {
    var a = 0;
    for (var i = 0, n = pts.length; i < n; i++) { var p = pts[i], q = pts[(i + 1) % n]; a += p.x * q.y - q.x * p.y; }
    return Math.abs(a) / 2;
  };

  K.path = function (ctx, pts, close) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      if (i) ctx.lineTo(pts[i].x, pts[i].y); else ctx.moveTo(pts[i].x, pts[i].y);
    }
    if (close) ctx.closePath();
  };

  K.GOLD = ["#f7dd8a", "#d9a636", "#a8741c"];
  K.LACQUER = "#120c0a";

  // style: {x, y, scale, rot, gold, line, lineW, vein, alpha, grad}
  K.draw = function (ctx, shape, st) {
    st = st || {};
    ctx.save();
    ctx.translate(st.x || 0, st.y || 0);
    if (st.rot) ctx.rotate(st.rot);
    if (st.scale) ctx.scale(st.scale, st.scale);
    if (st.alpha != null) ctx.globalAlpha = st.alpha;
    var sc = st.scale || 1, lw = (st.lineW || 1.6) / sc, g = st.gold || K.GOLD;
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    K.path(ctx, shape.outline, true);
    if (st.fill !== false) {
      if (st.grad !== false) {
        var L = shape.o.len, gr = ctx.createLinearGradient(-L * 0.3, L * 0.1, L * 0.3, -L);
        gr.addColorStop(0, g[2]); gr.addColorStop(0.5, g[1]); gr.addColorStop(1, g[0]);
        ctx.fillStyle = gr;
      } else ctx.fillStyle = g[1];
      ctx.fill();
    }
    if (st.line !== false) {
      ctx.strokeStyle = st.line || K.LACQUER; ctx.lineWidth = lw; ctx.stroke();
      if (st.vein !== false && shape.vein.length > 2) {
        K.path(ctx, shape.vein, true); ctx.lineWidth = lw * 0.8; ctx.stroke();
      }
    }
    ctx.restore();
  };

  K.drawSamTua = function (ctx, parts, st) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], s = {};
      for (var k in st) s[k] = st[k];
      var sc = st.scale || 1, r = st.rot || 0;
      s.x = (st.x || 0) + (p.dx * Math.cos(r) - p.dy * Math.sin(r)) * sc;
      s.y = (st.y || 0) + (p.dx * Math.sin(r) + p.dy * Math.cos(r)) * sc;
      K.draw(ctx, p.shape, s);
    }
  };

  // logarithmic and Archimedean spirals, for the curl section
  K.logSpiral = function (b, turns, r0, n) {
    var pts = [];
    n = n || 400;
    for (var i = 0; i <= n; i++) {
      var t = -turns * TAU + (i / n) * turns * TAU, r = r0 * Math.exp(b * t);
      pts.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
    }
    return pts;
  };
  K.archSpiral = function (turns, rmax, n) {
    var pts = [];
    n = n || 400;
    for (var i = 0; i <= n; i++) {
      var t = (i / n) * turns * TAU, r = rmax * t / (turns * TAU);
      pts.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
    }
    return pts;
  };

  window.K = K;
})();

/* ก้านขด — the scroll: a wave of stem, and from each flank a branch that bends harder and
   harder until it winds into a curl in the next hollow; flames sprout along the branch. */
(function (K) {
  var TAU = Math.PI * 2;

  // walk a line by its bending; bend(s) in radians per unit length, s in [0, L]
  K.walk = function (x, y, th, L, bend, n) {
    n = n || 180;
    var pts = [], ds = L / n;
    for (var i = 0; i <= n; i++) {
      var s = i * ds;
      pts.push({ x: x, y: y, th: th, s: s });
      var km = bend(s + ds / 2), thm = th + km * ds / 2;
      x += Math.cos(thm) * ds; y += Math.sin(thm) * ds; th += km * ds;
    }
    return pts;
  };

  // ribbon around a polyline with width w(u), u in [0,1]
  K.ribbon = function (pts, w) {
    var L = [], R = [], n = pts.length - 1;
    for (var i = 0; i <= n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)];
      var tx = b.x - a.x, ty = b.y - a.y, tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl, h = w(i / n) / 2;
      L.push({ x: pts[i].x + nx * h, y: pts[i].y + ny * h });
      R.push({ x: pts[i].x - nx * h, y: pts[i].y - ny * h });
    }
    return L.concat(R.reverse());
  };

  // o: {w, h, waves, amp, turns, size, leaves}
  K.scroll = function (o) {
    var lam = o.w / o.waves, A = o.amp * o.h / 2, cy = o.h / 2, stems = [], leaves = [], eyes = [];
    var main = [];
    for (var i = 0; i <= 400; i++) {
      var x = -lam * 0.25 + i / 400 * (o.w + lam * 0.5), ph = (x / lam) * TAU;
      main.push({ x: x, y: cy - A * Math.cos(ph) });
    }
    stems.push({ pts: main, w: o.stem, order: 0 });
    var count = Math.ceil(o.waves * 2) + 1;
    for (var k = -1; k < count; k++) {
      var down = (k % 2 + 2) % 2 === 0;                 // descending flank after a crest
      var x0 = lam * (k / 2 + 0.25 + (o.offset || 0)), ph0 = (x0 / lam) * TAU;
      var y0 = cy - A * Math.cos(ph0), slope = A * Math.sin(ph0) * TAU / lam;
      var th0 = Math.atan2(slope, 1);
      var sgn = down ? -1 : 1;                          // turn left after a crest, right after a trough
      var Lb = lam * o.size, e = Lb * 0.06;
      var turnsTot = o.turns * TAU;
      var c = turnsTot / Math.log((Lb + e) / e);
      var br = K.walk(x0, y0, th0 + sgn * 0.35, Lb, function (s) { return sgn * c / (Lb - s + e); }, 220);
      stems.push({ pts: br, w: o.stem * 0.9, order: 1, k: k });
      eyes.push({ x: br[br.length - 1].x, y: br[br.length - 1].y, th: br[br.length - 1].th, sgn: sgn, k: k });
      // flames on the outside of the branch, leaning forward like flames on a turning wheel
      var nl = o.leaves;
      for (var j = 0; j < nl; j++) {
        var u = o.from + j * ((o.to - o.from) / Math.max(1, nl - 1)), q = br[Math.round(u * (br.length - 1))];
        var out = q.th - sgn * Math.PI / 2;
        var size = Lb * o.leaf * Math.pow(1 - u, 0.9);
        leaves.push({ x: q.x, y: q.y, ang: out + sgn * o.tilt, len: size, mirror: sgn > 0, k: k, u: u });
      }
    }
    return { stems: stems, leaves: leaves, eyes: eyes, lam: lam };
  };
})(window.K);
