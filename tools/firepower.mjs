// Firepower smoke: flamer melts and bazooka blasts in the Jungle pocket.
// node tools/firepower.mjs
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
const gameWait = async (seconds) => {
  const t0 = await api('window.__game.time()');
  while ((await api('window.__game.time()')) - t0 < seconds) await page.waitForTimeout(150);
};
const tap = async (code) => { await api(`window.__game.key('${code}', true)`); await page.waitForTimeout(80); await api(`window.__game.key('${code}', false)`); };

await api("window.__game.give('flamer')");
await api('window.__game.teleport(0, 0, -4)');
await gameWait(2.0);
await tap('Digit4');
let s = await state();
console.log('flamer selected:', s.weapon, 'owned:', s.owned.join(','), 'enemies:', s.enemies);

// Walk toward nearest enemy while holding flame for bursts
for (let i = 0; i < 8; i++) {
  await api('window.__game.heal()');
  const aimed = await api('window.__game.aimAtTarget()');
  await api('window.__game.key("KeyW", true)');
  await api('window.__game.fire(true)');
  await gameWait(1.2);
  await api('window.__game.fire(false)');
  await api('window.__game.key("KeyW", false)');
  s = await state();
  console.log(`flame ${i}: aimed=${aimed} melts=${s.melts} kills=${s.kills} enemies=${s.enemies} hp=${s.hp}`);
  if (s.enemies === 0) break;
}
const melted = s.melts;

// Bazooka on the Gnome lane
await api("window.__game.give('bazooka')");
await api('window.__game.teleport(-20, 0, -4)');
await api('window.__game.heal()');
await gameWait(2.0);
await tap('Digit5');
s = await state();
console.log('bazooka selected:', s.weapon, 'enemies:', s.enemies);
const k0 = s.kills;
for (let i = 0; i < 6; i++) {
  await api('window.__game.heal()');
  const aimed = await api('window.__game.aimAtTarget()');
  await api('window.__game.fire(true)');
  await gameWait(0.3);
  await api('window.__game.fire(false)');
  await gameWait(1.6);
  s = await state();
  console.log(`rocket ${i}: aimed=${aimed} kills=${s.kills} enemies=${s.enemies} hp=${s.hp}`);
}
const ok = melted > 0 && s.kills > k0;
console.log(ok ? 'FIREPOWER OK' : 'FIREPOWER FAIL', JSON.stringify({ melted, rocketKills: s.kills - k0 }));
await browser.close();
process.exit(ok ? 0 : 1);
