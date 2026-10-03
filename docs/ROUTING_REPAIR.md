# Kevinception — Local static-export routing repair

Status: bounded server repair implemented; unit/static checks and 54 primary functional keyboard traversals verified. The broad browser audit remains red because it records aborted fetches; a diagnostic repeat also hit an entry-state timeout. Coordinator-reviewed local milestone; no deployment or release acceptance is implied.

Worktree: `/home/cali/home/cali/project/kc-wt-routing-20261003`, branch `agent/kevinception-routing-20261003`, baseline `0f5eff9a536d07098a26ad702876db771b7e52a5`. Kevin's current runtime instruction supersedes the historical Claude recommendation: Codex CLI, requested `gpt-6.1-sol`, high effort, existing ChatGPT plan only. Provider-served model identity is not independently attested: no provider metadata was exposed. No subagents or other AI tools were used.

## Diagnosis and scope

This is a local preview-server contract failure. All three featured case-study documents and their exported client-navigation data already exist. `next.config.mjs` specifies `output: 'export'` and `trailingSlash: true`; application links already point to `/work/<slug>/`.

The captured request chain begins with `/work/kevinception/index.txt?_rsc=...` (`RSC: 1`), which the preview served as `application/octet-stream`. The installed Next client at `node_modules/next/dist/client/components/router-reducer/fetch-server-response.js:99–148` explicitly accepts `text/plain` for exported Flight responses and otherwise takes the document-navigation fallback. In the observed trace, that fallback requests `/work/kevinception` without a slash. The server looked for `<route>.html` but failed to resolve the existing `<route>/index.html`. It streamed `404.html`, and incorrectly chose HTTP 200 merely because the fallback file existed. The rendered result was `.lost-era`, heading “This timeline split somewhere it shouldn’t have.”

The repair adds the `.txt` MIME mapping, resolves only existing per-route directory indexes after the existing flat-HTML candidate, and tracks missing-route HTTP 404 independently of the fallback file's existence. If there is no `404.html`, it returns 404 with `Not found` instead of streaming a nonexistent file and crashing. Unknown routes retain the authored missing page when available. There is no blanket home-page fallback, fabricated status, content replacement, or path-security/auth redesign.

## Changed files

- `scripts/serve.mjs`: 10 added / 3 removed lines for the serving contract above.
- `tests/preview-routing.test.ts`: 12 functional HTTP tests launching the actual CLI server against an isolated export fixture: slash/no-slash/query variants, root and flat HTML compatibility, client-navigation bytes/MIME, genuinely absent routes/assets/data, and an export without `404.html`.
- `scripts/routing-repair-audit.mjs`: assertion-based keyboard journey probe; owns port 4416 only after verifying it is free; closes its browser/server in `finally`; records all observed request responses, failures, errors, rendered headings/content, and Back/Tab results.
- `docs/ROUTING_REPAIR.md`: this report.
- `docs/JOURNEY_AUDIT.md`: append-only follow-up link; historical findings remain intact.

The accepted project-specific link names and 44px CSS targets were preserved. Existing tests, product sources, CSS, dependencies, versions, and build/deployment configuration were not edited.

## Evidence and UTC checkpoints

All new generated evidence is in `artifacts/routing-repair/` in this worktree. The first captured clock checkpoint was `2026-10-03T02:31:40Z`.

- `before-first-attempt.json`: initial failing browser attempt, `2026-10-03T02:34:18.214Z–02:34:40.079Z`, including request/status/rendered fallback evidence. Its second Back restored the source URL but the network-idle wait timed out; this unsuccessful attempt is retained.
- `before.json` and `before-destination.png`: complete failing-before matrix, `2026-10-03T02:36:28.358Z–02:37:57.005Z`, 18/18 Enter failures; all 18 Back/Tab checks passed. The revised probe waits for document/rendered state instead of network idle, without changing destination or Back assertions.
- `regression-before.log`, `gates-before.json`: new HTTP regressions before the server edit, **9 fail / 3 pass**, command exit 1; `2026-10-03T02:38:05.349Z–02:38:07.131Z`.
- `gates-after.json` and per-command logs: sequential verification, `2026-10-03T02:38:33.515Z–02:39:34.794Z`.
- `export-provenance.json`, `provenance-verified.json`: copied accepted export provenance and SHA-256 comparison. At `2026-10-03T02:39:34.457Z`, all 187 export files were identical to the prior accepted worktree. That worktree was clean at `0f5eff9`; original integration was clean at `2449dd6ef7ddf03a06558614814a433a5aeca0ab`.
- `after-first-attempt.json`: complete after matrix, `2026-10-03T02:39:45.580Z–02:42:09.272Z`, **54/54 destination and Back/Tab checks pass**, zero page errors; overall exit 1 because 180 `net::ERR_ABORTED` events trip the unchanged strict failed-request assertion.
- `after.json`: diagnostic repeat, `2026-10-03T02:43:22.282Z–02:44:08.414Z`, 18/18 completed traversals pass, zero page errors, 50 aborted requests all classified as non-navigation `fetch`. Exit 1 on a 10-second text-grid selector timeout after loading `/experience/1990/?view=text` at the next width. Request headers did not identify these as RSC or prefetch, so their origin is unresolved; no inference that they are harmless is treated as proof.
- `final-review.json`, `first-final-review.json`, `targeted-eslint.log`, `first-targeted-eslint.log`: final changed-code lint, whitespace/provenance checks, and confirmation that owned port 4416 was released. The initial targeted lint found three undeclared browser globals in Puppeteer callbacks; an explicit browser-global declaration fixes those task-local findings. The first failure receipt remains preserved.
- `run-gates.mjs`, `verify-provenance.mjs`: local artifact-only receipt helpers, preserved to reproduce the sequential commands and export/state checks.

