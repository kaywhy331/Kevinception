# ExperienceOverlay focus repair — verified local milestone

Two reproduced focus-restoration defects are fixed with **19 added and two removed lines in `ExperienceOverlay.tsx`**. Fifteen focused tests were added. One lint finding (`no-autofocus`) is resolved; **12 component errors remain, with no suppressions or rule changes**. This is not a lint-clean or release-ready claim.

Parent `65d0995ff24297ff98f3b7c557aac2fa196d4380`, branch `agent/kevinception-overlay-focus-20261003`, worktree `/home/cali/home/cali/project/kc-wt-readiness-20261003`. Accepted SettingsPanel/CSS/readiness/journey/routing refs and `backup/kevinception-pre-overlay-20261003` are preserved. Product changes are confined to this component; no iframe, camera, store, stylesheet, package/configuration or personal content was changed.

## Reproduction and minimal fixes

1. **Keep progress:** opening Settings → Reset local progress focuses the safe Keep button. Activating Keep unmounted the focused button and left `document.activeElement` as `BODY`. The change replaces `autoFocus` with two button refs and a focus effect: confirmation still starts on Keep; cancellation returns focus to Reset local progress. This also removes the autofocus lint finding.
2. **Menu-launched dialogs:** keyboard-opening Settings, Help or Artifacts removed the focused menu item before the dialog captured its return target. Closing the dialog restored focus to `BODY`. `UtilityMenu.activate` now focuses its mounted Menu trigger before running the action, so the dialog captures a durable return target.

The coordinator reproduced four failures using the final, corrected test file on an isolated unchanged parent worktree: three dialog-return cases and one Keep-return case. The other 11 new tests already passed. All 15 pass on the candidate. Claude's initial test run had a fifth failure because its test read jsdom's unsupported `inert` property; that assertion was corrected to the real DOM attribute before the independent baseline/candidate comparison.

**Browser correction to Claude's initial report:** Chromium confirmed focus fell to `BODY`, but the next Tab recovered to Reset local progress, and global Escape still closed Settings. The evidence supports immediate focus loss and an unreliable return position, not the stronger claim that Tab containment and Escape universally stopped working. Candidate focus returns immediately and visibly to the reset trigger; the next Tab wraps to Close settings. The original Claude report is preserved in runtime receipts; this report is the corrected record.

## Independent acceptance

| Check | Result |
|---|---|
| Corrected new tests against unchanged parent | Expected failure: **4 failed, 11 passed**; 3.37 seconds |
| Candidate overlay/core/SettingsPanel/UX/device tests, one worker | **47 tests / five files passed**; 11.47 seconds |
| New/existing touched test ESLint | Pass |
| Component ESLint | **12 errors**, down from 13; no new rule disabled |
| Claude typecheck | Pass |
| Fresh `npm run build -- --webpack` | Pass, including TypeScript |
| Unchanged `check:bundle` | Pass; all 20 routes retain **33,778 CSS gzip bytes** |
| `check:build` / `check:links` | Pass: 12 checked routes/four embedded apps; 689 local references/25 HTML files |
| Native Chromium before/after | At 390/768/1440, **12/12 focus assertions fail before and 12/12 pass after** |
| Additional shared-menu navigation | Visual version → environment, Chapters → overview, Text version → text all pass with the intended focused control/heading |

The browser used actual keyboard events to open menus, move with arrows/Home/End, activate items, wrap Tab/Shift+Tab inside all three dialogs, close with Escape, open/cancel/confirm reset, and check progress preservation or clearing using ephemeral synthetic progress. Nine case-study links retained distinct labels and dimensions of at least 44px. After confirmation, focus still returned to Menu. The navigation check ran after the unchanged focus hook's initial URL-sync interval; it is not evidence about interactions during that first 800 ms.

Both before/after focus runs recorded **zero page errors, zero external requests and 15 raw request aborts each**. The navigation probe recorded zero page errors and nine request aborts. No network assertion was relaxed; the separate network gate remains unresolved. Six focus screenshots are retained; the mobile before/after pair was visually reviewed and shows the restored reset-button focus ring with the same layout. No screenshot pixel-equality, physical-device, hardware-GPU, screen-reader or motion-timing claim is made.

The fresh canonical **Node** CSS total remains **33,778**, under the unchanged **33,792** limit by 14 bytes. Stylesheet source and emitted CSS hashes are unchanged. The separate Python zlib 1.3 level-6 measurement is **33,846**; it is not the canonical gate and is still over 33,792. No cross-compressor savings claim is made. Default Turbopack, the entire repository test suite, full repository lint and CI/dependency audit were not rerun for this bounded component repair.

