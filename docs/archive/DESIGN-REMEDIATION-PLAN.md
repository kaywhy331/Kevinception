# Kevinception — Design Gap Remediation Plan

- **Date:** 2026-08-10
- **Source:** Design review of https://kevinception-staging.netlify.app/ (all six routes) + code audit of `app/` and `src/`
- **Planner:** Trix (Claude Code)
- **Executor:** Codex CLI, model `gpt-5.6-sol`, headless `codex exec`
- **Scope:** Working-tree changes only. **No commits, no pushes, no deploys.**

---

## Global constraints (apply to every workstream)

1. **No fabricated facts.** Never invent metrics, dates, employers, client names, testimonials, statistics, or outcomes. Copy edits may restructure, deduplicate, or rephrase existing content only. If a workstream seems to need a new factual claim, omit the claim and note it in the final report instead.
2. **No new npm dependencies.** Everything here is achievable with Next.js built-ins, React, and CSS.
3. **No route changes.** `/experience/`, `/portfolio/`, `/work/`, `/resume/`, `/about/`, `/contact/` all keep their URLs. Only labels change.
4. **Preserve the visual language.** Dark glass aesthetic, era-accent theming (`--era-accent`), border radii, existing spacing scale. This plan refines; it does not redesign.
5. **Tests are updated, not deleted.** When a label change breaks an assertion, update the assertion to the new intended value. Never remove a test or weaken its intent to make it pass.
6. **Stay inside the expected-files list** (bottom of this doc). If a fix genuinely requires touching another file, it may be touched, but the final report must call it out with a one-line justification.
7. **Accessibility is regression-tested by hand:** skip link, `:focus-visible` outlines, `prefers-reduced-motion` behavior, and print styles must all still work after changes.

## Definition of done (global gate)

- `npm run verify` passes (typecheck + vitest + build + check:build + check:links + check:security).
- Every per-workstream completion criterion below is met.
- A summary report is written to `docs/DESIGN-REMEDIATION-REPORT.md`: per workstream — status, files touched, and any deviations or omitted claims.

---

## WS1 — Load the brand typeface (Inter)

**Problem.** `app/globals.css:16` declares `font-family: Inter, ...` but Inter is never loaded (no `next/font`, no `@font-face`, no font link). All visitors see system fallback. CSS also uses weights `850`/`950`; static Inter has no 950.

**Tasks.**
1. In `app/layout.tsx`, load Inter with `next/font/google` (variable font, full weight axis, `display: 'swap'`, subset `latin`) and expose it via the generated class or CSS variable on `<html>`/`<body>`.
2. Point the `font-family` stack in `globals.css` at the loaded font variable, keeping the existing system-font fallback chain.
3. Normalize font weights: any weight above 900 becomes 900. Weights within 100–900 (e.g. 850) may remain since the variable font covers the full axis.

**Completion criteria.**
- [ ] `app/layout.tsx` uses `next/font/google` Inter; build output includes the self-hosted font files.
- [ ] `grep -rn "font-weight: 9[1-9]" app src` returns nothing (no weight > 900 anywhere).
- [ ] Rendered HTML of `/` includes the next/font class or `--font-*` variable on the root element.
- [ ] `npm run build` passes.

## WS2 — Mobile navigation menu

**Problem.** `globals.css:244` (`max-width: 680px` block) hides every header nav link except the Contact CTA; the 900px block hides links 4+. No hamburger exists on standard pages — phone users cannot reach Portfolio/Work/Resume/About from the header.

**Tasks.**
1. In `src/components/SiteChrome.tsx`, add an accessible disclosure menu to `SiteHeader`: a menu button visible below 900px with `aria-expanded` + `aria-controls`, toggling a panel listing **all six** nav links. Requires converting `SiteHeader` (or a small child) to a client component — keep the server/client split minimal.
2. Escape closes the menu and returns focus to the button; clicking a link closes it. No focus trap required.
3. Replace the `display: none` link-hiding rules at both breakpoints with styles that show the menu button instead. Desktop (>900px) keeps the current inline nav exactly as is.
4. Style the panel with the existing glass vocabulary (`backdrop-filter`, `--panel`, `--line`), not new visual language.

