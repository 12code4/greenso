# Blueprint — Map 08 · THE PICNIC TABLE · "The Fourth"

- **Verb:** combined finale + boss · **Unlock:** Firecracker Satchel · **Enemies:** everything, plus Field Marshal Taupe + fully-charged DYNO-MITE
- **Fun target:** *the campaign in miniature under a sky at war* — every system on one table, the rescued cast fighting beside you, the fireworks show as the artillery schedule (and noise mask), the ant column as an aimable third army, and an ending that lands the whole tone: total stakes in the fiction, zero outside it.
- **Real footprint:** a picnic tabletop (180×75 cm) + benches + ground beneath → tabletop **33×14 u** at A3, benches A2, ground A0. Built last: needs every op, every enemy, every kit group.

## 1. Regions (graph — deliberately echoes the campaign)

```
[THE THRONE A3+ cake-stand tiers] (boss)
      |
[TABLETOP SIEGE A3] --- [CONDIMENT DISTRICT A3] --- [THE WATERMELON A3 fortress/interior]
      |  (utensil bridges)                                |
[BENCH MIDLANDS A2] ------------------------------ [THE SPOOL A2 firecrackers]
      |
[UNDER-TABLE DARK A0] (Bedroom rules) --- [ANT TRAIL A0] --- [THE SANDWICH A0]
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Echoes |
|---|---|---|---|---|---|---|
| `R_undertable` | Under-Table Dark | arena | A0 | 33×14, `lowCeiling` | table underside sky | Bedroom |
| `R_bench` | Bench Midlands | connector | A2 | two benches + bridges | utensil bridges (XL) | Kitchen vertigo |
| `R_condiment` | Condiment District | arena | A3 | 14×10 | bottle pillars (XL) | Kitchen Silos |
| `R_melon` | The Watermelon | arena + interior | A3 | ⌀4.6, +interior | **melon fortress** (XL) | Colander interior |
| `R_spool` | The Spool | connector | A2 | ⌀1.85 drum | firecracker spool (XL) | — |
| `R_siege` | Tabletop Siege | arena | A3 | 20×14 | the open table under fireworks | — |
| `R_throne` | The Throne | boss | A3+ | cake-stand tiers | **battery bullion + Taupe pennant** | — |
| `R_ants` | Ant Trail | hazard lane | A0 | trail across | the ant column (XL swarm) | — |

## 2. Routes

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_utensil` | bench → tabletop | main | fallen-fork/spoon bridges (WT) |
| `RT_melon` | tabletop → melon interior | main | rind ramparts (WT) → cavern mouth |
| `RT_undertable` | ground → bench | climb | bench-leg drawer-style hops |
| `RT_throne` | siege → throne | boss lock | cake-stand tiers (hop chain, phase-gated) |
| `RT_spool` | bench → spool | flank | wire-drum roll-top |

## 3. Golden path

