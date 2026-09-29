'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMachine } from '@xstate/react';
import type { YearId } from '@/content/data';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { artifacts, type ArtifactId } from './artifacts';
import { eraConfigs, getAdjacentYear, getTransitionDuration, getYearFromPath, transitionBetween, YEAR_ORDER, type TransitionId } from './config';
import { ExperienceActionsProvider } from './ExperienceContext';
import { experienceMachine } from './machine';
import { useExperienceStore } from './store';
import { ExperienceOverlay } from './ExperienceOverlay';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { playFutureCue, playInterfaceTone } from './audio';
import { getWebGLRendererName, resolveAdaptivePreferences } from './performanceProfile';
import { currentHref, experienceDocumentTitle, experienceHref, normalizeCommerceModule, parseExperienceLocation, type ExperienceView } from './routing';

const ExperienceCanvas = dynamic(() => import('./ExperienceCanvas'), {
  ssr: false,
  loading: () => <div className="canvas-loading" role="status" aria-live="polite"><div className="power-on-mark" aria-hidden="true"><span>K</span><i></i></div><p className="eyebrow">Kevinception system</p><strong>Reconstructing six eras</strong><div className="power-on-meter" aria-hidden="true"><i></i></div><small>Signal · memory · interface</small></div>
});

type HistoryMode = 'push' | 'replace';
type SettledView = Exclude<ExperienceView, 'text'>;
/** A layer (interface or text) opened from its own room, so closing it can step history back. */
type LayerEntry = { href: string; returnHref: string; clean: boolean };

const TYPING_TARGET = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]';
/** Enter on these targets belongs to the element itself, never to the global shortcut. */
const ENTER_OWNED_TARGET = 'button, a, summary, select, input, textarea, iframe, dialog, [role="dialog"], [role="menu"], [role="menuitem"], [contenteditable="true"], [contenteditable=""]';
const GESTURE_IGNORED_TARGET = 'button, a, input, textarea, select, summary, iframe, dialog, [role="dialog"], [contenteditable="true"], .modal-card, .artifact-drawer, .interface-mode, .text-mode';
const WHEEL_THRESHOLD = 60;
const WHEEL_GESTURE_GAP = 220;
const WHEEL_COOLDOWN = 520;

function shouldIgnoreGesture(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(GESTURE_IGNORED_TARGET));
}

/** Arrow keys, T, wheel, and swipe only act in the overview or a room with no dialog open. */
export function timelineInputAvailable() {
  const state = useExperienceStore.getState();
  return (state.viewMode === 'timeline' || state.viewMode === 'environment') && !state.settingsOpen && !state.helpOpen && !state.artifactsOpen;
}

function hasModifier(event: KeyboardEvent) {
  return event.metaKey || event.ctrlKey || event.altKey;
}

/** Same-path URL changes (view, 2010 module) never re-run route metadata, so retitle here. */
function syncDocumentTitle() {
  const { year, view, module } = parseExperienceLocation(window.location.pathname, window.location.search);
  document.title = experienceDocumentTitle(year, view, module);
}

