/* Browse pages: sortable/filterable film and operation grids.
   Driven entirely by markup — the grid container declares data-browse. */

(function () {
  function init() {
    const films = document.querySelector('[data-browse="films"]');
    const ops = document.querySelector('[data-browse="operations"]');
    if (films) browseFilms(films);
    if (ops) browseOps(ops);
  }

  function ctrl(id) { return document.getElementById(id); }

  async function browseFilms(grid) {
    grid.innerHTML = '<div class="spinner">LOADING ARCHIVE…</div>';
    let data;
    try { data = await GZ.loadFilms(); }
    catch { grid.innerHTML = '<div class="empty">Could not load films.</div>'; return; }

    const opSel = ctrl('f-op');
    if (opSel) {
      const opsSeen = [...new Set(data.map((f) => f.operation_name).filter(Boolean))].sort();
      opSel.insertAdjacentHTML('beforeend',
        opsSeen.map((n) => `<option value="${GZ.esc(n)}">${GZ.esc(n)}</option>`).join(''));
    }

    const sortSel = ctrl('f-sort');
    const readout = ctrl('f-count');

    function render() {
      let list = data.slice();
      const op = opSel && opSel.value;
      if (op) list = list.filter((f) => f.operation_name === op);

      const s = sortSel ? sortSel.value : 'yield-desc';
      const cmp = {
        'yield-desc': (a, b) => (b.yield_kt || -1) - (a.yield_kt || -1),
        'yield-asc': (a, b) => (a.yield_kt ?? Infinity) - (b.yield_kt ?? Infinity),
        'date-asc': (a, b) => String(a.test_date || '9999').localeCompare(String(b.test_date || '9999')),
        'date-desc': (a, b) => String(b.test_date || '0').localeCompare(String(a.test_date || '0')),
        'views-desc': (a, b) => (b.downloads || 0) - (a.downloads || 0),
        'title-asc': (a, b) => a.title.localeCompare(b.title),
      }[s] || (() => 0);
      list.sort(cmp);

      grid.innerHTML = list.length
        ? list.map(GZ.filmCard).join('')
        : '<div class="empty">No films match.</div>';
      if (readout) readout.textContent = `${list.length} of ${data.length} films`;
    }

    if (opSel) opSel.addEventListener('change', render);
    if (sortSel) sortSel.addEventListener('change', render);
    render();
  }

  async function browseOps(grid) {
    grid.innerHTML = '<div class="spinner">LOADING OPERATIONS…</div>';
    let data;
    try { data = await GZ.loadOperations(); }
    catch { grid.innerHTML = '<div class="empty">Could not load operations.</div>'; return; }

    const sortSel = ctrl('o-sort');
    const readout = ctrl('o-count');

    function render() {
      const s = sortSel ? sortSel.value : 'year-asc';
      const list = data.slice().sort({
        'year-asc': (a, b) => a.year - b.year,
        'year-desc': (a, b) => b.year - a.year,
        'yield-desc': (a, b) => b.max_yield_kt - a.max_yield_kt,
        'tests-desc': (a, b) => b.total_tests - a.total_tests,
        'name-asc': (a, b) => a.name.localeCompare(b.name),
      }[s] || (() => 0));
      grid.innerHTML = list.map(GZ.opCard).join('');
      if (readout) readout.textContent = `${list.length} operations`;
    }

    if (sortSel) sortSel.addEventListener('change', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
