import type { Quality } from './types';

export type AdaptivePreferences = {
  quality?: Quality;
  motion?: 'reduced';
};

export type PerformanceSignals = {
  /**
   * Optional. Only 2D surfaces (the homepage portal) pass it; the 3D experience
   * deliberately decides by device capability, not by screen width.
   */
  viewportWidth?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
  prefersReducedMotion?: boolean;
  rendererName?: string;
};

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software rasterizer|mesa offscreen|subzero/i;
/**
 * Entry-level mobile and legacy integrated GPUs that struggle with the full scene.
 * Matching is intentionally conservative: an unknown GPU is not treated as weak.
 */
const LOW_TIER_GPU = /mali-(?:4\d\d|t\d+|g31|g51|g52)\b|adreno \(tm\) (?:3\d\d|4\d\d|50\d|51\d)\b|powervr sgx|intel\(r\) hd graphics (?:[2-4]\d{3}|[2-4]\d{2})\b|intel\(r\) (?:gma|q\d+)/i;

export function isSoftwareRendererName(rendererName = '') {
  return SOFTWARE_RENDERER.test(rendererName);
}

export function isLowTierGpuName(rendererName = '') {
  return LOW_TIER_GPU.test(rendererName);
}

/**
 * Device capability, not viewport width, decides the tier: a modern phone with a
 * capable GPU is not forced into Lite rendering just because its screen is narrow.
 */
export function isLowPowerDevice({ viewportWidth, deviceMemory, hardwareConcurrency, saveData = false, rendererName }: PerformanceSignals) {
  return (viewportWidth !== undefined && viewportWidth < 760)
    || (deviceMemory !== undefined && deviceMemory <= 2)
    || (hardwareConcurrency !== undefined && hardwareConcurrency <= 2)
    || isLowTierGpuName(rendererName)
    || saveData;
}

export function getWebGLRendererName(context: WebGLRenderingContext | WebGL2RenderingContext) {
  const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
  const rendererParameter = debugInfo?.UNMASKED_RENDERER_WEBGL ?? context.RENDERER;
  return String(context.getParameter(rendererParameter) ?? '');
}

/**
 * Resolves the adaptive (Auto) profile: Lite for software rendering, weak GPUs,
 * very small memory, or Save-Data. Reduced motion follows software rendering; the
 * OS reduced-motion preference is tracked live by the store.
 */
export function resolveAdaptivePreferences(signals: PerformanceSignals): AdaptivePreferences {
  const softwareRenderer = isSoftwareRendererName(signals.rendererName);
  const preferences: AdaptivePreferences = {};
  if (softwareRenderer || isLowPowerDevice(signals)) preferences.quality = 'lite';
  if (softwareRenderer || signals.prefersReducedMotion) preferences.motion = 'reduced';
  return preferences;
}
