'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { projects, timelineContent, xennialLegacy, type YearId } from '@/content/data';
import { artifacts } from './artifacts';
import { eraConfigs, getAdjacentYear, YEAR_ORDER } from './config';
import { useExperienceActions } from './ExperienceContext';
import { preloadExperienceScene } from './sceneLoaders';
import { useExperienceStore } from './store';

function canPrewarmInterface(year: YearId) {
  if (typeof navigator === 'undefined') return false;
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const futureYear = year === '2030' || year === '2040';
  return !device.connection?.saveData && (futureYear || ((device.deviceMemory ?? 8) > 4 && navigator.hardwareConcurrency > 4));
}

function requestExperiencePrewarm(year: YearId) {
  if (useExperienceStore.getState().quality !== 'lite') void preloadExperienceScene(year);
  if (!canPrewarmInterface(year)) return;
  window.dispatchEvent(new CustomEvent('kevinception:prewarm', { detail: { year } }));
}

function YearSelector() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const visits = useExperienceStore((state) => state.yearVisits);
  const { navigateToYear } = useExperienceActions();
  return (
    <nav className="year-selector persistent-year-selector" aria-label="Technology chapters">
      {YEAR_ORDER.map((year) => {
        const config = eraConfigs[year];
        return (
          <button
            key={year}
            type="button"
            className={activeYear === year ? 'is-active' : ''}
            style={{ '--era-accent': config.accent } as React.CSSProperties}
            onClick={() => navigateToYear(year)}
            onPointerEnter={() => requestExperiencePrewarm(year)}
            onFocus={() => requestExperiencePrewarm(year)}
            onTouchStart={() => requestExperiencePrewarm(year)}
            aria-current={activeYear === year ? 'step' : undefined}
            aria-label={`${year} ${config.chapterName}, experienced through ${config.experienceName}`}
          >
            <span>{year}</span>
            <b>{config.chapterName}</b>
            <em>{config.experienceName}</em>
            {visits[year] > 0 && <small aria-label={`${visits[year]} visits`}>●</small>}
          </button>
        );
      })}
    </nav>
  );
}

