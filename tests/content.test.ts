import { describe, expect, it } from 'vitest';
import { capabilityGroups, experienceItems, profile, projects, site, YEARS } from '@/content/data';

 describe('canonical content', () => {
  it('contains the six technology years', () => expect(YEARS).toEqual(['1990','2000','2010','2020','2030','2040']));
  it('contains evidence-safe profile data', () => {
    expect(profile.name).toBe('Kevin Yang');
    expect(profile.contactEmail).toBe('kevinception331@gmail.com');
    expect(site.contactEmail).toBe(profile.contactEmail);
    expect(site.socialImage).toBe('/og-card.png');
    expect(profile.headline.length).toBeGreaterThan(30);
    expect(profile.currentFocus.length).toBeGreaterThan(50);
  });
  it('contains project and experience evidence', () => {
    expect(projects.length).toBeGreaterThanOrEqual(5);
    expect(experienceItems.length).toBeGreaterThanOrEqual(4);
    expect(capabilityGroups.length).toBeGreaterThanOrEqual(6);
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9-]+$/);
      expect(project.outcomes.length).toBeGreaterThan(0);
      expect(project.draft).toBe(false);
    }
  });
});
