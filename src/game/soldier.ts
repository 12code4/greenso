// The soldier model — shared by the player and every Tan. Primitives only,
// plastic material, and POSE-SNAP animation (docs/04 bet 2): a library of
// molded poses snapped between at ~9 fps instead of skeletal blending.
// Damage is material damage (scuffed → warped → critical) and deaths are
// toy deaths (shatter / melt).

import * as THREE from 'three';
import { mat } from '../maps/kit/materials';
import { rand } from '../core/math';

export type Team = 'green' | 'tan';
export type PoseName = 'idle' | 'runA' | 'runB' | 'aim' | 'throw' | 'kneel' | 'prone' | 'glued';
export type DeathKind = 'shatter' | 'melt';

export interface SoldierOptions {
  team: Team;
  /** Molded on a base: fixed pose, no locomotion. */
  based?: boolean;
  /** Officer's pennant. */
  pennant?: boolean;
  /** Prone sniper: model lies down. */
  prone?: boolean;
}

const PALETTE: Record<Team, { body: number; dark: number; rifle: number }> = {
  green: { body: 0x3e7a34, dark: 0x2f5c28, rifle: 0x243d1c },
  tan: { body: 0xc8a878, dark: 0xa8895a, rifle: 0x6b5638 },
};

interface Debris {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  life: number;
}

const SNAP_FPS = 9;

export class SoldierModel {
  root = new THREE.Group();
  private body = new THREE.Group(); // everything that tilts/scales with damage
  private torso: THREE.Mesh;
  private head: THREE.Group;
  private legL: THREE.Group;
  private legR: THREE.Group;
  private armL: THREE.Group;
  private armR: THREE.Group;
  private rifle: THREE.Group;
  private muzzle = new THREE.Object3D();
  private bodyMat: THREE.MeshPhysicalMaterial;
  private darkMat: THREE.MeshPhysicalMaterial;
  private base: THREE.Mesh | null = null;
  private opts: SoldierOptions;
  private pose: PoseName = 'idle';
  private snapClock = 0;
  private runFrame = 0;
  private stage = 0;
  private death: DeathKind | null = null;
  private deathT = 0;
  private debris: Debris[] = [];
  private puddle: THREE.Mesh | null = null;
  private scene: THREE.Scene | null = null;
  private groundY = 0;

