const PLAYERS = [
  { id:'pele', name:'PELÉ', full:'ペレ', rating:98, pos:'FW', nation:'🇧🇷', era:'THE KING · 1956—1977', pac:94, sho:98, pas:91, rarity:'legendary', skin:'#7b4b31', kit:'#185d36' },
  { id:'maradona', name:'MARADONA', full:'ディエゴ・マラドーナ', rating:97, pos:'MF', nation:'🇦🇷', era:'EL PIBE DE ORO · 1976—1997', pac:93, sho:95, pas:96, rarity:'immortal', skin:'#a97552', kit:'#5b9eca' },
  { id:'ronaldo', name:'RONALDO', full:'ロナウド', rating:96, pos:'FW', nation:'🇧🇷', era:'O FENÔMENO · 1993—2011', pac:97, sho:96, pas:84, rarity:'legendary', skin:'#996243', kit:'#d5bc25' },
  { id:'zidane', name:'ZIDANE', full:'ジネディーヌ・ジダン', rating:95, pos:'MF', nation:'🇫🇷', era:'THE MAESTRO · 1989—2006', pac:82, sho:91, pas:97, rarity:'immortal', skin:'#b9825e', kit:'#244c8d' },
  { id:'cruyff', name:'CRUYFF', full:'ヨハン・クライフ', rating:94, pos:'FW', nation:'🇳🇱', era:'TOTAL FOOTBALL · 1964—1984', pac:92, sho:91, pas:94, rarity:'legendary', skin:'#c78f67', kit:'#dd6b25' },
  { id:'maldini', name:'MALDINI', full:'パオロ・マルディーニ', rating:94, pos:'DF', nation:'🇮🇹', era:'IL CAPITANO · 1984—2009', pac:88, sho:56, pas:85, rarity:'immortal', skin:'#c58b67', kit:'#bb252d' },
  { id:'ronaldinho', name:'RONALDINHO', full:'ロナウジーニョ', rating:93, pos:'MF', nation:'🇧🇷', era:'THE MAGICIAN · 1998—2015', pac:91, sho:89, pas:94, rarity:'legendary', skin:'#805039', kit:'#315f94' },
  { id:'buffon', name:'BUFFON', full:'ジャンルイジ・ブッフォン', rating:92, pos:'GK', nation:'🇮🇹', era:'SUPERMAN · 1995—2023', pac:63, sho:35, pas:76, rarity:'immortal', skin:'#bf8661', kit:'#242424' },
  { id:'henry', name:'HENRY', full:'ティエリ・アンリ', rating:91, pos:'FW', nation:'🇫🇷', era:'VA VA VOOM · 1994—2014', pac:96, sho:93, pas:84, rarity:'standard', skin:'#71452f', kit:'#b21d2b' },
  { id:'xavi', name:'XAVI', full:'シャビ', rating:91, pos:'MF', nation:'🇪🇸', era:'THE PUPPETEER · 1998—2019', pac:78, sho:81, pas:97, rarity:'standard', skin:'#b97d59', kit:'#273e89' },
  { id:'beckenbauer', name:'BECKENBAUER', full:'フランツ・ベッケンバウアー', rating:93, pos:'DF', nation:'🇩🇪', era:'DER KAISER · 1964—1983', pac:83, sho:79, pas:92, rarity:'legendary', skin:'#d09b71', kit:'#e5e5e5' },
  { id:'casillas', name:'CASILLAS', full:'イケル・カシージャス', rating:90, pos:'GK', nation:'🇪🇸', era:'SAN IKER · 1999—2020', pac:62, sho:30, pas:72, rarity:'standard', skin:'#ba7c58', kit:'#182d56' }
];

const DEFAULT_STATE = { coins:48650, gems:1240, owned:['pele','maradona','ronaldo','zidane','cruyff','maldini','ronaldinho','buffon'], filter:'all', matchday:1, wins:0 };
const STORAGE_KEY = 'legends-xi-save-v2';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.owned)) return structuredClone(DEFAULT_STATE);
    return { ...DEFAULT_STATE, ...saved, owned:saved.owned.filter(id => PLAYERS.some(player => player.id === id)) };
  } catch { return structuredClone(DEFAULT_STATE); }
}

let state = loadState();
let activeMatchTimer = null;
const ownedPlayers = () => state.owned.map(id => PLAYERS.find(player => player.id === id)).filter(Boolean);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

function cardTemplate(player) {
  return `<article class="player-card ${player.rarity}" data-player-id="${player.id}" tabindex="0" role="button" aria-label="${player.full}、総合値${player.rating}">
    <span class="card-bg-number">${player.rating}</span>
    <div class="card-top"><b class="rating">${player.rating}</b><span class="position">${player.pos}</span><span class="flag">${player.nation}</span></div>
    <div class="card-player" aria-hidden="true"><span class="head"></span><span class="body"></span></div>
    <div class="card-info"><h3>${player.name}</h3><p>${player.era}</p><div class="stats"><span><b>${player.pac}</b>PAC</span><span><b>${player.sho}</b>SHO</span><span><b>${player.pas}</b>PAS</span></div></div>
  </article>`;
}

