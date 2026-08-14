import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('future-wing documentation truth', () => {
  it('records the native governed journey without claiming final production assets', () => {
    const status = read('docs/IMPLEMENTATION_STATUS_V7.md');
    expect(status).toContain('Kevin Nexus and Kevin Echo are native React interfaces and do not use iframes');
    expect(status).toContain('Persistent deterministic `NX-*` continuation receipt');
    expect(status).toContain('Three-unique-memory synthesis gate');
    expect(status).toContain('final original/licensed sound design across all eras');
  });

  it('keeps the deterministic, local, and cross-device boundaries explicit', () => {
    const limitations = read('docs/KNOWN_LIMITATIONS_V7.md');
    expect(limitations).toContain('intentionally deterministic and evidence-bounded');
    expect(limitations).toContain('persist only in the visitor’s browser');
    expect(limitations).toContain('final original/licensed audio');
    expect(limitations).toContain('real-device WebGL/Safari/Android testing');
  });

  it('closes the authored finale while retaining partial sound and art work', () => {
    const roadmap = read('docs/ROADMAP.md');
    expect(roadmap).toContain('3.5 Narrative payoff at 2040');
    expect(roadmap).toContain('✅ Implemented in visual and text modes');
    expect(roadmap).toContain('◐ Future-wing code pass implemented; authored asset pass remains');
    expect(roadmap).toContain('◐ Native future wing implemented; full six-era pass remains');
  });
});
