'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type RefObject } from 'react';
import { projects, type YearId } from '@/content/data';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { playFutureCue, playInterfaceTone, startFutureAtmosphere } from '../audio';
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
  type EchoResponse,
  type FutureDecision,
  type FutureMissionId,
  type MissionTask
} from './futureJourney';

const projectIndex = new Map<string, (typeof projects)[number]>(projects.map((project) => [project.slug, project]));
const memoryOrder = Object.keys(echoMemoryRecords) as EchoMemoryId[];

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

function MissionRail({ selected, onSelect }: { selected: FutureMissionId; onSelect: (id: FutureMissionId) => void }) {
  return (
    <nav className="nexus-mission-rail" aria-label="Mission types">
      <p>Mission library</p>
      <div>
        {FUTURE_MISSION_IDS.map((id, index) => {
          const template = futureMissionTemplates[id];
          return (
            <button key={id} type="button" className={selected === id ? 'is-selected' : ''} aria-pressed={selected === id} onClick={() => onSelect(id)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b>{template.shortLabel}</b>
              <small>{template.thesis}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function taskStatus(taskIndex: number, activeTaskIndex: number, phase: string) {
  if (phase === 'brief') return 'waiting';
  if (phase === 'complete' || phase === 'decision' || taskIndex < activeTaskIndex) return 'complete';
  if (phase === 'orchestrating' && taskIndex === activeTaskIndex) return 'active';
  return 'queued';
}

function MissionCore({ tasks, activeTaskIndex, phase }: { tasks: MissionTask[]; activeTaskIndex: number; phase: string }) {
  const agentIds = Object.keys(futureAgentLabels) as Array<keyof typeof futureAgentLabels>;
  return (
    <section className={`nexus-core nexus-core--${phase}`} aria-label="Human and AI collaboration core">
      <div className="nexus-core__halo" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="nexus-core__center">
        <span>{phase === 'brief' ? 'INTENT' : phase === 'orchestrating' ? `${Math.min(activeTaskIndex + 1, 5)}/5` : phase === 'decision' ? 'GATE' : 'SEALED'}</span>
        <b>{phase === 'brief' ? 'Awaiting objective' : phase === 'orchestrating' ? 'Context moving' : phase === 'decision' ? 'Human authority' : 'Memory packet'}</b>
      </div>
      {agentIds.map((agent, index) => {
        const taskIndex = tasks.findIndex((task) => task.agent === agent);
        const status = taskIndex < 0 ? 'waiting' : taskStatus(taskIndex, activeTaskIndex, phase);
        return (
          <div key={agent} className="nexus-agent-node" data-agent={agent} data-status={status} style={{ '--agent-index': index } as CSSProperties}>
            <i aria-hidden="true"></i>
            <span>{agent === 'governor' ? 'H' : 'AI'}</span>
            <b>{futureAgentLabels[agent]}</b>
            <small>{status}</small>
          </div>
        );
      })}
    </section>
  );
}

function MissionBrief() {
  const journey = useExperienceStore((state) => state.futureJourney);
  const setObjective = useExperienceStore((state) => state.setFutureObjective);
  const setAnswer = useExperienceStore((state) => state.setFutureAnswer);
  const setAutonomy = useExperienceStore((state) => state.setFutureAutonomy);
  const beginMission = useExperienceStore((state) => state.beginFutureMission);
  const sound = useExperienceStore((state) => state.sound);
  const template = futureMissionTemplates[journey.mission.selectedMissionId];
  const answersComplete = template.questions.every((question) => Boolean(journey.mission.answers[question.id]));
  const canStart = journey.mission.objective.trim().length >= 12 && answersComplete;

  return (
    <section className="nexus-brief future-panel" aria-labelledby="nexus-brief-title">
      <header><p className="future-kicker">Shared objective</p><h2 id="nexus-brief-title">{template.label}</h2><p>{template.thesis}</p></header>
      <label className="future-field">Objective<textarea value={journey.mission.objective} onChange={(event) => setObjective(event.target.value)} rows={3} /></label>
      <div className="nexus-questions">
        {template.questions.map((question) => (
          <fieldset key={question.id}>
            <legend>{question.label}</legend>
            <div>{question.options.map((option) => <button key={option} type="button" aria-pressed={journey.mission.answers[question.id] === option} onClick={() => setAnswer(question.id, option)}>{option}</button>)}</div>
          </fieldset>
        ))}
      </div>
      <label className="nexus-autonomy-control">
        <span><b>AI initiative boundary</b><output>{journey.mission.autonomy} / 5</output></span>
        <input type="range" min="1" max="5" value={journey.mission.autonomy} onChange={(event) => setAutonomy(Number(event.target.value))} />
        <small>{journey.mission.autonomy >= 4 ? 'High initiative delegates reversible work, but the final human gate remains mandatory.' : 'Lower initiative keeps more work human-led and exposes additional review points.'}</small>
      </label>
      <div className="future-action-row">
        <button className="future-primary" type="button" disabled={!canStart} onClick={() => {
          beginMission();
          playFutureCue('mission-start', sound);
          trackAnalyticsEvent('nexus_mission_started', { mission: template.id, autonomy: journey.mission.autonomy });
        }}>Initialize collaboration</button>
        {!answersComplete && <small role="status">Choose both mission constraints to continue.</small>}
      </div>
    </section>
  );
}

function EvidenceLinks({ slugs }: { slugs: string[] }) {
  return (
    <div className="nexus-evidence-links">
      <p className="future-kicker">Verified evidence mounted</p>
      <div>{slugs.map((slug) => {
        const project = projectIndex.get(slug);
        if (!project) return null;
        return <Link key={slug} href={`/work/${slug}/`}><span>◈</span><b>{project.title}</b><small>{project.summary}</small></Link>;
      })}</div>
    </div>
  );
}

function MissionRunPanel() {
  const journey = useExperienceStore((state) => state.futureJourney);
  const resolveMission = useExperienceStore((state) => state.resolveFutureMission);
  const chooseMission = useExperienceStore((state) => state.chooseFutureMission);
  const sound = useExperienceStore((state) => state.sound);
  const { enterYear } = useExperienceActions();
  const { mission } = journey;
  const run = mission.run;
  if (!run) return null;

  const decide = (decision: FutureDecision) => {
    resolveMission(decision);
    playFutureCue('receipt', sound);
    trackAnalyticsEvent('nexus_human_decision', { mission: run.missionId, decision, autonomy: run.autonomy });
  };

  return (
    <section className="nexus-run-panel future-panel" aria-live="polite">
      <header><div><p className="future-kicker">Live orchestration</p><h2>{futureMissionTemplates[run.missionId].label}</h2></div><span className={`future-status future-status--${mission.phase}`}>{mission.phase}</span></header>
      <p className="nexus-run-objective">{run.objective}</p>
      <div className="nexus-task-list">
        {run.tasks.map((task, index) => {
          const status = taskStatus(index, mission.activeTaskIndex, mission.phase);
          return (
            <article key={task.id} data-status={status}>
              <span>{index + 1}</span>
              <div><p>{futureAgentLabels[task.agent]} · {task.mode}</p><h3>{task.label}</h3><small>{task.detail}</small></div>
              <aside><b>{task.confidence}%</b><small>{task.uncertainty}</small></aside>
            </article>
          );
        })}
      </div>
      <EvidenceLinks slugs={run.evidenceSlugs} />
      <aside className="nexus-disagreement"><span>CONFLICT SURFACED</span><p>{run.disagreement}</p></aside>
      {mission.phase === 'decision' && (
        <section className="nexus-decision-gate">
          <header><span>HUMAN DECISION GATE</span><b>REVIEW REQUIRED</b></header>
          <p>{run.humanGateReason}</p>
          <details><summary>Ask why this stopped</summary><p>The recommendation changes scope or commitments. Evidence can inform that choice, but the system cannot own its consequences.</p></details>
          <div><button className="future-primary" type="button" onClick={() => decide('approve')}>Approve bounded step</button><button type="button" onClick={() => decide('revise')}>Revise and narrow</button><button type="button" onClick={() => decide('reject')}>Reject mission</button></div>
        </section>
      )}
      {mission.phase === 'complete' && mission.artifact && (
        <section className="nexus-receipt">
          <div><p className="future-kicker">Continuation packet sealed</p><h3>{mission.artifact.receiptId}</h3><span>{mission.artifact.status}</span></div>
          <p>{mission.artifact.summary}</p>
          <dl><dt>Human decision</dt><dd>{mission.artifact.decision}</dd><dt>Next step</dt><dd>{mission.artifact.nextStep}</dd><dt>Chosen constraints</dt><dd>{Object.values(mission.artifact.answers).join(' · ')}</dd></dl>
          <div className="future-action-row"><button className="future-primary" type="button" onClick={() => enterYear('2040')}>Transmit memory to 2040</button><button type="button" onClick={() => chooseMission(mission.selectedMissionId)}>Run another mission</button></div>
        </section>
      )}
    </section>
  );
}

function NexusExperience() {
  const journey = useExperienceStore((state) => state.futureJourney);
  const chooseMission = useExperienceStore((state) => state.chooseFutureMission);
  const advanceMission = useExperienceStore((state) => state.advanceFutureMission);
  const motion = useExperienceStore((state) => state.motion);
  const sound = useExperienceStore((state) => state.sound);
  const { discover } = useExperienceActions();
  const previousPhase = useRef(journey.mission.phase);
  const previousTaskIndex = useRef(journey.mission.phase === 'orchestrating' ? journey.mission.activeTaskIndex : -1);
  const tasks = journey.mission.run?.tasks ?? [];

  useEffect(() => {
    if (journey.mission.phase !== 'orchestrating') return;
    const timer = window.setTimeout(advanceMission, motion === 'reduced' ? 180 : 780);
    return () => window.clearTimeout(timer);
  }, [advanceMission, journey.mission.activeTaskIndex, journey.mission.phase, motion]);

  useEffect(() => {
    const { activeTaskIndex, phase } = journey.mission;
    if (phase === 'orchestrating' && previousTaskIndex.current >= 0 && activeTaskIndex > previousTaskIndex.current) {
      playFutureCue('task', sound);
    }
    previousTaskIndex.current = phase === 'orchestrating' ? activeTaskIndex : -1;
  }, [journey.mission.activeTaskIndex, journey.mission.phase, sound]);

  useEffect(() => {
    if (previousPhase.current !== 'decision' && journey.mission.phase === 'decision') {
      discover('human-gate', '2030');
      playFutureCue('human-gate', sound);
      trackAnalyticsEvent('nexus_human_gate_reached', { mission: journey.mission.selectedMissionId });
    }
    previousPhase.current = journey.mission.phase;
  }, [discover, journey.mission.phase, journey.mission.selectedMissionId, sound]);

  return (
    <main className="future-native future-native--2030" data-future-native="2030">
      <div className="future-atmosphere" aria-hidden="true"><i></i><i></i><i></i></div>
      <header className="future-masthead"><div><p>2030 · Coexistence projection</p><h1>Kevin Nexus</h1><span>Intent becomes coordinated work. Consequential authority remains human.</span></div><div><b>COLLABORATION CORE</b><SoundControl /></div></header>
      <div className="nexus-native-stage">
        <MissionRail selected={journey.mission.selectedMissionId} onSelect={chooseMission} />
        <div className="nexus-workspace">
          <MissionCore tasks={tasks} activeTaskIndex={journey.mission.activeTaskIndex} phase={journey.mission.phase} />
          {journey.mission.phase === 'brief' ? <MissionBrief /> : <MissionRunPanel />}
        </div>
      </div>
      <footer className="future-disclosure"><span>Projection, not prediction.</span><p>Plans are deterministic local design fiction grounded in verified portfolio records. No external AI service is contacted.</p></footer>
    </main>
  );
}

function EchoAction({ action, memoryRef }: { action: EchoResponse['actions'][number]; memoryRef: RefObject<HTMLElement | null> }) {
  const { enterYear } = useExperienceActions();
  if (action === 'work') return <Link href="/work/">View verified work</Link>;
  if (action === 'contact') return <Link href="/contact/">Contact the biological Kevin</Link>;
  if (action === 'beginning') return <button type="button" onClick={() => enterYear('1990')}>Return to 1990</button>;
  if (action === 'mission') return <button type="button" onClick={() => enterYear('2030')}>Open governed mission</button>;
  return <button type="button" onClick={() => memoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}>Open memory constellation</button>;
}

function EchoFinale({ onClose }: { onClose: () => void }) {
  const mission = useExperienceStore((state) => state.futureJourney.mission.artifact);
  const setArtifactsOpen = useExperienceStore((state) => state.setArtifactsOpen);
  const { enterYear } = useExperienceActions();
  return (
    <section className="echo-finale" role="dialog" aria-modal="true" aria-labelledby="echo-finale-title">
      <button className="echo-finale__close" type="button" onClick={onClose} aria-label="Return to Kevin Echo">×</button>
      <div className="echo-finale__devices" aria-hidden="true">{memoryOrder.map((year) => <i key={year} data-year={year}><span>{year}</span></i>)}</div>
      <p className="future-kicker">Continuity synthesis complete</p>
      <h2 id="echo-finale-title">{ECHO_FINALE_TITLE}</h2>
      <p>{ECHO_FINALE_SUMMARY}</p>
      {mission && <blockquote>“{mission.continuationSignal}”<cite>{mission.receiptId} · human decision preserved</cite></blockquote>}
      <div className="echo-finale__actions"><Link className="future-primary" href="/work/">View Kevin’s work</Link><Link href="/contact/">Contact Kevin</Link><button type="button" onClick={() => enterYear('1990')}>Return to 1990</button><button type="button" onClick={() => setArtifactsOpen(true)}>Review artifacts</button></div>
    </section>
  );
}

function EchoExperience() {
  const journey = useExperienceStore((state) => state.futureJourney);
  const yearVisits = useExperienceStore((state) => state.yearVisits);
  const interpretThought = useExperienceStore((state) => state.interpretEchoThought);
  const openMemory = useExperienceStore((state) => state.openEchoMemory);
  const markFinaleSeen = useExperienceStore((state) => state.markEchoFinaleSeen);
  const sound = useExperienceStore((state) => state.sound);
  const { discover } = useExperienceActions();
  const [thought, setThought] = useState('');
  const [showFinale, setShowFinale] = useState(false);
  const memoryRef = useRef<HTMLElement>(null);
  const response = journey.echo.response;
  const particles = useMemo(() => Array.from({ length: 36 }, (_, index) => index), []);

  const submitThought = (value: string) => {
    const next = value.trim();
    if (!next) return;
    interpretThought(next);
    setThought('');
    playFutureCue('signal', sound);
    trackAnalyticsEvent('echo_thought_sent', { intent: next.slice(0, 48) });
  };

  const transmit = (event: FormEvent) => {
    event.preventDefault();
    submitThought(thought);
  };

  const activateMemory = (memoryId: EchoMemoryId) => {
    openMemory(memoryId);
    playFutureCue('memory', sound);
    trackAnalyticsEvent('echo_memory_opened', { memory: memoryId });
  };

  const speak = () => {
    if (!response) {
      submitThought('Who are you?');
      return;
    }
    if (!sound || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(response.answer);
    utterance.rate = 0.88;
    utterance.pitch = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const openFinale = () => {
    if (!journey.echo.synthesisReady) return;
    markFinaleSeen();
    discover('next-layer-message', '2040');
    setShowFinale(true);
    playFutureCue('synthesis', sound);
    trackAnalyticsEvent('echo_continuity_synthesized', { memories: journey.echo.openedMemories.length, mission: Boolean(journey.mission.artifact) });
  };

  return (
    <main className="future-native future-native--2040" data-future-native="2040">
      <div className="echo-void" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <header className="future-masthead echo-masthead"><div><p>2040 · Speculative continuity archive</p><h1>Kevin Echo</h1><span>A transparent reconstruction of approved records—not transferred consciousness.</span></div><div><b>RESONANCE {journey.echo.resonance}%</b><SoundControl /></div></header>
      <div className="echo-native-stage">
        <section className="echo-presence-native" aria-label="Abstract holographic representation of Kevin">
          <button type="button" className={response ? 'echo-figure is-awake' : 'echo-figure'} onClick={speak} aria-label={response ? 'Activate or voice Kevin Echo response' : 'Activate Kevin Echo'}>
            <span className="echo-figure__core">K</span>
            <span className="echo-figure__particles" aria-hidden="true">{particles.map((particle) => <i key={particle} style={{ '--particle': particle } as CSSProperties}></i>)}</span>
            <b aria-hidden="true"></b><b aria-hidden="true"></b><b aria-hidden="true"></b>
          </button>
          <div className="echo-resonance"><span style={{ width: `${journey.echo.resonance}%` }}></span></div>
          <p>{journey.mission.artifact ? `Memory packet ${journey.mission.artifact.receiptId} mounted.` : 'No governed 2030 memory packet is mounted yet.'}</p>
          <button type="button" onClick={speak}>{response ? sound ? 'Voice current response' : 'Enable sound to voice response' : 'Establish identity boundary'}</button>
        </section>

        <section className="echo-interpreter-native" aria-labelledby="echo-interpreter-title">
          <header><p className="future-kicker">Thought interpreter</p><h2 id="echo-interpreter-title">Send intent, receive sourced perspective</h2></header>
          <div className="echo-prompt-chips">{[
            ['Who are you?', 'Identity'], ['What do you build?', 'Work'], ['What do you believe about technology?', 'Values'],
            ['What changed between 1990 and 2040?', 'Transformation'], ['What remains human?', 'Human'], ['What happened in the mission?', 'Mission']
          ].map(([prompt, label]) => <button key={prompt} type="button" onClick={() => submitThought(prompt)}>{label}</button>)}</div>
          <form onSubmit={transmit}><label>Transmit a thought<textarea value={thought} onChange={(event) => setThought(event.target.value)} placeholder="Ask about verified work, values, the journey, or the 2030 mission…" rows={2} /></label><button className="future-primary" type="submit" disabled={!thought.trim()}>Interpret signal</button></form>
          <div className="echo-response-native" aria-live="polite">
            {response ? <><p className="future-kicker">{response.label}</p><p>{response.answer}</p><div className="echo-sources"><span>Sources</span>{response.sources.map((source) => <small key={source}>{source}</small>)}</div><div className="future-action-row">{response.actions.map((action) => <EchoAction key={action} action={action} memoryRef={memoryRef} />)}</div></> : <><p className="future-kicker">Channel open</p><p>Choose a thought pattern or ask in your own words. Unsupported details fail closed instead of becoming invented memories.</p></>}
          </div>
        </section>

        <section ref={memoryRef} className="echo-memory-constellation" aria-labelledby="echo-memory-title">
          <header><p className="future-kicker">Memory constellation</p><h2 id="echo-memory-title">Reconstruct three signals</h2><span>{journey.echo.openedMemories.length} / 3 to synthesis</span></header>
          <div>{memoryOrder.map((memoryId, index) => {
            const memory = echoMemoryRecords[memoryId];
            const opened = journey.echo.openedMemories.includes(memoryId);
            const visited = yearVisits[memoryId] > 0;
            return <button key={memoryId} type="button" className={opened ? 'is-opened' : ''} onClick={() => activateMemory(memoryId)} style={{ '--memory-index': index } as CSSProperties}><i aria-hidden="true"></i><span>{memoryId}</span><b>{memory.title}</b><small>{visited ? 'Journey signal found' : memory.signal}</small></button>;
          })}</div>
          {journey.echo.synthesisReady ? <button className="echo-synthesis-action future-primary" type="button" onClick={openFinale}>{journey.echo.finaleSeen ? 'Replay continuity synthesis' : 'Synthesize continuity'}</button> : <p>Open {Math.max(0, 3 - journey.echo.openedMemories.length)} more unique {3 - journey.echo.openedMemories.length === 1 ? 'memory' : 'memories'} to reveal the final pattern.</p>}
        </section>

        <aside className="echo-integrity"><p className="future-kicker">Source integrity</p><p>Echo knows only the canonical portfolio, this local journey, and its governed mission receipt. Future statements remain visibly speculative.</p>{journey.mission.artifact && <dl><dt>Receipt</dt><dd>{journey.mission.artifact.receiptId}</dd><dt>Decision</dt><dd>{journey.mission.artifact.status}</dd><dt>Constraints</dt><dd>{Object.values(journey.mission.artifact.answers).join(' · ')}</dd></dl>}</aside>
      </div>
      <footer className="future-disclosure"><span>Representation, not person.</span><p>Kevin Echo cannot create facts, memories, permission, or human authority.</p></footer>
      {showFinale && <EchoFinale onClose={() => setShowFinale(false)} />}
    </main>
  );
}

export function FutureExperience({ year }: { year: Extract<YearId, '2030' | '2040'> }) {
  const sound = useExperienceStore((state) => state.sound);
  const viewMode = useExperienceStore((state) => state.viewMode);
  useEffect(() => startFutureAtmosphere(year, sound && viewMode === 'interface'), [sound, viewMode, year]);
  return year === '2030' ? <NexusExperience /> : <EchoExperience />;
}
