import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('future-wing documentation truth', () => {
  it('records the native permissioned journey without claiming final production assets', () => {
    const status = read('docs/IMPLEMENTATION_STATUS_V7.md');
    expect(status).toContain('Morning, Together and Morning, After are native React interfaces and do not use iframes');
    expect(status).toContain('TokenPak, TIP, and PAK available only through an optional infrastructure receipt');
    expect(status).toContain('Sense → Interpret → Check authority → Act or wait → Receipt');
    expect(status).toContain('progressive first-person Saito/Kevin exchange');
    expect(status).toContain('without replacing the conversation with a dashboard');
    expect(status).toContain('signal stops visibly at the human-authority gate');
    expect(status).toContain('never a claim to reveal hidden chain-of-thought');
    expect(status).toContain('2030 consent materially changes 2040 recall');
    expect(status).toContain('multi-domain anticipation');
    expect(status).toContain('nine words about Asia');
    expect(status).toContain('Seed held');
    expect(status).toContain('Live mode');
    expect(status).toContain('consent is never advanced by the machine');
    expect(status).toContain('“May I keep this?”');
    expect(status).toContain('final original/licensed sound design across all eras');
  });

  it('keeps the deterministic, local, and cross-device boundaries explicit', () => {
    const limitations = read('docs/KNOWN_LIMITATIONS_V7.md');
    expect(limitations).toContain('intentionally deterministic and source-bounded');
    expect(limitations).toContain('persist only in the visitor’s browser');
    expect(limitations).toContain('final original/licensed audio');
    expect(limitations).toContain('real-device WebGL/Safari/Android testing');
  });

  it('closes the authored finale while retaining partial sound and art work', () => {
    const roadmap = read('docs/ROADMAP.md');
    expect(roadmap).toContain('3.5 Narrative payoff at 2040');
    expect(roadmap).toContain('✅ Implemented in visual and text modes');
    expect(roadmap).toContain('Notice, Recall, Deliberate, Act, and Continue');
    expect(roadmap).toContain('“May I keep this?”');
    expect(roadmap).toContain('◐ Future-wing code pass implemented; authored asset pass remains');
    expect(roadmap).toContain('◐ Code-native six-era pass implemented; browser six-up review remains');
  });
});
