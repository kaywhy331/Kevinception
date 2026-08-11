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
const requiredAssets = ['_headers', 'og-card.png', 'robots.txt', 'sitemap.xml', 'site.webmanifest'];
const missingAssets = requiredAssets.filter((file) => !fs.existsSync(path.join('out', file)));
if (missingAssets.length) {
  console.error('Missing deployment/metadata assets:', missingAssets.join(', '));
  process.exit(1);
}
console.log(`Build check passed: ${required.length} routes and 6 legacy applications.`);
