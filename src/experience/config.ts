import type { YearId } from '@/content/data';
import { CHAPTER_ORDER, chapterNarrative, type ChapterNarrative } from '@/content/narrative';

export type TransitionId = 'static-modem' | 'profile-flatten' | 'portrait-rotate' | 'signals-to-agents' | 'agents-to-echo' | 'timeline-fade' | 'time-jump';

export type EraConfig = ChapterNarrative & {
  id: YearId;
  /** Backward-compatible alias for the in-world experience name. */
  title: string;
  /** Backward-compatible alias for the era medium. */
  product: string;
  accent: string;
  stationX: number;
  legacyPath: string;
  transitionToNext?: TransitionId;
};

export const YEAR_ORDER: YearId[] = CHAPTER_ORDER;

const technicalConfig: Record<YearId, Pick<EraConfig, 'accent' | 'stationX' | 'legacyPath' | 'transitionToNext'>> = {
  '1990': { accent: '#ffd75a', stationX: -30, legacyPath: '/legacy/experience/1990/index.html?embed=1', transitionToNext: 'static-modem' },
  '2000': { accent: '#6bbcff', stationX: -18, legacyPath: '/legacy/experience/2000/index.html?embed=1', transitionToNext: 'profile-flatten' },
  '2010': { accent: '#b9862f', stationX: -6, legacyPath: '/legacy/experience/2010/index.html?embed=1&module=dashboard&release=20260813', transitionToNext: 'portrait-rotate' },
  '2020': { accent: '#ff5c8a', stationX: 6, legacyPath: '/legacy/experience/2020/index.html?embed=1', transitionToNext: 'signals-to-agents' },
  '2030': { accent: '#64e8ff', stationX: 18, legacyPath: '/legacy/experience/2030/index.html?embed=1', transitionToNext: 'agents-to-echo' },
  '2040': { accent: '#a88cff', stationX: 30, legacyPath: '/legacy/experience/2040/index.html?embed=1' }
};

export const eraConfigs = Object.fromEntries(
  YEAR_ORDER.map((year) => {
    const narrative = chapterNarrative[year];
    return [year, {
      id: year,
      ...narrative,
      ...technicalConfig[year],
      title: narrative.experienceName,
      product: narrative.medium
    } satisfies EraConfig];
  })
) as Record<YearId, EraConfig>;

export function getYearFromPath(pathname: string): YearId | null {
  const match = pathname.match(/\/experience\/(1990|2000|2010|2020|2030|2040)(?:\/|$)/);
  return (match?.[1] as YearId | undefined) ?? null;
}

export function getAdjacentYear(year: YearId, direction: -1 | 1): YearId | null {
  const index = YEAR_ORDER.indexOf(year);
  const next = YEAR_ORDER[index + direction];
  return next ?? null;
}

export function yearDistance(from: YearId | null, to: YearId) {
  if (!from) return 0;
  return Math.abs(YEAR_ORDER.indexOf(to) - YEAR_ORDER.indexOf(from));
}

export function transitionBetween(from: YearId | null, to: YearId): TransitionId {
  if (!from) return 'timeline-fade';
  const fromIndex = YEAR_ORDER.indexOf(from);
  const toIndex = YEAR_ORDER.indexOf(to);
  if (Math.abs(toIndex - fromIndex) > 1) return 'time-jump';
  if (toIndex === fromIndex + 1) return eraConfigs[from].transitionToNext ?? 'timeline-fade';
  if (toIndex === fromIndex - 1) return eraConfigs[to].transitionToNext ?? 'timeline-fade';
  return 'timeline-fade';
}
