export type SearchableProject = {
  title: string;
  eyebrow: string;
  summary: string;
  roles: readonly string[];
  disciplines: readonly string[];
};

export function filterProjects<T extends SearchableProject>(projects: readonly T[], query: string, discipline: string): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return projects.filter((project) => {
    if (discipline && !project.disciplines.includes(discipline)) return false;
    if (!normalizedQuery) return true;
    return [project.title, project.eyebrow, project.summary, ...project.roles, ...project.disciplines]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
  });
}

/** A handful of curated focus chips replaces free-text search and a long discipline list. */
export const WORK_FOCUS_AREAS = [
  { id: 'ai', label: 'AI & agents', disciplines: ['AI systems', 'AI agents', 'MCP', 'AI interoperability', 'Retrieval'] },
  { id: 'product', label: 'Product strategy', disciplines: ['Product', 'Product strategy', 'Product architecture'] },
  { id: 'operations', label: 'Operations & systems', disciplines: ['Operations', 'Workflow design', 'Governance', 'Systems design'] },
  { id: 'experience', label: 'Experience & frontend', disciplines: ['UX', 'Frontend', 'Accessibility', 'Creative technology', 'Interactive narrative'] }
] as const;

export type WorkFocusId = (typeof WORK_FOCUS_AREAS)[number]['id'];

export function isWorkFocus(value: string | null | undefined): value is WorkFocusId {
  return WORK_FOCUS_AREAS.some((area) => area.id === value);
}

export function filterProjectsByFocus<T extends SearchableProject>(projects: readonly T[], focus: string | null | undefined): T[] {
  const area = WORK_FOCUS_AREAS.find((item) => item.id === focus);
  if (!area) return [...projects];
  const wanted = area.disciplines as readonly string[];
  return projects.filter((project) => project.disciplines.some((discipline) => wanted.includes(discipline)));
}
