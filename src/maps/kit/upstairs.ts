// The Upstairs Kit (docs/blueprints/floor-U.md §7): the kids' world — beds, desks, the bathroom,
// and THE DOLLHOUSE. Same rules as the House Kit: primitives + canvas textures, honest 1:32
// dimensions (1 u = 5.4 cm), colliders as local boxes, climbs built as ramps you walk.

import * as THREE from 'three';
import { Vec3 } from '../../core/math';
import { mat } from './materials';
import { reg, boxMesh, cylMesh, solid, pickColor, LocalBox } from './registry';
import { textTex } from './house';

const OAK = 0xd9c4a0, WALNUT = 0x6b4a32, WHITE = 0xf2f0ea, STEEL = 0xb8bcc0;
const sz = (size: Vec3 | undefined, d: Vec3): Vec3 => size ?? d;
const texMat = (t: THREE.Texture, roughness = 0.9): THREE.Material => new THREE.MeshStandardMaterial({ map: t, roughness });

// ------------------------------------------------------------ Jonah's room

reg({
  id: 'bed_loft',
  // A loft bed: mattress deck 160 cm up (30 u), a room underneath. size = [w, h, d].
  dims: [74, 30, 40],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [74, 30, 40]);
    const g = new THREE.Group();
    const frame = mat('WOOD_WARM', pickColor(v, [OAK, 0x8a6a48]));
    const colliders: LocalBox[] = [];
    for (const [x, z] of [[-w / 2 + 2, -d / 2 + 2], [w / 2 - 2, -d / 2 + 2], [-w / 2 + 2, d / 2 - 2], [w / 2 - 2, d / 2 - 2]]) {
      const post = boxMesh(3.2, h, 3.2, frame, h / 2);
      post.position.set(x, h / 2, z);
      g.add(post);
      colliders.push(solid(3.2, h, 3.2, h / 2, x, z));
    }
    // Deck + mattress
    g.add(boxMesh(w, 2, d, frame, h - 1));
    colliders.push(solid(w, 2, d, h - 1));
    g.add(boxMesh(w - 4, 4, d - 4, mat('FABRIC_SOFT', 0xe8e0d0), h + 2));
    colliders.push(solid(w - 4, 4, d - 4, h + 2));
    const quilt = boxMesh(w - 3, 1.2, d * 0.6, mat('FABRIC_SOFT', pickColor(v + 1, [0x3a6a8a, 0x8a3a34, 0x3c7a4a])), h + 4.6);
    quilt.position.z = d * 0.15; g.add(quilt);
    const pillow = boxMesh(w * 0.4, 3, 10, mat('FABRIC_SOFT', WHITE), h + 5.5);
    pillow.position.set(0, h + 5.5, -d / 2 + 7); g.add(pillow);
    // Guard rail on the +x side, with a gap amidships where the climb arrives (the kid took a
    // spindle out; without the gap the rail walls off the only way onto the deck).
    const GAP = 7;
    for (let i = 0; i <= 6; i++) {
      const z = -d / 2 + 3 + i * ((d - 6) / 6);
      if (Math.abs(z) < GAP / 2) continue;
      const spindle = boxMesh(1, 8, 1, frame, h + 6);
      spindle.position.set(w / 2 - 1.6, h + 6, z);
      g.add(spindle);
    }
    g.add(boxMesh(1.6, 1.6, d, frame, h + 10).translateX(w / 2 - 1.6));
    const segD = (d - GAP) / 2;
    colliders.push(solid(1.6, 10, segD, h + 5, w / 2 - 1.6, -d / 2 + segD / 2));
    colliders.push(solid(1.6, 10, segD, h + 5, w / 2 - 1.6, d / 2 - segD / 2));
    // A ladder on the −x end (decorative: the real way up is the desk, per the blueprint)
    for (let i = 1; i <= 8; i++) {
      const rung = cylMesh(0.4, 10, mat('WOOD_WARM', WALNUT), 0, 8);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(-w / 2 - 1.5, i * (h / 9), d / 2 - 6);
      g.add(rung);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'desk_kid',
  // A kid's desk: top at 75 cm (14 u), a keyboard tray at 10. size = [w, h, d].
  dims: [60, 14, 26],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [60, 14, 26]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [OAK, 0x9a7a52]));
    g.add(boxMesh(w, 1.4, d, wood, h - 0.7));
    const colliders: LocalBox[] = [solid(w, 1.4, d, h - 0.7)];
    for (const x of [-w / 2 + 2, w / 2 - 2]) {
      const leg = boxMesh(3, h - 1.4, d - 2, wood, (h - 1.4) / 2);
      leg.position.set(x, (h - 1.4) / 2, 0);
      g.add(leg);
      colliders.push(solid(3, h - 1.4, d - 2, (h - 1.4) / 2, x));
    }
    const tray = boxMesh(w * 0.5, 0.8, 9, wood, 10);
    tray.position.set(0, 10, -d / 2 + 5); g.add(tray);
    colliders.push(solid(w * 0.5, 0.8, 9, 10, 0, -d / 2 + 5));
    return { mesh: g, colliders };
  },
});

