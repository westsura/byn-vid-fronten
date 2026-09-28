// Exports the game's actual map geometry to docs/art/geometry/village.json
// so artists work from the same numbers the simulation uses.
// Run: node scripts/export-geometry.mjs
import { writeFileSync } from 'node:fs';
import { W, H } from '../dist/src/config.js';
import { NAV_CELL } from '../dist/src/nav.js';
import { buildings, woods, objective, startingSquads } from '../dist/src/scenario.js';

import { WALL_IN as WALL_INSIDE, WALL_OUT as WALL_OUTSIDE, DOOR_HALF, WINDOW_HALF } from '../dist/src/terrain.js';

const out = {
  version: 1,
  generatedFrom: 'dist/src/scenario.js + dist/src/terrain.js',
  units: 'world units; 1 unit ≈ 0.1 m; origin top-left, x → east, y → south',
  map: { width: W, height: H, navGridCell: NAV_CELL, image: 'dist/map.png', imageSize: [1536, 1024], imagePxPerUnit: 1.28 },
  wallBand: { inside: WALL_INSIDE, outside: WALL_OUTSIDE },
  objective,
  woods: woods.map((w) => ({ ...w, cover: 0.55, blocksSight: false, affectsSpeed: false })),
  startingSquads,
  buildings: buildings.map((b) => {
    const interiorSlots = [
      [b.midX, b.y + 16], [b.x + 16, b.midY], [b.x + b.w - 16, b.midY], [b.midX, b.y + b.h - 17], [b.midX - 15, b.midY + 12],
    ].map(([x, y]) => ({ x, y }));
    return {
      id: b.id,
      name: b.name,
      footprint: { x: b.x, y: b.y, w: b.w, h: b.h },
      interiorCover: 0.78,
      doors: [{ wall: 'south', from: b.doorX - DOOR_HALF, to: b.doorX + DOOR_HALF, y: b.y + b.h, passes: ['movement', 'sight', 'fire'] }],
      windows: [
        { wall: 'north', from: b.midX - WINDOW_HALF, to: b.midX + WINDOW_HALF, y: b.y },
        { wall: 'south', from: b.midX - WINDOW_HALF, to: b.midX + WINDOW_HALF, y: b.y + b.h },
        { wall: 'west', from: b.midY - WINDOW_HALF, to: b.midY + WINDOW_HALF, x: b.x },
        { wall: 'east', from: b.midY - WINDOW_HALF, to: b.midY + WINDOW_HALF, x: b.x + b.w },
      ].map((w) => ({ ...w, passes: ['sight', 'fire'] })),
      interiorSlots,
    };
  }),
};
writeFileSync(new URL('../docs/art/geometry/village.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('wrote docs/art/geometry/village.json');
