import fs from 'node:fs';
import path from 'node:path';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { experienceItems, projects, resumeProjectSlugs } from '@/content/data';
import { resumeProjects } from '@/content/editorial';
import { ariaCurrentFor, chapterHref, primaryNavigation } from '@/components/navigation';
import { YEAR_ORDER } from '@/experience/config';

let pathname = '/';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), prefetch: vi.fn(), push: vi.fn() }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(),
  notFound: () => { throw new Error('notFound'); }
}));

const { default: HomePage } = await import('../app/page');
const { default: ResumePage, metadata: resumeMetadata } = await import('../app/resume/page');
const { default: AboutPage } = await import('../app/about/page');
const { default: ProjectPage } = await import('../app/work/[slug]/page');
const { default: sitemap, SITEMAP_PATHS } = await import('../app/sitemap');
const { EraPortalCanvas } = await import('@/components/EraPortalCanvas');
const { SiteHeader, SiteFooter } = await import('@/components/SiteChrome');
const { analyticsHostAllowed } = await import('@/components/Analytics');

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
// next/link drops the trailing slash outside a build with `trailingSlash: true`; compare normalized paths.
const hrefOf = (element: HTMLElement) => (element.getAttribute('href') ?? '').replace(/^([^?#]*?)\/?(?=[?#]|$)/, '$1/');

function installMatchMedia(reducedMotion = false) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  });
}

beforeEach(() => installMatchMedia());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  pathname = '/';
});

describe('homepage recruiter path', () => {
  it('pairs one primary journey CTA with a quiet resume, case studies, and contact row', () => {
    render(<HomePage />);
    expect(hrefOf(screen.getByRole('link', { name: /Start the journey/ }))).toBe('/experience/');
    const direct = screen.getByRole('navigation', { name: 'Skip the journey' });
    expect(within(direct).getAllByRole('link').map((link) => [link.textContent, hrefOf(link)])).toEqual([
      ['Resume', '/resume/'], ['Case studies', '/work/'], ['Contact', '/contact/']
    ]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('One life.Six eras of technology.');
  });
});

describe('homepage chapter preview', () => {
  it('keeps the portal CTA on the chapter it is showing, uses the canonical path, and rests after one pass', () => {
    vi.useFakeTimers();
    render(<EraPortalCanvas />);
    const cta = () => screen.getByRole('link', { name: /^Enter / });
    expect(hrefOf(cta())).toBe('/experience/1990/');
    expect(cta()).toHaveTextContent('Enter 1990 · Curiosity');

    act(() => { vi.advanceTimersByTime(2800 * 2); });
    expect(hrefOf(cta())).toBe('/experience/2010/');
    expect(screen.getByRole('button', { name: 'Preview 2010: Commerce' })).toHaveAttribute('aria-pressed', 'true');

    act(() => { vi.advanceTimersByTime(2800 * 4); });
    expect(hrefOf(cta())).toBe('/experience/1990/');
    act(() => { vi.advanceTimersByTime(2800 * 3); });
    expect(hrefOf(cta())).toBe('/experience/1990/');
    expect(screen.getByRole('button', { name: 'Play chapter preview' })).toBeInTheDocument();
  });

  it('pauses on request, on hover, and when a chapter is chosen', () => {
    vi.useFakeTimers();
    render(<EraPortalCanvas />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause chapter preview' }));
    act(() => { vi.advanceTimersByTime(2800 * 3); });
    expect(hrefOf(screen.getByRole('link', { name: /^Enter / }))).toBe('/experience/1990/');

    fireEvent.click(screen.getByRole('button', { name: 'Play chapter preview' }));
    fireEvent.pointerEnter(screen.getByRole('region', { name: 'Preview of the six chapters' }));
    act(() => { vi.advanceTimersByTime(2800 * 3); });
    expect(hrefOf(screen.getByRole('link', { name: /^Enter / }))).toBe('/experience/1990/');

    fireEvent.click(screen.getByRole('button', { name: 'Preview 2030: Co-Existence' }));
    expect(hrefOf(screen.getByRole('link', { name: /^Enter / }))).toBe('/experience/2030/');
    expect(screen.getByRole('button', { name: 'Play chapter preview' })).toBeInTheDocument();
  });

  it('does not rotate or offer a pause control under reduced motion', () => {
    installMatchMedia(true);
    vi.useFakeTimers();
    render(<EraPortalCanvas />);
    act(() => { vi.advanceTimersByTime(2800 * 3); });
    expect(hrefOf(screen.getByRole('link', { name: /^Enter / }))).toBe('/experience/1990/');
    expect(screen.queryByRole('button', { name: /chapter preview/ })).toBeNull();
  });
});

describe('site navigation', () => {
  it('uses one label set and marks the current page', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual(['Journey', 'Case studies', 'Resume', 'About', 'Contact']);
    pathname = '/work/tokenpak/';
    render(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(nav).getByRole('link', { name: 'Case studies' })).toHaveAttribute('aria-current', 'true');
    expect(within(nav).getByRole('link', { name: 'Resume' })).not.toHaveAttribute('aria-current');
    expect(ariaCurrentFor('/resume', '/resume/')).toBe('page');
    expect(ariaCurrentFor(null, '/resume/')).toBeUndefined();
  });

  it('gives the footer every standard route and no internal implementation notes', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('navigation', { name: 'Footer navigation' });
    for (const item of primaryNavigation) expect(hrefOf(within(footer).getByRole('link', { name: item.label }))).toBe(item.href);
    expect(screen.getByRole('contentinfo')).not.toHaveTextContent('plain-text route');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('One life. Six eras of technology.');
  });

  it('links every chapter with the canonical /experience/<year>/ path', () => {
    render(<AboutPage />);
    const hrefs = screen.getAllByRole('link').map(hrefOf);
    for (const year of YEAR_ORDER) expect(hrefs).toContain(`/experience/${year}/`);
    expect(hrefs.some((href) => href.includes('?year='))).toBe(false);
    for (const file of ['app/about/page.tsx', 'src/components/EraPortalCanvas.tsx', 'app/not-found.tsx', 'app/page.tsx']) {
      expect(read(file), file).not.toContain('?year=');
    }
  });
});

