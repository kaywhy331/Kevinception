'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { eraConfigs, YEAR_ORDER } from './config';
import { useExperienceActions } from './ExperienceContext';
import { useExperienceStore } from './store';

export function PersistentTimelineNav() {
  const activeYear = useExperienceStore((state) => state.activeYear);
  const viewMode = useExperienceStore((state) => state.viewMode);
  const visits = useExperienceStore((state) => state.yearVisits);
  const { navigateToYear } = useExperienceActions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || (viewMode !== 'environment' && viewMode !== 'transition')) return null;

  return createPortal(
    <div className="year-selector persistent-year-selector" role="list" aria-label="Technology timeline years">
      {YEAR_ORDER.map((year) => {
        const config = eraConfigs[year];
        return (
          <button
            key={year}
            type="button"
            role="listitem"
            className={activeYear === year ? 'is-active' : ''}
            style={{ '--era-accent': config.accent } as React.CSSProperties}
            onClick={() => navigateToYear(year)}
            aria-current={activeYear === year ? 'step' : undefined}
          >
            <span>{year}</span>
            <b>{config.title}</b>
            {visits[year] > 0 && <small aria-label={`${visits[year]} visits`}>●</small>}
          </button>
        );
      })}
    </div>,
    document.body
  );
}
