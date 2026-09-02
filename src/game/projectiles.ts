// Projectiles: grenades (player + grenadiers), rubber-band sniper rounds,
// bazooka rockets. Manual ballistics against the collision world.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { mat } from '../maps/kit/materials';
import { Team } from './soldier';

/** How a hit was dealt: decides melt vs. shatter and flecks. */
export type DamageKind = 'kinetic' | 'fire' | 'blast';

export interface HitApply {
  (damage: number, dir: THREE.Vector3, kind?: DamageKind): boolean;
}

export interface Hittable {
  /** Nearest hittable along the ray before maxT. */
  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxT: number): { point: THREE.Vector3; t: number; apply: HitApply } | null;
  /** Best aim-assist point inside the cone, or null. */
  bestAssistPoint(origin: THREE.Vector3, dir: THREE.Vector3, coneRad: number, maxDist: number, world: CollisionWorld): THREE.Vector3 | null;
  /** Everything inside a cone with clear line of sight (flamethrower). Optional. */
  cone?(origin: THREE.Vector3, dir: THREE.Vector3, range: number, halfAngleRad: number, world: CollisionWorld): HitApply[];
}

export interface ProjectileHooks {
  explode(at: THREE.Vector3, radius: number, damage: number, team: Team): void;
  sfx(name: string, at: THREE.Vector3): void;
}

interface Grenade { mesh: THREE.Mesh; pos: THREE.Vector3; vel: THREE.Vector3; fuse: number; team: Team; rest: boolean; spin: number }
interface Band { mesh: THREE.Mesh; pos: THREE.Vector3; vel: THREE.Vector3; damage: number; life: number }
interface Rocket { mesh: THREE.Group; pos: THREE.Vector3; vel: THREE.Vector3; life: number; team: Team; smokeT: number }
interface Burst { mesh: THREE.Mesh; light: THREE.PointLight; life: number }
interface Puff { mesh: THREE.Mesh; life: number; max: number; rise: number }

const GRENADE_GEO = new THREE.SphereGeometry(0.13, 10, 8);
const BAND_GEO = new THREE.TorusGeometry(0.12, 0.025, 6, 14);
const PUFF_GEO = new THREE.SphereGeometry(0.16, 8, 6);

export class Projectiles {
  private grenades: Grenade[] = [];
  private bands: Band[] = [];
  private rockets: Rocket[] = [];
  private bursts: Burst[] = [];
  private puffs: Puff[] = [];
  private scene: THREE.Scene;
  private hooks: ProjectileHooks;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();

  constructor(scene: THREE.Scene, hooks: ProjectileHooks) {
    this.scene = scene;
    this.hooks = hooks;
  }

  spawnGrenade(pos: THREE.Vector3, vel: THREE.Vector3, fuse: number, team: Team): void {
    const mesh = new THREE.Mesh(GRENADE_GEO, (mat('PLASTIC_TOY', team === 'green' ? 0x2f5c28 : 0x8a7350) as THREE.Material).clone());
    mesh.castShadow = true;
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.grenades.push({ mesh, pos: pos.clone(), vel: vel.clone(), fuse, team, rest: false, spin: 0 });
  }

  spawnBand(pos: THREE.Vector3, vel: THREE.Vector3, damage: number): void {
    const mesh = new THREE.Mesh(BAND_GEO, mat('RUBBER_MATTE', 0xd9c26b));
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.bands.push({ mesh, pos: pos.clone(), vel: vel.clone(), damage, life: 2.5 });
  }

