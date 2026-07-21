'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { Cable, PictureFrame, RoomShell, Rug } from './EnvironmentPrimitives';
import { MEDIA_SURFACE_Y, MediaConsole } from './SceneLayout';

const channels = [2, 3, 4, 5, 7, 9, 13];

export function Year1990Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['1990'];
  const { enterYear, discover } = useExperienceActions();
  const [tvOn, setTvOn] = useState(true);
  const [consoleOn, setConsoleOn] = useState(false);
  const [channelIndex, setChannelIndex] = useState(0);
  const antenna = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!active || !antenna.current) return;
    antenna.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.012;
  });
  const channel = channels[channelIndex];
  const screenColor = useMemo(() => {
    if (!tvOn) return '#020202';
    if (channel === 3 && consoleOn) return '#103927';
    if (channel === 13) return '#312545';
    return ['#3a526d', '#18344f', '#5a4735', '#26433d'][channelIndex % 4];
  }, [tvOn, consoleOn, channel, channelIndex]);

  const toggleConsole = () => {
    setConsoleOn((value) => !value);
    setTvOn(true);
    setChannelIndex(1);
    discover('signal-fragment', '1990');
  };

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#6c5140" wallColor="#59422f" sideColor="#4b382b" ceilingColor="#2f2924" trimColor="#2b211b" accent={config.accent} openRight active={active} floorRoughness={0.96} />
      <Rug position={[0, 0.015, 0.9]} size={[7.1, 3.8]} color="#5c3f34" borderColor="#b88c50" />
      <Dust center={[0, 2.5, 0]} spread={[9, 5.5, 7]} color="#ffdf93" active={active} count={active ? 62 : 14} />
      <MediaConsole position={[0, 0, 0.2]} size={[7.5, 2.45]} topColor="#5f3e29" bodyColor="#352416" />
      <PictureFrame position={[-3.7, 3.75, -3.36]} size={[1.5, 1.95]} frameColor="#2c1b11" imageColor="#7e6a4b" accent="#ffca6c" />
      <PictureFrame position={[3.3, 4.05, -3.36]} size={[2.1, 1.25]} frameColor="#241b16" imageColor="#40566f" accent="#6cb6ff" />

      <group position={[-4.05, 0, -1.25]}>
        <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[0.08, 0.1, 2.55, 14]} /><meshStandardMaterial color="#49382a" roughness={0.72} /></mesh>
        <mesh position={[0, 2.66, 0]} castShadow><coneGeometry args={[0.78, 0.9, 28, 1, true]} /><meshStandardMaterial color="#d8bc83" emissive="#d59437" emissiveIntensity={active ? 0.24 : 0.04} roughness={0.86} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.08, 0]} castShadow><cylinderGeometry args={[0.62, 0.72, 0.12, 24]} /><meshStandardMaterial color="#2e211a" roughness={0.78} /></mesh>
        {active && <pointLight position={[0, 2.5, 0.2]} color="#ffc978" intensity={3.2} distance={8} decay={2} />}
      </group>

      <group position={[0, 2.78, -0.5]}>
        <group ref={antenna} position={[0, 1.9, -0.34]}>
          <mesh rotation={[0, 0, 0.55]} position={[-0.52, 0.34, 0]} castShadow><cylinderGeometry args={[0.03, 0.03, 1.75, 10]} /><meshStandardMaterial color="#aeb0ad" metalness={0.78} roughness={0.23} /></mesh>
          <mesh rotation={[0, 0, -0.55]} position={[0.52, 0.34, 0]} castShadow><cylinderGeometry args={[0.03, 0.03, 1.75, 10]} /><meshStandardMaterial color="#aeb0ad" metalness={0.78} roughness={0.23} /></mesh>
          <mesh position={[0, -0.43, 0]} castShadow><cylinderGeometry args={[0.34, 0.42, 0.16, 20]} /><meshStandardMaterial color="#1f2022" roughness={0.55} /></mesh>
        </group>
        <RoundedBox args={[5.35, 3.55, 2.05]} radius={0.33} smoothness={5} castShadow><meshStandardMaterial color="#2c2d30" roughness={0.58} /></RoundedBox>
        <mesh position={[0, -1.67, 0.14]} castShadow><boxGeometry args={[4.05, 0.15, 1.18]} /><meshStandardMaterial color="#1f2022" roughness={0.68} /></mesh>
        <Hoverable label="Enter KevinVision" onClick={() => enterYear('1990')}>
          <group position={[-0.42, 0.12, 1.04]}>
            <DeviceScreen size={[3.88, 2.5]} color={screenColor} emissive={tvOn ? config.accent : '#000000'} active={active && tvOn} radius={0.27} />
            {tvOn && <mesh position={[0, 0, 0.105]}><planeGeometry args={[3.62, 2.26]} /><meshBasicMaterial color={screenColor} transparent opacity={channel === 13 ? 0.46 : 0.25} /></mesh>}
            {tvOn && <group position={[-1.5, 0.96, 0.14]}><mesh><boxGeometry args={[0.4, 0.23, 0.04]} /><meshStandardMaterial color="#0d1114" transparent opacity={0.72} /></mesh><mesh position={[0, 0, 0.025]}><planeGeometry args={[0.31, 0.14]} /><meshBasicMaterial color="#e9f0da" /></mesh></group>}
          </group>
        </Hoverable>
        <group position={[1.95, -0.1, 1.06]}>
          <Hoverable label="Television power" onClick={() => setTvOn((value) => !value)}><mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[0.19, 0.19, 0.15, 24]} /><meshStandardMaterial color={tvOn ? '#d8b354' : '#24201d'} emissive={tvOn ? '#7c4b0b' : '#000000'} emissiveIntensity={0.5} roughness={0.38} /></mesh></Hoverable>
          <Hoverable label="Change channel" onClick={() => setChannelIndex((value) => (value + 1) % channels.length)}><mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.31, 0.31, 0.18, 24]} /><meshStandardMaterial color="#111214" roughness={0.42} /></mesh></Hoverable>
          {Array.from({ length: 6 }).map((_, index) => <mesh key={index} position={[-0.16 + (index % 2) * 0.32, -0.52 - Math.floor(index / 2) * 0.13, 0]}><boxGeometry args={[0.2, 0.032, 0.05]} /><meshStandardMaterial color="#151619" roughness={0.82} /></mesh>)}
          <mesh position={[0, -1.18, 0]}><boxGeometry args={[0.62, 0.1, 0.09]} /><meshStandardMaterial color={tvOn ? '#7ec597' : '#291717'} emissive={tvOn ? '#2f8a52' : '#250000'} emissiveIntensity={0.68} /></mesh>
        </group>
      </group>

      <group position={[-1.25, MEDIA_SURFACE_Y + 0.27, 1.55]}>
        <RoundedBox args={[2.45, 0.5, 1.25]} radius={0.12} smoothness={4} castShadow><meshStandardMaterial color="#c8c6bd" roughness={0.62} /></RoundedBox>
        <mesh position={[-0.2, 0.2, -0.12]} castShadow><boxGeometry args={[1.35, 0.09, 0.72]} /><meshStandardMaterial color="#3d3e40" roughness={0.48} /></mesh>
        <mesh position={[-0.28, 0.0, 0.64]}><boxGeometry args={[1.15, 0.1, 0.045]} /><meshStandardMaterial color="#151618" /></mesh>
        <Hoverable label="Console power" onClick={toggleConsole}><mesh position={[0.78, 0.04, 0.64]} castShadow><boxGeometry args={[0.3, 0.2, 0.11]} /><meshStandardMaterial color={consoleOn ? '#c93e3c' : '#4b4b48'} emissive={consoleOn ? '#741010' : '#000000'} emissiveIntensity={0.6} /></mesh></Hoverable>
        <mesh position={[0.78, -0.13, 0.64]}><boxGeometry args={[0.3, 0.08, 0.08]} /><meshStandardMaterial color="#77766f" /></mesh>
      </group>

      <group position={[1.35, MEDIA_SURFACE_Y + 0.12, 1.68]} rotation={[0.03, -0.12, 0]}>
        <RoundedBox args={[1.45, 0.22, 0.62]} radius={0.11} smoothness={4} castShadow><meshStandardMaterial color="#55565a" roughness={0.66} /></RoundedBox>
        <mesh position={[-0.4, 0.13, 0]}><boxGeometry args={[0.44, 0.08, 0.13]} /><meshStandardMaterial color="#17181a" /></mesh>
        <mesh position={[-0.4, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.44, 0.08, 0.13]} /><meshStandardMaterial color="#17181a" /></mesh>
        <mesh position={[0.32, 0.14, 0.08]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#b43e3e" /></mesh>
        <mesh position={[0.55, 0.14, -0.08]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#b43e3e" /></mesh>
        <mesh position={[-0.02, 0.12, -0.2]}><boxGeometry args={[0.18, 0.035, 0.07]} /><meshStandardMaterial color="#222326" /></mesh>
        <mesh position={[0.18, 0.12, -0.2]}><boxGeometry args={[0.18, 0.035, 0.07]} /><meshStandardMaterial color="#222326" /></mesh>
      </group>

      <Cable points={[[-0.25, 1.14, 1.8], [0.25, 0.92, 2.0], [1.05, 0.94, 1.98], [1.35, 1.03, 1.72]]} color="#1c1a18" radius={0.018} />

      <group position={[3.35, MEDIA_SURFACE_Y + 0.07, 0.78]}>{[0, 1, 2].map((index) => <mesh key={index} position={[0, index * 0.14, index * 0.02]} rotation={[0.03, 0.08 * index, 0]} castShadow><boxGeometry args={[0.95, 0.12, 0.62]} /><meshStandardMaterial color={['#2f4b68', '#7b3d31', '#5d6840'][index]} roughness={0.8} /></mesh>)}</group>

      <spotLight position={[0, 5.6, 3.0]} target-position={[0, 1.8, 0]} color="#ffbd68" intensity={active ? 5.0 : 0.42} distance={15} angle={0.62} penumbra={0.62} castShadow={active} />
      {active && <pointLight position={[0, 3.4, 1.8]} color={screenColor} intensity={3.3} distance={8} decay={2} />}
    </group>
  );
}
