// lwtProfessionData.ts
// Source: lastwartutorial.com — Profession guides S1–S5
// Covers: Profession Hall mechanics, Engineer + War Leader skill trees,
// season-specific skills S1/S3/S4/S5, level caps, strategy

// ─── SYSTEM OVERVIEW ────────────────────────────────────────────────────────

export const PROFESSION_OVERVIEW = `
PROFESSION SYSTEM
Available from Season 1 onward. Two playable professions: Engineer and War Leader.
(Diplomat exists in-game but is not yet available.)

PROFESSION HALL
- Access via Season event menu → Profession, OR via the Profession Hall building
- Building has 3 options: Profession paths, Profession Skills, Building info

HOW TO GAIN PROFESSION EXP
- Killing monsters on the season map
- Capturing cities
- Upgrading season buildings (BEST source — completion gives the most EXP)

LEVEL CAPS BY SEASON
- Season 1: Cap Lv.40 (some skills above 40 shown but not accessible in S1)
- Season 2: Cap extended to Lv.70
- Season 3: Cap Lv.100
- Season 4: Cap Lv.100
- Season 5: Cap Lv.100

OVERFLOW EXP
Once you hit the level cap, further EXP is stored at a ratio and mailed at the start of the next season.

CHANGING PROFESSION
- Requires a "Profession Change Certificate" item
- One is available in the Season Battle Pass
- Resets and refunds ALL profession skill points

RESETTING SKILLS (same profession)
- Requires a "Profession Skill Reset Book" item
- Refunds all skill points, you keep your profession

SKILL POINT RULES
- Earn skill points by leveling up profession
- Season-specific skills (rightmost column) reset at end of season — points returned
- Season special skills may differ each season
- Don't rush high levels of one skill before reviewing all available — focus on strategic value, not "shiny" new skills
`;

// ─── ENGINEER SKILL TREE ────────────────────────────────────────────────────

export const ENGINEER_SKILLS = `
ENGINEER — Identity: Builder, supporter, production optimizer
Best for: Lower HQ/power players, early season building races, alliance support roles

SKILL UNLOCK BY PROFESSION LEVEL:

Lv.1
- Rapid Production: Speeds up building/training production
- Outstanding Contribution: Bonus alliance contribution rewards
- Combat Experience [S1 seasonal]: Combat stat boost

Lv.5
- Extra Meal: Increases food production or troop consumption reduction
- Siege Mastery: Increases siege damage when attacking enemy cities
- Building Inspiration I [S1 seasonal]: Boosts building speed in season

Lv.10
- Build for Free: Chance to complete a building upgrade instantly for free
- Research for Free: Chance to complete a research instantly for free
- Infection Spread [S1 seasonal]: Season-specific damage/spread mechanic

Lv.15
- Build Now: Instantly completes a building upgrade (active skill)
- Research Now: Instantly completes a research (active skill)
- Healing Expert [S1 seasonal]: Improves healing speed/capacity

Lv.20
- Rally Rush: Increases rally march speed or rally damage
- Siege Banner: Places a banner that boosts siege damage for nearby allies
- Double Exchange [S1 seasonal]: Doubles resource exchange efficiency

Lv.25
- Siege Inspiration: Passive boost to all siege-related stats
- Friendly Aid: Improves healing or resource aid sent to allies

Lv.30
- Cooperative Construction: Allows or boosts alliance-assisted building
- Cooperative Research: Allows or boosts alliance-assisted research
- Poison Trial [S1 seasonal]: Season poison/damage mechanic

Lv.35
- Resource-Saving: Reduces resource cost for building/research
- Recycling: Recovers resources from demolished buildings or expired items
- Professional Insights [S1 seasonal]: Bonus profession EXP or skill efficiency

Lv.40
- Medical Aid: Active healing boost for wounded troops
- Friendly Shield: Provides damage reduction to reinforced allies

Lv.45
- Building Inspiration II: Enhanced version of Building Inspiration I
- Suicide Squad: Special troop mechanic (high-damage sacrifice unit)

Lv.50
- Scientific Insight: Permanent research speed/cost improvement
- Landmine: Places a defensive landmine on the season map
- Virus Control [S1 seasonal]: Season endgame viral containment mechanic

ENGINEER STRATEGY
Early season: Rush Build for Free, Research for Free, Build Now, Research Now
These skills pay back immediately — every free instant = time + resource saved
Mid-season: Siege Mastery + Siege Banner for alliance rallies
Late season: Resource-Saving, Cooperative Construction for alliance buildup
`;

