// The Household Kit registry (docs/07). Every prop is a factory recipe with
// canonical dimensions (real cm ÷ 5.4), local colliders, and affordances.
// Meshes are primitives + canvas textures only; the few sculptural props
// (gnome, birdbath) are approximated from primitives too.

import * as THREE from 'three';
import { Vec3 } from '../../core/math';
import { mat, labelTexture } from './materials';

export interface LocalBox {
  center: Vec3;
  size: Vec3;
}

export interface BuiltProp {
  mesh: THREE.Object3D;
  colliders: LocalBox[];
}

export interface KitProp {
  id: string;
  /** Canonical W×H×D in units (height second). */
  dims: Vec3;
  walkableTop?: boolean;
  cover?: 'CC' | 'SC' | 'BW';
  build(variant: number, size?: Vec3): BuiltProp;
}

export const CM = 1 / 5.4; // cm → units

export const boxMesh = (w: number, h: number, d: number, m: THREE.Material, y = h / 2): THREE.Mesh => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};
export const cylMesh = (r: number, h: number, m: THREE.Material, y = h / 2, seg = 18): THREE.Mesh => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};
export const solid = (w: number, h: number, d: number, y = h / 2, x = 0, z = 0): LocalBox => ({
  center: [x, y, z],
  size: [w, h, d],
});
export const pickColor = (variant: number, colors: number[]): number => colors[Math.abs(variant) % colors.length];

export const BOOK_COLORS = [0x8a4a3c, 0x3c5a7a, 0x4a6b4a, 0xc9a04e, 0x704a68, 0x2f2f38];
const BLOCK_COLORS = [0xc96f5e, 0x6e8fc9, 0xd9b358, 0x7aa86a];
const CAN_LIVERIES: [string, string, string, number][] = [
  ['#c93a3a', '#f2e6c8', 'ZAP!', 0xc94040],
  ['#2f63b8', '#f2e6c8', 'FIZZ', 0x4076c9],
  ['#3c9a4a', '#f2e6c8', 'LIMEY', 0x59a054],
  ['#e08a22', '#3a2a10', 'PEEL', 0xd98a2b],
];

export const KIT: Record<string, KitProp> = {};

export function reg(p: KitProp): void {
  KIT[p.id] = p;
}

// ------------------------------------------------------------ A. Structural

reg({
  id: 'book_hard',
  dims: [24 * CM, 4 * CM, 16 * CM],
  walkableTop: true,
  cover: 'CC',
  build(v) {
    const w = 24 * CM, h = 4 * CM, d = 16 * CM;
    const g = new THREE.Group();
    const cover = pickColor(v, BOOK_COLORS);
    g.add(boxMesh(w, h, d, mat('PAPERBOARD', cover)));
    // Page block peeking out on three sides
    const pages = boxMesh(w * 0.96, h * 0.7, d * 0.99, mat('PAPERBOARD', 0xf1e9d6), h / 2);
    pages.position.x = w * 0.03;
    g.add(pages);
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'book_paper',
  dims: [18 * CM, 2 * CM, 11 * CM],
  walkableTop: true,
  build(v) {
    const w = 18 * CM, h = 2 * CM, d = 11 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('PAPERBOARD', pickColor(v + 2, BOOK_COLORS))));
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'box_cereal',
  dims: [20 * CM, 30 * CM, 7 * CM],
  cover: 'BW',
  build(v) {
    const w = 20 * CM, h = 30 * CM, d = 7 * CM;
    const g = new THREE.Group();
    const tex = labelTexture(v % 2 ? '#e0552b' : '#d99a1e', v % 2 ? '#f5d76e' : '#7a2e12', v % 2 ? 'OAT-O\'S' : 'CRUNCH');
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    const body = boxMesh(w, h, d, m);
    g.add(body);
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'box_shoe',
  dims: [33 * CM, 12 * CM, 19 * CM],
  walkableTop: true,
  cover: 'BW',
  build() {
    const w = 33 * CM, h = 12 * CM, d = 19 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('PAPERBOARD', 0x9c8468)));
    const lid = boxMesh(w + 0.12, 0.12, d + 0.12, mat('PAPERBOARD', 0x8a7458), h + 0.06);
    g.add(lid);
    return { mesh: g, colliders: [solid(w + 0.12, h + 0.12, d + 0.12)] };
  },
});

reg({
  id: 'block_alpha',
  dims: [4 * CM, 4 * CM, 4 * CM],
  walkableTop: true,
  cover: 'CC',
  build(v) {
    const s = 4 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(s, s, s, mat('WOOD_WARM', pickColor(v, BLOCK_COLORS))));
    // Letter face inset
    const face = boxMesh(s * 0.7, s * 0.7, 0.02, mat('WOOD_WARM', 0xf3e9d0), s / 2);
    face.position.z = s / 2;
    g.add(face);
    return { mesh: g, colliders: [solid(s, s, s)] };
  },
});

