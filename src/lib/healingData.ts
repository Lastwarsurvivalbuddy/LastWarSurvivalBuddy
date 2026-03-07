/**
 * healingData.ts
 * Healing System Data for Last War: Survival Buddy
 *
 * Source: lastwarhandbook.com/calculators/healing
 * Confirmed: Full hospital capacity table L1-35, full Emergency Center table L1-35,
 *            EC unlock level, fainted ratio cap, rescue cooldown, healing cost ratio,
 *            batch healing mechanics, bonus types
 * PENDING: Per-tier healing costs (food/gold per troop by tier T1-T11)
 *
 * Last updated: March 6, 2026
 */

// ─── Hospital Capacity Table — FULLY CONFIRMED ✅ ─────────────────────────────
// Source: <option> tags in rendered HTML — every value extracted directly.
// Format: level → base capacity per hospital building

export const HOSPITAL_CAPACITY: Record<number, number> = {
  1:  650,
  2:  700,
  3:  750,
  4:  800,
  5:  850,
  6:  900,
  7:  950,
  8:  1000,
  9:  1050,
  10: 1100,
  11: 1150,
  12: 1200,
  13: 1250,
  14: 1300,
  15: 1350,
  16: 1400,
  17: 1450,
  18: 1500,
  19: 1550,
  20: 1600,
  21: 1640,
  22: 1680,
  23: 1720,
  24: 1760,
  25: 1800,
  26: 1840,
  27: 1880,
  28: 1920,
  29: 1960,
  30: 2000,
  31: 2020,
  32: 2040,
  33: 2060,
  34: 2080,
  35: 2100,
};

// ─── Emergency Center Table — FULLY CONFIRMED ✅ ──────────────────────────────
// Source: <option> tags in rendered HTML — every value extracted directly.
// EC unlocks at HQ 22. Fainted ratio caps at 40% from level 20+.
// Capacity follows same progression as Hospital after L20.

export interface EmergencyCenterLevel {
  level: number;
  faintedRatioPct: number;  // % of overflow troops saved (fainted, not lost)
  capacity: number;          // max fainted troops held
}

export const EMERGENCY_CENTER_LEVELS: EmergencyCenterLevel[] = [
  { level: 1,  faintedRatioPct: 21, capacity: 450  },
  { level: 2,  faintedRatioPct: 22, capacity: 500  },
  { level: 3,  faintedRatioPct: 23, capacity: 550  },
  { level: 4,  faintedRatioPct: 24, capacity: 600  },
  { level: 5,  faintedRatioPct: 25, capacity: 650  },
  { level: 6,  faintedRatioPct: 26, capacity: 700  },
  { level: 7,  faintedRatioPct: 27, capacity: 750  },
  { level: 8,  faintedRatioPct: 28, capacity: 800  },
  { level: 9,  faintedRatioPct: 29, capacity: 850  },
  { level: 10, faintedRatioPct: 30, capacity: 900  },
  { level: 11, faintedRatioPct: 31, capacity: 950  },
  { level: 12, faintedRatioPct: 32, capacity: 1000 },
  { level: 13, faintedRatioPct: 33, capacity: 1050 },
  { level: 14, faintedRatioPct: 34, capacity: 1100 },
  { level: 15, faintedRatioPct: 35, capacity: 1150 },
  { level: 16, faintedRatioPct: 36, capacity: 1200 },
  { level: 17, faintedRatioPct: 37, capacity: 1250 },
  { level: 18, faintedRatioPct: 38, capacity: 1300 },
  { level: 19, faintedRatioPct: 39, capacity: 1350 },
  { level: 20, faintedRatioPct: 40, capacity: 1400 }, // ratio caps at 40% here
  { level: 21, faintedRatioPct: 40, capacity: 1460 },
  { level: 22, faintedRatioPct: 40, capacity: 1520 },
  { level: 23, faintedRatioPct: 40, capacity: 1580 },
  { level: 24, faintedRatioPct: 40, capacity: 1640 },
  { level: 25, faintedRatioPct: 40, capacity: 1700 },
  { level: 26, faintedRatioPct: 40, capacity: 1760 },
  { level: 27, faintedRatioPct: 40, capacity: 1820 },
  { level: 28, faintedRatioPct: 40, capacity: 1880 },
  { level: 29, faintedRatioPct: 40, capacity: 1940 },
  { level: 30, faintedRatioPct: 40, capacity: 2000 },
  { level: 31, faintedRatioPct: 40, capacity: 2020 },
  { level: 32, faintedRatioPct: 40, capacity: 2040 },
  { level: 33, faintedRatioPct: 40, capacity: 2060 },
  { level: 34, faintedRatioPct: 40, capacity: 2080 },
  { level: 35, faintedRatioPct: 40, capacity: 2100 },
];

// ─── System Constants — CONFIRMED ✅ ─────────────────────────────────────────

