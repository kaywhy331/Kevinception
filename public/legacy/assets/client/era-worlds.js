// @ts-nocheck
import { toast, track } from './global.js';

const dataElement = document.querySelector('#era-world-data');
if (!dataElement) throw new Error('Era world data is missing.');
const data = JSON.parse(dataElement.textContent || '{}');
const eraId = String(data.era.id);
const root = document.querySelector('[data-era-world]');
const boot = document.querySelector('[data-era-boot]');
const stage = document.querySelector('[data-era-stage]');
const guide = document.querySelector('[data-era-guide]');
const guideAnswer = document.querySelector('[data-guide-answer]');
const projectDialog = document.querySelector('[data-era-project-dialog]');
const timelineDialog = document.querySelector('[data-era-timeline-dialog]');
const stateKey = 'kevinception:timeline-v6';
let soundEnabled = false;
let audioContext = null;
let activeProject = null;
let currentClip = null;
let currentCommentClip = null;
let lastEchoResponse = '';

function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key, value) { try { localStorage.setItem(key, value); } catch { /* unavailable */ } }
function readState() {
  try {
    const parsed = JSON.parse(safeGet(stateKey) || '{}');
    return {
      artifacts: Array.isArray(parsed.artifacts) ? parsed.artifacts : [],
      visited: Array.isArray(parsed.visited) ? parsed.visited : [],
      y1990: parsed.y1990 || { channel: 2, tvOn: true, consoleOn: false, game: { x: 2, y: 12, fragments: [] } },
      y2010: parsed.y2010 || { likes: {}, comments: {}, posts: [], pokeCount: 0, messages: [] },
      y2020: parsed.y2020 || { likes: {}, saves: {}, comments: {} },
      y2030: parsed.y2030 || { completed: 0, approvals: 0 },
      y2040: parsed.y2040 || { prompts: [], resonance: 0 }
    };
  } catch {
    return {
      artifacts: [], visited: [],
      y1990: { channel: 2, tvOn: true, consoleOn: false, game: { x: 2, y: 12, fragments: [] } },
      y2010: { likes: {}, comments: {}, posts: [], pokeCount: 0, messages: [] },
      y2020: { likes: {}, saves: {}, comments: {} },
      y2030: { completed: 0, approvals: 0 },
      y2040: { prompts: [], resonance: 0 }
    };
  }
}
let state = readState();
function saveState() { safeSet(stateKey, JSON.stringify(state)); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function reducedMotion() { return document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches; }
function openDialog(dialog) { if (!dialog) return; if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); }
function closeDialog(dialog) { if (!dialog) return; if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
function projectBySlug(slug) { return data.projects.find((project) => project.slug === slug); }
function eraRoute(id) { return data.eras.find((era) => String(era.id) === String(id))?.route || '/experience/'; }

function beep(kind = 'click') {
  if (!soundEnabled) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const presets = {
    click: [440, .04, .025, 'square'],
    channel: [190, .08, .035, 'sawtooth'],
    enter: [180, .18, .055, 'square'],
    discover: [760, .42, .07, 'sine'],
    success: [610, .22, .05, 'sine'],
    error: [95, .22, .06, 'square'],
    message: [520, .11, .04, 'triangle'],
    game: [330, .07, .035, 'square']
  };
  const [frequency, duration, volume, type] = presets[kind] || presets.click;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (kind === 'discover') oscillator.frequency.exponentialRampToValueAtTime(1280, now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function updateArtifactCount() {
  document.querySelectorAll('[data-artifact-count]').forEach((node) => { node.textContent = `${state.artifacts.length} / 5`; });
}
function discoverArtifact(id) {
  const artifact = Object.values(data.temporalArtifacts).find((item) => item.id === id);
  if (!artifact) return;
  if (!state.artifacts.includes(id)) {
    state.artifacts.push(id);
    saveState();
    beep('discover');
    const notice = document.querySelector('[data-era-discovery]');
    if (notice) {
      notice.querySelector('[data-discovery-name]').textContent = artifact.name;
      notice.querySelector('[data-discovery-description]').textContent = artifact.description;
      notice.hidden = false;
      clearTimeout(discoverArtifact.timer);
      discoverArtifact.timer = setTimeout(() => { notice.hidden = true; }, reducedMotion() ? 2500 : 6200);
    }
    track('temporal_artifact_discovered', { era: eraId, artifact: id });
  } else {
    toast(`${artifact.name} is already in your archive.`);
  }
  updateArtifactCount();
}

function enterWorld() {
  boot.hidden = true;
  stage.hidden = false;
  root.classList.add('is-entered');
  if (!state.visited.includes(eraId)) state.visited.push(eraId);
  saveState();
  beep('enter');
  track('era_entered', { era: eraId, year: data.era.anchorYear });
  stage.querySelector('button, a, input, textarea, canvas')?.focus?.({ preventScroll: true });
  if (eraId === '1990') init1990();
  if (eraId === '2010') init2010();
  if (eraId === '2020') init2020();
  if (eraId === '2030') init2030();
  if (eraId === '2040') init2040();
}

function openProject(slug) {
  const project = projectBySlug(slug);
  if (!project || !projectDialog) return;
  activeProject = project;
  projectDialog.querySelector('[data-project-eyebrow]').textContent = project.eyebrow;
  projectDialog.querySelector('[data-project-title]').textContent = project.title;
  projectDialog.querySelector('[data-project-summary]').textContent = project.summary;
  projectDialog.querySelector('[data-project-problem]').textContent = project.problem;
  projectDialog.querySelector('[data-project-tags]').innerHTML = project.disciplines.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  projectDialog.querySelector('[data-project-roles]').innerHTML = project.roles.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  projectDialog.querySelector('[data-project-decisions]').innerHTML = project.decisions.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  projectDialog.querySelector('[data-project-outcomes]').innerHTML = project.outcomes.map((item) => `<li><b>${escapeHtml(item.label)}</b><span>${escapeHtml(item.value)}</span></li>`).join('');
  projectDialog.querySelector('[data-project-link]').href = `/work/${project.slug}/`;
  openDialog(projectDialog);
  track('era_project_opened', { era: eraId, project: slug });
}

function guideActionButton(action) {
  const attrs = [`data-guide-action="${escapeHtml(action.type)}"`];
  if (action.slug) attrs.push(`data-slug="${escapeHtml(action.slug)}"`);
  if (action.era) attrs.push(`data-era="${escapeHtml(action.era)}"`);
  return `<button type="button" ${attrs.join(' ')}>${escapeHtml(action.label)}</button>`;
}
function answerGuide(faq) {
  if (!faq || !guideAnswer) return;
  guideAnswer.innerHTML = `<p><strong>${escapeHtml(faq.shortAnswer)}</strong></p><details><summary>Full answer</summary><p>${escapeHtml(faq.fullAnswer)}</p></details><div class="era-guide__actions">${(faq.actions || []).map(guideActionButton).join('')}</div>`;
  guide.hidden = false;
  track('era_guide_answered', { era: eraId, question: faq.id });
}
function findFaq(question) {
  const q = String(question).toLowerCase().trim();
  const direct = data.knowledgeBase.faqs.find((faq) => faq.id === question);
  if (direct) return direct;
  const project = data.projects.find((item) => q.includes(item.title.toLowerCase()) || q.includes(item.slug.replaceAll('-', ' ')));
  if (project) return {
    id: `project-${project.slug}`,
    shortAnswer: `${project.title}: ${project.summary}`,
    fullAnswer: `Kevin’s role included ${project.roles.join(', ')}. The work focused on ${project.problem}`,
    actions: [{ type: 'open-project', slug: project.slug, label: `Open ${project.title}` }]
  };
  if (/contact|email|reach|hire|talk/.test(q)) return data.knowledgeBase.faqs.find((item) => item.id === 'contact');
  if (/current|now|building/.test(q)) return data.knowledgeBase.faqs.find((item) => item.id === 'current-work');
  if (/work style|approach|process|how.*work/.test(q)) return data.knowledgeBase.faqs.find((item) => item.id === 'working-style');
  if (/origin|technology|internet|started|1990|2000/.test(q)) return data.knowledgeBase.faqs.find((item) => item.id === 'technology-story');
  if (/skill|best|problem|strength|automation|capabilit/.test(q)) return data.knowledgeBase.faqs.find((item) => item.id === 'best-problems');
  return data.knowledgeBase.faqs.find((item) => item.id === 'what-does-kevin-do');
}
function runGuideAction(button) {
  const type = button.dataset.guideAction;
  if (type === 'open-project') openProject(button.dataset.slug);
  if (type === 'open-resume') location.href = '/resume/';
  if (type === 'open-work') location.href = '/work/';
  if (type === 'contact') location.href = '/contact/';
  if (type === 'switch-era') location.href = eraRoute(button.dataset.era);
}

// ---------------------------------------------------------------------------
// 1990 — KevinVision and The Circuit of Time
// ---------------------------------------------------------------------------
let y1990Initialized = false;
let kvChannel = Number(state.y1990.channel || 2);
let kvTvOn = state.y1990.tvOn !== false;
let kvConsoleOn = Boolean(state.y1990.consoleOn);
const kvChannels = [2, 3, 4, 5, 7, 9, 13];
let game = null;

function setKvChannel(channel, { staticFlash = true } = {}) {
  if (!kvChannels.includes(Number(channel))) return;
  kvChannel = Number(channel);
  state.y1990.channel = kvChannel;
  saveState();
  document.querySelectorAll('[data-tv-channel]').forEach((panel) => { panel.hidden = Number(panel.dataset.tvChannel) !== kvChannel; });
  document.querySelectorAll('[data-kv-channel]').forEach((button) => button.classList.toggle('is-active', Number(button.dataset.kvChannel) === kvChannel));
  const number = document.querySelector('[data-kv-channel-number]');
  if (number) number.textContent = `CH ${kvChannel}`;
  if (staticFlash && kvTvOn) {
    const flash = document.querySelector('[data-kv-static]');
    flash?.classList.remove('is-flashing');
    requestAnimationFrame(() => flash?.classList.add('is-flashing'));
    beep('channel');
  }
  updateGameSignal();
  track('tv_channel_changed', { channel: kvChannel });
}
function setKvTvPower(on) {
  kvTvOn = Boolean(on);
  state.y1990.tvOn = kvTvOn;
  saveState();
  document.querySelector('[data-kv-tv-off]').hidden = kvTvOn;
  document.querySelector('[data-kv-picture]').hidden = !kvTvOn;
  const button = document.querySelector('[data-kv-power]');
  button?.setAttribute('aria-pressed', String(kvTvOn));
  document.querySelector('[data-kv-tv]')?.classList.toggle('is-off', !kvTvOn);
  if (kvTvOn) { beep('enter'); setKvChannel(kvChannel, { staticFlash: false }); }
  else beep('error');
}
function setKvConsolePower(on) {
  kvConsoleOn = Boolean(on);
  state.y1990.consoleOn = kvConsoleOn;
  saveState();
  const button = document.querySelector('[data-kv-console-power]');
  button?.setAttribute('aria-pressed', String(kvConsoleOn));
  document.querySelector('[data-kv-console]')?.classList.toggle('is-on', kvConsoleOn);
  if (kvConsoleOn) { setKvChannel(3); beep('game'); }
  else { updateGameSignal(); game && (game.running = false); beep('error'); }
}
function updateGameSignal() {
  const noSignal = document.querySelector('[data-kv-game-nosignal]');
  const shell = document.querySelector('[data-kv-game-shell]');
  if (!noSignal || !shell) return;
  const active = kvChannel === 3 && kvConsoleOn && kvTvOn;
  noSignal.hidden = active;
  shell.hidden = !active;
  if (active && game) drawGame();
}

function initGame() {
  const canvas = document.querySelector('[data-kv-game-canvas]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const saved = state.y1990.game || {};
  game = {
    canvas, ctx,
    running: false,
    paused: false,
    won: false,
    x: Number(saved.x ?? 2),
    y: Number(saved.y ?? 12),
    direction: 'down',
    fragments: new Set(Array.isArray(saved.fragments) ? saved.fragments : []),
    tick: 0,
    mapWidth: 16,
    mapHeight: 15,
    tile: 16,
    obstacles: new Set(),
    items: [
      { id: 'curiosity', x: 3, y: 3, color: '#ffd84d', label: 'CURIOSITY' },
      { id: 'systems', x: 12, y: 4, color: '#6fe9ff', label: 'SYSTEMS' },
      { id: 'invention', x: 13, y: 12, color: '#ff7ad9', label: 'INVENTION' }
    ],
    npcs: [
      { x: 2, y: 2, label: 'OLD TECHNICIAN', text: 'Every machine has rules. Learn the rules and you can find the hidden path.' },
      { x: 13, y: 2, label: 'CARTOGRAPHER', text: 'The map is not the world, but it helps you decide where to look next.' },
      { x: 8, y: 12, label: 'SIGNAL KEEPER', text: 'The future does not arrive all at once. It leaks backward through the things people build.' }
    ]
  };
  // Water and forest boundaries.
  for (let x = 5; x <= 7; x += 1) for (let y = 4; y <= 7; y += 1) game.obstacles.add(`${x},${y}`);
  [[1,5],[2,5],[3,5],[12,7],[13,7],[14,7],[9,3],[10,3],[9,4],[1,10],[2,10],[14,10]].forEach(([x,y]) => game.obstacles.add(`${x},${y}`));
  game.npcs.forEach((npc) => game.obstacles.add(`${npc.x},${npc.y}`));
  document.querySelector('[data-game-fragments]').textContent = `${game.fragments.size} / 3 FRAGMENTS`;
  drawGame();
}
function saveGame() {
  state.y1990.game = { x: game.x, y: game.y, fragments: [...game.fragments] };
  saveState();
}
function gameMessage(message, { html = false, duration = 3500 } = {}) {
  const node = document.querySelector('[data-game-message]');
  if (!node) return;
  if (html) node.innerHTML = message; else node.textContent = message;
  node.hidden = false;
  clearTimeout(gameMessage.timer);
  gameMessage.timer = setTimeout(() => { node.hidden = true; }, reducedMotion() ? Math.min(duration, 2200) : duration);
}
function gamePassable(x, y) {
  return x >= 0 && x < game.mapWidth && y >= 1 && y < game.mapHeight && !game.obstacles.has(`${x},${y}`) && !(x === 8 && y === 1);
}
function gameMove(dx, dy, distance = 1) {
  if (!game?.running || game.paused || game.won) return;
  game.direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy < 0 ? 'up' : 'down';
  for (let step = 0; step < distance; step += 1) {
    const nx = game.x + dx;
    const ny = game.y + dy;
    if (!gamePassable(nx, ny)) { beep('error'); break; }
    game.x = nx; game.y = ny;
    const item = game.items.find((candidate) => candidate.x === game.x && candidate.y === game.y && !game.fragments.has(candidate.id));
    if (item) {
      game.fragments.add(item.id);
      document.querySelector('[data-game-fragments]').textContent = `${game.fragments.size} / 3 FRAGMENTS`;
      gameMessage(`${item.label} RECOVERED — ${data.timelineContent['1990'].game.fragments.find((fragment) => fragment.id === item.id)?.description || ''}`);
      beep('success');
      if (game.fragments.size === 3) gameMessage('ALL SIGNAL FRAGMENTS RECOVERED. RETURN TO THE BROADCAST TOWER.', { duration: 5200 });
    }
  }
  saveGame(); drawGame();
}
function adjacent(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 1; }
function gameAction() {
  if (!game?.running || game.paused) return;
  const player = { x: game.x, y: game.y };
  const npc = game.npcs.find((candidate) => adjacent(player, candidate));
  if (npc) { gameMessage(`${npc.label}: ${npc.text}`, { duration: 6000 }); beep('message'); return; }
  if (Math.abs(game.x - 8) + Math.abs(game.y - 1) <= 1) {
    if (game.fragments.size < 3) { gameMessage(`THE TOWER NEEDS ${3 - game.fragments.size} MORE SIGNAL FRAGMENT${game.fragments.size === 2 ? '' : 'S'}.`); beep('error'); return; }
    game.won = true;
    gameMessage('SIGNAL RESTORED. NEXT CONNECTION AVAILABLE: YEAR 2000. <a href="/experience/2000/">CONNECT NOW →</a>', { html: true, duration: 12000 });
    discoverArtifact('broadcast-signal');
    beep('discover');
    drawGame();
    return;
  }
  gameMessage('Nothing responds here. Try another edge of the map.');
}
function startPauseGame() {
  if (!game) return;
  if (!game.running) {
    game.running = true; game.paused = false;
    document.querySelector('[data-kv-game-overlay]').hidden = true;
    gameMessage('FIND CURIOSITY, SYSTEMS, AND INVENTION. RETURN THEM TO THE TOWER.', { duration: 4500 });
  } else {
    game.paused = !game.paused;
    gameMessage(game.paused ? 'PAUSED' : 'RESUMED', { duration: 1000 });
  }
  beep('game'); drawGame();
}
function resetGame() {
  if (!game) return;
  game.x = 2; game.y = 12; game.fragments.clear(); game.running = false; game.paused = false; game.won = false;
  document.querySelector('[data-game-fragments]').textContent = '0 / 3 FRAGMENTS';
  document.querySelector('[data-kv-game-overlay]').hidden = false;
  saveGame(); drawGame(); toast('The Circuit of Time has been reset.');
}
function drawPixelText(ctx, text, x, y, color = '#fff', size = 7, align = 'left') {
  ctx.save(); ctx.fillStyle = color; ctx.font = `bold ${size}px monospace`; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillText(text, x, y); ctx.restore();
}
function drawGame() {
  if (!game) return;
  const { ctx, canvas, tile } = game;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Grass tiles.
  for (let y = 0; y < game.mapHeight; y += 1) {
    for (let x = 0; x < game.mapWidth; x += 1) {
      ctx.fillStyle = (x + y) % 2 ? '#4f9b45' : '#46913f';
      ctx.fillRect(x * tile, y * tile, tile, tile);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fillRect(x * tile + ((x * 7 + y * 3) % 12), y * tile + ((y * 5 + x) % 11), 2, 2);
    }
  }
  // Top HUD.
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, canvas.width, 16);
  drawPixelText(ctx, 'CIRCUIT OF TIME', 5, 4, '#f8e58c', 7);
  drawPixelText(ctx, `${game.fragments.size}/3`, 247, 4, '#7de8ff', 7, 'right');
  // Water.
  for (let x = 5; x <= 7; x += 1) for (let y = 4; y <= 7; y += 1) {
    ctx.fillStyle = (game.tick + x + y) % 2 ? '#287bb8' : '#2f8bc7'; ctx.fillRect(x*tile,y*tile,tile,tile);
    ctx.fillStyle = '#79d9ea'; ctx.fillRect(x*tile+3,y*tile+6,8,2);
  }
  // Forest/rocks.
  game.obstacles.forEach((key) => {
    const [x,y] = key.split(',').map(Number);
    if (x >= 5 && x <= 7 && y >= 4 && y <= 7) return;
    ctx.fillStyle = '#215b32'; ctx.fillRect(x*tile+2,y*tile+3,12,11);
    ctx.fillStyle = '#367d42'; ctx.fillRect(x*tile+4,y*tile+1,8,9);
    ctx.fillStyle = '#5d3b28'; ctx.fillRect(x*tile+7,y*tile+10,3,6);
  });
  // Paths.
  ctx.fillStyle = '#b59a62';
  for (let x = 1; x < 15; x += 1) ctx.fillRect(x*tile+4, 11*tile+5, 12, 7);
  for (let y = 1; y < 14; y += 1) ctx.fillRect(8*tile+4, y*tile, 8, 16);
  // Tower.
  ctx.fillStyle = '#5d6578'; ctx.fillRect(8*tile+2, 16, 12, 15);
  ctx.fillStyle = '#d8e2ff'; ctx.fillRect(8*tile+7, 18, 2, 9);
  ctx.fillStyle = game.fragments.size === 3 ? '#ffe869' : '#7b2847'; ctx.fillRect(8*tile+5, 19, 6, 4);
  // Items.
  game.items.forEach((item) => {
    if (game.fragments.has(item.id)) return;
    ctx.fillStyle = item.color; ctx.fillRect(item.x*tile+5,item.y*tile+4,6,8);
    ctx.fillStyle = '#fff'; ctx.fillRect(item.x*tile+7,item.y*tile+2,2,12);
  });
  // NPCs.
  game.npcs.forEach((npc, index) => {
    ctx.fillStyle = ['#cf6e3b','#4f67cb','#b25b9c'][index]; ctx.fillRect(npc.x*tile+4,npc.y*tile+5,8,9);
    ctx.fillStyle = '#f4c9a1'; ctx.fillRect(npc.x*tile+5,npc.y*tile+2,6,5);
  });
  // Player.
  const px = game.x*tile, py = game.y*tile;
  ctx.fillStyle = '#274e9f'; ctx.fillRect(px+4,py+7,8,8);
  ctx.fillStyle = '#f2c39b'; ctx.fillRect(px+5,py+3,6,6);
  ctx.fillStyle = '#25351f'; ctx.fillRect(px+4,py+2,8,3);
  ctx.fillStyle = '#fff';
  if (game.direction === 'left') ctx.fillRect(px+5,py+5,1,1); else if (game.direction === 'right') ctx.fillRect(px+10,py+5,1,1); else { ctx.fillRect(px+6,py+5,1,1); ctx.fillRect(px+9,py+5,1,1); }
  if (game.won) {
    ctx.fillStyle = 'rgba(5,8,20,.82)'; ctx.fillRect(18,70,220,88);
    drawPixelText(ctx, 'SIGNAL RESTORED', 128, 86, '#ffe869', 15, 'center');
    drawPixelText(ctx, 'NEXT CONNECTION: 2000', 128, 114, '#7de8ff', 9, 'center');
    drawPixelText(ctx, 'PRESS A NEAR THE TOWER', 128, 135, '#fff', 7, 'center');
  } else if (game.paused) {
    ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(70,98,116,44);
    drawPixelText(ctx, 'PAUSED', 128, 112, '#fff', 14, 'center');
  }
  game.tick += 1;
}
function handleGameInput(input) {
  if (!game || !kvConsoleOn || kvChannel !== 3 || !kvTvOn) return;
  if (input === 'up') gameMove(0,-1);
  if (input === 'down') gameMove(0,1);
  if (input === 'left') gameMove(-1,0);
  if (input === 'right') gameMove(1,0);
  if (input === 'a') gameAction();
  if (input === 'b') {
    const vector = { up:[0,-1],down:[0,1],left:[-1,0],right:[1,0] }[game.direction] || [0,1];
    gameMove(vector[0],vector[1],2);
  }
  if (input === 'start') startPauseGame();
  if (input === 'select') resetGame();
}
function init1990() {
  if (y1990Initialized) return;
  y1990Initialized = true;
  initGame();
  setKvTvPower(kvTvOn);
  setKvConsolePower(kvConsoleOn);
  setKvChannel(kvChannel, { staticFlash: false });
  document.querySelector('[data-kv-power]')?.addEventListener('click', () => setKvTvPower(!kvTvOn));
  document.querySelector('[data-kv-channel-up]')?.addEventListener('click', () => setKvChannel(kvChannels[(kvChannels.indexOf(kvChannel)+1)%kvChannels.length]));
  document.querySelector('[data-kv-channel-down]')?.addEventListener('click', () => setKvChannel(kvChannels[(kvChannels.indexOf(kvChannel)-1+kvChannels.length)%kvChannels.length]));
  document.querySelectorAll('[data-kv-channel]').forEach((button) => button.addEventListener('click', () => setKvChannel(Number(button.dataset.kvChannel))));
  document.querySelector('[data-kv-console-power]')?.addEventListener('click', () => setKvConsolePower(!kvConsoleOn));
  document.querySelector('[data-game-start]')?.addEventListener('click', startPauseGame);
  document.querySelector('[data-game-reset]')?.addEventListener('click', resetGame);
  document.querySelectorAll('[data-game-input]').forEach((button) => button.addEventListener('click', () => handleGameInput(button.dataset.gameInput)));
  document.querySelector('[data-kv-tracking]')?.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    root.style.setProperty('--tracking-noise', `${Math.abs(50-value)/55}`);
    if (kvChannel === 13 && value >= 88) {
      document.querySelector('[data-kv-secret]').hidden = false;
      document.querySelector('[data-kv-scrambled-title]').textContent = 'INCOMING SCREEN NAME';
      document.querySelector('[data-kv-scrambled-copy]').textContent = 'KevinY2K is attempting to connect from the year 2000.';
      if (value >= 96) discoverArtifact('broadcast-signal');
    }
  });
}

// ---------------------------------------------------------------------------
// 2010 — archived social-world controller (the live Commerce page uses kevazon.js)
// ---------------------------------------------------------------------------
let y2010Initialized = false;
function setKbTab(tab) {
  document.querySelectorAll('[data-kb-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.kbTab === tab));
  document.querySelectorAll('[data-kb-panel]').forEach((panel) => { panel.hidden = panel.dataset.kbPanel !== tab; panel.classList.toggle('is-active', panel.dataset.kbPanel === tab); });
  track('kevinbook_tab_opened', { tab });
}
function renderKbStoredPosts() {
  const feed = document.querySelector('[data-kb-feed]');
  if (!feed || !state.y2010.posts.length) return;
  state.y2010.posts.slice().reverse().forEach((text, index) => {
    const article = document.createElement('article'); article.className = 'kb-post kb-post--visitor';
    article.innerHTML = `<header><span>YOU</span><div><b>Timeline Visitor</b><small>Just now · 🔒</small></div></header><p>${escapeHtml(text)}</p><footer><button type="button" disabled>Private timeline note</button></footer>`;
    feed.prepend(article);
  });
}
function init2010() {
  if (y2010Initialized) return;
  y2010Initialized = true;
  renderKbStoredPosts();
  document.querySelectorAll('[data-kb-tab]').forEach((button) => button.addEventListener('click', () => setKbTab(button.dataset.kbTab)));
  document.querySelector('[data-kb-status-form]')?.addEventListener('submit', (event) => {
    event.preventDefault(); const form = event.currentTarget; const text = form.elements.status.value.trim(); if (!text) return;
    state.y2010.posts.push(text); saveState();
    const article = document.createElement('article'); article.className = 'kb-post kb-post--visitor';
    article.innerHTML = `<header><span>YOU</span><div><b>Timeline Visitor</b><small>Just now · 🔒</small></div></header><p>${escapeHtml(text)}</p><footer><button type="button" disabled>Private timeline note</button></footer>`;
    document.querySelector('[data-kb-feed]').prepend(article); form.reset(); beep('message'); toast('Your private timeline update was posted.');
  });
  document.querySelectorAll('[data-kb-post]').forEach((post) => {
    const id = post.dataset.kbPost;
    const like = post.querySelector('[data-kb-like]');
    const count = post.querySelector('[data-kb-like-count]');
    const baseLikes = Number(post.dataset.baseLikes || 0);
    const renderLikeState = () => {
      const liked = Boolean(state.y2010.likes[id]);
      like.classList.toggle('is-active', liked);
      like.setAttribute('aria-pressed', String(liked));
      count.textContent = `${baseLikes + (liked ? 1 : 0)} people like this`;
    };
    renderLikeState();
    like.addEventListener('click', () => {
      state.y2010.likes[id] = !state.y2010.likes[id];
      renderLikeState();
      saveState();
      beep('click');
    });
    post.querySelector('[data-kb-comment-toggle]').addEventListener('click', () => { const form = post.querySelector('[data-kb-comment-form]'); form.hidden = !form.hidden; if (!form.hidden) form.elements.comment.focus(); });
    post.querySelector('[data-kb-comment-form]').addEventListener('submit', (event) => {
      event.preventDefault(); const text = event.currentTarget.elements.comment.value.trim(); if (!text) return;
      state.y2010.comments[id] ||= []; state.y2010.comments[id].push(text); saveState();
      const comment = document.createElement('p'); comment.innerHTML = `<b>Timeline Visitor</b> ${escapeHtml(text)}`; post.querySelector('[data-kb-comments]').append(comment);
      post.querySelector('[data-kb-comment-count]').textContent = `${state.y2010.comments[id].length} comment${state.y2010.comments[id].length === 1 ? '' : 's'}`;
      event.currentTarget.reset(); beep('message');
    });
    (state.y2010.comments[id] || []).forEach((text) => { const comment = document.createElement('p'); comment.innerHTML = `<b>Timeline Visitor</b> ${escapeHtml(text)}`; post.querySelector('[data-kb-comments]').append(comment); });
    const storedCommentCount = (state.y2010.comments[id] || []).length;
    post.querySelector('[data-kb-comment-count]').textContent = `${storedCommentCount} comment${storedCommentCount === 1 ? '' : 's'}`;
    post.querySelector('[data-kb-share]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(post.querySelector(':scope > p').textContent); toast('Post copied to clipboard.'); } catch { toast('Post marked for sharing in this timeline.'); } });
  });
  document.querySelector('[data-kb-poke]')?.addEventListener('click', () => {
    state.y2010.pokeCount += 1; saveState(); beep('message'); toast(`You poked Kevin${state.y2010.pokeCount > 1 ? ` ${state.y2010.pokeCount} times` : ''}.`);
    if (state.y2010.pokeCount >= 3) discoverArtifact('project-blueprint');
  });
  document.querySelector('[data-kb-farm]')?.addEventListener('click', (event) => { event.currentTarget.textContent = 'Request ignored'; event.currentTarget.disabled = true; toast('FarmField will ask again in 14 minutes.'); });
  document.querySelector('[data-kb-friend-request]')?.addEventListener('click', (event) => { event.currentTarget.innerHTML = 'Friends ✓'; toast('You are now connected across one additional timeline.'); beep('success'); });
  document.querySelectorAll('[data-kb-album]').forEach((button) => button.addEventListener('click', () => toast('This album contains original reconstructions until Kevin supplies approved photographs.')));
  const messageDialog = document.querySelector('[data-kb-message-dialog]');
  document.querySelectorAll('[data-kb-message-open]').forEach((button) => button.addEventListener('click', () => openDialog(messageDialog)));
  document.querySelector('[data-kb-message-form]')?.addEventListener('submit', (event) => {
    event.preventDefault(); const form = event.currentTarget; const message = form.elements.message.value.trim(); if (!message) return;
    state.y2010.messages.push({ subject: form.elements.subject.value, message }); saveState();
    const result = document.querySelector('[data-kb-message-result]'); result.hidden = false; result.innerHTML = '<h3>Message queued</h3><p>This static demonstration saved the note on this device. Use the direct Contact page to send a real message.</p><a href="/contact/">Open Contact →</a>';
    form.hidden = true; beep('message');
  });
  document.querySelector('[data-kb-search]')?.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    document.querySelectorAll('[data-kb-post]').forEach((post) => { post.hidden = query && !post.textContent.toLowerCase().includes(query); });
  });
}

// ---------------------------------------------------------------------------
// 2020 — KevTok
// ---------------------------------------------------------------------------
let y2020Initialized = false;
let ktLogoClicks = 0;
function visibleKtClips() { return [...document.querySelectorAll('[data-kt-clip]')].filter((clip) => !clip.hidden); }
function activateClip(clip) {
  if (!clip || clip.hidden) return;
  document.querySelectorAll('[data-kt-clip]').forEach((item) => item.classList.toggle('is-active', item === clip));
  currentClip = clip;
  if (!reducedMotion()) clip.classList.add('is-playing');
  track('kevtok_clip_viewed', { clip: clip.dataset.clipId });
}
function filterKt(category) {
  document.querySelectorAll('[data-kt-filter]').forEach((button) => button.classList.toggle('is-active', button.dataset.ktFilter === category));
  if (category === 'drafts') {
    discoverArtifact('unposted-loop');
    toast('One unposted draft was recovered. The public feed remains finite.');
    category = 'all';
  }
  document.querySelectorAll('[data-kt-clip]').forEach((clip) => { clip.hidden = category !== 'all' && clip.dataset.category !== category; });
  const first = visibleKtClips()[0]; if (first) first.scrollIntoView({ block: 'start' });
}
function openKtComments(clip) {
  currentCommentClip = clip.dataset.clipId;
  const dialog = document.querySelector('[data-kt-comment-dialog]');
  const comments = state.y2020.comments[currentCommentClip] || [];
  dialog.querySelector('[data-kt-comments]').innerHTML = `<article><b>@systems_view</b><p>The interface is part of the explanation.</p></article><article><b>@ops_builder</b><p>Saving this for the next “just automate it” conversation.</p></article>${comments.map((text)=>`<article><b>@timeline_visitor</b><p>${escapeHtml(text)}</p></article>`).join('')}`;
  openDialog(dialog);
}
function runKtAction(button) {
  const action = button.dataset.ktAction;
  if (action === 'project') openProject(button.dataset.projectSlug);
  if (action === 'profile') location.href = '/about/';
  if (action === 'resume') location.href = '/resume/';
  if (action === 'contact') location.href = '/contact/';
  if (action === 'guide') guide.hidden = false;
  if (action === 'era') location.href = eraRoute(button.dataset.era);
}
function init2020() {
  if (y2020Initialized) return;
  y2020Initialized = true;
  const clips = [...document.querySelectorAll('[data-kt-clip]')];
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting && entry.intersectionRatio > .58) activateClip(entry.target); }), { threshold: [.58] });
  clips.forEach((clip) => {
    observer.observe(clip);
    const id = clip.dataset.clipId;
    const like = clip.querySelector('[data-kt-like]'); const save = clip.querySelector('[data-kt-save]');
    if (state.y2020.likes[id]) { like.classList.add('is-active'); like.querySelector('b').textContent = '1'; }
    if (state.y2020.saves[id]) { save.classList.add('is-active'); save.querySelector('b').textContent = '1'; }
    clip.querySelector('[data-kt-play]').addEventListener('click', () => { clip.classList.toggle('is-playing'); clip.querySelector('[data-kt-play]').textContent = clip.classList.contains('is-playing') ? '❚❚' : '▶'; beep('click'); });
    like.addEventListener('click', () => { state.y2020.likes[id] = !state.y2020.likes[id]; like.classList.toggle('is-active', state.y2020.likes[id]); like.querySelector('b').textContent = state.y2020.likes[id] ? '1' : '0'; saveState(); beep('click'); });
    save.addEventListener('click', () => { state.y2020.saves[id] = !state.y2020.saves[id]; save.classList.toggle('is-active', state.y2020.saves[id]); save.querySelector('b').textContent = state.y2020.saves[id] ? '1' : '0'; saveState(); beep('click'); });
    clip.querySelector('[data-kt-comment]').addEventListener('click', () => openKtComments(clip));
    clip.querySelector('[data-kt-share]').addEventListener('click', async () => { const text = clip.querySelector('h1').textContent; if (navigator.share) { try { await navigator.share({ title: 'KevTok', text, url: location.href }); } catch {} } else { try { await navigator.clipboard.writeText(`${text} — ${location.href}`); toast('Clip link copied.'); } catch { toast('Share link prepared.'); } } });
    clip.querySelector('[data-kt-action]').addEventListener('click', (event) => runKtAction(event.currentTarget));
    const openTranscript = () => {
      const source = data.timelineContent['2020'].clips.find((item) => item.id === id); const dialog = document.querySelector('[data-kt-transcript-dialog]');
      dialog.querySelector('[data-kt-transcript-title]').textContent = source.hook; dialog.querySelector('[data-kt-transcript-body]').textContent = source.body; openDialog(dialog);
    };
    clip.querySelector('[data-kt-transcript]').addEventListener('click', openTranscript);
    clip.querySelector('.kt-caption').addEventListener('dblclick', () => {
      const source = data.timelineContent['2020'].clips.find((item) => item.id === id); const dialog = document.querySelector('[data-kt-transcript-dialog]');
      dialog.querySelector('[data-kt-transcript-title]').textContent = source.hook; dialog.querySelector('[data-kt-transcript-body]').textContent = source.body; openDialog(dialog);
    });
  });
  document.querySelectorAll('[data-kt-filter]').forEach((button) => button.addEventListener('click', () => filterKt(button.dataset.ktFilter)));
  document.querySelector('[data-kt-comment-form]')?.addEventListener('submit', (event) => {
    event.preventDefault(); const text = event.currentTarget.elements.comment.value.trim(); if (!text || !currentCommentClip) return;
    state.y2020.comments[currentCommentClip] ||= []; state.y2020.comments[currentCommentClip].push(text); saveState();
    event.currentTarget.reset(); closeDialog(document.querySelector('[data-kt-comment-dialog]')); toast('Comment added to this local timeline.'); beep('message');
  });
  document.querySelector('[data-kt-logo]')?.addEventListener('click', (event) => { event.preventDefault(); ktLogoClicks += 1; if (ktLogoClicks >= 5) discoverArtifact('unposted-loop'); });
  document.querySelector('[data-kt-feed]')?.addEventListener('keydown', (event) => {
    if (!['ArrowDown','ArrowUp'].includes(event.key)) return; event.preventDefault();
    const visible = visibleKtClips(); const index = Math.max(0, visible.indexOf(currentClip)); const next = event.key === 'ArrowDown' ? visible[Math.min(visible.length-1,index+1)] : visible[Math.max(0,index-1)]; next?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
  document.querySelector('[data-kt-jump]')?.addEventListener('click', () => clips[0]?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }));
  activateClip(clips[0]);
}

