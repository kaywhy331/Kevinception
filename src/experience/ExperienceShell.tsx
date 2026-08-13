'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useMachine } from '@xstate/react';
import type { YearId } from '@/content/data';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { artifacts, type ArtifactId } from './artifacts';
import { eraConfigs, transitionBetween, getAdjacentYear, getYearFromPath, yearDistance, YEAR_ORDER } from './config';
import { ExperienceActionsProvider } from './ExperienceContext';
import { experienceMachine } from './machine';
import { useExperienceStore } from './store';
import { ExperienceOverlay } from './ExperienceOverlay';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { playInterfaceTone } from './audio';
import { getWebGLRendererName, resolveAdaptivePreferences } from './performanceProfile';

const ExperienceCanvas = dynamic(() => import('./ExperienceCanvas'), {
  ssr: false,
  loading: () => <div className="canvas-loading" role="status" aria-live="polite"><div className="power-on-mark" aria-hidden="true"><span>K</span><i></i></div><p className="eyebrow">Kevinception system</p><strong>Reconstructing six eras</strong><div className="power-on-meter" aria-hidden="true"><i></i></div><small>Signal · memory · interface</small></div>
});

type UrlView = 'timeline' | 'environment' | 'interface' | 'text';
type HistoryMode = 'push' | 'replace';

const COMMERCE_MODULES = new Set([
  'dashboard',
  'orders',
  'purchase-orders',
  'catalog',
  'inventory',
  'marketplaces',
  'vendors',
  'customer-service',
  'warehouse',
  'returns',
  'reports',
  'settings'
]);

type LocationState = {
  year: YearId;
  view: UrlView;
  legacyRoute: boolean;
  module: string | null;
};

function isYear(value: string | null): value is YearId {
  return Boolean(value && YEAR_ORDER.includes(value as YearId));
}

function normalizeCommerceModule(value: string | null) {
  if (!value) return null;
  const normalized = value === 'administration' ? 'settings' : value;
  return COMMERCE_MODULES.has(normalized) ? normalized : null;
}

function moduleNameForTitle(module: string | null) {
  if (!module || module === 'dashboard') return 'Operations Dashboard';
  return module.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    .replace('Settings', 'Settings / Administration');
}

function readLocation(pathname: string, search: string): LocationState {
  const params = new URLSearchParams(search);
  const queryYear = params.get('year');
  const legacyYear = getYearFromPath(pathname);
  const year = isYear(queryYear) ? queryYear : legacyYear ?? '1990';
  const requestedView = params.get('view');
  const module = year === '2010' && (requestedView === 'interface' || params.has('module') || Boolean(legacyYear))
    ? normalizeCommerceModule(params.get('module')) ?? 'dashboard'
    : null;
  const legacyRoute = Boolean(legacyYear && pathname !== '/experience' && pathname !== '/experience/');
  if (legacyRoute) return { year, view: 'interface', legacyRoute: true, module };
  if (!isYear(queryYear)) return { year, view: 'timeline', legacyRoute: false, module };
  if (requestedView === 'text') return { year, view: 'text', legacyRoute: false, module };
  if (requestedView === 'interface' || module) return { year, view: 'interface', legacyRoute: false, module };
  return { year, view: 'environment', legacyRoute: false, module };
}

function experienceUrl(year: YearId, view: Exclude<UrlView, 'timeline'> = 'environment', module: string | null = null) {
  const params = new URLSearchParams({ year });
  const commerceModule = year === '2010' && view === 'interface' ? normalizeCommerceModule(module) ?? 'dashboard' : null;
  if (view !== 'environment' && !commerceModule) params.set('view', view);
  if (commerceModule) params.set('module', commerceModule);
  return `/experience/?${params.toString()}`;
}

function shouldIgnoreGesture(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, summary, iframe, dialog, [contenteditable="true"], .modal-card, .artifact-drawer, .interface-mode'));
}

function timelineInputAvailable() {
  const state = useExperienceStore.getState();
  return state.viewMode !== 'interface' && state.viewMode !== 'text' && !state.settingsOpen && !state.helpOpen && !state.artifactsOpen;
}

