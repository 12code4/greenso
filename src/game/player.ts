// Player controller at map-bible metrics (1 unit = 1 soldier height):
// walk 4 u/s, sprint 7, jump mounts 1.2u ledges, auto-step 0.35u,
// crouch clearance 0.55u. Feet-origin capsule.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { Input } from '../core/input';

export const WALK_SPEED = 4;
export const SPRINT_SPEED = 7;
export const CROUCH_SPEED = 2;
export const AIM_SPEED = 2.8;
const JUMP_APEX = 1.35; // mounts a 1.28u alphabet block
const GRAVITY = 19.6;
const FALL_GRAVITY = 29;
const JUMP_CUT_GRAVITY = 42; // released jump early
const GROUND_ACCEL_RATE = 12; // exp damping toward wish velocity
const AIR_ACCEL_RATE = 3.5;
const COYOTE = 0.1;
const JUMP_BUFFER = 0.12;
const STEP_HEIGHT = 0.35;
const RADIUS = 0.18;
const STAND_HEIGHT = 1.0;
const CROUCH_HEIGHT = 0.52;
const DIVE_SPEED = 9.5;
const DIVE_TIME = 0.38;

export class Player {
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  grounded = false;
  crouched = false;
  sprinting = false;
  diving = false;
  facing = 0; // yaw of the visual model
  root = new THREE.Group();

  private spawn: THREE.Vector3;
  private coyote = 0;
  private jumpBuf = 0;
  private jumpHeld = false;
  private diveTimer = 0;
  private body: THREE.Mesh;
  private bobPhase = 0;

  constructor(spawn: THREE.Vector3) {
    this.spawn = spawn.clone();
    this.pos.copy(spawn);
    this.body = buildSoldier(this.root);
  }

  get height(): number {
    return this.crouched || this.diving ? CROUCH_HEIGHT : STAND_HEIGHT;
  }

  /** Eye/pivot height for the camera. */
  get pivotHeight(): number {
    return this.crouched || this.diving ? 0.5 : 0.95;
  }

  update(dt: number, input: Input, camYaw: number, aiming: boolean, world: CollisionWorld): void {
    // --- Intent ---
    let ix = 0;
    let iz = 0;
    if (input.held('KeyW')) iz -= 1;
    if (input.held('KeyS')) iz += 1;
    if (input.held('KeyA')) ix -= 1;
    if (input.held('KeyD')) ix += 1;
    const hasInput = ix !== 0 || iz !== 0;

    const wantCrouch = input.held('KeyC') || input.held('ControlLeft') || input.held('ControlRight');
    const wantSprint = input.held('ShiftLeft') || input.held('ShiftRight');

    // Crouch state (only stand up when there is headroom — greybox worlds
    // are sparse, so we cheat and always allow standing; revisit at M1).
    this.crouched = wantCrouch && this.grounded && !this.diving;
    this.sprinting = wantSprint && hasInput && !this.crouched && !aiming && !this.diving;

    // Camera-relative wish direction.
    // Camera forward on the ground plane is (sin yaw, cos yaw); right is
    // (-cos yaw, sin yaw). W (iz=-1) must map to +forward.
    const sin = Math.sin(camYaw);
    const cos = Math.cos(camYaw);
    let wx = -iz * sin - ix * cos;
    let wz = -iz * cos + ix * sin;
    const wl = Math.hypot(wx, wz);
    if (wl > 1e-5) {
      wx /= wl;
      wz /= wl;
    }

    // --- Dive: committal dodge out of a sprint ---
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

    // --- Horizontal velocity: damp toward wish velocity ---
    if (!this.diving) {
      const speed = this.crouched
        ? CROUCH_SPEED
        : aiming
          ? AIM_SPEED
          : this.sprinting
            ? SPRINT_SPEED
            : WALK_SPEED;
      const rate = this.grounded ? GROUND_ACCEL_RATE : AIR_ACCEL_RATE;
      const k = 1 - Math.exp(-rate * dt);
      this.vel.x += (wx * speed - this.vel.x) * k;
      this.vel.z += (wz * speed - this.vel.z) * k;
    }

    // --- Jump ---
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

    // --- Gravity (heavier when falling; heavier still on early release) ---
    const g = this.vel.y > 0 ? (this.jumpHeld ? GRAVITY : JUMP_CUT_GRAVITY) : FALL_GRAVITY;
    this.vel.y -= g * dt;
    if (this.vel.y < -30) this.vel.y = -30;

    // --- Integrate & resolve ---
    const wasGrounded = this.grounded;
    this.pos.addScaledVector(this.vel, dt);
    const res = world.resolveCapsule(this.pos, RADIUS, this.height, STEP_HEIGHT, wasGrounded);
    this.grounded = res.grounded;
    if (res.grounded && this.vel.y < 0) this.vel.y = 0;
    if (res.hitCeiling && this.vel.y > 0) this.vel.y = 0;

    // Fell off the world (shouldn't happen in the arena, but be kind)
    if (this.pos.y < -20) this.respawn();

    // --- Visual: face movement (or camera while aiming), lean, bob ---
    const targetYaw = aiming
      ? camYaw + Math.PI
      : hasInput
        ? Math.atan2(wx, wz) + Math.PI
        : this.facing;
    this.facing = dampAngle(this.facing, targetYaw, aiming ? 18 : 12, dt);
    this.root.rotation.y = this.facing;
    this.root.position.copy(this.pos);

    const hSpeed = Math.hypot(this.vel.x, this.vel.z);
    this.bobPhase += hSpeed * dt * 2.2;
    const bob = this.grounded ? Math.abs(Math.sin(this.bobPhase)) * 0.028 * Math.min(1, hSpeed / 4) : 0;
    this.body.position.y = bob;
    // Lean into acceleration direction
    const leanX = THREE.MathUtils.clamp((this.vel.x * -Math.sin(this.facing + Math.PI) + this.vel.z * -Math.cos(this.facing + Math.PI)) * 0.012, -0.12, 0.12);
    this.root.rotation.x = this.diving ? -0.9 : leanX;
    const scaleY = this.crouched ? 0.62 : 1;
    this.body.scale.y += (scaleY - this.body.scale.y) * (1 - Math.exp(-14 * dt));
  }

  respawn(): void {
    this.pos.copy(this.spawn);
    this.vel.set(0, 0, 0);
  }
}

function dampAngle(a: number, b: number, rate: number, dt: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * (1 - Math.exp(-rate * dt));
}

/** Placeholder green soldier: capsule body, helmet, rifle. Pose-snap is M1. */
function buildSoldier(root: THREE.Group): THREE.Mesh {
  const green = new THREE.MeshStandardMaterial({
    color: 0x3e7a34,
    roughness: 0.35,
    metalness: 0.0,
  });
  const darkGreen = new THREE.MeshStandardMaterial({
    color: 0x2f5c28,
    roughness: 0.4,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 12), green);
  body.position.y = 0; // container; children below
  body.castShadow = true;

  // Torso capsule: center it so feet are at y=0
  body.geometry.translate(0, 0.41, 0);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), darkGreen);
  helmet.scale.y = 0.8;
  helmet.position.y = 0.92;
  helmet.castShadow = true;
  body.add(helmet);

  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.175, 0.035, 12), darkGreen);
  brim.position.y = 0.86;
  body.add(brim);

  // Rifle, molded to his hands since 1962
  const rifle = new THREE.Group();
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.5), darkGreen);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.45, 8), darkGreen);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -0.42;
  rifle.add(stock, barrel);
  rifle.position.set(0.16, 0.62, -0.18);
  rifle.castShadow = true;
  body.add(rifle);

  root.add(body);
  return body;
}
