import type { YearId } from '@/content/data';
import { CHAPTER_ORDER, chapterNarrative, type ChapterNarrative } from '@/content/narrative';
import type { ArtifactId } from './artifacts';

export type TransitionId = 'static-modem' | 'profile-flatten' | 'portrait-rotate' | 'signals-to-agents' | 'agents-to-echo' | 'timeline-fade' | 'time-jump';

export type Vec3 = readonly [number, number, number];

export type EraCameraPose = {
  position: Vec3;
  target: Vec3;
};

export type EraArtDirection = {
  typography: { display: string; body: string; label: string };
  palette: { background: string; surface: string; accent: string; text: string; haze: string };
  materials: readonly string[];
  lighting: { ambient: number; key: number; temperature: string };
  fog: readonly [string, number, number];
  camera: Record<'timeline' | 'environment' | 'interface' | 'text', EraCameraPose>;
  motion: string;
  evidenceMetaphor: string;
  soundIntent: string;
  responsiveComposition: string;
};

export type SemanticHotspot = {
  id: string;
  label: string;
  description: string;
  artifact: ArtifactId;
};

export type EraConfig = ChapterNarrative & {
  id: YearId;
  /** Backward-compatible alias for the in-world experience name. */
  title: string;
  /** Backward-compatible alias for the era medium. */
  product: string;
  accent: string;
  stationX: number;
  legacyPath: string;
  artDirection: EraArtDirection;
  hotspots: readonly SemanticHotspot[];
  transitionToNext?: TransitionId;
};

export const YEAR_ORDER: YearId[] = CHAPTER_ORDER;

type TechnicalConfig = Pick<EraConfig, 'accent' | 'stationX' | 'legacyPath' | 'transitionToNext' | 'hotspots'> & {
  art: Omit<EraArtDirection, 'camera'>;
};

