'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { primaryNavigation } from '@/components/navigation';
import { projects, timelineContent, xennialLegacy, type YearId } from '@/content/data';
import { artifacts } from './artifacts';
import { eraConfigs, getAdjacentYear, getEraCssVariables, YEAR_ORDER } from './config';
import { useExperienceActions } from './ExperienceContext';
import { FutureExperience } from './future/FutureExperience';
import { FutureTextExperience } from './future/FutureTextExperience';
import { coexistenceMoments } from './future/futureWorld';
import { playInterfaceTone, startEraAmbience, type PastSoundYear } from './audio';
import { preloadExperienceScene } from './sceneLoaders';
import { useExperienceStore } from './store';
import type { MotionSetting, QualitySetting } from './types';

const HINT_KEY = 'kevinception:v7.6-hint';
const PREWARM_DELAY = 300;
const TOAST_DURATION = 6500;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (privacy modes); the hint simply shows again next time.
  }
}

function canPrewarmInterface(year: YearId) {
  if (typeof navigator === 'undefined') return false;
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const futureYear = year === '2030' || year === '2040';
  return !futureYear && !device.connection?.saveData && (device.deviceMemory ?? 8) > 4 && navigator.hardwareConcurrency > 4;
}

/** Only the current chapter and the next one are worth warming. */
function isPrewarmCandidate(year: YearId) {
  const activeYear = useExperienceStore.getState().activeYear;
  return year === activeYear || year === getAdjacentYear(activeYear, 1);
}

function requestExperiencePrewarm(year: YearId) {
  if (!isPrewarmCandidate(year)) return;
  if (useExperienceStore.getState().quality !== 'lite') void preloadExperienceScene(year);
  if (!canPrewarmInterface(year)) return;
  window.dispatchEvent(new CustomEvent('kevinception:prewarm', { detail: { year } }));
}

/** Intent-based prewarming: fires after a short hover/focus dwell, not on a sweep. */
function usePrewarmIntent() {
  const timer = useRef<number | null>(null);
  const cancel = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const schedule = useCallback((year: YearId) => {
    cancel();
    timer.current = window.setTimeout(() => requestExperiencePrewarm(year), PREWARM_DELAY);
  }, [cancel]);
  useEffect(() => cancel, [cancel]);
  return { schedule, cancel };
}

/**
 * Modal focus handling: moves focus in on open, traps Tab, closes on Escape
 * (claiming the key with preventDefault), and restores focus on close.
 */
function useModalFocus(open: boolean, container: React.RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = container.current;
    const focusables = () => node ? [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.closest('[hidden]')) : [];
    (node?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? node)?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node?.addEventListener('keydown', onKeyDown);
    return () => {
      node?.removeEventListener('keydown', onKeyDown);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [container, open]);
}

function useFoundCount() {
  const progress = useExperienceStore((state) => state.artifacts);
  return useMemo(() => artifacts.filter((artifact) => progress[artifact.id].discoveredYears.length > 0).length, [progress]);
}

function YearSelector() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const visits = useExperienceStore((state) => state.yearVisits);
  const { navigateToYear } = useExperienceActions();
  const prewarm = usePrewarmIntent();
  return (
    <nav className="year-selector persistent-year-selector" aria-label="Chapters">
      {YEAR_ORDER.map((year) => {
        const config = eraConfigs[year];
        return (
          <button
            key={year}
            type="button"
            data-era={year}
            data-era-texture={config.designLanguage.texture}
            className={activeYear === year ? 'is-active' : ''}
            style={getEraCssVariables(year) as React.CSSProperties}
            onClick={() => navigateToYear(year)}
            onPointerEnter={() => prewarm.schedule(year)}
            onPointerLeave={prewarm.cancel}
            onFocus={() => prewarm.schedule(year)}
            onBlur={prewarm.cancel}
            aria-current={activeYear === year ? 'step' : undefined}
            aria-label={`${year} ${config.chapterName}, experienced through ${config.experienceName}${visits[year] > 0 ? ', visited' : ''}`}
          >
            <span>{year}</span>
            <b>{config.chapterName}</b>
            <em>{config.experienceName}</em>
            {visits[year] > 0 && <small aria-hidden="true">●</small>}
          </button>
        );
      })}
    </nav>
  );
}

/** The Chapters overview: all six rooms are visible in the scene; this panel only names the highlighted one. */
function OverviewPanel() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const lastVisitedYear = useExperienceStore((state) => state.lastVisitedYear);
  const visits = useExperienceStore((state) => state.yearVisits);
  const { navigateToYear } = useExperienceActions();
  const config = eraConfigs[activeYear];
  const returning = Object.values(visits).some((count) => count > 0);
  const continuing = returning && activeYear === lastVisitedYear;
  return (
    <section className="overview-panel glass-panel" aria-labelledby="overview-title" style={getEraCssVariables(activeYear) as React.CSSProperties}>
      <div>
        <p className="eyebrow">Six eras · six rooms</p>
        <h1 id="overview-title">Chapters</h1>
        <p className="overview-panel__selection"><span>{activeYear}</span> {config.chapterName} · {config.experienceName}</p>
      </div>
      <div className="button-row">
        <button className="primary-action" type="button" onClick={() => navigateToYear(activeYear)}>
          {continuing ? `Continue in ${activeYear}` : `Enter ${activeYear}`}
        </button>
        {returning && activeYear !== '1990' && <button className="secondary-action" type="button" onClick={() => navigateToYear('1990')}>Start at 1990</button>}
      </div>
    </section>
  );
}

