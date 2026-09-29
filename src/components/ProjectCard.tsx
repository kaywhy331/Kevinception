import Link from 'next/link';
import type { projects } from '@/content/data';

type Project = (typeof projects)[number];

/**
 * Archive rows are large editorial text, so they deliberately do not opt into the
 * `data-interactive-card` tilt; the section reveal is the one signature effect here.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <p className="eyebrow">{project.eyebrow} · {project.year}</p>
      <h3><Link href={`/work/${project.slug}/`} data-analytics-event="case_study_open" data-analytics-project={project.slug}>{project.title}</Link></h3>
      <p>{project.summary}</p>
      <div className="tag-row">{project.roles.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
      <Link className="text-link" href={`/work/${project.slug}/`} data-analytics-event="case_study_open" data-analytics-project={project.slug} aria-label={`Open the ${project.title} case study`}>Open case study <span aria-hidden="true">→</span></Link>
    </article>
  );
}
