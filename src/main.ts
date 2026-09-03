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
import { Barks, TAN_BARKS, MOSS_BARKS, TAUPE_LINES } from './game/barks';
import { InteractSystem } from './game/interact';
import { Squadmate } from './game/squad';
import { Waypoint } from './game/waypoint';
import { LOOK } from './game/camera';
import { Enemy } from './game/enemies';
import { WorldState } from './game/world';
import { FloorLinkSystem } from './game/links';
import { PocketRoller } from './game/pockets';
import { PatrolSystem } from './game/patrols';
import { Breakables } from './game/breakables';
import { placeProp } from './maps/runtime/build';
import { MissionDef } from './maps/runtime/types';
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
// Headless gates render at ~1 fps; ?turbo runs several fixed 0.05 s sim steps per rendered frame (same numerics, faster wall clock)
const TURBO_STEPS = params.has('turbo') ? 6 : 1;
const MAP_ID = params.get('map') ?? DEFAULT_MAP;
const mapDef = MAPS[MAP_ID] ?? MAPS[DEFAULT_MAP];
const FROM_LINK = params.get('from');

// ---- The house remembers (docs/10 §5): found routes, finished missions, permanent changes, secrets
const worldState = new WorldState();
/** Flags that live for one mission run (string, ball, lured). Permanent ones go to worldState. */
const missionFlags = new Set<string>();
const hasFlag = (f: string): boolean => missionFlags.has(f) || worldState.flags.has(f);

// Which mission on this map: ?mission=<id>, else the first one not yet completed, else the first
const missionDef: MissionDef | null = (() => {
  if (mapDef.missions?.length) {
    const want = params.get('mission');
    return mapDef.missions.find((m) => m.id === want)
      ?? mapDef.missions.find((m) => !worldState.missions.has(m.id ?? ''))
      ?? mapDef.missions[0];
  }
  return mapDef.mission ?? null;
})();

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

// ---- Minimal options (persisted): look sensitivity, invert Y, mute
let muted = false;
try {
  const saved = JSON.parse(localStorage.getItem('pp.options') ?? '{}') as { sens?: number; invertY?: boolean; muted?: boolean };
  if (typeof saved.sens === 'number') LOOK.sens = Math.min(3, Math.max(0.3, saved.sens));
  if (typeof saved.invertY === 'boolean') LOOK.invertY = saved.invertY;
  if (typeof saved.muted === 'boolean') muted = saved.muted;
} catch { /* no storage */ }
audio.setMuted(muted);
const saveOptions = (): void => { try { localStorage.setItem('pp.options', JSON.stringify({ sens: LOOK.sens, invertY: LOOK.invertY, muted })); } catch { /* ignore */ } };

// ---- Map + world systems
let spawnWaveHook: (id: string) => void = () => {};
const map = buildMap(mapDef, scene, world, BASE_GROUND[mapDef.id] ?? 'lawn', {
  cue: (name, at) => audio.play(name, at, 0.9),
  soak: (min, max, duration) => map.grass.flatten(min, max, duration),
  quake: (m) => cam.addTrauma(m),
  spawnWave: (id) => spawnWaveHook(id),
  sprinklerLoop: (on) => audio.loop('sprinkler', on, 0.28),
});

// ---- Player (arriving from another floor lands you at that link's far end)
const arrival = (() => {
  if (!FROM_LINK) return null;
  for (const m of Object.values(MAPS)) {
    const l = (m.links ?? []).find((x) => x.id === FROM_LINK);
    if (l && l.to.map === mapDef.id) return l.to;
  }
  return null;
})();
const player = new Player(arrival ? v3(arrival.spawn) : map.spawn);
player.attachTo(scene);
cam.yaw = arrival ? arrival.yaw : map.spawnYaw;
if (arrival) map.regions.checkpoint.copy(player.pos);

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

const barks = new Barks(scene);
barks.onSay = (color, at) => audio.play(color === 'tan' ? 'bark_tan' : 'bark_green', at, 0.5);

