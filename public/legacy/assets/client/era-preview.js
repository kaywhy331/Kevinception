// @ts-nocheck
import { track } from './global.js';
track('era_concept_viewed', { era: document.body.className.match(/page-era-([^\s]+)/)?.[1] || 'unknown' });
const year = document.querySelector('.era-preview__year');
if (year && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('pointermove', (event) => {
    const x = event.clientX / innerWidth - 0.5;
    const y = event.clientY / innerHeight - 0.5;
    year.style.transform = `translate3d(${x * 8}px,${y * 8}px,0)`;
  }, { passive: true });
}
