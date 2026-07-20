import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const name = process.argv[2] ?? 'kevinception-v7-r3f.zip';
const target = path.resolve('..', name);
if (fs.existsSync(target)) fs.rmSync(target);
const excluded = ['node_modules', '.next', 'out'];
if (process.platform === 'win32') {
  const items = fs.readdirSync('.').filter((x) => !excluded.includes(x)).map((x) => `'${x.replaceAll("'", "''")}'`).join(',');
  const script = `Compress-Archive -Path ${items} -DestinationPath '${target.replaceAll("'", "''")}' -Force`;
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
const args = ['-qr', target, '.', ...excluded.flatMap((x) => ['-x', `${x}/*`])];
const result = spawnSync('zip', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
