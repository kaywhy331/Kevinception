import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { isLowPowerDevice, isLowTierGpuName, isSoftwareRendererName, resolveAdaptivePreferences } from '@/experience/performanceProfile';
import { resolveMotion, resolveQuality, useExperienceStore } from '@/experience/store';
import { getTransitionDuration, isReducedMotion } from '@/experience/config';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('adaptive performance preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    useExperienceStore.setState({
      quality: 'standard', motion: 'full', qualitySetting: 'auto', motionSetting: 'auto',
      adaptiveQuality: 'standard', adaptiveReducedMotion: false, systemReducedMotion: false
    });
  });

  it('decides the tier by device capability, not by screen width', () => {
    expect(resolveAdaptivePreferences({ deviceMemory: 8, hardwareConcurrency: 8 })).toEqual({});
    expect(isLowPowerDevice({ deviceMemory: 2 })).toBe(true);
    expect(isLowPowerDevice({ deviceMemory: 4, hardwareConcurrency: 6 })).toBe(false);
    expect(isLowPowerDevice({ saveData: true })).toBe(true);
    expect(isLowTierGpuName('Mali-G52 MC2')).toBe(true);
    expect(isLowTierGpuName('Apple GPU')).toBe(false);
    expect(isLowTierGpuName('Adreno (TM) 740')).toBe(false);
    // Only 2D surfaces that pass a width opt into the old narrow-screen heuristic.
    expect(isLowPowerDevice({ viewportWidth: 390 })).toBe(true);
    expect(isSoftwareRendererName('ANGLE (Google, Vulkan, SwiftShader Device (Subzero))')).toBe(true);
    expect(isSoftwareRendererName('llvmpipe (LLVM 18.1.8, 256 bits)')).toBe(true);
    expect(isSoftwareRendererName('ANGLE (NVIDIA GeForce RTX 4080)')).toBe(false);
  });

  it('uses Lite and reduced motion for software rendering', () => {
    expect(resolveAdaptivePreferences({ rendererName: 'ANGLE (SwiftShader Device)' })).toEqual({ quality: 'lite', motion: 'reduced' });
  });

  it('keeps Auto quality and Auto motion independent of each other', () => {
    const store = useExperienceStore.getState();
    store.applyAdaptivePreferences({ quality: 'lite', motion: 'reduced' });
    expect(useExperienceStore.getState()).toMatchObject({ quality: 'lite', motion: 'reduced' });

    // Choosing a quality no longer freezes motion: the OS preference still applies.
    useExperienceStore.getState().setQuality('high');
    useExperienceStore.getState().setSystemReducedMotion(true);
    expect(useExperienceStore.getState()).toMatchObject({ quality: 'high', qualitySetting: 'high', motion: 'reduced' });

    useExperienceStore.getState().setQuality('auto');
    expect(useExperienceStore.getState().quality).toBe('lite');
  });

  it('follows live OS reduced-motion changes until the visitor picks a motion level', () => {
    useExperienceStore.getState().setSystemReducedMotion(true);
    expect(useExperienceStore.getState().motion).toBe('reduced');
    useExperienceStore.getState().setSystemReducedMotion(false);
    expect(useExperienceStore.getState().motion).toBe('full');
    useExperienceStore.getState().setMotion('minimal');
    useExperienceStore.getState().setSystemReducedMotion(false);
    expect(useExperienceStore.getState().motion).toBe('minimal');
    expect(resolveMotion('auto', false, true)).toBe('reduced');
    expect(resolveQuality('auto', 'lite')).toBe('lite');
  });

  it('treats every motion level other than full as reduced, and minimal as instant', () => {
    expect(isReducedMotion('full')).toBe(false);
    expect(isReducedMotion('reduced')).toBe(true);
    expect(isReducedMotion('minimal')).toBe(true);
    expect(getTransitionDuration('static-modem', 'full')).toBeGreaterThanOrEqual(800);
    expect(getTransitionDuration('static-modem', 'full')).toBeLessThanOrEqual(1200);
    expect(getTransitionDuration('agents-to-echo', 'full')).toBeLessThanOrEqual(1200);
    expect(getTransitionDuration('static-modem', 'reduced')).toBeLessThan(300);
    expect(getTransitionDuration('time-jump', 'minimal')).toBe(0);
  });

  it('migrates the old single preferences flag into separate settings', async () => {
    const options = useExperienceStore.persist.getOptions();
    const migrated = await options.migrate?.({ quality: 'lite', motion: 'reduced', preferencesConfigured: false }, 4) as Record<string, unknown>;
    expect(migrated).toMatchObject({ qualitySetting: 'auto', motionSetting: 'auto', bootedYears: [] });
    const explicit = await options.migrate?.({ quality: 'high', motion: 'full', preferencesConfigured: true }, 4) as Record<string, unknown>;
    expect(explicit).toMatchObject({ qualitySetting: 'high', motionSetting: 'full' });
  });

  it('keeps expensive portal work bounded and prefetches the experience only on intent', () => {
    const portal = read('src/components/EraPortalCanvas.tsx');
    expect(portal).toContain('PORTAL_FRAME_INTERVAL = 1000 / 20');
    expect(portal).toContain('const ratioCap = lowPower ? 1 : 1.5');
    expect(portal).toContain('ANIMATED_ERAS.has(activeIndexRef.current)');
    expect(portal).toContain("document.addEventListener('visibilitychange'");
    expect(portal).toContain('prefetch={false}');
    expect(portal).toContain('router.prefetch(experienceHref)');
    // The canvas pipeline is built once per motion preference, not once per chapter change.
    expect(portal).toContain('}, [reducedMotion]);');
    expect(portal).not.toContain('}, [activeIndex, reducedMotion]);');
    expect(portal).toContain('chapterHref(activeYear)');
  });

  it('prewarms future scenes and keeps constrained rendering responsive', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const loaders = read('src/experience/sceneLoaders.ts');
    expect(loaders).toContain("export const FUTURE_YEARS = ['2030', '2040']");
    expect(world).toContain('targets = new Set<YearId>(FUTURE_YEARS)');
    expect(world).toContain("proxyOnly = quality === 'lite' && futureYear");
    expect(world).toContain('renderDetailedScene');
    expect(overlay).toContain('preloadExperienceScene(year)');
    expect(overlay).toContain('loading="eager"');
  });

  it('loads postprocessing only when High quality renders it, and pauses rather than remounts it', () => {
    const canvas = read('src/experience/ExperienceCanvas.tsx');
    const effects = read('src/experience/HighQualityEffects.tsx');
    expect(canvas).toContain("lazy(() => import('./HighQualityEffects'))");
    expect(canvas).not.toContain("from '@react-three/postprocessing'");
    expect(canvas).toContain("<HighQualityEffects enabled={viewMode !== 'interface' && viewMode !== 'text'} />");
    expect(effects).toContain("from '@react-three/postprocessing'");
    expect(effects).toContain('enabled={enabled}');
  });
});
