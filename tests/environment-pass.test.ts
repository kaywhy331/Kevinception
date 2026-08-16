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
    expect(architecture).toContain('FutureMemoryConduit');
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

  it('models 2030 as a zoned smart home with a spatially responsive Saito', () => {
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('ApartmentFurniture');
    expect(scene).toContain('MomentObject');
    expect(scene).toContain('ConsentMark');
    expect(scene).toContain('Saito in the room');
    expect(scene).toContain('SaitoSpatialResponse');
    expect(scene).toContain('Permissioned room input reaches Saito');
    expect(scene).toContain('Saito stops at human authority');
    expect(scene).toContain('Kitchen · local sensing zone');
    expect(scene).toContain('Studio · mounted context zone');
    expect(scene).toContain('Living room · guest-safe zone');
    expect(scene).toContain('<CylinderBetween');
    expect(scene).not.toContain('Human Governor');
    expect(scene).not.toContain('<ArchiveColumn');
  });

  it('models 2040 as an amber cyberpunk apartment with holographic Kevin', () => {
    const scene = read('src/experience/scenes/Year2040Scene.tsx');
    expect(scene).toContain('<RoomShell');
    expect(scene).toContain('<HologramKevin');
    expect(scene).toContain('CyberpunkApartment');
    expect(scene).toContain("accent=\"#ff9e2f\"");
    expect(scene).toContain('getPermissionedMemoryState');
    expect(scene).toContain('consciousness.sourceTraceOpen');
    expect(scene).not.toContain('shardLayout');
    expect(scene).not.toContain('<HologramFigure');
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
