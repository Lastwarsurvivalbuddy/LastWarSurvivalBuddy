/**
 * Drone upgrade cost data
 * Source: dracgon.tech drone calculator
 * Covers levels 1–300. Costs only apply at milestone levels (every 5 levels up to 150,
 * then every level 151+). Levels not listed = no cost.
 * After level 250: Tactical Weapon research required to progress further.
 *
 * Two resources:
 * - Drone Parts
 * - Battle Data
 *
 * Total (1→300): 273,800 Drone Parts · 442.25M Battle Data
 */

export interface DroneLevelCost {
  level: number;
  droneParts: number;
  battleData: number; // 0 = no Battle Data required at this level
}

export interface DroneSkillUnlock {
  level: number;
  unlock: string;
}

// Per-level costs (milestones only up to 150, then every level 151+)
// battleData stored as raw numbers (K/M expanded)
export const DRONE_LEVEL_COSTS: DroneLevelCost[] = [
  { level: 5, droneParts: 5, battleData: 11250 },
  { level: 10, droneParts: 10, battleData: 15000 },
  { level: 15, droneParts: 20, battleData: 18750 },
  { level: 20, droneParts: 30, battleData: 22500 },
  { level: 25, droneParts: 40, battleData: 26250 },
  { level: 30, droneParts: 50, battleData: 30000 },
  { level: 35, droneParts: 60, battleData: 37500 },
  { level: 40, droneParts: 80, battleData: 37500 },
  { level: 45, droneParts: 100, battleData: 37500 },
  { level: 50, droneParts: 120, battleData: 37500 },
  { level: 55, droneParts: 140, battleData: 45000 },
  { level: 60, droneParts: 160, battleData: 45000 },
  { level: 65, droneParts: 180, battleData: 45000 },
  { level: 70, droneParts: 200, battleData: 45000 },
  { level: 75, droneParts: 250, battleData: 52500 },
  { level: 80, droneParts: 300, battleData: 52500 },
  { level: 85, droneParts: 350, battleData: 52500 },
  { level: 90, droneParts: 400, battleData: 55000 },
  { level: 95, droneParts: 450, battleData: 60000 },
  { level: 100, droneParts: 500, battleData: 60000 },
  { level: 105, droneParts: 600, battleData: 75000 },
  { level: 110, droneParts: 700, battleData: 75000 },
  { level: 115, droneParts: 800, battleData: 180000 },
  { level: 120, droneParts: 1000, battleData: 180000 },
  { level: 125, droneParts: 1500, battleData: 210000 },
  { level: 130, droneParts: 2000, battleData: 210000 },
  { level: 135, droneParts: 3000, battleData: 240000 },
  { level: 140, droneParts: 4000, battleData: 240000 },
  { level: 145, droneParts: 5000, battleData: 300000 },
  // 150–250: costs apply every level
  { level: 150, droneParts: 500, battleData: 900000 },
  { level: 151, droneParts: 500, battleData: 900000 },
  { level: 152, droneParts: 500, battleData: 900000 },
  { level: 153, droneParts: 500, battleData: 900000 },
  { level: 154, droneParts: 500, battleData: 900000 },
  { level: 155, droneParts: 500, battleData: 900000 },
  { level: 156, droneParts: 500, battleData: 900000 },
  { level: 157, droneParts: 500, battleData: 900000 },
  { level: 158, droneParts: 500, battleData: 900000 },
  { level: 159, droneParts: 500, battleData: 900000 },
  { level: 160, droneParts: 500, battleData: 1000000 },
  { level: 161, droneParts: 600, battleData: 1000000 },
  { level: 162, droneParts: 600, battleData: 1000000 },
  { level: 163, droneParts: 600, battleData: 1000000 },
  { level: 164, droneParts: 600, battleData: 1000000 },
  { level: 165, droneParts: 600, battleData: 1000000 },
  { level: 166, droneParts: 600, battleData: 1000000 },
  { level: 167, droneParts: 600, battleData: 1000000 },
  { level: 168, droneParts: 600, battleData: 1000000 },
  { level: 169, droneParts: 600, battleData: 1000000 },
  { level: 170, droneParts: 600, battleData: 1130000 },
  { level: 171, droneParts: 700, battleData: 1130000 },
  { level: 172, droneParts: 700, battleData: 1130000 },
  { level: 173, droneParts: 700, battleData: 1130000 },
  { level: 174, droneParts: 700, battleData: 1130000 },
  { level: 175, droneParts: 700, battleData: 1130000 },
  { level: 176, droneParts: 700, battleData: 1130000 },
  { level: 177, droneParts: 700, battleData: 1130000 },
  { level: 178, droneParts: 700, battleData: 1130000 },
  { level: 179, droneParts: 700, battleData: 1130000 },
  { level: 180, droneParts: 700, battleData: 0 },
  { level: 181, droneParts: 800, battleData: 0 },
  { level: 182, droneParts: 800, battleData: 0 },
  { level: 183, droneParts: 800, battleData: 0 },
  { level: 184, droneParts: 800, battleData: 0 },
  { level: 185, droneParts: 800, battleData: 0 },
  { level: 186, droneParts: 800, battleData: 0 },
  { level: 187, droneParts: 800, battleData: 0 },
  { level: 188, droneParts: 800, battleData: 0 },
  { level: 189, droneParts: 800, battleData: 0 },
  { level: 190, droneParts: 800, battleData: 1620000 },
  { level: 191, droneParts: 900, battleData: 1620000 },
  { level: 192, droneParts: 900, battleData: 1620000 },
  { level: 193, droneParts: 900, battleData: 1620000 },
  { level: 194, droneParts: 900, battleData: 1620000 },
  { level: 195, droneParts: 900, battleData: 1620000 },
  { level: 196, droneParts: 900, battleData: 1620000 },
  { level: 197, droneParts: 900, battleData: 1620000 },
  { level: 198, droneParts: 900, battleData: 1620000 },
  { level: 199, droneParts: 900, battleData: 1620000 },
  { level: 200, droneParts: 900, battleData: 1800000 },
  { level: 201, droneParts: 1000, battleData: 1800000 },
  { level: 202, droneParts: 1000, battleData: 1800000 },
  { level: 203, droneParts: 1000, battleData: 1800000 },
  { level: 204, droneParts: 1000, battleData: 1800000 },
  { level: 205, droneParts: 1000, battleData: 1800000 },
  { level: 206, droneParts: 1000, battleData: 1800000 },
  { level: 207, droneParts: 1000, battleData: 1800000 },
  { level: 208, droneParts: 1000, battleData: 1800000 },
  { level: 209, droneParts: 1000, battleData: 1800000 },
  { level: 210, droneParts: 1000, battleData: 0 },
  { level: 211, droneParts: 1100, battleData: 0 },
  { level: 212, droneParts: 1100, battleData: 0 },
  { level: 213, droneParts: 1100, battleData: 0 },
  { level: 214, droneParts: 1100, battleData: 0 },
  { level: 215, droneParts: 1100, battleData: 0 },
  { level: 216, droneParts: 1100, battleData: 0 },
  { level: 217, droneParts: 1100, battleData: 0 },
  { level: 218, droneParts: 1100, battleData: 0 },
  { level: 219, droneParts: 1100, battleData: 0 },
  { level: 220, droneParts: 1100, battleData: 0 },
  { level: 221, droneParts: 1200, battleData: 0 },
  { level: 222, droneParts: 1200, battleData: 0 },
  { level: 223, droneParts: 1200, battleData: 0 },
  { level: 224, droneParts: 1200, battleData: 0 },
  { level: 225, droneParts: 1200, battleData: 0 },
  { level: 226, droneParts: 1200, battleData: 0 },
  { level: 227, droneParts: 1200, battleData: 0 },
  { level: 228, droneParts: 1200, battleData: 0 },
  { level: 229, droneParts: 1200, battleData: 0 },
  { level: 230, droneParts: 1200, battleData: 0 },
  { level: 231, droneParts: 1300, battleData: 0 },
  { level: 232, droneParts: 1300, battleData: 0 },
  { level: 233, droneParts: 1300, battleData: 0 },
  { level: 234, droneParts: 1300, battleData: 0 },
  { level: 235, droneParts: 1300, battleData: 0 },
  { level: 236, droneParts: 1300, battleData: 0 },
  { level: 237, droneParts: 1300, battleData: 0 },
  { level: 238, droneParts: 1300, battleData: 0 },
  { level: 239, droneParts: 1300, battleData: 0 },
  { level: 240, droneParts: 1300, battleData: 0 },
  { level: 241, droneParts: 1400, battleData: 0 },
  { level: 242, droneParts: 1400, battleData: 0 },
  { level: 243, droneParts: 1400, battleData: 0 },
  { level: 244, droneParts: 1400, battleData: 0 },
  { level: 245, droneParts: 1400, battleData: 0 },
  { level: 246, droneParts: 1400, battleData: 0 },
  { level: 247, droneParts: 1400, battleData: 0 },
  { level: 248, droneParts: 1400, battleData: 0 },
  { level: 249, droneParts: 1400, battleData: 0 },
  { level: 250, droneParts: 1400, battleData: 0 },
  // 251–300: requires Tactical Weapon research to unlock
  { level: 251, droneParts: 2000, battleData: 3800000 },
  { level: 252, droneParts: 2000, battleData: 3800000 },
  { level: 253, droneParts: 2000, battleData: 3800000 },
  { level: 254, droneParts: 2000, battleData: 3800000 },
  { level: 255, droneParts: 2000, battleData: 3800000 },
  { level: 256, droneParts: 2250, battleData: 4500000 },
  { level: 257, droneParts: 2250, battleData: 4500000 },
  { level: 258, droneParts: 2250, battleData: 4500000 },
  { level: 259, droneParts: 2250, battleData: 4500000 },
  { level: 260, droneParts: 2250, battleData: 4500000 },
  { level: 261, droneParts: 2500, battleData: 5250000 },
  { level: 262, droneParts: 2500, battleData: 5250000 },
  { level: 263, droneParts: 2500, battleData: 5250000 },
  { level: 264, droneParts: 2500, battleData: 5250000 },
  { level: 265, droneParts: 2500, battleData: 5250000 },
  { level: 266, droneParts: 2750, battleData: 5600000 },
  { level: 267, droneParts: 2750, battleData: 5600000 },
  { level: 268, droneParts: 2750, battleData: 5600000 },
  { level: 269, droneParts: 2750, battleData: 5600000 },
  { level: 270, droneParts: 2750, battleData: 5600000 },
  { level: 271, droneParts: 3000, battleData: 6900000 },
  { level: 272, droneParts: 3000, battleData: 6900000 },
  { level: 273, droneParts: 3000, battleData: 6900000 },
  { level: 274, droneParts: 3000, battleData: 6900000 },
  { level: 275, droneParts: 3000, battleData: 6900000 },
  { level: 276, droneParts: 3250, battleData: 7800000 },
  { level: 277, droneParts: 3250, battleData: 7800000 },
  { level: 278, droneParts: 3250, battleData: 7800000 },
  { level: 279, droneParts: 3250, battleData: 7800000 },
  { level: 280, droneParts: 3250, battleData: 7800000 },
  { level: 281, droneParts: 3500, battleData: 8750000 },
  { level: 282, droneParts: 3500, battleData: 8750000 },
  { level: 283, droneParts: 3500, battleData: 8750000 },
  { level: 284, droneParts: 3500, battleData: 8750000 },
  { level: 285, droneParts: 3500, battleData: 8750000 },
  { level: 286, droneParts: 3750, battleData: 9750000 },
  { level: 287, droneParts: 3750, battleData: 9750000 },
  { level: 288, droneParts: 3750, battleData: 9750000 },
  { level: 289, droneParts: 3750, battleData: 9750000 },
  { level: 290, droneParts: 3750, battleData: 9750000 },
  { level: 291, droneParts: 4000, battleData: 10800000 },
  { level: 292, droneParts: 4000, battleData: 10800000 },
  { level: 293, droneParts: 4000, battleData: 10800000 },
  { level: 294, droneParts: 4000, battleData: 10800000 },
  { level: 295, droneParts: 4000, battleData: 10800000 },
  { level: 296, droneParts: 4250, battleData: 11900000 },
  { level: 297, droneParts: 4250, battleData: 11900000 },
  { level: 298, droneParts: 4250, battleData: 11900000 },
  { level: 299, droneParts: 4250, battleData: 11900000 },
  { level: 300, droneParts: 4250, battleData: 11900000 },
];

