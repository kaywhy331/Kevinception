import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

export default function NotFound() {
  return <SiteChrome><section id="main-content" className="simple-page"><p className="eyebrow">Signal lost</p><h1>That layer could not be reconstructed.</h1><p>Return to the timeline or open Kevin’s work directly.</p><div className="button-row"><Link className="primary-action" href="/experience/">Timeline</Link><Link className="secondary-action" href="/portfolio/">Portfolio</Link></div></section></SiteChrome>;
}
