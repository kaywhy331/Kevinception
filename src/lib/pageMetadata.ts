import type { Metadata } from 'next';
import { site } from '@/content/data';

type PageMetadataInput = {
  /** Short page title; the root template appends "| Kevinception". */
  title: string;
  description: string;
  /** Root-relative canonical path with a trailing slash, e.g. `/resume/`. */
  path: string;
  /** Use when the title must not receive the site-name suffix. */
  absoluteTitle?: boolean;
};

/**
 * Per-page metadata with matching share cards and a canonical URL, so child pages
 * never inherit the homepage Open Graph title.
 */
export function pageMetadata({ title, description, path, absoluteTitle = false }: PageMetadataInput): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: site.name,
      type: 'website',
      images: [{ url: site.socialImage, width: 1200, height: 630, alt: 'Kevinception portfolio preview' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [site.socialImage]
    }
  };
}
