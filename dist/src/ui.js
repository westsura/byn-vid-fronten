// DOM side panel, overlays and input handling.
import { MISSION_TIME, HOLD_TIME } from './config.js';
import { state, alive, playerSquads, select, issue, defend, setMode, togglePause, reset } from './sim.js';
import { buildingAt, coverAt } from './terrain.js';
import { setSound, soundEnabled, resumeAudio } from './audio.js';
import { MODES, artMode, isPrototype, urlForMode, factionLabel, modeBadge } from './art.js';
import { squadRadius } from './render.js';

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
  $('resultTitle').textContent = win ? 'Gårdsplanen är säkrad.' : 'Anfallet har stannat av.';
  $('resultText').textContent = text;
}

function setHTML(el, html) {
  // Only touch the DOM when content changes, so hover and focus are kept.
  if (el.innerHTML !== html) el.innerHTML = html;
}

function squadCard(s) {
  const n = alive(s).length;
  const morale = s.morale < 25 ? 'Bruten' : s.morale < 55 ? 'Pressad' : 'Stabil';
  const colour = s.morale < 40 ? '#d89b70' : '#a4bd83';
  return `<button class="squad ${s.id === state.selected ? 'selected' : ''}" data-squad="${s.id}" aria-pressed="${s.id === state.selected}" ${n ? '' : 'disabled'}>
<div class="squad-top"><span class="number">${s.id + 1}</span><strong>${s.name}</strong><span class="count">${n} / ${s.men.length}</span></div>
<div class="squad-bottom"><span>${n ? s.order : 'Utslagen'}</span><span>${morale}</span></div>
<div class="morale"><span style="width:${Math.round(s.morale)}%;background:${colour}"></span></div></button>`;
}

export function renderUI() {
  const s = state.squads[state.selected];
  const n = alive(s).length;
  $('phase').textContent = state.ended ? 'AVSLUTAD' : state.paused ? (state.started ? 'PAUSAD' : 'PLANERING') : 'STRID PÅGÅR';
  $('pause').textContent = state.paused ? (state.started ? '▶ Fortsätt' : '▶ Börja striden') : 'Ⅱ Pausa';
  $('pause').disabled = state.ended;
  $('clock').textContent = clock(Math.max(0, Math.ceil(MISSION_TIME - state.elapsed)));
  $('captureBar').style.width = (state.capture / HOLD_TIME) * 100 + '%';
  $('captureTime').textContent = Math.floor(state.capture) + ' / ' + HOLD_TIME + ' s';
  $('captureText').textContent = state.capture > 0 ? 'Säkrar området' : 'Ingen kontroll';
  $('forceCount').textContent = playerSquads().reduce((sum, q) => sum + alive(q).length, 0) + ' man';
  setHTML($('squads'), playerSquads().map(squadCard).join(''));

  $('selectedName').textContent = s.name + ' / ' + (isPrototype() ? factionLabel(s.faction) + ' (' + s.men.length + ')' : 'Infanteri');
  const house = buildingAt(s.x, s.y);
  const cover = coverAt(s.x, s.y);
  $('cover').textContent = house ? house.name : cover > 0.6 ? 'Byggnadsskydd' : cover > 0.3 ? 'Vegetation' : 'Öppen mark';
  $('ammo').textContent = Math.round((s.ammo / 150) * 100) + ' %';
  $('currentOrder').textContent = n ? s.order : 'Utslagen';
  $('posture').textContent = !n
    ? 'Utslagen'
    : s.underFire > 0 ? 'Nedtryckt · tar skydd'
    : s.order === 'Försvarar' ? 'Liggande · försvar'
    : s.path.length ? 'Förflyttning' : 'Redo';
  $('move').classList.toggle('active', state.mode === 'move');
  $('defend').classList.toggle('active', state.mode === 'defend');
  $('orderHelp').textContent =
    state.mode === 'move'
      ? 'Klicka på mark för förflyttning eller på ett hus för att gå in genom dörren.'
      : 'Gruppen håller sin position och får bättre skydd. Klicka på kartan för en ny försvarsställning.';
  setHTML($('log'), state.logs.map((l) => `<li><time>${clock(l.t)}</time>${l.text}</li>`).join(''));
}

function startOrToggle() {
  togglePause();
  $('intro').hidden = true;
  resumeAudio();
}

function restart() {
  cursor = null;
  reset();
  $('intro').hidden = false;
  $('result').hidden = true;
}

export function bindInput(canvas, W, H) {
  canvas.addEventListener('pointerdown', (e) => {
    if (state.ended || !$('intro').hidden) return;
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) * W) / r.width;
    const y = ((e.clientY - r.top) * H) / r.height;
    const hit = playerSquads().find((s) => alive(s).length && Math.hypot(s.x - x, s.y - y) < squadRadius(s) - 6);
    if (hit && e.button !== 2) select(hit.id);
    else issue(x, y);
    canvas.focus();
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  $('squads').addEventListener('click', (e) => {
    const b = e.target.closest('[data-squad]');
    if (b) select(+b.dataset.squad);
  });
  $('move').onclick = () => setMode('move');
  $('defend').onclick = defend;
  $('pause').onclick = startOrToggle;
  $('begin').onclick = startOrToggle;
  $('again').onclick = restart;
  $('restart').onclick = () => {
    if (!state.started || state.ended || confirm('Avsluta den här striden och börja om?')) restart();
  };
  $('sound').onclick = () => {
    setSound(!soundEnabled());
    $('sound').textContent = soundEnabled() ? 'Ljud på' : 'Ljud av';
    $('sound').setAttribute('aria-pressed', String(soundEnabled()));
  };

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('button') && (e.code === 'Space' || e.code === 'Enter')) return;
    if (e.code === 'Space') {
      e.preventDefault();
      startOrToggle();
    }
    if (['1', '2', '3'].includes(e.key)) select(+e.key - 1);
    if (e.key.toLowerCase() === 'd') defend();
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const s = state.squads[state.selected];
      cursor ??= { x: s.x, y: s.y };
      if (e.key === 'ArrowLeft') cursor.x -= 20;
      if (e.key === 'ArrowRight') cursor.x += 20;
      if (e.key === 'ArrowUp') cursor.y -= 20;
      if (e.key === 'ArrowDown') cursor.y += 20;
      cursor.x = Math.max(10, Math.min(W - 10, cursor.x));
      cursor.y = Math.max(10, Math.min(H - 10, cursor.y));
    }
    if (e.key === 'Enter' && cursor) issue(cursor.x, cursor.y);
  });
  // Graphics mode selector: switching reloads the page with a fresh battle.
  const sel = $('artMode');
  if (sel) {
    sel.innerHTML = Object.entries(MODES)
      .map(([k, v]) => `<option value="${k}" ${k === artMode() ? 'selected' : ''}>${v.label}</option>`)
      .join('');
    sel.onchange = () => {
      if (state.started && !state.ended && !confirm('Byta grafik startar om striden. Fortsätta?')) {
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
