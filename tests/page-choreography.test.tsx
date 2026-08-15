import fs from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/portfolio',
  useRouter: () => ({ push: navigation.push })
}));

import { CaseStudyChapterNav, CASE_STUDY_CHAPTERS } from '@/components/CaseStudyChapterNav';
import {
  isStandardRoutePath,
  normalizeRoutePath,
  PageChoreography,
  REVEAL_SELECTOR,
  shouldTransitionNavigation
} from '@/components/PageChoreography';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

function navigationCandidate(overrides: Partial<Parameters<typeof shouldTransitionNavigation>[0]> = {}) {
  return {
    currentHref: 'https://kevinception.com/portfolio/',
    destinationHref: 'https://kevinception.com/work/',
    button: 0,
    modified: false,
    target: null,
    download: false,
    optedOut: false,
    ...overrides
  };
}

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.choreography;
  delete document.documentElement.dataset.routeTransition;
  Reflect.deleteProperty(window, 'matchMedia');
  navigation.push.mockReset();
  vi.restoreAllMocks();
});

describe('standard-page choreography', () => {
  it('limits View Transitions to unmodified same-origin standard-route changes', () => {
    expect(normalizeRoutePath('/work/')).toBe('/work');
    expect(normalizeRoutePath('/')).toBe('/');
    expect(isStandardRoutePath('/portfolio/')).toBe(true);
    expect(isStandardRoutePath('/experience/')).toBe(false);
    expect(shouldTransitionNavigation(navigationCandidate())).toBe(true);

    for (const candidate of [
      navigationCandidate({ destinationHref: 'https://example.com/work/' }),
      navigationCandidate({ destinationHref: 'https://kevinception.com/portfolio/#principles' }),
      navigationCandidate({ destinationHref: 'https://kevinception.com/experience/' }),
      navigationCandidate({ currentHref: 'https://kevinception.com/experience/' }),
      navigationCandidate({ destinationHref: 'https://kevinception.com/portfolio/?view=all' }),
      navigationCandidate({ button: 1 }),
      navigationCandidate({ modified: true }),
      navigationCandidate({ target: '_blank' }),
      navigationCandidate({ download: true }),
      navigationCandidate({ optedOut: true })
    ]) expect(shouldTransitionNavigation(candidate)).toBe(false);
  });

  it('reveals content immediately when IntersectionObserver is unavailable', async () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => ({ matches: false })) });
    Reflect.deleteProperty(window, 'IntersectionObserver');
    render(
      <>
        <PageChoreography />
        <div className="site-shell"><main><article className="about-page"><section>Story</section></article></main></div>
      </>
    );
    const section = screen.getByText('Story');
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-choreography', 'ready'));
    expect(section).toHaveAttribute('data-reveal', 'ready');
    expect(section).toHaveAttribute('data-revealed', 'true');
  });

  it('renders usable hash links and tracks explicit chapter selection', () => {
    render(<CaseStudyChapterNav />);
    const navigationRail = screen.getByRole('navigation', { name: 'Case study chapters' });
    expect(navigationRail).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(CASE_STUDY_CHAPTERS.length);
    expect(screen.getByRole('link', { name: 'Problem' })).toHaveAttribute('aria-current', 'location');
    const artifacts = screen.getByRole('link', { name: 'Artifacts' });
    expect(artifacts).toHaveAttribute('href', '#artifacts');
    fireEvent.click(artifacts);
    expect(artifacts).toHaveAttribute('aria-current', 'location');
  });

  it('keeps reveal and route motion progressive and reduced-motion aware', () => {
    const runtime = read('src/components/PageChoreography.tsx');
    const css = read('app/page-choreography.css');
    const caseStudy = read('app/work/[slug]/page.tsx');
    const motion = read('docs/MOTION.md');
    const roadmap = read('docs/ROADMAP.md');

    expect(REVEAL_SELECTOR).toContain('.case-study > section');
    expect(runtime).toContain("document.addEventListener('click', onClick, true)");
    expect(runtime).toContain('startViewTransition');
    expect(runtime).toContain('MutationObserver');
    expect(css).toContain("html[data-choreography='ready']");
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('view-transition-name: page-content');
    expect(motion).toContain('The transition waits for the App Router pathname commit');
    expect(motion).toContain('source content remains visible until the client adds');
    expect(roadmap).toContain('4.2 Page transitions + scroll choreography');
    expect(roadmap).toContain('pathname-settled View Transition');
    for (const chapter of CASE_STUDY_CHAPTERS) {
      expect(caseStudy).toContain(`id="${chapter.id}" data-case-chapter`);
    }
  });
});
