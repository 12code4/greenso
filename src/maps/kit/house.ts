// The House Kit (docs/10, docs/blueprints/floor-G.md §7): furniture, appliances,
// fixtures and "life props" for the indoor floors, at honest 1:32 dimensions.
// Same rules as the yard kit: primitives + canvas textures, a material family
// and a tint per part, colliders as local boxes. Parametric props read `size`.
// Climb props (stack_stairs, rope_knots, bookcase, fireplace, marble_run) are
// built so every step is ≤ 1.2 u: a jump (apex 1.35) or an auto-step (0.35).

import * as THREE from 'three';
import { Vec3 } from '../../core/math';
import { mat } from './materials';
import { reg, boxMesh, cylMesh, solid, pickColor, BOOK_COLORS, LocalBox } from './registry';

const OAK = 0xd9c4a0, WALNUT = 0x6b4a32, WHITE_GOODS = 0xf2f0ea, STEEL = 0xb8bcc0;
const textCache = new Map<string, THREE.CanvasTexture>();

/** Canvas text texture: lines of text on a colour. Cached by content. */
export function textTex(lines: string[], bg: string, fg: string, w = 256, h = 256, font = 'bold 28px "Courier New", monospace', tilt = 0): THREE.CanvasTexture {
  const key = `${lines.join('|')}|${bg}|${fg}|${w}x${h}|${font}|${tilt}`;
  const cached = textCache.get(key);
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.font = font;
  g.textAlign = 'center';
  g.translate(w / 2, h / 2);
  g.rotate(tilt);
  const lh = parseInt(font.match(/(\d+)px/)?.[1] ?? '28', 10) * 1.3;
  lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + lh * 0.35));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  textCache.set(key, t);
  return t;
}

const texMat = (t: THREE.Texture, roughness = 0.9): THREE.Material => new THREE.MeshStandardMaterial({ map: t, roughness });
const sz = (size: Vec3 | undefined, d: Vec3): Vec3 => size ?? d;

// ------------------------------------------------------------ kitchen

reg({
  id: 'counter_run',
  dims: [66, 16.7, 11],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [66, 16.7, 11]);
    const g = new THREE.Group();
    const cab = mat('WOOD_WARM', pickColor(v, [OAK, 0xe8e0d0, 0x8a6a48]));
    g.add(boxMesh(w, h - 0.8, d - 0.6, cab, (h - 0.8) / 2));
    // toe kick, countertop slab with a lip, door and drawer lines
    const kick = boxMesh(w, 1.8, 0.5, mat('WOOD_WARM', 0x5a4632), 0.9);
    kick.position.z = -d / 2 + 0.05;
    g.add(kick);
    const top = boxMesh(w + 0.8, 0.8, d + 0.6, mat('STONE', 0xd8d2c4), h - 0.4);
    g.add(top);
    const line = mat('WOOD_WARM', 0x5a4632);
    for (let x = -w / 2 + 11; x < w / 2 - 1; x += 11) {
      const seam = boxMesh(0.25, h - 3, 0.2, line, (h - 1) / 2);
      seam.position.set(x, (h - 1) / 2, -d / 2 - 0.05);
      g.add(seam);
    }
    for (let x = -w / 2 + 5.5; x < w / 2; x += 11) {
      const handle = boxMesh(3, 0.5, 0.5, mat('METAL_KITCHEN', STEEL), h - 3.5);
      handle.position.set(x, h - 3.5, -d / 2 - 0.3);
      g.add(handle);
    }
    return { mesh: g, colliders: [solid(w + 0.8, h, d + 0.6)] };
  },
});

reg({
  id: 'cabinet_upper',
  dims: [66, 13, 6.5],
  walkableTop: true,
  build(v, size) {
    const [w, h, d] = sz(size, [66, 13, 6.5]);
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('WOOD_WARM', pickColor(v, [OAK, 0xe8e0d0, 0x8a6a48]))));
    for (let x = -w / 2 + 11; x < w / 2 - 1; x += 11) {
      const seam = boxMesh(0.25, h - 1, 0.2, mat('WOOD_WARM', 0x5a4632), h / 2);
      seam.position.set(x, h / 2, -d / 2 - 0.05);
      g.add(seam);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'island',
  dims: [25, 16.7, 20],
  walkableTop: true,
  cover: 'BW',
  build() {
    const w = 25, h = 16.7, d = 20;
    const g = new THREE.Group();
    g.add(boxMesh(w, h - 0.8, d, mat('WOOD_WARM', 0x8a6a48), (h - 0.8) / 2));
    g.add(boxMesh(w + 1.2, 0.8, d + 1.2, mat('STONE', 0xd8d2c4), h - 0.4));
    return { mesh: g, colliders: [solid(w + 1.2, h, d + 1.2)] };
  },
});

reg({
  id: 'stool',
  dims: [6, 12, 6],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(cylMesh(3, 1.2, mat('WOOD_WARM', OAK), 11.4, 14));
    for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) {
      const leg = cylMesh(0.35, 11, mat('METAL_KITCHEN', STEEL), 5.5, 8);
      leg.position.set(x, 5.5, z);
      g.add(leg);
    }
    return { mesh: g, colliders: [solid(6, 12, 6)] };
  },
});

reg({
  id: 'stove',
  dims: [11, 16.7, 11],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(11, 16.7, 11, mat('METAL_KITCHEN', WHITE_GOODS)));
    const glass = boxMesh(8, 5, 0.3, mat('GLASS_CHEAP', 0x333333), 8);
    glass.position.z = -5.6;
    g.add(glass);
    for (const [x, z] of [[-2.8, -2.8], [2.8, -2.8], [-2.8, 2.8], [2.8, 2.8]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 6, 18), mat('METAL_KITCHEN', 0x2a2a2a));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 16.85, z);
      g.add(ring);
    }
    const back = boxMesh(11, 2.5, 1.5, mat('METAL_KITCHEN', WHITE_GOODS), 17.9);
    back.position.z = 4.7;
    g.add(back);
    return { mesh: g, colliders: [solid(11, 16.7, 11)] };
  },
});

reg({
  id: 'range_hood',
  dims: [11, 6, 11],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(4, 6.5, 4, 4), mat('METAL_KITCHEN', STEEL));
    hood.rotation.y = Math.PI / 4;
    hood.position.y = 2;
    hood.castShadow = true;
    g.add(hood);
    g.add(boxMesh(6, 12, 6, mat('METAL_KITCHEN', STEEL), 10));
    return { mesh: g, colliders: [solid(11, 4, 11, 2)] };
  },
});

reg({
  id: 'fridge',
  // 75 × 180 × 75 cm. Variant 1: door swung open toward −x, shelves inside climbable, the cake on shelf 2.
  dims: [14, 33, 14],
  walkableTop: true,
  cover: 'BW',
  build(v) {
    const w = 14, h = 33, d = 14;
    const g = new THREE.Group();
    const body = mat('METAL_KITCHEN', WHITE_GOODS);
    const colliders: LocalBox[] = [];
    if (v === 1) {
      // Open: back + two sides + top/bottom, interior shelves, door hinged at the −x front corner
      g.add(boxMesh(w, h, 1, body, h / 2).translateZ(d / 2 - 0.5)); // back
      for (const x of [-w / 2 + 0.5, w / 2 - 0.5]) {
        const side = boxMesh(1, h, d, body, h / 2);
        side.position.x = x;
        g.add(side);
      }
      g.add(boxMesh(w, 1, d, body, 0.5));
      g.add(boxMesh(w, 1, d, body, h - 0.5));
      colliders.push(solid(w, h, 1, h / 2, 0, d / 2 - 0.5), solid(1, h, d, h / 2, -w / 2 + 0.5), solid(1, h, d, h / 2, w / 2 - 0.5), solid(w, 1, d, h - 0.5), solid(w, 1, d, 0.5));
      for (const y of [8, 16, 24]) {
        const shelf = boxMesh(w - 2, 0.4, d - 2, mat('GLASS_CHEAP', 0xdde8ee), y);
        g.add(shelf);
        colliders.push(solid(w - 2, 0.4, d - 2, y));
      }
      // The cake (secret 13), a milk carton, jars
      const cake = cylMesh(3, 2.4, mat('CERAMIC', 0xf4c8d8), 16.2 + 1.2, 18);
      cake.position.set(-1.5, 17.4, 1);
      g.add(cake);
      const icing = cylMesh(3.1, 0.5, mat('CERAMIC', 0xffffff), 18.65, 18);
      icing.position.set(-1.5, 18.65, 1);
      g.add(icing);
      const card = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2), texMat(textTex(['DO NOT EAT', '— FOR', 'SATURDAY'], '#fff8e0', '#5a3a3a', 256, 160, 'bold 34px "Courier New", monospace')));
      card.position.set(-1.5, 17.5, -2.3);
      g.add(card);
      const milk = boxMesh(2.2, 4.5, 2.2, mat('PAPERBOARD', 0xf4f4f8), 8.2 + 2.25);
      milk.position.set(3.5, 10.45, 2);
      g.add(milk);
      for (let i = 0; i < 3; i++) {
        const jar = cylMesh(1, 2.2, mat('GLASS_CHEAP', pickColor(i, [0xc93a3a, 0x7aa050, 0xe0b040])), 24.2 + 1.1, 10);
        jar.position.set(-3.5 + i * 3, 25.3, 2);
        g.add(jar);
      }
      // Door: hinged at (−w/2, −d/2), swung 100° so it stands along −z
      const door = boxMesh(1.2, h, d, body, h / 2);
      door.position.set(-w / 2 - 0.6, h / 2, -d / 2 - d / 2);
      g.add(door);
      colliders.push(solid(1.2, h, d, h / 2, -w / 2 - 0.6, -d));
      const handle = boxMesh(0.6, 12, 0.6, mat('METAL_KITCHEN', STEEL), h * 0.55);
      handle.position.set(-w / 2 - 1.5, h * 0.55, -d - d / 2 + 2);
      g.add(handle);
    } else {
      g.add(boxMesh(w, h, d, body, h / 2));
      colliders.push(solid(w, h, d));
      const seam = boxMesh(w, 0.3, 0.2, mat('METAL_KITCHEN', 0x9a9a9a), h * 0.62);
      seam.position.z = -d / 2 - 0.05;
      g.add(seam);
      const handle = boxMesh(0.6, 10, 0.6, mat('METAL_KITCHEN', STEEL), h * 0.4);
      handle.position.set(-w / 2 + 1.5, h * 0.4, -d / 2 - 0.5);
      g.add(handle);
    }
    // Magnets and the kids' notes on the front face (secret 12): a canvas
    const face = new THREE.Mesh(new THREE.PlaneGeometry(v === 1 ? 10 : 11, 12), texMat(magnetTexture(), 0.7));
    face.position.set(v === 1 ? -w / 2 - 1.3 : 0, h * 0.62, v === 1 ? -d - 2 : -d / 2 - 0.15);
    if (v === 1) face.rotation.y = -Math.PI / 2;
    g.add(face);
    return { mesh: g, colliders };
  },
});

