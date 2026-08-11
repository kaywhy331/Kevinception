import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { projects } from '@/content/data';
import { filterProjects } from '@/lib/workArchive';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('shareable case-study archive', () => {
  it('searches canonical project text and applies an exact discipline filter', () => {
    expect(filterProjects(projects, 'local-first product direction', '')).toEqual(expect.arrayContaining([expect.objectContaining({ slug: 'tokenpak' })]));
    const accessibility = filterProjects(projects, '', 'Accessibility');
    expect(accessibility.length).toBeGreaterThan(0);
    expect(accessibility.every((project) => (project.disciplines as readonly string[]).includes('Accessibility'))).toBe(true);
    expect(filterProjects(projects, 'no project can match this phrase', '')).toEqual([]);
  });

  it('persists both controls in shareable URL parameters', () => {
    const archive = read('src/components/WorkArchive.tsx');
    const page = read('app/work/page.tsx');
    expect(archive).toContain("params.set('q'");
    expect(archive).toContain("params.set('discipline'");
    expect(archive).toContain('router.replace');
    expect(archive).toContain('aria-live="polite"');
    expect(page).toContain('<Suspense');
  });
});
