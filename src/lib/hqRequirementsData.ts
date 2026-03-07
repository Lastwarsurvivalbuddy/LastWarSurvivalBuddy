/**
 * hqRequirementsData.ts
 * HQ Upgrade Requirements Data for Last War: Survival Buddy
 *
 * Source: lastwarhandbook.com/calculators/hq-requirements
 * Confirmed: Milestones, resource types, Age of Oil trigger, cumulative totals HQ 1→25
 * PENDING: Per-level resource costs, per-level building prerequisites (client-rendered)
 * Update target: cpt-hedge.com data OR manual calculator scrape
 *
 * Last updated: March 6, 2026
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HQCost {
  iron: number;
  food: number;
  gold: number;
  oil: number;           // 0 before HQ 25, required from HQ 25+
  timeSeconds: number;
}

export interface HQMilestone {
  hqLevel: number;
  label: string;
  description: string;
}

export interface HQLevelData {
  level: number;
  cost: HQCost | null;           // null = PENDING per-level data
  prerequisites: string[] | null; // null = PENDING — building names + levels required
  powerGain: number | null;       // null = PENDING
  unlocks: string[];              // confirmed unlocks at this level
}

// ─── Key Milestones — CONFIRMED ✅ ────────────────────────────────────────────
// Source: FAQ schema + rendered milestone badges in HTML

export const HQ_MILESTONES: HQMilestone[] = [
  {
    hqLevel: 10,
    label: 'T5 Troops',
    description: 'Unlocks T5 troop training',
  },
  {
    hqLevel: 15,
    label: 'Ultimate Skill',
    description: 'Unlocks hero Ultimate Skill slot',
  },
  {
    hqLevel: 20,
    label: 'Special Forces Research',
    description: 'Unlocks Special Forces research tree — path to T10',
  },
  {
    hqLevel: 25,
    label: 'Age of Oil',
    description: 'Oil becomes required resource for HQ upgrades. Unlocks oil buildings and research.',
  },
  {
    hqLevel: 28,
    label: 'T10 Research Path',
    description: 'T10 troop research path becomes available',
  },
  {
    hqLevel: 35,
    label: 'Maximum HQ',
    description: 'Max level. Unlocks all content including Hero Level 175 cap.',
  },
];

// ─── Confirmed Cumulative Totals ✅ ───────────────────────────────────────────
// Source: Calculator default state rendered in HTML (HQ 1 → HQ 25, 0% speed buff)
// These are the CUMULATIVE costs from HQ 1 to HQ 25.

export const HQ_CUMULATIVE_CONFIRMED = {
  hq1_to_25: {
    iron: 424_441_000,       // 424.44M ✅
    food: 424_441_000,       // 424.44M ✅
    gold: 84_888_200,        // 84.89M ✅
    oil: 5_000_000,          // 5.00M ✅ (oil only applies at HQ 25 itself)
    timeSeconds: 1_614_840,  // 18d 15h 14m ✅ (at 0% speed buff)
    powerGain: 3_113_000,    // 3.11M power ✅
  },
} as const;

// ─── Resource Types — CONFIRMED ✅ ───────────────────────────────────────────
export const HQ_RESOURCE_TYPES = ['iron', 'food', 'gold', 'oil', 'time'] as const;

// ─── Prerequisite Building Categories — CONFIRMED ✅ ─────────────────────────
// These building types are confirmed as HQ prerequisites.
// Exact level requirements per HQ level are PENDING.
export const HQ_PREREQUISITE_BUILDINGS = [
  'Barracks',
  'Research Center',
  'Iron Mine',
  'Farm',
  'Hospital',
  'Wall',
  'Oil Refinery', // required from HQ 25+
] as const;

// ─── HQ Level Registry ───────────────────────────────────────────────────────
// Structural scaffold — per-level costs and prerequisites PENDING.
// Unlocks populated where confirmed from milestone data.

export const HQ_LEVELS: HQLevelData[] = Array.from({ length: 35 }, (_, i) => {
  const level = i + 1;
  const unlocks: string[] = [];

  if (level === 10) unlocks.push('T5 Troops');
  if (level === 15) unlocks.push('Ultimate Skill');
  if (level === 20) unlocks.push('Special Forces Research');
  if (level === 25) unlocks.push('Age of Oil', 'Oil Refinery buildings', 'Oil Research');
  if (level === 28) unlocks.push('T10 Research Path');
  if (level === 35) unlocks.push('Maximum Level', 'Hero Level 175 cap');

  return {
    level,
    cost: null,         // ⚠️ PENDING — cpt-hedge or manual scrape
    prerequisites: null, // ⚠️ PENDING
    powerGain: null,    // ⚠️ PENDING
    unlocks,
  };
});

// ─── Helper: Get Milestone for HQ Level ──────────────────────────────────────

export function getMilestoneAtLevel(hqLevel: number): HQMilestone | null {
  return HQ_MILESTONES.find((m) => m.hqLevel === hqLevel) ?? null;
}

/**
 * Returns all milestones a player will pass going from currentHQ to targetHQ.
 */
export function getMilestonesInRange(currentHQ: number, targetHQ: number): HQMilestone[] {
  return HQ_MILESTONES.filter(
    (m) => m.hqLevel > currentHQ && m.hqLevel <= targetHQ
  );
}

/**
 * Returns the next milestone above the player's current HQ level.
 */
export function getNextMilestone(currentHQ: number): HQMilestone | null {
  return HQ_MILESTONES.find((m) => m.hqLevel > currentHQ) ?? null;
}

/**
 * Returns true if this HQ level triggers Age of Oil (oil becomes required).
 */
export function isAgeOfOilLevel(hqLevel: number): boolean {
  return hqLevel >= 25;
}

/**
 * Returns true if player is approaching Age of Oil and should prepare.
 * Warning window: HQ 22–24.
 */
export function shouldWarnAgeOfOil(currentHQ: number): boolean {
  return currentHQ >= 22 && currentHQ < 25;
}

// ─── Buddy System Prompt Summary ─────────────────────────────────────────────

export function getHQRequirementsSummary(): string {
  return `
## HQ Requirements

HQ max level is 35. Resources required: Iron, Food, Gold, Oil (from HQ 25+), and Time.

**Key milestones:**
- HQ 10: T5 Troops unlock
- HQ 15: Ultimate Skill unlock
- HQ 20: Special Forces Research unlock (path to T10 troops)
- HQ 25: Age of Oil begins — oil becomes required for all future HQ upgrades
- HQ 28: T10 Research Path available
- HQ 35: Maximum level — Hero Level 175 cap unlocked

**Cumulative cost HQ 1→25 (confirmed):**
- Iron: 424.4M | Food: 424.4M | Gold: 84.9M | Oil: 5M
- Time: 18d 15h 14m (at 0% construction buff)
- Power gain: 3.11M

**Building prerequisites** (exact levels PENDING): Barracks, Research Center, Iron Mine, Farm, Hospital, Wall, Oil Refinery (HQ 25+).

**Key advice:**
- Upgrade Oil Refinery early — oil becomes the bottleneck at HQ 25+
- Construction speed (VIP, heroes, gear) becomes critical at HQ 20+
- Clear prerequisite building chain before attempting HQ upgrade
- Most useful decision point: HQ 20+ when requirement chain stacks

⚠️ Per-level costs and exact building prerequisites pending cpt-hedge data.
`.trim();
}