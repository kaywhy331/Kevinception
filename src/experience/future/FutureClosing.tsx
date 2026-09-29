'use client';

import Link from 'next/link';
import { CHAPTER_ORDER, chapterNarrative } from '@/content/narrative';
import { artifacts as artifactDefinitions } from '../artifacts';
import { useExperienceStore } from '../store';
import { ECHO_FINALE_SUMMARY, ECHO_FINALE_TITLE } from './futureJourney';
import { RETENTION_OUTCOMES, type EncounterRetention } from './futureWorld';

/**
 * The payoff after the last question in 2040: the six eras tied back together,
 * then three clear ways out. Shared by the visual and text paths.
 */
export function FutureClosing({ retention, variant, onStartOver, onLiveAgain }: {
  retention: Exclude<EncounterRetention, 'unasked'>;
  variant: 'visual' | 'text';
  onStartOver: () => void;
  onLiveAgain: () => void;
}) {
  const progress = useExperienceStore((state) => state.artifacts);
  const found = artifactDefinitions.filter((artifact) => progress[artifact.id]?.discoveredYears.length > 0).length;
  const titleId = `future-closing-title-${variant}`;

  return (
    <section className={`future-closing future-closing--${variant}`} data-future-part="closing" data-retention={retention} aria-labelledby={titleId}>
      <p className="future-closing__outcome">“{RETENTION_OUTCOMES[retention]}”</p>
      <p className="future-kicker">1990 → 2040 · six chapters</p>
      <h2 id={titleId}>{ECHO_FINALE_TITLE}</h2>
      <p className="future-closing__summary">{ECHO_FINALE_SUMMARY}</p>
      <ol className="future-closing__eras" aria-label="The six chapters">
        {CHAPTER_ORDER.map((year) => (
          <li key={year}><b>{year}</b><span>{chapterNarrative[year].transformation}</span></li>
        ))}
      </ol>
      <p className="future-closing__artifacts">You found {found} of {artifactDefinitions.length} artifacts along the way.</p>
      <div className="future-closing__actions">
        <Link className="future-primary" href="/work/">See what Kevin made</Link>
        <Link href="/contact/">Reach the living Kevin</Link>
        <button type="button" onClick={onStartOver}>Start again at 1990</button>
      </div>
      {retention === 'released'
        ? <button className="future-closing__again" type="button" onClick={onLiveAgain}>Live the morning again</button>
        : <p className="future-closing__hint">He is still here. Notice something else in the room to begin another encounter.</p>}
    </section>
  );
}
