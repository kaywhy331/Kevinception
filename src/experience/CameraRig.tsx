'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { eraConfigs } from './config';
import { useExperienceStore } from './store';

export function CameraRig() {
  const { camera, pointer, size, invalidate } = useThree();
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const motion = useExperienceStore((state) => state.motion);
  const base = useRef({ x: 0, y: 6, z: 16 });
  const target = useRef({ x: 0, y: 1.7, z: 0 });
  const stationX = eraConfigs[activeYear].stationX;
  const pose = useMemo(() => {
    const narrow = size.width < 760;
    if (viewMode === 'timeline') return { position: [stationX, narrow ? 6.4 : 6.8, narrow ? 17 : 15.5], target: [stationX, 1.65, 0] };
    if (viewMode === 'interface') return { position: [stationX, narrow ? 4.4 : 3.6, narrow ? 11.8 : 8.2], target: [stationX, 1.65, 0] };
    if (viewMode === 'text') return { position: [stationX, 5.6, 12.2], target: [stationX, 1.5, 0] };
    return { position: [stationX, narrow ? 5.6 : 5.2, narrow ? 14 : 10.8], target: [stationX, 1.55, 0] };
  }, [stationX, viewMode, size.width]);

  useEffect(() => {
    const duration = motion === 'reduced' ? 0.01 : viewMode === 'transition' ? 1.2 : 0.85;
    gsap.to(base.current, { x: pose.position[0], y: pose.position[1], z: pose.position[2], duration, ease: 'power3.inOut', onUpdate: invalidate });
    gsap.to(target.current, { x: pose.target[0], y: pose.target[1], z: pose.target[2], duration, ease: 'power3.inOut', onUpdate: invalidate });
  }, [pose, motion, viewMode, invalidate]);

  useEffect(() => {
    if ('fov' in camera) {
      const perspective = camera as THREE.PerspectiveCamera;
      perspective.fov = size.width < 760 ? 48 : 42;
      perspective.near = 0.1;
      perspective.far = 160;
      perspective.updateProjectionMatrix();
    }
  }, [camera, size.width]);

  useFrame(() => {
    const parallax = motion === 'reduced' || viewMode === 'interface' || viewMode === 'text' ? 0 : 0.18;
    camera.position.set(base.current.x + pointer.x * parallax, base.current.y + pointer.y * parallax * 0.55, base.current.z);
    camera.lookAt(new THREE.Vector3(target.current.x, target.current.y, target.current.z));
  });
  return null;
}
