'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { Html, useCursor } from '@react-three/drei';
import type { ComponentType, LazyExoticComponent } from 'react';
import { TimelineArchitecture } from './TimelineArchitecture';
import { eraConfigs, getEraCssVariables, YEAR_ORDER } from './config';
import { useExperienceActions } from './ExperienceContext';
import { useExperienceStore } from './store';
import type { YearId } from '@/content/data';
import type { ViewMode } from './types';
import { FUTURE_YEARS, preloadExperienceScene, sceneLoaders, type ExperienceSceneProps } from './sceneLoaders';

const sceneComponents = Object.fromEntries(
  YEAR_ORDER.map((year) => [year, lazy(sceneLoaders[year])])
) as Record<YearId, LazyExoticComponent<ComponentType<ExperienceSceneProps>>>;

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
  if (active || viewMode === 'interface' || viewMode === 'text' || viewMode === 'timeline') return null;
  return (
    <mesh position={[eraConfigs[year].stationX, 3.0, 4.02]} renderOrder={24} raycast={() => {}}>
      <planeGeometry args={[10.35, 6.05]} />
      <meshBasicMaterial color="#030509" transparent opacity={0.52} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * Chapters overview: each room is one large, labelled target. Hover or focus
 * highlights a room (lighting it); selecting it flies the camera inside.
 */
function OverviewRoom({ year, highlighted, visited }: { year: YearId; highlighted: boolean; visited: boolean }) {
  const config = eraConfigs[year];
  const { navigateToYear } = useExperienceActions();
  const setActiveYear = useExperienceStore((state) => state.setActiveYear);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');
  return (
    <group position={[config.stationX, 0, 0]}>
      <mesh
        position={[0, 2.9, 0.2]}
        onClick={(event) => { event.stopPropagation(); navigateToYear(year); }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); setActiveYear(year); }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[10, 6, 7]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 6.3, 3.4]} raycast={() => {}}>
        <boxGeometry args={[9.6, 0.05, 0.05]} />
        <meshBasicMaterial color={config.accent} transparent opacity={highlighted ? 0.95 : 0.25} toneMapped={false} />
      </mesh>
      <Html position={[0, 8.3, 0.4]} center zIndexRange={[9, 0]} className="overview-label-anchor">
        <button
          type="button"
          className={`overview-label${highlighted ? ' is-active' : ''}`}
          style={getEraCssVariables(year) as React.CSSProperties}
          onClick={() => navigateToYear(year)}
          onFocus={() => setActiveYear(year)}
          onPointerEnter={() => setActiveYear(year)}
          aria-label={`${year} ${config.chapterName}, experienced through ${config.experienceName}${visited ? ', visited' : ''}`}
          aria-current={highlighted ? 'true' : undefined}
        >
          <span>{year}</span>
          <b>{config.chapterName}</b>
          <em>{config.experienceName}</em>
        </button>
      </Html>
    </group>
  );
}

export function ExperienceWorld() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const quality = useExperienceStore((state) => state.quality);
  const visits = useExperienceStore((state) => state.yearVisits);
  const [detailedFutureYear, setDetailedFutureYear] = useState<YearId | null>(null);
  const overview = viewMode === 'timeline';
  const index = YEAR_ORDER.indexOf(activeYear);
  const previous = YEAR_ORDER[index - 1];
  const next = YEAR_ORDER[index + 1];
  const visibleYears = new Set<YearId>(overview ? YEAR_ORDER : [activeYear]);
  if (previous) visibleYears.add(previous);
  if (next) visibleYears.add(next);
  if (activeYear === '2030' || activeYear === '2040') {
    visibleYears.add('2030');
    visibleYears.add('2040');
  }

  const futureYear = FUTURE_YEARS.includes(activeYear as (typeof FUTURE_YEARS)[number]);
  const proxyOnly = quality === 'lite' && futureYear;
  const renderDetailedScene = !futureYear || (quality !== 'lite' && detailedFutureYear === activeYear);
  // The overview shows every room as a real scene (not a grey proxy) unless Lite is active.
  const sceneYears = overview && quality !== 'lite' ? YEAR_ORDER : [activeYear];

  useEffect(() => {
    setDetailedFutureYear(null);
    if (!futureYear || quality === 'lite' || overview) return;
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const reveal = () => setDetailedFutureYear(activeYear);
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(reveal, { timeout: 700 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(reveal, 260);
    return () => window.clearTimeout(timer);
  }, [activeYear, futureYear, overview, quality]);

  useEffect(() => {
    const device = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (device.connection?.saveData || quality === 'lite') return;
    const adjacent = [previous, next].filter(Boolean) as YearId[];
    const targets = new Set<YearId>(FUTURE_YEARS);
    adjacent.forEach((year) => targets.add(year));
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const preload = () => targets.forEach((year) => { void preloadExperienceScene(year); });
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(preload, { timeout: 1600 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(preload, 900);
    return () => window.clearTimeout(timer);
  }, [activeYear, next, previous, quality]);

  return (
    <>
      <color attach="background" args={[quality === 'lite' ? '#090b10' : '#05070b']} />
      <fog attach="fog" args={['#05070b', overview ? 48 : 20, overview ? 150 : quality === 'lite' ? 62 : 104]} />
      <ambientLight intensity={(quality === 'lite' ? 0.72 : 0.38) + (overview ? 0.22 : 0)} color="#b8c7e8" />
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
      {[...visibleYears].filter((year) => !sceneYears.includes(year)).map((year) => <EraProxy key={`proxy-${year}`} year={year} />)}
      {sceneYears.map((year) => {
        const Scene = sceneComponents[year];
        const isActive = year === activeYear;
        const future = FUTURE_YEARS.includes(year as (typeof FUTURE_YEARS)[number]);
        if (isActive && proxyOnly) return <EraProxy key={`scene-${year}`} year={year} />;
        return (
          <Suspense key={`scene-${year}`} fallback={<EraProxy year={year} />}>
            <Scene active={isActive} timeline={overview} detail={future ? !overview && isActive && renderDetailedScene : true} />
          </Suspense>
        );
      })}
      {overview && YEAR_ORDER.map((year) => <OverviewRoom key={`overview-${year}`} year={year} highlighted={year === activeYear} visited={visits[year] > 0} />)}
      {[...visibleYears].map((year) => <NeighborVeil key={`veil-${year}`} year={year} active={year === activeYear} viewMode={viewMode} />)}
    </>
  );
}
