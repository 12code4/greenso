// FAIR PLAY gate (Update 3): awareness ladder, first-shot grace, radio pin,
// checkpoint per objective, dive-tackle. Waits are GAME seconds.
// node tools/fairplay.mjs
import { chromium } from 'playwright-core';

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
const time = () => api('window.__game.time()');
const gameWait = async (seconds) => {
  const t0 = await time();
  while ((await time()) - t0 < seconds) await page.waitForTimeout(120);
};
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${detail ?? ''}`); if (!ok) fails.push(name); };

// 1. Radio pin exists once deployed; checkpoint follows objective completion
let s = await state();
check('waypoint set on deploy', !!s.waypoint, JSON.stringify(s.waypoint));
const cp0 = s.checkpoint;
await api('window.__game.teleport(-16, 0, 2)'); // just inside R_gnome → reach_gnome completes
await gameWait(1.0);
s = await state();
check('checkpoint moved on objective done', s.checkpoint[0] !== cp0[0] || s.checkpoint[2] !== cp0[2], `${JSON.stringify(cp0)} → ${JSON.stringify(s.checkpoint)}`);

// 2. Awareness ladder: the stream picket's lone trooper at [24,0,26] faces NORTH. Stand crouched and still
//    3.5+ u BEHIND him (south), in the open: nobody should lock on in 3 s.
await api('window.__game.clearEncounter("E_gnome")');
await api('window.__game.activate("E_stream")');
await api('window.__game.teleport(24, 0, 29.8)');
await api('window.__game.setYaw(Math.PI)'); // camera facing north
await api('window.__game.key("KeyC", true)'); await gameWait(0.3); await api('window.__game.key("KeyC", false)');
await gameWait(3.0);
s = await state();
check('crouched & still behind a picket: no combat in 3 s', !s.combat, `combat=${s.combat} suspicious=${s.suspicious} hp=${s.hp}`);

// 3. Sprint NORTH straight past him up the open road: they lock on, and no damage lands for ≥0.5 s after
await api('window.__game.heal()');
await api('window.__game.key("ShiftLeft", true)'); await api('window.__game.key("KeyW", true)');
let firstCombatT = null, firstHurtT = null, sawSuspicious = false;
const t0 = await time();
while ((await time()) - t0 < 8) {
  s = await state();
  const t = await time();
  if (s.suspicious > 0) sawSuspicious = true;
  if (s.combat && firstCombatT === null) firstCombatT = t;
  if (s.hp < 100 && firstHurtT === null) firstHurtT = t;
  if (firstHurtT !== null) break;
  if (s.pos[2] < 20) await api('window.__game.key("KeyW", false)'); // stop in the open, in front of the based Tan at z 16
  await page.waitForTimeout(60);
}
await api('window.__game.key("ShiftLeft", false)'); await api('window.__game.key("KeyW", false)');
check('sprinting into view → suspicious or lock-on', sawSuspicious || firstCombatT !== null, `suspicious=${sawSuspicious} combatAt=${firstCombatT !== null}`);
check('eventually locked on', firstCombatT !== null, `pos=${s.pos.map((v) => v.toFixed(1))}`);
if (firstCombatT !== null && firstHurtT !== null) check('first-shot grace ≥ 0.5 s', firstHurtT - firstCombatT >= 0.5, `${(firstHurtT - firstCombatT).toFixed(2)} s`);
else check('grace measurable (hurt within 8 s of lock-on)', firstCombatT !== null && firstHurtT !== null, `combat=${firstCombatT} hurt=${firstHurtT}`);

// 4. Dive-tackle the based Tan on the stream picket at [25,0,4]: sprint north from 4.5 u out, dive, watch for the topple
await api('window.__game.heal()');
await api('window.__game.teleport(25, 0, 8.5)');
await api('window.__game.setYaw(Math.PI)'); // face north (−z)
await api('window.__game.key("ShiftLeft", true)'); await api('window.__game.key("KeyW", true)');
await gameWait(0.3);
await api('window.__game.key("KeyC", true)');
let toppledMax = 0, dove = false;
const t2 = await time();
while ((await time()) - t2 < 1.6) {
  s = await state();
  if (s.diving) dove = true;
  toppledMax = Math.max(toppledMax, s.toppled);
  if ((await time()) - t2 > 0.15) await api('window.__game.key("KeyC", false)');
  await page.waitForTimeout(50);
}
await api('window.__game.key("ShiftLeft", false)'); await api('window.__game.key("KeyW", false)');
check('sprint + C dives', dove, `pos=${s.pos.map((v) => v.toFixed(1))}`);
check('dive-tackle toppled a molded Tan', toppledMax > 0, `toppledMax=${toppledMax}`);

console.log(fails.length ? `FAIR PLAY GATE FAILED: ${fails.join(', ')}` : 'FAIR PLAY GATE PASSED');
await browser.close();
process.exit(fails.length ? 1 : 0);
