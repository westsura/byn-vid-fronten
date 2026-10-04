// State model per unit (DESIGN.md, Tillståndsmodell): suppression (seconds),
// cohesion (minutes) and fire readiness (seconds), all 0–100, with Pinned and
// Broken derived from them. Parameters come from data/rules/condition.json.
// In step 2 these values are computed and shown; they do not yet change how
// units move or fire (that is step 3).
import { dangerAt } from './threat.js';

let P = null;
let weapons = {};

export function setConditionRules(rules, weaponTable) {
  P = rules;
  weapons = weaponTable ?? {};
}

export function newCondition(s) {
  return {
    suppression: 0,
    cohesion: 100,
    readiness: 100, // units start in position, ready to fire
    pinned: false,
    broken: false,
    aliveSeen: s.men.length,
    leaderAlive: true,
    losses: 0,
  };
}

const clamp = (v) => Math.max(0, Math.min(100, v));
const living = (s) => s.men.filter((m) => m.hp > 0);

// Threat on the unit: half the mean and half the highest danger in the cells
// where its living soldiers stand, so a unit partly under fire is partly affected.
export function threatOn(s) {
  const men = living(s);
  if (!men.length) return 0;
  let sum = 0;
  let max = 0;
  for (const m of men) {
    const d = dangerAt(m.x, m.y, s.side);
    sum += d;
    max = Math.max(max, d);
  }
  return 0.5 * (sum / men.length) + 0.5 * max;
}

// Seconds to full fire readiness: mean of the living soldiers' weapons.
export function readyTime(s) {
  const t = living(s).map((m) => weapons[m.weapon]?.readyTimeS).filter((x) => x > 0);
  return t.length ? t.reduce((a, b) => a + b, 0) / t.length : 4;
}

export function updateCondition(s, dt, allSquads) {
  const c = s.cond;
  const men = living(s);
  if (!men.length) return;

  // Suppression: rises with threat, falls quickly when the fire stops.
  const threat = threatOn(s);
  c.threat = threat;
  c.suppression = clamp(threat > 0 ? c.suppression + P.suppression.risePerS * threat * dt : c.suppression - P.suppression.decayPerS * dt);
  if (!c.pinned && c.suppression >= P.suppression.pinnedAt) c.pinned = true;
  else if (c.pinned && c.suppression <= P.suppression.unpinnedAt) c.pinned = false;

  // Cohesion: losses and a lost leader cost at once; isolation drains slowly;
  // out of fire it recovers, faster with the leader alive, up to a ceiling
  // that falls with the unit's losses.
  const P2 = P.cohesion;
  if (men.length < c.aliveSeen) {
    const lost = c.aliveSeen - men.length;
    c.losses += lost;
    c.cohesion = clamp(c.cohesion - lost * P2.perCasualty);
    c.aliveSeen = men.length;
  }
  const leader = s.men.find((m) => m.role === 'leader');
  if (c.leaderAlive && leader && leader.hp <= 0) {
    c.leaderAlive = false;
    c.cohesion = clamp(c.cohesion - P2.leaderLost);
  }
  const friends = allSquads.some((o) => o !== s && o.side === s.side && o.men.some((m) => m.hp > 0) && Math.hypot(o.x - s.x, o.y - s.y) <= P2.isolationRadius);
  c.isolated = !friends;
  if (c.isolated) c.cohesion = clamp(c.cohesion - (P2.isolationPerMin / 60) * dt);
  const ceiling = 100 - P2.ceilingLossAtFullLosses * (c.losses / s.men.length);
  if (threat === 0 && c.suppression === 0 && !c.isolated && c.cohesion < ceiling) {
    const rate = (P2.recoverPerMin / 60) * (c.leaderAlive ? P2.recoverWithLeader : 1);
    c.cohesion = Math.min(ceiling, c.cohesion + rate * dt);
  }
  if (!c.broken && c.cohesion < P2.brokenAt) c.broken = true;
  else if (c.broken && c.cohesion >= P2.rallyAt) c.broken = false;

  // Fire readiness: zero while the unit moves, builds while it stands still.
  if (s.path.length) c.readiness = 0;
  else c.readiness = clamp(c.readiness + (100 / readyTime(s)) * (c.pinned ? P.readiness.pinnedFactor : 1) * dt);
}
