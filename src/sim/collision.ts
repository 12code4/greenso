// Static-world collision: axis-aligned boxes + a ground plane at y=0.
// The player is a vertical capsule (feet-origin). No physics engine by
// design (see docs/04-tech.md) — greybox worlds are boxes.

import * as THREE from 'three';

export interface StaticBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export interface CapsuleResult {
  grounded: boolean;
  hitCeiling: boolean;
  hitWall: boolean;
}

export interface RayHit {
  t: number;
  point: THREE.Vector3;
  normal: THREE.Vector3;
}

const EPS = 1e-6;

export class CollisionWorld {
  boxes: StaticBox[] = [];

  addBox(center: THREE.Vector3, size: THREE.Vector3): StaticBox {
    const half = size.clone().multiplyScalar(0.5);
    const b: StaticBox = {
      min: center.clone().sub(half),
      max: center.clone().add(half),
    };
    this.boxes.push(b);
    return b;
  }

  /**
   * Resolve a vertical capsule (origin at the feet) against the world.
   * Mutates pos. stepHeight: low lips this tall are climbed automatically
   * while grounded.
   */
  resolveCapsule(
    pos: THREE.Vector3,
    radius: number,
    height: number,
    stepHeight: number,
    wasGrounded: boolean,
  ): CapsuleResult {
    const res: CapsuleResult = { grounded: false, hitCeiling: false, hitWall: false };

    // Ground plane
    if (pos.y < 0) {
      pos.y = 0;
      res.grounded = true;
    }

    for (let pass = 0; pass < 3; pass++) {
      let any = false;
      for (const b of this.boxes) {
        // Broad phase
        if (
          pos.x + radius < b.min.x || pos.x - radius > b.max.x ||
          pos.z + radius < b.min.z || pos.z - radius > b.max.z ||
          pos.y + height < b.min.y || pos.y > b.max.y
        ) continue;

        // Capsule core segment endpoints (y only; axis is vertical at pos.x/z)
        const y0 = pos.y + radius;
        const y1 = pos.y + height - radius;

        // Closest points between the vertical segment and the box
        const bx = clamp(pos.x, b.min.x, b.max.x);
        const bz = clamp(pos.z, b.min.z, b.max.z);
        let sy: number;
        let by: number;
        if (b.max.y < y0) {
          sy = y0;
          by = b.max.y;
        } else if (b.min.y > y1) {
          sy = y1;
          by = b.min.y;
        } else {
          // Vertical intervals overlap → closest approach is horizontal
          sy = clamp(pos.y + height * 0.5, Math.max(b.min.y, y0), Math.min(b.max.y, y1));
          by = sy;
        }

        const dx = pos.x - bx;
        const dy = sy - by;
        const dz = pos.z - bz;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq >= radius * radius) continue;

        // Step-up: low lip while grounded → stand on top of it. Airborne, a
        // slightly smaller lip still mounts (the "vault low lips" feel — a
        // jump that reaches a ledge's shoulder lands on it instead of scraping).
        const lip = b.max.y - pos.y;
        if (lip > 0 && lip <= (wasGrounded ? stepHeight : stepHeight * 0.85)) {
          pos.y = b.max.y;
          res.grounded = true;
          any = true;
          continue;
        }

        let nx: number, ny: number, nz: number, push: number;
        if (distSq > EPS) {
          const dist = Math.sqrt(distSq);
          nx = dx / dist;
          ny = dy / dist;
          nz = dz / dist;
          push = radius - dist;
        } else {
          // Axis inside the box: push out along the smallest face penetration
          const pens: [number, number, number, number][] = [
            [b.max.x - pos.x + radius, 1, 0, 0],
            [pos.x - b.min.x + radius, -1, 0, 0],
            [b.max.z - pos.z + radius, 0, 0, 1],
            [pos.z - b.min.z + radius, 0, 0, -1],
            [b.max.y - pos.y, 0, 1, 0],
          ];
          pens.sort((p, q) => p[0] - q[0]);
          const [p, x, y, z] = pens[0];
          nx = x; ny = y; nz = z; push = p;
        }

        pos.x += nx * push;
        pos.y += ny * push;
        pos.z += nz * push;
        any = true;
        if (ny > 0.5) res.grounded = true;
        else if (ny < -0.5) res.hitCeiling = true;
        else res.hitWall = true;
      }
      if (!any) break;
    }
    return res;
  }

  /** Slab-method raycast against all boxes and the ground plane. */
  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): RayHit | null {
    let best = maxDist;
    let bestN: THREE.Vector3 | null = null;

    // Ground plane y=0
    if (dir.y < -EPS && origin.y > 0) {
      const t = -origin.y / dir.y;
      if (t > 0 && t < best) {
        best = t;
        bestN = new THREE.Vector3(0, 1, 0);
      }
    }

    for (const b of this.boxes) {
      let tmin = 0;
      let tmax = best;
      let n = 0; // axis of entry: 0=x 1=y 2=z
      let hit = true;
      for (let a = 0; a < 3; a++) {
        const o = a === 0 ? origin.x : a === 1 ? origin.y : origin.z;
        const d = a === 0 ? dir.x : a === 1 ? dir.y : dir.z;
        const mn = a === 0 ? b.min.x : a === 1 ? b.min.y : b.min.z;
        const mx = a === 0 ? b.max.x : a === 1 ? b.max.y : b.max.z;
        if (Math.abs(d) < EPS) {
          if (o < mn || o > mx) { hit = false; break; }
          continue;
        }
        let t1 = (mn - o) / d;
        let t2 = (mx - o) / d;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        if (t1 > tmin) { tmin = t1; n = a; }
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) { hit = false; break; }
      }
      if (hit && tmin > 0 && tmin < best) {
        best = tmin;
        const sign = (n === 0 ? dir.x : n === 1 ? dir.y : dir.z) > 0 ? -1 : 1;
        bestN = new THREE.Vector3(
          n === 0 ? sign : 0,
          n === 1 ? sign : 0,
          n === 2 ? sign : 0,
        );
      }
    }

    if (!bestN) return null;
    return {
      t: best,
      point: origin.clone().addScaledVector(dir, best),
      normal: bestN,
    };
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
