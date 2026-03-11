// src/lib/lwtVIPData.ts
// VIP Program — full level guide from LWT source, cross-referenced with vipData.ts
// Source: lastwartutorial.com content extract
// Note: vipData.ts already exists with milestone data. This module adds LWT-sourced
//       strategy layer, earning methods, and spend-tier-specific guidance.

export interface VIPEarningMethod {
  method: string;
  pointsPerAction: string;
  notes: string;
}

export interface VIPLevelBenefit {
  level: number;
  keyUnlock: string;
  cumulativePoints: number;
  strategicImportance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
}

export interface VIPSpendAdvice {
  spendTier: string;
  targetVIPLevel: string;
  strategy: string;
  keyPriority: string;
}

// ─── KEY MILESTONES (LWT-sourced, cross-checks vipData.ts) ──────────────────

export const VIP_LEVEL_BENEFITS: VIPLevelBenefit[] = [
  {
    level: 3,
    keyUnlock: 'Auto-battle feature unlocks',
    cumulativePoints: 1000,
    strategicImportance: 'HIGH',
    notes:
      'First meaningful unlock. Auto-battle saves time on zombie kills and missions. Get here quickly — even F2P can reach VIP 3 within the first week via free VIP points.',
  },
  {
    level: 5,
    keyUnlock: 'Faster building queue + additional building slot',
    cumulativePoints: 3500,
    strategicImportance: 'HIGH',
    notes:
      'Speeds up early progression significantly. Reachable within the first month without heavy spending.',
  },
  {
    level: 8,
    keyUnlock: 'Shirley hero shard rewards begin / Special VIP daily gift',
    cumulativePoints: 15000,
    strategicImportance: 'CRITICAL',
    notes:
      'VIP 8 is the single most important milestone for mid-game players. Shirley is a top-tier support hero — the VIP 8 daily shards are a primary Shirley unlock path for F2P and budget players. Do not skip this milestone.',
  },
  {
    level: 10,
    keyUnlock: 'Daily VIP gift chest improves significantly',
    cumulativePoints: 36000,
    strategicImportance: 'MEDIUM',
    notes:
      'Noticeable daily reward improvement. Reachable for moderate spenders within 1–2 months.',
  },
  {
    level: 11,
    keyUnlock: 'Additional march slot unlocks',
    cumulativePoints: 55000,
    strategicImportance: 'CRITICAL',
    notes:
      'Extra march slot is massive — enables simultaneous gathering + combat marches. Huge QoL and event efficiency upgrade. High-priority target for all players.',
  },
  {
    level: 13,
    keyUnlock: 'Improved daily VIP gift + faster research speed bonus',
    cumulativePoints: 100000,
    strategicImportance: 'MEDIUM',
    notes:
      'Research speed bonus compounds over time. Worthwhile long-term but not urgent.',
  },
  {
    level: 15,
    keyUnlock: '5th march slot unlocks',
    cumulativePoints: 200000,
    strategicImportance: 'CRITICAL',
    notes:
      '5th march is a major power multiplier — 5 simultaneous marches means 5x gathering, 5x combat presence. Target for serious investors. Requires sustained spending or VIP point farming over many months.',
  },
  {
    level: 18,
    keyUnlock: 'Maximum VIP tier — all bonuses active',
    cumulativePoints: 1000000,
    strategicImportance: 'HIGH',
    notes:
      'Endgame tier for heavy investors. Full VIP 18 bonuses include max march slots, max daily gifts, and maximum speed bonuses across all categories. Long-term goal only.',
  },
];

// ─── VIP POINT EARNING METHODS ───────────────────────────────────────────────

