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
      '1990': '8-bit collectible', '2000': 'downloaded .SIG file', '2010': 'tagged photo', '2020': 'saved draft asset', '2030': 'context packet', '2040': 'memory shard'
    }
  },
  {
    id: 'identity-handle', title: 'Identity Handle', meaning: 'Online identity evolves from initials into a reconstructed self.', discoveryYear: '2000', discoveryHint: 'Inspect the 56K modem in Kevin Online.',
    transformations: {
      '1990': 'high-score initials', '2000': 'screen name', '2010': 'social profile', '2020': 'creator handle', '2030': 'agent identity', '2040': 'reconstruction key'
    }
  },
  {
    id: 'project-blueprint', title: 'Project Blueprint', meaning: 'The same idea can become a manual, attachment, post, clip, graph, or memory.', discoveryYear: '2010', discoveryHint: 'Inspect the framed blueprint beside KevinBook.',
    transformations: {
      '1990': 'cartridge manual', '2000': 'ZIP attachment', '2010': 'Note and album', '2020': 'behind-the-scenes clip', '2030': 'architecture graph', '2040': 'reconstructed memory'
    }
  },
  {
    id: 'next-layer-message', title: 'Message From the Next Layer', meaning: 'Each era receives evidence that another interface exists beyond it.', discoveryYear: '2020', discoveryHint: 'Open KevTok from the creator room.',
    transformations: {
      '1990': 'scrambled broadcast', '2000': 'unknown IM', '2010': 'future-dated notification', '2020': 'impossible comment', '2030': 'unregistered handoff', '2040': 'message from the present'
    }
  },
  {
    id: 'human-gate', title: 'Human Gate', meaning: 'The interface changes; meaningful decisions remain human.', discoveryYear: '2030', discoveryHint: 'Select the Governor or human approval node in Kevin Nexus.',
    transformations: {
      '1990': 'player choice', '2000': 'download confirmation', '2010': 'publish/privacy choice', '2020': 'post or draft', '2030': 'approve/revise/reject', '2040': 'preserve/reinterpret/forget'
    }
  }
];
