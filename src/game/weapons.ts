// Weapons: Standard-Issue Rifle + Cap Pistol (hitscan), Rubber-Band Sniper
// (projectile, unlocked by Fern), Frag Grenade (cooked throw, arc preview).
// Soft bullet magnetism bends toward targets in a cone — never full lock.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { Input } from '../core/input';
import { ThirdPersonCamera } from './camera';
import { Hittable, Projectiles } from './projectiles';

export interface WeaponDef {
  id: 'rifle' | 'cap' | 'sniper';
  name: string;
  auto: boolean;
  rof: number;
  damage: number;
  spreadHipDeg: number;
  spreadAimDeg: number;
  recoil: number;
  assistConeHipDeg: number;
  assistConeAimDeg: number;
  tracerColor: number;
  aimFov: number;
  noise: number; // alert radius
  projectile?: boolean;
}

const RIFLE: WeaponDef = {
  id: 'rifle', name: 'STANDARD-ISSUE RIFLE', auto: true, rof: 6.5, damage: 34,
  spreadHipDeg: 1.3, spreadAimDeg: 0.15, recoil: 0.009, assistConeHipDeg: 4.5, assistConeAimDeg: 2.5,
  tracerColor: 0xfff6c8, aimFov: 48, noise: 22,
};
const CAP_PISTOL: WeaponDef = {
  id: 'cap', name: 'CAP PISTOL', auto: false, rof: 9, damage: 12,
  spreadHipDeg: 2.4, spreadAimDeg: 0.8, recoil: 0.016, assistConeHipDeg: 5, assistConeAimDeg: 3,
  tracerColor: 0xffb36b, aimFov: 50, noise: 34,
};
const SNIPER: WeaponDef = {
  id: 'sniper', name: 'RUBBER-BAND SNIPER', auto: false, rof: 1.1, damage: 90,
  spreadHipDeg: 2.0, spreadAimDeg: 0.05, recoil: 0.03, assistConeHipDeg: 2, assistConeAimDeg: 1.2,
  tracerColor: 0xd9c26b, aimFov: 28, noise: 5, projectile: true,
};

export interface ShotStats {
  shots: number;
  hits: number;
}

export interface MuzzleSource {
  muzzleWorld(out: THREE.Vector3): THREE.Vector3;
  pos: THREE.Vector3;
}

export class Weapons {
  current: WeaponDef = RIFLE;
  stats: ShotStats = { shots: 0, hits: 0 };
  onHit: ((killed: boolean) => void) | null = null;
  onFire: ((sfx: string, at: THREE.Vector3, noiseRadius: number) => void) | null = null;
  onThrow: (() => void) | null = null;
  rifleAmmo = 120;
  readonly rifleMax = 240;
  bands = 0;
  grenades = 3;
  hasSniper = false;
  /** >0 while cooking a grenade. */
  cook = -1;

  private cooldown = 0;
  private fx: Fx;
  private muzzleWorld = new THREE.Vector3();
  private source: MuzzleSource;
  private projectiles: Projectiles;
  private arcLine: THREE.Line;
  private arcPts: THREE.Vector3[] = [];
  private world: CollisionWorld;