function ChapterCard({ mode }: { mode: 'timeline' | 'environment' }) {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { enterYear } = useExperienceActions();
  const panelClass = mode === 'timeline' ? 'timeline-panel' : 'environment-panel';
  return (
    <section className={`${panelClass} chapter-card glass-panel`} style={{ '--era-accent': config.accent } as React.CSSProperties}>
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
          onPointerEnter={() => requestExperiencePrewarm(activeYear)}
          onFocus={() => requestExperiencePrewarm(activeYear)}
          onTouchStart={() => requestExperiencePrewarm(activeYear)}
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

function InterfaceLayer({ visible }: { visible: boolean }) {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { closeInterface, enterYear, showTimeline } = useExperienceActions();
  const [mountedYears, setMountedYears] = useState<YearId[]>([]);
  const [loadedYears, setLoadedYears] = useState<Partial<Record<YearId, boolean>>>({});
  const [takeawayOpen, setTakeawayOpen] = useState(false);
  const next = getAdjacentYear(activeYear, 1);

  const mountYear = (year: YearId) => {
    if (year === '2000') return;
    setMountedYears((current) => {
      const withoutYear = current.filter((item) => item !== year);
      return [...withoutYear, year].slice(-2);
    });
  };

  useEffect(() => {
    if (!visible) return;
    setMountedYears((current) => {
      const withoutActive = current.filter((year) => year !== activeYear);
      return [...withoutActive, activeYear].slice(-2);
    });
  }, [activeYear, visible]);

  useEffect(() => {
    setTakeawayOpen(false);
  }, [activeYear]);

  useEffect(() => {
    const listener = (event: Event) => {
      const year = (event as CustomEvent<{ year?: YearId }>).detail?.year;
      if (year && YEAR_ORDER.includes(year) && !loadedYears[year]) mountYear(year);
    };
    window.addEventListener('kevinception:prewarm', listener);
    return () => window.removeEventListener('kevinception:prewarm', listener);
  }, [loadedYears]);

  useEffect(() => {
    if (visible || activeYear === '2000' || loadedYears[activeYear] || !canPrewarmInterface(activeYear)) return;
    const timer = window.setTimeout(() => mountYear(activeYear), 1100);
    return () => window.clearTimeout(timer);
  }, [activeYear, loadedYears, visible]);

  const onFrameLoad = (year: YearId, frame: HTMLIFrameElement) => {
    setLoadedYears((current) => ({ ...current, [year]: true }));
    injectEmbeddedFrameChrome(year, frame);
    if (year === '2000') return;
    window.setTimeout(() => {
      try {
        const document = frame.contentDocument;
        const boot = document?.querySelector<HTMLElement>('[data-era-boot]');
        const enter = document?.querySelector<HTMLButtonElement>('[data-era-enter]');
        if (boot && !boot.hidden && enter) enter.click();
      } catch {
        // The embedded application remains usable if frame access is restricted.
      }
    }, 0);
  };

  return (
    <section className={`interface-mode ${visible ? 'is-visible' : 'is-hidden'}`} aria-label={`${activeYear} ${config.chapterName}, ${config.experienceName} interface`} aria-hidden={!visible}>
      <header className="interface-mode__bar">
        <button
          className="interface-mode__chapter"
          type="button"
          onClick={() => setTakeawayOpen((open) => !open)}
          aria-expanded={takeawayOpen}
          aria-label={`Open ${config.chapterName} chapter takeaway`}
        >
          <span>{config.chapterNumber}/{YEAR_ORDER.length} · {config.chapterName}</span>
          <b>{activeYear} {config.experienceName}</b>
        </button>
        <nav aria-label="Experience frame controls">
          <button type="button" onClick={closeInterface}>Step back</button>
          <button type="button" onClick={showTimeline}>Chapters</button>
        </nav>
      </header>
      {takeawayOpen && (
        <aside className="chapter-takeaway-panel" aria-label={`${config.chapterName} chapter takeaway`}>
          <header><p className="eyebrow">What Kevin carried forward</p><button type="button" onClick={() => setTakeawayOpen(false)} aria-label="Close takeaway">×</button></header>
          <h2>{config.transformation}</h2>
          <p>{config.lesson}</p>
          <ul>{config.capabilityLinks.map((capability) => <li key={capability}>{capability}</li>)}</ul>
          {config.bridgeToNext && <p className="chapter-bridge">Next: {config.bridgeToNext}</p>}
          {next && <button className="primary-action" type="button" onClick={() => enterYear(next)}>Continue to {eraConfigs[next].chapterName}</button>}
        </aside>
      )}
      <div className="interface-mode__device" style={{ '--era-accent': config.accent } as React.CSSProperties}>
        {!loadedYears[activeYear] && visible && <div className="interface-loading" role="status"><div className="power-on-mark power-on-mark--small" aria-hidden="true"><span>K</span><i></i></div><p>Starting {config.experienceName}…</p><div className="power-on-meter" aria-hidden="true"><i></i></div></div>}
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
      </div>
    </section>
  );
}

function TextMode() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const artifactProgress = useExperienceStore((state) => state.artifacts);
  const { closeTextMode, discover, navigateToYear } = useExperienceActions();
  const yearData = timelineContent[activeYear as keyof typeof timelineContent] as unknown as Record<string, unknown> | undefined;
  const featured = projects.slice(0, 3);
  const next = getAdjacentYear(activeYear, 1);
  const discoveryArtifact = artifacts.find((artifact) => artifact.discoveryYear === activeYear);
  const artifactFound = discoveryArtifact ? artifactProgress[discoveryArtifact.id].discoveredYears.length > 0 : false;
  return (
    <section className="text-mode" aria-label={`${activeYear} ${config.chapterName} text experience`}>
      <header><button type="button" onClick={closeTextMode}>Return to visual timeline</button><Link href="/portfolio/">Portfolio</Link></header>
      <article>
        <p className="eyebrow">Chapter {config.chapterNumber} of {YEAR_ORDER.length} · {activeYear}</p>
        <h1>{config.chapterName}</h1>
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
              <section><p className="eyebrow">Verified operating scale</p><h3>1.5M catalog records · 20+ commerce channels</h3><p>One Stop Deals and StealStreet operations spanned direct-to-consumer, wholesale, Amazon FBA, direct fulfillment, international marketplaces, vendor purchasing, and warehouse fulfillment.</p></section>
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
        {activeYear === '2030' && yearData && 'collaborators' in yearData && 'missions' in yearData && (
          <>
            <h2>Human and AI collaborators</h2>
            <div className="text-mode__grid">
              {(yearData.collaborators as Array<{ id: string; kind: string; name: string; function: string }>).map((collaborator) => <section key={collaborator.id}><p className="eyebrow">{collaborator.kind} collaborator</p><h3>{collaborator.name}</h3><p>{collaborator.function}</p></section>)}
            </div>
            <h2>Mission board</h2>
            <div className="text-mode__grid">
              {(yearData.missions as Array<{ id: string; label: string; objective: string; projects: string[] }>).map((mission) => <section key={mission.id}><h3>{mission.label}</h3><p>{mission.objective}</p><small>Related projects: {mission.projects.join(', ')}</small></section>)}
            </div>
          </>
        )}
        {activeYear === '2040' && yearData && 'prompts' in yearData && 'responses' in yearData && (
          <div className="text-mode__grid">
            {(yearData.prompts as Array<{ id: string; label: string }>).map((prompt) => <section key={prompt.id}><h3>{prompt.label}</h3><p>{(yearData.responses as Record<string, string>)[prompt.id]}</p></section>)}
          </div>
        )}
        <h2>Kevin’s work in this layer</h2>
        <div className="text-mode__grid">
          {featured.map((project) => <section key={project.slug}><h3>{project.title}</h3><p>{project.summary}</p><Link href={`/work/${project.slug}/`}>Open case study</Link></section>)}
        </div>
        <div className="button-row"><button type="button" onClick={() => navigateToYear(next ?? '1990')}>{next ? `Continue to ${eraConfigs[next].chapterName}` : 'Return to Curiosity'}</button></div>
      </article>
    </section>
  );
}

function SettingsPanel() {
  const open = useExperienceStore((state) => state.settingsOpen);
  const setOpen = useExperienceStore((state) => state.setSettingsOpen);
  const quality = useExperienceStore((state) => state.quality);
  const setQuality = useExperienceStore((state) => state.setQuality);
  const motion = useExperienceStore((state) => state.motion);
  const setMotion = useExperienceStore((state) => state.setMotion);
  const sound = useExperienceStore((state) => state.sound);
  const toggleSound = useExperienceStore((state) => state.toggleSound);
  const reset = useExperienceStore((state) => state.resetProgress);
  const { showTextMode } = useExperienceActions();
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-label="Experience settings" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>Experience settings</h2><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close settings">×</button></header>
        <fieldset><legend>Visual quality</legend>{(['high','standard','lite'] as const).map((value) => <label key={value}><input type="radio" checked={quality === value} onChange={() => setQuality(value)} /> {value}</label>)}</fieldset>
        <fieldset><legend>Motion</legend>{(['full','reduced'] as const).map((value) => <label key={value}><input type="radio" checked={motion === value} onChange={() => setMotion(value)} /> {value}</label>)}</fieldset>
        <button type="button" onClick={toggleSound}>Sound: {sound ? 'on' : 'off'}</button>
        <button type="button" onClick={() => { showTextMode(); setOpen(false); }}>Use text experience</button>
        <button type="button" onClick={() => { reset(); setOpen(false); }}>Reset local progress</button>
      </section>
    </div>
  );
}

