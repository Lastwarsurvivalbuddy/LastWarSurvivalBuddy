/**
 * gearData.ts
 * Last War: Survival — Gear Upgrade & Star Promotion Data
 *
 * Source: lastwarhandbook.com/calculators/gear (verified March 6, 2026)
 *
 * CONFIRMED facts (from FAQ structured data + UI):
 *   - UR (Legendary) max level: 40
 *   - SSR (Epic) max level: 30
 *   - SR (Rare) max level: 15
 *   - Level upgrades cost: Gold + Upgrade Ore
 *   - Star promotions cost: Gold + Upgrade Ore + Dielectric Ceramic + Blueprints
 *   - 1★ through 4★: Legendary Blueprints
 *   - 5★ (Mythic): Mythic Blueprints (different currency)
 *   - 0★ → 4★ total: 50 Legendary Blueprints (5+10+15+20) ✅ confirmed
 *   - 5★: 10 Mythic Blueprints + ~206M gold + ~137.5K ore + 1,650 dielectric ceramic ✅ confirmed
 *   - Level 20 Gear Factory required for star promotions
 *   - UR gear: L0→L25 = 12,150,000 gold + 80,400 ore ✅ confirmed from UI
 *
 * NOTE: Full per-level cost tables are client-rendered (collapsed accordion).
 * Per-level costs below are ESTIMATES derived from confirmed anchor points.
 * The star promotion costs for 0★→4★ (individual step costs) are partially estimated.
 */

// ============================================================
// GEAR TIERS
// ============================================================

export type GearTier = 'UR' | 'SSR' | 'SR';

export const GEAR_MAX_LEVEL: Record<GearTier, number> = {
  UR:  40,
  SSR: 30,
  SR:  15,
};

// ============================================================
// STAR PROMOTION BLUEPRINTS
// ============================================================

/** Legendary Blueprint cost per star promotion step (0★→1★, 1★→2★, etc.) */
export const LEGENDARY_BP_PER_STAR: Record<number, number> = {
  1: 5,   // 0★ → 1★
  2: 10,  // 1★ → 2★
  3: 15,  // 2★ → 3★
  4: 20,  // 3★ → 4★
};

/** Total Legendary Blueprints for 0★ → 4★: 5+10+15+20 = 50 ✅ confirmed */
export const TOTAL_LEGENDARY_BP_TO_4STAR = 50;

/** 5★ promotion requires Mythic Blueprints (completely different item) */
export const MYTHIC_BP_FOR_5STAR = 10; // ✅ confirmed

/**
 * 5★ promotion total costs (4★ → 5★) ✅ CONFIRMED
 * These are the costs for the single promotion step to Mythic.
 */
export const STAR_5_PROMOTION_COST = {
  gold:              206_000_000,
  upgradeOre:        137_500,
  dielectricCeramic: 1_650,
  mythicBlueprints:  10,
};

// ============================================================
// LEVEL UPGRADE COSTS — CONFIRMED ANCHOR POINTS
// ============================================================

/**
 * UR gear level upgrade costs.
 * CONFIRMED: L0→L25 = 12,150,000 gold, 80,400 ore ✅
 * All other values are ESTIMATES until per-level table is scraped.
 *
 * Stored as cumulative costs FROM level 0.
 * Per-level costs can be derived by subtraction.
 */
export const UR_CUMULATIVE_GOLD: Record<number, number> = {
  0:  0,
  5:  800_000,
  10: 2_100_000,
  15: 4_200_000,
  20: 7_500_000,
  25: 12_150_000,  // ✅ CONFIRMED
  30: 19_000_000,
  35: 29_000_000,
  40: 44_000_000,
};

export const UR_CUMULATIVE_ORE: Record<number, number> = {
  0:  0,
  5:  5_300,
  10: 13_800,
  15: 27_500,
  20: 50_000,
  25: 80_400,      // ✅ CONFIRMED
  30: 125_000,
  35: 190_000,
  40: 290_000,
};

/**
 * Get cumulative gold cost for UR gear from level 0 to target level.
 * Interpolates between known checkpoints.
 */
export function getURGoldCost(fromLevel: number, toLevel: number): number {
  return interpolateCost(UR_CUMULATIVE_GOLD, fromLevel, toLevel);
}

/**
 * Get cumulative ore cost for UR gear from level 0 to target level.
 * Interpolates between known checkpoints.
 */
export function getUROreCost(fromLevel: number, toLevel: number): number {
  return interpolateCost(UR_CUMULATIVE_ORE, fromLevel, toLevel);
}

/** Linear interpolation between checkpoint levels */
function interpolateCost(
  table: Record<number, number>,
  from: number,
  to: number
): number {
  const levels = Object.keys(table).map(Number).sort((a, b) => a - b);

  function getCumulative(level: number): number {
    if (table[level] !== undefined) return table[level];
    // Find surrounding checkpoints
    const lower = levels.filter(l => l <= level).pop() ?? 0;
    const upper = levels.find(l => l >= level) ?? levels[levels.length - 1];
    if (lower === upper) return table[lower];
    const ratio = (level - lower) / (upper - lower);
    return Math.round(table[lower] + ratio * (table[upper] - table[lower]));
  }

  return Math.max(0, getCumulative(to) - getCumulative(from));
}

