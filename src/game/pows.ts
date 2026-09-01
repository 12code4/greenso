// POWs: comrades glued to the spot (Tan doctrine: a tube of model cement).
// Hold E to free them. Freed named POWs take an overwatch post and fight —
// invincible by rule (escort tedium is banned).

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { PowDef } from '../maps/runtime/types';
import { SoldierModel } from './soldier';
import { EnemyManager } from './enemies';
import { Fx } from './weapons';
import { mat } from '../maps/kit/materials';
import { v3, yawToward, dampAngle } from '../core/math';

const FREE_TIME = 1.6;
const REACH = 2.2;

interface Pow {
  def: PowDef;
  model: SoldierModel;
  glue: THREE.Group;
  freed: boolean;
  progress: number;
  fireT: number;
  yaw: number;
}

export interface PowHooks {
  sfx(name: string, at: THREE.Vector3): void;
  onFreed(id: string, name: string): void;
}

export class PowSystem {
  pows: Pow[] = [];
  private fx: Fx;
  private hooks: PowHooks;
  private tickT = 0;

  constructor(defs: PowDef[], scene: THREE.Scene, hooks: PowHooks) {
    this.hooks = hooks;
    this.fx = new Fx(scene);
    for (const def of defs) {
      const model = new SoldierModel({ team: 'green' });
      model.setPose('glued');
      model.root.position.copy(v3(def.at));
      model.root.rotation.y = def.yaw ?? 0;
      model.attachTo(scene);
      // Glue blobs around the feet
      const glue = new THREE.Group();
      const gm = mat('PLASTIC_TOY', 0xf4f2ea, { emissive: 0x222218 });
      for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.14 + Math.random() * 0.1, 10, 8), gm);
        const a = (i / 6) * Math.PI * 2;
        b.position.set(Math.cos(a) * 0.32, 0.06, Math.sin(a) * 0.32);
        b.scale.y = 0.45;
        glue.add(b);
      }
      glue.position.copy(model.root.position);
      scene.add(glue);
      this.pows.push({ def, model, glue, freed: false, progress: 0, fireT: 1, yaw: def.yaw ?? 0 });
    }
  }

  isFreed(id: string): boolean {
    return !!this.pows.find((p) => p.def.id === id)?.freed;
  }

  /** Returns the interact prompt to show, if any. */
  update(dt: number, playerPos: THREE.Vector3, holdingE: boolean): { text: string; progress: number } | null {
    let prompt: { text: string; progress: number } | null = null;
    for (const p of this.pows) {
      p.model.update(dt);
      if (p.freed) continue;
      const d = p.model.root.position.distanceTo(playerPos);
      if (d < REACH) {
        if (holdingE) {
          p.progress += dt / FREE_TIME;
          this.tickT -= dt;
          if (this.tickT <= 0) {
            this.tickT = 0.2;
            this.hooks.sfx('interact_tick', p.model.root.position);
          }
          if (p.progress >= 1) {
            p.freed = true;
            p.glue.visible = false;
            p.model.setPose('aim');
            this.hooks.sfx('unglue', p.model.root.position);
            this.hooks.onFreed(p.def.id, p.def.name);
            continue;
          }
        } else {
          p.progress = Math.max(0, p.progress - dt * 0.6);
        }
        prompt = { text: `HOLD E — FREE ${p.def.name.toUpperCase()}`, progress: p.progress };
      } else {
        p.progress = Math.max(0, p.progress - dt * 0.6);
      }
    }
    this.fx.update(dt);
    return prompt;
  }

  /** Freed named POWs fight from their post: rubber-band shots at Tans in view. */
  overwatch(dt: number, enemies: EnemyManager, world: CollisionWorld): void {
    for (const p of this.pows) {
      if (!p.freed) continue;
      p.fireT -= dt;
      const from = p.model.root.position.clone();
      from.y += 0.9;
      // Nearest visible enemy within 45 u
      let best: { pos: THREE.Vector3; apply: (dmg: number, dir: THREE.Vector3) => boolean } | null = null;
      let bestD = 45;
      for (const e of enemies.list) {
        if (!e.alive) continue;
        const d = e.pos.distanceTo(from);
        if (d > bestD) continue;
        const target = e.pos.clone();
        target.y += 0.5;
        const dir = target.clone().sub(from).normalize();
        if (world.raycast(from, dir, d - 0.5)) continue;
        bestD = d;
        best = { pos: target, apply: (dmg, dd) => enemies.damage(e, dmg, dd) };
      }
      if (best) {
        p.yaw = dampAngle(p.yaw, yawToward(p.model.root.position, best.pos), 6, dt);
        p.model.root.rotation.y = p.yaw;
        if (p.fireT <= 0) {
          p.fireT = 2.4;
          const dir = best.pos.clone().sub(from).normalize();
          best.apply(26, dir);
          this.fx.tracer(from, best.pos, 0xd9c26b);
          this.fx.hitSpark(best.pos, 0xd9b98c);
          this.hooks.sfx('band', from);
        }
      }
    }
  }
}
