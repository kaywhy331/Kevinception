'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable, Pedestal } from './SceneUtils';

export function Year2010Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2010'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [phoneLit, setPhoneLit] = useState(true);
  const notifications = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!notifications.current || !active) return;
    notifications.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.12;
    notifications.current.position.y = 2.4 + Math.sin(clock.elapsedTime * 1.2) * 0.08;
  });
  const activate = () => timeline ? navigateToYear('2010') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <Pedestal position={[0, -0.25, 0]} width={10.5} depth={8.2} color="#161c26" />
      <Dust center={[0, 2.2, 0]} spread={[9, 5, 7]} color="#a8c7ff" active={active} />
      <mesh position={[0, 0.45, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[8.2, 0.34, 3.25]} />
        <meshStandardMaterial color="#403b36" roughness={0.72} />
      </mesh>
      <mesh position={[0, 2.8, -3.1]} receiveShadow>
        <boxGeometry args={[10, 5.8, 0.16]} />
        <meshStandardMaterial color="#d4d5da" roughness={0.94} />
      </mesh>

      <group position={[-0.5, 1.5, 0.25]}>
        <mesh position={[0, -0.55, 0.15]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[4.6, 0.22, 2.9]} />
          <meshStandardMaterial color="#6e727a" metalness={0.38} roughness={0.42} />
        </mesh>
        <Hoverable label="Open KevinBook" onClick={activate}>
          <group position={[0, 0.8, -1.05]} rotation={[-0.08, 0, 0]}>
            <RoundedBox args={[4.65, 3.0, 0.24]} radius={0.12} smoothness={3} castShadow>
              <meshStandardMaterial color="#777c85" metalness={0.4} roughness={0.36} />
            </RoundedBox>
            <DeviceScreen position={[0, 0, 0.14]} size={[4.25, 2.58]} color="#e7edf9" emissive="#6d91d4" active={active} radius={0.08} />
          </group>
        </Hoverable>
        <mesh position={[0, -0.42, 0.5]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[1.25, 0.035, 0.85]} />
          <meshStandardMaterial color="#51545a" metalness={0.45} roughness={0.38} />
        </mesh>
      </group>

      <Hoverable label="Toggle phone notification" onClick={() => setPhoneLit((value) => !value)}>
        <group position={[2.75, 0.9, 1.0]} rotation={[0.18, -0.32, 0.03]}>
          <RoundedBox args={[0.78, 1.45, 0.16]} radius={0.15} smoothness={4} castShadow>
            <meshStandardMaterial color="#15171a" roughness={0.28} metalness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[0.64, 1.15]} />
            <meshStandardMaterial color={phoneLit ? '#dce9ff' : '#101114'} emissive={phoneLit ? '#547fc0' : '#000000'} emissiveIntensity={phoneLit ? 0.55 : 0} />
          </mesh>
        </group>
      </Hoverable>

      <group position={[-3.2, 1.02, 0.65]} rotation={[0.05, 0.38, 0]}>
        <RoundedBox args={[1.25, 0.85, 0.58]} radius={0.09} smoothness={3} castShadow>
          <meshStandardMaterial color="#262a31" roughness={0.42} />
        </RoundedBox>
        <mesh position={[0, 0, 0.33]}><cylinderGeometry args={[0.24, 0.24, 0.12, 24]} /><meshStandardMaterial color="#111827" metalness={0.52} roughness={0.23} /></mesh>
        <mesh position={[0.48, 0.3, 0]}><boxGeometry args={[0.28, 0.18, 0.28]} /><meshStandardMaterial color="#343a43" /></mesh>
      </group>

      <group ref={notifications} position={[2.3, 2.4, -0.45]}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} position={[index * 0.42, index * 0.28, -index * 0.2]}>
            <sphereGeometry args={[0.11 + index * 0.025, 16, 16]} />
            <meshStandardMaterial color={index === 0 ? '#d95462' : '#6f9de9'} emissive={index === 0 ? '#a51f2c' : '#2b5da8'} emissiveIntensity={active ? 0.8 : 0.12} />
          </mesh>
        ))}
      </group>

      <ArtifactMesh id="project-blueprint" year="2010" position={[3.7, 0.9, -0.55]} color="#8db7ff" active={active} shape="box" scale={1.35} />
      <pointLight position={[0, 5.2, 2.7]} color="#9bbcff" intensity={active ? 7.5 : 1.4} distance={13} decay={2} />
    </group>
  );
}
