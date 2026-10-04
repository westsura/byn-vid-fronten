// Threat map (DESIGN.md, Tillståndsmodell): a grid over the map recording which
// cells are being swept by fire right now, against which side and by whom, plus a
// slower "discomfort" value per cell that lingers where a side has been fired on.
//
// Fire is registered as sources (an area, an intensity, who fires, which side is
// threatened, and a lifetime). The grid is recomputed from the sources a few rows
// per simulation update, so the cost is spread over several frames.
// Sources come from real fire (fire.js) and from the debug test tool.
import { W, H } from './config.js';

let P = null; // parameters from data/rules/condition.json
export let CELL = 20;
export let COLS = W / CELL;
export let ROWS = H / CELL;

// danger[side][cell] 0–1, by[side][cell] source id (squad id, or 'test'),
// discomfort[side][cell] 0–100. side 0 = player, 1 = enemy.
export const grid = { danger: [], by: [], discomfort: [] };
let sources = [];
let nextRow = 0;
let rowTime = []; // sim time when each row was last recomputed
let now = 0;

export function setThreatRules(rules) {
  P = rules;
  CELL = rules.grid.cell;
  COLS = Math.ceil(W / CELL);
  ROWS = Math.ceil(H / CELL);
  resetThreat();
}

export function resetThreat() {
  const n = COLS * ROWS;
  grid.danger = [new Float32Array(n), new Float32Array(n)];
  grid.by = [new Array(n).fill(null), new Array(n).fill(null)];
  grid.discomfort = [new Float32Array(n), new Float32Array(n)];
  sources = [];
  nextRow = 0;
  rowTime = new Array(ROWS).fill(0);
  now = 0;
}

export const cellOf = (x, y) => {
  const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / CELL)));
  const r = Math.max(0, Math.min(ROWS - 1, Math.floor(y / CELL)));
  return { c, r, i: r * COLS + c };
};
export const dangerAt = (x, y, side) => grid.danger[side][cellOf(x, y).i];
export const discomfortAt = (x, y, side) => grid.discomfort[side][cellOf(x, y).i];
export const threatSources = () => sources;

// A source sweeps a block of cells: centre cell (c, r) and `radius` cells around it.
// sides: which sides it threatens ([0], [1] or [0, 1] for the test tool).
export function addSource({ x, y, radius = 1, intensity = 1, by, sides, life = Infinity, id }) {
  const { c, r } = cellOf(x, y);
  const s = { id: id ?? `${by}:${c},${r}`, c, r, radius, intensity, by, sides, life };
  sources.push(s);
  return s;
}

// A source over an explicit set of cells (e.g. a covered sector being swept by fire).
export function addCellSource({ cells, intensity, by, sides, life, id }) {
  let sc = 0;
  let sr = 0;
  for (const i of cells) {
    sc += i % COLS;
    sr += Math.floor(i / COLS);
  }
  const n = Math.max(1, cells.size);
  const s = { id, cells, intensity, by, sides, life, c: Math.round(sc / n), r: Math.round(sr / n), radius: 0 };
  sources.push(s);
  return s;
}

export function removeSource(id) {
  sources = sources.filter((s) => s.id !== id);
}

// Test tool: toggles a test fire on the cell at (x, y), threatening both sides.
// The grid is refreshed at once so the change is visible even while paused.
export function toggleTestFire(x, y) {
  const { c, r } = cellOf(x, y);
  const id = `test:${c},${r}`;
  const on = !sources.some((s) => s.id === id);
  if (on) addSource({ x, y, radius: 1, intensity: 1, by: 'test', sides: [0, 1], id });
  else removeSource(id);
  refreshAll(0);
  return on;
}

function recomputeRow(r, dt) {
  for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    for (const side of [0, 1]) {
      // Sources in the same cell add up (capped at 1); `by` is the largest contributor.
      let d = 0;
      let top = 0;
      let who = null;
      for (const s of sources) {
        if (!s.sides.includes(side)) continue;
        if (s.cells ? !s.cells.has(i) : Math.abs(s.r - r) > s.radius || Math.abs(s.c - c) > s.radius) continue;
        d += s.intensity;
        if (s.intensity > top) {
          top = s.intensity;
          who = s.by;
        }
      }
      d = Math.min(1, d);
      grid.danger[side][i] = d;
      grid.by[side][i] = who;
      const k = grid.discomfort[side][i];
      grid.discomfort[side][i] = d > 0 ? Math.min(100, k + P.discomfort.risePerS * d * dt) : Math.max(0, k - P.discomfort.decayPerS * dt);
    }
  }
}

function refreshAll(dt) {
  for (let r = 0; r < ROWS; r++) {
    recomputeRow(r, dt);
    rowTime[r] = now;
  }
}

// One simulation update: age the sources, then recompute the next slice of rows.
// Each row integrates discomfort over the time since it was last recomputed.
export function stepThreat(dt) {
  now += dt;
  for (const s of sources) s.life -= dt;
  sources = sources.filter((s) => s.life > 0);
  for (let k = 0; k < P.grid.rowsPerUpdate; k++) {
    const r = nextRow;
    recomputeRow(r, now - rowTime[r]);
    rowTime[r] = now;
    nextRow = (nextRow + 1) % ROWS;
  }
}
