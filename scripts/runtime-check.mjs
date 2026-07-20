import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';

function candidates() {
  const list = [process.env.CHROME_PATH, process.env.CHROMIUM_PATH];
  if (process.platform === 'win32') {
    for (const root of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]) {
      if (!root) continue;
      list.push(
        path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(root, 'Chromium', 'Application', 'chrome.exe'),
        path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
      );
    }
  } else if (process.platform === 'darwin') {
    list.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    );
  } else {
    list.push('/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable');
  }
  return list.filter(Boolean);
}

const executablePath = candidates().find((candidate) => fs.existsSync(candidate));
if (!executablePath) {
  console.error('No supported Chromium browser was found. Set CHROME_PATH to Chrome, Chromium, or Edge.');
  process.exit(1);
}

fs.mkdirSync('docs/previews', { recursive: true });
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=swiftshader']
});
const report = { generatedAt: new Date().toISOString(), browser: executablePath, base, pages: [], consoleErrors: [], pageErrors: [], requestFailures: [] };
const page = await browser.newPage();
page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => report.requestFailures.push(`${request.url()} :: ${request.failure()?.errorText}`));

async function visit(route, screenshot) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 45000 });
  report.pages.push({ route, status: response?.status() ?? null, title: await page.title() });
  if (screenshot) await page.screenshot({ path: screenshot, fullPage: false });
}

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await visit('/', 'docs/previews/v7-threshold.png');
await visit('/experience/', 'docs/previews/v7-timeline.png');
await page.waitForSelector('canvas', { timeout: 30000 });
for (const year of ['1990', '2000', '2010', '2020', '2030', '2040']) {
  await visit(`/experience/${year}/`, `docs/previews/v7-${year}-environment.png`);
  await page.waitForSelector('.environment-panel', { timeout: 15000 });
}
await visit('/portfolio/', 'docs/previews/v7-portfolio.png');
await visit('/work/kevinception/', 'docs/previews/v7-case-study.png');

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await visit('/experience/2020/', 'docs/previews/v7-2020-mobile.png');
await page.waitForSelector('.environment-panel', { timeout: 15000 });
report.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

await browser.close();
fs.writeFileSync('docs/RUNTIME_VERIFICATION_V7.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.pageErrors.length || report.consoleErrors.length || report.mobileOverflow > 1) process.exit(1);
