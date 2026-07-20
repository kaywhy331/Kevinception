// @ts-nocheck
import { track } from './global.js';
document.querySelector('[data-print-resume]')?.addEventListener('click', () => {
  track('resume_print_started');
  window.print();
});
