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
  const motion = useExperienceStore((state) => state.motion);
  const receipt = useExperienceStore((state) => state.futureJourney.mission.artifact);
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
  const receiptColor = receipt?.status === 'stopped' ? '#ff718f' : receipt?.status === 'reframed' ? '#ffd66b' : '#bafff2';
  useFrame(({ clock }) => {
    if (!transitionActive || !pulse.current) return;
    const duration = motion === 'reduced' ? 36 : 660;
    const progress = Math.min(1, Math.max(0, (Date.now() - (transition?.startedAt ?? Date.now())) / duration));
    const t = transition?.to === '2030' ? 1 - progress : progress;
    pulse.current.position.copy(data.curve.getPointAt(t));
    pulse.current.rotation.y = clock.elapsedTime * (receipt ? 1.1 : 2.2);
    pulse.current.scale.setScalar((receipt ? 1 : 1.45) + Math.sin(clock.elapsedTime * 5) * 0.08);
  });
  if (!transitionActive) return null;
  return (
    <group>
      <mesh geometry={data.geometry}>
        <meshStandardMaterial color="#a6ecff" emissive="#67dff7" emissiveIntensity={1.0} transparent opacity={0.72} />
      </mesh>
      <group ref={pulse} userData={{ label: receipt ? `Receipt ${receipt.receiptId} in transit` : 'Future signal in transit', receiptId: receipt?.receiptId }}>
        {receipt ? (
          <>
            <RoundedBox args={[0.62, 0.34, 0.16]} radius={0.055} smoothness={3} castShadow>
              <meshStandardMaterial color="#ffffff" emissive={receiptColor} emissiveIntensity={2.2} metalness={0.42} roughness={0.16} />
            </RoundedBox>
            <mesh position={[0, 0, 0.1]}><planeGeometry args={[0.42, 0.16]} /><meshBasicMaterial color={receiptColor} transparent opacity={0.86} /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.34, 0.018, 8, 32]} /><meshStandardMaterial color="#ffffff" emissive={receiptColor} emissiveIntensity={1.8} /></mesh>
            <Html center position={[0, 0.42, 0]} zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}>
              <span style={{ display: 'block', whiteSpace: 'nowrap', padding: '0.18rem 0.38rem', border: `1px solid ${receiptColor}`, borderRadius: '999px', color: '#f8ffff', background: 'rgba(5, 10, 16, .88)', font: '600 9px/1 ui-monospace, monospace', letterSpacing: '.08em', boxShadow: `0 0 18px ${receiptColor}66` }}>{receipt.receiptId}</span>
            </Html>
          </>
        ) : (
          <mesh>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#ffffff" emissive={activeYear === '2040' ? '#bfaaff' : '#73ecff'} emissiveIntensity={3.0} />
          </mesh>
        )}
      </group>
      <pointLight position={[24, 1.6, 0]} color={receipt ? receiptColor : activeYear === '2040' ? '#bba2ff' : '#78e8ff'} intensity={receipt ? 2.4 : 1.3} distance={receipt ? 7 : 5.5} decay={2} />
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