// ─── WAR LEADER SKILL TREE ──────────────────────────────────────────────────

export const WAR_LEADER_SKILLS = `
WAR LEADER — Identity: Rally core, offensive force, tactical trigger
Best for: Higher-power players, PvP-focused commanders, alliance war leads

SKILL UNLOCK BY PROFESSION LEVEL:

Lv.1
- Immediate Return: Troops auto-return instantly when you teleport — prevents interception
- Unit Mobilization: Daily free receipt of highest-tier troops — consistent military strength
- Combat Experience [S1 seasonal]: Combat stat boost

Lv.5
- Drill Ground Prep: Increases troop training capacity
- Hospital Prep: Increases hospital capacity
- Building Inspiration I [S1 seasonal]: Boosts building speed in season

Lv.10
- Craze: Increases damage dealt during "War Fever" state — core aggressive skill
- Urgent Cure: Instantly heals large number of wounded troops — fast recovery from losses
- Infection Spread [S1 seasonal]: Season-specific damage/spread mechanic

Lv.15
- Winning Pursuit: Increases enemy casualty rate when attacking a burning target
- Intensive Training: Boosts troop training speed or output
- Healing Expert [S1 seasonal]: Improves healing speed/capacity

Lv.20
- March in Badlands: Increases march speed in season map zones — key for map mobility
- Warfare Supplies: Improves resource efficiency or ammo during war
- Double Exchange [S1 seasonal]: Doubles resource exchange efficiency

Lv.25
- Inspire: Boosts attack/defense for nearby allies (passive aura)
- Speedup Reinforce: Increases march speed when reinforcing allies

Lv.30 ← PRIORITY TIER
- Team Strike: Increases damage for ALL squads in a rally. GOD-TIER skill for rally warfare.
- Disguise: Hides your info from enemy battle reports — critical for scouting and surprise attacks
- Poison Trial [S1 seasonal]: Season poison/damage mechanic

Lv.35
- Tactical Reinforce: Increases damage reduction + hero stats for troops you send to reinforce allies
- Reinforce Strengthen: Further enhances reinforcement troop power
- Professional Insights [S1 seasonal]: Bonus profession EXP or skill efficiency

Lv.40 ← HIGH VALUE
- Decay Ray: Chance to PERMANENTLY decrease level of enemy units when attacking — threatening debuff
- Charge Banner: Increases attack for all allies within range — clarion call for group operations
- [Instructions skill]

Lv.45
- Fortify Defense: Boosts base/wall defensive stats
- Prisoner: Special mechanic for capturing or holding enemy commanders/troops

Lv.50
- Siege Boost: Directly increases damage when attacking enemy bases — key for breaking cities
- Prism Tower: Builds a structure in alliance territory with AoE damage bonus — positional warfare tool
- Virus Control [S1 seasonal]: Season endgame mechanic

WAR LEADER STRATEGY ROADMAP
Phase 1 (Lv.1–20): Immediate Return → Unit Mobilization → Drill Ground Prep → Hospital Prep → Craze
  Goal: Daily troop supply, safety, basic combat power
Phase 2 (Lv.20–40): Team Strike (MAX) → Winning Pursuit → Siege Boost → Urgent Cure
  Goal: Become indispensable rally core
Phase 3 (Lv.40+): Disguise → Decay Ray → Charge Banner → Prism Tower
  Goal: Tactical initiative and strategic deterrence

WAR LEADER CORE RULES
- Your value multiplies in rallies. Solo War Leader = wasted potential
- Season switch: Start of season use Engineer to build fast. Switch to War Leader for mid/late territorial wars, Capitol Conquest, and league peak events
- Team Strike at Lv.30 is the inflection point — the whole rally force benefits
- Use Disguise for reconnaissance before any major attack. Never fight unprepared.
- Decay Ray timing matters — use on high-tier troop targets for maximum impact
- Charge Banner + Prism Tower = positional control, not just stat padding
`;

