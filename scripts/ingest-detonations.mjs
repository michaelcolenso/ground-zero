#!/usr/bin/env node
// Detonation ingest (PROTOTYPE).
//
// For each film: pull the smallest IA video derivative, sample per-frame
// luminance with ffmpeg, detect brightness-spike "events" (a nuclear flash is
// the brightest thing in the reel), cluster them, and extract a representative
// frame per event. A vision pass then confirms/classifies each candidate.
//
// The cheap CV stage runs here. The vision stage is a pluggable seam:
//   - production: send the candidate frames to the Claude API (see classifyStub)
//   - this prototype: we emit the frames and confirm them by eye
//
// Usage:
//   node scripts/ingest-detonations.mjs <slug> [<slug> ...]
//   node scripts/ingest-detonations.mjs all

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache/detonations');

// ---- IA helpers -----------------------------------------------------------

async function pickDerivative(iaId) {
  const meta = await fetch(`https://archive.org/metadata/${iaId}`).then((r) => r.json());
  const vids = (meta.files || []).filter((f) => /\.(mp4|m4v|ogv|webm)$/i.test(f.name));
  // Prefer the smallest MP4 (usually the "512Kb MPEG4" derivative).
  const mp4 = vids
    .filter((f) => /\.mp4$/i.test(f.name))
    .sort((a, b) => (+a.size || Infinity) - (+b.size || Infinity))[0];
  const chosen = mp4 || vids.sort((a, b) => (+a.size || Infinity) - (+b.size || Infinity))[0];
  if (!chosen) throw new Error(`no video derivative for ${iaId}`);
  return {
    url: `https://archive.org/download/${iaId}/${encodeURIComponent(chosen.name)}`,
    name: chosen.name,
    sizeMB: chosen.size ? +chosen.size / 1e6 : null,
    durationS: chosen.length ? parseDuration(chosen.length) : null,
  };
}

function parseDuration(len) {
  if (typeof len === 'number') return len;
  if (/^\d+(\.\d+)?$/.test(len)) return parseFloat(len);
  const p = String(len).split(':').map(Number); // H:MM:SS
  return p.reduce((a, v) => a * 60 + v, 0);
}

async function download(url, dest) {
  if (existsSync(dest) && (await stat(dest)).size > 0) return dest;
  await mkdir(dirname(dest), { recursive: true });
  console.log(`  ↓ ${url}`);
  await exec('curl', ['-sL', '--retry', '3', '-o', dest, url], { maxBuffer: 1 << 30 });
  return dest;
}

// ---- CV stage: per-frame luminance ---------------------------------------

async function sampleLuminance(file, fps = 2) {
  const out = join(dirname(file), 'luma.txt');
  if (!existsSync(out)) {
    await exec(
      'ffmpeg',
      ['-hide_banner', '-nostats', '-i', file,
       '-vf', `fps=${fps},signalstats,metadata=print:file=${out}`,
       '-an', '-f', 'null', '-'],
      { maxBuffer: 1 << 30 }
    );
  }
  const text = await readFile(out, 'utf8');
  const samples = [];
  const re = /pts_time:([\d.]+)[\s\S]*?lavfi\.signalstats\.YAVG=([\d.]+)/g;
  let m;
  while ((m = re.exec(text))) samples.push({ t: +m[1], y: +m[2] });
  return samples;
}

// ---- Detection: cluster bright spikes into events ------------------------

// Onset-based detection. A detonation is a sudden brightening: the frame jumps
// far above the luminance of the seconds just before it, and usually saturates
// toward white. Bright-but-steady footage (sky, desert, clouds) has a high
// absolute level but a small onset, so it is rejected. Discrete flashes are
// isolated with non-maximum suppression so a multi-shot reel yields multiple
// events instead of one long blob.
function detectEvents(samples, { onsetMin = 38, absFloor = 130, suppressS = 8 } = {}) {
  if (samples.length < 4) return [];
  const ys = samples.map((s) => s.y).slice().sort((a, b) => a - b);
  const median = ys[Math.floor(ys.length / 2)];
  const dt = samples.length > 1 ? samples[1].t - samples[0].t : 1;
  const win = Math.max(3, Math.round(6 / dt)); // ~6s trailing baseline

  const cand = [];
  for (let i = win; i < samples.length; i++) {
    const before = samples.slice(i - win, i).map((s) => s.y).sort((a, b) => a - b);
    const pre = before[Math.floor(before.length / 2)];
    const onset = samples[i].y - pre;
    if (onset >= onsetMin && samples[i].y >= absFloor) {
      // sustain: how long luma stays elevated after the jump (fireballs linger).
      let endT = samples[i].t;
      for (let j = i + 1; j < samples.length && samples[j].y >= pre + onset * 0.4; j++) endT = samples[j].t;
      cand.push({ peakT: samples[i].t, peakY: samples[i].y, onset, pre, sustainS: +(endT - samples[i].t).toFixed(1) });
    }
  }
  // Non-maximum suppression by onset strength.
  cand.sort((a, b) => b.onset - a.onset);
  const kept = [];
  for (const c of cand) {
    if (kept.some((k) => Math.abs(k.peakT - c.peakT) < suppressS)) continue;
    kept.push(c);
  }
  return kept
    .map((e) => ({
      startT: e.peakT, endT: e.peakT + e.sustainS, peakT: e.peakT,
      peakY: +e.peakY.toFixed(1), onset: +e.onset.toFixed(1),
      durationS: e.sustainS, baseline: +median.toFixed(1),
    }))
    .sort((a, b) => b.onset - a.onset);
}

