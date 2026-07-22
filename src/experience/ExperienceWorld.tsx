'use client';

import { lazy, Suspense, useEffect } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { TimelineArchitecture } from './TimelineArchitecture';
import { eraConfigs, YEAR_ORDER } from './config';
import { useExperienceStore } from './store';
import type { YearId } from '@/content/data';
import type { ViewMode } from './types';

type SceneProps = { active: boolean; timeline: boolean; detail?: boolean };
type SceneModule = { default: ComponentType<SceneProps> };

const sceneLoaders: Record<YearId, () => Promise<SceneModule>> = {
  '1990': () => import('./scenes/Year1990Scene').then((module) => ({ default: module.Year1990Scene as ComponentType<SceneProps> })),
  '2000': () => import('./scenes/Year2000Scene').then((module) => ({ default: module.Year2000Scene as ComponentType<SceneProps> })),
  '2010': () => import('./scenes/Year2010Scene').then((module) => ({ default: module.Year2010Scene as ComponentType<SceneProps> })),
  '2020': () => import('./scenes/Year2020Scene').then((module) => ({ default: module.Year2020Scene as ComponentType<SceneProps> })),
  '2030': () => import('./scenes/Year2030Scene').then((module) => ({ default: module.Year2030Scene as ComponentType<SceneProps> })),
  '2040': () => import('./scenes/Year2040Scene').then((module) => ({ default: module.Year2040Scene as ComponentType<SceneProps> }))
};

const sceneComponents = Object.fromEntries(
  YEAR_ORDER.map((year) => [year, lazy(sceneLoaders[year])])
) as Record<YearId, LazyExoticComponent<ComponentType<SceneProps>>>;

