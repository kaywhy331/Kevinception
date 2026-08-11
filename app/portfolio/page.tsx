import Link from 'next/link';
import { capabilityGroups, profile } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata = { title: 'Profile', description: 'How Kevin Yang approaches strategy, systems, product, operations, automation, AI, and creative technology.' };

export default function PortfolioPage() {
  return (
    <SiteChrome>
      <section id="main-content" className="portfolio-hero section-shell">
        <p className="eyebrow">Profile · Kevin Yang</p>
        <h1>{profile.headline}</h1>
        <p className="lead">{profile.currentFocus}</p>
        <div className="button-row"><Link className="primary-action" href="/work/">Read the case studies</Link><Link className="secondary-action" href="/contact/">Start a conversation</Link><Link className="text-link" href="/experience/">Enter the timeline →</Link></div>
      </section>
      <section className="section-shell profile-statement"><p className="eyebrow">The through-line</p><blockquote>“{profile.quote}”</blockquote><p>I look for the system beneath the surface, make its choices and dependencies visible, then turn the model into something people can use.</p></section>
      <section className="section-shell capability-section"><header className="section-heading"><p className="eyebrow">What I do</p><h2>Strategy through execution.</h2></header><ol className="capability-ledger">{capabilityGroups.map((group, index) => <li key={group.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{group.title}</h3><p>{group.description}</p><div className="tag-row">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></li>)}</ol></section>
      <section className="section-shell current-work-section"><header className="section-heading"><p className="eyebrow">Current work</p><h2>Three connected areas of focus.</h2></header><div className="current-work-editorial">{profile.currentWork.map((item, index) => <article key={item.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></section>
      <section className="section-shell philosophy-section"><header className="section-heading"><p className="eyebrow">Operating principles</p><h2>Make complex work visible and executable.</h2></header><div className="philosophy-ribbon">{profile.philosophy.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><Link className="text-link" href="/resume/">Open the resume →</Link></section>
      <section className="section-shell final-cta"><p className="eyebrow">Bring the difficult problem</p><h2>Let’s make the next step clear.</h2><div className="button-row"><Link className="primary-action" href="/contact/">Start a conversation</Link><Link className="secondary-action" href="/experience/">Explore the timeline</Link></div></section>
    </SiteChrome>
  );
}
