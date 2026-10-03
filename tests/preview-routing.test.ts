// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

describe('static-export preview HTTP contract', () => {
  let root: string;
  let server: ChildProcess;
  let base: string;
  const document = '<article class="case-study"><h1>Kevinception</h1><p>Six chapters</p></article>';
  const notFound = '<section class="lost-era"><h1>Missing chapter</h1></section>';
  const flight = '0:{"project":"kevinception","chapters":6}\n';

  beforeAll(async () => {
    fs.mkdirSync('artifacts/routing-repair', { recursive: true });
    root = fs.mkdtempSync(path.resolve('artifacts/routing-repair/fixture-'));
    fs.mkdirSync(path.join(root, 'work/kevinception'), { recursive: true });
    fs.writeFileSync(path.join(root, 'index.html'), '<h1>Home</h1>');
    fs.writeFileSync(path.join(root, 'work/kevinception/index.html'), document);
    fs.writeFileSync(path.join(root, 'work/kevinception/index.txt'), flight);
    fs.writeFileSync(path.join(root, 'work/kevinception/__next._full.txt'), flight);
    fs.writeFileSync(path.join(root, 'flat.html'), '<h1>Flat export</h1>');
    fs.writeFileSync(path.join(root, '404.html'), notFound);
    const probe = net.createServer();
    await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
    const port = (probe.address() as net.AddressInfo).port;
    await new Promise<void>(resolve => probe.close(() => resolve()));
    base = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, ['scripts/serve.mjs', root, String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise<void>((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`Preview startup timeout: ${output}`)), 5000);
      server.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited ${code}`)); });
      server.stdout!.on('data', chunk => {
        output += chunk;
        if (output.includes('using')) { clearTimeout(timer); reject(new Error(output)); }
        if (output.includes(base)) { clearTimeout(timer); resolve(); }
      });
    });
  });

  afterAll(async () => {
    if (server && server.exitCode === null) {
      const stopped = once(server, 'exit');
      server.kill('SIGTERM');
      await stopped;
    }
    if (root) fs.rmSync(root, { recursive: true, force: true });
  });

  it.each(['/work/kevinception', '/work/kevinception/', '/work/kevinception?view=text', '/work/kevinception/?view=text'])('serves the exact exported document at %s', async route => {
    const response = await fetch(base + route);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await response.text()).toBe(document);
  });

  it.each(['/work/kevinception/index.txt?_rsc=probe', '/work/kevinception/__next._full.txt?_rsc=probe'])('serves exported client-navigation data with a compatible MIME type at %s', async route => {
    const response = await fetch(base + route, { headers: { RSC: '1' } });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toBe(flight);
  });

  it('retains root and flat HTML export serving', async () => {
    const home = await fetch(base + '/');
    expect(home.status).toBe(200);
    expect(await home.text()).toBe('<h1>Home</h1>');
    const flat = await fetch(base + '/flat');
    expect(flat.status).toBe(200);
    expect(await flat.text()).toBe('<h1>Flat export</h1>');
  });

  it.each(['/work/unknown', '/work/unknown/', '/missing.js', '/work/kevinception/missing.txt?_rsc=probe'])('returns a truthful 404 and missing-page body for %s', async route => {
    const response = await fetch(base + route);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe(notFound);
  });

  it('returns 404 even when the export has no custom missing page', async () => {
    fs.unlinkSync(path.join(root, '404.html'));
    const response = await fetch(base + '/unknown');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');
    const home = await fetch(base + '/');
    expect(home.status).toBe(200);
  });
});
