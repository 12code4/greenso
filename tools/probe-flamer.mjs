// Probe: the flowerbed flamer's state every 0.5 s after the player lands in front of him (heroes gate step 4). node tools/probe-flamer.mjs
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://127.0.0.1:4173/?test&turbo&map=backyard', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const api = (x) => page.evaluate(x);
const time = () => api('window.__game.time()');
await api('window.__game.heal()');
await api('window.__game.activate("E_bed")');
await api('window.__game.teleport(-2, 3.0, -31.5)');
await api('window.__game.setYaw(Math.PI)');
const t0 = await time();
let last = -1;
while ((await time()) - t0 < 8) {
  const t = (await time()) - t0;
  if (t - last >= 0.5) {
    last = t;
    const s = await api('window.__game.state()');
    const fl = (await api('window.__game.enemyList()')).filter((e) => e.type === 'flamer');
    console.log(t.toFixed(1), 'burning', s.burning, 'hp', s.hp, 'pos', s.pos.map((v) => v.toFixed(1)).join(','), 'crouched', s.crouched, JSON.stringify(fl));
  }
  await page.waitForTimeout(100);
}
await browser.close();
