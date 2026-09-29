import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('timeline routing stability', () => {
  it('uses same-document history updates for query-only experience navigation', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain("type HistoryMode = 'push' | 'replace'");
    // Same-path (view/module) changes use the History API; chapter path changes go
    // through the router so Next applies each chapter's static metadata.
    expect(shell).toContain("window.history[mode === 'replace' ? 'replaceState' : 'pushState']");
    expect(shell).toContain("commitUrl(experienceHref(year, 'environment'), historyMode)");
    expect(shell).not.toContain('router.push(experienceUrl(year)');
    expect(shell).not.toContain("router.push(experienceUrl(year, 'interface')");
  });

  it('invalidates stale transition completions and coalesces rapid wheel input', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    expect(shell).toContain('navigationVersion.current !== version');
    // One wheel gesture (trackpad inertia included) moves exactly one chapter.
    expect(shell).toContain('gesture.consumed = true');
    expect(shell).toContain('gesture.cooldownUntil = now + WHEEL_COOLDOWN');
    expect(shell).toContain("move(gesture.distance > 0 ? 1 : -1)");
    expect(shell).not.toContain('const steps = Math.min');
  });

  it('serves /experience without an absolute nginx redirect that drops mapped ports', () => {
    const nginx = read('deploy/nginx.conf');
    expect(nginx).toContain('absolute_redirect off;');
    expect(nginx).toContain('location = /experience');
    expect(nginx).toContain('try_files /experience/index.html =404;');
  });
});
