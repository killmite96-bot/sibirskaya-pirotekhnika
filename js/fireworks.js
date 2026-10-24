(function () {
  const cv = document.getElementById("fx"); if (!cv) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = cv.getContext("2d");
  let W, H, S, dpr;
  const fit = () => {
    const r = cv.getBoundingClientRect(); dpr = 1;
    W = cv.width = Math.max(1, r.width * dpr); H = cv.height = Math.max(1, r.height * dpr);
    S = Math.min(W, H * 1.4) / 900 * (dpr > 1 ? 1 : 1.2);   // общий масштаб скоростей и размеров
  };
  fit(); addEventListener("resize", fit);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const PALETTES = [
    [[48, 100, 62], [40, 100, 55]],            // золото
    [[0, 90, 58], [350, 90, 62]],              // красный
    [[130, 80, 55], [150, 80, 60]],            // зелёный
    [[205, 90, 62], [220, 90, 66]],            // синий
    [[280, 80, 66], [300, 70, 68]],            // фиолетовый
    [[0, 0, 96], [50, 40, 92]],                // серебро
    [[22, 100, 58], [38, 100, 60]]             // оранжевый
  ];

  let raf, parts = [], rockets = [], flashes = [], glow = 0, last = 0, next = 600, running = true;
  const MAX = innerWidth < 700 ? 500 : 1100;

  function Spark(x, y, vx, vy, o) {
    return Object.assign({ x, y, px: x, py: y, vx, vy, life: 1, decay: .012, h: 48, s: 100, l: 62, size: 1.4, drag: .985, g: .045, trail: true, tw: false, crackle: false, white: 0 }, o);
  }

  function launch(x) {
    if (!running) return;
    const sx = x ?? rnd(W * .15, W * .9);
    const ty = rnd(H * .12, H * .45);
    rockets.push({ x: sx, y: H + 6, vx: rnd(-.5, .5) * S, vy: -rnd(11, 15) * S * (H / 700) ** .5, ty, wob: rnd(0, 6), pal: pick(PALETTES), t: 0 });
  }

  function explode(x, y, pal) {
    const types = ["chrys", "chrys", "willow", "crackle", "palm"];
    const type = pick(types);
    const c1 = pick(pal), c2 = pick(pick(PALETTES));
    flashes.push({ x, y, r: rnd(28, 46) * S, a: .7, h: c1[0] });
    glow = Math.min(.3, glow + .08);
    const base = rnd(4.2, 6.2) * S;
    const add = (n, f) => { for (let i = 0; i < n && parts.length < MAX; i++) parts.push(f(i, n)); };
    const dir = () => { const a = rnd(0, Math.PI * 2); return [Math.cos(a), Math.sin(a)]; };
    if (type === "peony") add(rnd(110, 150) | 0, () => { const [dx, dy] = dir(), v = base * Math.sqrt(rnd(.25, 1)); return Spark(x, y, dx * v, dy * v, { h: c1[0] + rnd(-6, 6), s: c1[1], l: c1[2], decay: rnd(.008, .013), size: rnd(1.4, 2.2) * S, trail: false, tw: true }); });
    if (type === "chrys") add(rnd(90, 120) | 0, () => { const [dx, dy] = dir(), v = base * rnd(.25, 1.15); return Spark(x, y, dx * v, dy * v, { h: c1[0], s: c1[1], l: c1[2], decay: rnd(.007, .01), size: rnd(1.2, 1.8) * S, drag: .978, trail: true, crackle: Math.random() < .35 }); });
    if (type === "willow") add(rnd(80, 110) | 0, () => { const [dx, dy] = dir(), v = base * rnd(.5, .95); return Spark(x, y, dx * v, dy * v, { h: 42, s: 95, l: 66, decay: rnd(.0035, .0055), size: rnd(1.2, 1.7) * S, drag: .972, g: .06, trail: true, tw: true }); });
    if (type === "ring") { const tilt = rnd(.35, 1), rot = rnd(0, 6.28); add(70, (i, n) => { const a = i / n * Math.PI * 2, px = Math.cos(a) * base * 1.05, py = Math.sin(a) * base * 1.05 * tilt; return Spark(x, y, px * Math.cos(rot) - py * Math.sin(rot), px * Math.sin(rot) + py * Math.cos(rot), { h: c1[0], s: c1[1], l: c1[2], decay: .011, size: 1.9 * S, trail: false, tw: true }); }); }
    if (type === "double") { add(70, () => { const [dx, dy] = dir(), v = base * rnd(.9, 1.05); return Spark(x, y, dx * v, dy * v, { h: c1[0], s: c1[1], l: c1[2], decay: .011, size: 1.8 * S, trail: false, tw: true }); });
      add(60, () => { const [dx, dy] = dir(), v = base * rnd(.35, .55); return Spark(x, y, dx * v, dy * v, { h: c2[0], s: c2[1], l: c2[2], decay: .013, size: 1.8 * S, trail: false, tw: true }); }); }
    if (type === "crackle") add(90, () => { const [dx, dy] = dir(), v = base * rnd(.2, 1.1); return Spark(x, y, dx * v, dy * v, { h: 45, s: 90, l: 75, decay: rnd(.009, .014), size: 1.5 * S, trail: true, crackle: true }); });
    if (type === "palm") add(9, (i, n) => { const a = -Math.PI / 2 + (i / (n - 1) - .5) * 2.4 + rnd(-.1, .1), v = base * rnd(.9, 1.1); return Spark(x, y, Math.cos(a) * v, Math.sin(a) * v, { h: c1[0], s: c1[1], l: c1[2], decay: .006, size: 2.6 * S, drag: .985, g: .05, trail: true, tw: true, palm: true }); });
    // яркое «ядро» вспышки
    add(14, () => { const [dx, dy] = dir(), v = rnd(.2, 1.2) * S; return Spark(x, y, dx * v, dy * v, { h: 50, s: 40, l: 92, decay: .06, size: 2.5 * S, trail: false, g: 0 }); });
  }

  function step(dt) {
    // фоновая подсветка неба
    if (glow > .01) { const g = ctx.createRadialGradient(W / 2, H * .35, 0, W / 2, H * .35, W * .6); g.addColorStop(0, `rgba(255,235,170,${glow * .18})`); g.addColorStop(1, "rgba(255,235,170,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); glow *= .9; }

    rockets = rockets.filter(r => {
      r.t += dt; r.wob += .25;
      r.x += r.vx + Math.sin(r.wob) * .35 * S; r.y += r.vy * dt; r.vy += .22 * S * dt; // замедляется
      // искры хвоста
      for (let i = 0; i < 2 && parts.length < MAX; i++) parts.push(Spark(r.x, r.y, rnd(-.5, .5) * S, rnd(.4, 1.6) * S, { h: rnd(28, 46), s: 100, l: rnd(60, 78), decay: rnd(.035, .06), size: rnd(.8, 1.4) * S, drag: .94, g: .05, trail: false }));
      ctx.globalAlpha = 1; ctx.fillStyle = "hsl(45,100%,88%)"; ctx.beginPath(); ctx.arc(r.x, r.y, 1.9 * S, 0, 7); ctx.fill();
      if (r.vy > -2.2 * S || r.y < r.ty) { explode(r.x, r.y, r.pal); return false; }
      return true;
    });

    flashes = flashes.filter(f => {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, `hsla(${f.h},90%,90%,${f.a * .55})`); g.addColorStop(.4, `hsla(${f.h},100%,65%,${f.a * .15})`); g.addColorStop(1, `hsla(${f.h},100%,60%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
      f.a -= .08 * dt; return f.a > 0;
    });

    const born = [];
    parts = parts.filter(p => {
      p.px = p.x; p.py = p.y;
      p.vx *= Math.pow(p.drag, dt); p.vy = p.vy * Math.pow(p.drag, dt) + p.g * S * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt;
      if (p.life <= 0) {
        if (p.crackle) for (let i = 0; i < 4 && parts.length + born.length < MAX; i++) born.push(Spark(p.x, p.y, rnd(-1.6, 1.6) * S, rnd(-1.6, 1.6) * S, { h: 50, s: 60, l: 90, decay: rnd(.05, .09), size: rnd(.9, 1.4) * S, trail: false, g: .03, tw: true }));
        return false;
      }
      const t = p.life;
      let a = Math.min(1, t * 1.8);
      if (p.tw) a *= Math.random() < .25 ? .35 : 1;               // мерцание
      const light = p.l + (1 - t) * -8 + (t > .85 ? (t - .85) * 120 : 0); // в начале раскалены добела, затем остывают
      const sat = p.s;
      ctx.strokeStyle = ctx.fillStyle = `hsla(${p.h},${sat}%,${Math.min(95, light)}%,${a})`;
      if (p.trail) {
        ctx.lineWidth = p.size; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.px - p.vx * .6, p.py - p.vy * .6); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (.5 + t * .6), 0, 7); ctx.fill();
      }
      return p.y < H + 20;
    });
    if (born.length) parts.push(...born);
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min(2.2, (t - (frame.t || t)) / 16.67); frame.t = t;
    // шлейфы: плавно стираем прошлый кадр
    ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    if (t > next) { const n = Math.random() < .25 ? 2 + (Math.random() < .4) : 1; for (let i = 0; i < n; i++) setTimeout(launch, i * rnd(150, 450)); next = t + rnd(900, 2100); }
    step(dt);
    ctx.globalCompositeOperation = "source-over";
    (raf = requestAnimationFrame(frame));
  }

  // Пауза и полный сброс, когда салют ушёл из видимости; при возвращении снаряды летят заново
  const reset = () => { parts = []; rockets = []; flashes = []; glow = 0; ctx.clearRect(0, 0, W, H); };
  const start = () => {
    if (running && frame.on) return;
    reset(); running = true; frame.on = true; frame.t = 0; next = 0;
    (raf = requestAnimationFrame(frame));
    launch(W * rnd(.55, .8)); setTimeout(() => running && launch(W * rnd(.25, .5)), 450);
  };
  const stop = () => { cancelAnimationFrame(raf); running = false; frame.on = false; reset(); };
  new IntersectionObserver(e => e[0].isIntersecting && !document.hidden ? start() : stop(), { threshold: 0 }).observe(cv);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (cv.getBoundingClientRect().bottom > 0 && cv.getBoundingClientRect().top < innerHeight) start(); });
  // то же по прокрутке: надёжнее, чем один IntersectionObserver
  const inView = () => { const r = cv.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  let wasIn = null;
  const check = () => { const v = inView() && !document.hidden; if (v === wasIn) return; wasIn = v; v ? start() : stop(); };
  addEventListener("scroll", check, { passive: true }); addEventListener("resize", check);
  check();
  cv.parentElement.addEventListener("click", e => {
    if (e.target.closest("a,button")) return;
    const r = cv.getBoundingClientRect(); launch((e.clientX - r.left) * W / r.width);
  });
})();





