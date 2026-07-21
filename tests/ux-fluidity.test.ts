import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7 fluid experience pass', () => {
  it('keeps year selection and interface entry inside the persistent experience route', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(shell).toContain('/experience/?year=');
    expect(shell).toContain("writeExperienceHistory(year, 'interface')");
    expect(shell).toContain("writeExperienceHistory(location.year, 'interface', 'replace')");
    expect(shell).toContain('window.history[method]');
    expect(overlay).toContain('onClick={() => enterYear(activeYear)}');
  });

  it('supports browser history, touch swipes, coalesced trackpad scrolling, and an escape hierarchy', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain("window.addEventListener('popstate'");
    expect(shell).toContain("window.addEventListener('touchstart'");
    expect(shell).toContain("window.addEventListener('wheel'");
    expect(shell).toContain('wheelCommitTimer');
    expect(shell).toContain('Math.ceil(Math.abs(total) / 180)');
    expect(shell).toContain("navigateToYearInternal(target, 'replace')");
    expect(shell).toContain('if (settingsOpen) setSettingsOpen(false)');
    expect(shell).toContain("else if (machine.matches('environment')) showTimeline()");
  });

  it('uses short temporal jumps instead of flying across every intermediate room', () => {
    const config = read('src/experience/config.ts');
    const shell = read('src/experience/ExperienceShell.tsx');
    const camera = read('src/experience/CameraRig.tsx');
    const styles = read('app/environment-pass.css');
    expect(config).toContain("return 'time-jump'");
    expect(shell).toContain("distance > 1 ? 'time-jump'");
    expect(shell).toContain('distance > 1 ? 300 : 420');
    expect(camera).toContain("transition?.id === 'time-jump'");
    expect(styles).toContain('.transition-time-jump');
  });

  it('mounts a small render band and omits the source scene during distant jumps', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    expect(world).toContain('const mountedYears = new Set<YearId>');
    expect(world).toContain("transition?.id !== 'time-jump'");
    expect(world).toContain("mountedYears.has('1990')");
    expect(world).toContain("detail={activeYear === '2030'}");
    expect(world).toContain("detail={activeYear === '2040'}");
  });

  it('keeps the active interface mounted, prewarms settled eras, and skips duplicate intros', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('const [mountedYears, setMountedYears]');
    expect(overlay).toContain("activeYear === '2000'");
    expect(overlay).toContain('}, 850)');
    expect(overlay).toContain("document?.querySelector<HTMLButtonElement>('[data-era-enter]')");
    expect(overlay).toContain("<InterfaceLayer visible={viewMode === 'interface'} />");
  });

  it('caps pixel density, pauses inactive loops, and uses lightweight future neighbors', () => {
    const canvas = read('src/experience/ExperienceCanvas.tsx');
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    const kevtok = read('src/experience/scenes/Year2020Scene.tsx');
    expect(canvas).toContain('[1, 1.7]');
    expect(canvas).toContain('<AdaptiveDpr');
    expect(nexus).toContain('if (!active || !detail) return');
    expect(nexus).toContain('if (!detail)');
    expect(echo).toContain('if (!active || !detail || !shards.current) return');
    expect(echo).toContain('if (!detail)');
    expect(kevtok).toContain('if (!active || !reactions.current) return');
  });

  it('keeps the current room visually dominant on ultrawide screens', () => {
    const camera = read('src/experience/CameraRig.tsx');
    const world = read('src/experience/ExperienceWorld.tsx');
    expect(camera).toContain('TARGET_HORIZONTAL_FOV');
    expect(camera).toContain('THREE.MathUtils.clamp(responsiveFov, 32, 48)');
    expect(world).toContain('function NeighborVeil');
    expect(world).toContain("opacity = viewMode === 'timeline' ? 0.42 : 0.52");
  });
});
