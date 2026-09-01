# Blueprint — Map 02 · THE BACKYARD · "The Green Sea"

- **Verb:** recon + rescue · **Unlock:** Rubber-Band Sniper · **Enemies introduced:** Prone Sniper, Balsa Interceptor
- **Fun target:** *jungle warfare where the grass is a ceiling* — the flicker between "triple-canopy combat" and "it's just the lawn" must land in the first 20 seconds, and the sprinkler must change a fight you're already in.
- **Real footprint:** a 3.2 × 4.3 m patch of backyard → **60 × 80 u**. (Bible said 100×130; that implied a ~5.4×7 m lawn — plausible but oversized for a first slice; trimmed to keep encounter density up and build cost down. This is the M2 go/no-go map.)
- **Status:** the vertical slice. Everything the runtime needs (kit registry, region/nav/director/scheduler/mission, `tools/walk.mjs`) is proven here first.

## 1. Regions (graph)

```
        [FLOWERBED HIGHLANDS A2/A3]
                 |  (rake ramp)
[BIRDBATH OVERLOOK A3]         |
        \                      |
   [MOWED STEPPE A0] --- [JUNGLE A0/A1] --- [HOSE RIDGE A1]
        |   (stones)        |                   |
   [SPAWN LAWN A0] ------ [GNOME CLEARING A0] --[CONVOY ROAD A0]--→ exit (leaf ride)
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmarks seen |
|---|---|---|---|---|---|---|
| `R_spawn` | Spawn Lawn | connector | A0 | 14×12 | grass overhead | Gnome, Birdbath |
| `R_steppe` | Mowed Steppe | arena | A0 | 24×20 | the Stones (boulder chain) | Gnome, Birdbath, Faucet |
| `R_jungle` | The Jungle | arena | A0/A1 | 26×24 | grass canopy (perception vol) | Gnome |
| `R_gnome` | Gnome Clearing | arena | A0 | 18×18 | **the Gnome** (XL ✱) | Gnome, Birdbath |
| `R_hose` | Hose Ridge | connector | A1 | route, 22 long | the Hose (XL) | Faucet, Birdbath |
| `R_bird` | Birdbath Overlook | overlook | A3 | 10×10 top | **the Birdbath** (XL) | everything |
| `R_bed` | Flowerbed Highlands | arena | A2/A3 | 20×16 terraces | flower canopy | Gnome, Birdbath |
| `R_convoy` | Convoy Road | arena→exit | A0 | 30 long | hot-wheels track (XL ribbon) | Gnome, Faucet |

## 2. Routes (band transitions, all within 06 §2)

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_stones` | spawn/steppe → jungle | main | boulder chain, hop ≤1.2 each (stepping stones) |
| `RT_hose_top` | steppe → hose ridge | flank | hop onto hose (1.1), walk-top width 0.9 |
| `RT_rake` | gnome → flowerbed | main | leaning rake handle = lean-ramp (≤45°) |
| `RT_bird` | flowerbed → birdbath | climb | stacked-terrace hops then rim mount (1.0) |
| `RT_leaf` | convoy → exit | set piece | movePlatform leaf on the hose-stream |
| `RT_boot` | jungle → secret | crawl | into the lying rain boot (0.7 clearance) |

## 3. Golden path

1. **Spawn Lawn** (0 u): grass towers overhead; Olive briefs "follow Fern's rubber-band trail to Gnome." Scale-seller lands immediately.
2. Cross the **Stones** into the **Jungle** (~14 u): first `AMBUSH_POCKET` in the grass.
3. Jungle → **Gnome Clearing** (~34 u): `LANE_AND_FLANK`; discover the **Convoy Road** (hot-wheels track cut through grass).
4. Rake-ramp up to **Flowerbed** (~52 u): `HIGH_GROUND_TAX`; the mold tray (full heal) sits here at ~60% path.
5. Climb to **Birdbath** (~64 u): find Fern (glued POW, named beat); she becomes overwatch.
6. Descend, raid **Convoy Road** waypoint (~78 u): `PICKET_LINE` + first Balsa strafing (`spawnWave`).
7. Escape on the **leaf ride** (movePlatform) down the hose-stream under fire — exit. (~100 u total golden path.)

