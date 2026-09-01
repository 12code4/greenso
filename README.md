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
- **Gates in `tools/`, all green on the Backyard**: `walk.mjs` (P1: 7/7 routes reachable, camera sweep clean), `combat.mjs` (ambush → kills → death → respawn), `mission.mjs` (drives all six objectives through the leaf ride to the medal tally), plus `smoke.mjs` and `shot.mjs`. All run headless on game-time clocks. They already caught four real bugs before any human played: a movement-basis sign error, an unparameterized rake, a leaf that departed without its rider, and a crate lip in the stream that walked the rider off the leaf.
- **Kit test scene** (`?map=kittest`) — the M0 arena rebuilt at canonical scale: the kit's visual baseline and the controller playground.

Not yet: a stranger's playtest (the M2 exit test — hands on a mouse, see below), real-GPU perf numbers, gamepad, saves, options menu (M3).

### Run it

```bash
npm install
npm run dev            # → http://127.0.0.1:5173  (add ?map=kittest for the range)
npm run build          # typecheck + bundle to dist/
npm run preview -- --port 4173 && node tools/walk.mjs backyard   # P1 gate
```

In-game: **H** controls · **F8** free-cam · **P** log position (for transcribing blueprint coordinates) · **F9** region overlay.

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

## Studio context

12code4 project. Browser-first (three.js + TypeScript, GitHub Pages) per studio DNA. Scoped as the studio's most ambitious 3D project; the roadmap proves fun cheaply (M0–M2) before committing to the full campaign. M2 is the go/no-go gate — the slice exists; the verdict needs a human.
