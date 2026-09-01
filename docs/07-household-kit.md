# 07 — The Household Kit

The shared prop library every map is assembled from. Each entry is a **factory recipe**: a `KitProp` in the registry with canonical dimensions (real cm ÷ 5.4 — see 06 §1), a collider spec (boxes/cylinders), a primitive-built mesh recipe with variants, and **gameplay affordances**. Blueprints reference props by Kit ID; the instancer renders each (kit, variant-bucket) as one InstancedMesh.

Budget rules (from the map bible): the kit holds ~45 hero props total; **each map may introduce at most 8 new hero props** (its blueprint names them); everything else on a map is reuse + dressing.

Affordance legend: `CC`/`SC`/`BW` = crouch/stand cover/blocking wall (heights per 06 §2) · `WT` = walkable top · `HOP` = jump-mount step · `RAMP` = lean-ramp legal · `XL` = scale-seller class · `FLOAT` = buoyant on waterLevel planes.

## A. Structural & terrain (the big shapes fights happen on/around)

| Kit ID | Object | Real (cm) | Units (W×D×H or ⌀×H) | Affordances | Notes / variants |
|---|---|---|---|---|---|
| `book_hard` | Hardcover book | 24×16×4 | 4.4×3.0×0.74 | WT, HOP, CC lying | color/thickness variants; stacks = stairs & plateaus |
| `book_paper` | Paperback | 18×11×2 | 3.3×2.0×0.37 | WT, auto-step | splayed-open variant = tent/ramp |
| `box_cereal` | Cereal box | 30×20×7 | 3.7×1.3×5.6 | BW, WT (lying) | THE building. Torn-corner variant = enterable (cut windows per fortification kit); invented brands only |
| `box_shoe` | Shoebox | 33×19×12 | 6.1×3.5×2.2 | BW, WT roof, HOP via lid | lid ajar = ramp; separate `box_shoe_lid` (6.3×3.7×0.15, WT) |
| `box_tissue` | Tissue box | 23×12×9 | 4.3×2.2×1.7 | SC, WT | oval mouth = one-way drop-in cache |
| `carton_milk` | Milk carton | 9×9×25 | 1.7×1.7×4.6 | BW, tower | roof peak; watchtower silhouette |
| `carton_egg` | Egg carton | 30×10×7 | 5.6×1.85×1.3 | CC lattice, WT rim-walk | 12-crater trench-scape — premade WW1 terrain, the kit's best cover lattice |
| `tin_canister` | Flour/sugar tin | ⌀16×18 | ⌀3.0×3.3 | BW, WT (lidded) | the Canister District silo; label variants |
| `pot_flower` | Flower pot | ⌀15×14 | ⌀2.8×2.6 | BW, WT rim ring | inverted variant = dome bunker with drain-hole skylight |
| `colander` | Colander | ⌀24×12 | ⌀4.4×2.2 | dome cave, XL | interior lit by hole-pattern light shafts — signature interior |
| `truck_dump` | Toy dump truck | 30×15×15 | 5.6×2.8×2.8 | XL, WT bed, HOP wheels | Sandbox leviathan; tilting-bed set piece |
| `boot_rain` | Rain boot | 25×10×23 | 4.6×1.85×4.3 | XL, interior shaft | lying variant: crawl-in cave (marble den) |
| `slipper` | Slipper | 26×9×6 | 4.8×1.7×1.1 | WT, interior cave, RAMP heel | soft: silent floor inside |
| `towel_mass` | Towel/fabric wedge | ~40×30 | 7.4×5.6×1–3 | WT, RAMP, soft | parametric lumpy wedge; also `sock_mass` (6.5 long zeppelin) |
| `melon_fort` | Watermelon (carved) | ⌀25×35 | ⌀4.6×6.5 | XL, BW, interior arena | finale fortress; rind ramparts WT; pink cavern interior |

## B. Cover & fortification (the kid staged these — ≥50% of pocket cover)

