// Quick screenshot tool: node tools/shot.mjs <outfile> [map] [yawDeg] [pitchPx] [walkMs]
// Loads ?test&map=..., optionally turns and walks forward, saves a PNG.
import { chromium } from 'playwright-core';

const [out = '/tmp/shot.png', map = 'backyard', yawDeg = '0', pitchPx = '0', walkMs = '0', extra = ''] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto(`http://127.0.0.1:4173/?test&map=${map}${extra}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const yawPx = (parseFloat(yawDeg) * Math.PI / 180) / 0.0023;
await page.evaluate(([dx, dy]) => window.__game.look(dx, dy), [-yawPx, parseFloat(pitchPx)]);
const ms = parseInt(walkMs, 10);
if (ms > 0) {
  await page.evaluate(() => { window.__game.key('KeyW', true); window.__game.key('ShiftLeft', true); });
  await page.waitForTimeout(ms);
  await page.evaluate(() => { window.__game.key('KeyW', false); window.__game.key('ShiftLeft', false); });
}
await page.waitForTimeout(400);
console.log(JSON.stringify(await page.evaluate(() => window.__game.state())));
await page.screenshot({ path: out });
await browser.close();
