import { caseStudyOrder, projects, resumeProjectSlugs } from './data';

type Project = (typeof projects)[number];

function bySlug(slugs: readonly string[]): Project[] {
  const listed = slugs.map((slug) => {
    const project = projects.find((item) => item.slug === slug);
    if (!project) throw new Error(`Unknown project slug in editorial order: ${slug}`);
    return project;
  });
  return listed;
}

/** Every case study, external and operational work first. Unlisted projects are appended so none disappear. */
export const orderedCaseStudies: Project[] = [
  ...bySlug(caseStudyOrder),
  ...projects.filter((project) => !(caseStudyOrder as readonly string[]).includes(project.slug))
];

/** The resume's selected projects, chosen explicitly. */
export const resumeProjects: Project[] = bySlug(resumeProjectSlugs);
