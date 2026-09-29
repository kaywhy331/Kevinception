'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { analyticsPermitted, trackAnalyticsEvent } from '@/lib/analytics';

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'kevinception.com';
const scriptSource = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js';

/**
 * Report only from the host the Plausible site is registered for. Netlify deploy
 * previews, branch deploys, Vercel previews, and localhost therefore never write into
 * production analytics. A staging site opts in by building with its own
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN (which must match the staging host).
 */
export function analyticsHostAllowed(hostname: string, configuredDomain = domain) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  const target = configuredDomain.toLowerCase();
  return host === target || host === `www.${target}`;
}

function datasetProps(element: HTMLElement) {
  return Object.fromEntries(
    Object.entries(element.dataset)
      .filter(([key, value]) => key.startsWith('analytics') && key !== 'analyticsEvent' && value !== undefined)
      .map(([key, value]) => [key.slice('analytics'.length).replace(/^./, (letter) => letter.toLowerCase()), value as string])
  );
}

function inferredLinkEvent(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href') || '';
  if (href.startsWith('/experience')) return ['timeline_enter', { source: window.location.pathname }] as const;
  if (href.startsWith('/contact')) return ['contact_open', { source: window.location.pathname }] as const;
  const caseStudy = href.match(/^\/work\/([^/]+)\/?/);
  if (caseStudy) return ['case_study_open', { project: caseStudy[1], source: window.location.pathname }] as const;
  return null;
}

export function Analytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => setEnabled(analyticsPermitted() && analyticsHostAllowed(window.location.hostname)), []);

  // Pageviews, including App Router navigations, are recorded by Plausible's own
  // history-API tracking. Sending manual pageviews as well would double-count them.
  useEffect(() => {
    const caseStudy = pathname.match(/^\/work\/([^/]+)\/?$/);
    if (caseStudy) trackAnalyticsEvent('case_study_read', { project: caseStudy[1] });
    if (pathname === '/contact' || pathname === '/contact/') trackAnalyticsEvent('contact_view');
    if (pathname === '/experience' || pathname === '/experience/') trackAnalyticsEvent('experience_view');
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const tagged = event.target.closest<HTMLElement>('[data-analytics-event]');
      if (tagged?.dataset.analyticsEvent) {
        trackAnalyticsEvent(tagged.dataset.analyticsEvent, datasetProps(tagged));
        return;
      }
      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      const inferred = inferredLinkEvent(anchor);
      if (inferred) trackAnalyticsEvent(inferred[0], inferred[1]);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!enabled) return null;
  return <Script src={scriptSource} data-domain={domain} strategy="afterInteractive" defer />;
}
