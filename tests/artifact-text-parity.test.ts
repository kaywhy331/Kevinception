import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { timelineContent } from '@/content/data';
import { artifacts } from '@/experience/artifacts';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('artifact completion and text fallback parity', () => {
  it('defines five unique, reachable artifact slots', () => {
    expect(artifacts).toHaveLength(5);
    expect(new Set(artifacts.map((artifact) => artifact.discoveryYear)).size).toBe(5);
    expect(artifacts.map((artifact) => artifact.discoveryYear)).toEqual(['1990', '2000', '2010', '2020', '2030']);
    const scene = read('src/experience/scenes/Year2010Scene.tsx');
    expect(scene).toContain("discover('project-blueprint', '2010')");
    expect(scene).toContain('label="Discover Project Blueprint"');
  });

  it('reports unique recovery progress and provides a completion payoff', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('<progress max={artifacts.length} value={foundCount}>');
    expect(overlay).toContain('Continuity restored');
    expect(overlay).not.toContain('/6 forms discovered');
    expect(overlay).toContain('Recover {discoveryArtifact.title}');
  });

  it('renders canonical content for every text-mode era', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    for (const year of ['1990', '2000', '2010', '2020', '2030', '2040']) expect(overlay).toContain(`activeYear === '${year}'`);
    expect(timelineContent['1990'].channels.length).toBeGreaterThan(0);
    expect(timelineContent['2010'].posts.length).toBeGreaterThan(0);
    expect(timelineContent['2020'].clips.length).toBeGreaterThan(0);
    expect(timelineContent['2030'].agents.length).toBeGreaterThan(0);
    expect(timelineContent['2030'].missions.length).toBeGreaterThan(0);
    expect(timelineContent['2040'].prompts.length).toBeGreaterThan(0);
    expect(Object.keys(timelineContent['2040'].responses)).toHaveLength(timelineContent['2040'].prompts.length);
    expect(overlay).toContain('xennialLegacy.intro.lead');
  });
});
