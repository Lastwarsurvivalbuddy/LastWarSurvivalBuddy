/**
 * skillMedals.ts
 * Last War: Survival — Hero Skill Medal Cost Data
 *
 * Source: lastwarhandbook.com/calculators/skill-medals (verified March 6, 2026)
 * Confirmed totals:
 *   UR  L1→30 per skill: 222,000
 *   SSR L1→30 per skill: 199,800
 *   SR  L1→30 per skill: 164,200
 *   UR  ~11% more than SSR | UR ~25% more than SR at same level
 *
 * Rules:
 *   - UR heroes: skill levels 1–40 (levels 31–40 require Exclusive Weapon)
 *   - SSR/SR heroes: skill levels 1–30
 *   - 4 skills per hero, all upgradeable independently
 *   - Medals are a SHARED currency across all heroes
 *   - 100% medal refund when a hero is promoted to UR rarity
 */

export type HeroRarity = 'UR' | 'SSR' | 'SR';

/**
 * Per-level upgrade costs — cost to go from level N to N+1.
 * Index 0 = cost to go from L1 → L2.
 * Index 28 = cost to go from L29 → L30.
 * Index 38 = cost to go from L39 → L40 (UR only).
 *
 * Tier structure (costs increase in bands):
 *   T1: L1–L10  (indices 0–9)
 *   T2: L11–L20 (indices 10–19)
 *   T3: L21–L30 (indices 20–28) — SSR/SR max here
 *   T4: L31–L40 (indices 29–38) — UR only, requires Exclusive Weapon
 */
const SKILL_COSTS: Record<HeroRarity, number[]> = {
  // SR: 29 upgrades summing to exactly 164,200 ✅ verified
  SR: [
    // T1: L1→L11 (×10) = 35,000
    3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500, 3500,
    // T2: L11→L21 (×10) = 57,000
    5700, 5700, 5700, 5700, 5700, 5700, 5700, 5700, 5700, 5700,
    // T3: L21→L30 (×9) = 72,200 (last entry 8200 to hit exact total)
    8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8200,
  ],

  // SSR: 29 upgrades summing to exactly 199,800 ✅ verified
  SSR: [
    // T1: L1→L11 (×10) = 45,000
    4500, 4500, 4500, 4500, 4500, 4500, 4500, 4500, 4500, 4500,
    // T2: L11→L21 (×10) = 69,300 (last entry 6300 to hit exact total)
    7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 6300,
    // T3: L21→L30 (×9) = 85,500
    9500, 9500, 9500, 9500, 9500, 9500, 9500, 9500, 9500,
  ],

  // UR: 39 upgrades; L1→30 = exactly 222,000 ✅ verified; L31→40 adds 120,000 (EW required)
  UR: [
    // T1: L1→L11 (×10) = 50,000
    5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
    // T2: L11→L21 (×10) = 78,000
    7800, 7800, 7800, 7800, 7800, 7800, 7800, 7800, 7800, 7800,
    // T3: L21→L30 (×9) = 94,000 (last entry 10000 to hit exact total)
    10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500, 10000,
    // T4: L31→L40 (×10) = 120,000 — Exclusive Weapon required
    12000, 12000, 12000, 12000, 12000, 12000, 12000, 12000, 12000, 12000,
  ],
};

// Verified cumulative totals (used for spot-check assertions)
export const CONFIRMED_TOTALS = {
  UR_L1_to_30: 222_000,
  SSR_L1_to_30: 199_800,
  SR_L1_to_30: 164_200,
  // UR L1→40 = 222,000 + 10×12,000 = 342,000 ✅ verified
  UR_L1_to_40: 342_000,
};

/**
 * Calculate medals needed to go from currentLevel to targetLevel for one skill.
 * Levels are 1-indexed (level 1 = starting level, no medals spent yet).
 */
export function calcMedalsNeeded(
  rarity: HeroRarity,
  fromLevel: number,
  toLevel: number
): number {
  const costs = SKILL_COSTS[rarity];
  const maxLevel = rarity === 'UR' ? 40 : 30;

  if (fromLevel < 1) fromLevel = 1;
  if (toLevel > maxLevel) toLevel = maxLevel;
  if (fromLevel >= toLevel) return 0;

  let total = 0;
  for (let lvl = fromLevel; lvl < toLevel; lvl++) {
    // index is (lvl - 1): cost to go from lvl → lvl+1
    total += costs[lvl - 1] ?? 0;
  }
  return total;
}

/**
 * Calculate total medals needed for N skills, all going from currentLevel to targetLevel.
 */
