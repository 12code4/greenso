// PLASTIC PLATOON — M0 greybox. Boot, wiring, main loop.

import * as THREE from 'three';
import { Input } from './core/input';
import { CollisionWorld } from './sim/collision';
import { Player } from './game/player';
import { ThirdPersonCamera } from './game/camera';
import { Weapons } from './game/weapons';
import { TargetRange } from './game/targets';
import { buildGreybox } from './maps/greybox';
import { Hud } from './ui/hud';

const TEST_MODE = new URLSearchParams(location.search).has('test');

const app = document.getElementById('app')!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const world = new CollisionWorld();
const input = new Input(renderer.domElement, TEST_MODE);
const hud = new Hud(app);

const arena = buildGreybox(scene, world);
const player = new Player(arena.spawn);
scene.add(player.root);

const cam = new ThirdPersonCamera(window.innerWidth / window.innerHeight);
const targets = new TargetRange(scene, arena.lanes);
const weapons = new Weapons(scene, player.root);
weapons.onHit = (killed) => {
  hud.hitMarker(killed);
  if (killed) targets.downed++;
};

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  cam.camera.aspect = window.innerWidth / window.innerHeight;
  cam.camera.updateProjectionMatrix();
});

// Test hooks for headless smoke tests (?test)
if (TEST_MODE) {
  (window as unknown as Record<string, unknown>).__game = {
    look: (dx: number, dy: number) => input.injectMouse(dx, dy),
    key: (code: string, down: boolean) => input.injectKey(code, down),
    fire: (down: boolean) => input.injectFire(down),
    aim: (down: boolean) => input.injectAim(down),
    // Point the camera straight at the first up-target (deterministic aim
    // for smoke tests; look-input math is verified by hand).
    aimAtTarget: () => {
      for (const t of targets.targets) {
        if (!t.isUp) continue;
        const p = t.assistPoint(new THREE.Vector3());
        const d = p.sub(cam.camera.position);
        const len = d.length();
        d.divideScalar(len);
        cam.yaw = Math.atan2(d.x, d.z);
        cam.pitch = -Math.asin(d.y);
        return true;
      }
      return false;
    },
    state: () => ({
      pos: player.pos.toArray(),
      vel: player.vel.toArray(),
      grounded: player.grounded,
      downed: targets.downed,
      shots: weapons.stats.shots,
      hits: weapons.stats.hits,
    }),
  };
}

const clock = new THREE.Clock();
let time = 0;

function frame(): void {
  const rawDt = clock.getDelta();
  const dt = Math.min(rawDt, 0.05);
  time += dt;

  const running = input.locked;
  hud.setOverlay(!running);

  if (running) {
    const aiming = input.aimHeld;
    player.update(dt, input, cam.yaw, aiming, world);
    cam.update(dt, input, player.pos, player.pivotHeight, aiming, player.sprinting, world);
    weapons.update(dt, input, cam, aiming, world, targets);
    targets.update(dt, time);

    if (input.pressed('KeyH')) hud.toggleHelp();

    hud.setAiming(aiming);
    hud.setWeapon(weapons.current.name);
    hud.setScore(targets.downed, weapons.stats.hits, weapons.stats.shots);
  }

  hud.perf(rawDt * 1000);
  input.endFrame();
  renderer.render(scene, cam.camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
