import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const outputDir = 'docs/previews/v77';

function browserCandidates() {
  return [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
}

const executablePath = browserCandidates().find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error('No supported Chromium browser was found.');

fs.mkdirSync(outputDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  browser: executablePath,
  base,
  pages: [],
  assertions: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: []
};

function assert(name, condition, detail = '') {
  report.assertions.push({ name, passed: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]
});

const page = await browser.newPage();
page.on('console', (message) => {
  if (message.type() === 'error') report.consoleErrors.push(message.text());
});
page.on('pageerror', (error) => report.pageErrors.push(String(error)));
page.on('requestfailed', (request) => report.requestFailures.push(`${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`));

async function visit(route, screenshot, viewport) {
  if (viewport) await page.setViewport(viewport);
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle2', timeout: 60000 });
  report.pages.push({ route, status: response?.status() ?? null, title: await page.title(), viewport });
  assert(`${route} returned a successful response`, Boolean(response && response.status() < 400), `status ${response?.status()}`);
  if (screenshot) await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: false });
}

async function kevtokFrame() {
  await page.waitForFunction(() => [...document.querySelectorAll('iframe')].some((frame) => frame.src.includes('/legacy/experience/2020/')), { timeout: 30000 });
  const frame = page.frames().find((candidate) => candidate.url().includes('/legacy/experience/2020/'));
  if (!frame) throw new Error('The KevTok iframe was not found.');
  await frame.waitForSelector('.kt-app[data-device-native="true"]', { timeout: 30000 });
  return frame;
}

async function closeNativeDialog(frame, name) {
  const selector = `[data-kt-native-dialog="${name}"]`;
  await frame.$eval(selector, (dialog) => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  });
}

