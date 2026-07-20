// @ts-nocheck
import { toast, track } from './global.js';

const root = document.querySelector('[data-xennial-root]');
const dataNode = document.querySelector('#xennial-data');
const data = JSON.parse(dataNode?.textContent || '{}');
const legacy = data.legacy || {};
const knowledgeBase = data.knowledgeBase || { faqs: [] };
const monitor = document.querySelector('[data-crt-monitor]');
const screen = document.querySelector('[data-desktop]');
const bootScreen = document.querySelector('[data-boot-screen]');
const dialer = document.querySelector('[data-dialer]');
const dialerState = document.querySelector('[data-dialer-state]');
const dialerMessage = document.querySelector('[data-dialer-message]');
const signonPanel = document.querySelector('[data-signon-panel]');
const connectionPanel = document.querySelector('[data-connection-panel]');
const signonName = document.querySelector('[data-signon-name]');
const signonLocation = document.querySelector('[data-signon-location]');
const signonSound = document.querySelector('[data-signon-sound]');
const signonRemember = document.querySelector('[data-signon-remember]');
const connectDetail = document.querySelector('[data-connect-detail]');
const connectProgress = document.querySelector('[data-connect-progress]');
const connectSteps = [...document.querySelectorAll('[data-connect-step]')];
const desktopSurface = document.querySelector('[data-desktop-surface]');
const windowLayer = document.querySelector('[data-window-layer]');
const kolWindow = document.querySelector('[data-kol-window]');
const kolContent = document.querySelector('[data-kol-content]');
const kolTitle = document.querySelector('[data-kol-title]');
const kolStatus = document.querySelector('[data-kol-status]');
const keywordInput = document.querySelector('[data-keyword-input]');
const buddyWindow = document.querySelector('[data-buddy-window]');
const buddyContent = document.querySelector('[data-buddy-content]');
const taskList = document.querySelector('[data-task-list]');
const taskKol = document.querySelector('[data-task-kol]');
const startButton = document.querySelector('[data-start-button]');
const startMenu = document.querySelector('[data-start-menu]');
const helpDialog = document.querySelector('[data-xennial-help-dialog]');
const shutdownDialog = document.querySelector('[data-shutdown-dialog]');
const fatalError = document.querySelector('[data-fatal-error]');
const screensaver = document.querySelector('[data-screensaver]');
const offMessage = document.querySelector('[data-off-message]');
const clock = document.querySelector('[data-kos-clock]');
const dateNode = document.querySelector('[data-kos-date]');

const windows = new Map();
let activeWindowId = 'kol';
let zIndex = 30;
let cascade = 0;
let currentKolPage = 'welcome';
let selectedBuddy = 'future-kevin';
let soundEnabled = safeGet('kevinception:sound') === 'on';
let audioContext = null;
let dialerTimers = [];
let connectionComplete = false;
let monitorOn = true;
let brightness = 1;
let keyBuffer = '';
let logoClicks = 0;
let idleTimer = null;
let buddyLoaded = false;
let konamiIndex = 0;
let mailRead = loadStringSet('kevinception:mail-read');
let deletedMail = loadStringSet('kevinception:deleted-mail');
let currentMailFolder = 'new';
let activeScreenName = sessionGet('kevinception:screen-name') || safeGet('kevinception:screen-name') || 'KevinY2K';
let webHistory = ['home'];
let webHistoryIndex = 0;
let currentWebPage = 'home';
let xangaState = loadXangaState();
let xangaSearchQuery = '';
let connectionStartedAt = Date.now();

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
const memoryCopy = {
  dialup: ['The First Connection', 'The screech of the modem was not noise. It was anticipation—the audible moment before another world became reachable.'],
  dsl: ['Broadband Tomorrow', 'The future always arrived first as a banner advertisement promising that everything would soon be faster.'],
  cdrom: ['Free Hours Forever', 'A generation measured access in free hours and received the same software disc often enough to tile a room.'],
  trash: ['Deleted, Not Forgotten', 'Old experiments rarely disappear. They become fragments, instincts, and reusable patterns.'],
  buddy: ['A Message From 2040', 'Identity travels through interfaces. The future recognizes the same builder behind a different screen name.'],
  clock: ['Time Is an Interface', 'The system says July 12, 2000. The visitor knows better. Both dates can be true inside Kevinception.'],
  keyboard: ['The Author in the System', 'Type the creator’s name and the system answers. The portfolio is not separate from its author; it is one of his systems.'],
  degauss: ['Reality Wobbles', 'A CRT can briefly bend the picture back into alignment. Some projects need the same decisive reset.'],
  konami: ['Player One', 'Curiosity is a control scheme. People who test the edges discover more of the world.'],
  logo: ['Layers Within Layers', 'A logo can be a button, a portal, a clue, and a signature at the same time.'],
  future: ['Keyword: Future', 'The year 2000 imagined the internet. The year 2040 will interpret what we build now as recovered history.'],
  xanga: ['The Weblog Before the Feed', 'Before every thought became a feed item, a personal page could be a diary, a room, a guestbook, and a handmade identity all at once.'],
  shutdown: ['It Is Now Safe', 'Ending one session does not erase the memory. It prepares the system to begin another layer.']
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }

function loadStringSet(key) {
  try {
    const value = JSON.parse(safeGet(key) || '[]');
    return new Set(Array.isArray(value) ? value.map(String) : []);
  } catch { return new Set(); }
}
function safeSet(key, value) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } }
function markTemporalSignal2000() {
  try {
    const key = 'kevinception:v6:temporal-signal';
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    const years = Array.isArray(parsed) ? parsed : [];
    if (!years.includes('2000')) years.push('2000');
    localStorage.setItem(key, JSON.stringify(years));
  } catch { /* optional cross-era state */ }
}
function imHistoryKey(buddyId) { return `kevinception:im-history:${buddyId}`; }
function loadImHistory(buddyId) {
  try {
    const parsed = JSON.parse(safeGet(imHistoryKey(buddyId)) || '[]');
    return Array.isArray(parsed) ? parsed.slice(-30) : [];
  } catch { return []; }
}
function saveImMessage(buddyId, speaker, text) {
  const history = loadImHistory(buddyId);
  history.push({ speaker: String(speaker), text: String(text), at: Date.now() });
  safeSet(imHistoryKey(buddyId), JSON.stringify(history.slice(-30)));
}
function buddyGreeting(buddy) {
  if (buddy.id === 'future-kevin') return 'I found this screen in the archive. Ask me about Kevin, the future, or any project.';
  if (buddy.id === 'ascii-kid') return 'h3y!! ask me how kevin got started or what he likes to build.';
  if (buddy.id === 'away-forever') return 'away message: turning a complicated idea into a diagram. leave a question anyway.';
  return 'offline message queue ready. ask about Kevin’s work and I’ll answer when the carrier returns.';
}
function renderImTranscript(buddy) {
  const history = loadImHistory(buddy.id);
  const messages = history.length ? history : [{ speaker: buddy.name, text: buddyGreeting(buddy) }];
  return messages.map((item) => `<p><b>${escapeHtml(item.speaker)}:</b> ${escapeHtml(item.text)}</p>`).join('');
}
function sessionGet(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function sessionSet(key, value) { try { sessionStorage.setItem(key, value); } catch { /* storage unavailable */ } }
function loadXangaState() {
  const fallback = { subscribed:false, skin:'classic', eprops:{}, comments:{} };
  try {
    const parsed = JSON.parse(safeGet('kevinception:xanga-state') || '{}');
    return {
      subscribed: Boolean(parsed.subscribed),
      skin: ['classic','midnight','glitter'].includes(parsed.skin) ? parsed.skin : 'classic',
      eprops: parsed.eprops && typeof parsed.eprops === 'object' ? parsed.eprops : {},
      comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {}
    };
  } catch { return fallback; }
}
function saveXangaState() { safeSet('kevinception:xanga-state', JSON.stringify(xangaState)); }
function getScreenName() { return activeScreenName || signonName?.value || 'KevinY2K'; }
function isMobile() { return matchMedia('(max-width:780px)').matches; }
function reducedMotion() { return document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion:reduce)').matches; }
function getFragments() {
  try {
    const parsed = JSON.parse(safeGet('kevinception:memory-fragments') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function saveFragments(items) { safeSet('kevinception:memory-fragments', JSON.stringify(items)); }
function clearDialerTimers() { dialerTimers.forEach(clearTimeout); dialerTimers = []; }
function later(fn, delay) { const timer = setTimeout(fn, delay); dialerTimers.push(timer); return timer; }
function setStatus(message) { if (kolStatus) kolStatus.textContent = message; }

function discover(id, source = 'unknown') {
  if (!memoryCopy[id]) return;
  if (id === 'dialup' || id === 'future' || id === 'xanga') markTemporalSignal2000();
  const items = getFragments();
  const fresh = !items.includes(id);
  if (fresh) {
    items.push(id);
    saveFragments(items);
    playSound('discover');
    toast(`${memoryCopy[id][0]} discovered.`);
    track('easter_egg_discovered', { era:'2000', fragment:id, source });
  } else {
    playSound('click');
    toast(`${memoryCopy[id][0]} is already in the archive.`);
  }
  if (currentKolPage === 'memory') renderKolPage('memory', { focus:false });
  refreshAuxMemory();
}

async function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') await audioContext.resume();
  return audioContext;
}
function oscillatorTone(frequency, duration=.08, type='square', volume=.025, delay=0) {
  if (!soundEnabled || !audioContext) return;
  const now = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now+.01);
  gain.gain.exponentialRampToValueAtTime(.0001, now+duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now+duration+.02);
}
function dualTone(frequencyA,frequencyB,duration=.12,volume=.015,delay=0) {
  if(!soundEnabled||!audioContext)return;
  const now=audioContext.currentTime+delay;
  const gain=audioContext.createGain();
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  [frequencyA,frequencyB].forEach((frequency)=>{const oscillator=audioContext.createOscillator();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,now);oscillator.connect(gain);oscillator.start(now);oscillator.stop(now+duration+.02);});
  gain.connect(audioContext.destination);
}
function noiseBurst(duration=.14, volume=.018, delay=0) {
  if (!soundEnabled || !audioContext) return;
  const rate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, Math.max(1, rate*duration), rate);
  const channel = buffer.getChannelData(0);
  for (let i=0;i<channel.length;i+=1) channel[i] = Math.random()*2-1;
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = 1600;
  filter.Q.value = .7;
  const now = audioContext.currentTime + delay;
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(volume,now+.01);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(audioContext.destination);
  source.start(now);
}
function playSound(kind='click') {
  if (!soundEnabled || !audioContext) return;
  if (kind === 'click') oscillatorTone(520,.055,'square',.018);
  if (kind === 'open') { oscillatorTone(620,.07,'square',.02); oscillatorTone(780,.07,'square',.018,.07); }
  if (kind === 'close') { oscillatorTone(420,.06,'square',.018); oscillatorTone(260,.09,'square',.018,.055); }
  if (kind === 'discover') { oscillatorTone(760,.11,'sine',.03); oscillatorTone(1020,.15,'sine',.025,.08); oscillatorTone(1320,.18,'sine',.02,.18); }
  if (kind === 'mail') { oscillatorTone(660,.1,'sine',.03); oscillatorTone(880,.13,'sine',.028,.1); }
  if (kind === 'buddy') { oscillatorTone(310,.07,'square',.018); oscillatorTone(470,.08,'square',.018,.08); oscillatorTone(650,.1,'square',.018,.16); }
  if (kind === 'startup') { oscillatorTone(392,.2,'sine',.025); oscillatorTone(523,.28,'sine',.025,.13); oscillatorTone(659,.34,'sine',.022,.28); }
  if (kind === 'shutdown') { oscillatorTone(659,.18,'sine',.022); oscillatorTone(523,.22,'sine',.022,.14); oscillatorTone(392,.28,'sine',.02,.3); }
}
function playDialupSound() {
  if(!soundEnabled||!audioContext)return;
  const dtmf={0:[941,1336],1:[697,1209],2:[697,1336],3:[697,1477],4:[770,1209],5:[770,1336],6:[770,1477],7:[852,1209],8:[852,1336],9:[852,1477]};
  const number='5550192000';
  oscillatorTone(440,.55,'sine',.009,0);
  number.split('').forEach((digit,index)=>{const pair=dtmf[digit];dualTone(pair[0],pair[1],.11,.011,.7+index*.15);});
  oscillatorTone(2100,.28,'sine',.015,2.35);
  oscillatorTone(1200,.2,'square',.012,2.62);
  noiseBurst(.75,.017,2.8);
  for(let i=0;i<20;i+=1){oscillatorTone(700+(i%7)*180,.04,i%2?'square':'sine',.008,3.1+i*.055);}
  noiseBurst(.6,.012,3.65);
  oscillatorTone(1800,.16,'sine',.012,4.15);
  oscillatorTone(900,.12,'square',.009,4.34);
}
function speak(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = .92;
    utterance.pitch = 1.04;
    utterance.volume = .75;
    speechSynthesis.speak(utterance);
  } catch { /* speech unavailable */ }
}
function syncSoundControls() {
  document.querySelectorAll('[data-sound-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(soundEnabled));
    if (button.closest('.experience-utility')) button.textContent = `Sound: ${soundEnabled ? 'on' : 'off'}`;
    else button.setAttribute('aria-label', `Turn sound ${soundEnabled ? 'off' : 'on'}`);
  });
  document.documentElement.dataset.sound = soundEnabled ? 'on' : 'off';
  if (signonSound) signonSound.checked = soundEnabled;
}
async function setSound(enabled) {
  soundEnabled = enabled;
  if (soundEnabled) await ensureAudio();
  safeSet('kevinception:sound', soundEnabled ? 'on' : 'off');
  syncSoundControls();
  if (enabled) playSound('startup');
  track('sound_toggled',{enabled:soundEnabled});
}
async function toggleSound() { await setSound(!soundEnabled); }

