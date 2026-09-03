// HEROES & CONTENT gate (Update 4): Sprout joins, battery sabotage, bottle-rocket
// launch, Tan Flamer burn + dive extinguish, convoy reinforcement wave.
// node tools/heroes.mjs
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto('http://127.0.0.1:4173/?test&turbo&map=backyard', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const api = (expr) => page.evaluate(expr);
const state = () => api('window.__game.state()');
const time = () => api('window.__game.time()');
const gameWait = async (seconds) => {
  const t0 = await time();
  while ((await time()) - t0 < seconds) await page.waitForTimeout(120);
};
const key = async (code, down) => api(`window.__game.key('${code}', ${down})`);
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${detail ?? ''}`); if (!ok) fails.push(name); };

// 1. Sprout joins after clear_gnome
await api('window.__game.teleport(-19, 0, 2)');
await gameWait(1.5);
await api('window.__game.clearEncounter("E_gnome")');
await gameWait(3.5);
let s = await state();
check('Sprout joined after the Gnome clearing', s.squad === true, `squad=${s.squad} objective=${s.objective}`);

// 2. Battery sabotage (secondary objective)
await api('window.__game.teleport(25.5, 0, -8.6)');
await gameWait(0.5);
await key('KeyE', true); await gameWait(1.9); await key('KeyE', false);
s = await state();
check('battery crate sabotaged', s.batteries >= 1, `batteries=${s.batteries}`);

// 3. Bottle-rocket launch to the birdbath rim
await api('window.__game.heal()');
await api('window.__game.teleport(-14, 0, -23.2)');
await gameWait(0.5);
await key('KeyE', true); await gameWait(1.3); await key('KeyE', false);
let peakY = 0;
const t0 = await time();
while ((await time()) - t0 < 3.2) { s = await state(); peakY = Math.max(peakY, s.pos[1]); await page.waitForTimeout(80); }
s = await state();
const onRim = s.pos[1] > 9 && Math.abs(s.pos[0] + 24) < 3 && Math.abs(s.pos[2] + 32.4) < 3;
check('bottle rocket flew high', peakY > 12, `peakY=${peakY.toFixed(1)}`);
check('landed on the birdbath rim', onRim, `pos=${s.pos.map((v) => v.toFixed(1))} region=${s.region}`);

// 4. Tan Flamer: stand in front of him on the flowerbed, get burned, dive to extinguish
await api('window.__game.heal()');
await api('window.__game.activate("E_bed")');
await api('window.__game.teleport(-2, 3.0, -31.5)');
await api('window.__game.setYaw(Math.PI)'); // face north (−z) toward the flamer at z −35.5
let burned = false;
const t1 = await time();
while ((await time()) - t1 < 7) { s = await state(); if (s.burning > 0) { burned = true; break; } await page.waitForTimeout(100); }
check('flamer set Moss burning', burned, `burning=${s.burning} hp=${s.hp} enemies=${s.enemies}`);
if (burned) {
  await api('window.__game.setYaw(0)'); // run south, away
  await key('ShiftLeft', true); await key('KeyW', true);
  await gameWait(0.45);
  await key('KeyC', true); await gameWait(0.15); await key('KeyC', false);
  await gameWait(0.5);
  await key('ShiftLeft', false); await key('KeyW', false);
  s = await state();
  check('dive rolled the fire out', s.burning === 0, `burning=${s.burning}`);
}

// 5. Convoy reinforcement wave 16 s after the raid starts
await api('window.__game.heal()');
await api('window.__game.teleport(0, 0, 34)'); // far away, out of everyone's sight
await api('window.__game.activate("E_convoy")');
await gameWait(1);
await api('window.__game.clearEncounter("E_convoy")');
await gameWait(1);
const before = (await state()).enemies;
await gameWait(17);
s = await state();
check('reinforcement wave arrived', s.enemies >= before + 3, `before=${before} after=${s.enemies}`);

console.log(fails.length ? `HEROES GATE FAILED: ${fails.join(', ')}` : 'HEROES GATE PASSED');
await browser.close();
process.exit(fails.length ? 1 : 0);
