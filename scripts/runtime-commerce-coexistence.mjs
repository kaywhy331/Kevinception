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
let page = await browser.newPage();
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

async function clickPageButton(label) {
  const clicked = await page.$$eval('button', (buttons, expected) => {
    const button = buttons.find((candidate) => candidate.textContent?.trim().includes(expected) && !candidate.disabled);
    button?.click();
    return Boolean(button);
  }, label);
  if (!clicked) throw new Error(`Could not find enabled page button containing “${label}”.`);
}

async function finishCoexistenceExchange() {
  for (let beat = 0; beat < 4; beat += 1) {
    const before = await page.$$eval('.coexistence-exchange li', (nodes) => nodes.length);
    const advanced = await page.$eval('.coexistence-reply', (button) => {
      if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
      button.click();
      return true;
    }).catch(() => false);
    if (!advanced) throw new Error(`Could not advance Co-Existence exchange from beat ${before}.`);
    await page.waitForFunction((count) => document.querySelectorAll('.coexistence-exchange li').length > count, {}, before);
  }
}

async function traverseCommerceHistory(delta, expectedModule) {
  await page.evaluate((step) => window.history.go(step), delta);
  await page.waitForFunction((module) => {
    const location = new URL(window.location.href);
    return location.searchParams.get('module') === module
      && document.querySelector('.interface-mode')?.classList.contains('is-visible');
  }, { timeout: 30000 }, expectedModule);
}

function observePage(target) {
  target.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
  });
  target.on('pageerror', (error) => report.pageErrors.push(String(error)));
  target.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? 'unknown';
    if (reason !== 'net::ERR_ABORTED') report.requestFailures.push(`${request.url()} :: ${reason}`);
  });
}

observePage(page);

async function commerceFrame() {
  await page.waitForSelector('.interface-mode.is-visible', { timeout: 30000 });
  const frame = await page.waitForFrame((candidate) => candidate.url().includes('/legacy/experience/2010/') && !candidate.detached, { timeout: 30000 });
  await frame.waitForSelector('[data-kevazon]', { timeout: 30000 });
  return frame;
}

