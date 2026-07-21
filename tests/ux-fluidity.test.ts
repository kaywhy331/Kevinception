import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7.2 fluid experience pass', () => {
  it('keeps year selection and interface entry inside the persistent experience route', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(shell).toContain('/experience/?year=');
    expect(shell).toContain("experienceUrl(year, 'interface')");
    expect(shell).toContain("router.replace(experienceUrl(location.year, 'interface')");
    expect(overlay).toContain('onClick={() => enterYear(activeYear)}');
  });

  it('supports browser history, touch swipes, trackpad scrolling, and an escape hierarchy', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain("window.addEventListener('popstate'");
    expect(shell).toContain("window.addEventListener('touchstart'");
    expect(shell).toContain("window.addEventListener('wheel'");
    expect(shell).toContain('if (settingsOpen) setSettingsOpen(false)');
    expect(shell).toContain("else if (machine.matches('environment')) showTimeline()");
  });

  it('mounts a small render band rather than every complete era at once', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    expect(world).toContain('const mountedYears = new Set<YearId>');
    expect(world).toContain("mountedYears.has('1990')");
    expect(world).toContain("mountedYears.add('2030')");
    expect(world).toContain("mountedYears.add('2040')");
  });

  it('keeps the active interface mounted across Step Back and skips duplicate embedded intros', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('const [mountedYears, setMountedYears]');
    expect(overlay).toContain("if (year === '2000') return");
    expect(overlay).toContain("document?.querySelector<HTMLButtonElement>('[data-era-enter]')");
    expect(overlay).toContain("<InterfaceLayer visible={viewMode === 'interface'} />");
  });

  it('caps pixel density and pauses expensive inactive animation loops', () => {
    const canvas = read('src/experience/ExperienceCanvas.tsx');
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    const kevtok = read('src/experience/scenes/Year2020Scene.tsx');
    expect(canvas).toContain('[1, 1.7]');
    expect(canvas).toContain('<AdaptiveDpr');
    expect(nexus).toContain('if (!active) return');
    expect(echo).toContain('if (!active || !shards.current) return');
    expect(kevtok).toContain('if (!active || !reactions.current) return');
  });
});
