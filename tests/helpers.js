import { readFileSync } from 'node:fs';
import * as sim from '../dist/src/sim.js';
import { loadData } from '../dist/src/data.js';

const dataDir = new URL('../dist/data/', import.meta.url);
export const db = await loadData(async (p) => JSON.parse(readFileSync(new URL(p, dataDir))));
export { sim };
export const { state } = sim;
export const player = (i = 0) => state.squads[i];

export function run(steps, dt = 0.05) {
  for (let i = 0; i < steps && !state.ended; i++) sim.update(dt);
}

export function killEnemies() {
  state.squads.filter((s) => s.side).forEach((s) => s.men.forEach((m) => (m.hp = 0)));
}

export function killPlayer() {
  state.squads.filter((s) => !s.side).forEach((s) => s.men.forEach((m) => (m.hp = 0)));
}
