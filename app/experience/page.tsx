import { eraConfigs, YEAR_ORDER } from '@/experience/config';

export const metadata = {
  title: 'Technology Timeline',
  description: 'Travel through six technology interfaces that shaped Kevin: 1990, 2000, 2010, 2020, 2030, and 2040.'
};

export default function ExperienceTimelinePage() {
  return (
    <article id="main-content">
      <h1>Kevinception technology timeline</h1>
      <p>Choose a year and enter its defining technology interface.</p>
      {YEAR_ORDER.map((year) => <section key={year}><h2>{year}: {eraConfigs[year].title}</h2><p>{eraConfigs[year].description}</p></section>)}
    </article>
  );
}
