// Purchase screen (DESIGN.md, Styrkeuppbyggnad med poäng, Ledarkort; PROMPTER step 7).
// Before the battle the player sees the fixed core from the scenario data, a
// points budget, leader candidates for every leader position (Zugführer,
// Zugtruppführer, each Gruppenführer) and the reinforcements in service in the
// scenario year. The budget updates at once and cannot be exceeded.
import { leaderPrice, choiceCost, reinforcementAvailable } from './data.js';
import { t } from './text.js';

const $ = (id) => document.getElementById(id);
let db = null;
let choice = null;
let onDeploy = null;
let hover = null; // { key, pid } – candidate under the pointer, for the comparison

export function openPurchase(database, current, deploy) {
  db = database;
  choice = { leaders: { ...current.leaders }, reinforcements: [...current.reinforcements] };
  onDeploy = deploy;
  $('purchase').hidden = false;
  document.body.classList.add('purchasing');
  render();
}

function close() {
  $('purchase').hidden = true;
  document.body.classList.remove('purchasing');
}

const budget = () => db.scenario.purchase.budget;
const spent = () => choiceCost(db, choice);

// ---- Rank insignia (small pictures, drawn from the rank) -----------------------
// Heer, infantry (white Waffenfarbe): shoulder strap, tress, pips, chevrons.
export function insigniaSVG(rankId) {
  const strap = (inner) =>
    `<svg class="rank-ins" viewBox="0 0 22 40" width="14" height="26" aria-hidden="true"><path d="M3 38 V8 Q3 2 11 2 Q19 2 19 8 V38 Z" fill="#59604a" stroke="#e8e6dc" stroke-width="1.6"/>${inner}</svg>`;
  const tress = (closed) => `<path d="M5 ${closed ? 36 : 40} V9 Q5 4 11 4 Q17 4 17 9 V${closed ? 36 : 40}${closed ? ' Z' : ''}" fill="none" stroke="#c9ccc4" stroke-width="2.4" stroke-dasharray="1.6 0.9"/>`;
  const pips = (n, gold = false) => [...Array(n)].map((_, i) => `<rect x="8" y="${14 + i * 7}" width="6" height="6" transform="rotate(45 11 ${17 + i * 7})" fill="${gold ? '#d4b04a' : '#c9ccc4'}"/>`).join('');
  const braid = `<path d="M7 36 C4 30 18 26 15 20 C12 14 5 14 7 8 M15 36 C18 30 4 26 7 20 C10 14 17 14 15 8" fill="none" stroke="#d9dbd3" stroke-width="2.2"/>`;
  const chevron = (n, star = false) =>
    `<svg class="rank-ins" viewBox="0 0 26 30" width="18" height="21" aria-hidden="true"><rect x="1" y="1" width="24" height="28" rx="3" fill="#59604a"/>${[...Array(n)].map((_, i) => `<path d="M5 ${8 + i * 6} L13 ${15 + i * 6} L21 ${8 + i * 6}" fill="none" stroke="#c9ccc4" stroke-width="2.6"/>`).join('')}${star ? '<circle cx="13" cy="25" r="2.4" fill="#c9ccc4"/>' : ''}</svg>`;
  switch (rankId) {
    case 'grenadier':
    case 'schuetze':
      return strap('');
    case 'obergrenadier':
    case 'oberschuetze':
      return `<svg class="rank-ins" viewBox="0 0 26 26" width="18" height="18" aria-hidden="true"><circle cx="13" cy="13" r="11" fill="#59604a"/><path d="M13 6 L15 11 L20 11 L16 14 L18 19 L13 16 L8 19 L10 14 L6 11 L11 11 Z" fill="#c9ccc4"/></svg>`;
    case 'gefreiter':
      return chevron(1);
    case 'obergefreiter':
      return chevron(2);
    case 'stabsgefreiter':
      return chevron(2, true);
    case 'unteroffizier':
      return strap(tress(false));
    case 'unterfeldwebel':
      return strap(tress(true));
    case 'feldwebel':
      return strap(tress(true) + pips(1));
    case 'oberfeldwebel':
      return strap(tress(true) + pips(2));
    case 'stabsfeldwebel':
      return strap(tress(true) + pips(3));
    case 'leutnant':
      return strap(braid);
    case 'oberleutnant':
      return strap(braid + pips(1, true));
    case 'hauptmann':
      return strap(braid + pips(2, true));
    default:
      return '';
  }
}

