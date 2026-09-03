# 10 — The House Atlas

*The world plan. One house, four floors and a yard, at honest 1:32 scale, with two main missions per floor and side quests in the rooms. Written after the PM's second hands-on (2026-09-03) and their answers to the fourteen planning questions. This document is the contract for what the world IS; per-floor blueprints (P0 of docs/06 §7) follow it.*

**What it supersedes.** The "Campaign Eight" of docs/03 and the eight blueprints in `docs/blueprints/` are retired as *world structure*: those eight places now live inside the house as rooms and zones, not as separate maps. Everything else in 03 still binds (the scale fantasy, the seven laws, encounter grammar). The M2 Backyard slice is a prototype; the yard gets rebuilt at the new scale as the fifth zone. Old builds are archived in `archive/builds/` (see §12).

---

## 1. Decisions of record (PM, 2026-09-03)

| # | Decision |
|---|---|
| 1 | Each floor is one continuous world. Changing floors is a loading moment. |
| 2 | **Honest scale**, and generous: big floors divided into big rooms. |
| 3 | The outside is a fifth zone. The Backyard slice is rebuilt into it. Old builds are archived on GitHub as we go. |
| 4 | The family: two kids, two parents, a cat, a dog. |
| 5 | Rooms per floor as proposed (§4). |
| 6 | Floor routes are **free travel once found**. You physically climb, far in most cases, and hit a loading trigger at a height or an area. |
| 7 | The house is a **persistent hub**; missions unlock rooms and floors. |
| 8 | **Two main missions per floor**: the first gates the next floor, the second is flavor and content. Side quests sprinkled through the rooms. |
| 9 | Tans **patrol between landmarks**, keep **small defenses at landmarks**, plus **random pockets**. Plenty of setting-appropriate decoration. Secrets drawn from the era and from games, **all reviewed by the PM** (docs/11). Learn why people love *Chibi-Robo* and *George Shrinks* (§2). |
| 10 | Tans **re-occupy** between missions and whenever a floor loads. |
| 11 | No day/night cycle. **No humans for now.** (Pets stay: they are weather.) |
| 12 | **New story.** The battery-drawer war is dropped; the PM wants something different. Three pitches in §10; the atlas is written to work with any of them. |
| 13 | This document (not a "bible"). Blueprints per floor follow it. |
| 14 | Target 60 fps eventually, but **performance is not a concern at this stage**. Honest scale first. |
| 15 | **Story: BOXED** (§10, Pitch 1). Decided 2026-09-03. |
| 16 | **Secrets: all fifty approved** as written in docs/11. |
| 17 | **The yard gets one main mission plus side quests**, not two mains. |
| 18 | **Build the house first**, and build it well; the yard rebuild comes after the four floors. |

---

## 2. Why people love small-in-a-big-house games — and what we take

The forums proper are behind this sandbox's egress proxy, so this is built from published reviews, retrospectives and fan wikis surfaced by search, plus what the studio already knows about these works. The pattern across *Chibi-Robo!* (2005), *George Shrinks* (2000–03), *Tinykin* (2022) and *Toy Story 2: Buzz Lightyear to the Rescue* (1999) is consistent:

