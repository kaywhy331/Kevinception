import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/content/data';
import { createPageMetadata } from '@/content/metadata';
import { SiteChrome } from '@/components/SiteChrome';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return createPageMetadata({ title: project.title, description: project.summary, path: `/work/${project.slug}/`, type: 'article' });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  const chapterYear = YEAR_ORDER[projectIndex % YEAR_ORDER.length];
  const chapter = eraConfigs[chapterYear];
  return (
    <SiteChrome>
      <article id="main-content" className="case-study">
        <header className="case-study__hero"><p className="eyebrow">{project.eyebrow} · {project.year}</p><h1>{project.title}</h1><p className="lead">{project.summary}</p><div className="tag-row">{project.roles.map((role) => <span key={role}>{role}</span>)}</div><dl className="case-study__evidence-rail"><div><dt>Kevin’s role</dt><dd>{project.roles.join(' · ')}</dd></div><div><dt>Representative artifact</dt><dd>{project.artifacts[0]?.label}</dd></div><div><dt>Evidence-backed outcome</dt><dd>{project.outcomes[0]?.value}</dd></div><div><dt>Kevinception chapter</dt><dd><Link href={`/experience/${chapterYear}/`}>{chapterYear} · {chapter.chapterName}</Link></dd></div></dl></header>
        <section><p className="eyebrow">The problem</p><h2>Why this needed to exist</h2><p>{project.problem}</p><p>{project.context}</p></section>
        <section><p className="eyebrow">Constraints</p><h2>The edges of the system</h2><ul>{project.constraints.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><p className="eyebrow">Approach</p><h2>From ambiguity to an executable model</h2><ol>{project.approach.map((item) => <li key={item}>{item}</li>)}</ol></section>
        <section><p className="eyebrow">Key decisions</p><div className="decision-grid">{project.decisions.map((item) => <article key={item}><p>{item}</p></article>)}</div></section>
        <section><p className="eyebrow">Deliverables</p><div className="tag-row tag-row--large">{project.deliverables.map((item) => <span key={item}>{item}</span>)}</div></section>
        <section><p className="eyebrow">Outcomes and evidence</p><div className="outcome-grid">{project.outcomes.map((outcome) => <article key={outcome.label}><small>{outcome.label}</small><h3>{outcome.value}</h3><p>{outcome.evidence}</p></article>)}</div></section>
        <section><p className="eyebrow">Artifacts</p><h2>What the work made visible</h2><div className="artifact-grid">{project.artifacts.map((artifact, index) => <article key={artifact.label} className="case-artifact"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><small>{artifact.type}</small><h3>{artifact.label}</h3><p>{artifact.description}</p>{'href' in artifact && artifact.href && <a href={artifact.href}>Open source</a>}</article>)}</div></section>
        <section><p className="eyebrow">Learnings</p><ul>{project.learnings.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <footer className="case-study__footer"><Link className="secondary-action" href="/work/">All work</Link><Link className="primary-action" href="/contact/">Discuss a similar challenge</Link></footer>
      </article>
    </SiteChrome>
  );
}