try {
  await visit('/experience/?year=2020&view=interface', '2020-interface-desktop.png', { width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.waitForSelector('.interface-mode.is-visible', { timeout: 30000 });
  const outerControls = await page.$$eval('.interface-mode__bar nav button', (buttons) => buttons.map((button) => button.textContent?.trim()));
  assert('The outer interface frame exposes only Step back and Chapters', JSON.stringify(outerControls) === JSON.stringify(['Step back', 'Chapters']), JSON.stringify(outerControls));
  const frameHeight = await page.$eval('.interface-mode__bar', (node) => node.getBoundingClientRect().height);
  assert('The outer interface frame remains slim', frameHeight <= 48, `${frameHeight}px`);

  const frame = await kevtokFrame();
  const utilityDisplay = await frame.$eval('.era-utility', (node) => getComputedStyle(node).display);
  assert('The duplicated embedded era utility bar is hidden', utilityDisplay === 'none', utilityDisplay);

  const navLabels = await frame.$$eval('.kt-nav [data-kt-nav]', (buttons) => buttons.map((button) => button.textContent?.replace(/\s+/g, ' ').trim()));
  assert('KevTok exposes five device-native destinations', navLabels.length === 5, navLabels.join(' | '));

  await frame.click('[data-kt-nav="discover"]');
  await frame.waitForSelector('[data-kt-native-dialog="discover"][open]');
  await frame.type('[data-kt-native-search]', 'systems');
  const discoverResults = await frame.$$eval('[data-kt-native-results] button', (buttons) => buttons.length);
  assert('Discover search returns matching clips', discoverResults > 0, `${discoverResults} results`);
  await closeNativeDialog(frame, 'discover');

  await frame.click('[data-kt-nav="create"]');
  await frame.waitForSelector('[data-kt-native-dialog="create"][open]');
  await frame.type('[data-kt-native-create-form] textarea', 'A local creator draft used by the runtime review.');
  await frame.select('[data-kt-native-create-form] select', 'System diagram');
  await frame.click('[data-kt-native-create-form] button[type="submit"]');
  const draftCount = await frame.$eval('[data-kt-native-draft-count]', (node) => Number(node.textContent));
  assert('Create saves a local draft', draftCount >= 1, `${draftCount} drafts`);
  await closeNativeDialog(frame, 'create');

  const firstClip = '[data-kt-clip][data-clip-id="who"]';
  const likeSelector = `${firstClip} [data-kt-like]`;
  const saveSelector = `${firstClip} [data-kt-save]`;
  const shareSelector = `${firstClip} [data-kt-share]`;
  const commentSelector = `${firstClip} [data-kt-comment]`;

  const initialLike = await frame.$eval(`${likeSelector} b`, (node) => node.textContent);
  await frame.click(likeSelector);
  await frame.waitForFunction((selector, initial) => {
    const button = document.querySelector(selector);
    return button?.classList.contains('is-active') && button.querySelector('b')?.textContent !== initial;
  }, {}, likeSelector, initialLike);
  assert('Like toggles and updates its displayed count', await frame.$eval(likeSelector, (button) => button.classList.contains('is-active')));

  await frame.click(saveSelector);
  await frame.waitForFunction((selector) => document.querySelector(selector)?.classList.contains('is-active'), {}, saveSelector);
  assert('Save persists an active state', await frame.$eval(saveSelector, (button) => button.classList.contains('is-active')));

  const initialShare = await frame.$eval(`${shareSelector} b`, (node) => node.textContent);
  await frame.click(shareSelector);
  await frame.waitForFunction((selector, initial) => document.querySelector(selector)?.querySelector('b')?.textContent !== initial, {}, shareSelector, initialShare);
  assert('Share updates the local activity count', true);

  await frame.click(commentSelector);
  await frame.waitForSelector('[data-kt-comment-dialog][open]');
  await frame.type('[data-kt-comment-form] textarea', 'Runtime review comment');
  await frame.click('[data-kt-comment-form] button[type="submit"]');
  await frame.waitForFunction(() => !document.querySelector('[data-kt-comment-dialog]')?.hasAttribute('open'));
  assert('Comment submission completes inside KevTok', true);

  await frame.click('[data-kt-nav="inbox"]');
  await frame.waitForSelector('[data-kt-native-dialog="inbox"][open]');
  const inboxItems = await frame.$$eval('[data-kt-native-inbox] article', (items) => items.length);
  assert('Inbox summarizes local activity', inboxItems >= 5, `${inboxItems} items`);
  await closeNativeDialog(frame, 'inbox');

  await frame.click('[data-kt-nav="profile"]');
  await frame.waitForSelector('[data-kt-native-dialog="profile"][open]');
  await frame.click('[data-kt-profile-tab="liked"]');
  const likedTiles = await frame.$$eval('[data-kt-native-profile-grid] button', (items) => items.length);
  assert('Profile exposes liked clips', likedTiles >= 1, `${likedTiles} liked tiles`);
  await frame.click('[data-kt-profile-tab="saved"]');
  const savedTiles = await frame.$$eval('[data-kt-native-profile-grid] button', (items) => items.length);
  assert('Profile exposes saved clips', savedTiles >= 1, `${savedTiles} saved tiles`);
  await closeNativeDialog(frame, 'profile');

  await page.screenshot({ path: path.join(outputDir, '2020-interface-interactions.png'), fullPage: false });

  await visit('/experience/?year=2030', '2030-straight-desktop.png', { width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.waitForSelector('.environment-panel', { timeout: 30000 });
  await visit('/experience/?year=2040', '2040-straight-desktop.png', { width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.waitForSelector('.environment-panel', { timeout: 30000 });

  await visit('/experience/?year=2030', '2030-straight-ultrawide.png', { width: 2560, height: 1080, deviceScaleFactor: 1 });
  await page.waitForSelector('.environment-panel', { timeout: 30000 });
  await visit('/experience/?year=2040', '2040-straight-ultrawide.png', { width: 2560, height: 1080, deviceScaleFactor: 1 });
  await page.waitForSelector('.environment-panel', { timeout: 30000 });

  await visit('/experience/?year=2020&view=interface', '2020-interface-mobile.png', { width: 390, height: 844, deviceScaleFactor: 1 });
  await page.waitForSelector('.interface-mode.is-visible', { timeout: 30000 });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  report.mobileOverflow = mobileOverflow;
  assert('The mobile outer frame has no horizontal overflow', mobileOverflow <= 1, `${mobileOverflow}px`);

  const mobileFrame = await kevtokFrame();
  const mobileInnerOverflow = await mobileFrame.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  report.mobileInnerOverflow = mobileInnerOverflow;
  assert('The mobile KevTok device has no horizontal overflow', mobileInnerOverflow <= 1, `${mobileInnerOverflow}px`);
} finally {
  await browser.close();
  fs.writeFileSync('docs/RUNTIME_REVIEW_V77.json', JSON.stringify(report, null, 2));
}

if (report.pageErrors.length || report.consoleErrors.length) {
  throw new Error(`Browser errors detected: ${JSON.stringify({ pageErrors: report.pageErrors, consoleErrors: report.consoleErrors })}`);
}

console.log(JSON.stringify(report, null, 2));
