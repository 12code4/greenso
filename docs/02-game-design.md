# 02 — Game Design

## Core loop

**Minute-to-minute:** move through household terrain → read it tactically (cover, height, hazards) → fight Tan squads with a small, characterful arsenal → loot pickups (ammo, glue, batteries) → hit mission beats (rescue / sabotage / hold).

**Mission-to-mission:** briefing from Lt. Olive (toy walkie-talkie, chalk-drawn tactical map) → play one household space → medal tally (time, POWs, marbles found) → unlock the next space + usually one new weapon or enemy → back to the HQ toy bin.

**The promise every loop must keep:** the *terrain* is the star. An encounter that would be boring on flat ground becomes the whole game when it's fought across a dish rack.

## Perspective & camera

**Locked third-person, over-the-shoulder-ish but pulled back** — closer to *Sarge's Heroes*/*Ratchet & Clank* framing than modern mil-shooter tight-shoulder. Reasons:

- The toy is the star; the player must see the molded plastic, the base-less articulated run, the melt damage on their own character.
- Scale readability: you need your own 5 cm body in frame as the yardstick that makes the fork next to you enormous.

Camera spec:

- Follow cam: ~1.5 units behind, ~0.6 above (units: 1 unit = 1 soldier-height), spring-damped, collision-resolved against world (whisker raycasts; never clip inside a cereal box).
- Aim mode (hold aim): shoulder-offset, FOV tightens, reticle live, sensitivity scaled.
- Generous soft aim assist on desktop, stronger on gamepad: target magnetism on plastic torsos, never full lock. *Sarge's Heroes'* worst sin was fighting its own camera — M0's exit test is that camera + aim feel modern.

## Controls (desktop-first, gamepad parity at M3)

| Verb | Key | Notes |
|---|---|---|
| Move / sprint | WASD / Shift | Sprint drains no meter; toy soldiers do not tire, they *fall over* |
| Jump / vault | Space | Auto-vault low lips (book edges, tile grout ridges) |
| Aim / fire | RMB / LMB | Hold-to-aim |
| Weapon wheel / next | Q / scroll | Wheel slows time to 20% (a kid pausing to choose) |
| Grenade | G | Cooked by hold, arc preview |
| Interact / rescue | E | Context: free POWs, plant charges, mount set pieces |
| Crouch | Ctrl | Slips under couch skirts, oven drawers |
| Dive | Ctrl in sprint | Committal dodge with plastic *clack* on landing |

No cover-snap system — cover is positional (the world is dense with it) and crouch-height. Keep the sim simple; the maps do the work.

## Health: the Melt Meter

Plastic doesn't bleed. Damage is **material damage**, in three legible visual stages on every soldier (player included):

1. **Scuffed** (100–60%): paint chips, scratches.
2. **Warped** (60–25%): visible sag/deformation on the damaged side, slight limp in the pose cycle.
3. **Critical** (<25%): charred edges, smoking, screen edges get a heat-shimmer "warp" vignette.

- **No auto-regen.** Healing = **Doc's Glue** pickups (small: +35%) and rare **Fresh Plastic** stations (mold trays; full reset, once each). Health as a resource keeps map routes meaningful — a glue dot on a high shelf is a level-design reward.
- **Deaths by damage type:** kinetic → **shatter** (pieces physically scatter, land as debris); fire/beam → **melt** (vertex-slump into a green puddle with the rifle sticking out); knockback into a pit → **lost** (falls out of world; Olive, flatly: *"Moss is under the fridge. Requisitioning a replacement."*).
- **Respawn fiction:** you are mass-produced. Death cuts to the HQ toy bin; an identical Moss deploys at the last checkpoint. Cheap, charming, honest. Checkpoints are generous (start of each map "region").

## Arsenal

Eight weapons + one thrown. Unlock order tracks the campaign (map numbers per the map bible). Design rule: **half the arsenal is military-toy, half is toy-toy** — the blend is the identity.

