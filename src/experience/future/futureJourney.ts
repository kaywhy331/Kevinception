export const FUTURE_MISSION_IDS = [
  'product-plan',
  'workflow-repair',
  'strategy-options',
  'automation-system',
  'project-kickoff'
] as const;

export type FutureMissionId = (typeof FUTURE_MISSION_IDS)[number];
export type FutureAgentId = 'clarifier' | 'researcher' | 'architect' | 'builder' | 'governor';
export type FutureDecision = 'approve' | 'revise' | 'reject';
export type FutureMissionPhase = 'brief' | 'orchestrating' | 'decision' | 'complete';
export type EchoMemoryId = '1990' | '2000' | '2010' | '2020' | '2030' | '2040';
export type EchoIntent = 'identity' | 'shaped' | 'work' | 'belief' | 'preserve' | 'change' | 'mission' | 'unknown';

export const ECHO_FINALE_TITLE = 'The interfaces changed. The pattern did not.';
export const ECHO_FINALE_SUMMARY = 'Curiosity became connection. Connection became systems. Systems became creation, collaboration, and a record that can continue helping without pretending to replace the person who lived it.';

export type MissionQuestion = {
  id: string;
  label: string;
  options: readonly string[];
};

type MissionTaskSpec = {
  id: string;
  agent: FutureAgentId;
  label: string;
  detail: string;
  confidence: number;
  uncertainty: string;
  automationThreshold: number;
};

export type MissionTemplate = {
  id: FutureMissionId;
  shortLabel: string;
  label: string;
  prompt: string;
  thesis: string;
  questions: readonly MissionQuestion[];
  tasks: readonly MissionTaskSpec[];
  evidenceSlugs: readonly string[];
  disagreement: string;
  deliverable: string;
};

export type MissionTask = MissionTaskSpec & {
  mode: 'human-led' | 'assisted' | 'delegated';
};

export type MissionRun = {
  missionId: FutureMissionId;
  objective: string;
  autonomy: number;
  answers: Record<string, string>;
  tasks: MissionTask[];
  evidenceSlugs: string[];
  disagreement: string;
  humanGateReason: string;
};

export type MissionArtifact = {
  receiptId: string;
  missionId: FutureMissionId;
  title: string;
  objective: string;
  autonomy: number;
  answers: Record<string, string>;
  decision: FutureDecision;
  status: 'approved' | 'reframed' | 'stopped';
  summary: string;
  nextStep: string;
  evidenceSlugs: string[];
  taskLabels: string[];
  completedAt: string;
  continuationSignal: string;
};

export type FutureMissionState = {
  selectedMissionId: FutureMissionId;
  objective: string;
  answers: Record<string, string>;
  autonomy: number;
  phase: FutureMissionPhase;
  activeTaskIndex: number;
  run: MissionRun | null;
  decision: FutureDecision | null;
  artifact: MissionArtifact | null;
};

export type EchoResponse = {
  intent: EchoIntent | 'memory';
  label: string;
  answer: string;
  sources: string[];
  actions: Array<'work' | 'contact' | 'memories' | 'mission' | 'beginning'>;
};

export type EchoState = {
  thought: string;
  response: EchoResponse | null;
  openedMemories: EchoMemoryId[];
  resonance: number;
  synthesisReady: boolean;
  finaleSeen: boolean;
};

import {
  createInitialCoexistenceState,
  createInitialConsciousnessState,
  type CoexistenceState,
  type ConsciousnessState
} from './futureWorld';

export type FutureJourneyState = {
  mission: FutureMissionState;
  echo: EchoState;
  coexistence: CoexistenceState;
  consciousness: ConsciousnessState;
};

