import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { eraConfigs, getEraCssVariables, YEAR_ORDER } from '@/experience/config';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('six era design languages', () => {
  it('defines a complete and distinct typed vocabulary for every era', () => {
    const languages = YEAR_ORDER.map((year) => eraConfigs[year].designLanguage);

    expect(new Set(languages.map((language) => language.name)).size).toBe(YEAR_ORDER.length);
    expect(new Set(languages.map((language) => language.texture)).size).toBe(YEAR_ORDER.length);
    expect(new Set(languages.map((language) => language.radius)).size).toBe(YEAR_ORDER.length);

    for (const year of YEAR_ORDER) {
      const config = eraConfigs[year];
      const language = config.designLanguage;
      expect(language.chrome).not.toHaveLength(0);
      expect(language.typeTreatment).not.toHaveLength(0);
      expect(language.motionCharacter).not.toHaveLength(0);
      expect(getEraCssVariables(year)).toEqual({
        '--era-accent': config.accent,
        '--era-secondary': language.secondary,
        '--era-surface': language.surface,
        '--era-surface-raised': language.raisedSurface,
        '--era-ink': language.ink,
        '--era-muted': language.muted,
        '--era-line': language.line,
        '--era-radius': language.radius,
        '--era-ease': language.easing
      });
    }
  });

  it('binds the vocabulary to immersive and standard-page era references', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const about = read('app/about/page.tsx');
    const css = read('app/era-design-languages.css');

    expect(overlay).toContain('data-era={activeYear}');
    expect(overlay).toContain('data-era-texture={config.designLanguage.texture}');
    expect(overlay).toContain('getEraCssVariables(activeYear)');
    expect(about).toContain('className="era-echo"');
    expect(about).toContain('getEraCssVariables(year)');

    for (const year of YEAR_ORDER) {
      expect(css).toContain(`[data-era='${year}']`);
    }
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('documents the system and its browser-review boundary', () => {
    const documentation = read('docs/ERA_DESIGN_LANGUAGES.md');
    for (const year of YEAR_ORDER) {
      expect(documentation).toContain(year);
      expect(documentation).toContain(eraConfigs[year].designLanguage.name);
    }
    expect(documentation).toContain('Final six-up screenshots');
    expect(documentation).toContain('are not inferred from source code');
  });
});
