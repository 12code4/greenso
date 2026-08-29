// M0 greybox arena: a bedroom-floor corner at honest 1:32 scale, built
// from Household Kit placeholder primitives. 1 unit = 1 soldier height
// (54mm). The scale table from docs/03-map-bible.md, made walkable.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { LaneSpec } from '../game/targets';

export interface ArenaData {
  spawn: THREE.Vector3;
  lanes: LaneSpec[];
}

export function buildGreybox(scene: THREE.Scene, world: CollisionWorld): ArenaData {
  // ----- Atmosphere: warm afternoon sun through a window -----
  scene.background = new THREE.Color(0xd9c6a2);
  scene.fog = new THREE.Fog(0xd9c6a2, 90, 260);

  const sun = new THREE.DirectionalLight(0xffe8c4, 2.6);
  sun.position.set(45, 70, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.far = 220;
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  const hemi = new THREE.HemisphereLight(0xfff2dd, 0x6b543a, 0.55);
  scene.add(hemi);

  // ----- Floor: giant wood planks (12cm plank = 3.8u — scale seller #1) -----
  const floorTex = makePlankTexture();
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(16, 16);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.75 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const add = (
    cx: number, cy: number, cz: number,
    w: number, h: number, d: number,
    color: number, roughness = 0.8,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness }),
    );
    m.position.set(cx, cy + h / 2, cz);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    world.addBox(new THREE.Vector3(cx, cy + h / 2, cz), new THREE.Vector3(w, h, d));
    return m;
  };
  const visualOnly = (
    cx: number, cy: number, cz: number,
    w: number, h: number, d: number,
    color: number,
  ): THREE.Mesh => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
    );
    m.position.set(cx, cy + h / 2, cz);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };

  // ----- Room walls (two sides of the corner; skirting board 4.5u tall) -----
  const WALL = 0xcdbfa8;
  const SKIRT = 0xe8dcc8;
  add(0, 0, -28, 200, 60, 2, WALL); // back wall (bullet backstop)
  add(-34, 0, 20, 2, 60, 160, WALL); // left wall
  visualOnly(0.2, 0, -26.9, 200, 4.5, 0.4, SKIRT); // skirting boards
  visualOnly(-32.9, 0, 20, 0.4, 4.5, 160, SKIRT);
  // Wall outlet high on the back wall — scale seller #2
  visualOnly(18, 8.5, -26.8, 2.6, 3.7, 0.3, 0xf2ead6);

  // Invisible boundaries on the open sides
  world.addBox(new THREE.Vector3(70, 30, 20), new THREE.Vector3(2, 60, 200));
  world.addBox(new THREE.Vector3(10, 30, 52), new THREE.Vector3(220, 60, 2));

  // Far furniture masses close the horizon (dresser + couch shadows)
  add(85, 0, 0, 30, 42, 70, 0x5c4a38);
  add(10, 0, 68, 120, 26, 30, 0x6b5844);

  // ----- The firing range (targets against the back wall) -----
  const lanes: LaneSpec[] = [];
  const laneZ = [-10, -13.5, -17, -13.5, -10];
  for (let i = 0; i < 5; i++) {
    const x = -18 + i * 9;
    lanes.push({
      pos: new THREE.Vector3(x, 0, laneZ[i]),
      faceYaw: 0,
      slide:
        i === 1 || i === 3
          ? { axis: new THREE.Vector3(1, 0, 0), amp: 3, speed: 0.7 + i * 0.13 }
          : undefined,
    });
  }
  // Domino "sandbag" line — player cover at mid-range (dominoes: 1.5×0.75×0.25u)
  for (let i = 0; i < 6; i++) {
    if (i === 2) continue; // a gap to move through
    add(-16 + i * 6.5, 0, -6, 1.7, 1.05, 0.4, 0xf5efe0, 0.5);
  }

  // ----- Left flank: shoebox sniper perch + alphabet-block stair -----
  // Shoebox: 35×20×20cm → 11.2×6.4×6.4u, roof walkable
  add(-24, 0, 4, 11.2, 6.4, 6.4, 0x9c8468);
  visualOnly(-24, 6.4, 4, 11.6, 0.3, 6.8, 0x8a7458); // lid lip
  // Alphabet blocks (4cm → 1.28u cubes), each step jumpable (apex 1.35)
  const blockColors = [0xc96f5e, 0x6e8fc9, 0xd9b358, 0x7aa86a];
  add(-14.5, 0, 8.5, 1.28, 1.28, 1.28, blockColors[0], 0.55);
  add(-16.6, 0, 7.4, 1.28, 2.56, 1.28, blockColors[1], 0.55);
  add(-18.7, 0, 8.6, 1.28, 3.84, 1.28, blockColors[2], 0.55);
  add(-20.8, 0, 7.2, 1.28, 5.12, 1.28, blockColors[3], 0.55);
  // ...then hop from the top block (5.12) onto the shoebox roof (6.4)

  // Second perch: hardcover book pile (books 4cm thick → 1.3u each)
  add(-21, 0, -13, 9.5, 1.3, 6.5, 0x8a4a3c, 0.6); // big red hardcover
  add(-21.8, 1.3, -12.4, 8.5, 1.3, 5.8, 0x3c5a7a, 0.6);
  add(-20.9, 2.6, -13.2, 7.8, 1.3, 5.2, 0x4a6b4a, 0.6);
  add(-21.4, 3.9, -12.6, 7.0, 1.3, 4.6, 0xc9a04e, 0.6);
  add(-21.0, 5.2, -13.0, 6.2, 1.2, 4.0, 0x704a68, 0.6); // pile top: 6.4u

  // Pencil bridge between shoebox roof and book pile (19cm pencil → 6u+)
  // Runs along Z from the shoebox front edge to the book pile.
  const pencil = add(-22.5, 6.4, -4.5, 0.55, 0.5, 11, 0xdca63c, 0.5);
  pencil.castShadow = true;
  visualOnly(-22.5, 6.35, 1.4, 0.62, 0.55, 1.4, 0xe8b8a8); // eraser end
  visualOnly(-22.5, 6.42, -10.4, 0.5, 0.42, 1.1, 0x3a3128); // sharpened end

  // ----- Right flank: soda cans + the mug -----
  // Cans: 12cm tall, 6.6cm dia → 3.8u × 2.1u
  addCylinder(scene, world, 24, 0, -2, 1.05, 3.8, 0xc94040);
  addCylinder(scene, world, 27.2, 0, 0.4, 1.05, 3.8, 0x4076c9);
  // One lying on its side (hop-up cover)
  const lying = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 3.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x59a054, roughness: 0.35, metalness: 0.5 }),
  );
  lying.rotation.z = Math.PI / 2;
  lying.position.set(20, 1.05, 3.5);
  lying.castShadow = true;
  lying.receiveShadow = true;
  scene.add(lying);
  world.addBox(new THREE.Vector3(20, 1.05, 3.5), new THREE.Vector3(3.8, 2.1, 2.1));

  // The mug: 9.5cm tall → huge tower, right rear
  addCylinder(scene, world, 42, 0, 26, 4.2, 9.8, 0xe8e2d4, 0.3);

  // ----- Center: cereal box monolith against the back-left -----
  // 30×20×7cm → 10.7×7×2.5u, leaning slightly is for M1; upright for now
  add(-8, 0, -21.5, 7, 10.7, 2.5, 0xd97b28, 0.7);

  // ----- Scale seller #3: a house key by the spawn (6cm → ~2u, flat) -----
  visualOnly(4, 0, 24, 3.4, 0.28, 1.2, 0xb8a44a);
  const keyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.22, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0xb8a44a, roughness: 0.4, metalness: 0.6 }),
  );
  keyRing.rotation.x = Math.PI / 2;
  keyRing.position.set(6.4, 0.28, 24);
  keyRing.castShadow = true;
  scene.add(keyRing);

  // The rug: a color zone near spawn, 0.15u pile = auto-step
  add(8, 0, 28, 26, 0.15, 18, 0x9c4a44, 0.95);

  // A few scattered ammo-crate matchboxes (5×3.5×1.5cm → 1.6×1.1×0.5u)
  add(-3, 0, 6, 1.6, 0.5, 1.1, 0xd9c98c, 0.7);
  add(11, 0, -1, 1.6, 0.5, 1.1, 0xd9c98c, 0.7);
  add(15, 0.15, 30, 1.6, 0.5, 1.1, 0xd9c98c, 0.7);

  return { spawn: new THREE.Vector3(6, 0, 30), lanes };
}

