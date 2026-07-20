'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable, Pedestal } from './SceneUtils';

export function Year2020Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2020'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [ringOn, setRingOn] = useState(true);
  const reactions = useRef<THREE.Group>(null);
  const reactionData = useMemo(() => Array.from({ length: 12 }, (_, index) => ({
    x: -0.7 + (index % 4) * 0.42,
    y: (index % 6) * 0.28,
    z: -0.12 * (index % 3),
    phase: index * 0.7
  })), []);
  useFrame(({ clock }) => {
    if (!reactions.current || !active) return;
    reactions.current.children.forEach((child, index) => {
      child.position.y = 1.3 + reactionData[index].y + Math.sin(clock.elapsedTime * 1.15 + reactionData[index].phase) * 0.12;
      child.rotation.z = clock.elapsedTime * 0.2 + index;
    });
  });
  const activate = () => timeline ? navigateToYear('2020') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <Pedestal position={[0, -0.25, 0]} width={10.5} depth={8.2} color="#18141d" />
      <Dust center={[0, 2.2, 0]} spread={[9, 5, 7]} color="#ff86a8" active={active} />
      <mesh position={[0, 0.4, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 0.32, 3.35]} />
        <meshStandardMaterial color="#222128" roughness={0.7} />
      </mesh>

      <Hoverable label="Open KevTok" onClick={activate}>
        <group position={[0, 2.0, 0.4]} rotation={[0, -0.08, 0]}>
          <RoundedBox args={[2.15, 4.25, 0.32]} radius={0.32} smoothness={5} castShadow>
            <meshStandardMaterial color="#101115" metalness={0.52} roughness={0.27} />
          </RoundedBox>
          <DeviceScreen position={[0, 0, 0.18]} size={[1.88, 3.72]} color="#1e0f22" emissive="#ff3d7d" active={active} radius={0.2} />
          <mesh position={[0, -1.85, 0.35]}><boxGeometry args={[0.56, 0.04, 0.04]} /><meshStandardMaterial color="#d8d8dd" /></mesh>
        </group>
      </Hoverable>

      <Hoverable label="Toggle ring light" onClick={() => setRingOn((value) => !value)}>
        <group position={[-2.65, 2.25, -0.15]} rotation={[0, 0.25, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[1.05, 0.11, 20, 48]} />
            <meshStandardMaterial color={ringOn ? '#fff4e3' : '#29262a'} emissive={ringOn ? '#fff0d0' : '#000000'} emissiveIntensity={ringOn && active ? 2 : 0} />
          </mesh>
          <mesh position={[0, -2.0, 0]}><cylinderGeometry args={[0.05, 0.08, 3.0, 12]} /><meshStandardMaterial color="#24242a" metalness={0.65} roughness={0.35} /></mesh>
        </group>
      </Hoverable>

      <group position={[2.95, 1.15, 0.75]} rotation={[0.05, -0.38, 0]}>
        <RoundedBox args={[2.7, 0.18, 1.65]} radius={0.08} smoothness={3} castShadow>
          <meshStandardMaterial color="#535660" metalness={0.38} roughness={0.4} />
        </RoundedBox>
        <group position={[0, 0.75, -0.75]} rotation={[-0.12, 0, 0]}>
          <RoundedBox args={[2.7, 1.55, 0.16]} radius={0.08} smoothness={3} castShadow>
            <meshStandardMaterial color="#4a4d55" metalness={0.4} roughness={0.38} />
          </RoundedBox>
          <mesh position={[0, 0, 0.1]}><planeGeometry args={[2.42, 1.28]} /><meshStandardMaterial color="#1a2232" emissive="#405c8c" emissiveIntensity={0.32} /></mesh>
        </group>
      </group>

      <group position={[-3.45, 0.95, 0.7]}>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.35, 0.28, 1.2, 24]} /><meshStandardMaterial color="#24252a" metalness={0.5} roughness={0.28} /></mesh>
        <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.05, 0.07, 0.65, 12]} /><meshStandardMaterial color="#2f3035" /></mesh>
        <mesh position={[0, -0.88, 0]}><cylinderGeometry args={[0.55, 0.55, 0.08, 24]} /><meshStandardMaterial color="#202126" /></mesh>
      </group>

      <group ref={reactions} position={[1.55, 0, -0.5]}>
        {reactionData.map((item, index) => (
          <mesh key={index} position={[item.x, 1.3 + item.y, item.z]}>
            {index % 3 === 0 ? <sphereGeometry args={[0.1, 14, 14]} /> : index % 3 === 1 ? <octahedronGeometry args={[0.11]} /> : <torusGeometry args={[0.08, 0.025, 8, 16]} />}
            <meshStandardMaterial color={index % 2 ? '#53dcff' : '#ff5c8a'} emissive={index % 2 ? '#1b8ea9' : '#c92a62'} emissiveIntensity={active ? 0.9 : 0.12} />
          </mesh>
        ))}
      </group>

      <ArtifactMesh id="next-layer-message" year="2020" position={[3.75, 1.0, -0.65]} color="#ff5c8a" active={active} shape="octahedron" scale={1.2} />
      <pointLight position={[-2.5, 3.3, 2.0]} color="#fff0dc" intensity={ringOn && active ? 11 : 1.2} distance={12} decay={2} />
      <pointLight position={[0, 4.5, 3]} color="#ff4f91" intensity={active ? 4 : 0.7} distance={11} decay={2} />
    </group>
  );
}
