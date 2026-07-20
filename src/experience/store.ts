'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
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
  yearVisits: Record<YearId, number>;
  webglAvailable: boolean | null;
  setActiveYear: (year: YearId) => void;
  setViewMode: (mode: ViewMode) => void;
  setTransition: (transition: TransitionState) => void;
  setQuality: (quality: Quality) => void;
  setMotion: (motion: MotionPreference) => void;
  toggleSound: () => void;
  setHelpOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setArtifactsOpen: (open: boolean) => void;
  setWebglAvailable: (available: boolean) => void;
  discoverArtifact: (id: ArtifactId, year: YearId) => void;
  recordVisit: (year: YearId) => void;
  resetProgress: () => void;
};

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
      yearVisits: { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 },
      webglAvailable: null,
      setActiveYear: (activeYear) => set({ activeYear, lastVisitedYear: activeYear }),
      setViewMode: (viewMode) => set({ viewMode }),
      setTransition: (transition) => set({ transition }),
      setQuality: (quality) => set({ quality }),
      setMotion: (motion) => set({ motion }),
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
      recordVisit: (year) => set((state) => ({
        yearVisits: { ...state.yearVisits, [year]: state.yearVisits[year] + 1 },
        lastVisitedYear: year
      })),
      resetProgress: () => set({ artifacts: emptyArtifacts, yearVisits: { '1990': 0, '2000': 0, '2010': 0, '2020': 0, '2030': 0, '2040': 0 }, lastVisitedYear: '1990' })
    }),
    {
      name: 'kevinception-v7',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeYear: state.activeYear,
        lastVisitedYear: state.lastVisitedYear,
        quality: state.quality,
        motion: state.motion,
        sound: state.sound,
        artifacts: state.artifacts,
        yearVisits: state.yearVisits
      })
    }
  )
);
