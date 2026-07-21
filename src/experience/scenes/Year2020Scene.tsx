'use client';

import { useMemo, useRef, useState } from 'react';
import { Line, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { LightBar, PictureFrame, RoomShell } from './EnvironmentPrimitives';
import { DESK_SURFACE_Y, GroundedDesk } from './SceneLayout';

const graphPoints: Array<[number, number, number]> = [
  [-1.0, -0.48, 0.13],
  [-0.58, -0.25, 0.13],
  [-0.12, -0.33, 0.13],
  [0.34, 0.02, 0.13],
  [0.78, 0.24, 0.13],
  [1.05, 0.5, 0.13]
];

export function Year2020Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2020'];
  const { enterYear, discover } = useExperienceActions();
  const [ringOn, setRingOn] = useState(true);
  const reactions = useRef<THREE.Group>(null);
  const reactionData = useMemo(() => Array.from({ length: 4 }, (_, index) => ({
    x: (index % 2) * 0.2,
    y: Math.floor(index / 2) * 0.24,
    z: -0.06 * (index % 2),
    phase: index * 0.8
  })), []);
  useFrame(({ clock }) => {
    if (!active || !reactions.current) return;
    reactions.current.children.forEach((child, index) => {
      child.position.y = DESK_SURFACE_Y + 0.82 + reactionData[index].y + Math.sin(clock.elapsedTime * 1.05 + reactionData[index].phase) * 0.06;
      child.rotation.z = clock.elapsedTime * 0.14 + index;
    });
  });

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#28242d" wallColor="#2a2731" sideColor="#211f27" ceilingColor="#18171c" trimColor="#101116" accent={config.accent} openLeft openRight active={active} floorRoughness={0.88} />
      <Dust center={[0, 2.8, 0]} spread={[9.2, 5.6, 7]} color="#ff8fb0" active={active} count={active ? 34 : 10} />
      <GroundedDesk position={[0, 0, 0.38]} size={[8.2, 3.0]} topColor="#242329" legColor="#15161a" drawers />

      {[-3.7, -1.25, 1.25, 3.7].map((x, index) => (
        <group key={x} position={[x, 4.05, -3.34]}>
          <RoundedBox args={[1.85, 1.2, 0.13]} radius={0.08} smoothness={2} castShadow><meshStandardMaterial color={index % 2 ? '#35313f' : '#242833'} roughness={0.9} /></RoundedBox>
          {Array.from({ length: 9 }).map((_, panelIndex) => <mesh key={panelIndex} position={[-0.58 + (panelIndex % 3) * 0.58, 0.34 - Math.floor(panelIndex / 3) * 0.34, 0.08]}><boxGeometry args={[0.45, 0.22, 0.05]} /><meshStandardMaterial color={panelIndex % 2 ? '#413a4e' : '#2d3442'} roughness={0.82} /></mesh>)}
        </group>
      ))}
      <LightBar position={[-3.9, 5.5, -2.5]} length={2.4} color="#4fcfff" intensity={active ? 0.78 : 0.08} rotation={[0, 0.15, 0]} />
      <LightBar position={[3.9, 5.5, -2.5]} length={2.4} color="#ff4f91" intensity={active ? 0.88 : 0.08} rotation={[0, -0.15, 0]} />
      <PictureFrame position={[0, 4.25, -3.35]} size={[1.55, 1.05]} frameColor="#13151a" imageColor="#5b3650" accent="#ff5c8a" />

      <Hoverable label="Open KevTok" onClick={() => { discover('next-layer-message', '2020'); enterYear('2020'); }}>
        <group position={[-0.78, DESK_SURFACE_Y + 0.75, 0.72]} rotation={[0, -0.035, 0]}>
          <RoundedBox args={[0.72, 1.35, 0.16]} radius={0.13} smoothness={5} castShadow><meshStandardMaterial color="#0f1014" metalness={0.52} roughness={0.24} /></RoundedBox>
          <DeviceScreen position={[0, 0, 0.095]} size={[0.58, 1.08]} color="#1d0d20" emissive="#ff3d7d" active={active} radius={0.1} glass />
          <mesh position={[0, -0.57, 0.18]}><boxGeometry args={[0.25, 0.025, 0.025]} /><meshStandardMaterial color="#d9d9dd" /></mesh>
          <mesh position={[0, 0.58, 0.18]}><capsuleGeometry args={[0.025, 0.07, 4, 10]} /><meshStandardMaterial color="#27282c" /></mesh>
        </group>
      </Hoverable>

      <Hoverable label="Toggle ring light" onClick={() => setRingOn((value) => !value)}>
        <group>
          <mesh position={[-0.78, DESK_SURFACE_Y + 0.78, 0.02]}><torusGeometry args={[0.82, 0.065, 18, 48]} /><meshStandardMaterial color={ringOn ? '#fff5e6' : '#302d33'} emissive={ringOn ? '#fff0d2' : '#000000'} emissiveIntensity={ringOn && active ? 1.2 : 0} /></mesh>
          <mesh position={[-0.78, DESK_SURFACE_Y + 0.36, 0.02]}><cylinderGeometry args={[0.035, 0.05, 0.72, 10]} /><meshStandardMaterial color="#24252a" metalness={0.62} roughness={0.36} /></mesh>
          <RoundedBox position={[-0.78, DESK_SURFACE_Y + 0.06, 0.02]} args={[0.44, 0.12, 0.3]} radius={0.04} smoothness={2} castShadow><meshStandardMaterial color="#1e1f23" roughness={0.62} /></RoundedBox>
        </group>
      </Hoverable>

      <group position={[2.15, DESK_SURFACE_Y + 0.12, 0.5]} rotation={[0.02, -0.18, 0]}>
        <RoundedBox args={[3.0, 0.2, 1.7]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#50535c" metalness={0.36} roughness={0.38} /></RoundedBox>
        <group position={[0, 0.96, -0.77]} rotation={[-0.055, 0, 0]}>
          <RoundedBox args={[3.0, 1.8, 0.16]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#454951" metalness={0.4} roughness={0.36} /></RoundedBox>
          <mesh position={[0, 0, 0.1]}><planeGeometry args={[2.72, 1.52]} /><meshStandardMaterial color="#111827" emissive="#31527c" emissiveIntensity={active ? 0.28 : 0.06} /></mesh>
          {[-0.52, -0.18, 0.16, 0.5].map((y) => <mesh key={y} position={[0, y, 0.115]}><boxGeometry args={[2.4, 0.018, 0.018]} /><meshBasicMaterial color="#263348" transparent opacity={0.75} /></mesh>)}
          <Line points={graphPoints} color="#5ee8ff" lineWidth={2.2} transparent opacity={0.95} />
          {graphPoints.map((point, index) => <mesh key={index} position={point}><sphereGeometry args={[0.055, 14, 14]} /><meshBasicMaterial color={index === graphPoints.length - 1 ? '#ff6b9d' : '#7ff5d4'} /></mesh>)}
        </group>
        <mesh position={[0, 0.12, 0.4]}><boxGeometry args={[1.08, 0.03, 0.72]} /><meshStandardMaterial color="#393b42" metalness={0.4} /></mesh>
      </group>

      <group position={[-3.05, DESK_SURFACE_Y + 0.35, 0.68]} rotation={[0.02, 0.16, 0]}>
        <RoundedBox args={[1.12, 0.66, 0.48]} radius={0.08} smoothness={3} castShadow><meshStandardMaterial color="#25282f" roughness={0.4} /></RoundedBox>
        <RoundedBox position={[-0.42, -0.02, 0]} args={[0.28, 0.48, 0.52]} radius={0.05} smoothness={2} castShadow><meshStandardMaterial color="#1f2228" roughness={0.42} /></RoundedBox>
        <mesh position={[0.04, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.28, 0.38, 28]} /><meshStandardMaterial color="#111827" metalness={0.55} roughness={0.22} /></mesh>
        <mesh position={[0.2, 0.4, -0.02]}><boxGeometry args={[0.42, 0.18, 0.26]} /><meshStandardMaterial color="#343944" roughness={0.38} /></mesh>
        <mesh position={[-0.38, 0.3, 0]}><boxGeometry args={[0.14, 0.08, 0.14]} /><meshStandardMaterial color="#aab0b8" /></mesh>
      </group>

      <group ref={reactions} position={[-0.25, 0, 0.45]} visible={active}>
        {reactionData.map((item, index) => <mesh key={index} position={[item.x, DESK_SURFACE_Y + 0.82 + item.y, item.z]}>{index % 2 === 0 ? <sphereGeometry args={[0.055, 12, 12]} /> : <octahedronGeometry args={[0.06]} />}<meshStandardMaterial color={index % 2 ? '#53dcff' : '#ff5c8a'} emissive={index % 2 ? '#1b8ea9' : '#c92a62'} emissiveIntensity={0.75} /></mesh>)}
      </group>

      <group position={[-2.0, DESK_SURFACE_Y + 0.04, -0.75]} rotation={[0.01, 0.1, 0]}>
        <mesh castShadow><boxGeometry args={[1.25, 0.045, 0.82]} /><meshStandardMaterial color="#ece5d7" roughness={0.92} /></mesh>
        {[0, 1, 2].map((index) => <mesh key={index} position={[-0.36 + index * 0.36, 0.032, 0.05 - index * 0.1]} rotation={[-Math.PI / 2, 0, index * 0.08]}><planeGeometry args={[0.28, 0.28]} /><meshBasicMaterial color={['#ffcf6b', '#73d4ed', '#ff789e'][index]} /></mesh>)}
      </group>

      {active && <pointLight position={[-0.78, DESK_SURFACE_Y + 0.78, 1.45]} color="#fff0dc" intensity={ringOn ? 4.8 : 0.35} distance={9} decay={2} />}
      {active && <pointLight position={[0, 4.6, 2.5]} color="#ff4f91" intensity={2.1} distance={10} decay={2} />}
      {active && <pointLight position={[2.4, 3.5, 1.5]} color="#4fcfff" intensity={1.6} distance={8} decay={2} />}
    </group>
  );
}
