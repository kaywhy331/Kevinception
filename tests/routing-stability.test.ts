import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('timeline routing stability', () => {
  it('uses same-document history updates for canonical chapter navigation', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain("type HistoryMode = 'push' | 'replace'");
    expect(shell).toContain('window.history[method]');
    expect(shell).toContain("writeExperienceHistory(year, 'environment', historyMode)");
    expect(shell).not.toContain('router.push(experienceUrl(year)');
    expect(shell).not.toContain("router.push(experienceUrl(year, 'interface')");
  });

  it('invalidates stale transition completions and coalesces rapid wheel input', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain('navigationVersion.current !== version');
    expect(shell).toContain('const wheelCommitTimer');
    expect(shell).toContain('window.setTimeout(commitWheelNavigation, 90)');
    expect(shell).toContain('const target = getAdjacentYear(currentYear, direction)');
    expect(shell).not.toContain('const steps = Math.min');
  });

  it('serves /experience without an absolute nginx redirect that drops mapped ports', () => {
    const nginx = read('deploy/nginx.conf');
    expect(nginx).toContain('absolute_redirect off;');
    expect(nginx).toContain('location = /experience');
    expect(nginx).toContain('try_files /experience/index.html =404;');
  });

  it('returns a real 404 status from the production preview fallback', () => {
    const server = read('scripts/serve.mjs');
    expect(server).toContain('let status = 200');
    expect(server).toContain('status = 404');
    expect(server).toContain('fs.existsSync(file) ? status : 404');
  });

  it('serves the static social image with a PNG content type', () => {
    expect(read('scripts/serve.mjs')).toContain("url.pathname === '/opengraph-image' ? 'image/png'");
    expect(read('deploy/nginx.conf')).toContain('default_type image/png');
    expect(read('public/_headers')).toContain('/opengraph-image');
    expect(read('public/_headers')).toContain('Content-Type: image/png');
    expect(read('vercel.json')).toContain('"source": "/opengraph-image"');
  });

  it('finalizes Next static-export prefetch payloads for ordinary static hosts', () => {
    const pkg = read('package.json');
    const finalizer = read('scripts/finalize-static-export.mjs');
    const buildCheck = read('scripts/check-build.mjs');
    expect(pkg).toContain('next build && node scripts/finalize-static-export.mjs');
    expect(finalizer).toContain("entry.name.startsWith('__next.')");
    expect(finalizer).toContain("join('.')");
    expect(buildCheck).toContain('Missing RSC prefetch aliases');
  });

  it('accepts standards-compliant cached document revalidation in the hosted runtime review', () => {
    const runtimeReview = read('scripts/runtime-review-v8.mjs');
    expect(runtimeReview).toContain('status === 200 || status === 304');
    expect(runtimeReview).toContain('HTTP 200 or a valid browser-cache 304');
  });
});
