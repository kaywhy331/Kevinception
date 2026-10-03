# Kevinception readiness follow-up

Bounded diagnostic milestone for coordinator review. **Aggregate browser acceptance remains red.** The unchanged full matrix passes 54/54 authored destination-content and Back/Tab journeys, but one of 178 request cancellations remains unclassified. The historical readiness timeout did not reproduce. No product repair is justified by this evidence; this is a coordinator-reviewed local observability milestone.

Scope: installed Codex CLI, requested `gpt-6.1-sol`, `high` effort, existing ChatGPT Pro authorization only. Provider-served model/effort metadata was not exposed; request/launch/catalog information is not provider attestation. No other AI run, subagent, account/configuration change, install, build, publication, or external outreach was performed. MBM and GmailInventory were untouched.

Workspace: `/home/cali/home/cali/project/kc-wt-readiness-20261003`, branch `agent/kevinception-readiness-20261003`, baseline `c0e142e3731dfaacf52cc03c56c2bcfd5d2985a3`. Current user scope supersedes older roadmap/release instructions. Applicable ancestor `/home/cali/CLAUDE.md`, supplied AGENTS instructions, required scope documents and coordinator reference diagnosis were read; no workspace/ancestor project AGENTS/CLAUDE or `.agents` skill directory was found in the targeted project lookup.

## Provenance and UTC checkpoints

First recorded clock: **2026-10-03T03:30:57Z**. Diagnosis and reproductions completed by **03:39:29Z**, before the ten-minute target from that checkpoint. The full-matrix decision was recorded before launch in [decision receipt](../artifacts/readiness-followup/decision-matrix-20261003T0338.json).

The probe served the accepted routing worktree's `out/` directly with this workspace's unchanged accepted `scripts/serve.mjs`. Each attempt hashes all **187 files** and compares them to the accepted journey export. No export was copied, rebuilt, or modified. Final review at **2026-10-03T03:42:42.940522+00:00** confirmed hash equality with the initial control manifest, owned port 4417 free, all three owned browser parent PIDs gone, and protected worktrees clean at `c0e142e`, `0f5eff9`, and `2449dd6`. Existing routing receipts were preserved; [reference hashes](../artifacts/readiness-followup/2026-10-03T0343-final-review-attempt-1/reference-hashes.json) identify the saved diagnosis and prior after receipts.

All new evidence is under `artifacts/readiness-followup/`. Attempt directories and their raw captures are immutable; failures were retained.

| Attempt directory | UTC window | Completed journeys | Raw aborts / narrowly classified / unknown |
|---|---|---:|---:|
| `2026-10-03T03-34-22-946Z-control` | 2026-10-03T03:34:22.947Z–2026-10-03T03:34:29.651Z | 0 | 5 / 5 / 0 |
| `2026-10-03T03-34-53-479Z-prelude` | 2026-10-03T03:34:53.479Z–2026-10-03T03:35:33.635Z | 18 | 54 / 54 / 0 |
| `2026-10-03T03-37-16-993Z-matrix` | 2026-10-03T03:37:16.993Z–2026-10-03T03:39:28.739Z | 54 | 178 / 177 / 1 |

Each directory contains `provenance.json`, `network.jsonl`, `report.json`, `classification.json`, and exact browser-command receipt/log. Control and prelude additionally contain `entry.json` and `entry.png`. Verification attempts retain logs and per-command UTC/exit receipts; the first failed lint was not overwritten. [Final review](../artifacts/readiness-followup/2026-10-03T0343-final-review-attempt-1/review.json) records cleanup and final probe hashes. Initial browser runs preceded the later watchdog/cleanup hardening and source-hash recording; their export hashes were captured at startup, but runtime probe-source hashes were not. No source-hash attestation is retroactively claimed for them.

## Findings and precise classification

All **237** new raw failures are CDP `Fetch`, `HEAD`, HTTP **200**, `text/html`, `net::ERR_ABORTED`, `canceled=true`, with no blocked reason, from the same five-frame Next prefetch stack. All occur before final teardown. Relevant header allowlist, response status/MIME, IDs, CDP wall/monotonic timing, host timestamps, frames/loaders and explicit goto/Enter/Back/wait/teardown markers are retained. No request bodies, cookies, authorization headers or arbitrary full-header dumps are captured.

The exact accepted client chunk is `_next/static/chunks/722-23da7205354b4696.js`, SHA-256 `03d1890f093ba9f96342ae2a74eecc9dfaa4001a5a33403bbb02d23f0db01d58`. Zero-based stack locations `(30,40430)`, `(0,36221)`, `(30,78750)`, `(30,83104)`, `(30,83574)` map respectively to the fetch wrapper, `fetchRouteOnCacheMiss` HEAD, and prefetch-scheduler processing. Installed source `node_modules/next/dist/client/components/segment-cache/cache.js:1270–1321` explains the export redirect check: await HEAD, inspect status, then fetch the route-tree text file. Thus the follow-on request demonstrates that Next consumed the HEAD result. Speculative origin is evidenced by executable stack locations, rather than inferred from URL or missing RSC headers.

