const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
let particles = [];
let mouse = { x: null, y: null };

function resize() {
  w = Math.floor(window.innerWidth * dpr);
  h = Math.floor(window.innerHeight * dpr);
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  init();
}

function init() {
  const target = Math.floor((w * h) / 90000);
  const count = reduce ? 40 : Math.min(120, Math.max(60, target));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.8 + 0.6,
    a: Math.random() * Math.PI * 2,
    s: (Math.random() * 0.8 + 0.25) * dpr,
    hue: Math.random() < 0.5 ? 175 : 150
  }));
}

function drawStatic() {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
    g.addColorStop(0, `hsla(${p.hue},80%,60%,.24)`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function step() {
  if (reduce) { drawStatic(); return; }
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    p.a += 0.002 + p.s * 0.0005;
    p.x += Math.cos(p.a) * p.s;
    p.y += Math.sin(p.a) * p.s;
    if (mouse.x != null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 160 * dpr) {
        p.x -= dx * 0.002;
        p.y -= dy * 0.002;
      }
    }
    if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
    }
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10);
    g.addColorStop(0, `hsla(${p.hue},80%,60%,.32)`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
    ctx.fill();
  }
  const thr = 120 * dpr;
  ctx.lineWidth = 0.8 * dpr;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    for (let j = i + 1; j < Math.min(particles.length, i + 12); j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d = Math.hypot(dx, dy);
      if (d < thr) {
        const a = 1 - d / thr;
        ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2},80%,55%,${a * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(step);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(step);

window.addEventListener('pointermove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
window.addEventListener('pointerleave', () => { mouse.x = null; mouse.y = null; });