const MAGNET_LINES = [
  ['MILK  EGGS', 'DOG FOOD', 'PIP DID IT'],
  ['CALL GRANDMA', 'SAT: RUMMAGE', '555-0143 (US)'],
  ['JONAH -', 'HOMEWORK', 'FIRST'],
  ['PIZZA FRI?', 'YES YES YES', '- P'],
];
let magnetTex: THREE.CanvasTexture | null = null;
function magnetTexture(): THREE.CanvasTexture {
  if (magnetTex) return magnetTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 300;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f2f0ea';
  g.fillRect(0, 0, 256, 300);
  // a drawing taped crooked
  g.save();
  g.translate(70, 70);
  g.rotate(-0.12);
  g.fillStyle = '#fff9dc';
  g.fillRect(-45, -50, 90, 100);
  g.fillStyle = '#7aa050';
  g.fillRect(-35, 20, 70, 20);
  g.fillStyle = '#3e7a34';
  for (let i = 0; i < 4; i++) g.fillRect(-30 + i * 17, -5, 8, 25);
  g.fillStyle = '#e0b040';
  g.beginPath(); g.arc(20, -30, 10, 0, 6.3); g.fill();
  g.fillStyle = '#c93a3a';
  g.font = 'bold 14px sans-serif';
  g.fillText('ARMY MEN by PIP', -42, 45);
  g.restore();
  // magnet letters spelling one of the messages
  const lines = MAGNET_LINES[Math.floor(Math.random() * MAGNET_LINES.length)];
  const colors = ['#c93a3a', '#2f63b8', '#3c9a4a', '#e08a22', '#7a4aa0'];
  g.font = 'bold 22px Impact, sans-serif';
  lines.forEach((line, li) => {
    let x = 128 - line.length * 6.5;
    for (const ch of line) {
      if (ch !== ' ') {
        g.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        g.save();
        g.translate(x + 6, 150 + li * 40);
        g.rotate((Math.random() - 0.5) * 0.3);
        g.fillText(ch, 0, 0);
        g.restore();
      }
      x += 13;
    }
  });
  // a photo strip and a takeout menu magnet
  g.fillStyle = '#e8e0cc';
  g.fillRect(170, 30, 60, 80);
  g.fillStyle = '#c93a3a';
  g.fillRect(20, 250, 90, 40);
  g.fillStyle = '#fff';
  g.font = 'bold 16px sans-serif';
  g.fillText("MARIO'S", 30, 275);
  magnetTex = new THREE.CanvasTexture(c);
  magnetTex.colorSpace = THREE.SRGBColorSpace;
  return magnetTex;
}

reg({
  id: 'drawer_open',
  // A kitchen drawer pulled out and left: 12 × 2.2 × 12, open top; the junk inside (secret 14). Interior floor at 1;
  // the sides rise 1.2 above it, so a soldier hops out (jump apex 1.35).
  dims: [12, 2.2, 12],
  walkableTop: true,
  build() {
    const w = 12, h = 2.2, d = 12;
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', OAK);
    g.add(boxMesh(w, 1, d, wood, 0.5));
    const colliders: LocalBox[] = [solid(w, 1, d, 0.5)];
    for (const [x, z, sw, sd] of [[-w / 2 + 0.3, 0, 0.6, d], [w / 2 - 0.3, 0, 0.6, d], [0, -d / 2 + 0.3, w, 0.6], [0, d / 2 - 0.3, w, 0.6]]) {
      const wall = boxMesh(sw, h, sd, wood, h / 2);
      wall.position.set(x, h / 2, z);
      g.add(wall);
      colliders.push(solid(sw, h, sd, h / 2, x, z));
    }
    const front = boxMesh(w + 1, h + 1, 0.8, mat('WOOD_WARM', 0x8a6a48), h / 2);
    front.position.z = -d / 2 - 0.4;
    g.add(front);
    // The junk: rubber bands, twist ties, a dead battery, a takeout menu, birthday candles
    for (let i = 0; i < 4; i++) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.14, 5, 14), mat('RUBBER_MATTE', 0xd9c26b));
      band.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      band.position.set(-3 + i * 1.6, 1.15, -2 + (i % 2) * 3);
      g.add(band);
    }
    const battery = cylMesh(0.7, 3.2, mat('METAL_KITCHEN', 0x2a2a2a), 1.7, 10);
    battery.rotation.z = Math.PI / 2;
    battery.position.set(2.5, 1.7, 3);
    g.add(battery);
    const cap = cylMesh(0.72, 0.8, mat('METAL_KITCHEN', 0xd8b04a), 1.7, 10);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(4.1, 1.7, 3);
    g.add(cap);
    const menu = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.6), texMat(textTex(["MARIO'S", 'PIZZA', 'FREE', 'DELIVERY'], '#f4e6c0', '#c93a3a', 200, 260, 'bold 30px Impact, sans-serif')));
    menu.rotation.x = -Math.PI / 2;
    menu.rotation.z = 0.3;
    menu.position.set(-2, 1.05, 3.2);
    g.add(menu);
    for (let i = 0; i < 5; i++) {
      const candle = cylMesh(0.18, 2.2, mat('PLASTIC_TOY', pickColor(i, [0xf4c8d8, 0x9ad0f0, 0xf4e86a])), 1.2, 6);
      candle.rotation.z = Math.PI / 2;
      candle.rotation.y = 0.4;
      candle.position.set(3.5 - i * 0.4, 1.2, -3.5 + i * 0.3);
      g.add(candle);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'faucet',
  dims: [2, 7, 6],
  build() {
    const g = new THREE.Group();
    const metal = mat('METAL_KITCHEN', STEEL);
    const base = cylMesh(1.1, 1.2, metal, 0.6, 12);
    g.add(base);
    const neck = new THREE.Mesh(new THREE.TorusGeometry(3, 0.5, 8, 18, Math.PI), metal);
    neck.position.set(0, 1.2, -3);
    neck.rotation.y = Math.PI / 2;
    neck.rotation.z = 0;
    g.add(neck);
    for (const x of [-1.8, 1.8]) {
      const knob = cylMesh(0.6, 1.5, metal, 0.75, 8);
      knob.position.set(x, 0.75, 1.5);
      g.add(knob);
    }
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'toaster',
  dims: [5, 4.5, 3],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(5, 4.5, 3, mat('METAL_KITCHEN', 0xd8d8dc)));
    for (const x of [-1.1, 1.1]) {
      const slot = boxMesh(0.7, 0.3, 2.4, mat('METAL_KITCHEN', 0x1a1a1a), 4.6);
      slot.position.x = x;
      g.add(slot);
    }
    const lever = boxMesh(0.6, 0.6, 0.6, mat('PLASTIC_TOY', 0x2a2a2a), 2.2);
    lever.position.set(2.8, 2.2, 0);
    g.add(lever);
    const dial = cylMesh(0.5, 0.3, mat('PLASTIC_TOY', 0x2a2a2a), 1.2, 10);
    dial.rotation.z = Math.PI / 2;
    dial.position.set(2.65, 1.2, 0.8);
    g.add(dial);
    return { mesh: g, colliders: [solid(5, 4.5, 3)] };
  },
});

reg({
  id: 'microwave',
  dims: [9, 5.5, 7],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(9, 5.5, 7, mat('METAL_KITCHEN', 0x2c2c30)));
    const win = boxMesh(5.2, 3.8, 0.2, mat('GLASS_CHEAP', 0x444444), 2.9);
    win.position.set(-1.3, 2.9, -3.55);
    g.add(win);
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 4.4), texMat(textTex(['HI PIP', '1 2 3', '4 5 6', '7 8 9', 'START'], '#1a1a1e', '#8ff08a', 110, 220, 'bold 20px "Courier New", monospace')));
    pad.position.set(3.2, 2.9, -3.56);
    g.add(pad);
    return { mesh: g, colliders: [solid(9, 5.5, 7)] };
  },
});

reg({
  id: 'pantry_shelf',
  // Uprights with shelves every 11 u (a kid can climb them with a stack). size = [w, h, d].
  dims: [20, 37, 6],
  walkableTop: true,
  cover: 'CC',
  build(v, size) {
    const [w, h, d] = sz(size, [20, 37, 6]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [0xe8e0d0, OAK]));
    const colliders: LocalBox[] = [];
    for (const x of [-w / 2 + 0.4, w / 2 - 0.4]) {
      const up = boxMesh(0.8, h, d, wood, h / 2);
      up.position.x = x;
      g.add(up);
      colliders.push(solid(0.8, h, d, h / 2, x));
    }
    const back = boxMesh(w, h, 0.3, wood, h / 2);
    back.position.z = d / 2 - 0.15;
    g.add(back);
    colliders.push(solid(w, h, 0.3, h / 2, 0, d / 2 - 0.15));
    // Tiers every 6.5 u (35 cm). At the +x end of each tier the kid left a can (2.2) and a cereal box
    // on its side (4.4): two hops to the next tier. Cans fill the rest, leaving a lane at the front.
    let tier = 0;
    for (let y = 0.35; y < h - 4; y += 6.5) {
      const shelf = boxMesh(w - 1.6, 0.7, d, wood, y);
      g.add(shelf);
      colliders.push(solid(w - 1.6, 0.7, d, y));
      const top = y + 0.35;
      const stepX = tier % 2 === 0 ? w / 2 - 3.2 : -w / 2 + 3.2; // zig-zag
      const can = cylMesh(1.1, 2.2, mat('PAPERBOARD', pickColor(tier, [0xc93a3a, 0x2f63b8])), top + 1.1, 10);
      can.position.set(stepX - (tier % 2 === 0 ? 3.2 : -3.2), top + 1.1, 0);
      g.add(can);
      colliders.push(solid(2.2, 2.2, 2.2, top + 1.1, stepX - (tier % 2 === 0 ? 3.2 : -3.2), 0));
      const box = boxMesh(3.6, 4.4, 5.2, mat('PAPERBOARD', pickColor(tier + 1, [0xe0b040, 0x3c9a4a, 0xe08a22])), top + 2.2);
      box.position.set(stepX, top + 2.2, 0);
      g.add(box);
      colliders.push(solid(3.6, 4.4, 5.2, top + 2.2, stepX, 0));
      for (let x = -w / 2 + 2.5; x < w / 2 - 2.5; x += 2.4) {
        if (Math.abs(x - stepX) < 5 || Math.random() < 0.35) continue;
        const c = cylMesh(1.0, 2.2, mat('PAPERBOARD', pickColor(Math.floor(x * 3) + tier, [0xc93a3a, 0x2f63b8, 0x3c9a4a, 0xe08a22, 0xf4f0e6])), top + 1.1, 10);
        c.position.set(x, top + 1.1, 1.2);
        g.add(c);
      }
      tier++;
    }
    return { mesh: g, colliders };
  },
});

// ------------------------------------------------------------ climbs (kid logic)

reg({
  id: 'stack_stairs',
  // Paperbacks shingled up like roof tiles: every book is one riser (≤ 0.34 u, one auto-step), so the
  // stack is a ramp you walk, not a ladder you jump. size = [w, rise, run]; rises toward −z. Keep run ≥ 1.3 × rise.
  dims: [4, 8, 8],
  walkableTop: true,
  build(v, size) {
    const [w, rise, run] = sz(size, [4, 8, 8]);
    const n = Math.max(1, Math.ceil(rise / 0.34));
    const riser = rise / n;
    const tread = run / n;
    const depth = Math.max(tread * 1.2, 3.6); // each book overhangs the one below (shingled)
    const g = new THREE.Group();
    const colliders: LocalBox[] = [];
    for (let i = 0; i < n; i++) {
      const h = riser * (i + 1);
      const z = run / 2 - tread * (i + 0.5);
      const book = boxMesh(w * (0.9 + Math.random() * 0.1), riser, depth, mat('PAPERBOARD', pickColor(v + i * 3, BOOK_COLORS)), h - riser / 2);
      book.position.set((Math.random() - 0.5) * 0.3, h - riser / 2, z + depth / 2 - tread / 2);
      book.rotation.y = (Math.random() - 0.5) * 0.08;
      g.add(book);
      colliders.push(solid(w, h, tread, h / 2, 0, z));
    }
    // A hardcover under the foot of the run, the kids' shim
    g.add(boxMesh(w + 0.6, 0.3, depth + 0.6, mat('PAPERBOARD', pickColor(v + 1, BOOK_COLORS)), 0.15).translateZ(run / 2 - tread / 2 + depth / 2 - 0.2));
    return { mesh: g, colliders };
  },
});

