'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, Desk, PictureFrame, RoomShell, Rug } from './EnvironmentPrimitives';

const channels = [2, 3, 4, 5, 7, 9, 13];

export function Year1990Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['1990'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [tvOn, setTvOn] = useState(true);
  const [consoleOn, setConsoleOn] = useState(false);
  const [channelIndex, setChannelIndex] = useState(0);
  const antenna = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (antenna.current && active) antenna.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.014;
  });
  const channel = channels[channelIndex];
  const screenColor = useMemo(() => {
    if (!tvOn) return '#020202';
    if (channel === 3 && consoleOn) return '#103927';
    if (channel === 13) return '#312545';
    return ['#3a526d', '#18344f', '#5a4735', '#26433d'][channelIndex % 4];
  }, [tvOn, consoleOn, channel, channelIndex]);
  const activate = () => timeline ? navigateToYear('1990') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#6c5140" wallColor="#59422f" sideColor="#4b382b" ceilingColor="#2f2924" trimColor="#2b211b" accent={config.accent} openRight active={active} floorRoughness={0.96} />
      <Rug position={[0, 0.015, 1.0]} size={[7.1, 3.9]} color="#5c3f34" borderColor="#b88c50" />
      <Dust center={[0, 2.5, 0]} spread={[9, 5.5, 7]} color="#ffdf93" active={active} count={95} />
      <Desk position={[0, 0, 0.15]} size={[7.6, 2.6]} topColor="#5f3e29" legColor="#352416" drawers />
      <PictureFrame position={[-3.7, 3.75, -3.36]} size={[1.5, 1.95]} frameColor="#2c1b11" imageColor="#7e6a4b" accent="#ffca6c" />
      <PictureFrame position={[3.3, 4.05, -3.36]} size={[2.1, 1.25]} frameColor="#241b16" imageColor="#40566f" accent="#6cb6ff" />

      <group position={[-4.05, 0, -1.25]}>
        <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[0.08, 0.1, 2.55, 14]} /><meshStandardMaterial color="#49382a" roughness={0.72} /></mesh>
        <mesh position={[0, 2.66, 0]} castShadow><coneGeometry args={[0.78, 0.9, 28, 1, true]} /><meshStandardMaterial color="#d8bc83" emissive="#d59437" emissiveIntensity={active ? 0.28 : 0.06} roughness={0.86} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.08, 0]} castShadow><cylinderGeometry args={[0.62, 0.72, 0.12, 24]} /><meshStandardMaterial color="#2e211a" roughness={0.78} /></mesh>
        <pointLight position={[0, 2.5, 0.2]} color="#ffc978" intensity={active ? 3.8 : 0.7} distance={8} decay={2} />
      </group>

      <group position={[0, 3.0, -0.02]}>
        <group ref={antenna} position={[0, 2.3, -0.45]}>
          <mesh rotation={[0, 0, 0.58]} position={[-0.67, 0.48, 0]} castShadow><cylinderGeometry args={[0.035, 0.035, 2.35, 10]} /><meshStandardMaterial color="#aeb0ad" metalness={0.78} roughness={0.23} /></mesh>
          <mesh rotation={[0, 0, -0.58]} position={[0.67, 0.48, 0]} castShadow><cylinderGeometry args={[0.035, 0.035, 2.35, 10]} /><meshStandardMaterial color="#aeb0ad" metalness={0.78} roughness={0.23} /></mesh>
          <mesh position={[0, -0.55, 0]} castShadow><cylinderGeometry args={[0.42, 0.5, 0.18, 20]} /><meshStandardMaterial color="#2f2a25" roughness={0.55} /></mesh>
        </group>
        <RoundedBox args={[6.0, 4.05, 2.38]} radius={0.35} smoothness={5} castShadow><meshStandardMaterial color="#4b4135" roughness={0.62} /></RoundedBox>
        <mesh position={[0, -1.92, 0.25]} castShadow><boxGeometry args={[4.7, 0.18, 1.42]} /><meshStandardMaterial color="#342d26" roughness={0.68} /></mesh>
        <Hoverable label="Enter KevinVision" onClick={activate}>
          <group position={[-0.48, 0.15, 1.23]}>
            <DeviceScreen size={[4.35, 2.82]} color={screenColor} emissive={tvOn ? config.accent : '#000000'} active={active && tvOn} radius={0.31} />
            {tvOn && <mesh position={[0, 0, 0.105]}><planeGeometry args={[4.05, 2.55]} /><meshBasicMaterial color={screenColor} transparent opacity={channel === 13 ? 0.48 : 0.28} /></mesh>}
            {tvOn && <group position={[-1.72, 1.12, 0.14]}><mesh><boxGeometry args={[0.48, 0.28, 0.04]} /><meshStandardMaterial color="#0d1114" transparent opacity={0.72} /></mesh><mesh position={[0, 0, 0.025]}><planeGeometry args={[0.38, 0.18]} /><meshBasicMaterial color="#e9f0da" /></mesh></group>}
          </group>
        </Hoverable>
        <group position={[2.23, -0.08, 1.26]}>
          <Hoverable label="Television power" onClick={() => setTvOn((value) => !value)}><mesh position={[0, 0.82, 0]} castShadow><cylinderGeometry args={[0.23, 0.23, 0.17, 24]} /><meshStandardMaterial color={tvOn ? '#f0bf59' : '#24201d'} emissive={tvOn ? '#9c5f0e' : '#000000'} emissiveIntensity={0.62} roughness={0.38} /></mesh></Hoverable>
          <Hoverable label="Change channel" onClick={() => setChannelIndex((value) => (value + 1) % channels.length)}><mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.35, 0.35, 0.2, 24]} /><meshStandardMaterial color="#171513" roughness={0.42} /></mesh></Hoverable>
          {Array.from({ length: 8 }).map((_, index) => <mesh key={index} position={[-0.2 + (index % 2) * 0.4, -0.62 - Math.floor(index / 2) * 0.13, 0]}><boxGeometry args={[0.26, 0.035, 0.055]} /><meshStandardMaterial color="#191714" roughness={0.82} /></mesh>)}
          <mesh position={[0, -1.36, 0]}><boxGeometry args={[0.78, 0.12, 0.1]} /><meshStandardMaterial color={tvOn ? '#7ec597' : '#291717'} emissive={tvOn ? '#2f8a52' : '#250000'} emissiveIntensity={0.72} /></mesh>
        </group>
      </group>

      <group position={[-1.48, 1.4, 1.08]}>
        <RoundedBox args={[2.85, 0.65, 1.78]} radius={0.17} smoothness={4} castShadow><meshStandardMaterial color="#b8ae98" roughness={0.67} /></RoundedBox>
        <mesh position={[-0.25, 0.23, 0.2]} castShadow><boxGeometry args={[1.3, 0.16, 0.78]} /><meshStandardMaterial color="#4c463e" roughness={0.52} /></mesh>
        <mesh position={[-0.25, 0.33, 0.2]}><boxGeometry args={[0.9, 0.04, 0.46]} /><meshStandardMaterial color="#161513" /></mesh>
        <mesh position={[0, 0.15, 0.9]}><boxGeometry args={[1.1, 0.11, 0.05]} /><meshStandardMaterial color="#2c2924" /></mesh>
        <Hoverable label="Console power" onClick={() => { setConsoleOn((value) => !value); setTvOn(true); setChannelIndex(1); }}><mesh position={[0.9, 0.23, 0.91]} castShadow><boxGeometry args={[0.42, 0.24, 0.13]} /><meshStandardMaterial color={consoleOn ? '#d34a48' : '#34312c'} emissive={consoleOn ? '#7d1414' : '#000000'} emissiveIntensity={0.65} /></mesh></Hoverable>
      </group>

      <group position={[1.72, 1.26, 1.28]} rotation={[0.1, -0.18, 0.02]}>
        <RoundedBox args={[2.2, 0.3, 1.2]} radius={0.25} smoothness={4} castShadow><meshStandardMaterial color="#8d8475" roughness={0.72} /></RoundedBox>
        <mesh position={[-0.58, 0.19, 0]}><boxGeometry args={[0.68, 0.11, 0.19]} /><meshStandardMaterial color="#262521" /></mesh>
        <mesh position={[-0.58, 0.19, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.68, 0.11, 0.19]} /><meshStandardMaterial color="#262521" /></mesh>
        <mesh position={[0.5, 0.2, 0.18]}><sphereGeometry args={[0.145, 16, 16]} /><meshStandardMaterial color="#b43e3e" /></mesh>
        <mesh position={[0.82, 0.2, -0.13]}><sphereGeometry args={[0.145, 16, 16]} /><meshStandardMaterial color="#b43e3e" /></mesh>
        <mesh position={[0.06, 0.18, -0.33]}><boxGeometry args={[0.28, 0.05, 0.12]} /><meshStandardMaterial color="#242321" /></mesh>
      </group>

      <Cable points={[[-0.15, 1.25, 1.2], [0.0, 0.25, 1.75], [1.7, 0.15, 1.8], [1.8, 1.15, 1.42]]} color="#1c1a18" radius={0.024} />
      <Cable points={[[-1.55, 1.24, 0.75], [-1.8, 0.2, 0.45], [-0.2, 0.1, -0.2], [-0.1, 1.1, -0.35]]} color="#27231f" radius={0.02} />

      <group position={[3.55, 1.0, -2.55]}>{[0, 1, 2, 3].map((index) => <mesh key={index} position={[0, index * 0.18, index * 0.025]} rotation={[0.05, 0.12 * index, 0]} castShadow><boxGeometry args={[1.25, 0.16, 0.8]} /><meshStandardMaterial color={['#2f4b68', '#7b3d31', '#5d6840', '#7f6946'][index]} roughness={0.8} /></mesh>)}</group>
      <group position={[-3.5, 1.25, -2.45]}>{[0, 1, 2].map((index) => <mesh key={index} position={[index * 0.38, 0, 0]} castShadow><boxGeometry args={[0.28, 0.78, 1.05]} /><meshStandardMaterial color={['#d7c6a1', '#304a65', '#7b4837'][index]} roughness={0.82} /></mesh>)}</group>

      <ArtifactMesh id="signal-fragment" year="1990" position={[4.25, 1.08, 0.2]} color="#ffd75a" active={active} shape="box" scale={1.3} />
      <spotLight position={[0, 5.6, 3.0]} target-position={[0, 1.8, 0]} color="#ffbd68" intensity={active ? 6.5 : 1.2} distance={15} angle={0.62} penumbra={0.62} castShadow={active} />
      <pointLight position={[0, 3.6, 2.0]} color={screenColor} intensity={active && tvOn ? 4.2 : 0.35} distance={8} decay={2} />
    </group>
  );
}
