# 08 — Three Updates (the post-playtest plan)

Written after the PM's first hands-on with the M2 Backyard slice (2026-09-02). Their findings, verbatim in spirit: **(1) you can't tell how to beat it, (2) enemies lock on far too fast, (3) some controls the docs describe aren't built, (4) graphics are good — pass later.** All four are correct. This document turns them, together with the standing roadmap (05), into three large, themed update sets. It supersedes the M1/M2/M3 sequencing in 05 for the near term; the milestone *exit tests* in 05 still stand and are cross-referenced below.

---

## 0. Diagnosis (what the code actually does today)

### 0.1 "How does the player even beat the first level?"

The objective chain works (the headless gate drives it to the medal screen) but **nothing in the world tells a human where to go or how**:

- **Guidance is text-only.** An objective line and Olive's radio. No marker, no direction, no distance. "Find the Tan supply route" — east? north? The road is 20 u away behind over-head grass.
- **The trail is invisible.** Fern's rubber bands are ⌀0.5 u rings lying flat in grass taller than the player. The one thing the briefing tells you to follow can't be seen.
- **Climb routes don't read.** The rake leaning on the birdbath is the only way to Fern. It's a brown pole; nothing says "this is stairs." The brick steps up the tiers are the same.
- **The exfil has no beacon.** "There's a leaf at the tear" — the tear is a hose end 40 u from where you're standing when Olive says it.
- **No first-time prompts.** Cook a grenade, crouch in grass, hold E — none are taught in the moment.
- **Checkpoints are region-entry only.** Die during the convoy raid and you restart the raid from its edge with the same five Tans.

### 0.2 "Enemies lock on way too quick" — `src/game/enemies.ts` ~L360–380

- Detection is a per-second coin flip `(1 − concealment) × 2.2` at **any range up to 26 u** — in open ground that is ~0.5 s regardless of distance.
- **No view cone, no facing.** A Tan looking the other way sees you the same.
- **No stance or motion factor.** Crouching, standing still, and sprinting are identical.
- Once *one* unit sees you, **the whole encounter is alerted 0.6 s later** (`alertAt`), with no distance limit inside the encounter.
- **Gunfire alerts everyone within 22 u straight to hunting** (`noise()` → suspicious with your exact position).
- Ambush units spawn *in combat*. Molded units pivot to face you at spawn.
- In combat, detection is effectively permanent (`sees = conceal < 0.95 || dist < 8`).

Net effect: enter a region → spotted → everyone shooting, in about a second. The tuning pass (5 dmg / 8° spread) made that survivable; it didn't make it *fair* or *readable*.

### 0.3 "Some controls you describe but aren't built"

| Described (docs/02) | Reality | Fix (update) |
|---|---|---|
| Weapon wheel, slows time to 20% | Q cycles instantly; no wheel | Build in **Update 2** (2.4); GDD marked *Planned* now |
| Dive topples molded Tans | `player.divedInto` is set but nothing consumes it | Build in **Update 1** (1.4) |
| Crouch = Ctrl | Ctrl works but Ctrl+W closes the tab; C is the real key | Docs → C primary, Ctrl secondary (**Update 1**) |
| "Auto-vault low lips" | Auto-step ≤0.35 u + airborne lip mount ≤0.30 u; no vault animation/verb | Docs reworded now; vault pose in **Update 2** |
| Gamepad parity | Not started | **Update 3** (3.5) as planned |
| Options (volume, sensitivity, reduced-flash, Plastic Padding) | Not started | Minimal panel in **Update 1** (1.3); full in **Update 3** |
| POW rescue via Water Pistol | Hold-E only (water pistol is a Map 4 unlock by design) | Correct as designed; Water Pistol in **Update 3** |
| Interact for "plant charges / mount set pieces" | Only POWs are interactable | Grows with content in **Update 3** |

Everything else in the docs' controls table is built: WASD/Shift/Space, RMB/LMB, G cook + arc, E interact, C crouch, C-in-sprint dive (with landing clack), 1/2/3 weapons, F8/P/F9 dev aids.

---

## 0.4 How the Backyard is beaten today (as built)

For the record — and as the checklist of everything a player currently has to guess:

