// @ts-nocheck
import { track } from './global.js';
const cards = [...document.querySelectorAll('[data-era-card]')];
const rail = document.querySelector('[data-era-rail]');
const helpButton = document.querySelector('[data-help-open]');
const dialog = document.querySelector('[data-help-dialog]');
let index = Math.max(0, cards.findIndex((card) => card.dataset.eraId === '2000'));

function select(next, focus = false) {
  index = (next + cards.length) % cards.length;
  cards.forEach((card, cardIndex) => card.classList.toggle('is-selected', cardIndex === index));
  const link = cards[index]?.querySelector('a');
  cards[index]?.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  if (focus) link?.focus({ preventScroll: true });
}
select(index);

rail?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1, true); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1, true); }
  if (event.key === 'Home') { event.preventDefault(); select(0, true); }
  if (event.key === 'End') { event.preventDefault(); select(cards.length - 1, true); }
});
cards.forEach((card, cardIndex) => {
  card.addEventListener('focusin', () => select(cardIndex));
  card.addEventListener('click', () => track('era_selected', { era: card.dataset.eraId }));
});
helpButton?.addEventListener('click', () => dialog?.showModal());
