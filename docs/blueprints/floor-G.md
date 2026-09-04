# Blueprint — Floor G · THE GROUND FLOOR · "The Long Hall"

*Construction contract for the first floor of the house (docs/10 §4.2, §11 step 2). Honest 1:32 scale, 1 u = 5.4 cm. Coordinates: x east, z south, north is −z, floor at y 0. The house footprint is x ∈ [−139, 139], z ∈ [−111, 111]. Every region, route, encounter, patrol, link and mission ID here is the ID the def (`src/maps/defs/house/g.ts`) must use.*

- **Verb:** the hub floor — cross a whole house, climb its furniture, find the way up.
- **Story (BOXED):** you arrive from the basement by the laundry chute. The kids are out. The rummage-sale box goes on Saturday. Upstairs is where the kids live; the stairs are the way. Field Marshal Taupe has garrisoned the kitchen and the mantel and calls the living room "the parade ground".
- **Fun target:** *the flicker at honest scale* — the fridge is a cliff you will stand on top of within the mission; the hall is a runway you will sprint down with a patrol behind you; the vaulted living room is a cathedral you climb by bookcase and jump rope.
- **Real footprint:** 15 × 12 m, ceiling 2.7 m (50 u); vaulted living room 5.2 m (96 u) with a skylight.

## 1. Regions

```
        N   (back of the house: the yard, not built yet)
 ┌───────────────┬──────────┬────────────┬─────────────────┐  z −111
 │ G_kitchen     │G_mudroom │ G_backhall │   G_garage      │
 │ 90 × 80       │ 50 × 60  │ 60 × 80    │   78 × 120      │
 │               ├──────────┤ (chute     │   (the car)     │
 │               │G_pantry  │  closet =  │                 │
 │               │ 50 × 20  │  arrival)  │                 │  z −31
 ├───────────────┼──────────┴────────────┤                 │
 │ G_dining      │      G_living         ├─────────┬───────┤  z 9
 │ 80 × 100      │      120 × 100        │ G_bath  │G_stairs│
 │               │      VAULTED 96 u     │ 30 × 40 │ 48×60 │  z 49
 │               │      balcony above    ├─────────┤ (marble│
 │               │      z 49..69 @ y 50  │G_closet │  run)  │  z 69
 ├───────────────┴───────────────────────┴─────────┴───────┤
 │                    G_hall  278 × 42     (front door S)  │  z 111
 └─────────────────────────────────────────────────────────┘
 x −139        −59/−49   1        61      91            139
```

| ID | Name | Kind | min → max (x, y, z) | Band | Floor | Summit | Landmarks | Checkpoint |
|---|---|---|---|---|---|---|---|---|
| `G_vestibule` | Vestibule | connector | (1, 0, −111) → (16, 50, −31) | A0 | tile | — | THE BASEMENT DOOR (south end; leads down, not built) | — |
| `G_backhall` | Back Hall | connector | (16, 0, −111) → (61, 50, −31) | A0 | tile | coat hooks 30 | THE CHUTE DOOR (closet at x 45..61, z −50..−31), the back door | (47, 0, −40) arrival |
| `G_kitchen` | Kitchen | arena | (−139, 0, −111) → (−49, 50, −31) | A0–A2 | tile | fridge top 33, upper cabinets 39 | THE COUNTER, THE FRIDGE, THE DRAWER, the island, the toaster | (−60, 0, −45) |
| `G_drawer` | The Junk Drawer | secret | (−136, 10, −62) → (−122, 20, −50) | A1 | — | — | THE DRAWER | — |
| `G_fridge` | Inside the Fridge | secret | (−70, 0, −97) → (−56, 34, −83) | A0–A2 | — | shelf 3 | the cake | — |
| `G_pantry` | Pantry | connector | (−49, 0, −51) → (1, 50, −31) | A0–A2 | tile | top tier at 33 | the flour tin | — |
| `G_mudroom` | Mudroom | connector | (−49, 0, −111) → (1, 50, −51) | A0 | tile | bench 8 | THE DOG DOOR, Biscuit's bed | (−24, 0, −80) |
| `G_garage` | Garage | arena | (61, 0, −111) → (139, 50, 9) | A0–A2 | concrete | car roof 27 | THE CAR, the tool wall, the garage door gap | (100, 0, 0) |
| `G_dining` | Dining Room | arena | (−139, 0, −31) → (−59, 50, 69) | A0–A2 | hardwood | china cabinet 37 | THE TABLE, the sideboard, the chandelier | (−99, 0, 50) |
| `G_living` | Living Room | arena | (−59, 0, −31) → (61, 96, 69) | A0–A3 | carpet rug on hardwood | mantel 20, bookcase 37, balcony rail 52 | THE FIREPLACE, THE BOOKCASE, the couch, the TV, the record player | (0, 0, 50) |
| `G_landing` | The Balcony | overlook | (−59, 50, 49) → (61, 96, 69) | A3 | hardwood (U floor) | — | THE RAIL | — |
| `G_bath` | Half Bath | secret | (61, 0, 9) → (91, 50, 49) | A0–A1 | tile | sink 15 | the sink | — |
| `G_closet` | Hall Closet | secret | (61, 0, 49) → (91, 50, 69) | A0 | hardwood | — | THE VACUUM | — |
| `G_stairs` | The Stairs | climb | (91, 0, 9) → (139, 50, 69) | A0–A3 | hardwood | top step 46 | THE MARBLE RUN | (115, 0, 65) |
| `G_stairtop` | Top of the Stairs | overlook | (91, 44, 5) → (139, 50, 15) | A3 | — | — | the landing | — |
| `G_hall` | The Hall | connector | (−139, 0, 69) → (139, 50, 111) | A0 | hardwood, runner | hall table 14 | THE FRONT DOOR, the height chart, the hall table | (0, 0, 90) |

