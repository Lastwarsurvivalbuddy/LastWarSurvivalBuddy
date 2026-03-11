// lwtCapitolData.ts
// Source: lastwartutorial.com/the-capitol/
// Capitol conquest, ministries (hats), boosts, how to request and assign titles

export const CAPITOL_OVERVIEW = `
THE CAPITOL — OVERVIEW:
- The alliance that captures the Capitol gains the right to appoint the President
- President appoints Vice President (VP) and all Ministries
- Ministries (called "hats" in-game) give massive buffs to whoever holds them
- During Warzone Duel: if your server wins as attacker, President receives Conqueror Bonus (lasts ~7 days)
- Conqueror Bonus unlocks 2 extra roles: Military Commander and Administrative Commander

ELIGIBILITY RULES:
- Minimum HQ level 16 to apply for any position
- Can only hold ONE position at a time
- 30-minute wait between applications
- Each position accepts max 50 applications; expired after 24 hours if not approved
- Auto-appointment list: max 50 commanders; President or VP approves who gets on the list
- Appointments happen every 4 min 40 sec (~5 min in-game)
- When Capitol Conquest starts: all applications are wiped — reapply after new President takes office
`;

export const CAPITOL_MINISTRIES = `
CAPITOL MINISTRIES — FULL BUFF REFERENCE:

PRESIDENT (alliance that captured Capitol):
Normal: Hero HP +5% · Hero Attack +5% · Hero Defense +5% (auto-applies on appointment)
Conqueror Bonus: same + Enemy Unit Casualty Rate +5%

VICE PRESIDENT (appointed by President):
Normal: Construction Speed +20% · Research Speed +20% · Training Speed +10%
Conqueror Bonus: Construction +25% · Research +25% · Training +12.5%

SECRETARY OF DEVELOPMENT:
Normal: Construction Speed +50% · Research Speed +25%
Conqueror Bonus: Construction +60% · Research +30%

SECRETARY OF SCIENCE:
Normal: Research Speed +50% · Construction Speed +25%
Conqueror Bonus: Research +60% · Construction +30%

SECRETARY OF INTERIOR:
Normal: Food Output +100% · Iron Output +100% · Coin Production +100%
Conqueror Bonus: All resource outputs +150%
⚠️ IMPORTANT: For resource hats — wait until your mines/fields are FULL, THEN get the hat, THEN collect. The boost only applies at moment of collection.

SECRETARY OF STRATEGY:
Normal: Hospital Capacity +20% · Unit Healing Rate +20%
Conqueror Bonus: Hospital Capacity +25% · Unit Healing Rate +25%

SECRETARY OF SECURITY:
Normal: Unit Training Cap +20% · Training Speed +20%
Conqueror Bonus: Unit Training Cap +25% · Training Speed +25%

MILITARY COMMANDER (Conqueror Bonus only):
March Speed +5% · Enemy Unit Casualty Rate +5%

ADMINISTRATIVE COMMANDER (Conqueror Bonus only):
Construction Speed +60% · Research Speed +60%
`;

export const CAPITOL_SPEED_MATH = `
CAPITOL — HOW SPEED BUFFS ACTUALLY WORK:
Speed buffs do NOT reduce time by the percentage shown. They increase your speed, which reduces time less than expected.

Example: Secretary of Development gives +50% construction speed
- Base: 1 block/min → 100 blocks = 100 min
- With +50% speed: 1.5 blocks/min → 100/1.5 = 66.7 min (33% time reduction, not 50%)

The more existing buffs you already have, the LESS effective each new hat is:
- If you already have 100% construction speed (2 blocks/min) and add the +50% hat (2.5 blocks/min):
- Time reduction is only 100/2 → 100/2.5 = 20% (not 33%)

KEY RULE: Speed hats only affect operations you START while holding the hat.
- Ongoing constructions, researches, trainings, healings are NOT affected
- Once you start an operation with the hat active, the time is locked in — hat can be removed
`;

export const CAPITOL_HOW_TO_REQUEST = `
CAPITOL — HOW TO REQUEST A HAT:
1. Find the VP (Vice President): go to Capitol → Management → Title Assignment → see current VP
2. Click the VP's avatar → Chat → send private message requesting the hat
   Example: "I would like the Secretary of Development hat please"
3. Share your map coordinates: go to your base → map mode → click your base → Share button → share with VP
4. VP will add you to the queue and notify you when it's your turn
5. Hat duration: 10 minutes per player (VP rotates through the queue)
6. You'll know you have the hat when:
   - VP sends you a message confirming
   - Hat symbol appears above your base on map
   - Hat symbol appears next to your username in chat
   - Announcement banner appears on map
   - You receive a mail with the assignment

WHAT TO DO WHEN YOU GET THE HAT:
- Speed hats (Development, Science, Security, VP): immediately START a construction, research, or training to lock in the reduced time
- Interior hat: must collect resources WHILE holding the hat — wait for mines to be full first
- Strategy hat: hospital capacity and heal rate apply automatically

TIMING NOTE: Each hat assignment has a 10-minute minimum interval — VP cannot reassign the same hat to a new player until 10 minutes have passed.
`;

export function getCapitolDataSummary(): string {
  return `
=== THE CAPITOL & MINISTRIES ===
${CAPITOL_OVERVIEW}

${CAPITOL_MINISTRIES}

${CAPITOL_SPEED_MATH}

${CAPITOL_HOW_TO_REQUEST}
`;
}