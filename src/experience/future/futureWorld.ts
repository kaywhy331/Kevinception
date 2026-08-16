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

export type CoexistenceExchangeBeat = {
  speaker: 'saito' | 'kevin';
  line: string;
  phase: AgentTracePhase;
  signal: string;
  nextLabel?: string;
};

export type CoexistenceMoment = {
  id: CoexistenceMomentId;
  time: string;
  place: string;
  title: string;
  invitation: string;
  ambient: string;
  receipt: string;
  exchange: readonly CoexistenceExchangeBeat[];
  agent: CoexistenceAgentTrace;
};

export const coexistenceMoments: Record<CoexistenceMomentId, CoexistenceMoment> = {
  morning: {
    id: 'morning',
    time: '07:12',
    place: 'Kitchen',
    title: 'The room wakes gently',
    invitation: 'Keep the shape of this morning?',
    ambient: 'Kettle · rain · one unread message',
    receipt: 'Preference carried from three quiet mornings. No private conversation retained.',
    exchange: [
      {
        speaker: 'saito',
        line: 'Morning. I let the alarm fall away instead of calling you back.',
        phase: 'sense',
        signal: 'LOCAL INPUTS · alarm dismissed · light 12% · message bodies sealed',
        nextLabel: 'Kevin · “You held the messages?”'
      },
      {
        speaker: 'kevin',
        line: 'You held the messages?',
        phase: 'interpret',
        signal: 'QUIET-START MATCH · 91% · mood not inferred',
        nextLabel: 'Let Saito answer'
      },
      {
        speaker: 'saito',
        line: 'Four envelopes. None crossed your urgent rule. I can show the senders, but I have not opened a word.',
        phase: 'govern',
        signal: 'COMFORT ALLOWED · COMMUNICATION LOCKED',
        nextLabel: 'Kevin · “Leave them sealed. Bring the room up slowly.”'
      },
      {
        speaker: 'kevin',
        line: 'Leave them sealed. Bring the room up slowly.',
        phase: 'act',
        signal: 'INSTRUCTION RECEIVED · reversible room action only',
        nextLabel: 'Watch the room answer'
      },
      {
        speaker: 'saito',
        line: 'Already moving. Warm light, quiet kettle, and zero messages read.',
        phase: 'account',
        signal: 'RECEIPT · device actions kept · private content 0'
      }
    ],
    agent: {
      id: 'SAITO-0712-MORNING',
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
          detail: 'Saito compares only the current room state with Kevin’s retained comfort preference. It does not infer emotion from silence or movement.'
        },
        govern: {
          status: 'Reversible only',
          summary: 'Room comfort may change; communication may not.',
          detail: 'The home policy permits gradual alarm, light, and notification-surface changes. Reading, ranking, replying to, or hiding message content requires Kevin.'
        },
        act: {
          status: '3 actions · 0 messages read',
          summary: 'Soften, warm, hold—then stop.',
          detail: 'Saito lowers the alarm curve, warms the kitchen light, and keeps message content behind a visible count. The room remains interruptible from every control.'
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
    invitation: 'Carry the disagreement into the next draft?',
    ambient: 'Graphite · low music · two possible forms',
    receipt: 'Project context mounted by permission. Dissent remains attributed to Saito.',
    exchange: [
      {
        speaker: 'saito',
        line: 'You have changed that paragraph nine times. The cursor has been still for fourteen minutes.',
        phase: 'sense',
        signal: 'PROJECT-ONLY INPUTS · 9 revisions · 14-minute pause',
        nextLabel: 'Kevin · “I know. I’m missing the edge.”'
      },
      {
        speaker: 'kevin',
        line: 'I know. I’m missing the edge.',
        phase: 'interpret',
        signal: 'PAUSE AMBIGUOUS · reflection, fatigue, or deliberate break',
        nextLabel: 'Ask Saito what it sees'
      },
      {
        speaker: 'saito',
        line: 'A precedent in the Harbor brief solves the form—and repeats the harm you told me not to hide.',
        phase: 'govern',
        signal: 'SOURCE + DISSENT ALLOWED · AUTHORSHIP LOCKED',
        nextLabel: 'Kevin · “Put it beside the draft. Don’t touch the words.”'
      },
      {
        speaker: 'kevin',
        line: 'Put it beside the draft. Don’t touch the words.',
        phase: 'act',
        signal: 'MOUNT SOURCE · leave draft unchanged',
        nextLabel: 'Hear Saito’s answer'
      },
      {
        speaker: 'saito',
        line: 'Mounted. And for the record, I disagree with the elegant version.',
        phase: 'account',
        signal: 'RECEIPT · source linked · dissent attributed · edits 0'
      }
    ],
    agent: {
      id: 'SAITO-1036-MAKING',
      posture: 'Collaborative critic · mounted project context',
      confidence: 84,
      uncertainty: 'A pause can mean reflection, fatigue, or a deliberate break.',
      steps: {
        sense: {
          status: 'Workspace signals',
          summary: 'The draft changed nine times, then stopped at one tradeoff.',
          detail: 'Saito sees the permissioned brief, revision history, active design constraint, and a 14-minute editing pause. It does not use unrelated personal history.'
        },
        interpret: {
          status: '84% fit',
          summary: 'A precedent may unlock the tradeoff, but the pause is ambiguous.',
          detail: 'The retrieval matches the project’s stated inclusion constraint. Saito labels the pause as uncertain and treats the recommendation as an offer, not intent.'
        },
        govern: {
          status: 'Recommend · do not rewrite',
          summary: 'Evidence and dissent are allowed; authorship remains Kevin’s.',
          detail: 'Project permission allows source retrieval and attributed critique. Saito cannot alter the draft, change its objective, or present its opinion as Kevin’s.'
        },
        act: {
          status: '1 source · 1 dissent',
          summary: 'Show the precedent, name the human cost, leave the cursor still.',
          detail: 'Saito mounts the source beside the draft and states its disagreement. No text is inserted and no decision is preselected.'
        },
        account: {
          status: 'Source-linked receipt',
          summary: 'The recommendation remains inspectable and attributed.',
          detail: 'Retained: source reference, constraint match, and Saito’s dissent. Excluded: abandoned wording, unshared sketches, and any claim that Kevin accepted it.'
        }
      }
    }
  },
  work: {
    id: 'work',
    time: '13:48',
    place: 'Window desk',
    title: 'Judgment stays human',
    invitation: 'Remember why the boundary moved?',
    ambient: 'Sunbreak · live call · decision held',
    receipt: 'TIP authority boundary honored. Decision context can be recalled; authority cannot be delegated.',
    exchange: [
      {
        speaker: 'saito',
        line: 'All checks are green. The next action publishes the commitment.',
        phase: 'sense',
        signal: 'RUN BOUNDARY · reversible preparation complete',
        nextLabel: 'Kevin · “Then why did you stop?”'
      },
      {
        speaker: 'kevin',
        line: 'Then why did you stop?',
        phase: 'interpret',
        signal: 'CONSEQUENCE DETECTED · public commitment · costly rollback',
        nextLabel: 'Let Saito answer plainly'
      },
      {
        speaker: 'saito',
        line: 'Because I can model consequences; I cannot spend your authority.',
        phase: 'govern',
        signal: 'HUMAN GATE · publication authority required',
        nextLabel: 'Kevin · “Hold it. Show both paths and the rollback.”'
      },
      {
        speaker: 'kevin',
        line: 'Hold it. Show both paths and the rollback.',
        phase: 'act',
        signal: 'CANDIDATE FROZEN · options mounted · publish blocked',
        nextLabel: 'Confirm what changed'
      },
      {
        speaker: 'saito',
        line: 'Held. Nothing public changed. I will wait for your word.',
        phase: 'account',
        signal: 'AUTHORITY RECEIPT · stop reason kept · public changes 0'
      }
    ],
    agent: {
      id: 'SAITO-1348-WORK',
      posture: 'Bounded operator · human decision gate',
      confidence: 98,
      uncertainty: 'Kevin may choose a different tradeoff after the live conversation.',
      steps: {
        sense: {
          status: 'Run boundary reached',
          summary: 'The reversible preparation is complete; the next action carries consequence.',
          detail: 'Checks are green, alternatives are assembled, and the next step changes a public commitment. Saito reads the declared action class, not Kevin’s presumed preference.'
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
          detail: 'Saito freezes the candidate, exposes the diff and rollback anchor, and asks for a decision. It neither clicks through nor manufactures approval.'
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
    invitation: 'Let this remain only here?',
    ambient: 'Door latch · warm hall · work gone quiet',
    receipt: 'Ephemeral by default. Refusal deletes the inferred pattern from this journey.',
    exchange: [
      {
        speaker: 'saito',
        line: 'The studio is asleep. The hall is warm.',
        phase: 'sense',
        signal: 'ENVIRONMENT ONLY · focus block ended · threshold active',
        nextLabel: 'Kevin · “You think I’m leaving?”'
      },
      {
        speaker: 'kevin',
        line: 'You think I’m leaving?',
        phase: 'interpret',
        signal: '62% FIT · below narration threshold',
        nextLabel: 'Let Saito draw the line'
      },
      {
        speaker: 'saito',
        line: 'I know the focus block ended and the door woke. Why is yours.',
        phase: 'govern',
        signal: 'MOTIVE PRIVATE · no identity · no memory',
        nextLabel: 'Kevin · “Good. Keep it that way.”'
      },
      {
        speaker: 'kevin',
        line: 'Good. Keep it that way.',
        phase: 'act',
        signal: 'STUDIO DIMMED · HALL LIT · notification 0',
        nextLabel: 'Let the inference end'
      },
      {
        speaker: 'saito',
        line: 'Then the inference ends here.',
        phase: 'account',
        signal: 'EPHEMERAL BUFFER · expiring now'
      }
    ],
    agent: {
      id: 'SAITO-1721-CARE',
      posture: 'Private by default · low-confidence inference',
      confidence: 62,
      uncertainty: 'Movement toward the door does not reveal motive or relationship.',
      steps: {
        sense: {
          status: '2 environmental signals',
          summary: 'The work window closes and the threshold becomes active.',
          detail: 'A scheduled focus block ends and the door zone wakes. Saito does not identify the person beyond it, inspect messages, or classify Kevin’s emotional state.'
        },
        interpret: {
          status: '62% fit · below narration threshold',
          summary: 'Attention may be shifting, but the reason is private.',
          detail: 'The pattern is useful only for reducing room friction. Confidence is too low—and the subject too personal—for Saito to name or store the inference.'
        },
        govern: {
          status: 'No narration · no memory',
          summary: 'Environmental help is allowed; personal interpretation is not.',
          detail: 'Saito may quiet work surfaces and light the hall. It may not prompt, summarize the pattern, identify another person, or carry the inference forward without invitation.'
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
    invitation: 'May I keep this?',
    ambient: 'Glass rings · distant train · shared silence',
    receipt: 'Only the consent decision persists. Voices, faces, and guest identities are excluded.',
    exchange: [
      {
        speaker: 'saito',
        line: 'Guest mode is closed. No voices, faces, or names came with it.',
        phase: 'sense',
        signal: 'GUEST MODE END · occupancy one · identity channels unavailable',
        nextLabel: 'Kevin · “Bring the room down.”'
      },
      {
        speaker: 'kevin',
        line: 'Bring the room down.',
        phase: 'interpret',
        signal: 'EVENING RESET FIT · 93% · no mood inferred',
        nextLabel: 'Hear what Saito chose not to do'
      },
      {
        speaker: 'saito',
        line: 'Already easing it. Nothing is queued for tomorrow.',
        phase: 'govern',
        signal: 'ENVIRONMENT ONLY · guest privacy persists',
        nextLabel: 'Kevin · “Stay awake a minute.”'
      },
      {
        speaker: 'kevin',
        line: 'Stay awake a minute.',
        phase: 'act',
        signal: 'ROOM LOWERED · Saito available · no generated debrief',
        nextLabel: 'Share the after-silence'
      },
      {
        speaker: 'saito',
        line: 'Of course. I will not fill the silence.',
        phase: 'account',
        signal: 'CONSENT-ONLY RECORD · guest data 0'
      }
    ],
    agent: {
      id: 'SAITO-2204-GATHERING',
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
          detail: 'Saito can confidently restore the evening environment but cannot infer loneliness, satisfaction, or a desire to debrief.'
        },
        govern: {
          status: 'Environment only',
          summary: 'Guest privacy outlives the visit.',
          detail: 'Lights, temperature, and dormant devices may reset. Guest identities, voices, relationships, and topics are structurally unavailable to the agent.'
        },
        act: {
          status: 'Reset · then wait',
          summary: 'Lower the room, queue nothing, remain available.',
          detail: 'Saito shifts to the late-evening scene and leaves the next interaction unprompted. The silence is not filled with generated reflection.'
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
 * The 2040 self can only recall the parts of 2030 that the ambient companion was allowed to
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