| # | Weapon | Type | The idea | Unlock |
|---|---|---|---|---|
| 1 | **Standard-Issue Rifle** | Hitscan, mid ROF | Molded into his hands since 1962. Reliable, iron-sight accurate, the workhorse. | Start |
| 2 | **Cap Pistol** | Hitscan sidearm | Infinite ammo, weak, gloriously loud — every shot is a *cap* crack with a puff of smoke. Alerts everything. | Start |
| 3 | **Frag Grenade** | Thrown, cooked | Classic pineapple. Knocks based enemies over even outside kill radius (toppling ≈ soft CC). | M1 |
| 4 | **Rubber-Band Sniper** | Projectile, zoom | A clothespin-and-band contraption. Slight drop, huge damage, **pins light enemies to soft surfaces** (cork, cardboard, sofa arm). | M2 |
| 5 | **Water Pistol** | Stream, utility | Low damage but: staggers with knockback, extinguishes fires, **dissolves the glue holding POWs**, and warps/collapses cardboard cover — the anti-fortification tool. | M4 |
| 6 | **Bazooka** | Rocket, splash | Anti-armor. The answer to wind-up tanks and DYNO-MITE's shins. Scarce ammo (matchstick rockets). | M5 |
| 7 | **Flamethrower** | Cone DoT | The signature horror-comedy weapon: enemies *melt*, slumping mid-pose. Short range, tank on the back is shootable (theirs and yours). | M6 |
| 8 | **Magnifying Glass** | Beam, map-dependent | Superweapon with a catch: **only fires when you stand in direct light** (sun shafts, desk lamps, the open fridge). Focused beam melts anything, armor included. Turns lighting into a tactical layer. | M7 |
| 9 | **Firecracker Satchel** | Thrown, heavy | Black Cat bundle, big fuse, bigger boom. Finale toy. | M8 |

Ammo fiction: loose BBs, rubber bands, birthday-candle fuel, matchsticks — scavenged pickups styled as household clutter.

## Enemies — the Tan Command

Design rule that carries the whole roster: **rank = articulation.** Cheap Tan conscripts are *molded on bases in fixed poses* — they slide, hop, and pivot like a kid pushing them around, and can be **toppled** (knocked over = helpless for seconds, comedy + tactics). Elites are articulated like the player. Powered allies (the battery-electronics) sit above them all.

### Molded tier (based, poseable-not-posed)

| Enemy | Pose | Behavior |
|---|---|---|
| **Based Rifleman** | Standing firing pose | Hops/slides to firing lines; accurate but slow to traverse. Topple with grenades, dives, or one bazooka anywhere near. |
| **Grenadier** | The classic mid-throw pose | Lobs on a fixed timer with a whistle wind-up; deadly in groups on high ground (spice racks, shelf edges). |
| **Kneeling Bazooka Man** | Kneeling launcher pose | Long reload, screen-shaking rocket. Priority target; his backblast topples his own neighbors. |
| **Prone Sniper** | Prone rifle pose | Can't relocate at all. A glint (rubber-band shine) telegraphs the lane. Owns long sightlines until flanked. |
| **Minesweeper** | Detector pose | Doesn't fight — *reveals*. Sweeps for the player's noise, marks position for the squad. Kill quietly or go loud fast. |

### Articulated tier

| Enemy | Behavior |
|---|---|
| **Tan Trooper** | The rank-and-file mirror of the player: takes cover, flanks in pairs, retreats at Critical melt. The AI baseline everything else is tuned around. |
| **Flamer** | Rushes with a cone; volatile backpack (shoot it: chain melt). Spawns get scarier indoors. |
| **Officer** | Buffs nearby molded units (faster hops, tighter accuracy) and radios one reinforcement wave if alive too long. Kill-priority target with a visible pennant. |

### Powered tier (the battery escalation, later maps)

| Enemy | Behavior |
|---|---|
| **Wind-Up Tank** | Miniboss-grade armor. Must be wound by a Tan crew — kill the winders and it grinds to a halt mid-charge. Bazooka or magnifier only. |
| **Balsa Interceptor** | Rubber-band-launched glider strafing runs on outdoor maps. Telegraphed shadow. |
| **RC Raider** | Battery-powered jeep, fast, erratic, driven by remote from a Tan operator *somewhere on the map* — kill the operator (antenna glint) and the jeep spins dead. |
| **DYNO-MITE** | Recurring enforcer: robot dino, stomp shockwaves, LED eyes, chest speaker roar. Fought in escalating encounters (M4 ambush, M7 factory, M8 final phase). |