**Completion criteria.**
- [ ] At 360px and 768px widths, all six routes are reachable from the header (menu button → panel).
- [ ] `globals.css` no longer contains `nav a:not(.site-header__cta) { display: none; }` nor the `nth-child(n+4)` header rule.
- [ ] Menu is keyboard-operable: Tab to button, Enter/Space opens, Escape closes and restores focus; `aria-expanded` reflects state.
- [ ] Desktop header is visually unchanged.
- [ ] `npm run verify` passes (update `tests/device-native-navigation.test.ts` and friends per constraint 5 if they assert header structure).

## WS3 — Wire the social-share image

**Problem.** `public/og-card.png` exists but `app/layout.tsx` metadata declares no image; `twitter: summary_large_image` renders bare.

**Tasks.**
1. Read the PNG's actual pixel dimensions from the file (do not assume 1200×630 — check, e.g. with a tiny Node one-liner against the IHDR header).
2. Add `openGraph.images` (url, width, height, alt) and `twitter.images` to the metadata object. `metadataBase` already makes URLs absolute against `https://kevinception.com`.

**Completion criteria.**
- [ ] Built HTML for `/` contains `og:image` (absolute URL ending `/og-card.png`) with correct `og:image:width`/`height`, and `twitter:image`.
- [ ] Alt text present and descriptive (no factual claims beyond what the site already states).

## WS4 — Give the contact page a real destination

**Problem.** The brief-builder generates text with nowhere to send it, and a developer note leaks into public copy: "Add the preferred address in `src/content/data.ts` or connect this form to a secure endpoint before launch."

**Tasks.**
1. Add `contactEmail: "kevinception331@gmail.com"` to the profile object in `src/content/data.ts`. Kevin corrected and confirmed this public contact address on 2026-08-10.
2. In the contact form component, add a primary action "Email this brief" — a `mailto:` link composing subject (selected intent) and body (the generated brief) via URL encoding. Keep "Copy brief" as secondary. The mailto must be a real anchor that works without JS for the default brief.
3. Remove the leaked developer sentence from all rendered copy; if the reminder is worth keeping, keep it as a code comment.
4. Show the email address in visible text on the contact page so it works even where mailto handlers don't.

**Completion criteria.**
- [ ] Contact page renders a working `mailto:kevinception331@gmail.com?...` link with encoded subject/body, plus the visible address.
- [ ] `grep -rn "src/content/data.ts" app src --include="*.tsx"` finds no user-facing copy referencing it (comments fine); the sentence is absent from built HTML.
- [ ] "Copy brief" still works.

## WS5 — One name per destination (nav labeling)

**Problem.** The `/experience/` route is called "Experience" (header), "Timeline" (footer), "Chapters" (in-experience nav), and "the timeline" (CTAs). "Portfolio" and "Work" overlap as labels for near-identical content.

**Tasks.**
1. Standardize the `/experience/` label as **Timeline** in the site header, footer, and any prose links on standard pages. In-experience UI may keep "Chapters" for its chapter list (contextual, different meaning).
2. Rename the header/footer label for `/work/` from "Work" to **Case studies** (route unchanged). Update prose references ("Selected work" links on the homepage may stay — they describe content, not the nav label).
3. Update page `<title>` metadata and any test assertions to the new labels.

**Completion criteria.**
- [ ] Header nav reads: Timeline · Portfolio · Case studies · Resume · About · Contact (Contact stays the CTA pill).
- [ ] Footer nav uses the same labels for the same routes.
- [ ] No user-visible "Experience" label pointing at `/experience/` remains on standard pages (`grep -rn ">Experience<" app src`).
- [ ] `npm run verify` passes with updated tests.

## WS6 — Copy deduplication and voice consistency

**Problem.** Portfolio closing-CTA `h2` repeats the hero subhead verbatim; instructional copy flips between first person ("I turn ambitious ideas…") and third person ("Give Kevin enough context…").

