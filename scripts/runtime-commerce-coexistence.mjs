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
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

const report = {
  generatedAt: new Date().toISOString(),
  browser: executablePath,
  base,
  assertions: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: []
};

function assert(name, condition, detail = '') {
  report.assertions.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
}

page.on('console', (message) => {
  if (message.type() === 'error') report.consoleErrors.push(message.text());
});
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => {
  const reason = request.failure()?.errorText ?? 'unknown';
  if (reason !== 'net::ERR_ABORTED') report.requestFailures.push(`${request.url()} :: ${reason}`);
});

async function commerceFrame() {
  await page.waitForSelector('.interface-mode.is-visible', { timeout: 30000 });
  const frame = await page.waitForFrame((candidate) => candidate.url().includes('/legacy/experience/2010/') && !candidate.detached, { timeout: 30000 });
  await frame.waitForSelector('[data-kevazon]', { timeout: 30000 });
  return frame;
}

async function waitForModule(frame, module) {
  await frame.waitForFunction((id) => {
    const active = document.querySelector(`[data-kz-tab="${id}"]`);
    return active?.classList.contains('is-active') && active.getAttribute('aria-current') === 'page' && document.querySelector('[data-kz-workspace] .kz-page-header h1');
  }, { timeout: 10000 }, module);
}

async function openModule(frame, module) {
  await frame.click(`[data-kz-tab="${module}"]`);
  await waitForModule(frame, module);
  await page.waitForFunction((id) => new URL(window.location.href).searchParams.get('module') === id, { timeout: 10000 }, module);
}