// Skill and skin unlocks by level
export const DRONE_UNLOCKS: DroneSkillUnlock[] = [
  { level: 1, unlock: "TD-1 'Pathfinder' drone skin" },
  { level: 31, unlock: "Drone Skill Level 1" },
  { level: 50, unlock: "TD-2 'Blaster' drone skin" },
  { level: 51, unlock: "Drone Skill Level 2" },
  { level: 71, unlock: "Drone Skill Level 3" },
  { level: 91, unlock: "Drone Skill Level 4" },
  { level: 100, unlock: "TD-3 'Silver Knight' drone skin" },
  { level: 111, unlock: "Drone Skill Level 5" },
  { level: 150, unlock: "TD-4 'Phantom' drone skin" },
  { level: 200, unlock: "TD-5 'Destroyer' drone skin" },
  { level: 250, unlock: "TD-6 'Colossus' drone skin" },
  { level: 251, unlock: "Tactical Weapon research required to progress past level 250" },
];

// Totals (level 1→300)
export const DRONE_TOTALS = {
  droneParts: 273800,
  battleData: 442250000,
};

/**
 * Calculate cost to upgrade drone from fromLevel to toLevel
 */
export function getDroneUpgradeCost(fromLevel: number, toLevel: number): { droneParts: number; battleData: number } {
  let droneParts = 0;
  let battleData = 0;
  for (const entry of DRONE_LEVEL_COSTS) {
    if (entry.level > fromLevel && entry.level <= toLevel) {
      droneParts += entry.droneParts;
      battleData += entry.battleData;
    }
  }
  return { droneParts, battleData };
}

