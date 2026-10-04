// Step 3 part A: line of sight, spotting and fire driven by the state model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, db } from './helpers.js';
import { sight, hindrance, hitChance, rangeFactor, fireInterval } from '../dist/src/fire.js';
import { dangerAt, grid, cellOf } from '../dist/src/threat.js';

const F = db.rules.fire;
const W = db.weapons;
const start = () => {
  sim.reset();
  state.paused = false;
  state.started = true;
};
const enemy = (i = 1) => state.squads.filter((s) => s.side)[i];
// Put a unit in a tight block around (x, y) with its men standing still.
function place(s, x, y) {
  s.x = x;
  s.y = y;
  s.path = [];
  s.men.forEach((m, i) => {
    m.x = x + ((i % 4) - 1.5) * 12;
    m.y = y + (Math.floor(i / 4) - 1) * 12;
  });
}

test('line of sight on the grid: open ground is clear, a house blocks, trees hinder and enough of them block', () => {
  assert.equal(sight({ x: 300, y: 340 }, { x: 650, y: 340 }), 0); // along the road
  assert.equal(sight({ x: 500, y: 60 }, { x: 500, y: 300 }), null); // through the west house
  const h = hindrance({ x: 20, y: 200 }, { x: 320, y: 200 }); // across the west wood
  assert.ok(h > F.sight.blockAfterCells, `hindrance ${h}`);
  assert.equal(sight({ x: 20, y: 200 }, { x: 320, y: 200 }), null);
});

test('weapons: range factor and fire interval from weapons.json', () => {
  assert.equal(rangeFactor(W.kar98k, 100), 1);
  assert.equal(rangeFactor(W.mp40, 150), 0.5);
  assert.equal(rangeFactor(W.mp40, 250), 0);
  assert.ok(Math.abs(fireInterval(W.kar98k) - 5) < 1e-9);
  assert.ok(Math.abs(fireInterval(W.mg34) - (6 * 60) / 250) < 1e-9);
});

test('fire effect = weapon × readiness × cover × shooter suppression', () => {
  start();
  const s = player();
  const t = enemy();
  const m = s.men[0];
  const v = { x: 640, y: 340, hp: 100 }; // on the road: little cover
  m.x = 600;
  m.y = 340;
  const base = hitChance(W.kar98k, s, m, t, v, 0);
  s.cond.readiness = 0;
  const unready = hitChance(W.kar98k, s, m, t, v, 0);
  assert.ok(Math.abs(unready / base - F.fire.readinessFloor) < 1e-9);
  s.cond.readiness = 100;
  s.cond.suppression = 100;
  assert.ok(Math.abs(hitChance(W.kar98k, s, m, t, v, 0) / base - (1 - F.fire.shooterSuppressionPenalty)) < 1e-9);
  s.cond.suppression = 0;
  const inHouse = hitChance(W.kar98k, s, m, t, { x: 500, y: 165, hp: 100 }, 0);
  assert.ok(inHouse < base * 0.4, 'a target in a house is much harder to hit');
  assert.ok(hitChance(W.kar98k, s, m, t, v, 2) < base, 'hindrance lowers the chance');
  assert.ok(hitChance(W.mg34, s, m, t, v, 0) < base, 'MG34 rounds hit less often each (bursts)');
});

test('units spot each other only with line of sight within range; hidden units are not fired on', () => {
  start();
  const s = player();
  const t = enemy();
  state.squads.filter((q) => q !== s && q !== t).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
  place(s, 300, 345);
  place(t, 300 + F.spotting.rangeUnits + 80, 345);
  run(10);
  assert.equal(t.visible, false);
  assert.equal(state.effects.filter((e) => e.kind === 'shot').length, 0);
  place(t, 560, 345);
  run(10);
  assert.equal(t.visible, true);
});

test('a firefight: shots are fired, the threat map marks the target cells and who fires, suppression rises', () => {
  start();
  const s = player();
  const t = enemy();
  state.squads.filter((q) => q !== s && q !== t).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
  place(s, 300, 345);
  place(t, 560, 345);
  let shots = 0;
  let marked = false;
  for (let k = 0; k < 200; k++) {
    sim.update(0.05);
    shots += state.effects.filter((e) => e.kind === 'shot' && e.life > 0.05).length;
    const i = cellOf(t.x, t.y).i;
    if (grid.danger[1][i] > 0 && grid.by[1][i] === s.id) marked = true;
  }
  assert.ok(shots > 20, `shots ${shots}`);
  assert.ok(marked, 'threat against the enemy, by 1. Gruppe');
  assert.ok(t.cond.suppression > 0 || t.cond.pinned, 'target suppressed');
  assert.ok(s.men.reduce((n, m) => n + m.ammo, 0) < s.men.reduce((n, m) => n + m.ammoFull, 0), 'ammunition used');
});