const technicalConfig: Record<YearId, TechnicalConfig> = {
  '1990': {
    accent: '#ffd75a', stationX: -30, legacyPath: '/legacy/experience/1990/index.html?embed=1', transitionToNext: 'static-modem',
    art: { typography: { display: 'blocky broadcast', body: 'humanist sans', label: 'channel mono' }, palette: { background: '#080706', surface: '#29251f', accent: '#ffd75a', text: '#fff5d6', haze: '#1b1308' }, materials: ['smoked glass', 'warm walnut', 'molded plastic'], lighting: { ambient: .34, key: 1.7, temperature: 'tungsten living-room glow' }, fog: ['#120d07', 18, 76], motion: 'deliberate scan, elastic channel snap, playful 8-bit response', evidenceMetaphor: 'broadcast archive and cartridge manual', soundIntent: 'room tone, CRT bloom, restrained 8-bit confirmation', responsiveComposition: 'TV remains dominant; chapter evidence wraps below it on narrow screens.' },
    hotspots: [
      { id: 'channel-dial', label: 'Tune the signal', description: 'Reveal how play trained pattern recognition and systems thinking.', artifact: 'signal-fragment' },
      { id: 'player-choice', label: 'Inspect the player choice', description: 'Carry the human decision gate into every later interface.', artifact: 'human-gate' }
    ]
  },
  '2000': {
    accent: '#6bbcff', stationX: -18, legacyPath: '/legacy/experience/2000/index.html?embed=1', transitionToNext: 'profile-flatten',
    art: { typography: { display: 'optimistic portal sans', body: 'system sans', label: 'terminal mono' }, palette: { background: '#06101b', surface: '#b8b29f', accent: '#6bbcff', text: '#edf8ff', haze: '#071b2e' }, materials: ['beige ABS', 'phosphor glass', 'brushed desk laminate'], lighting: { ambient: .42, key: 1.55, temperature: 'cool monitor with warm desk lamp' }, fog: ['#061321', 20, 82], motion: 'dial-up cadence, window cascade, cursor-led discovery', evidenceMetaphor: 'download, message, and linked personal page', soundIntent: 'modem rhythm, connection chime, quiet keyboard texture', responsiveComposition: 'Computer and evidence column share the frame; stack without hiding context on mobile.' },
    hotspots: [
      { id: 'screen-name', label: 'Open the identity handle', description: 'See how a screen name became a durable public identity.', artifact: 'identity-handle' },
      { id: 'download', label: 'Download the next layer', description: 'Preserve a signal that changes form in every chapter.', artifact: 'next-layer-message' }
    ]
  },
  '2010': {
    accent: '#8db7ff', stationX: -6, legacyPath: '/legacy/experience/2010/index.html?embed=1', transitionToNext: 'portrait-rotate',
    art: { typography: { display: 'confident social grotesk', body: 'clean platform sans', label: 'metadata sans' }, palette: { background: '#07101c', surface: '#dce4ef', accent: '#8db7ff', text: '#f4f8ff', haze: '#0d1d34' }, materials: ['anodized aluminum', 'backlit glass', 'soft-touch polymer'], lighting: { ambient: .46, key: 1.6, temperature: 'daylight screen wash' }, fog: ['#091525', 20, 86], motion: 'profile flatten, card stack, social feedback pulse', evidenceMetaphor: 'public profile, note, album, and community proof', soundIntent: 'subtle notification, camera shutter, ambient room hush', responsiveComposition: 'Laptop and identity evidence balance as two readable planes at every breakpoint.' },
    hotspots: [
      { id: 'profile', label: 'Read the public profile', description: 'Connect identity, community, and positioning to product work.', artifact: 'identity-handle' },
      { id: 'project-note', label: 'Open the project note', description: 'Follow a blueprint as it becomes public evidence.', artifact: 'project-blueprint' }
    ]
  },
  '2020': {
    accent: '#ff5c8a', stationX: 6, legacyPath: '/legacy/experience/2020/index.html?embed=1', transitionToNext: 'signals-to-agents',
    art: { typography: { display: 'kinetic creator grotesk', body: 'compact editorial sans', label: 'signal mono' }, palette: { background: '#08070c', surface: '#211521', accent: '#ff5c8a', text: '#fff4f8', haze: '#240c19' }, materials: ['black glass', 'powder-coated rigging', 'diffused LED'], lighting: { ambient: .3, key: 1.9, temperature: 'magenta/cyan creator studio' }, fog: ['#110811', 18, 72], motion: 'portrait snap, signal streak, intentional creator rhythm', evidenceMetaphor: 'clip, proof card, and behind-the-scenes decision', soundIntent: 'tight transient, low creator-room bed, no autoplay voice', responsiveComposition: 'Portrait device uses one third; chapter evidence and project proof occupy the remaining widescreen field.' },
    hotspots: [
      { id: 'creator-signal', label: 'Trace the creator signal', description: 'Connect storytelling choices to audience and product evidence.', artifact: 'signal-fragment' },
      { id: 'draft', label: 'Inspect the working draft', description: 'Reveal the project decisions behind the polished clip.', artifact: 'project-blueprint' }
    ]
  },
  '2030': {
    accent: '#64e8ff', stationX: 18, legacyPath: '/legacy/experience/2030/index.html?embed=1', transitionToNext: 'agents-to-echo',
    art: { typography: { display: 'precise orchestration sans', body: 'calm systems sans', label: 'evidence mono' }, palette: { background: '#031014', surface: '#10262c', accent: '#64e8ff', text: '#eaffff', haze: '#06242a' }, materials: ['etched ceramic', 'transparent display glass', 'recycled alloy'], lighting: { ambient: .28, key: 1.8, temperature: 'cyan evidence lab' }, fog: ['#03171b', 19, 88], motion: 'agent handoff, evidence routing, explicit approval pause', evidenceMetaphor: 'mission graph, role station, evidence packet, human gate', soundIntent: 'spatial routing ticks, restrained synthesis, approval tone', responsiveComposition: 'Agent roles remain labeled beside the active station; cards stack into a legible mission order on mobile.' },
    hotspots: [
      { id: 'agent-roles', label: 'Inspect agent roles', description: 'Review strategist, researcher, builder, governor, and archivist responsibilities.', artifact: 'next-layer-message' },
      { id: 'approval-gate', label: 'Exercise the human gate', description: 'Keep intent, evidence, and authority visible inside autonomy.', artifact: 'human-gate' }
    ]
  },
  '2040': {
    accent: '#a88cff', stationX: 30, legacyPath: '/legacy/experience/2040/index.html?embed=1',
    art: { typography: { display: 'reflective humanist display', body: 'quiet editorial sans', label: 'memory index mono' }, palette: { background: '#080713', surface: '#211c36', accent: '#a88cff', text: '#f7f2ff', haze: '#17102c' }, materials: ['volumetric light', 'memory glass', 'weathered stone'], lighting: { ambient: .25, key: 1.7, temperature: 'violet dawn' }, fog: ['#100b20', 18, 92], motion: 'slow reconstruction, artifact convergence, breathing continuity', evidenceMetaphor: 'reconstructed memory made from every discovered artifact', soundIntent: 'transparent harmonic bed with audible disclosure cue', responsiveComposition: 'The reconstruction and its provenance ledger remain visible together; mobile presents provenance before spectacle.' },
    hotspots: [
      { id: 'reconstruction', label: 'Audit the reconstruction', description: 'See which memories and values are present—and which remain unknown.', artifact: 'identity-handle' },
      { id: 'continuity-ledger', label: 'Open the continuity ledger', description: 'Review every artifact carried into the final chapter.', artifact: 'project-blueprint' }
    ]
  }
};

