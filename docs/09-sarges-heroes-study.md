# 09 — Sarge's Heroes: the soul study (compact)

Four researchers (levels, combat, art, tone) mined reviews, guides, wikis, speedrun boards and retrospectives of *Army Men: Sarge's Heroes* (1999) and its sequel; primary pages were proxy-blocked so findings come from indexed excerpts (a fifth "what made it fun" pass and the synthesis were cut by an account limit — this synthesis is mine, from the four reports). Full reports live in the session transcript; the distilled result is below and drives the four updates in **§4**.

## 1. The soul, in ten principles

1. **The arsenal is the fun, and you get it early.** M-16, grenades, bazooka, flamethrower, mortar, sniper, shotgun, mines — via *pickups on every level* ("an over-abundance") and via **rescue = weapon** (Riff = bazooka, Scorch = flame, Shrap = mortar…). Reviewers said the abundance offset the janky controls.
2. **Melt is the spectacle.** The flamethrower "melts anything in range" into "bubbly goo"; explosives leave "plastic chunks on the ground"; hits shed "little flecks of plastic." Two death types, remembered for 25 years. No signature death *sound* — a gap we can own.
3. **Auto-aim was load-bearing.** "As long as your gun is in the general direction of an enemy, you'll hit them." The Dreamcast crosshair that *showed the locked target* fixed the "strange priorities" complaint.
4. **Enemies come in clusters of 3–6 at chokepoints, unaware until triggered, then they charge.** Grunts are pacing; **explosive infantry on high ground is the real threat.** Empty stretches between clusters were the complaint.
5. **Barks are catchphrases, not dialogue.** "Party time." "Good to go." "Because I'm the bad guy." One improviser (Jim Cummings) voiced every male; personalities were audio-first. Straight-man hero, ham villain — the split is the comedy engine.
6. **Weapon-switch = molded-pose-switch.** Marketing sold Sarge assuming "the classic army men poses"; the rifle is fused to the hands; helmet-dominated neckless silhouette; single hue per army with unified "Plastosheen" gloss.
7. **Real-world levels *are* the legacy** — 6 of 16 maps, 100% of the nostalgia: toaster ambush, cereal-box leap, rubber duck, bottle-rocket ride into the kitchen. Each one had a **scripted scale-transition** (rocket, toaster, sand collapse) and **multiple paths**.
8. **Rescued heroes fight beside you for the rest of the level with their signature weapon** — that's what made rescue a reward.
9. **Damage is stateful:** flinch, slowdown, burning-with-a-roll-to-extinguish. Health is boxes, not regen.
10. **Their sin was the checkpoint.** Dying at the end of a 12-minute level with no continue is the most repeated complaint. Camera lag was second.

## 2. Gap analysis (slice as built, 2026-09-02)

| Principle | Sarge's Heroes | Our slice | Gap |
|---|---|---|---|
| Arsenal early | 6–9 weapons via pickups + rescues | rifle, cap pistol, grenades; sniper on rescue | **No flamethrower, no bazooka, no weapon pickups** — the fun is missing at the source |
| Melt spectacle | flame melts, chunks fly | shatter debris exists; melt exists but nothing *causes* it | Wire fire → melt; add plastic flecks on hits |
| Auto-aim | strong, target shown | soft magnetism, no visible lock | Show the locked target; widen the cone |
| Clusters + charge | 3–6, unaware then charging | 3–5, spot instantly, hold distance | Perception ladder (Update 3); **chargers** (Update 1) |
| Barks | 30+ one-liners, voiced | none in-game | Text-bark kit + kazoo mumble now; VO later |
| Pose = weapon | yes | one aim pose | Pose per weapon (Update 2) |
| Silhouette | helmet-topped, neckless, gear as geometry | capsule + sphere + tubes | **Soldier Model v2** (Update 2) |
| Scale-transition set piece | rocket ride, toaster | leaf ride ✓ | Add a launch (bottle rocket to the birdbath) — Update 4 |
| Rescued hero fights with you | yes, whole level | Fern snipes from the rim ✓ (static) | Follow-squadmate (Sprout) — Update 4 |
| Checkpoints | none (their sin) | per region | Per objective (Update 3) |

