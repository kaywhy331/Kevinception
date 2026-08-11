import { Suspense } from 'react';
import { projects } from '@/content/data';
import { SiteChrome } from '@/components/SiteChrome';
import { WorkArchive } from '@/components/WorkArchive';

export const metadata = { title: 'Case studies', description: 'Selected Kevin Yang projects and case studies.' };

export default function WorkPage() {
  return <SiteChrome><section id="main-content" className="simple-hero section-shell"><p className="eyebrow">Case study archive</p><h1>Projects that make systems, decisions, and possibilities tangible.</h1><p className="lead">Search, filter, and share a focused archive. Every result has a direct URL and draws from the same source facts used inside the immersive timeline.</p></section><Suspense fallback={<p className="section-shell" role="status">Loading case studies…</p>}><WorkArchive projects={projects} /></Suspense></SiteChrome>;
}
