// Fire (DESIGN.md, Eld och rörelse; PROMPTER step 3 part A).
//
// - Line of sight on the threat-map grid: house walls block exactly (doors and
//   windows are open, as in terrain.los); cells with trees and bushes hinder sight
//   and lower the chance to hit, and enough of them block it.
// - Spotting: an enemy unit is visible to a side when one of that side's soldiers
//   has line of sight to one of its soldiers within the spotting range.
// - Every soldier fires on his own at a spotted enemy unit within his weapon's
//   range. Effect per round = weapon base hit × range × the unit's fire readiness
//   × the target's cover × the shooter's suppression (all parameters in
//   data/rules/fire.json and weapons.json).
// - Each fire event is laid into the threat map around the target, which raises
//   the target's suppression (condition.js); hits cause casualties.
import { W, H } from './config.js';
import { woods } from './scenario.js';
import { los, coverAt, buildingAt } from './terrain.js';
import { addSource, addCellSource } from './threat.js';
import { addImpacts, addTracers, addTrauma, effectRules } from './effects.js';
import { hitFactor, exposureFactor, barrelFactor } from './leaders.js';
import { random } from './rng.js';

let P = null;
let weapons = {};
let CELL = 20;
let COLS = 0;
let ROWS = 0;
let hinder = null; // Uint8Array: 1 = cell with trees or bushes

let MOVE = null; // movement modes (rules/orders.json): exposure and spotting factors
let SECTOR = null; // Cover Sector rules (rules/orders.json)

export function setFireRules(rules, weaponTable, cell, movement, sector) {
  P = rules;
  MOVE = movement ?? null;
  SECTOR = sector ?? null;
  weapons = weaponTable ?? {};
  CELL = cell;
  COLS = Math.ceil(W / CELL);
  ROWS = Math.ceil(H / CELL);
  hinder = new Uint8Array(COLS * ROWS);
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const x = (c + 0.5) * CELL;
      const y = (r + 0.5) * CELL;
      hinder[r * COLS + c] = woods.some((t) => Math.hypot(x - t.x, y - t.y) < t.r) ? 1 : 0;
    }
}

export const fireRules = () => P;
export const hindranceCell = (c, r) => hinder[r * COLS + c];

// Hindering cells strictly between a and b (the cells a and b stand in do not count).
export function hindrance(a, b) {
  const ca = Math.floor(a.x / CELL) + Math.floor(a.y / CELL) * COLS;
  const cb = Math.floor(b.x / CELL) + Math.floor(b.y / CELL) * COLS;
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(1, Math.ceil(d / (CELL / 4)));
  const seen = new Set();
  let count = 0;
  for (let k = 1; k < n; k++) {
    const x = a.x + ((b.x - a.x) * k) / n;
    const y = a.y + ((b.y - a.y) * k) / n;
    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
    const i = r * COLS + c;
    if (i === ca || i === cb || seen.has(i)) continue;
    seen.add(i);
    count += hinder[i];
  }
  return count;
}

// Line of sight: null when blocked, otherwise the number of hindering cells.
export function sight(a, b) {
  if (!los(a, b)) return null;
  const h = hindrance(a, b);
  return h > P.sight.blockAfterCells ? null : h;
}

const living = (s) => s.men.filter((m) => m.hp > 0);
const metres = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) * P.metresPerUnit;

// ---- Spotting ---------------------------------------------------------------

// spotted[side] = set of enemy squad ids that side can see. Own units are always
// visible to the player; enemy units only when spotted (s.visible).
export function updateSpotting(squads, state) {
  for (const side of [0, 1]) {
    const seen = new Set();
    const eyes = squads.filter((s) => s.side === side && living(s).length);
    for (const t of squads) {
      if (t.side === side || !living(t).length) continue;
      const range = P.spotting.rangeUnits * movementOf(t).spotFactor;
      const found = eyes.some((s) =>
        living(s).some((a) => living(t).some((b) => Math.hypot(a.x - b.x, a.y - b.y) < range && sight(a, b) !== null)),
      );
      if (found) seen.add(t.id);
    }
    state.spotted[side] = seen;
  }
  for (const s of squads) s.visible = !s.side || state.spotted[0].has(s.id);
}

// ---- Fire -------------------------------------------------------------------

