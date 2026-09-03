// The Tan Command. Rank = articulation (docs/02): molded units hop between
// lane nodes on bases and can be toppled; articulated units move, flank,
// CHARGE when close (docs/09 §1.4), and retreat at Critical melt. Fire melts
// them (docs/09 §1.2); kinetic hits shed plastic flecks; they shout.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { SoldierModel } from './soldier';
import { Hittable, HitApply, DamageKind } from './projectiles';
import { Fx } from './weapons';
import { EnemyType } from '../maps/runtime/types';
import { clamp, damp, dampAngle, rand, yawToward } from '../core/math';

export interface EnemyHooks {
  sfx(name: string, at: THREE.Vector3): void;
  playerHit(damage: number, from: THREE.Vector3): void;
  reinforce(encounterId: string, near: THREE.Vector3): boolean;
  throwGrenade(pos: THREE.Vector3, vel: THREE.Vector3): void;
  bark(e: Enemy, kind: 'suspicious' | 'alert' | 'hit' | 'death' | 'melt' | 'charge' | 'topple' | 'flee'): void;
  /** Tan Flamer's candle-fuel tank goes up when he dies. */
  explode(at: THREE.Vector3, radius: number, damage: number): void;
  /** Player caught in a flamer's cone: `amount` melt damage this frame. */
  playerBurn(amount: number, from: THREE.Vector3): void;
}

export interface PlayerView {
  pos: THREE.Vector3;
  alive: boolean;
  vel: THREE.Vector3;
  crouched: boolean;
  sprinting: boolean;
}

const wrapPi = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

type State = 'idle' | 'combat' | 'suspicious' | 'flee' | 'charge' | 'toppled' | 'dead';

// Tuned so a stationary player in the open survives a full pocket ~9–10 s;
// cover and movement stretch that a lot (spread is the lever, not damage).
const STATS: Record<EnemyType, { hp: number; sight: number; range: number; damage: number; spreadDeg: number }> = {
  trooper: { hp: 40, sight: 26, range: 24, damage: 5, spreadDeg: 8 },
  based: { hp: 30, sight: 26, range: 26, damage: 8, spreadDeg: 3.5 },
  grenadier: { hp: 30, sight: 24, range: 20, damage: 0, spreadDeg: 0 },
  sniper: { hp: 25, sight: 46, range: 46, damage: 30, spreadDeg: 0.6 },
  officer: { hp: 45, sight: 28, range: 22, damage: 6, spreadDeg: 6 },
  flamer: { hp: 55, sight: 22, range: 7.5, damage: 0, spreadDeg: 0 },
};

const RADIUS = 0.18;
const HEIGHT = 1.0;
const TAN_COLOR = 0xc8a878;

let glintTex: THREE.CanvasTexture | null = null;
function glintTexture(): THREE.CanvasTexture {
  if (glintTex) return glintTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,240,1)');
  grad.addColorStop(0.3, 'rgba(255,240,180,0.8)');
  grad.addColorStop(1, 'rgba(255,220,120,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  glintTex = new THREE.CanvasTexture(c);
  return glintTex;
}

export class Enemy {
  type: EnemyType;
  encounter: string;
  pos: THREE.Vector3;
  vel = new THREE.Vector3();
  yaw: number;
  home: THREE.Vector3;
  homeYaw: number;
  scanPhase = Math.random() * 6.28;
  nodes: THREE.Vector3[];
  model: SoldierModel;
  hp: number;
  maxHp: number;
  state: State = 'idle';
  stateT = 0;
  grounded = true;
  lastSeen = new THREE.Vector3();
  sinceSeen = 99;
  fireT = rand(0.4, 1.2);
  burst = 0;
  windup = 0;
  hopT = rand(1.5, 3.5);
  hopFrom = new THREE.Vector3();
  hopTo = new THREE.Vector3();
  hopK = -1;
  strafeSide = 1;
  strafeT = 1.5;
  fled = false;
  toppleK = 0;
  toppleT = 0;
  combatTime = 0;
  reinforced = false;
  rising = 0;
  glint: THREE.Sprite | null = null;
  moving = false;
  /** Seconds of burning left (fire DoT → melt death). */
  burning = 0;
  lastKind: DamageKind = 'kinetic';
  chargeCooldown = rand(2, 5);
  announced = false;
  /** Awareness ladder: 0..1 while suspicious; ≥1 locks on. */
  suspicion = 0;