The copied `out/` originated at `/home/cali/home/cali/project/kc-wt-journey-20261003/out`; the prior accepted webpack build is documented in [JOURNEY_AUDIT.md](JOURNEY_AUDIT.md). No new build was needed because application/export source did not change. This validates serving that existing export, not fresh-build reproducibility or another build backend.

Final review completed at `2026-10-03T02:47:10.437Z`: changed-code ESLint and whitespace checks passed, port 4416 was free, all 187 copied export files were still identical, and both protected worktrees were still clean at their original commits. At that agent checkpoint, the routing worktree remained at its baseline HEAD with a five-file uncommitted review diff; coordinator close-out is recorded below. Report close-out checkpoint: `2026-10-03T02:47:17Z`.

## Commands and observed exits

Commands ran from this worktree. The gate helper captures each child command's actual exit independently; its own exit 0 means receipts were written, not that every gate passed.

| Exact command | Exit | Result |
|---|---:|---|
| `node scripts/routing-repair-audit.mjs --before` (first attempt) | 1 | Two rendered failures; second Back network-idle timeout; preserved |
| `node scripts/routing-repair-audit.mjs --before` (complete attempt) | 1 | 18/18 intended-content failures; Back/Tab 18/18 pass |
| `npm run test -- --maxWorkers=1 tests/preview-routing.test.ts` | 1 | Before fix: 9 failed, 3 passed |
| `npm run test -- --maxWorkers=1` | 0 | After fix: 166 tests, 29 files pass, including all 12 HTTP regressions |
| `npm run typecheck` | 0 | Pass |
| `npm run check:legacy-js` | 0 | Pass |
| `npm run check:content` | 0 | Pass |
| `npm run check:legacy-data` | 0 | Pass |
| `npm run check:build` | 0 | Existing accepted output passes |
| `npm run check:links` | 0 | Pass |
| `npm run check:security` | 0 | Read-only check passes |
| `npm run check:bundle` | 1 | Existing CSS budget failure reproduced on byte-identical export |
| `npm run check:diff` | 0 | Pass at gate checkpoint |
| `node scripts/routing-repair-audit.mjs` (primary after run) | 1 | All 54 destination/Back checks pass; strict request assertion fails on 180 aborted fetches |
| `node scripts/routing-repair-audit.mjs` (diagnostic repeat) | 1 | 18 completed traversals pass; next entry's text-grid selector times out; 50 aborted non-navigation fetches recorded |
| `node artifacts/routing-repair/verify-provenance.mjs` | 0 | Both protected worktrees clean; export hash equality |
| `node_modules/.bin/eslint scripts/serve.mjs scripts/routing-repair-audit.mjs tests/preview-routing.test.ts` (initial) | 1 | Three browser globals undeclared in the new Puppeteer helper; receipt preserved, explicit declaration added |
| `node_modules/.bin/eslint scripts/serve.mjs scripts/routing-repair-audit.mjs tests/preview-routing.test.ts` (final) | 0 | Changed-code lint passes, `2026-10-03T02:47:08.444Z–02:47:10.252Z` |
| `git diff --check` (final review before report completion) | 0 | Pass |

Some default-sandbox commands failed before execution with exit 1: `bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted`. Default sandbox settings were kept. Only exact scoped local export-copy, test/probe, and read-only provenance operations were requested through automatic approval review and allowed. No approval rejection or model substitution was observed. Read-only source inspection continued via working default-sandbox commands. No credentials or account configuration was intentionally accessed.

## Browser acceptance and limits

