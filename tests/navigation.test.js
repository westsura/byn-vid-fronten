import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, killEnemies } from './helpers.js';
import { buildings } from '../dist/src/scenario.js';
import { buildingAt, blocked, canWalk, los, dist } from '../dist/src/terrain.js';
import { pathTo } from '../dist/src/nav.js';

const DT = 0.05;

// Run until `done()` or `maxSeconds`, checking every step that no soldier stands in
// a wall or moved through one. Returns the simulated time used.
function runChecked(done, maxSeconds) {
  const men = state.squads.flatMap((s) => s.men);
  let prev = men.map((m) => ({ x: m.x, y: m.y }));
  let t = 0;
  while (t < maxSeconds && !done()) {
    sim.update(DT);
    t += DT;
    men.forEach((m, i) => {
      if (m.hp <= 0) return;
      assert.ok(!blocked(m.x, m.y), `soldier in wall at (${m.x.toFixed(1)},${m.y.toFixed(1)}) t=${t.toFixed(2)}`);
      assert.ok(canWalk(prev[i], m), `soldier crossed a wall (${prev[i].x.toFixed(1)},${prev[i].y.toFixed(1)}) → (${m.x.toFixed(1)},${m.y.toFixed(1)})`);
    });
    prev = men.map((m) => ({ x: m.x, y: m.y }));
  }
  return t;
}

const where = (men) => men.map((m) => `(${m.x.toFixed(0)},${m.y.toFixed(0)})`).join(' ');
const allInside = (b) => player().men.every((m) => buildingAt(m.x, m.y) === b);
const allOutsideNearSquad = () => player().men.every((m) => !buildingAt(m.x, m.y) && dist(m, player()) < 60);

for (const b of buildings) {
  test(`house ${b.id} (${b.name}): whole squad enters and leaves through the door`, () => {
    sim.reset();
    killEnemies();
    assert.ok(sim.issue(b.midX, b.midY), 'enter order accepted');
    const tIn = runChecked(() => allInside(b) && !player().path.length && player().men.every((m) => !m.moving), 90);
    assert.ok(allInside(b), `not all inside after ${tIn.toFixed(0)} s: ${where(player().men.filter((m) => buildingAt(m.x, m.y) !== b))}`);

    // Leave towards the road south of the northern row / north of the southern row.
    const exit = { x: b.midX, y: b.y > 400 ? 360 : 330 };
    state.mode = 'move';
    assert.ok(sim.issue(exit.x, exit.y), 'exit order accepted');
    const tOut = runChecked(() => allOutsideNearSquad() && !player().path.length, 60);
    assert.ok(allOutsideNearSquad(), `not all out after ${tOut.toFixed(0)} s: ${where(player().men)}`);
  });
}

test('squad can go from house to house (0 → 4) without getting stuck', () => {
  sim.reset();
  killEnemies();
  sim.issue(buildings[0].midX, buildings[0].midY);
  runChecked(() => allInside(buildings[0]) && !player().path.length, 90);
  sim.issue(buildings[4].midX, buildings[4].midY);
  runChecked(() => allInside(buildings[4]) && !player().path.length, 120);
  assert.ok(allInside(buildings[4]), where(player().men));
});

test('planned routes start with a directly walkable step and never cross walls', () => {
  // Awkward starting points: hugging outer corners and door jambs of every house.
  for (const b of buildings) {
    const probes = [
      { x: b.x - 4, y: b.y + b.h + 4 }, { x: b.x + b.w + 4, y: b.y + b.h + 4 },
      { x: b.x - 4, y: b.y - 4 }, { x: b.x + b.w + 4, y: b.y - 4 },
      { x: b.doorX - 17, y: b.y + b.h + 5 }, { x: b.doorX + 17, y: b.y + b.h - 8 },
    ];
    for (const p of probes) {
      if (blocked(p.x, p.y)) continue;
      const route = pathTo(p, b.midX, b.midY);
      assert.ok(route?.length, `no route from (${p.x},${p.y}) into house ${b.id}`);
      let cur = p;
      for (const w of route) {
        assert.ok(canWalk(cur, w), `route segment through wall near house ${b.id}`);
        cur = w;
      }
    }
  }
});

test('a target inside a wall is moved to the nearest reachable spot', () => {
  sim.reset();
  const b = buildings[3];
  const route = pathTo(player(), b.x + 2, b.midY); // on the west wall
  assert.ok(route?.length);
  assert.ok(!blocked(route.at(-1).x, route.at(-1).y));
});

test('fire only happens along clear lines of sight', () => {
  sim.reset();
  const shots = [];
  const check = () => {
    for (const e of state.effects)
      if (e.kind === 'shot' && !e.checked) {
        e.checked = true;
        shots.push(e);
        assert.ok(los({ x: e.x, y: e.y }, { x: e.tx, y: e.ty }), `shot through a wall (${e.x.toFixed(0)},${e.y.toFixed(0)}) → (${e.tx.toFixed(0)},${e.ty.toFixed(0)})`);
      }
  };
  sim.select(0); sim.issue(buildings[0].midX, buildings[0].midY);
  sim.select(1); sim.issue(640, 380);
  sim.select(2); sim.issue(buildings[3].midX, buildings[3].midY);
  sim.togglePause();
  for (let i = 0; i < 3000 && !state.ended; i++) {
    sim.update(DT);
    check();
  }
  assert.ok(shots.length > 20, `expected a firefight, got ${shots.length} shots`);
});

test('pause stops the simulation; resuming continues it', () => {
  sim.reset();
  sim.issue(640, 330);
  player().orderDelay = 0; // no wait for the order (leaders.js) in this test
  assert.equal(sim.step(DT), false, 'paused at start');
  const x = player().x;
  sim.togglePause();
  for (let i = 0; i < 20; i++) sim.step(DT);
  assert.ok(player().x > x, 'moves while running');
  sim.togglePause();
  const frozen = JSON.stringify(state.squads.map((s) => s.men.map((m) => [m.x, m.y])));
  const t = state.elapsed;
  for (let i = 0; i < 20; i++) sim.step(DT);
  assert.equal(state.elapsed, t);
  assert.equal(JSON.stringify(state.squads.map((s) => s.men.map((m) => [m.x, m.y]))), frozen);
});

test('soldiers never stack on the same spot', () => {
  sim.reset();
  killEnemies();
  sim.issue(buildings[1].midX, buildings[1].midY);
  runChecked(() => false, 40);
  const men = sim.alive(player());
  for (let a = 0; a < men.length; a++)
    for (let b = a + 1; b < men.length; b++) assert.ok(dist(men[a], men[b]) > 4, `soldiers ${a} and ${b} overlap`);
});
