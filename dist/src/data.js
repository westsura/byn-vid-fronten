// Game data: loads the JSON files in dist/data, checks them and builds the forces
// the battle uses. The same code runs in the browser (fetch) and in the tests
// (readFileSync); the caller passes `read(path)` returning the parsed JSON.

const RANK_FILES = ['heer', 'waffen-ss', 'rkka'];
const AWARD_FILES = ['de', 'su'];

export async function loadData(read, scenarioId = 'proto-1943') {
  const scenario = await read(`scenarios/${scenarioId}.json`);
  const [weapons, text, ...rest] = await Promise.all([
    read('weapons.json'),
    read('text/en.json'),
    ...RANK_FILES.map((f) => read(`ranks/${f}.json`)),
    ...AWARD_FILES.map((f) => read(`awards/${f}.json`)),
  ]);
  const ranks = Object.fromEntries(rest.slice(0, RANK_FILES.length).map((r) => [r.formation, r]));
  const awards = Object.fromEntries(rest.slice(RANK_FILES.length).flatMap((a) => a.awards.map((x) => [x.id, x])));
  const forces = {};
  const units = {};
  const people = {};
  for (const side of ['player', 'enemy']) {
    const f = await read(`forces/${scenario[side].forces}.json`);
    forces[side] = f;
    units[f.nation] ??= await read(`units/${f.unitsFile}.json`);
    for (const p of (await read(`people/${f.peopleFile}.json`)).people) people[p.id] = p;
  }
  return {
    scenario,
    text,
    weapons: Object.fromEntries(weapons.weapons.map((w) => [w.id, w])),
    ranks,
    awards,
    units,
    forces,
    people,
  };
}

const inYears = (range, year) => !range || (year >= range[0] && year <= range[1]);
const unitType = (db, nation, id) => db.units[nation]?.unitTypes.find((t) => t.id === id);

// Returns a list of problems (empty when the data is consistent).
export function validate(db) {
  const errors = [];
  const year = db.scenario.year;
  const seen = new Set();
  for (const side of ['player', 'enemy']) {
    const f = db.forces[side];
    const u = db.units[f.nation];
    if (!u) errors.push(`${f.id}: no unit file for nation ${f.nation}`);
    const platoon = unitType(db, f.nation, f.unitType);
    if (!platoon) errors.push(`${f.id}: unknown unit type ${f.unitType}`);
    else if (!inYears(platoon.validYears, year)) errors.push(`${f.id}: ${platoon.id} not valid in ${year}`);
    for (const unit of f.units) {
      const t = unitType(db, f.nation, unit.type);
      if (!t) {
        errors.push(`${f.id}/${unit.id}: unknown unit type ${unit.type}`);
        continue;
      }
      if (!inYears(t.validYears, year)) errors.push(`${unit.id}: ${t.id} not valid in ${year}`);
      if (!db.scenario[side].placements[unit.id]) errors.push(`${unit.id}: no placement in ${db.scenario.id}`);
      for (const team of t.teams ?? []) {
        for (const s of team.slots) if (!t.slots.some((x) => x.slot === s)) errors.push(`${t.id}: team ${team.id} has unknown slot ${s}`);
      }
      for (const [slot, pid] of Object.entries(unit.members)) {
        const def = t.slots.find((s) => s.slot === slot);
        if (!def) errors.push(`${unit.id}: unknown slot ${slot}`);
        const p = db.people[pid];
        if (!p) {
          errors.push(`${unit.id}/${slot}: unknown person ${pid}`);
          continue;
        }
        if (seen.has(pid)) errors.push(`${pid} is in more than one unit`);
        seen.add(pid);
        if (def && p.position !== def.position) errors.push(`${pid}: position ${p.position} ≠ slot ${def.position}`);
        const rank = db.ranks[p.formation]?.ranks.find((r) => r.id === p.rank);
        if (!rank) errors.push(`${pid}: unknown rank ${p.rank} in ${p.formation}`);
        else if (!inYears(rank.validYears, year)) errors.push(`${pid}: rank ${p.rank} not used in ${year}`);
        if (p.weapon && !db.weapons[p.weapon]) errors.push(`${pid}: unknown weapon ${p.weapon}`);
        else if (p.weapon && !inYears(db.weapons[p.weapon].validYears, year)) errors.push(`${pid}: ${p.weapon} not in service in ${year}`);
        for (const a of p.awards) if (!db.awards[a.id]) errors.push(`${pid}: unknown award ${a.id}`);
      }
      for (const s of t.slots) if (!unit.members[s.slot]) errors.push(`${unit.id}: slot ${s.slot} is empty`);
    }
    for (const [pos, def] of Object.entries(u?.positions ?? {})) {
      if (def.weapon && !db.weapons[def.weapon]) errors.push(`position ${pos}: unknown weapon ${def.weapon}`);
      if (!db.ranks[f.formation]?.ranks.some((r) => r.id === def.prescribedRank)) errors.push(`position ${pos}: unknown rank ${def.prescribedRank}`);
    }
  }
  return errors;
}

export const rankOf = (db, p) => db.ranks[p.formation].ranks.find((r) => r.id === p.rank);

// Builds one side for the simulation: units in force-file order, each with its
// men (one per filled slot, in slot order) and the data needed to draw and name them.
export function buildSide(db, side) {
  const f = db.forces[side];
  const u = db.units[f.nation];
  const keys = Object.entries(db.scenario[side].hotkeys ?? {});
  return {
    nation: f.nation,
    formation: f.formation,
    name: f.name,
    units: f.units.map((unit) => {
      const t = unitType(db, f.nation, unit.type);
      const [x, y] = db.scenario[side].placements[unit.id];
      return {
        id: unit.id,
        name: unit.name,
        kind: t.kind,
        type: t.id,
        x,
        y,
        hotkey: keys.find(([, id]) => id === unit.id)?.[0] ?? null,
        split: unit.split ?? false,
        teams: t.teams ?? null,
        leaderSlot: t.leader,
        deputySlot: t.deputy,
        men: t.slots
          .filter((s) => unit.members[s.slot])
          .map((s) => {
            const p = db.people[unit.members[s.slot]];
            const pos = u.positions[s.position];
            const weapon = p.weapon ? db.weapons[p.weapon] : null;
            return {
              personId: p.id,
              slot: s.slot,
              name: `${p.first} ${p.last}`,
              last: p.last,
              rank: rankOf(db, p),
              position: pos.name,
              weapon: p.weapon,
              sprite: s.sprite ?? pos.sprite,
              role: s.slot === t.leader ? 'leader' : weapon?.type === 'lmg' ? 'mg' : 'rifleman',
              team: t.teams?.find((tm) => tm.slots.includes(s.slot))?.id ?? null,
            };
          }),
      };
    }),
  };
}