function addCylinder(
  scene: THREE.Scene,
  world: CollisionWorld,
  x: number, y: number, z: number,
  r: number, h: number, color: number,
  roughness = 0.35,
): void {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, h, 20),
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.4 }),
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  // AABB approximation is fine for greybox
  world.addBox(new THREE.Vector3(x, y + h / 2, z), new THREE.Vector3(r * 2, h, r * 2));
}

/** Procedural wide-plank wood texture — giant planks sell the scale. */
function makePlankTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const plankW = 512 / 4; // 4 planks per tile; tile = ~15u → plank ≈ 3.8u
  for (let p = 0; p < 4; p++) {
    const hue = 32 + Math.random() * 6;
    const light = 52 + Math.random() * 8;
    g.fillStyle = `hsl(${hue}, 38%, ${light}%)`;
    g.fillRect(p * plankW, 0, plankW, 512);
    // grain
    g.strokeStyle = `hsla(${hue - 6}, 40%, ${light - 14}%, 0.35)`;
    for (let i = 0; i < 18; i++) {
      g.beginPath();
      const x = p * plankW + Math.random() * plankW;
      g.moveTo(x, 0);
      g.bezierCurveTo(
        x + (Math.random() - 0.5) * 14, 170,
        x + (Math.random() - 0.5) * 14, 340,
        x + (Math.random() - 0.5) * 10, 512,
      );
      g.lineWidth = 0.8 + Math.random() * 1.6;
      g.stroke();
    }
    // plank seam
    g.fillStyle = 'rgba(40, 26, 12, 0.55)';
    g.fillRect(p * plankW, 0, 3, 512);
  }
  // random board joints
  g.fillStyle = 'rgba(40, 26, 12, 0.45)';
  for (let p = 0; p < 4; p++) {
    g.fillRect(p * plankW, Math.random() * 512, plankW, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
