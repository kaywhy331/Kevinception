import Link from 'next/link';
import { capabilityGroups, experienceItems, profile, site } from '@/content/data';
import { resumeProjects } from '@/content/editorial';
import { SiteChrome } from '@/components/SiteChrome';
import { PrintButton } from '@/components/PrintButton';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata({
  title: 'Kevin Yang — Resume',
  description: 'Kevin Yang’s experience, selected projects, and capabilities across strategy, product, operations, automation, and AI.',
  path: '/resume/',
  absoluteTitle: true
});

const siteHost = new URL(site.domain).host;

export default function ResumePage() {
  return (
    <SiteChrome>
      <article id="main-content" className="resume-page">
        <header className="resume-header">
          <p className="eyebrow">Resume</p>
          <h1>Kevin Yang</h1>
          <p className="lead">{profile.headline}</p>
          <address className="resume-contact">
            <a href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a>
            <a href={site.domain}>{siteHost}</a>
            <a href={site.githubUrl}>github.com/kaywhy331</a>
          </address>
          <div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><PrintButton /></div>
        </header>
        <section aria-labelledby="resume-experience">
          <h2 id="resume-experience">Experience</h2>
          <div className="resume-timeline">{experienceItems.map((item) => (
            <article key={`${item.period}-${item.organization}`}>
              <div><small>{item.period}</small><span></span></div>
              <div><h3>{item.title}</h3><b>{item.organization}</b><p>{item.summary}</p><ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>
            </article>
          ))}</div>
        </section>
        <section aria-labelledby="resume-projects">
          <h2 id="resume-projects">Selected projects</h2>
          <div className="resume-projects">{resumeProjects.map((project) => (
            <article key={project.slug}>
              <p className="eyebrow">{project.eyebrow} · {project.year}</p>
              <h3><Link href={`/work/${project.slug}/`}>{project.title}</Link></h3>
              <p>{project.summary}</p>
              <div className="tag-row">{project.disciplines.slice(0, 4).map((discipline) => <span key={discipline}>{discipline}</span>)}</div>
            </article>
          ))}</div>
          <Link className="text-link" href="/work/">All case studies <span aria-hidden="true">→</span></Link>
        </section>
        <section aria-labelledby="resume-capabilities">
          <h2 id="resume-capabilities">Capabilities</h2>
          <div className="capability-grid">{capabilityGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><p>{group.description}</p><div className="tag-row">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div>
        </section>
        <section aria-labelledby="resume-best-at">
          <h2 id="resume-best-at">Best at</h2>
          <ul className="two-column-list">{profile.bestAt.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </article>
    </SiteChrome>
  );
}
