import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('future journey world-state integration', () => {
  it('drives the 2030 room from mission phase, task, autonomy, and receipt state', () => {
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(scene).toContain('state.futureJourney.mission');
    expect(scene).toContain("mission.phase === 'orchestrating'");
    expect(scene).toContain('mission.autonomy + 2');
    expect(scene).toContain('mission.artifact.receiptId');
    expect(scene).toContain("phase === 'decision' && agentId === 'governor'");
  });

  it('drives the 2040 room from resonance, all six memories, and synthesis state', () => {
    const scene = read('src/experience/scenes/Year2040Scene.tsx');
    expect(scene).toContain('state.futureJourney.echo');
    expect(scene).toContain('openMemory(shard.id)');
    expect(scene).toContain('echo.openedMemories.includes(shard.id)');
    expect(scene).toContain('echo.synthesisReady');
    expect(scene).toContain('echo.finaleSeen');
    expect(scene.match(/id: '20[0-4]0'/g)).toHaveLength(5);
    expect(scene).toContain("id: '1990'");
  });

  it('carries the governed receipt through the 2030-to-2040 conduit', () => {
    const architecture = read('src/experience/TimelineArchitecture.tsx');
    expect(architecture).toContain('state.futureJourney.mission.artifact');
    expect(architecture).toContain('receipt.receiptId');
    expect(architecture).toContain("transition?.id === 'agents-to-echo'");
    expect(architecture).toContain("transition?.to === '2030' ? 1 - progress : progress");
  });
});
