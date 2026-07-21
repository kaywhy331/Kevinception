import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7.5 visual scene refinements', () => {
  it('uses a dark 1990 CRT and an original front-loading console homage', () => {
    const scene = read('src/experience/scenes/Year1990Scene.tsx');
    expect(scene).toContain('color="#2c2d30"');
    expect(scene).toContain('args={[2.45, 0.5, 1.25]}');
    expect(scene).toContain('args={[1.45, 0.22, 0.62]}');
    expect(scene).toContain("discover('signal-fragment', '1990')");
    expect(scene).not.toContain('FloorPedestal');
  });

  it('keeps the 2000 tower floor-standing beside the desk and removes hanging cables', () => {
    const scene = read('src/experience/scenes/Year2000Scene.tsx');
    expect(scene).toContain('position={[4.42, 1.47, 0.05]}');
    expect(scene).toContain('color="#bcb7a6"');
    expect(scene).toContain('Inspect 56K modem');
    expect(scene).not.toContain('<Cable');
    expect(scene).not.toContain('ArtifactMesh');
  });

  it('keeps 2010 focused on one laptop without extra devices or wires', () => {
    const scene = read('src/experience/scenes/Year2010Scene.tsx');
    expect(scene).toContain('Open KevinBook');
    expect(scene).not.toContain('phone');
    expect(scene).not.toContain('Camera');
    expect(scene).not.toContain('<Cable');
    expect(scene).not.toContain('ArtifactMesh');
  });

  it('uses a phone-scale KevTok rig, an analytics graph, and a DSLR camera', () => {
    const scene = read('src/experience/scenes/Year2020Scene.tsx');
    expect(scene).toContain('args={[0.72, 1.35, 0.16]}');
    expect(scene).toContain('<Line points={graphPoints}');
    expect(scene).toContain('args={[1.12, 0.66, 0.48]}');
    expect(scene).not.toContain('<Cable');
    expect(scene).not.toContain('ArtifactMesh');
  });

  it('removes the static future conduit and unsupported future artifacts', () => {
    const architecture = read('src/experience/TimelineArchitecture.tsx');
    const nexus = read('src/experience/scenes/Year2030Scene.tsx');
    const echo = read('src/experience/scenes/Year2040Scene.tsx');
    expect(architecture).toContain('if (!transitionActive) return null');
    expect(nexus).not.toContain('ArtifactMesh');
    expect(echo).not.toContain('ArtifactMesh');
    expect(echo).not.toContain('Thought interpreter');
  });
});
