# 05 — Roadmap

Structured to prove the fantasy cheaply before committing to the full campaign. Each milestone has a binary exit test; failing an exit test means we fix or re-scope *before* the next milestone, per studio charter (no ship pressure — but no zombie projects either).

## M0 — "First Steps" · greybox feel

Scope: TypeScript/Vite/three.js scaffold · capsule player controller + spring camera + aim mode · hitscan rifle + cap pistol vs. pop-up targets · one greybox arena built from Household Kit *placeholder* primitives at true 1:32 metrics (the scale table made walkable) · frame-time HUD.

**Exit test:** five minutes of moving and shooting in the greybox feels good *on its own*, and the camera never fights the player (the Sarge's Heroes sin is un-committed here or the project stops). A visitor should already say "oh, you're tiny" from greybox blocks alone.

## M1 — "It's Alive... It's Plastic" · identity

Scope: PlasticMaterial with all damage states · pose-snap animation system + Moss rig with the ~15-pose library · melt/shatter/lost deaths · Melt Meter + glue pickups · Tan Trooper (articulated FSM baseline) + Based Rifleman + Grenadier · toppling · grenade with arc preview · combat in the M0 arena · plastic-clack collision audio (the material's voice arrives with the material).

**Exit tests:** (1) a 60-second clip of one fight is *visibly this game and no other game* — the screenshot test from the vision doc; (2) pose-snap reads as charming, not broken, to at least one person who didn't build it. Escape hatch if (2) fails: conventional low-fps skeletal on the same pose library, decided here, never later.

## M2 — "The Green Sea" · vertical slice ★ the go/no-go milestone

Scope: **The Backyard, complete** — built to its blueprint ([`docs/blueprints/map-02-backyard.md`](blueprints/map-02-backyard.md)) through the P1–P6 pipeline ([`docs/06`](06-level-architecture.md)): full layout, sprinkler hazard schedule, landmark wayfinding, Fern rescue, convoy raid, leaf-ride finale, marbles · the map runtime the whole campaign reuses (kit registry + instancer, region/nav/encounter-director/hazard-scheduler/mission-FSM) proven here first · `tools/walk.mjs` reachability gate + authoring aids (free-cam, position logger, overlays) · the M0 arena rebuilt at canonical scale as the Household Kit test scene · Rubber-Band Sniper, Prone Sniper enemy, Balsa Interceptor · mission flow (briefing → play → medal tally) · HUD v1 · audio pass v1 (SFX bed + one music arrangement + Giants room tone) · hosted build on Pages, playable start-to-finish.

> The level-build system (docs 06 + 07 + all 8 blueprints) is written ahead of M2 so that building each map is transcribe-and-tune, not design. M2 proves the pipeline on one map; M3–M4 run every other map through the same gates.

**Status (2026-09-01): built.** The Backyard plays start to finish against its blueprint; the map runtime, kit registry, hazard scheduler, encounter director, mission FSM, POWs, aircraft, audio v1, and the `tools/` gates all exist. M1's essentials (melt meter, Tan roster, grenades, pose-snap in embryo) were folded in because the slice can't exist without enemies. **Not yet passed: the exit test itself** — a stranger playing hint-free to completion with the childhood-recognition reaction. That needs a human with a mouse; everything a headless browser can verify (reachability, camera sweep, combat loop, objective chain) is scripted in `tools/`. Known tuning debt: enemy accuracy/damage was tuned once against a stationary bot; real-GPU perf unmeasured; M1's full pose library and plastic-material detail texture remain M1 work proper.

**Exit test:** a stranger plays the slice unprompted-hint-free to completion and the childhood-recognition reaction (vision doc success #1) actually happens. **This is the studio go/no-go gate for the remaining six maps.** A great slice that fails here is still real studio output (charter) — but the campaign doesn't proceed on hope.

## M3 — "Open the House" · systems complete

Scope: Sandbox (tutorial) + Kitchen Counter maps · water-tech spike (planar surface, rising level, float/flush volumes) *de-risked here, ahead of the bathroom* · Water Pistol, POW glue-rescue system generalized, Officer, Minesweeper, Kneeling Bazooka Man, Wind-Up Tank, first DYNO-MITE fight · save/progress + options menu (studio checklist set, incl. reduced-flash + Plastic Padding) · gamepad parity.

**Exit test:** campaign loop (bin → briefing → three consecutive missions → medals persist) plays through a fresh browser profile with no dev intervention; water spike demo holds 60 fps.

## M4 — "The Whole House" · content complete

Scope: Bathroom, Gutter, Bedroom, Workbench, Picnic — in that order (per map-bible production order) · Bazooka, Flamethrower, Magnifying Glass, Firecracker Satchel · the Cat, ants, RC Raider · Taupe finale, ending scene · all 40 marbles + skins + gallery · full campaign playable.

**Exit test:** full campaign clearable in one honest sitting (~3–4 h target) by someone other than the builder; every map passes its perf flythrough budget.

## M5 — "Parade Dress" · studio release checklist

The standard checklist, verbatim from the hub: hosted build · input parity · audio pass (already ahead of debt by design) · options · saves sanity · debug hooks stripped/gated · landing page with blurb/screenshots/GIF · repo hygiene (work merged to `main`, default branch correct, README matches the game). Plus: title trademark sanity search resolved before the landing page goes public.

## Risk register

| Risk | Level | Mitigation |
|---|---|---|
| **Scope: 8 maps × bespoke spaces is the studio's biggest 3D commitment** | High | The Household Kit + ≤8-new-props rule; greybox-first mandate; M2 as a real go/no-go gate; the Eight can truncate to a five-map campaign (1-2-4-6-8 still tells the whole story — noted here so truncation is a decision, not a defeat) |
| Character animation quality (the classic indie 3D killer) | High | Pose-snap bet removes the animation-graph problem entirely; explicit M1 exit test + named escape hatch |
| Water/naval tech (Maps 3, 5) | Medium | Isolated spike scheduled at M3, two maps' worth of slack before the bathroom needs it; gutter reuses it in simpler form |
| AI reads as dumb in open spaces | Medium | Encounter grammar keeps fights in authored pockets; molded-tier enemies are *supposed* to be simple — the roster is designed so the cheap AI is diegetic |
| Camera in dense household clutter | Medium | M0 exit criterion; whisker collision from day one; maps authored with camera clearance as a layout rule |
| Perf on integrated GPUs with big cluttered maps | Medium | Instancing-first kit, region culling + haze, budget asserts in CI flythroughs |
| Single-file dist vs. asset weight | Low | Named fallback (HTML + one pack file), decided at M2 |
| IP adjacency to Army Men | Low | Boundaries binding in vision doc; original cast/world; trademark search at M5 |

## Scope guardrails (binding until PM unbinds)

1. No multiplayer. 2. No driveable vehicles. 3. Eight maps maximum; truncation path predefined above. 4. No new weapons beyond the nine. 5. Pose-snap or low-fps skeletal — never full animation pipelines. 6. No physics engine unless the M2 review invokes the Rapier fallback. 7. One difficulty + accessibility modifiers, not difficulty modes.

## Open PM decisions

Needed before or during M0 — none block starting M0 except #1 in spirit:

1. **Title.** Recommendation: **PLASTIC PLATOON**. Alternates: GREEN SEASON, THE BIG BACKYARD WAR, MOLDED.
2. **Perspective sign-off.** Plan assumes locked third-person (vision doc argues why). Veto now or it's foundational.
3. **Pose-snap art direction.** The boldest bet in the plan — cheap to demo at M1, but say now if stop-motion-toys is *not* the look you want, because the alternative (smooth animation) changes budgets everywhere.
4. **Cast & faction names** (Moss, Olive, Fern, Sprout, Pickle, Taupe, DYNO-MITE, Green/Tan). Rubber-stamp or riff.
5. **Campaign length appetite.** Full Eight vs. the five-map cut as the *target* (the Eight stays the design; this only sets where the go/no-go bar sits at M2).
