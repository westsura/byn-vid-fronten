// Battle simulation: squads, orders, movement, combat, morale and mission end.
// No DOM access here — the UI listens to events emitted through `hooks`.
import { MISSION_TIME, HOLD_TIME } from './config.js';
import { objective, startingSquads } from './scenario.js';
import { random, seedRandom } from './rng.js';
import { dist, buildingAt, blocked, canWalk, coverAt, los, interiorSlots } from './terrain.js';
import { pathTo } from './nav.js';

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
};

// Set by the UI layer. Kept as no-ops so the simulation runs headless in tests.
export const hooks = {
  changed() {},
  toast() {},
  shot() {},
  finished() {},
};

export const alive = (s) => s.men.filter((m) => m.hp > 0);
export const playerSquads = () => state.squads.filter((s) => !s.side);

export function soldierPose(m, s) {
  if (m.hp <= 0) return 'fallen';
  if (!s.routed && (s.underFire > 0 || s.order === 'Försvarar' || s.morale < 40)) return 'prone';
  return m.moving ? 'walk' : 'ready';
}

function addLog(text) {
  state.logs.unshift({ t: Math.floor(state.elapsed), text });
  state.logs = state.logs.slice(0, 5);
}

// ---- Forces ------------------------------------------------------------------
// A force describes one side's squad organisation. The standard force is the
// original five-man rifle squad; prototype forces (e.g. the infantry-v1 art test)
// supply their own soldier lists with role, weapon and sub-unit.
const STANDARD_SQUAD = Array.from({ length: 5 }, (_, i) => ({
  role: i === 0 ? 'leader' : 'rifleman',
  weapon: 'rifle',
}));
export const standardForces = { id: 'standard', player: { soldiers: STANDARD_SQUAD }, enemy: { soldiers: STANDARD_SQUAD } };
let forces = standardForces;

export function setForces(f) {
  forces = f || standardForces;
}
export const currentForces = () => forces;

// Formation offsets for n soldiers: rows of 3 (n <= 6) or 4, spacing 20 × 23
// times the force's spacing factor (1 unless a prototype asks for wider spacing).
// For n = 5 and factor 1 this is exactly the original layout.
export function formationOffset(i, n) {
  const f = forces.spacing ?? 1;
  const cols = n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  return { x: ((i % cols) - (cols - 1) / 2) * 20 * f, y: (Math.floor(i / cols) - (rows - 1) / 2) * 23 * f };
}

function makeSquad({ name, x, y, side }, id) {
  const roster = (side ? forces.enemy : forces.player).soldiers;
  return {
    id, name, x, y, side,
    faction: (side ? forces.enemy : forces.player).faction ?? null,
    morale: 100,
    ammo: 150,
    order: 'Avvaktar',
    path: [],
    cooldown: 2 + id * 0.7,
    visible: !side,
    lastAI: 0,
    underFire: 0,
    routed: false,
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
        moving: false,
        flash: 0,
        aim: 0,
        role: def.role,
        weapon: def.weapon,
        spriteRole: def.spriteRole ?? null,
        title: def.title ?? null,
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
  Object.assign(state, {
    squads: startingSquads.map(makeSquad),
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
  });
  addLog('Tre grupper redo. Ge order och börja striden.');
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
    hooks.toast('Gruppen återhämtar sig och kan inte ta order.');
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
    hooks.toast('Det går inte att nå platsen. Välj mark eller mitten av ett hus.');
    return false;
  }
  s.path = path;
  s.destinationHouse = house?.id ?? null;
  s.order = house
    ? 'Går in i ' + house.name.toLowerCase()
    : state.mode === 'defend' ? 'Tar försvarsställning' : 'Förflyttar';
  s.defendAtEnd = !!house || state.mode === 'defend';
  addLog(house ? s.name + ': tar ställning i ' + house.name.toLowerCase() + '.' : s.name + ': ny förflyttningsorder.');
  state.effects.push({ kind: 'order', x, y, life: 1.5 });
  hooks.changed();
  return true;
}

export function defend() {
  const s = state.squads[state.selected];
  if (state.ended || !s || !alive(s).length || s.routed) return;
  s.path = [];
  s.order = 'Försvarar';
  state.mode = 'defend';
  addLog(s.name + ' intar försvarsställning.');
  hooks.changed();
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
  addLog(win ? 'Uppdraget är slutfört.' : 'Striden avslutad.');
  const total = playerSquads().reduce((n, s) => n + s.men.length, 0);
  hooks.finished(win, reason + ' ' + left + ' av ' + total + ' egna soldater kvar.');
  hooks.changed();
}

// ---- per-squad update steps -------------------------------------------------

function updateVisibility(s) {
  s.visible =
    !s.side ||
    state.squads.some(
      (f) => !f.side && alive(f).length && dist(s, f) < 335 && alive(s).some((a) => alive(f).some((b) => los(a, b))),
    );
}

function updateMorale(s, dt) {
  s.morale = Math.min(100, s.morale + dt * (s.path.length ? 0.6 : 1.5));
  if (s.morale < 22 && !s.routed) {
    s.routed = true;
    s.path = pathTo(s, s.side ? 1130 : 70, s.y) || [];
    s.order = 'Drar sig tillbaka';
    addLog((s.side ? 'Fiende' : s.name) + ' drar sig tillbaka.');
  }
  if (s.routed && s.morale > 48) {
    s.routed = false;
    s.order = 'Avvaktar';
    s.path = [];
  }
}

