'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
import {
  advanceFutureMission as advanceFutureMissionState,
  beginFutureMission as beginFutureMissionState,
  createInitialFutureJourney,
  hydrateFutureJourney,
  interpretEchoThought as interpretEchoThoughtState,
  markEchoFinaleSeen as markEchoFinaleSeenState,
  openEchoMemory as openEchoMemoryState,
  resolveFutureMission as resolveFutureMissionState,
  selectFutureMission as selectFutureMissionState,
  setFutureAnswer as setFutureAnswerState,
  setFutureAutonomy as setFutureAutonomyState,
  setFutureObjective as setFutureObjectiveState,
  type EchoMemoryId,
  type FutureDecision,
  type FutureJourneyState,
  type FutureMissionId
} from './future/futureJourney';
import {
  advanceConsciousnessBehavior as advanceConsciousnessBehaviorState,
  resolveCompanionConsent as resolveCompanionConsentState,
  resolveEncounterRetention as resolveEncounterRetentionState,
  selectCoexistenceMoment as selectCoexistenceMomentState,
  selectConsciousnessCue as selectConsciousnessCueState,
  setCoexistenceProvenance as setCoexistenceProvenanceState,
  setConsciousnessSourceTrace as setConsciousnessSourceTraceState,
  type CoexistenceMomentId,
  type CompanionConsent,
  type ConsciousnessCueId,
  type EncounterRetention
} from './future/futureWorld';
import type { ArtifactProgress, MotionPreference, Quality, TransitionState, ViewMode } from './types';

const emptyArtifacts: ArtifactProgress = {
  'signal-fragment': { discoveredYears: [] },
  'identity-handle': { discoveredYears: [] },
  'project-blueprint': { discoveredYears: [] },
  'next-layer-message': { discoveredYears: [] },
  'human-gate': { discoveredYears: [] }
};

type ExperienceStore = {
  activeYear: YearId;
  lastVisitedYear: YearId;
  viewMode: ViewMode;
  quality: Quality;
  motion: MotionPreference;
  sound: boolean;
  helpOpen: boolean;
  settingsOpen: boolean;
  artifactsOpen: boolean;
  transition: TransitionState;
  artifacts: ArtifactProgress;
  futureJourney: FutureJourneyState;
  yearVisits: Record<YearId, number>;
  webglAvailable: boolean | null;
  preferencesConfigured: boolean;
  setActiveYear: (year: YearId) => void;
  setViewMode: (mode: ViewMode) => void;
  setTransition: (transition: TransitionState) => void;
  setQuality: (quality: Quality) => void;
  setMotion: (motion: MotionPreference) => void;
  applyAdaptivePreferences: (preferences: Partial<Pick<ExperienceStore, 'quality' | 'motion'>>) => void;
  toggleSound: () => void;
  setHelpOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setArtifactsOpen: (open: boolean) => void;
  setWebglAvailable: (available: boolean) => void;
  discoverArtifact: (id: ArtifactId, year: YearId) => void;
  chooseFutureMission: (missionId: FutureMissionId) => void;
  setFutureObjective: (objective: string) => void;
  setFutureAnswer: (questionId: string, answer: string) => void;
  setFutureAutonomy: (autonomy: number) => void;
  beginFutureMission: () => void;
  advanceFutureMission: () => void;
  resolveFutureMission: (decision: FutureDecision) => void;
  interpretEchoThought: (thought: string) => void;
  openEchoMemory: (memoryId: EchoMemoryId) => void;
  markEchoFinaleSeen: () => void;
  selectCoexistenceMoment: (momentId: CoexistenceMomentId) => void;
  resolveCompanionConsent: (decision: Exclude<CompanionConsent, 'unasked'>) => void;
  setCoexistenceProvenance: (open: boolean) => void;
  selectConsciousnessCue: (cueId: ConsciousnessCueId) => void;
  advanceConsciousnessBehavior: () => void;
  setConsciousnessSourceTrace: (open: boolean) => void;
  resolveEncounterRetention: (decision: Exclude<EncounterRetention, 'unasked'>) => void;
  resetFutureJourney: () => void;
  recordVisit: (year: YearId) => void;
  resetProgress: () => void;
};

type PersistedExperienceState = Pick<ExperienceStore,
  'activeYear' | 'lastVisitedYear' | 'quality' | 'motion' | 'sound' | 'artifacts' | 'futureJourney' | 'yearVisits' | 'preferencesConfigured'
>;