reg({
  id: 'pc_beige',
  // The beige computer: CRT monitor (screensaver — winged toasters, secret 27), tower, mouse.
  dims: [20, 18, 18],
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    const beige = mat('PLASTIC_TOY', 0xd8cfb4);
    g.add(boxMesh(16, 13, 14, beige, 6.5)); // monitor body
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(12, 9),
      texMat(textTex(['~ ~ ~', ' >o<  >o<', '~ ~ ~'], '#0a1020', '#7ad0e0', 256, 192, 'bold 30px "Courier New", monospace')));
    screen.position.set(0, 7, -7.1); g.add(screen);
    g.add(boxMesh(9, 2, 9, beige, 0.9)); // stand
    const tower = boxMesh(7, 16, 15, beige, 8);
    tower.position.set(12, 8, 2); g.add(tower);
    for (const y of [12, 10]) { const slot = boxMesh(4.5, 0.7, 0.4, mat('PLASTIC_TOY', 0x8a8474), y); slot.position.set(12, y, -5.6); g.add(slot); }
    const mouse = boxMesh(2.4, 1.2, 3.4, beige, 0.6);
    mouse.position.set(-10, 0.6, -3); g.add(mouse);
    return { mesh: g, colliders: [solid(16, 13, 14, 6.5), solid(7, 16, 15, 8, 12, 2)] };
  },
});

reg({
  id: 'console_tv',
  // A small TV on a low cabinet with the console under it. The controller cable is secret 26's zipline.
  dims: [30, 26, 16],
  walkableTop: true,
  cover: 'BW',
  build(v) {
    const g = new THREE.Group();
    const cab = boxMesh(30, 12, 16, mat('WOOD_WARM', WALNUT), 6); g.add(cab);
    const tv = boxMesh(20, 14, 14, mat('PLASTIC_TOY', 0x3a3630), 19); g.add(tv);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), mat('GLASS_CHEAP', 0x1a2028));
    screen.position.set(0, 19, -7.1); g.add(screen);
    const con = boxMesh(11, 2.6, 8, mat('PLASTIC_TOY', pickColor(v, [0x9a9a9a, 0x6a6a72])), 13.3);
    con.position.set(-9, 13.3, 0); g.add(con);
    const pad = boxMesh(4.5, 1.2, 2.6, mat('PLASTIC_TOY', 0xbdbdb4), 12.6);
    pad.position.set(6, 12.6, -5); g.add(pad);
    return { mesh: g, colliders: [solid(30, 12, 16, 6), solid(20, 14, 14, 19)] };
  },
});

reg({
  id: 'rc_track',
  // An oval of orange track. Banked walls, a walkable rail. size = [w, h, d].
  dims: [70, 3, 50],
  walkableTop: true,
  build(_, size) {
    const [w, , d] = sz(size, [70, 3, 50]);
    const g = new THREE.Group();
    const track = mat('PLASTIC_TOY', 0xe08a22);
    const colliders: LocalBox[] = [];
    const seg = 28;
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const x = Math.cos(a) * (w / 2 - 5), z = Math.sin(a) * (d / 2 - 5);
      const piece = boxMesh(8, 1.2, 8, track, 0.6);
      piece.position.set(x, 0.6, z);
      piece.rotation.y = -a;
      g.add(piece);
      if (i % 2 === 0) colliders.push(solid(8, 1.2, 8, 0.6, x, z));
      // outer lip
      const lip = boxMesh(2, 2.6, 8, mat('PLASTIC_TOY', 0xc96a12), 1.6);
      lip.position.set(Math.cos(a) * (w / 2 - 1), 1.6, Math.sin(a) * (d / 2 - 1));
      lip.rotation.y = -a;
      g.add(lip);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'shelf_figures',
  // A wall shelf of action figures who outrank you (secret 28). size = [w, h, d]; shelf board at h.
  dims: [40, 3, 8],
  walkableTop: true,
  build(v, size) {
    const [w, , d] = sz(size, [40, 3, 8]);
    const g = new THREE.Group();
    g.add(boxMesh(w, 1.2, d, mat('WOOD_WARM', OAK), 0.6));
    const colliders: LocalBox[] = [solid(w, 1.2, d, 0.6)];
    for (let i = 0; i < 5; i++) {
      const x = -w / 2 + 5 + i * ((w - 10) / 4);
      const col = pickColor(v + i, [0x3c9a4a, 0x2f63b8, 0xc93a3a, 0xe0b040, 0x7a4aa0]);
      const body = boxMesh(1.8, 4.2, 1.4, mat('PLASTIC_TOY', col), 3.3);
      body.position.set(x, 3.3, 0); body.rotation.y = (i - 2) * 0.2; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), mat('PLASTIC_TOY', 0xe8c9a0));
      head.position.set(x, 6.1, 0); g.add(head);
      for (const s of [-1, 1]) {
        const arm = boxMesh(0.6, 3, 0.6, mat('PLASTIC_TOY', col), 3.6);
        arm.position.set(x + s * 1.3, 3.6, 0); arm.rotation.z = s * 0.3; g.add(arm);
      }
    }
    return { mesh: g, colliders };
  },
});

