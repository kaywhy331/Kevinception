import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('future journey world-state integration', () => {
  it('drives the 2030 apartment from the active moment and its consent state', () => {
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(scene).toContain('state.futureJourney.coexistence');
    expect(scene).toContain('coexistence.activeMoment === id');
    expect(scene).toContain('coexistence.consent[id]');
    expect(scene).toContain('<ConsentMark');
    expect(scene).toContain('<AgentDecisionRail');
    expect(scene).toContain('Wren decision rail');
    expect(scene).toContain('Wren in the room');
    expect(scene).not.toContain('mission.artifact');
  });

  it('drives the 2040 room from consciousness phase, source trace, and permissioned memory', () => {
    const scene = read('src/experience/scenes/Year2040Scene.tsx');
    expect(scene).toContain('state.futureJourney.consciousness');
    expect(scene).toContain('state.futureJourney.coexistence');
    expect(scene).toContain('<HologramKevin');
    expect(scene).toContain('consciousness.behaviorPhase');
    expect(scene).toContain('consciousness.sourceTraceOpen');
    expect(scene).toContain('getPermissionedMemoryState');
    expect(scene).not.toContain('shardLayout');
  });

  it('carries the selected moment and its real consent through the 2030-to-2040 conduit', () => {
    const architecture = read('src/experience/TimelineArchitecture.tsx');
    expect(architecture).toContain('state.futureJourney.coexistence');
    expect(architecture).toContain('coexistence.consent[coexistence.activeMoment]');
    expect(architecture).toContain('coexistence.keptMoments.includes');
    expect(architecture).toContain('memory crossing from coexistence to consciousness');
    expect(architecture).toContain("transition?.id === 'agents-to-echo'");
    expect(architecture).toContain("transition?.to === '2030' ? 1 - progress : progress");
  });
});
