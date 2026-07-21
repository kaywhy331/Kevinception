'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, GlassPanel, PictureFrame, Plant, RoomShell } from './EnvironmentPrimitives';
import { DESK_SURFACE_Y, GroundedDesk } from './SceneLayout';

export function Year2010Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2010'];
  const { enterYear } = useExperienceActions();
  const [phoneLit, setPhoneLit] = useState(true);
  const notifications = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!active || !notifications.current) return;
    notifications.current.rotation.y = Math.sin(clock.elapsedTime * 0.38) * 0.1;
    notifications.current.position.y = 2.35 + Math.sin(clock.elapsedTime * 1.15) * 0.055;
  });

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#665f58" wallColor="#d0d3d9" sideColor="#b7bdc7" ceilingColor="#e3e5e8" trimColor="#747b86" accent={config.accent} openLeft openRight active={active} floorRoughness={0.82} />
      <Dust center={[0, 2.6, 0]} spread={[9.2, 5.4, 7]} color="#c4d8ff" active={active} count={active ? 42 : 12} />
      <GroundedDesk position={[0, 0, 0.28]} size={[8.2, 3.15]} topColor="#4c4844" legColor="#2c2a29" drawers />

      <GlassPanel position={[-2.6, 4.05, -3.34]} size={[3.8, 2.4, 0.055]} color="#b9dcff" opacity={active ? 0.18 : 0.07} frameColor="#7d8794" />
      <mesh position={[-2.6, 4.05, -3.38]}><planeGeometry args={[3.58, 2.18]} /><meshBasicMaterial color="#c8dff1" transparent opacity={0.26} /></mesh>
      <mesh position={[-2.6, 3.1, -3.26]}><boxGeometry args={[3.65, 0.08, 0.08]} /><meshStandardMaterial color="#7f8892" metalness={0.35} /></mesh>
      <PictureFrame position={[3.55, 4.15, -3.35]} size={[1.55, 1.2]} frameColor="#34373d" imageColor="#6d8fb8" accent="#8db7ff" />
      <PictureFrame position={[3.0, 2.85, -3.35]} size={[1.25, 0.9]} frameColor="#48413a" imageColor="#a87c69" accent="#e8a58c" />
      <PictureFrame position={[4.15, 2.72, -3.35]} size={[1.05, 1.3]} frameColor="#2e3034" imageColor="#779178" accent="#9ad39d" />

      <group position={[-0.45, DESK_SURFACE_Y + 0.12, 0.35]}>
        <mesh rotation={[-0.06, 0, 0]} castShadow>
          <boxGeometry args={[4.25, 0.2, 2.55]} />
          <meshStandardMaterial color="#777c84" metalness={0.34} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.1, 0.4]} rotation={[-0.06, 0, 0]}>
          <boxGeometry args={[1.16, 0.032, 0.78]} />
          <meshStandardMaterial color="#55585e" metalness={0.43} roughness={0.37} />
        </mesh>
        {Array.from({ length: 30 }).map((_, index) => {
          const column = index % 10;
          const row = Math.floor(index / 10);
          return <mesh key={index} position={[-1.55 + column * 0.34, 0.13, -0.42 + row * 0.34]} rotation={[-0.06, 0, 0]}><boxGeometry args={[0.26, 0.038, 0.23]} /><meshStandardMaterial color="#4e5157" roughness={0.58} /></mesh>;
        })}
        <Hoverable label="Open KevinBook" onClick={() => enterYear('2010')}>
          <group position={[0, 1.35, -1.02]} rotation={[-0.04, 0, 0]}>
            <RoundedBox args={[4.22, 2.45, 0.23]} radius={0.12} smoothness={4} castShadow><meshStandardMaterial color="#727780" metalness={0.42} roughness={0.34} /></RoundedBox>
            <DeviceScreen position={[0, 0, 0.14]} size={[3.84, 2.08]} color="#e7edf8" emissive="#6c91d6" active={active} radius={0.08} glass />
          </group>
        </Hoverable>
        {[-1, 1].map((side) => <mesh key={side} position={[side * 1.65, 0.26, -1.02]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.42, 12]} /><meshStandardMaterial color="#565a62" metalness={0.45} roughness={0.32} /></mesh>)}
      </group>

      <Hoverable label="Toggle phone notification" onClick={() => setPhoneLit((value) => !value)}>
        <group position={[2.62, DESK_SURFACE_Y + 0.72, 1.0]} rotation={[0.12, -0.28, 0.02]}>
          <RoundedBox args={[0.72, 1.35, 0.16]} radius={0.13} smoothness={4} castShadow><meshStandardMaterial color="#17191c" roughness={0.24} metalness={0.38} /></RoundedBox>
          <mesh position={[0, 0, 0.095]}><planeGeometry args={[0.57, 1.06]} /><meshStandardMaterial color={phoneLit ? '#dbe8ff' : '#101114'} emissive={phoneLit ? '#547fc0' : '#000000'} emissiveIntensity={phoneLit ? 0.55 : 0} /></mesh>
          <mesh position={[0, -0.57, 0.1]}><circleGeometry args={[0.038, 18]} /><meshStandardMaterial color="#41454b" /></mesh>
        </group>
      </Hoverable>

      <group position={[-3.12, DESK_SURFACE_Y + 0.36, 0.82]} rotation={[0.03, 0.32, 0]}>
        <RoundedBox args={[1.12, 0.68, 0.52]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#272b31" roughness={0.4} /></RoundedBox>
        <mesh position={[0, 0, 0.3]}><cylinderGeometry args={[0.22, 0.22, 0.11, 24]} /><meshStandardMaterial color="#101725" metalness={0.52} roughness={0.22} /></mesh>
        <mesh position={[0.4, 0.22, 0]}><boxGeometry args={[0.24, 0.15, 0.24]} /><meshStandardMaterial color="#353b44" /></mesh>
        <mesh position={[-0.36, 0.22, 0]}><boxGeometry args={[0.16, 0.08, 0.16]} /><meshStandardMaterial color="#b9c0c8" /></mesh>
      </group>

      <group ref={notifications} position={[2.45, 2.35, 0.5]} visible={active && phoneLit}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} position={[index * 0.28, index * 0.2, -index * 0.12]}>
            <sphereGeometry args={[0.07 + index * 0.012, 16, 16]} />
            <meshStandardMaterial color={index === 0 ? '#d95462' : '#6f9de9'} emissive={index === 0 ? '#a51f2c' : '#2b5da8'} emissiveIntensity={0.78} />
          </mesh>
        ))}
      </group>

      <group position={[3.58, DESK_SURFACE_Y + 0.02, -1.02]}>
        <mesh position={[0, 0.27, 0]} castShadow><cylinderGeometry args={[0.3, 0.24, 0.54, 20]} /><meshStandardMaterial color="#e1e0db" roughness={0.72} /></mesh>
        <mesh position={[0.22, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.18, 0.05, 10, 22, Math.PI]} /><meshStandardMaterial color="#e1e0db" roughness={0.72} /></mesh>
      </group>

      <group position={[-3.75, DESK_SURFACE_Y + 0.045, -0.82]} rotation={[0.06, 0.1, 0]}>
        <mesh castShadow><boxGeometry args={[1.5, 0.05, 0.92]} /><meshStandardMaterial color="#ece6dc" roughness={0.92} /></mesh>
        {[0, 1, 2].map((index) => <mesh key={index} position={[-0.42 + index * 0.42, 0.035, 0.1 - index * 0.14]} rotation={[-Math.PI / 2, 0, index * 0.08]}><planeGeometry args={[0.34, 0.34]} /><meshBasicMaterial color={['#668dbb', '#bc7c79', '#829c76'][index]} /></mesh>)}
      </group>

      <group position={[3.18, 0, -0.52]}>
        <mesh position={[0, 1.7, 0]}><cylinderGeometry args={[0.035, 0.05, 0.9, 10]} /><meshStandardMaterial color="#2d3035" metalness={0.45} /></mesh>
        <mesh position={[0, DESK_SURFACE_Y + 0.06, 0]}><cylinderGeometry args={[0.32, 0.32, 0.07, 22]} /><meshStandardMaterial color="#282a2e" /></mesh>
        <mesh position={[0, 2.12, 0]}><torusGeometry args={[0.34, 0.07, 12, 28]} /><meshStandardMaterial color="#25272b" roughness={0.42} /></mesh>
        <mesh position={[-0.36, 1.92, 0]} rotation={[0, 0, 0.22]}><boxGeometry args={[0.13, 0.5, 0.14]} /><meshStandardMaterial color="#282a2e" /></mesh>
        <mesh position={[0.36, 1.92, 0]} rotation={[0, 0, -0.22]}><boxGeometry args={[0.13, 0.5, 0.14]} /><meshStandardMaterial color="#282a2e" /></mesh>
      </group>

      <Plant position={[4.05, 0.05, -2.35]} scale={1.18} potColor="#d5d0c7" leafColor="#6d9a72" />
      <Cable points={[[2.62, 1.22, 0.92], [2.45, 0.42, 1.55], [0.65, 0.28, 1.72], [0.25, 1.08, 0.68]]} color="#26282d" radius={0.016} />
      <Cable points={[[0.3, 1.18, 0.92], [-0.45, 0.35, 1.55], [-2.75, 0.25, 1.62], [-3.05, 1.12, 0.7]]} color="#404247" radius={0.015} />

      <RoundedBox position={[4.0, 2.25, -3.18]} args={[0.95, 0.12, 0.36]} radius={0.04} smoothness={2} castShadow><meshStandardMaterial color="#6d7480" roughness={0.55} /></RoundedBox>
      <ArtifactMesh id="project-blueprint" year="2010" position={[4.0, 2.62, -3.02]} color="#8db7ff" active={active} shape="box" scale={0.72} />
      <spotLight position={[-2.4, 5.7, 2.8]} target-position={[-0.4, 1.9, 0]} color="#dbeeff" intensity={active ? 4.6 : 0.42} distance={15} angle={0.62} penumbra={0.6} castShadow={active} />
      {active && <pointLight position={[-0.5, 3.0, 1.5]} color="#9bbcff" intensity={3.0} distance={9} decay={2} />}
    </group>
  );
}
