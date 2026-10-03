# Kevinception — Six-era journey audit

- Status: review. The case-study link naming and target-size milestone is independently verified. Overall navigation/release acceptance is blocked; nothing is deployed, published, pushed, or approved.
- Baseline: `2449dd6ef7ddf03a06558614814a433a5aeca0ab`.
- Worktree: `/home/cali/home/cali/project/kc-wt-journey-20261003`, branch `agent/kevinception-journey-20261003`.
- Implementation: installed `/home/cali/.local/bin/claude` 2.1.286, verified model `claude-sonnet-5-5`, normal `acceptEdits` with explicit command rules, no permission bypass. Codex reviewed the diff and ran independent deterministic acceptance.
- Measured Claude window: **2026-10-03T00:54:31Z–01:12:50Z**, exit 0, wall time 18m19s. Requested ceilings: 20 minutes, 65 turns, $6 list-priced usage, 8,000 output tokens per response. Receipt reports 68 turns; the turn counter exceeded the requested cap. Runtime and dollar cap were not exceeded. The original Claude prose misstated its start and overrun; these timestamps come from the launcher receipts.
- Nonsecret account/provider metadata: login `claude.ai`, subscription `max`, configured origin `http://localhost:8766`; runtime receipt reports `firstParty`. Main run estimated list cost $1.4205292; tool-free Sonnet probe $0.02938. These are CLI estimates, not a verified bill. Main usage: 80 uncached input, 127,630 cache creation, 3,301,446 cache read, 24,956 output tokens (including 6,300 thinking tokens).

## Verified milestone

In text mode, each era displayed three case-study links with the identical accessible name “Open case study” and a measured target of 128×20 CSS pixels. This was reproduced in **12 baseline text-mode samples**: six eras at 390 and 1440 px. The original report's “18 before samples” was incorrect; 18 is the after count at three widths.

Claude made two application-line changes:

- `src/experience/ExperienceOverlay.tsx`: the accessible name includes the existing project title, retaining the visible label within the name.
- `app/globals.css`: text-mode case-study links use inline flex and a 44 px minimum height.

Seven new regression checks failed against the unchanged source, then passed with the fix as part of the full 154-test suite. Codex independently measured **18/18 era/width combinations** at 390, 768, and 1440 px: three distinct project-specific names, targets at least 44×44 px, no horizontal overflow, and Tab reachability. These findings establish the focused usability improvement. They do not establish WCAG nonconformance before or certification afterward: spacing exceptions, contextual link purpose, contrast, and assistive-technology behavior were not comprehensively assessed.

## Browser coverage and limits

Claude's `scripts/journey-audit.mjs` visited all six eras in room, interface, and text modes: 36 baseline samples at 390/1440 px and 54 after samples at 390/768/1440 px. It inspected host-document focus order (12 Tabs), visible target dimensions, hidden focusable elements, overflow, titles, console/page errors, and request failures. The after JSON records no undersized targets, overflow, hidden focusable elements, off-screen Tab stops, or runtime/request errors in those sampled entry states.

This is an informational probe, not an assertion-based release gate. Its “clean” entry samples did **not** prove successful link activation. The independent acceptance below found that gap.

All browser evidence is synthetic headless Chromium. The independent probe explicitly selected SwiftShader; Claude's probe allowed software WebGL but did not record the renderer. No physical device, hardware GPU, Safari/Android, or screen reader was tested. Full legacy iframe interaction flows, commerce modules beyond entry, 3D hotspots, gestures, Arrow/Escape navigation, reduced-motion, and standard-page journeys remain outside this pass. The existing `test:runtime:*` suites were not rerun. `readyMs` includes a fixed 1.5-second delay; zero `transferKB` reflects missing Content-Length headers, not a zero-byte transfer. These numbers are not performance or frame-rate proof.

## Reproduced blockers and next priority

