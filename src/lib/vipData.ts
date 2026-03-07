/**
 * vipData.ts
 * Last War: Survival — VIP Level Data
 *
 * Source: lastwarhandbook.com/calculators/vip-points (verified March 6, 2026)
 *
 * Confirmed facts:
 *   - 18 VIP levels (VIP 0 through VIP 18)
 *   - VIP 18 requires 50,000,000 total VIP points
 *   - 200 free VIP points per day (daily VIP chest)
 *   - 1 diamond = 1 VIP point
 *   - Max 2,500 diamonds converted at once
 *   - VIP 0→8 = 50,000 points = 250 days F2P = ~8 months 10 days ✅ verified
 *
 * NOTE: Per-level point thresholds and full per-level benefit lists are
 * rendered client-side (collapsed table) — not available in static HTML.
 * The LEVEL_THRESHOLDS below are derived from the confirmed VIP 0→8 = 50,000
 * data point and community-standard progression. Verify against full table
 * when available.
 */

/**
 * Cumulative VIP points required to REACH each VIP level from VIP 0.
 * Index = VIP level. So index 8 = total points needed to reach VIP 8.
 *
 * Confirmed anchors:
 *   - VIP 8 cumulative = 50,000 ✅ (verified from calculator)
 *   - VIP 18 cumulative = 50,000,000 ✅ (verified from FAQ)
 *
 * Intermediate values derived from standard geometric progression.
 * ⚠️ Levels 1–7 and 9–17 are ESTIMATES until full table is confirmed.
 */
export const VIP_CUMULATIVE_POINTS: Record<number, number> = {
  0:  0,
  1:  100,
  2:  500,
  3:  1_500,       // Confirmed milestone: +10% construction speed
  4:  3_500,
  5:  7_000,
  6:  15_000,
  7:  30_000,
  8:  50_000,      // ✅ CONFIRMED — Agent Shirley unlock
  9:  100_000,
  10: 200_000,
  11: 400_000,     // Confirmed milestone: +50% construction speed
  12: 750_000,
  13: 1_300_000,
  14: 2_200_000,
  15: 3_800_000,   // Confirmed milestone: 5th march slot + +20% healing
  16: 7_000_000,
  17: 15_000_000,
  18: 50_000_000,  // ✅ CONFIRMED — VIP max
};

/**
 * Key benefits at each VIP milestone level.
 * Only confirmed milestones are marked ✅. Others are partial.
 */
export const VIP_BENEFITS: Record<number, { label: string; benefits: string[]; confirmed: boolean }> = {
  0:  { label: 'VIP 0', benefits: ['No VIP benefits'], confirmed: true },
  1:  { label: 'VIP 1', benefits: ['Basic VIP benefits'], confirmed: false },
  2:  { label: 'VIP 2', benefits: ['Enhanced daily rewards'], confirmed: false },
  3:  { label: 'VIP 3', benefits: ['+10% construction speed'], confirmed: true },
  4:  { label: 'VIP 4', benefits: ['Additional VIP perks'], confirmed: false },
  5:  { label: 'VIP 5', benefits: ['Additional VIP perks'], confirmed: false },
  6:  { label: 'VIP 6', benefits: ['Additional VIP perks'], confirmed: false },
  7:  { label: 'VIP 7', benefits: ['Additional VIP perks'], confirmed: false },
  8:  {
    label: 'VIP 8',
    benefits: [
      '+20% resource production',
      '+10% march speed',
      '+15% construction speed',
      '+15% research speed',
      'Unlocks Agent Shirley survivor',
    ],
    confirmed: true,
  },
  9:  { label: 'VIP 9',  benefits: ['Additional VIP perks'], confirmed: false },
  10: { label: 'VIP 10', benefits: ['Additional VIP perks'], confirmed: false },
  11: { label: 'VIP 11', benefits: ['+50% construction speed'], confirmed: true },
  12: { label: 'VIP 12', benefits: ['Mid-tier VIP benefits'], confirmed: false },
  13: { label: 'VIP 13', benefits: ['Additional VIP perks'], confirmed: false },
  14: { label: 'VIP 14', benefits: ['Additional VIP perks'], confirmed: false },
  15: {
    label: 'VIP 15',
    benefits: [
      '5th march slot unlocked',
      '+20% healing boost',
    ],
    confirmed: true,
  },
  16: { label: 'VIP 16', benefits: ['Additional VIP perks'], confirmed: false },
  17: { label: 'VIP 17', benefits: ['Additional VIP perks'], confirmed: false },
  18: {
    label: 'VIP 18',
    benefits: [
      '+12.5% Hero HP',
      '+12.5% Hero Attack',
      '+12.5% Hero Defense',
      'Exclusive custom base skin',
      'Maximum VIP privileges',
    ],
    confirmed: true,
  },
};

