// Barks: 3–5 word catchphrases as floating text over heads (docs/09 §1.5).
// Straight-man Moss, screaming Tans. Text sprites now; scratch VO later.

import * as THREE from 'three';
import { pick } from '../core/math';

export const TAN_BARKS = {
  suspicious: ['Huh?', 'Hear that?', 'Who\'s there?', 'Sarge?', 'Hm.'],
  alert: ['Green!', 'Contact!', 'There he is!', 'Get him!', 'Greenie!', 'Sound the alarm!'],
  hit: ['Ow!', 'My paint!', 'Medic!', 'That\'s my good side!', 'Hey!'],
  death: ['Aaaah!', 'Mommy!', 'Tell Taupe—', 'Not like this!', 'I regret nothing!'],
  melt: ['I\'m melting!', 'Hot hot hot!', 'My feet!', 'Nooo—glub'],
  charge: ['Charge!', 'Bayonets!', 'For Taupe!', 'Rush him!'],
  topple: ['Whoa—', 'Timber!', 'Help me up!'],
  flee: ['Retreat!', 'Not worth it!', 'Nope!'],
};

export const MOSS_BARKS = {
  kill: ['Good to go.', 'Next.', 'Stay green.', 'Molded in \'62.', 'Party\'s over.'],
  multikill: ['Bulk order.', 'Two for one.', 'That\'s a set.'],
  flamer: ['Now we\'re cooking.', 'Hot plastic.'],
  bazooka: ['Big stick.', 'That\'ll do.'],
  hurt: ['Scuffed.', 'Just paint.', 'Still standing.'],
  lowhp: ['Getting warm.', 'Need glue.'],
  respawn: ['Fresh copy.', 'Same mold.', 'Again.'],
};

interface Bark {
  sprite: THREE.Sprite;
  life: number;
  max: number;
  vel: number;
}

const COLORS = { tan: '#f2dcb0', green: '#b8e89a', fern: '#d9f0c8', olive: '#e6e6d8' } as const;
export type BarkColor = keyof typeof COLORS;

/** Pvt. Sprout — eager, loud, draws aggro badly. */
export const SPROUT_BARKS = {
  join: ['Pvt. Sprout, reporting!', 'Where do you want me, Sarge?'],
  combat: ['Over here! Over HERE!', 'I got this one!', 'Covering!', 'Was that me?', 'Sarge, they\'re shooting!'],
  kill: ['Got one!', 'Did you see that?!', 'That was me. That was me.'],
  idle: ['Nice yard.', 'Are we there yet?', 'I like the tall grass.', 'My mold has a bubble in it.'],
  down: ['Sarge? SARGE?', 'Medic! I mean — glue!'],
};

/** Gen. Taupe on the ham radio: hammy villain vs Moss's deadpan. */
export const TAUPE_LINES = {
  contact: ['Ah, the Green. Right on schedule. Boys — make him a puddle.', 'That\'s MY yard, Sergeant.', 'You\'re two inches tall and out of your depth.', 'Tan Command to all units: the little green one. Squash him.'],
  death: ['Another one for the bin! Ha!', 'Melted, shattered — I lose track.', 'Do they make you in bulk?', 'Send the next one. I have all afternoon.'],
  objective: ['Enjoy it. It\'s the last thing you take from me.', 'One clearing. I have the whole house.', 'You fight like a Christmas ornament.'],
  sabotage: ['My BATTERIES! Do you know what those cost?!', 'Leave the batteries alone, you plastic vandal!'],
  leaf: ['A LEAF? You\'re escaping on a LEAF?', 'Gliders! Sink that leaf!'],
};

export class Barks {
  private scene: THREE.Scene;
  private live: Bark[] = [];
  private cooldown = new Map<object, number>();
  onSay: ((color: BarkColor, at: THREE.Vector3) => void) | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /** Say a line above `at`. `who` gates a per-speaker cooldown (2 s). */
  say(who: object, at: THREE.Vector3, text: string, color: BarkColor = 'tan', headHeight = 1.35): boolean {
    const now = performance.now() / 1000;
    const last = this.cooldown.get(who) ?? -99;
    if (now - last < 2.0) return false;
    this.cooldown.set(who, now);

    const c = document.createElement('canvas');
    const font = 'bold 40px "Courier New", monospace';
    const g = c.getContext('2d')!;
    g.font = font;
    const w = Math.ceil(g.measureText(text).width) + 36;
    c.width = w;
    c.height = 64;
    g.font = font;
    g.textBaseline = 'middle';
    // Speech-bubble pill
    g.fillStyle = 'rgba(20,16,10,0.72)';
    roundRect(g, 2, 8, w - 4, 48, 14);
    g.fill();
    g.fillStyle = COLORS[color];
    g.fillText(text, 18, 33);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    const scale = 0.011;
    sprite.scale.set(w * scale, 64 * scale, 1);
    sprite.position.copy(at);
    sprite.position.y += headHeight;
    sprite.renderOrder = 999;
    this.scene.add(sprite);
    this.live.push({ sprite, life: 0, max: 1.7, vel: 0.35 });
    if (this.onSay) this.onSay(color, at);
    return true;
  }

  sayRandom(who: object, at: THREE.Vector3, lines: readonly string[], color: BarkColor = 'tan', headHeight = 1.35): boolean {
    return this.say(who, at, pick(lines), color, headHeight);
  }

  update(dt: number): void {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const b = this.live[i];
      b.life += dt;
      b.sprite.position.y += b.vel * dt;
      const k = b.life / b.max;
      (b.sprite.material as THREE.SpriteMaterial).opacity = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
      if (b.life >= b.max) {
        this.scene.remove(b.sprite);
        (b.sprite.material as THREE.SpriteMaterial).map?.dispose();
        (b.sprite.material as THREE.Material).dispose();
        this.live.splice(i, 1);
      }
    }
  }
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
