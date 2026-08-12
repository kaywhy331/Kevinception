import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterNarrative } from '@/content/narrative';
import { eras, timelineContent } from '@/content/data';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('Commerce and Coexistence chapters', () => {
  it('defines the 2010 Commerce operating-system contract and verified scale', () => {
    expect(chapterNarrative['2010'].chapterName).toBe('Commerce');
    expect(chapterNarrative['2010'].experienceName).toBe('Kevazon Marketplace');
    expect(eras.find((era) => era.id === '2010')?.label).toBe('Commerce');
    expect(timelineContent['2010'].operations.catalogScale).toBe('1.5M catalog records');
    expect(timelineContent['2010'].operations.channelScale).toBe('20+ commerce channels');
    expect(timelineContent['2010'].operations.lifecycle.map((stage) => stage.label)).toEqual([
      'Vendors', 'Purchase Orders', 'Inventory', 'Catalog', 'Marketplaces', 'Customer Orders', 'Warehouse', 'Customer'
    ]);
    expect(timelineContent['2010'].modules).toHaveLength(12);
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
    expect(html).toContain('Kevazon Marketplace');
    expect(html).toContain('Operations command center');
    expect(html).toContain('One operating system connecting purchasing, catalog, marketplaces, fulfillment, customers, and the team.');
    expect(html).toContain('One system from vendor purchase to customer promise');
    expect(html).toContain('Built in-house · proprietary platform');
    expect(html).toContain('Settings / Administration');
    expect(html).toContain('1.5M</strong> searchable product records');
    expect(html).toContain('20+ commerce channels, one operations layer');
    expect(html).toContain('Needs Attention');
    expect(html).toContain('Company homebase');
    expect(html).toContain('Amazon FBA');
    expect(html).toContain('role="table"');
    expect(html).toContain('aria-label="Commerce lifecycle"');
    expect(html).toContain('aria-label="Illustrative eight-period inventory velocity index');
    expect(script).toContain("function advanceOrder(id)");
    expect(script).toContain("function runGlobalSearch(query)");
    expect(script).toContain("setTab('catalog')");
    expect(script).toContain("function runSync()");
    expect(script).toContain("function recoverArchive()");
    expect(script).toContain("kevinception:artifact");
    expect(script).toContain("function renderMarketplaces(query = '')");
    expect(script).toContain("function renderModule(id)");
    expect(styles).toContain('@media (max-width: 720px)');
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
    expect(overlay).toContain("'collaborators' in yearData");
    expect(overlay).toContain('Human and AI collaborators');
    expect(scene).toContain('Kevin · Human Lead');
    expect(scene).toContain('Human Governor');
  });

  it('keeps every shared legacy payload synchronized with the canonical chapters', () => {
    for (const year of ['1990', '2020', '2030', '2040']) {
      const html = read(`public/legacy/experience/${year}/index.html`);
      const payload = JSON.parse(html.match(/id="era-world-data">([\s\S]*?)<\/script>/)?.[1] || '{}');
      expect(payload.eras.find((era: { id: string }) => era.id === '2010')).toMatchObject({ label: 'Commerce', subtitle: 'Kevazon Marketplace' });
      expect(payload.eras.find((era: { id: string }) => era.id === '2030')).toMatchObject({ label: 'Coexistence', subtitle: 'Kevin Nexus' });
      expect(payload.timelineContent['2010'].operations.catalogScale).toBe('1.5M catalog records');
      expect(payload.timelineContent['2010'].operations.channelScale).toBe('20+ commerce channels');
      expect(payload.timelineContent['2040'].responses.memory).toContain('Commerce, Creation, Coexistence');
      expect(payload.temporalArtifacts['2010']).toMatchObject({ id: 'project-blueprint', name: 'Project Blueprint' });
    }
  });
});
