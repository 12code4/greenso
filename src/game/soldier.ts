// The soldier model v2 (docs/09 §3 "stylized toys turned soldiers") — shared
// by the player and every Tan. Primitives only, one hue per army, unified
// gloss. Helmet-topped neckless silhouette, barrel torso with no waist,
// tubular arms, straight legs with boot flares and flat soles, molded seam
// line down each side, gear as GEOMETRY (belt, pouches, canteen, grenade),
// animated eyes, and WEAPON = POSE: the held prop and the hold change
// together. POSE-SNAP animation (docs/04 bet 2): molded poses snapped
// between at ~9 fps instead of skeletal blending. Deaths are toy deaths.

import * as THREE from 'three';
import { mat } from '../maps/kit/materials';
import { rand } from '../core/math';

export type Team = 'green' | 'tan';
export type PoseName = 'idle' | 'runA' | 'runB' | 'aim' | 'throw' | 'kneel' | 'prone' | 'glued';
export type DeathKind = 'shatter' | 'melt';
export type HeldWeapon = 'rifle' | 'pistol' | 'sniper' | 'flamer' | 'bazooka';

export interface SoldierOptions {
  team: Team;
  /** Molded on a base: fixed pose, no locomotion. */
  based?: boolean;
  /** Officer's pennant. */
  pennant?: boolean;
  /** Prone sniper: model lies down. */
  prone?: boolean;
  weapon?: HeldWeapon;
}

// Tan pushed cooler and lighter than the classic 0xc8a878 so it reads against
// wood and dry grass (SH's #1 legibility failure); the sheen term below is the
// fake rim light.
const PALETTE: Record<Team, { body: number; dark: number; rifle: number; sheen: number }> = {
  green: { body: 0x3e7a34, dark: 0x2f5c28, rifle: 0x243d1c, sheen: 0x9fe08a },
  tan: { body: 0xdccaa2, dark: 0xbfa87e, rifle: 0x8a7454, sheen: 0xfff4dc },
};

interface Debris {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  life: number;
}

const SNAP_FPS = 9;
const FWD = -1; // model forward is −z

export class SoldierModel {
  root = new THREE.Group();
  weapon: HeldWeapon;
  private body = new THREE.Group(); // everything that tilts/scales with damage
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private legL: THREE.Group;
  private legR: THREE.Group;
  private armL: THREE.Group;
  private armR: THREE.Group;
  private held = new THREE.Group();
  private backpack: THREE.Object3D | null = null;
  private muzzle = new THREE.Object3D();
  private eyes: THREE.Mesh[] = [];
  private pupils: THREE.Mesh[] = [];
  private blinkT = rand(1, 4);
  private blink = 0;
  private lookT = rand(0.5, 2);
  private look = new THREE.Vector2();
  private bodyMat: THREE.MeshPhysicalMaterial;
  private darkMat: THREE.MeshPhysicalMaterial;
  private rifleMat: THREE.Material;
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
    this.weapon = opts.weapon ?? 'rifle';
    const pal = PALETTE[opts.team];
    this.bodyMat = (mat('PLASTIC_TOY', pal.body) as THREE.MeshPhysicalMaterial).clone();
    this.darkMat = (mat('PLASTIC_TOY', pal.dark) as THREE.MeshPhysicalMaterial).clone();
    for (const m of [this.bodyMat, this.darkMat]) {
      m.sheen = opts.team === 'tan' ? 0.55 : 0.3;
      m.sheenColor.setHex(pal.sheen);
      m.sheenRoughness = 0.55;
    }
    this.rifleMat = mat('PLASTIC_TOY', pal.rifle);
    const B = this.bodyMat, D = this.darkMat;

    // ---- Legs: straight tubes, boot flare, flat soles. Hip pivot at 0.46.
    this.legL = this.leg(-0.095);
    this.legR = this.leg(0.095);

