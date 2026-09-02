// Pop-up cardboard range targets: tan silhouettes on hinged bases.
// Pop up on staggered timers, wobble when hit, flip down with overshoot,
// respawn. Some slide on rails.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';

type TargetState = 'down' | 'rising' | 'up' | 'falling';

export interface LaneSpec {
  pos: THREE.Vector3;
  faceYaw: number; // which way the board faces
  slide?: { axis: THREE.Vector3; amp: number; speed: number };
}

const HP_MAX = 40;
const UP_TIME_MIN = 5;
const UP_TIME_MAX = 9;
const RESPAWN_MIN = 1.6;
const RESPAWN_MAX = 3.2;

export class RangeTarget {
  root = new THREE.Group();
  board: THREE.Group;
  hitMeshes: THREE.Mesh[] = [];
  state: TargetState = 'down';
  hp = HP_MAX;

  private hinge = 0; // 0 = flat/down, 1 = upright
  private hingeVel = 0;
  private timer: number;
  private wobble = 0;
  private wobbleVel = 0;
  private basePos: THREE.Vector3;
  private slide: LaneSpec['slide'];
  private slidePhase = Math.random() * Math.PI * 2;

  constructor(spec: LaneSpec) {
    this.basePos = spec.pos.clone();
    this.slide = spec.slide;
    this.root.position.copy(spec.pos);
    this.root.rotation.y = spec.faceYaw;
    this.timer = 0.5 + Math.random() * 3; // staggered first pop

    // Base block
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x8a7f6a, roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.5), baseMat);
    base.position.y = 0.08;
    base.castShadow = true;
    base.receiveShadow = true;
    this.root.add(base);

    // Hinged silhouette board (tan cardboard soldier)
    this.board = new THREE.Group();
    this.board.position.set(0, 0.16, 0);
    this.root.add(this.board);

    const tan = new THREE.MeshStandardMaterial({ color: 0xc8a878, roughness: 0.85 });
    const tanDark = new THREE.MeshStandardMaterial({ color: 0xb08f5e, roughness: 0.85 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.72, 0.05), tan);
    torso.position.y = 0.52;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.05), tan);
    head.position.y = 1.02;
    const helmetBrim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.06), tanDark);
    helmetBrim.position.y = 1.12;
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 0.05), tanDark);
    gun.position.set(0.3, 0.62, 0);
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.04), tanDark);
    stick.position.y = 0.08;
    for (const m of [torso, head, helmetBrim, gun, stick]) {
      m.castShadow = true;
      this.board.add(m);
      this.hitMeshes.push(m);
      m.userData.target = this;
    }

    this.setHinge(0);
  }

  private setHinge(v: number): void {
    this.hinge = v;
    this.board.rotation.x = (-Math.PI / 2) * (1 - v) + this.wobble * 0.14;
  }

  get isUp(): boolean {
    return this.state === 'up' || (this.state === 'rising' && this.hinge > 0.6);
  }

  /** Center of mass for aim assist. */
  assistPoint(out: THREE.Vector3): THREE.Vector3 {
    this.board.updateWorldMatrix(true, false);
    return out.set(0, 0.55, 0).applyMatrix4(this.board.matrixWorld);
  }

  /** Returns true if this hit dropped the target. */
  hit(damage: number, dir: THREE.Vector3): boolean {
    if (!this.isUp) return false;
    this.hp -= damage;
    // Wobble impulse in the push direction
    this.wobbleVel += 6 * Math.sign(dir.y === 0 ? 1 : -dir.z || 1);
    if (this.hp <= 0) {
      this.state = 'falling';
      this.timer = RESPAWN_MIN + Math.random() * (RESPAWN_MAX - RESPAWN_MIN);
      return true;
    }
    return false;
  }

  update(dt: number, time: number): void {
    // Slide movers
    if (this.slide) {
      const s = Math.sin(time * this.slide.speed + this.slidePhase) * this.slide.amp;
      this.root.position.copy(this.basePos).addScaledVector(this.slide.axis, s);
    }

    // Wobble spring
    this.wobbleVel += (-this.wobble * 90 - this.wobbleVel * 7) * dt;
    this.wobble += this.wobbleVel * dt;

    switch (this.state) {
      case 'down':
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'rising';
          this.hingeVel = 0;
          this.hp = HP_MAX;
        }
        this.setHinge(Math.max(0, this.hinge));
        break;
      case 'rising': {
        // Underdamped spring toward 1 → overshoot snap, very toy
        this.hingeVel += ((1 - this.hinge) * 120 - this.hingeVel * 9) * dt;
        this.hinge += this.hingeVel * dt;
        this.setHinge(this.hinge);
        if (Math.abs(1 - this.hinge) < 0.02 && Math.abs(this.hingeVel) < 0.2) {
          this.setHinge(1);
          this.state = 'up';
          this.timer = UP_TIME_MIN + Math.random() * (UP_TIME_MAX - UP_TIME_MIN);
        }
        break;
      }
      case 'up':
        this.timer -= dt;
        this.setHinge(1);
        if (this.timer <= 0) {
          this.state = 'falling';
          this.timer = RESPAWN_MIN;
        }
        break;
      case 'falling':
        this.hingeVel += (-this.hinge * 160 - this.hingeVel * 10) * dt;
        this.hinge += this.hingeVel * dt;
        if (this.hinge <= 0) {
          this.setHinge(0);
          this.state = 'down';
          if (this.timer <= 0) this.timer = RESPAWN_MIN;
        } else {
          this.setHinge(this.hinge);
        }
        break;
    }
  }
}

