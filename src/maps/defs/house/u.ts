// FLOOR U — THE UPPER FLOOR · "Up the Ladder". Transcribed from
// docs/blueprints/floor-U.md (the contract). Honest 1:32 scale: 1 u = 5.4 cm.
// x east, z south (north is −z), floor at y 0. Footprint x ∈ [−139, 139], z ∈ [−111, 111].
//
// The floor's defining feature: THE VOID. The living room below is vaulted to 96 u and
// 96 = this floor (G's y 50) + this ceiling (46), so there is NO FLOOR over x −59..61,
// z −31..49. The shell declares it as a `hole`; the collision world drops its implicit
// ground plane there, and `killY` catches anyone who goes over the landing rail.

import { MapDef, PropInstance, RegionDef, ShellDef } from '../../runtime/types';
import { Vec3 } from '../../../core/math';

type Mass = ShellDef['masses'][number];
interface Op { at: number; w: number; y0?: number; y1: number; glass?: boolean }

const H = 46; // ceiling
const T_EXT = 4, T_INT = 2.8;
const WALL = 0xf0e8d6, W_JONAH = 0xc8d4dc, W_PIP = 0xf4e6c0, W_BATH = 0xdde6df;

// The void and the stairwell: the two rectangles with no floor.
const VOID = { min: [-59, -40, -31] as Vec3, max: [61, 60, 49] as Vec3 };
const STAIRWELL = { min: [95, -40, 9] as Vec3, max: [139, 60, 18] as Vec3 };

const masses: Mass[] = [];
const box = (kind: Mass['kind'], min: Vec3, max: Vec3, color?: number): void => { masses.push({ kind, min, max, color }); };

/** Wall along x at constant z, from x0 to x1, with openings cut out. */
function wallX(z: number, x0: number, x1: number, t: number, h: number, ops: Op[] = [], y0 = 0, color = WALL): void {
  const sorted = [...ops].sort((a, b) => a.at - b.at);
  let cursor = x0;
  for (const op of sorted) {
    const a = op.at - op.w / 2, b = op.at + op.w / 2;
    if (a > cursor) box('wall', [cursor, y0, z - t / 2], [a, h, z + t / 2], color);
    const oy0 = op.y0 ?? 0;
    if (oy0 > y0) box('wall', [a, y0, z - t / 2], [b, oy0, z + t / 2], color);
    if (op.y1 < h) box('wall', [a, op.y1, z - t / 2], [b, h, z + t / 2], color);
    if (op.glass) box('glass', [a, oy0, z - t * 0.15], [b, op.y1, z + t * 0.15]);
    cursor = b;
  }
  if (cursor < x1) box('wall', [cursor, y0, z - t / 2], [x1, h, z + t / 2], color);
}

/** Wall along z at constant x. */
function wallZ(x: number, z0: number, z1: number, t: number, h: number, ops: Op[] = [], y0 = 0, color = WALL): void {
  const sorted = [...ops].sort((a, b) => a.at - b.at);
  let cursor = z0;
  for (const op of sorted) {
    const a = op.at - op.w / 2, b = op.at + op.w / 2;
    if (a > cursor) box('wall', [x - t / 2, y0, cursor], [x + t / 2, h, a], color);
    const oy0 = op.y0 ?? 0;
    if (oy0 > y0) box('wall', [x - t / 2, y0, a], [x + t / 2, oy0, b], color);
    if (op.y1 < h) box('wall', [x - t / 2, op.y1, a], [x + t / 2, h, b], color);
    if (op.glass) box('glass', [x - t * 0.15, oy0, a], [x + t * 0.15, op.y1, b]);
    cursor = b;
  }
  if (cursor < z1) box('wall', [x - t / 2, y0, cursor], [x + t / 2, h, z1], color);
}

