// Step 7: purchase screen data (core, candidates, prices, budget, reinforcements by year)
// and the support units' behaviour (heavy MG readiness, mortar indirect fire).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, run, db } from './helpers.js';
import { buildSide, defaultChoice, choiceCost, leaderPrice, reinforcementAvailable, validate } from '../dist/src/data.js';
import { readyTime } from '../dist/src/condition.js';

test('candidates: two or three per leader position, different ranks and prices; the data is consistent', () => {
  assert.deepEqual(validate(db), []);
  const c = db.forces.player.candidates;
  for (const key of ['zugtrupp/zf', 'zugtrupp/ztf', 'gruppe-1/gf', 'gruppe-2/gf', 'gruppe-3/gf']) {
    assert.ok(c[key].length >= 2 && c[key].length <= 3, key);
    assert.ok(new Set(c[key].map((p) => db.people[p].rank)).size >= 2, `${key}: different ranks`);
    assert.ok(new Set(c[key].map((p) => leaderPrice(db, p))).size >= 2, `${key}: different prices`);
  }
  // A Leutnant as Zugführer is dear, an Oberfeldwebel the usual, an Obergefreiter as Gruppenführer cheap.
  assert.ok(leaderPrice(db, 'de-101') > leaderPrice(db, 'de-001'));
  assert.ok(leaderPrice(db, 'de-106') < leaderPrice(db, 'de-105'));
});

test('the chosen leaders and reinforcements make up the force, placed in the start area', () => {
  const choice = defaultChoice(db);
  choice.leaders['gruppe-2/gf'] = 'de-108'; // Fw. Neumann instead of Ogefr. Klein
  choice.reinforcements = ['grw-gruppe', 'smg-gruppe'];
  const side = buildSide(db, 'player', choice);
  const g2 = side.units.find((u) => u.id === 'gruppe-2');
  assert.equal(g2.men[0].last, 'Neumann');
  assert.equal(g2.men[0].leader.trait, 'veteran');
  assert.deepEqual(side.units.map((u) => u.id), ['zugtrupp', 'gruppe-1', 'gruppe-2', 'gruppe-3', 'smg-gruppe', 'grw-gruppe']);
  const [x0, y0, x1, y1] = db.scenario.purchase.startArea;
  for (const u of side.units) assert.ok(u.x >= x0 && u.x <= x1 && u.y >= y0 && u.y <= y1, `${u.id} in start area`);
  assert.equal(side.units.find((u) => u.id === 'grw-gruppe').hotkey, '7');
  // The default force (no choice) is unchanged.
  assert.equal(buildSide(db, 'player').units.length, 4);
});

test('budget: the cost counts leaders and reinforcements; all three reinforcements need cheaper leaders', () => {
  const c = defaultChoice(db);
  const base = choiceCost(db, c);
  c.reinforcements = ['gruppe-4', 'smg-gruppe', 'grw-gruppe'];
  assert.ok(choiceCost(db, c) > db.scenario.purchase.budget, 'over budget with the default leaders');
  for (const [k, list] of Object.entries(db.forces.player.candidates)) if (!k.startsWith('_')) c.leaders[k] = list.reduce((a, b) => (leaderPrice(db, a) <= leaderPrice(db, b) ? a : b));
  assert.ok(choiceCost(db, c) <= db.scenario.purchase.budget, 'fits with the cheapest leaders');
  assert.ok(base > 0);
});

test('only reinforcements in service in the scenario year are offered', () => {
  const r = db.forces.player.reinforcements;
  assert.ok(r.every((x) => reinforcementAvailable(db, x)));
  const old = { ...db, scenario: { ...db.scenario, year: 1935 } };
  const offered = r.filter((x) => reinforcementAvailable(old, x)).map((x) => x.id);
  assert.ok(!offered.includes('smg-gruppe'), 'sMG-Gruppe from 1936');
  assert.ok(offered.includes('grw-gruppe'), 'Granatwerfer 34 from 1934');
});

const withSupport = () => {
  const c = defaultChoice(db);
  c.reinforcements = ['smg-gruppe', 'grw-gruppe'];
  sim.setForces({ player: buildSide(db, 'player', c), enemy: buildSide(db, 'enemy') });
  sim.reset();
  state.paused = false;
  state.started = true;
};
const restoreForces = () => sim.setForces({ player: buildSide(db, 'player'), enemy: buildSide(db, 'enemy') });

test('heavy MG: the slow build-up of fire readiness comes from the weapon (15–20 s)', () => {
  withSupport();
  const smg = state.squads.find((s) => s.unitId === 'smg-gruppe');
  assert.equal(readyTime(smg), db.weapons['mg34-lafette'].readyTimeS);
  assert.ok(readyTime(smg) >= 15 && readyTime(smg) <= 20);
  restoreForces();
});

test('mortar: a fire mission at a point in range sends shells that land around it; out of range is refused', () => {
  withSupport();
  const grw = state.squads.find((s) => s.unitId === 'grw-gruppe');
  state.squads.filter((q) => q.side).forEach((q) => (q.lastAI = 1e9));
  sim.select(grw.id);
  sim.setMode('fire');
  assert.equal(sim.issue(grw.x + 100, grw.y), false, 'too close (minimum range)');
  sim.setMode('fire');
  const target = { x: 700, y: 650 };
  assert.equal(sim.issue(target.x, target.y), true);
  assert.equal(grw.order, 'mortar');
  const ammo = grw.men.find((m) => m.weapon === 'grw34').ammo;
  const blasts = [];
  for (let k = 0; k < 20 * 40; k++) {
    sim.update(0.05);
    state.elapsed = Math.min(state.elapsed, 200);
    for (const e of state.effects) if (e.kind === 'explosion' && e.life > 1.35) blasts.push(e);
  }
  assert.ok(blasts.length >= 2, `shells landed: ${blasts.length}`);
  const spread = (db.weapons.grw34.scatterM / db.rules.fire.metresPerUnit) * 1.5;
  assert.ok(blasts.every((e) => Math.hypot(e.x - target.x, e.y - target.y) <= spread + 1));
  assert.ok(grw.men.find((m) => m.weapon === 'grw34').ammo < ammo);
  restoreForces();
});
