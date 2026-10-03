/* global window, document, getComputedStyle */
// Six-era journey audit probe: one browser, one page at a time.
//
// For each era route (room, interface, text) at each width it records overflow,
// console/page errors, title, heading outline, small tap targets, the keyboard
// focus order, focusable elements hidden from assistive technology, and load cost.
// Findings are measurements from synthetic headless Chromium, not real-device data.
import { launchBrowser, writeReport, artifactPath } from './lib/browser.mjs';

// Usage: node scripts/journey-audit.mjs [widths=390,768,1440] [eras=all] [views=environment,interface,text] [report=journey-audit]
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4416';
const ERAS = ['1990', '2000', '2010', '2020', '2030', '2040'];
const ALL_VIEWS = { environment: ['environment', ''], interface: ['interface', '?view=interface'], text: ['text', '?view=text'] };
const WIDTHS = (process.argv[2] ?? '390,768,1440').split(',').map(Number);
const ONLY_ERAS = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',') : ERAS;
const VIEWS = (process.argv[4] ?? 'environment,interface,text').split(',').map((name) => ALL_VIEWS[name]);

const { browser, executablePath } = await launchBrowser({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] });
const report = { generatedAt: new Date().toISOString(), browser: executablePath, base, limitation: 'Synthetic headless Chromium with software WebGL; not a physical device, hardware GPU, or screen reader.', results: [] };

async function audit(era, [view, query], width) {
  const page = await browser.newPage();
  const errors = [];
  const failures = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('requestfailed', (request) => { const reason = request.failure()?.errorText; if (reason !== 'net::ERR_ABORTED') failures.push(`${request.url()} ${reason}`); });
  let bytes = 0;
  page.on('response', async (response) => { try { bytes += Number(response.headers()['content-length'] ?? 0); } catch { /* ignore */ } });
  const entry = { era, view, width };
  try {
    await page.setViewport({ width, height: width < 700 ? 844 : 900, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      window.__cls = 0; window.__long = 0;
      try { new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch { /* unsupported */ }
      try { new PerformanceObserver((list) => { window.__long += list.getEntries().length; }).observe({ type: 'longtask', buffered: true }); } catch { /* unsupported */ }
    });
    const started = Date.now();
    await page.goto(`${base}/experience/${era}/${query}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const selector = view === 'interface' ? '.interface-mode.is-visible' : view === 'text' ? '.text-mode' : '.experience-scene';
    await page.waitForSelector(selector, { timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    entry.readyMs = Date.now() - started;
    entry.finalUrl = new URL(page.url()).pathname + new URL(page.url()).search;
    entry.title = await page.title();
    Object.assign(entry, await page.evaluate(() => {
      const visible = (node) => { const r = node.getBoundingClientRect(); const s = getComputedStyle(node); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const hiddenFocusable = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
        .filter((node) => node.getAttribute('tabindex') !== '-1' && !node.disabled && node.closest('[aria-hidden="true"]') && !node.closest('[inert]'))
        .map((node) => `${node.tagName.toLowerCase()}.${String(node.className).slice(0, 40)} "${(node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 30)}"`);
      const small = [...document.querySelectorAll('a[href], button, [role="menuitem"]')]
        .filter((node) => visible(node) && !node.closest('[inert],[aria-hidden="true"]'))
        .map((node) => { const r = node.getBoundingClientRect(); return { name: (node.getAttribute('aria-label') || node.textContent || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }; })
        .filter((item) => item.w < 24 || item.h < 24);
      const dupNavLabels = {};
      document.querySelectorAll('nav[aria-label]').forEach((nav) => { if (visible(nav) && !nav.closest('[inert],[aria-hidden="true"]')) dupNavLabels[nav.getAttribute('aria-label')] = (dupNavLabels[nav.getAttribute('aria-label')] ?? 0) + 1; });
      return {
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        h1: [...document.querySelectorAll('h1')].filter((node) => visible(node) && !node.closest('[inert],[aria-hidden="true"]')).map((node) => node.textContent.trim().slice(0, 60)),
        mainCount: document.querySelectorAll('main').length,
        hiddenFocusable,
        smallTargets: small,
        visibleNavLabels: dupNavLabels,
        cls: Number((window.__cls ?? 0).toFixed(4)),
        longTasks: window.__long ?? 0,
        heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
        domNodes: document.getElementsByTagName('*').length
      };
    }));
    const focusOrder = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      focusOrder.push(await page.evaluate(() => {
        const node = document.activeElement;
        if (!node || node === document.body) return 'body';
        const r = node.getBoundingClientRect();
        const inView = r.bottom > 0 && r.right > 0 && r.left < window.innerWidth && r.top < window.innerHeight;
        return `${node.tagName.toLowerCase()} "${(node.getAttribute('aria-label') || node.textContent || '').trim().slice(0, 36)}"${inView ? '' : ' [OFFSCREEN]'}${node.closest('[inert],[aria-hidden="true"]') ? ' [HIDDEN-SUBTREE]' : ''}`;
      }));
    }
    entry.focusOrder = focusOrder;
    entry.transferKB = Math.round(bytes / 1024);
    entry.requestFailures = failures;
    entry.consoleErrors = errors;
    await page.screenshot({ path: artifactPath('journey-audit', `${era}-${view}-${width}.png`) });
  } catch (error) {
    entry.error = String(error).slice(0, 300);
  } finally {
    await page.close();
  }
  report.results.push(entry);
}

try {
  for (const era of ONLY_ERAS) for (const view of VIEWS) for (const width of WIDTHS) await audit(era, view, width);
} finally {
  await browser.close();
  console.log(writeReport(process.argv[5] ?? 'journey-audit', report));
}