Bands: A0 floor · A1 seat/drawer height (8–14) · A2 counter/table (14–39) · A3 mantel-and-above (20–52).

## 2. Shell

- **Walls**: exterior 4 u thick, interior 2.8 u, centered on the boundary lines above. Height 50 everywhere except the living room's four walls, which rise to 96 (the vault). Painted drywall (`wall` mass kind: cream 0xf0e8d6 with a 1.7 u baseboard band 0x8a6a48 and a 1 u crown band); kitchen and baths tile-wainscot (`wall` variant color 0xdde6df).
- **Ceilings**: `ceiling` masses at y 50–52 over every room except the living room; the vault ceiling at y 96–98 over `G_living` with a **skylight** (`glass` pane x −15..15, z −5..25 at y 96). The **balcony slab** (`slab`, hardwood) x −59..61, z 49..69, y 50–52 with a `rail` prop along z 49 (posts 12 u, top rail).
- **Doors** (openings 15 wide × 37 tall, framed 1 u): kitchen↔dining at x −100 (wall z −31); kitchen↔mudroom at z −80 (wall x −49); mudroom↔backhall at z −80 (wall x 1); pantry↔kitchen at z −41 (wall x −49); backhall↔living at x 30 (wall z −31); backhall↔garage at z −60 (wall x 61); bath↔living at z 29 (wall x 61); closet↔hall at x 76 (wall z 69). **Wide openings**: living↔dining x −59, z 0..30 (30 wide, arch to 40); living↔hall z 69, x −30..30 (60 wide, to 45); stairs↔hall open (no wall x 91..139 at z 69); dining↔hall door at x −100 (wall z 69).
- **Exterior**: front door x −7.5..7.5 on z 111 (`door_closed`, knob at 18.5) with sidelight `glass` x ±9..14, y 8..37; back door x 40..55 on z −111 (`door_closed`); basement door x 30..45 on the backhall's north wall (`door_closed`, label BASEMENT, leads to B — a `link` with the not-built card); garage roll-up door x 70..130 on z −111, y 3..40 (`mass`, ribbed) with the **3 u gap** underneath (`L_garage`); **dog door** x −27..−21 on z −111, y 0..5 (`dog_door_flap`, walk-through trigger `L_dogdoor`).
- **Windows** (`glass` panes in wall openings): kitchen north x −120..−80, y 20..40 (over the sink); mudroom north x −45..−30, y 20..40; backhall north x 10..25, y 20..40; dining west z −5..35, y 15..45; stairs east z 20..40, y 30..46. Sun through the west and north windows: sun dir (−0.5, 0.75, −0.4), warm; hemisphere warm cream / floor brown; fog off (near 300, far 900).
- **Floors** (`ground` zones): kitchen, mudroom, pantry, backhall, bath `tile` (cream 0xe8e2d2 with grout lines); garage `concrete` (0x9a9690, oil stain zone under the car 0x5a5652); dining, hall, closet, stairs, landing `hardwood`; living `hardwood` with a `carpet` rug zone x −50..40, z −10..45 (0x8a3a34 with a border) and a `carpet` runner in the hall x −100..100, z 84..96 (0x6a5a8a).

