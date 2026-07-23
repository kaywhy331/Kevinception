import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterNarrative, CHAPTER_ORDER, kevinOriginNarrative, narrativeSite } from '@/content/narrative';
import { eraConfigs } from '@/experience/config';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const expectedChapters = ['Curiosity', 'Connection', 'Presence', 'Creation', 'Delegation', 'Continuity'];
const expectedExperiences = ['KevinVision', 'Kevin Online', 'KevinBook', 'KevTok', 'Kevin Nexus', 'Kevin Echo'];

describe('V8 narrative architecture', () => {
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

  it('uses the conceptual chapters on the landing, about, timeline, interface, and transition surfaces', () => {
    const home = read('app/page.tsx');
    const about = read('app/about/page.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(home).toContain('chapter.chapterName');
    expect(home).toContain('/experience/${chapter.id}/');
    expect(about).toContain('kevinOriginNarrative');
    expect(overlay).toContain('Chapter {config.chapterNumber}');
    expect(overlay).toContain('Experienced through');
    expect(overlay).toContain('What Kevin carried forward');
    expect(overlay).toContain('Continue to {eraConfigs[next].chapterName}');
    expect(overlay).toContain('from.chapterName} → ${to.chapterName}');
  });

  it('uses one canonical evolving-mind positioning', () => {
    expect(narrativeSite.title).toContain('One Evolving Mind');
    expect(narrativeSite.description).toContain('Curiosity, Connection, Presence, Creation, Delegation, and Continuity');
    const layout = read('app/layout.tsx');
    expect(layout).toContain('narrativeSite.title');
    expect(layout).toContain('narrativeSite.description');
  });
});
