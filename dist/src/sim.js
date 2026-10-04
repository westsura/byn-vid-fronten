// Battle simulation: squads, orders, movement, fire, unit state and mission end.
// No DOM access here — the UI listens to events emitted through `hooks`.
import { MISSION_TIME, HOLD_TIME, W, H } from './config.js';
import { objective } from './scenario.js';
import { t } from './text.js';
import { seedRandom } from './rng.js';
import { dist, buildingAt, blocked, canWalk, coverAt, interiorSlots } from './terrain.js';
import { pathTo } from './nav.js';
import { setThreatRules, resetThreat, stepThreat, CELL } from './threat.js';
import { setFireRules, updateSpotting, fireUnit, grenadesFor, throwGrenades, detonate } from './fire.js';
import { setEffectRules, stepEffects } from './effects.js';
import { setConditionRules, newCondition, updateCondition } from './condition.js';

export const state = {
  squads: [],
  selected: 0,
  paused: true,
  started: false,
  ended: false,
  won: false,
  elapsed: 0,
  capture: 0,
  effects: [],
  logs: [],
  mode: 'move',
  debug: false,
};

// Set by the UI layer. Kept as no-ops so the simulation runs headless in tests.
export const hooks = {
  changed() {},
  toast() {},
  shot() {},
  boom() {},
  finished() {},
};

export const alive = (s) => s.men.filter((m) => m.hp > 0);
// Own units shown in the panel (a merged-away half is not a unit of its own).
// Order: the force file's order, the two halves of a split Gruppe side by side.
const unitOrder = (s) => forces.player.units.findIndex((u) => u.id === s.group) * 10 + (s.team ? s.teams.findIndex((tm) => tm.id === s.team) : 0);
export const playerSquads = () => state.squads.filter((s) => !s.side && !s.absorbed).sort((a, b) => unitOrder(a) - unitOrder(b));

export function soldierPose(m, s) {
  if (m.hp <= 0) return 'fallen';
  const c = s.cond;
  if (!s.routed && (c?.pinned || c?.suppression > 25 || s.order === 'defend')) return 'prone';
  return m.moving ? 'walk' : 'ready';
}

function addLog(text) {
  state.logs.unshift({ t: Math.floor(state.elapsed), text });
  state.logs = state.logs.slice(0, 5);
}

// ---- Forces ------------------------------------------------------------------
// A force is one side as built from the data files (see data.js buildSide):
// { nation, formation, name, units: [{ id, name, kind, x, y, hotkey, men: [...] }] }.
let forces = null;

export function setForces(f) {
  forces = f;
}
export const currentForces = () => forces;

let weapons = {};
let orderRules = null;
let effectRules = null;
// State-model, threat-map and fire parameters (data/rules/condition.json) and the weapon table.
export function setRules(db) {
  setThreatRules(db.rules.condition);
  setConditionRules(db.rules.condition, db.weapons);
  setFireRules(db.rules.fire, db.weapons, CELL);
  orderRules = db.rules.orders;
  setEffectRules(db.rules.effects);
  effectRules = db.rules.effects;
  fireRulesCheck = db.rules.fire.spotting.checkS;
  weapons = db.weapons;
}

// Order states are keys; the interface text comes from data/text/en.json.
export const orderText = (s) => t('orders.' + s.order, { house: s.orderHouse != null ? houseName(s.orderHouse) : '' });
export const houseName = (id) => t('map.buildings')?.[id] ?? `#${id}`;

// Formation offsets for n soldiers: rows of 3 (n <= 6) or 4, spacing 20 × 23
// times the force's spacing factor (1 unless a prototype asks for wider spacing).
// For n = 5 and factor 1 this is exactly the original layout.
export function formationOffset(i, n) {
  const f = forces?.spacing ?? 1;
  const cols = n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  return { x: ((i % cols) - (cols - 1) / 2) * 20 * f, y: (Math.floor(i / cols) - (rows - 1) / 2) * 23 * f };
}

function makeSquad(unit, id, side) {
  const s = buildSquad(unit, id, side);
  s.cond = newCondition(s);
  return s;
}

