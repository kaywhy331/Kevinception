import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';
import type { YearId } from '@/content/data';
import { createPageMetadata } from '@/content/metadata';

export function generateStaticParams() {
  return YEAR_ORDER.map((year) => ({ year }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year: rawYear } = await params;
  if (!YEAR_ORDER.includes(rawYear as YearId)) return {};
  const year = rawYear as YearId;
  const config = eraConfigs[year];
  const title = `${year} ${config.chapterName} — ${config.experienceName}`;
  const description = `${config.chapterThesis} ${config.transformation}`;
  const url = `/experience/${year}/`;
  return createPageMetadata({
    title,
    description,
    path: url
  });
}

export default async function EraPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: rawYear } = await params;
  if (!YEAR_ORDER.includes(rawYear as YearId)) notFound();
  const year = rawYear as YearId;
  const config = eraConfigs[year];
  return (
    <article id="main-content">
      <p>Chapter {config.chapterNumber} of {YEAR_ORDER.length} · {config.medium}</p>
      <h1>{year}: {config.chapterName}</h1>
      <p>Experienced through {config.experienceName}. {config.chapterThesis}</p>
      <h2>{config.transformation}</h2>
      <p>{config.lesson}</p>
    </article>
  );
}
