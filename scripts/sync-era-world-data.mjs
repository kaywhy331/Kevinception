import fs from 'node:fs';

const sourcePath = 'src/content/data.ts';
const targetYears = ['1990', '2020', '2030', '2040'];
const source = fs.readFileSync(sourcePath, 'utf8');

function parseJsonExport(name, closingToken) {
  const marker = `export const ${name} = `;
  const start = source.indexOf(marker);
  const end = source.indexOf(closingToken, start);
  if (start < 0 || end < 0) throw new Error(`Unable to read ${name} from ${sourcePath}.`);
  return JSON.parse(source.slice(start + marker.length, end + 1));
}

function serializeForHtml(value) {
  return JSON.stringify(value)
    .replaceAll('&', '\\u0026')
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

function synchronizeEraLabels(html) {
  return html.replaceAll('Kevazon Marketplace', 'StealStreet Commerce OS');
}

const canonical = {
  eras: parseJsonExport('eras', '] as const;'),
  projects: parseJsonExport('projects', '] as const;'),
  knowledgeBase: parseJsonExport('knowledgeBase', '} as const;'),
  timelineContent: parseJsonExport('timelineContent', '} as const;')
};

const temporalArtifacts = {
  '1990': {
    id: 'broadcast-signal',
    name: 'Signal Fragment: Curiosity',
    description: 'A fragment recovered from Channel 3 after the Circuit of Time was restored.'
  },
  '2010': {
    id: 'project-blueprint',
    name: 'Project Blueprint',
    description: 'A commerce operating-system map connecting vendors, purchasing, inventory, catalog, marketplaces, orders, fulfillment, and the customer promise.'
  },
  '2020': {
    id: 'unposted-loop',
    name: 'Unposted KevTok Draft',
    description: 'A nine-second clip containing frames from 1990, 2000, 2030, and 2040.'
  },
  '2030': {
    id: 'agent-memory',
    name: '2030 Consent Thread',
    description: 'An ordinary moment allowed to travel from Morning, Together into the consciousness ten years ahead.'
  },
  '2040': {
    id: 'echo-shard',
    name: 'Holographic Kevin Trace',
    description: 'A source-bound fragment of the permissioned self that still points back to the first television signal.'
  }
};

function temporalArtifactsFor(year) {
  return {
    ...temporalArtifacts,
    '2030': year === '2030'
      ? { ...temporalArtifacts['2030'], name: 'Saito Consent Thread' }
      : temporalArtifacts['2030']
  };
}

for (const year of targetYears) {
  const filePath = `public/legacy/experience/${year}/index.html`;
  const html = fs.readFileSync(filePath, 'utf8');
  const pattern = /<script type="application\/json" id="era-world-data">([\s\S]*?)<\/script>/;
  const match = html.match(pattern);
  if (!match) throw new Error(`Embedded era-world-data payload is missing from ${filePath}.`);

  const payload = JSON.parse(match[1]);
  payload.era = canonical.eras.find((era) => era.id === year);
  payload.eras = canonical.eras;
  payload.projects = canonical.projects;
  payload.knowledgeBase = canonical.knowledgeBase;
  payload.temporalArtifacts = temporalArtifactsFor(year);
  payload.timelineContent = canonical.timelineContent;

  const replacement = `<script type="application/json" id="era-world-data">${serializeForHtml(payload)}</script>`;
  fs.writeFileSync(filePath, synchronizeEraLabels(html.replace(pattern, replacement)));
  console.log(`Synchronized ${filePath}`);
}
