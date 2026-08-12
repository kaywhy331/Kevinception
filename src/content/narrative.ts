import type { YearId } from './data';

export type ChapterName = 'Curiosity' | 'Connection' | 'Commerce' | 'Creation' | 'Coexistence' | 'Continuity';

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
    bridgeToNext: 'Connection becomes commerce.',
    transitionLine: 'Personal pages resolve into a marketplace operations console.',
    emotionalGoal: 'Anticipation, discovery, and early-internet optimism',
    description: 'Boot a CRT computer, sign on through a dial-up connection, open K-Mail, message buddies, browse Kevin Explorer, and visit Kevin’s Xanga.',
    enterLabel: 'Sign On to Kevin Online',
    deviceLabel: 'CRT computer'
  },
  '2010': {
    chapterNumber: 3,
    chapterName: 'Commerce',
    experienceName: 'Kevazon Marketplace',
    medium: 'Proprietary commerce operating system and fulfillment workstation',
    chapterThesis: 'Co-founding a multi-channel commerce operation taught Kevin to architect one proprietary system connecting vendor purchasing, inventory, 1.5 million catalog records, 20+ sales channels, customer orders, warehouse fulfillment, service, finance, reporting, automation, and the team.',
    transformation: 'Connection becomes commerce.',
    lesson: 'Kevin carried forward a systems architect’s view of operations: reduce cross-functional complexity into connected records, explicit handoffs, automation, and actionable exceptions without losing operator judgment.',
    capabilityLinks: ['Commerce systems architecture', 'ERP and workflow design', 'Marketplace automation', 'Warehouse and company operations'],
    bridgeToNext: 'Commerce becomes creation.',
    transitionLine: 'Order signals accelerate into the creator feed.',
    emotionalGoal: 'Operational scale, systems thinking, automation, and customer commitment',
    description: 'Explore a reconstruction of the proprietary operating system behind One Stop Deals and StealStreet: follow the vendor-to-customer lifecycle, inspect a 1.5-million-record catalog, normalize 20+ channels, and route cross-functional exceptions.',
    enterLabel: 'Open Commerce Operations',
    deviceLabel: 'Fulfillment workstation'
  },
  '2020': {
    chapterNumber: 4,
    chapterName: 'Creation',
    experienceName: 'KevTok',
    medium: 'Short-form media and creator technology',
    chapterThesis: 'Digital media became faster, more visual, and more influential as creativity, branding, marketing, storytelling, commerce, and consumer behavior converged in the same feed.',
    transformation: 'Commerce becomes creation.',
    lesson: 'Kevin carried forward a creator’s bias toward making ideas tangible, communicating quickly, testing signals, and building experiences people choose to engage with.',
    capabilityLinks: ['Product creation', 'Storytelling', 'Branding', 'Audience behavior'],
    bridgeToNext: 'Creation becomes coexistence.',
    transitionLine: 'Reactions reorganize into a human-and-AI collaboration system.',
    emotionalGoal: 'Speed, signal, creativity, and proof',
    description: 'Navigate concise clips about Kevin, systems thinking, projects, automation, AI, branding, marketing, and changing consumer behavior.',
    enterLabel: 'Open KevTok',
    deviceLabel: 'Creator phone'
  },
  '2030': {
    chapterNumber: 5,
    chapterName: 'Coexistence',
    experienceName: 'Kevin Nexus',
    medium: 'Human-and-AI collaboration workspace',
    chapterThesis: 'People and intelligent systems work side by side: AI collaborators extend research, synthesis, and execution while humans provide intent, lived context, judgment, accountability, and authority over consequential decisions.',
    transformation: 'Creation becomes coexistence.',
    lesson: 'Kevin carries forward a systems approach to collaboration, evidence, governance, recoverability, and clear boundaries between machine capability and human responsibility.',
    capabilityLinks: ['Human-AI collaboration', 'Shared context', 'Evidence and governance', 'Human decision systems'],
    bridgeToNext: 'Coexistence becomes continuity.',
    transitionLine: 'Shared memories reconstruct a digital perspective.',
    emotionalGoal: 'Partnership, evidence, and responsible agency',
    description: 'Set a shared objective, watch human and AI roles coordinate through evidence, and make the consequential judgment at an explicit human decision gate.',
    enterLabel: 'Enter Kevin Nexus',
    deviceLabel: 'Collaboration core'
  },
  '2040': {
    chapterNumber: 6,
    chapterName: 'Continuity',
    experienceName: 'Kevin Echo',
    medium: 'Holographic memory and values interpreter',
    chapterThesis: 'A transparent digital extension preserves an individual’s knowledge, memories, values, decisions, and perspective without pretending to be the biological person.',
    transformation: 'Coexistence becomes continuity.',
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
  description: 'Kevin Yang’s interactive portfolio follows six stages of his relationship with technology—Curiosity, Connection, Commerce, Creation, Coexistence, and Continuity—each experienced through a defining interface of its era.'
} as const;

export const kevinOriginNarrative = {
  origin: 'My relationship with technology began through television, cartridge games, and interactive worlds. Games taught me to recognize patterns, test strategies, optimize limited resources, explore systems, and experience stories through action rather than observation.',
  continuation: 'By 2000, the personal computer and early internet expanded that curiosity into connection. AOL, chatrooms, screen names, personal pages, scripts, and online communities showed me that technology could connect people, knowledge, identity, and imagination. The interfaces kept changing, but the pattern remained: explore widely, recognize the underlying system, and turn possibility into something people can use.'
} as const;