function bindCardDetails(root) {
  $$('.player-card', root).forEach(card => {
    const open = () => showPlayer(card.dataset.playerId);
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
}

function renderCards() {
  const collection = ownedPlayers();
  let visible = state.filter === 'all' ? collection : collection.filter(player => player.pos === state.filter);
  visible = [...visible].sort($('#sort').value === 'name' ? (a,b) => a.name.localeCompare(b.name) : (a,b) => b.rating - a.rating);
  $('#featured-cards').innerHTML = collection.slice(0, 4).map(cardTemplate).join('');
  $('#all-cards').innerHTML = visible.length ? visible.map(cardTemplate).join('') : '<p class="empty-state">このポジションの選手はまだいません。パックから獲得しましょう。</p>';
  $('#owned-count').textContent = collection.length;
  $('#total-count').textContent = `/ ${PLAYERS.length} PLAYERS`;
  bindCardDetails($('#featured-cards'));
  bindCardDetails($('#all-cards'));
}

function updateDashboard() {
  $('#coins').textContent = state.coins.toLocaleString('ja-JP');
  $('#gems').textContent = state.gems.toLocaleString('ja-JP');
  $('#matchday').textContent = state.matchday;
  const division = Math.max(1, 4 - Math.floor(state.wins / 3));
  const rivalOverall = 86 + Math.min(10, state.matchday * 2);
  $('#division-label').textContent = `DIVISION ${division}`;
  $('#rival-overall').textContent = `推奨 OVR ${rivalOverall}`;
  $('#match-reward').textContent = (2000 + division * 125).toLocaleString('ja-JP');
}

function navigate(view) {
  $$('.view').forEach(section => section.classList.remove('active'));
  $(`#${view}-view`).classList.add('active');
  $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  if (view === 'squad') renderSquad();
  window.scrollTo({ top:0, behavior:'smooth' });
}

function showPlayer(id) {
  const player = PLAYERS.find(item => item.id === id);
  if (!player) return;
  $('#player-detail-card').innerHTML = cardTemplate(player);
  $('#player-detail-name').textContent = player.full;
  $('#player-detail-era').textContent = player.era;
  $('#player-detail-stats').innerHTML = `<div><dt>スピード</dt><dd>${player.pac}</dd></div><div><dt>シュート</dt><dd>${player.sho}</dd></div><div><dt>パス</dt><dd>${player.pas}</dd></div>`;
  openModal('#player-modal');
}

function bestSquad() {
  const pool = [...ownedPlayers()].sort((a,b) => b.rating - a.rating);
  const take = (pos, count) => pool.filter(player => player.pos === pos).slice(0, count);
  const chosen = [...take('GK',1), ...take('DF',3), ...take('MF',4), ...take('FW',3)];
  for (const player of pool) if (chosen.length < 11 && !chosen.includes(player)) chosen.push(player);
  return chosen;
}

const FORMATION = [[50,89],[22,70],[50,72],[78,70],[18,48],[40,48],[62,48],[82,48],[22,22],[50,16],[78,22]];
function renderSquad() {
  const squad = bestSquad();
  $('#team-overall').textContent = squad.length ? Math.round(squad.reduce((sum,p) => sum + p.rating, 0) / squad.length) : '—';
  $('#pitch').innerHTML = FORMATION.map(([x,y], index) => {
    const player = squad[index];
    return `<button class="pitch-player ${player ? '' : 'vacant'}" style="left:${x}%;top:${y}%" ${player ? `data-player-id="${player.id}"` : 'disabled'}><span>${player?.rating ?? '+'}</span><b>${player?.name ?? 'EMPTY'}</b></button>`;
  }).join('');
  $$('.pitch-player[data-player-id]').forEach(button => button.onclick = () => showPlayer(button.dataset.playerId));
}

function openModal(selector) {
  const modal = $(selector);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  $('.modal-close', modal)?.focus();
}
function closeModals() {
  $$('.modal').forEach(modal => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); });
  if (activeMatchTimer) { clearTimeout(activeMatchTimer); activeMatchTimer = null; }
}
function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2400);
}

function startBattle() {
  const button = $('#simulate');
  $('#battle-title').textContent = 'キックオフ';
  $('#score-home').textContent = '0';
  $('#score-away').textContent = '0';
  $('#minute-bar').style.width = '0';
  $('#commentary').textContent = '両チームの選手がピッチに入場しています…';
  button.disabled = false;
  button.textContent = '試合開始';
  button.onclick = simulateMatch;
  openModal('#battle-modal');
}

