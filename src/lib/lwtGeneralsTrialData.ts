// src/lib/lwtGeneralsTrialData.ts
// General's Trial — solo + alliance challenge modes, rewards, Overlord items
// Source: lastwartutorial.com content extract

export interface GeneralsTrialMode {
  name: string;
  type: 'solo' | 'alliance';
  description: string;
  unlockRequirement: string;
  frequency: string;
  keyMechanics: string[];
  rewardTypes: string[];
}

export interface GeneralsTrialTip {
  category: string;
  tip: string;
}

// ─── MODE DEFINITIONS ───────────────────────────────────────────────────────

export const GENERALS_TRIAL_MODES: GeneralsTrialMode[] = [
  {
    name: 'Normal Mode',
    type: 'solo',
    description:
      'Standard solo challenge against waves of enemy units. Tests individual combat strength and hero loadout.',
    unlockRequirement: 'Available to all players. No HQ minimum.',
    frequency: 'Daily attempts available. Resets each day.',
    keyMechanics: [
      'Select a hero lineup before each attempt',
      'Waves increase in difficulty progressively',
      'Hero skills and troop type matchups matter significantly',
      'Damage dealt counts toward score — higher damage = better reward tier',
      'Losing does not consume attempt if you exit before full defeat',
    ],
    rewardTypes: [
      'General Trial Coins (primary currency)',
      'Speed-ups',
      'Resources',
      'Hero EXP items',
      'Overlord training items (higher tiers)',
    ],
  },
  {
    name: 'Advanced Mode',
    type: 'solo',
    description:
      'Harder version of Normal Mode with stronger enemy waves. Requires stronger hero builds and troop tiers.',
    unlockRequirement: 'Unlocks after clearing Normal Mode to a set stage threshold.',
    frequency: 'Daily attempts. Resets each day.',
    keyMechanics: [
      'Enemy stats significantly higher than Normal Mode',
      'Counter-troop matchups punished more harshly',
      'Hero skill level matters more — higher skill levels outperform raw power',
      'Troop type specialization recommended over mixed builds',
      'Missile Vehicle squads often perform well due to counter-all advantage',
    ],
    rewardTypes: [
      'More General Trial Coins per run',
      'Higher-tier speed-ups',
      'Overlord Bond Badges',
      'Overlord Training Guidebooks',
      'Commander Certificates (Overlord deployment resource)',
    ],
  },
  {
    name: 'Solo Challenge',
    type: 'solo',
    description:
      'Special timed solo event within General\'s Trial. Compete for a personal high score on a fixed enemy configuration.',
    unlockRequirement: 'Opens during event windows. Check event tab for schedule.',
    frequency: 'Event-based, not always active.',
    keyMechanics: [
      'Fixed enemy layout — same for all players during the event',
      'Score is based on total damage dealt before time expires',
      'Multiple attempts allowed — best score counts',
      'Hero lineup optimization is key — test different combos',
      'Cooldowns between attempts — plan your tries',
    ],
    rewardTypes: [
      'Leaderboard rewards based on final rank',
      'General Trial Coins',
      'Exclusive cosmetic or resource bundles (varies by event)',
    ],
  },
  {
    name: 'Alliance Challenge',
    type: 'alliance',
    description:
      'Cooperative mode where alliance members attack shared enemy bosses together. Total alliance damage determines reward tier.',
    unlockRequirement: 'Must be in an alliance. No minimum HQ required but contribution matters.',
    frequency: 'Scheduled event. Check alliance event tab.',
    keyMechanics: [
      'All alliance members attack the same boss pool simultaneously',
      'Individual contribution tracked — higher damage = better personal reward',
      'Boss has a shared HP bar — alliance wins when boss is defeated',
      'Members can use multiple attempts during the event window',
      'Troop type counter advantage still applies — coordinate with alliance if possible',
      'Rally feature may be available on some boss types — check event rules',
    ],
    rewardTypes: [
      'General Trial Coins',
      'Alliance Contribution Points',
      'Speed-ups and resources scaled to contribution tier',
      'Overlord items at higher contribution tiers',
      'Exclusive alliance rewards if boss is defeated before timer',
    ],
  },
];

// ─── OVERLORD ITEM REWARDS ───────────────────────────────────────────────────

export interface OverlordRewardItem {
  itemName: string;
  primarySource: string;
  secondarySource: string;
  notes: string;
}

export const OVERLORD_REWARD_ITEMS: OverlordRewardItem[] = [
  {
    itemName: 'Commander Certificate',
    primarySource: 'Advanced Mode drops',
    secondarySource: 'Alliance Challenge high-contribution reward',
    notes:
      'Required for Overlord deployment (1,800 per deploy). Farm consistently — this is the primary Overlord bottleneck for most players.',
  },
  {
    itemName: 'Overlord Training Guidebook',
    primarySource: 'Advanced Mode drops',
    secondarySource: 'Alliance Challenge, VIP Store',
    notes:
      'Required for Overlord deployment (300,000 per deploy). Less scarce than Certificates but still requires consistent farming.',
  },
  {
    itemName: 'Bond Badge',
    primarySource: 'Alliance Challenge reward tiers',
    secondarySource: 'Advanced Mode (rare), VIP Store weekly limit',
    notes:
      'Required for Overlord deployment (24 per deploy). Also unlocks the New Partner milestone at L50 and gates Rookie Partner I at L100. Save carefully.',
  },
  {
    itemName: 'Overlord EXP Items',
    primarySource: 'Normal Mode drops',
    secondarySource: 'Advanced Mode drops',
    notes:
      'Used to level the Overlord Gorilla from L1 upward. Skill unlocks at L31/51/71/91/111. Prioritize leveling to L31 for first skill unlock.',
  },
];

