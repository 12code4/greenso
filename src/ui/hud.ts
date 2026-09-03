// DOM overlay HUD: crosshair, melt meter, weapon/ammo, objective line, radio
// (Lt. Olive), interact prompt, marbles, damage vignette, briefing + tally
// overlays, frame-time graph, help panel, toasts.

export interface TallyData {
  title: string;
  timeSeconds: number;
  parSeconds: number;
  marbles: number;
  marblesTotal: number;
  powsFreed: number;
  accuracy: number;
  deaths: number;
  batteries?: number;
  batteriesTotal?: number;
}

export class Hud {
  private crosshair: HTMLDivElement;
  private lock: HTMLDivElement;
  private weaponEl: HTMLDivElement;
  private meltFill: HTMLDivElement;
  private meltWrap: HTMLDivElement;
  private marblesEl: HTMLDivElement;
  private statsEl: HTMLDivElement;
  private objectiveEl: HTMLDivElement;
  private compassEl: HTMLDivElement;
  private compassPin: HTMLDivElement;
  private compassDist: HTMLDivElement;
  private radioEl: HTMLDivElement;
  private radioName: HTMLDivElement;
  private radioText: HTMLDivElement;
  private promptEl: HTMLDivElement;
  private promptText: HTMLDivElement;
  private promptFill: HTMLDivElement;
  private vignette: HTMLDivElement;
  private overlay: HTMLDivElement;
  private overlayBody: HTMLDivElement;
  private tally: HTMLDivElement;
  private toastEl: HTMLDivElement;
  private cardEl: HTMLDivElement;
  private cardTimer = 0;
  private perfCanvas: HTMLCanvasElement;
  private perfText: HTMLDivElement;
  private help: HTMLDivElement;
  private frameTimes: number[] = [];
  private perfAccum = 0;
  private radioTimer = 0;
  private radioFull = '';
  private radioShown = 0;
  private radioQueue: { speaker: string; text: string; seconds: number; tone: 'green' | 'tan' }[] = [];
  private toastTimer = 0;
  private critical = false;

  constructor(parent: HTMLElement) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = el('div', 'hud', parent);

    this.vignette = el('div', 'vignette', root);

    this.crosshair = el('div', 'crosshair', root);
    this.crosshair.innerHTML = '<div class="dot"></div><div class="ring"></div>';
    this.lock = el('div', 'lock', root);
    this.lock.innerHTML = '<i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i>';
    this.lock.style.display = 'none';

    const topLeft = el('div', 'top-left', root);
    this.weaponEl = el('div', 'weapon', topLeft);
    this.meltWrap = el('div', 'melt', topLeft);
    this.meltWrap.innerHTML = '<span class="lbl">MELT</span><div class="bar"><div class="fill"></div></div>';
    this.meltFill = this.meltWrap.querySelector('.fill') as HTMLDivElement;
    this.marblesEl = el('div', 'marbles', topLeft);
    this.statsEl = el('div', 'stats', topLeft);

    this.objectiveEl = el('div', 'objective', root);
    this.compassEl = el('div', 'compass', root);
    const strip = el('div', 'strip', this.compassEl);
    this.compassPin = el('div', 'pin', strip);
    this.compassDist = el('div', 'dist', this.compassEl);
    this.compassEl.style.display = 'none';

    this.radioEl = el('div', 'radio', root);
    this.radioName = el('div', 'radio-name', this.radioEl);
    this.radioText = el('div', 'radio-text', this.radioEl);
    this.radioEl.style.display = 'none';

    this.promptEl = el('div', 'prompt', root);
    this.promptText = el('div', 'prompt-text', this.promptEl);
    const pbar = el('div', 'prompt-bar', this.promptEl);
    this.promptFill = el('div', 'prompt-fill', pbar);
    this.promptEl.style.display = 'none';

    const topRight = el('div', 'top-right', root);
    this.perfCanvas = document.createElement('canvas');
    this.perfCanvas.width = 150;
    this.perfCanvas.height = 40;
    topRight.appendChild(this.perfCanvas);
    this.perfText = el('div', 'perf-text', topRight);

