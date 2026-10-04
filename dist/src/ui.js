// DOM side panel, overlays and input handling.
import { MISSION_TIME, HOLD_TIME } from './config.js';
import { state, alive, playerSquads, select, selectGroup, groupUnits, issue, defend, retreat, split, merge, canSplit, setMode, setHalfSpeed, togglePause, reset, orderText, houseName, testGrenade, orderRulesUI, setSector, setOpening, unitsPerMetre, setLeaderMode } from './sim.js';
import { leaderInfo, traitOf, MODES as LEADER_MODES } from './leaders.js';
import { buildingAt, coverAt } from './terrain.js';
import { setSound, soundEnabled, resumeAudio } from './audio.js';
import { MODES, artMode, isPrototype, urlForMode, modeBadge } from './art.js';
import { t } from './text.js';
import { toggleTestFire } from './threat.js';
import { toWorld, cam, setLevel, levelIndex, cameraRules, glideTo, pan } from './camera.js';
import { squadRadius, setShakeStrength, edgeMarkers } from './render.js';

const $ = (id) => document.getElementById(id);
export let cursor = null;

const clock = (sec) => String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

export function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2700);
}

export function showResult(win, text) {
  $('result').hidden = false;
  $('resultTitle').textContent = t(win ? 'brief.won' : 'brief.lost');
  $('resultText').textContent = text;
}

function setHTML(el, html) {
  // Only touch the DOM when content changes, so hover and focus are kept.
  if (el.innerHTML !== html) el.innerHTML = html;
}

// ---- Unit panel (DESIGN.md, Enhetspanel utanför kartan) -------------------------
// One card per unit in platoon order: name, men fit to fight, leader with rank
// abbreviation, state and fire readiness. A split Gruppe is one block with two
// half-cards (MG-Trupp, Schützentrupp) that can be selected one at a time or
// together (click the block's header), and a Merge button.
const stateKey = (c) => (c.broken ? 'broken' : c.pinned ? 'pinned' : c.cohesion < 55 ? 'shaken' : 'steady');
// Compact leader on the card: rank abbreviation, surname and trait icon ("Fw. Krause ⚑").
function leaderText(s) {
  const info = leaderInfo(s);
  if (!info.man) return t('panel.noLeader');
  const tr = info.trait;
  const icon = tr ? ` <span class="trait-icon" title="${t('traits.' + tr.id + '.name')}: + ${t('traits.' + tr.id + '.pro')} / − ${t('traits.' + tr.id + '.con')}">${tr.icon}</span>` : '';
  return `${info.man.rank.abbr} ${info.man.last}${icon}${info.standIn ? ` <span class="standin">(${t('leaders.standIn')})</span>` : ''}`;
}

// Leader block in the orders panel: values as five boxes, the trait with its
// advantage and drawback, and for platoon leaders the mode buttons.
const boxes = (v) => '■'.repeat(v) + '□'.repeat(5 - v);
function leaderBlock(m, values, trait, withModes) {
  const mode = state.leaderModes?.[m.personId] ?? null;
  const tr = trait ? `<div class="trait"><span class="trait-icon">${trait.icon}</span> <b>${t('traits.' + trait.id + '.name')}</b><span class="pro">+ ${t('traits.' + trait.id + '.pro')}</span><span class="con">− ${t('traits.' + trait.id + '.con')}</span></div>` : `<div class="trait muted">${t('leaders.noTrait')}</div>`;
  const modes = withModes
    ? `<div class="modes" role="group">${[...LEADER_MODES, null].map((md) => `<button class="mini ${mode === md ? 'active' : ''}" data-mode="${md}" data-person="${m.personId}" title="${md ? t('leaders.modeHelp.' + md) : ''}">${t('leaders.modes.' + md)}</button>`).join('')}</div>`
    : '';
  return `<div class="leader-card ${m.hp > 0 ? '' : 'out'}"><div class="lc-head"><span class="pos">${m.title}</span><b>${m.rank.abbr} ${m.name}</b></div>
<div class="values"><span>${t('leaders.leadership')}</span><span class="bx">${boxes(values.leadership)}</span><span>${t('leaders.fireControl')}</span><span class="bx">${boxes(values.fireControl)}</span><span>${t('leaders.rally')}</span><span class="bx">${boxes(values.rally)}</span></div>${tr}${modes}</div>`;
}
function leadersHTML(s) {
  if (!s || !alive(s).length) return '';
  if (s.kind === 'hq') return s.men.filter((m) => m.leader).map((m) => leaderBlock(m, m.leader, traitOf(m.leader.trait), m.hp > 0)).join('');
  const info = leaderInfo(s);
  return info.man ? leaderBlock(info.man, info.values, info.trait, false) : '';
}

