// src/lib/lwtSkyBattlefrontData.ts
// Sky Battlefront — airship donation system, battle stages, off-season events
// Source: lastwartutorial.com content extract

export interface SkyBattlefrontPhase {
  name: string;
  description: string;
  duration: string;
  keyActions: string[];
  rewardTypes: string[];
}

export interface AirshipDonationTier {
  donationType: string;
  pointsAwarded: number;
  notes: string;
}

export interface SkyBattlefrontTip {
  category: string;
  tip: string;
}

// ─── EVENT OVERVIEW ──────────────────────────────────────────────────────────

export const SKY_BATTLEFRONT_OVERVIEW = {
  name: 'Sky Battlefront',
  description:
    'A multi-phase alliance event centered around donating resources to a shared Airship and then using that Airship in a server-wide aerial battle. Combines resource cooperation with combat scoring.',
  frequency: 'Scheduled event — not always active. Check event tab.',
  allianceRequired: true,
  minimumHQ: 'No hard minimum, but higher HQ = stronger donation capacity and battle contribution.',
  resetTime: '2am UTC (consistent with all LWSB event tracking)',
};

// ─── PHASES ──────────────────────────────────────────────────────────────────

export const SKY_BATTLEFRONT_PHASES: SkyBattlefrontPhase[] = [
  {
    name: 'Airship Donation Phase',
    description:
      'Alliance members donate resources (Oil, Iron, Food, Gold) and items to fuel and upgrade the shared Airship before the battle begins.',
    duration: 'Varies by event schedule — typically 1–3 days before battle opens.',
    keyActions: [
      'Donate resources to the Airship each day — higher donations = more personal event points',
      'Coordinate with alliance on which resource type is most needed',
      'Track donation leaderboard within alliance — top donors earn bonus rewards',
      'Alliance Airship level improves with total donations — stronger Airship = better battle stats',
      'Do not skip donation phase — battle performance scales with Airship strength',
    ],
    rewardTypes: [
      'Sky Battlefront Points (personal)',
      'Alliance Contribution Points',
      'Resource bundles for top donors',
    ],
  },
  {
    name: 'Battle Stage',
    description:
      'The aerial combat phase. Players deploy troops via the Airship to attack enemy positions, defend alliance nodes, or intercept enemy Airships.',
    duration: 'Typically 1–2 days. Multiple attack windows per day.',
    keyActions: [
      'Use Airship attack turns to hit the highest-value enemy targets',
      'Troop type counter triangle still applies in aerial combat — check enemy type before deploying',
      'Alliance coordinates target priority — focus fire on single targets over spreading attacks',
      'Defending alliance nodes contributes points — do not ignore defense',
      'Higher-level Airship (from donation phase) gives attack and defense stat bonuses',
      'Rally option may be available for major enemy targets — join alliance rallies for max points',
      'Unused attack turns expire — use all turns before window closes',
    ],
    rewardTypes: [
      'Sky Battlefront Points (scales to damage dealt)',
      'Speed-ups',
      'Resources',
      'Hero EXP items',
      'Exclusive Sky Battlefront currency for the event store',
    ],
  },
  {
    name: 'Off-Season / Preparation Window',
    description:
      'Period between Sky Battlefront events. Spend accumulated Sky Battlefront currency and prepare for next cycle.',
    duration: 'Between active event cycles.',
    keyActions: [
      'Spend Sky Battlefront currency in the event store before it expires',
      'Check if currency carries over — some events reset currency on next cycle',
      'Review donation contribution rank — plan to increase for next event',
      'Alliance R4/R5 should schedule next donation coordination before event opens',
    ],
    rewardTypes: [
      'Event store redemption — speed-ups, hero shards, resources',
      'Exclusive items only available during off-season store window',
    ],
  },
];

// ─── AIRSHIP DONATION TIERS ───────────────────────────────────────────────────

export const AIRSHIP_DONATION_TIERS: AirshipDonationTier[] = [
  {
    donationType: 'Oil (highest value)',
    pointsAwarded: 3,
    notes:
      'Oil is typically the most valuable donation type. If Oil is available to donate, prioritize it. Becomes scarce at HQ 25+ so weigh against personal needs.',
  },
  {
    donationType: 'Iron',
    pointsAwarded: 2,
    notes: 'Second best donation type. Good value for mid-game players with excess Iron from combat loot.',
  },
  {
    donationType: 'Food',
    pointsAwarded: 1,
    notes:
      'Lower point value but easiest to produce in large quantities. Donate if Oil/Iron quota is already filled.',
  },
  {
    donationType: 'Speed-up items',
    pointsAwarded: 5,
    notes:
      'High point value per item but costs real speed-up resources. Only donate speed-ups if event ranking rewards justify the sacrifice. Generally skip unless chasing top-tier rewards.',
  },
  {
    donationType: 'Gold',
    pointsAwarded: 2,
    notes:
      'Moderate value. If Gold is abundant (high VIP), worth donating for alliance Airship strength.',
  },
];

