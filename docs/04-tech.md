# 04 — Tech Plan

## Stack decision

**three.js + TypeScript + Vite, browser-first, GitHub Pages hosting, single-file dist.**

Rationale against the alternatives actually on the table for this studio:

- **three.js (recommended):** four shipped/near-shipped studio 3D projects run on it or raw WebGL2 (zoom, portalrogue, ATV 3D, toto). Browser builds satisfy the studio release checklist by default, and the studio's whole distribution story (Pages, single-file) assumes it. Costs: we hand-roll character animation, AI, and collision — mitigated below by choosing toy-authentic *simple* versions of all three.
- **Godot 4:** better built-in animation/nav/physics, and PRELOAD RALLY proves studio competence — but its "no browser build" gap is literally a flagged blocker on the roster, and this game wants friction-free play-in-browser sharing at every milestone. Declined for v1.
- **Raw WebGL2:** toto proves it's possible; nothing about this game needs it. Declined.

Physics: **no physics engine.** Custom capsule-vs-static-collider (studio precedent), manual ballistic projectiles, and a tiny "tumble" rigid-body for knocked-over molded units and shattered pieces. The one physics showpiece (washer avalanche, Map 7) is an instanced particle cheat, not a solver. If M2 proves this wrong, Rapier (WASM) is the named fallback — decided then, not before.

## The two signature technical bets

These two systems ARE the game's identity on screen; they get M1 entirely to themselves.

### Bet 1: The plastic material

One shared `PlasticMaterial` for every soldier and molded prop:

- Base: `MeshPhysicalMaterial` with `clearcoat` (the wet-gloss injection-molded look), slight `sheen`, and a cheap fake-subsurface rim term (plastic glows faintly at thin edges against light — this is 80% of "looks like a toy" and costs one fresnel).
- **Mold authenticity details** in a shared detail texture: seam lines along limb centerlines, flash remnants, sink marks, a faint recycled-swirl in the pigment. Subtle, but it's the difference between "low-poly soldier" and "toy."
- **Damage states as material, not new meshes:** vertex-colour-masked paint chips (Scuffed), a vertex-shader sag/warp driven per-instance (Warped), char + emissive ember edge (Critical). Death-by-melt is the same sag shader driven to 1 plus a puddle decal; death-by-shatter swaps to a pre-fractured 6–10 piece version with the tumble sim.
- Everything instanced: soldiers are one geometry + per-instance uniforms (team colour, damage, pose index).

### Bet 2: Pose-snap animation

**No smooth skeletal animation.** Soldiers animate like stop-motion toys: a small library of full-body *poses* (molded-legal: run A/B, aim, throw, kneel, topple, hit-react, melt-slump), and animation is **snapping between poses at 8–12 fps** with 1-frame smears on fast transitions.

Why this is the right call and not a cope:

- It is *more* toy-authentic than smooth blending — the exact look of a kid repositioning a figure, and of stop-motion (*the* toy-fiction film language).
- It collapses the animation problem: ~15 static poses per rig instead of animation graphs, blend trees, IK. A pose is just a stored set of bone transforms; "playback" is `lerp(poseA, poseB, step(...))` in a vertex shader over instanced skinned meshes.
- It makes molded (based) enemies and articulated ones read as one family — based units snap between *zero* poses (they only pivot/hop, animated by transform alone) and articulated ones snap between fifteen.
- Risk & escape hatch: if it reads as broken instead of charming (M1 exit review judges this), the pose library is still the keyframe skeleton of a conventional low-fps skeletal approach — nothing is thrown away.

Camera, projectiles, physics, and UI all run at full framerate — only *creature pose* is quantized. That contrast is the aesthetic.

## Architecture

Plain TypeScript, ECS-lite (the DogNightcrawler scale lesson: systems + component bags, no framework):

