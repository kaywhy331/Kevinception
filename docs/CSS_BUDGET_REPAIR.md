# Kevinception CSS budget repair — accepted local milestone

The unchanged canonical bundle gate passes: **33,981 → 33,778 gzip bytes on all 20 routes**, against a **33,792-byte limit**. Savings are 203 bytes; headroom is only 14 bytes. Five duplicate-selector lint findings are removed. This is a verified CSS milestone, not a release approval.

Workspace: `/home/cali/home/cali/project/kc-wt-readiness-20261003`, branch `agent/kevinception-css-budget-20261003`, parent `cf113477f164095e5c2f182e7d3ab5d03fb0d65d`. The readiness branch and `backup/kevinception-pre-css-20261003` retain that parent. A pre-edit tracked-file archive is retained in `/home/cali/home/cali/project/kc-css-evidence-20261003/pre-css-tracked.tar`. Integration, journey and routing worktrees remain protected. No publish, deployment, push, personal-content edit, authentication/configuration change, MBM edit or GmailInventory edit was performed.

## Implementation and review

Actual Claude Code diagnosed and implemented the change in five CSS files: **24 lines inserted, 31 deleted**. It merged the five duplicate selectors in `award-pass.css`, `device-native-pass.css` and `future-wing.css`, and removed approximately 56 declarations shadowed later in the import sequence from `globals.css` and `environment-pass.css`. The intentional `100vh`/`100svh` fallback and all 46 `!important` declarations remain. No bundle limit, lint configuration or application TypeScript changed.

The coordinator reviewed the full diff. The moved duplicate declarations cross rules for other elements/properties; their hover, expanded and responsive overrides retain their effective order. Equal-selector/context/property analysis found 5,116 winners before and after, with zero differences. That analysis alone is not a general cascade proof: it cannot establish overlapping-selector order, shorthand interactions, unsupported-value fallbacks, custom-property substitution or browser support. The coordinator therefore also compared the actual accepted and candidate compiled CSS in the same live DOM.

Three read-only diagnostic helpers are included: `css-measure.mjs`, `css-redundancy.mjs`, and `css-cascade-equivalence.mjs`. They support investigation; the unchanged canonical checker remains the acceptance gate. The browser acceptance probe and immutable logs/screenshots live under ignored `artifacts/css-budget/`, not the product bundle.

## Corrected byte accounting

Earlier receipts reported 34,054 bytes using **Python zlib 1.3 at gzip level 6**. The repository's existing gate uses **Node v22.22.0 / zlib 1.3.1-470d3a2**, whose default gzip is level 6. Identical accepted CSS hashes produce different compressed sizes with these versions. Comparing the old Python count directly with the new Node count would overstate the saving.

| Measurement | Accepted export | Candidate export | Change |
|---|---:|---:|---:|
| Canonical Node gzip, unchanged gate | 33,981 | **33,778** | **−203** |
| Auxiliary Python zlib 1.3, gzip level 6 | 34,054 | 33,846 | −208 |

The auxiliary Python figure remains 54 bytes over 33,792; it is not the compressor used by the repository gate. No algorithm, threshold or checker changed to obtain the pass. `compression-comparison.json` preserves both measurements and CSS hashes. Accepted routing and journey CSS hashes match.

## Validation

| Check | Result |
|---|---|
| Claude: `npm run build -- --webpack` | Pass; Next 16.3.0 production export, including its TypeScript phase |
| Coordinator: unchanged `npm run check:bundle` | Pass; 20 routes, 33,778 CSS bytes each; 50 JS chunks, 751.5 KiB total gzip, largest 98.1 KiB |
| Coordinator: `npm run test -- --maxWorkers=1 --no-file-parallelism` | **175 tests / 30 files passed**, 43.75 seconds |
| Coordinator: `npm run check:build` | Pass; 12 checked routes and four embedded legacy applications |
| Coordinator: `npm run check:links` | Pass; 689 local references across 25 HTML files |
| Coordinator: selector/context/property winners | 5,116 before/after; zero differences |
| Coordinator: browser CSS comparison | **78 comparisons; 913 node instances; 1,383,867 property comparisons; zero differences** |
| Coordinator: keyboard navigation | Six case-study/Back journeys passed, one per era; panel Enter/Escape and returned focus passed at all three widths |
| Coordinator: accepted project links | Unique labels and 44px minimum dimensions checked on all 18 era/width text pages |
| CSS lint | Still red: **46 errors**, all `declaration-no-important`; down from 51 by removing five duplicate-selector errors |
| ESLint | Still red: **22 errors and one warning**, unchanged |
| Whitespace diff check | Pass |

