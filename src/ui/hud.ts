// DOM overlay HUD: crosshair, score, weapon, frame-time graph,
// click-to-deploy overlay, help panel.

export class Hud {
  private crosshair: HTMLDivElement;
  private weaponEl: HTMLDivElement;
  private scoreEl: HTMLDivElement;
  private perfCanvas: HTMLCanvasElement;
  private perfText: HTMLDivElement;
  private overlay: HTMLDivElement;
  private help: HTMLDivElement;
  private frameTimes: number[] = [];
  private perfAccum = 0;

  constructor(parent: HTMLElement) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.className = 'hud';
    parent.appendChild(root);

    this.crosshair = el('div', 'crosshair', root);
    this.crosshair.innerHTML = '<div class="dot"></div><div class="ring"></div>';

    const topLeft = el('div', 'top-left', root);
    this.weaponEl = el('div', 'weapon', topLeft);
    this.scoreEl = el('div', 'score', topLeft);

    const topRight = el('div', 'top-right', root);
    this.perfCanvas = document.createElement('canvas');
    this.perfCanvas.width = 150;
    this.perfCanvas.height = 40;
    topRight.appendChild(this.perfCanvas);
    this.perfText = el('div', 'perf-text', topRight);

    const hint = el('div', 'hint', root);
    hint.textContent = 'H — controls';

    this.help = el('div', 'help', root);
    this.help.innerHTML =
      '<b>PLASTIC PLATOON — M0 GREYBOX</b><br><br>' +
      'WASD move · Shift sprint · Space jump/vault<br>' +
      'Mouse look · LMB fire · RMB aim<br>' +
      'C crouch · C during sprint: dive<br>' +
      '1/2 or Q — rifle / cap pistol<br>' +
      'H — toggle this panel · Esc — release mouse';
    this.help.style.display = 'none';

    this.overlay = el('div', 'overlay', root);
    this.overlay.innerHTML =
      '<div class="title">PLASTIC PLATOON</div>' +
      '<div class="sub">M0 greybox — the firing range</div>' +
      '<div class="deploy">CLICK TO DEPLOY</div>' +
      '<div class="controls">WASD + mouse · Shift sprint · Space jump · RMB aim · LMB fire</div>';
  }

  setOverlay(visible: boolean): void {
    this.overlay.style.display = visible ? 'flex' : 'none';
  }

  toggleHelp(): void {
    this.help.style.display = this.help.style.display === 'none' ? 'block' : 'none';
  }

  setAiming(aiming: boolean): void {
    this.crosshair.classList.toggle('aiming', aiming);
  }

  setWeapon(name: string): void {
    this.weaponEl.textContent = `${name} · AMMO ∞`;
  }

  setScore(downed: number, hits: number, shots: number): void {
    const acc = shots > 0 ? Math.round((hits / shots) * 100) : 0;
    this.scoreEl.textContent = `TARGETS DOWN ${downed} · ACCURACY ${acc}%`;
  }

  hitMarker(killed: boolean): void {
    this.crosshair.classList.remove('hit', 'kill');
    void this.crosshair.offsetWidth; // restart animation
    this.crosshair.classList.add(killed ? 'kill' : 'hit');
  }

  perf(dtMs: number): void {
    this.frameTimes.push(dtMs);
    if (this.frameTimes.length > 75) this.frameTimes.shift();
    this.perfAccum += dtMs;
    if (this.perfAccum > 250) {
      this.perfAccum = 0;
      const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.perfText.textContent = `${avg.toFixed(1)} ms · ${Math.round(1000 / avg)} fps`;
      const g = this.perfCanvas.getContext('2d')!;
      g.clearRect(0, 0, 150, 40);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(0, 0, 150, 40);
      for (let i = 0; i < this.frameTimes.length; i++) {
        const t = this.frameTimes[i];
        const h = Math.min(38, (t / 33.3) * 38);
        g.fillStyle = t > 16.9 ? '#e06a4a' : '#8bc46a';
        g.fillRect(i * 2, 40 - h, 1.6, h);
      }
      // 16.7ms budget line
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.fillRect(0, 40 - (16.7 / 33.3) * 38, 150, 1);
    }
  }
}

function el(tag: string, cls: string, parent: HTMLElement): HTMLDivElement {
  const e = document.createElement(tag) as HTMLDivElement;
  e.className = cls;
  parent.appendChild(e);
  return e;
}

const CSS = `
.hud { position: fixed; inset: 0; pointer-events: none; font-family: 'Courier New', monospace; color: #f2ead9; text-shadow: 0 1px 2px rgba(0,0,0,0.6); user-select: none; }
.crosshair { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
.crosshair .dot { position: absolute; left: -2px; top: -2px; width: 4px; height: 4px; border-radius: 50%; background: #f2ead9; box-shadow: 0 0 3px rgba(0,0,0,0.8); }
.crosshair .ring { position: absolute; left: -11px; top: -11px; width: 20px; height: 20px; border: 1.5px solid rgba(242,234,217,0.85); border-radius: 50%; opacity: 0; transition: opacity 0.12s; }
.crosshair.aiming .ring { opacity: 1; }
.crosshair.hit .dot { animation: hitflash 0.15s; }
.crosshair.kill .dot { animation: killflash 0.28s; }
@keyframes hitflash { 0% { transform: scale(2.4); background: #ffd280; } 100% { transform: scale(1); } }
@keyframes killflash { 0% { transform: scale(3.4); background: #ff8c5a; } 100% { transform: scale(1); } }
.top-left { position: absolute; left: 16px; top: 14px; font-size: 13px; letter-spacing: 1px; }
.top-left .weapon { font-weight: bold; }
.top-left .score { margin-top: 4px; opacity: 0.85; }
.top-right { position: absolute; right: 16px; top: 14px; text-align: right; }
.top-right canvas { border-radius: 3px; }
.perf-text { font-size: 11px; margin-top: 3px; opacity: 0.85; }
.hint { position: absolute; left: 16px; bottom: 12px; font-size: 11px; opacity: 0.6; }
.help { position: absolute; left: 16px; bottom: 34px; font-size: 12px; line-height: 1.7; background: rgba(20,16,10,0.72); padding: 12px 16px; border-radius: 6px; }
.overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(24,19,11,0.55); backdrop-filter: blur(2px); }
.overlay .title { font-size: 44px; font-weight: bold; letter-spacing: 6px; color: #a8d47a; text-shadow: 0 2px 0 #3a5a28, 0 4px 12px rgba(0,0,0,0.5); }
.overlay .sub { margin-top: 6px; font-size: 14px; letter-spacing: 3px; opacity: 0.85; }
.overlay .deploy { margin-top: 42px; font-size: 18px; letter-spacing: 4px; animation: pulse 1.6s infinite; }
.overlay .controls { margin-top: 18px; font-size: 12px; opacity: 0.7; }
@keyframes pulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
`;
