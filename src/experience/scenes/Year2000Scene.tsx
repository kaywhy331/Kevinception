'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable, Pedestal } from './SceneUtils';

export function Year2000Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2000'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [power, setPower] = useState(true);
  const modemLights = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!modemLights.current || !active || !power) return;
    modemLights.current.children.forEach((child, index) => {
      const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = Math.sin(clock.elapsedTime * (2.6 + index * 0.45) + index) > 0.15 ? 1.25 : 0.15;
    });
  });
  const activate = () => timeline ? navigateToYear('2000') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <Pedestal position={[0, -0.25, 0]} width={10.5} depth={8.2} color="#16191d" />
      <Dust center={[0, 2.2, 0]} spread={[9, 5, 7]} color="#75c8ff" active={active} />
      <mesh position={[0, 0.5, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[8.1, 0.42, 3.35]} />
        <meshStandardMaterial color="#72533f" roughness={0.78} />
      </mesh>
      <mesh position={[0, 2.7, -3.15]} receiveShadow>
        <boxGeometry args={[10, 5.8, 0.16]} />
        <meshStandardMaterial color="#2b2e33" roughness={0.95} />
      </mesh>

      <group position={[-0.6, 2.2, 0.1]}>
        <RoundedBox args={[5.35, 4.2, 2.35]} radius={0.34} smoothness={4} castShadow>
          <meshStandardMaterial color="#b8b29f" roughness={0.66} />
        </RoundedBox>
        <Hoverable label="Enter Kevin Online" onClick={activate}>
          <group position={[0, 0.23, 1.2]}>
            <DeviceScreen size={[4.25, 2.95]} color={power ? '#0b1830' : '#030303'} emissive={power ? '#1875aa' : '#000000'} active={active && power} radius={0.3} />
            {power && <mesh position={[0, 0, 0.08]}><planeGeometry args={[4.02, 2.7]} /><meshBasicMaterial color="#1d4d75" transparent opacity={0.22} /></mesh>}
          </group>
        </Hoverable>
        <group position={[0, -1.82, 1.2]}>
          <mesh position={[-0.2, 0, 0]}><boxGeometry args={[2.1, 0.1, 0.12]} /><meshStandardMaterial color="#787467" /></mesh>
          <Hoverable label="CRT power" onClick={() => setPower((value) => !value)}>
            <mesh position={[1.8, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.12, 20]} />
              <meshStandardMaterial color={power ? '#7be68f' : '#5c4a4a'} emissive={power ? '#38aa55' : '#280000'} emissiveIntensity={0.9} />
            </mesh>
          </Hoverable>
        </group>
      </group>

      <group position={[3.3, 1.65, -0.25]}>
        <RoundedBox args={[1.65, 3.3, 2.25]} radius={0.12} smoothness={3} castShadow>
          <meshStandardMaterial color="#a7a18f" roughness={0.74} />
        </RoundedBox>
        <mesh position={[0, 0.85, 1.16]}><boxGeometry args={[1.12, 0.12, 0.08]} /><meshStandardMaterial color="#2c2c2c" /></mesh>
        <mesh position={[0, 0.25, 1.16]}><boxGeometry args={[1.12, 0.42, 0.08]} /><meshStandardMaterial color="#858074" /></mesh>
        <mesh position={[0.5, -1.2, 1.16]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#6ee98d" emissive="#3ac65d" emissiveIntensity={0.8} /></mesh>
      </group>

      <group position={[-2.4, 0.88, 1.3]}>
        <RoundedBox args={[2.8, 0.24, 1.0]} radius={0.08} smoothness={3} castShadow>
          <meshStandardMaterial color="#ada895" roughness={0.72} />
        </RoundedBox>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-1.1 + (i % 6) * 0.44, 0.16, -0.25 + Math.floor(i / 6) * 0.45]}>
            <boxGeometry args={[0.34, 0.08, 0.24]} />
            <meshStandardMaterial color="#524f46" />
          </mesh>
        ))}
      </group>

      <group position={[1.55, 0.86, 1.35]}>
        <RoundedBox args={[1.7, 0.4, 1.05]} radius={0.09} smoothness={3} castShadow>
          <meshStandardMaterial color="#343941" roughness={0.55} />
        </RoundedBox>
        <group ref={modemLights} position={[0.45, 0.23, 0.53]}>
          {[0, 1, 2, 3].map((index) => (
            <mesh key={index} position={[-0.45 + index * 0.28, 0, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial color="#69f28d" emissive="#30c85b" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      <group position={[2.0, 0.9, -1.2]} rotation={[0.2, -0.32, 0]}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} position={[0, index * 0.08, 0]} rotation={[Math.PI / 2, 0, index * 0.35]}>
            <cylinderGeometry args={[0.42, 0.42, 0.035, 32]} />
            <meshStandardMaterial color={['#4aa4e6', '#f1b640', '#cb4b6d', '#59bc8a'][index]} metalness={0.28} roughness={0.35} />
          </mesh>
        ))}
      </group>

      <ArtifactMesh id="identity-handle" year="2000" position={[-3.75, 1.0, -0.45]} color="#6bbcff" active={active} shape="cylinder" scale={1.2} />
      <pointLight position={[-0.5, 4.8, 3]} color="#7bc9ff" intensity={active && power ? 8 : 1.5} distance={13} decay={2} />
    </group>
  );
}
