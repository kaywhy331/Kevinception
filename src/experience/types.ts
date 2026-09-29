import type { YearId } from '@/content/data';
import type { ArtifactId } from './artifacts';
import type { TransitionId } from './config';

export type ViewMode = 'timeline' | 'environment' | 'interface' | 'transition' | 'text';
export type Quality = 'high' | 'standard' | 'lite';
/** Visitor-facing quality choice. `auto` follows the adaptive device profile. */
export type QualitySetting = 'auto' | Quality;
/**
 * Effective motion level. Consumers must treat anything other than `full` as reduced
 * motion; `minimal` additionally removes authored transitions and ambient loops.
 */
export type MotionPreference = 'full' | 'reduced' | 'minimal';
/** Visitor-facing motion choice. `auto` follows the operating-system preference. */
export type MotionSetting = 'auto' | MotionPreference;

export type TransitionState = {
  from: YearId | null;
  to: YearId;
  id: TransitionId;
  startedAt: number;
  /** Total authored duration in milliseconds, shared by the overlay, camera, and completion timer. */
  duration: number;
} | null;

export type ArtifactProgress = Record<ArtifactId, { discoveredYears: YearId[] }>;
export type RecentDiscovery = { id: ArtifactId; year: YearId; at: number } | null;
