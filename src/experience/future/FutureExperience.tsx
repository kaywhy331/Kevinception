'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { YearId } from '@/content/data';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { playFutureCue, playInterfaceTone, startFutureAtmosphere } from '../audio';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';
import {
  AGENT_TRACE_PHASES,
  COEXISTENCE_MOMENT_IDS,
  CONSCIOUSNESS_CUE_IDS,
  CONSCIOUSNESS_PHASES,
  coexistenceMoments,
  consciousnessCues,
  getConsciousnessLine,
  getPermissionedMemorySource,
  getPermissionedMemoryState,
  type CoexistenceState,
  type CoexistenceMoment,
  type CoexistenceMomentId,
  type AgentTracePhase,
  type CompanionConsent,
  type ConsciousnessCueId,
  type ConsciousnessPhase,
  type EncounterRetention,
  type PermissionedMemoryState
} from './futureWorld';

const agentTraceLabels: Record<AgentTracePhase, string> = {
  sense: 'Sense',
  interpret: 'Interpret',
  govern: 'Check authority',
  act: 'Act or wait',
  account: 'Receipt'
};

const phaseLabels: Record<ConsciousnessPhase, string> = {
  notice: 'Notice',
  recall: 'Recall',
  deliberate: 'Deliberate',
  act: 'Speak / act / refuse',
  continue: 'Continue'
};

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
      <span aria-hidden="true">{sound ? '◉' : '○'}</span> Sound {sound ? 'on' : 'off'}
    </button>
  );
}

