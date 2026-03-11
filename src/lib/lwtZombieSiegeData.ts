// lwtZombieSiegeData.ts
// Source: lastwartutorial.com/zombie-siege/
// Zombie Siege event: prep, eligibility, rules, waves, rewards

export const ZOMBIE_SIEGE_OVERVIEW = `
ZOMBIE SIEGE — OVERVIEW:
- Alliance event available on all servers (normal game, Season 1, and Season 2)
- R4/R5 initiates the event by gathering Clue Points and searching for a Doom Legion stronghold
- Zombie waves attack alliance member bases — you survive as many waves as possible
- 20 total waves per event
- NO shields protect you — zombies bypass shields. Must have WALL DEFENSES SET.
- More waves survived = better rewards (individual and alliance)
- Available at multiple difficulty levels — higher level = tougher enemies + better rewards
`;

export const ZOMBIE_SIEGE_PREPARATION = `
ZOMBIE SIEGE — PREPARATION:

Step 1 — Collect Clue Points (all members contribute):
| Radar Task | Clue Points |
|------------|-------------|
| Kill Doom Legion enemy | +300 |
| Kill Doom Elite | +300 |
| Kill Doom Walker | +300 |
| Kill Zombie | +10 |
| Assist Allies | +10 |
| Geological Sampling | +10 |
| Resource Gathering | +10 |
| Digging Tasks | +10 |

Step 2 — R4/R5 searches for Doom Legion base once enough clue points are gathered
Step 3 — R4/R5 selects difficulty level and starts the event

⚠️ CRITICAL: Before starting, R4/R5 must send alliance announcement telling ALL members to ENABLE WALL DEFENSES.
Shields do NOT work against zombie attacks.
`;

export const ZOMBIE_SIEGE_ELIGIBILITY = `
ZOMBIE SIEGE — ELIGIBILITY:
To be attacked by zombie waves (and earn rewards), you must:
- Have been in the alliance for MORE than 48 hours
- Have been offline for LESS than 72 hours
- Meet the minimum HQ level for the selected difficulty
- NOT be in a cross-server state (do not teleport once event starts — you get kicked)

If not eligible: zombie waves simply skip your base. You won't be attacked and won't earn rewards.
Only members in the alliance for 48+ hours can claim Alliance Rewards.
`;

export const ZOMBIE_SIEGE_WAVES = `
ZOMBIE SIEGE — WAVE MECHANICS:
- 20 total waves attack alliance member bases
- Once your base is BREACHED (zombies break through), you receive NO more attacks
- Surviving more waves = more individual rewards
- Stronger players can REINFORCE weaker players' bases to help them survive longer

Wave power at Level 1:
- Wave 1: ~782K power (single zombie)
- Wave 20: ~4.5M power (multiple zombies attacking at once)
- Mid-waves: attack in groups of 2 or 3 zombies simultaneously

Strategy:
- At Level 1, most players can survive all 20 waves if defenses are set in time
- Alert your alliance BEFORE the event starts — late defense setup = early breach
- Higher level events: coordinate with stronger alliance members to reinforce weak bases
`;

export const ZOMBIE_SIEGE_REWARDS = `
ZOMBIE SIEGE — REWARDS:
- Rewards sent via mail at end of event
- Individual Rewards: based on how many waves YOUR base survived
- Alliance Rewards: based on total waves the whole alliance survived combined
- Both reward tiers scale with difficulty level — higher difficulty = better loot
- Wrenches are a key reward — important for Developer playstyle builds
- Alliance Rewards only available to members who have been in the alliance 48+ hours
`;

export function getZombieSiegeDataSummary(): string {
  return `
=== ZOMBIE SIEGE ===
${ZOMBIE_SIEGE_OVERVIEW}

${ZOMBIE_SIEGE_PREPARATION}

${ZOMBIE_SIEGE_ELIGIBILITY}

${ZOMBIE_SIEGE_WAVES}

${ZOMBIE_SIEGE_REWARDS}
`;
}