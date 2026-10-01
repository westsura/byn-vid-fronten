// Canvas rendering of the map, buildings, squads and effects. Reads state only.
import { W, H } from './config.js';
import { buildings, objective } from './scenario.js';
import { state, alive, formationOffset } from './sim.js';
import { buildingAt } from './terrain.js';
import { drawUnit, isPrototype } from './art.js';

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
      ctx.fillText(b.name.toUpperCase(), b.midX, b.y - 9);
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
  ctx.fillText('◈  GÅRDSPLANEN', x, y - 16);
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
  for (const m of s.men) if (m.hp > 0) drawUnit(ctx, m, s, state.elapsed, 1.12);
  if (!alive(s).length) return;
  // Squad tag and morale bar
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px system-ui';
  ctx.fillStyle = s.side ? '#572e26ee' : '#223224ee';
  ctx.fillRect(s.x - 35, s.y - R - 8, 70, 21);
  ctx.fillStyle = s.side ? '#f2b59d' : '#dce8bf';
  ctx.fillText(s.side ? 'FIENDE' : s.name.toUpperCase(), s.x, s.y - R + 7);
  ctx.fillStyle = '#18221a';
  ctx.fillRect(s.x - 25, s.y + R - 12, 50, 4);
  ctx.fillStyle = s.morale < 40 ? '#ddad74' : '#aaca86';
  ctx.fillRect(s.x - 25, s.y + R - 12, s.morale / 2, 4);
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
  // Fallen soldiers first, so they lie under every living soldier.
  for (const s of state.squads) if (!s.side || s.visible) for (const m of s.men) if (m.hp <= 0) drawUnit(ctx, m, s, state.elapsed, 1.12);
  for (const s of state.squads) if (!s.side || s.visible) drawSquad(ctx, s);
  drawEffects(ctx);

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
    ctx.fillText('PAUSAD — GE DINA ORDER', W / 2, 50);
  }
}

export function drawPortrait(g) {
  g.clearRect(0, 0, 180, 90);
  const s = state.squads[state.selected];
  const m = alive(s)[0] || s.men[0];
  drawUnit(g, { ...m, x: 85, y: 45, angle: -0.55 }, s, state.elapsed, isPrototype() ? 1.9 : 2.7);
}