1. **Spawn** on the rug. Walk **north** (away from the hedge) across the mowed lawn, hopping the four stepping stones. Fern's rubber-band rings lie along this line.
2. Enter the tall grass (**the Jungle**). Three Troopers rise from it — fight or run **west** toward the **Gnome** (the red hat is visible over the grass).
3. **Gnome Clearing:** three Based Riflemen on the lane north of the gnome behind popsicle barricades, two Troopers flanking from the west by the hose. Grenades topple the based ones. Clear them → objective advances.
4. **Find the road:** go **east** from the clearing, back through the jungle, until you cross the orange hot-wheels track (x ≈ 23). Entering the road region completes the objective.
5. **Fern:** go **north-west** to the flowerbed. The **rake** leaning from the lawn at the bed's south edge up to the birdbath is a walkable ramp — walk up it to the bath's rim. On tier two, two Grenadiers and a prone Sniper (glint before the shot) cover the climb; the brick steps up the two soil tiers are the way to flank them. On the rim, **hold E** next to Fern for 1.6 s. She gives you 6 rubber bands (weapon 3).
6. **Raid the convoy:** back east to the road's waypoint (pallets and crates at z ≈ −8): three Based, an Officer (pennant — kill him before he radios reinforcements), a Trooper, and two Balsa gliders strafing the road. Clear them.
7. **The leaf:** go to the torn end of the hose (x ≈ 15, z ≈ −17 — the green ridge that crosses the yard). A leaf sits at the start of the stream. **Stand on it**; it departs. Three molded Tans shoot from the bank. Ride to the drain by the hedge → mission complete → medals.

Par is 3:20. A first-time human, with none of that signposted, doesn't finish. That's Update 1's whole job.

---

## Update 1 — FAIR PLAY

**Theme:** a stranger can finish the Backyard hint-free, feels the Tans are beatable and honest, and the docs describe the game that exists. **Roadmap:** completes M2's exit test. **Effort:** ~2 sessions.

### 1.1 Objective guidance (diegetic, landmark-first)
- **Olive's radio pin:** a slim vertical light column + a floating chalk arrow at the active objective's target (region centre, POW, leaf start, encounter centroid), visible over grass, fading inside 4 u. Distance shown in the objective line. Default on; toggle in options.
- **Landmark compass strip** under the objective line: landmark names slide with camera yaw; the pin's bearing shows on it. Honors map-bible law 5 (navigate by named landmarks) instead of a minimap.
- **Objective text names a landmark and a direction:** "Find the road — east, past the Jungle." Every objective in every blueprint gets this form.
- **The trail becomes visible:** rubber bands ⌀1.0 u, standing on edge, slow emissive pulse; picking one up toasts "Fern passed here" and counts toward a small "trail" bonus.
- **Climb hints — the kid's chalk:** a new kit sub-family (`chalk_arrow`, `chalk_x`, `chalk_rungs`): chalk arrows at the rake's foot and on each brick; chalk rungs drawn along the rake. Kid-logic (law 2) *and* readable.
- **First-time prompts:** one-shot contextual hints (aim on first enemy sighting, cook on first grenade, crouch on first grass, hold-E near a POW, "3" when the sniper unlocks). Never repeated; dismissible; off after the tutorial map exists.

### 1.2 Perception overhaul — awareness, not coin flips
- **Awareness meter per unit, 0→1**, gained per second = `base 0.9 × viewCone(110° full, 180° at half) × distanceFalloff (1.0 at ≤6 u → 0.15 at sight range) × stance (still 0.6 · crouch 0.5 · walk 1.0 · sprint 1.4) × (1 − concealment)`; decays at 0.25/s unseen.
- **Ladder of states:** `idle` → **suspicious** at 0.35 (turn to face, "?" pip, look for 3 s, molded units pivot slowly) → **alert** at 0.7 (call out — *only now* does the encounter learn, with a 1.2 s delay and only units within 14 u) → **combat** at 1.0.
- **Hearing:** gunfire makes units *suspicious* toward the sound (investigate), never combat. Radius by weapon — the cap pistol stays the loud one on purpose (its design identity).
- **First-shot grace:** 0.9 s after entering combat before firing; first two shots +50% spread; based units always show their glint wind-up first.
- **Ambush pockets** rise (0.9 s) into *suspicious*, not combat; spawn-on-region-enter units spawn idle, facing their lanes/patrol points, not the player.
- **Losing you:** no line of sight for 4 s → back to suspicious at last-seen point; 10 s → idle.
- **Awareness HUD:** a small eye icon (hidden / suspicious / spotted) so the system is learnable in the first minute. Option to hide later.
- **Acceptance (new `tools/stealth.mjs` gate):** a bot walking the golden path at walk speed through grass reaches within 8 u of an idle pocket before being spotted in ≥70% of runs; a stationary player in the open at 20 u takes ≥2.5 s to reach combat; after a kill from concealment, ≤50% of the pocket reaches combat within 5 s.

