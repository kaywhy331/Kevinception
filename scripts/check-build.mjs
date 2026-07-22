import fs from 'node:fs';
import path from 'node:path';

const required = [
  'index.html', 'portfolio/index.html', 'work/index.html', 'resume/index.html', 'about/index.html', 'contact/index.html',
  'experience/index.html', ...['1990','2000','2010','2020','2030','2040'].map((y) => `experience/${y}/index.html`)
];
const missing = required.filter((file) => !fs.existsSync(path.join('out', file)));
if (missing.length) {
  console.error('Missing build output:', missing.join(', '));
  process.exit(1);
}
const legacy = ['1990','2000','2010','2020','2030','2040'].filter((year) => !fs.existsSync(path.join('out','legacy','experience',year,'index.html')));
if (legacy.length) {
  console.error('Missing embedded legacy eras:', legacy.join(', '));
  process.exit(1);
}
const prefetchAliases = [
  'experience/__next.experience.__PAGE__.txt',
  ...['1990','2000','2010','2020','2030','2040'].map((year) => `experience/${year}/__next.experience.$d$year.__PAGE__.txt`),
  ...['portfolio','work','resume','about','contact'].map((route) => `${route}/__next.${route}.__PAGE__.txt`)
];
const missingPrefetchAliases = prefetchAliases.filter((file) => !fs.existsSync(path.join('out', file)));
if (missingPrefetchAliases.length) {
  console.error('Missing RSC prefetch aliases:', missingPrefetchAliases.join(', '));
  process.exit(1);
}
console.log(`Build check passed: ${required.length} routes, 6 legacy applications, and ${prefetchAliases.length} RSC prefetch aliases.`);
