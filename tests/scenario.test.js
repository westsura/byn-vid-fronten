// Step 8: scenario 1 (counterattack on the stone house) – data, AI, victory
// conditions and the battle result.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as sim from '../dist/src/sim.js';
import { loadData, buildSide, validate, defaultChoice } from '../dist/src/data.js';
import { buildingCounts, missionBuilding, timeLimit } from '../dist/src/mission.js';
import { personStatus } from '../dist/src/result.js';
import { buildingAt, interiorSlots } from '../dist/src/terrain.js';
import { db as protoDb } from './helpers.js';

const dir = new URL('../dist/data/', import.meta.url);
const db = await loadData(async (p) => JSON.parse(readFileSync(new URL(p, dir))), 'counterattack-1943');
const { state } = sim;

function setup(choice = defaultChoice(db)) {
  sim.setRules(db);
  sim.setForces({ player: buildSide(db, 'player', choice), enemy: buildSide(db, 'enemy') });
  sim.reset();
  state.paused = false;
  state.started = true;
}
const unit = (id, side = 0) => state.squads.find((s) => s.unitId === id && s.side === side);
const restoreProto = () => {
  sim.setRules(protoDb);
  sim.setForces({ player: buildSide(protoDb, 'player'), enemy: buildSide(protoDb, 'enemy') });
};
function putInside(s, b) {
  s.x = b.midX;
  s.y = b.midY;
  s.path = [];
  const slots = interiorSlots(b);
  s.men.forEach((m, i) => {
    m.x = slots[i].x;
    m.y = slots[i].y;
  });
}

test('scenario data: 1943, the stone house as objective, time limit, budget, Soviet roles; consistent', () => {
  assert.deepEqual(validate(db), []);
  assert.equal(db.scenario.year, 1943);
  assert.equal(db.scenario.mission.type, 'building');
  setup();
  const b = missionBuilding();
  assert.equal(b.material, 'stone');
  assert.equal(timeLimit(), db.scenario.mission.timeLimitS);
  assert.ok(db.scenario.purchase.budget > 0);
  assert.deepEqual(Object.values(db.scenario.enemy.roles).filter((r) => !r.includes(' ')).sort(), ['command', 'garrison', 'reserve']);
  // The garrison starts inside the stone house.
  const g = unit('otdeleniye-1', 1);
  assert.ok(g.men.every((m) => buildingAt(m.x, m.y) === b));
  assert.equal(buildingCounts(state).fit[1], 11);
  restoreProto();
});

test('victory: at the time limit the fit men inside the house are compared (won, lost, draw)', () => {
  const outcome = (de, su) => {
    setup();
    state.squads.filter((q) => q.side).forEach((q) => (q.lastAI = 1e9));
    const b = missionBuilding();
    const g = unit('otdeleniye-1', 1);
    g.men.forEach((m, i) => (m.hp = i < su ? 100 : 0));
    const g1 = unit('gruppe-1');
    putInside(g1, b);
    g1.men.forEach((m, i) => (m.hp = i < de ? 100 : 0));
    let res = null;
    sim.hooks.finished = (r) => (res = r);
    state.elapsed = timeLimit() - 0.01;
    sim.update(0.05);
    sim.hooks.finished = () => {};
    return res;
  };
  const won = outcome(6, 3);
  assert.equal(won.outcome, 'won');
  assert.deepEqual(won.building, [6, 3]);
  assert.equal(outcome(2, 5).outcome, 'lost');
  assert.equal(outcome(4, 4).outcome, 'draw');
  restoreProto();
});

test('Pinned or Broken men inside do not count', () => {
  setup();
  const b = missionBuilding();
  const g1 = unit('gruppe-1');
  putInside(g1, b);
  assert.equal(buildingCounts(state).fit[0], 10);
  g1.cond.pinned = true;
  assert.equal(buildingCounts(state).fit[0], 0);
  assert.equal(buildingCounts(state).inside[0], 10);
  restoreProto();
});

test('Soviet AI: the garrison holds the house; the reserve counterattacks when the Germans at the house are weak', () => {
  setup();
  const b = missionBuilding();
  const reserve = unit('otdeleniye-2', 1);
  // Nobody near: the reserve stays.
  for (let k = 0; k < 20 * 14; k++) sim.update(0.05);
  assert.ok(!reserve.counterattacking);
  assert.ok(unit('otdeleniye-1', 1).men.every((m) => buildingAt(m.x, m.y) === b), 'garrison stays inside');
  // A pinned German Gruppe right by the house: weak – counterattack.
  const g2 = unit('gruppe-2');
  g2.x = b.x - 60;
  g2.y = b.midY;
  g2.men.forEach((m, i) => {
    m.x = g2.x + (i % 3) * 12;
    m.y = g2.y + Math.floor(i / 3) * 12;
  });
  g2.cond.pinned = true;
  g2.cond.suppression = 100;
  reserve.lastAI = -1e9;
  sim.update(0.05);
  assert.ok(reserve.counterattacking);
  assert.ok(reserve.path.length || reserve.orderDelay > 0, 'on its way to the house');
  restoreProto();
});

test('result: losses per unit, the leaders\' fate and every person\'s status, saved for a campaign', () => {
  setup({ ...defaultChoice(db), reinforcements: ['smg-gruppe'] });
  const g1 = unit('gruppe-1');
  g1.men[0].hp = -60; // the Gruppenführer: killed
  g1.men[1].hp = -5; // badly wounded
  g1.men[2].hp = 40; // lightly wounded
  let res = null;
  sim.hooks.finished = (r) => (res = r);
  state.elapsed = timeLimit();
  sim.update(0.05);
  sim.hooks.finished = () => {};
  assert.ok(res);
  const row = res.groups.find((g) => g.id === 'gruppe-1');
  assert.deepEqual([row.strength, row.fit, row.killed, row.badlyWounded, row.lightlyWounded], [10, 8, 1, 1, 1]);
  assert.equal(res.leaders.find((l) => l.id === g1.men[0].personId).status, 'killed');
  assert.ok(res.people.length >= 36 + 6 + 24);
  assert.ok(res.people.every((p) => ['active', 'lightlyWounded', 'badlyWounded', 'killed'].includes(p.status)));
  assert.equal(personStatus({ hp: 100 }), 'active');
  assert.equal(res.scenario, 'counterattack-1943');
  restoreProto();
});

test('briefing and result texts exist for the scenario', () => {
  const s = db.text.scenarios['counterattack-1943'];
  for (const k of ['title', 'missionTitle', 'missionText', 'situation', 'task', 'enemy', 'forces']) assert.equal(typeof s[k], 'string', k);
  assert.ok(Array.isArray(s.conditions) && s.conditions.length >= 2);
  for (const o of ['won', 'lost', 'draw']) assert.ok(db.text.result.outcome[o] && db.text.result.building[o]);
});
