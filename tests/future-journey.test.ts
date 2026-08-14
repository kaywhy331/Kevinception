import { describe, expect, it } from 'vitest';
import {
  advanceFutureMission,
  beginFutureMission,
  createInitialFutureJourney,
  createMissionRun,
  FUTURE_MISSION_IDS,
  futureMissionTemplates,
  inferEchoIntent,
  interpretEchoThought,
  markEchoFinaleSeen,
  openEchoMemory,
  resolveFutureMission,
  setFutureAutonomy,
  setFutureObjective
} from '@/experience/future/futureJourney';

describe('future journey domain', () => {
  it('provides five materially distinct 2030 missions', () => {
    expect(FUTURE_MISSION_IDS).toHaveLength(5);
    const signatures = FUTURE_MISSION_IDS.map((id) => futureMissionTemplates[id].tasks.map((task) => task.label).join('|'));
    expect(new Set(signatures).size).toBe(5);
    expect(FUTURE_MISSION_IDS.every((id) => futureMissionTemplates[id].questions.length === 2)).toBe(true);
  });

  it('makes the autonomy level change task authority without bypassing the Governor', () => {
    const initial = createInitialFutureJourney();
    const low = createMissionRun(setFutureAutonomy(initial, 1).mission);
    const high = createMissionRun(setFutureAutonomy(initial, 5).mission);
    expect(low.tasks.map((task) => task.mode)).not.toEqual(high.tasks.map((task) => task.mode));
    expect(low.tasks.at(-1)?.mode).toBe('human-led');
    expect(high.tasks.at(-1)?.mode).toBe('human-led');
    expect(high.humanGateReason).toContain('High initiative');
  });

  it('reaches a real decision gate and creates a persistent continuation receipt', () => {
    let state = setFutureObjective(createInitialFutureJourney(), 'Create a safer launch plan');
    state = beginFutureMission(state);
    while (state.mission.phase === 'orchestrating') state = advanceFutureMission(state);
    expect(state.mission.phase).toBe('decision');
    state = resolveFutureMission(state, 'revise', '2040-01-01T00:00:00.000Z');
    expect(state.mission.phase).toBe('complete');
    expect(state.mission.artifact).toMatchObject({ decision: 'revise', status: 'reframed', completedAt: '2040-01-01T00:00:00.000Z' });
    expect(state.mission.artifact?.receiptId).toMatch(/^NX-/);
    expect(state.mission.artifact?.nextStep).toContain('reversible probe');
  });

  it('routes supported thoughts and refuses to invent unknown details', () => {
    expect(inferEchoIntent('Can you design a database?')).toBe('work');
    expect(inferEchoIntent('What is your favorite color?')).toBe('unknown');
    const state = interpretEchoThought(createInitialFutureJourney(), 'What is your favorite color?');
    expect(state.echo.response?.label).toBe('Evidence boundary');
    expect(state.echo.response?.answer).toContain('not present in the verified records');
  });

  it('makes the 2040 response reflect a completed 2030 mission', () => {
    let state = beginFutureMission(createInitialFutureJourney());
    while (state.mission.phase === 'orchestrating') state = advanceFutureMission(state);
    state = resolveFutureMission(state, 'approve', '2040-01-01T00:00:00.000Z');
    state = interpretEchoThought(state, 'What happened in the mission?');
    expect(state.echo.response?.answer).toContain(state.mission.artifact?.receiptId);
    expect(state.echo.response?.sources).toContain(`Mission receipt ${state.mission.artifact?.receiptId}`);
  });

  it('unlocks synthesis after three unique memories and does not reward repeat clicks', () => {
    let state = createInitialFutureJourney();
    state = openEchoMemory(state, '1990');
    const firstResonance = state.echo.resonance;
    state = openEchoMemory(state, '1990');
    expect(state.echo.resonance).toBe(firstResonance);
    state = openEchoMemory(state, '2010');
    state = openEchoMemory(state, '2030');
    expect(state.echo.synthesisReady).toBe(true);
    state = markEchoFinaleSeen(state);
    expect(state.echo.finaleSeen).toBe(true);
    expect(state.echo.resonance).toBe(100);
  });
});
