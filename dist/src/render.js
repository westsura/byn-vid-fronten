// Canvas rendering of the map, buildings, squads and effects. Reads state only.
import { W, H } from './config.js';
import { buildings, objective } from './scenario.js';
import { state, alive, formationOffset, houseName } from './sim.js';
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
  // Squad tag (coloured by state) and morale bar
  const c = s.cond ?? {};
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px system-ui';
  const tag = s.side ? t('map.enemy') : s.name.toUpperCase();
  const tw = Math.max(70, ctx.measureText(tag).width + 16);
  ctx.fillStyle = c.broken ? '#7a2420f0' : c.pinned ? '#7a5c1cf0' : s.side ? '#572e26ee' : '#223224ee';
  ctx.fillRect(s.x - tw / 2, s.y - R - 8, tw, 21);
  ctx.fillStyle = c.broken ? '#ffc9bd' : c.pinned ? '#ffe3a3' : s.side ? '#f2b59d' : '#dce8bf';
  ctx.fillText(tag, s.x, s.y - R + 7);
  const status = [c.broken && t('status.broken'), c.pinned && t('status.pinned')].filter(Boolean).join('  ');
  if (status) {
    ctx.font = 'bold 10px system-ui';
    const sw = ctx.measureText(status).width + 12;
    ctx.fillStyle = c.broken ? '#c4483cf2' : '#d9a23cf2';
    ctx.fillRect(s.x - sw / 2, s.y - R - 26, sw, 16);
    ctx.fillStyle = '#1b1408';
    ctx.fillText(status, s.x, s.y - R - 14);
  }
  ctx.fillStyle = '#18221a';
  ctx.fillRect(s.x - 25, s.y + R - 12, 50, 4);
  ctx.fillStyle = s.morale < 40 ? '#ddad74' : '#aaca86';
  ctx.fillRect(s.x - 25, s.y + R - 12, s.morale / 2, 4);
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
  ];
  const x = W - 238;
  const y = H - 128;
  ctx.save();
  ctx.fillStyle = '#0b0f0be6';
  ctx.fillRect(x, y, 226, 112);
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

function drawEffects(ctx) {
  for (const e of state.effects) {
    if (e.kind === 'shot' && e.visible) {
      ctx.strokeStyle = '#f8e9a4b0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.tx, e.ty);
      ctx.stroke();
      circle(ctx, e.x, e.y, 5, '#ffeac1', true);
    } else if (e.kind === 'order') {
      circle(ctx, e.x, e.y, 12 + (1.5 - e.life) * 15, '#f1e4b5');
    }
  }
}

export function drawMap(ctx, cursor) {
  ctx.clearRect(0, 0, W, H);
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
  if (sel && alive(sel).length) {
    // Approximate firing range of the selected squad
    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 1;
    circle(ctx, sel.x, sel.y, 290, '#e5e8c21f');
    ctx.setLineDash([]);
  }
  drawObjective(ctx);
  if (state.debug) drawDebug(ctx);
  // Fallen soldiers first, so they lie under every living soldier.
  for (const s of state.squads) if (!s.side || s.visible) for (const m of s.men) if (m.hp <= 0) drawUnit(ctx, m, s, state.elapsed, 1.12);
  for (const s of state.squads) if (!s.side || s.visible) drawSquad(ctx, s);
  drawEffects(ctx);
  if (state.debug) {
    drawDebugValues(ctx);
    drawDebugLegend(ctx);
  }

  if (cursor) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cursor.x - 8, cursor.y - 8, 16, 16);
  }
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
