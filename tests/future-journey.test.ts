import { describe, expect, it } from 'vitest';
import { createInitialFutureJourney, hydrateFutureJourney } from '@/experience/future/futureJourney';
import {
  AGENT_TRACE_PHASES,
  COEXISTENCE_MOMENT_IDS,
  saitoAuthorityMap,
  advanceConsciousnessBehavior,
  createInitialCoexistenceState,
  createInitialConsciousnessState,
  coexistenceMoments,
  consciousnessCues,
  getConsciousnessLine,
  getPermissionedMemorySource,
  getPermissionedMemoryState,
  resolveCompanionConsent,
  resolveEncounterRetention,
  selectCoexistenceMoment,
  selectConsciousnessCue,
  getConsciousnessContinueLabel,
  getEarnedMemoryLine,
  getNextUnaskedMoment
} from '@/experience/future/futureWorld';

describe('future journey domain', () => {
  it('lets Saito keep or forget moments only through explicit consent', () => {
    let state = createInitialCoexistenceState();
    state = selectCoexistenceMoment(state, 'making');
    state = resolveCompanionConsent(state, 'kept');
    expect(state.keptMoments).toEqual(['making']);
    expect(state.consent.making).toBe('kept');
    state = resolveCompanionConsent(state, 'refused');
    expect(state.keptMoments).toEqual([]);
    expect(state.refusedMoments).toEqual(['making']);
  });

  it('gives every 2030 moment a direct exchange synchronized to the inspectable agent record', () => {
    for (const moment of Object.values(coexistenceMoments)) {
      expect(Object.keys(moment.agent.steps)).toEqual(AGENT_TRACE_PHASES);
      expect(moment.exchange).toHaveLength(AGENT_TRACE_PHASES.length);
      expect(moment.exchange.map((beat) => beat.phase)).toEqual(AGENT_TRACE_PHASES);
      expect(moment.exchange[0].speaker).toBe('saito');
      expect(moment.exchange.some((beat) => beat.speaker === 'kevin')).toBe(true);
      expect(moment.exchange.every((beat) => beat.signal.length > 20)).toBe(true);
      expect(moment.agent.confidence).toBeGreaterThan(0);
      expect(moment.agent.confidence).toBeLessThanOrEqual(100);
      expect(moment.agent.uncertainty.length).toBeGreaterThan(20);
      expect(moment.seed.said.length).toBeGreaterThan(10);
      expect(moment.incubation.checks).toBeGreaterThan(0);
      expect(moment.incubation.domains.length).toBeGreaterThan(0);
      expect(moment.staged.length).toBeGreaterThanOrEqual(3);
      expect(moment.staged.some((item) => item.state === 'gated')).toBe(true);
      expect(moment.staged.at(-1)?.state).toBe('gated');
      for (const phase of AGENT_TRACE_PHASES) {
        expect(moment.agent.steps[phase].summary.length).toBeGreaterThan(20);
        expect(moment.agent.steps[phase].detail.length).toBeGreaterThan(50);
      }
    }
    expect(coexistenceMoments.morning.agent.steps.sense.detail).toContain('biometrics are not opened');
    expect(coexistenceMoments.work.exchange[2].line).toContain('cannot spend your authority');
    expect(coexistenceMoments.work.agent.steps.govern.status).toBe('Human authority required');
    expect(coexistenceMoments.care.agent.steps.account.status).toBe('Ephemeral buffer');
  });

  it('stages long-horizon, multi-domain anticipation and keeps commitment behind the human gate', () => {
    expect(COEXISTENCE_MOMENT_IDS).toHaveLength(6);
    const evening = coexistenceMoments.evening;
    expect(evening.seed.said).toContain('Asia');
    expect(evening.incubation.domains.length).toBeGreaterThanOrEqual(5);
    expect(evening.exchange[2].line).toContain('Nothing is booked, nothing is spent');
    expect(evening.exchange[4].line).toContain('never mine');
    expect(evening.staged.filter((item) => item.state === 'gated').map((item) => item.domain)).toContain('money');

    let coexistence = resolveCompanionConsent(createInitialCoexistenceState(), 'kept', 'evening');
    expect(getPermissionedMemoryState(coexistence, 'boarding-stub')).toBe('retained');
    expect(getPermissionedMemorySource(coexistence, 'boarding-stub')).toContain('20:15 Dinner table');
    coexistence = resolveCompanionConsent(coexistence, 'refused', 'evening');
    expect(getPermissionedMemoryState(coexistence, 'boarding-stub')).toBe('withheld');
    expect(getConsciousnessLine(consciousnessCues['boarding-stub'], 'recall', 'withheld')).toContain('will not reconstruct');
  });

  it('states standing authority as an instrument and keeps private incubations off shared glass', () => {
    expect(saitoAuthorityMap).toHaveLength(5);
    expect(saitoAuthorityMap.map((tier) => tier.level)).toEqual(['Full auto', 'Notify first', 'Stage to gate', 'Stage only', 'Draft only']);
    const money = saitoAuthorityMap.find((tier) => tier.domains === 'Money');
    expect(money?.level).toBe('Stage only');
    expect(money?.meaning).toContain('Kevin’s call');
    const social = saitoAuthorityMap.find((tier) => tier.domains === 'Social');
    expect(social?.meaning).toContain('Kevin’s hand');

    expect(coexistenceMoments.morning.thread).toBeTruthy();
    expect(coexistenceMoments.evening.thread).toContain('ASIA');
    expect(coexistenceMoments.care.thread).toBeUndefined();
    expect(coexistenceMoments.gathering.thread).toBeUndefined();
  });

  it('allows 2040 to recall only memories that 2030 was permitted to keep', () => {
    let coexistence = resolveCompanionConsent(createInitialCoexistenceState(), 'kept', 'morning');
    expect(getPermissionedMemoryState(coexistence, 'mug')).toBe('retained');
    expect(getPermissionedMemorySource(coexistence, 'mug')).toContain('07:12 Kitchen');
    expect(getConsciousnessLine(consciousnessCues.mug, 'recall', 'retained')).toContain('07:12');

    coexistence = resolveCompanionConsent(coexistence, 'refused', 'care');
    coexistence = resolveCompanionConsent(coexistence, 'refused', 'gathering');
    expect(getPermissionedMemoryState(coexistence, 'doorway')).toBe('withheld');
    expect(getPermissionedMemorySource(coexistence, 'doorway')).toContain('deliberately withheld');
    expect(getConsciousnessLine(consciousnessCues.doorway, 'recall', 'withheld')).toContain('will not reconstruct');
  });

  it('moves consciousness through behavior before asking to retain the encounter', () => {
    let state = selectConsciousnessCue(createInitialConsciousnessState(), 'unfinished-note');
    expect(state.visitedCues).toContain('unfinished-note');
    for (let index = 0; index < 4; index += 1) state = advanceConsciousnessBehavior(state);
    expect(state.behaviorPhase).toBe('continue');
    state = resolveEncounterRetention(state, 'released');
    expect(state.encounterRetention).toBe('released');
  });

  it('drops the retired Nexus mission and Echo keys when hydrating an old journey', () => {
    const legacy = {
      ...createInitialFutureJourney(),
      mission: { objective: 'Preserve this objective' },
      echo: { resonance: 48 }
    };
    legacy.coexistence.consent.morning = 'kept';
    legacy.coexistence.keptMoments = ['morning'];
    const hydrated = hydrateFutureJourney(legacy);
    expect(Object.keys(hydrated).sort()).toEqual(['coexistence', 'consciousness']);
    expect(hydrated.coexistence.keptMoments).toEqual(['morning']);
    expect(hydrated.consciousness.behaviorPhase).toBe('notice');
  });

  it('makes blanks feel earned and walks the day forward to the next open moment', () => {
    let coexistence = createInitialCoexistenceState();
    expect(getEarnedMemoryLine(coexistence)).toBeNull();
    expect(getNextUnaskedMoment(coexistence)).toBe('making');
    coexistence = resolveCompanionConsent(coexistence, 'kept', 'morning');
    expect(getEarnedMemoryLine(coexistence)).toBe('You kept 1 of 6 moments; this is all he has.');
    coexistence = selectCoexistenceMoment(coexistence, 'gathering');
    expect(getNextUnaskedMoment(coexistence)).toBe('making');
    coexistence = resolveCompanionConsent(createInitialCoexistenceState(), 'refused', 'care');
    expect(getEarnedMemoryLine(coexistence)).toContain('none of the 6 moments');
    for (const id of COEXISTENCE_MOMENT_IDS) coexistence = resolveCompanionConsent(coexistence, 'kept', id);
    expect(getNextUnaskedMoment(coexistence)).toBeNull();
  });

  it('reveals every moment at a data-driven beat that always precedes the question', () => {
    for (const moment of Object.values(coexistenceMoments)) {
      expect(moment.revealAt).toBeGreaterThan(0);
      expect(moment.revealAt).toBeLessThan(moment.exchange.length - 1);
    }
  });

  it('treats a released encounter as final and a kept one as ready for the next cue', () => {
    let state = createInitialConsciousnessState();
    for (let index = 0; index < 4; index += 1) state = advanceConsciousnessBehavior(state);
    const kept = selectConsciousnessCue(resolveEncounterRetention(state, 'kept'), 'rain');
    expect(kept).toMatchObject({ selectedCue: 'rain', behaviorPhase: 'notice', encounterRetention: 'unasked' });
    const released = resolveEncounterRetention(state, 'released');
    expect(selectConsciousnessCue(released, 'rain')).toBe(released);
    expect(getConsciousnessContinueLabel('notice')).toBe('Let Kevin recall');
    expect(getConsciousnessContinueLabel('continue')).toBeNull();
  });
});