function EraProxy({ year }: { year: YearId }) {
  const config = eraConfigs[year];
  const x = config.stationX;
  const material = <meshStandardMaterial color="#202630" roughness={0.78} metalness={0.08} />;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, -0.12, 0]} receiveShadow><boxGeometry args={[9.4, 0.18, 6.6]} />{material}</mesh>
      <mesh position={[0, 2.8, -3.18]} receiveShadow><boxGeometry args={[9.4, 5.7, 0.12]} />{material}</mesh>
      <mesh position={[0, 5.62, 0]} receiveShadow><boxGeometry args={[9.4, 0.12, 6.6]} />{material}</mesh>
      {year === '1990' && <group position={[0, 2.35, 0]}><mesh><boxGeometry args={[4.9, 3.2, 1.7]} /><meshStandardMaterial color="#25262a" roughness={0.7} /></mesh><mesh position={[0, 0, .87]}><planeGeometry args={[3.55, 2.25]} /><meshBasicMaterial color="#5f6247" /></mesh></group>}
      {year === '2000' && <group position={[0, 2.2, 0]}><mesh><boxGeometry args={[4.4, 3.2, 1.7]} /><meshStandardMaterial color="#aaa697" roughness={0.7} /></mesh><mesh position={[3.0, -.55, 0]}><boxGeometry args={[1.25, 3.1, 1.4]} /><meshStandardMaterial color="#aaa697" roughness={0.7} /></mesh></group>}
      {year === '2010' && <group position={[0, 2.05, 0]}><mesh rotation={[-.08,0,0]}><boxGeometry args={[4.2,.2,2.4]} /><meshStandardMaterial color="#5f6670" /></mesh><mesh position={[0,1.25,-1]}><boxGeometry args={[4.15,2.35,.2]} /><meshStandardMaterial color="#69717d" /></mesh></group>}
      {year === '2020' && <group position={[0, 2.25, 0]}><mesh position={[-1.0,0,0]}><boxGeometry args={[.72,1.35,.18]} /><meshStandardMaterial color="#17181c" /></mesh><mesh position={[2.0,.2,0]}><boxGeometry args={[3.0,1.8,.18]} /><meshStandardMaterial color="#474b54" /></mesh></group>}
      {year === '2030' && <group position={[0, 1.5, 0]}><mesh><icosahedronGeometry args={[.75,1]} /><meshStandardMaterial color="#5aa9b5" emissive={config.accent} emissiveIntensity={.18} wireframe /></mesh>{[-2.3,-1.15,0,1.15,2.3].map((offset)=><mesh key={offset} position={[offset,-.8,1]}><cylinderGeometry args={[.35,.42,.45,16]} /><meshStandardMaterial color="#aebabc" /></mesh>)}</group>}
      {year === '2040' && <group position={[0, 1.7, 0]}><mesh position={[0,-1.3,0]}><cylinderGeometry args={[1.5,1.8,.3,36]} /><meshStandardMaterial color="#c8c1d4" /></mesh><mesh><capsuleGeometry args={[.42,2.2,6,14]} /><meshStandardMaterial color="#a88cff" transparent opacity={.24} wireframe /></mesh></group>}
      <pointLight position={[0, 3.2, 2]} color={config.accent} intensity={0.22} distance={7} />
    </group>
  );
}

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
  const artifactProgress = useExperienceStore((state) => state.artifacts);
  const activeArt = eraConfigs[activeYear].artDirection;
  const continuityCount = Object.values(artifactProgress).reduce((total, artifact) => total + artifact.discoveredYears.length, 0);
  const timeline = viewMode === 'timeline';
  const index = YEAR_ORDER.indexOf(activeYear);
  const visibleYears = new Set<YearId>([activeYear]);
  const previous = YEAR_ORDER[index - 1];
  const next = YEAR_ORDER[index + 1];
  if (previous) visibleYears.add(previous);
  if (next) visibleYears.add(next);
  if (activeYear === '2030' || activeYear === '2040') {
    visibleYears.add('2030');
    visibleYears.add('2040');
  }

  useEffect(() => {
    if (quality === 'lite') return;
    const adjacent = [previous, next].filter(Boolean) as YearId[];
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const preload = () => adjacent.forEach((year) => { void sceneLoaders[year](); });
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(preload, { timeout: 1200 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(preload, 700);
    return () => window.clearTimeout(timer);
  }, [activeYear, next, previous, quality]);

  const ActiveScene = sceneComponents[activeYear];

  return (
    <>
      <color attach="background" args={[quality === 'lite' ? activeArt.palette.surface : activeArt.palette.background]} />
      <fog attach="fog" args={[activeArt.fog[0], activeArt.fog[1], quality === 'lite' ? Math.min(activeArt.fog[2], 62) : activeArt.fog[2]]} />
      <ambientLight intensity={quality === 'lite' ? 0.72 : activeArt.lighting.ambient} color={activeArt.palette.haze} />
      <directionalLight
        position={[5, 14, 10]}
        intensity={(quality === 'high' ? 2.35 : 1.55) * activeArt.lighting.key}
        color={activeArt.lighting.temperature}
        castShadow={quality === 'high'}
        shadow-mapSize-width={quality === 'high' ? 1536 : 768}
        shadow-mapSize-height={quality === 'high' ? 1536 : 768}
        shadow-bias={-0.00045}
      />
      <hemisphereLight args={['#a8bee4', '#251c19', 0.6]} />
      <TimelineArchitecture />
      {[...visibleYears].filter((year) => year !== activeYear).map((year) => <EraProxy key={`proxy-${year}`} year={year} />)}
      <Suspense fallback={<EraProxy year={activeYear} />}>
        <ActiveScene active timeline={timeline} detail />
      </Suspense>
      {(activeYear === '2030' || activeYear === '2040') && continuityCount > 0 && (
        <group position={[eraConfigs[activeYear].stationX, 2.8, -1.8]}>
          {Array.from({ length: Math.min(continuityCount, 12) }, (_, index) => (
            <mesh key={index} position={[Math.sin(index * 1.7) * (1.2 + index * .08), Math.cos(index * 1.1) * 1.15, index * -.12]}>
              <octahedronGeometry args={[.08 + (index % 3) * .025]} />
              <meshStandardMaterial color={activeArt.palette.accent} emissive={activeArt.palette.accent} emissiveIntensity={1.4} />
            </mesh>
          ))}
          <pointLight color={activeArt.palette.accent} intensity={Math.min(2.8, .4 + continuityCount * .16)} distance={7} />
        </group>
      )}
      {[...visibleYears].map((year) => <NeighborVeil key={`veil-${year}`} year={year} active={year === activeYear} viewMode={viewMode} />)}
    </>
  );
}
