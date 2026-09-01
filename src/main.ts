// PLASTIC PLATOON — boot, wiring, main loop. ?map=<id> selects a MapDef.

import * as THREE from 'three';
import { Input } from './core/input';
import { CollisionWorld } from './sim/collision';
import { Player } from './game/player';
import { ThirdPersonCamera } from './game/camera';
import { Weapons } from './game/weapons';
import { TargetRange, LaneSpec } from './game/targets';
import { EnemyManager } from './game/enemies';
import { Projectiles, Hittable } from './game/projectiles';
import { PowSystem } from './game/pows';
import { AircraftSystem } from './game/aircraft';
import { Hud } from './ui/hud';
import { AudioEngine } from './audio/synth';
import { MAPS, DEFAULT_MAP, BASE_GROUND } from './maps/defs';
import { buildMap } from './maps/runtime/build';
import { EncounterDirector } from './maps/runtime/director';
import { MissionFSM } from './maps/runtime/mission';
import { DevTools, Autopilot } from './tools/devtools';
import { v3, pick } from './core/math';

const params = new URLSearchParams(location.search);
const TEST_MODE = params.has('test');
const NO_ENEMIES = params.has('noenemies'); // route-walk gate: geometry only
const MAP_ID = params.get('map') ?? DEFAULT_MAP;
const mapDef = MAPS[MAP_ID] ?? MAPS[DEFAULT_MAP];

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
const audio = new AudioEngine();

const cam = new ThirdPersonCamera(window.innerWidth / window.innerHeight);
audio.setListener(cam.camera);

// ---- Map + world systems
let spawnWaveHook: (id: string) => void = () => {};
const map = buildMap(mapDef, scene, world, BASE_GROUND[mapDef.id] ?? 'lawn', {
  cue: (name, at) => audio.play(name, at, 0.9),
  soak: (min, max, duration) => map.grass.flatten(min, max, duration),
  quake: (m) => cam.addTrauma(m),
  spawnWave: (id) => spawnWaveHook(id),
  sprinklerLoop: (on) => audio.loop('sprinkler', on, 0.28),
});

// ---- Player
const player = new Player(map.spawn);
player.attachTo(scene);
cam.yaw = map.spawnYaw;

// ---- Combat systems
const projectiles = new Projectiles(scene, {
  explode: (at, radius, damage) => {
    enemies.damageRadius(at, radius, damage);
    const d = player.pos.distanceTo(at);
    if (d < radius) player.takeDamage(damage * (0.4 + 0.6 * (1 - d / radius)), at);
    cam.addTrauma(Math.max(0, 0.7 - d / 20));
  },
  sfx: (name, at) => audio.play(name, at),
});

const enemies: EnemyManager = new EnemyManager(scene, world, {
  sfx: (name, at) => audio.play(name, at, 0.7),
  playerHit: (damage, from) => player.takeDamage(damage, from),
  reinforce: (id, near) => director.reinforce(id, near),
  throwGrenade: (pos, vel) => projectiles.spawnGrenade(pos, vel, 1.6, 'tan'),
});

const aircraft = new AircraftSystem(mapDef.aircraft ?? [], scene, {
  sfx: (name, at) => audio.play(name, at, 0.7),
  playerHit: (damage, from) => player.takeDamage(damage, from),
});

const director: EncounterDirector = new EncounterDirector(mapDef.encounters, enemies);
map.regions.onEnter((r) => { if (!NO_ENEMIES) director.onRegionEnter(r.def.id); });
const devtools = new DevTools(scene, map.regions);
const autopilot = new Autopilot();
spawnWaveHook = (id) => director.activate(id);
director.onActivated = (id) => {
  audio.play('radio', undefined, 0.4);
  aircraft.onEncounterActivated(id);
};

const pows = new PowSystem(mapDef.pows ?? [], scene, {
  sfx: (name, at) => audio.play(name, at),
  onFreed: (id, name) => {
    void id;
    weapons.hasSniper = true;
    weapons.addBands(6);
    hud.toast(`${name} freed — rubber-band sniper acquired (3)`, 4);
  },
});

const lanes: LaneSpec[] = (mapDef.targetLanes ?? []).map((l) => ({
  pos: v3(l.at),
  faceYaw: l.yaw,
  slide: l.slide ? { axis: v3(l.slide.axis), amp: l.slide.amp, speed: l.slide.speed } : undefined,
}));
const targets = new TargetRange(scene, lanes);
const hittables: Hittable[] = [enemies, aircraft, targets];

