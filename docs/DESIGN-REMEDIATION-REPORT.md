# Kevinception — Design Remediation Report

- **Date:** 2026-08-10
- **Scope:** `docs/DESIGN-REMEDIATION-PLAN.md`, WS1–WS8
- **Overall status:** Done
- **Verification gate:** `npm run verify` passed with 10 test files / 40 tests, a successful production build, 13 checked routes, 992 checked local references across 46 HTML files, and a passing security check.

## Global constraints and verification

- No npm dependency or lockfile changes were made.
- No routes were added, removed, redirected, or renamed. Only the prescribed visitor-facing labels and page titles changed.
- No commits, pushes, or deployments were made. All remediation changes remain uncommitted.
- No era imagery, screenshots, grid redesigns, portfolio/work merging, or unverified professional facts were added.
- Copy self-audit found no fabricated metrics, dates, employers, clients, outcomes, testimonials, or credentials. The only new factual contact datum is the email address supplied by the remediation plan. The replacement footer line is the factually safe line approved by the plan.
- `git diff --check` passed.
- Built HTML was checked for the prescribed labels, titles, social metadata, mailto destination, visible email, portfolio copy count, and absence of internal editorial text.
- Accessibility regression inspection confirmed the skip link and target, the global `:focus-visible` outline, the intact `@media print` block, and the intact `prefers-reduced-motion` block. DOM interaction tests exercise the mobile menu’s open/close state, link activation, Escape handling, and focus restoration.
- No supported Chromium executable was available in the environment. Responsive checks therefore used the production breakpoint CSS, built DOM, and jsdom interaction tests rather than browser screenshots. This also avoided the explicitly out-of-scope era-scene screenshot work.

Pre-existing working-tree entries observed before implementation—`next-env.d.ts`, `.netlify/`, and `docs/DESIGN-REMEDIATION-PLAN.md`—were preserved and are not remediation output.

## WS1 — Load the brand typeface (Inter)

**Status:** Done

**Files touched:**

- `app/layout.tsx`
- `app/globals.css`

**Completion verification:**

- `Inter` is loaded through `next/font/google` with the Latin subset, `display: 'swap'`, and the `--font-inter` variable. The generated variable class is applied to `<html>`.
- The root font stack starts with `var(--font-inter)` and retains the existing system fallbacks.
- All four `950` declarations were normalized to `900`; `rg "font-weight:\\s*9[1-9][0-9]" app src` returns no matches.
- Built `/` HTML contains the generated Inter variable class, and `out/_next/static/media` contains self-hosted `.woff2` files.
- The production build and the full verification gate passed.

**Deviations:** None.

## WS2 — Mobile navigation menu

**Status:** Done

**Files touched:**

- `src/components/SiteChrome.tsx`
- `src/components/MobileNav.tsx` (new small client component explicitly allowed by the plan)
- `app/globals.css`
- `tests/device-native-navigation.test.ts`

**Completion verification:**

- The mobile disclosure contains Timeline, Portfolio, Case studies, Resume, About, and Contact. The `max-width: 900px` rule makes it available at both 360px and 768px while hiding the desktop nav as a unit.
- Above 900px, the mobile wrapper remains `display: none`; the desktop header layout and styling are unchanged apart from the intentional labels.
- The native button exposes `aria-expanded` and `aria-controls`. Enter/Space inherit native button behavior; Escape closes the panel and restores focus; activating a link closes it.
- The interaction test renders the component and verifies open state, all six destinations, link-close behavior, Escape-close behavior, and focus restoration.
- The panel uses the existing `--panel`, `--line`, backdrop blur, radius, and shadow vocabulary.
- Both old link-hiding selectors are absent from `globals.css` and are guarded by test assertions.

**Deviations:** No implementation deviation. Browser screenshots were unavailable as noted in the global verification section.

## WS3 — Wire the social-share image

**Status:** Done

**Files touched:**

- `app/layout.tsx`

**Completion verification:**

- A direct PNG IHDR read reported `public/og-card.png` as 1200×630.
- Built `/` HTML contains absolute `https://kevinception.com/og-card.png` values for `og:image` and `twitter:image`, plus `og:image:width="1200"`, `og:image:height="630"`, and the descriptive alt text “Kevinception portfolio preview.”
- The production build and full verification gate passed.

**Deviations:** None.

## WS4 — Give the contact page a real destination

**Status:** Done

**Files touched:**

- `src/content/data.ts`
- `src/components/ContactForm.tsx`
- `app/contact/page.tsx`
- `tests/content.test.ts`
- `tests/contact-form.test.ts` (new)

**Important launch note:** The contact email is **kevinception331@gmail.com**, corrected and confirmed by Kevin on 2026-08-10.

**Completion verification:**

- `profile.contactEmail` contains the supplied address and the server page passes it into the client form without bundling the full content object into the component.
- Built contact HTML contains a real default anchor beginning `mailto:kevinception331@gmail.com?subject=Consulting%20or%20advisory&body=...`; both subject and generated brief body are URL-encoded.
- The email is also visible as linked text.
- “Email this brief” is the primary action and “Copy brief” remains a secondary button.
- The contact interaction test changes intent and context, confirms that the mailto updates, and verifies that Copy brief writes the generated text to the clipboard.
- The leaked file-path/before-launch sentence is absent from source UI copy and built HTML.

