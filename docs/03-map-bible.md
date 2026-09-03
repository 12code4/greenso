# 03 — The Map Bible

> **Superseded as world structure (2026-09-03):** the eight campaign maps below now live inside one house; see [`docs/10-house-atlas.md`](10-house-atlas.md). The scale fantasy, the seven laws and the encounter grammar in this document still bind.

**This is the game's center of gravity.** Everything else in the plan exists to make these spaces playable. The brief from the studio: maps that are creative, thoughtfully crafted, and *encapsulate childhood fun*. This document is the contract for what that means in practice.

## Scale: the one number everything hangs on

Classic toy soldiers are **54 mm** — 1:32 scale. We adopt 1:32 exactly and never cheat it, because honest scale is what sells the fantasy. One in-engine unit = one soldier height.

> **⚠️ Scale note (2026-08-29):** This document is the *design* bible — its "reads as" column and some early region sizes are evocative human-scale framing, not engine numbers. The **authoritative build constant is `units = cm ÷ 5.4`** and the authoritative conversion table + region dimensions live in [`06-level-architecture.md`](06-level-architecture.md#1-canonical-scale-the-audit) and the per-map [`blueprints/`](blueprints/). Where this doc's numbers differ from 06 or a blueprint, **06 and the blueprints win** (they corrected an early ×32.4 vs ÷5.4 conflation and trimmed a few oversized footprints). Read this doc for the *what and why*; build from 06 + the blueprints.

The conversion table below is the level designer's ruler for *imagining* a space; use the 06 table for building it:

| Household thing | Real size | At soldier scale | Reads as |
|---|---|---|---|
| Lawn grass | 6–9 cm | 2–3 m | Dense jungle canopy overhead |
| Stair riser / step | 18 cm | ~5.8 m | Unclimbable cliff wall (needs a route) |
| Kitchen counter height | 90 cm | ~29 m | High mesa; falling is lethal |
| Dining chair seat | 45 cm | ~14 m | Mid-tier platform |
| Garden hose bore | ~13 mm | ~40 cm | Crawlable tunnel (crouch) |
| Cereal box | 30 cm tall | ~10 m | A building. Interiors possible when torn |
| Bathtub rim | 60 cm | ~19 m | Harbor cliff over an ocean |
| Hardcover book | 4 cm thick | ~1.3 m | Chest-high cover / stackable stairs |
| Pencil | 19 cm | ~6 m | A felled log bridge |
| Shoebox | 20 cm tall | ~6.4 m | A bunker with a lid |
| Soda can | 12 cm | ~3.8 m | A watchtower / silo |
| LEGO-style brick | 1 cm | ~30 cm | Knee-high rubble; ankle-breaker fields |
| The Cat | 25 cm at shoulder | ~8 m at shoulder | Kaiju |

**Player metrics** (drive all layout): walk ~4 u/s, sprint ~7 u/s, jump clears 1.2 u vertical / 2.5 u gap, vault ≤ 0.8 u, crouch clearance 0.55 u. A hardcover book (≈1.3 u) is therefore *just* not jumpable — you vault via something, and that "something" is level design.

## Design language — the seven laws

1. **Every map is a real place first.** Author the room honestly (where a toaster actually sits, where dust actually gathers), *then* find the battlefield in it. Never arrange props for gameplay in ways a real household would never produce — the moment the kitchen stops being a believable kitchen, the flicker (in-fiction ↔ out-of-fiction reading) dies.
2. **A kid arranged the fortifications.** The *military* layer on top of the honest room — sandbag lines of dominoes, a cereal-box HQ with cut windows, checkpoints made of juice-box pallets — should look like an eight-year-old set it up. Slightly wrong, totally sincere. This is how we get gameplay-shaped cover without breaking law 1.
3. **Verticality is the terrain.** Households are stacked worlds: floor country, chair-seat midlands, counter/table highlands, shelf peaks. Every map has at least three altitude bands and at least two honest routes between bands (a hanging phone-charger cable, stacked books, an open drawer staircase — drawers pulled out in a cascade are god's own switchback).
4. **One hazard-on-a-schedule per map.** Sprinkler timers, toaster ejections, the robot vacuum's cleaning route, tub faucet surges. Rhythmic, learnable, announced by audio. It turns terrain into a puzzle without any puzzle UI — and it's how the Giants stay present as weather.
5. **Landmark navigation, kid logic.** No minimap in v1. Wayfinding via unmissable landmarks named the way a kid names them (briefings use them: "rally at Gnome"; "the Blue Tower" = the dish-soap bottle). Every position on a map should see at least one landmark. Test: a player should be able to give directions to a friend using no military words.
6. **Secrets live where small things live.** Marbles and glue caches go where things *actually* get lost: inside the rain boot, under the colander, in the piano's pedal well, behind the paint cans. The reward for reading the space like a child who knows where lost things go.
7. **Scale check every 10 meters.** From any point, something in view must scream *you are tiny*: a Giant artifact (a single house key as big as a door; one sock as a felled zeppelin), grass overhead, the underside of furniture. The moment a sightline could pass for a normal-scaled game, redress it.

### Encounter grammar

- Fights are staged in **pockets** (readable arenas ~30×30 u max) connected by quieter traversal — pacing valleys where the space itself is the content. Density target: something worth engaging every 20–30 seconds of movement.
- Molded (based) Tans **own lanes**; articulated Tans **own pockets**; powered units **break the pocket rules** and force repositioning. Compose fights like that in every arena and combat stays legible with a small AI.
- Hazard-on-a-schedule intersects at least two arenas per map (fighting *during* the sprinkler pass is a different fight).

### Production reality: the Household Kit

Maps are assembled from a shared, instanced prop kit (see tech doc): ~40 hero props (toaster, colander, boots, books, cans, bricks, hose...) + per-map dressing. Budget rule: **each new map may introduce at most 8 new hero props**; everything else reuses the kit. This is the only way 8 maps fits this studio.

---

## The Campaign Eight

Format per map: fantasy → the space → altitude bands → hazard schedule → mission flow → set pieces → landmarks → secrets note.

### Map 1 — THE SANDBOX · "Basic Draining"

*Tutorial assault · unlocks: core verbs, grenade*

**Fantasy:** Boot camp in the backyard sandbox — a walled desert nation the size of a county, with buried ruins (last summer's toys) and sandcastle fortifications.

**The space:** A 1.2×1.2 m cedar-framed sandbox → a 40×40 u arena bounded by sheer plank walls (the "Frame Mountains", with knothole caves). Central sandcastle complex with bucket-molded keeps; a half-buried dump truck as a rusting leviathan; a plastic shovel forming a natural ramp highway; the far corner flooded from yesterday's rain (the "Gulf").
**Altitude:** sand floor → castle ramparts (~4 u) → shovel-handle ridge and frame-top rim (~8 u; the rim is the sniper's tour of the whole map).
**Hazard schedule:** none yet — this map teaches rhythm-free basics; the "hazard" slot is used by scripted Giant weather (a shadow passes; the whole map quakes as a Giant walks by, teaching the telegraph grammar safely).
**Mission flow:** Pure training against pop-up cardboard targets (Olive narrating drills) → real Tan raiding party breaches the knothole caves mid-drill → running fight through the castle → they escape over the rim with the flashlight batteries. Tutorial becomes inciting incident; no difficulty spike, all molded-tier enemies.
**Set piece:** The buried dump truck shifts when climbed — a slow, groaning terrain change that opens the bed as a fort. Teaches "the terrain moves" gently.
**Landmarks:** the Castle, the Truck, the Shovel, the Gulf, the Knotholes.
**Secrets:** a marble seam *inside* a bucket keep; a glue cache in the truck's cab (visible through the windshield from the ramparts — taught sightline).

### Map 2 — THE BACKYARD · "The Green Sea"

*Recon + rescue · unlocks: Rubber-Band Sniper · the M2 vertical slice map*

**Fantasy:** The lawn as triple-canopy jungle warfare. Navigation by landmark spires above the grassline; ambushes in the blades; a river you can ride.

**The space:** A 3×4 m stretch of backyard → ~100×130 u, the campaign's widest map. Terrain zones: mowed lawn (open steppe, short cover), unmowed jungle (2–3 u grass, sightlines in tunnels and clearings), the flowerbed highlands (dark soil terraces, flower canopy), the Hose — a live garden hose: crawl its coils as tunnels where it lies, walk its top as a highway where it rises, and one torn section leaks a stream that floats a leaf downhill (the map's fast-travel ride). Stepping-stone path = boulder chain across the mowed steppe. The Gnome watches everything.
**Altitude:** soil/lawn floor → hose-top and stone-top mid (~2–3 u) → flowerbed terraces and the birdbath rim (~15 u, reached via a leaning rake handle; the map's crow's nest).
**Hazard schedule:** **the sprinkler**, on a 90-second cycle, sector by sector — announced by pipe-knock. Its pass flattens grass (sightlines open!), extinguishes fire, sweeps light units into the drainage furrow. Fights change shape twice a cycle. Secondary roamer: the Dog, a distant neutral giant this map — its fetch runs crater the steppe on a loose timer, telegraphed by jingling tags.
**Mission flow:** Track Fern's last patrol through the jungle (following rubber bands stuck in trees = her breadcrumb trail) → discover the Tan battery convoy road cut through the grass (a hot-wheels track!) → rescue Fern from the glue point at the Gnome's base → with her overwatch from the birdbath, raid the convoy waypoint and escape on the leaf down the hose-stream.
**Set pieces:** first Balsa Interceptor strafing runs over the steppe (shadow telegraph); the leaf ride finale — the studio's zoom DNA, 20 seconds of steering a leaf down a curving stream under fire.
**Landmarks:** the Gnome, the Birdbath, the Hose, the Stones, the Bed (flowerbed), the Faucet.
**Secrets:** marble inside a rain boot lying on its side (its shaft is a dark crawl); the Dog's buried bone marks a glue cache; one marble visible only from the leaf ride — grab requires a jump at speed.

### Map 3 — THE GUTTER RUN · "The Long Way Up"

*Linear infiltration · storm mission · unlocks: nothing (breather for the arsenal; the map is the star)*

**Fantasy:** Get inside the house before the storm hits, via the rain gutter system — a vertical linear gauntlet that floods behind you. The campaign's pure-traversal palate cleanser.

**The space:** The downspout and gutter channel of one house corner → a linear ~200 u route, played in escalating rain. Sequence: climb the downspout interior (a dark 1.5 u-wide vertical shaft with debris ledges — helicopter-seed propellers, twig jams, a lost shuttlecock) → emerge into the open gutter channel (a half-pipe highway along the roof edge, wind gusts, house lights glowing below through the rain) → enter through the cracked bathroom window frame.
**Altitude:** the whole map *is* altitude — a continuous climb from ground to roofline (~120 u of gain, presented in safe stages; falls land you on the previous stage's debris jam, not death — this map is tense, not punishing).
**Hazard schedule:** **rain surges** — every 60 seconds a wave flushes the channel (audio: thunder → gurgle upstream). Grab a fixed point (twig jams, leaf anchors) or be washed back one stage. In the final stretch the schedule accelerates. Tan presence is light: a doomed Tan expedition is climbing too — sometimes you fight over an anchor point as a surge approaches, sometimes you watch them get flushed past you, saluting.
**Set pieces:** the leaf-boat strait — one gutter section is dammed and flooded calm; cross by pushing off in a curled leaf between surge windows. The window entry: prying the screen as lightning strobes the whole map monochrome.
**Landmarks:** linear map, so landmarks are stages: the Grate, the Seed Jam, the Halfpipe, the Dam, the Window.
**Secrets:** a marble in the shuttlecock's cone; the "lost pilot" — a vintage lead soldier (not plastic; an ancestor) wedged in the seed jam, saluting. Lore object, gallery unlock.

### Map 4 — THE KITCHEN COUNTER · "Countertop Interdiction"

*Sabotage · unlocks: Water Pistol · first powered-tier contact*

**Fantasy:** The counter as a 29-meter mesa nation — a Tan supply corridor running its full length, fortified with kid-logic checkpoints. High-altitude warfare where falling is the real enemy.

**The space:** An L-shaped run of counter, sink continent at the corner → ~140 u of mesa top plus climbing routes. Regions: the **Canister District** (flour/sugar/coffee tins = a city of silos, alleys between); the **Dish Rack** — a glass-and-steel mountain range, plates as vertical ridgelines, upturned mugs as bunkers, all of it *translucent* (fights through frosted glass silhouettes); the **Stove Gap** — the counter breaks at the stovetop: cross via the pot-handle bridge over a burner that may be ON (hazard schedule) ; the **Sink** — a steel canyon with a water level that changes, the drain a whirlpool dungeon (disposal switch = distant doom rumble), the faucet an overhanging chrome monolith; the **Toaster** at the far cape.
**Altitude:** floor is out of bounds (lethal fall, full stop — vertigo is this map's flavor); tile backsplash ledges and the spice rack (sniper galleries) sit above counter level; window sill above the sink = the summit, with the map's only sunbeam.
**Hazard schedule:** the **burner cycles** (tick-tick-tick-FOOM — the pot-handle bridge is safe cold, deadly hot, and the updraft when hot launches the balsa gliders that harass the Canister District); the sink **faucet drips** on a beat that slowly raises the basin level, changing which canyon routes exist.
**Mission flow:** Cut the supply line at three points: blow the string-and-pencil crane loading batteries at the sink edge → poison the flour dump (a sugar-tin bomb — kid logic sabotage) → hold the Canister District against the response wave. Then the map's turn: **DYNO-MITE** arrives — first powered-tier fight, staged in the Dish Rack where his bulk shatters the terrain plate by plate as you kite him into the Stove Gap for the burner cycle to solve what bullets can't.
**Set pieces:** the toaster — stand on the lever platform and an ally slams it: a *launch* to the window sill, the intended route to the summit and forever the map's best moment. The dish rack collapsing regionally during the boss.
**Landmarks:** the Silos, the Rack, the Gap, the Steel Canyon (sink), the Toaster, the Sunbeam.
**Secrets:** marble in the coffee tin (its lid is ajar exactly one crouch-height); the sunbeam sill is also the magnifier's first teaser — a scorch-drawn arrow pointing at a marble frozen in an ice cube in a forgotten glass (return trip after the faucet raises the level enough to reach it — cross-schedule secret, the map's deepest cut).

### Map 5 — THE BATHROOM · "Operation Rubber Duck"

*Naval assault · unlocks: Bazooka*

**Fantasy:** Porcelain fjords and a rising inland sea. The Tan battery freighter is crossing the tub while it fills — board it, sink it, and get off before the whole ocean goes down the drain.

**The space:** The bathtub and its coastline → the tub interior (~60×25 u oval sea with porcelain cliff walls), the rim ring-road, the toilet-tank highlands, the sink outpost, and the tile-floor lowlands connected by a fallen towel (a fabric glacier you can climb, the map's soft-landing zone). Naval layer: the water level **rises through the entire mission** (the faucet runs steady; the geography is on a clock — ledges drown, new boarding routes float into reach). Vessels: the Tan freighter (a cargo-modded toy barge), duck patrol boats (wind-up ducks with riflemen lashed on), soap-dish gun rafts, and your insertion craft, the *S.S. Soapdish*.
**Altitude/naval bands:** underwater is instant respawn at the last dry checkpoint ("plastic floats — face down"); water surface (rafts, floating cover: a sponge archipelago, a capsizing shampoo bottle); cliff shelves (the soap alcove, the overflow-drain grotto — a pirate cave that stays open at all water levels); the rim road and towel routes above.
**Hazard schedule:** **the surge** — every 75 seconds the faucet coughs a wave train across the sea (audio: pipe shudder), swamping rafts and repositioning every floating object; steam from the hot tap periodically fogs the eastern fjord (concealment that neither side controls).
**Mission flow:** Infiltrate via the overflow grotto → raft the sponge archipelago under duck-boat patrol → board the freighter mid-sea (grapple point: a bent bobby pin) → fight bow-to-stern through container canyons of battery crates → plant the firecracker charge in the hold → the sinking is the finale: freighter nose-down, cargo sliding, Tans abandoning ship, you riding a battery crate off the stern as the drain — *opened by the sinking ship crushing the plug lever* — begins to pull everything into its whirlpool. Escape up the towel as the sea drains under you, the whole map's geography reappearing in reverse.
**Set pieces:** the freighter boarding in the fog; the drain whirlpool consuming the map. **The bathroom is the campaign's structural showpiece: the only map whose terrain is fully time-based.**
**Landmarks:** the Duck (a giant rubber duck, serenely neutral, drifting on its own current — cover, elevator, and comic timing all in one), the Freighter, the Grotto, the Towel, the Faucet Heads.
**Secrets:** marble at the bottom of the sea — visible from the surface all mission, reachable only in the final 60 seconds as the water drains; the toothbrush cup holds a POW who has clearly been there since long before this war.

### Map 6 — THE BEDROOM AT NIGHT · "Under the Bed"

*Stealth-leaning rescue · unlocks: Flamethrower · the Cat's map*

**Fantasy:** The kid's bedroom at midnight — the campaign's dark map, the scary-safe childhood dark where the nightlight is a lighthouse and under-the-bed is genuinely another country. Doc Pickle is in the Tan POW camp down there. So is something else.

**The space:** The bedroom floor → ~120×100 u in three lighting nations: the **Nightlight Coast** (warm, safe, Green-held — the toy bin HQ makes a cameo as an actual location); the **Moonlit Steppe** (the rug: pale crossing ground, moon patches that move imperceptibly with the night, brick fields at the rug's edge — the classic sharp-brick scatter as 30 cm rubble that slows sprints and *clatters*, the noise mechanic's teeth); and **Under the Bed** (true dark: dust-bunny tumbleweeds, forgotten civilizations — a sock zeppelin crash site, a fossil sandwich plate, the missing homework — and the Tan camp lit by a stolen keychain LED). Above: the mattress overworld reached by the dangling charger cable, the desk lamp summit, the bookshelf cliff face with its ladder of spines.
**Altitude:** floor nations → bed-frame rails and open drawer switchbacks (~mid) → mattress plateau and desk (~30 u). The Kid sleeps on the plateau: terrain that *breathes*, turns over on a loose schedule (quake telegraph, routes open and close), and must never wake — a hard fiction rule, not a fail state; the Giants sleep through toy wars, and somehow that's the most childhood-true fact in the game.
**Hazard schedule:** **light itself.** Passing headlights sweep the room through the blinds every ~80 seconds (announced by distant engine), turning the Moonlit Steppe hostile-bright then re-dark; the flashlight the Tans stole in Map 1 is here, mounted as a sweeping searchlight tower over the POW camp. And **the Cat** — off-schedule, unscripted between set arenas: a patrolling kaiju that both armies hide from (all combat AI drops to hush when she's near; shared terror is the map's best joke and its stealth tutorial). She cannot be fought. She can be *fed* — the wind-up mouse in the closet buys ninety seconds of absence, once.
**Mission flow:** Land on the Nightlight Coast → learn noise/light rules crossing the brick fields → under-bed infiltration through dust-bunny cover to the camp perimeter → free Pickle (the searchlight must be dealt with: shoot the flashlight's hanging switch or re-aim it *at the Tan barracks*) → the Cat's arrival collapses the exfiltration into a running hush-then-sprint sequence through collapsing dark, Pickle's glue supplies lighting the route home.
**Set pieces:** the searchlight decision; the Cat's under-bed entrance (two green eyes opening in the dark where the map's back wall was assumed to be — the campaign's one earned scare, safe by tone, unforgettable by scale); the charger-cable climb past the sleeping Kid's hand, ten meters of held breath.
**Landmarks:** the Nightlight, the Rug, the Bricks, the Bed, the Lamp, the Camp Light.
**Secrets:** the homework (lore: it *was* eaten, partially — by whom is unresolved); a marble in the heel of the sock zeppelin; glow-in-the-dark paint scheme for Moss hidden in the closet — findable only during a headlight sweep, when it glows through a shoebox seam.

### Map 7 — THE WORKBENCH · "The Arsenal of Tan-ocracy"

*Factory raid · unlocks: Magnifying Glass · DYNO-MITE rematch*

**Fantasy:** The garage workbench as Tan military-industrial heartland: a pegboard cliff-city, a vise the size of a drawbridge, and a production line winding up tank after tank. The war's industrial horror map — all sodium worklight, oil, and iron — where the childhood-fun register shifts to *the workshop you weren't allowed in*.

**The space:** Bench top, pegboard wall, and under-bench floor → three stacked fronts. **Under-bench:** oil-drip swamps, paint-can pillar forest, the mousetrap minefield (pressure plates that telegraph with a creak; can be triggered deliberately to launch objects — or Tans). **Bench top:** the factory floor — a repurposed model-railway line moves pallets of tank chassis through assembly stations (winding crew barracks, battery bays, the QA firing range where fresh tanks shoot at Green silhouette targets); the vise, the plane-wreck (a half-built model Spitfire, its parts still on sprues like bodies on frames — Tan propaganda hangs from it), jars of screws as shrapnel silos. **Pegboard:** the vertical city — hooks as crane arms, hanging tools as swaying platforms (the level's moving-platform vocabulary: a swinging wrench is a pendulum ferry), climbing to the shelf where the worklight burns.
**Altitude:** under-bench → bench top → pegboard ascent → worklight shelf (~45 u total; the campaign's tallest fair climb).
**Hazard schedule:** the **worklight** is on a thermostat-like cycle — when it clicks to full it bathes the bench in a killing brightness for molded units' shadows and *powers the magnifying glass anywhere on the map's lit half* (the unlock arrives mid-map, and the map immediately teaches its geometry-of-light gameplay); the railway line runs on a fixed loop (ride it, mind the tunnel clearances — a pallet ride is the fast route between fronts, and the assembly stations are its toll).
**Mission flow:** Under-bench infiltration through the minefield → sabotage the winding crews station by station along the moving line (tanks stall mid-assembly; the line carries your handiwork forward visibly — factory maps must show consequence) → seize the battery bay → pegboard ascent under glider harassment to cut the worklight (the factory's power *and* its QA sun) → DYNO-MITE, rematch, on a bench top now dark, strobed only by the dying worklight's flicker and your own magnifier snaps — until the vise ends him. Half of him.
**Set pieces:** riding the assembly line through the tunnel of half-built tanks; the swinging-wrench pendulum crossing; the vise finisher (a held-interact crush with the campaign's most committed *CLACK*).
**Landmarks:** the Vise, the Line, the Spitfire, the Jars, the Board, the Light.
**Secrets:** a marble inside a baby-food jar of washers (shoot the jar: a thousand-washer avalanche, and the studio's physics budget's proudest moment); the "unpainted gray prototype" Moss skin waits on the highest pegboard hook; the Spitfire's cockpit holds the vintage lead pilot's flight log — he's the same ancestor from the gutter. He gets around.

### Map 8 — THE PICNIC TABLE · "The Fourth"

*Combined finale · Firecracker Satchel · everything, then Taupe*

**Fantasy:** Independence Day, dusk into night. The Tan Command has fortified the picnic table as the Volt Throne — the stolen battery cache enthroned in a citadel of paper plates and watermelon ramparts — while the sky itself goes to war. Every system in the game on one table.

**The space:** The picnic table top, benches, and the ground beneath → the campaign in miniature, deliberately: an under-table dark country (Map 6's rules), bench midlands connected by fallen-utensil bridges (Map 4's vertigo), the condiment district (ketchup/mustard bottles as the Silos' echo), the watermelon — a carved fortress with rind ramparts and a pink cavern interior — and the wire spool of firecrackers the Giants left dangerously close to the citadel. Off-table: the lemonade pitcher glints like an ocean it would take a sequel to sail.
**Altitude:** grass → benches → tabletop → the Throne (a tiered cake stand, batteries stacked like bullion, Taupe's pennant at the summit).
**Hazard schedule:** **the fireworks show** — the sky bombardment runs the whole mission on a real show's rhythm (crackle volleys, whistlers, the occasional table-shaking mortar), lighting the battlefield in colors, dropping sparks that start grass fires under the table, and *masking every loud thing you do*; plus the **ant column** — the third army marches on a fixed route to the dropped jam sandwich, consuming anything on its path, and can be re-routed exactly once by shooting the jam jar open at a place of your choosing. Aim the ants.
**Mission flow:** Ground assault at dusk with the whole rescued cast (Fern on overwatch from the pitcher rim, Sprout running ammo, Pickle's glue post under the table — the campaign's rescues become the finale's gameplay) → take the benches → breach the watermelon fortress (its cavern is the Tan command post; the pink dark, lit by LED lanterns, is the game's strangest and best interior) → tabletop siege under the fireworks → the ant gambit breaks the outer line → the Throne. **Taupe** fights from a candy-tin mech-throne with a fully-charged DYNO-MITE at heel: phase one on the cake stand tiers, phase two after the satchel charge sends the throne — and the batteries — avalanching across the table, DYNO-MITE overcharged and arcing, fought in a dark lit only by the finale of the fireworks show, which the Giants, oblivious gods, ooh and aah through.
**Ending:** the batteries go home to the drawer. The Greens stand down on the table's edge, watching the last shells bloom. Moss, to Sprout: *"Best war I ever fought."* Sprout: *"Which one was this again?"* Hold on the toys against the fireworks. A porch light comes on, enormous and warm. Someone is calling everyone in.
**Landmarks:** the Melon, the Throne, the Spool, the Bottles, the Pitcher, the Sandwich.
**Secrets:** the final marble is inside the watermelon, encased in the one bite someone took; finding all 40 marbles re-opens the map's quiet post-battle table at night — no enemies, fireworks over, one lead soldier standing at the table's edge, saluting. He made it here first. He always does.

---

## Beyond the Eight (backlog, not v1)

- **The Christmas Tree** — winter special: ornament climbing, tinsel ziplines, a train circling the trunk, present-fort siege. The obvious DLC-shaped map; deliberately saved.
- **The Aquarium Shelf** — glass, water lensing, a castle already inside. Naval map II.
- **The Desk** — homework country: pencil-cup artillery, keyboard terraces, the lamp as a day/night switch the *player* controls.
- **The Garden at Dawn** — the flowerbed as its own full map; bees as neutral air power.
- **The Car Floor** — the world moves, the geography tilts with every turn, French fries fossilize between seats. Weirdest pitch, biggest logistics.

## Map production order

Backyard (M2 slice — widest systemic coverage: outdoors, hazard schedule, rescue, all three enemy tiers' basics) → Sandbox (tutorial, cheapest, reuses Backyard kit) → Kitchen (vertigo + powered tier) → Bedroom (dark + stealth systems) → Bathroom (the water tech spike lives here — schedule it with slack) → Gutter (linear, short, reuses rain/water tech) → Workbench (heaviest bespoke kit) → Picnic (needs everything; last).
