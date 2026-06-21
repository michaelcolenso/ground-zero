# Ground Zero

**An explorer for the declassified U.S. atmospheric nuclear test films held by the Internet Archive.**

The films — public-domain U.S. government records — have been online for two decades. What was missing was a way to browse them with the context they demand: yields, dates, locations, maps, a timeline, and the human cost for the people downwind. Ground Zero is that interface. Dark, terminal, no whimsy.

See [`SPEC.md`](./SPEC.md) for the original specification.

---

## What it is

A **static site** (clean URLs, full SEO/OG meta, instant loads) generated from a small canonical dataset, plus an optional set of **Cloudflare Pages Functions** that expose the same data as a JSON API. It deploys to Cloudflare Pages — or any static host — and needs no database to run.

| Page | Route |
|------|-------|
| Home — featured film, "days since last atmospheric test" counter, stats, operations | `/` |
| Operations (sortable) | `/operations/` |
| Operation detail | `/operations/<slug>/` |
| Films (filter by operation, sort by yield/date/views) | `/films/` |
| Film detail — IA player, history, aftermath, related films | `/films/<slug>/` |
| Map — dark Leaflet, sites sized by yield + fallout/downwinder layer | `/map/` |
| Timeline — log-scale yield-over-time scatter (canvas) | `/timeline/` |
| About & sources | `/about/` |
| Random film (redirect) | `/random/` |

JSON API (Pages Functions): `/api/films`, `/api/films/<slug>`, `/api/operations`, `/api/operations/<slug>`, `/api/stats`, `/api/random`.

---

## Architecture

```
data/            Canonical seed (operations.json, films.json) — edit these to add films
lib/             enrich.mjs + content.mjs — the single source of derived data & history
scripts/         build.mjs (static-site generator) + templates.mjs
src/static/      css + js, copied verbatim into the build
functions/       Cloudflare Pages Functions for /api/* (reuse lib/enrich.mjs)
migrations/      001_seed.sql — generated D1 seed (optional)
public/          Build output (gitignored)
```

**One source of truth.** `lib/enrich.mjs` derives every computed field (slugs, Hiroshima-equivalents, yield categories, IA thumbnail/embed URLs, joins). Both the static build *and* the API functions import it, so the prebuilt `/data/*.json` snapshots and the `/api/*` responses can never drift. The client reads the static snapshots and falls back to the API automatically.

### Why static instead of D1 at runtime

The spec notes the data "rarely changes." Binding every page load to a database buys nothing here and makes real SEO (a Phase-4 goal) hard. So pages are pre-rendered with proper meta tags and the data is bundled. The `migrations/001_seed.sql` D1 seed is still generated from the same canonical data, and `wrangler.toml` documents how to switch the API over to D1 if you ever want it.

---

## Develop

```bash
npm install
npm run build      # generate public/ and migrations/001_seed.sql
npm run dev        # build, then wrangler pages dev (serves pages + /api/*)
```

Add or correct a film/operation by editing `data/*.json` (and optionally adding
history to `lib/content.mjs`), then rebuild. Pull IA metadata for a new item with:

```bash
curl -s "https://archive.org/metadata/<identifier>" | jq '.metadata'
```

## Deploy

Live at **https://ground-zero-bjc.pages.dev** (Cloudflare Pages project `ground-zero`).

```bash
npm run deploy     # build + wrangler pages deploy public
```

Pushes to `master` deploy automatically via [`.github/workflows/deploy.yml`].
That workflow needs two repository secrets:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | A token with **Pages: Edit** (and **D1: Edit** if you use the manual seed workflow) |
| `CLOUDFLARE_ACCOUNT_ID` | Your account id (no surrounding whitespace) |

### Optional: back the API with D1

```bash
# create the DB, add the binding in wrangler.toml, then:
npm run d1:seed:remote
```

---

## Notes

- **Films are streamed from the Internet Archive**, never rehosted (respects IA's CDN, per spec).
- **Data sources**: Internet Archive metadata; yields/dates/locations from DOE/NV-209 (*United States Nuclear Tests 1945–1992*); aftermath from the public record of fallout and displacement. Full list at `/about/` and in `data/sources.md`.
- **No tracking, no webfonts, no build step beyond one Node script.** Respects `prefers-reduced-motion`.
