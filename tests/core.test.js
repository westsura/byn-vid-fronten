import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, killEnemies, killPlayer } from './helpers.js';
import { objective } from '../dist/src/scenario.js';
import { blocked, dist } from '../dist/src/terrain.js';
import { pathTo } from '../dist/src/nav.js';

test('initial state: six squads, paused', () => {
  sim.reset();
  assert.equal(state.squads.length, 6);
  assert.equal(state.paused, true);
});

test('path to the objective exists; building walls are obstacles', () => {
  sim.reset();
  assert.ok(pathTo(player(), 755, 290).length > 0);
  assert.ok(blocked(444, 160));
});

test('movement order advances the squad and nobody ends up in a wall', () => {
  sim.reset();
  sim.select(0);
  sim.issue(640, 330);
  sim.togglePause();
  run(200);
  assert.ok(player().x > 200);
  assert.ok(state.squads.every((s) => !sim.alive(s).length || !blocked(s.x, s.y)));
});

test('win: holding the objective for 20 s', () => {
  sim.reset();
  player().x = objective.x;
  player().y = objective.y;
  killEnemies();
  run(410);
  assert.ok(state.ended && state.won && state.capture >= 20);
});

test('loss: all own squads lost', () => {
  sim.reset();
  killPlayer();
  sim.update(0.05);
  assert.ok(state.ended && !state.won);
});

test('loss: time runs out', () => {
  sim.reset();
  state.elapsed = 359.99;
  sim.update(0.05);
  assert.ok(state.ended && !state.won);
});

test('reset restores a fresh battle', () => {
  sim.reset();
  run(100);
  sim.reset();
  assert.ok(!state.ended && state.elapsed === 0 && state.paused && sim.alive(player()).length === 5);
});

test('postures: defend and suppression make soldiers prone, then recover', () => {
  sim.reset();
  sim.defend();
  sim.update(0.05);
  assert.equal(sim.soldierPose(player().men[0], player()), 'prone');
  sim.reset();
  player().underFire = 2;
  sim.update(0.05);
  assert.equal(sim.soldierPose(player().men[0], player()), 'prone');
  player().underFire = 0;
  player().men[0].moving = false;
  assert.equal(sim.soldierPose(player().men[0], player()), 'ready');
  player().men[0].hp = 0;
  assert.equal(sim.soldierPose(player().men[0], player()), 'fallen');
});

test('soldiers follow the squad around buildings', () => {
  sim.reset();
  killEnemies();
  sim.issue(650, 220);
  run(2200);
  assert.ok(player().men.every((m) => !blocked(m.x, m.y) && dist(m, player()) < 60));
});
