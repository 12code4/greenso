// Moving platforms (movePlatform op): a kit prop mesh + a live collider that
// follows a spline. Carries whatever stands on it. Optional water ribbon.

import * as THREE from 'three';
import { CollisionWorld, StaticBox } from '../../sim/collision';
import { PlatformDef } from './types';
import { kitProp } from '../kit/registry';
import { v3, splineLength, splinePoint } from '../../core/math';
import { mat } from '../kit/materials';

export interface Rider {
  pos: THREE.Vector3;
  grounded: boolean;
  radius: number;
}

class MovingPlatform {
  def: PlatformDef;
  mesh: THREE.Object3D;
  box: StaticBox;
  size: THREE.Vector3;
  pts: THREE.Vector3[];
  length: number;
  t = 0;
  /** Moving. Objective-started platforms become `armed` first and depart when boarded. */
  active: boolean;
  armed = false;
  done = false;
  pos = new THREE.Vector3();
  private prev = new THREE.Vector3();
  private tmp = new THREE.Vector3();

  constructor(def: PlatformDef, scene: THREE.Scene, world: CollisionWorld) {
    this.def = def;
    this.pts = def.path.map(v3);
    this.length = splineLength(this.pts);
    const built = kitProp(def.kit).build(0);
    this.mesh = built.mesh;
    scene.add(this.mesh);
    const c = built.colliders[0];
    this.size = v3(c.size);
    splinePoint(this.pts, 0, this.pos);
    this.box = world.addBox(this.pos.clone().add(v3(c.center)), this.size);
    this.active = !def.startOn;
    this.place();
  }

  get top(): number {
    return this.box.max.y;
  }

  private place(): void {
    this.mesh.position.copy(this.pos);
    const half = this.size.clone().multiplyScalar(0.5);
    this.box.min.set(this.pos.x - half.x, this.pos.y, this.pos.z - half.z);
    this.box.max.set(this.pos.x + half.x, this.pos.y + this.size.y, this.pos.z + half.z);
  }

  /** Advances and returns the frame delta. */
  step(dt: number, delta: THREE.Vector3): void {
    delta.set(0, 0, 0);
    if (!this.active || this.done) return;
    this.prev.copy(this.pos);
    this.t += (this.def.speed * dt) / this.length;
    if (this.t >= 1) {
      if (this.def.loop) this.t -= 1;
      else {
        this.t = 1;
        this.done = true;
      }
    }
    splinePoint(this.pts, this.t, this.pos);
    // Face along travel
    splinePoint(this.pts, Math.min(1, this.t + 0.01), this.tmp);
    this.mesh.rotation.y = Math.atan2(this.tmp.x - this.pos.x, this.tmp.z - this.pos.z);
    this.mesh.rotation.z = Math.sin(this.t * 40) * 0.05; // gentle bob
    this.place();
    delta.subVectors(this.pos, this.prev);
  }

  carries(r: Rider): boolean {
    return (
      r.grounded &&
      r.pos.x > this.box.min.x - r.radius && r.pos.x < this.box.max.x + r.radius &&
      r.pos.z > this.box.min.z - r.radius && r.pos.z < this.box.max.z + r.radius &&
      Math.abs(r.pos.y - this.top) < 0.2
    );
  }

  /** Back to the start, waiting to be boarded again (rider died mid-ride). */
  reset(): void {
    this.t = 0;
    this.done = false;
    this.active = false;
    this.armed = true;
    splinePoint(this.pts, 0, this.pos);
    this.mesh.rotation.set(0, 0, 0);
    this.place();
  }
}

export class PlatformSystem {
  platforms: MovingPlatform[] = [];
  private delta = new THREE.Vector3();

  constructor(defs: PlatformDef[], scene: THREE.Scene, world: CollisionWorld) {
    for (const d of defs) {
      this.platforms.push(new MovingPlatform(d, scene, world));
      if (d.stream) scene.add(buildStream(d.path.map(v3)));
    }
  }

  get(id: string): MovingPlatform | undefined {
    return this.platforms.find((p) => p.def.id === id);
  }

  /** Arm any platforms waiting on this objective id: they depart when boarded. */
  onObjective(id: string): void {
    for (const p of this.platforms) if (p.def.startOn === id) p.armed = true;
  }

  /** A rider died: unfinished objective platforms return to their start. */
  resetArmed(): void {
    for (const p of this.platforms) if (p.def.startOn && !p.done) p.reset();
  }

  /** Move platforms; carry riders standing on them. */
  update(dt: number, riders: Rider[]): void {
    for (const p of this.platforms) {
      const carried = riders.filter((r) => p.carries(r));
      if (p.armed && !p.active && carried.length > 0) p.active = true;
      p.step(dt, this.delta);
      for (const r of carried) r.pos.add(this.delta);
    }
  }

  /** Is this rider currently standing on the named platform? */
  riding(id: string, r: Rider): boolean {
    const p = this.get(id);
    return !!p && p.carries(r);
  }
}

/** Flat translucent water ribbon along a spline. */
function buildStream(pts: THREE.Vector3[]): THREE.Object3D {
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 64, 1.1, 6, false);
  const mesh = new THREE.Mesh(geo, mat('GLASS_CHEAP', 0x6fb0e0));
  mesh.scale.y = 0.08;
  mesh.position.y = -0.02;
  mesh.receiveShadow = true;
  return mesh;
}
