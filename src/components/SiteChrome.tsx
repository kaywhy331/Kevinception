import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { primaryNavigation } from '@/components/navigation';
import { PrimaryNav } from '@/components/PrimaryNav';
import { site } from '@/content/data';

export { primaryNavigation };

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-logo" href="/"><span aria-hidden="true">K</span><b>Kevinception</b></Link>
      <PrimaryNav className="site-header__desktop-nav" label="Primary navigation" items={primaryNavigation} />
      <MobileNav items={primaryNavigation} />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><span className="site-logo-mark" aria-hidden="true">K</span><p><b>Kevinception</b><br />{site.tagline}</p></div>
      <nav aria-label="Footer navigation">
        {primaryNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        <a href={site.githubUrl}>GitHub</a>
      </nav>
    </footer>
  );
}

export function SiteChrome({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`site-shell ${className}`}><SiteHeader /><main>{children}</main><SiteFooter /></div>;
}
