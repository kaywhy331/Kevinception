// Shared launcher and output helpers for the Puppeteer runtime probes.
//
// Every probe writes screenshots and JSON reports under the gitignored
// `artifacts/` directory (override with ARTIFACTS_DIR) so local runs never
// rewrite tracked files.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

export const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
export const artifactsRoot = path.resolve(process.env.ARTIFACTS_DIR ?? 'artifacts');

export function browserCandidates() {
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
    list.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser');
    const playwrightCache = path.join(os.homedir(), '.cache', 'ms-playwright');
    if (fs.existsSync(playwrightCache)) {
      for (const directory of fs.readdirSync(playwrightCache).sort().reverse()) {
        list.push(
          path.join(playwrightCache, directory, 'chrome-linux64', 'chrome'),
          path.join(playwrightCache, directory, 'chrome-linux', 'chrome')
        );
      }
    }
  }
  return list.filter(Boolean);
}

export function findBrowser() {
  const executablePath = browserCandidates().find((candidate) => fs.existsSync(candidate));
  if (!executablePath) {
    throw new Error('No supported Chromium browser was found. Set CHROME_PATH to Chrome, Chromium, or Edge.');
  }
  return executablePath;
}

const defaultArgs = [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--ignore-gpu-blocklist',
  '--enable-webgl',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader'
];

/** Launch headless Chromium with the flags every probe needs for software WebGL. */
export async function launchBrowser({ args = defaultArgs } = {}) {
  const executablePath = findBrowser();
  const browser = await puppeteer.launch({ executablePath, headless: true, args });
  return { browser, executablePath };
}

/** Absolute path to an artifacts subdirectory, created on demand. */
export function artifactPath(...segments) {
  const target = path.join(artifactsRoot, ...segments);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  return target;
}

/** Write a probe's JSON report to artifacts/<name>.json and return the path. */
export function writeReport(name, report) {
  const target = artifactPath(`${name}.json`);
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
  return target;
}
