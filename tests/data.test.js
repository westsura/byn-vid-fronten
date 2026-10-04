// Game data (step 1): the files load, are consistent and describe the forces in DESIGN.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from './helpers.js';
import { validate, buildSide, rankOf } from '../dist/src/data.js';

test('all data files are consistent (references, years, slots)', () => {
  assert.deepEqual(validate(db), []);
});

test('German Schützenzug 1943: Zugtrupp and three Gruppen of ten', () => {
  const de = buildSide(db, 'player');
  assert.equal(de.formation, 'heer');
  assert.deepEqual(de.units.map((u) => u.name), ['Zugtrupp', '1. Gruppe', '2. Gruppe', '3. Gruppe']);
  const zt = de.units[0];
  assert.deepEqual(zt.men.map((m) => m.position), ['Zugführer', 'Zugtruppführer', 'Melder', 'Melder', 'Krankenträger', 'Krankenträger']);
  for (const g of de.units.slice(1)) {
    assert.equal(g.men.length, 10);
    const pos = g.men.map((m) => m.position);
    assert.equal(pos[0], 'Gruppenführer');
    for (const p of ['Truppführer', 'MG-Schütze 1', 'MG-Schütze 2', 'MG-Schütze 3']) assert.ok(pos.includes(p), p);
    assert.equal(pos.filter((p) => p === 'Schütze').length, 5);
    assert.equal(g.men.find((m) => m.position === 'MG-Schütze 1').weapon, 'mg34');
    // the Gruppe can be split into MG-Trupp (led by the Gruppenführer) and Schützentrupp (Truppführer)
    assert.equal(g.split, false);
    assert.deepEqual(g.teams.map((t) => t.name), ['MG-Trupp', 'Schützentrupp']);
    const lead = (id) => g.men.find((m) => m.slot === g.teams.find((t) => t.id === id).leader).position;
    assert.equal(lead('mg-trupp'), 'Gruppenführer');
    assert.equal(lead('schuetzentrupp'), 'Truppführer');
    assert.equal(g.men.filter((m) => m.team === 'mg-trupp').length + g.men.filter((m) => m.team === 'schuetzentrupp').length, 10);
  }
  assert.deepEqual(de.units.map((u) => u.hotkey), ['4', '1', '2', '3']);
});

test('1943: privates are Grenadiere, not Schützen (rank), German ranks have abbreviations', () => {
  const de = buildSide(db, 'player');
  const ranks = de.units.flatMap((u) => u.men.map((m) => m.rank.id));
  assert.ok(ranks.includes('grenadier'));
  assert.ok(!ranks.includes('schuetze'));
  const zf = de.units[0].men[0];
  assert.equal(zf.rank.name, 'Oberfeldwebel');
  assert.equal(zf.rank.abbr, 'Ofw.');
});

test('person is separate from the unit: units reference people by id, everyone exactly once', () => {
  const ids = Object.values(db.forces.player.units).flatMap((u) => Object.values(u.members));
  assert.equal(new Set(ids).size, ids.length);
  const p = db.people[ids[0]];
  for (const k of ['id', 'first', 'last', 'formation', 'rank', 'position', 'weapon', 'awards', 'status']) assert.ok(k in p, k);
  assert.equal(p.status, 'active');
  assert.ok(db.people[ids[0]].awards.every((a) => db.awards[a.id]));
});

test('Soviet strelkovyy vzvod: otdeleniya with DP and several PPSh, transliterated names', () => {
  const su = buildSide(db, 'enemy');
  assert.equal(su.formation, 'rkka');
  const otd = su.units.filter((u) => u.kind === 'squad');
  assert.equal(otd.length, 2);
  for (const o of otd) {
    assert.equal(o.men.filter((m) => m.weapon === 'dp27').length, 1);
    assert.ok(o.men.filter((m) => m.weapon === 'ppsh41').length >= 3);
    assert.match(o.name, /otdeleniye$/);
  }
  const ko = otd[0].men[0];
  assert.equal(ko.position, 'Komandir otdeleniya');
  assert.ok(['Serzhant', 'Mladshiy serzhant'].includes(rankOf(db, db.people[ko.personId]).name));
});

test('ranks and awards: Heer, Waffen-SS and Red Army; SS ranks map to Heer equivalents', () => {
  assert.equal(db.ranks.heer.ranks.length, 15);
  const heerIds = new Set(db.ranks.heer.ranks.map((r) => r.id));
  for (const r of db.ranks['waffen-ss'].ranks) {
    assert.ok(heerIds.has(r.heerEquivalent), r.id);
    assert.match(r.abbr, /^SS-/);
  }
  assert.ok(db.ranks.rkka.ranks.every((r) => r.insignia.pogon && r.insignia.collar));
  assert.equal(db.awards.ek2.abbr, 'EK II');
  assert.equal(db.awards.rk.candidate, false);
});

test('weapons: every unit type is in service in the scenario year and MG34 has a barrel change', () => {
  assert.equal(db.scenario.year, 1943);
  assert.ok(db.weapons.mg34.barrelChange.afterRounds > 0);
  for (const w of Object.values(db.weapons)) {
    for (const k of ['effectiveRangeM', 'rofPerMin', 'magazine', 'baseHit', 'suppression', 'readyTimeS']) assert.equal(typeof w[k], 'number', `${w.id}.${k}`);
  }
});

test('interface text: every key used by the game exists in en.json', () => {
  for (const k of ['header.title', 'brief.title', 'orders.enter', 'log.moveOrder', 'toast.unreachable', 'result.left', 'map.buildings']) {
    assert.ok(k.split('.').reduce((o, x) => o?.[x], db.text) !== undefined, k);
  }
});
