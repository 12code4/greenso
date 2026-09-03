// MapDef — the declarative map format (docs/06 §3). One TypeScript module
// per map exports one of these; the runtime interprets it.

import { Vec3 } from '../../core/math';

export type RegionKind = 'arena' | 'connector' | 'overlook' | 'secret' | 'exit' | 'climb';

export interface RegionDef {
  id: string;
  name: string;
  kind: RegionKind;
  min: Vec3;
  max: Vec3;
  band: string;
  lowCeiling?: boolean;
  /** Respawn point set when the player enters this region. */
  checkpoint?: Vec3;
}

export interface PropInstance {
  kit: string;
  at: Vec3;
  yaw?: number;
  variant?: number;
  tags?: string[];
  /** Parametric props (counter runs, shelves, rails, walls of books) read their W×H×D from here. */
  size?: Vec3;
}

export type RouteClass = 'main' | 'flank' | 'crawl' | 'climb' | 'secret' | 'setpiece';

export interface RouteDef {
  id: string;
  class: RouteClass;
  points: Vec3[];
}

export type EnemyType = 'trooper' | 'based' | 'grenadier' | 'sniper' | 'officer' | 'flamer';

/** Hold-E interactables (Update 4): sabotage a battery crate, or light a bottle rocket that flings you to `to`. */
export type InteractableDef =
  | { id: string; kind: 'sabotage'; at: Vec3; prompt: string; hold?: number }
  | { id: string; kind: 'launch'; at: Vec3; to: Vec3; prompt: string; hold?: number; flightTime?: number }
  /** Generic hold-E: fires `event` (mission objectives of kind `use` complete on it). `requires` = a WorldState flag; `grants` = a flag set on use. */
  | { id: string; kind: 'use'; at: Vec3; prompt: string; hold?: number; requires?: string; grants?: string; once?: boolean; lockedPrompt?: string }
  /** Teleport within the floor (the vacuum hose). */
  | { id: string; kind: 'warp'; at: Vec3; to: Vec3; prompt: string; hold?: number };

/** Tans that walk a loop of points when idle (docs/10 §7). */
export interface PatrolDef {
  id: string;
  points: Vec3[];
  units: EnemyType[];
  speed?: number;
  pause?: number;
}

/** Random ambush pockets rolled on region entry from tagged concealment spots (docs/10 §7). */
export interface PocketDef {
  spots: { at: Vec3; region: string }[];
  tables: { units: EnemyType[]; weight: number }[];
  chance: number;
  cooldown: number;
}

/** A way to another floor (docs/10 §5): a trigger volume; the destination map may not exist yet. */
export interface FloorLinkDef {
  id: string;
  kind: 'chute' | 'stairs' | 'duct' | 'ladder' | 'door' | 'gap' | 'window' | 'express' | 'climb';
  name: string;
  min: Vec3;
  max: Vec3;
  to: { map: string; spawn: Vec3; yaw: number };
  /** Found by exploring (default) or unlocked by a mission id. */
  foundBy?: string;
}

export interface UnitDef {
  type: EnemyType;
  at: Vec3;
  yaw?: number;
  /** Lane nodes for molded units (they hop between these). */
  nodes?: Vec3[];
}

export type Activation =
  | { kind: 'region-enter'; region: string }
  | { kind: 'objective'; objective: string }
  | { kind: 'schedule'; delay: number; after: string }
  | { kind: 'manual' };

export interface EncounterDef {
  id: string;
  template: string;
  region: string;
  units: UnitDef[];
  activation: Activation;
}

export type HazardOp =
  | { op: 'pushVolume'; min: Vec3; max: Vec3; force: Vec3; duration: number }
  | { op: 'soakVolume'; min: Vec3; max: Vec3; duration: number }
  | { op: 'quakeShadow'; from: Vec3; to: Vec3; radius: number; duration: number; magnitude: number }
  | { op: 'spawnWave'; encounter: string }
  | { op: 'sprinklerSweep'; head: Vec3; fromDeg: number; toDeg: number; range: number; duration: number };

export interface HazardPhase {
  at: number;
  name: string;
  ops: HazardOp[];
}

export interface HazardDef {
  id: string;
  period: number;
  /** Random extra delay added per cycle (dog runs are loose). */
  jitter?: number;
  phases: HazardPhase[];
  telegraph?: { cue: string; lead: number };
}