```
src/
  main.ts            // boot, loop, scene mgmt
  core/              // math, pooling, events, save (localStorage), input (kbm + gamepad)
  render/            // three setup, PlasticMaterial, pose-snap skinning, instancing, fx (melt/shatter/decals)
  sim/               // capsule collision, ballistics, tumble bodies, hazard schedulers
  ai/                // FSM, perception (LOS ray + hearing events), waypoint graph runtime
  game/              // player controller, camera rig, weapons, health/melt, pickups, missions/objectives, POW logic
  maps/              // per-map: loader glue, region triggers, hazard configs, encounter tables
  ui/                // HUD, menus, briefing screens, medal tally
  audio/             // WebAudio synth engine, mixer, music sequencer
assets/              // GLTF kits, poses, textures (kept small; see budget)
tools/               // dev: free-cam, encounter tuner, nav-graph painter (in-game overlay)
```

## Map pipeline

**Blender → GLTF, one file per map, naming conventions carry the metadata:**

- `COL_*` meshes → static colliders (boxes/hulls only; auto-stripped from render or used as-is for greybox).
- `NAV_*` planes → walkable regions; edges auto-linked into the waypoint graph, hand-painted links (`NAVLINK_*` empties) for jumps/vaults/ladder-type routes.
- `SPAWN_*`, `TRIG_*`, `MARK_*` (landmarks), `SECRET_*` empties → gameplay data.
- Props reference the shared **Household Kit** GLTF by name and are instanced at load (per the map bible: kit of ~40 hero props, ≤8 new hero props per map).
- Every map must run in **greybox mode** (colliders + kit placeholders only) from day one; art is a dressing pass on a map already proven fun. The in-game nav-graph painter + encounter tuner exist so tuning doesn't round-trip through Blender.

Water (Maps 3/5) is its own mini-spike: a planar animated surface + rising-level parameter + float/flush volumes. Scheduled explicitly in the roadmap; the bathroom map is hostage to it, which is why bathroom is built fifth, not second.

## Performance budget (60 fps on integrated GPU)

| Budget | Target |
|---|---|
| Draw calls | < 150 (kit instancing does the heavy lifting) |
| Scene triangles | < 500k visible; soldiers 1.2–2k each, hero props 300–3k |
| Active AI | ≤ 12 combatants simmed; distant regions dormant until triggered |
| Textures | Atlased kit palette + detail sheets; target < 40 MB total assets per map |
| Lights | 1 sun/keylight + ≤ 4 local (nightlight, worklight, LED lantern...), no shadow cascades — one shadow map on the hero light, blob shadows elsewhere |
| Culling | Region-based (rooms/zones), plus scale-friendly fog: indoor maps haze at distance like dusty air in sunbeams — perf tool *and* mood tool |

Single-file dist target stays (studio convention), with the one honest caveat: GLTF + audio may push total past comfortable inlining; if so, dist is one HTML + one `assets.bin` pack, still Pages-trivial. Decide at M2, note in release checklist.

## Audio plan (front-loaded on purpose)

Audio is the studio's chronic last-mile debt (flagged across five roster titles) — so it's an **M2 deliverable, not a polish item**:

- **SFX:** WebAudio synth, leaning into the toy register — cap-gun cracks, hollow plastic *clacks* (the material's collision voice everywhere), rubber-band thwips, kazoo-ish ricochets. The hazard schedules are audio-first by design (sprinkler pipe-knock, burner tick, thunder-then-gurgle): the SFX layer is a gameplay system.
- **Music:** procedural military brass-and-snare pastiche (ATV 2D proved studio procedural-music chops), arranged small — like a toy band. Hush states (the Cat) duck everything to heartbeat + room tone; the finale syncs its score to the fireworks scheduler.
- **Giants:** muffled trombone-talk, footfall sub-thumps, distant TV — the house as room-tone bed per map.

## Save/options

localStorage: campaign progress, medals, marbles, skins, options. Options at M3 per studio checklist: volume sliders, sensitivity, invert, reduced-flash mode (fireworks/lightning maps need it — flagged now so Maps 3/8 build flashes as tunable from the start), colorblind-safe team tinting check (green vs tan reads okay for deutan/protan? verify at M1 with a sim pass — fallback is trim-colour accents), "Plastic Padding" damage reducer.

## Testing

- Unit: math, collision resolution, hazard schedulers, FSM transitions (vitest).
- Golden-path smoke per map: headless load, spawn, walk a scripted route, assert no collider holes/NaNs (puppeteer against the dev build in CI).
- Perf trap: frame-time HUD + a scripted "worst arena" flythrough per map with a budget assert.
