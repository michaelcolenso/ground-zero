import { operations, films, json } from '../../_lib/dataset.js';

// GET /api/operations/<slug> — one operation with its films.
export function onRequestGet({ params }) {
  const op = operations.find((o) => o.slug === params.slug);
  if (!op) return json({ error: 'not_found', slug: params.slug }, { maxAge: 60 });
  return json({ ...op, films: films.filter((f) => f.operation_id === op.id) });
}
