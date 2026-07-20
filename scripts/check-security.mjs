import fs from 'node:fs';
const required = ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy'];
for (const file of ['public/_headers', 'vercel.json']) {
  const value = fs.readFileSync(file, 'utf8');
  const missing = required.filter((header) => !value.includes(header));
  if (missing.length) {
    console.error(`${file} is missing: ${missing.join(', ')}`);
    process.exit(1);
  }
}
console.log('Security configuration check passed.');
