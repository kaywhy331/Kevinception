// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const script = path.resolve('scripts/prepare-netlify.mjs');
const canonicalHeaders = fs.readFileSync('public/_headers', 'utf8');
const redirects = fs.readFileSync('public/_redirects', 'utf8');
const stagingSiteId = '2302e233-299a-4a8d-9880-2fad22bbacf9';
const productionSiteId = '6294cc99-9f68-41dd-b5e1-3965b665e0af';

function withExport(check: (root: string, prepare: (siteId?: string) => string) => void) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kc-indexing-'));
  try {
    fs.mkdirSync(path.join(root, 'public'));
    fs.mkdirSync(path.join(root, 'out'));
    fs.writeFileSync(path.join(root, 'public/_headers'), canonicalHeaders);
    fs.writeFileSync(path.join(root, 'out/_headers'), canonicalHeaders);
    fs.writeFileSync(path.join(root, 'out/_redirects'), redirects);
    check(root, (siteId) => {
      const env: NodeJS.ProcessEnv = { ...process.env, CONTEXT: 'production' };
      delete env.SITE_ID;
      if (siteId !== undefined) env.SITE_ID = siteId;
      const result = spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' });
      expect(result.status, result.stderr).toBe(0);
      return fs.readFileSync(path.join(root, 'out/_headers'), 'utf8');
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

describe('Netlify staging indexing isolation', () => {
  it('adds only a noindex header for the staging site, even in production context', () => {
    withExport((root, prepare) => {
      const result = prepare(stagingSiteId);
      expect(result).toContain('/*\n  X-Robots-Tag: noindex\n');
      expect(result.match(/X-Robots-Tag:/gi)).toHaveLength(1);
      expect(result.slice(0, result.indexOf('# Staging only:')).trimEnd()).toBe(canonicalHeaders.trimEnd());
      expect(fs.readFileSync(path.join(root, 'public/_headers'), 'utf8')).toBe(canonicalHeaders);
      expect(prepare(stagingSiteId)).toBe(result);
    });
  });

  it.each([productionSiteId, undefined, '', 'unrelated-site', `${stagingSiteId}-other`])(
    'restores canonical headers after staging when target is %s', (siteId) => {
      withExport((_root, prepare) => {
        expect(prepare(stagingSiteId)).toContain('X-Robots-Tag: noindex');
        expect(prepare(siteId)).toBe(canonicalHeaders);
      });
    },
  );
});