const enemies: EnemyManager = new EnemyManager(scene, world, {
  sfx: (name, at) => audio.play(name, at, 0.7),
  playerHit: (damage, from) => player.takeDamage(damage, from),
  reinforce: (id, near) => director.reinforce(id, near),
  throwGrenade: (pos, vel) => projectiles.spawnGrenade(pos, vel, 1.6, 'tan'),
  bark: (e, kind) => barks.sayRandom(e, e.pos, TAN_BARKS[kind], 'tan'),
  // Tan Flamer's tank: a zero-fuse grenade gives the full blast (visual + radius damage)
  explode: (at, radius, damage) => { void radius; void damage; projectiles.spawnGrenade(at, new THREE.Vector3(0, 0, 0), 0.01, 'tan'); },
  // A dive rolls the fire out and buys 0.8 s of immunity, so rolling away works even while he's still spraying
  playerBurn: (amount, from) => { if (player.diving || fireImmuneT > 0) return; burnAcc += amount; burnFrom = from; player.burning = Math.max(player.burning, 1.5); },
});
let burnAcc = 0;
let fireImmuneT = 0;
let burnFrom: THREE.Vector3 | null = null;
let burnWarned = false;

const aircraft = new AircraftSystem(mapDef.aircraft ?? [], scene, {
  sfx: (name, at) => audio.play(name, at, 0.7),
  playerHit: (damage, from) => player.takeDamage(damage, from),
});

const director: EncounterDirector = new EncounterDirector(mapDef.encounters, enemies);
const pockets = mapDef.pockets && !NO_ENEMIES ? new PocketRoller(mapDef.pockets, enemies) : null;
if (!NO_ENEMIES) new PatrolSystem(mapDef.patrols ?? [], enemies);
map.regions.onEnter((r) => {
  if (NO_ENEMIES) return;
  director.onRegionEnter(r.def.id);
  pockets?.onRegionEnter(r.def.id);
});
pockets && (pockets.onSpawn = (at, n) => { void at; if (n >= 3 && Math.random() < 0.5) hud.radio('LT. OLIVE', 'Pocket. They were in the furniture.', 3); });
const devtools = new DevTools(scene, map.regions);
const autopilot = new Autopilot();
spawnWaveHook = (id) => director.activate(id);
director.onActivated = (id) => {
  audio.play('radio', undefined, 0.4);
  aircraft.onEncounterActivated(id);
  const enc = mapDef.encounters.find((e) => e.id === id);
  const hasOfficer = !!enc?.units.some((u) => u.type === 'officer');
  if (hasOfficer || Math.random() < 0.4) hud.radio('GEN. TAUPE', pick(TAUPE_LINES.contact), 4.5, 'tan');
};

// ---- Squad + interactables
const squad = new Squadmate(scene, {
  sfx: (name, at) => audio.play(name, at, 0.6),
  bark: (text) => barks.say(squad, squad.pos, text, 'fern'),
});
const interact = new InteractSystem(mapDef.interactables ?? [], scene, {
  sfx: (name, at) => audio.play(name, at),
  onSabotage: (id, n, total) => {
    void id;
    hud.toast(`BATTERIES SABOTAGED ${n}/${total}`, 3);
    cam.addTrauma(0.15);
    if (Math.random() < 0.6) hud.radio('GEN. TAUPE', pick(TAUPE_LINES.sabotage), 4, 'tan');
  },
  onLaunch: (to, T) => {
    // Ballistic solve to `to` in T seconds under the player's gravity
    const v = to.clone().sub(player.pos).divideScalar(T);
    v.y += 0.5 * 19.6 * T;
    player.vel.copy(v);
    player.pos.y += 0.06;
    player.grounded = false;
    player.launchT = T + 0.5;
    cam.addTrauma(0.6);
    audio.play('rocket', player.pos, 1);
    hud.radio('LT. OLIVE', 'Bottle rocket. Hold on to your helmet.', 3);
    barks.say(player, player.pos, 'WHEEEE—', 'green');
  },
  hasFlag,
  setFlag: (f) => { missionFlags.add(f); if (f === 'bridge') worldState.setFlag('bridge'); },
  onWarp: (to) => {
    player.pos.copy(to);
    player.vel.set(0, 0, 0);
    cam.addTrauma(0.3);
    audio.play('rocket', player.pos, 0.6);
    hud.toast('WHOOSH');
    if (worldState.foundSecret('s21')) hud.radio('LT. OLIVE', 'The hose goes somewhere. Noted. Never doing that again.', 4);
  },
  onUse: (id) => onUse(id),
});

