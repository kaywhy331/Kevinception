import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('future transition and sound design', () => {
  it('keeps all generated audio behind the explicit sound preference', () => {
    const audio = read('src/experience/audio.ts');
    const future = read('src/experience/future/FutureExperience.tsx');
    expect(audio).toContain("if (!enabled || typeof window === 'undefined') return null");
    expect(audio).toContain('startFutureAtmosphere');
    expect(audio).toContain('stopFutureAtmosphere');
    expect(audio).toContain('voices = [');
    expect(future).toContain("sound && viewMode === 'interface'");
  });

  it('layers authored cues across mission, memory, synthesis, and handoff events', () => {
    const audio = read('src/experience/audio.ts');
    const future = read('src/experience/future/FutureExperience.tsx');
    const shell = read('src/experience/ExperienceShell.tsx');
    for (const cue of ['mission-start', 'task', 'human-gate', 'receipt', 'signal', 'memory', 'synthesis', 'handoff']) {
      expect(audio).toContain(cue);
    }
    expect(future).toContain("playFutureCue('human-gate', sound)");
    expect(future).toContain("playFutureCue('synthesis', sound)");
    expect(shell).toContain("playFutureCue('handoff', sound)");
  });

  it('choreographs the real receipt between labeled 2030 and 2040 nodes', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const styles = read('app/globals.css');
    expect(overlay).toContain('data-receipt');
    expect(overlay).toContain("receipt?.receiptId ?? 'HUMAN GATE'");
    expect(overlay).toContain('future-handoff-node--source');
    expect(overlay).toContain('future-handoff-node--target');
    expect(styles).toContain('@keyframes future-handoff-packet');
    expect(styles).toContain('.transition-agents-to-echo.is-reverse');
  });
});
