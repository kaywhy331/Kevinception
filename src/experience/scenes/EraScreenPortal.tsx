'use client';

import { PerspectiveCamera, RenderTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { YearId } from '@/content/data';
import { eraConfigs } from '../config';
import { useExperienceStore } from '../store';
import type { Quality } from '../types';
import {
  resolveScreenPortalMode,
  SCREEN_PORTAL_BUDGET,
  SCREEN_PORTAL_TARGETS,
  type ScreenPortalSourceYear
} from './screenPortalPolicy';

export {
  resolveScreenPortalMode,
  SCREEN_PORTAL_BUDGET,
  SCREEN_PORTAL_TARGETS
} from './screenPortalPolicy';
export type { ScreenPortalSourceYear } from './screenPortalPolicy';

const PORTAL_BACKGROUNDS: Record<YearId, string> = {
  '1990': '#25180e',
  '2000': '#081426',
  '2010': '#2a241b',
  '2020': '#110c18',
  '2030': '#2a1c12',
  '2040': '#080604'
};

function PortalSignal({ accent, animate }: { accent: string; animate: boolean }) {
  const signal = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!animate) return;
    const time = clock.elapsedTime;
    if (signal.current) {
      signal.current.rotation.z = time * 0.18;
      signal.current.scale.setScalar(0.92 + Math.sin(time * 1.35) * 0.08);
    }
    if (scan.current) scan.current.position.y = -0.85 + ((time * 0.34) % 1.7);
  });

  return (
    <>
      <group ref={signal} position={[0, 1.22, 0.65]}>
        {[0, 1, 2].map((index) => {
          const angle = (index / 3) * Math.PI * 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * 0.46, Math.sin(angle) * 0.18, 0]}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      <mesh ref={scan} position={[0, -0.55, 1.02]}>
        <planeGeometry args={[5.6, 0.045]} />
        <meshBasicMaterial color={accent} transparent opacity={0.38} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function PortalVignette({ year, animate }: { year: YearId; animate: boolean }) {
  const accent = eraConfigs[year].accent;
  return (
    <group position={[0, -0.28, 0]}>
      <mesh position={[0, -1.05, -0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color={PORTAL_BACKGROUNDS[year]} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.65, -2.15]}>
        <planeGeometry args={[10, 5.5]} />
        <meshStandardMaterial color={PORTAL_BACKGROUNDS[year]} roughness={0.95} />
      </mesh>

      {year === '2000' && (
        <group>
          <mesh position={[0, -0.55, 0]} castShadow><boxGeometry args={[5.2, 0.28, 2.2]} /><meshStandardMaterial color="#6f523d" roughness={0.72} /></mesh>
          <mesh position={[-0.4, 0.52, 0]} castShadow><boxGeometry args={[3.25, 2.25, 0.72]} /><meshStandardMaterial color="#bcb7a6" roughness={0.62} /></mesh>
          <mesh position={[-0.4, 0.62, 0.38]}><planeGeometry args={[2.55, 1.52]} /><meshBasicMaterial color="#1d638e" toneMapped={false} /></mesh>
          <mesh position={[2.15, 0.08, -0.05]} castShadow><boxGeometry args={[0.95, 2.3, 1.05]} /><meshStandardMaterial color="#aaa697" roughness={0.68} /></mesh>
          {[0, 1, 2, 3].map((index) => <mesh key={index} position={[1.45 + index * 0.27, -0.31, 1.12]}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color={index % 2 ? '#6bbcff' : '#70e78b'} toneMapped={false} /></mesh>)}
        </group>
      )}

      {year === '2010' && (
        <group>
          <mesh position={[0, -0.62, 0]} castShadow><boxGeometry args={[5.7, 0.3, 2.25]} /><meshStandardMaterial color="#665444" roughness={0.72} /></mesh>
          <mesh position={[0.25, 0.45, -0.05]} castShadow><boxGeometry args={[3.8, 2.1, 0.28]} /><meshStandardMaterial color="#444a50" metalness={0.28} roughness={0.35} /></mesh>
          <mesh position={[0.25, 0.48, 0.11]}><planeGeometry args={[3.35, 1.68]} /><meshBasicMaterial color="#dce5e8" toneMapped={false} /></mesh>
          {[-1.05, -0.35, 0.35, 1.05].map((x, index) => <mesh key={x} position={[0.25 + x, 0.48 + Math.sin(index) * 0.18, 0.15]}><boxGeometry args={[0.34, 0.22, 0.04]} /><meshBasicMaterial color={index === 2 ? '#e58d2f' : '#557c9c'} toneMapped={false} /></mesh>)}
          {[[-2.15, -0.25], [2.15, -0.2], [1.5, -0.75]].map(([x, y], index) => <mesh key={index} position={[x, y, 0.72]} castShadow><boxGeometry args={[0.78, 0.62, 0.78]} /><meshStandardMaterial color={index === 1 ? '#a87848' : '#b9874f'} roughness={0.86} /></mesh>)}
        </group>
      )}

      {year === '2020' && (
        <group>
          <mesh position={[0, -0.62, 0]} castShadow><boxGeometry args={[5.8, 0.28, 2.25]} /><meshStandardMaterial color="#242329" roughness={0.68} /></mesh>
          <mesh position={[-1.3, 0.34, 0.18]} castShadow><boxGeometry args={[0.78, 1.65, 0.2]} /><meshStandardMaterial color="#0f1014" metalness={0.45} roughness={0.25} /></mesh>
          <mesh position={[-1.3, 0.36, 0.3]}><planeGeometry args={[0.6, 1.36]} /><meshBasicMaterial color="#b92d66" toneMapped={false} /></mesh>
          <mesh position={[-1.3, 0.35, -0.08]}><torusGeometry args={[1.02, 0.07, 12, 40]} /><meshBasicMaterial color="#fff0d2" toneMapped={false} /></mesh>
          <mesh position={[1.35, 0.36, -0.05]} castShadow><boxGeometry args={[2.35, 1.58, 0.24]} /><meshStandardMaterial color="#454951" metalness={0.34} roughness={0.38} /></mesh>
          <mesh position={[1.35, 0.36, 0.09]}><planeGeometry args={[2.05, 1.28]} /><meshBasicMaterial color="#31527c" toneMapped={false} /></mesh>
        </group>
      )}

      {year === '2030' && (
        <group>
          <mesh position={[0, -0.62, 0]} castShadow><boxGeometry args={[5.8, 0.3, 2.4]} /><meshStandardMaterial color="#5d4028" roughness={0.75} /></mesh>
          <mesh position={[0, 0.6, -0.25]}><planeGeometry args={[5.2, 2.65]} /><meshStandardMaterial color="#35251a" emissive="#8a572d" emissiveIntensity={0.22} roughness={0.8} /></mesh>
          <mesh position={[0.15, -0.28, 0.72]} castShadow><cylinderGeometry args={[0.32, 0.38, 0.46, 20]} /><meshStandardMaterial color="#d8c5aa" roughness={0.58} /></mesh>
          <mesh position={[0.48, -0.12, 0.76]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.045, 10, 24, Math.PI * 1.6]} /><meshStandardMaterial color="#d8c5aa" roughness={0.58} /></mesh>
          <mesh position={[-1.75, 0.32, 0.25]}><boxGeometry args={[1.25, 1.75, 0.16]} /><meshStandardMaterial color="#1d211f" emissive="#d69b50" emissiveIntensity={0.3} /></mesh>
          <mesh position={[1.72, 0.18, 0.3]}><torusGeometry args={[0.72, 0.035, 12, 42]} /><meshBasicMaterial color="#d69b50" transparent opacity={0.72} toneMapped={false} /></mesh>
        </group>
      )}

      <PortalSignal accent={accent} animate={animate} />
      <ambientLight intensity={1.4} color="#fff5e8" />
      <directionalLight position={[2.5, 5.5, 4]} intensity={2.8} color="#fff0d1" />
      <pointLight position={[-2, 1.8, 2.6]} color={accent} intensity={3.2} distance={9} />
    </group>
  );
}

function StaticPortalPreview({ targetYear, size, quality }: {
  targetYear: YearId;
  size: [number, number];
  quality: Quality;
}) {
  const accent = eraConfigs[targetYear].accent;
  const xScale = size[0] / 4;
  const yScale = size[1] / 2.5;
  return (
    <group>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial color={PORTAL_BACKGROUNDS[targetYear]} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.012]} scale={[xScale, yScale, 1]}>
        {targetYear === '2000' && <><mesh position={[-0.2, 0.08, 0]}><planeGeometry args={[2.25, 1.36]} /><meshBasicMaterial color="#bcb7a6" /></mesh><mesh position={[-0.2, 0.08, 0.01]}><planeGeometry args={[1.72, 0.92]} /><meshBasicMaterial color="#1d638e" toneMapped={false} /></mesh><mesh position={[1.35, -0.12, 0]}><planeGeometry args={[0.48, 1.55]} /><meshBasicMaterial color="#aaa697" /></mesh></>}
        {targetYear === '2010' && <><mesh position={[0, 0.02, 0]}><planeGeometry args={[3.1, 1.38]} /><meshBasicMaterial color="#dce5e8" /></mesh>{[-1.05, -0.35, 0.35, 1.05].map((x, index) => <mesh key={x} position={[x, index % 2 ? -0.15 : 0.18, 0.01]}><planeGeometry args={[0.35, 0.24]} /><meshBasicMaterial color={index === 2 ? '#e58d2f' : '#557c9c'} /></mesh>)}</>}
        {targetYear === '2020' && <><mesh position={[-0.75, 0, 0]}><ringGeometry args={[0.67, 0.78, 32]} /><meshBasicMaterial color="#fff0d2" toneMapped={false} /></mesh><mesh position={[-0.75, 0, 0.01]}><planeGeometry args={[0.42, 1.22]} /><meshBasicMaterial color="#b92d66" toneMapped={false} /></mesh><mesh position={[0.75, 0, 0]}><planeGeometry args={[1.15, 0.9]} /><meshBasicMaterial color="#31527c" toneMapped={false} /></mesh></>}
        {targetYear === '2030' && <><mesh position={[-0.75, 0.1, 0]}><planeGeometry args={[0.85, 1.42]} /><meshBasicMaterial color="#59402b" /></mesh><mesh position={[0.18, -0.28, 0]}><circleGeometry args={[0.28, 24]} /><meshBasicMaterial color="#d8c5aa" /></mesh><mesh position={[0.82, 0.08, 0]}><ringGeometry args={[0.5, 0.54, 34]} /><meshBasicMaterial color="#d69b50" transparent opacity={0.78} toneMapped={false} /></mesh></>}
        {quality !== 'lite' && [-0.72, -0.36, 0, 0.36, 0.72].map((y) => <mesh key={y} position={[0, y, 0.025]}><planeGeometry args={[3.85, 0.018]} /><meshBasicMaterial color={accent} transparent opacity={0.13} depthWrite={false} toneMapped={false} /></mesh>)}
      </group>
      <mesh position={[0, -size[1] * 0.43, 0.028]}><planeGeometry args={[size[0] * 0.82, Math.max(0.025, size[1] * 0.025)]} /><meshBasicMaterial color={accent} transparent opacity={quality === 'lite' ? 0.42 : 0.78} toneMapped={false} /></mesh>
    </group>
  );
}