// ============================================================
// STAR PROMOTION COSTS — CONFIRMED + PARTIAL
// ============================================================

/**
 * Individual star promotion step costs.
 * 5★ step is fully confirmed. 1★–4★ steps are estimates.
 * ⚠️ The gold/ore/ceramic costs for 1★–4★ are NOT confirmed from this page.
 */
export const STAR_PROMOTION_COSTS: Record<number, {
  gold: number;
  upgradeOre: number;
  dielectricCeramic: number;
  legendaryBlueprints?: number;
  mythicBlueprints?: number;
  confirmed: boolean;
}> = {
  1: { gold: 5_000_000,   upgradeOre: 5_000,  dielectricCeramic: 50,  legendaryBlueprints: 5,  confirmed: false },
  2: { gold: 10_000_000,  upgradeOre: 10_000, dielectricCeramic: 100, legendaryBlueprints: 10, confirmed: false },
  3: { gold: 25_000_000,  upgradeOre: 25_000, dielectricCeramic: 250, legendaryBlueprints: 15, confirmed: false },
  4: { gold: 50_000_000,  upgradeOre: 50_000, dielectricCeramic: 500, legendaryBlueprints: 20, confirmed: false },
  5: { gold: 206_000_000, upgradeOre: 137_500, dielectricCeramic: 1_650, mythicBlueprints: 10,  confirmed: true },
};

// ============================================================
// RESOURCES
// ============================================================

export const GEAR_RESOURCES = {
  levelUpgrade: ['Gold', 'Upgrade Ore'],
  starPromotion: ['Gold', 'Upgrade Ore', 'Dielectric Ceramic', 'Blueprints (Legendary 1–4★ / Mythic 5★)'],
};

export const GEAR_FACTORY_NOTE = 'Level 20 Gear Factory required for star promotions.';

// ============================================================
// STRATEGY NOTES
// ============================================================

export const GEAR_STRATEGY_NOTES = [
  'UR gear is the only tier that can reach 5★ Mythic — always prioritize UR.',
  '50 Legendary Blueprints needed for 0★→4★. Plan carefully before spending.',
  'Mythic Blueprints (for 5★) are rare and different from Legendary Blueprints.',
  'Gear Factory must be level 20 before any star promotions are available.',
  'Dielectric Ceramic is required for every star promotion step.',
];

// ============================================================
// BUDDY SUMMARY
// ============================================================

export function getGearSummary(): string {
  return `
GEAR SYSTEM:
- Tiers: UR (Legendary, max L40), SSR (Epic, max L30), SR (Rare, max L15).
- Level upgrades cost Gold + Upgrade Ore only.
- Star promotions (0★–5★) cost Gold + Upgrade Ore + Dielectric Ceramic + Blueprints.
- Blueprints: Legendary BPs for 1★–4★ (50 total: 5/10/15/20), Mythic BPs for 5★ (10 required).
- 5★ Mythic cost: ~206M gold, ~137.5K ore, 1,650 dielectric ceramic, 10 Mythic Blueprints.
- Requires Level 20 Gear Factory for any star promotion.
- Only UR gear can reach 5★ — always prioritize UR upgrades.
- UR L0→L25 costs ~12.15M gold and ~80.4K ore.
- Blueprint gating: save Legendary BPs for carry gear, save Mythic BPs for absolute best piece.
`.trim();
}

// ============================================================
// VERIFY
// ============================================================

export function verify(): boolean {
  // Check blueprint total
  const totalBP = Object.values(LEGENDARY_BP_PER_STAR).reduce((a, b) => a + b, 0);
  console.log(`0★→4★ Legendary BPs: ${totalBP} | expected: 50 | ${totalBP === 50 ? '✅' : '❌'}`);

  // Check 5★ costs
  const s5 = STAR_PROMOTION_COSTS[5];
  console.log(`5★ gold: ${s5.gold.toLocaleString()} | expected: 206,000,000 | ${s5.gold === 206_000_000 ? '✅' : '❌'}`);
  console.log(`5★ ore: ${s5.upgradeOre.toLocaleString()} | expected: 137,500 | ${s5.upgradeOre === 137_500 ? '✅' : '❌'}`);
  console.log(`5★ ceramic: ${s5.dielectricCeramic.toLocaleString()} | expected: 1,650 | ${s5.dielectricCeramic === 1_650 ? '✅' : '❌'}`);
  console.log(`5★ mythic BPs: ${s5.mythicBlueprints} | expected: 10 | ${s5.mythicBlueprints === 10 ? '✅' : '❌'}`);

  // Check UR L0→L25 gold
  const l0to25gold = getURGoldCost(0, 25);
  console.log(`UR L0→25 gold: ${l0to25gold.toLocaleString()} | expected: 12,150,000 | ${l0to25gold === 12_150_000 ? '✅' : '❌'}`);

  // Check UR L0→L25 ore
  const l0to25ore = getUROreCost(0, 25);
  console.log(`UR L0→25 ore: ${l0to25ore.toLocaleString()} | expected: 80,400 | ${l0to25ore === 80_400 ? '✅' : '❌'}`);

  return totalBP === 50 && s5.gold === 206_000_000 && l0to25gold === 12_150_000 && l0to25ore === 80_400;
}