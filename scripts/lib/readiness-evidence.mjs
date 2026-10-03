/* global document, window, getComputedStyle */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const acceptedExport = '/home/cali/home/cali/project/kc-wt-routing-20261003/out';
const headerNames = new Set(['rsc', 'next-router-prefetch', 'next-router-segment-prefetch', 'purpose', 'sec-purpose', 'content-type']);
const headers = values => Object.fromEntries(Object.entries(values ?? {}).filter(([key]) => headerNames.has(key.toLowerCase())));
const bounded = (promise, ms = 3000) => { let timer; return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Observation deadline')), ms); })]).finally(() => clearTimeout(timer)); };

function manifest(root, relative = '') {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap(entry => {
    const name = path.join(relative, entry.name);
    return entry.isDirectory() ? manifest(root, name) : [[name, createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex')]];
  }).sort((a, b) => a[0].localeCompare(b[0]));
}
export function provenance(directory) {
  const roots = [process.cwd(), ...['routing-20261003', 'journey-20261003', 'integration'].map(suffix => `/home/cali/home/cali/project/kc-wt-${suffix}`)];
  const worktrees = roots.map(root => ({ root, head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), status: execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' }).trim() }));
  const files = manifest(acceptedExport);
  const original = manifest('/home/cali/home/cali/project/kc-wt-journey-20261003/out');
  const probeHashes = Object.fromEntries(['scripts/readiness-followup-audit.mjs', 'scripts/lib/readiness-evidence.mjs'].map(file => [file, createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  const receipt = { probeHashes, utc: new Date().toISOString(), acceptedExport, worktrees, files, exportIdentical: JSON.stringify(files) === JSON.stringify(original) };
  fs.writeFileSync(`${directory}/provenance.json`, JSON.stringify(receipt, null, 2));
  if (!receipt.exportIdentical || worktrees[1].head !== 'c0e142e3731dfaacf52cc03c56c2bcfd5d2985a3') throw new Error('Accepted export provenance mismatch');
}

export async function observe(page, browser, directory, report) {
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  const raw = fs.openSync(`${directory}/network.jsonl`, 'wx');
  const pending = new Map();
  const requests = new Map();
  let phase = 'setup';
  const stamp = () => ({ utc: new Date().toISOString(), hostMonotonicMs: performance.now(), phase, currentUrl: page.url() });
  const write = event => fs.writeSync(raw, `${JSON.stringify(event)}\n`);
  report.markers = [];
  report.cdpFailures = [];
  report.console = [];
  function mark(next, details = {}) { phase = next; const marker = { event: 'marker', ...stamp(), ...details }; report.markers.push(marker); write(marker); }
  cdp.on('Network.requestWillBeSent', e => {
    const event = { event: 'request', ...stamp(), requestId: e.requestId, timestamp: e.timestamp, wallTime: e.wallTime, url: e.request.url, method: e.request.method, headers: headers(e.request.headers), initiator: e.initiator, frameId: e.frameId, loaderId: e.loaderId, documentURL: e.documentURL, type: e.type, redirect: e.redirectResponse && { status: e.redirectResponse.status, mimeType: e.redirectResponse.mimeType } };
    requests.set(e.requestId, event); pending.set(e.requestId, event); write(event);
  });
  cdp.on('Network.requestWillBeSentExtraInfo', e => write({ event: 'request-extra', ...stamp(), requestId: e.requestId, headers: headers(e.headers) }));
  cdp.on('Network.responseReceived', e => {
    const response = { event: 'response', ...stamp(), requestId: e.requestId, timestamp: e.timestamp, type: e.type, frameId: e.frameId, loaderId: e.loaderId, url: e.response.url, status: e.response.status, mimeType: e.response.mimeType, headers: headers(e.response.headers), fromDiskCache: e.response.fromDiskCache, fromServiceWorker: e.response.fromServiceWorker };
    if (requests.has(e.requestId)) requests.get(e.requestId).response = response;
    write(response);
  });
  cdp.on('Network.loadingFinished', e => { pending.delete(e.requestId); write({ event: 'finished', ...stamp(), ...e }); });
  cdp.on('Network.loadingFailed', e => {
    pending.delete(e.requestId);
    const event = { event: 'failed', ...stamp(), ...e, request: requests.get(e.requestId) };
    report.cdpFailures.push(event); write(event);
  });
  cdp.on('Page.frameNavigated', e => write({ event: 'frameNavigated', ...stamp(), frame: { id: e.frame.id, parentId: e.frame.parentId, loaderId: e.frame.loaderId, url: e.frame.url } }));
  await cdp.send('Page.enable');
  page.on('console', message => {
    if (['warn', 'error'].includes(message.type()) && report.console.length < 100) report.console.push({ ...stamp(), type: message.type(), text: message.text().slice(0, 1200), location: message.location() });
  });
  function host() {
    const read = file => { try { return fs.readFileSync(file, 'utf8').slice(0, 4000); } catch (error) { return String(error); } };
    const pid = browser.process()?.pid;
    return { ...stamp(), loadavg: read('/proc/loadavg'), memory: read('/proc/meminfo'), memoryPressure: read('/proc/pressure/memory'), cpuPressure: read('/proc/pressure/cpu'), browserPid: pid, browserStatus: pid ? read(`/proc/${pid}/status`) : null, processes: execFileSync('ps', ['-eo', 'pid,ppid,rss,pcpu,comm'], { encoding: 'utf8' }).split('\n').filter(line => /chrom|node/.test(line)).slice(0, 60) };
  }
  report.hostStart = host();
  async function snapshot(label) {
    const result = { label, ...stamp(), pending: [...pending.values()], host: host() };
    try {
      result.metrics = await bounded(cdp.send('Performance.getMetrics'));
      result.dom = await bounded(page.evaluate(() => {
        const links = [...document.querySelectorAll('.text-mode__grid a')];
        const root = document.querySelector('.experience-root');
        const clone = root?.cloneNode(true);
        clone?.querySelectorAll('script, iframe, input, textarea').forEach(node => node.remove());
        return { url: window.location.href, readyState: document.readyState, performanceNow: performance.now(), rootMode: root?.getAttribute('data-mode'), overlayClass: document.querySelector('.experience-overlay')?.className, links: links.map(node => { const rect = node.getBoundingClientRect(); const style = getComputedStyle(node); return { href: node.getAttribute('href'), width: rect.width, height: rect.height, display: style.display, visibility: style.visibility }; }), canvasCount: document.querySelectorAll('canvas').length, html: clone?.outerHTML.slice(0, 160000), resources: performance.getEntriesByType('resource').slice(-40).map(entry => ({ name: entry.name, initiatorType: entry.initiatorType, startTime: entry.startTime, duration: entry.duration })) };
      }));
    } catch (error) { result.observationError = String(error); }
    try { await bounded(page.screenshot({ path: `${directory}/${label}.png` })); } catch (error) { result.screenshotError = String(error); }
    fs.writeFileSync(`${directory}/${label}.json`, JSON.stringify(result, null, 2));
    return result;
  }
  async function wait(selector) {
    mark('selector-wait-start', { selector, timeoutMs: 10000 });
    try { await page.waitForSelector(selector, { visible: true, timeout: 10000 }); mark('selector-wait-pass', { selector }); }
    catch (error) {
      mark('selector-wait-failed', { selector, error: String(error) });
      report.timeout = await snapshot('timeout');
      mark('post-failure-observation-start');
      const start = performance.now();
      try { await page.waitForSelector(selector, { visible: true, timeout: 3000 }); report.lateReadinessMs = performance.now() - start; } catch { report.lateReadinessMs = null; }
      report.postFailure = await snapshot('post-failure');
      throw error;
    }
  }
  return { mark, wait, snapshot, finish() { report.hostEnd = host(); fs.closeSync(raw); } };
}
