// Player controller at map-bible metrics (1 unit = 1 soldier height):
// walk 4 u/s, sprint 7, jump mounts 1.2u ledges, auto-step 0.35u,
// crouch clearance 0.55u. Feet-origin capsule. Melt Meter health; toy deaths.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { Input } from '../core/input';
import { SoldierModel } from './soldier';
import { dampAngle } from '../core/math';

export const WALK_SPEED = 4;
export const SPRINT_SPEED = 7;
export const CROUCH_SPEED = 2;
export const AIM_SPEED = 2.8;
const JUMP_APEX = 1.35; // mounts a 1.2u ledge
const GRAVITY = 19.6;
const FALL_GRAVITY = 29;
const JUMP_CUT_GRAVITY = 42;
const GROUND_ACCEL_RATE = 12;
const AIR_ACCEL_RATE = 3.5;
const COYOTE = 0.1;
const JUMP_BUFFER = 0.12;
const STEP_HEIGHT = 0.35;
const RADIUS = 0.18;
const STAND_HEIGHT = 1.0;
const CROUCH_HEIGHT = 0.52;
const DIVE_SPEED = 9.5;
const DIVE_TIME = 0.38;
const RESPAWN_DELAY = 2.2;

export class Player {
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  grounded = false;
  crouched = false;
  sprinting = false;
  diving = false;
  facing = 0;
  root = new THREE.Group();
  push = new THREE.Vector3();
  readonly radius = RADIUS;

  // Melt meter
  hp = 100;
  readonly maxHp = 100;
  alive = true;
  deaths = 0;
  invuln = 0;
  private deathTimer = 0;
  onDamaged: ((amount: number, from: THREE.Vector3 | null) => void) | null = null;
  onDeath: (() => void) | null = null;
  onRespawn: (() => void) | null = null;

  model: SoldierModel;
  /** Just landed hard this frame (for the plastic clack). */
  landed = false;
  /** Dove into something this frame. */
  divedInto: THREE.Vector3 | null = null;

  private spawn: THREE.Vector3;
  private coyote = 0;
  private jumpBuf = 0;
  private jumpHeld = false;
  private diveTimer = 0;
  private wasGroundedLast = true;
  private fallSpeed = 0;
  private scene: THREE.Scene | null = null;

  constructor(spawn: THREE.Vector3) {
    this.spawn = spawn.clone();
    this.pos.copy(spawn);
    this.model = new SoldierModel({ team: 'green' });
    this.root.add(this.model.root);
  }

