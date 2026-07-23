import Link from 'next/link';
import { capabilityGroups, experienceItems, profile, projects } from '@/content/data';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteChrome } from '@/components/SiteChrome';
import { narrativeSite } from '@/content/narrative';
import { createPageMetadata } from '@/content/metadata';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';

export const metadata = createPageMetadata({ title: 'Portfolio', description: 'Kevin Yang’s work across strategy, systems, product, operations, automation, AI, and creative technology.', path: '/portfolio/' });

export default function PortfolioPage() {
  const featured = projects.filter((project) => project.featured);
  return (
    <SiteChrome>
      <section id="main-content" className="portfolio-hero section-shell">
        <div className="portfolio-hero__copy">
          <p className="eyebrow">Kevin Yang · entrepreneur · systems builder</p>
          <h1>{narrativeSite.masterStatement}</h1>
          <p className="lead">{profile.currentFocus}</p>
          <div className="button-row"><Link className="primary-action" href="/work/">View selected work</Link><Link className="secondary-action" href="/contact/">Start a conversation</Link><Link className="text-link" href="/experience/">Enter Kevinception →</Link></div>
        </div>
        <aside className="portfolio-proof" aria-label="Portfolio evidence at a glance">
          <p className="eyebrow">Proof before spectacle</p>
          <h2>Open the work with the evidence already in view.</h2>
          <dl>
            <div><dt>Case studies</dt><dd>{featured.length} featured systems</dd></div>
            <div><dt>Evidence contract</dt><dd>Role · artifact · decision · outcome</dd></div>
            <div><dt>Experience map</dt><dd>{YEAR_ORDER.length} canonical chapters</dd></div>
          </dl>
          <Link className="text-link" href={`/work/${featured[0].slug}/`}>Start with {featured[0].title} →</Link>
        </aside>
      </section>
      <section className="section-shell"><header className="section-heading"><p className="eyebrow">Selected work</p><h2>Systems, products, and original interfaces.</h2></header><div className="project-grid">{featured.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section>
      <section className="section-shell"><header className="section-heading"><p className="eyebrow">Evidence across eras</p><h2>Each chapter turns a human capability into visible proof.</h2></header><div className="chapter-evidence-grid">{YEAR_ORDER.map((year, index) => { const chapter = eraConfigs[year]; const project = projects[index % projects.length]; return <article key={year}><small>{year} · {chapter.chapterName}</small><h3>{chapter.artDirection.evidenceMetaphor}</h3><p>{chapter.lesson}</p><Link href={`/work/${project.slug}/`}>{project.title}: {project.artifacts[0]?.label} →</Link></article>; })}</div></section>
      <section className="section-shell capability-section"><header className="section-heading"><p className="eyebrow">Capabilities</p><h2>Strategy through execution.</h2></header><div className="capability-grid">{capabilityGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><p>{group.description}</p><div className="tag-row">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div></section>
      <section className="section-shell"><header className="section-heading"><p className="eyebrow">Experience snapshot</p><h2>Built around the real objective.</h2></header><div className="experience-list">{experienceItems.slice(0, 3).map((item) => <article key={`${item.period}-${item.title}`}><small>{item.period}</small><h3>{item.title}</h3><b>{item.organization}</b><p>{item.summary}</p></article>)}</div><Link className="text-link" href="/resume/">Open full resume →</Link></section>
      <section className="section-shell philosophy-section"><header className="section-heading"><p className="eyebrow">Operating philosophy</p><h2>Make complex work visible and executable.</h2></header><div className="philosophy-grid">{profile.philosophy.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
      <section className="section-shell final-cta"><p className="eyebrow">Bring the difficult problem</p><h2>{narrativeSite.closingStatement}</h2><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><Link className="secondary-action" href="/experience/">Explore the timeline</Link></div></section>
    </SiteChrome>
  );
}
