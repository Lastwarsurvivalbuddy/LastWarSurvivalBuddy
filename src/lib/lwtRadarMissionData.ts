// lwtRadarMissionData.ts
// Source: lastwartutorial.com/radar-missions/
// Radar level system, stacking strategy, mission types, event points

export const RADAR_LEVEL_SYSTEM = `
RADAR MISSION LEVEL SYSTEM:
- Radar has a level that controls everything about missions
- Leveling up: complete 1,000 missions at your current radar level → advance to next level
  - Example: 846/1000 level 8 missions done → 154 more to reach level 9

Radar level determines:
- How many missions are added every 6 hours (level 8 = 10 missions per refresh)
- Maximum missions that can be stored/archived (level 8 = 35 max)
- Maximum missions visible on map at once

Reading the radar counter:
- "3/35" = 3 archived (stored) missions out of 35 max storage
- Missions visible on the MAP are NOT counted in this number
- "02:14:01" = countdown to next refresh (10 missions added in 2h 14m)
- Countdown restarts from 6 hours each time missions are added
- ⚠️ If storage hits MAX (35/35): countdown HALTS and excess missions are discarded
`;

export const RADAR_STACKING_STRATEGY = `
RADAR MISSION STACKING — HOW TO DO IT:

Why stack:
1. Use free stamina efficiently — stamina replenishes twice daily (2 packs of 50 stamina each)
2. Save missions for Arms Race Drone Boost phase — stamina spent = points
3. Collect completed missions on Duel VS Days 1, 3, and 5 for maximum points

Mission states:
- Available (no red dot): needs action taken before countdown expires or it disappears
- Completed (red dot): action done, reward waiting. Clicking collects reward + removes from map.

How to stack:
1. Complete all missions visible on map (do the action) but DO NOT collect them — leave red dots on map
2. As missions pile up completed on map, your archived counter climbs toward max
3. Target: keep archived storage at MAX - 1 (e.g. 34/35) so countdown keeps running
4. If you hit 35/35: countdown halts and next refresh discards missions — don't let this happen

Managing the cap during a wait period:
- Example: waiting for server reset to enter Duel VS Day 3, you have 34/35, countdown says 00:20:00, reset in 1 hour
- The countdown hits 0 BEFORE server reset → collect 10 missions to drop to 24/35
- Countdown restarts → adds 10 more → back to 34/35 before server reset
- This preserves your stack without losing missions to overflow

Key rule: Always leave at least 1 space before next refresh time hits.
`;

export const RADAR_MISSION_TYPES = `
RADAR MISSION TYPES:

| Type | Action Required | Stamina Cost |
|------|----------------|--------------|
| Survivor | Click to recruit to base | None |
| Fighting Rebels | Attack rebel base until destroyed | Yes (per attack) |
| Elite Kill | Kill elite monster | 20 stamina |
| Resources Pickup | Click to collect | None |
| Mining Task | Send troops to collect | None |
| Assist Ally | Send aid | 10 stamina |
| Dig Up Treasure | Send troops to dig | None |
| Monica's Plan | Fight enemies for prizes | None |
| Doom Walker | Kill a doom walker (any level counts — even joining someone else's rally works) | 20 stamina if you START rally; none if you JOIN |
| Drone Parts | Like dig up treasure but drone-specific rewards | None |
| Overlord Radar Missions | Special gorilla missions (3/day, 42 total) | Varies |

Some missions spawn already completed (red dot) — just collect them, no action needed.
`;

export const RADAR_EVENT_POINTS = `
RADAR MISSIONS AND EVENTS:

Arms Race — Drone Boost phase:
- Many radar missions consume stamina
- Complete missions (do the action) DURING Drone Boost to earn points per stamina spent
- Do NOT collect them yet — just complete and leave for stacking

Duel VS — Days 1, 3, and 5:
- Collecting completed (red dot) missions earns Duel VS points on these days ONLY
- Days 2 and 4: no radar mission points
- Strategy: stack completed missions on Days 2 and 4 → collect all on Days 1, 3, and 5

Combined strategy:
- Complete missions during Arms Race Drone Boost (stamina → AR points)
- Leave them stacked
- Collect on Duel VS Days 1, 3, 5 (collection → Duel VS points)
- This double-dips: same missions earn both AR AND Duel VS points
`;

export function getRadarMissionDataSummary(): string {
  return `
=== RADAR MISSIONS ===
${RADAR_LEVEL_SYSTEM}

${RADAR_STACKING_STRATEGY}

${RADAR_MISSION_TYPES}

${RADAR_EVENT_POINTS}
`;
}