// ---- Awards as small icons (placeholders until the graphics order delivers the
// historically correct ones), in wear order, full German name on hover.
const RIBBON = {
  ek2: ['#111', '#fff', '#c22', '#fff', '#111'],
  ostmedaille: ['#b22', '#fff', '#111', '#fff', '#b22'],
};
function awardIcon(a) {
  const def = db.awards[a.id];
  const title = def.name + (a.class ? ` (${a.class})` : '');
  let svg;
  if (RIBBON[a.id]) {
    const c = RIBBON[a.id];
    svg = `<svg viewBox="0 0 20 12" width="20" height="12">${c.map((col, i) => `<rect x="${i * 4}" y="0" width="4" height="12" fill="${col}"/>`).join('')}</svg>`;
  } else if (a.id === 'ek1') svg = `<svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 1h4v5h5v4h-5v5H6v-5H1V6h5z" fill="#111" stroke="#ddd" stroke-width="1"/></svg>`;
  else if (a.id === 'vwa') svg = `<svg viewBox="0 0 14 16" width="12" height="14"><ellipse cx="7" cy="8" rx="6" ry="7" fill="${a.class === 'silber' ? '#bbb' : a.class === 'gold' ? '#c9a33a' : '#222'}" stroke="#888"/></svg>`;
  else if (a.id === 'isa' || a.id === 'asa') svg = `<svg viewBox="0 0 14 16" width="12" height="14"><ellipse cx="7" cy="8" rx="6" ry="7" fill="none" stroke="#c8c8c8" stroke-width="2"/><rect x="5.5" y="4" width="3" height="8" fill="#c8c8c8"/></svg>`;
  else if (a.id === 'nks') svg = `<svg viewBox="0 0 22 8" width="22" height="8"><rect x="1" y="1" width="20" height="6" rx="2" fill="#a6763a" stroke="#ddd" stroke-width=".8"/></svg>`;
  else svg = `<span class="award-txt">${def.abbr}</span>`;
  return `<span class="award" title="${title}">${svg}</span>`;
}
const awardsHTML = (p) =>
  [...p.awards]
    .sort((a, b) => (db.awards[a.id].order || 99) - (db.awards[b.id].order || 99))
    .map(awardIcon)
    .join('');

// ---- Leader card ----------------------------------------------------------------
const boxes = (v, cmp) =>
  [...Array(5)]
    .map((_, i) => {
      const on = i < v;
      const diff = cmp == null ? '' : on && i >= cmp ? 'up' : !on && i < cmp ? 'down' : '';
      return `<i class="box ${on ? 'on' : ''} ${diff}"></i>`;
    })
    .join('');

function suitedFor(l) {
  const S = db.rules.purchase.suited;
  const parts = [];
  for (const [k, v] of Object.entries(S.values)) if (l[k] >= S.highValue) parts.push(v);
  if (l.trait && S.traits[l.trait]) parts.push(S.traits[l.trait]);
  return [...new Set(parts)].map((k) => t('purchase.suited.' + k)).join(', ') || t('purchase.suited.general');
}

function leaderCard(key, pid, unitName, selectedPid) {
  const p = db.people[pid];
  const l = db.leaders[pid];
  const rank = db.ranks[p.formation].ranks.find((r) => r.id === p.rank);
  const pos = db.units[db.forces.player.nation].positions[p.position];
  const price = leaderPrice(db, pid);
  const sel = pid === selectedPid;
  const cmp = hover?.key === key && hover.pid === pid && !sel ? db.leaders[selectedPid] : null;
  const priceDiff = cmp ? price - leaderPrice(db, selectedPid) : 0;
  const affordable = sel || spent() - leaderPrice(db, selectedPid) + price <= budget();
  const trait = l.trait ? db.traits[l.trait] : null;
  const age = db.scenario.year - p.born;
  const bg = [t('purchase.age', { age }), p.inFieldSince ? t('purchase.since', { year: p.inFieldSince }) : null, p.home].filter(Boolean).join(' · ');
  return `<button class="lcard ${sel ? 'selected' : ''}" data-key="${key}" data-pid="${pid}" ${affordable ? '' : 'disabled'} aria-pressed="${sel}">
<div class="lc-top"><span>${pos.name.toUpperCase()} · ${unitName}</span><span class="price">${t('purchase.pts', { n: price })}${cmp ? ` <em class="${priceDiff > 0 ? 'down' : 'up'}">(${priceDiff > 0 ? '+' : ''}${priceDiff})</em>` : ''}</span></div>
<div class="lc-person"><div class="portrait" aria-hidden="true"><svg viewBox="0 0 40 46" width="40" height="46"><circle cx="20" cy="15" r="9" fill="#3c4436"/><path d="M4 46 Q6 28 20 27 Q34 28 36 46 Z" fill="#3c4436"/><path d="M10 12 Q20 1 30 12 Z" fill="#4c5544"/></svg><span class="pins">${insigniaSVG(p.rank)}</span></div>
<div class="who"><div class="rank">${rank.name} ${insigniaSVG(p.rank)}</div><div class="name">${p.first} ${p.last}</div><div class="bg">${bg}</div><div class="awards">${awardsHTML(p)}</div></div></div>
<div class="lc-values"><span>${t('leaders.leadership')}</span><span>${boxes(l.leadership, cmp?.leadership)}</span><span>${t('leaders.fireControl')}</span><span>${boxes(l.fireControl, cmp?.fireControl)}</span><span>${t('leaders.rally')}</span><span>${boxes(l.rally, cmp?.rally)}</span></div>
<div class="lc-trait">${trait ? `<b>${trait.icon} ${t('traits.' + trait.id + '.name')}</b><span class="pro">+ ${t('traits.' + trait.id + '.pro')}</span><span class="con">− ${t('traits.' + trait.id + '.con')}</span>` : `<span class="muted">${t('leaders.noTrait')}</span>`}</div>
<div class="lc-suited">${t('purchase.suitedFor')}: ${suitedFor(l)}</div></button>`;
}

