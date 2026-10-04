// Canvas rendering of the map, buildings, squads and effects. Reads state only.
import { W, H } from './config.js';
import { buildings, objective } from './scenario.js';
import { state, alive, formationOffset, houseName, playerSquads, inContact, offScreen } from './sim.js';
import { shakeAmount, effectRules } from './effects.js';
import { fireRules } from './fire.js';
import { cam, view, toScreen } from './camera.js';
import { buildingAt } from './terrain.js';
import { drawUnit, isPrototype } from './art.js';
import { t } from './text.js';
import { grid, threatSources, CELL, COLS, ROWS } from './threat.js';

const mapImage = new Image();
let mapLoaded = false;

export function loadMap(src, onError) {
  mapImage.onload = () => (mapLoaded = true);
  mapImage.onerror = onError;
  mapImage.src = src;
}

function circle(ctx, x, y, r, color, fill = false) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx[fill ? 'fillStyle' : 'strokeStyle'] = color;
  ctx[fill ? 'fill' : 'stroke']();
}

function drawFallbackMap(ctx) {
  ctx.fillStyle = '#515d3c';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#aba078';
  ctx.fillRect(0, 380, W, 40);
  ctx.fillRect(740, 0, 40, H);
  ctx.fillStyle = '#4d5048';
  for (const b of buildings) ctx.fillRect(b.x, b.y, b.w, b.h);
}

// Roofs are replaced by a floor plan while own soldiers are inside.
function drawBuildings(ctx) {
  for (const b of buildings) {
    const occupied = state.squads.some((s) => !s.side && alive(s).some((m) => buildingAt(m.x, m.y) === b));
    if (occupied) {
      ctx.fillStyle = '#908770';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#696650';
      ctx.lineWidth = 1;
      for (let y = b.y + 10; y < b.y + b.h; y += 10) {
        ctx.beginPath();
        ctx.moveTo(b.x + 5, y);
        ctx.lineTo(b.x + b.w - 5, y);
        ctx.stroke();
      }
      if (mapLoaded) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        const sx = mapImage.width / W;
        const sy = mapImage.height / H;
        ctx.drawImage(mapImage, b.x * sx, b.y * sy, b.w * sx, b.h * sy, b.x, b.y, b.w, b.h);
        ctx.restore();
      }
      ctx.strokeStyle = '#dad3b5';
      ctx.lineWidth = 6;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      // Windows
      ctx.strokeStyle = '#46584e';
      const windows = [
        [b.midX - 16, b.y, b.midX + 16, b.y],
        [b.midX - 16, b.y + b.h, b.midX + 16, b.y + b.h],
        [b.x, b.midY - 16, b.x, b.midY + 16],
        [b.x + b.w, b.midY - 16, b.x + b.w, b.midY + 16],
      ];
      for (const [x1, y1, x2, y2] of windows) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    // Door
    ctx.strokeStyle = occupied ? '#d7c28e' : '#e2d9b0aa';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(b.doorX - 18, b.y + b.h);
    ctx.lineTo(b.doorX + 18, b.y + b.h);
    ctx.stroke();
    if (occupied) {
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f4ecd5';
      ctx.fillText(houseName(b.id).toUpperCase(), b.midX, b.y - 9);
    }
  }
}

function drawObjective(ctx) {
  const { x, y, radius } = objective;
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 2;
  circle(ctx, x, y, radius, state.capture > 0 ? '#e6d8a8' : '#e8d9aa99');
  ctx.setLineDash([]);
  ctx.fillStyle = '#182219dd';
  ctx.fillRect(x - 67, y - 33, 134, 24);
  ctx.fillStyle = '#efe4bd';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('◈  ' + t('map.objective'), x, y - 16);
  ctx.strokeStyle = '#ecd79b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x, y - 5);
  ctx.stroke();
  ctx.fillStyle = '#d5bd78';
  ctx.fillRect(x, y - 5, 13, 9);
  ctx.restore();
}

// Radius that encloses the squad's formation (41 for the original five-man squad).
export function squadRadius(s) {
  let r = 0;
  for (let i = 0; i < s.men.length; i++) {
    const o = formationOffset(i, s.men.length);
    r = Math.max(r, Math.hypot(o.x, o.y));
  }
  return Math.round(r + 18);
}