  constructor(type: EnemyType, at: THREE.Vector3, yaw: number, encounter: string, nodes: THREE.Vector3[], scene: THREE.Scene, ambush: boolean) {
    this.type = type;
    this.encounter = encounter;
    this.pos = at.clone();
    this.home = at.clone();
    this.yaw = yaw;
    this.homeYaw = yaw;
    this.nodes = nodes.length ? nodes : [at.clone()];
    const s = STATS[type];
    this.hp = this.maxHp = s.hp;
    this.model = new SoldierModel({
      team: 'tan',
      based: type === 'based' || type === 'grenadier',
      pennant: type === 'officer',
      prone: type === 'sniper',
      weapon: type === 'officer' ? 'pistol' : type === 'sniper' ? 'sniper' : type === 'flamer' ? 'flamer' : 'rifle',
    });
    this.model.attachTo(scene);
    if (type === 'grenadier') this.model.setPose('throw');
    if (ambush) {
      // Rise from the grass, then a beat before the first shot: surprise, not execution
      this.rising = 0.9;
      this.model.root.scale.y = 0.05;
      this.state = 'combat';
      this.fireT = rand(1.0, 1.6);
    }
    if (type === 'sniper' || type === 'based') {
      this.glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      this.glint.scale.setScalar(0.001);
      scene.add(this.glint);
    }
    this.syncModel();
  }

  get alive(): boolean { return this.state !== 'dead'; }
  get molded(): boolean { return this.type === 'based' || this.type === 'grenadier'; }
  get eye(): THREE.Vector3 { return this.pos.clone().add(new THREE.Vector3(0, this.type === 'sniper' ? 0.35 : 0.9, 0)); }

  syncModel(): void {
    this.model.root.position.copy(this.pos);
    this.model.root.rotation.y = this.yaw;
    this.model.root.rotation.x = -1.5 * this.toppleK;
  }
}

export class EnemyManager implements Hittable {
  list: Enemy[] = [];
  kills = 0;
  melts = 0;
  private scene: THREE.Scene;
  private world: CollisionWorld;
  private hooks: EnemyHooks;
  private fx: Fx;
  private alertAt = new Map<string, { t: number; at: THREE.Vector3 }>();
  private time = 0;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private tmp3 = new THREE.Vector3();

  constructor(scene: THREE.Scene, world: CollisionWorld, hooks: EnemyHooks) {
    this.scene = scene;
    this.world = world;
    this.hooks = hooks;
    this.fx = new Fx(scene);
  }

  // ------------------------------------------------------------ UnitSpawner

  spawn(type: EnemyType, at: THREE.Vector3, yaw: number, encounterId: string, nodes: THREE.Vector3[], ambush: boolean): void {
    this.list.push(new Enemy(type, at, yaw, encounterId, nodes, this.scene, ambush));
    if (ambush) this.alertAt.set(encounterId, { t: this.time, at: at.clone() });
  }

  aliveIn(encounterId: string): number {
    let n = 0;
    for (const e of this.list) if (e.encounter === encounterId && e.alive) n++;
    return n;
  }

  anyInCombat(): boolean {
    return this.list.some((e) => e.alive && (e.state === 'combat' || e.state === 'flee' || e.state === 'charge'));
  }

  /** Gunfire etc.: alert everyone within radius. */
  noise(at: THREE.Vector3, radius: number): void {
    for (const e of this.list) {
      if (!e.alive || e.state === 'combat' || e.state === 'charge') continue;
      if (e.pos.distanceTo(at) < radius) {
        e.lastSeen.copy(at);
        e.sinceSeen = 0;
        if (e.state === 'idle') { e.state = 'suspicious'; e.suspicion = Math.max(e.suspicion, 0.5); }
        this.alertAt.set(e.encounter, { t: this.time, at: at.clone() });
      }
    }
  }

  /** Dive-tackle (docs/02): a sprinting dive topples molded Tans and shoves articulated ones. */
  tackle(at: THREE.Vector3, vel: THREE.Vector3, already: Set<Enemy>): Enemy | null {
    for (const e of this.list) {
      if (!e.alive || already.has(e) || e.state === 'toppled' || e.rising > 0) continue;
      const dx = e.pos.x - at.x, dz = e.pos.z - at.z;
      if (dx * dx + dz * dz > 0.95 * 0.95 || Math.abs(e.pos.y - at.y) > 1.0) continue;
      already.add(e);
      const dir = new THREE.Vector3(vel.x, 0, vel.z).normalize();
      if (e.molded) {
        this.topple(e);
      } else {
        this.damage(e, 30, dir, 'kinetic', e.pos.clone().add(new THREE.Vector3(0, 0.6, 0)));
        if (e.alive) { e.pos.addScaledVector(dir, 0.4); e.fireT = Math.max(e.fireT, 1.2); }
      }
      this.hooks.sfx('clack', e.pos);
      return e;
    }
    return null;
  }

