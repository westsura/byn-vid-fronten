// Step 3 part C: impacts by material, tracers, grenades, camera trauma, contact off screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, db } from './helpers.js';
import { materialAt, impactPoint, addTracers, addTrauma, stepEffects, shakeAmount } from '../dist/src/effects.js';
import { detonate, playerKnows } from '../dist/src/fire.js';
import { buildings } from '../dist/src/scenario.js';

const E = db.rules.effects;
const start = () => {
  sim.reset();
  state.paused = false;
  state.started = true;
};
const ev = { log() {}, shot() {}, boom() {}, effect() {} };

test('materials: log houses are wood, the farmhouse and storehouse stone, the rest earth', () => {
  const wood = buildings.find((b) => b.name === 'Barn');
  const stone = buildings.find((b) => b.name === 'Farmhouse');
  assert.equal(materialAt(wood.midX, wood.y), 'wood');
  assert.equal(materialAt(stone.x, stone.midY), 'stone');
  assert.equal(materialAt(300, 345), 'earth');
});

test('misses at a soldier inside a house strike its wall, facing the shooter', () => {
  const b = buildings.find((x) => x.name === 'Farmhouse');
  const shooter = { x: b.x - 200, y: b.midY };
  const v = { x: b.midX, y: b.midY };
  for (let i = 0; i < 20; i++) {
    const p = impactPoint(shooter, v, false);
    assert.equal(p.material, 'stone');
    assert.ok(p.x <= b.x + 1, `on the west wall: ${p.x}`);
  }
  const hit = impactPoint(shooter, v, true);
  assert.deepEqual([hit.x, hit.y], [v.x, v.y]);
});

test('tracers only for MG bursts; from an unseen shooter they start part way', () => {
  const st = { effects: [] };
  const m = { x: 0, y: 0 };
  const v = { x: 400, y: 0 };
  addTracers(st, db.weapons.kar98k, m, v, 1, true);
  assert.equal(st.effects.length, 0);
  addTracers(st, db.weapons.mg34, m, v, 6, true);
  assert.equal(st.effects.length, 6 / E.tracers.everyRounds);
  assert.equal(st.effects[0].x0, 0);
  st.effects = [];
  addTracers(st, db.weapons.dp27, m, v, 6, false);
  assert.ok(st.effects.every((e) => e.x0 > 400 * E.tracers.hiddenStart * 0.9));
});

test('a firefight produces impacts, and MG tracers', () => {
  start();
  const s = player();
  const t = state.squads.filter((q) => q.side)[1];
  state.squads.filter((q) => q !== s && q !== t).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
  for (const [q, x] of [[s, 300], [t, 560]]) {
    q.x = x; q.y = 345; q.path = [];
    q.men.forEach((m, i) => { m.x = x + ((i % 4) - 1.5) * 12; m.y = 345 + (Math.floor(i / 4) - 1) * 12; });
  }
  const kinds = new Set();
  for (let k = 0; k < 200; k++) {
    sim.update(0.05);
    state.effects.forEach((e) => kinds.add(e.kind + (e.material ? ':' + e.material : '')));
  }
  assert.ok(kinds.has('impact:earth'), [...kinds].join());
  assert.ok(kinds.has('tracer'), [...kinds].join());
});

test('camera trauma: grows with an explosion, falls off with distance, decays; shake = min(cap, trauma²)', () => {
  const st = { trauma: 0 };
  addTrauma(st, 100, 100, 0.5, { x: 100, y: 100 });
  assert.equal(st.trauma, 0.5);
  assert.equal(shakeAmount(st), 0.25);
  const far = { trauma: 0 };
  addTrauma(far, 100, 100, 0.5, { x: 100 + E.shake.rangeUnits + 1, y: 100 });
  assert.equal(far.trauma, 0);
  st.trauma = 1;
  assert.equal(shakeAmount(st), E.shake.cap);
  stepEffects(st, 0.5);
  assert.ok(Math.abs(st.trauma - (1 - E.shake.decayPerS * 0.5)) < 1e-9);
});

test('grenades: an explosion the player knows about shakes the camera; a hidden one does not', () => {
  start();
  const s = player();
  // In front of 1. Gruppe: known.
  detonate({ x: s.x + 60, y: s.y, weapon: 'rgd33', by: 'test', side: 1 }, state.squads, state, ev, s);
  assert.ok(state.trauma > 0);
  assert.ok(state.effects.some((e) => e.kind === 'explosion' && e.visible));
  // Far behind the Soviet lines, no German can see it: no shake, not shown.
  state.trauma = 0;
  state.effects = [];
  assert.equal(playerKnows(state.squads, 1150, 60, 1), false);
  detonate({ x: 1150, y: 60, weapon: 'rgd33', by: 'test', side: 1 }, state.squads, state, ev, s);
  assert.equal(state.trauma, 0);
  assert.ok(state.effects.some((e) => e.kind === 'explosion' && !e.visible));
});

test('a grenade close to a unit can cause casualties and raises its suppression', () => {
  start();
  const s = player();
  const n0 = sim.alive(s).length;
  for (let i = 0; i < 4; i++) detonate({ x: s.men[i * 2].x, y: s.men[i * 2].y, weapon: 'stg24', by: 'test', side: 1 }, state.squads, state, ev, s);
  assert.ok(sim.alive(s).length < n0);
  run(25);
  assert.ok(s.cond.suppression > 0);
});

test('soldiers throw grenades in close combat and carry a limited number', () => {
  start();
  const s = player();
  assert.ok(s.men.filter((m) => m.grenades > 0).length >= 5, 'Schützen carry grenades');
  assert.equal(s.men.find((m) => m.weapon === 'mg34').grenades, 0);
  const t = state.squads.filter((q) => q.side)[1];
  state.squads.filter((q) => q !== s && q !== t).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
  for (const [q, x] of [[s, 300], [t, 460]]) {
    q.x = x; q.y = 345; q.path = [];
    q.men.forEach((m, i) => { m.x = x + ((i % 4) - 1.5) * 12; m.y = 345 + (Math.floor(i / 4) - 1) * 12; m.hp = 1e9; });
  }
  let thrown = 0;
  for (let k = 0; k < 600; k++) {
    sim.update(0.05);
    thrown = Math.max(thrown, state.effects.filter((e) => e.kind === 'thrown').length);
  }
  const left = s.men.reduce((n, m) => n + m.grenades, 0);
  assert.ok(left < 7, `grenades left ${left}`);
});

test('contact off screen: an edge marker condition and one log line', () => {
  start();
  const s = player();
  state.view = { x: 600, y: 400, w: 600, h: 400 }; // view away from 1. Gruppe
  s.lastContact = state.elapsed;
  assert.equal(sim.inContact(s), true);
  assert.equal(sim.offScreen(s), true);
  run(2);
  assert.equal(state.logs.filter((l) => l.text.includes('contact')).length, 1);
  state.view = { x: 0, y: 0, w: 1200, h: 800 };
  assert.equal(sim.offScreen(s), false);
});
