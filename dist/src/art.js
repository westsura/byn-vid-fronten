// Graphics modes. "standard" is the code-drawn soldier (production fallback).
// "infantry-v1" is a PROTOTYPE sprite set (German 10-man and Soviet 11-man squads)
// for evaluation only; it is opt-in via ?art=infantry-v1&side=soviet|german.
// "pilot-v2" (GRAFIKPROV V2) replaces only the plain riflemen (German Schütze with
// K98k, Soviet Rifleman with M1891/30) by the rifleman-pilot-v2 images for ready and
// prone; all other roles and states keep the infantry-v1 sprites.
// "pilot-v3" (GRAFIKPROV V3) is the same scope with the corrected two-pose sheets.
// URL options for v3 comparisons: &scale=helmet (pixelsPerUnitHelmetMatched instead
// of pixelsPerUnit) and &shadow=none|small|oval (default small contact shadow).
import { drawSoldier as drawCodeSoldier } from './soldiers.js';
import { soldierPose } from './sim.js';
import { buildingAt } from './terrain.js';
import { drawSoldier as drawSprite } from '../assets/prototype/infantry-v1/draw-soldier.js';

const BASE = 'assets/prototype/infantry-v1/';
export const MODES = {
  standard: { label: 'Standardgrafik' },
  'infantry-v1:soviet': { label: 'PROTOTYP infanteri v1 – du leder sovjetisk grupp (11)' },
  'infantry-v1:german': { label: 'PROTOTYP infanteri v1 – du leder tysk grupp (10)' },
  'pilot-v2:soviet': { label: 'GRAFIKPROV V2 gevärsskytt – du leder sovjetisk grupp (11)' },
  'pilot-v2:german': { label: 'GRAFIKPROV V2 gevärsskytt – du leder tysk grupp (10)' },
  'pilot-v3:soviet': { label: 'GRAFIKPROV V3 gevärsskytt – du leder sovjetisk grupp (11)' },
  'pilot-v3:german': { label: 'GRAFIKPROV V3 gevärsskytt – du leder tysk grupp (10)' },
  'pilot-v4:soviet': { label: 'GRAFIKPROV V4 gevärsskytt – du leder sovjetisk grupp (11)' },
  'pilot-v4:german': { label: 'GRAFIKPROV V4 gevärsskytt – du leder tysk grupp (10)' },
};
const PILOT_BASE = {
  'pilot-v2': 'assets/prototype/rifleman-pilot-v2/',
  'pilot-v3': 'assets/prototype/rifleman-pilot-v3/',
  'pilot-v4': 'assets/prototype/rifleman-pilot-v4/',
};
let pilot = null; // { 'german-ready': {data, image}, ... } normalised: sourceRect-relative pivot/muzzle
export const pilotOptions = { scale: 'standard', shadow: 'small', spacing: 1 };
export const isPilotV2 = () => mode.startsWith('pilot-v2');
export const isPilotV3 = () => mode.startsWith('pilot-v3') || mode.startsWith('pilot-v4'); // v3+ share shadow/scale options
export const pilotVersion = () => (mode.match(/^pilot-v(\d)/) || [])[1] ?? null;
export const modeBadge = () =>
  isPilotV3()
    ? `GRAFIKPROV V${pilotVersion()} – EJ GODKÄNT` +
      (pilotOptions.scale === 'helmet' ? ' · HJÄLMSKALA' : '') +
      (pilotOptions.spacing !== 1 ? ` · AVSTÅND ×${pilotOptions.spacing}` : '')
    : isPilotV2() ? 'GRAFIKPROV V2 – EJ GODKÄNT' : 'PROTOTYPGRAFIK · EJ GODKÄND';
export const pilotFrame = (key) => pilot?.[key] ?? null;
// Which soldiers the v2 pilot covers: plain riflemen only.
export const pilotCovers = (faction, m) =>
  faction === 'german' ? m.title === 'Schütze' && m.weapon === 'kar98k' : m.title === 'Rifleman' && m.weapon === 'M1891/30';

