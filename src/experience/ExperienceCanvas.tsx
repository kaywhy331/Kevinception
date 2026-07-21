'use client';

import { Suspense } from 'react';
import { AdaptiveDpr } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ExperienceWorld } from './ExperienceWorld';
import { useExperienceStore } from './store';

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
      frameloop={viewMode === 'interface' || viewMode === 'text' || motion === 'reduced' ? 'demand' : 'always'}
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