reg({
  id: 'can_soda',
  dims: [6.6 * CM, 12.2 * CM, 6.6 * CM],
  walkableTop: true,
  cover: 'SC',
  build(v) {
    const r = 3.3 * CM, h = 12.2 * CM;
    const liv = CAN_LIVERIES[Math.abs(v) % CAN_LIVERIES.length];
    const g = new THREE.Group();
    const tex = labelTexture(liv[0], liv[1], liv[2]);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h * 0.86, 20),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.35 }),
    );
    body.position.y = h / 2;
    body.castShadow = true;
    g.add(body);
    g.add(cylMesh(r * 0.92, h * 0.07, mat('METAL_KITCHEN', 0xc8c8c8), h * 0.965));
    g.add(cylMesh(r * 0.92, h * 0.07, mat('METAL_KITCHEN', 0xc8c8c8), h * 0.035));
    return { mesh: g, colliders: [solid(r * 2, h, r * 2)] };
  },
});

reg({
  id: 'can_lying',
  dims: [12.2 * CM, 6.6 * CM, 6.6 * CM],
  walkableTop: true,
  cover: 'CC',
  build(v) {
    const r = 3.3 * CM, len = 12.2 * CM;
    const liv = CAN_LIVERIES[Math.abs(v + 2) % CAN_LIVERIES.length];
    const g = new THREE.Group();
    const body = cylMesh(r, len, mat('METAL_KITCHEN', liv[3]), r);
    body.rotation.z = Math.PI / 2;
    g.add(body);
    return { mesh: g, colliders: [solid(len, r * 2, r * 2)] };
  },
});

reg({
  id: 'cup_mug',
  dims: [8 * CM, 9.5 * CM, 8 * CM],
  walkableTop: true,
  cover: 'SC',
  build(v) {
    const r = 4 * CM, h = 9.5 * CM;
    const g = new THREE.Group();
    g.add(cylMesh(r, h, mat('CERAMIC', pickColor(v, [0xe8e2d4, 0x9ec1d9, 0xd9a99e])), h / 2, 22));
    const handle = new THREE.Mesh(new THREE.TorusGeometry(r * 0.45, r * 0.12, 8, 16, Math.PI), mat('CERAMIC', 0xe8e2d4));
    handle.position.set(r, h * 0.55, 0);
    handle.rotation.z = -Math.PI / 2;
    handle.castShadow = true;
    g.add(handle);
    return { mesh: g, colliders: [solid(r * 2, h, r * 2), solid(r * 0.6, r * 0.9, r * 0.3, h * 0.55, r * 1.2)] };
  },
});

reg({
  id: 'pot_flower',
  dims: [15 * CM, 14 * CM, 15 * CM],
  walkableTop: true,
  cover: 'BW',
  build() {
    const r = 7.5 * CM, h = 14 * CM;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 20), mat('CERAMIC', 0xb5623d));
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    g.add(cylMesh(r * 1.06, h * 0.12, mat('CERAMIC', 0xc26f48), h * 0.94, 20));
    g.add(cylMesh(r * 0.9, 0.06, mat('STONE', 0x4a3524), h - 0.02, 20)); // soil
    return { mesh: g, colliders: [solid(r * 2, h, r * 2)] };
  },
});

reg({
  id: 'boot_rain',
  dims: [25 * CM, 10 * CM, 23 * CM], // lying on its side: length × diameter × shaft
  cover: 'BW',
  build() {
    // A boot lying on its side: shaft is a hollow tube along +X (crawl-in cave).
    const shaftLen = 23 * CM, dia = 10 * CM, footLen = 12 * CM;
    const g = new THREE.Group();
    const rubber = mat('RUBBER_MATTE', 0xc9c22f);
    const wall = 0.12;
    // Tube = 4 walls (open at +X end)
    const top = boxMesh(shaftLen, wall, dia, rubber, dia - wall / 2);
    const bottom = boxMesh(shaftLen, wall, dia, rubber, wall / 2);
    const left = boxMesh(shaftLen, dia, wall, rubber, dia / 2); left.position.z = -dia / 2 + wall / 2;
    const right = boxMesh(shaftLen, dia, wall, rubber, dia / 2); right.position.z = dia / 2 - wall / 2;
    g.add(top, bottom, left, right);
    // Foot at -X end, sticking sideways (+Z), closed
    const foot = boxMesh(dia * 1.1, dia, footLen, rubber, dia / 2);
    foot.position.set(-shaftLen / 2 - dia * 0.3, 0, footLen / 2 + dia / 2 - wall);
    g.add(foot);
    const sole = boxMesh(dia * 1.15, 0.18, footLen * 1.05, mat('RUBBER_MATTE', 0x3a3a30), 0.09);
    sole.position.copy(foot.position);
    sole.position.x -= dia * 0.55 + 0.02;
    sole.rotation.z = Math.PI / 2;
    g.add(sole);
    return {
      mesh: g,
      colliders: [
        solid(shaftLen, wall, dia, dia - wall / 2),
        solid(shaftLen, wall, dia, wall / 2),
        solid(shaftLen, dia, wall, dia / 2, 0, -dia / 2 + wall / 2),
        solid(shaftLen, dia, wall, dia / 2, 0, dia / 2 - wall / 2),
        solid(dia * 1.1, dia, footLen, dia / 2, -shaftLen / 2 - dia * 0.3, footLen / 2 + dia / 2 - wall),
      ],
    };
  },
});

