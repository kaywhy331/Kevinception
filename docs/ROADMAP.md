# Kevinception — Road to Award-Winning

- **Date:** 2026-08-10
- **Author:** Trix (Claude Code), from full design review + code audit + V7 docs (`KNOWN_LIMITATIONS_V7.md`, `IMPLEMENTATION_STATUS_V7.md`)
- **Goal:** Take Kevinception from "complete vertical slice" to an award-caliber personal brand/portfolio — Awwwards SOTD / CSSDA / FWA submission quality.
- **Baseline:** Phase 0 (design remediation, 2026-08-10) is done: fonts load, mobile nav exists, OG wired, contact works, labels unified, scaffolding removed. See `DESIGN-REMEDIATION-REPORT.md`.

## How awards judge — and where Kevinception stands

Awwwards weighs **Design 40% · Usability 30% · Creativity 20% · Content 10%**. Honest current position:

| Axis | Today | Verdict |
|---|---|---|
| Creativity | Six-era conceit, cross-era artifact mechanic, era-authentic embedded apps | **Already the strength.** Needs payoff, not reinvention. |
| Design | Competent generic dark-glass shell; procedural 3D geometry; zero imagery; synthesized beeps | **The main gap.** Art direction must become distinctive and era-specific. |
| Usability | Solid a11y baseline, text fallback, keyboard map; unproven mobile 3D feel; loading is a spinner | Good bones, needs polish + proof. |
| Content | Evidence-safe placeholders; no dates, metrics, imagery, testimonials, or human presence | **Weakest axis.** Cheapest to fix; Kevin-gated. |

**Thesis: the concept already deserves an award; the execution layers (content truth → art direction → immersive fidelity → polish → performance) are what stand between here and one.**

Rules carried from Phase 0: no fabricated facts ever (metrics, testimonials, dates — Std 79 hard floor); tests updated never deleted; `npm run verify` green at every phase exit.

Owner key: **[K]** needs Kevin personally · **[A]** agent-executable · **[K→A]** Kevin supplies, agent integrates. Effort: S (<½ day) · M (days) · L (week+).

---

## Phase 1 — Content truth & personal brand core

*Why first: cheapest, highest Content-axis impact, and everything downstream (case-study visuals, launch story) builds on real facts. Almost entirely Kevin-gated — start collecting now while agents work later phases.*

**1.1 Evidence pass on all case studies** [K→A] (M)
Real outcomes for TokenPak, Agentic Work Fleet, Kevin Online, Kevinception, MCP expansion: 1–3 confirmed quantified results each (users, releases shipped, time saved, scale — whatever is true), engagement dates, linked artifacts (repos, docs, demos).
✅ *Done when:* every case study's "Outcomes and evidence" section contains at least one verifiable fact with a number or a link; no section restates intentions as outcomes.

**1.2 Resume becomes a real resume** [K→A] (S)
Confirmed employers/engagements, titles, date ranges, education/credentials Kevin will publicly stand behind. Downloadable PDF artifact.
✅ *Done when:* every experience entry has a date range; PDF downloads; print output verified.

**1.3 Human presence** [K→A] (M)
Portrait photography or a stylized avatar consistent with the six-era concept (a portrait per era would be exceptional), location, a personal paragraph that sounds like a person, social links beyond GitHub (LinkedIn at minimum).
✅ *Done when:* About page has an identity block with image; footer/contact expose ≥2 professional profiles.

**1.4 IA consolidation: Portfolio vs Case studies** [A] (M)
**Status 2026-08-10: ✅ Implemented.** `/portfolio/` is now the first-person Profile/approach surface; `/work/` is the sole full case-study archive; navigation labels are Profile vs. Case studies; home uses a distinct compact evidence index.
Decide and execute: merge `/portfolio/` and `/work/` into one canonical work surface (recommended: `/portfolio/` = narrative landing, `/work/` = archive index, cards appear once each with distinct roles) or fully differentiate their content. Add redirects if a route is retired.
✅ *Done when:* no card set appears twice with identical copy; nav has no two labels competing for the same mental slot.

**1.5 Social proof** [K] (M, ongoing)
2–3 short attributed quotes from real collaborators/clients (with permission), or verifiable public signals (stars, downloads, talks). **Never invented, never paraphrased beyond what the person approved.**
✅ *Done when:* at least two attributed, Kevin-verified quotes or equivalent public proof points are live — or this item is consciously deferred, not faked.