function drawSquad(ctx, s) {
  const R = squadRadius(s);
  if (s.id === state.selected && alive(s).length) {
    ctx.lineWidth = 2;
    circle(ctx, s.x, s.y, R, '#e2d29c');
    if (s.path.length) {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      for (const p of s.path) ctx.lineTo(p.x, p.y);
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = '#e4d5a5c9';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      const dest = s.path.at(-1);
      circle(ctx, dest.x, dest.y, 8, '#f5e9bd');
    }
  }
  if (!s.side && alive(s).length) drawReadiness(ctx, s, R);
  for (const m of s.men) if (m.hp > 0) drawUnit(ctx, m, s, state.elapsed, 1.12);
  if (!alive(s).length) return;
  // Squad tag (coloured by state) and cohesion bar
  const c = s.cond ?? {};
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px system-ui';
  const tag = s.side ? t('map.enemy') : s.name.toUpperCase();
  const tw = Math.max(70, ctx.measureText(tag).width + 16);
  ctx.fillStyle = c.broken ? '#7a2420f0' : c.pinned ? '#7a5c1cf0' : s.side ? '#572e26ee' : '#223224ee';
  ctx.fillRect(s.x - tw / 2, s.y - R - 8, tw, 21);
  ctx.fillStyle = c.broken ? '#ffc9bd' : c.pinned ? '#ffe3a3' : s.side ? '#f2b59d' : '#dce8bf';
  ctx.fillText(tag, s.x, s.y - R + 7);
  const status = [c.broken && t('status.broken'), c.pinned && t('status.pinned'), c.barrelChange && !s.side && t('status.barrel')].filter(Boolean).join('  ');
  if (status) {
    ctx.font = 'bold 10px system-ui';
    const sw = ctx.measureText(status).width + 12;
    ctx.fillStyle = c.broken ? '#c4483cf2' : c.pinned ? '#d9a23cf2' : '#b9c4cff2';
    ctx.fillRect(s.x - sw / 2, s.y - R - 26, sw, 16);
    ctx.fillStyle = '#1b1408';
    ctx.fillText(status, s.x, s.y - R - 14);
  }
  ctx.fillStyle = '#18221a';
  ctx.fillRect(s.x - 25, s.y + R - 12, 50, 4);
  ctx.fillStyle = c.cohesion < 55 ? '#ddad74' : '#aaca86';
  ctx.fillRect(s.x - 25, s.y + R - 12, (c.cohesion ?? 100) / 2, 4);
}

// Fire readiness: a ring just outside the unit that fills clockwise from the top;
// amber while building, a fainter green when full.
function drawReadiness(ctx, s, R) {
  const r = R + 5;
  const v = (s.cond?.readiness ?? 0) / 100;
  ctx.save();
  ctx.lineWidth = 3.5;
  circle(ctx, s.x, s.y, r, '#0b120b80');
  if (v > 0) {
    ctx.strokeStyle = v >= 1 ? '#a9d36f99' : '#f2c65aee';
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, -Math.PI / 2, -Math.PI / 2 + v * Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Debug view: threat map and discomfort as coloured cells, sources with who
// fires, and the state values of every unit as numbers.
function drawDebug(ctx) {
  ctx.save();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const k = Math.max(grid.discomfort[0][i], grid.discomfort[1][i]) / 100;
      const d0 = grid.danger[0][i];
      const d1 = grid.danger[1][i];
      const x = c * CELL;
      const y = r * CELL;
      if (k > 0.01) {
        ctx.fillStyle = `rgba(240,170,40,${0.12 + 0.38 * k})`;
        ctx.fillRect(x, y, CELL, CELL);
      }
      if (d0 > 0) {
        ctx.fillStyle = `rgba(225,45,35,${0.15 + 0.25 * d0})`;
        ctx.fillRect(x, y, CELL, CELL / (d1 > 0 ? 2 : 1));
      }
      if (d1 > 0) {
        ctx.fillStyle = `rgba(60,120,235,${0.15 + 0.25 * d1})`;
        ctx.fillRect(x, y + (d0 > 0 ? CELL / 2 : 0), CELL, CELL / (d0 > 0 ? 2 : 1));
      }
    }
  ctx.strokeStyle = '#ffffff14';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= COLS; c++) {
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, H);
  }
  for (let r = 0; r <= ROWS; r++) {
    ctx.moveTo(0, r * CELL);
    ctx.lineTo(W, r * CELL);
  }
  ctx.stroke();
  ctx.font = 'bold 9px system-ui';
  ctx.textAlign = 'center';
  const placed = [];
  for (const src of threatSources()) {
    const lx = (src.c + 0.5) * CELL;
    const ly = (src.r - src.radius) * CELL - 4;
    if (placed.some(([px, py]) => Math.abs(px - lx) < 60 && Math.abs(py - ly) < 14)) continue; // one label per cluster
    placed.push([lx, ly]);
    const who = src.by === 'test' ? t('debug.test') : state.squads[src.by]?.name ?? String(src.by);
    const x = (src.c + 0.5) * CELL;
    const y = (src.r - src.radius) * CELL - 4;
    ctx.fillStyle = '#000000b0';
    ctx.fillRect(x - 18, y - 9, 36, 12);
    ctx.fillStyle = '#ffd7cf';
    ctx.fillText(who, x, y);
  }
  ctx.restore();
}

