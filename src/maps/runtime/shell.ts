// Shell builder: sky, fog, lights, ground zones, horizon masses, bounds.
// Shell fixtures follow the same honest-cm rule as the kit but are too
// map-specific to registry (docs/07 §F).

import * as THREE from 'three';
import { CollisionWorld } from '../../sim/collision';
import { ShellDef } from './types';
import { v3 } from '../../core/math';
import { mat } from '../kit/materials';

const texCache = new Map<string, THREE.CanvasTexture>();

function noiseTexture(kind: string, base: [number, number, number], jitter: number, extra?: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const cached = texCache.get(kind);
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * jitter;
    img.data[i] = base[0] + n;
    img.data[i + 1] = base[1] + n;
    img.data[i + 2] = base[2] + n * 0.6;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  if (extra) extra(g);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(kind, t);
  return t;
}

export function groundTexture(kind: string): THREE.CanvasTexture {
  switch (kind) {
    case 'lawn':
      return noiseTexture('lawn', [92, 128, 52], 46, (g) => {
        // darker tufts
        g.fillStyle = 'rgba(40, 70, 25, 0.35)';
        for (let i = 0; i < 260; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 2, 5);
      });
    case 'soil':
      return noiseTexture('soil', [78, 54, 34], 40, (g) => {
        g.fillStyle = 'rgba(30, 20, 10, 0.4)';
        for (let i = 0; i < 120; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
      });
    case 'stone':
      return noiseTexture('stone', [150, 146, 136], 30);
    case 'planks':
      return plankTexture();
    case 'hardwood':
      return plankTexture();
    case 'tile':
      return noiseTexture('tile', [232, 226, 210], 10, (g) => {
        g.strokeStyle = 'rgba(120, 110, 95, 0.55)';
        g.lineWidth = 3;
        for (let i = 0; i <= 256; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
      });
    case 'carpet':
      return noiseTexture('carpet', [150, 70, 62], 34, (g) => {
        g.fillStyle = 'rgba(60, 20, 18, 0.25)';
        for (let i = 0; i < 400; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      });
    case 'concrete':
      return noiseTexture('concrete', [154, 150, 144], 26, (g) => {
        g.strokeStyle = 'rgba(70, 66, 60, 0.4)';
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
      });
    default:
      return noiseTexture('flat', [160, 150, 130], 20);
  }
}

/** Procedural wide-plank wood — giant planks sell the scale. */
function plankTexture(): THREE.CanvasTexture {
  const cached = texCache.get('planks');
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const plankW = 512 / 4;
  for (let p = 0; p < 4; p++) {
    const hue = 32 + Math.random() * 6;
    const light = 52 + Math.random() * 8;
    g.fillStyle = `hsl(${hue}, 38%, ${light}%)`;
    g.fillRect(p * plankW, 0, plankW, 512);
    g.strokeStyle = `hsla(${hue - 6}, 40%, ${light - 14}%, 0.35)`;
    for (let i = 0; i < 18; i++) {
      g.beginPath();
      const x = p * plankW + Math.random() * plankW;
      g.moveTo(x, 0);
      g.bezierCurveTo(x + (Math.random() - 0.5) * 14, 170, x + (Math.random() - 0.5) * 14, 340, x + (Math.random() - 0.5) * 10, 512);
      g.lineWidth = 0.8 + Math.random() * 1.6;
      g.stroke();
    }
    g.fillStyle = 'rgba(40, 26, 12, 0.55)';
    g.fillRect(p * plankW, 0, 3, 512);
  }
  g.fillStyle = 'rgba(40, 26, 12, 0.45)';
  for (let p = 0; p < 4; p++) g.fillRect(p * plankW, Math.random() * 512, plankW, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set('planks', t);
  return t;
}

const SKY_VERT = `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const SKY_FRAG = `
uniform vec3 horizon; uniform vec3 zenith;
varying vec3 vWorld;
void main() {
  float h = clamp(normalize(vWorld - cameraPosition).y, 0.0, 1.0);
  gl_FragColor = vec4(mix(horizon, zenith, pow(h, 0.55)), 1.0);
}`;

export interface ShellRuntime {
  sun: THREE.DirectionalLight;
  baseGroundKind: string;
}

export function buildShell(def: ShellDef, scene: THREE.Scene, world: CollisionWorld, baseGround: string, indoor = false): ShellRuntime {
  if (indoor) scene.background = new THREE.Color(def.fog.color);
  // Sky dome
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(380, 24, 12), // inside the camera's 400 far plane
    new THREE.ShaderMaterial({
      uniforms: { horizon: { value: new THREE.Color(def.sky.horizon) }, zenith: { value: new THREE.Color(def.sky.zenith) } },
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  sky.frustumCulled = false;
  if (!indoor) scene.add(sky);
  scene.fog = new THREE.Fog(def.fog.color, def.fog.near, def.fog.far);

  const sun = new THREE.DirectionalLight(def.sun.color, def.sun.intensity);
  sun.position.copy(v3(def.sun.dir)).multiplyScalar(60);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const ext = 70;
  sun.shadow.camera.left = -ext;
  sun.shadow.camera.right = ext;
  sun.shadow.camera.top = ext;
  sun.shadow.camera.bottom = -ext;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 260;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);
  scene.add(new THREE.HemisphereLight(def.hemi.sky, def.hemi.ground, def.hemi.intensity));

  // Base ground plane
  const gtex = groundTexture(baseGround);
  gtex.repeat.set(baseGround === 'planks' || baseGround === 'hardwood' ? 16 : 40, baseGround === 'planks' || baseGround === 'hardwood' ? 16 : 40);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ map: gtex, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ground zones (slabs)
  for (const z of def.ground) {
    const min = v3(z.min), max = v3(z.max);
    const h = z.height ?? 0.04;
    const size = new THREE.Vector3(max.x - min.x, h, max.z - min.z);
    const center = new THREE.Vector3((min.x + max.x) / 2, h / 2, (min.z + max.z) / 2);
    let material: THREE.Material;
    if (z.kind === 'water') {
      material = mat('GLASS_CHEAP', z.color ?? 0x5c96c8);
    } else {
      const t = groundTexture(z.kind).clone();
      t.needsUpdate = true;
      const cell = z.kind === 'tile' ? 12 : z.kind === 'carpet' ? 20 : 6;
      t.repeat.set(size.x / cell, size.z / cell);
      material = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, color: z.color ?? 0xffffff });
    }
    const slab = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
    slab.position.copy(center);
    slab.receiveShadow = true;
    slab.castShadow = h > 0.3;
    scene.add(slab);
    if (h > 0.1) world.addBox(center, size);
  }

  // Masses
  for (const m of def.masses) {
    const min = v3(m.min), max = v3(m.max);
    const size = new THREE.Vector3().subVectors(max, min);
    const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
    world.addBox(center, size);
    if (m.kind === 'fence') buildFence(scene, min, max, m.color ?? 0xd8cfb8);
    else if (m.kind === 'siding') buildSiding(scene, min, max, m.color ?? 0xe8e0cc);
    else if (m.kind === 'wall') buildWall(scene, min, max, m.color ?? 0xf0e8d6);
    else if (m.kind === 'ceiling') {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), new THREE.MeshStandardMaterial({ color: m.color ?? 0xf6f2ea, roughness: 0.95 }));
      mesh.position.copy(center);
      mesh.receiveShadow = true;
      scene.add(mesh);
    } else if (m.kind === 'slab') {
      const t = groundTexture('hardwood').clone();
      t.needsUpdate = true;
      t.repeat.set(size.x / 6, size.z / 6);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85, color: m.color ?? 0xffffff }));
      mesh.position.copy(center);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    } else if (m.kind === 'glass') {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat('GLASS_CHEAP', m.color ?? 0xcfe4f4));
      mesh.position.copy(center);
      scene.add(mesh);
    } else {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat('FABRIC_SOFT', m.color ?? 0x5c4a38));
      mesh.position.copy(center);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }

  // Invisible bounds: four walls
  const b = def.bounds;
  const bmin = v3(b.min), bmax = v3(b.max);
  const H = 80;
  world.addBox(new THREE.Vector3(bmin.x - 1, H / 2, (bmin.z + bmax.z) / 2), new THREE.Vector3(2, H, bmax.z - bmin.z + 4));
  world.addBox(new THREE.Vector3(bmax.x + 1, H / 2, (bmin.z + bmax.z) / 2), new THREE.Vector3(2, H, bmax.z - bmin.z + 4));
  world.addBox(new THREE.Vector3((bmin.x + bmax.x) / 2, H / 2, bmin.z - 1), new THREE.Vector3(bmax.x - bmin.x + 4, H, 2));
  world.addBox(new THREE.Vector3((bmin.x + bmax.x) / 2, H / 2, bmax.z + 1), new THREE.Vector3(bmax.x - bmin.x + 4, H, 2));

  return { sun, baseGroundKind: baseGround };
}

/** Painted drywall with a baseboard and a crown band; the classic 90s cream. */
function buildWall(scene: THREE.Scene, min: THREE.Vector3, max: THREE.Vector3, color: number): void {
  const size = new THREE.Vector3().subVectors(max, min);
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), new THREE.MeshStandardMaterial({ color, roughness: 0.92 }));
  wall.position.copy(center);
  wall.receiveShadow = true;
  wall.castShadow = true;
  scene.add(wall);
  if (min.y > 1) return; // upper segments (over doors) get no trim
  const alongX = size.x > size.z;
  const trim = mat('WOOD_WARM', 0x8a6a48);
  const base = new THREE.Mesh(new THREE.BoxGeometry(alongX ? size.x + 0.2 : size.x + 0.6, 1.7, alongX ? size.z + 0.6 : size.z + 0.2), trim);
  base.position.set(center.x, min.y + 0.85, center.z);
  scene.add(base);
  if (size.y > 30) {
    const crown = new THREE.Mesh(new THREE.BoxGeometry(alongX ? size.x + 0.2 : size.x + 0.5, 1.0, alongX ? size.z + 0.5 : size.z + 0.2), new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.9 }));
    crown.position.set(center.x, max.y - 0.5, center.z);
    scene.add(crown);
  }
}

function buildFence(scene: THREE.Scene, min: THREE.Vector3, max: THREE.Vector3, color: number): void {
  const alongX = max.x - min.x > max.z - min.z;
  const len = alongX ? max.x - min.x : max.z - min.z;
  const h = max.y - min.y;
  const thick = alongX ? max.z - min.z : max.x - min.x;
  const wood = mat('WOOD_WARM', color);
  const picketW = 1.7; // 9 cm
  const gap = 0.6;
  const n = Math.floor(len / (picketW + gap));
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(alongX ? picketW : thick * 0.5, h * 0.96, alongX ? thick * 0.5 : picketW), wood);
    const off = -len / 2 + (i + 0.5) * (picketW + gap);
    p.position.set(alongX ? off : 0, h * 0.48, alongX ? 0 : off);
    p.castShadow = true;
    p.receiveShadow = true;
    g.add(p);
    // pointed top
    const tip = new THREE.Mesh(new THREE.ConeGeometry(picketW * 0.6, picketW * 0.7, 4), wood);
    tip.rotation.y = Math.PI / 4;
    tip.position.set(alongX ? off : 0, h * 0.96 + picketW * 0.3, alongX ? 0 : off);
    g.add(tip);
  }
  for (const y of [h * 0.25, h * 0.75]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(alongX ? len : thick, 1.2, alongX ? thick : len), wood);
    rail.position.set(0, y, 0);
    rail.castShadow = true;
    g.add(rail);
  }
  g.position.set((min.x + max.x) / 2, min.y, (min.z + max.z) / 2);
  scene.add(g);
}

function buildSiding(scene: THREE.Scene, min: THREE.Vector3, max: THREE.Vector3, color: number): void {
  const size = new THREE.Vector3().subVectors(max, min);
  const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat('WOOD_WARM', color));
  wall.position.copy(center);
  wall.receiveShadow = true;
  wall.castShadow = true;
  scene.add(wall);
  // Lap lines every 20 cm (3.7 u)
  const alongX = size.x > size.z;
  const lapMat = mat('WOOD_WARM', 0xcfc6b0);
  for (let y = 3.7; y < size.y; y += 3.7) {
    const lap = new THREE.Mesh(new THREE.BoxGeometry(alongX ? size.x : 0.12, 0.25, alongX ? 0.12 : size.z), lapMat);
    lap.position.set(center.x + (alongX ? 0 : (center.x > 0 ? -size.x / 2 : size.x / 2)), min.y + y, center.z + (alongX ? (center.z > 0 ? -size.z / 2 : size.z / 2) : 0));
    scene.add(lap);
  }
}
