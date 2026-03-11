// lwtOverlordData.ts
// Source: lastwartutorial.com/overlord-gorilla/
// Full Overlord Gorilla guide: rescue, training, deployment, skills, items, stores

export const OVERLORD_SUMMARY = `
OVERLORD GORILLA — SUMMARY:
- Arrives Day 89 of Season 2 (Thursday)
- To check your Season 2 day: go to Obelisk building → click the book → see Chrono-Story
- Even before deployment, the Gorilla appears in battle reports based on current training status
- Deployment requirement: Bond Rating "Rookie Partner I"
- Items to deploy: 1,800 Training Certificates · 300,000 Training Guidebooks · 24 Bond Badges
- F2P: takes weeks to months to deploy
- Spender: can deploy in ~1 week for approximately $500 USD
- After deployment: further training uses Overlord Universal Shards + Overlord Skill Badges
- Gorilla can be used in squad during Overlord Radar tasks (new icon in squad setup below drone setup)
- Alliance Duel VS Day 5: using Overlord items earns Duel VS points — DO NOT use Overlord items before Friday if Duel VS is active
`;

export const OVERLORD_RESCUE_SEQUENCE = `
OVERLORD RESCUE SEQUENCE (4 days):
Day 1 — Rescue: Complete radar mission "A Special Rescue" (gorilla face icon) → then "Unexpected Discovery" → place Overlord Base → give supplies. Progress: 50/150. Supply sources: 3 exclusive supply radar tasks/day (up to 10 total) + baby gorilla brings supplies daily.
Day 2 — Weak: Progress to 90/150.
Day 3 — Minor Injury: Progress to 130/150.
Day 4 — Recovery Complete: Reach 150/150 → Tactical Institute building unlocks → training begins.

NOTE: Once Gorilla is fully healed, the supply radar missions stop appearing.
`;

export const OVERLORD_TRAINING_GATES = `
OVERLORD TRAINING — PATH TO DEPLOYMENT:

SPECIALIZED TRAINING:
- 3 types of specialized training, each upgraded independently
- Training Guidebook = like drone data (continuous upgrades)
- Training Certificate = like drone parts (gates every 5 levels, the bottleneck)

BOND RATINGS (in order):
1. No Rating (start)
2. New Partner I through New Partner X (10 levels)
3. Rookie Partner I (deploy unlocked here)
4. Further levels beyond deployment

--- TO REACH "NEW PARTNER I" ---
Bring ALL 3 specialized trainings to Level 50:
Per training, levels 1–50 require:
- Guidebooks: ~38,000 total
- Certificates: 180 total
TOTAL for all 3 trainings to level 50: ~114,000 Guidebooks · 540 Certificates
Then: Promotion to "New Partner I" costs 2 Bond Badges

Training cost breakdown per specialized training (levels 1–50):
Levels 1–5: 600 guidebooks each
Levels 6–10: 600 guidebooks + 10 certificates each
Levels 11–20: 600 guidebooks + 15–20 certificates each
Levels 21–40: 800 guidebooks + 25–40 certificates each
Levels 41–50: 1,000 guidebooks + 45–50 certificates each

--- TO REACH "ROOKIE PARTNER I" (DEPLOY) ---
Bring ALL 3 specialized trainings to Level 100:
Per training, levels 51–100 require:
- Guidebooks: ~62,000 total
- Certificates: 420 total
TOTAL for all 3 trainings level 51–100: ~186,000 Guidebooks · 1,260 Certificates

Promotions from New Partner I → New Partner X: 2 Bond Badges each = 18 Bond Badges total
Final promotion to Rookie Partner I: 4 Bond Badges

TOTAL TO DEPLOY:
- 1,800 Training Certificates
- 300,000 Training Guidebooks
- 24 Bond Badges
`;

export const OVERLORD_SKILLS = `
OVERLORD SKILLS (5 skills, unlocked at deployment):
1. Riot Shot
2. Overlord's Armor
3. Brutal Roar
4. Furious Hunt
5. Expert Overlord

- Skills leveled up using: Overlord Skill Badges
- Further promotions unlock full skill potential
- Tabs after deployment: Overview (total power, skill levels, attributes) · Promote · Skill · Train
`;

export const OVERLORD_ITEM_SOURCES = `
OVERLORD ITEMS — FREE TO PLAY SOURCES:
1. Overlord Growth Boost event (starts day Gorilla rescue begins) — major daily reward milestone event
2. Tactical Institute building — generates Training Guidebooks continuously
3. 3 daily Overlord Radar Missions — total of 42 missions available; early missions give direct items, later missions give Gold/Purple Lucky Chests
4. Overlord Armed Truck — hourly loot accumulation; stages 1–54+ clearable for rewards
5. Zombie Invasion Bosses (level 105–120) — drop Training Guidebooks (available from Dec 26+)
6. General's Trial (Advanced difficulty 4–5) — rewards Overlord Skill Badges + Universal Overlord Shards

WEEKLY STORE LIMITS (free sources):
- Bond Badge: 1/week in VIP Store + 1/week in Alliance Store = 2/week
- Training Guidebook: 6,000/week in VIP Store + 6,000/week in Campaign Store = 12,000/week
- Training Certificate: 20/week in Campaign Store (THE BOTTLENECK — gates every 5 levels)
- Universal Overlord Shards: 5/week in Alliance Store
- Overlord Skill Badges: 3,000/week in Campaign Store

PURCHASABLE ITEMS:
- Overlord Training Battle Pass (3 tiers): Freebie · Advanced (~$6) · Premium (~$24) — NOTE: Battle Pass alone is NOT enough to deploy
- Special Offer Popups: up to 5 purchases, price doubles each time, content changes
- Weekly Packs: ongoing spender option
- Overlord Growth Handbook: available Day 1 of Week 4 of Season 3, found in Mall
- Fast-track spend estimate: ~$500 to deploy in 1 week
`;

export const OVERLORD_DUEL_TIP = `
CRITICAL TIMING TIP — ALLIANCE DUEL VS:
Using Overlord training items earns Duel VS points on Day 5 (Friday).
NEVER use Training Guidebooks, Training Certificates, or Bond Badges before Friday if Alliance Duel is active.
Save and use them all on Friday to maximize Duel VS score.
`;

export function getOverlordDataSummary(): string {
  return `
=== OVERLORD GORILLA SYSTEM ===
${OVERLORD_SUMMARY}

${OVERLORD_RESCUE_SEQUENCE}

${OVERLORD_TRAINING_GATES}

${OVERLORD_SKILLS}

${OVERLORD_ITEM_SOURCES}

${OVERLORD_DUEL_TIP}
`;
}