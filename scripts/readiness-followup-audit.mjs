/* global document, window */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { launchBrowser } from './lib/browser.mjs';
import { acceptedExport, provenance, observe } from './lib/readiness-evidence.mjs';

const before = false;
const mode = process.argv[2];
assert.ok(['control', 'prelude', 'matrix'].includes(mode), 'Specify control, prelude, or matrix');
const base = 'http://127.0.0.1:4417';
const directory = `artifacts/readiness-followup/${new Date().toISOString().replace(/[:.]/g, '-')}-${mode}`;
const projects = [
  { slug: 'kevinception', title: 'Kevinception', summary: 'An interactive portfolio that tells one verified body of work as six chapters of technology, each with its own interface, while keeping plain, accessible pages underneath.' },
  { slug: 'kevin-online', title: 'Kevin Online', summary: 'A functioning year-2000 computer experience inside a CRT, combining a Windows-like desktop, AOL-style online service, dial-up connection journey, K-Mail, Buddy List, browser, and a working Xanga destination.' },
  { slug: 'tokenpak', title: 'TokenPak', summary: 'A local-first product direction for packaging, routing, and reusing the context AI tools need, and for measuring what actually helped, across sessions, tools, and agents.' }
];
const report = { startedAt: new Date().toISOString(), scope: 'Local synthetic headless Chromium, SwiftShader; no physical-device, hardware-GPU, or screen-reader coverage.', before, requests: [], failedRequests: [], pageErrors: [], routes: [], cases: [] };
fs.mkdirSync(directory, { recursive: true });
provenance(directory);
let evidence;
let server;
let browser;
let page;
let deadline;

async function tabTo(slug) {
  for (let tabs = 0; tabs < 160; tabs++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(target => document.activeElement?.matches('.text-mode__grid a') && new URL(document.activeElement.href).pathname === `/work/${target}/`, slug)) return tabs + 1;
  }
  throw new Error(`Tab did not reach ${slug}`);
}