[scripts/lib/readiness-classification.mjs](../scripts/lib/readiness-classification.mjs) accepts only the pinned hash/stack, same-ID HEAD/200 response, matching frame/loader and ordered timestamps, local page path without query, non-teardown/nonblocked canceled Fetch, plus **exactly one** same-context `__next._tree.txt` GET starting within one second after that response and finishing with 200 `text/plain`. GET/document/data/asset failures, missing metadata, changed export or ambiguous attribution stay blocking. All raw events remain available.

This identifies **236 fulfilled speculative HEAD checks**. It does **not** identify an explicit JavaScript cancellation call or the Chromium subsystem issuing cancellation; deliberate AbortController cancellation is unproven. The narrowly nonblocking verdict rests on a completed header-only speculative purpose and subsequent successful data retrieval, not on a blanket claim that aborts are harmless. These new fields cannot retrospectively classify the older 180/50 failure records.

Selected examples:

- Control `1401349.54`: `/experience/2040/`, HEAD 200 `text/html`, failure during `selector-wait-pass`; corresponding tree request `1401349.58` completed 200. The raw HEAD-to-failure interval is about 9.65ms.
- Prelude `1401630.58`: `/`, same exact scheduler HEAD path, successful unique tree completion; raw lifecycle retained in the prelude JSONL.
- Matrix **unknown** `1402409.1545`: `/experience/`, started during `Enter-end`, response at CDP `10469388.399537`, cancellation at `10469388.410059` during destination selector wait. Tree requests `1402409.1549` and `1402409.1557` both complete 200 in the same loader within the predicate window. The HEAD is demonstrably speculative and returned headers, but unique follow-on attribution is missing, so it remains unknown/blocking. No broader predicate was introduced to turn this run green.

## Readiness and repair decision

Fresh 1990/768×900 control: text-grid wait **2302.89ms**. Original six-era × three-project 390px prelude: all 18 journeys pass, followed by first 1990/768 entry wait **250.95ms**. Full matrix: all waits pass; maximum text-grid wait **3039.66ms**. The exact visible-selector assertion remains **10,000ms**. At saved control/prelude entry snapshots, readyState is `complete`, machine mode `text`, overlay `mode-text`, and one scene canvas still exists.

The timeout observer in [readiness-evidence.mjs](../scripts/lib/readiness-evidence.mjs) saves bounded sanitized experience DOM, screenshot, URL/readyState, link presence/geometry/visibility, machine/overlay state, pending requests, console warnings/errors, performance metrics and host/browser/process snapshots. It then permits only a three-second late observation and rethrows the original failure. No timeout occurred here, so that timeout-only path was not exercised and no late-readiness result is claimed. Browser assertions, authored summaries/eight chapters, project-specific accessible names, Tab/Enter/Back, ≥44px targets and truthful real-404 checks remain unchanged from the accepted probe.

Source leads remain `ExperienceShell.tsx:205–225` (WebGL before URL sync), `:241–254` (warming), `:529–539` (scene mounts in text), and `ExperienceOverlay.tsx:937` (conditional text layer). They are not a reproduced cause. Console warnings are only the existing THREE.Clock deprecation (1/14/38 by attempt), with zero page errors and no recorded HTTP ≥400 traversal responses. Bounded resource snapshots do not establish conditions during the historical failure or prove resource exhaustion. Instrumentation may change timing; passing once does not close an intermittent failure.

Changes are isolated probe, evidence/classification helpers, offline classification CLI, nine classifier regressions, and this report. No product code repair or build was performed. The original routing probe and accepted repair remain unchanged. The final helper adds a four-minute workload watchdog and owned-process cleanup; no pre-existing service was touched.

## Commands and exits

Every browser and deterministic workload ran sequentially with `NODE_OPTIONS=--max-old-space-size=768`; tests use one worker. Exact argv and timestamps are in verification receipts.

