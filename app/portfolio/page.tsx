import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

/**
 * Profile was merged into About. A static export cannot send a server 301, so this
 * page redirects in the browser and points search engines at /about/. Hosts that
 * support redirects (Netlify, Vercel, nginx) should also send a 301 for /portfolio/.
 */
export const metadata: Metadata = {
  title: 'About Kevin Yang',
  description: 'This page moved to About.',
  alternates: { canonical: '/about/' },
  robots: { index: false, follow: true }
};

export default function PortfolioRedirectPage() {
  return (
    <SiteChrome>
      <meta httpEquiv="refresh" content="0; url=/about/" />
      <section id="main-content" className="simple-hero section-shell">
        <p className="eyebrow">Moved</p>
        <h1>This page is now About.</h1>
        <p className="lead">Kevin’s profile, capabilities, and principles live on one page.</p>
        <div className="button-row"><Link className="primary-action" href="/about/">Go to About</Link></div>
      </section>
    </SiteChrome>
  );
}
