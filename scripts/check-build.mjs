import fs from 'node:fs';
import path from 'node:path';

const years = ['1990', '2000', '2010', '2020', '2030', '2040'];
// 2030 and 2040 are native React chapters; only these eras still embed a legacy application.
const legacyYears = ['1990', '2000', '2010', '2020'];

const required = [
  'index.html', 'work/index.html', 'resume/index.html', 'about/index.html', 'contact/index.html',
  'experience/index.html', ...years.map((y) => `experience/${y}/index.html`)
];
const missing = required.filter((file) => !fs.existsSync(path.join('out', file)));
if (missing.length) {
  console.error('Missing build output:', missing.join(', '));
  process.exit(1);
}
const legacy = legacyYears.filter((year) => !fs.existsSync(path.join('out', 'legacy', 'experience', year, 'index.html')));
if (legacy.length) {
  console.error('Missing embedded legacy eras:', legacy.join(', '));
  process.exit(1);
}
const retired = ['legacy/experience/2030', 'legacy/experience/2040', 'legacy/about', 'legacy/work', 'legacy/_headers', 'legacy/index.html']
  .filter((file) => fs.existsSync(path.join('out', file)));
if (retired.length) {
  console.error('Retired legacy output is still exported:', retired.join(', '));
  process.exit(1);
}
const requiredAssets = ['_headers', '_redirects', 'og-card.png', 'robots.txt', 'sitemap.xml', 'site.webmanifest'];
const missingAssets = requiredAssets.filter((file) => !fs.existsSync(path.join('out', file)));
if (missingAssets.length) {
  console.error('Missing deployment/metadata assets:', missingAssets.join(', '));
  process.exit(1);
}
console.log(`Build check passed: ${required.length} routes and ${legacyYears.length} embedded legacy applications.`);
