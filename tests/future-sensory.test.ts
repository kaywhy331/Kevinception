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

  it('layers semantic cues across presence, consent, agency, uncertainty, and handoff', () => {
    const audio = read('src/experience/audio.ts');
    const future = read('src/experience/future/FutureExperience.tsx');
    const shell = read('src/experience/ExperienceShell.tsx');
    for (const cue of ['presence', 'consent', 'refusal', 'notice', 'agency', 'conjecture', 'handoff']) {
      expect(audio).toContain(cue);
    }
    expect(future).toContain("playFutureCue('presence', sound)");
    expect(future).toContain("'consent' : 'refusal'");
    expect(future).toContain("'conjecture' : 'agency'");
    expect(shell).toContain("playFutureCue('handoff', sound)");
  });

  it('choreographs the selected mug and its consent between 2030 and 2040', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const styles = read('app/globals.css');
    expect(overlay).toContain('data-memory');
    expect(overlay).toContain("coexistence.consent[coexistence.activeMoment]");
    expect(overlay).toContain('KEPT WITH PERMISSION');
    expect(overlay).toContain('future-handoff-mug');
    expect(overlay).toContain('future-handoff-node--source');
    expect(overlay).toContain('future-handoff-node--target');
    expect(styles).toContain('@keyframes future-handoff-packet');
    expect(styles).toContain('.transition-agents-to-echo.is-reverse');
  });
});
