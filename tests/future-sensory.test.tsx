import fs from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/experience/audio', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/experience/audio')>();
  return {
    ...actual,
    playFutureCue: vi.fn(),
    playInterfaceTone: vi.fn(),
    startFutureAtmosphere: vi.fn(() => () => undefined)
  };
});

import * as audio from '@/experience/audio';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { FutureExperience } from '@/experience/future/FutureExperience';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';
import { useExperienceStore } from '@/experience/store';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
const noop = () => undefined;
const experienceActions = {
  navigateToYear: noop, enterYear: noop, showTimeline: noop, openInterface: noop, closeInterface: noop,
  showTextMode: noop, closeTextMode: noop, discover: noop
};

beforeEach(() => {
  vi.mocked(audio.playFutureCue).mockClear();
  vi.mocked(audio.startFutureAtmosphere).mockClear();
  useExperienceStore.setState({ futureJourney: createInitialFutureJourney(), sound: false, viewMode: 'interface', motion: 'full' });
});
afterEach(cleanup);

describe('future transition and sound design', () => {
  it('never creates audio while the explicit sound preference is off', async () => {
    const actual = await vi.importActual<typeof import('@/experience/audio')>('@/experience/audio');
    const AudioContextSpy = vi.fn();
    vi.stubGlobal('AudioContext', AudioContextSpy);
    actual.playFutureCue('presence', false);
    expect(actual.startFutureAtmosphere('2030', false)()).toBeUndefined();
    expect(AudioContextSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('starts the future atmosphere only with sound on inside the interface', () => {
    const { rerender } = render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2030" /></ExperienceActionsProvider>);
    expect(audio.startFutureAtmosphere).toHaveBeenLastCalledWith('2030', false);
    useExperienceStore.setState({ sound: true });
    rerender(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2030" /></ExperienceActionsProvider>);
    expect(audio.startFutureAtmosphere).toHaveBeenLastCalledWith('2030', true);
  });

  it('layers semantic cues across presence, consent, refusal, notice, agency, and uncertainty', () => {
    render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2030" /></ExperienceActionsProvider>);
    fireEvent.click(screen.getByRole('button', { name: /^(Continue|Speak)/ }));
    expect(audio.playFutureCue).toHaveBeenCalledWith('signal', false);
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the question' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep it with me' }));
    expect(audio.playFutureCue).toHaveBeenCalledWith('consent', false);
    fireEvent.click(screen.getByRole('button', { name: /Next moment/ }));
    expect(audio.playFutureCue).toHaveBeenCalledWith('presence', false);
    fireEvent.click(screen.getByRole('button', { name: 'Skip to the question' }));
    fireEvent.click(screen.getByRole('button', { name: 'Let it end here' }));
    expect(audio.playFutureCue).toHaveBeenCalledWith('refusal', false);
    cleanup();

    render(<ExperienceActionsProvider value={experienceActions}><FutureExperience year="2040" /></ExperienceActionsProvider>);
    fireEvent.click(screen.getByRole('button', { name: /conjecture.*An unfinished sentence/ }));
    expect(audio.playFutureCue).toHaveBeenCalledWith('notice', false);
    for (let step = 0; step < 3; step += 1) fireEvent.click(screen.getByRole('button', { name: /^Let Kevin/ }));
    expect(audio.playFutureCue).toHaveBeenCalledWith('conjecture', false);
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
    expect(read('src/experience/ExperienceShell.tsx')).toContain("playFutureCue('handoff', state.sound)");
  });
});
