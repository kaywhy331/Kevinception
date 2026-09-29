import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { ExperienceOverlay } from '@/experience/ExperienceOverlay';
import { ExperienceShell, timelineInputAvailable } from '@/experience/ExperienceShell';
import { overviewPose, responsiveVerticalFov } from '@/experience/CameraRig';
import { experienceDocumentTitle, experienceHref, parseExperienceLocation } from '@/experience/routing';
import { eraConfigs } from '@/experience/config';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';
import { useExperienceStore } from '@/experience/store';

const router = vi.hoisted(() => ({
  push: vi.fn((href: string) => window.history.pushState(null, '', href)),
  replace: vi.fn((href: string) => window.history.replaceState(null, '', href)),
  prefetch: vi.fn()
}));

vi.mock('next/navigation', () => ({ useRouter: () => router }));

const emptyArtifacts = {
  'signal-fragment': { discoveredYears: [] },
  'identity-handle': { discoveredYears: [] },
  'project-blueprint': { discoveredYears: [] },
  'next-layer-message': { discoveredYears: [] },
  'human-gate': { discoveredYears: [] }
};

function actions() {
  return {
    navigateToYear: vi.fn(),
    enterYear: vi.fn(),
    showTimeline: vi.fn(),
    closeInterface: vi.fn(),
    showTextMode: vi.fn(),
    closeTextMode: vi.fn(),
    discover: vi.fn()
  };
}

function renderOverlay(experienceActions = actions()) {
  render(<ExperienceActionsProvider value={experienceActions}><ExperienceOverlay /></ExperienceActionsProvider>);
  return experienceActions;
}

beforeEach(() => {
  window.plausible = undefined;
  window.history.replaceState(null, '', '/experience/');
  useExperienceStore.setState({
    activeYear: '1990',
    lastVisitedYear: '1990',
    viewMode: 'environment',
    transition: null,
    settingsOpen: false,
    helpOpen: false,
    artifactsOpen: false,
    sound: false,
    motion: 'full',
    motionSetting: 'auto',
    qualitySetting: 'auto',
    webglAvailable: true,
    artifacts: structuredClone(emptyArtifacts),
    recentDiscovery: null,
    futureJourney: createInitialFutureJourney(),
    yearVisits: { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 }
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('experience deep links', () => {
  it('uses one path-based scheme and normalises legacy query links', () => {
    expect(experienceHref(null)).toBe('/experience/');
    expect(experienceHref('1990')).toBe('/experience/1990/');
    expect(experienceHref('2000', 'interface')).toBe('/experience/2000/?view=interface');
    expect(experienceHref('2010', 'interface', 'orders')).toBe('/experience/2010/?view=interface&module=orders');
    expect(experienceHref('2020', 'text')).toBe('/experience/2020/?view=text');

    expect(parseExperienceLocation('/experience/', '')).toEqual({ year: null, view: 'timeline', module: null, canonical: true });
    expect(parseExperienceLocation('/experience/1990/', '')).toMatchObject({ year: '1990', view: 'environment', canonical: true });
    expect(parseExperienceLocation('/experience/2010/', '?view=interface&module=administration')).toMatchObject({ year: '2010', view: 'interface', module: 'settings', canonical: false });
    expect(parseExperienceLocation('/experience/', '?year=2000&view=interface')).toMatchObject({ year: '2000', view: 'interface', canonical: false });
    expect(parseExperienceLocation('/experience/', '?year=nope')).toMatchObject({ year: null, view: 'timeline', canonical: false });
  });

  it('titles the tab after the chapter, and after the active StealStreet module in 2010', () => {
    const chapter2010 = `2010 ${eraConfigs['2010'].chapterName} — ${eraConfigs['2010'].experienceName} | Kevinception`;
    expect(experienceDocumentTitle(null, 'timeline')).toBe('Chapters | Kevinception');
    expect(experienceDocumentTitle('2010', 'environment')).toBe(chapter2010);
    expect(experienceDocumentTitle('2010', 'interface', 'dashboard')).toBe(`Operations Dashboard — ${chapter2010}`);
    expect(experienceDocumentTitle('2010', 'interface', 'purchase-orders')).toBe(`Purchase Orders — ${chapter2010}`);
    expect(experienceDocumentTitle('2010', 'interface', 'settings')).toBe(`Settings / Administration — ${chapter2010}`);
    expect(experienceDocumentTitle('2030', 'interface', 'dashboard')).not.toContain('Dashboard');
  });
});

describe('the no-WebGL text path', () => {
  it('lands in the text version and keeps chapter navigation there', async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    window.history.replaceState(null, '', '/experience/');
    render(<ExperienceShell><p>route copy</p></ExperienceShell>);

    await waitFor(() => expect(useExperienceStore.getState().viewMode).toBe('text'));
    expect(useExperienceStore.getState().webglAvailable).toBe(false);
    expect(screen.getByRole('heading', { level: 1, name: 'Curiosity' })).toBeInTheDocument();
    expect(window.location.search).toBe('?view=text');
    // There is no visual version to return to.
    expect(screen.queryByRole('button', { name: /Visual version/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Continue to / }));
    await waitFor(() => expect(useExperienceStore.getState().activeYear).toBe('2000'));
    expect(useExperienceStore.getState().viewMode).toBe('text');
    expect(`${window.location.pathname}${window.location.search}`).toBe('/experience/2000/?view=text');

    // Arrow keys do not pull a reader out of the text version.
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 10)); });
    expect(useExperienceStore.getState()).toMatchObject({ activeYear: '2000', viewMode: 'text' });

    const chapters = screen.getByRole('navigation', { name: 'Chapters' });
    fireEvent.click(within(chapters).getByRole('button', { name: /^2020 / }));
    await waitFor(() => expect(useExperienceStore.getState().activeYear).toBe('2020'));
    expect(useExperienceStore.getState().viewMode).toBe('text');
    getContext.mockRestore();
  });
});

