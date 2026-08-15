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
  await clickButton('Keep it with me');
  await clickButton('Studio table');
  await clickButton('Let it end here');
  await clickButton('Window desk');
  await clickButton('Let it end here');
  await clickButton('How was this carried?');
  assert('2030 keeps TokenPak/TIP/PAK secondary inside optional provenance', await page.$eval('.coexistence-provenance aside', (node) => node.textContent.includes('TokenPak') && node.textContent.includes('TIP authority') && node.textContent.includes('PAK context')));
  const coexistenceGeometry = await geometry('.future-native--2030');
  const coexistenceStageGeometry = await geometry('.coexistence-stage');
  assert('Desktop 2030 stays within the viewport', coexistenceGeometry.outerOverflow <= 1 && coexistenceGeometry.left >= 0 && coexistenceGeometry.right <= coexistenceGeometry.viewportWidth + 1 && coexistenceStageGeometry.componentOverflow <= 1, JSON.stringify({ root: coexistenceGeometry, stage: coexistenceStageGeometry }));

  await clickButton('Enter Morning, After');
  await page.waitForSelector('.future-native--2040', { timeout: 10000 });
  assert('2040 reports only the memory permitted in 2030', await page.$eval('.future-masthead', (node) => node.textContent.includes('1/5 MEMORIES PERMITTED')));
  await clickButton('An unfinished sentence');
  await clickButton('Let Kevin recall');
  await page.waitForFunction(() => document.querySelector('.consciousness-encounter blockquote')?.textContent.includes('deliberate blank'));
  await clickButton('Pull the sentence to its source');
  assert('Withheld 2030 memory becomes a sourced deliberate blank in 2040', await page.$eval('.consciousness-source', (node) => node.textContent.includes('deliberately withheld') && node.textContent.includes('conjecture')));
  await clickButton('Let Kevin deliberate');
  await clickButton('Let Kevin speak / act / refuse');
  await clickButton('Let Kevin continue');
  await page.waitForSelector('.consciousness-retention');
  await clickButton('No—let me disappear');
  const consciousnessGeometry = await geometry('.future-native--2040');
  const consciousnessStageGeometry = await geometry('.consciousness-stage');
  const encounterGeometry = await geometry('.consciousness-encounter');
  assert('Desktop 2040 and its permission encounter stay within the viewport', consciousnessGeometry.outerOverflow <= 1 && consciousnessGeometry.left >= 0 && consciousnessGeometry.right <= consciousnessGeometry.viewportWidth + 1 && consciousnessStageGeometry.componentOverflow <= 1 && encounterGeometry.componentOverflow <= 1, JSON.stringify({ root: consciousnessGeometry, stage: consciousnessStageGeometry, encounter: encounterGeometry }));
  assert('The consciousness loop ends by asking permission', await page.$eval('.consciousness-retention', (node) => node.textContent.includes('May I keep this?') && node.textContent.includes('last trace')));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await open('/experience/?year=2040&view=interface', '.future-native--2040');
  const mobileConsciousness = await geometry('.future-native--2040');
  const mobileConsciousnessStage = await geometry('.consciousness-stage');
  assert('Mobile 2040 has no horizontal overflow', mobileConsciousness.outerOverflow <= 1 && mobileConsciousness.left >= 0 && mobileConsciousness.right <= mobileConsciousness.viewportWidth + 1 && mobileConsciousnessStage.componentOverflow <= 1 && mobileConsciousnessStage.left >= 0 && mobileConsciousnessStage.right <= mobileConsciousnessStage.viewportWidth + 1, JSON.stringify({ root: mobileConsciousness, stage: mobileConsciousnessStage }));
  assert('Mobile Consciousness keeps portrait, cues, sources, and permission controls in the document', await page.$eval('.future-native--2040', (node) => Boolean(node.querySelector('.consciousness-portrait') && node.querySelector('.consciousness-cue-index') && node.querySelector('.consciousness-source') && node.querySelector('.consciousness-retention'))));

  await open('/experience/?year=2040&view=text', '.text-mode .future-text--2040');
  const mobileText = await geometry('.text-mode');
  assert('Mobile future text mode has no horizontal overflow', mobileText.outerOverflow <= 1 && mobileText.componentOverflow <= 1, JSON.stringify(mobileText));
  assert('Text mode preserves permissioned memory, source, and encounter state', await page.$eval('.future-text--2040', (node) => node.textContent.includes('1/5 memories permitted') && node.textContent.includes('deliberately withheld') && node.textContent.includes('May I keep this?')));

  await open('/experience/?year=2030&view=interface', '.future-native--2030');
  const mobileCoexistence = await geometry('.future-native--2030');
  const mobileCoexistenceStage = await geometry('.coexistence-stage');
  assert('Mobile 2030 has no horizontal overflow', mobileCoexistence.outerOverflow <= 1 && mobileCoexistence.left >= 0 && mobileCoexistence.right <= mobileCoexistence.viewportWidth + 1 && mobileCoexistenceStage.componentOverflow <= 1 && mobileCoexistenceStage.left >= 0 && mobileCoexistenceStage.right <= mobileCoexistenceStage.viewportWidth + 1, JSON.stringify({ root: mobileCoexistence, stage: mobileCoexistenceStage }));
  assert('Mobile Co-Existence preserves consent choices and optional provenance', await page.$eval('.future-native--2030', (node) => {
    const persisted = JSON.parse(localStorage.getItem('kevinception-v7') || 'null');
    const coexistence = persisted?.state?.futureJourney?.coexistence;
    return coexistence?.keptMoments?.includes('morning')
      && coexistence?.refusedMoments?.includes('making')
      && coexistence?.refusedMoments?.includes('work')
      && Boolean(node.querySelector('.coexistence-provenance > button'));
  }));

  assert('The future smoke path emits no console errors', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
  assert('The future smoke path emits no page errors', report.pageErrors.length === 0, report.pageErrors.join(' | '));
  assert('The future smoke path emits no request failures', report.requestFailures.length === 0, report.requestFailures.join(' | '));
} finally {
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
