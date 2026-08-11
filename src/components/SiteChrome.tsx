import Link from 'next/link';
import { MobileNav, type MobileNavItem } from '@/components/MobileNav';

const primaryNavigation = [
  { href: '/experience/', label: 'Timeline' },
  { href: '/portfolio/', label: 'Profile' },
  { href: '/work/', label: 'Case studies' },
  { href: '/resume/', label: 'Resume' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact', cta: true }
] satisfies readonly MobileNavItem[];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-logo" href="/"><span>K</span><b>Kevinception</b></Link>
      <nav className="site-header__desktop-nav" aria-label="Primary navigation">
        {primaryNavigation.map((item) => <Link key={item.href} className={item.cta ? 'site-header__cta' : undefined} href={item.href}>{item.label}</Link>)}
      </nav>
      <MobileNav items={primaryNavigation} />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><span className="site-logo-mark">K</span><p><b>Kevinception</b><br />One life through six technologies.</p></div>
      <nav aria-label="Footer navigation"><Link href="/experience/">Timeline</Link><Link href="/portfolio/">Profile</Link><Link href="/work/">Case studies</Link><Link href="/resume/">Resume</Link><a href="https://github.com/kaywhy331">GitHub</a></nav>
      <small>Every chapter has a plain-text route, too.</small>
    </footer>
  );
}

export function SiteChrome({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`site-shell ${className}`}><SiteHeader /><main>{children}</main><SiteFooter /></div>;
}
