'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, Desk, PictureFrame, RoomShell, Shelf } from './EnvironmentPrimitives';

export function Year2000Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2000'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [power, setPower] = useState(true);
  const modemLights = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!active || !modemLights.current || !power) return;
    modemLights.current.children.forEach((child, index) => {
      const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      const online = Math.sin(clock.elapsedTime * (2.6 + index * 0.45) + index) > 0.12;
      material.emissiveIntensity = online ? 1.35 : 0.22;
    });
  });
  const activate = () => timeline ? navigateToYear('2000') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#4a4650" wallColor="#444b58" sideColor="#353b46" ceilingColor="#242933" trimColor="#20252d" accent={config.accent} openLeft openRight active={active} floorRoughness={0.94} />
      <Dust center={[0, 2.5, 0]} spread={[9.2, 5.5, 7]} color="#9fd7ff" active={active} count={active ? 62 : 16} />
      <Desk position={[0, 0, 0.25]} size={[8.25, 3.0]} topColor="#6f523d" legColor="#3b2d25" drawers />

      <PictureFrame position={[-3.7, 4.15, -3.36]} size={[1.75, 1.25]} frameColor="#20252b" imageColor="#354d68" accent="#6bbcff" />
      <PictureFrame position={[3.65, 3.95, -3.36]} size={[1.55, 1.95]} frameColor="#2b2622" imageColor="#7b694f" accent="#f6c96c" />

      <group position={[0, 4.2, -3.33]}>
        <RoundedBox args={[3.55, 1.35, 0.12]} radius={0.06} smoothness={2} castShadow><meshStandardMaterial color="#6e5945" roughness={0.95} /></RoundedBox>
        {[[-1.1, 0.25, '#d9c97e'], [-0.45, -0.22, '#99c5d9'], [0.25, 0.22, '#d995a7'], [1.05, -0.16, '#c4d39a']].map(([x, y, color], index) => (
          <group key={index} position={[x as number, y as number, 0.08]} rotation={[0, 0, (index - 1.5) * 0.04]}>
            <mesh><planeGeometry args={[0.66, 0.48]} /><meshStandardMaterial color={color as string} roughness={0.88} /></mesh>
            <mesh position={[0, 0.16, 0.02]}><sphereGeometry args={[0.035, 10, 10]} /><meshStandardMaterial color="#b23f3f" /></mesh>
          </group>
        ))}
      </group>

      <group position={[-0.65, 3.24, 0.2]}>
        <RoundedBox args={[5.45, 4.25, 2.48]} radius={0.36} smoothness={5} castShadow><meshStandardMaterial color="#bcb7a6" roughness={0.63} /></RoundedBox>
        <mesh position={[0, -2.02, 0.28]} castShadow><boxGeometry args={[4.65, 0.18, 1.6]} /><meshStandardMaterial color="#9b9687" roughness={0.72} /></mesh>
        <Hoverable label="Enter Kevin Online" onClick={activate}>
          <group position={[0, 0.25, 1.27]}>
            <DeviceScreen size={[4.28, 2.98]} color={power ? '#07152b' : '#020202'} emissive={power ? '#197fb9' : '#000000'} active={active && power} radius={0.31} glass />
            {power && <mesh position={[0, 0, 0.105]}><planeGeometry args={[4.0, 2.68]} /><meshBasicMaterial color="#1d638e" transparent opacity={0.23} /></mesh>}
          </group>
        </Hoverable>
        <group position={[0, -1.9, 1.28]}>
          <mesh position={[-0.35, 0, 0]}><boxGeometry args={[2.3, 0.11, 0.12]} /><meshStandardMaterial color="#777367" roughness={0.75} /></mesh>
          <mesh position={[0.75, 0.03, 0.02]}><boxGeometry args={[0.6, 0.06, 0.06]} /><meshStandardMaterial color="#4c4942" /></mesh>
          <Hoverable label="CRT power" onClick={() => setPower((value) => !value)}>
            <mesh position={[1.82, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.13, 20]} /><meshStandardMaterial color={power ? '#79e690' : '#604f4f'} emissive={power ? '#36a953' : '#270000'} emissiveIntensity={0.9} /></mesh>
          </Hoverable>
        </group>
      </group>

      <group position={[3.35, 2.35, -0.18]}>
        <RoundedBox args={[1.75, 3.72, 2.4]} radius={0.13} smoothness={3} castShadow><meshStandardMaterial color="#aaa594" roughness={0.7} /></RoundedBox>
        <mesh position={[0, 1.08, 1.23]}><boxGeometry args={[1.15, 0.13, 0.08]} /><meshStandardMaterial color="#292929" /></mesh>
        <mesh position={[0, 0.48, 1.23]}><boxGeometry args={[1.15, 0.45, 0.08]} /><meshStandardMaterial color="#7f7b70" /></mesh>
        <mesh position={[0, -0.1, 1.23]}><boxGeometry args={[1.15, 0.1, 0.08]} /><meshStandardMaterial color="#403d37" /></mesh>
        {[0, 1, 2].map((index) => <mesh key={index} position={[-0.48 + index * 0.48, -1.45, 1.23]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color={index === 0 ? '#70e78b' : '#5b5c57'} emissive={index === 0 ? '#34b957' : '#000'} emissiveIntensity={0.8} /></mesh>)}
      </group>

      <group position={[-2.15, 1.43, 1.55]}>
        <RoundedBox args={[3.2, 0.26, 1.08]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#b4af9e" roughness={0.69} /></RoundedBox>
        {Array.from({ length: 28 }).map((_, index) => {
          const column = index % 10;
          const row = Math.floor(index / 10);
          return <mesh key={index} position={[-1.28 + column * 0.28, 0.17, -0.3 + row * 0.34]}><boxGeometry args={[0.22, 0.075, 0.24]} /><meshStandardMaterial color={row === 0 ? '#4a4943' : '#5a5850'} roughness={0.78} /></mesh>;
        })}
      </group>

      <group position={[0.2, 1.37, 1.72]}>
        <RoundedBox args={[1.05, 0.22, 0.78]} radius={0.24} smoothness={4} castShadow><meshStandardMaterial color="#aaa697" roughness={0.65} /></RoundedBox>
        <mesh position={[0, 0.1, 0.08]}><sphereGeometry args={[0.1, 14, 14]} /><meshStandardMaterial color="#67645b" /></mesh>
      </group>

      <group position={[1.65, 1.43, 1.55]}>
        <RoundedBox args={[1.95, 0.45, 1.12]} radius={0.1} smoothness={3} castShadow><meshStandardMaterial color="#343941" roughness={0.5} /></RoundedBox>
        <group ref={modemLights} position={[0.48, 0.26, 0.58]}>
          {[0, 1, 2, 3].map((index) => <mesh key={index} position={[-0.5 + index * 0.3, 0, 0]}><sphereGeometry args={[0.058, 12, 12]} /><meshStandardMaterial color="#6cf08c" emissive="#31c75b" emissiveIntensity={active ? 0.2 : 0.05} /></mesh>)}
        </group>
      </group>

      <group position={[-3.72, 2.45, -0.4]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[0, side * 0.8, 0]}>
            <RoundedBox args={[0.72, 1.25, 0.65]} radius={0.11} smoothness={3} castShadow><meshStandardMaterial color="#24272d" roughness={0.54} /></RoundedBox>
            <mesh position={[0, 0.18, 0.35]}><circleGeometry args={[0.22, 24]} /><meshStandardMaterial color="#101215" /></mesh>
            <mesh position={[0, -0.3, 0.35]}><circleGeometry args={[0.12, 24]} /><meshStandardMaterial color="#131518" /></mesh>
          </group>
        ))}
      </group>

      <group position={[3.8, 1.38, 1.25]} rotation={[0, -0.28, 0]}>
        <RoundedBox args={[1.25, 0.22, 0.58]} radius={0.12} smoothness={3} castShadow><meshStandardMaterial color="#2d3036" roughness={0.58} /></RoundedBox>
        <mesh position={[-0.42, 0.18, 0]} rotation={[0, 0, -0.45]}><boxGeometry args={[0.28, 0.2, 0.82]} /><meshStandardMaterial color="#3f4248" /></mesh>
        <mesh position={[0.42, 0.18, 0]} rotation={[0, 0, 0.45]}><boxGeometry args={[0.28, 0.2, 0.82]} /><meshStandardMaterial color="#3f4248" /></mesh>
      </group>

      <group position={[2.1, 1.5, -1.35]} rotation={[0.16, -0.3, 0]}>
        {[0, 1, 2, 3, 4].map((index) => <mesh key={index} position={[0, index * 0.06, 0]} rotation={[Math.PI / 2, 0, index * 0.28]} castShadow><cylinderGeometry args={[0.42, 0.42, 0.035, 32]} /><meshStandardMaterial color={['#4aa4e6', '#f1b640', '#cb4b6d', '#59bc8a', '#8d71c8'][index]} metalness={0.25} roughness={0.36} /></mesh>)}
      </group>
      <group position={[-0.1, 1.32, -1.42]} rotation={[-0.05, 0.12, 0.02]}>
        <mesh castShadow><boxGeometry args={[1.25, 0.04, 1.55]} /><meshStandardMaterial color="#e9e4d5" roughness={0.9} /></mesh>
        <mesh position={[0, 0.03, 0.55]}><planeGeometry args={[0.92, 0.26]} /><meshBasicMaterial color="#789fd0" /></mesh>
        <mesh position={[0, 0.031, 0.05]}><planeGeometry args={[0.78, 0.48]} /><meshBasicMaterial color="#d6a0c2" /></mesh>
      </group>

      <Shelf position={[4.25, 2.55, -2.75]} size={[1.45, 2.85, 0.56]} levels={4} color="#5f4938" frameColor="#30251e" />
      {Array.from({ length: 10 }).map((_, index) => (
        <mesh key={index} position={[3.78 + (index % 3) * 0.32, 1.55 + Math.floor(index / 3) * 0.56, -2.42]} castShadow>
          <boxGeometry args={[0.24, 0.45, 0.08]} />
          <meshStandardMaterial color={['#6f8db3', '#b66f63', '#8f9d69', '#d0aa62'][index % 4]} roughness={0.82} />
        </mesh>
      ))}

      <Cable points={[[1.6, 1.2, 1.0], [1.4, 0.32, 1.45], [-0.4, 0.18, 1.55], [-0.45, 1.1, 0.9]]} color="#15171b" radius={0.025} />
      <Cable points={[[3.45, 1.15, 0.2], [3.2, 0.18, -0.2], [1.9, 0.15, -0.4], [1.7, 1.2, 0.8]]} color="#303238" radius={0.021} />

      <ArtifactMesh id="identity-handle" year="2000" position={[-4.2, 1.0, -0.45]} color="#6bbcff" active={active} shape="cylinder" scale={1.2} />
      <spotLight position={[-0.4, 5.8, 3.2]} target-position={[-0.4, 2.2, 0]} color="#d7edff" intensity={active ? 4.7 : 0.42} distance={15} angle={0.58} penumbra={0.62} castShadow={active} />
      <pointLight position={[-0.6, 3.8, 2.1]} color="#5bbcff" intensity={active && power ? 4.1 : 0.18} distance={9} decay={2} />
    </group>
  );
}
