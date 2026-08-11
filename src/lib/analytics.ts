export type AnalyticsValue = string | number | boolean;
export type AnalyticsProps = Record<string, AnalyticsValue>;
type PlausibleOptions = { props?: AnalyticsProps; u?: string };
type PlausibleFunction = ((event: string, options?: PlausibleOptions) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    plausible?: PlausibleFunction;
  }
}

export function analyticsPermitted() {
  return typeof navigator === 'undefined' || navigator.doNotTrack !== '1';
}

function plausible() {
  if (typeof window === 'undefined' || !analyticsPermitted()) return null;
  if (!window.plausible) {
    const queue: PlausibleFunction = (event, options) => {
      queue.q = queue.q || [];
      queue.q.push([event, options]);
    };
    window.plausible = queue;
  }
  return window.plausible;
}

export function trackAnalyticsEvent(event: string, props: AnalyticsProps = {}) {
  plausible()?.(event, { props });
}

export function trackAnalyticsPageview() {
  if (typeof window === 'undefined') return;
  plausible()?.('pageview', { u: window.location.href });
}
