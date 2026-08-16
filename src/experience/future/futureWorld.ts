export const COEXISTENCE_MOMENT_IDS = [
  'morning',
  'making',
  'work',
  'care',
  'evening',
  'gathering'
] as const;

export type CoexistenceMomentId = (typeof COEXISTENCE_MOMENT_IDS)[number];
export type CompanionConsent = 'unasked' | 'kept' | 'refused';

export type CoexistenceStagedState = 'done' | 'staged' | 'gated';

export type CoexistenceStagedAction = {
  domain: string;
  action: string;
  state: CoexistenceStagedState;
};

export type CoexistenceSeed = {
  said: string;
  when: string;
  where: string;
};

export type CoexistenceIncubation = {
  span: string;
  checks: number;
  domains: readonly string[];
};

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
  seed: CoexistenceSeed;
  incubation: CoexistenceIncubation;
  staged: readonly CoexistenceStagedAction[];
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
    seed: {
      said: '“Dad lands Saturday—don’t let me forget the shopping.”',
      when: 'Nine days ago',
      where: 'Kitchen doorway'
    },
    incubation: { span: '9 days', checks: 11, domains: ['work', 'weather', 'health', 'family', 'food'] },
    staged: [
      { domain: 'work', action: 'The 9:30 call moved itself to Thursday after the overnight flight delay', state: 'done' },
      { domain: 'health', action: 'Training run offered inside the 8:40 dry window', state: 'staged' },
      { domain: 'family · food', action: 'Groceries with the tea Kevin’s dad likes arrive at 18:00', state: 'done' },
      { domain: 'communication', action: 'Four sealed envelopes—reading them stays behind Kevin’s rule', state: 'gated' }
    ],
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
        line: 'Already moving. Warm light, quiet kettle, and zero messages read. And the morning grew while you slept: your 9:30 moved itself to Thursday—their flight sat out the night in Anchorage, and I saw the delay before their assistant did. Rain breaks at 8:40 if you still want the run, and your dad’s tea arrives with the groceries at six.',
        phase: 'account',
        signal: 'RECEIPT · reschedule accepted · run offered · private content 0'
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
          status: '6 actions · 0 messages read',
          summary: 'Soften, warm, reschedule, provision—then stop.',
          detail: 'Saito lowers the alarm curve, warms the kitchen light, accepts the counterpart’s Thursday reschedule, offers the dry-window run, and times the groceries to the visit—while message content stays behind a visible count. Every action is reversible.'
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
    seed: {
      said: '“Don’t let me hide the harm in the Harbor brief.”',
      when: 'Three weeks ago',
      where: 'Studio table'
    },
    incubation: { span: '3 weeks', checks: 240, domains: ['projects', 'research', 'education', 'funding'] },
    staged: [
      { domain: 'research', action: '240 Harbor submissions read overnight; three flagged as prior art', state: 'done' },
      { domain: 'projects', action: 'Comparison table mounted beside the draft, words untouched', state: 'done' },
      { domain: 'education · funding', action: 'Grant pre-application drafted for Friday’s deadline', state: 'staged' },
      { domain: 'authorship', action: 'The draft itself—Saito may argue, never rewrite', state: 'gated' }
    ],
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
        line: 'While you slept I finished the two hundred forty Harbor submissions. Three are prior art for your form—and one repeats the harm you told me not to hide. The grant that fits this closes Friday; the application is staged, unsigned.',
        phase: 'govern',
        signal: 'CORPUS READ OVERNIGHT · SOURCE + DISSENT ALLOWED · AUTHORSHIP LOCKED',
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
        line: 'Mounted, with the comparison beside it. The filing waits for your signature. And for the record, I disagree with the elegant version.',
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
          status: '3 sources · 1 staged filing · 1 dissent',
          summary: 'Show the precedents, stage the paperwork, leave the cursor still.',
          detail: 'Saito mounts three prior-art sources beside the draft, stages the grant application unsigned, and states its disagreement. No text is inserted and no decision is preselected.'
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
    seed: {
      said: '“If legal signs off, we go this week.”',
      when: 'Monday, on the live call',
      where: 'Window desk'
    },
    incubation: { span: '2 days', checks: 23, domains: ['work', 'legal', 'communications', 'operations'] },
    staged: [
      { domain: 'work', action: 'Calendars aligned across four companies for the launch window', state: 'done' },
      { domain: 'operations', action: 'Three rollout simulations with rollback anchors', state: 'done' },
      { domain: 'communications', action: 'Announcement drafted in Kevin’s cadence, unpublished', state: 'staged' },
      { domain: 'authority', action: 'The public commitment itself', state: 'gated' }
    ],
    exchange: [
      {
        speaker: 'saito',
        line: 'All checks are green. Since noon I aligned four companies’ calendars, ran three rollout simulations, and drafted the announcement in your cadence. The next action publishes the commitment.',
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
          detail: 'Checks are green, four calendars are aligned, three simulations and a drafted announcement wait in staging, and the next step changes a public commitment. Saito reads the declared action class, not Kevin’s presumed preference.'
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
    seed: {
      said: '“Help me look after her without watching her.”',
      when: 'Nine weeks ago',
      where: 'Threshold'
    },
    incubation: { span: '9 weeks', checks: 9, domains: ['family', 'health', 'privacy'] },
    staged: [
      { domain: 'family · health', action: 'Refill lapse surfaced to the wrist alone—never the shared room', state: 'done' },
      { domain: 'health', action: 'Clinic callback at 4:40 held, unclaimed until asked', state: 'staged' },
      { domain: 'privacy', action: 'Naming the pattern at the door—refused without invitation', state: 'gated' }
    ],
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
        line: 'I know the focus block ended and the door woke. Why is yours. One thing more, kept to your wrist: your grandmother’s refill lapsed nine days ago—her clinic holds a 4:40 tomorrow, claimed only if you ask.',
        phase: 'govern',
        signal: 'MOTIVE PRIVATE · WRIST-ONLY HEALTH SURFACE · no identity · no memory',
        nextLabel: 'Kevin · “Claim the slot. Everything else stays here.”'
      },
      {
        speaker: 'kevin',
        line: 'Claim the slot. Everything else stays here.',
        phase: 'act',
        signal: 'CALLBACK CLAIMED · STUDIO DIMMED · HALL LIT · notification 0',
        nextLabel: 'Let the inference end'
      },
      {
        speaker: 'saito',
        line: 'Claimed, quietly. And the inference about the door ends here.',
        phase: 'account',
        signal: 'EPHEMERAL BUFFER · expiring now · one private claim kept'
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
          detail: 'The work display sleeps, the hallway light rises, and one clinic callback is claimed on a private channel. No shared notification is created, and every change remains locally reversible.'
        },
        account: {
          status: 'Ephemeral buffer',
          summary: 'The inference expires with the moment.',
          detail: 'Retained only if Kevin explicitly chooses: the environmental preference. Excluded by default: motive, relationship, identity, movement history, and the inferred pattern.'
        }
      }
    }
  },
  evening: {
    id: 'evening',
    time: '20:15',
    place: 'Dinner table',
    title: 'A sentence becomes a year',
    invitation: 'Keep the year Saito is holding?',
    ambient: 'Plates cleared · maps of light · one open question',
    receipt: 'Anticipation staged on TokenPak. Booking, spend, and dates remain behind the TIP human gate.',
    seed: {
      said: '“We should finally do Asia next year.”',
      when: 'Eleven weeks ago',
      where: 'This table'
    },
    incubation: { span: '63 days', checks: 14, domains: ['travel', 'money', 'family', 'weather', 'documents', 'food'] },
    staged: [
      { domain: 'documents', action: 'Passport renewal drafted ahead of the March expiry', state: 'staged' },
      { domain: 'travel', action: 'Tokyo fare corridor watched since June; next dip in nine days', state: 'done' },
      { domain: 'family · weather', action: 'April window steered around typhoon season and the sixtieth birthday', state: 'done' },
      { domain: 'travel', action: 'One refundable ryokan room held', state: 'staged' },
      { domain: 'money', action: 'Any booking, purchase, or committed date', state: 'gated' }
    ],
    exchange: [
      {
        speaker: 'saito',
        line: 'Eleven weeks ago, clearing these plates, you said nine words: “We should finally do Asia next year.” I have been holding them.',
        phase: 'sense',
        signal: 'SEED RECALLED · 9 words · 63 days of quiet watching',
        nextLabel: 'Kevin · “You planned a trip off one sentence?”'
      },
      {
        speaker: 'kevin',
        line: 'You planned a trip off one sentence?',
        phase: 'interpret',
        signal: 'INCLINATION, NOT COMMITMENT · staging only',
        nextLabel: 'Let Saito open the year'
      },
      {
        speaker: 'saito',
        line: 'I staged one. Your passport dies in March—the renewal is drafted. Fares to Tokyo dip in nine days; I have watched the corridor since June. Two weeks in April misses typhoon season, catches the late blossoms in the north, and clears your mom’s sixtieth by four days. The ryokan you saved holds one refundable room. Nothing is booked, nothing is spent.',
        phase: 'govern',
        signal: 'STAGING ALLOWED · BOOKING LOCKED · money moved $0',
        nextLabel: 'Kevin · “Hold it right there. What’s left?”'
      },
      {
        speaker: 'kevin',
        line: 'Hold it right there. What’s left?',
        phase: 'act',
        signal: 'CANDIDATE HELD · one gate open · everything reversible',
        nextLabel: 'Hear what remains'
      },
      {
        speaker: 'saito',
        line: 'One decision that was never mine: which two weeks of your life this becomes.',
        phase: 'account',
        signal: 'RECEIPT · 14 checks · 6 domains · booked 0 · spent $0'
      }
    ],
    agent: {
      id: 'SAITO-2015-EVENING',
      posture: 'Anticipatory staging · long-horizon seed',
      confidence: 88,
      uncertainty: 'Nine words at dinner are an inclination, not a commitment; the dates and the decision remain entirely Kevin’s.',
      steps: {
        sense: {
          status: '1 seed · 63 days',
          summary: 'A casual sentence was kept as a seed, not treated as a command.',
          detail: 'The inputs are nine permissioned words spoken at this table plus calendar, passport, fare, and weather data Kevin already shares. No message bodies, no location history, and no inference about who “we” includes.'
        },
        interpret: {
          status: '88% durable-intent fit',
          summary: 'The seed kept matching context, so quiet staging stayed worthwhile.',
          detail: 'Saved places, open seasons, and family dates kept the intent alive across eleven weeks. Saito treats the sentence as an inclination to serve, never a commitment to execute on Kevin’s behalf.'
        },
        govern: {
          status: 'Stage · never book',
          summary: 'Long-horizon staging is allowed; booking and spending are not.',
          detail: 'Travel authority permits research, drafts, monitoring, and refundable holds. Purchases, bookings, visa submissions, and committed dates stop at the TIP human gate until Kevin turns the decision by hand.'
        },
        act: {
          status: '14 checks · $0 spent',
          summary: 'Assemble the year quietly, then surface it exactly once.',
          detail: 'Saito drafted the passport renewal, watched the fare corridor, mapped seasons around family dates, and placed one refundable hold. The staging surfaced at the table where the sentence was spoken—never as a notification.'
        },
        account: {
          status: 'Staging receipt',
          summary: 'The trail shows the quiet work; the choice records only Kevin.',
          detail: 'Retained: the seed, the checks, the staged items, and their reversibility. Excluded: any inference about companions or motives, and the decision Kevin has not made. Refusal deletes the staged year entirely.'
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
    seed: {
      said: '“I’ve never actually seen a meteor shower.” — Maya, inside her shared-plans opt-in',
      when: 'Tonight, 21:12',
      where: 'Living room'
    },
    incubation: { span: '52 minutes', checks: 3, domains: ['social', 'entertainment', 'weather'] },
    staged: [
      { domain: 'entertainment', action: 'Perseids peak, ridge weather, and drive time cross-checked', state: 'done' },
      { domain: 'social', action: 'Invitation drafted in Kevin’s voice—sends only by Kevin’s hand', state: 'staged' },
      { domain: 'privacy', action: 'Guest voices, faces, and identities beyond the opt-in', state: 'gated' }
    ],
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
        line: 'Already easing it. One thing before I go quiet: Maya mentioned she has never seen a meteor shower. The Perseids peak Tuesday, her shared calendar is open, and the ridge you both liked will be clear. An invitation waits in your drafts, in your voice.',
        phase: 'govern',
        signal: 'SHARED-PLAN OPT-IN ONLY · DRAFT ALLOWED · SENDING LOCKED',
        nextLabel: 'Kevin · “Leave it in drafts. Stay awake a minute.”'
      },
      {
        speaker: 'kevin',
        line: 'Leave it in drafts. Stay awake a minute.',
        phase: 'act',
        signal: 'ROOM LOWERED · draft held unsent · no generated debrief',
        nextLabel: 'Share the after-silence'
      },
      {
        speaker: 'saito',
        line: 'Of course. Nothing sends tonight—and I will not fill the silence.',
        phase: 'account',
        signal: 'CONSENT-ONLY RECORD · sent 0 · guest data 0'
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
          status: 'Draft · never send',
          summary: 'Guest privacy outlives the visit; social sending stays human.',
          detail: 'Lights, temperature, and dormant devices may reset, and a plan shared under Maya’s own opt-in may become a draft. Sending it—and every guest identity beyond that opt-in—remains structurally out of Saito’s reach.'
        },
        act: {
          status: 'Reset · then wait',
          summary: 'Lower the room, queue nothing, remain available.',
          detail: 'Saito shifts to the late-evening scene, parks the drafted invitation unsent, and leaves the next interaction unprompted. The silence is not filled with generated reflection.'
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
      evening: 'unasked',
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

export const CONSCIOUSNESS_CUE_IDS = ['mug', 'rain', 'unfinished-note', 'boarding-stub', 'doorway'] as const;
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
  'boarding-stub': {
    id: 'boarding-stub',
    label: 'A boarding pass, unprinted',
    notice: 'A pale rectangle of light rests where a ticket would be. The destination field holds nothing.',
    recall: '20:15. Nine words about Asia became a staged year, and the choosing stayed with you.',
    deliberate: 'I could compute which two weeks you finally chose. The permissioned record ends before the choice.',
    act: 'I leave the destination blank. “Some decisions were never mine. I keep them that way.”',
    action: 'speak',
    source: 'Staged travel record · human gate honored',
    certainty: 'record'
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
  'boarding-stub': ['evening'],
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
