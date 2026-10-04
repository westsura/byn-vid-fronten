// Step 6: leaders – values, traits, platoon modes, takeover, log.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sim, state, run, db } from './helpers.js';
import { leaderInfo, orderDelay, readinessFactor, hitFactor, recovery, speedFactor, barrelFactor, suppressionRiseFactor, radiusOf, updateAuras } from '../dist/src/leaders.js';

const L = db.rules.leaders;
const start = () => {
  sim.reset();
  state.paused = false;
  state.started = true;
};
const unit = (id) => state.squads.find((s) => s.unitId === id && !s.side);
const enemyUnit = (id) => state.squads.find((s) => s.unitId === id && s.side);
const place = (s, x, y) => {
  s.x = x;
  s.y = y;
  s.path = [];
  s.men.forEach((m, i) => {
    m.x = x + ((i % 4) - 1.5) * 12;
    m.y = y + (Math.floor(i / 4) - 1) * 12;
  });
};

test('leader data: every leader has Leadership, Fire Control and Rally 1–5 and at most one trait; Truppführer have none', () => {
  start();
  const zt = unit('zugtrupp');
  const zf = zt.men.find((m) => m.slot === 'zf');
  assert.deepEqual([zf.leader.leadership, zf.leader.fireControl, zf.leader.rally, zf.leader.trait], [4, 3, 5, 'veteran']);
  for (const g of ['gruppe-1', 'gruppe-2', 'gruppe-3']) {
    const info = leaderInfo(unit(g));
    assert.equal(info.man.title, 'Gruppenführer');
    assert.ok(info.trait, g);
    assert.equal(unit(g).men.find((m) => m.slot === 'tf').leader.trait, null);
  }
  assert.ok(db.traits.daredevil && db.traits.forwardObserver);
});

test('Leadership: the radius and how fast orders are carried out', () => {
  start();
  const klein = unit('gruppe-2'); // Leadership 2, Daredevil
  const weiss = unit('gruppe-3'); // Leadership 4, MG Specialist
  assert.ok(orderDelay(klein) > orderDelay(weiss));
  assert.ok(Math.abs(orderDelay(weiss) - (L.orderDelay.base + 4 * L.orderDelay.perLeadership)) < 1e-9);
  assert.equal(radiusOf({ leadership: 4 }), L.radius.base + 4 * L.radius.perLeadership);
  // The order waits for the delay, then the unit moves.
  start();
  const w3 = unit('gruppe-3');
  sim.select(w3.id);
  const x0 = w3.x;
  sim.issue(w3.x + 200, w3.y);
  run(Math.floor(orderDelay(w3) / 0.05) - 1);
  assert.equal(w3.x, x0, 'still waiting');
  run(20);
  assert.ok(w3.x > x0, 'moving');
});

test('Direct Fire: units within the radius build readiness faster and hit better; outside nothing', () => {
  start();
  const zt = unit('zugtrupp');
  const g3 = unit('gruppe-3');
  const g1 = unit('gruppe-1');
  place(zt, 150, 600);
  place(g3, 200, 600); // close
  place(g1, 150, 100); // far
  const before3 = readinessFactor(g3);
  const before1 = readinessFactor(g1);
  const hit3 = hitFactor(g3, g3.men[0], { x: 400, y: 600 }, 25, false);
  sim.setLeaderMode('de-001', 'directFire');
  assert.ok(readinessFactor(g3) > before3);
  assert.ok(hitFactor(g3, g3.men[0], { x: 400, y: 600 }, 25, false) > hit3);
  assert.equal(readinessFactor(g1), before1);
  assert.match(state.logs[0].text, /leaderMode|Direct Fire/);
});

test('Lead Assault: faster orders within the radius', () => {
  start();
  const zt = unit('zugtrupp');
  const g3 = unit('gruppe-3');
  place(zt, 150, 600);
  place(g3, 200, 600);
  const d0 = orderDelay(g3);
  sim.setLeaderMode('de-001', 'leadAssault');
  assert.ok(Math.abs(orderDelay(g3) - d0 * L.modes.leadAssault.orderDelayFactor) < 1e-9);
});

test('Rally: a broken unit near the rallying Zugführer recovers fast out of fire, and the log names him', () => {
  const rallyTime = (mode) => {
    start();
    state.squads.filter((q) => q.side).forEach((q) => q.men.forEach((m) => (m.hp = 0)));
    const zt = unit('zugtrupp');
    const g2 = unit('gruppe-2');
    place(zt, 150, 600);
    place(g2, 200, 640);
    if (mode) sim.setLeaderMode('de-001', mode);
    g2.cond.cohesion = 20;
    let k = 0;
    while (g2.cond.cohesion < 20 || g2.routed || g2.cond.broken || k < 2) {
      sim.update(0.05);
      state.elapsed = Math.min(state.elapsed, 100);
      if (++k > 20 * 600) break;
    }
    return { k, logs: state.logs.map((l) => l.text) };
  };
  const plain = rallyTime(null);
  const rally = rallyTime('rally');
  assert.ok(rally.k < plain.k / 2, `rally ${rally.k} vs ${plain.k}`);
  assert.ok(rally.logs.some((l) => l.includes('log.rallies') || /rallies 2\. Gruppe/.test(l)), rally.logs.join(' | '));
});

test('Rally value: a Green leader rallies worse; a Daredevil advances faster; an MG Specialist changes barrels in half the time', () => {
  start();
  const titov = enemyUnit('otdeleniye-2'); // Green
  assert.equal(suppressionRiseFactor(titov), db.traits.green.effects.suppressionRise);
  const klein = unit('gruppe-2'); // Daredevil
  assert.equal(speedFactor(klein), db.traits.daredevil.effects.advanceSpeed);
  const weiss = unit('gruppe-3'); // MG Specialist
  assert.equal(barrelFactor(weiss), 0.5);
  assert.ok(recovery(titov).factor < recovery(enemyUnit('otdeleniye-1')).factor);
});

test('a fallen Gruppenführer: the Truppführer takes over with his own weaker values and no trait; the log says so', () => {
  start();
  const g1 = unit('gruppe-1');
  const before = leaderInfo(g1);
  g1.men.find((m) => m.slot === 'gf').hp = 0;
  run(1);
  const after = leaderInfo(g1);
  assert.equal(after.man.title, 'Truppführer');
  assert.equal(after.standIn, true);
  assert.equal(after.trait, null);
  assert.ok(after.values.leadership < before.values.leadership);
  assert.ok(state.logs.some((l) => l.text.includes('takesCommand') || /takes command/.test(l.text)));
});

test('the Soviet Komandir vzvoda chooses his mode: Rally when a unit near him is shaken, else Direct Fire', () => {
  start();
  const upr = enemyUnit('upravleniye');
  const otd = enemyUnit('otdeleniye-1');
  place(otd, upr.x - 40, upr.y);
  updateAuras(state);
  assert.equal(state.auras.find((a) => a.side === 1).mode, 'directFire');
  otd.cond.cohesion = 30;
  updateAuras(state);
  assert.equal(state.auras.find((a) => a.side === 1).mode, 'rally');
});