// ---------------------------------------------------------------- exterior walls
wallX(-111, -139, 139, T_EXT, H, [
  { at: -100, w: 40, y0: 18, y1: 38, glass: true }, // Jonah's window
  { at: -17.5, w: 15, y0: 24, y1: 40, glass: true }, // the bathroom's frosted window
  { at: 80, w: 40, y0: 18, y1: 38, glass: true }, // the parents' north window
]);
wallX(111, -139, 139, T_EXT, H, [{ at: 0, w: 40, y0: 20, y1: 40, glass: true }]); // the hall's south window
wallZ(-139, -111, 111, T_EXT, H, [{ at: 10, w: 40, y0: 18, y1: 38, glass: true }]); // Pip's west window
wallZ(139, -111, 111, T_EXT, H, [{ at: -70, w: 40, y0: 18, y1: 38, glass: true }]); // the parents' east window

// ---------------------------------------------------------------- interior walls
// The north row's south wall. Its middle stretch (x −59..61) is the VOID's north face — no opening there.
wallX(-31, -139, 139, T_INT, H, [
  { at: -99, w: 15, y1: 34 }, // Jonah ↔ Pip
  { at: 100, w: 15, y1: 34 }, // the parents ↔ the stair head
]);
wallZ(-39, -111, -31, T_INT, H, [{ at: -70, w: 15, y1: 34 }], 0, W_JONAH); // Jonah ↔ bath
wallZ(21, -111, -31, T_INT, H, [{ at: -70, w: 15, y1: 34 }], 0, W_BATH); // bath ↔ the parents
// The void's west and east faces. Pip opens onto the landing at z 59.
wallZ(-59, -31, 69, T_INT, H, [{ at: 59, w: 15, y1: 34 }], 0, W_PIP);
wallZ(61, -31, 49, T_INT, H);
// The hall's north wall exists only west of the void; the landing and the stair head are open to the hall.
wallX(69, -139, -59, T_INT, H, [{ at: -99, w: 15, y1: 34 }]);
// The linen closet, open at the front (z 74)
wallZ(100, 74, 96, 1.6, H);
wallZ(128, 74, 96, 1.6, H);
wallX(96, 100, 128, 1.6, H);

// ---------------------------------------------------------------- ceilings + the skylight
// The ceiling covers the whole plate: over the void it IS the living room's vault ceiling,
// with the same skylight (docs/blueprints/floor-G.md §2) coming through at x −15..15, z −5..25.
box('ceiling', [-139, H, -111], [-15, H + 2, 111]);
box('ceiling', [15, H, -111], [139, H + 2, 111]);
box('ceiling', [-15, H, -111], [15, H + 2, -5]);
box('ceiling', [-15, H, 25], [15, H + 2, 111]);
box('glass', [-15, H, -5], [15, H + 0.6, 25], 0xe8f4ff);
// The void's edge: a 2 u lip so the floor reads as having thickness from the living room below.
box('slab', [-59, -2, 45], [61, 0, 49], 0xd8cfc0);
box('slab', [-63, -2, -31], [-59, 0, 49], 0xd8cfc0);
box('slab', [61, -2, -31], [65, 0, 49], 0xd8cfc0);
// What you see when you lean over the rail: the living room, 46 u straight down. It is a different
// map, so this is a painted backdrop — the player is caught by `killY` (−30) long before reaching it.
box('slab', [-59, -48, -31], [61, -46, 49], 0x9a7a52); // its hardwood
box('slab', [-50, -46, -10], [40, -45.6, 45], 0x8a3a34); // the rug
box('mass', [-8, -46, 3], [32, -37, 20], 0x2a3038); // the couch
box('mass', [-1, -46, -17], [24, -38, -10], 0x3a3028); // the coffee table
box('mass', [43, -46, -6], [59, -26, 16], 0x7a3a30); // the fireplace's brick
box('mass', [-58, -46, 34], [-52, -10, 64], 0x5a4632); // the bookcase wall