export class TargetRange {
  targets: RangeTarget[] = [];
  downed = 0;

  private raycaster = new THREE.Raycaster();
  private allHitMeshes: THREE.Mesh[] = [];
  private tmpV = new THREE.Vector3();

  constructor(scene: THREE.Scene, lanes: LaneSpec[]) {
    for (const spec of lanes) {
      const t = new RangeTarget(spec);
      this.targets.push(t);
      this.allHitMeshes.push(...t.hitMeshes);
      scene.add(t.root);
    }
  }

  update(dt: number, time: number): void {
    for (const t of this.targets) t.update(dt, time);
  }

  raycast(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    maxT: number,
  ): { point: THREE.Vector3; t: number; apply: (damage: number, dir: THREE.Vector3, kind?: string) => boolean } | null {
    this.raycaster.set(origin, dir);
    this.raycaster.far = maxT;
    const hits = this.raycaster.intersectObjects(this.allHitMeshes, false);
    for (const h of hits) {
      const target = h.object.userData.target as RangeTarget;
      if (target.isUp) {
        return {
          point: h.point,
          t: h.distance,
          apply: (damage, d) => {
            const killed = target.hit(damage, d);
            if (killed) this.downed++;
            return killed;
          },
        };
      }
    }
    return null;
  }

  /** Best (smallest-angle) up-target point inside the assist cone with clear LOS. */
  bestAssistPoint(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    coneRad: number,
    maxDist: number,
    world: CollisionWorld,
  ): THREE.Vector3 | null {
    let bestAngle = coneRad;
    let best: THREE.Vector3 | null = null;
    for (const t of this.targets) {
      if (!t.isUp) continue;
      const p = t.assistPoint(this.tmpV);
      const to = p.clone().sub(origin);
      const dist = to.length();
      if (dist > maxDist) continue;
      to.divideScalar(dist);
      const angle = Math.acos(THREE.MathUtils.clamp(to.dot(dir), -1, 1));
      if (angle >= bestAngle) continue;
      const occ = world.raycast(origin, to, dist - 0.1);
      if (occ) continue;
      bestAngle = angle;
      best = p.clone();
    }
    return best;
  }
}