    el('div', 'hint', root).textContent = 'H — controls';
    this.help = el('div', 'help', root);
    this.help.innerHTML =
      '<b>PLASTIC PLATOON</b><br><br>' +
      'WASD move · Shift sprint · Space jump<br>' +
      'Mouse look · LMB fire · RMB aim<br>' +
      'C crouch · C while sprinting: dive<br>' +
      'G grenade (hold to cook) · E interact<br>' +
      '1 rifle · 2 cap · 3 sniper · 4 flamethrower · 5 bazooka · Q cycle<br>' +
      '[ ] look sensitivity · I invert Y · M mute<br>' +
      'F8 free-cam · P log position · F9 regions<br>' +
      'H toggle this · Esc release mouse';
    this.help.style.display = 'none';

    this.toastEl = el('div', 'toast', root);
    this.toastEl.style.display = 'none';
    this.cardEl = el('div', 'card', root);
    this.cardEl.style.display = 'none';

    this.overlay = el('div', 'overlay', root);
    this.overlayBody = el('div', 'overlay-body', this.overlay);
    this.setBriefing('PLASTIC PLATOON', '', []);

    this.tally = el('div', 'tally', root);
    this.tally.style.display = 'none';
  }

  // ------------------------------------------------------------ overlays

  setOverlay(visible: boolean): void {
    this.overlay.style.display = visible ? 'flex' : 'none';
  }

  setBriefing(title: string, subtitle: string, lines: string[], missions: { href: string; title: string; sub: string; current: boolean }[] = []): void {
    this.overlayBody.innerHTML =
      `<div class="title">${title}</div>` +
      (subtitle ? `<div class="sub">${subtitle}</div>` : '') +
      (lines.length ? `<div class="brief">${lines.map((l) => `<div>${l}</div>`).join('')}</div>` : '') +
      '<div class="deploy">CLICK TO DEPLOY</div>' +
      '<div class="controls">WASD + mouse · Shift sprint · Space jump · RMB aim · LMB fire · G grenade · E interact · H all controls</div>' +
      (missions.length > 1
        ? `<div class="missions">${missions.map((m) => `<a class="mission${m.current ? ' current' : ''}" href="${m.href}"><b>${m.title}</b><span>${m.sub}</span></a>`).join('')}</div>`
        : '');
  }

  showTally(d: TallyData): void {
    const medal = d.timeSeconds <= d.parSeconds * 1.15 ? 'GOLD' : d.timeSeconds <= d.parSeconds * 1.5 ? 'SILVER' : d.timeSeconds <= d.parSeconds * 2.2 ? 'BRONZE' : 'MESS KIT';
    this.tally.innerHTML =
      `<div class="title">MISSION COMPLETE</div><div class="sub">${d.title}</div>` +
      `<div class="medal ${medal.toLowerCase().replace(' ', '')}">${medal}</div>` +
      '<table>' +
      `<tr><td>Time</td><td>${fmt(d.timeSeconds)} <span class="dim">(par ${fmt(d.parSeconds)})</span></td></tr>` +
      `<tr><td>Lost Marbles</td><td>${d.marbles} / ${d.marblesTotal}</td></tr>` +
      `<tr><td>POWs freed</td><td>${d.powsFreed}</td></tr>` +
      `<tr><td>Accuracy</td><td>${Math.round(d.accuracy * 100)}%</td></tr>` +
      `<tr><td>Replacements requisitioned</td><td>${d.deaths}</td></tr>` +
      (d.batteriesTotal ? `<tr><td>Batteries sabotaged</td><td>${d.batteries ?? 0} / ${d.batteriesTotal}</td></tr>` : '') +
      '</table>' +
      '<div class="again">R — back to the toy bin</div>';
    this.tally.style.display = 'flex';
  }

  hideTally(): void {
    this.tally.style.display = 'none';
  }

  toggleHelp(): void {
    this.help.style.display = this.help.style.display === 'none' ? 'block' : 'none';
  }

  toast(text: string, seconds = 2.5): void {
    this.toastEl.textContent = text;
    this.toastEl.style.display = 'block';
    this.toastTimer = seconds;
  }

  // ------------------------------------------------------------ live elements

  /** Bracket around the magnetized target (screen px), or hide. */
  setLock(x: number | null, y: number | null): void {
    if (x === null || y === null) { this.lock.style.display = 'none'; return; }
    this.lock.style.display = 'block';
    this.lock.style.left = `${x}px`;
    this.lock.style.top = `${y}px`;
  }

  setAiming(aiming: boolean): void {
    this.crosshair.classList.toggle('aiming', aiming);
  }

  setWeapon(name: string, ammo: string): void {
    this.weaponEl.textContent = `${name} · ${ammo}`;
  }

  setMelt(frac: number): void {
    const f = Math.max(0, Math.min(1, frac));
    this.meltFill.style.width = `${f * 100}%`;
    this.meltFill.style.background = f > 0.6 ? '#8bc46a' : f > 0.25 ? '#e0b04a' : '#e06a4a';
    this.critical = f <= 0.25;
    this.vignette.classList.toggle('critical', this.critical);
  }

  setMarbles(found: number, total: number): void {
    this.marblesEl.textContent = total > 0 ? `LOST MARBLES ${found} / ${total}` : '';
  }

  setStats(text: string): void {
    this.statsEl.textContent = text;
  }

  /** Compass strip under the objective: `rel` is the waypoint bearing relative to the camera (+ = left). */
  setCompass(rel: number | null, dist: number): void {
    if (rel === null) { this.compassEl.style.display = 'none'; return; }
    this.compassEl.style.display = 'block';
    const x = Math.max(-1, Math.min(1, -rel / (Math.PI / 2)));
    this.compassPin.style.left = `${(x * 0.5 + 0.5) * 100}%`;
    const behind = Math.abs(rel) > Math.PI / 2;
    this.compassPin.classList.toggle('behind', behind);
    const inches = Math.round(dist * 2.13);
    this.compassDist.textContent = behind ? `BEHIND YOU · ${inches} IN` : `${inches} IN`;
  }

  setObjective(text: string): void {
    this.objectiveEl.textContent = text ? `▸ ${text}` : '';
  }

  radio(speaker: string, text: string, seconds = 6, tone: 'green' | 'tan' = 'green'): void {
    if (this.radioTimer > 0) {
      if (this.radioQueue.length < 3) this.radioQueue.push({ speaker, text, seconds, tone });
      return;
    }
    this.radioName.textContent = speaker;
    this.radioFull = text;
    this.radioShown = 0;
    this.radioTimer = seconds + text.length * 0.02;
    this.radioEl.classList.toggle('tan', tone === 'tan');
    this.radioEl.style.display = 'block';
  }

  /** The toy-bin card: a full-screen stencil label for floor transitions. seconds ≤ 0 keeps it up. */
  showCard(title: string, sub: string, seconds = 2.5): void {
    this.cardEl.innerHTML = `<div class="card-title">${title}</div><div class="card-sub">${sub}</div>`;
    this.cardEl.style.display = 'flex';
    this.cardTimer = seconds > 0 ? seconds : 1e9;
  }

  setBurning(on: boolean): void {
    this.vignette.classList.toggle('burning', on);
  }

  setPrompt(text: string | null, progress = 0): void {
    if (!text) {
      this.promptEl.style.display = 'none';
      return;
    }
    this.promptEl.style.display = 'block';
    this.promptText.textContent = text;
    this.promptFill.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
  }

  hitMarker(killed: boolean): void {
    this.crosshair.classList.remove('hit', 'kill');
    void this.crosshair.offsetWidth;
    this.crosshair.classList.add(killed ? 'kill' : 'hit');
  }

  damageFlash(): void {
    this.vignette.classList.remove('flash');
    void this.vignette.offsetWidth;
    this.vignette.classList.add('flash');
  }

  update(dt: number): void {
    if (this.radioTimer > 0) {
      this.radioTimer -= dt;
      this.radioShown = Math.min(this.radioFull.length, this.radioShown + dt * 55);
      this.radioText.textContent = this.radioFull.slice(0, Math.floor(this.radioShown));
      if (this.radioTimer <= 0) {
        this.radioEl.style.display = 'none';
        const next = this.radioQueue.shift();
        if (next) this.radio(next.speaker, next.text, next.seconds, next.tone);
      }
    }
    if (this.cardTimer > 0) { this.cardTimer -= dt; if (this.cardTimer <= 0) this.cardEl.style.display = 'none'; }
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl.style.display = 'none';
    }
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
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.fillRect(0, 40 - (16.7 / 33.3) * 38, 150, 1);
    }
  }
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function el(tag: string, cls: string, parent: HTMLElement): HTMLDivElement {
  const e = document.createElement(tag) as HTMLDivElement;
  e.className = cls;
  parent.appendChild(e);
  return e;
}