/** Ruler bridge across the marble run's gap: a permanent change to the house. */
let bridgePlaced = false;
const placeBridge = (): void => {
  if (bridgePlaced || mapDef.id !== 'g') return;
  bridgePlaced = true;
  placeProp({ kit: 'ruler_bridge', at: [94, 18.4, 40], yaw: 0, size: [1.6, 7.67, 10] }, scene, world);
};
if (worldState.flags.has('bridge')) placeBridge();

function onUse(id: string): void {
  switch (id) {
    case 'use_drawer':
      hud.toast('STRING — a whole spool of it');
      if (worldState.foundSecret('s14')) audio.chime();
      break;
    case 'use_gap':
      placeBridge();
      audio.play('clack', player.pos, 1);
      cam.addTrauma(0.2);
      enemies.noise(player.pos, 60);
      break;
    case 'use_photo':
      hud.toast('STRAIGHTENED');
      player.heal(100);
      if (worldState.foundSecret('s19')) {
        audio.chime();
        hud.radio('LT. OLIVE', 'That\'s the backyard in that photo. The birdbath. Fern says hello.', 5);
        worldState.sideQuests.add('SQ_photo'); worldState.save();
      }
      break;
    case 'use_record':
      recordOn = !recordOn;
      audio.record(recordOn);
      hud.toast(recordOn ? 'SIDE A' : 'NEEDLE UP');
      if (recordOn && worldState.foundSecret('s18')) audio.chime();
      break;
    case 'use_microwave':
      hud.toast('HI PIP');
      audio.play('pickup', player.pos, 0.8);
      if (worldState.foundSecret('s15')) { audio.chime(); hud.radio('LT. OLIVE', 'The kids\' code. It just says hi to Pip. That\'s all it ever did.', 4); }
      break;
    case 'use_flap':
      map.hazards.fire('H_biscuit');
      hud.radio('GEN. TAUPE', 'Was that the DOG? Everyone off the floor! OFF THE FLOOR!', 4, 'tan');
      break;
  }
}
let recordOn = false;

const pows = new PowSystem(mapDef.pows ?? [], scene, {
  sfx: (name, at) => audio.play(name, at),
  onFreed: (id, name) => {
    void id;
    weapons.unlock('sniper');
    weapons.addBands(6);
    audio.play('pickup_weapon', player.pos, 0.8);
    hud.toast(`${name} freed — RUBBER-BAND SNIPER acquired (3)`, 4);
    barks.say(player, player.pos, 'Welcome back, Corporal.', 'green');
  },
});

const lanes: LaneSpec[] = (mapDef.targetLanes ?? []).map((l) => ({
  pos: v3(l.at),
  faceYaw: l.yaw,
  slide: l.slide ? { axis: v3(l.slide.axis), amp: l.slide.amp, speed: l.slide.speed } : undefined,
}));
const targets = new TargetRange(scene, lanes);
const breakables = new Breakables();
for (const pp of map.props) {
  if (pp.def.kit === 'piggy_bank') breakables.add({ id: 'piggy', at: v3(pp.def.at).add(new THREE.Vector3(0, 2.2, 0)), radius: 2.8, hp: 8, object: pp.object });
}
breakables.onBreak = (id, at) => {
  void id;
  for (let i = 0; i < 3; i++) setTimeout(() => audio.play('marble', at, 0.9), i * 120);
  hud.toast('COINS EVERYWHERE');
  hud.radio('LT. OLIVE', 'You monster.', 3);
  if (worldState.foundSecret('s50')) audio.chime();
};
const hittables: Hittable[] = [enemies, aircraft, targets, breakables];

const weapons = new Weapons(scene, player, projectiles, world);
let killStreakT = 0;
weapons.onHit = (killed) => {
  hud.hitMarker(killed);
  if (!killed) return;
  const lines = killStreakT > 0 ? MOSS_BARKS.multikill
    : weapons.current.id === 'flamer' ? MOSS_BARKS.flamer
    : weapons.current.id === 'bazooka' ? MOSS_BARKS.bazooka
    : MOSS_BARKS.kill;
  killStreakT = 2.5;
  if (Math.random() < 0.55) barks.sayRandom(player, player.pos, lines, 'green');
};
weapons.onFire = (name, at, noise) => {
  audio.play(name, at, 0.8);
  enemies.noise(player.pos, noise);
};
weapons.onThrow = () => audio.play('band', player.pos, 0.5);