export const VIP_EARNING_METHODS: VIPEarningMethod[] = [
  {
    method: 'Daily Login',
    pointsPerAction: '50–200 pts/day (scales with current VIP level)',
    notes:
      'Free and automatic. Log in every day — missing days compounds loss over months.',
  },
  {
    method: 'Diamond Spending',
    pointsPerAction: '1 VIP point per 1 Diamond spent',
    notes:
      'Most efficient conversion rate for spenders. Every Diamond purchase through packs or the store generates VIP points. Primary earning method for paying players.',
  },
  {
    method: 'Pack Purchases',
    pointsPerAction: 'Varies by pack — displayed at purchase',
    notes:
      'Always check VIP point value when evaluating a pack. Two packs with similar Diamond counts can differ significantly in VIP points awarded.',
  },
  {
    method: 'VIP Gift Cards / VIP Scrolls',
    pointsPerAction: 'Fixed amount per card',
    notes:
      'Obtainable from events and the Alliance store. Stockpile and use in bulk when close to a key VIP milestone.',
  },
  {
    method: 'Season Battle Pass',
    pointsPerAction: 'Lump sum of VIP points awarded at purchase',
    notes:
      'Season pass is one of the best-value purchases in the game — includes VIP points alongside speed-ups, heroes, and resources.',
  },
  {
    method: 'Event Rewards',
    pointsPerAction: 'Varies by event',
    notes:
      'Many timed events include VIP points in reward tiers. Participate in all events to accumulate passively.',
  },
  {
    method: 'Hot Deals Purchases',
    pointsPerAction: 'Displayed on deal',
    notes:
      'Hot Deals that include Diamond purchases generate VIP points. Factor this in when evaluating Hot Deal value.',
  },
];

// ─── SPEND TIER GUIDANCE ─────────────────────────────────────────────────────

export const VIP_SPEND_ADVICE: VIPSpendAdvice[] = [
  {
    spendTier: 'F2P (Free to Play)',
    targetVIPLevel: 'VIP 5–8',
    strategy:
      'Focus on daily login points and event rewards. Push to VIP 8 for Shirley shards — this alone justifies the slow climb. VIP Scrolls from Alliance store accelerate progress.',
    keyPriority: 'Hit VIP 8 for Shirley. Every day of VIP 8+ is a free Shirley shard.',
  },
  {
    spendTier: 'Budget ($5–$30/mo)',
    targetVIPLevel: 'VIP 8–11',
    strategy:
      'Season Pass is the single best purchase — dense VIP points plus speed-ups and hero shards. Supplement with selective Hot Deals that include Diamond. Target VIP 11 for the extra march slot.',
    keyPriority: 'Season Pass first. Then save for Hot Deals that push VIP 11 within 3–4 months.',
  },
  {
    spendTier: 'Mid ($50–$100/mo)',
    targetVIPLevel: 'VIP 11–13',
    strategy:
      'Season Pass + Monthly Card + selective Hot Deals. VIP 11 march slot should be reachable within 60–90 days. VIP 13 research bonus is worthwhile once 11 is locked.',
    keyPriority: 'March slot at VIP 11 is the unlock that changes gameplay. Get there first.',
  },
  {
    spendTier: 'Investor ($200+/mo)',
    targetVIPLevel: 'VIP 15+',
    strategy:
      'VIP 15 (5th march) is achievable within 3–6 months at this spend rate. Prioritize packs with highest Diamond-to-VIP-point ratio. Evaluate every purchase for VIP value.',
    keyPriority: '5th march at VIP 15 is the endgame efficiency multiplier. Everything leads here.',
  },
];

// ─── VIP DAILY GIFTS BY TIER ─────────────────────────────────────────────────

