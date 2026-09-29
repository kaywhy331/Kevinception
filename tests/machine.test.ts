import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { experienceMachine } from '@/experience/machine';

describe('experience state machine', () => {
  it('moves between the overview, a room, its interface, and transitions', () => {
    const actor = createActor(experienceMachine).start();
    expect(actor.getSnapshot().value).toBe('timeline');
    actor.send({ type: 'SHOW_ENVIRONMENT' });
    expect(actor.getSnapshot().value).toBe('environment');
    actor.send({ type: 'SYNC_VIEW', destination: 'interface' });
    expect(actor.getSnapshot().value).toBe('interface');
    actor.send({ type: 'EXIT_INTERFACE' });
    expect(actor.getSnapshot().value).toBe('environment');
    actor.send({ type: 'START_TRANSITION' });
    expect(actor.getSnapshot().value).toBe('transitioning');
    actor.send({ type: 'END_TRANSITION', destination: 'timeline' });
    expect(actor.getSnapshot().value).toBe('timeline');
  });

  it('keeps the text version reachable from every settled view and back', () => {
    const actor = createActor(experienceMachine).start();
    actor.send({ type: 'SHOW_TEXT' });
    expect(actor.getSnapshot().value).toBe('text');
    actor.send({ type: 'START_TRANSITION' });
    actor.send({ type: 'SYNC_VIEW', destination: 'text' });
    expect(actor.getSnapshot().value).toBe('text');
    actor.send({ type: 'EXIT_TEXT', destination: 'environment' });
    expect(actor.getSnapshot().value).toBe('environment');
  });
});