async function waitForModule(frame, module) {
  const deadline = Date.now() + 10000;
  let observed = null;
  while (Date.now() < deadline) {
    observed = await frame.evaluate((id) => {
      const active = document.querySelector(`[data-kz-tab="${id}"]`);
      return {
        active: active?.classList.contains('is-active') ?? false,
        current: active?.getAttribute('aria-current') ?? null,
        heading: document.querySelector('[data-kz-workspace] .kz-page-header h1')?.textContent?.trim() ?? null
      };
    }, module);
    if (observed.active && observed.current === 'page' && observed.heading) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for Commerce module ${module}: ${JSON.stringify(observed)}`);
}

async function openModule(frame, module) {
  await frame.click(`[data-kz-tab="${module}"]`);
  await waitForModule(frame, module);
  await page.waitForFunction((id) => new URL(window.location.href).searchParams.get('module') === id, { timeout: 10000 }, module);
}

async function commerceState(frame) {
  return frame.evaluate(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7') || 'null'));
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
    localStorage.removeItem('stealstreet-commerce-os-v5');
    localStorage.removeItem('stealstreet-commerce-os-v6');
    localStorage.removeItem('stealstreet-commerce-os-v7');
    localStorage.removeItem('kevinception-v7');
  });

  await page.goto(`${base}/experience/?year=2010&module=dashboard`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  let commerce = await commerceFrame();
  await waitForModule(commerce, 'dashboard');

  assert('The direct dashboard module URL opens the Commerce interface', new URL(page.url()).searchParams.get('module') === 'dashboard');
  assert('The desktop sidebar attribution block has been removed', await commerce.$eval('.kz-sidebar', (node) => !node.querySelector('.kz-brand-block') && !node.textContent.includes('Built in-house by Kevin')));
  assert('The active Commerce user is the visiting time traveler', await commerce.$eval('[data-action="user-menu"]', (node) => node.textContent.includes('YOU (Time Traveler)')));
  assert('The shell exposes exactly 13 working modules', (await commerce.$$('[data-kz-tab]')).length === 13);
  assert('The dashboard presents the full eight-stage operating flow', await commerce.$$eval('.kz-flow button', (nodes) => nodes.length === 8 && nodes[0].textContent.includes('Vendors') && nodes[7].textContent.includes('Customer')));
  assert('The dashboard presents a structured exception queue and verified scale ledger', await commerce.$eval('.kz-dashboard', (node) => Boolean(node.querySelector('.kz-exception-table') && node.querySelector('.kz-scale-ledger'))));
  assert('The embedded dashboard removes duplicate era chrome', await commerce.evaluate(() => getComputedStyle(document.querySelector('.kz-era-bar')).display === 'none'));
  assert('The canonical dashboard URL and document title identify the active module', new URL(page.url()).searchParams.get('module') === 'dashboard' && (await page.title()).startsWith('Operations Dashboard — 2010 StealStreet Commerce OS'));
  const desktopGeometry = await commerce.evaluate(() => {
    const flow = document.querySelector('.kz-flow');
    const dashboard = document.querySelector('.kz-dashboard');
    const buttons = [...document.querySelectorAll('.kz-flow button')];
    return {
      flowFits: buttons.every((button) => button.getBoundingClientRect().right <= flow.getBoundingClientRect().right + 1),
      dashboardFitsViewport: dashboard.getBoundingClientRect().bottom <= document.documentElement.clientHeight + 1,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    };
  });
  assert('The desktop command center fits its viewport without clipping', desktopGeometry.flowFits && desktopGeometry.dashboardFitsViewport && desktopGeometry.bodyWidth <= desktopGeometry.viewportWidth + 1, JSON.stringify(desktopGeometry));
  assert('The dashboard stays focused on operations instead of duplicating the company intranet', await commerce.$eval('.kz-dashboard', (node) => Boolean(node.querySelector('.kz-exception-table') && !node.querySelector('.kz-home-feed'))));
  assert('The dashboard rewards skimming with restrained operational humor', await commerce.$eval('.kz-dashboard', (node) => node.textContent.includes('Located the missing carton') && node.textContent.includes('spreadsheet limbo')));
  await openModule(commerce, 'home');
  assert('StealStreet Home is a distinct culture-first company workspace', await commerce.$eval('.kz-home-layout', (node) => node.textContent.includes('Company Posts & Announcements') && node.textContent.includes('Company Culture Calendar') && node.textContent.includes('Inside the Break Room') && node.textContent.includes('Employee Resources')));
  assert('The culture feed includes company traditions, playful spaces, and employee conversation', await commerce.$eval('.kz-home-layout', (node) => node.textContent.includes('Big Bear company trip') && node.textContent.includes('White Elephant gift exchanges') && node.textContent.includes('Pool Table') && node.textContent.includes('Arcade') && node.textContent.includes('Learning Library') && node.querySelectorAll('.kz-home-comments blockquote').length >= 3));
  assert('The Home greeting keeps the visitor in the guest perspective', await commerce.$eval('.kz-page-header', (node) => node.textContent.includes('Good morning, YOU (Time Traveler).')));
  assert('Who’s Around contains the full named employee roster and roles', await commerce.$eval('.kz-home-people', (node) => node.querySelectorAll(':scope > span').length === 16 && node.textContent.includes('Kevin') && node.textContent.includes('Co-Founder, CIO') && node.textContent.includes('Madison') && node.textContent.includes('Data')));
  const expectedOfficeDate = await commerce.evaluate(() => {
    const now = new Date();
    const day = Math.min(now.getDate(), new Date(2010, now.getMonth() + 1, 0).getDate());
    return new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(new Date(2010, now.getMonth(), day));
  });
  const datedState = await commerceState(commerce);
  const explicitDates = [...datedState.orders.map((item) => item.date), ...datedState.purchaseOrders.flatMap((item) => [item.orderDate, item.expectedDate]), ...datedState.companyHub.events.map((item) => item.date)];
  assert('The office clock projects the current month and day into 2010', await commerce.$eval('[data-office-date]', (node, expected) => node.textContent === expected, expectedOfficeDate), expectedOfficeDate);
  assert('Every seeded operational and culture date is in 2010 and not after the office date', explicitDates.every((value) => /\/2010$/.test(value) && new Date(value) <= new Date(expectedOfficeDate)), explicitDates.join(' | '));
  const firstPostComments = datedState.companyHub.posts[0].comments.length;
  await commerce.click('[data-home-post="POST-01"] [data-action="home-comment-form"]');
  await commerce.waitForSelector('[data-dialog="record"][open] [data-action="submit-home-comment"]');
  await setDialogValue(commerce, '[data-dialog="record"][open] textarea[name="comment"]', 'Save me a seat by the snacks.');
  await commerce.click('[data-dialog="record"][open] [data-action="submit-home-comment"]');
  await commerce.waitForFunction((count) => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7')).companyHub.posts[0].comments.length === count + 1, {}, firstPostComments);
  const guestComment = (await commerceState(commerce)).companyHub.posts[0].comments.at(-1);
  assert('Guest comments persist under the time-traveler identity', guestComment.body === 'Save me a seat by the snacks.' && guestComment.author === 'YOU (Time Traveler)');
  await openModule(commerce, 'dashboard');
  const personalityThread = await commerceState(commerce);
  const characterSku = personalityThread.catalog.find((item) => item.sku === 'KV-910331');
  assert('A recurring product story connects six Commerce workspaces', characterSku?.product === 'Executive Decision-Making Mug'
    && personalityThread.inventory.find((item) => item.sku === characterSku.sku)?.product === characterSku.product
    && personalityThread.purchaseOrders.some((item) => item.sku === characterSku.sku && item.vendor === 'Big Idea Ceramics')
    && personalityThread.orders.find((item) => item.id === 'ORD-10482')?.itemNames.includes(characterSku.product)
    && personalityThread.warehouseTasks.some((item) => item.record === 'ORD-10482' && item.note.includes('decisions may shift'))
    && personalityThread.cases.some((item) => item.orderId === 'ORD-10482' && item.issue === 'Product expectations'));
  await commerce.click('[data-action="sync-all"]');
  await commerce.waitForSelector('[data-kevazon].is-delighted');
  assert('System sync responds with a brief, characterful micro-delight', await commerce.$eval('[data-toast-region]', (node) => node.textContent.includes('Everything is talking again. Suspiciously cooperative.')));

  const moduleHeadings = {
    home: 'StealStreet Home',
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
  await traverseCommerceHistory(-1, 'dashboard');
  commerce = await commerceFrame();
  await waitForModule(commerce, 'dashboard');
  assert('Browser Back restores the previous Commerce module', new URL(page.url()).searchParams.get('module') === 'dashboard');
  await traverseCommerceHistory(1, 'orders');
  commerce = await commerceFrame();
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
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7')).purchaseOrders.find((item) => item.id === 'PO-7814').received === 10);
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
    await commerce.waitForFunction((status) => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7')).orders.find((item) => item.id === 'ORD-10465').status === status, {}, expectedStatus);
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
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7')).catalog.find((item) => item.sku === 'KV-820118').health === 'Healthy');
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
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7')).returns.find((item) => item.id === 'RMA-4001').status === 'Completed');
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
  await commerce.waitForFunction(() => JSON.parse(localStorage.getItem('stealstreet-commerce-os-v7')).warehouseTasks.find((item) => item.id === 'WH-F-501').status === 'Complete');
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
  await waitForModule(commerce, 'home');
  const resetState = await commerceState(commerce);
  assert('Reset Demo Data restores Home, orders, POs, listings, returns, warehouse, and automation', resetState.ui.activeModule === 'home' && resetState.companyHub.posts[0].comments.length === firstPostComments && resetState.orders.find((item) => item.id === 'ORD-10465').status === 'Exception' && resetState.purchaseOrders.find((item) => item.id === 'PO-7814').received === 0 && resetState.catalog.find((item) => item.sku === 'KV-820118').health === 'Rejected' && resetState.returns.find((item) => item.id === 'RMA-4001').status === 'Inspection' && resetState.warehouseTasks.find((item) => item.id === 'WH-F-501').status === 'Carton Labels' && resetState.automation.find((item) => item.id === 'AUTO-01').enabled);
  await page.waitForFunction(() => new URL(window.location.href).searchParams.get('module') === 'home');

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
  await waitForModule(commerce, 'home');
  const overflow = await page.evaluate(() => ({ outer: document.documentElement.scrollWidth - window.innerWidth }));
  const commerceOverflow = await commerce.evaluate(() => {
    const sidebar = document.querySelector('.kz-sidebar');
    const homeLayout = document.querySelector('.kz-home-layout');
    return {
      body: document.body.scrollWidth - document.body.clientWidth,
      sidebarHeight: Math.round(sidebar.getBoundingClientRect().height),
      sidebarScrolls: sidebar.scrollWidth > sidebar.clientWidth,
      homeContained: homeLayout.getBoundingClientRect().right <= document.documentElement.clientWidth + 1,
      duplicateChrome: [...document.querySelectorAll('.kz-era-bar')].some((node) => getComputedStyle(node).display !== 'none')
    };
  });
  assert('The Commerce shell contains mobile overflow inside its intended controls', overflow.outer <= 1 && commerceOverflow.body <= 1 && commerceOverflow.sidebarHeight < 50 && commerceOverflow.sidebarScrolls && commerceOverflow.homeContained && !commerceOverflow.duplicateChrome, JSON.stringify({ ...overflow, ...commerceOverflow }));

  // Start the WebGL future wing on a fresh target so the exhaustive Commerce
  // iframe run cannot exhaust the renderer before holographic Kevin mounts.
  await page.close();
  page = await browser.newPage();
  observePage(page);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(`${base}/experience/?year=2030&view=interface`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('.interface-mode.is-visible .future-native--2030', { timeout: 30000 });
  assert('The future interfaces are native and mount no 2030/2040 iframe', await page.$$eval('iframe', (frames) => frames.every((frame) => !/\/legacy\/experience\/(2030|2040)\//.test(frame.src))));
  assert('Native Co-Existence exposes six ordinary moments with Saito', await page.$$eval('.coexistence-dayline button', (buttons) => buttons.length === 6) && await page.$eval('.future-native--2030', (node) => node.textContent.includes('Morning, Together') && node.textContent.includes('Saito')));
  await finishCoexistenceExchange();
  await clickPageButton('Keep it with me');
  await clickPageButton('Studio table');
  await finishCoexistenceExchange();
  await clickPageButton('Let it end here');
  await clickPageButton('Window desk');
  await finishCoexistenceExchange();
  await clickPageButton('Let it end here');
  await clickPageButton('Open infrastructure receipt');
  assert('TokenPak, TIP, and PAK remain optional provenance rather than the 2030 hero', await page.$eval('.coexistence-provenance aside', (node) => node.textContent.includes('TokenPak') && node.textContent.includes('TIP authority') && node.textContent.includes('PAK context')));
  await clickPageButton('Enter Morning, After');
  await page.waitForSelector('.future-native--2040', { timeout: 30000 });
  assert('Saito remains exclusive to the 2030 experience', await page.$eval('.future-native--2040', (node) => !/Saito/i.test(node.textContent ?? '')));
  assert('Consciousness reports the one memory permitted by the living day', await page.$eval('.future-masthead', (node) => node.textContent.includes('1/6 MEMORIES PERMITTED')));
  await clickPageButton('An unfinished sentence');
  await clickPageButton('Let Kevin recall');
  await page.waitForFunction(() => document.querySelector('.consciousness-encounter blockquote')?.textContent.includes('deliberate blank'));
  await clickPageButton('Pull the sentence to its source');
  assert('Holographic Kevin exposes withheld conjecture instead of inventing memory', await page.$eval('.consciousness-source', (node) => node.textContent.includes('deliberately withheld') && node.textContent.includes('thread ends here')));
  await clickPageButton('Let Kevin deliberate');
  await clickPageButton('Let Kevin speak / act / refuse');
  await clickPageButton('Let Kevin continue');
  await page.waitForSelector('.consciousness-retention', { timeout: 5000 });
  assert('The behavior loop ends with explicit encounter permission', await page.$eval('.consciousness-retention', (node) => node.textContent.includes('May I keep this?') && node.textContent.includes('No—let me disappear')));

  assert('The reviewed flows emit no console errors', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
  assert('The reviewed flows emit no page errors', report.pageErrors.length === 0, report.pageErrors.join(' | '));
  assert('The reviewed flows emit no unexpected request failures', report.requestFailures.length === 0, report.requestFailures.join(' | '));
} finally {
  await browser.close();
  fs.writeFileSync(path.join('docs', 'RUNTIME_COMMERCE_COEXISTENCE.json'), JSON.stringify(report, null, 2));
}

console.log(JSON.stringify(report, null, 2));