function unitCard(s, half = false) {
  const n = alive(s).length;
  const c = s.cond;
  const st = stateKey(c);
  const sel = state.selection.includes(s.id);
  const name = half ? s.teams.find((tm) => tm.id === s.team)?.name ?? s.name : s.groupName ?? s.name;
  const splitBtn = !half && s.teams && !s.team ? `<button class="mini" data-split="${s.id}" ${canSplit(s) && !state.ended ? '' : 'disabled'}>${t('buttons.split')}</button>` : '';
  return `<div class="squad ${half ? 'half' : ''} ${sel ? 'selected' : ''} ${n ? '' : 'out'} st-${st}" role="button" tabindex="0" data-squad="${s.id}" aria-pressed="${sel}">
<div class="squad-top">${half ? '' : `<span class="number">${s.hotkey ?? ''}</span>`}<strong>${name}</strong><span class="count" title="${t('panel.fitTitle')}">${n} / ${s.men.length}</span></div>
<div class="squad-mid"><span class="leader">${n ? leaderText(s) : ''}</span><span class="state">${n ? t('morale.' + st) : t('panel.out')}</span></div>
<div class="squad-bottom"><span>${n ? orderText(s) : ''}</span>${splitBtn}</div>
<div class="bars"><div class="bar" title="${t('panel.readiness')}"><span class="rdy" style="width:${Math.round(c.readiness)}%"></span></div><div class="bar" title="${t('panel.cohesion')}"><span class="coh" style="width:${Math.round(c.cohesion)}%"></span></div></div></div>`;
}

function forcesHTML() {
  const units = playerSquads();
  const groups = [...new Set(units.map((s) => s.group))];
  return groups
    .map((g) => {
      const parts = units.filter((s) => s.group === g);
      if (parts.length < 2) return unitCard(parts[0]);
      const both = parts.every((q) => state.selection.includes(q.id));
      const [a] = parts;
      return `<div class="squad-pair ${both ? 'selected' : ''}">
<div class="pair-head" role="button" tabindex="0" data-group="${g}"><span class="number">${a.hotkey ?? ''}</span><strong>${a.groupName}</strong><span class="count">${parts.reduce((n, q) => n + alive(q).length, 0)} / ${parts.reduce((n, q) => n + q.men.length, 0)}</span><button class="mini" data-merge="${a.id}" ${state.ended ? 'disabled' : ''}>${t('buttons.merge')}</button></div>
<div class="halves">${parts.map((q) => unitCard(q, true)).join('')}</div></div>`;
    })
    .join('');
}

// Rounds left as a share of what the unit carried at the start.
const ammoPercent = (s) => {
  const full = s.men.reduce((n, m) => n + (m.ammoFull ?? 0), 0);
  return full ? Math.round((100 * s.men.reduce((n, m) => n + (m.hp > 0 ? m.ammo : 0), 0)) / full) : 0;
};

