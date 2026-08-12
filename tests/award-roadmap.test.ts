import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackAnalyticsEvent } from '@/lib/analytics';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

afterEach(() => {
  delete window.plausible;
  Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: undefined });
  vi.restoreAllMocks();
});

describe('award-roadmap agent-ready work', () => {
  it('separates the Profile narrative from the case-study archive', () => {
    const profile = read('app/portfolio/page.tsx');
    const work = read('app/work/page.tsx');
    const archive = read('src/components/WorkArchive.tsx');
    const chrome = read('src/components/SiteChrome.tsx');
    expect(profile).not.toContain('ProjectCard');
    expect(profile).toContain('capability-ledger');
    expect(profile).toContain("title: 'Profile'");
    expect(archive).toContain('case-study-index__list');
    expect(work).toContain('<WorkArchive projects={projects} />');
    expect(chrome).toContain("{ href: '/portfolio/', label: 'Profile' }");
  });

  it('uses a self-hosted display face and authored signature moments', () => {
    const layout = read('app/layout.tsx');
    const home = read('app/page.tsx');
    const portal = read('src/components/EraPortalCanvas.tsx');
    const shell = read('src/experience/ExperienceShell.tsx');
    const notFound = read('app/not-found.tsx');
    expect(layout).toContain('Inter, Syne');
    expect(layout).toContain("variable: '--font-display'");
    expect(home).toContain('<EraPortalCanvas />');
    expect(home).not.toContain('directRoutes');
    expect((portal.match(/<Link\b/g) ?? [])).toHaveLength(1);
    expect(portal).toContain("getContext('2d')");
    expect(portal).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(shell).toContain('Reconstructing six eras');
    expect(notFound).toContain('lost-era');
  });

  it('uses designed reduced-motion variants instead of a universal kill switch', () => {
    const globals = read('app/globals.css');
    const award = read('app/award-pass.css');
    expect(globals).not.toContain('animation-duration: .01ms !important');
    expect(award).toContain('@media (prefers-reduced-motion: reduce)');
    expect(award).toContain('.era-portal__scan { animation: none;');
    expect(award).toContain('animation: reduced-transition 180ms ease both');
    expect(read('docs/MOTION.md')).toContain('--motion-medium');
  });

  it('queues privacy-friendly funnel events with properties', () => {
    Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '0' });
    trackAnalyticsEvent('chapter_enter', { year: '2030', chapter: 'Coexistence' });
    expect(window.plausible?.q).toEqual([
      ['chapter_enter', { props: { year: '2030', chapter: 'Coexistence' } }]
    ]);
  });

  it('does not queue analytics when Do Not Track is enabled', () => {
    Object.defineProperty(navigator, 'doNotTrack', { configurable: true, value: '1' });
    trackAnalyticsEvent('brief_email', { intent: 'Advisory' });
    expect(window.plausible).toBeUndefined();
  });

  it('wires the full measurement funnel and production CSP', () => {
    const analytics = read('src/components/Analytics.tsx');
    const experience = read('src/experience/ExperienceShell.tsx');
    const contact = read('src/components/ContactForm.tsx');
    const headers = read('public/_headers');
    for (const event of ['timeline_enter', 'case_study_open', 'case_study_read', 'contact_open', 'contact_view']) {
      expect(analytics).toContain(event);
    }
    expect(experience).toContain("trackAnalyticsEvent('chapter_enter'");
    expect(experience).toContain("trackAnalyticsEvent('artifact_find'");
    expect(contact).toContain("trackAnalyticsEvent('brief_email'");
    expect(headers).toContain("script-src 'self' 'unsafe-inline' https://plausible.io");
    expect(headers).toContain("connect-src 'self' https://plausible.io");
  });
});