// ---------------------------------------------------------------- props
const P = (kit: string, at: Vec3, yaw = 0, extra: Partial<PropInstance> = {}): PropInstance => ({ kit, at, yaw, ...extra });
const props: PropInstance[] = [
  // ---- Jonah's room
  P('bed_loft', [-105, 0, -90], 0, { size: [60, 30, 36] }),
  P('desk_kid', [-58, 0, -98], Math.PI, { size: [34, 14, 20] }),
  P('pc_beige', [-66, 14, -101], Math.PI),
  P('ramp_plank', [-46, 0, -78], 0, { size: [3, 14, 20] }), // the binder ramp onto the desk's SOLID pedestal (x −51..−41), east of and clear of the loft ramp above
  P('ramp_plank', [-64, 14, -90], Math.PI / 2, { size: [3, 20, 30], variant: 1 }), // desk top → onto the mattress (34), through the rail's gap
  P('console_tv', [-120, 0, -40], 0),
  P('rc_track', [-78, 0, -48], 0, { size: [44, 3, 26] }),
  P('shelf_figures', [-41, 26, -60], Math.PI / 2, { size: [30, 3, 8] }),
  P('bookcase', [-136, 0, -60], -Math.PI / 2, { size: [29.6, 37, 6] }),
  P('toy_blocks', [-50, 0, -40], 0.3), P('toy_dino', [-90, 0, -36], 1.2),
  P('sock', [-64, 0, -50], 0, { variant: 1 }), P('sock', [-110, 0, -45], 0, { variant: 3 }),
  P('book_hard', [-52, 0, -70], 0.4, { variant: 2 }), P('magazine_stack', [-54, 0, -76]),
  P('drawing_taped', [-41.5, 30, -45], Math.PI / 2, { variant: 1 }),
  P('outlet', [-41, 5.5, -80], Math.PI / 2), P('light_switch', [-41, 22, -66], Math.PI / 2),
  P('floor_register', [-120, 0, -106], 0),
  P('curtain', [-100, 14, -108], Math.PI, { size: [40, 26, 3] }),
  P('ceiling_light', [-90, 46, -70]),

  // ---- The bathroom
  P('tub', [-18, 0, -82], 0, { size: [30, 11, 50] }),
  P('ramp_plank', [3, 0, -82], Math.PI / 2, { size: [3, 11, 16], variant: 2 }), // the board onto the rim
  P('vanity', [10, 0, -100], Math.PI, { size: [20, 16, 12] }),
  P('toilet_full', [12, 0, -45], 0),
  P('fan_vent', [-9, 46, -88], 0),
  P('duck_rubber', [-18, 11.4, -70], 0.4), P('duck_rubber', [-18, 11.4, -64], 2.1, { variant: 1 }),
  P('duck_rubber', [-24, 2.2, -80], 0.9), P('duck_rubber', [-12, 2.2, -90], 1.7, { variant: 1 }),
  P('sock', [-2, 0, -45], 0, { variant: 4 }),
  P('drawing_taped', [19.5, 26, -95], Math.PI / 2, { variant: 0 }),
  P('outlet', [19.5, 5.5, -75], Math.PI / 2), P('light_switch', [19.5, 22, -62], Math.PI / 2),
  P('ceiling_light', [-9, 46, -60], 0, { variant: 1 }),

  // ---- The parents' room
  P('closet_hang', [55, 0, -103], Math.PI, { size: [56, 46, 14] }),
  P('bed_double', [85, 0, -68], 0, { size: [80, 10, 52] }),
  P('dresser', [133, 0, -70], Math.PI / 2, { size: [36, 15, 12] }),
  P('side_table', [42, 0, -96], 0), P('lava_lamp', [42, 12, -96]),
  P('box_shoe', [30, 0, -100], 0.3), P('shoe_pair', [36, 0, -40], 0.2, { variant: 2 }),
  P('magazine_stack', [120, 0, -100]), P('book_paper', [128, 15.4, -70], 0.3, { variant: 1 }),
  P('photo_frame', [95, 0, -40], 0), P('clock_wall', [80, 34, -108], Math.PI),
  P('plant_floor', [30, 0, -36], 0, { variant: 1 }),
  P('outlet', [137, 5.5, -95], Math.PI / 2), P('outlet', [23, 5.5, -50], -Math.PI / 2),
  P('light_switch', [23, 22, -62], -Math.PI / 2),
  P('floor_register', [80, 0, -106], 0), P('curtain', [80, 14, -108], Math.PI, { size: [40, 26, 3], variant: 1 }),
  P('ceiling_light', [85, 46, -70]),

  // ---- Pip's room
  P('dollhouse', [-118, 0, 19], -Math.PI / 2, { size: [40, 22, 34] }),
  P('tea_set', [-80, 0, 50], 0.2),
  P('plush_pile', [-120, 0, 56], 0, { size: [34, 20, 22] }),
  P('fishbowl', [-72, 0, -20], 0),
  P('toy_blocks', [-70, 0, 12], -0.4, { variant: 2 }), P('teddy_bear', [-66, 0, 40], 2.2),
  P('board_game', [-95, 0, 55], 0.3, { variant: 1 }),
  P('drawing_taped', [-137.5, 26, 40], -Math.PI / 2, { variant: 2 }),
  P('drawing_taped', [-137.5, 26, -10], -Math.PI / 2, { variant: 0 }),
  P('note_paper', [-60.5, 24, 20], Math.PI / 2, { variant: 3 }),
  P('outlet', [-137, 5.5, 50], -Math.PI / 2), P('light_switch', [-60.5, 22, 52], Math.PI / 2),
  P('floor_register', [-134, 0, 10], Math.PI / 2),
  P('curtain', [-137, 14, 10], -Math.PI / 2, { size: [40, 26, 3], variant: 2 }),
  P('ceiling_light', [-99, 46, 20]),

  // ---- The landing (the rail over the living room)
  P('rail', [1, 0, 47.5], 0, { size: [118, 12, 1] }),
  P('door_closed', [55, 0, 51], -Math.PI / 2), // the laundry chute's door
  P('plant_floor', [-52, 0, 64], 0),
  P('note_paper', [-58.5, 24, 60], Math.PI / 2, { variant: 5 }),
  P('outlet', [-58.5, 5.5, 66], Math.PI / 2),

  // ---- The stair head
  P('bench_hall', [70, 0, 40], Math.PI / 2, { size: [34, 12, 14] }),
  P('rail', [117, 0, 19.5], 0, { size: [44, 12, 1] }), // the stairwell's south edge
  P('rail', [93.5, 0, 13.5], Math.PI / 2, { size: [9, 12, 1] }), // its west edge
  P('laundry_basket', [72, 0, -10], 0.4),
  P('box_shoe', [80, 0, 60], 0.2, { variant: 2 }),
  P('outlet', [62.6, 5.5, -10], -Math.PI / 2), P('outlet', [137, 5.5, 55], Math.PI / 2),
  P('ceiling_light', [80, 46, 20]),

  // ---- The hall
  P('attic_hatch', [0, 46, 90], 0, { size: [26, 4, 46] }),
  P('linen_shelves', [114, 0, 90], Math.PI, { size: [28, 46, 12] }),
  P('hall_table', [-60, 0, 106], Math.PI),
  P('plant_floor', [-100, 0, 104], 0),
  P('photo_frame', [-30, 30, 109.5], 0), P('photo_frame', [-15, 32, 109.5], 0, { variant: 1 }),
  P('photo_frame', [30, 31, 109.5], 0, { variant: 2 }),
  P('clock_wall', [60, 34, 109.5], 0),
  P('teddy_bear', [-84, 0, 105], 1.1, { variant: 2 }),
  P('sock', [20, 0, 96], 0, { variant: 2 }), P('sock', [-40, 0, 78], 0, { variant: 0 }),
  P('shoe_pair', [-120, 0, 105], 0.4, { variant: 1 }),
  P('note_paper', [-64, 14.2, 106], 0, { variant: 2 }),
  P('outlet', [-80, 5.5, 109], 0), P('outlet', [90, 5.5, 109], 0, { variant: 1 }),
  P('light_switch', [-92, 22, 70.6], Math.PI),
  P('floor_register', [-40, 0, 107], 0), P('floor_register', [60, 0, 107], 0, { variant: 1 }),
  P('curtain', [0, 16, 109], 0, { size: [42, 26, 3] }),
];