try {
  deadline = setTimeout(() => {
    report.deadlineExceeded = true;
    evidence?.mark('workload-deadline');
    void browser?.close().catch(() => browser.process()?.kill('SIGKILL'));
    server?.kill('SIGTERM');
  }, 240000);
  // Refuse to touch an existing owner's server or silently choose another port.
  const probe = net.createServer();
  await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(4417, '127.0.0.1', resolve); });
  await new Promise(resolve => probe.close(resolve));
  server = spawn(process.execPath, ['scripts/serve.mjs', acceptedExport, '4417'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  server.stdout.on('data', data => { serverOutput += data; });
  server.stderr.on('data', data => { serverOutput += data; });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview did not start')), 5000);
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited ${code}: ${serverOutput}`)); });
    server.stdout.on('data', () => {
      if (serverOutput.includes('using')) { clearTimeout(timer); reject(new Error(serverOutput)); }
      if (serverOutput.includes(base)) { clearTimeout(timer); resolve(); }
    });
  });
  report.serverOutput = serverOutput;
  // Record document and exported client-navigation responses independently of DOM assertions.
  for (const route of ['/work/kevinception', '/work/kevinception/', '/work/kevinception/index.txt', '/work/kevinception/__next._full.txt', '/work/does-not-exist', '/work/does-not-exist/', '/missing.txt']) {
    const response = await fetch(base + route);
    const body = await response.text();
    report.routes.push({ route, status: response.status, contentType: response.headers.get('content-type'), lostEra: body.includes('class="lost-era"'), caseStudy: body.includes('class="case-study"'), bytes: body.length });
  }
  ({ browser, executablePath: report.browser } = await launchBrowser());
  page = await browser.newPage();
  page.setDefaultTimeout(10000);
  evidence = await observe(page, browser, directory, report);
  page.on('response', response => {
    const request = response.request();
    if (request.isNavigationRequest() || /\/work\//.test(response.url())) report.requests.push({ url: response.url(), status: response.status(), type: request.resourceType(), contentType: response.headers()['content-type'], rsc: request.headers().rsc });
  });
  page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText, type: request.resourceType(), navigation: request.isNavigationRequest(), rsc: request.headers().rsc, routerPrefetch: request.headers()['next-router-prefetch'], purpose: request.headers().purpose, secPurpose: request.headers()['sec-purpose'] }));
  page.on('pageerror', error => report.pageErrors.push(String(error)));
  matrix: for (const width of mode === 'control' ? [768] : mode === 'prelude' ? [390, 768] : [390, 768, 1440]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    for (const era of ['1990', '2000', '2010', '2020', '2030', '2040']) {
      const source = `${base}/experience/${era}/?view=text`;
      evidence.mark('goto-start', { width, era, source });
      const response = await page.goto(source, { waitUntil: 'domcontentloaded', timeout: 15000 });
      evidence.mark('goto-end', { status: response.status() });
      assert.equal(response.status(), 200);
      await evidence.wait('.text-mode__grid a');
      const links = await page.$$eval('.text-mode__grid a', nodes => nodes.map(node => ({
        label: node.getAttribute('aria-label'), text: node.textContent.trim(), title: node.closest('section').querySelector('h3').textContent.trim(),
        href: new URL(node.href).pathname, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height
      })));
      assert.equal(links.length, 3);
      assert.equal(new Set(links.map(link => link.label)).size, 3);
      links.forEach((link, index) => {
        assert.equal(link.title, projects[index].title);
        assert.equal(link.href, `/work/${projects[index].slug}/`);
        assert.equal(link.label, `Open case study: ${projects[index].title}`);
        assert.ok(link.label.includes(link.text));
        assert.ok(link.width >= 44 && link.height >= 44, `Target ${link.width}x${link.height}`);
      });
      if (mode === 'control' || (mode === 'prelude' && width === 768)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        report.entrySnapshot = await evidence.snapshot('entry');
        report.entryPassed = true;
        break matrix;
      }
      for (const project of before ? projects.slice(0, 1) : projects) {
        const entry = { width, era, project: project.slug, source, links };
        report.cases.push(entry);
        entry.tabs = await tabTo(project.slug);
        evidence.mark('Enter-start', { project: project.slug });
        await page.keyboard.press('Enter');
        evidence.mark('Enter-end');
        await page.waitForFunction(() => !window.location.pathname.startsWith('/experience/'));
        await evidence.wait('.case-study__hero h1, .lost-era h1');
        entry.destination = page.url();
        entry.heading = await page.$eval('h1', node => node.textContent.trim());
        entry.lostEra = !!(await page.$('.lost-era'));
        entry.summary = await page.$eval('.case-study__hero .lead, .lost-era h1 + p', node => node.textContent.trim());
        try {
          assert.equal(new URL(entry.destination).pathname.replace(/\/$/, ''), `/work/${project.slug}`);
          assert.equal(entry.heading, project.title, 'Intended case-study heading');
          assert.equal(entry.summary, project.summary, 'Intended project content');
          assert.equal(entry.lostEra, false, 'No lost-era fallback');
          assert.equal(await page.$$eval('.case-study [data-case-chapter]', nodes => nodes.length), 8);
          entry.destinationPassed = true;
        } catch (error) {
          entry.destinationPassed = false;
          entry.error = String(error);
          if (report.cases.length === 1) await page.screenshot({ path: `${directory}/${before ? 'before' : 'after'}-destination.png`, fullPage: true });
        }
        evidence.mark('Back-start');
        await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 });
        evidence.mark('Back-end');
        await evidence.wait('.text-mode__grid a');
        assert.equal(page.url(), source, 'Back restores original era and text query');
        entry.backTabs = await tabTo(project.slug);
        entry.backPassed = true;
        console.log(`${entry.destinationPassed ? 'PASS' : 'FAIL'} ${era} ${width}px ${project.title}; Back/Tab PASS`);
      }
    }
  }
  assert.equal(report.cases.length, mode === 'control' ? 0 : mode === 'prelude' ? 18 : 54);
  assert.ok(report.cases.every(entry => entry.destinationPassed && entry.backPassed), 'Every keyboard traversal reaches intended content and returns');
  report.functionalPassed = true;
  for (const route of report.routes) {
    const missing = route.route.includes('does-not-exist') || route.route === '/missing.txt';
    assert.equal(route.status, missing ? 404 : 200, `Truthful route status: ${route.route}`);
    if (missing) assert.equal(route.lostEra, true, 'Missing routes retain the authored 404');
    else if (!route.route.endsWith('.txt')) { assert.equal(route.caseStudy, true); assert.equal(route.lostEra, false); }
    else assert.equal(route.contentType, 'text/plain; charset=utf-8');
  }
  report.routeContractPassed = true;
  assert.deepEqual(report.pageErrors, [], 'No browser page errors');
  assert.deepEqual(report.failedRequests, [], 'No failed browser requests');
  assert.ok(report.requests.every(request => request.status < 400), 'No HTTP errors during traversals');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.error = String(error);
  report.currentUrl = page?.url();
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  evidence?.mark('final-teardown-start');
  try { if (browser) await browser.close(); } catch (error) { report.browserCloseError = String(error); browser.process()?.kill('SIGKILL'); }
  finally {
    if (server && server.exitCode === null) {
      const stopped = once(server, 'exit');
      const killTimer = setTimeout(() => server.kill('SIGKILL'), 5000);
      server.kill('SIGTERM');
      await stopped;
      clearTimeout(killTimer);
    }
    evidence?.mark('final-teardown-end');
    evidence?.finish();
  }
  report.finishedAt = new Date().toISOString();
  const output = `${directory}/report.json`;
  report.mode = mode;
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ passed: report.passed, functionalPassed: report.functionalPassed, routeContractPassed: report.routeContractPassed, traversals: report.cases.length, failures: report.cases.filter(entry => !entry.destinationPassed).length, failedRequests: report.failedRequests.length, pageErrors: report.pageErrors.length, error: report.error?.split('\n')[0], output }));
}
