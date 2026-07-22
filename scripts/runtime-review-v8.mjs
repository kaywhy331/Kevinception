import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const outputDir = 'docs/previews/v8';
const routes = ['/', '/experience/', '/experience/1990/', '/experience/2000/', '/experience/2010/', '/experience/2020/', '/experience/2030/', '/experience/2040/', '/portfolio/', '/work/', '/resume/', '/about/', '/contact/'];
const chapterRoutes = routes.filter((route) => /^\/experience\/\d{4}\/$/.test(route));
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const candidates = [
  process.env.CHROME_PATH,
  process.env.CHROMIUM_PATH,
  process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome',
  process.platform === 'win32' ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' : '/usr/bin/chromium'
].filter(Boolean);
const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error('No supported Chrome or Chromium executable was found.');

fs.mkdirSync(outputDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(), browser: executablePath, base,
  pages: [], assertions: [], consoleErrors: [], pageErrors: [], requestFailures: [], abortedPrefetches: [], screenshots: []
};
const assert = (name, condition, detail = '') => report.assertions.push({ name, passed: Boolean(condition), detail });

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => {
  const failure = `${request.resourceType()} ${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`;
  if (failure.includes('net::ERR_ABORTED')) report.abortedPrefetches.push(failure);
  else report.requestFailures.push(failure);
});

async function setViewport(width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
}

async function shot(name, fullPage = false) {
  const file = path.join(outputDir, name);
  await page.screenshot({ path: file, fullPage });
  report.screenshots.push(file.replaceAll('\\', '/'));
}

