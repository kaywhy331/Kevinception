// @ts-nocheck
import { track } from './global.js';
const progress = document.querySelector('[data-reading-progress]');
const update = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  if (progress) progress.style.width = `${ratio * 100}%`;
};
update();
addEventListener('scroll', update, { passive: true });
let depthTracked = false;
addEventListener('scroll', () => {
  if (!depthTracked && scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) > 0.65) {
    depthTracked = true;
    track('project_meaningful_depth', { path: location.pathname });
  }
}, { passive: true });
