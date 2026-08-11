export type AdaptivePreferences = {
  quality?: 'lite';
  motion?: 'reduced';
};

export type PerformanceSignals = {
  viewportWidth?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
  prefersReducedMotion?: boolean;
  rendererName?: string;
};

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software rasterizer|mesa offscreen|subzero/i;

export function isSoftwareRendererName(rendererName = '') {
  return SOFTWARE_RENDERER.test(rendererName);
}

export function getWebGLRendererName(context: WebGLRenderingContext | WebGL2RenderingContext) {
  const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
  const rendererParameter = debugInfo?.UNMASKED_RENDERER_WEBGL ?? context.RENDERER;
  return String(context.getParameter(rendererParameter) ?? '');
}

export function isLowPowerDevice({
  viewportWidth = Number.POSITIVE_INFINITY,
  deviceMemory,
  hardwareConcurrency,
  saveData = false
}: PerformanceSignals) {
  return viewportWidth < 760
    || (deviceMemory !== undefined && deviceMemory <= 4)
    || (hardwareConcurrency !== undefined && hardwareConcurrency <= 4)
    || saveData;
}

export function resolveAdaptivePreferences(signals: PerformanceSignals): AdaptivePreferences {
  const softwareRenderer = isSoftwareRendererName(signals.rendererName);
  const preferences: AdaptivePreferences = {};
  if (softwareRenderer || isLowPowerDevice(signals)) preferences.quality = 'lite';
  if (softwareRenderer || signals.prefersReducedMotion) preferences.motion = 'reduced';
  return preferences;
}
