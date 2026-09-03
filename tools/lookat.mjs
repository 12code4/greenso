// Model check: screenshots of Tans at the Gnome and of Moss holding each weapon.
// node tools/lookat.mjs <shot-dir>
import { chromium } from 'playwright-core';
const SHOT_DIR = process.argv[2] ?? '/tmp/shots';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://127.0.0.1:4173/?test&map=backyard', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const api = (expr) => page.evaluate(expr);
const gameWait = async (seconds) => {
  const t0 = await api('window.__game.time()');
  while ((await api('window.__game.time()')) - t0 < seconds) await page.waitForTimeout(150);
};
const tap = async (code) => { await api(`window.__game.key('${code}', true)`); await gameWait(0.15); await api(`window.__game.key('${code}', false)`); await gameWait(0.15); };
// Tans: stand 6u in front of the gnome lane and look at them
await api('window.__game.teleport(-21, 0, -6)');
await gameWait(2.5);
await api('window.__game.aimAtTarget()');
await api('window.__game.aim(true)');
await gameWait(0.5);
await page.screenshot({ path: `${SHOT_DIR}/m-tans.png` });
await api('window.__game.aim(false)');
// Moss with each weapon, seen from behind (default camera)
await api("window.__game.give('flamer'); window.__game.give('bazooka'); window.__game.give('sniper')");
await api('window.__game.teleport(0, 0, 32)');
await api('window.__game.look(0, 260)');
await gameWait(1);
for (const [key, name] of [['Digit1', 'rifle'], ['Digit2', 'pistol'], ['Digit3', 'sniper'], ['Digit4', 'flamer'], ['Digit5', 'bazooka']]) {
  await tap(key);
  await gameWait(0.4);
  await api('window.__game.aim(true)');
  await gameWait(0.4);
  await page.screenshot({ path: `${SHOT_DIR}/m-${name}.png` });
  await api('window.__game.aim(false)');
  await gameWait(0.3);
}
console.log('shots done');
await browser.close();
