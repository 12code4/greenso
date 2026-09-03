// Olive's radio pin (docs/09 Update 3 FAIR PLAY): a green marker at the active
// objective's waypoint, drawn through geometry, with a pulsing ground ring.
// The HUD compass strip points at the same target. Hidden when you're on it.

import * as THREE from 'three';

export class Waypoint {
  target: THREE.Vector3 | null = null;
  private group = new THREE.Group();
  private ball: THREE.Mesh;
  private ring: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    const green = new THREE.MeshBasicMaterial({ color: 0xa8d47a, transparent: true, opacity: 0.85, depthTest: false, depthWrite: false });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 6), green);
    pole.position.y = 1.2;
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshBasicMaterial({ color: 0xd8f0b0, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false }));
    this.ball.position.y = 2.5;
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 28), new THREE.MeshBasicMaterial({ color: 0xa8d47a, transparent: true, opacity: 0.7, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.03;
    for (const m of [pole, this.ball, this.ring]) m.renderOrder = 999;
    this.group.add(pole, this.ball, this.ring);
    this.group.visible = false;
    scene.add(this.group);
  }

  setTarget(p: THREE.Vector3 | null): void {
    this.target = p ? p.clone() : null;
    if (p) this.group.position.copy(p);
    this.group.visible = !!p;
  }

  update(time: number, playerPos: THREE.Vector3): void {
    if (!this.target) return;
    this.ball.position.y = 2.5 + Math.sin(time * 3) * 0.12;
    const k = 1 + 0.18 * Math.sin(time * 4);
    this.ring.scale.set(k, k, 1);
    const d = playerPos.distanceTo(this.target);
    this.group.visible = d > 2.5;
  }
}