function buildSquad(unit, id, side) {
  const { x, y } = unit;
  const roster = unit.men;
  return {
    id, x, y, side,
    name: unit.name,
    unitId: unit.id,
    kind: unit.kind,
    hotkey: unit.hotkey ?? null,
    teams: unit.teams ?? null,
    split: unit.split ?? false,
    group: unit.id, // the Gruppe a half belongs to
    team: null, // 'mg-trupp' / 'schuetzentrupp' while split
    leaderSlot: unit.leaderSlot ?? null,
    groupName: unit.name,
    absorbed: false,
    nation: side ? forces.enemy.nation : forces.player.nation,
    faction: (side ? forces.enemy.nation : forces.player.nation) === 'de' ? 'german' : 'soviet',
    order: 'hold',
    orderHouse: null,
    path: [],
    visible: !side,
    lastAI: 0,
    routed: false,
    target: null,
    men: roster.map((def, i) => {
      const o = formationOffset(i, roster.length);
      return {
        x: x + o.x,
        y: y + o.y,
        hp: 100,
        angle: side ? Math.PI : 0,
        phase: i * 1.73,
        idx: i,
        stride: 0,
        walked: (i * 11) % 28, // distance walked (units); drives sprite walk cycles, offset so men are out of step
        moving: false,
        flash: 0,
        aim: 0,
        role: def.role,
        weapon: def.weapon,
        ammo: weapons[def.weapon] ? weapons[def.weapon].ammoCarried + weapons[def.weapon].magazine : 0,
        grenades: grenadesFor(side ? forces.enemy.nation : forces.player.nation, def.weapon),
        roundsSinceChange: 0, // MG: rounds fired on the current barrel
        barrelChange: 0, // MG: seconds left of a barrel change
        ammoFull: weapons[def.weapon] ? weapons[def.weapon].ammoCarried + weapons[def.weapon].magazine : 0,
        fireTimer: null,
        sprite: def.sprite ?? null,
        personId: def.personId ?? null,
        name: def.name ?? null,
        last: def.last ?? null,
        rank: def.rank ?? null,
        title: def.position ?? null,
        slot: def.slot ?? null,
        team: def.team ?? null,
        coverPoint: null,
        coverTimer: 0,
        route: null,
        routeGoal: null,
        stuck: 0,
      };
    }),
  };
}

export function reset() {
  seedRandom(12345);
  resetThreat();
  Object.assign(state, {
    squads: [...forces.player.units.map((u, i) => makeSquad(u, i, 0)), ...forces.enemy.units.map((u, i) => makeSquad(u, forces.player.units.length + i, 1))],
    selected: Math.max(0, forces.player.units.findIndex((u) => u.hotkey === '1')),
    paused: true,
    started: false,
    ended: false,
    won: false,
    elapsed: 0,
    capture: 0,
    effects: [],
    logs: [],
    mode: 'move',
    debug: state.debug,
    spotted: [new Set(), new Set()],
    spotTimer: 0,
    pending: [], // grenades in the air
    trauma: 0, // camera shake (effects.js)
    view: state.view ?? { x: 0, y: 0, w: W, h: H }, // the part of the map on screen (set by render.js)
  });
  addLog(t('log.ready', { units: forces.player.units.length }));
  hooks.changed();
}

export function select(id) {
  const s = state.squads[id];
  if (!s || s.side || !alive(s).length) return;
  state.selected = id;
  hooks.changed();
}

export function setMode(mode) {
  state.mode = mode;
  hooks.changed();
}

export function issue(x, y) {
  const s = state.squads[state.selected];
  if (state.ended || !s || !alive(s).length) return false;
  if (s.routed) {
    hooks.toast(t('toast.recovering'));
    return false;
  }
  x = Math.max(10, Math.min(1190, x));
  y = Math.max(10, Math.min(790, y));
  const house = buildingAt(x, y);
  if (house) {
    x = house.midX;
    y = house.midY;
  }
  const path = pathTo(s, x, y);
  if (!path) {
    hooks.toast(t('toast.unreachable'));
    return false;
  }
  s.path = path;
  s.destinationHouse = house?.id ?? null;
  s.order = house ? 'enter' : state.mode === 'defend' ? 'position' : 'move';
  s.orderHouse = house?.id ?? null;
  s.defendAtEnd = !!house || state.mode === 'defend';
  addLog(house ? t('log.enterOrder', { unit: s.name, house: houseName(house.id) }) : t('log.moveOrder', { unit: s.name }));
  state.effects.push({ kind: 'order', x, y, life: 1.5 });
  hooks.changed();
  return true;
}