// ------------------------------------------------------------ B. Cover & fortification

reg({
  id: 'domino',
  dims: [2.4 * CM, 4.8 * CM, 0.75 * CM],
  cover: 'CC',
  build() {
    const w = 2.4 * CM, h = 4.8 * CM, d = 0.75 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('PLASTIC_TOY', 0xf5efe0)));
    const line = boxMesh(w * 0.8, 0.02, 0.01, mat('PLASTIC_TOY', 0x222222), h / 2);
    line.position.z = d / 2 + 0.005;
    g.add(line);
    for (let i = 0; i < 3; i++) {
      const pip = cylMesh(0.035, 0.01, mat('PLASTIC_TOY', 0x222222), h * (0.25 + i * 0.12), 8);
      pip.rotation.x = Math.PI / 2;
      pip.position.set((i - 1) * 0.1, h * (0.72 + (i % 2) * 0.1), d / 2 + 0.005);
      g.add(pip);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'box_juice',
  dims: [6 * CM, 10 * CM, 4 * CM],
  cover: 'SC',
  walkableTop: true,
  build(v) {
    const w = 6 * CM, h = 10 * CM, d = 4 * CM;
    const g = new THREE.Group();
    const tex = labelTexture(v % 2 ? '#7a3fa8' : '#d63c5e', '#fff2a8', v % 2 ? 'GRAPE' : 'PUNCH');
    g.add(boxMesh(w, h, d, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })));
    const straw = cylMesh(0.03, 0.5, mat('PLASTIC_TOY', 0xffffff), h + 0.2, 6);
    straw.position.set(w * 0.3, h + 0.15, 0);
    straw.rotation.z = -0.3;
    g.add(straw);
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'barricade_popsicle',
  dims: [2.1, 0.9, 0.3],
  cover: 'CC',
  build() {
    // Lashed popsicle-stick lattice: two rails + 5 uprights, leaning slightly
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', 0xd9b98a);
    const twine = mat('FABRIC_SOFT', 0x8a6a3a);
    for (let i = 0; i < 5; i++) {
      const up = boxMesh(0.19, 0.9, 0.04, wood);
      up.position.x = -0.9 + i * 0.45;
      up.rotation.z = (i % 2 ? 1 : -1) * 0.03;
      g.add(up);
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 10), wood);
      tip.rotation.x = Math.PI / 2;
      tip.position.set(up.position.x, 0.9, 0);
      g.add(tip);
      for (const y of [0.25, 0.7]) {
        const lash = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 5, 10), twine);
        lash.rotation.y = Math.PI / 2;
        lash.rotation.x = 0.4;
        lash.position.set(up.position.x, y, 0.03);
        g.add(lash);
      }
    }
    for (const y of [0.25, 0.7]) {
      const rail = boxMesh(2.1, 0.19, 0.04, wood, y);
      rail.position.z = 0.05;
      g.add(rail);
    }
    return { mesh: g, colliders: [solid(2.1, 0.9, 0.3)] };
  },
});

reg({
  id: 'matchbox',
  dims: [5 * CM, 1.5 * CM, 3.5 * CM],
  cover: 'CC',
  build() {
    const w = 5 * CM, h = 1.5 * CM, d = 3.5 * CM;
    const g = new THREE.Group();
    const tex = labelTexture('#d9c98c', '#8a2a1a', 'STRIKE');
    g.add(boxMesh(w, h, d, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })));
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

// ------------------------------------------------------------ C. Routes

reg({
  id: 'ruler',
  dims: [30 * CM, 0.3 * CM, 3 * CM],
  walkableTop: true,
  build() {
    const w = 30 * CM, h = 0.08, d = 3 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('WOOD_WARM', 0xe0c58a)));
    for (let i = 0; i <= 30; i++) {
      const tick = boxMesh(0.015, 0.01, i % 5 === 0 ? d * 0.5 : d * 0.25, mat('WOOD_WARM', 0x2a2018), h);
      tick.position.set(-w / 2 + (i / 30) * w, h + 0.005, -d / 2 + (i % 5 === 0 ? d * 0.25 : d * 0.125));
      g.add(tick);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'stone_stepping',
  dims: [30 * CM, 4 * CM, 30 * CM],
  walkableTop: true,
  build(v) {
    const r = 15 * CM, h = 4 * CM;
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, h, 9), mat('STONE', pickColor(v, [0x8d8a80, 0x7d7a72, 0x9a948a])));
    m.position.y = h / 2;
    m.rotation.y = v * 0.7;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return { mesh: g, colliders: [solid(r * 1.8, h, r * 1.8)] };
  },
});