function ArtifactDrawer() {
  const open = useExperienceStore((state) => state.artifactsOpen);
  const setOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const progress = useExperienceStore((state) => state.artifacts);
  const foundCount = artifacts.filter((artifact) => progress[artifact.id].discoveredYears.length > 0).length;
  if (!open) return null;
  return (
    <aside className="artifact-drawer" aria-label="Cross-era artifacts">
      <header><div><p className="eyebrow">Kevinception continuity</p><h2>Artifacts</h2></div><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close artifacts">×</button></header>
      <p>Recover one artifact in each of the first five chapters. Their forms change with the active era; progress remains in this browser only.</p>
      <div className="artifact-drawer__progress"><progress max={artifacts.length} value={foundCount}>{foundCount} of {artifacts.length}</progress><b>{foundCount}/{artifacts.length} recovered</b></div>
      {artifacts.map((artifact) => {
        const years = progress[artifact.id].discoveredYears;
        return <section key={artifact.id} className={years.length ? 'is-found' : ''}><h3>{artifact.title}</h3><p>{artifact.meaning}</p><b>{activeYear}: {artifact.transformations[activeYear]}</b><small>{years.length ? `Recovered in ${years.join(', ')}` : `Not yet recovered · ${artifact.discoveryHint}`}</small></section>;
      })}
      {foundCount === artifacts.length && <section className="artifact-drawer__complete" role="status"><p className="eyebrow">Continuity restored</p><h3>Five signals, one connected story.</h3><p>The containers changed; curiosity, identity, ideas, future signals, and human judgment carried forward.</p><Link href="/work/kevinception/">Read how Kevinception connects the eras →</Link></section>}
    </aside>
  );
}

function HelpPanel() {
  const open = useExperienceStore((state) => state.helpOpen);
  const setOpen = useExperienceStore((state) => state.setHelpOpen);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-label="Experience help" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2>How to explore</h2><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close help">×</button></header>
        <p>Swipe, scroll, use the chapter timeline, or press the arrow keys to preview a chapter. Press Enter—or the primary chapter button—to open its functional era interface immediately.</p>
        <dl><dt>← / →</dt><dd>Previous or next chapter</dd><dt>Enter</dt><dd>Open the selected interface</dd><dt>Escape</dt><dd>Close the top layer or return to the timeline</dd><dt>T</dt><dd>Return to the timeline</dd></dl>
        <p>Essential portfolio content is also available through Portfolio, Case studies, Resume, About, and Contact.</p>
      </section>
    </div>
  );
}