describe('global input gating', () => {
  it('only lets arrows, T, wheel, and swipe act in the overview or a room with no dialog open', () => {
    useExperienceStore.setState({ viewMode: 'environment' });
    expect(timelineInputAvailable()).toBe(true);
    useExperienceStore.setState({ settingsOpen: true });
    expect(timelineInputAvailable()).toBe(false);
    useExperienceStore.setState({ settingsOpen: false, viewMode: 'interface' });
    expect(timelineInputAvailable()).toBe(false);
    useExperienceStore.setState({ viewMode: 'text' });
    expect(timelineInputAvailable()).toBe(false);
  });
});

describe('experience overlay', () => {
  it('offers previous and next chapters from inside an era app', () => {
    useExperienceStore.setState({ activeYear: '2000', viewMode: 'interface' });
    const experienceActions = renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: /^Next chapter: 2010/ }));
    expect(experienceActions.enterYear).toHaveBeenCalledWith('2010');
    fireEvent.click(screen.getByRole('button', { name: /^Previous chapter: 1990/ }));
    expect(experienceActions.enterYear).toHaveBeenCalledWith('1990');
    fireEvent.click(screen.getByRole('button', { name: 'Back to the 2000 room' }));
    expect(experienceActions.closeInterface).toHaveBeenCalled();
  });

  it('keeps a way back to the regular site in the menu, and Escape closes only the menu', () => {
    renderOverlay();
    const trigger = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu', { name: 'Experience menu' });
    for (const [label, href] of [['Home', '/'], ['Case studies', '/work'], ['Resume', '/resume'], ['About', '/about'], ['Contact', '/contact']]) {
      expect(within(menu).getByRole('menuitem', { name: label })).toHaveAttribute('href', href);
    }
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => { within(menu).getAllByRole('menuitem')[0].dispatchEvent(escape); });
    expect(escape.defaultPrevented).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('groups the settings radios, explains them, and confirms before resetting progress', () => {
    useExperienceStore.setState({ settingsOpen: true, artifacts: { ...structuredClone(emptyArtifacts), 'signal-fragment': { discoveredYears: ['1990'] } } });
    renderOverlay();
    const dialog = screen.getByRole('dialog', { name: 'Experience settings' });
    const quality = within(dialog).getAllByRole('radio').filter((radio) => radio.getAttribute('name') === 'experience-quality');
    expect(quality).toHaveLength(4);
    expect(within(dialog).getByText('Minimal')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('radio', { name: /High/ }));
    expect(useExperienceStore.getState().qualitySetting).toBe('high');

    fireEvent.click(within(dialog).getByRole('button', { name: /Reset local progress/ }));
    expect(useExperienceStore.getState().artifacts['signal-fragment'].discoveredYears).toEqual(['1990']);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset progress' }));
    expect(useExperienceStore.getState().artifacts['signal-fragment'].discoveredYears).toEqual([]);
  });

  it('announces every new artifact with a shared toast and a visible counter', () => {
    renderOverlay();
    expect(screen.getByRole('button', { name: 'Artifacts: 0 of 5 recovered' })).toBeInTheDocument();
    act(() => useExperienceStore.getState().discoverArtifact('signal-fragment', '1990'));
    const status = screen.getAllByRole('status').find((node) => node.classList.contains('discovery-toast-region'));
    expect(status).toHaveTextContent(/Artifact recovered · 1990/);
    expect(screen.getByRole('button', { name: 'Artifacts: 1 of 5 recovered' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View artifacts (1/5)' }));
    expect(useExperienceStore.getState().artifactsOpen).toBe(true);
  });

  it('survives blocked storage when showing the first-run hint', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('button', { name: 'Got it' })).not.toBeInTheDocument();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('camera framing', () => {
  it('clamps the vertical field of view and frames all six rooms in the overview', () => {
    expect(responsiveVerticalFov(0.5)).toBe(48);
    expect(responsiveVerticalFov(3.5)).toBe(32);
    const wide = overviewPose(16 / 9);
    expect(wide.target[0]).toBe(0);
    expect(wide.position[2]).toBeGreaterThan(30);
    const tall = overviewPose(0.6);
    expect(tall.position[0]).toBeLessThan(0);
  });
});
