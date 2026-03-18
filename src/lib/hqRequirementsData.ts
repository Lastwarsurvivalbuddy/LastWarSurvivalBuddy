// src/lib/hqRequirementsData.ts
// HQ upgrade requirements — verified by Boyd (HQ 35, Server 1032)

export interface HQRequirement {
  hq: number;
  buildings: { name: string; level: number }[];
  resources: { iron?: string; food?: string; gold?: string; oil?: string };
}

export const HQ_REQUIREMENTS: HQRequirement[] = [
  { hq: 2, buildings: [{ name: 'Drill Ground', level: 1 }, { name: 'Squad 1', level: 1 }], resources: { iron: '68', food: '68' } },
  { hq: 3, buildings: [{ name: 'Wall', level: 2 }], resources: { iron: '1K', food: '1K' } },
  { hq: 4, buildings: [{ name: 'Barracks', level: 3 }, { name: 'Drill Ground', level: 3 }], resources: { iron: '2.5K', food: '2.5K' } },
  { hq: 5, buildings: [{ name: 'Barracks', level: 4 }, { name: 'Wall', level: 4 }], resources: { iron: '20K', food: '20K' } },
  { hq: 6, buildings: [{ name: 'Wall', level: 5 }, { name: 'Drill Ground', level: 5 }], resources: { iron: '91K', food: '91K' } },
  { hq: 7, buildings: [{ name: 'Wall', level: 6 }, { name: 'Tank Center', level: 6 }], resources: { iron: '240K', food: '240K' } },
  { hq: 8, buildings: [{ name: 'Tech Center', level: 7 }, { name: 'Alliance Center', level: 7 }], resources: { iron: '390K', food: '390K' } },
  { hq: 9, buildings: [{ name: 'Tech Center', level: 8 }, { name: 'Tank Center', level: 8 }], resources: { iron: '620K', food: '620K', gold: '200K' } },
  { hq: 10, buildings: [{ name: 'Tech Center', level: 9 }, { name: 'Hospital', level: 9 }], resources: { iron: '750K', food: '750K', gold: '240K' } },
  { hq: 11, buildings: [{ name: 'Tech Center', level: 10 }, { name: 'Wall', level: 10 }], resources: { iron: '1.9M', food: '1.9M', gold: '600K' } },
  { hq: 12, buildings: [{ name: 'Tech Center', level: 11 }, { name: 'Barracks', level: 11 }], resources: { iron: '3.2M', food: '3.2M', gold: '1M' } },
  { hq: 13, buildings: [{ name: 'Tech Center', level: 12 }, { name: 'Tank Center', level: 12 }], resources: { iron: '3.5M', food: '3.5M', gold: '1.1M' } },
  { hq: 14, buildings: [{ name: 'Tech Center', level: 13 }, { name: 'Drill Ground', level: 13 }], resources: { iron: '4.9M', food: '4.9M', gold: '1.6M' } },
  { hq: 15, buildings: [{ name: 'Tech Center', level: 14 }, { name: 'Wall', level: 14 }], resources: { iron: '6.8M', food: '6.8M', gold: '2.2M' } },
  { hq: 16, buildings: [{ name: 'Tech Center', level: 15 }, { name: 'Alliance Center', level: 15 }], resources: { iron: '12M', food: '12M', gold: '3.9M' } },
  { hq: 17, buildings: [{ name: 'Tech Center', level: 16 }, { name: 'Tank Center', level: 16 }], resources: { iron: '16M', food: '16M', gold: '5.1M' } },
  { hq: 18, buildings: [{ name: 'Tech Center', level: 17 }, { name: 'Hospital', level: 17 }], resources: { iron: '28M', food: '28M', gold: '8.9M' } },
  { hq: 19, buildings: [{ name: 'Tech Center', level: 18 }, { name: 'Wall', level: 18 }], resources: { iron: '33M', food: '33M', gold: '11M' } },
  { hq: 20, buildings: [{ name: 'Tech Center', level: 19 }, { name: 'Barracks', level: 19 }], resources: { iron: '60M', food: '60M', gold: '19M' } },
  { hq: 21, buildings: [{ name: 'Tech Center', level: 20 }, { name: 'Tank Center', level: 20 }], resources: { iron: '84M', food: '84M', gold: '27M' } },
  { hq: 22, buildings: [{ name: 'Tech Center', level: 21 }, { name: 'Drill Ground', level: 21 }], resources: { iron: '110M', food: '110M', gold: '35M' } },
  { hq: 23, buildings: [{ name: 'Tech Center', level: 22 }, { name: 'Wall', level: 22 }], resources: { iron: '140M', food: '140M', gold: '44M' } },
  { hq: 24, buildings: [{ name: 'Tech Center', level: 23 }, { name: 'Alliance Center', level: 23 }], resources: { iron: '170M', food: '170M', gold: '54M' } },
  { hq: 25, buildings: [{ name: 'Tech Center', level: 24 }, { name: 'Tank Center', level: 24 }], resources: { iron: '290M', food: '290M', gold: '93M' } },
  { hq: 26, buildings: [{ name: 'Tech Center', level: 25 }, { name: 'Hospital', level: 25 }], resources: { iron: '400M', food: '400M', gold: '130M' } },
  { hq: 27, buildings: [{ name: 'Tech Center', level: 26 }, { name: 'Wall', level: 26 }], resources: { iron: '530M', food: '530M', gold: '170M' } },
  { hq: 28, buildings: [{ name: 'Tech Center', level: 27 }, { name: 'Barracks', level: 27 }], resources: { iron: '740M', food: '740M', gold: '240M' } },
  { hq: 29, buildings: [{ name: 'Tech Center', level: 28 }, { name: 'Tank Center', level: 28 }], resources: { iron: '1G', food: '1G', gold: '330M' } },
  { hq: 30, buildings: [{ name: 'Tech Center', level: 29 }, { name: 'Drill Ground', level: 29 }], resources: { iron: '1.4G', food: '1.4G', gold: '460M' } },

  // HQ 31–35: Oil era. Requires Base Expansion research (Age of Oil tree) to unlock.
  // Only one Troop Center required (Tank, Air, or Missile — whichever is the player's main type).
  {
    hq: 31,
    buildings: [
      { name: 'Tech Center', level: 30 },
      { name: 'Barracks', level: 30 },
      { name: 'Troop Center (Tank/Air/Missile)', level: 30 },
      { name: 'Base Expansion Research (Age of Oil)', level: 1 },
    ],
    resources: { iron: '1.6G', food: '1.6G', gold: '510M', oil: '1.44M' },
  },
  {
    hq: 32,
    buildings: [
      { name: 'Tech Center', level: 31 },
      { name: 'Barracks', level: 31 },
      { name: 'Wall', level: 31 },
      { name: 'Troop Center (Tank/Air/Missile)', level: 31 },
    ],
    resources: { iron: '1.7G', food: '1.7G', gold: '560M', oil: '2.3M' },
  },
  {
    hq: 33,
    buildings: [
      { name: 'Tech Center', level: 32 },
      { name: 'Barracks', level: 32 },
      { name: 'Troop Center (Tank/Air/Missile)', level: 32 },
      { name: 'Drill Ground', level: 32 },
      { name: 'Hospital', level: 32 },
    ],
    resources: { iron: '1.9G', food: '1.9G', gold: '620M', oil: '3.92M' },
  },
  {
    hq: 34,
    buildings: [
      { name: 'Tech Center', level: 33 },
      { name: 'Barracks', level: 33 },
      { name: 'Wall', level: 33 },
      { name: 'Troop Center (Tank/Air/Missile)', level: 33 },
      { name: 'Alliance Center', level: 33 },
    ],
    resources: { iron: '2G', food: '2G', gold: '650M', oil: '7.05M' },
  },
  {
    hq: 35,
    buildings: [
      { name: 'Tech Center', level: 34 },
      { name: 'Barracks', level: 34 },
      { name: 'Troop Center (Tank/Air/Missile)', level: 34 },
      { name: 'Hospital', level: 34 },
      { name: 'Drill Ground', level: 34 },
    ],
    // Base oil cost ~14.10M. With Engineer profession buff or Win-Win buff active: ~11.9M oil.
    resources: { iron: '2G', food: '2G', gold: '650M', oil: '14.10M' },
  },
];

