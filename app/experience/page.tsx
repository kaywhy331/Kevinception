import { eraConfigs, YEAR_ORDER } from '@/experience/config';
import { createPageMetadata } from '@/content/metadata';

export const metadata = createPageMetadata({
  title: 'Technology Timeline',
  description: 'Travel through six technology interfaces that shaped Kevin: 1990, 2000, 2010, 2020, 2030, and 2040.',
  path: '/experience/',
  socialTitle: 'Kevinception Technology Timeline',
  socialDescription: 'Six defining interfaces. One evolving mind.'
});

export default function ExperienceTimelinePage() {
  return (
    <article id="main-content">
      <h1>Kevinception technology timeline</h1>
      <p>Choose a year and enter its defining technology interface.</p>
      {YEAR_ORDER.map((year) => <section key={year}><h2>{year}: {eraConfigs[year].title}</h2><p>{eraConfigs[year].description}</p></section>)}
    </article>
  );
}
