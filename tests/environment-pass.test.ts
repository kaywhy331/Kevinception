import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7 connected physical environment pass', () => {
  it('mounts a shared timeline architecture around the active scene', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    const architecture = read('src/experience/TimelineArchitecture.tsx');
    expect(world).toContain('<TimelineArchitecture');
    expect(world).toContain('function EraProxy');
    expect(architecture).toContain('FutureDataConduit');
    expect(architecture).toContain('function Corridor');
    expect(architecture).toContain('if (!transitionActive) return null');
  });

  it('uses grounded furniture and surface-aware scene primitives', () => {
    const layout = read('src/experience/scenes/SceneLayout.tsx');
    const livingRoom = read('src/experience/scenes/Year1990Scene.tsx');
    const computerRoom = read('src/experience/scenes/Year2000Scene.tsx');
    expect(layout).toContain('DESK_SURFACE_Y = 1.55');
    expect(layout).toContain('GroundedDesk');
    expect(layout).toContain('MediaConsole');
    expect(layout).toContain('FloorPedestal');
    expect(livingRoom).toContain('<MediaConsole');
    expect(computerRoom).toContain('<GroundedDesk');
  });

  it('models 2030 as a grounded autonomous systems lab', () => {
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('Human approval node');
    expect(scene).toContain('<ArchiveColumn');
    expect(scene).toContain('<WallDisplay');
    expect(scene).toContain('<FloorPedestal');
    expect(scene).not.toContain('id="human-gate" year="2030"');
  });

  it('models 2040 as a platform-centered holographic sanctuary', () => {
    const scene = read('src/experience/scenes/Year2040Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('<HologramFigure');
    expect(scene).toContain('shardLayout');
    expect(scene).toContain('cylinder([0, 1.78, 0], 0.66, 1.7, 800)');
    expect(scene).not.toContain('Thought interpreter');
    expect(scene).not.toContain('torusGeometry args={[2.35');
  });

  it('keeps both future spaces physically open toward one another', () => {
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    expect(nexus).toContain('openRight');
    expect(echo).toContain('openLeft');
  });

  it('centers one adaptive chapter card and keeps chapter navigation persistent', () => {
    const styles = read('app/environment-pass.css');
    const layout = read('app/experience/layout.tsx');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(styles).toContain('width: min(850px');
    expect(styles).toContain('left: 50%');
    expect(styles).toContain('.persistent-year-selector');
    expect(layout).not.toContain('PersistentTimelineNav');
    expect(overlay).toContain('function ChapterCard');
    expect(overlay).toContain("showChapterNavigation && <YearSelector />");
  });
});
