// Step 5: Cover Sector, opening range, sector sweep in the threat map, AI avoids swept cells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, db } from './helpers.js';
import { inSector, sectorCells } from '../dist/src/fire.js';
import { grid, cellOf, dangerAt, discomfortAt, addSource, stepThreat } from '../dist/src/threat.js';
import { pathTo, routeDanger } from '../dist/src/nav.js';

const S = db.rules.orders.sector;
const mpu = db.rules.fire.metresPerUnit;
const start = () => {
  sim.reset();
  state.paused = false;
  state.started = true;
};
function place(s, x, y) {
  s.x = x;
  s.y = y;
  s.path = [];
  s.men.forEach((m, i) => {
    m.x = x + ((i % 4) - 1.5) * 12;
    m.y = y + (Math.floor(i / 4) - 1) * 12;
  });
}
// 1. Gruppe on the road west of the village, one Soviet otdeleniye; everyone else out.
function duel() {
  start();
  const s = player();
  const t = state.squads.filter((q) => q.side)[1];
  state.squads.filter((q) => q !== s && q !== t).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
  place(s, 300, 345);
  t.lastAI = 1e9; // keep the AI still
  t.men.forEach((m) => (m.hp = 1e9));
  return { s, t };
}
const shotsBy = (s, steps) => {
  let n = 0;
  for (let k = 0; k < steps; k++) {
    const before = s.men.reduce((a, m) => a + m.ammo, 0);
    sim.update(0.05);
    if (s.men.reduce((a, m) => a + m.ammo, 0) < before) n++;
  }
  return n;
};

test('Cover Sector: a drag gives the cone between the two directions, a click a default cone; range clamped', () => {
  const { s } = duel();
  sim.setSector(s.x + 200, s.y - 100, s.x + 200, s.y + 100);
  assert.equal(s.order, 'sector');
  assert.ok(Math.abs(s.sector.dir) < 1e-9);
  assert.ok(Math.abs(s.sector.half - Math.atan2(100, 200)) < 1e-9);
  assert.ok(Math.abs(s.sector.range - Math.hypot(200, 100)) < 1e-9);
  sim.setSector(s.x, s.y - 2000, s.x, s.y - 2000); // a click far north
  assert.ok(Math.abs(s.sector.dir + Math.PI / 2) < 1e-9);
  assert.ok(Math.abs(s.sector.half * 2 - (S.defaultWidthDeg * Math.PI) / 180) < 1e-9);
  assert.ok(Math.abs(s.sector.range * mpu - S.maxRangeM) < 1e-9);
  assert.ok(inSector(s, { x: s.x, y: s.y - 100 }));
  assert.ok(!inSector(s, { x: s.x + 100, y: s.y }));
  assert.equal(sim.soldierPose(s.men[2], s), 'prone');
  sim.setMode('move');
  sim.issue(s.x + 50, s.y);
  assert.equal(s.sector, null, 'a new order ends the sector');
});

test('the unit fires only into its sector', () => {
  const { s, t } = duel();
  place(t, 300, 120); // north of the unit, in sight and range
  run(10);
  assert.ok(t.visible);
  sim.setSector(s.x + 250, s.y - 60, s.x + 250, s.y + 60); // east along the road
  assert.equal(shotsBy(s, 60), 0, 'no shots outside the sector');
  place(t, 520, 345); // into the sector
  assert.ok(shotsBy(s, 80) > 0, 'fires into the sector');
});

test('opening range: holds fire until the enemy is within it, then fires on anything in the sector', () => {
  const { s, t } = duel();
  sim.setSector(s.x + 300, s.y - 70, s.x + 300, s.y + 70);
  sim.setOpening(15);
  assert.ok(Math.abs(s.sector.opening * mpu - 15) < 1e-9);
  place(t, 300 + 260, 345); // 26 m: inside the sector, outside the opening range
  run(10);
  assert.ok(t.visible);
  assert.equal(shotsBy(s, 60), 0, 'holding fire');
  assert.equal(s.sector.open, false);
  place(t, 300 + 120, 345); // 12 m
  assert.ok(shotsBy(s, 40) > 0, 'fire opened');
  assert.equal(s.sector.open, true);
  place(t, 300 + 260, 345); // back out to 26 m: still in the sector, fire stays open
  assert.ok(shotsBy(s, 60) > 0);
});

test('while it fires, the visible cone is swept in the threat map; the danger stops with the fire, discomfort lingers', () => {
  const { s, t } = duel();
  sim.setSector(s.x + 300, s.y - 70, s.x + 300, s.y + 70);
  place(t, 520, 345);
  run(60);
  const far = { x: 300 + 280, y: 345 }; // in the cone, away from the target
  const cells = sectorCells(s);
  assert.ok(cells.has(cellOf(far.x, far.y).i));
  assert.ok(dangerAt(far.x, far.y, 1) > 0, 'cone swept');
  assert.equal(grid.by[1][cellOf(far.x, far.y).i], s.id);
  assert.equal(dangerAt(far.x, far.y, 0), 0, 'only against the enemy');
  t.men.forEach((m) => (m.hp = 0)); // fire stops
  run(60);
  assert.equal(dangerAt(far.x, far.y, 1), 0);
  assert.ok(discomfortAt(far.x, far.y, 1) > 0, 'discomfort lingers');
});

test('pathfinding with the threat map goes round swept cells when it can', () => {
  start();
  // A swept band across the road east of the crossroads, leaving the field to the north open.
  addSource({ x: 900, y: 345, radius: 2, by: 'test', sides: [1] });
  for (let k = 0; k < 10; k++) stepThreat(0.05);
  const from = { x: 1100, y: 345 };
  const cost = (x, y) => dangerAt(x, y, 1) * db.rules.ai.dangerWeight;
  const plain = pathTo(from, 700, 345);
  const safe = pathTo(from, 700, 345, { cost });
  assert.ok(routeDanger(from, plain, (x, y) => dangerAt(x, y, 1)) > 0, 'the straight way is swept');
  assert.equal(routeDanger(from, safe, (x, y) => dangerAt(x, y, 1)), 0, 'the AI route avoids it');
});

test('an enemy unit whose way is swept re-plans or goes to ground', () => {
  const { s, t } = duel();
  place(t, 1100, 345);
  t.lastAI = 0;
  sim.aiMove(t, 700, 345);
  assert.ok(t.path.length);
  // A wide swept block in front of it, covering every way through.
  for (const y of [100, 200, 300, 400, 500, 600, 700]) addSource({ x: 1000, y, radius: 3, by: s.id, sides: [1], life: 30 });
  for (let k = 0; k < 10; k++) stepThreat(0.05);
  sim.aiMove(t, 700, 345);
  assert.equal(t.path.length, 0, 'halted');
  assert.equal(t.aiHalted, true);
});
