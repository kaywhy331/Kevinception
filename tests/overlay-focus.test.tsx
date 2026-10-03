import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { ExperienceOverlay } from '@/experience/ExperienceOverlay';
import { useExperienceStore } from '@/experience/store';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) }));

const emptyArtifacts = {
  'signal-fragment': { discoveredYears: [] },
  'identity-handle': { discoveredYears: [] },
  'project-blueprint': { discoveredYears: [] },
  'next-layer-message': { discoveredYears: [] },
  'human-gate': { discoveredYears: [] }
};

function actions() {
  return { navigateToYear: vi.fn(), enterYear: vi.fn(), showTimeline: vi.fn(), closeInterface: vi.fn(), showTextMode: vi.fn(), closeTextMode: vi.fn(), discover: vi.fn() };
}

function renderOverlay(experienceActions = actions()) {
  render(<ExperienceActionsProvider value={experienceActions}><ExperienceOverlay /></ExperienceActionsProvider>);
  return experienceActions;
}

function key(target: Element, name: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init });
  act(() => { target.dispatchEvent(event); });
  return event;
}

/** Opens the Menu by keyboard-equivalent clicks, then activates one item the way Enter would. */
function openFromMenu(label: string) {
  const trigger = screen.getByRole('button', { name: 'Menu' });
  trigger.focus();
  fireEvent.click(trigger);
  const item = within(screen.getByRole('menu')).getByRole('menuitem', { name: new RegExp(`^${label}`) });
  item.focus();
  fireEvent.click(item);
  return trigger;
}

beforeEach(() => {
  window.history.replaceState(null, '', '/experience/');
  useExperienceStore.setState({
    activeYear: '1990', lastVisitedYear: '1990', viewMode: 'environment', transition: null,
    settingsOpen: false, helpOpen: false, artifactsOpen: false, sound: false, motion: 'full', motionSetting: 'auto',
    qualitySetting: 'auto', webglAvailable: true, artifacts: structuredClone(emptyArtifacts), recentDiscovery: null,
    futureJourney: createInitialFutureJourney(),
    yearVisits: { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 }
  });
  window.localStorage.setItem('kevinception:v7.6-hint', 'seen');
});

afterEach(() => cleanup());

