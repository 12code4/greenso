import * as THREE from 'three';

export type Vec3 = [number, number, number];

export const v3 = (t: Vec3): THREE.Vector3 => new THREE.Vector3(t[0], t[1], t[2]);

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const damp = (a: number, b: number, rate: number, dt: number): number =>
  a + (b - a) * (1 - Math.exp(-rate * dt));
export const rand = (lo: number, hi: number): number => lo + Math.random() * (hi - lo);
export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function dampAngle(a: number, b: number, rate: number, dt: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * (1 - Math.exp(-rate * dt));
}

export interface Aabb {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export const aabbContains = (b: Aabb, p: THREE.Vector3): boolean =>
  p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y && p.z >= b.min.z && p.z <= b.max.z;

export const aabbFrom = (min: Vec3, max: Vec3): Aabb => ({ min: v3(min), max: v3(max) });

/** Yaw (about +Y) for an object whose forward is -Z to face from a to b. */
export const yawToward = (from: THREE.Vector3, to: THREE.Vector3): number =>
  Math.atan2(-(to.x - from.x), -(to.z - from.z));

/** Point on a Catmull-Rom spline through pts at t∈[0,1]. */
export function splinePoint(pts: THREE.Vector3[], t: number, out: THREE.Vector3): THREE.Vector3 {
  const n = pts.length - 1;
  const f = clamp(t, 0, 1) * n;
  const i = Math.min(Math.floor(f), n - 1);
  const u = f - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[Math.min(n, i + 1)];
  const p3 = pts[Math.min(n, i + 2)];
  const u2 = u * u;
  const u3 = u2 * u;
  out.set(
    0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
    0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
    0.5 * (2 * p1.z + (-p0.z + p2.z) * u + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * u2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * u3),
  );
  return out;
}

export function splineLength(pts: THREE.Vector3[], samples = 64): number {
  let len = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  splinePoint(pts, 0, a);
  for (let i = 1; i <= samples; i++) {
    splinePoint(pts, i / samples, b);
    len += a.distanceTo(b);
    a.copy(b);
  }
  return len;
}