let mode = 'standard';
let atlases = null; // { german: {data, image}, soviet: {data, image} }
export const artMode = () => mode;
export const isPrototype = () => mode !== 'standard';

export function modeFromUrl(search) {
  const q = new URLSearchParams(search);
  const art = q.get('art');
  if (q.get('scale') === 'helmet') pilotOptions.scale = 'helmet';
  if (['none', 'small', 'oval'].includes(q.get('shadow'))) pilotOptions.shadow = q.get('shadow');
  if (q.get('spacing') === 'wide') pilotOptions.spacing = 1.5;
  if (!['infantry-v1', 'pilot-v2', 'pilot-v3', 'pilot-v4'].includes(art)) return 'standard';
  return `${art}:${q.get('side') === 'german' ? 'german' : 'soviet'}`;
}

export function urlForMode(m) {
  if (m === 'standard') return '?';
  const [art, side] = m.split(':');
  return `?art=${art}&side=${side}`;
}

const FACTION_LABEL = { german: 'Tysk grupp', soviet: 'Sovjetisk grupp' };
export const factionLabel = (f) => FACTION_LABEL[f] ?? 'Infanteri';

// Build a force (see sim.setForces) from a supplier squad definition.
export function rosterFrom(faction, squadDef, atlas) {
  const list = squadDef.soldiers;
  return list.map((s, i) => {
    const title = s.name ?? s.role;
    const weapon = (s.weapons ?? [s.weapon])[0];
    const isLeader = i === 0;
    const isMG = /mg34|^dp$/i.test(weapon);
    return {
      role: isLeader ? 'leader' : isMG ? 'mg' : 'rifleman',
      weapon,
      title,
      subunit: s.subunit ?? s.element ?? null,
      spriteRole: atlas.squadRoleIndices[i],
    };
  });
}

export async function loadMode(m) {
  mode = m;
  if (m === 'standard') return null;
  const [manifest, german, soviet] = await Promise.all(
    ['manifest.json', 'german-squad.json', 'soviet-squad.json'].map((f) => fetch(BASE + f).then((r) => r.json())),
  );
  const load = (file, base = BASE) =>
    new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('Kunde inte ladda ' + file));
      im.src = base + file;
    });
  const [gImg, sImg] = await Promise.all([load(manifest.atlases.german.file), load(manifest.atlases.soviet.file)]);
  atlases = {
    german: { data: manifest.atlases.german, image: gImg },
    soviet: { data: manifest.atlases.soviet, image: sImg },
  };
  const pilotKey = m.split(':')[0];
  if (PILOT_BASE[pilotKey]) {
    const base = PILOT_BASE[pilotKey];
    const pm = await fetch(base + 'manifest.json').then((r) => r.json());
    const keys = ['german-ready', 'german-prone', 'soviet-ready', 'soviet-prone'];
    const table = pm.frames ?? pm.assets; // v3: frames (sourceRect-relative), v2: assets (whole image)
    const files = [...new Set(keys.map((k) => table[k].file))];
    const imgs = Object.fromEntries(await Promise.all(files.map(async (f) => [f, await load(f, base)])));
    pilot = Object.fromEntries(
      keys.map((k) => {
        const d = table[k];
        const img = imgs[d.file];
        return [k, { image: img, data: { ...d, sourceRect: d.sourceRect ?? [0, 0, img.width, img.height] } }];
      }),
    );
  }
  const playerFaction = m.endsWith(':german') ? 'german' : 'soviet';
  const enemyFaction = playerFaction === 'german' ? 'soviet' : 'german';
  const defs = { german, soviet };
  return {
    id: m,
    spacing: pilotOptions.spacing,
    player: { faction: playerFaction, soldiers: rosterFrom(playerFaction, defs[playerFaction], atlases[playerFaction].data) },
    enemy: { faction: enemyFaction, soldiers: rosterFrom(enemyFaction, defs[enemyFaction], atlases[enemyFaction].data) },
  };
}