export const VIP_DAILY_GIFT_NOTES: { levelRange: string; quality: string; notes: string }[] = [
  {
    levelRange: 'VIP 1–4',
    quality: 'Basic',
    notes: 'Small resources and speed-ups. Valuable early but modest.',
  },
  {
    levelRange: 'VIP 5–7',
    quality: 'Moderate',
    notes: 'Better speed-up quality and quantity. Worth logging in for daily.',
  },
  {
    levelRange: 'VIP 8–10',
    quality: 'Good',
    notes: 'Shirley shards begin at VIP 8. This is where daily gifts become genuinely impactful.',
  },
  {
    levelRange: 'VIP 11–14',
    quality: 'Strong',
    notes: 'UR hero shards and better speed-up bundles. Daily gift becomes a meaningful resource.',
  },
  {
    levelRange: 'VIP 15–18',
    quality: 'Premium',
    notes: 'Top-tier daily gifts. Speed-ups, UR shards, Diamonds. Endgame daily income.',
  },
];

// ─── GENERAL TIPS ────────────────────────────────────────────────────────────

export const VIP_GENERAL_TIPS: { category: string; tip: string }[] = [
  {
    category: 'Milestones',
    tip:
      'VIP 3 → VIP 8 → VIP 11 → VIP 15 are the four key targets. Everything else is a waypoint. Plan spending around hitting these in order.',
  },
  {
    category: 'Milestones',
    tip:
      'VIP 8 is the most underrated milestone in the game. The Shirley shard accumulation alone is worth the grind for F2P and budget players.',
  },
  {
    category: 'Earning',
    tip:
      'Never miss daily login. 365 days of login VIP points adds up significantly toward the next milestone.',
  },
  {
    category: 'Earning',
    tip:
      'VIP Scrolls from Alliance store have a weekly purchase limit. Buy them every week — they go directly toward your next milestone.',
  },
  {
    category: 'Spending',
    tip:
      'When close to a VIP milestone, stockpile VIP Scrolls and spend them all in one session to hit the milestone cleanly.',
  },
  {
    category: 'Spending',
    tip:
      'Season Pass is always the best-value purchase for VIP progression. If you spend anything, start there.',
  },
  {
    category: 'March Slots',
    tip:
      'VIP 11 (4th march) and VIP 15 (5th march) are the two most impactful gameplay unlocks in the entire VIP tree. Every other upgrade is incremental — these are step-changes.',
  },
  {
    category: 'F2P',
    tip:
      'F2P players who log in daily and buy Alliance store VIP Scrolls weekly can realistically reach VIP 8 within 2–3 months. It is slow but achievable.',
  },
];

// ─── SUMMARY FUNCTION ────────────────────────────────────────────────────────

export function getLWTVIPSummary(): string {
  const milestones = VIP_LEVEL_BENEFITS.map(
    (v) =>
      `  VIP ${v.level} [${v.strategicImportance}]: ${v.keyUnlock}\n` +
      `  Cumulative Points: ${v.cumulativePoints.toLocaleString()} — ${v.notes}`
  ).join('\n\n');

  const earningMethods = VIP_EARNING_METHODS.map(
    (e) => `  - ${e.method} (${e.pointsPerAction}): ${e.notes}`
  ).join('\n');

  const spendAdvice = VIP_SPEND_ADVICE.map(
    (s) =>
      `  [${s.spendTier}] Target: ${s.targetVIPLevel}\n` +
      `  Strategy: ${s.strategy}\n` +
      `  Priority: ${s.keyPriority}`
  ).join('\n\n');

  const dailyGifts = VIP_DAILY_GIFT_NOTES.map(
    (d) => `  ${d.levelRange} (${d.quality}): ${d.notes}`
  ).join('\n');

  const tips = VIP_GENERAL_TIPS.map(
    (t) => `  [${t.category}] ${t.tip}`
  ).join('\n');

  return `## VIP System (Extended Guide)

The VIP system rewards consistent spending and daily engagement with march slots, speed bonuses, daily gift chests, and hero shards. The four CRITICAL milestones are VIP 3, VIP 8, VIP 11, and VIP 15.

### Key Milestones
${milestones}

### How to Earn VIP Points
${earningMethods}

### Guidance by Spend Tier
${spendAdvice}

### Daily Gift Quality by Level
${dailyGifts}

### General Tips
${tips}
`;
}