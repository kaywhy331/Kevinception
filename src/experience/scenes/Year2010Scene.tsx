'use client';

import { RoundedBox } from '@react-three/drei';
import { eraConfigs } from '../config';
import { useExperienceActions } from '../ExperienceContext';
import { DeviceScreen, Dust, Hoverable } from './SceneUtils';
import { GlassPanel, PictureFrame, Plant, RoomShell } from './EnvironmentPrimitives';
import { DESK_SURFACE_Y, GroundedDesk } from './SceneLayout';

export function Year2010Scene({ active }: { active: boolean; timeline: boolean }) {
  const config = eraConfigs['2010'];
  const { enterYear } = useExperienceActions();

  return (
    <group position={[config.stationX, 0, 0]}>
      <RoomShell floorColor="#665f58" wallColor="#d0d3d9" sideColor="#b7bdc7" ceilingColor="#e3e5e8" trimColor="#747b86" accent={config.accent} openLeft openRight active={active} floorRoughness={0.82} />
      <Dust center={[0, 2.8, 0]} spread={[9.2, 5.4, 7]} color="#c4d8ff" active={active} count={active ? 34 : 10} />
      <GroundedDesk position={[0, 0, 0.38]} size={[7.8, 3.0]} topColor="#4c4844" legColor="#2c2a29" drawers />

      <GlassPanel position={[-2.6, 4.05, -3.34]} size={[3.8, 2.4, 0.055]} color="#b9dcff" opacity={active ? 0.18 : 0.07} frameColor="#7d8794" />
      <mesh position={[-2.6, 4.05, -3.38]}><planeGeometry args={[3.58, 2.18]} /><meshBasicMaterial color="#c8dff1" transparent opacity={0.26} /></mesh>
      <mesh position={[-2.6, 3.1, -3.26]}><boxGeometry args={[3.65, 0.08, 0.08]} /><meshStandardMaterial color="#7f8892" metalness={0.35} /></mesh>
      <PictureFrame position={[3.55, 4.15, -3.35]} size={[1.55, 1.2]} frameColor="#34373d" imageColor="#6d8fb8" accent="#8db7ff" />
      <PictureFrame position={[3.0, 2.85, -3.35]} size={[1.25, 0.9]} frameColor="#48413a" imageColor="#a87c69" accent="#e8a58c" />
      <PictureFrame position={[4.15, 2.72, -3.35]} size={[1.05, 1.3]} frameColor="#2e3034" imageColor="#779178" accent="#9ad39d" />

      <Hoverable label="Open KevinBook" onClick={() => enterYear('2010')}>
        <group position={[0, DESK_SURFACE_Y + 0.12, 0.4]}>
          <mesh rotation={[-0.045, 0, 0]} castShadow>
            <boxGeometry args={[4.15, 0.2, 2.45]} />
            <meshStandardMaterial color="#777c84" metalness={0.34} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0.1, 0.4]} rotation={[-0.045, 0, 0]}>
            <boxGeometry args={[1.12, 0.032, 0.76]} />
            <meshStandardMaterial color="#55585e" metalness={0.43} roughness={0.37} />
          </mesh>
          {Array.from({ length: 30 }).map((_, index) => {
            const column = index % 10;
            const row = Math.floor(index / 10);
            return <mesh key={index} position={[-1.52 + column * 0.34, 0.13, -0.42 + row * 0.34]} rotation={[-0.045, 0, 0]}><boxGeometry args={[0.26, 0.038, 0.23]} /><meshStandardMaterial color="#4e5157" roughness={0.58} /></mesh>;
          })}
          <group position={[0, 1.34, -1.0]} rotation={[-0.035, 0, 0]}>
            <RoundedBox args={[4.1, 2.45, 0.23]} radius={0.12} smoothness={4} castShadow><meshStandardMaterial color="#727780" metalness={0.42} roughness={0.34} /></RoundedBox>
            <DeviceScreen position={[0, 0, 0.14]} size={[3.72, 2.08]} color="#edf3ff" emissive="#6c91d6" active={active} radius={0.08} glass />
            <mesh position={[-1.18, 0.62, 0.25]}><boxGeometry args={[0.92, 0.18, 0.025]} /><meshBasicMaterial color="#48649f" /></mesh>
            <mesh position={[0.3, 0.62, 0.25]}><boxGeometry args={[1.72, 0.18, 0.025]} /><meshBasicMaterial color="#c6d3eb" /></mesh>
            {[-0.48, 0.08, 0.64].map((y, index) => (
              <group key={y} position={[0, y - 0.55, 0.25]}>
                <mesh position={[-1.32, 0, 0]}><circleGeometry args={[0.12, 18]} /><meshBasicMaterial color={index === 0 ? '#7c9fd7' : '#aab8cf'} /></mesh>
                <mesh position={[0.22, 0.04, 0]}><boxGeometry args={[2.65, 0.11, 0.025]} /><meshBasicMaterial color="#c5cfdf" /></mesh>
                <mesh position={[-0.18, -0.16, 0]}><boxGeometry args={[1.85, 0.08, 0.025]} /><meshBasicMaterial color="#d5ddea" /></mesh>
              </group>
            ))}
          </group>
          {[-1, 1].map((side) => <mesh key={side} position={[side * 1.62, 0.26, -1.0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 0.42, 12]} /><meshStandardMaterial color="#565a62" metalness={0.45} roughness={0.32} /></mesh>)}
        </group>
      </Hoverable>

      <Plant position={[4.05, 0.05, -2.35]} scale={1.18} potColor="#d5d0c7" leafColor="#6d9a72" />
      <spotLight position={[-2.4, 5.7, 2.8]} target-position={[0, 2.25, 0]} color="#dbeeff" intensity={active ? 4.3 : 0.38} distance={15} angle={0.62} penumbra={0.6} castShadow={active} />
      {active && <pointLight position={[0, 3.4, 1.5]} color="#9bbcff" intensity={2.7} distance={9} decay={2} />}
    </group>
  );
}
