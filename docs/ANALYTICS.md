# Kevinception analytics

- **Provider:** Plausible-compatible, cookie-free analytics
- **Default domain:** `kevinception.com`
- **Privacy:** no advertising IDs or cross-site identifiers; `Do Not Track: 1` disables loading and dispatch

## Funnel

| Step | Event | Properties |
|---|---|---|
| Landing | automatic pageview | URL |
| Enter the timeline | `timeline_enter` | source, optional year |
| Open an era interface | `chapter_enter` | year, chapter |
| Discover an artifact | `artifact_find` | artifact, year |
| Open a case study | `case_study_open` | project, source when inferred |
| Read a case study | `case_study_read` | project |
| Open contact | `contact_open` | source |
| View contact | `contact_view` | — |
| Email a generated brief | `brief_email` | intent |

Pageviews, including client-side App Router navigations, come only from the Plausible script's own history-API tracking; the app sends no manual pageviews, so nothing is counted twice.

## Activation

The site defaults to `https://plausible.io/js/script.js` and `kevinception.com`. Add that domain to the Plausible account before production cutover. The script loads only when the page's hostname is the configured domain (or its `www.` form), so Netlify deploy previews, branch deploys, Vercel previews, and localhost never report into production. A staging site that should be measured builds with its own `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` matching its host; a compatible proxy or self-hosted endpoint can override `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL`. If the script origin changes, add it to `script-src` and `connect-src` in `public/_headers`, `vercel.json`, `deploy/nginx.conf`, and `deploy/cloudfront-response-headers-policy.json`; `npm run check:security` enforces the four production policies.

This integration sets no analytics cookies, so it does not itself introduce a cookie-consent-banner trigger. The launch owner should still confirm notice and consent requirements for each target jurisdiction if the provider or collected fields change.
