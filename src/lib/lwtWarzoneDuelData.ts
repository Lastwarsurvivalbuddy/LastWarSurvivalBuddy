// lwtWarzoneDuelData.ts
// Source: lastwartutorial.com/warzone-duel/
// Warzone Duel (server war): competition rules, stages, points, rewards

export const WARZONE_DUEL_OVERVIEW = `
WARZONE DUEL (SERVER WAR) — OVERVIEW:
- 1v1 challenge between entire warzones (servers)
- Victory = capturing the rival warzone's Capitol
- Competition runs 2–3 weeks with 4–8 warzones in a bracket
- Winners face winners, losers face losers until one champion warzone remains
- Huge rewards for participants: speedups, resources, diamonds from diamond mines in conquered server

SCHEDULE:
- Monday–Friday: Invasion Right Contest Phase (points race — determines attacker vs defender)
- Saturday: Capitol War (15:00 server time) — invader attacks defender's Capitol
- ⚠️ Saturday overlap: Warzone Duel war AND normal Alliance Duel VS both run on Saturday

ATTACKER vs DEFENDER:
- Warzone with MORE points at end of Friday = INVADER (attacks enemy Capitol Saturday)
- Warzone with FEWER points = DEFENDER (protects their own Capitol Saturday)
- If your server wins the Capitol War: President gets Conqueror Bonus for ~7 days
`;

export const WARZONE_DUEL_POINTS = `
WARZONE DUEL — INVASION RIGHT CONTEST POINTS:

| Action | Points | Notes |
|--------|--------|-------|
| Warzone Total Damage Victory (Wanted Boss) | 250,000 | Highest single source |
| Apex Arena 1st Place | 100,000 | Once per week if your server wins |
| Wanted Boss 1st Place (Individual) | 50,000 | Up to 5× per week (5 Wanted Boss events) |
| Desert Storm Victory | 50,000 | Per alliance win; up to 20 alliances × 50k = 1M possible |
| Alliance Duel Victory | 30,000 | Per alliance per day; multiplied by all winning alliances |
| Arms Race 1st Place | 10,000 | Per 1st place finish |
| Alliance Duel MVP | 6,000 | Per MVP from your server; multiplied by number of MVPs |
| Plunder hostile warzone truck | 100 | Up to 4×/day per player × 5 days — massive at scale |

TRUCK PLUNDERING (highest volume source):
- Each player can plunder enemy warzone trucks 4 times per day
- 10,000 active players × 4 plunders × 5 days × 100 pts = 20,000,000 points for the server
- ⚠️ NEVER plunder your OWN server's trucks — hurts your own alliance growth
- Always plunder ENEMY server trucks only

KEY INSIGHT: Desert Storm victories and truck plundering are the two highest-leverage server-wide contributions.
`;

export const WARZONE_DUEL_WAR = `
WARZONE DUEL — CAPITOL WAR (SATURDAY):

- Starts at 15:00 server time on Saturday
- Invading warzone players teleport to defender's warzone
- Goal: capture and hold the enemy Capitol

Important rules during Capitol War:
- Commanders from the SAME warzone are allies — no friendly fire on neutral buildings
- Internal server conflicts do NOT carry over to the Capitol War map
- Burning down (destroying) a hostile base = 50,000 individual points — massive point source
- Many enemy players relocate to mud area without defenses set — easy zero targets for any power level

Rewards for participants:
- Warzone Winning Streak Rewards: for players on winning server with 50,000+ individual points
- Warzone Participation Rewards: based on points scored during Capitol War
- 9 reward chests with escalating loot
- Diamond mines spawn in conquered server after Capitol is taken — all winning server players can collect
`;

export const WARZONE_DUEL_TIPS = `
WARZONE DUEL — TIPS FOR PLAYERS:

During Invasion Right Contest (Mon–Fri):
- Plunder enemy server trucks EVERY DAY — 4 times per day per player — this is your biggest personal contribution
- Win your Alliance Duel VS daily (30,000 pts per alliance win)
- Participate in Desert Storm and win (50,000 pts per win)
- Try to win Arms Race (10,000 pts)
- Go for Wanted Boss 1st place if you can (50,000 pts each, 5 events/week)

During Capitol War (Saturday):
- Teleport to enemy warzone via Warzone Duel icon → Match Info → Grouping button → select server
- Target players in mud area (often no defense set) — easy burns for 50k points each
- Coordinate with server alliance leaders for organized pushes on the Capitol
- Remember: Saturday also has normal Alliance Duel VS — manage your troops accordingly
- If you're the DEFENDER: shield up, set defenses, reinforce Capitol alliance

After winning Capitol War:
- President receives Conqueror Bonus (~7 days) — extra ministry roles unlock (Military Commander, Administrative Commander)
- Diamond mines appear in conquered server — go collect them
`;

export function getWarzoneDuelDataSummary(): string {
  return `
=== WARZONE DUEL (SERVER WAR) ===
${WARZONE_DUEL_OVERVIEW}

${WARZONE_DUEL_POINTS}

${WARZONE_DUEL_WAR}

${WARZONE_DUEL_TIPS}
`;
}