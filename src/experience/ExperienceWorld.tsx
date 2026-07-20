'use client';

import { Year1990Scene } from './scenes/Year1990Scene';
import { Year2000Scene } from './scenes/Year2000Scene';
import { Year2010Scene } from './scenes/Year2010Scene';
import { Year2020Scene } from './scenes/Year2020Scene';
import { Year2030Scene } from './scenes/Year2030Scene';
import { Year2040Scene } from './scenes/Year2040Scene';
import { TimelineArchitecture } from './TimelineArchitecture';
import { useExperienceStore } from './store';

export function ExperienceWorld() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const quality = useExperienceStore((state) => state.quality);
  const timeline = viewMode === 'timeline';
  return (
    <>
      <color attach="background" args={[quality === 'lite' ? '#090b10' : '#05070b']} />
      <fog attach="fog" args={['#05070b', 20, quality === 'lite' ? 62 : 104]} />
      <ambientLight intensity={quality === 'lite' ? 0.78 : 0.42} color="#b8c7e8" />
      <directionalLight
        position={[5, 14, 10]}
        intensity={quality === 'high' ? 2.75 : 1.85}
        color="#fff4df"
        castShadow={quality !== 'lite'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-bias={-0.00045}
      />
      <hemisphereLight args={['#a8bee4', '#251c19', 0.68]} />
      <TimelineArchitecture />
      <Year1990Scene active={activeYear === '1990'} timeline={timeline} />
      <Year2000Scene active={activeYear === '2000'} timeline={timeline} />
      <Year2010Scene active={activeYear === '2010'} timeline={timeline} />
      <Year2020Scene active={activeYear === '2020'} timeline={timeline} />
      <Year2030Scene active={activeYear === '2030'} timeline={timeline} />
      <Year2040Scene active={activeYear === '2040'} timeline={timeline} />
    </>
  );
}
