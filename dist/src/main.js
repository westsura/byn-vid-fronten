// Entry point: wires simulation, rendering, UI and audio together and runs the loop.
import { W, H } from './config.js';
import { state, hooks, update, pause } from './sim.js';
import { loadMap, drawMap, drawPortrait } from './render.js';
import { renderUI, toast, showResult, bindInput, cursor } from './ui.js';
import { fireSound } from './audio.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const portrait = document.getElementById('soldierDetail').getContext('2d');

hooks.changed = renderUI;
hooks.toast = toast;
hooks.shot = fireSound;
hooks.finished = showResult;

loadMap('map.png', () => toast('Kartbilden kunde inte laddas. Försök ladda om sidan.'));
bindInput(canvas, W, H);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});

let last = performance.now();
let uiTimer = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!state.paused && !state.ended) {
    update(dt);
    uiTimer += dt;
    if (uiTimer > 0.2) {
      renderUI();
      uiTimer = 0;
    }
  }
  drawMap(ctx, cursor);
  drawPortrait(portrait);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
