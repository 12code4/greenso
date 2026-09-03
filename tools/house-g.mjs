// Floor G mission gate: G1 The Long Hall (flow, with combat force-cleared) and G2 Open House.
// Waits are GAME seconds. node tools/house-g.mjs
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } }); // one context: the saved world carries between runs
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${detail ?? ''}`); if (!ok) fails.push(name); };

async function run(query, steps) {
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
  await page.goto(`http://127.0.0.1:4173/?test&turbo&map=g${query}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const api = (expr) => page.evaluate(expr);
  const state = () => api('window.__game.state()');
  const time = () => api('window.__game.time()');
  const gameWait = async (s) => { const t0 = await time(); while ((await time()) - t0 < s) await page.waitForTimeout(120); };
  await steps({ api, state, gameWait, page });
  await page.close();
}

// ---- G1
await run('&mission=g1', async ({ api, state, gameWait }) => {
  await api('window.__game.resetWorld()');
  let s = await state();
  check('G1 selected', s.mission === 'g1', `mission=${s.mission} objective=${s.objective}`);
  check('arrival in the back hall', s.region === 'G_backhall', `region=${s.region} pos=${s.pos}`);
  check('radio pin on the kitchen', !!s.waypoint, JSON.stringify(s.waypoint));
  // walk to the kitchen (discover)
  await api('window.__game.teleport(-60, 0, -60)');
  await gameWait(2.5);
  s = await state();
  check('kitchen discovered → clear_counter', s.objective === 'clear_counter', `objective=${s.objective} enemies=${s.enemies}`);
  check('the counter garrison rose', s.enemies >= 6, `enemies=${s.enemies}`);
  await api('window.__game.clearEncounter("E_counter")');
  await gameWait(3.5);
  s = await state();
  check('counter cleared → get_string', s.objective === 'get_string', `objective=${s.objective}`);
  // climb to the drawer (teleport onto the counter, then into the drawer) and take the string
  await api('window.__game.teleport(-118, 11.2, -56)');
  await gameWait(1);
  await api('window.__game.use("use_drawer")');
  await gameWait(3);
  s = await state();
  check('string taken → rig_stairs', s.objective === 'rig_stairs' && s.flags.includes('string'), `objective=${s.objective} flags=${s.flags}`);
  // to the gap: stand on the lower run's top; the gap interactable needs the string
  await api('window.__game.teleport(94, 18.6, 46)');
  await gameWait(1);
  await api('window.__game.use("use_gap")');
  await gameWait(3);
  s = await state();
  check('bridge tied → climb_landing', s.objective === 'climb_landing' && s.flags.includes('bridge'), `objective=${s.objective} flags=${s.flags}`);
  check('stair-top picket arrived', s.enemies >= 4, `enemies=${s.enemies}`);
  // climb the run for real from the bridge to the top (autopilot), with the picket force-cleared first
  await api('window.__game.clearEncounter("E_stairs")');
  await api('window.__game.heal()');
  await api('window.__game.teleport(94, 18.6, 46)');
  await api('window.__game.walkTo(94, 46, 10.8)');
  const t0 = await api('window.__game.time()');
  while ((await api('window.__game.time()')) - t0 < 25) { if (await api('window.__game.walkArrived()')) break; await new Promise((r) => setTimeout(r, 150)); }
  await api('window.__game.walkStop()');
  s = await state();
  check('walked the marble run to the top', s.pos[1] > 43 && s.pos[2] < 15, `pos=${s.pos.map((v) => v.toFixed(1))}`);
  await gameWait(3.5);
  s = await state();
  check('G1 complete', s.complete === true, `complete=${s.complete} objective=${s.objective}`);
  // step onto the back of the top step: the stairs link (open once G1 is done)
  await api('window.__game.teleport(110, 46.1, 11.2)');
  await gameWait(1.5);
  s = await state();
  check('the stairs link is found', s.found.includes('L_stairs_G'), `found=${s.found}`);
});

// ---- G2 (world state carries G1's completion)
await run('&mission=g2', async ({ api, state, gameWait }) => {
  let s = await state();
  check('G2 selected after G1', s.mission === 'g2', `mission=${s.mission}`);
  check('bridge persists across loads', s.flags.includes('bridge'), `flags=${s.flags}`);
  await api('window.__game.teleport(12, 0.2, 12)'); // under the couch: the ball
  await gameWait(2.5);
  s = await state();
  check('ball picked up → lure', s.objective === 'lure' && s.flags.includes('ball'), `objective=${s.objective} flags=${s.flags}`);
  await api('window.__game.teleport(-24, 0, -100)');
  await gameWait(1);
  await api('window.__game.use("use_flap")');
  await gameWait(2.5);
  s = await state();
  check('lured → brace', s.objective === 'brace', `objective=${s.objective}`);
  await gameWait(9);
  s = await state();
  check('brace over → flap_open', s.objective === 'flap_open', `objective=${s.objective} hp=${s.hp}`);
  await api('window.__game.teleport(-24, 0, -107)');
  await gameWait(3.5);
  s = await state();
  check('G2 complete at the flap', s.complete === true, `complete=${s.complete}`);
  await api('window.__game.teleport(-24, 0, -110.5)');
  await gameWait(1.5);
  s = await state();
  check('dog door link found', s.found.includes('L_dogdoor'), `found=${s.found}`);
});

// ---- Secrets that need no combat: the record, the microwave, the vacuum warp, the piggy bank
await run('&mission=g1&noenemies', async ({ api, state, gameWait }) => {
  await api('window.__game.teleport(-48, 0, -20)');
  await gameWait(0.5);
  await api('window.__game.use("use_record")');
  await api('window.__game.teleport(-121, 16.8, -102)');
  await gameWait(0.5);
  await api('window.__game.use("use_microwave")');
  await api('window.__game.teleport(82, 0, 54)');
  await gameWait(0.5);
  await api('window.__game.use("warp_vacuum")');
  await gameWait(1.5);
  let s = await state();
  check('vacuum warp landed on the balcony', s.region === 'G_landing', `region=${s.region} pos=${s.pos.map((v) => v.toFixed(1))}`);
  check('secrets counted', s.secrets >= 3, `secrets=${s.secrets}`);
});

console.log(fails.length ? `FLOOR G GATE FAILED: ${fails.join(', ')}` : 'FLOOR G GATE PASSED');
await browser.close();
process.exit(fails.length ? 1 : 0);