    // ---- Torso: barrel, no waist. Shoulders as balls.
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.37, 16), B);
    barrel.scale.z = 0.86;
    barrel.position.y = 0.645;
    barrel.castShadow = true;
    this.torso.add(barrel);
    for (const x of [-0.2, 0.2]) {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), B);
      sh.position.set(x, 0.78, 0);
      sh.castShadow = true;
      this.torso.add(sh);
    }
    // Molded seam line down each side
    for (const x of [-0.168, 0.168]) {
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.36, 0.028), D);
      seam.position.set(x, 0.645, 0);
      this.torso.add(seam);
    }
    // Gear as geometry: belt, pouches, canteen, grenade on a chest strap
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.05, 16), D);
    belt.scale.z = 0.88;
    belt.position.y = 0.505;
    this.torso.add(belt);
    for (const x of [-0.075, 0.075]) {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.075, 0.045), D);
      pouch.position.set(x, 0.5, FWD * 0.155);
      pouch.castShadow = true;
      this.torso.add(pouch);
    }
    const canteen = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.095, 10), D);
    canteen.position.set(0.15, 0.5, 0.11);
    canteen.castShadow = true;
    this.torso.add(canteen);
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.34, 0.012), D);
    strap.rotation.z = 0.55;
    strap.position.set(0.02, 0.66, FWD * 0.15);
    this.torso.add(strap);
    const grenade = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.035, 3, 8), D);
    grenade.position.set(-0.09, 0.62, FWD * 0.165);
    this.torso.add(grenade);

    // ---- Head: neckless. Face sinks into the torso top. Helmet with brim + chin strap.
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), B);
    face.position.y = 0.9;
    face.castShadow = true;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.138, 14, 12), D);
    helmet.scale.y = 0.78;
    helmet.position.y = 0.925;
    helmet.castShadow = true;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.164, 0.026, 16), D);
    brim.position.y = 0.878;
    brim.position.z = FWD * 0.01;
    const chin = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.007, 6, 20), D);
    chin.rotation.x = 0.22;
    chin.position.y = 0.868;
    this.head.add(face, helmet, brim, chin);
    // Eyes: whites + pupils; the only thing on a toy soldier that moves on its own
    for (const x of [-0.04, 0.04]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.023, 8, 6), mat('PLASTIC_TOY', 0xf6f2e6));
      white.position.set(x, 0.905, FWD * 0.09);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), mat('PLASTIC_TOY', 0x1a1410));
      pupil.position.set(x, 0.905, FWD * 0.108);
      this.head.add(white, pupil);
      this.eyes.push(white);
      this.pupils.push(pupil);
    }

    // ---- Arms: tubes with a ball hand. Shoulder pivot at (±0.2, 0.78).
    this.armL = this.arm(-0.2);
    this.armR = this.arm(0.2);

    // ---- Held weapon
    this.body.add(this.legL, this.legR, this.torso, this.head, this.armL, this.armR, this.held);
    this.root.add(this.body);
    this.buildHeld(this.weapon);

    if (opts.based) {
      // Oval base with a pour mark
      this.base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.06, 20), D);
      this.base.scale.z = 0.7;
      this.base.position.y = 0.03;
      this.base.receiveShadow = true;
      this.root.add(this.base);
      const pour = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.03, 8), D);
      pour.position.set(0.38, 0.065, 0.1);
      this.root.add(pour);
      this.body.position.y = 0.06;
    }
    if (opts.pennant) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), this.rifleMat);
      stick.position.set(-0.1, 1.15, 0.14);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.16), mat('FABRIC_SOFT', 0xd9463c));
      flag.position.set(0.04, 1.42, 0.14);
      (flag.material as THREE.Material).side = THREE.DoubleSide;
      this.body.add(stick, flag);
    }
    this.setPose(opts.prone ? 'prone' : opts.based ? 'aim' : 'idle');
  }

  private leg(x: number): THREE.Group {
    const g = new THREE.Group();
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.062, 0.3, 10), this.bodyMat);
    shin.position.y = -0.15;
    shin.castShadow = true;
    const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.068, 0.12, 10), this.darkMat);
    boot.position.y = -0.36;
    boot.castShadow = true;
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.045, 0.2), this.darkMat);
    sole.position.set(0, -0.4375, FWD * 0.03);
    sole.castShadow = true;
    g.add(shin, boot, sole);
    g.position.set(x, 0.46, 0);
    return g;
  }

  private arm(x: number): THREE.Group {
    const g = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.048, 0.27, 10), this.bodyMat);
    tube.position.y = -0.165;
    tube.castShadow = true;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), this.bodyMat);
    hand.position.y = -0.31;
    hand.castShadow = true;
    g.add(tube, hand);
    g.position.set(x, 0.78, 0);
    return g;
  }

  // ------------------------------------------------------------ weapon = pose

  setWeapon(w: HeldWeapon): void {
    if (w === this.weapon) return;
    this.weapon = w;
    this.buildHeld(w);
    this.setPose(this.pose);
  }

  private buildHeld(w: HeldWeapon): void {
    this.held.clear();
    if (this.backpack) { this.body.remove(this.backpack); this.backpack = null; }
    const R = this.rifleMat;
    const shadow = (m: THREE.Mesh) => { m.castShadow = true; return m; };
    switch (w) {
      case 'rifle': {
        const stock = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.42), R));
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46, 8), R);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, FWD * 0.42);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.07), R);
        mag.position.set(0, -0.09, FWD * 0.06);
        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.03), R);
        sight.position.set(0, 0.065, FWD * 0.1);
        this.held.add(stock, barrel, mag, sight);
        this.muzzle.position.set(0, 0.02, FWD * 0.66);
        break;
      }
      case 'pistol': {
        const grip = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.05), R));
        grip.rotation.x = 0.25;
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.2), R);
        slide.position.set(0, 0.06, FWD * 0.06);
        const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.02), R);
        hammer.position.set(0, 0.095, 0.03);
        this.held.add(grip, slide, hammer);
        this.muzzle.position.set(0, 0.06, FWD * 0.18);
        break;
      }
      case 'sniper': {
        // A wooden ruler with a rubber band stretched down it, and a bottle-cap scope
        const ruler = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.9), mat('WOOD_WARM', 0xe0c890)));
        ruler.position.z = FWD * 0.2;
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 6), mat('RUBBER_MATTE', 0xd9c26b));
        band.rotation.x = Math.PI / 2;
        band.position.set(0, 0.035, FWD * 0.2);
        const fork = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), R);
        fork.position.set(0, 0.035, FWD * 0.6);
        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), mat('METAL_KITCHEN', 0x9a9aa2));
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 0.085, 0);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.05), R);
        grip.position.set(0, -0.07, 0.1);
        this.held.add(ruler, band, fork, scope, grip);
        this.muzzle.position.set(0, 0.035, FWD * 0.66);
        break;
      }
      case 'flamer': {
        // Wand in both hands, red candle-fuel tank on the back, hose between
        const wand = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.55, 8), mat('METAL_KITCHEN', 0x8a8a90)));
        wand.rotation.x = Math.PI / 2;
        wand.position.z = FWD * 0.2;
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.05), R);
        grip.position.set(0, -0.06, 0.02);
        const grip2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.04), R);
        grip2.position.set(0, -0.05, FWD * 0.25);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.026, 0.06, 8), mat('METAL_KITCHEN', 0xd8b04a));
        tip.rotation.x = Math.PI / 2;
        tip.position.z = FWD * 0.48;
        this.held.add(wand, grip, grip2, tip);
        this.muzzle.position.set(0, 0, FWD * 0.5);
        const pack = new THREE.Group();
        const tank = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.34, 12), mat('METAL_KITCHEN', 0xc93a3a)));
        tank.position.set(0.09, 0.66, 0.2);
        const tank2 = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 12), mat('METAL_KITCHEN', 0xc93a3a)));
        tank2.position.set(-0.08, 0.64, 0.2);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), mat('METAL_KITCHEN', 0xd8b04a));
        cap.position.set(0.09, 0.855, 0.2);
        const hose = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.09, 0.5, 0.2), new THREE.Vector3(0.28, 0.42, 0.1), new THREE.Vector3(0.3, 0.6, FWD * 0.15),
          ]), 10, 0.014, 6, false),
          mat('RUBBER_MATTE', 0x2a2a2a),
        );
        pack.add(tank, tank2, cap, hose);
        this.backpack = pack;
        this.body.add(pack);
        break;
      }
      case 'bazooka': {
        // Cardboard tube on the right shoulder, matchstick rocket peeking out
        const tube = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 12, 1, true), mat('PAPERBOARD', 0x6d8a4a)));
        (tube.material as THREE.Material).side = THREE.DoubleSide;
        tube.rotation.x = Math.PI / 2;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 14), R);
        ring.position.z = FWD * 0.5;
        const ring2 = ring.clone();
        ring2.position.z = 0.5;
        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.09, 0.03), R);
        sight.position.set(0, 0.1, FWD * 0.15);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.05), R);
        grip.position.set(0, -0.11, FWD * 0.05);
        const rocketTip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat('PLASTIC_TOY', 0xc93a3a));
        rocketTip.position.z = FWD * 0.5;
        this.held.add(tube, ring, ring2, sight, grip, rocketTip);
        this.muzzle.position.set(0, 0, FWD * 0.6);
        break;
      }
    }
    this.held.add(this.muzzle);
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
    this.held.rotation.set(0, 0, 0);
    this.holdDefault();
    switch (p) {
      case 'idle':
        this.holdRelaxed();
        break;
      case 'runA':
        L.rotation.x = 0.75; R.rotation.x = -0.75;
        AL.rotation.x = -0.9; AR.rotation.x = -0.2;
        T.rotation.x = 0.12; H.rotation.x = 0.1; B.position.y += 0.03;
        this.holdRun();
        break;
      case 'runB':
        L.rotation.x = -0.75; R.rotation.x = 0.75;
        AL.rotation.x = -0.2; AR.rotation.x = -0.9;
        T.rotation.x = 0.12; H.rotation.x = 0.1; B.position.y += 0.03;
        this.holdRun();
        break;
      case 'aim':
        L.rotation.x = 0.18; R.rotation.x = -0.18;
        this.holdAim();
        H.rotation.y = -0.15;
        break;
      case 'throw':
        L.rotation.x = 0.3; R.rotation.x = -0.4;
        AL.rotation.x = -0.6; AR.rotation.x = -2.6; AR.rotation.z = -0.3;
        T.rotation.y = -0.35; T.rotation.x = -0.1;
        this.held.position.set(-0.05, 0.66, -0.05); this.held.rotation.x = -0.6;
        break;
      case 'kneel':
        R.rotation.x = -1.5; L.rotation.x = 0.5;
        B.position.y -= 0.22;
        this.holdAim();
        break;
      case 'prone':
        B.rotation.x = -Math.PI / 2;
        B.position.y += 0.16;
        AL.rotation.x = -1.6; AL.rotation.z = 0.4; AR.rotation.x = -1.6;
        this.held.position.set(0.08, 0.95, -0.25);
        H.rotation.x = 0.6;
        break;
      case 'glued':
        R.rotation.x = -1.5; L.rotation.x = 0.5;
        B.position.y -= 0.22;
        AL.rotation.x = 0.2; AR.rotation.x = 0.3; AR.rotation.z = 0.3;
        this.held.position.set(0.3, 0.05, 0.1); this.held.rotation.x = Math.PI / 2;
        H.rotation.x = 0.35;
        break;
    }
  }

  private holdDefault(): void {
    switch (this.weapon) {
      case 'pistol': this.held.position.set(0.22, 0.72, FWD * 0.2); break;
      case 'bazooka': this.held.position.set(0.2, 0.9, FWD * 0.05); break;
      case 'flamer': this.held.position.set(0.1, 0.64, FWD * 0.22); break;
      default: this.held.position.set(0.12, 0.72, FWD * 0.16);
    }
  }

  /** Idle: weapon low, at ease — but molded, so still gripped. */
  private holdRelaxed(): void {
    const AL = this.armL, AR = this.armR;
    switch (this.weapon) {
      case 'pistol':
        AR.rotation.x = -0.25; AL.rotation.x = 0.1;
        this.held.position.set(0.22, 0.5, FWD * 0.14); this.held.rotation.x = 0.5;
        break;
      case 'bazooka':
        AR.rotation.x = -1.6; AR.rotation.z = 0.2; AL.rotation.x = -0.9; AL.rotation.z = 0.6;
        this.held.rotation.x = -0.12;
        break;
      case 'flamer':
        AL.rotation.x = -0.9; AL.rotation.z = 0.45; AR.rotation.x = -0.7;
        this.held.rotation.x = 0.25;
        break;
      default:
        AL.rotation.x = -0.35; AR.rotation.x = -0.5; AR.rotation.z = 0.1;
    }
  }

  private holdRun(): void {
    switch (this.weapon) {
      case 'pistol': this.held.position.set(0.22, 0.6, FWD * 0.18); this.held.rotation.x = 0.3; break;
      case 'bazooka': this.armR.rotation.set(-1.5, 0, 0.2); this.held.rotation.x = -0.1; break;
      case 'flamer': this.held.rotation.x = 0.2; break;
      default: this.held.rotation.x = 0.2;
    }
  }

  private holdAim(): void {
    const AL = this.armL, AR = this.armR;
    switch (this.weapon) {
      case 'pistol':
        AR.rotation.x = -1.5; AL.rotation.x = -1.3; AL.rotation.z = 0.7;
        this.held.position.set(0.2, 0.84, FWD * 0.32);
        break;
      case 'bazooka':
        AR.rotation.x = -1.8; AR.rotation.z = 0.1; AL.rotation.x = -1.4; AL.rotation.z = 0.7;
        this.held.position.set(0.2, 0.92, FWD * 0.08);
        break;
      case 'flamer':
        AL.rotation.x = -1.2; AL.rotation.z = 0.55; AR.rotation.x = -1.1;
        this.held.position.set(0.1, 0.7, FWD * 0.28);
        break;
      case 'sniper':
        AL.rotation.x = -1.35; AL.rotation.z = 0.5; AR.rotation.x = -1.25;
        this.held.position.set(0.08, 0.86, FWD * 0.22);
        break;
      default:
        AL.rotation.x = -1.3; AL.rotation.z = 0.5; AR.rotation.x = -1.2;
        this.held.position.set(0.1, 0.84, FWD * 0.2);
    }
  }

  /** Pose-snap locomotion: alternate run frames at SNAP_FPS while moving. */
  animateLocomotion(dt: number, moving: boolean, aiming: boolean): void {
    if (this.death) return;
    this.animateFace(dt);
    if (this.opts.based || this.opts.prone) return;
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

  /** Eyes: blink every few seconds, glance around. Snapped, like the rest. */
  private animateFace(dt: number): void {
    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blinkT = rand(1.5, 4.5); this.blink = 0.12; }
    if (this.blink > 0) {
      this.blink -= dt;
      const closed = this.blink > 0;
      for (const e of this.eyes) e.scale.y = closed ? 0.15 : 1;
      for (const p of this.pupils) p.visible = !closed;
    }
    this.lookT -= dt;
    if (this.lookT <= 0) {
      this.lookT = rand(0.6, 2.2);
      this.look.set(rand(-0.012, 0.012), rand(-0.008, 0.008));
      for (let i = 0; i < this.pupils.length; i++) {
        const x = i === 0 ? -0.04 : 0.04;
        this.pupils[i].position.set(x + this.look.x, 0.905 + this.look.y, FWD * 0.108);
      }
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
    this.bodyMat.roughness = 0.3 + stage * 0.14;
    this.bodyMat.clearcoat = Math.max(0, 0.75 - stage * 0.2);
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
        for (let i = 0; i < 9; i++) {
          const s = rand(0.09, 0.2);
          // Piece 0 is the helmet: it always survives the shatter and rolls away
          const geo = i === 0 ? new THREE.SphereGeometry(0.13, 10, 8) : new THREE.BoxGeometry(s, s * rand(0.5, 1.6), s);
          if (i === 0) geo.scale(1, 0.75, 1);
          const m = new THREE.Mesh(geo, i < 6 ? this.bodyMat : this.darkMat);
          m.position.set(origin.x + rand(-0.15, 0.15), origin.y + rand(0.2, 0.9), origin.z + rand(-0.15, 0.15));
          m.castShadow = true;
          this.scene.add(m);
          this.debris.push({
            mesh: m,
            vel: new THREE.Vector3(rand(-3.5, 3.5), rand(2.5, 6), rand(-3.5, 3.5)),
            spin: new THREE.Vector3(rand(-8, 8), rand(-8, 8), rand(-8, 8)),
            life: rand(2.2, 3.2) + (i === 0 ? 1.5 : 0),
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
