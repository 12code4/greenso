// buildMap(def): interprets a MapDef into scene content, colliders, and the
// runtime systems. Game-side effects (audio, camera, director) come in via
// hooks so the map runtime owns no gameplay state.

import * as THREE from 'three';
import { CollisionWorld } from '../../sim/collision';
import { MapDef, PropInstance } from './types';
import { buildShell } from './shell';
import { RegionSystem } from './regions';
import { GrassField } from './grass';
import { HazardHooks, HazardScheduler } from './hazards';
import { PlatformSystem } from './platforms';
import { PickupSystem } from '../../game/pickups';
import { kitProp, LocalBox } from '../kit/registry';
import { v3, Vec3 } from '../../core/math';

export interface PlacedProp {
  def: PropInstance;
  object: THREE.Object3D;
  boxes: { center: THREE.Vector3; size: THREE.Vector3 }[];
}

export interface MapRuntime {
  def: MapDef;
  spawn: THREE.Vector3;
  spawnYaw: number;
  regions: RegionSystem;
  props: PlacedProp[];
  landmarks: { id: string; name: string; at: THREE.Vector3 }[];
  sun: THREE.DirectionalLight;
  grass: GrassField;
  hazards: HazardScheduler;
  platforms: PlatformSystem;
  pickups: PickupSystem;
}

/** Place one kit prop at a world position/yaw, registering its colliders. */
export function placeProp(inst: PropInstance, scene: THREE.Scene, world: CollisionWorld | null): PlacedProp {
  const prop = kitProp(inst.kit);
  const built = prop.build(inst.variant ?? 0, inst.size);
  const yaw = inst.yaw ?? 0;
  built.mesh.position.copy(v3(inst.at));
  built.mesh.rotation.y = yaw;
  scene.add(built.mesh);
  const boxes = built.colliders.map((b) => worldBox(b, inst.at, yaw));
  if (world) for (const b of boxes) world.addBox(b.center, b.size);
  return { def: inst, object: built.mesh, boxes };
}

/** Conservative world AABB of a yawed local box. */
function worldBox(b: LocalBox, at: Vec3, yaw: number): { center: THREE.Vector3; size: THREE.Vector3 } {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const [cx, cy, cz] = b.center;
  const [sx, sy, sz] = b.size;
  const rx = cx * c + cz * s;
  const rz = -cx * s + cz * c;
  const hx = (Math.abs(c) * sx) / 2 + (Math.abs(s) * sz) / 2;
  const hz = (Math.abs(s) * sx) / 2 + (Math.abs(c) * sz) / 2;
  return {
    center: new THREE.Vector3(at[0] + rx, at[1] + cy, at[2] + rz),
    size: new THREE.Vector3(hx * 2, sy, hz * 2),
  };
}

export function buildMap(
  def: MapDef,
  scene: THREE.Scene,
  world: CollisionWorld,
  baseGround: string,
  hazardHooks: HazardHooks,
): MapRuntime {
  const shell = buildShell(def.shell, scene, world, baseGround, !!def.indoor);

  const props: PlacedProp[] = [];
  for (const inst of def.props) props.push(placeProp(inst, scene, world));

  const spawn = v3(def.spawn);
  const regions = new RegionSystem(def.regions, spawn);
  const landmarks = def.landmarks.map((l) => ({ id: l.id, name: l.name, at: v3(l.at) }));

  const grass = new GrassField(def.grass ?? [], scene);
  const hazards = new HazardScheduler(def.hazards, scene, hazardHooks);
  const platforms = new PlatformSystem(def.platforms ?? [], scene, world);
  const pickups = new PickupSystem(def.pickups, scene);

  return { def, spawn, spawnYaw: def.spawnYaw, regions, props, landmarks, sun: shell.sun, grass, hazards, platforms, pickups };
}
