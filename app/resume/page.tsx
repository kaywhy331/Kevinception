import Link from 'next/link';
import { capabilityGroups, experienceItems, profile, projects, site } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { PrintButton } from '@/components/PrintButton';

export const metadata = { title: 'Resume', description: 'Kevin Yang’s experience, capabilities, current work, and operating approach.' };

const selectedProjects = projects.filter((project) => project.featured).slice(0, 3);

export default function ResumePage() {
  return (
    <SiteChrome>
      <article id="main-content" className="resume-page">
        <header className="resume-header"><p className="eyebrow">Resume</p><h1>Kevin Yang</h1><p className="lead">{profile.headline}</p><address className="resume-contact"><a href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a><a href={site.domain}>kevinception.com</a><a href={site.githubUrl}>GitHub</a></address><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><PrintButton /></div></header>
        <section><h2>Current focus</h2><p>{profile.currentFocus}</p><div className="current-work-grid">{profile.currentWork.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
        <section><h2>Selected projects</h2><div className="resume-projects">{selectedProjects.map((project) => <article key={project.slug}><p className="eyebrow">{project.eyebrow}</p><h3><Link href={`/work/${project.slug}/`}>{project.title}</Link></h3><p>{project.summary}</p><div className="tag-row">{project.disciplines.slice(0, 4).map((discipline) => <span key={discipline}>{discipline}</span>)}</div></article>)}</div><Link className="text-link" href="/work/">Browse every case study →</Link></section>
        <section><h2>Experience</h2><div className="resume-timeline">{experienceItems.map((item) => <article key={`${item.period}-${item.title}`}><div><small>{item.period}</small><span></span></div><div><h3>{item.title}</h3><b>{item.organization}</b><p>{item.summary}</p><ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div></article>)}</div></section>
        <section><h2>Capabilities</h2><div className="capability-grid">{capabilityGroups.map((group) => <article key={group.title}><h3>{group.title}</h3><p>{group.description}</p><div className="tag-row">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div></section>
        <section><h2>Best at</h2><ul className="two-column-list">{profile.bestAt.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </article>
    </SiteChrome>
  );
}
