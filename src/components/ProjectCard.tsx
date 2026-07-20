import Link from 'next/link';
import type { projects } from '@/content/data';

type Project = (typeof projects)[number];

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className={`project-card ${compact ? 'is-compact' : ''}`}>
      <p className="eyebrow">{project.eyebrow}</p>
      <h3><Link href={`/work/${project.slug}/`}>{project.title}</Link></h3>
      <p>{project.summary}</p>
      {!compact && <div className="tag-row">{project.disciplines.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>}
      <Link className="text-link" href={`/work/${project.slug}/`}>Open case study <span aria-hidden="true">→</span></Link>
    </article>
  );
}
