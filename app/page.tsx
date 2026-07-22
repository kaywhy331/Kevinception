import Link from 'next/link';
import { profile, projects } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { ProjectCard } from '@/components/ProjectCard';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';
import { narrativeSite } from '@/content/narrative';

const chapters = YEAR_ORDER.map((year) => eraConfigs[year]);

export default function HomePage() {
  return (
    <SiteChrome className="threshold-page">
      <section id="main-content" className="threshold-hero">
        <div className="threshold-copy">
          <p className="eyebrow">Interactive portfolio · six digital eras</p>
          <h1>{narrativeSite.masterStatement}</h1>
          <p className="lead">Follow Curiosity, Connection, Presence, Creation, Delegation, and Continuity through the interfaces that made each capability tangible.</p>
          <div className="button-row"><Link className="primary-action" href="/experience/">Enter the timeline</Link><Link className="secondary-action" href="/portfolio/">View Kevin’s work</Link></div>
          <nav className="threshold-secondary" aria-label="Direct routes"><Link href="/work/">Selected work</Link><Link href="/resume/">Resume</Link><Link href="/contact/">Contact</Link></nav>
        </div>
        <div className="authored-threshold" aria-label="Six chapter trajectory">
          <span className="authored-threshold__signal" aria-hidden="true">K</span>
          <ol>{chapters.map((chapter) => <li key={chapter.id}><Link href={`/experience/${chapter.id}/`}><small>{chapter.id} · {chapter.medium}</small><b>{chapter.chapterName}</b><span>{chapter.transformation}</span></Link></li>)}</ol>
        </div>
      </section>
      <section className="threshold-manifesto section-shell">
        <header className="section-heading"><p className="eyebrow">One life · six chapters · one cumulative system</p><h2>Every interface leaves evidence for the next.</h2><p>The visual language, motion, material, sound intent, and proof change by era. The human pattern compounds from Curiosity to Continuity.</p></header>
        <div><article><small>01 · Recognize</small><h3>Find the signal</h3><p>Turn exploration into a clear model of the system.</p></article><article><small>02 · Materialize</small><h3>Make evidence visible</h3><p>Connect decisions to artifacts, roles, and outcomes.</p></article><article><small>03 · Continue</small><h3>Carry judgment forward</h3><p>Use automation and agents without losing human intent.</p></article></div>
      </section>
      <section className="section-shell split-callout">
        <div><p className="eyebrow">Direct portfolio mode</p><h2>Need the evidence without the cinematic path?</h2><p>{profile.headline}</p><Link className="text-link" href="/portfolio/">Open the scannable portfolio →</Link></div>
        <div className="project-mini-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.slug} project={project} compact />)}</div>
      </section>
      <section className="section-shell final-cta"><p className="eyebrow">The next system</p><h2>{narrativeSite.closingStatement}</h2><Link className="primary-action" href="/contact/">Start with the real problem</Link></section>
    </SiteChrome>
  );
}
