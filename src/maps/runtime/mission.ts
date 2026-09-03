// Mission FSM: a sequential objective chain (docs/06 §3). Each objective
// completes on a world condition; completions advance the chain and fire
// Olive's radio lines. Encounter/platform triggers key off objective starts.

import * as THREE from 'three';
import { MissionDef, ObjectiveDef } from './types';
import { RegionSystem } from './regions';
import { EncounterDirector } from './director';

export interface MissionHooks {
  radio(text: string): void;
  objective(text: string): void;
  onObjectiveStart(id: string): void;
  onObjectiveDone(id: string): void;
  onComplete(): void;
  sfx(name: string): void;
}

export interface MissionWorld {
  playerPos: THREE.Vector3;
  regions: RegionSystem;
  director: EncounterDirector;
  isFreed(powId: string): boolean;
  /** `use` objectives: has this interactable fired? */
  isUsed?(id: string): boolean;
  /** `pickup` objectives: does the player hold this flag/kind? */
  hasFlag?(flag: string): boolean;
}

export class MissionFSM {
  def: MissionDef;
  index = -1;
  complete = false;
  elapsed = 0;
  powsFreed = 0;
  private hooks: MissionHooks;
  private startDelay = 0;
  private waitT = 0;

  constructor(def: MissionDef, hooks: MissionHooks) {
    this.def = def;
    this.hooks = hooks;
  }

  get active(): ObjectiveDef | null {
    return this.index >= 0 && this.index < this.def.objectives.length ? this.def.objectives[this.index] : null;
  }

  start(): void {
    this.advance();
  }

  private advance(): void {
    this.index++;
    const o = this.active;
    if (!o) {
      this.complete = true;
      this.hooks.objective('');
      this.hooks.sfx('victory');
      this.hooks.onComplete();
      return;
    }
    this.hooks.objective(o.text);
    if (o.radio) this.hooks.radio(o.radio);
    this.waitT = o.kind === 'wait' ? (o.seconds ?? 5) : 0;
    this.hooks.onObjectiveStart(o.id);
  }

  update(dt: number, w: MissionWorld): void {
    if (this.complete) return;
    this.elapsed += dt;
    if (this.startDelay > 0) {
      this.startDelay -= dt;
      if (this.startDelay <= 0) this.advance();
      return;
    }
    const o = this.active;
    if (!o) return;
    let done = false;
    switch (o.kind) {
      case 'reach':
      case 'discover':
      case 'ride':
        done = w.regions.inRegion(w.playerPos, o.target);
        break;
      case 'clear':
        done = w.director.isCleared(o.target);
        break;
      case 'rescue':
        done = w.isFreed(o.target);
        if (done) this.powsFreed++;
        break;
      case 'use':
        done = !!w.isUsed?.(o.target);
        break;
      case 'pickup':
        done = !!w.hasFlag?.(o.target);
        break;
      case 'wait':
        this.waitT -= dt;
        done = this.waitT <= 0;
        break;
    }
    if (done) {
      this.hooks.sfx('objective');
      this.hooks.onObjectiveDone(o.id);
      if (o.radioDone) this.hooks.radio(o.radioDone);
      // Brief beat before the next objective lands
      this.startDelay = o.radioDone ? 2.2 : 0.3;
    }
  }
}
