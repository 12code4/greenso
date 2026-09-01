// Encounter director (docs/06 §4): activates encounter instances on
// region-enter / objective / manual triggers, spawns their units through the
// enemy manager, tracks cleared state, and answers reinforcement calls.

import * as THREE from 'three';
import { EncounterDef } from './types';
import { v3 } from '../../core/math';
import { EnemyType } from './types';

export interface UnitSpawner {
  spawn(type: EnemyType, at: THREE.Vector3, yaw: number, encounterId: string, nodes: THREE.Vector3[], ambush: boolean): void;
  aliveIn(encounterId: string): number;
}

interface Instance {
  def: EncounterDef;
  active: boolean;
  cleared: boolean;
  reinforced: boolean;
}

export class EncounterDirector {
  private instances: Instance[] = [];
  private spawner: UnitSpawner;
  onActivated: ((id: string) => void) | null = null;
  onCleared: ((id: string) => void) | null = null;

  constructor(defs: EncounterDef[], spawner: UnitSpawner) {
    this.spawner = spawner;
    for (const def of defs) this.instances.push({ def, active: false, cleared: false, reinforced: false });
  }

  get(id: string): Instance | undefined {
    return this.instances.find((i) => i.def.id === id);
  }

  isActive(id: string): boolean {
    return !!this.get(id)?.active;
  }

  isCleared(id: string): boolean {
    return !!this.get(id)?.cleared;
  }

  activate(id: string): void {
    const inst = this.get(id);
    if (!inst || inst.active || inst.cleared) return;
    inst.active = true;
    const ambush = inst.def.template === 'AMBUSH_POCKET';
    for (const u of inst.def.units) {
      const at = v3(u.at);
      const nodes = (u.nodes ?? []).map(v3);
      this.spawner.spawn(u.type, at, u.yaw ?? 0, id, nodes, ambush);
    }
    if (this.onActivated) this.onActivated(id);
  }

  onRegionEnter(regionId: string): void {
    for (const i of this.instances) {
      const a = i.def.activation;
      if (a.kind === 'region-enter' && a.region === regionId) this.activate(i.def.id);
    }
  }

  onObjective(objectiveId: string): void {
    for (const i of this.instances) {
      const a = i.def.activation;
      if (a.kind === 'objective' && a.objective === objectiveId) this.activate(i.def.id);
    }
  }

  /** Officer's one reinforcement wave: two troopers behind the encounter. */
  reinforce(encounterId: string, near: THREE.Vector3): boolean {
    const inst = this.get(encounterId);
    if (!inst || inst.reinforced) return false;
    inst.reinforced = true;
    for (let i = 0; i < 2; i++) {
      const at = near.clone().add(new THREE.Vector3((i - 0.5) * 2.4, 0, -2.5));
      this.spawner.spawn('trooper', at, 0, encounterId, [], false);
    }
    return true;
  }

  update(): void {
    for (const i of this.instances) {
      if (i.active && !i.cleared && this.spawner.aliveIn(i.def.id) === 0) {
        i.cleared = true;
        i.active = false;
        if (this.onCleared) this.onCleared(i.def.id);
      }
    }
  }
}