export const futureMissionTemplates: Record<FutureMissionId, MissionTemplate> = {
  'product-plan': {
    id: 'product-plan',
    shortLabel: 'Product plan',
    label: 'Turn ambiguity into a product plan',
    prompt: 'Turn an ambiguous idea into a practical product plan with a reversible first experiment.',
    thesis: 'Define the user outcome before selecting features or technology.',
    questions: [
      { id: 'priority', label: 'What matters first?', options: ['Fast learning', 'Durable foundation', 'Visible launch'] },
      { id: 'risk', label: 'Acceptable risk', options: ['Low', 'Measured', 'High but reversible'] }
    ],
    tasks: [
      { id: 'frame-outcome', agent: 'clarifier', label: 'Frame the outcome', detail: 'Separate the desired user change from the proposed feature list.', confidence: 94, uncertainty: 'User evidence is not yet attached.', automationThreshold: 1 },
      { id: 'retrieve-precedent', agent: 'researcher', label: 'Retrieve relevant precedent', detail: 'Mount verified project evidence and identify assumptions that still need validation.', confidence: 86, uncertainty: 'Comparable outcomes use different constraints.', automationThreshold: 2 },
      { id: 'map-decisions', agent: 'architect', label: 'Map product decisions', detail: 'Connect requirements, dependencies, risks, and success evidence.', confidence: 81, uncertainty: 'Scope changes could alter the dependency order.', automationThreshold: 3 },
      { id: 'shape-experiment', agent: 'builder', label: 'Shape the first experiment', detail: 'Produce the smallest test that can invalidate the riskiest assumption.', confidence: 78, uncertainty: 'Effort remains a range until constraints are confirmed.', automationThreshold: 4 },
      { id: 'check-claims', agent: 'governor', label: 'Check claims and authority', detail: 'Stop before public commitments, spend, or irreversible implementation.', confidence: 97, uncertainty: 'Final authority remains human-owned.', automationThreshold: 6 }
    ],
    evidenceSlugs: ['kevinception', 'kevin-online'],
    disagreement: 'The Builder favors a visible prototype; the Governor favors a smaller evidence test before committing scope.',
    deliverable: 'A decision map, milestone sequence, risk register, and reversible first experiment.'
  },
  'workflow-repair': {
    id: 'workflow-repair',
    shortLabel: 'Repair workflow',
    label: 'Diagnose a broken workflow',
    prompt: 'Find where a cross-functional workflow loses context, ownership, or recoverability and propose a repair.',
    thesis: 'Repair the handoff that hides the exception, not merely the symptom it creates.',
    questions: [
      { id: 'failure', label: 'Primary failure signal', options: ['Slow handoff', 'Repeated errors', 'Invisible ownership'] },
      { id: 'scope', label: 'Repair boundary', options: ['One team', 'Cross-functional', 'System-wide'] }
    ],
    tasks: [
      { id: 'trace-failure', agent: 'clarifier', label: 'Trace the failure', detail: 'Identify the first point where expected state and observed state diverge.', confidence: 92, uncertainty: 'The visible symptom may be downstream of the cause.', automationThreshold: 1 },
      { id: 'collect-receipts', agent: 'researcher', label: 'Collect handoff receipts', detail: 'Compare records, exceptions, and ownership at each boundary.', confidence: 88, uncertainty: 'Missing records are themselves evidence but not proof of cause.', automationThreshold: 2 },
      { id: 'redesign-flow', agent: 'architect', label: 'Redesign the flow', detail: 'Make state, ownership, retry behavior, and escalation explicit.', confidence: 84, uncertainty: 'Legacy constraints may require an additive transition.', automationThreshold: 3 },
      { id: 'stage-repair', agent: 'builder', label: 'Stage the repair', detail: 'Create a reversible rollout with instrumentation and rollback criteria.', confidence: 82, uncertainty: 'Baseline volume must be verified before sizing.', automationThreshold: 4 },
      { id: 'protect-operators', agent: 'governor', label: 'Protect operator judgment', detail: 'Keep consequential exceptions visible and manually recoverable.', confidence: 98, uncertainty: 'Automation cannot infer undisclosed policy.', automationThreshold: 6 }
    ],
    evidenceSlugs: ['agentic-work-fleet', 'mcp-knowledge-logistics'],
    disagreement: 'The Architect proposes consolidating the flow; the Governor requires an additive migration until rollback evidence is strong.',
    deliverable: 'A failure map, ownership model, recovery contract, rollout sequence, and observable success criteria.'
  },
  'strategy-options': {
    id: 'strategy-options',
    shortLabel: 'Compare options',
    label: 'Compare strategic options',
    prompt: 'Compare three plausible directions without disguising assumptions or uncertainty as certainty.',
    thesis: 'A useful recommendation exposes what would have to be true for each option to win.',
    questions: [
      { id: 'horizon', label: 'Decision horizon', options: ['30 days', 'One quarter', 'One year'] },
      { id: 'optimize', label: 'Optimize for', options: ['Learning', 'Leverage', 'Durability'] }
    ],
    tasks: [
      { id: 'define-criteria', agent: 'clarifier', label: 'Define decision criteria', detail: 'Turn preferences into explicit, weighted decision conditions.', confidence: 95, uncertainty: 'Weights reflect current priorities and can change.', automationThreshold: 1 },
      { id: 'build-evidence-table', agent: 'researcher', label: 'Build the evidence table', detail: 'Attach verified precedent and identify missing evidence per option.', confidence: 83, uncertainty: 'No option has complete evidence.', automationThreshold: 2 },
      { id: 'model-tradeoffs', agent: 'architect', label: 'Model the tradeoffs', detail: 'Compare reversibility, dependencies, opportunity cost, and failure modes.', confidence: 80, uncertainty: 'External timing remains outside the model.', automationThreshold: 3 },
      { id: 'design-probes', agent: 'builder', label: 'Design option probes', detail: 'Create a low-cost test that distinguishes the leading options.', confidence: 79, uncertainty: 'Probe results may invalidate the current ranking.', automationThreshold: 4 },
      { id: 'challenge-ranking', agent: 'governor', label: 'Challenge the recommendation', detail: 'Surface bias, unsupported claims, and human impact before selection.', confidence: 96, uncertainty: 'The final weighting is a human judgment.', automationThreshold: 6 }
    ],
    evidenceSlugs: ['kevinception', 'tokenpak', 'agentic-work-fleet'],
    disagreement: 'The Researcher ranks the best-supported option first; the Builder prefers the easiest option to test. Human weighting decides.',
    deliverable: 'A weighted option matrix, evidence gaps, reversibility map, and recommended decision probe.'
  },
  'automation-system': {
    id: 'automation-system',
    shortLabel: 'Automation',
    label: 'Design a responsible automation system',
    prompt: 'Automate repetitive coordination while preserving evidence, recovery, and human authority.',
    thesis: 'The automation boundary should follow reversibility and consequence, not technical possibility.',
    questions: [
      { id: 'volume', label: 'Work volume', options: ['Occasional', 'Daily', 'Continuous'] },
      { id: 'impact', label: 'Failure impact', options: ['Recoverable', 'Material', 'Human-facing'] }
    ],
    tasks: [
      { id: 'separate-decisions', agent: 'clarifier', label: 'Separate repetition from judgment', detail: 'Classify steps by frequency, consequence, and reversibility.', confidence: 93, uncertainty: 'Edge cases may contain hidden judgment.', automationThreshold: 1 },
      { id: 'inspect-controls', agent: 'researcher', label: 'Inspect control precedents', detail: 'Retrieve evidence for auditability, retries, permissions, and handoffs.', confidence: 89, uncertainty: 'Provider guarantees require verification.', automationThreshold: 2 },
      { id: 'design-boundaries', agent: 'architect', label: 'Design authority boundaries', detail: 'Specify state, permissions, idempotency, escalation, and stop conditions.', confidence: 85, uncertainty: 'Operational policy may narrow permissions.', automationThreshold: 3 },
      { id: 'build-safe-slice', agent: 'builder', label: 'Build the safe slice', detail: 'Start with the highest-volume reversible action and visible receipts.', confidence: 84, uncertainty: 'Production volume is not yet rehearsed.', automationThreshold: 4 },
      { id: 'enforce-human-gates', agent: 'governor', label: 'Enforce human gates', detail: 'Require approval for spend, publication, access expansion, and human impact.', confidence: 99, uncertainty: 'New consequence classes must fail closed.', automationThreshold: 6 }
    ],
    evidenceSlugs: ['tokenpak', 'agentic-work-fleet', 'mcp-knowledge-logistics'],
    disagreement: 'The Builder can automate the happy path now; the Governor blocks release until exception recovery is demonstrated.',
    deliverable: 'An authority map, state machine, evidence ledger, exception queue, and staged automation rollout.'
  },
  'project-kickoff': {
    id: 'project-kickoff',
    shortLabel: 'Kickoff',
    label: 'Prepare an executable project kickoff',
    prompt: 'Turn a promising direction into shared scope, owners, milestones, evidence, and a clean first handoff.',
    thesis: 'A kickoff succeeds when the next decision and its owner are clearer than the presentation.',
    questions: [
      { id: 'team', label: 'Team shape', options: ['Solo builder', 'Small team', 'Multiple functions'] },
      { id: 'unknown', label: 'Largest unknown', options: ['User need', 'Technical path', 'Operating model'] }
    ],
    tasks: [
      { id: 'frame-charter', agent: 'clarifier', label: 'Frame the charter', detail: 'Define outcome, non-goals, constraints, and the first decision owner.', confidence: 96, uncertainty: 'Stakeholder alignment is not yet observed.', automationThreshold: 1 },
      { id: 'assemble-context', agent: 'researcher', label: 'Assemble shared context', detail: 'Package evidence, definitions, dependencies, and open questions.', confidence: 87, uncertainty: 'Some dependencies may be outside the team.', automationThreshold: 2 },
      { id: 'sequence-work', agent: 'architect', label: 'Sequence the work', detail: 'Order milestones around risk retirement and usable increments.', confidence: 84, uncertainty: 'Capacity assumptions need owner confirmation.', automationThreshold: 3 },
      { id: 'prepare-handoff', agent: 'builder', label: 'Prepare the first handoff', detail: 'Create the first executable task with acceptance evidence.', confidence: 86, uncertainty: 'Implementation detail follows the kickoff decision.', automationThreshold: 4 },
      { id: 'verify-commitments', agent: 'governor', label: 'Verify commitments', detail: 'Check that owners knowingly accept scope, claims, and authority.', confidence: 98, uncertainty: 'Commitment cannot be inferred from attendance.', automationThreshold: 6 }
    ],
    evidenceSlugs: ['kevinception', 'mcp-knowledge-logistics'],
    disagreement: 'The Architect wants a complete milestone map; the Builder recommends committing only through the first evidence checkpoint.',
    deliverable: 'A project charter, decision register, milestone map, owner matrix, and continuation-ready first task.'
  }
};

