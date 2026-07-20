import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';
import type { YearId } from '@/content/data';

export function generateStaticParams() {
  return YEAR_ORDER.map((year) => ({ year }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year: rawYear } = await params;
  if (!YEAR_ORDER.includes(rawYear as YearId)) return {};
  const year = rawYear as YearId;
  const config = eraConfigs[year];
  return { title: `${year} — ${config.title}`, description: config.description };
}

export default async function EraPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: rawYear } = await params;
  if (!YEAR_ORDER.includes(rawYear as YearId)) notFound();
  const year = rawYear as YearId;
  const config = eraConfigs[year];
  return (
    <article id="main-content">
      <p>{config.product}</p>
      <h1>{year}: {config.title}</h1>
      <p>{config.description}</p>
      <h2>Story function</h2>
      <p>{config.transformation}. The intended feeling is {config.emotionalGoal.toLowerCase()}.</p>
    </article>
  );
}
