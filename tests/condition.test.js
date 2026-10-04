// Step 2: state model (suppression, cohesion, fire readiness) and threat map.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, db } from './helpers.js';
import { grid, cellOf, dangerAt, discomfortAt, toggleTestFire, addSource, stepThreat, ROWS, COLS } from '../dist/src/threat.js';
import { readyTime } from '../dist/src/condition.js';
import { recovery, readinessFactor } from '../dist/src/leaders.js';

const P = db.rules.condition;
// Long runs: keep the mission clock from ending the battle.
function runLong(steps) {
  for (let i = 0; i < steps; i += 1000) {
    state.elapsed = 0;
    run(Math.min(1000, steps - i));
  }
}
const start = () => {
  sim.reset();
  state.paused = false;
  state.started = true;
};
// Test fire on every soldier of a unit (each cell once).
function fireOn(s) {
  const done = new Set();
  for (const m of s.men) {
    const k = cellOf(m.x, m.y).i;
    if (!done.has(k)) toggleTestFire(m.x, m.y);
    done.add(k);
  }
  return () => done.forEach((i) => toggleTestFire((i % COLS) * P.grid.cell + 1, Math.floor(i / COLS) * P.grid.cell + 1));
}

test('parameters come from the data file; every unit starts with the three values in 0–100', () => {
  assert.equal(typeof P.suppression.pinnedAt, 'number');
  start();
  for (const s of state.squads) {
    for (const k of ['suppression', 'cohesion', 'readiness']) assert.ok(s.cond[k] >= 0 && s.cond[k] <= 100, `${s.name}.${k}`);
    assert.equal(s.cond.pinned, false);
    assert.equal(s.cond.broken, false);
  }
});

test('threat map: test fire marks a 3 × 3 block for both sides and who fires; it is refreshed a slice of rows per update', () => {
  start();
  assert.equal(toggleTestFire(600, 600), true);
  assert.equal(dangerAt(600, 600, 0), 1);
  assert.equal(dangerAt(600 + P.grid.cell, 600 + P.grid.cell, 1), 1);
  assert.equal(dangerAt(600 + 2 * P.grid.cell, 600, 0), 0);
  assert.equal(grid.by[0][cellOf(600, 600).i], 'test');
  // A source added without the tool only shows when its rows come round.
  const before = grid.danger[0].reduce((a, b) => a + b, 0);
  addSource({ x: 100, y: 20, by: 7, sides: [0] });
  addSource({ x: 100, y: 780, by: 7, sides: [0] });
  stepThreat(0.05);
  const rowsTouched = [dangerAt(100, 20, 0), dangerAt(100, 780, 0)].filter((d) => d > 0).length;
  assert.equal(rowsTouched, 1, 'only the first slice of rows is recomputed in one update');
  for (let k = 0; k < ROWS / P.grid.rowsPerUpdate; k++) stepThreat(0.05);
  assert.equal(dangerAt(100, 780, 0), 1);
  assert.equal(grid.by[0][cellOf(100, 780).i], 7);
  assert.ok(grid.danger[0].reduce((a, b) => a + b, 0) > before);
});

test('discomfort builds where fire falls and lingers long after the fire stops', () => {
  start();
  toggleTestFire(600, 600);
  run(100); // 5 s
  const peak = discomfortAt(600, 600, 0);
  assert.ok(peak > 50, `discomfort ${peak}`);
  toggleTestFire(600, 600);
  assert.equal(dangerAt(600, 600, 0), 0);
  run(200); // 10 s
  const later = discomfortAt(600, 600, 0);
  assert.ok(later > peak - 15 && later < peak, `discomfort ${peak} → ${later}`);
});

test('suppression rises under fire, the unit becomes Pinned, and recovers within seconds when the fire stops', () => {
  start();
  const s = player();
  const stop = fireOn(s);
  run(20); // 1 s
  assert.ok(s.cond.suppression > 30, `after 1 s: ${s.cond.suppression}`);
  run(40);
  assert.equal(s.cond.pinned, true);
  assert.equal(s.cond.suppression, 100);
  stop();
  run(20);
  assert.ok(s.cond.suppression < 100 && s.cond.pinned, 'still pinned just after');
  run(80); // 5 s total
  assert.equal(s.cond.suppression, 0);
  assert.equal(s.cond.pinned, false);
});

test('fire readiness resets on movement and builds in the weapons\' ready time; slower when pinned', () => {
  start();
  const s = player();
  assert.equal(s.cond.readiness, 100);
  sim.issue(s.x + 60, s.y);
  s.orderDelay = 0;
  run(2);
  assert.equal(s.cond.readiness, 0);
  run(200);
  assert.equal(s.path.length, 0);
  const t = readyTime(s);
  assert.ok(t > 3 && t < 5, `ready time ${t}`);
  const r0 = s.cond.readiness;
  assert.ok(r0 > 0);
  s.cond.readiness = 0;
  run(Math.round((t / 2) / 0.05));
  const lf = readinessFactor(s, 'lmg'); // the Gruppenführer's Fire Control (leaders.js)
  assert.ok(Math.abs(s.cond.readiness - 50 * lf) < 3, `half time → ${s.cond.readiness}`);
  s.cond.readiness = 0;
  s.cond.pinned = true;
  s.cond.suppression = 100;
  fireOn(s);
  run(Math.round((t / 2) / 0.05));
  assert.ok(s.cond.readiness < 20, `pinned → ${s.cond.readiness}`);
});

test('cohesion: casualties and a lost leader cost at once, the unit can break and rallies slowly out of fire', () => {
  start();
  const s = player();
  const leader = s.men.find((m) => m.role === 'leader');
  assert.ok(leader);
  leader.hp = 0;
  s.men.filter((m) => m !== leader).slice(0, 5).forEach((m) => (m.hp = 0));
  run(1);
  const lost = P.cohesion.leaderLost + 6 * P.cohesion.perCasualty;
  assert.ok(Math.abs(s.cond.cohesion - (100 - lost)) < 1, `${s.cond.cohesion}`);
  s.cond.cohesion = P.cohesion.brokenAt - 1;
  run(1);
  assert.equal(s.cond.broken, true);
  runLong(20 * 60); // 1 min out of fire, Gruppenführer dead: recoverPerMin × the stand-in's Rally factor
  const f = recovery(s).factor;
  assert.ok(Math.abs(s.cond.cohesion - (P.cohesion.brokenAt - 1 + P.cohesion.recoverPerMin * f)) < 1.5, `${s.cond.cohesion}`);
  runLong(20 * 180);
  assert.equal(s.cond.broken, false, 'rallies above rallyAt');
  const ceiling = 100 - P.cohesion.ceilingLossAtFullLosses * (6 / 10);
  runLong(20 * 600);
  assert.ok(s.cond.cohesion <= ceiling + 1e-9, 'losses cap the recovery');
});

test('the paused game does not change the state values', () => {
  start();
  const s = player();
  fireOn(s);
  state.paused = true;
  const v = JSON.stringify(s.cond);
  for (let i = 0; i < 20; i++) sim.step(0.05);
  assert.equal(JSON.stringify(s.cond), v);
});
