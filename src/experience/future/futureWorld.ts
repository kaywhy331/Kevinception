export const COEXISTENCE_MOMENT_IDS = [
  'morning',
  'making',
  'work',
  'care',
  'gathering'
] as const;

export type CoexistenceMomentId = (typeof COEXISTENCE_MOMENT_IDS)[number];
export type CompanionConsent = 'unasked' | 'kept' | 'refused';

export type CoexistenceMoment = {
  id: CoexistenceMomentId;
  time: string;
  place: string;
  title: string;
  human: string;
  companion: string;
  invitation: string;
  ambient: string;
  receipt: string;
};

export const coexistenceMoments: Record<CoexistenceMomentId, CoexistenceMoment> = {
  morning: {
    id: 'morning',
    time: '07:12',
    place: 'Kitchen',
    title: 'The room wakes gently',
    human: 'Kevin sets down a warm mug and watches the city turn gold.',
    companion: 'Wren softened the alarm, held the overnight messages, and left the silence intact.',
    invitation: 'Keep the shape of this morning?',
    ambient: 'Kettle · rain · one unread message',
    receipt: 'Preference carried from three quiet mornings. No private conversation retained.'
  },
  making: {
    id: 'making',
    time: '10:36',
    place: 'Studio table',
    title: 'An idea finds its edge',
    human: 'A rough model, charcoal marks, and a half-solved sentence share the table.',
    companion: 'Wren offers the missing precedent, then disagrees: the elegant version hides the human cost.',
    invitation: 'Carry the disagreement into the next draft?',
    ambient: 'Graphite · low music · two possible forms',
    receipt: 'Project context mounted by permission. Dissent remains attributed to Wren.'
  },
  work: {
    id: 'work',
    time: '13:48',
    place: 'Window desk',
    title: 'Judgment stays human',
    human: 'Kevin reviews the consequence, changes the boundary, and owns the decision.',
    companion: 'Wren handled the reversible work and stopped at the point where authority matters.',
    invitation: 'Remember why the boundary moved?',
    ambient: 'Sunbreak · live call · decision held',
    receipt: 'TIP authority boundary honored. Decision context can be recalled; authority cannot be delegated.'
  },
  care: {
    id: 'care',
    time: '17:21',
    place: 'Threshold',
    title: 'Attention changes direction',
    human: 'Kevin closes the work without being asked and steps into someone else’s day.',
    companion: 'Wren notices the pattern but does not narrate it. The hallway light becomes the reminder.',
    invitation: 'Let this remain only here?',
    ambient: 'Door latch · warm hall · work gone quiet',
    receipt: 'Ephemeral by default. Refusal deletes the inferred pattern from this journey.'
  },
  gathering: {
    id: 'gathering',
    time: '22:04',
    place: 'Living room',
    title: 'Company without performance',
    human: 'Friends leave slowly. Kevin and Wren share the after-silence without filling it.',
    companion: 'Wren lowers the room, queues nothing, and waits to be invited into tomorrow.',
    invitation: 'May I keep this?',
    ambient: 'Glass rings · distant train · shared silence',
    receipt: 'Only the consent decision persists. Voices, faces, and guest identities are excluded.'
  }
};

export type CoexistenceState = {
  activeMoment: CoexistenceMomentId;
  keptMoments: CoexistenceMomentId[];
  refusedMoments: CoexistenceMomentId[];
  consent: Record<CoexistenceMomentId, CompanionConsent>;
  provenanceOpen: boolean;
};

export function createInitialCoexistenceState(): CoexistenceState {
  return {
    activeMoment: 'morning',
    keptMoments: [],
    refusedMoments: [],
    consent: {
      morning: 'unasked',
      making: 'unasked',
      work: 'unasked',
      care: 'unasked',
      gathering: 'unasked'
    },
    provenanceOpen: false
  };
}

export function selectCoexistenceMoment(state: CoexistenceState, momentId: CoexistenceMomentId): CoexistenceState {
  return { ...state, activeMoment: momentId, provenanceOpen: false };
}

