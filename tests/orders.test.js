// Step 4: orders, selection, half speed, auto-pause, camera levels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, player, run, db } from './helpers.js';
import { cam, setCameraRules, setLevel, glideTo, updateCamera, view, toWorld, pan, levelInfo } from '../dist/src/camera.js';

const M = db.rules.orders.movement;
setCameraRules(db.rules.camera);
const start = () => {
  sim.reset();
  state.paused = false;
  state.started = true;
};
const noEnemies = () => state.squads.filter((q) => q.side).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
const travelled = (mode) => {
  start();
  noEnemies();
  const s = player();
  sim.setMode(mode);
  const x0 = s.x;
  sim.issue(s.x + 300, s.y);
  run(40); // 2 s
  return s.x - x0;
};

test('Move, Fast Move and Crawl: unit speeds from orders.json', () => {
  const move = travelled('move');
  const fast = travelled('fast');
  const crawl = travelled('crawl');
  assert.ok(Math.abs(move - M.move.unitSpeed * 2) < 3, `move ${move}`);
  assert.ok(Math.abs(fast - M.fast.unitSpeed * 2) < 3, `fast ${fast}`);
  assert.ok(Math.abs(crawl - M.crawl.unitSpeed * 2) < 3, `crawl ${crawl}`);
  assert.equal(player().order, 'crawl');
  assert.equal(sim.soldierPose(player().men[1], player()), 'prone', 'crawling soldiers are prone');
});

test('a pinned unit cannot move but can crawl at reduced speed', () => {
  start();
  noEnemies();
  const s = player();
  sim.setMode('move');
  sim.issue(s.x + 300, s.y);
  s.cond.pinned = true;
  s.cond.suppression = 100;
  const x0 = s.x;
  sim.update(0.05);
  assert.equal(s.x, x0);
  sim.setMode('crawl');
  sim.issue(s.x + 300, s.y);
  s.cond.pinned = true;
  s.cond.suppression = 100;
  sim.update(0.5);
  assert.ok(Math.abs(s.x - x0 - M.crawl.unitSpeed * M.crawl.pinnedFactor * 0.5) < 0.5);
});

test('Fire: the unit holds and concentrates on the clicked spotted enemy unit', () => {
  start();
  const s = player();
  const t = state.squads.filter((q) => q.side)[1];
  sim.setMode('fire');
  assert.equal(sim.issue(t.x, t.y), false, 'a hidden unit cannot be targeted');
  t.visible = true;
  const m = t.men[0];
  assert.equal(sim.issue(m.x, m.y), true);
  assert.equal(s.order, 'fire');
  assert.equal(s.fireTarget, t.id);
  assert.equal(s.path.length, 0);
  assert.equal(state.mode, 'move');
});

test('Retreat: falls back towards the own edge at speed, without firing, then defends', () => {
  start();
  const s = player();
  const x0 = s.x;
  sim.retreat();
  assert.equal(s.order, 'retreat');
  assert.ok(s.path.length);
  run(20);
  assert.ok(s.x < x0);
  run(400);
  assert.equal(s.order, 'defend');
});

test('selection: a split Gruppe can be selected as one half or both; orders go to all selected', () => {
  start();
  noEnemies();
  const s = player();
  sim.split();
  const b = state.squads.find((q) => q.team === 'schuetzentrupp');
  assert.deepEqual(state.selection.sort(), [s.id, b.id].sort(), 'both halves selected after the split');
  sim.select(b.id);
  assert.deepEqual(state.selection, [b.id]);
  sim.selectGroup(s.group);
  assert.equal(state.selection.length, 2);
  sim.setMode('move');
  sim.issue(s.x + 150, s.y);
  assert.ok(s.path.length && b.path.length, 'both move');
  const dx = b.x - s.x;
  assert.ok(Math.abs(b.path.at(-1).x - s.path.at(-1).x - dx) < 25, 'they keep their spacing');
});

test('Defend applies to all selected units', () => {
  start();
  sim.selectGroup(player().group);
  sim.split();
  sim.defend();
  for (const q of sim.selectedUnits()) assert.equal(q.order, 'defend');
});

test('half speed: the simulation advances at half rate; pause freezes it', () => {
  start();
  sim.setHalfSpeed(true);
  sim.step(0.05);
  assert.ok(Math.abs(state.elapsed - 0.025) < 1e-9);
  sim.setHalfSpeed(false);
  sim.step(0.05);
  assert.ok(Math.abs(state.elapsed - 0.075) < 1e-9);
  state.paused = true;
  sim.step(0.05);
  assert.ok(Math.abs(state.elapsed - 0.075) < 1e-9);
});

test('auto-pause on contact (setting)', () => {
  start();
  state.autoPause = true;
  const s = player();
  s.lastContact = state.elapsed;
  sim.update(0.05);
  assert.equal(state.paused, true);
  state.autoPause = false;
});

test('camera: three fixed levels, centred on the focus when zooming in; glide; clamped pan', () => {
  setLevel(0);
  assert.equal(cam.zoom, 1);
  assert.equal(levelInfo().shake, 0, 'whole map: camera still');
  setLevel(2, { x: 300, y: 300 });
  assert.equal(cam.zoom, db.rules.camera.levels[2].zoom);
  const v = view();
  assert.ok(Math.abs(v.x + v.w / 2 - 300) < 1e-6);
  const w = toWorld(600, 400);
  assert.ok(Math.abs(w.x - 300) < 1e-6 && Math.abs(w.y - 300) < 1e-6);
  glideTo(800, 500);
  updateCamera(db.rules.camera.glideS / 2);
  const mid = view().x + view().w / 2;
  assert.ok(mid > 300 && mid < 800, 'part way');
  updateCamera(1);
  assert.ok(Math.abs(view().x + view().w / 2 - 800) < 1e-6);
  pan(-5000, -5000);
  assert.deepEqual([cam.x, cam.y], [0, 0]);
  setLevel(9);
  assert.equal(cam.level, 2);
  setLevel(0);
});
