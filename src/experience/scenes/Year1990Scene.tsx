'use client';

import { useMemo, useRef, useState } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { ArtifactMesh, DeviceScreen, Dust, Hoverable, Pedestal } from './SceneUtils';

const channels = [2, 3, 4, 5, 7, 9, 13];

export function Year1990Scene({ active, timeline }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['1990'];
  const { navigateToYear, openInterface } = useExperienceActions();
  const [tvOn, setTvOn] = useState(true);
  const [consoleOn, setConsoleOn] = useState(false);
  const [channelIndex, setChannelIndex] = useState(0);
  const antenna = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (antenna.current && active) antenna.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.015;
  });
  const channel = channels[channelIndex];
  const screenColor = useMemo(() => {
    if (!tvOn) return '#030303';
    if (channel === 3 && consoleOn) return '#173f2a';
    if (channel === 13) return '#302746';
    return ['#384b66', '#19334d', '#4f3b2c', '#273e38'][channelIndex % 4];
  }, [tvOn, consoleOn, channel, channelIndex]);
  const activate = () => timeline ? navigateToYear('1990') : openInterface();

  return (
    <group position={[config.stationX, 0, 0]}>
      <Pedestal position={[0, -0.25, 0]} width={10} depth={8} color="#1a1714" />
      <Dust center={[0, 2, 0]} spread={[9, 5, 7]} color="#ffdf93" active={active} />
      <mesh position={[0, 2.4, -3.1]} receiveShadow>
        <boxGeometry args={[10, 5.5, 0.16]} />
        <meshStandardMaterial color="#30281f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.15, 0.45]} receiveShadow castShadow>
        <boxGeometry args={[7.4, 0.55, 3.2]} />
        <meshStandardMaterial color="#5b3c26" roughness={0.82} />
      </mesh>

      <group position={[0, 1.75, 0]}>
        <group ref={antenna} position={[0, 2.25, -0.2]}>
          <mesh rotation={[0, 0, 0.58]} position={[-0.65, 0.45, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 2.3, 10]} />
            <meshStandardMaterial color="#a7a7a7" metalness={0.78} roughness={0.24} />
          </mesh>
          <mesh rotation={[0, 0, -0.58]} position={[0.65, 0.45, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 2.3, 10]} />
            <meshStandardMaterial color="#a7a7a7" metalness={0.78} roughness={0.24} />
          </mesh>
        </group>

        <RoundedBox args={[5.6, 3.8, 2.15]} radius={0.32} smoothness={4} castShadow>
          <meshStandardMaterial color="#4a4237" roughness={0.68} />
        </RoundedBox>
        <Hoverable label="Enter KevinVision" onClick={activate}>
          <group position={[-0.42, 0.18, 1.09]}>
            <DeviceScreen size={[4.25, 2.75]} color={screenColor} emissive={tvOn ? config.accent : '#000000'} active={active && tvOn} radius={0.28} />
            {tvOn && (
              <mesh position={[0, 0, 0.075]}>
                <planeGeometry args={[4.08, 2.58]} />
                <meshBasicMaterial color={screenColor} transparent opacity={channel === 13 ? 0.58 : 0.34} />
              </mesh>
            )}
          </group>
        </Hoverable>
        <group position={[2.18, -0.2, 1.18]}>
          <Hoverable label="Television power" onClick={() => setTvOn((value) => !value)}>
            <mesh position={[0, 0.72, 0]} castShadow>
              <cylinderGeometry args={[0.23, 0.23, 0.16, 24]} />
              <meshStandardMaterial color={tvOn ? '#f4c76d' : '#222222'} emissive={tvOn ? '#a56412' : '#000000'} emissiveIntensity={0.6} />
            </mesh>
          </Hoverable>
          <Hoverable label="Change channel" onClick={() => setChannelIndex((value) => (value + 1) % channels.length)}>
            <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.18, 24]} />
              <meshStandardMaterial color="#181818" roughness={0.5} />
            </mesh>
          </Hoverable>
          <mesh position={[0, -0.58, 0]}>
            <boxGeometry args={[0.8, 0.15, 0.12]} />
            <meshStandardMaterial color={tvOn ? '#90d5a6' : '#311a1a'} emissive={tvOn ? '#3d8c59' : '#2a0000'} emissiveIntensity={0.7} />
          </mesh>
        </group>
      </group>

      <group position={[-1.45, 0.62, 1.15]}>
        <RoundedBox args={[2.7, 0.6, 1.8]} radius={0.16} smoothness={3} castShadow>
          <meshStandardMaterial color="#b8ad95" roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.12, 0.92]}>
          <boxGeometry args={[1.05, 0.12, 0.05]} />
          <meshStandardMaterial color="#302b26" />
        </mesh>
        <Hoverable label="Console power" onClick={() => { setConsoleOn((value) => !value); setTvOn(true); setChannelIndex(1); }}>
          <mesh position={[0.88, 0.18, 0.91]}>
            <boxGeometry args={[0.42, 0.22, 0.12]} />
            <meshStandardMaterial color={consoleOn ? '#d64d4d' : '#343434'} emissive={consoleOn ? '#7f1515' : '#000000'} emissiveIntensity={0.6} />
          </mesh>
        </Hoverable>
      </group>

      <group position={[1.65, 0.4, 1.35]} rotation={[0.18, -0.2, 0]}>
        <RoundedBox args={[2.1, 0.28, 1.15]} radius={0.24} smoothness={4} castShadow>
          <meshStandardMaterial color="#8f8575" roughness={0.75} />
        </RoundedBox>
        <mesh position={[-0.55, 0.18, 0]}><boxGeometry args={[0.65, 0.1, 0.18]} /><meshStandardMaterial color="#292929" /></mesh>
        <mesh position={[-0.55, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.65, 0.1, 0.18]} /><meshStandardMaterial color="#292929" /></mesh>
        <mesh position={[0.5, 0.18, 0.17]}><sphereGeometry args={[0.14, 16, 16]} /><meshStandardMaterial color="#b33939" /></mesh>
        <mesh position={[0.8, 0.18, -0.12]}><sphereGeometry args={[0.14, 16, 16]} /><meshStandardMaterial color="#b33939" /></mesh>
      </group>

      <ArtifactMesh id="signal-fragment" year="1990" position={[3.2, 0.75, -0.25]} color="#ffd75a" active={active} shape="box" scale={1.3} />
      <pointLight position={[0, 4, 3]} color="#ffbd68" intensity={active ? 7 : 1.5} distance={12} decay={2} />
    </group>
  );
}