export const useExperienceStore = create<ExperienceStore>()(
  persist(
    (set) => ({
      activeYear: '1990',
      lastVisitedYear: '1990',
      viewMode: 'timeline',
      quality: 'standard',
      motion: 'full',
      sound: false,
      helpOpen: false,
      settingsOpen: false,
      artifactsOpen: false,
      transition: null,
      artifacts: emptyArtifacts,
      futureJourney: createInitialFutureJourney(),
      yearVisits: { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 },
      webglAvailable: null,
      preferencesConfigured: false,
      setActiveYear: (activeYear) => set({ activeYear, lastVisitedYear: activeYear }),
      setViewMode: (viewMode) => set({ viewMode: (viewMode as string) === 'transitioning' ? 'transition' : viewMode }),
      setTransition: (transition) => set({ transition }),
      setQuality: (quality) => set({ quality, preferencesConfigured: true }),
      setMotion: (motion) => set({ motion, preferencesConfigured: true }),
      applyAdaptivePreferences: (preferences) => set((state) => {
        if (state.preferencesConfigured || (!preferences.quality && !preferences.motion)) return state;
        return { ...state, ...preferences };
      }),
      toggleSound: () => set((state) => ({ sound: !state.sound })),
      setHelpOpen: (helpOpen) => set({ helpOpen }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      setArtifactsOpen: (artifactsOpen) => set({ artifactsOpen }),
      setWebglAvailable: (webglAvailable) => set({ webglAvailable }),
      discoverArtifact: (id, year) => set((state) => {
        const years = state.artifacts[id].discoveredYears;
        if (years.includes(year)) return state;
        return {
          artifacts: {
            ...state.artifacts,
            [id]: { discoveredYears: [...years, year] }
          }
        };
      }),
      chooseFutureMission: (missionId) => set((state) => ({ futureJourney: selectFutureMissionState(state.futureJourney, missionId) })),
      setFutureObjective: (objective) => set((state) => ({ futureJourney: setFutureObjectiveState(state.futureJourney, objective) })),
      setFutureAnswer: (questionId, answer) => set((state) => ({ futureJourney: setFutureAnswerState(state.futureJourney, questionId, answer) })),
      setFutureAutonomy: (autonomy) => set((state) => ({ futureJourney: setFutureAutonomyState(state.futureJourney, autonomy) })),
      beginFutureMission: () => set((state) => ({ futureJourney: beginFutureMissionState(state.futureJourney) })),
      advanceFutureMission: () => set((state) => ({ futureJourney: advanceFutureMissionState(state.futureJourney) })),
      resolveFutureMission: (decision) => set((state) => ({ futureJourney: resolveFutureMissionState(state.futureJourney, decision) })),
      interpretEchoThought: (thought) => set((state) => ({ futureJourney: interpretEchoThoughtState(state.futureJourney, thought) })),
      openEchoMemory: (memoryId) => set((state) => ({ futureJourney: openEchoMemoryState(state.futureJourney, memoryId) })),
      markEchoFinaleSeen: () => set((state) => ({ futureJourney: markEchoFinaleSeenState(state.futureJourney) })),
      selectCoexistenceMoment: (momentId) => set((state) => ({
        futureJourney: { ...state.futureJourney, coexistence: selectCoexistenceMomentState(state.futureJourney.coexistence, momentId) }
      })),
      resolveCompanionConsent: (decision) => set((state) => ({
        futureJourney: { ...state.futureJourney, coexistence: resolveCompanionConsentState(state.futureJourney.coexistence, decision) }
      })),
      setCoexistenceProvenance: (open) => set((state) => ({
        futureJourney: { ...state.futureJourney, coexistence: setCoexistenceProvenanceState(state.futureJourney.coexistence, open) }
      })),
      selectConsciousnessCue: (cueId) => set((state) => ({
        futureJourney: { ...state.futureJourney, consciousness: selectConsciousnessCueState(state.futureJourney.consciousness, cueId) }
      })),
      advanceConsciousnessBehavior: () => set((state) => ({
        futureJourney: { ...state.futureJourney, consciousness: advanceConsciousnessBehaviorState(state.futureJourney.consciousness) }
      })),
      setConsciousnessSourceTrace: (open) => set((state) => ({
        futureJourney: { ...state.futureJourney, consciousness: setConsciousnessSourceTraceState(state.futureJourney.consciousness, open) }
      })),
      resolveEncounterRetention: (decision) => set((state) => ({
        futureJourney: { ...state.futureJourney, consciousness: resolveEncounterRetentionState(state.futureJourney.consciousness, decision) }
      })),
      resetFutureJourney: () => set({ futureJourney: createInitialFutureJourney() }),
      recordVisit: (year) => set((state) => ({
        yearVisits: { ...state.yearVisits, [year]: state.yearVisits[year] + 1 },
        lastVisitedYear: year
      })),
      resetProgress: () => set({ artifacts: emptyArtifacts, futureJourney: createInitialFutureJourney(), yearVisits: { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 }, lastVisitedYear: '1990' })
    }),
    {
      name: 'kevinception-v7',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        const state = persistedState && typeof persistedState === 'object'
          ? persistedState as Partial<PersistedExperienceState>
          : {};
        return {
          ...state,
          preferencesConfigured: version < 2 ? true : Boolean(state.preferencesConfigured),
          futureJourney: version < 3 || !state.futureJourney
            ? createInitialFutureJourney()
            : hydrateFutureJourney(state.futureJourney)
        } as PersistedExperienceState;
      },
      partialize: (state) => ({
        activeYear: state.activeYear,
        lastVisitedYear: state.lastVisitedYear,
        quality: state.quality,
        motion: state.motion,
        sound: state.sound,
        artifacts: state.artifacts,
        futureJourney: state.futureJourney,
        yearVisits: state.yearVisits,
        preferencesConfigured: state.preferencesConfigured
      })
    }
  )
);
