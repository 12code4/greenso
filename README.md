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

## Documents

Read in order — each builds on the last:

| Doc | What it covers |
|---|---|
| [`docs/01-vision.md`](docs/01-vision.md) | Vision, tone, the Sarge's Heroes study (what we take / what we leave), original-IP boundaries |
| [`docs/02-game-design.md`](docs/02-game-design.md) | Core loop, controls & camera, weapons, health/melt system, enemies & AI, campaign structure, progression |
| [`docs/03-map-bible.md`](docs/03-map-bible.md) | **The centerpiece.** Scale math, map design language, and the full 8-map campaign roster in detail |
| [`docs/04-tech.md`](docs/04-tech.md) | Engine choice, architecture, the plastic material & pose-snap animation approach, physics, audio, performance budgets |
| [`docs/05-roadmap.md`](docs/05-roadmap.md) | Milestones M0–M5 with exit criteria, risk register, scope guardrails, open PM decisions |
| [`docs/06-level-architecture.md`](docs/06-level-architecture.md) | **The build system.** Canonical scale, spatial "building code", the `MapDef` data format, encounter/hazard systems, and the 7-pass build pipeline with acceptance gates |
| [`docs/07-household-kit.md`](docs/07-household-kit.md) | The shared prop catalog — ~45 hero props with honest dimensions, colliders, and gameplay affordances; materials & registry contract |
| [`docs/blueprints/`](docs/blueprints/) | One construction contract per campaign map (all 8): regions, routes, golden path, encounters, hazards, kit manifest, mission FSM, QA |

## Status

**M0 greybox in progress — playable.** Third-person controller, spring camera with aim mode, rifle + cap pistol hitscan with soft aim assist, pop-up target range, and a bedroom-floor-corner arena at honest 1:32 scale. Open PM decisions still pending in [`docs/05-roadmap.md`](docs/05-roadmap.md#open-pm-decisions).

### Run it

```bash
npm install
npm run dev      # → http://127.0.0.1:5173
```

`npm run build` typechecks and bundles to `dist/`. `node tools/smoke.mjs <shot-dir>` drives a headless smoke test (movement, jump, firing, scoring) against `npm run preview` on port 4173 and saves screenshots — pass `?test` in the URL for the same hooks in a live browser.

## Studio context

12code4 project. Browser-first (three.js + TypeScript, GitHub Pages) per studio DNA. This is scoped as the studio's most ambitious 3D project to date — the roadmap is built to prove fun cheaply (M0–M2) before committing to the full campaign.