reg({
  id: 'brick_garden',
  dims: [20 * CM, 6.5 * CM, 10 * CM],
  walkableTop: true,
  cover: 'CC',
  build(v) {
    const w = 20 * CM, h = 6.5 * CM, d = 10 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('STONE', pickColor(v, [0xa8523a, 0x9c4c38, 0xb05a3e]))));
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

// Lean ramps (docs/06 §2): a diagonal visual over a stepped collider (0.3 u
// risers → auto-step chains into a climb). Variants: 0 = the birdbath ladder
// (rise 10.1 to the rim from the lawn), 1 = a short garden ramp (rise 3.0).
// Playtest lesson: the walkable lane must be WIDE (1.6 u) and VISIBLE — a
// 0.7 u lane on a thin pole slid real players off the side. So the kid lashed
// popsicle-stick rungs between two garden-tool handles: a ladder you can read.
const RAKE_VARIANTS: [number, number][] = [[10.1, 10.1], [3.6, 3.0]]; // [run, rise]
const RAMP_WIDTH = 1.6;

reg({
  id: 'rake_ramp',
  // The instance's yaw points local +X toward the ledge.
  dims: [10.1, 10.1, RAMP_WIDTH],
  walkableTop: true,
  build(v) {
    const [run, rise] = RAKE_VARIANTS[Math.abs(v) % RAKE_VARIANTS.length];
    const g = new THREE.Group();
    const len = Math.hypot(run, rise);
    const slope = Math.atan2(rise, run);
    const wood = mat('WOOD_WARM', 0xc9a56a);
    const stick = mat('WOOD_WARM', 0xe0c58a);
    // Two rails: a rake handle and a hoe handle, lashed side by side
    for (const z of [-0.62, 0.62]) {
      const rail = cylMesh(0.14, len + 1.6, wood, 0, 10);
      rail.rotation.z = -slope + Math.PI / 2;
      rail.position.set(run / 2, rise / 2 + 0.08, z);
      g.add(rail);
    }
    // Popsicle-stick rungs every 0.7 u of run — the readable "this is a ladder"
    for (let x = 0.35; x < run; x += 0.7) {
      const t = x / run;
      const rung = boxMesh(0.22, 0.06, RAMP_WIDTH - 0.1, stick, 0);
      rung.rotation.z = slope;
      rung.position.set(x, t * rise + 0.12, 0);
      g.add(rung);
    }
    // Rake head lying at the foot, tines toward the ledge
    const head = boxMesh(0.3, 0.14, 1.9, mat('METAL_KITCHEN', 0x6a6a6a), 0.07);
    head.position.set(-0.7, 0, -0.62);
    g.add(head);
    for (let i = 0; i < 9; i++) {
      const tine = boxMesh(0.55, 0.06, 0.06, mat('METAL_KITCHEN', 0x7a7a7a), 0.07);
      tine.position.set(-1.05, 0.07, -1.42 + i * 0.2);
      g.add(tine);
    }
    // Kid's chalk arrow on the ground pointing up the ramp
    const chalk = mat('PAPERBOARD', 0xf6f6f0);
    const shaft = boxMesh(0.9, 0.02, 0.16, chalk, 0.011);
    shaft.position.set(-2.0, 0, 0.4);
    g.add(shaft);
    for (const sgn of [1, -1]) {
      const wing = boxMesh(0.5, 0.02, 0.14, chalk, 0.011);
      wing.rotation.y = sgn * 0.75;
      wing.position.set(-1.72, 0, 0.4 + sgn * 0.18);
      g.add(wing);
    }
    const colliders: LocalBox[] = [];
    // A low landing at the foot catches an off-angle approach
    colliders.push(solid(1.2, 0.15, RAMP_WIDTH, 0.075, -0.45));
    const steps = Math.ceil(rise / 0.3);
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps, t1 = (i + 1) / steps;
      const x = ((t0 + t1) / 2) * run;
      const top = t1 * rise;
      colliders.push(solid(run / steps + 0.05, top, RAMP_WIDTH, top / 2, x));
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'track_hotwheels',
  dims: [5.6, 0.1, 0.83],
  walkableTop: true,
  build() {
    const w = 5.6, h = 0.1, d = 0.83;
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('PLASTIC_TOY', 0xe8731c)));
    for (const z of [-d / 2 + 0.04, d / 2 - 0.04]) {
      const lip = boxMesh(w, 0.08, 0.08, mat('PLASTIC_TOY', 0xd0640f), h + 0.04);
      lip.position.z = z;
      g.add(lip);
    }
    // Two shallow grooves down the running surface and a joiner tab at each end
    for (const z of [-0.18, 0.18]) {
      const groove = boxMesh(w, 0.012, 0.03, mat('PLASTIC_TOY', 0xd0640f), h + 0.006);
      groove.position.z = z;
      g.add(groove);
    }
    for (const x of [-w / 2 + 0.06, w / 2 - 0.06]) {
      const tab = boxMesh(0.12, 0.05, 0.4, mat('PLASTIC_TOY', 0x5a3d2a), h + 0.025);
      tab.position.x = x;
      g.add(tab);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'car_toy',
  dims: [7 * CM, 2 * CM, 3 * CM],
  cover: 'CC',
  build(v) {
    const w = 7 * CM, h = 2 * CM, d = 3 * CM;
    const g = new THREE.Group();
    g.add(boxMesh(w * 0.95, h * 0.55, d, mat('METAL_KITCHEN', pickColor(v, [0xc9302c, 0x2f6fb8, 0xf2c230])), h * 0.35));
    g.add(boxMesh(w * 0.5, h * 0.45, d * 0.9, mat('GLASS_CHEAP', 0x88aacc), h * 0.78));
    for (const x of [-w * 0.3, w * 0.3]) for (const z of [-d / 2, d / 2]) {
      const wheel = cylMesh(h * 0.22, 0.06, mat('RUBBER_MATTE', 0x1a1a1a), h * 0.22, 10);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, h * 0.22, z);
      g.add(wheel);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

// ------------------------------------------------------------ D. Interactive / pickups / objective

reg({
  id: 'batt_crate',
  dims: [1.1, 0.28, 0.93],
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(1.1, 0.28, 0.93, mat('PAPERBOARD', 0x3d5a8a)));
    for (let i = 0; i < 4; i++) {
      const cell = cylMesh(0.13, 0.9, mat('METAL_KITCHEN', 0xd8b04a), 0.28 + 0.07, 10);
      cell.rotation.z = Math.PI / 2;
      cell.position.set(0, 0.28 + 0.13, -0.33 + i * 0.22);
      g.add(cell);
    }
    return { mesh: g, colliders: [solid(1.1, 0.5, 0.93)] };
  },
});

reg({
  id: 'hose_ridge',
  // A straight hose segment lying on the ground along +X. dims: length × ⌀ × ⌀.
  dims: [8, 0.3, 0.3],
  build() {
    const g = new THREE.Group();
    const seg = cylMesh(0.15, 8, mat('RUBBER_MATTE', 0x2f7a3a), 0.15, 10);
    seg.rotation.z = Math.PI / 2;
    g.add(seg);
    return { mesh: g, colliders: [solid(8, 0.3, 0.3, 0.15)] };
  },
});

reg({
  id: 'hose_coil',
  dims: [3.2, 1.2, 3.2],
  walkableTop: true,
  cover: 'SC',
  build() {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35 - i * 0.05, 0.15, 8, 28), mat('RUBBER_MATTE', 0x2f7a3a));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.15 + i * 0.3;
      ring.castShadow = true;
      g.add(ring);
    }
    return { mesh: g, colliders: [solid(3.0, 1.2, 3.0)] };
  },
});

