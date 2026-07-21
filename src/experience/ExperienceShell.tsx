'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMachine } from '@xstate/react';
import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
import { transitionBetween, getAdjacentYear, getYearFromPath, YEAR_ORDER } from './config';
import { ExperienceActionsProvider } from './ExperienceContext';
import { experienceMachine } from './machine';
import { useExperienceStore } from './store';
import { ExperienceOverlay } from './ExperienceOverlay';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';
import { playInterfaceTone } from './audio';

const ExperienceCanvas = dynamic(() => import('./ExperienceCanvas'), {
  ssr: false,
  loading: () => <div className="canvas-loading" role="status"><span></span><p>Loading the technology timeline…</p></div>
});

type UrlView = 'timeline' | 'environment' | 'interface' | 'text';

type LocationState = {
  year: YearId;
  view: UrlView;
  legacyRoute: boolean;
};

function isYear(value: string | null): value is YearId {
  return Boolean(value && YEAR_ORDER.includes(value as YearId));
}

function readLocation(pathname: string, search: string): LocationState {
  const params = new URLSearchParams(search);
  const queryYear = params.get('year');
  const legacyYear = getYearFromPath(pathname);
  const year = isYear(queryYear) ? queryYear : legacyYear ?? '1990';
  const requestedView = params.get('view');
  const legacyRoute = Boolean(legacyYear && pathname !== '/experience' && pathname !== '/experience/');
  if (legacyRoute) return { year, view: 'interface', legacyRoute: true };
  if (!isYear(queryYear)) return { year, view: 'timeline', legacyRoute: false };
  if (requestedView === 'interface' || requestedView === 'text') return { year, view: requestedView, legacyRoute: false };
  return { year, view: 'environment', legacyRoute: false };
}

function experienceUrl(year: YearId, view: Exclude<UrlView, 'timeline'> = 'environment') {
  const suffix = view === 'environment' ? '' : `&view=${view}`;
  return `/experience/?year=${year}${suffix}`;
}