reg({
  id: 'rope_knots',
  // A knotted jump rope hung from above: knots every 1.1 u are ledges (hop knot to knot). The knots kink the
  // rope left and right (±0.75 in x) so no knot hangs over your head — you hop up and across. size = [_, h, _].
  // A "hard" climb by design: jumps, not steps. Routes that use it are setpieces for the walk gate.
  dims: [2.6, 15, 1.2],
  build(v, size) {
    const [, h] = sz(size, [2.6, 15, 1.2]);
    const g = new THREE.Group();
    const rope = mat('FABRIC_SOFT', pickColor(v, [0xd94a6a, 0x4a7ad9, 0xe8d24a]));
    const colliders: LocalBox[] = [];
    let k = 0;
    let prev = new THREE.Vector3(0, 0, 0);
    for (let y = 1.1; y < h; y += 1.1, k++) {
      const x = (k % 2 ? -0.75 : 0.75);
      const at = new THREE.Vector3(x, y, 0);
      const seg = cylMesh(0.12, prev.distanceTo(at), rope, 0, 6);
      seg.position.copy(prev).lerp(at, 0.5);
      seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), at.clone().sub(prev).normalize());
      g.add(seg);
      prev = at;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), rope);
      knot.scale.set(1.3, 0.7, 1.3);
      knot.position.set(x, y, 0);
      knot.castShadow = true;
      g.add(knot);
      colliders.push(solid(1.1, 0.3, 1.1, y, x));
    }
    const tail = cylMesh(0.12, h - prev.y, rope, 0, 6);
    tail.position.set(prev.x / 2, (prev.y + h) / 2, 0);
    g.add(tail);
    for (const x of [-0.5, 0.5]) {
      const handle = cylMesh(0.3, 2.2, mat('PLASTIC_TOY', 0xf2e6c8), 1.1, 8);
      handle.position.set(x, 1.1, 0);
      g.add(handle);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'bookcase',
  // 160 × 200 × 32 cm. Shelves every 5.5 u; on every shelf the kid stacked books into a staircase (hops of
  // 1.1) toward one end, and the shelf above stops 4 u short of the upright there — you hop up through the
  // gap onto it, then the next staircase runs back the other way. Standing books line the back of every
  // shelf; the front lane is yours. A top board closes the case at h. size = [w, h, d].
  dims: [29.6, 37, 6],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [29.6, 37, 6]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [WALNUT, OAK]));
    const colliders: LocalBox[] = [];
    for (const x of [-w / 2 + 0.5, w / 2 - 0.5]) {
      const up = boxMesh(1, h, d, wood, h / 2);
      up.position.x = x;
      g.add(up);
      colliders.push(solid(1, h, d, h / 2, x));
    }
    const back = boxMesh(w, h, 0.4, wood, h / 2);
    back.position.z = d / 2 - 0.2;
    g.add(back);
    colliders.push(solid(w, h, 0.4, h / 2, 0, d / 2 - 0.2));
    const gap = 5.5;
    const boards: number[] = [];
    for (let y = 0.4; y <= h - 0.3 - 3.0; y += gap) boards.push(y); // every regular board that leaves ≥ 3 u (two hops) under the top
    boards.push(h - 0.3); // top board
    const hole = 4;
    for (let k = 0; k < boards.length; k++) {
      const y = boards[k];
      const dirBelow = (k - 1) % 2 === 0 ? 1 : -1; // where the stacks under this board rise to
      if (k === 0) {
        const board = boxMesh(w - 2, 0.6, d, wood, y);
        g.add(board);
        colliders.push(solid(w - 2, 0.6, d, y));
      } else {
        // The board stops `hole` short of the upright at the end the stacks below rise toward
        const bw = w - 2 - hole;
        const bx = -dirBelow * hole / 2;
        const board = boxMesh(bw, 0.6, d, wood, y);
        board.position.x = bx;
        g.add(board);
        colliders.push(solid(bw, 0.6, d, y, bx));
      }
      if (k === boards.length - 1) break;
      const dir = k % 2 === 0 ? 1 : -1;
      const top = y + 0.3;
      const nextTop = boards[k + 1] + 0.3;
      const hops = Math.max(1, Math.round((nextTop - top) / 1.1) - 1);
      // Stacks rising toward `dir`, the tallest under the hole in the board above; front lane, 3.4 deep
      for (let s = 0; s < hops; s++) {
        const sh = 1.1 * (s + 1);
        const x = dir * (w / 2 - 2.6 - 3.4 * (hops - 1 - s));
        let yy = top;
        let n = 0;
        while (yy < top + sh - 0.01) {
          const bh = Math.min(0.74, top + sh - yy);
          const book = boxMesh(3.0, bh, 3.2, mat('PAPERBOARD', pickColor(v + k * 7 + s * 3 + n, BOOK_COLORS)), yy + bh / 2);
          book.position.set(x + (Math.random() - 0.5) * 0.3, yy + bh / 2, -1.3);
          g.add(book);
          yy += bh;
          n++;
        }
        colliders.push(solid(3.2, sh, 3.4, top + sh / 2, x, -1.3));
      }
      // Standing books along the back of the shelf (2.1 deep), clear of the hole above
      const startX = -dir * (w / 2 - 1.5);
      const endX = dir * (w / 2 - 1 - hole - 0.5);
      const step = 0.9 * dir;
      for (let x = startX; dir > 0 ? x < endX : x > endX; x += step) {
        const bh = 3.6 + Math.random() * 1.3;
        const book = boxMesh(0.7, bh, d - 3.9, mat('PAPERBOARD', pickColor(Math.floor(x * 5) + k, BOOK_COLORS)), top + bh / 2);
        book.position.set(x, top + bh / 2, 1.65);
        book.rotation.z = Math.random() < 0.1 ? 0.25 * dir : 0;
        g.add(book);
      }
      colliders.push(solid(Math.abs(endX - startX), 4.2, d - 3.9, top + 2.1, (startX + endX) / 2, 1.65));
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'fireplace',
  // Brick fireplace with a stone hearth, a mantel at 20 and a chimney breast to the ceiling (size.y).
  // The stones on the left cheek step up 1.1 at a time: the climb to the mantel (hops, not steps).
  dims: [28, 96, 8],
  walkableTop: true,
  cover: 'BW',
  build(_, size) {
    const [w, h, d] = sz(size, [28, 96, 8]);
    const g = new THREE.Group();
    const brick = mat('STONE', 0x9c4c38);
    const stone = mat('STONE', 0x8d8a80);
    const colliders: LocalBox[] = [];
    // hearth slab
    g.add(boxMesh(w + 6, 3, d + 6, stone, 1.5));
    colliders.push(solid(w + 6, 3, d + 6, 1.5));
    // breast: two cheeks + lintel + upper mass, firebox open between y 3..13
    for (const x of [-w / 2 + 3.5, w / 2 - 3.5]) {
      const cheek = boxMesh(7, 10, d, brick, 8);
      cheek.position.x = x;
      g.add(cheek);
      colliders.push(solid(7, 10, d, 8, x));
    }
    const firebox = boxMesh(w - 14, 10, 1, mat('STONE', 0x2a2420), 8);
    firebox.position.z = d / 2 - 0.5;
    g.add(firebox);
    colliders.push(solid(w - 14, 10, 1, 8, 0, d / 2 - 0.5));
    g.add(boxMesh(w, 7, d, brick, 16.5)); // lintel band 13..20
    colliders.push(solid(w, 7, d, 16.5));
    const mantel = boxMesh(w + 4, 1.2, d + 3, mat('WOOD_WARM', WALNUT), 20.6);
    g.add(mantel);
    colliders.push(solid(w + 4, 1.2, d + 3, 20.6));
    g.add(boxMesh(w, h - 21.2, d, brick, 21.2 + (h - 21.2) / 2));
    colliders.push(solid(w, h - 21.2, d, 21.2 + (h - 21.2) / 2));
    // Stone ledges out of the left cheek's outer face (1.2 risers, 1.6 treads), zig-zagging front → back → front
    // so the climb stays on the cheek; the top ledge is one auto-step under the mantel. 5.2 deep, so you stand
    // clear of the mantel's underside. A "hard" climb: jumps, not steps.
    // 1.1 risers (the bookcase hop; 0.25 u under the jump apex), 1.25 treads, 7 + 7 + 2 stones over local z −6..1.5:
    // the first stone is a hop up from the hearth, the breast's last 1.6 u sit inside the wall behind it. Each pass
    // turns one tread back; a stone two hops above another leaves 1.2 u of head room (2 × 1.1 − the 1.0 slab).
    // Top stone 20.6, mantel 21.2.
    const zs: number[] = [];
    for (let k = 0; k < 7; k++) zs.push(-6 + 1.25 * k);
    for (let k = 0; k < 7; k++) zs.push(0.25 - 1.25 * k);
    for (let k = 0; k < 2; k++) zs.push(-6 + 1.25 * k);
    let y = 3;
    for (const z of zs) {
      // 1.2 along the run (< the 1.25 tread): neighbours never overlap, so no ledge hangs 1 u over the one beside it
      const ledge = boxMesh(5.2, 1.0, 1.2, stone, y + 0.5);
      ledge.position.set(-w / 2 - 2.6, y + 0.5, z);
      ledge.rotation.y = (Math.random() - 0.5) * 0.06;
      g.add(ledge);
      colliders.push(solid(5.2, 1.0, 1.2, y + 0.5, -w / 2 - 2.6, z)); // a slab, not a column: the return pass hangs over the first
      y += 1.1;
    }
    // Andirons and a log
    const log = cylMesh(1.2, w - 18, mat('WOOD_WARM', 0x5a3a22), 4.2, 8);
    log.rotation.z = Math.PI / 2;
    log.position.set(0, 4.2, 1);
    g.add(log);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'marble_run',
  // The kids' marble run down the stairs: ruler-track ramp, 1.6 u wide with rails, stepped 0.3 u colliders.
  // size = [1.6, rise, run]; rises toward −z. Place two pieces with a gap between for the bridge.
  // Variant 2 = no marble parked on it (the upper piece).
  dims: [1.6, 46, 64],
  walkableTop: true,
  build(v, size) {
    const [w, rise, run] = sz(size, [1.6, 46, 64]);
    const g = new THREE.Group();
    const track = mat('WOOD_WARM', 0xe0c890);
    const rail = mat('PLASTIC_TOY', 0xc93a3a);
    const colliders: LocalBox[] = [];
    const t0 = 0, t1 = 1;
    const steps = Math.ceil((rise * (t1 - t0)) / 0.3);
    const dz = (run * (t1 - t0)) / steps;
    for (let i = 0; i < steps; i++) {
      const t = t0 + (t1 - t0) * ((i + 0.5) / steps);
      const y = rise * t;
      const z = run / 2 - run * t;
      colliders.push(solid(w, y, dz + 0.05, y / 2, 0, z));
    }
    // Visual: ruler segments laid end to end at the slope, with side rails
    const segLen = 10;
    const slope = Math.atan2(rise, run);
    for (let s = 0; s < (run * (t1 - t0)) / segLen; s++) {
      const t = t0 + (t1 - t0) * ((s + 0.5) * segLen) / (run * (t1 - t0));
      if (t > t1) break;
      const seg = boxMesh(w, 0.35, segLen / Math.cos(slope) + 0.3, track, 0);
      seg.position.set(0, rise * t - 0.15, run / 2 - run * t);
      seg.rotation.x = slope;
      g.add(seg);
      for (const x of [-w / 2 + 0.15, w / 2 - 0.15]) {
        const r = boxMesh(0.3, 0.9, segLen / Math.cos(slope) + 0.3, rail, 0);
        r.position.set(x, rise * t + 0.3, run / 2 - run * t);
        r.rotation.x = slope;
        g.add(r);
      }
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, segLen / Math.cos(slope) * 0.95), texMat(textTex(['| | | | | | | | | |'], '#e0c890', '#5a4632', 256, 64, 'bold 26px monospace'), 0.9));
      tick.position.set(0, rise * t + 0.03, run / 2 - run * t);
      tick.rotation.x = -Math.PI / 2 + slope;
      g.add(tick);
    }
    // A marble parked on the track
    if (v !== 2) {
      const marble = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), mat('GLASS_CHEAP', 0x6aa0e0));
      marble.position.set(0, 0.5 + rise * (t0 + 0.05), run / 2 - run * (t0 + 0.05));
      g.add(marble);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'ruler_bridge',
  // The missing segment: a school ruler tied across the gap with string. size = [1.6, rise, run].
  dims: [1.6, 6, 10],
  walkableTop: true,
  build(_, size) {
    const [w, rise, run] = sz(size, [1.6, 6, 10]);
    const g = new THREE.Group();
    const slope = Math.atan2(rise, run);
    const len = Math.hypot(rise, run);
    const ruler = boxMesh(w, 0.4, len + 0.6, mat('WOOD_WARM', 0xe8d9b0), 0);
    ruler.position.set(0, rise / 2, 0);
    ruler.rotation.x = slope;
    g.add(ruler);
    const tick = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, len), texMat(textTex(['1 2 3 4 5 6 7 8 9 10 11 12'], '#e8d9b0', '#3a3a3a', 512, 48, 'bold 22px monospace'), 0.9));
    tick.position.set(0, rise / 2 + 0.22, 0);
    tick.rotation.x = -Math.PI / 2 + slope;
    g.add(tick);
    for (const end of [-1, 1]) {
      const knot = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.15, 6, 14), mat('FABRIC_SOFT', 0xf2e6c8));
      knot.rotation.y = Math.PI / 2;
      knot.position.set(0, rise / 2 + end * rise / 2, -end * run / 2);
      g.add(knot);
    }
    const colliders: LocalBox[] = [];
    const steps = Math.ceil(rise / 0.3);
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      colliders.push(solid(w, rise * t, run / steps + 0.05, (rise * t) / 2, 0, run / 2 - run * t));
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'ramp_plank',
  // A shelf board from the garage leaned against the counter (or the car): the kids' ramp. size = [w, rise, run];
  // rises toward −z. Stepped 0.3 u colliders — walkable at slopes ≤ 0.77 (rise/run), like the marble run.
  dims: [3, 16.7, 24],
  walkableTop: true,
  build(v, size) {
    const [w, rise, run] = sz(size, [3, 16.7, 24]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [0xc9a66b, 0xe0c890, 0x9a7a52]));
    const slope = Math.atan2(rise, run);
    const len = Math.hypot(rise, run);
    const board = boxMesh(w, 0.5, len + 1, wood, 0);
    board.position.set(0, rise / 2 - 0.25, 0);
    board.rotation.x = slope;
    g.add(board);
    // Grip: rubber bands every 4 u up the board (the kids' idea)
    for (let s = 2; s < len - 1; s += 4) {
      const t = s / len;
      const band = boxMesh(w + 0.2, 0.25, 0.4, mat('RUBBER_MATTE', pickColor(Math.round(s), [0xd9c26b, 0xc93a3a, 0x3c9a4a])), 0);
      band.position.set(0, rise * t + 0.08, run / 2 - run * t);
      band.rotation.x = slope;
      g.add(band);
    }
    // A book wedged under the foot so it can't kick out
    const wedge = boxMesh(w + 1, 0.8, 3, mat('PAPERBOARD', pickColor(v + 2, BOOK_COLORS)), 0.4);
    wedge.position.set(0, 0.4, run / 2 - 1.2);
    g.add(wedge);
    const colliders: LocalBox[] = [];
    const steps = Math.ceil(rise / 0.3);
    const dz = run / steps;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      colliders.push(solid(w, rise * t, dz + 0.05, (rise * t) / 2, 0, run / 2 - run * t));
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'stair_run',
  // The real staircase: 14 risers of 18 cm (3.3 u) — unclimbable by a soldier on purpose. size = [w, rise, run]; rises toward −z.
  dims: [48, 46, 64],
  walkableTop: true,
  build(_, size) {
    const [w, rise, run] = sz(size, [48, 46, 64]);
    const n = 14;
    const riser = rise / n, tread = run / n;
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', 0xb8905e);
    const paint = mat('PAPERBOARD', 0xf0e8d6);
    const colliders: LocalBox[] = [];
    for (let i = 0; i < n; i++) {
      const h = riser * (i + 1);
      const z = run / 2 - tread * (i + 0.5);
      g.add(boxMesh(w, riser - 0.3, tread, paint, h - riser / 2 - 0.15).translateZ(z));
      const nose = boxMesh(w, 0.6, tread + 0.8, wood, h - 0.3);
      nose.position.z = z - 0.4;
      g.add(nose);
      colliders.push(solid(w, h, tread, h / 2, 0, z));
    }
    // Banister on the +x side: posts and a rail
    for (let i = 0; i <= n; i += 2) {
      const h = riser * i;
      const z = run / 2 - tread * i;
      const post = cylMesh(0.5, 14, wood, h + 7, 8);
      post.position.set(w / 2 - 1, h + 7, z);
      g.add(post);
    }
    const slope = Math.atan2(rise, run);
    const railLen = Math.hypot(rise, run);
    const railMesh = boxMesh(1.2, 1.2, railLen, wood, 0);
    railMesh.position.set(w / 2 - 1, rise / 2 + 14, 0);
    railMesh.rotation.x = slope;
    g.add(railMesh);
    return { mesh: g, colliders };
  },
});

