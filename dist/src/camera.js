// Camera over the map: which part of the world is on the canvas. For now the
// whole map is shown (zoom 1); step 4 brings the fixed zoom levels. A provisional
// test zoom (Z) shows half the map around the selected unit, so that edge markers
// for contact off screen can be seen and tested.
import { W, H } from './config.js';

export const cam = { x: 0, y: 0, zoom: 1 };

export const view = () => ({ x: cam.x, y: cam.y, w: W / cam.zoom, h: H / cam.zoom });

export function setZoom(zoom, focus) {
  cam.zoom = zoom;
  const v = view();
  cam.x = Math.max(0, Math.min(W - v.w, (focus?.x ?? W / 2) - v.w / 2));
  cam.y = Math.max(0, Math.min(H - v.h, (focus?.y ?? H / 2) - v.h / 2));
}

// Canvas coordinates (in the canvas's logical W × H pixels) → world coordinates.
export const toWorld = (cx, cy) => ({ x: cam.x + cx / cam.zoom, y: cam.y + cy / cam.zoom });
export const toScreen = (x, y) => ({ x: (x - cam.x) * cam.zoom, y: (y - cam.y) * cam.zoom });
