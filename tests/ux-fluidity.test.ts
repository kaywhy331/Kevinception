import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7 fluid experience pass', () => {
  it('keeps year selection and interface entry inside the persistent experience route', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(shell).toContain("return `/experience/?${params.toString()}`");
    expect(shell).toContain("writeExperienceHistory(year, 'interface')");
    expect(shell).toContain("writeExperienceHistory(location.year, 'interface', 'replace', location.module)");
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

  it('loads one full scene and uses lightweight proxies for visible neighbors', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    const loaders = read('src/experience/sceneLoaders.ts');
    expect(loaders).toContain('export const sceneLoaders');
    expect(world).toContain('lazy(sceneLoaders[year])');
    expect(world).toContain('function EraProxy');
    expect(world).toContain('const ActiveScene = sceneComponents[activeYear]');
    expect(world).toContain('<ActiveScene active timeline={timeline} detail={renderDetailedScene} />');
    expect(world).toContain("proxyOnly = quality === 'lite' && futureYear");
    expect(world).toContain("filter((year) => year !== activeYear)");
  });

  it('keeps the active interface mounted, prewarms on intent, and skips duplicate intros', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('const [mountedYears, setMountedYears]');
    expect(overlay).toContain("activeYear === '2000'");
    expect(overlay).toContain("window.addEventListener('kevinception:prewarm'");
    expect(overlay).toContain('onPointerEnter={() => requestExperiencePrewarm(activeYear)}');
    expect(overlay).toContain('preloadExperienceScene(year)');
    expect(overlay).toContain("document?.querySelector<HTMLButtonElement>('[data-era-enter]')");
    expect(overlay).toContain("<InterfaceLayer visible={viewMode === 'interface'} />");
  });

  it('caps pixel density, pauses idle rendering, and pauses inactive scene loops', () => {
    const canvas = read('src/experience/ExperienceCanvas.tsx');
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    const kevtok = read('src/experience/scenes/Year2020Scene.tsx');
    expect(canvas).toContain('[1, 1.7]');
    expect(canvas).toContain('<AdaptiveDpr');
    expect(canvas).toContain('function FrameBudgetController');
    expect(canvas).toContain("setFrameloop('demand')");
    expect(canvas).toContain("setFrameloop('never')");
    expect(nexus).toContain('if (!active || !detail) return');
    expect(echo).toContain('if (!active) return');
    expect(echo).not.toContain('shards.current');
    expect(kevtok).toContain('if (!active || !reactions.current) return');
  });

  it('keeps the current room visually dominant on ultrawide screens', () => {
    const camera = read('src/experience/CameraRig.tsx');
    const world = read('src/experience/ExperienceWorld.tsx');
    expect(camera).toContain('position: [number, number, number]');
    expect(camera).toContain('target: [number, number, number]');
    expect(camera).toContain('TARGET_HORIZONTAL_FOV');
    expect(camera).toContain('THREE.MathUtils.clamp(responsiveFov, 32, 48)');
    expect(world).toContain('function NeighborVeil');
    expect(world).toContain("opacity = viewMode === 'timeline' ? 0.42 : 0.52");
  });
});