export const futureAgentLabels: Record<FutureAgentId, string> = {
  clarifier: 'Clarifier',
  researcher: 'Researcher',
  architect: 'Architect',
  builder: 'Builder',
  governor: 'Governor'
};

export const echoMemoryRecords: Record<EchoMemoryId, { title: string; signal: string; reconstruction: string; source: string }> = {
  '1990': { title: 'Wonder', signal: 'The first responsive screen', reconstruction: 'A channel changed, a character moved, and technology became a world with rules worth exploring.', source: 'Curiosity chapter' },
  '2000': { title: 'Connection', signal: 'The first online identity', reconstruction: 'Dial-up turned one computer into an entrance to people, scripts, pages, and shared imagination.', source: 'Connection chapter' },
  '2010': { title: 'Systems', signal: 'The connected customer promise', reconstruction: 'Orders, catalog data, inventory, fulfillment, service, and teams became one operating model.', source: 'Commerce chapter' },
  '2020': { title: 'Creation', signal: 'The compressed story', reconstruction: 'Publishing accelerated, signals became immediate, and ideas had to become tangible quickly.', source: 'Creation chapter' },
  '2030': { title: 'Companionship', signal: 'The permissioned morning', reconstruction: 'Kevin shared ordinary life with an ambient companion while human consent decided which moments could travel forward.', source: 'Co-Existence chapter' },
  '2040': { title: 'Consciousness', signal: 'The permissioned self', reconstruction: 'A holographic Kevin can remember, deliberate, act, and refuse without turning inference into a claimed memory.', source: 'Consciousness chapter' }
};

