// Hazard scheduler (docs/06 §5): one system, config-driven. Fires phases on
// a period, telegraphs them ahead by audio cue, and runs the closed op set.
// World effects go through hooks so the scheduler owns no game state.

import * as THREE from 'three';
import { HazardDef, HazardOp } from './types';
import { v3, rand } from '../../core/math';

export interface HazardHooks {
  cue(name: string, at?: THREE.Vector3): void;
  soak(min: THREE.Vector3, max: THREE.Vector3, duration: number): void;
  quake(magnitude: number): void;
  spawnWave(encounterId: string): void;
  sprinklerLoop(on: boolean, at: THREE.Vector3): void;
}

interface ActivePush {
  min: THREE.Vector3;
  max: THREE.Vector3;
  force: THREE.Vector3;
  t: number;
}

interface Sweep {
  group: THREE.Group;
  head: THREE.Vector3;
  from: number;
  to: number;
  t: number;
  duration: number;
}

interface Shadow {
  mesh: THREE.Mesh;
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  duration: number;
  magnitude: number;
  radius: number;
}

interface Runner {
  def: HazardDef;
  timer: number;
  period: number;
  fired: Set<number>;
  cued: Set<number>;
}

export class HazardScheduler {
  pushes: ActivePush[] = [];
  private runners: Runner[] = [];
  private sweeps: Sweep[] = [];
  private shadows: Shadow[] = [];
  private scene: THREE.Scene;
  private hooks: HazardHooks;
  /** Set true when a Giant shadow is over the player this frame. */
  shadowOverPlayer = false;

  constructor(defs: HazardDef[], scene: THREE.Scene, hooks: HazardHooks) {
    this.scene = scene;
    this.hooks = hooks;
    for (const def of defs) {
      // Start partway through the cycle so the first event lands ~20 s after
      // spawn rather than on a cold map; phases already "past" are marked done.
      const timer = Math.max(0, def.period - 20);
      const fired = new Set<number>();
      def.phases.forEach((p, i) => { if (p.at <= timer) fired.add(i); });
      this.runners.push({ def, timer, period: def.period + rand(0, def.jitter ?? 0), fired, cued: new Set(fired) });
    }
  }

  update(dt: number, playerPos: THREE.Vector3): void {
    for (const r of this.runners) {
      r.timer += dt;
      for (let i = 0; i < r.def.phases.length; i++) {
        const ph = r.def.phases[i];
        const lead = r.def.telegraph?.lead ?? 0;
        if (!r.cued.has(i) && r.def.telegraph && r.timer >= ph.at - lead) {
          r.cued.add(i);
          const at = ph.ops.find((o) => o.op === 'sprinklerSweep' || o.op === 'quakeShadow');
          this.hooks.cue(r.def.telegraph.cue, at ? v3((at as { head?: [number, number, number]; from?: [number, number, number] }).head ?? (at as { from: [number, number, number] }).from) : undefined);
        }
        if (!r.fired.has(i) && r.timer >= ph.at) {
          r.fired.add(i);
          for (const op of ph.ops) this.run(op);
        }
      }
      if (r.timer >= r.period) {
        r.timer -= r.period;
        r.period = r.def.period + rand(0, r.def.jitter ?? 0);
        r.fired.clear();
        r.cued.clear();
      }
    }

    // Push volumes tick down
    for (let i = this.pushes.length - 1; i >= 0; i--) {
      this.pushes[i].t -= dt;
      if (this.pushes[i].t <= 0) this.pushes.splice(i, 1);
    }

    // Sprinkler sweeps: rotate the spray fan back and forth
    for (let i = this.sweeps.length - 1; i >= 0; i--) {
      const s = this.sweeps[i];
      s.t += dt;
      const k = s.t / s.duration;
      const phase = (Math.sin(k * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0→1→0
      s.group.rotation.y = THREE.MathUtils.degToRad(s.from + (s.to - s.from) * phase);
      if (s.t >= s.duration) {
        this.scene.remove(s.group);
        this.sweeps.splice(i, 1);
        if (this.sweeps.length === 0) this.hooks.sprinklerLoop(false, s.head);
      }
    }

    // Giant shadows
    this.shadowOverPlayer = false;
    for (let i = this.shadows.length - 1; i >= 0; i--) {
      const sh = this.shadows[i];
      sh.t += dt;
      const k = Math.min(1, sh.t / sh.duration);
      sh.mesh.position.lerpVectors(sh.from, sh.to, k);
      sh.mesh.position.y = 0.05;
      const d = Math.hypot(playerPos.x - sh.mesh.position.x, playerPos.z - sh.mesh.position.z);
      // Footfall thumps: shake scales with proximity
      this.hooks.quake(sh.magnitude * Math.max(0, 1 - d / 40) * dt * 8);
      if (d < sh.radius) this.shadowOverPlayer = true;
      if (sh.t >= sh.duration) {
        this.scene.remove(sh.mesh);
        this.shadows.splice(i, 1);
      }
    }
  }

  /** Sum of push forces at a point. */
  pushAt(p: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 {
    out.set(0, 0, 0);
    for (const ps of this.pushes) {
      if (p.x >= ps.min.x && p.x <= ps.max.x && p.z >= ps.min.z && p.z <= ps.max.z && p.y >= ps.min.y && p.y <= ps.max.y) out.add(ps.force);
    }
    return out;
  }

  private run(op: HazardOp): void {
    switch (op.op) {
      case 'pushVolume':
        this.pushes.push({ min: v3(op.min), max: v3(op.max), force: v3(op.force), t: op.duration });
        break;
      case 'soakVolume':
        this.hooks.soak(v3(op.min), v3(op.max), op.duration);
        break;
      case 'quakeShadow': {
        const mesh = new THREE.Mesh(
          new THREE.CircleGeometry(op.radius, 28),
          new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }),
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.scale.set(1.4, 1, 1);
        this.scene.add(mesh);
        this.shadows.push({ mesh, from: v3(op.from), to: v3(op.to), t: 0, duration: op.duration, magnitude: op.magnitude, radius: op.radius });
        break;
      }
      case 'spawnWave':
        this.hooks.spawnWave(op.encounter);
        break;
      case 'sprinklerSweep': {
        const head = v3(op.head);
        const group = buildSprayFan(op.range);
        group.position.copy(head);
        group.position.y += 0.4;
        this.scene.add(group);
        this.sweeps.push({ group, head, from: op.fromDeg, to: op.toDeg, t: 0, duration: op.duration });
        this.hooks.sprinklerLoop(true, head);
        break;
      }
    }
  }
}

/** A fan of drooping water arcs from the head out to `range`. */
function buildSprayFan(range: number): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.55 });
  for (let j = 0; j < 9; j++) {
    const spread = (j - 4) * 0.06;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const r = t * range;
      const y = Math.sin(t * Math.PI) * range * 0.28 + (1 - t) * 0.2;
      pts.push(new THREE.Vector3(Math.sin(spread) * r, y, -Math.cos(spread) * r));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  // Wet ground sheen sector
  const sector = new THREE.Mesh(
    new THREE.RingGeometry(1, range, 24, 1, -0.3, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
  );
  sector.rotation.x = -Math.PI / 2;
  sector.rotation.z = -Math.PI / 2;
  sector.position.y = -0.36;
  g.add(sector);
  return g;
}