// How a unit is moving right now (crawling units are harder to see and hit,
// running ones easier).
const STILL = { exposure: 1, spotFactor: 1 };
export function movementOf(t) {
  if (!MOVE || !t.advancing) return STILL;
  return MOVE[t.routed ? 'broken' : t.moveMode ?? 'move'] ?? STILL;
}

// Range factor: full effect within the weapon's effective range, falling to zero
// at its maximum range.
export function rangeFactor(w, m) {
  if (m <= w.effectiveRangeM) return 1;
  if (m >= w.maxRangeM) return 0;
  return 1 - (m - w.effectiveRangeM) / (w.maxRangeM - w.effectiveRangeM);
}

// Seconds between fire events for one soldier with weapon w.
export function fireInterval(w) {
  const rounds = P.fire.roundsPerEvent[w.type] ?? 1;
  return (rounds * 60) / w.rofPerMin;
}

// Chance per round that a round from shooter m (unit s) hits victim v (unit t).
export function hitChance(w, s, m, t, v, hinderCells) {
  const F = P.fire;
  const ready = F.readinessFloor + (1 - F.readinessFloor) * (s.cond.readiness / 100);
  const cover = Math.min(0.9, coverAt(v.x, v.y) + (t.cond.pinned || t.order === 'defend' ? F.proneCover : 0));
  const shooterSup = 1 - F.shooterSuppressionPenalty * (s.cond.suppression / 100);
  const lead = hitFactor(s, m, v, metres(m, v), !!buildingAt(v.x, v.y));
  return w.baseHit * F.hitScale * rangeFactor(w, metres(m, v)) * ready * (1 - cover) * shooterSup * lead * movementOf(t).exposure * exposureFactor(t) * P.sight.perCellHitFactor ** hinderCells;
}

// ---- Cover Sector (DESIGN.md, Defensiv eld och bevakningssektorer) -----------
// s.sector = { dir, half (radians), range (units), opening (units), open, lastSeen }.
// Inside: within the cone's angle and range, seen from the unit's centre.
export function inSector(s, p, range = s.sector.range) {
  const d = Math.hypot(p.x - s.x, p.y - s.y);
  if (d > range) return false;
  let a = Math.atan2(p.y - s.y, p.x - s.x) - s.sector.dir;
  a = Math.atan2(Math.sin(a), Math.cos(a));
  return Math.abs(a) <= s.sector.half;
}

// Opening range: hold fire until an enemy in the sector is within it; then fire
// on anything in the sector until it has been empty for reopenS seconds.
function updateSectorOpen(s, squads, state) {
  const sec = s.sector;
  const inside = squads.filter((t) => t.side !== s.side && state.spotted[s.side].has(t.id) && living(t).some((v) => inSector(s, v)));
  if (inside.length) sec.lastSeen = state.elapsed;
  if (!sec.open && inside.some((t) => living(t).some((v) => inSector(s, v, Math.min(sec.opening, sec.range))))) sec.open = true;
  if (sec.open && state.elapsed - (sec.lastSeen ?? -1e9) > SECTOR.reopenS) sec.open = false;
  return inside;
}

// The sector's cells that can be seen from the unit (cached while it stands still).
export function sectorCells(s) {
  const sec = s.sector;
  const key = `${Math.round(s.x)},${Math.round(s.y)},${sec.dir},${sec.half},${sec.range}`;
  if (sec.cellsKey === key) return sec.cells;
  const cells = new Set();
  const c0 = Math.max(0, Math.floor((s.x - sec.range) / CELL));
  const c1 = Math.min(COLS - 1, Math.floor((s.x + sec.range) / CELL));
  const r0 = Math.max(0, Math.floor((s.y - sec.range) / CELL));
  const r1 = Math.min(ROWS - 1, Math.floor((s.y + sec.range) / CELL));
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const p = { x: (c + 0.5) * CELL, y: (r + 0.5) * CELL };
      if (inSector(s, p) && sight(s, p) !== null) cells.add(r * COLS + c);
    }
  sec.cells = cells;
  sec.cellsKey = key;
  return cells;
}

