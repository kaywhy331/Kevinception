import { artifactPath, baseUrl as base, launchBrowser } from './lib/browser.mjs';

const { browser } = await launchBrowser();

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
    await page.screenshot({ path: artifactPath('previews', 'v77', `${year}-straight-ultrawide-fresh.png`), fullPage: false });
    await page.close();
  }
} finally {
  await browser.close();
}
