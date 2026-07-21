'use client';

import { useEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
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
        <meshStandardMaterial color={future ? '#d7e5e5' : '#171b23'} roughness={future ? 0.4 : 0.84} metalness={future ? 0.18 : 0.04} />
      </RoundedBox>
      <mesh position={[0, 4.94, 0]} receiveShadow>
        <boxGeometry args={[length, 0.16, future ? 3.45 : 2.8]} />
        <meshStandardMaterial color={future ? '#eaf1f0' : '#252a34'} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.18, -1.32]}><boxGeometry args={[length, 0.035, 0.045]} /><meshBasicMaterial color={fromColor} transparent opacity={0.58} /></mesh>
      <mesh position={[0, -0.18, 1.32]}><boxGeometry args={[length, 0.035, 0.045]} /><meshBasicMaterial color={toColor} transparent opacity={0.58} /></mesh>
      {future ? (
        <>
          <mesh position={[0, 2.35, -1.7]}>
            <boxGeometry args={[length, 4.55, 0.065]} />
            <meshPhysicalMaterial color="#c8f3f7" transparent opacity={0.18} roughness={0.06} clearcoat={1} depthWrite={false} />
          </mesh>
          <mesh position={[0, 2.35, 1.7]}>
            <boxGeometry args={[length, 4.55, 0.065]} />
            <meshPhysicalMaterial color="#e0d4ff" transparent opacity={0.15} roughness={0.06} clearcoat={1} depthWrite={false} />
          </mesh>
          <mesh position={[0, 4.62, 0]}>
            <boxGeometry args={[length, 0.05, 3.25]} />
            <meshPhysicalMaterial color="#f2ffff" transparent opacity={0.12} roughness={0.03} depthWrite={false} />
          </mesh>
          <mesh position={[0, 2.35, -1.74]}><boxGeometry args={[length, 0.07, 0.08]} /><meshStandardMaterial color="#6f9095" metalness={0.55} roughness={0.25} /></mesh>
          <mesh position={[0, 2.35, 1.74]}><boxGeometry args={[length, 0.07, 0.08]} /><meshStandardMaterial color="#928aa3" metalness={0.55} roughness={0.25} /></mesh>
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

function FutureDataConduit() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const transition = useExperienceStore((state) => state.transition);
  const pulse = useRef<THREE.Mesh>(null);
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
  useFrame(({ clock }) => {
    if (!transitionActive || !pulse.current) return;
    const t = (clock.elapsedTime * 0.48) % 1;
    pulse.current.position.copy(data.curve.getPointAt(t));
    pulse.current.scale.setScalar(1.45 + Math.sin(clock.elapsedTime * 5) * 0.12);
  });
  if (!transitionActive) return null;
  return (
    <group>
      <mesh geometry={data.geometry}>
        <meshStandardMaterial color="#a6ecff" emissive="#67dff7" emissiveIntensity={1.0} transparent opacity={0.72} />
      </mesh>
      <mesh ref={pulse}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#ffffff" emissive={activeYear === '2040' ? '#bfaaff' : '#73ecff'} emissiveIntensity={3.0} />
      </mesh>
      <pointLight position={[24, 1.6, 0]} color={activeYear === '2040' ? '#bba2ff' : '#78e8ff'} intensity={1.3} distance={5.5} decay={2} />
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
      <FutureDataConduit />
    </group>
  );
}