// The unit's current target: nearest spotted enemy unit that at least one of its
// soldiers can see and reach. Re-chosen every targetRetargetS seconds.
function chooseTarget(s, squads, state) {
  const men = living(s);
  // Cover Sector: only enemies inside the cone, and only once fire is opened.
  if (s.sector) {
    const inside = updateSectorOpen(s, squads, state);
    if (!s.sector.open) return null;
    return (
      inside
        .sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))
        .find((t) => men.some((m) => weapons[m.weapon] && living(t).some((v) => inSector(s, v) && metres(m, v) < weapons[m.weapon].maxRangeM && sight(m, v) !== null))) ?? null
    );
  }
  // A Fire order: the ordered target first, while it lives and is spotted.
  const ordered = s.fireTarget != null ? squads[s.fireTarget] : null;
  if (ordered && !living(ordered).length) {
    s.fireTarget = null;
    if (s.order === 'fire') s.order = 'hold';
  } else if (ordered && state.spotted[s.side].has(ordered.id) && men.some((m) => living(ordered).some((v) => weapons[m.weapon] && metres(m, v) < weapons[m.weapon].maxRangeM && sight(m, v) !== null))) {
    return ordered;
  }
  const options = squads
    .filter((t) => t.side !== s.side && living(t).length && state.spotted[s.side].has(t.id))
    .sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
  return (
    options.find((t) =>
      men.some((m) => {
        const w = weapons[m.weapon];
        return w && living(t).some((v) => metres(m, v) < w.maxRangeM && sight(m, v) !== null);
      }),
    ) ?? null
  );
}

// One update of fire for unit s. `ev` = { log(key, params), shot(squad), effect(e) }.
export function fireUnit(s, dt, squads, state, ev) {
  // A barrel change runs its course whether or not the unit has a target.
  for (const m of s.men) {
    if (m.barrelChange > 0) {
      m.barrelChange = Math.max(0, m.barrelChange - dt);
      if (m.barrelChange === 0 && m.hp > 0) ev.log('log.barrelDone', { unit: s.name });
    }
  }
  // Broken units and units carrying out a Retreat order do not fire.
  if (s.routed || (s.order === 'retreat' && s.advancing)) return;
  s.retarget = (s.retarget ?? 0) - dt;
  // A sector unit re-checks every update: it must hold fire the moment the
  // sector empties or before the enemy is inside the opening range.
  if (s.sector || s.retarget <= 0 || (s.target && !living(s.target).length)) {
    s.target = chooseTarget(s, squads, state);
    s.retarget = P.fire.targetRetargetS;
  }
  const t = s.target;
  if (!t) return;
  for (const m of living(s)) {
    const w = weapons[m.weapon];
    if (!w || w.type === 'mortar') continue; // the mortar fires indirectly (fireMortar)
    m.fireTimer = (m.fireTimer ?? random() * fireInterval(w)) - dt;
    if (m.fireTimer > 0 || m.ammo <= 0 || m.barrelChange > 0) continue;
    const victims = living(t)
      .filter((v) => !s.sector || inSector(s, v))
      .map((v) => ({ v, h: metres(m, v) < w.maxRangeM ? sight(m, v) : null }))
      .filter((x) => x.h !== null);
    m.fireTimer = fireInterval(w) * (1 + P.fire.intervalJitter * (2 * random() - 1));
    if (!victims.length) continue;
    const { v, h } = victims[Math.floor(random() * victims.length)];
    const rounds = Math.min(m.ammo, P.fire.roundsPerEvent[w.type] ?? 1);
    m.ammo -= rounds;
    // MG: after a number of rounds the hot barrel must be changed; the gun is
    // silent meanwhile and the unit's fire readiness stops building (condition.js).
    if (w.barrelChange) {
      m.roundsSinceChange = (m.roundsSinceChange ?? 0) + rounds;
      if (m.roundsSinceChange >= w.barrelChange.afterRounds) {
        m.roundsSinceChange = 0;
        m.barrelChange = w.barrelChange.durationS * barrelFactor(s);
        ev.log('log.barrelChange', { unit: s.name, weapon: w.name });
      }
    }
    m.flash = 0.12;
    m.aim = 1.2;
    m.angle = Math.atan2(v.y - m.y, v.x - m.x);
    shootAt(s, m, w, t, v, h, rounds, state, ev);
  }
}

