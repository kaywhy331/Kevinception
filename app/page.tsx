import Link from 'next/link';
import type { Metadata } from 'next';
import { EraPortalCanvas } from '@/components/EraPortalCanvas';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function HomePage() {
  return (
    <main id="main-content" className="landing-page">
      <div className="landing-page__layout">
        <section className="landing-page__content" aria-labelledby="landing-title">
          <p className="landing-page__brand">
            <span aria-hidden="true">K</span>
            <b>Kevinception</b>
          </p>
          <p className="eyebrow">An interactive portfolio by Kevin Yang</p>
          <h1 id="landing-title">One life.<br /><span>Six eras of technology.</span></h1>
          <div className="landing-page__actions">
            <Link className="primary-action landing-page__start" href="/experience/" data-analytics-event="timeline_enter" data-analytics-source="home_start">
              Start the journey <span className="landing-page__start-note">Begins in 1990 <span aria-hidden="true">→</span></span>
            </Link>
            <nav className="landing-page__direct" aria-label="Skip the journey">
              <Link href="/resume/">Resume</Link>
              <span aria-hidden="true">·</span>
              <Link href="/work/">Case studies</Link>
              <span aria-hidden="true">·</span>
              <Link href="/contact/">Contact</Link>
            </nav>
          </div>
        </section>
        <EraPortalCanvas />
      </div>
    </main>
  );
}
