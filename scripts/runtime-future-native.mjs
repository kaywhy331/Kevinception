import { baseUrl as base, launchBrowser, writeReport } from './lib/browser.mjs';

const { browser, executablePath } = await launchBrowser({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']
});
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
/* Every selector below is keyed on data-* hooks or roles, never on styling class names. */
const part = (name) => `[data-future-part="${name}"]`;
const wing2030 = '[data-future-native="2030"]';
const wing2040 = '[data-future-native="2040"]';
async function clickPart(name) {
  await page.waitForSelector(part(name), { timeout: 10000 });
  await page.$eval(part(name), (node) => node.click());
}
async function finishCoexistenceExchange() {
  for (let beat = 0; beat < 4; beat += 1) {
    const before = await page.$$eval(`${part('exchange')} li`, (nodes) => nodes.length);
    await clickPart('reply');
    await page.waitForFunction((selector, count) => document.querySelectorAll(selector).length > count, {}, `${part('exchange')} li`, before);
  }
}
async function interfaceMode() {
  return page.$eval('[data-mode]', (node) => node.getAttribute('data-mode')).catch(() => null);
}
async function openLens() {
  await page.$$eval('button[aria-haspopup="dialog"]', (buttons) => buttons[0]?.click());
  await page.waitForSelector(`dialog${part('lens')}[open]`, { timeout: 10000 });
}
async function lensGeometry() {
  return page.$eval(`dialog${part('lens')}`, (node) => {
    const rect = node.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + Math.min(rect.height / 2, 60));
    return {
      modal: node.matches(':modal'),
      top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right),
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      hitInside: Boolean(hit && node.contains(hit)),
      focusInside: node.contains(document.activeElement)
    };
  });
}
async function assertEscapeClosesOnlyTheLens(label) {
  await page.keyboard.press('Escape');
  await page.waitForFunction((selector) => !document.querySelector(selector), { timeout: 5000 }, `dialog${part('lens')}`);
  await new Promise((resolve) => setTimeout(resolve, 250));
  const state = await page.evaluate((selector) => ({
    wing: Boolean(document.querySelector(selector)),
    focus: document.activeElement?.getAttribute('aria-haspopup') === 'dialog'
  }), wing2030);
  const mode = await interfaceMode();
  assert(`${label}: Escape closes the lens without leaving the interface`, state.wing && mode === 'interface', JSON.stringify({ ...state, mode }));
  assert(`${label}: closing the lens returns focus to its toggle`, state.focus);
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
  await open('/experience/?year=2030&view=interface', wing2030);
  assert('Desktop 2030 uses a native interface with no future iframe', await page.$$eval('iframe', (frames) => frames.every((frame) => !/\/legacy\/experience\/(2030|2040)\//.test(frame.src))));
  assert('2030 is a labelled region framed as imagined, not a nested main landmark', await page.$eval(wing2030, (node) => (
    node.tagName === 'SECTION'
      && document.getElementById(node.getAttribute('aria-labelledby') ?? '')?.textContent === 'Morning, Together'
      && !node.querySelector('main')
      && /Imagined/.test(node.textContent ?? '')
  )));
  assert('2030 begins as a live contextual exchange with Saito speaking first', await page.$eval(wing2030, (node, parts) => (
    node.getAttribute('data-beat') === 'exchange'
      && node.querySelector(`${parts.exchange} li[data-speaker="saito"]`)?.textContent.includes('let the alarm fall away')
      && node.querySelector(parts.signal)?.textContent.includes('LOCAL INPUTS')
      && Boolean(node.querySelector(parts.reply))
      && Boolean(node.querySelector('[role="status"]'))
  ), { exchange: part('exchange'), signal: part('signal'), reply: part('reply') }));

  await openLens();
  const desktopLens = await lensGeometry();
  assert('The boundary lens opens as a modal dialog, on screen, with focus inside', desktopLens.modal && desktopLens.hitInside && desktopLens.focusInside && desktopLens.top >= 0 && desktopLens.bottom <= desktopLens.viewportHeight, JSON.stringify(desktopLens));
  assert('The lens shows Saito’s standing permissions by tier', await page.$eval(`dialog${part('lens')}`, (node) => node.textContent.includes('Full auto') && node.textContent.includes('Draft only') && node.textContent.includes('Money')));
  assert('The lens keeps the five-step decision record', await page.$eval(`dialog${part('lens')}`, (node) => ['Sense', 'Interpret', 'Check authority', 'Act or wait', 'Receipt'].every((label) => node.textContent.includes(label))));
  await page.$$eval(`dialog${part('lens')} button[aria-pressed]`, (buttons) => buttons.find((button) => button.textContent.includes('Check authority'))?.click());
  assert('The lens exposes authority and data boundaries', await page.$eval(`dialog${part('lens')}`, (node) => node.textContent.includes('Room comfort may change; communication may not.') && node.textContent.includes('requires Kevin')));
  assert('Visitor copy links TokenPak to its case study instead of naming TIP/PAK', await page.$eval(`dialog${part('lens')}`, (node) => Boolean(node.querySelector('a[href*="/work/tokenpak"]')) && !/TIP authority|PAK context/.test(node.textContent ?? '')));
  await assertEscapeClosesOnlyTheLens('Desktop');

  await finishCoexistenceExchange();
  assert('The conversation ends with Saito reporting the action it actually took', await page.$eval(part('exchange'), (node) => node.textContent.includes('zero messages read')));
  assert('The finished exchange reveals the multi-domain work Saito already staged', await page.$eval(part('staged'), (node) => node.textContent.includes('9:30 call moved itself') && node.textContent.includes('Waits for Kevin')));
  assert('The page holds still on the consent question', await page.$eval(wing2030, (node, consent) => node.getAttribute('data-beat') === 'consent' && Boolean(node.querySelector(consent)), part('consent')));
  await clickButton('Keep it with me');
  await clickPart('next-moment');
  await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-moment') === 'making', {}, wing2030);
  await clickPart('skip');
  await clickButton('Let it end here');
  await clickPart('next-moment');
  await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-moment') === 'work', {}, wing2030);
  await clickPart('skip');
  await clickButton('Let it end here');
  await page.$$eval('nav[aria-label="A day with Saito"] button', (buttons) => buttons.find((button) => button.textContent.includes('20:15'))?.click());
  await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute('data-moment') === 'evening', {}, wing2030);
  assert('The 20:15 anchor holds its seed back until Saito speaks', await page.$eval(part('seed'), (node) => node.textContent.includes('Seed held') && !node.textContent.includes('Asia')));
  await clickPart('skip');
  assert('The revealed seed and staged year surface while booking stays behind the human gate', await page.$eval(wing2030, (node, parts) => {
    const seed = node.querySelector(parts.seed)?.textContent ?? '';
    return seed.includes('eleven weeks ago') && seed.includes('Asia')
      && node.textContent.includes('Nothing is booked, nothing is spent')
      && node.querySelector(`${parts.staged} li[data-state="gated"]`)?.textContent.includes('booking');
  }, { seed: part('seed'), staged: part('staged') }));
  await clickButton('Keep it with me');
  const coexistenceGeometry = await geometry(wing2030);
  const coexistenceStageGeometry = await geometry(`${wing2030} ${part('stage')}`);
  assert('Desktop 2030 stays within the viewport', coexistenceGeometry.outerOverflow <= 1 && coexistenceGeometry.left >= 0 && coexistenceGeometry.right <= coexistenceGeometry.viewportWidth + 1 && coexistenceStageGeometry.componentOverflow <= 1, JSON.stringify({ root: coexistenceGeometry, stage: coexistenceStageGeometry }));

  await clickPart('forward');
  await page.waitForSelector(wing2040, { timeout: 10000 });
  assert('Saito remains exclusive to the 2030 experience', await page.$eval(wing2040, (node) => !/Saito/i.test(node.textContent ?? '')));
  assert('2040 reports only the memories permitted in 2030', await page.$eval(`${wing2040} [role="img"]`, (node) => node.getAttribute('aria-label') === '2 of 6 memories permitted'));
  assert('2040 makes its blanks feel earned', await page.$eval(part('memory-line'), (node) => node.textContent.includes('You kept 2 of 6 moments; this is all he has.')));
  await page.$$eval('nav[aria-label="Things Kevin can notice"] button', (buttons) => buttons.find((button) => button.textContent.includes('An unfinished sentence'))?.click());
  await clickButton('Let Kevin recall');
  await page.waitForFunction((selector) => document.querySelector(`${selector} blockquote`)?.textContent.includes('deliberate blank'), {}, part('encounter'));
  await clickButton('Pull the sentence to its source');
  assert('Withheld 2030 memory becomes a sourced deliberate blank in 2040', await page.$eval(part('source'), (node) => node.textContent.includes('deliberately withheld') && node.textContent.includes('conjecture')));
  await clickButton('Let Kevin deliberate');
  await clickButton('Let Kevin act');
  await clickButton('Let Kevin continue');
  await page.waitForSelector(part('retention'));
  assert('The consciousness loop ends by asking permission', await page.$eval(part('retention'), (node) => node.textContent.includes('May I keep this?')));
  await clickButton('No—let me disappear');
  await page.waitForSelector(part('closing'));
  assert('Releasing him is final and closes on the six-era payoff', await page.$eval(wing2040, (node, closing) => {
    const panel = node.querySelector(closing);
    const cues = [...node.querySelectorAll('nav[aria-label="Things Kevin can notice"] button')];
    return node.getAttribute('data-retention') === 'released'
      && panel?.textContent.includes('The interfaces changed. The pattern did not.')
      && panel?.querySelectorAll('ol li').length === 6
      && Boolean(panel?.querySelector('a[href*="/work"]') && panel?.querySelector('a[href*="/contact"]'))
      && cues.length === 5 && cues.every((cue) => cue.disabled);
  }, part('closing')));
  const consciousnessGeometry = await geometry(wing2040);
  const consciousnessStageGeometry = await geometry(`${wing2040} ${part('stage')}`);
  assert('Desktop 2040 and its closing panel stay within the viewport', consciousnessGeometry.outerOverflow <= 1 && consciousnessGeometry.left >= 0 && consciousnessGeometry.right <= consciousnessGeometry.viewportWidth + 1 && consciousnessStageGeometry.componentOverflow <= 1, JSON.stringify({ root: consciousnessGeometry, stage: consciousnessStageGeometry }));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await open('/experience/?year=2030&view=interface', wing2030);
  const mobileCoexistence = await geometry(wing2030);
  const mobileCoexistenceStage = await geometry(`${wing2030} ${part('stage')}`);
  assert('Mobile 2030 has no horizontal overflow', mobileCoexistence.outerOverflow <= 1 && mobileCoexistence.left >= 0 && mobileCoexistence.right <= mobileCoexistence.viewportWidth + 1 && mobileCoexistenceStage.componentOverflow <= 1 && mobileCoexistenceStage.left >= 0 && mobileCoexistenceStage.right <= mobileCoexistenceStage.viewportWidth + 1, JSON.stringify({ root: mobileCoexistence, stage: mobileCoexistenceStage }));
  assert('Mobile 2030 keeps the imagined framing and a readable disclosure', await page.$eval(wing2030, (node) => {
    const footer = node.querySelector('footer p');
    return /Imagined/.test(node.textContent ?? '') && Boolean(footer) && getComputedStyle(footer).whiteSpace !== 'nowrap';
  }));
  assert('Mobile Co-Existence preserves consent state across reloads', await page.evaluate(() => {
    const persisted = JSON.parse(localStorage.getItem('kevinception-v7') || 'null');
    const coexistence = persisted?.state?.futureJourney?.coexistence;
    return persisted?.version === 5
      && !('mission' in (persisted?.state?.futureJourney ?? {}))
      && coexistence?.keptMoments?.includes('morning')
      && coexistence?.refusedMoments?.includes('making')
      && coexistence?.refusedMoments?.includes('work');
  }));
  // Scroll the stage down to the question (as a phone visitor would), then open the lens.
  await clickPart('skip');
  await page.$eval(`${wing2030} ${part('stage')}`, (stage) => { stage.scrollTop = stage.scrollHeight; });
  await new Promise((resolve) => setTimeout(resolve, 200));
  const scrolled = await page.$eval(`${wing2030} ${part('stage')}`, (stage) => stage.scrollTop);
  await openLens();
  const mobileLens = await lensGeometry();
  assert('Mobile 390px: the lens is fully visible after the stage has scrolled', scrolled > 0 && mobileLens.modal && mobileLens.hitInside && mobileLens.top >= 0 && mobileLens.left >= 0 && mobileLens.right <= mobileLens.viewportWidth && mobileLens.bottom <= mobileLens.viewportHeight, JSON.stringify({ scrolled, ...mobileLens }));
  await assertEscapeClosesOnlyTheLens('Mobile');

  await open('/experience/?year=2040&view=interface', wing2040);
  const mobileConsciousness = await geometry(wing2040);
  const mobileConsciousnessStage = await geometry(`${wing2040} ${part('stage')}`);
  assert('Mobile 2040 has no horizontal overflow', mobileConsciousness.outerOverflow <= 1 && mobileConsciousness.left >= 0 && mobileConsciousness.right <= mobileConsciousness.viewportWidth + 1 && mobileConsciousnessStage.componentOverflow <= 1 && mobileConsciousnessStage.left >= 0 && mobileConsciousnessStage.right <= mobileConsciousnessStage.viewportWidth + 1, JSON.stringify({ root: mobileConsciousness, stage: mobileConsciousnessStage }));
  const closingTargets = await page.$eval(part('closing'), (node) => ({
    width: Math.round(node.getBoundingClientRect().width),
    actions: [...node.querySelectorAll('a, button')].map((action) => {
      const rect = action.getBoundingClientRect();
      return { label: action.textContent?.trim(), width: Math.round(rect.width), height: Math.round(rect.height) };
    })
  }));
  assert('Mobile 2040 stacks the closing actions full width with 44px targets', closingTargets.actions.length >= 4 && closingTargets.actions.every((action) => action.height >= 44 && action.width >= Math.min(closingTargets.width * .9, 280) - 1), JSON.stringify(closingTargets));

  await open('/experience/?year=2040&view=text', '.text-mode section[aria-labelledby="future-text-consciousness-title"]');
  const mobileText = await geometry('.text-mode');
  assert('Mobile future text mode has no horizontal overflow', mobileText.outerOverflow <= 1 && mobileText.componentOverflow <= 1, JSON.stringify(mobileText));
  assert('Text mode preserves the earned memory line and the closing payoff', await page.$eval('section[aria-labelledby="future-text-consciousness-title"]', (node, closing) => node.textContent.includes('You kept 2 of 6 moments') && Boolean(node.querySelector(closing)?.textContent.includes('The interfaces changed.')), part('closing')));

  assert('The future smoke path emits no console errors', report.consoleErrors.length === 0, report.consoleErrors.join(' | '));
  assert('The future smoke path emits no page errors', report.pageErrors.length === 0, report.pageErrors.join(' | '));
  assert('The future smoke path emits no request failures', report.requestFailures.length === 0, report.requestFailures.join(' | '));
} finally {
  await browser.close();
  writeReport('runtime-future-native', report);
}

console.log(JSON.stringify(report, null, 2));
