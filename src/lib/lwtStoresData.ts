// lwtStoresData.ts
// Source: lastwartutorial.com/stores/
// What to buy in each store, priority order, what to skip

export const STORES_DIAMOND = `
DIAMOND STORE:
- Base store, never resets, all items unlimited
- RECOMMENDATION: Don't buy anything here regularly
- Exception: Buy Advanced Teleporter or Alliance Teleporter here ONLY when sold out everywhere else
- That's it — skip everything else in this store
`;

export const STORES_VIP = `
VIP SHOP:
- Requires diamonds — use wisely
- CRITICAL RULE: Buy VIP subscription FIRST before spending diamonds here
- Resets weekly, limited quantities per item

Priority purchase order (most to least important):
1. Stamina
2. Universal Legendary Hero Shards
3. 8H Speedups
4. 3H Speedups
5. 1H Speedups

Estimated weekly diamond cost for full priority list:
5×60 + 10×300 + 10×480 + 20×192 + 60×72 = 16,260 diamonds

Bonus buy: Epic Hero Universal Shards if you have an additional 6,000 diamonds after the above.
`;

export const STORES_ALLIANCE = `
ALLIANCE STORE:
- Uses Alliance Contribution Points (earned from donating to Alliance Tech)
- Store resets on a countdown visible at top of store
- DO NOT spend all contribution points — wait for rare items if current reset has nothing good

Priority purchase order:
1. UR (Universal Rarity) Shards
2. Construction speedups
3. Research speedups
4. Drone Parts
5. Shields — ALWAYS have at least 1×24h shield and 1×8h shield ready for Saturday wars

During Season 1/2: prioritize Mason shards + Violet shards BEFORE UR upgrades

Transfer tickets: buy if you plan to move servers (once transfer feature is open)

NEVER buy:
- Survivors
- Resource chests (massively overpriced)
- Superalloy, Dielectric, Ceramic

Key rule: Alliance contribution points are NOT lost if you leave an alliance — but you can't spend them until you rejoin one.
`;

export const STORES_HONOR = `
HONOR SHOP:
- Uses Honor Points
- Resets MONTHLY

RECOMMENDATION: Buy ONLY Gear Blueprint Legendary here.
- This is the ONLY free-to-play source of Legendary Gear Blueprints in the game
- You will need a large quantity to upgrade gear — prioritize every month
- Monthly limit: 50 Gear Blueprint Legendary (note: limit is 50, not 41 as shown in some screenshots)
- Do not spend Honor Points on anything else until you've maxed Legendary Blueprints for the month
`;

export const STORES_CAMPAIGN = `
CAMPAIGN STORE:
- Uses Campaign Medals earned in Honorable Campaign
- (Previously under yellow helicopter — now located at Alert Tower)

Priority purchase order:
1. Epic Resource Choice Chest — if you are HQ 30+, this yields ~165M gold per week. Highest value item in the store.
2. Legendary Campaign Chest — chance to win 100 golden shards
3. Drone Parts
4. Universal Exclusive Weapon Shards
`;

export const STORES_SEASON = `
SEASON STORE:
- Only available after Season 1 (The Crimson Plague) begins
- Contains season-specific items tied to current season progression
- Check store contents when entering each new season — items vary by season
`;

export const STORES_DONATION_RULES = `
ALLIANCE TECH DONATION RULES (how to earn Alliance Contribution Points):
- Donating to the RECOMMENDED tech: +20% bonus → 60 EXP + 60 Alliance Contribution Points per donation
- Donating to non-recommended tech: 50 EXP + 50 Alliance Contribution Points

Critical hit chances per donation:
- No crit: 45%
- 2x crit (extra 50 Alliance Tech EXP): 30%
- 3x crit (extra 100 Alliance Tech EXP): 15%
- 5x crit (extra 200 Alliance Tech EXP): 10%

Coin donation cap: 30 donations/day using coins. Regenerates at 1 opportunity per 20 minutes when below 30.
Diamond donations: unlimited, but cost increases with each donation (starts 2 diamonds, +2 per donation, max 50 diamonds). Cost decreases gradually after 20 minutes.
RULE: Always use coins for donations — never diamonds unless absolutely necessary.
`;

export function getStoresDataSummary(): string {
  return `
=== STORES GUIDE ===
${STORES_DIAMOND}

${STORES_VIP}

${STORES_ALLIANCE}

${STORES_HONOR}

${STORES_CAMPAIGN}

${STORES_SEASON}

${STORES_DONATION_RULES}
`;
}