  constructor(opts: SoldierOptions) {
    this.opts = opts;
    const pal = PALETTE[opts.team];
    this.bodyMat = (mat('PLASTIC_TOY', pal.body) as THREE.MeshPhysicalMaterial).clone();
    this.darkMat = (mat('PLASTIC_TOY', pal.dark) as THREE.MeshPhysicalMaterial).clone();
    const rifleMat = mat('PLASTIC_TOY', pal.rifle);

    // Legs (hip pivot at 0.45)
    this.legL = this.limb(0.075, 0.3, this.bodyMat, -0.09, 0.45);
    this.legR = this.limb(0.075, 0.3, this.bodyMat, 0.09, 0.45);
    // Torso
    this.torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.26, 4, 12), this.bodyMat);
    this.torso.position.y = 0.63;
    this.torso.castShadow = true;
    // Head + helmet
    this.head = new THREE.Group();
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), this.bodyMat);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), this.darkMat);
    helmet.scale.y = 0.75;
    helmet.position.y = 0.04;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.03, 12), this.darkMat);
    brim.position.y = -0.01;
    for (const m of [face, helmet, brim]) m.castShadow = true;
    this.head.add(face, helmet, brim);
    this.head.position.y = 0.93;
    // Arms (shoulder pivot)
    this.armL = this.limb(0.05, 0.26, this.bodyMat, -0.2, 0.82);
    this.armR = this.limb(0.05, 0.26, this.bodyMat, 0.2, 0.82);
    // Rifle, molded to his hands since 1962
    this.rifle = new THREE.Group();
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.5), rifleMat);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.45, 8), rifleMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.42;
    stock.castShadow = true;
    this.rifle.add(stock, barrel);
    this.muzzle.position.set(0, 0, -0.66);
    this.rifle.add(this.muzzle);
    this.rifle.position.set(0.12, 0.74, -0.16);

    this.body.add(this.legL, this.legR, this.torso, this.head, this.armL, this.armR, this.rifle);
    this.root.add(this.body);

    if (opts.based) {
      this.base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.06, 16), this.darkMat);
      this.base.position.y = 0.03;
      this.base.receiveShadow = true;
      this.root.add(this.base);
      this.body.position.y = 0.06;
    }
    if (opts.pennant) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), rifleMat);
      stick.position.set(-0.1, 1.15, 0.14);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.16), mat('FABRIC_SOFT', 0xd9463c));
      flag.position.set(0.04, 1.42, 0.14);
      (flag.material as THREE.Material).side = THREE.DoubleSide;
      this.body.add(stick, flag);
    }
    this.setPose(opts.prone ? 'prone' : opts.based ? 'aim' : 'idle');
  }

  private limb(r: number, len: number, m: THREE.Material, x: number, pivotY: number): THREE.Group {
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 8), m);
    mesh.position.y = -len / 2 - r * 0.5;
    mesh.castShadow = true;
    g.add(mesh);
    g.position.set(x, pivotY, 0);
    return g;
  }

  attachTo(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.root);
  }

  /** World-space muzzle position. */
  muzzleWorld(out: THREE.Vector3): THREE.Vector3 {
    this.root.updateWorldMatrix(true, false);
    return this.muzzle.getWorldPosition(out);
  }

  // ------------------------------------------------------------ poses

  setPose(p: PoseName): void {
    this.pose = p;
    const L = this.legL, R = this.legR, AL = this.armL, AR = this.armR, T = this.torso, B = this.body, H = this.head;
    // Reset
    L.rotation.set(0, 0, 0); R.rotation.set(0, 0, 0);
    AL.rotation.set(0, 0, 0); AR.rotation.set(0, 0, 0);
    T.rotation.set(0, 0, 0); H.rotation.set(0, 0, 0);
    B.rotation.set(0, 0, 0);
    B.position.y = this.opts.based ? 0.06 : 0;
    this.rifle.position.set(0.12, 0.74, -0.16);
    this.rifle.rotation.set(0, 0, 0);
    switch (p) {
      case 'idle':
        AL.rotation.x = -0.35; AR.rotation.x = -0.5; AR.rotation.z = 0.1;
        break;
      case 'runA':
        L.rotation.x = 0.75; R.rotation.x = -0.75;
        AL.rotation.x = -0.9; AR.rotation.x = -0.2;
        T.rotation.x = 0.12; B.position.y += 0.03;
        break;
      case 'runB':
        L.rotation.x = -0.75; R.rotation.x = 0.75;
        AL.rotation.x = -0.2; AR.rotation.x = -0.9;
        T.rotation.x = 0.12; B.position.y += 0.03;
        break;
      case 'aim':
        L.rotation.x = 0.18; R.rotation.x = -0.18;
        AL.rotation.x = -1.3; AL.rotation.z = 0.5; AR.rotation.x = -1.2;
        this.rifle.position.set(0.1, 0.84, -0.2);
        H.rotation.y = -0.15;
        break;
      case 'throw':
        L.rotation.x = 0.3; R.rotation.x = -0.4;
        AL.rotation.x = -0.6; AR.rotation.x = -2.6; AR.rotation.z = -0.3;
        T.rotation.y = -0.35; T.rotation.x = -0.1;
        this.rifle.position.set(-0.05, 0.66, -0.05); this.rifle.rotation.x = -0.6;
        break;
      case 'kneel':
        R.rotation.x = -1.5; L.rotation.x = 0.5;
        B.position.y -= 0.22;
        AL.rotation.x = -1.2; AL.rotation.z = 0.5; AR.rotation.x = -1.1;
        this.rifle.position.set(0.1, 0.8, -0.2);
        break;
      case 'prone':
        B.rotation.x = -Math.PI / 2;
        B.position.y += 0.16;
        AL.rotation.x = -1.6; AL.rotation.z = 0.4; AR.rotation.x = -1.6;
        this.rifle.position.set(0.08, 0.95, -0.25);
        H.rotation.x = 0.6;
        break;
      case 'glued':
        R.rotation.x = -1.5; L.rotation.x = 0.5;
        B.position.y -= 0.22;
        AL.rotation.x = 0.2; AR.rotation.x = 0.3; AR.rotation.z = 0.3;
        this.rifle.position.set(0.3, 0.05, 0.1); this.rifle.rotation.x = Math.PI / 2;
        H.rotation.x = 0.35;
        break;
    }
  }

  /** Pose-snap locomotion: alternate run frames at SNAP_FPS while moving. */
  animateLocomotion(dt: number, moving: boolean, aiming: boolean): void {
    if (this.death || this.opts.based || this.opts.prone) return;
    if (moving) {
      this.snapClock += dt;
      if (this.snapClock >= 1 / SNAP_FPS) {
        this.snapClock = 0;
        this.runFrame ^= 1;
        this.setPose(this.runFrame ? 'runA' : 'runB');
      }
    } else if (aiming) {
      if (this.pose !== 'aim') this.setPose('aim');
    } else if (this.pose !== 'idle' && this.pose !== 'throw' && this.pose !== 'kneel') {
      this.setPose('idle');
    }
  }

  // ------------------------------------------------------------ damage

  /** 0 fresh · 1 scuffed · 2 warped · 3 critical */
  setDamageStage(stage: number): void {
    if (stage === this.stage) return;
    this.stage = stage;
    const pal = PALETTE[this.opts.team];
    const base = new THREE.Color(pal.body);
    const dark = new THREE.Color(pal.dark);
    const darken = [1, 0.9, 0.78, 0.6][stage];
    this.bodyMat.color.copy(base).multiplyScalar(darken);
    this.darkMat.color.copy(dark).multiplyScalar(darken);
    this.bodyMat.roughness = 0.32 + stage * 0.14;
    this.bodyMat.emissive.setHex(stage >= 3 ? 0x5a1a00 : stage === 2 ? 0x1a0800 : 0x000000);
    this.bodyMat.emissiveIntensity = stage >= 3 ? 0.9 : 0.5;
    // Warp: sag the torso, tilt the body
    this.torso.scale.set(1 + stage * 0.03, 1 - stage * 0.04, 1 + stage * 0.03);
    this.body.rotation.z = stage >= 2 ? 0.07 * (stage - 1) : 0;
  }

  get dying(): boolean {
    return this.death !== null;
  }

  startDeath(kind: DeathKind, groundY: number): void {
    if (this.death) return;
    this.death = kind;
    this.deathT = 0;
    this.groundY = groundY;
    if (kind === 'shatter') {
      this.body.visible = false;
      if (this.base) this.base.visible = false;
      if (this.scene) {
        const origin = this.root.position;
        for (let i = 0; i < 8; i++) {
          const s = rand(0.09, 0.2);
          const m = new THREE.Mesh(new THREE.BoxGeometry(s, s * rand(0.5, 1.6), s), i < 6 ? this.bodyMat : this.darkMat);
          m.position.set(origin.x + rand(-0.15, 0.15), origin.y + rand(0.2, 0.9), origin.z + rand(-0.15, 0.15));
          m.castShadow = true;
          this.scene.add(m);
          this.debris.push({
            mesh: m,
            vel: new THREE.Vector3(rand(-3.5, 3.5), rand(2.5, 6), rand(-3.5, 3.5)),
            spin: new THREE.Vector3(rand(-8, 8), rand(-8, 8), rand(-8, 8)),
            life: rand(2.2, 3.2),
          });
        }
      }
    } else if (this.scene) {
      this.puddle = new THREE.Mesh(
        new THREE.CircleGeometry(0.3, 18),
        (mat('PLASTIC_TOY', PALETTE[this.opts.team].dark) as THREE.MeshPhysicalMaterial).clone(),
      );
      this.puddle.rotation.x = -Math.PI / 2;
      this.puddle.position.set(this.root.position.x, groundY + 0.015, this.root.position.z);
      this.scene.add(this.puddle);
    }
  }

  /** Drive death animation. Returns false once fully finished (safe to dispose). */
  update(dt: number): boolean {
    if (!this.death) return true;
    this.deathT += dt;
    if (this.death === 'shatter') {
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = this.debris[i];
        d.vel.y -= 19.6 * dt;
        d.mesh.position.addScaledVector(d.vel, dt);
        d.mesh.rotation.x += d.spin.x * dt;
        d.mesh.rotation.y += d.spin.y * dt;
        d.mesh.rotation.z += d.spin.z * dt;
        if (d.mesh.position.y < this.groundY + 0.06) {
          d.mesh.position.y = this.groundY + 0.06;
          d.vel.y *= -0.35;
          d.vel.x *= 0.7;
          d.vel.z *= 0.7;
          d.spin.multiplyScalar(0.6);
        }
        d.life -= dt;
        if (d.life < 0.6) d.mesh.scale.setScalar(Math.max(0.01, d.life / 0.6));
        if (d.life <= 0) {
          this.scene?.remove(d.mesh);
          d.mesh.geometry.dispose();
          this.debris.splice(i, 1);
        }
      }
      return this.debris.length > 0;
    }
    // Melt: slump into a puddle over 1.4 s
    const k = Math.min(1, this.deathT / 1.4);
    const e = k * k;
    this.body.scale.set(1 + e * 0.5, Math.max(0.08, 1 - e * 0.94), 1 + e * 0.5);
    this.body.rotation.z = e * 0.4;
    this.bodyMat.color.multiplyScalar(1 - dt * 0.6);
    this.bodyMat.emissive.setHex(0x4a1600);
    this.bodyMat.emissiveIntensity = (1 - k) * 1.2;
    if (this.puddle) this.puddle.scale.setScalar(1 + e * 2.2);
    if (this.base) this.base.visible = k < 0.6;
    if (k >= 1) {
      this.body.visible = false;
      return this.deathT < 1.6;
    }
    return true;
  }

  dispose(): void {
    this.scene?.remove(this.root);
    for (const d of this.debris) this.scene?.remove(d.mesh);
    this.debris = [];
    this.bodyMat.dispose();
    this.darkMat.dispose();
  }
}
