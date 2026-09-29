'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { projects } from '@/content/data';
import { filterProjectsByFocus, isWorkFocus, WORK_FOCUS_AREAS, type WorkFocusId } from '@/lib/workArchive';
import { ProjectCard } from '@/components/ProjectCard';

type Project = (typeof projects)[number];

export function WorkArchive({ projects }: { projects: readonly Project[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Read the shareable URL once; afterwards local state is the source of truth, so URL updates can never overwrite a newer choice.
  const [focus, setFocus] = useState<WorkFocusId | ''>(() => {
    const initial = searchParams.get('focus');
    return isWorkFocus(initial) ? initial : '';
  });
  const results = useMemo(() => filterProjectsByFocus(projects, focus), [focus, projects]);
  const counts = useMemo(() => Object.fromEntries(WORK_FOCUS_AREAS.map((area) => [area.id, filterProjectsByFocus(projects, area.id).length])), [projects]);

  function choose(next: WorkFocusId | '') {
    setFocus(next);
    const params = new URLSearchParams(window.location.search);
    if (next) params.set('focus', next);
    else params.delete('focus');
    params.delete('q');
    params.delete('discipline');
    const suffix = params.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ''}`, { scroll: false });
  }

  return (
    <section className="section-shell work-archive" aria-labelledby="work-archive-title">
      <div className="work-archive__toolbar">
        <h2 className="eyebrow" id="work-archive-title">Browse by focus</h2>
        <div className="work-archive__chips" role="group" aria-label="Filter case studies by focus">
          <button type="button" aria-pressed={focus === ''} onClick={() => choose('')}>All <span aria-hidden="true">{projects.length}</span></button>
          {WORK_FOCUS_AREAS.map((area) => (
            <button key={area.id} type="button" aria-pressed={focus === area.id} onClick={() => choose(area.id)}>
              {area.label} <span aria-hidden="true">{counts[area.id]}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="work-archive__status" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? 'case study' : 'case studies'}
      </p>
      <ol className="case-study-index__list">
        {results.map((project, index) => <li key={project.slug}><span>{String(index + 1).padStart(2, '0')}</span><ProjectCard project={project} /></li>)}
      </ol>
    </section>
  );
}
