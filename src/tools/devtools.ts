// Authoring aids (docs/06 §3): F8 free-cam, P position logger, F9 region
// overlay — plus a test-only autopilot that walks the player to a point so
// tools/walk.mjs can prove route reachability.

import * as THREE from 'three';
import { Input } from '../core/input';
import { ThirdPersonCamera } from '../game/camera';
import { Player } from '../game/player';
import { Hud } from '../ui/hud';
import { RegionSystem } from '../maps/runtime/regions';

export class DevTools {
  freeCam = false;
  private overlay = new THREE.Group();
  private overlayOn = false;
  private freePos = new THREE.Vector3();
  private freeYaw = 0;
  private freePitch = 0;

  constructor(scene: THREE.Scene, private regions: RegionSystem) {
    this.overlay.visible = false;
    scene.add(this.overlay);
    const colors: Record<string, number> = { arena: 0xff5a3c, connector: 0x4aa0ff, overlook: 0xffd257, secret: 0xd96bd0, exit: 0x8bc46a };
    for (const r of regions.regions) {
      const size = new THREE.Vector3().subVectors(r.box.max, r.box.min);
      const center = new THREE.Vector3().addVectors(r.box.min, r.box.max).multiplyScalar(0.5);
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z)),
        new THREE.LineBasicMaterial({ color: colors[r.def.kind] ?? 0xffffff, transparent: true, opacity: 0.8 }),
      );
      box.position.copy(center);
      this.overlay.add(box);
    }
  }

  /** Scripts: park the free-cam at an exact vantage (photo tours). */
  place(pos: THREE.Vector3, yaw: number, pitch: number, cam: ThirdPersonCamera): void {
    this.freeCam = true;
    this.freePos.copy(pos);
    this.freeYaw = yaw;
    this.freePitch = pitch;
    cam.camera.position.copy(pos);
    cam.camera.rotation.set(0, 0, 0);
    cam.camera.rotation.order = 'YXZ';
    cam.camera.rotation.y = yaw;
    cam.camera.rotation.x = pitch;
  }

  /** Returns true when the free-cam has taken over the camera this frame. */
  update(dt: number, input: Input, cam: ThirdPersonCamera, player: Player, hud: Hud): boolean {
    if (input.pressed('F9')) {
      this.overlayOn = !this.overlayOn;
      this.overlay.visible = this.overlayOn;
      hud.toast(`Region overlay ${this.overlayOn ? 'on' : 'off'}`);
    }
    if (input.pressed('KeyP')) {
      const p = player.pos;
      const s = `[${p.x.toFixed(1)}, ${p.y.toFixed(2)}, ${p.z.toFixed(1)}]`;
      const r = this.regions.regionAt(p)?.def.id ?? '—';
      console.log(`[pos] ${s} region=${r}`);
      hud.toast(`${s} · ${r}`, 4);
    }
    if (input.pressed('F8')) {
      this.freeCam = !this.freeCam;
      if (this.freeCam) {
        this.freePos.copy(cam.camera.position);
        this.freeYaw = cam.yaw;
        this.freePitch = cam.pitch;
      }
      hud.toast(`Free-cam ${this.freeCam ? 'on' : 'off'}`);
    }
    if (!this.freeCam) return false;

    const { dx, dy } = input.consumeMouse();
    this.freeYaw -= dx * 0.0023;
    this.freePitch = THREE.MathUtils.clamp(this.freePitch + dy * 0.0023, -1.5, 1.5);
    const dir = new THREE.Vector3(
      Math.sin(this.freeYaw) * Math.cos(this.freePitch),
      -Math.sin(this.freePitch),
      Math.cos(this.freeYaw) * Math.cos(this.freePitch),
    );
    const right = new THREE.Vector3(-Math.cos(this.freeYaw), 0, Math.sin(this.freeYaw));
    const speed = input.held('ShiftLeft') ? 30 : 10;
    if (input.held('KeyW')) this.freePos.addScaledVector(dir, speed * dt);
    if (input.held('KeyS')) this.freePos.addScaledVector(dir, -speed * dt);
    if (input.held('KeyD')) this.freePos.addScaledVector(right, speed * dt);
    if (input.held('KeyA')) this.freePos.addScaledVector(right, -speed * dt);
    if (input.held('Space')) this.freePos.y += speed * dt;
    if (input.held('KeyC')) this.freePos.y -= speed * dt;
    cam.camera.position.copy(this.freePos);
    cam.camera.lookAt(this.freePos.clone().add(dir));
    cam.camera.rotation.z = 0;
    return true;
  }
}

/** Test-only: steer the player toward a point using the real controls. */
export class Autopilot {
  target: THREE.Vector3 | null = null;
  arrived = false;
  private stuckT = 0;
  private lastPos = new THREE.Vector3();
  private jumpCooldown = 0;
  /** Hold Space for this many GAME seconds (a wall-clock timer would release
   *  before the next frame in a slow headless browser and cut the jump). */
  private jumpHold = 0;

  walkTo(p: THREE.Vector3): void {
    this.target = p.clone();
    this.arrived = false;
    this.stuckT = 0;
  }

  stop(input: Input): void {
    this.target = null;
    input.injectKey('KeyW', false);
    input.injectKey('ShiftLeft', false);
    input.injectKey('Space', false);
    this.jumpHold = 0;
  }

  update(dt: number, input: Input, cam: ThirdPersonCamera, player: Player): void {
    if (!this.target) return;
    const dx = this.target.x - player.pos.x;
    const dz = this.target.z - player.pos.z;
    const dy = this.target.y - player.pos.y;
    const horiz = Math.hypot(dx, dz);
    if (horiz < 0.6 && Math.abs(dy) < 0.9) {
      this.arrived = true;
      this.stop(input);
      return;
    }
    cam.yaw = Math.atan2(dx, dz);
    cam.pitch = 0.15;
    const moved = player.pos.distanceTo(this.lastPos);
    this.stuckT = moved < 0.4 * dt * 4 ? this.stuckT + dt : 0;
    this.lastPos.copy(player.pos);
    this.jumpCooldown -= dt;
    if (this.jumpHold > 0) {
      this.jumpHold -= dt;
      if (this.jumpHold <= 0) input.injectKey('Space', false);
    }
    // A hop: the target is above us and close. Wind up for it — don't walk off the ledge we're on while the
    // jump is still cooling down (a turnaround ledge 2.5 u back and 1 u up needs the jump to start from here).
    const hop = dy > 0.3 && horiz < 2.6;
    if (hop && player.grounded && this.jumpHold <= 0 && this.jumpCooldown > 0) {
      input.injectKey('KeyW', false);
      input.injectKey('ShiftLeft', false);
      return;
    }
    input.injectKey('KeyW', true);
    input.injectKey('ShiftLeft', horiz > 4);
    // Jump for a hop, or when stuck against something
    const wantJump = hop || this.stuckT > 0.35;
    if (wantJump && this.jumpCooldown <= 0 && player.grounded && this.jumpHold <= 0) {
      input.injectKey('Space', true);
      this.jumpHold = 0.35;
      this.jumpCooldown = 0.8;
      this.stuckT = 0;
    }
  }
}
