// @ts-nocheck
import { track } from './global.js';
const buttons = [...document.querySelectorAll('[data-filter]')];
const items = [...document.querySelectorAll('[data-project-item]')];
const empty = document.querySelector('[data-filter-empty]');
buttons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  buttons.forEach((other) => { const active = other === button; other.classList.toggle('is-active', active); other.setAttribute('aria-pressed', String(active)); });
  let visible = 0;
  items.forEach((item) => {
    const matches = filter === 'all' || (item.dataset.disciplines || '').split('|').includes(filter);
    item.hidden = !matches;
    if (matches) visible += 1;
  });
  if (empty) empty.hidden = visible !== 0;
  track('work_filter_selected', { filter });
}));