export function defend() {
  const s = state.squads[state.selected];
  if (state.ended || !s || !alive(s).length || s.routed) return;
  s.path = [];
  s.order = 'defend';
  state.mode = 'defend';
  addLog(t('log.defend', { unit: s.name }));
  hooks.changed();
}

// ---- Split and merge (DESIGN.md, Gruppen) ------------------------------------
// A Gruppe splits into MG-Trupp (led by the Gruppenführer) and Schützentrupp (led
// by the Truppführer). The Gruppe's object becomes the MG-Trupp; the Schützentrupp
// is a second unit object that is reused if the Gruppe splits again. Both halves
// inherit the Gruppe's state values.
const teamName = (s, team) => t('units.teamName', { unit: s.groupName, team: team.name });
const halfOf = (s) => state.squads.find((o) => o !== s && o.group === s.group && o.side === s.side && o.team && !o.absorbed);

export function canSplit(s) {
  if (!s || s.side || s.routed || !s.teams || s.team || !alive(s).length) return false;
  return s.teams.every((tm) => s.men.some((m) => m.slot === tm.leader && m.hp > 0));
}

export function split(id = state.selected) {
  const s = state.squads[id];
  if (state.ended || !s) return false;
  if (s.team) return merge(id);
  if (!canSplit(s)) {
    hooks.toast(t(s?.routed ? 'toast.recovering' : 'toast.cannotSplit'));
    return false;
  }
  const [ta, tb] = s.teams;
  let b = state.squads.find((o) => o.group === s.group && o.absorbed);
  if (!b) {
    b = { ...s, id: state.squads.length, hotkey: null, cond: { ...s.cond, incoming: [] } };
    state.squads.push(b);
  }
  const menB = s.men.filter((m) => m.team === tb.id);
  // Schützentrupp a little behind, on the side away from the enemy (west for the player).
  const back = orderRules.split.offsetUnits * (s.side ? 1 : -1);
  Object.assign(b, {
    absorbed: false,
    name: teamName(s, tb),
    team: tb.id,
    leaderSlot: tb.leader,
    men: menB,
    x: s.x + back,
    y: s.y,
    path: [],
    order: 'hold',
    orderHouse: null,
    routed: false,
    target: null,
    hotkey: null,
    cond: { ...s.cond, incoming: [], aliveSeen: menB.filter((m) => m.hp > 0).length, losses: menB.filter((m) => m.hp <= 0).length },
  });
  if (blocked(b.x, b.y) || !canWalk(s, b)) Object.assign(b, { x: s.x, y: s.y });
  s.men = s.men.filter((m) => m.team === ta.id);
  s.name = teamName(s, ta);
  s.team = ta.id;
  s.leaderSlot = ta.leader;
  s.cond.aliveSeen = alive(s).length;
  s.cond.losses = s.men.length - alive(s).length;
  s.split = b.split = true;
  addLog(t('log.split', { unit: s.groupName }));
  hooks.changed();
  return true;
}

