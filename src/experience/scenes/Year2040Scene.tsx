'use client';

import { useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, Dust, Hoverable } from './SceneUtils';
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
      const u = random();
      const v = random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
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
  sphere([0, 3.1, 0], 0.58, 430);
  cylinder([0, 1.78, 0], 0.76, 2.1, 820);
  cylinder([-0.96, 1.85, 0], 0.21, 1.75, 240);
  cylinder([0.96, 1.85, 0], 0.21, 1.75, 240);
  cylinder([-0.38, 0.25, 0], 0.27, 1.8, 280);
  cylinder([0.38, 0.25, 0], 0.27, 1.8, 280);
  return new Float32Array(points);
}

function HologramFigure({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => createHologramPoints(), []);
  useFrame(({ clock }) => {
    if (!ref.current || !material.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.16;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.75) * 0.045;
    material.current.opacity = active ? 0.7 + Math.sin(clock.elapsedTime * 2.2) * 0.08 : 0.2;
  });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial ref={material} color="#b8a8ff" size={0.034} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export function Year2040Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2040'];
  const { navigateToYear, openInterface, discover } = useExperienceActions();
  const shards = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!shards.current) return;
    shards.current.rotation.y = clock.elapsedTime * (active ? 0.11 : 0.025);
    shards.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.08;
  });
  const activate = () => timeline ? navigateToYear('2040') : openInterface();
  const shardColors = ['#a88cff', '#75d9ff', '#ffb7d7', '#86e6ba', '#ffe7a1', '#f7f6ff'];

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell
        floorColor="#e8e5e2"
        wallColor="#edeae6"
        sideColor="#ddd9e0"
        ceilingColor="#f6f4f1"
        trimColor="#9d98aa"
        accent={config.accent}
        openLeft
        active={active}
        floorRoughness={0.28}
      />
      <Dust center={[0, 3.0, 0]} spread={[9.2, 5.8, 7]} color="#d4c9ff" active={active} count={95} />
      <GlassPanel position={[-5.08, 2.72, 0]} size={[4.6, 4.95, 0.05]} color="#c8f6ff" opacity={active ? 0.14 : 0.07} rotation={[0, Math.PI / 2, 0]} frameColor="#9f9aac" />
      <mesh position={[-4.98, 4.85, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[3.8, 0.22]} /><meshBasicMaterial color="#bba9ff" transparent opacity={active ? 0.4 : 0.1} /></mesh>

      <GlassPanel position={[0, 3.55, -3.35]} size={[7.6, 4.5, 0.055]} color="#d7efff" opacity={active ? 0.19 : 0.1} frameColor="#aba8b4" />
      <mesh position={[0, 3.55, -3.39]}><planeGeometry args={[7.35, 4.25]} /><meshBasicMaterial color="#d8ecf3" transparent opacity={0.3} /></mesh>
      <mesh position={[0, 5.2, -3.25]}><planeGeometry args={[6.6, 0.5]} /><meshBasicMaterial color="#fff8df" transparent opacity={0.35} /></mesh>

      {[-3.7, 3.7].map((x, index) => (
        <group key={x} position={[x, 2.4, -2.85]}>
          <mesh castShadow><cylinderGeometry args={[0.26, 0.34, 4.7, 28]} /><meshStandardMaterial color="#e7e1dd" roughness={0.32} metalness={0.08} /></mesh>
          <mesh position={[0, 2.28, 0]}><sphereGeometry args={[0.34, 22, 16]} /><meshStandardMaterial color={index ? '#d9cfff' : '#c8f4ef'} emissive={index ? '#a88cff' : '#65d7c7'} emissiveIntensity={active ? 0.35 : 0.08} /></mesh>
        </group>
      ))}
      {[-1, 0, 1].map((offset, index) => (
        <mesh key={offset} position={[offset * 2.8, 3.25, -3.0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[2.2 - index * 0.08, 0.08, 12, 56, Math.PI]} />
          <meshStandardMaterial color="#c9c3cf" metalness={0.22} roughness={0.34} />
        </mesh>
      ))}
      <LightBar position={[-2.7, 5.55, -2.45]} length={3.0} color="#fff5df" intensity={active ? 1.05 : 0.28} />
      <LightBar position={[2.7, 5.55, -2.45]} length={3.0} color="#ddd2ff" intensity={active ? 1.15 : 0.28} />

      <mesh position={[0, -0.11, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.25, 72]} />
        <meshPhysicalMaterial color="#bce7ea" transparent opacity={0.48} roughness={0.07} metalness={0.02} clearcoat={1} clearcoatRoughness={0.04} />
      </mesh>
      <mesh position={[0, -0.14, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.55, 4.28, 72]} />
        <meshStandardMaterial color="#d8d2dd" roughness={0.32} metalness={0.12} />
      </mesh>

      <Hoverable label="Contact Kevin Echo" onClick={activate}>
        <group position={[0, 0.65, 0]}>
          <mesh position={[0, -0.34, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.65, 2.05, 0.3, 64]} />
            <meshStandardMaterial color="#d8d3df" roughness={0.28} metalness={0.12} />
          </mesh>
          <mesh position={[0, -0.17, 0]}>
            <cylinderGeometry args={[1.4, 1.62, 0.12, 64]} />
            <meshPhysicalMaterial color="#cbbcff" transparent opacity={0.35} roughness={0.08} clearcoat={1} />
          </mesh>
          <HologramFigure active={active} />
          <pointLight position={[0, 1.8, 0]} color="#b7a1ff" intensity={active ? 8 : 1.2} distance={8} decay={2} />
        </group>
      </Hoverable>

      <group ref={shards} position={[0, 2.55, 0]}>
        {shardColors.map((color, index) => {
          const angle = (index / shardColors.length) * Math.PI * 2;
          return (
            <Hoverable key={color} label={`Memory shard ${index + 1}`} onClick={() => { if (index === 0) discover('signal-fragment', '2040'); if (index === 5) discover('next-layer-message', '2040'); }}>
              <mesh position={[Math.cos(angle) * 2.85, 0.25 + Math.sin(index) * 0.5, Math.sin(angle) * 1.9]} rotation={[angle * 0.3, angle, angle * 0.2]} castShadow>
                <octahedronGeometry args={[0.32 + (index % 2) * 0.08]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.05 : 0.18} transparent opacity={0.84} />
              </mesh>
            </Hoverable>
          );
        })}
      </group>

      <group position={[-3.75, 2.2, -1.85]}>
        <ArchiveColumn position={[0, 0, 0]} color="#b8a8ff" active={active} height={3.5} radius={0.32} />
        <ArchiveColumn position={[0.78, -0.2, 0.15]} color="#75d9ff" active={active} height={3.1} radius={0.28} />
      </group>
      <group position={[3.75, 2.2, -1.85]}>
        <ArchiveColumn position={[0, 0, 0]} color="#86e6ba" active={active} height={3.5} radius={0.32} />
        <ArchiveColumn position={[-0.78, -0.2, 0.15]} color="#ffe7a1" active={active} height={3.1} radius={0.28} />
      </group>

      <Hoverable label="Thought interpreter" onClick={activate}>
        <group position={[0, 0.55, 2.75]}>
          <RoundedBox args={[3.5, 0.75, 1.15]} radius={0.22} smoothness={4} castShadow><meshStandardMaterial color="#e0dce3" roughness={0.28} metalness={0.12} /></RoundedBox>
          <GlassPanel position={[0, 0.38, -0.1]} size={[2.9, 0.58, 0.04]} color="#d9cfff" opacity={active ? 0.22 : 0.09} rotation={[-0.28, 0, 0]} frameColor="#aaa3b3" />
          {[-0.85, 0, 0.85].map((x, index) => <mesh key={x} position={[x, 0.05, 0.58]}><sphereGeometry args={[0.12, 18, 18]} /><meshStandardMaterial color={['#75d9ff', '#b8a8ff', '#86e6ba'][index]} emissive={['#2b8fab', '#6548c3', '#2a9e70'][index]} emissiveIntensity={active ? 0.6 : 0.12} /></mesh>)}
        </group>
      </Hoverable>

      <Plant position={[-4.1, 0.05, 2.25]} scale={1.35} potColor="#e9e2dd" leafColor="#6e9c7b" />
      <Plant position={[4.05, 0.05, 2.2]} scale={1.2} potColor="#e7e0da" leafColor="#78a083" />

      <ArtifactMesh id="next-layer-message" year="2040" position={[4.3, 1.0, -0.8]} color="#a88cff" active={active} shape="sphere" scale={1.25} />
      <spotLight position={[0, 5.8, 2.6]} target-position={[0, 1.8, 0]} color="#fff6e7" intensity={active ? 5.6 : 1.1} distance={15} angle={0.72} penumbra={0.72} castShadow={active} />
      <pointLight position={[0, 4.8, 2]} color="#b7a1ff" intensity={active ? 4.8 : 0.8} distance={12} decay={2} />
      <pointLight position={[-4.2, 3.0, 0]} color="#64d9ff" intensity={active ? 2.1 : 0.35} distance={8} decay={2} />
    </group>
  );
}
