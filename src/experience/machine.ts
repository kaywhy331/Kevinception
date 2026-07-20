import { setup } from 'xstate';

export const experienceMachine = setup({
  types: {
    events: {} as
      | { type: 'SHOW_TIMELINE' }
      | { type: 'SHOW_ENVIRONMENT' }
      | { type: 'ENTER_INTERFACE' }
      | { type: 'EXIT_INTERFACE' }
      | { type: 'START_TRANSITION' }
      | { type: 'END_TRANSITION'; destination: 'timeline' | 'environment' }
      | { type: 'SHOW_TEXT' }
      | { type: 'EXIT_TEXT'; destination: 'timeline' | 'environment' }
  }
}).createMachine({
  id: 'kevinception-experience',
  initial: 'timeline',
  states: {
    timeline: {
      on: {
        SHOW_ENVIRONMENT: 'environment',
        START_TRANSITION: 'transitioning',
        SHOW_TEXT: 'text'
      }
    },
    environment: {
      on: {
        SHOW_TIMELINE: 'timeline',
        ENTER_INTERFACE: 'interface',
        START_TRANSITION: 'transitioning',
        SHOW_TEXT: 'text'
      }
    },
    interface: {
      on: {
        EXIT_INTERFACE: 'environment',
        SHOW_TIMELINE: 'timeline',
        START_TRANSITION: 'transitioning',
        SHOW_TEXT: 'text'
      }
    },
    text: {
      on: {
        EXIT_TEXT: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { target: 'environment' }
        ],
        START_TRANSITION: 'transitioning'
      }
    },
    transitioning: {
      on: {
        END_TRANSITION: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { target: 'environment' }
        ]
      }
    }
  }
});
