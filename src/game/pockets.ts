// Random ambush pockets (docs/10 §7): on region entry, roll a chance; spawn a
// table entry rising from a tagged concealment spot in that region. Cooldown per
// spot. Re-rolled on every load (rule 10) — repeat walks stay lively.

import * as THREE from 'three';
import { PocketDef } from '../maps/runtime/types';
import { EnemyManager } from './enemies';
import { v3 } from '../core/math';

export class PocketRoller {
  private def: PocketDef;
  private enemies: EnemyManager;
  private cooldowns = new Map<number, number>();
  private time = 0;
  private count = 0;
  onSpawn: ((at: THREE.Vector3, n: number) => void) | null = null;

  constructor(def: PocketDef, enemies: EnemyManager) {
    this.def = def;
    this.enemies = enemies;
  }

  update(dt: number): void {
    this.time += dt;
  }

  onRegionEnter(regionId: string): void {
    const spots = this.def.spots.map((s, i) => ({ s, i })).filter(({ s, i }) => s.region === regionId && (this.cooldowns.get(i) ?? -99) + this.def.cooldown < this.time);
    if (!spots.length || Math.random() > this.def.chance) return;
    const { s, i } = spots[Math.floor(Math.random() * spots.length)];
    this.cooldowns.set(i, this.time);
    const total = this.def.tables.reduce((a, t) => a + t.weight, 0);
    let r = Math.random() * total;
    let table = this.def.tables[0];
    for (const t of this.def.tables) { r -= t.weight; if (r <= 0) { table = t; break; } }
    const at = v3(s.at);
    const id = `pocket_${this.count++}`;
    table.units.forEach((type, k) => {
      const a = (k / table.units.length) * Math.PI * 2;
      const pos = at.clone().add(new THREE.Vector3(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9));
      this.enemies.spawn(type, pos, a + Math.PI, id, type === 'based' ? [pos.clone().add(new THREE.Vector3(-1, 0, 0)), pos.clone().add(new THREE.Vector3(1, 0, 0))] : [], true);
    });
    if (this.onSpawn) this.onSpawn(at, table.units.length);
  }
}
