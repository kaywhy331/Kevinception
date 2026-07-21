import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const executablePath = [
  process.env.CHROME_PATH,
  process.env.CHROMIUM_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean).find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error('No supported Chromium browser was found.');

fs.mkdirSync('docs/previews/v77', { recursive: true });
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-gpu-blocklist', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});

try {
  for (const year of ['2030', '2040']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1080, deviceScaleFactor: 1 });
    const response = await page.goto(`${base}/experience/?year=${year}`, { waitUntil: 'networkidle2', timeout: 60000 });
    if (!response || response.status() >= 400) throw new Error(`${year} returned ${response?.status()}`);
    await page.waitForSelector('.environment-panel', { timeout: 30000 });
    await page.waitForSelector('.experience-canvas', { timeout: 30000 });
    await page.mouse.move(40, 40);
    await page.mouse.move(180, 100);
    await new Promise((resolve) => setTimeout(resolve, 2200));
    await page.screenshot({ path: `docs/previews/v77/${year}-straight-ultrawide-fresh.png`, fullPage: false });
    await page.close();
  }
} finally {
  await browser.close();
}
