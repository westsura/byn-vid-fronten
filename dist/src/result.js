// Battle result (step 8): outcome, losses per unit and every person's fate, in a
// structure a campaign can read later (people with status). No campaign is built.
// Status per person: 'active' (unharmed), 'lightlyWounded' (hit but still fighting),
// 'badlyWounded' or 'killed' (out of action; data/rules/result.json decides which).
import { buildingCounts, mission } from './mission.js';
import { leaderName } from './sim.js';

let R = null;
export function setResultRules(rules) {
  R = rules;
}

export function personStatus(m) {
  if (m.hp >= 100) return 'active';
  if (m.hp > 0) return 'lightlyWounded';
  return m.hp <= R.killedBelow ? 'killed' : 'badlyWounded';
}

export function battleResult(state, scenario, outcome, reasonKey, params) {
  const units = state.squads.filter((s) => !s.absorbed);
  // A split Gruppe is reported as one unit again.
  const byGroup = new Map();
  for (const s of units) {
    const key = `${s.side}:${s.group}`;
    const g = byGroup.get(key) ?? { side: s.side, id: s.group, name: s.groupName ?? s.name, men: [], broken: false };
    g.men.push(...s.men);
    g.broken ||= !!s.cond?.broken;
    byGroup.set(key, g);
  }
  const groups = [...byGroup.values()].map((g) => {
    const status = g.men.map(personStatus);
    return {
      side: g.side,
      id: g.id,
      name: g.name,
      strength: g.men.length,
      fit: g.men.filter((m) => m.hp > 0).length,
      killed: status.filter((x) => x === 'killed').length,
      badlyWounded: status.filter((x) => x === 'badlyWounded').length,
      lightlyWounded: status.filter((x) => x === 'lightlyWounded').length,
      broken: g.broken,
    };
  });
  const people = units.flatMap((s) => s.men.map((m) => ({ id: m.personId, side: s.side, unit: s.group, status: personStatus(m) })));
  const leaders = units
    .filter((s) => !s.side)
    .flatMap((s) => s.men.filter((m) => m.leader).map((m) => ({ id: m.personId, name: leaderName(m), position: m.title, unit: s.groupName ?? s.name, status: personStatus(m) })));
  return {
    scenario: scenario.id,
    year: scenario.year,
    outcome,
    reason: { key: reasonKey, params: params ?? {} },
    elapsedS: Math.round(state.elapsed),
    mission: mission()?.type,
    building: mission()?.type === 'building' ? buildingCounts(state).fit : null,
    groups,
    leaders,
    people,
  };
}

// Keep the last result in the browser for a later campaign (best effort).
export function saveResult(result) {
  try {
    globalThis.localStorage?.setItem('bvf.lastResult', JSON.stringify(result));
    return true;
  } catch {
    return false;
  }
}
