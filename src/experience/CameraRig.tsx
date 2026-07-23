'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { eraConfigs, type Vec3 } from './config';
import { useExperienceStore } from './store';

const TARGET_HORIZONTAL_FOV = THREE.MathUtils.degToRad(68);

export function ExperienceCameraRig() {
  const { camera, pointer, size, invalidate } = useThree();
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const motion = useExperienceStore((state) => state.motion);
  const transition = useExperienceStore((state) => state.transition);
  const base = useRef({ x: 0, y: 6, z: 16 });
  const target = useRef({ x: 0, y: 1.7, z: 0 });
  const lookTarget = useRef(new THREE.Vector3());
  const config = eraConfigs[activeYear];
  const aspect = size.width / Math.max(1, size.height);
  const futureRoom = activeYear === '2030' || activeYear === '2040';

  const pose = useMemo(() => {
    const narrow = size.width < 760;
    const ultraWide = aspect > 2.15;
    const key = viewMode === 'interface' || viewMode === 'text' || viewMode === 'timeline' ? viewMode : 'environment';
    const authored = config.artDirection.camera[key];
    const position: Vec3 = [
      authored.position[0],
      authored.position[1] + (narrow ? 0.7 : ultraWide ? -0.15 : 0),
      authored.position[2] + (narrow ? 2.5 : ultraWide ? -0.5 : 0)
    ];
    const target: Vec3 = [
      authored.target[0],
      authored.target[1] + (ultraWide ? 0.15 : 0),
      authored.target[2]
    ];
    return { position, target };
  }, [aspect, config, viewMode, size.width]);

  useEffect(() => {
    if (transition?.id === 'time-jump') {
      gsap.killTweensOf(base.current);
      gsap.killTweensOf(target.current);
      base.current.x = pose.position[0];
      base.current.y = pose.position[1];
      base.current.z = pose.position[2];
      target.current.x = pose.target[0];
      target.current.y = pose.target[1];
      target.current.z = pose.target[2];
      invalidate();
      return;
    }
    const duration = motion === 'reduced' ? 0.01 : viewMode === 'transition' ? 0.52 : 0.48;
    const positionTween = gsap.to(base.current, { x: pose.position[0], y: pose.position[1], z: pose.position[2], duration, ease: 'power2.inOut', overwrite: true, onUpdate: invalidate });
    const targetTween = gsap.to(target.current, { x: pose.target[0], y: pose.target[1], z: pose.target[2], duration, ease: 'power2.inOut', overwrite: true, onUpdate: invalidate });
    return () => {
      positionTween.kill();
      targetTween.kill();
    };
  }, [pose, motion, viewMode, transition?.id, invalidate]);

  useEffect(() => {
    if (!('fov' in camera)) return;
    const perspective = camera as THREE.PerspectiveCamera;
    const responsiveFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(TARGET_HORIZONTAL_FOV / 2) / aspect));
    perspective.fov = THREE.MathUtils.clamp(responsiveFov, 32, 48);
    perspective.near = 0.1;
    perspective.far = 160;
    perspective.updateProjectionMatrix();
    invalidate();
  }, [aspect, camera, invalidate]);

  useFrame(() => {
    const parallaxDisabled = motion === 'reduced' || futureRoom || viewMode === 'interface' || viewMode === 'text' || transition?.id === 'time-jump';
    const parallax = parallaxDisabled ? 0 : 0.09;
    camera.position.set(base.current.x + pointer.x * parallax, base.current.y + pointer.y * parallax * 0.45, base.current.z);
    lookTarget.current.set(target.current.x, target.current.y, target.current.z);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

export { ExperienceCameraRig as CameraRig };
