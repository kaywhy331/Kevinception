import Link from 'next/link';
import type { CSSProperties } from 'react';
import { profile } from '@/content/data';
import { kevinOriginNarrative } from '@/content/narrative';
import { SiteChrome } from '@/components/SiteChrome';
import { eraConfigs, getEraCssVariables, YEAR_ORDER } from '@/experience/config';

export const metadata = { title: 'About Kevin', description: 'Kevin Yang’s technology origin story, working style, philosophy, and six-stage relationship with technology.' };

export default function AboutPage() {
  return (
    <SiteChrome>
      <article id="main-content" className="about-page">
        <header className="simple-hero"><p className="eyebrow">About Kevin</p><h1>Explore widely. Recognize the system. Make the idea usable.</h1><p className="lead">{kevinOriginNarrative.origin}</p></header>
        <section className="about-origin"><div><p>{kevinOriginNarrative.continuation}</p><blockquote>{profile.quote}</blockquote></div><aside><p className="eyebrow">Current focus</p><p>{profile.currentFocus}</p></aside></section>
        <section><p className="eyebrow">How I work</p><h2>Clarity before machinery.</h2><div className="step-grid">{profile.workingStyle.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></article>)}</div></section>
        <section><p className="eyebrow">Philosophy</p><div className="philosophy-grid">{profile.philosophy.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
        <section className="about-timeline">
          <p className="eyebrow">Six digital eras</p>
          <h2>The interfaces changed. The pattern compounded.</h2>
          <div>{YEAR_ORDER.map((year) => {
            const chapter = eraConfigs[year];
            return (
              <Link
                key={year}
                className="era-echo"
                data-era={year}
                data-era-texture={chapter.designLanguage.texture}
                style={getEraCssVariables(year) as CSSProperties}
                href={`/experience/?year=${year}`}
              >
                <b>{year}</b>
                <span>{chapter.chapterName}</span>
                <small>{chapter.experienceName}</small>
                <em>{chapter.designLanguage.name}</em>
              </Link>
            );
          })}</div>
        </section>
        <section className="final-cta"><h2>What are you trying to build, improve, decide, or untangle?</h2><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><Link className="secondary-action" href="/work/">View work</Link></div></section>
      </article>
    </SiteChrome>
  );
}