function FirstRunHint({ visible }: { visible: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!visible || window.localStorage.getItem('kevinception:v7.6-hint')) return;
    setOpen(true);
  }, [visible]);
  if (!visible || !open) return null;
  const dismiss = () => {
    window.localStorage.setItem('kevinception:v7.6-hint', 'seen');
    setOpen(false);
  };
  return <div className="experience-hint" role="status"><p>Swipe, scroll, or use ← → to move through the six chapters. Press Enter to open the selected era interface.</p><button type="button" onClick={dismiss}>Got it</button></div>;
}

function UtilityMenu({ foundCount }: { foundCount: number }) {
  const [open, setOpen] = useState(false);
  const setArtifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const setSettingsOpen = useExperienceStore((state) => state.setSettingsOpen);
  const setHelpOpen = useExperienceStore((state) => state.setHelpOpen);
  const sound = useExperienceStore((state) => state.sound);
  const toggleSound = useExperienceStore((state) => state.toggleSound);
  const { showTextMode } = useExperienceActions();

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.experience-menu')) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  const activate = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className="experience-menu">
      <button type="button" className="experience-menu__trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu">Menu</button>
      {open && (
        <div className="experience-menu__popover" role="menu">
          <button type="button" role="menuitem" onClick={() => activate(() => setArtifactsOpen(true))}>Artifacts <span>{foundCount}/{artifacts.length}</span></button>
          <button type="button" role="menuitem" onClick={() => activate(toggleSound)}>Sound {sound ? 'on' : 'off'}</button>
          <button type="button" role="menuitem" onClick={() => activate(() => setSettingsOpen(true))}>Settings</button>
          <button type="button" role="menuitem" onClick={() => activate(() => setHelpOpen(true))}>Help</button>
          <button type="button" role="menuitem" onClick={() => activate(showTextMode)}>Text version</button>
        </div>
      )}
    </div>
  );
}

function TransitionOverlay() {
  const transition = useExperienceStore((state) => state.transition);
  if (!transition || transition.id === 'timeline-fade') return null;
  const from = transition.from ? eraConfigs[transition.from] : null;
  const to = eraConfigs[transition.to];
  const technicalLine = transition.id === 'time-jump'
    ? `Jumping from ${transition.from ?? 'the present'} to ${transition.to}.`
    : from?.transitionLine ?? 'Moving through the technology timeline.';
  return (
    <div className={`transition-overlay transition-${transition.id}`} role="status" aria-live="polite">
      <span></span>
      <div className="transition-copy">
        <strong>{from ? `${from.chapterName} → ${to.chapterName}` : to.chapterName}</strong>
        <p>{technicalLine}</p>
      </div>
    </div>
  );
}

export function ExperienceOverlay() {
  const viewMode = useExperienceStore((state) => state.viewMode);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const config = eraConfigs[activeYear];
  const artifactProgress = useExperienceStore((state) => state.artifacts);
  const { showTimeline, showTextMode } = useExperienceActions();
  const foundCount = useMemo(() => Object.values(artifactProgress).filter((item) => item.discoveredYears.length > 0).length, [artifactProgress]);
  const showChapterNavigation = viewMode === 'timeline' || viewMode === 'environment' || viewMode === 'transition';
  return (
    <div className={`experience-overlay mode-${viewMode}`} style={{ '--era-accent': config.accent } as React.CSSProperties}>
      <header className="experience-toolbar">
        <button className="experience-mark" type="button" onClick={showTimeline} aria-label="Open chapter timeline"><span>K</span><b>Kevinception</b></button>
        <nav aria-label="Global experience controls">
          <button type="button" onClick={showTimeline}>Chapters</button>
          <Link className="hide-below-640" href="/portfolio/">Portfolio</Link>
          <UtilityMenu foundCount={foundCount} />
        </nav>
      </header>
      {webgl === false && <div className="webgl-notice"><p>3D rendering is unavailable. The complete text experience remains available.</p><button type="button" onClick={showTextMode}>Open text experience</button></div>}
      {viewMode === 'timeline' && <ChapterCard mode="timeline" />}
      {viewMode === 'environment' && <ChapterCard mode="environment" />}
      {showChapterNavigation && <YearSelector />}
      <InterfaceLayer visible={viewMode === 'interface'} />
      {viewMode === 'text' && <TextMode />}
      <FirstRunHint visible={viewMode === 'timeline' || viewMode === 'environment'} />
      <SettingsPanel />
      <ArtifactDrawer />
      <HelpPanel />
      <TransitionOverlay />
      <div className="sr-only" aria-live="polite">Current chapter: {config.chapterNumber} of {YEAR_ORDER.length}, {activeYear} {config.chapterName}, experienced through {config.experienceName}.</div>
    </div>
  );
}