// ------------------------------------------------------------ dining + living

reg({
  id: 'dining_table',
  dims: [28, 14, 17],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [28, 14, 17]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [WALNUT, 0x9a6a42]));
    g.add(boxMesh(w, 1, d, wood, h - 0.5));
    const apron = boxMesh(w - 3, 1.6, d - 3, wood, h - 1.8);
    g.add(apron);
    const colliders: LocalBox[] = [solid(w, 1.6, d, h - 0.8)];
    for (const [x, z] of [[-w / 2 + 1.6, -d / 2 + 1.6], [w / 2 - 1.6, -d / 2 + 1.6], [-w / 2 + 1.6, d / 2 - 1.6], [w / 2 - 1.6, d / 2 - 1.6]]) {
      const leg = boxMesh(1.4, h - 1, 1.4, wood, (h - 1) / 2);
      leg.position.set(x, (h - 1) / 2, z);
      g.add(leg);
      colliders.push(solid(1.4, h - 1, 1.4, (h - 1) / 2, x, z));
    }
    // A runner and a bowl of fruit
    g.add(boxMesh(w * 0.35, 0.15, d * 0.85, mat('FABRIC_SOFT', 0x8a3a34), h + 0.07));
    const bowl = cylMesh(3.2, 1.5, mat('CERAMIC', 0x4a6b8a), h + 0.75, 16);
    g.add(bowl);
    for (let i = 0; i < 4; i++) {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), mat('PLASTIC_TOY', pickColor(i, [0xe0b040, 0xc93a3a, 0x7aa050, 0xe08a22])));
      fruit.position.set(Math.cos(i * 1.6) * 1.4, h + 2.1, Math.sin(i * 1.6) * 1.4);
      g.add(fruit);
    }
    return { mesh: g, colliders };
  },
});

reg({
  id: 'chair_dining',
  // Seat 45 cm (8.3 u), back to 90 cm (17 u). Faces −z.
  dims: [8, 17, 8],
  walkableTop: true,
  cover: 'SC',
  build(v) {
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [WALNUT, 0x9a6a42]));
    g.add(boxMesh(8, 0.8, 8, wood, 7.9));
    const cushion = boxMesh(7, 0.6, 7, mat('FABRIC_SOFT', 0x8a3a34), 8.6);
    g.add(cushion);
    const colliders: LocalBox[] = [solid(8, 1.4, 8, 8.2)];
    for (const [x, z] of [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]]) {
      const leg = boxMesh(0.8, 7.5, 0.8, wood, 3.75);
      leg.position.set(x, 3.75, z);
      g.add(leg);
    }
    colliders.push(solid(8, 7.5, 8, 3.75));
    // back: two stiles and three slats
    for (const x of [-3.4, 3.4]) {
      const stile = boxMesh(0.8, 8.5, 0.8, wood, 12.75);
      stile.position.set(x, 12.75, 3.6);
      g.add(stile);
    }
    for (const y of [11, 13.5, 16]) {
      const slat = boxMesh(6.8, 1.2, 0.5, wood, y);
      slat.position.set(0, y, 3.6);
      g.add(slat);
    }
    colliders.push(solid(8, 8.7, 1, 12.65, 0, 3.6));
    return { mesh: g, colliders };
  },
});

reg({
  id: 'sideboard',
  dims: [40, 17, 8],
  walkableTop: true,
  cover: 'BW',
  build(v, size) {
    const [w, h, d] = sz(size, [40, 17, 8]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [WALNUT, 0x9a6a42]));
    g.add(boxMesh(w, h - 1, d, wood, (h - 1) / 2 + 1));
    for (let x = -w / 2 + w / 6; x < w / 2; x += w / 3) {
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), mat('METAL_KITCHEN', 0xd8b04a));
      knob.position.set(x, h * 0.55, -d / 2 - 0.3);
      g.add(knob);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'china_cabinet',
  // Glass-doored upper, sits on the sideboard. size = [w, h, d].
  dims: [40, 20, 8],
  walkableTop: true,
  build(v, size) {
    const [w, h, d] = sz(size, [40, 20, 8]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', pickColor(v, [WALNUT, 0x9a6a42]));
    g.add(boxMesh(w, h, d, wood, h / 2));
    const glass = boxMesh(w - 3, h - 3, 0.3, mat('GLASS_CHEAP', 0xcfe4f4), h / 2);
    glass.position.z = -d / 2 - 0.1;
    g.add(glass);
    for (let i = 0; i < 6; i++) {
      const plate = cylMesh(1.6, 0.2, mat('CERAMIC', 0xf4f0e6), h * 0.35 + (i % 2) * h * 0.4, 14);
      plate.rotation.x = Math.PI / 2;
      plate.position.set(-w / 2 + 4 + (i % 3) * (w / 3.2), h * 0.35 + Math.floor(i / 3) * h * 0.4, -d / 2 + 1.2);
      g.add(plate);
    }
    return { mesh: g, colliders: [solid(w, h, d)] };
  },
});

