import Link from 'next/link';
import { narrativeSite } from '@/content/narrative';

const navigation = [
  ['/experience/', 'Experience'], ['/portfolio/', 'Portfolio'], ['/work/', 'Work'],
  ['/resume/', 'Resume'], ['/about/', 'About'], ['/contact/', 'Contact']
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-logo" href="/"><span>K</span><b>Kevinception</b></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">{navigation.map(([href, label]) => <Link key={href} className={label === 'Contact' ? 'site-header__cta' : ''} href={href}>{label}</Link>)}</nav>
      <details className="mobile-nav"><summary aria-label="Open navigation">Menu</summary><nav aria-label="Mobile navigation">{navigation.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav></details>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><span className="site-logo-mark">K</span><p><b>Kevinception</b><br />{narrativeSite.shortStatement}</p></div>
      <nav aria-label="Footer navigation"><Link href="/experience/">Timeline</Link><Link href="/work/">Work</Link><Link href="/resume/">Resume</Link><a href="https://github.com/kaywhy331">GitHub</a></nav>
      <small>Built as an R3F-first experience with semantic portfolio routes.</small>
    </footer>
  );
}

export function SiteChrome({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`site-shell ${className}`}><SiteHeader /><main>{children}</main><SiteFooter /></div>;
}
