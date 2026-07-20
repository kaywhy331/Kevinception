'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { profile, projects, timelineContent, type YearId } from '@/content/data';
import { artifacts } from './artifacts';
import { eraConfigs, getAdjacentYear, YEAR_ORDER } from './config';
import { useExperienceActions } from './ExperienceContext';
import { useExperienceStore } from './store';

function YearSelector() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const visits = useExperienceStore((state) => state.yearVisits);
  const { navigateToYear } = useExperienceActions();
  return (
    <div className="year-selector" role="list" aria-label="Technology timeline years">
      {YEAR_ORDER.map((year) => {
        const config = eraConfigs[year];
        return (
          <button
            key={year}
            type="button"
            role="listitem"
            className={activeYear === year ? 'is-active' : ''}
            style={{ '--era-accent': config.accent } as React.CSSProperties}
            onClick={() => navigateToYear(year)}
            aria-current={activeYear === year ? 'step' : undefined}
          >
            <span>{year}</span>
            <b>{config.title}</b>
            {visits[year] > 0 && <small aria-label={`${visits[year]} visits`}>●</small>}
          </button>
        );
      })}
    </div>
  );
}

function TimelinePanel() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { navigateToYear } = useExperienceActions();
  return (
    <section className="timeline-panel glass-panel" style={{ '--era-accent': config.accent } as React.CSSProperties}>
      <p className="eyebrow">Technology memory corridor</p>
      <div className="timeline-panel__year">{activeYear}</div>
      <h1>{config.title}</h1>
      <p className="timeline-panel__product">{config.product}</p>
      <p>{config.description}</p>
      <strong>{config.transformation}</strong>
      <div className="button-row">
        <button className="primary-action" type="button" onClick={() => navigateToYear(activeYear)}>{config.enterLabel}</button>
        <Link className="secondary-action" href="/portfolio/">View Kevin’s work</Link>
      </div>
    </section>
  );
}

function EnvironmentPanel() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { openInterface, showTimeline, navigateToYear } = useExperienceActions();
  const previous = getAdjacentYear(activeYear, -1);
  const next = getAdjacentYear(activeYear, 1);
  return (
    <section className="environment-panel glass-panel" style={{ '--era-accent': config.accent } as React.CSSProperties}>
      <div>
        <p className="eyebrow">{config.product}</p>
        <h1><span>{activeYear}</span> {config.title}</h1>
        <p>{config.description}</p>
        <small>{config.emotionalGoal}</small>
      </div>
      <div className="environment-panel__actions">
        <button className="primary-action" type="button" onClick={openInterface}>{config.enterLabel}</button>
        <button className="secondary-action" type="button" onClick={showTimeline}>Timeline</button>
        <button className="icon-action" type="button" disabled={!previous} onClick={() => previous && navigateToYear(previous)} aria-label="Previous year">←</button>
        <button className="icon-action" type="button" disabled={!next} onClick={() => next && navigateToYear(next)} aria-label="Next year">→</button>
      </div>
    </section>
  );
}

function EraInterfaceFrame() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { closeInterface, navigateToYear, showTimeline } = useExperienceActions();
  const next = getAdjacentYear(activeYear, 1);
  return (
    <section className="interface-mode" aria-label={`${config.title} interface`}>
      <header className="interface-mode__bar">
        <div><span>{activeYear}</span><b>{config.title}</b></div>
        <nav aria-label="Interface controls">
          <button type="button" onClick={closeInterface}>Step back</button>
          <button type="button" onClick={showTimeline}>Timeline</button>
          {next && <button type="button" onClick={() => navigateToYear(next)}>Continue to {next}</button>}
          <Link href="/portfolio/">Portfolio</Link>
        </nav>
      </header>
      <div className="interface-mode__device" style={{ '--era-accent': config.accent } as React.CSSProperties}>
        <iframe
          key={activeYear}
          src={config.legacyPath}
          title={`${config.title} functional application`}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
          loading="eager"
        />
      </div>
    </section>
  );
}

