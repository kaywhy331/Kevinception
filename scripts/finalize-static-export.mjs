import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('out');
if (!fs.existsSync(root)) {
  console.error('out/ does not exist. Run next build before finalizing the static export.');
  process.exit(1);
}

const payloadDirectories = [];
function collectPayloadDirectories(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(directory, entry.name);
    if (entry.name.startsWith('__next.')) payloadDirectories.push(full);
    else collectPayloadDirectories(full);
  }
}

function filesWithin(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesWithin(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

collectPayloadDirectories(root);
let aliases = 0;
for (const directory of payloadDirectories) {
  const parent = path.dirname(directory);
  const prefix = path.basename(directory);
  for (const source of filesWithin(directory)) {
    const flattened = [prefix, ...path.relative(directory, source).split(path.sep)].join('.');
    fs.copyFileSync(source, path.join(parent, flattened));
    aliases += 1;
  }
}

console.log(`Static export finalized: ${aliases} RSC prefetch aliases.`);