function ChapterCard() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { enterYear } = useExperienceActions();
  const prewarm = usePrewarmIntent();
  return (
    <section className="environment-panel chapter-card glass-panel" data-era-panel={activeYear} style={getEraCssVariables(activeYear) as React.CSSProperties}>
      <div className="chapter-card__identity">
        <p className="eyebrow">Chapter {config.chapterNumber} of {YEAR_ORDER.length}</p>
        <h1><span>{activeYear}</span> {config.chapterName}</h1>
        <p className="chapter-card__experience">Experienced through <b>{config.experienceName}</b></p>
        <strong>{config.transformation}</strong>
      </div>
      <details className="era-details">
        <summary>Why this chapter matters</summary>
        <div className="chapter-details">
          <p><b>{config.medium}</b></p>
          <p>{config.chapterThesis}</p>
          <ul>{config.capabilityLinks.map((capability) => <li key={capability}>{capability}</li>)}</ul>
        </div>
      </details>
      <div className="button-row chapter-card__actions">
        <button
          className="primary-action"
          type="button"
          onPointerEnter={() => prewarm.schedule(activeYear)}
          onPointerLeave={prewarm.cancel}
          onFocus={() => prewarm.schedule(activeYear)}
          onBlur={prewarm.cancel}
          onClick={() => enterYear(activeYear)}
        >
          {config.enterLabel}
        </button>
      </div>
    </section>
  );
}

