// Breakables: props you can shoot for a gag or a secret (the piggy bank, docs/11 #50).
// A Hittable of spheres; on the killing hit the mesh disappears and the hook fires.

import * as THREE from 'three';
import { HitApply, Hittable } from './projectiles';

export interface BreakableDef {
  id: string;
  at: THREE.Vector3;
  radius: number;
  hp: number;
  object?: THREE.Object3D | null;
}

interface Item extends BreakableDef {
  hpLeft: number;
  broken: boolean;
}

export class Breakables implements Hittable {
  items: Item[] = [];
  onBreak: ((id: string, at: THREE.Vector3) => void) | null = null;
  onHit: ((id: string, at: THREE.Vector3) => void) | null = null;

  add(def: BreakableDef): void {
    this.items.push({ ...def, hpLeft: def.hp, broken: false });
  }

  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxT: number): { point: THREE.Vector3; t: number; apply: HitApply } | null {
    let best: { point: THREE.Vector3; t: number; apply: HitApply } | null = null;
    for (const it of this.items) {
      if (it.broken) continue;
      const oc = origin.clone().sub(it.at);
      const b = oc.dot(dir);
      const c = oc.dot(oc) - it.radius * it.radius;
      const disc = b * b - c;
      if (disc < 0) continue;
      const t = -b - Math.sqrt(disc);
      if (t < 0 || t > maxT) continue;
      if (!best || t < best.t) {
        const point = origin.clone().addScaledVector(dir, t);
        const apply: HitApply = (damage) => {
          it.hpLeft -= damage;
          if (this.onHit) this.onHit(it.id, point);
          if (it.hpLeft <= 0 && !it.broken) {
            it.broken = true;
            if (it.object) it.object.visible = false;
            if (this.onBreak) this.onBreak(it.id, it.at);
            return true;
          }
          return false;
        };
        best = { point, t, apply };
      }
    }
    return best;
  }

  bestAssistPoint(): THREE.Vector3 | null {
    return null;
  }
}
