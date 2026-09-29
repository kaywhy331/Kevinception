import type { YearId } from '@/content/data';

export type NavItem = {
  href: string;
  label: string;
  cta?: boolean;
};

/**
 * The one set of standard-route labels. Immersive menus should use the same
 * labels: Journey, Case studies, Resume, About, Contact.
 */
export const primaryNavigation = [
  { href: '/experience/', label: 'Journey' },
  { href: '/work/', label: 'Case studies' },
  { href: '/resume/', label: 'Resume' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact', cta: true }
] as const satisfies readonly NavItem[];

function normalize(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

/** True when `pathname` is the item's route or one of its children (e.g. /work/tokenpak/ under /work/). */
export function isCurrentRoute(pathname: string | null | undefined, href: string) {
  if (!pathname) return false;
  const current = normalize(pathname);
  const target = normalize(href);
  return current === target || current.startsWith(target);
}

/** `aria-current="page"` for the exact route, `"true"` for a parent section. */
export function ariaCurrentFor(pathname: string | null | undefined, href: string): 'page' | 'true' | undefined {
  if (!isCurrentRoute(pathname, href)) return undefined;
  return normalize(pathname as string) === normalize(href) ? 'page' : 'true';
}

/** Canonical deep link for a chapter: the path form, never `?year=`. */
export function chapterHref(year: YearId) {
  return `/experience/${year}/`;
}
