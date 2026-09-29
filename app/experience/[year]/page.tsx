import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';
import type { YearId } from '@/content/data';

export function generateStaticParams() {
  return YEAR_ORDER.map((year) => ({ year }));
}

/**
 * `/experience/<year>/` is the canonical deep link for a chapter's room. The
 * interface and text views use `?view=interface` / `?view=text` on the same
 * path, so every view of a chapter shares this metadata.
 */
export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year: rawYear } = await params;
  if (!YEAR_ORDER.includes(rawYear as YearId)) return {};
  const year = rawYear as YearId;
  const config = eraConfigs[year];
  const title = `${year} ${config.chapterName} — ${config.experienceName}`;
  const url = `/experience/${year}/`;
  return {
    title,
    description: config.chapterThesis,
    alternates: { canonical: url },
    openGraph: { title: `${title} · Kevinception`, description: config.chapterThesis, url }
  };
}

export default async function EraPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: rawYear } = await params;
  if (!YEAR_ORDER.includes(rawYear as YearId)) notFound();
  const year = rawYear as YearId;
  const config = eraConfigs[year];
  return (
    <article>
      <p>Chapter {config.chapterNumber} of {YEAR_ORDER.length} · {config.medium}</p>
      <h1>{year}: {config.chapterName}</h1>
      <p>Experienced through {config.experienceName}. {config.chapterThesis}</p>
      <h2>{config.transformation}</h2>
      <p>{config.lesson}</p>
    </article>
  );
}
