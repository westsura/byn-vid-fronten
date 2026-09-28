// Path planning on a precomputed walkability grid.
//
// Why this design (see git history for the old BFS):
// - The old planner validated steps between *cell centres*, but soldiers stand
//   anywhere inside a cell. Its first waypoint could therefore lie behind a wall
//   corner as seen from the soldier's real position, and the soldier stood still
//   forever (houses 3-5 failed).
// - Here the search starts from every nearby cell centre the unit can walk to in a
//   straight line from where it actually is, and the result is string-pulled from
//   that real position. The first waypoint is therefore always directly walkable.
import { W, H } from './config.js';
import { blocked, canWalk } from './terrain.js';

export const NAV_CELL = 10; // world units per nav cell
const COLS = Math.ceil(W / NAV_CELL);
const ROWS = Math.ceil(H / NAV_CELL);
const DIRS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [-1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

const centre = (c) => c * NAV_CELL + NAV_CELL / 2;
const idx = (cx, cy) => cy * COLS + cx;
const inside = (cx, cy) => cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS;

// free[i]: the cell centre is not inside a wall.
// edges[i * 8 + d]: a straight walk from centre i in direction d is clear.
let free = null;
let edges = null;

export function buildNavGrid() {
  free = new Uint8Array(COLS * ROWS);
  edges = new Uint8Array(COLS * ROWS * 8);
  for (let cy = 0; cy < ROWS; cy++)
    for (let cx = 0; cx < COLS; cx++) free[idx(cx, cy)] = blocked(centre(cx), centre(cy)) ? 0 : 1;
  for (let cy = 0; cy < ROWS; cy++)
    for (let cx = 0; cx < COLS; cx++) {
      const i = idx(cx, cy);
      if (!free[i]) continue;
      DIRS.forEach(([dx, dy], d) => {
        const nx = cx + dx;
        const ny = cy + dy;
        if (!inside(nx, ny) || !free[idx(nx, ny)]) return;
        // Diagonals may not cut corners: both orthogonal neighbours must be free too.
        if (dx && dy && (!free[idx(cx + dx, cy)] || !free[idx(cx, cy + dy)])) return;
        if (canWalk({ x: centre(cx), y: centre(cy) }, { x: centre(nx), y: centre(ny) })) edges[i * 8 + d] = 1;
      });
    }
}

const ensureGrid = () => free || buildNavGrid();

// Cells within `radius` cells of p whose centre can be reached in a straight line.
function anchorCells(p, radius) {
  const px = Math.floor(p.x / NAV_CELL);
  const py = Math.floor(p.y / NAV_CELL);
  const found = [];
  for (let r = 0; r <= radius && !found.length; r++)
    for (let cy = py - r; cy <= py + r; cy++)
      for (let cx = px - r; cx <= px + r; cx++) {
        if (Math.max(Math.abs(cx - px), Math.abs(cy - py)) !== r || !inside(cx, cy) || !free[idx(cx, cy)]) continue;
        const c = { x: centre(cx), y: centre(cy) };
        if (canWalk(p, c)) found.push({ i: idx(cx, cy), cost: Math.hypot(c.x - p.x, c.y - p.y) });
      }
  return found;
}

// Free cells within `radius` cells of p, cost = distance (no straight-walk check).
function freeCellsNear(p, radius) {
  const px = Math.floor(p.x / NAV_CELL);
  const py = Math.floor(p.y / NAV_CELL);
  const found = [];
  for (let cy = py - radius; cy <= py + radius; cy++)
    for (let cx = px - radius; cx <= px + radius; cx++)
      if (inside(cx, cy) && free[idx(cx, cy)]) found.push({ i: idx(cx, cy), cost: Math.hypot(centre(cx) - p.x, centre(cy) - p.y) });
  return found;
}

// Minimal binary heap keyed on f-score.
class Heap {
  constructor() { this.items = []; }
  get size() { return this.items.length; }
  push(item) {
    const a = this.items;
    a.push(item);
    for (let i = a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

// Remove waypoints that can be skipped with a straight, clear walk.
function smooth(from, points) {
  const out = [];
  let cur = from;
  let i = 0;
  while (i < points.length) {
    let j = points.length - 1;
    while (j > i && !canWalk(cur, points[j])) j--;
    out.push(points[j]);
    cur = points[j];
    i = j + 1;
  }
  return out;
}

export let pathStats = { searches: 0, expanded: 0 };

/**
 * Plan a walkable route from `from` to (x, y).
 * Returns a list of waypoints (the last one is the goal, possibly moved to the
 * nearest reachable spot if the goal itself is inside a wall), or null if no route.
 * Every consecutive pair of points, starting at `from`, is a clear straight walk.
 */
export function pathTo(from, x, y) {
  ensureGrid();
  pathStats.searches++;
  const goal = { x, y };
  if (canWalk(from, goal) && !blocked(x, y)) return [goal];

  const starts = anchorCells(from, 2);
  if (!starts.length) return null;
  // A goal inside a wall (or unreachable in a straight line from any nearby cell)
  // is replaced by the best reachable free cell close to it.
  let ends = blocked(x, y) ? [] : anchorCells(goal, 2);
  let snapped = false;
  if (!ends.length) {
    snapped = true;
    ends = freeCellsNear(goal, 3);
    if (!ends.length) return null;
  }
  const endCost = new Map(ends.map((e) => [e.i, e.cost]));
  const target = goal;

  const gx = Math.floor(target.x / NAV_CELL);
  const gy = Math.floor(target.y / NAV_CELL);
  const h = (i) => {
    const dx = Math.abs((i % COLS) - gx);
    const dy = Math.abs(Math.floor(i / COLS) - gy);
    return (Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy)) * NAV_CELL;
  };

  const g = new Float64Array(COLS * ROWS).fill(Infinity);
  const came = new Int32Array(COLS * ROWS).fill(-1);
  const open = new Heap();
  for (const s of starts) {
    g[s.i] = s.cost;
    open.push({ i: s.i, f: s.cost + h(s.i) });
  }
  let best = -1;
  let bestCost = Infinity;
  while (open.size) {
    const { i, f } = open.pop();
    if (f >= bestCost) break;
    if (f - h(i) > g[i] + 1e-9) continue; // stale heap entry
    pathStats.expanded++;
    if (endCost.has(i)) {
      const total = g[i] + endCost.get(i);
      if (total < bestCost) {
        bestCost = total;
        best = i;
      }
    }
    const cx = i % COLS;
    const cy = Math.floor(i / COLS);
    for (let d = 0; d < 8; d++) {
      if (!edges[i * 8 + d]) continue;
      const n = idx(cx + DIRS[d][0], cy + DIRS[d][1]);
      const cost = g[i] + DIRS[d][2] * NAV_CELL;
      if (cost < g[n]) {
        g[n] = cost;
        came[n] = i;
        open.push({ i: n, f: cost + h(n) });
      }
    }
  }
  if (best < 0) return null;

  const cells = [];
  for (let n = best; n !== -1; n = came[n]) cells.unshift({ x: centre(n % COLS), y: centre(Math.floor(n / COLS)) });
  if (!snapped) cells.push(target);
  return smooth(from, cells);
}