async function commerceState(frame) {
  return frame.evaluate(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v4') || 'null'));
}

async function setDialogValue(frame, selector, value) {
  await frame.$eval(selector, (node, nextValue) => {
    node.value = String(nextValue);
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

try {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.evaluate(() => {
    localStorage.removeItem('stealstreet-commerce-os-v4');
    localStorage.removeItem('kevinception-v7');
  });

  await page.goto(`${base}/experience/?year=2010&module=dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  let commerce = await commerceFrame();
  await waitForModule(commerce, 'dashboard');

  assert('The direct dashboard module URL opens the Commerce interface', new URL(page.url()).searchParams.get('module') === 'dashboard');
  assert('The reconstructed product is branded StealStreet Commerce OS', await commerce.$eval('.kz-brand-block', (node) => node.textContent.includes('StealStreet') && node.textContent.includes('Commerce OS') && node.textContent.includes('Co-founder')));
  assert('The shell exposes exactly 12 working modules', (await commerce.$$('[data-kz-tab]')).length === 12);
  assert('The dashboard presents the full eight-stage operating flow', await commerce.$$eval('.kz-flow button', (nodes) => nodes.length === 8 && nodes[0].textContent.includes('Vendors') && nodes[7].textContent.includes('Customer')));
  assert('The dashboard includes an actionable company homebase', await commerce.$eval('.kz-company-hub', (node) => node.textContent.includes('Company Announcements') && node.textContent.includes('My Projects & Tasks') && node.textContent.includes('Employee Status') && node.querySelectorAll('button').length >= 3));

  const moduleHeadings = {
    dashboard: 'Operations Dashboard',
    orders: 'Orders',
    'purchase-orders': 'Purchase Orders',
    catalog: 'Catalog · 1.5M Records',
    inventory: 'Inventory',
    marketplaces: 'Marketplaces · 20+',
    vendors: 'Vendors',
    'customer-service': 'Customer Service',
    warehouse: 'Warehouse',
    returns: 'Returns',
    reports: 'Reports & Intelligence',
    settings: 'Settings / Administration'
  };
  for (const [module, heading] of Object.entries(moduleHeadings)) {
    await openModule(commerce, module);
    const renderedHeading = await commerce.$eval('[data-kz-workspace] .kz-page-header h1', (node) => node.textContent.trim());
    assert(`${heading} renders from sidebar navigation`, renderedHeading === heading, renderedHeading);
  }

  // Start a fresh history pair so Back/Forward exercise adjacent modules.
  await page.goto(`${base}/experience/?year=2010&module=dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  commerce = await commerceFrame();
  await waitForModule(commerce, 'dashboard');
  await openModule(commerce, 'orders');
  await page.goBack();
  await waitForModule(commerce, 'dashboard');
  assert('Browser Back restores the previous Commerce module', new URL(page.url()).searchParams.get('module') === 'dashboard');
  await page.goForward();
  await waitForModule(commerce, 'orders');
  assert('Browser Forward restores the next Commerce module', new URL(page.url()).searchParams.get('module') === 'orders');

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
  commerce = await commerceFrame();
  await waitForModule(commerce, 'orders');
  assert('Refreshing preserves the active Commerce module', new URL(page.url()).searchParams.get('module') === 'orders');

  const poTab = await commerce.$('[data-kz-tab="purchase-orders"]');
  await poTab.focus();
  await poTab.press('Enter');
  await waitForModule(commerce, 'purchase-orders');
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('module') === 'purchase-orders');
  assert('Sidebar modules support native keyboard activation', await commerce.$eval('[data-kz-tab="purchase-orders"]', (node) => node === document.activeElement || node.getAttribute('aria-current') === 'page'));

  await commerce.type('#kz-search', 'Wayfair');
  await commerce.click('[data-global-search] button[type="submit"]');
  await waitForModule(commerce, 'marketplaces');
  assert('Global search routes a marketplace match to its inspector', await commerce.$eval('.kz-inspector h3', (node) => node.textContent === 'Wayfair'));

  await openModule(commerce, 'purchase-orders');
  const beforeReceipt = await commerceState(commerce);
  await commerce.click('[data-row-id="PO-7814"] [data-action="receive-po-form"]');
  await commerce.waitForSelector('[data-dialog="record"][open] [data-action="submit-receive-po"]');
  await setDialogValue(commerce, '[data-dialog="record"][open] input[name="quantity"]', 10);
  await setDialogValue(commerce, '[data-dialog="record"][open] input[name="damaged"]', 1);
  await commerce.click('[data-dialog="record"][open] [data-action="submit-receive-po"]');
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v4')).purchaseOrders.find((item) => item.id === 'PO-7814').received === 10);
  const afterReceipt = await commerceState(commerce);
  const beforeReceiptInventory = beforeReceipt.inventory.find((item) => item.sku === 'KV-740204');
  const afterReceiptInventory = afterReceipt.inventory.find((item) => item.sku === 'KV-740204');
  assert('Receiving a PO updates its received quantity and state', afterReceipt.purchaseOrders.find((item) => item.id === 'PO-7814').status === 'Partial');
  assert('Receiving a PO updates available and incoming inventory', afterReceiptInventory.onHand === beforeReceiptInventory.onHand + 9 && afterReceiptInventory.incoming === beforeReceiptInventory.incoming - 10);
  assert('Receiving a PO closes or advances linked warehouse work', afterReceipt.warehouseTasks.find((item) => item.record === 'PO-7814' && item.type === 'Receiving').status === 'Partial' && afterReceipt.warehouseTasks.some((item) => item.record === 'PO-7814' && item.type === 'Putaway'));
  assert('Receiving a PO creates an audit receipt', afterReceipt.audit.some((item) => item.module === 'Purchase Orders' && item.record === 'PO-7814' && item.action === 'Received units'));

  await openModule(commerce, 'orders');
  for (const expectedStatus of ['Ready to Pick', 'Picked', 'Packed', 'Shipped']) {
    await commerce.click('[data-row-id="ORD-10465"] [data-action="advance-order"]');
    await commerce.waitForFunction((status) => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v4')).orders.find((item) => item.id === 'ORD-10465').status === status, {}, expectedStatus);
  }
  const afterShipment = await commerceState(commerce);
  const shippedOrder = afterShipment.orders.find((item) => item.id === 'ORD-10465');
  const shippedCase = afterShipment.cases.find((item) => item.orderId === 'ORD-10465');
  assert('Order actions advance from exception through shipment', shippedOrder.status === 'Shipped' && shippedOrder.tracking.startsWith('1Z8042'));
  assert('Shipping closes linked physical warehouse work', afterShipment.warehouseTasks.some((item) => item.record === 'ORD-10465' && item.type === 'Shipments' && item.status === 'Complete'));
  assert('Shipping updates the marketplace connection', afterShipment.marketplaces.find((item) => item.name === 'Walmart').orderSync === 'Current');
  assert('Shipping updates the customer-service timeline and tracking', shippedCase.tracking === shippedOrder.tracking && shippedCase.timeline.some((item) => item.includes('Shipment posted')));

  const beforeCatalogFix = afterShipment.marketplaces.reduce((total, item) => total + item.errors, 0);
  await openModule(commerce, 'catalog');
  await commerce.click('[data-row-id="KV-820118"] [data-action="fix-listing"]');
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v4')).catalog.find((item) => item.sku === 'KV-820118').health === 'Healthy');
  const afterCatalogFix = await commerceState(commerce);
  const afterChannelErrors = afterCatalogFix.marketplaces.reduce((total, item) => total + item.errors, 0);
  assert('Fix Listing resolves catalog data health and mappings', afterCatalogFix.catalog.find((item) => item.sku === 'KV-820118').mappings === '9 / 9');
  assert('Fix Listing updates connected marketplace health', afterChannelErrors < beforeCatalogFix, `${beforeCatalogFix} → ${afterChannelErrors}`);
  await openModule(commerce, 'dashboard');
  const renderedChannelExceptions = await commerce.$$eval('.kz-summary-strip > div', (nodes) => nodes.find((node) => node.querySelector('span')?.textContent === 'Channel Exceptions')?.querySelector('b')?.textContent);
  assert('Dashboard exception counts recalculate from connected state', Number(renderedChannelExceptions) === afterChannelErrors, renderedChannelExceptions);

  await openModule(commerce, 'returns');
  const beforeRestock = (await commerceState(commerce)).inventory.find((item) => item.sku === 'KV-510046').onHand;
  await commerce.click('[data-row-id="RMA-4001"] [data-action="return-restock"]');
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v4')).returns.find((item) => item.id === 'RMA-4001').status === 'Completed');
  const afterRestock = await commerceState(commerce);
  assert('Restocking a return increments inventory', afterRestock.inventory.find((item) => item.sku === 'KV-510046').onHand === beforeRestock + 1);
  assert('Restocking a return updates its linked order timeline', afterRestock.orders.find((item) => item.id === 'ORD-10402').timeline.some((item) => item.includes('RMA-4001 restocked')));
  assert('Restocking a return creates an audit entry', afterRestock.audit.some((item) => item.action === 'Restocked return' && item.record === 'RMA-4001'));

  await openModule(commerce, 'warehouse');
  for (const tab of ['Receiving', 'Putaway', 'Picking', 'Packing', 'Shipments', 'Amazon FBA', 'Exceptions']) {
    await commerce.click(`[data-subtab="warehouse"][data-value="${tab}"]`);
    await commerce.waitForFunction((name) => document.querySelector(`[data-subtab="warehouse"][data-value="${name}"]`)?.getAttribute('aria-selected') === 'true', {}, tab);
    assert(`Warehouse ${tab} tab renders`, (await commerce.$$('[data-kz-workspace] .kz-table tbody tr')).length >= 1);
  }
  await commerce.click('[data-subtab="warehouse"][data-value="Amazon FBA"]');
  await commerce.waitForSelector('[data-row-id="WH-F-501"] [data-action="warehouse-complete"]');
  await commerce.click('[data-row-id="WH-F-501"] [data-action="warehouse-complete"]');
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v4')).warehouseTasks.find((item) => item.id === 'WH-F-501').status === 'Complete');
  const afterFba = await commerceState(commerce);
  assert('Confirm Carton Labels completes the FBA workflow', afterFba.warehouseTasks.find((item) => item.id === 'WH-F-501').label === 'Confirmed');

  await openModule(commerce, 'reports');
  for (const tab of ['Inventory', 'Sales Trends', 'Product Trajectory', 'Marketplace Health', 'Finance', 'Customer Service', 'Warehouse']) {
    await commerce.click(`[data-subtab="reports"][data-value="${tab}"]`);
    await commerce.waitForFunction((name) => document.querySelector(`[data-subtab="reports"][data-value="${name}"]`)?.getAttribute('aria-selected') === 'true', {}, tab);
    assert(`Reports ${tab} tab renders chart and metrics`, await commerce.$eval('[data-kz-workspace]', (node) => Boolean(node.querySelector('.kz-report-chart') && node.querySelector('.kz-table'))));
  }

  await openModule(commerce, 'settings');
  const settingsTabs = ['Users & Roles', 'Integrations', 'Warehouses', 'Shipping', 'Marketplace Rules', 'Automation', 'Notifications', 'Audit History', 'Demo Controls'];
  for (const tab of settingsTabs) {
    await commerce.click(`[data-subtab="settings"][data-value="${tab}"]`);
    await commerce.waitForFunction((name) => document.querySelector(`[data-subtab="settings"][data-value="${name}"]`)?.getAttribute('aria-selected') === 'true', {}, tab);
    assert(`Settings ${tab} tab renders`, await commerce.$eval('[data-kz-workspace] .kz-panel', (node) => node.textContent.trim().length > 0));
  }
  await commerce.click('[data-subtab="settings"][data-value="Automation"]');
  const automationBefore = (await commerceState(commerce)).automation.find((item) => item.id === 'AUTO-01').enabled;
  await commerce.click('[data-action="toggle-automation"][data-record-id="AUTO-01"]');
  const automationAfter = (await commerceState(commerce)).automation.find((item) => item.id === 'AUTO-01').enabled;
  assert('Automation switches persist local demo state', automationAfter !== automationBefore);

  await commerce.click('[data-subtab="settings"][data-value="Demo Controls"]');
  await commerce.click('[data-action="reset-form"]');
  await commerce.waitForSelector('[data-dialog="record"][open] [data-action="confirm-reset"]');
  await commerce.click('[data-dialog="record"][open] [data-action="confirm-reset"]');
  await waitForModule(commerce, 'dashboard');
  const resetState = await commerceState(commerce);
  assert('Reset Demo Data restores orders, POs, listings, returns, warehouse, and automation', resetState.orders.find((item) => item.id === 'ORD-10465').status === 'Exception' && resetState.purchaseOrders.find((item) => item.id === 'PO-7814').received === 0 && resetState.catalog.find((item) => item.sku === 'KV-820118').health === 'Rejected' && resetState.returns.find((item) => item.id === 'RMA-4001').status === 'Inspection' && resetState.warehouseTasks.find((item) => item.id === 'WH-F-501').status === 'Carton Labels' && resetState.automation.find((item) => item.id === 'AUTO-01').enabled);
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('module') === 'dashboard');

  await commerce.click('[data-action="archive"]');
  await commerce.waitForSelector('[data-dialog="archive"][open]');
  await commerce.click('[data-action="recover"]');
  await page.waitForFunction(() => {
    const parsed = JSON.parse(localStorage.getItem('kevinception-v7') || 'null');
    return parsed?.state?.artifacts?.['project-blueprint']?.discoveredYears?.includes('2010');
  });
  assert('Archive recovery reaches the persistent Kevinception artifact store', true);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
  commerce = await commerceFrame();
  await waitForModule(commerce, 'dashboard');
  const overflow = await page.evaluate(() => ({ outer: document.documentElement.scrollWidth - window.innerWidth }));
  const commerceOverflow = await commerce.evaluate(() => ({ inner: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  assert('The Commerce shell contains content without narrow-screen overflow', overflow.outer <= 1 && commerceOverflow.inner <= 1, JSON.stringify({ ...overflow, ...commerceOverflow }));

  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(`${base}/experience/?year=2030&view=interface`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const nexus = await page.waitForFrame((frame) => frame.url().includes('/legacy/experience/2030/'), { timeout: 30000 });
  await nexus.waitForSelector('[data-era-enter]', { timeout: 30000 });
  await nexus.$eval('[data-era-enter]', (button) => button.click());
  await nexus.waitForSelector('[data-era-stage]:not([hidden])');
  await nexus.click('[data-nexus-preset="product-plan"]');
  await nexus.click('[data-nexus-form] button[type="submit"]');
  await nexus.waitForFunction(() => document.querySelector('[data-nexus-gate-state]')?.textContent === 'REVIEW REQUIRED', { timeout: 10000 });
  const roster = await nexus.$$eval('[data-nexus-agent]', (nodes) => nodes.map((node) => node.querySelector('b')?.textContent?.trim()));
  assert('The Coexistence roster retains explicit human and AI collaborators', roster.includes('Kevin · Human Lead') && roster.includes('Human Governor') && roster.includes('AI Researcher'), roster.join(' | '));
  await nexus.click('[data-nexus-approve]');
  assert('A consequential Nexus action still records human approval', await nexus.$eval('[data-nexus-gate-state]', (node) => node.textContent === 'APPROVED'));

  assert('The reviewed flows emit no console errors', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
  assert('The reviewed flows emit no page errors', report.pageErrors.length === 0, report.pageErrors.join(' | '));
  assert('The reviewed flows emit no unexpected request failures', report.requestFailures.length === 0, report.requestFailures.join(' | '));
} finally {
  await browser.close();
  fs.writeFileSync(path.join('docs', 'RUNTIME_COMMERCE_COEXISTENCE.json'), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify(report, null, 2));