export type PickupKind = 'ball' | 'string' | 'ammo' | 'glue' | 'moldTray' | 'marble' | 'bands' | 'flamer' | 'bazooka';

export interface PickupDef {
  kind: PickupKind;
  at: Vec3;
  id?: string;
}

export interface PowDef {
  id: string;
  name: string;
  at: Vec3;
  yaw?: number;
  /** Where the freed soldier goes to (overwatch post). */
  post?: Vec3;
}

export interface PlatformDef {
  id: string;
  kit: string;
  path: Vec3[];
  speed: number;
  /** Start moving when this objective becomes active (else immediately). */
  startOn?: string;
  loop?: boolean;
  /** Render a water ribbon along the path (the hose-stream). */
  stream?: boolean;
}

export interface AircraftWave {
  id: string;
  path: Vec3[];
  count: number;
  interval: number;
  /** Fire when this encounter activates. */
  on: string;
}

export type ObjectiveKind = 'use' | 'wait' | 'pickup' | 'reach' | 'clear' | 'rescue' | 'ride' | 'discover';

export interface ObjectiveDef {
  id: string;
  kind: ObjectiveKind;
  text: string;
  /** Region for reach/discover/ride; encounter for clear; pow id for rescue. */
  target: string;
  /** Olive's radio line when this objective begins. */
  radio?: string;
  /** Olive's radio line when it completes. */
  radioDone?: string;
  /** Explicit waypoint for the radio pin (else derived from the target). */
  at?: Vec3;
  /** `wait`: seconds. */
  seconds?: number;
}

export interface MissionDef {
  id?: string;
  title: string;
  briefing: string[];
  objectives: ObjectiveDef[];
  parSeconds: number;
}

export interface LandmarkDef {
  id: string;
  name: string;
  at: Vec3;
}

export interface GrassZone {
  min: Vec3;
  max: Vec3;
  height: [number, number];
  /** Blades per square unit. */
  density: number;
  /** 0..1 concealment when unflattened (mowed lawn: 0). */
  concealment: number;
}

export interface GroundZone {
  kind: 'lawn' | 'soil' | 'planks' | 'stone' | 'water' | 'tile' | 'hardwood' | 'carpet' | 'concrete';
  min: Vec3;
  max: Vec3;
  /** Top height of this ground slab (0 = flush with ground plane). */
  height?: number;
  color?: number;
}

export interface ShellDef {
  sky: { horizon: number; zenith: number };
  fog: { color: number; near: number; far: number };
  sun: { dir: Vec3; color: number; intensity: number };
  hemi: { sky: number; ground: number; intensity: number };
  ground: GroundZone[];
  /** Big masses that close the horizon: walls, fences, furniture. Always colliders. */
  masses: { kind: 'fence' | 'siding' | 'mass' | 'wall' | 'ceiling' | 'slab' | 'glass'; min: Vec3; max: Vec3; color?: number }[];
  /** Invisible bounds. */
  bounds: { min: Vec3; max: Vec3 };
}

export interface MapDef {
  id: string;
  title: string;
  realFootprint: string;
  spawn: Vec3;
  spawnYaw: number;
  shell: ShellDef;
  regions: RegionDef[];
  props: PropInstance[];
  routes: RouteDef[];
  grass?: GrassZone[];
  encounters: EncounterDef[];
  hazards: HazardDef[];
  pickups: PickupDef[];
  pows?: PowDef[];
  interactables?: InteractableDef[];
  patrols?: PatrolDef[];
  pockets?: PocketDef;
  links?: FloorLinkDef[];
  /** Sky-less interiors: skip the dome and use the fog colour as the backdrop. */
  indoor?: boolean;
  platforms?: PlatformDef[];
  aircraft?: AircraftWave[];
  mission?: MissionDef;
  /** Several missions per map (the house floors): selected with ?mission=<id>; the first is the gate mission. */
  missions?: MissionDef[];
  landmarks: LandmarkDef[];
  /** Optional pop-up target lanes (kit test scene / tutorial). */
  targetLanes?: { at: Vec3; yaw: number; slide?: { axis: Vec3; amp: number; speed: number } }[];
}
