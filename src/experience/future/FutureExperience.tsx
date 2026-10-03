'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { YearId } from '@/content/data';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { playFutureCue, playInterfaceTone, startFutureAtmosphere } from '../audio';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';
import { FutureClosing } from './FutureClosing';
import {
  AGENT_TRACE_LABELS,
  AGENT_TRACE_PHASES,
  COEXISTENCE_MOMENT_IDS,
  CONSCIOUSNESS_CUE_IDS,
  CONSCIOUSNESS_PHASES,
  CONSCIOUSNESS_PHASE_LABELS,
  CONSENT_OUTCOMES,
  FUTURE_IMAGINED_LINE,
  SAITO_INTRO,
  STAGED_STATE_LABELS,
  UNWITNESSED_LINE,
  coexistenceMoments,
  consciousnessCues,
  getConsciousnessContinueLabel,
  getConsciousnessLine,
  getEarnedMemoryLine,
  getNextUnaskedMoment,
  getPermissionedMemorySource,
  getPermissionedMemoryState,
  saitoAuthorityMap,
  type AgentTracePhase,
  type CoexistenceMoment,
  type CoexistenceMomentId,
  type CoexistenceState,
  type CompanionConsent,
  type ConsciousnessCueId,
  type ConsciousnessPhase,
  type EncounterRetention,
  type PermissionedMemoryState
} from './futureWorld';

/** One beat on screen at a time: talk, then the reveal, then the question, then rest. */
type CoexistenceBeat = 'exchange' | 'reveal' | 'consent' | 'settled';

function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

function speakLine(line: string, rate: number, pitch: number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.rate = rate;
  utterance.pitch = pitch;
  window.speechSynthesis.speak(utterance);
}

function SoundControl() {
  const sound = useExperienceStore((state) => state.sound);
  const toggleSound = useExperienceStore((state) => state.toggleSound);
  return (
    <button
      className="future-sound-control"
      type="button"
      aria-pressed={sound}
      onClick={() => {
        toggleSound();
        playInterfaceTone('power', !sound);
      }}
    >
      <span aria-hidden="true">{sound ? '◉' : '○'}</span> Sound
    </button>
  );
}

function ImaginedTag() {
  return <em className="future-imagined" title={FUTURE_IMAGINED_LINE}>Imagined</em>;
}

