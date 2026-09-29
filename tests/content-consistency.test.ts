import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * One sourced figure per public claim. The historical One Stop Deals / StealStreet
 * channel count is 15+ (commit 8f9aed3). Any other "N+ channels / marketplaces /
 * connections" figure in shipped source is a contradiction and fails here.
 */
const HISTORICAL_CHANNEL_COUNT = '15+';
const CHANNEL_CLAIM = /(\d+)\+\s*(?:sales |commerce )?(?:channels?|marketplaces?|connections?)\b|(?:Marketplaces|Channels)\s*·\s*(\d+)\+/gi;

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

function channelClaims(files: string[]) {
  return files.flatMap((file) => [...fs.readFileSync(file, 'utf8').matchAll(CHANNEL_CLAIM)].map((match) => ({
    file: path.relative(process.cwd(), file),
    claim: match[0],
    count: `${match[1] ?? match[2]}+`
  })));
}

describe('content consistency', () => {
  it('states one channel count everywhere in the React source', () => {
    const claims = channelClaims([...sourceFiles(path.join(process.cwd(), 'src')), ...sourceFiles(path.join(process.cwd(), 'app'))]);
    expect(claims.length).toBeGreaterThan(0);
    expect(claims.filter((claim) => claim.count !== HISTORICAL_CHANNEL_COUNT)).toEqual([]);
  });

  it('keeps the synchronized legacy payloads on the same figure', () => {
    for (const year of ['1990', '2020', '2030', '2040']) {
      const html = fs.readFileSync(path.join(process.cwd(), `public/legacy/experience/${year}/index.html`), 'utf8');
      const payload = html.match(/id="era-world-data">([\s\S]*?)<\/script>/)?.[1] ?? '';
      const conflicting = [...payload.matchAll(CHANNEL_CLAIM)].filter((match) => `${match[1] ?? match[2]}+` !== HISTORICAL_CHANNEL_COUNT);
      expect(conflicting.map((match) => match[0]), year).toEqual([]);
    }
  });
});
