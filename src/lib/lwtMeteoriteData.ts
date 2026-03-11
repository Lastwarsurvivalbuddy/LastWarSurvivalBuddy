// src/lib/lwtMeteoriteData.ts
// Meteorite Iron War — dispatch system, gathering mechanics, rewards
// Source: lastwartutorial.com content extract

export interface MeteoriteNodeType {
  name: string;
  resourceYield: string;
  troopRequirement: string;
  occupancyRule: string;
  notes: string;
}

export interface Meteorite_RewardTier {
  rank: string;
  rewardDescription: string;
  howToQualify: string;
}

export interface MeteoriteTip {
  category: string;
  tip: string;
}

// ─── EVENT OVERVIEW ──────────────────────────────────────────────────────────

export const METEORITE_OVERVIEW = {
  name: 'Meteorite Iron War',
  description:
    'A timed gathering event where players dispatch troops to Meteorite Iron nodes that fall across the server map. Players compete to occupy nodes and gather the maximum amount of Meteorite Iron before the event ends. Points are awarded based on total iron gathered.',
  frequency: 'Scheduled event — check event tab for next occurrence.',
  allianceRequired: false,
  notes:
    'Individual event. Alliance coordination still helps — members can hold adjacent nodes and deter attacks. Troops are dispatched like a normal gather march but to Meteorite nodes instead of standard resource tiles.',
};

// ─── NODE TYPES ──────────────────────────────────────────────────────────────

export const METEORITE_NODE_TYPES: MeteoriteNodeType[] = [
  {
    name: 'Small Meteorite Node',
    resourceYield: 'Low — faster to gather, lower total iron',
    troopRequirement: 'Low troop count needed. Good for lower HQ players.',
    occupancyRule: 'Single player occupancy. First to arrive gathers.',
    notes:
      'Best for beginners or players with limited march capacity. Less contested — easier to secure and hold.',
  },
  {
    name: 'Medium Meteorite Node',
    resourceYield: 'Moderate — meaningful yield per node',
    troopRequirement: 'Mid-range troop count. T9+ recommended for speed.',
    occupancyRule: 'Single player occupancy. First to arrive gathers.',
    notes:
      'Best value for most players. Target these consistently before going after large nodes.',
  },
  {
    name: 'Large Meteorite Node',
    resourceYield: 'High — best iron per node by far',
    troopRequirement: 'High troop count needed for best gather speed. T10/T11 strongly preferred.',
    occupancyRule: 'Single player occupancy. Most contested node type.',
    notes:
      'Heavily contested — expect competition and potential attacks. Alliance support helpful. Only viable for mid-to-high power players.',
  },
];

// ─── DISPATCH MECHANICS ──────────────────────────────────────────────────────

export const METEORITE_DISPATCH_MECHANICS = {
  marchType: 'Gather march — same mechanic as standard resource tile gathering.',
  troopSelection:
    'Send high-tier gather-speed troops. Research that improves gathering speed applies. Troop type (Infantry/Tank/etc.) matters less than tier and count for gathering.',
  gatherSpeed:
    'Gathering speed determines how quickly your troops extract iron from the node. Higher HQ, higher troop tier, and gathering research all increase speed.',
  marchCapacity:
    'Total iron gathered is limited by march capacity. Send maximum march size for best results. VIP level and military research increase march capacity.',
  attackable:
    'Troops gathering on Meteorite nodes CAN be attacked. If your troops are eliminated while gathering, you lose the node and any unextracted iron.',
  shieldInteraction:
    'Your shield does NOT protect gathering troops on map nodes. Only troops inside your base walls are shielded.',
  recallTiming:
    'Manually recall troops before the event ends to capture all gathered iron. Troops still on node when event closes may lose uncollected iron depending on event rules.',
};

// ─── GATHERING SPEED FACTORS ─────────────────────────────────────────────────

export const GATHER_SPEED_FACTORS: { factor: string; impact: string }[] = [
  {
    factor: 'Troop Tier',
    impact: 'T10/T11 gather significantly faster than T8/T9. Biggest single factor.',
  },
  {
    factor: 'March Capacity',
    impact: 'More troops = more iron per trip. Research march capacity before the event.',
  },
  {
    factor: 'Gathering Research',
    impact: 'Research tree has gathering speed and capacity nodes — prioritize before event.',
  },
  {
    factor: 'VIP Level',
    impact: 'Higher VIP adds gathering speed and march capacity bonuses.',
  },
  {
    factor: 'Hero Skills',
    impact: 'Some heroes have gathering buff skills. Assign a gathering hero if available.',
  },
  {
    factor: 'Alliance Technology',
    impact: 'Alliance tech tree may include gathering speed buffs. Check with R4/R5.',
  },
];

