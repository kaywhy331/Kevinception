'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useMachine } from '@xstate/react';
import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
import { transitionBetween, getAdjacentYear, getYearFromPath } from './config';
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
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const sound = useExperienceStore((state) => state.sound);
  const motion = useExperienceStore((state) => state.motion);

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
    const routeYear = getYearFromPath(pathname);
    if (routeYear) {
      setActiveYear(routeYear);
      recordVisit(routeYear);
      if (!machine.matches('interface') && !machine.matches('transitioning') && !machine.matches('text')) send({ type: 'SHOW_ENVIRONMENT' });
    } else if (pathname === '/experience' || pathname === '/experience/') {
      if (!machine.matches('transitioning') && !machine.matches('text')) send({ type: 'SHOW_TIMELINE' });
    }
    // Route changes are the only trigger; machine state intentionally stays out of this dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navigateToYear = useCallback((year: YearId) => {
    if (machine.matches('transitioning')) return;
    const delay = motion === 'reduced' ? 20 : 520;
    const finish = motion === 'reduced' ? 80 : 1250;
    setTransition({ from: activeYear, to: year, id: transitionBetween(activeYear, year), startedAt: Date.now() });
    setActiveYear(year);
    send({ type: 'START_TRANSITION' });
    playInterfaceTone('transition', sound);
    window.setTimeout(() => router.push(`/experience/${year}/`), delay);
    window.setTimeout(() => {
      setTransition(null);
      send({ type: 'END_TRANSITION', destination: 'environment' });
    }, finish);
  }, [activeYear, machine, motion, router, send, setActiveYear, setTransition, sound]);

  const showTimeline = useCallback(() => {
    if (machine.matches('timeline')) return;
    const delay = motion === 'reduced' ? 20 : 280;
    const finish = motion === 'reduced' ? 80 : 760;
    setTransition({ from: activeYear, to: activeYear, id: 'timeline-fade', startedAt: Date.now() });
    send({ type: 'START_TRANSITION' });
    window.setTimeout(() => router.push('/experience/'), delay);
    window.setTimeout(() => {
      setTransition(null);
      send({ type: 'END_TRANSITION', destination: 'timeline' });
    }, finish);
  }, [activeYear, machine, motion, router, send, setTransition]);

  const openInterface = useCallback(() => {
    playInterfaceTone('click', sound);
    if (pathname === '/experience' || pathname === '/experience/') {
      navigateToYear(activeYear);
      return;
    }
    send({ type: 'ENTER_INTERFACE' });
  }, [activeYear, navigateToYear, pathname, send, sound]);

  const closeInterface = useCallback(() => {
    playInterfaceTone('click', sound);
    send({ type: 'EXIT_INTERFACE' });
  }, [send, sound]);

  const showTextMode = useCallback(() => send({ type: 'SHOW_TEXT' }), [send]);
  const closeTextMode = useCallback(() => send({ type: 'EXIT_TEXT', destination: pathname.startsWith('/experience/') && getYearFromPath(pathname) ? 'environment' : 'timeline' }), [pathname, send]);
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
      if (year) navigateToYear(year);
      else if (href === '/experience/' || href === '/experience') showTimeline();
      else if (href.startsWith('/')) router.push(href);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [navigateToYear, router, showTimeline]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') {
        if (machine.matches('interface')) closeInterface();
        else if (machine.matches('text')) closeTextMode();
        return;
      }
      if (event.key === 'Enter') {
        if (machine.matches('timeline')) navigateToYear(activeYear);
        else if (machine.matches('environment')) openInterface();
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
  }, [activeYear, closeInterface, closeTextMode, machine, navigateToYear, openInterface, showTimeline]);

  const actions = useMemo(() => ({ navigateToYear, showTimeline, openInterface, closeInterface, showTextMode, closeTextMode, discover }), [navigateToYear, showTimeline, openInterface, closeInterface, showTextMode, closeTextMode, discover]);

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