### Neutral hazards (nobody's side)

- **The Cat** — apex predator of indoor night maps. Cannot be killed, only evaded, distracted (wind-up mouse), or survived. Tan fears it too; fights pause when it enters.
- **Ants** — third army at the picnic finale; attack Green and Tan alike, swarm dropped food, can be *aimed* by shooting a jam jar open near Tan lines.
- **Environment** — sprinklers on timers, sink disposal, toaster ejections, robot vacuum on a schedule, the occasional passing Giant foot (instant loss of whatever it lands on, always telegraphed by shadow + quake).

## AI model (scoped deliberately small)

- FSM per unit: `idle/patrol → suspicious → combat → (flee|topple|dead)`. No utility AI, no squads-as-entities; "squad behavior" is faked with shared alert tokens and officer buffs.
- Nav: hand-authored waypoint graph per map (maps are hand-crafted; we bake nav regions during map authoring, no runtime navmesh generation). Molded units get graph-hop movement — which *looks correct* for them by design; articulated units get graph + local steering.
- LOS via raycast, hearing via event radius (cap pistol huge, rubber band silent).
- Budget: ~12 active combatants max; distant spawns dormant until region trigger. This is a readable arcade shooter, not a milsim.

## Campaign structure

**Eight missions across one summer week, escalating from backyard skirmish to Fourth of July finale.** Full map detail lives in the map bible; the shape:

| # | Map | Mission verb | Beat |
|---|---|---|---|
| 1 | The Sandbox | Tutorial assault | Basic training turns real: Tan raid steals the sandbox — and the flashlight batteries. |
| 2 | The Backyard | Recon + rescue | Cross the lawn jungle; rescue Cpl. Fern; discover the battery convoy routes. |
| 3 | The Gutter Run | Linear infiltration | Storm mission. Ride the downspout system into the house before the rain flushes you out. |
| 4 | The Kitchen Counter | Sabotage | Cut the Tan supply line across the counter; DYNO-MITE ambush at the toaster. First powered-tier contact. |
| 5 | The Bathroom | Naval assault | Sink the battery freighter (a cargo boat in the filling tub) before it reaches the far rim. |
| 6 | The Bedroom at Night | Stealth-leaning op | Rescue Doc Pickle from the Tan POW camp under the bed. The Cat is hunting. Flashlight beams are both salvation (magnifier fuel) and exposure. |
| 7 | The Workbench | Factory raid | Blow the Tan armor factory in the garage; wind-up tank production line; DYNO-MITE rematch. |
| 8 | The Picnic Table | Everything, then a boss | July 4th. Take the Volt Throne (the battery cache) as fireworks artillery falls, ants swarm the flanks, and Field Marshal Taupe unleashes a fully-charged DYNO-MITE. |

Mission verbs deliberately rotate: assault → rescue → traversal → sabotage → naval → stealth → siege → finale. No verb twice in a row.

### Rescue, the signature verb

POWs are **glued to the spot** (Tan doctrine: a tube of model cement). Free them with the water pistol or a held interact. Freed soldiers either follow to an extraction zone (they fight, they're invincible — escort tedium is banned) or hold a rescued corner as a friendly turret. Named rescues (Fern, Sprout, Pickle) are mission beats; generic POWs are per-map optional objectives feeding the medal tally.

## Progression & replay

- **Per-mission medals:** completion time (Bronze/Silver/Gold "Mess Kit" tiers), all POWs freed, all marbles found.
- **Lost Marbles:** 5 hidden per map, placed to reward reading the terrain like a kid would (inside the boot, under the colander, behind the paint can). Pure exploration currency → unlocks concept-art gallery and paint-scheme skins for Moss (copper, glow-in-the-dark, "unpainted gray prototype").
- No RPG stats, no weapon upgrades in v1. Power growth = arsenal growth + player knowledge. Keep it arcade.

## Out of scope for v1 (binding — see roadmap guardrails)

Multiplayer/split-screen; driveable vehicles; procedural or user-generated maps; difficulty modes beyond one tuned default + an accessibility "Plastic Padding" damage reducer; any second faction campaign.
