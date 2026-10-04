import { readFileSync } from 'node:fs';
import * as sim from '../dist/src/sim.js';
import { loadData, buildSide } from '../dist/src/data.js';

const dataDir = new URL('../dist/data/', import.meta.url);
export const db = await loadData(async (p) => JSON.parse(readFileSync(new URL(p, dataDir))));
export const forces = { player: buildSide(db, 'player'), enemy: buildSide(db, 'enemy') };
sim.setRules(db);
sim.setForces(forces);
export { sim };
export const { state } = sim;
// The selected unit (1. Gruppe after reset), or squad i.
export const player = (i) => state.squads[i ?? state.selected];

export function run(steps, dt = 0.05) {
  for (let i = 0; i < steps && !state.ended; i++) sim.update(dt);
}

export function killEnemies() {
  state.squads.filter((s) => s.side).forEach((s) => s.men.forEach((m) => (m.hp = 0)));
}

export function killPlayer() {
  state.squads.filter((s) => !s.side).forEach((s) => s.men.forEach((m) => (m.hp = 0)));
}
