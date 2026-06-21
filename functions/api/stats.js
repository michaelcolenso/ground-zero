import { stats, json } from '../_lib/dataset.js';

// GET /api/stats — archive-wide counters (recomputed per request so generated_at
// and the implied "days since" stay current).
export function onRequestGet() {
  return json(stats, { maxAge: 60 });
}
