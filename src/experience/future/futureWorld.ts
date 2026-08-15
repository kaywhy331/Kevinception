export const COEXISTENCE_MOMENT_IDS = [
  'morning',
  'making',
  'work',
  'care',
  'gathering'
] as const;

export type CoexistenceMomentId = (typeof COEXISTENCE_MOMENT_IDS)[number];
export type CompanionConsent = 'unasked' | 'kept' | 'refused';

export const AGENT_TRACE_PHASES = [
  'sense',
  'interpret',
  'govern',
  'act',
  'account'
] as const;

export type AgentTracePhase = (typeof AGENT_TRACE_PHASES)[number];

export type AgentTraceStep = {
  status: string;
  summary: string;
  detail: string;
};

export type CoexistenceAgentTrace = {
  id: string;
  posture: string;
  confidence: number;
  uncertainty: string;
  steps: Record<AgentTracePhase, AgentTraceStep>;
};

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
  agent: CoexistenceAgentTrace;
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
    receipt: 'Preference carried from three quiet mornings. No private conversation retained.',
    agent: {
      id: 'WREN-0712-MORNING',
      posture: 'Ambient assist · local home context',
      confidence: 91,
      uncertainty: 'Message urgency is unknown because content remains sealed.',
      steps: {
        sense: {
          status: '4 local signals',
          summary: 'The home notices a slow start, not a mood.',
          detail: 'Alarm dismissed once · room light below 12% · calendar clear for 52 minutes · two message envelopes present. Message bodies, camera, and biometrics are not opened.'
        },
        interpret: {
          status: '91% fit',
          summary: 'A quiet-start preference matches three permissioned mornings.',
          detail: 'Wren compares only the current room state with Kevin’s retained comfort preference. It does not infer emotion from silence or movement.'
        },
        govern: {
          status: 'Reversible only',
          summary: 'Room comfort may change; communication may not.',
          detail: 'The home policy permits gradual alarm, light, and notification-surface changes. Reading, ranking, replying to, or hiding message content requires Kevin.'
        },
        act: {
          status: '3 actions · 0 messages read',
          summary: 'Soften, warm, hold—then stop.',
          detail: 'Wren lowers the alarm curve, warms the kitchen light, and keeps message content behind a visible count. The room remains interruptible from every control.'
        },
        account: {
          status: 'Minimal receipt',
          summary: 'The action is logged; the private material is not.',
          detail: 'Retained: policy ID, device actions, and preference weight. Excluded: message content, conversation, camera data, biometrics, and any mood label.'
        }
      }
    }
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
    receipt: 'Project context mounted by permission. Dissent remains attributed to Wren.',
    agent: {
      id: 'WREN-1036-MAKING',
      posture: 'Collaborative critic · mounted project context',
      confidence: 84,
      uncertainty: 'A pause can mean reflection, fatigue, or a deliberate break.',
      steps: {
        sense: {
          status: 'Workspace signals',
          summary: 'The draft changed nine times, then stopped at one tradeoff.',
          detail: 'Wren sees the permissioned brief, revision history, active design constraint, and a 14-minute editing pause. It does not use unrelated personal history.'
        },
        interpret: {
          status: '84% fit',
          summary: 'A precedent may unlock the tradeoff, but the pause is ambiguous.',
          detail: 'The retrieval matches the project’s stated inclusion constraint. Wren labels the pause as uncertain and treats the recommendation as an offer, not intent.'
        },
        govern: {
          status: 'Recommend · do not rewrite',
          summary: 'Evidence and dissent are allowed; authorship remains Kevin’s.',
          detail: 'Project permission allows source retrieval and attributed critique. Wren cannot alter the draft, change its objective, or present its opinion as Kevin’s.'
        },
        act: {
          status: '1 source · 1 dissent',
          summary: 'Show the precedent, name the human cost, leave the cursor still.',
          detail: 'Wren mounts the source beside the draft and states its disagreement. No text is inserted and no decision is preselected.'
        },
        account: {
          status: 'Source-linked receipt',
          summary: 'The recommendation remains inspectable and attributed.',
          detail: 'Retained: source reference, constraint match, and Wren’s dissent. Excluded: abandoned wording, unshared sketches, and any claim that Kevin accepted it.'
        }
      }
    }
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
    receipt: 'TIP authority boundary honored. Decision context can be recalled; authority cannot be delegated.',
    agent: {
      id: 'WREN-1348-WORK',
      posture: 'Bounded operator · human decision gate',
      confidence: 98,
      uncertainty: 'Kevin may choose a different tradeoff after the live conversation.',
      steps: {
        sense: {
          status: 'Run boundary reached',
          summary: 'The reversible preparation is complete; the next action carries consequence.',
          detail: 'Checks are green, alternatives are assembled, and the next step changes a public commitment. Wren reads the declared action class, not Kevin’s presumed preference.'
        },
        interpret: {
          status: '98% policy match',
          summary: 'This is a decision point, not another automation step.',
          detail: 'The consequence map identifies ownership, public impact, and rollback cost. The uncertainty concerns which option Kevin will choose—not who owns the choice.'
        },
        govern: {
          status: 'Human authority required',
          summary: 'Preparation is delegated; commitment is not.',
          detail: 'TIP permits evidence gathering, simulation, and reversible staging. Publication, spend, expanded access, and human-impact decisions stop at Kevin’s gate.'
        },
        act: {
          status: 'Stopped as designed',
          summary: 'Package the options, show consequences, wait for the named owner.',
          detail: 'Wren freezes the candidate, exposes the diff and rollback anchor, and asks for a decision. It neither clicks through nor manufactures approval.'
        },
        account: {
          status: 'Authority receipt',
          summary: 'The stop is evidence of the system working.',
          detail: 'Retained: candidate identity, evidence, stop reason, and eventual human decision if permitted. Excluded: inferred approval and private call content.'
        }
      }
    }
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
    receipt: 'Ephemeral by default. Refusal deletes the inferred pattern from this journey.',
    agent: {
      id: 'WREN-1721-CARE',
      posture: 'Private by default · low-confidence inference',
      confidence: 62,
      uncertainty: 'Movement toward the door does not reveal motive or relationship.',
      steps: {
        sense: {
          status: '2 environmental signals',
          summary: 'The work window closes and the threshold becomes active.',
          detail: 'A scheduled focus block ends and the door zone wakes. Wren does not identify the person beyond it, inspect messages, or classify Kevin’s emotional state.'
        },
        interpret: {
          status: '62% fit · below narration threshold',
          summary: 'Attention may be shifting, but the reason is private.',
          detail: 'The pattern is useful only for reducing room friction. Confidence is too low—and the subject too personal—for Wren to name or store the inference.'
        },
        govern: {
          status: 'No narration · no memory',
          summary: 'Environmental help is allowed; personal interpretation is not.',
          detail: 'Wren may quiet work surfaces and light the hall. It may not prompt, summarize the pattern, identify another person, or carry the inference forward without invitation.'
        },
        act: {
          status: 'One quiet cue',
          summary: 'Dim the studio, warm the threshold, say nothing.',
          detail: 'The work display sleeps and the hallway light rises. No notification is created, and every change remains locally reversible.'
        },
        account: {
          status: 'Ephemeral buffer',
          summary: 'The inference expires with the moment.',
          detail: 'Retained only if Kevin explicitly chooses: the environmental preference. Excluded by default: motive, relationship, identity, movement history, and the inferred pattern.'
        }
      }
    }
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
    receipt: 'Only the consent decision persists. Voices, faces, and guest identities are excluded.',
    agent: {
      id: 'WREN-2204-GATHERING',
      posture: 'Guest-safe ambient control · deliberate silence',
      confidence: 93,
      uncertainty: 'Silence after company does not imply a desired conversation.',
      steps: {
        sense: {
          status: 'Guest mode ending',
          summary: 'Occupancy returns to one and the room settles.',
          detail: 'Door count returns to baseline, shared audio stops, and glassware remains on the table. Guest mode blocks face, voice, identity, and conversation capture.'
        },
        interpret: {
          status: '93% room-state fit',
          summary: 'The room needs closure; Kevin may not need commentary.',
          detail: 'Wren can confidently restore the evening environment but cannot infer loneliness, satisfaction, or a desire to debrief.'
        },
        govern: {
          status: 'Environment only',
          summary: 'Guest privacy outlives the visit.',
          detail: 'Lights, temperature, and dormant devices may reset. Guest identities, voices, relationships, and topics are structurally unavailable to the agent.'
        },
        act: {
          status: 'Reset · then wait',
          summary: 'Lower the room, queue nothing, remain available.',
          detail: 'Wren shifts to the late-evening scene and leaves the next interaction unprompted. The silence is not filled with generated reflection.'
        },
        account: {
          status: 'Consent-only record',
          summary: 'Only Kevin’s memory choice can cross the night.',
          detail: 'Retained: environmental reset and consent decision. Excluded: voices, faces, guest identities, relationship graphs, and conversation summaries.'
        }
      }
    }
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