export function ExperienceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [machine, send] = useMachine(experienceMachine);
  const setActiveYear = useExperienceStore((state) => state.setActiveYear);
  const setViewMode = useExperienceStore((state) => state.setViewMode);
  const setTransition = useExperienceStore((state) => state.setTransition);
  const recordVisit = useExperienceStore((state) => state.recordVisit);
  const discoverArtifact = useExperienceStore((state) => state.discoverArtifact);
  const setWebgl = useExperienceStore((state) => state.setWebglAvailable);
  const applyAdaptivePreferences = useExperienceStore((state) => state.applyAdaptivePreferences);
  const setSystemReducedMotion = useExperienceStore((state) => state.setSystemReducedMotion);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const modalOpen = useExperienceStore((state) => state.settingsOpen || state.helpOpen || state.artifactsOpen);
  const timers = useRef<number[]>([]);
  const navigationVersion = useRef(0);
  const pendingDestination = useRef<SettledView | null>(null);
  const pendingPopHref = useRef<string | null>(null);
  const layerEntry = useRef<LayerEntry | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheel = useRef({ distance: 0, consumed: false, lastEvent: 0, cooldownUntil: 0 });

  useEffect(() => {
    const value = typeof machine.value === 'string' ? machine.value : 'environment';
    setViewMode(value as 'timeline' | 'environment' | 'interface' | 'transition' | 'text');
  }, [machine.value, setViewMode]);

  /**
   * Writes the canonical URL. Same-path changes (view/module query) use the
   * History API, which Next.js integrates with its router; path changes go
   * through the router so each chapter's static metadata (title, description,
   * canonical URL) is applied by Next itself.
   */
  const commitUrl = useCallback((href: string, mode: HistoryMode = 'push') => {
    if (currentHref() === href) return;
    const samePath = new URL(href, window.location.origin).pathname === window.location.pathname;
    if (samePath) {
      window.history[mode === 'replace' ? 'replaceState' : 'pushState'](window.history.state, '', href);
      syncDocumentTitle();
      return;
    }
    if (mode === 'replace') router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }, [router]);

  const syncLegacyModule = useCallback((module: string | null) => {
    const frame = document.querySelector<HTMLIFrameElement>('.interface-mode__frame[src*="/legacy/experience/2010/"]');
    frame?.contentWindow?.postMessage({ type: 'kevinception:module-sync', module }, window.location.origin);
  }, []);

  const clearTransitionTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  /** Ends a running transition immediately at its destination (click or key to skip). */
  const skipTransition = useCallback(() => {
    if (!useExperienceStore.getState().transition) return;
    navigationVersion.current += 1;
    clearTransitionTimers();
    setTransition(null);
    const destination = pendingDestination.current ?? 'environment';
    pendingDestination.current = null;
    send({ type: 'END_TRANSITION', destination });
  }, [clearTransitionTimers, send, setTransition]);

  /** Cancels a running transition without settling it; the caller sets the next view. */
  const cancelTransition = useCallback(() => {
    navigationVersion.current += 1;
    clearTransitionTimers();
    pendingDestination.current = null;
    if (useExperienceStore.getState().transition) setTransition(null);
  }, [clearTransitionTimers, setTransition]);

  const settleView = useCallback((destination: ExperienceView) => {
    cancelTransition();
    send({ type: 'SYNC_VIEW', destination });
  }, [cancelTransition, send]);

  const beginTransition = useCallback((from: YearId | null, to: YearId, id: TransitionId, destination: SettledView) => {
    cancelTransition();
    const duration = getTransitionDuration(id, useExperienceStore.getState().motion);
    if (duration <= 0) {
      send({ type: 'SYNC_VIEW', destination });
      return;
    }
    const version = navigationVersion.current;
    pendingDestination.current = destination;
    setTransition({ from, to, id, startedAt: Date.now(), duration });
    send({ type: 'START_TRANSITION' });
    timers.current.push(window.setTimeout(() => {
      if (navigationVersion.current !== version) return;
      pendingDestination.current = null;
      setTransition(null);
      send({ type: 'END_TRANSITION', destination });
    }, duration));
  }, [cancelTransition, send, setTransition]);

  const changeYear = useCallback((year: YearId) => {
    if (useExperienceStore.getState().activeYear === year) return;
    setActiveYear(year);
    recordVisit(year);
  }, [recordVisit, setActiveYear]);

  const syncFromLocation = useCallback(() => {
    const href = currentHref();
    if (pendingPopHref.current) {
      const expected = pendingPopHref.current;
      pendingPopHref.current = null;
      if (expected === href) return;
    }
    const location = parseExperienceLocation(window.location.pathname, window.location.search);
    const state = useExperienceStore.getState();
    let view = location.view;
    let year = location.year;
    // Without WebGL every destination resolves to the text version of its chapter.
    if (state.webglAvailable === false && view !== 'text') {
      view = 'text';
      year = year ?? state.activeYear;
    }
    if (year) changeYear(year);
    layerEntry.current = null;
    settleView(view);
    const canonicalHref = experienceHref(year, view, location.module);
    if (!location.canonical || canonicalHref !== href) commitUrl(canonicalHref, 'replace');
    if (year === '2010' && view === 'interface') window.setTimeout(() => syncLegacyModule(location.module), 60);
    syncDocumentTitle();
  }, [changeYear, commitUrl, settleView, syncLegacyModule]);

  const syncFromLocationRef = useRef(syncFromLocation);
  useEffect(() => { syncFromLocationRef.current = syncFromLocation; }, [syncFromLocation]);

  // Detect WebGL before the first URL sync so a visitor without it lands in the
  // text version instead of being bounced back to an empty 3D view.
  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    applyAdaptivePreferences(resolveAdaptivePreferences({
      deviceMemory: device.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      saveData: Boolean(device.connection?.saveData)
    }));
    let available = false;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      available = Boolean(context);
      if (context) {
        applyAdaptivePreferences(resolveAdaptivePreferences({ rendererName: getWebGLRendererName(context) }));
        context.getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch {
      available = false;
    }
    setWebgl(available);
    syncFromLocationRef.current();
    const onPopState = () => syncFromLocationRef.current();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyAdaptivePreferences, setWebgl]);

  // Follow the operating-system reduced-motion preference live (Auto motion).
  useEffect(() => {
    const media = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (!media) return;
    setSystemReducedMotion(media.matches);
    const onChange = () => setSystemReducedMotion(media.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [setSystemReducedMotion]);

  // Warm every chapter route so era changes apply Next metadata without a wait.
  useEffect(() => {
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const prefetch = () => {
      router.prefetch('/experience/');
      YEAR_ORDER.forEach((year) => router.prefetch(`/experience/${year}/`));
    };
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(prefetch, { timeout: 2500 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(prefetch, 1200);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  /**
   * Moves to a chapter. From the overview the camera flies into the chosen room;
   * between rooms the authored era bridge plays (a time jump for distant eras);
   * inside the text version the visitor stays in text.
   */
  const navigateToYearInternal = useCallback((year: YearId, historyMode: HistoryMode = 'push') => {
    const state = useExperienceStore.getState();
    const fromYear = state.activeYear;
    const settledView = state.transition ? pendingDestination.current : state.viewMode;
    if (settledView === 'text' || state.webglAvailable === false) {
      changeYear(year);
      settleView('text');
      commitUrl(experienceHref(year, 'text'), historyMode);
      return;
    }
    layerEntry.current = null;
    if (settledView === 'timeline' || year === fromYear) {
      // From the overview the highlighted room may already be active; entering it still counts as a visit.
      setActiveYear(year);
      recordVisit(year);
      settleView('environment');
      commitUrl(experienceHref(year, 'environment'), historyMode);
      playInterfaceTone('click', state.sound);
      return;
    }
    const id = transitionBetween(fromYear, year);
    changeYear(year);
    commitUrl(experienceHref(year, 'environment'), historyMode);
    if (id === 'agents-to-echo') playFutureCue('handoff', state.sound);
    else playInterfaceTone('transition', state.sound);
    beginTransition(fromYear, year, id, 'environment');
  }, [beginTransition, changeYear, commitUrl, recordVisit, setActiveYear, settleView]);

  const navigateToYear = useCallback((year: YearId) => navigateToYearInternal(year, 'push'), [navigateToYearInternal]);

  const enterYear = useCallback((year: YearId = useExperienceStore.getState().activeYear) => {
    const state = useExperienceStore.getState();
    if (state.webglAvailable === false) {
      navigateToYearInternal(year, 'push');
      return;
    }
    const fromYear = state.activeYear;
    const changingYear = year !== fromYear;
    const id: TransitionId = changingYear ? transitionBetween(fromYear, year) : 'timeline-fade';
    const interfaceHref = experienceHref(year, 'interface');
    const returnHref = experienceHref(year, 'environment');
    const fromOwnRoom = !changingYear && !state.transition && state.viewMode === 'environment' && currentHref() === returnHref;
    if (changingYear) changeYear(year);
    else recordVisit(year);
    trackAnalyticsEvent('chapter_enter', { year, chapter: eraConfigs[year].chapterName });
    commitUrl(interfaceHref, 'push');
    layerEntry.current = fromOwnRoom ? { href: interfaceHref, returnHref, clean: true } : null;
    if (id === 'agents-to-echo') playFutureCue('handoff', state.sound);
    else playInterfaceTone(changingYear ? 'transition' : 'click', state.sound);
    beginTransition(fromYear, year, id, 'interface');
  }, [beginTransition, changeYear, commitUrl, navigateToYearInternal, recordVisit]);

  /** Leaves a layer opened from its room: step history back when that is the previous entry, else replace. */
  const returnFromLayer = useCallback((expectedView: 'interface' | 'text') => {
    const year = useExperienceStore.getState().activeYear;
    const returnHref = experienceHref(year, 'environment');
    const entry = layerEntry.current;
    layerEntry.current = null;
    settleView('environment');
    const location = parseExperienceLocation(window.location.pathname, window.location.search);
    if (entry?.clean && location.year === year && location.view === expectedView && entry.returnHref === returnHref) {
      pendingPopHref.current = returnHref;
      window.history.back();
      return;
    }
    commitUrl(returnHref, 'replace');
  }, [commitUrl, settleView]);

  const closeInterface = useCallback(() => {
    returnFromLayer('interface');
    playInterfaceTone('click', useExperienceStore.getState().sound);
  }, [returnFromLayer]);

  const showTimeline = useCallback(() => {
    const state = useExperienceStore.getState();
    if (state.webglAvailable === false) return;
    if (state.viewMode === 'timeline' && !state.transition) return;
    layerEntry.current = null;
    settleView('timeline');
    commitUrl('/experience/', 'push');
  }, [commitUrl, settleView]);

  const showTextMode = useCallback(() => {
    const state = useExperienceStore.getState();
    const year = state.activeYear;
    const href = experienceHref(year, 'text');
    const returnHref = experienceHref(year, 'environment');
    const fromOwnRoom = !state.transition && state.viewMode === 'environment' && currentHref() === returnHref;
    settleView('text');
    commitUrl(href, 'push');
    layerEntry.current = fromOwnRoom ? { href, returnHref, clean: true } : null;
  }, [commitUrl, settleView]);

  const closeTextMode = useCallback(() => {
    if (useExperienceStore.getState().webglAvailable === false) return;
    returnFromLayer('text');
  }, [returnFromLayer]);

  /**
   * The single artifact path. Scenes, the text version, the legacy apps (via
   * postMessage), and the future wing all call it, so every new recovery raises
   * the shared discovery toast (store.recentDiscovery).
   */
  const discover = useCallback((id: ArtifactId, year: YearId) => {
    const state = useExperienceStore.getState();
    const alreadyFound = state.artifacts[id].discoveredYears.includes(year);
    discoverArtifact(id, year);
    if (alreadyFound) return;
    trackAnalyticsEvent('artifact_find', { artifact: id, year });
    playInterfaceTone('discover', state.sound);
  }, [discoverArtifact]);

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
        const location = parseExperienceLocation(window.location.pathname, window.location.search);
        if (location.year === '2010') syncLegacyModule(location.module);
        syncDocumentTitle();
        return;
      }
      if (event.data.type === 'kevinception:module') {
        if (useExperienceStore.getState().activeYear !== '2010') return;
        const module = normalizeCommerceModule(String(event.data.module ?? 'home')) ?? 'home';
        const href = experienceHref('2010', 'interface', module);
        if (href !== currentHref()) {
          const replace = event.data.history === 'replace';
          window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', href);
          if (layerEntry.current) layerEntry.current = replace ? { ...layerEntry.current, href } : { ...layerEntry.current, clean: false };
        }
        syncDocumentTitle();
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
  }, [discover, enterYear, router, showTimeline, syncLegacyModule]);

  // Swipe and wheel move one chapter per gesture. In the overview they move the
  // highlighted room; in a room they travel to the neighbouring era.
  useEffect(() => {
    const move = (direction: -1 | 1) => {
      const state = useExperienceStore.getState();
      const next = getAdjacentYear(state.activeYear, direction);
      if (!next) return;
      if (state.viewMode === 'timeline') setActiveYear(next);
      else navigateToYearInternal(next, 'push');
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
      const gesture = wheel.current;
      const now = performance.now();
      if (now - gesture.lastEvent > WHEEL_GESTURE_GAP) {
        gesture.distance = 0;
        gesture.consumed = false;
      }
      gesture.lastEvent = now;
      if (gesture.consumed || now < gesture.cooldownUntil) return;
      const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.7 ? event.deltaX : event.deltaY;
      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 36 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
      const delta = rawDelta * multiplier;
      if (!Number.isFinite(delta)) return;
      gesture.distance += delta;
      if (Math.abs(gesture.distance) < WHEEL_THRESHOLD) return;
      // One gesture (trackpad inertia included) moves exactly one chapter.
      gesture.consumed = true;
      gesture.cooldownUntil = now + WHEEL_COOLDOWN;
      move(gesture.distance > 0 ? 1 : -1);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
    };
  }, [navigateToYearInternal, setActiveYear]);

  // Any click or key during an authored transition skips straight to its end.
  useEffect(() => {
    const onPointerDown = () => {
      if (useExperienceStore.getState().transition) skipTransition();
    };
    window.addEventListener('pointerdown', onPointerDown, { capture: true });
    return () => window.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, [skipTransition]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      // Layers that own a key (menus, dialogs, the takeaway, the future boundary
      // lens) call preventDefault; the global shortcuts then stay out of the way.
      if (event.defaultPrevented) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(TYPING_TARGET)) return;
      const state = useExperienceStore.getState();
      if (state.transition) {
        if (!['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(event.key)) skipTransition();
        return;
      }
      if (event.key === 'Escape') {
        if (state.settingsOpen) state.setSettingsOpen(false);
        else if (state.helpOpen) state.setHelpOpen(false);
        else if (state.artifactsOpen) state.setArtifactsOpen(false);
        else if (state.viewMode === 'interface') closeInterface();
        else if (state.viewMode === 'text') closeTextMode();
        else if (state.viewMode === 'environment') showTimeline();
        return;
      }
      if (hasModifier(event) || event.repeat || !timelineInputAvailable()) return;
      if (event.key === 'Enter') {
        if (target?.closest(ENTER_OWNED_TARGET)) return;
        if (state.viewMode === 'environment') enterYear(state.activeYear);
        else if (state.viewMode === 'timeline') navigateToYear(state.activeYear);
        return;
      }
      if (event.key.toLowerCase() === 't') {
        showTimeline();
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const next = getAdjacentYear(state.activeYear, event.key === 'ArrowLeft' ? -1 : 1);
        if (!next) return;
        if (state.viewMode === 'timeline') setActiveYear(next);
        else navigateToYear(next);
      }
    };
    // Deferred until the whole dispatch has finished, so window listeners
    // registered later (a layer's own Escape handler) can claim the key first.
    const onKey = (event: KeyboardEvent) => { window.setTimeout(() => handleKey(event), 0); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeInterface, closeTextMode, enterYear, navigateToYear, setActiveYear, showTimeline, skipTransition]);

  const actions = useMemo(() => ({ navigateToYear, enterYear, showTimeline, closeInterface, showTextMode, closeTextMode, discover }), [navigateToYear, enterYear, showTimeline, closeInterface, showTextMode, closeTextMode, discover]);
  // The 3D hotspots are real buttons; keep them out of the tab order and away
  // from assistive technology whenever a layer covers the scene.
  const sceneInert = modalOpen || (viewMode !== 'timeline' && viewMode !== 'environment');

  return (
    <ExperienceActionsProvider value={actions}>
      <main id="main-content" className="experience-root" data-mode={machine.value} tabIndex={-1}>
        <ExperienceOverlay />
        {webgl !== false && (
          <div className="experience-scene" inert={sceneInert}>
            <CanvasErrorBoundary onError={() => { setWebgl(false); navigateToYearInternal(useExperienceStore.getState().activeYear, 'replace'); }}>
              <ExperienceCanvas />
            </CanvasErrorBoundary>
          </div>
        )}
        <div className="experience-route-copy" aria-hidden="true">{children}</div>
      </main>
    </ExperienceActionsProvider>
  );
}
