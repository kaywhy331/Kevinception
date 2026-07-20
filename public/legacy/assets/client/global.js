// @ts-nocheck
const root = document.documentElement;
const motionKey = 'kevinception:motion';

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage can be unavailable */ }
}
function preferredMotion() {
  const saved = safeGet(motionKey);
  if (saved === 'reduced' || saved === 'auto') return saved;
  return 'auto';
}
function applyMotion(mode) {
  root.dataset.motion = mode;
  const effectiveReduced = mode === 'reduced' || (mode === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
    button.textContent = effectiveReduced ? 'Motion: reduced' : 'Motion: full';
    button.setAttribute('aria-pressed', String(effectiveReduced));
  });
  dispatchEvent(new CustomEvent('kevinception:motion', { detail: { mode, reduced: effectiveReduced } }));
}
function toggleMotion() {
  const current = preferredMotion();
  const next = current === 'reduced' ? 'auto' : 'reduced';
  safeSet(motionKey, next);
  applyMotion(next);
}

applyMotion(preferredMotion());
matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
  if (preferredMotion() === 'auto') applyMotion('auto');
});
document.querySelectorAll('[data-motion-toggle]').forEach((button) => button.addEventListener('click', toggleMotion));

const header = document.querySelector('[data-site-header]');
if (header) {
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 10);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });
}

const navToggle = document.querySelector('[data-nav-toggle]');
const siteNav = document.querySelector('[data-site-nav]');
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    siteNav.classList.toggle('is-open', !open);
  });
  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
    }
  });
}

const reveals = [...document.querySelectorAll('.reveal')];
const reduced = root.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  reveals.forEach((element) => observer.observe(element));
}

export function toast(message) {
  const region = document.querySelector('[data-toast-region]');
  if (!region) return;
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 3200);
}

export function track(name, detail = {}) {
  dispatchEvent(new CustomEvent('kevinception:analytics', { detail: { name, ...detail } }));
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') console.info('[analytics]', name, detail);
}
