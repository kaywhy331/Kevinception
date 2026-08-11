# Kevinception V7 — Verification Report

**Version:** 0.8.2
**Verified:** August 11, 2026
**Runtime:** Node 22.22.0 (Node 20.9+ supported)

## Automated verification

`npm run verify` covers:

```text
TypeScript validation
Vitest unit and interaction tests
Canonical content/configuration validation
Next.js production static export
Route, legacy-app, metadata, and hosting-file checks
Gzip JavaScript bundle budgets
Local-reference link validation
Security validation across every supported deployment policy
```

The production dependency audit is a separate explicit gate:

```bash
npm audit --omit=dev --audit-level=moderate
```

## Results

```text
TypeScript:                         passed
Vitest files:                       13 passed
Vitest assertions:                  54 passed
Next.js production compilation:     passed (Next 16.3.0)
Generated Next pages:               20 static/SSG pages
Required public routes:             13 present
Embedded legacy era apps:           6 present
HTML files checked:                 46
Local references checked:           977
Broken local references:            0
JavaScript bundle:                  664.1 KiB gzip total
Largest JavaScript chunk:           227.4 KiB gzip
Deployment header policies:         5 passed
Production dependency audit:        0 vulnerabilities
Patch whitespace:                   passed
```

The export contains the canonical routes, six experience routes, connected R3F application, complete embedded application layer, metadata, sitemap, robots rules, web manifest, social card, and hosting-header policy.

## Output profile

```text
Exported files:                     196
Exported directory size:            5,174,758 bytes (4.94 MiB)
Next JavaScript + CSS raw:           2,280,456 bytes (2.17 MiB)
Next JavaScript + CSS gzip:          692,461 bytes (676.2 KiB)
Embedded functional apps:           1,024,136 bytes (0.98 MiB)
```

The large R3F/Three.js path remains confined to `/experience/`; the homepage portal uses the browser’s lightweight Canvas 2D API.

## Browser runtime boundary

A targeted homepage pass ran in Brave 144.1.86.148 at 1440×900, 1024×768, 768×1024, 390×844, 320×568, and 844×390. Every viewport reported zero horizontal and vertical overflow, exactly one navigation link, and fully visible landing copy, portal HUD, era selector, and entry action. Temporary screenshots were inspected but not added to the repository.

Browser review for the complete experience remains available through `npm run test:runtime` and the browser-smoke workflow. The automated checks verify semantic controls, mobile utility availability, the experience skip target, keyboard-equivalent scene hotspots, reduced-motion branches, URL-backed archive filtering, accessible contact validation, artifact completion, and text content for all six eras. Manual screen-reader, contrast, real-device WebGL, and final art-direction review remain pre-launch checks.