function drawDebugValues(ctx) {
  ctx.save();
  ctx.font = 'bold 10px ui-monospace, monospace';
  for (const s of state.squads) {
    if (!alive(s).length || !s.cond) continue;
    const c = s.cond;
    const lines = t('debug.values', { sup: Math.round(c.suppression), coh: Math.round(c.cohesion), rdy: Math.round(c.readiness) }).split(' · ');
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 10;
    const R = squadRadius(s);
    const left = s.x + R + 12 + w > W;
    const x = left ? s.x - R - 12 - w : s.x + R + 12;
    const y = s.y - 22;
    ctx.globalAlpha = !s.side || s.visible ? 1 : 0.55;
    ctx.fillStyle = '#0b0f0bdd';
    ctx.fillRect(x, y, w, lines.length * 13 + 5);
    ctx.fillStyle = s.side ? '#f2b59d' : '#e6f0c8';
    ctx.textAlign = 'left';
    lines.forEach((l, i) => ctx.fillText(l, x + 5, y + 13 + i * 13));
  }
  ctx.restore();
}

function drawDebugLegend(ctx) {
  const rows = [
    ['rgba(225,45,35,0.6)', t('debug.threatOwn')],
    ['rgba(60,120,235,0.6)', t('debug.threatEnemy')],
    ['rgba(240,170,40,0.5)', t('debug.discomfort')],
    [null, t('debug.tool')],
    [null, t('debug.explode')],
    [null, t('debug.zoom')],
  ];
  const x = W - 238;
  const y = H - 166;
  ctx.save();
  ctx.fillStyle = '#0b0f0be6';
  ctx.fillRect(x, y, 226, 150);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f0e6c4';
  ctx.font = 'bold 11px system-ui';
  ctx.fillText(t('debug.title'), x + 10, y + 18);
  ctx.font = '11px system-ui';
  rows.forEach(([col, text], i) => {
    const ry = y + 38 + i * 19;
    if (col) {
      ctx.fillStyle = col;
      ctx.fillRect(x + 10, ry - 10, 14, 12);
    }
    ctx.fillStyle = '#e6e0c8';
    ctx.fillText(text, x + (col ? 32 : 10), ry);
  });
  ctx.restore();
}

// Pseudo-random 0..1 from a seed, so particles stay put from frame to frame.
const rnd = (seed, k) => {
  const x = Math.sin(seed * 9301 + k * 49297) * 233280;
  return x - Math.floor(x);
};

// Impact on a material: the look teaches the cover. Wood: light splinters and a
// tan puff; stone: a pale dust cloud and grey chips; earth: dark spray and dust.
function drawImpact(ctx, e) {
  const age = e.max - e.life - (e.delay ?? 0);
  if (age < 0) return;
  const k = age / (e.max - (e.delay ?? 0)); // 0 → 1
  const back = e.dir + Math.PI; // debris flies back towards the shooter
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - k);
  if (e.material === 'stone') {
    ctx.fillStyle = '#d9d4c8';
    circle(ctx, e.x, e.y, 4 + k * 14, '#e2ddd0bb', true);
    ctx.fillStyle = '#9b9890';
    for (let i = 0; i < 5; i++) {
      const a = back + (rnd(e.seed, i) - 0.5) * 2.2;
      const d = 3 + k * (9 + rnd(e.seed, i + 9) * 12);
      ctx.fillRect(e.x + Math.cos(a) * d - 1.2, e.y + Math.sin(a) * d - 1.2, 2.4, 2.4);
    }
  } else if (e.material === 'wood') {
    circle(ctx, e.x, e.y, 3 + k * 8, '#c4a46ea0', true);
    ctx.strokeStyle = '#f0d39a';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      const a = back + (rnd(e.seed, i) - 0.5) * 2.4;
      const d0 = 2 + k * (7 + rnd(e.seed, i + 3) * 11);
      const len = 4 + rnd(e.seed, i + 7) * 4;
      const x = e.x + Math.cos(a) * d0;
      const y = e.y + Math.sin(a) * d0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a + 0.6) * len, y + Math.sin(a + 0.6) * len);
      ctx.stroke();
    }
  } else {
    circle(ctx, e.x, e.y, 3 + k * 10, '#c9b48cc0', true);
    ctx.fillStyle = '#3e2f1e';
    for (let i = 0; i < 6; i++) {
      const a = back + (rnd(e.seed, i) - 0.5) * 1.6;
      const d = 2 + k * (5 + rnd(e.seed, i + 5) * 14);
      ctx.fillRect(e.x + Math.cos(a) * d - 1.4, e.y + Math.sin(a) * d - 1.4, 2.8, 2.8);
    }
  }
  ctx.restore();
}