// ─── GENERAL TRIAL COINS STORE ───────────────────────────────────────────────

export const TRIAL_COINS_STORE_PRIORITIES: { item: string; priority: string; notes: string }[] = [
  {
    item: 'Hero Shards (priority heroes)',
    priority: 'HIGH',
    notes: 'Best long-term value. Check which heroes are available — prioritize UR hero shards.',
  },
  {
    item: 'Commander Certificates',
    priority: 'HIGH',
    notes: 'If Overlord is your bottleneck, buy these first. 1,800 needed per deployment.',
  },
  {
    item: 'Speed-ups (Build/Research)',
    priority: 'MEDIUM',
    notes: 'Solid value if not farming hero shards. Build speed-ups especially useful pre-HQ30.',
  },
  {
    item: 'Bond Badges',
    priority: 'MEDIUM',
    notes: 'Only 24 needed per Overlord deployment but they are scarce — worth buying if available.',
  },
  {
    item: 'Resources (Food/Iron/Oil)',
    priority: 'LOW',
    notes: 'Skip unless desperately short. Resources are better farmed from other sources.',
  },
];

// ─── STRATEGY TIPS ───────────────────────────────────────────────────────────

export const GENERALS_TRIAL_TIPS: GeneralsTrialTip[] = [
  {
    category: 'Hero Selection',
    tip:
      'Always match your hero skills to your troop type. Aircraft heroes with Aircraft troops outperform mismatched builds significantly.',
  },
  {
    category: 'Hero Selection',
    tip:
      'Skill level matters more than hero rarity in General\'s Trial. A well-leveled SSR often beats a low-skill UR.',
  },
  {
    category: 'Troop Type',
    tip:
      'Missile Vehicle squads perform well across all modes due to the counter-all advantage. Good fallback if unsure.',
  },
  {
    category: 'Troop Type',
    tip:
      'Check enemy troop type before committing to a lineup. Bring the counter type for maximum damage multiplier.',
  },
  {
    category: 'Attempts',
    tip:
      'Do not burn all attempts at once in Advanced Mode. If cooldowns exist, stagger your attempts across the day.',
  },
  {
    category: 'Alliance Challenge',
    tip:
      'Hit the boss early in the event window — alliance members who contribute early get tracked even if the boss dies before window closes.',
  },
  {
    category: 'Alliance Challenge',
    tip:
      'Coordinate troop types with alliance if possible. If most are Aircraft, bring Infantry to hit back hard on the counter cycle.',
  },
  {
    category: 'Coins Priority',
    tip:
      'Spend Trial Coins on hero shards or Overlord items first. Resources are the worst value in the store.',
  },
  {
    category: 'Overlord Farming',
    tip:
      'Commander Certificates are the hardest Overlord item to accumulate. Treat every Advanced Mode run as a Certificate farming session.',
  },
];

// ─── SUMMARY FUNCTION ────────────────────────────────────────────────────────

export function getGeneralsTrialSummary(): string {
  const modeList = GENERALS_TRIAL_MODES.map((m) => {
    const mechanics = m.keyMechanics.map((k) => `    - ${k}`).join('\n');
    const rewards = m.rewardTypes.map((r) => `    - ${r}`).join('\n');
    return (
      `  [${m.type.toUpperCase()}] ${m.name}\n` +
      `  Unlock: ${m.unlockRequirement}\n` +
      `  Frequency: ${m.frequency}\n` +
      `  Key Mechanics:\n${mechanics}\n` +
      `  Rewards:\n${rewards}`
    );
  }).join('\n\n');

  const overlordItems = OVERLORD_REWARD_ITEMS.map(
    (o) => `  - ${o.itemName}: ${o.notes}`
  ).join('\n');

  const storePriority = TRIAL_COINS_STORE_PRIORITIES.map(
    (s) => `  [${s.priority}] ${s.item} — ${s.notes}`
  ).join('\n');

  const tips = GENERALS_TRIAL_TIPS.map(
    (t) => `  [${t.category}] ${t.tip}`
  ).join('\n');

  return `## General's Trial

General's Trial has 4 modes: Normal (daily solo), Advanced (harder solo, better rewards), Solo Challenge (event-based score attack), and Alliance Challenge (cooperative boss event).

### Modes
${modeList}

### Overlord Items from General's Trial
${overlordItems}

### Trial Coins Store Priority
${storePriority}

### Strategy Tips
${tips}
`;
}