## 3. Graphics direction — "stylized toys turned soldiers"

Keep from SH: one hue per army + unified gloss; helmet-topped neckless silhouette; rifle fused to hands; gear as *geometry* (belt ring, pouches, grenades, canteen); weapon = pose; flecks + melt as the whole hit-feedback budget. Modernize: real clearcoat plastic with a rim/fake-SSS term (their vertex specular), **animated eyes** (theirs were frozen), Tan pushed to a cooler, lighter beige with rim light so enemies read against wood and grass (their #1 legibility failure), no fog wall, props at honest fidelity with invented brand art (SH2 proved logos sell the house). Model spec for v2 (Update 2): ~7 head-units tall helmet-inclusive, head+helmet 1.3, shoulders 2 heads wide, barrel torso with no waist, tubular arms, straight legs with boot flares, flat soles, molded seam line down each side; based Tans get an oval base with a pour mark.

## 4. The four updates (this is the plan of record; 08 is superseded where they differ)

1. **FIREPOWER** — flamethrower (melt!), bazooka (chunks!), weapon crates as detours, visible lock-on, plastic flecks, barks, chargers, denser pockets. *The fun, at the source.*
2. **TOY SOLDIERS** — Soldier Model v2 per §3, weapon = pose, Tan legibility, prop detail pass (gnome, birdbath, fence, track, grass), stencil HUD, Plastosheen 2.0.
3. **FAIR PLAY** — Olive's radio pin + compass strip, visible trail, chalk arrows, awareness ladder (view cone / distance / stance), first-shot grace, checkpoint per objective, dive-topple, minimal options.
4. **HEROES & CONTENT** — squadmate Sprout (follows, fights, draws aggro badly), Taupe's ham radio taunts vs Moss's deadpan, bottle-rocket launch to the birdbath as a second route, Tan Flamer + stop-drop-roll (dive extinguishes), secondary objectives (battery crates), convoy reinforcement waves, mission select.

---

## 5. Ship log

### Update 1 — FIREPOWER (shipped 2026-09-02)

*The fun, at the source.* Everything here is felt in the first ninety seconds of the Backyard.

- **Birthday-candle flamethrower** (key 4). Crate in the Jungle's far corner at `[11, 0, -13]`, a detour off Fern's trail. Cone 6.5 u × 20°, drains fuel 28/s, sets Tans burning (DoT) and they **melt** into puddles instead of shattering — the spectacle from §1.2. Flame-tick SFX and a filtered roar loop while the trigger is held. Melts counted separately in the HUD stats line.
- **Matchstick bazooka** (key 5). Crate at the convoy road's north end at `[23, 0.2, -24]`, three rockets, cap 8. Rockets fly at 30 u/s trailing smoke, blast radius 4.2 u / 95 dmg, camera trauma scaled by distance.
- **Rescue = weapon** kept: Fern still hands over the rubber-band sniper (key 3). Weapons are now an `owned` set; Q cycles only what you carry.
- **Plastic flecks** on every kinetic hit (tan chips fly off, colour-matched to the army) — hits read at range without a hit marker.
- **Barks**: 3–5 word text sprites over heads with a per-speaker 2 s cooldown. Tans scream on alert / hit / death / melt / charge / topple / flee (`TAN_BARKS`); Moss is the straight man on kills, multikills, flamer and bazooka kills, hurt, low HP, respawn (`MOSS_BARKS`). Each bark has a tiny synth chirp (`bark_tan`, `bark_green`).
- **Chargers**: troopers in combat between 3 and 11 u rush the player for 2.6 s at speed 4.8 (wider spread while running), cooldown 6–10 s, announced with a bark. Clusters now *come at you*.
- **Denser pockets** (docs/09 §1.4 — clusters of 3–6): new `E_steppe` (two pickets by the Stones, the first contact and the charge tutorial), Jungle 3 → 4 troopers, Gnome 5 → 7 (one more based, one more trooper), Convoy 5 → 6.
- **Aim assist unchanged from M0** at the PM's request ("I did enjoy the gunplay and aiming so far"): rifle 4.5°/2.5°, cap 5°/3°, sniper 2°/1.2°, bazooka 3°/2°, magnetism lerp 0.65. The lock-on bracket exists in the HUD code but is not shown.
- Gates: `combat.mjs` (Jungle 4/4 cleared), new `firepower.mjs` (flamer melts ≥1, bazooka kills ≥1), `mission.mjs` end to end.

Deferred to Update 3: the perception overhaul (still the biggest fairness issue), checkpoints per objective.

### Update 2 — TOY SOLDIERS (shipped 2026-09-02)

*Less minimal geometry, more stylized toys turned soldiers.* Graphics pass per §3.

- **Soldier Model v2** (`src/game/soldier.ts`): helmet-topped **neckless** silhouette (face sinks into the torso), barrel torso with no waist and ball shoulders, tubular arms with ball hands, straight legs with **boot flares and flat soles**, a **molded seam line** down each side, and gear as geometry — belt, two pouches, canteen, grenade on a chest strap. Helmet has a brim and chin strap. **Animated eyes**: whites + pupils that blink every few seconds and glance around (snapped, like everything else). Based Tans stand on an **oval base with a pour mark**. The helmet always survives a shatter and rolls away.
- **Weapon = pose**: the held prop and the hold change together. Rifle (stock, mag, sight), cap pistol one-handed, rubber-band sniper as a wooden ruler with a stretched band and a bottle-cap scope, flamethrower wand with a red candle-fuel tank on the back and a hose, bazooka as a cardboard tube on the shoulder with a matchstick rocket peeking out. Idle / run / aim / kneel holds per weapon. Officers carry the pistol, prone snipers the ruler.
- **Tan legibility**: Tan pushed to a cooler, lighter beige (0xdccaa2) and every soldier material carries a **sheen term** as the fake rim/SSS — Tans glow at grazing angles against wood and dry grass.
- **Plastosheen 2.0** (`materials.ts`): harder clearcoat (0.75 / 0.18), a little sheen on every toy-plastic prop.
- **Prop detail pass**: the gnome got boots, a belt and brass buckle, folded arms and mittens, eyes, brows, rosy cheeks, a folded hat brim and worn tip; the birdbath got a fluted pedestal, moulding rings, lichen, an inner bowl wall and ripples on the water; the race track got grooves and joiner tabs; the popsicle barricades got rounded tips and twine lashing; grass blades carry a per-blade tint with one in twelve sun-bleached.
- **Stencil HUD**: objective, weapon, toasts and the briefing subtitle are stenciled ammo-crate labels (olive drab, dashed inner border, cream Impact-stack lettering, a degree off level); the melt meter is notched; the radio card carries the same olive stripe.

Deferred: a pose-snap **weapon-switch flourish** and an aim-down-sights hand pose; brand-art label textures on more props (only the cereal/juice boxes have wordmarks so far).

### Update 3 — FAIR PLAY (shipped 2026-09-02)

*You can tell where to go, and the Tans give you a fighting chance.* Answers 08 §0.1 and §0.2 directly.

- **The awareness ladder** (`enemies.ts` perception): idle → *glimpse* → **suspicious** ("Huh?", turns toward you, searches, does not shoot) → kept in view → **combat** ("Green!"). Glimpse odds now depend on a **view cone** (±70° idle, ±109° searching, anything inside 3.5 u), **distance** (linear falloff to the sight range), **stance** (sprinting ×1.7, walking ×1, standing still ×0.6, crouched ×0.45) and grass concealment. About three glimpses lock on. A comrade's shout carries 14 u, takes 1.2 s to register and makes Tans *look*, not shoot. Gunfire still turns heads within 22 u, to searching. Ambush pockets still rise together.
- **First-shot grace**: every lock-on holds fire for at least 0.7 s after the shout. Losing you for 6 s drops a Tan back to searching.
- **Olive's radio pin**: a green marker at the active objective's waypoint, drawn through geometry, with a pulsing ground ring, hidden when you're on it. Waypoints derive from the objective (region centre, encounter centroid, POW), or an explicit `at` (the leaf at the tear; once boarded it jumps to the Drain).
- **Compass strip** under the objective label: a pin on a 180° strip with the distance in *inches* (1 u = 2.13 in), amber and "BEHIND YOU" when the target is behind.
- **Visible trail**: Fern's markers are now a glowing yellow band on the ground *and* one hung on a 1.7 u twig, readable above over-head grass. **Chalk arrows** at both brick steps, at the trail's turn into the Gnome, and at the hose tear.
- **Checkpoint per objective**: completing any objective sets the respawn point where you stand ("CHECKPOINT"). Dying in the convoy raid no longer replays the climb.
- **Dive-tackle**: sprint + C into a Tan topples molded ones and shoves articulated ones (30 dmg, 1.2 s of no fire). The `divedInto` flag finally has a consumer.
- **Minimal options**: `[` `]` look sensitivity, `I` invert Y, `M` mute, persisted in `localStorage`. Listed under H.
- Gate: new `fairplay.mjs` (pin + checkpoint, crouched-behind-a-pocket stays unseen 3 s, sprint-in shows the suspicious step and a ≥0.5 s grace, dive-tackle topples).

Deferred: the awareness icon over heads (the bark carries it for now), gamepad, difficulty philosophy (PM decision).

### Update 4 — HEROES & CONTENT (shipped 2026-09-02)

*Characters, a second route, a second wave, and something to do on the way.*

- **Pvt. Sprout** (`squad.ts`) joins after the Gnome clearing ("Pvt. Sprout, reporting!"). Follows at your shoulder camera-relative, probes ahead so he doesn't walk through props, catches up off-screen if he loses you or a tier, shoots the Tan you're fighting (7 dmg every ~0.9 s, tracer + flash), and talks far too much (`SPROUT_BARKS`: combat, kills, idle chatter, panic when you die). Invincible by rule (docs/02: escort tedium is banned).
- **Gen. Taupe on the ham radio** (`TAUPE_LINES`): hammy taunts on encounter activation (always when an officer is present), on your death (instead of Olive, 45%), on objectives, on battery sabotage, and when you board the leaf. The radio card is tan-striped for him; lines queue instead of clobbering Olive's.
- **Tan Flamer** — a new enemy type with the candle-fuel tank on his back. Closes to 3–5 u, then a 1.4 s gout of fire: melt damage while you stand in it and **you keep burning after** (orange vignette, damage in 4-point ticks). **Stop, drop and roll**: a sprint-dive puts it out ("ROLLED IT OUT") and buys 0.8 s of fire immunity, so rolling away works even while he's still spraying. Olive tells you once. Killing him **blows his tank** (blast radius 3.2). One on the flowerbed perch, one in the convoy wave. Flamers never flee.
- **Convoy reinforcement wave**: 16 s into the raid four more Tans come down the road from the north, torch included — the raid objective clears on the original picket, so the wave chases you to the leaf. The director now runs `schedule` activations.
- **Secondary objective**: sabotage the three battery crates at the convoy waypoint (hold E). Counted in the HUD stats line and on the medal tally; Taupe hates it.
- **Bottle-rocket launch** — a second route to Fern. The kid's soda bottle at the flowerbed's foot, matchstick rocket in the neck, aimed at the birdbath. Hold E to light the fuse; a ballistic solve flings you onto the rim in 1.8 s (plain gravity for the flight — no jump-cut, no air steering — so the arc lands where it was aimed). Olive mentions it in the rescue briefing.
- **Mission select** on the briefing screen: stenciled crate labels for every map in the build.
- **Dive fixed**: "C while sprinting: dive" was documented since M0 and unreachable — pressing C set the crouch first, which cancelled the sprint the dive checked for. Dive now wins on that frame. Every dive verb in Updates 3 and 4 (tackle, roll-out) depends on it.
- Gate: new `heroes.mjs` (Sprout joins, crate sabotaged, rocket lands on the rim, flamer burns and a dive extinguishes, wave arrives at 16 s).

Deferred to the next round: a Sprout revive/downed state, the tilting-truck set piece and the Sandbox tutorial map (blueprint 01 is the cheapest next map on this kit), brand-art labels, gamepad.
