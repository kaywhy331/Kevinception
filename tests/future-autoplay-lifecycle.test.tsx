import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { FutureExperience } from '@/experience/future/FutureExperience';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';
import { useExperienceStore } from '@/experience/store';

const noop = vi.fn();
const actions = {
  navigateToYear: noop, enterYear: noop, showTimeline: noop, openInterface: noop,
  closeInterface: noop, showTextMode: noop, closeTextMode: noop, discover: noop
};

const speak = vi.fn();
const cancel = vi.fn();

function mount(year: '2030' | '2040' = '2030') {
  return render(<ExperienceActionsProvider value={actions}><FutureExperience year={year} /></ExperienceActionsProvider>);
}

const autoplay = () => screen.getByRole('button', { name: /Auto-play/ });
const currentIndex = () => {
  const items = [...document.querySelectorAll('[data-speaker]')];
  return items.findIndex((item) => item.getAttribute('data-current') === 'true');
};
const setView = (viewMode: 'interface' | 'environment' | 'timeline' | 'transition' | 'text') => act(() => { useExperienceStore.setState({ viewMode }); });
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  speak.mockClear();
  cancel.mockClear();
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speak, cancel } });
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
  window.plausible = undefined;
  useExperienceStore.setState({ futureJourney: createInitialFutureJourney(), sound: false, motion: 'full', viewMode: 'interface' });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'speechSynthesis');
});

describe('Auto-play lifecycle (2030)', () => {
  it('advances while the interface is visible', () => {
    mount();
    expect(currentIndex()).toBe(0);
    fireEvent.click(autoplay());
    tick(7_200);
    expect(currentIndex()).toBeGreaterThan(0);
  });

  it.each(['environment', 'timeline', 'transition', 'text'] as const)('does not advance in %s, keeps the pressed toggle, and resumes on return', (hiddenView) => {
    mount();
    fireEvent.click(autoplay());
    setView(hiddenView);
    const frozen = currentIndex();
    tick(60_000);
    expect(currentIndex()).toBe(frozen);
    expect(autoplay()).toHaveAttribute('aria-pressed', 'true');

    setView('interface');
    expect(currentIndex()).toBe(frozen);
    tick(7_200);
    expect(currentIndex()).toBeGreaterThan(frozen);
  });

  it('does not time hidden minutes against the return: a full delay is needed after reopening', () => {
    mount();
    fireEvent.click(autoplay());
    tick(1_000);
    setView('timeline');
    tick(30_000);
    setView('interface');
    const before = currentIndex();
    tick(500);
    expect(currentIndex()).toBe(before);
  });

  it('never starts by itself on return when Auto-play was left off', () => {
    mount();
    setView('timeline');
    setView('interface');
    tick(60_000);
    expect(currentIndex()).toBe(0);
    expect(autoplay()).toHaveAttribute('aria-pressed', 'false');
  });

  it('an explicit pause stays paused across hide and reopen', () => {
    mount();
    fireEvent.click(autoplay());
    fireEvent.click(autoplay());
    expect(autoplay()).toHaveAttribute('aria-pressed', 'false');
    setView('timeline');
    setView('interface');
    tick(60_000);
    expect(currentIndex()).toBe(0);
  });

  it('stops when the active year changes or the chapter unmounts', () => {
    const view = mount('2030');
    fireEvent.click(autoplay());
    const before = vi.getTimerCount();
    expect(before).toBeGreaterThan(0);
    view.rerender(<ExperienceActionsProvider value={actions}><FutureExperience year="2040" /></ExperienceActionsProvider>);
    const afterSwitch = useExperienceStore.getState().futureJourney.coexistence.consent;
    tick(60_000);
    expect(useExperienceStore.getState().futureJourney.coexistence.consent).toEqual(afterSwitch);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels speech when hidden and does not speak again until visible', () => {
    useExperienceStore.setState({ sound: true });
    mount();
    fireEvent.click(autoplay());
    const spoken = speak.mock.calls.length;
    expect(spoken).toBeGreaterThan(0);
    cancel.mockClear();
    setView('timeline');
    expect(cancel).toHaveBeenCalled();
    tick(60_000);
    expect(speak.mock.calls.length).toBe(spoken);
    setView('interface');
    expect(speak.mock.calls.length).toBeGreaterThan(spoken);
  });

  it('cancels speech on unmount', () => {
    useExperienceStore.setState({ sound: true });
    const view = mount();
    fireEvent.click(autoplay());
    cancel.mockClear();
    view.unmount();
    expect(cancel).toHaveBeenCalled();
  });

  it('never advances consent, visible or hidden', () => {
    mount();
    const consent = JSON.stringify(useExperienceStore.getState().futureJourney.coexistence.consent);
    fireEvent.click(autoplay());
    for (let beat = 0; beat < 8; beat += 1) tick(7_200);
    setView('timeline');
    for (let beat = 0; beat < 8; beat += 1) tick(7_200);
    setView('interface');
    for (let beat = 0; beat < 8; beat += 1) tick(7_200);
    expect(JSON.stringify(useExperienceStore.getState().futureJourney.coexistence.consent)).toBe(consent);
  });
});

describe('2040 speech lifecycle', () => {
  it('cancels in-flight speech when the interface is hidden', () => {
    mount('2040');
    fireEvent.click(screen.getByRole('button', { name: 'Turn on sound to hear Kevin' }));
    expect(speak).toHaveBeenCalled();
    cancel.mockClear();
    setView('timeline');
    expect(cancel).toHaveBeenCalled();
  });
});
