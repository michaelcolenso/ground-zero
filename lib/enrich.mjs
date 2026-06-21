// Single source of truth for derived data. Imported by BOTH the static-site
// build (scripts/build.mjs, running under Node) and the Cloudflare Pages API
// functions (functions/api/*, bundled by wrangler). Pure functions only —
// no filesystem, no platform APIs — so it runs identically in both worlds.

import { FILM_CONTENT, OPERATION_LEGACY } from './content.mjs';

// Hiroshima (Little Boy) ~= 15 kt. The unit that makes megatons legible.
export const HIROSHIMA_KT = 15;

// The last U.S. atmospheric nuclear test: shot Tightrope, Operation Dominic,
// over Johnston Island. After this, all U.S. testing went underground.
export const LAST_ATMOSPHERIC_TEST = '1962-11-04';

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Yield bands drive the color coding (green / amber / red) across the whole site.
export function yieldCategory(kt) {
  if (kt == null) return 'unknown';
  if (kt < 50) return 'low';
  if (kt < 1000) return 'med';
  return 'high';
}

export function hiroshimas(kt) {
  if (kt == null) return null;
  return kt / HIROSHIMA_KT;
}

// "10.4 Mt" / "225 kt" — human-readable yield.
export function formatYield(kt) {
  if (kt == null) return 'Unknown yield';
  if (kt >= 1000) {
    const mt = kt / 1000;
    return `${Number.isInteger(mt) ? mt : mt.toFixed(1)} Mt`;
  }
  return `${kt} kt`;
}

function iaThumb(id) {
  return `https://archive.org/services/img/${id}`;
}
function iaEmbed(id) {
  return `https://archive.org/embed/${id}`;
}

export function enrichFilms(rawFilms, rawOperations) {
  const opById = new Map(rawOperations.map((o) => [o.id, o]));
  return rawFilms.map((f) => {
    const content = FILM_CONTENT[f.id] || {};
    const op = f.operation_id ? opById.get(f.operation_id) : null;
    return {
      ...f,
      slug: f.id,
      operation_name: op ? op.name : null,
      operation_slug: op ? op.id : null,
      yield_category: yieldCategory(f.yield_kt),
      hiroshima_equiv: f.yield_kt != null ? Math.round(hiroshimas(f.yield_kt)) : null,
      yield_label: formatYield(f.yield_kt),
      thumbnail_url: iaThumb(f.ia_identifier),
      embed_url: iaEmbed(f.ia_identifier),
      description: content.description || null,
      aftermath: content.aftermath || null,
      weapon: content.weapon || null,
    };
  });
}

export function enrichOperations(rawOperations, rawFilms) {
  return rawOperations
    .map((o) => {
      const films = rawFilms.filter((f) => f.operation_id === o.id);
      return {
        ...o,
        slug: o.id,
        film_count: films.length,
        film_ids: films.map((f) => f.id),
        yield_category: yieldCategory(o.max_yield_kt),
        hiroshima_equiv: o.max_yield_kt != null ? Math.round(hiroshimas(o.max_yield_kt)) : null,
        yield_label: formatYield(o.max_yield_kt),
        legacy: OPERATION_LEGACY[o.id] || null,
      };
    })
    .sort((a, b) => a.year - b.year);
}

export function computeStats(operations, films) {
  const datedFilms = films.filter((f) => f.test_date && /^\d{4}/.test(f.test_date));
  const years = operations.map((o) => o.year);
  const biggest = operations.reduce(
    (m, o) => (o.max_yield_kt > (m?.max_yield_kt ?? -1) ? o : m),
    null
  );
  return {
    operation_count: operations.length,
    film_count: films.length,
    test_count: operations.reduce((s, o) => s + (o.total_tests || 0), 0),
    year_min: Math.min(...years),
    year_max: Math.max(...years),
    largest_test: biggest
      ? {
          name: biggest.name,
          slug: biggest.slug,
          yield_kt: biggest.max_yield_kt,
          yield_label: formatYield(biggest.max_yield_kt),
          hiroshima_equiv: Math.round(hiroshimas(biggest.max_yield_kt)),
        }
      : null,
    last_atmospheric_test: LAST_ATMOSPHERIC_TEST,
    total_documented_views: films.reduce((s, f) => s + (f.downloads || 0), 0),
    generated_at: new Date().toISOString(),
  };
}
