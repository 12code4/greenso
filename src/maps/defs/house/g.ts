// FLOOR G — THE GROUND FLOOR · "The Long Hall". Transcribed from
// docs/blueprints/floor-G.md (the contract). Honest 1:32 scale: 1 u = 5.4 cm.
// x east, z south (north is −z), floor at y 0. Footprint x ∈ [−139, 139], z ∈ [−111, 111].

import { MapDef, PropInstance, RegionDef, ShellDef } from '../../runtime/types';
import { Vec3 } from '../../../core/math';

type Mass = ShellDef['masses'][number];
interface Op { at: number; w: number; y0?: number; y1: number; glass?: boolean }

const H = 50; // ceiling
const VAULT = 96; // living room
const T_EXT = 4, T_INT = 2.8;
const WALL = 0xf0e8d6, WALL_KITCHEN = 0xe4ece4, WALL_BATH = 0xdde6ee;

const masses: Mass[] = [];
const box = (kind: Mass['kind'], min: Vec3, max: Vec3, color?: number): void => { masses.push({ kind, min, max, color }); };

/** Wall along x at constant z, from x0 to x1, with openings (doors, windows) cut out. */
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
  { at: -100, w: 40, y0: 20, y1: 40, glass: true }, // kitchen window over the sink
  { at: -37, w: 15, y0: 20, y1: 40, glass: true }, // mudroom window
  { at: -24, w: 6, y1: 5 }, // THE DOG DOOR
  { at: 24, w: 12, y0: 20, y1: 40, glass: true }, // backhall window
  { at: 38.5, w: 15, y1: 37 }, // back door (closed)
  { at: 100, w: 60, y1: 40 }, // garage roll-up door
]);
wallX(111, -139, 139, T_EXT, H, [
  { at: 0, w: 15, y1: 37 }, // FRONT DOOR
  { at: -11.5, w: 5, y0: 8, y1: 37, glass: true },
  { at: 11.5, w: 5, y0: 8, y1: 37, glass: true },
]);
wallZ(-139, -111, 111, T_EXT, H, [
  { at: -70, w: 30, y0: 20, y1: 40, glass: true }, // kitchen west window
  { at: -15, w: 20, y0: 15, y1: 45, glass: true }, // dining window
]);
wallZ(139, -111, 111, T_EXT, H, [
  { at: 30, w: 20, y0: 30, y1: 46, glass: true }, // stairs window
]);
// Garage roll-up door: a ribbed mass hanging 3 u above the slab (the gap is L_garage)
box('mass', [70, 3, -112.5], [130, 40, -109.5], 0xd8d0c0);

// ---------------------------------------------------------------- interior walls
// North row south walls (z −31)
wallX(-31, -139, -59, T_INT, H, [{ at: -100, w: 15, y1: 37 }], 0, WALL_KITCHEN); // kitchen↔dining
wallX(-31, -59, 61, T_INT, VAULT, [{ at: 8.5, w: 15, y1: 37 }, { at: 35, w: 15, y1: 37 }]); // vestibule (basement door) + backhall↔living; vault wall
wallZ(-49, -111, -31, T_INT, H, [{ at: -80, w: 15, y1: 37 }, { at: -41, w: 12, y1: 37 }], 0, WALL_KITCHEN); // kitchen east
wallX(-51, -49, 1, T_INT, H); // mudroom/pantry
wallZ(1, -111, -31, T_INT, H, [{ at: -80, w: 15, y1: 37 }]); // mudroom↔vestibule
wallZ(16, -111, -31, T_INT, H, [{ at: -90, w: 20, y1: 40 }]); // vestibule↔backhall (wide opening)
wallZ(61, -111, -31, T_INT, H, [{ at: -60, w: 15, y1: 37 }]); // backhall↔garage
wallZ(61, -31, 9, T_INT, VAULT); // living↔garage (vault height)
// Chute closet + shaft
wallZ(45, -50, -31, T_INT, H, [{ at: -40, w: 12, y1: 37 }]);
wallX(-50, 45, 61, T_INT, H);
wallZ(55, -50, -44, 1, H, [], 10, 0xb8bcc0); // shaft walls (sheet metal) from y 10
wallX(-44, 55, 61, 1, H, [], 10, 0xb8bcc0);
// Middle row
wallZ(-59, -31, 69, T_INT, VAULT, [{ at: 15, w: 30, y1: 40 }]); // dining↔living arch, vault wall
wallZ(61, 9, 69, T_INT, VAULT, [{ at: 40, w: 15, y1: 37 }], 0, WALL_BATH); // bath door, vault wall
wallX(9, 61, 139, T_INT, H); // garage / bath + stairs
wallX(49, 61, 91, T_INT, H, [], 0, WALL_BATH); // bath / closet
wallZ(91, 9, 69, T_INT, H); // bath + closet / stairs
// Hall north wall (z 69)
wallX(69, -139, -59, T_INT, H, [{ at: -100, w: 15, y1: 37 }]); // dining↔hall door
wallX(69, 61, 91, T_INT, H, [{ at: 76, w: 15, y1: 37 }]); // closet door; the stairs (91..139) are open to the hall
// Living room south wall: piers, lintel, the balcony front above, the upstairs doorway
box('wall', [-59, 0, 69 - T_INT / 2], [-30, 45, 69 + T_INT / 2]);
box('wall', [30, 0, 69 - T_INT / 2], [61, 45, 69 + T_INT / 2]);
box('wall', [-30, 45, 69 - T_INT / 2], [30, 52, 69 + T_INT / 2]);
box('wall', [-59, 52, 69 - T_INT / 2], [-7.5, VAULT, 69 + T_INT / 2]);
box('wall', [7.5, 52, 69 - T_INT / 2], [61, VAULT, 69 + T_INT / 2]);
box('wall', [-7.5, 89, 69 - T_INT / 2], [7.5, VAULT, 69 + T_INT / 2]);
box('mass', [-7.5, 52, 69 + T_INT / 2], [7.5, 89, 72], 0x2a241e); // the dark doorway upstairs

