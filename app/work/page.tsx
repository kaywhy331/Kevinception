import { Suspense } from 'react';
import { orderedCaseStudies } from '@/content/editorial';
import { SiteChrome } from '@/components/SiteChrome';
import { WorkArchive } from '@/components/WorkArchive';
import { pageMetadata } from '@/lib/pageMetadata';

export const metadata = pageMetadata({
  title: 'Case studies',
  description: 'Kevin Yang’s case studies: AI tooling, agent operations, product strategy, and interactive product work.',
  path: '/work/'
});

export default function WorkPage() {
  return (
    <SiteChrome>
      <section id="main-content" className="simple-hero section-shell">
        <p className="eyebrow">Case studies</p>
        <h1>Projects that make systems, decisions, and possibilities tangible.</h1>
        <p className="lead">{orderedCaseStudies.length} projects, from AI tooling and agent operations to product strategy and interactive work. Each one covers the problem, the constraints, the decisions, and what shipped.</p>
      </section>
      <Suspense fallback={<p className="section-shell" role="status">Loading case studies…</p>}>
        <WorkArchive projects={orderedCaseStudies} />
      </Suspense>
    </SiteChrome>
  );
}