export const HEALING_CONSTANTS = {
  maxHospitals: 4,                    // up to 4 hospital buildings
  hospitalMaxLevel: 35,               // confirmed
  emergencyCenterUnlockHQ: 22,        // confirmed — unlocked at HQ 22
  emergencyCenterMaxLevel: 35,        // confirmed
  emergencyCenterMaxRatioPct: 40,     // ratio caps at L20, stays 40% L20-35 ✅
  rescueCooldownHours: { min: 46, max: 60 }, // confirmed — cannot be reduced with speedups or diamonds
  healingCostRatio: 0.50,             // healing ≈ 50% of training cost ✅
  batchHealAllianceHelp: {
    reductionPerHelp: 'max(1 minute, 0.5%)', // confirmed mechanic
    canAchieveInstant: true,          // confirmed — small batches + alliance help = instant
  },
  bonusTypes: ['tech', 'vip', 'survivor'], // confirmed capacity bonus sources
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns base hospital capacity for a given level.
 */
export function getHospitalCapacity(level: number): number {
  return HOSPITAL_CAPACITY[level] ?? 0;
}

/**
 * Calculates total hospital capacity across up to 4 hospitals with bonuses.
 * @param levels - Array of up to 4 hospital levels (0 = not built)
 * @param techBonusPct - Tech research bonus % (e.g. 20 for 20%)
 * @param vipBonusFlat - Flat VIP bonus capacity
 * @param survivorBonusFlat - Flat survivor assignment bonus
 */
export function calcTotalHospitalCapacity(
  levels: number[],
  techBonusPct = 0,
  vipBonusFlat = 0,
  survivorBonusFlat = 0
): number {
  const baseTotal = levels
    .slice(0, 4)
    .reduce((sum, lvl) => sum + (lvl > 0 ? getHospitalCapacity(lvl) : 0), 0);
  const withTech = Math.floor(baseTotal * (1 + techBonusPct / 100));
  return withTech + vipBonusFlat + survivorBonusFlat;
}

/**
 * Returns Emergency Center data for a given level.
 */
export function getEmergencyCenterLevel(level: number): EmergencyCenterLevel | null {
  return EMERGENCY_CENTER_LEVELS.find((ec) => ec.level === level) ?? null;
}

/**
 * Simulates battle casualties and returns triage outcome.
 * Matches the calculator's logic shown in rendered HTML.
 */
export function simulateCasualties(
  totalWounded: number,
  hospitalCapacity: number,
  ecLevel: number
): {
  healedInHospital: number;
  savedInEC: number;
  permanentlyLost: number;
  totalSaved: number;
  hospitalPct: number;
  ecPct: number;
  lostPct: number;
} {
  const ec = getEmergencyCenterLevel(ecLevel);
  const ecCapacity = ec?.capacity ?? 0;

  const healedInHospital = Math.min(totalWounded, hospitalCapacity);
  const overflow = totalWounded - healedInHospital;
  const savedInEC = Math.min(overflow, ecCapacity);
  const permanentlyLost = overflow - savedInEC;
  const totalSaved = healedInHospital + savedInEC;

  return {
    healedInHospital,
    savedInEC,
    permanentlyLost,
    totalSaved,
    hospitalPct: (healedInHospital / totalWounded) * 100,
    ecPct: (savedInEC / totalWounded) * 100,
    lostPct: (permanentlyLost / totalWounded) * 100,
  };
}

/**
 * Returns true if player should upgrade Emergency Center before next PvP event.
 * Threshold: EC below L10 = low fainted ratio, meaningful upgrade available.
 */
export function shouldPrioritizeECUpgrade(ecLevel: number): boolean {
  return ecLevel < 10;
}

// ─── Buddy System Prompt Summary ─────────────────────────────────────────────

export function getHealingSummary(): string {
  return `
## Healing System

**Hospital:** Up to 4 buildings, max level 35. Capacity per building: 650 (L1) → 2,100 (L35).
4× L35 hospitals = 8,400 base capacity (before tech/VIP/survivor bonuses).
Tech research, VIP, and survivor assignments add to base capacity.

**Emergency Center:** Unlocks at HQ 22, max level 35.
Saves a % of overflow troops that would otherwise be permanently lost.
- Fainted ratio: 21% (L1) → 40% (L20+). Caps at 40% from L20 onward.
- Capacity: 450 (L1) → 2,100 (L35).
- Rescue cooldown: 46–60 hours. Cannot be reduced with speedups or diamonds.

**Healing cost:** ~50% of training cost. Higher tier troops (T8–T11) cost more but are more valuable to save.

**Batch healing:** Alliance help reduces heal time by 1 minute or 0.5% per help (whichever is greater). Small batches + immediate alliance help = near-instant healing.

**Pre-battle priority:** Before Warzone Duel, Alliance Duel, or Capitol War — check that hospital + EC capacity exceeds expected casualties. Permanently lost troops cannot be recovered.

**Key advice:**
- Troops that exceed hospital + EC capacity are PERMANENTLY LOST
- Upgrade EC to L20 for max 40% fainted ratio — critical for fighters
- 4× L25 hospitals = 7,200 base (a common mid-game benchmark)
- Healing costs ~50% of train costs — factor this into resource planning before big PvP
`.trim();
}