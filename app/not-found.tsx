import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

export default function NotFound() {
  return <SiteChrome><section id="main-content" className="lost-era"><div className="lost-era__signal" aria-hidden="true"><span>404</span><i></i></div><div><p className="eyebrow">Lost chapter · signal 404</p><h1>This timeline split somewhere it shouldn’t have.</h1><p>The page you asked for isn’t here. Rejoin the journey, or go straight to the work.</p><div className="button-row"><Link className="primary-action" href="/experience/">Rejoin the journey</Link><Link className="secondary-action" href="/work/">Case studies</Link><Link className="text-link" href="/">Home</Link></div></div></section></SiteChrome>;
}