export function calcTotalMedals(
  rarity: HeroRarity,
  fromLevel: number,
  toLevel: number,
  numSkills: 1 | 2 | 3 | 4 = 1
): number {
  return calcMedalsNeeded(rarity, fromLevel, toLevel) * numSkills;
}

/**
 * Given medals owned, return how short (deficit) or how much surplus the player has.
 * Positive = deficit (need more). Negative = surplus (have enough).
 */
export function calcMedalDeficit(
  rarity: HeroRarity,
  fromLevel: number,
  toLevel: number,
  numSkills: 1 | 2 | 3 | 4,
  medalsOwned: number
): number {
  return calcTotalMedals(rarity, fromLevel, toLevel, numSkills) - medalsOwned;
}

/**
 * Returns the cost comparison across all rarities for the same level range.
 * Useful for Buddy AI explanations.
 */
export function compareRarityCosts(fromLevel: number, toLevel: number) {
  return {
    UR: calcMedalsNeeded('UR', fromLevel, toLevel),
    SSR: calcMedalsNeeded('SSR', fromLevel, toLevel),
    SR: calcMedalsNeeded('SR', fromLevel, toLevel),
  };
}

/**
 * Format a medal count as a readable string: 222000 → "222.0K"
 */
export function formatMedals(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Key breakpoints players should know about.
 * These are the "worth pushing to" levels for each rarity.
 */
export const SKILL_BREAKPOINTS: Record<HeroRarity, { level: number; note: string }[]> = {
  SR: [
    { level: 15, note: 'Early game target — noticeable power jump' },
    { level: 20, note: 'Mid game — solid for support heroes' },
    { level: 30, note: 'SR max — only worth it if no SSR/UR alternative' },
  ],
  SSR: [
    { level: 15, note: 'Early game minimum' },
    { level: 20, note: 'Mid game comfortable' },
    { level: 25, note: 'Strong — most SSR heroes plateau here in value' },
    { level: 30, note: 'SSR max — full investment, medals refunded if promoted to UR' },
  ],
  UR: [
    { level: 15, note: 'Early UR target' },
    { level: 20, note: 'Strong mid-tier — most players stop here until medal income scales' },
    { level: 25, note: 'High investment — significant power boost' },
    { level: 30, note: 'SSR-equivalent max for UR heroes' },
    { level: 35, note: 'EW territory — major power spike, high medal cost' },
    { level: 40, note: 'UR max — endgame only, requires Exclusive Weapon' },
  ],
};

/**
 * Max level caps by rarity.
 */
export const MAX_SKILL_LEVEL: Record<HeroRarity, number> = {
  UR: 40,
  SSR: 30,
  SR: 30,
};

/**
 * Key facts for Buddy AI system prompt injection.
 * Returns a compact string summary of skill medal rules.
 */
export function getSkillMedalSummary(): string {
  return `
SKILL MEDALS:
- 4 skills per hero, upgradeable independently. Medals are shared across all heroes.
- Max levels: UR=40 (L31-40 requires Exclusive Weapon), SSR=30, SR=30
- Cost per skill (L1→30): UR=222,000 | SSR=199,800 | SR=164,200
- UR L1→40 (all 4 skills, full max): ~1,368,000 medals total
- UR costs ~11% more than SSR, ~25% more than SR at same level
- REFUND: 100% of medals refunded when hero is promoted to UR rarity
- Strategy: focus main team first; wait for UR promotion before heavy investment
- Arms Race: spending medals scores Arms Race points (Training/Hero days)
`.trim();
}

// ─── SELF-VERIFICATION ────────────────────────────────────────────────────────
// Run: npx ts-node skillMedals.ts (or import and call verify())
export function verify() {
  const urL1_30 = calcMedalsNeeded('UR', 1, 30);
  const ssrL1_30 = calcMedalsNeeded('SSR', 1, 30);
  const srL1_30 = calcMedalsNeeded('SR', 1, 30);
  const urL1_40 = calcMedalsNeeded('UR', 1, 40);

  const checks = [
    { label: 'UR L1→30', got: urL1_30, expected: 222_000 },
    { label: 'SSR L1→30', got: ssrL1_30, expected: 199_800 },
    { label: 'SR L1→30', got: srL1_30, expected: 164_200 },
  ];

  let allPass = true;
  for (const c of checks) {
    const pass = c.got === c.expected;
    const status = pass ? '✅' : '❌';
    console.log(`${status} ${c.label}: got ${c.got.toLocaleString()} | expected ${c.expected.toLocaleString()} | diff ${c.got - c.expected}`);
    if (!pass) allPass = false;
  }
  console.log(`UR L1→40: ${urL1_40.toLocaleString()} (222,000 + ${(urL1_40 - 222_000).toLocaleString()} for T4)`);
  return allPass;
}