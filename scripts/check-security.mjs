import fs from 'node:fs';

// Validates the security headers and permanent redirects shipped for every
// supported deployment target. Header values are compared exactly (not by
// substring) so the targets cannot silently drift apart.

const errors = [];
const read = (file) => {
  if (!fs.existsSync(file)) {
    errors.push(`missing ${file}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

// --- Canonical header values (public/_headers is the reference) ------------
const netlifyHeaders = read('public/_headers');
if (netlifyHeaders.split(/\r?\n/).some((line) => line.length > 2000)) {
  errors.push('public/_headers: Cloudflare Pages limits each header line to 2,000 characters');
}
function parseHeadersFile(text) {
  const rules = new Map();
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }
    const separator = line.indexOf(':');
    current?.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return rules;
}
const headerRules = parseHeadersFile(netlifyHeaders);
const canonical = headerRules.get('/*') ?? new Map();
const requiredHeaders = [
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'X-Frame-Options',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
  'Content-Security-Policy'
];
for (const header of requiredHeaders) {
  if (!canonical.get(header)) errors.push(`public/_headers: /* is missing ${header}`);
}
const csp = canonical.get('Content-Security-Policy') ?? '';
for (const directive of ["object-src 'none'", "base-uri 'self'", 'frame-ancestors']) {
  if (!csp.includes(directive)) errors.push(`public/_headers: CSP is missing ${directive}`);
}
for (const directive of ['script-src', 'connect-src']) {
  const value = csp.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${directive} `)) ?? '';
  if (!value.includes('https://plausible.io')) errors.push(`public/_headers: ${directive} must allow https://plausible.io`);
}
const cachePolicies = {
  '/_next/static/': 'public, max-age=31536000, immutable',
  '/legacy/assets/': 'public, max-age=0, must-revalidate'
};
for (const [prefix, value] of Object.entries(cachePolicies)) {
  if (headerRules.get(`${prefix}*`)?.get('Cache-Control') !== value) errors.push(`public/_headers: ${prefix}* must send Cache-Control: ${value}`);
}

function compare(target, name, actual) {
  const expected = canonical.get(name);
  if (actual === undefined) errors.push(`${target}: missing ${name}`);
  else if (actual !== expected) errors.push(`${target}: ${name} differs from public/_headers\n  expected: ${expected}\n  actual:   ${actual}`);
}

// --- Vercel ------------------------------------------------------------------
let vercel = { headers: [], redirects: [] };
try {
  vercel = JSON.parse(read('vercel.json') || '{}');
} catch (error) {
  errors.push(`vercel.json: invalid JSON (${error.message})`);
}
const vercelGlobal = new Map((vercel.headers ?? []).find((rule) => rule.source === '/(.*)')?.headers.map((item) => [item.key, item.value]) ?? []);
for (const header of requiredHeaders) compare('vercel.json', header, vercelGlobal.get(header));
for (const [prefix, value] of Object.entries(cachePolicies)) {
  const rule = (vercel.headers ?? []).find((item) => item.source === `${prefix}(.*)`);
  if (rule?.headers.find((item) => item.key === 'Cache-Control')?.value !== value) errors.push(`vercel.json: ${prefix}(.*) must send Cache-Control: ${value}`);
}

// --- Docker / nginx ------------------------------------------------------------
const nginx = read('deploy/nginx.conf');
const nginxSnippetPath = 'deploy/nginx-security-headers.conf';
const nginxSnippet = read(nginxSnippetPath);
const nginxHeaders = new Map([...nginxSnippet.matchAll(/^add_header\s+(\S+)\s+"([^"]*)"\s+always;/gm)].map((match) => [match[1], match[2]]));
for (const header of requiredHeaders) compare(nginxSnippetPath, header, nginxHeaders.get(header));
if (!nginxHeaders.get('Strict-Transport-Security')) errors.push(`${nginxSnippetPath}: missing Strict-Transport-Security`);
const snippetInclude = 'include /etc/nginx/snippets/kevinception-security-headers.conf;';
const serverBody = nginx.slice(nginx.indexOf('server {'));
if (!serverBody.split(/\n\s*location\b/)[0].includes(snippetInclude)) errors.push('deploy/nginx.conf: the server block must include the security-header snippet');
for (const block of serverBody.matchAll(/location\s+([^{]+)\{([^}]*)\}/g)) {
  if (block[2].includes('add_header') && !block[2].includes(snippetInclude)) {
    errors.push(`deploy/nginx.conf: location ${block[1].trim()} sets add_header and must re-include the security-header snippet (nginx does not inherit it)`);
  }
}
for (const [prefix, value] of Object.entries(cachePolicies)) {
  const block = serverBody.match(new RegExp(`location ${prefix.replaceAll('/', '\\/')}\\s*\\{([^}]*)\\}`));
  if (!block?.[1].includes(`add_header Cache-Control "${value}"`)) errors.push(`deploy/nginx.conf: location ${prefix} must send Cache-Control: ${value}`);
}
if (!/^\s*gzip on;/m.test(nginx)) errors.push('deploy/nginx.conf: gzip must be enabled');
const dockerfile = read('Dockerfile');
if (!dockerfile.includes('COPY deploy/nginx.conf')) errors.push('Dockerfile: runtime must install deploy/nginx.conf');
if (!dockerfile.includes(`COPY ${nginxSnippetPath} /etc/nginx/snippets/kevinception-security-headers.conf`)) errors.push('Dockerfile: runtime must install the nginx security-header snippet');

// --- AWS CloudFront ----------------------------------------------------------
let cloudfront = {};
try {
  cloudfront = JSON.parse(read('deploy/cloudfront-response-headers-policy.json') || '{}').ResponseHeadersPolicyConfig ?? {};
} catch (error) {
  errors.push(`deploy/cloudfront-response-headers-policy.json: invalid JSON (${error.message})`);
}
const security = cloudfront.SecurityHeadersConfig ?? {};
const custom = new Map((cloudfront.CustomHeadersConfig?.Items ?? []).map((item) => [item.Header, item.Value]));
const cloudfrontTarget = 'deploy/cloudfront-response-headers-policy.json';
if (!security.ContentTypeOptions?.Override) errors.push(`${cloudfrontTarget}: missing ContentTypeOptions`);
compare(cloudfrontTarget, 'Referrer-Policy', security.ReferrerPolicy?.ReferrerPolicy);
compare(cloudfrontTarget, 'X-Frame-Options', security.FrameOptions?.FrameOption);
if (!security.StrictTransportSecurity) errors.push(`${cloudfrontTarget}: missing StrictTransportSecurity`);
if (security.XSSProtection) errors.push(`${cloudfrontTarget}: drop the deprecated X-XSS-Protection header`);
for (const header of ['Permissions-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy', 'Content-Security-Policy']) {
  compare(cloudfrontTarget, header, custom.get(header));
}

// --- Netlify build ---------------------------------------------------------
const netlify = read('netlify.toml');
if (!netlify.includes('publish = "out"')) errors.push('netlify.toml: publish directory must be out');
if (fs.existsSync('public/legacy/_headers')) errors.push('public/legacy/_headers is never read by any host; delete it and keep one policy in public/_headers');

// --- Redirect parity ---------------------------------------------------------
const redirects = JSON.parse(read('deploy/redirects.json') || '{"redirects":[]}').redirects;
const cloudfrontFunction = read('deploy/cloudfront-viewer-request.js');
const cloudflareRedirects = read('public/_redirects');
const netlifyRules = [...netlify.matchAll(/\[\[redirects\]\]\s*\nfrom = "([^"]+)"\s*\nto = "([^"]+)"\s*\nstatus = (\d+)\s*\nforce = (true|false)/g)]
  .map((match) => ({ from: match[1], to: match[2], status: Number(match[3]), force: match[4] === 'true' }));
for (const { from, to } of redirects) {
  const bare = from.replace(/\/$/, '');
  if (!netlifyRules.some((rule) => rule.from === from && rule.to === to && rule.status === 301 && rule.force)) errors.push(`netlify.toml: missing forced 301 ${from} -> ${to}`);
  for (const source of [bare, from]) {
    if (!(vercel.redirects ?? []).some((rule) => rule.source === source && rule.destination === to && rule.statusCode === 301)) errors.push(`vercel.json: missing 301 ${source} -> ${to}`);
    if (!cloudflareRedirects.split(/\r?\n/).includes(`${source} ${to} 301`)) errors.push(`public/_redirects: missing ${source} ${to} 301`);
  }
  const pattern = `"~^${bare.replaceAll('.', '\\.')}(/|/index\\.html)?$" ${to};`;
  if (!nginx.includes(pattern)) errors.push(`deploy/nginx.conf: missing redirect map entry for ${from} -> ${to}`);
  if (!cloudfrontFunction.includes(`'${from}': '${to}'`)) errors.push(`deploy/cloudfront-viewer-request.js: missing redirect ${from} -> ${to}`);
}
if (!/if \(\$kevinception_redirect\) \{\s*return 301 \$kevinception_redirect;/.test(nginx)) errors.push('deploy/nginx.conf: the redirect map is not applied');

if (errors.length) {
  console.error(`Security configuration errors:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`Security configuration check passed: identical headers across public/_headers, vercel.json, nginx and CloudFront; ${redirects.length} permanent redirects present on every target.`);
