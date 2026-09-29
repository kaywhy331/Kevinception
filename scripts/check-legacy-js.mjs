// Syntax-checks every JavaScript file that TypeScript and the bundler never see:
// the legacy era applications under public/legacy, the Node scripts, and the
// CloudFront viewer-request function.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const roots = ['public/legacy', 'scripts', 'deploy'];
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(m?js)$/.test(entry.name)) files.push(full);
  }
}
for (const root of roots) if (fs.existsSync(root)) walk(root);

const failures = [];
for (const file of files.sort()) {
  const source = fs.readFileSync(file, 'utf8');
  const isModule = file.endsWith('.mjs') || /^\s*(import|export)\s/m.test(source);
  const result = spawnSync(process.execPath, [`--input-type=${isModule ? 'module' : 'commonjs'}`, '--check'], { input: source, encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${file}\n${result.stderr.trim()}`);
}

if (failures.length) {
  console.error(`JavaScript syntax errors:\n\n${failures.join('\n\n')}`);
  process.exit(1);
}
console.log(`Legacy/script syntax check passed for ${files.length} JavaScript files.`);
