# Blueprint — Map 03 · THE GUTTER RUN · "The Long Way Up"

- **Verb:** linear infiltration (storm) · **Unlock:** none — the map is the star (arsenal breather)
- **Fun target:** *a vertical gauntlet that floods behind you* — pure traversal tension, tense but not punishing (falls land on the previous stage's debris jam, never death). The palate cleanser between the open Backyard/Kitchen and the dense indoor maps.
- **Real footprint:** a downspout + gutter channel on one house corner → a **linear ~130 u climb** (~7 m of real gutter run) from ground to roofline, presented in safe stages.
- **Tech note:** reuses Bathroom water tech in simpler form (`waterLevel`/`pushVolume` as surge flushes, no floating combat) — built *after* the Bathroom spike so the tech is proven.

## 1. Regions (linear stages, not a graph)

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmark |
|---|---|---|---|---|---|---|
| `R_grate` | The Grate | connector | A0 | 8×8 | downspout mouth (XL) | Grate |
| `R_shaft` | Downspout Shaft | climb | vertical | ⌀ ~2.5, 40 tall | dark interior, debris ledges | Seed Jam |
| `R_seedjam` | The Seed Jam | arena | mid | 10×6 ledge | helicopter-seed drift (XL) | Seed Jam |
| `R_halfpipe` | The Halfpipe | arena | A2-ish | 30 long channel | roofline vista, house lights below | Halfpipe |
| `R_dam` | The Dam | connector | flat pool | 12×8 calm | leaf boat | Dam |
| `R_window` | The Window | exit | A3 | 8×4 sill | cracked bathroom window (XL) | Window |

Linearity is intentional (bible: the traversal breather). No branching combat arenas — this map is climb-and-hold.

## 2. Routes

| ID | Stage | Class | Vocabulary |
|---|---|---|---|
| `RT_shaft` | up the downspout | climb | debris-ledge hop chain (seeds, twig jams, shuttlecock), lean-ramp sections |
| `RT_halfpipe` | along the gutter | main | curved channel walk, wind `pushVolume` gusts |
| `RT_leafboat` | across the dam | set piece | curled-leaf `movePlatform` between surges |
| `RT_window` | pry the screen | interact | grapple/pry the cracked frame |

## 3. Golden path

1. **Grate:** enter as the rain starts. Olive: "Storm's coming. Get inside before the gutter flushes."
2. Climb the **Downspout Shaft** (debris ledges) — surges begin flushing behind/below.
3. Hold the **Seed Jam** ledge against a doomed Tan expedition also climbing (`PICKET_LINE` over an anchor point as a surge approaches — fight or let the surge take them).
4. Traverse the **Halfpipe** in wind gusts (roofline vista — the map's one big scale-seller moment, house lights glowing below in the rain).
5. Cross the **Dam** by leaf-boat between surge windows.
6. Pry the **Window** as lightning strobes the map monochrome. Complete. (~130 u linear.)

## 4. Encounters (light — this is a traversal map)

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_seedjam` | PICKET_LINE | R_seedjam | 2 Riflemen + 1 Trooper (also fighting the surge) | region-enter |
| `E_halfpipe` | AMBUSH_POCKET | R_halfpipe | 2 Troopers behind twig jams | region-enter |

Peak ≈ 3. Encounters exist to punctuate the climb, never to gate it.

## 5. Hazards

| ID | Period | Phases | Telegraph | Regions |
|---|---|---|---|---|
| `H_surge` | 60 s (accelerates near the top) | `waterLevel` pulse + `pushVolume` down-channel; miss an anchor → washed back one stage (not death) | thunder → upstream gurgle, 4 s | all stages |
| `H_wind` | 25 s | `pushVolume` cross-gusts on the halfpipe | howl, 2 s | halfpipe |
| `H_lightning` | ~loose | full-screen monochrome strobe (mood; reduced-flash toggle respected) | thunder | all (visual) |

Surge is the pace-maker: it turns a climb into a rhythm puzzle without any puzzle UI (law 4). "Washed back one stage" is the no-punishment failure mode that keeps it tense-not-brutal.

## 6. Kit manifest

- **Reused:** water ops (from Bathroom), `domino`/popsicle (twig-jam cover), `leaf_ride` (from Backyard, as the dam boat), `giant_artifacts` (lead soldier cameo).
- **New heroes (≤8):** `downspout` (shaft shell), `gutter_channel` (halfpipe shell), `seed_helicopter` (debris ledge + marble prop), `shuttlecock` (debris ledge + marble prop), `twig_jam` (anchor cover), `window_cracked` (exit). **6 new — within budget.**
- **Fortification:** minimal — twig jams and seed drifts are the natural cover; this map leans on terrain, not kid-staged forts (the Tans here are a doomed expedition, not defenders).
- **Shell:** house siding corner, downspout tube interior, gutter channel, roofline backdrop, storm sky + rain particles.

## 7. Pickups & secrets

- Ammo at each ledge (you're not resupplying much — arsenal breather); glue at the Seed Jam and the Dam. No mold tray (short map).
- **Marbles:** (early-visible) one in the shuttlecock's cone, seen from below; one on the halfpipe lip. (hidden) in a twig jam; behind the dam leaf. (skill) one requires catching a surge window on the leaf boat.
- **POW/lore:** the **"lost pilot"** — a vintage lead soldier (an ancestor, not plastic) wedged in the seed jam, saluting. Gallery unlock, recurring cameo across maps.

## 8. Mission FSM

`brief → climb_shaft → hold_seedjam → cross_halfpipe → dam_leafboat → pry_window → complete`. Checkpoints per stage (generous — the tension is the surge, not the retries). **Par ≈ 4:00.**

## 9. QA deltas

- "Washed back one stage" needs clean state handling (surge as a soft respawn to the stage anchor, not a death) — verify in P3.
- Vertical linear camera in a narrow shaft: `lowCeiling`/narrow boom clamp throughout the shaft; test the camera sweep gate hard here (worst case for the whisker system).
- Lightning strobe is a photosensitivity risk — reduced-flash toggle must gate it from the start (roadmap flagged Maps 3/8 for this).