reg({
  id: 'faucet_yard',
  dims: [1.2, 3.0, 1.2],
  build() {
    const g = new THREE.Group();
    const metal = mat('METAL_KITCHEN', 0x9a9a9a);
    g.add(cylMesh(0.18, 3.0, metal, 1.5, 12)); // riser pipe
    const spout = cylMesh(0.16, 1.0, metal, 2.7, 12);
    spout.rotation.x = Math.PI / 2;
    spout.position.set(0, 2.7, 0.5);
    g.add(spout);
    const knob = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 8, 16), mat('PLASTIC_TOY', 0xc93a3a));
    knob.position.set(0, 3.15, 0);
    knob.rotation.x = Math.PI / 2;
    g.add(knob);
    return { mesh: g, colliders: [solid(0.4, 3.0, 0.4, 1.5)] };
  },
});

reg({
  id: 'gnome',
  dims: [2.6, 6.5, 2.6],
  cover: 'BW',
  build() {
    const g = new THREE.Group();
    const h = 6.5;
    const coat = mat('CERAMIC', 0x2f5fa8), skin = mat('CERAMIC', 0xe8b28c), white = mat('CERAMIC', 0xf0ece0);
    const red = mat('CERAMIC', 0xc9302c), black = mat('CERAMIC', 0x2a241e), gold = mat('METAL_KITCHEN', 0xd8b04a);
    g.add(cylMesh(1.1, 0.5, mat('STONE', 0x7c7468), 0.25, 16)); // base
    // Boots peeking out under the coat
    for (const x of [-0.42, 0.42]) {
      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), black);
      boot.scale.set(1, 0.6, 1.4);
      boot.position.set(x, 0.62, 0.45);
      boot.castShadow = true;
      g.add(boot);
    }
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 2.6, 16), coat); // blue coat
    body.position.y = 0.5 + 1.3;
    body.castShadow = true;
    g.add(body);
    // Belt + brass buckle
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.12, 0.32, 16), black);
    belt.position.y = 2.05;
    g.add(belt);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.08), gold);
    buckle.position.set(0, 2.05, 1.08);
    g.add(buckle);
    // Arms folded over the belly, mittened hands
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.9, 4, 10), coat);
      arm.rotation.z = side * 1.25;
      arm.rotation.x = 0.35;
      arm.position.set(side * 0.55, 2.75, 0.75);
      arm.castShadow = true;
      g.add(arm);
    }
    const hands = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), skin);
    hands.scale.set(1.5, 0.8, 0.8);
    hands.position.set(0, 2.6, 1.1);
    g.add(hands);
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.85, 14, 10), white);
    beard.scale.set(1, 1.3, 0.8);
    beard.position.set(0, 3.5, 0.35);
    beard.castShadow = true;
    g.add(beard);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 10), skin);
    head.position.y = 4.35;
    head.castShadow = true;
    g.add(head);
    // Face: eyes, brows, rosy cheeks, the nose
    for (const x of [-0.24, 0.24]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), black);
      eye.position.set(x, 4.48, 0.62);
      g.add(eye);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.1), white);
      brow.rotation.z = x < 0 ? 0.25 : -0.25;
      brow.position.set(x, 4.66, 0.6);
      g.add(brow);
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mat('CERAMIC', 0xe08a7a));
      cheek.position.set(x * 1.6, 4.28, 0.5);
      g.add(cheek);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mat('CERAMIC', 0xd9967a));
    nose.position.set(0, 4.3, 0.7);
    g.add(nose);
    // Hat with a folded brim and a worn tip
    const brim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.14, 8, 18), red);
    brim.rotation.x = Math.PI / 2;
    brim.position.y = 4.78;
    g.add(brim);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.85, h - 4.7, 16), red);
    hat.position.y = 4.7 + (h - 4.7) / 2;
    hat.rotation.z = 0.06;
    hat.castShadow = true;
    g.add(hat);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), red);
    tip.position.set(-0.1, h - 0.02, 0);
    g.add(tip);
    return { mesh: g, colliders: [solid(2.2, 0.5, 2.2, 0.25), solid(1.9, 4.5, 1.9, 0.5 + 2.25)] };
  },
});