1. **The house is a character with a life you weren't invited to.** Chibi-Robo's Sanderson house is beloved because the family is *specific*: a daughter who thinks she's a frog, a father in the doghouse for wasting money, toys with subplots (love letters that keep getting lost). People remember the household's problems more than the platforming. → **Every room carries a family story you can read from the props alone**: a note on the fridge, a height chart with dates, a drawing taped crooked, a grounded kid's confiscated console on the parents' dresser.
2. **Everyday objects re-purposed, sincerely.** George Shrinks glides on paper-clip coat hangers, catapults pancakes with a spatula, drives a car built with his dad. Tinykin builds apartment blocks from food tins and furniture from thumbtacks. The joy is watching a *practical* imagination solve the house. → **Kid logic is our architecture**: book ramps on the stairs, a shoelace rappel down the chute, a marble run as a slide, a toaster as a launch pad.
3. **Scale is wonder only if you can eventually stand on top of it.** Reviewers of Tinykin describe walking into a kitchen with cabinets "impossibly high" and standing on them within the hour. Verticality is the payoff of scale, not just the obstacle. → **Every room has a summit and a way to it**, and the first-floor-to-attic climb is the campaign's spine.
4. **Small stakes, played straight.** Chibi-Robo earns Happy Points for chores; George's afternoon errands are epics. Sincerity about small things is the tone. → **Side quests are household-scale kindnesses and mischief**: return the lost socks, free the toy stuck under the radiator, win the RC race, sabotage the Tan garrison's cereal supply.
5. **A society per room.** Tinykin gives each room its own bug culture (a cardboard cathedral in the den, a silverfish nightclub in the bathroom). → **Each room has a resident faction and a mood**: the dollhouse dolls, the board-game pieces in the basement, the bathtub duck armada, Jonah's action figures who think they outrank us.
6. **Sound bound to action.** Chibi-Robo's footsteps play melody notes. Our plastic clacks are that already. → **A motif per room** (fridge hum, dryer tumble, the attic's wind) so you know where you are with your eyes closed.
7. **Familiar enough to imagine your own house.** Toy Story 2 players reported imagining their own homes as levels. → **The floor plan must read as a real, ordinary house** first, so the flicker between "cliff" and "counter" (docs/01) never stops.
8. **Nostalgia is texture, not brands.** Bright 90s colors, a beige computer, a VHS shelf, a corded phone; no logos (docs/01 IP boundaries). Invented brands sell the house (docs/09).

The **Decoration With Heart** standard in §8 turns these into placement rules a builder can check.

---

## 3. The house at a glance

**Fiction frame (story-independent).** A suburban house, roughly 1996. Two kids: **Jonah** (10, upstairs bedroom with the computer, the RC cars, the action figures) and **Pip** (6, short for Philippa, the dollhouse, the tea set, the plush menagerie). Two parents, never seen or heard clearly (docs/01: Giants are weather; for now they are simply *out*). **Biscuit** the dog (a hazard that thunders through, already built in the yard) and **Duchess** the cat (a hush pocket wherever she sleeps; a slow-moving catastrophe when she wakes). The Greens are Jonah's, handed down from an uncle: molded in '62, bagged and re-bagged. The Tans came in the same bag.

**Zones.**

| Zone | Real footprint | Units (x × z) | Ceiling / sky | Role |
|---|---|---|---|---|
| **B — Basement** | 15 × 12 m, partly finished | 278 × 222 | 2.2 m = 41 u | Campaign start. Laundry, furnace, workbench, storage, rec corner. |
| **G — Ground floor** | 15 × 12 m | 278 × 222 | 2.7 m = 50 u; living room vaulted to 5.2 m = 96 u | The hub. Kitchen, dining, living, hall, half bath, mudroom, garage door, dog door to the yard. |
| **U — Upper floor** | 15 × 12 m | 278 × 222 | 2.5 m = 46 u | The kids' world. Two bedrooms, parents' room, full bath, landing over the living room. |
| **A — Attic** | 15 × 12 m under a 35° roof | 278 × 222 usable ≈ 240 × 160 | ridge 3.2 m = 59 u, knee walls 1.2 m = 22 u | Finale. Boxes, old toys, holiday decorations, the window. |
| **Y — Yard** | ~22 × 30 m lot around the house | 407 × 555 | open sky | Fifth zone from the dog door and the garage: rebuilt backyard, front yard, driveway, garage, porch. |

**Travel times** (walk 4 u/s, sprint 7 u/s): a floor's long axis (278 u) is 40 s walking, 70 s edge to edge on the diagonal; the yard is longer. The Backyard slice was 60 × 80 u; a single floor is roughly 12× its area.

**Vertical facts** (1 u = 5.4 cm): a stair riser is 18 cm = **3.3 u** (over three soldier heights; a soldier jumps 1.35 u). A kitchen counter is 90 cm = **17 u**. A tabletop is 75 cm = 14 u. A bed is 55 cm = 10 u. A door handle is 100 cm = 18.5 u. A full floor change is 2.7–2.9 m = **50–54 u of climb** — "far up in most cases", as decided.

---

## 4. Floor by floor

Plans are north-up; `#` walls, `=` doors/openings, `~` windows. Room tags are the region IDs the blueprints must use (06 §3 traceability). Dimensions in units.