describe('resume', () => {
  it('lists the StealStreet co-founder role, keeps a period on every entry, and speaks in first person', () => {
    const stealStreet = experienceItems.find((item) => item.organization.includes('StealStreet'));
    expect(stealStreet).toMatchObject({ title: 'Co-Founder, CIO', organization: 'One Stop Deals / StealStreet' });
    for (const item of experienceItems) {
      expect(item.period.length, item.title).toBeGreaterThan(0);
      for (const line of [item.summary, ...item.highlights]) expect(line, line).not.toMatch(/\bKevin(’s|'s)?\b(?! Online)/);
    }
  });

  it('chooses projects explicitly and leads with external work', () => {
    expect(resumeProjects.map((project) => project.slug)).toEqual([...resumeProjectSlugs]);
    expect(resumeProjects[0].slug).toBe('tokenpak');
    render(<ResumePage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(headings).toEqual(['Experience', 'Selected projects', 'Capabilities', 'Best at']);
    expect(screen.getByRole('heading', { level: 3, name: 'Co-Founder, CIO' })).toBeInTheDocument();
    expect(resumeMetadata.title).toEqual({ absolute: 'Kevin Yang — Resume' });
    expect(resumeMetadata.alternates?.canonical).toBe('/resume/');
  });

  it('prints as a readable black-on-white sheet', () => {
    const css = read('app/globals.css');
    const print = css.slice(css.indexOf('@media print {'));
    expect(print).toContain('.resume-header h1 { margin: 0 0 4pt; font-size: 24pt;');
    expect(print).toMatch(/a, address \{ color: black !important; \}/);
    expect(print).toContain('.tag-row span { padding: 0 4pt; border-color: #999; color: #222 !important;');
    expect(print).toContain('break-inside: avoid');
  });
});

describe('case studies', () => {
  it('gives every chapter a heading and calls outcomes “What shipped”', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'tokenpak' }) }));
    const h2s = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(h2s).toHaveLength(8);
    expect(screen.getByText('What shipped', { selector: 'p.eyebrow' })).toBeInTheDocument();
    expect(screen.queryByText('Outcomes and evidence')).toBeNull();
    expect(screen.getByRole('link', { name: /What shipped/ })).toHaveAttribute('href', '#outcomes');
  });
});

describe('sitemap', () => {
  it('is generated from routes, chapters, and projects with canonical era paths', () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const year of YEAR_ORDER) expect(urls).toContain(`https://kevinception.com${chapterHref(year)}`);
    for (const project of projects) expect(urls).toContain(`https://kevinception.com/work/${project.slug}/`);
    expect(urls).not.toContain('https://kevinception.com/portfolio/');
    expect(new Set(SITEMAP_PATHS).size).toBe(SITEMAP_PATHS.length);
    expect(fs.existsSync(path.join(process.cwd(), 'public/sitemap.xml'))).toBe(false);
    expect(read('app/sitemap.ts')).toContain("export const dynamic = 'force-static'");
  });
});

describe('analytics environments', () => {
  it('reports only from the registered production host', () => {
    expect(analyticsHostAllowed('kevinception.com')).toBe(true);
    expect(analyticsHostAllowed('www.kevinception.com')).toBe(true);
    expect(analyticsHostAllowed('deploy-preview-12--kevinception.netlify.app')).toBe(false);
    expect(analyticsHostAllowed('localhost')).toBe(false);
    expect(analyticsHostAllowed('staging.kevinception.com', 'staging.kevinception.com')).toBe(true);
  });

  it('leaves pageviews to the Plausible script so navigations are counted once', () => {
    expect(read('src/components/Analytics.tsx')).not.toContain('trackAnalyticsPageview');
  });
});
