import { projects } from '@/content/data';
import { ProjectCard } from '@/components/ProjectCard';
import { SiteChrome } from '@/components/SiteChrome';
import { createPageMetadata } from '@/content/metadata';

export const metadata = createPageMetadata({ title: 'Work', description: 'Selected Kevin Yang projects and case studies.', path: '/work/' });

export default function WorkPage() {
  return <SiteChrome><section id="main-content" className="simple-hero section-shell"><p className="eyebrow">Work archive</p><h1>Projects that make systems, decisions, and possibilities tangible.</h1><p className="lead">Every case study has a direct URL and supplies the same canonical facts used inside the immersive timeline.</p></section><section className="section-shell"><div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section></SiteChrome>;
}