## Remaining findings: evidence and limits

| Current finding(s) | Assessment |
|---|---|
| `set-state-in-effect`, lines 305/316/320 | Post-commit state updates in frame cleanup/mounting and takeaway reset can cause extra render work. Tests cover the bounded two-frame cache, active/cached tab order, hidden-layer attributes and chapter-change takeaway reset. No user-facing defect or measured performance regression was established; no cache/warmup refactor was made. |
| `set-state-in-effect`, line 675 | First-run hint synchronizes browser-only storage/media state after mount. The state updates are real; browser-only inputs explain the timing but do not make all extra-render concerns false positives. Hydration/performance alternatives need a separate measured scope. |
| `no-noninteractive-element-interactions`, lines 388/583/630/653 | Takeaway Escape delegation and modal mousedown propagation guards are intentional patterns. Focus/keyboard behavior is covered; this is not blanket proof that every event-role combination is ideal. |
| `no-noninteractive-tabindex`, line 423 | Active/cached iframe focus policy is intentional and unit-tested. Hidden CSS and an inert hidden parent also exclude controls; removing `tabIndex` does not automatically imply hidden frames become tabbable. Boot/prewarm/reload behavior was not newly exercised in a browser. |
| `no-static-element-interactions`, line 745 | Parent menu key delegation with child menu/menuitem roles. Unit and browser navigation/focus contracts pass; the warning remains. |
| Radio-label text, lines 588/597 | Previously verified static-analysis text-depth limitations. Radio markup/tests remain unchanged and passing. |

Totals: four hook findings, four noninteractive-handler findings, one iframe finding, one menu finding and two labels = **12**. Existing unrelated repository findings and 46 CSS `!important` errors remain; full-repository counts were not remeasured in this milestone.

## Actual Claude and execution record

Installed `/home/cali/.local/bin/claude` **2.1.288**, requested/reported **`claude-sonnet-5-5`**, requested **medium** effort. Account metadata: `claude.ai`, Max subscription, `firstParty`; configured provider origin `http://localhost:8766`. These are runtime metadata, not independent provider attestation. Default settings/credentials were not changed. The previous successful medium run supplied availability evidence; no extra model probe was charged to this milestone.

Main run **2026-10-03 05:34:02–05:37:05 UTC**, **3m03s**, exit 0; CLI duration 182,203 ms, API duration 142,314 ms; **32 turns / 31 tool calls**. Session `ccc7ff44-bbd2-4e81-aa80-15aa85e3b6dd`. Usage: 32 uncached input tokens, 59,939 cache-creation input, 647,706 cache-read input, 17,704 output including 4,259 thinking tokens. Reported list-cost estimate **$0.5464012**, not actual subscription billing.

Bounds were 18 minutes, 55 requested turns, $5 list cost, 6,000 output tokens per response and a 1,536 MiB Node heap. Normal scoped `acceptEdits`, no bypass, MCP or subagents. One compound command was denied by CLI permissions; simple permitted checks ran. An attempted Unix ESLint formatter was unavailable; the normal formatter supplied the actual 12-error result. No formatter/dependency was installed.

Coordinator freshly checked shared owners before heavy work; MBM retained priority. One sequential test/build batch ran **05:40:47–05:41:39 UTC**, baseline browser **05:44:24–05:44:46**, candidate browser **05:44:47–05:45:07**, and the targeted menu-navigation risk check **05:48:22–05:48:32**. No MBM or GmailInventory files were modified. No publication, deployment, push, merge or outreach occurred.

## Next scoped proposal

Profile `InterfaceLayer` state transitions before choosing a lifecycle refactor. A separate proposal should measure avoidable renders and specify regressions for eviction/reload/prewarm, active-year changes, hidden-layer focus and takeaway reset, preserving camera behavior. Browser-only hint synchronization can be evaluated separately with hydration coverage. No broader architecture change or lint-suppression policy is authorized by this report, and no blanket per-line-disable recommendation is made.

Runtime objective/launcher/results, original report, source diff and backup are in `kc-overlay-evidence-20261003`. Ignored `artifacts/overlay-focus/` contains the preserved baseline export, corrected baseline failures, candidate tests/build/lint/checks, exact browser probes, JSON and screenshots. The separate baseline worktree is left clean at the accepted parent.
