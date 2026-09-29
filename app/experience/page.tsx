import type { Metadata } from 'next';
import { eraConfigs, YEAR_ORDER } from '@/experience/config';

const description = 'Six rooms, one per era of technology that shaped Kevin: 1990, 2000, 2010, 2020, 2030, and 2040. Pick a chapter and step inside.';

export const metadata: Metadata = {
  title: 'Chapters',
  description,
  alternates: { canonical: '/experience/' },
  openGraph: { title: 'Chapters · Kevinception', description, url: '/experience/' }
};

export default function ExperienceChaptersPage() {
  return (
    <article>
      <h1>Kevinception chapters</h1>
      <p>Choose a chapter and step into its room.</p>
      {YEAR_ORDER.map((year) => <section key={year}><h2><a href={`/experience/${year}/`}>{year}: {eraConfigs[year].chapterName} — {eraConfigs[year].experienceName}</a></h2><p>{eraConfigs[year].description}</p></section>)}
    </article>
  );
}