**First priority: preview routing.** Independent Tab/Enter activation from every text-mode era/width reaches `/work/kevinception` without a trailing slash, and the local preview renders the lost-chapter 404 page. All **18/18 navigation attempts fail** despite the labels/targets passing. Overall `codex-browser-final` therefore correctly exits 1. The server code was not changed in this lane. Next work should use actual Claude Code to reproduce and repair local static-export navigation, cover slash/no-slash and relevant client-navigation requests, and add content/status assertions. Do not fold authentication or path-security changes into that functional fix.

**CSS performance gate remains red.** An independent clean worktree at the baseline was built with the same `npm run build -- --webpack` command. `check:bundle` fails in both builds: baseline first-load CSS is 34,044 gzip bytes, patched is 34,054, against a 33,792-byte budget. The fix adds 10 bytes; baseline already exceeds the budget by 252. This comparison is specific to the webpack path; the default Turbopack build was not assessed. Do not raise budgets merely to make this pass.

**Baseline lint remains red.** Independently running both linters in integration and the patched tree returns identical totals: ESLint 23 findings (22 errors, one warning), stylelint 51 errors. No unrelated lint remediation was included.

The previously reported CI npm-audit failure was not rechecked: no network dependency audit, install, dependency change, authentication change, or security remediation was authorized for this lane. Personal biography/content approvals, actual devices/GPU, and screen-reader evidence remain outstanding.

## Test receipts

| Command/check | Observed result |
|---|---|
| New regression before fix | 7/7 fail, exit 1 |
| `npm run test -- --maxWorkers=1` after fix | 154 tests, 28 files pass, exit 0; jsdom canvas-not-implemented warnings remain |
| `npm run typecheck` | pass |
| `npm run build -- --webpack` | baseline and patched pass; 21 static pages generated |
| `check:legacy-js`, `check:content`, `check:legacy-data` | independently pass |
| `check:build`, `check:links`, `check:security`, `check:diff` | independently pass; security check is read-only, no security changes |
| `check:bundle` | fails on unchanged and patched webpack builds, as detailed above |
| `npm run lint`, `npm run lint:css` | fail with identical baseline/patched counts |
| Claude entry-state browser matrix | 36 before / 54 after samples; inspected JSON, not a complete functional gate |
| Codex case-study target/name/Tab assertions | 18/18 pass |
| Codex Enter destination acceptance | 18/18 fail on preview 404; overall exit 1 preserved |

Claude's command allowlist denied some compound reads, a targeted lint command, and `npm run check:build`, `check:bundle`, and `check:diff`. It did not bypass those decisions. Codex ran the already-authorized post-build checks through the station execution tools; their actual results supersede the original report's “not run” entries. The full `npm run verify` result is **not green** because the bundle gate fails.

## Changes and evidence

Changed application files are the two listed above. New repository files are `tests/text-version-links.test.tsx`, `scripts/journey-audit.mjs`, and this report. No package/lockfile, CI, deployment, security/auth, biography, MBM, or GmailInventory changes were made. Integration remained clean at the original SHA. The default budget-aware host skill guidance was used; no companion accounting service was required.

Raw browser reports and screenshots: `artifacts/journey-audit.json`, `artifacts/journey-audit-after.json`, and `artifacts/journey-audit/`. Most before screenshots were overwritten by the after probe; the before JSON remains, and Codex preserved two early screenshot samples separately. The audit helper defaults to port 4416; use `BASE_URL=http://127.0.0.1:4416` explicitly when reproducing the recorded run.

Durable external evidence directory: `/home/cali/home/cali/project/kc-evidence-20261003/`. It contains `launch-receipt.json`, `claude-result.json`, `sonnet-probe.json`, prompt and launcher, failing-before/unit/build logs, `codex-gates.tsv`, baseline/patched lint and bundle logs, `bundle-comparison.json`, `verify-journey-links.mjs`, and `codex-browser-acceptance.json`. The original Claude report is retained as `claude-report-original.md`; this reviewed report corrects its unsupported claims.

## Routing follow-up

The bounded local routing repair and its functional keyboard-navigation evidence are recorded in [ROUTING_REPAIR.md](ROUTING_REPAIR.md). Kevin selected Codex CLI for that follow-up, superseding the earlier runtime recommendation above. This audit's original failure evidence and coverage limitations remain historical findings.
