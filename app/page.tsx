import Link from 'next/link';
import { profile, projects } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { ProjectCard } from '@/components/ProjectCard';

const devices = [
  ['1990', 'KevinVision', 'Tube TV'], ['2000', 'Kevin Online', 'CRT PC'], ['2010', 'KevinBook', 'Laptop'],
  ['2020', 'KevTok', 'Phone'], ['2030', 'Kevin Nexus', 'AI Core'], ['2040', 'Kevin Echo', 'Hologram']
];

export default function HomePage() {
  return (
    <SiteChrome className="threshold-page">
      <section id="main-content" className="threshold-hero">
        <div className="threshold-copy">
          <p className="eyebrow">Interactive portfolio · technology timeline</p>
          <h1>Technology changes.<br /><span>Curiosity compounds.</span></h1>
          <p className="lead">Explore the interfaces, ideas, and defining technology moments that shaped Kevin—from a tube television in 1990 to a speculative digital echo in 2040.</p>
          <div className="button-row"><Link className="primary-action" href="/experience/">Enter the timeline</Link><Link className="secondary-action" href="/portfolio/">View Kevin’s work</Link></div>
          <nav className="threshold-secondary" aria-label="Direct routes"><Link href="/work/">Selected work</Link><Link href="/resume/">Resume</Link><Link href="/contact/">Contact</Link></nav>
        </div>
        <div className="threshold-orbit" aria-hidden="true">
          <div className="orbit-core"><span>K</span></div>
          {devices.map(([year, name], index) => <span key={year} className={`orbit-node orbit-node-${index + 1}`}><b>{year}</b><small>{name}</small></span>)}
        </div>
      </section>
      <section className="threshold-timeline section-shell">
        <header className="section-heading"><p className="eyebrow">One life · six interfaces</p><h2>Every screen contains another world.</h2><p>The physical technology changes. Kevin’s recurring pattern does not: explore, understand, reorganize, and build.</p></header>
        <div className="device-strip">
          {devices.map(([year, name, device]) => <Link key={year} href={`/experience/${year}/`}><span>{device}</span><b>{year}</b><small>{name}</small></Link>)}
        </div>
      </section>
      <section className="section-shell split-callout">
        <div><p className="eyebrow">Direct portfolio mode</p><h2>Need the evidence without the cinematic path?</h2><p>{profile.headline}</p><Link className="text-link" href="/portfolio/">Open the scannable portfolio →</Link></div>
        <div className="project-mini-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.slug} project={project} compact />)}</div>
      </section>
    </SiteChrome>
  );
}