  attachTo(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.root);
  }

  get height(): number {
    return this.crouched || this.diving ? CROUCH_HEIGHT : STAND_HEIGHT;
  }

  get pivotHeight(): number {
    return this.crouched || this.diving ? 0.5 : 0.95;
  }

  muzzleWorld(out: THREE.Vector3): THREE.Vector3 {
    return this.model.muzzleWorld(out);
  }

  // ------------------------------------------------------------ health

  takeDamage(amount: number, from: THREE.Vector3 | null): void {
    if (!this.alive || this.invuln > 0) return;
    this.hp -= amount;
    if (this.onDamaged) this.onDamaged(amount, from);
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return;
    }
    const f = this.hp / this.maxHp;
    this.model.setDamageStage(f < 0.25 ? 3 : f < 0.6 ? 2 : 1);
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    const f = this.hp / this.maxHp;
    this.model.setDamageStage(f >= 1 ? 0 : f < 0.25 ? 3 : f < 0.6 ? 2 : 1);
  }

  private die(): void {
    this.alive = false;
    this.deaths++;
    this.deathTimer = RESPAWN_DELAY;
    this.model.startDeath('shatter', this.pos.y);
    this.vel.set(0, 0, 0);
    if (this.onDeath) this.onDeath();
  }

  respawnAt(at: THREE.Vector3): void {
    // A fresh copy from the toy bin
    this.model.dispose();
    this.model = new SoldierModel({ team: 'green' });
    this.root.add(this.model.root);
    if (this.scene) this.model.attachTo(this.scene);
    this.model.root.position.set(0, 0, 0);
    this.pos.copy(at);
    this.vel.set(0, 0, 0);
    this.hp = this.maxHp;
    this.alive = true;
    this.invuln = 1.5;
    this.crouched = false;
    this.diving = false;
    if (this.onRespawn) this.onRespawn();
  }

  /** Returns true when the respawn delay has elapsed (caller respawns at a checkpoint). */
  updateDead(dt: number): boolean {
    this.model.update(dt);
    this.deathTimer -= dt;
    return this.deathTimer <= 0;
  }

  // ------------------------------------------------------------ movement

  update(dt: number, input: Input, camYaw: number, aiming: boolean, world: CollisionWorld): void {
    this.landed = false;
    this.divedInto = null;
    if (this.invuln > 0) this.invuln -= dt;

    let ix = 0, iz = 0;
    if (input.held('KeyW')) iz -= 1;
    if (input.held('KeyS')) iz += 1;
    if (input.held('KeyA')) ix -= 1;
    if (input.held('KeyD')) ix += 1;
    const hasInput = ix !== 0 || iz !== 0;

    const wantCrouch = input.held('KeyC') || input.held('ControlLeft') || input.held('ControlRight');
    const wantSprint = input.held('ShiftLeft') || input.held('ShiftRight');
    this.crouched = wantCrouch && this.grounded && !this.diving;
    this.sprinting = wantSprint && hasInput && !this.crouched && !aiming && !this.diving;

    // Camera-relative wish direction (forward = (sin yaw, cos yaw))
    const sin = Math.sin(camYaw), cos = Math.cos(camYaw);
    let wx = -iz * sin - ix * cos;
    let wz = -iz * cos + ix * sin;
    const wl = Math.hypot(wx, wz);
    if (wl > 1e-5) { wx /= wl; wz /= wl; }

    // Dive
    if (this.diving) {
      this.diveTimer -= dt;
      if (this.diveTimer <= 0 && this.grounded) this.diving = false;
    } else if (this.sprinting && input.pressed('KeyC') && this.grounded) {
      this.diving = true;
      this.diveTimer = DIVE_TIME;
      this.vel.x = wx * DIVE_SPEED;
      this.vel.z = wz * DIVE_SPEED;
      this.vel.y = 2.2;
      this.grounded = false;
    }

    if (!this.diving) {
      const speed = this.crouched ? CROUCH_SPEED : aiming ? AIM_SPEED : this.sprinting ? SPRINT_SPEED : WALK_SPEED;
      const rate = this.grounded ? GROUND_ACCEL_RATE : AIR_ACCEL_RATE;
      const k = 1 - Math.exp(-rate * dt);
      this.vel.x += (wx * speed - this.vel.x) * k;
      this.vel.z += (wz * speed - this.vel.z) * k;
    }

    this.vel.x += this.push.x * dt;
    this.vel.z += this.push.z * dt;
    if (this.push.y > 0) this.vel.y += this.push.y * dt;
    this.push.set(0, 0, 0);

    // Jump
    this.coyote = this.grounded ? COYOTE : Math.max(0, this.coyote - dt);
    this.jumpBuf = input.pressed('Space') ? JUMP_BUFFER : Math.max(0, this.jumpBuf - dt);
    if (this.jumpBuf > 0 && this.coyote > 0 && !this.diving) {
      this.vel.y = Math.sqrt(2 * GRAVITY * JUMP_APEX);
      this.grounded = false;
      this.coyote = 0;
      this.jumpBuf = 0;
      this.crouched = false;
    }
    this.jumpHeld = input.held('Space');

    const g = this.vel.y > 0 ? (this.jumpHeld ? GRAVITY : JUMP_CUT_GRAVITY) : FALL_GRAVITY;
    this.vel.y -= g * dt;
    if (this.vel.y < -30) this.vel.y = -30;
    this.fallSpeed = -this.vel.y;

    const wasGrounded = this.grounded;
    this.pos.addScaledVector(this.vel, dt);
    const res = world.resolveCapsule(this.pos, RADIUS, this.height, STEP_HEIGHT, wasGrounded);
    this.grounded = res.grounded;
    if (res.grounded && this.vel.y < 0) this.vel.y = 0;
    if (res.hitCeiling && this.vel.y > 0) this.vel.y = 0;
    if (this.grounded && !this.wasGroundedLast && this.fallSpeed > 4) this.landed = true;
    if (this.diving && res.hitWall) this.divedInto = this.pos.clone();
    this.wasGroundedLast = this.grounded;

    if (this.pos.y < -20) this.pos.copy(this.spawn);

    // ---- Visual: face movement (or camera while aiming), pose-snap, lean
    const targetYaw = aiming ? camYaw + Math.PI : hasInput ? Math.atan2(wx, wz) + Math.PI : this.facing;
    this.facing = dampAngle(this.facing, targetYaw, aiming ? 18 : 12, dt);
    this.root.rotation.y = this.facing;
    this.root.position.copy(this.pos);
    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    this.model.animateLocomotion(dt, this.grounded && hSpeed > 0.8, aiming);
    if (this.crouched && !this.diving) this.model.setPose('kneel');
    this.root.rotation.x = this.diving ? -0.9 : 0;
    this.model.update(dt);
  }
}