Browser coverage: one local headless Chromium process using SwiftShader, at 390, 768 and 1440 pixels. Real route comparisons cover six eras in text, interface, and expanded/focused-panel states (54 cases). A synthetic fixture covers transient/otherwise absent changed selectors with default, hover, focus and expanded states under normal/reduced-motion media preferences at all three widths (24 cases). Comparisons use the same DOM and disable animations/transitions during sampling; they are not motion-timing or pixel-equivalence tests. Six candidate screenshots were retained; the coordinator visually inspected mobile text and desktop interface samples.

The CSS probe reported **zero page errors, zero external requests, and 152 raw `net::ERR_ABORTED` request failures**. Its pass means CSS/functional assertions passed; it does not make the separate no-failed-requests network gate green. No request classification or network-gate assertion was weakened. The prior readiness report's unresolved request ambiguity and historical timeout remain separate.

## Actual Claude execution

- Installed `/home/cali/.local/bin/claude`, version **2.1.288**, launched over station SSH to `calibot`.
- Requested **`claude-sonnet-5-5` with `--effort high`**. Assistant messages and final `modelUsage` identify `claude-sonnet-5-5`; provider metadata says `firstParty`. This is CLI/provider metadata, not independent provider attestation of effort.
- Account metadata: logged in through `claude.ai`, subscription `max`; configured provider origin `http://localhost:8766`. No credentials were recorded. Default settings were preserved.
- Normal scoped permissions: `acceptEdits`, explicit tools/command allowlist, no permission bypass, no MCP servers. No subagents. Denied commands were recorded, not bypassed within Claude.
- Bounds: 1,200-second timeout, requested 65-turn limit, $6 list-cost cap, 8,000 output tokens per response, Node heap 1,536 MiB. The CLI result reports **72 turns and 71 tool calls** despite the requested 65-turn limit; this discrepancy is preserved rather than presenting 65 as the actual count. The process ended normally, exit 0, within runtime/cost bounds.
- Main run: **2026-10-03 04:35:06–04:42:31 UTC**, wall time **7m25s**; CLI duration 443,407 ms, API duration 377,060 ms. Session `8c1add95-be3d-44a7-b5af-888d2bec6f07`.
- Main reported usage: 80 uncached input tokens, 98,039 cache-creation input tokens, 2,230,014 cache-read input tokens, 37,920 output tokens (14,905 thinking tokens). **$1.2175188 list-cost estimate**, not actual subscription billing.
- Separate tool-free model-availability probe: success, 2.898 seconds, $0.031638 list estimate. Its wrapper did not retain a separate exit receipt because the CLI consumed subsequent stdin; the JSON success result is retained. Combined probe/main list estimate: **$1.2491568**.
- Six denied Claude commands included tests and the canonical bundle command. Claude completed the build, cascade diagnostics and lint runs. The coordinator independently supplied the canonical bundle, full test, export/link and browser checks above. This was a CLI permission-scope limitation, not an automatic platform approval-review rejection.
- Coordinator acceptance batch: **04:55:26–04:59:14 UTC**, one sequential batch. The separate GmailInventory process observed earlier was allowed to finish before this batch began. No other project was built or edited.

The raw stream, final result, command receipts, launcher, objective, before/after source snapshots and original Claude report are retained in the runtime/evidence directories. The original report predates independent checks and contains the superseded cross-compressor comparison; this report is the corrected acceptance record.

## Remaining gates and next bounded scope

Fourteen bytes of CSS headroom is fragile. Default Turbopack build, full `npm run verify`, CI/dependency audit, hardware performance targets, physical Safari/iOS/Android devices, GPU profiling, screen readers, contrast certification, motion timing and personal-content approvals were not completed by this milestone. The webpack production build is the like-for-like export used here. Existing `KNOWN_LIMITATIONS.md` and `ROADMAP.md` remain applicable; older roadmap completion labels are not new acceptance evidence.

The next smallest ExperienceOverlay scope is **only the two SettingsPanel radio-label findings at lines 574 and 583**, with a focused accessible-name/label-activation/keyboard regression. Source review shows both controls are already nested inside labels; their visible text is below `span > b/small`. The installed `label-has-associated-control` rule searches only two levels by default and checks readable label text before association. Adding `htmlFor` alone may therefore leave the warnings. Reproduce the exact rule behavior and preserve rendered names/descriptions without relaxing lint configuration.

Treat the reset confirmation's autofocus warning at line 595 as a separate focus-management change, with safe initial focus, Keep/Reset keyboard behavior and focus restoration covered. The iframe cache effects, modal handlers and other effect-state findings require their own behavioral review. No ExperienceOverlay code was changed in this milestone.
