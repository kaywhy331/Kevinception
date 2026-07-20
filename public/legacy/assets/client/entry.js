// @ts-nocheck
import { track } from './global.js';

const page = document.querySelector('[data-entry-page]');
const prologue = document.querySelector('[data-prologue]');
const threshold = document.querySelector('[data-threshold]');
const lines = [...document.querySelectorAll('[data-prologue-line]')];
const skip = document.querySelector('[data-skip-prologue]');
const seenKey = 'kevinception:prologue-seen';
let timers = [];
let complete = false;

function storageGet(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function storageSet(key, value) { try { sessionStorage.setItem(key, value); } catch { /* no-op */ } }
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
function schedule(fn, delay) { const timer = setTimeout(fn, delay); timers.push(timer); }
function finish({ skipped = false } = {}) {
  if (complete) return;
  complete = true;
  clearTimers();
  lines.forEach((line) => line.classList.remove('is-active'));
  prologue?.classList.add('is-complete');
  threshold.hidden = false;
  requestAnimationFrame(() => threshold.classList.add('is-visible'));
  storageSet(seenKey, '1');
  track(skipped ? 'prologue_skipped' : 'prologue_completed');
  setTimeout(() => threshold.querySelector('a')?.focus({ preventScroll: true }), skipped ? 250 : 850);
}

const reduced = document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (storageGet(seenKey) || reduced) {
  prologue.hidden = true;
  threshold.hidden = false;
  threshold.classList.add('is-visible');
} else {
  track('prologue_started');
  lines.forEach((line, index) => {
    schedule(() => {
      lines.forEach((other) => {
        if (other !== line && other.classList.contains('is-active')) {
          other.classList.remove('is-active');
          other.classList.add('is-past');
        }
      });
      line.classList.add('is-active');
    }, 550 + index * 1050);
  });
  schedule(() => finish(), 550 + lines.length * 1050 + 700);
}

skip?.addEventListener('click', () => finish({ skipped: true }));
addEventListener('keydown', (event) => { if (event.key === 'Escape' && !complete && !prologue.hidden) finish({ skipped: true }); });
page?.addEventListener('click', (event) => {
  const link = event.target.closest('[data-enter-timeline]');
  if (link) track('entry_mode_selected', { mode: 'timeline' });
});
