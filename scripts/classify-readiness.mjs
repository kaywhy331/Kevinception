import fs from 'node:fs';
import assert from 'node:assert/strict';
import { classifyFailure, clientChunk } from './lib/readiness-classification.mjs';
const directory = process.argv[2];
assert.ok(directory?.startsWith('artifacts/readiness-followup/'), 'Specify an immutable readiness attempt');
const report = JSON.parse(fs.readFileSync(`${directory}/report.json`, 'utf8'));
const events = fs.readFileSync(`${directory}/network.jsonl`, 'utf8').trim().split('\n').map(line => JSON.parse(line));
const provenance = JSON.parse(fs.readFileSync(`${directory}/provenance.json`, 'utf8'));
const hash = provenance.files.find(([name]) => name === clientChunk)?.[1];
const failures = report.cdpFailures.map(failure => classifyFailure(failure, events, hash));
const unknown = failures.filter(failure => failure.category !== 'fulfilled-speculative-head');
const httpFailures = events.filter(event => event.event === 'response' && event.status >= 400);
const result = { utc: new Date().toISOString(), mode: report.mode, rawStrictPassed: report.passed,
  rawFailures: failures.length, speculativeHead: failures.length - unknown.length, unknown: unknown.length,
  functionalPassed: report.functionalPassed, routeContractPassed: report.routeContractPassed, timeout: Boolean(report.timeout),
  httpFailures, failures,
  narrowlyClassifiedPassed: report.functionalPassed === true && report.routeContractPassed === true && !report.timeout &&
    !report.deadlineExceeded && !report.browserCloseError && report.pageErrors.length === 0 && unknown.length === 0 &&
    httpFailures.length === 0 && report.failedRequests.length === failures.length };
fs.writeFileSync(`${directory}/classification.json`, JSON.stringify(result, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ ...result, failures: undefined, httpFailures: httpFailures.length }));
process.exitCode = result.narrowlyClassifiedPassed ? 0 : 1;
