// Briefing before the purchase screen, and the result screen after the battle
// (PROMPTER step 8). All text from data/text/en.json (scenarios.<id>.*, result.*).
import { t } from './text.js';
import { insigniaSVG } from './purchase.js';

const $ = (id) => document.getElementById(id);
const list = (v) => (Array.isArray(v) ? v : []);

export function showBriefing(db, onContinue) {
  const sid = db.scenario.id;
  const s = (k, p) => t(`scenarios.${sid}.${k}`, p);
  const M = db.scenario.mission;
  const el = $('briefing');
  el.innerHTML = `<div class="purchase-inner briefing">
<header class="p-head"><div><span class="eyebrow">${t('briefing.eyebrow')}</span><h2>${s('title')}</h2><p>${t('header.operation')} · ${t('header.theatre')} · ${t('map.sector')} · ${t('map.village')}</p></div>
<div class="budget"><div class="b-top"><span>${t('briefing.time')}</span><b>${Math.round(M.timeLimitS / 60)} min</b></div><div class="b-top"><span>${t('briefing.budget')}</span><b>${db.scenario.purchase.budget} ${t('briefing.points')}</b></div></div></header>
<div class="brief-grid"><div>
<h3>${t('briefing.situation')}</h3><p>${s('situation')}</p>
<h3>${t('briefing.task')}</h3><p>${s('task')}</p>
<h3>${t('briefing.conditions')}</h3><ul>${list(t(`scenarios.${sid}.conditions`)).map((c) => `<li>${c}</li>`).join('')}</ul>
<h3>${t('briefing.enemy')}</h3><p>${s('enemy')}</p>
<h3>${t('briefing.forces')}</h3><p>${s('forces')}</p></div>
<figure class="brief-map"><div class="map-box"><img src="../../map.png" alt="${t('briefing.mapAlt')}"><svg viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">${objectiveSVG(db)}</svg></div><figcaption>${s('mapCaption')}</figcaption></figure></div>
<footer class="p-foot"><button id="toPurchase" class="primary">${t('briefing.continue')} →</button></footer></div>`;
  el.hidden = false;
  document.body.classList.add('purchasing');
  $('toPurchase').onclick = () => {
    el.hidden = true;
    onContinue();
  };
}

// Objective and start area drawn over the briefing map (geometry from scenario.js).
let buildingsRef = [];
export const setBuildingsForScreens = (b) => (buildingsRef = b);
function objectiveSVG(db) {
  const M = db.scenario.mission;
  const [x0, y0, x1, y1] = db.scenario.purchase.startArea;
  const start = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#9fb87922" stroke="#9fb879" stroke-width="4" stroke-dasharray="14 10"/><text x="${x0 + 10}" y="${y1 - 14}" fill="#dce8bf" font-size="30" font-weight="700">${t('briefing.startArea')}</text>`;
  if (M.type === 'building') {
    const b = buildingsRef[M.building];
    return `${start}<rect x="${b.x - 8}" y="${b.y - 8}" width="${b.w + 16}" height="${b.h + 16}" fill="#e0784a30" stroke="#f09a6a" stroke-width="6"/><text x="${b.midX}" y="${b.y - 22}" fill="#ffd2b8" font-size="30" font-weight="700" text-anchor="middle">${t('briefing.objective')}</text>`;
  }
  return `${start}<circle cx="${M.x}" cy="${M.y}" r="${M.radius}" fill="#e0784a30" stroke="#f09a6a" stroke-width="6"/>`;
}

// ---- Result screen -------------------------------------------------------------
const STATUS_CLASS = { active: 'ok', lightlyWounded: 'warn', badlyWounded: 'bad', killed: 'dead' };

export function showResultScreen(db, result, people, onAgain) {
  const sid = db.scenario.id;
  const own = result.groups.filter((g) => g.side === 0);
  const enemy = result.groups.filter((g) => g.side === 1);
  const sum = (gs, k) => gs.reduce((n, g) => n + g[k], 0);
  const el = $('resultScreen');
  el.innerHTML = `<div class="purchase-inner result">
<header class="p-head"><div><span class="eyebrow">${t('result.eyebrow')}</span><h2 class="outcome ${result.outcome}">${t('result.outcome.' + result.outcome)}</h2><p>${t(result.reason.key, result.reason.params)}</p></div>
${result.building ? `<div class="budget"><div class="b-top"><span>${t('result.inBuilding')}</span><b>${result.building[0]} : ${result.building[1]}</b></div><div class="b-left">${t('result.inBuildingNote')}</div></div>` : ''}</header>
<h3>${t('result.lossesTitle')}</h3>
<table class="losses"><thead><tr><th>${t('result.unit')}</th><th>${t('result.strength')}</th><th>${t('result.fit')}</th><th>${t('result.lightly')}</th><th>${t('result.badly')}</th><th>${t('result.killed')}</th><th></th></tr></thead>
<tbody>${own.map((g) => `<tr><td>${g.name}</td><td>${g.strength}</td><td>${g.fit}</td><td>${g.lightlyWounded}</td><td>${g.badlyWounded}</td><td>${g.killed}</td><td>${g.broken ? t('morale.broken') : ''}</td></tr>`).join('')}
<tr class="sum"><td>${t('result.total')}</td><td>${sum(own, 'strength')}</td><td>${sum(own, 'fit')}</td><td>${sum(own, 'lightlyWounded')}</td><td>${sum(own, 'badlyWounded')}</td><td>${sum(own, 'killed')}</td><td></td></tr></tbody></table>
<p class="muted">${t('result.enemyLosses', { strength: sum(enemy, 'strength'), out: sum(enemy, 'killed') + sum(enemy, 'badlyWounded'), fit: sum(enemy, 'fit') })}</p>
<h3>${t('result.leadersTitle')}</h3>
<div class="fates">${result.leaders
    .map((l) => {
      const p = people[l.id];
      return `<div class="fate ${STATUS_CLASS[l.status]}"><span class="rk">${insigniaSVG(p.rank)}</span><div><b>${l.name}</b><span>${l.position} · ${l.unit}</span></div><em>${t('result.status.' + l.status)}</em></div>`;
    })
    .join('')}</div>
<p class="muted saved">${t('result.saved')}</p>
<footer class="p-foot"><button id="again" class="primary">${t('result.again')} →</button></footer></div>`;
  el.hidden = false;
  document.body.classList.add('purchasing');
  $('again').onclick = () => {
    el.hidden = true;
    document.body.classList.remove('purchasing');
    onAgain();
  };
}

export function hideScreens() {
  for (const id of ['briefing', 'resultScreen']) $(id).hidden = true;
}