### 1.3 Difficulty, pacing, options
- **Checkpoints on every objective completion** (not only region entry); respawn restores the encounter state of the *current* objective only.
- **Economy pass:** +1 ammo cache at the Gnome, glue at every pocket exit, bands 8 per pickup; E_convoy = 3 Based + Officer + 1 Trooper with gliders 20 s apart (was 12).
- **Minimal options panel (Esc):** master/SFX/music volume, mouse sensitivity, invert Y, reduced flash, **Plastic Padding** (damage ×0.6 — the guardrail-sanctioned accessibility modifier, not a difficulty mode).
- **Death lines** stay; add a "you were killed by …" line so deaths teach.

### 1.4 Controls honesty
- Implement **dive-topple**: `divedInto` within 1 u of a molded Tan → `topple()`; plastic clack + camera nudge.
- **One controls table, one source:** `docs/controls.md` is authoritative; the HUD help panel and the briefing overlay render from the same list (a tiny shared module), so docs and game can't diverge again. Columns: *verb · key · status (built/planned)*.
- Crouch documented as **C** (Ctrl accepted); "vault" reworded; weapon wheel marked *Planned — Update 2*.

### 1.5 Instrumentation & gates
- **Telemetry** (local only): deaths with position + killer type, time per objective, shots/hits per weapon, spotted-events with distance — shown on the tally and dumpable as JSON (`?telemetry`) for playtest debriefs.
- **`mission.mjs` "no-teleport" mode:** the bot follows *the radio pin* with the autopilot instead of teleporting — proving the guidance chain is complete and machine-followable end to end.
- **`stealth.mjs`** per 1.2. **Exit test (05/M2):** a stranger finishes hint-free, ≤3 deaths, ≤2× par, and says some version of "I used to do this with my toys."

---

## Update 2 — PLASTIC

**Theme:** the game becomes unmistakably itself — the material, the motion, the light, the sound. **Roadmap:** M1 proper (the two identity bets) plus the PM's graphics pass. **Effort:** ~3 sessions.

### 2.1 Pose-snap, the full library
Fifteen molded poses (idle, run A/B, aim, aim-crouch, kneel, throw, hit-react, topple, glued, prone, vault, dive, melt-slump, victory); snap rate by state (locomotion 9 fps, hit-react 12, idle breathing 3); 1-frame smears on fast transitions; enemies use kneel/throw/aim properly; player crouch-walk and the **vault** verb (the pose that finally earns the word in the docs).

### 2.2 Plastic material v2
Procedural mold-seam lines along limb centrelines, flash remnants on edges, sink marks, recycled-pigment swirl; paint-chip **damage masks** per stage (vertex-colour driven) replacing the colour-darken hack; vertex-shader **melt slump** replacing the scale hack; fake-SSS rim term; team colours and per-unit tint variance (no two Tans exactly alike).

### 2.3 The graphics pass
Post stack (subtle bloom, vignette, per-map colour grade, ACES retuned); shadow quality (tighter cascade or two-split CSM; contact shadows for props); **grass v2** (thinner blades, density LOD by distance, gusts driven by the hazard scheduler so sprinkler and wind read); sky and time-of-day per map (Backyard = late afternoon gold); ground detail (dirt patches, clover, hose-drip wet patches); **Backyard P4 dressing pass** to its blueprint kit manifest; prop instancing + region culling; real-GPU perf telemetry with a 60 fps budget assert on integrated graphics.

### 2.4 Combat feel
Hit-react flinch pose and hitstop-lite; damage-stage VFX (smoke wisps at Critical); impact decals (BB dents in cardboard, pins in cork); grenade smoke + toppling debris; ragdoll-lite tumble for topples and knock-backs; shatter pieces per body part; muzzle-flash sprites and tracer polish; **weapon wheel with slow-time** (Q hold → wheel, time to 20%); shoulder swap; aim-assist retune with a controller in hand.

