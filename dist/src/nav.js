// Grid path planning (breadth-first search on STEP-sized cells, 8 directions).
import { STEP, COLS, ROWS } from './config.js';
import { blocked, canWalk } from './terrain.js';

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
const centre = (c) => c * STEP + 10;

export function pathTo(from, x, y) {
  const key = (cx, cy) => cy * COLS + cx;
  const start = key(Math.floor(from.x / STEP), Math.floor(from.y / STEP));
  const gx = Math.floor(x / STEP);
  const gy = Math.floor(y / STEP);
  const goal = key(gx, gy);
  if (blocked(centre(gx), centre(gy))) return null;

  const queue = [start];
  const came = new Map([[start, -1]]);
  for (let i = 0; i < queue.length; i++) {
    const k = queue[i];
    if (k === goal) break;
    const cx = k % COLS;
    const cy = Math.floor(k / COLS);
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      const n = key(nx, ny);
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || came.has(n) || blocked(centre(nx), centre(ny))) continue;
      if (!canWalk({ x: centre(cx), y: centre(cy) }, { x: centre(nx), y: centre(ny) })) continue;
      came.set(n, k);
      queue.push(n);
    }
  }
  if (!came.has(goal)) return null;

  const route = [];
  for (let n = goal; n !== start; n = came.get(n)) route.unshift({ x: centre(n % COLS), y: centre(Math.floor(n / COLS)) });
  return route;
}