| Kit ID | Object | Real (cm) | Units | Affordances | Notes |
|---|---|---|---|---|---|
| `domino` | Domino on end | 4.8×2.4×0.75 | 0.44×0.14×0.89 | CC | THE sandbag; topples on bazooka splash (comedy + cover destruction) |
| `box_juice` | Juice box | 10×6×4 | 1.11×0.74×1.85 | SC on end, CC lying | pallet-stack variant = kid-built wall segments |
| `stick_popsicle` | Popsicle stick | 11.4×1×0.2 | 2.1×0.19×0.04 | — | lashed-lattice variants: barricade (CC, 0.9 tall), ramp shingle, picket |
| `matchbox` | Matchbox | 5×3.5×1.5 | 0.93×0.65×0.28 | auto-step, CC on side | doubles as the ammo-cache pickup prop |
| `block_alpha` | Alphabet block | 4 cube | 0.74 | HOP, CC | letter faces; the standard kid-stacked stair unit |
| `can_soda` | Soda can | ⌀6.6×12.2 | ⌀1.22×2.26 | SC, WT | lying variant (⌀1.22, WT, HOP); crushed variant (0.4 tall, auto-step); invented liveries |
| `cup_mug` | Mug | ⌀8×9.5 | ⌀1.48×1.76 | SC, WT rim, handle HOP | handle is the step up |
| `jar_baby` | Baby-food jar | ⌀6×8 | ⌀1.1×1.5 | SC, WT lid | filled variant (washers/screws) for the avalanche gag |
| `bottle_spice` | Spice jar | ⌀4×10 | ⌀0.74×1.85 | SC (thin) | rack rows = colonnade fights |
| `bottle_condiment` | Ketchup/mustard | ⌀6×22 | ⌀1.1×4.1 | BW, landmark-ish | picnic district pillars; drip hazard dressing |

## C. Routes & bridges (how bands connect — every A-band transition uses these or furniture)

| Kit ID | Object | Real (cm) | Units | Affordances | Notes |
|---|---|---|---|---|---|
| `ruler` | Ruler | 30×3×0.3 | 5.6×0.56×0.06 | WT bridge | THE footbridge (pencils are rails/décor — too narrow to walk, per 06 audit) |
| `pencil` | Pencil | ⌀0.7×19 | ⌀0.13×3.5 | RAMP (paired), rail | leaning-pair ladder variant; never a lone bridge |
| `brush_tooth` | Toothbrush | 19×2.5 | 3.5×0.46 | RAMP | bristle end = grippy top step |
| `comb` | Comb | 13×3 | 2.4×0.56 | RAMP, grate | teeth read as ladder rungs |
| `spoon_fork` | Utensils | 18 | 3.3 | WT (spoon bowl = platform), RAMP | fallen-utensil bridges between benches |
| `cable_charger` | Charger cable | ⌀0.35, long | ⌀0.065 × n | RAMP (against furniture) | draped catenary visual, stepped collider |
| `track_hotwheels` | Toy car track | 30×4.5 | 5.6×0.83 | WT ribbon | the Tan convoy road; bank/curve variants |
| `track_train` | Train rail + engine | gauge 4; engine 20×7×8 | 0.74 gauge; 3.7×1.3×1.5 | movePlatform ride | bedroom loop; engine top WT |
| `spool_wire` | Wire spool | ⌀10×8 | ⌀1.85×1.5 | WT drum, rolls | firecracker-fuse spool at the picnic |
| `drawer_step` | Open drawer cascade | per furniture | risers ≤1.2 | HOP stair | shell-fixture pattern more than a prop; god's own switchback |

## D. Interactive & hazard props (paired with scheduler ops — 06 §5)

| Kit ID | Object | Units | Op pairing | Notes |
|---|---|---|---|---|
| `toaster` | Toaster | 5.2×3.3×3.5 | movePlatform (lever launch) | XL; the Kitchen's summit route |
| `trap_mouse` | Mousetrap | 1.85×0.83×0.19 | movePlatform (snap launcher) | creak telegraph; launches props/Tans/you |
| `torch_flash` | Flashlight (propped) | ⌀0.93×3.3 | lightVolume (searchlight) | the stolen Map-1 batteries live here (Bedroom) |
| `mouse_windup` | Wind-up mouse | 1.5×0.74×0.74 | spawnWave (Cat distraction) | single-use, closet-found |
| `boat_tub` | Toy boat | 2.8×1.1×0.93 | FLOAT | duck-patrol platform |
| `barge_freighter` | Cargo barge toy | 6.5×2.5×2.0 | FLOAT, WT deck | Bathroom boss vessel; container stacks = battery crates |
| `duck_rubber` | Rubber duck | 1.85×1.67 | FLOAT, WT | neutral, serene, drifts on its own current — sculpt-list |
| `sponge` | Sponge | 2.0×1.3×0.56 | FLOAT, WT, soft | the archipelago unit |
| `soap_bar` | Soap | 1.67×1.0×0.46 | slick zone | comedy footing on the tub rim |
| `pan_paint`/`can_paint` | Paint can | ⌀3.0×3.3 | slick (drip ring) | workbench pillar with hazard skirt |
| `jar_jam` | Jam jar | ⌀1.5×2.4 | ant-column re-route (shoot open) | the Picnic's aimable third army |
| `batt_aa`/`batt_c`/`batt_9v` | Batteries | ⌀0.26×0.93 / ⌀0.48×0.93 / 0.89×0.48×0.31 | pickup/objective | the MacGuffin family; crate = blister-pack 1.1×0.93×0.28 |