// Engine pose → sprite state. Walk/crawl frames are marked redraw-required and the
// supplier adapter substitutes ready/prone unless allowDraft is set (it is not).
// The supplied "fire" frames are prone, so they are only used for prone soldiers.
export function spriteState(m, s) {
  const pose = soldierPose(m, s);
  if (pose === 'fallen') return 'fallen';
  const step = Math.floor(((m.stride || 0) + m.phase) / 3) % 2 ? 'b' : 'a';
  if (pose === 'prone') {
    if ((m.flash || 0) > 0) return 'fire';
    return m.moving ? `crawl-${step}` : 'prone';
  }
  return pose === 'walk' ? `walk-${step}` : 'ready';
}

export function drawUnit(g, m, s, time, scale = 1.12) {
  if (mode === 'standard' || !s.faction || !atlases) return drawCodeSoldier(g, m, s, time, scale);
  const a = atlases[s.faction];
  let state = spriteState(m, s);
  let angle = m.angle;
  // Inside a house the prone sprites (40-53 units long) do not fit 10-11 men in a
  // 100-unit room, so soldiers are drawn standing, facing out from the centre.
  // Rendering only: the simulation (cover, posture rules) is unchanged.
  const home = m.hp > 0 && !m.moving ? buildingAt(m.x, m.y) : null;
  if (home && (state === 'prone' || state === 'fire')) state = 'ready';
  if (home && !m.aim) angle = Math.atan2(m.y - home.midY, m.x - home.midX);
  const k = scale / 1.12; // world units → drawing units
  const usePilot = pilot && pilotCovers(s.faction, m) && state !== 'fallen';
  const prone = state !== 'ready' && !state.startsWith('walk');
  drawShadow(g, m, angle, scale, state, usePilot && isPilotV3() ? pilotOptions.shadow : 'oval', prone);
  if (usePilot) {
    // Pilot riflemen: ready / prone only. fire → prone, walk → ready, crawl → prone.
    const p = pilot[`${s.faction}-${prone ? 'prone' : 'ready'}`];
    const d = p.data;
    const ppu = pilotOptions.scale === 'helmet' && d.pixelsPerUnitHelmetMatched ? d.pixelsPerUnitHelmetMatched : d.pixelsPerUnit;
    const f = k / ppu;
    const [sx, sy, sw, sh] = d.sourceRect;
    g.save();
    g.translate(m.x, m.y);
    g.rotate(angle - (d.sourceForwardRadians || 0));
    g.drawImage(p.image, sx, sy, sw, sh, -d.pivot[0] * f, -d.pivot[1] * f, sw * f, sh * f);
    if ((m.flash || 0) > 0) {
      // Muzzle flash at the supplied muzzle point (manual estimate in the manifest).
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
  return drawSprite(g, a.image, a.data, { role: m.spriteRole ?? 0, state, x: m.x, y: m.y, angle, scale: k });
}

// Ground shadows. 'oval' is the large soft oval used since v1; 'small' is a faint
// contact shadow close to the body (v3 suggestion); 'none' draws nothing.
function drawShadow(g, m, angle, scale, state, kind, prone) {
  if (kind === 'none') return;
  g.save();
  g.translate(m.x, m.y);
  g.rotate(angle);
  if (kind === 'small') {
    const rx = (prone ? 10 : 5.5) * scale;
    const ry = (prone ? 4 : 5) * scale;
    const cx = (prone ? -4 : -0.5) * scale;
    g.translate(cx, 0.8 * scale);
    g.scale(1, ry / rx);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, '#10160f59');
    grad.addColorStop(1, '#10160f00');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(0, 0, rx, 0, Math.PI * 2);
    g.fill();
  } else {
    g.fillStyle = state === 'fallen' ? '#10160f40' : '#10160f66';
    g.beginPath();
    g.ellipse(-1 * scale, 2 * scale, (prone ? 15 : 11) * scale, (prone ? 6 : 8) * scale, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}
