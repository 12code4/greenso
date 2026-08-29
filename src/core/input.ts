// Pointer-lock keyboard/mouse input.
// In test mode (?test) pointer lock is skipped and window.__game hooks
// (installed by main.ts) can drive look/keys from a headless browser.

export class Input {
  private keys = new Set<string>();
  private edges = new Set<string>();
  private mouseDX = 0;
  private mouseDY = 0;
  firePressed = false; // edge, cleared each frame
  fireHeld = false;
  aimHeld = false;
  locked = false;
  readonly testMode: boolean;

  constructor(el: HTMLElement, testMode: boolean) {
    this.testMode = testMode;
    if (testMode) this.locked = true;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab') e.preventDefault();
      if (!e.repeat) this.edges.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.fireHeld = false;
      this.aimHeld = false;
    });

    el.addEventListener('mousedown', (e) => {
      if (!this.locked && !this.testMode) {
        el.requestPointerLock();
        return;
      }
      if (e.button === 0) {
        this.firePressed = true;
        this.fireHeld = true;
      } else if (e.button === 2) {
        this.aimHeld = true;
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.fireHeld = false;
      else if (e.button === 2) this.aimHeld = false;
    });
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('pointerlockchange', () => {
      this.locked = this.testMode || document.pointerLockElement === el;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.locked || this.testMode) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
  }

  held(code: string): boolean {
    return this.keys.has(code);
  }

  pressed(code: string): boolean {
    return this.edges.has(code);
  }

  /** Accumulated mouse delta since last call; cleared on read. */
  consumeMouse(): { dx: number; dy: number } {
    const d = { dx: this.mouseDX, dy: this.mouseDY };
    this.mouseDX = 0;
    this.mouseDY = 0;
    return d;
  }

  // Test hooks
  injectMouse(dx: number, dy: number): void {
    this.mouseDX += dx;
    this.mouseDY += dy;
  }
  injectKey(code: string, down: boolean): void {
    if (down) {
      if (!this.keys.has(code)) this.edges.add(code);
      this.keys.add(code);
    } else {
      this.keys.delete(code);
    }
  }
  injectFire(down: boolean): void {
    if (down) this.firePressed = true;
    this.fireHeld = down;
  }
  injectAim(down: boolean): void {
    this.aimHeld = down;
  }

  endFrame(): void {
    this.edges.clear();
    this.firePressed = false;
  }
}
