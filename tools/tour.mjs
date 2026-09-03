// Photo tour: load a map with no enemies, teleport to vantage points, screenshot each.
// node tools/tour.mjs <map> <outdir>   (spots for the ground floor are built in)
import { chromium } from 'playwright-core';
const [map = 'g', out = '/tmp/tour'] = process.argv.slice(2);
const SPOTS = {
  'g-top': [
    ['top-kitchen', -94, 46, -71, 0, 620],
    ['top-mudroom', -24, 46, -81, 0, 620],
    ['top-backhall', 38, 46, -71, 0, 620],
    ['top-garage', 100, 46, -51, 0, 620],
    ['top-dining', -99, 46, 19, 0, 620],
    ['top-living', 0, 88, 19, 0, 620],
    ['top-living-south', 0, 46, 40, 0, 620],
    ['top-bath', 76, 46, 29, 0, 620],
    ['top-stairs', 115, 46, 39, 0, 620],
    ['top-hall-w', -80, 46, 90, 0, 620],
    ['top-hall-e', 60, 46, 90, 0, 620],
  ],
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
    ['living-up', 0, 0, 30, Math.PI * 0.5, -250],
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
for (const [name, x, y, z, yaw, pitchPx] of SPOTS[map] ?? []) {
  await page.evaluate(([x, y, z, yaw, p]) => { window.__game.teleport(x, y, z); window.__game.setYaw(yaw); window.__game.setPitch(p * 0.0023); }, [x, y, z, yaw, pitchPx]);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${map.replace('-top', '')}-${name}.png` });
  const s = await page.evaluate(() => window.__game.state());
  console.log(name, JSON.stringify({ pos: s.pos.map((v) => +v.toFixed(1)), region: s.region, grounded: s.grounded }));
}
await browser.close();
