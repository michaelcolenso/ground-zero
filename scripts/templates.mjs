// HTML templates for the static build. Plain template literals — no framework.
// Every page flows through layout() so the header, footer, design system and
// meta tags stay in one place.

import { formatYield } from '../lib/enrich.mjs';

export const SITE = {
  name: 'Ground Zero',
  tagline: 'Atmospheric Nuclear Test Film Archive',
  url: process.env.SITE_URL || 'https://groundzero.xyz',
};

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
export { esc };

export function fmtDate(iso) {
  if (!iso) return null;
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(iso);
  if (!m) return iso;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (m[3]) return `${months[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
  if (m[2]) return `${months[+m[2] - 1]} ${m[1]}`;
  return m[1];
}

const num = (n) => (n == null ? '—' : n.toLocaleString('en-US'));

const NAV = [
  ['/', 'Home'],
  ['/operations/', 'Operations'],
  ['/films/', 'Films'],
  ['/map/', 'Map'],
  ['/timeline/', 'Timeline'],
];

export function layout({
  title, description, path = '/', ogImage, bodyClass = '',
  head = '', content = '', scripts = [], active = '',
}) {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const desc = description || 'Declassified U.S. atmospheric nuclear test films from the Internet Archive, given a home: metadata, maps, timelines and the human cost.';
  const canonical = SITE.url + path;
  const img = ogImage || `${SITE.url}/og-default.svg`;
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title || SITE.name + ' — ' + SITE.tagline)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title || SITE.name)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
${head}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <div class="brand">
      <a href="/"><span class="logo">Ground Zero</span></a>
      <span class="tagline">${esc(SITE.tagline)}</span>
    </div>
    <nav class="nav" aria-label="Primary">${nav}</nav>
  </div>
</header>
<main id="main"><div class="wrap">
${content}
</div></main>
<footer class="site-footer"><div class="wrap">
  <span>Films courtesy of the <a href="https://archive.org/" rel="noopener">Internet Archive</a> · public-domain U.S. government records.</span>
  <span>Yield &amp; aftermath data: DOE/NV-209. <a href="/about/">About &amp; sources</a></span>
</div></footer>
<script src="/js/app.js"></script>
${scripts.map((s) => `<script src="${s}"></script>`).join('\n')}
</body>
</html>`;
}

/* ---- Home ----------------------------------------------------------------- */
export function homePage({ stats, featured, operations }) {
  const f = featured;
  const hiro = f.hiroshima_equiv;
  return layout({
    path: '/', active: '/',
    content: `
<section class="hero">
  <div class="hero-title">
    <p class="sub">Declassified · ${stats.year_min}–${stats.year_max}</p>
    <h1>The films of the atomic age, given a home.</h1>
    <p class="lede">Between ${stats.year_min} and ${stats.year_max} the United States detonated hundreds of nuclear weapons in the open air and filmed nearly all of it. The footage has sat on the Internet Archive for twenty years. This is a way to actually look at it.</p>
    <div class="btn-row">
      <a class="btn accent" href="/films/">Browse the archive</a>
      <a class="btn" href="#" data-random-film>↻ Random film</a>
    </div>
  </div>
  <aside class="hero-film">
    <a href="/films/${esc(f.slug)}/" style="color:inherit;text-decoration:none">
      <span class="thumb" style="background-image:url('${esc(f.thumbnail_url)}')"></span>
    </a>
    <div class="body">
      <span class="badge yield ${f.yield_category}"><span class="dot"></span>${esc(f.yield_label)}${hiro ? ` · ${num(hiro)} Hiroshimas` : ''}</span>
      <h3 style="margin:.6rem 0 .2rem"><a href="/films/${esc(f.slug)}/" style="color:var(--text-primary)">${esc(f.title)}</a></h3>
      <p class="muted" style="font-size:.84rem;margin:0">${[esc(f.operation_name || 'Standalone'), fmtDate(f.test_date)].filter(Boolean).join(' · ')}</p>
      <div class="btn-row" style="margin:.9rem 0 0">
        <a class="btn accent" href="/films/${esc(f.slug)}/">▶ Watch</a>
        <a class="btn" href="#" data-random-film>→ Next</a>
      </div>
    </div>
  </aside>
</section>

<div class="counter">
  <div class="days" data-days-since="${stats.last_atmospheric_test}">—</div>
  <div class="label">days since the last U.S. atmospheric nuclear test · ${fmtDate(stats.last_atmospheric_test)}</div>
</div>

<div class="section-label">Largest test in the archive</div>
<div class="yieldbar">
  <div class="n">${esc(stats.largest_test.yield_label)}</div>
  <div class="track"><span class="fill" style="width:100%"></span></div>
  <div class="cap"><a href="/operations/${esc(stats.largest_test.slug)}/">${esc(stats.largest_test.name)}</a> — about ${num(stats.largest_test.hiroshima_equiv)} Hiroshima bombs in a single detonation.</div>
</div>

<div class="section-label">By the numbers</div>
<div class="stats">
  <div class="stat"><div class="k">Operations</div><div class="v count">${stats.operation_count}</div></div>
  <div class="stat"><div class="k">Films</div><div class="v count">${stats.film_count}</div></div>
  <div class="stat"><div class="k">Documented tests</div><div class="v count">${stats.test_count}</div></div>
  <div class="stat"><div class="k">Span</div><div class="v">${stats.year_min}–${stats.year_max}</div></div>
  <div class="stat"><div class="k">Total IA views</div><div class="v">${num(stats.total_documented_views)}</div></div>
</div>

<div class="section-label">Operations</div>
<div class="op-badges">
  ${operations.map((o) => `<a href="/operations/${esc(o.slug)}/">${esc(o.name)} <span class="yr">${o.year}</span></a>`).join('\n  ')}
</div>
`,
  });
}

