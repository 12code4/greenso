# Blueprint — Floor U · THE UPPER FLOOR · "Up the Ladder"

*Construction contract for the second floor of the house (docs/10 §4.3, §11 step 3). Honest 1:32 scale, 1 u = 5.4 cm. Coordinates: x east, z south, north is −z, floor at y 0. The house footprint is x ∈ [−139, 139], z ∈ [−111, 111] — the same plate as floor G. Every region, route, encounter, patrol, link and mission ID here is the ID the def (`src/maps/defs/house/u.ts`) must use.*

- **Verb:** the kids' world — smaller rooms, bigger objects, and a hole in the middle of the floor.
- **Story (BOXED):** you came up the stairs. This is where the kids live, which means this is where the *things* live: the ones that outrank you, the ones that watch you, the one house inside the house. Field Marshal Taupe has moved his headquarters into Pip's dollhouse because it is the only building on this floor that is the right size for him. The attic hatch is down. That is the way on.
- **Fun target:** *the gallery* — you walk a landing rail and the whole vaulted living room drops away 46 u under your boots, the floor you crossed last mission laid out below you like a map. Then you turn around and a dollhouse is a fortress with a staircase built to your exact scale.
- **Real footprint:** 15 × 12 m, ceiling 2.5 m (46 u). The living room's vault comes up through this floor as an open well.

---

## 1. Regions

