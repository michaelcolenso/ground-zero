import { films, json } from '../../_lib/dataset.js';

// GET /api/films/<slug> — one film plus its sibling films in the same operation.
export function onRequestGet({ params }) {
  const film = films.find((f) => f.slug === params.slug);
  if (!film) return json({ error: 'not_found', slug: params.slug }, { maxAge: 60 });
  const related = films.filter(
    (r) => r.operation_id && r.operation_id === film.operation_id && r.id !== film.id
  );
  return json({ ...film, related });
}
