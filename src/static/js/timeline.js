/* Yield-over-time scatter plot on a log scale.
   The shape is the argument: a slow climb to 1951, the vertical wall of Ivy Mike
   in 1952, Castle Bravo in 1954, then the saturation of the late-1950s Pacific
   series. Canvas, no dependencies, retina-aware, with hover read-out. */

(function () {
  const canvas = document.getElementById('timeline');
  if (!canvas) return;
  const tip = document.getElementById('timeline-tip');
  const ctx = canvas.getContext('2d');

  const PAD = { l: 64, r: 24, t: 28, b: 44 };
  const X_MIN = 1944, X_MAX = 1963;
  const Y_MIN = 1, Y_MAX = 20000; // kt, log10

  // Stable per-operation hues around the amber/orange/red spectrum.
  const PALETTE = ['#ffb000','#ff6600','#ff3b1f','#44dd55','#39c0c0','#c084ff','#ff8fa3','#9acd32','#ffd24a','#ff7847','#5ad1a0','#d98cff'];
  const colorFor = {};
  let pts = [], dpr = 1, geo = null;

  function x(year) { return PAD.l + ((year - X_MIN) / (X_MAX - X_MIN)) * geo.w; }
  function y(kt) {
    const v = Math.max(Y_MIN, kt);
    const t = (Math.log10(v) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN));
    return PAD.t + (1 - t) * geo.h;
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    geo = { W: rect.width, H: rect.height, w: rect.width - PAD.l - PAD.r, h: rect.height - PAD.t - PAD.b };
  }

  function draw(hi) {
    ctx.clearRect(0, 0, geo.W, geo.H);
    ctx.font = '11px ui-monospace, monospace';
    ctx.textBaseline = 'middle';

    // Y grid (decades of kilotons) + Hiroshima reference line.
    const decades = [1, 10, 100, 1000, 10000];
    ctx.strokeStyle = '#241b06';
    ctx.fillStyle = '#7a5a14';
    ctx.textAlign = 'right';
    decades.forEach((d) => {
      const yy = y(d);
      ctx.beginPath(); ctx.moveTo(PAD.l, yy); ctx.lineTo(geo.W - PAD.r, yy); ctx.stroke();
      ctx.fillText(d >= 1000 ? (d / 1000) + ' Mt' : d + ' kt', PAD.l - 8, yy);
    });
    // Hiroshima reference (~15 kt).
    const hy = y(15);
    ctx.strokeStyle = 'rgba(255,59,31,0.45)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, hy); ctx.lineTo(geo.W - PAD.r, hy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,59,31,0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('Hiroshima · 15 kt', PAD.l + 6, hy - 9);

    // X axis years.
    ctx.fillStyle = '#7a5a14';
    ctx.textAlign = 'center';
    for (let yr = 1945; yr <= 1962; yr += 1) {
      if (yr % 2 !== 1 && yr !== 1962) continue;
      ctx.fillText(String(yr), x(yr), geo.H - PAD.b + 16);
    }

    // Points (largest first so small ones stay clickable on top).
    pts.slice().sort((a, b) => b.kt - a.kt).forEach((p) => {
      const isHi = hi && hi.id === p.id;
      ctx.beginPath();
      ctx.arc(p.px, p.py, isHi ? p.r + 3 : p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = isHi ? 1 : 0.82;
      ctx.fill();
      if (isHi) { ctx.globalAlpha = 1; ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
  }

  function place() {
    pts.forEach((p) => {
      p.px = x(p.year);
      p.py = y(p.kt);
      p.r = Math.max(4, Math.min(16, 3 + Math.log10(p.kt) * 2.6));
    });
  }

  function hitTest(mx, my) {
    let best = null, bd = Infinity;
    pts.forEach((p) => {
      const d = Math.hypot(mx - p.px, my - p.py);
      if (d < p.r + 4 && d < bd) { bd = d; best = p; }
    });
    return best;
  }

  function render() { layout(); place(); draw(); }

  GZ.loadFilms().then((films) => {
    let ci = 0;
    pts = films
      .filter((f) => f.yield_kt != null && f.test_date && /^\d{4}/.test(f.test_date))
      .map((f) => {
        const year = +f.test_date.slice(0, 4);
        const key = f.operation_slug || 'standalone';
        if (!colorFor[key]) colorFor[key] = PALETTE[ci++ % PALETTE.length];
        return {
          id: f.slug, year, kt: f.yield_kt, color: colorFor[key],
          title: f.test_name || f.title, op: f.operation_name || 'Standalone',
          label: f.yield_label, hiro: f.hiroshima_equiv, date: f.test_date,
        };
      });
    render();

    // Legend.
    const legend = document.getElementById('timeline-legend');
    if (legend) {
      const seen = new Map();
      pts.forEach((p) => { if (!seen.has(p.op)) seen.set(p.op, p.color); });
      legend.innerHTML = [...seen].map(([op, c]) =>
        `<span class="k"><span class="sw" style="background:${c}"></span>${GZ.esc(op)}</span>`).join('');
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const p = hitTest(mx, my);
      draw(p);
      canvas.style.cursor = p ? 'pointer' : 'default';
      if (p && tip) {
        tip.style.opacity = '1';
        tip.style.left = Math.min(mx + 14, geo.W - 210) + 'px';
        tip.style.top = (my + 14) + 'px';
        tip.innerHTML = `<strong>${GZ.esc(p.title)}</strong><br>${GZ.esc(p.op)} · ${GZ.esc(GZ.fmtDate(p.date))}<br>${GZ.esc(p.label)}${p.hiro ? ` · ${GZ.fmtNum(p.hiro)} Hiroshimas` : ''}`;
      } else if (tip) { tip.style.opacity = '0'; }
    });
    canvas.addEventListener('mouseleave', () => { if (tip) tip.style.opacity = '0'; draw(); });
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const p = hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (p) location.href = `/films/${p.id}/`;
    });
    window.addEventListener('resize', render);
  });
})();
