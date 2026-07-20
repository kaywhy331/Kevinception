import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-logo" href="/"><span>K</span><b>Kevinception</b></Link>
      <nav aria-label="Primary navigation">
        <Link href="/experience/">Experience</Link>
        <Link href="/portfolio/">Portfolio</Link>
        <Link href="/work/">Work</Link>
        <Link href="/resume/">Resume</Link>
        <Link href="/about/">About</Link>
        <Link className="site-header__cta" href="/contact/">Contact</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><span className="site-logo-mark">K</span><p><b>Kevinception</b><br />One life through six technologies.</p></div>
      <nav aria-label="Footer navigation"><Link href="/experience/">Timeline</Link><Link href="/work/">Work</Link><Link href="/resume/">Resume</Link><a href="https://github.com/kaywhy331">GitHub</a></nav>
      <small>Built as an R3F-first experience with semantic portfolio routes.</small>
    </footer>
  );
}

export function SiteChrome({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`site-shell ${className}`}><SiteHeader /><main>{children}</main><SiteFooter /></div>;
}