/* ---- Operations browse ---------------------------------------------------- */
export function operationsPage() {
  return layout({
    title: 'Operations', path: '/operations/', active: '/operations/',
    description: 'Every U.S. atmospheric nuclear test series with a film record, from Trinity (1945) to Dominic (1962).',
    content: `
<h1>Operations</h1>
<p class="lede">Each atmospheric test series, in order of escalation.</p>
<div class="controls">
  <label for="o-sort">Sort</label>
  <select id="o-sort">
    <option value="year-asc">Year (earliest)</option>
    <option value="year-desc">Year (latest)</option>
    <option value="yield-desc">Max yield (highest)</option>
    <option value="tests-desc">Most tests</option>
    <option value="name-asc">Name (A–Z)</option>
  </select>
  <span class="count-readout" id="o-count"></span>
</div>
<div class="grid ops" data-browse="operations"></div>
`,
    scripts: ['/js/browse.js'],
  });
}

/* ---- Films browse --------------------------------------------------------- */
export function filmsPage() {
  return layout({
    title: 'Films', path: '/films/', active: '/films/',
    description: 'Browse every declassified atmospheric nuclear test film in the archive. Filter by operation, sort by yield, date or views.',
    content: `
<h1>Films</h1>
<p class="lede">${'' /* count filled client-side */}Every film in the archive. Filter, sort, and follow the yield.</p>
<div class="controls">
  <label for="f-op">Operation</label>
  <select id="f-op"><option value="">All operations</option></select>
  <label for="f-sort">Sort</label>
  <select id="f-sort">
    <option value="yield-desc">Yield (highest)</option>
    <option value="yield-asc">Yield (lowest)</option>
    <option value="date-asc">Date (earliest)</option>
    <option value="date-desc">Date (latest)</option>
    <option value="views-desc">Most viewed on IA</option>
    <option value="title-asc">Title (A–Z)</option>
  </select>
  <span class="count-readout" id="f-count"></span>
</div>
<div class="grid cards" data-browse="films"></div>
`,
    scripts: ['/js/browse.js'],
  });
}

