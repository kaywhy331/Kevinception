'use client';

import { Line, RoundedBox } from '@react-three/drei';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { LightBar, PictureFrame, RoomShell, Shelf } from './EnvironmentPrimitives';
import { DESK_SURFACE_Y, GroundedDesk } from './SceneLayout';

const systemMapPoints: Array<[number, number, number]> = [
  [-0.72, 0.28, 0.267], [-0.42, 0.12, 0.267], [-0.12, 0.28, 0.267], [0.18, 0.12, 0.267],
  [0.48, 0.28, 0.267], [0.78, 0.12, 0.267], [1.08, 0.28, 0.267], [1.38, 0.12, 0.267]
];

function Parcel({ position, size, color = '#b9874f', tape = '#e7d2a1', rotation = [0, 0, 0] }: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  tape?: string;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={size} radius={0.045} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.88} />
      </RoundedBox>
      <mesh position={[0, size[1] / 2 + 0.012, 0]}><boxGeometry args={[size[0] * 0.18, 0.025, size[2] * 0.96]} /><meshStandardMaterial color={tape} roughness={0.72} /></mesh>
      <mesh position={[size[0] * 0.2, 0, size[2] / 2 + 0.012]}><planeGeometry args={[size[0] * 0.34, size[1] * 0.38]} /><meshBasicMaterial color="#f1eee3" /></mesh>
      <mesh position={[size[0] * 0.2, 0, size[2] / 2 + 0.016]}><boxGeometry args={[size[0] * 0.2, 0.025, 0.008]} /><meshBasicMaterial color="#30343a" /></mesh>
    </group>
  );
}

function InventoryBin({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.86, 0.42, 0.58]} radius={0.055} smoothness={2} castShadow><meshStandardMaterial color={color} roughness={0.7} /></RoundedBox>
      <mesh position={[0, 0.02, 0.3]}><planeGeometry args={[0.5, 0.16]} /><meshBasicMaterial color="#f2efe6" /></mesh>
      {Array.from({ length: Math.min(label.length, 6) }).map((_, index) => <mesh key={index} position={[-0.17 + index * 0.065, 0.02, 0.307]}><boxGeometry args={[0.035, 0.065, 0.008]} /><meshBasicMaterial color="#363b42" /></mesh>)}
    </group>
  );
}

