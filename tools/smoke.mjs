// M0 smoke test: load the game in test mode, drive the player around,
// shoot targets, take screenshots, report state.
import { chromium } from 'playwright-core';

const SHOT_DIR = process.argv[2] ?? '/tmp/shots';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => console.log('[console]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

await page.goto('http://127.0.0.1:4173/?test', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const api = (expr) => page.evaluate(expr);
const state = () => api('window.__game.state()');

console.log('initial state:', JSON.stringify(await state()));
await page.screenshot({ path: `${SHOT_DIR}/01-spawn.png` });

// Spawn faces the range (-Z). Headless swiftshader runs ~5x slow with the
// dt clamp, so wall-clock waits are generous.

// Sprint forward toward the range
await api('window.__game.key("KeyW", true)');
await api('window.__game.key("ShiftLeft", true)');
await page.waitForTimeout(4000);
await api('window.__game.key("ShiftLeft", false)');
await api('window.__game.key("KeyW", false)');
console.log('after sprint:', JSON.stringify(await state()));
await page.screenshot({ path: `${SHOT_DIR}/02-midfield.png` });

// Jump test
await api('window.__game.key("Space", true)');
await page.waitForTimeout(120);
await api('window.__game.key("Space", false)');
await page.waitForTimeout(250);
const mid = await state();
console.log('mid-jump y:', mid.pos[1], 'grounded:', mid.grounded);
await page.waitForTimeout(600);

// Aim straight at an up target and fire in bursts (re-aim between bursts
// to counter recoil drift and target respawns)
await api('window.__game.aim(true)');
for (let burst = 0; burst < 6; burst++) {
  const aimed = await api('window.__game.aimAtTarget()');
  if (burst === 0) {
    console.log('aimed at target:', aimed);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOT_DIR}/03-aiming.png` });
  }
  await api('window.__game.fire(true)');
  await page.waitForTimeout(1200);
  await api('window.__game.fire(false)');
  await page.waitForTimeout(200);
}
await api('window.__game.aim(false)');
console.log('after firing:', JSON.stringify(await state()));
await page.screenshot({ path: `${SHOT_DIR}/04-firing.png` });

// Turn left toward the shoebox perch and walk
await api('window.__game.look(500, -40)');
await page.waitForTimeout(200);
await api('window.__game.key("KeyW", true)');
await page.waitForTimeout(1800);
await api('window.__game.key("KeyW", false)');
await page.screenshot({ path: `${SHOT_DIR}/05-left-flank.png` });
console.log('left flank:', JSON.stringify(await state()));

// Perf sample
const perf = await page.evaluate(() => new Promise((res) => {
  let frames = 0;
  const t0 = performance.now();
  const tick = () => {
    frames++;
    if (performance.now() - t0 > 2000) res((frames / (performance.now() - t0)) * 1000);
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}));
console.log('fps (headless swiftshader):', perf.toFixed(1));

await browser.close();
console.log('SMOKE OK');
