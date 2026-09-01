# Blueprint — Map 04 · THE KITCHEN COUNTER · "Countertop Interdiction"

- **Verb:** sabotage · **Unlock:** Water Pistol · **Enemies introduced:** Kneeling Bazooka Man, Officer, Minesweeper, first **DYNO-MITE** fight (powered tier debut)
- **Fun target:** *vertigo as a weapon* — the counter is a 16.7 u mesa where the floor is death, and the fight through the translucent Dish Rack (shooting silhouettes through frosted glass) is the map's signature. First powered-tier contact must feel like a genuine escalation.
- **Real footprint:** an L of kitchen counter, ~2.4 m + 1.8 m runs at 90 cm height → **44 + 33 u** of mesa top at **A3 (16.7 u)**. Floor is out of bounds (lethal fall).

## 1. Regions (graph)

```
[WINDOW SILL A4 sunbeam] (summit)
      | (toaster launch)
[CANISTER DISTRICT A3] --- [DISH RACK A3] --- [STOVE GAP A3] --- [SINK CANYON A3/var]
      |                                            |                    |
   (crane sabotage)                          (burner hazard)      [drain dungeon A0-ish]
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmarks |
|---|---|---|---|---|---|---|
| `R_canister` | Canister District | arena | A3 | 24×14 | tin silos (BW) | Silos, Toaster |
| `R_rack` | Dish Rack | arena | A3 | 18×16 | plate ridgeline (XL) | Rack, Gap |
| `R_gap` | Stove Gap | connector | A3 | 10 bridge | burner rings glow | Gap, Toaster |
| `R_sink` | Sink Canyon | arena | A3→var | 16×12 | faucet monolith (XL) | Steel Canyon, Faucet |
| `R_drain` | Drain Dungeon | secret | low | 6×6 | whirlpool | — |
| `R_sill` | Window Sill | overlook/summit | A4 | 12×4 | **the Sunbeam** | everything |

## 2. Routes

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_potbridge` | canister → sink (via gap) | main | pot-handle bridge over burner (WT, hazard-gated) |
| `RT_toaster` | canister → sill | set piece | toaster lever launch (`movePlatform`, ally-slammed) |
| `RT_backsplash` | rack → spice rack ledge | flank | tile ledges, hop chain |
| `RT_drain` | sink → drain dungeon | secret | drop-in (one-way; climb the chain out) |

**No floor route** — this map's identity is that A0 is death. Falls respawn at the last counter checkpoint.

## 3. Golden path

1. **Canister District:** sabotage point 1 — blow the string-and-pencil crane loading batteries (`SWEEPER_BELL` guards it).
2. Through the **Stove Gap** (pot-handle bridge, mind the burner) to sabotage point 2 — the flour-tin bomb.
3. **Dish Rack** hold: `PICKET_LINE` through translucent plates (sabotage point 3, the response wave).
4. **DYNO-MITE arrives** (`BOSS_ARENA`, phase 1 in the Rack — his bulk shatters plates; kite him toward the Gap).
5. Solve him with the **burner cycle** in the Stove Gap (bullets alone can't). Complete on the **Sill** (toaster launch, optional summit for the cross-schedule marble). (~70 u golden path.)

## 4. Encounters

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_crane` | SWEEPER_BELL | R_canister | 1 Minesweeper + 3 dormant Riflemen | region-enter |
| `E_rack` | PICKET_LINE | R_rack | 3 Riflemen + 1 Officer + 1 Kneeling Bazooka | objective (2 sabotages) |
| `E_dyno` | BOSS_ARENA | R_rack→R_gap | DYNO-MITE (phase 1) | objective (3 sabotages) |

## 5. Hazards

| ID | Period | Phases | Telegraph | Regions |
|---|---|---|---|---|
| `H_burner` | 12 s | 0 s cold (bridge safe); 8 s `damageVolume` FOOM + updraft `pushVolume` (launches Balsa gliders into canister) | tick-tick-tick, 3 s | gap, canister |
| `H_faucet` | 20 s | drip raises sink `waterLevel` a step (changes canyon routes; opens the ice-cube marble late) | drip beat | sink |

Burner intersects the Gap and (via updraft) the Canister — two pockets, satisfies law 4. It's also the boss solve.

## 6. Kit manifest

- **Reused:** `tin_canister`, `rack_dish`, `can_soda`, `cup_mug`, `bottle_spice`, `jar_baby`, `matchbox`, `domino`, `plane_balsa`, `dino_boss`✱, `batt_*`.
- **New heroes (≤8):** `toaster` (launch), `pot_handle` (bridge), `sink_faucet` (monolith), `crane_string` (sabotage rig), `ice_cube` (marble prison), `plate_stack` (destructible translucent — the Rack's shatter tech). **6 new — within budget.**
- **Fortification:** upturned mugs as bunkers, plate ridges as cover, dominoes in the Canister alleys.
- **Shell:** counter mass, stove + burner rings, sink basin + drain, backsplash ledges, spice rack, window frame + sunbeam volume.

## 7. Pickups & secrets

- Ammo per pocket; glue at Gap-exit and Sink-exit; **mold tray** in the Canister District. Sill has the magnifier teaser (Map 7 setup) — scorched arrow.
- **Marbles:** (early-visible) coffee-tin lid ajar, seen from the Rack; one on the spice rack seen from Canister. (hidden) inside a mug on the drainboard; in the drain dungeon. (skill) **the cross-schedule cut** — a marble frozen in an ice cube, reachable only after `H_faucet` raises the basin enough, on a return trip. The map's deepest secret.
- **POW:** one generic, glued on the sink island (visible, water-pistol rescue teaches the tool).

## 8. Mission FSM

`brief → sabotage_crane → sabotage_flour → hold_rack(clear) → dyno_phase1 → dyno_solve(burner) → complete`. Checkpoints per sabotage + boss start. **Par ≈ 4:30** (vertigo slows movement; longer pockets).

## 9. QA deltas

- Translucent-shatter plates: new render + destruction tech; prototype in the kit test scene before P4.
- Out-of-bounds floor needs a clean respawn UX (Olive's "requisitioning a replacement") and a soft ledge-grab assist so falls feel like tension, not punishment — tune in P6.
- DYNO-MITE is the first powered-tier AI; boss FSM is bespoke, budget it its own code slot in M3.
