/**
 * t10Data.ts
 * T10 Troop Research Data for Last War: Survival Buddy
 *
 * Source: lastwarhandbook.com/calculators/t10-research
 * Confirmed: Node names, count, max levels, troop types, resource types
 * PENDING: Per-level resource costs (client-rendered — not extractable from HTML)
 * Update target: cpt-hedge.com data OR manual calculator scrape
 *
 * Last updated: March 6, 2026
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type T10TroopType = 'infantry' | 'cavalry' | 'ranged';

export interface LevelCost {
  food: number;
  iron: number;
  gold: number;
  coins: number;
  valorBadges: number;
  timeSeconds: number;
}

export interface GatekeeperNode {
  id: string;
  name: string;
  order: number;          // 1–4, must be completed in order
  maxLevel: number;       // confirmed: 10
  costsPerLevel: LevelCost[] | null; // null = PENDING
}

export interface T10TroopResearch {
  troopType: T10TroopType;
  displayName: string;
  costsPerLevel: LevelCost[] | null; // null = PENDING
}

// ─── Gatekeeper Nodes ─────────────────────────────────────────────────────────
// All 4 must be maxed to Level 10 before T10 troop research unlocks.
// Confirmed names and order from lastwarhandbook.com schema data.

export const GATEKEEPER_NODES: GatekeeperNode[] = [
  {
    id: 'special_forces_foundation',
    name: 'Special Forces Foundation',
    order: 1,
    maxLevel: 10,
    costsPerLevel: null, // ⚠️ PENDING — cpt-hedge or manual scrape
  },
  {
    id: 'elite_training_protocol',
    name: 'Elite Training Protocol',
    order: 2,
    maxLevel: 10,
    costsPerLevel: null, // ⚠️ PENDING
  },
  {
    id: 'advanced_combat_systems',
    name: 'Advanced Combat Systems',
    order: 3,
    maxLevel: 10,
    costsPerLevel: null, // ⚠️ PENDING
  },
  {
    id: 't10_authorization',
    name: 'T10 Authorization',
    order: 4,
    maxLevel: 10,
    costsPerLevel: null, // ⚠️ PENDING
  },
];

// ─── T10 Troop Research ───────────────────────────────────────────────────────
// After all 4 gatekeepers hit L10, each troop type is researched independently.

export const T10_TROOP_RESEARCH: T10TroopResearch[] = [
  {
    troopType: 'infantry',
    displayName: 'T10 Infantry',
    costsPerLevel: null, // ⚠️ PENDING
  },
  {
    troopType: 'cavalry',
    displayName: 'T10 Cavalry',
    costsPerLevel: null, // ⚠️ PENDING
  },
  {
    troopType: 'ranged',
    displayName: 'T10 Ranged',
    costsPerLevel: null, // ⚠️ PENDING
  },
];

// ─── Resource Types Confirmed ─────────────────────────────────────────────────
// These 6 resource types are confirmed required for T10 research path.
export const T10_RESOURCE_TYPES = [
  'food',
  'iron',
  'gold',
  'coins',
  'valorBadges',  // Special currency — events, alliance activities, packs
  'time',
] as const;

// ─── Key Facts (Confirmed) ────────────────────────────────────────────────────
export const T10_KEY_FACTS = {
  gatekeeperCount: 4,
  gatekeeperMaxLevel: 10,
  troopTypes: ['infantry', 'cavalry', 'ranged'] as T10TroopType[],
  valorBadgeSource: 'Events, alliance activities, and special packs',
  unlockCondition: 'All 4 gatekeeper nodes must reach Level 10',
  researchTree: 'Special Forces',
  // ⚠️ Total Valor Badge cost PENDING — "tens of thousands" per source description
  totalValorBadgesEstimate: null as number | null,
};

// ─── Helper: Progress Summary ─────────────────────────────────────────────────

export interface T10Progress {
  gatekeeperLevels: Record<string, number>; // nodeId → current level
}

/**
 * Returns how many gatekeeper levels remain to unlock T10 research.
 * Safe to call even with pending cost data.
 */
export function getGatekeeperLevelsRemaining(progress: T10Progress): number {
  return GATEKEEPER_NODES.reduce((total, node) => {
    const current = progress.gatekeeperLevels[node.id] ?? 0;
    return total + Math.max(0, node.maxLevel - current);
  }, 0);
}

/**
 * Returns true if all 4 gatekeepers are maxed (T10 research unlocked).
 */
export function isT10Unlocked(progress: T10Progress): boolean {
  return GATEKEEPER_NODES.every(
    (node) => (progress.gatekeeperLevels[node.id] ?? 0) >= node.maxLevel
  );
}

/**
 * Returns the next gatekeeper node that needs work, in order.
 */
export function getNextGatekeeperTarget(progress: T10Progress): GatekeeperNode | null {
  return (
    GATEKEEPER_NODES.find(
      (node) => (progress.gatekeeperLevels[node.id] ?? 0) < node.maxLevel
    ) ?? null
  );
}

// ─── Buddy System Prompt Summary ─────────────────────────────────────────────

export function getT10Summary(): string {
  return `
## T10 Troop Research

T10 troops (Infantry, Cavalry, Ranged) are unlocked through the Special Forces research tree.

**Unlock requirement:** All 4 Gatekeeper nodes must reach Level 10:
1. Special Forces Foundation (L1–10)
2. Elite Training Protocol (L1–10)
3. Advanced Combat Systems (L1–10)
4. T10 Authorization (L1–10)

**Resources required:** Food, Iron, Gold, Coins, Valor Badges, and Time
**Valor Badges** are earned through events, alliance activities, and special packs. The full T10 path requires tens of thousands.

**After gatekeepers:** Research T10 Infantry, T10 Cavalry, and T10 Ranged independently.

**Key decision point:** Use this when a player is deciding whether to start gatekeepers now or keep banking Valor Badges. Most useful once T9 core is stable.

⚠️ Exact per-level resource costs pending — will be added when cpt-hedge data is available.
`.trim();
}