**Deviations:** None.

## WS5 — One name per destination

**Status:** Done

**Files touched:**

- `src/components/SiteChrome.tsx`
- `app/portfolio/page.tsx`
- `src/experience/ExperienceOverlay.tsx`
- `app/experience/page.tsx`
- `app/work/page.tsx`
- `tests/device-native-navigation.test.ts`

**Completion verification:**

- Header order is Timeline · Portfolio · Case studies · Resume · About · Contact; built HTML contains all six labels in that order.
- Footer route labels use Timeline and Case studies consistently.
- Standard-page prose links now say “Enter the timeline” / “Explore the timeline”; the experience help route list says “Case studies.” Contextual “Selected work” copy remains as permitted.
- Built titles are `Timeline | Kevinception` and `Case studies | Kevinception`, with matching source assertions.
- `rg -F '>Experience<' app src` now finds only the resume section heading. It is not a link to `/experience/`; no “Experience” destination label remains.
- All route URLs remain unchanged.

**Deviations:** `app/experience/page.tsx` and `app/work/page.tsx` were unavoidable expected-files exceptions because WS5 explicitly requires updating those routes’ page-title metadata, and the metadata is defined in those files.

## WS6 — Copy deduplication and voice consistency

**Status:** Done

**Files touched:**

- `app/portfolio/page.tsx`
- `src/components/ContactForm.tsx`
- `src/components/SiteChrome.tsx`

**Completion verification:**

- The portfolio closing heading is now “Let’s make the next step clear.” It is an imperative and adds no factual claim.
- Parsing the built portfolio DOM with scripts/styles removed finds the exact hero subhead once. Next’s static transport file also serializes that same React node in a hydration script; it is not a second rendered occurrence.
- Contact instructions now use “Give me…” and “Open my GitHub”; the removed resume editorial instruction leaves no third-person visitor instruction there.
- The footer now reads “Every chapter also has a plain, no-WebGL page.” Built HTML contains neither “R3F” nor “semantic portfolio routes.”
- Copy self-audit found no new unsupported factual claims.

**Deviations:** None.

## WS7 — Remove internal scaffolding from public surfaces

**Status:** Done

**Files touched:**

- `app/resume/page.tsx`
- `src/content/data.ts`

**Completion verification:**

- The rendered evidence-note aside and “Content boundary” copy were removed. The resume eyebrow was simplified from the editorial “public evidence-safe edition” label to “Resume.”
- The evidence guard survives as a source comment immediately above `experienceItems`.
- A case-insensitive grep of built HTML finds no “before launch,” “should be added,” “Content boundary,” or `src/content/data.ts` string.
- The `@media print` block remains intact and still removes site chrome/button rows while setting print-safe foreground/background colors.

**Deviations:** None.

## WS8 — Interaction and polish fixes

**Status:** Done

**Files touched:**

- `app/globals.css`
- `src/experience/ExperienceOverlay.tsx`
- `app/environment-pass.css`
- `tests/device-native-navigation.test.ts`

**Completion verification:**

- Mobile environment copy now uses `display: -webkit-box`, `-webkit-box-orient: vertical`, `-webkit-line-clamp: 3`, `overflow: hidden`, and `text-overflow: ellipsis`; the previous fixed `max-height` clipping is gone.
- Named responsive behavior now maps as follows:
  - Utility Menu: `.hide-below-680`, hidden at 680px and below.
  - Portfolio toolbar link: `.hide-below-640`, hidden at 640px and below.
  - Chapters remains visible at those breakpoints.
  - Existing explicit year-selector rules still hide chapter-name `<b>` text at 680px and experience-name `<em>` text at 640px; their behavior was not changed.
  - The former 900px positional selectors targeted toolbar children that no longer exist after the earlier utility-menu consolidation, so removing them changes no live behavior.
- No `nth-child`-based `display: none` rule remains for `.experience-toolbar` or `.year-selector` in either relevant CSS layer. Tests assert this.
- Artifact drawer small text is now **`#7f8998`** on **`#0b0d14`**. The WCAG relative-luminance calculation is **5.485:1** (reported as **5.49:1**), exceeding 4.5:1.
- Targeted tests and the full verification gate passed.

**Deviations:** `app/environment-pass.css` was an unavoidable expected-files exception. It contained two additional `.experience-toolbar ... :nth-child(...) { display: none; }` rules; leaving them would have failed WS8’s no-positional-toolbar-hiding criterion and could have preserved conflicting responsive behavior.

## Final deviations summary

- Expected-files exceptions: `app/experience/page.tsx`, `app/work/page.tsx`, and `app/environment-pass.css`, for the WS5/WS8 reasons documented above.
- Verification-method limitation: no supported Chromium executable was present, so responsive/accessibility verification used built-output inspection, CSS breakpoint inspection, and DOM interaction tests instead of screenshots.
- No workstream was partial or skipped.
