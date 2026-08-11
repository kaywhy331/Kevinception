import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

export default function NotFound() {
  return <SiteChrome><section id="main-content" className="lost-era"><div className="lost-era__signal" aria-hidden="true"><span>404</span><i></i></div><div><p className="eyebrow">Lost era · signal 404</p><h1>This timeline split somewhere it shouldn’t have.</h1><p>The requested layer could not be reconstructed. Rejoin the story or return to the evidence.</p><div className="button-row"><Link className="primary-action" href="/experience/">Rejoin the timeline</Link><Link className="secondary-action" href="/work/">Browse case studies</Link></div></div></section></SiteChrome>;
}
