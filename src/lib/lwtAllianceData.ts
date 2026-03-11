// lwtAllianceData.ts
// Source: lastwartutorial.com/alliances/
// Alliance system, roles, tech, donations, store, gifts, leaving rules

export const ALLIANCE_ADVANTAGES = `
ALLIANCE ADVANTAGES:
- Reinforcements: alliance members can defend your base from attacks
- Rallies: attack enemies and monsters together for more damage
- Alliance Help: members speed up your hospital healing, construction, research
- Alliance Tech: collaborative research that boosts ALL members permanently
- Alliance Contribution Points: earned from tech donations, spent in Alliance Store
- City captures: alliance can hold cities that give server-wide buffs to all members
- Access to many events that require alliance membership
`;

export const ALLIANCE_ROLES = `
ALLIANCE ROLES AND RANKINGS:
Max members per alliance: 100

Rankings:
- R5: Leader (1 per alliance) — sets goals, appoints R4s, has all powers
- R4: Up to 8 members (10 once Alliance Gifts hits level 10) — manages the alliance
- R3: Key active players, core members
- R2: Important builders, less active
- R1: New/rising members

R5 exclusive powers:
- Appoint R4s and assign roles (Warlord, Recruiter, Muse, Butler)
- Call Alliance Assembly (recalls members to teleport to hive)
- Rally vs Marshall during Alliance Exercise = +5% damage bonus

R4 powers (R5 has all of these too):
- Change rankings of R3 and below
- Approve/kick members
- Start war on villages
- Start Alliance Exercise and Desert Storm
- Rally vs Marshall during Alliance Exercise = +5% damage bonus
- Change Alliance Assembly Point on map
- Send Alliance Mails (unlocks at Alliance Gifts level 5)

Role descriptions:
- Warlord: plans attacks, defenses, territory expansion
- Recruiter: finds and recruits strong players
- Muse: maintains morale, inspires team
- Butler: onboards new recruits, guides integration

Inactive R5 rule:
- If R5 offline 24–48 hours → role passes to an R4 who was online in last 24 hours
- If no R4 qualifies → passes to qualifying R3
`;

export const ALLIANCE_TECH = `
ALLIANCE TECH:
Access: Alliance button → Alliance Techs
Two categories: Development and War

Most important tech: AUTO RALLY (first in Development section)
- Allows offline members' squads to automatically join rallies
- Even a solo online member can fill a rally with offline teammates
- Opt-out available in: Avatar → Settings → scroll to Auto Rally settings
- RECOMMENDATION: Leave auto-rally ENABLED to help your alliance

Tech donation rules:
- Always donate to the RECOMMENDED tech for +20% bonus (60 pts vs 50 pts)
- Use COINS for donations, never diamonds
- 30 coin donation opportunities per day, regenerates 1 per 20 minutes
- Diamond donations: unlimited but escalating cost (2 diamonds → max 50), resets after 20 min inactivity

Donation crit chances: 45% none / 30% 2x / 15% 3x / 10% 5x

Donation rankings: daily and weekly rewards for top donors in alliance — check your ranking for bonus rewards
`;

export const ALLIANCE_STORE_TIPS = `
ALLIANCE STORE (from Alliance perspective):
- Access: Alliance → Alliance Store
- Currency: Alliance Contribution Points
- Resets on visible countdown timer

Key rules:
- Construction/Research/Healing/Training speedups ONLY available here → top priority
- Golden shards and Drone Parts are rare → buy these first when available
- Don't blow all points — hold them if current reset has no rare items
- Points are NOT lost when leaving an alliance, but you CANNOT access the store without being in one
`;

export const ALLIANCE_GIFTS = `
ALLIANCE GIFTS:
Two types:
- Common gifts: triggered when any alliance member STARTS a rally
- Rare gifts: triggered when any alliance member makes a PURCHASE

⚠️ Gifts must be MANUALLY claimed — they don't auto-collect
Higher Alliance Gift level unlocks more alliance features:
- Level 5: R4s can send Alliance Mails
- Level 10: Two additional R4 slots (8 → 10)
`;

export const ALLIANCE_LEAVING_RULES = `
BEFORE LEAVING AN ALLIANCE — CHECKLIST:
1. Claim ALL pending Alliance Gifts — they are lost when you leave
2. Buy everything you need from Alliance Store — no access without alliance
3. Wait until Sunday if Duel VS is running — leaving mid-duel forfeits your rewards
4. Donate to Alliance Tech — your donation counter resets to 0 when joining a new alliance
5. Note: 1-hour cooldown before you can join/apply to a new alliance after leaving
6. Note: 24-hour cooldown after joining before you can claim dig treasure or special rewards
7. Teleport away from your current alliance hive before leaving — unallied players get attacked
`;

export const ALLIANCE_SOLO_DISADVANTAGES = `
DISADVANTAGES OF PLAYING WITHOUT AN ALLIANCE:
- No rallies: can't do radar missions (doom elites, doom walkers, zombie bosses), events requiring rallies
- Daily tasks, Season Battle Passes, Hot Deals tasks impacted by inability to rally
- No Ghost Operations (can't join or host)
- No Hidden Treasures map exchange
- No Secret Mission ally assist
- No Alliance Events: Desert Storm, Alliance Exercise, General's Trial, Alliance Challenge, Zombie Siege
- No Alliance Store (no shields, no speedups, no rare items)
- No Alliance Tech buffs (construction/cost reductions lost)
- No hospital help, construction help, or research help
- No radar missions arriving pre-completed
- No cooperative research/construction skills
- Season-specific losses:
  - S1: Can't exchange genes, can't do Crimson Legions
  - S2: Can't exchange Polar Dishes ingredients, can't do Beast Crisis, can't do Rare Soil War
  - S3: Can't receive Alliance Vault help, can't do Return of Dead, can't do Spice Wars
  - All seasons: Can't capture/attack lands, can't collect Season Alliance Goal rewards
`;

export function getAllianceDataSummary(): string {
  return `
=== ALLIANCE SYSTEM ===
${ALLIANCE_ADVANTAGES}

${ALLIANCE_ROLES}

${ALLIANCE_TECH}

${ALLIANCE_STORE_TIPS}

${ALLIANCE_GIFTS}

${ALLIANCE_LEAVING_RULES}

${ALLIANCE_SOLO_DISADVANTAGES}
`;
}