'use client';

import { Suspense, useEffect } from 'react';
import { AdaptiveDpr } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ExperienceWorld } from './ExperienceWorld';
import { useExperienceStore } from './store';

function FrameBudgetController() {
  const { setFrameloop, invalidate } = useThree();
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);

  useEffect(() => {
    let idleTimer: number | null = null;
    const clearIdle = () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = null;
    };
    const demandOnly = motion === 'reduced' || viewMode === 'interface' || viewMode === 'text';
    const sleep = () => {
      setFrameloop('demand');
      invalidate();
    };
    const wake = () => {
      clearIdle();
      if (document.hidden) {
        setFrameloop('never');
        return;
      }
      if (demandOnly) {
        sleep();
        return;
      }
      setFrameloop('always');
      idleTimer = window.setTimeout(sleep, 3500);
    };
    const onVisibility = () => wake();

    wake();
    window.addEventListener('pointermove', wake, { passive: true });
    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('wheel', wake, { passive: true });
    window.addEventListener('touchstart', wake, { passive: true });
    window.addEventListener('keydown', wake);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearIdle();
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('wheel', wake);
      window.removeEventListener('touchstart', wake);
      window.removeEventListener('keydown', wake);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [invalidate, motion, setFrameloop, viewMode]);

  return null;
}

export default function ExperienceCanvas() {
  const quality = useExperienceStore((state) => state.quality);
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const dpr: [number, number] = quality === 'high' ? [1, 1.7] : quality === 'standard' ? [0.85, 1.25] : [0.65, 1];
  return (
    <Canvas
      className="experience-canvas"
      shadows={quality === 'high'}
      dpr={dpr}
      frameloop="always"
      performance={{ min: 0.55, max: 1, debounce: 240 }}
      gl={{ antialias: quality !== 'lite', powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 6.8, 15.5], fov: 42, near: 0.1, far: 160 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
      }}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr pixelated={quality === 'lite'} />
        <FrameBudgetController />
        <CameraRig />
        <ExperienceWorld />
        {quality === 'high' && motion === 'full' && viewMode !== 'interface' && (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.76} luminanceSmoothing={0.24} intensity={0.3} mipmapBlur />
            <Noise opacity={0.01} blendFunction={BlendFunction.SOFT_LIGHT} />
            <Vignette eskil={false} offset={0.28} darkness={0.58} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