// ─── REWARD TIERS ────────────────────────────────────────────────────────────

export const METEORITE_REWARD_TIERS: Meteorite_RewardTier[] = [
  {
    rank: 'Top 3',
    rewardDescription: 'Premium reward bundle — speed-ups, exclusive items, large resource packs',
    howToQualify: 'Requires sustained gathering across multiple nodes. Full march capacity + T10/T11 troops.',
  },
  {
    rank: 'Top 10',
    rewardDescription: 'Strong reward bundle — speed-ups, resources, hero EXP items',
    howToQualify: 'Hit large nodes consistently. Defend against attackers or re-gather if displaced.',
  },
  {
    rank: 'Top 50',
    rewardDescription: 'Moderate reward — resources, some speed-ups',
    howToQualify: 'Focus on medium nodes. Complete multiple gather cycles during event window.',
  },
  {
    rank: 'Participation',
    rewardDescription: 'Base reward for gathering any amount of Meteorite Iron',
    howToQualify: 'Gather from at least one node before event ends.',
  },
];

// ─── STRATEGY TIPS ───────────────────────────────────────────────────────────

export const METEORITE_TIPS: MeteoriteTip[] = [
  {
    category: 'Preparation',
    tip:
      'Before the event starts, scout the map for Meteorite nodes. Know where large nodes are spawning so you can march immediately when the event opens.',
  },
  {
    category: 'Preparation',
    tip:
      'Queue all available marches to nodes the moment the event opens. Speed of dispatch is critical — large nodes fill immediately.',
  },
  {
    category: 'Troop Selection',
    tip:
      'Send your highest-tier troops for max gather speed. Troop type does not matter for gathering — tier and count do.',
  },
  {
    category: 'Troop Selection',
    tip:
      'Max out your march capacity before dispatching. Every extra troop slot = more iron per trip.',
  },
  {
    category: 'Defense',
    tip:
      'Troops on Meteorite nodes are vulnerable. Station your Overlord or strongest hero on your base to deter retaliatory attacks while your troops are out.',
  },
  {
    category: 'Defense',
    tip:
      'If you are in a strong alliance, coordinate — have members hold nearby tiles to reduce risk of your gathering troops being attacked.',
  },
  {
    category: 'Defense',
    tip:
      'Do NOT use your shield while gathering. Shielding ends when you march — wait until all troops are recalled before shielding.',
  },
  {
    category: 'Timing',
    tip:
      'Plan gather cycles. If a node takes 2 hours to gather and the event runs 8 hours, you can hit 3–4 nodes per march slot. Time your recalls for re-dispatch.',
  },
  {
    category: 'Timing',
    tip:
      'Recall all troops before the event ends. Troops still gathering when the event timer hits zero risk losing accumulated iron.',
  },
  {
    category: 'Efficiency',
    tip:
      'Do not let gathering marches sit idle. The moment troops return, dispatch them again immediately.',
  },
  {
    category: 'Efficiency',
    tip:
      'If large nodes are too contested, pivot to medium nodes. Consistent medium-node gathering beats fighting over large nodes you keep getting displaced from.',
  },
  {
    category: 'Hospital',
    tip:
      'If your gathering troops get attacked and injured, heal immediately and re-dispatch. Do not let troops sit in hospital during the event window.',
  },
];

// ─── SUMMARY FUNCTION ────────────────────────────────────────────────────────

export function getMeteoriteSummary(): string {
  const nodes = METEORITE_NODE_TYPES.map(
    (n) =>
      `  [${n.name}]\n` +
      `  Yield: ${n.resourceYield}\n` +
      `  Troops: ${n.troopRequirement}\n` +
      `  Rule: ${n.occupancyRule}\n` +
      `  Notes: ${n.notes}`
  ).join('\n\n');

  const mechanics = Object.entries(METEORITE_DISPATCH_MECHANICS)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  const speedFactors = GATHER_SPEED_FACTORS.map(
    (f) => `  - ${f.factor}: ${f.impact}`
  ).join('\n');

  const rewards = METEORITE_REWARD_TIERS.map(
    (r) => `  [${r.rank}] ${r.rewardDescription} — ${r.howToQualify}`
  ).join('\n');

  const tips = METEORITE_TIPS.map(
    (t) => `  [${t.category}] ${t.tip}`
  ).join('\n');

  return `## Meteorite Iron War

${METEORITE_OVERVIEW.description}
Frequency: ${METEORITE_OVERVIEW.frequency}
Individual event (no alliance required, but alliance support helps).

### Node Types
${nodes}

### Dispatch Mechanics
${mechanics}

### Gathering Speed Factors
${speedFactors}

### Reward Tiers
${rewards}

### Strategy Tips
${tips}
`;
}