Synthetic headless Chromium uses the repository's shared launcher and explicitly configured SwiftShader. Widths are 390, 768, and 1440 CSS px, height 900. The before matrix activates Kevinception from all six eras at all three widths. The after matrix activates each of Kevinception, Kevin Online, and TokenPak in every era/width combination, for 54 traversals. Each link is reached using real Tab and activated using Enter. Assertions require the exact project heading, full authored summary, eight case-study content sections, and absence of `.lost-era`; then browser Back must restore the exact original era URL including `?view=text`, show the text grid, and allow Tab to reach the case-study link again. Names and both target dimensions ≥44px are asserted for all three links in every entry state.

The complete primary after receipt records **54/54 intended-content checks and 54/54 Back/Tab checks passing**, with names and targets passing in all 18 era/width entry states. `/work/kevinception` and `/work/kevinception/` both return 200 with the actual case-study document and no lost-era; `index.txt` and `__next._full.txt` return 200 with `text/plain; charset=utf-8`. `/work/does-not-exist`, `/work/does-not-exist/`, and `/missing.txt` each return 404 with the authored `.lost-era` body. All 246 captured primary browser responses are retained separately from the 180 aborted requests. The complete run's final HTTP-error assertion was not reached after the strict request-failure assertion; response records must not be substituted for a green aggregate gate.

The request-abort assertion was preserved, and no failures were skipped or relabeled as passes. The diagnostic repeat ended early at the next entry selector, without manufacturing further traversal results. This bounded result establishes the selected serving contract through passing HTTP tests and a complete functional traversal receipt, while leaving browser-probe reliability/request cancellation as an explicit follow-up for independent coordinator validation. No additional application change was made for those unresolved observations.

No physical devices, hardware GPU, screen reader, Safari/Android, complete legacy iframe/commerce flow, all 3D hotspots, or reduced-motion matrix was tested. The prior entry-only audit remains [historical evidence](JOURNEY_AUDIT.md), not functional navigation proof.

## Separate existing blockers

The CSS gate remains red: 34,054 gzip bytes versus the 33,792-byte budget. This export is unchanged by the server repair. Prior independently confirmed full-repository ESLint findings (23: 22 errors, one warning) and stylelint failures (51 errors) remain; the full linters were not rerun here (changed-code ESLint is recorded separately). The prior CI npm-audit gap remains unverified; no audit, installation, or dependency change was performed. Personal-content approvals and real-device/GPU/screen-reader evidence remain outstanding. These are separate from the bounded local routing fix; overall release/`verify` status is not green. The aborted fetches and repeat entry-state timeout above also prevent claiming a fully green browser audit.

## Coordinator close-out

The installed Codex CLI 0.160.0 ran once successfully from 2026-10-03T02:30:26Z to 02:47:57Z (17m31s), exit 0. A prior flag-parse-only attempt exited 2 without a model run. A fresh app-server model/list exposed `gpt-6.1-sol` and supported `high` effort; the successful launch requested exactly those settings. Existing account metadata reported ChatGPT Pro. Provider-served model and effort were not exposed in the CLI JSON stream, so neither launch flags nor catalog metadata constitute provider attestation. No reroute event was observed. No alternate model, new credentials, billing setup, or default configuration changes were introduced.

The hard runtime limit was 1,200 seconds. The run recorded 47 completed command items and 10 file-change items, within a soft 60-tool budget. Reported usage was 2,897,847 input tokens, including 2,799,488 cached input tokens; 25,340 output tokens and 8,321 reasoning-output tokens were reported separately. The 15,000-output-token soft target was exceeded; it was an instruction, not an enforced cap. These counters are not a monetary charge or a provider-model attestation. The launch used `--approve-for-me`, which selects normal workspace-write sandboxing and automatic scoped approval review, without a bypass.

At 2026-10-03T02:50:42Z, the coordinator independently checked the saved complete before/after receipts: exactly 18 before content failures; exactly the 54 combinations of six eras, three widths, and three projects after the fix; all authored destination-content and Back/Tab results pass; all project-specific names and 44px targets remain valid. Every captured primary navigation response was below HTTP 400, and explicit missing-route checks correctly returned 404. This additional assertion does not replace or change the red aggregate browser result. The coordinator reran the 12 focused HTTP regressions, changed-file ESLint, and whitespace checks successfully. No further model run or browser rerun was added during close-out.

Raw launch/events, fresh model catalog, final response, coordinator acceptance JSON, and independent test logs are preserved in the sibling `kc-routing-evidence-20261003` directory. The first and diagnostic browser failures remain preserved in this worktree's artifacts. Next priority is to reproduce and classify the non-navigation fetch cancellations and intermittent text-grid readiness timeout while retaining the full content, Back/keyboard, and truthful-404 assertions. The separate CSS budget failure remains afterward. This local routing milestone does not close either blocker.
