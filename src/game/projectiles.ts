// Projectiles: grenades (player + grenadiers) and rubber-band sniper rounds.
// Manual ballistics against the collision world; no physics engine.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { mat } from '../maps/kit/materials';
import { Team } from './soldier';

export interface Hittable {
  /** Nearest hittable along the ray before maxT. */
  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxT: number): { point: THREE.Vector3; t: number; apply: (damage: number, dir: THREE.Vector3) => boolean } | null;
  /** Best aim-assist point inside the cone, or null. */
  bestAssistPoint(origin: THREE.Vector3, dir: THREE.Vector3, coneRad: number, maxDist: number, world: CollisionWorld): THREE.Vector3 | null;
}

export interface ProjectileHooks {
  explode(at: THREE.Vector3, radius: number, damage: number, team: Team): void;
  sfx(name: string, at: THREE.Vector3): void;
}

interface Grenade {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  fuse: number;
  team: Team;
  rest: boolean;
  spin: number;
}

interface Band {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  damage: number;
  life: number;
}

interface Burst {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  life: number;
}

const GRENADE_GEO = new THREE.SphereGeometry(0.13, 10, 8);
const BAND_GEO = new THREE.TorusGeometry(0.12, 0.025, 6, 14);

export class Projectiles {
  private grenades: Grenade[] = [];
  private bands: Band[] = [];
  private bursts: Burst[] = [];
  private scene: THREE.Scene;
  private hooks: ProjectileHooks;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();

  constructor(scene: THREE.Scene, hooks: ProjectileHooks) {
    this.scene = scene;
    this.hooks = hooks;
  }

  spawnGrenade(pos: THREE.Vector3, vel: THREE.Vector3, fuse: number, team: Team): void {
    const mesh = new THREE.Mesh(GRENADE_GEO, mat('PLASTIC_TOY', team === 'green' ? 0x2f5c28 : 0x8a7350));
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

  update(dt: number, world: CollisionWorld, hittables: Hittable[]): void {
    // ---- Grenades
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
            // Reflect with restitution + friction; rest when slow
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
      // Fuse warning blink
      (g.mesh.material as THREE.MeshPhysicalMaterial).emissive.setHex(g.fuse < 0.6 && Math.sin(g.fuse * 40) > 0 ? 0xff3300 : 0x000000);
      if (g.fuse <= 0) {
        this.explode(g.pos, g.team);
        this.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
      }
    }

    // ---- Rubber bands: fast, slight drop, stick to the world
    for (let i = this.bands.length - 1; i >= 0; i--) {
      const b = this.bands[i];
      b.life -= dt;
      b.vel.y -= 6 * dt;
      const step = this.tmp.copy(b.vel).multiplyScalar(dt);
      const len = step.length();
      const dir = this.tmp2.copy(step).divideScalar(Math.max(1e-6, len));
      let consumed = false;
      // Hittables first (enemies), then world
      let bestT = len;
      let best: ReturnType<Hittable['raycast']> = null;
      for (const h of hittables) {
        const r = h.raycast(b.pos, dir, bestT);
        if (r) { best = r; bestT = r.t; }
      }
      const wh = world.raycast(b.pos, dir, bestT);
      if (wh && (!best || wh.t < best.t)) {
        // Stick to the surface (pinned)
        b.mesh.position.copy(wh.point).addScaledVector(wh.normal, 0.02);
        b.mesh.lookAt(b.mesh.position.clone().add(wh.normal));
        this.hooks.sfx('clack', wh.point);
        this.bands.splice(i, 1);
        consumed = true;
      } else if (best) {
        best.apply(b.damage, dir);
        this.scene.remove(b.mesh);
        this.bands.splice(i, 1);
        consumed = true;
      }
      if (consumed) continue;
      b.pos.add(step);
      b.mesh.position.copy(b.pos);
      b.mesh.lookAt(b.pos.clone().add(dir));
      b.mesh.rotation.z += dt * 30;
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.bands.splice(i, 1);
      }
    }

    // ---- Bursts fade
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
  }

  private explode(at: THREE.Vector3, team: Team): void {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    mesh.position.copy(at);
    const light = new THREE.PointLight(0xffa040, 8, 12, 2);
    light.position.copy(at).add(new THREE.Vector3(0, 0.5, 0));
    this.scene.add(mesh, light);
    this.bursts.push({ mesh, light, life: 0.45 });
    this.hooks.sfx('explode', at);
    this.hooks.explode(at, 3.4, 70, team);
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
