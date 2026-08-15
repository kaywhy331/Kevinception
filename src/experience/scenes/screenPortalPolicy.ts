import type { YearId } from '@/content/data';
import type { Quality } from '../types';

export const SCREEN_PORTAL_TARGETS = {
  '1990': '2000',
  '2000': '2010',
  '2010': '2020',
  '2020': '2030'
} as const satisfies Partial<Record<YearId, YearId>>;

export type ScreenPortalSourceYear = keyof typeof SCREEN_PORTAL_TARGETS;

export const SCREEN_PORTAL_BUDGET = {
  width: 384,
  height: 240,
  samples: 2,
  simultaneous: 1
} as const;

export function resolveScreenPortalMode({ quality, active, enabled, focused }: {
  quality: Quality;
  active: boolean;
  enabled: boolean;
  focused: boolean;
}) {
  if (!enabled) return 'off' as const;
  return quality === 'high' && active && !focused ? 'live' as const : 'fallback' as const;
}
