'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { PictureFrame, RoomShell } from './EnvironmentPrimitives';
import { EraScreenPortal } from './EraScreenPortal';
import { DESK_SURFACE_Y, GroundedDesk, WallDisplay } from './SceneLayout';

export function Year2000Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2000'];
  const { enterYear, discover } = useExperienceActions();
  const [power, setPower] = useState(true);
  const modemLights = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!active || !power || !modemLights.current) return;
    modemLights.current.children.forEach((child, index) => {
      const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      const online = Math.sin(clock.elapsedTime * (2.6 + index * 0.45) + index) > 0.12;
      material.emissiveIntensity = online ? 1.35 : 0.22;
    });
  });

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#4a4650" wallColor="#444b58" sideColor="#353b46" ceilingColor="#242933" trimColor="#20252d" accent={config.accent} openLeft openRight active={active} floorRoughness={0.94} />
      <Dust center={[0, 2.7, 0]} spread={[9.2, 5.5, 7]} color="#9fd7ff" active={active} count={active ? 48 : 12} />
      <GroundedDesk position={[-0.25, 0, 0.35]} size={[7.65, 3.0]} topColor="#6f523d" legColor="#3b2d25" drawers />

      <PictureFrame position={[-3.75, 4.12, -3.36]} size={[1.65, 1.2]} frameColor="#20252b" imageColor="#354d68" accent="#6bbcff" />
      <PictureFrame position={[3.75, 4.0, -3.36]} size={[1.45, 1.75]} frameColor="#2b2622" imageColor="#7b694f" accent="#f6c96c" />
      <group position={[0.2, 4.15, -3.33]}>
        <RoundedBox args={[3.4, 1.28, 0.12]} radius={0.06} smoothness={2} castShadow><meshStandardMaterial color="#6e5945" roughness={0.95} /></RoundedBox>
        {[
          [-1.05, 0.24, '#d9c97e'], [-0.42, -0.2, '#99c5d9'], [0.2, 0.2, '#d995a7'], [0.98, -0.15, '#c4d39a']
        ].map(([x, y, color], index) => (
          <group key={index} position={[x as number, y as number, 0.08]} rotation={[0, 0, (index - 1.5) * 0.04]}>
            <mesh><planeGeometry args={[0.62, 0.44]} /><meshStandardMaterial color={color as string} roughness={0.88} /></mesh>
            <mesh position={[0, 0.14, 0.02]}><sphereGeometry args={[0.032, 10, 10]} /><meshStandardMaterial color="#b23f3f" /></mesh>
          </group>
        ))}
      </group>

      <group position={[-0.55, 3.37, -0.4]}>
        <RoundedBox args={[4.7, 3.5, 2.1]} radius={0.34} smoothness={5} castShadow><meshStandardMaterial color="#bcb7a6" roughness={0.63} /></RoundedBox>
        <mesh position={[0, -1.66, 0.2]} castShadow><boxGeometry args={[4.0, 0.16, 1.35]} /><meshStandardMaterial color="#9b9687" roughness={0.72} /></mesh>
        <Hoverable label="Enter Kevin Online" onClick={() => enterYear('2000')}>
          <group position={[0, 0.2, 1.08]}>
            <DeviceScreen size={[3.75, 2.55]} color={power ? '#07152b' : '#020202'} emissive={power ? '#197fb9' : '#000000'} active={active && power} radius={0.28} glass />
            {power && <mesh position={[0, 0, 0.105]}><planeGeometry args={[3.5, 2.3]} /><meshBasicMaterial color="#1d638e" transparent opacity={0.22} /></mesh>}
            <EraScreenPortal fromYear="2000" size={[3.5, 2.3]} position={[0, 0, 0.12]} active={active} enabled={power} />
          </group>
        </Hoverable>
        <group position={[0, -1.55, 1.1]}>
          <mesh position={[-0.2, 0, 0]}><boxGeometry args={[2.0, 0.1, 0.1]} /><meshStandardMaterial color="#777367" roughness={0.75} /></mesh>
          <mesh position={[0.75, 0.02, 0.02]}><boxGeometry args={[0.52, 0.055, 0.055]} /><meshStandardMaterial color="#4c4942" /></mesh>
          <Hoverable label="CRT power" onClick={() => setPower((value) => !value)}><mesh position={[1.62, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.12, 20]} /><meshStandardMaterial color={power ? '#79e690' : '#604f4f'} emissive={power ? '#36a953' : '#270000'} emissiveIntensity={0.88} /></mesh></Hoverable>
        </group>
      </group>

      <group position={[4.42, 1.47, 0.05]}>
        <RoundedBox args={[1.35, 2.94, 1.55]} radius={0.12} smoothness={3} castShadow><meshStandardMaterial color="#bcb7a6" roughness={0.68} /></RoundedBox>
        <mesh position={[0, 0.84, 0.8]}><boxGeometry args={[0.9, 0.1, 0.07]} /><meshStandardMaterial color="#292929" /></mesh>
        <mesh position={[0, 0.26, 0.8]}><boxGeometry args={[0.9, 0.36, 0.07]} /><meshStandardMaterial color="#8d887c" /></mesh>
        <mesh position={[0, -0.28, 0.8]}><boxGeometry args={[0.9, 0.08, 0.07]} /><meshStandardMaterial color="#403d37" /></mesh>
        {[0, 1].map((index) => <mesh key={index} position={[-0.18 + index * 0.36, -1.08, 0.8]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color={index === 0 ? '#70e78b' : '#5b5c57'} emissive={index === 0 ? '#34b957' : '#000'} emissiveIntensity={0.8} /></mesh>)}
      </group>

      <group position={[-0.95, DESK_SURFACE_Y + 0.13, 1.52]}>
        <RoundedBox args={[3.0, 0.23, 0.86]} radius={0.07} smoothness={3} castShadow><meshStandardMaterial color="#b4af9e" roughness={0.69} /></RoundedBox>
        {Array.from({ length: 28 }).map((_, index) => {
          const column = index % 10;
          const row = Math.floor(index / 10);
          return <mesh key={index} position={[-1.2 + column * 0.26, 0.15, -0.24 + row * 0.28]}><boxGeometry args={[0.2, 0.065, 0.2]} /><meshStandardMaterial color={row === 0 ? '#4a4943' : '#5a5850'} roughness={0.78} /></mesh>;
        })}
      </group>

      <group position={[0.95, DESK_SURFACE_Y + 0.12, 1.58]}>
        <RoundedBox args={[0.82, 0.2, 0.62]} radius={0.2} smoothness={4} castShadow><meshStandardMaterial color="#aaa697" roughness={0.65} /></RoundedBox>
        <mesh position={[0, 0.09, 0.05]}><sphereGeometry args={[0.085, 14, 14]} /><meshStandardMaterial color="#67645b" /></mesh>
      </group>

      {[-3.0, 1.9].map((x) => (
        <group key={x} position={[x, DESK_SURFACE_Y + 0.58, 0.05]}>
          <RoundedBox args={[0.55, 1.12, 0.55]} radius={0.09} smoothness={3} castShadow><meshStandardMaterial color="#b3ae9e" roughness={0.62} /></RoundedBox>
          <mesh position={[0, 0.16, 0.3]}><circleGeometry args={[0.18, 24]} /><meshStandardMaterial color="#44423e" /></mesh>
          <mesh position={[0, -0.28, 0.3]}><circleGeometry args={[0.1, 24]} /><meshStandardMaterial color="#56534d" /></mesh>
        </group>
      ))}

      <Hoverable label="Inspect 56K modem" onClick={() => discover('identity-handle', '2000')}>
        <group position={[2.65, DESK_SURFACE_Y + 0.2, 1.35]}>
          <RoundedBox args={[1.5, 0.38, 0.8]} radius={0.09} smoothness={3} castShadow><meshStandardMaterial color="#aaa594" roughness={0.56} /></RoundedBox>
          <mesh position={[0, 0, 0.41]}><boxGeometry args={[1.25, 0.24, 0.035]} /><meshStandardMaterial color="#3a3c3f" roughness={0.48} /></mesh>
          <group ref={modemLights} position={[0.34, 0.23, 0.42]}>{[0, 1, 2, 3].map((index) => <mesh key={index} position={[-0.42 + index * 0.26, 0, 0]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color="#6cf08c" emissive="#31c75b" emissiveIntensity={0.2} /></mesh>)}</group>
        </group>
      </Hoverable>

      <WallDisplay position={[1.35, 3.55, -3.28]} size={[1.3, 0.9]} frameColor="#34373d" screenColor="#ead9e4" accent="#d6a0c2" active={active} />
      <spotLight position={[-0.4, 5.8, 3.2]} target-position={[-0.4, 2.45, 0]} color="#d7edff" intensity={active ? 4.6 : 0.38} distance={15} angle={0.58} penumbra={0.62} castShadow={active} />
      {active && <pointLight position={[-0.6, 3.9, 1.8]} color="#5bbcff" intensity={3.8} distance={9} decay={2} />}
    </group>
  );
}
