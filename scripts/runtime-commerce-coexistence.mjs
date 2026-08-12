import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const browserCandidates = [
  process.env.CHROME_PATH,
  process.env.CHROMIUM_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);
const playwrightCache = path.join(os.homedir(), '.cache', 'ms-playwright');
if (fs.existsSync(playwrightCache)) {
  for (const directory of fs.readdirSync(playwrightCache).sort().reverse()) {
    browserCandidates.push(
      path.join(playwrightCache, directory, 'chrome-linux64', 'chrome'),
      path.join(playwrightCache, directory, 'chrome-linux', 'chrome')
    );
  }
}
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));

if (!executablePath) throw new Error('No supported Chromium browser was found.');

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
const report = { generatedAt: new Date().toISOString(), browser: executablePath, base, assertions: [], consoleErrors: [], pageErrors: [], requestFailures: [] };

function assert(name, condition, detail = '') {
  report.assertions.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
}

page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => {
  const reason = request.failure()?.errorText ?? 'unknown';
  if (reason !== 'net::ERR_ABORTED') report.requestFailures.push(`${request.url()} :: ${reason}`);
});

try {
  await page.goto(`${base}/experience/?year=2010&view=interface`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('.interface-mode.is-visible', { timeout: 30000 });
  await page.waitForFunction(() => [...document.querySelectorAll('iframe')].some((frame) => frame.src.includes('/legacy/experience/2010/')), { timeout: 30000 });
  const kevazon = await page.waitForFrame((frame) => frame.url().includes('/legacy/experience/2010/'), { timeout: 30000 });
  await kevazon.waitForSelector('[data-kevazon]', { timeout: 30000 });

  const lifecycleStages = await kevazon.$$eval('[data-kz-flow-node]', (nodes) => nodes.map((node) => node.textContent?.trim()));
  assert('The dashboard exposes the full vendor-to-customer lifecycle', lifecycleStages.length === 8 && lifecycleStages[0]?.includes('Vendors') && lifecycleStages[7]?.includes('Customer'), lifecycleStages.join(' | '));

  await kevazon.click('[data-kz-flow-node="catalog"]');
  assert('A lifecycle stage exposes its representative operation', await kevazon.$eval('[data-kz-flow-title]', (node) => node.textContent?.includes('1.5M')));

  await kevazon.click('[data-kz-tab="orders"]');
  await kevazon.waitForSelector('[data-kz-panel="orders"].is-active');
  await kevazon.click('[data-kz-order-advance="ORD-10482"]');
  const progressed = await kevazon.$eval('[data-kz-order="ORD-10482"] .kz-status', (node) => node.textContent?.trim());
  assert('An order advances through the fulfillment workflow', progressed === 'Packed', progressed);

  await kevazon.type('[data-kz-search]', 'KV-225190');
  await kevazon.click('[data-kz-search-form] button[type="submit"]');
  await kevazon.waitForSelector('[data-kz-panel="catalog"].is-active');
  const catalogRows = await kevazon.$$eval('[data-kz-catalog] .kz-catalog-row', (rows) => rows.length);
  assert('Global search routes a matching SKU into the catalog', catalogRows === 1, `${catalogRows} matching rows`);

  await kevazon.click('[data-kz-tab="marketplaces"]');
  await kevazon.waitForSelector('[data-kz-panel="marketplaces"].is-active');
  await kevazon.click('[data-kz-channel-toggle]');
  const channels = await kevazon.$$eval('[data-kz-channel]', (nodes) => nodes.map((node) => node.textContent?.trim()));
  assert('Marketplace management exposes 20+ representative channels on demand', channels.length >= 20 && channels.some((channel) => channel?.includes('Amazon FBA')), `${channels.length} channels`);

  await kevazon.click('[data-kz-tab="warehouse"]');
  await kevazon.click('[data-kz-fba-confirm]');
  assert('FBA confirmation completes the inbound plan', await kevazon.$eval('[data-kz-fba-percent]', (node) => node.textContent === '100'));

  await kevazon.click('[data-kz-tab="reports"]');
  await kevazon.click('[data-kz-sync]');
  await kevazon.waitForFunction(() => document.querySelector('[data-kz-sync-log]')?.textContent?.includes('Purchasing, catalog, channels, orders, warehouse, and finance reconciled'), { timeout: 3000 });
  assert('The integration check records a cross-system receipt', true);

  await kevazon.click('[data-kz-archive]');
  await kevazon.waitForSelector('[data-kz-dialog="archive"][open]');
  await kevazon.click('[data-kz-recover]');
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('kevinception-v7');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.state?.artifacts?.['project-blueprint']?.discoveredYears?.includes('2010');
  });
  assert('Kevazon artifact recovery reaches the persistent experience store', true);

  await page.goto(`${base}/experience/?year=2030&view=interface`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => [...document.querySelectorAll('iframe')].some((frame) => frame.src.includes('/legacy/experience/2030/')), { timeout: 30000 });
  const nexus = await page.waitForFrame((frame) => frame.url().includes('/legacy/experience/2030/'), { timeout: 30000 });
  await nexus.waitForSelector('[data-era-enter]', { timeout: 30000 });
  await nexus.$eval('[data-era-enter]', (button) => button.click());
  await nexus.waitForSelector('[data-era-stage]:not([hidden])');
  await nexus.click('[data-nexus-preset="product-plan"]');
  await nexus.click('[data-nexus-form] button[type="submit"]');
  await nexus.waitForFunction(() => document.querySelector('[data-nexus-gate-state]')?.textContent === 'REVIEW REQUIRED', { timeout: 10000 });
  const roster = await nexus.$$eval('[data-nexus-agent]', (nodes) => nodes.map((node) => node.querySelector('b')?.textContent?.trim()));
  assert('The Coexistence roster contains explicit human and AI collaborators', roster.includes('Kevin · Human Lead') && roster.includes('Human Governor') && roster.includes('AI Researcher'), roster.join(' | '));
  await nexus.click('[data-nexus-approve]');
  assert('The consequential Nexus action requires and records human approval', await nexus.$eval('[data-nexus-gate-state]', (node) => node.textContent === 'APPROVED'));

  assert('The reviewed flows emit no console errors', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
  assert('The reviewed flows emit no page errors', report.pageErrors.length === 0, report.pageErrors.join(' | '));
  assert('The reviewed flows emit no unexpected request failures', report.requestFailures.length === 0, report.requestFailures.join(' | '));
} finally {
  await browser.close();
  fs.writeFileSync(path.join('docs', 'RUNTIME_COMMERCE_COEXISTENCE.json'), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify(report, null, 2));
