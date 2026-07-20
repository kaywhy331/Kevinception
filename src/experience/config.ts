import type { YearId } from '@/content/data';

export type TransitionId = 'static-modem' | 'profile-flatten' | 'portrait-rotate' | 'signals-to-agents' | 'agents-to-echo' | 'timeline-fade';

export type EraConfig = {
  id: YearId;
  title: string;
  product: string;
  transformation: string;
  emotionalGoal: string;
  description: string;
  accent: string;
  stationX: number;
  legacyPath: string;
  enterLabel: string;
  transitionToNext?: TransitionId;
  deviceLabel: string;
};

export const YEAR_ORDER: YearId[] = ['1990', '2000', '2010', '2020', '2030', '2040'];

export const eraConfigs: Record<YearId, EraConfig> = {
  '1990': {
    id: '1990', title: 'KevinVision', product: 'Tube television + cartridge console',
    transformation: 'Curiosity becomes exploration', emotionalGoal: 'Wonder, play, and discovery',
    description: 'Tune a physical tube television, explore era-appropriate channels, power the console on Channel 3, and play The Circuit of Time.',
    accent: '#ffd75a', stationX: -30, legacyPath: '/legacy/experience/1990/index.html?embed=1', enterLabel: 'Enter KevinVision', transitionToNext: 'static-modem', deviceLabel: 'Tube television'
  },
  '2000': {
    id: '2000', title: 'Kevin Online', product: 'WinDohs + AOL-style online service',
    transformation: 'Exploration becomes experimentation', emotionalGoal: 'Connection, anticipation, and early-internet optimism',
    description: 'Boot a CRT computer, sign on through a dial-up connection, open K-Mail, message buddies, browse Kevin Explorer, and visit Kevin’s Xanga.',
    accent: '#6bbcff', stationX: -18, legacyPath: '/legacy/experience/2000/index.html?embed=1', enterLabel: 'Sign on to Kevin Online', transitionToNext: 'profile-flatten', deviceLabel: 'CRT computer'
  },
  '2010': {
    id: '2010', title: 'KevinBook', product: 'Social profile + connected laptop',
    transformation: 'Experimentation becomes identity and community', emotionalGoal: 'Participation, self-definition, and connection',
    description: 'Explore Kevin’s Wall, About, Projects, Photos, Notes, messages, and the social-product behaviors that reshaped the web.',
    accent: '#8db7ff', stationX: -6, legacyPath: '/legacy/experience/2010/index.html?embed=1', enterLabel: 'Open KevinBook', transitionToNext: 'portrait-rotate', deviceLabel: 'Laptop and early smartphone'
  },
  '2020': {
    id: '2020', title: 'KevTok', product: 'Finite short-form video feed',
    transformation: 'Identity becomes creation and distribution', emotionalGoal: 'Speed, signal, creativity, and proof',
    description: 'Navigate eight concise clips about Kevin, his systems thinking, current projects, automation, AI, and how he works.',
    accent: '#ff5c8a', stationX: 6, legacyPath: '/legacy/experience/2020/index.html?embed=1', enterLabel: 'Open KevTok', transitionToNext: 'signals-to-agents', deviceLabel: 'Creator phone'
  },
  '2030': {
    id: '2030', title: 'Kevin Nexus', product: 'Autonomous-agent workspace',
    transformation: 'Systems become delegated intelligence', emotionalGoal: 'Orchestration, evidence, and human control',
    description: 'Give specialized agents an objective, inspect context and evidence moving through the system, and exercise the human approval gate.',
    accent: '#64e8ff', stationX: 18, legacyPath: '/legacy/experience/2030/index.html?embed=1', enterLabel: 'Enter the Nexus', transitionToNext: 'agents-to-echo', deviceLabel: 'Agent memory core'
  },
  '2040': {
    id: '2040', title: 'Kevin Echo', product: 'Holographic memory interpreter',
    transformation: 'Intelligence becomes preserved perspective', emotionalGoal: 'Continuity, identity, and reflection',
    description: 'Interact with a clearly disclosed speculative digital representation of Kevin through thoughts, memories, projects, and reconstructed values.',
    accent: '#a88cff', stationX: 30, legacyPath: '/legacy/experience/2040/index.html?embed=1', enterLabel: 'Contact Kevin Echo', deviceLabel: 'Holographic Kevin'
  }
};

export function getYearFromPath(pathname: string): YearId | null {
  const match = pathname.match(/\/experience\/(1990|2000|2010|2020|2030|2040)(?:\/|$)/);
  return (match?.[1] as YearId | undefined) ?? null;
}

export function getAdjacentYear(year: YearId, direction: -1 | 1): YearId | null {
  const index = YEAR_ORDER.indexOf(year);
  const next = YEAR_ORDER[index + direction];
  return next ?? null;
}

export function transitionBetween(from: YearId | null, to: YearId): TransitionId {
  if (!from) return 'timeline-fade';
  const fromIndex = YEAR_ORDER.indexOf(from);
  const toIndex = YEAR_ORDER.indexOf(to);
  if (toIndex === fromIndex + 1) return eraConfigs[from].transitionToNext ?? 'timeline-fade';
  if (toIndex === fromIndex - 1) return eraConfigs[to].transitionToNext ?? 'timeline-fade';
  return 'timeline-fade';
}