const weapons = new Weapons(scene, player, projectiles, world);
weapons.onHit = (killed) => hud.hitMarker(killed);
weapons.onFire = (name, at, noise) => {
  audio.play(name, at, 0.8);
  enemies.noise(player.pos, noise);
};
weapons.onThrow = () => audio.play('band', player.pos, 0.5);

// ---- Mission
let finished = false;
const mission = mapDef.mission
  ? new MissionFSM(mapDef.mission, {
      radio: (t) => hud.radio('LT. OLIVE', t),
      objective: (t) => hud.setObjective(t),
      onObjectiveStart: (id) => {
        director.onObjective(id);
        map.platforms.onObjective(id);
      },
      onComplete: () => {
        finished = true;
        hud.showTally({
          title: mapDef.mission!.title,
          timeSeconds: mission!.elapsed,
          parSeconds: mapDef.mission!.parSeconds,
          marbles: map.pickups.marblesFound,
          marblesTotal: map.pickups.marblesTotal,
          powsFreed: mission!.powsFreed,
          accuracy: weapons.stats.shots ? weapons.stats.hits / weapons.stats.shots : 0,
          deaths: player.deaths,
        });
      },
      sfx: (n) => audio.play(n),
    })
  : null;

// ---- Player feedback
const DEATH_LINES = [
  'Moss is under the fridge. Requisitioning a replacement.',
  'Moss is down. Fresh copy from the bin, same mold.',
  'Lost one. The bag has more. Deploying.',
  'That one\'s a puddle now. Next Moss, step up.',
];
player.onDamaged = (amount, from) => {
  hud.damageFlash();
  cam.addTrauma(Math.min(0.5, amount / 60));
  audio.play('hurt', from ?? player.pos, 0.9);
};
player.onDeath = () => {
  audio.play('shatter', player.pos);
  audio.play('death');
  hud.radio('LT. OLIVE', pick(DEATH_LINES), 3);
};

map.pickups.onCollect = (kind, id, at) => {
  void id;
  audio.play(kind === 'marble' ? 'marble' : 'pickup', at);
  switch (kind) {
    case 'ammo': weapons.addAmmo(40); hud.toast('+40 BBs · +1 grenade'); break;
    case 'bands': weapons.addBands(6); hud.toast('+6 rubber bands'); break;
    case 'glue': player.heal(35); hud.toast('Doc\'s glue: +35% melt'); break;
    case 'moldTray': player.heal(100); hud.toast('Fresh plastic — good as new'); break;
    case 'marble': hud.toast(`Lost marble found (${map.pickups.marblesFound}/${map.pickups.marblesTotal})`); break;
  }
};

if (mapDef.mission) hud.setBriefing('PLASTIC PLATOON', mapDef.mission.title.toUpperCase(), mapDef.mission.briefing);
else hud.setBriefing('PLASTIC PLATOON', mapDef.title.toUpperCase(), []);
hud.setMarbles(0, map.pickups.marblesTotal);
hud.setMelt(1);

const sunOffset = map.sun.position.clone();
const pushTmp = new THREE.Vector3();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  cam.camera.aspect = window.innerWidth / window.innerHeight;
  cam.camera.updateProjectionMatrix();
});