// ---------------------------------------------------------------- ceilings, vault, balcony
box('ceiling', [-139, H, -111], [61, H + 2, -31]); // north row
box('ceiling', [61, H, -111], [139, H + 2, 9]); // garage
box('ceiling', [-139, H, -31], [-59, H + 2, 69]); // dining
box('ceiling', [61, H, 9], [91, H + 2, 69]); // bath, closet
box('ceiling', [91, H, 40], [139, H + 2, 69]); // over the foot of the stairs
// The stairwell continues up into the dark second floor: dark shell over the top half of the stairs
box('mass', [91, H + 12, 9], [139, H + 14, 40], 0x2a241e);
box('mass', [91 - T_INT / 2, H, 9], [91 + T_INT / 2, H + 12, 40], 0x2a241e);
box('mass', [139 - T_EXT / 2, H, 9], [139 + T_EXT / 2, H + 12, 40], 0x2a241e);
box('mass', [91, H, 9 - T_INT / 2], [139, H + 12, 9 + T_INT / 2], 0x2a241e);
box('ceiling', [-139, H, 69], [139, H + 2, 111]); // hall
// Vault ceiling with the skylight
box('ceiling', [-59, VAULT, -31], [61, VAULT + 2, -5], 0xfaf6ee);
box('ceiling', [-59, VAULT, 25], [61, VAULT + 2, 69], 0xfaf6ee);
box('ceiling', [-59, VAULT, -5], [-15, VAULT + 2, 25], 0xfaf6ee);
box('ceiling', [15, VAULT, -5], [61, VAULT + 2, 25], 0xfaf6ee);
box('glass', [-15, VAULT, -5], [15, VAULT + 0.6, 25], 0xe8f4ff);
// Balcony (the upstairs landing) over the living room's south end
box('slab', [-59, H, 49], [61, H + 2, 69]);