export function renderUI() {
  const s = state.squads[state.selected];
  const n = alive(s).length;
  $('phase').textContent = t(state.ended ? 'phase.ended' : state.paused ? (state.started ? 'phase.paused' : 'phase.planning') : 'phase.running');
  $('pause').textContent = t(state.paused ? (state.started ? 'buttons.resume' : 'buttons.begin') : 'buttons.pause');
  $('pause').disabled = state.ended;
  $('clock').textContent = clock(Math.max(0, Math.ceil(MISSION_TIME - state.elapsed)));
  $('captureBar').style.width = (state.capture / HOLD_TIME) * 100 + '%';
  $('captureTime').textContent = Math.floor(state.capture) + ' / ' + HOLD_TIME + ' s';
  $('captureText').textContent = t(state.capture > 0 ? 'panel.securing' : 'panel.noControl');
  $('forceCount').textContent = t('panel.men', { n: playerSquads().reduce((sum, q) => sum + alive(q).length, 0) });
  setHTML($('squads'), forcesHTML());

  const lead = s.men.find((m) => m.slot === s.leaderSlot && m.hp > 0) ?? alive(s)[0] ?? s.men[0];
  $('selectedName').textContent = s.name + (lead?.rank ? ' · ' + lead.rank.abbr + ' ' + lead.last : '');
  const house = buildingAt(s.x, s.y);
  const cover = coverAt(s.x, s.y);
  $('cover').textContent = house ? houseName(house.id) : t(cover > 0.6 ? 'cover.building' : cover > 0.3 ? 'cover.vegetation' : 'cover.open');
  $('ammo').textContent = ammoPercent(s) + ' %';
  $('currentOrder').textContent = n ? orderText(s) : t('panel.out');
  $('posture').textContent = t(
    !n ? 'posture.out'
    : s.cond.pinned ? 'posture.pinned'
    : s.order === 'defend' ? 'posture.defending'
    : s.path.length ? 'posture.moving' : 'posture.ready',
  );
  // Orders: the active map-click mode is highlighted; Split/Merge follows the unit.
  for (const m of ['move', 'fast', 'crawl', 'fire', 'sector']) $(m).classList.toggle('active', state.mode === m);
  // Opening range for a unit covering a sector.
  const row = $('openingRow');
  row.hidden = !(n && s.sector);
  if (s.sector && document.activeElement !== $('opening')) {
    const max = Math.round(s.sector.range / unitsPerMetre());
    $('opening').max = String(max);
    $('opening').value = String(Math.round(s.sector.opening / unitsPerMetre()));
  }
  if (s.sector) {
    const v = Math.round(s.sector.opening / unitsPerMetre());
    $('openingValue').textContent = v >= Math.round(s.sector.range / unitsPerMetre()) ? t('panel.openingAll') : v + ' m';
  }
  $('defend').classList.toggle('active', state.mode === 'position');
  $('split').textContent = t(s.team ? 'buttons.merge' : 'buttons.split');
  $('split').disabled = state.ended || !n || (!s.team && !canSplit(s));
  $('orderHelp').textContent = t('panel.help.' + state.mode);
  $('speed').classList.toggle('active', state.speed !== 1);
  $('speed').setAttribute('aria-pressed', String(state.speed !== 1));
  for (const b of document.querySelectorAll('[data-level]')) b.classList.toggle('active', +b.dataset.level === cam.level);
  $('autopause').textContent = t(state.autoPause ? 'header.autoPauseOn' : 'header.autoPauseOff');
  $('autopause').setAttribute('aria-pressed', String(!!state.autoPause));
  document.getElementById('map').classList.toggle('fire-mode', state.mode === 'fire' || state.mode === 'sector');
  setHTML($('leaders'), leadersHTML(s));
  setHTML($('log'), state.logs.map((l) => `<li><time>${clock(l.t)}</time>${l.text}</li>`).join(''));
}

function startOrToggle() {
  togglePause();
  $('intro').hidden = true;
  resumeAudio();
}

// Before a new battle the purchase screen is shown (main.js sets this).
let beforeBattle = null;
export const setBeforeBattle = (fn) => (beforeBattle = fn);
const newBattle = () => (beforeBattle ? beforeBattle() : restart());

export function restart() {
  cursor = null;
  reset();
  setLevel(0);
  $('intro').hidden = false;
  $('result').hidden = true;
}

// Static interface text: elements with data-t="key" get their text from en.json,
// data-t-aria / data-t-title set attributes.
export function applyStaticText() {
  document.documentElement.lang = 'en';
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = t(el.dataset.t, { hold: HOLD_TIME });
  for (const el of document.querySelectorAll('[data-t-aria]')) el.setAttribute('aria-label', t(el.dataset.tAria));
}