## 3. Furniture (kit props with colliders; honest dims in units)

| Prop | Where (at, yaw) | Dims | Notes / climb |
|---|---|---|---|
| `counter_run` (north) | (−102, 0, −105.5), size 66 × 16.7 × 11 | cabinets, countertop lip | walkable top; `faucet` at (−100, 16.7, −107); `toaster` at (−85, 16.7, −105); `microwave` at (−120, 16.7, −105) |
| `counter_run` (west) | (−129.5, 0, −72.5), yaw π/2, size 55 × 16.7 × 11 | | the **open drawer** `drawer_open` at (−122, 10, −56) protruding east: interior floor at 11, rim 18 → `G_drawer` |
| `cabinet_upper` ×2 | (−102, 26, −108), size 66 × 13 × 6.5 · (−129.5, 26, −72.5), yaw π/2, size 55 × 13 × 6.5 | | ledge at 39 |
| `stove` + `range_hood` | (−129.5, 0, −30 → no: (−129.5, 0, −100)? The stove sits in the west run: (−129.5, 0, −96), 11 × 16.7 × 11; hood at y 30 | | burners = hot hazard later |
| `fridge` (open, variant 1) | (−63, 0, −104), 14 × 33 × 14 | door swung toward −x | interior shelves 8/16/24 (climbable) → the cake on 16; top 33 = `SQ_toast` landing + marble |
| `island` | (−92, 0, −70), 25 × 16.7 × 20 | + 3 `stool` (6 ⌀ × 12) on the south side | mesa with stool steps: floor → stool 12 → island 16.7 |
| `stack_stairs` | (−118, 0, −45), rise 16.7 | cereal boxes and hardcovers stacked as stairs to the west counter's end | the kid's route up; risers ≤ 1.2 |
| `pantry_shelf` | (−24, 0, −47) yaw π, size 44 × 37 × 6 | tiers every 6.5 (35 cm); a can (2.2) and a cereal box on its side (4.4) at the end of each tier are the two hops to the next | `stack_stairs` at (−40, 0, −38) rise 6.5; flour tin at tier 2 = pocket spot |
| `bench_mud` + `boot_rain` ×2 + `coat_hooks` | bench (−40, 0, −60) 20 × 8 × 7; boots under; hooks (−24, 30, −53) size 40 | | `dog_bed` at (−38, 0, −70) 15 × 3 × 12; `keychain_pet` on the hooks |
| `chute_closet` | walls at x 45..61, z −50..−31 with a door at (53, 0, −31) | the chute opening on its east wall at y 10, 6 wide; `rope_knots` up the shaft to y 46 | `L_chute_up` trigger at y 44 |
| `door_closed` | basement (37.5, 0, −111); back door (47.5, 0, −111); front (0, 0, 111) | 15 × 37 × 1 | knob 18.5 |
| `car_sedan` | (100, 0, −58), 33 × 27 × 83 | 3 u clearance under; hood 17; roof 27 | `stack_stairs` on the north bumper (100, 0, −101) rise 17 → hood → roof; marble in the drain (128, 0.2, −20) |
| `tool_wall` | (137, 20, −40), size 60 × 25 | pegboard, tools | dressing |
| `bike` ×2 | (68, 0, −10) yaw 0.2; (75, 0, −4) | leaning on the west wall | cover |
| `dining_table` | (−99, 0, 19), 28 × 14 × 17 | + 6 `chair_dining` (seat 8.3, back 17) at ±16 x / ±13 z | `stack_stairs` at (−80, 0, 30) rise 8.3 → chair seat → table via chair back 17 (drop) |
| `sideboard` + `china_cabinet` | (−134, 0, 20) yaw π/2, size 40 × 17 × 8; cabinet to 37 | glass doors | summit 37 = marble; sniper perch |
| `chandelier` | (−99, 38, 19) | hangs from 50 | dressing; grenadiers' shadow |
| `couch` | (−20, 0, 8), yaw π/2 → facing east, 41 × 16 × 17 | seat 8.3, back 16, arms 10; 2 u canyon under | the tennis ball is under it (G2) |
| `coffee_table` | (−2, 0, 18), 25 × 8 × 12 | | cover |
| `tv_cabinet` + `tv_crt` + `vcr` | cabinet (56, 0, 35) yaw −π/2, 22 × 17 × 10; TV on top (to 27); VCR in the shelf | VCR blinks 12:00 | |
| `fireplace` | (58, 0, 5) yaw −π/2, 28 wide × 24 tall × 8 deep, chimney breast to 96 | hearth 3, lintel 13, mantel 20; stone ledge steps | `photo_frame` (crooked) at (57, 24, 5); `SQ_photo` |
| `bookcase` ×2 | (−44.5, 0, 65.5), 29 × 37 × 6 · (45.5, 0, 65.5) | shelves 5.5 apart with **book-stack stairs** on every shelf | summit 37; `rope_knots` (45.5, 37 → 52, 62) to the rail = `L_bookcase` |
| `rail` | along z 49, x −59..61 at y 52, 12 tall | posts every 6 u | the balcony |
| `side_table` + `record_player` | (−52, 0, 40), 8 × 12 × 8; player on top | secret 18 | `use` → music |
| `cardboard_box_open` | (10, 0, 40), 12 × 10 × 12 | open side facing −x | conceal zone inside (secret 17) |
| `piggy_bank` | on the bookcase shelf 3 (−44.5, 16.5, 65) | | breakable (secret 50) |
| `pedestal_sink` + `toilet` + `magazine_stack` + `duck_rubber` | sink (76, 0, 14) 10 × 15 × 9; toilet (66, 0, 40) yaw π/2; magazines (85, 0, 42); duck in the sink | | marble in the sink |
| `vacuum` | (76, 0, 60), 6 × 20 × 8, hose end at (70, 2, 55) | secret 21 | `warp` (to U, not built → card) |
| `stair_run` | (115, 0, 69 → 5), 14 risers 3.3 × 4.6, width 48 | unclimbable by design | |
| `marble_run` | west edge of the stairs x 93..95, from (94, 0, 69) to (94, 46, 5), 1.6 wide, rails | stepped 0.3 u; **gap** z 45..35 (10 u) until bridged | `ruler_bridge` spawned by `rig_stairs` |
| `hall_table` + `phone_corded` + `key_hook` + `mail_pile` | table (−60, 0, 106) 20 × 14 × 7 | | life |
| `umbrella_stand`, `shoe_pair` ×3, `plant_floor` ×2, `runner` | hall | | cover + life |

## 4. Routes (P1 walk gate)

| ID | Class | Points (x, y, z) |
|---|---|---|
| `RT_arrival` | main | (53, 0, −40) → (30, 0, −40) → (30, 0, −20) → (0, 0, 20) → (0, 0, 80) → (0, 0, 104) |
| `RT_kitchen` | main | (30, 0, −80) → (−24, 0, −80) → (−60, 0, −80) → (−92, 0, −90) → (−118, 0, −50) |
| `RT_counter` | climb | (−118, 0, −45) → (−128, 16.7, −55) → (−128, 16.7, −90) → (−100, 16.7, −105) → (−85, 16.7, −105) |
| `RT_fridge_top` | setpiece | (−85, 16.7, −105) → (−63, 33, −104) |
| `RT_pantry` | climb | (−24, 0, −45) → (−30, 0, −34) → (−44, 22, −41) → (−44, 33, −41) |
| `RT_garage` | main | (30, 0, −60) → (80, 0, −60) → (100, 0, −105) → (100, 17, −95) → (100, 27, −60) → (100, 27, −20) |
| `RT_dining` | climb | (−99, 0, 60) → (−80, 0, 30) → (−83, 8.3, 30) → (−99, 14, 19) → (−113, 14, 19) |
| `RT_fireplace` | climb | (30, 0, 5) → (52, 3, 5) → (54, 13, 5) → (55, 20, 5) |
| `RT_bookcase` | climb | (30, 0, 60) → (45.5, 5.5, 63) → (45.5, 22, 63) → (45.5, 37, 63) → (45.5, 52, 55) |
| `RT_stairs_lower` | main | (100, 0, 90) → (94, 0, 69) → (94, 17, 46) |
| `RT_stairs_upper` | main | (94, 24, 35) → (94, 46, 8) |
| `RT_hall` | main | (−130, 0, 90) → (−60, 0, 90) → (0, 0, 90) → (76, 0, 74) → (130, 0, 90) |
| `RT_bath` | flank | (40, 0, 29) → (66, 0, 29) → (76, 0, 22) |

## 5. Encounters, patrols, pockets

| ID | Template | Region | Composition (yaw = facing) | Activation |
|---|---|---|---|---|
| `E_counter` | LANE_AND_FLANK | G_kitchen | 3 based on the north counter top facing south; 2 troopers on the floor by the island; 1 officer on the island | region-enter G_kitchen |
| `E_fridge` | AMBUSH_POCKET | G_fridge | 2 troopers on the cake shelf | region-enter G_fridge |
| `E_dining` | HIGH_GROUND_TAX | G_dining | 2 grenadiers on the table, 1 sniper on the china cabinet | region-enter G_dining |
| `E_fireplace` | PICKET_LINE | G_living | 3 based on the hearth/mantel, 1 trooper | region-enter G_living |
| `E_garage` | HIGH_GROUND_TAX | G_garage | 1 sniper on the car roof, 2 troopers under the car | region-enter G_garage |
| `E_stairs` | PICKET_LINE | G_stairtop | 3 based at the top step, 1 officer | objective `rig_stairs` |
| `E_hall_wave` | PICKET_LINE | G_hall | 3 troopers + 1 flamer from the front door | schedule 12 s after E_stairs |
| `E_landing` | PICKET_LINE | G_landing | 2 based at the rail | region-enter G_landing |

| Patrol | Route (landmarks / points) | Composition | Speed |
|---|---|---|---|
| `PT_kitchen` | island S (−92, 0, −50) → fridge (−63, 0, −85) → pantry door (−45, 0, −41) → island | 2 troopers | 3.2 |
| `PT_hall` | front door (0, 0, 100) → closet door (76, 0, 78) → stairs foot (110, 0, 80) → dining door (−100, 0, 78) → front door | 3 troopers | 3.2 |
| `PT_living` | couch (−20, 0, 30) → TV (40, 0, 40) → fireplace (40, 0, 5) → hall opening (0, 0, 62) → couch | 2 troopers + 1 flamer | 3.0 |
| `PT_garage` | door gap (100, 0, −105) → car side (78, 0, −60) → tool wall (130, 0, −40) → door gap | 2 troopers | 3.2 |

Pocket spots (tags `pocket` on props/regions): under the dining table, pantry tier 2 (flour tin), inside the mudroom boot, under the couch, the hall closet, behind the garage bikes, the fridge's bottom shelf. Table: 3 troopers (weight 3) · 2 troopers + flamer (1) · 2 based hop-ups (2). Chance 30% on region entry, cooldown 40 s, never inside `HUSH` volumes.

Total ≈ 42 Tans; ≤ 18 active by dormancy.

## 6. Hazards

- `H_biscuit` (G2, scripted): `quakeShadow` from the dog door (−24, 0, −111) to the hall (0, 0, 90), radius 12, 6 s, magnitude 0.7, plus a `pushVolume` down the mudroom and backhall for 3 s. Telegraph: paws on tile (audio) 1.5 s before.
- Stove burners: warm zone (cosmetic heat shimmer) now; a `soakVolume`-style fire zone later.
- The skylight's sun patch moves nowhere (no cycle, decision 11).

## 7. Kit manifest

Reused: `book_hard`, `book_paper`, `box_cereal`, `can_soda`, `cup_mug`, `pot_flower`, `boot_rain`, `domino`, `matchbox`, `ruler`, `metric_ruler`, `rubber_band` (trail markers), `chalk_arrow`, `batt_crate`, `key_house`.

**New (house kit, `src/maps/kit/house.ts`)** — furniture: `counter_run`, `cabinet_upper`, `stove`, `range_hood`, `fridge`, `island`, `stool`, `drawer_open`, `faucet`, `toaster`, `microwave`, `pantry_shelf`, `stack_stairs`, `dining_table`, `chair_dining`, `sideboard`, `china_cabinet`, `chandelier`, `couch`, `coffee_table`, `tv_cabinet`, `tv_crt`, `vcr`, `fireplace`, `photo_frame`, `bookcase`, `rope_knots`, `rail`, `side_table`, `record_player`, `cardboard_box_open`, `piggy_bank`, `pedestal_sink`, `toilet`, `vacuum`, `stair_run`, `marble_run`, `ruler_bridge`, `hall_table`, `car_sedan`, `tool_wall`, `bike`, `dog_door_flap`, `dog_bed`, `bench_mud`, `coat_hooks`, `door_closed`. Life: `note_paper`, `drawing_taped`, `clock_wall`, `calendar`, `phone_corded`, `key_hook`, `mail_pile`, `boombox`, `dog_bowl`, `shoe_pair`, `umbrella_stand`, `plant_floor`, `magazine_stack`, `duck_rubber`, `laundry_basket`, `keychain_pet`, `height_chart`, `magnet_board`, `tennis_ball`, `leash`, `sock`.

## 8. Pickups, secrets, side quests

- Marbles (5): fridge top (−63, 33.2, −104); junk drawer (−128, 11.2, −56); china cabinet top (−134, 37.2, 20); garage drain (128, 0.2, −20); bath sink (76, 15.2, 14).
- Ammo: island top, hall table, garage tool wall foot, dining sideboard. Glue: pantry tier 1, bath. Mold tray: the balcony (`G_landing`).
- Weapon crates: flamethrower on the fridge top's far corner (reward for `SQ_toast`); bazooka under the car.
- Secrets built on this floor (docs/11): 11 toaster, 12 magnets, 13 cake + guard, 14 drawer, 15 microwave, 16 under-table fort, 17 cardboard box, 18 record player, 19 photo, 20 VCR, 21 vacuum warp, 22 height chart, 23 under the car, 24 bath duck, 48 marbles, 49 keychain pet, 50 piggy bank.
- Side quests: `SQ_toast` (launch at the toaster → fridge top; flamer crate + marble), `SQ_photo` (climb the fireplace, straighten the photo; Olive's line about the backyard picture; mold tray).

## 9. Mission FSM

**G1 — The Long Hall** (gates U). Arrival spawn (53, 0, −40) facing west; briefing: Olive on the chute, the kids out, the box on Saturday, the stairs.

| ID | Kind | Target | Text | Radio start / done |
|---|---|---|---|---|
| `reach_kitchen` | discover | G_kitchen | Find the kitchen | "Kitchen's west. The kids keep string in the junk drawer — we need it for the stairs." / "Tans on the counter. Of course." |
| `clear_counter` | clear | E_counter | Clear the counter | — / "Counter's ours. The drawer's in the west run, hanging open." |
| `get_string` | use | `use_drawer` | Get the string from the junk drawer | — / "String. Now the stairs — the kids' marble run never got finished." |
| `rig_stairs` | use | `use_gap` (requires flag `string`) | Bridge the marble run's gap | "Hall, then the stairs. The run stops halfway up; tie the ruler across." / "That's a bridge. And that's every Tan in the hall hearing it." |
| `climb_landing` | reach | G_stairtop | Climb to the second floor | — / "Second floor. The kids' rooms. Go on up, Sergeant." |

Completion: `L_stairs_G` found; checkpoint at the top.

**G2 — Open House** (flavor; unlocks Y). Available after G1 from the mission select.

| ID | Kind | Target | Text |
|---|---|---|---|
| `find_ball` | pickup | `ball` under the couch | Find Biscuit's ball |
| `lure` | use | `use_flap` (requires `ball`) | Roll the ball under the dog door |
| `brace` | wait | 8 s (H_biscuit fires) | Biscuit is coming. Brace. |
| `flap_open` | reach | `G_flap` (−24, 0, −108) | Get to the open flap |

Completion: `L_dogdoor` found ("That's the yard. Another day, Sergeant.").

Par: G1 260 s, G2 150 s.

## 10. QA deltas (06 §8)

- **Conventions as built:** camera yaw π faces north (−z), yaw 0 faces south; a prop with yaw 0 faces −z (its local front); `yawToward` returns the yaw that looks from A to B. Every unit and prop yaw in `g.ts` follows this.
- The camera can never rise above a 50 u wall, so overhead checks use the free-cam (`__game.freeCam`, `tools/tour.mjs g-top`), not the rig.
- Headless renders at ~1 fps; every gate loads `?turbo` (six 0.05 s sim steps per frame) or it takes hours.

- Camera under 50 u ceilings is fine (boom ≤ 6 u); the vault needs no special case. Doorways 15 wide × 37 tall never pinch the boom.
- Every summit has a ≤ 1.3 u step route (book stacks, stool, hearth ledges, rope knots): P1 must prove all `climb` routes.
- `RT_stairs_upper` is only reachable with the bridge: the walk gate spawns it via the `__game.give('bridge')` hook.
- Prop count ≈ 900 instances; collision boxes ≈ 1100. Watch the frame-time graph; instancing later (decision 14).
- Loading links to B, U and Y show the not-built card and return the player; the links still count as found.

**Walk-gate conventions added while building G.** Climb routes carry one waypoint per hop (every fireplace ledge; every bookcase shelf's tallest stack, then the board above) so the autopilot walks, not sprints, into a 1.1–1.2 riser and jumps at the right moment; climb legs get 22 game-seconds against 14 for main routes. Setpiece routes (`RT_stairs_upper`, `RT_rope`) are skipped by the walk gate and proven by `house-g.mjs` or by hand.

## 11. As built — deviations from the contract (2026-09-03, P1–P3)

Logged per the traceability rule (06 §3): where `g.ts` differs from §2–§3 above, the def is right and this list says why.

- **Vestibule.** The basement door moved off the exterior north wall (a door in an outside wall can't lead down) into a new `G_vestibule` strip, x 1..16, between the mudroom and the back hall: mudroom↔vestibule door at z −80 (wall x 1), a 20-wide opening vestibule↔backhall at z −90 (wall x 16), and `door_closed` v1 BASEMENT at the vestibule's south end (8.5, 0, −32.6) with link `L_bstairs`. The back hall is x 16..61; the arrival spawn is (47, 0, −40) at the chute-closet door, facing west.
- **Openings.** Backhall↔living door at x 35 (clear of the chute closet); bath↔living door at z 40; kitchen west window z −85..−55 over the west counter; dining west window z −25..−5 so the sideboard and china cabinet (z 0..40) sit under a plain wall; a backhall window x 18..30.
- **Kitchen.** North counter run x −135..−80 (size 55) with the stove at (−74.5) and the fridge at (−63) completing the wall; faucet (−100) and toaster (−95) on the north run, the microwave on the west run at (−131.5, 16.7, −60) facing east (the north run's back edge sits inside the exterior wall, so a corner microwave left no lane); the open junk drawer protrudes east from the west run at (−118, 10, −56) (interior floor 11, rim 12.2 — a real drawer is 12 cm deep, and you hop out); island at (−92, 0, −70) with three stools along its south side. **The climb is a `ramp_plank`** — a shelf board leaned against the west run's front at (−112, 0, −85), rise 16.7 over 24 (slope 0.70), rubber bands for grip, a book under the foot — not the book stack at the counter's end the contract drew: the stack's top sat 2 u short of the counter and its 1.15 risers needed jumps.
- **Pantry.** One shelf unit on the north wall, tiers every 6.5 u with built-in can-and-cereal-box hops; stack stairs (−40, 0, −39) rise 7.2 over 10 to the second tier's top (7.2), flush with the shelf front at z −44.
- **Living room.** TV cabinet + CRT + VCR on the north wall at (12, 0, −26) facing south; couch at (12, 0, 12) facing the TV; coffee table (12, 0, −10). The climbing bookcase is on the **west** wall at (−56, 0, 50) (z 35..65) with the knotted rope at (−50, 37, 48) hanging through a **gap in the balcony rail** (x −53..−47): bookcase top → rope knots → onto the slab through the gap. A second bookcase on the east wall at (56, 0, 58) carries the piggy bank. Fireplace at (57, 0, 5) facing west; its stone ledge steps climb the **south** cheek; crooked photo at (56.4, 24, 5).
- **Stairs.** Staircase 44 wide at x 95..139, **run 60 (z 9..69)** so the top step meets the garage wall instead of crossing it (the contract's 64 run put the top 4 u inside the wall). Marble run at x 94 at the stairs' slope (46/60): lower (94, 0, 57) 1.6 × 18.4 × 24 (z 45..69), the 10 u gap (z 35..45) bridged by `ruler_bridge` at (94, 18.4, 40) rise 7.67 when `use_gap` (94, 18.6, 44) fires (permanent WorldState flag `bridge`), upper (94, 26.07, 22) 1.6 × 19.93 × 26 (z 9..35) to the top step at 46. Each `marble_run` piece now builds its whole size (the old half-piece variants left a 15 u hole above the bridge). The ceiling is open over the top half of the stairs (z 9..40) into a dark second-floor shell 12 u higher: the stairwell reads as going up. `G_stairtop` is the top two steps (z 10.4..18, y ≥ 44); `L_stairs_G` is the back half of the top step (x 95..139, z 10.4..12) and opens when **mission g1** is complete (links' `foundBy` names a mission id, which WorldState persists; objective ids don't). Likewise `L_dogdoor` opens on `g2`.
- **Garage.** The car's glass is raked at 0.77 (rise 10 over 13) with stepped colliders, so trunk → rear glass → roof → windshield → hood is a walk; the way up is a `ramp_plank` leaned on the rear bumper at (100, 0, −5.5), rise 17 over 22 (the contract's bumper stack had 7 u of run for 17 of rise, and nothing joined the hood to the roof). Bikes moved to (78, 0, 6) and (128, 0, −12) to clear the plank's foot. The roof sniper stands at (100, 27, −58).
- **Dining.** The table climb goes up the **east** chair, pulled up to the table at (−81, 0, 19): shingled books floor → seat at (−81, 0, 29) rise 8.9 over 12, then a second stack on the seat (−81.9, 8.9, 19) rise 5.1 over 6.5 onto the table top (14). The contract's south-west chair had the chair back between the stack and the seat.
- **Completion doesn't freeze the floor.** On maps with a mission list the tally is a six-second card and the sim keeps running, so the link you just unlocked (`L_stairs_G` after g1, `L_dogdoor` after g2) fires when you step onto it; Olive names the next mission on the floor. The Backyard keeps its frozen tally.
- **Stack stairs everywhere** are now shingled paperbacks with one book per riser (≤ 0.34 u, one auto-step): a ramp you walk, not a ladder you jump. Fireplace ledges (1.2) and bookcase hops (1.1) stay jumps by design — they are the "hard" climbs.
- **Fireplace.** The hearth is 3 u tall (a real raised hearth), so a stack of old magazines at (47.75, 0, 14) gets you onto it from the west. The stone ledges come out of the south cheek's outer face 5.2 deep: **up, back, up** (7 + 7 + 2 stones, x 51..58.5, one-tread turnarounds), **1.1 risers** on 1.25 treads at z ≈ 22.6 — the first stone is a hop up from the hearth, and the breast's last 1.6 u sit inside the garage wall. The top stone is 20.6; the mantel (21.2) is a short hop from its corner. Each stone is a 1.0-thick, 1.2-long slab collider (shorter than the tread, so neighbours never overlap), not a column from the floor; a stone two hops above another leaves 1.2 u of head room. The contract's 1.2 risers left 0.15 u under the jump apex and made fifteen hops in a row a coin toss; 1.0 risers with a two-tread turnaround made the turnaround hop too long to walk-jump. The contract's ledges wrapped from the back straight to the front — an 11 u leap. The mantel walkway in front of the chimney breast is 1.5 u wide (8 cm — a real mantel).
- **Bookcase.** Every board above the first stops 4 u short of the upright at the end its shelf's staircase rises toward, so you hop up **through the gap** (the contract's boards ran wall to wall and capped every staircase 0.5 u over your head). Standing books line the back 2.1 u of each shelf; the front 3.4 u is the lane. A top board closes the case at 37 (with a regular board at 33.4 under it, so the top compartment is two hops, not seven stacks crowding the landing), and the case top is the launch for the rope.
- **Rope.** Knots kink the rope ±0.75 left and right so no knot hangs over your head; you hop up and across (the contract's coaxial knots were an unclimbable column). The living-room rope hangs at (−52, 37, 48), 1 u off the bookcase front, through the rail gap. Rope hops are a setpiece for the walk gate (`RT_rope`), like the marble run's upper half.
- **Bath route** enters at the door (62, 0, 40) and swings to (63, 0, 34) before the sink — the straight line ran through the toilet.
- **Closet.** The vacuum-hose warp lands on the balcony (0, 52.2, 62) until the upstairs linen closet exists.
- **Life props** were topped up after a per-room audit (`tools` note in the ship log): every full room carries ≥ 12; the small closets carry 4–6.
