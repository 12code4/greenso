# Blueprints — the map construction contracts

> **2026-09-03:** the world is now one house (docs/10-house-atlas.md). Blueprints 01–08 below are retired *as separate maps*; their places live on as rooms and zones of the house. New blueprints are **per floor**: `floor-G.md` (the ground floor, **built**), `floor-U.md` (the upper floor, P0 done), then B, A, and the yard.

> **Superseded (2026-09-03):** these eight per-map contracts are retired as world structure; the places they describe become rooms and zones of the house in [`docs/10-house-atlas.md`](../10-house-atlas.md). Per-floor blueprints (`floor-B.md`, `floor-G.md`, …) replace them; the skeleton below still applies to those.

One file per campaign map. A blueprint freezes a map's **topology, dimensions, encounters, hazards, kit manifest, and mission logic** at P0 (see docs/06 §7) so that construction passes P1–P6 are transcription and tuning, never design. Region/route/encounter IDs here are the IDs the map def must use (traceability rule, 06 §3).

Every blueprint follows the same skeleton:

1. **Header** — verb, unlock, **fun target** (the one feeling the map must nail), real footprint.
2. **Regions** — graph + table (kind, altitude band, size, scale-seller, landmarks seen).
3. **Routes** — band transitions and route classes, all within the 06 §2 vocabulary.
4. **Golden path** — numbered beats with distances.
5. **Encounters** — template instances (06 §4) with compositions and activations.
6. **Hazards** — scheduler configs in ops (06 §5) with telegraphs.
7. **Kit manifest** — reused props · **new heroes (≤8)** · fortification set · shell fixtures.
8. **Pickups & secrets** — economy per 06 §6; 5 marbles (2 early-visible / 2 hidden / 1 skill).
9. **Mission FSM** — objective chain; checkpoints; par estimate.
10. **QA deltas** — map-specific risks against the 06 §8 checklist.

Campaign order is fiction; **build order** (bible, re-affirmed post-audit): Backyard → Sandbox → Kitchen → Bedroom → Bathroom → Gutter → Workbench → Picnic.

| # | Map | File | Blueprint status |
|---|---|---|---|
| 1 | The Sandbox | `map-01-sandbox.md` | ready for P1 |
| 2 | The Backyard | `map-02-backyard.md` | **built** — `src/maps/defs/backyard.ts`; **P1 passing** (`tools/walk.mjs`: 7/7 routes reachable, camera sweep clean); **P2/P3 passing** (`tools/combat.mjs` combat loop; `tools/mission.mjs` drives all six objectives to the tally); P4 dressing partial; P6 awaits a human — **M2 slice** |
| 3 | The Gutter Run | `map-03-gutter.md` | ready for P1 (water ops gated on M3 spike) |
| 4 | The Kitchen Counter | `map-04-kitchen.md` | ready for P1 |
| 5 | The Bathroom | `map-05-bathroom.md` | ready for P1 (waterLevel gated on M3 spike) |
| 6 | The Bedroom at Night | `map-06-bedroom.md` | ready for P1 |
| 7 | The Workbench | `map-07-workbench.md` | ready for P1 |
| 8 | The Picnic Table | `map-08-picnic.md` | ready for P1 |
| G | **The Ground Floor** (house) | `floor-G.md` | **built** — `src/maps/defs/house/g.ts`; P1–P5 passing (`walk.mjs g` 13 routes, `house-g.mjs` 21/21); §11 logs the as-built deviations |
| U | **The Upper Floor** (house) | `floor-U.md` | **P1 built** — `src/maps/defs/house/u.ts`, `?map=u`; walk gate green (11 routes, none failed). P2–P5 (population, missions, hazards, audio) still to come; §11 logs the as-built |

All dimensions are canonical units (real cm ÷ 5.4, docs/06 §1) and all maps passed the real-footprint sanity check at P0.
