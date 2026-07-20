'use client';

import { Suspense } from 'react';
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
  const dpr: [number, number] = quality === 'high' ? [1, 2] : quality === 'standard' ? [1, 1.5] : [0.75, 1];
  return (
    <Canvas
      className="experience-canvas"
      shadows={quality === 'high'}
      dpr={dpr}
      frameloop={viewMode === 'interface' || motion === 'reduced' ? 'demand' : 'always'}
      gl={{ antialias: quality !== 'lite', powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 6.8, 15.5], fov: 42, near: 0.1, far: 160 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Suspense fallback={null}>
        <CameraRig />
        <ExperienceWorld />
        {quality === 'high' && motion === 'full' && (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.28} intensity={0.45} mipmapBlur />
            <Noise opacity={0.018} blendFunction={BlendFunction.SOFT_LIGHT} />
            <Vignette eskil={false} offset={0.24} darkness={0.72} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