// ─── SEASONAL SKILLS BY SEASON ──────────────────────────────────────────────

export const SEASONAL_SKILLS = `
SEASONAL SKILLS — Reset at end of each season, skill points returned

Season-specific skills appear as the rightmost column in the profession skill tree.
Both Engineer and War Leader share the same seasonal skills within a season.

SEASON 1 (Crimson Plague) — Lv.40 cap
Seasonal skills: Combat Experience, Building Inspiration I, Infection Spread,
Healing Expert, Double Exchange, Poison Trial, Professional Insights, Virus Control

SEASON 2 (Polar Storm) — Lv.70 cap
Profession cap extended. New seasonal skills added (not fully documented here).

SEASON 3 (Golden Kingdom) — Lv.100 cap
New seasonal skills: Sandworm Traps, Summon Mummies, Nature's Touch, Trap Landmines
(Desert-themed mechanics matching the Golden Kingdom map)

SEASON 4 (Evernight Isle) — Lv.100 cap
New seasonal skills: Blood Night Hunter, Hunting Inspiration, Flare, Lightfall,
Disruption Mine, Oni Summon
Additional seasonal skills: Combat Experience, Building Inspiration I, Double Exchange,
Contaminated Land Teleport, Professional Insights, Trade Discount, Top Up EXP,
Fragile Spell, Shrinking Spell
(Night/supernatural theme matching Evernight Isle)

SEASON 5 (Wild West) — Lv.100 cap
New seasonal skills: Banker, Barista, Gunslinger Wager,
Train Plunderer, Train Consigner, Train Protection
(Western theme — train mechanics are new to S5)

KEY RULE: Seasonal skills are temporary. Don't over-invest skill points in them
at the expense of permanent profession skills. The permanent tree (Engineer or
War Leader core skills) carries across all seasons.
`;

// ─── PROFESSION CHOICE GUIDE ────────────────────────────────────────────────

export const PROFESSION_CHOICE = `
WHICH PROFESSION TO CHOOSE?

CHOOSE ENGINEER IF:
- You are lower HQ/power relative to your server
- Your alliance needs building/research support
- You are in early-to-mid season and buildings are still incomplete
- You prefer support/economic playstyle

CHOOSE WAR LEADER IF:
- You are competitive in power on your server
- You want to be a rally initiator or join front-line attacks
- Your alliance has the buildings covered and you want war impact
- You prefer aggressive/PvP playstyle
- Season is in mid-to-late stage (territory wars, Capitol Conquest active)

HYBRID STRATEGY (common for experienced players):
- Start each season as Engineer → complete season buildings fast for maximum profession EXP
- Switch to War Leader via Profession Change Certificate when buildings are done
- The Battle Pass provides one free certificate per season
- Stored overflow EXP carries forward, so the switch doesn't waste progress
`;

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export function getProfessionDataSummary(): string {
  return [
    "## PROFESSION SYSTEM",
    PROFESSION_OVERVIEW,
    "## ENGINEER SKILLS",
    ENGINEER_SKILLS,
    "## WAR LEADER SKILLS",
    WAR_LEADER_SKILLS,
    "## SEASONAL SKILLS BY SEASON",
    SEASONAL_SKILLS,
    "## PROFESSION CHOICE GUIDE",
    PROFESSION_CHOICE,
  ].join("\n\n");
}