test('suppression slows and a pinned unit does not advance; moving resets readiness, a pinned unit still builds it', () => {
  start();
  const s = player();
  sim.issue(s.x + 200, s.y);
  s.cond.pinned = true;
  s.cond.suppression = 100;
  const x0 = s.x;
  sim.update(0.05);
  assert.equal(s.x, x0);
  s.cond.readiness = 0;
  // keep it pinned under test fire
  s.cond.suppression = 100;
  run(20);
  assert.ok(s.cond.readiness > 0, 'pinned, not moving: readiness builds slowly');
});

test('a broken unit falls back and refuses orders; it stops when it has rallied', () => {
  start();
  const s = player();
  s.cond.cohesion = 10;
  run(2);
  assert.equal(s.cond.broken, true);
  assert.equal(s.routed, true);
  assert.equal(s.order, 'retreat');
  assert.equal(sim.issue(600, 300), false);
  s.cond.cohesion = 60;
  run(2);
  assert.equal(s.routed, false);
  assert.equal(s.order, 'hold');
});

test('casualties lower cohesion through the state model', () => {
  start();
  const s = player();
  s.men[3].hp = 0;
  run(1);
  assert.ok(Math.abs(s.cond.cohesion - (100 - db.rules.condition.cohesion.perCasualty)) < 0.1);
});

// ---- Step 3 part B: split Gruppe and MG barrel change ----------------------

test('split: MG-Trupp led by the Gruppenführer, Schützentrupp by the Truppführer; both inherit the state; merge restores the Gruppe', () => {
  start();
  const s = player();
  s.cond.cohesion = 80;
  s.cond.suppression = 20;
  const n = state.squads.length;
  assert.equal(sim.split(), true);
  const b = state.squads[n];
  assert.equal(s.team, 'mg-trupp');
  assert.equal(b.team, 'schuetzentrupp');
  assert.deepEqual(s.men.map((m) => m.title), ['Gruppenführer', 'MG-Schütze 1', 'MG-Schütze 2', 'MG-Schütze 3']);
  assert.equal(b.men.length, 6);
  assert.equal(b.men.find((m) => m.slot === b.leaderSlot).title, 'Truppführer');
  assert.equal(b.cond.cohesion, 80);
  assert.equal(b.cond.suppression, 20);
  assert.ok(b.x < s.x, 'Schützentrupp behind (west of) the MG-Trupp');
  assert.ok(sim.playerSquads().includes(b));
  // The halves take orders separately: MG-Trupp holds, Schützentrupp moves.
  sim.select(b.id);
  assert.equal(sim.issue(b.x + 160, b.y + 80), true);
  run(220);
  assert.ok(Math.hypot(b.x - s.x, b.y - s.y) > 60, 'Schützentrupp moved away');
  assert.equal(s.path.length, 0);
  // Too far apart to merge; move back, then merge.
  assert.equal(sim.merge(b.id), false);
  sim.issue(s.x - 30, s.y);
  run(300);
  assert.equal(sim.merge(b.id), true);
  assert.equal(s.men.length, 10);
  assert.equal(s.men[0].title, 'Gruppenführer');
  assert.equal(s.team, null);
  assert.equal(b.absorbed, true);
  assert.ok(!sim.playerSquads().includes(b));
  assert.equal(state.selected, s.id);
  // Splitting again reuses the second object.
  assert.equal(sim.split(s.id), true);
  assert.equal(state.squads.length, n + 1);
});

test('a Gruppe without its Truppführer cannot split; the Zugtrupp cannot split', () => {
  start();
  const s = player();
  s.men.find((m) => m.slot === 'tf').hp = 0;
  assert.equal(sim.canSplit(s), false);
  assert.equal(sim.split(), false);
  assert.equal(sim.canSplit(state.squads.find((q) => q.kind === 'hq')), false);
});

test('MG34 barrel change after 250 rounds: the gun is silent for 8 s and the unit\'s fire readiness stops building', () => {
  start();
  const s = player();
  const t = enemy();
  state.squads.filter((q) => q !== s && q !== t).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
  place(s, 300, 345);
  place(t, 560, 345);
  t.men.forEach((m) => (m.hp = 1e9)); // keep the target alive
  const mg = s.men.find((m) => m.weapon === 'mg34');
  mg.roundsSinceChange = W.mg34.barrelChange.afterRounds - 1;
  let started = false;
  for (let k = 0; k < 200 && !started; k++) {
    sim.update(0.05);
    started = mg.barrelChange > 0;
  }
  assert.ok(started, 'barrel change began');
  assert.equal(mg.roundsSinceChange, 0);
  const ammo = mg.ammo;
  s.cond.readiness = 40;
  run(Math.round(7 / 0.05));
  assert.equal(mg.ammo, ammo, 'no rounds during the change');
  assert.equal(s.cond.readiness, 40, 'readiness interrupted');
  assert.equal(s.cond.barrelChange, true);
  run(Math.round(3 / 0.05));
  assert.equal(mg.barrelChange, 0);
  assert.ok(mg.ammo < ammo, 'firing again');
  assert.ok(s.cond.readiness > 40);
});
