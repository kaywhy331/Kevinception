'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, CylinderBetween, Desk, LightBar, PictureFrame, RoomShell } from './EnvironmentPrimitives';

export function Year2020Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2020'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [ringOn, setRingOn] = useState(true);
  const reactions = useRef<THREE.Group>(null);
  const reactionData = useMemo(() => Array.from({ length: 14 }, (_, index) => ({
    x: -0.75 + (index % 5) * 0.36,
    y: (index % 7) * 0.24,
    z: -0.12 * (index % 3),
    phase: index * 0.7
  })), []);
  useFrame(({ clock }) => {
    if (!reactions.current) return;
    reactions.current.children.forEach((child, index) => {
      child.position.y = 1.3 + reactionData[index].y + Math.sin(clock.elapsedTime * 1.15 + reactionData[index].phase) * (active ? 0.12 : 0.03);
      child.rotation.z = clock.elapsedTime * (active ? 0.2 : 0.04) + index;
    });
  });
  const activate = () => timeline ? navigateToYear('2020') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell
        floorColor="#28242d"
        wallColor="#2a2731"
        sideColor="#211f27"
        ceilingColor="#18171c"
        trimColor="#101116"
        accent={config.accent}
        openLeft
        openRight
        active={active}
        floorRoughness={0.88}
      />
      <Dust center={[0, 2.6, 0]} spread={[9.2, 5.6, 7]} color="#ff8fb0" active={active} count={72} />
      <Desk position={[0, 0, 0.3]} size={[8.4, 3.15]} topColor="#242329" legColor="#15161a" drawers />

      {[-3.7, -1.25, 1.25, 3.7].map((x, index) => (
        <group key={x} position={[x, 4.05, -3.34]}>
          <RoundedBox args={[1.85, 1.2, 0.13]} radius={0.08} smoothness={2} castShadow>
            <meshStandardMaterial color={index % 2 ? '#35313f' : '#242833'} roughness={0.9} />
          </RoundedBox>
          {Array.from({ length: 9 }).map((_, panelIndex) => (
            <mesh key={panelIndex} position={[-0.58 + (panelIndex % 3) * 0.58, 0.34 - Math.floor(panelIndex / 3) * 0.34, 0.08]}>
              <boxGeometry args={[0.45, 0.22, 0.05]} />
              <meshStandardMaterial color={panelIndex % 2 ? '#413a4e' : '#2d3442'} roughness={0.82} />
            </mesh>
          ))}
        </group>
      ))}
      <LightBar position={[-3.9, 5.5, -2.5]} length={2.4} color="#4fcfff" intensity={active ? 1.35 : 0.3} rotation={[0, 0.15, 0]} />
      <LightBar position={[3.9, 5.5, -2.5]} length={2.4} color="#ff4f91" intensity={active ? 1.45 : 0.3} rotation={[0, -0.15, 0]} />
      <PictureFrame position={[0, 4.25, -3.35]} size={[1.55, 1.05]} frameColor="#13151a" imageColor="#5b3650" accent="#ff5c8a" />

      <Hoverable label="Open KevTok" onClick={activate}>
        <group position={[-0.35, 2.82, 0.72]} rotation={[0, -0.06, 0]}>
          <RoundedBox args={[2.22, 4.35, 0.34]} radius={0.33} smoothness={5} castShadow>
            <meshStandardMaterial color="#0f1014" metalness={0.52} roughness={0.24} />
          </RoundedBox>
          <DeviceScreen position={[0, 0, 0.19]} size={[1.91, 3.78]} color="#1d0d20" emissive="#ff3d7d" active={active} radius={0.21} glass />
          <mesh position={[0, -1.9, 0.37]}><boxGeometry args={[0.56, 0.04, 0.04]} /><meshStandardMaterial color="#d9d9dd" /></mesh>
          <mesh position={[0, 1.91, 0.37]}><capsuleGeometry args={[0.055, 0.16, 4, 10]} /><meshStandardMaterial color="#27282c" /></mesh>
        </group>
      </Hoverable>

      <Hoverable label="Toggle ring light" onClick={() => setRingOn((value) => !value)}>
        <group position={[-0.35, 3.0, -0.1]}>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[1.62, 0.1, 20, 64]} />
            <meshStandardMaterial color={ringOn ? '#fff5e6' : '#302d33'} emissive={ringOn ? '#fff0d2' : '#000000'} emissiveIntensity={ringOn && active ? 2.2 : 0} />
          </mesh>
          <mesh position={[0, -2.2, 0]}><cylinderGeometry args={[0.055, 0.075, 3.25, 12]} /><meshStandardMaterial color="#24252a" metalness={0.62} roughness={0.36} /></mesh>
          <mesh position={[0, -3.78, 0]}><cylinderGeometry args={[0.72, 0.72, 0.08, 28]} /><meshStandardMaterial color="#1e1f23" roughness={0.62} /></mesh>
        </group>
      </Hoverable>

      <group position={[2.85, 1.74, 0.72]} rotation={[0.03, -0.28, 0]}>
        <RoundedBox args={[3.15, 0.22, 1.9]} radius={0.09} smoothness={3} castShadow><meshStandardMaterial color="#50535c" metalness={0.36} roughness={0.38} /></RoundedBox>
        <group position={[0, 1.03, -0.86]} rotation={[-0.07, 0, 0]}>
          <RoundedBox args={[3.15, 2.05, 0.18]} radius={0.09} smoothness={3} castShadow><meshStandardMaterial color="#454951" metalness={0.4} roughness={0.36} /></RoundedBox>
          <mesh position={[0, 0, 0.11]}><planeGeometry args={[2.83, 1.75]} /><meshStandardMaterial color="#111827" emissive="#31527c" emissiveIntensity={0.35} /></mesh>
          {[-0.9, -0.3, 0.3, 0.9].map((x, index) => <mesh key={x} position={[x, -0.57 + index * 0.06, 0.13]}><boxGeometry args={[0.46, 0.08, 0.03]} /><meshBasicMaterial color={index % 2 ? '#ff5c8a' : '#53dcff'} /></mesh>)}
        </group>
        <mesh position={[0, 0.14, 0.45]}><boxGeometry args={[1.25, 0.035, 0.82]} /><meshStandardMaterial color="#393b42" metalness={0.4} /></mesh>
      </group>

      <group position={[-3.55, 1.42, 0.65]}>
        <CylinderBetween from={[-0.8, 1.3, -0.3]} to={[0.1, 0.55, 0.1]} radius={0.04} color="#2c2d32" />
        <CylinderBetween from={[-1.15, 1.65, -0.55]} to={[-0.8, 1.3, -0.3]} radius={0.04} color="#2c2d32" />
        <mesh position={[-1.28, 1.78, -0.62]} rotation={[0, 0, 0.25]} castShadow><cylinderGeometry args={[0.25, 0.32, 0.9, 24]} /><meshStandardMaterial color="#232429" metalness={0.48} roughness={0.28} /></mesh>
        <mesh position={[0.12, 0.2, 0.1]}><cylinderGeometry args={[0.55, 0.55, 0.08, 24]} /><meshStandardMaterial color="#202126" /></mesh>
      </group>

      <group position={[3.65, 1.5, -1.35]} rotation={[0.04, -0.15, 0]}>
        <RoundedBox args={[1.3, 0.9, 0.62]} radius={0.1} smoothness={3} castShadow><meshStandardMaterial color="#25282f" roughness={0.4} /></RoundedBox>
        <mesh position={[0, 0, 0.36]}><cylinderGeometry args={[0.26, 0.26, 0.14, 24]} /><meshStandardMaterial color="#111827" metalness={0.55} roughness={0.22} /></mesh>
        <mesh position={[-0.48, 0.32, 0]}><boxGeometry args={[0.18, 0.1, 0.18]} /><meshStandardMaterial color="#aab0b8" /></mesh>
      </group>
      <group position={[4.0, 1.1, 0.85]}>
        <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.05, 0.07, 2.0, 10]} /><meshStandardMaterial color="#33343a" metalness={0.55} /></mesh>
        <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.6, 0.6, 0.08, 26]} /><meshStandardMaterial color="#202126" /></mesh>
        {[-1, 1].map((side) => <mesh key={side} position={[side * 0.42, 0.35, 0]} rotation={[0, 0, side * -0.45]}><cylinderGeometry args={[0.035, 0.04, 0.95, 10]} /><meshStandardMaterial color="#33343a" /></mesh>)}
      </group>

      <group ref={reactions} position={[1.15, 0, -0.55]}>
        {reactionData.map((item, index) => (
          <mesh key={index} position={[item.x, 1.3 + item.y, item.z]}>
            {index % 3 === 0 ? <sphereGeometry args={[0.1, 14, 14]} /> : index % 3 === 1 ? <octahedronGeometry args={[0.11]} /> : <torusGeometry args={[0.08, 0.025, 8, 16]} />}
            <meshStandardMaterial color={index % 2 ? '#53dcff' : '#ff5c8a'} emissive={index % 2 ? '#1b8ea9' : '#c92a62'} emissiveIntensity={active ? 0.9 : 0.12} />
          </mesh>
        ))}
      </group>

      <group position={[-2.55, 1.35, -1.5]} rotation={[0.02, 0.15, 0]}>
        <mesh castShadow><boxGeometry args={[1.45, 0.045, 1.05]} /><meshStandardMaterial color="#ece5d7" roughness={0.92} /></mesh>
        {[0, 1, 2].map((index) => <mesh key={index} position={[-0.45 + index * 0.45, 0.035, 0.08 - index * 0.15]} rotation={[-Math.PI / 2, 0, index * 0.1]}><planeGeometry args={[0.36, 0.36]} /><meshBasicMaterial color={['#ffcf6b', '#73d4ed', '#ff789e'][index]} /></mesh>)}
      </group>
      <Cable points={[[2.8, 1.2, 0.5], [2.5, 0.25, 1.4], [0.4, 0.18, 1.5], [-0.2, 1.05, 0.5]]} color="#14151a" radius={0.018} />
      <Cable points={[[-3.5, 1.2, 0.4], [-3.2, 0.2, 1.2], [-0.4, 0.14, 1.5], [-0.3, 0.9, 0.3]]} color="#292a30" radius={0.017} />

      <ArtifactMesh id="next-layer-message" year="2020" position={[4.25, 1.0, -0.65]} color="#ff5c8a" active={active} shape="octahedron" scale={1.2} />
      <pointLight position={[-0.4, 3.0, 1.8]} color="#fff0dc" intensity={ringOn && active ? 10 : 1.0} distance={12} decay={2} />
      <pointLight position={[0, 4.7, 2.8]} color="#ff4f91" intensity={active ? 4.5 : 0.7} distance={11} decay={2} />
      <pointLight position={[2.6, 3.5, 1.8]} color="#4fcfff" intensity={active ? 3.2 : 0.5} distance={9} decay={2} />
    </group>
  );
}