  /** Matchstick rocket: fast, nearly straight, explodes on anything. */
  spawnRocket(pos: THREE.Vector3, dir: THREE.Vector3, team: Team): void {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8), mat('WOOD_WARM', 0xe8d9b0));
    body.rotation.x = Math.PI / 2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mat('PLASTIC_TOY', 0xc93a3a));
    head.position.z = -0.3;
    const fins = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.14), mat('PAPERBOARD', 0xf4e2b0));
    fins.position.z = 0.22;
    g.add(body, head, fins);
    g.position.copy(pos);
    g.lookAt(pos.clone().add(dir));
    this.scene.add(g);
    this.rockets.push({ mesh: g, pos: pos.clone(), vel: dir.clone().multiplyScalar(30), life: 3.5, team, smokeT: 0 });
    this.hooks.sfx('rocket', pos);
  }

  update(dt: number, world: CollisionWorld, hittables: Hittable[]): void {
    this.updateGrenades(dt, world);
    this.updateBands(dt, world, hittables);
    this.updateRockets(dt, world, hittables);
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const bu = this.bursts[i];
      bu.life -= dt;
      const k = Math.max(0, bu.life / 0.45);
      bu.mesh.scale.setScalar(1 + (1 - k) * 3.2);
      (bu.mesh.material as THREE.MeshBasicMaterial).opacity = k * 0.9;
      bu.light.intensity = k * 8;
      if (bu.life <= 0) {
        this.scene.remove(bu.mesh, bu.light);
        (bu.mesh.material as THREE.Material).dispose();
        this.bursts.splice(i, 1);
      }
    }
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.life -= dt;
      const k = Math.max(0, p.life / p.max);
      p.mesh.position.y += p.rise * dt;
      p.mesh.scale.setScalar(0.6 + (1 - k) * 1.8);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = k * 0.45;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.puffs.splice(i, 1);
      }
    }
  }

  private puff(at: THREE.Vector3, color: number, max = 0.9, rise = 0.6): void {
    const m = new THREE.Mesh(PUFF_GEO, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, depthWrite: false }));
    m.position.copy(at);
    this.scene.add(m);
    this.puffs.push({ mesh: m, life: max, max, rise });
  }

  private updateGrenades(dt: number, world: CollisionWorld): void {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.fuse -= dt;
      if (!g.rest) {
        g.vel.y -= 19.6 * dt;
        const step = this.tmp.copy(g.vel).multiplyScalar(dt);
        const len = step.length();
        if (len > 1e-5) {
          const dir = this.tmp2.copy(step).divideScalar(len);
          const hit = world.raycast(g.pos, dir, len + 0.13);
          if (hit) {
            const n = hit.normal;
            const vn = g.vel.dot(n);
            g.vel.addScaledVector(n, -vn * 1.35);
            g.vel.multiplyScalar(0.72);
            g.pos.copy(hit.point).addScaledVector(n, 0.14);
            if (Math.abs(vn) > 1.5) this.hooks.sfx('bounce', g.pos);
            if (g.vel.length() < 0.6 && n.y > 0.5) {
              g.rest = true;
              g.vel.set(0, 0, 0);
            }
          } else {
            g.pos.add(step);
          }
        }
        if (g.pos.y < -5) g.fuse = 0;
        g.spin += g.vel.length() * dt * 4;
        g.mesh.rotation.x = g.spin;
      }
      g.mesh.position.copy(g.pos);
      (g.mesh.material as THREE.MeshPhysicalMaterial).emissive.setHex(g.fuse < 0.6 && Math.sin(g.fuse * 40) > 0 ? 0xff3300 : 0x000000);
      if (g.fuse <= 0) {
        this.explode(g.pos, g.team, 3.4, 70);
        this.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
      }
    }
  }

  private updateBands(dt: number, world: CollisionWorld, hittables: Hittable[]): void {
    for (let i = this.bands.length - 1; i >= 0; i--) {
      const b = this.bands[i];
      b.life -= dt;
      b.vel.y -= 6 * dt;
      const step = this.tmp.copy(b.vel).multiplyScalar(dt);
      const len = step.length();
      const dir = this.tmp2.copy(step).divideScalar(Math.max(1e-6, len));
      let bestT = len;
      let best: ReturnType<Hittable['raycast']> = null;
      for (const h of hittables) {
        const r = h.raycast(b.pos, dir, bestT);
        if (r) { best = r; bestT = r.t; }
      }
      const wh = world.raycast(b.pos, dir, bestT);
      if (wh && (!best || wh.t < best.t)) {
        b.mesh.position.copy(wh.point).addScaledVector(wh.normal, 0.02);
        b.mesh.lookAt(b.mesh.position.clone().add(wh.normal));
        this.hooks.sfx('clack', wh.point);
        this.bands.splice(i, 1);
        continue;
      }
      if (best) {
        best.apply(b.damage, dir, 'kinetic');
        this.scene.remove(b.mesh);
        this.bands.splice(i, 1);
        continue;
      }
      b.pos.add(step);
      b.mesh.position.copy(b.pos);
      b.mesh.lookAt(b.pos.clone().add(dir));
      b.mesh.rotation.z += dt * 30;
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.bands.splice(i, 1);
      }
    }
  }

  private updateRockets(dt: number, world: CollisionWorld, hittables: Hittable[]): void {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.life -= dt;
      r.vel.y -= 2.5 * dt;
      const step = this.tmp.copy(r.vel).multiplyScalar(dt);
      const len = step.length();
      const dir = this.tmp2.copy(step).divideScalar(Math.max(1e-6, len));
      let hitT = len + 0.2;
      let hitAny = false;
      for (const h of hittables) {
        const hr = h.raycast(r.pos, dir, hitT);
        if (hr) { hitT = hr.t; hitAny = true; }
      }
      const wh = world.raycast(r.pos, dir, hitT);
      if (wh) { hitT = wh.t; hitAny = true; }
      if (hitAny || r.life <= 0 || r.pos.y < -5) {
        const at = r.pos.clone().addScaledVector(dir, Math.max(0, hitT - 0.1));
        this.explode(at, r.team, 4.2, 95);
        this.scene.remove(r.mesh);
        this.rockets.splice(i, 1);
        continue;
      }
      r.pos.add(step);
      r.mesh.position.copy(r.pos);
      r.mesh.lookAt(r.pos.clone().add(dir));
      r.smokeT -= dt;
      if (r.smokeT <= 0) {
        r.smokeT = 0.03;
        this.puff(r.pos.clone().addScaledVector(dir, -0.3), 0xd8d0c4, 0.7, 0.4);
      }
    }
  }

  private explode(at: THREE.Vector3, team: Team, radius: number, damage: number): void {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    mesh.position.copy(at);
    const light = new THREE.PointLight(0xffa040, 8, 12, 2);
    light.position.copy(at).add(new THREE.Vector3(0, 0.5, 0));
    this.scene.add(mesh, light);
    this.bursts.push({ mesh, light, life: 0.45 });
    for (let i = 0; i < 5; i++) this.puff(at.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.2, Math.random() * 0.8, (Math.random() - 0.5) * 1.2)), 0x555049, 1.6, 1.1);
    this.hooks.sfx('explode', at);
    this.hooks.explode(at, radius, damage, team);
  }

  /** Sampled arc for the throw preview. */
  static arc(origin: THREE.Vector3, vel: THREE.Vector3, world: CollisionWorld, out: THREE.Vector3[]): void {
    out.length = 0;
    const p = origin.clone();
    const v = vel.clone();
    const dt = 0.05;
    for (let i = 0; i < 40; i++) {
      out.push(p.clone());
      v.y -= 19.6 * dt;
      const step = v.clone().multiplyScalar(dt);
      const len = step.length();
      const hit = world.raycast(p, step.clone().divideScalar(len), len);
      if (hit) {
        out.push(hit.point.clone());
        break;
      }
      p.add(step);
    }
  }
}
