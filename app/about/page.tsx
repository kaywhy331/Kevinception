import Link from 'next/link';
import type { CSSProperties } from 'react';
import { capabilityGroups, profile } from '@/content/data';
import { kevinOriginNarrative } from '@/content/narrative';
import { chapterHref } from '@/components/navigation';
import { SiteChrome } from '@/components/SiteChrome';
import { eraConfigs, getEraCssVariables, YEAR_ORDER } from '@/experience/config';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata({
  title: 'About Kevin Yang',
  description: 'Kevin Yang’s origin story, how he works, what he does, current work, and the six chapters of his relationship with technology.',
  path: '/about/'
});

const pad = (index: number) => String(index + 1).padStart(2, '0');

export default function AboutPage() {
  return (
    <SiteChrome>
      <article id="main-content" className="about-page">
        <header className="simple-hero">
          <p className="eyebrow">About · Kevin Yang</p>
          <h1>{profile.headline}</h1>
          <p className="lead">{profile.currentFocus}</p>
          <div className="button-row">
            <Link className="primary-action" href="/work/">Read the case studies</Link>
            <Link className="secondary-action" href="/resume/">Open the resume</Link>
          </div>
        </header>

        <section className="about-origin" aria-labelledby="about-origin-title">
          <div>
            <p className="eyebrow">Origin</p>
            <h2 id="about-origin-title">Explore widely. Recognize the system. Make the idea usable.</h2>
            <p>{kevinOriginNarrative.origin}</p>
            <p>{kevinOriginNarrative.continuation}</p>
          </div>
          <blockquote>“{profile.quote}”</blockquote>
        </section>

        <section aria-labelledby="about-how-title">
          <p className="eyebrow">How I work</p>
          <h2 id="about-how-title">Clarity before machinery.</h2>
          <ol className="step-grid">{profile.workingStyle.map((item, index) => <li key={item}><span>{pad(index)}</span><p>{item}</p></li>)}</ol>
        </section>

        <section className="capability-section" aria-labelledby="about-capabilities-title">
          <p className="eyebrow">What I do</p>
          <h2 id="about-capabilities-title">Strategy through execution.</h2>
          <ol className="capability-ledger">{capabilityGroups.map((group, index) => <li key={group.title}><span>{pad(index)}</span><div><h3>{group.title}</h3><p>{group.description}</p><div className="tag-row">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></li>)}</ol>
        </section>

        <section aria-labelledby="about-current-title">
          <p className="eyebrow">Current work</p>
          <h2 id="about-current-title">What I’m building now.</h2>
          <div className="current-work-editorial">{profile.currentWork.map((item, index) => <article key={item.title}><span aria-hidden="true">{pad(index)}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
        </section>

        <section aria-labelledby="about-principles-title">
          <p className="eyebrow">Principles</p>
          <h2 id="about-principles-title">Make complex work visible and doable.</h2>
          <div className="philosophy-grid">{profile.philosophy.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        </section>

        <section className="about-timeline" aria-labelledby="about-chapters-title">
          <p className="eyebrow">Six chapters</p>
          <h2 id="about-chapters-title">The interfaces changed. The pattern compounded.</h2>
          <div>{YEAR_ORDER.map((year) => {
            const chapter = eraConfigs[year];
            return (
              <Link
                key={year}
                className="era-echo"
                data-era={year}
                data-era-texture={chapter.designLanguage.texture}
                style={getEraCssVariables(year) as CSSProperties}
                href={chapterHref(year)}
              >
                <b>{year}</b>
                <span>{chapter.chapterName}</span>
                <small>{chapter.experienceName}</small>
                <em>{chapter.designLanguage.name}</em>
              </Link>
            );
          })}</div>
        </section>

        <section className="final-cta"><h2>What are you trying to build, improve, decide, or untangle?</h2><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><Link className="secondary-action" href="/work/">Read the case studies</Link></div></section>
      </article>
    </SiteChrome>
  );
}
