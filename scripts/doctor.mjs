import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const packagePath = path.join(cwd, 'package.json');
const requiredPaths = ['app', 'src', 'scripts', 'public', 'next.config.mjs'];

function fail(message) {
  console.error(`\nKevinception project check failed:\n${message}\n`);
  process.exit(1);
}

if (!fs.existsSync(packagePath)) {
  fail(`No package.json was found in:\n${cwd}\n\nOpen PowerShell in the folder that directly contains package.json.`);
}

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (pkg.name !== 'kevinception-v7-r3f') {
  fail(`This is not the Kevinception project root.\nDetected package: ${pkg.name ?? '(unnamed)'}\nFolder: ${cwd}`);
}

for (const item of requiredPaths) {
  if (!fs.existsSync(path.join(cwd, item))) {
    fail(`The project is incomplete or PowerShell is in the wrong folder. Missing: ${item}`);
  }
}

for (const script of ['dev', 'build', 'verify', 'preview']) {
  if (!pkg.scripts?.[script]) fail(`package.json is missing the required npm script: ${script}`);
}

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  fail(`Node ${process.versions.node} is too old. Install Node 20.9 or newer.`);
}

console.log('Kevinception project root: OK');
console.log(`Folder: ${cwd}`);
console.log(`Package: ${pkg.name}@${pkg.version}`);
console.log(`Node: ${process.versions.node}`);
console.log('Required npm scripts: present');
console.log('Core source folders: present');
console.log('\nNext commands:');
console.log('  npm ci');
console.log('  npm run verify');
console.log('  npm run dev');
