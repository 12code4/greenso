import { MapDef } from '../runtime/types';
import { BACKYARD } from './backyard';
import { KITTEST } from './kittest';
import { FLOOR_G } from './house/g';
import { FLOOR_U } from './house/u';
import '../kit/house'; // registers the House Kit props
import '../kit/upstairs'; // registers the Upstairs Kit props

export const MAPS: Record<string, MapDef> = {
  backyard: BACKYARD,
  kittest: KITTEST,
  g: FLOOR_G,
  u: FLOOR_U,
};

export const DEFAULT_MAP = 'backyard';

/** Base ground kind per map (the big plane under everything). */
export const BASE_GROUND: Record<string, string> = {
  backyard: 'lawn',
  kittest: 'planks',
  g: 'hardwood',
  u: 'hardwood',
};