const CSS = `
.hud { position: fixed; inset: 0; pointer-events: none; font-family: 'Courier New', monospace; color: #f2ead9; text-shadow: 0 1px 2px rgba(0,0,0,0.6); user-select: none; --olive: #4a5a2e; --olive-dk: #38452a; --cream: #efe4c6; --stencil: Impact, 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif; }
.stencil { font-family: var(--stencil); text-transform: uppercase; letter-spacing: 3px; font-weight: 900; text-shadow: none; }
.crate { background: var(--olive); color: var(--cream); border: 2px dashed rgba(239,228,198,0.55); outline: 3px solid var(--olive); box-shadow: 0 3px 0 var(--olive-dk), 0 6px 14px rgba(0,0,0,0.35); border-radius: 2px; }
.vignette { position: absolute; inset: 0; box-shadow: inset 0 0 120px rgba(220,60,30,0); transition: box-shadow 0.25s; }
.vignette.flash { animation: dmg 0.45s; }
.vignette.critical { animation: crit 1.6s infinite; }
.vignette.burning { animation: burn 0.5s infinite; }
@keyframes burn { 0%,100% { box-shadow: inset 0 0 140px rgba(255,120,20,0.45); } 50% { box-shadow: inset 0 0 200px rgba(255,170,40,0.7); } }
@keyframes dmg { 0% { box-shadow: inset 0 0 160px rgba(230,70,30,0.75); } 100% { box-shadow: inset 0 0 120px rgba(220,60,30,0); } }
@keyframes crit { 0%,100% { box-shadow: inset 0 0 110px rgba(230,80,30,0.25); } 50% { box-shadow: inset 0 0 150px rgba(230,80,30,0.55); } }
.crosshair { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
.crosshair .dot { position: absolute; left: -2px; top: -2px; width: 4px; height: 4px; border-radius: 50%; background: #f2ead9; box-shadow: 0 0 3px rgba(0,0,0,0.8); }
.crosshair .ring { position: absolute; left: -11px; top: -11px; width: 20px; height: 20px; border: 1.5px solid rgba(242,234,217,0.85); border-radius: 50%; opacity: 0; transition: opacity 0.12s; }
.crosshair.aiming .ring { opacity: 1; }
.lock { position: absolute; width: 34px; height: 44px; transform: translate(-50%, -50%); pointer-events: none; }
.lock i { position: absolute; width: 9px; height: 9px; border: 2px solid rgba(255, 210, 120, 0.95); box-shadow: 0 0 3px rgba(0,0,0,0.7); }
.lock .tl { left: 0; top: 0; border-right: none; border-bottom: none; } .lock .tr { right: 0; top: 0; border-left: none; border-bottom: none; }
.lock .bl { left: 0; bottom: 0; border-right: none; border-top: none; } .lock .br { right: 0; bottom: 0; border-left: none; border-top: none; }
.crosshair.hit .dot { animation: hitflash 0.15s; }
.crosshair.kill .dot { animation: killflash 0.28s; }
@keyframes hitflash { 0% { transform: scale(2.4); background: #ffd280; } 100% { transform: scale(1); } }
@keyframes killflash { 0% { transform: scale(3.4); background: #ff8c5a; } 100% { transform: scale(1); } }
.top-left { position: absolute; left: 16px; top: 14px; font-size: 13px; letter-spacing: 1px; }
.top-left .weapon { font-family: var(--stencil); text-transform: uppercase; letter-spacing: 3px; font-size: 15px; text-shadow: none; background: var(--olive); color: var(--cream); padding: 4px 10px 3px; border: 2px dashed rgba(239,228,198,0.5); outline: 3px solid var(--olive); display: inline-block; transform: rotate(-1.2deg); box-shadow: 0 3px 0 var(--olive-dk); }
.melt { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.melt .lbl { font-size: 11px; opacity: 0.8; }
.melt { margin-top: 10px; }
.melt .lbl { font-family: var(--stencil); text-transform: uppercase; letter-spacing: 2px; font-size: 11px; opacity: 0.9; }
.melt .bar { position: relative; width: 170px; height: 12px; background: rgba(20,16,10,0.6); border: 2px solid var(--olive); outline: 1px solid rgba(239,228,198,0.35); border-radius: 2px; overflow: hidden; }
.melt .bar::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0 15px, rgba(20,16,10,0.55) 15px 17px); pointer-events: none; }
.melt .fill { height: 100%; width: 100%; background: #8bc46a; transition: width 0.15s, background 0.3s; }
.marbles, .stats { margin-top: 5px; opacity: 0.85; font-size: 12px; }
.objective { position: absolute; top: 14px; left: 50%; transform: translateX(-50%) rotate(0.6deg); font-family: var(--stencil); text-transform: uppercase; font-size: 14px; letter-spacing: 3px; text-shadow: none; background: var(--olive); color: var(--cream); padding: 7px 18px 6px; border: 2px dashed rgba(239,228,198,0.5); outline: 3px solid var(--olive); border-radius: 2px; box-shadow: 0 3px 0 var(--olive-dk), 0 6px 14px rgba(0,0,0,0.35); }
.compass { position: absolute; top: 54px; left: 50%; transform: translateX(-50%); width: 280px; text-align: center; }
.compass .strip { position: relative; height: 12px; background: rgba(20,16,10,0.55) repeating-linear-gradient(90deg, transparent 0 34px, rgba(239,228,198,0.35) 34px 35px); border: 1px solid rgba(239,228,198,0.35); border-radius: 2px; overflow: visible; }
.compass .strip::before { content: ''; position: absolute; left: 50%; top: -2px; width: 1px; height: 16px; background: rgba(239,228,198,0.7); }
.compass .pin { position: absolute; top: -5px; width: 12px; height: 12px; margin-left: -6px; background: #a8d47a; border: 2px solid #3a5a28; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 0 4px rgba(0,0,0,0.6); transition: left 0.08s linear; }
.compass .pin.behind { background: #e0b04a; }
.compass .dist { font-family: var(--stencil); text-transform: uppercase; letter-spacing: 2px; font-size: 12px; margin-top: 4px; opacity: 0.9; }
.radio { position: absolute; bottom: 64px; left: 50%; transform: translateX(-50%); width: min(640px, 80vw); background: rgba(20,16,10,0.78); border-left: 5px solid var(--olive); outline: 1px solid rgba(239,228,198,0.25); padding: 10px 14px; border-radius: 2px; font-size: 14px; line-height: 1.45; }
.radio.tan { border-left-color: #c9a86a; }
.radio.tan .radio-name { color: #e8cf98; }
.radio-name { font-family: var(--stencil); text-transform: uppercase; font-size: 12px; letter-spacing: 3px; color: #b8d48a; margin-bottom: 3px; text-shadow: none; }
.prompt { position: absolute; bottom: 150px; left: 50%; transform: translateX(-50%); text-align: center; font-family: var(--stencil); text-transform: uppercase; font-size: 15px; letter-spacing: 3px; }
.prompt-bar { width: 180px; height: 6px; margin: 6px auto 0; background: rgba(0,0,0,0.5); border: 1px solid rgba(242,234,217,0.5); border-radius: 3px; overflow: hidden; }
.prompt-fill { height: 100%; width: 0; background: #a8d47a; }
.top-right { position: absolute; right: 16px; top: 14px; text-align: right; }
.top-right canvas { border-radius: 3px; }
.perf-text { font-size: 11px; margin-top: 3px; opacity: 0.85; }
.hint { position: absolute; left: 16px; bottom: 12px; font-size: 11px; opacity: 0.6; }
.help { position: absolute; left: 16px; bottom: 34px; font-size: 12px; line-height: 1.7; background: rgba(20,16,10,0.72); padding: 12px 16px; border-radius: 6px; }
.toast { position: absolute; right: 16px; bottom: 16px; font-family: var(--stencil); text-transform: uppercase; letter-spacing: 2px; font-size: 13px; text-shadow: none; background: var(--olive); color: var(--cream); padding: 8px 14px; border: 2px dashed rgba(239,228,198,0.5); outline: 3px solid var(--olive); border-radius: 2px; transform: rotate(-0.8deg); box-shadow: 0 3px 0 var(--olive-dk); }
.card { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--olive); color: var(--cream); z-index: 5; }
.card-title { font-family: var(--stencil); text-transform: uppercase; font-size: 54px; letter-spacing: 10px; border: 3px dashed rgba(239,228,198,0.55); padding: 14px 34px; transform: rotate(-1.5deg); }
.card-sub { margin-top: 18px; font-family: var(--stencil); text-transform: uppercase; font-size: 16px; letter-spacing: 4px; opacity: 0.85; }
.overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(24,19,11,0.6); backdrop-filter: blur(2px); }
.overlay-body { display: flex; flex-direction: column; align-items: center; max-width: 720px; text-align: center; }
.overlay .title { font-family: var(--stencil); font-size: 58px; letter-spacing: 8px; color: #a8d47a; text-shadow: 0 3px 0 #3a5a28, 0 6px 16px rgba(0,0,0,0.5); transform: rotate(-1.5deg); }
.overlay .sub { margin-top: 8px; font-family: var(--stencil); font-size: 16px; letter-spacing: 5px; background: var(--olive); color: var(--cream); padding: 5px 16px 4px; border: 2px dashed rgba(239,228,198,0.5); outline: 3px solid var(--olive); border-radius: 2px; }
.overlay .brief { margin-top: 26px; font-size: 14px; line-height: 1.8; text-align: left; background: rgba(20,16,10,0.55); padding: 14px 20px; border-left: 3px solid #a8d47a; border-radius: 4px; }
.overlay .deploy { margin-top: 34px; font-size: 18px; letter-spacing: 4px; animation: pulse 1.6s infinite; }
.overlay .controls { margin-top: 16px; font-size: 12px; opacity: 0.7; }
.overlay .missions { margin-top: 26px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; pointer-events: auto; }
.overlay .mission { display: flex; flex-direction: column; gap: 4px; min-width: 180px; padding: 10px 16px 9px; text-decoration: none; color: var(--cream); background: var(--olive); border: 2px dashed rgba(239,228,198,0.5); outline: 3px solid var(--olive); border-radius: 2px; box-shadow: 0 3px 0 var(--olive-dk); transform: rotate(-0.6deg); transition: transform 0.1s; }
.overlay .mission:nth-child(even) { transform: rotate(0.8deg); }
.overlay .mission:hover { transform: rotate(0deg) scale(1.04); }
.overlay .mission b { font-family: var(--stencil); text-transform: uppercase; letter-spacing: 3px; font-size: 15px; text-shadow: none; }
.overlay .mission span { font-size: 11px; opacity: 0.85; }
.overlay .mission.current { outline-color: #a8d47a; border-color: rgba(168,212,122,0.8); }
@keyframes pulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
.tally { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(24,19,11,0.7); backdrop-filter: blur(3px); }
.tally .title { font-family: var(--stencil); font-size: 44px; letter-spacing: 8px; color: #a8d47a; text-shadow: 0 3px 0 #3a5a28; }
.tally .sub { margin-top: 4px; font-size: 14px; letter-spacing: 3px; opacity: 0.85; }
.tally .medal { margin: 22px 0; font-size: 28px; letter-spacing: 6px; padding: 8px 26px; border: 2px solid; border-radius: 6px; }
.tally .medal.gold { color: #ffd257; border-color: #ffd257; } .tally .medal.silver { color: #d9dde6; border-color: #d9dde6; } .tally .medal.bronze { color: #d9915a; border-color: #d9915a; } .tally .medal.messkit { color: #a9a9a9; border-color: #a9a9a9; }
.tally table { font-size: 15px; border-spacing: 26px 8px; }
.tally td:first-child { opacity: 0.75; text-align: right; }
.tally .dim { opacity: 0.6; }
.tally .again { margin-top: 26px; font-size: 13px; letter-spacing: 3px; opacity: 0.8; animation: pulse 1.6s infinite; }
`;
