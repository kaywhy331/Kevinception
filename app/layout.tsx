import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import './globals.css';
import './environment-pass.css';
import './device-native-pass.css';
import './future-wing.css';
import './award-pass.css';
import './era-design-languages.css';
import './micro-interactions.css';
import './page-choreography.css';
import { Analytics } from '@/components/Analytics';
import { MicroInteractions } from '@/components/MicroInteractions';
import { PageChoreography } from '@/components/PageChoreography';
import { site } from '@/content/data';
import { narrativeSite } from '@/content/narrative';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const syne = Syne({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-display'
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: { default: narrativeSite.title, template: `%s | ${site.name}` },
  description: narrativeSite.description,
  applicationName: site.name,
  openGraph: {
    title: narrativeSite.title,
    description: narrativeSite.description,
    url: site.domain,
    siteName: site.name,
    type: 'website',
    images: [{ url: site.socialImage, width: 1200, height: 630, alt: 'Kevinception portfolio preview' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: narrativeSite.title,
    description: narrativeSite.description,
    images: [site.socialImage]
  },
  robots: { index: true, follow: true },
  manifest: '/site.webmanifest',
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const person = {
    '@context': 'https://schema.org', '@type': 'Person', name: 'Kevin Yang', url: site.domain,
    sameAs: ['https://github.com/kaywhy331', 'https://tokenpak.ai'],
    knowsAbout: ['Strategy', 'Systems thinking', 'Product design', 'Operations', 'Automation', 'Artificial intelligence']
  };
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body>
        <Analytics />
        <MicroInteractions />
        <PageChoreography />
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </body>
    </html>
  );
}
