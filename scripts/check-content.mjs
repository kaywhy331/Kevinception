import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync('src/content/data.ts', 'utf8');

function parseJsonExport(name, closingToken) {
  const marker = `export const ${name} = `;
  const start = source.indexOf(marker);
  const end = source.indexOf(closingToken, start);
  if (start < 0 || end < 0) throw new Error(`Unable to read ${name} from the canonical content layer.`);
  return JSON.parse(source.slice(start + marker.length, end + 1));
}

const site = parseJsonExport('site', '} as const;');
const projects = parseJsonExport('projects', '] as const;');
const profileBlock = source.slice(source.indexOf('export const profile = '), source.indexOf('export const capabilityGroups = '));
const profileEmail = profileBlock.match(/"contactEmail":\s*"([^"]+)"/)?.[1];
const errors = [];

if (!site.contactEmail) errors.push('site.contactEmail must not be empty');
if (site.contactEmail !== profileEmail) errors.push('site.contactEmail must match profile.contactEmail');
if (!site.socialImage?.startsWith('/')) errors.push('site.socialImage must be a root-relative path');
else if (!fs.existsSync(path.join('public', site.socialImage.slice(1)))) errors.push(`site.socialImage does not exist: ${site.socialImage}`);

const slugs = new Set();
for (const project of projects) {
  if (!/^[a-z0-9-]+$/.test(project.slug)) errors.push(`invalid project slug: ${project.slug}`);
  if (slugs.has(project.slug)) errors.push(`duplicate project slug: ${project.slug}`);
  slugs.add(project.slug);
  if (project.draft !== false) errors.push(`${project.slug}: public projects must explicitly set draft=false`);
  if (!project.outcomes?.length || !project.artifacts?.length) errors.push(`${project.slug}: outcomes and artifacts are required`);
  for (const year of ['1990', '2000', '2010', '2020', '2030', '2040']) {
    if (!project.eraPresentation?.[year]) errors.push(`${project.slug}: missing ${year} era presentation`);
  }
}

const chrome = fs.readFileSync('src/components/SiteChrome.tsx', 'utf8');
for (const route of ['experience', 'portfolio', 'work', 'resume', 'about', 'contact']) {
  if (!chrome.includes(`href: '/${route}/'`)) errors.push(`primary navigation is missing /${route}/`);
  if (!fs.existsSync(path.join('app', route))) errors.push(`route source is missing app/${route}`);
}

if (errors.length) {
  console.error(`Canonical content/configuration errors:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`Content/configuration check passed: ${projects.length} canonical projects, ${slugs.size} unique slugs, contact and social metadata aligned.`);
