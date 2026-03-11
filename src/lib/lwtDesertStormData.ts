// lwtDesertStormData.ts
// Source: lastwartutorial.com/desert-storm/
// Desert Storm Battlefield event: overview, buildings, points, phases, strategy

export const DESERT_STORM_OVERVIEW = `
DESERT STORM BATTLEFIELD — OVERVIEW:
- Weekly alliance vs alliance war event on a dedicated battlefield
- Your alliance fights a matched opponent alliance (similar battle power)
- NO troop loss — soldiers used in this battle are not permanently lost
- Up to 60 participants total: 20 starters + 10 substitutes per Task Force (A and B)
- Rewards: Honor Points, speedups, resources, decoration chests, dielectric ceramic
- Matchmaking note: uses HISTORICAL alliance power — dropping decorations or power does nothing to get easier opponents

SCHEDULE:
- Monday–Wednesday: Registration phase (sign up, submit request to fight)
- Thursday: Competitor selection (6 hours, automatic)
- Friday: Battle day (30 minutes + 5 min prep)
- Rewards distributed after battle

ELIGIBILITY:
- Top 32 alliances by warzone power ranking only
- Alliance must be established 7+ days
- Player base must be HQ level 15+
- Base must NOT be on Contaminated Land near Capitol
- Base must NOT be on a different warzone (don't teleport once event starts)
- Players who join an alliance cannot participate in Desert Storm for 24 hours after joining
`;

export const DESERT_STORM_BUILDINGS = `
DESERT STORM — BUILDINGS CHEAT SHEET:

| Building | Battlefield Pts/s | Individual Pts/s | Available | Special Boost |
|----------|------------------|-----------------|-----------|---------------|
| Nuclear Silo | +80/s (48 non-plund + 32 plund after 60s) | +40/s | Stage 2 (10 min) | None |
| Oil Refinery (×2) | +50/s (30 + 20 after 60s) | +25/s | Immediately | None |
| Field Hospital (×4) | +30/s (18 + 12 after 60s) | +15/s | Immediately | Heals 15 units/10s per hospital held |
| Info Center | +10/s (6 + 4 after 60s) | +5/s | Immediately | +10% Battlefield Points from ALL your buildings |
| Science Hub | +10/s (6 + 4 after 60s) | +5/s | Immediately | Teleport cooldown 2min → 1min |
| Arsenal | +10/s (6 + 4 after 60s) | +5/s | Stage 2 (10 min) | Hero ATK/DEF/HP +15% |
| Mercenary Factory | +10/s (6 + 4 after 60s) | +5/s | Stage 2 (10 min) | Enemy Hero ATK/DEF/HP -15% |
| Oil Wells | +5/s (3 + 2 after 60s) | +2/s | Stage 3 (13 min) | Gather points like resource fields |

PLUNDERABLE POINTS SYSTEM:
- First 60 seconds holding a building: 100% non-plunderable points
- After 60 seconds: 60% non-plunderable + 40% plunderable (accumulates on building, shown as number on flag)
- If enemy captures your building: all accumulated plunderable points scatter as Point Supply Boxes
- Those boxes are collected by sending recon airplane via "Loot" button — go directly to your score as non-plunderable
- If building changes hands before 60 seconds: no Point Supply Boxes scattered (no plunderable points yet)

MAP COLORS:
- Blue markers = your alliance buildings
- Red markers = enemy buildings
- Yellow markers = neutral/uncaptured buildings
- Grey markers = locked (not yet available this stage)
- Small yellow dots = Point Supply Boxes
`;

export const DESERT_STORM_STRATEGY = `
DESERT STORM — BATTLE STRATEGY:

Stage 1 (0–10 min): Capture immediately available buildings
Priority order:
1. Info Center — +10% points from ALL your buildings. Game-changer from minute 1.
2. Oil Refineries (×2) — highest point yield available in Stage 1
3. Field Hospitals (×4) — healing lets your troops fight longer through all 30 minutes
4. Science Hub — nice to have (teleport cooldown halved) but lower priority

Stage 2 (10 min): New buildings unlock
Priority order:
1. Nuclear Silo — highest point yield in the game, crucial to winning
2. Arsenal + Mercenary Factory — good boosts but don't sacrifice Nuclear Silo troops to capture them

Stage 3 (13 min): Oil Wells appear
- Use as last resort for Individual Points if you're low on troops
- Very low point yield vs other structures

Key rules:
- Collect Field Hospital healed troops from the house+cross icon (bottom left) — they don't auto-collect
- Use teleport aggressively to reposition across the battlefield
- Killing enemy troops = Individual Points — attack and defend buildings actively
- Individual rewards require minimum 10,000 Individual Points — don't AFK
`;

export const DESERT_STORM_PHASES = `
DESERT STORM — REGISTRATION AND PHASES:

Registration (Mon–Wed):
- R4/R5 sign up Task Force A and/or Task Force B and set battle time
- All players (R1–R5) submit "Request to Fight" for desired time slots
- R4/R5 manually accept requests and assign as starting participant or substitute
- If not accepted as starter or substitute = cannot participate at all (even R4/R5 cannot override this after phase ends)
- Max: 20 starting participants + 10 substitutes per Task Force

Task Force tips:
- Task Force A and B are managed separately with potentially different battle times
- Small/elite alliances: forfeit Task Force B and focus on Task Force A for better rewards
- Forfeiting Task Force B has a 1-hour cooldown before you can forfeit again

During battle:
- Starting participants enter during 5-min Preparation Stage
- Substitutes can only enter AFTER battle starts if a slot is open (max 20 active fighters at once)
- To free a slot for a substitute: click scoreboard → "Leave Battlefield" and confirm — must do this properly
- Commanders (up to 3 per Task Force) can issue orders: Attack / Defend / Gather on buildings

Individual Rewards:
- Minimum 10,000 Individual Points required to earn rewards
- Only participation in the actual battle earns individual rewards (not just being on the task force list)
- Alliance rewards go to ALL alliance members via mail regardless of participation
`;

export function getDesertStormDataSummary(): string {
  return `
=== DESERT STORM BATTLEFIELD ===
${DESERT_STORM_OVERVIEW}

${DESERT_STORM_BUILDINGS}

${DESERT_STORM_STRATEGY}

${DESERT_STORM_PHASES}
`;
}