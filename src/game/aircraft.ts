// Balsa Interceptors: rubber-band-launched gliders on scripted splines.
// A shadow telegraphs the pass; they strafe mid-run; they can be shot down.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { AircraftWave } from '../maps/runtime/types';
import { Hittable } from './projectiles';
import { Fx } from './weapons';
import { mat } from '../maps/kit/materials';
import { v3, splineLength, splinePoint, clamp } from '../core/math';

export interface AircraftHooks {
  sfx(name: string, at: THREE.Vector3): void;
  playerHit(damage: number, from: THREE.Vector3): void;
}

interface Plane {
  mesh: THREE.Group;
  shadow: THREE.Mesh;
  pts: THREE.Vector3[];
  length: number;
  t: number;
  pos: THREE.Vector3;
  hp: number;
  falling: boolean;
  fallVel: THREE.Vector3;
  spin: number;
  fireT: number;
}

interface Pending {
  wave: AircraftWave;
  t: number;
  left: number;
}

const SPEED = 15;

export class AircraftSystem implements Hittable {
  planes: Plane[] = [];
  shotDown = 0;
  private pending: Pending[] = [];
  private waves: AircraftWave[];
  private scene: THREE.Scene;
  private hooks: AircraftHooks;
  private fx: Fx;
  private tmp = new THREE.Vector3();

  constructor(waves: AircraftWave[], scene: THREE.Scene, hooks: AircraftHooks) {
    this.waves = waves;
    this.scene = scene;
    this.hooks = hooks;
    this.fx = new Fx(scene);
  }

  onEncounterActivated(id: string): void {
    for (const w of this.waves) if (w.on === id) this.pending.push({ wave: w, t: 1.5, left: w.count });
  }