// ------------------------------------------------------------ the parents' room

reg({
  id: 'bed_double',
  // The big bed: a 10 u plateau the size of a field. The bedspread hangs off the −x side as a ramp
  // (slope 0.7, stepped 0.3 colliders) — the way up. size = [w, h, d].
  dims: [100, 10, 74],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [100, 10, 74]);
    const g = new THREE.Group();
    const frame = mat('WOOD_WARM', WALNUT);
    const colliders: LocalBox[] = [];
    g.add(boxMesh(w, h - 3, d, frame, (h - 3) / 2));
    colliders.push(solid(w, h - 3, d, (h - 3) / 2));
    g.add(boxMesh(w + 1, 3.4, d + 1, mat('FABRIC_SOFT', WHITE), h - 1.5));
    colliders.push(solid(w + 1, 3.4, d + 1, h - 1.5));
    const spread = boxMesh(w + 1.5, 1.4, d * 0.72, mat('FABRIC_SOFT', pickColor(v, [0x7a5a8a, 0x8a6a4a, 0x3a5a6a])), h + 0.5);
    spread.position.z = d * 0.14; g.add(spread);
    for (const z of [-d / 4, d / 4]) {
      const pillow = boxMesh(w * 0.32, 4, 14, mat('FABRIC_SOFT', WHITE), h + 2.4);
      pillow.position.set(-w / 4 + (z > 0 ? w / 2 : 0), h + 2.4, -d / 2 + 10);
      pillow.position.x = z > 0 ? w * 0.2 : -w * 0.2;
      g.add(pillow);
    }
    // Headboard on the −z end
    const head = boxMesh(w, 18, 2.4, frame, h + 6);
    head.position.set(0, h + 6, -d / 2 - 1.2); g.add(head);
    colliders.push(solid(w, 18, 2.4, h + 6, 0, -d / 2 - 1.2));
    // The bedspread trailing off the −x side: a walkable ramp from the floor to the plateau
    const run = (h + 2) / 0.7;
    const steps = Math.ceil((h + 2) / 0.3);
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      const y = (h + 2) * t;
      const x = -w / 2 - run + run * t;
      colliders.push(solid(run / steps + 0.1, y, d * 0.5, y / 2, x, d * 0.1));
    }
    const drape = boxMesh(run + 2, 1.2, d * 0.5, mat('FABRIC_SOFT', pickColor(v, [0x7a5a8a, 0x8a6a4a, 0x3a5a6a])), 0);
    drape.position.set(-w / 2 - run / 2, (h + 2) / 2, d * 0.1);
    drape.rotation.z = Math.atan2(h + 2, run);
    g.add(drape);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'dresser',
  // A dresser with three drawers pulled out in steps — the climb (risers ≤ 0.34 by the G rule
  // is impossible at this height, so these are deliberate 5 u hops: one of the floor's two hard climbs).
  dims: [44, 15, 12],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [44, 15, 12]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [WALNUT, 0x9a6a42]));
    g.add(boxMesh(w, h, d, wood, h / 2));
    const colliders: LocalBox[] = [solid(w, h, d, h / 2)];
    // Three drawers, each pulled further out the lower it is: a staircase of drawer fronts
    for (let i = 0; i < 3; i++) {
      const y = 3 + i * 4.2;
      const out = (3 - i) * 3.4;
      const dr = boxMesh(w - 4, 3.4, d, wood, y);
      dr.position.set(0, y, -d / 2 - out / 2);
      g.add(dr);
      colliders.push(solid(w - 4, y + 1.7, d, (y + 1.7) / 2, 0, -d / 2 - out / 2));
      for (const kx of [-w / 4, w / 4]) {
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), mat('METAL_KITCHEN', 0xd8b04a));
        knob.position.set(kx, y, -d / 2 - out - 0.3); g.add(knob);
      }
    }
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, 18), mat('GLASS_CHEAP', 0xc8d8e0));
    mirror.position.set(0, h + 10, d / 2 - 0.6); mirror.rotation.y = Math.PI; g.add(mirror);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'closet_hang',
  // A bifold closet: a hanging forest of clothes, a shelf at 34, shoeboxes on the floor. size = [w, h, d].
  dims: [60, 46, 22],
  build(v, size) {
    const [w, , d] = sz(size, [60, 46, 22]);
    const g = new THREE.Group();
    const colliders: LocalBox[] = [];
    const rod = cylMesh(0.6, w - 2, mat('METAL_KITCHEN', STEEL), 30, 10);
    rod.rotation.z = Math.PI / 2; rod.position.y = 30; g.add(rod);
    for (let i = 0; i < 11; i++) {
      const x = -w / 2 + 4 + i * ((w - 8) / 10);
      const cloth = boxMesh(3.6, 18 + (i % 3) * 3, 8, mat('FABRIC_SOFT', pickColor(v + i, [0x3a4a6a, 0x8a3a34, 0xe8e0d0, 0x3c5a3a, 0x6a5a7a])), 0);
      cloth.position.set(x, 30 - (18 + (i % 3) * 3) / 2 - 1, 0);
      cloth.rotation.y = (i % 2 ? 1 : -1) * 0.08;
      g.add(cloth);
      const hanger = boxMesh(2.6, 0.3, 0.3, mat('METAL_KITCHEN', STEEL), 30.4);
      hanger.position.set(x, 30.4, 0); g.add(hanger);
    }
    const shelf = boxMesh(w, 1.4, d, mat('WOOD_WARM', OAK), 34);
    g.add(shelf); colliders.push(solid(w, 1.4, d, 34));
    for (let i = 0; i < 3; i++) {
      const bx = boxMesh(11, 5, 7, mat('PAPERBOARD', pickColor(i + v, [0xd8cfb4, 0xc9b48a, 0xe0d8c0])), 37);
      bx.position.set(-w / 2 + 9 + i * 13, 37, 0); g.add(bx);
      colliders.push(solid(11, 5, 7, 37, -w / 2 + 9 + i * 13, 0));
    }
    return { mesh: g, colliders };
  },
});

