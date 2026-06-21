# Ground Zero — Atomic Test Film Explorer

**Spec v1.0**
**Date:** 2026-06-20
**For implementation by:** Autonomous coding agent (Claude Code, Codex, Hermes subagent)
**Stack:** Cloudflare Pages + D1 + R2 (or direct IA hotlinking)

---

## 1. Overview

**Ground Zero** is a data-driven web app that surfaces declassified U.S. atmospheric nuclear test films from the Internet Archive. It gives each film a proper home page with metadata, maps, timelines, and context — turning a forgotten pile of government films into an interactive historical exhibit.

### Core principle

The films exist on IA. They've been there for 20+ years. What's missing is a **curated, browsable, beautiful interface** — a gallery that makes the scale and insanity of atmospheric nuclear testing visible at a glance.

### Target aesthetic

Dark, serious, terminal-style. Think WikiPulse (amber-on-black monochrome) meets a war memorial. No whimsy. No jokes. The subject matter dictates the tone.

### Target domain

`groundzero.xyz` or similar cheap `.xyz`. Dark theme, fast loading, mobile-responsive.

---

## 2. Data Model

### 2.1 Operations Table (`operations`)

Each atmospheric nuclear test series.

| Column | Type | Example |
|--------|------|---------|
| `id` | TEXT PK | `operation-ivy` |
| `name` | TEXT | `Operation Ivy` |
| `year` | INTEGER | `1952` |
| `country` | TEXT | `USA` |
| `location_name` | TEXT | `Enewetak Atoll, Pacific Proving Grounds` |
| `latitude` | REAL | `11.5` |
| `longitude` | REAL | `162.2` |
| `total_tests` | INTEGER | `2` |
| `max_yield_kt` | REAL | `10400` |
| `purpose` | TEXT | `First full-scale thermonuclear test (H-bomb)` |
| `description` | TEXT | `Multi-paragraph history of the operation` |
| `slug` | TEXT | `operation-ivy` |

### 2.2 Films Table (`films`)

Each individual film within an operation.

| Column | Type | Example |
|--------|------|---------|
| `id` | TEXT PK | `ivy-mike-1952` |
| `operation_id` | TEXT FK → operations | `operation-ivy` |
| `title` | TEXT | `Operation Ivy — Mike Shot` |
| `ia_identifier` | TEXT | `NuclearTestFilmOperationIvy` |
| `ia_url` | TEXT | `https://archive.org/details/...` |
| `duration_seconds` | INTEGER | `1800` |
| `file_size_mb` | REAL | `180` |
| `yield_kt` | REAL | `10400` |
| `test_name` | TEXT | `Mike` |
| `test_date` | TEXT | `1952-11-01` |
| `location` | TEXT | `Enewetak Atoll` |
| `type` | TEXT | `atmospheric` |
| `purpose` | TEXT | `Thermonuclear device validation` |
| `description` | TEXT | `The first hydrogen bomb test. Vaporized the island of Elugelab.` |
| `aftermath` | TEXT | `Contamination patterns, health effects, historical significance` |
| `thumbnail_url` | TEXT | IA thumbnail URL |
| `views` | INTEGER | From IA metadata |
| `favorites` | INTEGER | From IA metadata |
| `slug` | TEXT | `ivy-mike-1952` |

### 2.3 Initial Seed Data

Operations to include (minimum MVP):