  constructor(scene: THREE.Scene, source: MuzzleSource, projectiles: Projectiles, world: CollisionWorld) {
    this.fx = new Fx(scene);
    this.source = source;
    this.projectiles = projectiles;
    this.world = world;
    this.arcLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xfff2b0, dashSize: 0.25, gapSize: 0.15, transparent: true, opacity: 0.85 }),
    );
    this.arcLine.visible = false;
    this.arcLine.frustumCulled = false;
    scene.add(this.arcLine);
  }

  addAmmo(n: number): void {
    this.rifleAmmo = Math.min(this.rifleMax, this.rifleAmmo + n);
    this.grenades = Math.min(6, this.grenades + 1);
  }

  addBands(n: number): void {
    this.bands = Math.min(24, this.bands + n);
  }

  ammoText(): string {
    switch (this.current.id) {
      case 'rifle': return `AMMO ${this.rifleAmmo} · GRENADES ${this.grenades}`;
      case 'cap': return `AMMO ∞ · GRENADES ${this.grenades}`;
      case 'sniper': return `BANDS ${this.bands} · GRENADES ${this.grenades}`;
    }
  }

  switchTo(w: WeaponDef): void {
    if (w === SNIPER && !this.hasSniper) return;
    this.current = w;
    this.cooldown = Math.max(this.cooldown, 0.25);
  }

  update(dt: number, input: Input, cam: ThirdPersonCamera, aiming: boolean, hittables: Hittable[]): void {
    this.cooldown -= dt;
    if (input.pressed('Digit1')) this.switchTo(RIFLE);
    if (input.pressed('Digit2')) this.switchTo(CAP_PISTOL);
    if (input.pressed('Digit3')) this.switchTo(SNIPER);
    if (input.pressed('KeyQ')) {
      const order: WeaponDef[] = this.hasSniper ? [RIFLE, CAP_PISTOL, SNIPER] : [RIFLE, CAP_PISTOL];
      this.switchTo(order[(order.indexOf(this.current) + 1) % order.length]);
    }
    cam.aimFov = this.current.aimFov;

    // ---- Grenade: hold G to cook, release to throw
    this.updateGrenade(dt, input, cam);
    if (this.cook >= 0) return; // no shooting while cooking

    const w = this.current;
    const wantFire = w.auto ? input.fireHeld : input.firePressed;
    if (wantFire && this.cooldown <= 0) {
      const empty = (w.id === 'rifle' && this.rifleAmmo <= 0) || (w.id === 'sniper' && this.bands <= 0);
      if (empty) {
        this.cooldown = 0.3;
      } else {
        this.cooldown = 1 / w.rof;
        if (w.id === 'rifle') this.rifleAmmo--;
        if (w.id === 'sniper') this.bands--;
        this.fire(cam, aiming, hittables);
      }
    }
    this.fx.update(dt);
  }

  private updateGrenade(dt: number, input: Input, cam: ThirdPersonCamera): void {
    if (this.cook < 0 && input.pressed('KeyG') && this.grenades > 0) this.cook = 0;
    if (this.cook >= 0) {
      this.cook += dt;
      const { origin, vel } = this.throwVector(cam);
      Projectiles.arc(origin, vel, this.world, this.arcPts);
      this.arcLine.geometry.dispose();
      this.arcLine.geometry = new THREE.BufferGeometry().setFromPoints(this.arcPts);
      this.arcLine.computeLineDistances();
      this.arcLine.visible = true;
      // Cooked too long: it goes off in your hand
      if (this.cook > 2.9) {
        this.projectiles.spawnGrenade(origin, new THREE.Vector3(0, 0.5, 0), 0.01, 'green');
        this.grenades--;
        this.cook = -1;
        this.arcLine.visible = false;
        return;
      }
      if (!input.held('KeyG')) {
        this.projectiles.spawnGrenade(origin, vel, Math.max(0.35, 2.9 - this.cook), 'green');
        this.grenades--;
        this.cook = -1;
        this.arcLine.visible = false;
        if (this.onThrow) this.onThrow();
      }
    }
  }

  private throwVector(cam: ThirdPersonCamera): { origin: THREE.Vector3; vel: THREE.Vector3 } {
    const { dir } = cam.aimRay();
    const origin = this.source.pos.clone();
    origin.y += 1.0;
    origin.addScaledVector(dir, 0.4);
    const speed = 9 + Math.min(1, this.cook / 1.5) * 4;
    const vel = dir.clone().multiplyScalar(speed);
    vel.y += 3.2;
    return { origin, vel };
  }

  private fire(cam: ThirdPersonCamera, aiming: boolean, hittables: Hittable[]): void {
    const w = this.current;
    this.stats.shots++;
    const { origin, dir } = cam.aimRay();
    const spread = THREE.MathUtils.degToRad(aiming ? w.spreadAimDeg : w.spreadHipDeg);
    applyCone(dir, spread);

    // Soft aim assist
    const cone = THREE.MathUtils.degToRad(aiming ? w.assistConeAimDeg : w.assistConeHipDeg);
    let bestPoint: THREE.Vector3 | null = null;
    let bestAngle = cone;
    for (const h of hittables) {
      const p = h.bestAssistPoint(origin, dir, bestAngle, 70, this.world);
      if (p) {
        const a = Math.acos(THREE.MathUtils.clamp(p.clone().sub(origin).normalize().dot(dir), -1, 1));
        if (a < bestAngle) {
          bestAngle = a;
          bestPoint = p;
        }
      }
    }
    if (bestPoint) dir.lerp(bestPoint.clone().sub(origin).normalize(), 0.65).normalize();

    this.source.muzzleWorld(this.muzzleWorld);

    if (w.projectile) {
      // Rubber band: launch from the muzzle toward where the crosshair ray lands
      const worldHit = this.world.raycast(origin, dir, 120);
      const aimPoint = worldHit ? worldHit.point : origin.clone().addScaledVector(dir, 120);
      const vel = aimPoint.sub(this.muzzleWorld).normalize().multiplyScalar(55);
      this.projectiles.spawnBand(this.muzzleWorld.clone(), vel, w.damage);
      this.fx.muzzleFlash(this.muzzleWorld, false);
      cam.addRecoil(w.recoil);
      if (this.onFire) this.onFire('band', this.muzzleWorld, w.noise);
      return;
    }

    // Hitscan: nearest hittable vs. world
    const worldHit = this.world.raycast(origin, dir, 200);
    let bestT = worldHit ? worldHit.t : 200;
    let best: ReturnType<Hittable['raycast']> = null;
    for (const h of hittables) {
      const r = h.raycast(origin, dir, bestT);
      if (r) {
        best = r;
        bestT = r.t;
      }
    }
    let end: THREE.Vector3;
    if (best) {
      end = best.point;
      const killed = best.apply(w.damage, dir);
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
    if (this.onFire) this.onFire(w.id === 'cap' ? 'cap' : 'rifle', this.muzzleWorld, w.noise);
  }
}

function applyCone(dir: THREE.Vector3, angle: number): void {
  if (angle <= 0) return;
  const theta = angle * Math.sqrt(Math.random());
  const phi = 2 * Math.PI * Math.random();
  const ortho1 = new THREE.Vector3(0, 1, 0).cross(dir);
  if (ortho1.lengthSq() < 1e-6) ortho1.set(1, 0, 0);
  ortho1.normalize();
  const ortho2 = dir.clone().cross(ortho1).normalize();
  dir.multiplyScalar(Math.cos(theta))
    .addScaledVector(ortho1, Math.sin(theta) * Math.cos(phi))
    .addScaledVector(ortho2, Math.sin(theta) * Math.sin(phi))
    .normalize();
}

// ---------------------------------------------------------------- FX pool

interface Tracer { line: THREE.Line; life: number }
interface Spark { mesh: THREE.Mesh; life: number }

export class Fx {
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
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
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
    const m = new THREE.Mesh(this.sparkGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }));
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
