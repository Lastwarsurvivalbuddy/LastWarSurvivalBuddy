// src/lib/hqRequirementsData.ts
// HQ upgrade requirements — scraped from dracgon.tech (verified March 2026)
// Each entry = what you need to upgrade TO that HQ level

export interface HQRequirement {
  hq: number;
  buildings: { name: string; level: number }[];
  resources: { iron?: string; food?: string; gold?: string; oil?: string };
}

export const HQ_REQUIREMENTS: HQRequirement[] = [
  {
    hq: 2,
    buildings: [{ name: 'Drill Ground', level: 1 }, { name: 'Squad 1', level: 1 }],
    resources: { iron: '68', food: '68' },
  },
  {
    hq: 3,
    buildings: [{ name: 'Wall', level: 2 }],
    resources: { iron: '1K', food: '1K' },
  },
  {
    hq: 4,
    buildings: [{ name: 'Barracks', level: 3 }, { name: 'Drill Ground', level: 3 }],
    resources: { iron: '2.5K', food: '2.5K' },
  },
  {
    hq: 5,
    buildings: [{ name: 'Barracks', level: 4 }, { name: 'Wall', level: 4 }],
    resources: { iron: '20K', food: '20K' },
  },
  {
    hq: 6,
    buildings: [{ name: 'Wall', level: 5 }, { name: 'Drill Ground', level: 5 }],
    resources: { iron: '91K', food: '91K' },
  },
  {
    hq: 7,
    buildings: [{ name: 'Wall', level: 6 }, { name: 'Tank Center', level: 6 }],
    resources: { iron: '240K', food: '240K' },
  },
  {
    hq: 8,
    buildings: [{ name: 'Tech Center', level: 7 }, { name: 'Alliance Center', level: 7 }],
    resources: { iron: '390K', food: '390K' },
  },
  {
    hq: 9,
    buildings: [{ name: 'Tech Center', level: 8 }, { name: 'Tank Center', level: 8 }],
    resources: { iron: '620K', food: '620K', gold: '200K' },
  },
  {
    hq: 10,
    buildings: [{ name: 'Tech Center', level: 9 }, { name: 'Hospital', level: 9 }],
    resources: { iron: '750K', food: '750K', gold: '240K' },
  },
  {
    hq: 11,
    buildings: [{ name: 'Tech Center', level: 10 }, { name: 'Wall', level: 10 }],
    resources: { iron: '1.9M', food: '1.9M', gold: '600K' },
  },
  {
    hq: 12,
    buildings: [{ name: 'Tech Center', level: 11 }, { name: 'Barracks', level: 11 }],
    resources: { iron: '3.2M', food: '3.2M', gold: '1M' },
  },
  {
    hq: 13,
    buildings: [{ name: 'Tech Center', level: 12 }, { name: 'Tank Center', level: 12 }],
    resources: { iron: '3.5M', food: '3.5M', gold: '1.1M' },
  },
  {
    hq: 14,
    buildings: [{ name: 'Tech Center', level: 13 }, { name: 'Drill Ground', level: 13 }],
    resources: { iron: '4.9M', food: '4.9M', gold: '1.6M' },
  },
  {
    hq: 15,
    buildings: [{ name: 'Tech Center', level: 14 }, { name: 'Wall', level: 14 }],
    resources: { iron: '6.8M', food: '6.8M', gold: '2.2M' },
  },
  {
    hq: 16,
    buildings: [{ name: 'Tech Center', level: 15 }, { name: 'Alliance Center', level: 15 }],
    resources: { iron: '12M', food: '12M', gold: '3.9M' },
  },
  {
    hq: 17,
    buildings: [{ name: 'Tech Center', level: 16 }, { name: 'Tank Center', level: 16 }],
    resources: { iron: '16M', food: '16M', gold: '5.1M' },
  },
  {
    hq: 18,
    buildings: [{ name: 'Tech Center', level: 17 }, { name: 'Hospital', level: 17 }],
    resources: { iron: '28M', food: '28M', gold: '8.9M' },
  },
  {
    hq: 19,
    buildings: [{ name: 'Tech Center', level: 18 }, { name: 'Wall', level: 18 }],
    resources: { iron: '33M', food: '33M', gold: '11M' },
  },
  {
    hq: 20,
    buildings: [{ name: 'Tech Center', level: 19 }, { name: 'Barracks', level: 19 }],
    resources: { iron: '60M', food: '60M', gold: '19M' },
  },
  {
    hq: 21,
    buildings: [{ name: 'Tech Center', level: 20 }, { name: 'Tank Center', level: 20 }],
    resources: { iron: '84M', food: '84M', gold: '27M' },
  },
  {
    hq: 22,
    buildings: [{ name: 'Tech Center', level: 21 }, { name: 'Drill Ground', level: 21 }],
    resources: { iron: '110M', food: '110M', gold: '35M' },
  },
  {
    hq: 23,
    buildings: [{ name: 'Tech Center', level: 22 }, { name: 'Wall', level: 22 }],
    resources: { iron: '140M', food: '140M', gold: '44M' },
  },
  {
    hq: 24,
    buildings: [{ name: 'Tech Center', level: 23 }, { name: 'Alliance Center', level: 23 }],
    resources: { iron: '170M', food: '170M', gold: '54M' },
  },
  {
    hq: 25,
    buildings: [{ name: 'Tech Center', level: 24 }, { name: 'Tank Center', level: 24 }],
    resources: { iron: '290M', food: '290M', gold: '93M' },
  },
  {
    hq: 26,
    buildings: [{ name: 'Tech Center', level: 25 }, { name: 'Hospital', level: 25 }],
    resources: { iron: '400M', food: '400M', gold: '130M' },
  },
  {
    hq: 27,
    buildings: [{ name: 'Tech Center', level: 26 }, { name: 'Wall', level: 26 }],
    resources: { iron: '530M', food: '530M', gold: '170M' },
  },
  {
    hq: 28,
    buildings: [{ name: 'Tech Center', level: 27 }, { name: 'Barracks', level: 27 }],
    resources: { iron: '740M', food: '740M', gold: '240M' },
  },
  {
    hq: 29,
    buildings: [{ name: 'Tech Center', level: 28 }, { name: 'Tank Center', level: 28 }],
    resources: { iron: '1G', food: '1G', gold: '330M' },
  },
  {
    hq: 30,
    buildings: [{ name: 'Tech Center', level: 29 }, { name: 'Drill Ground', level: 29 }],
    resources: { iron: '1.4G', food: '1.4G', gold: '460M' },
  },
  // HQ 31+ requires Oil — T11 territory
  {
    hq: 31,
    buildings: [
      { name: 'Tech Center', level: 30 }, { name: 'Barracks', level: 30 },
      { name: 'Tank Center', level: 30 }, { name: 'Air Center', level: 30 },
      { name: 'Missile Center', level: 30 },
    ],
    resources: { iron: '1.6G', food: '1.6G', gold: '510M', oil: '1.44M' },
  },
  {
    hq: 32,
    buildings: [
      { name: 'Tech Center', level: 31 }, { name: 'Barracks', level: 31 },
      { name: 'Wall', level: 31 }, { name: 'Tank Center', level: 31 },
      { name: 'Air Center', level: 31 }, { name: 'Missile Center', level: 31 },
    ],
    resources: { iron: '1.7G', food: '1.7G', gold: '560M', oil: '2.3M' },
  },
  {
    hq: 33,
    buildings: [
      { name: 'Tech Center', level: 32 }, { name: 'Barracks', level: 32 },
      { name: 'Tank Center', level: 32 }, { name: 'Air Center', level: 32 },
      { name: 'Missile Center', level: 32 }, { name: 'Drill Ground', level: 32 },
      { name: 'Hospital', level: 32 },
    ],
    resources: { iron: '1.9G', food: '1.9G', gold: '620M', oil: '3.92M' },
  },
  {
    hq: 34,
    buildings: [
      { name: 'Tech Center', level: 33 }, { name: 'Barracks', level: 33 },
      { name: 'Wall', level: 33 }, { name: 'Tank Center', level: 33 },
      { name: 'Air Center', level: 33 }, { name: 'Missile Center', level: 33 },
      { name: 'Alliance Center', level: 33 },
    ],
    resources: { iron: '2G', food: '2G', gold: '650M', oil: '7.05M' },
  },
  {
    hq: 35,
    buildings: [
      { name: 'Tech Center', level: 34 }, { name: 'Tank Center', level: 34 },
      { name: 'Barracks', level: 34 }, { name: 'Hospital', level: 34 },
      { name: 'Drill Ground', level: 34 },
    ],
    resources: { iron: '2G', food: '2G', gold: '650M', oil: '7.05M' },
  },
];

// Helper: get requirements for a specific HQ level
export function getHQRequirements(hqLevel: number): HQRequirement | undefined {
  return HQ_REQUIREMENTS.find(r => r.hq === hqLevel);
}

// Helper: get a plain-English summary for Buddy injection
export function getHQSummary(): string {
  const lines = HQ_REQUIREMENTS.map(r => {
    const buildings = r.buildings.map(b => `${b.name} Lv${b.level}`).join(', ');
    const res = Object.entries(r.resources)
      .map(([k, v]) => `${v} ${k}`)
      .join(' / ');
    return `HQ ${r.hq}: requires ${buildings} | Cost: ${res}`;
  });
  return `## HQ Upgrade Requirements\nSource: dracgon.tech (verified)\nNote: Oil required starting at HQ 31.\n\n${lines.join('\n')}`;
}