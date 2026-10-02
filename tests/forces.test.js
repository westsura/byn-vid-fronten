// Forces from the data files in the battle: the Soviet otdeleniye (11 men) can use
// every house like the German Gruppe (10, covered in navigation.test.js), and every
// soldier has a figure in the approved sprite set.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sim, state, player, killEnemies, db, forces } from './helpers.js';
import { buildSide } from '../dist/src/data.js';
import { SPRITE_SOURCES } from '../dist/src/art.js';
import { buildings } from '../dist/src/scenario.js';
import { buildingAt, blocked, canWalk, dist, interiorSlots } from '../dist/src/terrain.js';

const swapped = { player: buildSide(db, 'enemy'), enemy: buildSide(db, 'player') };

test('every house has room for an 11-man otdeleniye', () => {
  for (const b of buildings) {
    const slots = interiorSlots(b).slice(0, 11);
    assert.equal(slots.length, 11, `house ${b.id}`);
    for (let i = 0; i < 11; i++) for (let j = i + 1; j < 11; j++) assert.ok(dist(slots[i], slots[j]) >= 11, `house ${b.id} slots ${i}/${j}`);
  }
});

for (const b of buildings) {
  test(`otdeleniye of 11 enters and leaves house ${b.id} (${b.name})`, () => {
    sim.setForces(swapped);
    sim.reset();
    killEnemies();
    sim.select(state.squads.findIndex((s) => s.name === '1-ye otdeleniye'));
    const men = player().men;
    assert.equal(men.length, 11);
    let prev = men.map((m) => ({ x: m.x, y: m.y }));
    const stepChecked = () => {
      sim.update(0.05);
      men.forEach((m, i) => assert.ok(!blocked(m.x, m.y) && canWalk(prev[i], m), 'wall violation'));
      prev = men.map((m) => ({ x: m.x, y: m.y }));
    };
    sim.issue(b.midX, b.midY);
    for (let t = 0; t < 150 && !(men.every((m) => buildingAt(m.x, m.y) === b) && !player().path.length); t += 0.05) stepChecked();
    const outside = men.filter((m) => buildingAt(m.x, m.y) !== b);
    assert.equal(outside.length, 0, `outside: ${outside.map((m) => `(${m.x.toFixed(0)},${m.y.toFixed(0)})`).join(' ')}`);
    state.mode = 'move';
    sim.issue(b.midX, b.y > 400 ? 360 : 330);
    for (let t = 0; t < 90 && !(men.every((m) => !buildingAt(m.x, m.y) && dist(m, player()) < 70) && !player().path.length); t += 0.05) stepChecked();
    assert.ok(men.every((m) => !buildingAt(m.x, m.y)), 'all out');
    sim.setForces(forces);
  });
}

test('every soldier on both sides has ready and prone frames in the sprite set', () => {
  const root = new URL('../dist/', import.meta.url);
  const keys = new Set();
  for (const src of SPRITE_SOURCES) {
    const m = JSON.parse(readFileSync(new URL(src.manifest ?? src.base + 'manifest.json', root)));
    for (const [k, v] of Object.entries(src.map)) if (m.frames[k]) keys.add(v);
  }
  for (const [side, fac] of [['player', 'german'], ['enemy', 'soviet']]) {
    for (const u of forces[side].units) {
      for (const m of u.men) for (const pose of ['ready', 'prone']) assert.ok(keys.has(`${fac}-${m.sprite}-${pose}`), `${u.name}: ${m.position} → ${fac}-${m.sprite}-${pose}`);
    }
    for (const v of ['a', 'b']) assert.ok(keys.has(`${fac}-fallen-${v}`));
  }
});
