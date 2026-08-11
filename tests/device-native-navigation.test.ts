import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MobileNav, type MobileNavItem } from '@/components/MobileNav';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('V7.7 device-native navigation', () => {
  it('keeps the 2030 and 2040 camera centered and disables future-room parallax', () => {
    const camera = read('src/experience/CameraRig.tsx');
    expect(camera).toContain("const futureRoom = activeYear === '2030' || activeYear === '2040'");
    expect(camera).toContain('position: [stationX, narrow ? 5.75');
    expect(camera).toContain('target: [stationX, futureRoom ? 2.2');
    expect(camera).toContain("motion === 'reduced' || futureRoom");
    expect(camera).not.toContain('futureCameraOffset');
    expect(camera).not.toContain('futureTargetOffset');
  });

  it('uses a slim frame bar and removes duplicated interface navigation', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const styles = read('app/device-native-pass.css');
    expect(overlay).toContain('interface-mode__chapter');
    expect(overlay).toContain('aria-label="Experience frame controls"');
    expect(overlay).toContain('>Step back</button>');
    expect(overlay).toContain('>Chapters</button>');
    expect(overlay).toContain(".era-utility{display:none!important}");
    expect(styles).toContain('grid-template-rows: 2.35rem minmax(0,1fr)');
    expect(styles).toContain('.mode-interface .experience-toolbar { display: none; }');
  });

  it('condenses global utilities behind one menu', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    expect(overlay).toContain('function UtilityMenu');
    expect(overlay).toContain('experience-menu__popover');
    expect(overlay).toContain('Artifacts <span>{foundCount}/{artifacts.length}</span>');
    expect(overlay).toContain('Text version');
    expect(overlay).toContain('<div className="experience-menu">');
    expect(overlay).not.toContain('experience-menu hide-below-680');
  });

  it('keeps every standard route available in an accessible mobile disclosure menu', () => {
    const chrome = read('src/components/SiteChrome.tsx');
    const mobileNav = read('src/components/MobileNav.tsx');
    const styles = read('app/globals.css');
    const timelinePage = read('app/experience/page.tsx');
    const caseStudiesPage = read('app/work/page.tsx');
    for (const [href, label] of [
      ['/experience/', 'Timeline'],
      ['/portfolio/', 'Profile'],
      ['/work/', 'Case studies'],
      ['/resume/', 'Resume'],
      ['/about/', 'About'],
      ['/contact/', 'Contact']
    ]) {
      expect(chrome).toContain(`{ href: '${href}', label: '${label}'`);
    }
    expect(mobileNav).toContain('aria-expanded={open}');
    expect(mobileNav).toContain('aria-controls={menuId}');
    expect(mobileNav).toContain("event.key !== 'Escape'");
    expect(mobileNav).toContain('buttonRef.current?.focus()');
    expect(mobileNav).toContain('onClick={() => setOpen(false)}');
    expect(chrome).toContain('<Link href="/experience/">Timeline</Link>');
    expect(chrome).toContain('<Link href="/work/">Case studies</Link>');
    expect(timelinePage).toContain("title: 'Timeline'");
    expect(caseStudiesPage).toContain("title: 'Case studies'");
    expect(styles).toContain('.site-header__mobile-nav { display: block; }');
    expect(styles).not.toContain('nav a:not(.site-header__cta) { display: none; }');
    expect(styles).not.toContain('nav a:not(.site-header__cta):nth-child(n+4)');
  });

  it('opens, closes on link activation, and restores button focus on Escape', () => {
    const items: readonly MobileNavItem[] = [
      { href: '/experience/', label: 'Timeline' },
      { href: '/portfolio/', label: 'Profile' },
      { href: '/work/', label: 'Case studies' },
      { href: '/resume/', label: 'Resume' },
      { href: '/about/', label: 'About' },
      { href: '/contact/', label: 'Contact', cta: true }
    ];
    render(createElement(MobileNav, { items }));
    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    for (const item of items) expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href.replace(/\/$/, ''));

    const timelineLink = screen.getByRole('link', { name: 'Timeline' });
    timelineLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(timelineLink);
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    screen.getByRole('link', { name: 'Profile' }).focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('uses named responsive controls and preserves readable mobile truncation', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const globalStyles = read('app/globals.css');
    const environmentStyles = read('app/environment-pass.css');
    expect(overlay).toContain('className="experience-menu"');
    expect(overlay).toContain('className="hide-below-640" href="/portfolio/"');
    expect(globalStyles).not.toContain('.hide-below-680 { display: none !important; }');
    expect(globalStyles).toContain('.hide-below-640 { display: none !important; }');
    expect(globalStyles).toContain('-webkit-line-clamp: 3');
    expect(globalStyles).toContain('.artifact-drawer section small { color: #7f8998; }');
    expect(globalStyles).not.toMatch(/\.experience-toolbar[^\n]*:nth-child/);
    expect(environmentStyles).not.toMatch(/\.experience-toolbar[^\n]*:nth-child/);
    expect(environmentStyles).not.toContain('.interface-mode__bar nav button:first-child');
  });

  it('provides a real skip target and keyboard controls for WebGL hotspots', () => {
    const shell = read('src/experience/ExperienceShell.tsx');
    const timelinePage = read('app/experience/page.tsx');
    const eraPage = read('app/experience/[year]/page.tsx');
    const sceneUtils = read('src/experience/scenes/SceneUtils.tsx');
    const styles = read('app/globals.css');
    expect(shell).toContain('<main id="main-content" className="experience-root"');
    expect(shell).toContain('tabIndex={-1}');
    expect(timelinePage).not.toContain('id="main-content"');
    expect(eraPage).not.toContain('id="main-content"');
    expect(sceneUtils).toContain('<Html center className="scene-hotspot-control"');
    expect(sceneUtils).toContain('<button type="button" onClick={onClick}>{label}</button>');
    expect(styles).toContain('.scene-hotspot-control button:focus-visible');
  });

  it('loads a device-native KevTok layer inside the embedded 2020 interface', () => {
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const script = read('public/legacy/assets/client/kevtok-native.js');
    const styles = read('public/legacy/assets/styles/kevtok-native.css');
    expect(() => new Function(script)).not.toThrow();
    expect(overlay).toContain("script.src = '/legacy/assets/client/kevtok-native.js'");
    expect(overlay).toContain("link.href = '/legacy/assets/styles/kevtok-native.css'");
    for (const item of ['home', 'discover', 'create', 'inbox', 'profile']) {
      expect(script).toContain(`data-kt-nav="${item}"`);
    }
    expect(script).toContain("createDialog('discover'");
    expect(script).toContain("createDialog('create'");
    expect(script).toContain("createDialog('inbox'");
    expect(script).toContain("createDialog('profile'");
    expect(script).toContain('syncActionCounts');
    expect(script).toContain('now - lastTap < 320');
    expect(styles).toContain('.kt-heart-burst');
    expect(styles).toContain('.kt-native-profile');
  });
});
