// Camera over the map (DESIGN.md, Order och kontroll – Val och kamera; Zoomnivåer).
// Three fixed zoom levels from data/rules/camera.json: whole map, platoon, unit.
// The zoom changes only when the player changes level. Selecting a unit does not
// move the camera; a double-click, a second hotkey press or a click on an edge
// marker centres it with a short glide. The camera can be panned (right-drag,
// Shift+arrow keys). Camera time is real time: it moves while the game is paused.
import { W, H } from './config.js';

let P = null;
export const cam = { x: 0, y: 0, zoom: 1, level: 0, glide: null };

export function setCameraRules(rules) {
  P = rules;
  setLevel(0);
}
export const cameraRules = () => P;
export const levelInfo = () => P?.levels[cam.level] ?? { zoom: 1, shake: 1, sound: 1, effects: 1 };

export const view = () => ({ x: cam.x, y: cam.y, w: W / cam.zoom, h: H / cam.zoom });

function clamp() {
  const v = view();
  cam.x = Math.max(0, Math.min(W - v.w, cam.x));
  cam.y = Math.max(0, Math.min(H - v.h, cam.y));
}

function centreOn(x, y) {
  const v = view();
  cam.x = x - v.w / 2;
  cam.y = y - v.h / 2;
  clamp();
}

// Change zoom level; the view is centred on `focus` (the selected unit) when
// zooming in, and on the current centre otherwise.
export function setLevel(i, focus) {
  if (!P) return;
  i = Math.max(0, Math.min(P.levels.length - 1, i));
  const v = view();
  const centre = focus ?? { x: cam.x + v.w / 2, y: cam.y + v.h / 2 };
  cam.level = i;
  cam.zoom = P.levels[i].zoom;
  cam.glide = null;
  centreOn(centre.x, centre.y);
}
export const levelIndex = (id) => P.levels.findIndex((l) => l.id === id);

// Kept for tests and tools: an arbitrary zoom centred on focus.
export function setZoom(zoom, focus) {
  cam.zoom = zoom;
  centreOn(focus?.x ?? W / 2, focus?.y ?? H / 2);
}

// Quick glide (not a jump) to centre (x, y).
export function glideTo(x, y) {
  const v = view();
  const tx = Math.max(0, Math.min(W - v.w, x - v.w / 2));
  const ty = Math.max(0, Math.min(H - v.h, y - v.h / 2));
  cam.glide = { fx: cam.x, fy: cam.y, tx, ty, t: 0, dur: P?.glideS ?? 0.35 };
}

export function pan(dx, dy) {
  cam.glide = null;
  cam.x += dx;
  cam.y += dy;
  clamp();
}

export function updateCamera(dt) {
  const g = cam.glide;
  if (!g) return;
  g.t = Math.min(g.dur, g.t + dt);
  const k = g.t / g.dur;
  const e = 1 - (1 - k) ** 3; // ease out
  cam.x = g.fx + (g.tx - g.fx) * e;
  cam.y = g.fy + (g.ty - g.fy) * e;
  if (k >= 1) cam.glide = null;
}

// Canvas coordinates (in the canvas's logical W × H pixels) → world coordinates.
export const toWorld = (cx, cy) => ({ x: cam.x + cx / cam.zoom, y: cam.y + cy / cam.zoom });
export const toScreen = (x, y) => ({ x: (x - cam.x) * cam.zoom, y: (y - cam.y) * cam.zoom });
