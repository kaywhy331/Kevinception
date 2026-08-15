import type { YearId } from '@/content/data';

export type ArtifactId = 'signal-fragment' | 'identity-handle' | 'project-blueprint' | 'next-layer-message' | 'human-gate';

export type ArtifactDefinition = {
  id: ArtifactId;
  title: string;
  meaning: string;
  discoveryYear: YearId;
  discoveryHint: string;
  transformations: Record<YearId, string>;
};

export const artifacts: ArtifactDefinition[] = [
  {
    id: 'signal-fragment', title: 'Signal Fragment', meaning: 'Curiosity persists while its container changes.', discoveryYear: '1990', discoveryHint: 'Power on the cartridge console in KevinVision.',
    transformations: {
      '1990': '8-bit collectible', '2000': 'downloaded .SIG file', '2010': 'hidden archive SKU', '2020': 'saved draft asset', '2030': 'remembered room tone', '2040': 'source-bound perception'
    }
  },
  {
    id: 'identity-handle', title: 'Identity Handle', meaning: 'Online identity evolves from initials into a reconstructed self.', discoveryYear: '2000', discoveryHint: 'Inspect the 56K modem in Kevin Online.',
    transformations: {
      '1990': 'high-score initials', '2000': 'screen name', '2010': 'seller account', '2020': 'creator handle', '2030': 'companion boundary', '2040': 'permissioned self-signature'
    }
  },
  {
    id: 'project-blueprint', title: 'Project Blueprint', meaning: 'The same idea can become a manual, attachment, workflow, clip, graph, or memory.', discoveryYear: '2010', discoveryHint: 'Inspect the commerce operating-system map beside the fulfillment workstation.',
    transformations: {
      '1990': 'cartridge manual', '2000': 'ZIP attachment', '2010': 'fulfillment process map', '2020': 'behind-the-scenes clip', '2030': 'shared draft with dissent', '2040': 'visible deliberation trace'
    }
  },
  {
    id: 'next-layer-message', title: 'Message From the Next Layer', meaning: 'Each era receives evidence that another interface exists beyond it.', discoveryYear: '2020', discoveryHint: 'Open KevTok from the creator room.',
    transformations: {
      '1990': 'scrambled broadcast', '2000': 'unknown IM', '2010': 'future-dated order note', '2020': 'impossible comment', '2030': 'memory invitation', '2040': 'encounter permission'
    }
  },
  {
    id: 'human-gate', title: 'Human Gate', meaning: 'The interface changes; the right to remember remains human.', discoveryYear: '2030', discoveryHint: 'Tell Wren to keep one moment—or let it end—in Morning, Together.',
    transformations: {
      '1990': 'player choice', '2000': 'download confirmation', '2010': 'release or hold order', '2020': 'post or draft', '2030': 'keep / let end', '2040': 'remember / release encounter'
    }
  }
];
