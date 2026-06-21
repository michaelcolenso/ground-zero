// Shared dataset for the API functions. wrangler/esbuild bundles the raw seed
// JSON at build time and we enrich it with the SAME library the static build
// uses, so /api/* and the prebuilt /data/* snapshots never drift.

import rawOperations from '../../data/operations.json';
import rawFilms from '../../data/films.json';
import { enrichFilms, enrichOperations, computeStats } from '../../lib/enrich.mjs';

export const operations = enrichOperations(rawOperations, rawFilms);
export const films = enrichFilms(rawFilms, rawOperations);
export const stats = computeStats(operations, films);

export function json(data, { maxAge = 300 } = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': `public, max-age=${maxAge}`,
    },
  });
}
