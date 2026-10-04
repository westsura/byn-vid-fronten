// Entry point: wires simulation, rendering, UI and audio together and runs the loop.
import { W, H } from './config.js';
import { hooks, step, pause, setForces, setRules } from './sim.js';
import { loadData, validate, buildSide } from './data.js';
import { setText, t } from './text.js';
import { loadMode, modeFromUrl } from './art.js';
import { loadMap, drawMap, drawPortrait } from './render.js';
import { renderUI, toast, showResult, bindInput, applyStaticText, cursor } from './ui.js';
import { fireSound, explosionSound, setVolume } from './audio.js';
import { setCameraRules, updateCamera, levelInfo, toScreen } from './camera.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const portrait = document.getElementById('soldierDetail').getContext('2d');

hooks.changed = renderUI;
hooks.toast = toast;
// Sounds are panned by where they are on screen, not on the map.
const screenX = (x) => toScreen(x, 0).x;
hooks.shot = (x) => fireSound(screenX(x));
hooks.boom = (x) => explosionSound(screenX(x));
hooks.finished = showResult;

// Game data (units, people, weapons, ranks, text) from dist/data. Problems in the
// data are reported in the console; the game still starts with what loaded.
const db = await loadData((path) => fetch('data/' + path).then((r) => r.json()));
setText(db.text);
applyStaticText();
const problems = validate(db);
if (problems.length) console.warn('Data problems:', problems);
setRules(db);
setCameraRules(db.rules.camera);
setForces({ player: buildSide(db, 'player'), enemy: buildSide(db, 'enemy') });

loadMap('map.png', () => toast(t('toast.mapFailed')));
try {
  await loadMode(modeFromUrl(location.search));
} catch (err) {
  console.error(err);
  await loadMode('code');
  setTimeout(() => toast(t('toast.graphicsFailed')), 500);
}
bindInput(canvas, W, H);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});

let last = performance.now();
let uiTimer = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  updateCamera(dt); // real time: the camera glides also while paused
  setVolume(levelInfo().sound);
  if (step(dt)) {
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