function kolPageHeader(title, subtitle='Kevin Online · Member Services') {
  return `<header class="kol-page__header"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="kol-wordmark-button" type="button" data-kol-logo aria-label="Kevin Online logo. There may be more here."><img src="/legacy/assets/xennial/kol-logo.svg" alt=""></button></header>`;
}
function renderWelcome() {
  const welcome = legacy.welcome || {};
  const screenName = getScreenName();
  return `<article class="kol-page kol-page--welcome aol-welcome">
    ${kolPageHeader(welcome.heading || 'Welcome to Kevin Online!','Version 5.0 · Member Services · 07.12.2000')}
    <div class="aol-flashbar"><b>WELCOME, ${escapeHtml(screenName).toUpperCase()}</b><span>KEYWORD: KEVIN</span><span>Member Services</span></div>
    <div class="aol-welcome-body">
      <section class="aol-welcome-main">
        <div class="aol-mail-alert"><span class="aol-mailbox" aria-hidden="true"></span><div><b>You Have Mail!</b><p>3 new messages are waiting in your K-Mail Center.</p></div><button class="aol-button" type="button" data-open-kol-page="mail">Read Mail</button></div>
        <div class="aol-feature-banner">
          <div><strong>${escapeHtml(welcome.announcement || '')}</strong><p>${escapeHtml(welcome.cdCopy || '')}</p></div>
          <div class="aol-free-hours"><span>1,000</span><b>FREE HOURS</b><small>included!</small></div>
        </div>
        <h3 class="aol-section-title">Today on Kevin Online</h3>
        <div class="aol-channel-grid">
          <button type="button" data-open-kol-page="projects"><span class="channel-art channel-art--files">📁</span><b>My Files</b><small>Projects and case studies</small></button>
          <button type="button" data-open-kol-page="resume"><span class="channel-art channel-art--career">▤</span><b>Career Center</b><small>Resume and experience</small></button>
          <button type="button" data-open-xanga><span class="channel-art channel-art--xanga">x</span><b>Kevin’s Xanga</b><small>Weblog, eProps, comments</small></button>
          <button type="button" data-open-kol-page="channels"><span class="channel-art channel-art--channels">◉</span><b>Channels</b><small>Browse by interest</small></button>
          <button type="button" data-menu-action="buddies"><span class="channel-art channel-art--people">☺</span><b>People Connection</b><small>Buddy List and IM</small></button>
          <button type="button" data-open-kol-page="www"><span class="channel-art channel-art--internet">◎</span><b>Internet</b><small>Explore the World Wide Web</small></button>
        </div>
      </section>
      <aside class="aol-welcome-sidebar">
        <section><h3>Welcome, ${escapeHtml(screenName)}</h3><p><b>Connection:</b> 52,000 bps</p><p><b>Time online:</b> <span data-time-online>00:00</span></p><p><b>Status:</b> Available</p></section>
        <section><h3>My Shortcuts</h3><button data-open-kol-page="about">My KOL Profile</button><button data-open-kol-page="favorites">Favorite Places</button><button data-open-kol-page="news">Kevin Online Today</button><button data-open-kol-page="memory">Memory Archive</button></section>
        <section class="aol-upgrade"><b>Tired of slow dial-up?</b><p>Ask about KOL DSL and join the broadband future.</p><button class="aol-button" type="button" data-dsl-ad>FREE Upgrade</button></section>
        <a href="/portfolio/" class="aol-exit-link">Open Portfolio Mode</a>
      </aside>
    </div>
  </article>`;
}

