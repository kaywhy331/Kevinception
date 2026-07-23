import type { YearId } from '@/content/data';
import { eraConfigs } from '../config';
import type { DeviceExperience } from './types';

const labels: Record<YearId, Pick<DeviceExperience, 'environmentMode' | 'deviceLabel' | 'operatingLayer' | 'applicationLabel' | 'screen' | 'interaction'>> = {
  '1990': {
    environmentMode: '1990 living room', deviceLabel: 'KevinVision tube television and cartridge console', operatingLayer: 'KevinVision broadcast receiver', applicationLabel: 'Broadcast channels and Circuit of Time',
    screen: { position: [0, 2.25, 0.18], rotation: [0, 0, 0], size: [4.8, 3.55], radius: 0.42, perspective: true }, interaction: { primaryMode: 'remote', fallbackMode: 'keyboard' }
  },
  '2000': {
    environmentMode: 'personal early-internet workstation', deviceLabel: 'CRT computer, tower, keyboard, mouse, modem, and speakers', operatingLayer: 'WinDohs desktop', applicationLabel: 'Kevin Online with browser, K-Mail, Buddy List, and Xanga',
    screen: { position: [0, 2.5, 0.2], rotation: [0, 0, 0], size: [5.1, 3.8], radius: 0.18, perspective: true }, interaction: { primaryMode: 'mouse', fallbackMode: 'keyboard' }
  },
  '2010': {
    environmentMode: 'connected 2010 workspace', deviceLabel: '2010 aluminum laptop with keyboard and trackpad', operatingLayer: 'Windohs 7', applicationLabel: 'KevBook',
    screen: { position: [0, 2.15, 0.16], rotation: [-0.035, 0, 0], size: [4.1, 2.45], radius: 0.12, perspective: true }, interaction: { primaryMode: 'mouse', fallbackMode: 'keyboard' }
  },
  '2020': {
    environmentMode: 'creator studio', deviceLabel: 'KevOS creator phone on a ring-light mount', operatingLayer: 'KevOS', applicationLabel: 'KevTok',
    screen: { position: [0, 2.1, 0.12], rotation: [0, 0, 0], size: [1.2, 2.55], radius: 0.24, perspective: true }, interaction: { primaryMode: 'touch', fallbackMode: 'keyboard' }
  },
  '2030': {
    environmentMode: 'Autonomous Systems Lab', deviceLabel: 'Nexus multimodal spatial orchestration console', operatingLayer: 'Nexus mission runtime', applicationLabel: 'Finite mission graph',
    screen: { position: [0, 1.35, 0.08], rotation: [-0.18, 0, 0], size: [6.8, 3.8], radius: 0.2, perspective: true }, interaction: { primaryMode: 'voice', fallbackMode: 'text' }
  },
  '2040': {
    environmentMode: 'Continuity Sanctuary', deviceLabel: 'Kevin Echo holographic projection and plinth', operatingLayer: 'Provenance-aware memory field', applicationLabel: 'Finite Kevin Echo response',
    screen: { position: [0, 2.25, 0.05], rotation: [0, 0, 0], size: [4.8, 4.4], radius: 0.4, perspective: true }, interaction: { primaryMode: 'voice', fallbackMode: 'text' }
  }
};

export const deviceExperiences = Object.fromEntries(Object.entries(labels).map(([year, device]) => {
  const id = year as YearId;
  const camera = eraConfigs[id].artDirection.camera;
  return [id, { year: id, ...device, camera: { approach: camera.environment, interact: camera.interface, exit: camera.timeline } } satisfies DeviceExperience];
})) as Record<YearId, DeviceExperience>;

export function assertFiniteDeviceExperience(device: DeviceExperience) {
  const tuples = [device.camera.approach.position, device.camera.approach.target, device.camera.interact.position, device.camera.interact.target, device.camera.exit.position, device.camera.exit.target, device.screen.position, device.screen.rotation];
  return tuples.every((tuple) => tuple.length === 3 && tuple.every(Number.isFinite));
}
