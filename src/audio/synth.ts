// WebAudio synth engine — all SFX procedural, toy register (docs/04 audio).
// Positional gain/pan is relative to the listener (the camera).

import * as THREE from 'three';

type Recipe = (ctx: AudioContext, out: AudioNode, t: number) => void;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private amb!: GainNode;
  private music!: GainNode;
  private noiseBuf!: AudioBuffer;
  private listener: THREE.Camera | null = null;
  private loops = new Map<string, { src: AudioBufferSourceNode; gain: GainNode }>();
  private birdTimer = 2;
  private combat = false;
  private combatGainTarget = 0;
  private nextBeat = 0;
  private beat = 0;
  private tmp = new THREE.Vector3();
  enabled = true;

  setListener(cam: THREE.Camera): void {
    this.listener = cam;
  }

  /** Call from a user gesture (the deploy click). Safe to call repeatedly. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      this.ctx = new AudioContext();
    } catch {
      this.enabled = false;
      return;
    }
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(c.destination);
    this.sfx = c.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);
    this.amb = c.createGain();
    this.amb.gain.value = 0.5;
    this.amb.connect(this.master);
    this.music = c.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.master);
    // 2 s of white noise, reused by everything
    this.noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.startAmbience();
  }

  get ready(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  // ------------------------------------------------------------ SFX

  play(name: string, at?: THREE.Vector3, gain = 1): void {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx!;
    const recipe = RECIPES[name];
    if (!recipe) return;
    const g = ctx.createGain();
    let vol = gain;
    let pan = 0;
    if (at && this.listener) {
      const d = at.distanceTo(this.listener.position);
      vol *= Math.max(0.05, 1 - d / 45);
      this.tmp.copy(at).applyMatrix4(this.listener.matrixWorldInverse);
      pan = Math.max(-1, Math.min(1, this.tmp.x / 12));
    }
    g.gain.value = vol;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p).connect(this.sfx);
    recipe(ctx, g, ctx.currentTime);
  }

  loop(name: string, on: boolean, gain = 0.3): void {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const cur = this.loops.get(name);
    if (on && !cur) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = name === 'sprinkler' ? 2600 : 800;
      f.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.4);
      src.connect(f).connect(g).connect(this.sfx);
      src.start();
      this.loops.set(name, { src, gain: g });
    } else if (!on && cur) {
      cur.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      const s = cur.src;
      setTimeout(() => s.stop(), 700);
      this.loops.delete(name);
    }
  }

  // ------------------------------------------------------------ ambience & music

  private startAmbience(): void {
    const ctx = this.ctx!;
    // Wind: brown-ish noise, slow gain LFO
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const g = ctx.createGain();
    g.gain.value = 0.22;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.13;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    src.connect(lp).connect(g).connect(this.amb);
    src.start();
  }

  setCombat(on: boolean): void {
    this.combat = on;
    this.combatGainTarget = on ? 0.35 : 0;
  }

  update(dt: number): void {
    if (!this.ready) return;
    const ctx = this.ctx!;
    // Birds
    this.birdTimer -= dt;
    if (this.birdTimer <= 0 && !this.combat) {
      this.birdTimer = 2.5 + Math.random() * 6;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      const f0 = 2400 + Math.random() * 900;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.linearRampToValueAtTime(f0 * 1.25, t + 0.08);
      o.frequency.linearRampToValueAtTime(f0 * 0.95, t + 0.16);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(this.amb);
      o.start(t);
      o.stop(t + 0.25);
    }
    // Combat drums: tiny marching snare + bass, 120 bpm, scheduled ahead
    const target = this.combatGainTarget;
    this.music.gain.value += (target - this.music.gain.value) * Math.min(1, dt * 2);
    if (this.music.gain.value > 0.01) {
      const stepDur = 0.25; // eighth notes at 120 bpm
      while (this.nextBeat < ctx.currentTime + 0.3) {
        const t = Math.max(this.nextBeat, ctx.currentTime);
        const b = this.beat % 8;
        if (b === 0 || b === 4) this.kick(t);
        if (b === 2 || b === 6 || b === 7) this.snare(t, b === 7 ? 0.5 : 1);
        if (b === 3 && Math.random() < 0.5) this.snare(t, 0.35);
        if (this.beat % 32 === 24) this.brassStab(t);
        this.beat++;
        this.nextBeat = t + stepDur;
      }
    } else {
      this.nextBeat = ctx.currentTime;
    }
  }

  private kick(t: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(this.music);
    o.start(t);
    o.stop(t + 0.22);
  }

  private snare(t: number, vol: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5 * vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    src.connect(f).connect(g).connect(this.music);
    src.start(t, Math.random());
    src.stop(t + 0.1);
  }

  private brassStab(t: number): void {
    const ctx = this.ctx!;
    for (const f0 of [196, 247, 294]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f0;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(600, t);
      f.frequency.exponentialRampToValueAtTime(2400, t + 0.05);
      f.frequency.exponentialRampToValueAtTime(500, t + 0.35);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(f).connect(g).connect(this.music);
      o.start(t);
      o.stop(t + 0.45);
    }
  }
}

// ------------------------------------------------------------ recipes

function noise(ctx: AudioContext, out: AudioNode, t: number, dur: number, opts: { type?: BiquadFilterType; freq?: number; q?: number; freqEnd?: number; gain?: number; attack?: number }): void {
  const src = ctx.createBufferSource();
  src.buffer = noiseBufferOf(ctx);
  const f = ctx.createBiquadFilter();
  f.type = opts.type ?? 'bandpass';
  f.frequency.setValueAtTime(opts.freq ?? 1000, t);
  if (opts.freqEnd) f.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + dur);
  f.Q.value = opts.q ?? 1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.6, t + (opts.attack ?? 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(out);
  src.start(t, Math.random() * 1.5);
  src.stop(t + dur + 0.02);
}

function tone(ctx: AudioContext, out: AudioNode, t: number, dur: number, f0: number, f1: number, type: OscillatorType, gain: number): void {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let sharedNoise: AudioBuffer | null = null;
function noiseBufferOf(ctx: AudioContext): AudioBuffer {
  if (sharedNoise && sharedNoise.sampleRate === ctx.sampleRate) return sharedNoise;
  sharedNoise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = sharedNoise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return sharedNoise;
}

const RECIPES: Record<string, Recipe> = {
  rifle: (c, o, t) => { noise(c, o, t, 0.09, { freq: 1600, freqEnd: 400, q: 0.7, gain: 0.7 }); tone(c, o, t, 0.05, 220, 60, 'square', 0.25); },
  cap: (c, o, t) => { noise(c, o, t, 0.045, { type: 'highpass', freq: 2500, gain: 0.9 }); tone(c, o, t, 0.08, 320, 70, 'triangle', 0.35); },
  band: (c, o, t) => { tone(c, o, t, 0.06, 1100, 260, 'sine', 0.35); noise(c, o, t, 0.03, { type: 'highpass', freq: 4000, gain: 0.2 }); },
  clack: (c, o, t) => { noise(c, o, t, 0.03, { freq: 2400, q: 6, gain: 0.45 }); tone(c, o, t, 0.04, 900, 500, 'triangle', 0.15); },
  hit_plastic: (c, o, t) => { noise(c, o, t, 0.04, { freq: 3000, q: 5, gain: 0.5 }); tone(c, o, t, 0.06, 1400, 700, 'triangle', 0.2); },
  topple: (c, o, t) => { noise(c, o, t, 0.06, { freq: 900, q: 3, gain: 0.5 }); tone(c, o, t + 0.05, 0.12, 300, 120, 'triangle', 0.3); },
  hurt: (c, o, t) => { noise(c, o, t, 0.08, { freq: 1200, q: 2, gain: 0.5 }); tone(c, o, t, 0.15, 260, 140, 'square', 0.18); },
  explode: (c, o, t) => { noise(c, o, t, 0.5, { type: 'lowpass', freq: 1200, freqEnd: 120, gain: 1.0, attack: 0.01 }); tone(c, o, t, 0.35, 90, 35, 'sine', 0.8); },
  bounce: (c, o, t) => { noise(c, o, t, 0.03, { freq: 1500, q: 4, gain: 0.3 }); },
  melt: (c, o, t) => { noise(c, o, t, 0.7, { type: 'lowpass', freq: 1400, freqEnd: 300, gain: 0.35, attack: 0.05 }); tone(c, o, t, 0.6, 700, 120, 'sine', 0.12); },
  shatter: (c, o, t) => { for (let i = 0; i < 5; i++) noise(c, o, t + i * 0.03, 0.05, { freq: 2200 + i * 500, q: 6, gain: 0.35 }); },
  pickup: (c, o, t) => { tone(c, o, t, 0.08, 660, 660, 'sine', 0.3); tone(c, o, t + 0.07, 0.12, 990, 990, 'sine', 0.3); },
  marble: (c, o, t) => { tone(c, o, t, 0.5, 1760, 1740, 'sine', 0.25); tone(c, o, t, 0.6, 2637, 2600, 'sine', 0.12); },
  objective: (c, o, t) => { [523, 659, 784].forEach((f, i) => tone(c, o, t + i * 0.09, 0.22, f, f, 'triangle', 0.25)); },
  radio: (c, o, t) => { noise(c, o, t, 0.07, { freq: 1800, q: 1, gain: 0.25 }); tone(c, o, t + 0.05, 0.08, 1200, 1200, 'square', 0.08); },
  pipe_knock: (c, o, t) => { for (let i = 0; i < 3; i++) { noise(c, o, t + i * 0.28, 0.08, { type: 'lowpass', freq: 220, q: 8, gain: 0.9 }); tone(c, o, t + i * 0.28, 0.1, 160, 90, 'sine', 0.5); } },
  jingle: (c, o, t) => { [3200, 2800, 3600, 3000].forEach((f, i) => tone(c, o, t + i * 0.07 + Math.random() * 0.03, 0.12, f, f * 0.97, 'triangle', 0.18)); },
  thump: (c, o, t) => { tone(c, o, t, 0.3, 70, 40, 'sine', 0.8); noise(c, o, t, 0.12, { type: 'lowpass', freq: 200, gain: 0.5 }); },
  glider: (c, o, t) => { noise(c, o, t, 0.9, { type: 'bandpass', freq: 500, freqEnd: 1800, q: 1.5, gain: 0.45, attack: 0.2 }); },
  interact_tick: (c, o, t) => { tone(c, o, t, 0.04, 1500, 1500, 'sine', 0.12); },
  unglue: (c, o, t) => { noise(c, o, t, 0.4, { type: 'bandpass', freq: 600, freqEnd: 2200, q: 2, gain: 0.5, attack: 0.02 }); tone(c, o, t + 0.3, 0.15, 500, 900, 'sine', 0.25); },
  whistle_grenade: (c, o, t) => { tone(c, o, t, 0.7, 1800, 600, 'sine', 0.12); },
  glint: (c, o, t) => { tone(c, o, t, 0.25, 3500, 3400, 'sine', 0.12); },
  death: (c, o, t) => { tone(c, o, t, 0.5, 300, 60, 'sawtooth', 0.15); noise(c, o, t, 0.3, { freq: 800, gain: 0.3 }); },
  victory: (c, o, t) => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(c, o, t + i * 0.12, 0.35, f, f, 'triangle', 0.25)); },
};