### 4.1 Basement (B) — "where things get put"

```
        N
 ##################################################~~~~~######
 #  B_furnace  #     B_storage (shelves, boxes)   #  B_well  #
 #  furnace,   =                                  #  window  #
 #  water htr  #   [Greens' box, shelf 3]         #  well    #
 #########=#####===========================#########=########
 #                                         #                #
 #        B_rec  (old couch, TV,           #   B_laundry    #
 #        board games, train set)          #  washer/dryer  #
 #                                         #  CHUTE MOUTH   #
 #                                         #  sock graveyard#
 ####=###########################===########=################
 #  B_bench (workbench, pegboard,     #    B_stairs           #
 #  jars of screws, the vise)         #  (marble-run steps)   #
 #  TAN ARMORY                        #                       #
 #############################################################
        S  (crawlspace B_crawl runs the whole south wall, 0.8 m high = 15 u)
```

| Region | Size (u) | Kind | What it is for | Landmarks | Tan presence |
|---|---|---|---|---|---|
| `B_storage` | 150 × 80 | arena | Start. The Greens' box on shelf 3 (3 shelves = 3 tiers, 11 u each). Cardboard canyon. | THE BOX, the shelf "cliffs", a dress form | pockets in boxes (AMBUSH_POCKET), one patrol |
| `B_laundry` | 70 × 80 | arena | The chute mouth (the way UP), the sock graveyard behind the dryer, the dryer's warm tumble. | THE CHUTE, dryer, detergent tower | landmark defense at the chute |
| `B_rec` | 150 × 100 | arena | Old couch (a mesa), TV on a cart, board games (a fortress of boxes), a model train loop (fast travel). | THE TRAIN, the couch, the TV | patrol on the train loop, pieces faction (neutral) |
| `B_bench` | 130 × 60 | arena | Tan armory: the workbench (docs/03 map 7 lives here). Jars, vise, pegboard cliffs. | THE VISE, the pegboard | garrison, officer |
| `B_furnace` | 60 × 80 | connector | Furnace and water heater: heat, hum, the duct mouth (second way up). | THE DUCT | small defense |
| `B_stairs` | 60 × 60 | connector | Basement stairs. The kids built a marble run down them: our stair ramp. | the run | picket at the top |
| `B_well` | 30 × 40 | secret | Window well to the yard's side. A third way out, found late. | the window | — |
| `B_crawl` | 278 × 20, 15 u high | crawl | Crawlspace along the south wall. Secret transit, dust, one very large spider (neutral hazard). | — | — |

### 4.2 Ground floor (G) — "the hub"

```
        N  (back of the house; the yard)
 ~~~~~~~~~~~~~~~~~~~~~~~~####==(dog door)==~~~~~~~~~~~~~~~~~~~
 #                      #                  #                 #
 #     G_kitchen        #   G_mudroom      #   G_garage      #
 #  counter L, fridge,  #  boots, leashes  #  (car, tools,   #
 #  pantry, the drawer  =  garage door =====  bikes)         #
 #                      #                  #                 #
 ####======#############====##########==#######################
 #             #                                  #          #
 #  G_dining   #        G_living  (VAULTED 96 u)  #  G_bath  #
 #  table,     =  couch, TV, fireplace, bookcase  #  half    #
 #  chairs,    #  wall to the ceiling, curtains,  ############
 #  chandelier #  balcony landing above (U_landing)#         #
 #             #                                  #  G_hall  #
 #######=#######==================================#  stairs  #
 #                     G_hall  (front door, stairs up, coat  #
 #                     closet, basement door)                #
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~=====(front door)=================
        S  (front yard, porch)
```