export function EraScreenPortal({ fromYear, size, position = [0, 0, 0], rotation = [0, 0, 0], active, enabled = true }: {
  fromYear: ScreenPortalSourceYear;
  size: [number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  active: boolean;
  enabled?: boolean;
}) {
  const quality = useExperienceStore((state) => state.quality);
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const targetYear = SCREEN_PORTAL_TARGETS[fromYear];
  const mode = resolveScreenPortalMode({ quality, active, enabled, focused: viewMode === 'interface' || viewMode === 'text' });

  if (mode === 'off') return null;

  return (
    <group position={position} rotation={rotation} userData={{ portalFrom: fromYear, portalTo: targetYear, portalMode: mode }}>
      {mode === 'live' ? (
        <mesh renderOrder={8} raycast={() => {}}>
          <planeGeometry args={size} />
          <meshBasicMaterial toneMapped={false}>
            <RenderTexture
              attach="map"
              width={SCREEN_PORTAL_BUDGET.width}
              height={SCREEN_PORTAL_BUDGET.height}
              samples={SCREEN_PORTAL_BUDGET.samples}
              frames={motion === 'full' ? Infinity : 1}
              renderPriority={-1}
              depthBuffer
              stencilBuffer={false}
              generateMipmaps={false}
            >
              <color attach="background" args={[PORTAL_BACKGROUNDS[targetYear]]} />
              <PerspectiveCamera
                makeDefault
                manual
                aspect={SCREEN_PORTAL_BUDGET.width / SCREEN_PORTAL_BUDGET.height}
                position={[0, 2.05, 8.2]}
                rotation={[-0.16, 0, 0]}
                fov={36}
                near={0.1}
                far={30}
              />
              <PortalVignette year={targetYear} animate={motion === 'full'} />
            </RenderTexture>
          </meshBasicMaterial>
        </mesh>
      ) : <StaticPortalPreview targetYear={targetYear} size={size} quality={quality} />}
    </group>
  );
}
