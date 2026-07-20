import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7.1 connected physical environment pass', () => {
  it('mounts a shared timeline architecture around every era scene', () => {
    const world = read('src/experience/ExperienceWorld.tsx');
    const architecture = read('src/experience/TimelineArchitecture.tsx');
    expect(world).toContain('<TimelineArchitecture');
    expect(architecture).toContain('FutureDataConduit');
    expect(architecture).toContain('function Corridor');
  });

  it('models 2030 as a physical autonomous systems lab', () => {
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('Human approval console');
    expect(scene).toContain('<ArchiveColumn');
    expect(scene).toContain('<GlassPanel position={[5.08');
  });

  it('models 2040 as a physical continuity sanctuary', () => {
    const scene = read('src/experience/scenes/Year2040Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('Thought interpreter');
    expect(scene).toContain('<HologramFigure');
    expect(scene).toContain('<Plant');
  });

  it('keeps both future spaces physically open toward one another', () => {
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    expect(nexus).toContain('openRight');
    expect(echo).toContain('openLeft');
  });

  it('uses compact era docks rather than the previous full descriptive cards', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const styles = read('app/environment-pass.css');
    expect(overlay).toContain('era-details');
    expect(styles).toContain('.timeline-panel');
    expect(styles).toContain('max-width: 760px');
  });
});