## 4. Encounters

| ID | Template | Region | Composition | Activation | Hazard note |
|---|---|---|---|---|---|
| `E_jungle` | AMBUSH_POCKET | R_jungle | 3 Troopers (rise from grass) | region-enter | sprinkler flattens their cover mid-fight |
| `E_gnome` | LANE_AND_FLANK | R_gnome | 3 Based Riflemen (lane) + 2 Troopers (flank) | region-enter | — |
| `E_bed` | HIGH_GROUND_TAX | R_bed | 2 Grenadiers + 1 Prone Sniper (perch) | region-enter | rake-ramp is the displace route |
| `E_convoy` | PICKET_LINE | R_convoy | 3 Riflemen + 1 Officer | objective (Fern rescued) | — |
| `E_air` | spawnWave (Balsa) | R_convoy | 2 Balsa Interceptors, 12 s apart | schedule from convoy alert | shadow telegraph |

Active-combatant peak ≈ 8, under the 12 budget.

## 5. Hazards

| ID | Period | Phases (ops) | Telegraph | Regions |
|---|---|---|---|---|
| `H_sprinkler` | 90 s | 0 s `pushVolume`+`soakVolume` sector A (steppe); 30 s sector B (jungle); 60 s sector C (gnome/bed edge) | pipe-knock, 3 s lead | steppe, jungle, gnome |
| `H_dog` | ~40 s jittered | `quakeShadow` fetch-run cratering the steppe | tag jingle, 2.5 s lead | steppe |

`soakVolume` flattens grass perception volumes on the sprinkler timer (06 §9): sightlines open twice a cycle. This is the map's signature systemic beat and the reason it's the slice.

## 6. Kit manifest

- **Reused:** grass (perception+render), `gnome`✱, `birdbath`, `pot_flower`, `stick_popsicle` (barricades), `domino`, `boot_rain`, `track_hotwheels`, `key_house`-family clutter.
- **New heroes (≤8):** `stone_stepping` (boulder), `rake` (ramp handle), `hose_garden` (ridge/stream), `leaf_ride` (movePlatform craft), `flower_canopy` (terrace + perception), `faucet_yard`, `bug_neutral` (ambient beetles, décor). **7 new — within budget.**
- **Fortification set:** popsicle barricades + dominoes at the Gnome and Convoy (≥50% pocket cover).
- **Shell:** soil terraces, mowed/unmowed lawn zones, fence backdrop, sky dome + fog.

## 7. Pickups & secrets

- Ammo per pocket (4); glue at jungle-exit and bed-exit; **mold tray** on the flowerbed (path ~60%). Birdbath perch has its own sniper-ammo cache.
- **Marbles:** (early-visible) one glinting on the birdbath rim seen from the steppe; one on the convoy road seen from the gnome. (hidden) inside the lying **rain boot** (`RT_boot` crawl); under the dog's buried bone (dig-prompt). (skill) grabbable only mid-**leaf ride** with a jump at speed.
- **POW:** Fern (named, scripted). No generic POW here (rescue is the headline).

## 8. Mission FSM

`brief → reach_gnome → find_convoy(discover) → rescue_fern(interact/water) → raid_convoy(clear E_convoy) → escape_leaf(ride) → complete`. Checkpoints at each region entry; none mid-leaf-ride (ride restarts on death). **Par:** 100 u ÷ 3.2 + 5 pockets×30 s + 20 s ride ≈ **3:20**; Gold ≤ 3:50.

## 9. QA deltas

- Grass perception + sprinkler-soak interaction is new tech → prove in P2/P3 with the timeline test before dressing.
- Leaf ride is the only movePlatform-as-vehicle in the slice; camera on a moving platform gets its own boom clamp (`lowCeiling`-style flag).
- Air units (Balsa) need a minimal flight path system — scoped as scripted splines, not free flight.