## E. Landmarks & XL scale-sellers (sculpt list marked ✱ — the only non-primitive meshes)

| Kit ID | Object | Units | Role |
|---|---|---|---|
| `gnome` ✱ | Garden gnome | 6.5 tall | Backyard god-statue; rally point |
| `birdbath` | Birdbath | ⌀5.6 bowl, 8.3 tall | Backyard crow's nest (A2) |
| `bucket_castle` | Bucket + sand towers | ⌀3.3×3.0 | Sandbox keeps |
| `shovel_sand` | Sand shovel | 9.3×1.85 | Sandbox ramp highway |
| `rack_dish` | Dish rack + plates | 6.5×4.6×5.6 | Kitchen mountain range; plates ⌀4.8 vertical ridges |
| `plane_balsa` | Balsa glider | wingspan 8.3 | strafer + Workbench wreck (Spitfire model variant 6.5) |
| `dino_boss` ✱ | DYNO-MITE | 7.4 tall | recurring enforcer |
| `cat` ✱ | The Cat | 4.6 shoulder | Bedroom kaiju |
| `key_house` | House key + ring | 1.1×0.46 + ⌀0.56 | floor-clutter scale anchor |
| `giant_artifacts` | Sock zeppelin, homework, lead soldier, coin (⌀0.44), dice (0.30), crayons (0.19×1.67), jacks | — | the lore-and-scale dressing family; lead soldier ✱ (one pose, salutes) |

## F. Shell fixtures (per-map bespoke, built by the shell builder, not kit instances)

Room: floors (plank/tile/rug textures), walls + skirting, outlets, window frames, nightlight, door gaps. Kitchen: counter mass, stove + burner rings, sink basin + faucet monolith, backsplash ledges, spice rack. Bathroom: tub shell + rim, overflow-drain grotto, toilet tank, tile. Garage: bench top + legs, pegboard wall + hooks (hop-ledge grid, 0.74–1.2 spacing), vise, worklight. Outdoors: fence pickets, house siding + downspout + gutter channel, soil terraces, stepping stones, sandbox frame. Furniture masses (bed, dresser, couch) with under-zones. Fixtures follow the same honest-cm rule; they're just too map-specific to registry.

## G. Materials & palette system

Seven shared materials, tinted per variant — **props never invent materials**: `PAPERBOARD` (matte 0.85 rough; canvas-printed invented labels — no real brands, invented words only, per IP rules), `PLASTIC_TOY` (gloss 0.3, saturated — same family as soldiers so the toy-nation props feel kin), `METAL_KITCHEN` (0.35 rough, 0.6 metal), `WOOD_WARM` (plank/pulp variants), `FABRIC_SOFT` (0.95 rough, slight sheen), `GLASS_CHEAP` (opacity 0.35 + gloss — no refraction), `RUBBER_MATTE`. Label/graphic textures are procedural canvas recipes (stripes, dots, invented wordmarks like OAT-O'S, ZAP!) baked once per variant bucket.

## H. Registry contract (what a KitProp is in code)

```ts
interface KitProp {
  id: string;
  dims: THREE.Vector3;                    // canonical, from this doc
  colliders: ColliderSpec[];              // boxes/cyl-AABBs in local frame
  affordances: { cover?: 'CC'|'SC'|'BW'; walkableTop?: boolean;
                 float?: boolean; soft?: boolean; slick?: boolean };
  variants: VariantSpec[];                // color/label/damage buckets
  build(variant): { geo, mat };           // primitives + canvas textures only
}
```

Consistency gates (checked by a registry unit test, not by eyes): every `dims` matches this doc's table ±2%; every walkableTop has a collider face at its top; every cover class height lands in its 06 §2 band. **The kit test scene** — all props on a floor grid with a metric ruler — is the M0 arena's replacement and the visual regression baseline.
