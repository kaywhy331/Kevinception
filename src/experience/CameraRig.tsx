'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { eraConfigs, getCameraTweenSeconds } from './config';
import { useExperienceStore } from './store';
import type { ViewMode } from './types';

const TARGET_HORIZONTAL_FOV = THREE.MathUtils.degToRad(68);
/** Half the width of the six-room row, including the outer walls. */
const ROW_HALF_WIDTH = 35.5;

type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
};

export function responsiveVerticalFov(aspect: number) {
  return THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(TARGET_HORIZONTAL_FOV / 2) / aspect)), 32, 48);
}

/**
 * The Chapters overview frames all six rooms. Wide screens look straight at the
 * row; tall screens look down its length so every room still fits.
 */
export function overviewPose(aspect: number): CameraPose {
  const halfHorizontalFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(responsiveVerticalFov(aspect)) / 2) * aspect);
  if (aspect >= 1.15) {
    const distance = ROW_HALF_WIDTH / Math.tan(halfHorizontalFov);
    return { position: [0, 3.6 + distance * 0.2, 3.6 + distance * 0.98], target: [0, 2.7, 0] };
  }
  return { position: [-43, 13.5, 27], target: [6, 1.6, -4] };
}

function poseFor(viewMode: ViewMode, stationX: number, width: number, aspect: number, futureRoom: boolean): CameraPose {
  const narrow = width < 760;
  const ultraWide = aspect > 2.15;
  if (viewMode === 'timeline') return overviewPose(aspect);
  if (viewMode === 'interface') return {
    position: [stationX, narrow ? 4.5 : 3.85, narrow ? 12.2 : 8.6],
    target: [stationX, 1.8, 0]
  };
  if (viewMode === 'text') return {
    position: [stationX, 5.8, 12.8],
    target: [stationX, 1.8, 0]
  };
  return {
    position: [stationX, narrow ? 5.75 : ultraWide ? 4.95 : 5.1, narrow ? 14.5 : futureRoom ? 11.9 : ultraWide ? 10.75 : 11.25],
    target: [stationX, futureRoom ? 2.2 : ultraWide ? 2.3 : 2.15, -0.1]
  };
}

export function ExperienceCameraRig() {
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const motion = useExperienceStore((state) => state.motion);
  const transition = useExperienceStore((state) => state.transition);
  const base = useRef({ x: 0, y: 6, z: 16 });
  const target = useRef({ x: 0, y: 1.7, z: 0 });
  const lookTarget = useRef(new THREE.Vector3());
  const previousView = useRef<ViewMode>(viewMode);
  const stationX = eraConfigs[activeYear].stationX;
  const aspect = size.width / Math.max(1, size.height);
  const futureRoom = activeYear === '2030' || activeYear === '2040';

  const pose = useMemo(() => poseFor(viewMode, stationX, size.width, aspect, futureRoom), [aspect, futureRoom, stationX, viewMode, size.width]);

  useEffect(() => {
    const fromView = previousView.current;
    previousView.current = viewMode;
    const snap = () => {
      gsap.killTweensOf(base.current);
      gsap.killTweensOf(target.current);
      Object.assign(base.current, { x: pose.position[0], y: pose.position[1], z: pose.position[2] });
      Object.assign(target.current, { x: pose.target[0], y: pose.target[1], z: pose.target[2] });
      invalidate();
    };
    const tween = (duration: number, delay = 0) => {
      const options = { duration, delay, ease: 'power2.inOut', overwrite: true, onUpdate: invalidate };
      const position = gsap.to(base.current, { x: pose.position[0], y: pose.position[1], z: pose.position[2], ...options });
      const look = gsap.to(target.current, { x: pose.target[0], y: pose.target[1], z: pose.target[2], ...options });
      return () => { position.kill(); look.kill(); };
    };
    if (motion !== 'full') {
      snap();
      return;
    }
    if (transition && transition.id !== 'timeline-fade') {
      const seconds = transition.duration / 1000;
      // Move while the authored overlay covers the screen: a time jump cuts at
      // full cover, an adjacent bridge glides through the middle of the effect.
      if (transition.id === 'time-jump') {
        const timer = window.setTimeout(snap, transition.duration * 0.22);
        return () => window.clearTimeout(timer);
      }
      return tween(seconds * 0.62, seconds * 0.14);
    }
    return tween(getCameraTweenSeconds(motion, fromView === 'timeline' || viewMode === 'timeline'));
  }, [pose, motion, viewMode, transition, invalidate]);

  useEffect(() => {
    if (!('fov' in camera)) return;
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = responsiveVerticalFov(aspect);
    perspective.near = 0.1;
    perspective.far = 180;
    perspective.updateProjectionMatrix();
    invalidate();
  }, [aspect, camera, invalidate]);

  useFrame(() => {
    const parallaxDisabled = motion !== 'full' || (futureRoom && viewMode !== 'timeline') || viewMode === 'interface' || viewMode === 'text' || transition?.id === 'time-jump';
    const parallax = parallaxDisabled ? 0 : viewMode === 'timeline' ? 0.35 : 0.09;
    camera.position.set(base.current.x + pointer.x * parallax, base.current.y + pointer.y * parallax * 0.45, base.current.z);
    lookTarget.current.set(target.current.x, target.current.y, target.current.z);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

export { ExperienceCameraRig as CameraRig };
