# 06 — Level Architecture

**Purpose: make building maps mechanical.** The map bible (03) says what the maps are and why they're fun. This document is the construction system: canonical numbers, the data format, the runtime systems maps plug into, and the pass-by-pass pipeline with acceptance tests. When this doc and the blueprints (docs/blueprints/) are followed, "building a map" means transcribing a blueprint into a map module and passing its gates — no design decisions left on the construction floor.

Precedence: where this doc or a blueprint conflicts with older prose in docs/03, **this doc and the blueprints win** (see the scale audit below — several bible dimensions predate it).

---

## 1. Canonical scale (the audit)

**1 unit = 1 soldier height = 54 mm.** Conversion: `units = cm / 5.4`.

The map bible's table mixed two frames — real centimeters and "reads-as" human-equivalent meters (×32.4) — and the M0 greybox was accidentally built treating reads-as meters as units, inflating the world ~1.7× relative to the soldier. Canon is now fixed as above. Consequences:

- **Geometry is honest.** Every prop dimension in the kit catalog (07) is `real cm ÷ 5.4`. No cheating, per bible law 1 — honesty is what lets a player's own house calibrate the fantasy.
- **Kinematics are heroic.** The player walks 4 u/s and jumps 1.2× his own height. Real toys don't move; ours move like action heroes. This is a declared feel choice, not a scale claim. Player constants from M0 are **unchanged**.
- **The M0 arena is a known deviation.** It gets rebuilt from Household Kit v1 at canonical dims in the next code pass (cheap: it becomes the kit's test scene). Nothing else was built against the wrong constant.
- **Real-footprint sanity check** (new, mandatory): every map region must correspond to a plausible real-world area. A blueprint states its real footprint (e.g., Backyard = a 3.2×4.3 m patch of yard → 60×80 u). If the real object couldn't be that big, the map is wrong. This one rule caught the bible's oversized tub, counter run, and sandbox.

### Authoritative conversion table (supersedes the bible table's numbers)

| Object | Real | **Units** | Reads-as (fiction) |
|---|---|---|---|
| Toy soldier | 5.4 cm | **1.0** | a person |
| Marble | 1.6 cm | 0.30 | knee-high sphere |
| LEGO-class brick | 1 cm | 0.19 | ankle rubble (auto-step) |
| Domino | 4.8×2.4×0.75 cm | 0.89×0.44×0.14 | crouch cover *on end* |
| Alphabet block | 4 cm cube | 0.74 | hop-up crate |
| Hardcover book | 24×16×4 cm | 4.4×3.0×0.74 | low roof / big step |
| Soda can | 12.2 × ⌀6.6 cm | 2.26 × ⌀1.22 | stand-cover pillar |
| Cereal box | 30×20×7 cm | 5.6×3.7×1.3 | a shed-sized building |
| Shoebox | 33×19×12 cm | 6.1×3.5×2.2 | a bunker |
| Mug | 9.5 × ⌀8 cm | 1.76 × ⌀1.48 | hop-on turret ring |
| Ruler | 30×3 cm | 5.6×0.56 | footbridge (walkable) |
| Pencil | 19 × ⌀0.7 cm | 3.5 × ⌀0.13 | too narrow to walk — décor/rail, NOT a bridge |
| Garden hose | ⌀1.6 cm bore ⌀1.3 | ⌀0.30/0.24 | NOT crawlable — cover ridge / hop-walk top |
| Lawn grass | 6–9 cm | 1.1–1.7 | over-head jungle (eye height 0.92) |
| Stair riser / step | 18 cm | 3.3 | unclimbable wall, needs a route |
| Chair seat | 45 cm | 8.3 | mid-tier plateau |
| Bed frame (under-bed gap) | 30 cm | 5.6 | a dark country's sky |
| Table top | 75 cm | 13.9 | highlands |
| Kitchen counter | 90 cm | 16.7 | the high mesa |
| Bathtub interior | 150×70×45 cm | 28×13×8.3 | an intimate sea |
| Picnic tabletop | 180×75 cm | 33×14 | the finale arena |
| The Cat (shoulder) | 25 cm | 4.6 | kaiju |

Two bible-era route props fail the honesty audit and are **re-specced**: the hose is cover/ridge (its bore is 0.24 u — nothing crawls that), and pencil bridges become **ruler** bridges (pencils stay as rails, décor, and leaning ladders in pairs). Blueprints already reflect this.

---

## 2. Spatial grammar — the building code

All numbers derive from locked player metrics (radius 0.18, stand 1.0, crouch 0.52, auto-step 0.35, jump mounts ≤1.2 with apex 1.35, walk 4 / sprint 7 / aim-walk 2.8 u/s).

**Climb & gap vocabulary** (what a route may legally ask):

| Move | Limit | Notes |
|---|---|---|
| Auto-step | ≤ 0.35 | rubble, rug edges, book covers |
| Hop (jump-mount) | ≤ 1.2 | blocks, books-on-books, can-to-can |
| Two-step stair | risers ≤ 1.2, tread ≥ 0.5 | the standard kid-stacked staircase |
| Walk gap | ≤ 2.4 | plain jump across |
| Sprint gap | ≤ 4.0 | must be telegraphed (runway ≥ 6 u, no turn) |
| Crawl clearance | ≥ 0.60 | couch skirts, drawers; crawl length ≤ 8 u (camera) |
| Lean ramp | slope ≤ 45°, width ≥ 0.6 | a leaning board/cable/toothbrush: diagonal visual over a stepped collider (0.35 risers → auto-step chains into a climb). How cables, gutter interiors, and leaning rulers work with box-only collision |
| Drop (safe) | any | no fall damage in v1; drops are one-way route valves |

**Cover classes** (eye height 0.92 standing, 0.48 crouched):

| Class | Height | Kit examples |
|---|---|---|
| Crouch cover | 0.55–0.95 | domino on end, matchbox, hardcover lying |
| Stand cover | 1.05–1.60 | soda can, juice box, cereal box edge-on |
| Blocking wall | ≥ 1.80 | shoebox, book stacks, furniture |

**Engagement bands:** cap pistol 3–10 u · rifle 6–25 u · rubber-band sniper 15–45 u. An arena pocket is **≤ 25×25 u** with its longest intended firing lane inside the deploying weapon's band. Encounter pacing: a pocket or a set piece every 80–120 u of golden path (20–30 s at mixed speeds).

**Route widths:** main routes ≥ 2.0 u wide and camera-clean; flanks 1.0–2.0; crawls 0.6–0.9 (camera pull-in accepted, ≤ 8 u long). Ceilings on main routes ≥ 3.0 u (camera boom 2.7 stays comfortable); under-furniture zones are flagged `lowCeiling` and cap the boom.

**Altitude bands** (each map declares its own set; ≥3 bands, ≥2 honest routes between adjacent bands — bible law 3):

- **A0** floor/ground · **A1** low props 0.7–2.5 (cans, boxes, stacked books) · **A2** furniture mid 3–9 (chair rungs→seats, shoebox roofs, tub rim from inside) · **A3** high 10–17 (table/counter tops, bed plateau) · **A4** special summits (window sill, pegboard shelf).

**Verticality doctrine at honest scale:** single props are short — real height comes from *stacks* (kid-built) and *furniture* (terrain). That's more authentic anyway: kids stack. Every A1→A2 route should visibly be either furniture geometry or something a kid piled up.

**Landmark rule:** 4–6 registered landmarks per map, XL silhouette + unique hue; from any main-route point ≥1 visible. Briefings and Olive's callouts use only landmark names (bible law 5).

**Fortification doctrine (bible law 2):** combat-pocket hard cover is ≥50% from the fortification sub-kit (dominoes, juice-box pallets, popsicle barricades, cereal-box bunkers with cut windows) — the kid staged these fights. Household props are *terrain*, not sandbags.

**Scale-seller rule (law 7):** every region contains ≥1 XL-class prop or Giant artifact; the blueprint's region table has a column for it, and the DoD checklist counts them.

---

## 3. Map anatomy & data format

A map is **one TypeScript module** exporting a `MapDef` — declarative data interpreted by the runtime. No DCC tool in the loop: this studio's builder writes code, M0 proved a full arena in ~200 lines, defs are diffable and parametric. (GLTF import stays a listed escape hatch for the few sculptural props — gnome, duck, DYNO-MITE — as *kit assets*, never as level geometry.)

```ts
interface MapDef {
  id: string; title: string; realFootprint: string;
  shell: ShellDef;              // room/yard envelope: floors, walls, backdrop
                                //   masses, lighting rig id, fog, ambience id
  regions: RegionDef[];         // named AABB volumes; kind: arena|connector|
                                //   overlook|secret; altitudeBand; lowCeiling?
  props: PropInstance[];        // { kit, at, yaw, variant?, tags? } — colliders
                                //   and render come from the kit registry
  routes: RouteDef[];           // named polylines; class main|flank|crawl|
                                //   climb|secret; used by tests and AI hints
  nav: NavDef;                  // nodes + links; links typed walk|hop|drop|
                                //   crawl (molded units use walk links only)
  encounters: EncounterDef[];   // region-keyed template instances (see §4)
  hazards: HazardDef[];         // scheduler configs (see §5)
  pickups: PickupDef[];         // ammo|glue|moldTray|marble|pow placements
  mission: MissionDef;          // objective state machine + briefing lines
  landmarks: LandmarkDef[];     // name, prop ref, callout label
}
```

Code layout: `src/maps/kit/` (prop factories + registry), `src/maps/defs/` (one file per map), `src/maps/runtime/` (shell builder, prop instancer, region system, nav, encounter director, hazard scheduler, mission FSM). Loader contract: `buildMap(def)` → scene, collision world, systems. Dev URL: `?map=<id>` plus overlay toggles.

**Blueprint → def traceability:** every region, route, encounter, and hazard in a def carries the ID used in its blueprint. A def with an ID not in the blueprint (or vice versa) fails review. This is the faithfulness mechanism — the blueprint is the contract, the def is its transcription.

**Authoring aids (small tools, built once at M2):** free-cam (F8), position logger (P dumps `[x, y, z]` to console for transcribing waypoints/props by walking there), region overlay, nav-link overlay, hazard timeline readout, encounter-state readout. These make transcription mechanical.

---

## 4. Encounter system

**Templates, not hand-scripting.** A blueprint populates combat by referencing named templates with a composition; the encounter director handles activation, alert propagation, leashes, and the ≤12-active budget (dormant until their region activates).

| Template | Shape | Default composition |
|---|---|---|
| `LANE_AND_FLANK` | molded units own a firing lane; articulated pair rotates through a flank route | 2–3 Based Riflemen + 2 Troopers |
| `HIGH_GROUND_TAX` | grenadiers on a perch; a marked climb/silence route displaces them | 2 Grenadiers + 1 Trooper below |
| `SWEEPER_BELL` | a Minesweeper patrols; hidden statics activate where he pings you | 1 Sweeper + 3 dormant Riflemen |
| `PICKET_LINE` | wide thin line across a route; collapses to a fallback line when flanked | 3 Riflemen + 1 Officer |
| `WINDER_STALL` | wind-up armor + winding crew; killing winders stalls it | 1 Wind-Up Tank + 2 crew + 1 Trooper |
| `AMBUSH_POCKET` | dormant until the player is inside; erupts from concealment (grass, boxes) | 3 Troopers or 2 + Flamer |
| `HUSH_POCKET` | no-combat volume (Cat proximity, sleeping Giant); AI in it holds fire too | — stealth verbs only |
| `BOSS_ARENA` | bespoke per blueprint | scripted |

Each instance specifies: template, region, composition override, activation (`region-enter | objective | alert | schedule`), leash region, and hazard interaction note (e.g., "sprinkler pass extinguishes Flamer here"). Difficulty tuning = composition + count, never new behavior per map.

## 5. Hazard scheduler

One system, config-driven. `HazardDef = { id, period, phases: [{ at, name, ops }], telegraph: { audioCue, leadTime }, regions }`. The **op vocabulary** is the closed set of effects the engine implements; blueprints may only use these:

| Op | Effect | First needed |
|---|---|---|
| `pushVolume` | directional force in a volume (sprinkler sweep, surge, wind) | M2 Backyard |
| `soakVolume` | extinguish fire, dissolve glue, flatten grass in a volume | M2 |
| `damageVolume` | hot/hazard damage (burner, disposal, firework sparks) | M3 Kitchen |
| `lightVolume` | mark a volume lit (magnifier fuel, exposure stealth state) | M3 (stealth M4) |
| `movePlatform` | kinematic prop along a spline (leaf raft, rail pallet, toaster lever) | M2 (leaf ride) |
| `waterLevel` | raise/lower a water plane; floats respond; drown-line respawn | M3 spike → M4 Bathroom |
| `spawnWave` | encounter activation from a schedule (glider runs, reinforcements) | M2 |
| `quakeShadow` | screen shake + moving shadow + audio (Giant pass, Kid turning) | M2 |
| `fogVolume` | local concealment fog (steam, dust) | M4 |
| `noiseMask` | raises the hearing threshold globally (fireworks, TV) | M5 Picnic* |

*Map numbers here are campaign order; build order comes from the roadmap. The union above is the complete hazard-engine backlog — if a future map idea needs a new op, that's a design review, not a quiet addition.

## 6. Population standards (mechanical placement rules)

- **Pickup economy per pocket:** 1 ammo cache per pocket; 1 glue dot per 2 pockets, placed at pocket *exits* (heal after, not during); 1 mold tray (full heal) at ~60% of the golden path; perches get their own ammo so overlooks are worth the climb.
- **Marbles (5 per map):** 2 *visible-early, reached-later* (teach a route by showing the prize), 2 *hidden in kit logic* (inside/under props where lost things live — bible law 6), 1 *skill-gated* (ride, sprint-gap, or hazard-window timing).
- **POWs:** named POWs are mission beats (blueprint scripts them); generic POWs 1–2 per map in side pockets, always visible from a main route so the detour is a choice.
- **Par times:** golden path length ÷ 3.2 u/s + 30 s per mandatory pocket + set-piece time. Gold = par ×1.15, Silver ×1.5, Bronze ×2.2. Computed, then tuned once in playtest.
- **Checkpoints:** region-graph edges marked on the blueprint; every arena entry is a checkpoint, no checkpoint mid-fight.

## 7. The build pipeline — passes and gates

Every map is built in the same seven passes. A pass is done when its gate passes; gates are scripts under `tools/` wherever possible.

| Pass | Work | Gate (acceptance) |
|---|---|---|
| **P0 Blueprint** | the doc in docs/blueprints/ | review vs. §8 checklist; region/route IDs frozen |
| **P1 Shell & greybox** | shell + regions + props (kit placeholders) + routes transcribed | `tools/walk.mjs <map>`: scripted walkers traverse every route polyline (reachability CI); camera sweep along main routes logs boom < 1.0 u on < 8% of frames; real-footprint check; **movePlatform corridors are deck-height-clear** (no collider lip within auto-step range of the deck along the path — a 0.32 u crate walks a rider off a leaf, found by the Backyard mission gate) |
| **P2 Nav & encounters** | nav graph + encounter instances | AI pathing smoke: every nav link traversed by a spawned Trooper; templates activate and leash correctly |
| **P3 Hazards & mission** | scheduler configs + objective FSM | deterministic-clock timeline test (phases fire in order); mission FSM unit test start→complete |
| **P4 Dressing** | kit variants, dressing props, landmark polish — within the map's ≤8-new-heroes budget | perf flythrough ≤ budget (04-tech); law-7 scale-seller count per region ≥ 1; fortification ratio ≥ 50% in pockets |
| **P5 Audio & light** | ambience bed, hazard telegraphs, region music states | every hazard has an audible lead ≥ its leadTime; hush regions duck correctly |
| **P6 Playtest & tune** | par times, composition tuning, marble audit | a non-builder clears it hint-free; medal spread sane; all 5 marbles found by at least someone |

**Definition of Done for a map** = all seven gates green + blueprint traceability clean.

## 8. Blueprint QA checklist (applies at P0, re-checked at P4)

1. Real footprint plausible; every dimension traceable to a real object ÷ 5.4.
2. ≥3 altitude bands; ≥2 honest routes between adjacent bands; every climb within the §2 vocabulary.
3. Region graph: no arena with fewer than 2 exits (except designed boss locks); connectors have a pacing purpose.
4. Every pocket: cover ratio ≥50% fortification kit; lanes within weapon bands; hazard intersects ≥2 pockets per map (law 4: one hazard on a schedule, learnable, audio-telegraphed).
5. Landmarks: 4–6, every main-route point sees one; names pass the kid-directions test (law 5).
6. Scale: every region has its XL scale-seller; grass/under-furniture zones deliver at least one you-are-tiny vista each (law 7).
7. Secrets follow lost-thing logic (law 6); marble mix per §6.
8. The map answers its **fun target** (one sentence at the top of each blueprint) with a specific, named set piece.

---

## 8b. Surface zones

Two surface modifiers exist besides normal ground, declared as tagged volumes in the def: **slick** (soap bars, oil drips, polished tray: ground accel ×0.25 — comedy physics, used sparingly and always visually glossy) and **soft** (sponge, towel, dust bunnies: silent footsteps, no dive clack — the stealth-adjacent reward surface). No sticky surfaces in v1.

## 9. Perception & concealment (how grass and dark work)

Grass, steam, and darkness are **perception volumes**, not colliders: they modify AI sight range/chance and (for grass) render as instanced swaying cross-quads the player moves through freely. Sprinkler `soakVolume` temporarily flattens grass volumes (sightlines open — the bible's signature beat) by scaling the render instances and zeroing the perception modifier on the same timer. Darkness zones use the same modifier driven by the light system (`lightVolume` ops and map lighting), which is also what the magnifying glass queries. One system, three fictions.

## 10. What this unlocks (and what it demands)

With 06 + 07 + blueprints in place, building the campaign = for each map: transcribe (P1), wire (P2–P3), dress (P4–P5), tune (P6) — every step gated by a script or a checklist that already exists. The demands on the code side, all scheduled in the roadmap: the kit registry + instancer, region/nav/director/scheduler/mission runtimes (M2, proven on Backyard), `tools/walk.mjs` (M2), water ops (M3 spike), and the M0 arena's canonical-scale rebuild (next code pass, as the kit's test scene).