const initialMission = (): FutureMissionState => ({
  selectedMissionId: 'product-plan',
  objective: futureMissionTemplates['product-plan'].prompt,
  answers: {},
  autonomy: 3,
  phase: 'brief',
  activeTaskIndex: -1,
  run: null,
  decision: null,
  artifact: null
});

const initialEcho = (): EchoState => ({
  thought: '',
  response: null,
  openedMemories: [],
  resonance: 0,
  synthesisReady: false,
  finaleSeen: false
});

export function createInitialFutureJourney(): FutureJourneyState {
  return {
    mission: initialMission(),
    echo: initialEcho(),
    coexistence: createInitialCoexistenceState(),
    consciousness: createInitialConsciousnessState()
  };
}

export function hydrateFutureJourney(state?: Partial<FutureJourneyState> | null): FutureJourneyState {
  const initial = createInitialFutureJourney();
  if (!state) return initial;

  return {
    mission: {
      ...initial.mission,
      ...state.mission,
      answers: { ...initial.mission.answers, ...state.mission?.answers }
    },
    echo: {
      ...initial.echo,
      ...state.echo,
      openedMemories: Array.isArray(state.echo?.openedMemories) ? state.echo.openedMemories : initial.echo.openedMemories
    },
    coexistence: {
      ...initial.coexistence,
      ...state.coexistence,
      consent: { ...initial.coexistence.consent, ...state.coexistence?.consent },
      keptMoments: Array.isArray(state.coexistence?.keptMoments) ? state.coexistence.keptMoments : initial.coexistence.keptMoments,
      refusedMoments: Array.isArray(state.coexistence?.refusedMoments) ? state.coexistence.refusedMoments : initial.coexistence.refusedMoments
    },
    consciousness: {
      ...initial.consciousness,
      ...state.consciousness,
      visitedCues: Array.isArray(state.consciousness?.visitedCues) ? state.consciousness.visitedCues : initial.consciousness.visitedCues
    }
  };
}