**Tasks.**
1. Replace the portfolio closing-CTA heading with a short variant that introduces **no new factual claims** — no numbers, no superlatives, no client references. It should hand off to the contact CTA (e.g., a short imperative in the site's existing tone).
2. Normalize instructional/self-referential copy to first person on `/contact/` and `/resume/` (e.g. "Give Kevin enough context…" → "Give me enough context…"). Brand names ("Kevinception", "Kevin Online", chapter personas) are exempt — they are product names, not voice.
3. Replace the footer tech note "Built as an R3F-first experience with semantic portfolio routes." with a visitor-facing line that is factually safe, e.g. noting every chapter also has a plain, no-WebGL page (true — the text-mode fallback and direct routes exist).

**Completion criteria.**
- [ ] The exact hero-subhead sentence appears at most once in built portfolio HTML.
- [ ] No third-person self-reference in instructional copy on contact/resume ("Kevin" as subject of an instruction to the visitor).
- [ ] Footer note no longer contains "R3F" or "semantic portfolio routes".
- [ ] No new factual claims introduced anywhere (self-audit in report).

## WS7 — Remove internal scaffolding from public surfaces

**Problem.** The resume renders a "Content boundary" box instructing that employers/dates/credentials "should be added only after Kevin confirms them" — an internal editorial guard shipped to visitors.

**Tasks.**
1. Remove the evidence-note box from the rendered resume page. Preserve the guard's intent as a comment adjacent to the resume data in `src/content/data.ts` so future editors still see it.
2. Sweep all routes' rendered copy for other editor-facing instructions (anything telling someone to edit a file, confirm data, or complete a step "before launch") and remove/relocate the same way.

**Completion criteria.**
- [ ] "Content boundary" box and its text are absent from built resume HTML; the guard survives as a code comment.
- [ ] Grep of built output finds no "before launch", "should be added", or file-path strings in visitor-facing copy.
- [ ] Resume print stylesheet still produces a clean document (`@media print` intact).

## WS8 — Interaction & polish fixes

**Problem.** Assorted small defects found in the CSS audit.

**Tasks.**
1. `globals.css:273` — mobile `.environment-panel p` is clipped with `max-height: 3.8em; overflow: hidden`, cutting text mid-sentence. Replace with `-webkit-line-clamp` (3 lines) + `display: -webkit-box` so truncation shows an ellipsis.
2. Replace positional hiding (`globals.css:236` and `:264` — `nth-child` rules hiding toolbar/year-selector children) with explicit utility classes (e.g. `.hide-below-900`, `.hide-below-680`) applied to the intended elements in `src/experience/ExperienceOverlay.tsx`. Behavior must be identical to today at each breakpoint.
3. Contrast: `.artifact-drawer section small` color `#737c8c` on `#0b0d14` is below 4.5:1. Lighten until the computed contrast ratio is ≥ 4.5:1 (state the chosen hex and its ratio in the report).

**Completion criteria.**
- [ ] No `nth-child`-based `display: none` rules remain for the experience toolbar or year selector; same elements hidden at same breakpoints as before (verify by listing them in the report).
- [ ] Truncated environment-panel text ends with an ellipsis on mobile widths.
- [ ] New small-text color documented with a contrast ratio ≥ 4.5:1.
- [ ] `npm run verify` passes.

---

## Explicitly OUT of scope (do not attempt)

- **Era-scene screenshots / any imagery.** Requires rendering the WebGL scenes and art direction — separate follow-up.
- **Real metrics, dates, employers, outcomes.** Requires facts only Kevin can confirm (global constraint 1).
- **Merging or redirecting `/portfolio/` and `/work/`.** IA decision for Kevin; this plan only fixes labels.
- **Card-rhythm / layout redesign of the grids.** Design-direction work, not remediation.
- **Committing, pushing, or deploying anything.**

## Expected files changed

- `app/layout.tsx` (WS1, WS3)
- `app/globals.css` (WS1, WS2, WS8)
- `src/components/SiteChrome.tsx` (WS2, WS5) — plus one new small client component for the menu if cleaner (e.g. `src/components/MobileNav.tsx`)
- `src/components/ContactForm.tsx`, `app/contact/page.tsx` (WS4, WS6)
- `app/resume/page.tsx` (WS6, WS7)
- `app/portfolio/page.tsx` (WS6)
- `app/page.tsx` (WS5 labels, if referenced)
- `src/content/data.ts`, `src/content/narrative.ts` (WS4, WS5, WS6, WS7 — wherever the copy actually lives)
- `src/experience/ExperienceOverlay.tsx` (WS8)
- `tests/*.ts` (assertion updates per constraint 5)
- `docs/DESIGN-REMEDIATION-REPORT.md` (new — final report)