// ------------------------------------------------------------ Pip's room — THE DOLLHOUSE

reg({
  id: 'dollhouse',
  // The floor's showpiece. Three storeys and an attic, open at the front (local −z), with a
  // staircase whose risers are ~0.25 u — the one staircase in the house a soldier simply WALKS UP,
  // because a dollhouse stair is built at a doll's scale and we are smaller than the doll.
  // size = [w, h, d]. Storey heights 5.5; the attic holds a smaller dollhouse (secret 29).
  dims: [40, 22, 34],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [40, 22, 34]);
    const g = new THREE.Group();
    const shell = mat('WOOD_WARM', pickColor(v, [0xf0e0d0, 0xe8dcc8]));
    const trim = mat('PLASTIC_TOY', pickColor(v + 1, [0xc93a3a, 0x3a6a8a, 0x7a4aa0]));
    const colliders: LocalBox[] = [];
    const storey = (h - 2) / 3; // three floors under a gable
    // Back wall and two side walls; the front (−z) stands open
    g.add(boxMesh(w, h, 1.4, shell, h / 2).translateZ(d / 2 - 0.7));
    colliders.push(solid(w, h, 1.4, h / 2, 0, d / 2 - 0.7));
    for (const x of [-w / 2 + 0.7, w / 2 - 0.7]) {
      g.add(boxMesh(1.4, h, d, shell, h / 2).translateX(x));
      colliders.push(solid(1.4, h, d, h / 2, x));
    }
    // Floor slabs. The ground floor is nearly flush so you can walk in off the carpet
    // (a 1 u lip at the front door would need a jump).
    for (let f = 0; f <= 3; f++) {
      const y = f * storey;
      const th = f === 0 ? 0.3 : 1;
      g.add(boxMesh(w - 2.8, th, d - 1.4, shell, y + th / 2));
      colliders.push(solid(w - 2.8, th, d - 1.4, y + th / 2, 0, -0.7));
    }
    // The staircases: one per storey, zig-zagging, risers 0.25 (walkable), treads 0.5
    for (let f = 0; f < 3; f++) {
      const dir = f % 2 === 0 ? 1 : -1;
      const y0 = f * storey + 1;
      const n = Math.ceil((storey - 1) / 0.25);
      const tread = (d - 8) / n;
      for (let i = 0; i < n; i++) {
        const y = y0 + 0.25 * (i + 1);
        const z = dir * (-d / 2 + 4 + tread * i);
        const step = boxMesh(6, 0.25, tread + 0.05, mat('WOOD_WARM', 0xc9a66b), y - 0.12);
        step.position.set(dir * (w / 2 - 5), y - 0.12, z);
        g.add(step);
        colliders.push(solid(6, y, tread + 0.05, y / 2, dir * (w / 2 - 5), z));
      }
    }
    // Interior partitions and doll furniture (a doll chair is a soldier's armchair)
    for (let f = 0; f < 3; f++) {
      const y = f * storey + 1;
      const part = boxMesh(1, storey - 1.2, d * 0.45, shell, y + (storey - 1.2) / 2);
      part.position.set(-w / 6, y + (storey - 1.2) / 2, d * 0.15);
      g.add(part);
      colliders.push(solid(1, storey - 1.2, d * 0.45, y + (storey - 1.2) / 2, -w / 6, d * 0.15));
      const chair = boxMesh(3.4, 3, 3.4, mat('FABRIC_SOFT', pickColor(f + v, [0x8a3a34, 0x3a6a4a, 0x6a5a8a])), y + 1.5);
      chair.position.set(-w / 3, y + 1.5, 2); g.add(chair);
      colliders.push(solid(3.4, 3, 3.4, y + 1.5, -w / 3, 2));
      const tbl = boxMesh(4.4, 0.6, 4.4, mat('WOOD_WARM', WALNUT), y + 2.4);
      tbl.position.set(w / 6, y + 2.4, 3); g.add(tbl);
      colliders.push(solid(4.4, 2.6, 4.4, y + 1.3, w / 6, 3));
    }
    // Gable roof + the attic's dollhouse (secret 29)
    const roofH = 7;
    for (const s of [-1, 1]) {
      const pitch = boxMesh(1.2, Math.hypot(w / 2, roofH), d + 1, mat('PLASTIC_TOY', trim.userData?.color ?? 0xc93a3a), 0);
      pitch.position.set(s * w / 4, h + roofH / 2, 0);
      pitch.rotation.z = s * -Math.atan2(w / 2, roofH);
      g.add(pitch);
    }
    const mini = new THREE.Group();
    mini.scale.setScalar(0.16);
    const mBody = boxMesh(w, h, d, shell, h / 2); mini.add(mBody);
    for (const s of [-1, 1]) {
      const mp = boxMesh(1.2, Math.hypot(w / 2, roofH), d + 1, trim, 0);
      mp.position.set(s * w / 4, h + roofH / 2, 0); mp.rotation.z = s * -Math.atan2(w / 2, roofH); mini.add(mp);
    }
    mini.position.set(0, h + 0.6, 0);
    g.add(mini);
    // A doorbell and a house number, because Taupe lives here now
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), mat('METAL_KITCHEN', 0xd8b04a));
    bell.position.set(w / 2 - 2, 4, -d / 2 - 0.2); g.add(bell);
    const num = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), texMat(textTex(['1/12'], '#f0e0d0', '#3a3a3a', 96, 64, 'bold 30px Impact, sans-serif')));
    num.position.set(-w / 2 + 4, 4.5, -d / 2 - 0.1); num.rotation.y = Math.PI; g.add(num);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'tea_set',
  // A low table laid for tea. One cup is missing (SQ_tea).
  dims: [16, 8, 16],
  walkableTop: true,
  cover: 'CC',
  build(v) {
    const g = new THREE.Group();
    const wood = mat('PLASTIC_TOY', 0xf0d0d8);
    g.add(boxMesh(16, 1, 16, wood, 7.5));
    const colliders: LocalBox[] = [solid(16, 1, 16, 7.5)];
    for (const [x, z] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) {
      const leg = boxMesh(1.2, 7, 1.2, wood, 3.5); leg.position.set(x, 3.5, z); g.add(leg);
    }
    colliders.push(solid(16, 7, 16, 3.5));
    const pot = cylMesh(2, 2.6, mat('CERAMIC', WHITE), 9.3, 12); g.add(pot);
    for (let i = 0; i < 3; i++) { // one short of four
      const a = i * 1.9;
      const cup = cylMesh(1, 1.2, mat('CERAMIC', pickColor(i + v, [0xf4d0d8, 0xd8e0f0, 0xf0e8c0])), 8.6, 10);
      cup.position.set(Math.cos(a) * 5, 8.6, Math.sin(a) * 5); g.add(cup);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'plush_pile',
  // A heap of plush animals: a hush pocket you can climb into. size = [w, h, d].
  dims: [40, 20, 26],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [40, 20, 26]);
    const g = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const r = 4 + (i % 3) * 1.6;
      const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat('FABRIC_SOFT', pickColor(v + i, [0xc9a66b, 0xe0a0b0, 0x8ab0d0, 0xd8d0a0, 0xb090c0])));
      const a = (i / 9) * Math.PI * 2;
      blob.position.set(Math.cos(a) * (w / 2 - r - 1), r * 0.8 + (i % 2) * 3, Math.sin(a) * (d / 2 - r - 1));
      blob.scale.set(1, 0.85, 1);
      g.add(blob);
      // an ear or two
      for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(r * 0.3, 6, 5), blob.material as THREE.Material);
        ear.position.set(blob.position.x + s * r * 0.5, blob.position.y + r * 0.75, blob.position.z);
        g.add(ear);
      }
    }
    return { mesh: g, colliders: [solid(w, h * 0.6, d, h * 0.3)] };
  },
});

