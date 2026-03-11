// lwtTricksData.ts
// Source: lastwartutorial.com/tricks/
// Meta tips, shortcuts, and tricks that make Buddy sound like a veteran

export const TRICKS_RESOURCES = `
RESOURCE TRICKS:

Monica's Treasure Hunter skill:
- Use Monica's squad when killing World Map zombies (found via magnifying glass in map mode)
- Her "Treasure Hunter" skill gives +39% Coin, Food, and Iron after defeating regular World Map zombies
- NOTE: Event zombies usually do NOT qualify for this bonus — only standard World Map zombies

Gather resources with low troops (post-war trick):
- After Saturday wars your drill grounds may be depleted
- Remove ALL heroes from each squad, leave only 1 hero with the lowest "Command" attribute
- Each squad then deploys with far fewer troops → you can send all squads to gather simultaneously
- Alternative: Train level 1 soldiers — they train nearly instantly and let you fill squads fast
`;

export const TRICKS_HOT_DEALS = `
HOT DEALS / BULLSEYE LOOT TRICK — AMMO STACKING:
- Ammo unused during one event is stored in inventory and carries over
- If you don't have an immediate resource need, STACK ammo across multiple events
- Estimate ~4–5 ammo per level needed on average
- When you have a large stockpile, burn all ammo in a single event to blast through high reward levels
- High Bullseye Loot levels have significantly better rewards — stacking is the way to reach them
`;

export const TRICKS_DIAMONDS = `
FREE DAILY DIAMONDS:

90 diamonds/day from Arena:
- Go to Arena → 3v3 Brawl → click thumbs up icon 3 times = 30 diamonds each = 90 total
- Resets daily

Up to 30 diamonds from Daily Tasks (even after completing chests):
- Recruit Heroes 1 time = 10 diamonds
- Attack Commanders 1 time (attack someone without an alliance to avoid retaliation) = 10 diamonds
- Plunder others' Epic or Legendary Secret Task 1 time = 10 diamonds
- Total: 30 extra diamonds/day if not already done
`;

export const TRICKS_HOSPITAL = `
HOSPITAL / HEALING TRICKS:

Alliance Help staggered healing:
- Check how many alliance helps you can receive (Alliance Center → find your help limit)
- Start healing with total time equal to your number of available alliance helps (in minutes)
- Request help — each help = 0.5% progress boost with minimum 1 minute saved
- Best used when many alliance members are online (during Alliance Exercise or events)

Emergency Hospital cooldown trick:
- Emergency Hospital has a 2-day 2-hour cooldown between rescues
- When drill grounds are full: launch the rescue but DON'T claim the rescued troops
- Troops sit pending — cooldown timer starts immediately even before you claim
- Claim them later when you have space — you haven't lost any cooldown time
- Useful: you can't see the timer running until you claim, but it IS running in background
`;

export const TRICKS_ARMS_RACE_DUEL = `
BARRACKS / TRAINING TRICKS:

4x training points (Arms Race: Unit Progression + Duel VS Day 5: Total Mobilization):
- See Troops guide for the full training trick — up to 4x points using same resources and time
- Key insight: batch and time your training starts during these specific events

Higher unit train cap:
- Click barrack → Survivor list icon
- Swap survivors one-by-one to those with highest additional unit cap %
- If a survivor says "already working elsewhere" → confirm dispatch to this barrack
- Check the new Trainees count — example: 415 → 452 after optimization
- IMPORTANT: Survivors only affect training cap at the START of training — reposition them after
`;

export const TRICKS_DEFENSE = `
DAMAGE BOOST TRICKS:

War Fever (+1% damage, 15 minutes):
- Triggers when you: scout a base OR start/cancel an attack against an enemy commander
- Does NOT trigger from attacking zombies
- Visible in upper-left under resource meters — click icon to see countdown
- Repeat the trigger action every 15 minutes to keep it active
- ⚠️ WARNING: Do NOT use while shielded — you will lose your shield
- Works for: base defense, Alliance Exercise, World Boss attacks

Alliance Exercise bonus damage:
- Join rallies started by R4/R5 leaders for extra % damage
  - Normal R4: +2.5%
  - R5 or R4 with role Warlord/Butler/Muse/Recruiter: +5%
- Trigger War Fever before Exercise starts for extra +1%

World Boss — Mason trick (+17% damage):
- Mason (SSR Tank attack) has passive skill "Zombie Purge": +17% damage to back row vs monsters (at skill level 17)
- Swap formation: put Viola + Mason on FRONT row, move Murphy to BACK row
- Move gear cannon from Mason to Murphy
- This unconventional setup can significantly outperform standard formation vs World Boss monsters
`;

export const TRICKS_OPERATION_FALCON = `
OPERATION FALCON TRICKS:

Free troops at highest tier (Special Ops):
- DO NOT complete Special Ops until your barracks are upgraded as high as possible
- Troops you receive = your highest trainable troop level at time of completion
- Try to keep soldiers alive through the stage — you receive that count as free troops
- If too few soldiers survive: restart the level before completing it
- More HQ levels = more available Special Ops

Honorable Campaign farming:
- If your squad can't beat the next 2 levels: don't attempt them
- Swipe LEFT to a previously completed level you know you can win
- You'll only complete 1 mission category instead of 2, but you'll clear all stages and farm rewards
- Attempting levels you can't beat = wasted stamina and no rewards
`;

export const TRICKS_MISC = `
MISC TIPS:

VIP 1-hour bonus:
- Each time you reach a NEW VIP level you receive 1 free hour of VIP if not already active
- Watch your VIP point progress bar — buy a small amount of VIP points to trigger the hour at a time you'll actually use it

Zombie Invasion — cross-warzone gold farming (Season 1 & 2 only):
- If warzone teleporting is enabled, travel to a warzone where Zombie Invasion is active
- Kill their Zombie Bosses with rallies (10-minute protection for finder alliance first)
- Collect gold + courage medals that store in inventory
- Bring an ally for rally kills

Server war teleporting (Warzone Duel):
- During server wars, use the Warzone Duel icon → Match Info → Grouping button
- Select available servers (green "Go" button) to teleport and hunt kills elsewhere
- Useful when your main opponent is too strong or shielded

Zombie Invasion timing note: Always check which warzone has active Zombie Invasion before teleporting — the gold reward density makes it one of the best gold sources in the game.
`;

export function getTricksDataSummary(): string {
  return `
=== TRICKS & META TIPS ===
${TRICKS_RESOURCES}

${TRICKS_HOT_DEALS}

${TRICKS_DIAMONDS}

${TRICKS_HOSPITAL}

${TRICKS_ARMS_RACE_DUEL}

${TRICKS_DEFENSE}

${TRICKS_OPERATION_FALCON}

${TRICKS_MISC}
`;
}