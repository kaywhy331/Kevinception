import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

// Read-only CSS first-load measurement for a static export. It reproduces the CSS half of
// scripts/check-bundle.mjs (stylesheets linked from each exported HTML page, gzip bytes)
// and adds per-file sizes, so a budget overage can be attributed before CSS is changed.
// Usage: node scripts/css-measure.mjs [outDir] [--json]

const outDir = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'out';
const asJson = process.argv.includes('--json');
const limit = 33 * 1024;

function walk(directory, visit) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (entry.isFile()) visit(full);
  }
}

const sizes = new Map();
function measure(href) {
  if (!sizes.has(href)) {
    const file = path.join(outDir, href);
    const raw = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0);
    sizes.set(href, { href, raw: raw.length, gzip: gzipSync(raw).length });
  }
  return sizes.get(href);
}

const pages = [];
walk(outDir, (file) => {
  if (!file.endsWith('index.html') || file.includes(`${path.sep}legacy${path.sep}`) || file.includes(`${path.sep}_next${path.sep}`)) return;
  const route = `/${path.relative(outDir, path.dirname(file)).split(path.sep).join('/')}/`.replace('//', '/');
  const html = fs.readFileSync(file, 'utf8');
  const styles = new Set([...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="(\/_next\/[^"?]+)[^"]*"/g), ...html.matchAll(/<link[^>]*href="(\/_next\/[^"?]+\.css)[^"]*"[^>]*rel="stylesheet"/g)].map((match) => match[1]));
  pages.push({ route, files: [...styles].sort(), gzip: [...styles].reduce((sum, href) => sum + measure(href).gzip, 0) });
});

pages.sort((a, b) => a.route.localeCompare(b.route));
const gzips = pages.map((page) => page.gzip);
const summary = {
  outDir,
  limit,
  routes: pages.length,
  min: Math.min(...gzips),
  max: Math.max(...gzips),
  overLimit: pages.filter((page) => page.gzip > limit).length,
  files: [...sizes.values()],
  pages
};

if (asJson) console.log(JSON.stringify(summary, null, 2));
else {
  console.log(`CSS first load for ${outDir}: ${summary.routes} routes, gzip min ${summary.min} / max ${summary.max} bytes (limit ${limit}), ${summary.overLimit} over.`);
  for (const file of summary.files) console.log(`  ${file.href}  raw ${file.raw}  gzip ${file.gzip}`);
}
