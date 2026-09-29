'use client';

import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/** Stays mounted while High quality is active; `enabled` pauses it behind layers instead of recompiling. */
export default function HighQualityEffects({ enabled = true }: { enabled?: boolean }) {
  return (
    <EffectComposer multisampling={0} enabled={enabled}>
      <Bloom luminanceThreshold={0.76} luminanceSmoothing={0.24} intensity={0.3} mipmapBlur />
      <Noise opacity={0.01} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette eskil={false} offset={0.28} darkness={0.58} />
    </EffectComposer>
  );
}