export function merge(id = state.selected) {
  const a0 = state.squads[id];
  const other = a0 && halfOf(a0);
  if (state.ended || !a0?.team || !other) return false;
  // The Gruppe's own object (the first team, MG-Trupp) takes the men back.
  const [a, b] = a0.team === a0.teams[0].id ? [a0, other] : [other, a0];
  if (a.routed || b.routed) {
    hooks.toast(t('toast.recovering'));
    return false;
  }
  if (dist(a, b) > orderRules.split.mergeRangeUnits) {
    hooks.toast(t('toast.tooFarToMerge'));
    return false;
  }
  const na = alive(a).length;
  const nb = alive(b).length;
  a.cond = {
    ...a.cond,
    suppression: Math.max(a.cond.suppression, b.cond.suppression),
    cohesion: na + nb ? (a.cond.cohesion * na + b.cond.cohesion * nb) / (na + nb) : a.cond.cohesion,
    readiness: Math.min(a.cond.readiness, b.cond.readiness),
    pinned: a.cond.pinned || b.cond.pinned,
    losses: a.cond.losses + b.cond.losses,
    aliveSeen: na + nb,
    leaderAlive: a.cond.leaderAlive,
  };
  a.men = [...a.men, ...b.men];
  // Back to the Gruppe's original slot order (Gruppenführer first).
  const unit = [...forces.player.units, ...forces.enemy.units].find((u) => u.id === a.group);
  if (unit) {
    const rank = Object.fromEntries(unit.men.map((m, i) => [m.slot, i]));
    a.men.sort((p, q) => rank[p.slot] - rank[q.slot]);
  }
  a.men.forEach((m, i) => (m.idx = i));
  Object.assign(a, { name: a.groupName, team: null, leaderSlot: unit?.leaderSlot ?? a.leaderSlot, split: false });
  Object.assign(b, { men: [], absorbed: true, path: [], target: null, split: false });
  if (state.selected === b.id) state.selected = a.id;
  addLog(t('log.merge', { unit: a.groupName }));
  hooks.changed();
  return true;
}

// Debug test tool: a grenade (Soviet type, thrown by "test") goes off at (x, y)
// on the next update.
export function testGrenade(x, y) {
  state.pending.push({ kind: 'grenade', at: state.elapsed, x, y, weapon: 'rgd33', by: 'test', side: 1 });
}

export function togglePause() {
  if (state.ended) return;
  state.started = true;
  state.paused = !state.paused;
  hooks.changed();
}

export function pause() {
  if (state.started && !state.paused && !state.ended) {
    state.paused = true;
    hooks.changed();
  }
}

function finish(win, reason) {
  state.ended = true;
  state.won = win;
  state.paused = true;
  const left = playerSquads().reduce((n, s) => n + alive(s).length, 0);
  addLog(t(win ? 'log.won' : 'log.ended'));
  const total = playerSquads().reduce((n, s) => n + s.men.length, 0);
  hooks.finished(win, reason + ' ' + t('result.left', { left, total }));
  hooks.changed();
}

// ---- per-squad update steps -------------------------------------------------

// A broken unit falls back towards its own map edge; it stops when it has rallied.
function updateBroken(s) {
  const c = s.cond;
  if (c.broken && !s.routed) {
    s.routed = true;
    s.path = pathTo(s, s.side ? 1130 : 70, s.y) || [];
    s.order = 'retreat';
    s.orderHouse = null;
    addLog(t(s.side ? 'log.enemyRetreat' : 'log.retreat', { unit: s.name }));
  }
  if (s.routed && !c.broken) {
    s.routed = false;
    s.order = 'hold';
    s.path = [];
    addLog(t(s.side ? 'log.enemyRallied' : 'log.rallied', { unit: s.name }));
  }
}

function updateEnemyAI(s) {
  if (!s.side || s.routed || state.elapsed - s.lastAI <= 12) return;
  s.lastAI = state.elapsed;
  const target = state.squads
    .filter((f) => !f.side && alive(f).length && state.spotted[1].has(f.id) && dist(s, f) < 310)
    .sort((a, b) => dist(a, s) - dist(b, s))[0];
  if (target && dist(target, s) < 245) {
    s.path = [];
    s.order = 'defend';
  } else {
    const e = state.squads.filter((q) => q.side).indexOf(s); // index among enemy units
    s.path = pathTo(s, 820 + e * 50, 330 + e * 80) || [];
    s.order = 'move';
  }
}

function moveSquad(s, dt) {
  s.advancing = false;
  if (!s.path.length) return;
  const p = s.path[0];
  const d = dist(s, p);
  // Suppression slows a unit; a pinned unit does not advance (a broken one still falls back).
  const c = s.cond;
  const speed = s.routed ? 30 : c.pinned ? 0 : 24 * (1 - c.suppression / 200);
  s.advancing = speed > 0;
  if (!speed) return;
  const step = Math.min(d, speed * dt);
  if (d > 0) {
    s.x += ((p.x - s.x) / d) * step;
    s.y += ((p.y - s.y) / d) * step;
  }
  if (d < 2) {
    s.path.shift();
    if (!s.path.length) s.order = s.defendAtEnd ? 'defend' : 'hold';
  }
}