describe('utility menu keyboard model', () => {
  it('focuses the first item on open and moves with arrows, Home and End with wrap-around', () => {
    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const items = within(screen.getByRole('menu')).getAllByRole('menuitem');
    expect(items[0]).toHaveFocus();
    expect(key(items[0], 'ArrowUp').defaultPrevented).toBe(true);
    expect(items[items.length - 1]).toHaveFocus();
    key(items[items.length - 1], 'ArrowDown');
    expect(items[0]).toHaveFocus();
    key(items[0], 'End');
    expect(items[items.length - 1]).toHaveFocus();
    key(items[items.length - 1], 'Home');
    expect(items[0]).toHaveFocus();
  });

  it('closes on Tab without trapping, and on Escape returns focus to the trigger', () => {
    renderOverlay();
    const trigger = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(trigger);
    const first = within(screen.getByRole('menu')).getAllByRole('menuitem')[0];
    expect(key(first, 'Tab').defaultPrevented).toBe(false);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    key(within(screen.getByRole('menu')).getAllByRole('menuitem')[1], 'Escape');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('modal dialogs opened from the menu', () => {
  for (const [label, dialogName, closeName] of [
    ['Settings', 'Experience settings', 'Close settings'],
    ['Help', 'How to explore', 'Close help'],
    ['Artifacts', 'Artifacts', 'Close artifacts']
  ] as const) {
    it(`${label}: safe initial focus, Tab containment, Escape closes once and focus returns to the Menu trigger`, () => {
      renderOverlay();
      const trigger = openFromMenu(label);
      const dialog = screen.getByRole('dialog', { name: dialogName });
      const close = within(dialog).getByRole('button', { name: closeName });
      expect(close).toHaveFocus();
      const focusables = [...dialog.querySelectorAll<HTMLElement>('a[href], button, input')];
      const last = focusables[focusables.length - 1];
      last.focus();
      expect(key(last, 'Tab').defaultPrevented).toBe(true);
      expect(focusables[0]).toHaveFocus();
      expect(key(focusables[0], 'Tab', { shiftKey: true }).defaultPrevented).toBe(true);
      expect(last).toHaveFocus();
      const escape = key(close, 'Escape');
      expect(escape.defaultPrevented).toBe(true);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  }
});

describe('reset confirmation', () => {
  function openConfirmation() {
    useExperienceStore.setState({ settingsOpen: true });
    renderOverlay();
    const dialog = screen.getByRole('dialog', { name: 'Experience settings' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset local progress…' }));
    return dialog;
  }

  it('asks first, defaults focus to Keep progress and does not reset until confirmed', () => {
    const reset = vi.spyOn(useExperienceStore.getState(), 'resetProgress');
    useExperienceStore.setState({ resetProgress: reset });
    const dialog = openConfirmation();
    expect(within(dialog).getByRole('button', { name: 'Keep progress' })).toHaveFocus();
    expect(reset).not.toHaveBeenCalled();
  });

  it('keeps focus inside the dialog after Keep progress so Tab containment and Escape still work', () => {
    const dialog = openConfirmation();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Keep progress' }));
    const again = within(dialog).getByRole('button', { name: 'Reset local progress…' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(again).toHaveFocus();
    expect(key(document.activeElement ?? document.body, 'Escape').defaultPrevented).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape from the confirmation closes the dialog without resetting', () => {
    const reset = vi.fn();
    useExperienceStore.setState({ resetProgress: reset });
    const dialog = openConfirmation();
    key(document.activeElement ?? dialog, 'Escape');
    expect(reset).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Reset progress runs the store reset once and closes the dialog', () => {
    const reset = vi.fn();
    useExperienceStore.setState({ resetProgress: reset });
    const dialog = openConfirmation();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset progress' }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closing and reopening Settings starts from the un-confirmed state', () => {
    const dialog = openConfirmation();
    key(document.activeElement ?? dialog, 'Escape');
    act(() => useExperienceStore.setState({ settingsOpen: true }));
    expect(screen.getByRole('button', { name: 'Reset local progress…' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset progress' })).not.toBeInTheDocument();
  });
});

describe('chapter takeaway in the app interface', () => {
  beforeEach(() => useExperienceStore.setState({ activeYear: '2010', viewMode: 'interface' }));

  it('moves focus into the panel, Escape closes only the takeaway and refocuses its button', () => {
    renderOverlay();
    const button = screen.getByRole('button', { name: /^About chapter/ });
    fireEvent.click(button);
    const panel = screen.getByRole('complementary', { name: /chapter takeaway/ });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveFocus();
    expect(key(panel, 'Escape').defaultPrevented).toBe(true);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when the visible chapter changes', () => {
    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: /^About chapter/ }));
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    act(() => useExperienceStore.setState({ activeYear: '2020' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('Continue hands navigation to enterYear exactly once', () => {
    const spies = renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: /^About chapter/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Continue to/ }));
    expect(spies.enterYear).toHaveBeenCalledTimes(1);
    expect(spies.enterYear).toHaveBeenCalledWith('2020');
  });
});

describe('embedded app frames', () => {
  const frames = () => [...document.querySelectorAll<HTMLIFrameElement>('iframe.interface-mode__frame')];

  it('keeps a bounded two-frame cache with only the active frame in the tab order', () => {
    useExperienceStore.setState({ activeYear: '2010', viewMode: 'interface' });
    renderOverlay();
    expect(frames()).toHaveLength(1);
    act(() => useExperienceStore.setState({ activeYear: '2020' }));
    expect(frames()).toHaveLength(2);
    const [cached, active] = frames();
    expect(cached).toHaveClass('is-cached');
    expect(cached).toHaveAttribute('tabindex', '-1');
    expect(active).toHaveClass('is-active');
    expect(active).toHaveAttribute('tabindex', '0');
    act(() => useExperienceStore.setState({ activeYear: '1990' }));
    expect(frames()).toHaveLength(2);
    expect(frames().map((frame) => frame.title).join('|')).not.toMatch(/StealStreet|2010/);
  });

  it('hides every frame from focus and AT when the interface layer is not visible', () => {
    useExperienceStore.setState({ activeYear: '2010', viewMode: 'interface' });
    renderOverlay();
    act(() => useExperienceStore.setState({ viewMode: 'environment' }));
    const layer = document.querySelector('section.interface-mode') as HTMLElement;
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    // jsdom has no `inert` property; the attribute is what the browser acts on.
    expect(layer).toHaveAttribute('inert');
    frames().forEach((frame) => {
      expect(frame).toHaveClass('is-cached');
      expect(frame).toHaveAttribute('tabindex', '-1');
    });
  });
});