// ─── EVENT STORE PRIORITIES ───────────────────────────────────────────────────

export const SKY_BATTLEFRONT_STORE_PRIORITIES: { item: string; priority: string; notes: string }[] = [
  {
    item: 'Hero Shards (UR/SSR)',
    priority: 'HIGH',
    notes: 'Always the best spend if available. Check which hero is in store — not all are worth it.',
  },
  {
    item: 'Speed-ups (Build/Research)',
    priority: 'HIGH',
    notes: 'High value year-round. Buy these if hero shards are not available or already maxed.',
  },
  {
    item: 'Commander Certificates',
    priority: 'MEDIUM',
    notes: 'Good value if Overlord farming is your current goal. 1,800 needed per Overlord deploy.',
  },
  {
    item: 'Gold/Resources',
    priority: 'LOW',
    notes: 'Skip. Resource value from this store is poor compared to speed-ups or hero shards.',
  },
];

// ─── STRATEGY TIPS ───────────────────────────────────────────────────────────

export const SKY_BATTLEFRONT_TIPS: SkyBattlefrontTip[] = [
  {
    category: 'Donation Phase',
    tip:
      'Donate every day of the donation phase — missing days compounds. Even small daily donations keep your personal rank competitive.',
  },
  {
    category: 'Donation Phase',
    tip:
      'Oil is usually the most scarce alliance resource. Coordinate with alliance to prevent one resource type from bottlenecking Airship level.',
  },
  {
    category: 'Donation Phase',
    tip:
      'Do not donate speed-ups unless you are actively competing for top-3 alliance donation rank. The reward is usually not worth the speed-up cost.',
  },
  {
    category: 'Battle Stage',
    tip:
      'Use all attack turns. Expired turns = lost points. Set a reminder if needed.',
  },
  {
    category: 'Battle Stage',
    tip:
      'Join alliance rallies on enemy Airships or key nodes. Rally damage is multiplied — far more efficient than solo attacks.',
  },
  {
    category: 'Battle Stage',
    tip:
      'Counter the enemy troop type. If enemy is sending Tank squads, deploy Aircraft for maximum damage multiplier.',
  },
  {
    category: 'Alliance Coordination',
    tip:
      'Designate a target caller in alliance chat. Focused fire on one node > spread attacks across many.',
  },
  {
    category: 'Alliance Coordination',
    tip:
      'Smaller/weaker members should focus defense turns rather than attacking — contribution points still count and it protects alliance nodes.',
  },
  {
    category: 'Off-Season',
    tip:
      'Spend event currency before the next cycle starts. Check if currency resets — burning it on lower-priority items beats losing it entirely.',
  },
  {
    category: 'General',
    tip:
      'Sky Battlefront rewards scale heavily with Airship level. The donation phase is not optional — a weak Airship makes the battle phase much harder.',
  },
];

// ─── SUMMARY FUNCTION ────────────────────────────────────────────────────────

export function getSkyBattlefrontSummary(): string {
  const phases = SKY_BATTLEFRONT_PHASES.map((p) => {
    const actions = p.keyActions.map((a) => `    - ${a}`).join('\n');
    const rewards = p.rewardTypes.map((r) => `    - ${r}`).join('\n');
    return (
      `  ${p.name} (${p.duration})\n` +
      `  ${p.description}\n` +
      `  Key Actions:\n${actions}\n` +
      `  Rewards:\n${rewards}`
    );
  }).join('\n\n');

  const donationTiers = AIRSHIP_DONATION_TIERS.map(
    (d) => `  - ${d.donationType} (${d.pointsAwarded}pts): ${d.notes}`
  ).join('\n');

  const storePriority = SKY_BATTLEFRONT_STORE_PRIORITIES.map(
    (s) => `  [${s.priority}] ${s.item} — ${s.notes}`
  ).join('\n');

  const tips = SKY_BATTLEFRONT_TIPS.map(
    (t) => `  [${t.category}] ${t.tip}`
  ).join('\n');

  return `## Sky Battlefront

${SKY_BATTLEFRONT_OVERVIEW.description}
Frequency: ${SKY_BATTLEFRONT_OVERVIEW.frequency}
Alliance Required: Yes. Reset: ${SKY_BATTLEFRONT_OVERVIEW.resetTime}

### Phases
${phases}

### Airship Donation Value by Type
${donationTiers}

### Event Store Priority
${storePriority}

### Strategy Tips
${tips}
`;
}