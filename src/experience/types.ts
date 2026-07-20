import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
import type { TransitionId } from './config';

export type ViewMode = 'timeline' | 'environment' | 'interface' | 'transition' | 'text';
export type Quality = 'high' | 'standard' | 'lite';
export type MotionPreference = 'full' | 'reduced';

export type TransitionState = {
  from: YearId | null;
  to: YearId;
  id: TransitionId;
  startedAt: number;
} | null;

export type ArtifactProgress = Record<ArtifactId, { discoveredYears: YearId[] }>;
