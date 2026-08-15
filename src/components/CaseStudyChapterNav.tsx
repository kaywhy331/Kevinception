'use client';

import { useEffect, useState } from 'react';

export const CASE_STUDY_CHAPTERS = [
  { id: 'problem', label: 'Problem' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'approach', label: 'Approach' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'artifacts', label: 'Artifacts' },
  { id: 'learnings', label: 'Learnings' }
] as const;

export function CaseStudyChapterNav() {
  const [activeChapter, setActiveChapter] = useState<string>(CASE_STUDY_CHAPTERS[0].id);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const sections = CASE_STUDY_CHAPTERS
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top));
      const current = visible[0]?.target;
      if (current instanceof HTMLElement) setActiveChapter(current.id);
    }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.2, 0.6] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="case-study__chapters" aria-label="Case study chapters">
      <span>Case file</span>
      <ol>
        {CASE_STUDY_CHAPTERS.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              aria-current={activeChapter === chapter.id ? 'location' : undefined}
              onClick={() => setActiveChapter(chapter.id)}
            >
              <small aria-hidden="true">{String(index + 1).padStart(2, '0')}</small>
              {chapter.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
