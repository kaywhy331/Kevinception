import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('out');
if (!fs.existsSync(root)) {
  console.error('out/ does not exist. Run npm run build first.');
  process.exit(1);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

function resolveLocal(value, file) {
  if (!value || value.startsWith('#') || value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('mailto:') || value.startsWith('tel:') || /^[a-z]+:/i.test(value) || value.startsWith('//')) return null;
  const clean = decodeURIComponent(value.split('#')[0].split('?')[0]);
  if (!clean) return null;
  let target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(file), clean);
  const candidates = [target];
  if (clean.endsWith('/')) candidates.push(path.join(target, 'index.html'));
  else {
    candidates.push(`${target}.html`);
    candidates.push(path.join(target, 'index.html'));
  }
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

const errors = [];
let checked = 0;
const attr = /(?:href|src)=(?:"([^"]+)"|'([^']+)')/g;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(attr)) {
    const value = match[1] ?? match[2];
    const target = resolveLocal(value, file);
    if (!target) continue;
    checked += 1;
    if (!fs.existsSync(target)) errors.push(`${path.relative(root, file)} -> ${value}`);
  }
}
if (errors.length) {
  console.error(`Broken local references (${errors.length}):\n${errors.slice(0, 80).join('\n')}`);
  process.exit(1);
}
console.log(`Link check passed: ${checked} local references across ${htmlFiles.length} HTML files.`);
