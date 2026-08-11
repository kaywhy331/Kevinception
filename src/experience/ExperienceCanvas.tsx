'use client';

import { lazy, Suspense, useEffect } from 'react';
import { AdaptiveDpr } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ExperienceWorld } from './ExperienceWorld';
import { useExperienceStore } from './store';
import { getWebGLRendererName, resolveAdaptivePreferences } from './performanceProfile';

const HighQualityEffects = lazy(() => import('./HighQualityEffects'));

function FrameBudgetController() {
  const { setFrameloop, invalidate } = useThree();
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const quality = useExperienceStore((state) => state.quality);

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
      idleTimer = window.setTimeout(sleep, quality === 'lite' ? 850 : 3500);
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
  }, [invalidate, motion, quality, setFrameloop, viewMode]);

  return null;
}

export default function ExperienceCanvas() {
  const quality = useExperienceStore((state) => state.quality);
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const applyAdaptivePreferences = useExperienceStore((state) => state.applyAdaptivePreferences);
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
        applyAdaptivePreferences(resolveAdaptivePreferences({ rendererName: getWebGLRendererName(gl.getContext()) }));
      }}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr pixelated={quality === 'lite'} />
        <FrameBudgetController />
        <CameraRig />
        <ExperienceWorld />
        {quality === 'high' && motion === 'full' && viewMode !== 'interface' && (
          <Suspense fallback={null}><HighQualityEffects /></Suspense>
        )}
      </Suspense>
    </Canvas>
  );
}