reg({
  id: 'birdbath',
  // Pedestal ⌀2.2 × 7.6 with a bowl ⌀5.6 on top; rim is walkable at 8.3.
  dims: [5.6, 8.6, 5.6],
  walkableTop: true,
  cover: 'BW',
  build() {
    const g = new THREE.Group();
    const stone = mat('STONE', 0xb8b0a0);
    g.add(cylMesh(1.6, 0.5, stone, 0.25, 18));
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 7.1, 18), stone);
    ped.position.y = 0.5 + 3.55;
    ped.castShadow = true;
    g.add(ped);
    // Fluting: 10 half-round ridges down the pedestal; moulding rings top and bottom
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 6.2, 6), stone);
      flute.position.set(Math.cos(a) * 0.96, 0.5 + 3.5, Math.sin(a) * 0.96);
      g.add(flute);
    }
    for (const [y, r] of [[1.0, 1.2], [7.45, 1.05]] as [number, number][]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.16, 8, 24), stone);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      g.add(ring);
    }
    // Lichen patches
    const lichen = mat('STONE', 0x8a9a5a);
    for (let i = 0; i < 6; i++) {
      const a = i * 1.7 + 0.4;
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), lichen);
      patch.scale.set(1, 0.55, 0.25);
      patch.position.set(Math.cos(a) * 1.02, 1.6 + i * 0.9, Math.sin(a) * 1.02);
      patch.lookAt(0, patch.position.y, 0);
      g.add(patch);
    }
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.0, 1.0, 24), stone);
    bowl.position.y = 7.6 + 0.5;
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    g.add(bowl);
    const water = cylMesh(2.4, 0.04, mat('GLASS_CHEAP', 0x6aa0c8), 8.35, 24);
    g.add(water);
    for (const r of [0.7, 1.4]) {
      const ripple = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 4, 32), mat('GLASS_CHEAP', 0xcfe8f8));
      ripple.rotation.x = Math.PI / 2;
      ripple.position.y = 8.38;
      g.add(ripple);
    }
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.45, 0.3, 24, 1, true), stone);
    (inner.material as THREE.Material).side = THREE.DoubleSide;
    inner.position.y = 8.35;
    g.add(inner);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.22, 10, 32), stone);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 8.55;
    rim.castShadow = true;
    g.add(rim);
    return {
      mesh: g,
      colliders: [
        solid(3.2, 0.5, 3.2, 0.25),
        solid(2.0, 7.1, 2.0, 0.5 + 3.55),
        solid(5.6, 1.0, 5.6, 8.1), // bowl body
        solid(4.4, 0.6, 4.4, 8.3), // water/rim plateau (walkable)
      ],
    };
  },
});

