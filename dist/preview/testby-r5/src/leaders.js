// Leaders (DESIGN.md, Ledare; PROMPTER step 6).
//
// Every leader has three values 1–5 (Leadership, Fire Control, Rally) and a
// trait (data/leaders/*.json, traits in data/leaders/traits.json). The rules for
// what the values do are in data/rules/leaders.json.
// - Group level: the Gruppenführer (in a split Gruppe also the Truppführer for the
//   Schützentrupp) is built into his unit and affects only it. If he falls, his
//   deputy takes over with his own, weaker values and no trait.
// - Platoon level: the Zugführer and the Zugtruppführer each choose a mode –
//   Direct Fire, Lead Assault or Rally – that affects own units within a radius.
// The functions below return factors (1 = no change) that sim.js, fire.js and
// condition.js multiply into their rules.

let P = null;
let TRAITS = {};
export function setLeaderRules(rules, traits) {
  P = rules;
  TRAITS = traits ?? {};
}
export const leaderRules = () => P;
export const traitOf = (id) => (id ? TRAITS[id] ?? null : null);

const living = (s) => s.men.filter((m) => m.hp > 0);
export const MODES = ['directFire', 'leadAssault', 'rally'];

// Who leads unit s now: its leader if alive, else the deputy (own values, no trait).
export function leaderInfo(s) {
  const lead = s.men.find((m) => m.slot === s.leaderSlot);
  if (lead && lead.hp > 0 && lead.leader) return { man: lead, values: lead.leader, trait: traitOf(lead.leader.trait), standIn: false };
  const dep = s.men.find((m) => m.slot === s.deputySlot && m.hp > 0);
  if (dep?.leader) return { man: dep, values: dep.leader, trait: null, standIn: true };
  return { man: null, values: P?.noLeader ?? { leadership: 1, fireControl: 1, rally: 1 }, trait: null, standIn: true };
}

export const radiusOf = (values) => P.radius.base + P.radius.perLeadership * values.leadership;
const eff = (info, key, dflt = 1) => info.trait?.effects?.[key] ?? dflt;

// ---- Platoon leaders' modes ---------------------------------------------------
// Auras: one per living platoon leader (Zugtrupp / Upravleniye) with a mode.
// state.leaderModes[personId] holds the player's choices; the Soviet Komandir
// vzvoda chooses for himself.
export function updateAuras(state) {
  const auras = [];
  for (const s of state.squads) {
    if (s.kind !== 'hq' || !living(s).length) continue;
    for (const m of living(s)) {
      if (!m.leader) continue;
      let mode = state.leaderModes?.[m.personId] ?? null;
      if (s.side && m.slot === s.leaderSlot) mode = aiMode(state, s, m);
      if (!mode) continue;
      auras.push({ side: s.side, mode, man: m, unit: s, values: m.leader, trait: traitOf(m.leader.trait), x: m.x, y: m.y, r: radiusOf(m.leader) });
    }
  }
  state.auras = auras;
  for (const s of state.squads) s.auras = auras.filter((a) => a.side === s.side && Math.hypot(a.x - s.x, a.y - s.y) <= a.r);
}

function aiMode(state, hq, m) {
  const r = radiusOf(m.leader);
  const shaky = state.squads.some((q) => q.side === hq.side && living(q).length && Math.hypot(q.x - m.x, q.y - m.y) <= r && (q.cond.broken || q.cond.cohesion < P.ai.shakenBelow));
  return shaky ? 'rally' : 'directFire';
}

const aura = (s, mode) => (s.auras ?? []).filter((a) => a.mode === mode).sort((a, b) => b.values.leadership - a.values.leadership)[0] ?? null;
export const rallyAura = (s) => aura(s, 'rally');

// Rally value counting a Green leader's penalty.
const rallyValue = (values, trait) => Math.max(1, values.rally - (trait?.effects?.rallyPenalty ?? 0));

// ---- Factors ------------------------------------------------------------------

// Seconds from an order to the unit starting to move.
export function orderDelay(s, kind = 'move') {
  const info = leaderInfo(s);
  let d = Math.max(P.orderDelay.min, P.orderDelay.base + P.orderDelay.perLeadership * info.values.leadership);
  if (kind === 'retreat') d += eff(info, 'retreatDelayS', 0);
  else d *= eff(info, 'advanceDelayFactor');
  if (aura(s, 'leadAssault')) d *= P.modes.leadAssault.orderDelayFactor;
  return d;
}

export function readinessFactor(s, weaponType) {
  const info = leaderInfo(s);
  let f = 1 + P.group.readinessPerFireControl * (info.values.fireControl - P.neutral);
  if (weaponType === 'lmg') f /= eff(info, 'lmgReady');
  const df = aura(s, 'directFire');
  if (df) f *= 1 + P.modes.directFire.readinessPerFireControl * df.values.fireControl;
  return Math.max(0.2, f);
}

// Hit factor for a round from unit s (shooter m) at victim v.
export function hitFactor(s, m, v, metres, inBuilding) {
  const info = leaderInfo(s);
  let f = 1 + P.group.hitPerFireControl * (info.values.fireControl - P.neutral);
  if (inBuilding) f *= eff(info, 'buildingHit');
  if (metres <= eff(info, 'closeRangeM', 0)) f *= eff(info, 'closeHit');
  const df = aura(s, 'directFire');
  if (df) f *= 1 + P.modes.directFire.hitPerFireControl * df.values.fireControl;
  return Math.max(0.2, f);
}

// Cohesion recovery factor, and whether a rallying leader lets it recover even
// when the unit is isolated.
export function recovery(s) {
  const info = leaderInfo(s);
  let f = Math.max(0.2, 1 + P.group.recoveryPerRally * (rallyValue(info.values, info.trait) - P.neutral));
  const ra = rallyAura(s);
  if (ra) f *= 1 + P.modes.rally.recoveryPerRally * rallyValue(ra.values, ra.trait);
  return { factor: f, rally: ra };
}

// Cohesion lost through casualties (kind 'casualty') or other drains while
// advancing / holding, as a factor.
export function cohesionLossFactor(s, kind) {
  const info = leaderInfo(s);
  let f = 1;
  if (s.advancing) f *= eff(info, 'advanceCohesionLoss');
  else f *= eff(info, 'holdCohesionLoss');
  if (kind === 'casualty' && aura(s, 'leadAssault')) f *= P.modes.leadAssault.casualtyCohesionFactor;
  return f;
}

export const suppressionRiseFactor = (s) => eff(leaderInfo(s), 'suppressionRise');

// Speed: Daredevil advances faster; Lead Assault halves the slow-down from suppression.
export function speedFactor(s) {
  return s.routed || s.order === 'retreat' ? 1 : eff(leaderInfo(s), 'advanceSpeed');
}
export const suppressionSlowFactor = (s) => (aura(s, 'leadAssault') ? P.modes.leadAssault.suppressionSlowFactor : 1);
export const exposureFactor = (s) => (s.advancing ? eff(leaderInfo(s), 'exposure') : 1);
export const barrelFactor = (s) => eff(leaderInfo(s), 'barrelChange');
