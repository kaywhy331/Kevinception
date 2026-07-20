import type { Metadata } from 'next';
import './globals.css';
import { site } from '@/content/data';

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { title: site.title, description: site.description, url: site.domain, siteName: site.name, type: 'website' },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
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
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </body>
    </html>
  );
}