// ---------------------------------------------------------------- props
const P = (kit: string, at: Vec3, yaw = 0, extra: Partial<PropInstance> = {}): PropInstance => ({ kit, at, yaw, ...extra });
const props: PropInstance[] = [
  // ---- Kitchen
  P('counter_run', [-107.5, 0, -105.5], Math.PI, { size: [55, 16.7, 11] }), // north run, x −135..−80
  P('counter_run', [-129.5, 0, -72.5], -Math.PI / 2, { size: [55, 16.7, 11], variant: 1 }), // west run, z −100..−45
  P('cabinet_upper', [-107.5, 26, -108], Math.PI, { size: [55, 13, 6.5] }),
  P('cabinet_upper', [-129.5, 26, -72.5], -Math.PI / 2, { size: [55, 13, 6.5], variant: 1 }),
  P('stove', [-74.5, 0, -105.5], Math.PI),
  P('range_hood', [-74.5, 30, -105.5]),
  P('fridge', [-63, 0, -104], Math.PI, { variant: 1 }),
  P('faucet', [-100, 16.7, -108.5]),
  P('toaster', [-95, 16.7, -104]),
  P('microwave', [-131.5, 16.7, -60], -Math.PI / 2), // on the west run, facing east (the corner stays walkable)
  P('drawer_open', [-118, 10, -56], -Math.PI / 2),
  P('island', [-92, 0, -70]),
  P('stool', [-100, 0, -56]), P('stool', [-92, 0, -56]), P('stool', [-84, 0, -56]),
  P('ramp_plank', [-112, 0, -85], Math.PI / 2, { size: [3, 16.7, 24] }), // leaned on the west counter's front: the kids' way up
  P('box_cereal', [-88, 16.7, -66], 0.3), P('cup_mug', [-96, 16.7, -75], 0), P('cup_mug', [-118, 16.7, -107.5], 1.2),
  P('can_soda', [-88, 16.7, -64], 0), P('dog_bowl', [-58, 0, -40], 0), P('dog_bowl', [-52, 0, -40], 0, { variant: 1 }),
  P('clock_wall', [-90, 42, -33]), P('calendar', [-56, 30, -32.6], Math.PI), P('note_paper', [-51, 26, -80], -Math.PI / 2, { variant: 5 }),
  P('plant_floor', [-134, 0, -36], 0, { variant: 1 }),
  // ---- Pantry (tiers every 6.5)
  P('pantry_shelf', [-24, 0, -47], Math.PI, { size: [44, 37, 6] }),
  P('stack_stairs', [-40, 0, -39], 0, { size: [6, 7.2, 10] }), // to the second tier
  P('box_cereal', [-8, 0, -36], 0.5), P('box_cereal', [-12, 0, -34], -0.2, { variant: 1 }),
  // ---- Mudroom
  P('bench_mud', [-44.5, 0, -70], Math.PI / 2),
  P('boot_rain', [-34, 0, -106], 0.2), P('boot_rain', [-29, 0, -106], -0.3, { variant: 1 }),
  P('coat_hooks', [-24, 30, -53.5], 0, { size: [40, 3, 1] }),
  P('keychain_pet', [-8, 26.5, -53.7]),
  P('dog_bed', [-38, 0, -90]),
  P('leash', [-18, 0, -104]),
  P('dog_door_flap', [-24, 0, -111]),
  P('shoe_pair', [-12, 0, -100], 0.4, { variant: 3 }),
  P('note_paper', [-40, 30, -52.6], 0, { variant: 1 }),
  P('drawing_taped', [-14, 28, -52.6], 0, { variant: 0 }),
  // ---- Vestibule + backhall
  P('door_closed', [8.5, 0, -32.6], 0, { variant: 1 }), // BASEMENT (leads down; not built)
  P('door_closed', [38.5, 0, -109], Math.PI), // back door
  P('laundry_basket', [30, 0, -46]),
  P('rope_knots', [58, 2, -47], 0, { size: [1, 44, 1] }), // up the chute shaft
  P('laundry_basket', [50, 0, -35], 0.4),
  P('coat_hooks', [30, 30, -108.5], Math.PI, { size: [24, 3, 1], variant: 2 }),
  P('shoe_pair', [24, 0, -104], 0.2, { variant: 1 }),
  P('note_paper', [20, 30, -109.6], 0, { variant: 2 }),
  // ---- Garage
  P('car_sedan', [100, 0, -58], 0, { variant: 1 }),
  P('ramp_plank', [100, 0, -5.5], 0, { size: [3, 17, 22], variant: 2 }), // leaned on the rear bumper → trunk → rear glass → roof
  P('tool_wall', [137, 0, -40], Math.PI / 2, { size: [60, 25, 2] }),
  P('bike', [78, 0, 6], 0), P('bike', [128, 0, -12], Math.PI / 2, { variant: 1 }),
  P('box_shoe', [66, 0, -95], 0.2), P('box_shoe', [72, 0, -95], -0.1, { variant: 1 }), P('box_shoe', [66, 0, -84], 0.4, { variant: 2 }),
  P('domino', [92, 0, -50], 0.6), P('domino', [105, 0, -62], -0.4), P('domino', [96, 0, -70], 1.1),
  P('batt_crate', [128, 0, -100], 0.3),
  P('can_lying', [70, 0, -60], 0.8),
  // ---- Dining
  P('dining_table', [-99, 0, 19]),
  P('chair_dining', [-106, 0, 5], Math.PI), P('chair_dining', [-92, 0, 5], Math.PI),
  P('chair_dining', [-106, 0, 33], 0), P('chair_dining', [-92, 0, 33], 0),
  P('chair_dining', [-120, 0, 19], -Math.PI / 2), P('chair_dining', [-81, 0, 19], Math.PI / 2), // east chair pulled up to the table
  P('chair_dining', [-75, 0, 44], 2.5, { variant: 1 }), // the fort chair (secret 16)
  P('stack_stairs', [-81, 0, 29], 0, { size: [6, 8.9, 12] }), // floor → the east chair's seat
  P('stack_stairs', [-81.9, 8.9, 19], Math.PI / 2, { size: [5, 5.1, 6.5], variant: 3 }), // seat → the table
  P('sideboard', [-134, 0, 20], -Math.PI / 2, { size: [40, 17, 8] }),
  P('china_cabinet', [-134, 17, 20], -Math.PI / 2, { size: [40, 20, 8] }),
  P('chandelier', [-99, 38, 19], 0, { size: [16, 12, 16] }),
  P('plant_floor', [-65, 0, -25]),
  P('drawing_taped', [-137.9, 24, 50], -Math.PI / 2, { variant: 2 }),
  P('height_chart', [-91.5, 0, 66.9], 0),
  P('cup_mug', [-104, 14, 24], 0.3), P('book_paper', [-88, 14, 12], 0.9),
  // ---- Living
  P('fireplace', [57, 0, 5], Math.PI / 2, { size: [28, VAULT, 8] }),
  P('stack_stairs', [47.75, 0, 14], -Math.PI / 2, { size: [4, 3, 4.5], variant: 4 }), // old magazines: floor → the hearth
  P('photo_frame', [56.4, 24, 5], Math.PI / 2, { variant: 1 }),
  P('tv_cabinet', [12, 0, -26], Math.PI),
  P('tv_crt', [12, 17, -26], Math.PI),
  P('vcr', [12, 6.2, -27.5], Math.PI),
  P('note_paper', [18, 12, -20.8], Math.PI, { variant: 6 }),
  P('couch', [12, 0, 12], 0),
  P('coffee_table', [12, 0, -10]),
  P('bookcase', [-56, 0, 50], -Math.PI / 2, { size: [29.6, 37, 6] }), // west wall, the climb
  P('rope_knots', [-52, 37, 48], 0, { size: [2.6, 15.5, 1], variant: 1 }), // from the bookcase top to the rail gap (hops)
  P('bookcase', [56, 0, 58], Math.PI / 2, { size: [20, 37, 6], variant: 1 }),
  P('piggy_bank', [56, 17.2, 62], Math.PI / 2),
  P('cardboard_box_open', [-40, 0, -15], -Math.PI / 2),
  P('side_table', [-52, 0, -20]),
  P('record_player', [-52, 12, -20], -Math.PI / 2),
  P('plant_floor', [-40, 0, 64], 0, { variant: 2 }),
  P('boombox', [-45, 0, -28]),
  P('book_hard', [-20, 8.3, 14], 0.4), P('book_hard', [30, 0, 60], 0.2, { variant: 3 }), P('book_hard', [30, 0.74, 60], 0.5, { variant: 1 }),
  P('rail', [-56, 52, 49], 0, { size: [6, 12, 1] }), P('rail', [7, 52, 49], 0, { size: [108, 12, 1] }), // the gap at x −53..−47 is where the rope hangs
  P('drawing_taped', [-10, 30, -29.5], 0, { variant: 1 }),
  P('clock_wall', [0, 60, -29.4]),
  // ---- Bath
  P('pedestal_sink', [84, 0, 16], Math.PI / 2),
  P('toilet', [68, 0, 43]),
  P('magazine_stack', [76, 0, 45]),
  P('duck_rubber', [84, 15.6, 15], 0.6),
  P('note_paper', [62.6, 26, 20], -Math.PI / 2, { variant: 3 }),
  // ---- Closet
  P('vacuum', [76, 0, 58]),
  P('coat_hooks', [76, 30, 51.5], Math.PI, { size: [24, 3, 1], variant: 1 }),
  P('box_shoe', [66, 0, 64], 0.1),
  // ---- Stairs + marble run
  P('stair_run', [117, 0, 39], 0, { size: [44, 46, 60] }), // z 9..69, x 95..139
  P('marble_run', [94, 0, 57], 0, { size: [1.6, 18.4, 24] }), // lower: z 45..69, top at 18.4
  P('marble_run', [94, 26.07, 22], 0, { size: [1.6, 19.93, 26], variant: 2 }), // upper: z 9..35, from 26.07 to 46 (the bridge fills 35..45)
  // ---- Hall
  P('door_closed', [0, 0, 109.5]),
  P('hall_table', [-60, 0, 106]),
  P('phone_corded', [-64, 14, 106]),
  P('mail_pile', [-55, 14, 106]),
  P('key_hook', [-48, 24, 108.9]),
  P('umbrella_stand', [14, 0, 105]),
  P('shoe_pair', [-20, 0, 106], 0.3), P('shoe_pair', [-26, 0, 107], -0.5, { variant: 1 }), P('shoe_pair', [22, 0, 106], 0.8, { variant: 2 }),
  P('plant_floor', [-130, 0, 104]), P('plant_floor', [130, 0, 104], 0, { variant: 1 }),
  P('clock_wall', [60, 40, 108.9]),
  P('calendar', [-110, 32, 108.9]),
  P('drawing_taped', [40, 26, 108.9], 0, { variant: 0 }),
  P('note_paper', [-30, 30, 108.9], 0, { variant: 0 }),
  P('rubber_band', [-2, 0, 96]), P('rubber_band', [-40, 0, 88]), P('rubber_band', [40, 0, 84]), P('rubber_band', [80, 0, 76]), P('rubber_band', [100, 0, 74]),
  P('chalk_arrow', [104, 0, 80], -Math.PI / 2 + 0.9), // toward the marble run's foot
  P('chalk_arrow', [-122, 0, -40], 0), // toward the counter stairs
  P('book_hard', [110, 0, 100], 0.2, { variant: 4 }), P('box_juice', [116, 0, 100], 0.3),
  // ---- Decoration With Heart top-ups (docs/10 §8): every room carries the family's traces
  // mudroom
  P('sock', [-20, 0, -95], 0, { variant: 1 }), P('sock', [-36, 8.5, -64], 0, { variant: 3 }),
  P('note_paper', [-47.6, 28, -70], -Math.PI / 2, { variant: 3 }), P('umbrella_stand', [-8, 0, -106]), P('mail_pile', [-44.5, 8.6, -76]),
  // back hall
  P('shoe_pair', [40, 0, -100], 0.6, { variant: 2 }), P('key_hook', [25, 24, -109.4], Math.PI), P('clock_wall', [50, 40, -32.5]),
  P('sock', [44, 0, -36], 0, { variant: 2 }), P('sock', [42, 0, -44], 0, { variant: 4 }), P('drawing_taped', [22, 26, -32.5], 0, { variant: 2 }),
  P('box_juice', [20, 0, -36], 0.4), P('book_paper', [35, 0, -98], 0.9, { variant: 2 }),
  // dining
  P('note_paper', [-137.9, 28, -10], -Math.PI / 2, { variant: 4 }), P('clock_wall', [-80, 42, -29.5], Math.PI), P('calendar', [-100, 30, 67.5]),
  P('book_hard', [-120, 8.7, 19], 0.3, { variant: 2 }), P('mail_pile', [-90, 14.05, 22]), P('sock', [-125, 0, 55], 0, { variant: 0 }),
  P('magazine_stack', [-70, 0, 60]), P('can_soda', [-96, 14, 14], 0.4, { variant: 2 }),
  // bath
  P('book_paper', [68, 15.3, 43], 0.2, { variant: 3 }), P('sock', [72, 0, 20], 0, { variant: 1 }), P('duck_rubber', [80, 0, 38], 2.1), P('drawing_taped', [89.4, 24, 30], Math.PI / 2, { variant: 0 }),
  // hall closet
  P('shoe_pair', [66, 0, 58], 0.2, { variant: 0 }), P('shoe_pair', [70, 0, 64], -0.4, { variant: 3 }), P('umbrella_stand', [86, 0, 55]), P('sock', [80, 0, 62], 0, { variant: 2 }),
  // pantry
  P('can_soda', [-20, 0, -35], 0, { variant: 1 }), P('can_soda', [-14, 0, -37], 0, { variant: 3 }), P('box_juice', [-30, 0, -34], 0.2), P('note_paper', [-0.5, 26, -41], Math.PI / 2, { variant: 5 }),
  // vestibule
  P('shoe_pair', [10, 0, -100], 0.3, { variant: 1 }), P('boot_rain', [6, 0, -104], 0.1, { variant: 1 }), P('note_paper', [14.5, 28, -60], Math.PI / 2, { variant: 2 }),
  P('drawing_taped', [2.5, 26, -50], -Math.PI / 2, { variant: 2 }), P('sock', [8, 0, -45], 0, { variant: 3 }),
  // stairs
  P('book_hard', [110, 3.3, 64], 0.4, { variant: 1 }), P('book_hard', [120, 6.6, 59], -0.3, { variant: 5 }), P('sock', [126, 9.9, 55], 0, { variant: 4 }), P('box_juice', [116, 0, 30], 0.6),
  // garage
  P('can_lying', [120, 0, -80], 1.4, { variant: 1 }), P('sock', [70, 0, -30], 0, { variant: 0 }), P('note_paper', [137.4, 12, -20], Math.PI / 2, { variant: 7 }),
];

