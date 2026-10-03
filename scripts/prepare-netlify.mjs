import fs from 'node:fs';

// Headers are global within a Netlify deployment, including its canonical URL.
// Both sites publish in the production context, so scope indexing by site ID.
// Always start from canonical headers to remove staging policy on reused exports.
const stagingSiteId = '2302e233-299a-4a8d-9880-2fad22bbacf9';
const sourceHeaders = fs.readFileSync('public/_headers', 'utf8');
const headers = process.env.SITE_ID === stagingSiteId
  ? `${sourceHeaders.trimEnd()}\n\n# Staging only: search indexing, not access control.\n/*\n  X-Robots-Tag: noindex\n`
  : sourceHeaders;

// Netlify reads _redirects before netlify.toml. An unforced portfolio rule
// shadows the forced TOML rule while out/portfolio/index.html exists.
// Keep Cloudflare's numeric status syntax in public/_redirects; omit only
// these two rules from the Netlify artifact so the existing forced rule wins.
// Run after the static build, including before manual Netlify uploads.
const file = 'out/_redirects';
const text = fs.readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);
const portfolio = lines.filter((line) => /^\/portfolio\/?(?:\s|$)/.test(line));
if (portfolio.length && (portfolio.length !== 2 ||
  !portfolio.includes('/portfolio /about/ 301') ||
  !portfolio.includes('/portfolio/ /about/ 301'))) {
  throw new Error('Unexpected portfolio redirects; refusing to change the Netlify export');
}
const prepared = lines.filter((line) => !portfolio.includes(line)).join(text.includes('\r\n') ? '\r\n' : '\n');
fs.writeFileSync(file, prepared);
fs.writeFileSync('out/_headers', headers);
console.log(`Netlify export prepared: ${portfolio.length} portfolio rules delegated to netlify.toml`);