reg({
  id: 'leaf_raft',
  dims: [2.0, 0.12, 1.3],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    const shape = new THREE.Shape();
    shape.moveTo(-1.0, 0);
    shape.bezierCurveTo(-0.6, 0.7, 0.6, 0.7, 1.0, 0);
    shape.bezierCurveTo(0.6, -0.7, -0.6, -0.7, -1.0, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const leaf = new THREE.Mesh(geo, mat('FABRIC_SOFT', 0x7f9a3a));
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    g.add(leaf);
    const vein = boxMesh(1.9, 0.02, 0.05, mat('FABRIC_SOFT', 0x5a7328), 0.11);
    g.add(vein);
    return { mesh: g, colliders: [solid(1.8, 0.12, 1.1, 0.06)] };
  },
});

reg({
  id: 'rubber_band',
  // Fern's trail marker: a band on the ground AND one hung on a twig, so the
  // trail reads above over-head grass (playtest: the flat bands were invisible).
  dims: [0.5, 1.7, 0.5],
  build() {
    const g = new THREE.Group();
    const bandMat = mat('PLASTIC_TOY', 0xf2d86a, { emissive: 0x7a5a10 });
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 6, 20), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.04;
    g.add(band);
    const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.7, 6), mat('WOOD_WARM', 0x8a6a42));
    twig.position.y = 0.85;
    twig.rotation.z = 0.08;
    twig.castShadow = true;
    g.add(twig);
    const hung = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 18), bandMat);
    hung.position.set(0.14, 1.52, 0);
    hung.rotation.x = 0.35;
    g.add(hung);
    return { mesh: g, colliders: [] };
  },
});

reg({
  // Kid's chalk arrow on the ground; points −z locally (yaw the instance).
  id: 'chalk_arrow',
  dims: [0.9, 0.02, 0.9],
  build() {
    const g = new THREE.Group();
    const chalk = mat('PAPERBOARD', 0xf6f6f0);
    g.add(boxMesh(0.16, 0.02, 0.9, chalk, 0.011));
    for (const side of [-1, 1]) {
      const wing = boxMesh(0.14, 0.02, 0.5, chalk, 0.011);
      wing.rotation.y = side * 0.75;
      wing.position.set(side * 0.18, 0.011, -0.32);
      g.add(wing);
    }
    return { mesh: g, colliders: [] };
  },
});

reg({
  // The kid's bottle rocket: a soda bottle propped on a stone, a matchstick
  // rocket in the neck, aimed at wherever the kid thought was funny. Hold E to
  // light it and ride the stick. Points −z locally (yaw the instance at the target).
  id: 'bottle_rocket',
  dims: [1.0, 2.2, 1.6],
  build() {
    const g = new THREE.Group();
    const glass = mat('GLASS_CHEAP', 0x6aa070);
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 1.3, 14), glass);
    bottle.rotation.x = -1.05;
    bottle.position.set(0, 0.5, 0.1);
    bottle.castShadow = true;
    g.add(bottle);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 0.5, 12), glass);
    neck.rotation.x = -1.05;
    neck.position.set(0, 0.5 + Math.cos(1.05) * 0.9, 0.1 - Math.sin(1.05) * 0.9);
    g.add(neck);
    const rock = cylMesh(0.42, 0.34, mat('STONE', 0x8d8a80), 0.17, 9);
    rock.position.z = 0.45;
    g.add(rock);
    // Rocket on its stick, same axis as the bottle
    const axis = new THREE.Vector3(0, Math.cos(1.05), -Math.sin(1.05));
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 6), mat('WOOD_WARM', 0xe8d9b0));
    stick.rotation.x = -1.05;
    stick.position.set(0, 0.5, 0.1).addScaledVector(axis, 0.9);
    g.add(stick);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 10), mat('PAPERBOARD', 0xc93a3a));
    body.rotation.x = -1.05;
    body.position.set(0, 0.5, 0.1).addScaledVector(axis, 1.75);
    body.castShadow = true;
    g.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 10), mat('PLASTIC_TOY', 0x2f4fa8));
    tip.rotation.x = -1.05;
    tip.position.set(0, 0.5, 0.1).addScaledVector(axis, 2.25);
    g.add(tip);
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), mat('FABRIC_SOFT', 0x3a3a3a));
    fuse.position.set(0.05, 0.5, 0.1).addScaledVector(axis, 1.35);
    fuse.rotation.z = 0.8;
    g.add(fuse);
    return { mesh: g, colliders: [solid(0.9, 0.6, 1.1, 0.3, 0, 0.2)] };
  },
});