// ---------------------------------------------------------------- regions
const R = (id: string, name: string, kind: RegionDef['kind'], min: Vec3, max: Vec3, band: string, checkpoint?: Vec3): RegionDef => ({ id, name, kind, min, max, band, checkpoint });
const regions: RegionDef[] = [
  R('G_drawer', 'The Junk Drawer', 'secret', [-124.5, 10, -62.5], [-111.5, 20, -49.5], 'A1'),
  R('G_fridge', 'Inside the Fridge', 'secret', [-69, 0, -111], [-57, 34, -96], 'A2'),
  R('G_stairtop', 'Top of the Stairs', 'overlook', [91, 44, 10.4], [139, 50, 18], 'A3'),
  R('G_landing', 'The Balcony', 'overlook', [-59, 50, 49], [61, VAULT, 69], 'A3'),
  R('G_flap', 'The Dog Door', 'secret', [-28, 0, -111], [-20, 6, -104], 'A0'),
  R('G_pantry', 'Pantry', 'connector', [-49, 0, -51], [1, H, -31], 'A0'),
  R('G_vestibule', 'Vestibule', 'connector', [1, 0, -111], [16, H, -31], 'A0'),
  R('G_bath', 'Half Bath', 'secret', [61, 0, 9], [91, H, 49], 'A0'),
  R('G_closet', 'Hall Closet', 'secret', [61, 0, 49], [91, H, 69], 'A0'),
  R('G_stairs', 'The Stairs', 'climb', [91, 0, 9], [139, H, 69], 'A0', [115, 0, 65]),
  R('G_mudroom', 'Mudroom', 'connector', [-49, 0, -111], [1, H, -51], 'A0', [-24, 0, -80]),
  R('G_backhall', 'Back Hall', 'connector', [16, 0, -111], [61, H, -31], 'A0', [47, 0, -40]),
  R('G_kitchen', 'Kitchen', 'arena', [-139, 0, -111], [-49, H, -31], 'A0', [-60, 0, -45]),
  R('G_garage', 'Garage', 'arena', [61, 0, -111], [139, H, 9], 'A0', [100, 0, 0]),
  R('G_dining', 'Dining Room', 'arena', [-139, 0, -31], [-59, H, 69], 'A0', [-99, 0, 50]),
  R('G_living', 'Living Room', 'arena', [-59, 0, -31], [61, H, 69], 'A0', [0, 0, 50]),
  R('G_hall', 'The Hall', 'connector', [-139, 0, 69], [139, H, 111], 'A0', [0, 0, 90]),
];

