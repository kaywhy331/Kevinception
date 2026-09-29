import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { projects } from '@/content/data';
import { orderedCaseStudies } from '@/content/editorial';
import { filterProjects, filterProjectsByFocus, WORK_FOCUS_AREAS } from '@/lib/workArchive';

const replace = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, prefetch: vi.fn() }),
  usePathname: () => '/work/',
  useSearchParams: () => new URLSearchParams(search)
}));

const { WorkArchive } = await import('@/components/WorkArchive');

afterEach(() => {
  cleanup();
  replace.mockClear();
  search = '';
});

describe('case-study archive', () => {
  it('keeps the text filter helper exact', () => {
    expect(filterProjects(projects, 'local-first product direction', '')).toEqual(expect.arrayContaining([expect.objectContaining({ slug: 'tokenpak' })]));
    expect(filterProjects(projects, 'no project can match this phrase', '')).toEqual([]);
  });

  it('offers a few curated focus chips, each of which narrows but never empties the archive', () => {
    expect(WORK_FOCUS_AREAS.length).toBeGreaterThanOrEqual(3);
    expect(WORK_FOCUS_AREAS.length).toBeLessThanOrEqual(5);
    for (const area of WORK_FOCUS_AREAS) {
      const matches = filterProjectsByFocus(projects, area.id);
      expect(matches.length, area.id).toBeGreaterThan(0);
      expect(matches.length, area.id).toBeLessThan(projects.length);
    }
  });

  it('leads with external and operational work and lists every project once', () => {
    expect(orderedCaseStudies[0].slug).toBe('tokenpak');
    expect(orderedCaseStudies.slice(-2).map((project) => project.slug)).toEqual(['kevinception', 'kevin-online']);
    expect(new Set(orderedCaseStudies.map((project) => project.slug)).size).toBe(projects.length);
  });

  it('filters with pressed-state chips and writes a shareable focus parameter', () => {
    render(createElement(WorkArchive, { projects: orderedCaseStudies }));
    expect(screen.getByRole('heading', { level: 2, name: 'Browse by focus' })).toBeInTheDocument();
    const group = screen.getByRole('group', { name: 'Filter case studies by focus' });
    const ai = within(group).getByRole('button', { name: /AI & agents/ });
    expect(within(group).getByRole('button', { name: /^All/ })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(ai);
    expect(ai).toHaveAttribute('aria-pressed', 'true');
    expect(replace).toHaveBeenLastCalledWith('/work/?focus=ai', { scroll: false });
    const expected = filterProjectsByFocus(orderedCaseStudies, 'ai').length;
    expect(screen.getByRole('status')).toHaveTextContent(`${expected} case ${expected === 1 ? 'study' : 'studies'}`);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(expected);
  });

  it('restores the chip from a shared URL', () => {
    search = 'focus=experience';
    render(createElement(WorkArchive, { projects: orderedCaseStudies }));
    expect(screen.getByRole('button', { name: /Experience & frontend/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