| Region | Size (u) | Kind | What it is for | Landmarks | Tan presence |
|---|---|---|---|---|---|
| `G_kitchen` | 90 × 80 | arena | The counter mesa (17 u up), the fridge cliff (31 u), the pantry shelves, **the junk drawer**. Docs/03 map 4 lives here. | THE COUNTER, THE FRIDGE, the toaster | garrison on the counter, patrol on the floor |
| `G_dining` | 80 × 80 | arena | Table plateau (14 u) ringed by chair towers; the chandelier as a sky route. | THE TABLE, the chandelier | pockets under the table |
| `G_living` | 120 × 100 | arena, vaulted | Couch range, TV cabinet, fireplace (a cave), the bookcase wall (the great climb to the upstairs landing), curtains. The room the whole house sees. | THE BOOKCASE, the fireplace, the TV | patrols, garrison at the fireplace |
| `G_hall` | 200 × 40 | connector | Front door, coat closet (vacuum hose: secret warp), the stairs up (marble run continues), the basement door. | THE STAIRS | picket |
| `G_mudroom` | 50 × 60 | connector | Boots (bunkers), leashes, the **dog door** to the yard, the garage door gap. | THE DOG DOOR | — |
| `G_garage` | 100 × 120 | arena | The car (a canyon underneath, a plateau on top), tool wall, bikes, the garage door's light gap. Half indoors, half yard. | THE CAR | garrison, RC vehicles later |
| `G_bath` | 30 × 40 | secret | Half bath. A sink lake. Tiny, dense, one secret. | the sink | — |

### 4.3 Upper floor (U) — "the kids' world"

```
        N
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 #                      #                #                    #
 #    U_jonah           #   U_bath       #    U_parents       #
 #  loft bed, desk+PC,  #  tub LAKE,     #  big bed plateau,  #
 #  RC track, figures,  #  sink, duck    #  dresser, closet   #
 #  the console         #  armada        #  (attic hatch is   #
 #                      #                #   in the hall)     #
 ####=====################==========######=====################
 #                 U_hall  (linen closet, ATTIC HATCH + ladder)#
 #########=######################==============================
 #                 #        U_landing  (balcony over the       #
 #    U_pip        #        living room; rail = 12 u)          #
 #  dollhouse,     #        stairs down, the CHUTE door        #
 #  tea set, plush #                                            #
 #  fishbowl       #                                            #
 ~~~~~~~~~~~~~~~~~~##############################################
        S
```

| Region | Size (u) | Kind | What it is for | Landmarks | Tan presence |
|---|---|---|---|---|---|
| `U_jonah` | 100 × 90 | arena | Loft bed (a fort 30 u up), desk with the beige computer, RC track loop, action-figure faction, the console under the TV. Docs/03 map 6 lives here. | THE LOFT, THE TRACK, the desk | garrison at the desk, RC patrol |
| `U_pip` | 90 × 80 | arena | **The dollhouse** (a house inside the house, Tan HQ candidate), tea set, plush menagerie (neutral, huge), fishbowl, night light. | THE DOLLHOUSE, the fishbowl | HQ garrison, plush hush pockets |
| `U_parents` | 100 × 90 | arena | The big bed (a 10 u plateau the size of a field), dresser cliffs, closet (hanging forest), the confiscated things drawer. | THE BED, the closet | patrol, few pockets |
| `U_bath` | 60 × 70 | arena | The tub as a lake (docs/03 map 5), duck armada, sink, the exhaust fan (a way to the attic). | THE TUB, THE FAN | garrison on the rim |
| `U_hall` | 180 × 40 | connector | Linen closet, **the attic hatch** with its pull-down ladder (kid left it down). | THE HATCH | picket |
| `U_landing` | 120 × 40 | overlook | Balcony over the living room, the rail, stairs down, **the chute door** (express down to B). | THE RAIL, THE CHUTE | picket, sniper |

### 4.4 Attic (A) — "the top of the world"

```
        N            (knee walls 22 u; ridge 59 u down the middle, E–W)
 ####################################~~~~~ window ~~~~~######################
 #  A_west   boxes: HOLIDAY (lights, ornaments), the old TV   A_east        #
 #  insulation drifts (the "snow"), rafters as a canopy road  the dress    #
 #  ==== A_ridge: the beam highway, 59 u up, end to end ====  form, the    #
 #  A_hatch (ladder from U_hall)      A_toys: THE BOX '62,    rocking      #
 #                                    the tin robot, a train   horse, the  #
 #  A_fan: the bathroom fan's duct    A_court: TAUPE'S SEAT    trunk       #
 ###########################################################################
        S
```