// ---------------------------------------------------------------- the def
export const FLOOR_G: MapDef = {
  id: 'g',
  title: 'The Ground Floor',
  realFootprint: 'a 15 × 12 m house at 1:32 — the kitchen, the hall, the vaulted living room (278 × 222 u)',
  indoor: true,
  spawn: [47, 0, -40],
  spawnYaw: -Math.PI / 2,
  shell: {
    sky: { horizon: 0xf4ecd8, zenith: 0xf4ecd8 },
    fog: { color: 0xf4ecd8, near: 300, far: 900 },
    sun: { dir: [-0.5, 0.75, -0.4], color: 0xfff0d8, intensity: 2.2 },
    hemi: { sky: 0xfff6e8, ground: 0x6b5a48, intensity: 0.75 },
    ground: [
      { kind: 'tile', min: [-139, 0, -111], max: [16, 0, -31], height: 0.04, color: 0xe8e2d2 },
      { kind: 'concrete', min: [61, 0, -111], max: [139, 0, 9], height: 0.04 },
      { kind: 'concrete', min: [88, 0, -70], max: [112, 0, -40], height: 0.06, color: 0x5a5652 }, // the oil stain
      { kind: 'tile', min: [61, 0, 9], max: [91, 0, 49], height: 0.04, color: 0xdde6ee },
      { kind: 'carpet', min: [-30, 0, -25], max: [50, 0, 30], height: 0.08, color: 0xa85048 }, // the living room rug
      { kind: 'carpet', min: [-120, 0, 0], max: [-78, 0, 38], height: 0.08, color: 0x7a8aa8 }, // under the dining table
      { kind: 'carpet', min: [-100, 0, 84], max: [100, 0, 96], height: 0.08, color: 0x8a78a8 }, // the hall runner
      { kind: 'tile', min: [16, 0, -111], max: [61, 0, -31], height: 0.04, color: 0xe8e2d2 },
    ],
    masses,
    bounds: { min: [-141, 0, -113], max: [141, 0, 113] },
  },
  regions,
  props,
  routes: [
    { id: 'RT_arrival', class: 'main', points: [[52, 0, -40], [30, 0, -40], [30, 0, -20], [0, 0, 20], [0, 0, 80], [0, 0, 104]] },
    { id: 'RT_kitchen', class: 'main', points: [[30, 0, -80], [8, 0, -80], [-24, 0, -80], [-60, 0, -80], [-92, 0, -90], [-118, 0, -50]] },
    { id: 'RT_counter', class: 'climb', points: [[-96, 0, -85], [-127, 16.7, -85], [-131, 16.7, -98], [-128, 16.7, -104], [-105, 16.7, -103.5], [-100, 16.7, -101.5], [-88, 16.7, -101.5]] }, // round the corner, in front of the faucet and toaster
    { id: 'RT_pantry', class: 'climb', points: [[-24, 0, -40], [-40, 0, -33.3], [-40, 7.2, -45.5], [-10, 7.2, -45.5]] },
    { id: 'RT_garage', class: 'main', points: [[30, 0, -60], [80, 0, -60], [78, 0, -10], [96, 0, -4], [100, 0, 7], [100, 17, -22], [100, 27, -50], [100, 17, -92]] },
    { id: 'RT_dining', class: 'climb', points: [[-99, 0, 60], [-81, 0, 42], [-81, 8.9, 22.3], [-78.3, 8.9, 19], [-90, 14, 19], [-113, 14, 19]] },
    { id: 'RT_fireplace', class: 'climb', points: [[30, 0, 5], [43, 0, 14], [52, 3, 14], [51, 4.2, 22.6], [60.6, 11.4, 22.6], [49.4, 19.8, 22.6], [51, 21, 22.6], [52.3, 21.2, 12], [52.3, 21.2, 6]] },
    { id: 'RT_bookcase', class: 'climb', points: [[-30, 0, 50], [-50, 0, 45], [-54.7, 0.7, 46], [-54.7, 6.2, 58.8], [-54.7, 11.7, 41.2], [-54.7, 17.2, 58.8], [-54.7, 22.7, 41.2], [-54.7, 28.2, 58.8], [-54.7, 33.7, 41.2], [-56, 37, 58.8], [-56, 37, 48]] }, // front lane, up through the gaps
    { id: 'RT_rope', class: 'setpiece', points: [[-56, 37, 48], [-52, 52.2, 51]] },
    { id: 'RT_stairs_lower', class: 'main', points: [[100, 0, 90], [94, 0, 72], [94, 18.4, 46]] },
    { id: 'RT_stairs_upper', class: 'setpiece', points: [[94, 26.1, 35], [94, 46, 10.8]] },
    { id: 'RT_hall', class: 'main', points: [[-130, 0, 90], [-60, 0, 90], [0, 0, 90], [76, 0, 74], [130, 0, 90]] },
    { id: 'RT_bath', class: 'flank', points: [[40, 0, 40], [62, 0, 40], [63, 0, 34], [76, 0, 22]] },
  ],
  // Concealment volumes indoors: no blades, just the perception rule (the cardboard box, the big plants)
  grass: [
    { min: [-46, 0, -21], max: [-34, 0, -9], height: [1, 9], density: 0, concealment: 0.98 }, // inside the cardboard box
    { min: [-138, 0, -40], max: [-130, 0, -32], height: [1, 12], density: 0, concealment: 0.6 }, // kitchen plant
    { min: [-69, 0, -29], max: [-61, 0, -21], height: [1, 12], density: 0, concealment: 0.6 }, // dining corner plant
  ],
  encounters: [
    {
      id: 'E_counter', template: 'LANE_AND_FLANK', region: 'G_kitchen',
      activation: { kind: 'region-enter', region: 'G_kitchen' },
      units: [
        { type: 'based', at: [-120, 16.7, -105], yaw: Math.PI, nodes: [[-124, 16.7, -105], [-116, 16.7, -105]] },
        { type: 'based', at: [-105, 16.7, -105], yaw: Math.PI, nodes: [[-109, 16.7, -105], [-101, 16.7, -105]] },
        { type: 'based', at: [-88, 16.7, -105], yaw: Math.PI, nodes: [[-91, 16.7, -105], [-85, 16.7, -105]] },
        { type: 'trooper', at: [-92, 0, -45], yaw: 0 },
        { type: 'trooper', at: [-70, 0, -60], yaw: 0 },
        { type: 'officer', at: [-92, 16.7, -70], yaw: Math.PI },
      ],
    },
    {
      id: 'E_fridge', template: 'AMBUSH_POCKET', region: 'G_fridge',
      activation: { kind: 'region-enter', region: 'G_fridge' },
      units: [
        { type: 'trooper', at: [-61, 16.4, -105], yaw: Math.PI },
        { type: 'trooper', at: [-65, 24.4, -105], yaw: Math.PI },
      ],
    },
    {
      id: 'E_dining', template: 'HIGH_GROUND_TAX', region: 'G_dining',
      activation: { kind: 'region-enter', region: 'G_dining' },
      units: [
        { type: 'grenadier', at: [-108, 14, 19], yaw: Math.PI, nodes: [[-111, 14, 19], [-104, 14, 19]] },
        { type: 'grenadier', at: [-90, 14, 19], yaw: Math.PI, nodes: [[-94, 14, 19], [-87, 14, 19]] },
        { type: 'sniper', at: [-134, 37, 20], yaw: -Math.PI / 2 },
      ],
    },
    {
      id: 'E_fireplace', template: 'PICKET_LINE', region: 'G_living',
      activation: { kind: 'region-enter', region: 'G_living' },
      units: [
        { type: 'based', at: [50, 3, -3], yaw: Math.PI / 2, nodes: [[50, 3, -6], [50, 3, 0]] },
        { type: 'based', at: [50, 3, 13], yaw: Math.PI / 2, nodes: [[50, 3, 10], [50, 3, 16]] },
        { type: 'based', at: [54, 20.6, 5], yaw: Math.PI / 2, nodes: [[54, 20.6, 1], [54, 20.6, 9]] },
        { type: 'trooper', at: [40, 0, 5], yaw: Math.PI / 2 },
      ],
    },
    {
      id: 'E_garage', template: 'HIGH_GROUND_TAX', region: 'G_garage',
      activation: { kind: 'region-enter', region: 'G_garage' },
      units: [
        { type: 'sniper', at: [100, 27, -58], yaw: Math.PI / 2 },
        { type: 'trooper', at: [95, 0, -60], yaw: Math.PI / 2 },
        { type: 'trooper', at: [105, 0, -50], yaw: Math.PI / 2 },
      ],
    },
    {
      id: 'E_stairs', template: 'PICKET_LINE', region: 'G_stairtop',
      activation: { kind: 'objective', objective: 'rig_stairs' },
      units: [
        { type: 'based', at: [102, 46, 11.5], yaw: Math.PI, nodes: [[99, 46, 11.5], [105, 46, 11.5]] },
        { type: 'based', at: [116, 46, 11.2], yaw: Math.PI, nodes: [[113, 46, 11.2], [119, 46, 11.2]] },
        { type: 'based', at: [128, 46, 11.5], yaw: Math.PI, nodes: [[125, 46, 11.5], [131, 46, 11.5]] },
        { type: 'officer', at: [110, 46, 12.5], yaw: Math.PI },
      ],
    },
    {
      id: 'E_hall_wave', template: 'PICKET_LINE', region: 'G_hall',
      activation: { kind: 'schedule', delay: 12, after: 'E_stairs' },
      units: [
        { type: 'trooper', at: [-6, 0, 100], yaw: 0 },
        { type: 'trooper', at: [6, 0, 100], yaw: 0 },
        { type: 'trooper', at: [0, 0, 94], yaw: 0 },
        { type: 'flamer', at: [12, 0, 98], yaw: 0 },
      ],
    },
    {
      id: 'E_landing', template: 'PICKET_LINE', region: 'G_landing',
      activation: { kind: 'region-enter', region: 'G_landing' },
      units: [
        { type: 'based', at: [-20, 52, 56], yaw: 0, nodes: [[-24, 52, 56], [-16, 52, 56]] },
        { type: 'based', at: [20, 52, 56], yaw: 0, nodes: [[16, 52, 56], [24, 52, 56]] },
      ],
    },
  ],
  patrols: [
    { id: 'PT_kitchen', points: [[-92, 0, -50], [-63, 0, -85], [-45, 0, -41], [-92, 0, -50]], units: ['trooper', 'trooper'], speed: 3.2, pause: 1.5 },
    { id: 'PT_hall', points: [[0, 0, 100], [76, 0, 78], [110, 0, 80], [-100, 0, 78], [0, 0, 100]], units: ['trooper', 'trooper', 'trooper'], speed: 3.2, pause: 2 },
    { id: 'PT_living', points: [[-20, 0, 32], [40, 0, 40], [40, 0, -12], [0, 0, 62], [-20, 0, 32]], units: ['trooper', 'trooper', 'flamer'], speed: 3.0, pause: 2 },
    { id: 'PT_garage', points: [[100, 0, -105], [78, 0, -60], [130, 0, -30], [100, 0, -105]], units: ['trooper', 'trooper'], speed: 3.2, pause: 1.5 },
  ],
  pockets: {
    spots: [
      { at: [-99, 0, 19], region: 'G_dining' }, // under the table
      { at: [-30, 0, -40], region: 'G_pantry' },
      { at: [-32, 0, -100], region: 'G_mudroom' },
      { at: [12, 0, 12], region: 'G_living' }, // under the couch
      { at: [70, 0, 60], region: 'G_closet' },
      { at: [90, 0, 2], region: 'G_garage' },
      { at: [-63, 0.6, -103], region: 'G_fridge' },
      { at: [116, 0, 60], region: 'G_stairs' }, // under the stairs
    ],
    tables: [
      { units: ['trooper', 'trooper', 'trooper'], weight: 3 },
      { units: ['trooper', 'trooper', 'flamer'], weight: 1 },
      { units: ['based', 'based'], weight: 2 },
    ],
    chance: 0.3,
    cooldown: 40,
  },
  hazards: [
    {
      id: 'H_biscuit', period: 0, telegraph: { cue: 'jingle', lead: 1.5 },
      phases: [
        { at: 0, name: 'paws', ops: [{ op: 'quakeShadow', from: [-24, 0, -111], to: [0, 0, 90], radius: 12, duration: 6, magnitude: 0.7 }] },
        { at: 0.5, name: 'push', ops: [{ op: 'pushVolume', min: [-49, 0, -111], max: [61, 6, -31], force: [3, 2, 14], duration: 3 }] },
      ],
    },
  ],
  pickups: [
    { kind: 'marble', id: 'marble_fridge', at: [-63, 33.2, -104] },
    { kind: 'marble', id: 'marble_drawer', at: [-118, 11.2, -56] },
    { kind: 'marble', id: 'marble_china', at: [-134, 37.2, 20] },
    { kind: 'marble', id: 'marble_drain', at: [128, 0.2, -20] },
    { kind: 'marble', id: 'marble_sink', at: [83, 15.3, 14] },
    { kind: 'ammo', at: [-92, 16.7, -64] }, { kind: 'ammo', at: [-60, 14.2, 105] }, { kind: 'ammo', at: [130, 0, -46] }, { kind: 'ammo', at: [12, 8.2, -10] },
    { kind: 'glue', at: [-24, 6.9, -46] }, { kind: 'glue', at: [70, 0, 15] }, { kind: 'glue', at: [116, 0, 60] },
    { kind: 'moldTray', at: [0, 52.2, 60] },
    { kind: 'flamer', at: [-66, 33.2, -101] },
    { kind: 'bazooka', at: [100, 0.2, -45] },
    { kind: 'ball', id: 'ball', at: [12, 0.6, 12] },
  ],
  interactables: [
    { id: 'use_drawer', kind: 'use', at: [-118, 11, -56], prompt: 'HOLD E — TAKE THE STRING', grants: 'string', once: true },
    { id: 'use_gap', kind: 'use', at: [94, 18.6, 44], prompt: 'HOLD E — TIE THE RULER ACROSS', requires: 'string', lockedPrompt: 'THE RUN STOPS HERE — NEED STRING (JUNK DRAWER)', grants: 'bridge', once: true },
    { id: 'use_photo', kind: 'use', at: [52, 20.7, 5], prompt: 'HOLD E — STRAIGHTEN THE PHOTO', once: true },
    { id: 'use_record', kind: 'use', at: [-48, 0, -20], prompt: 'HOLD E — PUT THE RECORD ON' },
    { id: 'use_microwave', kind: 'use', at: [-126.5, 16.7, -60], prompt: 'HOLD E — TYPE THE CODE', once: true },
    { id: 'use_flap', kind: 'use', at: [-24, 0, -105], prompt: 'HOLD E — ROLL THE BALL UNDER THE FLAP', requires: 'ball', lockedPrompt: 'THE FLAP IS STUCK — BISCUIT COULD OPEN IT', grants: 'lured', once: true },
    { id: 'launch_toaster', kind: 'launch', at: [-95, 16.7, -101], to: [-63, 33.4, -104], prompt: 'HOLD E — PRESS THE LEVER', flightTime: 1.4 },
    { id: 'warp_vacuum', kind: 'warp', at: [82, 0, 54], to: [0, 52.2, 62], prompt: 'HOLD E — INTO THE HOSE' },
  ],
  links: [
    { id: 'L_chute_up', kind: 'chute', name: 'the laundry chute', min: [55, 42, -50], max: [61, 50, -44], to: { map: 'u', spawn: [0, 0, 60], yaw: Math.PI } },
    { id: 'L_stairs_G', kind: 'stairs', name: 'the stairs', min: [95, 44, 10.4], max: [139, 52, 12], to: { map: 'u', spawn: [115, 0, 10], yaw: Math.PI }, foundBy: 'g1' },
    { id: 'L_dogdoor', kind: 'door', name: 'the dog door', min: [-28, 0, -114], max: [-20, 6, -109], to: { map: 'y', spawn: [-24, 0, -118], yaw: Math.PI }, foundBy: 'g2' },
    { id: 'L_garage', kind: 'gap', name: 'under the garage door', min: [70, 0, -114], max: [130, 3, -110], to: { map: 'y', spawn: [100, 0, -118], yaw: Math.PI } },
    { id: 'L_bstairs', kind: 'door', name: 'the basement stairs', min: [2, 0, -40], max: [15, 37, -33], to: { map: 'b', spawn: [8, 0, 0], yaw: 0 } },
  ],
  missions: [
    {
      id: 'g1',
      title: 'The Long Hall',
      parSeconds: 260,
      briefing: [
        'Lt. Olive: You came up the laundry chute. Good. That\'s the back hall of the house.',
        'The kids are out. The box goes to the rummage sale Saturday. We are not going in that box.',
        'Upstairs is where the kids live. The stairs are the way. The kids built a marble run down them and never finished it.',
        'We need string. The kids keep string in the junk drawer. Kitchen\'s west. Tans hold the counter.',
      ],
      objectives: [
        { id: 'reach_kitchen', kind: 'discover', target: 'G_kitchen', text: 'Find the kitchen',
          radio: 'Kitchen\'s west, through the mudroom. The junk drawer is in the counter by the window.',
          radioDone: 'Tans on the counter. Of course there are.' },
        { id: 'clear_counter', kind: 'clear', target: 'E_counter', text: 'Clear the counter',
          radioDone: 'Counter\'s ours. The drawer\'s in the west run, hanging open. Books are stacked at the end — the kids\' way up.' },
        { id: 'get_string', kind: 'use', target: 'use_drawer', text: 'Take the string from the junk drawer', at: [-118, 11, -56],
          radioDone: 'String. Now the stairs. Back across the house — the run stops halfway up.' },
        { id: 'rig_stairs', kind: 'use', target: 'use_gap', text: 'Bridge the marble run\'s gap', at: [94, 18.6, 44],
          radio: 'Hall, then the stairs. Follow the bands. Tie the ruler across where the run stops.',
          radioDone: 'That\'s a bridge. And that\'s every Tan in the hall hearing it. Go.' },
        { id: 'climb_landing', kind: 'reach', target: 'G_stairtop', text: 'Climb to the second floor',
          radioDone: 'Second floor. The kids\' rooms. Go on up, Sergeant.' },
      ],
    },
    {
      id: 'g2',
      title: 'Open House',
      parSeconds: 150,
      briefing: [
        'Lt. Olive: The dog door\'s stuck shut and the yard is the other half of this war.',
        'Biscuit opens it forty times a day. Find his ball. Roll it under the flap. Then hold on to something.',
      ],
      objectives: [
        { id: 'find_ball', kind: 'pickup', target: 'ball', text: 'Find Biscuit\'s ball', at: [12, 0.6, 12],
          radio: 'The ball\'s wherever the dog left it. Try under the couch. It\'s always under the couch.',
          radioDone: 'Tennis ball. Half the fuzz gone. He loves it.' },
        { id: 'lure', kind: 'use', target: 'use_flap', text: 'Roll the ball under the dog door', at: [-24, 0, -105],
          radioDone: 'He heard it. Everyone heard it. Brace.' },
        { id: 'brace', kind: 'wait', target: '', seconds: 8, text: 'Biscuit is coming. Brace.' },
        { id: 'flap_open', kind: 'reach', target: 'G_flap', text: 'Get to the open flap', at: [-24, 0, -108],
          radioDone: 'Flap\'s open. That\'s the yard. Another day, Sergeant — the house first.' },
      ],
    },
  ],
  landmarks: [
    { id: 'L_counter', name: 'the Counter', at: [-107, 16.7, -105] },
    { id: 'L_fridge', name: 'the Fridge', at: [-63, 33, -104] },
    { id: 'L_drawer', name: 'the Junk Drawer', at: [-118, 11, -56] },
    { id: 'L_table', name: 'the Table', at: [-99, 14, 19] },
    { id: 'L_fireplace', name: 'the Fireplace', at: [54, 20, 5] },
    { id: 'L_bookcase', name: 'the Bookcase', at: [-56, 37, 50] },
    { id: 'L_car', name: 'the Car', at: [100, 27, -58] },
    { id: 'L_stairs', name: 'the Stairs', at: [94, 17, 46] },
    { id: 'L_front', name: 'the Front Door', at: [0, 0, 105] },
    { id: 'L_dogdoor', name: 'the Dog Door', at: [-24, 0, -108] },
  ],
};
