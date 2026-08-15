'use client';

import Link from 'next/link';
import type { YearId } from '@/content/data';
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
  type CompanionConsent,
  type AgentTracePhase,
  type ConsciousnessPhase,
  type EncounterRetention
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
  act: 'Speak, demonstrate, initiate, or refuse',
  continue: 'Continue'
};

function TextCoexistence() {
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectMoment = useExperienceStore((state) => state.selectCoexistenceMoment);
  const resolveConsent = useExperienceStore((state) => state.resolveCompanionConsent);
  const setProvenance = useExperienceStore((state) => state.setCoexistenceProvenance);
  const { discover, navigateToYear } = useExperienceActions();
  const moment = coexistenceMoments[coexistence.activeMoment];
  const decision = coexistence.consent[moment.id];

  const decide = (next: Exclude<CompanionConsent, 'unasked'>) => {
    resolveConsent(next);
    discover('human-gate', '2030');
  };

  return (
    <section className="future-text future-text--2030" aria-labelledby="future-text-coexistence-title">
      <header>
        <p className="eyebrow">2030 · Co-Existence</p>
        <h2 id="future-text-coexistence-title">Morning, Together</h2>
        <p>Human and AI collaborators share an ordinary day. Wren makes each assist legible through observable inputs, interpretation, authority, action, and retention.</p>
      </header>

      <nav className="future-text-moments" aria-label="A compressed day with Wren">
        {COEXISTENCE_MOMENT_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={moment.id === id} onClick={() => selectMoment(id)}>
            <time>{coexistenceMoments[id].time}</time><b>{coexistenceMoments[id].place}</b><span>{coexistenceMoments[id].title}</span>
          </button>
        ))}
      </nav>

      <article className="future-text-scene" aria-live="polite">
        <p className="eyebrow">{moment.time} · {moment.place}</p>
        <h3>{moment.title}</h3>
        <dl>
          <dt>Kevin</dt><dd>{moment.human}</dd>
          <dt>Wren</dt><dd>{moment.companion}</dd>
          <dt>In the room</dt><dd>{moment.ambient}</dd>
        </dl>
        <section className="future-text-agent" aria-labelledby="future-text-agent-title">
          <header>
            <p className="eyebrow">Wren · inspectable decision trace</p>
            <h4 id="future-text-agent-title">What happened under the calm</h4>
            <span>{moment.agent.id} · {moment.agent.confidence}% confidence</span>
          </header>
          <ol>
            {AGENT_TRACE_PHASES.map((phase) => (
              <li key={phase}>
                <b>{agentTraceLabels[phase]} · {moment.agent.steps[phase].status}</b>
                <strong>{moment.agent.steps[phase].summary}</strong>
                <p>{moment.agent.steps[phase].detail}</p>
              </li>
            ))}
          </ol>
          <dl>
            <dt>Posture</dt><dd>{moment.agent.posture}</dd>
            <dt>Known gap</dt><dd>{moment.agent.uncertainty}</dd>
          </dl>
          <footer>This is a decision record—not hidden chain-of-thought.</footer>
        </section>
        <fieldset>
          <legend>{moment.invitation}</legend>
          <button className="future-text-primary" type="button" aria-pressed={decision === 'kept'} onClick={() => decide('kept')}>Keep it with me</button>
          <button type="button" aria-pressed={decision === 'refused'} onClick={() => decide('refused')}>Let it end here</button>
          {decision !== 'unasked' && <output>{decision === 'kept' ? 'Carried—with permission.' : 'Gone. The room remembers nothing.'}</output>}
        </fieldset>
        <button className="future-text-provenance" type="button" aria-expanded={coexistence.provenanceOpen} onClick={() => setProvenance(!coexistence.provenanceOpen)}>Open infrastructure receipt</button>
        {coexistence.provenanceOpen && <aside><b>carried on TokenPak · TIP authority · PAK context</b><p>{moment.receipt}</p></aside>}
      </article>

      <button className="future-text-primary" type="button" onClick={() => navigateToYear('2040')}>Ten years pass · Enter Morning, After</button>
      <footer><b>Co-Existence:</b> AI is a daily companion; memory infrastructure is the quiet spine beneath the relationship.</footer>
    </section>
  );
}

