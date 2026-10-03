// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const script = path.resolve('scripts/prepare-netlify.mjs');
const source = fs.readFileSync('public/_redirects', 'utf8');
const run = (input: string) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kc-netlify-'));
  try {
    fs.mkdirSync(path.join(root, 'out'));
    fs.mkdirSync(path.join(root, 'public'));
    fs.copyFileSync('public/_headers', path.join(root, 'public/_headers'));
    const file = path.join(root, 'out/_redirects');
    fs.writeFileSync(file, input);
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
    return { status: result.status, output: fs.readFileSync(file, 'utf8') };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

describe('Netlify portfolio redirect precedence', () => {
  it('delegates only the two portfolio rules to forced TOML, preserving all other lines', () => {
    const result = run(source);
    expect(result.status).toBe(0);
    expect(result.output).toBe(source.replace('/portfolio /about/ 301\n', '').replace('/portfolio/ /about/ 301\n', ''));
    const rules = result.output.split('\n').filter((line) => line.startsWith('/'));
    expect(rules).toHaveLength(52);
    expect(rules.every((line) => line.endsWith(' 301'))).toBe(true);
    expect(fs.readFileSync('netlify.toml', 'utf8')).toMatch(/from = "\/portfolio\/"\s+to = "\/about\/"\s+status = 301\s+force = true/);
    expect(fs.readFileSync('netlify.toml', 'utf8')).toContain('command = "npm run build && node scripts/prepare-netlify.mjs"');
    // Cloudflare continues receiving both original numeric-status rules.
    expect(fs.readFileSync('public/_redirects', 'utf8')).toBe(source);
  });

  it('is idempotent for manual uploads and preserves CRLF files', () => {
    const first = run(source.replaceAll('\n', '\r\n'));
    expect(first.status).toBe(0);
    const second = run(first.output);
    expect(second.status).toBe(0);
    expect(second.output).toBe(first.output);
    expect(first.output).toContain('\r\n');
  });

  it('fails without modifying an unexpected portfolio rule or an incomplete pair', () => {
    for (const input of [source.replace('/portfolio /about/ 301', '/portfolio /work/ 301'), source.replace('/portfolio/ /about/ 301\n', '')]) {
      const result = run(input);
      expect(result.status).not.toBe(0);
      expect(result.output).toBe(input);
    }
  });
});
