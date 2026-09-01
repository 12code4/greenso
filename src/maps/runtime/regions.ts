// Region system: named AABB volumes. Tracks the player's current region,
// fires enter events (encounter activation, checkpoints, objectives).

import * as THREE from 'three';
import { RegionDef } from './types';
import { Aabb, aabbContains, aabbFrom, v3 } from '../../core/math';

export interface Region {
  def: RegionDef;
  box: Aabb;
  volume: number;
  visited: boolean;
}

export class RegionSystem {
  regions: Region[] = [];
  current: Region | null = null;
  checkpoint: THREE.Vector3;
  private listeners: ((r: Region, first: boolean) => void)[] = [];

  constructor(defs: RegionDef[], spawn: THREE.Vector3) {
    this.checkpoint = spawn.clone();
    for (const d of defs) {
      const box = aabbFrom(d.min, d.max);
      const s = new THREE.Vector3().subVectors(box.max, box.min);
      this.regions.push({ def: d, box, volume: s.x * s.y * s.z, visited: false });
    }
    // Smallest containing region wins on lookup
    this.regions.sort((a, b) => a.volume - b.volume);
  }

  onEnter(fn: (r: Region, first: boolean) => void): void {
    this.listeners.push(fn);
  }

  get(id: string): Region {
    const r = this.regions.find((x) => x.def.id === id);
    if (!r) throw new Error(`Unknown region ${id}`);
    return r;
  }

  regionAt(p: THREE.Vector3): Region | null {
    for (const r of this.regions) if (aabbContains(r.box, p)) return r;
    return null;
  }

  inRegion(p: THREE.Vector3, id: string): boolean {
    return aabbContains(this.get(id).box, p);
  }

  update(playerPos: THREE.Vector3): void {
    const r = this.regionAt(playerPos);
    if (r && r !== this.current) {
      this.current = r;
      const first = !r.visited;
      r.visited = true;
      if (r.def.checkpoint) this.checkpoint.copy(v3(r.def.checkpoint));
      for (const l of this.listeners) l(r, first);
    }
  }
}
