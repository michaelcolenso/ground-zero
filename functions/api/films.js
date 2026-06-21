import { films, json } from '../_lib/dataset.js';

// GET /api/films  — all films, optionally ?operation=<slug>&sort=<key>
export function onRequestGet({ request }) {
  const url = new URL(request.url);
  const op = url.searchParams.get('operation');
  const sort = url.searchParams.get('sort');

  let list = films;
  if (op) list = list.filter((f) => f.operation_slug === op);

  const sorters = {
    'yield-desc': (a, b) => (b.yield_kt || -1) - (a.yield_kt || -1),
    'yield-asc': (a, b) => (a.yield_kt ?? Infinity) - (b.yield_kt ?? Infinity),
    'date-asc': (a, b) => String(a.test_date || '9999').localeCompare(String(b.test_date || '9999')),
    'date-desc': (a, b) => String(b.test_date || '0').localeCompare(String(a.test_date || '0')),
    'views-desc': (a, b) => (b.downloads || 0) - (a.downloads || 0),
  };
  if (sorters[sort]) list = [...list].sort(sorters[sort]);

  return json(list);
}