export function ExperienceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [machine, send] = useMachine(experienceMachine);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const setActiveYear = useExperienceStore((state) => state.setActiveYear);
  const setViewMode = useExperienceStore((state) => state.setViewMode);
  const setTransition = useExperienceStore((state) => state.setTransition);
  const recordVisit = useExperienceStore((state) => state.recordVisit);
  const discoverArtifact = useExperienceStore((state) => state.discoverArtifact);
  const setWebgl = useExperienceStore((state) => state.setWebglAvailable);
  const applyAdaptivePreferences = useExperienceStore((state) => state.applyAdaptivePreferences);
  const settingsOpen = useExperienceStore((state) => state.settingsOpen);
  const helpOpen = useExperienceStore((state) => state.helpOpen);
  const artifactsOpen = useExperienceStore((state) => state.artifactsOpen);
  const setSettingsOpen = useExperienceStore((state) => state.setSettingsOpen);
  const setHelpOpen = useExperienceStore((state) => state.setHelpOpen);
  const setArtifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const sound = useExperienceStore((state) => state.sound);
  const motion = useExperienceStore((state) => state.motion);
  const timers = useRef<number[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheelDistance = useRef(0);
  const wheelCommitTimer = useRef<number | null>(null);
  const navigationVersion = useRef(0);

  const syncDocumentTitle = useCallback((year: YearId, view: UrlView, module: string | null) => {
    if (view === 'timeline') {
      document.title = 'Timeline | Kevinception';
      return;
    }
    const config = eraConfigs[year];
    const moduleLabel = year === '2010' && view === 'interface' ? moduleNameForTitle(module) : null;
    document.title = `${moduleLabel ? `${moduleLabel} — ` : ''}${year} ${config.experienceName} | Kevinception`;
  }, []);

  const syncLegacyModule = useCallback((module: string | null) => {
    const frame = document.querySelector<HTMLIFrameElement>('.interface-mode__frame[src*="/legacy/experience/2010/"]');
    frame?.contentWindow?.postMessage({ type: 'kevinception:module-sync', module }, window.location.origin);
  }, []);

  const clearTransitionTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const clearWheelTimer = useCallback(() => {
    if (wheelCommitTimer.current !== null) window.clearTimeout(wheelCommitTimer.current);
    wheelCommitTimer.current = null;
  }, []);

  const writeExperienceHistory = useCallback((year: YearId | null, view: UrlView, historyMode: HistoryMode = 'push', module: string | null = null) => {
    const href = view === 'timeline' || !year ? '/experience/' : experienceUrl(year, view, module);
    const method = historyMode === 'replace' ? 'replaceState' : 'pushState';
    const previousState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
    window.history[method]({ ...previousState, kevinception: { year, view, module } }, '', href);
    if (year) syncDocumentTitle(year, view, module);
    else document.title = 'Timeline | Kevinception';
  }, [syncDocumentTitle]);

  useEffect(() => () => {
    clearTransitionTimers();
    clearWheelTimer();
  }, [clearTransitionTimers, clearWheelTimer]);

  useEffect(() => {
    const value = typeof machine.value === 'string' ? machine.value : 'environment';
    setViewMode(value as 'timeline' | 'environment' | 'interface' | 'transition' | 'text');
  }, [machine.value, setViewMode]);

  useEffect(() => {
    const location = readLocation(window.location.pathname, window.location.search);
    syncDocumentTitle(location.year, location.view, location.module);
  }, [activeYear, machine.value, syncDocumentTitle]);

  useLayoutEffect(() => {
    const location = readLocation(window.location.pathname, window.location.search);
    const expectedTitle = location.view === 'timeline'
      ? 'Timeline | Kevinception'
      : `${location.year === '2010' && location.view === 'interface' ? `${moduleNameForTitle(location.module)} — ` : ''}${location.year} ${eraConfigs[location.year].experienceName} | Kevinception`;
    if (document.title === expectedTitle) return;
    document.title = expectedTitle;
    const title = document.head.querySelector('title');
    if (title) title.textContent = expectedTitle;
  });

  useEffect(() => {
    const title = document.head.querySelector('title');
    if (!title) return;
    const observer = new MutationObserver(() => {
      const location = readLocation(window.location.pathname, window.location.search);
      if (location.view === 'timeline') {
        if (document.title !== 'Timeline | Kevinception') document.title = 'Timeline | Kevinception';
        return;
      }
      const expectedTitle = `${location.year === '2010' && location.view === 'interface' ? `${moduleNameForTitle(location.module)} — ` : ''}${location.year} ${eraConfigs[location.year].experienceName} | Kevinception`;
      if (document.title !== expectedTitle) document.title = expectedTitle;
    });
    observer.observe(title, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    applyAdaptivePreferences(resolveAdaptivePreferences({
      viewportWidth: window.innerWidth,
      deviceMemory: device.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      saveData: Boolean(device.connection?.saveData),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }));
  }, [applyAdaptivePreferences]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const available = Boolean(context);
    if (context) {
      applyAdaptivePreferences(resolveAdaptivePreferences({ rendererName: getWebGLRendererName(context) }));
      context.getExtension('WEBGL_lose_context')?.loseContext();
    }
    setWebgl(available);
    if (!available) send({ type: 'SHOW_TEXT' });
  }, [applyAdaptivePreferences, setWebgl, send]);

  useEffect(() => {
    const syncFromBrowser = () => {
      const location = readLocation(window.location.pathname, window.location.search);
      const currentYear = useExperienceStore.getState().activeYear;
      if (location.year !== currentYear) {
        setActiveYear(location.year);
        recordVisit(location.year);
      }
      send({ type: 'SYNC_VIEW', destination: location.view });
      if (location.legacyRoute) writeExperienceHistory(location.year, 'interface', 'replace', location.module);
      else if (location.year === '2010' && location.view === 'interface' && !new URLSearchParams(window.location.search).has('module')) {
        writeExperienceHistory(location.year, 'interface', 'replace', location.module);
      }
      syncDocumentTitle(location.year, location.view, location.module);
      window.setTimeout(() => syncLegacyModule(location.year === '2010' ? location.module : null), 60);
    };
    syncFromBrowser();
    window.addEventListener('popstate', syncFromBrowser);
    return () => window.removeEventListener('popstate', syncFromBrowser);
  }, [pathname, recordVisit, send, setActiveYear, syncDocumentTitle, syncLegacyModule, writeExperienceHistory]);

  const completeTransition = useCallback((destination: 'timeline' | 'environment' | 'interface', delay: number, version: number) => {
    timers.current.push(window.setTimeout(() => {
      if (navigationVersion.current !== version) return;
      setTransition(null);
      send({ type: 'END_TRANSITION', destination });
    }, delay));
  }, [send, setTransition]);

  const interruptTransition = useCallback((destination: 'timeline' | 'environment' = 'environment') => {
    if (!useExperienceStore.getState().transition) return;
    navigationVersion.current += 1;
    clearTransitionTimers();
    setTransition(null);
    send({ type: 'SYNC_VIEW', destination });
  }, [clearTransitionTimers, send, setTransition]);

  const navigateToYearInternal = useCallback((year: YearId, historyMode: HistoryMode = 'push') => {
    const fromYear = useExperienceStore.getState().activeYear;
    const currentView = useExperienceStore.getState().viewMode;
    if (useExperienceStore.getState().transition) interruptTransition('environment');
    if (year === fromYear) {
      if (currentView === 'timeline') {
        writeExperienceHistory(year, 'environment', historyMode);
        send({ type: 'SHOW_ENVIRONMENT' });
      }
      return;
    }
    clearTransitionTimers();
    const distance = yearDistance(fromYear, year);
    const id = distance > 1 ? 'time-jump' : 'timeline-fade';
    const duration = motion === 'reduced' ? 24 : distance > 1 ? 300 : 420;
    const version = ++navigationVersion.current;
    setTransition({ from: fromYear, to: year, id, startedAt: Date.now() });
    setActiveYear(year);
    recordVisit(year);
    send({ type: 'START_TRANSITION' });
    writeExperienceHistory(year, 'environment', historyMode);
    playInterfaceTone('transition', sound);
    completeTransition('environment', duration, version);
  }, [clearTransitionTimers, completeTransition, interruptTransition, motion, recordVisit, send, setActiveYear, setTransition, sound, writeExperienceHistory]);

  const navigateToYear = useCallback((year: YearId) => navigateToYearInternal(year, 'push'), [navigateToYearInternal]);

  const enterYear = useCallback((year: YearId = useExperienceStore.getState().activeYear) => {
    const fromYear = useExperienceStore.getState().activeYear;
    if (useExperienceStore.getState().transition) interruptTransition('environment');
    clearTransitionTimers();
    const changingYear = year !== fromYear;
    const id = changingYear ? transitionBetween(fromYear, year) : 'timeline-fade';
    const duration = motion === 'reduced' ? 36 : id === 'time-jump' ? 390 : changingYear ? 660 : 250;
    const version = ++navigationVersion.current;
    setTransition({ from: fromYear, to: year, id, startedAt: Date.now() });
    setActiveYear(year);
    recordVisit(year);
    trackAnalyticsEvent('chapter_enter', { year, chapter: eraConfigs[year].chapterName });
    send({ type: 'START_TRANSITION' });
    writeExperienceHistory(year, 'interface');
    playInterfaceTone(changingYear ? 'transition' : 'click', sound);
    completeTransition('interface', duration, version);
  }, [clearTransitionTimers, completeTransition, interruptTransition, motion, recordVisit, send, setActiveYear, setTransition, sound, writeExperienceHistory]);

  const showTimeline = useCallback(() => {
    const currentYear = useExperienceStore.getState().activeYear;
    const currentView = useExperienceStore.getState().viewMode;
    if (currentView === 'timeline' && !useExperienceStore.getState().transition) return;
    if (useExperienceStore.getState().transition) interruptTransition('timeline');
    clearTransitionTimers();
    const duration = motion === 'reduced' ? 24 : 300;
    const version = ++navigationVersion.current;
    setTransition({ from: currentYear, to: currentYear, id: 'timeline-fade', startedAt: Date.now() });
    send({ type: 'START_TRANSITION' });
    writeExperienceHistory(null, 'timeline');
    completeTransition('timeline', duration, version);
  }, [clearTransitionTimers, completeTransition, interruptTransition, motion, send, setTransition, writeExperienceHistory]);

  const openInterface = useCallback(() => enterYear(useExperienceStore.getState().activeYear), [enterYear]);

  const closeInterface = useCallback(() => {
    const currentYear = useExperienceStore.getState().activeYear;
    navigationVersion.current += 1;
    clearTransitionTimers();
    setTransition(null);
    writeExperienceHistory(currentYear, 'environment');
    send({ type: 'EXIT_INTERFACE' });
    playInterfaceTone('click', sound);
  }, [clearTransitionTimers, send, setTransition, sound, writeExperienceHistory]);

  const showTextMode = useCallback(() => {
    const currentYear = useExperienceStore.getState().activeYear;
    writeExperienceHistory(currentYear, 'text');
    send({ type: 'SHOW_TEXT' });
  }, [send, writeExperienceHistory]);

  const closeTextMode = useCallback(() => {
    const currentYear = useExperienceStore.getState().activeYear;
    writeExperienceHistory(currentYear, 'environment');
    send({ type: 'EXIT_TEXT', destination: 'environment' });
  }, [send, writeExperienceHistory]);

  const discover = useCallback((id: ArtifactId, year: YearId) => {
    const alreadyFound = useExperienceStore.getState().artifacts[id].discoveredYears.includes(year);
    discoverArtifact(id, year);
    if (!alreadyFound) trackAnalyticsEvent('artifact_find', { artifact: id, year });
    playInterfaceTone('discover', sound);
  }, [discoverArtifact, sound]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'kevinception:artifact') {
        const id = String(event.data.id ?? '') as ArtifactId;
        const year = String(event.data.year ?? '') as YearId;
        if (artifacts.some((artifact) => artifact.id === id) && YEAR_ORDER.includes(year)) discover(id, year);
        return;
      }
      if (event.data.type === 'kevinception:legacy-ready') {
        const location = readLocation(window.location.pathname, window.location.search);
        if (location.year === '2010') syncLegacyModule(location.module);
        return;
      }
      if (event.data.type === 'kevinception:module') {
        if (useExperienceStore.getState().activeYear !== '2010') return;
        const module = normalizeCommerceModule(String(event.data.module ?? 'dashboard')) ?? 'dashboard';
        const href = experienceUrl('2010', 'interface', module);
        const method = event.data.history === 'replace' ? 'replaceState' : 'pushState';
        const previousState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
        window.history[method]({ ...previousState, kevinception: { year: '2010', view: 'interface', module } }, '', href);
        syncDocumentTitle('2010', 'interface', module);
        syncLegacyModule(module);
        return;
      }
      if (event.data.type !== 'kevinception:navigate') return;
      const href = String(event.data.href ?? '');
      const year = getYearFromPath(href);
      if (year) enterYear(year);
      else if (href === '/experience/' || href === '/experience') showTimeline();
      else if (href.startsWith('/')) router.push(href);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [discover, enterYear, router, showTimeline, syncDocumentTitle, syncLegacyModule]);

  useEffect(() => {
    const move = (direction: -1 | 1, historyMode: HistoryMode = 'replace') => {
      const currentYear = useExperienceStore.getState().activeYear;
      const next = getAdjacentYear(currentYear, direction);
      if (next) navigateToYearInternal(next, historyMode);
    };
    const commitWheelNavigation = () => {
      wheelCommitTimer.current = null;
      if (!timelineInputAvailable()) {
        wheelDistance.current = 0;
        return;
      }
      const total = wheelDistance.current;
      wheelDistance.current = 0;
      if (Math.abs(total) < 45) return;
      const currentYear = useExperienceStore.getState().activeYear;
      const currentIndex = YEAR_ORDER.indexOf(currentYear);
      const steps = Math.min(YEAR_ORDER.length - 1, Math.max(1, Math.ceil(Math.abs(total) / 180)));
      const direction = total > 0 ? 1 : -1;
      const targetIndex = Math.max(0, Math.min(YEAR_ORDER.length - 1, currentIndex + direction * steps));
      const target = YEAR_ORDER[targetIndex];
      if (target && target !== currentYear) navigateToYearInternal(target, 'replace');
    };
    const onTouchStart = (event: TouchEvent) => {
      if (!timelineInputAvailable() || shouldIgnoreGesture(event.target) || event.touches.length !== 1) return;
      touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const onTouchEnd = (event: TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || !timelineInputAvailable() || event.changedTouches.length !== 1) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) < 54 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
      move(dx < 0 ? 1 : -1);
    };
    const onWheel = (event: WheelEvent) => {
      if (!timelineInputAvailable() || shouldIgnoreGesture(event.target) || event.ctrlKey) return;
      const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.7 ? event.deltaX : event.deltaY;
      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 36 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
      const normalizedDelta = rawDelta * multiplier;
      if (!Number.isFinite(normalizedDelta) || Math.abs(normalizedDelta) < 1) return;
      wheelDistance.current += normalizedDelta;
      clearWheelTimer();
      wheelCommitTimer.current = window.setTimeout(commitWheelNavigation, 90);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
      clearWheelTimer();
      wheelDistance.current = 0;
    };
  }, [clearWheelTimer, navigateToYearInternal]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') {
        if (settingsOpen) setSettingsOpen(false);
        else if (helpOpen) setHelpOpen(false);
        else if (artifactsOpen) setArtifactsOpen(false);
        else if (machine.matches('interface')) closeInterface();
        else if (machine.matches('text')) closeTextMode();
        else if (machine.matches('environment')) showTimeline();
        return;
      }
      if (event.key === 'Enter') {
        if (machine.matches('timeline') || machine.matches('environment')) enterYear(activeYear);
        return;
      }
      if (event.key.toLowerCase() === 't') { showTimeline(); return; }
      if (event.key === 'ArrowLeft') {
        const previous = getAdjacentYear(useExperienceStore.getState().activeYear, -1);
        if (previous) navigateToYear(previous);
      }
      if (event.key === 'ArrowRight') {
        const next = getAdjacentYear(useExperienceStore.getState().activeYear, 1);
        if (next) navigateToYear(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeYear, artifactsOpen, closeInterface, closeTextMode, enterYear, helpOpen, machine, navigateToYear, setArtifactsOpen, setHelpOpen, setSettingsOpen, settingsOpen, showTimeline]);

  const actions = useMemo(() => ({ navigateToYear, enterYear, showTimeline, openInterface, closeInterface, showTextMode, closeTextMode, discover }), [navigateToYear, enterYear, showTimeline, openInterface, closeInterface, showTextMode, closeTextMode, discover]);

  return (
    <ExperienceActionsProvider value={actions}>
      <main id="main-content" className="experience-root" data-mode={machine.value} tabIndex={-1}>
        {webgl !== false && (
          <CanvasErrorBoundary onError={() => { setWebgl(false); send({ type: 'SHOW_TEXT' }); }}>
            <ExperienceCanvas />
          </CanvasErrorBoundary>
        )}
        <ExperienceOverlay />
        <div className="experience-route-copy" aria-hidden="true">{children}</div>
      </main>
    </ExperienceActionsProvider>
  );
}
