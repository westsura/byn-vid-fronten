// Soldier graphics. Two modes:
// - "sprites" (default): GPT's v4-style figures, which Björn approved as the base
//   style on 2026-10-01: all German and Soviet roles (ready, prone), fallen
//   figures, and the layered walk cycle with foot lock for the German Schütze.
// - "code": the original code-drawn soldiers (soldiers.js), kept as a fallback.
// Which figure a soldier gets comes from the data (position → sprite key).
// The earlier graphics tests (v1–v3, helmet 1/2, support roles 1, walk v1) are
// in git history and reviewed in docs/art/review/.
import { drawSoldier as drawCodeSoldier } from './soldiers.js';
import { soldierPose } from './sim.js';
import { buildingAt } from './terrain.js';
import { t } from './text.js';

export const MODES = {
  sprites: { label: () => t('graphics.sprites') },
  code: { label: () => t('graphics.code') },
};

const P = '../../assets/prototype/';
const pair = (f, roles) => Object.fromEntries(roles.flatMap((r) => ['ready', 'prone'].map((p) => [`${f}-${r}-${p}`, `${f}-${r}-${p}`])));
// Supplier manifests and the frames taken from each (manifest key → sprite key).
const SOURCES = [
  {
    base: P + 'rifleman-pilot-v4/',
    manifest: P + 'request-002-v1/soviet-rifleman-registration.json', // corrected registration, same image
    map: { 'soviet-ready': 'soviet-rifleman-ready', 'soviet-prone': 'soviet-rifleman-prone' },
  },
  { base: P + 'german-helmet-v2/', map: pair('german', ['rifleman', 'leader', 'mg']) },
  { base: P + 'german-support-v1/', map: pair('german', ['assistant', 'ammo', 'deputy']) },
  {
    base: P + 'request-002-v1/',
    map: { ...pair('soviet', ['leader', 'mg', 'assistant', 'svt']), 'soviet-fallen-a': 'soviet-fallen-a', 'soviet-fallen-b': 'soviet-fallen-b' },
  },
  { base: P + 'request-002-german-fallen-v2/', map: { 'german-fallen-a': 'german-fallen-a', 'german-fallen-b': 'german-fallen-b' } },
  { base: P + 'walk-v2-layers/', map: Object.fromEntries([...Array(8)].map((_, i) => [`german-rifleman-walk-${i}`, `german-rifleman-walk-${i}`])) },
];
export const SPRITE_SOURCES = SOURCES;

let mode = 'sprites';
let frames = null; // sprite key → { image, layers?, data }
let anims = {}; // animation name → { frames, cycleDistanceUnits }
export const artMode = () => mode;
export const isPrototype = () => mode !== 'code';
export const modeBadge = () => t('graphics.badge');

export function modeFromUrl(search) {
  return new URLSearchParams(search).get('art') === 'code' ? 'code' : 'sprites';
}
export const urlForMode = (m) => (m === 'code' ? '?art=code' : '?');

const loadImage = (src) =>
  new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('Could not load ' + src));
    im.src = src;
  });

export async function loadMode(m) {
  mode = m;
  if (m === 'code') return;
  frames = {};
  anims = {};
  for (const { base, map, manifest } of SOURCES) {
    const pm = await fetch(manifest ?? base + 'manifest.json').then((r) => r.json());
    Object.assign(anims, pm.animations ?? {});
    const keys = Object.keys(map).filter((k) => pm.frames[k]);
    const files = [...new Set(keys.flatMap((k) => [pm.frames[k].file, ...Object.values(pm.frames[k].layers ?? {}).map((l) => l.file)]))];
    const imgs = Object.fromEntries(await Promise.all(files.map(async (f) => [f, await loadImage(base + f)])));
    for (const k of keys) {
      const d = pm.frames[k];
      const layers = d.layers && Object.fromEntries(Object.entries(d.layers).map(([n, l]) => [n, { image: imgs[l.file], sourceRect: l.sourceRect }]));
      frames[map[k]] = { image: imgs[d.file], layers, data: d };
    }
  }
}

const faction = (s) => (s.nation === 'de' ? 'german' : 'soviet');
export const spriteKey = (s, m, pose) => `${faction(s)}-${m.sprite}-${pose}`;

