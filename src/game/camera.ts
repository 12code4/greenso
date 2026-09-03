// Third-person spring camera with whisker collision and aim mode.
// The M0 exit criterion lives here: the camera never fights the player.

import * as THREE from 'three';
import { CollisionWorld } from '../sim/collision';
import { Input } from '../core/input';

const SENS = 0.0023; // rad per px
/** Player look options (Update 3 minimal options): [ ] sensitivity, I invert. */
export const LOOK = { sens: 1, invertY: false };
const AIM_SENS_SCALE = 0.55;
const PITCH_MIN = -1.15;
const PITCH_MAX = 1.35;
const DIST_NORMAL = 2.7;
const DIST_AIM = 1.35;
const FOV_NORMAL = 62;
const FOV_AIM = 48;
const FOV_SPRINT_ADD = 6;
const COLLIDE_MARGIN = 0.09;

export class ThirdPersonCamera {
  readonly camera: THREE.PerspectiveCamera;
  yaw = Math.PI; // facing -Z
  pitch = 0.18;
  private pivot = new THREE.Vector3();
  private boom = DIST_NORMAL;
  private recoil = 0;
  private recoilVel = 0;
  private shoulderT = 0; // 0 = hip framing, 1 = aim framing
  private trauma = 0; // 0..1 shake energy (quakes, hits)
  /** Fraction of recent frames the boom was pulled in hard (camera QA gate). */
  boomPulledFrac = 0;
  /** Aim-mode FOV; weapons set this (sniper zooms tighter). */
  aimFov = FOV_AIM;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(FOV_NORMAL, aspect, 0.03, 400);
  }

  addRecoil(amount: number): void {
    this.recoilVel += amount;
  }

  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(
    dt: number,
    input: Input,
    targetPos: THREE.Vector3,
    pivotHeight: number,
    aiming: boolean,
    sprinting: boolean,
    world: CollisionWorld,
  ): void {
    // --- Look ---
    const { dx, dy } = input.consumeMouse();
    const s = SENS * LOOK.sens * (aiming ? AIM_SENS_SCALE : 1);
    this.yaw -= dx * s;
    this.pitch = THREE.MathUtils.clamp(this.pitch + (LOOK.invertY ? -dy : dy) * s, PITCH_MIN, PITCH_MAX);

    // Recoil spring (kick up, glide back)
    this.recoilVel += (-this.recoil * 140 - this.recoilVel * 18) * dt;
    this.recoil += this.recoilVel * dt;

    // --- Pivot follows the player, softly ---
    const kxz = 1 - Math.exp(-22 * dt);
    const ky = 1 - Math.exp(-14 * dt);
    this.pivot.x += (targetPos.x - this.pivot.x) * kxz;
    this.pivot.z += (targetPos.z - this.pivot.z) * kxz;
    this.pivot.y += (targetPos.y + pivotHeight - this.pivot.y) * ky;

    // --- Aim framing blend ---
    const tgtShoulder = aiming ? 1 : 0;
    this.shoulderT += (tgtShoulder - this.shoulderT) * (1 - Math.exp(-12 * dt));
    const t = this.shoulderT;

    const pitch = this.pitch + this.recoil;
    const dir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(pitch),
      -Math.sin(pitch),
      Math.cos(this.yaw) * Math.cos(pitch),
    ); // from camera toward pivot... we place camera at pivot - dir*boom
    const right = new THREE.Vector3(-Math.cos(this.yaw), 0, Math.sin(this.yaw));

    // Shoulder offset (slides right + slightly up as you aim)
    const offset = right
      .clone()
      .multiplyScalar(0.2 + 0.22 * t)
      .add(new THREE.Vector3(0, 0.1 * t, 0));
    const anchor = this.pivot.clone().add(offset);

    // --- Boom with whisker collision: snap in, ease out ---
    const wantDist = DIST_NORMAL + (DIST_AIM - DIST_NORMAL) * t;
    const back = dir.clone().multiplyScalar(-1);
    let clear = wantDist;
    const whiskers = [
      new THREE.Vector3(0, 0, 0),
      right.clone().multiplyScalar(0.06),
      right.clone().multiplyScalar(-0.06),
      new THREE.Vector3(0, 0.06, 0),
      new THREE.Vector3(0, -0.06, 0),
    ];
    for (const w of whiskers) {
      const hit = world.raycast(anchor.clone().add(w), back, wantDist + COLLIDE_MARGIN);
      if (hit) clear = Math.min(clear, hit.t - COLLIDE_MARGIN);
    }
    clear = Math.max(0.25, clear);
    if (clear < this.boom) this.boom = clear; // snap in
    else this.boom += (Math.min(clear, wantDist) - this.boom) * (1 - Math.exp(-5 * dt)); // ease out

    this.camera.position.copy(anchor).addScaledVector(back, this.boom);
    this.camera.lookAt(anchor.clone().addScaledVector(dir, 2));

    // Trauma shake: squared falloff, decays fast
    if (this.trauma > 0) {
      const s = this.trauma * this.trauma;
      this.camera.position.x += (Math.random() - 0.5) * 0.12 * s;
      this.camera.position.y += (Math.random() - 0.5) * 0.12 * s;
      this.camera.rotation.z += (Math.random() - 0.5) * 0.035 * s;
      this.trauma = Math.max(0, this.trauma - dt * 1.8);
    }
    this.boomPulledFrac += ((this.boom < 1.0 ? 1 : 0) - this.boomPulledFrac) * (1 - Math.exp(-0.5 * dt));

    // --- FOV ---
    const wantFov = (aiming ? this.aimFov : FOV_NORMAL) + (sprinting ? FOV_SPRINT_ADD : 0);
    this.camera.fov += (wantFov - this.camera.fov) * (1 - Math.exp(-10 * dt));
    this.camera.updateProjectionMatrix();
  }

  /** World-space ray through the crosshair. */
  aimRay(): { origin: THREE.Vector3; dir: THREE.Vector3 } {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return { origin: this.camera.position.clone(), dir };
  }
}