export function getHQRequirements(hqLevel: number): HQRequirement | undefined {
  return HQ_REQUIREMENTS.find(r => r.hq === hqLevel);
}

export function getHQSummary(): string {
  const lines = HQ_REQUIREMENTS.map(r => {
    const buildings = r.buildings.map(b => `${b.name} Lv${b.level}`).join(', ');
    const res = Object.entries(r.resources)
      .map(([k, v]) => `${v} ${k}`)
      .join(' / ');
    return `HQ ${r.hq}: requires ${buildings} | Cost: ${res}`;
  });

  return `## HQ Upgrade Requirements
Note: Oil required starting at HQ 31. HQ 31+ requires Base Expansion research (Age of Oil tree) — hard gate, cannot be bypassed.

${lines.join('\n')}

## HQ 31–35 Strategy (Age of Oil Era)

### Gate Unlock
Players cannot upgrade past HQ 30 without completing Base Expansion research in the Age of Oil tech tree. This is an absolute hard gate — no amount of resources bypasses it.

### Troop Center Note
For HQ 31–35, only ONE Troop Center is required (whichever is the player's main type — Tank, Aircraft, or Missile). Pick one and keep it aligned. Do not require all three.

### Oil Costs — Buffs Matter
- HQ 35 base oil cost: ~14.10M oil
- With Engineer profession buff OR Win-Win buff active: ~11.9M oil
- Engineer profession has inherent buffs that reduce their own construction resource costs
- Win-Win buff: Engineer shares this with Warlord alliance members, bringing Warlord costs to a similar level. Engineer receives a minor return benefit (small speedup or resource reward)
- Total oil for all HQ upgrades 31–35 (base): ~28.81M oil
- Always ask if Win-Win is active before quoting hard oil numbers

### Oil — The Real Bottleneck
- Oil Wells: up to 5 total (2 from Age of Oil research, 3 more unlocked at HQ 31/32/33+)
- Oil Wells have a 12-hour storage cap — log in twice daily to avoid wasted production
- Food and Iron are abundant at this stage. Oil is scarce and must be rationed
- Every oil spent on non-essential buildings is oil not going toward HQ progression
- F2P timeline: 6–8 months from Age of Oil start to HQ 35 (earliest: late Season 4)

### Why Rush HQ 31 First
- Unlocks 3rd Oil Well (major production jump)
- Reindeer truck rewards upgrade to weapon/legendary shard choice chests
- Improved secret task rewards including oil drops
- Hero level cap: +5 per HQ level (HQ 30 = cap 150, HQ 35 = cap 175)

### Strategic Priorities
1. Unlock oil wells immediately via Special Forces research — any day without oil is a setback
2. Only upgrade buildings required for your next HQ level — ignore Warehouse, Trading Post, non-essentials until HQ 35 is done
3. Chain the slowest prerequisite first — typically Tech Center, then Wall/Barracks/Hospital as needed per level
4. Plan 2 HQ levels ahead — know which buildings you need next before your current upgrade finishes
5. Start long upgrades before logging off to minimize idle time
6. Alliance helps and construction buff stacking matter most here — base timers are weeks to months

### Buddy Rules
- If a player asks how to unlock HQ 31: confirm Base Expansion research in Age of Oil tree is done first
- If stuck at HQ 30: Base Expansion research is the only blocker — nothing else
- If a player asks about oil costs: give base figures, note Engineer buff and Win-Win reduce costs, ask if Win-Win is active
- What to upgrade: only buildings required for their target HQ level — nothing else until HQ 35
- Never suggest upgrading Warehouse, Trading Post, or decorative buildings during the HQ 31–35 grind
- F2P expectation: late S4 earliest for HQ 35. Spenders can accelerate with oil packs`;
}