reg({
  id: 'chandelier',
  // Hangs from the ceiling: size.y = drop of the chain.
  dims: [16, 12, 16],
  build(_, size) {
    const [, drop] = sz(size, [16, 12, 16]);
    const g = new THREE.Group();
    const brass = mat('METAL_KITCHEN', 0xd8b04a);
    g.add(cylMesh(0.25, drop, brass, drop / 2 + 6, 6));
    const hub = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 10), brass);
    hub.position.y = 6;
    g.add(hub);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.TorusGeometry(4, 0.3, 6, 12, Math.PI / 2), brass);
      arm.rotation.y = a;
      arm.rotation.z = Math.PI;
      arm.position.set(Math.cos(a) * 3, 6, Math.sin(a) * 3);
      g.add(arm);
      const candle = cylMesh(0.5, 3, mat('PLASTIC_TOY', 0xfff4dc), 8, 8);
      candle.position.set(Math.cos(a) * 7, 8, Math.sin(a) * 7);
      g.add(candle);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), mat('PLASTIC_TOY', 0xfff0c0, { emissive: 0xffd080 }));
      bulb.position.set(Math.cos(a) * 7, 10.2, Math.sin(a) * 7);
      g.add(bulb);
    }
    const light = new THREE.PointLight(0xffe0b0, 25, 60, 2);
    light.position.y = 9;
    g.add(light);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'couch',
  // 220 × 90 cm, seat 45, back 85, arms 55. Faces −z. Two units of canyon under.
  dims: [41, 16, 17],
  walkableTop: true,
  cover: 'BW',
  build(v) {
    const w = 41, d = 17;
    const g = new THREE.Group();
    const fabric = mat('FABRIC_SOFT', pickColor(v, [0x5a6a8a, 0x8a6a4a, 0x6a8a5a]));
    const dark = mat('FABRIC_SOFT', 0x3a4a6a);
    const colliders: LocalBox[] = [];
    g.add(boxMesh(w - 8, 6.3, d - 4, fabric, 2 + 3.15));
    colliders.push(solid(w - 8, 6.3, d - 4, 5.15));
    for (let i = 0; i < 3; i++) {
      const cushion = boxMesh((w - 9) / 3 - 0.4, 2.2, d - 5, fabric, 9.2);
      cushion.position.set(-(w - 9) / 3 + i * (w - 9) / 3, 9.2, -0.5);
      cushion.castShadow = true;
      g.add(cushion);
    }
    colliders.push(solid(w - 8, 2.2, d - 5, 9.2, 0, -0.5));
    const back = boxMesh(w, 8.5, 4, dark, 12.5);
    back.position.z = d / 2 - 2;
    g.add(back);
    colliders.push(solid(w, 8.5, 4, 12.5, 0, d / 2 - 2));
    for (const x of [-w / 2 + 2, w / 2 - 2]) {
      const arm = boxMesh(4, 8, d, dark, 2 + 4);
      arm.position.x = x;
      g.add(arm);
      colliders.push(solid(4, 8, d, 6, x));
    }
    for (const [x, z] of [[-w / 2 + 3, -d / 2 + 2], [w / 2 - 3, -d / 2 + 2], [-w / 2 + 3, d / 2 - 2], [w / 2 - 3, d / 2 - 2]]) {
      const leg = cylMesh(0.6, 2, mat('WOOD_WARM', WALNUT), 1, 8);
      leg.position.set(x, 1, z);
      g.add(leg);
    }
    // A throw blanket over one arm
    const throwB = boxMesh(6, 1.2, d - 2, mat('FABRIC_SOFT', 0xc9a04e), 10.2);
    throwB.position.x = w / 2 - 2;
    g.add(throwB);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'coffee_table',
  dims: [25, 8, 12],
  walkableTop: true,
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', WALNUT);
    g.add(boxMesh(25, 0.9, 12, wood, 7.55));
    for (const [x, z] of [[-11, -5], [11, -5], [-11, 5], [11, 5]]) {
      const leg = boxMesh(1, 7, 1, wood, 3.5);
      leg.position.set(x, 3.5, z);
      g.add(leg);
    }
    // a remote, a mug ring, magazines
    g.add(boxMesh(1.4, 0.5, 3.6, mat('PLASTIC_TOY', 0x2a2a2e), 8.25).translateX(5).translateZ(-2));
    g.add(boxMesh(5, 0.4, 6.5, mat('PAPERBOARD', 0xe8e0cc), 8.2).translateX(-6).translateZ(1));
    return { mesh: g, colliders: [solid(25, 8, 12, 4)] };
  },
});

reg({
  id: 'tv_cabinet',
  dims: [22, 17, 10],
  walkableTop: true,
  cover: 'BW',
  build() {
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', 0x3a2a22);
    g.add(boxMesh(22, 17, 10, wood));
    const shelf = boxMesh(20, 4, 0.3, mat('STONE', 0x1a1a1a), 6);
    shelf.position.z = -5.1;
    g.add(shelf);
    for (const x of [-5.5, 5.5]) {
      const door = boxMesh(9.5, 9, 0.3, mat('GLASS_CHEAP', 0x334455), 12.5);
      door.position.set(x, 12.5, -5.15);
      g.add(door);
    }
    return { mesh: g, colliders: [solid(22, 17, 10)] };
  },
});

reg({
  id: 'tv_crt',
  // A 27-inch tube television, 1996. Faces −z.
  dims: [12, 10, 9],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(12, 10, 9, mat('PLASTIC_TOY', 0x2a2a2e)));
    const screen = boxMesh(10, 7.5, 0.3, mat('GLASS_CHEAP', 0x1a2a2a), 5.5);
    screen.position.z = -4.6;
    g.add(screen);
    const back = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 5, 4, 4), mat('PLASTIC_TOY', 0x2a2a2e));
    back.rotation.x = Math.PI / 2;
    back.rotation.z = Math.PI / 4;
    back.position.set(0, 5, 6);
    g.add(back);
    const dial = cylMesh(0.6, 0.4, mat('PLASTIC_TOY', 0x8a8a8a), 2, 10);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(4.6, 2, -4.6);
    g.add(dial);
    return { mesh: g, colliders: [solid(12, 10, 9)] };
  },
});

reg({
  id: 'vcr',
  // It blinks 12:00. It has always blinked 12:00. Faces −z.
  dims: [8, 1.6, 6],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(8, 1.6, 6, mat('PLASTIC_TOY', 0x2a2a2e)));
    const clock = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.8), new THREE.MeshStandardMaterial({ map: textTex(['12:00'], '#0a0a0a', '#7cf07a', 120, 40, 'bold 30px "Courier New", monospace'), emissive: 0x2a5a2a, roughness: 0.6 }));
    clock.position.set(-1.8, 0.8, -3.01);
    g.add(clock);
    const slot = boxMesh(3.6, 0.5, 0.2, mat('PLASTIC_TOY', 0x0a0a0a), 0.9);
    slot.position.set(1.6, 0.9, -3.05);
    g.add(slot);
    return { mesh: g, colliders: [solid(8, 1.6, 6)] };
  },
});

reg({
  id: 'photo_frame',
  // The family photo: the backyard from the M2 slice (secret 19). Variant 1 = crooked.
  dims: [6, 4.5, 0.5],
  build(v) {
    const g = new THREE.Group();
    const frame = boxMesh(6, 4.5, 0.5, mat('WOOD_WARM', 0x8a6a48));
    frame.position.y = 0;
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.7), texMat(photoTexture(), 0.7));
    photo.position.set(0, 0, -0.27);
    const holder = new THREE.Group();
    holder.add(frame, photo);
    holder.rotation.z = v === 1 ? -0.18 : 0;
    g.add(holder);
    return { mesh: g, colliders: [] };
  },
});
let photoTex: THREE.CanvasTexture | null = null;
function photoTexture(): THREE.CanvasTexture {
  if (photoTex) return photoTex;
  const c = document.createElement('canvas');
  c.width = 260;
  c.height = 185;
  const g = c.getContext('2d')!;
  g.fillStyle = '#9ec4e6'; g.fillRect(0, 0, 260, 185);
  g.fillStyle = '#5c8a3c'; g.fillRect(0, 100, 260, 85);
  g.fillStyle = '#d8cfb8'; g.fillRect(0, 60, 260, 42); // fence
  for (let x = 0; x < 260; x += 14) { g.fillStyle = '#c4b89c'; g.fillRect(x, 60, 2, 42); }
  g.fillStyle = '#b8b0a0'; g.fillRect(190, 40, 10, 70); g.beginPath(); g.ellipse(195, 42, 26, 8, 0, 0, 6.3); g.fill(); // birdbath
  g.fillStyle = '#2f5fa8'; g.fillRect(150, 95, 12, 20); g.fillStyle = '#c9302c'; g.beginPath(); g.moveTo(156, 75); g.lineTo(148, 96); g.lineTo(164, 96); g.fill(); // gnome
  // the family: four figures, a dog
  const people: [number, number, string][] = [[60, 90, '#c9302c'], [85, 84, '#2f63b8'], [110, 105, '#e0b040'], [128, 112, '#7a4aa0']];
  for (const [x, y, col] of people) { g.fillStyle = col; g.fillRect(x - 6, y, 12, 40); g.fillStyle = '#f0c8a0'; g.beginPath(); g.arc(x, y - 8, 8, 0, 6.3); g.fill(); }
  g.fillStyle = '#c9a04e'; g.fillRect(30, 128, 26, 14); g.fillRect(50, 120, 10, 10);
  g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(4, 4, 252, 177);
  photoTex = new THREE.CanvasTexture(c);
  photoTex.colorSpace = THREE.SRGBColorSpace;
  return photoTex;
}

reg({
  id: 'rail',
  // Balcony rail: posts and a top rail. size = [w, h, d]. Collides as a thin wall.
  dims: [120, 12, 1],
  build(_, size) {
    const [w, h] = sz(size, [120, 12, 1]);
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', 0xb8905e);
    g.add(boxMesh(w, 1.2, 1.4, wood, h - 0.6));
    for (let x = -w / 2 + 1; x <= w / 2; x += 6) {
      const post = cylMesh(0.45, h - 1.2, mat('PAPERBOARD', 0xf0e8d6), (h - 1.2) / 2, 8);
      post.position.x = x;
      g.add(post);
    }
    return { mesh: g, colliders: [solid(w, h, 1.4, h / 2)] };
  },
});

reg({
  id: 'side_table',
  dims: [8, 12, 8],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', WALNUT);
    g.add(boxMesh(8, 0.8, 8, wood, 11.6));
    g.add(boxMesh(7, 0.6, 7, wood, 4));
    for (const [x, z] of [[-3.4, -3.4], [3.4, -3.4], [-3.4, 3.4], [3.4, 3.4]]) {
      const leg = boxMesh(0.8, 11.5, 0.8, wood, 5.75);
      leg.position.set(x, 5.75, z);
      g.add(leg);
    }
    return { mesh: g, colliders: [solid(8, 12, 8)] };
  },
});

reg({
  id: 'record_player',
  dims: [8, 3, 6],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(8, 2, 6, mat('WOOD_WARM', WALNUT), 1));
    const platter = cylMesh(2.4, 0.3, mat('RUBBER_MATTE', 0x1a1a1a), 2.15, 24);
    platter.position.x = -1;
    g.add(platter);
    const label = cylMesh(0.8, 0.32, mat('PAPERBOARD', 0xe0b040), 2.16, 16);
    label.position.x = -1;
    g.add(label);
    const arm = boxMesh(0.3, 0.3, 4, mat('METAL_KITCHEN', STEEL), 2.7);
    arm.position.set(2.6, 2.7, 0.5);
    arm.rotation.y = -0.4;
    g.add(arm);
    const lid = boxMesh(8, 0.2, 6, mat('GLASS_CHEAP', 0xcfe4f4), 4.5);
    lid.rotation.x = -1.2;
    lid.position.set(0, 4.5, 3.5);
    g.add(lid);
    return { mesh: g, colliders: [solid(8, 3, 6)] };
  },
});

reg({
  id: 'cardboard_box_open',
  // A box you can crouch under (secret 17): open on the −z side. Concealment is a grass zone with no blades placed by the def.
  dims: [12, 10, 12],
  cover: 'CC',
  build() {
    const w = 12, h = 10, d = 12;
    const g = new THREE.Group();
    const card = mat('PAPERBOARD', 0xc9a670);
    const colliders: LocalBox[] = [];
    for (const [x, z, sw, sd] of [[-w / 2 + 0.2, 0, 0.4, d], [w / 2 - 0.2, 0, 0.4, d], [0, d / 2 - 0.2, w, 0.4]]) {
      const wall = boxMesh(sw, h, sd, card, h / 2);
      wall.position.set(x, h / 2, z);
      g.add(wall);
      colliders.push(solid(sw, h, sd, h / 2, x, z));
    }
    g.add(boxMesh(w, 0.4, d, card, h - 0.2));
    colliders.push(solid(w, 0.4, d, h - 0.2));
    // flaps hanging open at the front, a shipping label
    for (const x of [-w / 4, w / 4]) {
      const flap = boxMesh(w / 2 - 0.3, 0.3, 5, card, h);
      flap.rotation.x = -0.9;
      flap.position.set(x, h - 0.5 + 1.8, -d / 2 - 1.6);
      g.add(flap);
    }
    const label = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), texMat(textTex(['THIS SIDE UP', 'FRAGILE', '(NOT REALLY)'], '#fff8e0', '#3a3a3a', 220, 130, 'bold 22px "Courier New", monospace')));
    label.rotation.y = Math.PI / 2;
    label.position.set(-w / 2 - 0.21, h * 0.55, 0);
    g.add(label);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'piggy_bank',
  dims: [5, 4, 3],
  build() {
    const g = new THREE.Group();
    const pink = mat('CERAMIC', 0xf4b8c8);
    const body = new THREE.Mesh(new THREE.SphereGeometry(2, 14, 10), pink);
    body.scale.set(1.25, 0.9, 0.75);
    body.position.y = 2.2;
    body.castShadow = true;
    g.add(body);
    const snout = cylMesh(0.7, 0.8, mat('CERAMIC', 0xe89aae), 2.0, 10);
    snout.rotation.z = Math.PI / 2;
    snout.position.set(2.7, 2.0, 0);
    g.add(snout);
    for (const [x, z] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) {
      const leg = cylMesh(0.35, 0.8, pink, 0.4, 8);
      leg.position.set(x, 0.4, z);
      g.add(leg);
    }
    const slot = boxMesh(1.6, 0.15, 0.3, mat('CERAMIC', 0x3a2a2a), 3.95);
    g.add(slot);
    for (const z of [-0.7, 0.7]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 6), pink);
      ear.position.set(1.6, 3.7, z);
      ear.rotation.x = z > 0 ? 0.4 : -0.4;
      g.add(ear);
    }
    return { mesh: g, colliders: [] };
  },
});

