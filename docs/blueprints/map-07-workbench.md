# Blueprint — Map 07 · THE WORKBENCH · "The Arsenal of Tan-ocracy"

- **Verb:** factory raid · **Unlock:** Magnifying Glass · **Enemies introduced:** Wind-Up Tank (production line), DYNO-MITE rematch
- **Fun target:** *the workshop you weren't allowed in* — sodium-worklight industry, a moving assembly line you sabotage and then ride, and the magnifier's geometry-of-light gameplay (only fires where it's lit). The childhood register shifts from "backyard fun" to "the forbidden garage," earned by being map 7.
- **Real footprint:** a workbench top + pegboard + under-bench floor → three stacked fronts, ~**50×30 u** top over a **50×30 u** floor, pegboard climbing to a **45 u** worklight shelf (the campaign's tallest fair climb).

## 1. Regions (graph)

```
[WORKLIGHT SHELF A4] (summit)
      | (pegboard ascent)
[PEGBOARD WALL A2/A3 swinging tools]
      |
[BENCH TOP A3 factory floor] --- [THE VISE A3] --- [THE SPITFIRE A3 wreck]
      |  (assembly line rides)
[UNDER-BENCH A0 oil swamp + mousetrap minefield]
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmarks |
|---|---|---|---|---|---|---|
| `R_under` | Under-Bench | arena | A0 | 50×30 | paint-can pillar forest | Vise (above), Jars |
| `R_bench` | Bench Top (factory) | arena | A3 | 50×30 | the assembly line (XL) | Line, Vise, Spitfire |
| `R_vise` | The Vise | set piece | A3 | 8×6 | **the vise** (XL) | Vise |
| `R_spitfire` | The Spitfire | arena | A3 | 12×10 | model plane wreck (XL ✱) | Spitfire, Board |
| `R_peg` | Pegboard Wall | climb | A2/A3 | vertical, 30 tall | hanging tools (swinging platforms) | Board, Light |
| `R_shelf` | Worklight Shelf | overlook/summit | A4 | 12×6 | **the worklight** | everything |

## 2. Routes

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_line` | across the bench | main | ride the assembly-line pallet (`movePlatform`, fixed loop) |
| `RT_pegboard` | bench → shelf | climb | hooks as hop-ledges (0.74–1.2 grid) + swinging-tool platforms |
| `RT_wrench` | pegboard gap | set piece | swinging-wrench pendulum ferry (`movePlatform` arc) |
| `RT_mousetrap` | under-bench | flank | mousetrap minefield (trigger deliberately to launch objects/Tans) |
| `RT_vise` | bench → vise | interact | held-interact crush (boss finisher) |

## 3. Golden path

1. **Under-Bench** infiltration through the mousetrap minefield + paint-can pillars (`SWEEPER_BELL`).
2. Reach the **Bench Top**; sabotage the winding crews station-by-station along the moving **Line** (`WINDER_STALL` ×2 — tanks stall mid-assembly, the line carries your handiwork forward *visibly*: factory maps must show consequence).
3. Seize the **battery bay**.
4. **Pegboard ascent** under Balsa glider harassment (swinging-tool platforms) to cut the **Worklight** — the factory's power *and* its QA "sun" *and* the magnifier's fuel source.
5. **DYNO-MITE rematch** (`BOSS_ARENA`) on a now-dark bench top, strobed by the dying worklight and your magnifier snaps — until the **Vise** ends him (half of him). Complete. (~90 u golden path — the longest map.)

## 4. Encounters

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_under` | SWEEPER_BELL | R_under | 1 Minesweeper + 3 Riflemen (paint-can cover) | region-enter |
| `E_line1` | WINDER_STALL | R_bench | 1 Wind-Up Tank + 2 crew + 1 Trooper | region-enter |
| `E_line2` | WINDER_STALL | R_bench | 1 Wind-Up Tank + 2 crew + 1 Officer | objective (bay approach) |
| `E_dyno` | BOSS_ARENA | R_bench→R_vise | DYNO-MITE (rematch, tougher) | objective (worklight cut) |

## 5. Hazards

| ID | Period | Phases | Telegraph | Regions |
|---|---|---|---|---|
| `H_worklight` | thermostat cycle ~40 s | ON: `lightVolume` full (killing brightness for molded shadows; **powers the magnifier on the lit half**) / OFF: dark | thermostat click, 2 s | bench, pegboard |
| `H_line` | fixed loop 30 s | `movePlatform` pallets (ride between fronts; mind tunnel clearances) | mechanical clatter | bench |
| `H_mousetrap` | player-triggered | `movePlatform` snap-launch (objects/Tans/you) | creak on approach | under |

The worklight is the map's cleverest system: the magnifier unlocks mid-map and the map *immediately* teaches its light-geometry gameplay — stand in the lit half to fire the superweapon, and the cycle keeps moving where "lit" is (law 4, and the unlock's tutorial in one).

## 6. Kit manifest

- **Reused:** `can_paint` (slick pillars), `jar_baby` (washer avalanche), `trap_mouse`, `plane_balsa`/Spitfire variant, `track_train` (assembly line), `dino_boss`✱, `batt_*`, `domino`.
- **New heroes (≤8):** `vise`, `pegboard` (hook grid shell), `tool_hanging` (swinging platforms — wrench/pliers), `worklight`, `assembly_pallet` (tank chassis ride), `spitfire_wreck`✱, `screw_jar_av` (avalanche gag). **7 new — within budget.**
- **Fortification:** paint-can barricades + jar-lid bunkers under-bench; the QA firing range's silhouette targets as ironic cover on top.
- **Shell:** bench top + legs, pegboard wall + hooks, vise mount, worklight fixture, garage backdrop.

## 7. Pickups & secrets

- Ammo per pocket; glue under-bench and at the battery bay; **mold tray** at the bay (mid-path reward). Magnifier unlock at the worklight approach.
- **Marbles:** (early-visible) one on the Spitfire wing seen from the bench; one on a high pegboard hook. (hidden) inside the **washer jar** (shoot it → thousand-washer avalanche, the physics budget's proudest moment); under a paint can. (skill) the **"unpainted gray prototype" Moss skin** on the highest pegboard hook (full ascent required).
- **POW/lore:** the Spitfire cockpit holds the **lead pilot's flight log** (same ancestor cameo). No live POW (industrial map).

## 8. Mission FSM

`brief → infiltrate_under → sabotage_line1 → sabotage_line2 → seize_bay → ascend_cut_worklight → dyno_rematch → vise_finisher → complete`. Checkpoints per sabotage + bay + boss. **Par ≈ 6:00** (longest map; multi-front).

## 9. QA deltas

- The magnifier's lit-half gameplay depends on `lightVolume` being queryable by a weapon — same op the Bedroom uses for exposure; confirm the shared code path before this build.
- Assembly-line "shows consequence" (stalled tanks carried forward) is bespoke state on the movePlatform — budget it in P3.
- Washer avalanche is the one deliberate physics showpiece (instanced particle cheat, not a solver — per 04-tech); keep it scripted to the jar, not systemic.
- Longest map = tightest perf budget; run the flythrough gate on the full three-front view early (P4).
