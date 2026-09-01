// Kit test scene — the M0 arena rebuilt at canonical scale (docs/06 §1) from
// Household Kit props. Firing range + climb routes + a metric ruler. This is
// the visual regression baseline for the kit and the M0 controller playground.

import { MapDef } from '../runtime/types';

const B = 0.74; // alphabet block / hardcover book thickness (4 cm)

export const KITTEST: MapDef = {
  id: 'kittest',
  title: 'Kit Test Scene',
  realFootprint: 'a 2.7 × 2.2 m corner of bedroom floor (50 × 40 u)',
  spawn: [4, 0, 16],
  spawnYaw: Math.PI,
  shell: {
    sky: { horizon: 0xd9c6a2, zenith: 0xc8b48e },
    fog: { color: 0xd9c6a2, near: 60, far: 220 },
    sun: { dir: [0.55, 0.8, 0.45], color: 0xffe8c4, intensity: 2.6 },
    hemi: { sky: 0xfff2dd, ground: 0x6b543a, intensity: 0.55 },
    ground: [
      { kind: 'stone', min: [-6, 0, 8], max: [14, 0, 22], height: 0.15, color: 0x9c4a44 }, // the rug
    ],
    masses: [
      { kind: 'siding', min: [-40, 0, -20.5], max: [40, 40, -19], color: 0xcdbfa8 }, // back wall
      { kind: 'siding', min: [-27, 0, -22], max: [-25.5, 40, 40], color: 0xcdbfa8 }, // left wall
      { kind: 'mass', min: [40, 0, -20], max: [60, 26, 40], color: 0x5c4a38 }, // dresser
      { kind: 'mass', min: [-30, 0, 40], max: [60, 18, 60], color: 0x6b5844 }, // couch
    ],
    bounds: { min: [-25, 0, -19], max: [40, 0, 40] },
  },
  regions: [
    { id: 'R_rug', name: 'The Rug', kind: 'connector', min: [-6, 0, 8], max: [14, 6, 22], band: 'A0', checkpoint: [4, 0.15, 16] },
    { id: 'R_range', name: 'The Range', kind: 'arena', min: [-25, 0, -19], max: [40, 6, 8], band: 'A0' },
  ],
  props: [
    // Scale reference at spawn
    { kit: 'metric_ruler', at: [8, 0.15, 12] },
    { kit: 'key_house', at: [1, 0.15, 13], yaw: 0.4 },

    // Domino "sandbag" line (crouch cover, 0.89 tall)
    ...[-10, -6.5, -3, 3.5, 7, 10.5].map((x) => ({ kit: 'domino', at: [x, 0, 0] as [number, number, number], yaw: 0.05 * x })),

    // Left flank: shoebox perch (2.2 roof) via alphabet-block stair
    { kit: 'box_shoe', at: [-14, 0, 5] },
    { kit: 'block_alpha', at: [-9.5, 0, 6.5], variant: 0 },
    { kit: 'block_alpha', at: [-10.9, 0, 5.2], variant: 1 },
    { kit: 'block_alpha', at: [-10.9, B, 5.2], variant: 2 },
    // ...hop from 1.48 onto the shoebox roof (2.32)

    // Book stack (3 hardcovers → 2.22) + ruler bridge from the shoebox
    { kit: 'book_hard', at: [-14, 0, -3.5], variant: 0, yaw: 0.05 },
    { kit: 'book_hard', at: [-13.8, B, -3.4], variant: 1, yaw: -0.04 },
    { kit: 'book_hard', at: [-14.1, 2 * B, -3.6], variant: 3, yaw: 0.02 },
    { kit: 'ruler', at: [-14, 2.3, 0.6], yaw: Math.PI / 2 },

    // Cereal-box monolith and cans on the right
    { kit: 'box_cereal', at: [-4, 0, -16], variant: 0 },
    { kit: 'can_soda', at: [12, 0, -2], variant: 0 },
    { kit: 'can_soda', at: [14, 0, 0.5], variant: 1 },
    { kit: 'can_lying', at: [10, 0, 3.5], yaw: 0.3 },
    { kit: 'cup_mug', at: [20, 0, 10] },
    { kit: 'matchbox', at: [-1, 0, 4] },
    { kit: 'matchbox', at: [6, 0, -4], yaw: 0.7 },
    { kit: 'book_paper', at: [3, 0, -8], yaw: 0.3 },
  ],
  routes: [
    { id: 'RT_blocks', class: 'climb', points: [[-8, 0, 8], [-9.5, B, 6.5], [-10.9, 2 * B, 5.2], [-13, 2.3, 5]] },
    { id: 'RT_ruler', class: 'main', points: [[-14, 2.3, 4], [-14, 2.3, -2.5], [-14, 2.3, -3.5]] },
  ],
  encounters: [],
  hazards: [],
  pickups: [],
  landmarks: [
    { id: 'L_cereal', name: 'the Cereal Box', at: [-4, 0, -16] },
    { id: 'L_mug', name: 'the Mug', at: [20, 0, 10] },
  ],
  targetLanes: [
    { at: [-12, 0, -9], yaw: 0 },
    { at: [-6, 0, -12], yaw: 0, slide: { axis: [1, 0, 0], amp: 2.5, speed: 0.8 } },
    { at: [1, 0, -14], yaw: 0 },
    { at: [7, 0, -12], yaw: 0, slide: { axis: [1, 0, 0], amp: 2.5, speed: 1.1 } },
    { at: [13, 0, -9], yaw: 0 },
  ],
};