// ---------------------------------------------------------------- regions
const R = (id: string, name: string, kind: RegionDef['kind'], min: Vec3, max: Vec3, band: string, checkpoint?: Vec3): RegionDef => ({ id, name, kind, min, max, band, checkpoint });
const regions: RegionDef[] = [
  R('U_loft', 'The Loft', 'overlook', [-135, 28, -108], [-75, 46, -72], 'A3'),
  R('U_dollhouse', 'Inside the Dollhouse', 'secret', [-133, 0, 3], [-103, 24, 35], 'A0–A3'),
  R('U_tub', 'Inside the Tub', 'secret', [-31, 0, -105], [-5, 12, -59], 'A0'),
  R('U_linen', 'The Linen Closet', 'secret', [100, 0, 74], [128, 46, 96], 'A0–A3'),
  R('U_underbed', 'Under the Bed', 'secret', [45, 0, -94], [125, 9, -42], 'A0'),
  R('U_landing', 'The Landing', 'overlook', [-59, 0, 49], [61, 46, 69], 'A0', [0, 0, 60]),
  R('U_bath', 'The Bathroom', 'arena', [-39, 0, -111], [21, 46, -31], 'A0–A2', [5, 0, -55]),
  R('U_jonah', "Jonah's Room", 'arena', [-139, 0, -111], [-39, 46, -31], 'A0–A3', [-60, 0, -52]),
  R('U_parents', 'The Big Room', 'arena', [21, 0, -111], [139, 46, -31], 'A0–A3', [45, 0, -50]),
  R('U_pip', "Pip's Room", 'arena', [-139, 0, -31], [-59, 46, 69], 'A0–A3', [-80, 0, 30]),
  R('U_stairs', 'The Stair Head', 'connector', [61, 0, -31], [139, 46, 69], 'A0–A2', [115, 0, 26]),
  R('U_hall', 'The Upstairs Hall', 'connector', [-139, 0, 69], [139, 46, 111], 'A0–A3', [0, 0, 90]),
];