/* ---- Film detail ---------------------------------------------------------- */
export function filmPage(f, related) {
  const hiro = f.hiroshima_equiv;
  const date = fmtDate(f.test_date);
  const metaLine = [f.yield_label, date, f.location].filter(Boolean).join(' · ');
  const desc = f.description
    ? f.description.slice(0, 200)
    : `${f.title} — ${metaLine}. Declassified U.S. nuclear test film.`;

  return layout({
    title: f.test_name && f.test_name.length < 40 ? `${f.test_name} — ${f.operation_name || f.title}` : f.title,
    path: `/films/${f.slug}/`,
    description: desc,
    ogImage: f.thumbnail_url,
    content: `
<p class="crumbs"><a href="/films/">← All films</a>${f.operation_name ? ` · <a href="/operations/${esc(f.operation_slug)}/">${esc(f.operation_name)}</a>` : ''}</p>
<h1>${esc(f.title)}</h1>
<p class="lede">${esc(metaLine)}${hiro ? ` · ${num(hiro)} Hiroshimas` : ''}</p>

<div class="detail-grid" style="margin-top:1.4rem">
  <div>
    <div class="player">
      <iframe src="${esc(f.embed_url)}" allow="fullscreen" allowfullscreen loading="lazy" title="${esc(f.title)} — Internet Archive player"></iframe>
    </div>
    ${f.description ? `<div class="prose" style="margin-top:1.4rem">${f.description.split('\n').map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
    ${f.aftermath ? `<div class="aftermath panel" style="margin-top:1.4rem">
      <div class="section-label">Aftermath</div>
      <div class="prose">${f.aftermath.split('\n').map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>` : ''}
    <div class="btn-row" style="margin-top:1.6rem">
      <a class="btn accent" href="${esc(f.ia_url)}" rel="noopener">View on Internet Archive ↗</a>
      <a class="btn" href="#" data-random-film>↻ Random film</a>
    </div>
  </div>

  <aside>
    <div class="panel">
      <div class="section-label" style="margin-top:0">Details</div>
      <dl class="kv">
        ${f.operation_name ? `<dt>Operation</dt><dd><a href="/operations/${esc(f.operation_slug)}/">${esc(f.operation_name)}</a></dd>` : ''}
        ${f.test_name ? `<dt>Test</dt><dd>${esc(f.test_name)}</dd>` : ''}
        ${date ? `<dt>Date</dt><dd>${esc(date)}</dd>` : ''}
        <dt>Yield</dt><dd><strong>${esc(f.yield_label)}</strong>${hiro ? ` <span class="muted">(${num(hiro)} Hiroshimas)</span>` : ''}</dd>
        ${f.location ? `<dt>Location</dt><dd>${esc(f.location)}</dd>` : ''}
        ${f.weapon ? `<dt>Weapon</dt><dd>${esc(f.weapon)}</dd>` : ''}
        ${f.creator ? `<dt>Source</dt><dd>${esc(f.creator)}</dd>` : ''}
        <dt>IA views</dt><dd>${num(f.downloads)}</dd>
        <dt>IA ID</dt><dd><span class="muted">${esc(f.ia_identifier)}</span></dd>
      </dl>
    </div>
    ${related && related.length ? `<div class="panel">
      <div class="section-label" style="margin-top:0">Other films in this operation</div>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.6rem">
        ${related.map((r) => `<li><a href="/films/${esc(r.slug)}/">${esc(r.title)}</a><br><span class="muted" style="font-size:.76rem">${esc(r.yield_label)}${r.test_date ? ' · ' + esc(fmtDate(r.test_date)) : ''}</span></li>`).join('')}
      </ul>
    </div>` : ''}
  </aside>
</div>
`,
  });
}

/* ---- Operation detail ----------------------------------------------------- */
export function operationDetailPage(o, films) {
  const hiro = o.hiroshima_equiv;
  return layout({
    title: o.name,
    path: `/operations/${o.slug}/`,
    description: o.purpose,
    ogImage: films[0] ? films[0].thumbnail_url : undefined,
    content: `
<p class="crumbs"><a href="/operations/">← All operations</a></p>
<h1>${esc(o.name)} <span class="dim" style="font-weight:400">${o.year}</span></h1>
<p class="lede">${esc(o.purpose)}</p>

<div class="stats" style="margin:1.4rem 0">
  <div class="stat"><div class="k">Year</div><div class="v">${o.year}</div></div>
  <div class="stat"><div class="k">Tests</div><div class="v count">${o.total_tests}</div></div>
  <div class="stat"><div class="k">Max yield</div><div class="v">${esc(o.yield_label)}</div></div>
  ${hiro ? `<div class="stat"><div class="k">Hiroshimas</div><div class="v count">${num(hiro)}</div></div>` : ''}
  <div class="stat"><div class="k">Films</div><div class="v">${o.film_count}</div></div>
</div>

<div class="prose" style="margin-bottom:1rem"><p>${esc(o.description)}</p>${o.legacy ? `<p class="muted">${esc(o.legacy)}</p>` : ''}</div>

<dl class="kv" style="margin:1.2rem 0">
  <dt>Location</dt><dd>${esc(o.location_name)}</dd>
  <dt>Country</dt><dd>${esc(o.country)}</dd>
  <dt>Coordinates</dt><dd>${o.latitude}, ${o.longitude} · <a href="/map/">view on map →</a></dd>
</dl>

<div class="section-label">Films (${films.length})</div>
${films.length
    ? `<div class="grid cards">${films.map((f) => filmCardStatic(f)).join('')}</div>`
    : '<p class="empty">No films catalogued for this operation yet.</p>'}
`,
  });
}

// Static (server-rendered) film card, mirrors GZ.filmCard in app.js.
function filmCardStatic(f) {
  const date = fmtDate(f.test_date);
  return `<article class="card"><a href="/films/${esc(f.slug)}/">
    <span class="thumb" style="background-image:url('${esc(f.thumbnail_url)}')">
      <span class="ovl"><span class="badge yield ${f.yield_category}"><span class="dot"></span>${esc(f.yield_label)}</span></span>
    </span>
    <span class="body"><span class="title">${esc(f.title)}</span>
    <span class="meta">${[esc(f.test_name || ''), date].filter(Boolean).join(' · ')}</span></span>
  </a></article>`;
}

/* ---- Map ------------------------------------------------------------------ */
export function mapPage() {
  return layout({
    title: 'Map', path: '/map/', active: '/map/',
    description: 'Every U.S. atmospheric nuclear test site mapped, sized by yield, with a fallout and downwinder layer.',
    head: `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">`,
    content: `
<h1>Test sites</h1>
<p class="lede">Marker size and color track the largest yield at each site. Toggle the fallout layer to see who lived downwind.</p>
<div id="map" style="margin-top:1.2rem"></div>
`,
    scripts: [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      '/js/map.js',
    ],
  });
}

/* ---- Timeline ------------------------------------------------------------- */
export function timelinePage() {
  return layout({
    title: 'Timeline', path: '/timeline/', active: '/timeline/',
    description: 'Yield over time on a log scale: the slow climb to 1951, the vertical wall of Ivy Mike, and the megaton era that followed.',
    content: `
<h1>Yield over time</h1>
<p class="lede">Each dot is a filmed test, plotted by date against yield on a logarithmic scale. Watch the line break the sky in 1952. Hover for detail; click to open a film.</p>
<div class="chart-wrap" style="margin-top:1.2rem">
  <canvas id="timeline" role="img" aria-label="Scatter plot of nuclear test yields from 1945 to 1962 on a logarithmic scale"></canvas>
  <div class="chart-tip" id="timeline-tip"></div>
</div>
<div class="legend-keys" id="timeline-legend"></div>
`,
    scripts: ['/js/timeline.js'],
  });
}

/* ---- About / sources ------------------------------------------------------ */
export function aboutPage(stats) {
  return layout({
    title: 'About & Sources', path: '/about/',
    description: 'What Ground Zero is, where the films and data come from, and why the human cost is never left out.',
    content: `
<h1>About &amp; sources</h1>
<div class="prose">
<p><strong>Ground Zero</strong> is a curated front end for the declassified U.S. atmospheric nuclear test films held by the Internet Archive. The films — public-domain U.S. government records — have been online for two decades. What was missing was a way to browse them with the context they demand: yields, dates, locations, and the consequences for the people downwind.</p>
<p>The archive currently covers <strong>${stats.operation_count} operations</strong> and <strong>${stats.film_count} films</strong>, spanning ${stats.year_min}–${stats.year_max}.</p>
</div>

<div class="section-label">Films</div>
<div class="prose"><p>All footage is streamed directly from the <a href="https://archive.org/" rel="noopener">Internet Archive</a> via its embedded player. Nothing is rehosted. If an item moves, its identifier is updated in the dataset.</p></div>

<div class="section-label">Yield &amp; test data</div>
<div class="prose"><p>Yields, dates and locations follow the U.S. Department of Energy's public-domain accounting, <em>United States Nuclear Tests 1945–1992</em> (DOE/NV-209, Rev. 16), cross-checked against the per-operation historical record.</p></div>

<div class="section-label">Aftermath &amp; human cost</div>
<div class="prose"><p>The aftermath notes draw on the public record of fallout exposure and displacement: the Marshallese of Rongelap and Utirik, the crew of the <em>Daigo Fukuryu Maru</em>, the Nevada and Tularosa Basin downwinders. These films were made to document weapons. They also document what those weapons did to people who never chose to be near them.</p></div>

<div class="section-label">Colophon</div>
<div class="prose"><p>Static site, no tracking, no build step beyond a single Node script. Source data and the full reference list live in the repository.</p></div>
`,
  });
}

/* ---- Random redirect (static) --------------------------------------------- */
export function randomPage(slugs) {
  return layout({
    title: 'Random film', path: '/random/',
    head: `<meta name="robots" content="noindex">`,
    content: `<div class="spinner">SELECTING A FILM AT RANDOM…</div>
<noscript><p class="empty">Enable JavaScript, or <a href="/films/">browse the archive</a>.</p></noscript>`,
    scripts: [],
  }).replace('</body>', `<script>
    var S=${JSON.stringify(slugs)};
    location.replace('/films/'+S[Math.floor(Math.random()*S.length)]+'/');
  </script></body>`);
}

/* ---- 404 ------------------------------------------------------------------ */
export function notFoundPage() {
  return layout({
    title: 'Not found', path: '/404.html',
    content: `<h1>404 · No record</h1>
<p class="lede">That page isn't in the archive.</p>
<div class="btn-row"><a class="btn accent" href="/">Home</a><a class="btn" href="/films/">Browse films</a><a class="btn" href="#" data-random-film>Random film</a></div>`,
  });
}
