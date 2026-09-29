import { site, type YearId } from '@/content/data';
import { eraConfigs, getYearFromPath, YEAR_ORDER } from './config';

/**
 * Deep-link contract for the immersive journey.
 *
 * - `/experience/`                     chapters overview
 * - `/experience/<year>/`              that year's room (environment view)
 * - `/experience/<year>/?view=interface` the year's functional interface
 * - `/experience/<year>/?view=text`    the text version of the chapter
 * - `/experience/2010/?view=interface&module=<id>` a StealStreet Commerce module
 *
 * Legacy `/experience/?year=YYYY[&view=…][&module=…]` links keep working and are
 * normalised client-side to the canonical path.
 */
export type ExperienceView = 'timeline' | 'environment' | 'interface' | 'text';

export type ExperienceLocation = {
  year: YearId | null;
  view: ExperienceView;
  module: string | null;
  /** False when the URL used the legacy query form and should be rewritten. */
  canonical: boolean;
};

export const COMMERCE_MODULES = new Set([
  'home',
  'dashboard',
  'orders',
  'purchase-orders',
  'catalog',
  'inventory',
  'marketplaces',
  'vendors',
  'customer-service',
  'warehouse',
  'returns',
  'reports',
  'settings'
]);

export function isYear(value: string | null | undefined): value is YearId {
  return Boolean(value && YEAR_ORDER.includes(value as YearId));
}

export function normalizeCommerceModule(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value === 'administration' ? 'settings' : value;
  return COMMERCE_MODULES.has(normalized) ? normalized : null;
}

export function parseExperienceLocation(pathname: string, search: string): ExperienceLocation {
  const params = new URLSearchParams(search);
  const pathYear = getYearFromPath(pathname);
  const queryYear = params.get('year');
  const year = pathYear ?? (isYear(queryYear) ? queryYear : null);
  if (!year) return { year: null, view: 'timeline', module: null, canonical: !queryYear };
  const requestedView = params.get('view');
  const requestedModule = normalizeCommerceModule(params.get('module'));
  const view: ExperienceView = requestedView === 'text'
    ? 'text'
    : requestedView === 'interface' || (year === '2010' && params.has('module'))
      ? 'interface'
      : 'environment';
  const module = year === '2010' && view === 'interface' ? requestedModule ?? 'home' : null;
  const canonical = Boolean(pathYear) && !params.has('year') && experienceHref(year, view, module) === `${ensureTrailingSlash(pathname)}${search.startsWith('?') || !search ? search : `?${search}`}`;
  return { year, view, module, canonical };
}

function ensureTrailingSlash(pathname: string) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function experienceHref(year: YearId | null, view: ExperienceView = 'environment', module: string | null = null) {
  if (!year || view === 'timeline') return '/experience/';
  const path = `/experience/${year}/`;
  if (view === 'environment') return path;
  const params = new URLSearchParams({ view });
  if (year === '2010' && view === 'interface') params.set('module', normalizeCommerceModule(module) ?? 'home');
  return `${path}?${params.toString()}`;
}

export function currentHref() {
  return `${window.location.pathname}${window.location.search}`;
}

function commerceModuleLabel(module: string | null) {
  if (module === 'home') return 'StealStreet Home';
  if (!module || module === 'dashboard') return 'Operations Dashboard';
  if (module === 'settings') return 'Settings / Administration';
  return module.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * The document title for a journey location. Chapter titles match the static
 * route metadata; the 2010 interface prefixes the active StealStreet module,
 * which changes without a route change.
 */
export function experienceDocumentTitle(year: YearId | null, view: ExperienceView, module: string | null = null) {
  if (!year || view === 'timeline') return `Chapters | ${site.name}`;
  const config = eraConfigs[year];
  const chapter = `${year} ${config.chapterName} — ${config.experienceName} | ${site.name}`;
  return year === '2010' && view === 'interface' ? `${commerceModuleLabel(module)} — ${chapter}` : chapter;
}
