import Link from 'next/link';
import { profile, projects } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { ProjectCard } from '@/components/ProjectCard';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';

const chapters = YEAR_ORDER.map((year) => eraConfigs[year]);

export default function HomePage() {
  return (
    <SiteChrome className="threshold-page">
      <section id="main-content" className="threshold-hero">
        <div className="threshold-copy">
          <p className="eyebrow">Interactive portfolio · six digital eras</p>
          <h1>Technology changes.<br /><span>Curiosity compounds.</span></h1>
          <p className="lead">Follow six stages of Kevin’s relationship with technology—Curiosity, Connection, Presence, Creation, Delegation, and Continuity—each experienced through a defining interface of its era.</p>
          <div className="button-row"><Link className="primary-action" href="/experience/">Enter the timeline</Link><Link className="secondary-action" href="/portfolio/">View Kevin’s work</Link></div>
          <nav className="threshold-secondary" aria-label="Direct routes"><Link href="/work/">Selected work</Link><Link href="/resume/">Resume</Link><Link href="/contact/">Contact</Link></nav>
        </div>
        <div className="threshold-orbit" aria-hidden="true">
          <div className="orbit-core"><span>K</span></div>
          {chapters.map((chapter, index) => <span key={chapter.id} className={`orbit-node orbit-node-${index + 1}`}><b>{chapter.id}</b><small>{chapter.chapterName}</small></span>)}
        </div>
      </section>
      <section className="threshold-timeline section-shell">
        <header className="section-heading"><p className="eyebrow">One life · six chapters · six interfaces</p><h2>Every screen contains another world.</h2><p>The interfaces change from KevinVision to Kevin Echo. The human pattern compounds from Curiosity to Continuity.</p></header>
        <div className="device-strip">
          {chapters.map((chapter) => (
            <Link key={chapter.id} href={`/experience/?year=${chapter.id}`}>
              <span>{chapter.medium}</span>
              <b>{chapter.id} · {chapter.chapterName}</b>
              <small>{chapter.experienceName}</small>
            </Link>
          ))}
        </div>
      </section>
      <section className="section-shell split-callout">
        <div><p className="eyebrow">Direct portfolio mode</p><h2>Need the evidence without the cinematic path?</h2><p>{profile.headline}</p><Link className="text-link" href="/portfolio/">Open the scannable portfolio →</Link></div>
        <div className="project-mini-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.slug} project={project} compact />)}</div>
      </section>
    </SiteChrome>
  );
}