| Operation | Year | Tests | Max Yield | Films |
|-----------|------|-------|-----------|-------|
| Trinity | 1945 | 1 | 21 kt | IA: `trinity1945` |
| Crossroads | 1946 | 2 | 23 kt | IA: DoE films |
| Sandstone | 1948 | 3 | 49 kt | IA: 4+ DoE films (Navy, USAF, Army, Blast Measurement) |
| Ranger | 1951 | 5 | 22 kt | IA: DoE |
| Greenhouse | 1951 | 4 | 225 kt | IA: DoE |
| Buster-Jangle | 1951 | 7 | 31 kt | IA: DoE |
| Tumbler-Snapper | 1952 | 8 | 31 kt | IA: DoE |
| Ivy | 1952 | 2 | 10,400 kt | IA: DoE — *first H-bomb* |
| Upshot-Knothole | 1953 | 11 | 61 kt | IA: DoE |
| Castle | 1954 | 6 | 15,000 kt | IA: DoE — *Bravo, worst radiological accident* |
| Teapot | 1955 | 14 | 43 kt | IA: DoE |
| Wigwam | 1955 | 1 | 30 kt | IA: DoE — *deep underwater* |
| Redwing | 1956 | 17 | 5,000 kt | IA: DoE |
| Hardtack | 1958 | 35 | 9,300 kt | IA: DoE — *largest series* |
| Argus | 1958 | 3 | 1.7 kt | IA: DoE — *high-altitude* |
| Dominic | 1962 | 36 | 8,300 kt | IA: DoE — *last atmospheric series* |

