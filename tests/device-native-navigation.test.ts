import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7.7 device-native navigation', () => {
  it('keeps the 2030 and 2040 camera centered and disables future-room parallax', () => {
    const camera = read('src/experience/CameraRig.tsx');
    expect(camera).toContain("const futureRoom = activeYear === '2030' || activeYear === '2040'");
    expect(camera).toContain('position: [stationX, narrow ? 5.75');
    expect(camera).toContain('target: [stationX, futureRoom ? 2.2');
    expect(camera).toContain("motion === 'reduced' || futureRoom");
    expect(camera).not.toContain('futureCameraOffset');
    expect(camera).not.toContain('futureTargetOffset');
  });

  it('uses a slim frame bar and removes duplicated interface navigation', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const styles = read('app/device-native-pass.css');
    expect(overlay).toContain('interface-mode__chapter');
    expect(overlay).toContain('aria-label="Experience frame controls"');
    expect(overlay).toContain('>Step back</button>');
    expect(overlay).toContain('>Chapters</button>');
    expect(overlay).toContain(".era-utility{display:none!important}");
    expect(styles).toContain('grid-template-rows: 2.35rem minmax(0,1fr)');
    expect(styles).toContain('.mode-interface .experience-toolbar { display: none; }');
  });

  it('condenses global utilities behind one menu', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('function UtilityMenu');
    expect(overlay).toContain('experience-menu__popover');
    expect(overlay).toContain('Artifacts <span>{foundCount}</span>');
    expect(overlay).toContain('Text version');
  });

  it('loads a device-native KevTok layer inside the embedded 2020 interface', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const script = read('public/legacy/assets/client/kevtok-native.js');
    const styles = read('public/legacy/assets/styles/kevtok-native.css');
    expect(() => new Function(script)).not.toThrow();
    expect(overlay).toContain("script.src = '/legacy/assets/client/kevtok-native.js'");
    expect(overlay).toContain("link.href = '/legacy/assets/styles/kevtok-native.css'");
    for (const item of ['home', 'discover', 'create', 'inbox', 'profile']) {
      expect(script).toContain(`data-kt-nav="${item}"`);
    }
    expect(script).toContain("createDialog('discover'");
    expect(script).toContain("createDialog('create'");
    expect(script).toContain("createDialog('inbox'");
    expect(script).toContain("createDialog('profile'");
    expect(script).toContain('syncActionCounts');
    expect(script).toContain('now - lastTap < 320');
    expect(styles).toContain('.kt-heart-burst');
    expect(styles).toContain('.kt-native-profile');
  });
});