// ---- Reinforcements -------------------------------------------------------------
function reinforcementCard(r) {
  const cost = db.scenario.purchase.reinforcements[r.id].cost;
  const bought = choice.reinforcements.includes(r.id);
  const affordable = bought || spent() + cost <= budget();
  const type = db.units.de.unitTypes.find((x) => x.id === r.type);
  const people = Object.values(r.members).map((pid) => db.people[pid]);
  const weapons = [...new Set(people.map((p) => p.weapon).filter(Boolean))].map((w) => db.weapons[w].name);
  const gf = db.people[r.members[type.leader]];
  const rank = db.ranks.heer.ranks.find((x) => x.id === gf.rank);
  return `<div class="rcard ${bought ? 'bought' : ''}"><div class="rc-top"><b>${type.name}</b><span class="price">${t('purchase.pts', { n: cost })}</span></div>
<div class="rc-desc">${t('purchase.reinf.' + r.type)}</div>
<div class="rc-meta">${t('purchase.men', { n: people.length })} · ${weapons.join(', ')}</div>
<div class="rc-meta">${t('purchase.ledBy')} ${rank.abbr} ${gf.last}</div>
<button class="${bought ? 'active' : ''}" data-reinf="${r.id}" ${affordable ? '' : 'disabled'}>${t(bought ? 'purchase.remove' : 'purchase.buy')}</button></div>`;
}

function render() {
  const f = db.forces.player;
  const used = spent();
  const left = budget() - used;
  const rows = Object.entries(f.candidates)
    .filter(([k]) => !k.startsWith('_'))
    .map(([key, list]) => {
      const [uid] = key.split('/');
      const unit = f.units.find((u) => u.id === uid);
      return `<div class="slot"><div class="cands">${list.map((pid) => leaderCard(key, pid, unit.name, choice.leaders[key])).join('')}</div></div>`;
    })
    .join('');
  const offered = (f.reinforcements ?? []).filter((r) => reinforcementAvailable(db, r));
  $('purchase').innerHTML = `<div class="purchase-inner">
<header class="p-head"><div><span class="eyebrow">${t('purchase.eyebrow')}</span><h2>${t('header.operation')} · ${t('header.theatre')}</h2><p>${t('purchase.intro')}</p></div>
<div class="budget"><div class="b-top"><span>${t('purchase.budget')}</span><b>${t('purchase.used', { used, budget: budget() })}</b></div><div class="b-bar"><span style="width:${(100 * used) / budget()}%"></span></div><div class="b-left">${t('purchase.left', { n: left })}</div></div></header>
<section><h3>${t('purchase.coreTitle')}</h3><p class="muted">${t('purchase.coreText')}</p><div class="core-list">${f.units.map((u) => `<span>${u.name}</span>`).join('')}</div>
<h3>${t('purchase.leadersTitle')}</h3><p class="muted">${t('purchase.leadersText')}</p>${rows}</section>
<section><h3>${t('purchase.reinfTitle')}</h3><p class="muted">${t('purchase.reinfText', { year: db.scenario.year })}</p><div class="rlist">${offered.map(reinforcementCard).join('')}</div></section>
<footer class="p-foot"><button id="deploy" class="primary">${t('purchase.deploy')} →</button></footer></div>`;
}

export function bindPurchase() {
  const el = $('purchase');
  el.addEventListener('click', (e) => {
    const c = e.target.closest('[data-pid]');
    if (c && !c.disabled) {
      choice.leaders[c.dataset.key] = c.dataset.pid;
      hover = null;
      return render();
    }
    const r = e.target.closest('[data-reinf]');
    if (r && !r.disabled) {
      const id = r.dataset.reinf;
      choice.reinforcements = choice.reinforcements.includes(id) ? choice.reinforcements.filter((x) => x !== id) : [...choice.reinforcements, id];
      return render();
    }
    if (e.target.closest('#deploy')) {
      close();
      onDeploy(choice);
    }
  });
  // Comparison: hovering a candidate shows the difference to the current choice.
  el.addEventListener('mouseover', (e) => {
    const c = e.target.closest('[data-pid]');
    const h = c ? { key: c.dataset.key, pid: c.dataset.pid } : null;
    if (h?.key === hover?.key && h?.pid === hover?.pid) return;
    hover = h;
    render();
  });
}
