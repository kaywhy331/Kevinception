import { setup } from 'xstate';

type Destination = 'timeline' | 'environment' | 'interface' | 'text';

export const experienceMachine = setup({
  types: {
    events: {} as
      | { type: 'SHOW_TIMELINE' }
      | { type: 'SHOW_ENVIRONMENT' }
      | { type: 'ENTER_INTERFACE' }
      | { type: 'EXIT_INTERFACE' }
      | { type: 'START_TRANSITION' }
      | { type: 'END_TRANSITION'; destination: Exclude<Destination, 'text'> }
      | { type: 'SHOW_TEXT' }
      | { type: 'EXIT_TEXT'; destination: 'timeline' | 'environment' }
      | { type: 'SYNC_VIEW'; destination: Destination }
  }
}).createMachine({
  id: 'kevinception-experience',
  initial: 'timeline',
  states: {
    timeline: {
      on: {
        SHOW_ENVIRONMENT: 'environment',
        ENTER_INTERFACE: 'interface',
        START_TRANSITION: 'transitioning',
        SHOW_TEXT: 'text',
        SYNC_VIEW: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { guard: ({ event }) => event.destination === 'interface', target: 'interface' },
          { guard: ({ event }) => event.destination === 'text', target: 'text' },
          { target: 'environment' }
        ]
      }
    },
    environment: {
      on: {
        SHOW_TIMELINE: 'timeline',
        ENTER_INTERFACE: 'interface',
        START_TRANSITION: 'transitioning',
        SHOW_TEXT: 'text',
        SYNC_VIEW: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { guard: ({ event }) => event.destination === 'interface', target: 'interface' },
          { guard: ({ event }) => event.destination === 'text', target: 'text' },
          { target: 'environment' }
        ]
      }
    },
    interface: {
      on: {
        EXIT_INTERFACE: 'environment',
        SHOW_TIMELINE: 'timeline',
        START_TRANSITION: 'transitioning',
        SHOW_TEXT: 'text',
        SYNC_VIEW: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { guard: ({ event }) => event.destination === 'interface', target: 'interface' },
          { guard: ({ event }) => event.destination === 'text', target: 'text' },
          { target: 'environment' }
        ]
      }
    },
    text: {
      on: {
        EXIT_TEXT: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { target: 'environment' }
        ],
        START_TRANSITION: 'transitioning',
        SYNC_VIEW: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { guard: ({ event }) => event.destination === 'interface', target: 'interface' },
          { guard: ({ event }) => event.destination === 'text', target: 'text' },
          { target: 'environment' }
        ]
      }
    },
    transitioning: {
      on: {
        END_TRANSITION: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { guard: ({ event }) => event.destination === 'interface', target: 'interface' },
          { target: 'environment' }
        ],
        SYNC_VIEW: [
          { guard: ({ event }) => event.destination === 'timeline', target: 'timeline' },
          { guard: ({ event }) => event.destination === 'interface', target: 'interface' },
          { guard: ({ event }) => event.destination === 'text', target: 'text' },
          { target: 'environment' }
        ]
      }
    }
  }
});
