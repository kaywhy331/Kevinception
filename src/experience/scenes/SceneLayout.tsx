'use client';

import { RoundedBox } from '@react-three/drei';

export const FLOOR_SURFACE_Y = 0;
export const DESK_SURFACE_Y = 1.2;
export const MEDIA_SURFACE_Y = 0.92;

export function GroundedDesk({
  position = [0, 0, 0],
  size = [8, 3.1],
  surfaceY = DESK_SURFACE_Y,
  topColor = '#5d4534',
  legColor = '#30231a',
  drawers = false
}: {
  position?: [number, number, number];
  size?: [number, number];
  surfaceY?: number;
  topColor?: string;
  legColor?: string;
  drawers?: boolean;
}) {
  const topThickness = 0.24;
  const topCenterY = surfaceY - topThickness / 2;
  const underside = surfaceY - topThickness;
  const legHeight = Math.max(0.25, underside - FLOOR_SURFACE_Y);
  const legCenterY = FLOOR_SURFACE_Y + legHeight / 2;
  const drawerHeight = Math.max(0.55, legHeight * 0.92);
  return (
    <group position={position}>
      <RoundedBox position={[0, topCenterY, 0]} args={[size[0], topThickness, size[1]]} radius={0.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={topColor} roughness={0.72} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (size[0] / 2 - 0.34), legCenterY, 0]} castShadow>
          <boxGeometry args={[0.26, legHeight, size[1] - 0.28]} />
          <meshStandardMaterial color={legColor} roughness={0.78} />
        </mesh>
      ))}
      {drawers && (
        <group position={[-size[0] / 2 + 1.08, drawerHeight / 2, 0.15]}>
          <RoundedBox args={[1.3, drawerHeight, size[1] - 0.48]} radius={0.06} smoothness={2} castShadow>
            <meshStandardMaterial color={legColor} roughness={0.74} />
          </RoundedBox>
          {[-0.29, 0, 0.29].map((offset) => (
            <group key={offset} position={[0, offset * drawerHeight, size[1] / 2 - 0.22]}>
              <mesh><boxGeometry args={[1.0, Math.max(0.18, drawerHeight * 0.23), 0.04]} /><meshStandardMaterial color={topColor} roughness={0.7} /></mesh>
              <mesh position={[0.34, 0, 0.04]}><boxGeometry args={[0.15, 0.032, 0.032]} /><meshStandardMaterial color="#252525" metalness={0.5} /></mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

export function MediaConsole({
  position = [0, 0, 0],
  size = [7.4, 2.35],
  surfaceY = MEDIA_SURFACE_Y,
  topColor = '#5f3e29',
  bodyColor = '#352416'
}: {
  position?: [number, number, number];
  size?: [number, number];
  surfaceY?: number;
  topColor?: string;
  bodyColor?: string;
}) {
  const topThickness = 0.2;
  const topCenterY = surfaceY - topThickness / 2;
  const cabinetHeight = surfaceY - topThickness - 0.04;
  const cabinetCenterY = cabinetHeight / 2;
  return (
    <group position={position}>
      <RoundedBox position={[0, topCenterY, 0]} args={[size[0], topThickness, size[1]]} radius={0.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={topColor} roughness={0.78} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} position={[side * (size[0] / 2 - 1.0), cabinetCenterY, 0]} args={[1.55, cabinetHeight, size[1] - 0.22]} radius={0.06} smoothness={2} castShadow>
          <meshStandardMaterial color={bodyColor} roughness={0.8} />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.17, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[size[0] - 3.25, 0.16, size[1] - 0.45]} />
        <meshStandardMaterial color={bodyColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.56, -size[1] / 2 + 0.18]}>
        <boxGeometry args={[size[0] - 3.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#1d1814" roughness={0.75} />
      </mesh>
    </group>
  );
}

export function FloorPedestal({
  position,
  size = [1, 0.55, 1],
  color = '#d4d9dc',
  accent
}: {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  accent?: string;
}) {
  return (
    <group position={position}>
      <RoundedBox position={[0, size[1] / 2, 0]} args={size} radius={Math.min(0.16, size[1] * 0.22)} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.12} />
      </RoundedBox>
      {accent && (
        <mesh position={[0, size[1] * 0.62, size[2] / 2 + 0.025]}>
          <boxGeometry args={[size[0] * 0.62, 0.055, 0.04]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
        </mesh>
      )}
    </group>
  );
}

export function WallDisplay({
  position,
  size = [2.5, 1.5],
  frameColor = '#68747f',
  screenColor = '#d9f6ff',
  accent = '#64e8ff',
  active = false,
  rotation = [0, 0, 0]
}: {
  position: [number, number, number];
  size?: [number, number];
  frameColor?: string;
  screenColor?: string;
  accent?: string;
  active?: boolean;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[size[0], size[1], 0.12]} radius={0.06} smoothness={2} castShadow>
        <meshStandardMaterial color={frameColor} metalness={0.38} roughness={0.32} />
      </RoundedBox>
      <mesh position={[0, 0, 0.071]}>
        <planeGeometry args={[size[0] - 0.16, size[1] - 0.16]} />
        <meshStandardMaterial color={screenColor} emissive={accent} emissiveIntensity={active ? 0.18 : 0.04} roughness={0.28} />
      </mesh>
      {[-0.3, 0, 0.3].map((offset, index) => (
        <mesh key={offset} position={[offset * size[0], size[1] * 0.18 - index * size[1] * 0.18, 0.085]}>
          <boxGeometry args={[size[0] * (0.18 + index * 0.03), 0.035, 0.02]} />
          <meshBasicMaterial color={index === 2 ? accent : '#b9c8ca'} transparent opacity={0.78} />
        </mesh>
      ))}
    </group>
  );
}