// ------------------------------------------------------------ bath, hall, closets

reg({
  id: 'pedestal_sink',
  dims: [10, 15, 9],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    const porcelain = mat('CERAMIC', 0xf4f2ee);
    g.add(cylMesh(2.2, 12.5, porcelain, 6.25, 14));
    const basin = boxMesh(10, 2.6, 9, porcelain, 13.7);
    g.add(basin);
    const bowl = boxMesh(7.5, 1.6, 6.5, mat('GLASS_CHEAP', 0x9ec4e6), 13.4);
    bowl.position.z = -0.5;
    g.add(bowl);
    const tap = cylMesh(0.4, 2.2, mat('METAL_KITCHEN', STEEL), 16.1, 8);
    tap.position.z = 3;
    g.add(tap);
    return { mesh: g, colliders: [solid(10, 15, 9, 7.5)] };
  },
});

reg({
  id: 'toilet',
  dims: [7, 15, 12],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    const porcelain = mat('CERAMIC', 0xf4f2ee);
    const bowl = cylMesh(3.4, 7.5, porcelain, 3.75, 16);
    bowl.scale.z = 1.3;
    bowl.position.z = -2;
    g.add(bowl);
    const seat = cylMesh(3.6, 0.5, mat('PLASTIC_TOY', 0xf4f2ee), 7.75, 16);
    seat.scale.z = 1.3;
    seat.position.z = -2;
    g.add(seat);
    g.add(boxMesh(7, 7.5, 3.5, porcelain, 11.25).translateZ(4));
    const lid = boxMesh(7.4, 0.6, 3.9, porcelain, 15.2);
    lid.position.z = 4;
    g.add(lid);
    return { mesh: g, colliders: [solid(7, 7.5, 9, 3.75, 0, -2), solid(7, 15, 3.5, 7.5, 0, 4)] };
  },
});

reg({
  id: 'vacuum',
  // Upright vacuum, 1996 beige; the hose end is the warp (secret 21).
  dims: [6, 20, 8],
  build() {
    const g = new THREE.Group();
    const beige = mat('PLASTIC_TOY', 0xd8c8a8);
    g.add(boxMesh(6, 3, 8, beige, 1.5));
    g.add(boxMesh(4, 14, 3, mat('FABRIC_SOFT', 0x8a3a34), 3 + 7).translateZ(1));
    const handle = boxMesh(1, 6, 1, beige, 20);
    handle.position.z = 1;
    g.add(handle);
    const hose = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, 4, 2), new THREE.Vector3(5, 10, 3), new THREE.Vector3(7, 6, -2), new THREE.Vector3(6, 1, -5),
      ]), 20, 0.5, 8, false),
      mat('RUBBER_MATTE', 0x3a3a3a),
    );
    g.add(hose);
    return { mesh: g, colliders: [solid(6, 20, 8, 10)] };
  },
});

reg({
  id: 'hall_table',
  dims: [20, 14, 7],
  walkableTop: true,
  cover: 'BW',
  build() {
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', WALNUT);
    g.add(boxMesh(20, 1, 7, wood, 13.5));
    g.add(boxMesh(18, 3, 6, wood, 11.5));
    for (const [x, z] of [[-9, -2.8], [9, -2.8], [-9, 2.8], [9, 2.8]]) {
      const leg = boxMesh(1, 10, 1, wood, 5);
      leg.position.set(x, 5, z);
      g.add(leg);
    }
    return { mesh: g, colliders: [solid(20, 14, 7, 7)] };
  },
});

reg({
  id: 'door_closed',
  // A six-panel door standing closed in its opening, knob at 100 cm (18.5 u). Faces −z. Variant 1 carries a label.
  dims: [15, 37, 1],
  build(v, size) {
    const [w, h] = sz(size, [15, 37, 1]);
    const g = new THREE.Group();
    const paint = mat('PAPERBOARD', 0xf6f2ea);
    g.add(boxMesh(w, h, 1, paint));
    for (let r = 0; r < 3; r++) for (const x of [-w / 4, w / 4]) {
      const panel = boxMesh(w / 2 - 2.2, h / 3 - 3, 0.3, mat('PAPERBOARD', 0xe8e2d6), h / 6 + r * h / 3);
      panel.position.set(x, h / 6 + r * h / 3, -0.6);
      g.add(panel);
    }
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), mat('METAL_KITCHEN', 0xd8b04a));
    knob.position.set(w / 2 - 2.2, 18.5, -1.1);
    g.add(knob);
    if (v === 1) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.2), texMat(textTex(['BASEMENT'], '#3a3a3a', '#f2e6c8', 220, 80, 'bold 34px Impact, sans-serif')));
      sign.position.set(0, h * 0.7, -0.61);
      g.add(sign);
    }
    return { mesh: g, colliders: [solid(w, h, 1)] };
  },
});

reg({
  id: 'dog_door_flap',
  // A rubber flap in a plastic frame set in the wall opening. Walk-through (no collider): the link volume does the rest.
  dims: [6, 5, 0.6],
  build() {
    const g = new THREE.Group();
    const frame = mat('PLASTIC_TOY', 0xf2e6c8);
    for (const [x, sw] of [[-3.2, 0.6], [3.2, 0.6]]) {
      const side = boxMesh(sw, 5.6, 0.6, frame, 2.8);
      side.position.x = x;
      g.add(side);
    }
    g.add(boxMesh(7, 0.6, 0.6, frame, 5.3));
    const flap = boxMesh(5.8, 4.9, 0.25, mat('RUBBER_MATTE', 0x2a2a2a), 2.6);
    flap.rotation.x = 0.12;
    g.add(flap);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'dog_bed',
  dims: [15, 3, 12],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    const soft = mat('FABRIC_SOFT', 0x6a5a4a);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6, 1.6, 8, 24), soft);
    ring.rotation.x = Math.PI / 2;
    ring.scale.z = 0.8;
    ring.position.y = 1.6;
    ring.castShadow = true;
    g.add(ring);
    g.add(cylMesh(5.2, 0.8, mat('FABRIC_SOFT', 0x8a7a68), 0.4, 20));
    const bone = boxMesh(3, 0.8, 0.9, mat('PLASTIC_TOY', 0xf4f0e6), 1.2);
    bone.position.set(1, 1.2, 0.5);
    g.add(bone);
    return { mesh: g, colliders: [solid(15, 2.6, 12, 1.3)] };
  },
});

reg({
  id: 'bench_mud',
  dims: [20, 8, 7],
  walkableTop: true,
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    const wood = mat('WOOD_WARM', OAK);
    g.add(boxMesh(20, 1, 7, wood, 7.5));
    for (const x of [-9, 9]) {
      const side = boxMesh(1, 7, 7, wood, 3.5);
      side.position.x = x;
      g.add(side);
    }
    g.add(boxMesh(18, 0.6, 6, wood, 2.5));
    return { mesh: g, colliders: [solid(20, 8, 7)] };
  },
});

reg({
  id: 'coat_hooks',
  // Hooks at coat height with four coats hanging to y 8: soft walls (cover). size = [w, _, _], mounted at y ≈ 30.
  dims: [40, 3, 1],
  cover: 'CC',
  build(v, size) {
    const [w] = sz(size, [40, 3, 1]);
    const g = new THREE.Group();
    const board = boxMesh(w, 3, 1, mat('WOOD_WARM', OAK), 0);
    g.add(board);
    const colliders: LocalBox[] = [];
    const n = Math.max(2, Math.floor(w / 9));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * (w / n);
      const hook = cylMesh(0.3, 1.6, mat('METAL_KITCHEN', 0xd8b04a), -0.8, 6);
      hook.position.set(x, -0.8, -0.8);
      g.add(hook);
      if (i % 2 === 0 || Math.random() < 0.5) {
        const len = 18 + Math.random() * 6;
        const coat = boxMesh(6.5, len, 3, mat('FABRIC_SOFT', pickColor(v + i, [0x3a4a6a, 0x8a3a34, 0x4a6b4a, 0xe0b040])), -len / 2 - 1);
        coat.position.set(x, -len / 2 - 1, -2);
        coat.castShadow = true;
        g.add(coat);
        colliders.push(solid(6.5, len, 3, -len / 2 - 1, x, -2));
      }
    }
    return { mesh: g, colliders };
  },
});

// ------------------------------------------------------------ garage

reg({
  id: 'car_sedan',
  // A 1990s family sedan: 4.5 × 1.8 × 1.45 m → 83 × 33 × 27 u. Long axis along z, nose to −z.
  // 3 u of clearance underneath (the canyon), hood at 17, roof at 27. The windshield and rear glass are
  // raked at 0.77 (rise 10 over 13) with stepped colliders: trunk → rear glass → roof → windshield → hood is a walk.
  // Local z: hood −41.5..−25, windshield −25..−12, roof −12..13, rear glass 13..26, trunk 26..41.5.
  dims: [33, 27, 83],
  walkableTop: true,
  cover: 'BW',
  build(v) {
    const w = 33, len = 83;
    const g = new THREE.Group();
    const paint = mat('METAL_KITCHEN', pickColor(v, [0x7a1f24, 0x2a4a7a, 0x6a6e72, 0x1e5a3a]));
    const glass = mat('GLASS_CHEAP', 0x88aacc);
    const dark = mat('FABRIC_SOFT', 0x2a2622);
    const colliders: LocalBox[] = [];
    g.add(boxMesh(w, 14, len, paint, 3 + 7)); // chassis 3..17
    colliders.push(solid(w, 14, len, 10));
    const cabin = boxMesh(w - 4, 10, 25, paint, 17 + 5);
    cabin.position.z = 0.5;
    g.add(cabin);
    colliders.push(solid(w - 4, 10, 25, 22, 0, 0.5));
    g.add(boxMesh(w - 5, 3, 43, dark, 18.5).translateZ(0.5)); // dash + parcel shelf under the glass
    const rake = Math.atan2(10, 13);
    const glassLen = Math.hypot(10, 13);
    for (const [zc, sign] of [[-18.5, 1], [19.5, -1]]) {
      const wind = boxMesh(w - 6, 0.4, glassLen + 0.4, glass, 0);
      wind.position.set(0, 22, zc);
      wind.rotation.x = sign * rake;
      g.add(wind);
      // Stepped colliders up the rake: 0.3 u risers over 0.39 u — one auto-step each
      const steps = Math.ceil(10 / 0.3);
      for (let i = 0; i < steps; i++) {
        const t = (i + 0.5) / steps;
        const y = 17 + 10 * t;
        const z = sign > 0 ? -25 + 13 * t : 26 - 13 * t;
        colliders.push(solid(w - 6, y - 17, 13 / steps + 0.05, 17 + (y - 17) / 2, 0, z));
      }
    }
    for (const x of [-(w - 4) / 2 - 0.2, (w - 4) / 2 + 0.2]) {
      for (const z of [-6, 7]) {
        const win = boxMesh(0.4, 7, 14, glass, 22.5);
        win.position.set(x, 22.5, z);
        g.add(win);
      }
    }
    for (const [x, z] of [[-w / 2 + 3, -28], [w / 2 - 3, -28], [-w / 2 + 3, 26], [w / 2 - 3, 26]]) {
      const wheel = cylMesh(5.9, 4, mat('RUBBER_MATTE', 0x1a1a1a), 5.9, 18);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 5.9, z);
      g.add(wheel);
      const hub = cylMesh(3.2, 4.2, mat('METAL_KITCHEN', 0xb8bcc0), 5.9, 12);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(x, 5.9, z);
      g.add(hub);
      colliders.push(solid(4, 11.8, 11.8, 5.9, x, z));
    }
    for (const x of [-10, 10]) {
      const light = boxMesh(6, 3, 0.6, mat('PLASTIC_TOY', 0xf4f0d0, { emissive: 0x666655 }), 12);
      light.position.set(x, 12, -len / 2 - 0.2);
      g.add(light);
      const tail = boxMesh(6, 3, 0.6, mat('PLASTIC_TOY', 0xc93a3a), 12);
      tail.position.set(x, 12, len / 2 + 0.2);
      g.add(tail);
    }
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), texMat(textTex(['GRN 62'], '#f4f0e6', '#2a4a7a', 160, 80, 'bold 34px Impact, sans-serif')));
    plate.position.set(0, 8, len / 2 + 0.31);
    plate.rotation.y = Math.PI;
    g.add(plate);
    // A mirror, an antenna
    const antenna = cylMesh(0.12, 12, mat('METAL_KITCHEN', STEEL), 17 + 6, 6);
    antenna.position.set(w / 2 - 2, 23, -30);
    g.add(antenna);
    return { mesh: g, colliders };
  },
});