| Region | Size (u) | Kind | What it is for | Landmarks | Tan presence |
|---|---|---|---|---|---|
| `A_hatch` | 40 × 40 | connector | Arrival from the ladder. Dust. Quiet. | the hatch | — |
| `A_west` | 100 × 130 | arena | Holiday boxes: a string of lights that works (the bright zone), ornaments (glass hazards), tinsel. | THE LIGHTS | garrison |
| `A_ridge` | 240 × 10, 59 u up | climb | The ridge beam highway: the sky route across the whole attic. | — | sniper nests |
| `A_toys` | 80 × 80 | arena | The old toys: the tin robot, a wooden train, and **THE BOX '62** the Greens came in. Heart. | THE BOX '62 | pockets |
| `A_court` | 100 × 80 | boss arena | The Tan seat of power under the window. Finale. | TAUPE'S SEAT, THE WINDOW | everything |
| `A_east` | 80 × 130 | arena | The dress form, the rocking horse (a moving platform), the trunk. | THE HORSE | patrols |
| `A_fan` | 30 × 30 | secret | Where the bathroom fan duct arrives. | — | — |

### 4.5 Yard (Y) — the fifth zone, rebuilt

The M2 Backyard keeps its ideas (the Green Sea of grass, the gnome, the birdbath, the hose stream, the convoy road) and gets re-laid at honest scale as `Y_back`, with `Y_bed` (flowerbed tiers), `Y_patio`, `Y_sandbox` (docs/03 map 1, the tutorial-turned-raid), `Y_side` (the gutter downspout, docs/03 map 3, and the basement window well), `Y_front` (porch, walk, the mailbox), `Y_drive` (the driveway, the garage's other mouth). Entrances: the dog door (G_mudroom), the garage door gap (G_garage), the basement window well (B_well, late). Picnic table (docs/03 map 8) sits on the patio.

---

## 5. Between floors — routes, climbs, loading

Rule 6: free travel once found; big climbs; the loading transition fires at a height or area trigger. Each floor pair has a **main route** (found in that floor's first mission), a **secret route** (found by exploring), and where it makes sense a **down express**.

| Link | From → To | Kind | The climb | Found how |
|---|---|---|---|---|
| `L_chute_up` | B_laundry → U_landing (passes G) | chute | 54 u + 50 u inside the laundry chute, on a knotted shoelace the Greens rig; rungs are the chute's seams. Loading trigger at 46 u up; you arrive at G's hall closet chute door (a mid-stop) or continue to U. | **B main mission 1** |
| `L_stairs_B` | B_stairs → G_hall | stairs | The kids' marble run on the basement stairs: a ramp track over 14 risers (46 u). Ride a marble down; climb the track up. | found (secret) |
| `L_duct` | B_furnace → G_living floor register → U_hall register | duct | Crawl route inside the heating ducts. Dark, warm, echoing. Two exits. | found (secret); lit by G main 1 |
| `L_stairs_G` | G_hall → U_landing | stairs | The main stairs: marble run continues; lamp cord and banister as alternates. 50 u. | **G main mission 1** |
| `L_bookcase` | G_living → U_landing | climb | The vaulted living room's bookcase wall to the balcony rail: shelves as ledges (11 u each), a curtain rope, 96 u of climb. The campaign's showpiece ascent. | found (hard) |
| `L_dogdoor` | G_mudroom ↔ Y_back | door | Flap; both ways; the dog uses it too (hazard). | **G main mission 2** |
| `L_garage` | G_garage ↔ Y_drive | gap | Under the garage door. | found |
| `L_well` | B_well ↔ Y_side | window | Window well, late shortcut. | found (late) |
| `L_ladder` | U_hall → A_hatch | ladder | The pull-down attic ladder: 12 rungs at 4.4 u, climbable with the kid's shoelace loops; the hatch trigger at 44 u. | **U main mission 1** |
| `L_fan` | U_bath → A_fan | duct | Up the exhaust fan duct: a vertical crawl with the fan blades as a timing hazard. | found (secret) |
| `L_chute_down` | U_landing → B_laundry | express | Jump in. Ten seconds of dark, a thump onto the socks. | once `L_chute_up` is found |

**Loading transition.** A trigger volume at each link's far end. Entering it fades to the **toy bin card** (stencil label of the destination floor, a line of Olive), tears the current floor down, builds the target floor's `MapDef`, places you at the link's arrival spawn, applies the re-occupation rule (§7), fades in. Under 2 s on the target machine. Height triggers (e.g., 46 u up the chute) work exactly like area triggers: they are volumes.

**Persistence across loads** (`WorldState`, saved to `localStorage`): found links, completed missions and side quests, found secrets, marbles, sabotaged things, the checkpoint you last touched. **Not persisted:** Tan bodies, patrol positions, pocket rolls (rule 10).

---

## 6. Missions — two per floor, spaced out

The first mission of each floor **gates the next floor**: it ends by finding and opening the floor's main route up. The second is **flavor and content**: it uses the whole floor, adds the floor's set piece, and can be played after moving on. Objectives are placed at opposite ends of the floor so travel is part of the mission (the PM's note: the Backyard could be fully explored before the first objective). Names below are structural; the story pitch chosen in §10 re-skins the text.

| Floor | Main 1 (gate) | Spread | Main 2 (flavor) | Set piece |
|---|---|---|---|---|
| **B** | *Out of the Box*: wake in THE BOX on shelf 3, get down the shelf cliffs, cross the rec room, reach the laundry, rig the chute. | storage → rec → laundry (≈ 260 u) | *The Armory*: raid the Tan workbench, steal the vise key, free Doc Pickle from the jar of screws. | The train loop: ride it under fire; the dryer starts. |
| **G** | *The Long Hall*: arrive from the chute, cross the kitchen counter to the junk drawer for the string, cross the living room, open the stairs (marble run). | kitchen → dining → living → hall (≈ 400 u) | *Open House*: the dog door. Find Biscuit's route, survive his passes, get the flap open. Unlocks Y. | Biscuit crossing the living room; the fridge door opening onto the counter. |
| **Y** | *The Green Sea* rebuilt: the gnome, Fern, the convoy, the leaf. | back → bed → side (≈ 500 u) | (none: decision 17) side quests only — the sandbox raid becomes `SQ_sandbox`, the gutter run `SQ_gutter`. | Sprinkler cycle. |
| **U** | *Up the Ladder*: cross the landing under sniper fire, through the parents' room, find the attic ladder's loops in the linen closet. | landing → parents → hall (≈ 350 u) | *Dollhouse Rules*: take the dollhouse (the Tan HQ on this floor) and hold it; then the bathtub navy. | The dollhouse room-by-room fight; the tub with a running tap. |
| **A** | *The Top of the World*: cross the attic on the ridge beam, through the holiday lights, to THE BOX '62. | hatch → west → ridge → toys (≈ 280 u) | *Taupe's Court*: the finale under the window. | Rocking horse platform; the lights as a hazard; the window's light. |

**Side quests** (one to three per room; each a small loop with a clear giver, a walk, and a return; first batch):

- `SQ_socks` (B_laundry): return five lost socks from the sock graveyard to the basket. Reward: a route hint.
- `SQ_train` (B_rec): fix the derailed train (three pieces of track around the room). Reward: the loop runs (fast travel).
- `SQ_pieces` (B_rec): the board-game pieces want their die back from a Tan pocket. Reward: cover placements.
- `SQ_toast` (G_kitchen): launch off the toaster to reach the top of the fridge. Reward: a marble and a view.
- `SQ_photo` (G_living): straighten the family photo the Tans knocked crooked. Reward: Olive story line (heart).
- `SQ_race` (U_jonah): win the RC track race against a Tan driver. Reward: a bazooka crate.
- `SQ_tea` (U_pip): deliver the tea set's missing cup from the parents' room. Reward: the plush hush pockets become safe houses.
- `SQ_ducks` (U_bath): gather the duck admiral's fleet from the sink. Reward: rafts on the tub.
- `SQ_lights` (A_west): plug in the string of lights. Reward: the west attic is lit; snipers exposed.

---

## 7. Population — patrols, defenses, pockets, re-occupation

Three layers, all data (06 §4 extended), tuned per floor in the blueprint:

**Patrols** move between landmarks on named routes: `{ id, route: landmarkId[], comp, speed, pause }`. Two to four per floor. They use the awareness ladder as it stands (Update 3): sentries scan; walking patrols look where they walk. Killing a patrol leaves a gap until the next load.

**Landmark defenses** are small garrisons keyed to landmarks: `landmarks[].defense = { template, comp }` using the 06 §4 templates (`PICKET_LINE` at a stair top, `HIGH_GROUND_TAX` on a shelf, `LANE_AND_FLANK` on a counter). Three to six per floor; the two biggest are the mission set pieces.

**Random pockets** come from a per-floor spawn table: `pockets = { tables: [{ comp, weight }], chance, cooldown }`. On region entry, roll `chance` (25–35%) for an `AMBUSH_POCKET` from a concealment spot tagged in the room (boxes, under the couch, behind the flour tin). The re-roll keeps repeat walks lively.

**Re-occupation rule** (decision 10): on mission start and on every floor load, clear all Tans, respawn garrisons and patrols, re-roll pockets. Persistent: everything in `WorldState` (§5). Landmark defenses can be reduced permanently by a side quest (e.g., `SQ_lights`) as a reward, never by attrition.

**Budgets.** The 06 rule of ≤ 12 active Tans lifts to **≤ 18 active** with dormant garrisons beyond ~60 u; a floor holds 40–60 Tans total. Density target: one meaningful contact per 60–90 s of travel, quiet stretches between (docs/09 §1.4: clusters, not carpets).

**Neutral factions** (not Tans, not ours): the board-game pieces (B), the plush menagerie (U_pip), the dollhouse dolls, the duck armada, Jonah's action figures, the tin robot (A). They give side quests, hold hush pockets, and are the house's "society per room" (§2.5). They never fight for us (escort rules stay banned); they change the room.

---

## 8. Decoration With Heart — the standard

Every room passes three layers before P4 dressing is called done:

1. **Shell** (architecture): walls, floor material zone, ceiling, windows, doors, trim, light fixtures. The room must read as its real self from the doorway.
2. **Furniture** (the map): the big masses that make the play space: counter, table, couch, bed, shelves. These are the cliffs and mesas; placed for routes and cover first (docs/06 §2).
3. **Life** (the heart): **at least twelve "life props" per room** from this checklist, each a specific claim about the family:
   - a note or list (fridge, corkboard, a Post-it on the monitor)
   - a photo or a drawing (crooked, taped, framed)
   - something a kid left out mid-play (a half-built block tower, a coloring book open)
   - a pet trace (a chewed toy, a hair drift, a bowl, a scratched corner)
   - a chore in progress (laundry half-folded, dishes in the rack, a vacuum parked)
   - a plant (alive or not)
   - a calendar, a clock, a thermostat, a light switch at the right height
   - clutter with a story (a jar of buttons, keys on a hook, a Band-Aid on a table leg)
   - the era: a corded phone, a VCR clock blinking, a beige computer, a boombox
   - a marked height: the height chart, the scuff on the wall at wheel height, the sticker on the bunk
   - a secret candidate (docs/11), at most two per room
   - a room motif sound source (the fridge, the dryer, the fish tank filter)

Invented brands only (docs/01). Props at honest dimensions (docs/07). If a room has fewer than twelve life props, it is not done.

---

## 9. Data model and runtime deltas (docs/06 §3 extension)

- **`HouseDef`**: `{ floors: MapDef[], links: FloorLink[], story: StoryDef }`. Each floor stays a `MapDef` (one module each: `b.ts`, `g.ts`, `u.ts`, `a.ts`, `y.ts`).
- **`FloorLink`**: `{ id, kind: 'chute'|'stairs'|'duct'|'ladder'|'door'|'gap'|'window'|'express', from: { floor, volume }, to: { floor, spawn, yaw }, found: false, foundBy?: missionId | 'explore' }`.
- **`PatrolDef`**, **`landmarks[].defense`**, **`PocketTable`** as in §7. **`SideQuestDef`**: `{ id, room, giver: factionId | landmarkId, steps: Step[], reward }`. **`SecretDef`**: `{ id, room, kind: 'gag'|'area'|'collectible'|'interaction', at }` (docs/11).
- **Runtime**: `FloorLoader` (tear down / build with a fade card), `WorldState` (persistent, `localStorage`), `PatrolAI` (waypoint follow on top of the existing enemy FSM), `PocketRoller`, `SideQuests` (the mission FSM generalized to parallel chains), `Factions` (neutral NPC groups with barks and hush volumes).
- **Kit growth**: the house needs ~60 new props over the current ~45 (docs/07): appliances, furniture, the dollhouse, the train, the attic set. Budget them per floor blueprint (≤ 12 new heroes per floor).
- **Tech reality at honest scale** (decision 14 says don't worry yet; noting for later): a floor is ~600–1200 prop instances; repeated props (books, blocks, tiles) go instanced; one shadow-casting sun per floor becomes per-room lights with a baked-ish hemisphere; camera far plane 400 covers a floor diagonal (355 u); indoor fog off.

---

## 10. Story — three pitches (PM picks; the atlas works with any)

The battery-drawer war is dropped (decision 12). All three keep the cast (docs/01) and the Analog-vs-Powered *flavor* only as texture, not plot.

**Pitch 1 — BOXED** *(CHOSEN, 2026-09-03).* Saturday morning the Greens wake in a taped box on a basement shelf, labeled for the church rummage sale next weekend. Jonah is ten; he didn't fight it. Mission: get back upstairs and back into the kids' lives before the box goes out the door. The Tans were boxed too, and Field Marshal Taupe has drawn the opposite conclusion: if the family is done with toys, the house belongs to the toys, and he intends to run it from the attic. Each floor is a rung back toward the kids' rooms; the flavor missions are the Greens making themselves *worth keeping* (fixing the train, straightening the photo, winning Pip's tea party). The finale in the attic is at THE BOX '62, the Greens' own first box, which Taupe has made his throne. Heart, camp, a ticking week, and a reason to climb. Ending beat: Pip finds one Green on her pillow Monday morning.

**Pitch 2 — LOST AND FOUND.** Things go missing in this house: socks, the remote, Pip's favorite Green medic (Doc Pickle), a house key. Taupe is hoarding the house's lost things in the attic to hold the family "hostage" in the only way a toy can. The campaign is a recovery up through the floors; every side quest returns something to where it belongs; the lost-and-found box in the attic is the finale. Simple, very Chibi-Robo, slightly less personal.

**Pitch 3 — THE HANDOFF.** Jonah hands the Greens down to Pip. The Greens are fine with it (orders are orders). The Tans refuse to serve a six-year-old and secede to the attic, taking Pip's dollhouse as a forward base. Sibling comedy: Pip's rules (tea at four, everyone gets a name) vs. Jonah's (the war is serious). Missions alternate between the two kids' worlds. Strong character comedy; the floors matter a little less.

**Tan motive in all three:** Taupe believes the house is a kingdom nobody is using. Pets are weather; the kids are gods who are out.

---

## 11. Production order

1. **Story pick** (PM) and the secrets review (docs/11). One week of blueprints follows.
2. **Ground floor first**, as the world's proof: it is the hub, the largest, the most recognizable, and it carries the vaulted living room climb and the dog door to the yard. Its blueprint `docs/blueprints/floor-G.md` transcribes this atlas; P1 walk gate with the new `walk.mjs` at honest scale.
3. **Basement** (campaign start, contained, the chute), then **Upper**, then **Attic**, then the **Yard rebuild** (it reuses the most).
4. Systems in parallel with G: `FloorLoader` + `WorldState`, patrols, pockets, side quests, factions.
5. Each floor: P0 blueprint → P1 greybox + walk gate → P2 population → P3 mission → P4 Decoration With Heart (§8 checked) → P5 audio → P6 playtest.

Old builds: every shipped `plastic-platoon.html` is copied to `archive/builds/YYYY-MM-DD-<name>.html` and the commit tagged `build/YYYY-MM-DD-<name>` (§12). The M2 slice as the PM played it is `archive/builds/2026-09-02-backyard-slice-updates-1-4.html`.

## 12. Open PM decisions

Resolved 2026-09-03: story (BOXED), secrets (all fifty), the yard (one main + side quests), build order (house first). Names Jonah, Pip, Biscuit, Duchess stand until changed.

1. Neutral factions: how much do they talk? (Barks only, or short dialogue cards.)
2. Difficulty philosophy (still open from docs/08).
3. Title (still open).
