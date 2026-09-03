// Photo tour: load a map with no enemies, teleport to vantage points, screenshot each.
// node tools/tour.mjs <map> <outdir>   (spots for the ground floor are built in)
import { chromium } from 'playwright-core';
const [map = 'g', out = '/tmp/tour'] = process.argv.slice(2);
// Free-cam vantages: [name, x, y, z, yawRad, pitchRad] — exact camera placement, no rig
const FREE = {
  'g-top': [
    ['top-kitchen', -94, 48, -71, 0, 1.35],
    ['top-mudroom', -24, 48, -81, 0, 1.35],
    ['top-backhall', 38, 48, -71, 0, 1.35],
    ['top-garage', 100, 48, -51, 0, 1.35],
    ['top-dining', -99, 48, 19, 0, 1.35],
    ['top-living', 0, 90, 19, 0, 1.4],
    ['top-bath', 76, 48, 29, 0, 1.35],
    ['top-stairs', 115, 48, 39, 0, 1.35],
    ['top-hall-w', -80, 48, 90, 0, 1.35],
    ['top-hall-e', 60, 48, 90, 0, 1.35],
    ['vault-from-balcony', 0, 58, 66, Math.PI, 0.25],
    ['living-wide', -40, 30, 60, Math.PI * 0.75, 0.35],
    ['kitchen-wide', -60, 30, -40, -Math.PI * 0.7, 0.4],
    ['garage-wide', 130, 30, 5, Math.PI * 0.85, 0.4],
    ['hall-wide', 120, 25, 105, -Math.PI * 0.6, 0.3],
    // the kid-logic climbs
    ['climb-plank-kitchen', -95, 14, -70, Math.atan2(-17, -15), 0.2],
    ['climb-car', 125, 20, 20, Math.atan2(-25, -40), 0.15],
    ['climb-dining-chair', -60, 16, 40, Math.atan2(-21, -18), 0.2],
    ['climb-stairs-top', 94, 40, 60, Math.atan2(6, -48), -0.1],
    ['stairwell-up', 117, 6, 85, Math.PI, -0.45],
  ],
};
const SPOTS = {
  g: [
    ['arrival', 52, 0, -40, -Math.PI / 2, 0],
    ['backhall', 30, 0, -34, Math.PI * 0.9, 0],
    ['kitchen-floor', -60, 0, -45, -Math.PI * 0.75, 40],
    ['kitchen-counter', -100, 16.8, -105, -Math.PI * 0.5, 60],
    ['fridge-top', -63, 33.2, -104, Math.PI * 0.15, 120],
    ['mudroom', -24, 0, -70, Math.PI, 20],
    ['garage', 100, 0, -5, Math.PI, 60],
    ['car-roof', 100, 27, -60, 0, 150],
    ['dining', -99, 0, 60, Math.PI, 40],
    ['living', 0, 0, 60, Math.PI, 20],
    ['living-up', 0, 0, 30, Math.PI * 0.5, 250],
    ['mantel', 40, 0, 5, -Math.PI / 2, 60],
    ['bookcase', -30, 0, 50, Math.PI / 2, 80],
    ['balcony', 0, 52.2, 60, 0, 60],
    ['hall', -100, 0, 90, -Math.PI / 2, 10],
    ['stairs-foot', 100, 0, 85, Math.PI, 80],
    ['marble-run', 94, 17.5, 46, Math.PI, 60],
    ['bath', 76, 0, 30, Math.PI / 2, 30],
  ],
};
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto(`http://127.0.0.1:4173/?test&map=${map.replace('-top', '')}&noenemies`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (const [name, x, y, z, yaw, pitch] of FREE[map] ?? []) {
  await page.evaluate(([x, y, z, yaw, pitch]) => { window.__game.freeCam(x, y, z, yaw, pitch); }, [x, y, z, yaw, pitch]);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${map.replace('-top', '')}-${name}.png` });
  console.log(name, 'free-cam', JSON.stringify((await page.evaluate(() => window.__game.state())).cam));
}
if (FREE[map]) await page.evaluate(() => window.__game.freeCamOff());
for (const [name, x, y, z, yaw, pitchPx] of SPOTS[map] ?? []) {
  await page.evaluate(([x, y, z, yaw, p]) => { window.__game.teleport(x, y, z); window.__game.setYaw(yaw); window.__game.setPitch(p * 0.0023); }, [x, y, z, yaw, pitchPx]);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${map.replace('-top', '')}-${name}.png` });
  const s = await page.evaluate(() => window.__game.state());
  console.log(name, JSON.stringify({ pos: s.pos.map((v) => +v.toFixed(1)), cam: s.cam, region: s.region, grounded: s.grounded }));
}
await browser.close();
