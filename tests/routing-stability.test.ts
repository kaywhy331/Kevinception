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
});