/**
 * Get upcoming drone skill unlocks from current level
 */
export function getNextDroneUnlocks(currentLevel: number, count = 3): DroneSkillUnlock[] {
  return DRONE_UNLOCKS
    .filter(u => u.level > currentLevel)
    .slice(0, count);
}

/**
 * Get a human-readable summary for Buddy system prompt injection
 */
export function getDroneSummary(): string {
  return `## Drone System
The Tactical Drone joins every squad automatically and has its own upgrade track (levels 1–300+).
Two resources required: Drone Parts and Battle Data.
Total cost to max (1→300): 273,800 Drone Parts · 442.25M Battle Data.

Skill unlocks (the important ones for Buddy context):
- Level 31: Drone Skill Level 1 unlocks
- Level 51: Drone Skill Level 2 unlocks  
- Level 71: Drone Skill Level 3 unlocks
- Level 91: Drone Skill Level 4 unlocks
- Level 111: Drone Skill Level 5 unlocks
- Level 250+: Requires Tactical Weapon research to continue

Drone skins unlock at levels 1, 50, 100, 150, 200, 250 — cosmetic only.
Cost structure: every 5 levels up to 150 (milestone costs), then every level from 151+.
After level 250: jump to 2,000+ Drone Parts and 3.8M+ Battle Data per level.`;
}