if (TEST_MODE) {
  (window as unknown as Record<string, unknown>).__game = {
    look: (dx: number, dy: number) => input.injectMouse(dx, dy),
    key: (code: string, down: boolean) => input.injectKey(code, down),
    fire: (down: boolean) => input.injectFire(down),
    aim: (down: boolean) => input.injectAim(down),
    aimAtTarget: () => {
      const p = enemies.bestAssistPoint(cam.camera.position, cam.aimRay().dir, Math.PI, 80, world)
        ?? (() => { for (const t of targets.targets) if (t.isUp) return t.assistPoint(new THREE.Vector3()); return null; })();
      if (!p) return false;
      const d = p.clone().sub(cam.camera.position);
      const len = d.length();
      d.divideScalar(len);
      cam.yaw = Math.atan2(d.x, d.z);
      cam.pitch = -Math.asin(d.y);
      return true;
    },
    teleport: (x: number, y: number, z: number) => { player.pos.set(x, y, z); player.vel.set(0, 0, 0); },
    activate: (id: string) => director.activate(id),
    walkTo: (x: number, y: number, z: number) => autopilot.walkTo(new THREE.Vector3(x, y, z)),
    walkArrived: () => autopilot.arrived,
    walkStop: () => autopilot.stop(input),
    routes: () => mapDef.routes,
    time: () => time,
    state: () => ({
      map: mapDef.id,
      pos: player.pos.toArray(),
      vel: player.vel.toArray(),
      grounded: player.grounded,
      hp: player.hp,
      alive: player.alive,
      deaths: player.deaths,
      region: map.regions.current?.def.id ?? null,
      objective: mission?.active?.id ?? null,
      complete: mission?.complete ?? false,
      marbles: map.pickups.marblesFound,
      enemies: enemies.list.filter((e) => e.alive).length,
      kills: enemies.kills,
      combat: enemies.anyInCombat(),
      planes: aircraft.planes.length,
      downed: targets.downed,
      shots: weapons.stats.shots,
      hits: weapons.stats.hits,
      boomPulled: cam.boomPulledFrac,
    }),
  };
}

const clock = new THREE.Clock();
let time = 0;
let wasLocked = false;
let deployed = false;

function frame(): void {
  const rawDt = clock.getDelta();
  const dt = Math.min(rawDt, 0.05);
  time += dt;

  const running = input.locked && !finished;
  hud.setOverlay(!input.locked && !finished);
  if (input.locked && !wasLocked && !TEST_MODE) audio.unlock();
  wasLocked = input.locked;
  if (input.locked && !deployed) {
    deployed = true;
    mission?.start();
  }
  if (finished && input.pressed('KeyR')) location.reload();

  if (running) {
    const aiming = input.aimHeld && player.alive;

    // World first: platforms carry riders, hazards push
    map.platforms.update(dt, [player]);
    map.hazards.update(dt, player.pos);
    player.push.copy(map.hazards.pushAt(player.pos, pushTmp));
    enemies.applyPush((p, out) => map.hazards.pushAt(p, out));

    const free = devtools.update(dt, input, cam, player, hud);
    if (TEST_MODE) autopilot.update(dt, input, cam, player);

    if (player.alive && !free) {
      player.update(dt, input, cam.yaw, aiming, world);
      if (player.landed) audio.play('clack', player.pos, 0.6);
      weapons.update(dt, input, cam, aiming, hittables);
    } else if (!player.alive && player.updateDead(dt)) {
      player.respawnAt(map.regions.checkpoint);
      hud.setMelt(1);
    }

    if (!free) cam.update(dt, input, player.pos, player.pivotHeight, aiming, player.sprinting, world);
    projectiles.update(dt, world, hittables);
    enemies.update(dt, player, (p) => map.grass.concealmentAt(p));
    aircraft.update(dt, player.pos, player.alive, world);
    director.update();
    targets.update(dt, time);
    map.regions.update(player.pos);
    map.grass.update(dt, time);
    map.pickups.update(dt, time, player.pos);
    const prompt = pows.update(dt, player.pos, input.held('KeyE') && player.alive);
    hud.setPrompt(prompt?.text ?? null, prompt?.progress ?? 0);
    pows.overwatch(dt, enemies, world);
    if (mission) mission.update(dt, { playerPos: player.pos, regions: map.regions, director, isFreed: (id) => pows.isFreed(id) });
    audio.setCombat(enemies.anyInCombat() || aircraft.planes.length > 0);

    map.sun.position.copy(player.pos).add(sunOffset);
    map.sun.target.position.copy(player.pos);

    if (input.pressed('KeyH')) hud.toggleHelp();

    hud.setAiming(aiming);
    hud.setWeapon(weapons.current.name, weapons.ammoText());
    hud.setMelt(player.hp / player.maxHp);
    hud.setMarbles(map.pickups.marblesFound, map.pickups.marblesTotal);
    if (lanes.length) hud.setStats(`TARGETS DOWN ${targets.downed} · ACCURACY ${weapons.stats.shots ? Math.round((weapons.stats.hits / weapons.stats.shots) * 100) : 0}%`);
    else if (enemies.kills) hud.setStats(`TANS DOWN ${enemies.kills}`);
  }

  audio.update(dt);
  hud.update(dt);
  hud.perf(rawDt * 1000);
  input.endFrame();
  renderer.render(scene, cam.camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
