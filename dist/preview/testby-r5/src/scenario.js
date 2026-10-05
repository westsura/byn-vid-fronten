// Scenario data for "Unternehmen Morgenlicht". Everything map-specific lives here.
import { STEP } from './config.js';

export const objective = { x: 755, y: 290, radius: 68, enemyRadius: 100 };

// `name` is an internal label; the interface shows map.buildings[id] from data/text/en.json.
// `material` decides how hits look (wood: log houses / izby; stone: the brick
// farmhouse and storehouse). Map geometry moves to data files with the new map.
export const buildings = [
  { name: 'Izba A', material: 'wood', x: 340, y: 230, w: 70, h: 90 },
  { name: 'Stone house', material: 'stone', x: 760, y: 180, w: 140, h: 110 },
  { name: 'Izba B', material: 'wood', x: 610, y: 245, w: 70, h: 90 },
];
buildings.forEach((b, i) => {
  b.id = i;
  b.doorX = Math.floor((b.x + b.w / 2) / STEP) * STEP + 10;
  b.midX = b.x + b.w / 2;
  b.midY = b.y + b.h / 2;
});

export const woods = [
  [250, 150], [560, 170], [1010, 110], [1090, 300], [140, 500], [640, 515], [1130, 520],
].map(([x, y]) => ({ x, y, r: 35 }));
