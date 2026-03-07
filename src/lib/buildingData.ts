/**
 * buildingData.ts
 * Last War: Survival — Buildings Registry
 *
 * Source: lastwarhandbook.com/buildings/calculator (verified March 6, 2026)
 *
 * CONFIRMED facts (fully rendered in static HTML — not client-side):
 *   - Complete building list with categories and max levels ✅
 *   - Resources required: Iron, Food, Gold, Oil
 *   - Construction time reducible via alliance helps (up to 30%)
 *   - HQ must be upgraded first — gates everything else
 *   - Speed buffs and alliance help reduction supported
 *
 * NOTE: Per-level resource costs are client-rendered (interactive calculator).
 * Max levels and building list are fully confirmed.
 */

export type BuildingCategory = 'core' | 'resource' | 'military' | 'defense' | 'special';

export interface Building {
  name: string;
  category: BuildingCategory;
  maxLevel: number;
}

// ============================================================
// BUILDING REGISTRY — ✅ ALL CONFIRMED FROM STATIC HTML
// ============================================================

export const BUILDINGS: Building[] = [
  // Core
  { name: 'Headquarters',   category: 'core',     maxLevel: 35 },
  { name: 'Research Center', category: 'core',    maxLevel: 35 },
  { name: 'Alliance Center', category: 'core',    maxLevel: 30 },

  // Resource
  { name: 'Farm',           category: 'resource', maxLevel: 35 },
  { name: 'Iron Mine',      category: 'resource', maxLevel: 35 },
  { name: 'Gold Mine',      category: 'resource', maxLevel: 35 },
  { name: 'Oil Refinery',   category: 'resource', maxLevel: 35 },
  { name: 'Warehouse',      category: 'resource', maxLevel: 35 },

  // Military
  { name: 'Barracks',       category: 'military', maxLevel: 35 },
  { name: 'Tank Center',    category: 'military', maxLevel: 35 },
  { name: 'Fighter Camp',   category: 'military', maxLevel: 35 },
  { name: 'Hospital',       category: 'military', maxLevel: 35 },
  { name: 'Drill Ground',   category: 'military', maxLevel: 30 },

  // Defense
  { name: 'Wall',           category: 'defense',  maxLevel: 30 },
  { name: 'Watchtower',     category: 'defense',  maxLevel: 25 },

  // Special
  { name: 'Hero Hall',      category: 'special',  maxLevel: 35 },
  { name: 'Radar Station',  category: 'special',  maxLevel: 30 },
  { name: 'Trading Post',   category: 'special',  maxLevel: 25 },
];

/** Look up a building by name (case-insensitive) */
export function getBuilding(name: string): Building | undefined {
  return BUILDINGS.find(b => b.name.toLowerCase() === name.toLowerCase());
}

/** Get all buildings in a category */
export function getBuildingsByCategory(category: BuildingCategory): Building[] {
  return BUILDINGS.filter(b => b.category === category);
}

// ============================================================
// STRATEGY NOTES — ✅ CONFIRMED FROM PAGE
// ============================================================

export const BUILDING_STRATEGY_NOTES = [
  'Always upgrade HQ first — it unlocks all other building upgrades.',
  'Alliance helps reduce construction time by up to 30%.',
  'Save big upgrades for building events to maximize rewards.',
  'Keep Warehouse level high to protect resources from being raided.',
  'Calculate total resource cost before starting a major upgrade chain.',
];

export const BUILDING_RESOURCES = ['Iron', 'Food', 'Gold', 'Oil'];

// ============================================================
// BUDDY SUMMARY
// ============================================================

export function getBuildingSummary(): string {
  const byCategory = (cat: BuildingCategory) =>
    getBuildingsByCategory(cat)
      .map(b => `${b.name} (max ${b.maxLevel})`)
      .join(', ');

  return `
BUILDINGS:
- Core: ${byCategory('core')}
- Resource: ${byCategory('resource')}
- Military: ${byCategory('military')}
- Defense: ${byCategory('defense')}
- Special: ${byCategory('special')}
- Upgrade costs use Iron, Food, Gold, Oil.
- HQ must be upgraded first — it gates all other buildings.
- Alliance helps reduce construction time by up to 30%.
- Save large upgrades for building events to maximize event rewards.
- Keep Warehouse leveled to protect stockpiled resources.
`.trim();
}

// ============================================================
// VERIFY
// ============================================================

export function verify(): boolean {
  const hq = getBuilding('Headquarters');
  const watchtower = getBuilding('Watchtower');
  const tradingPost = getBuilding('Trading Post');
  const drillGround = getBuilding('Drill Ground');

  console.log(`HQ max level: ${hq?.maxLevel} | expected: 35 | ${hq?.maxLevel === 35 ? '✅' : '❌'}`);
  console.log(`Watchtower max: ${watchtower?.maxLevel} | expected: 25 | ${watchtower?.maxLevel === 25 ? '✅' : '❌'}`);
  console.log(`Trading Post max: ${tradingPost?.maxLevel} | expected: 25 | ${tradingPost?.maxLevel === 25 ? '✅' : '❌'}`);
  console.log(`Drill Ground max: ${drillGround?.maxLevel} | expected: 30 | ${drillGround?.maxLevel === 30 ? '✅' : '❌'}`);
  console.log(`Total buildings: ${BUILDINGS.length} | expected: 18 | ${BUILDINGS.length === 18 ? '✅' : '❌'}`);

  return hq?.maxLevel === 35 && watchtower?.maxLevel === 25 && BUILDINGS.length === 18;
}