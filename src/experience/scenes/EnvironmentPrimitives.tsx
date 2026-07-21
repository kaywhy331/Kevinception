'use client';

import { useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RoomShell({
  width = 10.5,
  height = 6.1,
  depth = 8.2,
  floorColor,
  wallColor,
  sideColor,
  ceilingColor,
  trimColor,
  accent,
  openLeft = false,
  openRight = false,
  active = false,
  floorRoughness = 0.82
}: {
  width?: number;
  height?: number;
  depth?: number;
  floorColor: string;
  wallColor: string;
  sideColor?: string;
  ceilingColor?: string;
  trimColor?: string;
  accent: string;
  openLeft?: boolean;
  openRight?: boolean;
  active?: boolean;
  floorRoughness?: number;
}) {
  const sideDepth = 3.2;
  const sideZ = -depth / 2 + sideDepth / 2;
  const sideWall = (x: number, open: boolean) => (
    <group position={[x, 0, 0]}>
      <mesh position={[0, height / 2 - 0.1, sideZ]} receiveShadow>
        <boxGeometry args={[0.18, height, sideDepth]} />
        <meshStandardMaterial color={sideColor ?? wallColor} roughness={0.92} />
      </mesh>
      {!open && (
        <mesh position={[0, height / 2 - 0.1, 0.75]} receiveShadow>
          <boxGeometry args={[0.18, height, depth - sideDepth - 0.2]} />
          <meshStandardMaterial color={sideColor ?? wallColor} roughness={0.92} />
        </mesh>
      )}
      {open && (
        <group position={[0, 0, 0.45]}>
          <mesh position={[0, 2.4, -1.18]} castShadow><boxGeometry args={[0.28, 4.8, 0.28]} /><meshStandardMaterial color={trimColor ?? '#39404a'} metalness={0.22} roughness={0.48} /></mesh>
          <mesh position={[0, 2.4, 1.18]} castShadow><boxGeometry args={[0.28, 4.8, 0.28]} /><meshStandardMaterial color={trimColor ?? '#39404a'} metalness={0.22} roughness={0.48} /></mesh>
          <mesh position={[0, 4.75, 0]} castShadow><boxGeometry args={[0.28, 0.28, 2.65]} /><meshStandardMaterial color={trimColor ?? '#39404a'} metalness={0.22} roughness={0.48} /></mesh>
          <mesh position={[x < 0 ? 0.12 : -0.12, 2.4, 0]}>
            <boxGeometry args={[0.035, 4.55, 2.38]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={active ? 0.45 : 0.08} transparent opacity={active ? 0.3 : 0.12} />
          </mesh>
        </group>
      )}
    </group>
  );

  return (
    <group>
      <RoundedBox position={[0, -0.3, 0]} args={[width, 0.58, depth]} radius={0.12} smoothness={3} receiveShadow>
        <meshStandardMaterial color={floorColor} roughness={floorRoughness} metalness={floorRoughness < 0.4 ? 0.28 : 0.04} />
      </RoundedBox>
      <mesh position={[0, height / 2 - 0.1, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.93} />
      </mesh>
      {sideWall(-width / 2, openLeft)}
      {sideWall(width / 2, openRight)}
      <mesh position={[0, height - 0.08, -0.8]} receiveShadow>
        <boxGeometry args={[width, 0.16, depth - 1.6]} />
        <meshStandardMaterial color={ceilingColor ?? wallColor} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.12, -depth / 2 + 0.13]} receiveShadow>
        <boxGeometry args={[width - 0.2, 0.18, 0.13]} />
        <meshStandardMaterial color={trimColor ?? '#2d3038'} roughness={0.6} />
      </mesh>
      <mesh position={[0, height - 0.25, -depth / 2 + 0.14]}>
        <boxGeometry args={[width - 0.3, 0.08, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={active ? 0.24 : 0.035} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

export function CylinderBetween({ from, to, radius = 0.025, color, emissiveIntensity = 0, transparent = false, opacity = 1 }: {
  from: [number, number, number];
  to: [number, number, number];
  radius?: number;
  color: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  const midpoint = useMemo(() => new THREE.Vector3().fromArray(from).add(new THREE.Vector3().fromArray(to)).multiplyScalar(0.5), [from, to]);
  const length = useMemo(() => new THREE.Vector3().fromArray(from).distanceTo(new THREE.Vector3().fromArray(to)), [from, to]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    const direction = new THREE.Vector3().fromArray(to).sub(new THREE.Vector3().fromArray(from)).normalize();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return q;
  }, [from, to]);
  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} transparent={transparent} opacity={opacity} />
    </mesh>
  );
}

export function Cable({ points, color = '#17181c', radius = 0.025 }: { points: Array<[number, number, number]>; color?: string; radius?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 28, radius, 8, false]} />
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

export function PictureFrame({ position, rotation = [0, 0, 0], size = [1.4, 1], frameColor = '#2c2017', imageColor = '#8a6d4c', accent }: {
  position: [number, number, number]; rotation?: [number, number, number]; size?: [number, number]; frameColor?: string; imageColor?: string; accent?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[size[0], size[1], 0.12]} radius={0.04} smoothness={2} castShadow>
        <meshStandardMaterial color={frameColor} roughness={0.65} />
      </RoundedBox>
      <mesh position={[0, 0, 0.071]}>
        <planeGeometry args={[size[0] - 0.14, size[1] - 0.14]} />
        <meshStandardMaterial color={imageColor} emissive={accent ?? imageColor} emissiveIntensity={accent ? 0.06 : 0} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function Desk({ position = [0, 0, 0], size = [8, 3.2], topColor = '#5d4534', legColor = '#30231a', drawers = false }: {
  position?: [number, number, number]; size?: [number, number]; topColor?: string; legColor?: string; drawers?: boolean;
}) {
  return (
    <group position={position}>
      <RoundedBox position={[0, 1.02, 0]} args={[size[0], 0.34, size[1]]} radius={0.1} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={topColor} roughness={0.72} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (size[0] / 2 - 0.35), 0.35, 0]} castShadow>
          <boxGeometry args={[0.28, 1.4, size[1] - 0.25]} />
          <meshStandardMaterial color={legColor} roughness={0.78} />
        </mesh>
      ))}
      {drawers && (
        <group position={[size[0] / 2 - 1.1, 0.44, 0.2]}>
          <RoundedBox args={[1.35, 1.3, size[1] - 0.45]} radius={0.07} smoothness={2} castShadow>
            <meshStandardMaterial color={legColor} roughness={0.74} />
          </RoundedBox>
          {[-0.36, 0, 0.36].map((y) => (
            <group key={y} position={[0, y, size[1] / 2 - 0.2]}>
              <mesh><boxGeometry args={[1.05, 0.28, 0.04]} /><meshStandardMaterial color={topColor} roughness={0.7} /></mesh>
              <mesh position={[0.36, 0, 0.04]}><boxGeometry args={[0.16, 0.035, 0.035]} /><meshStandardMaterial color="#252525" metalness={0.5} /></mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

export function Plant({ position, scale = 1, potColor = '#d8d2c8', leafColor = '#5d8f6c' }: { position: [number, number, number]; scale?: number; potColor?: string; leafColor?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.44, 18]} />
        <meshStandardMaterial color={potColor} roughness={0.78} />
      </mesh>
      {[-0.42, -0.18, 0.12, 0.36].map((offset, index) => (
        <group key={offset} rotation={[0, offset * 1.8, offset]}>
          <mesh position={[0, 0.75 + index * 0.08, 0]} rotation={[0, 0, offset * 0.35]}>
            <cylinderGeometry args={[0.018, 0.025, 0.95 + index * 0.08, 8]} />
            <meshStandardMaterial color="#486c50" roughness={0.8} />
          </mesh>
          <mesh position={[0.12 + offset * 0.1, 0.92 + index * 0.09, 0]} rotation={[0.2, offset, 0.8]} castShadow>
            <sphereGeometry args={[0.2, 12, 8]} />
            <meshStandardMaterial color={leafColor} roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Rug({ position = [0, -0.005, 0.5], size = [6.5, 3.8], color = '#5c4435', borderColor = '#c3a26f' }: {
  position?: [number, number, number]; size?: [number, number]; color?: string; borderColor?: string;
}) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <RoundedBox args={[size[0], size[1], 0.035]} radius={0.1} smoothness={3} receiveShadow>
        <meshStandardMaterial color={borderColor} roughness={0.95} />
      </RoundedBox>
      <RoundedBox position={[0, 0, 0.022]} args={[size[0] - 0.18, size[1] - 0.18, 0.025]} radius={0.08} smoothness={3} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.98} />
      </RoundedBox>
    </group>
  );
}

export function GlassPanel({
  position,
  size,
  color = '#d9f6ff',
  opacity = 0.16,
  rotation = [0, 0, 0],
  frameColor = '#68747f'
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  opacity?: number;
  rotation?: [number, number, number];
  frameColor?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshPhysicalMaterial color={color} transparent opacity={opacity} roughness={0.08} metalness={0.02} clearcoat={1} clearcoatRoughness={0.08} depthWrite={false} />
      </mesh>
      <mesh position={[0, size[1] / 2 + 0.045, 0]}><boxGeometry args={[size[0] + 0.12, 0.09, size[2] + 0.06]} /><meshStandardMaterial color={frameColor} metalness={0.52} roughness={0.28} /></mesh>
      <mesh position={[0, -size[1] / 2 - 0.045, 0]}><boxGeometry args={[size[0] + 0.12, 0.09, size[2] + 0.06]} /><meshStandardMaterial color={frameColor} metalness={0.52} roughness={0.28} /></mesh>
      <mesh position={[size[0] / 2 + 0.045, 0, 0]}><boxGeometry args={[0.09, size[1] + 0.12, size[2] + 0.06]} /><meshStandardMaterial color={frameColor} metalness={0.52} roughness={0.28} /></mesh>
      <mesh position={[-size[0] / 2 - 0.045, 0, 0]}><boxGeometry args={[0.09, size[1] + 0.12, size[2] + 0.06]} /><meshStandardMaterial color={frameColor} metalness={0.52} roughness={0.28} /></mesh>
    </group>
  );
}

export function LightBar({
  position,
  length = 2,
  color = '#dff7ff',
  intensity = 1,
  rotation = [0, 0, 0]
}: {
  position: [number, number, number];
  length?: number;
  color?: string;
  intensity?: number;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[length, 0.09, 0.11]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} roughness={0.22} />
      </RoundedBox>
      <pointLight color={color} intensity={Math.max(0.1, intensity * 0.72)} distance={Math.max(2.5, length * 1.8)} decay={2} />
    </group>
  );
}

export function Shelf({
  position,
  size = [2.8, 2.4, 0.48],
  levels = 3,
  color = '#3a3028',
  frameColor = '#211d1a'
}: {
  position: [number, number, number];
  size?: [number, number, number];
  levels?: number;
  color?: string;
  frameColor?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[-size[0] / 2, 0, 0]} castShadow><boxGeometry args={[0.12, size[1], size[2]]} /><meshStandardMaterial color={frameColor} roughness={0.74} /></mesh>
      <mesh position={[size[0] / 2, 0, 0]} castShadow><boxGeometry args={[0.12, size[1], size[2]]} /><meshStandardMaterial color={frameColor} roughness={0.74} /></mesh>
      {Array.from({ length: levels + 1 }).map((_, index) => {
        const y = -size[1] / 2 + (size[1] / levels) * index;
        return <mesh key={index} position={[0, y, 0]} castShadow receiveShadow><boxGeometry args={[size[0], 0.11, size[2]]} /><meshStandardMaterial color={color} roughness={0.78} /></mesh>;
      })}
    </group>
  );
}

export function ArchiveColumn({
  position,
  color = '#bfefff',
  active = false,
  height = 3.4,
  radius = 0.34
}: {
  position: [number, number, number];
  color?: string;
  active?: boolean;
  height?: number;
  radius?: number;
}) {
  const ring = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.y = clock.elapsedTime * (active ? 0.22 : 0.05);
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius * 1.15, height, 24]} />
        <meshPhysicalMaterial color={color} transparent opacity={active ? 0.25 : 0.12} roughness={0.12} metalness={0.08} transmission={0.2} />
      </mesh>
      <group ref={ring}>
        {[0.2, 0.48, 0.76].map((factor) => (
          <mesh key={factor} position={[0, -height / 2 + height * factor, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 1.08, 0.018, 8, 28]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.9 : 0.18} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 0, 0]} color={color} intensity={active ? 1.1 : 0.18} distance={3} decay={2} />
    </group>
  );
}