// Walk cycle frame, stepped by distance walked (m.walked): stops when the soldier
// stops and when the game is paused. `within` = distance walked inside the frame.
export function walkFrame(fac, sprite, m) {
  const a = anims[`${fac}-${sprite}-walk`];
  if (!a) return null;
  const c = a.cycleDistanceUnits;
  const per = c / a.frames.length;
  const phase = (((m.walked ?? 0) % c) + c) % c;
  const i = Math.min(a.frames.length - 1, Math.floor(phase / per));
  const frame = frames[a.frames[i]];
  return frame ? { frame, within: phase - i * per } : null;
}

export function drawUnit(g, m, s, time, scale = 1.12) {
  if (mode === 'code' || !frames) return drawCodeSoldier(g, m, s, time, scale);
  const pose = soldierPose(m, s);
  const k = scale / 1.12; // world units → drawing units
  if (pose === 'fallen') return drawFallen(g, m, s, k) ?? drawCodeSoldier(g, m, s, time, scale);
  let angle = m.angle;
  let prone = pose === 'prone';
  // Inside a house the prone figures (about 40 units long) do not fit a full squad
  // in a room, so soldiers are drawn standing, facing out from the centre.
  // Rendering only: the simulation (cover, posture rules) is unchanged.
  const home = !m.moving ? buildingAt(m.x, m.y) : null;
  if (home) prone = false;
  if (home && !m.aim) angle = Math.atan2(m.y - home.midY, m.x - home.midX);
  const w = pose === 'walk' ? walkFrame(faction(s), m.sprite, m) : null;
  const p = w?.frame ?? frames[spriteKey(s, m, prone ? 'prone' : 'ready')];
  if (!p) return drawCodeSoldier(g, m, s, time, scale);
  const d = p.data;
  const f = k / d.pixelsPerUnit;
  drawShadow(g, m, angle, scale, prone);
  g.save();
  g.translate(m.x, m.y);
  g.rotate(angle - (d.sourceForwardRadians || 0));
  if (p.layers) {
    // Layered walk frame: legs, then upper body. The planted leg is shifted back by
    // the distance walked since the frame began, so its foot keeps its ground position.
    for (const name of ['leg-left', 'leg-right', 'upper']) {
      const l = p.layers[name];
      const dx = name === `leg-${d.plantedLeg}` ? -w.within : 0;
      const [lx, ly, lw, lh] = l.sourceRect;
      g.drawImage(l.image, lx, ly, lw, lh, (-d.pivot[0] + dx * d.pixelsPerUnit) * f, -d.pivot[1] * f, lw * f, lh * f);
    }
  } else {
    const [sx, sy, sw, sh] = d.sourceRect;
    g.drawImage(p.image, sx, sy, sw, sh, -d.pivot[0] * f, -d.pivot[1] * f, sw * f, sh * f);
  }
  if ((m.flash || 0) > 0 && d.muzzle) {
    // Muzzle flash at the supplied muzzle point.
    const mx = (d.muzzle[0] - d.pivot[0]) * f;
    const my = (d.muzzle[1] - d.pivot[1]) * f;
    g.fillStyle = '#ffe1a0';
    g.beginPath();
    g.moveTo(mx, my - 1.2 * k);
    g.lineTo(mx + 6 * k, my);
    g.lineTo(mx, my + 1.2 * k);
    g.closePath();
    g.fill();
  }
  g.restore();
  return p;
}

// Fallen figure: variant a/b alternates within the unit so neighbours differ; the
// engine dims it (the supplier delivers full opacity).
export const FALLEN_ALPHA = 0.8;
function drawFallen(g, m, s, k) {
  const p = frames[`${faction(s)}-fallen-${((m.idx ?? 0) + (s.id ?? 0)) % 2 ? 'b' : 'a'}`];
  if (!p) return null;
  const d = p.data;
  const f = k / d.pixelsPerUnit;
  const [sx, sy, sw, sh] = d.sourceRect;
  g.save();
  g.globalAlpha *= FALLEN_ALPHA;
  g.translate(m.x, m.y);
  g.rotate(m.angle - (d.sourceForwardRadians || 0));
  g.drawImage(p.image, sx, sy, sw, sh, -d.pivot[0] * f, -d.pivot[1] * f, sw * f, sh * f);
  g.restore();
  return p;
}

// Faint contact shadow close to the body.
function drawShadow(g, m, angle, scale, prone) {
  g.save();
  g.translate(m.x, m.y);
  g.rotate(angle);
  const rx = (prone ? 10 : 5.5) * scale;
  const ry = (prone ? 4 : 5) * scale;
  g.translate((prone ? -4 : -0.5) * scale, 0.8 * scale);
  g.scale(1, ry / rx);
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  grad.addColorStop(0, '#10160f59');
  grad.addColorStop(1, '#10160f00');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, rx, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