/** F2P daily VIP points from daily chest */
export const FREE_DAILY_VIP_POINTS = 200;

/** 1 diamond = 1 VIP point */
export const DIAMONDS_PER_VIP_POINT = 1;

/** Max diamonds convertible at once */
export const MAX_DIAMOND_CONVERSION = 2_500;

/** VIP status must be activated separately from having the level */
export const VIP_STATUS_NOTE = 'VIP status must be activated separately. Level determines available benefits, activation is required to use them.';

/**
 * Calculate VIP points needed to go from currentLevel to targetLevel.
 */
export function calcVIPPointsNeeded(currentLevel: number, targetLevel: number): number {
  if (currentLevel >= targetLevel) return 0;
  const current = VIP_CUMULATIVE_POINTS[currentLevel] ?? 0;
  const target = VIP_CUMULATIVE_POINTS[targetLevel] ?? 0;
  return target - current;
}

/**
 * Calculate diamonds needed (1:1 with VIP points).
 */
export function calcDiamondsNeeded(currentLevel: number, targetLevel: number): number {
  return calcVIPPointsNeeded(currentLevel, targetLevel) * DIAMONDS_PER_VIP_POINT;
}

/**
 * Calculate F2P days to reach target level from current level.
 */
export function calcF2PDays(currentLevel: number, targetLevel: number, currentPoints = 0): number {
  const needed = calcVIPPointsNeeded(currentLevel, targetLevel) - currentPoints;
  if (needed <= 0) return 0;
  return Math.ceil(needed / FREE_DAILY_VIP_POINTS);
}

/**
 * Format days into human-readable string.
 */
export function formatDays(days: number): string {
  if (days <= 0) return 'Already there';
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (remainingDays > 0 && years === 0) parts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);
  return parts.join(', ');
}

/**
 * Key priority milestones — confirmed, worth spending toward.
 */
export const VIP_PRIORITY_MILESTONES = [
  { level: 3,  reason: '+10% construction speed — cheap, early win' },
  { level: 8,  reason: 'Agent Shirley unlock + resource/march/construction/research buffs — major milestone' },
  { level: 11, reason: '+50% construction speed — significant mid-game upgrade' },
  { level: 15, reason: '5th march slot + healing boost — game-changing for active players' },
  { level: 18, reason: 'Hero stat boosts + base skin — whale territory only' },
];

/**
 * Compact string for Buddy AI system prompt injection.
 */
export function getVIPSummary(): string {
  return `
VIP SYSTEM:
- 18 VIP levels (VIP 0–18). VIP status must be activated separately from leveling.
- 1 diamond = 1 VIP point. Max 2,500 diamonds converted at once.
- Free income: 200 VIP points/day from daily chest.
- VIP 18 requires 50,000,000 total points (~684 years F2P — effectively spend-only).
- VIP 0→8: 50,000 points = 250 days F2P (~8 months).
- Key milestones: VIP 3 (+10% construction), VIP 8 (Agent Shirley + buffs), VIP 11 (+50% construction), VIP 15 (5th march slot + healing), VIP 18 (hero stat boosts + skin).
- Strategy: VIP 8 is the most important F2P-reachable milestone. VIP 15 is the best spend target for active PVP players.
`.trim();
}

/**
 * Self-verification against confirmed data points.
 */
export function verify(): boolean {
  const vip0to8 = calcVIPPointsNeeded(0, 8);
  const vip18total = VIP_CUMULATIVE_POINTS[18];
  const f2pDays = calcF2PDays(0, 8);

  console.log(`VIP 0→8 points: ${vip0to8} | expected: 50,000 | ${vip0to8 === 50_000 ? '✅' : '❌'}`);
  console.log(`VIP 18 total:   ${vip18total.toLocaleString()} | expected: 50,000,000 | ${vip18total === 50_000_000 ? '✅' : '❌'}`);
  console.log(`F2P days 0→8:   ${f2pDays} | expected: 250 | ${f2pDays === 250 ? '✅' : '❌'}`);
  console.log(`F2P time 0→8:   ${formatDays(f2pDays)}`);

  return vip0to8 === 50_000 && vip18total === 50_000_000 && f2pDays === 250;
}