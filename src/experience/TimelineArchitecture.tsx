'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs, YEAR_ORDER } from './config';
import { useExperienceStore } from './store';

function Corridor({
  from,
  to,
  fromColor,
  toColor,
  future = false
}: {
  from: number;
  to: number;
  fromColor: string;
  toColor: string;
  future?: boolean;
}) {
  const midpoint = (from + to) / 2;
  const roomHalf = 5.25;
  const length = Math.max(1.35, to - from - roomHalf * 2 + 0.08);
  return (
    <group position={[midpoint, 0, 0]}>
      <RoundedBox position={[0, -0.32, 0]} args={[length, 0.24, future ? 3.45 : 2.8]} radius={0.06} smoothness={2} receiveShadow>
        <meshStandardMaterial color={future ? '#6f5840' : '#171b23'} roughness={future ? 0.56 : 0.84} metalness={future ? 0.08 : 0.04} />
      </RoundedBox>
      <mesh position={[0, 4.94, 0]} receiveShadow>
        <boxGeometry args={[length, 0.16, future ? 3.45 : 2.8]} />
        <meshStandardMaterial color={future ? '#2a1b11' : '#252a34'} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.18, -1.32]}><boxGeometry args={[length, 0.035, 0.045]} /><meshBasicMaterial color={fromColor} transparent opacity={0.58} /></mesh>
      <mesh position={[0, -0.18, 1.32]}><boxGeometry args={[length, 0.035, 0.045]} /><meshBasicMaterial color={toColor} transparent opacity={0.58} /></mesh>
      {future ? (
        <>
          <mesh position={[0, 2.35, -1.7]}>
            <boxGeometry args={[length, 4.55, 0.065]} />
            <meshPhysicalMaterial color="#f2c47e" transparent opacity={0.14} roughness={0.08} clearcoat={1} depthWrite={false} />
          </mesh>
          <mesh position={[0, 2.35, 1.7]}>
            <boxGeometry args={[length, 4.55, 0.065]} />
            <meshPhysicalMaterial color="#ff6a35" transparent opacity={0.12} roughness={0.08} clearcoat={1} depthWrite={false} />
          </mesh>
          <mesh position={[0, 4.62, 0]}>
            <boxGeometry args={[length, 0.05, 3.25]} />
            <meshPhysicalMaterial color="#ffe4b0" transparent opacity={0.1} roughness={0.06} depthWrite={false} />
          </mesh>
          <mesh position={[0, 2.35, -1.74]}><boxGeometry args={[length, 0.07, 0.08]} /><meshStandardMaterial color="#8a6646" metalness={0.3} roughness={0.4} /></mesh>
          <mesh position={[0, 2.35, 1.74]}><boxGeometry args={[length, 0.07, 0.08]} /><meshStandardMaterial color="#9d4527" metalness={0.3} roughness={0.4} /></mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 2.35, -1.43]} receiveShadow><boxGeometry args={[length, 4.65, 0.1]} /><meshStandardMaterial color="#171a21" roughness={0.9} /></mesh>
          <mesh position={[0, 2.35, 1.43]} receiveShadow><boxGeometry args={[length, 4.65, 0.1]} /><meshStandardMaterial color="#171a21" roughness={0.9} /></mesh>
          <mesh position={[0, 4.5, 0]}><boxGeometry args={[length * 0.78, 0.04, 0.05]} /><meshBasicMaterial color={toColor} transparent opacity={0.22} /></mesh>
        </>
      )}
    </group>
  );
}

