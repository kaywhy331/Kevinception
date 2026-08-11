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