  /** Explosion: damage with falloff, topple molded units in a wider ring. */
  damageRadius(at: THREE.Vector3, radius: number, damage: number): void {
    for (const e of this.list) {
      if (!e.alive) continue;
      const d = e.pos.distanceTo(at);
      if (d < radius) {
        const k = 1 - d / radius;
        this.damage(e, damage * (0.35 + 0.65 * k), this.tmp.subVectors(e.pos, at).normalize(), 'blast');
      }
      if (e.alive && e.molded && d < radius * 1.4) this.topple(e);
    }
  }

  topple(e: Enemy): void {
    if (!e.molded || e.state === 'toppled' || !e.alive) return;
    e.state = 'toppled';
    e.toppleT = 3.2;
    e.hopK = -1;
    e.windup = 0;
    this.hooks.sfx('topple', e.pos);
    this.hooks.bark(e, 'topple');
  }

  /** Molded units in a push volume get knocked over by strong forces. */
  applyPush(pushAt: (p: THREE.Vector3, out: THREE.Vector3) => THREE.Vector3): void {
    for (const e of this.list) {
      if (!e.alive) continue;
      const f = pushAt(e.pos, this.tmp);
      if (f.lengthSq() < 1e-4) continue;
      if (e.molded) {
        if (f.length() > 1.8 && Math.random() < 0.02) this.topple(e);
      } else {
        e.vel.addScaledVector(f, 1 / 60);
      }
    }
  }

  // ------------------------------------------------------------ Hittable

  raycast(origin: THREE.Vector3, dir: THREE.Vector3, maxT: number): { point: THREE.Vector3; t: number; apply: HitApply } | null {
    let best: Enemy | null = null;
    let bestT = maxT;
    for (const e of this.list) {
      if (!e.alive) continue;
      const t = this.hitT(e, origin, dir, bestT);
      if (t !== null) { best = e; bestT = t; }
    }
    if (!best) return null;
    const target = best;
    const point = origin.clone().addScaledVector(dir, bestT);
    return { point, t: bestT, apply: (damage, d, kind) => this.damage(target, damage, d, kind ?? 'kinetic', point) };
  }

  bestAssistPoint(origin: THREE.Vector3, dir: THREE.Vector3, coneRad: number, maxDist: number, world: CollisionWorld): THREE.Vector3 | null {
    let bestAngle = coneRad;
    let best: THREE.Vector3 | null = null;
    for (const e of this.list) {
      if (!e.alive) continue;
      const p = this.tmp.copy(e.pos).add(this.tmp2.set(0, e.type === 'sniper' ? 0.3 : 0.55, 0));
      const to = this.tmp3.subVectors(p, origin);
      const dist = to.length();
      if (dist > maxDist) continue;
      to.divideScalar(dist);
      const angle = Math.acos(clamp(to.dot(dir), -1, 1));
      if (angle >= bestAngle) continue;
      if (world.raycast(origin, to, dist - 0.3)) continue;
      bestAngle = angle;
      best = p.clone();
    }
    return best;
  }

  /** Flamethrower: everyone in the cone with line of sight. */
  cone(origin: THREE.Vector3, dir: THREE.Vector3, range: number, halfAngle: number, world: CollisionWorld): HitApply[] {
    const out: HitApply[] = [];
    const cosHalf = Math.cos(halfAngle);
    for (const e of this.list) {
      if (!e.alive) continue;
      const p = this.tmp.copy(e.pos);
      p.y += 0.5;
      const to = this.tmp2.subVectors(p, origin);
      const d = to.length();
      if (d > range || d < 0.05) continue;
      to.divideScalar(d);
      if (to.dot(dir) < cosHalf) continue;
      if (world.raycast(origin, to, d - 0.3)) continue;
      const target = e;
      out.push((damage, dd, kind) => this.damage(target, damage, dd, kind ?? 'fire'));
    }
    return out;
  }

