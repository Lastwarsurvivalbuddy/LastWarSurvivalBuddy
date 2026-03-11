// lwtSquadData.ts
// Source: lastwartutorial.com/squads/
// Squad formation bonuses, troop type counter system, hero EXP/shard priority

export const SQUAD_FORMATION_BASICS = `
SQUAD FORMATION RULES:
- Defense heroes → front line positions
- Attack and support heroes → back line positions
- Example early squad: Murphy + Viola (defense, front) · Kimberly + Mason (attack, back) · Marshall (support, back)

TROOP TYPE COUNTER — FORMATION BONUS:
Unlocks after the FIRST Capitol Conquest (final phase of City Clash when Capitol can be captured).
Bonus applies to all heroes in the squad: boosts HP, attack, and defense.

Same-type hero bonuses:
- 3 heroes of the same type: +5%
- 3 of same type + 2 of another type: +10%
- 4 heroes of the same type: +15%
- 5 heroes of the same type: +20% (maximum)

STRATEGY NOTES:
- Most players start with all-tank squads → you can counter them with a mixed squad
- Example counter: 3 tanks + 2 aircraft = +10% bonus AND aircraft take only 80% damage from tank enemies
- Upgrading the troop-type building (e.g. Tank building) increases power of ALL heroes of that type
- If all 5 heroes are the same type → +20% bonus + building upgrade bonus = maximum power
- Mixing types sacrifices the top bonus but can gain tactical counter advantage

HERO EXP AND SHARDS — PRIORITY RULES:
- Do NOT waste EXP or shards upgrading all heroes
- Only upgrade heroes in your FIRST active squad
- Upgrade 2nd and 3rd squad heroes ONLY if you are a spender
- F2P players: focus 100% of EXP and shards on Squad 1 heroes
- Hero level-up EXP cost scales with level number
- Hero class upgrade shard cost scales with class level
`;

export const SQUAD_SOLDIERS_SYSTEM = `
SQUADS AND SOLDIERS (MARCH POWER):
When attacking or rallying, soldiers are added to base hero power.
Soldier count = sum of March Size attributes of all heroes in the squad.

Power calculation:
- Each T5 soldier = 409 power + 1200 load
- Example: 1,184 T5 soldiers = 484,256 added power + 1,420,800 load (max resources stolen if attack wins)

Resource stealing:
- Load points determine how much resources you steal from an enemy base
- Higher troop tier = more power AND more load per soldier
- Soldiers with higher tier are ALWAYS used first to fill the march, then lower tiers fill remaining slots
- Resources stolen per type are proportional to the enemy's resource distribution

MARCH SIZE MATTERS:
- Heroes with higher March Size attributes send more soldiers per attack
- Upgrading March Size = more soldiers = more power + more loot per attack
- This is why March Size is a key hero attribute to prioritize
`;

export function getSquadDataSummary(): string {
  return `
=== SQUAD SYSTEM ===
${SQUAD_FORMATION_BASICS}

${SQUAD_SOLDIERS_SYSTEM}
`;
}