function shootAt(s, m, w, t, v, h, rounds, state, ev) {
  const E = P.effectOnTarget;
  // A unit covering a sector sweeps it: the whole visible cone is dangerous while it fires.
  if (s.sector) {
    addCellSource({
      id: `sector:${s.id}:${state.elapsed.toFixed(2)}:${m.idx}`,
      cells: sectorCells(s),
      intensity: ((w.suppression * rounds) / P.effectOnTarget.intensityDivisor) * SECTOR.sweepFactor,
      by: s.id,
      sides: [t.side],
      life: SECTOR.sweepLifeS,
    });
  }
  // Into the threat map around the target: this is what raises its suppression.
  const cover = coverAt(v.x, v.y);
  addSource({ x: v.x, y: v.y, radius: E.radius, life: E.lifeS, by: s.id, sides: [t.side], intensity: ((w.suppression * rounds) / E.intensityDivisor) * (1 - E.coverFactor * cover) });
  // Direction of incoming fire, for flanking.
  t.cond.incoming.push({ at: state.elapsed, angle: Math.atan2(m.y - t.y, m.x - t.x) });
  const p = hitChance(w, s, m, t, v, h);
  let hits = 0;
  for (let k = 0; k < rounds && v.hp > 0; k++) {
    if (random() < p) {
      hits++;
      v.hp -= P.fire.damageMin + random() * (P.fire.damageMax - P.fire.damageMin);
      if (v.hp <= 0) ev.log(t.side ? 'log.enemyCasualty' : 'log.casualty', { unit: t.name });
    }
  }
  const seen = !s.side || s.visible;
  s.lastContact = t.lastContact = state.elapsed;
  ev.effect({ kind: 'shot', x: m.x, y: m.y, tx: v.x, ty: v.y, life: 0.1, visible: seen, weapon: w.type, hit: hits > 0 });
  // Impacts on the material where the rounds land, tracers for MG bursts.
  addImpacts(state, m, v, rounds, hits);
  addTracers(state, w, m, v, rounds, seen);
  if (seen) ev.shot(s);
}

// Flanked: fire from two directions more than minAngleDeg apart within windowS.
export function flanked(s, now) {
  const F = P.flanking;
  s.cond.incoming = s.cond.incoming.filter((f) => now - f.at <= F.windowS);
  const a = s.cond.incoming;
  const lim = (F.minAngleDeg * Math.PI) / 180;
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++) {
      let d = Math.abs(a[i].angle - a[j].angle) % (2 * Math.PI);
      if (d > Math.PI) d = 2 * Math.PI - d;
      if (d > lim) return true;
    }
  return false;
}

// ---- Hand grenades ----------------------------------------------------------
// In close combat a unit that is not advancing can throw a grenade at its target:
// a soldier with a grenade and a rifle or SMG, the target within his throwing
// range. It lands near the target and goes off after the fuse time.

export function grenadesFor(nation, weaponId) {
  const G = P.grenades;
  const w = weapons[weaponId];
  return w && G.throwers.includes(w.type) && G.byNation[nation] ? G.perMan : 0;
}

export function throwGrenades(s, dt, state) {
  const G = P.grenades;
  s.grenadeTimer = (s.grenadeTimer ?? G.checkS * random()) - dt;
  if (s.grenadeTimer > 0) return;
  s.grenadeTimer = G.checkS;
  const t = s.target;
  if (!t || s.routed || s.advancing || random() >= G.chancePerCheck) return;
  const g = weapons[G.byNation[s.nation]];
  if (!g) return;
  let best = null;
  for (const m of living(s)) {
    if (!(m.grenades > 0)) continue;
    for (const v of living(t)) {
      const d = metres(m, v);
      if (d < G.minRangeM || d > g.throwRangeM || sight(m, v) === null) continue;
      if (!best || d < best.d) best = { m, v, d };
    }
  }
  if (!best) return;
  const { m, v } = best;
  m.grenades--;
  m.aim = 1;
  m.angle = Math.atan2(v.y - m.y, v.x - m.x);
  const r = (G.scatterM / P.metresPerUnit) * Math.sqrt(random());
  const a = random() * Math.PI * 2;
  state.pending.push({ kind: 'grenade', at: state.elapsed + g.fuseS, x: v.x + Math.cos(a) * r, y: v.y + Math.sin(a) * r, weapon: g.id, by: s.id, side: s.side });
  state.effects.push({ kind: 'thrown', x0: m.x, y0: m.y, x1: v.x, y1: v.y, life: 0.8, max: 0.8, visible: !s.side || s.visible });
}

