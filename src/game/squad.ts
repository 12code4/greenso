// Pvt. Sprout — the squadmate (Update 4 HEROES & CONTENT). Follows at your
// shoulder, shoots what you shoot at, shouts too much. Invincible by rule
// (escort tedium is banned, docs/02) — he's there for company and comedy.

import * as THREE from 'three';
import { SoldierModel } from './soldier';
import { EnemyManager } from './enemies';
import { Fx } from './weapons';
import { CollisionWorld } from '../sim/collision';
import { SPROUT_BARKS } from './barks';
import { damp, dampAngle, pick, rand, yawToward } from '../core/math';

export interface SquadHooks {
  sfx(name: string, at: THREE.Vector3): void;
  bark(text: string): void;
}

export class Squadmate {
  name = 'Pvt. Sprout';
  active = false;
  pos = new THREE.Vector3();
  model: SoldierModel;
  private yaw = 0;
  private fx: Fx;
  private hooks: SquadHooks;
  private fireT = 1;
  private barkT = rand(5, 9);
  private tmp = new THREE.Vector3();

  constructor(scene: THREE.Scene, hooks: SquadHooks) {
    this.hooks = hooks;
    this.fx = new Fx(scene);
    this.model = new SoldierModel({ team: 'green' });
    this.model.root.visible = false;
    this.model.attachTo(scene);
  }

  join(at: THREE.Vector3): void {
    this.active = true;
    this.pos.copy(at);
    this.model.root.visible = true;
    this.model.root.position.copy(at);
    this.hooks.bark(pick(SPROUT_BARKS.join));
  }

  onPlayerDeath(): void {
    if (this.active && Math.random() < 0.8) this.hooks.bark(pick(SPROUT_BARKS.down));
  }

  update(dt: number, player: { pos: THREE.Vector3; alive: boolean }, camYaw: number, enemies: EnemyManager, world: CollisionWorld): void {
    if (!this.active) return;
    // Follow point: behind-left of the player, camera-relative
    const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
    const target = this.tmp.set(player.pos.x - fx * 1.7 - (-fz) * 1.1, player.pos.y, player.pos.z - fz * 1.7 - fx * 1.1);
    const dx = target.x - this.pos.x, dz = target.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    const far = Math.hypot(player.pos.x - this.pos.x, player.pos.z - this.pos.z);
    let moving = false;
    if (far > 12 || Math.abs(player.pos.y - this.pos.y) > 2.5) {
      // Lost him (or a tier): catch up off-screen, like a toy being moved by hand
      this.pos.copy(target);
    } else if (d > 0.5) {
      const speed = d > 4 ? 7.2 : 4.4;
      const step = Math.min(d, speed * dt);
      const nx = dx / d, nz = dz / d;
      // Don't walk into props: probe ahead at knee height, slide if blocked
      const from = this.pos.clone(); from.y += 0.45;
      const dir = new THREE.Vector3(nx, 0, nz);
      if (world.raycast(from, dir, step + 0.3)) {
        const side = new THREE.Vector3(-nz, 0, nx);
        if (!world.raycast(from, side, step + 0.3)) this.pos.addScaledVector(side, step);
      } else {
        this.pos.x += nx * step; this.pos.z += nz * step;
      }
      this.yaw = dampAngle(this.yaw, Math.atan2(-nx, -nz), 10, dt);
      moving = true;
    }
    this.pos.y = damp(this.pos.y, player.pos.y, 10, dt);

    // Shoot what's shooting at the Sarge: nearest visible Tan within 22 u
    this.fireT -= dt;
    const from = this.pos.clone(); from.y += 0.9;
    let best: { e: (typeof enemies.list)[number]; at: THREE.Vector3 } | null = null;
    let bestD = 22;
    for (const e of enemies.list) {
      if (!e.alive || e.state === 'idle') continue;
      const dd = e.pos.distanceTo(from);
      if (dd > bestD) continue;
      const at = e.pos.clone(); at.y += 0.5;
      const dir = at.clone().sub(from).normalize();
      if (world.raycast(from, dir, dd - 0.5)) continue;
      bestD = dd; best = { e, at };
    }
    if (best && !moving) this.yaw = dampAngle(this.yaw, yawToward(this.pos, best.at), 8, dt);
    if (best && this.fireT <= 0 && player.alive) {
      this.fireT = rand(0.7, 1.1);
      const dir = best.at.clone().sub(from).normalize();
      const killed = enemies.damage(best.e, 7, dir, 'kinetic', best.at);
      this.fx.tracer(from, best.at, 0xffe0a0);
      this.fx.muzzleFlash(from, false);
      this.hooks.sfx('rifle', from);
      if (killed && Math.random() < 0.7) this.hooks.bark(pick(SPROUT_BARKS.kill));
    }

    // Chatter
    this.barkT -= dt;
    if (this.barkT <= 0) {
      this.barkT = best ? rand(4, 7) : rand(12, 24);
      this.hooks.bark(pick(best ? SPROUT_BARKS.combat : SPROUT_BARKS.idle));
    }

    this.model.animateLocomotion(dt, moving, !!best);
    this.model.root.position.copy(this.pos);
    this.model.root.rotation.y = this.yaw;
    this.fx.update(dt);
  }
}
