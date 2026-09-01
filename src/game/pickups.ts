// Pickups: ammo (matchbox), glue (heal), mold tray (full heal), marbles
// (collectible), bands (sniper ammo). Bob, spin, collect on proximity.

import * as THREE from 'three';
import { PickupDef, PickupKind } from '../maps/runtime/types';
import { kitProp } from '../maps/kit/registry';
import { mat } from '../maps/kit/materials';
import { v3 } from '../core/math';

interface Item {
  def: PickupDef;
  root: THREE.Group;
  baseY: number;
  phase: number;
  taken: boolean;
}

export class PickupSystem {
  items: Item[] = [];
  marblesTotal = 0;
  marblesFound = 0;
  onCollect: ((kind: PickupKind, id: string | undefined, at: THREE.Vector3) => void) | null = null;

  constructor(defs: PickupDef[], scene: THREE.Scene) {
    for (const def of defs) {
      const root = new THREE.Group();
      root.add(buildVisual(def.kind));
      root.position.copy(v3(def.at));
      scene.add(root);
      this.items.push({ def, root, baseY: def.at[1], phase: Math.random() * 6, taken: false });
      if (def.kind === 'marble') this.marblesTotal++;
    }
  }

  update(dt: number, time: number, playerPos: THREE.Vector3): void {
    void dt;
    for (const it of this.items) {
      if (it.taken) continue;
      const bob = it.def.kind === 'ammo' ? 0 : Math.sin(time * 2.2 + it.phase) * 0.06;
      it.root.position.y = it.baseY + bob;
      if (it.def.kind !== 'ammo') it.root.rotation.y += 1.4 * (1 / 60);
      const d = it.root.position.distanceTo(playerPos);
      if (d < 0.95) {
        it.taken = true;
        it.root.visible = false;
        if (it.def.kind === 'marble') this.marblesFound++;
        if (this.onCollect) this.onCollect(it.def.kind, it.def.id, it.root.position);
      }
    }
  }
}

function buildVisual(kind: PickupKind): THREE.Object3D {
  switch (kind) {
    case 'ammo':
      return kitProp('matchbox').build(0).mesh;
    case 'bands': {
      const g = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 20), mat('RUBBER_MATTE', 0xd9c26b));
        band.rotation.x = Math.PI / 2 + (i - 1) * 0.2;
        band.position.y = 0.05 + i * 0.07;
        g.add(band);
      }
      return g;
    }
    case 'glue': {
      const g = new THREE.Group();
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), mat('PLASTIC_TOY', 0xfafaf6, { emissive: 0x333322 }));
      drop.scale.set(1, 0.75, 1);
      drop.position.y = 0.22;
      drop.castShadow = true;
      g.add(drop);
      const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.06), mat('PLASTIC_TOY', 0xd9463c));
      const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.22), mat('PLASTIC_TOY', 0xd9463c));
      cross1.position.y = 0.44;
      cross2.position.y = 0.44;
      g.add(cross1, cross2);
      return g;
    }
    case 'moldTray': {
      const g = new THREE.Group();
      const tray = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 1.2), mat('METAL_KITCHEN', 0x5a5a60));
      tray.position.y = 0.09;
      tray.castShadow = true;
      g.add(tray);
      // Green soldier silhouette in the mold cavity
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.45, 4, 10), mat('PLASTIC_TOY', 0x3e7a34, { emissive: 0x0f3010 }));
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.26;
      g.add(body);
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat('PLASTIC_TOY', 0x2f5c28));
      helmet.position.set(0.44, 0.26, 0);
      g.add(helmet);
      return g;
    }
    case 'marble': {
      const g = new THREE.Group();
      const outer = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mat('GLASS_CHEAP', 0xbfe4ff));
      outer.position.y = 0.15;
      outer.castShadow = true;
      g.add(outer);
      const swirl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat('PLASTIC_TOY', 0x2e7bd9, { emissive: 0x1a3c80 }));
      swirl.scale.set(1.6, 0.5, 0.5);
      swirl.rotation.z = 0.6;
      swirl.position.y = 0.15;
      g.add(swirl);
      const glow = new THREE.PointLight(0x8fd0ff, 0.6, 2.5, 2);
      glow.position.y = 0.3;
      g.add(glow);
      return g;
    }
  }
}
