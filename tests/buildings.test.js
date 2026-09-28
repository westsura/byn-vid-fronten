import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, killEnemies } from './helpers.js';
import { buildings } from '../dist/src/scenario.js';
import { buildingAt, blocked, canWalk, coverAt, los, dist } from '../dist/src/terrain.js';

test('house 0: entry, cover, walls, windows and exit', () => {
  sim.reset();
  killEnemies();
  sim.issue(500, 165);
  run(1800);
  const s = player();
  assert.equal(buildingAt(s.x, s.y), buildings[0], 'squad enters house');
  assert.ok(s.men.every((m) => buildingAt(m.x, m.y) === buildings[0]), 'all soldiers enter');
  assert.ok(s.men.every((m) => !blocked(m.x, m.y)), 'no soldiers in walls');
  assert.equal(coverAt(s.x, s.y), 0.78, 'interior cover');
  assert.ok(!canWalk({ x: 420, y: 160 }, { x: 470, y: 160 }), 'wall blocks walking');
  assert.ok(canWalk({ x: 510, y: 240 }, { x: 510, y: 195 }), 'door allows walking');
  assert.ok(los({ x: 501.5, y: 140 }, { x: 501.5, y: 80 }), 'window allows sight');
  assert.ok(!los({ x: 470, y: 140 }, { x: 470, y: 80 }), 'solid wall blocks sight');
  assert.ok(!canWalk({ x: 501.5, y: 140 }, { x: 501.5, y: 80 }), 'cannot walk through window');

  state.mode = 'move';
  sim.issue(650, 330);
  run(1800);
  assert.ok(!buildingAt(s.x, s.y), 'squad leaves');
  assert.ok(s.men.every((m) => !buildingAt(m.x, m.y) && dist(m, s) < 60), 'all soldiers exit through door');
});
