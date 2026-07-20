import Link from 'next/link';
import { profile } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata = { title: 'About Kevin', description: 'Kevin Yang’s technology origin story, working style, philosophy, and current focus.' };

export default function AboutPage() {
  return (
    <SiteChrome>
      <article id="main-content" className="about-page">
        <header className="simple-hero"><p className="eyebrow">About Kevin</p><h1>Explore widely. Recognize the system. Make the idea usable.</h1><p className="lead">{profile.origin}</p></header>
        <section className="about-origin"><div><p>{profile.originContinuation}</p><blockquote>{profile.quote}</blockquote></div><aside><p className="eyebrow">Current focus</p><p>{profile.currentFocus}</p></aside></section>
        <section><p className="eyebrow">How Kevin works</p><h2>Clarity before machinery.</h2><div className="step-grid">{profile.workingStyle.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></article>)}</div></section>
        <section><p className="eyebrow">Philosophy</p><div className="philosophy-grid">{profile.philosophy.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
        <section className="about-timeline"><p className="eyebrow">Technology timeline</p><h2>The interfaces changed. The pattern did not.</h2><div>{[['1990','Wonder'],['2000','Connection'],['2010','Identity'],['2020','Creation'],['2030','Orchestration'],['2040','Continuity']].map(([year, word]) => <Link key={year} href={`/experience/${year}/`}><b>{year}</b><span>{word}</span></Link>)}</div></section>
        <section className="final-cta"><h2>What are you trying to build, improve, decide, or untangle?</h2><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><Link className="secondary-action" href="/work/">View work</Link></div></section>
      </article>
    </SiteChrome>
  );
}
