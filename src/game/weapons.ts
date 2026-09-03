// The arsenal (docs/09 §1.1: the arsenal IS the fun, and you get it early).
// Rifle + Cap Pistol (hitscan), Rubber-Band Sniper (projectile, from Fern),
// Flamethrower (cone — enemies MELT), Bazooka (rockets — plastic chunks),
// Frag Grenade (cooked, arc preview). Visible lock-on: soft magnetism inside
// a generous cone, and the HUD shows WHICH target is locked.

import * as THREE from 'three';
import { SoldierModel, HeldWeapon } from './soldier';
import { CollisionWorld } from '../sim/collision';
import { Input } from '../core/input';
import { ThirdPersonCamera } from './camera';
import { Hittable, Projectiles, HitApply } from './projectiles';

export type WeaponId = 'rifle' | 'cap' | 'sniper' | 'flamer' | 'bazooka';

export interface WeaponDef {
  id: WeaponId;
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
  noise: number;
  kind: 'hitscan' | 'band' | 'flame' | 'rocket';
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  rifle: { id: 'rifle', name: 'STANDARD-ISSUE RIFLE', auto: true, rof: 6.5, damage: 34, spreadHipDeg: 1.3, spreadAimDeg: 0.15, recoil: 0.009, assistConeHipDeg: 4.5, assistConeAimDeg: 2.5, tracerColor: 0xfff6c8, aimFov: 48, noise: 22, kind: 'hitscan' },
  cap: { id: 'cap', name: 'CAP PISTOL', auto: false, rof: 9, damage: 12, spreadHipDeg: 2.4, spreadAimDeg: 0.8, recoil: 0.016, assistConeHipDeg: 5, assistConeAimDeg: 3, tracerColor: 0xffb36b, aimFov: 50, noise: 34, kind: 'hitscan' },
  sniper: { id: 'sniper', name: 'RUBBER-BAND SNIPER', auto: false, rof: 1.1, damage: 90, spreadHipDeg: 2.0, spreadAimDeg: 0.05, recoil: 0.03, assistConeHipDeg: 2, assistConeAimDeg: 1.2, tracerColor: 0xd9c26b, aimFov: 28, noise: 5, kind: 'band' },
  flamer: { id: 'flamer', name: 'FLAMETHROWER', auto: true, rof: 30, damage: 42, spreadHipDeg: 0, spreadAimDeg: 0, recoil: 0.002, assistConeHipDeg: 0, assistConeAimDeg: 0, tracerColor: 0xff8a2a, aimFov: 56, noise: 14, kind: 'flame' },
  bazooka: { id: 'bazooka', name: 'BAZOOKA', auto: false, rof: 0.8, damage: 95, spreadHipDeg: 0.6, spreadAimDeg: 0.1, recoil: 0.06, assistConeHipDeg: 3, assistConeAimDeg: 2, tracerColor: 0xffffff, aimFov: 46, noise: 40, kind: 'rocket' },
};

const FLAME_RANGE = 6.5;
const FLAME_HALF_ANGLE = THREE.MathUtils.degToRad(20);

export interface ShotStats { shots: number; hits: number }

export interface MuzzleSource {
  muzzleWorld(out: THREE.Vector3): THREE.Vector3;
  pos: THREE.Vector3;
  /** Weapon = pose: the soldier model swaps held prop + hold on switch. */
  model?: SoldierModel;
}

export class Weapons {
  current: WeaponDef = WEAPONS.rifle;
  stats: ShotStats = { shots: 0, hits: 0 };
  onHit: ((killed: boolean) => void) | null = null;
  onFire: ((sfx: string, at: THREE.Vector3, noiseRadius: number) => void) | null = null;
  onThrow: (() => void) | null = null;
  rifleAmmo = 120;
  readonly rifleMax = 240;
  bands = 0;
  grenades = 3;
  fuel = 0;
  rockets = 0;
  owned = new Set<WeaponId>(['rifle', 'cap']);
  /** >0 while cooking a grenade. */
  cook = -1;
  /** World point of the target the reticle is magnetized to this frame (HUD bracket). */
  lockPoint: THREE.Vector3 | null = null;
  /** True while the flamethrower is spraying (audio loop). */
  firingFlame = false;

