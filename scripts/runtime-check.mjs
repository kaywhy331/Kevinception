import { artifactPath, baseUrl as base, launchBrowser, writeReport } from './lib/browser.mjs';

const { browser, executablePath } = await launchBrowser();
const report = { generatedAt: new Date().toISOString(), browser: executablePath, base, pages: [], consoleErrors: [], pageErrors: [], requestFailures: [] };
const page = await browser.newPage();
page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => {
  const reason = request.failure()?.errorText ?? 'unknown';
  // Navigating between pages legitimately cancels speculative Next.js prefetches.
  if (reason === 'net::ERR_ABORTED') return;
  report.requestFailures.push(`${request.url()} :: ${reason}`);
});

async function visit(route, screenshot, readySelector = 'body') {
  console.log(`[runtime] ${route}`);
  const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector(readySelector, { timeout: 30000 });
  report.pages.push({ route, status: response?.status() ?? null, title: await page.title() });
  if (!response || response.status() >= 400) throw new Error(`${route} returned ${response?.status() ?? 'no response'}.`);
  if (screenshot) await page.screenshot({ path: screenshot, fullPage: false });
}

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await visit('/', artifactPath('previews', 'v7-threshold.png'));
await visit('/experience/', artifactPath('previews', 'v7-timeline.png'), 'canvas');
for (const year of ['1990', '2000', '2010', '2020', '2030', '2040']) {
  await visit(`/experience/?year=${year}`, artifactPath('previews', `v7-${year}-environment.png`), '.environment-panel');
}
await visit('/experience/2010/', null, '.interface-mode.is-visible');
await visit('/experience/2030/', null, '.interface-mode.is-visible');
await visit('/about/', artifactPath('previews', 'v7-about.png'));
await visit('/work/kevinception/', artifactPath('previews', 'v7-case-study.png'));

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await visit('/experience/?year=2020', artifactPath('previews', 'v7-2020-mobile.png'), '.environment-panel');
report.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

await browser.close();
writeReport('runtime-verification', report);
console.log(JSON.stringify(report, null, 2));
if (report.pageErrors.length || report.consoleErrors.length || report.requestFailures.length || report.mobileOverflow > 1) process.exit(1);
