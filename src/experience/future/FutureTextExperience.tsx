'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import type { YearId } from '@/content/data';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';
import {
  echoMemoryRecords,
  ECHO_FINALE_SUMMARY,
  ECHO_FINALE_TITLE,
  FUTURE_MISSION_IDS,
  futureAgentLabels,
  futureMissionTemplates,
  type EchoMemoryId,
  type FutureDecision
} from './futureJourney';

const memoryOrder = Object.keys(echoMemoryRecords) as EchoMemoryId[];
const echoPrompts = [
  'Who are you?',
  'What do you build?',
  'What do you believe about technology?',
  'What changed between 1990 and 2040?',
  'What remains human?',
  'What happened in the mission?'
];

function textTaskStatus(index: number, activeIndex: number, phase: string) {
  if (phase === 'decision' || phase === 'complete' || index < activeIndex) return 'complete';
  if (phase === 'orchestrating' && index === activeIndex) return 'active';
  return 'queued';
}

function TextMissionBrief() {
  const mission = useExperienceStore((state) => state.futureJourney.mission);
  const chooseMission = useExperienceStore((state) => state.chooseFutureMission);
  const setObjective = useExperienceStore((state) => state.setFutureObjective);
  const setAnswer = useExperienceStore((state) => state.setFutureAnswer);
  const setAutonomy = useExperienceStore((state) => state.setFutureAutonomy);
  const beginMission = useExperienceStore((state) => state.beginFutureMission);
  const template = futureMissionTemplates[mission.selectedMissionId];
  const answersComplete = template.questions.every((question) => Boolean(mission.answers[question.id]));
  const canStart = mission.objective.trim().length >= 12 && answersComplete;

  return (
    <section className="future-text-card" aria-labelledby="future-text-mission-title">
      <p className="eyebrow">Operational mission</p>
      <h3 id="future-text-mission-title">Configure a governed collaboration</h3>
      <label className="future-text-field">Mission type
        <select value={mission.selectedMissionId} onChange={(event) => chooseMission(event.target.value as typeof mission.selectedMissionId)}>
          {FUTURE_MISSION_IDS.map((missionId) => <option key={missionId} value={missionId}>{futureMissionTemplates[missionId].label}</option>)}
        </select>
      </label>
      <p>{template.thesis}</p>
      <label className="future-text-field">Objective
        <textarea rows={4} value={mission.objective} onChange={(event) => setObjective(event.target.value)} />
      </label>
      <div className="future-text-fields">
        {template.questions.map((question) => (
          <label className="future-text-field" key={question.id}>{question.label}
            <select value={mission.answers[question.id] ?? ''} onChange={(event) => setAnswer(question.id, event.target.value)}>
              <option value="" disabled>Select one</option>
              {question.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
      <label className="future-text-field future-text-autonomy">AI initiative boundary: {mission.autonomy} / 5
        <input type="range" min="1" max="5" value={mission.autonomy} onChange={(event) => setAutonomy(Number(event.target.value))} />
        <small>Higher initiative delegates more reversible work. Consequential decisions still stop at the human gate.</small>
      </label>
      <button className="future-text-primary" type="button" disabled={!canStart} onClick={beginMission}>Initialize collaboration</button>
      {!answersComplete && <p role="status">Choose both mission constraints to continue.</p>}
    </section>
  );
}

function TextMissionRun() {
  const mission = useExperienceStore((state) => state.futureJourney.mission);
  const advanceMission = useExperienceStore((state) => state.advanceFutureMission);
  const resolveMission = useExperienceStore((state) => state.resolveFutureMission);
  const chooseMission = useExperienceStore((state) => state.chooseFutureMission);
  const { discover, navigateToYear } = useExperienceActions();
  const run = mission.run;
  if (!run) return null;

  const advance = () => {
    if (mission.activeTaskIndex >= run.tasks.length - 1) discover('human-gate', '2030');
    advanceMission();
  };
  const decide = (decision: FutureDecision) => resolveMission(decision);

  return (
    <section className="future-text-card" aria-live="polite">
      <header className="future-text-card__header"><div><p className="eyebrow">Mission state</p><h3>{futureMissionTemplates[run.missionId].label}</h3></div><b>{mission.phase}</b></header>
      <p>{run.objective}</p>
      <ol className="future-text-tasks">
        {run.tasks.map((task, index) => {
          const status = textTaskStatus(index, mission.activeTaskIndex, mission.phase);
          return <li key={task.id} data-status={status}><span>{futureAgentLabels[task.agent]} · {task.mode} · {status}</span><b>{task.label}</b><p>{task.detail}</p><small>{task.confidence}% confidence · Uncertainty: {task.uncertainty}</small></li>;
        })}
      </ol>
      <div className="future-text-evidence"><p className="eyebrow">Verified evidence</p>{run.evidenceSlugs.map((slug) => <Link key={slug} href={`/work/${slug}/`}>{slug}</Link>)}</div>
      <aside className="future-text-conflict"><b>Conflict surfaced</b><p>{run.disagreement}</p></aside>
      {mission.phase === 'orchestrating' && <button className="future-text-primary" type="button" onClick={advance}>{mission.activeTaskIndex === run.tasks.length - 1 ? 'Send to human decision gate' : 'Run next collaboration step'}</button>}
      {mission.phase === 'decision' && (
        <section className="future-text-gate" aria-labelledby="future-text-gate-title">
          <p className="eyebrow">Human decision gate · Review required</p>
          <h4 id="future-text-gate-title">The system stopped before consequential action.</h4>
          <p>{run.humanGateReason}</p>
          <div><button className="future-text-primary" type="button" onClick={() => decide('approve')}>Approve bounded step</button><button type="button" onClick={() => decide('revise')}>Revise and narrow</button><button type="button" onClick={() => decide('reject')}>Reject mission</button></div>
        </section>
      )}
      {mission.phase === 'complete' && mission.artifact && (
        <section className="future-text-receipt" aria-labelledby="future-text-receipt-title">
          <p className="eyebrow">Continuation packet sealed · {mission.artifact.status}</p>
          <h4 id="future-text-receipt-title">{mission.artifact.receiptId}</h4>
          <p>{mission.artifact.summary}</p>
          <dl><dt>Human decision</dt><dd>{mission.artifact.decision}</dd><dt>Next step</dt><dd>{mission.artifact.nextStep}</dd><dt>Constraints</dt><dd>{Object.values(mission.artifact.answers).join(' · ') || 'Not specified'}</dd></dl>
          <div><button className="future-text-primary" type="button" onClick={() => navigateToYear('2040')}>Continue with this receipt in 2040</button><button type="button" onClick={() => chooseMission(mission.selectedMissionId)}>Run another mission</button></div>
        </section>
      )}
    </section>
  );
}

function TextNexus() {
  const mission = useExperienceStore((state) => state.futureJourney.mission);
  return (
    <section className="future-text future-text--2030" aria-labelledby="future-text-nexus-title">
      <header><p className="eyebrow">2030 functional text experience</p><h2 id="future-text-nexus-title">Kevin Nexus</h2><p>Clarifier, Researcher, Architect, Builder, and Governor coordinate evidence-bounded work. Human and AI collaborators expose uncertainty and stop at consequential authority.</p></header>
      {mission.phase === 'brief' ? <TextMissionBrief /> : <TextMissionRun />}
      <footer><b>Projection, not prediction.</b> This deterministic local design fiction contacts no external AI service.</footer>
    </section>
  );
}

function TextEcho() {
  const journey = useExperienceStore((state) => state.futureJourney);
  const interpretThought = useExperienceStore((state) => state.interpretEchoThought);
  const openMemory = useExperienceStore((state) => state.openEchoMemory);
  const markFinaleSeen = useExperienceStore((state) => state.markEchoFinaleSeen);
  const [thought, setThought] = useState('');
  const { discover, navigateToYear } = useExperienceActions();
  const response = journey.echo.response;

  const submit = (value: string) => {
    const next = value.trim();
    if (!next) return;
    interpretThought(next);
    setThought('');
  };
  const transmit = (event: FormEvent) => { event.preventDefault(); submit(thought); };
  const synthesize = () => {
    markFinaleSeen();
    discover('next-layer-message', '2040');
  };

  return (
    <section className="future-text future-text--2040" aria-labelledby="future-text-echo-title">
      <header><p className="eyebrow">2040 functional text experience</p><h2 id="future-text-echo-title">Kevin Echo</h2><p>A sourced representation assembled from approved records and this local journey—not the biological Kevin or a claim of transferred consciousness.</p><label>Resonance <progress max="100" value={journey.echo.resonance}>{journey.echo.resonance}%</progress> {journey.echo.resonance}%</label></header>
      {journey.mission.artifact ? <p className="future-text-mounted">Mounted receipt: <b>{journey.mission.artifact.receiptId}</b> · {journey.mission.artifact.status}</p> : <p className="future-text-mounted">No governed 2030 receipt is mounted.</p>}
      <section className="future-text-card" aria-labelledby="future-text-thought-title">
        <p className="eyebrow">Evidence-bounded thought interpreter</p><h3 id="future-text-thought-title">Ask about verified work, values, continuity, or the mission</h3>
        <div className="future-text-prompts">{echoPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => submit(prompt)}>{prompt}</button>)}</div>
        <form onSubmit={transmit}><label className="future-text-field">Transmit a thought<textarea rows={3} value={thought} onChange={(event) => setThought(event.target.value)} /></label><button className="future-text-primary" type="submit" disabled={!thought.trim()}>Interpret signal</button></form>
        <div className="future-text-response" aria-live="polite">{response ? <><p className="eyebrow">{response.label}</p><p>{response.answer}</p><p><b>Sources:</b> {response.sources.join(' · ')}</p></> : <p>Unsupported details fail closed instead of becoming invented memories.</p>}</div>
      </section>
      <section className="future-text-card" aria-labelledby="future-text-memory-title">
        <p className="eyebrow">Memory constellation · {journey.echo.openedMemories.length} / 3 to synthesis</p><h3 id="future-text-memory-title">Reconstruct three unique signals</h3>
        <div className="future-text-memories">{memoryOrder.map((memoryId) => {
          const memory = echoMemoryRecords[memoryId];
          const opened = journey.echo.openedMemories.includes(memoryId);
          return <button key={memoryId} type="button" aria-pressed={opened} onClick={() => openMemory(memoryId)}><span>{memoryId}</span><b>{memory.title}</b><small>{opened ? memory.reconstruction : memory.signal}</small></button>;
        })}</div>
        {journey.echo.synthesisReady ? <button className="future-text-primary" type="button" onClick={synthesize}>{journey.echo.finaleSeen ? 'Replay continuity synthesis' : 'Synthesize continuity'}</button> : <p>Open {Math.max(0, 3 - journey.echo.openedMemories.length)} more unique memories to reveal the final pattern.</p>}
      </section>
      {journey.echo.finaleSeen && (
        <section className="future-text-finale" aria-labelledby="future-text-finale-title">
          <p className="eyebrow">Continuity synthesis complete</p><h3 id="future-text-finale-title">{ECHO_FINALE_TITLE}</h3><p>{ECHO_FINALE_SUMMARY}</p>
          {journey.mission.artifact && <blockquote>“{journey.mission.artifact.continuationSignal}”<cite>{journey.mission.artifact.receiptId} · human decision preserved</cite></blockquote>}
          <div><Link href="/work/">View Kevin’s work</Link><Link href="/contact/">Contact Kevin</Link><button type="button" onClick={() => navigateToYear('1990')}>Return to 1990</button></div>
        </section>
      )}
      <aside className="future-text-integrity"><b>Source integrity:</b> Echo knows only canonical portfolio records, this local journey, and its governed mission receipt. It cannot create facts, memories, permission, or human authority.</aside>
    </section>
  );
}

export function FutureTextExperience({ year }: { year: Extract<YearId, '2030' | '2040'> }) {
  return year === '2030' ? <TextNexus /> : <TextEcho />;
}
