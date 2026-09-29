// Prototype forces from art/infantry-game-art-v1: German 10-man and Soviet 11-man squads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sim, state, player, killEnemies } from './helpers.js';
import { rosterFrom } from '../dist/src/art.js';
import { buildings } from '../dist/src/scenario.js';
import { buildingAt, blocked, canWalk, dist, interiorSlots } from '../dist/src/terrain.js';

const dir = new URL('../dist/assets/prototype/infantry-v1/', import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL(f, dir)));
const manifest = read('manifest.json');
const defs = { german: read('german-squad.json'), soviet: read('soviet-squad.json') };
const force = (playerFaction) => {
  const enemy = playerFaction === 'german' ? 'soviet' : 'german';
  return {
    id: 'test',
    player: { faction: playerFaction, soldiers: rosterFrom(playerFaction, defs[playerFaction], manifest.atlases[playerFaction]) },
    enemy: { faction: enemy, soldiers: rosterFrom(enemy, defs[enemy], manifest.atlases[enemy]) },
  };
};

test('squad definitions: sizes, sub-units and weapons as delivered', () => {
  const g = defs.german;
  assert.equal(g.soldierCount, 10);
  assert.equal(g.soldiers.length, 10);
  assert.deepEqual(g.subunits.map((u) => u.count), [4, 6]);
  assert.equal(g.soldiers.filter((s) => s.subunit === 'mg-trupp').length, 4);
  assert.deepEqual(g.soldiers[0].weapons, ['submachine-gun']);
  assert.ok(g.soldiers[1].weapons.includes('mg34'));
  assert.equal(g.soldiers.filter((s) => s.weapons.includes('kar98k')).length, 7);

  const s = defs.soviet;
  assert.equal(s.soldierCount, 11);
  assert.equal(s.soldiers.length, 11);
  assert.deepEqual(s.subunits.map((u) => u.count), [3, 8]);
  assert.equal(s.soldiers.filter((x) => x.element === 'fire').length, 3);
  assert.equal(s.soldiers[0].weapon, 'PPSh');
  assert.equal(s.soldiers[1].weapon, 'DP');
  assert.equal(s.soldiers.filter((x) => x.weapon === 'SVT-40').length, 2);
  assert.equal(s.soldiers.filter((x) => x.weapon === 'M1891/30').length, 7);
});

test('sprite roles line up with the squad definitions', () => {
  for (const f of ['german', 'soviet']) {
    const a = manifest.atlases[f];
    assert.equal(a.squadRoleIndices.length, defs[f].soldiers.length, `${f}: one sprite role per soldier`);
    for (const role of new Set(a.squadRoleIndices))
      for (const st of manifest.states) assert.ok(a.frames.find((fr) => fr.role === role && fr.state === st), `${f} role ${role} ${st}`);
  }
});

for (const side of ['german', 'soviet']) {
  const n = side === 'german' ? 10 : 11;

  test(`${side} player force: ${n} men per squad, roles and weapons carried into the battle`, () => {
    sim.setForces(force(side));
    sim.reset();
    for (const s of state.squads) assert.equal(s.men.length, s.side ? 21 - n : n);
    const men = player().men;
    assert.equal(men[0].role, 'leader');
    assert.equal(men.filter((m) => m.role === 'mg').length, 1);
    assert.ok(men.every((m) => !blocked(m.x, m.y)));
    sim.setForces(null);
  });

  test(`${side}: every house has room for ${n} soldiers`, () => {
    for (const b of buildings) {
      const slots = interiorSlots(b).slice(0, n);
      assert.equal(slots.length, n, `house ${b.id}`);
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) assert.ok(dist(slots[i], slots[j]) >= 11, `house ${b.id} slots ${i}/${j} too close`);
    }
  });

  for (const b of buildings) {
    test(`${side} squad of ${n}: enters and leaves house ${b.id} (${b.name})`, () => {
      sim.setForces(force(side));
      sim.reset();
      killEnemies();
      const men = player().men;
      let prev = men.map((m) => ({ x: m.x, y: m.y }));
      const stepChecked = () => {
        sim.update(0.05);
        men.forEach((m, i) => {
          assert.ok(!blocked(m.x, m.y) && canWalk(prev[i], m), 'wall violation');
        });
        prev = men.map((m) => ({ x: m.x, y: m.y }));
      };
      sim.issue(b.midX, b.midY);
      for (let t = 0; t < 120 && !(men.every((m) => buildingAt(m.x, m.y) === b) && !player().path.length); t += 0.05) stepChecked();
      const outside = men.filter((m) => buildingAt(m.x, m.y) !== b);
      assert.equal(outside.length, 0, `outside: ${outside.map((m) => `(${m.x.toFixed(0)},${m.y.toFixed(0)})`).join(' ')}`);
      state.mode = 'move';
      sim.issue(b.midX, b.y > 400 ? 360 : 330);
      for (let t = 0; t < 90 && !(men.every((m) => !buildingAt(m.x, m.y) && dist(m, player()) < 70) && !player().path.length); t += 0.05) stepChecked();
      assert.ok(men.every((m) => !buildingAt(m.x, m.y)), 'all out');
      sim.setForces(null);
    });
  }
}

test('standard forces are unchanged: five men per squad', () => {
  sim.setForces(null);
  sim.reset();
  assert.ok(state.squads.every((s) => s.men.length === 5));
});
