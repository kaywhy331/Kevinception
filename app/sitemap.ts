import type { MetadataRoute } from 'next';
import { site } from '@/content/data';
import { orderedCaseStudies } from '@/content/editorial';
import { chapterHref } from '@/components/navigation';
import { YEAR_ORDER } from '@/experience/config';

// Required for `output: 'export'`: the sitemap is rendered once at build time.
export const dynamic = 'force-static';

/** Indexable routes only. /portfolio/ redirects to /about/ and /legacy/ is not crawled. */
export const SITEMAP_PATHS = [
  '/',
  '/experience/',
  '/work/',
  '/resume/',
  '/about/',
  '/contact/',
  ...YEAR_ORDER.map((year) => chapterHref(year)),
  ...orderedCaseStudies.map((project) => `/work/${project.slug}/`)
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return SITEMAP_PATHS.map((path) => ({ url: new URL(path, site.domain).toString(), lastModified }));
}
