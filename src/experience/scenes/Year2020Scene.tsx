'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, CylinderBetween, LightBar, PictureFrame, RoomShell } from './EnvironmentPrimitives';
import { DESK_SURFACE_Y, GroundedDesk } from './SceneLayout';

export function Year2020Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2020'];
  const { enterYear } = useExperienceActions();
  const [ringOn, setRingOn] = useState(true);
  const reactions = useRef<THREE.Group>(null);
  const reactionData = useMemo(() => Array.from({ length: 6 }, (_, index) => ({
    x: (index % 3) * 0.24,
    y: Math.floor(index / 3) * 0.3,
    z: -0.08 * (index % 2),
    phase: index * 0.8
  })), []);
  useFrame(({ clock }) => {
    if (!active || !reactions.current) return;
    reactions.current.children.forEach((child, index) => {
      child.position.y = 2.0 + reactionData[index].y + Math.sin(clock.elapsedTime * 1.1 + reactionData[index].phase) * 0.08;
      child.rotation.z = clock.elapsedTime * 0.16 + index;
    });
  });

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#28242d" wallColor="#2a2731" sideColor="#211f27" ceilingColor="#18171c" trimColor="#101116" accent={config.accent} openLeft openRight active={active} floorRoughness={0.88} />
      <Dust center={[0, 2.6, 0]} spread={[9.2, 5.6, 7]} color="#ff8fb0" active={active} count={active ? 42 : 12} />
      <GroundedDesk position={[0, 0, 0.3]} size={[8.4, 3.15]} topColor="#242329" legColor="#15161a" drawers />

      {[-3.7, -1.25, 1.25, 3.7].map((x, index) => (
        <group key={x} position={[x, 4.05, -3.34]}>
          <RoundedBox args={[1.85, 1.2, 0.13]} radius={0.08} smoothness={2} castShadow><meshStandardMaterial color={index % 2 ? '#35313f' : '#242833'} roughness={0.9} /></RoundedBox>
          {Array.from({ length: 9 }).map((_, panelIndex) => <mesh key={panelIndex} position={[-0.58 + (panelIndex % 3) * 0.58, 0.34 - Math.floor(panelIndex / 3) * 0.34, 0.08]}><boxGeometry args={[0.45, 0.22, 0.05]} /><meshStandardMaterial color={panelIndex % 2 ? '#413a4e' : '#2d3442'} roughness={0.82} /></mesh>)}
        </group>
      ))}
      <LightBar position={[-3.9, 5.5, -2.5]} length={2.4} color="#4fcfff" intensity={active ? 0.9 : 0.1} rotation={[0, 0.15, 0]} />
      <LightBar position={[3.9, 5.5, -2.5]} length={2.4} color="#ff4f91" intensity={active ? 1.0 : 0.1} rotation={[0, -0.15, 0]} />
      <PictureFrame position={[0, 4.25, -3.35]} size={[1.55, 1.05]} frameColor="#13151a" imageColor="#5b3650" accent="#ff5c8a" />

      <Hoverable label="Open KevTok" onClick={() => enterYear('2020')}>
        <group position={[-0.65, DESK_SURFACE_Y + 1.55, 0.62]} rotation={[0, -0.04, 0]}>
          <RoundedBox args={[1.5, 2.9, 0.26]} radius={0.25} smoothness={5} castShadow><meshStandardMaterial color="#0f1014" metalness={0.52} roughness={0.24} /></RoundedBox>
          <DeviceScreen position={[0, 0, 0.15]} size={[1.28, 2.5]} color="#1d0d20" emissive="#ff3d7d" active={active} radius={0.17} glass />
          <mesh position={[0, -1.25, 0.28]}><boxGeometry args={[0.42, 0.035, 0.035]} /><meshStandardMaterial color="#d9d9dd" /></mesh>
          <mesh position={[0, 1.27, 0.28]}><capsuleGeometry args={[0.045, 0.12, 4, 10]} /><meshStandardMaterial color="#27282c" /></mesh>
        </group>
      </Hoverable>

      <Hoverable label="Toggle ring light" onClick={() => setRingOn((value) => !value)}>
        <group>
          <mesh position={[-0.65, 2.9, -0.02]}><torusGeometry args={[1.25, 0.085, 18, 56]} /><meshStandardMaterial color={ringOn ? '#fff5e6' : '#302d33'} emissive={ringOn ? '#fff0d2' : '#000000'} emissiveIntensity={ringOn && active ? 1.35 : 0} /></mesh>
          <mesh position={[-0.65, 2.02, -0.02]}><cylinderGeometry args={[0.045, 0.06, 1.65, 12]} /><meshStandardMaterial color="#24252a" metalness={0.62} roughness={0.36} /></mesh>
          <RoundedBox position={[-0.65, DESK_SURFACE_Y + 0.08, -0.02]} args={[0.54, 0.16, 0.38]} radius={0.05} smoothness={2} castShadow><meshStandardMaterial color="#1e1f23" roughness={0.62} /></RoundedBox>
        </group>
      </Hoverable>

      <group position={[2.65, DESK_SURFACE_Y + 0.12, 0.55]} rotation={[0.02, -0.24, 0]}>
        <RoundedBox args={[2.65, 0.2, 1.55]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#50535c" metalness={0.36} roughness={0.38} /></RoundedBox>
        <group position={[0, 0.9, -0.7]} rotation={[-0.06, 0, 0]}>
          <RoundedBox args={[2.65, 1.65, 0.16]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#454951" metalness={0.4} roughness={0.36} /></RoundedBox>
          <mesh position={[0, 0, 0.1]}><planeGeometry args={[2.38, 1.38]} /><meshStandardMaterial color="#111827" emissive="#31527c" emissiveIntensity={active ? 0.3 : 0.06} /></mesh>
          {[-0.72, -0.24, 0.24, 0.72].map((x, index) => <mesh key={x} position={[x, -0.45 + index * 0.05, 0.12]}><boxGeometry args={[0.36, 0.065, 0.025]} /><meshBasicMaterial color={index % 2 ? '#ff5c8a' : '#53dcff'} /></mesh>)}
        </group>
        <mesh position={[0, 0.12, 0.36]}><boxGeometry args={[1.0, 0.03, 0.68]} /><meshStandardMaterial color="#393b42" metalness={0.4} /></mesh>
      </group>

      <group>
        <RoundedBox position={[-3.25, DESK_SURFACE_Y + 0.08, 0.78]} args={[0.48, 0.16, 0.42]} radius={0.05} smoothness={2} castShadow><meshStandardMaterial color="#202126" /></RoundedBox>
        <CylinderBetween from={[-3.25, DESK_SURFACE_Y + 0.16, 0.75]} to={[-2.78, 2.02, 0.35]} radius={0.035} color="#2c2d32" />
        <CylinderBetween from={[-2.78, 2.02, 0.35]} to={[-2.1, 2.4, 0.02]} radius={0.035} color="#2c2d32" />
        <mesh position={[-1.98, 2.47, -0.02]} rotation={[0, 0, 0.22]} castShadow><cylinderGeometry args={[0.2, 0.26, 0.72, 22]} /><meshStandardMaterial color="#232429" metalness={0.48} roughness={0.28} /></mesh>
      </group>

      <group position={[3.65, DESK_SURFACE_Y + 0.3, -1.2]} rotation={[0.03, -0.14, 0]}>
        <RoundedBox args={[1.05, 0.6, 0.48]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#25282f" roughness={0.4} /></RoundedBox>
        <mesh position={[0, 0, 0.29]}><cylinderGeometry args={[0.22, 0.22, 0.12, 24]} /><meshStandardMaterial color="#111827" metalness={0.55} roughness={0.22} /></mesh>
        <mesh position={[-0.38, 0.21, 0]}><boxGeometry args={[0.15, 0.08, 0.15]} /><meshStandardMaterial color="#aab0b8" /></mesh>
      </group>

      <group ref={reactions} position={[0.25, 0, 0.55]} visible={active}>
        {reactionData.map((item, index) => <mesh key={index} position={[item.x, 2.0 + item.y, item.z]}>{index % 3 === 0 ? <sphereGeometry args={[0.07, 12, 12]} /> : index % 3 === 1 ? <octahedronGeometry args={[0.075]} /> : <torusGeometry args={[0.055, 0.018, 8, 14]} />}<meshStandardMaterial color={index % 2 ? '#53dcff' : '#ff5c8a'} emissive={index % 2 ? '#1b8ea9' : '#c92a62'} emissiveIntensity={0.82} /></mesh>)}
      </group>

      <group position={[-2.55, DESK_SURFACE_Y + 0.04, 0.15]} rotation={[0.01, 0.12, 0]}>
        <mesh castShadow><boxGeometry args={[1.35, 0.045, 0.92]} /><meshStandardMaterial color="#ece5d7" roughness={0.92} /></mesh>
        {[0, 1, 2].map((index) => <mesh key={index} position={[-0.4 + index * 0.4, 0.032, 0.06 - index * 0.12]} rotation={[-Math.PI / 2, 0, index * 0.08]}><planeGeometry args={[0.32, 0.32]} /><meshBasicMaterial color={['#ffcf6b', '#73d4ed', '#ff789e'][index]} /></mesh>)}
      </group>
      <Cable points={[[2.65, 1.2, 0.45], [2.4, 0.42, 1.35], [0.35, 0.25, 1.5], [-0.55, 1.08, 0.55]]} color="#14151a" radius={0.016} />
      <Cable points={[[-3.2, 1.2, 0.65], [-3.0, 0.35, 1.15], [-0.8, 0.25, 1.35], [-0.65, 1.1, 0.35]]} color="#292a30" radius={0.015} />

      <RoundedBox position={[4.05, 0.42, -0.7]} args={[0.78, 0.58, 0.78]} radius={0.1} smoothness={3} castShadow><meshStandardMaterial color="#24232b" roughness={0.52} /></RoundedBox>
      <ArtifactMesh id="next-layer-message" year="2020" position={[4.05, 0.92, -0.7]} color="#ff5c8a" active={active} shape="octahedron" scale={0.72} />
      {active && <pointLight position={[-0.65, 2.9, 1.55]} color="#fff0dc" intensity={ringOn ? 5.8 : 0.4} distance={10} decay={2} />}
      {active && <pointLight position={[0, 4.6, 2.5]} color="#ff4f91" intensity={2.5} distance={10} decay={2} />}
      {active && <pointLight position={[2.5, 3.3, 1.5]} color="#4fcfff" intensity={1.8} distance={8} decay={2} />}
    </group>
  );
}