reg({
  id: 'fishbowl',
  // A goldfish on a stand. It turns to watch you (secret 30 — the runtime rotates `userData.fish`).
  dims: [14, 22, 14],
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    const stand = boxMesh(12, 10, 12, mat('WOOD_WARM', WALNUT), 5); g.add(stand);
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(6, 14, 12), mat('GLASS_CHEAP', 0xbfe0ea));
    bowl.position.y = 16; g.add(bowl);
    const water = new THREE.Mesh(new THREE.SphereGeometry(5.4, 14, 10), mat('GLASS_CHEAP', 0x6aa8c8));
    water.position.y = 15.4; g.add(water);
    const fish = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 6), mat('PLASTIC_TOY', 0xe08a22));
    body.scale.set(1.5, 1, 0.7); fish.add(body);
    const tail = boxMesh(1.6, 1.6, 0.2, mat('PLASTIC_TOY', 0xe0a052), 0);
    tail.position.set(1.9, 0, 0); fish.add(tail);
    fish.position.y = 16;
    fish.name = 'fish';
    g.add(fish);
    return { mesh: g, colliders: [solid(12, 10, 12, 5), solid(11, 11, 11, 16)] };
  },
});

// ------------------------------------------------------------ the bathroom

reg({
  id: 'tub',
  // The tub as a lake: rim at 60 cm (11 u), interior floor at 2, a tap at the −z end. size = [w, h, d].
  dims: [34, 11, 62],
  walkableTop: true,
  cover: 'BW',
  build(_, size) {
    const [w, h, d] = sz(size, [34, 11, 62]);
    const g = new THREE.Group();
    const porc = mat('CERAMIC', 0xf4f2ec);
    const colliders: LocalBox[] = [];
    const t = 2.2; // wall thickness
    g.add(boxMesh(w, 2, d, porc, 1)); colliders.push(solid(w, 2, d, 1)); // floor of the tub
    for (const x of [-w / 2 + t / 2, w / 2 - t / 2]) {
      g.add(boxMesh(t, h, d, porc, h / 2).translateX(x));
      colliders.push(solid(t, h, d, h / 2, x));
    }
    for (const z of [-d / 2 + t / 2, d / 2 - t / 2]) {
      g.add(boxMesh(w, h, t, porc, h / 2).translateZ(z));
      colliders.push(solid(w, h, t, h / 2, 0, z));
    }
    // Tap and knobs at the −z end
    const spout = cylMesh(0.9, 5, mat('METAL_KITCHEN', STEEL), h + 2, 10);
    spout.rotation.x = Math.PI / 2; spout.position.set(0, h + 2.5, -d / 2 + 3.5); g.add(spout);
    for (const x of [-4, 4]) {
      const knob = cylMesh(1.4, 1, mat('METAL_KITCHEN', STEEL), h + 1.5, 10);
      knob.position.set(x, h + 1.5, -d / 2 + 2); g.add(knob);
    }
    const drain = cylMesh(1.2, 0.3, mat('METAL_KITCHEN', STEEL), 2.1, 10);
    drain.position.set(0, 2.1, d / 2 - 8); g.add(drain);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'vanity',
  // Sink cabinet with a basin and a mirror to 34. size = [w, h, d].
  dims: [30, 16, 12],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [30, 16, 12]);
    const g = new THREE.Group();
    const cab = mat('WOOD_WARM', pickColor(v, [0xe8e0d0, OAK]));
    g.add(boxMesh(w, h, d, cab, h / 2));
    const colliders: LocalBox[] = [solid(w, h, d, h / 2)];
    g.add(boxMesh(w + 1.5, 1.4, d + 1.5, mat('STONE', 0xe0dcd2), h + 0.7));
    colliders.push(solid(w + 1.5, 1.4, d + 1.5, h + 0.7));
    const basin = cylMesh(4.4, 1.6, mat('CERAMIC', 0xf4f2ec), h + 0.8, 14);
    basin.scale.y = 0.6; g.add(basin);
    const spout = cylMesh(0.7, 4, mat('METAL_KITCHEN', STEEL), h + 3, 8);
    spout.rotation.x = Math.PI / 2; spout.position.set(0, h + 3.5, d / 2 - 1.5); g.add(spout);
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, 16), mat('GLASS_CHEAP', 0xd0e0e8));
    mirror.position.set(0, h + 11, d / 2 - 0.2); mirror.rotation.y = Math.PI; g.add(mirror);
    const tumbler = cylMesh(1.2, 3, mat('PLASTIC_TOY', 0x7ad0e0), h + 3, 10);
    tumbler.position.set(w / 2 - 4, h + 3, 0); g.add(tumbler);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'toilet_full',
  // The full-size one (G has the half-bath version). Tank top at 20.
  dims: [14, 20, 22],
  walkableTop: true,
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    const porc = mat('CERAMIC', 0xf4f2ec);
    const bowl = cylMesh(6, 8, porc, 9, 14); bowl.scale.z = 1.2; bowl.position.z = -3; g.add(bowl);
    const seat = cylMesh(6.4, 1, mat('PLASTIC_TOY', 0xe8e4da), 13.4, 14); seat.scale.z = 1.2; seat.position.z = -3; g.add(seat);
    const tank = boxMesh(13, 12, 5.5, porc, 14); tank.position.z = 6; g.add(tank);
    const lid = boxMesh(14, 1.2, 6.5, porc, 20.4); lid.position.z = 6; g.add(lid);
    const handle = boxMesh(2, 0.6, 0.6, mat('METAL_KITCHEN', STEEL), 17); handle.position.set(-5, 17, 3); g.add(handle);
    return { mesh: g, colliders: [solid(13, 13.5, 15, 7, 0, -3), solid(14, 21, 6.5, 10.5, 0, 6)] };
  },
});