// ---------------------------------------------------------------- the def
export const FLOOR_U: MapDef = {
  id: 'u',
  title: 'The Upper Floor',
  realFootprint: "a 15 × 12 m upper storey at 1:32 — two kids' rooms, the parents', the bath, and a landing over the void (278 × 222 u)",
  indoor: true,
  killY: -30,
  spawn: [115, 0, 24],
  spawnYaw: Math.PI,
  shell: {
    sky: { horizon: 0xdfe6ea, zenith: 0xbfd0dc },
    fog: { color: 0x2b2822, near: 300, far: 900 },
    sun: { dir: [-0.4, 0.85, -0.35], color: 0xfff0d8, intensity: 1.5 },
    hemi: { sky: 0xf4ece0, ground: 0x6a5c4c, intensity: 0.75 },
    ground: [
      { kind: 'carpet', min: [-139, 0, -111], max: [-39, 0, -31], color: 0x5a6a78 }, // Jonah
      { kind: 'tile', min: [-39, 0, -111], max: [21, 0, -31] }, // the bathroom
      { kind: 'carpet', min: [21, 0, -111], max: [139, 0, -31], color: 0x8a7a6a }, // the parents
      { kind: 'carpet', min: [-139, 0, -31], max: [-59, 0, 69], color: 0xd8c0a8 }, // Pip
      // The stair head, split around the stairwell hole
      { kind: 'hardwood', min: [61, 0, -31], max: [95, 0, 69] },
      { kind: 'hardwood', min: [95, 0, -31], max: [139, 0, 9] },
      { kind: 'hardwood', min: [95, 0, 18], max: [139, 0, 69] },
      { kind: 'hardwood', min: [-59, 0, 49], max: [61, 0, 69] }, // the landing
      { kind: 'hardwood', min: [-139, 0, 69], max: [139, 0, 111] }, // the hall
      { kind: 'carpet', min: [-110, 0, 84], max: [110, 0, 96], color: 0x6a5a8a }, // the runner, one floor up
    ],
    masses,
    bounds: { min: [-141, 0, -113], max: [141, 0, 113] },
    holes: [VOID, STAIRWELL],
  },
  regions,
  props,
  routes: [
    { id: 'RT_arrival', class: 'main', points: [[115, 0, 24], [100, 0, 45], [70, 0, 62], [0, 0, 80], [0, 0, 100]] },
    { id: 'RT_landing', class: 'main', points: [[55, 0, 60], [0, 0, 60], [-40, 0, 60], [-56, 0, 59], [-70, 0, 59]] },
    { id: 'RT_parents', class: 'main', points: [[100, 0, -20], [100, 0, -36], [60, 0, -36], [30, 0, -50], [30, 0, -92]] },
    { id: 'RT_bed', class: 'climb', points: [[25, 0, -70], [32, 4, -70], [40, 8, -70], [47, 11, -70], [80, 11, -70]] },
    { id: 'RT_bath', class: 'main', points: [[16, 0, -36], [0, 0, -52], [0, 0, -72], [10, 0.7, -82], [5, 4.1, -82], [0, 7.6, -82], [-4.5, 10.7, -82]] },
    { id: 'RT_jonah', class: 'main', points: [[-45, 0, -50], [-46, 0, -62], [-46, 0, -66], [-46, 2.8, -72], [-46, 7, -78], [-46, 11.2, -84], [-46, 13.3, -87], [-46, 14, -92], [-52, 14, -96]] }, // up the pedestal, which sits east of the loft ramp
    { id: 'RT_loft', class: 'climb', points: [[-50, 14.7, -90], [-58, 20, -90], [-66, 25.3, -90], [-74, 30.7, -90], [-90, 34, -90]] },
    { id: 'RT_pip', class: 'main', points: [[-99, 0, -20], [-99, 0, 20], [-104, 0, 20], [-108, 0, 20], [-112, 0, 20]] },
    { id: 'RT_hall', class: 'main', points: [[-130, 0, 100], [-60, 0, 100], [0, 0, 100], [60, 0, 100], [130, 0, 100]] },
    { id: 'RT_linen', class: 'flank', points: [[114, 0, 70], [114, 0, 76], [114, 0, 82]] },
    { id: 'RT_hatch', class: 'setpiece', points: [[0, 0, 90], [0, 20, 90], [0, 44, 90]] },
  ],
  // The plush pile is a hush pocket: pure concealment, no blades.
  grass: [
    { min: [-137, 0, 45], max: [-103, 0, 67], height: [1, 14], density: 0, concealment: 0.95 },
    { min: [-133, 0, 3], max: [-103, 0, 35], height: [1, 10], density: 0, concealment: 0.5 }, // inside the dollhouse
  ],
  encounters: [],
  hazards: [],
  pickups: [
    { kind: 'marble', id: 'marble_loft', at: [-100, 0.2, -88] },
    { kind: 'marble', id: 'marble_tub', at: [-18, 2.4, -66] },
    { kind: 'marble', id: 'marble_dollhouse', at: [-118, 14.2, 19] },
    { kind: 'marble', id: 'marble_closet', at: [70, 35.2, -103] },
    { kind: 'marble', id: 'marble_hall', at: [60, 0.4, 107] },
    { kind: 'ammo', at: [0, 0.2, 60] },
    { kind: 'glue', at: [-80, 0.2, 50] },
  ],
  links: [
    { id: 'L_stairs_U', kind: 'stairs', name: 'the stairs', min: [95, -12, 9], max: [139, 8, 18], to: { map: 'g', spawn: [115, 46, 14], yaw: 0 } },
    { id: 'L_ladder', kind: 'ladder', name: 'the attic ladder', min: [-13, 38, 78], max: [13, 48, 102], to: { map: 'a', spawn: [0, 0, 0], yaw: 0 }, foundBy: 'u1' },
    { id: 'L_chute_down', kind: 'express', name: 'the laundry chute', min: [50, 0, 49], max: [61, 12, 57], to: { map: 'b', spawn: [0, 0, 0], yaw: 0 } },
  ],
  landmarks: [
    { id: 'LM_loft', name: 'THE LOFT', at: [-105, 30, -90] },
    { id: 'LM_dollhouse', name: 'THE DOLLHOUSE', at: [-118, 22, 19] },
    { id: 'LM_bed', name: 'THE BED', at: [85, 10, -68] },
    { id: 'LM_tub', name: 'THE TUB', at: [-18, 11, -82] },
    { id: 'LM_hatch', name: 'THE HATCH', at: [0, 40, 90] },
    { id: 'LM_rail', name: 'THE RAIL', at: [0, 12, 48] },
  ],
};