// Tracer: a short glowing streak flying from start to impact.
function drawTracer(ctx, e) {
  const age = e.max - e.life - e.delay;
  if (age < 0 || age > e.dur) return;
  const p = age / e.dur;
  const len = Math.min(30, Math.hypot(e.x1 - e.x0, e.y1 - e.y0));
  const dx = e.x1 - e.x0;
  const dy = e.y1 - e.y0;
  const d = Math.hypot(dx, dy) || 1;
  const hx = e.x0 + dx * p;
  const hy = e.y0 + dy * p;
  const tx = hx - (dx / d) * len;
  const ty = hy - (dy / d) * len;
  ctx.save();
  const g = ctx.createLinearGradient(tx, ty, hx, hy);
  g.addColorStop(0, '#ffb34a00');
  g.addColorStop(1, '#ffe7a8ff');
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.restore();
}

// Grenade explosion: a short flash, then a spreading cloud of dust and smoke with
// thrown earth.
function drawExplosion(ctx, e) {
  const age = e.max - e.life;
  const k = age / e.max;
  const r = e.r * 0.55;
  ctx.save();
  if (age < 0.15) {
    ctx.globalAlpha = 1 - age / 0.15;
    circle(ctx, e.x, e.y, r * 0.5, '#fff1c4', true);
    circle(ctx, e.x, e.y, r * 0.8, '#ffb85a88', true);
  }
  ctx.globalAlpha = Math.max(0, 0.85 * (1 - k));
  for (let i = 0; i < 7; i++) {
    const a = rnd(e.seed, i) * Math.PI * 2;
    const d = r * (0.2 + 0.6 * k) * rnd(e.seed, i + 11);
    circle(ctx, e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, r * (0.25 + 0.45 * k), i % 2 ? '#6b5f4c99' : '#8d826c88', true);
  }
  ctx.fillStyle = '#3e3020';
  for (let i = 0; i < 14; i++) {
    const a = rnd(e.seed, i + 30) * Math.PI * 2;
    const d = r * (0.3 + 1.1 * Math.min(1, k * 2.5)) * (0.5 + rnd(e.seed, i + 50) / 2);
    ctx.fillRect(e.x + Math.cos(a) * d - 1.2, e.y + Math.sin(a) * d - 1.2, 2.4, 2.4);
  }
  ctx.restore();
}

function drawEffects(ctx) {
  for (const e of state.effects) {
    if (e.kind === 'impact') drawImpact(ctx, e);
    else if (e.kind === 'tracer') drawTracer(ctx, e);
    else if (e.kind === 'explosion' && e.visible) drawExplosion(ctx, e);
    else if (e.kind === 'thrown' && e.visible) {
      const p = 1 - e.life / e.max;
      const x = e.x0 + (e.x1 - e.x0) * p;
      const y = e.y0 + (e.y1 - e.y0) * p - Math.sin(p * Math.PI) * 18;
      circle(ctx, x, y, 2.2, '#2b2a24', true);
    } else if (e.kind === 'order') {
      circle(ctx, e.x, e.y, 12 + (1.5 - e.life) * 15, '#f1e4b5');
    }
  }
}

