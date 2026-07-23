'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { Dust, Hoverable } from './SceneUtils';
import { ArchiveColumn, GlassPanel, LightBar, Plant, RoomShell } from './EnvironmentPrimitives';

function createHologramPoints() {
  const points: number[] = [];
  let seed = 4187;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const sphere = (center: [number, number, number], radius: number, count: number) => {
    for (let i = 0; i < count; i += 1) {
      const theta = 2 * Math.PI * random();
      const phi = Math.acos(2 * random() - 1);
      const r = radius * (0.76 + random() * 0.24);
      points.push(center[0] + r * Math.sin(phi) * Math.cos(theta), center[1] + r * Math.cos(phi), center[2] + r * Math.sin(phi) * Math.sin(theta));
    }
  };
  const cylinder = (center: [number, number, number], radius: number, height: number, count: number) => {
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const r = radius * (0.35 + random() * 0.65);
      points.push(center[0] + Math.cos(angle) * r, center[1] + (random() - 0.5) * height, center[2] + Math.sin(angle) * r);
    }
  };
  sphere([0, 3.05, 0], 0.52, 420);
  cylinder([0, 2.52, 0], 0.15, 0.38, 120);
  cylinder([0, 1.78, 0], 0.66, 1.7, 800);
  cylinder([-0.88, 1.82, 0], 0.17, 1.58, 250);
  cylinder([0.88, 1.82, 0], 0.17, 1.58, 250);
  cylinder([-0.32, 0.32, 0], 0.22, 1.58, 290);
  cylinder([0.32, 0.32, 0], 0.22, 1.58, 290);
  return new Float32Array(points);
}