async function visit(route, { waitForExperience = false } = {}) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle2', timeout: 60000 });
  if (waitForExperience) {
    await page.waitForSelector('.experience-overlay', { timeout: 30000 });
    await sleep(650);
  }
  const pageResult = await page.evaluate(() => ({ title: document.title, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
  report.pages.push({ route, status: response?.status() ?? null, ...pageResult, viewport: page.viewport() });
  assert(`${route} returns HTTP 200`, response?.status() === 200, `status ${response?.status()}`);
  assert(`${route} has no horizontal overflow`, pageResult.overflow <= 1, `${pageResult.overflow}px`);
  return pageResult;
}

try {
  await setViewport(1440, 900);
  const home = await visit('/');
  await shot('home-1440x900.png');
  const threshold = await page.evaluate(() => {
    const statement = document.querySelector('.threshold-copy h1')?.getBoundingClientRect();
    const action = document.querySelector('.threshold-copy .primary-action')?.getBoundingClientRect();
    return { statement: document.querySelector('.threshold-copy h1')?.textContent?.trim(), statementBottom: statement?.bottom ?? Infinity, actionBottom: action?.bottom ?? Infinity };
  });
  assert('Homepage exposes the canonical master statement', threshold.statement?.startsWith('One evolving mind. Six defining interfaces.'), threshold.statement ?? 'missing');
  assert('Homepage primary action is visible in the first 1440×900 viewport', threshold.actionBottom <= 900, `${threshold.actionBottom}px`);
  assert('Homepage title is the canonical metadata identity', home.title.includes('One Evolving Mind Through Six Defining Interfaces'), home.title);

  await setViewport(1920, 1080); await visit('/'); await shot('home-1920x1080.png');
  await setViewport(2560, 1080); await visit('/'); await shot('home-2560x1080.png');
  await setViewport(390, 844); await visit('/'); await shot('home-390x844.png');
  await setViewport(430, 932); await visit('/');
  await page.click('.mobile-nav summary');
  const mobileLinks = await page.$$eval('.mobile-nav nav a', (links) => links.filter((link) => getComputedStyle(link).display !== 'none').map((link) => link.textContent?.trim()));
  assert('Mobile navigation exposes every primary destination', mobileLinks.length === 6, mobileLinks.join(', '));
  await shot('mobile-navigation-430x932.png');

  await setViewport(1440, 900);
  const chapterTitles = [];
  for (const route of chapterRoutes) {
    const result = await visit(route, { waitForExperience: true });
    chapterTitles.push(result.title);
    await page.waitForSelector('.environment-panel', { timeout: 15000 });
    await shot(`${route.match(/\d{4}/)?.[0]}-environment-1440x900.png`);
  }
  assert('All six chapters have unique page titles', new Set(chapterTitles).size === 6, chapterTitles.join(' | '));
  const roleLabels = await page.goto(`${base}/experience/2030/`, { waitUntil: 'networkidle2', timeout: 60000 }).then(async () => {
    await page.waitForSelector('.agent-role-legend');
    return page.$$eval('.agent-role-legend b', (labels) => labels.map((label) => label.textContent?.trim()));
  });
  assert('2030 keeps all five agent roles legible', roleLabels.join('|') === 'Strategist|Researcher|Builder|Governor|Archivist', roleLabels.join(', '));

  await visit('/experience/1990/', { waitForExperience: true });
  await page.click('.semantic-hotspots button');
  await page.click('.year-selector button[aria-label^="2040"]');
  await page.waitForFunction(() => window.location.pathname === '/experience/2040/' && Boolean(document.querySelector('.continuity-summary')), { timeout: 5000 });
  const continuityText = await page.$eval('.continuity-summary', (node) => node.textContent?.replace(/\s+/g, ' ').trim());
  assert('A discovered artifact visibly affects the 2040 reconstruction', /^1 discovered form is/.test(continuityText ?? ''), continuityText ?? 'missing');
  await shot('2040-provenance-payoff-1440x900.png');

  await visit('/experience/1990/', { waitForExperience: true });
  await page.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 2400, bubbles: true })));
  await sleep(650);
  assert('One wheel gesture advances only one adjacent chapter', new URL(page.url()).pathname === '/experience/2000/', page.url());
  await visit('/experience/1990/', { waitForExperience: true });
  const firstSelectorButton = await page.$('.year-selector button[aria-label^="2000"]');
  await firstSelectorButton?.click();
  await sleep(30);
  assert('The 1990→2000 transition uses the authored static-to-modem treatment', Boolean(await page.$('.transition-static-modem')));
  await sleep(500);
  await page.goBack({ waitUntil: 'networkidle2' });
  await sleep(450);
  assert('Browser Back restores the prior canonical chapter', new URL(page.url()).pathname === '/experience/1990/', page.url());

  await visit('/experience/2020/', { waitForExperience: true });
  const hotspot = await page.$('.semantic-hotspots button');
  await hotspot?.focus();
  const beforeKey = page.url();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await sleep(250);
  assert('Focused hotspot keys do not trigger global chapter navigation', new URL(page.url()).pathname === new URL(beforeKey).pathname, page.url());

  const menuTrigger = await page.$('.experience-menu__trigger');
  await menuTrigger?.click();
  await page.click('.experience-menu__popover button:nth-of-type(3)');
  await page.waitForSelector('.modal-card[role="dialog"]');
  const inert = await page.$eval('.experience-root', (root) => root.inert && root.getAttribute('aria-hidden') === 'true');
  assert('Dialog makes the background inert and hidden to assistive technology', inert);
  await page.$$eval('.modal-card a[href], .modal-card button:not([disabled]), .modal-card input:not([disabled]), .modal-card select:not([disabled]), .modal-card textarea:not([disabled]), .modal-card [tabindex]:not([tabindex="-1"])', (elements) => elements.at(-1)?.focus());
  await page.keyboard.press('Tab');
  const focusContained = await page.evaluate(() => Boolean(document.activeElement?.closest('.modal-card')));
  assert('Dialog keeps Tab focus contained inside the modal', focusContained);
  await page.keyboard.press('Escape');
  await sleep(120);
  const restored = await page.evaluate(() => document.activeElement?.classList.contains('experience-menu__trigger'));
  assert('Dialog Escape restores focus to its opener', restored);

  await menuTrigger?.click();
  await page.click('.experience-menu__popover button:nth-of-type(3)');
  await page.waitForSelector('.modal-card');
  await page.$$eval('.modal-card fieldset:nth-of-type(1) input', (inputs) => inputs[2]?.click());
  await page.$$eval('.modal-card fieldset:nth-of-type(2) input', (inputs) => inputs[1]?.click());
  const preferences = await page.evaluate(() => JSON.parse(localStorage.getItem('kevinception-v7') ?? '{}').state ?? {});
  assert('Lite mode can be selected and persisted', preferences.quality === 'lite', String(preferences.quality));
  assert('Reduced-motion mode can be selected and persisted', preferences.motion === 'reduced', String(preferences.motion));
  await shot('settings-lite-reduced-1440x900.png');
  const openedText = await page.$$eval('.modal-card > button', (buttons) => {
    const button = buttons.find((candidate) => candidate.textContent?.includes('Use text experience'));
    button?.click();
    return Boolean(button);
  });
  assert('Text mode is available from settings', openedText);
  await page.waitForSelector('.text-mode');
  await shot('text-mode-1440x900.png');

  await setViewport(1920, 1080);
  await visit('/experience/2020/?view=interface', { waitForExperience: true });
  await page.waitForSelector('.interface-mode.is-visible');
  const interfaceLayout = await page.evaluate(() => {
    const device = document.querySelector('.interface-mode__device')?.getBoundingClientRect();
    const context = document.querySelector('.interface-context')?.getBoundingClientRect();
    return { deviceWidth: device?.width ?? 0, contextWidth: context?.width ?? 0, contextText: document.querySelector('.interface-context')?.textContent?.replace(/\s+/g, ' ').trim() };
  });
  assert('2020 desktop gives the portrait interface an authored evidence field', interfaceLayout.contextWidth > interfaceLayout.deviceWidth, JSON.stringify(interfaceLayout));
  assert('2020 desktop context names chapter-relevant project evidence', Boolean(interfaceLayout.contextText?.includes('Project evidence') && interfaceLayout.contextText?.includes('Kevinception')), interfaceLayout.contextText ?? 'missing');
  await shot('2020-interface-1920x1080.png');
  await setViewport(2560, 1080); await shot('2020-interface-2560x1080.png');

  await setViewport(390, 844);
  await visit('/experience/2020/', { waitForExperience: true });
  const overlap = await page.evaluate(() => {
    const hint = document.querySelector('.experience-hint')?.getBoundingClientRect();
    const hotspots = document.querySelector('.semantic-hotspots')?.getBoundingClientRect();
    if (!hint || !hotspots) return 0;
    return Math.max(0, Math.min(hint.bottom, hotspots.bottom) - Math.max(hint.top, hotspots.top));
  });
  assert('Mobile first-run orientation does not cover semantic hotspots', overlap <= 1, `${overlap}px overlap`);
  await shot('2020-environment-390x844.png');
  await visit('/experience/2020/?view=interface', { waitForExperience: true });
  await page.waitForSelector('.interface-context');
  const mobileInterface = await page.evaluate(() => ({
    contextVisible: document.querySelector('.interface-context')?.getBoundingClientRect().height > 0,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  assert('Mobile interface recomposes rather than deleting chapter context', mobileInterface.contextVisible && mobileInterface.overflow <= 1, JSON.stringify(mobileInterface));
  await shot('2020-interface-390x844.png');
  await setViewport(430, 932); await visit('/experience/2030/', { waitForExperience: true }); await shot('2030-environment-430x932.png');

  await setViewport(1440, 900);
  for (const [route, name] of [['/portfolio/', 'portfolio-1440x900.png'], ['/work/kevinception/', 'case-study-1440x900.png'], ['/contact/', 'contact-1440x900.png']]) {
    await visit(route); await shot(name);
  }
  const contact = await page.evaluate(() => ({ mailto: Boolean(document.querySelector('a[href^="mailto:"]')), note: document.body.textContent?.includes('A public contact email has not been assumed.') }));
  assert('Contact path does not invent an email address', !contact.mailto && contact.note, JSON.stringify(contact));

  for (const route of routes) {
    if (!report.pages.some((entry) => entry.route === route)) await visit(route, { waitForExperience: route.startsWith('/experience/') });
  }
} catch (error) {
  report.fatalError = String(error?.stack ?? error);
} finally {
  await browser.close();
}

assert('No browser console errors occurred', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
assert('No uncaught page errors occurred', report.pageErrors.length === 0, report.pageErrors.join(' | '));
assert('No non-aborted network requests failed', report.requestFailures.length === 0, report.requestFailures.join(' | '));
const failed = report.assertions.filter((item) => !item.passed);
const completedReport = { ...report, summary: { passed: report.assertions.length - failed.length, failed: failed.length } };
fs.writeFileSync('docs/RUNTIME_REVIEW_V8.json', JSON.stringify(completedReport, null, 2));
console.log(JSON.stringify(completedReport, null, 2));
if (report.fatalError || failed.length) process.exit(1);