reg({
  id: 'bone',
  dims: [1.6, 0.4, 0.5],
  build() {
    const g = new THREE.Group();
    const bonem = mat('CERAMIC', 0xece2c8);
    const shaft = cylMesh(0.12, 1.2, bonem, 0.2, 10);
    shaft.rotation.z = Math.PI / 2;
    g.add(shaft);
    for (const x of [-0.6, 0.6]) for (const z of [-0.12, 0.12]) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), bonem);
      k.position.set(x, 0.2, z);
      g.add(k);
    }
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'sprinkler_head',
  dims: [0.6, 0.5, 0.6],
  build() {
    const g = new THREE.Group();
    g.add(cylMesh(0.22, 0.4, mat('PLASTIC_TOY', 0x3a3a3a), 0.2, 12));
    const nozzle = cylMesh(0.08, 0.3, mat('METAL_KITCHEN', 0xaaaaaa), 0.45, 8);
    nozzle.rotation.z = -0.6;
    nozzle.position.x = 0.1;
    g.add(nozzle);
    return { mesh: g, colliders: [solid(0.44, 0.4, 0.44, 0.2)] };
  },
});

reg({
  id: 'key_house',
  dims: [1.6, 0.06, 0.5],
  build() {
    const g = new THREE.Group();
    const brass = mat('METAL_KITCHEN', 0xb8a44a);
    g.add(boxMesh(1.1, 0.05, 0.22, brass));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 16), brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(-0.75, 0.03, 0);
    g.add(ring);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'flower',
  // Garden flower: stem 3–4 u, petal disc ⌀1.5 as canopy. Stem is the only collider.
  dims: [1.5, 3.8, 1.5],
  build(v) {
    const g = new THREE.Group();
    const h = 3.0 + (v % 3) * 0.4;
    const stem = cylMesh(0.09, h, mat('PLASTIC_TOY', 0x3f7a2f), h / 2, 8);
    g.add(stem);
    const petalColor = pickColor(v, [0xe85d7a, 0xf2c230, 0xffffff, 0xd96bd0, 0xf28a30]);
    for (let i = 0; i < 6; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat('PLASTIC_TOY', petalColor));
      petal.scale.set(1, 0.35, 0.6);
      const a = (i / 6) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.5, h, Math.sin(a) * 0.5);
      petal.rotation.y = -a;
      petal.castShadow = true;
      g.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat('PLASTIC_TOY', 0x6b4a1e));
    center.position.y = h + 0.05;
    g.add(center);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), mat('PLASTIC_TOY', 0x4a8a35));
    leaf.scale.set(1.4, 0.2, 0.6);
    leaf.position.set(0.45, h * 0.45, 0);
    g.add(leaf);
    return { mesh: g, colliders: [solid(0.2, h, 0.2, h / 2)] };
  },
});

// ------------------------------------------------------------ Kit test-scene helper

reg({
  id: 'metric_ruler',
  // A 10-unit tall stand-up ruler with 1u ticks: the scale reference in the kit scene.
  dims: [0.4, 10, 0.1],
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(0.4, 10, 0.08, mat('WOOD_WARM', 0xf3e9c8)));
    for (let i = 0; i <= 10; i++) {
      const tick = boxMesh(i % 5 === 0 ? 0.4 : 0.22, 0.04, 0.02, mat('WOOD_WARM', 0x2a2018), i);
      tick.position.set(i % 5 === 0 ? 0 : 0.09, i, 0.05);
      g.add(tick);
    }
    return { mesh: g, colliders: [solid(0.4, 10, 0.08)] };
  },
});

export function kitProp(id: string): KitProp {
  const p = KIT[id];
  if (!p) throw new Error(`Unknown kit prop: ${id}`);
  return p;
}
