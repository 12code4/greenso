// Grass: instanced swaying cross-quad blades per zone. Zones are perception
// volumes, not colliders (docs/06 §9): concealment modifies AI sight and the
// sprinkler's soakVolume flattens a zone (sightlines open) on a timer.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GrassZone } from './types';
import { Aabb, aabbFrom, clamp, damp, rand } from '../../core/math';

interface Zone {
  def: GrassZone;
  box: Aabb;
  mesh: THREE.InstancedMesh;
  uTime: { value: number };
  uFlatten: { value: number };
  flatten: number; // current
  flattenTarget: number;
  flattenTimer: number;
}

let bladeGeo: THREE.BufferGeometry | null = null;

function bladeGeometry(): THREE.BufferGeometry {
  if (bladeGeo) return bladeGeo;
  const a = new THREE.PlaneGeometry(0.16, 1, 1, 3);
  a.translate(0, 0.5, 0);
  const b = a.clone();
  b.rotateY(Math.PI / 2);
  const merged = mergeGeometries([a, b], false)!;
  // Vertex colours: darker base → lighter tip
  const pos = merged.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i);
    const c = new THREE.Color().setHSL(0.27 + t * 0.03, 0.55, 0.22 + t * 0.26);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  bladeGeo = merged;
  return merged;
}

function grassMaterial(uTime: { value: number }, uFlatten: { value: number }): THREE.Material {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.uniforms.uFlatten = uFlatten;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime; uniform float uFlatten;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          float h = uv.y;
          #ifdef USE_INSTANCING
            vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #else
            vec3 ip = vec3(0.0);
          #endif
          float sway = sin(uTime * 1.6 + ip.x * 0.9 + ip.z * 0.7) * 0.10 + sin(uTime * 3.1 + ip.z * 1.3) * 0.04;
          transformed.x += sway * h * h;
          transformed.z += cos(uTime * 1.2 + ip.x * 0.5) * 0.05 * h * h;
          // Flatten: lean over and shorten
          transformed.y *= (1.0 - uFlatten * 0.82);
          transformed.x += uFlatten * 0.55 * h;
          transformed.z += uFlatten * 0.25 * h;
        }`,
      );
  };
  m.customProgramCacheKey = () => 'grass-sway';
  return m;
}

export class GrassField {
  private zones: Zone[] = [];

  constructor(defs: GrassZone[], scene: THREE.Scene) {
    const geo = bladeGeometry();
    for (const def of defs) {
      const box = aabbFrom(def.min, def.max);
      const w = box.max.x - box.min.x;
      const d = box.max.z - box.min.z;
      const count = Math.min(6000, Math.floor(w * d * def.density));
      const uTime = { value: 0 };
      const uFlatten = { value: 0 };
      const mesh = new THREE.InstancedMesh(geo, grassMaterial(uTime, uFlatten), count);
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      const p = new THREE.Vector3();
      const col = new THREE.Color();
      for (let i = 0; i < count; i++) {
        p.set(rand(box.min.x, box.max.x), box.min.y, rand(box.min.z, box.max.z));
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI);
        const h = rand(def.height[0], def.height[1]);
        s.set(rand(0.8, 1.3), h, rand(0.8, 1.3));
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);
        // Per-blade tint: most blades jitter around the base green, one in twelve is sun-bleached
        const bleached = Math.random() < 0.08;
        const k = rand(0.78, 1.12);
        if (bleached) col.setRGB(1.35, 1.2, 0.62);
        else col.setRGB(k * rand(0.94, 1.06), k, k * rand(0.88, 1.0));
        mesh.setColorAt(i, col);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.zones.push({ def, box, mesh, uTime, uFlatten, flatten: 0, flattenTarget: 0, flattenTimer: 0 });
    }
  }

  update(dt: number, time: number): void {
    for (const z of this.zones) {
      z.uTime.value = time;
      if (z.flattenTimer > 0) {
        z.flattenTimer -= dt;
        if (z.flattenTimer <= 0) z.flattenTarget = 0;
      }
      z.flatten = damp(z.flatten, z.flattenTarget, z.flattenTarget > z.flatten ? 6 : 0.8, dt);
      z.uFlatten.value = z.flatten;
    }
  }

  /** soakVolume: flatten every zone overlapping the volume for `duration` seconds. */
  flatten(min: THREE.Vector3, max: THREE.Vector3, duration: number): void {
    for (const z of this.zones) {
      const overlap =
        z.box.min.x < max.x && z.box.max.x > min.x && z.box.min.z < max.z && z.box.max.z > min.z;
      if (!overlap || z.def.concealment === 0) continue;
      z.flattenTarget = 1;
      z.flattenTimer = Math.max(z.flattenTimer, duration);
    }
  }

  /** 0..1 concealment at a point (max over zones containing it). */
  concealmentAt(p: THREE.Vector3): number {
    let c = 0;
    for (const z of this.zones) {
      if (p.x < z.box.min.x || p.x > z.box.max.x || p.z < z.box.min.z || p.z > z.box.max.z) continue;
      // Only counts while standing (not perched above the blades)
      if (p.y > z.box.min.y + z.def.height[1] * 0.6) continue;
      c = Math.max(c, z.def.concealment * (1 - z.flatten));
    }
    return clamp(c, 0, 1);
  }
}
