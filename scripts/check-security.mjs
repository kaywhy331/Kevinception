import fs from 'node:fs';

const configurations = [
  {
    file: 'public/_headers',
    platform: 'Netlify and Cloudflare Pages',
    required: ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']
  },
  {
    file: 'public/legacy/_headers',
    platform: 'embedded static applications',
    required: ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'],
    analytics: false
  },
  {
    file: 'vercel.json',
    platform: 'Vercel',
    required: ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'],
    json: true
  },
  {
    file: 'deploy/nginx.conf',
    platform: 'Docker/nginx',
    required: ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']
  },
  {
    file: 'deploy/cloudfront-response-headers-policy.json',
    platform: 'AWS CloudFront',
    required: ['Content-Security-Policy', 'ContentTypeOptions', 'ReferrerPolicy', 'Permissions-Policy'],
    json: true
  }
];

const errors = [];
for (const configuration of configurations) {
  if (!fs.existsSync(configuration.file)) {
    errors.push(`${configuration.platform}: missing ${configuration.file}`);
    continue;
  }
  const value = fs.readFileSync(configuration.file, 'utf8');
  if (configuration.file === 'public/_headers' && value.split(/\r?\n/).some((line) => line.length > 2000)) {
    errors.push('public/_headers: Cloudflare Pages limits each header line to 2,000 characters');
  }
  if (configuration.json) {
    try { JSON.parse(value); } catch (error) { errors.push(`${configuration.file}: invalid JSON (${error.message})`); }
  }
  const missing = configuration.required.filter((header) => !value.includes(header));
  if (missing.length) errors.push(`${configuration.file}: missing ${missing.join(', ')}`);
  for (const directive of ["object-src 'none'", "base-uri 'self'", 'frame-ancestors']) {
    if (!value.includes(directive)) errors.push(`${configuration.file}: CSP is missing ${directive}`);
  }
  if (configuration.analytics !== false && (value.match(/https:\/\/plausible\.io/g) ?? []).length < 2) {
    errors.push(`${configuration.file}: Plausible must be allowed by both script-src and connect-src`);
  }
}

const netlify = fs.readFileSync('netlify.toml', 'utf8');
if (!netlify.includes('publish = "out"')) errors.push('netlify.toml: publish directory must be out');
const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
if (!dockerfile.includes('COPY deploy/nginx.conf')) errors.push('Dockerfile: runtime must install deploy/nginx.conf');

if (errors.length) {
  console.error(`Security configuration errors:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`Security configuration check passed for ${configurations.length} header policies and all supported deployment targets.`);
