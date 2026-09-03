// Shared material palette (docs/07 §G). Props never invent materials —
// they pick a family and a tint. Materials are cached per (family, color).

import * as THREE from 'three';

export type Family =
  | 'PAPERBOARD'
  | 'PLASTIC_TOY'
  | 'METAL_KITCHEN'
  | 'WOOD_WARM'
  | 'FABRIC_SOFT'
  | 'GLASS_CHEAP'
  | 'RUBBER_MATTE'
  | 'STONE'
  | 'CERAMIC';

const cache = new Map<string, THREE.Material>();

export function mat(family: Family, color: number, opts: { emissive?: number } = {}): THREE.Material {
  const key = `${family}:${color}:${opts.emissive ?? 0}`;
  let m = cache.get(key);
  if (m) return m;
  switch (family) {
    case 'PAPERBOARD':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
      break;
    case 'PLASTIC_TOY':
      // Plastosheen 2.0: harder clearcoat, a touch of sheen for the fake-SSS
      // glow injection-molded plastic has at grazing angles.
      m = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.3,
        metalness: 0,
        clearcoat: 0.75,
        clearcoatRoughness: 0.18,
        sheen: 0.18,
        sheenColor: new THREE.Color(0xffffff),
        sheenRoughness: 0.6,
        emissive: opts.emissive ?? 0,
        emissiveIntensity: 0.6,
      });
      break;
    case 'METAL_KITCHEN':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 });
      break;
    case 'WOOD_WARM':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0 });
      break;
    case 'FABRIC_SOFT':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
      break;
    case 'GLASS_CHEAP':
      m = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.1,
        metalness: 0,
        transparent: true,
        opacity: 0.4,
        clearcoat: 1,
      });
      break;
    case 'RUBBER_MATTE':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });
      break;
    case 'STONE':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05 });
      break;
    case 'CERAMIC':
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.05 });
      break;
  }
  cache.set(key, m);
  return m;
}

/** Procedural label texture: stripes + an invented wordmark block. No real brands. */
export function labelTexture(base: string, accent: string, word: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = accent;
  g.fillRect(0, 40, 256, 34);
  g.fillRect(0, 190, 256, 20);
  g.fillStyle = '#fffaf0';
  g.font = 'bold 44px Impact, "Arial Black", sans-serif';
  g.textAlign = 'center';
  g.fillText(word, 128, 140);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
