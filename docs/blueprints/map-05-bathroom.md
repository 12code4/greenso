# Blueprint — Map 05 · THE BATHROOM · "Operation Rubber Duck"

- **Verb:** naval assault · **Unlock:** Bazooka · **Enemies introduced:** duck patrol boats, soap-dish rafts
- **Fun target:** *terrain on a clock* — the water rises through the whole mission, drowning ledges and floating new routes into reach, and the sinking-freighter-into-draining-sea finale is the campaign's structural showpiece. The only map whose geography is fully time-based.
- **Real footprint:** a bathtub (150×70×45 cm) + coastline → tub sea **28×13 u**, rim/toilet/sink/tile ring around it. (Bible's 60×25 sea implied a 3.2 m tub; trimmed to a real tub — the intimacy is the point.)
- **Tech gate:** requires `waterLevel` op — de-risked by the **M3 water spike** (06 §5) two maps ahead of this build.

## 1. Regions (graph)

```
[TOILET TANK A3] --- [RIM RING-ROAD A2] --- [SINK OUTPOST A2]
       |                    |                      |
   (towel glacier)     [THE SEA A0-var floating]   |
       |                    |                       |
[TILE LOWLANDS A0] --- [OVERFLOW GROTTO A1 all-levels] --- [FREIGHTER (mobile)]
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmarks |
|---|---|---|---|---|---|---|
| `R_sea` | The Sea | arena (naval) | A0→variable | 28×13 | porcelain cliffs, the Duck (XL) | Duck, Freighter, Faucet Heads |
| `R_grotto` | Overflow Grotto | connector | A1 | 6×6 (stays open all levels) | drain pipe cave | Grotto |
| `R_rim` | Rim Ring-Road | overlook | A2 | ring, width 1.2 | the whole tub | everything |
| `R_towel` | Towel Glacier | connector | A0→A2 | ramp, soft | fabric folds (XL) | Towel |
| `R_freighter` | The Freighter | arena (mobile) | deck A1 | 6.5 long, moves | **barge** (XL) | Freighter |
| `R_tile` | Tile Lowlands | connector | A0 | 12×10 | grout grid | Towel, Grotto |

## 2. Routes

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_grotto` | tile → sea (insertion) | main | grotto pipe (stays open at all water levels) |
| `RT_archipelago` | sea crossing | main | sponge islands (FLOAT, soft), hop between |
| `RT_board` | sea → freighter | set piece | bent-bobby-pin grapple to the moving deck |
| `RT_towel` | sea/tile → rim | flank | towel glacier lean-ramp (soft, safe-landing) |
| `RT_rise` | (emergent) | dynamic | rising `waterLevel` floats new hops into reach over time |

## 3. Golden path

1. Insert via the **Overflow Grotto** (the one all-water-level-stable route).
2. Raft the **sponge archipelago** under duck-boat patrol (`PICKET_LINE` on the water).
3. **Board the Freighter** mid-sea (grapple), fight bow-to-stern through battery-crate canyons (`LANE_AND_FLANK` on a moving deck).
4. Plant the firecracker charge in the hold.
5. **The sinking = the finale:** freighter nose-down, cargo sliding, the drain opens (ship crushes the plug lever), and the sea drains into a whirlpool. Escape up the **Towel Glacier** as geography reappears in reverse. Complete. (~75 u effective path, but time-gated by water.)

## 4. Encounters

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_ducks` | PICKET_LINE (naval) | R_sea | 3 duck-boats (Riflemen lashed on) + 2 soap rafts | region-enter |
| `E_deck` | LANE_AND_FLANK | R_freighter | 3 Based Riflemen (deck lanes) + 2 Troopers | board trigger |
| `E_hold` | AMBUSH_POCKET | R_freighter hold | 2 Troopers + 1 Officer | charge-plant trigger |

Naval combat = encounters on FLOAT platforms; the director treats moving decks as regions that translate.

## 5. Hazards

| ID | Period | Phases | Telegraph | Regions |
|---|---|---|---|---|
| `H_rise` | continuous | `waterLevel` +Δ per phase across the mission (the master clock) | ambient fill sound, rising | all |
| `H_surge` | 75 s | `pushVolume` wave train swamps rafts, repositions floats | pipe shudder, 3 s | sea |
| `H_steam` | 90 s | `fogVolume` over the east fjord (neutral concealment) | hot-tap hiss | sea (east) |
| `H_drain` | scripted (finale) | `waterLevel` fast-drop + `pushVolume` whirlpool | plug crunch | all |

`H_rise` is the map's identity — it's a hazard that *is* the level design, changing which routes exist over the mission. Everything else rides on it.

## 6. Kit manifest

- **Reused:** `sponge`, `soap_bar` (slick), `duck_rubber`✱, `barge_freighter`, `boat_tub`, `towel_mass` (soft), `batt_*` (crates), `domino`/popsicle (deck cover).
- **New heroes (≤8):** `tub_shell` (porcelain sea basin, shell-fixture), `overflow_grotto`, `faucet_bath` (heads), `bobby_pin` (grapple), `plug_lever` (drain trigger), `whirlpool_fx`. **6 new — within budget.**
- **Fortification:** on the freighter, battery-crate stacks + popsicle barricades (the Tan defenders staged it).
- **Shell:** tub + rim, toilet tank highlands, sink outpost, tile floor, drain.

## 7. Pickups & secrets

- Ammo on floats + freighter; glue in the grotto and on the towel; **mold tray** on the toilet tank (dry high ground). Bazooka unlock on the freighter deck (you need it immediately for the finale escalation).
- **Marbles:** (early-visible) one at the bottom of the sea, seen through the surface all mission; one on the rim. (hidden) inside the toothbrush cup (holds a long-lost POW too); in the soap dish. (skill) **the sea-bottom marble** — reachable only in the final 60 s as the drain empties the tub. Time-gated by the master clock.
- **POW:** one generic in the toothbrush cup (he's been here since long before the war — lore beat).

## 8. Mission FSM

`brief → insert_grotto → cross_archipelago → board_freighter → clear_deck → plant_charge → sinking_escape(reach towel) → complete`. Checkpoints: grotto, board, charge-plant. No checkpoint during the sinking (the set piece is the tension). **Par ≈ 5:00** (water clock sets a soft floor on speed).

## 9. QA deltas

- `waterLevel` float dynamics are the whole map — the M3 spike must prove: buoyant props tracking the plane, drown-line respawn, and route-emergence timing. If the spike is shaky, this map slips, not the campaign (build order protects it).
- Moving-deck combat (regions that translate) is new director work; prototype in P2 with a single duck-boat before the freighter.
- The reverse-geography drain finale needs the same `waterLevel` op run backwards fast — verify no float/collider desync at speed in P3.
