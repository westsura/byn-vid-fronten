// Terrain and buildings: collision, cover and line of sight.
import { buildings, woods } from './scenario.js';

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function buildingAt(x, y) {
  return buildings.find((b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h);
}

// ---- Wall geometry ----------------------------------------------------------
// Each wall is an axis-aligned band from WALL_OUT units outside to WALL_IN units
// inside the building edge. Doors are gaps for movement, sight and fire; windows
// are gaps for sight and fire only. Everything is tested exactly (segment vs.
// rectangle), so no thin corner can be skipped between sample points.
export const WALL_IN = 6;
export const WALL_OUT = 3;
export const DOOR_HALF = 19;
export const WINDOW_HALF = 16;

// Split the span [a, b] around the given gaps [[g0, g1], ...].
function spans(a, b, gaps) {
  const out = [];
  let cur = a;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) {
    if (g0 > cur) out.push([cur, Math.min(g0, b)]);
    cur = Math.max(cur, g1);
  }
  if (cur < b) out.push([cur, b]);
  return out;
}

function wallRects(b, withWindows) {
  const x0 = b.x - WALL_OUT, x1 = b.x + b.w + WALL_OUT;
  const y0 = b.y - WALL_OUT, y1 = b.y + b.h + WALL_OUT;
  const door = [b.doorX - DOOR_HALF, b.doorX + DOOR_HALF];
  const winX = [b.midX - WINDOW_HALF, b.midX + WINDOW_HALF];
  const winY = [b.midY - WINDOW_HALF, b.midY + WINDOW_HALF];
  const w = withWindows;
  const rects = [];
  for (const [a, c] of spans(y0, y1, w ? [winY] : [])) rects.push([x0, a, b.x + WALL_IN, c]); // west
  for (const [a, c] of spans(y0, y1, w ? [winY] : [])) rects.push([b.x + b.w - WALL_IN, a, x1, c]); // east
  for (const [a, c] of spans(x0, x1, w ? [winX] : [])) rects.push([a, y0, c, b.y + WALL_IN]); // north
  for (const [a, c] of spans(x0, x1, w ? [door, winX] : [door])) rects.push([a, b.y + b.h - WALL_IN, c, y1]); // south
  return rects;
}

const moveBlockers = buildings.flatMap((b) => wallRects(b, false));
const sightBlockers = buildings.map((b) => ({ b, rects: wallRects(b, true) }));

const inRect = (x, y, [x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1;

// Does the segment a→b touch the rectangle? (Liang–Barsky clipping)
function segmentHitsRect(a, b, [x0, y0, x1, y1]) {
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const [p, q] of [[-dx, a.x - x0], [dx, x1 - a.x], [-dy, a.y - y0], [dy, y1 - a.y]]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

const outOfBounds = (x, y) => x < 10 || x > 1190 || y < 10 || y > 790;

export function blocked(x, y) {
  return outOfBounds(x, y) || moveBlockers.some((r) => inRect(x, y, r));
}

export function canWalk(a, b) {
  if (outOfBounds(b.x, b.y)) return false;
  return !moveBlockers.some((r) => segmentHitsRect(a, b, r));
}

export function coverAt(x, y) {
  if (buildingAt(x, y)) return 0.78;
  if (woods.some((t) => Math.hypot(x - t.x, y - t.y) < t.r)) return 0.55;
  if (buildings.some((b) => x > b.x - 27 && x < b.x + b.w + 27 && y > b.y - 27 && y < b.y + b.h + 27)) return 0.7;
  return 0.12;
}

// Line of sight (also used for fire): blocked by solid wall parts, open through
// doors and windows. You cannot see through a house you are not inside of.
export function los(a, b) {
  const insideA = buildingAt(a.x, a.y);
  const insideB = buildingAt(b.x, b.y);
  for (const { b: house, rects } of sightBlockers) {
    if (rects.some((r) => segmentHitsRect(a, b, r))) return false;
    if (house !== insideA && house !== insideB && segmentHitsRect(a, b, [house.x, house.y, house.x + house.w, house.y + house.h])) return false;
  }
  return true;
}
