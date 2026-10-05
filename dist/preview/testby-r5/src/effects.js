// Basic combat effects (DESIGN.md, Grafik och effekter; PROMPTER step 3 part C).
// Simulation side only: decides where impacts land and on what material, emits
// tracers and keeps the camera trauma value. render.js draws them.
// Principles: tactical consequence before decoration (the impact shows the
// material, i.e. the cover); explosions the player does not know about do not
// move the camera; tracers from an unseen shooter show direction, not position.
import { buildings } from './scenario.js';
import { WALL_OUT } from './terrain.js';
import { random } from './rng.js';

let P = null;
export function setEffectRules(rules) {
  P = rules;
}
export const effectRules = () => P;

const inHouse = (x, y, b, pad = WALL_OUT) => x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;

export function materialAt(x, y) {
  return buildings.find((b) => inHouse(x, y, b))?.material ?? 'earth';
}

// Where the segment a→b first enters building b (Liang–Barsky), or null.
function entryPoint(a, p, b) {
  let t0 = 0;
  let t1 = 1;
  const dx = p.x - a.x;
  const dy = p.y - a.y;
  const x0 = b.x - WALL_OUT, x1 = b.x + b.w + WALL_OUT, y0 = b.y - WALL_OUT, y1 = b.y + b.h + WALL_OUT;
  for (const [pp, q] of [[-dx, a.x - x0], [dx, x1 - a.x], [-dy, a.y - y0], [dy, y1 - a.y]]) {
    if (pp === 0) {
      if (q < 0) return null;
    } else {
      const t = q / pp;
      if (pp < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
      else { if (t < t0) return null; if (t < t1) t1 = t; }
    }
  }
  return { x: a.x + dx * t0, y: a.y + dy * t0 };
}

// Impact point of one round from shooter m at victim v. A hit lands on the
// victim; a miss lands around him, a little more often beyond than short. A
// victim inside a house that the shooter is not in: misses strike the wall.
export function impactPoint(m, v, hit) {
  const dir = Math.atan2(v.y - m.y, v.x - m.x);
  let x = v.x;
  let y = v.y;
  if (!hit) {
    const r = P.impacts.missScatter * Math.sqrt(random());
    const a = dir + (random() - 0.5) * Math.PI * 1.4;
    x += Math.cos(a) * r;
    y += Math.sin(a) * r;
  }
  const house = buildings.find((b) => inHouse(v.x, v.y, b, 0));
  if (house && !inHouse(m.x, m.y, house, 0) && !hit) {
    const e = entryPoint(m, { x, y }, house);
    if (e) return { x: e.x, y: e.y, material: house.material, dir };
  }
  return { x, y, material: materialAt(x, y), dir };
}

export function addImpacts(state, m, v, rounds, hits) {
  const n = Math.min(rounds, P.impacts.perEvent);
  for (let k = 0; k < n; k++) {
    const p = impactPoint(m, v, k < hits);
    const life = P.impacts.lifeS[p.material] ?? 0.7;
    state.effects.push({ kind: 'impact', ...p, life, max: life, seed: random(), delay: k * 0.07 });
  }
}

// Tracers: one per everyRounds rounds of an MG burst, flying from shooter to
// impact; from an unseen shooter it starts part way along.
export function addTracers(state, w, m, v, rounds, shooterSeen) {
  const T = P.tracers;
  if (!T.weaponTypes.includes(w.type)) return;
  const n = Math.max(1, Math.floor(rounds / T.everyRounds));
  const d = Math.hypot(v.x - m.x, v.y - m.y);
  for (let k = 0; k < n; k++) {
    const start = shooterSeen ? 0 : T.hiddenStart;
    const tx = v.x + (random() - 0.5) * 18;
    const ty = v.y + (random() - 0.5) * 18;
    const dur = (d * (1 - start)) / T.speed;
    state.effects.push({
      kind: 'tracer',
      x0: m.x + (tx - m.x) * start,
      y0: m.y + (ty - m.y) * start,
      x1: tx,
      y1: ty,
      life: dur + k * 0.12,
      max: dur + k * 0.12,
      dur,
      delay: k * 0.12,
    });
  }
}

// Camera trauma from an explosion the player knows about: strength falls off
// with distance from the focus (the selected unit) and is gone beyond rangeUnits.
export function addTrauma(state, x, y, strength, focus) {
  const S = P.shake;
  const d = focus ? Math.hypot(x - focus.x, y - focus.y) : 0;
  const k = Math.max(0, 1 - d / S.rangeUnits);
  state.trauma = Math.min(1, (state.trauma ?? 0) + strength * k);
}

export function stepEffects(state, dt) {
  state.trauma = Math.max(0, (state.trauma ?? 0) - P.shake.decayPerS * dt);
}

// Shake amount 0..cap for the renderer.
export const shakeAmount = (state) => Math.min(P.shake.cap, (state.trauma ?? 0) ** 2);
