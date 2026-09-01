// MapDef — the declarative map format (docs/06 §3). One TypeScript module
// per map exports one of these; the runtime interprets it.

import { Vec3 } from '../../core/math';

export type RegionKind = 'arena' | 'connector' | 'overlook' | 'secret' | 'exit';

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
}

export type RouteClass = 'main' | 'flank' | 'crawl' | 'climb' | 'secret' | 'setpiece';

export interface RouteDef {
  id: string;
  class: RouteClass;
  points: Vec3[];
}

export type EnemyType = 'trooper' | 'based' | 'grenadier' | 'sniper' | 'officer';

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

export type PickupKind = 'ammo' | 'glue' | 'moldTray' | 'marble' | 'bands';

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

export type ObjectiveKind = 'reach' | 'clear' | 'rescue' | 'ride' | 'discover';

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
}

export interface MissionDef {
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
  kind: 'lawn' | 'soil' | 'planks' | 'stone' | 'water';
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
  masses: { kind: 'fence' | 'siding' | 'mass'; min: Vec3; max: Vec3; color?: number }[];
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
  platforms?: PlatformDef[];
  aircraft?: AircraftWave[];
  mission?: MissionDef;
  landmarks: LandmarkDef[];
  /** Optional pop-up target lanes (kit test scene / tutorial). */
  targetLanes?: { at: Vec3; yaw: number; slide?: { axis: Vec3; amp: number; speed: number } }[];
}
