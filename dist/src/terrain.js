// Terrain and buildings: collision, cover and line of sight.
import { buildings, woods } from './scenario.js';

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function buildingAt(x, y) {
  return buildings.find((b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h);
}

// Walls are bands roughly ±6 px around each building edge.
function onWall(x, y, b) {
  return (
    x >= b.x - 3 &&
    x <= b.x + b.w + 3 &&
    y >= b.y - 3 &&
    y <= b.y + b.h + 3 &&
    (Math.abs(x - b.x) < 6 ||
      Math.abs(x - b.x - b.w) < 6 ||
      Math.abs(y - b.y) < 6 ||
      Math.abs(y - b.y - b.h) < 6)
  );
}

// Each building has one door, centred on the south wall.
function atDoor(x, y, b) {
  return Math.abs(y - b.y - b.h) < 7 && Math.abs(x - b.doorX) < 19;
}

// Windows sit at the middle of every wall: sight passes, movement does not.
function atWindow(x, y, b) {
  return (
    ((Math.abs(y - b.y) < 7 || Math.abs(y - b.y - b.h) < 7) && Math.abs(x - b.midX) < 16) ||
    ((Math.abs(x - b.x) < 7 || Math.abs(x - b.x - b.w) < 7) && Math.abs(y - b.midY) < 16)
  );
}

export function blocked(x, y) {
  return (
    x < 10 || x > 1190 || y < 10 || y > 790 || buildings.some((b) => onWall(x, y, b) && !atDoor(x, y, b))
  );
}

export function canWalk(a, b) {
  const n = Math.max(1, Math.ceil(dist(a, b) / 3));
  for (let i = 1; i <= n; i++) {
    if (blocked(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n)) return false;
  }
  return true;
}

export function coverAt(x, y) {
  if (buildingAt(x, y)) return 0.78;
  if (woods.some((t) => Math.hypot(x - t.x, y - t.y) < t.r)) return 0.55;
  if (buildings.some((b) => x > b.x - 27 && x < b.x + b.w + 27 && y > b.y - 27 && y < b.y + b.h + 27)) return 0.7;
  return 0.12;
}

export function los(a, b) {
  const insideA = buildingAt(a.x, a.y);
  const insideB = buildingAt(b.x, b.y);
  const n = Math.max(1, Math.ceil(dist(a, b) / 4));
  for (let i = 1; i < n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n;
    const y = a.y + ((b.y - a.y) * i) / n;
    for (const house of buildings) {
      if (onWall(x, y, house) && !(atDoor(x, y, house) || atWindow(x, y, house))) return false;
      const inside = x > house.x && x < house.x + house.w && y > house.y && y < house.y + house.h;
      if (house !== insideA && house !== insideB && inside) return false;
    }
  }
  return true;
}