reg({
  id: 'fan_vent',
  // The ceiling exhaust fan: a grille and blades that turn (named 'blades' for the runtime).
  dims: [12, 2.5, 12],
  build() {
    const g = new THREE.Group();
    const metal = mat('METAL_KITCHEN', 0xe0dcd2);
    g.add(boxMesh(12, 1, 12, metal, -0.5));
    g.add(boxMesh(10.4, 2, 10.4, mat('PLASTIC_TOY', 0x14120e), -1.6));
    const blades = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const b = boxMesh(7, 0.25, 1.8, metal, 0);
      b.rotation.y = (i / 4) * Math.PI * 2;
      b.rotation.z = 0.25;
      blades.add(b);
    }
    blades.position.y = -1.8; blades.name = 'blades';
    g.add(blades);
    for (let i = 0; i < 7; i++) {
      const slat = boxMesh(11.6, 0.2, 0.5, metal, -0.1);
      slat.position.set(0, -0.1, -5 + i * 1.7); slat.rotation.x = 0.4; g.add(slat);
    }
    return { mesh: g, colliders: [] };
  },
});

// ------------------------------------------------------------ the hall

reg({
  id: 'attic_hatch',
  // The ceiling hatch, open, with the pull-down ladder deployed: 12 rungs at 4.4 with the kid's
  // shoelace loops knotted between them (loops are the climb: 1.1 u steps, the floor's other hard climb).
  // Placed at the ceiling; the ladder hangs DOWN from the prop origin toward y −h.
  dims: [26, 4, 46],
  build(v, size) {
    const [, , d] = sz(size, [26, 4, 46]);
    const g = new THREE.Group();
    const colliders: LocalBox[] = [];
    const wood = mat('WOOD_WARM', 0xc9a66b);
    // The hatch panel, hinged open against the ceiling
    const panel = boxMesh(24, 1.2, 24, wood, 1.5);
    panel.position.set(0, 2, d / 2 - 10); panel.rotation.x = -0.5; g.add(panel);
    // Two stringers running down and out
    const drop = 46, out = d * 0.55;
    const len = Math.hypot(drop, out);
    const tilt = Math.atan2(out, drop);
    for (const x of [-5, 5]) {
      const s = boxMesh(1.6, len, 1.2, wood, 0);
      s.position.set(x, -drop / 2, -out / 2);
      s.rotation.x = -tilt;
      g.add(s);
    }
    // 12 rungs, and a shoelace loop knotted under each one
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12;
      const y = -drop * t, z = -out * t;
      const rung = cylMesh(0.7, 11, wood, 0, 8);
      rung.rotation.z = Math.PI / 2; rung.position.set(0, y, z); g.add(rung);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.22, 6, 12), mat('FABRIC_SOFT', pickColor(v + i, [0xf2e6c8, 0xd8d0c0])));
      loop.position.set(0, y - 1.4, z + 0.4); g.add(loop);
      colliders.push(solid(11, 0.7, 2.2, y, 0, z));
      colliders.push(solid(3, 0.5, 2.6, y - 1.4, 0, z + 0.4));
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'linen_shelves',
  // The linen closet: shelves at 12 / 24 / 36 with folded towels, and the vacuum hose's mouth
  // at 12 (docs/11 #21 arrives here from the ground floor's coat closet). size = [w, h, d].
  dims: [28, 46, 20],
  walkableTop: true,
  build(v, size) {
    const [w, h, d] = sz(size, [28, 46, 20]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', 0xe8e0d0);
    const colliders: LocalBox[] = [];
    for (const x of [-w / 2 + 0.7, w / 2 - 0.7]) {
      g.add(boxMesh(1.4, h, d, wood, h / 2).translateX(x));
      colliders.push(solid(1.4, h, d, h / 2, x));
    }
    g.add(boxMesh(w, h, 1, wood, h / 2).translateZ(d / 2 - 0.5));
    colliders.push(solid(w, h, 1, h / 2, 0, d / 2 - 0.5));
    for (const y of [12, 24, 36]) {
      g.add(boxMesh(w - 2.8, 1.2, d - 1, wood, y));
      colliders.push(solid(w - 2.8, 1.2, d - 1, y));
      for (let i = 0; i < 3; i++) {
        const towel = boxMesh(7, 3.4, d - 5, mat('FABRIC_SOFT', pickColor(v + i + y, [0xd8e0e8, 0xf0e8d8, 0xe0d0d8, 0xcfe0d0])), y + 2.3);
        towel.position.set(-w / 2 + 6 + i * 8, y + 2.3, 0.5);
        g.add(towel);
        colliders.push(solid(7, 3.4, d - 5, y + 2.3, -w / 2 + 6 + i * 8, 0.5));
      }
    }
    // The hose mouth on the bottom shelf
    const hose = cylMesh(2.6, 6, mat('RUBBER_MATTE', 0x3a3630), 12 + 3.6, 12);
    hose.rotation.x = Math.PI / 2; hose.position.set(w / 2 - 6, 15.6, 2); g.add(hose);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'bench_hall',
  // A window bench, top at 12. size = [w, h, d].
  dims: [40, 12, 14],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [40, 12, 14]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [OAK, WALNUT]));
    g.add(boxMesh(w, 1.6, d, wood, h - 0.8));
    const cushion = boxMesh(w - 2, 1.6, d - 2, mat('FABRIC_SOFT', 0xc9b48a), h + 0.8);
    g.add(cushion);
    for (const x of [-w / 2 + 1.5, w / 2 - 1.5]) {
      const leg = boxMesh(3, h - 1.6, d, wood, (h - 1.6) / 2);
      leg.position.set(x, (h - 1.6) / 2, 0); g.add(leg);
    }
    return { mesh: g, colliders: [solid(w, h + 1.6, d, (h + 1.6) / 2)] };
  },
});

export const UPSTAIRS_KIT_LOADED = true;