**The defining constraint: the void.** Floor G's living room is vaulted to 96 u, and 96 = U's floor (G's y 50) + U's ceiling (46). So the upper floor has **no floor** over x −59..61, z −31..49 — a 120 × 80 well open to the living room below. Circulation is a **ring** around it: north row, west leg, east leg, south hall, with the balcony closing the loop on the void's south edge. Every room touches the ring; nothing is behind two doors.

```
        N
 ┌───────────────────┬──────────┬──────────────────────┐  z −111
 │  U_jonah          │ U_bath   │   U_parents          │
 │  100 × 80         │ 60 × 80  │   118 × 80           │
 │  loft 30, desk 14 │ tub lake │   bed plateau 10     │
 │  the RC track     │ the fan  │   the closet, dresser│  z −31
 ├───────────────────┴──┬───────┴───────┬──────────────┤
 │  U_pip               │               │  U_stairs    │
 │  80 × 100            │   THE VOID    │  78 × 100    │
 │  THE DOLLHOUSE       │  (no floor —  │  stair head  │
 │  tea set, fishbowl   │  the living   │  from G,     │
 │                      │  room, 46 u   │  linen shelf │  z 49
 │                      │  straight     ├──────────────┤
 │                      │  down)        │              │
 │                   ┌──┴───────────────┤              │
 │                   │ U_landing 120×20 │              │  z 69
 ├───────────────────┴──────────────────┴──────────────┤
 │        U_hall  278 × 42   (THE HATCH, linen closet) │
 └─────────────────────────────────────────────────────┘  z 111
 x −139            −59        61                    139
```

| ID | Name | Kind | min → max (x, y, z) | Band | Floor | Summit | Landmarks | Checkpoint |
|---|---|---|---|---|---|---|---|---|
| `U_stairs` | The Stair Head | connector | (61, 0, −31) → (139, 46, 69) | A0–A2 | hardwood | linen shelf 30 | THE STAIRS (down to G), the hall bench | (115, 0, 14) arrival |
| `U_parents` | The Big Room | arena | (21, 0, −111) → (139, 46, −31) | A0–A3 | carpet | bed 10, dresser 15, closet shelf 34 | THE BED, THE CLOSET, the dresser, the confiscated drawer | (80, 0, −60) |
| `U_bath` | The Bathroom | arena | (−39, 0, −111) → (21, 46, −31) | A0–A2 | tile | tub rim 11, vanity 16 | THE TUB, THE FAN, the duck armada | (−9, 0, −60) |
| `U_jonah` | Jonah's Room | arena | (−139, 0, −111) → (−39, 46, −31) | A0–A3 | carpet | desk 14, shelf 26, loft 30 | THE LOFT, THE TRACK, the desk, the console | (−90, 0, −60) |
| `U_pip` | Pip's Room | arena | (−139, 0, −31) → (−59, 46, 69) | A0–A3 | carpet | dollhouse roof 22, shelf 28 | THE DOLLHOUSE, the fishbowl, the tea set, the plush | (−99, 0, 20) |
| `U_landing` | The Landing | overlook | (−59, 0, 49) → (61, 46, 69) | A0–A1 | hardwood | rail 12 | THE RAIL, THE CHUTE DOOR | (0, 0, 60) |
| `U_hall` | The Upstairs Hall | connector | (−139, 0, 69) → (139, 46, 111) | A0–A3 | hardwood, runner | hatch 46 | THE HATCH, the linen closet, the night light | (0, 0, 90) |
| `U_loft` | The Loft | overlook | (−139, 28, −111) → (−99, 46, −79) | A3 | — | — | THE LOFT | — |
| `U_dollhouse` | Inside the Dollhouse | secret | (−124, 0, 4) → (−94, 24, 34) | A0–A3 | — | its attic 18 | TAUPE'S HQ, the dollhouse's dollhouse | — |
| `U_tub` | Inside the Tub | secret | (−34, 0, −106) → (2, 12, −74) | A0–A1 | porcelain | rim 11 | THE TUB | — |
| `U_linen` | The Linen Closet | secret | (100, 0, 74) → (128, 46, 96) | A0–A3 | hardwood | shelves 12 / 24 / 36 | THE HOSE (secret 21 arrives here), the ladder loops | — |
| `U_underbed` | Under the Bed | secret | (40, 0, −100) → (100, 9, −55) | A0 | carpet | — | the shoebox (secret 34) | — |

Bands: A0 floor · A1 bed/tub-rim (9–14) · A2 desk/dresser/vanity (14–30) · A3 loft/closet-shelf/hatch (28–46).

**Region rule.** `U_void` is *not* a region — it is the absence of floor. The runtime needs no new kind: there is simply no ground zone and no ceiling mass over x −59..61, z −31..49. Falling into it drops you to floor G's living room, which is a **different map**; so the void's mouth carries a `hazard` kill-plane at y −6 that respawns you at the landing checkpoint with a line from Olive ("You are on the second floor, Sergeant. The first floor is a separate war."). It must never load G.

## 2. Shell

- **Walls**: exterior 4 u, interior 2.8 u, height 46 everywhere. Same painted drywall as G (`wall` mass: cream 0xf0e8d6, 1.7 u baseboard 0x8a6a48, 1 u crown). The bathroom gets the tile wainscot variant (0xdde6df) to 20 u. **Kids' rooms are painted, not cream**: `U_jonah` a flat blue-grey 0xc8d4dc, `U_pip` a pale butter 0xf4e6c0 — the first floor where the wall colour tells you whose room you are in.
- **Ceilings**: `ceiling` masses at y 46–48 over every region **except the void**. Nothing at all over x −59..61, z −31..49.
- **The void edge**: a `slab` lip 2 u thick runs the void's perimeter at y −2..0 so the floor reads as having a thickness when seen from the living room below. A `rail` prop (posts 12 u, top rail) runs the void's full perimeter except where the landing's opening is: rail along z −31 (x −59..61), along x −59 and x 61 (z −31..49), and along z 49 on the landing side.
- **The stairwell**: a hole in the floor at x 95..139, z 9..18 (matching G's `G_stairtop`), railed on its west and south edges. **Arrival from G**: `L_stairs_G` on floor G spawns you at (115, 0, 10) yaw π — standing at the head of the stairs facing north, the hall behind you, the parents' door ahead.
- **Doors** (openings 15 wide × 34 tall, framed 1 u; upstairs doors are shorter than G's): jonah↔bath at x −39 (wall z −70); bath↔parents at x 21 (wall z −70) — *no*, bathroom doors open to the hall only: **jonah↔pip** at z −31 (wall x −99); **bath→U_stairs** at z −31 (wall x 0) is wrong for a ring — see the corrected door list below.
  - `U_jonah` → `U_pip`: opening at x −99, wall z −31, 15 wide.
  - `U_bath` → `U_stairs`: the bathroom's door is on its **east** wall at z −70, wall x 21, 15 wide, opening into `U_parents`' west end lobby (a 20 u alcove x 21..41, z −111..−31 that belongs to `U_parents`).
  - `U_parents` → `U_stairs`: opening at x 100, wall z −31, 15 wide.
  - `U_pip` → `U_hall`: opening at x −99, wall z 69, 15 wide.
  - `U_stairs` → `U_hall`: open (no wall x 61..139 at z 69).
  - `U_landing` → `U_hall`: open (no wall x −59..61 at z 69) — the landing *is* the hall's south-west shoulder.
  - `U_linen`: bifold door on wall z 74, x 100..128, 28 wide × 34 tall.
- **Windows** (`glass` panes): jonah north x −120..−80, y 18..38; bath north x −25..−10, y 24..40 (frosted — a `glass` variant with a lower opacity and no view); parents north x 60..100, y 18..38; parents east z −90..−50, y 18..38; pip west z −10..30, y 18..38; hall south x −20..20, y 20..40. Sun through the north and west windows, same rig as G but one notch cooler and higher: sun dir (−0.4, 0.85, −0.35).
- **Floors** (`ground` zones): `U_jonah`, `U_pip`, `U_parents` **carpet** (jonah 0x5a6a78, pip 0xd8c0a8, parents 0x8a7a6a); `U_bath` **tile**; `U_stairs`, `U_landing`, `U_hall`, `U_linen` **hardwood**, with a `carpet` runner in the hall x −110..110, z 84..96 (0x6a5a8a — the same runner as G's hall, one floor up, because it is the same roll).
- **The night light**: a `ceiling_light`-class low warm `PointLight` at (0, 6, 100) in `U_hall`, always on, range 40 — the hall is dim and the night light is the only reason you can see the hatch. This floor is **darker than G by design**; the kids' rooms are lit by their windows, the hall by the night light, the landing by the living room's skylight coming up through the void.

## 3. Furniture (kit props with colliders; honest dims in units)

*New props marked ★. Everything else exists in the house kit already.*

| Room | Prop | At (x, y, z) · yaw | Size / notes |
|---|---|---|---|
| jonah | ★`bed_loft` | (−119, 0, −95) · 0 | 74 × 30 × 40. Mattress deck at 30 (`walkableTop`); posts, a ladder of 8 rungs at 3.4 (too tall — the *climb* is the desk route); the space under it is a room (`U_underbed`-like, the handheld, secret 25) |
| jonah | ★`desk_kid` | (−60, 0, −100) · π | 60 × 14 × 26. Top at 14; a keyboard tray at 10; cable holes |
| jonah | ★`pc_beige` | (−70, 14, −104) · π | 20 × 18 × 18. CRT monitor with a **screensaver canvas** (secret 27, winged toasters), a tower, a mouse |
| jonah | ★`console_tv` | (−120, 0, −40) · 0 | a small TV on a low cabinet, a console, and the **controller cable** running desk→loft as a taut line (secret 26, the zipline) |
| jonah | ★`rc_track` | (−90, 0, −60) · 0 | 70 × 3 × 50 oval of orange track, banked; a `walkableTop` rail; the RC car runs it (hazard `H_rc`) |
| jonah | ★`shelf_figures` | (−137, 20, −70) · π/2 | 3 × 26 × 40 wall shelf with **action figures** (secret 28) at 26 |
| jonah | `bookcase` | (−137, 0, −100) · π/2 | the G bookcase, 29 × 37 × 6 — book-stack stairs are the way to the shelf |
| bath | ★`tub` | (−18, 0, −90) · 0 | 34 × 11 × 62. Rim at 11 (`walkableTop`), interior floor at 2, a **tap** at the −z end, a drain; `U_tub` inside |
| bath | ★`vanity` | (12, 0, −105) · π | 30 × 16 × 12 with a basin, a mirror to 34, a tumbler of brushes |
| bath | ★`toilet_full` | (16, 0, −60) · π/2 | the full one (G has the half-bath version); tank top 20 |
| bath | ★`fan_vent` | (−9, 44, −95) · 0 | ceiling exhaust fan, 12 × 2 × 12, blades that turn — `L_fan` was cut by the trim, so this is **flavour + a hazard**, not a link |
| bath | ★`duck_rubber` ×17 | tub rim and floor | the armada (secret 35, `SQ_ducks`); the admiral under the vanity |
| parents | ★`bed_double` | (75, 0, −80) · 0 | 100 × 10 × 74. Plateau at 10; a **bedspread hanging** off the west side is the ramp up (slope 0.7); `U_underbed` beneath |
| parents | ★`dresser` | (130, 0, −60) · −π/2 | 44 × 15 × 12; **three drawers stepped open** as a staircase (risers ≤ 0.34 by the G rule) to the top at 15 |
| parents | ★`closet_hang` | (95, 0, −108) · π | 60 × 46 × 22 bifold closet: a hanging forest of clothes (soft, sway), a shelf at 34, shoeboxes |
| parents | ★`drawer_confiscated` | (130, 15, −60) · −π/2 | the top drawer, pulled out, holding the water gun / cartridge / gum (secret 33) |
| pip | ★`dollhouse` | (−109, 0, 19) · π/2 | 40 × 22 × 34 — **three floors and an attic, with a staircase at our scale**. `walkableTop` roof; the interior is `U_dollhouse`; the attic holds a dollhouse (secret 29) |
| pip | ★`tea_set` | (−80, 0, 50) · 0 | a low table 16 × 8 × 16 with cups; one cup missing (`SQ_tea`) |
| pip | ★`plush_pile` | (−133, 0, 55) · 0 | 40 × 20 × 26 of plush animals — a **hush pocket** (concealment 0.95, density 0) |
| pip | ★`fishbowl` | (−72, 15, −20) · 0 | on a stand; the goldfish **turns to watch you** (secret 30) |
| pip | ★`recorder` | (−120, 0, 44) · 0.4 | the plastic instrument (secret 31 — plays, and Biscuit comes) |
| landing | `rail` | along z 49, x −59..61 | posts 12, top rail — the money shot over the living room |
| landing | ★`chute_door` | (55, 0, 52) · −π/2 | the laundry-chute door in the landing's east return; `L_chute_down` |
| hall | ★`attic_hatch` | (0, 34, 90) · 0 | the ceiling hatch, open, with the **pull-down ladder** deployed: 12 rungs at 4.4 with the kid's shoelace loops knotted between them (the climb; `L_ladder` trigger at y 44) |
| hall | ★`linen_shelves` | (114, 0, 92) · π | 28 × 46 × 20, shelves at 12 / 24 / 36; the **vacuum hose mouth** at 12 (secret 21's arrival from G) |
| hall | `hall_table`, `plant_floor`, `clock_wall`, `photo_frame` ×3 | along z 108 | the family photos climb the hall wall by age |
| stairs | ★`bench_hall` | (70, 0, 40) · π/2 | a window bench, top at 12 |

## 4. Routes (P1 walk gate)

Every climb obeys the **G rule**: a kid-logic climb is a ramp you *walk* (risers ≤ 0.34, stepped colliders, slope ≤ 0.77). The two "hard" climbs on this floor that ask for jumps are the **dresser drawers** and the **attic ladder's loops**.

| ID | Class | Points | What it proves |
|---|---|---|---|
| `RT_arrival` | main | (115,0,14) → (100,0,40) → (70,0,60) → (0,0,80) → (0,0,100) | stair head to the hatch, the mission-1 spine |
| `RT_landing` | main | (55,0,60) → (0,0,60) → (−50,0,60) → (−70,0,60) | the balcony rail, west along the void |
| `RT_parents` | main | (100,0,−20) → (100,0,−50) → (120,0,−60) → (130,7,−60) → (130,15,−60) → (110,15,−70) | door, floor, dresser drawers, the top |
| `RT_bed` | climb | (100,0,−80) → (30,0,−80) → (24,5,−80) → (24,10,−80) → (60,10,−80) | the bedspread ramp onto the bed plateau |
| `RT_bath` | main | (30,0,−60) → (16,0,−70) → (0,0,−80) → (−16,5.5,−82) → (−18,11,−86) | the bath mat and the towel onto the tub rim |
| `RT_jonah` | main | (−45,0,−60) → (−60,0,−85) → (−60,7,−98) → (−60,14,−100) → (−90,14,−100) | the chair-and-binder ramp onto the desk |
| `RT_loft` | climb | (−90,14,−100) → (−119,14,−100) → (−119,22,−97) → (−119,30,−95) | desk → shelf → loft deck |
| `RT_pip` | main | (−99,0,−20) → (−99,0,10) → (−109,0,4) → (−109,11,19) → (−109,22,19) | into the dollhouse and up its own stairs to the roof |
| `RT_hall` | main | (−130,0,90) → (−60,0,90) → (0,0,90) → (60,0,90) → (130,0,90) | the length of the hall |
| `RT_hatch` | setpiece | (0,0,90) → (0,20,90) → (0,44,90) | the ladder loops to the hatch |
| `RT_linen` | climb | (114,0,80) → (114,0,90) → (114,12,90) → (114,24,90) → (114,36,90) | the linen shelves (and the hose's arrival) |

## 5. Encounters, patrols, pockets

| ID | Template | Region | Activation | Units |
|---|---|---|---|---|
| `E_landing` | PICKET_LINE | `U_landing` | region-enter | 2 based on the rail, 1 **sniper** at the far end — the mission-1 opening pressure, shooting along the balcony |
| `E_hall` | PICKET_LINE | `U_hall` | objective `cross_landing` | 3 trooper, 1 officer between you and the hatch |
| `E_desk` | GARRISON | `U_jonah` | region-enter | 3 on the desk plateau, 1 sniper on the shelf; the monitor is their wall |
| `E_dollhouse` | HQ | `U_pip` | objective `reach_dollhouse` | 4 inside the dollhouse (one per floor + the attic), 2 on the roof, an **officer** in the parlour — the room-by-room fight |
| `E_tub` | GARRISON | `U_bath` | region-enter | 3 on the tub rim, 1 flamer by the vanity |
| `E_parents` | PATROL_MEET | `U_parents` | region-enter | 2 crossing the bed plateau |
| `PT_hall` | patrol | — | — | 3 troopers, hall east ↔ west, pausing at the hatch |
| `PT_ring` | patrol | — | — | 2 troopers walking the **whole ring** around the void — the floor's signature patrol; you hear them before you see them |
| `PT_jonah` | patrol | — | — | 2 on the RC track's infield |
| pockets | `U_pip` plush pile, `U_parents` closet floor, `U_jonah` under the loft, `U_hall` linen closet | chance 0.5, cooldown 45 | | |

## 6. Hazards

| ID | Kind | Where | Behaviour |
|---|---|---|---|
| `H_rc` | sweep | `U_jonah` track | The RC car runs the oval on a 9 s period: a telegraphed whine 1.2 s ahead, then 40 u/s of plastic. Knocks down, does not kill. `SQ_race` turns it friendly. |
| `H_tap` | soak | `U_bath` tub | The tap drips, then runs when `E_tub` activates: the tub floor becomes water, rising 4 u over 20 s. Climb the rim or swim. |
| `H_cat` | one-shot | `U_hall` | **Duchess** asleep on the runner is a hush pocket (concealment 0.9). Wake her — noise over 55, or crossing her at a sprint — and she crosses the hall once, catastrophically. `hazards.fire('H_cat')`. |
| `H_fan` | period 0 | `U_bath` ceiling | The exhaust fan starts with the tap; its draught pulls light props (and grenades) off the rim. Flavour. |

## 7. Kit manifest

**Reused from the house kit**: `bookcase`, `rail`, `hall_table`, `plant_floor`, `clock_wall`, `photo_frame`, `door_closed`, `coat_hooks`, `laundry_basket`, `note_paper`, `drawing_taped`, `sock`, `shoe_pair`, `book_hard`, `book_paper`, `box_shoe`, `magazine_stack`, `teddy_bear`, `toy_blocks`, `board_game`, `lava_lamp`, `toy_dino`, `outlet`, `light_switch`, `floor_register`, `curtain`, `ceiling_light`, `stack_stairs`, `ramp_plank`, `rope_knots`.

**New (★, `src/maps/kit/house.ts` or a new `upstairs.ts`)**: `bed_loft`, `bed_double`, `desk_kid`, `pc_beige`, `console_tv`, `rc_track`, `shelf_figures`, `dresser`, `drawer_confiscated`, `closet_hang`, `dollhouse`, `tea_set`, `plush_pile`, `fishbowl`, `recorder`, `tub`, `vanity`, `toilet_full`, `fan_vent`, `attic_hatch`, `linen_shelves`, `chute_door`, `bench_hall`, `handheld`, `fortune_teller`, `night_light`.

**The dollhouse is the floor's showpiece prop** and deserves its own build: three storeys, a hinged front that stands open, a staircase whose risers are ~1 u (our scale — the one staircase in the house a soldier can simply *walk up*), furniture inside at doll scale (which is giant-doll, small-house: a doll chair is a soldier's armchair), and an attic containing a second, smaller dollhouse (secret 29). It is `U_pip`'s landmark, `E_dollhouse`'s arena, and U2's objective.

## 8. Pickups, secrets, side quests

- **Marbles (5)**: under the loft; in the tub's soap dish; in the dollhouse attic; on the closet shelf; in the hall register (visible through the grate, reachable from the linen closet).
- **Secrets (docs/11, all approved)**: 25 handheld under the loft · 26 the controller-cable zipline · 27 the screensaver · 28 the action figures · 29 the dollhouse's dollhouse · 30 the goldfish that watches · 31 the recorder (Biscuit comes) · 32 the fortune teller · 33 the confiscated drawer · 34 the shoebox and the 1962 Green with Moss's face · 35 the duck armada · 36 the bath-crayon "NO TANS" · 37 the chute jump. **Secret 21's destination** (G's vacuum hose) arrives at `U_linen` — build the hose mouth there and make G's `warp_vacuum` point at it once this floor exists.
- **Side quests**: `SQ_race` (U_jonah, beat the Tan driver on the RC track → a bazooka crate), `SQ_tea` (U_pip, fetch the missing cup from the parents' room → the plush piles become safe houses), `SQ_ducks` (U_bath, gather the armada → rafts on the tub).

## 9. Mission FSM

**U1 — Up the Ladder** (gates A). Arrival (115, 0, 10) facing north. Briefing: Olive on the landing, the snipers, and the hatch the kid left open.

| # | Objective | Kind | Target | Text | Radio beat |
|---|---|---|---|---|---|
| 1 | `cross_landing` | reach | `U_landing` west end | Cross the landing | "Rail's the only way west and they know it. Keep low, keep moving." |
| 2 | `clear_hall` | clear | `E_hall` | Clear the hall | "That's the hall. The hatch is over your head and they're standing under it." |
| 3 | `find_loops` | use | `use_loops` (in `U_linen`) | Find the ladder's shoelace loops | "Kid tied loops in a shoelace to climb it. They're in the linen closet, third shelf." |
| 4 | `rig_ladder` | use | `use_ladder` (requires `loops`) | Rig the ladder | "Tie them on. Twelve rungs. Then it's up." |
| 5 | `climb_hatch` | reach | `U_hatchtop` | Climb to the attic | "Attic, Sergeant. Whatever he's got left is up there." |

Completing `u1` opens `L_ladder` (`foundBy: 'u1'`, matching the G convention that links unlock on **mission ids**, which `WorldState` persists).

**U2 — Dollhouse Rules** (flavour). Briefing: Olive on the HQ, and on the fact that it has a doorbell.

| # | Objective | Kind | Target | Text |
|---|---|---|---|---|
| 1 | `reach_dollhouse` | discover | `U_pip` | Find the dollhouse |
| 2 | `take_house` | clear | `E_dollhouse` | Take the dollhouse, room by room |
| 3 | `hold_house` | wait | 25 s in `U_dollhouse` | Hold it against the counter-attack |
| 4 | `the_navy` | pickup | `duck_admiral` | Then the bathtub navy |

## 10. QA deltas (06 §8)

- **Conventions**: identical to G — camera yaw π faces north (−z); a prop at yaw 0 faces its local −z; `yawToward(a,b) = atan2(−dx, −dz)`; free-cam positive pitch looks down.
- **The void is the new hazard class to test.** The walk gate must prove (a) no route point sits over the void, (b) the rail cannot be walked through, (c) the kill-plane respawns rather than loads G.
- **Darkness.** This floor is deliberately dimmer. The tour tool needs a `u-top` spot list and the gate should assert the night light and the window shafts actually light the hall (a black screenshot is a failure, not a style).
- **Turbo** (`?test&turbo`) and the free-cam photo tour work unchanged.
- **Gates to add**: `tools/walk.mjs u` (11 routes above) and `tools/house-u.mjs` (U1 flow, U2 flow, the void kill-plane, the dollhouse interior, secrets 29/30/35).

## 11. As built — deviations from the contract

*(Filled during P1–P5, like floor G's §11. Empty until construction starts.)*