export function selectFutureMission(state: FutureJourneyState, missionId: FutureMissionId): FutureJourneyState {
  return {
    ...state,
    mission: {
      ...initialMission(),
      selectedMissionId: missionId,
      objective: futureMissionTemplates[missionId].prompt,
      autonomy: state.mission.autonomy,
      artifact: state.mission.artifact
    }
  };
}

export function setFutureObjective(state: FutureJourneyState, objective: string): FutureJourneyState {
  return { ...state, mission: { ...state.mission, objective, phase: 'brief', run: null, decision: null } };
}

export function setFutureAnswer(state: FutureJourneyState, questionId: string, answer: string): FutureJourneyState {
  return { ...state, mission: { ...state.mission, answers: { ...state.mission.answers, [questionId]: answer } } };
}

export function setFutureAutonomy(state: FutureJourneyState, autonomy: number): FutureJourneyState {
  const normalized = Math.max(1, Math.min(5, Math.round(autonomy)));
  return { ...state, mission: { ...state.mission, autonomy: normalized } };
}

function taskMode(task: MissionTaskSpec, autonomy: number): MissionTask['mode'] {
  if (task.agent === 'governor' || task.automationThreshold > autonomy + 1) return 'human-led';
  if (task.automationThreshold > autonomy) return 'assisted';
  return 'delegated';
}

export function createMissionRun(mission: FutureMissionState): MissionRun {
  const template = futureMissionTemplates[mission.selectedMissionId];
  return {
    missionId: template.id,
    objective: mission.objective.trim() || template.prompt,
    autonomy: mission.autonomy,
    answers: { ...mission.answers },
    tasks: template.tasks.map((task) => ({ ...task, mode: taskMode(task, mission.autonomy) })),
    evidenceSlugs: [...template.evidenceSlugs],
    disagreement: template.disagreement,
    humanGateReason: mission.autonomy >= 4
      ? 'High initiative increases speed and uncertainty together. Public claims, spend, permissions, and human impact still require explicit approval.'
      : 'The next step changes scope and commitments. The system has reached the human-owned decision boundary.'
  };
}

export function beginFutureMission(state: FutureJourneyState): FutureJourneyState {
  const run = createMissionRun(state.mission);
  return { ...state, mission: { ...state.mission, objective: run.objective, phase: 'orchestrating', activeTaskIndex: 0, run, decision: null } };
}

