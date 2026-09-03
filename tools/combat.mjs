// Combat smoke: teleport into the Jungle ambush, fight, then visit the Gnome
// lane and throw a grenade. Waits are in GAME seconds (headless renders
// ~5x slow with the dt clamp). node tools/combat.mjs <shot-dir>
import { chromium } from 'playwright-core';

const SHOT_DIR = process.argv[2] ?? '/tmp/shots';
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
const gameWait = async (seconds) => {
  const t0 = await api('window.__game.time()');
  while ((await api('window.__game.time()')) - t0 < seconds) await page.waitForTimeout(150);
};

// Into the Jungle: the ambush should rise
await api('window.__game.teleport(0, 0, -4)');
await gameWait(2.5);
let s = await state();
console.log('jungle:', JSON.stringify({ region: s.region, enemies: s.enemies, combat: s.combat, hp: s.hp }));

// Stand and fight for ~12 game seconds, re-aiming each burst
for (let burst = 0; burst < 10; burst++) {
  const aimed = await api('window.__game.aimAtTarget()');
  await api('window.__game.aim(true)');
  await api('window.__game.fire(true)');
  await gameWait(1.2);
  await api('window.__game.fire(false)');
  if (burst === 2) await page.screenshot({ path: `${SHOT_DIR}/l3-jungle-fight.png` });
  s = await state();
  console.log(`burst ${burst}: aimed=${aimed} kills=${s.kills} enemies=${s.enemies} hp=${s.hp.toFixed(0)} alive=${s.alive} deaths=${s.deaths} shots=${s.shots} hits=${s.hits}`);
  if (s.enemies === 0) break;
}
await api('window.__game.aim(false)');

// Gnome clearing: based riflemen on lanes + flanking troopers. Stand still and get shot at.
await api('window.__game.teleport(-19, 0, 2)');
await gameWait(1);
await api('window.__game.aimAtTarget()');
await gameWait(6);
await page.screenshot({ path: `${SHOT_DIR}/l3-gnome.png` });
s = await state();
console.log('gnome after 6s under fire:', JSON.stringify({ region: s.region, enemies: s.enemies, combat: s.combat, hp: s.hp.toFixed(0), deaths: s.deaths }));

// Grenade: cook 0.7 s and throw toward the lane, wait out the fuse
await api('window.__game.aimAtTarget()');
await api('window.__game.key("KeyG", true)');
await gameWait(0.7);
await api('window.__game.key("KeyG", false)');
await gameWait(3.5);
s = await state();
console.log('after grenade:', JSON.stringify({ kills: s.kills, enemies: s.enemies, hp: s.hp.toFixed(0) }));
await page.screenshot({ path: `${SHOT_DIR}/l3-gnome-after.png` });

await browser.close();
console.log('COMBAT SMOKE DONE');