async function extractFrame(file, t, dest) {
  await mkdir(dirname(dest), { recursive: true });
  await exec('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(t), '-i', file,
    '-frames:v', '1', '-vf', 'scale=480:-1', '-y', dest], { maxBuffer: 1 << 28 });
  return dest;
}

// A tiled contact sheet of the whole film. This turned out to be the single most
// useful artifact: one image a vision model (or a human) can scan to locate
// every detonation sequence at a glance — far more reliable on faded prints than
// per-frame luminance. cols × every `everyS` seconds.
async function contactSheet(file, durationS, dest, { cols = 10, everyS } = {}) {
  everyS = everyS || Math.max(8, Math.round((durationS || 1200) / 170));
  const rows = Math.ceil((durationS || 1200) / everyS / cols) + 1;
  await exec('ffmpeg', ['-hide_banner', '-nostats', '-i', file,
    '-vf', `fps=1/${everyS},scale=170:-1,tile=${cols}x${rows}`,
    '-frames:v', '1', '-y', dest], { maxBuffer: 1 << 30 });
  return { dest, everyS, cols, note: `cell n (row-major, 0-based) ≈ t = n × ${everyS}s` };
}

// ---- Vision stage (pluggable) --------------------------------------------
// Production: POST each frame to the Claude API and ask it to confirm a
// detonation and classify it (flash | fireball | mushroom | shockwave |
// water-column | none). In this prototype we just hand back the frame paths so
// they can be confirmed by eye.
async function classifyStub(frames) {
  return frames.map((f) => ({ ...f, classification: 'pending-vision-review' }));
}

// ---- Orchestration --------------------------------------------------------

async function ingest(film) {
  console.log(`\n● ${film.id} (${film.ia_identifier})`);
  const deriv = await pickDerivative(film.ia_identifier);
  console.log(`  derivative: ${deriv.name} ${deriv.sizeMB ? deriv.sizeMB.toFixed(0) + 'MB' : ''} ${deriv.durationS ? Math.round(deriv.durationS) + 's' : ''}`);
  const dir = join(CACHE, film.id);
  const file = await download(deriv.url, join(dir, deriv.name));

  const t0 = Date.now();
  const samples = await sampleLuminance(file, 4);
  let events = detectEvents(samples);
  console.log(`  sampled ${samples.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s · baseline luma ${events[0]?.baseline ?? '—'} · ${events.length} candidate event(s)`);

  // Keep the strongest handful; extract a peak frame for each.
  events = events.slice(0, 8);
  const frames = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const png = join(dir, `event-${String(i + 1).padStart(2, '0')}_t${Math.round(e.peakT)}.png`);
    await extractFrame(file, e.peakT, png);
    frames.push({ event: i + 1, t: e.peakT, peakY: +e.peakY.toFixed(1), durationS: e.durationS, frame: png });
  }
  const classified = await classifyStub(frames);

  const sheet = await contactSheet(file, deriv.durationS, join(dir, 'contact.png'));
  console.log(`  contact sheet → ${sheet.dest.replace(ROOT + '/', '')} (${sheet.note})`);

  const result = {
    film_id: film.id,
    ia_identifier: film.ia_identifier,
    derivative: deriv.name,
    duration_s: deriv.durationS,
    baseline_luma: events[0]?.baseline ?? null,
    candidate_events: classified.map((c) => ({
      t: Math.round(c.t),
      timecode: hms(c.t),
      peak_luma: c.peakY,
      duration_s: c.durationS,
      frame: c.frame.replace(ROOT + '/', ''),
      embed_at: `https://archive.org/embed/${film.ia_identifier}?start=${Math.max(0, Math.round(c.t) - 2)}`,
      classification: c.classification,
    })),
  };
  await writeFile(join(dir, 'detonations.json'), JSON.stringify(result, null, 2));
  console.table(result.candidate_events.map(({ frame, ...r }) => r));
  return result;
}

function hms(s) {
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return [h, m, x].map((n) => String(n).padStart(2, '0')).join(':');
}

async function main() {
  const args = process.argv.slice(2);
  const raw = JSON.parse(await readFile(join(ROOT, 'data/films.json'), 'utf8'));
  const films = args[0] === 'all' ? raw : raw.filter((f) => args.includes(f.id));
  if (!films.length) { console.error('No matching films. Pass slugs or "all".'); process.exit(1); }
  for (const f of films) {
    try { await ingest(f); } catch (e) { console.error(`  ✘ ${f.id}: ${e.message}`); }
  }
}

main();