// Can the player know about something at (x, y)? Own side did it, or an own
// soldier is close by or can see the spot.
export function playerKnows(squads, x, y, ownSide) {
  if (ownSide === 0) return true;
  const p = { x, y };
  return squads.some((s) => !s.side && living(s).some((m) => {
    const d = Math.hypot(m.x - x, m.y - y);
    return d < 60 || (d < P.spotting.rangeUnits && sight(m, p) !== null);
  }));
}

export function detonate(e, squads, state, ev, focus) {
  const G = P.grenades;
  const g = weapons[e.weapon];
  const lethal = g.lethalRadiusM / P.metresPerUnit;
  const blast = g.blastRadiusM / P.metresPerUnit;
  for (const s of squads) {
    let hitHere = false;
    for (const m of living(s)) {
      const d = Math.hypot(m.x - e.x, m.y - e.y);
      if (d < blast) hitHere = true;
      if (d >= lethal || !los(e, m)) continue;
      const cover = buildingAt(m.x, m.y) ? 0 : coverAt(m.x, m.y);
      const prone = s.cond.pinned || s.order === 'defend' ? 0.6 : 1;
      if (random() < g.baseHit * (1 - d / lethal) * (1 - G.coverFactor * cover) * prone) {
        m.hp = 0;
        ev.log(s.side ? 'log.enemyCasualty' : 'log.casualty', { unit: s.name });
      }
    }
    if (hitHere) s.lastContact = state.elapsed;
  }
  addSource({ x: e.x, y: e.y, radius: Math.max(1, Math.floor(blast / 2 / CELL)), life: G.threatLifeS, by: e.by, sides: [0, 1], intensity: g.suppression / 100 });
  const known = playerKnows(squads, e.x, e.y, e.side);
  state.effects.push({ kind: 'explosion', x: e.x, y: e.y, r: blast, life: 1.4, max: 1.4, seed: random(), visible: known });
  if (known) {
    addTrauma(state, e.x, e.y, g.type === 'mortar' ? effectRules().shake.mortarTrauma : effectRules().shake.grenadeTrauma, focus);
    ev.boom(e.x);
  }
}

// ---- Mortar (Granatwerfergruppe, steg 7) --------------------------------------
// Indirect fire at s.mortarTarget: no line of sight needed, only range. Fires when
// the unit stands still and is ready; shells land after the flight time.
export const mortarOf = (s) => living(s).map((m) => ({ m, w: weapons[m.weapon] })).find((x) => x.w?.type === 'mortar') ?? null;

export function mortarInRange(s, x, y) {
  const mo = mortarOf(s);
  if (!mo) return false;
  const d = metres(mo.m, { x, y });
  return d >= (mo.w.minRangeM ?? 0) && d <= mo.w.maxRangeM;
}

export function fireMortar(s, dt, state, ev) {
  const tgt = s.mortarTarget;
  if (!tgt || s.routed || s.advancing) return;
  for (const m of living(s)) {
    const w = weapons[m.weapon];
    if (w?.type !== 'mortar') continue;
    m.fireTimer = (m.fireTimer ?? 0) - dt;
    if (m.fireTimer > 0 || m.ammo <= 0 || s.cond.readiness < P.mortar.minReadiness) continue;
    m.fireTimer = (60 / w.rofPerMin) * (1 + P.mortar.intervalJitter * (2 * random() - 1));
    m.ammo -= 1;
    const spread = (w.scatterM / P.metresPerUnit) * (1.5 - s.cond.readiness / 200) * Math.sqrt(random());
    const a = random() * Math.PI * 2;
    state.pending.push({ kind: 'shell', at: state.elapsed + w.flightS, x: tgt.x + Math.cos(a) * spread, y: tgt.y + Math.sin(a) * spread, weapon: w.id, by: s.id, side: s.side });
    m.flash = 0.2;
    state.effects.push({ kind: 'launch', x: m.x, y: m.y, life: 0.9, max: 0.9, visible: !s.side || s.visible });
    if (!s.side || s.visible) ev.shot(s);
  }
}
