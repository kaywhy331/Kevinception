import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterNarrative, CHAPTER_ORDER, kevinOriginNarrative, narrativeSite } from '@/content/narrative';
import { eraConfigs } from '@/experience/config';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const expectedChapters = ['Curiosity', 'Connection', 'Commerce', 'Creation', 'Co-Existence', 'Consciousness'];
const expectedExperiences = ['KevinVision', 'Kevin Online', 'StealStreet Commerce OS', 'KevTok', 'Morning, Together', 'Morning, After'];

describe('V7.6 narrative architecture', () => {
  it('defines one ordered conceptual chapter and one in-world experience per year', () => {
    expect(CHAPTER_ORDER).toEqual(['1990', '2000', '2010', '2020', '2030', '2040']);
    expect(CHAPTER_ORDER.map((year) => chapterNarrative[year].chapterName)).toEqual(expectedChapters);
    expect(CHAPTER_ORDER.map((year) => chapterNarrative[year].experienceName)).toEqual(expectedExperiences);
    for (const year of CHAPTER_ORDER) {
      expect(chapterNarrative[year].chapterThesis.length).toBeGreaterThan(80);
      expect(chapterNarrative[year].capabilityLinks.length).toBeGreaterThanOrEqual(4);
      expect(eraConfigs[year].title).toBe(eraConfigs[year].experienceName);
      expect(eraConfigs[year].product).toBe(eraConfigs[year].medium);
    }
  });

  it('separates the game-led 1990 origin from the internet-led 2000 origin', () => {
    expect(kevinOriginNarrative.origin).toContain('television, cartridge games, and interactive worlds');
    expect(kevinOriginNarrative.continuation).toContain('By 2000');
    expect(kevinOriginNarrative.continuation).toContain('AOL');
  });

  it('keeps the landing page focused while preserving direct and immersive paths', () => {
    const home = read('app/page.tsx');
    const portal = read('src/components/EraPortalCanvas.tsx');
    const globals = read('app/globals.css');
    expect(home).toContain('One life.');
    expect(home).toContain('Six eras of technology.');
    expect(home).toContain('<EraPortalCanvas />');
    expect(home).not.toContain('directRoutes');
    expect(home).not.toContain('landing-page__summary');
    expect((home.match(/<Link\b/g) ?? [])).toHaveLength(0);
    expect((portal.match(/<Link\b/g) ?? [])).toHaveLength(1);
    expect(portal).toContain('Enter {entry.experienceName}');
    expect(portal).toContain('useState<YearId>(YEAR_ORDER[0])');
    expect(globals).toMatch(/\.landing-page \{[^}]*height: 100svh;[^}]*overflow: hidden;/);
    expect(globals).toContain('@media (max-width: 900px) and (orientation: landscape)');
    expect(home).not.toContain('SiteChrome');
  });

  it('uses the conceptual chapters on the about, timeline, interface, and transition surfaces', () => {
    const about = read('app/about/page.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(about).toContain('kevinOriginNarrative');
    expect(overlay).toContain('Chapter {config.chapterNumber}');
    expect(overlay).toContain('Experienced through');
    expect(overlay).toContain('What Kevin carried forward');
    expect(overlay).toContain('Continue to {eraConfigs[next].chapterName}');
    expect(overlay).toContain('from.chapterName} → ${to.chapterName}');
  });

  it('updates site positioning from six technologies to six digital eras', () => {
    expect(narrativeSite.title).toContain('Six Digital Eras');
    expect(narrativeSite.description).toContain('Curiosity, Connection, Commerce, Creation, Co-Existence, and Consciousness');
    const layout = read('app/layout.tsx');
    expect(layout).toContain('narrativeSite.title');
    expect(layout).toContain('narrativeSite.description');
  });
});
