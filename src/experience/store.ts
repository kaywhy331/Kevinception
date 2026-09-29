'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
import {
  createInitialFutureJourney,
  hydrateFutureJourney,
  type FutureJourneyState
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
import type { ArtifactProgress, MotionPreference, MotionSetting, Quality, QualitySetting, RecentDiscovery, TransitionState, ViewMode } from './types';
import type { AdaptivePreferences } from './performanceProfile';

const emptyArtifacts: ArtifactProgress = {
  'signal-fragment': { discoveredYears: [] },
  'identity-handle': { discoveredYears: [] },
  'project-blueprint': { discoveredYears: [] },
  'next-layer-message': { discoveredYears: [] },
  'human-gate': { discoveredYears: [] }
};

type ExperienceStore = {
  activeYear: YearId;
  /** The chapter a returning visitor last opened; drives “Continue in …”. */
  lastVisitedYear: YearId;
  viewMode: ViewMode;
  /** Effective quality (resolved from `qualitySetting` and the adaptive profile). */
  quality: Quality;
  /** Effective motion. Anything other than `full` must be treated as reduced motion. */
  motion: MotionPreference;
  qualitySetting: QualitySetting;
  motionSetting: MotionSetting;
  adaptiveQuality: Quality;
  adaptiveReducedMotion: boolean;
  systemReducedMotion: boolean;
  sound: boolean;
  helpOpen: boolean;
  settingsOpen: boolean;
  artifactsOpen: boolean;
  transition: TransitionState;
  artifacts: ArtifactProgress;
  recentDiscovery: RecentDiscovery;
  /** Eras whose in-app power-on ritual has been completed once; later visits skip it. */
  bootedYears: YearId[];
  futureJourney: FutureJourneyState;
  yearVisits: Record<YearId, number>;
  webglAvailable: boolean | null;
  setActiveYear: (year: YearId) => void;
  setViewMode: (mode: ViewMode) => void;
  setTransition: (transition: TransitionState) => void;
  setQuality: (quality: QualitySetting) => void;
  setMotion: (motion: MotionSetting) => void;
  applyAdaptivePreferences: (preferences: AdaptivePreferences) => void;
  setSystemReducedMotion: (reduced: boolean) => void;
  toggleSound: () => void;
  setHelpOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setArtifactsOpen: (open: boolean) => void;
  setWebglAvailable: (available: boolean) => void;
  discoverArtifact: (id: ArtifactId, year: YearId) => void;
  clearRecentDiscovery: () => void;
  markBooted: (year: YearId) => void;
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
  'activeYear' | 'lastVisitedYear' | 'qualitySetting' | 'motionSetting' | 'sound' | 'artifacts' | 'bootedYears' | 'futureJourney' | 'yearVisits'
>;

type LegacyPersistedState = Partial<PersistedExperienceState> & {
  quality?: Quality;
  motion?: 'full' | 'reduced';
  preferencesConfigured?: boolean;
};

const emptyVisits: Record<YearId, number> = { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 };

export function resolveQuality(setting: QualitySetting, adaptive: Quality): Quality {
  return setting === 'auto' ? adaptive : setting;
}

export function resolveMotion(setting: MotionSetting, adaptiveReduced: boolean, systemReduced: boolean): MotionPreference {
  if (setting !== 'auto') return setting;
  return adaptiveReduced || systemReduced ? 'reduced' : 'full';
}

export const useExperienceStore = create<ExperienceStore>()(
  persist(
    (set) => ({
      activeYear: '1990',
      lastVisitedYear: '1990',
      viewMode: 'timeline',
      quality: 'standard',
      motion: 'full',
      qualitySetting: 'auto',
      motionSetting: 'auto',
      adaptiveQuality: 'standard',
      adaptiveReducedMotion: false,
      systemReducedMotion: false,
      sound: false,
      helpOpen: false,
      settingsOpen: false,
      artifactsOpen: false,
      transition: null,
      artifacts: emptyArtifacts,
      recentDiscovery: null,
      bootedYears: [],
      futureJourney: createInitialFutureJourney(),
      yearVisits: emptyVisits,
      webglAvailable: null,
      setActiveYear: (activeYear) => set({ activeYear }),
      setViewMode: (viewMode) => set({ viewMode: (viewMode as string) === 'transitioning' ? 'transition' : viewMode }),
      setTransition: (transition) => set({ transition }),
      setQuality: (qualitySetting) => set((state) => ({ qualitySetting, quality: resolveQuality(qualitySetting, state.adaptiveQuality) })),
      setMotion: (motionSetting) => set((state) => ({ motionSetting, motion: resolveMotion(motionSetting, state.adaptiveReducedMotion, state.systemReducedMotion) })),
      applyAdaptivePreferences: (preferences) => set((state) => {
        // Adaptive signals only ever lower the profile within a session (a software
        // renderer detected after the viewport check must still win).
        const adaptiveQuality = preferences.quality === 'lite' || state.adaptiveQuality === 'lite' ? 'lite' : preferences.quality ?? state.adaptiveQuality;
        const adaptiveReducedMotion = state.adaptiveReducedMotion || preferences.motion === 'reduced';
        return {
          adaptiveQuality,
          adaptiveReducedMotion,
          quality: resolveQuality(state.qualitySetting, adaptiveQuality),
          motion: resolveMotion(state.motionSetting, adaptiveReducedMotion, state.systemReducedMotion)
        };
      }),
      setSystemReducedMotion: (systemReducedMotion) => set((state) => ({
        systemReducedMotion,
        motion: resolveMotion(state.motionSetting, state.adaptiveReducedMotion, systemReducedMotion)
      })),
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
          },
          recentDiscovery: { id, year, at: Date.now() }
        };
      }),
      clearRecentDiscovery: () => set({ recentDiscovery: null }),
      markBooted: (year) => set((state) => (state.bootedYears.includes(year) ? state : { bootedYears: [...state.bootedYears, year] })),
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
      resetProgress: () => set({ artifacts: emptyArtifacts, recentDiscovery: null, bootedYears: [], futureJourney: createInitialFutureJourney(), yearVisits: emptyVisits, lastVisitedYear: '1990' })
    }),
    {
      name: 'kevinception-v7',
      // v5 retires the Nexus mission / Echo models (hydrateFutureJourney keeps only
      // the 2030/2040 world state) and splits quality and motion into settings.
      version: 5,
      storage: createJSONStorage(() => safeLocalStorage()),
      migrate: (persistedState, version) => {
        const state = persistedState && typeof persistedState === 'object'
          ? persistedState as LegacyPersistedState
          : {};
        // Before v5 a single flag froze both quality and motion after any change.
        // Keep an explicit earlier choice, otherwise return both settings to Auto.
        const explicit = version < 2 ? true : Boolean(state.preferencesConfigured);
        const { quality, motion, preferencesConfigured: _ignored, ...rest } = state;
        return {
          ...rest,
          qualitySetting: rest.qualitySetting ?? (explicit && quality ? quality : 'auto'),
          motionSetting: rest.motionSetting ?? (explicit && motion ? motion : 'auto'),
          bootedYears: Array.isArray(rest.bootedYears) ? rest.bootedYears : [],
          futureJourney: version < 3 || !rest.futureJourney
            ? createInitialFutureJourney()
            : hydrateFutureJourney(rest.futureJourney)
        } as PersistedExperienceState;
      },
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<PersistedExperienceState>) };
        return {
          ...state,
          quality: resolveQuality(state.qualitySetting, state.adaptiveQuality),
          motion: resolveMotion(state.motionSetting, state.adaptiveReducedMotion, state.systemReducedMotion)
        };
      },
      partialize: (state) => ({
        activeYear: state.activeYear,
        lastVisitedYear: state.lastVisitedYear,
        qualitySetting: state.qualitySetting,
        motionSetting: state.motionSetting,
        sound: state.sound,
        artifacts: state.artifacts,
        bootedYears: state.bootedYears,
        futureJourney: state.futureJourney,
        yearVisits: state.yearVisits
      })
    }
  )
);

/** localStorage that degrades to an in-memory shim when storage access throws. */
function safeLocalStorage(): Storage {
  try {
    const storage = window.localStorage;
    const probe = '__kevinception_probe__';
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    const memory = new Map<string, string>();
    return {
      get length() { return memory.size; },
      clear: () => memory.clear(),
      getItem: (key) => memory.get(key) ?? null,
      key: (index) => [...memory.keys()][index] ?? null,
      removeItem: (key) => { memory.delete(key); },
      setItem: (key, value) => { memory.set(key, String(value)); }
    };
  }
}
