'use client';

import { Year1990Scene } from './scenes/Year1990Scene';
import { Year2000Scene } from './scenes/Year2000Scene';
import { Year2010Scene } from './scenes/Year2010Scene';
import { Year2020Scene } from './scenes/Year2020Scene';
import { Year2030Scene } from './scenes/Year2030Scene';
import { Year2040Scene } from './scenes/Year2040Scene';
import { TimelineArchitecture } from './TimelineArchitecture';
import { eraConfigs, YEAR_ORDER } from './config';
import { useExperienceStore } from './store';
import type { YearId } from '@/content/data';
import type { ViewMode } from './types';

function NeighborVeil({ year, active, viewMode }: { year: YearId; active: boolean; viewMode: ViewMode }) {
  if (active || viewMode === 'interface' || viewMode === 'text') return null;
  const opacity = viewMode === 'timeline' ? 0.42 : 0.52;
  return (
    <mesh position={[eraConfigs[year].stationX, 3.0, 4.02]} renderOrder={24} raycast={() => {}}>
      <planeGeometry args={[10.35, 6.05]} />
      <meshBasicMaterial color="#030509" transparent opacity={opacity} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

export function ExperienceWorld() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const quality = useExperienceStore((state) => state.quality);
  const transition = useExperienceStore((state) => state.transition);
  const timeline = viewMode === 'timeline';
  const index = YEAR_ORDER.indexOf(activeYear);
  const mountedYears = new Set<YearId>([activeYear]);
  const previous = YEAR_ORDER[index - 1];
  const next = YEAR_ORDER[index + 1];
  if (previous) mountedYears.add(previous);
  if (next) mountedYears.add(next);
  if (transition?.id !== 'time-jump') {
    if (transition?.from) mountedYears.add(transition.from);
    if (transition?.to) mountedYears.add(transition.to);
  }
  if (activeYear === '2030' || activeYear === '2040' || transition?.id === 'agents-to-echo') {
    mountedYears.add('2030');
    mountedYears.add('2040');
  }

  return (
    <>
      <color attach="background" args={[quality === 'lite' ? '#090b10' : '#05070b']} />
      <fog attach="fog" args={['#05070b', 20, quality === 'lite' ? 62 : 104]} />
      <ambientLight intensity={quality === 'lite' ? 0.72 : 0.38} color="#b8c7e8" />
      <directionalLight
        position={[5, 14, 10]}
        intensity={quality === 'high' ? 2.35 : 1.55}
        color="#fff4df"
        castShadow={quality === 'high'}
        shadow-mapSize-width={quality === 'high' ? 1536 : 768}
        shadow-mapSize-height={quality === 'high' ? 1536 : 768}
        shadow-bias={-0.00045}
      />
      <hemisphereLight args={['#a8bee4', '#251c19', 0.6]} />
      <TimelineArchitecture />
      {mountedYears.has('1990') && <Year1990Scene active={activeYear === '1990'} timeline={timeline} />}
      {mountedYears.has('2000') && <Year2000Scene active={activeYear === '2000'} timeline={timeline} />}
      {mountedYears.has('2010') && <Year2010Scene active={activeYear === '2010'} timeline={timeline} />}
      {mountedYears.has('2020') && <Year2020Scene active={activeYear === '2020'} timeline={timeline} />}
      {mountedYears.has('2030') && <Year2030Scene active={activeYear === '2030'} timeline={timeline} detail={activeYear === '2030'} />}
      {mountedYears.has('2040') && <Year2040Scene active={activeYear === '2040'} timeline={timeline} detail={activeYear === '2040'} />}
      {[...mountedYears].map((year) => <NeighborVeil key={`veil-${year}`} year={year} active={year === activeYear} viewMode={viewMode} />)}
    </>
  );
}
