'use client';

import { useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, Desk, GlassPanel, PictureFrame, Plant, RoomShell } from './EnvironmentPrimitives';

export function Year2010Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2010'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [phoneLit, setPhoneLit] = useState(true);
  const notifications = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!active || !notifications.current) return;
    notifications.current.rotation.y = Math.sin(clock.elapsedTime * 0.38) * 0.12;
    notifications.current.position.y = 2.75 + Math.sin(clock.elapsedTime * 1.15) * 0.08;
  });
  const activate = () => timeline ? navigateToYear('2010') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell
        floorColor="#665f58"
        wallColor="#d0d3d9"
        sideColor="#b7bdc7"
        ceilingColor="#e3e5e8"
        trimColor="#747b86"
        accent={config.accent}
        openLeft
        openRight
        active={active}
        floorRoughness={0.82}
      />
      <Dust center={[0, 2.6, 0]} spread={[9.2, 5.4, 7]} color="#c4d8ff" active={active} count={55} />
      <Desk position={[0, 0, 0.28]} size={[8.2, 3.15]} topColor="#4c4844" legColor="#2c2a29" drawers />

      <GlassPanel position={[-2.6, 4.05, -3.34]} size={[3.8, 2.4, 0.055]} color="#b9dcff" opacity={active ? 0.2 : 0.1} frameColor="#7d8794" />
      <mesh position={[-2.6, 4.05, -3.38]}><planeGeometry args={[3.58, 2.18]} /><meshBasicMaterial color="#c8dff1" transparent opacity={0.32} /></mesh>
      <mesh position={[-2.6, 3.1, -3.26]}><boxGeometry args={[3.65, 0.08, 0.08]} /><meshStandardMaterial color="#7f8892" metalness={0.35} /></mesh>
      <PictureFrame position={[3.55, 4.15, -3.35]} size={[1.55, 1.2]} frameColor="#34373d" imageColor="#6d8fb8" accent="#8db7ff" />
      <PictureFrame position={[3.0, 2.85, -3.35]} size={[1.25, 0.9]} frameColor="#48413a" imageColor="#a87c69" accent="#e8a58c" />
      <PictureFrame position={[4.15, 2.72, -3.35]} size={[1.05, 1.3]} frameColor="#2e3034" imageColor="#779178" accent="#9ad39d" />

      <group position={[-0.5, 1.98, 0.35]}>
        <mesh position={[0, -0.72, 0.25]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[4.75, 0.24, 2.95]} />
          <meshStandardMaterial color="#777c84" metalness={0.34} roughness={0.38} />
        </mesh>
        <Hoverable label="Open KevinBook" onClick={activate}>
          <group position={[0, 0.78, -1.05]} rotation={[-0.06, 0, 0]}>
            <RoundedBox args={[4.78, 3.05, 0.26]} radius={0.13} smoothness={4} castShadow>
              <meshStandardMaterial color="#727780" metalness={0.42} roughness={0.34} />
            </RoundedBox>
            <DeviceScreen position={[0, 0, 0.15]} size={[4.34, 2.62]} color="#e7edf8" emissive="#6c91d6" active={active} radius={0.09} glass />
          </group>
        </Hoverable>
        <mesh position={[0, -0.57, 0.62]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[1.3, 0.035, 0.88]} />
          <meshStandardMaterial color="#55585e" metalness={0.43} roughness={0.37} />
        </mesh>
        {Array.from({ length: 34 }).map((_, index) => {
          const column = index % 11;
          const row = Math.floor(index / 11);
          return <mesh key={index} position={[-1.78 + column * 0.34, -0.53, -0.45 + row * 0.36]} rotation={[-0.08, 0, 0]}><boxGeometry args={[0.27, 0.04, 0.25]} /><meshStandardMaterial color="#4e5157" roughness={0.58} /></mesh>;
        })}
      </group>

      <Hoverable label="Toggle phone notification" onClick={() => setPhoneLit((value) => !value)}>
        <group position={[2.78, 1.55, 1.15]} rotation={[0.16, -0.35, 0.03]}>
          <RoundedBox args={[0.82, 1.5, 0.18]} radius={0.15} smoothness={4} castShadow>
            <meshStandardMaterial color="#17191c" roughness={0.24} metalness={0.38} />
          </RoundedBox>
          <mesh position={[0, 0, 0.105]}><planeGeometry args={[0.65, 1.18]} /><meshStandardMaterial color={phoneLit ? '#dbe8ff' : '#101114'} emissive={phoneLit ? '#547fc0' : '#000000'} emissiveIntensity={phoneLit ? 0.62 : 0} /></mesh>
          <mesh position={[0, -0.63, 0.11]}><circleGeometry args={[0.045, 18]} /><meshStandardMaterial color="#41454b" /></mesh>
        </group>
      </Hoverable>

      <group position={[-3.22, 1.55, 0.88]} rotation={[0.04, 0.36, 0]}>
        <RoundedBox args={[1.3, 0.88, 0.6]} radius={0.09} smoothness={3} castShadow><meshStandardMaterial color="#272b31" roughness={0.4} /></RoundedBox>
        <mesh position={[0, 0, 0.35]}><cylinderGeometry args={[0.25, 0.25, 0.13, 24]} /><meshStandardMaterial color="#101725" metalness={0.52} roughness={0.22} /></mesh>
        <mesh position={[0.48, 0.31, 0]}><boxGeometry args={[0.28, 0.18, 0.28]} /><meshStandardMaterial color="#353b44" /></mesh>
        <mesh position={[-0.42, 0.3, 0]}><boxGeometry args={[0.18, 0.1, 0.18]} /><meshStandardMaterial color="#b9c0c8" /></mesh>
      </group>

      <group ref={notifications} position={[2.15, 2.75, -0.58]}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} position={[index * 0.42, index * 0.25, -index * 0.19]}>
            <sphereGeometry args={[0.1 + index * 0.022, 16, 16]} />
            <meshStandardMaterial color={index === 0 ? '#d95462' : '#6f9de9'} emissive={index === 0 ? '#a51f2c' : '#2b5da8'} emissiveIntensity={active ? 0.82 : 0.12} />
          </mesh>
        ))}
      </group>

      <group position={[3.62, 1.32, -1.15]}>
        <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.34, 0.27, 0.58, 20]} /><meshStandardMaterial color="#e1e0db" roughness={0.72} /></mesh>
        <mesh position={[0.25, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.2, 0.055, 10, 22, Math.PI]} /><meshStandardMaterial color="#e1e0db" roughness={0.72} /></mesh>
      </group>

      <group position={[-3.85, 1.45, -1.0]} rotation={[0.1, 0.12, 0]}>
        <mesh castShadow><boxGeometry args={[1.6, 0.06, 1.05]} /><meshStandardMaterial color="#ece6dc" roughness={0.92} /></mesh>
        {[0, 1, 2].map((index) => <mesh key={index} position={[-0.45 + index * 0.45, 0.04, 0.12 - index * 0.16]} rotation={[-Math.PI / 2, 0, index * 0.1]}><planeGeometry args={[0.38, 0.38]} /><meshBasicMaterial color={['#668dbb', '#bc7c79', '#829c76'][index]} /></mesh>)}
      </group>

      <group position={[2.8, 1.35, -0.55]}>
        <mesh position={[0, 0.42, 0]}><torusGeometry args={[0.38, 0.08, 12, 28]} /><meshStandardMaterial color="#25272b" roughness={0.42} /></mesh>
        <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.25]}><boxGeometry args={[0.15, 0.55, 0.16]} /><meshStandardMaterial color="#282a2e" /></mesh>
        <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -0.25]}><boxGeometry args={[0.15, 0.55, 0.16]} /><meshStandardMaterial color="#282a2e" /></mesh>
      </group>

      <Plant position={[4.0, 0.1, -2.35]} scale={1.25} potColor="#d5d0c7" leafColor="#6d9a72" />
      <Cable points={[[2.72, 1.0, 1.0], [2.5, 0.25, 1.6], [0.6, 0.18, 1.8], [0.2, 1.05, 0.7]]} color="#26282d" radius={0.018} />
      <Cable points={[[0.35, 1.1, 1.0], [-0.5, 0.2, 1.5], [-2.8, 0.18, 1.6], [-3.15, 1.1, 0.7]]} color="#404247" radius={0.017} />

      <ArtifactMesh id="project-blueprint" year="2010" position={[4.2, 1.0, -0.55]} color="#8db7ff" active={active} shape="box" scale={1.35} />
      <spotLight position={[-2.4, 5.7, 2.8]} target-position={[-0.4, 1.9, 0]} color="#dbeeff" intensity={active ? 5.6 : 0.55} distance={15} angle={0.62} penumbra={0.6} castShadow={active} />
      <pointLight position={[-0.5, 3.2, 1.6]} color="#9bbcff" intensity={active ? 3.8 : 0.2} distance={9} decay={2} />
    </group>
  );
}
