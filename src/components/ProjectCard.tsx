import Link from 'next/link';
import type { projects } from '@/content/data';

type Project = (typeof projects)[number];

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <p className="eyebrow">{project.eyebrow}</p>
      <h3><Link href={`/work/${project.slug}/`} data-analytics-event="case_study_open" data-analytics-project={project.slug}>{project.title}</Link></h3>
      <p>{project.summary}</p>
      <div className="tag-row">{project.disciplines.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>
      <Link className="text-link" href={`/work/${project.slug}/`} data-analytics-event="case_study_open" data-analytics-project={project.slug}>Open case study <span aria-hidden="true">→</span></Link>
    </article>
  );
}
