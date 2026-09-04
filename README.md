# PLASTIC PLATOON

*(working title — codename `greenso`. Alternates: GREEN SEASON, THE BIG BACKYARD WAR, MOLDED. PM picks.)*

**A third-person 3D shooter about being two inches tall.** You are Sergeant Moss of the Green Army — a mass-produced plastic soldier fighting a house-spanning war against the Tan Command across sandboxes, kitchen counters, bathtub oceans, and one catastrophic Fourth of July picnic.

Direct spiritual descendant of *Army Men: Sarge's Heroes* (1999) — the scale fantasy, the plastic-toy material identity, the campy war-movie tone — rebuilt as our own original game with our own world, characters, and twist.

## The pitch

> The household is a continent. The lawn is a jungle. The kitchen counter is a mesa 30 meters high. The Tan Command has stolen the battery drawer and allied with the modern electronic toys — RC tanks, robot dinos, things that *move on their own* — and the classic molded Greens are the last analog army standing between them and the whole house.

## Pillars

1. **The maps ARE the game.** Every level is a real household place rendered honestly at 1:32 scale, dense with the specific joy of childhood floor-level imagination. Map craft outranks every other discipline here.
2. **Everything is plastic.** No blood, no grit — damage melts, chips, and shatters. Deaths are toy deaths ("lost under the fridge"). The material is the art direction, the VFX language, and the tone.
3. **The Giants are weather.** Humans are never seen above the knee and never heard clearly. A dinner bell is a mission timer. A footstep is an earthquake. The kid who owns these toys is a god we never meet.
4. **Saturday-morning war movie.** Played straight by the characters, absurd to the viewer. Heroic sacrifice over a spilled juice box.

## Status — M2 vertical slice: *The Backyard* is playable

The go/no-go map is built end to end from its blueprint: spawn on the rug, follow Fern's rubber-band trail across the stepping stones into over-head grass, get ambushed, clear the Gnome clearing's kid-built picket, find the Tan convoy road (a hot-wheels track), climb the flowerbed tiers and a leaning rake to free Cpl. Fern glued to the birdbath rim (she hands you the rubber-band sniper and covers you from up there), raid the convoy waypoint under Balsa-glider strafing runs, and ride a leaf down the hose-stream to extraction — with the sprinkler flattening the grass on a 90-second cycle and the dog thundering past the steppe.

What's in the build:

