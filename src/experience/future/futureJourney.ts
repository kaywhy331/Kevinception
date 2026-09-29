import {
  createInitialCoexistenceState,
  createInitialConsciousnessState,
  type CoexistenceState,
  type ConsciousnessState
} from './futureWorld';

/** The closing panel after the last question in 2040: the six eras, tied together. */
export const ECHO_FINALE_TITLE = 'The interfaces changed. The pattern did not.';
export const ECHO_FINALE_SUMMARY = 'Curiosity became connection. Connection became systems. Systems became creation, collaboration, and a record that can continue helping without pretending to replace the person who lived it.';

export type FutureJourneyState = {
  coexistence: CoexistenceState;
  consciousness: ConsciousnessState;
};

export function createInitialFutureJourney(): FutureJourneyState {
  return {
    coexistence: createInitialCoexistenceState(),
    consciousness: createInitialConsciousnessState()
  };
}

/**
 * Rebuilds a persisted journey. Only the 2030/2040 world state survives: keys
 * from the retired Nexus mission and Echo models are dropped, never carried.
 */
export function hydrateFutureJourney(state?: Partial<FutureJourneyState> | null): FutureJourneyState {
  const initial = createInitialFutureJourney();
  if (!state) return initial;

  return {
    coexistence: {
      ...initial.coexistence,
      ...state.coexistence,
      consent: { ...initial.coexistence.consent, ...state.coexistence?.consent },
      keptMoments: Array.isArray(state.coexistence?.keptMoments) ? state.coexistence.keptMoments : initial.coexistence.keptMoments,
      refusedMoments: Array.isArray(state.coexistence?.refusedMoments) ? state.coexistence.refusedMoments : initial.coexistence.refusedMoments
    },
    consciousness: {
      ...initial.consciousness,
      ...state.consciousness,
      visitedCues: Array.isArray(state.consciousness?.visitedCues) ? state.consciousness.visitedCues : initial.consciousness.visitedCues
    }
  };
}
