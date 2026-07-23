import type { YearId } from '@/content/data';
import type { EraCameraPose, Vec3 } from '../config';

export type DeviceExperience = {
  year: YearId;
  environmentMode: string;
  deviceLabel: string;
  operatingLayer: string;
  applicationLabel: string;
  camera: {
    approach: EraCameraPose;
    interact: EraCameraPose;
    exit: EraCameraPose;
  };
  screen: {
    position: Vec3;
    rotation: Vec3;
    size: readonly [number, number];
    radius: number;
    perspective: boolean;
  };
  interaction: {
    primaryMode: 'remote' | 'mouse' | 'touch' | 'voice' | 'gesture';
    fallbackMode: 'keyboard' | 'text';
  };
};
