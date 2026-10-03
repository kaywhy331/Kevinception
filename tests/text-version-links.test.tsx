import { cleanup, render, screen } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects } from '@/content/data';
import { YEAR_ORDER } from '@/experience/config';
import { ExperienceActionsProvider } from '@/experience/ExperienceContext';
import { ExperienceOverlay } from '@/experience/ExperienceOverlay';
import { createInitialFutureJourney } from '@/experience/future/futureJourney';
import { useExperienceStore } from '@/experience/store';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) }));

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const actions = {
  navigateToYear: vi.fn(), enterYear: vi.fn(), showTimeline: vi.fn(), closeInterface: vi.fn(),
  showTextMode: vi.fn(), closeTextMode: vi.fn(), discover: vi.fn()
};

beforeEach(() => {
  window.history.replaceState(null, '', '/experience/1990/?view=text');
  useExperienceStore.setState({
    activeYear: '1990', lastVisitedYear: '1990', viewMode: 'text', transition: null,
    settingsOpen: false, helpOpen: false, artifactsOpen: false, webglAvailable: true,
    futureJourney: createInitialFutureJourney()
  });
});

afterEach(cleanup);

describe('text version case-study links', () => {
  it.each(YEAR_ORDER)('%s names each case-study link after its project and keeps the visible label in the name', (year) => {
    useExperienceStore.setState({ activeYear: year });
    render(<ExperienceActionsProvider value={actions}><ExperienceOverlay /></ExperienceActionsProvider>);
    const section = screen.getByRole('heading', { name: /Kevin’s work in this layer/ }).nextElementSibling as HTMLElement;
    const links = [...section.querySelectorAll('a')];
    expect(links).toHaveLength(3);
    const names = links.map((link) => link.getAttribute('aria-label') ?? link.textContent ?? '');
    // Three identical "Open case study" links give screen-reader link lists no purpose (WCAG 2.4.4).
    expect(new Set(names).size).toBe(3);
    projects.slice(0, 3).forEach((project, index) => {
      expect(names[index]).toContain(project.title);
      // The accessible name must contain the visible text so voice control still works (WCAG 2.5.3).
      expect(names[index]).toContain(links[index].textContent ?? '');
    });
  });

  it('gives the case-study links a pointer target of at least 44px, matching the rest of the journey', () => {
    const css = read('app/globals.css');
    const rule = css.match(/\.text-mode__grid a\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/min-height:\s*44px/);
    expect(rule).toMatch(/display:\s*inline-flex/);
  });
});
