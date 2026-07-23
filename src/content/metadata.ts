import type { Metadata } from 'next';
import { site } from './data';

export function createPageMetadata({
  title,
  description,
  path,
  socialTitle = title,
  socialDescription = description,
  type = 'website'
}: {
  title: string;
  description: string;
  path: string;
  socialTitle?: string;
  socialDescription?: string;
  type?: 'website' | 'article';
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url: path,
      siteName: site.name,
      type,
      images: [{ url: site.socialImage, width: 1200, height: 630, alt: 'Kevinception — one evolving mind through six defining interfaces' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [{ url: site.socialImage, alt: 'Kevinception — one evolving mind through six defining interfaces' }]
    }
  };
}
