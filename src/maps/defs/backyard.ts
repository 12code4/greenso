// Map 02 — THE BACKYARD · "The Green Sea"
// Transcribed from docs/blueprints/map-02-backyard.md. IDs match the blueprint.
// Frame: x ∈ [-30, 30] (west→east), z ∈ [-40, 40] (north fence → south lawn).
// Real footprint: a 3.2 × 4.3 m patch of yard.

import { MapDef } from '../runtime/types';
import { Vec3 } from '../../core/math';

// Flowerbed terraces (soil tiers along the north fence)
const T1 = 1.5; // tier 1 top
const T2 = 3.0; // tier 2 top
const BIRD_RIM = T1 + 8.6; // birdbath stands on tier 1; walkable rim plateau top

// The hose-stream the leaf rides: from the torn hose east along the hose line,
// across the road north of the waypoint, then south down the fence channel
// (x ≈ 28.5, between the road at x=23 and the pickets at x=30.5). Nothing
// taller than the leaf deck may sit in the channel — a 0.32 u crate lip is
// enough for auto-step to walk the rider off the leaf.
const STREAM: Vec3[] = [
  [15, 0.06, -17],
  [19, 0.06, -19.5],
  [24, 0.06, -22],
  [28, 0.06, -18],
  [28.6, 0.06, -8],
  [28.4, 0.06, 2],
  [28.2, 0.06, 12],
  [28.0, 0.06, 22],
  [27.4, 0.06, 30],
  [26.0, 0.06, 38],
];

// Fern's rubber-band breadcrumb trail
const TRAIL: Vec3[] = [[0, 0, 30], [1.2, 0, 24.5], [2.2, 0, 17.5], [-0.8, 0, 10], [0.6, 0, 3.5], [-6, 0, -2], [-12, 0, -5]];

