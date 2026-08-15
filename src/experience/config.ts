import type { YearId } from '@/content/data';
import { CHAPTER_ORDER, chapterNarrative, type ChapterNarrative } from '@/content/narrative';

export type TransitionId = 'static-modem' | 'profile-flatten' | 'portrait-rotate' | 'signals-to-agents' | 'agents-to-echo' | 'timeline-fade' | 'time-jump';

export type EraTexture = 'scanlines' | 'pixel-grid' | 'data-grid' | 'neon-strata' | 'warm-fiber' | 'refracted-rain';

export type EraDesignLanguage = {
  name: string;
  texture: EraTexture;
  chrome: string;
  typeTreatment: string;
  motionCharacter: string;
  secondary: string;
  surface: string;
  raisedSurface: string;
  ink: string;
  muted: string;
  line: string;
  radius: string;
  easing: string;
};

export type EraConfig = ChapterNarrative & {
  id: YearId;
  /** Backward-compatible alias for the in-world experience name. */
  title: string;
  /** Backward-compatible alias for the era medium. */
  product: string;
  accent: string;
  designLanguage: EraDesignLanguage;
  stationX: number;
  legacyPath: string;
  transitionToNext?: TransitionId;
};

export const YEAR_ORDER: YearId[] = CHAPTER_ORDER;

const technicalConfig: Record<YearId, Pick<EraConfig, 'accent' | 'designLanguage' | 'stationX' | 'legacyPath' | 'transitionToNext'>> = {
  '1990': {
    accent: '#ffd75a',
    designLanguage: {
      name: 'Broadcast phosphor', texture: 'scanlines', chrome: 'Hard CRT bezel', typeTreatment: 'Monospaced broadcast labels', motionCharacter: 'Signal lock and phosphor settle',
      secondary: '#87ff9b', surface: '#11120b', raisedSurface: '#242416', ink: '#fff7cc', muted: '#c8bf88', line: '#716d3f', radius: '2px', easing: 'steps(4, end)'
    },
    stationX: -30, legacyPath: '/legacy/experience/1990/index.html?embed=1', transitionToNext: 'static-modem'
  },
  '2000': {
    accent: '#6bbcff',
    designLanguage: {
      name: 'Portal desktop', texture: 'pixel-grid', chrome: 'Beige bevel and blue desktop', typeTreatment: 'Compact desktop utility', motionCharacter: 'Window snap and cursor trail',
      secondary: '#d9c79d', surface: '#0b1730', raisedSurface: '#242f45', ink: '#f6f1df', muted: '#b9c4d7', line: '#7a8cab', radius: '8px', easing: 'cubic-bezier(.2,.8,.2,1)'
    },
    stationX: -18, legacyPath: '/legacy/experience/2000/index.html?embed=1', transitionToNext: 'profile-flatten'
  },
  '2010': {
    accent: '#b9862f',
    designLanguage: {
      name: 'Operational flatland', texture: 'data-grid', chrome: 'Flat dashboard rail', typeTreatment: 'Dense operational sans', motionCharacter: 'Queued rows and status pulses',
      secondary: '#5b92bd', surface: '#151a20', raisedSurface: '#202b35', ink: '#f5f7f8', muted: '#abb8c2', line: '#4f6271', radius: '4px', easing: 'cubic-bezier(.4,0,.2,1)'
    },
    stationX: -6, legacyPath: '/legacy/experience/2010/index.html?embed=1&module=dashboard&release=20260813', transitionToNext: 'portrait-rotate'
  },
  '2020': {
    accent: '#ff5c8a',
    designLanguage: {
      name: 'Vertical signal', texture: 'neon-strata', chrome: 'Black mobile glass', typeTreatment: 'Compressed kinetic display', motionCharacter: 'Portrait cuts and elastic stacks',
      secondary: '#5ee8ff', surface: '#100a15', raisedSurface: '#211229', ink: '#fff4fb', muted: '#c3a9be', line: '#6f3055', radius: '18px', easing: 'cubic-bezier(.16,1,.3,1)'
    },
    stationX: 6, legacyPath: '/legacy/experience/2020/index.html?embed=1', transitionToNext: 'signals-to-agents'
  },
  '2030': {
    accent: '#d69b50',
    designLanguage: {
      name: 'Ambient domestic', texture: 'warm-fiber', chrome: 'Permissioned objects', typeTreatment: 'Quiet humanist labels', motionCharacter: 'Breath and deliberate handoff',
      secondary: '#84b8a1', surface: '#21170f', raisedSurface: '#332419', ink: '#fff4df', muted: '#cdbda8', line: '#75593c', radius: '24px', easing: 'cubic-bezier(.33,1,.68,1)'
    },
    stationX: 18, legacyPath: '/legacy/experience/2030/index.html?embed=1', transitionToNext: 'agents-to-echo'
  },
  '2040': {
    accent: '#ff9e2f',
    designLanguage: {
      name: 'Holographic afterimage', texture: 'refracted-rain', chrome: 'Black glass and sodium trace', typeTreatment: 'Archival signal caps', motionCharacter: 'Echo, refraction, and held frames',
      secondary: '#ff4f2e', surface: '#050403', raisedSurface: '#130d08', ink: '#fff0d4', muted: '#c9a98a', line: '#813f20', radius: '10px', easing: 'cubic-bezier(.65,0,.35,1)'
    },
    stationX: 30, legacyPath: '/legacy/experience/2040/index.html?embed=1'
  }
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

export function getEraCssVariables(year: YearId) {
  const config = eraConfigs[year];
  const design = config.designLanguage;
  return {
    '--era-accent': config.accent,
    '--era-secondary': design.secondary,
    '--era-surface': design.surface,
    '--era-surface-raised': design.raisedSurface,
    '--era-ink': design.ink,
    '--era-muted': design.muted,
    '--era-line': design.line,
    '--era-radius': design.radius,
    '--era-ease': design.easing
  } as const;
}

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