1. **Ground assault at dusk** with the whole rescued cast: Fern on overwatch from the pitcher rim, Sprout running ammo, Pickle's glue post under the table. (The campaign's rescues *become* the finale's gameplay — the payoff of every "rescue" verb.)
2. Take the **Benches**, cross utensil bridges to the **Tabletop**.
3. Breach the **Watermelon fortress** (its pink LED-lit cavern is the Tan command post — the game's strangest, best interior).
4. **Tabletop siege** under the fireworks; the **ant gambit** breaks the outer line (shoot the jam jar to re-route the column into the Tan flank — once).
5. **The Throne:** Taupe from a candy-tin mech-throne + a fully-charged DYNO-MITE. Phase 1 on the tiers; the satchel charge avalanches the throne (and batteries) across the table; phase 2 vs. overcharged, arcing DYNO-MITE in a dark lit only by the fireworks finale. Win.
6. **Ending:** batteries go home to the drawer. The Greens stand down on the table's edge. Moss: *"Best war I ever fought."* Sprout: *"Which one was this again?"* A porch light comes on, enormous and warm. Someone is calling everyone in. (~110 u + boss.)

## 4. Encounters (the roster's greatest-hits)

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_ground` | PICKET_LINE | R_undertable | 3 Riflemen + 1 Officer + allied cast | region-enter |
| `E_bench` | HIGH_GROUND_TAX | R_bench | 2 Grenadiers + 1 Prone Sniper | region-enter |
| `E_melon` | AMBUSH_POCKET | R_melon interior | 2 Flamers + 2 Troopers | breach trigger |
| `E_siege` | LANE_AND_FLANK + WINDER_STALL | R_siege | 3 Based + 2 Troopers + 1 Wind-Up Tank | region-enter |
| `E_taupe` | BOSS_ARENA | R_throne | Taupe + DYNO-MITE (2 phases) | siege cleared |

Active budget managed by region gating (allies count toward readability, not the 12 hostile cap).

## 5. Hazards (all of them — the finale earns the full op set)

| ID | Period | Phases | Telegraph | Regions |
|---|---|---|---|---|
| `H_fireworks` | show rhythm (~variable) | `damageVolume` spark-drops (start grass fires under table) + `noiseMask` (masks your loud actions) + light bursts | whistle → boom, 2 s; reduced-flash respected | all |
| `H_ants` | fixed march + 1 re-route | consume-anything on the trail; `jar_jam` shot re-aims it once | column rustle | ground, flanks |
| `H_grassfire` | emergent (from sparks) | `damageVolume` spread under table (water pistol extinguishes) | crackle | under-table |

`noiseMask` debuts here (bible: fireworks mask everything) — the stealth-inverse of the Bedroom's forced quiet. Full-op finale is intentional: the map is the campaign's systems review.

## 6. Kit manifest (reuse is the whole point — tiny new-hero count)

- **Reused (nearly everything):** `bottle_condiment`, `spoon_fork`, `melon_fort`✱, `spool_wire`, `jar_jam`, `batt_*` (the Throne bullion), `dino_boss`✱, all enemy kits, `duck`/water (the pitcher, distant), Bedroom dark props (under-table), Kitchen vertigo props, popsicle/domino/juice forts.
- **New heroes (≤8):** `cake_stand` (Throne tiers), `candy_tin` (Taupe's mech-throne), `firework_shell` (sky + spark FX), `ant_column` (swarm entity), `pitcher_lemonade` (overwatch perch + sequel wink). **5 new — under budget** (as designed: the finale is a reunion, not a new kit).
- **Fortification:** paper-plate ramparts, watermelon-rind walls, condiment-bottle pillars, the whole kid-staged Tan citadel.
- **Shell:** tabletop + benches + legs, ground/grass beneath, dusk→night sky with the firework show, the distant porch (ending).

## 7. Pickups & secrets

- Ammo generous (finale); Pickle's glue post is a mobile heal; **mold tray** in the watermelon cavern. Firecracker Satchel unlock pre-Throne.
- **Marbles:** (early-visible) one on the pitcher rim; one on a bench. (hidden) inside the watermelon (in the one bite someone took); under a paper plate. (skill) one on the spool, reached by rolling it. **The 40th marble** (all-maps completion) re-opens the **quiet post-battle table at night** — no enemies, fireworks over, the lead-soldier ancestor standing at the table's edge, saluting. He made it here first. He always does.
- **POW:** the cast is already rescued — they're your squad now. No new POWs.

## 8. Mission FSM

`brief → ground_assault → take_benches → breach_melon → tabletop_siege → ant_gambit → throne_phase1 → satchel_avalanche → throne_phase2 → victory → ending_scene`. Checkpoints per major beat + both boss phases. **Par ≈ 8:00** (finale length; medals account for the boss).

## 9. QA deltas

- This map validates that every op, template, and kit group composes on one stage — it's the campaign's integration test. Build it last, only after M4's other maps are green.
- Allied-cast AI (Fern overwatch, Sprout ammo runs, Pickle glue) is finale-only friendly behavior; scope as scripted support, not general ally AI.
- `noiseMask` + `damageVolume` (grass fire) + water-pistol-extinguish interacting under the table is the busiest systemic knot in the game — timeline-test it hard in P3.
- The ending scene is non-interactive; it carries the whole tone thesis (total-stakes/zero-stakes, the lost-toy ceiling inverted into "called in for the night"). Treat the porch-light beat as the single most important 10 seconds to get right in P6.
