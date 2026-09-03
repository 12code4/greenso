// Patrols (docs/10 §7): Tans that walk a loop of points when idle, using the
// awareness ladder on the way. The EnemyManager does the walking (Enemy.patrol);
// this system spawns them and staggers them along the route.

import * as THREE from 'three';
import { PatrolDef } from '../maps/runtime/types';
import { EnemyManager } from './enemies';
import { v3 } from '../core/math';

export class PatrolSystem {
  constructor(defs: PatrolDef[], enemies: EnemyManager) {
    for (const def of defs) {
      const points = def.points.map(v3);
      def.units.forEach((type, k) => {
        // Stagger the squad along the first leg so they walk as a loose file
        const start = points[0].clone();
        if (points.length > 1) {
          const dir = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
          start.addScaledVector(dir, k * 1.6);
          start.x += (k % 2 ? 0.7 : -0.7);
        }
        const yaw = points.length > 1 ? Math.atan2(-(points[1].x - points[0].x), -(points[1].z - points[0].z)) : 0;
        const e = enemies.spawn(type, start, yaw, def.id, [], false);
        e.patrol = { points, i: points.length > 1 ? 1 : 0, pauseT: 0, speed: def.speed ?? 3.2, pause: def.pause ?? 1.5 };
      });
    }
  }
}
