# Kevinception V7 — Verification Report

**Version:** 0.8.0  
**Verified:** July 20, 2026  
**Node:** 20+ compatible

## Automated verification

The following command completed successfully:

```bash
npm run verify
```

It runs:

```text
TypeScript validation
Vitest unit tests
Next.js production build
Static route and legacy-app checks
Local-reference link validation
Security-configuration validation
```

## Results

```text
TypeScript:                     passed
Vitest files:                   4 passed
Vitest assertions:              12 passed
Next.js production compilation: passed
Generated Next routes:          20 static/SSG pages
Required public routes:         13 present
Embedded legacy era apps:       6 present
HTML files checked:             46
Local references checked:       897
Broken local references:        0
Security configuration:         passed
Production dependency audit:    0 known vulnerabilities
```

The exported `out/` directory contains canonical routes, six experience routes, the connected-environment R3F application, the complete embedded application layer, metadata, sitemap, robots rules, web manifest, static assets, and hosting-header configuration.

## Output profile

```text
Exported files:                 240
Exported directory size:        approximately 4.3 MB
Next JavaScript + CSS raw:       approximately 2.02 MB
Next JavaScript + CSS gzip:      approximately 0.61 MB
Embedded functional apps:       approximately 0.99 MB
```

The large R3F/Three.js code path is confined to the immersive experience. Canonical portfolio routes remain statically rendered and usable without entering the 3D journey.

## Static-server smoke verification

The generated export was served locally and returned HTTP 200 for the threshold and experience routes. The Kevin Online route contained the expected Next.js application assets and the embedded legacy HTML correctly referenced `/legacy/assets/` rather than stale root asset paths.

The parent-navigation bridge marker was present in the embedded Kevin Online page.

## Browser runtime verification boundary

A cross-platform Puppeteer runtime script is included as:

```bash
npm run test:runtime
```

Run it while `npm run preview` is active. It locates Chrome, Chromium, or Edge through common Windows, macOS, and Linux paths, or through `CHROME_PATH`.

The hosted build environment used to create this package blocks Chromium navigation through an administrator policy. Consequently, the final browser screenshot/E2E pass could not be executed in that environment. This is an environment restriction, not a reported passing browser result.

The package therefore reports only the checks that actually completed: compilation, type validation, unit behavior, static generation, link resolution, static serving, security configuration, and dependency audit.

## Recommended local runtime pass

```powershell
npm install
npm run verify
npm run preview
```

In a second terminal:

```powershell
$env:BASE_URL = "http://127.0.0.1:4321"
npm run test:runtime
```

When another port is selected automatically, use the printed URL for `BASE_URL`.

The source-level environment tests additionally verify the shared corridor, physical 2030 lab, physical 2040 sanctuary, open future-wing connection, and compact era docks.

Manual checks should include:

- Threshold to timeline
- Direct entry into every year
- Physical device hotspots
- Interface focus and Step Back
- Previous/next year transitions
- Embedded KevinVision game
- Kevin Online Sign On and Xanga
- KevinBook interactions
- KevTok feed
- Nexus mission and approval gate
- Echo thought interpreter
- Reduced motion
- Text mode
- Mobile viewport
- WebGL-disabled fallback