function AgentTrace({ moment, livePhase }: { moment: CoexistenceMoment; livePhase: AgentTracePhase }) {
  const [activePhase, setActivePhase] = useState<AgentTracePhase>(livePhase);
  const trace = moment.agent;
  const activeStep = trace.steps[activePhase];

  useEffect(() => setActivePhase(livePhase), [livePhase]);

  return (
    <section className="coexistence-agent" aria-label="How Saito decided">
      <ol aria-label="Saito’s decision steps">
        {AGENT_TRACE_PHASES.map((phase, index) => (
          <li key={phase}>
            <button type="button" aria-pressed={activePhase === phase} data-live={phase === livePhase || undefined} onClick={() => setActivePhase(phase)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b>{AGENT_TRACE_LABELS[phase]}</b>
              <small>{trace.steps[phase].status}</small>
            </button>
          </li>
        ))}
      </ol>

      <article>
        <div>
          <span>{AGENT_TRACE_LABELS[activePhase]}</span>
          <b>{activeStep.status}</b>
        </div>
        <h4>{activeStep.summary}</h4>
        <p>{activeStep.detail}</p>
        <dl>
          <div><dt>Stance</dt><dd>{trace.posture}</dd></div>
          <div><dt>Confidence</dt><dd>{trace.confidence}%</dd></div>
          <div><dt>Known gap</dt><dd>{trace.uncertainty}</dd></div>
          <div><dt>First said</dt><dd>{moment.seed.when} · {moment.seed.said}</dd></div>
          <div><dt>Quiet work</dt><dd>{moment.incubation.span} · {moment.incubation.checks} checks · {moment.incubation.domains.join(' · ')}</dd></div>
        </dl>
      </article>

      <footer>This is a decision record—inputs, rules, action, and memory—not hidden chain-of-thought.</footer>
    </section>
  );
}

/**
 * The audit, in one modal layer. A native <dialog> opened with showModal()
 * lives in the top layer (so it is always on screen, even from a scrolled
 * stage), makes the rest of the page inert, and traps focus. Escape is
 * handled here—in the capture phase, before the shell's window listener—and
 * marked defaultPrevented so it never also closes the interface.
 */
function BoundaryLens({ moment, livePhase, onClose }: {
  moment: CoexistenceMoment;
  livePhase: AgentTracePhase;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  useLayoutEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (typeof node.showModal === 'function') {
      if (!node.open) node.showModal();
    } else {
      node.setAttribute('open', '');
    }
    heading.current?.focus();
    return () => {
      if (typeof node.close === 'function' && node.open) node.close();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close.current();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return (
    <dialog
      ref={dialog}
      className="coexistence-lens"
      data-future-part="lens"
      aria-modal="true"
      aria-labelledby="coexistence-lens-title"
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
    >
      <header>
        <div>
          <p className="future-kicker">Saito’s record · {moment.time} {moment.place}</p>
          <h2 id="coexistence-lens-title" ref={heading} tabIndex={-1}>What Saito did and didn’t do</h2>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </header>

      <AgentTrace key={moment.id} moment={moment} livePhase={livePhase} />

      <section className="coexistence-authority" aria-labelledby="coexistence-authority-title">
        <h3 id="coexistence-authority-title">What Saito may do on its own</h3>
        <p>Every card Saito prepares exists because a rule below allows it. Nothing here moves a decision off Kevin—he commits by hand.</p>
        <ol aria-label="Saito’s standing permissions by area">
          {saitoAuthorityMap.map((tier) => (
            <li key={tier.domains}>
              <span>{tier.domains}</span>
              <b>{tier.level}</b>
              <p>{tier.meaning}</p>
            </li>
          ))}
        </ol>
        <footer>Private quiet work—family health, guests—never surfaces on shared screens.</footer>
      </section>

      <aside className="coexistence-provenance">
        <span>Built on TokenPak</span>
        <p>{moment.receipt}</p>
        <p>Saito imagines where TokenPak—the local-first context layer I’m building now—could lead. <Link href="/work/tokenpak/">Read the TokenPak case study</Link></p>
      </aside>
    </dialog>
  );
}

function Dayline({ activeMoment, anchorTeased, onSelect }: {
  activeMoment: CoexistenceMomentId;
  anchorTeased: boolean;
  onSelect: (id: CoexistenceMomentId) => void;
}) {
  return (
    <nav className="coexistence-dayline" aria-label="A day with Saito">
      <p>One day, held lightly</p>
      <ol>
        {COEXISTENCE_MOMENT_IDS.map((id) => {
          const moment = coexistenceMoments[id];
          const isAnchor = id === 'evening';
          return (
            <li key={id}>
              <button type="button" data-anchor={isAnchor || undefined} data-teased={(isAnchor && anchorTeased) || undefined} aria-pressed={activeMoment === id} onClick={() => onSelect(id)}>
                <time>{moment.time}</time>
                <span>{moment.place}</span>
                {isAnchor && anchorTeased && <em>a year is waiting</em>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CoexistenceRoom({ activeMoment, activePhase, activeSignal, revealed, consent, onSelect }: {
  activeMoment: CoexistenceMomentId;
  activePhase: AgentTracePhase;
  activeSignal: string;
  revealed: boolean;
  consent: CoexistenceState['consent'];
  onSelect: (id: CoexistenceMomentId) => void;
}) {
  const activeMomentContent = coexistenceMoments[activeMoment];
  // Room objects are pointer shortcuts; the dayline is the keyboard control.
  const object = (id: CoexistenceMomentId, className: string, label: string) => (
    <button
      type="button"
      tabIndex={-1}
      className={`coexistence-object ${className}`}
      data-consent={consent[id]}
      aria-label={`${label}: ${coexistenceMoments[id].title}. Memory ${consent[id]}.`}
      aria-pressed={activeMoment === id}
      onClick={() => onSelect(id)}
    >
      <span>{coexistenceMoments[id].time}</span>
    </button>
  );

  return (
    <section className="coexistence-room" data-agent-phase={activePhase} aria-label="Kevin’s apartment and studio across one day">
      <div className="coexistence-sun" aria-hidden="true"></div>
      <div className="coexistence-window" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="coexistence-ceiling-rail" aria-hidden="true"></div>
      <div className="coexistence-partition" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div className="coexistence-shelf" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="coexistence-table" aria-hidden="true"></div>
      <div className="coexistence-rug" aria-hidden="true"></div>
      <div className="coexistence-lounge" aria-hidden="true"><i></i><i></i></div>
      {/* The shared pane is pure light: other days' quiet work glows as bars,
          the staged cards light up when revealed. Nothing here is meant to be read. */}
      <div className="coexistence-pane" data-live={revealed || undefined} data-phase={activePhase} aria-hidden="true">
        {revealed
          ? activeMomentContent.staged.slice(0, 3).map((item) => <i key={item.action} data-state={item.state}></i>)
          : COEXISTENCE_MOMENT_IDS
            .filter((id) => id !== activeMoment && coexistenceMoments[id].thread)
            .slice(0, 3)
            .map((id) => <i key={id} data-thread></i>)}
      </div>
      <div className="coexistence-dial" data-armed={(activePhase === 'govern' || revealed) || undefined} aria-hidden="true"><i></i></div>
      <div className="coexistence-hand coexistence-hand--human" aria-hidden="true"></div>
      {object('morning', 'coexistence-object--mug', 'Warm mug on the kitchen table')}
      {object('making', 'coexistence-object--draft', 'Unfinished draft on the studio table')}
      {object('work', 'coexistence-object--window', 'Window desk at midday')}
      {object('care', 'coexistence-object--door', 'Apartment threshold at dusk')}
      {object('evening', 'coexistence-object--table', 'Dinner table after the plates are cleared')}
      {object('gathering', 'coexistence-object--glasses', 'Glasses after friends have gone')}
      <div className="saito-presence" data-behavior={activeMoment} data-phase={activePhase} aria-hidden="true">
        <i></i><i></i><i></i>
      </div>
      <p className="saito-room-signal" data-phase={activePhase} data-future-part="signal">
        <span>{AGENT_TRACE_LABELS[activePhase]}</span>
        <b>{activeSignal}</b>
        <i aria-hidden="true"></i>
      </p>
    </section>
  );
}

function CoexistenceExperience() {
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectMoment = useExperienceStore((state) => state.selectCoexistenceMoment);
  const resolveConsent = useExperienceStore((state) => state.resolveCompanionConsent);
  const sound = useExperienceStore((state) => state.sound);
  const motion = useExperienceStore((state) => state.motion);
  const [exchangeIndex, setExchangeIndex] = useState(0);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const [live, setLive] = useState(false);
  // Auto-play contract: the toggle's aria-pressed state is the visitor's choice and survives hiding.
  // It only runs (clock + voice) while the interface is the visible view; returning resumes it
  // from the same exchange line, and an unpressed toggle never starts on its own.
  const running = live && viewMode === 'interface';
  const [lensOpen, setLensOpen] = useState(false);
  const stagedReveal = useRef<HTMLUListElement>(null);
  const consentBeat = useRef<HTMLFieldSetElement>(null);
  const lensToggle = useRef<HTMLButtonElement>(null);
  const lensWasOpen = useRef(false);
  const { discover, enterYear } = useExperienceActions();
  const moment = coexistenceMoments[coexistence.activeMoment];
  const decision = coexistence.consent[coexistence.activeMoment];
  const lastIndex = moment.exchange.length - 1;
  const activeBeat = moment.exchange[Math.min(exchangeIndex, lastIndex)];
  const nextBeat = moment.exchange[exchangeIndex + 1];
  const exchangeComplete = !nextBeat;
  const revealed = exchangeIndex >= moment.revealAt;
  const beat: CoexistenceBeat = decision !== 'unasked'
    ? 'settled'
    : exchangeComplete ? 'consent' : revealed ? 'reveal' : 'exchange';
  const nextMoment = getNextUnaskedMoment(coexistence);
  const scrollBehavior: ScrollBehavior = motion === 'reduced' ? 'auto' : 'smooth';

  // Every way into a moment (dayline, room, 3D scene) starts its conversation over.
  useEffect(() => { setExchangeIndex(0); }, [coexistence.activeMoment]);

  const chooseMoment = (momentId: CoexistenceMomentId) => {
    selectMoment(momentId);
    setExchangeIndex(0);
    playFutureCue('presence', sound);
    trackAnalyticsEvent('coexistence_moment_opened', { moment: momentId });
  };

  const advanceExchange = () => {
    if (!nextBeat) return;
    const nextIndex = Math.min(exchangeIndex + 1, lastIndex);
    setExchangeIndex(nextIndex);
    playFutureCue(nextBeat.speaker === 'saito' ? 'presence' : 'signal', sound);
    if (nextIndex === moment.revealAt) {
      playFutureCue('synthesis', sound);
      trackAnalyticsEvent('coexistence_reveal_staged', { moment: moment.id });
    }
    trackAnalyticsEvent('coexistence_exchange_advanced', {
      moment: moment.id,
      phase: nextBeat.phase,
      speaker: nextBeat.speaker
    });
  };

  const skipToQuestion = () => {
    setExchangeIndex(lastIndex);
    playFutureCue('synthesis', sound);
    trackAnalyticsEvent('coexistence_skipped_to_question', { moment: moment.id, from: exchangeIndex });
  };

  const toggleLive = () => {
    const next = !live;
    setLive(next);
    playFutureCue(next ? 'presence' : 'signal', sound);
    trackAnalyticsEvent('coexistence_live_toggled', { live: next });
    if (!next) cancelSpeech();
  };

  const toggleLens = () => {
    const next = !lensOpen;
    setLensOpen(next);
    playFutureCue(next ? 'signal' : 'presence', sound);
    trackAnalyticsEvent('coexistence_lens_toggled', { open: next, moment: moment.id });
  };

  // Closing the lens hands focus back to the control that opened it.
  useEffect(() => {
    if (lensWasOpen.current && !lensOpen) lensToggle.current?.focus();
    lensWasOpen.current = lensOpen;
  }, [lensOpen]);

  // Auto-play: Saito keeps the exchange moving on a natural clock. Consent is
  // never advanced by the machine; the toggle is the pause.
  useEffect(() => {
    if (!running || !nextBeat) return;
    const delay = Math.min(1400 + activeBeat.line.length * 26, 6200);
    const timer = window.setTimeout(advanceExchange, delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, exchangeIndex, coexistence.activeMoment]);

  // Auto-play gives Saito a voice when sound is on.
  useEffect(() => {
    if (!running || !sound || activeBeat.speaker !== 'saito') return;
    speakLine(activeBeat.line, 0.96, 0.82);
    return cancelSpeech;
  }, [running, sound, activeBeat]);

  // Keep the staged reveal—especially its gated last card—in view when it lands.
  useEffect(() => {
    if (!revealed) return;
    stagedReveal.current?.scrollIntoView?.({ behavior: scrollBehavior, block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // The consent question is a held beat: bring it on screen when the room dims for it.
  useEffect(() => {
    if (beat !== 'consent') return;
    consentBeat.current?.scrollIntoView?.({ behavior: scrollBehavior, block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat]);

  const chooseConsent = (next: Exclude<CompanionConsent, 'unasked'>) => {
    resolveConsent(next);
    discover('human-gate', '2030');
    playFutureCue(next === 'kept' ? 'consent' : 'refusal', sound);
    trackAnalyticsEvent('coexistence_consent_decided', { moment: moment.id, decision: next });
  };

  return (
    <section
      className="future-native future-native--2030"
      data-future-native="2030"
      data-moment={moment.id}
      data-beat={beat}
      data-lens={lensOpen || undefined}
      data-motion={motion}
      aria-labelledby="future-2030-title"
    >
      <div className="coexistence-grain" aria-hidden="true"></div>
      <header className="future-masthead">
        <div>
          <p>2030 · Co-Existence <ImaginedTag /></p>
          <h1 id="future-2030-title">Morning, Together</h1>
          <span>{SAITO_INTRO} {FUTURE_IMAGINED_LINE}</span>
        </div>
        <div>
          <button ref={lensToggle} className="future-sound-control coexistence-lens-toggle" type="button" aria-haspopup="dialog" aria-expanded={lensOpen} onClick={toggleLens}>
            <span aria-hidden="true">◫</span> What Saito did
          </button>
          <SoundControl />
        </div>
      </header>

      <div className="coexistence-stage" data-future-part="stage">
        <Dayline activeMoment={moment.id} anchorTeased={coexistence.consent.evening === 'unasked' && moment.id !== 'evening'} onSelect={chooseMoment} />
        <CoexistenceRoom
          activeMoment={moment.id}
          activePhase={activeBeat.phase}
          activeSignal={activeBeat.signal}
          revealed={revealed}
          consent={coexistence.consent}
          onSelect={chooseMoment}
        />

        <section className="coexistence-dialogue" data-future-part="dialogue" aria-labelledby="coexistence-moment-title">
          <div className="coexistence-dialogue__time"><time>{moment.time}</time><span>{moment.place}</span></div>
          <h2 id="coexistence-moment-title">{moment.title}</h2>

          <p className="coexistence-seed" data-revealed={revealed || undefined} data-future-part="seed">
            {revealed ? (
              <>
                <span>First said {moment.seed.when.toLowerCase()} · {moment.seed.where}</span>
                <b>{moment.seed.said}</b>
              </>
            ) : (
              <>
                <span>Seed held · {moment.incubation.span}</span>
                <b>Something you once said is still working. It surfaces when it matters.</b>
              </>
            )}
          </p>

          <ol className="coexistence-exchange" data-future-part="exchange" aria-label={`Conversation between Kevin and Saito at ${moment.time}`}>
            {moment.exchange.slice(0, exchangeIndex + 1).map((exchangeBeat, index) => (
              <li key={`${exchangeBeat.phase}-${index}`} data-speaker={exchangeBeat.speaker} data-current={index === exchangeIndex}>
                <span>{exchangeBeat.speaker === 'saito' ? 'Saito' : 'Kevin'}</span>
                <p>{exchangeBeat.line}</p>
              </li>
            ))}
          </ol>
          <p className="sr-only" role="status">{activeBeat.speaker === 'saito' ? 'Saito' : 'Kevin'}: {activeBeat.line}</p>

          {nextBeat && (
            <div className="coexistence-controls">
              <button className="coexistence-reply" type="button" data-future-part="reply" onClick={advanceExchange}>
                <span>{live ? 'Next' : nextBeat.speaker === 'kevin' ? 'Speak' : 'Continue'}</span>
                <b>{activeBeat.nextLabel}</b>
              </button>
              <div className="coexistence-controls__quiet">
                <button type="button" aria-pressed={live} data-future-part="autoplay" onClick={toggleLive}>
                  <span aria-hidden="true">{live ? '❚❚' : '▶'}</span> Auto-play
                </button>
                <button type="button" data-future-part="skip" onClick={skipToQuestion}>Skip to the question</button>
              </div>
            </div>
          )}

          {revealed && (
            <ul className="coexistence-staged" data-future-part="staged" ref={stagedReveal} aria-label="What Saito already prepared">
              {moment.staged.map((item, index) => (
                <li
                  key={`${item.domain}-${item.action}`}
                  data-state={item.state}
                  style={{ animationDelay: motion === 'reduced' ? '0ms' : `${index * 130}ms` }}
                >
                  <span>{item.domain}</span>
                  <p>{item.action}</p>
                  <b>{STAGED_STATE_LABELS[item.state]}</b>
                </li>
              ))}
            </ul>
          )}

          <p className="coexistence-ambient">{moment.ambient}</p>

          {exchangeComplete && (
            <fieldset className="coexistence-consent" data-future-part="consent" ref={consentBeat}>
              <legend>{moment.invitation}</legend>
              <button type="button" aria-pressed={decision === 'kept'} onClick={() => chooseConsent('kept')}>Keep it with me</button>
              <button type="button" aria-pressed={decision === 'refused'} onClick={() => chooseConsent('refused')}>Let it end here</button>
              {decision !== 'unasked' && <output>{CONSENT_OUTCOMES[decision]}</output>}
              {decision !== 'unasked' && nextMoment && (
                <button className="coexistence-next" type="button" data-future-part="next-moment" onClick={() => chooseMoment(nextMoment)}>
                  Next moment · {coexistenceMoments[nextMoment].time} {coexistenceMoments[nextMoment].place} →
                </button>
              )}
            </fieldset>
          )}
        </section>

        <button className="coexistence-forward" type="button" data-future-part="forward" onClick={() => enterYear('2040')}>
          <span>Ten years pass</span>
          <b>Enter Morning, After</b>
        </button>
      </div>

      {lensOpen && <BoundaryLens moment={moment} livePhase={activeBeat.phase} onClose={toggleLens} />}

      <footer className="future-disclosure"><span>Imagined</span><p>Saito is design fiction. What it notices, may do, and keeps stays inspectable—without exposing private reasoning.</p></footer>
    </section>
  );
}

/** The hologram is decoration for the story told in the encounter panel; it is not a control. */
function HologramPortrait({ phase, memoryState, sourceOpen, certainty, consent }: {
  phase: ConsciousnessPhase;
  memoryState: PermissionedMemoryState;
  sourceOpen: boolean;
  certainty: 'record' | 'pattern' | 'conjecture';
  consent: CoexistenceState['consent'];
}) {
  return (
    <figure
      className="consciousness-portrait"
      data-phase={phase}
      data-memory={memoryState}
      data-source-open={sourceOpen || undefined}
      data-certainty={certainty}
      aria-hidden="true"
    >
      <span className="consciousness-portrait__echo">KEVIN</span>
      {/* The figure is literally made of permissioned memory: one band per 2030
          moment. Refused moments render as deliberate blanks, not filled in. */}
      <span className="consciousness-portrait__figure">
        {COEXISTENCE_MOMENT_IDS.map((id) => (
          <i key={id} className={`consciousness-portrait__band consciousness-portrait__band--${id}`} data-state={consent[id]}></i>
        ))}
      </span>
      <span className="consciousness-portrait__scan"></span>
      <span className="consciousness-portrait__trace"><i></i><i></i><i></i></span>
      <span className="consciousness-portrait__memory">{memoryState === 'retained' ? 'PERMISSIONED MEMORY' : memoryState === 'withheld' ? 'DELIBERATE BLANK' : 'OBSERVATION ONLY'}</span>
      <span className="consciousness-portrait__name">KEVIN / CONTINUING</span>
    </figure>
  );
}

function ConsciousnessRoom({ selectedCue, coexistence, disabled, onSelect }: {
  selectedCue: ConsciousnessCueId;
  coexistence: CoexistenceState;
  disabled: boolean;
  onSelect: (id: ConsciousnessCueId) => void;
}) {
  // Room cues are pointer shortcuts; the cue index below is the keyboard control.
  const cueButton = (id: ConsciousnessCueId, className: string) => {
    const memoryState = getPermissionedMemoryState(coexistence, id);
    return (
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        className={`consciousness-cue ${className}`}
        data-memory={memoryState}
        aria-label={`${consciousnessCues[id].label}. Memory ${memoryState}.`}
        aria-pressed={selectedCue === id}
        onClick={() => onSelect(id)}
      ><span>{consciousnessCues[id].label}</span></button>
    );
  };

  return (
    <section className="consciousness-room" data-memory={getPermissionedMemoryState(coexistence, selectedCue)} aria-label="The 2030 apartment, ten years later">
      <div className="consciousness-city" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div className="consciousness-rain" aria-hidden="true"></div>
      <div className="consciousness-table" aria-hidden="true"></div>
      <div className="coexistence-hand consciousness-hand" aria-hidden="true"></div>
      <div className="consciousness-mug" aria-hidden="true"></div>
      {cueButton('mug', 'consciousness-cue--mug')}
      {cueButton('rain', 'consciousness-cue--rain')}
      {cueButton('unfinished-note', 'consciousness-cue--note')}
      {cueButton('boarding-stub', 'consciousness-cue--stub')}
      {cueButton('doorway', 'consciousness-cue--door')}
    </section>
  );
}

function ConsciousnessExperience() {
  const consciousness = useExperienceStore((state) => state.futureJourney.consciousness);
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectCue = useExperienceStore((state) => state.selectConsciousnessCue);
  const advanceBehavior = useExperienceStore((state) => state.advanceConsciousnessBehavior);
  const setSourceTrace = useExperienceStore((state) => state.setConsciousnessSourceTrace);
  const resolveRetention = useExperienceStore((state) => state.resolveEncounterRetention);
  const resetFutureJourney = useExperienceStore((state) => state.resetFutureJourney);
  const toggleSound = useExperienceStore((state) => state.toggleSound);
  const sound = useExperienceStore((state) => state.sound);
  const motion = useExperienceStore((state) => state.motion);
  const { discover, enterYear, navigateToYear } = useExperienceActions();
  const cue = consciousnessCues[consciousness.selectedCue];
  const memoryState = getPermissionedMemoryState(coexistence, cue.id);
  const memorySource = getPermissionedMemorySource(coexistence, cue.id);
  const line = getConsciousnessLine(cue, consciousness.behaviorPhase, memoryState);
  const phaseIndex = CONSCIOUSNESS_PHASES.indexOf(consciousness.behaviorPhase);
  const continueLabel = getConsciousnessContinueLabel(consciousness.behaviorPhase);
  const finished = consciousness.behaviorPhase === 'continue';
  const retention = consciousness.encounterRetention;
  const released = retention === 'released';
  const unwitnessed = COEXISTENCE_MOMENT_IDS.every((id) => coexistence.consent[id] === 'unasked');
  const earnedLine = getEarnedMemoryLine(coexistence);

  const viewMode = useExperienceStore((state) => state.viewMode);

  // Leaving the chapter, or hiding the interface, silences him.
  useEffect(() => cancelSpeech, []);
  useEffect(() => {
    if (viewMode !== 'interface') cancelSpeech();
  }, [viewMode]);

  const chooseCue = (cueId: ConsciousnessCueId) => {
    if (released) return;
    selectCue(cueId);
    playFutureCue('notice', sound);
    trackAnalyticsEvent('consciousness_cue_noticed', { cue: cueId, memory: getPermissionedMemoryState(coexistence, cueId) });
  };

  const continueBehavior = () => {
    if (finished) return;
    const nextPhase = CONSCIOUSNESS_PHASES[Math.min(phaseIndex + 1, CONSCIOUSNESS_PHASES.length - 1)];
    advanceBehavior();
    playFutureCue(nextPhase === 'act' ? cue.certainty === 'conjecture' ? 'conjecture' : 'agency' : nextPhase === 'continue' ? 'synthesis' : 'task', sound);
    if (nextPhase === 'continue') discover('next-layer-message', '2040');
    trackAnalyticsEvent('consciousness_behavior_advanced', { cue: cue.id, phase: nextPhase });
  };

  const hear = () => {
    if (!sound) toggleSound();
    speakLine(line, 0.86, 0.72);
  };

  const decideRetention = (decision: Exclude<EncounterRetention, 'unasked'>) => {
    resolveRetention(decision);
    playFutureCue(decision === 'kept' ? 'consent' : 'refusal', sound);
    if (decision === 'released') cancelSpeech();
    trackAnalyticsEvent('consciousness_encounter_retention', { decision });
  };

  const liveAgain = () => {
    resetFutureJourney();
    enterYear('2030');
  };

  return (
    <section
      className="future-native future-native--2040"
      data-future-native="2040"
      data-phase={consciousness.behaviorPhase}
      data-cue={cue.id}
      data-memory={memoryState}
      data-retention={retention}
      data-motion={motion}
      aria-labelledby="future-2040-title"
    >
      <div className="consciousness-smoke" aria-hidden="true"><i></i><i></i><i></i></div>
      <header className="future-masthead">
        <div>
          <p>2040 · Consciousness <ImaginedTag /></p>
          <h1 id="future-2040-title">Morning, After</h1>
          <span>Ten years on, a Kevin-shaped intelligence remembers only what you allowed—and knows when not to act.</span>
        </div>
        <div>
          <div className="consciousness-constellation" role="img" aria-label={`${coexistence.keptMoments.length} of 6 memories permitted`}>
            {COEXISTENCE_MOMENT_IDS.map((id) => <i key={id} data-state={coexistence.consent[id]}></i>)}
          </div>
          <SoundControl />
        </div>
      </header>

      <div className="consciousness-stage" data-future-part="stage">
        {unwitnessed ? (
          <aside className="consciousness-unwitnessed" data-future-part="memory-line">
            <p>{UNWITNESSED_LINE}</p>
            <button type="button" onClick={() => enterYear('2030')}>Go live the morning first</button>
          </aside>
        ) : earnedLine && (
          <aside className="consciousness-unwitnessed consciousness-earned" data-future-part="memory-line">
            <p>{earnedLine}</p>
          </aside>
        )}

        <ConsciousnessRoom selectedCue={cue.id} coexistence={coexistence} disabled={released} onSelect={chooseCue} />
        <HologramPortrait phase={consciousness.behaviorPhase} memoryState={memoryState} sourceOpen={consciousness.sourceTraceOpen} certainty={cue.certainty} consent={coexistence.consent} />

        {retention !== 'unasked' ? (
          <div className="consciousness-encounter consciousness-encounter--closing">
            <FutureClosing retention={retention} variant="visual" onStartOver={() => navigateToYear('1990')} onLiveAgain={liveAgain} />
          </div>
        ) : (
          <section className="consciousness-encounter" data-future-part="encounter" aria-labelledby="consciousness-cue-title">
            <ol aria-label="Kevin’s behavior loop">
              {CONSCIOUSNESS_PHASES.map((phase) => (
                <li key={phase} data-active={phase === consciousness.behaviorPhase} data-past={CONSCIOUSNESS_PHASES.indexOf(phase) < phaseIndex}>{CONSCIOUSNESS_PHASE_LABELS[phase]}</li>
              ))}
            </ol>
            <p className="future-kicker">{CONSCIOUSNESS_PHASE_LABELS[consciousness.behaviorPhase]} · {cue.action}</p>
            <h2 id="consciousness-cue-title">{cue.label}</h2>
            <blockquote>“{line}”</blockquote>
            <p className="sr-only" role="status">{line}</p>
            {finished && <p className="consciousness-last-action">What he chose: “{cue.act}”</p>}

            <div className="consciousness-actions">
              {continueLabel && <button className="future-primary" type="button" data-future-part="continue" onClick={continueBehavior}>{continueLabel}</button>}
              <button type="button" onClick={hear}>{sound ? 'Hear Kevin say this' : 'Turn on sound to hear Kevin'}</button>
              <button type="button" aria-expanded={consciousness.sourceTraceOpen} onClick={() => setSourceTrace(!consciousness.sourceTraceOpen)}>Pull the sentence to its source</button>
            </div>

            {consciousness.sourceTraceOpen && (
              <aside className="consciousness-source" data-future-part="source" data-certainty={cue.certainty} data-memory={memoryState}>
                <span>{cue.certainty}</span>
                <i aria-hidden="true"></i>
                <p>{memorySource}</p>
                <small>Behavior basis · {cue.source}</small>
                {cue.certainty === 'conjecture' && <small>The thread ends here. Kevin will not turn inference into memory.</small>}
              </aside>
            )}

            {finished && (
              <fieldset className="consciousness-retention" data-future-part="retention">
                <legend>“May I keep this?”</legend>
                <button type="button" onClick={() => decideRetention('kept')}>Yes—only this encounter</button>
                <button type="button" onClick={() => decideRetention('released')}>No—let me disappear</button>
              </fieldset>
            )}
          </section>
        )}

        <nav className="consciousness-cue-index" aria-label="Things Kevin can notice">
          {CONSCIOUSNESS_CUE_IDS.map((id) => (
            <button key={id} type="button" disabled={released} aria-pressed={cue.id === id} onClick={() => chooseCue(id)}>
              <span>{consciousnessCues[id].certainty} · {getPermissionedMemoryState(coexistence, id)}</span>{consciousnessCues[id].label}
            </button>
          ))}
        </nav>

        {retention === 'unasked' && (
          <div className="consciousness-exits" data-future-part="exits">
            <Link className="consciousness-exits__reach" href="/contact/">Reach the living Kevin</Link>
            <Link href="/work/">What Kevin made</Link>
            <button type="button" onClick={() => enterYear('2030')}>Return to the living morning</button>
          </div>
        )}
      </div>

      <footer className="future-disclosure"><span>Imagined</span><p>This is authored design fiction: a reproduction of Kevin’s patterns, voice, memory boundaries, and agency—not a claim that consciousness can be transferred.</p></footer>
    </section>
  );
}

export function FutureExperience({ year }: { year: Extract<YearId, '2030' | '2040'> }) {
  const sound = useExperienceStore((state) => state.sound);
  const viewMode = useExperienceStore((state) => state.viewMode);
  useEffect(() => startFutureAtmosphere(year, sound && viewMode === 'interface'), [sound, viewMode, year]);
  return year === '2030' ? <CoexistenceExperience /> : <ConsciousnessExperience />;
}
