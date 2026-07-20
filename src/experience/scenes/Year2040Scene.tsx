'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, Dust, Hoverable, Pedestal } from './SceneUtils';

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
      const r = radius * (0.75 + random() * 0.25);
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
  sphere([0, 3.15, 0], 0.62, 420);
  cylinder([0, 1.75, 0], 0.82, 2.2, 820);
  cylinder([-1.05, 1.85, 0], 0.23, 1.9, 250);
  cylinder([1.05, 1.85, 0], 0.23, 1.9, 250);
  cylinder([-0.42, 0.15, 0], 0.3, 2.0, 300);
  cylinder([0.42, 0.15, 0], 0.3, 2.0, 300);
  return new Float32Array(points);
}

function HologramFigure({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => createHologramPoints(), []);
  useFrame(({ clock }) => {
    if (!ref.current || !material.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.22) * 0.18;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.75) * 0.05;
    material.current.opacity = active ? 0.72 + Math.sin(clock.elapsedTime * 2.2) * 0.08 : 0.18;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={material} color="#b8a8ff" size={0.035} transparent opacity={0.72} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export function Year2040Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2040'];
  const { navigateToYear, openInterface, discover } = useExperienceActions();
  const shards = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!shards.current) return;
    shards.current.rotation.y = clock.elapsedTime * (active ? 0.13 : 0.025);
    shards.current.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.12;
  });
  const activate = () => timeline ? navigateToYear('2040') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <Pedestal position={[0, -0.25, 0]} width={10.8} depth={8.5} color="#110e1d" />
      <Dust center={[0, 2.2, 0]} spread={[10, 7, 8]} color="#b8a8ff" active={active} count={180} />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.5, 72]} />
        <meshStandardMaterial color="#090713" emissive="#241a58" emissiveIntensity={active ? 0.55 : 0.08} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.6, -3.2]} receiveShadow>
        <planeGeometry args={[10.4, 6.2]} />
        <meshStandardMaterial color="#05040c" emissive="#160d36" emissiveIntensity={active ? 0.25 : 0.04} />
      </mesh>

      <Hoverable label="Contact Kevin Echo" onClick={activate}>
        <group position={[0, 0.45, 0]}>
          <HologramFigure active={active} />
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[1.65, 2.0, 0.18, 48]} />
            <meshStandardMaterial color="#1c1439" emissive="#6b52c6" emissiveIntensity={active ? 0.65 : 0.08} transparent opacity={0.72} />
          </mesh>
        </group>
      </Hoverable>

      <group ref={shards} position={[0, 2.0, 0]}>
        {['#a88cff', '#75d9ff', '#ff8dc8', '#7bffc9', '#ffe17f', '#f1f1ff'].map((color, index) => {
          const angle = (index / 6) * Math.PI * 2;
          return (
            <Hoverable key={color} label={`Memory shard ${index + 1}`} onClick={() => { if (index === 0) discover('signal-fragment', '2040'); if (index === 5) discover('next-layer-message', '2040'); }}>
              <mesh position={[Math.cos(angle) * 2.7, 0.2 + Math.sin(index) * 0.55, Math.sin(angle) * 2.0]} rotation={[angle * 0.3, angle, angle * 0.2]} castShadow>
                <octahedronGeometry args={[0.34 + (index % 2) * 0.08]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.15 : 0.18} transparent opacity={0.82} />
              </mesh>
            </Hoverable>
          );
        })}
      </group>

      <ArtifactMesh id="next-layer-message" year="2040" position={[3.75, 0.85, -0.8]} color="#a88cff" active={active} shape="sphere" scale={1.25} />
      <pointLight position={[0, 4.8, 2]} color="#ad95ff" intensity={active ? 11 : 1.8} distance={13} decay={2} />
      <pointLight position={[0, 1.5, -1]} color="#64d9ff" intensity={active ? 5 : 0.7} distance={8} decay={2} />
    </group>
  );
}
