# Kevinception V7 — Deployment

## Build output

```bash
npm ci
npm run verify
```

The deployable directory is:

```text
out/
```

The application uses static export. No Node server is required for the current deterministic release.

## Local preview

```bash
npm run preview
```

If port 4321 is occupied, the preview script selects the next available port and prints the URL.

## AWS S3 + CloudFront

1. Upload the contents of `out/` to a private S3 origin.
2. Configure CloudFront with Origin Access Control.
3. Set the default root object to `index.html`.
4. Configure 403 and 404 responses to `/404.html` as appropriate for the selected routing policy.
5. Create and attach a response-headers policy based on:

```text
deploy/cloudfront-response-headers-policy.json
```

6. Cache `/_next/static/*` and `/legacy/assets/*` for one year with immutable caching.
7. Keep HTML on short or revalidated cache behavior.
8. Invalidate changed HTML after deployment.

## Netlify

`netlify.toml` is included:

```toml
[build]
command = "npm run build"
publish = "out"
```

`public/_headers` is copied into the export and supplies security and caching headers.

## Vercel

`vercel.json` contains security and immutable-asset caching headers. The project can be deployed from the repository root with the standard Next.js build.

## Cloudflare Pages

```text
Build command: npm run build
Output directory: out
Node version: 20.9 or later
```

Cloudflare Pages reads the exported `_headers` file.

`npm run check:security` validates the root `_headers` policy used by Cloudflare Pages/Netlify, Vercel JSON, Docker/nginx, the CloudFront response-header policy, and the embedded-app policy. The Plausible script and event endpoint are allowed consistently by production CSPs.

The contact experience is deliberately static: it validates and prepares a `mailto:` brief in the browser and never claims to persist or transmit form data from this deployment.

## Future AI deployment

The current build is entirely static. A future AI guide should be added as a separately secured server-side endpoint. Never place provider API keys or private portfolio records in the browser bundle.
