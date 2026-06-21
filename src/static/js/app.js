/* Ground Zero — shared client helpers.
   Data is read from the static /data/*.json snapshots, falling back to the
   /api/* Pages Functions if the snapshots are absent. Either path returns the
   same enriched shape. */

window.GZ = (function () {
  const LAST_ATMOSPHERIC_TEST = '1962-11-04';
  const HIROSHIMA_KT = 15;

  async function getJSON(url) {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`${url} -> ${r.status}`);
    return r.json();
  }

  // Prefer the prebuilt static snapshot (fast, cacheable); fall back to the API.
  async function load(snapshot, api) {
    try {
      return await getJSON(snapshot);
    } catch (e) {
      return getJSON(api);
    }
  }

  const loadFilms = () => load('/data/films.json', '/api/films');
  const loadOperations = () => load('/data/operations.json', '/api/operations');
  const loadStats = () => load('/data/stats.json', '/api/stats').catch(() => null);

  function fmtYield(kt) {
    if (kt == null) return 'Unknown yield';
    if (kt >= 1000) {
      const mt = kt / 1000;
      return `${Number.isInteger(mt) ? mt : mt.toFixed(1)} Mt`;
    }
    return `${kt} kt`;
  }
  function hiroshimas(kt) {
    return kt == null ? null : Math.round(kt / HIROSHIMA_KT);
  }
  function fmtNum(n) {
    return n == null ? '—' : n.toLocaleString('en-US');
  }
  function fmtDate(iso) {
    if (!iso) return null;
    const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(iso);
    if (!m) return iso;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (m[3]) return `${months[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
    if (m[2]) return `${months[+m[2] - 1]} ${m[1]}`;
    return m[1];
  }
  function daysSince(iso) {
    const then = new Date(iso + 'T00:00:00Z').getTime();
    return Math.floor((Date.now() - then) / 86400000);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  // Animate the "days since" counter on the home page.
  function initCounter() {
    document.querySelectorAll('[data-days-since]').forEach((el) => {
      const total = daysSince(el.getAttribute('data-days-since') || LAST_ATMOSPHERIC_TEST);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { el.textContent = total.toLocaleString('en-US'); return; }
      const start = performance.now();
      const dur = 1100;
      function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(total * eased).toLocaleString('en-US');
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // Wire up any "random film" trigger. Lazily loads the film list once.
  let filmCache = null;
  function initRandom() {
    const triggers = document.querySelectorAll('[data-random-film]');
    if (!triggers.length) return;
    triggers.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!filmCache) filmCache = await loadFilms();
        const f = filmCache[Math.floor(Math.random() * filmCache.length)];
        location.href = `/films/${f.slug}/`;
      });
    });
  }

  function yieldClass(cat) {
    return ['low', 'med', 'high'].includes(cat) ? cat : 'unknown';
  }

  function filmCard(f) {
    const date = fmtDate(f.test_date);
    const h = f.hiroshima_equiv;
    return `<article class="card">
      <a href="/films/${esc(f.slug)}/">
        <span class="thumb" style="background-image:url('${esc(f.thumbnail_url)}')">
          <span class="ovl">
            <span class="badge yield ${yieldClass(f.yield_category)}"><span class="dot"></span>${esc(f.yield_label || fmtYield(f.yield_kt))}</span>
          </span>
        </span>
        <span class="body">
          <span class="title">${esc(f.title)}</span>
          <span class="meta">${[esc(f.operation_name || 'Standalone'), date].filter(Boolean).join(' · ')}${
            h ? ` · ${fmtNum(h)} Hiroshimas` : ''
          }</span>
        </span>
      </a>
    </article>`;
  }

  function opCard(o) {
    const h = o.hiroshima_equiv;
    return `<article class="card">
      <a href="/operations/${esc(o.slug)}/">
        <span class="body" style="gap:.55rem">
          <span class="title">${esc(o.name)} <span class="dim" style="font-weight:400">${o.year}</span></span>
          <span class="badge yield ${yieldClass(o.yield_category)}"><span class="dot"></span>max ${esc(o.yield_label || fmtYield(o.max_yield_kt))}</span>
          <span class="prose"><span class="muted" style="font-size:.86rem">${esc(o.purpose)}</span></span>
          <span class="meta">${o.total_tests} tests · ${o.film_count} film${o.film_count === 1 ? '' : 's'}${
            h ? ` · ${fmtNum(h)} Hiroshimas` : ''
          }</span>
        </span>
      </a>
    </article>`;
  }

  return {
    LAST_ATMOSPHERIC_TEST, HIROSHIMA_KT,
    getJSON, loadFilms, loadOperations, loadStats,
    fmtYield, hiroshimas, fmtNum, fmtDate, daysSince, esc,
    yieldClass, filmCard, opCard,
    init() { initCounter(); initRandom(); },
  };
})();

document.addEventListener('DOMContentLoaded', () => GZ.init());
