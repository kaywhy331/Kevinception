import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { isLowPowerDevice, isSoftwareRendererName, resolveAdaptivePreferences } from '@/experience/performanceProfile';
import { useExperienceStore } from '@/experience/store';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('adaptive performance preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    useExperienceStore.setState({ quality: 'standard', motion: 'full', preferencesConfigured: false });
  });

  it('recognizes constrained devices and common software renderers', () => {
    expect(isLowPowerDevice({ viewportWidth: 390 })).toBe(true);
    expect(isLowPowerDevice({ viewportWidth: 1440, deviceMemory: 4 })).toBe(true);
    expect(isSoftwareRendererName('ANGLE (Google, Vulkan, SwiftShader Device (Subzero))')).toBe(true);
    expect(isSoftwareRendererName('llvmpipe (LLVM 18.1.8, 256 bits)')).toBe(true);
    expect(isSoftwareRendererName('ANGLE (NVIDIA GeForce RTX 4080)')).toBe(false);
  });

  it('uses Lite and reduced motion for software rendering', () => {
    expect(resolveAdaptivePreferences({ rendererName: 'ANGLE (SwiftShader Device)' })).toEqual({
      quality: 'lite',
      motion: 'reduced'
    });
  });

  it('applies adaptive defaults until a visitor makes an explicit choice', () => {
    useExperienceStore.getState().applyAdaptivePreferences({ quality: 'lite', motion: 'reduced' });
    expect(useExperienceStore.getState()).toMatchObject({
      quality: 'lite',
      motion: 'reduced',
      preferencesConfigured: false
    });

    useExperienceStore.getState().setQuality('high');
    useExperienceStore.getState().applyAdaptivePreferences({ quality: 'lite' });
    expect(useExperienceStore.getState()).toMatchObject({ quality: 'high', preferencesConfigured: true });
  });

  it('keeps expensive portal work bounded and prefetches the experience only on intent', () => {
    const portal = read('src/components/EraPortalCanvas.tsx');
    expect(portal).toContain('PORTAL_FRAME_INTERVAL = 1000 / 20');
    expect(portal).toContain('const ratioCap = lowPower ? 1 : 1.5');
    expect(portal).toContain('ANIMATED_ERAS.has(activeIndex)');
    expect(portal).toContain("document.addEventListener('visibilitychange'");
    expect(portal).toContain('prefetch={false}');
    expect(portal).toContain('router.prefetch(experienceHref)');
  });

  it('loads postprocessing only when High quality actually renders it', () => {
    const canvas = read('src/experience/ExperienceCanvas.tsx');
    const effects = read('src/experience/HighQualityEffects.tsx');
    expect(canvas).toContain("lazy(() => import('./HighQualityEffects'))");
    expect(canvas).not.toContain("from '@react-three/postprocessing'");
    expect(effects).toContain("from '@react-three/postprocessing'");
  });
});