function soldierTarget(s, m, i) {
  const o = formationOffset(i, s.men.length);
  let tx = s.x + o.x;
  let ty = s.y + o.y;
  const home = buildingAt(s.x, s.y);
  if (home && !s.path.length) {
    const slot = interiorSlots(home)[i];
    if (slot) {
      tx = slot.x;
      ty = slot.y;
    }
  }
  if (blocked(tx, ty) || !canWalk(s, { x: tx, y: ty })) {
    tx = s.x;
    ty = s.y;
  }
  // A defending or suppressed soldier uses nearby cover without leaving the squad.
  if (!home && !s.path.length && !s.routed && (s.cond.suppression > 0 || s.order === 'defend')) {
    if (m.coverTimer <= 0 || !m.coverPoint) {
      let best = { x: tx, y: ty };
      let score = coverAt(tx, ty);
      for (let a = 0; a < 8; a++) {
        const x = tx + Math.cos((a * Math.PI) / 4) * 18;
        const y = ty + Math.sin((a * Math.PI) / 4) * 18;
        const value = coverAt(x, y);
        if (value > score && !blocked(x, y) && dist(s, { x, y }) < 48 && canWalk(m, { x, y }) && canWalk(s, { x, y })) {
          best = { x, y };
          score = value;
        }
      }
      m.coverPoint = best;
      m.coverTimer = 3 + i * 0.2;
    }
    tx = m.coverPoint.x;
    ty = m.coverPoint.y;
  } else m.coverPoint = null;
  return { tx, ty };
}

// Individual route following. A soldier walks straight at its target when it can;
// otherwise it follows its own planned route. Routes are cached and re-planned only
// when the target has moved, the route is no longer walkable, or the soldier is
// stuck. At most REPLAN_BUDGET plans are made per update to bound the cost.
const REPLAN_BUDGET = 8;
let replansLeft = REPLAN_BUDGET;

function steer(m, tx, ty) {
  const goal = { x: tx, y: ty };
  if (canWalk(m, goal)) {
    m.route = null;
    return goal;
  }
  while (m.route?.length > 1 && dist(m, m.route[0]) < 1.5) m.route.shift();
  const stale =
    !m.route?.length ||
    dist(m.routeGoal, goal) > 15 ||
    m.stuck > 0.6 ||
    !canWalk(m, m.route[0]);
  if (stale && replansLeft > 0) {
    replansLeft--;
    m.route = pathTo(m, tx, ty);
    m.routeGoal = goal;
    m.stuck = 0;
  }
  if (!m.route?.length || !canWalk(m, m.route[0])) return null; // wait for a plan next update
  return m.route[0];
}

// Soldiers of one squad keep a small distance so they never stack on one spot.
// Returns a push per soldier; it is folded into that soldier's single move per
// update, so every movement stays one straight, wall-checked segment.
const SPACING = 9;
function separation(s) {
  const push = s.men.map(() => ({ x: 0, y: 0 }));
  for (let a = 0; a < s.men.length; a++)
    for (let b = a + 1; b < s.men.length; b++) {
      const p = s.men[a];
      const q = s.men[b];
      if (p.hp <= 0 || q.hp <= 0) continue;
      let dx = q.x - p.x;
      let dy = q.y - p.y;
      let d = Math.hypot(dx, dy);
      if (d >= SPACING) continue;
      if (d < 0.01) {
        // identical positions: split along a fixed, deterministic axis
        dx = Math.cos(b * 2.4);
        dy = Math.sin(b * 2.4);
        d = 1;
      }
      const k = (SPACING - d) / 4 / d;
      push[a].x -= dx * k;
      push[a].y -= dy * k;
      push[b].x += dx * k;
      push[b].y += dy * k;
    }
  return push;
}

