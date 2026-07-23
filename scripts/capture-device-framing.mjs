import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const set = process.env.CAPTURE_SET ?? 'after';
const requested = new Set((process.env.CAPTURE_FILTER ?? '').split(',').map((item) => item.trim()).filter(Boolean));
const output = path.join('docs', 'previews', 'v8', 'device-framing', set);
const executablePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!fs.existsSync(executablePath)) throw new Error(`Chrome not found at ${executablePath}`);
fs.mkdirSync(output, { recursive: true });

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(String(error)));

async function capture({ year, width, height, name, interfaceMode = true, action }) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${base}/experience/${year}/${interfaceMode ? '?view=interface' : ''}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('.experience-overlay', { timeout: 30000 });
  await page.$eval('.experience-hint button', (button) => { if (button.getClientRects().length) button.click(); }).catch(() => {});
  if (interfaceMode) {
    await page.waitForSelector('.interface-mode.is-visible', { timeout: 30000 });
    const launcher = await page.$('.device-home button');
    if (launcher) await launcher.click();
    await page.waitForSelector('.interface-mode__frame.is-active', { timeout: 30000 });
  }
  if (action) await action(page);
  await new Promise((resolve) => setTimeout(resolve, 500));
  await page.screenshot({ path: path.join(output, name) });
}

const baseline = [
  { year: '2010', width: 1440, height: 900, name: '2010-interface-1440x900.png' },
  { year: '2020', width: 1920, height: 1080, name: '2020-interface-1920x1080.png' },
  { year: '2030', width: 1440, height: 900, name: '2030-interface-1440x900.png' },
  { year: '2040', width: 1440, height: 900, name: '2040-interface-1440x900.png' }
];

const after = [
  { year: '1990', width: 1440, height: 900, name: '1990-regression-1440x900.png' },
  { year: '2000', width: 1440, height: 900, name: '2000-regression-1440x900.png' },
  { year: '2010', width: 1440, height: 900, name: '2010-interface-1440x900.png' },
  { year: '2010', width: 390, height: 844, name: '2010-interface-390x844.png' },
  { year: '2020', width: 1440, height: 900, name: '2020-environment-1440x900.png', interfaceMode: false },
  { year: '2020', width: 1920, height: 1080, name: '2020-interface-1920x1080.png' },
  { year: '2020', width: 2560, height: 1080, name: '2020-interface-2560x1080.png' },
  { year: '2020', width: 390, height: 844, name: '2020-interface-390x844.png' },
  { year: '2030', width: 1440, height: 900, name: '2030-environment-1440x900.png', interfaceMode: false },
  { year: '2030', width: 1440, height: 900, name: '2030-mission-1440x900.png' },
  { year: '2030', width: 430, height: 932, name: '2030-interface-430x932.png' },
  { year: '2030', width: 1440, height: 900, name: '2030-human-gate-1440x900.png', action: async (target) => {
    const frame = await target.$('.interface-mode__frame.is-active');
    const content = await frame.contentFrame();
    await content.type('[name="objective"]', 'Turn an ambiguous idea into a practical product plan.');
    await content.click('[data-nexus-form] button[type="submit"]');
    await new Promise((resolve) => setTimeout(resolve, 3800));
    await content.$eval('[data-nexus-gate]', (gate) => gate.scrollIntoView({ block: 'center' }));
  } },
  { year: '2040', width: 1440, height: 900, name: '2040-environment-1440x900.png', interfaceMode: false },
  { year: '2040', width: 1440, height: 900, name: '2040-listening-1440x900.png', action: async (target) => {
    await target.evaluate(() => { window.SpeechRecognition = class { start() {} stop() { this.onend?.(); } abort() { this.onend?.(); } }; });
    await target.click('.device-voice-console > button:first-child');
  } },
  { year: '2040', width: 1440, height: 900, name: '2040-text-fallback-1440x900.png', action: async (target) => { await target.click('.device-voice-console > button:nth-of-type(2)'); } },
  { year: '2040', width: 1440, height: 900, name: '2040-provenance-response-1440x900.png', action: async (target) => {
    await target.click('.device-voice-console > button:nth-of-type(2)');
    await target.type('.device-voice-console textarea[name="device-command"]', 'What remains human?');
    await target.click('.device-voice-console form button[type="submit"]');
    const frame = await target.$('.interface-mode__frame.is-active');
    const content = await frame.contentFrame();
    await new Promise((resolve) => setTimeout(resolve, 450));
    await content.$eval('[data-echo-response]', (response) => response.scrollIntoView({ block: 'center' }));
  } },
  { year: '2040', width: 430, height: 932, name: '2040-interface-430x932.png' }
];

const captureSet = (set === 'before' ? baseline : after).filter((item) => requested.size === 0 || requested.has(item.name));
for (const item of captureSet) await capture(item);
await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
console.log(JSON.stringify({ base, set, output: output.replaceAll('\\', '/'), screenshots: captureSet.map((item) => item.name) }, null, 2));