// ---- Mission + Olive's radio pin
let finished = false;
// House floors (maps with a mission list) don't freeze on completion: the tally is a card for a few
// seconds and the sim keeps running, so the floor link you just unlocked fires when you step onto it.
let tallyT = 0;
const waypoint = new Waypoint(scene);
let rideBoarded = false;
const regionCenter = (id: string): THREE.Vector3 => {
  const b = map.regions.get(id).box;
  return new THREE.Vector3((b.min.x + b.max.x) / 2, b.min.y, (b.min.z + b.max.z) / 2);
};
const waypointFor = (id: string): THREE.Vector3 | null => {
  const o = missionDef?.objectives.find((x) => x.id === id);
  if (!o) return null;
  if (o.at) return v3(o.at);
  switch (o.kind) {
    case 'reach': case 'discover': case 'ride': return regionCenter(o.target);
    case 'clear': {
      const enc = mapDef.encounters.find((e) => e.id === o.target);
      if (!enc || !enc.units.length) return null;
      const c = new THREE.Vector3();
      for (const u of enc.units) c.add(v3(u.at));
      return c.divideScalar(enc.units.length);
    }
    case 'rescue': {
      const pw = (mapDef.pows ?? []).find((x) => x.id === o.target);
      return pw ? v3(pw.at) : null;
    }
  }
  return null;
};
const mission = missionDef
  ? new MissionFSM(missionDef, {
      radio: (t) => hud.radio('LT. OLIVE', t),
      objective: (t) => hud.setObjective(t),
      onObjectiveStart: (id) => {
        director.onObjective(id);
        map.platforms.onObjective(id);
        rideBoarded = false;
        waypoint.setTarget(waypointFor(id));
        if (id === 'escape_leaf') hud.radio('GEN. TAUPE', pick(TAUPE_LINES.leaf), 4, 'tan');
      },
      onObjectiveDone: (id) => {
        // Checkpoint per objective: you never redo what you already did
        const last = missionDef!.objectives[missionDef!.objectives.length - 1].id;
        if (id !== last && player.alive && player.grounded) {
          map.regions.checkpoint.copy(player.pos);
          hud.toast('CHECKPOINT');
        }
        waypoint.setTarget(null);
        if (id === 'clear_gnome' && !squad.active) {
          squad.join(new THREE.Vector3(-23, 0, -3));
          hud.radio('LT. OLIVE', 'Pvt. Sprout\'s been hiding in the flowerpot. He\'s yours now. Try to bring him back.', 5);
        } else if (id !== last && Math.random() < 0.35) hud.radio('GEN. TAUPE', pick(TAUPE_LINES.objective), 4, 'tan');
      },
      onComplete: () => {
        const roam = !!mapDef.missions?.length;
        finished = !roam;
        if (roam) tallyT = 6;
        waypoint.setTarget(null);
        if (missionDef!.id) worldState.completeMission(missionDef!.id);
        hud.showTally({
          title: missionDef!.title,
          timeSeconds: mission!.elapsed,
          parSeconds: missionDef!.parSeconds,
          marbles: map.pickups.marblesFound,
          marblesTotal: map.pickups.marblesTotal,
          powsFreed: mission!.powsFreed,
          accuracy: weapons.stats.shots ? weapons.stats.hits / weapons.stats.shots : 0,
          deaths: player.deaths,
          batteries: interact.sabotaged,
          batteriesTotal: interact.sabotageTotal,
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
  if (player.alive && Math.random() < 0.25) barks.sayRandom(player, player.pos, player.hp < 35 ? MOSS_BARKS.lowhp : MOSS_BARKS.hurt, 'green');
};
player.onDeath = () => {
  audio.play('shatter', player.pos);
  audio.play('death');
  if (Math.random() < 0.45) hud.radio('GEN. TAUPE', pick(TAUPE_LINES.death), 3.5, 'tan');
  else hud.radio('LT. OLIVE', pick(DEATH_LINES), 3);
  squad.onPlayerDeath();
  burnAcc = 0;
};

map.pickups.onCollect = (kind, id, at) => {
  audio.play(kind === 'marble' ? 'marble' : kind === 'flamer' || kind === 'bazooka' ? 'pickup_weapon' : 'pickup', at);
  if (kind === 'marble' && id) worldState.collectMarble(mapDef.id, id);
  switch (kind) {
    case 'ball': missionFlags.add('ball'); hud.toast('BISCUIT\'S BALL — half the fuzz gone'); break;
    case 'string': missionFlags.add('string'); hud.toast('STRING'); break;
    case 'flamer':
      weapons.unlock('flamer'); weapons.addFuel(80);
      hud.toast('BIRTHDAY-CANDLE FLAMETHROWER — melt them (4)', 4);
      hud.radio('LT. OLIVE', 'That\'s a candle torch. Tans melt. Try not to enjoy it.', 4);
      break;
    case 'bazooka':
      weapons.unlock('bazooka'); weapons.addRockets(3);
      hud.toast('MATCHSTICK BAZOOKA — 3 rockets (5)', 4);
      hud.radio('LT. OLIVE', 'Bazooka. Aim for the barricades, not your feet.', 4);
      break;
    case 'ammo': weapons.addAmmo(40); hud.toast('+40 BBs · +1 grenade'); break;
    case 'bands': weapons.addBands(6); hud.toast('+6 rubber bands'); break;
    case 'glue': player.heal(35); hud.toast('Doc\'s glue: +35% melt'); break;
    case 'moldTray': player.heal(100); hud.toast('Fresh plastic — good as new'); break;
    case 'marble': hud.toast(`Lost marble found (${map.pickups.marblesFound}/${map.pickups.marblesTotal})`); break;
  }
};

const missionList = Object.values(MAPS).flatMap((m) => {
  if (m.missions?.length) return m.missions.map((ms) => ({ href: `?map=${m.id}&mission=${ms.id}`, title: `${m.title} · ${ms.title}`, sub: worldState.missions.has(ms.id ?? '') ? 'done' : ms.objectives[0]?.text ?? '', current: m.id === mapDef.id && ms.id === missionDef?.id }));
  return [{ href: `?map=${m.id}`, title: m.title, sub: m.mission?.title ?? m.realFootprint, current: m.id === mapDef.id }];
});
if (missionDef) hud.setBriefing('PLASTIC PLATOON', missionDef.title.toUpperCase(), missionDef.briefing, missionList);
else hud.setBriefing('PLASTIC PLATOON', mapDef.title.toUpperCase(), [], missionList);

// ---- Floor links: the loading moment (docs/10 §5)
const FLOOR_NAMES: Record<string, string> = { b: 'THE BASEMENT', g: 'THE GROUND FLOOR', u: 'UPSTAIRS', a: 'THE ATTIC', y: 'THE YARD', backyard: 'THE BACKYARD' };
const links = new FloorLinkSystem(mapDef.links ?? [], worldState);
let leaving = false;
links.onLink = (def, already) => {
  if (leaving) return;
  const target = MAPS[def.to.map];
  if (target) {
    leaving = true;
    hud.showCard(FLOOR_NAMES[def.to.map] ?? def.to.map.toUpperCase(), `VIA ${def.name.toUpperCase()}`, 0);
    audio.play('radio', undefined, 0.5);
    setTimeout(() => { location.href = `?map=${def.to.map}&from=${def.id}${TEST_MODE ? '&test' : ''}`; }, 1200);
  } else {
    hud.showCard(FLOOR_NAMES[def.to.map] ?? def.to.map.toUpperCase(), `VIA ${def.name.toUpperCase()} — NOT BUILT YET`, 2.6);
    if (!already) hud.radio('LT. OLIVE', `That's ${def.name}. It goes to ${(FLOOR_NAMES[def.to.map] ?? def.to.map).toLowerCase()}. Route found — we'll take it when the floor's there.`, 5);
  }
};
hud.setMarbles(0, map.pickups.marblesTotal);
hud.setMelt(1);

const sunOffset = map.sun.position.clone();
const pushTmp = new THREE.Vector3();
const diveHits = new Set<Enemy>();

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
    heal: () => player.heal(100),
    setYaw: (y: number) => { cam.yaw = y; },
    setPitch: (p: number) => { cam.pitch = p; },
    freeCam: (x: number, y: number, z: number, yaw: number, pitch: number) => devtools.place(new THREE.Vector3(x, y, z), yaw, pitch, cam),
    freeCamOff: () => { devtools.freeCam = false; },
    give: (id: 'flamer' | 'bazooka' | 'sniper') => { weapons.unlock(id); weapons.addFuel(200); weapons.addRockets(8); weapons.addBands(12); },
    flag: (f: string) => { missionFlags.add(f); if (f === 'bridge') placeBridge(); },
    use: (id: string) => interact.trigger(id),
    resetWorld: () => worldState.reset(),
    activate: (id: string) => director.activate(id),
    // Flow tests: force-clear an encounter (combat is gated separately)
    clearEncounter: (id: string) => {
      for (const e of enemies.list) if (e.alive && e.encounter === id) enemies.damage(e, 9999, new THREE.Vector3(0, 0, 1));
    },
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
      mission: missionDef?.id ?? null,
      flags: [...missionFlags, ...worldState.flags],
      found: [...worldState.found],
      secrets: worldState.secrets.size,
      complete: mission?.complete ?? false,
      marbles: map.pickups.marblesFound,
      enemies: enemies.list.filter((e) => e.alive).length,
      kills: enemies.kills,
      melts: enemies.melts,
      weapon: weapons.current.id,
      owned: [...weapons.owned],
      combat: enemies.anyInCombat(),
      planes: aircraft.planes.length,
      downed: targets.downed,
      shots: weapons.stats.shots,
      hits: weapons.stats.hits,
      boomPulled: cam.boomPulledFrac,
      cam: cam.camera.position.toArray().map((v) => +v.toFixed(1)),
      checkpoint: map.regions.checkpoint.toArray(),
      waypoint: waypoint.target?.toArray() ?? null,
      suspicious: enemies.list.filter((e) => e.alive && e.state === 'suspicious').length,
      toppled: enemies.list.filter((e) => e.alive && e.state === 'toppled').length,
      crouched: player.crouched,
      diving: player.diving,
      squad: squad.active,
      burning: player.burning,
      batteries: interact.sabotaged,
    }),
  };
}