**1.6 Brand voice one-pager** [A] (S)
**Status 2026-08-10: ✅ Implemented.** See `VOICE.md`; standard-page owner copy is first person, the naming glossary distinguishes Profile/Case studies/Timeline, and first-use jargon was replaced with plain language.
Voice/tone doc: first person, plain-spoken, curious; naming glossary (Kevinception the site vs. the project vs. personas). Audit all copy against it.
✅ *Done when:* `docs/VOICE.md` exists; copy audit finds no voice violations; jargon ("context logistics", "decision surface") either defined in-line or replaced on first use per page.

---

## Phase 2 — Art direction & design language

*Why second: this is the Design 40%. Direction must exist before Phase 3 executes it in 3D. The shell today is competent but anonymous — award juries see a hundred dark-glass sites a week.*

**2.1 Typography with a point of view** [A] (M)
**Status 2026-08-10: ✅ Implemented.** Syne now handles display moments over Inter; Next self-hosts the emitted WOFF2 files; the measured Syne output is 60,464 bytes. See `ART_DIRECTION.md`.
Pair Inter (functional) with a distinctive display face for h1/h2 and era-neutral brand moments. License and self-host. Consider per-era display treatments (see 2.2).
✅ *Done when:* display face live on all hero/section headings; CLS unchanged; font budget ≤120KB added.

**2.2 Six era design languages** [A] (L) — **the signature design move**
**Status 2026-08-14: ◐ Native future wing implemented; full six-era pass remains.** Morning, Together now uses warm domestic light and object-led daily life with Wren; Morning, After returns to the same room as an amber/vermilion cyberpunk holographic encounter, with distinct responsive and motion treatments. The four earlier eras and standard-page echoes still need the complete documented six-up art-direction pass.
Each era gets a micro design system beyond the current accent color: texture, type treatment, UI chrome, motion character. 1990 phosphor glow + scanlines; 2000 beige plastic + skeuomorphic bevels; 2010 flat social blue + operational density; 2020 vertical neon + kinetic type; 2030 warm ambient intelligence + permissioned objects; 2040 black glass + rain + holographic refraction. Applied to the experience overlay (timeline panel, environment panel, transitions) and echoed subtly on standard-page era references.
✅ *Done when:* a screenshot of any era's UI is identifiable without labels in a six-up lineup; documented in `docs/ERA_DESIGN_LANGUAGES.md`.

**2.3 Imagery pipeline — kill the zero-image problem** [A] (M)
Capture stills and short loops of each 3D era scene and each V6 app (the site can illustrate itself); produce real diagrams for TokenPak/AWF architecture; per-page OG images from the same pipeline.
✅ *Done when:* no image-free page remains; each case study has ≥3 visuals; every route has a distinct OG image; total added weight budgeted (lazy-loaded, AVIF/WebP).

**2.4 Editorial layout rhythm on standard pages** [A] (M)
**Status 2026-08-10: ✅ Implemented in code/static output.** Profile, archive, home evidence, and project artifacts now use distinct statements, ledgers, numbered rows, ribbons, and asymmetric indexing instead of consecutive repeated card grids. Final browser art review remains part of Phase 5 QA.
Break the identical-card monotony: alternate full-bleed statements, numbered sequences, pull quotes, asymmetric grids, era-accented markers. Custom icon set replacing text-only tags where it helps scanning.
✅ *Done when:* no two consecutive sections on any page use the same card-grid pattern; portfolio page scroll feels authored, not templated.

**2.5 Signature moments** [A] (M)
**Status 2026-08-10: ✅ Implemented.** Home has a live Canvas 2D six-era portal without loading Three.js; the 404 is a lost era; main and embedded loaders use an authored power-on sequence.
Homepage hero: replace the CSS orbit with a live mini-canvas or captured scene loop that proves the experience before the click. Custom 404 in-concept (a "lost era"). Boot/loading sequence styled as a power-on, not a spinner.
✅ *Done when:* hero shows real experience content; 404 is designed; loading state is a moment (and respects reduced-motion).

---

## Phase 3 — Immersive experience elevation

*Why third: executes Phase 2's direction in the 3D core. This is where SOTD is won or lost. Items map directly to `KNOWN_LIMITATIONS_V7.md`.*

**3.1 Scene fidelity decision + pass** [K decision, A execute] (L)
Two valid paths: (a) artist-authored GLB + baked textures per era, or (b) **deliberate stylized art direction executed consistently on procedural geometry** (cheaper, still award-viable if intentional — think refined low-poly dioramas with excellent lighting). Either way: lighting pass, material pass, per-era post-processing grades (current global Bloom/Noise/Vignette becomes per-era).
✅ *Done when:* chosen direction documented; all six scenes pass a side-by-side review against 2.2's era languages; perf budget (5.1) holds.

