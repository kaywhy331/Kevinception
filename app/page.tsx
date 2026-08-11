import { EraPortalCanvas } from '@/components/EraPortalCanvas';

export default function HomePage() {
  return (
    <main id="main-content" className="landing-page">
      <div className="landing-page__layout">
        <section className="landing-page__content" aria-labelledby="landing-title">
          <div className="landing-page__brand" aria-label="Kevinception">
            <span aria-hidden="true">K</span>
            <b>Kevinception</b>
          </div>
          <p className="eyebrow">An interactive portfolio by Kevin Yang</p>
          <h1 id="landing-title">One life.<br /><span>Six eras of technology.</span></h1>
        </section>
        <EraPortalCanvas />
      </div>
    </main>
  );
}
