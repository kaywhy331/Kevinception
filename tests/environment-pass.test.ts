import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7 connected physical environment pass', () => {
  it('mounts a shared timeline architecture around the active render band', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    const architecture = read('src/experience/TimelineArchitecture.tsx');
    expect(world).toContain('<TimelineArchitecture');
    expect(architecture).toContain('FutureDataConduit');
    expect(architecture).toContain('function Corridor');
  });

  it('uses grounded furniture and surface-aware scene primitives', () => {
    const layout = read('src/experience/scenes/SceneLayout.tsx');
    const livingRoom = read('src/experience/scenes/Year1990Scene.tsx');
    const computerRoom = read('src/experience/scenes/Year2000Scene.tsx');
    expect(layout).toContain('GroundedDesk');
    expect(layout).toContain('MediaConsole');
    expect(layout).toContain('FloorPedestal');
    expect(livingRoom).toContain('<MediaConsole');
    expect(computerRoom).toContain('<GroundedDesk');
  });

  it('models 2030 as a grounded autonomous systems lab', () => {
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('Human approval console');
    expect(scene).toContain('<ArchiveColumn');
    expect(scene).toContain('<WallDisplay');
    expect(scene).toContain('<FloorPedestal');
  });

  it('models 2040 as a simplified continuity sanctuary', () => {
    const scene = read('src/experience/scenes/Year2040Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('Thought interpreter');
    expect(scene).toContain('<HologramFigure');
    expect(scene).toContain('shardLayout');
    expect(scene).toContain('<FloorPedestal');
  });

  it('keeps both future spaces physically open toward one another', () => {
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    expect(nexus).toContain('openRight');
    expect(echo).toContain('openLeft');
  });

  it('uses compact era docks rather than full descriptive cards', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const styles = read('app/environment-pass.css');
    expect(overlay).toContain('era-details');
    expect(styles).toContain('.timeline-panel');
    expect(styles).toContain('width: min(680px');
  });
});
