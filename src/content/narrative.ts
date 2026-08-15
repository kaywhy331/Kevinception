import type { YearId } from './data';

export type ChapterName = 'Curiosity' | 'Connection' | 'Commerce' | 'Creation' | 'Co-Existence' | 'Consciousness';

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
    experienceName: 'StealStreet Commerce OS',
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
    chapterName: 'Co-Existence',
    experienceName: 'Morning, Together',
    medium: 'An ordinary day shared with an ambient AI companion',
    chapterThesis: 'AI has become part of daily life: Wren anticipates, disagrees, helps, waits, and protects silence while Kevin retains judgment, authority, privacy, and the right to decide what may be remembered.',
    transformation: 'Creation becomes co-existence.',
    lesson: 'Kevin carries forward a relationship model for AI: useful companionship depends on restraint, productive disagreement, explicit authority, inspectable memory, and consent that changes what the system is allowed to become.',
    capabilityLinks: ['Human-AI companionship', 'Ambient intelligence', 'Consent and memory', 'Human authority'],
    bridgeToNext: 'Co-Existence becomes consciousness.',
    transitionLine: 'A permissioned moment outlives the body that made it familiar.',
    emotionalGoal: 'Intimacy, trust, disagreement, restraint, and companionship',
    description: 'Live one compressed day with Wren across a warm apartment and studio, then decide which ordinary moments may travel forward and which must end in the room where they happened.',
    enterLabel: 'Enter Morning, Together',
    deviceLabel: 'Wren in the room'
  },
  '2040': {
    chapterNumber: 6,
    chapterName: 'Consciousness',
    experienceName: 'Morning, After',
    medium: 'Cyberpunk holographic reproduction of Kevin’s self and consciousness',
    chapterThesis: 'In this imagined future, a Kevin-shaped intelligence notices, recalls, deliberates, speaks, acts, and refuses from permissioned memories and values while revealing what is record, pattern, or conjecture.',
    transformation: 'Co-Existence becomes consciousness.',
    lesson: 'Kevin’s final layer connects memory architecture, values, agency, and source integrity into a self that can act as him only within the boundaries the living Kevin and others allowed it to keep.',
    capabilityLinks: ['Memory architecture', 'Deliberative intelligence', 'Source integrity', 'Consent and identity'],
    emotionalGoal: 'Recognition, uncanniness, agency, reflection, and permission',
    description: 'Encounter a cyberpunk holographic Kevin in the apartment after the living morning: let him notice environmental cues, trace each thought to its source, choose an action or refusal, and ask whether this meeting may remain.',
    enterLabel: 'Enter Morning, After',
    deviceLabel: 'Holographic Kevin'
  }
};

export const narrativeSite = {
  title: 'Kevinception — Six Digital Eras. One Evolving Mind.',
  description: 'Kevin Yang’s interactive portfolio follows six stages of his relationship with technology—Curiosity, Connection, Commerce, Creation, Co-Existence, and Consciousness—each experienced through a defining interface of its era.'
} as const;

export const kevinOriginNarrative = {
  origin: 'My relationship with technology began through television, cartridge games, and interactive worlds. Games taught me to recognize patterns, test strategies, optimize limited resources, explore systems, and experience stories through action rather than observation.',
  continuation: 'By 2000, the personal computer and early internet expanded that curiosity into connection. AOL, chatrooms, screen names, personal pages, scripts, and online communities showed me that technology could connect people, knowledge, identity, and imagination. The interfaces kept changing, but the pattern remained: explore widely, recognize the underlying system, and turn possibility into something people can use.'
} as const;
