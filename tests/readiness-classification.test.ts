import { describe, expect, it } from 'vitest';
// @ts-expect-error The offline diagnostic helper is an intentionally plain JS module.
import { classifyFailure, clientChunk, clientChunkSha256 } from '../scripts/lib/readiness-classification.mjs';

// Reduced from control request 1401349.54; no fixture depends on ignored artifacts.
const requestId = 'head';
const response = { requestId, status: 200, mimeType: 'text/html', timestamp: 2, frameId: 'frame', loaderId: 'loader' };
const failure = { requestId, phase: 'selector-wait-pass', type: 'Fetch', errorText: 'net::ERR_ABORTED', canceled: true, timestamp: 3,
  request: { requestId, url: 'http://127.0.0.1:4417/experience/2040/', method: 'HEAD', timestamp: 1,
    frameId: 'frame', loaderId: 'loader', response,
    initiator: { type: 'script', stack: { callFrames: [[30, 40430], [0, 36221], [30, 78750], [30, 83104], [30, 83574]].map(([lineNumber, columnNumber]) => ({ url: `http://127.0.0.1:4417/${clientChunk}`, lineNumber, columnNumber })) } } } };
const events = [
  { event: 'request', requestId: 'tree', method: 'GET', frameId: 'frame', loaderId: 'loader', timestamp: 2.1, url: 'http://127.0.0.1:4417/experience/2040/__next._tree.txt?_rsc=test' },
  { event: 'response', requestId: 'tree', status: 200, mimeType: 'text/plain' },
  { event: 'finished', requestId: 'tree' }
];

describe('evidenced speculative HEAD classification', () => {
  it('recognizes a consumed prefetch HEAD only with its completed tree GET', () => {
    expect(classifyFailure(failure, events, clientChunkSha256).category).toBe('fulfilled-speculative-head');
  });
  it.each(['GET', 'missing-response', 'unknown-initiator', 'blocked', 'teardown', 'wrong-loader'])('retains %s failures', variant => {
    const changed = JSON.parse(JSON.stringify(failure));
    if (variant === 'GET') changed.request.method = 'GET';
    if (variant === 'missing-response') delete changed.request.response;
    if (variant === 'unknown-initiator') changed.request.initiator.stack.callFrames = [];
    if (variant === 'blocked') changed.blockedReason = 'other';
    if (variant === 'teardown') changed.phase = 'final-teardown-start';
    if (variant === 'wrong-loader') changed.request.loaderId = 'unrelated-loader';
    expect(classifyFailure(changed, events, clientChunkSha256).category).toBe('unknown-or-required-failure');
  });
  it('retains ambiguous same-route data attribution', () => {
    const duplicate = { ...events[0], requestId: 'second-tree', timestamp: 2.2 };
    expect(classifyFailure(failure, [...events, duplicate], clientChunkSha256).category).toBe('unknown-or-required-failure');
  });
  it('retains failures when the tree GET fails or the export hash differs', () => {
    expect(classifyFailure(failure, events.filter(event => event.event !== 'finished'), clientChunkSha256).category).toBe('unknown-or-required-failure');
    expect(classifyFailure(failure, events, 'different-build').category).toBe('unknown-or-required-failure');
  });
});