function simulateMatch() {
  const squadRating = Number($('#team-overall').textContent) || 88;
  const rivalRating = 86 + Math.min(10, state.matchday * 2);
  const winChance = Math.max(.28, Math.min(.75, .52 + (squadRating - rivalRating) * .035));
  const victory = Math.random() < winChance;
  const homeGoals = victory ? 2 + (Math.random() > .72 ? 1 : 0) : Math.random() > .45 ? 1 : 0;
  const awayGoals = victory ? Math.max(0, homeGoals - 1 - Math.floor(Math.random() * 2)) : homeGoals + (Math.random() > .5 ? 1 : 0);
  const events = [
    [12,'ジダンが中盤でボールを奪い、攻撃を組み立てる。'],
    [28,`${bestSquad().find(p => p.pos === 'FW')?.full ?? 'フォワード'}がゴール前へ抜け出した！`],
    [51,'相手の鋭いカウンター。守備陣が懸命に戻る。'],
    [73,'試合は最終局面。スタジアムのボルテージが上がる。'],
    [90,'試合終了のホイッスル！']
  ];
  let index = 0;
  const button = $('#simulate');
  button.disabled = true;
  button.textContent = '試合中…';
  const advance = () => {
    const [minute, text] = events[index];
    $('#minute-bar').style.width = `${minute / 90 * 100}%`;
    $('#commentary').textContent = `${minute}’ ${text}`;
    $('#score-home').textContent = Math.round(homeGoals * minute / 90);
    $('#score-away').textContent = Math.round(awayGoals * minute / 90);
    index += 1;
    if (index < events.length) { activeMatchTimer = setTimeout(advance, 650); return; }
    activeMatchTimer = null;
    finishMatch(victory, homeGoals, awayGoals, button);
  };
  advance();
}

function finishMatch(victory, homeGoals, awayGoals, button) {
  $('#score-home').textContent = homeGoals;
  $('#score-away').textContent = awayGoals;
  $('#battle-title').textContent = victory ? 'VICTORY' : homeGoals === awayGoals ? 'DRAW' : 'FULL TIME';
  const reward = victory ? 2000 + Math.max(1, 4 - Math.floor(state.wins / 3)) * 125 : homeGoals === awayGoals ? 600 : 250;
  state.coins += reward;
  state.matchday += 1;
  if (victory) state.wins += 1;
  save(); updateDashboard();
  $('#commentary').textContent = `試合終了。${reward.toLocaleString('ja-JP')}コインを獲得しました。`;
  button.disabled = false;
  button.textContent = '次の試合へ';
  button.onclick = () => { closeModals(); startBattle(); };
}

function buyPack(button, premium) {
  const cost = Number(button.dataset.cost);
  const balanceKey = premium ? 'gems' : 'coins';
  if (state[balanceKey] < cost) { toast(`${premium ? 'ジェム' : 'コイン'}が不足しています`); return; }
  const unowned = PLAYERS.filter(player => !state.owned.includes(player.id));
  const eligible = premium ? unowned.filter(player => player.rating >= 93) : unowned;
  const pool = eligible.length ? eligible : unowned.length ? unowned : PLAYERS;
  const won = pool[Math.floor(Math.random() * pool.length)];
  const duplicate = state.owned.includes(won.id);
  state[balanceKey] -= cost;
  if (duplicate) state.coins += 1200; else state.owned.push(won.id);
  save(); updateDashboard(); renderCards(); renderSquad();
  $('#pack-result-title').textContent = duplicate ? '重複カード：1,200コインに交換' : '新しい選手を獲得！';
  $('#revealed-card').innerHTML = cardTemplate(won);
  openModal('#pack-modal');
}

$$('[data-view]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view)));
$('[data-action="home"]').onclick = () => navigate('home');
$$('.filters button').forEach(button => button.onclick = () => {
  $$('.filters button').forEach(item => item.classList.remove('active'));
  button.classList.add('active'); state.filter = button.dataset.filter; renderCards();
});
$('#sort').onchange = renderCards;
$('#battle-btn').onclick = startBattle;
$('#quick-match').onclick = startBattle;
$('#auto-squad').onclick = () => { renderSquad(); toast('現在のベストメンバーを編成しました'); };
$$('.buy-pack').forEach((button,index) => button.onclick = () => buyPack(button,index === 1));
$$('.modal-close').forEach(button => button.onclick = closeModals);
$('.modal-close-action').onclick = () => { closeModals(); navigate('cards'); };
$$('.modal').forEach(modal => modal.onclick = event => { if (event.target === modal) closeModals(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModals(); });

renderCards(); renderSquad(); updateDashboard();
