import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveScreenPortalMode,
  SCREEN_PORTAL_BUDGET,
  SCREEN_PORTAL_TARGETS
} from '@/experience/scenes/screenPortalPolicy';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('screens-within-screens portals', () => {
  it('connects four consecutive device screens to the next era', () => {
    expect(SCREEN_PORTAL_TARGETS).toEqual({
      '1990': '2000',
      '2000': '2010',
      '2010': '2020',
      '2020': '2030'
    });

    // Each room's own device shows its own era; a framed wall window carries the
    // next-era preview (and travels there when selected).
    const portal = read('src/experience/scenes/EraScreenPortal.tsx');
    expect(portal).toContain('export function NextEraWindow');
    expect(portal).toContain('<EraScreenPortal fromYear={fromYear}');
    expect(portal).toContain('navigateToYear(targetYear)');
    for (const sourceYear of Object.keys(SCREEN_PORTAL_TARGETS)) {
      const scene = read(`src/experience/scenes/Year${sourceYear}Scene.tsx`);
      expect(scene).toContain("import { NextEraWindow } from './EraScreenPortal'");
      expect(scene).toContain(`<NextEraWindow fromYear="${sourceYear}"`);
      expect(scene).not.toContain('<EraScreenPortal');
    }
  });

  it('reserves live rendering for an active, unfocused High-quality scene', () => {
    expect(resolveScreenPortalMode({ quality: 'high', active: true, enabled: true, focused: false })).toBe('live');
    expect(resolveScreenPortalMode({ quality: 'standard', active: true, enabled: true, focused: false })).toBe('fallback');
    expect(resolveScreenPortalMode({ quality: 'lite', active: true, enabled: true, focused: false })).toBe('fallback');
    expect(resolveScreenPortalMode({ quality: 'high', active: false, enabled: true, focused: false })).toBe('fallback');
    expect(resolveScreenPortalMode({ quality: 'high', active: true, enabled: true, focused: true })).toBe('fallback');
    expect(resolveScreenPortalMode({ quality: 'high', active: true, enabled: false, focused: false })).toBe('off');
  });

  it('keeps the live render target and concurrent work explicitly bounded', () => {
    expect(SCREEN_PORTAL_BUDGET).toEqual({
      width: 384,
      height: 240,
      samples: 2,
      simultaneous: 1
    });
    expect(SCREEN_PORTAL_BUDGET.width * SCREEN_PORTAL_BUDGET.height).toBeLessThanOrEqual(384 * 240);

    const portal = read('src/experience/scenes/EraScreenPortal.tsx');
    expect(portal).toContain('<RenderTexture');
    expect(portal).toContain('<PerspectiveCamera');
    expect(portal).toContain("frames={motion === 'full' ? Infinity : 1}");
    expect(portal).toContain("viewMode === 'interface' || viewMode === 'text'");
    expect(portal).toContain("quality !== 'lite'");
  });
});