function AgentTrace({ moment }: { moment: CoexistenceMoment }) {
  const [activePhase, setActivePhase] = useState<AgentTracePhase>('sense');
  const trace = moment.agent;
  const activeStep = trace.steps[activePhase];

  return (
    <section className="coexistence-agent" aria-labelledby="coexistence-agent-title">
      <header>
        <div>
          <p className="future-kicker">Wren · inspectable decision trace</p>
          <h3 id="coexistence-agent-title">What happened under the calm</h3>
        </div>
        <span>{trace.id}</span>
      </header>

      <ol aria-label="Wren’s agent loop">
        {AGENT_TRACE_PHASES.map((phase, index) => (
          <li key={phase}>
            <button type="button" aria-pressed={activePhase === phase} onClick={() => setActivePhase(phase)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b>{agentTraceLabels[phase]}</b>
              <small>{trace.steps[phase].status}</small>
            </button>
          </li>
        ))}
      </ol>

      <article aria-live="polite">
        <div>
          <span>{agentTraceLabels[activePhase]}</span>
          <b>{activeStep.status}</b>
        </div>
        <h4>{activeStep.summary}</h4>
        <p>{activeStep.detail}</p>
        <dl>
          <div><dt>Posture</dt><dd>{trace.posture}</dd></div>
          <div><dt>Confidence</dt><dd>{trace.confidence}%</dd></div>
          <div><dt>Known gap</dt><dd>{trace.uncertainty}</dd></div>
        </dl>
      </article>

      <footer>This is a decision record—inputs, policy, action, and retention—not hidden chain-of-thought.</footer>
    </section>
  );
}

function Dayline({ activeMoment, onSelect }: { activeMoment: CoexistenceMomentId; onSelect: (id: CoexistenceMomentId) => void }) {
  return (
    <nav className="coexistence-dayline" aria-label="A day with Wren">
      <p>One day, held lightly</p>
      <ol>
        {COEXISTENCE_MOMENT_IDS.map((id) => {
          const moment = coexistenceMoments[id];
          return (
            <li key={id}>
              <button type="button" aria-pressed={activeMoment === id} onClick={() => onSelect(id)}>
                <time>{moment.time}</time>
                <span>{moment.place}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CoexistenceRoom({ activeMoment, consent, onSelect }: {
  activeMoment: CoexistenceMomentId;
  consent: CoexistenceState['consent'];
  onSelect: (id: CoexistenceMomentId) => void;
}) {
  const object = (id: CoexistenceMomentId, className: string, label: string) => {
    const decision = consent[id];
    return (
      <button
        type="button"
        className={`coexistence-object ${className}`}
        data-consent={decision}
        aria-label={`${label}: ${coexistenceMoments[id].title}. Memory ${decision}.`}
        aria-pressed={activeMoment === id}
        onClick={() => onSelect(id)}
      >
        <span>{coexistenceMoments[id].time}</span>
      </button>
    );
  };

  return (
    <section className="coexistence-room" aria-label="Kevin’s apartment and studio across one day">
      <div className="coexistence-sun" aria-hidden="true"></div>
      <div className="coexistence-window" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="coexistence-ceiling-rail" aria-hidden="true"></div>
      <div className="coexistence-partition" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div className="coexistence-shelf" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="coexistence-table" aria-hidden="true"></div>
      <div className="coexistence-rug" aria-hidden="true"></div>
      <div className="coexistence-lounge" aria-hidden="true"><i></i><i></i></div>
      <div className="coexistence-room-label coexistence-room-label--kitchen" aria-hidden="true">Kitchen / local sensing</div>
      <div className="coexistence-room-label coexistence-room-label--studio" aria-hidden="true">Studio / mounted context</div>
      <div className="coexistence-room-label coexistence-room-label--living" aria-hidden="true">Living / guest-safe</div>
      <div className="coexistence-hand coexistence-hand--human" aria-hidden="true"></div>
      {object('morning', 'coexistence-object--mug', 'Warm mug on the kitchen table')}
      {object('making', 'coexistence-object--draft', 'Unfinished draft on the studio table')}
      {object('work', 'coexistence-object--window', 'Window desk at midday')}
      {object('care', 'coexistence-object--door', 'Apartment threshold at dusk')}
      {object('gathering', 'coexistence-object--glasses', 'Glasses after friends have gone')}
      <div className="wren-presence" data-behavior={activeMoment} aria-label={`Wren is present through the room: ${coexistenceMoments[activeMoment].companion}`}>
        <i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>
        <span>{activeMoment === 'care' ? 'Wren · private' : 'Wren · present'}</span>
      </div>
      <div className="wren-trace-rail" data-behavior={activeMoment} aria-hidden="true">
        {AGENT_TRACE_PHASES.map((phase) => <i key={phase} data-phase={phase}></i>)}
        <b></b>
      </div>
    </section>
  );
}

function CoexistenceExperience() {
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectMoment = useExperienceStore((state) => state.selectCoexistenceMoment);
  const resolveConsent = useExperienceStore((state) => state.resolveCompanionConsent);
  const setProvenance = useExperienceStore((state) => state.setCoexistenceProvenance);
  const sound = useExperienceStore((state) => state.sound);
  const { discover, enterYear } = useExperienceActions();
  const moment = coexistenceMoments[coexistence.activeMoment];
  const decision = coexistence.consent[coexistence.activeMoment];

  const chooseMoment = (momentId: CoexistenceMomentId) => {
    selectMoment(momentId);
    playFutureCue('presence', sound);
    trackAnalyticsEvent('coexistence_moment_opened', { moment: momentId });
  };

  const chooseConsent = (next: Exclude<CompanionConsent, 'unasked'>) => {
    resolveConsent(next);
    discover('human-gate', '2030');
    playFutureCue(next === 'kept' ? 'consent' : 'refusal', sound);
    trackAnalyticsEvent('coexistence_consent_decided', { moment: moment.id, decision: next });
  };

  return (
    <main className="future-native future-native--2030" data-future-native="2030" data-moment={moment.id}>
      <div className="coexistence-grain" aria-hidden="true"></div>
      <header className="future-masthead">
        <div><p>2030 · Co-Existence</p><h1>Morning, Together</h1><span>A smart home where every assist exposes its inputs, boundary, action, and memory.</span></div>
        <div><b>WREN · PRESENT</b><SoundControl /></div>
      </header>

      <div className="coexistence-stage">
        <Dayline activeMoment={moment.id} onSelect={chooseMoment} />
        <CoexistenceRoom activeMoment={moment.id} consent={coexistence.consent} onSelect={chooseMoment} />

        <section className="coexistence-dialogue" aria-live="polite" aria-labelledby="coexistence-moment-title">
          <div className="coexistence-dialogue__time"><time>{moment.time}</time><span>{moment.place}</span></div>
          <p className="future-kicker">A day in two voices</p>
          <h2 id="coexistence-moment-title">{moment.title}</h2>
          <blockquote><span>Kevin</span>{moment.human}</blockquote>
          <blockquote><span>Wren</span>{moment.companion}</blockquote>
          <div className="coexistence-ambient" aria-label="Ambient details">{moment.ambient}</div>

          <AgentTrace key={moment.id} moment={moment} />

          <fieldset className="coexistence-consent">
            <legend>{moment.invitation}</legend>
            <button type="button" aria-pressed={decision === 'kept'} onClick={() => chooseConsent('kept')}>Keep it with me</button>
            <button type="button" aria-pressed={decision === 'refused'} onClick={() => chooseConsent('refused')}>Let it end here</button>
            {decision !== 'unasked' && <output>{decision === 'kept' ? 'Carried—with permission.' : 'Gone. The room remembers nothing.'}</output>}
          </fieldset>

          <div className="coexistence-provenance">
            <button type="button" aria-expanded={coexistence.provenanceOpen} onClick={() => setProvenance(!coexistence.provenanceOpen)}>
              {coexistence.provenanceOpen ? 'Close infrastructure receipt' : 'Open infrastructure receipt'}
            </button>
            {coexistence.provenanceOpen && (
              <aside>
                <span>carried on TokenPak · TIP authority · PAK context</span>
                <p>{moment.receipt}</p>
              </aside>
            )}
          </div>
        </section>

        <button className="coexistence-forward" type="button" onClick={() => enterYear('2040')}>
          <span>Ten years pass</span>
          <b>Enter Morning, After</b>
        </button>
      </div>

      <footer className="future-disclosure"><span>Co-Existence</span><p>Wren exposes observable evidence, policy, action, and retention while private reasoning and human authority remain bounded.</p></footer>
    </main>
  );
}

function HologramPortrait({ onContinue, line, phase, memoryState, sourceOpen, certainty }: {
  onContinue: () => void;
  line: string;
  phase: ConsciousnessPhase;
  memoryState: PermissionedMemoryState;
  sourceOpen: boolean;
  certainty: 'record' | 'pattern' | 'conjecture';
}) {
  return (
    <button
      className="consciousness-portrait"
      type="button"
      data-phase={phase}
      data-memory={memoryState}
      data-source-open={sourceOpen || undefined}
      data-certainty={certainty}
      onClick={onContinue}
      aria-label={`Kevin hologram. Memory ${memoryState}. ${line}`}
    >
      <span className="consciousness-portrait__echo" aria-hidden="true">KEVIN</span>
      <span className="consciousness-portrait__head" aria-hidden="true">
        <i className="consciousness-portrait__hair"></i>
        <i className="consciousness-portrait__brow"></i>
        <i className="consciousness-portrait__eyes"></i>
        <i className="consciousness-portrait__nose"></i>
        <i className="consciousness-portrait__mouth"></i>
      </span>
      <span className="consciousness-portrait__neck" aria-hidden="true"></span>
      <span className="consciousness-portrait__body" aria-hidden="true"></span>
      <span className="consciousness-portrait__scan" aria-hidden="true"></span>
      <span className="consciousness-portrait__trace" aria-hidden="true"><i></i><i></i><i></i></span>
      <span className="consciousness-portrait__memory">{memoryState === 'retained' ? 'PERMISSIONED MEMORY' : memoryState === 'withheld' ? 'DELIBERATE BLANK' : 'OBSERVATION ONLY'}</span>
      <span className="consciousness-portrait__name">KEVIN / CONTINUING</span>
    </button>
  );
}

function ConsciousnessRoom({ selectedCue, coexistence, onSelect }: {
  selectedCue: ConsciousnessCueId;
  coexistence: CoexistenceState;
  onSelect: (id: ConsciousnessCueId) => void;
}) {
  const cueButton = (id: ConsciousnessCueId, className: string) => {
    const memoryState = getPermissionedMemoryState(coexistence, id);
    return (
      <button
        type="button"
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
  const sound = useExperienceStore((state) => state.sound);
  const { discover, enterYear } = useExperienceActions();
  const cue = consciousnessCues[consciousness.selectedCue];
  const memoryState = getPermissionedMemoryState(coexistence, cue.id);
  const memorySource = getPermissionedMemorySource(coexistence, cue.id);
  const line = getConsciousnessLine(cue, consciousness.behaviorPhase, memoryState);
  const phaseIndex = CONSCIOUSNESS_PHASES.indexOf(consciousness.behaviorPhase);
  const finished = consciousness.behaviorPhase === 'continue';

  const chooseCue = (cueId: ConsciousnessCueId) => {
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

  const speak = () => {
    if (!sound || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.rate = 0.86;
    utterance.pitch = 0.72;
    window.speechSynthesis.speak(utterance);
  };

  const decideRetention = (decision: Exclude<EncounterRetention, 'unasked'>) => {
    resolveRetention(decision);
    playFutureCue(decision === 'kept' ? 'consent' : 'refusal', sound);
    trackAnalyticsEvent('consciousness_encounter_retention', { decision });
  };

  return (
    <main className="future-native future-native--2040" data-future-native="2040" data-phase={consciousness.behaviorPhase} data-cue={cue.id} data-memory={memoryState}>
      <div className="consciousness-smoke" aria-hidden="true"><i></i><i></i><i></i></div>
      <header className="future-masthead">
        <div><p>2040 · Consciousness</p><h1>Morning, After</h1><span>In this imagined 2040, a Kevin-shaped intelligence remembers, reasons, acts—and knows when not to.</span></div>
        <div><b>{coexistence.keptMoments.length}/5 MEMORIES PERMITTED</b><SoundControl /></div>
      </header>

      <div className="consciousness-stage">
        <ConsciousnessRoom selectedCue={cue.id} coexistence={coexistence} onSelect={chooseCue} />
        <HologramPortrait onContinue={continueBehavior} line={line} phase={consciousness.behaviorPhase} memoryState={memoryState} sourceOpen={consciousness.sourceTraceOpen} certainty={cue.certainty} />

        <section className="consciousness-encounter" aria-live="polite" aria-labelledby="consciousness-cue-title">
          <ol aria-label="Kevin’s behavior loop">
            {CONSCIOUSNESS_PHASES.map((phase) => (
              <li key={phase} data-active={phase === consciousness.behaviorPhase} data-past={CONSCIOUSNESS_PHASES.indexOf(phase) < phaseIndex}>{phaseLabels[phase]}</li>
            ))}
          </ol>
          <p className="future-kicker">{phaseLabels[consciousness.behaviorPhase]} · {cue.action}</p>
          <h2 id="consciousness-cue-title">{cue.label}</h2>
          <blockquote>“{line}”</blockquote>
          {finished && <p className="consciousness-last-action">What he chose: “{cue.act}”</p>}

          <div className="consciousness-actions">
            {!finished && <button className="future-primary" type="button" onClick={continueBehavior}>Let Kevin {phaseLabels[CONSCIOUSNESS_PHASES[phaseIndex + 1]].toLowerCase()}</button>}
            <button type="button" onClick={speak}>{sound ? 'Hear Kevin say this' : 'Sound is off'}</button>
            <button type="button" aria-expanded={consciousness.sourceTraceOpen} onClick={() => setSourceTrace(!consciousness.sourceTraceOpen)}>Pull the sentence to its source</button>
          </div>

          {consciousness.sourceTraceOpen && (
            <aside className="consciousness-source" data-certainty={cue.certainty} data-memory={memoryState}>
              <span>{cue.certainty}</span>
              <i aria-hidden="true"></i>
              <p>{memorySource}</p>
              <small>Behavior basis · {cue.source}</small>
              {cue.certainty === 'conjecture' && <small>The thread ends here. Kevin will not turn inference into memory.</small>}
            </aside>
          )}

          {finished && (
            <fieldset className="consciousness-retention">
              <legend>“May I keep this?”</legend>
              <button type="button" aria-pressed={consciousness.encounterRetention === 'kept'} onClick={() => decideRetention('kept')}>Yes—only this encounter</button>
              <button type="button" aria-pressed={consciousness.encounterRetention === 'released'} onClick={() => decideRetention('released')}>No—let me disappear</button>
              {consciousness.encounterRetention !== 'unasked' && <output>{consciousness.encounterRetention === 'kept' ? 'Then I will remember that you chose to stay.' : 'Then this is the last trace. Goodbye.'}</output>}
            </fieldset>
          )}
        </section>

        <nav className="consciousness-cue-index" aria-label="Things Kevin can notice">
          {CONSCIOUSNESS_CUE_IDS.map((id) => <button key={id} type="button" aria-pressed={cue.id === id} onClick={() => chooseCue(id)}><span>{consciousnessCues[id].certainty} · {getPermissionedMemoryState(coexistence, id)}</span>{consciousnessCues[id].label}</button>)}
        </nav>

        <div className="consciousness-exits"><button type="button" onClick={() => enterYear('2030')}>Return to the living morning</button><Link href="/work/">What Kevin made</Link><Link href="/contact/">Reach the living Kevin</Link></div>
      </div>

      <footer className="future-disclosure"><span>Consciousness, imagined</span><p>This is authored design fiction: a reproduction of Kevin’s patterns, voice, memory boundaries, and agency—not a claim that consciousness can be transferred.</p></footer>
    </main>
  );
}

export function FutureExperience({ year }: { year: Extract<YearId, '2030' | '2040'> }) {
  const sound = useExperienceStore((state) => state.sound);
  const viewMode = useExperienceStore((state) => state.viewMode);
  useEffect(() => startFutureAtmosphere(year, sound && viewMode === 'interface'), [sound, viewMode, year]);
  return year === '2030' ? <CoexistenceExperience /> : <ConsciousnessExperience />;
}