Plus standalone films:
- *Operation Cue* — mock suburb nuked for civil defense research (262K views on IA)
- *Atomic Bomb Blast Effects* — general compilation (154K views)
- *Atom Bomb [Joe Bonica's Movie of the Month]* (245K views, 635 favorites)
- *The 280 mm Atomic Cannon at Nevada Proving Ground* (80K views)
- *Target Nevada* — compilation (66K views)

---

## 3. Architecture

### 3.1 Stack

- **Hosting:** Cloudflare Pages
- **Database:** Cloudflare D1 (SQLite)
- **Media:** Direct hotlink from Internet Archive (no R2 needed — saves cost, respects IA's CDN)
- **Framework:** Vanilla HTML + CSS + JS (no React — keep it fast and simple, like WikiPulse)
- **Map:** Leaflet.js with a dark tile set (CartoDB dark_matter)
- **Build:** Wrangler with `pages functions` for API routes

### 3.2 Routes

| Route | Page |
|-------|------|
| `/` | Home: counter + random film + operation grid |
| `/operations` | Browse all operations |
| `/operations/<slug>` | Operation detail page with film list |
| `/films` | Browse all films (sortable/filterable) |
| `/films/<slug>` | Film page with embedded player + metadata |
| `/map` | Full-page map of all test sites |
| `/timeline` | Yield-over-time scatter plot |
| `/random` | Redirect to a random film |
| `/api/films` | JSON endpoint: all films (for filters/sort) |
| `/api/operations` | JSON endpoint: all operations |
| `/api/films/<slug>` | JSON: single film with full metadata |

### 3.3 Pages Functions

Simple API routes under `functions/api/`:
- `functions/api/films.js` — D1 query, return JSON
- `functions/api/operations.js` — D1 query, return JSON
- `functions/api/films/[slug].js` — single film detail

All functions use D1 binding `DB`.

### 3.4 Data Ingestion

The seed data is written as a SQL migration file (`migrations/001_seed.sql`). It's a one-time import — IA film metadata rarely changes. Future updates can add more films as they're discovered on IA.

Script to extract IA metadata for a given identifier:
```bash
# Available for any film on IA
curl -s "https://archive.org/metadata/<identifier>" | jq '.metadata'
```

---

## 4. Pages

### 4.1 Home Page (`/`)

```
┌─────────────────────────────────────────────┐
│  ████████████████████████████████████████  │
│  GROUND ZERO                                │
│  Atmospheric Nuclear Test Film Archive     │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │   [RANDOM FILM THUMBNAIL]            │  │
│  │                                      │  │
│  │   "Operation Ivy — Mike Shot"        │  │
│  │   10,400 kt · Nov 1, 1952            │  │
│  │   [▶ PLAY] [→ NEXT RANDOM]           │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  10,400 kilotons                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  That's 694 Hiroshimas.                     │
│                                              │
│  ─── OPERATIONS ───                         │
│  [Ivy] [Castle] [Redwing] [Trinity] ...     │
│                                              │
│  ─── BY THE NUMBERS ───                     │
│  16 operations · 193 tests                   │
│  Last atmospheric test: July 26, 1962        │
│  X days since the last one                  │
└─────────────────────────────────────────────┘
```

**Key elements:**
- Amber-on-black terminal aesthetic (CSS variables for easy theming)
- Random film hero with play button
- "X days since last atmospheric test" counter
- Operation badge grid
- "By the numbers" stats row
- Page includes `sidebar` for the "random film" persistence

### 4.2 Film Page (`/films/<slug>`)

```
┌─────────────────────────────────────────────┐
│  ← All Films  ·  Operation Ivy             │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │   [IA VIDEO PLAYER IFRAME]           │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  Mike                                       │
│  10,400 kt · November 1, 1952 · Enewetak   │
│                                              │
│  The first hydrogen bomb test. The device    │
│  "Mike" produced 10.4 megatons of yield —   │
│  over 700 times the Hiroshima bomb. The     │
│  island of Elugelab was completely          │
│  vaporized. A crater 1.2 miles wide and     │
│  160 feet deep remained.                    │
│                                              │
│  ─── AFTERMATH ───                          │
│  Fallout spread across the Pacific.         │
│  Crew members aboard the USS Estes at       │
│  30 miles reported feeling the heat.        │
│  The blast was visible from 300 miles.      │
│                                              │
│  ─── DETAILS ───                            │
│  Operation: Operation Ivy                    │
│  Test name: Mike                             │
│  Date: 1952-11-01                            │
│  Yield: 10,400 kt (10.4 Mt)                 │
│  Location: Enewetak Atoll                    │
│  Type: Atmospheric (surface)                 │
│  Weapon: TX-5 / "Sausage" device            │
│  Purpose: Thermonuclear proof-of-concept    │
│  Views on IA: 62,000+                       │
│                                              │
│  ─── OTHER FILMS IN THIS OPERATION ───      │
│  [Operation Ivy — King Shot (test)]          │
│  [Nuclear Test Film — Operation Ivy]         │
│                                              │
│  [→ RANDOM FILM]                             │
└─────────────────────────────────────────────┘
```

**Key elements:**
- Inline IA video player (`<iframe>` or IA's embed)
- Metadata table
- Aftermath/cost section (never sanitize the human cost)
- Related films from same operation
- Random navigation

### 4.3 Operations Page (`/operations`)

Grid of operation cards. Each card shows: operation name, year, number of tests, max yield, one-sentence purpose. Sortable by year, yield, name.

### 4.4 Operation Detail Page (`/operations/<slug>`)

Operation overview + list of all films in that operation. Timeline of individual tests within the operation.

### 4.5 Map Page (`/map`)

Leaflet map with markers at each test site. Marker popup: operation name, yield, date, link to operation page. Cluster markers when zoomed out (Pacific Proving Grounds has many tests in close proximity).

A second layer: push pins for "downwind" communities affected by fallout.

### 4.6 Timeline Page (`/timeline`)

A scatter plot (HTML5 Canvas or SVG):
- X axis: year (1945–1962)
- Y axis: yield in kilotons (log scale)
- Each dot = one test
- Color = operation
- Hover: show test name and yield

The shape of this chart tells the story: a slow climb through 1945-1951, then an exponential vertical spike in 1952 (Ivy Mike at 10,400 kt), then the madness of 1958 (Hardtack: 35 tests including 9,300 kt shots).

---

## 5. Design System

### 5.1 Colors

```css
:root {
  --bg: #0a0a0a;           /* Near-black background */
  --bg-secondary: #111;     /* Card backgrounds */
  --text-primary: #ffb000;  /* Amber primary text */
  --text-secondary: #cc8800; /* Dimmer amber */
  --text-muted: #664400;    /* Very dim amber */
  --accent: #ff6600;        /* Bright orange for CTAs */
  --border: #332200;        /* Subtle amber border */
  --yield-low: #44ff44;     /* Green for low yield */
  --yield-med: #ffb000;     /* Amber for med yield */
  --yield-high: #ff4400;    /* Red for high yield */
}
```

### 5.2 Typography

- Body: system monospace stack: `"Courier New", "Consolas", monospace`
- Headings: same stack, larger sizes with letter-spacing
- No webfonts (keeps it fast)

### 5.3 Components

- **Badge:** Used for operation tags, yield categories, test types
- **Card:** Film/operation card with thumbnail + metadata
- **Counter:** Animated "X days since" display
- **Player:** IA embed with custom controls wrapper
- **Timeline:** Canvas-based scatter plot
- **Map:** Leaflet with dark tile layer

---

## 6. Implementation Phases

### Phase 1 — Skeleton (Day 1)
- [ ] Scaffold CF Pages project with Wrangler
- [ ] Create D1 database and migrations
- [ ] Seed initial operation + film data (15 operations, 30+ films)
- [ ] Build JSON API endpoints (films, operations, random)
- [ ] Create basic pages scaffold with routes

### Phase 2 — Core Pages (Day 2)
- [ ] Home page with random film hero + counter + operation grid
- [ ] Film page with IA player embed + metadata
- [ ] Operations browse page
- [ ] Film browse page with filters

### Phase 3 — Visual Features (Day 3)
- [ ] Map page with Leaflet markers
- [ ] Timeline scatter plot (Canvas/SVG)
- [ ] Yield color coding
- [ ] "Next random" button that persists in session

### Phase 4 — Polish (Day 4)
- [ ] Mobile responsiveness
- [ ] Loading states and error handling
- [ ] SEO meta tags per film page
- [ ] OG images for social sharing
- [ ] Deploy to `groundzero.xyz`

---

## 7. Metadata Sources

### Film Metadata
- Internet Archive API: `https://archive.org/metadata/<identifier>` → JSON with title, description, downloads, files, runtime
- DoE metadata from IA descriptions (extract yield, date, location from text)
- Wikipedia: Operation pages have weapon yield, test dates, locations

### Aftermath Data
- DOE's "United States Nuclear Tests — 1945 through 1992" report (public domain)
- Wikipedia articles for Castle Bravo, Crossroads, Ivy Mike
- CTBTO historical data

### Fallout / Downwinders
- National Cancer Institute study on iodine-131 from Nevada tests
- Downwinders documentation (Utah, Nevada, Arizona communities)

---

## 8. Constraints & Non-Goals

### Constraints
- **No build step beyond Wrangler** — keep it simple, no React/Vite
- **Hotlink IA videos** — do not download/rehost 30+ GB of film (respect IA's CDN)
- **Dark theme only** — no light mode (tone-appropriate)
- **Mobile-first CSS** — responsive down to 320px

### Explicitly NOT building (v1)
- No user accounts or comments
- No search (use browser find-in-page for v1)
- No playlist/collection feature
- No audio-only mode

---

## 9. Internet Archive Integration

### How IA embedding works

Each IA item has an embeddable player:
```
https://archive.org/embed/<identifier>
```

Example:
```html
<iframe src="https://archive.org/embed/NuclearTestFilmOperationIvy"
        width="640" height="480" frameborder="0"
        allowfullscreen></iframe>
```

### Metadata API

```bash
curl -s "https://archive.org/metadata/NuclearTestFilmOperationIvy"
```

Returns JSON with:
- `metadata.title`
- `metadata.description`
- `metadata.creator`
- `metadata.date`
- `files[]` — list of downloadable files with formats

### Reliability
IA has been hosting these films for 15+ years. They're not going anywhere. If an item is taken down, update the `ia_identifier` field in D1.

---

## 10. Testing & Deployment

### Commands

```bash
# Dev
npm run dev              # Wrangler pages dev

# D1
npx wrangler d1 execute ground-zero --local --file=migrations/001_seed.sql

# Deploy
npm run deploy           # wrangler pages deploy

# Preview before deploy
npx wrangler pages deployment list --project-name=ground-zero
```

### CI (optional)
GitHub Actions: deploy on push to main. Same pattern as WikiPulse.

---

## 11. Future (Post-v1)

- Subtitle/transcript extraction from IA metadata
- "Compare yields" tool — side-by-size visualization of any test vs Hiroshima
- Glossary page: yield, fission vs fusion, fallout patterns
- Soviet test data (they have their own film archives)
- "This day in nuclear history" — daily featured test