- **The map runtime the whole campaign reuses** (docs/06): `MapDef` data format, the Household Kit registry (~40 props at honest `cm ÷ 5.4` scale), shell builder, region system with checkpoints, hazard scheduler (push/soak/quake/sweep ops), moving platforms, pickups, encounter director with templates, mission FSM, POWs, aircraft waves.
- **Combat** (the M1 essentials the slice can't exist without): Melt Meter health with material damage stages and toy deaths (shatter debris, melt puddles); the Tan roster — Trooper, Based Rifleman (hops between lane nodes, topples), Grenadier, Prone Sniper (glint telegraph), Officer (reinforcement call); rifle, cap pistol, rubber-band sniper (pins to surfaces), cooked grenades with arc preview; soft bullet magnetism; **pose-snap animation** (molded poses snapped at 9 fps — docs/04 bet 2, in embryo).
- **Grass as perception volumes** — concealment for the player, flattened by the sprinkler's soak on a timer so sightlines open twice a cycle.
- **Audio v1** — all-procedural WebAudio: cap cracks, plastic clacks, rubber-band thwips, pipe-knock telegraphs, birds and wind, a marching-snare combat loop.
- **Gates in `tools/`, all green on the Backyard**: `walk.mjs` (P1: 7/7 routes reachable, camera sweep clean), `combat.mjs` (ambush → kills → death → respawn), `firepower.mjs` (flamer melts, bazooka kills), `fairplay.mjs` (awareness ladder, grace, pin, checkpoints, dive-tackle), `heroes.mjs` (Sprout, sabotage, rocket, flamer, wave), `mission.mjs` (drives all six objectives through the leaf ride to the medal tally), plus `smoke.mjs` and `shot.mjs`. All run headless on game-time clocks. They already caught four real bugs before any human played: a movement-basis sign error, an unparameterized rake, a leaf that departed without its rider, and a crate lip in the stream that walked the rider off the leaf.
- **Kit test scene** (`?map=kittest`) — the M0 arena rebuilt at canonical scale: the kit's visual baseline and the controller playground.

**First playtest verdict (PM, 2026-09-02):** graphics good; the level can't be beaten without guidance, enemies lock on instantly, some documented controls aren't built, and — the big one — *the fun and charm of Sarge's Heroes isn't there yet.* The study that answers that is [`docs/09-sarges-heroes-study.md`](docs/09-sarges-heroes-study.md); it sets the plan of record: four updates, **FIREPOWER → TOY SOLDIERS → FAIR PLAY → HEROES & CONTENT**.

**All four updates are in** (ship log in docs/09 §5):

1. **FIREPOWER** — birthday-candle flamethrower that *melts* Tans, matchstick bazooka, weapon crates as detours, plastic flecks on hits, screaming Tan barks vs deadpan Moss, troopers that charge, denser pockets. Aim assist untouched from M0.
2. **TOY SOLDIERS** — Soldier Model v2 (helmet-topped neckless silhouette, gear as geometry, boot flares, seam lines, blinking eyes), weapon = pose, lighter Tan with a rim sheen, Plastosheen 2.0, prop detail pass (gnome, birdbath, track, barricades, grass), stencil HUD.
3. **FAIR PLAY** — the awareness ladder (view cone, distance, stance, grass; "Huh?" before "Green!"), first-shot grace, sentries that scan, Olive's radio pin + compass strip in inches, visible trail markers and chalk arrows, a checkpoint on every objective, dive-tackle, minimal options.
4. **HEROES & CONTENT** — Pvt. Sprout the squadmate, Gen. Taupe's ham-radio taunts, the Tan Flamer (stop-drop-roll to put yourself out; his tank blows), a convoy reinforcement wave, battery-crate sabotage as a secondary objective, a bottle-rocket launch to the birdbath as a second route, mission select — and the sprint-dive, documented since M0, finally works.

**Second hands-on (PM, 2026-09-03):** the sprint-dive and the movement animation land; two fixes followed (Tan tracers no longer linger; the run cycle is four molded frames that drift a fifth of the way toward the next before each snap). The bigger verdict: the Backyard is too small, fully explorable before the first objective. The answer is a new world plan, [`docs/10-house-atlas.md`](docs/10-house-atlas.md): one house at honest scale, four floors plus the yard, two main missions per floor, side quests in the rooms, Tans that patrol between landmarks. The slice becomes a prototype (archived in [`archive/builds/`](archive/builds/)); the yard gets rebuilt into the house. PM decisions of record (2026-09-03): the story is **BOXED** (atlas §10), all fifty secrets in [`docs/11`](docs/11-secrets-for-review.md) are approved, the yard gets one main mission plus side quests, and the house comes first — built room by room, designed well.

**The ground floor is built (2026-09-03).** `?map=g`: kitchen, pantry, mudroom, vestibule, back hall, garage, dining room, vaulted living room, half bath, hall closet, stairs and hall at honest scale, from [`docs/blueprints/floor-G.md`](docs/blueprints/floor-G.md). Two missions — **G1 The Long Hall** (string from the junk drawer, bridge the kids' marble run, climb to the second floor) and **G2 Open House** (Biscuit's ball under the dog door) — plus Tan patrols between landmarks, ambush pockets, five floor links with the toy-bin loading card, and the first secrets. Every kid-logic climb is a ramp you walk (shingled paperbacks, a leaned shelf board, the car's raked glass) except the two hard ones (fireplace stones, bookcase hops). Gates: `walk.mjs g` 13 routes clean, `house-g.mjs` 21/21, the Backyard's four gates still green; the blueprint's §11 is the as-built log of everything the gates caught. Archived as [`archive/builds/2026-09-03-ground-floor.html`](archive/builds/). Next: the second floor (`docs/10` §12 production order).

### Run it

**No install needed:** download [`plastic-platoon.html`](plastic-platoon.html) and open it — the whole game is one self-contained file (every asset is procedural). `npm run build:single` regenerates it.

```bash
npm install
npm run dev            # → http://127.0.0.1:5173  (add ?map=kittest for the range)
npm run build          # typecheck + bundle to dist/
npm run preview -- --port 4173 && node tools/walk.mjs g   # P1 gate on the ground floor
node tools/tour.mjs g /tmp/shots                            # photo tour of the rooms
node tools/house-g.mjs                                      # G1 + G2 mission gate
```

In-game: **H** controls · **[ ]** sensitivity · **I** invert Y · **M** mute · **F8** free-cam · **P** log position (for transcribing blueprint coordinates) · **F9** region overlay.

## Documents

| Doc | What it covers |
|---|---|
| [`docs/01-vision.md`](docs/01-vision.md) | Vision, tone, the Sarge's Heroes study, original-IP boundaries |
| [`docs/02-game-design.md`](docs/02-game-design.md) | Core loop, controls, weapons, melt system, enemies & AI, campaign, progression |
| [`docs/03-map-bible.md`](docs/03-map-bible.md) | The design bible: scale fantasy, seven map laws, all eight campaign maps in prose |
| [`docs/04-tech.md`](docs/04-tech.md) | Engine choice, architecture, plastic material & pose-snap bets, audio, budgets |
| [`docs/05-roadmap.md`](docs/05-roadmap.md) | Milestones M0–M5 with exit criteria, risks, guardrails, open PM decisions |
| [`docs/06-level-architecture.md`](docs/06-level-architecture.md) | **The build system.** Canonical scale, spatial building code, `MapDef`, encounter/hazard systems, P0–P6 pipeline |
| [`docs/07-household-kit.md`](docs/07-household-kit.md) | The prop catalog with honest dimensions and affordances |
| [`docs/blueprints/`](docs/blueprints/) | One construction contract per campaign map (all 8) |
| [`docs/08-three-updates.md`](docs/08-three-updates.md) | The first post-playtest plan: diagnosis of the hands-on (guidance, perception, honesty), the as-built walkthrough, three themed update sets. Superseded where docs/09 differs |
| [`docs/09-sarges-heroes-study.md`](docs/09-sarges-heroes-study.md) | The soul study: ten principles of what made *Sarge's Heroes* fun, the gap table against the slice, the graphics direction, the four updates and their ship log |
| [`docs/10-house-atlas.md`](docs/10-house-atlas.md) | **The world plan.** One house at honest 1:32 scale: basement, ground floor, upper floor, attic, and the yard as a fifth zone. Floor plans, room tables, the routes between floors, two main missions per floor, patrol/defense/pocket population, the Decoration With Heart standard, data-model deltas, three story pitches, production order |
| [`docs/11-secrets-for-review.md`](docs/11-secrets-for-review.md) | Fifty candidate secrets (era and game homages, all original), one table for the PM to mark keep / cut / change |
| [`archive/builds/`](archive/builds/) | Every shipped single-file build, dated and tagged |

## Studio context

12code4 project. Browser-first (three.js + TypeScript, GitHub Pages) per studio DNA. Scoped as the studio's most ambitious 3D project; the roadmap proves fun cheaply (M0–M2) before committing to the full campaign. M2 is the go/no-go gate — the slice exists; the verdict needs a human.
