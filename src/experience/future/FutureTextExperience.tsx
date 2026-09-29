'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { YearId } from '@/content/data';
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
  type CompanionConsent,
  type EncounterRetention
} from './futureWorld';

function TextCoexistence() {
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const selectMoment = useExperienceStore((state) => state.selectCoexistenceMoment);
  const resolveConsent = useExperienceStore((state) => state.resolveCompanionConsent);
  const setProvenance = useExperienceStore((state) => state.setCoexistenceProvenance);
  const [exchangeIndex, setExchangeIndex] = useState(0);
  const { discover, navigateToYear } = useExperienceActions();
  const moment = coexistenceMoments[coexistence.activeMoment];
  const decision = coexistence.consent[moment.id];
  const lastIndex = moment.exchange.length - 1;
  const activeBeat = moment.exchange[Math.min(exchangeIndex, lastIndex)];
  const nextBeat = moment.exchange[exchangeIndex + 1];
  const revealed = exchangeIndex >= moment.revealAt;
  const nextMoment = getNextUnaskedMoment(coexistence);

  useEffect(() => { setExchangeIndex(0); }, [coexistence.activeMoment]);

  const chooseMoment = (id: typeof moment.id) => {
    selectMoment(id);
    setExchangeIndex(0);
  };

  const decide = (next: Exclude<CompanionConsent, 'unasked'>) => {
    resolveConsent(next);
    discover('human-gate', '2030');
  };

  return (
    <section className="future-text future-text--2030" aria-labelledby="future-text-coexistence-title">
      <header>
        <p className="eyebrow">2030 · Co-Existence · Imagined</p>
        <h2 id="future-text-coexistence-title">Morning, Together</h2>
        <p>{SAITO_INTRO} It notices the room, speaks first when useful, acts within the authority Kevin gave it, and knows when silence is the better response. {FUTURE_IMAGINED_LINE}</p>
      </header>

      <nav className="future-text-moments" aria-label="A day with Saito">
        {COEXISTENCE_MOMENT_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={moment.id === id} onClick={() => chooseMoment(id)}>
            <time>{coexistenceMoments[id].time}</time><b>{coexistenceMoments[id].place}</b><span>{coexistenceMoments[id].title}</span>
          </button>
        ))}
      </nav>

      <article className="future-text-scene">
        <p className="eyebrow">{moment.time} · {moment.place}</p>
        <h3>{moment.title}</h3>
        <p className="future-text-live"><b>Saito · {AGENT_TRACE_LABELS[activeBeat.phase]}</b>{activeBeat.signal}</p>
        <ol className="future-text-exchange" aria-label={`Conversation between Kevin and Saito at ${moment.time}`}>
          {moment.exchange.slice(0, exchangeIndex + 1).map((beat, index) => (
            <li key={`${beat.phase}-${index}`} data-speaker={beat.speaker}>
              <b>{beat.speaker === 'saito' ? 'Saito' : 'Kevin'}</b>
              <p>{beat.line}</p>
            </li>
          ))}
        </ol>
        <p className="sr-only" role="status">{activeBeat.speaker === 'saito' ? 'Saito' : 'Kevin'}: {activeBeat.line}</p>
        {nextBeat && (
          <div className="future-text-links">
            <button className="future-text-primary" type="button" onClick={() => setExchangeIndex((current) => Math.min(current + 1, lastIndex))}>
              {activeBeat.nextLabel}
            </button>
            <button type="button" onClick={() => setExchangeIndex(lastIndex)}>Skip to the question</button>
          </div>
        )}
        <p className="future-text-ambient"><b>In the room</b>{moment.ambient}</p>
        {revealed && (
          <>
            <p className="future-text-seed"><b>First said</b>{moment.seed.when} · {moment.seed.where} — {moment.seed.said}</p>
            <section className="future-text-staged" aria-label="What Saito already prepared">
              <p><b>Quiet work</b>{moment.incubation.span} · {moment.incubation.checks} checks · {moment.incubation.domains.join(', ')}</p>
              <ul>
                {moment.staged.map((item) => (
                  <li key={item.action} data-state={item.state}>
                    <b>{item.domain}</b>
                    <span>{item.action}</span>
                    <i>{STAGED_STATE_LABELS[item.state]}</i>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        <details className="future-text-agent future-text-authority">
          <summary>What Saito may do on its own</summary>
          <ol>
            {saitoAuthorityMap.map((tier) => (
              <li key={tier.domains}>
                <b>{tier.level}</b>
                <strong>{tier.domains}</strong>
                <p>{tier.meaning}</p>
              </li>
            ))}
          </ol>
          <footer>Kevin always commits by hand. Private quiet work never surfaces on shared screens.</footer>
        </details>
        <details className="future-text-agent">
          <summary>What Saito did and didn’t do</summary>
          <header>
            <p className="eyebrow">Saito’s record · {moment.time} {moment.place}</p>
            <h4>Inputs, interpretation, authority, action, and memory</h4>
            <span>{moment.agent.confidence}% confidence</span>
          </header>
          <ol>
            {AGENT_TRACE_PHASES.map((phase) => (
              <li key={phase}>
                <b>{AGENT_TRACE_LABELS[phase]} · {moment.agent.steps[phase].status}</b>
                <strong>{moment.agent.steps[phase].summary}</strong>
                <p>{moment.agent.steps[phase].detail}</p>
              </li>
            ))}
          </ol>
          <dl>
            <dt>Stance</dt><dd>{moment.agent.posture}</dd>
            <dt>Known gap</dt><dd>{moment.agent.uncertainty}</dd>
          </dl>
          <footer>This is a decision record—not hidden chain-of-thought.</footer>
        </details>
        {!nextBeat && (
          <fieldset>
            <legend>{moment.invitation}</legend>
            <button className="future-text-primary" type="button" aria-pressed={decision === 'kept'} onClick={() => decide('kept')}>Keep it with me</button>
            <button type="button" aria-pressed={decision === 'refused'} onClick={() => decide('refused')}>Let it end here</button>
            {decision !== 'unasked' && <output>{CONSENT_OUTCOMES[decision]}</output>}
            {decision !== 'unasked' && nextMoment && (
              <button type="button" onClick={() => chooseMoment(nextMoment)}>Next moment · {coexistenceMoments[nextMoment].time} {coexistenceMoments[nextMoment].place} →</button>
            )}
          </fieldset>
        )}
        <button className="future-text-provenance" type="button" aria-expanded={coexistence.provenanceOpen} onClick={() => setProvenance(!coexistence.provenanceOpen)}>Built on TokenPak</button>
        {coexistence.provenanceOpen && (
          <aside>
            <p>{moment.receipt}</p>
            <p>Saito imagines where TokenPak—the local-first context layer I’m building now—could lead. <Link href="/work/tokenpak/">Read the TokenPak case study</Link></p>
          </aside>
        )}
      </article>

      <button className="future-text-primary" type="button" onClick={() => navigateToYear('2040')}>Ten years pass · Enter Morning, After</button>
      <footer><b>Imagined:</b> Saito is design fiction. What it notices, may do, and keeps stays inspectable—without exposing private reasoning.</footer>
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
  const resetFutureJourney = useExperienceStore((state) => state.resetFutureJourney);
  const { discover, navigateToYear } = useExperienceActions();
  const cue = consciousnessCues[consciousness.selectedCue];
  const memoryState = getPermissionedMemoryState(coexistence, cue.id);
  const memorySource = getPermissionedMemorySource(coexistence, cue.id);
  const phaseIndex = CONSCIOUSNESS_PHASES.indexOf(consciousness.behaviorPhase);
  const continueLabel = getConsciousnessContinueLabel(consciousness.behaviorPhase);
  const finished = consciousness.behaviorPhase === 'continue';
  const retention = consciousness.encounterRetention;
  const released = retention === 'released';
  const unwitnessed = COEXISTENCE_MOMENT_IDS.every((id) => coexistence.consent[id] === 'unasked');
  const earnedLine = getEarnedMemoryLine(coexistence);
  const line = getConsciousnessLine(cue, consciousness.behaviorPhase, memoryState);

  const continueBehavior = () => {
    if (finished) return;
    if (CONSCIOUSNESS_PHASES[phaseIndex + 1] === 'continue') discover('next-layer-message', '2040');
    advance();
  };

  const retain = (decision: Exclude<EncounterRetention, 'unasked'>) => resolveRetention(decision);

  return (
    <section className="future-text future-text--2040" data-memory={memoryState} aria-labelledby="future-text-consciousness-title">
      <header>
        <p className="eyebrow">2040 · Consciousness · Imagined</p>
        <h2 id="future-text-consciousness-title">Morning, After</h2>
        <p>Ten years on, a holographic reproduction of Kevin notices, recalls, deliberates, and acts—or refuses—within the permissions left behind in 2030.</p>
        {unwitnessed ? (
          <p className="future-text-memory-line">{UNWITNESSED_LINE} <button type="button" onClick={() => navigateToYear('2030')}>Go live the morning first</button></p>
        ) : earnedLine && <p className="future-text-memory-line">{earnedLine}</p>}
      </header>

      <nav className="future-text-cues" aria-label="Things Kevin can notice">
        {CONSCIOUSNESS_CUE_IDS.map((id) => (
          <button key={id} type="button" disabled={released} data-memory={getPermissionedMemoryState(coexistence, id)} aria-pressed={cue.id === id} onClick={() => selectCue(id)}>
            <span>{consciousnessCues[id].certainty} · {getPermissionedMemoryState(coexistence, id)}</span><b>{consciousnessCues[id].label}</b>
          </button>
        ))}
      </nav>

      {retention !== 'unasked' ? (
        <FutureClosing
          retention={retention}
          variant="text"
          onStartOver={() => navigateToYear('1990')}
          onLiveAgain={() => { resetFutureJourney(); navigateToYear('2030'); }}
        />
      ) : (
        <article className="future-text-scene future-text-scene--consciousness">
          <ol className="future-text-behavior" aria-label="Kevin’s behavior loop">
            {CONSCIOUSNESS_PHASES.map((phase) => <li key={phase} aria-current={phase === consciousness.behaviorPhase ? 'step' : undefined}>{CONSCIOUSNESS_PHASE_LABELS[phase]}</li>)}
          </ol>
          <p className="eyebrow">{CONSCIOUSNESS_PHASE_LABELS[consciousness.behaviorPhase]} · {cue.action}</p>
          <h3>{cue.label}</h3>
          <blockquote>“{line}”</blockquote>
          <p className="sr-only" role="status">{line}</p>
          {finished && <p>What he chose: “{cue.act}”</p>}
          {continueLabel && <button className="future-text-primary" type="button" onClick={continueBehavior}>{continueLabel}</button>}
          <button className="future-text-provenance" type="button" aria-expanded={consciousness.sourceTraceOpen} onClick={() => setSourceTrace(!consciousness.sourceTraceOpen)}>Pull the sentence to its source</button>
          {consciousness.sourceTraceOpen && <aside data-certainty={cue.certainty} data-memory={memoryState}><b>{cue.certainty}</b><p>{memorySource}</p><small>Behavior basis · {cue.source}</small>{cue.certainty === 'conjecture' && <small>The thread ends here. Kevin will not turn inference into memory.</small>}</aside>}

          {finished && (
            <fieldset>
              <legend>“May I keep this?”</legend>
              <button className="future-text-primary" type="button" onClick={() => retain('kept')}>Yes—only this encounter</button>
              <button type="button" onClick={() => retain('released')}>No—let me disappear</button>
            </fieldset>
          )}
        </article>
      )}

      {retention === 'unasked' && (
        <div className="future-text-links"><Link href="/contact/">Reach the living Kevin</Link><Link href="/work/">What Kevin made</Link><button type="button" onClick={() => navigateToYear('2030')}>Return to the living morning</button></div>
      )}
      <footer><b>Imagined:</b> authored design fiction—a reproduction of Kevin’s patterns, voice, and memory boundaries, not a claim that consciousness can be transferred.</footer>
    </section>
  );
}

export function FutureTextExperience({ year }: { year: Extract<YearId, '2030' | '2040'> }) {
  return year === '2030' ? <TextCoexistence /> : <TextConsciousness />;
}
