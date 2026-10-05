// Mission and victory conditions (DESIGN.md, Scenarier och segervillkor; step 8).
// The scenario file says which mission it is:
// - 'building': take back a building. At the time limit, the side with more men fit
//   to fight (alive, unit neither Broken nor Pinned) inside the building wins;
//   equal counts are a draw. The battle also ends if one side has no unit left
//   that can fight.
// - 'area' (the earlier prototype): hold an area for holdS seconds with no enemy near.
import { buildings } from './scenario.js';
import { buildingAt } from './terrain.js';

let M = null;
export function setMission(mission) {
  M = mission;
}
export const mission = () => M;
export const missionBuilding = () => (M?.type === 'building' ? buildings[M.building] : null);
export const timeLimit = () => M?.timeLimitS ?? 360;

const living = (s) => s.men.filter((m) => m.hp > 0);
// A soldier is fit to fight when he is alive and his unit is neither Broken nor Pinned.
export const fitToFight = (s) => !s.absorbed && !s.cond?.broken && !s.cond?.pinned && !s.routed;

// Fit soldiers of each side inside the objective building, and all soldiers inside.
export function buildingCounts(state) {
  const b = missionBuilding();
  // seen[1]: Soviet soldiers inside that the player can see (the interface shows only these).
  const out = { fit: [0, 0], inside: [0, 0], seenFit: [0, 0] };
  if (!b) return out;
  for (const s of state.squads) {
    if (s.absorbed) continue;
    for (const m of living(s)) {
      if (buildingAt(m.x, m.y) !== b) continue;
      out.inside[s.side]++;
      if (fitToFight(s)) {
        out.fit[s.side]++;
        if (!s.side || s.visible) out.seenFit[s.side]++;
      }
    }
  }
  return out;
}

// A side still in the fight: some unit with living men that is not Broken.
const canFight = (state, side) => state.squads.some((s) => s.side === side && !s.absorbed && living(s).length && !s.cond?.broken);

// One update. finish(outcome, reasonKey, params) ends the battle: outcome is
// 'won', 'lost' or 'draw' (for the player).
export function updateMission(state, dt, finish) {
  if (!M) return;
  if (M.type === 'area') {
    const near = (s, r) => living(s).length && Math.hypot(s.x - M.x, s.y - M.y) < r;
    const friends = state.squads.some((s) => !s.side && !s.routed && near(s, M.radius));
    const enemies = state.squads.some((s) => s.side && near(s, M.enemyRadius));
    if (friends && !enemies) state.capture = Math.min(M.holdS, state.capture + dt);
    else if (enemies) state.capture = Math.max(0, state.capture - dt * 0.6);
    if (state.capture >= M.holdS) return finish('won', 'result.held', { hold: M.holdS });
    if (!canFight(state, 0)) return finish('lost', 'result.wiped');
    if (state.elapsed >= M.timeLimitS) return finish('lost', 'result.timeout');
    return;
  }
  // 'building'
  const c = buildingCounts(state);
  state.counts = c;
  if (!canFight(state, 0)) return finish('lost', 'result.wiped');
  if (!canFight(state, 1)) return finish('won', 'result.enemyGone');
  if (state.elapsed >= M.timeLimitS) {
    const [de, su] = c.fit;
    const outcome = de > su ? 'won' : de < su ? 'lost' : 'draw';
    return finish(outcome, 'result.building.' + outcome, { de, su });
  }
}
