import type { YearId } from './data';

export type ChapterName = 'Curiosity' | 'Connection' | 'Presence' | 'Creation' | 'Delegation' | 'Continuity';

export type ChapterNarrative = {
  chapterNumber: number;
  chapterName: ChapterName;
  experienceName: string;
  medium: string;
  chapterThesis: string;
  transformation: string;
  lesson: string;
  capabilityLinks: readonly string[];
  bridgeToNext?: string;
  transitionLine?: string;
  emotionalGoal: string;
  description: string;
  enterLabel: string;
  deviceLabel: string;
};

export const CHAPTER_ORDER: YearId[] = ['1990', '2000', '2010', '2020', '2030', '2040'];

export const chapterNarrative: Record<YearId, ChapterNarrative> = {
  '1990': {
    chapterNumber: 1,
    chapterName: 'Curiosity',
    experienceName: 'KevinVision',
    medium: 'Television and 8-bit console',
    chapterThesis: 'Games introduced Kevin to interactive worlds where patterns could be recognized, strategies tested, resources optimized, and stories shaped through action.',
    transformation: 'Play becomes systems thinking.',
    lesson: 'Kevin carried forward a habit of exploring rules, recognizing patterns, testing possibilities, and improving the system.',
    capabilityLinks: ['Pattern recognition', 'Strategic thinking', 'Optimization', 'Interactive storytelling'],
    bridgeToNext: 'Curiosity finds a network.',
    transitionLine: 'Television static becomes modem noise.',
    emotionalGoal: 'Wonder, play, and discovery',
    description: 'Tune a physical tube television, explore era-appropriate channels, power the console on Channel 3, and play The Circuit of Time.',
    enterLabel: 'Enter KevinVision',
    deviceLabel: 'Tube television'
  },
  '2000': {
    chapterNumber: 2,
    chapterName: 'Connection',
    experienceName: 'Kevin Online',
    medium: 'Personal computer and early internet',
    chapterThesis: 'AOL and the early web revealed that a computer could connect Kevin to people, knowledge, communities, tools, and possibilities far beyond the room around it.',
    transformation: 'Curiosity finds a network.',
    lesson: 'Kevin carried forward an instinct to research widely, connect people and ideas, experiment in public, and turn information into useful action.',
    capabilityLinks: ['Research', 'Communication', 'Collaboration', 'Knowledge discovery'],
    bridgeToNext: 'Connection becomes presence.',
    transitionLine: 'Personal pages become a social identity layer.',
    emotionalGoal: 'Anticipation, discovery, and early-internet optimism',
    description: 'Boot a CRT computer, sign on through a dial-up connection, open K-Mail, message buddies, browse Kevin Explorer, and visit Kevin’s Xanga.',
    enterLabel: 'Sign On to Kevin Online',
    deviceLabel: 'CRT computer'
  },
  '2010': {
    chapterNumber: 3,
    chapterName: 'Presence',
    experienceName: 'KevinBook',
    medium: 'Social network and connected laptop',
    chapterThesis: 'Social platforms made identity, reputation, participation, and community visible—and taught a generation how to exist publicly online.',
    transformation: 'Connection becomes presence.',
    lesson: 'Kevin carried forward an understanding of positioning, audience, community, identity, and the human behavior behind digital products.',
    capabilityLinks: ['Positioning', 'Community', 'User identity', 'Experience design'],
    bridgeToNext: 'Presence becomes creation.',
    transitionLine: 'The profile rotates into the creator feed.',
    emotionalGoal: 'Participation, self-definition, and community',
    description: 'Explore Kevin’s Wall, About, Projects, Photos, Notes, messages, and the social-product behaviors that reshaped the web.',
    enterLabel: 'Open KevinBook',
    deviceLabel: 'Connected laptop'
  },
  '2020': {
    chapterNumber: 4,
    chapterName: 'Creation',
    experienceName: 'KevTok',
    medium: 'Short-form media and creator technology',
    chapterThesis: 'Digital media became faster, more visual, and more influential as creativity, branding, marketing, storytelling, commerce, and consumer behavior converged in the same feed.',
    transformation: 'Presence becomes creation.',
    lesson: 'Kevin carried forward a creator’s bias toward making ideas tangible, communicating quickly, testing signals, and building experiences people choose to engage with.',
    capabilityLinks: ['Product creation', 'Storytelling', 'Branding', 'Audience behavior'],
    bridgeToNext: 'Creation becomes delegated capability.',
    transitionLine: 'Reactions reorganize into autonomous agents.',
    emotionalGoal: 'Speed, signal, creativity, and proof',
    description: 'Navigate concise clips about Kevin, systems thinking, projects, automation, AI, branding, marketing, and changing consumer behavior.',
    enterLabel: 'Open KevTok',
    deviceLabel: 'Creator phone'
  },
  '2030': {
    chapterNumber: 5,
    chapterName: 'Delegation',
    experienceName: 'Kevin Nexus',
    medium: 'Autonomous-agent workspace',
    chapterThesis: 'Intelligent systems no longer wait for every click. Specialized agents receive objectives, coordinate tasks, gather evidence, and prepare decisions while humans retain intent, judgment, and authority.',
    transformation: 'Creation becomes delegated capability.',
    lesson: 'Kevin carries forward a systems approach to orchestration, governance, evidence, recoverability, and human control over increasingly autonomous work.',
    capabilityLinks: ['Agent workflows', 'Orchestration', 'Governance', 'Human-in-the-loop systems'],
    bridgeToNext: 'Delegated intelligence becomes continuity.',
    transitionLine: 'Agent memories reconstruct a digital perspective.',
    emotionalGoal: 'Orchestration, evidence, and human control',
    description: 'Give specialized agents an objective, inspect context and evidence moving through the system, and exercise the human approval gate.',
    enterLabel: 'Delegate a Mission',
    deviceLabel: 'Agent memory core'
  },
  '2040': {
    chapterNumber: 6,
    chapterName: 'Continuity',
    experienceName: 'Kevin Echo',
    medium: 'Holographic memory and values interpreter',
    chapterThesis: 'A transparent digital extension preserves an individual’s knowledge, memories, values, decisions, and perspective without pretending to be the biological person.',
    transformation: 'Delegated intelligence becomes continuity.',
    lesson: 'Kevin’s final layer connects knowledge architecture, context, institutional memory, and values into a digital perspective that can remain useful over time.',
    capabilityLinks: ['Knowledge architecture', 'Context engineering', 'Institutional memory', 'Values preservation'],
    emotionalGoal: 'Continuity, identity, and reflection',
    description: 'Interact with a clearly disclosed speculative digital representation of Kevin through thoughts, memories, projects, and reconstructed values.',
    enterLabel: 'Meet Kevin Echo',
    deviceLabel: 'Holographic Kevin'
  }
};

export const narrativeSite = {
  title: 'Kevinception — Six Digital Eras. One Evolving Mind.',
  description: 'Kevin Yang’s interactive portfolio follows six stages of his relationship with technology—Curiosity, Connection, Presence, Creation, Delegation, and Continuity—each experienced through a defining interface of its era.'
} as const;

export const kevinOriginNarrative = {
  origin: 'Kevin’s relationship with technology began through television, cartridge games, and interactive worlds. Games taught him to recognize patterns, test strategies, optimize limited resources, explore systems, and experience stories through action rather than observation.',
  continuation: 'By 2000, the personal computer and early internet expanded that curiosity into connection. AOL, chatrooms, screen names, personal pages, scripts, and online communities revealed that technology could connect people, knowledge, identity, and imagination. The interfaces kept changing, but the pattern remained: explore widely, recognize the underlying system, and turn possibility into something people can use.'
} as const;