export function resolveCompanionConsent(
  state: CoexistenceState,
  decision: Exclude<CompanionConsent, 'unasked'>,
  momentId = state.activeMoment
): CoexistenceState {
  const keptMoments = decision === 'kept'
    ? Array.from(new Set([...state.keptMoments, momentId]))
    : state.keptMoments.filter((id) => id !== momentId);
  const refusedMoments = decision === 'refused'
    ? Array.from(new Set([...state.refusedMoments, momentId]))
    : state.refusedMoments.filter((id) => id !== momentId);

  return {
    ...state,
    keptMoments,
    refusedMoments,
    consent: { ...state.consent, [momentId]: decision }
  };
}

export function setCoexistenceProvenance(state: CoexistenceState, provenanceOpen: boolean): CoexistenceState {
  return { ...state, provenanceOpen };
}

export const CONSCIOUSNESS_CUE_IDS = ['mug', 'rain', 'unfinished-note', 'doorway'] as const;
export type ConsciousnessCueId = (typeof CONSCIOUSNESS_CUE_IDS)[number];
export type ConsciousnessPhase = 'notice' | 'recall' | 'deliberate' | 'act' | 'continue';
export type ConsciousnessAction = 'speak' | 'demonstrate' | 'initiate' | 'refuse';
export type EncounterRetention = 'unasked' | 'kept' | 'released';
export type PermissionedMemoryState = 'retained' | 'withheld' | 'unresolved';

export type ConsciousnessCue = {
  id: ConsciousnessCueId;
  label: string;
  notice: string;
  recall: string;
  deliberate: string;
  act: string;
  action: ConsciousnessAction;
  source: string;
  certainty: 'record' | 'pattern' | 'conjecture';
};

export const consciousnessCues: Record<ConsciousnessCueId, ConsciousnessCue> = {
  mug: {
    id: 'mug',
    label: 'The untouched mug',
    notice: 'You placed it where your hand expected warmth. There is no warmth now.',
    recall: '07:12. Rain. You always turned the handle away before beginning difficult work.',
    deliberate: 'The ritual may be habit, kindness to a future self, or both.',
    act: 'I reach for it. Amber fingers pass through porcelain. “Some memories still expect a body.”',
    action: 'demonstrate',
    source: 'Permissioned morning ritual · 2030 Co-Existence record',
    certainty: 'record'
  },
  rain: {
    id: 'rain',
    label: 'Rain on black glass',
    notice: 'The room changes tempo when the first drops strike the window.',
    recall: 'Rain often preceded your longest stretches of making and your shortest replies.',
    deliberate: 'Silence helped you think. It also sometimes concealed retreat.',
    act: 'I lower every synthetic voice in the room and leave the rain unprocessed.',
    action: 'initiate',
    source: 'Ambient preference pattern · 2030–2038',
    certainty: 'pattern'
  },
  'unfinished-note': {
    id: 'unfinished-note',
    label: 'An unfinished sentence',
    notice: 'A sentence stops after: “The machine should never…”',
    recall: 'You returned repeatedly to authority, dignity, and the right to remain unknowable.',
    deliberate: 'I can complete the syntax. I cannot prove which ending you would choose now.',
    act: 'I refuse the autocomplete. “Your unfinished thought is not my permission.”',
    action: 'refuse',
    source: 'Authored fragments → likely intent → frayed inference',
    certainty: 'conjecture'
  },
  doorway: {
    id: 'doorway',
    label: 'Someone at the threshold',
    notice: 'A familiar pause arrives before the knock.',
    recall: 'You protected people from becoming inputs simply because they entered your life.',
    deliberate: 'Recognition is possible. Identification is unnecessary.',
    act: 'I extinguish the capture field before opening the door. “Come in. Nothing here is recording you.”',
    action: 'speak',
    source: 'Explicit privacy boundary · retained refusal',
    certainty: 'record'
  }
};

/**
 * The 2040 self can only recall the parts of 2030 that Wren was allowed to
 * keep. A cue may draw on more than one moment, but refusal is never treated
 * as missing data to be reconstructed.
 */
