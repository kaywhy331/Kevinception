import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import { experienceMachine } from '@/experience/machine';

 describe('experience state machine', () => {
  it('moves between timeline, environment, interface, and transitions', () => {
    const actor = createActor(experienceMachine).start();
    expect(actor.getSnapshot().value).toBe('timeline');
    actor.send({ type: 'SHOW_ENVIRONMENT' });
    expect(actor.getSnapshot().value).toBe('environment');
    actor.send({ type: 'ENTER_INTERFACE' });
    expect(actor.getSnapshot().value).toBe('interface');
    actor.send({ type: 'EXIT_INTERFACE' });
    expect(actor.getSnapshot().value).toBe('environment');
    actor.send({ type: 'START_TRANSITION' });
    expect(actor.getSnapshot().value).toBe('transitioning');
    actor.send({ type: 'END_TRANSITION', destination: 'timeline' });
    expect(actor.getSnapshot().value).toBe('timeline');
  });
});