// ---------------------------------------------------------------------------
// 2030 — Kevin Nexus coexistence workspace
// ---------------------------------------------------------------------------
let y2030Initialized = false;
let activeMission = null;
let nexusTimers = [];
function clearNexusTimers() { nexusTimers.forEach(clearTimeout); nexusTimers = []; }
function nexusLog(message) { const log = document.querySelector('[data-nexus-log]'); const p = document.createElement('p'); p.textContent = `> ${message}`; log.append(p); log.scrollTop = log.scrollHeight; }
function missionFromObjective(objective) {
  const q = objective.toLowerCase();
  if (/context|session|handoff|memory|agent/.test(q)) return data.timelineContent['2030'].missions.find((mission)=>mission.id==='session-memory');
  if (/interface|timeline|portfolio|era/.test(q)) return data.timelineContent['2030'].missions.find((mission)=>mission.id==='interface-time');
  return data.timelineContent['2030'].missions.find((mission)=>mission.id==='product-plan');
}
function renderNexusPlan(mission, objective) {
  const projectRecords = mission.projects.map(projectBySlug).filter(Boolean);
  const plan = document.querySelector('[data-nexus-plan]');
  plan.innerHTML = `<ol><li><b>Frame together</b><span>Kevin defines intent, constraints, success evidence, and the decision he remains accountable for.</span></li><li><b>Retrieve</b><span>AI mounts ${projectRecords.map((project)=>project.title).join(' and ')} as verified precedent and labels uncertainty.</span></li><li><b>Co-create</b><span>Human context and machine synthesis produce a small reversible plan.</span></li><li><b>Govern</b><span>Both sides inspect assumptions, evidence, permissions, risk, and the human authority boundary.</span></li><li><b>Preserve</b><span>The collaboration stores decisions, receipts, and a continuation packet for the next session.</span></li></ol><div class="nexus-evidence"><p class="eyebrow">Relevant evidence</p>${projectRecords.map((project)=>`<button type="button" data-project-slug="${escapeHtml(project.slug)}"><b>${escapeHtml(project.title)}</b><span>${escapeHtml(project.summary)}</span></button>`).join('')}</div><p class="nexus-objective"><b>Shared objective:</b> ${escapeHtml(objective)}</p>`;
  plan.querySelectorAll('[data-project-slug]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.projectSlug)));
}
function runNexusMission(objective) {
  clearNexusTimers();
  activeMission = missionFromObjective(objective);
  document.querySelector('[data-nexus-output-title]').textContent = activeMission.label;
  document.querySelector('[data-nexus-log]').innerHTML = '';
  document.querySelector('[data-nexus-plan]').innerHTML = '<p>Human and AI collaborators are working...</p>';
  document.querySelector('[data-nexus-gate-state]').textContent = 'PROCESSING';
  document.querySelector('[data-nexus-gate-copy]').textContent = 'The collaborators are preparing a plan and checking where human judgment is required.';
  document.querySelector('[data-nexus-approve]').disabled = true; document.querySelector('[data-nexus-revise]').disabled = true;
  const agents = [...document.querySelectorAll('[data-nexus-agent]')];
  agents.forEach((agent)=>{ agent.classList.remove('is-active','is-complete'); agent.querySelector('small').textContent='IDLE'; });
  const delay = reducedMotion() ? 60 : 620;
  agents.forEach((agent,index) => {
    nexusTimers.push(setTimeout(() => {
      agents.forEach((item)=>item.classList.remove('is-active'));
      agent.classList.add('is-active'); agent.querySelector('small').textContent='RUNNING';
      nexusLog(`${agent.querySelector('b').textContent} joined the shared objective.`); beep('click');
      if (index > 0) { agents[index-1].classList.add('is-complete'); agents[index-1].querySelector('small').textContent='COMPLETE'; }
      if (index === agents.length-1) {
        nexusTimers.push(setTimeout(() => {
          agent.classList.remove('is-active'); agent.classList.add('is-complete'); agent.querySelector('small').textContent='COMPLETE';
          nexusLog('Shared evidence packet ready. Human decision gate reached.');
          renderNexusPlan(activeMission, objective);
          document.querySelector('[data-nexus-gate-state]').textContent='REVIEW REQUIRED';
          document.querySelector('[data-nexus-gate-copy]').textContent='This next step changes scope and public commitments. Human approval is required.';
          document.querySelector('[data-nexus-approve]').disabled=false; document.querySelector('[data-nexus-revise]').disabled=false;
          state.y2030.completed += 1; saveState(); beep('success');
        }, delay));
      }
    }, delay * index));
  });
}
function init2030() {
  if (y2030Initialized) return;
  y2030Initialized = true;
  const form = document.querySelector('[data-nexus-form]');
  document.querySelectorAll('[data-nexus-preset]').forEach((button) => button.addEventListener('click', () => { const mission = data.timelineContent['2030'].missions.find((item)=>item.id===button.dataset.nexusPreset); form.elements.objective.value = mission.objective; form.elements.objective.focus(); }));
  form.addEventListener('submit', (event) => { event.preventDefault(); const objective = form.elements.objective.value.trim(); if (!objective) return; runNexusMission(objective); });
  document.querySelector('[data-nexus-autonomy]')?.addEventListener('input', (event) => { event.target.nextElementSibling.textContent = `${event.target.value} / 5`; });
  document.querySelector('[data-nexus-approve]')?.addEventListener('click', () => { state.y2030.approvals += 1; saveState(); document.querySelector('[data-nexus-gate-state]').textContent='APPROVED'; document.querySelector('[data-nexus-gate-copy]').textContent='Human approval recorded. The AI Archivist preserved the decision and evidence receipt without assuming authority.'; beep('success'); toast('The human-owned decision was approved.'); });
  document.querySelector('[data-nexus-revise]')?.addEventListener('click', () => { document.querySelector('[data-nexus-gate-state]').textContent='REVISION REQUESTED'; document.querySelector('[data-nexus-gate-copy]').textContent='The team will narrow scope, reduce irreversible automation, and return with a smaller experiment.'; nexusLog('Human requested a smaller reversible first step.'); beep('message'); });
  document.querySelector('[data-nexus-command-form]')?.addEventListener('submit', (event) => {
    event.preventDefault(); const command = event.currentTarget.elements.command.value.trim().toLowerCase();
    if (/future|echo|handoff|2040/.test(command)) { const hidden = document.querySelector('[data-nexus-hidden-agent]'); hidden.hidden=false; hidden.classList.add('is-visible'); discoverArtifact('agent-memory'); nexusLog('Unknown agent ECHO mounted a future-dated handoff packet.'); }
    else if (/help/.test(command)) toast('Try “reveal future handoff” or start one of the prepared collaborations.');
    else toast('Command routed to the shared objective console.');
    event.currentTarget.reset();
  });
  const start = performance.now();
  const updateClock = () => { const elapsed = Math.floor((performance.now()-start)/1000); const h=String(Math.floor(elapsed/3600)).padStart(2,'0'); const m=String(Math.floor(elapsed%3600/60)).padStart(2,'0'); const s=String(elapsed%60).padStart(2,'0'); document.querySelector('[data-nexus-clock]').textContent=`${h}:${m}:${s}`; };
  updateClock(); setInterval(updateClock, 1000);
}

// ---------------------------------------------------------------------------
// 2040 — Kevin Echo
// ---------------------------------------------------------------------------
let y2040Initialized = false;
let echoClicks = 0;
function echoActions(promptId) {
  const actions = {
    shaped: '<a href="/experience/1990/">Open 1990</a><a href="/experience/2000/">Open 2000</a>',
    build: '<button type="button" data-project-slug="kevinception">Open Kevinception</button><button type="button" data-project-slug="tokenpak">Open TokenPak</button>',
    real: '<a href="/about/">View source biography</a><a href="/contact/">Contact the living Kevin</a>',
    beginning: '<a href="/experience/1990/">Return to Channel 3</a>',
    memory: '<button type="button" data-echo-memory="1990">Curiosity</button><button type="button" data-echo-memory="2000">Connection</button><button type="button" data-echo-memory="2020">Creation</button>'
  };
  return actions[promptId] || '<a href="/work/">Inspect verified work</a>';
}
function inferEchoPrompt(text) {
  const q = text.toLowerCase();
  if (/real|really kevin|conscious/.test(q)) return 'real';
  if (/human|remain/.test(q)) return 'human';
  if (/build|work|project/.test(q)) return 'build';
  if (/believe|technology|philosophy/.test(q)) return 'believe';
  if (/memory|remember/.test(q)) return 'memory';
  if (/begin|1990|start/.test(q)) return 'beginning';
  return 'shaped';
}
function respondEcho(promptId) {
  const response = data.timelineContent['2040'].responses[promptId] || data.timelineContent['2040'].responses.shaped;
  lastEchoResponse = response;
  const node = document.querySelector('[data-echo-response]');
  node.innerHTML = `<p class="eyebrow">Translated signal · ${escapeHtml(promptId)}</p><p>${escapeHtml(response)}</p><div>${echoActions(promptId)}</div>`;
  node.querySelectorAll('[data-project-slug]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.projectSlug)));
  node.querySelectorAll('[data-echo-memory]').forEach((button) => button.addEventListener('click', () => selectEchoMemory(button.dataset.echoMemory)));
  root.classList.remove('is-echo-speaking'); requestAnimationFrame(()=>root.classList.add('is-echo-speaking'));
  if (!state.y2040.prompts.includes(promptId)) state.y2040.prompts.push(promptId);
  state.y2040.resonance = Math.min(100, state.y2040.prompts.length * 14 + state.artifacts.length * 4);
  document.querySelector('[data-echo-resonance]').textContent = `RESONANCE ${state.y2040.resonance}%`;
  saveState(); beep('message'); track('echo_prompt_interpreted',{prompt:promptId});
  if (promptId === 'real') discoverArtifact('echo-shard');
}
function selectEchoMemory(year) {
  const memories = {
    '1990': 'Curiosity: the first responsive screen. A channel changed, a character moved, and technology became a world with rules worth exploring.',
    '2000': 'Connection: the first online identity. Dial-up transformed a computer in one room into an entrance to people, scripts, pages, and communities.',
    '2010': 'Commerce: the storefront promise became an operating system of orders, catalog data, inventory, fulfillment, marketplaces, and enterprise workflows.',
    '2020': 'Creation: the compressed story. Everyone gained publishing tools while AI began to move from specialist technology to collaborator.',
    '2030': 'Coexistence: people and AI collaborators share objectives, context, and evidence while humans retain responsibility for consequential judgment.',
    '2040': 'Continuity: the persistent echo. The archive can preserve patterns and evidence, but it must remain honest about what it cannot preserve.'
  };
  lastEchoResponse = memories[year];
  const node = document.querySelector('[data-echo-response]'); node.innerHTML = `<p class="eyebrow">Memory shard · ${year}</p><p>${escapeHtml(memories[year])}</p><div><a href="/experience/${year}/">Open ${year}</a></div>`;
  root.classList.remove('is-echo-speaking'); requestAnimationFrame(()=>root.classList.add('is-echo-speaking')); beep('discover');
}
function init2040() {
  if (y2040Initialized) return;
  y2040Initialized = true;
  document.querySelector('[data-echo-resonance]').textContent = `RESONANCE ${state.y2040.resonance || 0}%`;
  document.querySelectorAll('[data-echo-prompt]').forEach((button) => button.addEventListener('click', () => respondEcho(button.dataset.echoPrompt)));
  document.querySelector('[data-echo-form]')?.addEventListener('submit', (event) => { event.preventDefault(); const text=event.currentTarget.elements.thought.value.trim(); if (!text) return; respondEcho(inferEchoPrompt(text)); event.currentTarget.reset(); });
  document.querySelectorAll('[data-echo-memory]').forEach((button) => button.addEventListener('click', () => selectEchoMemory(button.dataset.echoMemory)));
  document.querySelector('[data-echo-hologram]')?.addEventListener('click', () => { echoClicks += 1; root.classList.toggle('is-echo-speaking'); beep('click'); if (echoClicks >= 6) discoverArtifact('echo-shard'); });
  document.querySelector('[data-echo-speak]')?.addEventListener('click', () => {
    if (!lastEchoResponse) { toast('Interpret a thought first.'); return; }
    if (!soundEnabled) { toast('Enable sound in the timeline bar before using voice synthesis.'); return; }
    if (!('speechSynthesis' in window)) { toast('Voice synthesis is unavailable in this browser.'); return; }
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(lastEchoResponse); utterance.rate=.88; utterance.pitch=.78; speechSynthesis.speak(utterance);
  });
}

// ---------------------------------------------------------------------------
// Shared event wiring
// ---------------------------------------------------------------------------
document.querySelector('[data-era-enter]')?.addEventListener('click', enterWorld);
document.querySelectorAll('[data-era-guide-toggle]').forEach((button) => button.addEventListener('click', () => { guide.hidden = false; guide.querySelector('input')?.focus(); beep('click'); }));
document.querySelector('[data-era-guide-close]')?.addEventListener('click', () => { guide.hidden = true; });
document.querySelectorAll('[data-era-timeline-toggle]').forEach((button) => button.addEventListener('click', () => openDialog(timelineDialog)));
document.querySelector('[data-era-sound-toggle]')?.addEventListener('click', async (event) => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled)); event.currentTarget.textContent = `Sound: ${soundEnabled ? 'on' : 'off'}`;
  document.documentElement.dataset.sound = soundEnabled ? 'on' : 'off';
  if (soundEnabled) { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); await audioContext.resume?.(); beep('success'); }
});
document.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('[data-project-slug]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.projectSlug)));
document.querySelectorAll('[data-discover-artifact]').forEach((button) => button.addEventListener('click', () => discoverArtifact(button.dataset.discoverArtifact)));
document.querySelectorAll('[data-guide-question]').forEach((button) => button.addEventListener('click', () => answerGuide(findFaq(button.dataset.guideQuestion))));
document.querySelector('[data-guide-form]')?.addEventListener('submit', (event) => { event.preventDefault(); const question = event.currentTarget.elements.question.value.trim(); if (!question) return; answerGuide(findFaq(question)); });
document.addEventListener('click', (event) => { const action = event.target.closest('[data-guide-action]'); if (action) runGuideAction(action); });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (timelineDialog?.open) closeDialog(timelineDialog);
    else if (projectDialog?.open) closeDialog(projectDialog);
    else if (!guide.hidden) guide.hidden = true;
    else if (eraId === '1990' && game?.running) { game.paused = !game.paused; drawGame(); }
  }
  if (eraId !== '1990' || event.target.matches('input,textarea,select')) return;
  const map = { ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',z:'a',Z:'a',' ':'a',x:'b',X:'b',Shift:'b',Enter:'start' };
  const input = map[event.key]; if (input) { event.preventDefault(); handleGameInput(input); }
});

updateArtifactCount();
track('era_page_loaded', { era: eraId, year: data.era.anchorYear });
