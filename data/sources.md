# Sources & References

## Primary Data: Internet Archive

All film metadata sourced from the Internet Archive Advanced Search API (`https://archive.org/advancedsearch.php`). Key identifier prefixes:

| Prefix | Source |
|--------|--------|
| `gov.doe.08xxxxx` | Department of Energy nuclear test film series (primary source) |
| `CEP_00_071` | Federal Civil Defense Administration — Operation Cue |
| `0707_Atomic_Bomb_Blast_Effects` | U.S. Army compilation film |
| `StarfishPrimeInterimReportBy*` | DoE — Starfish Prime high-altitude test |
| `Operatio1955` / `Operatio1964` | Operation Cue films |
| `AtomicExplosionTheStoryOfFiveAtomicBombs` | DoE compilation |
| `DuckandC1951` | Civil defense — Duck and Cover |

### Film metadata API

```
https://archive.org/metadata/<identifier>
```

Returns JSON with title, description, creator, date, file list, download stats.

### Embed player

```html
<iframe src="https://archive.org/embed/<identifier>" width="640" height="480" allowfullscreen></iframe>
```

--- 

## Yield & Test Data

### U.S. Department of Energy

- **"United States Nuclear Tests — 1945 through 1992"** (DOE/NV-209, Rev 16)
  - The definitive accounting of every U.S. nuclear test: date, name, location, yield, purpose
  - Available through OSTI.gov and Federation of American Scientists
  - Covers all 1,054 U.S. nuclear tests (atmospheric + underground)

### Wikipedia — Operation pages

Each major operation has a Wikipedia article with test-by-test data:
- https://en.wikipedia.org/wiki/Operation_Ivy
- https://en.wikipedia.org/wiki/Operation_Castle
- https://en.wikipedia.org/wiki/Operation_Redwing
- etc.

### Nuclear Weapon Archive (careyellis.com)

- https://nuclearweaponarchive.org/
- Comprehensive technical histories of every nuclear test series
- Detailed yield data, weapon designs, test objectives

---

## Aftermath & Human Cost

### Castle Bravo
- "The Bravo test — the worst radiological disaster in U.S. history"
- Japanese fishing boat *Daigo Fukuryu Maru* (Lucky Dragon #5) — one crew member died
- Marshall Islands downwinders — ongoing health effects, displacement
- https://en.wikipedia.org/wiki/Castle_Bravo

### Crossroads — Baker shot contamination
- Underwater test contaminated all 95 target ships
- Decontamination efforts failed; most ships were scuttled
- https://en.wikipedia.org/wiki/Operation_Crossroads

### Downwinders (Nevada Test Site)
- National Cancer Institute study: Iodine-131 from Nevada tests caused 10,000-75,000 thyroid cancers
- St. George, Utah — the town most affected by fallout from Upshot-Knothole
- https://en.wikipedia.org/wiki/Downwinders

### Marshall Islands displacement
- Bikini Islanders evacuated in 1946, never able to return permanently
- Enewetak Islanders displaced for Sandstone, Greenhouse, Ivy, Redwing
- Ongoing compensation disputes
- https://en.wikipedia.org/wiki/Nuclear_testing_at_Bikini_Atoll

### Starfish Prime
- High-altitude EMP knocked out streetlights in Hawaii (900 miles away)
- Created artificial radiation belt that damaged early satellites
- https://en.wikipedia.org/wiki/Starfish_Prime

---

## Technical References

### Yields in kilotons

| Test | Date | Yield (kt) | Notes |
|------|------|-----------|-------|
| Trinity | 1945-07-16 | 21 | First nuclear test |
| Baker (Crossroads) | 1946-07-25 | 23 | First underwater test |
| X-Ray (Sandstone) | 1948-04-15 | 37 | New core design |
| Mike (Ivy) | 1952-11-01 | 10,400 | First H-bomb |
| Bravo (Castle) | 1954-03-01 | 15,000 | Largest US test |
| Starfish Prime | 1962-07-09 | 1,400 | High-altitude EMP test |

### Comparison: 1 kiloton ≈ weight of one billion (short) tons of TNT

- Hiroshima (Little Boy): 15 kt
- Nagasaki (Fat Man): 21 kt
- Ivy Mike: 10,400 kt (694 Hiroshimas)
- Castle Bravo: 15,000 kt (1,000 Hiroshimas)

### Treaty context

- **Limited Test Ban Treaty (1963)** — banned atmospheric, underwater, and outer space testing
- **Threshold Test Ban Treaty (1974)** — limited underground tests to 150 kt
- **Comprehensive Test Ban Treaty (1996)** — banned all nuclear explosions (not yet in force)

---

## Map Coordinates

| Location | Lat | Lon |
|----------|-----|-----|
| Trinity Site, NM | 33.677°N | 106.475°W |
| Nevada Test Site | 37.1°N | 116.0°W |
| Bikini Atoll | 11.6°N | 165.5°E |
| Enewetak Atoll | 11.5°N | 162.2°E |
| Christmas Island | 1.9°N | 157.4°W |
| Johnston Atoll | 16.7°N | 169.5°W |
| Pacific — Wigwam | 28.7°N | 126.3°W |
| South Atlantic — Argus | 49.5°S | 7.5°W |

---

## Design References

### Aesthetic inspiration
- WikiPulse (wikispike.xyz) — amber-on-black Bloomberg terminal
- SCP Foundation — clinical tone, understated horror
- The War Nerd — unflinching, no-jokes description of violence

### Stack references
- Cloudflare Pages + D1: see WikiPulse project (`/home/openclaw/projects/wiki-pulse/`)
- Leaflet dark tiles: CartoDB dark_matter
- IA embed: standard iframe