function FutureMemoryConduit() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const transition = useExperienceStore((state) => state.transition);
  const motion = useExperienceStore((state) => state.motion);
  const coexistence = useExperienceStore((state) => state.futureJourney.coexistence);
  const pulse = useRef<THREE.Group>(null);
  const data = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(22.55, 1.15, -1.1),
      new THREE.Vector3(23.25, 1.5, -0.58),
      new THREE.Vector3(24, 1.72, 0),
      new THREE.Vector3(24.75, 1.5, 0.58),
      new THREE.Vector3(25.45, 1.15, 1.1)
    ]);
    return { curve, geometry: new THREE.TubeGeometry(curve, 48, 0.055, 8, false) };
  }, []);
  useEffect(() => () => data.geometry.dispose(), [data]);
  const transitionActive = transition?.id === 'agents-to-echo';
  const decision = coexistence.consent[coexistence.activeMoment];
  const carried = coexistence.keptMoments.includes(coexistence.activeMoment);
  const memoryColor = decision === 'refused' ? '#ff5738' : carried ? '#ffc261' : '#f2d7a0';
  useFrame(({ clock }) => {
    if (!transitionActive || !pulse.current) return;
    const duration = motion === 'reduced' ? 36 : 660;
    const progress = Math.min(1, Math.max(0, (Date.now() - (transition?.startedAt ?? Date.now())) / duration));
    const t = transition?.to === '2030' ? 1 - progress : progress;
    pulse.current.position.copy(data.curve.getPointAt(t));
    pulse.current.rotation.y = clock.elapsedTime * .62;
    pulse.current.scale.setScalar((carried ? 1.08 : .92) + Math.sin(clock.elapsedTime * 5) * .06);
  });
  if (!transitionActive) return null;
  return (
    <group>
      <mesh geometry={data.geometry}>
        <meshStandardMaterial color="#f2bd72" emissive="#ff7f2c" emissiveIntensity={.82} transparent opacity={.58} />
      </mesh>
      <group ref={pulse} userData={{ label: `${coexistence.activeMoment} memory crossing from coexistence to consciousness`, consent: decision }}>
        <mesh castShadow><cylinderGeometry args={[.16, .14, .29, 24]} /><meshStandardMaterial color="#382419" emissive={memoryColor} emissiveIntensity={carried ? 1.6 : .55} roughness={.4} /></mesh>
        <mesh position={[.16, .02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.09, .025, 8, 18]} /><meshStandardMaterial color="#f4ddae" emissive={memoryColor} emissiveIntensity={1.2} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.31, .014, 8, decision === 'refused' ? 12 : 32]} /><meshStandardMaterial color={memoryColor} emissive={memoryColor} emissiveIntensity={1.5} transparent opacity={.75} /></mesh>
        <Html center position={[0, .38, 0]} zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
          <span style={{ display: 'block', whiteSpace: 'nowrap', padding: '0.18rem 0.38rem', border: `1px solid ${memoryColor}`, borderRadius: '999px', color: '#fff0d0', background: 'rgba(10, 6, 3, .9)', font: '700 8px/1 ui-monospace, monospace', letterSpacing: '.08em', boxShadow: `0 0 18px ${memoryColor}55` }}>{carried ? 'KEPT WITH PERMISSION' : decision === 'refused' ? 'LET GO' : '07:12 / MUG'}</span>
        </Html>
      </group>
      <pointLight position={[24, 1.6, 0]} color={activeYear === '2040' ? '#ff6a35' : memoryColor} intensity={carried ? 2.4 : 1.3} distance={carried ? 7 : 5.5} decay={2} />
    </group>
  );
}

export function TimelineArchitecture() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  return (
    <group>
      <mesh position={[0, -0.53, 3.15]} receiveShadow>
        <boxGeometry args={[73, 0.18, 1.45]} />
        <meshStandardMaterial color="#0f1218" roughness={0.82} metalness={0.06} />
      </mesh>
      <mesh position={[0, -0.41, 2.72]}>
        <boxGeometry args={[72.5, 0.028, 0.045]} />
        <meshBasicMaterial color={eraConfigs[activeYear].accent} transparent opacity={viewMode === 'timeline' ? 0.58 : 0.28} />
      </mesh>
      {YEAR_ORDER.slice(0, -1).map((year, index) => {
        const next = YEAR_ORDER[index + 1];
        return <Corridor key={`${year}-${next}`} from={eraConfigs[year].stationX} to={eraConfigs[next].stationX} fromColor={eraConfigs[year].accent} toColor={eraConfigs[next].accent} future={year === '2030'} />;
      })}
      {YEAR_ORDER.map((year) => (
        <group key={year} position={[eraConfigs[year].stationX, 0, 0]}>
          <RoundedBox position={[0, 5.98, -0.6]} args={[9.8, 0.12, 0.16]} radius={0.04} smoothness={2}>
            <meshStandardMaterial color="#252a34" roughness={0.68} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 5.94, -0.48]}><boxGeometry args={[8.4, 0.025, 0.025]} /><meshBasicMaterial color={eraConfigs[year].accent} transparent opacity={activeYear === year ? 0.75 : 0.16} /></mesh>
        </group>
      ))}
      <FutureMemoryConduit />
    </group>
  );
}