export function advanceFutureMission(state: FutureJourneyState): FutureJourneyState {
  const { mission } = state;
  if (mission.phase !== 'orchestrating' || !mission.run) return state;
  const nextIndex = mission.activeTaskIndex + 1;
  if (nextIndex >= mission.run.tasks.length) {
    return { ...state, mission: { ...mission, phase: 'decision', activeTaskIndex: mission.run.tasks.length } };
  }
  return { ...state, mission: { ...mission, activeTaskIndex: nextIndex } };
}

function receiptHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7);
}

export function resolveFutureMission(state: FutureJourneyState, decision: FutureDecision, completedAt = new Date().toISOString()): FutureJourneyState {
  const { mission } = state;
  if (!mission.run || mission.phase !== 'decision') return state;
  const template = futureMissionTemplates[mission.run.missionId];
  const status = decision === 'approve' ? 'approved' : decision === 'revise' ? 'reframed' : 'stopped';
  const summary = decision === 'approve'
    ? `${template.deliverable} The human decision gate approved the bounded next step.`
    : decision === 'revise'
      ? `${template.deliverable} Scope was narrowed to reduce irreversible work and return with stronger evidence.`
      : `The mission stopped before execution. Its evidence and disagreement remain available without implying approval.`;
  const nextStep = decision === 'approve'
    ? mission.run.tasks.find((task) => task.agent === 'builder')?.detail ?? template.deliverable
    : decision === 'revise'
      ? 'Run one smaller reversible probe against the highest-uncertainty assumption, then return to the gate.'
      : 'Preserve the receipt, change the objective or constraints, and begin a new mission when authority is restored.';
  const signature = JSON.stringify([mission.run.missionId, mission.run.objective, mission.run.autonomy, mission.run.answers, decision]);
  const artifact: MissionArtifact = {
    receiptId: `NX-${receiptHash(signature)}`,
    missionId: mission.run.missionId,
    title: template.label,
    objective: mission.run.objective,
    autonomy: mission.run.autonomy,
    answers: { ...mission.run.answers },
    decision,
    status,
    summary,
    nextStep,
    evidenceSlugs: [...mission.run.evidenceSlugs],
    taskLabels: mission.run.tasks.map((task) => task.label),
    completedAt,
    continuationSignal: `A ${status} ${template.shortLabel.toLowerCase()} mission carrying ${mission.run.evidenceSlugs.length} verified evidence source${mission.run.evidenceSlugs.length === 1 ? '' : 's'}. Chosen constraints: ${Object.values(mission.run.answers).join(' · ') || 'not specified'}.`
  };
  return { ...state, mission: { ...mission, phase: 'complete', activeTaskIndex: mission.run.tasks.length, decision, artifact } };
}

export function inferEchoIntent(thought: string): EchoIntent {
  const normalized = thought.toLowerCase();
  const entries: Array<[EchoIntent, readonly string[]]> = [
    ['identity', ['who are you', 'are you real', 'really kevin', 'conscious', 'biological']],
    ['mission', ['mission', 'decision', 'handoff', '2030', 'collaboration', 'agent']],
    ['change', ['changed', 'change between', 'across time', '1990 and 2040', 'through the years']],
    ['preserve', ['preserve', 'remain human', 'what remains', 'memory', 'continuity']],
    ['work', ['build', 'design', 'database', 'system', 'project', 'product', 'automation', 'work']],
    ['belief', ['believe', 'philosophy', 'technology should', 'values']],
    ['shaped', ['shaped', 'beginning', 'curiosity', 'grew', 'start']]
  ];
  let best: { intent: EchoIntent; score: number } = { intent: 'unknown', score: 0 };
  for (const [intent, phrases] of entries) {
    const score = phrases.reduce((total, phrase) => total + (normalized.includes(phrase) ? Math.max(1, phrase.split(' ').length) : 0), 0);
    if (score > best.score) best = { intent, score };
  }
  return best.intent;
}

