import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const candidates = [
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
    candidates.push(path.join(playwrightCache, directory, 'chrome-linux64', 'chrome'), path.join(playwrightCache, directory, 'chrome-linux', 'chrome'));
  }
}
const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error('No supported Chromium browser was found.');

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

const report = { generatedAt: new Date().toISOString(), browser: executablePath, base, assertions: [], consoleErrors: [], pageErrors: [], requestFailures: [] };
function assert(name, condition, detail = '') {
  report.assertions.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
}
async function clickButton(label) {
  const clicked = await page.$$eval('button', (buttons, expected) => {
    const button = buttons.find((candidate) => candidate.textContent?.trim().includes(expected) && !candidate.disabled);
    button?.click();
    return Boolean(button);
  }, label);
  if (!clicked) throw new Error(`Could not find enabled button containing “${label}”.`);
}
async function open(route, selector) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  if (!response || response.status() >= 400) throw new Error(`${route} returned ${response?.status() ?? 'no response'}.`);
  await page.waitForSelector(selector, { timeout: 30000 });
}
async function geometry(selector) {
  return page.$eval(selector, (node) => {
    const rect = node.getBoundingClientRect();
    return {
      outerOverflow: document.documentElement.scrollWidth - window.innerWidth,
      componentOverflow: node.scrollWidth - node.clientWidth,
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });
}

page.on('console', (message) => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => {
  const reason = request.failure()?.errorText ?? 'unknown';
  if (reason !== 'net::ERR_ABORTED') report.requestFailures.push(`${request.url()} :: ${reason}`);
});

try {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await open('/', 'body');
  await page.evaluate(() => localStorage.removeItem('kevinception-v7'));
  await open('/experience/?year=2030&view=interface', '.future-native--2030');
  assert('Desktop 2030 uses a native interface with no future iframe', await page.$$eval('iframe', (frames) => frames.every((frame) => !/\/legacy\/experience\/(2030|2040)\//.test(frame.src))));
  await clickButton('Fast learning');
  await clickButton('Low');
  await clickButton('Initialize collaboration');
  await page.waitForSelector('.nexus-decision-gate', { timeout: 5000 });
  await clickButton('Revise and narrow');
  await page.waitForSelector('.nexus-receipt');
  const receiptId = await page.$eval('.nexus-receipt h3', (node) => node.textContent.trim());
  const nexusGeometry = await geometry('.future-native--2030');
  assert('Desktop 2030 stays within the viewport', nexusGeometry.outerOverflow <= 1 && nexusGeometry.componentOverflow <= 1 && nexusGeometry.left >= 0 && nexusGeometry.right <= nexusGeometry.viewportWidth + 1, JSON.stringify(nexusGeometry));

  await clickButton('Transmit memory to 2040');
  await page.waitForSelector('.future-native--2040', { timeout: 10000 });
  await page.type('.echo-interpreter-native textarea', 'What is your favorite color?');
  await clickButton('Interpret signal');
  await page.waitForFunction(() => document.querySelector('.echo-response-native')?.textContent.includes('Evidence boundary'));
  await clickButton('1990');
  await clickButton('2010');
  await clickButton('2030');
  await clickButton('Synthesize continuity');
  await page.waitForSelector('.echo-finale');
  const echoGeometry = await geometry('.future-native--2040');
  const echoStageGeometry = await geometry('.echo-native-stage');
  const echoFinaleGeometry = await geometry('.echo-finale');
  assert('Desktop 2040 and its finale stay within the viewport', echoGeometry.outerOverflow <= 1 && echoGeometry.left >= 0 && echoGeometry.right <= echoGeometry.viewportWidth + 1 && echoStageGeometry.componentOverflow <= 1 && echoFinaleGeometry.componentOverflow <= 1, JSON.stringify({ root: echoGeometry, stage: echoStageGeometry, finale: echoFinaleGeometry }));
  assert('Desktop synthesis retains the governed receipt', await page.$eval('.echo-finale', (node, id) => node.textContent.includes(id), receiptId), receiptId);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await open('/experience/?year=2040&view=interface', '.future-native--2040');
  await page.waitForFunction((id) => document.querySelector('.echo-presence-native')?.textContent.includes(id), {}, receiptId);
  const mobileEcho = await geometry('.future-native--2040');
  const mobileEchoStage = await geometry('.echo-native-stage');
  assert('Mobile 2040 has no horizontal overflow', mobileEcho.outerOverflow <= 1 && mobileEcho.left >= 0 && mobileEcho.right <= mobileEcho.viewportWidth + 1 && mobileEchoStage.componentOverflow <= 1 && mobileEchoStage.left >= 0 && mobileEchoStage.right <= mobileEchoStage.viewportWidth + 1, JSON.stringify({ root: mobileEcho, stage: mobileEchoStage }));
  assert('Mobile Echo keeps thought and memory controls in the document', await page.$eval('.future-native--2040', (node) => Boolean(node.querySelector('.echo-interpreter-native textarea') && node.querySelector('.echo-memory-constellation'))));

  await open('/experience/?year=2040&view=text', '.text-mode .future-text--2040');
  const mobileText = await geometry('.text-mode');
  assert('Mobile future text mode has no horizontal overflow', mobileText.outerOverflow <= 1 && mobileText.componentOverflow <= 1, JSON.stringify(mobileText));
  assert('Text mode preserves the completed finale and receipt state', await page.$eval('.future-text--2040', (node, id) => node.textContent.includes('The interfaces changed. The pattern did not.') && node.textContent.includes(id), receiptId));

  await open('/experience/?year=2030&view=interface', '.future-native--2030');
  const mobileNexus = await geometry('.future-native--2030');
  const mobileNexusStage = await geometry('.nexus-native-stage');
  assert('Mobile 2030 has no horizontal overflow', mobileNexus.outerOverflow <= 1 && mobileNexus.left >= 0 && mobileNexus.right <= mobileNexus.viewportWidth + 1 && mobileNexusStage.componentOverflow <= 1 && mobileNexusStage.left >= 0 && mobileNexusStage.right <= mobileNexusStage.viewportWidth + 1, JSON.stringify({ root: mobileNexus, stage: mobileNexusStage }));
  assert('Mobile Nexus preserves the completed receipt', await page.$eval('.nexus-receipt', (node, id) => node.textContent.includes(id), receiptId));

  assert('The future smoke path emits no console errors', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
  assert('The future smoke path emits no page errors', report.pageErrors.length === 0, report.pageErrors.join(' | '));
  assert('The future smoke path emits no request failures', report.requestFailures.length === 0, report.requestFailures.join(' | '));
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
