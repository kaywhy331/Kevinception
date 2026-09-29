// Smoke-tests a running static server (e.g. the Docker/nginx image) for the
// behaviour that config-file checks cannot prove: security headers on HTML
// *and* static assets, compression, cache policy, and the permanent redirects.
//
//   BASE_URL=http://127.0.0.1:8080 node scripts/smoke-headers.mjs
import fs from 'node:fs';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:8080';
const errors = [];
const security = ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-frame-options', 'cross-origin-opener-policy', 'cross-origin-resource-policy'];

async function get(route, init = {}) {
  const response = await fetch(`${base}${route}`, { redirect: 'manual', headers: { 'accept-encoding': 'gzip' }, ...init });
  await response.arrayBuffer();
  return response;
}

const home = await fetch(`${base}/`).then((response) => response.text());
const script = home.match(/<script[^>]*\ssrc="(\/_next\/static\/[^"]+\.js)"/)?.[1];
if (!script) errors.push('Could not find a /_next/static/*.js script on the home page.');

const targets = [
  { route: '/', cache: null },
  { route: '/experience/', cache: null },
  ...(script ? [{ route: script, cache: 'immutable', gzip: true }] : []),
  { route: '/legacy/assets/client/global.js', cache: 'must-revalidate', gzip: true }
];
for (const { route, cache, gzip } of targets) {
  const response = await get(route);
  if (response.status !== 200) {
    errors.push(`${route}: expected 200, received ${response.status}`);
    continue;
  }
  const missing = security.filter((header) => !response.headers.get(header));
  if (missing.length) errors.push(`${route}: missing ${missing.join(', ')}`);
  if (cache && !(response.headers.get('cache-control') ?? '').includes(cache)) errors.push(`${route}: Cache-Control should include ${cache}, received ${response.headers.get('cache-control')}`);
  if (gzip && response.headers.get('content-encoding') !== 'gzip') errors.push(`${route}: expected gzip content-encoding, received ${response.headers.get('content-encoding') ?? 'none'}`);
}

const { redirects } = JSON.parse(fs.readFileSync('deploy/redirects.json', 'utf8'));
for (const { from, to } of redirects) {
  for (const source of [from, from.replace(/\/$/, '')]) {
    const response = await get(source);
    const location = response.headers.get('location');
    if (response.status !== 301 || !location || new URL(location, base).pathname !== to) {
      errors.push(`${source}: expected 301 -> ${to}, received ${response.status} ${location ?? ''}`);
    }
  }
}

if (errors.length) {
  console.error(`Header/redirect smoke failed against ${base}:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`Header/redirect smoke passed against ${base}: ${targets.length} responses, ${redirects.length * 2} redirects.`);
