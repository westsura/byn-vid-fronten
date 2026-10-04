// Scenario data for "Unternehmen Morgenlicht". Everything map-specific lives here.
import { STEP } from './config.js';

export const objective = { x: 755, y: 290, radius: 68, enemyRadius: 100 };

// `name` is an internal label; the interface shows map.buildings[id] from data/text/en.json.
export const buildings = [
  { name: 'West house', x: 444, y: 120, w: 115, h: 99 },
  { name: 'Farmhouse', x: 689, y: 145, w: 134, h: 102 },
  { name: 'East house', x: 965, y: 170, w: 107, h: 89 },
  { name: 'Barn', x: 485, y: 426, w: 133, h: 89 },
  { name: 'South house', x: 759, y: 428, w: 123, h: 97 },
  { name: 'Storehouse', x: 983, y: 443, w: 104, h: 115 },
];
buildings.forEach((b, i) => {
  b.id = i;
  b.doorX = Math.floor((b.x + b.w / 2) / STEP) * STEP + 10;
  b.midX = b.x + b.w / 2;
  b.midY = b.y + b.h / 2;
});

export const woods = [
  { x: 160, y: 200, r: 130 },
  { x: 220, y: 515, r: 120 },
  { x: 625, y: 95, r: 65 },
  { x: 610, y: 610, r: 60 },
  { x: 1110, y: 80, r: 70 },
  { x: 925, y: 590, r: 60 },
];
