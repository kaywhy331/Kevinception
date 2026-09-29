import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

// Enforces two kinds of budget on the static export:
//   1. per-route first load: the gzip size of every <script src> and
//      stylesheet an exported HTML page requests before any interaction;
//   2. whole-build totals: all JavaScript chunks and the largest single chunk.
// Budgets carry roughly 10% headroom over the measured 0.9.0 build, so a
// regression of that size fails instead of passing silently.

const KiB = 1024;
const budgets = {
  totalJs: 770 * KiB,
  largestChunk: 250 * KiB,
  // First-load JS / CSS per route group (gzip).
  routes: {
    experience: { js: 280 * KiB, css: 33 * KiB },
    home: { js: 210 * KiB, css: 33 * KiB },
    text: { js: 200 * KiB, css: 33 * KiB }
  }
};

function groupFor(route) {
  if (route === '/') return 'home';
  if (route.startsWith('/experience/')) return 'experience';
  return 'text';
}

const outDir = 'out';
const staticRoot = path.join(outDir, '_next', 'static');
if (!fs.existsSync(staticRoot)) {
  console.error('Static output is missing. Run npm run build first.');
  process.exit(1);
}

const gzipCache = new Map();
function gzipSize(file) {
  if (!gzipCache.has(file)) gzipCache.set(file, fs.existsSync(file) ? gzipSync(fs.readFileSync(file)).length : 0);
  return gzipCache.get(file);
}

const chunks = [];
function walk(directory, visit) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (entry.isFile()) visit(full);
  }
}
walk(staticRoot, (file) => { if (file.endsWith('.js')) chunks.push({ file, gzip: gzipSize(file) }); });

const errors = [];
const totalGzip = chunks.reduce((sum, item) => sum + item.gzip, 0);
const largest = chunks.toSorted((a, b) => b.gzip - a.gzip)[0];
if (!chunks.length) errors.push('No JavaScript chunks were found.');
if (totalGzip > budgets.totalJs) errors.push(`Total JavaScript ${(totalGzip / KiB).toFixed(1)} KiB gzip exceeds ${budgets.totalJs / KiB} KiB.`);
if (largest && largest.gzip > budgets.largestChunk) errors.push(`Largest chunk ${largest.file} is ${(largest.gzip / KiB).toFixed(1)} KiB gzip (budget ${budgets.largestChunk / KiB} KiB).`);

const pages = [];
walk(outDir, (file) => {
  if (!file.endsWith('index.html') || file.includes(`${path.sep}legacy${path.sep}`) || file.includes(`${path.sep}_next${path.sep}`)) return;
  const route = `/${path.relative(outDir, path.dirname(file)).split(path.sep).join('/')}/`.replace('//', '/');
  const html = fs.readFileSync(file, 'utf8');
  const scripts = new Set([...html.matchAll(/<script[^>]*\ssrc="(\/_next\/[^"?]+)[^"]*"/g)].map((match) => match[1]));
  const styles = new Set([...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="(\/_next\/[^"?]+)[^"]*"/g), ...html.matchAll(/<link[^>]*href="(\/_next\/[^"?]+\.css)[^"]*"[^>]*rel="stylesheet"/g)].map((match) => match[1]));
  const js = [...scripts].reduce((sum, src) => sum + gzipSize(path.join(outDir, src)), 0);
  const css = [...styles].reduce((sum, href) => sum + gzipSize(path.join(outDir, href)), 0);
  const group = groupFor(route);
  pages.push({ route, group, js, css });
  const budget = budgets.routes[group];
  if (js > budget.js) errors.push(`${route}: first-load JavaScript ${(js / KiB).toFixed(1)} KiB gzip exceeds the ${group} budget of ${budget.js / KiB} KiB.`);
  if (css > budget.css) errors.push(`${route}: first-load CSS ${(css / KiB).toFixed(1)} KiB gzip exceeds the ${group} budget of ${budget.css / KiB} KiB.`);
});
if (!pages.length) errors.push('No exported HTML routes were found.');

const table = pages.toSorted((a, b) => a.route.localeCompare(b.route))
  .map((page) => `  ${page.route.padEnd(32)} ${page.group.padEnd(10)} JS ${(page.js / KiB).toFixed(1).padStart(6)} KiB  CSS ${(page.css / KiB).toFixed(1).padStart(5)} KiB`)
  .join('\n');

if (errors.length) {
  console.error(`Bundle budget exceeded:\n${errors.join('\n')}\n\nPer-route first load (gzip):\n${table}`);
  process.exit(1);
}
console.log(`Bundle check passed: ${chunks.length} chunks, ${(totalGzip / KiB).toFixed(1)} KiB gzip total, ${(largest.gzip / KiB).toFixed(1)} KiB largest chunk.\nPer-route first load (gzip):\n${table}`);
