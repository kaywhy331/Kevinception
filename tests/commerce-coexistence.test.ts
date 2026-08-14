import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterNarrative } from '@/content/narrative';
import { eras, timelineContent } from '@/content/data';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('Commerce and Coexistence chapters', () => {
  it('defines the 2010 Commerce operating-system contract and verified scale', () => {
    expect(chapterNarrative['2010'].chapterName).toBe('Commerce');
    expect(chapterNarrative['2010'].experienceName).toBe('StealStreet Commerce OS');
    expect(eras.find((era) => era.id === '2010')?.label).toBe('Commerce');
    expect(timelineContent['2010'].operations.catalogScale).toBe('1.5M catalog records');
    expect(timelineContent['2010'].operations.channelScale).toBe('20+ commerce channels');
    expect(timelineContent['2010'].operations.lifecycle.map((stage) => stage.label)).toEqual([
      'Vendors', 'Purchase Orders', 'Inventory', 'Catalog', 'Marketplaces', 'Customer Orders', 'Warehouse', 'Customer'
    ]);
    expect(timelineContent['2010'].modules).toHaveLength(13);
    expect(timelineContent['2010'].modules.slice(0, 2).map((module) => module.id)).toEqual(['home', 'dashboard']);
    expect(timelineContent['2010'].companyHub.breakRoom).toContain('Pool table');
    expect(timelineContent['2010'].companyHub.events).toContain('Big Bear company trip');
    expect(timelineContent['2010'].companyHub.guestIdentity).toBe('YOU (Time Traveler)');
    expect(timelineContent['2010'].companyHub.employees).toEqual([
      { name: 'Kevin', role: 'Co-Founder, CIO' },
      { name: 'Mike', role: 'Co-Founder, CEO' },
      { name: 'Joel', role: 'Operations Mgr.' },
      { name: 'Elvis', role: 'Catalog Mgr.' },
      { name: 'Tiffany', role: 'Company Culture' },
      { name: 'Virginia', role: 'Human Resource' },
      { name: 'Toni', role: 'Customer Service Mgr' },
      { name: 'Jennifer', role: 'Customer Service' },
      { name: 'Adam', role: 'Sr. Developer' },
      { name: 'Julia', role: 'Designer' },
      { name: 'Katrina', role: 'Marketing' },
      { name: 'Paul', role: 'Shipping Mgr.' },
      { name: 'Joseph', role: 'Warehouse Mgr.' },
      { name: 'Steven', role: 'Developer' },
      { name: 'Michael', role: 'Jr. Developer' },
      { name: 'Madison', role: 'Data' }
    ]);
    expect(timelineContent['2010'].marketplaces).toContain('Amazon FBA');
    expect(timelineContent['2010'].marketplaces).toContain('BuyGiftsWholesale.com');
    expect(timelineContent['2010'].orders.some((order) => order.status === 'Exception')).toBe(true);
    expect(timelineContent['2010'].purchaseOrders.some((po) => po.status === 'Exception')).toBe(true);
    expect(timelineContent['2010'].exceptions.map((exception) => exception.type)).toContain('Finance');
  });

  it('ships a functional, accessible commerce operating system without external assets', () => {
    const html = read('public/legacy/experience/2010/index.html');
    const script = read('public/legacy/assets/client/kevazon.js');
    const styles = read('public/legacy/assets/styles/kevazon.css');
    expect(html).toContain('StealStreet Commerce OS');
    expect(html).not.toContain('Built in-house by Kevin');
    expect(html).not.toContain('Co-founder &amp; systems builder');
    expect(html).not.toContain('class="kz-brand-block"');
    expect(html).toContain('YOU (Time Traveler)');
    expect(html).toContain('Order #, PO #, SKU, UPC, customer, vendor, tracking #');
    expect(html).toContain('Systems Healthy');
    expect(html).toContain('20+ Channels');
    expect(html).toContain('Settings / Administration');
    expect(html).toContain('PORTFOLIO RECONSTRUCTION');
    expect(html).toContain('Illustrative records');
    expect(html).toContain('kevazon.css?v=20260813-timetraveler1');
    expect(html).toContain('kevazon.js?v=20260813-timetraveler1');
    expect(html).toContain('.kz-era-bar{display:none!important}');
    expect(html).toContain('@media (min-width:761px){html[data-embedded="true"] .kz-sidebar{height:100svh!important}}');
    expect((html.match(/data-kz-tab=/g) ?? [])).toHaveLength(13);
    expect(script).toContain("const STORAGE_KEY = 'stealstreet-commerce-os-v7'");
    expect(script).toContain("const ACTIVE_USER = 'YOU (Time Traveler)'");
    expect(script).toContain("author:ACTIVE_USER");
    expect(script).toContain("post.comments.push({author:ACTIVE_USER");
    expect(script).toContain("user: ACTIVE_USER");
    expect(script).not.toContain("user: 'Kevin'");
    for (const renderer of ['renderHome', 'renderDashboard', 'renderOrders', 'renderPurchaseOrders', 'renderCatalog', 'renderInventory', 'renderMarketplaces', 'renderVendors', 'renderCustomerService', 'renderWarehouse', 'renderReturns', 'renderReports', 'renderSettings']) {
      expect(script).toContain(`function ${renderer}(`);
    }
    expect(script).toContain("function advanceOrder(id)");
    expect(script).toContain("function receivePO(id, quantity, damaged=0)");
    expect(script).toContain("function fixListing(sku)");
    expect(script).toContain("function restockReturn(id)");
    expect(script).toContain("function globalSearch(query)");
    expect(script).toContain("function reportData()");
    expect(script).toContain("kevinception:artifact");
    expect(script).toContain("kevinception:module-sync");
    expect(script).toContain("data-subtab=\"warehouse\"");
    expect(script).toContain("data-subtab=\"reports\"");
    expect(script).toContain("data-subtab=\"settings\"");
    expect(script).toContain('kz-exception-table');
    expect(script).toContain('kz-scale-ledger');
    expect(script).toContain('Vendor-to-Customer Operating Flow');
    expect(script).toContain('Executive Decision-Making Mug');
    expect(script).toContain('the break-room fridge is not an inventory location');
    expect(script).toContain('Everything is talking again. Suspiciously cooperative.');
    expect(script).toContain('decisions remain sold separately');
    expect(script).toContain("const ERA_YEAR = 2010");
    expect(script).toContain('Company Posts & Announcements');
    expect(script).toContain('Big Bear company trip');
    expect(script).toContain('White Elephant gift exchanges');
    expect(script).toContain('Pool Table');
    expect(script).toContain('Learning Library');
    expect(script).toContain('Add a comment');
    expect(script).toContain("{ name: 'Madison', role: 'Data'");
    expect(script).toContain("{ id: 'USR-16', name: 'Madison', role: 'Data'");
    expect(script).not.toMatch(/(?:orderDate|expectedDate|date):\s*['"]\d{1,2}\/\d{1,2}\/20(?:1[1-9]|2\d)['"]/);
    expect(script).not.toContain('IMP-2012');
    expect(script).toContain('interfacePulse');
    expect(script.indexOf("type:'kevinception:legacy-ready'")).toBeGreaterThan(script.indexOf('setModule(initialModule'));
    expect(html).not.toContain("type:'kevinception:legacy-ready'");
    expect(styles).toContain('Tahoma, Verdana, Arial, sans-serif');
    expect(styles).toContain('--brown-dark: #2a1712');
    expect(styles).toContain('--gold: #b9862f');
    expect(styles).toContain('--teal: #1f6b6d');
    expect(styles).toContain('grid-template-columns: repeat(8, minmax(0, 1fr))');
    expect(styles).toContain('.kz-dashboard-main');
    expect(styles).toContain('.kz-dashboard-main > *, .kz-dashboard-rail > *, .kz-exception-panel { min-width: 0; }');
    expect(styles).toContain('@media (max-width: 760px)');
    expect(html).not.toMatch(/https?:\/\/(?!kevinception\.com)/);
  });

  it('defines 2030 as Coexistence with explicit human authority', () => {
    expect(chapterNarrative['2030'].chapterName).toBe('Coexistence');
    expect(chapterNarrative['2030'].chapterThesis).toContain('humans provide intent');
    expect(eras.find((era) => era.id === '2030')?.label).toBe('Coexistence');
    expect(timelineContent['2030'].collaborators.map((collaborator) => collaborator.name)).toEqual([
      'Kevin · Human Lead',
      'AI Researcher',
      'AI Builder',
      'Human Governor',
      'AI Archivist'
    ]);
    const html = read('public/legacy/experience/2030/index.html');
    const overlay = read('src/experience/ExperienceOverlay.tsx');
    const scene = read('src/experience/scenes/Year2030Scene.tsx');
    expect(html).toContain('Kevin · Human Lead');
    expect(html).toContain('Human Governor');
    expect(html).toContain('AI initiative boundary');
    expect(html).toContain('Humans retain accountability');
    expect(html).not.toContain('Autonomous AI');
    const futureText = read('src/experience/future/FutureTextExperience.tsx');
    expect(overlay).toContain('<FutureTextExperience year="2030"');
    expect(futureText).toContain('Human and AI collaborators');
    expect(scene).toContain('Kevin · Human Lead');
    expect(scene).toContain('Human Governor');
  });

  it('keeps mutable legacy assets revalidated across deployment targets', () => {
    expect(read('public/_headers')).toContain('/legacy/assets/*\n  Cache-Control: public, max-age=0, must-revalidate');
    expect(read('vercel.json')).toContain('public, max-age=0, must-revalidate');
    expect(read('deploy/nginx.conf')).toContain('add_header Cache-Control "public, max-age=0, must-revalidate"');
  });

  it('keeps every shared legacy payload synchronized with the canonical chapters', () => {
    for (const year of ['1990', '2020', '2030', '2040']) {
      const html = read(`public/legacy/experience/${year}/index.html`);
      const payload = JSON.parse(html.match(/id="era-world-data">([\s\S]*?)<\/script>/)?.[1] || '{}');
      expect(payload.eras.find((era: { id: string }) => era.id === '2010')).toMatchObject({ label: 'Commerce', subtitle: 'StealStreet Commerce OS' });
      expect(payload.eras.find((era: { id: string }) => era.id === '2030')).toMatchObject({ label: 'Coexistence', subtitle: 'Kevin Nexus' });
      expect(payload.timelineContent['2010'].operations.catalogScale).toBe('1.5M catalog records');
      expect(payload.timelineContent['2010'].operations.channelScale).toBe('20+ commerce channels');
      expect(payload.timelineContent['2040'].responses.memory).toContain('Commerce, Creation, Coexistence');
      expect(payload.temporalArtifacts['2010']).toMatchObject({ id: 'project-blueprint', name: 'Project Blueprint' });
    }
  });
});