export function Year2010Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2010'];
  const { enterYear, discover } = useExperienceActions();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#625848" wallColor="#d4d0c5" sideColor="#b8b4aa" ceilingColor="#ebe7dd" trimColor="#5b5b57" accent={config.accent} openLeft openRight active={active} floorRoughness={0.9} />
      <Dust center={[0, 2.8, 0]} spread={[9.2, 5.4, 7]} color="#e6d7bd" active={active} count={active ? 26 : 8} />
      <GroundedDesk position={[0.45, 0, 0.55]} size={[6.9, 2.75]} topColor="#665444" legColor="#35322f" drawers />

      <group position={[-3.72, 1.88, -3.04]}>
        <Shelf position={[0, 0, 0]} size={[2.35, 3.45, 0.72]} levels={4} color="#60666a" frameColor="#353a3e" />
        <InventoryBin position={[-0.58, 1.27, 0.08]} color="#365f78" label="A01" />
        <InventoryBin position={[0.48, 1.27, 0.08]} color="#477a68" label="A02" />
        <InventoryBin position={[-0.58, 0.42, 0.08]} color="#7d6743" label="B14" />
        <InventoryBin position={[0.48, 0.42, 0.08]} color="#764d49" label="Q4" />
        <Parcel position={[-0.53, -0.54, 0.08]} size={[0.9, 0.48, 0.62]} />
        <Parcel position={[0.48, -0.54, 0.08]} size={[0.82, 0.38, 0.6]} color="#a87848" />
        <Parcel position={[0, -1.28, 0.08]} size={[1.65, 0.48, 0.65]} color="#b4814d" />
      </group>

      <LightBar position={[-2.15, 5.5, -2.6]} length={3.2} color="#fff1cf" intensity={active ? 0.82 : 0.08} />
      <LightBar position={[2.75, 5.5, -2.6]} length={3.2} color="#d5e9ff" intensity={active ? 0.68 : 0.07} />

      <Hoverable label="Discover Project Blueprint" onClick={() => discover('project-blueprint', '2010')}>
        <group>
          <PictureFrame position={[2.95, 4.18, -3.35]} size={[2.55, 1.34]} frameColor="#3f4141" imageColor="#d8e2e6" accent="#5d91bd" />
          {[-0.62, 0, 0.62].map((x, index) => <mesh key={x} position={[2.95 + x, 4.18 + (index === 1 ? 0.22 : -0.16), -3.275]}><boxGeometry args={[0.42, 0.12, 0.018]} /><meshBasicMaterial color={index === 1 ? '#e69a42' : '#557c9c'} /></mesh>)}
          <Line points={[[2.33, 4.02, -3.26], [2.95, 4.4, -3.26], [3.57, 4.02, -3.26]]} color="#557c9c" lineWidth={1.5} />
        </group>
      </Hoverable>

      <Hoverable label="Open Commerce Operations" onClick={() => enterYear('2010')}>
        <group position={[0.82, DESK_SURFACE_Y + 0.22, 0.58]} rotation={[0, -0.035, 0]}>
          <RoundedBox args={[3.8, 0.16, 1.82]} radius={0.075} smoothness={3} castShadow><meshStandardMaterial color="#4d5359" metalness={0.35} roughness={0.36} /></RoundedBox>
          <mesh position={[0, 0.09, 0.36]}><boxGeometry args={[1.08, 0.026, 0.67]} /><meshStandardMaterial color="#363b3f" metalness={0.42} /></mesh>
          <group position={[0, 1.15, -0.82]} rotation={[-0.035, 0, 0]}>
            <RoundedBox args={[3.8, 2.18, 0.2]} radius={0.1} smoothness={4} castShadow><meshStandardMaterial color="#444a50" metalness={0.38} roughness={0.32} /></RoundedBox>
            <DeviceScreen position={[0, 0, 0.13]} size={[3.48, 1.88]} color="#f4f6f8" emissive="#73a9d6" active={active} radius={0.07} glass />
            <mesh position={[0, 0.7, 0.23]}><boxGeometry args={[3.23, 0.21, 0.018]} /><meshBasicMaterial color="#263442" /></mesh>
            <mesh position={[-1.22, 0.68, 0.25]}><boxGeometry args={[0.58, 0.1, 0.018]} /><meshBasicMaterial color="#ffb548" /></mesh>
            <mesh position={[-1.22, 0.27, 0.24]}><boxGeometry args={[0.62, 0.48, 0.018]} /><meshBasicMaterial color="#e7edf1" /></mesh>
            {[-0.22, 0.02, 0.26].map((y, index) => <mesh key={y} position={[-1.22, y, 0.255]}><boxGeometry args={[0.42 - index * 0.05, 0.035, 0.01]} /><meshBasicMaterial color={index === 0 ? '#5d91bd' : '#8698a5'} /></mesh>)}
            <mesh position={[0.62, 0.06, 0.24]}><boxGeometry args={[1.9, 1.12, 0.018]} /><meshBasicMaterial color="#edf1f3" /></mesh>
            <Line points={systemMapPoints} color="#8b9da7" lineWidth={1.4} transparent opacity={0.98} />
            {systemMapPoints.map((point, index) => <mesh key={index} position={point}><boxGeometry args={[0.16, 0.11, 0.014]} /><meshBasicMaterial color={index === 3 || index === 4 ? '#e58d2f' : '#557c9c'} /></mesh>)}
            <Line points={[[-0.72, -0.27, 0.267], [1.38, -0.27, 0.267]]} color="#c4cfd4" lineWidth={1} transparent opacity={0.9} />
            {[-0.55, -0.05, 0.45, 0.95].map((x, index) => <mesh key={x} position={[x, -0.27, 0.27]}><boxGeometry args={[0.24, 0.07, 0.014]} /><meshBasicMaterial color={index === 3 ? '#e5a144' : '#7791a0'} /></mesh>)}
          </group>
        </group>
      </Hoverable>

      <group position={[-1.95, DESK_SURFACE_Y + 0.34, 0.72]} rotation={[0.02, 0.1, 0]}>
        <RoundedBox args={[1.05, 0.64, 0.66]} radius={0.07} smoothness={3} castShadow><meshStandardMaterial color="#d8d9d5" roughness={0.48} /></RoundedBox>
        <mesh position={[0, 0.12, 0.35]}><boxGeometry args={[0.72, 0.18, 0.035]} /><meshStandardMaterial color="#30363b" /></mesh>
        <mesh position={[0, -0.17, 0.39]} rotation={[-0.08, 0, 0]}><planeGeometry args={[0.72, 0.38]} /><meshBasicMaterial color="#f5f3eb" /></mesh>
        {Array.from({ length: 6 }).map((_, index) => <mesh key={index} position={[-0.24 + index * 0.1, -0.17, 0.405]}><boxGeometry args={[0.035, 0.2, 0.008]} /><meshBasicMaterial color="#25292d" /></mesh>)}
      </group>

      <group position={[3.62, DESK_SURFACE_Y + 0.12, 0.9]}>
        <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.36, 0.07, 14, 36, Math.PI * 1.65]} /><meshStandardMaterial color="#d7c4a0" roughness={0.78} /></mesh>
        <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.14, 0.19, 0.18, 16]} /><meshStandardMaterial color="#43474a" metalness={0.25} /></mesh>
      </group>

      <Parcel position={[-2.75, 0.34, 1.72]} size={[1.35, 0.68, 1.02]} rotation={[0, 0.12, 0]} />
      <Parcel position={[-3.55, 0.22, 2.25]} size={[0.92, 0.44, 0.72]} color="#a87949" rotation={[0, -0.2, 0]} />
      <Parcel position={[3.82, 0.44, -1.65]} size={[1.52, 0.88, 1.08]} color="#b18150" rotation={[0, -0.12, 0]} />
      <Parcel position={[3.92, 1.12, -1.7]} size={[1.02, 0.48, 0.82]} color="#aa7748" rotation={[0, 0.14, 0]} />

      <spotLight position={[-1.2, 5.7, 2.8]} target-position={[0.8, 2.35, 0]} color="#fff2d5" intensity={active ? 4.0 : 0.36} distance={15} angle={0.64} penumbra={0.68} castShadow={active} />
      {active && <pointLight position={[1.0, 3.4, 1.4]} color="#8fbbe1" intensity={2.2} distance={8} decay={2} />}
    </group>
  );
}