  private hitT(e: Enemy, origin: THREE.Vector3, dir: THREE.Vector3, maxT: number): number | null {
    const spheres: [number, number][] = e.type === 'sniper' ? [[0.25, 0.4]] : e.state === 'toppled' ? [[0.3, 0.45]] : [[0.5, 0.38], [0.93, 0.22]];
    let best: number | null = null;
    for (const [h, r] of spheres) {
      const c = this.tmp.copy(e.pos);
      c.y += h;
      const oc = this.tmp2.subVectors(origin, c);
      const b = oc.dot(dir);
      const cc = oc.dot(oc) - r * r;
      const disc = b * b - cc;
      if (disc < 0) continue;
      const t = -b - Math.sqrt(disc);
      if (t > 0 && t < maxT && (best === null || t < best)) best = t;
    }
    return best;
  }

  /** Returns true if the hit killed. Fire melts; kinetic/blast shatters. */
  damage(e: Enemy, amount: number, dir: THREE.Vector3, kind: DamageKind = 'kinetic', at?: THREE.Vector3): boolean {
    if (!e.alive) return false;
    e.hp -= amount;
    e.lastKind = kind;
    if (kind === 'fire') {
      e.burning = Math.max(e.burning, 1.6);
      if (Math.random() < 0.08) this.hooks.sfx('melt', e.pos);
    } else {
      this.hooks.sfx('hit_plastic', e.pos);
      const fleckAt = at ?? e.pos.clone().add(new THREE.Vector3(0, 0.55, 0));
      this.fx.plasticFlecks(fleckAt, TAN_COLOR, kind === 'blast' ? 9 : 4);
      if (Math.random() < 0.35) this.hooks.bark(e, 'hit');
    }
    e.lastSeen.copy(e.pos).addScaledVector(dir, -6);
    e.sinceSeen = 0;
    if (e.state === 'idle' || e.state === 'suspicious') { e.state = 'combat'; e.fireT = Math.max(e.fireT, 0.5); }
    this.alertAt.set(e.encounter, { t: this.time, at: e.pos.clone() });
    if (e.hp <= 0) {
      this.kill(e, kind);
      return true;
    }
    const f = e.hp / e.maxHp;
    e.model.setDamageStage(f < 0.25 ? 3 : f < 0.6 ? 2 : 1);
    return false;
  }