function moveSoldiers(s, dt) {
  const push = separation(s);
  for (let i = 0; i < s.men.length; i++) {
    const m = s.men[i];
    if (m.hp <= 0) continue;
    m.flash = Math.max(0, m.flash - dt);
    m.aim = Math.max(0, m.aim - dt);
    m.coverTimer -= dt;
    const { tx, ty } = soldierTarget(s, m, i);
    const next = Math.hypot(tx - m.x, ty - m.y) > 0.8 ? steer(m, tx, ty) : null;
    let mx = 0;
    let my = 0;
    m.moving = false;
    if (next) {
      const dx = next.x - m.x;
      const dy = next.y - m.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.8) {
        m.moving = true;
        if (!m.aim) m.angle = Math.atan2(dy, dx);
        const step = Math.min(d, (soldierPose(m, s) === 'prone' ? 16 : 36) * dt);
        mx = (dx / d) * step;
        my = (dy / d) * step;
      }
    }
    // One straight move per update: try path step + spacing, then each alone.
    const tries = [[mx + push[i].x, my + push[i].y], [mx, my], [push[i].x, push[i].y]];
    const ok = tries.find(([x, y]) => (x || y) && canWalk(m, { x: m.x + x, y: m.y + y }));
    if (ok) {
      m.x += ok[0];
      m.y += ok[1];
      if (m.moving) m.walked += Math.hypot(ok[0], ok[1]);
      if (m.moving) m.stride += Math.hypot(mx, my) * 0.42;
    }
    if (m.moving) m.stuck = ok && ok !== tries[2] ? Math.max(0, m.stuck - dt) : m.stuck + dt;
  }
}

function updateObjective(dt) {
  const near = (s, r) => alive(s).length && dist(s, objective) < r;
  const friends = state.squads.some((s) => !s.side && !s.routed && near(s, objective.radius));
  const enemies = state.squads.some((s) => s.side && near(s, objective.enemyRadius));
  if (friends && !enemies) state.capture = Math.min(HOLD_TIME, state.capture + dt);
  else if (enemies) state.capture = Math.max(0, state.capture - dt * 0.6);

  if (state.capture >= HOLD_TIME) finish(true, t('result.held', { hold: HOLD_TIME }));
  else if (!playerSquads().some((s) => alive(s).length)) finish(false, t('result.wiped'));
  else if (state.elapsed >= MISSION_TIME) finish(false, t('result.timeout'));
}

// Advance the battle unless it is paused or over. The frame loop calls this.
export function step(dt) {
  if (state.paused || state.ended) return false;
  update(dt);
  return true;
}

const fireEvents = {
  log: (key, params) => addLog(t(key, params)),
  shot: (s) => hooks.shot(s.x),
  boom: (x) => hooks.boom(x),
  effect: (e) => state.effects.push(e),
};

// Combat contact of own units: firing or under fire in the last holdS seconds.
// Off screen it is marked at the map edge (render.js) and logged once in a while.
export const inContact = (s) => s.lastContact != null && state.elapsed - s.lastContact < effectRules.contact.holdS;
export const offScreen = (s, margin = 20) => {
  const v = state.view;
  return s.x < v.x - margin || s.y < v.y - margin || s.x > v.x + v.w + margin || s.y > v.y + v.h + margin;
};
function logContact(s) {
  if (s.side || !inContact(s) || !offScreen(s)) return;
  if (s.contactLogged != null && state.elapsed - s.contactLogged < effectRules.contact.logEveryS) return;
  s.contactLogged = state.elapsed;
  addLog(t('log.contact', { unit: s.name }));
}
let fireRulesCheck = 0.25;

export function update(dt) {
  replansLeft = REPLAN_BUDGET;
  state.elapsed += dt;
  state.effects = state.effects.filter((e) => (e.life -= dt) > 0);
  stepThreat(dt);
  stepEffects(state, dt);
  const focus = state.squads[state.selected];
  for (const e of state.pending.filter((p) => p.at <= state.elapsed)) detonate(e, state.squads, state, fireEvents, focus);
  state.pending = state.pending.filter((p) => p.at > state.elapsed);
  state.spotTimer -= dt;
  if (state.spotTimer <= 0) {
    updateSpotting(state.squads, state);
    state.spotTimer = fireRulesCheck;
  }
  for (const s of state.squads) {
    if (!alive(s).length) continue;
    updateEnemyAI(s);
    moveSquad(s, dt);
    moveSoldiers(s, dt);
    fireUnit(s, dt, state.squads, state, fireEvents);
    throwGrenades(s, dt, state);
    logContact(s);
    updateCondition(s, dt, state.squads, state.elapsed);
    updateBroken(s);
  }
  updateObjective(dt);
}
