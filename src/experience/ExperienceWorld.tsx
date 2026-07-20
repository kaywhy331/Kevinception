'use client';

import { Year1990Scene } from './scenes/Year1990Scene';
import { Year2000Scene } from './scenes/Year2000Scene';
import { Year2010Scene } from './scenes/Year2010Scene';
import { Year2020Scene } from './scenes/Year2020Scene';
import { Year2030Scene } from './scenes/Year2030Scene';
import { Year2040Scene } from './scenes/Year2040Scene';
import { useExperienceStore } from './store';

export function ExperienceWorld() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const quality = useExperienceStore((state) => state.quality);
  const timeline = viewMode === 'timeline';
  return (
    <>
      <color attach="background" args={[quality === 'lite' ? '#08090d' : '#05060a']} />
      <fog attach="fog" args={['#05060a', 14, quality === 'lite' ? 52 : 78]} />
      <ambientLight intensity={quality === 'lite' ? 0.75 : 0.48} color="#b9c5e8" />
      <directionalLight position={[4, 12, 8]} intensity={quality === 'high' ? 2.5 : 1.7} color="#fff4de" castShadow={quality === 'high'} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight args={['#7796c7', '#151019', 0.65]} />
      <Year1990Scene active={activeYear === '1990'} timeline={timeline} />
      <Year2000Scene active={activeYear === '2000'} timeline={timeline} />
      <Year2010Scene active={activeYear === '2010'} timeline={timeline} />
      <Year2020Scene active={activeYear === '2020'} timeline={timeline} />
      <Year2030Scene active={activeYear === '2030'} timeline={timeline} />
      <Year2040Scene active={activeYear === '2040'} timeline={timeline} />
    </>
  );
}
