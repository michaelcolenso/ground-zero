import { films, json } from '../_lib/dataset.js';

// GET /api/random — a random film (JSON). For the redirect page use /random/.
export function onRequestGet() {
  const f = films[Math.floor(Math.random() * films.length)];
  return json(f, { maxAge: 0 });
}
