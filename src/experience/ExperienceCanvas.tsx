'use client';

import { lazy, Suspense, useEffect } from 'react';
import { AdaptiveDpr } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ExperienceWorld } from './ExperienceWorld';
import { useExperienceStore } from './store';
import { getWebGLRendererName, resolveAdaptivePreferences } from './performanceProfile';
import type { Quality } from './types';

const HighQualityEffects = lazy(() => import('./HighQualityEffects'));

type Frameloop = 'always' | 'demand' | 'never';

/** Frames per second for ambient life (dust, screens, antenna) once the visitor is idle. */
const AMBIENT_FPS: Record<Quality, number> = { high: 30, standard: 24, lite: 12 };
const IDLE_AFTER: Record<Quality, number> = { high: 3500, standard: 3500, lite: 1500 };

/**
 * Runs the render loop at full rate while the visitor interacts, then settles
 * into a low-rate ambient loop rather than freezing. `setFrameloop` resets the
 * R3F clock, so it is only called when the mode actually changes.
 */
function FrameBudgetController() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  const invalidate = useThree((state) => state.invalidate);
  const get = useThree((state) => state.get);
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const quality = useExperienceStore((state) => state.quality);

  useEffect(() => {
    let idleTimer: number | null = null;
    let ambientTimer: number | null = null;
    const reduced = motion !== 'full';
    const layerOpen = viewMode === 'interface' || viewMode === 'text';
    const setLoop = (mode: Frameloop) => {
      if (get().frameloop !== mode) setFrameloop(mode);
    };
    const clearTimers = () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      if (ambientTimer !== null) window.clearInterval(ambientTimer);
      idleTimer = null;
      ambientTimer = null;
    };
    const settle = () => {
      clearTimers();
      setLoop('demand');
      invalidate();
      if (!reduced && !layerOpen) ambientTimer = window.setInterval(() => invalidate(), 1000 / AMBIENT_FPS[quality]);
    };
    const wake = () => {
      if (document.hidden) {
        clearTimers();
        setLoop('never');
        return;
      }
      if (reduced || layerOpen) {
        clearTimers();
        setLoop('demand');
        invalidate();
        return;
      }
      if (ambientTimer !== null) window.clearInterval(ambientTimer);
      ambientTimer = null;
      setLoop('always');
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(settle, IDLE_AFTER[quality]);
    };

    wake();
    window.addEventListener('pointermove', wake, { passive: true });
    window.addEventListener('pointerdown', wake, { passive: true });
    window.addEventListener('wheel', wake, { passive: true });
    window.addEventListener('touchstart', wake, { passive: true });
    window.addEventListener('keydown', wake);
    document.addEventListener('visibilitychange', wake);
    return () => {
      clearTimers();
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('wheel', wake);
      window.removeEventListener('touchstart', wake);
      window.removeEventListener('keydown', wake);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [get, invalidate, motion, quality, setFrameloop, viewMode]);

  return null;
}

const DPR: Record<Quality, [number, number]> = {
  high: [1, 1.75],
  standard: [1, 1.5],
  lite: [0.75, 1]
};

export default function ExperienceCanvas() {
  const quality = useExperienceStore((state) => state.quality);
  const motion = useExperienceStore((state) => state.motion);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const applyAdaptivePreferences = useExperienceStore((state) => state.applyAdaptivePreferences);
  return (
    <Canvas
      className="experience-canvas"
      shadows={quality === 'high'}
      dpr={DPR[quality]}
      frameloop="always"
      performance={{ min: 0.6, max: 1, debounce: 240 }}
      gl={{ antialias: quality !== 'lite', powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 6.8, 15.5], fov: 42, near: 0.1, far: 180 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
        applyAdaptivePreferences(resolveAdaptivePreferences({ rendererName: getWebGLRendererName(gl.getContext()) }));
      }}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr />
        <FrameBudgetController />
        <CameraRig />
        <ExperienceWorld />
        {quality === 'high' && motion === 'full' && (
          <Suspense fallback={null}><HighQualityEffects enabled={viewMode !== 'interface' && viewMode !== 'text'} /></Suspense>
        )}
      </Suspense>
    </Canvas>
  );
}