function cameraFor(stationX: number, year: YearId): EraArtDirection['camera'] {
  const future = year === '2030' || year === '2040';
  const portrait = year === '2020';
  return {
    timeline: { position: [stationX, 6.5, 15.2], target: [stationX, 2.3, 0] },
    environment: { position: [stationX, future ? 5.05 : 5.25, portrait ? 10.2 : future ? 11.7 : 11.35], target: [stationX, future ? 2.2 : 2.1, 0] },
    interface: { position: [stationX, 3.9, portrait ? 9.6 : 8.6], target: [stationX, 1.8, 0] },
    text: { position: [stationX, 5.8, 12.8], target: [stationX, 1.8, 0] }
  };
}

export const eraConfigs = Object.fromEntries(
  YEAR_ORDER.map((year) => {
    const narrative = chapterNarrative[year];
    const technical = technicalConfig[year];
    const { art, ...runtime } = technical;
    return [year, {
      id: year,
      ...narrative,
      ...runtime,
      artDirection: { ...art, camera: cameraFor(runtime.stationX, year) },
      title: narrative.experienceName,
      product: narrative.medium
    } satisfies EraConfig];
  })
) as Record<YearId, EraConfig>;

export function getYearFromPath(pathname: string): YearId | null {
  const match = pathname.match(/\/experience\/(1990|2000|2010|2020|2030|2040)(?:\/|$)/);
  return (match?.[1] as YearId | undefined) ?? null;
}

export function getAdjacentYear(year: YearId, direction: -1 | 1): YearId | null {
  const index = YEAR_ORDER.indexOf(year);
  const next = YEAR_ORDER[index + direction];
  return next ?? null;
}

export function yearDistance(from: YearId | null, to: YearId) {
  if (!from) return 0;
  return Math.abs(YEAR_ORDER.indexOf(to) - YEAR_ORDER.indexOf(from));
}

export function transitionBetween(from: YearId | null, to: YearId): TransitionId {
  if (!from) return 'timeline-fade';
  const fromIndex = YEAR_ORDER.indexOf(from);
  const toIndex = YEAR_ORDER.indexOf(to);
  if (Math.abs(toIndex - fromIndex) > 1) return 'time-jump';
  if (toIndex === fromIndex + 1) return eraConfigs[from].transitionToNext ?? 'timeline-fade';
  if (toIndex === fromIndex - 1) return eraConfigs[to].transitionToNext ?? 'timeline-fade';
  return 'timeline-fade';
}