function TextConsciousness() {
  const consciousness = useExperienceStore((state) => state.futureJourney.consciousness);
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectCue = useExperienceStore((state) => state.selectConsciousnessCue);
  const advance = useExperienceStore((state) => state.advanceConsciousnessBehavior);
  const setSourceTrace = useExperienceStore((state) => state.setConsciousnessSourceTrace);
  const resolveRetention = useExperienceStore((state) => state.resolveEncounterRetention);
  const { discover, navigateToYear } = useExperienceActions();
  const cue = consciousnessCues[consciousness.selectedCue];
  const memoryState = getPermissionedMemoryState(coexistence, cue.id);
  const memorySource = getPermissionedMemorySource(coexistence, cue.id);
  const phaseIndex = CONSCIOUSNESS_PHASES.indexOf(consciousness.behaviorPhase);
  const finished = consciousness.behaviorPhase === 'continue';

  const continueBehavior = () => {
    if (finished) return;
    if (CONSCIOUSNESS_PHASES[phaseIndex + 1] === 'continue') discover('next-layer-message', '2040');
    advance();
  };

  const retain = (decision: Exclude<EncounterRetention, 'unasked'>) => resolveRetention(decision);

  return (
    <section className="future-text future-text--2040" data-memory={memoryState} aria-labelledby="future-text-consciousness-title">
      <header>
        <p className="eyebrow">2040 · Consciousness</p>
        <h2 id="future-text-consciousness-title">Morning, After</h2>
        <p>In this imagined 2040, a cyberpunk holographic reproduction of Kevin notices, recalls, deliberates, speaks, initiates, acts, and refuses within the permissions Kevin left behind.</p>
        <small>{coexistence.keptMoments.length}/5 memories permitted by the living day.</small>
      </header>

      <nav className="future-text-cues" aria-label="Environmental cues Kevin can notice">
        {CONSCIOUSNESS_CUE_IDS.map((id) => (
          <button key={id} type="button" data-memory={getPermissionedMemoryState(coexistence, id)} aria-pressed={cue.id === id} onClick={() => selectCue(id)}>
            <span>{consciousnessCues[id].certainty} · {getPermissionedMemoryState(coexistence, id)}</span><b>{consciousnessCues[id].label}</b>
          </button>
        ))}
      </nav>

      <article className="future-text-scene future-text-scene--consciousness" aria-live="polite">
        <ol className="future-text-behavior" aria-label="Kevin’s behavior loop">
          {CONSCIOUSNESS_PHASES.map((phase) => <li key={phase} aria-current={phase === consciousness.behaviorPhase ? 'step' : undefined}>{phaseLabels[phase]}</li>)}
        </ol>
        <p className="eyebrow">{phaseLabels[consciousness.behaviorPhase]} · {cue.action}</p>
        <h3>{cue.label}</h3>
        <blockquote>“{getConsciousnessLine(cue, consciousness.behaviorPhase, memoryState)}”</blockquote>
        {finished && <p>What Kevin chose: “{cue.act}”</p>}
        {!finished && <button className="future-text-primary" type="button" onClick={continueBehavior}>Continue Kevin’s thought</button>}
        <button className="future-text-provenance" type="button" aria-expanded={consciousness.sourceTraceOpen} onClick={() => setSourceTrace(!consciousness.sourceTraceOpen)}>Pull the sentence to its source</button>
        {consciousness.sourceTraceOpen && <aside data-certainty={cue.certainty} data-memory={memoryState}><b>{cue.certainty}</b><p>{memorySource}</p><small>Behavior basis · {cue.source}</small>{cue.certainty === 'conjecture' && <small>The inference frays here; it will not become a claimed memory.</small>}</aside>}

        {finished && (
          <fieldset>
            <legend>“May I keep this?”</legend>
            <button className="future-text-primary" type="button" aria-pressed={consciousness.encounterRetention === 'kept'} onClick={() => retain('kept')}>Yes—only this encounter</button>
            <button type="button" aria-pressed={consciousness.encounterRetention === 'released'} onClick={() => retain('released')}>No—let me disappear</button>
            {consciousness.encounterRetention !== 'unasked' && <output>{consciousness.encounterRetention === 'kept' ? 'Then I will remember that you chose to stay.' : 'Then this is the last trace. Goodbye.'}</output>}
          </fieldset>
        )}
      </article>

      <div className="future-text-links"><button type="button" onClick={() => navigateToYear('2030')}>Return to the living morning</button><Link href="/work/">What Kevin made</Link><Link href="/contact/">Reach the living Kevin</Link></div>
      <footer><b>Consciousness, imagined:</b> an authored reproduction, not a claim that a biological person can be transferred.</footer>
    </section>
  );
}

export function FutureTextExperience({ year }: { year: Extract<YearId, '2030' | '2040'> }) {
  return year === '2030' ? <TextCoexistence /> : <TextConsciousness />;
}