function updateEnemyAI(s) {
  if (!s.side || s.routed || state.elapsed - s.lastAI <= 12) return;
  s.lastAI = state.elapsed;
  const target = state.squads
    .filter((f) => !f.side && alive(f).length && los(s, f) && dist(s, f) < 310)
    .sort((a, b) => dist(a, s) - dist(b, s))[0];
  if (target && dist(target, s) < 245) {
    s.path = [];
    s.order = 'Försvarar';
  } else {
    s.path = pathTo(s, 820 + (s.id - 3) * 50, 330 + (s.id - 3) * 80) || [];
    s.order = 'Förflyttar';
  }
}

function moveSquad(s, dt) {
  if (!s.path.length) return;
  const p = s.path[0];
  const d = dist(s, p);
  const speed = (s.underFire > 0 && !s.routed ? 9 : s.morale < 35 ? 10 : 24) * (s.routed ? 1.25 : 1);
  const step = Math.min(d, speed * dt);
  if (d > 0) {
    s.x += ((p.x - s.x) / d) * step;
    s.y += ((p.y - s.y) / d) * step;
  }
  if (d < 2) {
    s.path.shift();
    if (!s.path.length) s.order = s.defendAtEnd ? 'Försvarar' : 'Avvaktar';
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
  if (!home && !s.path.length && !s.routed && (s.underFire > 0 || s.order === 'Försvarar')) {
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
      if (m.moving) m.stride += Math.hypot(mx, my) * 0.42;
    }
    if (m.moving) m.stuck = ok && ok !== tries[2] ? Math.max(0, m.stuck - dt) : m.stuck + dt;
  }
}

function fire(s, dt) {
  s.cooldown -= dt;
  if (s.cooldown > 0 || s.ammo <= 0 || s.routed) return;
  const targets = state.squads.filter(
    (t) => t.side !== s.side && alive(t).length && dist(s, t) < 290 && alive(s).some((a) => alive(t).some((b) => los(a, b))),
  );
  targets.sort((a, b) => dist(a, s) - dist(b, s));
  if (!targets.length) return;

  const t = targets[0];
  const attackers = alive(s);
  const pairs = attackers.flatMap((a) => alive(t).filter((b) => los(a, b)).map((b) => ({ a, b })));
  const { a: shooter, b: victim } = pairs[Math.floor(random() * pairs.length)];
  const cover = Math.min(0.86, coverAt(victim.x, victim.y) + (soldierPose(victim, t) === 'prone' ? 0.14 : 0));
  t.underFire = 5;
  shooter.flash = 0.12;
  shooter.aim = 1.2;
  s.ammo -= 1;
  s.cooldown = 0.55 + random() * 1.4;
  shooter.angle = Math.atan2(victim.y - shooter.y, victim.x - shooter.x);
  const seen = !s.side || s.visible;
  state.effects.push({ kind: 'shot', x: shooter.x, y: shooter.y, tx: victim.x, ty: victim.y, life: 0.1, visible: seen });
  t.morale = Math.max(0, t.morale - (2.3 + attackers.length * 0.45) * (1 - cover * 0.55));
  if (random() < (0.35 - dist(s, t) / 1400) * (1 - cover) * (s.path.length ? 0.5 : 1)) {
    victim.hp -= 45 + random() * 35;
    if (victim.hp <= 0) {
      addLog((t.side ? 'Fiende' : t.name) + ' förlorar en soldat.');
      t.morale = Math.max(0, t.morale - 9);
    }
  }
  if (seen) hooks.shot(s.x);
}

function updateObjective(dt) {
  const near = (s, r) => alive(s).length && dist(s, objective) < r;
  const friends = state.squads.some((s) => !s.side && !s.routed && near(s, objective.radius));
  const enemies = state.squads.some((s) => s.side && near(s, objective.enemyRadius));
  if (friends && !enemies) state.capture = Math.min(HOLD_TIME, state.capture + dt);
  else if (enemies) state.capture = Math.max(0, state.capture - dt * 0.6);

  if (state.capture >= HOLD_TIME) finish(true, 'Du höll målet i 20 sekunder.');
  else if (!playerSquads().some((s) => alive(s).length)) finish(false, 'Alla egna grupper är utslagna.');
  else if (state.elapsed >= MISSION_TIME) finish(false, 'Tiden tog slut innan målet säkrades.');
}

// Advance the battle unless it is paused or over. The frame loop calls this.
export function step(dt) {
  if (state.paused || state.ended) return false;
  update(dt);
  return true;
}

export function update(dt) {
  replansLeft = REPLAN_BUDGET;
  state.elapsed += dt;
  state.effects = state.effects.filter((e) => (e.life -= dt) > 0);
  for (const s of state.squads) {
    if (!alive(s).length) continue;
    s.underFire = Math.max(0, s.underFire - dt);
    updateVisibility(s);
    updateMorale(s, dt);
    updateEnemyAI(s);
    moveSquad(s, dt);
    moveSoldiers(s, dt);
    fire(s, dt);
  }
  updateObjective(dt);
}