function injectEmbeddedFrameChrome(year: YearId, frame: HTMLIFrameElement) {
  try {
    const document = frame.contentDocument;
    if (!document?.head || !document.body) return;
    document.documentElement.dataset.kevinceptionFrame = 'true';

    if (!document.querySelector('[data-kevinception-frame-style]')) {
      const style = document.createElement('style');
      style.dataset.kevinceptionFrameStyle = 'true';
      style.textContent = `
        .era-utility{display:none!important}
        .era-stage{padding-top:0!important}
        .era-guide{top:.65rem!important;max-height:calc(100svh - 1.3rem)!important}
        .kt-stage,.kt-app{height:100svh!important}
        .kb-topbar{top:0!important}
        .kz-utility,.kz-era-bar{display:none!important}
        .kz-shell,.kz-app-shell{min-height:100svh!important}
        .kz-sidebar{top:0!important}
        @media (min-width:761px){.kz-sidebar{height:100svh!important}}
        .kz-topbar{top:0!important}
        .kz-workspace{min-height:calc(100svh - 72px)!important}
        .nexus-shell,.echo-space{min-height:100svh!important}
      `;
      document.head.append(style);
    }

    if (year === '2020') {
      if (!document.querySelector('link[data-kevtok-native-style]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/legacy/assets/styles/kevtok-native.css';
        link.dataset.kevtokNativeStyle = 'true';
        document.head.append(link);
      }
      if (!document.querySelector('script[data-kevtok-native]')) {
        const script = document.createElement('script');
        script.src = '/legacy/assets/client/kevtok-native.js';
        script.dataset.kevtokNative = 'true';
        document.body.append(script);
      }
    }
  } catch {
    // Embedded applications still work when same-origin frame customization is unavailable.
  }
}

/**
 * The era's power-on screen plays on the first visit to that era; afterwards it
 * is skipped automatically. Completion is remembered per era in the store.
 */
function handleEraBoot(year: YearId, frame: HTMLIFrameElement) {
  try {
    const document = frame.contentDocument;
    const boot = document?.querySelector<HTMLElement>('[data-era-boot]');
    const enter = document?.querySelector<HTMLButtonElement>('[data-era-enter]');
    if (!boot || boot.hidden || !enter) return;
    const state = useExperienceStore.getState();
    if (state.bootedYears.includes(year)) enter.click();
    else enter.addEventListener('click', () => useExperienceStore.getState().markBooted(year), { once: true });
  } catch {
    // The embedded application remains usable if frame access is restricted.
  }
}

function InterfaceLayer({ visible }: { visible: boolean }) {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { closeInterface, enterYear } = useExperienceActions();
  const [mountedYears, setMountedYears] = useState<YearId[]>([]);
  const [loadedYears, setLoadedYears] = useState<Partial<Record<YearId, boolean>>>({});
  const [takeawayOpen, setTakeawayOpen] = useState(false);
  const takeawayButton = useRef<HTMLButtonElement>(null);
  const takeawayPanel = useRef<HTMLElement>(null);
  const takeawayId = useId();
  const previous = getAdjacentYear(activeYear, -1);
  const next = getAdjacentYear(activeYear, 1);
  const futureYear = activeYear === '2030' || activeYear === '2040';

  const mountYear = useCallback((year: YearId) => {
    if (year === '2000' || year === '2030' || year === '2040') return;
    setMountedYears((current) => [...current.filter((item) => item !== year), year].slice(-2));
  }, []);

  // An evicted frame reloads from scratch next time, so forget that it had loaded.
  useEffect(() => {
    setLoadedYears((current) => {
      const stale = (Object.keys(current) as YearId[]).filter((year) => !mountedYears.includes(year));
      if (!stale.length) return current;
      const nextLoaded = { ...current };
      stale.forEach((year) => delete nextLoaded[year]);
      return nextLoaded;
    });
  }, [mountedYears]);

  useEffect(() => {
    if (!visible || activeYear === '2030' || activeYear === '2040') return;
    mountYear(activeYear);
  }, [activeYear, mountYear, visible]);

  useEffect(() => {
    setTakeawayOpen(false);
  }, [activeYear, visible]);

  useEffect(() => {
    const listener = (event: Event) => {
      const year = (event as CustomEvent<{ year?: YearId }>).detail?.year;
      if (year && YEAR_ORDER.includes(year) && !loadedYears[year]) mountYear(year);
    };
    window.addEventListener('kevinception:prewarm', listener);
    return () => window.removeEventListener('kevinception:prewarm', listener);
  }, [loadedYears, mountYear]);

  useEffect(() => {
    if (visible || activeYear === '2000' || loadedYears[activeYear] || !canPrewarmInterface(activeYear)) return;
    const timer = window.setTimeout(() => mountYear(activeYear), 1100);
    return () => window.clearTimeout(timer);
  }, [activeYear, loadedYears, mountYear, visible]);

  useEffect(() => {
    if (takeawayOpen) takeawayPanel.current?.focus({ preventScroll: true });
  }, [takeawayOpen]);

  const closeTakeaway = () => {
    setTakeawayOpen(false);
    takeawayButton.current?.focus({ preventScroll: true });
  };

  const onFrameLoad = (year: YearId, frame: HTMLIFrameElement) => {
    setLoadedYears((current) => ({ ...current, [year]: true }));
    injectEmbeddedFrameChrome(year, frame);
    if (year === '2000') return;
    window.setTimeout(() => handleEraBoot(year, frame), 0);
  };

  return (
    <section className={`interface-mode ${visible ? 'is-visible' : 'is-hidden'}`} aria-label={`${activeYear} ${config.chapterName}, ${config.experienceName} interface`} aria-hidden={!visible} inert={!visible}>
      <header className="interface-mode__bar">
        <button className="interface-mode__back" type="button" onClick={closeInterface} aria-label={`Back to the ${activeYear} room`}>
          <i aria-hidden="true">←</i><span>Room</span>
        </button>
        <button
          ref={takeawayButton}
          className="interface-mode__chapter"
          type="button"
          onClick={() => setTakeawayOpen((open) => !open)}
          aria-expanded={takeawayOpen}
          aria-controls={takeawayId}
          aria-label={`About chapter ${config.chapterNumber}, ${config.chapterName}: ${activeYear} ${config.experienceName}`}
        >
          <span>{config.chapterNumber}/{YEAR_ORDER.length} · {config.chapterName}</span>
          <b>{activeYear} {config.experienceName}</b>
          <i aria-hidden="true">▾</i>
        </button>
        <nav className="interface-mode__steps" aria-label="Chapter steps">
          {previous && (
            <button type="button" className="interface-mode__prev" onClick={() => enterYear(previous)} aria-label={`Previous chapter: ${previous} ${eraConfigs[previous].chapterName}`}>
              <i aria-hidden="true">‹</i><span>{previous}</span>
            </button>
          )}
          {next && (
            <button type="button" className="interface-mode__next" onClick={() => enterYear(next)} aria-label={`Next chapter: ${next} ${eraConfigs[next].chapterName}`}>
              <span>Next: <b>{eraConfigs[next].chapterName}</b></span><i aria-hidden="true">›</i>
            </button>
          )}
        </nav>
        <UtilityMenu />
      </header>
      {takeawayOpen && (
        <aside
          ref={takeawayPanel}
          id={takeawayId}
          className="chapter-takeaway-panel"
          aria-label={`${config.chapterName} chapter takeaway`}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            closeTakeaway();
          }}
        >
          <header><p className="eyebrow">What Kevin carried forward</p><button type="button" onClick={closeTakeaway} aria-label="Close takeaway">×</button></header>
          <h2>{config.transformation}</h2>
          <p>{config.lesson}</p>
          <ul>{config.capabilityLinks.map((capability) => <li key={capability}>{capability}</li>)}</ul>
          {config.bridgeToNext && <p className="chapter-bridge">Next: {config.bridgeToNext}</p>}
          {next && <button className="primary-action" type="button" onClick={() => enterYear(next)}>Continue to {eraConfigs[next].chapterName}</button>}
        </aside>
      )}
      <div className="interface-mode__device" style={{ '--era-accent': config.accent } as React.CSSProperties}>
        {futureYear ? <FutureExperience year={activeYear} /> : (
          <>
            {!loadedYears[activeYear] && visible && <div className="interface-loading" aria-hidden="true"><div className="power-on-mark power-on-mark--small"><span>K</span><i></i></div><p>Starting {config.experienceName}…</p><div className="power-on-meter"><i></i></div></div>}
            {mountedYears.map((year) => {
              const yearConfig = eraConfigs[year];
              const isActive = visible && year === activeYear;
              return (
                <iframe
                  key={year}
                  className={`interface-mode__frame ${isActive ? 'is-active' : 'is-cached'}`}
                  src={yearConfig.legacyPath}
                  title={`${yearConfig.experienceName} functional application for the ${yearConfig.chapterName} chapter`}
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
                  loading="eager"
                  tabIndex={isActive ? 0 : -1}
                  onLoad={(event) => onFrameLoad(year, event.currentTarget)}
                />
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}

function TextMode() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const config = eraConfigs[activeYear];
  const artifactProgress = useExperienceStore((state) => state.artifacts);
  const { closeTextMode, discover, navigateToYear } = useExperienceActions();
  const section = useRef<HTMLElement>(null);
  const yearData = timelineContent[activeYear as keyof typeof timelineContent] as unknown as Record<string, unknown> | undefined;
  const featured = projects.slice(0, 3);
  const next = getAdjacentYear(activeYear, 1);
  const discoveryArtifact = artifacts.find((artifact) => artifact.discoveryYear === activeYear);
  const artifactFound = discoveryArtifact ? artifactProgress[discoveryArtifact.id].discoveredYears.length > 0 : false;

  useEffect(() => {
    section.current?.scrollTo?.({ top: 0 });
  }, [activeYear]);

  return (
    <section ref={section} className="text-mode" aria-label={`${activeYear} ${config.chapterName}, text version`}>
      <header>
        {webgl !== false && <button type="button" className="text-mode__visual" onClick={closeTextMode}>← Visual version</button>}
        <nav className="text-mode__chapters" aria-label="Chapters">
          {YEAR_ORDER.map((year) => (
            <button key={year} type="button" aria-current={year === activeYear ? 'step' : undefined} onClick={() => navigateToYear(year)} aria-label={`${year} ${eraConfigs[year].chapterName}`}>{year}</button>
          ))}
        </nav>
        <UtilityMenu />
      </header>
      <article>
        <p className="eyebrow">Chapter {config.chapterNumber} of {YEAR_ORDER.length} · {activeYear}</p>
        <h1 tabIndex={-1}>{config.chapterName}</h1>
        <p className="lead">Experienced through {config.experienceName}. {config.chapterThesis}</p>
        <h2>{config.transformation}</h2>
        <p>{config.lesson}</p>
        <ul className="chapter-capability-list">{config.capabilityLinks.map((capability) => <li key={capability}>{capability}</li>)}</ul>
        {discoveryArtifact && (
          <section className={`text-mode__artifact ${artifactFound ? 'is-found' : ''}`} aria-label={`${discoveryArtifact.title} discovery`}>
            <p className="eyebrow">Cross-era artifact</p>
            <h2>{discoveryArtifact.title}</h2>
            <p>{discoveryArtifact.meaning}</p>
            {artifactFound
              ? <p role="status">Recovered · {discoveryArtifact.transformations[activeYear]}</p>
              : <button type="button" onClick={() => discover(discoveryArtifact.id, activeYear)}>Recover {discoveryArtifact.title}</button>}
          </section>
        )}
        {activeYear === '1990' && yearData && 'channels' in yearData && (
          <div className="text-mode__grid">
            {(yearData.channels as Array<{ number: number; name: string; title: string; body: string }>).map((channel) => (
              <section key={channel.number}><h3>Channel {channel.number}: {channel.name}</h3><b>{channel.title}</b><p>{channel.body}</p></section>
            ))}
          </div>
        )}
        {activeYear === '2000' && (
          <div className="text-mode__grid">
            <section><p className="eyebrow">Kevin Online origin</p><h3>The internet becomes a place</h3><p>{xennialLegacy.intro.lead}</p><p>{xennialLegacy.intro.bridge}</p></section>
            <section><p className="eyebrow">Dial-up identity</p><h3>Choose a screen name and connection</h3><p>Available screen names: {xennialLegacy.signOn.screenNames.join(', ')}.</p><p>Connection profiles: {xennialLegacy.signOn.locations.join(', ')}.</p></section>
            <section><p className="eyebrow">Welcome screen</p><h3>{xennialLegacy.welcome.heading}</h3><p>{xennialLegacy.welcome.announcement}</p><p>{xennialLegacy.welcome.freeHours}</p></section>
          </div>
        )}
        {activeYear === '2010' && yearData && 'orders' in yearData && 'catalog' in yearData && (
          <>
            <h2>One commerce operating system</h2>
            <div className="text-mode__grid">
              <section><p className="eyebrow">Verified operating scale</p><h3>1.5M catalog records · 15+ commerce channels</h3><p>One Stop Deals and StealStreet operations spanned direct-to-consumer, wholesale, Amazon FBA, direct fulfillment, international marketplaces, vendor purchasing, and warehouse fulfillment.</p></section>
              <section><p className="eyebrow">End-to-end lifecycle</p><h3>Vendor → PO → inventory → catalog → marketplace → order → warehouse → customer</h3><p>Customer service, returns, finance, reporting, employees, projects, administration, and automation connected to the same proprietary platform.</p></section>
            </div>
            <h2>Representative cross-channel records</h2>
            <div className="text-mode__grid">
              {(yearData.orders as Array<{ id: string; customer: string; channel: string; payment: string; status: string; fulfillment: string; tracking: string }>).map((order) => (
                <section key={order.id}><p className="eyebrow">{order.channel} · {order.status}</p><h3>{order.id}</h3><p>{order.customer} · {order.payment} · {order.fulfillment} · {order.tracking}</p></section>
              ))}
            </div>
            <h2>Operational intelligence</h2>
            <div className="text-mode__grid">
              <section><p className="eyebrow">Exception-driven operations</p><h3>Needs Attention</h3><p>Orders, purchase orders, inventory, catalog, marketplaces, warehouse, customer service, and finance surface the work that requires operator judgment.</p></section>
              <section><p className="eyebrow">Forecasting and reporting</p><h3>Analysis supports the operating system</h3><p>Demand forecasting, product trajectory, projected stockouts, order lateness, marketplace health, settlements, margin, and COGS inform operational decisions.</p></section>
            </div>
          </>
        )}
        {activeYear === '2020' && yearData && 'clips' in yearData && (
          <div className="text-mode__grid">
            {(yearData.clips as Array<{ hook: string; body: string; category: string }>).map((clip) => (
              <section key={clip.hook}><p className="eyebrow">{clip.category}</p><h3>{clip.hook}</h3><p>{clip.body}</p></section>
            ))}
          </div>
        )}
        {activeYear === '2030' && <FutureTextExperience year="2030" />}
        {activeYear === '2040' && <FutureTextExperience year="2040" />}
        <h2>Kevin’s work in this layer</h2>
        <div className="text-mode__grid">
          {featured.map((project) => <section key={project.slug}><h3>{project.title}</h3><p>{project.summary}</p><Link href={`/work/${project.slug}/`}>Open case study</Link></section>)}
        </div>
        <div className="button-row"><button type="button" onClick={() => navigateToYear(next ?? '1990')}>{next ? `Continue to ${eraConfigs[next].chapterName}` : 'Return to Curiosity'}</button></div>
      </article>
    </section>
  );
}

const QUALITY_OPTIONS: Array<{ value: QualitySetting; label: string; detail: string }> = [
  { value: 'auto', label: 'Auto', detail: 'Matches this device' },
  { value: 'high', label: 'High', detail: 'Shadows, glow, and live screen previews' },
  { value: 'standard', label: 'Standard', detail: 'Balanced detail' },
  { value: 'lite', label: 'Lite', detail: 'Fastest; simplified neighbouring rooms' }
];

const MOTION_OPTIONS: Array<{ value: MotionSetting; label: string; detail: string }> = [
  { value: 'auto', label: 'Auto', detail: 'Follows your system setting' },
  { value: 'full', label: 'Full', detail: 'Camera moves and era transitions' },
  { value: 'reduced', label: 'Reduced', detail: 'Short fades, no drifting or parallax' },
  { value: 'minimal', label: 'Minimal', detail: 'Instant changes, no animation' }
];

function SettingsPanel() {
  const open = useExperienceStore((state) => state.settingsOpen);
  const setOpen = useExperienceStore((state) => state.setSettingsOpen);
  const qualitySetting = useExperienceStore((state) => state.qualitySetting);
  const quality = useExperienceStore((state) => state.quality);
  const setQuality = useExperienceStore((state) => state.setQuality);
  const motionSetting = useExperienceStore((state) => state.motionSetting);
  const motion = useExperienceStore((state) => state.motion);
  const setMotion = useExperienceStore((state) => state.setMotion);
  const sound = useExperienceStore((state) => state.sound);
  const toggleSound = useExperienceStore((state) => state.toggleSound);
  const reset = useExperienceStore((state) => state.resetProgress);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const card = useRef<HTMLElement>(null);
  const close = useCallback(() => {
    setConfirmingReset(false);
    setOpen(false);
  }, [setOpen]);
  useModalFocus(open, card, close);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section ref={card} className="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="experience-settings-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2 id="experience-settings-title">Experience settings</h2><button type="button" data-autofocus onClick={close} aria-label="Close settings">×</button></header>
        <fieldset>
          <legend>Visual quality</legend>
          {QUALITY_OPTIONS.map((option) => (
            <label key={option.value} className="settings-option">
              <input type="radio" name="experience-quality" value={option.value} checked={qualitySetting === option.value} onChange={() => setQuality(option.value)} />
              <span><b>{option.label}</b><small>{option.value === 'auto' ? `${option.detail} (now ${quality})` : option.detail}</small></span>
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Motion</legend>
          {MOTION_OPTIONS.map((option) => (
            <label key={option.value} className="settings-option">
              <input type="radio" name="experience-motion" value={option.value} checked={motionSetting === option.value} onChange={() => setMotion(option.value)} />
              <span><b>{option.label}</b><small>{option.value === 'auto' ? `${option.detail} (now ${motion})` : option.detail}</small></span>
            </label>
          ))}
        </fieldset>
        <button type="button" className="settings-toggle" aria-pressed={sound} onClick={() => { if (!sound) playInterfaceTone('power', true); toggleSound(); }}>Sound effects: {sound ? 'on' : 'off'}</button>
        {confirmingReset ? (
          <div className="settings-reset" role="group" aria-labelledby="reset-confirm-copy">
            <p id="reset-confirm-copy">Clear recovered artifacts, visited chapters, and the future-wing journey in this browser?</p>
            <div className="button-row">
              <button type="button" className="settings-reset__confirm" onClick={() => { reset(); close(); }}>Reset progress</button>
              <button type="button" autoFocus onClick={() => setConfirmingReset(false)}>Keep progress</button>
            </div>
          </div>
        ) : <button type="button" onClick={() => setConfirmingReset(true)}>Reset local progress…</button>}
      </section>
    </div>
  );
}

function ArtifactDrawer() {
  const open = useExperienceStore((state) => state.artifactsOpen);
  const setOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const progress = useExperienceStore((state) => state.artifacts);
  const foundCount = useFoundCount();
  const drawer = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useModalFocus(open, drawer, close);
  if (!open) return null;
  return (
    <div className="modal-backdrop modal-backdrop--drawer" role="presentation" onMouseDown={close}>
      <aside ref={drawer} className="artifact-drawer" role="dialog" aria-modal="true" aria-labelledby="artifact-drawer-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><p className="eyebrow">Kevinception continuity</p><h2 id="artifact-drawer-title">Artifacts</h2></div><button type="button" data-autofocus onClick={close} aria-label="Close artifacts">×</button></header>
        <p>Recover one artifact in each of the first five chapters. Their forms change with the active era; progress remains in this browser only.</p>
        <div className="artifact-drawer__progress"><progress max={artifacts.length} value={foundCount}>{foundCount} of {artifacts.length}</progress><b>{foundCount}/{artifacts.length} recovered</b></div>
        {artifacts.map((artifact) => {
          const years = progress[artifact.id].discoveredYears;
          return <section key={artifact.id} className={years.length ? 'is-found' : ''}><h3>{artifact.title}</h3><p>{artifact.meaning}</p><b>{activeYear}: {artifact.transformations[activeYear]}</b><small>{years.length ? `Recovered in ${years.join(', ')}` : `Not yet recovered · ${artifact.discoveryHint}`}</small></section>;
        })}
        {foundCount === artifacts.length && <section className="artifact-drawer__complete"><p className="eyebrow">Pattern recovered</p><h3>Five signals, one connected story.</h3><p>The containers changed; curiosity, identity, ideas, future signals, and human judgment carried forward.</p><Link href="/work/kevinception/">Read how Kevinception connects the eras →</Link></section>}
      </aside>
    </div>
  );
}

function HelpPanel() {
  const open = useExperienceStore((state) => state.helpOpen);
  const setOpen = useExperienceStore((state) => state.setHelpOpen);
  const card = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useModalFocus(open, card, close);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <section ref={card} className="modal-card" role="dialog" aria-modal="true" aria-labelledby="experience-help-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2 id="experience-help-title">How to explore</h2><button type="button" data-autofocus onClick={close} aria-label="Close help">×</button></header>
        <p>Each chapter is a room. Pick one from Chapters, step inside, then open its era app from the chapter card. Swipe, scroll, or use the arrow keys to move between rooms; click or press any key to skip a transition.</p>
        <dl><dt>← / →</dt><dd>Previous or next chapter</dd><dt>Enter</dt><dd>Open the room’s app</dd><dt>Escape</dt><dd>Close the top layer, then step back toward Chapters</dd><dt>T</dt><dd>Chapters</dd></dl>
        <p>Prefer reading? Use the <b>Text version</b> in the Menu. Everything is also on the regular site:</p>
        <nav className="help-links" aria-label="Site pages"><Link href="/work/">Case studies</Link><Link href="/resume/">Resume</Link><Link href="/about/">About</Link><Link href="/contact/">Contact</Link><Link href="/">Home</Link></nav>
      </section>
    </div>
  );
}

function FirstRunHint({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const startYear = useRef<YearId | null>(null);
  const dismiss = useCallback(() => {
    writeStorage(HINT_KEY, 'seen');
    setOpen(false);
  }, []);
  useEffect(() => {
    if (!visible || readStorage(HINT_KEY)) return;
    setCoarse(typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
    startYear.current = useExperienceStore.getState().activeYear;
    setOpen(true);
  }, [visible]);
  // The hint has done its job once the visitor moves to another chapter.
  useEffect(() => {
    if (open && startYear.current && activeYear !== startYear.current) dismiss();
  }, [activeYear, dismiss, open]);
  if (!visible || !open) return null;
  return (
    <div className="experience-hint">
      <p>{coarse ? 'Swipe to move between the six rooms, then tap the chapter button to open its app.' : 'Scroll or use ← → to move between the six rooms. Press Enter to open the room’s app.'}</p>
      <button type="button" onClick={dismiss}>Got it</button>
    </div>
  );
}

/** One menu at every width: journey utilities plus a way back to the regular site. */
function UtilityMenu() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const viewMode = useExperienceStore((state) => state.viewMode);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const setArtifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const setSettingsOpen = useExperienceStore((state) => state.setSettingsOpen);
  const setHelpOpen = useExperienceStore((state) => state.setHelpOpen);
  const foundCount = useFoundCount();
  const { showTextMode, closeTextMode, showTimeline } = useExperienceActions();

  const items = () => wrapper.current ? [...wrapper.current.querySelectorAll<HTMLElement>('[role="menuitem"]')] : [];

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus({ preventScroll: true });
    const close = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !wrapper.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  const activate = (action: () => void) => {
    setOpen(false);
    action();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
      return;
    }
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const focusAt = (next: number) => list[(next + list.length) % list.length]?.focus();
    if (event.key === 'ArrowDown') { event.preventDefault(); focusAt(index + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusAt(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusAt(0); }
    else if (event.key === 'End') { event.preventDefault(); focusAt(list.length - 1); }
    else if (event.key === 'Tab') setOpen(false);
  };

  return (
    <div className="experience-menu" ref={wrapper} onKeyDown={onKeyDown}>
      <button ref={trigger} type="button" className="experience-menu__trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" aria-controls={open ? menuId : undefined}>Menu</button>
      {open && (
        <div id={menuId} className="experience-menu__popover" role="menu" aria-label="Experience menu">
          <button type="button" role="menuitem" onClick={() => activate(() => setArtifactsOpen(true))}>Artifacts <span>{foundCount}/{artifacts.length}</span></button>
          {webgl !== false && viewMode !== 'timeline' && <button type="button" role="menuitem" onClick={() => activate(showTimeline)}>Chapters</button>}
          {viewMode === 'text'
            ? webgl !== false && <button type="button" role="menuitem" onClick={() => activate(closeTextMode)}>Visual version</button>
            : <button type="button" role="menuitem" onClick={() => activate(showTextMode)}>Text version</button>}
          <button type="button" role="menuitem" onClick={() => activate(() => setSettingsOpen(true))}>Settings</button>
          <button type="button" role="menuitem" onClick={() => activate(() => setHelpOpen(true))}>Help</button>
          <div className="experience-menu__group" role="separator" aria-label="Leave the journey"><span aria-hidden="true">Leave the journey</span></div>
          <Link role="menuitem" href="/" onClick={() => setOpen(false)}>Home</Link>
          {primaryNavigation.filter((item) => item.href !== '/experience/').map((item) => (
            <Link key={item.href} role="menuitem" href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ArtifactChip() {
  const foundCount = useFoundCount();
  const setArtifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  return (
    <button type="button" className="artifact-chip" onClick={() => setArtifactsOpen(true)} aria-label={`Artifacts: ${foundCount} of ${artifacts.length} recovered`}>
      <i aria-hidden="true">◆</i><span>{foundCount}/{artifacts.length}</span>
    </button>
  );
}

/** Shared, era-styled feedback for every new artifact, wherever it was recovered. */
function DiscoveryToast() {
  const recent = useExperienceStore((state) => state.recentDiscovery);
  const clear = useExperienceStore((state) => state.clearRecentDiscovery);
  const setArtifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const foundCount = useFoundCount();
  useEffect(() => {
    if (!recent) return;
    const timer = window.setTimeout(clear, TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [clear, recent]);
  const artifact = recent ? artifacts.find((item) => item.id === recent.id) : null;
  // The text version confirms recovery inline, next to the button that caused it.
  const show = Boolean(recent && artifact && viewMode !== 'text');
  return (
    <div className="discovery-toast-region" role="status" aria-live="polite">
      {show && recent && artifact && (
        <div className="discovery-toast" data-era={recent.year} style={getEraCssVariables(recent.year) as React.CSSProperties}>
          <i className="discovery-toast__mark" aria-hidden="true">◆</i>
          <div>
            <p className="eyebrow">Artifact recovered · {recent.year}</p>
            <strong>{artifact.title}</strong>
            <small>{artifact.transformations[recent.year]}</small>
          </div>
          <button type="button" className="discovery-toast__action" onClick={() => { clear(); setArtifactsOpen(true); }}>View artifacts ({foundCount}/{artifacts.length})</button>
          <button type="button" className="discovery-toast__close" onClick={clear} aria-label="Dismiss">×</button>
        </div>
      )}
    </div>
  );
}

function TransitionOverlay() {
  const transition = useExperienceStore((state) => state.transition);
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  if (!transition || transition.id === 'timeline-fade') return null;
  const from = transition.from ? eraConfigs[transition.from] : null;
  const to = eraConfigs[transition.to];
  const futureHandoff = transition.id === 'agents-to-echo';
  const reverseHandoff = futureHandoff && transition.to === '2030';
  const technicalLine = transition.id === 'time-jump'
    ? `Jumping from ${transition.from ?? 'the present'} to ${transition.to}.`
    : (reverseHandoff ? to : from)?.transitionLine ?? 'Moving through the technology timeline.';
  const moment = coexistenceMoments[coexistence.activeMoment];
  const momentDecision = coexistence.consent[coexistence.activeMoment];
  const handoffLine = coexistence.keptMoments.length
    ? `${coexistence.keptMoments.length} moment${coexistence.keptMoments.length === 1 ? '' : 's'} cross the decade because Kevin said they could.`
    : 'The room crosses the decade. Memory does not—unless Kevin permits it.';
  return (
    <div
      className={`transition-overlay transition-${transition.id}${reverseHandoff ? ' is-reverse' : ''}`}
      aria-hidden="true"
      style={{ '--transition-duration': `${transition.duration}ms` } as React.CSSProperties}
      data-memory={futureHandoff ? `${coexistence.activeMoment}-${momentDecision}` : undefined}
    >
      <span></span>
      {futureHandoff && (
        <div className="future-handoff-visual">
          <i className="future-handoff-node future-handoff-node--source"><b>2030</b><small>LIVING</small></i>
          <div className="future-handoff-rail">
            <em></em><em></em><em></em>
            <div className={`future-handoff-packet is-${momentDecision}`}>
              <i className="future-handoff-mug"><em></em></i>
              <small>{momentDecision === 'kept' ? 'KEPT WITH PERMISSION' : momentDecision === 'refused' ? 'LET GO' : 'FAMILIAR OBJECT'}</small>
              <b>{moment.time} · {moment.place}</b>
            </div>
          </div>
          <i className="future-handoff-node future-handoff-node--target"><b>2040</b><small>BECOMES</small></i>
        </div>
      )}
      <div className="transition-copy">
        {futureHandoff && <small className="transition-copy__kicker">{reverseHandoff ? 'The hologram returns to the living room' : 'A physical gesture becomes memory'}</small>}
        <strong>{from ? `${from.chapterName} → ${to.chapterName}` : to.chapterName}</strong>
        <p>{futureHandoff ? handoffLine : technicalLine}</p>
      </div>
      <small className="transition-skip">Click or press any key to skip</small>
    </div>
  );
}

/** The single polite live region for journey position (transitions and loading stay silent). */
function JourneyAnnouncer() {
  const viewMode = useExperienceStore((state) => state.viewMode);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (viewMode === 'transition') return;
    const config = eraConfigs[activeYear];
    const position = `Chapter ${config.chapterNumber} of ${YEAR_ORDER.length}, ${activeYear} ${config.chapterName}`;
    const next = viewMode === 'timeline'
      ? `Chapters overview. ${activeYear} ${config.chapterName} highlighted.`
      : viewMode === 'interface'
        ? `${config.experienceName} open. ${position}.`
        : viewMode === 'text'
          ? `Text version. ${position}.`
          : `${position}, experienced through ${config.experienceName}.`;
    const timer = window.setTimeout(() => setMessage(next), 350);
    return () => window.clearTimeout(timer);
  }, [activeYear, viewMode]);
  return <div className="sr-only" aria-live="polite">{message}</div>;
}

const PAST_YEARS = new Set<YearId>(['1990', '2000', '2010', '2020']);

/** Quiet room tone while standing in a past era's room with sound on. */
function useEraAmbience() {
  const sound = useExperienceStore((state) => state.sound);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const activeYear = useExperienceStore((state) => state.activeYear);
  useEffect(() => {
    if (!sound || viewMode !== 'environment' || !PAST_YEARS.has(activeYear)) return;
    return startEraAmbience(activeYear as PastSoundYear, true);
  }, [activeYear, sound, viewMode]);
}

/** Moves focus to the primary control of whichever layer just appeared. */
function useLayerFocus(viewMode: string) {
  const previous = useRef(viewMode);
  const settledAt = useRef(0);
  useEffect(() => {
    settledAt.current = performance.now();
  }, []);
  useEffect(() => {
    const from = previous.current;
    previous.current = viewMode;
    // Skip the initial URL sync so a page load does not move focus.
    if (from === viewMode || performance.now() - settledAt.current < 800) return;
    const selector = viewMode === 'interface'
      ? '.interface-mode__chapter'
      : viewMode === 'text'
        ? '.text-mode h1'
        : viewMode === 'environment' && (from === 'interface' || from === 'text' || from === 'timeline')
          ? '.chapter-card .primary-action'
          : viewMode === 'timeline'
            ? '.overview-panel .primary-action'
            : null;
    if (!selector) return;
    const frame = window.requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [viewMode]);
}

export function ExperienceOverlay() {
  const viewMode = useExperienceStore((state) => state.viewMode);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const motion = useExperienceStore((state) => state.motion);
  const modalOpen = useExperienceStore((state) => state.settingsOpen || state.helpOpen || state.artifactsOpen);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const config = eraConfigs[activeYear];
  const { showTimeline } = useExperienceActions();
  useLayerFocus(viewMode);
  useEraAmbience();
  const showToolbar = viewMode !== 'interface' && viewMode !== 'text';
  return (
    <div
      className={`experience-overlay mode-${viewMode}`}
      data-era={activeYear}
      data-era-texture={config.designLanguage.texture}
      data-motion={motion}
      style={getEraCssVariables(activeYear) as React.CSSProperties}
    >
      <div className="experience-layers" inert={modalOpen}>
        {showToolbar && (
          <header className="experience-toolbar">
            <Link className="experience-mark" href="/" aria-label="Kevinception home"><span aria-hidden="true">K</span><b>Kevinception</b></Link>
            <nav aria-label="Journey controls">
              {webgl !== false && <button type="button" onClick={showTimeline} aria-pressed={viewMode === 'timeline'}>Chapters</button>}
              <ArtifactChip />
              <UtilityMenu />
            </nav>
          </header>
        )}
        {viewMode === 'timeline' && <OverviewPanel />}
        {viewMode === 'environment' && <ChapterCard />}
        {(viewMode === 'environment' || viewMode === 'transition') && <YearSelector />}
        {webgl !== false && <InterfaceLayer visible={viewMode === 'interface'} />}
        {viewMode === 'text' && <TextMode />}
        <FirstRunHint visible={viewMode === 'environment'} />
        <DiscoveryToast />
        <TransitionOverlay />
      </div>
      <SettingsPanel />
      <ArtifactDrawer />
      <HelpPanel />
      <JourneyAnnouncer />
    </div>
  );
}
