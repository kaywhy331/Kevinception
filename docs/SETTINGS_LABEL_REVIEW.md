# SettingsPanel radio-label review — verified characterization

**Neither of the two lint findings reproduces as a label, accessible-name, activation or native-keyboard defect. Product code remains unchanged.** Seven focused tests and this report preserve the evidence. Both lint errors remain visible; no rule, configuration, markup or ARIA workaround was added merely to remove them.

Baseline: `544cead7f806f1cae7bfb87cd1a697add722b508`. Worktree `/home/cali/home/cali/project/kc-wt-readiness-20261003`, branch `agent/kevinception-settings-labels-20261003`. The CSS branch and `backup/kevinception-pre-settings-20261003` retain the baseline, with a tracked-file archive in `/home/cali/home/cali/project/kc-settings-evidence-20261003/`.

## Diagnosis and scope

The installed `jsx-a11y/label-has-associated-control` rule reports **“A form label must have accessible text.”** at `ExperienceOverlay.tsx:574` and `:583`. It does not report that the radio lacks an associated control. Every option already uses `<label><input type="radio"/><span><b>{label}</b><small>{detail}</small></span></label>`. The label correctly associates with the nested radio. The visible text is below the rule's default two-level search depth; its accessible-text check runs before its association check.

The coordinator independently counted 13 findings in this component, including exactly these two. Runtime evidence below confirms that both Visual quality and Motion have named groups and each option has the intended name, detail and activation behavior. This supports a static-analysis limitation in the tested implementation, not a claim of complete accessibility certification.

Only `tests/settings-panel-accessibility.test.tsx` and this document are new. No application source, styles, lint configuration, package/lockfile, budget, iframe cache, autofocus, modal handler, effect/state logic or personal content changed. The tests pass on unchanged source; they are characterization coverage, not an invented fails-before/passes-after defect repair.

## Focused evidence

The seven new tests render the actual `ExperienceOverlay` and cover both named fieldsets, four radios per fieldset, label/control association, visible label/detail in the computed name, label activation, one checked radio per group, selection/store isolation, shared native radio-group names and live resolved Auto text.

| Check | Result |
|---|---|
| Claude and independent coordinator: new test plus `experience-core.test.tsx`, single worker | **17 tests in two files pass**; independent duration 6.78 seconds |
| New test ESLint | Pass |
| Claude: `npm run typecheck` | Pass |
| Coordinator: component ESLint JSON | Expected exit 1: 13 findings, including the unchanged two label-text errors |
| Coordinator: accepted-export bundle checker | Pass; existing unchanged `544cead` export |
| Coordinator: local Chromium accessibility tree and DOM | **24 radio checks** across 390/768/1440 pixels; every radio has exactly one associated label and its visible label/detail in its native accessible name |
| Coordinator: native label clicks | **24 activations pass**, with one checked option and the other group unchanged |
| Coordinator: actual browser keyboard | **39 assertions pass**: Tab/Shift+Tab, both groups' arrow movement and wrapping, Space selection, group isolation and Escape closing |
| Accepted project-link targets | Three links at each tested width remain at least 44px in both dimensions |

The browser sampled the unchanged accepted export in 1990 text mode, opened Settings from its real menu, and exercised all eight controls at each width. It recorded named Visual quality and Motion groups. Example native names: `High Shadows, glow, and live screen previews` and `Reduced Short fades, no drifting or parallax`. Auto names included the actually resolved values in that browser (`now lite` / `now reduced`). Browser name computation therefore also verified the readable separation between the option and its detail that jsdom alone could not establish.

This was a synthetic headless Chromium check, not a physical-device or screen-reader test. It recorded **zero page errors, zero external requests and 20 raw request aborts**; the independent network gate remains unresolved. Three screenshots and the exact browser probe are retained. The first probe attempt stopped because Puppeteer did not accept the shortcut string `Shift+Tab`; the coordinator replaced it with Shift down / Tab / Shift up and reran only the browser check. Both attempts are retained. This was a test-harness error, not a product regression.

## Preserved CSS baseline

The canonical Node-compressor total remains **33,778 bytes**, against the unchanged **33,792-byte limit**, with 14 bytes headroom. CSS source and compiled assets were not changed. Earlier Python zlib 1.3 level-6 measurements of 34,054 before and 33,846 after the CSS milestone are separate; 33,846 is still over 33,792 and must not be mixed with the Node gate. No fresh production build was needed or run because product source is byte-for-byte unchanged. Full-suite tests and full-repository lint were not rerun for this tests/documentation-only change.

## Actual model and resource record

- Installed `/home/cali/.local/bin/claude` **2.1.288**, via station SSH alias `calibot`. Requested **`claude-sonnet-5-5`, medium effort**; assistant messages and final `modelUsage` report Sonnet 5.5. Effort is a requested setting; there is no independent provider attestation.
- Account metadata: logged in via `claude.ai`, Max subscription, `firstParty` provider metadata; configured provider origin `http://localhost:8766`. No credentials or default settings were changed.
- Main run **2026-10-03 05:13:14–05:14:45 UTC**, wall time **91 seconds**, exit 0. CLI duration 89,819 ms; API duration 51,954 ms; 21 reported turns / 20 tool calls. Session `0fcc40dd-0fb4-43f6-8133-77c858e8a786`.
- Normal `acceptEdits` permissions with explicit scoped allowlist, no bypass, no MCP servers or subagents. The wrapper capped runtime at 15 minutes, requested turns at 45, list cost at $4, output at 6,000 tokens per response and Node heap at 1,536 MiB. Production build/install/push commands were excluded; no model escalation occurred.
- Main usage: 18 uncached input tokens; 31,467 cache-creation input; 208,836 cache-read input; 7,839 output including 638 thinking tokens. Main **$0.2460612** reported list-cost estimate. Availability probe: success, exit 0, 1.724 seconds, **$0.0211368**. Combined estimate **$0.267198**, not actual subscription billing.
- One compound lint/redirection command was denied by normal scoped CLI permissions. The permitted plain lint command supplied the evidence. This was not a platform automatic approval-review rejection. Claude's first unit run had two over-broad test queries that matched both Auto options; it corrected the test queries to their fieldsets, without modifying product code.
- No heavier build was run while MBM staging had priority. The coordinator waited for the other active Cali owner to finish before the sequential acceptance batch at **05:20:28–05:20:55 UTC**. The corrected browser-only rerun took **05:22:14–05:22:56 UTC**. No MBM or GmailInventory files were modified.

## Remaining blockers and next scope

Both label errors remain documented static-analysis limitations; this milestone does not make ESLint green. The other 11 findings in ExperienceOverlay, baseline repository total of 22 ESLint errors plus one warning, and 46 CSS `!important` errors remain. CI/dependency audit, request-abort ambiguity, physical-device/GPU/screen-reader/contrast/motion evidence and approved personal-content evidence remain separate.

There is no additional radio-label product change supported by these findings. Any future lint-tool configuration decision should be a separate explicit scope, preserving the rule's coverage; this task neither requests nor performs a relaxation. The reset-confirmation autofocus finding is a separate potential next behavior review, with safe initial focus, Keep/Reset keyboard activation and focus restoration tested before changing it. Iframe and effect/state work remains separate.

Runtime provenance, original Claude report, backup, command receipts and final result are in `kc-settings-evidence-20261003`. Coordinator artifacts are in ignored `artifacts/settings-labels/`. No deployment, publication, push, merge or outreach was performed.