  private launch(w: AircraftWave): void {
    const mesh = buildGlider();
    this.scene.add(mesh);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 18),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(2.2, 1, 1);
    this.scene.add(shadow);
    const pts = w.path.map(v3);
    const p: Plane = { mesh, shadow, pts, length: splineLength(pts), t: 0, pos: pts[0].clone(), hp: 25, falling: false, fallVel: new THREE.Vector3(), spin: 0, fireT: 0.3 };
    this.planes.push(p);
    this.hooks.sfx('glider', p.pos);
  }

  update(dt: number, playerPos: THREE.Vector3, playerAlive: boolean, world: CollisionWorld): void {
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const pd = this.pending[i];
      pd.t -= dt;
      if (pd.t <= 0) {
        this.launch(pd.wave);
        pd.left--;
        pd.t = pd.wave.interval;
        if (pd.left <= 0) this.pending.splice(i, 1);
      }
    }
    for (let i = this.planes.length - 1; i >= 0; i--) {
      const p = this.planes[i];
      if (p.falling) {
        p.fallVel.y -= 12 * dt;
        p.pos.addScaledVector(p.fallVel, dt);
        p.spin += dt * 6;
        p.mesh.rotation.z = p.spin;
        p.mesh.rotation.x = p.spin * 0.4;
        p.mesh.position.copy(p.pos);
        p.shadow.position.set(p.pos.x, 0.05, p.pos.z);
        if (p.pos.y < 0.3) {
          this.hooks.sfx('shatter', p.pos);
          this.remove(i);
        }
        continue;
      }
      p.t += (SPEED * dt) / p.length;
      if (p.t >= 1) {
        this.remove(i);
        continue;
      }
      splinePoint(p.pts, p.t, p.pos);
      splinePoint(p.pts, Math.min(1, p.t + 0.01), this.tmp);
      p.mesh.position.copy(p.pos);
      p.mesh.lookAt(this.tmp);
      p.mesh.rotation.z += Math.sin(p.t * 20) * 0.15; // wobble
      p.shadow.position.set(p.pos.x, 0.05, p.pos.z);
      (p.shadow.material as THREE.MeshBasicMaterial).opacity = clamp(0.5 - p.pos.y * 0.03, 0.12, 0.45);

      // Strafe in the middle third of the pass
      if (playerAlive && p.t > 0.3 && p.t < 0.7) {
        p.fireT -= dt;
        if (p.fireT <= 0) {
          p.fireT = 0.22;
          this.strafe(p, playerPos, world);
        }
      }
    }
    this.fx.update(dt);
  }

  private strafe(p: Plane, playerPos: THREE.Vector3, world: CollisionWorld): void {
    const target = playerPos.clone();
    target.y += 0.5;
    const dir = target.clone().sub(p.pos).normalize();
    const s = THREE.MathUtils.degToRad(5);
    dir.x += (Math.random() - 0.5) * s;
    dir.y += (Math.random() - 0.5) * s;
    dir.z += (Math.random() - 0.5) * s;
    dir.normalize();
    const oc = p.pos.clone().sub(target);
    const b = oc.dot(dir);
    const disc = b * b - (oc.dot(oc) - 0.36 * 0.36);
    const dist = p.pos.distanceTo(target);
    const wh = world.raycast(p.pos, dir, dist);
    let end: THREE.Vector3;
    if (disc >= 0 && !wh) {
      end = target;
      this.hooks.playerHit(6, p.pos);
    } else if (wh) {
      end = wh.point;
      this.fx.hitSpark(end, 0xbbb4a4);
    } else {
      end = p.pos.clone().addScaledVector(dir, dist);
      this.fx.hitSpark(end, 0xbbb4a4);
    }
    this.fx.tracer(p.pos, end, 0xffd9a0);
    this.hooks.sfx('cap', p.pos);
  }

  private remove(i: number): void {
    const p = this.planes[i];
    this.scene.remove(p.mesh, p.shadow);
    this.planes.splice(i, 1);
  }

  // Hittable: one sphere per plane
  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxT: number): { point: THREE.Vector3; t: number; apply: (damage: number, dir: THREE.Vector3) => boolean } | null {
    let best: Plane | null = null;
    let bestT = maxT;
    for (const p of this.planes) {
      if (p.falling) continue;
      const oc = this.tmp.subVectors(origin, p.pos);
      const b = oc.dot(dir);
      const disc = b * b - (oc.dot(oc) - 1.3 * 1.3);
      if (disc < 0) continue;
      const t = -b - Math.sqrt(disc);
      if (t > 0 && t < bestT) {
        bestT = t;
        best = p;
      }
    }
    if (!best) return null;
    const plane = best;
    return {
      point: origin.clone().addScaledVector(dir, bestT),
      t: bestT,
      apply: (damage) => {
        plane.hp -= damage;
        this.hooks.sfx('hit_plastic', plane.pos);
        if (plane.hp <= 0 && !plane.falling) {
          plane.falling = true;
          plane.fallVel.set((Math.random() - 0.5) * 4, 1, (Math.random() - 0.5) * 4);
          this.shotDown++;
          return true;
        }
        return false;
      },
    };
  }

  bestAssistPoint(origin: THREE.Vector3, dir: THREE.Vector3, coneRad: number, maxDist: number): THREE.Vector3 | null {
    let bestAngle = coneRad;
    let best: THREE.Vector3 | null = null;
    for (const p of this.planes) {
      if (p.falling) continue;
      const to = this.tmp.subVectors(p.pos, origin);
      const d = to.length();
      if (d > maxDist) continue;
      to.divideScalar(d);
      const a = Math.acos(clamp(to.dot(dir), -1, 1));
      if (a < bestAngle) {
        bestAngle = a;
        best = p.pos.clone();
      }
    }
    return best;
  }
}

function buildGlider(): THREE.Group {
  const g = new THREE.Group();
  const balsa = mat('WOOD_WARM', 0xe8d9b0);
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 3.4), balsa);
  fuselage.castShadow = true;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.08, 1.2), balsa);
  wing.position.set(0, 0.12, 0.3);
  wing.castShadow = true;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.6), balsa);
  tail.position.set(0, 0.1, 1.55);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.6), balsa);
  fin.position.set(0, 0.45, 1.55);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.3), mat('RUBBER_MATTE', 0x333333));
  nose.position.z = -1.7;
  const roundel = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), mat('PAPERBOARD', 0xc8a878));
  roundel.rotation.x = -Math.PI / 2;
  roundel.position.set(2.6, 0.17, 0.3);
  g.add(fuselage, wing, tail, fin, nose, roundel);
  return g;
}
