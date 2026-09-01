// Mission gate: drive the Backyard's objective chain end to end with
// teleports + fights, in GAME time. node tools/mission.mjs <shot-dir>
import { chromium } from 'playwright-core';

const SHOT_DIR = process.argv[2] ?? '/tmp/shots';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto('http://127.0.0.1:4173/?test&map=backyard', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const api = (expr) => page.evaluate(expr);
const state = () => api('window.__game.state()');
const gameWait = async (seconds) => {
  const t0 = await api('window.__game.time()');
  while ((await api('window.__game.time()')) - t0 < seconds) await page.waitForTimeout(120);
};
const log = async (label) => {
  const s = await state();
  console.log(`${label}: objective=${s.objective} region=${s.region} pos=[${s.pos.map((v) => v.toFixed(1)).join(',')}] enemies=${s.enemies} kills=${s.kills} hp=${s.hp.toFixed(0)} deaths=${s.deaths} marbles=${s.marbles} planes=${s.planes} complete=${s.complete}`);
  return s;
};
// Fight until no enemies remain or time runs out
const fight = async (maxSeconds) => {
  const t0 = await api('window.__game.time()');
  while ((await api('window.__game.time()')) - t0 < maxSeconds) {
    const aimed = await api('window.__game.aimAtTarget()');
    if (!aimed) { await gameWait(0.5); const s = await state(); if (s.enemies === 0) break; continue; }
    await api('window.__game.aim(true)');
    await api('window.__game.fire(true)');
    await gameWait(0.9);
    await api('window.__game.fire(false)');
    const s = await state();
    if (s.enemies === 0) break;
  }
  await api('window.__game.aim(false)');
};

await log('deploy');

// 1. reach_gnome → E_gnome activates on region-enter
await api('window.__game.teleport(-19, 0, 2)');
await gameWait(1.5);
await log('at gnome');

// 2. clear_gnome — fight for real, then force-clear stragglers (combat has its own gate)
await fight(25);
await api('window.__game.clearEncounter("E_gnome")');
await api('window.__game.clearEncounter("E_jungle")');
await gameWait(3);
await log('gnome cleared?');

// 3. find_convoy
await api('window.__game.teleport(20, 0, 6)');
await gameWait(3.5);
await log('at convoy');

// 4. rescue_fern: onto the birdbath rim next to Fern, hold E
await api('window.__game.teleport(-24, 9.8, -33.2)');
await gameWait(1);
await api('window.__game.key("KeyE", true)');
await gameWait(2.2);
await api('window.__game.key("KeyE", false)');
await gameWait(3);
await page.screenshot({ path: `${SHOT_DIR}/l4-fern.png` });
await log('fern');

// 5. raid_convoy: E_convoy + gliders active now; go fight from the road
await api('window.__game.teleport(21, 0, 4)');
await gameWait(1.5);
await log('convoy raid start');
await page.screenshot({ path: `${SHOT_DIR}/l4-convoy.png` });
await fight(30);
await api('window.__game.clearEncounter("E_convoy")');
await gameWait(3);
await log('convoy cleared?');

// 6. escape_leaf: the leaf waits at the tear, armed; it departs when boarded
await api('window.__game.heal()');
await api('window.__game.teleport(15, 0.3, -17)');
await gameWait(1);
await log('on leaf');
await page.screenshot({ path: `${SHOT_DIR}/l4-leaf.png` });
// Ride: the leaf takes ~26 s at 4.2 u/s
for (let i = 0; i < 8; i++) {
  await gameWait(4);
  const s = await log(`ride ${i}`);
  if (s.complete) break;
}
await gameWait(1);
await page.screenshot({ path: `${SHOT_DIR}/l4-tally.png` });
const s = await log('end');
console.log(s.complete ? 'MISSION GATE PASSED' : 'MISSION GATE FAILED');
await browser.close();