### 2.5 Audio v2
Kazoo-mumble barks for Tans and Greens (phoneme-shaped, never words); Olive's radio through a compressor/band-pass with squelch; music **states** (explore / suspicious / combat / victory) on the marching theme; positional occlusion-lite; the **Giants** ambience bed per map (distant TV, footfall subs, a muffled voice that resolves to nothing).

### 2.6 Toy-world presence
Dog-run dust and grass flattening along its track; sprinkler droplets with a rainbow at the right sun angle; leaf-ride splashes; a bird landing on the birdbath between fights; **the Kid's shadow** passing once per mission (quakeShadow variant with a muffled hum) — law 3 made visible.

**Exit test (05/M1):** a 60-second clip is identifiable as this game and no other; pose-snap judged charming by a non-builder; 60 fps on an integrated GPU across the Backyard.

---

## Update 3 — OPEN THE HOUSE

**Theme:** from one map to a campaign — the frame, the systems the next maps need, and the first two of them. **Roadmap:** M3. **Effort:** ~4 sessions.

### 3.1 The campaign frame
**The toy bin hub:** mission select with medals and marble counts, the marble gallery (skins: copper, glow-in-the-dark, unpainted prototype), continue/replay; **saves** (localStorage: progress, medals, marbles, options); full options; briefing → play → tally → bin loop.

### 3.2 Map 1 — The Sandbox (the tutorial the slice revealed it needs)
Built to its blueprint; teaches every verb in isolation — move, aim, cook a grenade, crouch in cover, **the awareness system** (a drill against blindfolded cardboard Tans, then real ones), climbing (chalk arrows introduced here), rescue (one generic POW) — before the raid turns it real. Reuses the Backyard kit; 3 new heroes.

### 3.3 Map 4 — The Kitchen Counter
Vertigo rules (floor = lost-death respawn), new kit (canister tins, dish rack with translucent shatter plates, toaster launch, pot-handle bridge, spice rack), the **Water Pistol** (soak op vs glue and cardboard), **Minesweeper** and **Kneeling Bazooka Man**, burner and faucet hazards, and the **first DYNO-MITE fight** (bespoke boss FSM, solved by the burner cycle).

### 3.4 Water tech spike
`waterLevel` op: rising plane, buoyant props, drown-line respawn, route emergence — proven standalone two maps ahead of the Bathroom (per 06 §5).

### 3.5 Input & accessibility
Gamepad parity with rebinding; aim assist by device; full accessibility set (reduced flash, colour-blind team tints verified with a simulation pass, Padding, hold-to-toggle options).

### 3.6 Pipeline hardening
Kit registry consistency unit test (dims ±2%, walkable tops, cover bands); route-walk and mission gates in **CI** (headless Chromium in GitHub Actions on every push); blueprint traceability lint (every ID in a def exists in its blueprint and vice versa).

**Exit test (05/M3):** a three-mission campaign loop (Sandbox → Backyard → Kitchen) persists across reload in a fresh browser profile; the Kitchen passes P1–P3 gates; the studio makes the **go/no-go call on maps 5–8** with three maps in hand.

---

## Sequencing, and why this order

1. **FAIR PLAY first** because the slice's verdict is unreadable until strangers can finish it — and because a perception model that *reads* is the foundation the tutorial (3.2) will teach. Everything here is systems the whole campaign inherits.
2. **PLASTIC second** so every map built afterwards is born with the identity, not retrofitted. The PM's graphics pass lands here, once, on the map that already works.
3. **OPEN THE HOUSE third** — committing to content only after the game is fair and looks like itself.

Each update ships as a new `plastic-platoon.html` single file and a tagged commit, with its gates green and a short playtest note.

## PM decisions needed

1. **Objective marker style** — light column + chalk arrows (recommended: beam for far, chalk for near), or chalk only (purer, riskier).
2. **Awareness eye icon** — on by default (recommended for Update 1), or diegetic-only (Tans' "?" pips and barks).
3. **Options panel now** in Update 1 (recommended — the slice can't be playtested by strangers without sensitivity and volume) vs. holding it for Update 3.
4. **Difficulty philosophy** — confirm the guardrail: one tuned difficulty + Plastic Padding, no modes.