reg({
  id: 'tool_wall',
  // Pegboard with tools hung on it. Wall-mounted: size = [w, h, d].
  dims: [60, 25, 2],
  build(v, size) {
    const [w, h, d] = sz(size, [60, 25, 2]);
    const g = new THREE.Group();
    g.add(boxMesh(w, h, d, mat('PAPERBOARD', 0xc9a670), h / 2));
    const metal = mat('METAL_KITCHEN', STEEL);
    const handleM = mat('WOOD_WARM', 0x8a5a3a);
    for (let i = 0; i < Math.floor(w / 8); i++) {
      const x = -w / 2 + 4 + i * 8;
      const kind = (i + v) % 4;
      if (kind === 0) { // hammer
        const shaft = boxMesh(1, 10, 1, handleM, h - 8); shaft.position.set(x, h - 8, -d / 2 - 0.6); g.add(shaft);
        const head = boxMesh(4, 1.8, 1.8, metal, h - 3); head.position.set(x, h - 3, -d / 2 - 0.9); g.add(head);
      } else if (kind === 1) { // wrench
        const bar = boxMesh(1.2, 9, 0.6, metal, h - 8); bar.position.set(x, h - 8, -d / 2 - 0.4); g.add(bar);
        const jaw = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.5, 6, 12, Math.PI * 1.4), metal); jaw.position.set(x, h - 3, -d / 2 - 0.4); g.add(jaw);
      } else if (kind === 2) { // saw
        const blade = boxMesh(2.5, 12, 0.2, metal, h - 9); blade.position.set(x, h - 9, -d / 2 - 0.3); g.add(blade);
        const grip = boxMesh(3, 3, 1, handleM, h - 2); grip.position.set(x, h - 2, -d / 2 - 0.6); g.add(grip);
      } else { // tape measure
        const tape = cylMesh(1.6, 1.4, mat('PLASTIC_TOY', 0xe0b040), h - 5, 12); tape.rotation.x = Math.PI / 2; tape.position.set(x, h - 5, -d / 2 - 0.8); g.add(tape);
      }
    }
    // shelf with jars along the bottom
    g.add(boxMesh(w, 0.8, 4, mat('WOOD_WARM', OAK), 6).translateZ(-d / 2 - 2));
    for (let x = -w / 2 + 3; x < w / 2; x += 5) {
      const jar = cylMesh(1.2, 3, mat('GLASS_CHEAP', 0xcfe4f4), 6.4 + 1.5, 10);
      jar.position.set(x, 7.9, -d / 2 - 2);
      g.add(jar);
    }
    return { mesh: g, colliders: [solid(w, h, d, h / 2), solid(w, 4, 4, 6, 0, -d / 2 - 2)] };
  },
});

reg({
  id: 'bike',
  // A kid's bike leaning on a wall. Long axis along x.
  dims: [33, 20, 5],
  cover: 'CC',
  build(v) {
    const g = new THREE.Group();
    const frame = mat('METAL_KITCHEN', pickColor(v, [0xc93a3a, 0x7a4aa0, 0x2f63b8]));
    const tire = mat('RUBBER_MATTE', 0x1a1a1a);
    for (const x of [-11, 11]) {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(6, 0.8, 8, 24), tire);
      wheel.position.set(x, 6.8, 0);
      wheel.castShadow = true;
      g.add(wheel);
      for (let s = 0; s < 8; s++) {
        const spoke = cylMesh(0.08, 11.6, mat('METAL_KITCHEN', STEEL), 6.8, 4);
        spoke.rotation.z = (s / 8) * Math.PI;
        spoke.position.set(x, 6.8, 0);
        g.add(spoke);
      }
    }
    const top = boxMesh(14, 1, 1, frame, 15); top.position.x = 0; top.rotation.z = 0.15; g.add(top);
    const down = boxMesh(15, 1, 1, frame, 10); down.rotation.z = -0.5; down.position.x = -2; g.add(down);
    const seatPost = boxMesh(1, 6, 1, frame, 17); seatPost.position.x = -6; g.add(seatPost);
    const seat = boxMesh(5, 1.5, 2.4, tire, 20); seat.position.x = -6; g.add(seat);
    const bars = boxMesh(1, 1, 9, frame, 19); bars.position.x = 8; g.add(bars);
    const fork = boxMesh(1, 12, 1, frame, 13); fork.position.x = 9.5; fork.rotation.z = -0.15; g.add(fork);
    const pedal = cylMesh(2.6, 0.4, frame, 6.8, 16); pedal.rotation.x = Math.PI / 2; pedal.position.set(-2, 6.8, 0.6); g.add(pedal);
    g.rotation.z = 0;
    return { mesh: g, colliders: [solid(33, 20, 5, 10)] };
  },
});

// ------------------------------------------------------------ life props (Decoration With Heart, docs/10 §8)

reg({
  id: 'note_paper',
  // A note on a wall or surface. Variant selects the text. Faces −z; lies flat with yaw + a parent rotation from the def (flat: variant + 100).
  dims: [3.2, 4, 0.05],
  build(v) {
    const notes = [
      ['BACK BY 5', '— MOM'], ['FEED', 'BISCUIT', 'TWICE'], ['JONAH:', 'BOX GOES', 'SATURDAY'], ['PIP —', 'NO GLUE', 'ON THE CAT'],
      ['DENTIST', 'TUES 3PM'], ['BUY:', 'BATTERIES', 'MILK', 'TAPE'], ['DO NOT', 'TOUCH', 'THE VCR'], ['IOU', '$2', '— J'],
    ];
    const lines = notes[Math.abs(v) % notes.length];
    const g = new THREE.Group();
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4), texMat(textTex(lines, v % 2 ? '#fff8c8' : '#f4f0e6', '#2a2a3a', 160, 200, 'bold 26px "Courier New", monospace', (Math.random() - 0.5) * 0.08)));
    paper.position.z = -0.03;
    g.add(paper);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'drawing_taped',
  // A kid's crayon drawing taped up crooked. Faces −z.
  dims: [6, 4.5, 0.05],
  build(v) {
    const g = new THREE.Group();
    const c = document.createElement('canvas');
    c.width = 240; c.height = 180;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff9dc'; ctx.fillRect(0, 0, 240, 180);
    const cols = ['#c93a3a', '#2f63b8', '#3c9a4a', '#e0b040', '#7a4aa0', '#e08a22'];
    ctx.lineWidth = 6; ctx.lineCap = 'round';
    if (v % 3 === 0) { // the family + dog
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = cols[i]; ctx.beginPath(); ctx.arc(40 + i * 50, 60, 16, 0, 6.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(40 + i * 50, 76); ctx.lineTo(40 + i * 50, 130); ctx.stroke(); }
      ctx.strokeStyle = '#8a5a3a'; ctx.beginPath(); ctx.ellipse(200, 130, 22, 12, 0, 0, 6.3); ctx.stroke();
      ctx.fillStyle = '#3a3a3a'; ctx.font = '18px sans-serif'; ctx.fillText('MY FAMLY', 20, 165);
    } else if (v % 3 === 1) { // a green soldier, huge, with a flamethrower
      ctx.strokeStyle = '#3e7a34'; ctx.beginPath(); ctx.arc(120, 50, 20, 0, 6.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(120, 70); ctx.lineTo(120, 140); ctx.moveTo(90, 100); ctx.lineTo(150, 100); ctx.stroke();
      ctx.strokeStyle = '#e08a22'; ctx.beginPath(); ctx.moveTo(150, 100); ctx.lineTo(220, 80); ctx.stroke();
      ctx.fillStyle = '#3a3a3a'; ctx.font = '18px sans-serif'; ctx.fillText('SARGE WINS', 20, 165);
    } else { // the house with a sun
      ctx.strokeStyle = '#8a5a3a'; ctx.strokeRect(70, 70, 100, 70); ctx.beginPath(); ctx.moveTo(60, 70); ctx.lineTo(120, 30); ctx.lineTo(180, 70); ctx.stroke();
      ctx.strokeStyle = '#e0b040'; ctx.beginPath(); ctx.arc(200, 35, 18, 0, 6.3); ctx.stroke();
      ctx.fillStyle = '#3a3a3a'; ctx.font = '18px sans-serif'; ctx.fillText('OUR HOUSE - PIP', 20, 165);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.5), texMat(t));
    paper.rotation.z = (v % 2 ? 1 : -1) * 0.12;
    g.add(paper);
    const tape = boxMesh(1.4, 0.5, 0.05, mat('GLASS_CHEAP', 0xfff8e0), 2.3);
    tape.position.set(-2.4, 2.3, -0.05); tape.rotation.z = 0.5; g.add(tape);
    const tape2 = tape.clone(); tape2.position.set(2.4, 2.3, -0.05); tape2.rotation.z = -0.5; g.add(tape2);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'clock_wall',
  dims: [6, 6, 1],
  build() {
    const g = new THREE.Group();
    const face = cylMesh(3, 0.8, mat('PLASTIC_TOY', 0xf4f0e6), 0, 24);
    face.rotation.x = Math.PI / 2;
    g.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3, 0.3, 8, 24), mat('PLASTIC_TOY', 0x2a2a2e));
    g.add(rim);
    const hour = boxMesh(0.35, 1.8, 0.1, mat('PLASTIC_TOY', 0x1a1a1a), 0.9); hour.rotation.z = -0.9; hour.position.set(0.7, 0.6, -0.45); g.add(hour);
    const minute = boxMesh(0.25, 2.6, 0.1, mat('PLASTIC_TOY', 0x1a1a1a), 1.3); minute.rotation.z = 2.4; minute.position.set(0.9, -0.9, -0.45); g.add(minute);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'calendar',
  dims: [4, 6, 0.1],
  build() {
    const g = new THREE.Group();
    const c = document.createElement('canvas'); c.width = 160; c.height = 240;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#f4f0e6'; ctx.fillRect(0, 0, 160, 240);
    ctx.fillStyle = '#5c8a3c'; ctx.fillRect(0, 0, 160, 90);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('SEPTEMBER', 22, 55);
    ctx.fillStyle = '#2a2a2a'; ctx.font = '13px sans-serif';
    for (let i = 0; i < 30; i++) ctx.fillText(String(i + 1), 12 + (i % 7) * 21, 118 + Math.floor(i / 7) * 26);
    ctx.strokeStyle = '#c93a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(12 + 6 * 21 + 5, 118 + 26 - 5, 11, 0, 6.3); ctx.stroke();
    ctx.fillStyle = '#c93a3a'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('RUMMAGE!', 95, 105);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), texMat(t));
    g.add(sheet);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'phone_corded',
  dims: [4, 2.2, 3],
  build() {
    const g = new THREE.Group();
    const beige = mat('PLASTIC_TOY', 0xe8dcc0);
    g.add(boxMesh(4, 1.4, 3, beige, 0.7));
    const handset = boxMesh(4.4, 0.8, 1, beige, 1.9);
    handset.position.z = 0.6;
    g.add(handset);
    for (let i = 0; i < 12; i++) {
      const key = boxMesh(0.45, 0.25, 0.45, mat('PLASTIC_TOY', 0xfaf6ee), 1.5);
      key.position.set(-0.8 + (i % 3) * 0.8, 1.5, -0.9 + Math.floor(i / 3) * 0.5 - 0.3);
      g.add(key);
    }
    const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.2, 1.6, 0.6), new THREE.Vector3(3.2, 0.6, 1.4), new THREE.Vector3(3.6, 0.2, 2.6), new THREE.Vector3(4.5, 0.1, 3.6),
    ]), 12, 0.12, 5, false), mat('RUBBER_MATTE', 0x3a3a3a));
    g.add(cord);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'key_hook',
  dims: [4, 1.2, 0.6],
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(4, 1.2, 0.4, mat('WOOD_WARM', OAK), 0));
    for (let i = 0; i < 3; i++) {
      const hook = cylMesh(0.12, 0.8, mat('METAL_KITCHEN', 0xd8b04a), -0.6, 6);
      hook.position.set(-1.2 + i * 1.2, -0.6, -0.4);
      g.add(hook);
      if (i !== 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 5, 10), mat('METAL_KITCHEN', STEEL));
        ring.position.set(-1.2 + i * 1.2, -1.2, -0.5);
        g.add(ring);
        const key = boxMesh(0.25, 1.1, 0.08, mat('METAL_KITCHEN', 0xd8b04a), -2.1);
        key.position.set(-1.2 + i * 1.2 + 0.1, -2.1, -0.5);
        g.add(key);
      }
    }
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'mail_pile',
  dims: [4.5, 0.8, 3.2],
  build() {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const letter = boxMesh(4.2, 0.15, 3, mat('PAPERBOARD', pickColor(i, [0xf4f0e6, 0xfff8c8, 0xe8e0cc, 0xd8e8f4])), 0.08 + i * 0.16);
      letter.rotation.y = (Math.random() - 0.5) * 0.5;
      g.add(letter);
    }
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'boombox',
  dims: [8, 4, 3],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(8, 4, 3, mat('PLASTIC_TOY', 0x2a2a2e)));
    for (const x of [-2.6, 2.6]) {
      const sp = cylMesh(1.3, 0.3, mat('FABRIC_SOFT', 0x1a1a1a), 2, 16);
      sp.rotation.x = Math.PI / 2;
      sp.position.set(x, 2, -1.55);
      g.add(sp);
    }
    const deck = boxMesh(2.4, 1.4, 0.2, mat('GLASS_CHEAP', 0x334455), 2.2); deck.position.z = -1.55; g.add(deck);
    const handle = boxMesh(5, 0.5, 0.5, mat('PLASTIC_TOY', 0x2a2a2e), 5); g.add(handle);
    return { mesh: g, colliders: [solid(8, 4, 3)] };
  },
});