// Camera shake from explosions (effects.js trauma). Only the map moves; the
// panels outside the canvas and the screen-space overlays stay still.
let shakeStrength = 1;
export const setShakeStrength = (v) => (shakeStrength = v);
function shakeOffset(t) {
  const a = shakeAmount(state) * effectRules().shake.maxOffsetPx * shakeStrength;
  return { x: a * (Math.sin(t * 47.3) + Math.sin(t * 91.7 + 1.3)) / 2, y: a * (Math.sin(t * 53.9 + 0.7) + Math.sin(t * 77.1 + 2.1)) / 2 };
}

// Edge markers: own units in contact outside the view, shown as an arrow on the
// map edge pointing at them, with the unit's name.
function drawEdgeMarkers(ctx) {
  const v = state.view;
  const cx = v.x + v.w / 2;
  const cy = v.y + v.h / 2;
  for (const s of playerSquads()) {
    if (!alive(s).length || !inContact(s) || !offScreen(s)) continue;
    const dx = s.x - cx;
    const dy = s.y - cy;
    const k = Math.min((v.w / 2 - 14 / cam.zoom) / Math.abs(dx || 1e-6), (v.h / 2 - 14 / cam.zoom) / Math.abs(dy || 1e-6));
    const p = toScreen(cx + dx * k, cy + dy * k);
    const a = Math.atan2(dy, dx);
    const pulse = 0.65 + 0.35 * Math.sin(performance.now() / 160);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(a);
    ctx.fillStyle = `rgba(232,120,70,${pulse})`;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -10);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.font = 'bold 11px system-ui';
    const label = s.name.toUpperCase();
    const w = ctx.measureText(label).width + 10;
    const lx = Math.max(4, Math.min(W - w - 4, p.x - w / 2 - Math.cos(a) * (w / 2 + 14)));
    const ly = Math.max(4, Math.min(H - 20, p.y - 8 - Math.sin(a) * 20));
    ctx.fillStyle = '#3a1c12e8';
    ctx.fillRect(lx, ly, w, 16);
    ctx.fillStyle = '#ffd2b8';
    ctx.textAlign = 'left';
    ctx.fillText(label, lx + 5, ly + 12);
  }
}

export function drawMap(ctx, cursor) {
  state.view = view();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#121812';
  ctx.fillRect(0, 0, W, H);
  // World layer: camera (zoom, position) and shake.
  const sh = shakeOffset(performance.now() / 1000);
  ctx.setTransform(cam.zoom, 0, 0, cam.zoom, sh.x - cam.x * cam.zoom, sh.y - cam.y * cam.zoom);
  if (mapLoaded) ctx.drawImage(mapImage, 0, 0, W, H);
  else drawFallbackMap(ctx);
  ctx.fillStyle = '#18211724';
  ctx.fillRect(0, 0, W, H);

  // Building outlines match the impassable walls.
  ctx.strokeStyle = '#dedbbb38';
  ctx.lineWidth = 1;
  for (const b of buildings) ctx.strokeRect(b.x, b.y, b.w, b.h);
  drawBuildings(ctx);

  const sel = state.squads[state.selected];
  if (sel && alive(sel).length && fireRules()) {
    // Spotting range of the selected unit
    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 1;
    circle(ctx, sel.x, sel.y, fireRules().spotting.rangeUnits, '#e5e8c21f');
    ctx.setLineDash([]);
  }
  drawObjective(ctx);
  if (state.debug) drawDebug(ctx);
  // Fallen soldiers first, so they lie under every living soldier.
  for (const s of state.squads) if (!s.side || s.visible) for (const m of s.men) if (m.hp <= 0) drawUnit(ctx, m, s, state.elapsed, 1.12);
  for (const s of state.squads) if (!s.side || s.visible) drawSquad(ctx, s);
  drawEffects(ctx);
  if (state.debug) drawDebugValues(ctx);
  if (cursor) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cursor.x - 8, cursor.y - 8, 16, 16);
  }

  // Screen layer: still, whatever the camera does.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawEdgeMarkers(ctx);
  if (state.debug) drawDebugLegend(ctx);
  if (state.paused && state.started && !state.ended) {
    ctx.fillStyle = '#11181155';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#eee7ca';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(t('map.pausedBanner'), W / 2, 50);
  }
}

export function drawPortrait(g) {
  g.clearRect(0, 0, 180, 90);
  const s = state.squads[state.selected];
  const m = alive(s)[0] || s.men[0];
  drawUnit(g, { ...m, x: 85, y: 45, angle: -0.55 }, s, state.elapsed, isPrototype() ? 1.9 : 2.7);
}
