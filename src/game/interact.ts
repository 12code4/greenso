// Hold-E interactables (Update 4 HEROES & CONTENT): battery-crate sabotage
// (secondary objective) and the bottle-rocket launch (a second route up).
// Same hold/prompt grammar as freeing a POW.

import * as THREE from 'three';
import { InteractableDef } from '../maps/runtime/types';
import { v3 } from '../core/math';

interface Item {
  def: InteractableDef;
  pos: THREE.Vector3;
  ring: THREE.Mesh;
  done: boolean;
  progress: number;
}

export interface InteractHooks {
  sfx(name: string, at: THREE.Vector3): void;
  onSabotage(id: string, count: number, total: number): void;
  onLaunch(to: THREE.Vector3, flightTime: number): void;
  /** Generic use: the id fired; `grants` already applied to `flags`. */
  onUse(id: string, grants: string | undefined): void;
  onWarp(to: THREE.Vector3): void;
  /** WorldState flags (string, ball, bridge …) for `requires`. */
  hasFlag(flag: string): boolean;
  setFlag(flag: string): void;
}

const REACH = 2.3;

export class InteractSystem {
  items: Item[] = [];
  sabotaged = 0;
  sabotageTotal = 0;
  /** ids of `use` interactables that fired (mission objectives of kind `use` read this). */
  used = new Set<string>();
  private hooks: InteractHooks;
  private tickT = 0;

  constructor(defs: InteractableDef[], scene: THREE.Scene, hooks: InteractHooks) {
    this.hooks = hooks;
    for (const def of defs) {
      const pos = v3(def.at);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.42, 0.55, 24),
        new THREE.MeshBasicMaterial({ color: def.kind === 'launch' ? 0xff9a3a : def.kind === 'warp' ? 0x9ad0f0 : 0xf2d86a, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos.x, pos.y + 0.03, pos.z);
      scene.add(ring);
      this.items.push({ def, pos, ring, done: false, progress: 0 });
      if (def.kind === 'sabotage') this.sabotageTotal++;
    }
  }

  /** Scripts and tests: fire an interactable by id as if held. */
  trigger(id: string): boolean {
    const it = this.items.find((x) => x.def.id === id && !x.done);
    if (!it) return false;
    this.complete(it);
    return true;
  }

  private complete(it: Item): void {
    it.done = true;
    it.ring.visible = false;
    if (it.def.kind === 'sabotage') {
      this.sabotaged++;
      this.hooks.sfx('unglue', it.pos);
      this.hooks.onSabotage(it.def.id, this.sabotaged, this.sabotageTotal);
    } else if (it.def.kind === 'launch') {
      it.done = false; // reusable: a launch pad can be pressed again
      it.progress = 0;
      it.ring.visible = true;
      this.hooks.onLaunch(v3(it.def.to), it.def.flightTime ?? 1.8);
    } else if (it.def.kind === 'warp') {
      it.done = false; // reusable
      it.progress = 0;
      it.ring.visible = true;
      this.hooks.sfx('unglue', it.pos);
      this.hooks.onWarp(v3(it.def.to));
    } else {
      if (it.def.grants) this.hooks.setFlag(it.def.grants);
      this.used.add(it.def.id);
      this.hooks.sfx('unglue', it.pos);
      this.hooks.onUse(it.def.id, it.def.grants);
      if (!it.def.once) { it.done = false; it.progress = 0; it.ring.visible = true; }
    }
  }

  /** Returns the interact prompt to show, if any. */
  update(dt: number, time: number, playerPos: THREE.Vector3, holdingE: boolean): { text: string; progress: number } | null {
    let prompt: { text: string; progress: number } | null = null;
    for (const it of this.items) {
      if (it.done) continue;
      const k = 1 + 0.12 * Math.sin(time * 4 + it.pos.x);
      it.ring.scale.set(k, k, 1);
      const d = it.pos.distanceTo(playerPos);
      if (d < REACH && !prompt) {
        const hold = it.def.hold ?? (it.def.kind === 'launch' ? 1.0 : 1.4);
        const locked = it.def.kind === 'use' && !!it.def.requires && !this.hooks.hasFlag(it.def.requires);
        if (locked) {
          prompt = { text: (it.def.kind === 'use' ? it.def.lockedPrompt : undefined) ?? it.def.prompt, progress: 0 };
          continue;
        }
        if (holdingE) {
          it.progress += dt / hold;
          this.tickT -= dt;
          if (this.tickT <= 0) { this.tickT = 0.2; this.hooks.sfx('interact_tick', it.pos); }
          if (it.progress >= 1) {
            this.complete(it);
            continue;
          }
        } else {
          it.progress = Math.max(0, it.progress - dt * 0.6);
        }
        prompt = { text: it.def.prompt, progress: it.progress };
      } else {
        it.progress = Math.max(0, it.progress - dt * 0.6);
      }
    }
    return prompt;
  }
}
