// Test village for REQUEST_005 v1 (preview only, not part of the game). World 1200 x 800 units.
import { state } from './src/sim.js';
const M = await (await fetch('r5/manifest.json')).json();
const A = Object.fromEntries(M.assets.map((a) => [a.id, a]));
const load = (f) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = 'r5/' + f; });
const img = {};
await Promise.all(M.assets.map(async (a) => { img[a.id] = await load(a.file); }));

const W = 1200, H = 800, GP = 4; // ground canvas at 4 px/unit
const g = document.createElement('canvas'); g.width = W * GP; g.height = H * GP;
const gc = g.getContext('2d');
gc.scale(GP, GP);
function pattern(id) {
  const p = gc.createPattern(img[id], 'repeat');
  p.setTransform(new DOMMatrix().scale(1 / A[id].pxPerUnit));
  return p;
}
gc.fillStyle = pattern('ground-grass-dry'); gc.fillRect(0, 0, W, H);
// Feathered patches of another ground.
function patch(id, x, y, w, h, feather, alpha = 1) {
  const c = document.createElement('canvas'); c.width = W * GP; c.height = H * GP;
  const cc = c.getContext('2d'); cc.scale(GP, GP);
  cc.fillStyle = (() => { const p = cc.createPattern(img[id], 'repeat'); p.setTransform(new DOMMatrix().scale(1 / A[id].pxPerUnit)); return p; })();
  cc.fillRect(0, 0, W, H);
  cc.globalCompositeOperation = 'destination-in';
  cc.filter = `blur(${feather * GP}px)`;
  cc.fillStyle = '#000';
  cc.beginPath(); cc.roundRect(x, y, w, h, feather); cc.fill();
  gc.save(); gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalAlpha = alpha; gc.drawImage(c, 0, 0); gc.restore();
}
patch('ground-field-ploughed', 10, 30, 230, 330, 6);
patch('ground-yard', 690, 140, 300, 260, 22);
patch('ground-yard', 300, 190, 240, 200, 18, 0.75);
patch('ground-yard', 570, 220, 140, 150, 18, 0.6);
// Sprite helper: anchor pixel goes to world (x, y), optional rotation (radians).
function put(ctx, id, x, y, rot = 0, sx = 1) {
  const a = A[id], i = img[id], s = a.pxPerUnit;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, 1);
  ctx.drawImage(i, -a.anchor.pixel[0] / s, -a.anchor.pixel[1] / s, i.width / s, i.height / s);
  ctx.restore();
}
// Road along y = 440 (centre), full width, plus a branch north to the kolkhoz yard.
for (let x = -100; x < W; x += 512) gc.drawImage(img['road-dirt-main'], x, 400, 512, 80);
gc.save(); gc.beginPath(); gc.rect(790, 300, 80, 110); gc.clip();
gc.translate(870, 410); gc.rotate(-Math.PI / 2); gc.drawImage(img['road-dirt-main'], 0, 0, 512, 80); gc.restore();
// Ravine: north edge (descends south) and a south edge rotated 180 degrees, meeting at y = 620.
for (let x = 0; x < W; x += 80) {
  gc.drawImage(img['ravine-edge-straight'], x, 560, 80, 60);
  gc.save(); gc.translate(x + 80, 680); gc.rotate(Math.PI); gc.drawImage(img['ravine-edge-straight'], 0, 0, 80, 60); gc.restore();
}

// Fence along an axis-aligned polyline with right turns only.
function fence(ctx, pts) {
  const dirs = [];
  for (let i = 0; i < pts.length - 1; i++) dirs.push(Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]));
  for (let i = 0; i < dirs.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const L = Math.hypot(x1 - x0, y1 - y0), d = dirs[i], cx = Math.cos(d), cy = Math.sin(d);
    let a = i > 0 ? 40 : 0, b = i < dirs.length - 1 ? 40 : 0;
    if (i === 0) { put(ctx, 'fence-wattle-end', x0 + 40 * cx, y0 + 40 * cy, d + Math.PI); a = 40; }
    if (i === dirs.length - 1) { put(ctx, 'fence-wattle-end', x1 - 40 * cx, y1 - 40 * cy, d); b = 40; }
    for (let t = a; t < L - b - 1; t += 40) put(ctx, 'fence-wattle-straight', x0 + t * cx, y0 + t * cy, d);
    if (i < dirs.length - 1) put(ctx, 'fence-wattle-corner', x1 - 40 * cx, y1 - 40 * cy, d);
  }
}
// Objects below the soldiers.
const lower = document.createElement('canvas'); lower.width = W * GP; lower.height = H * GP;
const lc = lower.getContext('2d'); lc.scale(GP, GP);
const birches = [[250, 150], [560, 170], [1010, 110], [1090, 300], [140, 500], [640, 515], [1130, 520]];
for (const [x, y] of birches) put(lc, 'tree-birch-1-trunk', x, y);
for (const [x, y] of [[960, 345], [120, 520], [270, 515]]) put(lc, 'haystack-1', x, y);
fence(lc, [[420, 390], [300, 390], [300, 190], [540, 190], [540, 390], [460, 390]]);

window.__R = Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1)));
// A roof gives way to the interior while own soldiers are inside the building.
const inside = (x, y, w, h) => state.squads?.some((s) => !s.side && s.men.some((m) => m.hp > 0 && m.x > x && m.x < x + w && m.y > y && m.y < y + h));
window.__mapTest = (ctx) => {
  ctx.drawImage(g, 0, 0, W, H);
  ctx.drawImage(lower, 0, 0, W, H);
  put(ctx, 'bldg-izba-a-interior', 340, 230);
  put(ctx, 'bldg-izba-a-interior', 610, 245);
  put(ctx, 'bldg-stone-office-interior', 760, 180);
};
window.__mapTestTop = (ctx) => {
  const roof = (id, x, y, w, h) => { ctx.save(); ctx.globalAlpha = inside(x, y, w, h) ? 0.15 : 1; put(ctx, id, x, y); ctx.restore(); };
  roof('bldg-izba-a-roof', 340, 230, 70, 90);
  roof('bldg-izba-a-roof', 610, 245, 70, 90);
  roof('bldg-stone-office-roof', 760, 180, 140, 110);
  for (const [x, y] of birches) put(ctx, 'tree-birch-1', x, y);
};
const cv = document.getElementById('map'); cv.width = W * window.__R; cv.height = H * window.__R;