const clock = new THREE.Clock();
let time = 0;
let wasLocked = false;
let deployed = false;

function frame(): void {
  const rawDt = clock.getDelta();
  for (let step = 0; step < TURBO_STEPS; step++) simulate(rawDt);
  hud.perf(rawDt * 1000);
  renderer.render(scene, cam.camera);
  requestAnimationFrame(frame);
}

function simulate(rawDt: number): void {
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
      // Dive-tackle: sprint + C into a Tan topples the molded ones, shoves the rest
      if (player.diving) {
        const hit = enemies.tackle(player.pos, player.vel, diveHits);
        if (hit) {
          cam.addTrauma(0.25);
          if (Math.random() < 0.7) barks.sayRandom(player, player.pos, hit.molded ? ['Timber.', 'Down you go.'] : ['Oof.', 'Move.'], 'green');
        }
      } else if (diveHits.size) diveHits.clear();
    } else if (!player.alive && player.updateDead(dt)) {
      player.respawnAt(map.regions.checkpoint);
      map.platforms.resetArmed();
      hud.setMelt(1);
      barks.sayRandom(player, player.pos, MOSS_BARKS.respawn, 'green');
    }

    if (!free) cam.update(dt, input, player.pos, player.pivotHeight, aiming, player.sprinting, world);
    projectiles.update(dt, world, hittables);
    enemies.update(dt, player, (p) => map.grass.concealmentAt(p));
    aircraft.update(dt, player.pos, player.alive, world);
    director.update(dt);
    pockets?.update(dt);
    links.update(dt, player.pos);
    if (tallyT > 0) {
      tallyT -= dt;
      if (tallyT <= 0) {
        hud.hideTally();
        const next = mapDef.missions?.find((m) => !worldState.missions.has(m.id ?? ''));
        hud.radio('LT. OLIVE', next ? `Next on this floor: ${next.title}. Reload to take it, or keep exploring — the house is yours.` : 'This floor is done, Sergeant. The house is yours.', 6);
      }
    }
    squad.update(dt, player, cam.yaw, enemies, world);
    targets.update(dt, time);
    map.regions.update(player.pos);
    map.grass.update(dt, time);
    map.pickups.update(dt, time, player.pos);
    const holdingE = input.held('KeyE') && player.alive;
    const prompt = pows.update(dt, player.pos, holdingE) ?? interact.update(dt, time, player.pos, holdingE);
    // Candle-fire on Moss: damage in ~4-point ticks, keeps burning after the cone; a dive rolls it out
    if (player.alive && player.burning > 0) {
      player.burning -= dt;
      burnAcc += 5 * dt;
      if (player.diving) { player.burning = 0; burnAcc = 0; fireImmuneT = 0.8; hud.toast('ROLLED IT OUT'); }
      else if (burnAcc >= 4) { player.takeDamage(burnAcc, burnFrom); burnAcc = 0; }
      if (!burnWarned) { burnWarned = true; hud.radio('LT. OLIVE', 'You\'re on fire! Sprint and dive — C — roll it out!', 4); }
    } else burnAcc = 0;
    if (fireImmuneT > 0) fireImmuneT -= dt;
    hud.setBurning(player.alive && player.burning > 0);
    hud.setPrompt(prompt?.text ?? null, prompt?.progress ?? 0);
    pows.overwatch(dt, enemies, world);
    if (mission) mission.update(dt, { playerPos: player.pos, regions: map.regions, director, isFreed: (id) => pows.isFreed(id), isUsed: (id) => interact.used.has(id), hasFlag });
    audio.setCombat(enemies.anyInCombat() || aircraft.planes.length > 0);
    audio.loop('flame', weapons.firingFlame && player.alive, 0.5);
    // Room motif: the fridge hums (docs/10 §2.6). Louder as you get close.
    if (mapDef.id === 'g') {
      const dFridge = Math.hypot(player.pos.x + 63, player.pos.z + 104);
      audio.loop('fridge', dFridge < 60, Math.max(0.05, 0.35 * (1 - dFridge / 60)));
    }
    barks.update(dt);
    if (killStreakT > 0) killStreakT -= dt;

    map.sun.position.copy(player.pos).add(sunOffset);
    map.sun.target.position.copy(player.pos);

    if (input.pressed('KeyH')) hud.toggleHelp();
    if (input.pressed('BracketRight')) { LOOK.sens = Math.min(3, LOOK.sens * 1.18); saveOptions(); hud.toast(`LOOK SENSITIVITY ${LOOK.sens.toFixed(2)}×`); }
    if (input.pressed('BracketLeft')) { LOOK.sens = Math.max(0.3, LOOK.sens / 1.18); saveOptions(); hud.toast(`LOOK SENSITIVITY ${LOOK.sens.toFixed(2)}×`); }
    if (input.pressed('KeyI')) { LOOK.invertY = !LOOK.invertY; saveOptions(); hud.toast(`INVERT Y ${LOOK.invertY ? 'ON' : 'OFF'}`); }
    if (input.pressed('KeyM')) { muted = !muted; audio.setMuted(muted); saveOptions(); hud.toast(muted ? 'SOUND OFF' : 'SOUND ON'); }

    // Olive's pin + compass strip
    const o = mission?.active ?? null;
    if (o && o.kind === 'ride' && o.at && !rideBoarded && player.pos.distanceTo(v3(o.at)) < 2.5) {
      rideBoarded = true;
      waypoint.setTarget(regionCenter(o.target));
    }
    waypoint.update(time, player.pos);
    if (waypoint.target) {
      const dx = waypoint.target.x - player.pos.x, dz = waypoint.target.z - player.pos.z;
      const rel = Math.atan2(Math.sin(Math.atan2(dx, dz) - cam.yaw), Math.cos(Math.atan2(dx, dz) - cam.yaw));
      hud.setCompass(rel, Math.hypot(dx, dz));
    } else hud.setCompass(null, 0);

    hud.setAiming(aiming);
    hud.setWeapon(weapons.current.name, weapons.ammoText());
    hud.setMelt(player.hp / player.maxHp);
    hud.setMarbles(map.pickups.marblesFound, map.pickups.marblesTotal);
    if (lanes.length) hud.setStats(`TARGETS DOWN ${targets.downed} · ACCURACY ${weapons.stats.shots ? Math.round((weapons.stats.hits / weapons.stats.shots) * 100) : 0}%`);
    else if (enemies.kills || interact.sabotaged) hud.setStats(`TANS DOWN ${enemies.kills}${enemies.melts ? ` · MELTED ${enemies.melts}` : ''}${interact.sabotageTotal ? ` · BATTERIES ${interact.sabotaged}/${interact.sabotageTotal}` : ''}`);
  }

  audio.update(dt);
  hud.update(dt);
  input.endFrame();
}

requestAnimationFrame(frame);
