// Hitscan weapons: Standard-Issue Rifle + Cap Pistol, with soft bullet
// magnetism (never full lock), tracers, muzzle flash, hit puffs.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { Input } from '../core/input';
import { ThirdPersonCamera } from './camera';
import { TargetRange } from './targets';

export interface WeaponDef {
  name: string;
  auto: boolean;
  rof: number; // rounds per second
  damage: number;
  spreadHipDeg: number;
  spreadAimDeg: number;
  recoil: number;
  assistConeHipDeg: number;
  assistConeAimDeg: number;
  tracerColor: number;
}

const RIFLE: WeaponDef = {
  name: 'STANDARD-ISSUE RIFLE',
  auto: true,
  rof: 6.5,
  damage: 34,
  spreadHipDeg: 1.3,
  spreadAimDeg: 0.15,
  recoil: 0.009,
  assistConeHipDeg: 4.5,
  assistConeAimDeg: 2.5,
  tracerColor: 0xfff6c8,
};

const CAP_PISTOL: WeaponDef = {
  name: 'CAP PISTOL',
  auto: false,
  rof: 9,
  damage: 12,
  spreadHipDeg: 2.4,
  spreadAimDeg: 0.8,
  recoil: 0.016,
  assistConeHipDeg: 5,
  assistConeAimDeg: 3,
  tracerColor: 0xffb36b,
};

export interface ShotStats {
  shots: number;
  hits: number;
}

export class Weapons {
  current: WeaponDef = RIFLE;
  stats: ShotStats = { shots: 0, hits: 0 };
  onHit: ((killed: boolean) => void) | null = null;

  private cooldown = 0;
  private fx: Fx;
  private muzzleWorld = new THREE.Vector3();
  private playerRoot: THREE.Object3D;

  constructor(scene: THREE.Scene, playerRoot: THREE.Object3D) {
    this.fx = new Fx(scene);
    this.playerRoot = playerRoot;
  }

  switchTo(index: number): void {
    this.current = index === 0 ? RIFLE : CAP_PISTOL;
  }

  toggle(): void {
    this.current = this.current === RIFLE ? CAP_PISTOL : RIFLE;
  }

  update(
    dt: number,
    input: Input,
    cam: ThirdPersonCamera,
    aiming: boolean,
    world: CollisionWorld,
    targets: TargetRange,
  ): void {
    this.cooldown -= dt;
    if (input.pressed('Digit1')) this.current = RIFLE;
    if (input.pressed('Digit2')) this.current = CAP_PISTOL;
    if (input.pressed('KeyQ')) this.toggle();

    const wantFire = this.current.auto ? input.fireHeld : input.firePressed;
    if (wantFire && this.cooldown <= 0) {
      this.cooldown = 1 / this.current.rof;
      this.fire(cam, aiming, world, targets);
    }

    this.fx.update(dt);
  }

  private fire(
    cam: ThirdPersonCamera,
    aiming: boolean,
    world: CollisionWorld,
    targets: TargetRange,
  ): void {
    const w = this.current;
    this.stats.shots++;

    const { origin, dir } = cam.aimRay();

    // Spread
    const spread = THREE.MathUtils.degToRad(aiming ? w.spreadAimDeg : w.spreadHipDeg);
    applyCone(dir, spread);

    // Soft aim assist: bend toward the best target inside the cone
    const cone = THREE.MathUtils.degToRad(aiming ? w.assistConeAimDeg : w.assistConeHipDeg);
    const assistPoint = targets.bestAssistPoint(origin, dir, cone, 70, world);
    if (assistPoint) {
      const toT = assistPoint.clone().sub(origin).normalize();
      dir.lerp(toT, 0.65).normalize();
    }

    // Resolve hit: world vs targets
    const worldHit = world.raycast(origin, dir, 200);
    const worldT = worldHit ? worldHit.t : 200;
    const tHit = targets.raycast(origin, dir, worldT);

    // Muzzle position: from the player's rifle-ish height toward the hit
    this.playerRoot.getWorldPosition(this.muzzleWorld);
    this.muzzleWorld.y += 0.62;

    let end: THREE.Vector3;
    if (tHit) {
      end = tHit.point;
      const killed = tHit.target.hit(w.damage, dir);
      this.stats.hits++;
      this.fx.hitSpark(end, 0xd9b98c);
      if (this.onHit) this.onHit(killed);
    } else if (worldHit) {
      end = worldHit.point;
      this.fx.hitSpark(end, 0xbbb4a4);
    } else {
      end = origin.clone().addScaledVector(dir, 200);
    }

    this.fx.tracer(this.muzzleWorld, end, w.tracerColor);
    this.fx.muzzleFlash(this.muzzleWorld, w === CAP_PISTOL);
    cam.addRecoil(w.recoil);
  }
}

function applyCone(dir: THREE.Vector3, angle: number): void {
  if (angle <= 0) return;
  const u = Math.random();
  const v = Math.random();
  const theta = angle * Math.sqrt(u);
  const phi = 2 * Math.PI * v;
  const ortho1 = new THREE.Vector3(0, 1, 0).cross(dir);
  if (ortho1.lengthSq() < 1e-6) ortho1.set(1, 0, 0);
  ortho1.normalize();
  const ortho2 = dir.clone().cross(ortho1).normalize();
  dir
    .multiplyScalar(Math.cos(theta))
    .addScaledVector(ortho1, Math.sin(theta) * Math.cos(phi))
    .addScaledVector(ortho2, Math.sin(theta) * Math.sin(phi))
    .normalize();
}

// ---------------------------------------------------------------- FX pool

interface Tracer {
  line: THREE.Line;
  life: number;
}
interface Spark {
  mesh: THREE.Mesh;
  life: number;
}

class Fx {
  private scene: THREE.Scene;
  private tracers: Tracer[] = [];
  private sparks: Spark[] = [];
  private flash: THREE.PointLight;
  private flashLife = 0;
  private sparkGeo = new THREE.SphereGeometry(0.045, 6, 5);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.flash = new THREE.PointLight(0xffd9a0, 0, 4, 2);
    scene.add(this.flash);
  }

  tracer(from: THREE.Vector3, to: THREE.Vector3, color: number): void {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line, life: 0.07 });
  }

  muzzleFlash(at: THREE.Vector3, big: boolean): void {
    this.flash.position.copy(at);
    this.flash.intensity = big ? 6 : 3.5;
    this.flashLife = 0.045;
  }

  hitSpark(at: THREE.Vector3, color: number): void {
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.95,
    });
    const m = new THREE.Mesh(this.sparkGeo, mat);
    m.position.copy(at);
    this.scene.add(m);
    this.sparks.push({ mesh: m, life: 0.14 });
  }

  update(dt: number): void {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      (t.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, t.life / 0.07) * 0.9;
      if (t.life <= 0) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        (t.line.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      const k = Math.max(0, s.life / 0.14);
      s.mesh.scale.setScalar(1 + (1 - k) * 2.5);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = k;
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        (s.mesh.material as THREE.Material).dispose();
        this.sparks.splice(i, 1);
      }
    }
    if (this.flashLife > 0) {
      this.flashLife -= dt;
      if (this.flashLife <= 0) this.flash.intensity = 0;
    }
  }
}
