// Runs every browser runtime probe against a running preview server.
//
// Probes are discovered from package.json: every script named `test:runtime`
// or `test:runtime:<name>` (except this runner) is executed, so a new probe
// cannot be added without CI running it. All probes run even if one fails;
// the runner exits non-zero when any probe failed.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const probes = Object.keys(pkg.scripts)
  .filter((name) => /^test:runtime(:|$)/.test(name) && name !== 'test:runtime:all');

if (!probes.length) {
  console.error('No test:runtime* scripts were found in package.json.');
  process.exit(1);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const results = [];
for (const probe of probes) {
  console.log(`\n=== ${probe} ===`);
  const started = Date.now();
  const result = spawnSync(npm, ['run', '--silent', probe], { stdio: 'inherit', shell: process.platform === 'win32' });
  results.push({ probe, status: result.status ?? 1, seconds: ((Date.now() - started) / 1000).toFixed(1) });
}

console.log('\nRuntime probe summary');
for (const { probe, status, seconds } of results) {
  console.log(`  ${status === 0 ? 'PASS' : 'FAIL'}  ${probe}  (${seconds}s)`);
}
const failed = results.filter((item) => item.status !== 0);
if (failed.length) {
  console.error(`\n${failed.length} of ${results.length} runtime probes failed.`);
  process.exit(1);
}
console.log(`\nAll ${results.length} runtime probes passed. Reports and screenshots: artifacts/`);