| Command | Exit | Result |
|---|---:|---|
| `node scripts/readiness-followup-audit.mjs control` | 1 | Entry/route checks pass; raw strict request gate fails on 5 aborts |
| `node scripts/readiness-followup-audit.mjs prelude` | 1 | 18 journeys and next entry pass; strict gate fails on 54 aborts |
| `node scripts/readiness-followup-audit.mjs matrix` | 1 | 54/54 content/Back pass; strict gate fails on 178 aborts |
| `node scripts/classify-readiness.mjs <control attempt>` | 0 | 5 classified, zero unknown |
| `node scripts/classify-readiness.mjs <prelude attempt>` | 0 | 54 classified, zero unknown |
| `node scripts/classify-readiness.mjs <matrix attempt>` | 1 | 177 classified, one unknown; aggregate red |
| `node_modules/.bin/vitest run --maxWorkers=1 tests/readiness-classification.test.ts tests/preview-routing.test.ts tests/routing-stability.test.ts tests/text-version-links.test.tsx` | 0 | 30 tests / 4 files pass |
| Changed-file ESLint, first verification | 1 | One redundant `performance` global declaration; fixed |
| `node_modules/.bin/vitest run --maxWorkers=1 tests/readiness-classification.test.ts` | 0 | Final nine classifier regressions pass, including ambiguous attribution |
| Changed-file ESLint, second verification | 0 | All four new script/helper files and new test pass |
| `node --check scripts/readiness-followup-audit.mjs`; `node --check scripts/lib/readiness-evidence.mjs` | 0 each | Final syntax checks pass |
| `git diff --check` | 0 | Whitespace passes |

[Verification attempt 1](../artifacts/readiness-followup/2026-10-03T0339-verification-attempt-1/commands.json) and [attempt 2](../artifacts/readiness-followup/2026-10-03T0342-verification-attempt-2/commands.json) specify the exact classification paths and ESLint arguments. The initial default-sandbox read failed before execution, exit 1: `bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted`. Automatic scoped approval review allowed the local fallback commands. No rejection, guard bypass, budget workaround, or authorization/configuration change occurred.

## Acceptance and next decision

Accept the observability/classification milestone for review; **do not accept aggregate browser readiness or release readiness**. One ambiguous event remains blocking, the historical timeout cause is unresolved, and no intentionally invoked application cancellation is attested. Next decision: coordinator review of the conservative classification and, if another bounded task is authorized, add per-fetch correlation or matched HEAD/tree instrumentation before any further matrix. A future reproduced timeout should use the installed timeout capture before choosing a render-readiness repair. No additional flaky rerun was made.

Separate existing blockers remain unchanged: CSS gzip 34,054 >33,792 bytes, historical full ESLint/stylelint findings, CI audit gaps, content approvals, and real-device/GPU/screen-reader acceptance. Coverage here is synthetic headless Chromium/SwiftShader at 390/768/1440×900 CSS pixels only; no physical-device, hardware-GPU, screen-reader or deployment claim.

Close-out checkpoint **2026-10-03T03:47:00.402533+00:00**: all observed owned browser-tree PIDs are gone and port 4417 remains free. Six new-file `git diff --no-index --check /dev/null <file>` commands exited 1 because the files differ, with no whitespace diagnostics; a direct trailing-whitespace/final-newline check passes for all six. The first close-out receipt retains those exact exits, and [final close-out](../artifacts/readiness-followup/2026-10-03T0347-closeout-attempt-2/review.json) records the direct check. Final changes remain uncommitted.

## Coordinator acceptance

The actual Codex CLI 0.160.0 run started at **2026-10-03T03:30:46Z** and exited 0 at **03:47:10Z**, lasting **16m24s**, within the hard 20-minute limit. It requested `gpt-6.1-sol`, high effort, through existing ChatGPT Pro authorization and normal workspace-write/scoped automatic approval review. No provider-served model or effort metadata was exposed; no reroute event was observed. The default configuration SHA-256 was unchanged.

The CLI reported 1,699,391 input tokens, including 1,612,800 cached input tokens; 24,802 output tokens and 6,774 reasoning-output tokens were reported separately. The 12,000-output-token soft target was exceeded; it was not an enforced cap. There were 28 completed command items, below the soft 55-action budget. These counters do not establish a monetary charge or provider-model attestation. No additional model run was launched for review.

At **2026-10-03T03:49:52.981498+00:00**, the coordinator independently asserted the exact saved 54-case Cartesian matrix, successful intended-content and Back/Tab outcomes, preserved accessible names/44px targets, 10,000ms wait markers, captured request identity/timing/context, all three classification totals, and the two candidate tree completions for the one ambiguous matrix event. The report/network hashes and acceptance assertions are in the sibling `kc-readiness-evidence-20261003/coordinator-acceptance.json`. This was saved-evidence verification, not another browser run. The coordinator reran the final four focused test files: **31 tests passed**, including the added ambiguous-attribution regression; changed-file ESLint and whitespace checks passed. Product sources, the preview-server repair, and the original routing probe were unchanged.

The accepted milestone is the diagnostic capture and conservative classification tooling. The raw strict verdict remains red for every attempt; the matrix's narrow verdict also remains red because one event lacks unique attribution. The historical timeout and the timeout-only capture path remain unresolved/untested respectively. No browser or product fix is claimed. Runtime receipts, original failed checks, selected traces, and cleanup evidence remain preserved for the next decision.