function shouldIgnoreGesture(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, summary, iframe, dialog, [contenteditable="true"], .modal-card, .artifact-drawer, .interface-mode'));
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
  const setMotion = useExperienceStore((state) => state.setMotion);
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
  const lastGestureAt = useRef(0);

  const clearTransitionTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTransitionTimers, [clearTransitionTimers]);

  useEffect(() => {
    const value = typeof machine.value === 'string' ? machine.value : 'environment';
    setViewMode(value as 'timeline' | 'environment' | 'interface' | 'transition' | 'text');
  }, [machine.value, setViewMode]);

  useEffect(() => {
    if (!window.localStorage.getItem('kevinception-v7') && window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMotion('reduced');
  }, [setMotion]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const available = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    setWebgl(available);
    if (!available) send({ type: 'SHOW_TEXT' });
  }, [setWebgl, send]);

  useEffect(() => {
    const syncFromBrowser = () => {
      const location = readLocation(window.location.pathname, window.location.search);
      const currentYear = useExperienceStore.getState().activeYear;
      if (location.year !== currentYear) {
        setActiveYear(location.year);
        recordVisit(location.year);
      }
      send({ type: 'SYNC_VIEW', destination: location.view });
      if (location.legacyRoute) router.replace(experienceUrl(location.year, 'interface'), { scroll: false });
    };
    syncFromBrowser();
    window.addEventListener('popstate', syncFromBrowser);
    return () => window.removeEventListener('popstate', syncFromBrowser);
  }, [pathname, recordVisit, router, send, setActiveYear]);

  const completeTransition = useCallback((destination: 'timeline' | 'environment' | 'interface', delay: number) => {
    timers.current.push(window.setTimeout(() => {
      setTransition(null);
      send({ type: 'END_TRANSITION', destination });
    }, delay));
  }, [send, setTransition]);

  const navigateToYear = useCallback((year: YearId) => {
    if (machine.matches('transitioning')) return;
    if (machine.matches('environment') && year === activeYear) return;
    clearTransitionTimers();
    const duration = motion === 'reduced' ? 40 : 560;
    setTransition({ from: activeYear, to: year, id: 'timeline-fade', startedAt: Date.now() });
    setActiveYear(year);
    recordVisit(year);
    send({ type: 'START_TRANSITION' });
    router.push(experienceUrl(year), { scroll: false });
    playInterfaceTone('transition', sound);
    completeTransition('environment', duration);
  }, [activeYear, clearTransitionTimers, completeTransition, machine, motion, recordVisit, router, send, setActiveYear, setTransition, sound]);

  const enterYear = useCallback((year: YearId = activeYear) => {
    if (machine.matches('transitioning')) return;
    clearTransitionTimers();
    const changingYear = year !== activeYear;
    const duration = motion === 'reduced' ? 50 : changingYear ? 920 : 360;
    setTransition({ from: activeYear, to: year, id: changingYear ? transitionBetween(activeYear, year) : 'timeline-fade', startedAt: Date.now() });
    setActiveYear(year);
    recordVisit(year);
    send({ type: 'START_TRANSITION' });
    router.push(experienceUrl(year, 'interface'), { scroll: false });
    playInterfaceTone(changingYear ? 'transition' : 'click', sound);
    completeTransition('interface', duration);
  }, [activeYear, clearTransitionTimers, completeTransition, machine, motion, recordVisit, router, send, setActiveYear, setTransition, sound]);

  const showTimeline = useCallback(() => {
    if (machine.matches('timeline')) return;
    clearTransitionTimers();
    const duration = motion === 'reduced' ? 40 : 420;
    setTransition({ from: activeYear, to: activeYear, id: 'timeline-fade', startedAt: Date.now() });
    send({ type: 'START_TRANSITION' });
    router.push('/experience/', { scroll: false });
    completeTransition('timeline', duration);
  }, [activeYear, clearTransitionTimers, completeTransition, machine, motion, router, send, setTransition]);

  const openInterface = useCallback(() => enterYear(activeYear), [activeYear, enterYear]);

  const closeInterface = useCallback(() => {
    clearTransitionTimers();
    setTransition(null);
    router.push(experienceUrl(activeYear), { scroll: false });
    send({ type: 'EXIT_INTERFACE' });
    playInterfaceTone('click', sound);
  }, [activeYear, clearTransitionTimers, router, send, setTransition, sound]);

  const showTextMode = useCallback(() => {
    router.push(experienceUrl(activeYear, 'text'), { scroll: false });
    send({ type: 'SHOW_TEXT' });
  }, [activeYear, router, send]);

  const closeTextMode = useCallback(() => {
    router.push(experienceUrl(activeYear), { scroll: false });
    send({ type: 'EXIT_TEXT', destination: 'environment' });
  }, [activeYear, router, send]);

  const discover = useCallback((id: ArtifactId, year: YearId) => {
    discoverArtifact(id, year);
    playInterfaceTone('discover', sound);
  }, [discoverArtifact, sound]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== 'object') return;
      if (event.data.type !== 'kevinception:navigate') return;
      const href = String(event.data.href ?? '');
      const year = getYearFromPath(href);
      if (year) enterYear(year);
      else if (href === '/experience/' || href === '/experience') showTimeline();
      else if (href.startsWith('/')) router.push(href);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [enterYear, router, showTimeline]);

  useEffect(() => {
    const canNavigateTimeline = () => !machine.matches('interface') && !machine.matches('text') && !machine.matches('transitioning') && !settingsOpen && !helpOpen && !artifactsOpen;
    const move = (direction: -1 | 1) => {
      const next = getAdjacentYear(useExperienceStore.getState().activeYear, direction);
      if (next) navigateToYear(next);
    };
    const onTouchStart = (event: TouchEvent) => {
      if (!canNavigateTimeline() || shouldIgnoreGesture(event.target) || event.touches.length !== 1) return;
      touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    };
    const onTouchEnd = (event: TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || !canNavigateTimeline() || event.changedTouches.length !== 1) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) < 54 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
      move(dx < 0 ? 1 : -1);
    };
    const onWheel = (event: WheelEvent) => {
      if (!canNavigateTimeline() || shouldIgnoreGesture(event.target) || event.ctrlKey) return;
      const now = Date.now();
      if (now - lastGestureAt.current < 600) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.7 ? event.deltaX : event.deltaY;
      wheelDistance.current += delta;
      if (Math.abs(wheelDistance.current) < 140) return;
      lastGestureAt.current = now;
      const direction: -1 | 1 = wheelDistance.current > 0 ? 1 : -1;
      wheelDistance.current = 0;
      move(direction);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
    };
  }, [artifactsOpen, helpOpen, machine, navigateToYear, settingsOpen]);

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
        const previous = getAdjacentYear(activeYear, -1);
        if (previous) navigateToYear(previous);
      }
      if (event.key === 'ArrowRight') {
        const next = getAdjacentYear(activeYear, 1);
        if (next) navigateToYear(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeYear, artifactsOpen, closeInterface, closeTextMode, enterYear, helpOpen, machine, navigateToYear, setArtifactsOpen, setHelpOpen, setSettingsOpen, settingsOpen, showTimeline]);

  const actions = useMemo(() => ({ navigateToYear, enterYear, showTimeline, openInterface, closeInterface, showTextMode, closeTextMode, discover }), [navigateToYear, enterYear, showTimeline, openInterface, closeInterface, showTextMode, closeTextMode, discover]);

  return (
    <ExperienceActionsProvider value={actions}>
      <main className="experience-root" data-mode={machine.value}>
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
