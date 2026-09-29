import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7 fluid experience pass', () => {
  it('keeps year selection and interface entry inside the persistent experience route', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(shell).toContain("const interfaceHref = experienceHref(year, 'interface')");
    expect(shell).toContain("commitUrl(interfaceHref, 'push')");
    expect(shell).toContain("commitUrl(canonicalHref, 'replace')");
    expect(overlay).toContain('onClick={() => enterYear(activeYear)}');
  });

  it('supports browser history, touch swipes, coalesced trackpad scrolling, and an escape hierarchy', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain("window.addEventListener('popstate'");
    expect(shell).toContain("window.addEventListener('touchstart'");
    expect(shell).toContain("window.addEventListener('wheel'");
    expect(shell).toContain('gesture.consumed = true');
    expect(shell).toContain("navigateToYearInternal(next, 'push')");
    expect(shell).toContain('if (state.settingsOpen) state.setSettingsOpen(false)');
    expect(shell).toContain("else if (state.viewMode === 'interface') closeInterface()");
    expect(shell).toContain("else if (state.viewMode === 'environment') showTimeline()");
    // Layers that own Escape (menu, dialogs, takeaway) claim it first.
    expect(shell).toContain('if (event.defaultPrevented) return');
    // Enter on a focused control belongs to that control, not the global shortcut.
    expect(shell).toContain('if (target?.closest(ENTER_OWNED_TARGET)) return');
  });

  it('uses short temporal jumps instead of flying across every intermediate room', () => {
    const config = read('src/experience/config.ts');
    const shell = read('src/experience/ExperienceShell.tsx');
    const camera = read('src/experience/CameraRig.tsx');
    const styles = read('app/environment-pass.css');
    expect(config).toContain("return 'time-jump'");
    expect(shell).toContain('const id = transitionBetween(fromYear, year)');
    expect(shell).toContain('const duration = getTransitionDuration(id, useExperienceStore.getState().motion)');
    expect(camera).toContain("transition.id === 'time-jump'");
    expect(styles).toContain('.transition-time-jump');
  });

  it('loads one full scene and uses lightweight proxies for visible neighbors', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    const loaders = read('src/experience/sceneLoaders.ts');
    expect(loaders).toContain('export const sceneLoaders');
    expect(world).toContain('lazy(sceneLoaders[year])');
    expect(world).toContain('function EraProxy');
    // In a room only the active scene is full; the Chapters overview shows every
    // room as a real scene unless Lite is active.
    expect(world).toContain("const sceneYears = overview && quality !== 'lite' ? YEAR_ORDER : [activeYear]");
    expect(world).toContain("proxyOnly = quality === 'lite' && futureYear");
    expect(world).toContain('filter((year) => !sceneYears.includes(year))');
  });

  it('keeps the active interface mounted, prewarms on intent, and skips duplicate intros', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('const [mountedYears, setMountedYears]');
    expect(overlay).toContain("activeYear === '2000'");
    expect(overlay).toContain("window.addEventListener('kevinception:prewarm'");
    expect(overlay).toContain('onPointerEnter={() => prewarm.schedule(activeYear)}');
    expect(overlay).toContain('const PREWARM_DELAY = 300');
    expect(overlay).toContain('state.bootedYears.includes(year)');
    expect(overlay).toContain('preloadExperienceScene(year)');
    expect(overlay).toContain("document?.querySelector<HTMLButtonElement>('[data-era-enter]')");
    expect(overlay).toContain("<InterfaceLayer visible={viewMode === 'interface'} />");
  });

  it('caps pixel density, pauses idle rendering, and pauses inactive scene loops', () => {
    const canvas = read('src/experience/ExperienceCanvas.tsx');
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    const kevtok = read('src/experience/scenes/Year2020Scene.tsx');
    expect(canvas).toContain('high: [1, 1.75]');
    expect(canvas).toContain('lite: [0.75, 1]');
    expect(canvas).toContain('<AdaptiveDpr />');
    expect(canvas).not.toContain('pixelated');
    expect(canvas).toContain('function FrameBudgetController');
    // setFrameloop resets the R3F clock, so it only runs when the mode changes.
    expect(canvas).toContain('if (get().frameloop !== mode) setFrameloop(mode)');
    expect(canvas).toContain("setLoop('demand')");
    expect(canvas).toContain("setLoop('never')");
    expect(canvas).toContain('useThree((state) => state.setFrameloop)');
    expect(nexus).toContain('if (!active || !detail || !animate) return');
    expect(echo).toContain('if (!active || !animate) return');
    expect(echo).not.toContain('shards.current');
    expect(kevtok).toContain('if (!active || !reactions.current) return');
  });

  it('keeps the current room visually dominant on ultrawide screens', () => {
    const camera = read('src/experience/CameraRig.tsx');
    const world = read('src/experience/ExperienceWorld.tsx');
    expect(camera).toContain('position: [number, number, number]');
    expect(camera).toContain('target: [number, number, number]');
    expect(camera).toContain('TARGET_HORIZONTAL_FOV');
    expect(camera).toContain('export function responsiveVerticalFov');
    expect(world).toContain('function NeighborVeil');
    expect(world).toContain('opacity={0.52}');
  });
});
