# Blueprint — Map 01 · THE SANDBOX · "Basic Draining"

- **Verb:** tutorial assault · **Unlock:** core verbs + grenade · **Enemies introduced:** Based Rifleman, Grenadier (molded tier only — a fair fight)
- **Fun target:** *the tutorial becomes the inciting incident without a difficulty spike* — you learn to move and shoot on cardboard pop-ups, then the same skills are suddenly load-bearing when the raid hits. The buried-truck terrain shift teaches "the world moves" gently.
- **Real footprint:** a 1.1 × 1.1 m cedar sandbox → **20 × 20 u** walled arena. (Bible's 40×40 implied a 2.2 m sandbox; trimmed to true toy-sandbox size. Compact by design — it's the tutorial and reuses the Backyard kit, so it's the cheapest map.)

## 1. Regions (graph)

```
[FRAME RIM A2] ---------------- [FRAME RIM A2]
     |  (shovel ramp)               |
[CASTLE RAMPARTS A1] --- [SAND FLOOR A0] --- [THE GULF A0 wet]
                              |
                        [TRUCK A1] (set piece)
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmarks |
|---|---|---|---|---|---|---|
| `R_floor` | Sand Floor | arena | A0 | 20×20 | frame walls tower (A2) | Castle, Truck, Shovel |
| `R_castle` | Castle Ramparts | arena | A1 | 8×8, +2.5 | bucket keeps | Castle, Shovel |
| `R_truck` | The Dump Truck | set piece | A1 | 6 long | **truck** (XL ✱) | Truck |
| `R_gulf` | The Gulf | connector | A0 | 6×6 wet | rain puddle sheen | Gulf |
| `R_rim` | Frame Rim | overlook | A2 | ring, width 1.0 | the whole map below | everything |

## 2. Routes

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_shovel` | floor → rim | main | shovel = lean-ramp highway (≤45°) |
| `RT_ramparts` | floor → castle | main | bucket-mold steps, hop ≤1.0 |
| `RT_truckbed` | floor → truck bed | climb | wheel hop (1.1) then bed |
| `RT_knothole` | rim → floor | enemy | knothole caves (raid entry, drop-in) |

## 3. Golden path

1. **Sand Floor:** Olive runs drills vs. `TARGET_RANGE` pop-ups (reuse M0 targets) — move, aim, fire, grenade-arc taught here.
2. Climb the **Castle** (rampart hop) for the grenade drill.
3. Mid-drill: **the raid** — Based Riflemen + Grenadiers drop through the **knotholes** (`spawnWave`). Tutorial → real fight, same verbs.
4. Running fight floor → **truck**: climbing the truck triggers the **tilting-bed set piece** (`movePlatform`, slow groan) opening the bed as a fort.
5. Push the raiders back over the **rim**; they escape with the flashlight batteries (story hook for Map 6). Complete. (~45 u golden path.)

## 4. Encounters

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_drill` | (range) | R_floor | cardboard pop-ups | scripted tutorial |
| `E_raid` | LANE_AND_FLANK | R_floor/castle | 3 Based Riflemen + 2 Grenadiers | scripted (drill end) |
| `E_truck` | HIGH_GROUND_TAX | R_truck | 2 Grenadiers on the rim | truck-climb trigger |

Peak ≈ 5 — intentionally light; this is training.

## 5. Hazards

No scheduled hazard (bible: this map teaches rhythm-free basics). The hazard *slot* is used by **`H_giant`**: a scripted `quakeShadow` — a Giant passes, shadow sweeps, whole map quakes — teaching the telegraph grammar safely (no damage). Fires twice: once during drills (learn it), once during the raid (feel it under pressure).

## 6. Kit manifest

- **Reused (from Backyard build):** `bucket_castle`, `shovel_sand`, `truck_dump`✱, grass (frame exterior), `domino`/popsicle (raid cover), M0 targets.
- **New heroes (≤8):** `sand_floor` (deformable-look surface + Gulf wet zone), `frame_sandbox` (plank walls + knotholes), `bucket_pail`. **3 new — well under budget** (this is why it's built second, on Backyard's kit).
- **Fortification:** the kid's sandcastle *is* the fortification (diegetic); dominoes at the truck.

## 7. Pickups & secrets

- Ammo generous (tutorial); grenade pickups introduced on the castle. One glue dot post-raid.
- **Marbles:** (early-visible) one inside a bucket keep, seen from ramparts; one in the truck cab through the windshield, seen from rim. (hidden) buried in the Gulf (dig-prompt in wet sand); under an overturned pail. (skill) on the frame rim, reached only via the shovel ramp at a run.
- **POW:** one generic POW glued in a knothole (optional, teaches the rescue verb before it matters in Map 2).

## 8. Mission FSM

`brief → drill_move → drill_shoot → drill_grenade → raid(survive+repel) → truck_setpiece → complete`. Checkpoints: post-drills, raid start. **Par ≈ 2:30** (tutorial pace is generous; medals lenient).

## 9. QA deltas

- Tutorial gating: verbs must be taught in isolation before combined — FSM enforces order.
- Deformable sand is *look only* in v1 (a texture/normal trick + the truck tilt); no real terrain deformation. Flagged so nobody scopes a voxel sandbox.
