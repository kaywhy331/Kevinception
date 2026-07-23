import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertFiniteDeviceExperience, deviceExperiences } from '@/experience/device/contracts';
import { YEAR_ORDER } from '@/experience/config';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('device-framed era experience contract', () => {
  it('defines a finite physical device, operating layer, application, camera, and screen for every era', () => {
    for (const year of YEAR_ORDER) {
      const device = deviceExperiences[year];
      expect(device.year).toBe(year);
      expect(device.environmentMode.length).toBeGreaterThan(8);
      expect(device.deviceLabel.length).toBeGreaterThan(8);
      expect(device.operatingLayer.length).toBeGreaterThan(3);
      expect(device.applicationLabel.length).toBeGreaterThan(3);
      expect(assertFiniteDeviceExperience(device)).toBe(true);
      expect(device.screen.size.every((value) => Number.isFinite(value) && value > 0)).toBe(true);
    }
  });

  it('keeps 1990 and 2000 explicitly framed by their reference hardware', () => {
    expect(deviceExperiences['1990'].deviceLabel).toContain('tube television');
    expect(deviceExperiences['2000'].deviceLabel).toContain('CRT computer');
    const styles = read('app/device-stage.css');
    expect(styles).toContain('.device-hardware--1990');
    expect(styles).toContain('.device-hardware--2000');
  });

  it('nests Windohs 7 and KevBook inside the 2010 laptop screen', () => {
    const screen = read('src/experience/device/DeviceScreenSurface.tsx');
    const stage = read('src/experience/device/DeviceStage.tsx');
    expect(deviceExperiences['2010'].deviceLabel).toContain('laptop');
    expect(deviceExperiences['2010'].operatingLayer).toBe('Windohs 7');
    expect(deviceExperiences['2010'].applicationLabel).toBe('KevBook');
    expect(screen).toContain('device-os-bar--windohs');
    expect(screen).toContain('Maximize KevBook within laptop screen');
    expect(stage).toContain('data-device-frame-visible="true"');
  });

  it('nests KevOS and KevTok inside a complete physical 2020 phone', () => {
    const screen = read('src/experience/device/DeviceScreenSurface.tsx');
    expect(deviceExperiences['2020'].deviceLabel).toContain('phone');
    expect(deviceExperiences['2020'].operatingLayer).toBe('KevOS');
    expect(deviceExperiences['2020'].applicationLabel).toBe('KevTok');
    expect(screen).toContain('device-os-bar--kevos');
    expect(screen).toContain('Return to KevOS home screen');
  });

  it('provides the five Nexus roles, evidence application, human gate, optional voice, and text fallback', () => {
    const hotspots = read('src/experience/device/SpatialHotspotLayer.tsx');
    const interaction = read('src/experience/device/DeviceInteractionLayer.tsx');
    for (const role of ['Clarifier', 'Researcher', 'Architect', 'Builder', 'Governor']) expect(hotspots).toContain(role);
    expect(deviceExperiences['2030'].deviceLabel).toContain('orchestration console');
    expect(interaction).toContain('Brief Nexus by voice');
    expect(interaction).toContain('Use text instead');
    expect(interaction).toContain('No microphone permission is required');
    expect(interaction).toContain('Human gate armed');
    const nexus = read('public/legacy/experience/2030/index.html');
    expect(nexus).toContain('HUMAN DECISION GATE');
    expect(nexus).toContain('data-nexus-reject');
  });

  it('keeps the holographic reconstruction primary and the Echo input compact', () => {
    const interaction = read('src/experience/device/DeviceInteractionLayer.tsx');
    const embedded = read('public/legacy/assets/styles/device-contained.css');
    expect(deviceExperiences['2040'].deviceLabel).toContain('holographic projection');
    expect(interaction).toContain('Ask Kevin Echo by voice');
    expect(embedded).toContain('.echo-hologram');
    expect(embedded).toContain('.echo-interpreter');
    expect(embedded).toContain('.echo-memories');
    expect(read('public/legacy/assets/client/era-worlds.js')).toContain('echo-provenance');
    expect(read('public/legacy/assets/client/era-worlds.js')).toContain('modeled interpretation');
    expect(embedded).not.toContain('width:100vw');
  });

  it('does not default 2010–2040 to a full-viewport iframe and preserves reduced-motion behavior', () => {
    const stage = read('src/experience/device/DeviceStage.tsx');
    const styles = read('app/device-stage.css');
    expect(stage).toContain('DeviceScreenSurface');
    expect(stage).toContain('device-stage__environment');
    expect(stage).toContain('data-environment-visible="true"');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
    expect(styles).not.toContain('.device-viewport__frame{position:fixed');
    expect(styles).not.toContain('.device-viewport__frame{width:100vw');
  });
});