**3.2 Screens-within-screens portals** [A] (L) — **the "inception" payoff**
Render-to-texture portals so era screens show the neighboring era's live world (currently "future work" per limitations doc). Even 2–3 portals at high quality tier lands the site's own thesis: *every screen contains another world.*
✅ *Done when:* ≥3 eras have live portals at high tier with graceful tier fallback; frame budget held.

**3.3 Sound design** [K→A] (M)
**Status 2026-08-14: ◐ Future-wing code pass implemented; authored asset pass remains.** Sound remains muted by default with a persisted, accessible toggle. Native 2030/2040 now have generated layered atmospheres plus presence, consent, refusal, notice, agency, conjecture, and handoff cues that start only in the active interface and clean up on exit. Original/licensed audio and complete 1990–2020 coverage remain Kevin-gated.
Replace oscillator beeps with original/licensed era-authentic audio: ambient bed per era (CRT hum, dial-up handshake, notification-era chatter, neon room tone…), interface SFX. Opt-in, muted by default, persistent preference, visible toggle.
✅ *Done when:* all six eras have ambient + SFX; no autoplay; toggle accessible; assets licensed or original.

**3.4 Artifact hunt surfacing** [A] (M)
**Status 2026-08-11: ✅ Implemented.** Five unique recoveries now have persistent progress, discovery guidance, semantic keyboard/text controls, and a connected-pattern completion payoff. The 2010 Project Blueprint has a real scene trigger.
The five cross-era artifacts are a brilliant buried mechanic. Add first-visit hint, progress indicator (5 slots), and a completion payoff (e.g., unlock a "director's commentary" layer or a special contact route — nothing fabricated, just delight).
✅ *Done when:* an unprompted first-time tester discovers ≥1 artifact; completion state exists and is reachable; progress persists across visits.

**3.5 Narrative payoff at 2040** [A, K approves copy] (S)
**Status 2026-08-14: ✅ Implemented in visual and text modes.** Each environmental cue carries holographic Kevin through Notice, Recall, Deliberate, Act, and Continue before the authored final question—“May I keep this?”—with explicit release and present-day Work/Contact paths.
An authored ending beat after Consciousness asks permission instead of claiming permanence, then hands off to the living Kevin’s present-day work and contact routes.
✅ *Done when:* finishing chapter six delivers a designed moment, not just a loop; CTA to contact/work measurable in analytics.

**3.6 Deliberately deferred** — native React ports of the 1990–2020 V6 iframe apps (the CRT-embedded originals are part of the charm; revisit post-launch) and a live LLM endpoint for holographic Kevin (differentiator, but infra + safety scope). Morning, Together and Morning, After are native React; holographic Kevin remains deterministic, sourced, fail-closed, and explicitly disclosed as an authored reproduction.

---

## Phase 4 — Motion & interaction polish

*Why fourth: feel is judged in the first ten seconds and the last. Applies sitewide.*

**4.1 Micro-interactions** [A] (M) — hover/press states beyond `translateY`, magnetic primary buttons, animated link underlines, subtle card tilt. Consistent easing vocabulary documented.
**4.2 Page transitions + scroll choreography** [A] (M) — View Transitions API between standard routes; authored reveal-on-scroll; sticky chapter markers on long pages.
**4.3 Reduced-motion parity** [A] (S) — every animation gets a *designed* reduced variant (opacity/color shifts), not just the current global kill-switch.
**Status 2026-08-10: ✅ Implemented.** The universal `0.01ms` kill switch is gone; portal, 404, loading, buttons, panels, and timeline transitions have static or opacity/color variants. See `MOTION.md`.
**4.4 Touch & gesture** [A] (M) — swipe between eras on mobile; touch targets ≥44px audit; optional custom cursor **only** inside the immersive mode.
✅ *Phase done when:* interaction inventory documented with easing/duration tokens; reduced-motion walkthrough recorded; mobile gesture path tested on real devices.

---

## Phase 5 — Performance, accessibility, quality gates

*Why fifth: run continuously, but gate hard before launch. Juries test on their own machines; a dropped frame costs more than a missing feature.*

