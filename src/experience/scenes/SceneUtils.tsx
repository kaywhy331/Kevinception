'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Html, RoundedBox, useCursor } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store';

const GLOW_SECONDS = 1.4;

/** A brief expanding ring that marks an artifact the moment it is recovered. */
function DiscoveryGlow({ position }: { position: [number, number, number] }) {
  const ring = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const started = useRef<number | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const [done, setDone] = useState(false);
  useFrame(({ clock }) => {
    if (done || !ring.current || !material.current) return;
    started.current ??= clock.elapsedTime;
    const progress = Math.min(1, (clock.elapsedTime - started.current) / GLOW_SECONDS);
    ring.current.scale.setScalar(0.35 + progress * 1.9);
    material.current.opacity = 0.85 * (1 - progress);
    if (progress >= 1) setDone(true);
    else invalidate();
  });
  useEffect(() => { invalidate(); }, [invalidate]);
  if (done) return null;
  return (
    <mesh ref={ring} position={position} raycast={() => {}} renderOrder={30}>
      <ringGeometry args={[0.32, 0.4, 40]} />
      <meshBasicMaterial ref={material} color="#fff3c4" transparent opacity={0.85} depthTest={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * Wraps an interactive object. In a room (environment view) it shows a visible
 * hotspot pip anchored above the object, whose label appears on hover or focus;
 * it is also the keyboard control. In the overview and behind layers it is inert.
 */
export function Hoverable({ children, onClick, label, found }: { children: React.ReactNode; onClick: () => void; label: string; found?: boolean }) {
  const interactive = useExperienceStore((state) => state.viewMode === 'environment');
  const [hovered, setHovered] = useState(false);
  const [anchor, setAnchor] = useState<[number, number, number] | null>(null);
  const group = useRef<THREE.Group>(null);
  const wasFound = useRef(found);
  const [celebrate, setCelebrate] = useState(false);
  useCursor(hovered && interactive, 'pointer', 'auto');

  useLayoutEffect(() => {
    const node = group.current;
    if (!node) return;
    node.updateWorldMatrix(true, true);
    const box = new THREE.Box3();
    node.children.forEach((child) => box.expandByObject(child));
    if (box.isEmpty()) return;
    const top = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, box.max.z);
    node.worldToLocal(top);
    setAnchor([top.x, top.y + 0.16, top.z]);
  }, []);

  useEffect(() => {
    if (found && !wasFound.current) setCelebrate(true);
    wasFound.current = found;
  }, [found]);

  useEffect(() => {
    if (!interactive) setHovered(false);
  }, [interactive]);

  return (
    <group
      ref={group}
      onClick={interactive ? (event) => { event.stopPropagation(); onClick(); } : undefined}
      onPointerOver={interactive ? (event) => { event.stopPropagation(); setHovered(true); } : undefined}
      onPointerOut={interactive ? () => setHovered(false) : undefined}
      userData={{ label }}
      scale={hovered ? 1.025 : 1}
    >
      {children}
      {celebrate && anchor && <DiscoveryGlow position={anchor} />}
      {interactive && anchor && (
        <Html position={anchor} center className="scene-hotspot-control" zIndexRange={[8, 0]}>
          <button
            type="button"
            className={`scene-hotspot${hovered ? ' is-hovered' : ''}${found ? ' is-found' : ''}`}
            onClick={onClick}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <i aria-hidden="true"></i>
            <span>{label}</span>
          </button>
        </Html>
      )}
    </group>
  );
}

export function DeviceScreen({
  position = [0, 0, 0],
  size = [4, 2.4],
  color = '#10182c',
  emissive = '#19264a',
  active = false,
  radius = 0.12,
  glass = false
}: {
  position?: [number, number, number];
  size?: [number, number];
  color?: string;
  emissive?: string;
  active?: boolean;
  radius?: number;
  glass?: boolean;
}) {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  useEffect(() => {
    if (material.current && !active) material.current.emissiveIntensity = 0.16;
  }, [active]);
  useFrame(({ clock }) => {
    if (!active || !material.current) return;
    material.current.emissiveIntensity = 0.52 + Math.sin(clock.elapsedTime * 1.5) * 0.065;
  });
  return (
    <group position={position}>
      <RoundedBox args={[size[0], size[1], 0.12]} radius={radius} smoothness={4}>
        <meshStandardMaterial ref={material} color={color} emissive={emissive} roughness={glass ? 0.18 : 0.38} metalness={glass ? 0.22 : 0.1} />
      </RoundedBox>
      {glass && (
        <RoundedBox position={[0, 0.02, 0.075]} args={[size[0] * 0.985, size[1] * 0.985, 0.035]} radius={radius * 0.92} smoothness={4}>
          <meshPhysicalMaterial color="#d9f1ff" transmission={0.18} transparent opacity={0.18} roughness={0.08} metalness={0.08} clearcoat={1} clearcoatRoughness={0.08} />
        </RoundedBox>
      )}
    </group>
  );
}

type ScreenTextLine = { text: string; size: number; color?: string; weight?: number };

/**
 * Draws short lines of era text into a canvas texture (no web-font download).
 * Used for the 1990 channel read-out and the 2000 sign-on screen.
 */
export function useScreenTexture(lines: ScreenTextLine[], { width = 512, height = 320, background = '#000000', font = 'ui-monospace, Menlo, Consolas, monospace', scanlines = false }: {
  width?: number; height?: number; background?: string; font?: string; scanlines?: boolean;
} = {}) {
  const key = JSON.stringify(lines);
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    const total = lines.reduce((sum, line) => sum + line.size * 1.3, 0);
    let y = (height - total) / 2;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    lines.forEach((line) => {
      context.font = `${line.weight ?? 700} ${line.size}px ${font}`;
      context.fillStyle = line.color ?? '#ffffff';
      context.fillText(line.text, width / 2, y, width * 0.9);
      y += line.size * 1.3;
    });
    if (scanlines) {
      context.fillStyle = 'rgba(0,0,0,0.18)';
      for (let row = 0; row < height; row += 4) context.fillRect(0, row, width, 1);
    }
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
    // `key` captures the line content, so a new array with the same text reuses the texture.
  }, [key, width, height, background, font, scanlines]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

export function Dust({ center, count = 80, spread = [8, 5, 7], color = '#ffffff', active = true }: {
  center: [number, number, number]; count?: number; spread?: [number, number, number]; color?: string; active?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    let seed = 1337;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = center[0] + (random() - 0.5) * spread[0];
      array[i * 3 + 1] = center[1] + (random() - 0.5) * spread[1];
      array[i * 3 + 2] = center[2] + (random() - 0.5) * spread[2];
    }
    return array;
  }, [center, count, spread]);
  useFrame(({ clock }) => {
    if (ref.current && active) ref.current.rotation.y = clock.elapsedTime * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.018} transparent opacity={active ? 0.42 : 0.08} depthWrite={false} />
    </points>
  );
}