export const BACKYARD: MapDef = {
  id: 'backyard',
  title: 'The Green Sea',
  realFootprint: 'a 3.2 × 4.3 m patch of backyard (60 × 80 u)',
  spawn: [0, 0, 34],
  spawnYaw: Math.PI,
  shell: {
    sky: { horizon: 0xf0d9a8, zenith: 0x7fb0e0 },
    fog: { color: 0xe6d8b4, near: 70, far: 240 },
    sun: { dir: [-0.45, 0.72, 0.55], color: 0xffe4b8, intensity: 2.8 },
    hemi: { sky: 0xcfe6ff, ground: 0x3e5a2a, intensity: 0.6 },
    ground: [
      // Mowed steppe reads lighter
      { kind: 'lawn', min: [-14, 0, 6], max: [12, 0, 26], height: 0.03, color: 0xc8e0a0 },
      // Flowerbed soil terraces
      { kind: 'soil', min: [-30, 0, -40], max: [14, 0, -28], height: T1 },
      { kind: 'soil', min: [-16, 0, -40], max: [14, 0, -33], height: T2 },
      // Puddle under the faucet
      { kind: 'water', min: [-30, 0, -26], max: [-25, 0, -21], height: 0.05, color: 0x6aa6d8 },
    ],
    masses: [
      { kind: 'fence', min: [-32, 0, -42], max: [32, 22, -40.5], color: 0xd8cfb8 }, // north fence
      { kind: 'fence', min: [30.5, 0, -42], max: [32, 22, 42], color: 0xd8cfb8 }, // east fence
      { kind: 'siding', min: [-34, 0, -42], max: [-30.5, 40, 42], color: 0xe8e0cc }, // the house
      { kind: 'mass', min: [-34, 0, 42], max: [34, 9, 48], color: 0x2f5a2a }, // south hedge
    ],
    bounds: { min: [-30.5, 0, -40.5], max: [30.5, 0, 41.5] },
  },

  regions: [
    { id: 'R_bird', name: 'Birdbath Overlook', kind: 'overlook', min: [-28, 8, -36], max: [-20, 14, -28], band: 'A3' },
    { id: 'R_spawn', name: 'Spawn Lawn', kind: 'connector', min: [-8, 0, 26], max: [8, 6, 41], band: 'A0', checkpoint: [0, 0, 34] },
    { id: 'R_steppe', name: 'Mowed Steppe', kind: 'arena', min: [-14, 0, 6], max: [12, 6, 26], band: 'A0', checkpoint: [0, 0.03, 22] },
    { id: 'R_jungle', name: 'The Jungle', kind: 'arena', min: [-14, 0, -16], max: [14, 6, 6], band: 'A0', checkpoint: [0, 0, 3] },
    { id: 'R_gnome', name: 'Gnome Clearing', kind: 'arena', min: [-30, 0, -16], max: [-14, 8, 4], band: 'A0', checkpoint: [-19, 0, 1] },
    { id: 'R_hose', name: 'Hose Ridge', kind: 'connector', min: [-30, 0, -20], max: [15, 4, -16], band: 'A1' },
    { id: 'R_bed', name: 'Flowerbed Highlands', kind: 'arena', min: [-30, 0, -40], max: [14, 12, -20], band: 'A2', checkpoint: [-20, T1, -30] },
    { id: 'R_convoy', name: 'Convoy Road', kind: 'arena', min: [15, 0, -30], max: [30.5, 6, 30], band: 'A0', checkpoint: [20, 0, 6] },
    { id: 'R_exit', name: 'The Drain', kind: 'exit', min: [16, 0, 30], max: [30.5, 6, 41.5], band: 'A0' },
  ],

  props: [
    // ----- Spawn lawn: the key, the trail begins -----
    { kit: 'key_house', at: [3.5, 0, 37], yaw: 0.5 },
    ...TRAIL.map((p) => ({ kit: 'rubber_band', at: p })),

    // ----- Steppe: stepping stones (RT_stones), sprinkler, the bone -----
    { kit: 'stone_stepping', at: [0, 0.03, 22], variant: 0 },
    { kit: 'stone_stepping', at: [2.4, 0.03, 17.2], variant: 1 },
    { kit: 'stone_stepping', at: [-0.8, 0.03, 12.4], variant: 2 },
    { kit: 'stone_stepping', at: [1.4, 0.03, 7.6], variant: 0 },
    { kit: 'sprinkler_head', at: [-3, 0.03, 15] },
    { kit: 'bone', at: [8.5, 0.03, 14], yaw: 0.4 },

    // ----- Jungle: litter as terrain, dominoes as a kid's picket -----
    { kit: 'boot_rain', at: [8.5, 0, -10], yaw: 0 },
    { kit: 'pot_flower', at: [-9, 0, -12] },
    { kit: 'can_lying', at: [5, 0, 0.5], yaw: 0.9, variant: 1 },
    { kit: 'domino', at: [-4.5, 0, -6], yaw: 0.2 },
    { kit: 'domino', at: [-3.9, 0, -6.3], yaw: 0.1 },
    { kit: 'domino', at: [-3.3, 0, -6.5], yaw: 0.25 },

    // ----- Gnome clearing: the Gnome, the kid's fortifications -----
    { kit: 'gnome', at: [-24, 0, -8], yaw: Math.PI * 0.8 },
    { kit: 'barricade_popsicle', at: [-18, 0, -5], yaw: 0.1 },
    { kit: 'barricade_popsicle', at: [-22.5, 0, -3.5], yaw: 0.35 },
    { kit: 'barricade_popsicle', at: [-27, 0, -5], yaw: -0.2 },
    { kit: 'domino', at: [-16.5, 0, 1.5], yaw: 0.3 },
    { kit: 'domino', at: [-17.1, 0, 1.6], yaw: 0.28 },
    { kit: 'domino', at: [-20, 0, 2], yaw: -0.1 },
    { kit: 'domino', at: [-20.6, 0, 2.05], yaw: -0.15 },

    // ----- Hose ridge across the yard (cover ridge; the torn end feeds the stream) -----
    { kit: 'hose_ridge', at: [-26, 0, -18] },
    { kit: 'hose_ridge', at: [-18, 0, -18] },
    { kit: 'hose_ridge', at: [-10, 0, -18] },
    { kit: 'hose_ridge', at: [-2, 0, -18] },
    { kit: 'hose_ridge', at: [6, 0, -18] },
    { kit: 'hose_ridge', at: [13, 0, -18] }, // the torn end; the stream starts just past it
    { kit: 'hose_coil', at: [-27, 0, -23] },
    { kit: 'faucet_yard', at: [-30.2, 0, -23] },

    // ----- Flowerbed: brick steps up the tiers (RT_bricks), flowers, the birdbath + rake -----
    // Bricks sit flush against the tier faces (a capsule falls into any gap > 0.36)
    { kit: 'brick_garden', at: [-20, 0, -27.1] }, // lawn → tier 1 (1.2 → 1.5)
    { kit: 'brick_garden', at: [-13, T1, -32.1] }, // tier 1 → tier 2 (2.7 → 3.0)
    { kit: 'birdbath', at: [-24, T1, -33] },
    // The rake leans against the bath from the lawn, due south: rise 10.1 to the rim
    { kit: 'rake_ramp', at: [-24, 0, -20.5], yaw: Math.PI / 2, variant: 0 },
    // Flowers (stems = thin colliders, petals = canopy)
    ...[[-8, T2, -37], [-3, T2, -38], [3, T2, -36.5], [9, T2, -37.5], [-14, T1, -30], [-6, T1, -30.5], [0, T1, -30], [7, T1, -30.5], [12, T1, -30]]
      .map((p, i) => ({ kit: 'flower', at: p as Vec3, variant: i })),
    { kit: 'pot_flower', at: [12, T2, -37] },

    // ----- Convoy road: hot-wheels track, toy cars, the Tan waypoint -----
    ...Array.from({ length: 11 }, (_, i) => ({ kit: 'track_hotwheels', at: [23, 0, -27.2 + i * 5.6] as Vec3, yaw: Math.PI / 2 })),
    { kit: 'car_toy', at: [23, 0.1, -25], yaw: Math.PI / 2, variant: 0 },
    { kit: 'car_toy', at: [23, 0.1, 14], yaw: Math.PI / 2 + 0.2, variant: 2 },
    { kit: 'box_juice', at: [19.5, 0, -7], yaw: 0.2 },
    { kit: 'box_juice', at: [20.8, 0, -7.2], yaw: 0.1, variant: 1 },
    { kit: 'box_juice', at: [25.5, 0, -6.5], yaw: -0.2 },
    { kit: 'box_juice', at: [26.6, 0, -6.2], yaw: -0.1, variant: 1 },
    { kit: 'barricade_popsicle', at: [23.5, 0, -1], yaw: 0.05 },
    { kit: 'batt_crate', at: [25.5, 0, -10], yaw: 0.3 },
    { kit: 'batt_crate', at: [20.5, 0, -11], yaw: -0.4 },
    { kit: 'batt_crate', at: [24.3, 0.1, -13], yaw: 0.9 },
    { kit: 'domino', at: [18.5, 0, 2], yaw: 0.2 },
    { kit: 'domino', at: [19.1, 0, 2.1], yaw: 0.2 },
    { kit: 'domino', at: [26.3, 0, 3], yaw: -0.3 },

    // ----- South lawn dressing -----
    { kit: 'can_soda', at: [-11, 0, 32], variant: 2 },
    { kit: 'matchbox', at: [11, 0, 36], yaw: 0.6 },
  ],

  routes: [
    { id: 'RT_stones', class: 'main', points: [[0, 0, 30], [0, 0.77, 22], [2.4, 0.77, 17.2], [-0.8, 0.77, 12.4], [1.4, 0.77, 7.6], [0, 0, 3]] },
    { id: 'RT_jungle_gnome', class: 'main', points: [[0, 0, 3], [-6, 0, -2], [-12, 0, -5], [-19, 0, 1]] },
    { id: 'RT_bricks', class: 'climb', points: [[-19, 0, 1], [-20, 0, -24.5], [-20, 1.2, -27.1], [-20, T1, -29.5], [-13, T1, -30.5], [-13, 2.7, -32.1], [-13, T2, -34.5]] },
    { id: 'RT_rake', class: 'climb', points: [[-24, 0, -18.5], [-24, 0.6, -20.6], [-24, 5, -25.5], [-24, 9.9, -30.3], [-24, BIRD_RIM, -32.5]] },
    { id: 'RT_hose_gap', class: 'flank', points: [[-19, 0, 1], [-25, 0, -14], [-25, 0.35, -18], [-25, 0, -21]] },
    { id: 'RT_convoy', class: 'main', points: [[0, 0, 3], [10, 0, -2], [18, 0, -4], [23, 0.1, 6]] },
    { id: 'RT_boot', class: 'crawl', points: [[12, 0, -10], [9.5, 0, -10], [7.5, 0, -10]] },
    { id: 'RT_leaf', class: 'setpiece', points: STREAM },
  ],

  grass: [
    // The Jungle: over-head canopy, real concealment
    { min: [-14, 0, -16], max: [14, 0, 6], height: [1.1, 1.7], density: 1.3, concealment: 0.75 },
    // Mowed steppe: short, cosmetic
    { min: [-14, 0.03, 6], max: [12, 0.03, 26], height: [0.25, 0.4], density: 0.9, concealment: 0 },
    // Gnome clearing edges + convoy verge: patchy medium grass
    { min: [-30, 0, -16], max: [-14, 0, 4], height: [0.5, 0.9], density: 0.5, concealment: 0.25 },
    { min: [15, 0, -30], max: [21, 0, 30], height: [0.9, 1.4], density: 1.0, concealment: 0.6 },
    { min: [25.5, 0, -30], max: [30, 0, 30], height: [0.9, 1.4], density: 0.9, concealment: 0.6 },
    // South lawn
    { min: [-30, 0, 26], max: [30, 0, 41], height: [0.6, 1.0], density: 0.7, concealment: 0.3 },
  ],

  encounters: [
    {
      id: 'E_jungle', template: 'AMBUSH_POCKET', region: 'R_jungle',
      activation: { kind: 'region-enter', region: 'R_jungle' },
      units: [
        { type: 'trooper', at: [-6, 0, -8] },
        { type: 'trooper', at: [4, 0, -10] },
        { type: 'trooper', at: [1, 0, -3] },
      ],
    },
    {
      id: 'E_gnome', template: 'LANE_AND_FLANK', region: 'R_gnome',
      activation: { kind: 'region-enter', region: 'R_gnome' },
      units: [
        { type: 'based', at: [-20, 0, -12], nodes: [[-22.5, 0, -12], [-18, 0, -12]] },
        { type: 'based', at: [-26, 0, -11], nodes: [[-28, 0, -11], [-24.5, 0, -11.5]] },
        { type: 'based', at: [-16, 0, -13.5], nodes: [[-17.5, 0, -14], [-15, 0, -13]] },
        { type: 'trooper', at: [-28, 0, -3] },
        { type: 'trooper', at: [-28.5, 0, 1.5] },
      ],
    },
    {
      id: 'E_bed', template: 'HIGH_GROUND_TAX', region: 'R_bed',
      activation: { kind: 'region-enter', region: 'R_bed' },
      units: [
        { type: 'grenadier', at: [-6, T2, -37.5], nodes: [[-8, T2, -37.5], [-4, T2, -37.5]] },
        { type: 'grenadier', at: [4, T2, -37.5], nodes: [[2, T2, -37.5], [6, T2, -37.5]] },
        { type: 'sniper', at: [10, T2, -38.5], yaw: Math.PI },
      ],
    },
    {
      id: 'E_convoy', template: 'PICKET_LINE', region: 'R_convoy',
      activation: { kind: 'objective', objective: 'raid_convoy' },
      units: [
        { type: 'based', at: [20, 0, -5], nodes: [[18.5, 0, -5], [21.5, 0, -5]] },
        { type: 'based', at: [26.5, 0, -8.5], nodes: [[25, 0, -8.5], [28, 0, -8.5]] },
        { type: 'based', at: [23, 0.1, -2.5], nodes: [[22, 0.1, -3], [24, 0.1, -2]] },
        { type: 'officer', at: [23, 0, -11] },
        { type: 'trooper', at: [18, 0, -14] },
      ],
    },
    {
      id: 'E_stream', template: 'LANE_AND_FLANK', region: 'R_convoy',
      activation: { kind: 'objective', objective: 'escape_leaf' },
      units: [
        { type: 'based', at: [25, 0, 4], yaw: -Math.PI / 2, nodes: [[25, 0, 3], [25, 0, 6]] },
        { type: 'based', at: [24.5, 0, 16], yaw: -Math.PI / 2, nodes: [[24.5, 0, 15], [24.5, 0, 18]] },
        { type: 'trooper', at: [24, 0, 26] },
      ],
    },
  ],

  hazards: [
    {
      id: 'H_sprinkler', period: 90, telegraph: { cue: 'pipe_knock', lead: 3 },
      phases: [
        {
          at: 0, name: 'sector A — steppe',
          ops: [
            { op: 'sprinklerSweep', head: [-3, 0.03, 15], fromDeg: 200, toDeg: 340, range: 13, duration: 14 },
            { op: 'pushVolume', min: [-14, 0, 6], max: [12, 3, 26], force: [-2.5, 0, 0], duration: 14 },
            { op: 'soakVolume', min: [-14, 0, 6], max: [12, 3, 26], duration: 14 },
          ],
        },
        {
          at: 30, name: 'sector B — jungle',
          ops: [
            { op: 'sprinklerSweep', head: [-3, 0.03, 15], fromDeg: 20, toDeg: 160, range: 24, duration: 14 },
            { op: 'pushVolume', min: [-14, 0, -16], max: [14, 3, 6], force: [-2.0, 0, -1.0], duration: 14 },
            { op: 'soakVolume', min: [-14, 0, -16], max: [14, 3, 6], duration: 14 },
          ],
        },
        {
          at: 60, name: 'sector C — gnome & bed edge',
          ops: [
            { op: 'sprinklerSweep', head: [-15, 0, -17], fromDeg: 120, toDeg: 300, range: 14, duration: 14 },
            { op: 'pushVolume', min: [-30, 0, -26], max: [-14, 3, 4], force: [0, 0, 2.5], duration: 14 },
            { op: 'soakVolume', min: [-30, 0, -26], max: [-14, 3, 4], duration: 14 },
          ],
        },
      ],
    },
    {
      id: 'H_dog', period: 42, jitter: 25, telegraph: { cue: 'jingle', lead: 2.5 },
      phases: [
        { at: 0, name: 'fetch run', ops: [{ op: 'quakeShadow', from: [36, 0, 19], to: [-36, 0, 11], radius: 4.5, duration: 3.2, magnitude: 0.55 }] },
      ],
    },
  ],

  pickups: [
    // Ammo per pocket
    { kind: 'ammo', at: [-4, 0, -3.5] },
    { kind: 'ammo', at: [-20, 0, 0.5] },
    { kind: 'ammo', at: [-2, T2, -36] },
    { kind: 'ammo', at: [20, 0, 4] },
    { kind: 'bands', at: [-24, BIRD_RIM + 0.1, -34.2] },
    { kind: 'bands', at: [-14, T1, -29] },
    // Glue at pocket exits; mold tray on the flowerbed (~60% of path)
    { kind: 'glue', at: [-13, 0, -14] },
    { kind: 'glue', at: [-14, T1, -24.5] },
    { kind: 'moldTray', at: [0, T2, -37.5] },
    // Marbles: 2 early-visible, 2 hidden in kit logic, 1 skill-gated
    { kind: 'marble', id: 'marble_rim', at: [-24, BIRD_RIM + 0.15, -30.8] },
    { kind: 'marble', id: 'marble_road', at: [23, 0.25, -26] },
    { kind: 'marble', id: 'marble_boot', at: [7.4, 0.3, -10] },
    { kind: 'marble', id: 'marble_bone', at: [8.5, 0.18, 13.3] },
    { kind: 'marble', id: 'marble_ride', at: [28.4, 1.5, 10] },
  ],

  pows: [{ id: 'fern', name: 'Cpl. Fern', at: [-24, BIRD_RIM, -34.6], yaw: 0.2, post: [-24, BIRD_RIM, -34.6] }],

  platforms: [{ id: 'leaf', kit: 'leaf_raft', path: STREAM, speed: 4.2, startOn: 'escape_leaf', stream: true }],

  aircraft: [
    { id: 'E_air', on: 'E_convoy', count: 2, interval: 12, path: [[23, 9, -48], [23, 6, -20], [24, 3.2, -4], [23, 5.5, 14], [22, 9, 48]] },
  ],

  mission: {
    title: 'The Green Sea',
    parSeconds: 200,
    briefing: [
      'Lt. Olive: Moss. Fern\'s patrol went dark past the Stones this morning.',
      'She leaves rubber bands when she moves. Follow them to the Gnome.',
      'Tans are in the grass. It\'s tall grass. You won\'t see them first.',
      'Bring her home. And find out what they\'re moving out there.',
    ],
    objectives: [
      { id: 'reach_gnome', kind: 'reach', target: 'R_gnome', text: 'Follow Fern\'s trail to the Gnome',
        radio: 'Follow the bands. Stones first, then the grass. Rally at Gnome.',
        radioDone: 'That\'s her handiwork on those barricades. Tans dug in. Clear them.' },
      { id: 'clear_gnome', kind: 'clear', target: 'E_gnome', text: 'Clear the Gnome Clearing',
        radioDone: 'Clearing\'s ours. Scouts saw a road cut east through the grass. Go look.' },
      { id: 'find_convoy', kind: 'discover', target: 'R_convoy', text: 'Find the Tan supply route',
        radioDone: 'A race track. They\'re running batteries down a race track. Noted. Now — Fern.' },
      { id: 'rescue_fern', kind: 'rescue', target: 'fern', text: 'Rescue Cpl. Fern at the Birdbath',
        radio: 'Fern\'s glued to the Birdbath rim. Up the flowerbed. Mind the perch — grenadiers.',
        radioDone: 'Fern: "Took you long enough. Take my spare bands. I\'ve got the high ground."' },
      { id: 'raid_convoy', kind: 'clear', target: 'E_convoy', text: 'Raid the convoy waypoint',
        radio: 'Hit the waypoint on the road. Fern\'s covering from the bath. Watch the sky.',
        radioDone: 'Waypoint\'s scrap. More gliders inbound — get to the torn hose. There\'s a stream.' },
      { id: 'escape_leaf', kind: 'ride', target: 'R_exit', text: 'Ride the leaf down the hose-stream',
        radio: 'There\'s a leaf at the tear. Stand on it. Don\'t fall in.',
        radioDone: 'Extraction complete. Moss — you owe Fern a drink.' },
    ],
  },

  landmarks: [
    { id: 'L_gnome', name: 'the Gnome', at: [-24, 0, -8] },
    { id: 'L_bird', name: 'the Birdbath', at: [-24, T1, -33] },
    { id: 'L_hose', name: 'the Hose', at: [-8, 0, -18] },
    { id: 'L_stones', name: 'the Stones', at: [0.8, 0, 15] },
    { id: 'L_bed', name: 'the Bed', at: [-6, T2, -36] },
    { id: 'L_faucet', name: 'the Faucet', at: [-30, 0, -23] },
  ],
};