  private cooldown = 0;
  private fx: Fx;
  private muzzleWorld = new THREE.Vector3();
  private source: MuzzleSource;
  private projectiles: Projectiles;
  private arcLine: THREE.Line;
  private arcPts: THREE.Vector3[] = [];
  private world: CollisionWorld;
  private flameLight: THREE.PointLight;

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
    this.flameLight = new THREE.PointLight(0xff9a3a, 0, 7, 2);
    scene.add(this.flameLight);
  }

  // ------------------------------------------------------------ inventory

  unlock(id: WeaponId): boolean {
    const isNew = !this.owned.has(id);
    this.owned.add(id);
    return isNew;
  }
  addAmmo(n: number): void { this.rifleAmmo = Math.min(this.rifleMax, this.rifleAmmo + n); this.grenades = Math.min(6, this.grenades + 1); }
  addBands(n: number): void { this.bands = Math.min(24, this.bands + n); }
  addFuel(n: number): void { this.fuel = Math.min(200, this.fuel + n); }
  addRockets(n: number): void { this.rockets = Math.min(8, this.rockets + n); }

  ammoText(): string {
    const g = ` · GRENADES ${this.grenades}`;
    switch (this.current.id) {
      case 'rifle': return `AMMO ${this.rifleAmmo}${g}`;
      case 'cap': return `AMMO ∞${g}`;
      case 'sniper': return `BANDS ${this.bands}${g}`;
      case 'flamer': return `FUEL ${Math.ceil(this.fuel)}${g}`;
      case 'bazooka': return `ROCKETS ${this.rockets}${g}`;
    }
  }

  private order(): WeaponDef[] {
    return (['rifle', 'cap', 'sniper', 'flamer', 'bazooka'] as WeaponId[]).filter((id) => this.owned.has(id)).map((id) => WEAPONS[id]);
  }

  switchTo(id: WeaponId): void {
    if (!this.owned.has(id) || this.current.id === id) return;
    this.current = WEAPONS[id];
    this.cooldown = Math.max(this.cooldown, 0.25);
    this.firingFlame = false;
  }

  /** Weapon = pose (docs/09 §3): the soldier model swaps its held prop and hold. */
  private syncHeld(): void {
    const model = this.source.model;
    if (!model) return;
    const held: HeldWeapon = this.current.id === 'cap' ? 'pistol' : this.current.id;
    if (model.weapon !== held) model.setWeapon(held);
  }

  // ------------------------------------------------------------ update

  update(dt: number, input: Input, cam: ThirdPersonCamera, aiming: boolean, hittables: Hittable[]): void {
    this.syncHeld();
    this.cooldown -= dt;
    if (input.pressed('Digit1')) this.switchTo('rifle');
    if (input.pressed('Digit2')) this.switchTo('cap');
    if (input.pressed('Digit3')) this.switchTo('sniper');
    if (input.pressed('Digit4')) this.switchTo('flamer');
    if (input.pressed('Digit5')) this.switchTo('bazooka');
    if (input.pressed('KeyQ')) {
      const o = this.order();
      this.switchTo(o[(o.indexOf(this.current) + 1) % o.length].id);
    }
    cam.aimFov = this.current.aimFov;

    // Lock-on preview every frame (the Dreamcast crosshair fix: show the target)
    this.lockPoint = this.current.kind === 'flame' ? null : this.findLock(cam, aiming, hittables);

    this.updateGrenade(dt, input, cam);
    if (this.cook >= 0) { this.firingFlame = false; this.flameLight.intensity = 0; this.fx.update(dt); return; }

    const w = this.current;
    if (w.kind === 'flame') {
      this.updateFlame(dt, input, cam, hittables);
      this.fx.update(dt);
      return;
    }
    this.firingFlame = false;
    this.flameLight.intensity = 0;

    const wantFire = w.auto ? input.fireHeld : input.firePressed;
    if (wantFire && this.cooldown <= 0) {
      const empty = (w.id === 'rifle' && this.rifleAmmo <= 0) || (w.id === 'sniper' && this.bands <= 0) || (w.id === 'bazooka' && this.rockets <= 0);
      if (empty) {
        this.cooldown = 0.3;
      } else {
        this.cooldown = 1 / w.rof;
        if (w.id === 'rifle') this.rifleAmmo--;
        if (w.id === 'sniper') this.bands--;
        if (w.id === 'bazooka') this.rockets--;
        this.fire(cam, aiming, hittables);
      }
    }
    this.fx.update(dt);
  }

  private findLock(cam: ThirdPersonCamera, aiming: boolean, hittables: Hittable[]): THREE.Vector3 | null {
    const w = this.current;
    const { origin, dir } = cam.aimRay();
    let bestAngle = THREE.MathUtils.degToRad(aiming ? w.assistConeAimDeg : w.assistConeHipDeg);
    let best: THREE.Vector3 | null = null;
    for (const h of hittables) {
      const p = h.bestAssistPoint(origin, dir, bestAngle, 70, this.world);
      if (p) {
        const a = Math.acos(THREE.MathUtils.clamp(p.clone().sub(origin).normalize().dot(dir), -1, 1));
        if (a < bestAngle) { bestAngle = a; best = p; }
      }
    }
    return best;
  }

  // ------------------------------------------------------------ flamethrower

  private updateFlame(dt: number, input: Input, cam: ThirdPersonCamera, hittables: Hittable[]): void {
    const spraying = input.fireHeld && this.fuel > 0;
    this.firingFlame = spraying;
    if (!spraying) { this.flameLight.intensity = 0; return; }
    this.fuel = Math.max(0, this.fuel - 28 * dt);
    this.source.muzzleWorld(this.muzzleWorld);
    const { dir } = cam.aimRay();
    // Flame particles
    for (let i = 0; i < 5; i++) this.fx.flame(this.muzzleWorld, dir);
    this.flameLight.position.copy(this.muzzleWorld).addScaledVector(dir, 2.2);
    this.flameLight.intensity = 4 + Math.random() * 2;
    // Cone damage — fire kind → melt
    let hit = false;
    for (const h of hittables) {
      if (!h.cone) continue;
      for (const apply of h.cone(this.muzzleWorld, dir, FLAME_RANGE, FLAME_HALF_ANGLE, this.world)) {
        const killed = apply(this.current.damage * dt, dir, 'fire');
        hit = true;
        if (killed && this.onHit) this.onHit(true);
      }
    }
    if (hit && Math.random() < dt * 6 && this.onHit) this.onHit(false);
    if (this.onFire && Math.random() < dt * 2) this.onFire('flame_tick', this.muzzleWorld, this.current.noise);
  }

  // ------------------------------------------------------------ grenade

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

  // ------------------------------------------------------------ fire

  private fire(cam: ThirdPersonCamera, aiming: boolean, hittables: Hittable[]): void {
    const w = this.current;
    this.stats.shots++;
    const { origin, dir } = cam.aimRay();
    applyCone(dir, THREE.MathUtils.degToRad(aiming ? w.spreadAimDeg : w.spreadHipDeg));
    // Magnetism toward the locked target (never full lock)
    if (this.lockPoint) dir.lerp(this.lockPoint.clone().sub(origin).normalize(), 0.65).normalize();
    this.source.muzzleWorld(this.muzzleWorld);

    if (w.kind === 'rocket') {
      const worldHit = this.world.raycast(origin, dir, 150);
      const aimPoint = worldHit ? worldHit.point : origin.clone().addScaledVector(dir, 150);
      const rdir = aimPoint.sub(this.muzzleWorld).normalize();
      this.projectiles.spawnRocket(this.muzzleWorld.clone().addScaledVector(rdir, 0.4), rdir, 'green');
      this.fx.muzzleFlash(this.muzzleWorld, true);
      cam.addRecoil(w.recoil);
      cam.addTrauma(0.25);
      if (this.onFire) this.onFire('rocket', this.muzzleWorld, w.noise);
      return;
    }
    if (w.kind === 'band') {
      const worldHit = this.world.raycast(origin, dir, 120);
      const aimPoint = worldHit ? worldHit.point : origin.clone().addScaledVector(dir, 120);
      const vel = aimPoint.sub(this.muzzleWorld).normalize().multiplyScalar(55);
      this.projectiles.spawnBand(this.muzzleWorld.clone(), vel, w.damage);
      this.fx.muzzleFlash(this.muzzleWorld, false);
      cam.addRecoil(w.recoil);
      if (this.onFire) this.onFire('band', this.muzzleWorld, w.noise);
      return;
    }

    // Hitscan
    const worldHit = this.world.raycast(origin, dir, 200);
    let bestT = worldHit ? worldHit.t : 200;
    let best: ReturnType<Hittable['raycast']> = null;
    for (const h of hittables) {
      const r = h.raycast(origin, dir, bestT);
      if (r) { best = r; bestT = r.t; }
    }
    let end: THREE.Vector3;
    if (best) {
      end = best.point;
      const killed = best.apply(w.damage, dir, 'kinetic');
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
    this.fx.muzzleFlash(this.muzzleWorld, w.id === 'cap');
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
  dir.multiplyScalar(Math.cos(theta)).addScaledVector(ortho1, Math.sin(theta) * Math.cos(phi)).addScaledVector(ortho2, Math.sin(theta) * Math.sin(phi)).normalize();
}

// ---------------------------------------------------------------- FX pool

interface Tracer { line: THREE.Line; life: number }
interface Spark { mesh: THREE.Mesh; life: number }
interface Fleck { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }
interface Flame { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; max: number }

const FLECK_GEO = new THREE.BoxGeometry(0.06, 0.04, 0.05);
const FLAME_GEO = new THREE.SphereGeometry(0.14, 7, 5);

export class Fx {
  private scene: THREE.Scene;
  private tracers: Tracer[] = [];
  private sparks: Spark[] = [];
  private flecks: Fleck[] = [];
  private flames: Flame[] = [];
  private flash: THREE.PointLight;
  private flashLife = 0;
  private sparkGeo = new THREE.SphereGeometry(0.045, 6, 5);
  private flameMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.flash = new THREE.PointLight(0xffd9a0, 0, 4, 2);
    scene.add(this.flash);
    this.flameMat = new THREE.MeshBasicMaterial({ color: 0xffa030, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
  }

  tracer(from: THREE.Vector3, to: THREE.Vector3, color: number): void {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.Line(geo, m);
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

  /** "Little flecks of plastic fly off" — the SH hit feedback. */
  plasticFlecks(at: THREE.Vector3, color: number, count = 5): void {
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(FLECK_GEO, new THREE.MeshStandardMaterial({ color, roughness: 0.4 }));
      m.position.copy(at);
      m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      this.scene.add(m);
      this.flecks.push({ mesh: m, vel: new THREE.Vector3((Math.random() - 0.5) * 4, 1.5 + Math.random() * 2.5, (Math.random() - 0.5) * 4), life: 0.9 + Math.random() * 0.5 });
    }
  }

  flame(from: THREE.Vector3, dir: THREE.Vector3): void {
    const m = new THREE.Mesh(FLAME_GEO, this.flameMat);
    m.position.copy(from);
    const spread = 0.22;
    const vel = dir.clone().multiplyScalar(9 + Math.random() * 3).add(new THREE.Vector3((Math.random() - 0.5) * spread * 8, (Math.random() - 0.2) * spread * 6, (Math.random() - 0.5) * spread * 8));
    this.scene.add(m);
    this.flames.push({ mesh: m, vel, life: 0, max: 0.42 + Math.random() * 0.15 });
  }

  update(dt: number): void {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      (t.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, t.life / 0.07) * 0.9;
      if (t.life <= 0) { this.scene.remove(t.line); t.line.geometry.dispose(); (t.line.material as THREE.Material).dispose(); this.tracers.splice(i, 1); }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      const k = Math.max(0, s.life / 0.14);
      s.mesh.scale.setScalar(1 + (1 - k) * 2.5);
      (s.mesh.material as THREE.MeshBasicMaterial).opacity = k;
      if (s.life <= 0) { this.scene.remove(s.mesh); (s.mesh.material as THREE.Material).dispose(); this.sparks.splice(i, 1); }
    }
    for (let i = this.flecks.length - 1; i >= 0; i--) {
      const f = this.flecks[i];
      f.life -= dt;
      f.vel.y -= 19.6 * dt;
      f.mesh.position.addScaledVector(f.vel, dt);
      f.mesh.rotation.x += 12 * dt;
      f.mesh.rotation.z += 9 * dt;
      if (f.life < 0.3) f.mesh.scale.setScalar(Math.max(0.01, f.life / 0.3));
      if (f.life <= 0) { this.scene.remove(f.mesh); (f.mesh.material as THREE.Material).dispose(); this.flecks.splice(i, 1); }
    }
    for (let i = this.flames.length - 1; i >= 0; i--) {
      const f = this.flames[i];
      f.life += dt;
      const k = f.life / f.max;
      f.vel.y += 6 * dt; // heat rises
      f.vel.multiplyScalar(1 - 3 * dt);
      f.mesh.position.addScaledVector(f.vel, dt);
      f.mesh.scale.setScalar(0.5 + k * 2.4);
      if (f.life >= f.max) { this.scene.remove(f.mesh); this.flames.splice(i, 1); }
    }
    if (this.flashLife > 0) {
      this.flashLife -= dt;
      if (this.flashLife <= 0) this.flash.intensity = 0;
    }
  }
}

export type { HitApply };