function HologramFigure({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => createHologramPoints(), []);
  useFrame(({ clock }) => {
    if (!active || !ref.current || !material.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.1;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.68) * 0.03;
    material.current.opacity = 0.9 + Math.sin(clock.elapsedTime * 2) * 0.04;
  });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial ref={material} color="#eee9ff" size={0.038} transparent opacity={active ? 0.9 : 0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const shardLayout = [
  { position: [-2.15, 2.2, 0.15] as [number, number, number], color: '#a88cff' },
  { position: [-1.1, 3.0, 0.05] as [number, number, number], color: '#75d9ff' },
  { position: [1.1, 3.0, 0.05] as [number, number, number], color: '#86e6ba' },
  { position: [2.15, 2.2, 0.15] as [number, number, number], color: '#ffe7a1' },
  { position: [0, 2.45, 1.25] as [number, number, number], color: '#f7f6ff' }
];

export function Year2040Scene({ active, detail = true }: { active: boolean; timeline: boolean; detail?: boolean }) {
  const config = eraConfigs['2040'];
  const { enterYear, discover } = useExperienceActions();
  const shards = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!active || !detail || !shards.current) return;
    shards.current.rotation.y = Math.sin(clock.elapsedTime * 0.14) * 0.045;
  });

  if (!detail) {
    return (
      <group position={[config.stationX, 0, 0]}>
        <RoomShell floorColor="#0e111b" wallColor="#171725" sideColor="#111520" ceilingColor="#1b1928" trimColor="#5f5872" accent={config.accent} openLeft active={false} floorRoughness={0.32} />
        <GlassPanel position={[0, 3.5, -3.35]} size={[7.3, 4.35, 0.055]} color="#657592" opacity={0.08} frameColor="#5f5872" />
        <mesh position={[0, 0.2, -0.25]} castShadow receiveShadow><cylinderGeometry args={[1.45, 1.8, 0.3, 40]} /><meshStandardMaterial color="#292638" roughness={0.32} metalness={0.1} /></mesh>
        <mesh position={[0, 2.1, -0.25]}><capsuleGeometry args={[0.42, 1.85, 6, 16]} /><meshStandardMaterial color="#c7bbf1" emissive="#a88cff" emissiveIntensity={0.14} transparent opacity={0.32} wireframe /></mesh>
        <LightBar position={[-2.7, 5.55, -2.45]} length={3.0} color="#fff5df" intensity={0.05} />
        <LightBar position={[2.7, 5.55, -2.45]} length={3.0} color="#ddd2ff" intensity={0.06} />
      </group>
    );
  }

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#0e111b" wallColor="#171725" sideColor="#111520" ceilingColor="#1b1928" trimColor="#5f5872" accent={config.accent} openLeft active={active} floorRoughness={0.28} />
      <Dust center={[0, 3.0, 0]} spread={[9.2, 5.8, 7]} color="#d4c9ff" active={active} count={active ? 46 : 12} />

      <GlassPanel position={[0, 3.5, -3.35]} size={[7.3, 4.35, 0.055]} color="#657592" opacity={active ? 0.18 : 0.08} frameColor="#5f5872" />
      <mesh position={[0, 3.5, -3.39]}><planeGeometry args={[7.05, 4.1]} /><meshBasicMaterial color="#131827" transparent opacity={0.72} /></mesh>
      <LightBar position={[-2.7, 5.55, -2.45]} length={3.0} color="#a4efff" intensity={active ? 0.46 : 0.08} />
      <LightBar position={[2.7, 5.55, -2.45]} length={3.0} color="#c8b7ff" intensity={active ? 0.56 : 0.08} />

      {[-3.65, 3.65].map((x, index) => (
        <group key={x} position={[x, 2.35, -2.82]}>
          <mesh castShadow><cylinderGeometry args={[0.24, 0.31, 4.7, 28]} /><meshStandardMaterial color="#292a3a" roughness={0.32} metalness={0.08} /></mesh>
          <mesh position={[0, 2.28, 0]}><sphereGeometry args={[0.31, 22, 16]} /><meshStandardMaterial color={index ? '#d9cfff' : '#c8f4ef'} emissive={index ? '#a88cff' : '#65d7c7'} emissiveIntensity={active ? 0.28 : 0.05} /></mesh>
        </group>
      ))}

      <mesh position={[0, -0.105, -0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.35, 64]} /><meshPhysicalMaterial color="#18333d" transparent opacity={0.5} roughness={0.08} metalness={0.02} clearcoat={1} clearcoatRoughness={0.04} /></mesh>
      <mesh position={[0, -0.135, -0.05]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.85, 3.38, 64]} /><meshStandardMaterial color="#433d55" roughness={0.32} metalness={0.12} /></mesh>

      <Hoverable label="Contact Kevin Echo" onClick={() => enterYear('2040')}>
        <group position={[0, 0.52, -0.2]}>
          <mesh position={[0, -0.26, 0]} castShadow receiveShadow><cylinderGeometry args={[1.6, 1.95, 0.3, 56]} /><meshStandardMaterial color="#292638" roughness={0.28} metalness={0.12} /></mesh>
          <mesh position={[0, -0.09, 0]}><cylinderGeometry args={[1.34, 1.58, 0.11, 56]} /><meshPhysicalMaterial color="#cbbcff" transparent opacity={0.32} roughness={0.08} clearcoat={1} /></mesh>
          <HologramFigure active={active} />
          {active && <pointLight position={[0, 1.75, 0]} color="#b7a1ff" intensity={3.6} distance={8} decay={2} />}
        </group>
      </Hoverable>

      <group ref={shards}>
        {shardLayout.map((shard, index) => (
          <Hoverable key={shard.color} label={`Memory shard ${index + 1}`} onClick={() => { if (index === 0) discover('signal-fragment', '2040'); if (index === shardLayout.length - 1) discover('next-layer-message', '2040'); }}>
            <mesh position={shard.position} rotation={[0.2 + index * 0.08, index * 0.42, 0.1 * index]} castShadow><octahedronGeometry args={[0.22 + (index % 2) * 0.035]} /><meshStandardMaterial color={shard.color} emissive={shard.color} emissiveIntensity={active ? 0.78 : 0.1} transparent opacity={0.76} /></mesh>
          </Hoverable>
        ))}
      </group>

      <group position={[-3.48, 1.58, -2.55]}>
        <ArchiveColumn position={[-0.34, 0, 0]} color="#b8a8ff" active={active} height={3.1} radius={0.27} />
        <ArchiveColumn position={[0.34, -0.05, 0.1]} color="#75d9ff" active={active} height={2.95} radius={0.24} />
      </group>
      <group position={[3.48, 1.58, -2.55]}>
        <ArchiveColumn position={[0.34, 0, 0]} color="#86e6ba" active={active} height={3.1} radius={0.27} />
        <ArchiveColumn position={[-0.34, -0.05, 0.1]} color="#ffe7a1" active={active} height={2.95} radius={0.24} />
      </group>

      <Plant position={[-4.08, 0.05, 2.35]} scale={1.22} potColor="#302d3c" leafColor="#5c9072" />
      <Plant position={[4.0, 0.05, 2.3]} scale={1.12} potColor="#302d3c" leafColor="#65957a" />

      <spotLight position={[0, 5.8, 2.6]} target-position={[0, 2.0, -0.2]} color="#dcd3ff" intensity={active ? 2.1 : 0.26} distance={15} angle={0.72} penumbra={0.72} castShadow={active} />
      {active && <pointLight position={[0, 4.6, 1.7]} color="#b7a1ff" intensity={2.2} distance={11} decay={2} />}
      {active && <pointLight position={[-4.0, 2.8, 0]} color="#64d9ff" intensity={1.15} distance={7} decay={2} />}
    </group>
  );
}