**5.1 Performance budget** [A] (M)
**Status 2026-08-11: ◐ CI budget implemented; device targets still require browser hardware.** Static route/output checks and gzip JavaScript budgets now fail CI on regression. Lighthouse and frame-floor proof remain part of the real-device gate.
Three.js only on `/experience/`; GLB via Draco + KTX2; lazy scene loading; quality tiers verified (60fps desktop mid-tier, 30fps mobile floor); standard pages LCP <2.5s.
✅ *Done when:* Lighthouse ≥90 across Performance/A11y/Best-Practices/SEO on all standard routes; experience holds frame floors on a defined device matrix; budgets enforced in CI (`check:build` extended).

**5.2 Accessibility audit — both modes** [A] (M)
**Status 2026-08-14: ◐ Functional parity implemented; manual audit remains.** Mobile utilities and Step Back remain operable, the experience has a real skip target, WebGL hotspots expose semantic buttons, and text mode now runs the complete 2030 mission/decision/receipt plus the 2040 sourced interpreter/memories/synthesis/finale from the same state. Axe, contrast, and manual screen-reader evidence remain pre-launch work.
Full screen-reader pass of standard pages *and* the experience's text-mode parity; focus order; contrast sweep; WCAG 2.2 AA. Document the SR script.
✅ *Done when:* axe/pa11y clean; manual SR walkthrough documented; text-mode reaches every fact the 3D mode presents.

**5.3 Cross-device QA matrix** [A] (M) — Safari/iOS WebGL, mid-tier Android, Firefox; fallback tiers and `webgl-notice` verified.
**5.4 Analytics + conversion funnel** [A] (S) — privacy-friendly analytics (Plausible-class); events: chapter entries, artifact finds, brief emails, case-study reads.
**Status 2026-08-10: ◐ Integrated; production activation pending.** DNT-aware, cookie-free Plausible loading and the full event funnel are wired; CSPs allow the endpoint. Kevin must add `kevinception.com` to the analytics account at cutover. See `ANALYTICS.md`.
✅ *Done when:* funnel from landing → experience → contact is measurable; no cookies requiring consent banners.

---

## Phase 6 — Launch & recognition

**6.1 Production cutover** [K→A] (S) — kevinception.com live, cache headers (deploy/ configs exist), staging pipeline documented.
**6.2 Pre-submission review** [A+K] (S) — score the site against the Awwwards rubric ourselves; fix the bottom axis; outside peer review round.
**6.3 The meta case study** [A, K approves] (M) — "Building Kevinception" as its own case study (fits the self-referential concept and gives judges the process story they reward). Std 79 floor applies to every claim.
**6.4 Submissions** [K] (S) — Awwwards (SOTD track), CSSDA, FWA, Godly, SiteInspire; 60–90s capture reel as the submission asset; stagger submissions after a 1–2 week soak for bug reports.
**6.5 Launch loop** [K→A] — Product Hunt / social announcement; iterate from analytics + feedback.
✅ *Phase done when:* live on prod, submitted to ≥3 galleries, capture reel published, feedback loop running.

---

## Sequencing & dependencies

```
Phase 1 (content truth)  ──┐  Kevin-gated items start NOW, run in parallel
Phase 2 (art direction)  ──┼─→ Phase 3 (immersive execution) ─→ Phase 4 (polish) ─→ Phase 5 gate ─→ Phase 6 launch
        └── 2.3 imagery depends on 3.1 scene fidelity for final captures (interim captures OK)
```

- **Agent-ready tranches completed through 2026-08-14:** 1.4, 1.6, 2.1, 2.4, 2.5, 3.4, 3.5, and 4.3; the native future-wing portion of 2.2/3.3 and functional text parity are implemented; 5.4 code awaits production-account activation.
- **Blocked on Kevin:** 1.1, 1.2, 1.3, 1.5 (facts/photo/quotes), 3.1 (direction decision), 3.3 (audio budget/licensing), 6.4 (submissions).
- **Biggest single lever for the Design axis:** 2.2 + 3.1 together — the era design languages made real in 3D.
- **Biggest single lever for the Creativity axis:** 3.2 portals — the site's own tagline, made literal.

## Definition of award-ready

1. Every page has real evidence, real imagery, and a human behind it.
2. Any era is identifiable from a single unlabeled screenshot.
3. The first ten seconds: authored boot, 60fps, a screen containing another world.
4. The last ten seconds: a narrative payoff and a reason to email.
5. Lighthouse ≥90 everywhere; WCAG 2.2 AA; text-mode parity.
6. Nothing on the site is invented — every claim survives a fact-check.
