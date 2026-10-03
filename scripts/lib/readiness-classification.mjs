// This predicate applies only to the accepted export's observed Next HEAD path.
// It never infers a purpose from a route URL or ERR_ABORTED alone.
export const clientChunk = '_next/static/chunks/722-23da7205354b4696.js';
export const clientChunkSha256 = '03d1890f093ba9f96342ae2a74eecc9dfaa4001a5a33403bbb02d23f0db01d58';
const expectedFrames = [[30, 40430], [0, 36221], [30, 78750], [30, 83104], [30, 83574]];

export function classifyFailure(failure, events, verifiedChunkHash) {
  const request = failure.request;
  const response = request?.response;
  const frames = request?.initiator?.stack?.callFrames;
  const unknown = { category: 'unknown-or-required-failure', requestId: failure.requestId, reason: 'Base predicate is unproven' };
  if (verifiedChunkHash !== clientChunkSha256 || !request || request.method !== 'HEAD' ||
      failure.type !== 'Fetch' || failure.errorText !== 'net::ERR_ABORTED' || failure.canceled !== true ||
      failure.blockedReason || typeof failure.phase !== 'string' || failure.phase.startsWith('final-teardown') ||
      response?.status !== 200 || response.mimeType !== 'text/html' ||
      response.requestId !== failure.requestId || request.requestId !== failure.requestId ||
      !request.frameId || !request.loaderId || response.frameId !== request.frameId || response.loaderId !== request.loaderId ||
      !(request.timestamp <= response.timestamp && response.timestamp <= failure.timestamp) ||
      request.initiator.type !== 'script' || frames?.length !== expectedFrames.length ||
      !frames.every((frame, index) => frame.url === `http://127.0.0.1:4417/${clientChunk}` && frame.lineNumber === expectedFrames[index][0] && frame.columnNumber === expectedFrames[index][1])) return unknown;
  const url = new URL(request.url);
  if (url.origin !== 'http://127.0.0.1:4417' || url.search || !url.pathname.endsWith('/')) return unknown;
  const nextTree = events.filter(event => event.event === 'request' && event.method === 'GET' &&
    event.frameId === request.frameId && event.loaderId === request.loaderId &&
    event.timestamp >= response.timestamp && event.timestamp <= response.timestamp + 1 &&
    new URL(event.url).origin === url.origin && new URL(event.url).pathname === `${url.pathname}__next._tree.txt`);
  if (nextTree.length !== 1) return { ...unknown, reason: `Expected one same-context completed tree request; found ${nextTree.length} candidates` };
  const tree = nextTree[0];
  const treeResponse = events.find(event => event.event === 'response' && event.requestId === tree.requestId);
  const finished = events.find(event => event.event === 'finished' && event.requestId === tree.requestId);
  if (treeResponse?.status !== 200 || treeResponse.mimeType !== 'text/plain' || !finished ||
      events.some(event => event.event === 'failed' && event.requestId === tree.requestId)) return unknown;
  return { category: 'fulfilled-speculative-head', requestId: failure.requestId, treeRequestId: tree.requestId,
    evidence: 'Pinned Next prefetch scheduler HEAD returned 200 and was consumed before its unique same-loader tree GET completed. CDP marks cancellation; the canceling subsystem is not identified.' };
}
