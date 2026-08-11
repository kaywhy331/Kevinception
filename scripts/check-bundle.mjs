import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.join('out', '_next', 'static');
if (!fs.existsSync(root)) {
  console.error('Static JavaScript output is missing. Run npm run build first.');
  process.exit(1);
}

const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      const raw = fs.readFileSync(full);
      files.push({ file: full, raw: raw.length, gzip: gzipSync(raw).length });
    }
  }
}
walk(root);

const totalGzip = files.reduce((sum, item) => sum + item.gzip, 0);
const largest = files.toSorted((a, b) => b.gzip - a.gzip)[0];
const maxTotalGzip = 900 * 1024;
const maxChunkGzip = 300 * 1024;

if (!files.length || totalGzip > maxTotalGzip || largest.gzip > maxChunkGzip) {
  console.error('JavaScript bundle budget exceeded.');
  console.error(`Chunks: ${files.length}; gzip total: ${totalGzip}; largest gzip chunk: ${largest?.gzip ?? 0} (${largest?.file ?? 'none'})`);
  console.error(`Budgets: ${maxTotalGzip} total gzip; ${maxChunkGzip} per gzip chunk.`);
  process.exit(1);
}
console.log(`Bundle check passed: ${files.length} chunks, ${(totalGzip / 1024).toFixed(1)} KiB gzip total, ${(largest.gzip / 1024).toFixed(1)} KiB largest gzip chunk.`);
