// Floor links (docs/10 §5): trigger volumes at the far end of every route to
// another floor. Entering one is the loading moment; the destination floor may
// not exist yet (then the toy-bin card says so and the link still counts as found).

import * as THREE from 'three';
import { FloorLinkDef } from '../maps/runtime/types';
import { aabbContains, aabbFrom, Aabb } from '../core/math';
import { WorldState } from './world';

interface Link {
  def: FloorLinkDef;
  box: Aabb;
  cooldown: number;
}

export class FloorLinkSystem {
  links: Link[] = [];
  private world: WorldState;
  onLink: ((def: FloorLinkDef, alreadyFound: boolean) => void) | null = null;

  constructor(defs: FloorLinkDef[], world: WorldState) {
    this.world = world;
    for (const def of defs) this.links.push({ def, box: aabbFrom(def.min, def.max), cooldown: 0 });
  }

  get(id: string): FloorLinkDef | undefined {
    return this.links.find((l) => l.def.id === id)?.def;
  }

  /** Links whose mission unlock has happened, or which are found by exploring. */
  isOpen(def: FloorLinkDef): boolean {
    if (!def.foundBy) return true;
    return this.world.found.has(def.id) || this.world.missions.has(def.foundBy);
  }

  update(dt: number, playerPos: THREE.Vector3): void {
    for (const l of this.links) {
      if (l.cooldown > 0) { l.cooldown -= dt; continue; }
      if (!aabbContains(l.box, playerPos)) continue;
      if (!this.isOpen(l.def)) continue;
      l.cooldown = 6;
      const already = this.world.found.has(l.def.id);
      this.world.markFound(l.def.id);
      if (this.onLink) this.onLink(l.def, already);
    }
  }
}
