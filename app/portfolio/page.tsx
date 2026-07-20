import Link from 'next/link';
import { capabilityGroups, experienceItems, profile, projects } from '@/content/data';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata = { title: 'Portfolio', description: 'Kevin Yang’s work across strategy, systems, product, operations, automation, AI, and creative technology.' };

export default function PortfolioPage() {
  const featured = projects.filter((project) => project.featured);
  return (
    <SiteChrome>
      <section id="main-content" className="portfolio-hero section-shell">
        <p className="eyebrow">Kevin Yang · entrepreneur · systems builder</p>
        <h1>{profile.headline}</h1>
        <p className="lead">{profile.currentFocus}</p>
        <div className="button-row"><Link className="primary-action" href="/work/">View selected work</Link><Link className="secondary-action" href="/contact/">Start a conversation</Link><Link className="text-link" href="/experience/">Enter Kevinception →</Link></div>
      </section>
      <section className="section-shell"><header className="section-heading"><p className="eyebrow">Selected work</p><h2>Systems, products, and original interfaces.</h2></header><div className="project-grid">{featured.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section>
      <section className="section-shell capability-section"><header className="section-heading"><p className="eyebrow">Capabilities</p><h2>Strategy through execution.</h2></header><div className="capability-grid">{capabilityGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><p>{group.description}</p><div className="tag-row">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div></section>
      <section className="section-shell"><header className="section-heading"><p className="eyebrow">Experience snapshot</p><h2>Built around the real objective.</h2></header><div className="experience-list">{experienceItems.slice(0, 3).map((item) => <article key={`${item.period}-${item.title}`}><small>{item.period}</small><h3>{item.title}</h3><b>{item.organization}</b><p>{item.summary}</p></article>)}</div><Link className="text-link" href="/resume/">Open full resume →</Link></section>
      <section className="section-shell philosophy-section"><header className="section-heading"><p className="eyebrow">Operating philosophy</p><h2>Make complex work visible and executable.</h2></header><div className="philosophy-grid">{profile.philosophy.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
      <section className="section-shell final-cta"><p className="eyebrow">Bring the difficult problem</p><h2>{profile.currentFocus}</h2><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><Link className="secondary-action" href="/experience/">Explore the timeline</Link></div></section>
    </SiteChrome>
  );
}
