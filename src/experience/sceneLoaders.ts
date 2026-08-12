import type { ComponentType } from 'react';
import type { YearId } from '@/content/data';

export type ExperienceSceneProps = { active: boolean; timeline: boolean; detail?: boolean };
type ExperienceSceneModule = { default: ComponentType<ExperienceSceneProps> };

export const FUTURE_YEARS = ['2030', '2040'] as const satisfies readonly YearId[];

export const sceneLoaders: Record<YearId, () => Promise<ExperienceSceneModule>> = {
  '1990': () => import('./scenes/Year1990Scene').then((module) => ({ default: module.Year1990Scene as ComponentType<ExperienceSceneProps> })),
  '2000': () => import('./scenes/Year2000Scene').then((module) => ({ default: module.Year2000Scene as ComponentType<ExperienceSceneProps> })),
  '2010': () => import('./scenes/Year2010Scene').then((module) => ({ default: module.Year2010Scene as ComponentType<ExperienceSceneProps> })),
  '2020': () => import('./scenes/Year2020Scene').then((module) => ({ default: module.Year2020Scene as ComponentType<ExperienceSceneProps> })),
  '2030': () => import('./scenes/Year2030Scene').then((module) => ({ default: module.Year2030Scene as ComponentType<ExperienceSceneProps> })),
  '2040': () => import('./scenes/Year2040Scene').then((module) => ({ default: module.Year2040Scene as ComponentType<ExperienceSceneProps> }))
};

export function preloadExperienceScene(year: YearId) {
  return sceneLoaders[year]();
}
