'use client';

import { createContext, useContext } from 'react';
import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';

type ExperienceActions = {
  navigateToYear: (year: YearId) => void;
  showTimeline: () => void;
  openInterface: () => void;
  closeInterface: () => void;
  showTextMode: () => void;
  closeTextMode: () => void;
  discover: (id: ArtifactId, year: YearId) => void;
};

const Context = createContext<ExperienceActions | null>(null);

export function ExperienceActionsProvider({ value, children }: { value: ExperienceActions; children: React.ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useExperienceActions() {
  const value = useContext(Context);
  if (!value) throw new Error('useExperienceActions must be used inside ExperienceActionsProvider');
  return value;
}