export function bindInput(canvas, W, H) {
  const screenPt = (e) => {
    const r = canvas.getBoundingClientRect();
    return { sx: ((e.clientX - r.left) * W) / r.width, sy: ((e.clientY - r.top) * H) / r.height, scale: W / r.width };
  };
  const ownUnitAt = (x, y) => playerSquads().find((s) => alive(s).length && Math.hypot(s.x - x, s.y - y) < squadRadius(s) - 6);
  const centre = (s) => s && glideTo(s.x, s.y);
  let drag = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (state.ended || !$('intro').hidden) return;
    const { sx, sy } = screenPt(e);
    if (e.button === 2) {
      // Right button: a drag pans the camera, a click gives the order.
      drag = { sx, sy, cx: e.clientX, cy: e.clientY, moved: false };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    // Cover Sector: drag from one edge of the arc to the other.
    if (state.mode === 'sector') {
      const p0 = toWorld(sx, sy);
      state.sectorDraft = { x1: p0.x, y1: p0.y, x2: p0.x, y2: p0.y };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    // Edge marker (contact off screen): select the unit and centre on it.
    const mark = edgeMarkers.find((m) => sx >= m.x && sx <= m.x + m.w && sy >= m.y && sy <= m.y + m.h);
    if (mark) {
      select(mark.id);
      centre(state.squads[mark.id]);
      return;
    }
    const { x, y } = toWorld(sx, sy);
    if (state.debug && e.altKey) {
      // Debug test tool: a grenade goes off here (camera shake, effects, threat).
      testGrenade(x, y);
      toast(t(state.started && !state.paused ? 'debug.grenade' : 'debug.grenadePaused'));
      canvas.focus();
      return;
    }
    if (state.debug && e.shiftKey) {
      // Debug test tool: toggle test fire on the cell.
      const on = toggleTestFire(x, y);
      toast(t(on ? (state.started && !state.paused ? 'debug.fireOnRunning' : 'debug.fireOn') : 'debug.fireOff'));
      canvas.focus();
      return;
    }
    const hit = state.mode === 'fire' ? null : ownUnitAt(x, y);
    if (hit) select(hit.id, e.shiftKey);
    else issue(x, y);
    canvas.focus();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (state.sectorDraft) {
      const { sx, sy } = screenPt(e);
      const p1 = toWorld(sx, sy);
      state.sectorDraft.x2 = p1.x;
      state.sectorDraft.y2 = p1.y;
      return;
    }
    if (!drag) return;
    const { sx, sy, scale } = screenPt(e);
    if (Math.hypot(e.clientX - drag.cx, e.clientY - drag.cy) > 5) drag.moved = true;
    if (drag.moved) {
      pan(-(sx - drag.sx) / cam.zoom, -(sy - drag.sy) / cam.zoom);
      drag.sx = sx;
      drag.sy = sy;
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (state.sectorDraft) {
      const d = state.sectorDraft;
      state.sectorDraft = null;
      setSector(d.x1, d.y1, d.x2, d.y2);
      return;
    }
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved && !state.ended && $('intro').hidden) {
      const { sx, sy } = screenPt(e);
      const { x, y } = toWorld(sx, sy);
      issue(x, y);
    }
  });
  // Double-click on an own unit: centre on it. On the whole-map level it also goes
  // down to platoon level (DESIGN.md: to be tested in the prototype).
  canvas.addEventListener('dblclick', (e) => {
    const { sx, sy } = screenPt(e);
    const { x, y } = toWorld(sx, sy);
    const hit = ownUnitAt(x, y);
    if (!hit) return;
    if (cam.level === 0) setLevel(levelIndex(cameraRules().doubleClickToLevel), hit);
    else centre(hit);
  });
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const { sx, sy } = screenPt(e);
      setLevel(cam.level + (e.deltaY < 0 ? 1 : -1), toWorld(sx, sy));
      renderUI();
    },
    { passive: false },
  );
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Panel: click selects (Shift adds), double-click centres the camera.
  const panel = $('squads');
  panel.addEventListener('click', (e) => {
    const sp = e.target.closest('[data-split]');
    if (sp) return split(+sp.dataset.split);
    const mg = e.target.closest('[data-merge]');
    if (mg) return merge(+mg.dataset.merge);
    const g = e.target.closest('[data-group]');
    if (g) return selectGroup(g.dataset.group);
    const b = e.target.closest('[data-squad]');
    if (b) select(+b.dataset.squad, e.shiftKey);
  });
  panel.addEventListener('dblclick', (e) => {
    const b = e.target.closest('[data-squad]') ?? e.target.closest('[data-group]');
    if (b?.dataset.squad) centre(state.squads[+b.dataset.squad]);
    else if (b?.dataset.group) centre(groupUnits(b.dataset.group)[0]);
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const b = e.target.closest('[data-squad]') ?? e.target.closest('[data-group]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    if (b.dataset.squad) select(+b.dataset.squad);
    else selectGroup(b.dataset.group);
  });

  // Orders
  for (const m of ['move', 'fast', 'crawl', 'fire', 'sector']) $(m).onclick = () => setMode(m);
  $('opening').oninput = () => setOpening(+$('opening').value);
  $('leaders').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (b) setLeaderMode(b.dataset.person, b.dataset.mode === 'null' ? null : b.dataset.mode);
  });
  $('defend').onclick = defend;
  $('retreat').onclick = retreat;
  $('split').onclick = () => split();
  $('speed').onclick = () => setHalfSpeed(state.speed === 1);
  for (const b of document.querySelectorAll('[data-level]')) b.onclick = () => {
    setLevel(+b.dataset.level, cam.level < +b.dataset.level ? state.squads[state.selected] : undefined);
    renderUI();
  };
  $('autopause').onclick = () => {
    state.autoPause = !state.autoPause;
    renderUI();
  };
  $('pause').onclick = startOrToggle;
  $('begin').onclick = startOrToggle;
  $('again').onclick = newBattle;
  $('restart').onclick = () => {
    if (!state.started || state.ended || confirm(t('toast.confirmRestart'))) newBattle();
  };
  const shake = $('shake');
  if (shake) shake.oninput = () => setShakeStrength(shake.value / 100);
  $('sound').onclick = () => {
    setSound(!soundEnabled());
    $('sound').textContent = t(soundEnabled() ? 'header.soundOn' : 'header.soundOff');
    $('sound').setAttribute('aria-pressed', String(soundEnabled()));
  };

  // Keys: 1–5 select (a second press centres), M/R/C/F modes, D defend, B retreat,
  // S split/merge, H half speed, +/- zoom level, Shift+arrows pan, arrows + Enter
  // give an order with the keyboard cursor.
  let lastHot = { key: null, at: 0 };
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('button, input, select, [role="button"]') && (e.code === 'Space' || e.code === 'Enter')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (e.code === 'Space') {
      e.preventDefault();
      startOrToggle();
      return;
    }
    const hot = playerSquads().find((q) => q.hotkey === e.key);
    if (hot) {
      const units = groupUnits(hot.group);
      const already = units.length && units.every((q) => state.selection.includes(q.id)) && state.selection.length === units.length;
      const again = lastHot.key === e.key && performance.now() - lastHot.at < orderRulesUI().hotkeys.doublePressS * 1000;
      if (already || again) centre(units[0]);
      else selectGroup(hot.group);
      lastHot = { key: e.key, at: performance.now() };
      return;
    }
    const modes = { m: 'move', r: 'fast', c: 'crawl', f: 'fire', v: 'sector' };
    if (modes[k]) setMode(modes[k]);
    if (k === 'd') defend();
    if (k === 'b') retreat();
    if (k === 's') split();
    if (k === 'h') setHalfSpeed(state.speed === 1);
    if (e.key === '+' || e.key === '=') {
      setLevel(cam.level + 1, state.squads[state.selected]);
      renderUI();
    }
    if (e.key === '-' || e.key === '_') {
      setLevel(cam.level - 1);
      renderUI();
    }
    if (k === 'escape') setMode('move');
    if (k === 'g') {
      state.debug = !state.debug;
      toast(t(state.debug ? 'debug.on' : 'debug.off'));
    }
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const step = cameraRules().panKeyUnits / cam.zoom;
      const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      if (e.shiftKey) return pan(dx * step, dy * step);
      const s = state.squads[state.selected];
      cursor ??= { x: s.x, y: s.y };
      cursor.x = Math.max(10, Math.min(W - 10, cursor.x + dx * 20));
      cursor.y = Math.max(10, Math.min(H - 10, cursor.y + dy * 20));
    }
    if (e.key === 'Enter' && cursor) issue(cursor.x, cursor.y);
  });
  // Graphics mode selector: switching reloads the page with a fresh battle.
  const sel = $('artMode');
  if (sel) {
    sel.innerHTML = Object.entries(MODES)
      .map(([k, v]) => `<option value="${k}" ${k === artMode() ? 'selected' : ''}>${v.label()}</option>`)
      .join('');
    sel.onchange = () => {
      if (state.started && !state.ended && !confirm(t('toast.confirmGraphics'))) {
        sel.value = artMode();
        return;
      }
      location.search = urlForMode(sel.value);
    };
    document.body.classList.toggle('prototype-art', isPrototype());
    const badge = document.querySelector('.proto-badge');
    if (badge) badge.textContent = modeBadge();
  }
  restart();
}
