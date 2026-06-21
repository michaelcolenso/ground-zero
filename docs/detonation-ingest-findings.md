# Finding the explosive moments with AI — prototype findings

**Question:** can we automatically find the detonation(s) in each film, so we can
deep-link the IA player to the blast (`/embed/<id>?start=<sec>`), use the
fireball frame as the thumbnail/OG image, and chapter the compilation reels?

**Answer:** yes — but the discriminator has to be a **vision model**, not
brightness. Prototype run on three deliberately contrasting films.

## What was tried

`scripts/ingest-detonations.mjs`: pull the smallest IA MP4 derivative, sample
per-frame luminance with ffmpeg, detect **onset** spikes (a flash is a sudden
jump above the preceding seconds, usually saturating toward white), cluster with
non-max suppression, extract a frame per candidate, and emit a tiled **contact
sheet** of the whole film. The vision stage is a pluggable seam (`classifyStub`)
— in production it posts candidate frames to the Claude API; in this prototype
the frames were confirmed by eye.

## Results

| Film | Case | What the CV detector did | Ground truth (via vision) |
|------|------|--------------------------|---------------------------|
| **Ivy Mike** (`gov.doe.0800012`, 63 min) | single flash, faded color print | Found the right *neighborhood* (54–57 min) but its top "peak luma" frames were bright **sky, a blue-sky cut, and an animated "LIQUID HYDROGEN" diagram**. Peak luma never exceeded ~161 — the faded fireball does not saturate. | Detonation/fireball/mushroom sequence ~**54:50–57:00**; clean mushroom-cloud frame confirmed at **56:26**. |
| **Sandstone** (`gov.doe.0800003`, 21 min) | multi-shot compilation | 17 candidates; the genuine bursts cluster in the last ~3 min. | **Multiple distinct fireballs** in sequence ~**16:40–21:00** (X-Ray/Yoke/Zebra) → the data model needs a *list* of detonations per film. |
| **Crossroads** (`gov.doe.0800002`, 43 min) | underwater Baker, B&W | **36 noisy candidates** — bright B&W ocean/sky everywhere; baseline luma 116. | Able airburst mushroom ~13 min; **Baker is a white water column, not a flash** → invisible to a luminance detector. |

## Conclusions

1. **Brightness/onset alone is insufficient on these prints.** Faded fireballs
   don't saturate, and the reels are full of bright sky, title cards and
   animation, so precision is poor and underwater shots are missed entirely.
2. **Vision is the real detector**, not a fallback for edge cases. A model
   reliably tells a fireball/mushroom/water-column from a sky cut or a diagram.
3. **The contact sheet is the highest-leverage artifact.** One tiled image per
   film lets a model (or a person) locate every detonation sequence in a single
   look — cheap and robust.

## Recommended production design

- **Vision-led, contact-sheet-first.** Generate a contact sheet per film; one
  Claude vision call locates the candidate detonation *windows*. Then sample a
  few frames inside each window and classify them (`flash | fireball | mushroom |
  shockwave | water-column | none`) to land a precise timestamp. Brightness stays
  only as an optional cheap pre-filter.
- **Data model:** add `detonations: [{ t, timecode, type, caption }]` per film
  (a list — compilations have several). Bake into the build.
- **Surfacing:** "▶ Jump to detonation" deep links via `?start=`, fireball-frame
  thumbnails/OG images, per-shot chapters for compilations, and an optional
  "detonations only" supercut page.
- **Cost/ops:** one-time offline batch (ffmpeg + Claude API). Videos are
  downloaded once for analysis; only timestamps (and maybe one thumbnail frame
  each) get committed. We keep streaming from IA — nothing is rehosted.

## Run it

```bash
node scripts/ingest-detonations.mjs ivy-mike sandstone-general crossroads-able
# writes .cache/detonations/<id>/: candidate frames, contact.png, detonations.json
```
