'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox, useCursor } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ArtifactId } from '../artifacts';
import type { YearId } from '@/content/data';
import { useExperienceActions } from '../ExperienceContext';
import { useExperienceStore } from '../store';

export function Hoverable({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');
  return (
    <group
      onClick={(event) => { event.stopPropagation(); onClick(); }}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      userData={{ label }}
      scale={hovered ? 1.035 : 1}
    >
      {children}
    </group>
  );
}

export function DeviceScreen({
  position = [0, 0, 0],
  size = [4, 2.4],
  color = '#10182c',
  emissive = '#19264a',
  active = false,
  radius = 0.12
}: {
  position?: [number, number, number]; size?: [number, number]; color?: string; emissive?: string; active?: boolean; radius?: number;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!material.current) return;
    const pulse = active ? 0.55 + Math.sin(clock.elapsedTime * 1.5) * 0.08 : 0.18;
    material.current.emissiveIntensity = pulse;
  });
  return (
    <RoundedBox position={position} args={[size[0], size[1], 0.12]} radius={radius} smoothness={3}>
      <meshStandardMaterial ref={material} color={color} emissive={emissive} roughness={0.38} metalness={0.1} />
    </RoundedBox>
  );
}

export function ArtifactMesh({
  id, year, position, color, active, shape = 'box', scale = 1
}: {
  id: ArtifactId; year: YearId; position: [number, number, number]; color: string; active: boolean; shape?: 'box' | 'sphere' | 'octahedron' | 'cylinder'; scale?: number;
}) {
  const { discover } = useExperienceActions();
  const found = useExperienceStore((state) => state.artifacts[id].discoveredYears.includes(year));
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (found ? 0.55 : 0.25);
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.3 + position[0]) * (active ? 0.08 : 0.025);
  });
  const geometry = shape === 'sphere' ? <sphereGeometry args={[0.28 * scale, 18, 18]} />
    : shape === 'octahedron' ? <octahedronGeometry args={[0.32 * scale]} />
      : shape === 'cylinder' ? <cylinderGeometry args={[0.28 * scale, 0.28 * scale, 0.12 * scale, 24]} />
        : <boxGeometry args={[0.46 * scale, 0.34 * scale, 0.14 * scale]} />;
  return (
    <Hoverable label={`Discover ${id}`} onClick={() => discover(id, year)}>
      <mesh ref={ref} position={position} castShadow>
        {geometry}
        <meshStandardMaterial color={found ? '#ffffff' : color} emissive={color} emissiveIntensity={found ? 1.3 : active ? 0.55 : 0.12} roughness={0.25} />
      </mesh>
    </Hoverable>
  );
}

export function Dust({ center, count = 80, spread = [8, 5, 7], color = '#ffffff', active = true }: {
  center: [number, number, number]; count?: number; spread?: [number, number, number]; color?: string; active?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    let seed = 1337;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = center[0] + (random() - 0.5) * spread[0];
      array[i * 3 + 1] = center[1] + (random() - 0.5) * spread[1];
      array[i * 3 + 2] = center[2] + (random() - 0.5) * spread[2];
    }
    return array;
  }, [center, count, spread]);
  useFrame(({ clock }) => {
    if (ref.current && active) ref.current.rotation.y = clock.elapsedTime * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.018} transparent opacity={active ? 0.5 : 0.15} depthWrite={false} />
    </points>
  );
}

export function Pedestal({ position, width = 9, depth = 7, color = '#15171d' }: { position: [number, number, number]; width?: number; depth?: number; color?: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[width, 0.34, depth]} radius={0.18} smoothness={3} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, -0.24, 0]} receiveShadow>
        <cylinderGeometry args={[Math.min(width, depth) * 0.32, Math.min(width, depth) * 0.36, 0.15, 48]} />
        <meshStandardMaterial color="#07080b" roughness={0.9} />
      </mesh>
    </group>
  );
}
