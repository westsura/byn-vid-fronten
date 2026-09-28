// Scenario data for "Operation Morgonljus". Everything map-specific lives here.
import { STEP } from './config.js';

export const objective = { x: 755, y: 290, radius: 68, enemyRadius: 100 };

export const buildings = [
  { name: 'Västra huset', x: 444, y: 120, w: 115, h: 99 },
  { name: 'Gårdshuset', x: 689, y: 145, w: 134, h: 102 },
  { name: 'Östra huset', x: 965, y: 170, w: 107, h: 89 },
  { name: 'Ladan', x: 485, y: 426, w: 133, h: 89 },
  { name: 'Södra huset', x: 759, y: 428, w: 123, h: 97 },
  { name: 'Magasinet', x: 983, y: 443, w: 104, h: 115 },
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

// side 0 = player, side 1 = enemy
export const startingSquads = [
  { name: 'Alfa', x: 130, y: 250, side: 0 },
  { name: 'Bravo', x: 115, y: 415, side: 0 },
  { name: 'Charlie', x: 145, y: 600, side: 0 },
  { name: 'Nord', x: 865, y: 335, side: 1 },
  { name: 'Öst', x: 1060, y: 430, side: 1 },
  { name: 'Syd', x: 875, y: 670, side: 1 },
];