reg({
  id: 'dog_bowl',
  dims: [5, 1.4, 5],
  build(v) {
    const g = new THREE.Group();
    const bowl = cylMesh(2.5, 1.4, mat('METAL_KITCHEN', STEEL), 0.7, 18);
    g.add(bowl);
    const contents = cylMesh(2, 0.4, v === 1 ? mat('GLASS_CHEAP', 0x9ec4e6) : mat('PAPERBOARD', 0x8a5a3a), 1.2, 16);
    g.add(contents);
    const name = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), texMat(textTex(['BISCUIT'], '#c93a3a', '#fff', 130, 36, 'bold 22px Impact, sans-serif')));
    name.position.set(0, 0.7, -2.52);
    g.add(name);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'shoe_pair',
  dims: [5, 2, 5],
  cover: 'CC',
  build(v) {
    const g = new THREE.Group();
    const col = pickColor(v, [0xf4f0e6, 0x2a2a2e, 0xc93a3a, 0x7a4aa0]);
    for (const x of [-1.3, 1.3]) {
      const shoe = boxMesh(2.2, 1.8, 5, mat('FABRIC_SOFT', col), 0.9);
      shoe.position.set(x, 0.9, 0);
      shoe.rotation.y = (Math.random() - 0.5) * 0.4;
      shoe.castShadow = true;
      g.add(shoe);
      const sole = boxMesh(2.3, 0.4, 5.1, mat('RUBBER_MATTE', 0xf4f4f4), 0.2);
      sole.position.copy(shoe.position).setY(0.2);
      sole.rotation.copy(shoe.rotation);
      g.add(sole);
    }
    return { mesh: g, colliders: [solid(5, 2, 5)] };
  },
});

reg({
  id: 'umbrella_stand',
  dims: [5, 9, 5],
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    g.add(cylMesh(2.5, 9, mat('METAL_KITCHEN', 0x3a3a3a), 4.5, 14));
    for (let i = 0; i < 3; i++) {
      const umb = cylMesh(0.3, 16, mat('PLASTIC_TOY', pickColor(i, [0x2a2a2e, 0xc93a3a, 0x2f63b8])), 8, 8);
      umb.rotation.z = (i - 1) * 0.12;
      umb.position.set((i - 1) * 0.9, 8, 0);
      g.add(umb);
    }
    return { mesh: g, colliders: [solid(5, 9, 5)] };
  },
});

reg({
  id: 'plant_floor',
  // A big potted plant: cover, and the leaves are a concealment volume when the def says so.
  dims: [14, 26, 14],
  cover: 'CC',
  build(v) {
    const g = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.6, 6, 16), mat('CERAMIC', pickColor(v, [0xb86a4a, 0xf4f0e6, 0x2a4a7a])));
    pot.position.y = 3;
    pot.castShadow = true;
    g.add(pot);
    g.add(cylMesh(3, 0.5, mat('STONE', 0x4a3a2a), 5.8, 16));
    const leaf = mat('FABRIC_SOFT', 0x3e7a34);
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7;
      const l = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 6), leaf);
      l.scale.set(0.5, 1.6, 0.5);
      l.position.set(Math.cos(a) * 2.5, 12 + (i % 3) * 4, Math.sin(a) * 2.5);
      l.rotation.z = Math.cos(a) * 0.6;
      l.rotation.x = -Math.sin(a) * 0.6;
      l.castShadow = true;
      g.add(l);
    }
    return { mesh: g, colliders: [solid(6.4, 6, 6.4, 3)] };
  },
});

reg({
  id: 'magazine_stack',
  dims: [5, 3, 6.5],
  walkableTop: true,
  build() {
    const g = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const m = boxMesh(4.8, 0.4, 6.3, mat('PAPERBOARD', pickColor(i, [0xe0b040, 0x2f63b8, 0xc93a3a, 0xf4f0e6, 0x3c9a4a])), 0.2 + i * 0.42);
      m.rotation.y = (Math.random() - 0.5) * 0.3;
      g.add(m);
    }
    return { mesh: g, colliders: [solid(5, 3, 6.5)] };
  },
});

reg({
  id: 'duck_rubber',
  dims: [2.4, 2.2, 2.4],
  build() {
    const g = new THREE.Group();
    const yellow = mat('PLASTIC_TOY', 0xf4d43a);
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), yellow);
    body.scale.set(1.2, 0.8, 1);
    body.position.y = 0.9;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), yellow);
    head.position.set(0.7, 1.9, 0);
    g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 8), mat('PLASTIC_TOY', 0xe08a22));
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(1.5, 1.8, 0);
    g.add(beak);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'laundry_basket',
  dims: [9, 8, 7],
  walkableTop: true,
  cover: 'CC',
  build() {
    const g = new THREE.Group();
    g.add(boxMesh(9, 8, 7, mat('PLASTIC_TOY', 0xf4f0e6)));
    for (let i = 0; i < 5; i++) {
      const cloth = boxMesh(3 + Math.random() * 3, 1.2, 3 + Math.random() * 2, mat('FABRIC_SOFT', pickColor(i, [0x3a4a6a, 0xc93a3a, 0xf4f0e6, 0xe0b040, 0x4a6b4a])), 8.3 + i * 0.3);
      cloth.position.set((Math.random() - 0.5) * 4, 8.3 + i * 0.3, (Math.random() - 0.5) * 3);
      cloth.rotation.y = Math.random() * 3;
      g.add(cloth);
    }
    return { mesh: g, colliders: [solid(9, 8, 7)] };
  },
});

reg({
  id: 'keychain_pet',
  // A keychain virtual pet, beeping on the hook (secret 49; a wink at the studio's own LULLABYTE).
  dims: [1.5, 2, 0.5],
  build() {
    const g = new THREE.Group();
    const egg = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), mat('PLASTIC_TOY', 0xf4b8c8));
    egg.scale.set(0.85, 1.1, 0.5);
    g.add(egg);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), new THREE.MeshStandardMaterial({ map: textTex(['^_^'], '#9ab08a', '#1a1a1a', 60, 50, 'bold 26px monospace'), emissive: 0x334422 }));
    screen.position.set(0, 0.1, -0.44);
    g.add(screen);
    const chain = cylMesh(0.05, 1.5, mat('METAL_KITCHEN', STEEL), 1.6, 5);
    g.add(chain);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'height_chart',
  // Pencil marks on a door frame: Jonah every birthday, Pip every month, one for Biscuit (secret 22). Tall thin plane.
  dims: [2.2, 30, 0.1],
  build() {
    const g = new THREE.Group();
    const c = document.createElement('canvas'); c.width = 64; c.height = 900;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#f6f2ea'; ctx.fillRect(0, 0, 64, 900);
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 2; ctx.fillStyle = '#4a4a4a'; ctx.font = '11px sans-serif';
    const marks: [number, string][] = [[860, 'B 96'], [700, 'P 3'], [650, 'P 4'], [600, 'P 5'], [560, 'P 6'], [430, 'J 6'], [380, 'J 7'], [330, 'J 8'], [290, 'J 9'], [250, 'J 10']];
    for (const [y, l] of marks) { ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(40, y); ctx.stroke(); ctx.fillText(l, 6, y - 4); }
    ctx.fillStyle = '#c93a3a'; ctx.fillText('PIP 6!', 6, 545);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 30), texMat(t));
    strip.position.y = 15;
    g.add(strip);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'leash',
  dims: [6, 0.6, 6],
  build() {
    const g = new THREE.Group();
    const coil = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.25, 6, 24), mat('FABRIC_SOFT', 0xc93a3a));
    coil.rotation.x = Math.PI / 2;
    coil.position.y = 0.25;
    g.add(coil);
    const coil2 = coil.clone(); coil2.position.set(0.6, 0.55, 0.4); coil2.scale.setScalar(0.85); g.add(coil2);
    const clip = boxMesh(1, 0.4, 0.5, mat('METAL_KITCHEN', STEEL), 0.3); clip.position.set(2.6, 0.3, 0.8); g.add(clip);
    return { mesh: g, colliders: [] };
  },
});

reg({
  id: 'sock',
  dims: [3.2, 1, 1.6],
  build(v) {
    const g = new THREE.Group();
    const s = boxMesh(3.2, 1, 1.6, mat('FABRIC_SOFT', pickColor(v, [0xf4f0e6, 0x3a4a6a, 0xc93a3a, 0xe0b040, 0x3c9a4a])), 0.5);
    s.rotation.y = v * 0.7;
    g.add(s);
    const toe = boxMesh(1.4, 1.1, 1.7, mat('FABRIC_SOFT', 0xd8d0c0), 0.55);
    toe.position.set(1.2, 0.55, 0); toe.rotation.y = v * 0.7;
    g.add(toe);
    return { mesh: g, colliders: [] };
  },
});

export const HOUSE_KIT_LOADED = true;
