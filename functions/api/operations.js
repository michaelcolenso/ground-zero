import { operations, json } from '../_lib/dataset.js';

// GET /api/operations — all operations (chronological).
export function onRequestGet() {
  return json(operations);
}