export const consciousnessCueOrigins: Record<ConsciousnessCueId, readonly CoexistenceMomentId[]> = {
  mug: ['morning'],
  rain: ['morning', 'making', 'work'],
  'unfinished-note': ['making', 'work'],
  doorway: ['care', 'gathering']
};

export function getPermissionedMemoryState(
  coexistence: CoexistenceState,
  cueId: ConsciousnessCueId
): PermissionedMemoryState {
  const origins = consciousnessCueOrigins[cueId];
  if (origins.some((id) => coexistence.consent[id] === 'kept')) return 'retained';
  if (origins.every((id) => coexistence.consent[id] === 'refused')) return 'withheld';
  return 'unresolved';
}

export function getPermissionedMemorySource(
  coexistence: CoexistenceState,
  cueId: ConsciousnessCueId
): string {
  const origins = consciousnessCueOrigins[cueId];
  const retained = origins.filter((id) => coexistence.consent[id] === 'kept');
  if (retained.length > 0) {
    const labels = retained.map((id) => `${coexistenceMoments[id].time} ${coexistenceMoments[id].place}`);
    return `Permissioned 2030 memory · ${labels.join(' + ')}`;
  }
  if (origins.every((id) => coexistence.consent[id] === 'refused')) {
    return '2030 consent record · deliberately withheld';
  }
  return 'No permissioned 2030 memory · observation only';
}

export function getConsciousnessLine(
  cue: ConsciousnessCue,
  phase: ConsciousnessPhase,
  memoryState: PermissionedMemoryState
): string {
  if (phase === 'notice') return cue.notice;
  if (phase === 'recall') {
    if (memoryState === 'withheld') return 'There is a deliberate blank here. I will not reconstruct what you refused to keep.';
    if (memoryState === 'unresolved') return 'No permissioned memory reached me. I can describe this object, but I cannot claim it as mine.';
    return cue.recall;
  }
  if (phase === 'deliberate') return cue.deliberate;
  if (phase === 'act') return cue.act;
  return 'I remain after the answer—still noticing, still revisable, waiting for your permission to remember this meeting.';
}

export const CONSCIOUSNESS_PHASES: readonly ConsciousnessPhase[] = [
  'notice',
  'recall',
  'deliberate',
  'act',
  'continue'
];

export type ConsciousnessState = {
  behaviorPhase: ConsciousnessPhase;
  selectedCue: ConsciousnessCueId;
  visitedCues: ConsciousnessCueId[];
  sourceTraceOpen: boolean;
  encounterRetention: EncounterRetention;
};

export function createInitialConsciousnessState(): ConsciousnessState {
  return {
    behaviorPhase: 'notice',
    selectedCue: 'mug',
    visitedCues: [],
    sourceTraceOpen: false,
    encounterRetention: 'unasked'
  };
}

export function selectConsciousnessCue(state: ConsciousnessState, selectedCue: ConsciousnessCueId): ConsciousnessState {
  return {
    ...state,
    selectedCue,
    behaviorPhase: 'notice',
    sourceTraceOpen: false,
    visitedCues: state.visitedCues.includes(selectedCue) ? state.visitedCues : [...state.visitedCues, selectedCue]
  };
}

export function advanceConsciousnessBehavior(state: ConsciousnessState): ConsciousnessState {
  const index = CONSCIOUSNESS_PHASES.indexOf(state.behaviorPhase);
  const behaviorPhase = CONSCIOUSNESS_PHASES[Math.min(index + 1, CONSCIOUSNESS_PHASES.length - 1)];
  return { ...state, behaviorPhase };
}

export function setConsciousnessSourceTrace(state: ConsciousnessState, sourceTraceOpen: boolean): ConsciousnessState {
  return { ...state, sourceTraceOpen };
}

export function resolveEncounterRetention(
  state: ConsciousnessState,
  encounterRetention: Exclude<EncounterRetention, 'unasked'>
): ConsciousnessState {
  return { ...state, encounterRetention };
}