const mailMessages = [
  { id:'welcome', folder:'new', from:'Kevin Online', subject:'Welcome! Your 1,000 FREE hours are ready', date:'7/12/00', body:'Thanks for trying Kevin Online. We have included enough free hours to remain connected until at least the next timeline.' },
  { id:'origin', folder:'new', from:'KevinY2K', subject:'Why this place exists', date:'7/12/00', body:legacy.intro?.lead || data.profile?.origin || '' },
  { id:'future', folder:'new', from:'FutureKevin2040', subject:'DO NOT DELETE — recovered message', date:'7/12/55', body:'The interfaces changed. The instinct did not. Keep building systems that make ambitious ideas practical. Keyword: FUTURE.' },
  { id:'cdrom', folder:'old', from:'KOL Member Services', subject:'Your new CD-ROM is in the mail (again)', date:'6/30/00', body:'Another Kevin Online CD-ROM is on the way. Please use duplicates as coasters, paper weights, or emergency reflective surfaces.' },
  { id:'deleted', folder:'deleted', from:'Unknown Sender', subject:'This message was deleted in another timeline', date:'1/1/00', body:'Deletion is only a user-interface decision. Memory persists elsewhere.' }
];
function getSentMail() {
  try { const value=JSON.parse(safeGet('kevinception:sent-mail')||'[]'); return Array.isArray(value)?value:[]; } catch { return []; }
}
function mailMessagesForFolder(folder) {
  if(folder==='sent') return getSentMail();
  if(folder==='deleted') return mailMessages.filter((message)=>message.folder==='deleted' || deletedMail.has(message.id));
  return mailMessages.filter((message)=>message.folder===folder && !deletedMail.has(message.id));
}
function unreadMailCount() {
  return mailMessages.filter((message)=>message.folder==='new' && !deletedMail.has(message.id) && !mailRead.has(message.id)).length;
}
function updateMailBadge() {
  const badge=document.querySelector('[data-mail-count]');
  if(!badge)return;
  const count=unreadMailCount();
  badge.textContent=String(count);
  badge.hidden=count===0;
}
function renderMail(selectedId, folder=currentMailFolder) {
  currentMailFolder=folder;
  const folderMessages=mailMessagesForFolder(folder);
  const selected=folderMessages.find((message)=>message.id===selectedId) || folderMessages[0];
  const counts={new:unreadMailCount(),old:mailMessagesForFolder('old').length,sent:getSentMail().length,deleted:mailMessagesForFolder('deleted').length};
  const canDelete=Boolean(selected && folder!=='deleted' && folder!=='sent');
  const canRestore=Boolean(selected && folder==='deleted' && selected.folder!=='deleted');
  return `<article class="kol-page">
    ${kolPageHeader('K-Mail','You’ve got mail!')}
    <div class="kmail-commandbar"><button class="aol-button" type="button" data-open-kol-page="write">Write</button><button class="aol-button" type="button" data-mail-reply ${selected?'':'disabled'}>Reply</button><button class="aol-button" type="button" data-mail-forward ${selected?'':'disabled'}>Forward</button><button class="aol-button" type="button" data-mail-delete ${canDelete?'':'disabled'}>Delete</button>${canRestore?'<button class="aol-button" type="button" data-mail-restore>Restore</button>':''}</div>
    <div class="kmail-layout">
      <nav class="kmail-folders" aria-label="Mail folders">
        <button data-mail-folder="new" class="${folder==='new'?'is-active':''}">📥 New Mail (${counts.new})</button>
        <button data-mail-folder="old" class="${folder==='old'?'is-active':''}">📨 Old Mail (${counts.old})</button>
        <button data-mail-folder="sent" class="${folder==='sent'?'is-active':''}">📝 Sent Mail (${counts.sent})</button>
        <button data-mail-folder="deleted" class="${folder==='deleted'?'is-active':''}">🗑 Deleted Mail (${counts.deleted})</button>
      </nav>
      <div class="kmail-inbox">
        <table class="kmail-list"><thead><tr><th>From</th><th>Subject</th><th>Date</th></tr></thead><tbody>${folderMessages.length?folderMessages.map((message)=>`<tr tabindex="0" data-mail-message="${escapeHtml(message.id)}" class="${mailRead.has(message.id)?'':'is-unread'}"><td>${escapeHtml(message.from||message.to||'KevinY2K')}</td><td>${escapeHtml(message.subject)}</td><td>${escapeHtml(message.date)}</td></tr>`).join(''):'<tr><td colspan="3">This folder is empty.</td></tr>'}</tbody></table>
        <section class="kmail-message" data-mail-preview data-mail-selected="${escapeHtml(selected?.id||'')}">${selected?`<p><b>${folder==='sent'?'To':'From'}:</b> ${escapeHtml(folder==='sent'?selected.to:selected.from)}</p><p><b>Subject:</b> ${escapeHtml(selected.subject)}</p><hr><p>${escapeHtml(selected.body)}</p>${selected.id==='future'?'<button class="aol-button" type="button" data-keyword-value="future">Follow the recovered keyword</button>':''}`:'<p>Select a message to read it.</p>'}</section>
      </div>
    </div>
  </article>`;
}
function renderWriteMail(prefill={}) {
  return `<article class="kol-page">
    ${kolPageHeader('Write Mail','Compose a new K-Mail message')}
    <form class="kmail-compose-page" data-kmail-compose-form>
      <label>To:<input name="to" required value="${escapeHtml(prefill.to||'')}"></label>
      <label>Subject:<input name="subject" required value="${escapeHtml(prefill.subject||'')}"></label>
      <label class="kmail-compose-body">Message:<textarea name="body" required rows="12">${escapeHtml(prefill.body||'')}</textarea></label>
      <div><button class="aol-button aol-button--primary" type="submit">Send Now</button> <button class="aol-button" type="button" data-open-kol-page="mail">Cancel</button></div>
      <p><small>This simulated mailbox stores sent messages only in this browser.</small></p>
    </form>
  </article>`;
}
function renderResume() {
  const entries = data.experienceItems || [];
  return `<article class="kol-page">
    ${kolPageHeader('Resume','Resume.doc — Kevin Yang')}
    <div class="kol-resume">
      <h2>${escapeHtml(data.profile?.name || 'Kevin Yang')}</h2>
      <p class="resume-role">${escapeHtml(data.profile?.headline || '')}</p>
      <p>${(data.profile?.roles||[]).map((role)=>escapeHtml(role)).join(' · ')}</p>
      <hr><h3>Professional Experience</h3>
      ${entries.map((entry)=>`<section class="kol-resume-entry"><time>${escapeHtml(entry.period)}</time><div><h3>${escapeHtml(entry.title)}</h3><b>${escapeHtml(entry.organization)}</b><p>${escapeHtml(entry.summary)}</p><ul>${(entry.highlights||[]).map((item)=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></div></section>`).join('')}
      <p><a href="/resume/">Open the canonical printable resume →</a></p>
    </div>
  </article>`;
}
function renderProjects() {
  return `<article class="kol-page">
    ${kolPageHeader('Projects','My Documents > Kevin > Projects')}
    <div class="project-files">${(data.projects||[]).map((project)=>`<section class="project-file"><span class="project-file__icon">ZIP</span><div><h3>${escapeHtml(project.xennialName)}</h3><p><b>${escapeHtml(project.title)}</b></p><p>${escapeHtml(project.summary)}</p><small>${(project.disciplines||[]).map(escapeHtml).join(' · ')}${project.draft?' · CONTENT DRAFT':''}</small></div><a href="/work/${encodeURIComponent(project.slug)}/">Open →</a></section>`).join('')}</div>
  </article>`;
}
function renderAbout() {
  const intro = legacy.intro || {};
  return `<article class="kol-page">
    ${kolPageHeader('About Kevin','Member Profile: KevinY2K')}
    <div class="about-page">
      <div class="about-profile"><div class="about-avatar">KY</div><div><h2>Kevin Yang</h2><p><b>Status:</b> Online and building.</p><p>${escapeHtml(intro.lead || data.profile?.origin || '')}</p><p>${escapeHtml(intro.bridge || '')}</p></div></div>
      <h3>Current focus</h3><p>${escapeHtml(data.profile?.currentFocus || '')}</p>
      <h3>Favorite activities</h3><p>Strategy · technology · product design · automation · systems thinking · workflow optimization · inventing useful things.</p>
      <h3>Chatroom scroller archive</h3><pre class="ascii-art" aria-label="ASCII art Kevin Online logo">  __ __ _______   _______  __  __   _      _ _   _ ______\n |  |  |   ____| |  ____| |  \\|  | | |    | | \\ | |  ____|\n |  |_/|  |__    | |__    |   \\  | | |    | |  \\| | |__\n |   _ |   __|   |  __|   | |\\   | | |    | | . ' |  __|\n |  | \\|  |____ | |____  | | \\  | | |____| | |\\  | |____\n |__|  |_______| |_______| |_|  \\_| |______|_|_| \\_|______|\n             K E V I N   O N L I N E</pre>
      <blockquote>“${escapeHtml(data.profile?.quote || '')}”</blockquote>
      <p><a href="/about/">Read the canonical About page →</a></p>
    </div>
  </article>`;
}
function webAddress(page) {
  const addresses={
    home:'http://www.kevinception.com/~kevin/',
    xanga:'http://www.xanga.com/KevinY2K',
    future:'keyword://future',
    favorites:'kevin://favorites'
  };
  return addresses[page] || `http://search.kevin/?q=${encodeURIComponent(page)}`;
}
function setWebHistory(page,{replace=false}={}) {
  currentWebPage=page;
  if(replace){webHistory[webHistoryIndex]=page;return;}
  if(webHistory[webHistoryIndex]===page)return;
  webHistory=webHistory.slice(0,webHistoryIndex+1);
  webHistory.push(page);
  webHistoryIndex=webHistory.length-1;
}
function renderXanga() {
  const xanga=legacy.xanga||{};
  const posts=xanga.posts||[];
  const skin=xangaState.skin||'classic';
  const query=xangaSearchQuery.trim().toLowerCase();
  const filteredPosts=query?posts.filter((post)=>[post.title,post.mood,post.currentlyPlaying,...(post.body||[])].join(' ').toLowerCase().includes(query)):posts;
  return `<div class="xanga-site xanga-skin--${escapeHtml(skin)}">
    <div class="xanga-networkbar"><a href="#" data-xanga-home>XANGA</a>: <a href="#" data-xanga-home>HOME</a> · <a href="#" data-xanga-subscriptions>SUBSCRIPTIONS</a> · <a href="#" data-xanga-blogrings>BLOGRINGS</a><span>${escapeHtml(xanga.screenName||'KevinY2K')} · <button type="button" data-xanga-subscribe>${xangaState.subscribed?'unsubscribe':'subscribe'}</button> · <button type="button" data-open-kol-page="welcome">sign out</button></span></div>
    <header class="xanga-brandbar"><img src="/legacy/assets/xennial/xanga-logo.svg" alt="xanga.com"><form class="xanga-search" data-xanga-search-form><label>search this xanga <input aria-label="Search Xanga" data-xanga-search-input name="query" value="${escapeHtml(xangaSearchQuery)}"></label><button type="submit">Go!</button></form></header>
    <div class="xanga-site-title"><h2>${escapeHtml(xanga.siteName||"KevinY2K's Xanga Site")}</h2><p>${escapeHtml(xanga.tagline||'')}</p></div>
    <div class="xanga-skin-picker" aria-label="Xanga skin picker"><b>look & feel:</b><button type="button" data-xanga-skin="classic">classic</button><button type="button" data-xanga-skin="midnight">midnight</button><button type="button" data-xanga-skin="glitter">glitter</button><span>fan-made in-world recreation</span></div>
    <div class="xanga-layout">
      <aside class="xanga-leftbar">
        <section class="xanga-module xanga-profile"><h3>about me</h3><div class="xanga-avatar">KY</div><b>${escapeHtml(xanga.profile?.name||'Kevin')}</b><p>${escapeHtml(xanga.profile?.status||'')}</p><dl><dt>location:</dt><dd>${escapeHtml(xanga.profile?.location||'')}</dd><dt>member since:</dt><dd>${escapeHtml(xanga.memberSince||'')}</dd></dl><p class="xanga-interests">${(xanga.profile?.interests||[]).map((item)=>`<a href="#">${escapeHtml(item)}</a>`).join(' · ')}</p></section>
        <section class="xanga-module"><h3>navigation</h3><button data-open-kol-page="about">profile</button><button data-open-kol-page="projects">projects</button><button data-open-kol-page="resume">resume</button><button data-menu-action="buddies">buddy list</button></section>
        <section class="xanga-module"><h3>sites i read</h3>${(xanga.subscriptions||[]).map((name)=>`<a href="#" data-xanga-fake-site="${escapeHtml(name)}">${escapeHtml(name)}</a>`).join('')}</section>
      </aside>
      <main class="xanga-weblog" id="xanga-weblog">
        ${query?`<div class="xanga-search-results"><b>search results for:</b> ${escapeHtml(xangaSearchQuery)} · ${filteredPosts.length} entr${filteredPosts.length===1?'y':'ies'} <button type="button" data-xanga-search-clear>clear</button></div>`:''}
        ${filteredPosts.length?filteredPosts.map((post)=>{
          const eprops=Number(xangaState.eprops?.[post.id]||0);
          const comments=Array.isArray(xangaState.comments?.[post.id])?xangaState.comments[post.id]:[];
          return `<article class="xanga-entry ${post.protected?'is-protected':''}" data-xanga-post="${escapeHtml(post.id)}">
            <header><time>${escapeHtml(post.date)} <small>${escapeHtml(post.time)}</small></time><h3>${escapeHtml(post.title)}</h3></header>
            <div class="xanga-entry-meta"><b>currently playing:</b> ${escapeHtml(post.currentlyPlaying||'nothing')} · <b>mood:</b> ${escapeHtml(post.mood||'')}</div>
            <div class="xanga-entry-body">${post.protected&&!getFragments().includes('future')?'<p><b>This protected entry is unavailable in the current timeline.</b></p><p>Hint: a future keyword or buddy may provide access.</p>':(post.body||[]).map((paragraph)=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
            <footer><span><b>${eprops}</b> eProps</span> · <button type="button" data-xanga-eprops="${escapeHtml(post.id)}" data-value="1">give 1 eProp</button> · <button type="button" data-xanga-eprops="${escapeHtml(post.id)}" data-value="2">give 2 eProps</button> · <button type="button" data-xanga-comment-toggle="${escapeHtml(post.id)}">${comments.length} comments</button></footer>
            <section class="xanga-comments" data-xanga-comments="${escapeHtml(post.id)}" ${comments.length?'':'hidden'}>${comments.map((comment)=>`<p><b>${escapeHtml(comment.name)}:</b> ${escapeHtml(comment.text)} <small>${escapeHtml(comment.date)}</small></p>`).join('')}<form data-xanga-comment-form data-post-id="${escapeHtml(post.id)}"><label>name <input name="name" value="${escapeHtml(getScreenName())}" required></label><label>comment <textarea name="comment" rows="3" required></textarea></label><button class="xanga-button" type="submit">submit</button></form></section>
          </article>`;
        }).join(''):'<div class="xanga-search-results xanga-search-results--empty">No entries matched that search. <button type="button" data-xanga-search-clear>show all entries</button></div>'}
        <div class="xanga-pager"><a href="#">« previous 5</a><a href="#">next 5 »</a></div>
      </main>
      <aside class="xanga-rightbar">
        <section class="xanga-module"><h3>subscriptions</h3><p>${xangaState.subscribed?'You are subscribed to this site. New entries will appear in your imaginary inbox.':'Subscribe to keep up with this site.'}</p><button class="xanga-button" type="button" data-xanga-subscribe>${xangaState.subscribed?'unsubscribe':'subscribe now'}</button></section>
        <section class="xanga-module"><h3>blogrings</h3>${(xanga.blogrings||[]).map((ring)=>`<a href="#" data-xanga-blogring="${escapeHtml(ring)}">${escapeHtml(ring)}</a>`).join('')}</section>
        <section class="xanga-module xanga-calendar"><h3>December 2000</h3><table><tbody><tr><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td class="active">8</td><td>9</td></tr><tr><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td></tr></tbody></table></section>
        <section class="xanga-module"><h3>powered by</h3><p>xanga classic · best viewed at 800×600 · customized by KevinY2K</p></section>
      </aside>
    </div>
  </div>`;
}
function renderInternetDirectory() {
  return `<div class="early-web-directory">
    <div class="web-directory-banner"><h2>Welcome to the Internet</h2><p>Millions of pages. Several useful ones.</p></div>
    <div class="web-directory-columns">
      <section><h3>Kevin’s Favorite Places</h3><button data-open-xanga><b>xanga.com/KevinY2K</b><small>Weblog · profile · eProps · comments</small></button><button data-open-kol-page="projects"><b>Kevin’s Project Archive</b><small>Case studies and experiments</small></button><button data-keyword-value="future"><b>Future Archive</b><small>Connection not guaranteed</small></button></section>
      <section><h3>Web Categories</h3><a href="#">Arts & Humanities</a><a href="#">Computers & Internet</a><a href="#">Entertainment</a><a href="#">Games</a><a href="#">People & Chat</a><a href="#">Science & Technology</a></section>
      <aside><h3>Featured Site</h3><div class="featured-xanga"><span>x</span><b>Kevin’s Xanga</b><p>Read the weblog that exists somewhere between 2000 and 2004.</p><button class="aol-button" data-open-xanga>Visit Now</button></div></aside>
    </div>
  </div>`;
}
function renderWWW(result=currentWebPage,{push=false}={}) {
  if(push)setWebHistory(result);
  else currentWebPage=result;
  const future=result==='future';
  const xanga=result==='xanga';
  const content=xanga?renderXanga():future?`<div class="future-web"><h2>TRANSMISSION RECOVERED: 2040</h2><p>This page should not exist in the year 2000.</p><p>A future archive has classified Kevin’s portfolio as an early example of identity rendered across cultural interfaces.</p><p><b>Instruction:</b> preserve the human signal while the tools change.</p><button class="aol-button" type="button" data-open-kol-page="memory">Mount Memory.arc</button></div>`:renderInternetDirectory();
  return `<article class="kol-page web-browser">
    ${kolPageHeader(xanga?'Kevin’s Xanga':future?'Future Transmission':'World Wide Web','Kevin Explorer 5.5')}
    <div class="browser-toolbar"><button type="button" data-browser-back ${webHistoryIndex<=0?'disabled':''}>◀<small>Back</small></button><button type="button" data-browser-forward ${webHistoryIndex>=webHistory.length-1?'disabled':''}>▶<small>Forward</small></button><button type="button" data-browser-refresh>↻<small>Refresh</small></button><button type="button" data-browser-home>⌂<small>Home</small></button><button type="button" data-open-kol-page="favorites">★<small>Favorites</small></button></div>
    <div class="browser-chrome"><label>Address</label><input value="${escapeHtml(webAddress(result))}" aria-label="Web address" data-browser-address><button class="aol-button" type="button" data-browser-go>Go</button></div>
    <div class="browser-statusline"><span>${xanga?'Opening Xanga Site...':'Internet zone'}</span><span>◉ Online</span></div>
    <div class="web-page ${xanga?'web-page--xanga':''}">${content}</div>
  </article>`;
}
function renderFavorites() {
  return `<article class="kol-page">
    ${kolPageHeader('Favorite Places','Bookmarks saved by KevinY2K')}
    <div class="favorites-page"><aside><h3>Folders</h3><button class="is-active">Favorite Places</button><button>Portfolio</button><button>Early Internet</button><button>Temporal Anomalies</button></aside><main><button data-open-xanga><span class="favorite-icon favorite-icon--xanga">x</span><div><b>Kevin’s Xanga Site</b><small>http://www.xanga.com/KevinY2K</small></div></button><button data-open-kol-page="projects"><span class="favorite-icon">📁</span><div><b>Kevin’s Projects</b><small>kevin://projects</small></div></button><button data-open-kol-page="resume"><span class="favorite-icon">▤</span><div><b>Resume.doc</b><small>kevin://resume</small></div></button><button data-keyword-value="future"><span class="favorite-icon">◇</span><div><b>Future Archive</b><small>keyword://future</small></div></button></main></div>
  </article>`;
}
function renderChannels() {
  return `<article class="kol-page">
    ${kolPageHeader('Channels','Everything Kevin Online has to offer')}
    <div class="channels-page"><div class="channels-rail"><button data-open-kol-page="welcome">Welcome</button><button data-open-kol-page="news">Kevin Online Today</button><button data-open-kol-page="projects">Work & Projects</button><button data-open-kol-page="resume">Career Center</button><button data-open-xanga>People & Weblogs</button><button data-menu-action="buddies">People Connection</button><button data-open-kol-page="www">Internet</button></div><main><h2>Choose a Channel</h2><p>Kevin Online organizes the portfolio the way an online service in 2000 might have organized the whole internet.</p><div class="channel-cards"><button data-open-kol-page="projects"><b>Work & Projects</b><span>Strategy, product, operations, technology, automation, and systems.</span></button><button data-open-kol-page="resume"><b>Career Center</b><span>Experience, capabilities, and a printable resume.</span></button><button data-open-xanga><b>People & Weblogs</b><span>Visit KevinY2K’s Xanga Site, leave eProps, and comment.</span></button><button data-menu-action="buddies"><b>People Connection</b><span>Open the Buddy List and start an Instant Message.</span></button></div></main></div>
  </article>`;
}
function renderNews() {
  return `<article class="kol-page">
    ${kolPageHeader('Kevin Online Today','Wednesday, July 12, 2000')}
    <div class="news-ticker">BREAKING: Y2K crisis officially replaced by ordinary software bugs · 56K modem reaches theoretical speed for almost three seconds</div>
    <div class="news-grid"><section class="news-lead"><h2>Local teenager discovers the internet and refuses to log off</h2><p>Sources report that Kevin has been designing ASCII chatroom scrollers, scripting punter bots, and exploring what happens when technology becomes a creative medium.</p><p><b>Analysts predict:</b> this may become a lifelong pattern.</p></section><aside><article class="news-card"><h3>CD-ROM surplus grows</h3><p>Kevin Online promises to mail enough free-trial discs to support household furniture.</p></article><article class="news-card"><h3>Future sends suspicious IM</h3><p>A buddy with a 2040 timestamp has appeared online. Experts advise replying “future.”</p></article><article class="news-card"><h3>Portfolio mode discovered</h3><p><a href="/portfolio/">A faster, cleaner version exists outside the CRT.</a></p></article></aside></div>
  </article>`;
}
function renderPrint() {
  return `<article class="kol-page print-preview"><div class="print-actions"><button class="retro-button" type="button" data-print-now>Print</button><button class="retro-button" type="button" data-open-kol-page="resume">Return to Resume</button></div><section class="print-sheet"><h1>${escapeHtml(data.profile?.name || 'Kevin Yang')}</h1><p><b>${escapeHtml(data.profile?.headline || '')}</b></p><hr>${(data.experienceItems||[]).map((entry)=>`<h3>${escapeHtml(entry.title)} — ${escapeHtml(entry.organization)}</h3><p>${escapeHtml(entry.period)}</p><p>${escapeHtml(entry.summary)}</p>`).join('')}<p>Full portfolio: kevinception.com</p></section></article>`;
}
function renderMemory() {
  const discovered = getFragments();
  const definitions = legacy.easterEggs || [];
  const percent = definitions.length ? Math.round(discovered.length/definitions.length*100) : 0;
  return `<article class="kol-page">${kolPageHeader('Memory Archive','Memory.arc — cross-era artifact index')}<div class="kol-page__body"><div class="memory-scanner"><p>K/OS TEMPORAL ARCHIVE</p><p>KNOWN FRAGMENTS: ${discovered.length}/${definitions.length}</p><p>SIGNAL INTEGRITY: ${discovered.length===definitions.length?'COMPLETE':discovered.length?'PARTIAL':'UNSCANNED'}</p><p>&gt; ${discovered.length===definitions.length?'ALL LAYERS ALIGNED':'AWAITING INPUT_'}</p></div><div class="memory-progress" aria-label="Memory progress ${percent} percent"><span style="--memory-progress:${percent}%"></span></div><div class="memory-list">${definitions.map((definition)=>{const unlocked=discovered.includes(definition.id);const copy=memoryCopy[definition.id];return `<article class="memory-item ${unlocked?'':'is-locked'}"><b>${unlocked?'◆':'◇'} ${escapeHtml(unlocked?(copy?.[0]||definition.label):definition.label)}</b><p>${escapeHtml(unlocked?(copy?.[1]||'Recovered.'):`Hint: ${definition.hint}`)}</p></article>`;}).join('')}</div></div></article>`;
}
function renderFuture() { discover('future','future-page'); setWebHistory('future'); return renderWWW('future'); }

function renderKolPage(page, options={}) {
  if (!kolContent) return;
  currentKolPage = page;
  let html = '';
  const titles = {welcome:'Welcome',mail:'Mail Center',write:'Write Mail',resume:'Career Center',projects:'My Files',print:'Print Preview',about:'My KOL',favorites:'Favorite Places',channels:'Channels',www:'Internet',news:'Kevin Online Today',memory:'Memory Archive',future:'Future Transmission'};
  if (page==='welcome') html=renderWelcome();
  else if (page==='mail') html=renderMail(options.messageId,options.folder||currentMailFolder);
  else if (page==='write') html=renderWriteMail(options.prefill||{});
  else if (page==='resume') html=renderResume();
  else if (page==='projects') html=renderProjects();
  else if (page==='print') html=renderPrint();
  else if (page==='about') html=renderAbout();
  else if (page==='favorites') html=renderFavorites();
  else if (page==='channels') html=renderChannels();
  else if (page==='www') html=renderWWW(options.webPage||currentWebPage,{push:Boolean(options.pushWeb)});
  else if (page==='news') html=renderNews();
  else if (page==='memory') html=renderMemory();
  else if (page==='future') html=renderFuture();
  else html=renderWelcome();
  kolContent.innerHTML = html;
  kolTitle.textContent = `${titles[page] || 'Kevin Online'} — Kevin Online`;
  if (keywordInput) keywordInput.value = page==='future'?'keyword://future':page==='www'?webAddress(currentWebPage):`kevin://${page}`;
  kolWindow.hidden = false;
  kolWindow.classList.remove('is-minimized');
  taskKol?.classList.add('is-active');
  activateWindow('kol');
  setStatus(page==='mail'?'You’ve got mail!':`Connected · ${titles[page] || 'Kevin Online'}`);
  if (page==='mail') {
    playSound('mail');
    speak("You've got mail!");
    updateMailBadge();
  }
  if (options.focus !== false) kolContent.focus({preventScroll:true});
  playSound('click');
  track('application_opened',{application:page,era:'2000'});
}
function openWebPage(page,{push=true}={}) {
  if(push)setWebHistory(page); else currentWebPage=page;
  renderKolPage('www',{webPage:page,focus:true});
}

function renderAux(id, options={}) {
  if (id==='computer') return `<h2>My Computer</h2><p>Select an item to view its contents.</p><div class="file-grid"><button class="file-icon" data-open-kol-page="projects"><span class="pixel-icon pixel-icon--computer"></span>Kevin's Projects (C:)</button><button class="file-icon" data-open-app="cdrom"><span class="pixel-icon pixel-icon--cd"></span>Kevin Online (D:)</button><button class="file-icon" data-open-xanga><span class="pixel-icon pixel-icon--xanga">x</span>Kevin's Xanga.url</button><button class="file-icon" data-open-kol-page="resume">▤ Resume.doc</button><button class="file-icon" data-open-kol-page="memory">◇ Memory.arc</button></div>`;
  if (id==='cdrom') return `<h2>Kevin Online CD-ROM Collection</h2><p>Every disc includes 1,000 free hours and can later become a coaster, paper weight, or reflective wall treatment.</p><div class="cd-collection">${Array.from({length:12},(_,index)=>`<button class="cd-disc" type="button" data-cd-disc="${index+1}">KOL<br>${index+1}</button>`).join('')}</div><p data-cd-status>Discs inspected: 0</p>`;
  if (id==='recycle') return `<h2>Recycle Bin</h2><p>These files were deleted from one timeline, not every timeline.</p><div class="file-grid"><button class="file-icon" data-open-file="future.txt">📄 future.txt</button><button class="file-icon" data-open-file="punter_bot.bat">⚙ punter_bot.bat</button><button class="file-icon" data-open-file="ascii_scroller.nfo">⌨ ascii_scroller.nfo</button><button class="file-icon" data-open-file="aol_cd_inventory.xls">💿 cd_inventory.xls</button></div>`;
  if (id==='memory') return `<h2>Memory.arc</h2>${renderMemory().replace(/^<article[^>]*>|<\/article>$/g,'')}`;
  if (id==='ascii') return `<h2>ASCII Chatroom Scroller</h2><p>A tiny tribute to the experiments that made the early internet feel programmable.</p><div class="ascii-scroller"><pre>\n╔════════════════════════════════╗\n║       K E V I N  O N L I N E  ║\n║   anticipate tomorrow          ║\n║   live for today               ║\n║   never forget yesterday       ║\n╚════════════════════════════════╝\n\n  .oO layers within layers Oo.\n\n</pre></div>`;
  if (id==='solitaire') return `<h2>Solitaire</h2><p>Productivity software for waiting on a 4.2 MB download.</p><div class="solitaire-table">${['A♥','K♠','Q♦','J♣','10♥','9♠','8♦'].map((card,index)=>`<button class="playing-card" style="left:${1+index*2.6}rem;top:${1+(index%3)*1.5}rem;transform:rotate(${index*2-6}deg)" data-card>${card}</button>`).join('')}</div>`;
  if (id==='dsl') return `<h2>KOL DSL Upgrade Wizard</h2><p><b>Congratulations!</b> Your household may qualify for a blazing-fast connection.</p><ol><li>Locate a broadband provider in the future.</li><li>Wait for the neighborhood to be wired.</li><li>Stop using the phone line to access the internet.</li></ol><p><b>Estimated installation date:</b> Somewhere between tomorrow and 2007.</p><button class="retro-button" data-dsl-progress>Begin 634-hour download</button><div class="memory-progress" hidden data-dsl-progressbar><span style="--memory-progress:2%"></span></div>`;
  if (id==='calendar') return `<h2>July 2000</h2><table style="width:100%;border-collapse:collapse;text-align:center"><thead><tr>${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>`<th>${day}</th>`).join('')}</tr></thead><tbody>${Array.from({length:5},(_,row)=>`<tr>${Array.from({length:7},(_,col)=>{const n=row*7+col-5;return `<td style="padding:.5rem;border:1px solid #bbb;${n===12?'background:#000080;color:#fff;font-weight:bold':''}">${n>0&&n<=31?n:''}</td>`;}).join('')}</tr>`).join('')}</tbody></table><p><b>System date:</b> 7/12/2000<br><b>Actual temporal offset:</b> classified</p>`;
  if (id==='about-kol') return `<img src="/legacy/assets/xennial/kol-logo.svg" alt="Kevin Online" style="display:block;width:min(320px,80%);margin:1rem auto"><h2>Kevin Online 5.0</h2><p>Temporal build 07.12.2000</p><p>A personal portfolio disguised as the moment the early internet became a lifelong obsession.</p><p>Running on WinDohs '98 inside a DieuSonic CRT V.2000.</p>`;
  if (id==='taskmanager') return `<h2>Close Program</h2><p>The following programs are running:</p><select size="6" style="width:100%"><option>Kevin Online [Running]</option><option>Buddy List [Responding]</option><option>Temporal Layer [Suspicious]</option><option>FutureKevin2040 [Unknown]</option></select><p><button class="retro-button" data-fake-end-task>End Task</button> <button class="retro-button" data-close-this-window>Cancel</button></p>`;
  if (id==='im') {
    const buddy=(legacy.buddyScreenNames||[]).find((item)=>item.id===options.buddyId) || legacy.buddyScreenNames?.[0] || {id:'future-kevin',name:'FutureKevin2040'};
    return `<h2>Instant Message — ${escapeHtml(buddy.name)}</h2><div class="im-transcript" data-im-transcript>${renderImTranscript(buddy)}</div><form class="im-compose" data-im-form data-buddy-id="${escapeHtml(buddy.id)}"><label class="sr-only" for="im-message-${escapeHtml(buddy.id)}">Message</label><input id="im-message-${escapeHtml(buddy.id)}" data-im-input autocomplete="off"><button class="retro-button">Send</button></form><p><small>Try: what does Kevin do, current work, automation, open projects, open resume, Xanga, future</small></p>`;
  }
  if (id==='file') return `<h2>${escapeHtml(options.name || 'Recovered file')}</h2><pre class="ascii-art">${escapeHtml(options.content || '')}</pre>`;
  return '<p>Application not found.</p>';
}

const auxMeta = {
  computer:{title:'My Computer',icon:'▣',width:500,height:360,status:'5 object(s)'},
  cdrom:{title:'Kevin Online (D:)',icon:'◉',width:560,height:430,status:'1,000 FREE HOURS'},
  recycle:{title:'Recycle Bin',icon:'♲',width:500,height:350,status:'4 deleted object(s)'},
  memory:{title:'Memory.arc',icon:'◇',width:570,height:480,status:'Temporal archive mounted'},
  ascii:{title:'ASCII Scroller.exe',icon:'A',width:520,height:390,status:'Chatroom mode'},
  solitaire:{title:'Solitaire',icon:'♠',width:520,height:410,status:'Game 1'},
  dsl:{title:'KOL DSL Upgrade Wizard',icon:'↯',width:480,height:340,status:'Estimated speed: someday'},
  calendar:{title:'Date/Time Properties',icon:'▦',width:440,height:360,status:'System date: 7/12/2000'},
  'about-kol':{title:'About Kevin Online',icon:'K',width:450,height:330,status:'Version 5.0'},
  taskmanager:{title:'Close Program',icon:'!',width:430,height:340,status:'Ctrl+Alt+Delete'},
  im:{title:'Instant Message',icon:'☺',width:470,height:370,status:'Direct connection'},
  file:{title:'Notepad',icon:'N',width:520,height:400,status:'Recovered text file'}
};

function activateWindow(id) {
  activeWindowId=id;
  zIndex+=1;
  if (id==='kol') {
    kolWindow.classList.add('is-active');
    kolWindow.style.zIndex=String(zIndex);
    taskKol?.classList.add('is-active');
  } else {
    kolWindow?.classList.remove('is-active');
    taskKol?.classList.remove('is-active');
  }
  if (id==='buddies') {
    buddyWindow.classList.add('is-active');
    buddyWindow.style.zIndex=String(zIndex);
  } else buddyWindow?.classList.remove('is-active');
  windows.forEach((record,windowId)=>{
    record.element.classList.toggle('is-active',windowId===id);
    record.task.classList.toggle('is-active',windowId===id);
    if (windowId===id) record.element.style.zIndex=String(zIndex);
  });
}
function clampWindow(element) {
  if (isMobile() || !windowLayer) return;
  const layer=windowLayer.getBoundingClientRect();
  const rect=element.getBoundingClientRect();
  const left=Math.min(Math.max(0,parseFloat(element.style.left||'0')),Math.max(0,layer.width-rect.width));
  const top=Math.min(Math.max(0,parseFloat(element.style.top||'0')),Math.max(0,layer.height-rect.height));
  element.style.left=`${left}px`;
  element.style.top=`${top}px`;
}
function installDrag(element,handle) {
  let drag=null;
  handle?.addEventListener('pointerdown',(event)=>{
    if (isMobile() || event.button!==0 || event.target.closest('button')) return;
    activateWindow(element.dataset.windowId);
    const rect=element.getBoundingClientRect();
    const layer=windowLayer.getBoundingClientRect();
    drag={id:event.pointerId,x:event.clientX-rect.left,y:event.clientY-rect.top,l:layer.left,t:layer.top};
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  handle?.addEventListener('pointermove',(event)=>{
    if (!drag || drag.id!==event.pointerId) return;
    element.style.left=`${event.clientX-drag.l-drag.x}px`;
    element.style.top=`${event.clientY-drag.t-drag.y}px`;
    clampWindow(element);
  });
  const end=(event)=>{if(!drag||drag.id!==event.pointerId)return;drag=null;try{handle.releasePointerCapture(event.pointerId);}catch{/* no-op */}};
  handle?.addEventListener('pointerup',end);handle?.addEventListener('pointercancel',end);
}
function createTask(id,title,icon) {
  const button=document.createElement('button');
  button.className='task-button is-active';
  button.type='button';
  button.innerHTML=`<span aria-hidden="true">${escapeHtml(icon)}</span><b>${escapeHtml(title)}</b>`;
  button.setAttribute('aria-label',`Show or minimize ${title}`);
  button.addEventListener('click',()=>{
    const record=windows.get(id);if(!record)return;
    if(record.element.classList.contains('is-minimized')){record.element.classList.remove('is-minimized');activateWindow(id);}
    else if(activeWindowId===id){record.element.classList.add('is-minimized');record.task.classList.remove('is-active');activeWindowId=null;}
    else activateWindow(id);
    playSound('click');
  });
  taskList?.append(button);
  return button;
}
function openAux(id,options={}) {
  const uniqueId=options.uniqueId || id;
  const existing=windows.get(uniqueId);
  if(existing){existing.element.classList.remove('is-minimized');activateWindow(uniqueId);existing.titlebar.focus({preventScroll:true});return existing.element;}
  const meta={...(auxMeta[id]||auxMeta.file),...(options.meta||{})};
  const element=document.createElement('section');
  element.className='retro-window aux-window';
  element.dataset.windowId=uniqueId;
  element.setAttribute('role','dialog');
  element.setAttribute('aria-label',meta.title);
  const layerWidth=windowLayer?.clientWidth||900;
  const layerHeight=windowLayer?.clientHeight||600;
  const width=Math.min(meta.width||500,Math.max(280,layerWidth-45));
  const height=Math.min(meta.height||380,Math.max(240,layerHeight-45));
  const left=Math.max(8,(layerWidth-width)/2+((cascade%5)-2)*22);
  const top=Math.max(8,(layerHeight-height)/2+((cascade%4)-1.5)*18);
  cascade+=1;
  Object.assign(element.style,{width:`${width}px`,height:`${height}px`,left:`${left}px`,top:`${top}px`});
  element.innerHTML=`<header class="retro-titlebar" tabindex="0" data-window-titlebar><span>${escapeHtml(meta.icon||'□')}</span><strong>${escapeHtml(meta.title)}</strong><div class="retro-titlebar__controls"><button type="button" data-window-minimize aria-label="Minimize">_</button><button type="button" data-window-maximize aria-label="Maximize">□</button><button type="button" data-window-close aria-label="Close">×</button></div></header><div class="kol-menubar" aria-hidden="true"><button>File</button><button>Edit</button><button>Help</button></div><div class="aux-window__content" data-aux-content>${renderAux(id,options)}</div><footer class="aux-window__status">${escapeHtml(meta.status||'Ready')}</footer>`;
  windowLayer?.append(element);
  const titlebar=element.querySelector('[data-window-titlebar]');
  const task=createTask(uniqueId,meta.title,meta.icon||'□');
  windows.set(uniqueId,{element,task,titlebar,id,options});
  installDrag(element,titlebar);
  element.addEventListener('pointerdown',()=>activateWindow(uniqueId));
  element.querySelector('[data-window-close]')?.addEventListener('click',()=>closeAux(uniqueId));
  element.querySelector('[data-window-minimize]')?.addEventListener('click',()=>{element.classList.add('is-minimized');task.classList.remove('is-active');activeWindowId=null;playSound('click');});
  element.querySelector('[data-window-maximize]')?.addEventListener('click',(event)=>{element.classList.toggle('is-maximized');event.currentTarget.textContent=element.classList.contains('is-maximized')?'❐':'□';playSound('click');});
  activateWindow(uniqueId);
  titlebar.focus({preventScroll:true});
  playSound('open');
  track('application_opened',{application:id,era:'2000'});
  if(id==='im' && options.buddyId==='future-kevin') discover('buddy','future-buddy-im');
  return element;
}
function closeAux(id) {
  const record=windows.get(id);if(!record)return;
  record.element.remove();record.task.remove();windows.delete(id);playSound('close');
  activateWindow('kol');
}
function refreshAuxMemory() {
  const record=windows.get('memory');
  if(record) record.element.querySelector('[data-aux-content]').innerHTML=renderAux('memory');
}

function renderBuddies() {
  const buddies=legacy.buddyScreenNames||[];
  const online=buddies.filter((buddy)=>buddy.state!=='offline');
  const offline=buddies.filter((buddy)=>buddy.state==='offline');
  buddyContent.innerHTML=`<details open><summary>Buddies Online (${online.length}/${online.length})</summary>${online.map((buddy)=>`<button class="buddy-item ${selectedBuddy===buddy.id?'is-selected':''}" type="button" data-buddy-id="${escapeHtml(buddy.id)}" data-state="${escapeHtml(buddy.state)}"><i></i><span><b>${escapeHtml(buddy.name)}</b><small>${escapeHtml(buddy.note)}</small></span></button>`).join('')}</details><details open><summary>Offline Buddies (${offline.length}/${offline.length})</summary>${offline.map((buddy)=>`<button class="buddy-item" type="button" data-buddy-id="${escapeHtml(buddy.id)}" data-state="offline"><i></i><span><b>${escapeHtml(buddy.name)}</b><small>${escapeHtml(buddy.note)}</small></span></button>`).join('')}</details>`;
  buddyLoaded=true;
}
function buddyTaskButton() {
  let button=document.querySelector('[data-task-buddies]');
  if(button)return button;
  button=document.createElement('button');button.className='task-button is-active';button.type='button';button.dataset.taskBuddies='';button.innerHTML='<span>☺</span><b>Buddy List</b>';
  button.addEventListener('click',()=>{if(buddyWindow.hidden){showBuddies();}else if(activeWindowId==='buddies'){buddyWindow.hidden=true;button.remove();activateWindow('kol');}else activateWindow('buddies');});
  taskList?.append(button);return button;
}
function showBuddies() {
  buddyWindow.hidden=false;buddyTaskButton();activateWindow('buddies');playSound('buddy');
  if(!buddyLoaded) setTimeout(renderBuddies,reducedMotion()?0:900);
  track('buddy_list_opened',{era:'2000'});
}
function hideBuddies() { buddyWindow.hidden=true;document.querySelector('[data-task-buddies]')?.remove();activateWindow('kol');playSound('close'); }
function openIM(buddyId=selectedBuddy) {
  const buddy=(legacy.buddyScreenNames||[]).find((item)=>item.id===buddyId);
  if(!buddy)return;
  selectedBuddy=buddyId;
  if(buddy.state==='offline'){toast(`${buddy.name} is offline. Your message will be sent when they reconnect.`);}
  openAux('im',{buddyId,uniqueId:`im:${buddyId}`,meta:{title:`Instant Message — ${buddy.name}`}});
}
function knowledgeReply(message) {
  const normalized = message.toLowerCase().trim();
  const projects = data.projects || [];
  const project = projects.find((item) => normalized.includes(item.title.toLowerCase()) || normalized.includes(item.slug.replaceAll('-', ' ')));
  if (project) {
    renderKolPage('projects', { focus: false });
    return `${project.title}: ${project.summary} Kevin’s role included ${project.roles.join(', ')}. I opened My Files so you can continue.`;
  }
  const faqs = knowledgeBase.faqs || [];
  let faq = null;
  if (/contact|reach|email|hire|talk/.test(normalized)) faq = faqs.find((item) => item.id === 'contact');
  else if (/now|current|working on|building/.test(normalized)) faq = faqs.find((item) => item.id === 'current-work');
  else if (/how.*work|working style|approach|process/.test(normalized)) faq = faqs.find((item) => item.id === 'working-style');
  else if (/technology|internet|started|origin|90s|aol/.test(normalized)) faq = faqs.find((item) => item.id === 'technology-story');
  else if (/best|problem|strength|good at|capabilit|skill|automation/.test(normalized)) faq = faqs.find((item) => item.id === 'best-problems');
  else if (/what.*do|who.*kevin|about kevin|resume/.test(normalized)) faq = faqs.find((item) => item.id === 'what-does-kevin-do');
  if (/open|show|take me|view/.test(normalized)) {
    if (/resume|career|experience/.test(normalized)) { renderKolPage('resume', { focus: false }); return 'I opened Career Center. Kevin works across product, projects, strategy, operations, technology, automation, and systems.'; }
    if (/project|work|files/.test(normalized)) { renderKolPage('projects', { focus: false }); return 'I opened My Files. Start with Kevinception for creative range, TokenPak for product and AI systems, or Agentic Work Fleet for operating-model depth.'; }
    if (/xanga|blog|weblog/.test(normalized)) { openWebPage('xanga'); return 'Opening KevinY2K’s Xanga inside Kevin Explorer. Watch for the protected entry.'; }
    if (/about|profile/.test(normalized)) { renderKolPage('about', { focus: false }); return 'I opened My KOL with Kevin’s background and current focus.'; }
    if (/contact/.test(normalized)) { return 'Kevin’s verified public contact route is GitHub at @kaywhy331. The Contact page is available outside the CRT.'; }
  }
  return faq ? `${faq.shortAnswer} ${faq.fullAnswer}` : null;
}
function imResponse(buddyId,message) {
  const normalized=message.toLowerCase().trim();
  const grounded = knowledgeReply(message);
  if(buddyId==='future-kevin') {
    if(normalized.includes('future')) { discover('future','future-im'); return 'By 2040, this screen is a museum object. The instinct to build useful systems survives every interface.'; }
    if(normalized.includes('kevinception')) return 'Layers within layers. Every interface is telling the same verified story from a different time. The direct portfolio is the evidence layer; these worlds are the interpretation layer.';
    if(normalized==='asl' || normalized.includes('a/s/l')) return '55 / future archive / one layer deeper than you';
    if(normalized.includes('help')) return 'Ask what Kevin does, what he is building now, how he approaches automation, or tell me to open projects, resume, or Xanga.';
    if(normalized.includes('hello') || normalized.includes('hi')) return 'Hello from 2040. Your 56K signal took a while to reach me.';
    return grounded || 'The archive received that. Ask about Kevin’s work, systems, projects, or the pattern that connects the timelines.';
  }
  if(buddyId==='ascii-kid') {
    if(normalized.includes('asl')) return 'old enough / cyberspace / making the chatroom scroll sideways';
    if(normalized.includes('hello')||normalized.includes('hi')) return 'h3y!!! welcome 2 the layer beneath the layer';
    return grounded ? `<< ${grounded} >>` : 'try asking about kevin’s technology origin, creative projects, or what he is building now.';
  }
  if(buddyId==='away-forever') {
    if(normalized.includes('hello')||normalized.includes('hi')) return 'auto-response: away making a roadmap. your message is still important.';
    return grounded ? grounded.toLowerCase() : 'away message says: ask about his process, projects, or the kind of problem you need solved.';
  }
  if(normalized.includes('asl')) return '56k / local access number / carrier lost';
  return grounded || 'message queued while the phone line is busy. try asking about TokenPak, Kevinception, automation, or current work.';
}
function openRecoveredFile(name) {
  const files={
    'future.txt':'TIMESTAMP: 2040-07-12\n\nThis artifact was recovered from an early personal web experience.\nThe interface resembles a turn-of-the-century online service.\nThe underlying pattern persists: strategy, systems, invention, execution.\n\nKEYWORD: FUTURE',
    'punter_bot.bat':'@echo off\nREM educational nostalgia only\nREM original scripts removed from this timeline\necho Curiosity initialized...\necho Automation instinct detected...\necho Future systems builder: TRUE',
    'ascii_scroller.nfo':'[ K E V I N   O N L I N E ]\n\nGrowing up in the 90s, Kevin designed ASCII art chatroom scrollers and small scripts while exploring the early internet.\n\nThe experiments were playful. The pattern was permanent.',
    'aol_cd_inventory.xls':'KOL CD-ROM INVENTORY\n--------------------\nKitchen coaster: 4\nDesk coaster: 3\nPaper weights: 2\nEmergency mirrors: 1\nFree hours promised: effectively infinite'
  };
  discover('trash','recovered-file');
  openAux('file',{uniqueId:`file:${name}`,name,content:files[name]||'FILE NOT FOUND',meta:{title:`${name} — Notepad`}});
}

function closeMenus() {
  document.querySelectorAll('[data-menu-popup]').forEach((popup)=>popup.hidden=true);
  document.querySelectorAll('[data-menu-button]').forEach((button)=>button.setAttribute('aria-expanded','false'));
}
function toggleMenu(name,button) {
  const popup=document.querySelector(`[data-menu-popup="${name}"]`);
  const open=popup?.hidden;
  closeMenus();
  if(popup&&open){popup.hidden=false;button.setAttribute('aria-expanded','true');}
}
function downloadSnapshot() {
  const text=`KEVIN ONLINE — YEAR 2000 SNAPSHOT\n\n${data.profile?.name||'Kevin Yang'}\n${data.profile?.headline||''}\n\n${legacy.intro?.lead||''}\n\nProjects:\n${(data.projects||[]).map((project)=>`- ${project.title}: ${project.summary}`).join('\n')}\n\nSaved from kevinception.com`;
  const blob=new Blob([text],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='kevin-online-snapshot.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Saved kevin-online-snapshot.txt');
}
async function copyCurrentPage() {
  const text=kolContent?.innerText||'';
  try { await navigator.clipboard.writeText(text);toast('Page copied to the WinDohs clipboard.'); }
  catch { toast('Clipboard unavailable in this browser.'); }
}
function handleMenuAction(action) {
  closeMenus();
  if(action==='save')downloadSnapshot();
  else if(action==='print'){renderKolPage('print');}
  else if(action==='close'){kolWindow.classList.add('is-minimized');taskKol?.classList.remove('is-active');}
  else if(action==='copy')copyCurrentPage();
  else if(action==='paste')toast('Nothing useful is waiting in the 2000 clipboard.');
  else if(action==='cut')toast('Kevin Online refuses to cut portfolio content. Copy is safer.');
  else if(action==='buddies')showBuddies();
  else if(action==='minimize-all'){kolWindow.classList.add('is-minimized');buddyWindow.hidden=true;windows.forEach(({element,task})=>{element.classList.add('is-minimized');task.classList.remove('is-active');});taskKol?.classList.remove('is-active');}
  else if(action==='signoff'||action==='shutdown')shutdownDialog?.showModal();
  else if(action==='help')helpDialog?.showModal();
  else if(action==='about-kol')openAux('about-kol');
}

function navigateKeyword(raw) {
  const original=String(raw||'').trim();
  const value=original.toLowerCase().replace(/^view-source:/,'').replace(/^https?:\/\//,'').replace(/^keyword:\/\//,'').replace(/^kevin:\/\//,'').replace(/\/$/,'');
  const routes={welcome:'welcome',home:'welcome',mail:'mail','k-mail':'mail',write:'write',resume:'resume',career:'resume',projects:'projects',work:'projects',files:'projects',about:'about','my kol':'about',favorites:'favorites',channels:'channels',news:'news',memory:'memory'};
  if(value==='future' || value.includes('future.archive')) { openWebPage('future');discover('future','keyword');return; }
  if(value==='xanga' || value.includes('xanga.com') || value.includes('keviny2k.xanga')) { openWebPage('xanga');return; }
  if(value==='www'||value==='web'||value==='internet'||value.includes('kevinception.com')) { openWebPage('home');return; }
  if(routes[value]) { renderKolPage(routes[value]); return; }
  kolContent.innerHTML=`<article class="kol-page">${kolPageHeader('Keyword Results','Kevin Online Search')}<div class="kol-page__body"><h3>No exact keyword was found for “${escapeHtml(original)}.”</h3><p>Try WELCOME, PROJECTS, RESUME, ABOUT, MAIL, XANGA, CHANNELS, FAVORITES, MEMORY, or FUTURE.</p><div class="keyword-suggestions"><button data-open-xanga>Visit Kevin’s Xanga</button><button data-open-kol-page="projects">Browse My Files</button><button data-menu-action="buddies">Ask a Buddy</button></div></div></article>`;
  setStatus('Keyword not found');
}

function setConnectionStage(index) {
  const messages=legacy.dialer?.messages||[];
  const details=legacy.dialer?.details||[];
  const progressValues=[12,48,82,100];
  connectSteps.forEach((step,stepIndex)=>{
    step.classList.toggle('is-active',stepIndex===Math.min(index,2));
    step.classList.toggle('is-complete',stepIndex<index || index===3);
  });
  if(dialerState)dialerState.dataset.stage=['dialing','connecting','signing-on','connected'][index]||'dialing';
  if(dialerMessage)dialerMessage.textContent=messages[index]||'Connecting to Kevin Online ...';
  if(connectDetail)connectDetail.textContent=details[index]||'';
  if(connectProgress){
    const value=progressValues[index]||0;
    connectProgress.setAttribute('aria-valuenow',String(value));
    connectProgress.style.setProperty('--connect-progress',`${value}%`);
  }
  if(index===3)playSound('open');
}
function completeConnection({skipped=false}={}) {
  if(connectionComplete)return;
  connectionComplete=true;connectionStartedAt=Date.now();clearDialerTimers();
  dialer.hidden=true;desktopSurface.hidden=false;screen.dataset.screenState='desktop';
  sessionSet('kevinception:xennial-connected','1');
  const buddyOwner=document.querySelector('.buddy-screenname b');if(buddyOwner)buddyOwner.textContent=getScreenName();
  renderKolPage('welcome',{focus:false});
  setTimeout(showBuddies,reducedMotion()?0:1350);
  discover('dialup',skipped?'instant-connection':'dialer-completed');
  playSound('startup');
  if(soundEnabled)setTimeout(()=>speak(`Welcome, ${getScreenName()}. You've got mail!`),reducedMotion()?0:300);
  track(skipped?'xennial_dialer_skipped':'xennial_dialer_completed',{screenName:getScreenName()});
  resetIdleTimer();
}
async function runDialer() {
  if(!dialer||connectionComplete)return;
  clearDialerTimers();
  activeScreenName=signonName?.value||'KevinY2K';
  sessionSet('kevinception:screen-name',activeScreenName);
  if(signonRemember?.checked) safeSet('kevinception:screen-name',activeScreenName);
  const shouldPlayDialup=Boolean(signonSound?.checked);
  if(shouldPlayDialup && !soundEnabled)await setSound(true);
  document.querySelectorAll('[data-signon-dialog]').forEach((dialog)=>dialog.hidden=true);
  if(signonPanel)signonPanel.hidden=true;
  if(connectionPanel)connectionPanel.hidden=false;
  screen.dataset.screenState='dialer';
  setConnectionStage(0);
  if(shouldPlayDialup && soundEnabled)playDialupSound();
  const pace=reducedMotion()?250:1050;
  [1,2,3].forEach((stage,index)=>later(()=>setConnectionStage(stage),(index+1)*pace));
  later(()=>completeConnection(),4*pace+(reducedMotion()?100:300));
  track('xennial_signon_started',{screenName:activeScreenName,location:signonLocation?.value||''});
}
function cancelConnection() {
  if(connectionComplete)return;
  clearDialerTimers();
  if(connectionPanel)connectionPanel.hidden=true;
  if(signonPanel)signonPanel.hidden=false;
  setConnectionStage(0);
  playSound('close');
  track('xennial_connection_cancelled');
}
function showDialer() {
  if(connectionComplete)return;
  bootScreen.hidden=true;dialer.hidden=false;screen.dataset.screenState='signon';
  if(connectionPanel)connectionPanel.hidden=true;
  if(signonPanel)signonPanel.hidden=false;
  document.querySelectorAll('[data-signon-dialog]').forEach((dialog)=>dialog.hidden=true);
  if(signonName && activeScreenName)signonName.value=[...signonName.options].some((option)=>option.value===activeScreenName)?activeScreenName:signonName.value;
  if(signonSound)signonSound.checked=soundEnabled;
  setConnectionStage(0);
  signonName?.focus({preventScroll:true});
}
function completeBoot({skipped=false}={}) {
  if(!bootScreen||bootScreen.hidden)return;
  sessionSet('kevinception:xennial-boot','1');
  if(reducedMotion()||skipped){showDialer();return;}
  bootScreen.classList.add('is-leaving');
  setTimeout(showDialer,430);
  track(skipped?'xennial_boot_skipped':'xennial_boot_completed');
}
function restartSystem() {
  connectionComplete=false;clearDialerTimers();sessionSet('kevinception:xennial-connected','0');
  desktopSurface.hidden=true;dialer.hidden=true;bootScreen.hidden=false;bootScreen.classList.remove('is-leaving');screen.dataset.screenState='boot';monitorOn=true;offMessage.hidden=true;
  if(connectionPanel)connectionPanel.hidden=true;
  if(signonPanel)signonPanel.hidden=false;
  setTimeout(()=>completeBoot(),reducedMotion()?200:1800);
}
function setMonitorPower(on,{fromShutdown=false}={}) {
  monitorOn=on;
  document.querySelector('[data-monitor-power]')?.setAttribute('aria-pressed',String(on));
  document.querySelector('[data-monitor-power]')?.setAttribute('aria-label',on?'Turn monitor off':'Turn monitor on');
  if(!on){screen.dataset.screenState='off';offMessage.hidden=false;playSound('shutdown');if(!fromShutdown)toast('DieuSonic CRT powered off.');}
  else {offMessage.hidden=true;screen.classList.add('is-powering-on');screen.dataset.screenState=connectionComplete?'desktop':'boot';setTimeout(()=>screen.classList.remove('is-powering-on'),800);playSound('startup');if(!connectionComplete)restartSystem();}
}
function degauss() {
  screen.classList.remove('is-degaussing');void screen.offsetWidth;screen.classList.add('is-degaussing');playSound('discover');discover('degauss','monitor-degauss');setTimeout(()=>screen.classList.remove('is-degaussing'),750);
}
function adjustBrightness(amount) { brightness=Math.min(1.35,Math.max(.55,brightness+amount));document.documentElement.style.setProperty('--crt-brightness',String(brightness));toast(`CRT brightness: ${Math.round(brightness*100)}%`); }
function startDslProgress(button) {
  const win=button.closest('.aux-window');
  const bar=win?.querySelector('[data-dsl-progressbar]');
  if(!bar||bar.dataset.running==='1')return;
  bar.hidden=false;bar.dataset.running='1';bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');
  let value=2;const span=bar.querySelector('span');button.disabled=true;button.textContent='Downloading KOL DSL...';
  const timer=setInterval(()=>{value=Math.min(99,value+(value<70?7:value<93?2:1));span?.style.setProperty('--memory-progress',`${value}%`);bar.setAttribute('aria-valuenow',String(value));if(value>=99){clearInterval(timer);bar.dataset.running='0';button.disabled=false;button.textContent='Retry download';toast('Download stalled at 99%. Broadband has not reached this timeline yet.');discover('dsl','dsl-download');}},reducedMotion()?35:220);
}

function updateClock() {
  const now=new Date();
  if(clock){clock.textContent=new Intl.DateTimeFormat([],{hour:'numeric',minute:'2-digit'}).format(now);clock.setAttribute('datetime',now.toISOString());}
  if(dateNode)dateNode.textContent='7/12/2000';
}
function updateOnlineTimers() {
  if(!connectionComplete)return;
  const elapsed=Math.max(0,Math.floor((Date.now()-connectionStartedAt)/1000));
  const hours=String(Math.floor(elapsed/3600)).padStart(2,'0');
  const minutes=String(Math.floor((elapsed%3600)/60)).padStart(2,'0');
  document.querySelectorAll('[data-time-online]').forEach((node)=>node.textContent=`${hours}:${minutes}`);
}
function showScreensaver() { if(!connectionComplete||!monitorOn||fatalError&&!fatalError.hidden)return;screensaver.hidden=false; }
function hideScreensaver() { if(screensaver)screensaver.hidden=true;resetIdleTimer(); }
function resetIdleTimer() { clearTimeout(idleTimer);if(connectionComplete&&monitorOn)idleTimer=setTimeout(showScreensaver,reducedMotion()?180000:75000); }

function confirmShutdown() {
  const choice=shutdownDialog?.querySelector('input[name="shutdown-choice"]:checked')?.value||'signoff';
  shutdownDialog?.close();discover('shutdown',choice);
  if(choice==='signoff') {
    playSound('shutdown');speak('Goodbye.');kolWindow.classList.add('is-minimized');hideBuddies();sessionSet('kevinception:xennial-connected','0');setTimeout(()=>{connectionComplete=false;desktopSurface.hidden=true;dialer.hidden=false;showDialer();toast('You have signed off Kevin Online.');},500);
  } else if(choice==='shutdown') { sessionSet('kevinception:xennial-connected','0');setMonitorPower(false,{fromShutdown:true}); }
  else restartSystem();
}

function handleKonami(key) {
  if(key===KONAMI[konamiIndex] || key.toLowerCase?.()===KONAMI[konamiIndex]) { konamiIndex+=1;if(konamiIndex===KONAMI.length){konamiIndex=0;discover('konami','keyboard-sequence');openAux('solitaire');} }
  else konamiIndex=key===KONAMI[0]?1:0;
}
function showFatalError() { fatalError.hidden=false;playSound('close');track('temporal_error_opened',{era:'2000'}); }
function hideFatalError() { fatalError.hidden=true;playSound('open'); }

root?.addEventListener('click',(event)=>{
  resetIdleTimer();
  const target=event.target;
  if(target.closest('[data-signon-submit]')){runDialer();return;}
  if(target.closest('[data-cancel-connection]')){cancelConnection();return;}
  const signonDialogButton=target.closest('[data-signon-setup],[data-signon-access],[data-signon-help]');
  if(signonDialogButton){const name=signonDialogButton.hasAttribute('data-signon-setup')?'setup':signonDialogButton.hasAttribute('data-signon-access')?'access':'help';document.querySelectorAll('[data-signon-dialog]').forEach((dialog)=>dialog.hidden=dialog.dataset.signonDialog!==name);playSound('open');return;}
  if(target.closest('[data-close-signon-dialog]')){target.closest('[data-signon-dialog]').hidden=true;playSound('close');return;}
  if(target.closest('[data-open-xanga]')){openWebPage('xanga');return;}
  const pageTrigger=target.closest('[data-open-kol-page]');
  if(pageTrigger){renderKolPage(pageTrigger.dataset.openKolPage);startMenu.hidden=true;startButton?.setAttribute('aria-expanded','false');return;}
  const appTrigger=target.closest('[data-open-app]');
  if(appTrigger){openAux(appTrigger.dataset.openApp);startMenu.hidden=true;startButton?.setAttribute('aria-expanded','false');return;}
  const menuButton=target.closest('[data-menu-button]');
  if(menuButton){event.stopPropagation();toggleMenu(menuButton.dataset.menuButton,menuButton);return;}
  const menuAction=target.closest('[data-menu-action]');
  if(menuAction){handleMenuAction(menuAction.dataset.menuAction);return;}
  if(target.closest('[data-close-buddies]')){hideBuddies();return;}
  if(target.closest('[data-dsl-ad]')){discover('dsl','dsl-ad');openAux('dsl');return;}
  if(target.closest('[data-skip-boot]')){completeBoot({skipped:true});return;}
  if(target.closest('[data-skip-dialer]')){activeScreenName=signonName?.value||activeScreenName;sessionSet('kevinception:screen-name',activeScreenName);if(signonRemember?.checked)safeSet('kevinception:screen-name',activeScreenName);completeConnection({skipped:true});return;}
  if(target.closest('[data-keyword-go]')){navigateKeyword(keywordInput?.value);return;}
  const keywordValue=target.closest('[data-keyword-value]');if(keywordValue){navigateKeyword(keywordValue.dataset.keywordValue);return;}
  const mailFolder=target.closest('[data-mail-folder]');if(mailFolder){renderKolPage('mail',{folder:mailFolder.dataset.mailFolder});return;}
  const mailRow=target.closest('[data-mail-message]');if(mailRow){mailRead.add(mailRow.dataset.mailMessage);safeSet('kevinception:mail-read',JSON.stringify([...mailRead]));kolContent.innerHTML=renderMail(mailRow.dataset.mailMessage,currentMailFolder);updateMailBadge();return;}
  if(target.closest('[data-mail-reply]')){const preview=target.closest('.kol-page')?.querySelector('[data-mail-preview]');renderKolPage('write',{prefill:{subject:'Re: '+(preview?.querySelector('p:nth-child(2)')?.textContent?.replace(/^Subject:\s*/,'')||''),body:'\n\n--- Original Message ---\n'+(preview?.innerText||'')}});return;}
  if(target.closest('[data-mail-forward]')){const preview=target.closest('.kol-page')?.querySelector('[data-mail-preview]');renderKolPage('write',{prefill:{subject:'Fwd: message from Kevin Online',body:'\n\n--- Forwarded Message ---\n'+(preview?.innerText||'')}});return;}
  if(target.closest('[data-mail-delete]')){const selectedId=target.closest('.kol-page')?.querySelector('[data-mail-preview]')?.dataset.mailSelected;if(selectedId){deletedMail.add(selectedId);mailRead.add(selectedId);safeSet('kevinception:deleted-mail',JSON.stringify([...deletedMail]));safeSet('kevinception:mail-read',JSON.stringify([...mailRead]));toast('Message moved to Deleted Mail.');updateMailBadge();renderKolPage('mail',{folder:'deleted',messageId:selectedId});}return;}
  if(target.closest('[data-mail-restore]')){const selectedId=target.closest('.kol-page')?.querySelector('[data-mail-preview]')?.dataset.mailSelected;if(selectedId){deletedMail.delete(selectedId);safeSet('kevinception:deleted-mail',JSON.stringify([...deletedMail]));toast('Message restored to Old Mail.');renderKolPage('mail',{folder:'old',messageId:selectedId});}return;}
  if(target.closest('[data-print-now]')){window.print();return;}
  if(target.closest('[data-browser-go]')){const input=target.closest('.web-browser')?.querySelector('[data-browser-address]');navigateKeyword(input?.value);return;}
  if(target.closest('[data-browser-back]')){if(webHistoryIndex>0){webHistoryIndex-=1;openWebPage(webHistory[webHistoryIndex],{push:false});}return;}
  if(target.closest('[data-browser-forward]')){if(webHistoryIndex<webHistory.length-1){webHistoryIndex+=1;openWebPage(webHistory[webHistoryIndex],{push:false});}return;}
  if(target.closest('[data-browser-home]')){openWebPage('home');return;}
  if(target.closest('[data-browser-refresh]')){openWebPage(currentWebPage,{push:false});toast('Page refreshed.');return;}
  if(target.closest('[data-xanga-home]')){event.preventDefault();openWebPage('xanga',{push:false});return;}
  if(target.closest('[data-xanga-subscriptions]')){event.preventDefault();toast('Sites I Read are listed in the Xanga sidebar.');return;}
  if(target.closest('[data-xanga-blogrings]')){event.preventDefault();toast('Blogrings are listed in the Xanga sidebar.');return;}
  const epropsButton=target.closest('[data-xanga-eprops]');if(epropsButton){const postId=epropsButton.dataset.xangaEprops;const value=Math.max(0,Math.min(2,Number(epropsButton.dataset.value)||1));xangaState.eprops[postId]=value;saveXangaState();if(value===2)discover('xanga','two-eprops');openWebPage('xanga',{push:false});toast(`${value} eProp${value===1?'':'s'} left for ${postId}.`);return;}
  const commentToggle=target.closest('[data-xanga-comment-toggle]');if(commentToggle){const panel=document.querySelector(`[data-xanga-comments="${CSS.escape(commentToggle.dataset.xangaCommentToggle)}"]`);if(panel){panel.hidden=!panel.hidden;if(!panel.hidden)panel.querySelector('textarea')?.focus();}return;}
  const subscribeButton=target.closest('[data-xanga-subscribe]');if(subscribeButton){xangaState.subscribed=!xangaState.subscribed;saveXangaState();openWebPage('xanga',{push:false});toast(xangaState.subscribed?'Subscribed to KevinY2K’s Xanga.':'Subscription removed.');return;}
  const skinButton=target.closest('[data-xanga-skin]');if(skinButton){xangaState.skin=skinButton.dataset.xangaSkin;saveXangaState();openWebPage('xanga',{push:false});return;}
  const fakeSite=target.closest('[data-xanga-fake-site],[data-xanga-blogring]');if(fakeSite){event.preventDefault();toast('That Xanga is archived in another timeline.');return;}

  if(target.closest('[data-xanga-search-clear]')){xangaSearchQuery='';openWebPage('xanga',{push:false});return;}
  const xangaPager=target.closest('.xanga-pager a');if(xangaPager){event.preventDefault();toast('The adjacent Xanga archive is still loading over 56K.');return;}
  const xangaPlaceholderLink=target.closest('.xanga-site a[href="#"]');if(xangaPlaceholderLink){event.preventDefault();toast('That Xanga link is archived in another timeline.');return;}
  const buddy=target.closest('[data-buddy-id]');if(buddy){selectedBuddy=buddy.dataset.buddyId;document.querySelectorAll('[data-buddy-id]').forEach((item)=>item.classList.toggle('is-selected',item.dataset.buddyId===selectedBuddy));if(event.detail>=2)openIM(selectedBuddy);return;}
  const buddyAction=target.closest('[data-buddy-action]');if(buddyAction){if(buddyAction.dataset.buddyAction==='im')openIM();else if(buddyAction.dataset.buddyAction==='info'){const b=(legacy.buddyScreenNames||[]).find((item)=>item.id===selectedBuddy);toast(b?`${b.name}: ${b.note}`:'Select a buddy first.');}else toggleSound();return;}
  const file=target.closest('[data-open-file]');if(file){openRecoveredFile(file.dataset.openFile);return;}
  const cd=target.closest('[data-cd-disc]');if(cd){cd.classList.remove('is-spun');void cd.offsetWidth;cd.classList.add('is-spun');const inspected=new Set(JSON.parse(safeGet('kevinception:cds')||'[]'));inspected.add(cd.dataset.cdDisc);safeSet('kevinception:cds',JSON.stringify([...inspected]));const status=cd.closest('.aux-window')?.querySelector('[data-cd-status]');if(status)status.textContent=`Discs inspected: ${inspected.size}`;if(inspected.size>=3)discover('cdrom','cd-collection');playSound('discover');return;}
  if(target.closest('[data-dsl-progress]')){startDslProgress(target.closest('[data-dsl-progress]'));return;}
  if(target.closest('[data-clock-button]')){discover('clock','system-clock');openAux('calendar');return;}
  if(target.closest('[data-degauss]')){degauss();return;}
  if(target.closest('[data-monitor-power]')){setMonitorPower(!monitorOn);return;}
  if(target.closest('[data-brightness-down]')){adjustBrightness(-.1);return;}
  if(target.closest('[data-brightness-up]')){adjustBrightness(.1);return;}
  if(target.closest('[data-exit-screensaver]')){hideScreensaver();return;}
  if(target.closest('[data-kol-logo]')){logoClicks+=1;playSound('click');if(logoClicks>=7){logoClicks=0;discover('logo','logo-clicks');renderKolPage('memory');}return;}
  if(target.closest('[data-kol-minimize]')){kolWindow.classList.add('is-minimized');taskKol?.classList.remove('is-active');return;}
  if(target.closest('[data-kol-maximize]')){kolWindow.classList.toggle('is-maximized');target.closest('[data-kol-maximize]').textContent=kolWindow.classList.contains('is-maximized')?'❐':'□';return;}
  if(target.closest('[data-kol-close]')){kolWindow.classList.add('is-minimized');taskKol?.classList.remove('is-active');playSound('close');return;}
  if(target.closest('[data-fake-end-task]')){showFatalError();return;}
  if(target.closest('[data-close-this-window]')){const win=target.closest('[data-window-id]');if(win)closeAux(win.dataset.windowId);return;}
  if(!target.closest('[data-menu-popup]')&&!target.closest('[data-menu-button]'))closeMenus();
});

root?.addEventListener('submit',(event)=>{
  const xangaSearchForm=event.target.closest('[data-xanga-search-form]');
  if(xangaSearchForm){event.preventDefault();xangaSearchQuery=String(new FormData(xangaSearchForm).get('query')||xangaSearchForm.querySelector('[data-xanga-search-input]')?.value||'').trim();openWebPage('xanga',{push:false});toast(xangaSearchQuery?`Searching KevinY2K’s Xanga for “${xangaSearchQuery}”.`:'Showing all Xanga entries.');return;}
  const mailForm=event.target.closest('[data-kmail-compose-form]');
  if(mailForm){
    event.preventDefault();
    const formData=new FormData(mailForm);
    const sent=getSentMail();
    sent.unshift({id:`sent-${Date.now()}`,to:String(formData.get('to')||''),subject:String(formData.get('subject')||''),body:String(formData.get('body')||''),date:'7/12/00'});
    safeSet('kevinception:sent-mail',JSON.stringify(sent));
    playSound('mail');toast('Your K-Mail has been sent.');renderKolPage('mail',{folder:'sent'});return;
  }
  const xangaForm=event.target.closest('[data-xanga-comment-form]');
  if(xangaForm){
    event.preventDefault();
    const formData=new FormData(xangaForm);const postId=xangaForm.dataset.postId;
    const comments=Array.isArray(xangaState.comments[postId])?xangaState.comments[postId]:[];
    comments.push({name:String(formData.get('name')||getScreenName()),text:String(formData.get('comment')||''),date:'just now'});
    xangaState.comments[postId]=comments;saveXangaState();discover('xanga','xanga-comment');openWebPage('xanga',{push:false});toast('Comment posted to Xanga.');return;
  }
  const form=event.target.closest('[data-im-form]');
  if(!form)return;
  event.preventDefault();
  const input=form.querySelector('[data-im-input]');const message=input?.value.trim();if(!message)return;
  const transcript=form.closest('.aux-window')?.querySelector('[data-im-transcript]');const buddyId=form.dataset.buddyId;const buddy=(legacy.buddyScreenNames||[]).find((item)=>item.id===buddyId);
  transcript.insertAdjacentHTML('beforeend',`<p><b>${escapeHtml(getScreenName())}:</b> ${escapeHtml(message)}</p>`);saveImMessage(buddyId,getScreenName(),message);input.value='';playSound('click');
  setTimeout(()=>{const response=imResponse(buddyId,message);transcript.insertAdjacentHTML('beforeend',`<p><b>${escapeHtml(buddy?.name||'Buddy')}:</b> ${escapeHtml(response)}</p>`);saveImMessage(buddyId,buddy?.name||'Buddy',response);transcript.scrollTop=transcript.scrollHeight;playSound('buddy');},reducedMotion()?0:550);
});

root?.addEventListener('keydown',(event)=>{
  resetIdleTimer();
  if(event.target===keywordInput && event.key==='Enter'){event.preventDefault();navigateKeyword(keywordInput.value);return;}
  if(event.target.matches('[data-browser-address]') && event.key==='Enter'){event.preventDefault();navigateKeyword(event.target.value);return;}
  if(event.target.matches('[data-signon-name],[data-signon-location]') && event.key==='Enter'){event.preventDefault();runDialer();return;}
  if(event.target.closest('[data-mail-message]')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.target.click();return;}
});

document.querySelectorAll('[data-sound-toggle]').forEach((button)=>button.addEventListener('click',toggleSound));
syncSoundControls();
document.querySelector('[data-xennial-help]')?.addEventListener('click',()=>helpDialog?.showModal());
document.querySelector('[data-confirm-shutdown]')?.addEventListener('click',(event)=>{event.preventDefault();confirmShutdown();});
startButton?.addEventListener('click',(event)=>{event.stopPropagation();const opening=startMenu.hidden;startMenu.hidden=!opening;startButton.setAttribute('aria-expanded',String(opening));playSound('click');});
document.addEventListener('click',(event)=>{if(startMenu && !startMenu.hidden && !event.target.closest('[data-start-menu]') && !event.target.closest('[data-start-button]')){startMenu.hidden=true;startButton?.setAttribute('aria-expanded','false');}});
taskKol?.addEventListener('click',()=>{if(kolWindow.classList.contains('is-minimized')){kolWindow.classList.remove('is-minimized');activateWindow('kol');}else if(activeWindowId==='kol'){kolWindow.classList.add('is-minimized');taskKol.classList.remove('is-active');}else activateWindow('kol');playSound('click');});

installDrag(kolWindow,kolWindow?.querySelector('[data-window-titlebar]'));
installDrag(buddyWindow,buddyWindow?.querySelector('[data-window-titlebar]'));
kolWindow?.addEventListener('pointerdown',()=>activateWindow('kol'));
buddyWindow?.addEventListener('pointerdown',()=>activateWindow('buddies'));

addEventListener('pointermove',resetIdleTimer,{passive:true});
addEventListener('keydown',(event)=>{
  if(!fatalError.hidden){event.preventDefault();hideFatalError();return;}
  handleKonami(event.key);
  const interactive=event.target instanceof HTMLElement && event.target.matches('input,textarea,select,[contenteditable="true"]');
  if(!interactive && !event.ctrlKey && !event.altKey && !event.metaKey && /^[1-8]$/.test(event.key)){
    const shortcuts={1:'mail',2:'resume',3:'projects',4:'print',5:'about',6:'www',7:'news'};
    event.preventDefault();
    if(event.key==='8') showBuddies(); else renderKolPage(shortcuts[event.key]);
    return;
  }
  if(event.ctrlKey&&event.altKey&&event.key.toLowerCase()==='k'){event.preventDefault();showFatalError();return;}
  if(event.ctrlKey&&event.altKey&&event.key==='Delete'){event.preventDefault();openAux('taskmanager');return;}
  if(!interactive&&event.key==='Escape'){
    if(!screensaver.hidden){hideScreensaver();return;}
    if(!startMenu.hidden){startMenu.hidden=true;startButton?.setAttribute('aria-expanded','false');return;}
    const active=windows.get(activeWindowId);if(active){closeAux(activeWindowId);return;}
  }
  if(!interactive&&event.altKey&&activeWindowId&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
    const record=activeWindowId==='kol'?{element:kolWindow}:activeWindowId==='buddies'?{element:buddyWindow}:windows.get(activeWindowId);
    if(!record||record.element.classList.contains('is-maximized')||isMobile())return;
    event.preventDefault();const amount=event.shiftKey?40:12;const left=parseFloat(record.element.style.left||getComputedStyle(record.element).left||'0');const top=parseFloat(record.element.style.top||getComputedStyle(record.element).top||'0');if(event.key==='ArrowLeft')record.element.style.left=`${left-amount}px`;if(event.key==='ArrowRight')record.element.style.left=`${left+amount}px`;if(event.key==='ArrowUp')record.element.style.top=`${top-amount}px`;if(event.key==='ArrowDown')record.element.style.top=`${top+amount}px`;clampWindow(record.element);return;
  }
  if(!interactive&&event.key.length===1&&/[a-z]/i.test(event.key)){keyBuffer=(keyBuffer+event.key.toLowerCase()).slice(-5);if(keyBuffer==='kevin'){discover('keyboard','typed-kevin');keyBuffer='';}}
});
addEventListener('resize',()=>{windows.forEach(({element})=>clampWindow(element));clampWindow(buddyWindow);});

updateClock();updateMailBadge();setInterval(updateClock,30000);setInterval(updateOnlineTimers,1000);
if(sessionGet('kevinception:xennial-connected')==='1') {
  bootScreen.hidden=true;dialer.hidden=true;connectionComplete=true;desktopSurface.hidden=false;screen.dataset.screenState='desktop';renderKolPage('welcome',{focus:false});setTimeout(showBuddies,250);
} else {
  setTimeout(()=>completeBoot(),sessionGet('kevinception:xennial-boot')==='1'?(reducedMotion()?0:500):(reducedMotion()?150:2200));
}
track('era_entered',{era:'2000'});
