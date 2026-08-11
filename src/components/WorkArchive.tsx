'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { projects } from '@/content/data';
import { filterProjects } from '@/lib/workArchive';
import { ProjectCard } from '@/components/ProjectCard';

type Project = (typeof projects)[number];

export function WorkArchive({ projects }: { projects: readonly Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [discipline, setDiscipline] = useState(() => searchParams.get('discipline') ?? '');
  const deferredQuery = useDeferredValue(query);
  const disciplines = useMemo(() => Array.from(new Set(projects.flatMap((project) => project.disciplines))).sort(), [projects]);
  const results = useMemo(() => filterProjects(projects, deferredQuery, discipline), [deferredQuery, discipline, projects]);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setDiscipline(searchParams.get('discipline') ?? '');
  }, [searchParams]);

  function updateUrl(nextQuery: string, nextDiscipline: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim()) params.set('q', nextQuery);
    else params.delete('q');
    if (nextDiscipline) params.set('discipline', nextDiscipline);
    else params.delete('discipline');
    const suffix = params.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ''}`, { scroll: false });
  }

  function reset() {
    setQuery('');
    setDiscipline('');
    updateUrl('', '');
  }

  return (
    <section className="section-shell work-archive" aria-labelledby="work-archive-title">
      <div className="work-archive__toolbar">
        <div>
          <p className="eyebrow" id="work-archive-title">Find a case study</p>
          <label htmlFor="work-search">Search projects</label>
          <input
            id="work-search"
            type="search"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              updateUrl(value, discipline);
            }}
            placeholder="Search titles, roles, or capabilities"
          />
        </div>
        <div>
          <label htmlFor="work-discipline">Filter by discipline</label>
          <select
            id="work-discipline"
            value={discipline}
            onChange={(event) => {
              const value = event.target.value;
              setDiscipline(value);
              updateUrl(query, value);
            }}
          >
            <option value="">All disciplines</option>
            {disciplines.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {(query || discipline) && <button type="button" className="text-link" onClick={reset}>Clear filters</button>}
      </div>
      <p className="work-archive__status" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? 'case study' : 'case studies'} found
      </p>
      {results.length ? (
        <ol className="case-study-index__list">
          {results.map((project, index) => <li key={project.slug}><span>{String(index + 1).padStart(2, '0')}</span><ProjectCard project={project} /></li>)}
        </ol>
      ) : (
        <div className="work-archive__empty"><h2>No matching case studies</h2><p>Try a broader term or remove the discipline filter.</p><button type="button" className="secondary-action" onClick={reset}>Show every project</button></div>
      )}
    </section>
  );
}