  private kill(e: Enemy, kind: DamageKind): void {
    e.state = 'dead';
    e.hp = 0;
    this.kills++;
    const melt = kind === 'fire';
    if (melt) this.melts++;
    e.model.startDeath(melt ? 'melt' : 'shatter', e.pos.y);
    if (e.glint) e.glint.visible = false;
    this.hooks.sfx(melt ? 'melt' : 'shatter', e.pos);
    this.hooks.bark(e, melt ? 'melt' : 'death');
    if (e.type === 'flamer') this.hooks.explode(e.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), 3.2, 45);
  }

  // ------------------------------------------------------------ update

  update(dt: number, player: PlayerView, concealmentAt: (p: THREE.Vector3) => number): void {
    this.time += dt;
    this.fx.update(dt); // tracers, sparks, flashes, flame puffs age out (playtest: Tan tracers lingered forever)
    for (let i = this.list.length - 1; i >= 0; i--) {
      const e = this.list[i];
      if (!e.alive) {
        if (!e.model.update(dt)) {
          e.model.dispose();
          if (e.glint) this.scene.remove(e.glint);
          this.list.splice(i, 1);
        }
        continue;
      }
      // Burning: a state you can't shoot your way out of (docs/09 §1.9)
      if (e.burning > 0) {
        e.burning -= dt;
        e.hp -= 14 * dt;
        if (Math.random() < dt * 4) this.fx.flame(e.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.4 + Math.random() * 0.6, (Math.random() - 0.5) * 0.4)), new THREE.Vector3(0, 0.3, 0));
        if (e.hp <= 0) { this.kill(e, 'fire'); continue; }
      }
      this.think(e, dt, player, concealmentAt);
      this.move(e, dt);
      e.model.animateLocomotion(dt, e.moving, e.state === 'combat' || e.state === 'charge');
      e.model.update(dt);
      e.syncModel();
    }
  }

  private think(e: Enemy, dt: number, player: PlayerView, concealmentAt: (p: THREE.Vector3) => number): void {
    e.stateT += dt;
    e.moving = false;

    if (e.rising > 0) {
      e.rising -= dt;
      e.model.root.scale.y = clamp(1 - e.rising / 0.9, 0.05, 1);
      if (e.rising <= 0) { e.model.root.scale.y = 1; this.hooks.bark(e, 'alert'); e.announced = true; }
      return;
    }

    if (e.state === 'toppled') {
      e.toppleT -= dt;
      e.toppleK = e.toppleT > 0.6 ? damp(e.toppleK, 1, 14, dt) : damp(e.toppleK, 0, 8, dt);
      if (e.toppleT <= 0) { e.toppleK = 0; e.state = 'combat'; }
      return;
    }

    // ---- Perception: the awareness ladder (docs/09 Update 3 FAIR PLAY)
    // idle → glimpse → suspicious ("Huh?", turns, searches) → kept in view → combat ("Green!").
    // Glimpse odds scale with view cone, distance, the player's stance and grass concealment.
    const stats = STATS[e.type];
    const toPlayer = this.tmp.subVectors(player.pos, e.pos);
    const dist = toPlayer.length();
    const hot = e.state === 'combat' || e.state === 'charge' || e.state === 'flee';
    let sees = false;
    let glimpse = false;
    if (player.alive && dist < stats.sight) {
      const eye = e.eye;
      const target = this.tmp2.copy(player.pos);
      target.y += 0.55;
      const dir = this.tmp3.subVectors(target, eye);
      const d = dir.length();
      dir.divideScalar(d);
      const occluded = !!this.world.raycast(eye, dir, d - 0.4);
      if (!occluded) {
        const conceal = dist < 4.5 ? 0 : concealmentAt(player.pos);
        if (hot) {
          sees = conceal < 0.95 || dist < 8;
        } else {
          const dYaw = wrapPi(yawToward(e.pos, player.pos) - e.yaw);
          const half = e.state === 'suspicious' ? 1.9 : 1.22; // ±109° while searching, ±70° idle
          if (Math.abs(dYaw) < half || dist < 3.5) {
            const distK = clamp(1 - dist / stats.sight, 0, 1);
            const still = player.vel.x * player.vel.x + player.vel.z * player.vel.z < 0.4;
            const stance = player.sprinting ? 1.7 : player.crouched ? 0.45 : still ? 0.6 : 1;
            const rate = (1 - conceal) * (0.3 + 2.0 * distK) * stance; // glimpses per second
            glimpse = dist < 3.5 || Math.random() < rate * dt;
          }
        }
      }
    }
    if (glimpse) {
      e.lastSeen.copy(player.pos);
      e.sinceSeen = 0;
      if (e.state === 'idle') {
        e.state = 'suspicious';
        e.suspicion = dist < 3.5 ? 1 : 0.35;
        this.hooks.bark(e, 'suspicious');
      } else {
        e.suspicion += dist < 3.5 ? 1 : 0.34; // about three glimpses to lock on
      }
      if (e.suspicion >= 1) sees = true;
    } else if (e.state === 'suspicious') {
      e.suspicion = Math.max(0, e.suspicion - dt * 0.35);
    }
    if (sees) {
      e.lastSeen.copy(player.pos);
      e.sinceSeen = 0;
      if (!hot) {
        // Lock-on: shout first, then a beat before the first shot (first-shot grace)
        if (!e.announced) { this.hooks.bark(e, 'alert'); e.announced = true; }
        e.state = 'combat';
        e.fireT = Math.max(e.fireT, 0.7);
        e.suspicion = 0;
      }
      this.alertAt.set(e.encounter, { t: this.time, at: e.pos.clone() });
    } else {
      e.sinceSeen += dt;
    }
    // A comrade's shout carries 14 u and takes a beat to register — it makes you LOOK, not shoot
    const alert = this.alertAt.get(e.encounter);
    if (e.state === 'idle' && alert && this.time - alert.t > 1.2 && this.time - alert.t < 30 && e.pos.distanceTo(alert.at) < 14) {
      e.state = 'suspicious';
      e.suspicion = 0.5;
      e.lastSeen.copy(player.pos);
      e.sinceSeen = 0.1;
    }
    if (e.state === 'combat' || e.state === 'charge') e.combatTime += dt;

    if (e.state === 'combat' && e.sinceSeen > 6) { e.state = 'suspicious'; e.suspicion = 0.85; }
    if (e.state === 'suspicious' && e.sinceSeen > 14) { e.state = 'idle'; e.announced = false; }

    if (e.state === 'combat' || e.state === 'suspicious' || e.state === 'charge') {
      const want = yawToward(e.pos, e.state === 'charge' ? player.pos : e.lastSeen);
      e.yaw = dampAngle(e.yaw, want, e.molded ? 6 : 10, dt);
    } else if (e.state === 'idle' && e.type !== 'sniper') {
      // Sentry scan: sweep ±50° around the molded facing so the view cone covers the approach over time
      e.yaw = dampAngle(e.yaw, e.homeYaw + Math.sin(this.time * 0.7 + e.scanPhase) * 0.88, 3, dt);
    }

    // ---- Critical → flee (articulated only)
    if (!e.molded && e.type !== 'sniper' && e.type !== 'flamer' && e.hp / e.maxHp < 0.25 && !e.fled && (e.state === 'combat' || e.state === 'charge')) {
      e.fled = true;
      e.state = 'flee';
      e.stateT = 0;
      this.hooks.bark(e, 'flee');
    }
    if (e.state === 'flee' && e.stateT > 3) e.state = 'combat';

    // ---- Trooper CHARGE: "charging you down when you trigger their arrival"
    if (e.type === 'trooper' && e.state === 'combat' && sees) {
      e.chargeCooldown -= dt;
      if (e.chargeCooldown <= 0 && dist < 11 && dist > 3) {
        e.state = 'charge';
        e.stateT = 0;
        e.chargeCooldown = rand(6, 10);
        this.hooks.bark(e, 'charge');
      }
    }
    if (e.state === 'charge' && (e.stateT > 2.6 || dist < 2.2 || !player.alive)) e.state = 'combat';

    // ---- Officer: buffs are read by molded units; one reinforcement call
    if (e.type === 'officer' && e.state === 'combat' && e.combatTime > 14 && !e.reinforced) {
      e.reinforced = true;
      if (this.hooks.reinforce(e.encounter, e.pos)) this.hooks.sfx('radio', e.pos);
    }

    // ---- Attacks
    if ((e.state === 'combat' || e.state === 'charge') && player.alive) {
      const buffed = this.officerNear(e);
      switch (e.type) {
        case 'trooper':
        case 'officer':
          this.troopFire(e, dt, player, dist, sees, stats.damage, stats.spreadDeg + (e.state === 'charge' ? 4 : 0), e.type === 'officer');
          break;
        case 'based':
          this.basedFire(e, dt, player, dist, sees, buffed);
          break;
        case 'grenadier':
          this.grenadierAttack(e, dt, player, dist, sees, buffed);
          break;
        case 'sniper':
          this.sniperFire(e, dt, player, dist, sees);
          break;
        case 'flamer':
          this.flamerAttack(e, dt, player, dist, sees);
          break;
      }
    }
    if (e.glint && e.windup <= 0) e.glint.scale.setScalar(damp(e.glint.scale.x, 0.001, 20, dt));
  }

  private officerNear(e: Enemy): boolean {
    if (!e.molded) return false;
    for (const o of this.list) if (o.alive && o.type === 'officer' && o.pos.distanceTo(e.pos) < 12) return true;
    return false;
  }

  /** Tan Flamer: closes in, then a 1.4 s gout of candle-fire. Melt damage while you stand in it; you keep burning after. */
  private flamerAttack(e: Enemy, dt: number, player: PlayerView, dist: number, sees: boolean): void {
    e.fireT -= dt;
    if (e.burst <= 0) {
      if (!sees || dist > STATS.flamer.range || e.fireT > 0) return;
      e.burst = 1;
      e.windup = 1.4;
      this.hooks.sfx('flame_tick', e.pos);
    }
    e.windup -= dt;
    const from = e.model.muzzleWorld(new THREE.Vector3());
    const target = this.tmp2.copy(player.pos);
    target.y += 0.5;
    const dir = this.tmp3.subVectors(target, from);
    const d = dir.length();
    dir.divideScalar(d);
    if (Math.random() < 0.7) this.fx.flame(from, dir);
    if (Math.random() < 0.15) this.hooks.sfx('flame_tick', from);
    if (sees && d < STATS.flamer.range + 1 && player.alive) this.hooks.playerBurn(9 * dt, from);
    if (e.windup <= 0) { e.burst = 0; e.fireT = rand(2.0, 2.8); }
  }

  private troopFire(e: Enemy, dt: number, player: PlayerView, dist: number, sees: boolean, dmg: number, spread: number, single: boolean): void {
    e.fireT -= dt;
    if (!sees || dist > STATS[e.type].range) return;
    if (e.fireT <= 0) {
      if (single) {
        this.shoot(e, player, dmg, spread);
        e.fireT = 0.9;
      } else if (e.burst > 0) {
        this.shoot(e, player, dmg, spread);
        e.burst--;
        e.fireT = 0.13;
      } else {
        e.burst = 3;
        e.fireT = rand(1.8, 2.8);
      }
    }
  }

  private basedFire(e: Enemy, dt: number, player: PlayerView, dist: number, sees: boolean, buffed: boolean): void {
    if (e.hopK >= 0) return;
    if (!sees || dist > STATS.based.range) return;
    e.fireT -= dt * (buffed ? 1.25 : 1);
    if (e.windup > 0) {
      e.windup -= dt;
      if (e.glint) {
        e.model.muzzleWorld(e.glint.position);
        e.glint.scale.setScalar(0.25 + (0.45 - e.windup) * 0.8);
      }
      if (e.windup <= 0) {
        this.shoot(e, player, STATS.based.damage, STATS.based.spreadDeg);
        e.fireT = 1.9;
      }
    } else if (e.fireT <= 0) {
      e.windup = 0.45;
    }
  }

  private grenadierAttack(e: Enemy, dt: number, player: PlayerView, dist: number, sees: boolean, buffed: boolean): void {
    if (e.hopK >= 0) return;
    e.fireT -= dt * (buffed ? 1.25 : 1);
    if (e.windup > 0) {
      e.windup -= dt;
      if (e.windup <= 0) {
        const T = 1.4;
        const from = e.pos.clone().add(new THREE.Vector3(0, 1.0, 0));
        const target = player.pos.clone().addScaledVector(player.vel, 0.5);
        const vel = target.sub(from).divideScalar(T);
        vel.y += 0.5 * 19.6 * T;
        this.hooks.throwGrenade(from, vel);
        e.fireT = 4.5;
      }
      return;
    }
    if (!sees || dist < 5 || dist > STATS.grenadier.range) return;
    if (e.fireT <= 0) {
      e.windup = 0.7;
      this.hooks.sfx('whistle_grenade', e.pos);
    }
  }

  private sniperFire(e: Enemy, dt: number, player: PlayerView, dist: number, sees: boolean): void {
    e.fireT -= dt;
    if (e.windup > 0) {
      e.windup -= dt;
      if (e.glint) {
        e.model.muzzleWorld(e.glint.position);
        e.glint.scale.setScalar(0.35 + Math.sin(e.windup * 30) * 0.12 + (1 - e.windup) * 0.5);
      }
      if (e.windup <= 0) {
        if (sees) this.shoot(e, player, STATS.sniper.damage, STATS.sniper.spreadDeg);
        e.fireT = 3.5;
      }
      return;
    }
    if (!sees || dist > STATS.sniper.range) return;
    if (e.fireT <= 0) {
      e.windup = 1.0;
      this.hooks.sfx('glint', e.pos);
    }
  }

  private shoot(e: Enemy, player: PlayerView, damage: number, spreadDeg: number): void {
    const muzzle = e.model.muzzleWorld(new THREE.Vector3());
    const target = player.pos.clone();
    target.y += 0.5;
    const dir = target.sub(muzzle).normalize();
    const s = THREE.MathUtils.degToRad(spreadDeg);
    dir.x += (Math.random() - 0.5) * s;
    dir.y += (Math.random() - 0.5) * s;
    dir.z += (Math.random() - 0.5) * s;
    dir.normalize();
    const c = player.pos.clone();
    c.y += 0.5;
    const oc = muzzle.clone().sub(c);
    const b = oc.dot(dir);
    const disc = b * b - (oc.dot(oc) - 0.34 * 0.34);
    let tPlayer = Infinity;
    if (disc >= 0) {
      const t = -b - Math.sqrt(disc);
      if (t > 0) tPlayer = t;
    }
    const wh = this.world.raycast(muzzle, dir, Math.min(tPlayer, 80));
    let end: THREE.Vector3;
    if (tPlayer < Infinity && (!wh || wh.t > tPlayer)) {
      end = muzzle.clone().addScaledVector(dir, tPlayer);
      this.hooks.playerHit(damage, e.pos);
    } else if (wh) {
      end = wh.point;
      this.fx.hitSpark(end, 0xbbb4a4);
    } else {
      end = muzzle.clone().addScaledVector(dir, 80);
    }
    this.fx.tracer(muzzle, end, 0xffd9a0);
    this.fx.muzzleFlash(muzzle, false);
    this.hooks.sfx('rifle', muzzle);
    if (e.type !== 'sniper' && !e.molded && e.state !== 'charge') e.model.setPose('aim');
  }

  // ------------------------------------------------------------ movement

  private move(e: Enemy, dt: number): void {
    if (e.state === 'toppled' || e.rising > 0) return;
    if (e.molded) { this.hop(e, dt); return; }
    if (e.type === 'sniper') return;

    const wish = this.tmp.set(0, 0, 0);
    const toTarget = this.tmp2.subVectors(e.lastSeen, e.pos);
    toTarget.y = 0;
    const dist = toTarget.length();
    const speed = e.state === 'flee' ? 4.6 : e.state === 'charge' ? 4.8 : e.type === 'flamer' ? 3.8 : 3.2;
    if (e.state === 'flee') {
      wish.copy(toTarget).multiplyScalar(-1);
    } else if (e.state === 'charge') {
      wish.copy(toTarget);
    } else if (e.state === 'combat' || e.state === 'suspicious') {
      const near = e.type === 'officer' ? 12 : e.type === 'flamer' ? 3 : 6;
      const far = e.type === 'officer' ? 17 : e.type === 'flamer' ? 5.5 : 10;
      const leashed = e.pos.distanceTo(e.home) > 14 && dist > 6;
      if (leashed) wish.subVectors(e.home, e.pos);
      else if (dist > far) wish.copy(toTarget);
      else if (dist < near) wish.copy(toTarget).multiplyScalar(-1);
      else if (e.state === 'combat') {
        e.strafeT -= dt;
        if (e.strafeT <= 0) { e.strafeSide = Math.random() < 0.5 ? -1 : 1; e.strafeT = rand(1.4, 3); }
        wish.set(-toTarget.z, 0, toTarget.x).multiplyScalar(e.strafeSide);
      }
    }
    wish.y = 0;
    if (wish.lengthSq() > 0.01) {
      wish.normalize();
      const probe = e.pos.clone();
      probe.y += 0.5;
      if (this.world.raycast(probe, wish, 1.3)) {
        const l = wish.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 1.05);
        const r = wish.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -1.05);
        if (!this.world.raycast(probe, l, 1.3)) wish.copy(l);
        else if (!this.world.raycast(probe, r, 1.3)) wish.copy(r);
        else wish.set(0, 0, 0);
      }
      e.moving = wish.lengthSq() > 0.01;
    }
    const k = 1 - Math.exp(-10 * dt);
    e.vel.x += (wish.x * speed - e.vel.x) * k;
    e.vel.z += (wish.z * speed - e.vel.z) * k;
    e.vel.y -= 19.6 * dt;
    e.pos.addScaledVector(e.vel, dt);
    const res = this.world.resolveCapsule(e.pos, RADIUS, HEIGHT, 0.35, e.grounded);
    e.grounded = res.grounded;
    if (res.grounded && e.vel.y < 0) e.vel.y = 0;
    if (e.moving && e.state !== 'combat' && e.state !== 'charge') e.yaw = dampAngle(e.yaw, Math.atan2(-wish.x, -wish.z), 10, dt);
    if (e.pos.y < -10) { e.hp = 0; e.state = 'dead'; e.model.startDeath('shatter', 0); }
  }

  private hop(e: Enemy, dt: number): void {
    if (e.hopK >= 0) {
      e.hopK += dt / 0.55;
      const k = Math.min(1, e.hopK);
      e.pos.lerpVectors(e.hopFrom, e.hopTo, k);
      e.pos.y = THREE.MathUtils.lerp(e.hopFrom.y, e.hopTo.y, k) + Math.sin(k * Math.PI) * 0.5;
      if (e.hopK >= 1) { e.hopK = -1; e.pos.copy(e.hopTo); this.hooks.sfx('clack', e.pos); }
      return;
    }
    if (e.state !== 'combat' || e.nodes.length < 2) return;
    e.hopT -= dt * (this.officerNear(e) ? 1.3 : 1);
    if (e.hopT <= 0) {
      e.hopT = e.type === 'grenadier' ? rand(4, 6) : rand(2.8, 4.5);
      const others = e.nodes.filter((n) => n.distanceToSquared(e.pos) > 0.5);
      if (others.length) {
        e.hopFrom.copy(e.pos);
        e.hopTo.copy(others[Math.floor(Math.random() * others.length)]);
        e.hopK = 0;
        e.windup = 0;
      }
    }
  }
}