function responseForIntent(intent: EchoIntent, artifact: MissionArtifact | null): EchoResponse {
  const missionLine = artifact
    ? ` The latest governed mission is ${artifact.status}: “${artifact.title}.” Its receipt is ${artifact.receiptId}.`
    : ' No governed 2030 mission has been completed in this journey yet.';
  const responses: Record<EchoIntent, EchoResponse> = {
    identity: { intent, label: 'Identity boundary', answer: 'I am a speculative interface assembled from Kevin’s approved portfolio records and this visitor’s local journey. I am not the biological Kevin and I do not claim transferred consciousness.', sources: ['Verified profile', 'Consciousness disclosure'], actions: ['work', 'contact'] },
    shaped: { intent, label: 'Origin signal', answer: 'Curiosity came first: interactive worlds made rules visible. Connection, commerce, creation, and intelligent collaboration then turned that habit into systems people can use.', sources: ['1990–2030 chapter records'], actions: ['memories', 'beginning'] },
    work: { intent, label: 'Verified work signal', answer: 'Kevin designs products, operating models, automation, context infrastructure, agent workflows, and interfaces that make complex decisions executable. I can open the verified work rather than invent an example.', sources: ['Canonical project records'], actions: ['work'] },
    belief: { intent, label: 'Values signal', answer: 'Technology should amplify judgment, creativity, and meaningful action. It should reduce unnecessary friction without hiding accountability or pretending confidence that the evidence does not support.', sources: ['Authored technology philosophy'], actions: ['work', 'memories'] },
    preserve: { intent, label: 'Human continuity signal', answer: 'Systems can preserve records, patterns, preferences, and language. Responsibility, lived experience, embodied relationships, and the authority to define meaning remain human.', sources: ['Consciousness chapter', 'Human-control model'], actions: ['memories', 'contact'] },
    change: { intent, label: 'Six-era transformation', answer: 'The interfaces changed from screen, to network, to operating system, to feed, to companionship, to consciousness. The recurring pattern was curiosity becoming a system, then becoming something other people could use.', sources: ['Six chapter narratives'], actions: ['memories', 'beginning'] },
    mission: { intent, label: 'Governed mission memory', answer: `2030 turns intent into coordinated work, but stops at consequential authority.${missionLine}`, sources: artifact ? [`Mission receipt ${artifact.receiptId}`, ...artifact.evidenceSlugs] : ['Co-Existence chapter'], actions: ['mission', 'memories'] },
    unknown: { intent, label: 'Evidence boundary', answer: 'That detail is not present in the verified records available to this representation. Try asking about Kevin’s work, technology philosophy, six-era journey, human responsibility, or the latest governed mission.', sources: ['Source-integrity policy'], actions: ['work', 'memories', 'contact'] }
  };
  return responses[intent];
}

export function interpretEchoThought(state: FutureJourneyState, thought: string): FutureJourneyState {
  const normalized = thought.trim();
  if (!normalized) return state;
  const intent = inferEchoIntent(normalized);
  return {
    ...state,
    echo: {
      ...state.echo,
      thought: normalized,
      response: responseForIntent(intent, state.mission.artifact)
    }
  };
}

function echoResonance(openedMemories: EchoMemoryId[], artifact: MissionArtifact | null) {
  return Math.min(100, openedMemories.length * 24 + (artifact ? 18 : 0));
}

export function openEchoMemory(state: FutureJourneyState, memoryId: EchoMemoryId): FutureJourneyState {
  const openedMemories = state.echo.openedMemories.includes(memoryId)
    ? state.echo.openedMemories
    : [...state.echo.openedMemories, memoryId];
  const record = echoMemoryRecords[memoryId];
  const missionDetail = memoryId === '2030' && state.mission.artifact
    ? ` This journey carries ${state.mission.artifact.receiptId}: ${state.mission.artifact.continuationSignal}`
    : '';
  return {
    ...state,
    echo: {
      ...state.echo,
      openedMemories,
      resonance: echoResonance(openedMemories, state.mission.artifact),
      synthesisReady: openedMemories.length >= 3,
      response: {
        intent: 'memory',
        label: `${memoryId} · ${record.title}`,
        answer: `${record.reconstruction}${missionDetail}`,
        sources: [record.source],
        actions: memoryId === '2030' ? ['mission', 'memories'] : ['memories']
      }
    }
  };
}

export function markEchoFinaleSeen(state: FutureJourneyState): FutureJourneyState {
  if (!state.echo.synthesisReady) return state;
  return { ...state, echo: { ...state.echo, finaleSeen: true, resonance: 100 } };
}
