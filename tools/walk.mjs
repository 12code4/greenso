// P1 gate (docs/06 §7): route reachability + camera sweep.
// For every route in the map def, teleport to its first point and autopilot
// through the rest using the real controls. Reports reached points, time,
// and the fraction of frames the camera boom was pulled in hard.
// node tools/walk.mjs [map]
import { chromium } from 'playwright-core';

const MAP = process.argv[2] ?? 'backyard';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:4173/?test&turbo&map=${MAP}&noenemies`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const api = (expr, arg) => page.evaluate(expr, arg);
const gameTime = () => api(() => window.__game.time());

const routes = await api(() => window.__game.routes());
const results = [];
for (const route of routes) {
  if (route.class === 'setpiece') { results.push({ id: route.id, skipped: true }); continue; }
  const [x, y, z] = route.points[0];
  await api(([x, y, z]) => window.__game.teleport(x, y + 0.05, z), [x, y, z]);
  await page.waitForTimeout(300);
  let reached = 1;
  const t0 = await gameTime();
  let pulled = 0, samples = 0;
  for (let i = 1; i < route.points.length; i++) {
    const [px, py, pz] = route.points[i];
    await api(([px, py, pz]) => window.__game.walkTo(px, py, pz), [px, py, pz]);
    const legStart = await gameTime();
    let ok = false;
    while ((await gameTime()) - legStart < 14) {
      await page.waitForTimeout(120);
      const s = await api(() => window.__game.state());
      pulled += s.boomPulled; samples++;
      if (await api(() => window.__game.walkArrived())) { ok = true; break; }
    }
    if (!ok) break;
    reached++;
  }
  await api(() => window.__game.walkStop());
  const secs = (await gameTime()) - t0;
  results.push({ id: route.id, class: route.class, reached, total: route.points.length, secs: +secs.toFixed(1), boomPulled: samples ? +(pulled / samples).toFixed(3) : 0 });
  console.log(JSON.stringify(results[results.length - 1]));
}
await browser.close();

const failed = results.filter((r) => !r.skipped && r.reached < r.total);
const camBad = results.filter((r) => !r.skipped && r.class === 'main' && r.boomPulled > 0.08);
console.log(`\nroutes: ${results.length} · reachable: ${results.length - failed.length - results.filter(r => r.skipped).length} · failed: ${failed.map((r) => r.id).join(', ') || 'none'}`);
console.log(`camera sweep (main routes boom<1.0 > 8%): ${camBad.map((r) => `${r.id}=${r.boomPulled}`).join(', ') || 'clean'}`);
process.exit(failed.length ? 1 : 0);