function TextMode() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const config = eraConfigs[activeYear];
  const { closeTextMode, navigateToYear } = useExperienceActions();
  const yearData = timelineContent[activeYear as keyof typeof timelineContent] as unknown as Record<string, unknown>;
  const featured = projects.slice(0, 3);
  return (
    <section className="text-mode" aria-label={`${config.title} text experience`}>
      <header>
        <button type="button" onClick={closeTextMode}>Return to 3D</button>
        <Link href="/portfolio/">Portfolio</Link>
      </header>
      <article>
        <p className="eyebrow">Text experience · {activeYear}</p>
        <h1>{config.title}</h1>
        <p className="lead">{config.description}</p>
        <h2>What this year represents</h2>
        <p>{config.transformation}. The emotional target is {config.emotionalGoal.toLowerCase()}.</p>
        {activeYear === '1990' && 'channels' in yearData && (
          <div className="text-mode__grid">
            {(yearData.channels as Array<{ number: number; name: string; title: string; body: string }>).map((channel) => (
              <section key={channel.number}><h3>Channel {channel.number}: {channel.name}</h3><b>{channel.title}</b><p>{channel.body}</p></section>
            ))}
          </div>
        )}
        {activeYear === '2020' && 'clips' in yearData && (
          <div className="text-mode__grid">
            {(yearData.clips as Array<{ hook: string; body: string; category: string }>).map((clip) => (
              <section key={clip.hook}><p className="eyebrow">{clip.category}</p><h3>{clip.hook}</h3><p>{clip.body}</p></section>
            ))}
          </div>
        )}
        <h2>Kevin’s work in this layer</h2>
        <div className="text-mode__grid">
          {featured.map((project) => <section key={project.slug}><h3>{project.title}</h3><p>{project.summary}</p><Link href={`/work/${project.slug}/`}>Open case study</Link></section>)}
        </div>
        <div className="button-row"><button type="button" onClick={() => navigateToYear(getAdjacentYear(activeYear, 1) ?? '1990')}>Continue through time</button></div>
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
        <header><h2>Experience settings</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close settings">×</button></header>
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
  if (!open) return null;
  return (
    <aside className="artifact-drawer" aria-label="Cross-era artifacts">
      <header><div><p className="eyebrow">Kevinception continuity</p><h2>Artifacts</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close artifacts">×</button></header>
      <p>These objects transform as the interface changes. Progress remains in this browser only.</p>
      {artifacts.map((artifact) => {
        const years = progress[artifact.id].discoveredYears;
        return <section key={artifact.id} className={years.length ? 'is-found' : ''}><h3>{artifact.title}</h3><p>{artifact.meaning}</p><b>{activeYear}: {artifact.transformations[activeYear]}</b><small>{years.length}/6 forms discovered {years.length ? `· ${years.join(', ')}` : ''}</small></section>;
      })}
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
        <header><h2>How to explore</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close help">×</button></header>
        <p>Use the visible timeline controls, arrow keys, swipe, or the physical device. Press Enter to enter an era’s interface and Escape to step back.</p>
        <dl><dt>← / →</dt><dd>Previous or next year</dd><dt>Enter</dt><dd>Enter the selected interface</dd><dt>Escape</dt><dd>Step back or close a panel</dd><dt>T</dt><dd>Return to the timeline</dd></dl>
        <p>Essential portfolio content is also available through Portfolio, Work, Resume, About, and Contact.</p>
      </section>
    </div>
  );
}

function TransitionOverlay() {
  const transition = useExperienceStore((state) => state.transition);
  if (!transition) return null;
  const labels = {
    'static-modem': 'Static becomes modem noise',
    'profile-flatten': 'Personal pages become social identity',
    'portrait-rotate': 'The social feed rotates into short-form video',
    'signals-to-agents': 'Reactions reorganize into autonomous agents',
    'agents-to-echo': 'Agent memories merge into a digital echo',
    'timeline-fade': 'Moving through the technology timeline'
  };
  return <div className={`transition-overlay transition-${transition.id}`} role="status" aria-live="polite"><span></span><p>{labels[transition.id]}</p></div>;
}

export function ExperienceOverlay() {
  const viewMode = useExperienceStore((state) => state.viewMode);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const webgl = useExperienceStore((state) => state.webglAvailable);
  const settings = useExperienceStore((state) => state.setSettingsOpen);
  const artifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const help = useExperienceStore((state) => state.setHelpOpen);
  const sound = useExperienceStore((state) => state.sound);
  const toggleSound = useExperienceStore((state) => state.toggleSound);
  const config = eraConfigs[activeYear];
  const artifactProgress = useExperienceStore((state) => state.artifacts);
  const { showTimeline, showTextMode } = useExperienceActions();
  const foundCount = useMemo(() => Object.values(artifactProgress).filter((item) => item.discoveredYears.length > 0).length, [artifactProgress]);
  return (
    <div className={`experience-overlay mode-${viewMode}`} style={{ '--era-accent': config.accent } as React.CSSProperties}>
      <header className="experience-toolbar">
        <button className="experience-mark" type="button" onClick={showTimeline} aria-label="Open timeline"><span>K</span><b>Kevinception</b></button>
        <nav aria-label="Global experience controls">
          <button type="button" onClick={showTimeline}>Timeline</button>
          <Link href="/portfolio/">Portfolio</Link>
          <button type="button" onClick={() => artifactsOpen(true)}>Artifacts <span>{foundCount}</span></button>
          <button type="button" onClick={toggleSound}>Sound {sound ? 'on' : 'off'}</button>
          <button type="button" onClick={() => settings(true)}>Settings</button>
          <button type="button" onClick={() => help(true)}>Help</button>
          <button type="button" onClick={showTextMode}>Text</button>
        </nav>
      </header>
      {webgl === false && <div className="webgl-notice"><p>3D rendering is unavailable. The complete text experience remains available.</p><button type="button" onClick={showTextMode}>Open text experience</button></div>}
      {viewMode === 'timeline' && <><TimelinePanel /><YearSelector /></>}
      {viewMode === 'environment' && <EnvironmentPanel />}
      {viewMode === 'interface' && <EraInterfaceFrame />}
      {viewMode === 'text' && <TextMode />}
      <SettingsPanel />
      <ArtifactDrawer />
      <HelpPanel />
      <TransitionOverlay />
      <div className="sr-only" aria-live="polite">Current timeline: {activeYear}, {config.title}.</div>
    </div>
  );
}
