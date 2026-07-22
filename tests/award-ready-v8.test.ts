import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { narrativeSite } from '@/content/narrative';
import { eraConfigs, transitionBetween, YEAR_ORDER } from '@/experience/config';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('award-ready V8 contract', () => {
  it('uses one canonical narrative across the primary surfaces', () => {
    expect(narrativeSite.masterStatement).toContain('One evolving mind. Six defining interfaces.');
    for (const file of ['app/page.tsx', 'app/about/page.tsx', 'app/portfolio/page.tsx', 'src/experience/ExperienceOverlay.tsx']) {
      expect(read(file)).toContain('narrativeSite.masterStatement');
    }
    expect(read('app/contact/page.tsx')).toContain('narrativeSite.closingStatement');
    expect(read('app/layout.tsx')).toContain('narrativeSite.description');
  });

  it('defines a complete art-direction contract and finite three-component camera tuples for every era', () => {
    for (const year of YEAR_ORDER) {
      const art = eraConfigs[year].artDirection;
      expect(art.materials.length).toBeGreaterThan(1);
      expect(art.motion.length).toBeGreaterThan(20);
      expect(art.evidenceMetaphor.length).toBeGreaterThan(20);
      expect(art.soundIntent.length).toBeGreaterThan(20);
      expect(art.responsiveComposition.length).toBeGreaterThan(40);
      for (const pose of Object.values(art.camera)) {
        expect(pose.position).toHaveLength(3);
        expect(pose.target).toHaveLength(3);
        expect([...pose.position, ...pose.target].every(Number.isFinite)).toBe(true);
      }
    }
  });

  it('uses authored transitions for every adjacent chapter pair', () => {
    expect(YEAR_ORDER.slice(0, -1).map((year, index) => transitionBetween(year, YEAR_ORDER[index + 1]!))).toEqual([
      'static-modem', 'profile-flatten', 'portrait-rotate', 'signals-to-agents', 'agents-to-echo'
    ]);
  });

  it('provides semantic hotspots and text equivalents and carries discoveries forward', () => {
    for (const year of YEAR_ORDER) expect(eraConfigs[year].hotspots.length).toBeGreaterThanOrEqual(2);
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const world = read('src/experience/ExperienceWorld.tsx');
    expect(overlay).toContain('function SemanticHotspots');
    expect(overlay).toContain('text-mode__hotspots');
    expect(overlay).toContain('aria-label={`${hotspot.label}. ${hotspot.description}`}');
    expect(world).toContain('continuityCount');
    expect(world).toContain("activeYear === '2030' || activeYear === '2040'");
  });

  it('uses canonical chapter routes and unique share metadata', () => {
    const route = read('app/experience/[year]/page.tsx');
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(route).toContain('alternates: { canonical: url }');
    expect(route).toContain("openGraph: { title, description, url");
    expect(shell).toContain('`/experience/${year}/${suffix}`');
  });

  it('guards global keys, limits gesture navigation, and provides true dialog behavior', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    const dialog = read('src/components/AccessibleDialog.tsx');
    expect(shell).toContain("target?.closest('button, a, input");
    expect(shell).toContain('getAdjacentYear(currentYear, direction)');
    expect(dialog).toContain("event.key === 'Escape'");
    expect(dialog).toContain("event.key !== 'Tab'");
    expect(dialog).toContain('background.inert = true');
    expect(dialog).toContain('returnTarget?.focus()');
  });

  it('keeps mobile navigation and essential narrative present and contact claims honest', () => {
    expect(read('src/components/SiteChrome.tsx')).toContain('className="mobile-nav"');
    expect(read('app/v8.css')).toContain('.chapter-card__experience,.chapter-card strong,.chapter-card .eyebrow,.chapter-card__master { display:block!important; }');
    expect(read('src/components/ContactForm.tsx')).toContain('A public contact email has not been assumed.');
    expect(read('src/content/data.ts')).toContain('"contactEmail": ""');
  });

  it('removes the temporary source-bundle workflow', () => {
    expect(fs.existsSync(path.join(process.cwd(), '.github/workflows/source-bundle-v8.yml'))).toBe(false);
  });
});
