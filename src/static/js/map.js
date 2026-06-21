/* Test-site map. Dark Leaflet base (CartoDB dark_matter), one marker per
   operation sized/colored by max yield, plus a fallout / downwinder layer
   for the communities the official films never named. */

(function () {
  const el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;

  // Communities and crews downwind of the program. Not test sites — consequences.
  const FALLOUT = [
    { name: 'St. George, Utah', lat: 37.10, lon: -113.58, note: 'Heavy fallout from Nevada shots, esp. Upshot-Knothole "Dirty Harry" (1953). High downwinder cancer rates.' },
    { name: 'Rongelap Atoll', lat: 11.16, lon: 166.89, note: 'Blanketed by Castle Bravo fallout (1954). Residents suffered acute radiation sickness and decades of exile.' },
    { name: 'Utirik Atoll', lat: 11.23, lon: 169.85, note: 'Exposed to Castle Bravo fallout (1954); population evacuated.' },
    { name: 'Daigo Fukuryu Maru', lat: 11.88, lon: 166.0, note: 'Japanese tuna boat coated in Bravo fallout 80 mi away. Crewman Aikichi Kuboyama died; sparked the global anti-nuclear movement.' },
    { name: 'Honolulu, Hawaii', lat: 21.31, lon: -157.86, note: 'Starfish Prime EMP (1962) knocked out streetlights ~900 mi from the Johnston Island burst.' },
    { name: 'Tularosa Basin, NM', lat: 33.40, lon: -106.0, note: 'Downwind of Trinity (1945). Residents never warned; still excluded from federal compensation.' },
  ];

  const map = L.map('map', { worldCopyJump: true, minZoom: 2 }).setView([20, -40], 3);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);

  const yieldColor = (c) => ({ low: '#44dd55', med: '#ffb000', high: '#ff3b1f' }[c] || '#888');

  const sites = L.layerGroup().addTo(map);
  const fallout = L.layerGroup().addTo(map);

  GZ.loadOperations().then((ops) => {
    const bounds = [];
    ops.forEach((o) => {
      if (o.latitude == null || o.longitude == null) return;
      bounds.push([o.latitude, o.longitude]);
      const r = Math.max(6, Math.min(26, 4 + Math.log10(Math.max(1, o.max_yield_kt)) * 4));
      L.circleMarker([o.latitude, o.longitude], {
        radius: r, color: yieldColor(o.yield_category), weight: 1.5,
        fillColor: yieldColor(o.yield_category), fillOpacity: 0.45,
      })
        .bindPopup(
          `<strong>${GZ.esc(o.name)}</strong> · ${o.year}<br>` +
          `${GZ.esc(o.location_name)}<br>` +
          `Max yield: ${GZ.esc(o.yield_label)} · ${o.total_tests} tests` +
          (o.hiroshima_equiv ? `<br>${GZ.fmtNum(o.hiroshima_equiv)} Hiroshimas` : '') +
          `<br><a href="/operations/${GZ.esc(o.slug)}/">View operation →</a>`
        )
        .addTo(sites);
    });

    FALLOUT.forEach((p) => {
      L.marker([p.lat, p.lon], {
        icon: L.divIcon({
          className: '', html: '<div style="width:11px;height:11px;border-radius:50%;background:#39c0c0;box-shadow:0 0 8px #39c0c0;border:1px solid #0a0a0a"></div>',
          iconSize: [11, 11], iconAnchor: [6, 6],
        }),
      }).bindPopup(`<strong>${GZ.esc(p.name)}</strong><br>${GZ.esc(p.note)}`).addTo(fallout);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 4 });

    L.control.layers(null, { 'Test sites': sites, 'Fallout / downwinders': fallout },
      { collapsed: false }).addTo(map);

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const d = L.DomUtil.create('div', 'map-legend');
      d.innerHTML =
        '<div class="row"><span class="dot" style="color:#44dd55"></span> &lt; 50 kt</div>' +
        '<div class="row"><span class="dot" style="color:#ffb000"></span> 50 kt – 1 Mt</div>' +
        '<div class="row"><span class="dot" style="color:#ff3b1f"></span> &gt; 1 Mt</div>' +
        '<div class="row"><span class="dot" style="color:#39c0c0"></span> Fallout / downwind</div>';
      return d;
    };
    legend.addTo(map);
  });
})();
